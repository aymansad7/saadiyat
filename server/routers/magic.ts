/**
 * Magic-link auth router.
 *
 *   - `request`  (public)    — issue a 6-digit code, deliver via email
 *   - `verify`   (public)    — exchange code for a session cookie
 *   - `logout`   (public)    — revoke the current magic session
 *   - `access.list/add/remove/updateRole` (admin) — manage the allowlist
 */
import type { Request } from "express";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import {
  CODE_TTL_MS,
  MAGIC_SESSION_COOKIE,
  SESSION_TTL_MS,
  createMagicLink,
  findAllowed,
  generateSessionToken,
  isValidEmail,
  normalizeEmail,
  revokeSessionToken,
  verifyMagicCode,
} from "../magicAuth";
import { allowedEmails, magicLinks, users } from "../../drizzle/schema";
import { getDb } from "../db";
import { sendMagicLinkEmail } from "../_core/sendEmail";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getSessionCookieOptions } from "../_core/cookies";

function clientIp(req: Request): string | null {
  const fwd = (req.headers["x-forwarded-for"] as string | undefined)
    ?.split(",")[0]
    ?.trim();
  return fwd || req.socket.remoteAddress || null;
}

function clientUserAgent(req: Request): string | null {
  return String(req.headers["user-agent"] || "") || null;
}

const REQUEST_RATE_PER_HOUR = 6; // per email — enough for retries, blocks abuse

export const magicRouter = router({
  /**
   * Step 1 — user submits their email. We always respond with the same shape
   * regardless of whether the address is on the allowlist; the only signal of
   * a denial is that no code arrives.
   */
  request: publicProcedure
    .input(
      z.object({
        email: z.string().min(3).max(320),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const email = normalizeEmail(input.email);
      if (!isValidEmail(email)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid email address." });
      }
      const allowed = await findAllowed(email);
      const db = await getDb();

      // Rate limit by email so a malicious party can't spam an inbox.
      if (db) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recent = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(magicLinks)
          .where(
            and(
              eq(magicLinks.email, email),
              gte(magicLinks.createdAt, oneHourAgo),
            ),
          );
        if (Number(recent[0]?.count ?? 0) >= REQUEST_RATE_PER_HOUR) {
          // Silent OK — same response shape; we just don't send another mail.
          return {
            ok: true as const,
            expiresInSec: Math.floor(CODE_TTL_MS / 1000),
          };
        }
      }

      if (allowed) {
        const ip = clientIp(ctx.req);
        const ua = clientUserAgent(ctx.req);
        const { code } = await createMagicLink(email, { ip, userAgent: ua });
        try {
          await sendMagicLinkEmail({ to: email, code });
        } catch (err) {
          console.error("[Magic] Email delivery failed", err);
        }
      }
      // Always respond as if we sent the code — defends against email-enumeration.
      return {
        ok: true as const,
        expiresInSec: Math.floor(CODE_TTL_MS / 1000),
      };
    }),

  /**
   * Step 2 — user submits the code. On success we set the session cookie
   * and return the role/email; on failure we emit a generic error.
   */
  verify: publicProcedure
    .input(
      z.object({
        email: z.string().min(3).max(320),
        code: z.string().regex(/^\d{6}$/),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const email = normalizeEmail(input.email);
      if (!isValidEmail(email)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid email address." });
      }
      const ip = clientIp(ctx.req);
      const ua = clientUserAgent(ctx.req);
      const result = await verifyMagicCode(email, input.code, { ip, userAgent: ua });
      if (!result.ok) {
        const messages: Record<typeof result.reason, string> = {
          no_pending: "No pending sign-in for this email. Please request a new code.",
          expired: "Code expired — request a new one.",
          too_many_attempts: "Too many failed attempts. Request a new code.",
          wrong_code: "Incorrect code.",
        };
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: messages[result.reason],
        });
      }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(MAGIC_SESSION_COOKIE, result.sessionToken, {
        ...cookieOptions,
        maxAge: SESSION_TTL_MS,
      });
      return {
        ok: true as const,
        email,
        role: result.role,
        expiresAt: result.expiresAt,
      };
    }),

  /** Revoke the current session and clear the cookie. */
  logout: publicProcedure.mutation(async ({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    const token =
      (ctx.req as any).cookies?.[MAGIC_SESSION_COOKIE] ??
      (() => {
        const header = ctx.req.headers.cookie ?? "";
        for (const part of header.split(";")) {
          const [k, v] = part.trim().split("=");
          if (k === MAGIC_SESSION_COOKIE && v) return decodeURIComponent(v);
        }
        return null;
      })();
    if (typeof token === "string" && token.length > 0) {
      await revokeSessionToken(token);
    }
    ctx.res.clearCookie(MAGIC_SESSION_COOKIE, { ...cookieOptions, maxAge: -1 });
    return { ok: true as const };
  }),

  /* ---------------- admin allowlist CRUD ---------------- */

  access: router({
    /**
     * Returns whether the current caller is a `master`. Used by the admin UI
     * to decide which role-change controls to enable.
     */
    whoami: adminProcedure.query(({ ctx }) => ({
      role: ctx.user.role,
      email: ctx.user.email,
      isMaster: ctx.user.role === "master",
    })),

    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(allowedEmails)
        .orderBy(asc(allowedEmails.email));
      return rows;
    }),

    add: adminProcedure
      .input(
        z.object({
          email: z.string().min(3).max(320),
          role: z.enum(["user", "admin", "master"]).default("user"),
          note: z.string().max(255).optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const email = normalizeEmail(input.email);
        if (!isValidEmail(email)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid email address." });
        }
        // Only `master` callers may grant elevated roles.
        if (
          (input.role === "admin" || input.role === "master") &&
          ctx.user.role !== "master"
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only master users can grant admin or master roles.",
          });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // If the address already exists with an elevated role, only a master
        // is allowed to overwrite it (so a regular admin cannot demote a
        // master via the upsert path).
        const existingRows = await db
          .select()
          .from(allowedEmails)
          .where(eq(allowedEmails.email, email))
          .limit(1);
        const existing = existingRows[0];
        if (
          existing &&
          (existing.role === "admin" || existing.role === "master") &&
          ctx.user.role !== "master"
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only master users can modify admin or master accounts.",
          });
        }
        await db
          .insert(allowedEmails)
          .values({
            email,
            role: input.role,
            note: input.note ?? null,
            addedBy: ctx.user?.email ?? "admin",
          })
          .onDuplicateKeyUpdate({
            set: { role: input.role, note: input.note ?? null },
          });
        const rows = await db
          .select()
          .from(allowedEmails)
          .where(eq(allowedEmails.email, email))
          .limit(1);
        return rows[0]!;
      }),

    remove: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const rows = await db
          .select()
          .from(allowedEmails)
          .where(eq(allowedEmails.id, input.id))
          .limit(1);
        const target = rows[0];
        if (!target) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        // Admins cannot remove other admins or masters; that's a master's job.
        if (
          (target.role === "admin" || target.role === "master") &&
          ctx.user.role !== "master"
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only master users can remove admin or master accounts.",
          });
        }
        await db.delete(allowedEmails).where(eq(allowedEmails.id, input.id));
        return { ok: true as const };
      }),

    updateRole: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          role: z.enum(["user", "admin", "master"]),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const rows = await db
          .select()
          .from(allowedEmails)
          .where(eq(allowedEmails.id, input.id))
          .limit(1);
        const target = rows[0];
        if (!target) throw new TRPCError({ code: "NOT_FOUND" });
        // Promotions/demotions to or from admin/master are master-only.
        const touchesElevated =
          target.role === "admin" ||
          target.role === "master" ||
          input.role === "admin" ||
          input.role === "master";
        if (touchesElevated && ctx.user.role !== "master") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only master users can change admin or master roles.",
          });
        }
        await db
          .update(allowedEmails)
          .set({ role: input.role })
          .where(eq(allowedEmails.id, input.id));
        return { ok: true as const };
      }),
  }),
});

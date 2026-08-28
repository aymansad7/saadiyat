/**
 * Gate router — passcode verification + visitor session tracking + admin
 * controls. The passcode is stored in the `app_settings` table (key
 * `gate_passcode`). Verification, attempt logging, anomaly detection, and
 * automatic rotation all happen server-side; the client never holds the
 * secret.
 */
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import {
  appSettings,
  gateAttempts,
  gateSessions,
  pageHits,
  securityEvents,
} from "../../drizzle/schema";
import type { Request } from "express";
import { getDb } from "../db";
import { notifyOwner } from "../_core/notification";
import { ENV } from "../_core/env";
import { publicProcedure, router } from "../_core/trpc";

const DEFAULT_PASSCODE = "062026";
const COMPROMISE_PASSCODE = "062020";
const ACTIVE_WINDOW_MS = 2 * 60 * 1000; // 2 minutes
const ABUSE_PAGE_HITS_PER_5MIN = 60;
const ABUSE_PAGE_HITS_PER_1MIN = 30;
const ABUSE_FAILED_ATTEMPTS_PER_15MIN = 5;
const RATE_LIMIT_ATTEMPTS_PER_5MIN = 5;

/**
 * Suspicious user-agent fragments. Any visitor whose UA matches one of these
 * (case-insensitive) is treated as an automated agent: it cannot pass the
 * gate and triggers an immediate auto-rotate + owner notification.
 */
const BOT_UA_FRAGMENTS = [
  // Generic agent / scraper signatures
  "bot",
  "crawler",
  "spider",
  "scrap",
  "phantom",
  "slurp",
  // HTTP libs
  "python-requests",
  "python-urllib",
  "curl/",
  "wget",
  "httpx",
  "aiohttp",
  "go-http-client",
  "okhttp",
  "java/",
  "node-fetch",
  "axios/",
  // Browser automation tools
  "playwright",
  "puppeteer",
  "selenium",
  "webdriver",
  "chrome-lighthouse",
  // AI agents
  "openai",
  "gpt-",
  "chatgpt",
  "claude",
  "anthropic",
  "gemini",
  "perplexity",
  "browser-use",
  "agent-",
  "langchain",
  "llm",
];

function isLikelyBotUA(ua: string | null | undefined): string | null {
  if (!ua) return "empty user-agent";
  const lower = ua.toLowerCase();
  for (const frag of BOT_UA_FRAGMENTS) {
    if (lower.includes(frag)) return frag;
  }
  return null;
}

/* ---------- helpers ---------- */

function clientIp(req: Request): string {
  const fwd = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim();
  return fwd || req.socket.remoteAddress || "";
}

function userAgent(req: Request): string {
  return String(req.headers["user-agent"] || "");
}

/** Visitor id is set by the client and propagated via the X-Visitor-Id header. */
function visitorId(req: Request): string | null {
  const v = req.headers["x-visitor-id"];
  if (typeof v === "string" && v.length >= 4 && v.length <= 64) return v;
  return null;
}

async function getPasscode(): Promise<string> {
  const db = await getDb();
  if (!db) return DEFAULT_PASSCODE;
  const rows = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.settingKey, "gate_passcode"))
    .limit(1);
  if (rows.length === 0) {
    await db.insert(appSettings).values({
      settingKey: "gate_passcode",
      settingValue: DEFAULT_PASSCODE,
    });
    return DEFAULT_PASSCODE;
  }
  return rows[0].settingValue;
}

async function setPasscode(value: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(appSettings)
    .values({ settingKey: "gate_passcode", settingValue: value })
    .onDuplicateKeyUpdate({ set: { settingValue: value } });
}

async function logSecurityEvent(opts: {
  eventType: string;
  severity?: "info" | "warning" | "critical";
  visitorId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  summary: string;
  details?: string | null;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(securityEvents).values({
    eventType: opts.eventType,
    severity: opts.severity ?? "info",
    visitorId: opts.visitorId ?? null,
    ip: opts.ip ?? null,
    userAgent: opts.userAgent ?? null,
    summary: opts.summary,
    details: opts.details ?? null,
  });
}

async function rotatePasscode(reason: string, ctx: {
  visitorId: string | null;
  ip: string;
  ua: string;
  trigger: "auto" | "manual";
}) {
  // Auto-rotation DISABLED — passcode stays fixed. Only manual rotation changes it.
  const newPasscode = ctx.trigger === "auto"
    ? (await getPasscode()) // keep current passcode unchanged
    : generateManualPasscode();
  if (ctx.trigger === "manual") {
    await setPasscode(newPasscode);
  }
  await logSecurityEvent({
    eventType: ctx.trigger === "auto" ? "auto_rotate" : "manual_rotate",
    severity: ctx.trigger === "auto" ? "critical" : "info",
    visitorId: ctx.visitorId,
    ip: ctx.ip,
    userAgent: ctx.ua,
    summary:
      ctx.trigger === "auto"
        ? `[BLOCKED] Auto-rotation attempted \u2014 ${reason} (passcode unchanged)`
        : `Passcode rotated to ${newPasscode} by owner`,
    details: reason,
  });
  // Owner notification DISABLED for auto-rotation to stop spam.
  // Only manual rotations notify.
  if (ctx.trigger === "manual") {
    try {
      await notifyOwner({
        title: "Saadiyat \u2014 passcode rotated",
        content:
          `New passcode: ${newPasscode}\n` +
          `Reason: ${reason}\n` +
          (ctx.ip ? `IP: ${ctx.ip}\n` : "") +
          (ctx.ua ? `User-Agent: ${ctx.ua}\n` : "") +
          `Trigger: ${ctx.trigger}`,
      });
    } catch {
      /* notification is best-effort */
    }
  }
  return newPasscode;
}

function generateManualPasscode(): string {
  // Six numeric digits, avoiding leading zero collisions.
  let out = "";
  for (let i = 0; i < 6; i++) out += Math.floor(Math.random() * 10).toString();
  return out;
}

/** Run anomaly detection and rotate if a rule fires. Returns the rotation reason if any. */
async function maybeAutoRotate(reqInfo: {
  visitorId: string | null;
  ip: string;
  ua: string;
}): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const now = Date.now();
  const fifteenMinAgo = new Date(now - 15 * 60 * 1000);
  const fiveMinAgo = new Date(now - 5 * 60 * 1000);

  // Rule 1: failed attempts burst from same IP
  if (reqInfo.ip) {
    const failed = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(gateAttempts)
      .where(
        and(
          eq(gateAttempts.success, false),
          eq(gateAttempts.ip, reqInfo.ip),
          gte(gateAttempts.createdAt, fifteenMinAgo),
        ),
      );
    const c = Number(failed[0]?.count ?? 0);
    if (c >= ABUSE_FAILED_ATTEMPTS_PER_15MIN) {
      const reason = `${c} failed passcode attempts from ${reqInfo.ip} in 15 minutes`;
      await rotatePasscode(reason, { ...reqInfo, trigger: "auto" });
      return reason;
    }
  }

  // Rule 2: page-hit firehose from same IP or visitor (likely a scraper)
  const oneMinAgo = new Date(now - 60 * 1000);
  const visitorClause = reqInfo.visitorId
    ? eq(pageHits.visitorId, reqInfo.visitorId)
    : reqInfo.ip
      ? eq(pageHits.ip, reqInfo.ip)
      : null;
  if (visitorClause) {
    const fiveMin = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(pageHits)
      .where(and(visitorClause, gte(pageHits.createdAt, fiveMinAgo)));
    const cFive = Number(fiveMin[0]?.count ?? 0);
    if (cFive >= ABUSE_PAGE_HITS_PER_5MIN) {
      const reason = `${cFive} page hits from ${reqInfo.ip || reqInfo.visitorId} in 5 minutes (suspected scrape)`;
      await rotatePasscode(reason, { ...reqInfo, trigger: "auto" });
      return reason;
    }
    const oneMin = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(pageHits)
      .where(and(visitorClause, gte(pageHits.createdAt, oneMinAgo)));
    const cOne = Number(oneMin[0]?.count ?? 0);
    if (cOne >= ABUSE_PAGE_HITS_PER_1MIN) {
      const reason = `${cOne} page hits from ${reqInfo.ip || reqInfo.visitorId} in 1 minute (suspected scrape)`;
      await rotatePasscode(reason, { ...reqInfo, trigger: "auto" });
      return reason;
    }
  }

  return null;
}

/* ---------- procedures ---------- */

export const gateRouter = router({
  /** Frontend submits the passcode for verification. */
  verify: publicProcedure
    .input(z.object({ passcode: z.string().min(1).max(32) }))
    .mutation(async ({ input, ctx }) => {
      // This shared passcode endpoint is retired. Existing authenticated
      // OAuth/email-session cookies remain valid, but new access requires an
      // allowlisted email and either its password or OAuth identity.
      void input;
      void ctx;
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Passcode sign-in has been retired. Use your email and password or Google sign-in.",
      });

      /* Legacy passcode implementation retained below solely for historical
       * reference. It is intentionally unreachable and excluded from compile
       * checking while the new allowlisted email flow is active.
       *
      const ip = clientIp(ctx.req);
      const ua = userAgent(ctx.req);
      const vid = visitorId(ctx.req);
      const db = await getDb();

      // 0) Bot/agent UA detection — log only, do NOT block or short-circuit.
      const botMatch = isLikelyBotUA(ua);
      if (botMatch && db) {
        await db.insert(gateAttempts).values({
          success: false,
          visitorId: vid,
          ip,
          userAgent: ua,
          submittedValue: input.passcode.trim().slice(0, 32),
          flagReason: `bot_ua:${botMatch}`,
        });
      }
      // Continue to normal passcode check regardless of bot detection.

      // 1) Per-visitor rate limit on attempts
      if (db && vid) {
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recent = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(gateAttempts)
          .where(
            and(
              eq(gateAttempts.visitorId, vid),
              gte(gateAttempts.createdAt, fiveMinAgo),
            ),
          );
        if (Number(recent[0]?.count ?? 0) >= RATE_LIMIT_ATTEMPTS_PER_5MIN) {
          await db.insert(gateAttempts).values({
            success: false,
            visitorId: vid,
            ip,
            userAgent: ua,
            submittedValue: input.passcode.trim().slice(0, 32),
            flagReason: "rate_limited",
          });
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many attempts. Please wait a few minutes and try again.",
          });
        }
      }

      const expected = await getPasscode();
      const success = input.passcode.trim() === expected;

      if (db) {
        await db.insert(gateAttempts).values({
          success,
          visitorId: vid,
          ip,
          userAgent: ua,
          submittedValue: success ? null : input.passcode.trim().slice(0, 32),
        });
      }

      if (success) {
        // Open / refresh session
        if (db && vid) {
          await db
            .insert(gateSessions)
            .values({
              visitorId: vid,
              ip,
              userAgent: ua,
              pageHits: 0,
            })
            .onDuplicateKeyUpdate({
              set: {
                ip,
                userAgent: ua,
                lastSeenAt: new Date(),
                leftAt: null,
              },
            });
        }
        return { success: true as const };
      }

      // failed attempt — run detector
      const reason = await maybeAutoRotate({ visitorId: vid, ip, ua });
      return {
        success: false as const,
        rotated: reason !== null,
      };
      */
    }),

  /** Returns whether the *caller* itself is treated as a bot — informational. */
  isAgent: publicProcedure.query(({ ctx }) => {
    const ua = userAgent(ctx.req);
    return { agent: isLikelyBotUA(ua) };
  }),

  /** Client heartbeat after unlock — keeps the visitor's session "active". */
  heartbeat: publicProcedure
    .input(z.object({ path: z.string().max(512).optional() }))
    .mutation(async ({ input, ctx }) => {
      const ip = clientIp(ctx.req);
      const ua = userAgent(ctx.req);
      const vid = visitorId(ctx.req);
      // Bot UA short-circuit: never accept heartbeats from automated agents.
      const botMatch = isLikelyBotUA(ua);
      if (botMatch) {
        const reason = `Blocked automated agent during heartbeat (UA fragment: ${botMatch}) from ${ip || "unknown IP"}`;
        await rotatePasscode(reason, { visitorId: vid, ip, ua, trigger: "auto" });
        return { ok: false as const, blocked: true };
      }
      if (!vid) return { ok: false as const };
      const db = await getDb();
      if (!db) return { ok: false as const };

      // Upsert session
      await db
        .insert(gateSessions)
        .values({
          visitorId: vid,
          ip,
          userAgent: ua,
          pageHits: input.path ? 1 : 0,
        })
        .onDuplicateKeyUpdate({
          set: {
            ip,
            userAgent: ua,
            lastSeenAt: new Date(),
            leftAt: null,
            ...(input.path
              ? { pageHits: sql`${gateSessions.pageHits} + 1` }
              : {}),
          },
        });

      // Page hit
      if (input.path) {
        await db.insert(pageHits).values({
          visitorId: vid,
          ip,
          path: input.path.slice(0, 512),
        });
        await maybeAutoRotate({ visitorId: vid, ip, ua });
      }

      return { ok: true as const };
    }),

  /** Soft-leave on tab close (best-effort beacon). */
  leave: publicProcedure.mutation(async ({ ctx }) => {
    const vid = visitorId(ctx.req);
    if (!vid) return { ok: false as const };
    const db = await getDb();
    if (!db) return { ok: false as const };
    await db
      .update(gateSessions)
      .set({ leftAt: new Date() })
      .where(eq(gateSessions.visitorId, vid));
    return { ok: true as const };
  }),

  /* --------------- ADMIN --------------- */

  /**
   * Admin overview \u2014 only the configured project owner can see this.
   * We deliberately do NOT use `adminProcedure` because the gate exists in
   * front of OAuth; instead we authenticate via Manus OAuth ctx.user and
   * compare against ENV.ownerOpenId.
   */
  adminOverview: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user || ctx.user.openId !== ENV.ownerOpenId) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await getDb();
    if (!db)
      return {
        passcode: DEFAULT_PASSCODE,
        attempts: [],
        sessions: [],
        events: [],
        recentHits: [],
        stats: { successCount: 0, failCount: 0, activeNow: 0, total24h: 0 },
      };

    const passcode = await getPasscode();
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeWindow = new Date(Date.now() - ACTIVE_WINDOW_MS);

    const [attempts, sessions, events, recentHits] = await Promise.all([
      db
        .select()
        .from(gateAttempts)
        .orderBy(desc(gateAttempts.createdAt))
        .limit(100),
      db
        .select()
        .from(gateSessions)
        .orderBy(desc(gateSessions.lastSeenAt))
        .limit(50),
      db
        .select()
        .from(securityEvents)
        .orderBy(desc(securityEvents.createdAt))
        .limit(50),
      db
        .select()
        .from(pageHits)
        .orderBy(desc(pageHits.createdAt))
        .limit(100),
    ]);

    const total24h = attempts.filter(a => a.createdAt >= since24h).length;
    const successCount = attempts.filter(a => a.success).length;
    const failCount = attempts.filter(a => !a.success).length;
    const activeNow = sessions.filter(
      s => s.lastSeenAt >= activeWindow && !s.leftAt,
    ).length;

    return {
      passcode,
      attempts,
      sessions,
      events,
      recentHits,
      stats: { successCount, failCount, activeNow, total24h },
    };
  }),

  rotatePasscode: publicProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user || ctx.user.openId !== ENV.ownerOpenId) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const ip = clientIp(ctx.req);
    const ua = userAgent(ctx.req);
    const vid = visitorId(ctx.req);
    const newPasscode = await rotatePasscode("Manual rotation by owner from /admin", {
      visitorId: vid,
      ip,
      ua,
      trigger: "manual",
    });
    return { passcode: newPasscode };
  }),

  setPasscode: publicProcedure
    .input(z.object({ passcode: z.string().min(4).max(32) }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.openId !== ENV.ownerOpenId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await setPasscode(input.passcode);
      const ip = clientIp(ctx.req);
      const ua = userAgent(ctx.req);
      const vid = visitorId(ctx.req);
      await logSecurityEvent({
        eventType: "manual_set",
        severity: "info",
        visitorId: vid,
        ip,
        userAgent: ua,
        summary: `Owner set passcode to ${input.passcode}`,
      });
      return { ok: true as const, passcode: input.passcode };
    }),
});

/* Exposed for tests */
export const _internals = {
  ABUSE_FAILED_ATTEMPTS_PER_15MIN,
  ABUSE_PAGE_HITS_PER_5MIN,
  ABUSE_PAGE_HITS_PER_1MIN,
  RATE_LIMIT_ATTEMPTS_PER_5MIN,
  COMPROMISE_PASSCODE,
  DEFAULT_PASSCODE,
  BOT_UA_FRAGMENTS,
  isLikelyBotUA,
};

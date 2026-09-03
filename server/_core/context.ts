import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { findUserBySessionToken, findAllowed, MAGIC_SESSION_COOKIE } from "../magicAuth";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getSessionCookieOptions } from "./cookies";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function readMagicCookie(req: CreateExpressContextOptions["req"]): string | null {
  // Express may have already parsed cookies — fall back to manual parse.
  const fromParser = (req as any).cookies?.[MAGIC_SESSION_COOKIE];
  if (typeof fromParser === "string" && fromParser.length > 0) return fromParser;
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, v] = part.trim().split("=");
    if (k === MAGIC_SESSION_COOKIE && v) return decodeURIComponent(v);
  }
  return null;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Magic-link session takes precedence — it is our preferred auth mode.
  const magicToken = readMagicCookie(opts.req);
  if (magicToken) {
    try {
      const magicUser = await findUserBySessionToken(magicToken);
      if (magicUser) {
        const db = await getDb();
        if (db) {
          const rows = await db
            .select()
            .from(users)
            .where(eq(users.openId, magicUser.openId))
            .limit(1);
          if (rows[0]) {
            // Override role from the authoritative allowed_emails table
            user = { ...rows[0], role: magicUser.role };
            if (magicUser.wasRenewed) {
              const remainingMs = Math.max(0, magicUser.expiresAt.getTime() - Date.now());
              opts.res.cookie(MAGIC_SESSION_COOKIE, magicToken, {
                ...getSessionCookieOptions(opts.req),
                maxAge: remainingMs,
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn("[Auth] Magic-link lookup failed", String(err));
    }
  }

  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
      // For OAuth sessions, also check allowed_emails for the authoritative role
      if (user?.email) {
        const allowed = await findAllowed(user.email);
        if (allowed) {
          user = { ...user, role: allowed.role };
        } else {
          // OAuth authenticates identity, while the email allowlist authorizes
          // access to this restricted workspace.
          user = null;
        }
      }
    } catch {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

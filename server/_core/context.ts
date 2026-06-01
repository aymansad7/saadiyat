import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { findUserBySessionToken, MAGIC_SESSION_COOKIE } from "../magicAuth";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { sdk } from "./sdk";

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
          if (rows[0]) user = rows[0];
        }
      }
    } catch (err) {
      console.warn("[Auth] Magic-link lookup failed", String(err));
    }
  }

  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
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

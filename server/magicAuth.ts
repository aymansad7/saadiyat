/**
 * Magic-link auth helpers.
 *
 * Workflow:
 *   1. User submits an email at the gate.
 *   2. We check `allowed_emails` — must exist (otherwise reject).
 *   3. We generate a 6-digit code, hash it, store the hash in `magic_links`
 *      with a 10-minute TTL, and email the code to the user.
 *   4. User submits the code; we look up the most recent unconsumed row for
 *      that email, compare the hash, mark consumed, and mint a long-lived
 *      `auth_sessions` token (90 days).
 *   5. The session token is set as an HttpOnly cookie (`magic_session_token`)
 *      that the tRPC context resolver looks up to populate `ctx.user`.
 *
 * All hashing is SHA-256. Codes are zero-padded 6 digits. We rely on TLS for
 * delivery + 10-minute expiry + 5-attempt cap to prevent online brute force.
 */
import {
  createHash,
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import {
  allowedEmails,
  authSessions,
  magicLinks,
  users,
  type AllowedEmail,
} from "../drizzle/schema";
import { getDb } from "./db";

export const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
export const SESSION_RENEWAL_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // final 30 days
export const MAX_VERIFY_ATTEMPTS = 5;
export const MAGIC_SESSION_COOKIE = "magic_session_token";
export const PASSWORD_MAX_ATTEMPTS = 5;
export const PASSWORD_LOCKOUT_MS = 15 * 60 * 1000;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320;
}

export function generateCode(): string {
  // 6-digit zero-padded numeric code, uniformly distributed via crypto.randomInt.
  const n = randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
}

export function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

/** Store only a salted scrypt password hash; never persist raw passwords. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(password, salt, 64, { N: 16_384 }).toString("hex");
  return `scrypt$${salt}$${digest}`;
}

/** Constant-time comparison for an encoded hash created by `hashPassword`. */
export function verifyPasswordHash(password: string, encoded: string | null): boolean {
  if (!encoded) return false;
  const [algorithm, salt, storedDigest] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !storedDigest) return false;
  try {
    const candidate = scryptSync(password, salt, 64, { N: 16_384 });
    const expected = Buffer.from(storedDigest, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

export function generateSessionToken(): string {
  // 32 random bytes hex-encoded → 64 chars; well under the 128-char column.
  return randomBytes(32).toString("hex");
}

/**
 * Keep an actively used device signed in without making sessions perpetual.
 * We refresh only during the final 30 days of a valid 90-day session. A
 * revoked or expired session is never revived by this check.
 */
export function shouldRenewSession(expiresAt: Date, now = new Date()): boolean {
  const remainingMs = expiresAt.getTime() - now.getTime();
  return remainingMs > 0 && remainingMs <= SESSION_RENEWAL_WINDOW_MS;
}

/* ---------------- allowlist ---------------- */

/** Returns the row when the email is on the allowlist, else `null`. */
export async function findAllowed(email: string): Promise<AllowedEmail | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(allowedEmails)
    .where(eq(allowedEmails.email, normalizeEmail(email)))
    .limit(1);
  return rows[0] ?? null;
}

/* ---------------- request flow ---------------- */

export async function createMagicLink(
  email: string,
  meta: { ip?: string | null; userAgent?: string | null },
): Promise<{ code: string; expiresAt: Date }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const code = generateCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);
  await db.insert(magicLinks).values({
    email: normalizeEmail(email),
    codeHash,
    expiresAt,
    requestIp: meta.ip ?? null,
    requestUserAgent: meta.userAgent ?? null,
  });
  return { code, expiresAt };
}

/* ---------------- verify flow ---------------- */

export type VerifyResult =
  | { ok: true; sessionToken: string; expiresAt: Date; role: AllowedEmail["role"] }
  | { ok: false; reason: "no_pending" | "expired" | "too_many_attempts" | "wrong_code" };

export async function verifyMagicCode(
  email: string,
  code: string,
  meta: { ip?: string | null; userAgent?: string | null },
): Promise<VerifyResult> {
  const db = await getDb();
  if (!db) return { ok: false, reason: "no_pending" };
  const normalized = normalizeEmail(email);
  const now = new Date();

  // Find the latest unconsumed link for this email.
  const rows = await db
    .select()
    .from(magicLinks)
    .where(
      and(
        eq(magicLinks.email, normalized),
        isNull(magicLinks.consumedAt),
        gt(magicLinks.expiresAt, now),
      ),
    )
    .orderBy(desc(magicLinks.createdAt))
    .limit(1);
  const link = rows[0];
  if (!link) return { ok: false, reason: "no_pending" };
  if (link.failedAttempts >= MAX_VERIFY_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts" };
  }

  const submittedHash = hashCode(code.trim());
  if (submittedHash !== link.codeHash) {
    await db
      .update(magicLinks)
      .set({ failedAttempts: sql`${magicLinks.failedAttempts} + 1` })
      .where(eq(magicLinks.id, link.id));
    return { ok: false, reason: "wrong_code" };
  }

  // Success — consume the row, find the allowlist entry for the role, mint a
  // session, and stamp lastSeenAt on the allowlist.
  await db
    .update(magicLinks)
    .set({ consumedAt: now })
    .where(eq(magicLinks.id, link.id));

  const allowed = await findAllowed(normalized);
  if (!allowed) {
    // Allowlist removed between request and verify.
    return { ok: false, reason: "no_pending" };
  }
  await db
    .update(allowedEmails)
    .set({ lastSeenAt: now })
    .where(eq(allowedEmails.id, allowed.id));

  const sessionToken = generateSessionToken();
  const sessionExpiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(authSessions).values({
    token: sessionToken,
    email: normalized,
    expiresAt: sessionExpiresAt,
    ip: meta.ip ?? null,
    userAgent: meta.userAgent ?? null,
  });

  // Ensure a `users` row exists so existing role-aware procedures keep working.
  await db
    .insert(users)
    .values({
      openId: `magic:${normalized}`,
      email: normalized,
      name: allowed.email,
      loginMethod: "magic-link",
      role: allowed.role,
      lastSignedIn: now,
    })
    .onDuplicateKeyUpdate({
      set: {
        email: normalized,
        loginMethod: "magic-link",
        role: allowed.role,
        lastSignedIn: now,
      },
    });

  return {
    ok: true,
    sessionToken,
    expiresAt: sessionExpiresAt,
    role: allowed.role,
  };
}

/** Verify an allowlisted email/password and mint a standard long-lived session. */
export async function verifyEmailPassword(
  email: string,
  password: string,
  meta: { ip?: string | null; userAgent?: string | null },
): Promise<
  | { ok: true; sessionToken: string; expiresAt: Date; role: AllowedEmail["role"] }
  | { ok: false; reason: "invalid_credentials" | "locked" }
> {
  const db = await getDb();
  if (!db) return { ok: false, reason: "invalid_credentials" };
  const normalized = normalizeEmail(email);
  const allowed = await findAllowed(normalized);
  const now = new Date();
  if (!allowed || !allowed.passwordHash) {
    return { ok: false, reason: "invalid_credentials" };
  }
  if (allowed.passwordLockedUntil && allowed.passwordLockedUntil > now) {
    return { ok: false, reason: "locked" };
  }
  if (!verifyPasswordHash(password, allowed.passwordHash)) {
    const failedAttempts = allowed.passwordFailedAttempts + 1;
    const lockedUntil =
      failedAttempts >= PASSWORD_MAX_ATTEMPTS
        ? new Date(now.getTime() + PASSWORD_LOCKOUT_MS)
        : null;
    await db
      .update(allowedEmails)
      .set({ passwordFailedAttempts: failedAttempts, passwordLockedUntil: lockedUntil })
      .where(eq(allowedEmails.id, allowed.id));
    return { ok: false, reason: lockedUntil ? "locked" : "invalid_credentials" };
  }

  await db
    .update(allowedEmails)
    .set({ passwordFailedAttempts: 0, passwordLockedUntil: null, lastSeenAt: now })
    .where(eq(allowedEmails.id, allowed.id));
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(authSessions).values({
    token: sessionToken,
    email: normalized,
    expiresAt,
    ip: meta.ip ?? null,
    userAgent: meta.userAgent ?? null,
  });
  await db
    .insert(users)
    .values({
      openId: `magic:${normalized}`,
      email: normalized,
      name: allowed.email,
      loginMethod: "email-password",
      role: allowed.role,
      lastSignedIn: now,
    })
    .onDuplicateKeyUpdate({
      set: {
        email: normalized,
        loginMethod: "email-password",
        role: allowed.role,
        lastSignedIn: now,
      },
    });
  return { ok: true, sessionToken, expiresAt, role: allowed.role };
}

/* ---------------- session lookup ---------------- */

export async function findUserBySessionToken(token: string): Promise<{
  email: string;
  role: AllowedEmail["role"];
  name: string | null;
  openId: string;
  expiresAt: Date;
  wasRenewed: boolean;
} | null> {
  const db = await getDb();
  if (!db) return null;
  const now = new Date();
  const rows = await db
    .select()
    .from(authSessions)
    .where(
      and(
        eq(authSessions.token, token),
        isNull(authSessions.revokedAt),
        gt(authSessions.expiresAt, now),
      ),
    )
    .limit(1);
  const sess = rows[0];
  if (!sess) return null;

  const wasRenewed = shouldRenewSession(sess.expiresAt, now);
  const expiresAt = wasRenewed ? new Date(now.getTime() + SESSION_TTL_MS) : sess.expiresAt;
  if (wasRenewed) {
    // Await the renewal so the returned cookie is never longer-lived than the
    // server-side session record that authorizes it.
    await db
      .update(authSessions)
      .set({ lastUsedAt: now, expiresAt })
      .where(eq(authSessions.id, sess.id));
  } else {
    // Update last-used metadata without slowing normal authentication requests.
    void db
      .update(authSessions)
      .set({ lastUsedAt: now })
      .where(eq(authSessions.id, sess.id));
  }

  const allowed = await findAllowed(sess.email);
  if (!allowed) {
    // Email was removed from the allowlist — revoke this session.
    await db
      .update(authSessions)
      .set({ revokedAt: now })
      .where(eq(authSessions.id, sess.id));
    return null;
  }

  return {
    email: sess.email,
    role: allowed.role,
    name: allowed.email,
    openId: `magic:${sess.email}`,
    expiresAt,
    wasRenewed,
  };
}

export async function revokeSessionToken(token: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(authSessions)
    .set({ revokedAt: new Date() })
    .where(eq(authSessions.token, token));
}

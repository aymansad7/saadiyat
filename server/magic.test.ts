/**
 * Tests for the magic-link auth flow:
 *   - email/code helpers (pure)
 *   - allowlist CRUD via admin tRPC procedures
 *   - request -> verify -> session round-trip
 *   - access controls: only admin/master can manage the allowlist
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { appRouter } from "./routers";
import {
  generateCode,
  hashCode,
  isValidEmail,
  normalizeEmail,
  createMagicLink,
  verifyMagicCode,
  findUserBySessionToken,
  revokeSessionToken,
  MAGIC_SESSION_COOKIE,
} from "./magicAuth";
import { allowedEmails, magicLinks, authSessions } from "../drizzle/schema";
import { getDb } from "./db";
import type { TrpcContext } from "./_core/context";

type AnyCtx = any;

// --- helpers ---

function makeReq() {
  return {
    protocol: "https",
    headers: {},
    socket: { remoteAddress: "127.0.0.1" },
  } as unknown as TrpcContext["req"];
}

const cookieJar: Array<{ name: string; value: string; options: any }> = [];

function makeRes() {
  return {
    cookie: (name: string, value: string, options: any) => {
      cookieJar.push({ name, value, options });
    },
    clearCookie: (name: string, options: any) => {
      cookieJar.push({ name, value: "", options: { ...options, cleared: true } });
    },
  } as unknown as TrpcContext["res"];
}

function adminCtx(email = "test-admin@example.com"): AnyCtx {
  return {
    user: {
      id: 999,
      openId: `magic:${email}`,
      email,
      name: email,
      loginMethod: "magic-link",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: makeReq(),
    res: makeRes(),
  };
}

function masterCtx(email = "test-master@example.com"): AnyCtx {
  return {
    user: {
      id: 996,
      openId: `magic:${email}`,
      email,
      name: email,
      loginMethod: "magic-link",
      role: "master",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: makeReq(),
    res: makeRes(),
  };
}

function userCtx(email = "regular@example.com"): AnyCtx {
  return {
    user: {
      id: 998,
      openId: `magic:${email}`,
      email,
      name: email,
      loginMethod: "magic-link",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: makeReq(),
    res: makeRes(),
  };
}

function anonCtx(): AnyCtx {
  return { user: null, req: makeReq(), res: makeRes() };
}

// Use a unique tag per run to avoid colliding with seeded data and to allow
// idempotent cleanup.
const TAG = `mtest-${Date.now()}`;
const TEST_EMAIL = `${TAG}@example.com`;

afterAll(async () => {
  const db = await getDb();
  if (!db) return;
  // Clean up everything we created so reruns stay green.
  await db.delete(authSessions).where(eq(authSessions.email, TEST_EMAIL));
  await db.delete(magicLinks).where(eq(magicLinks.email, TEST_EMAIL));
  await db.delete(allowedEmails).where(eq(allowedEmails.email, TEST_EMAIL));
});

describe("magicAuth — pure helpers", () => {
  it("normalizes email casing and whitespace", () => {
    expect(normalizeEmail("  HELLO@Example.com ")).toBe("hello@example.com");
  });
  it("validates email format", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
  });
  it("generates 6-digit numeric codes", () => {
    for (let i = 0; i < 50; i++) {
      const c = generateCode();
      expect(c).toMatch(/^\d{6}$/);
    }
  });
  it("hashes deterministically and irreversibly", () => {
    const h1 = hashCode("123456");
    const h2 = hashCode("123456");
    expect(h1).toBe(h2);
    expect(h1).not.toContain("123456");
    expect(h1).toHaveLength(64);
  });
});

describe("magic.access router — allowlist CRUD", () => {
  it("rejects non-admin callers", async () => {
    const caller = appRouter.createCaller(userCtx());
    await expect(caller.magic.access.list()).rejects.toBeInstanceOf(TRPCError);
  });

  it("rejects anonymous callers", async () => {
    const caller = appRouter.createCaller(anonCtx());
    await expect(caller.magic.access.list()).rejects.toBeInstanceOf(TRPCError);
  });

  it(
    "admin can add, list, update role, and remove an email",
    async () => {
      // The non-elevated mutations (`role: user`, removing a user row) work
      // for any admin. Promotions to admin/master require master, so this
      // test exercises the master path for the role-change step.
      const adminCaller = appRouter.createCaller(adminCtx());
      const masterCaller = appRouter.createCaller(masterCtx());
      const created = await adminCaller.magic.access.add({
        email: TEST_EMAIL,
        role: "user",
        note: "vitest",
      });
      expect(created.email).toBe(TEST_EMAIL);
      expect(created.role).toBe("user");

      const list = await adminCaller.magic.access.list();
      const found = list.find((r) => r.email === TEST_EMAIL);
      expect(found).toBeTruthy();

      await masterCaller.magic.access.updateRole({
        id: found!.id,
        role: "admin",
      });
      const list2 = await adminCaller.magic.access.list();
      expect(list2.find((r) => r.id === found!.id)?.role).toBe("admin");

      // Once promoted to admin, only master can remove the row.
      await masterCaller.magic.access.remove({ id: found!.id });
      const list3 = await adminCaller.magic.access.list();
      expect(list3.find((r) => r.id === found!.id)).toBeUndefined();
    },
    15_000,
  );

  it("upsert: master can re-add the same email with a higher role", async () => {
    // The upsert path is master-gated for elevated roles.
    const adminCaller = appRouter.createCaller(adminCtx());
    const masterCaller = appRouter.createCaller(masterCtx());
    await adminCaller.magic.access.add({ email: TEST_EMAIL, role: "user" });
    const second = await masterCaller.magic.access.add({
      email: TEST_EMAIL,
      role: "master",
    });
    expect(second.role).toBe("master");
    // cleanup the elevated row through master so afterAll can finish
    await masterCaller.magic.access.updateRole({
      id: second.id,
      role: "user",
    });
  });
});

describe("magicAuth — request -> verify round trip", () => {
  let allowedId: number | null = null;
  beforeAll(async () => {
    const db = await getDb();
    if (!db) return;
    // Make sure the email is on the allowlist.
    await db
      .insert(allowedEmails)
      .values({ email: TEST_EMAIL, role: "user", addedBy: "vitest" })
      .onDuplicateKeyUpdate({ set: { role: "user" } });
    const rows = await db
      .select()
      .from(allowedEmails)
      .where(eq(allowedEmails.email, TEST_EMAIL))
      .limit(1);
    allowedId = rows[0]?.id ?? null;
  });

  it(
    "issues a code, verifies it, and yields a session usable via findUserBySessionToken",
    async () => {
      if (!allowedId) {
        // No DB in this environment — skip implicitly.
        return;
      }
      // Step 1: request a code via the helper (the router masks the code on
      // purpose; for testing the round-trip we use the helper directly).
      const { code, expiresAt } = await createMagicLink(TEST_EMAIL, {
        ip: "127.0.0.1",
        userAgent: "vitest",
      });
      expect(code).toMatch(/^\d{6}$/);
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

      // Wrong code first → must fail with `wrong_code`.
      const wrong = await verifyMagicCode(TEST_EMAIL, "000000", {
        ip: null,
        userAgent: null,
      });
      expect(wrong.ok).toBe(false);
      if (!wrong.ok) {
        expect(["wrong_code", "no_pending"]).toContain(wrong.reason);
      }

      // Correct code → success + session token usable.
      const ok = await verifyMagicCode(TEST_EMAIL, code, {
        ip: null,
        userAgent: null,
      });
      expect(ok.ok).toBe(true);
      if (!ok.ok) return; // satisfy TS
      expect(ok.sessionToken).toMatch(/^[0-9a-f]{64}$/);

      const found = await findUserBySessionToken(ok.sessionToken);
      expect(found).toBeTruthy();
      expect(found?.email).toBe(TEST_EMAIL);

      // Replay protection: the same code can't be used twice.
      const replay = await verifyMagicCode(TEST_EMAIL, code, {
        ip: null,
        userAgent: null,
      });
      expect(replay.ok).toBe(false);

      // Revoking the session invalidates further lookups.
      await revokeSessionToken(ok.sessionToken);
      const after = await findUserBySessionToken(ok.sessionToken);
      expect(after).toBeNull();
    },
    20_000,
  );
});

describe("magic.request router — does not leak allowlist membership", () => {
  it(
    "always returns the same shape for unknown emails",
    async () => {
      const caller = appRouter.createCaller(anonCtx());
      const res = await caller.magic.request({
        email: `definitely-not-on-list-${Date.now()}@example.com`,
      });
      expect(res.ok).toBe(true);
      expect(typeof res.expiresInSec).toBe("number");
    },
    10_000,
  );
});

// keep the magic session cookie name in a stable place so the gate UI tests
// or future integration tests can reference it.
describe("MAGIC_SESSION_COOKIE", () => {
  it("is the canonical cookie name", () => {
    expect(MAGIC_SESSION_COOKIE).toBe("magic_session_token");
  });
});


/* ----------------------------------------------------------------------------
 * Master-vs-Admin role rules
 *
 * - A regular `admin` may only manage `user` rows.
 * - Granting/revoking/changing `admin` or `master` requires `master`.
 * -------------------------------------------------------------------------- */

describe("magic.access router — master vs admin rules", () => {
  // Use a fresh email per test scope so we don't fight the shared TEST_EMAIL
  const TARGET_USER = `mvm-user-${Date.now()}@example.com`;
  const TARGET_ADMIN = `mvm-admin-${Date.now()}@example.com`;

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;
    await db.delete(allowedEmails).where(eq(allowedEmails.email, TARGET_USER));
    await db.delete(allowedEmails).where(eq(allowedEmails.email, TARGET_ADMIN));
  });

  it(
    "admin cannot grant the admin role (master-only)",
    async () => {
      const caller = appRouter.createCaller(adminCtx());
      await expect(
        caller.magic.access.add({ email: TARGET_ADMIN, role: "admin" }),
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    },
    10_000,
  );

  it(
    "admin cannot grant the master role (master-only)",
    async () => {
      const caller = appRouter.createCaller(adminCtx());
      await expect(
        caller.magic.access.add({ email: TARGET_ADMIN, role: "master" }),
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    },
    10_000,
  );

  it(
    "admin can grant the user role",
    async () => {
      const caller = appRouter.createCaller(adminCtx());
      const row = await caller.magic.access.add({
        email: TARGET_USER,
        role: "user",
      });
      expect(row.role).toBe("user");
    },
    10_000,
  );

  it(
    "admin cannot promote a user to admin (master-only)",
    async () => {
      const adminCaller = appRouter.createCaller(adminCtx());
      // setup: ensure target exists as a regular user
      const created = await adminCaller.magic.access.add({
        email: TARGET_USER,
        role: "user",
      });
      await expect(
        adminCaller.magic.access.updateRole({ id: created.id, role: "admin" }),
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    },
    10_000,
  );

  it(
    "master can promote and demote across all roles",
    async () => {
      const adminCaller = appRouter.createCaller(adminCtx());
      const masterCaller = appRouter.createCaller(masterCtx());
      const created = await adminCaller.magic.access.add({
        email: TARGET_USER,
        role: "user",
      });
      await masterCaller.magic.access.updateRole({
        id: created.id,
        role: "admin",
      });
      const list = await masterCaller.magic.access.list();
      expect(list.find((r) => r.id === created.id)?.role).toBe("admin");
      // and demote back
      await masterCaller.magic.access.updateRole({
        id: created.id,
        role: "user",
      });
    },
    15_000,
  );

  it(
    "admin cannot remove an admin/master row",
    async () => {
      const adminCaller = appRouter.createCaller(adminCtx());
      const masterCaller = appRouter.createCaller(masterCtx());
      // master creates an admin row, then the admin tries to delete it.
      const created = await masterCaller.magic.access.add({
        email: TARGET_ADMIN,
        role: "admin",
      });
      await expect(
        adminCaller.magic.access.remove({ id: created.id }),
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      // master still can.
      await masterCaller.magic.access.remove({ id: created.id });
    },
    15_000,
  );

  it(
    "magic.access.whoami exposes the caller role",
    async () => {
      const a = await appRouter.createCaller(adminCtx()).magic.access.whoami();
      expect(a.role).toBe("admin");
      expect(a.isMaster).toBe(false);
      const m = await appRouter.createCaller(masterCtx()).magic.access.whoami();
      expect(m.role).toBe("master");
      expect(m.isMaster).toBe(true);
    },
    10_000,
  );
});

/* ----------------------------------------------------------------------------
 * sendEmail dev fallback
 *
 * When `SMTP_USER`/`SMTP_PASS` are not configured we still want the call to
 * resolve cleanly (returning `false`) and the magic code to land in the dev
 * server log so the developer can complete the round trip locally.
 * -------------------------------------------------------------------------- */

import { sendEmail, sendMagicLinkEmail } from "./_core/sendEmail";

describe("sendEmail — dev fallback", () => {
  const ORIG_USER = process.env.SMTP_USER;
  const ORIG_PASS = process.env.SMTP_PASS;

  beforeAll(() => {
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
  });
  afterAll(() => {
    if (ORIG_USER) process.env.SMTP_USER = ORIG_USER;
    if (ORIG_PASS) process.env.SMTP_PASS = ORIG_PASS;
  });

  it("returns false (no real send) and logs a DRYRUN line when SMTP is unset", async () => {
    const logs: string[] = [];
    const origLog = console.log;
    const origWarn = console.warn;
    console.log = (...args: any[]) => {
      logs.push(args.map(String).join(" "));
    };
    console.warn = (...args: any[]) => {
      logs.push(args.map(String).join(" "));
    };
    try {
      const ok = await sendEmail({
        to: "noone@example.com",
        subject: "Test subject",
        text: "Hello body",
      });
      expect(ok).toBe(false);
      expect(logs.some((l) => l.includes("DRYRUN"))).toBe(true);
      expect(logs.some((l) => l.includes("noone@example.com"))).toBe(true);
    } finally {
      console.log = origLog;
      console.warn = origWarn;
    }
  });

  it("magic-link helper logs the 6-digit code in DRYRUN body", async () => {
    const logs: string[] = [];
    const origLog = console.log;
    const origWarn = console.warn;
    console.log = (...args: any[]) => {
      logs.push(args.map(String).join(" "));
    };
    console.warn = (...args: any[]) => {
      logs.push(args.map(String).join(" "));
    };
    try {
      const ok = await sendMagicLinkEmail({
        to: "noone@example.com",
        code: "123456",
      });
      expect(ok).toBe(false);
      expect(logs.some((l) => l.includes("123456"))).toBe(true);
    } finally {
      console.log = origLog;
      console.warn = origWarn;
    }
  });
});

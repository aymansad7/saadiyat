/**
 * Tests for the gate router. We exercise the procedure logic with a mocked
 * database so we can assert behaviour without network/DB dependencies:
 *  - verify success/failure logs an attempt
 *  - failed-burst rule rotates the passcode to 062020 + notifies owner
 *  - heartbeat with a path increments page hits and may trigger rotation
 *  - admin procedures are forbidden for non-owners and work for the owner
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

// We have to mock the heavy deps before importing the router.
const dbState = {
  passcode: "062026",
  attempts: [] as Array<{
    success: boolean;
    visitorId: string | null;
    ip: string | null;
    userAgent: string | null;
    submittedValue: string | null;
    flagReason: string | null;
    createdAt: Date;
  }>,
  pageHits: [] as Array<{
    visitorId: string | null;
    ip: string | null;
    path: string;
    createdAt: Date;
  }>,
  sessions: new Map<
    string,
    {
      id: number;
      visitorId: string;
      ip: string | null;
      userAgent: string | null;
      pageHits: number;
      firstSeenAt: Date;
      lastSeenAt: Date;
      leftAt: Date | null;
    }
  >(),
  events: [] as Array<{
    eventType: string;
    severity: string;
    summary: string;
    createdAt: Date;
  }>,
  rotations: [] as string[],
};

vi.mock("../drizzle/schema", () => ({
  appSettings: { settingKey: "settingKey", settingValue: "settingValue" },
  gateAttempts: { ip: "ip", success: "success", createdAt: "createdAt", visitorId: "visitorId" },
  gateSessions: { visitorId: "visitorId", lastSeenAt: "lastSeenAt", pageHits: "pageHits" },
  pageHits: { visitorId: "visitorId", ip: "ip", createdAt: "createdAt", path: "path" },
  securityEvents: { createdAt: "createdAt" },
}));

vi.mock("drizzle-orm", () => {
  const sql = (..._args: unknown[]) => ({ __op: "sql" });
  return {
    and: (...args: unknown[]) => ({ __op: "and", args }),
    desc: (col: unknown) => ({ __op: "desc", col }),
    eq: (col: unknown, value: unknown) => ({ __op: "eq", col, value }),
    gte: (col: unknown, value: unknown) => ({ __op: "gte", col, value }),
    sql,
  };
});

vi.mock("./db", () => {
  const insertAppSetting = (value: string) => {
    dbState.passcode = value;
  };

  const insert = (table: unknown) => {
    return {
      values: (vals: Record<string, unknown> | Record<string, unknown>[]) => {
        const rows = Array.isArray(vals) ? vals : [vals];
        for (const v of rows) {
          if ((table as { settingKey?: string }).settingKey) {
            if (v.settingKey === "gate_passcode") {
              insertAppSetting(String(v.settingValue));
            }
          } else if ((table as { success?: string }).success) {
            dbState.attempts.push({
              success: !!v.success,
              visitorId: (v.visitorId as string) ?? null,
              ip: (v.ip as string) ?? null,
              userAgent: (v.userAgent as string) ?? null,
              submittedValue: (v.submittedValue as string) ?? null,
              flagReason: (v.flagReason as string) ?? null,
              createdAt: new Date(),
            });
          } else if ((table as { pageHits?: string }).pageHits === "pageHits" && v.visitorId !== undefined) {
            const sid = String(v.visitorId);
            const existing = dbState.sessions.get(sid);
            if (existing) {
              existing.lastSeenAt = new Date();
              existing.leftAt = null;
              if (v.pageHits) existing.pageHits += Number(v.pageHits);
            } else {
              dbState.sessions.set(sid, {
                id: dbState.sessions.size + 1,
                visitorId: sid,
                ip: (v.ip as string) ?? null,
                userAgent: (v.userAgent as string) ?? null,
                pageHits: Number(v.pageHits ?? 0),
                firstSeenAt: new Date(),
                lastSeenAt: new Date(),
                leftAt: null,
              });
            }
          } else if ((table as { path?: string }).path !== undefined && v.path !== undefined) {
            dbState.pageHits.push({
              visitorId: (v.visitorId as string) ?? null,
              ip: (v.ip as string) ?? null,
              path: String(v.path),
              createdAt: new Date(),
            });
          } else if (v.eventType !== undefined) {
            dbState.events.push({
              eventType: String(v.eventType),
              severity: String(v.severity ?? "info"),
              summary: String(v.summary),
              createdAt: new Date(),
            });
          }
        }
        return {
          onDuplicateKeyUpdate: (opts: { set: Record<string, unknown> }) => {
            for (const v of rows) {
              if ((table as { settingKey?: string }).settingKey === "settingKey") {
                if (v.settingKey === "gate_passcode") {
                  insertAppSetting(String(opts.set.settingValue ?? v.settingValue));
                }
              }
              if ((table as { visitorId?: string }).visitorId === "visitorId" && v.visitorId) {
                const sid = String(v.visitorId);
                const existing = dbState.sessions.get(sid);
                if (existing) {
                  existing.lastSeenAt = new Date();
                  existing.leftAt = null;
                  if (opts.set.pageHits) existing.pageHits += 1;
                }
              }
            }
            return Promise.resolve();
          },
        };
      },
    };
  };

  const select = () => ({
    from: (table: unknown) => ({
      where: (_clause: unknown) => ({
        limit: (_n: number) => {
          if ((table as { settingKey?: string }).settingKey) {
            return Promise.resolve([
              {
                settingKey: "gate_passcode",
                settingValue: dbState.passcode,
              },
            ]);
          }
          return Promise.resolve([]);
        },
      }),
      orderBy: (_o: unknown) => ({
        limit: (_n: number) => {
          if ((table as { success?: string }).success) {
            return Promise.resolve(dbState.attempts);
          }
          if ((table as { visitorId?: string }).visitorId === "visitorId") {
            return Promise.resolve(Array.from(dbState.sessions.values()));
          }
          return Promise.resolve([]);
        },
      }),
    }),
  });

  // Custom select for COUNT(*) helper
  const selectCount = () => ({
    from: (table: unknown) => ({
      where: () => {
        if ((table as { success?: string }).success) {
          return Promise.resolve([
            {
              count: dbState.attempts.filter(a => !a.success).length,
            },
          ]);
        }
        if ((table as { path?: string }).path !== undefined) {
          return Promise.resolve([
            {
              count: dbState.pageHits.length,
            },
          ]);
        }
        return Promise.resolve([{ count: 0 }]);
      },
    }),
  });

  return {
    getDb: vi.fn(async () => ({
      insert,
      // overload select() to detect aggregate calls (called with object containing 'count')
      select: (arg?: unknown) => {
        if (arg && typeof arg === "object" && "count" in (arg as object)) {
          return selectCount();
        }
        return select();
      },
      update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
    })),
  };
});

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(async () => true),
}));

vi.mock("./_core/env", () => ({
  ENV: {
    ownerOpenId: "owner-open-id",
  },
}));

const ownerOpenId = "owner-open-id";

import { gateRouter, _internals } from "./routers/gate";
import { notifyOwner } from "./_core/notification";

function makeCtx(opts: {
  visitorId?: string | null;
  ip?: string;
  ua?: string;
  user?: { openId: string; role: string } | null;
}) {
  return {
    req: {
      headers: {
        "x-visitor-id": opts.visitorId ?? "vid-test",
        "user-agent": opts.ua ?? "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        "x-forwarded-for": opts.ip ?? "1.2.3.4",
      },
      socket: { remoteAddress: opts.ip ?? "1.2.3.4" },
    },
    res: {} as never,
    user: opts.user as never,
  };
}

beforeEach(() => {
  dbState.passcode = "062026";
  dbState.attempts = [];
  dbState.pageHits = [];
  dbState.sessions = new Map();
  dbState.events = [];
  vi.mocked(notifyOwner).mockClear();
});

describe("gate.verify", () => {
  it("accepts the correct passcode and logs a success attempt", async () => {
    const caller = gateRouter.createCaller(makeCtx({ visitorId: "vid-success-1", ip: "10.0.0.1" }));
    const res = await caller.verify({ passcode: "062026" });
    expect(res.success).toBe(true);
    expect(dbState.attempts).toHaveLength(1);
    expect(dbState.attempts[0]).toMatchObject({ success: true, ip: "10.0.0.1" });
  });

  it("rejects a wrong passcode and stores the submitted value (truncated) for fails", async () => {
    const caller = gateRouter.createCaller(makeCtx({ visitorId: "vid-fail-2" }));
    const res = await caller.verify({ passcode: "wrong-1" });
    expect(res.success).toBe(false);
    expect(dbState.attempts[0]).toMatchObject({ success: false, submittedValue: "wrong-1" });
  });

  it("logs auto-rotate event after a failed-attempt burst but does NOT change passcode or notify", async () => {
    const caller = gateRouter.createCaller(makeCtx({ visitorId: "vid-burst-3", ip: "9.9.9.9" }));
    for (let i = 0; i < _internals.ABUSE_FAILED_ATTEMPTS_PER_15MIN; i++) {
      await caller.verify({ passcode: "wrong" });
    }
    // Passcode stays unchanged (auto-rotation disabled)
    expect(dbState.passcode).toBe(_internals.DEFAULT_PASSCODE);
    // No notification for auto-rotation
    expect(notifyOwner).not.toHaveBeenCalled();
    // But the event is still logged
    expect(dbState.events.some(e => e.eventType === "auto_rotate")).toBe(true);
  });
});

describe("gate.heartbeat", () => {
  it("updates the visitor session and stores a page hit when a path is provided", async () => {
    const caller = gateRouter.createCaller(makeCtx({ visitorId: "vid-heartbeat-4" }));
    const res = await caller.heartbeat({ path: "/aldar-saadiyat" });
    expect(res.ok).toBe(true);
    expect(dbState.pageHits).toHaveLength(1);
    expect(dbState.pageHits[0].path).toBe("/aldar-saadiyat");
  });
});

describe("gate.adminOverview", () => {
  it("forbids non-owner users", async () => {
    const caller = gateRouter.createCaller(
      makeCtx({ user: { openId: "stranger", role: "user" } }),
    );
    await expect(caller.adminOverview()).rejects.toThrow(/FORBIDDEN/);
  });

  it("returns the dashboard payload for the owner", async () => {
    // Seed some data
    const userCaller = gateRouter.createCaller(makeCtx({ visitorId: "vid-overview", ip: "8.8.8.8" }));
    await userCaller.verify({ passcode: "062026" });
    await userCaller.heartbeat({ path: "/" });

    const ownerCaller = gateRouter.createCaller(
      makeCtx({ user: { openId: ownerOpenId, role: "admin" } }),
    );
    const data = await ownerCaller.adminOverview();
    expect(data.passcode).toBe("062026");
    expect(data.attempts.length).toBeGreaterThan(0);
    expect(data.recentHits.length).toBeGreaterThan(0);
  });
});

describe("gate.rotatePasscode (manual)", () => {
  it("forbids non-owner users", async () => {
    const caller = gateRouter.createCaller(
      makeCtx({ user: { openId: "stranger", role: "user" } }),
    );
    await expect(caller.rotatePasscode()).rejects.toThrow(/FORBIDDEN/);
  });

  it("changes the passcode and notifies owner", async () => {
    const caller = gateRouter.createCaller(
      makeCtx({ user: { openId: ownerOpenId, role: "admin" } }),
    );
    const res = await caller.rotatePasscode();
    expect(res.passcode).toMatch(/^\d{6}$/);
    expect(dbState.passcode).toBe(res.passcode);
    expect(notifyOwner).toHaveBeenCalled();
  });
});


describe("bot/agent detection", () => {
  it("bot UA is logged but does NOT block verify — correct passcode still succeeds", async () => {
    const caller = gateRouter.createCaller(
      makeCtx({
        visitorId: "vid-bot-manus",
        ip: "5.5.5.5",
        ua: "Manus AI Agent (browser-use/0.1)",
      }),
    );
    const res = await caller.verify({ passcode: "062026" });
    expect(res.success).toBe(true);
    // Passcode stays unchanged (auto-rotation disabled)
    expect(dbState.passcode).toBe(_internals.DEFAULT_PASSCODE);
    // No notification for auto-rotation
    expect(notifyOwner).not.toHaveBeenCalled();
    // Bot log is in attempts but verify succeeded
    expect(dbState.attempts.some((a: any) => a.flagReason?.startsWith("bot_ua:"))).toBe(true);
  });

  it("flags Playwright/Puppeteer/Selenium and curl/python user-agents", () => {
    const cases = [
      "Mozilla/5.0 (Macintosh) Playwright/1.40",
      "python-requests/2.31",
      "curl/8.1",
      "PerplexityBot/1.0",
      "GPTBot/1.0",
      "ClaudeBot/1.0",
    ];
    for (const ua of cases) {
      expect(_internals.isLikelyBotUA(ua)).not.toBeNull();
    }
  });

  it("does not flag a normal Safari/Chrome/Firefox user-agent", () => {
    const cases = [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0",
    ];
    for (const ua of cases) {
      expect(_internals.isLikelyBotUA(ua)).toBeNull();
    }
  });

  it("blocks a heartbeat from a bot UA, logs event but does NOT change passcode or notify", async () => {
    const caller = gateRouter.createCaller(
      makeCtx({
        visitorId: "vid-bot-hb",
        ip: "6.6.6.6",
        ua: "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/bot)",
      }),
    );
    const res = await caller.heartbeat({ path: "/aldar-saadiyat" });
    expect(res.ok).toBe(false);
    // Passcode stays unchanged (auto-rotation disabled)
    expect(dbState.passcode).toBe(_internals.DEFAULT_PASSCODE);
    // No notification for auto-rotation
    expect(notifyOwner).not.toHaveBeenCalled();
  });
});

describe("rate limiting", () => {
  it("returns TOO_MANY_REQUESTS after the per-visitor attempt cap", async () => {
    const caller = gateRouter.createCaller(makeCtx({ visitorId: "vid-rate-limit" }));
    for (let i = 0; i < _internals.RATE_LIMIT_ATTEMPTS_PER_5MIN; i++) {
      // verify() may rotate after the failed-burst threshold; we don't care here
      try {
        await caller.verify({ passcode: "definitely-wrong" });
      } catch {
        /* swallow */
      }
    }
    await expect(caller.verify({ passcode: "anything" })).rejects.toThrow(
      /Too many attempts|TOO_MANY_REQUESTS/,
    );
  });
});

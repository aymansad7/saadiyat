/**
 * Availability router invariants:
 *   - summary is public and returns shape with communities array
 *   - listForCommunity is public
 *   - admin mutations require admin role
 *   - lifecycle: create -> updates timestamps -> delete clears it
 */
import { describe, it, expect } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

const anonCtx: Context = { user: null } as any;
const adminCtx = (overrides: Partial<any> = {}): Context =>
  ({
    user: {
      id: "admin-test",
      name: "Admin Test",
      role: "admin",
      ...overrides,
    },
  }) as any;

describe("availability router", () => {
  it("summary is public and returns a `communities` array", async () => {
    const caller = appRouter.createCaller(anonCtx);
    const res = await caller.availability.summary();
    expect(res).toHaveProperty("communities");
    expect(Array.isArray(res.communities)).toBe(true);
  });

  it("listForCommunity is public, returns array (no contactLabel)", async () => {
    const caller = appRouter.createCaller(anonCtx);
    const rows = await caller.availability.listForCommunity({
      community: "saadiyat-lagoons",
    });
    expect(Array.isArray(rows)).toBe(true);
    if (rows.length > 0) {
      // public shape must not include contactLabel
      expect((rows[0] as any).contactLabel).toBeUndefined();
    }
  });

  it("admin mutations reject anonymous users", async () => {
    const caller = appRouter.createCaller(anonCtx);
    await expect(
      caller.availability.create({
        community: "saadiyat-lagoons",
        unitKey: "TEST-AVAIL-1",
        source: "manual",
      }),
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("admin can create, update timestamps, and delete a listing", async () => {
    const caller = appRouter.createCaller(adminCtx());
    const row = await caller.availability.create({
      community: "saadiyat-lagoons",
      unitKey: "TEST-AVAIL-LIFECYCLE",
      source: "manual",
      status: "available",
      askingPriceAed: 12_345_678,
      bedrooms: 4,
      notes: "lifecycle test",
    });
    expect(row.id).toBeDefined();
    expect(row.community).toBe("saadiyat-lagoons");
    expect(row.askingPriceAed).toBe(12_345_678);
    expect(row.createdAt).toBeInstanceOf(Date);
    expect(row.updatedAt).toBeInstanceOf(Date);
    const createdAt = row.createdAt.getTime();

    // Update (timestamp should bump):
    await new Promise(r => setTimeout(r, 10));
    const patched = await caller.availability.update({
      id: row.id,
      status: "reserved",
    });
    expect(patched.status).toBe("reserved");
    expect(patched.updatedAt.getTime()).toBeGreaterThanOrEqual(createdAt);

    // Cleanup:
    const del = await caller.availability.delete({ id: row.id });
    expect(del.ok).toBe(true);
  });

  it("non-admin authenticated users cannot create listings", async () => {
    const caller = appRouter.createCaller(adminCtx({ role: "user" }));
    await expect(
      caller.availability.create({
        community: "saadiyat-lagoons",
        unitKey: "TEST-AVAIL-FORBIDDEN",
        source: "manual",
      }),
    ).rejects.toBeInstanceOf(TRPCError);
  });
});

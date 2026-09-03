import { describe, expect, it } from "vitest";
import {
  SESSION_RENEWAL_WINDOW_MS,
  hashPassword,
  normalizeEmail,
  shouldRenewSession,
  verifyPasswordHash,
} from "./magicAuth";

describe("email/password authentication primitives", () => {
  it("normalizes email identity before any allowlist lookup", () => {
    expect(normalizeEmail("  Hamzeh@NASLUXURY.com ")).toBe("hamzeh@nasluxury.com");
  });

  it("creates salted password hashes that verify only the submitted password", () => {
    const hash = hashPassword("A-representative-password-2026");
    expect(hash).toMatch(/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
    expect(verifyPasswordHash("A-representative-password-2026", hash)).toBe(true);
    expect(verifyPasswordHash("different-password", hash)).toBe(false);
    expect(verifyPasswordHash("A-representative-password-2026", null)).toBe(false);
  });

  it("uses a different salt each time while accepting both correct hashes", () => {
    const first = hashPassword("same-password");
    const second = hashPassword("same-password");
    expect(first).not.toBe(second);
    expect(verifyPasswordHash("same-password", first)).toBe(true);
    expect(verifyPasswordHash("same-password", second)).toBe(true);
  });

  it("renews only valid email sessions inside their final 30-day renewal window", () => {
    const now = new Date("2026-09-03T00:00:00.000Z");
    expect(shouldRenewSession(new Date(now.getTime() + SESSION_RENEWAL_WINDOW_MS - 1), now)).toBe(true);
    expect(shouldRenewSession(new Date(now.getTime() + SESSION_RENEWAL_WINDOW_MS + 1), now)).toBe(false);
    expect(shouldRenewSession(new Date(now.getTime() - 1), now)).toBe(false);
  });
});

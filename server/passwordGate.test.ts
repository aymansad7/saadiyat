/**
 * Contract tests for the email-only EmailGate component.
 *
 * Invariants:
 *   - The gate offers allowlisted email/password sign-in and Google OAuth.
 *   - The legacy shared passcode is not available from the lock screen.
 *   - Unlock state is namespaced and tracked in sessionStorage.
 *   - App.tsx wires every route inside <EmailGate>.
 *   - /resale-search is gated, not bypassed.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const GATE_PATH = path.resolve(__dirname, "../client/src/components/EmailGate.tsx");
const APP_PATH = path.resolve(__dirname, "../client/src/App.tsx");

describe("EmailGate", () => {
  const source = fs.readFileSync(GATE_PATH, "utf8");

  it("offers email/password sign-in and preserves Google OAuth", () => {
    expect(source).toContain("trpc.magic.password.useMutation()");
    expect(source).toMatch(/passwordSignIn\.mutateAsync\(\s*\{\s*email:[^}]*password/s);
    expect(source).toContain("Continue with Google");
    expect(source).toContain("getLoginUrl()");
  });

  it("does not render or invoke a shared passcode flow", () => {
    expect(source).not.toContain("trpc.gate.verify.useMutation()");
    expect(source).not.toContain("verifyPasscode");
    expect(source).not.toContain("Passcode");
  });

  it("persists unlock state under the namespaced session-storage key", () => {
    expect(source).toContain('const STORAGE_KEY = "saadiyat:gate:unlocked"');
    expect(source).toContain("window.sessionStorage.getItem(STORAGE_KEY)");
    expect(source).toContain('window.sessionStorage.setItem(STORAGE_KEY, "yes")');
  });

  it("is wired into App.tsx so every route goes through <EmailGate>", () => {
    const appSource = fs.readFileSync(APP_PATH, "utf8");
    expect(appSource).toContain('import EmailGate from "./components/EmailGate"');
    expect(appSource).toMatch(/<EmailGate>[\s\S]*<Router\s*\/>/);
  });

  it("keeps /resale-search inside the gate (no public bypass)", () => {
    const appSource = fs.readFileSync(APP_PATH, "utf8");
    expect(appSource).toContain('<Route path="/resale-search" component={PublicResaleSearch} />');
    expect(appSource).not.toContain('location === "/resale-search"');
  });

  it("does not expose a passcode-bypass CTA on the lock screen", () => {
    expect(source).not.toContain("/resale-search");
    expect(source).not.toContain("passcode fallback");
  });

  it("uses the new Saadiyat Resale Hub branding on the lock screen", () => {
    expect(source).toContain("Saadiyat Resale Hub");
  });
});

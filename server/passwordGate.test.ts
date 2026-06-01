/**
 * Contract tests for the EmailGate component (which replaced the legacy
 * PasswordGate) and its retained passcode fallback.
 *
 * Invariants:
 *   - The gate offers an email magic-link flow as the primary mode.
 *   - The legacy passcode flow is still available as a fallback tab.
 *   - Unlock state is namespaced and tracked in sessionStorage.
 *   - The gate posts heartbeats once unlocked.
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

  it("offers a magic-link flow that calls trpc.magic.request and trpc.magic.verify", () => {
    expect(source).toContain("trpc.magic.request.useMutation()");
    expect(source).toContain("trpc.magic.verify.useMutation()");
    expect(source).toMatch(/requestMagic\.mutateAsync\(\s*\{\s*email:/);
    expect(source).toMatch(/verifyMagic\.mutateAsync\(\s*\{\s*email:[^}]*code:/s);
  });

  it("retains the passcode fallback against the server (no hard-coded secret)", () => {
    expect(source).not.toMatch(/const\s+SECRET\s*=\s*"\d{6}"/);
    expect(source).toContain("trpc.gate.verify.useMutation()");
    expect(source).toMatch(/verifyPasscode\.mutateAsync\(\s*\{\s*passcode:/);
  });

  it("persists unlock state under the namespaced session-storage key", () => {
    expect(source).toContain('const STORAGE_KEY = "saadiyat:gate:unlocked"');
    expect(source).toContain("window.sessionStorage.getItem(STORAGE_KEY)");
    expect(source).toContain('window.sessionStorage.setItem(STORAGE_KEY, "yes")');
  });

  it("posts a heartbeat after unlock so admin sees who is in", () => {
    expect(source).toContain("trpc.gate.heartbeat.useMutation()");
    expect(source).toContain("heartbeat.mutate({ path: location })");
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
  });

  it("uses the new Saadiyat Resale Hub branding on the lock screen", () => {
    expect(source).toContain("Saadiyat Resale Hub");
  });
});

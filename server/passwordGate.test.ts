/**
 * Lightweight contract tests for the PasswordGate component invariants
 * after the server-verified rewrite.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const GATE_PATH = path.resolve(__dirname, "../client/src/components/PasswordGate.tsx");

describe("PasswordGate", () => {
  const source = fs.readFileSync(GATE_PATH, "utf8");

  it("verifies the passcode against the server (no hard-coded secret)", () => {
    expect(source).not.toMatch(/const\s+SECRET\s*=\s*"\d{6}"/);
    expect(source).toContain("trpc.gate.verify.useMutation()");
    expect(source).toContain("verify.mutateAsync({ passcode:");
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

  it("is wired into App.tsx so every route is protected", () => {
    const appSource = fs.readFileSync(path.resolve(__dirname, "../client/src/App.tsx"), "utf8");
    expect(appSource).toContain('import PasswordGate from "./components/PasswordGate"');
    expect(appSource).toMatch(/<PasswordGate>[\s\S]*<Router\s*\/>/);
  });
});

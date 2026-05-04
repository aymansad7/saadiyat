/**
 * Lightweight contract tests for the PasswordGate component constants.
 * The component lives in the client bundle (DOM); these tests pin down
 * the shared invariants we rely on so they cannot drift silently.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const GATE_PATH = path.resolve(
  __dirname,
  "../client/src/components/PasswordGate.tsx"
);

describe("PasswordGate", () => {
  const source = fs.readFileSync(GATE_PATH, "utf8");

  it("uses the agreed shared passcode 062026", () => {
    expect(source).toContain('const SECRET = "062026"');
  });

  it("persists unlock state under the namespaced session-storage key", () => {
    expect(source).toContain('const STORAGE_KEY = "saadiyat:gate:unlocked"');
    expect(source).toContain("window.sessionStorage.getItem(STORAGE_KEY)");
    expect(source).toContain('window.sessionStorage.setItem(STORAGE_KEY, "yes")');
  });

  it("is wired into App.tsx so every route is protected", () => {
    const appSource = fs.readFileSync(
      path.resolve(__dirname, "../client/src/App.tsx"),
      "utf8"
    );
    expect(appSource).toContain('import PasswordGate from "./components/PasswordGate"');
    expect(appSource).toMatch(/<PasswordGate>[\s\S]*<Router\s*\/>/);
  });
});

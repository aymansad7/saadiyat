import { describe, it, expect } from "vitest";
import {
  canAccessOtherProjects,
  OTHER_PROJECTS_ALLOWED_ADMINS,
} from "../shared/otherAccess";

describe("canAccessOtherProjects", () => {
  it("allows any master regardless of email", () => {
    expect(canAccessOtherProjects("master", "ayman@nasluxury.com")).toBe(true);
    expect(canAccessOtherProjects("master", "aymansad7@gmail.com")).toBe(true);
    expect(canAccessOtherProjects("master", null)).toBe(true);
    expect(canAccessOtherProjects("master", undefined)).toBe(true);
    expect(canAccessOtherProjects("master", "random@example.com")).toBe(true);
  });

  it("allows the explicitly allowlisted admin (Hamzeh)", () => {
    expect(canAccessOtherProjects("admin", "hamzeh@nasluxury.com")).toBe(true);
  });

  it("is case-insensitive and trims the allowlisted admin email", () => {
    expect(canAccessOtherProjects("admin", "HAMZEH@NASLUXURY.COM")).toBe(true);
    expect(canAccessOtherProjects("admin", "  hamzeh@nasluxury.com  ")).toBe(true);
  });

  it("blocks every other admin", () => {
    expect(canAccessOtherProjects("admin", "someone@nasluxury.com")).toBe(false);
    expect(canAccessOtherProjects("admin", "ayman@nasluxury.com")).toBe(false);
    expect(canAccessOtherProjects("admin", null)).toBe(false);
    expect(canAccessOtherProjects("admin", undefined)).toBe(false);
  });

  it("blocks regular users and unknown roles", () => {
    expect(canAccessOtherProjects("user", "hamzeh@nasluxury.com")).toBe(false);
    expect(canAccessOtherProjects(null, "hamzeh@nasluxury.com")).toBe(false);
    expect(canAccessOtherProjects(undefined, "hamzeh@nasluxury.com")).toBe(false);
    expect(canAccessOtherProjects("", "hamzeh@nasluxury.com")).toBe(false);
  });

  it("keeps the allowlist limited to Hamzeh only (no scope creep)", () => {
    expect(OTHER_PROJECTS_ALLOWED_ADMINS).toEqual(["hamzeh@nasluxury.com"]);
  });
});

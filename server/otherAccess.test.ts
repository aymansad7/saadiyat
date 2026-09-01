import { describe, it, expect } from "vitest";
import { canAccessOtherProjects } from "../shared/otherAccess";

describe("canAccessOtherProjects", () => {
  it("allows any master regardless of email", () => {
    expect(canAccessOtherProjects("master", "ayman@nasluxury.com")).toBe(true);
    expect(canAccessOtherProjects("master", "aymansad7@gmail.com")).toBe(true);
    expect(canAccessOtherProjects("master", null)).toBe(true);
    expect(canAccessOtherProjects("master", undefined)).toBe(true);
    expect(canAccessOtherProjects("master", "random@example.com")).toBe(true);
  });

  it("blocks every Admin, including a previously allowlisted address", () => {
    expect(canAccessOtherProjects("admin", "hamzeh@nasluxury.com")).toBe(false);
    expect(canAccessOtherProjects("admin", "HAMZEH@NASLUXURY.COM")).toBe(false);
    expect(canAccessOtherProjects("admin", "  hamzeh@nasluxury.com  ")).toBe(false);
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
});

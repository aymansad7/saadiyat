import { describe, expect, it } from "vitest";
import { EMIRATES_PROJECTS, isSourceAvailable } from "./externalDevelopers";

describe("Emirates non-Aldar source registry", () => {
  it("keeps only the three owner-requested projects with their explicit source identities", () => {
    expect(EMIRATES_PROJECTS).toHaveLength(3);
    expect(EMIRATES_PROJECTS.map(project => project.sourceProjectName)).toEqual([
      "Al Maryah Tower",
      "Stellar By Elie Saab",
      "Hilton Al Raha",
    ]);
    expect(EMIRATES_PROJECTS.some(project => project.sourceProjectName === "Hilton JLT")).toBe(false);
  });

  it("treats availability as a workbook-source label only", () => {
    expect(isSourceAvailable("available")).toBe(true);
    expect(isSourceAvailable(" Available ")).toBe(true);
    expect(isSourceAvailable("sold")).toBe(false);
    expect(isSourceAvailable(null)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { getProjectViewMode } from "./viewMode";

describe("project view mode links", () => {
  it("opens Project Table links directly in table mode", () => {
    expect(getProjectViewMode("?view=table")).toBe("table");
    expect(getProjectViewMode("?foo=1&view=table")).toBe("table");
  });

  it("keeps all other links in cards mode", () => {
    expect(getProjectViewMode("")).toBe("cards");
    expect(getProjectViewMode("?view=cards")).toBe("cards");
  });
});

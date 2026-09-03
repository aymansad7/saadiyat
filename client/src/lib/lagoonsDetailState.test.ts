import { describe, expect, it } from "vitest";
import { getLagoonsDetailState } from "./lagoonsDetailState";

describe("getLagoonsDetailState", () => {
  it("keeps the detail route loading until the unit query settles", () => {
    expect(getLagoonsDetailState(true, false)).toBe("loading");
    expect(getLagoonsDetailState(false, true)).toBe("ready");
    expect(getLagoonsDetailState(false, false)).toBe("not-found");
  });
});

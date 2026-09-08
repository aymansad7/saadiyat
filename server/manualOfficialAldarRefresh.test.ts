import { describe, expect, it, vi } from "vitest";
import { runManualOfficialAldarRefresh } from "./manualOfficialAldarRefresh";

describe("manual official Aldar refresh", () => {
  it("runs each active official capture sequentially with the same manual actor", async () => {
    const order: string[] = [];
    const refreshGhadeer = vi.fn(async input => {
      order.push(`ghadeer:${input.trigger}:${input.triggeredBy}`);
      return { runId: 1 };
    });
    const refreshSei = vi.fn(async input => {
      order.push(`sei:${input.trigger}:${input.triggeredBy}`);
      return { runId: 2, publishedPriceCount: 0 };
    });

    await expect(runManualOfficialAldarRefresh("master@example.com", { refreshGhadeer, refreshSei })).resolves.toEqual({
      ghadeer: { status: "success", result: { runId: 1 } },
      sei: { status: "success", result: { runId: 2, publishedPriceCount: 0 } },
    });
    expect(order).toEqual(["ghadeer:manual:master@example.com", "sei:manual:master@example.com"]);
  });

  it("returns a JSON-safe source error while continuing with the remaining capture", async () => {
    const refreshGhadeer = vi.fn(async () => { throw new Error("official source timed out"); });
    const refreshSei = vi.fn(async () => ({ runId: 2, publishedPriceCount: 0 }));
    await expect(runManualOfficialAldarRefresh("master@example.com", { refreshGhadeer, refreshSei })).resolves.toEqual({
      ghadeer: { status: "error", message: "official source timed out" },
      sei: { status: "success", result: { runId: 2, publishedPriceCount: 0 } },
    });
  });
});

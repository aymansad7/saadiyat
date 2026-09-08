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
      ghadeer: { runId: 1 },
      sei: { runId: 2, publishedPriceCount: 0 },
    });
    expect(order).toEqual(["ghadeer:manual:master@example.com", "sei:manual:master@example.com"]);
  });
});

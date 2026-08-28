import { describe, expect, it } from "vitest";
import { gateRouter, _internals } from "./routers/gate";

function caller() {
  return gateRouter.createCaller({
    req: {
      headers: { "user-agent": "Mozilla/5.0", "x-visitor-id": "retired-gate-test" },
      socket: { remoteAddress: "127.0.0.1" },
    } as never,
    res: {} as never,
    user: null,
  });
}

describe("retired shared passcode route", () => {
  it("rejects all shared-passcode sign-in attempts", async () => {
    await expect(caller().verify({ passcode: "062026" })).rejects.toThrow(
      /Passcode sign-in has been retired/,
    );
  });

  it("retains user-agent classification as an informational security helper", () => {
    expect(_internals.isLikelyBotUA("curl/8.0")).toBe("curl/");
    expect(_internals.isLikelyBotUA("Mozilla/5.0 Safari/605.1.15")).toBeNull();
  });
});

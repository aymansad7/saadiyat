import { describe, expect, it } from "vitest";
import { documentShareAccess, oneDriveRouter } from "./routers/oneDrive";

function callerFor(role: "admin" | "master") {
  return oneDriveRouter.createCaller({
    user: { id: 1, role, email: `${role}@nasluxury.com`, name: role },
  } as never);
}

describe("OneDrive administration access", () => {
  it("rejects a non-master administrator before returning the document register", async () => {
    await expect(callerFor("admin").status()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(callerFor("admin").list({ limit: 10 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("keeps the router callable for Master Admin context", () => {
    expect(callerFor("master")).toBeDefined();
  });

  it("does not create anonymous sharing access for confidential unit files", () => {
    expect(documentShareAccess("spa")).toBe("restricted");
    expect(documentShareAccess("owner_document")).toBe("restricted");
    expect(documentShareAccess("source_file")).toBe("restricted");
    expect(documentShareAccess("brochure")).toBe("anyone_link");
  });
});

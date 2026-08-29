import { describe, expect, it } from "vitest";

const tenantId = process.env.ONEDRIVE_TENANT_ID?.trim();
const clientId = process.env.ONEDRIVE_CLIENT_ID?.trim();
const clientSecret = process.env.ONEDRIVE_CLIENT_SECRET?.trim();
const ownerUpn = process.env.ONEDRIVE_OWNER_UPN?.trim();

describe("OneDrive Business credentials", () => {
  it("obtains an app token and can read the configured owner's drive metadata", async () => {
    expect(tenantId, "ONEDRIVE_TENANT_ID must be configured").toBeTruthy();
    expect(clientId, "ONEDRIVE_CLIENT_ID must be configured").toBeTruthy();
    expect(clientSecret, "ONEDRIVE_CLIENT_SECRET must be configured").toBeTruthy();
    expect(ownerUpn, "ONEDRIVE_OWNER_UPN must be configured").toBeTruthy();

    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${encodeURIComponent(tenantId!)}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          grant_type: "client_credentials",
          scope: "https://graph.microsoft.com/.default",
        }),
      },
    );
    expect(tokenResponse.ok, "Microsoft token exchange must succeed").toBe(true);
    const token = (await tokenResponse.json()) as { access_token?: string };
    expect(token.access_token, "Microsoft token response must include access_token").toBeTruthy();

    const payloadSegment = token.access_token!.split(".")[1];
    const tokenPayload = payloadSegment
      ? JSON.parse(Buffer.from(payloadSegment, "base64url").toString("utf8")) as { roles?: string[] }
      : {};
    expect(
      tokenPayload.roles ?? [],
      "App token must include the Microsoft Graph application role Files.ReadWrite.All",
    ).toContain("Files.ReadWrite.All");
    expect(
      tokenPayload.roles ?? [],
      "The OneDrive app token must not retain any unrelated application-management role",
    ).not.toContain("Application.ReadWrite.All");
    expect(
      tokenPayload.roles ?? [],
      "The OneDrive app token must not retain any unrelated application-management role",
    ).not.toContain("Application.ReadUpdate.All");

    const driveResponse = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(ownerUpn!)}/drive?$select=id,driveType`,
      { headers: { Authorization: `Bearer ${token.access_token}` } },
    );
    expect(
      driveResponse.ok,
      `App must be authorized to read the configured OneDrive metadata (HTTP ${driveResponse.status})`,
    ).toBe(true);
    const drive = (await driveResponse.json()) as { id?: string; driveType?: string };
    expect(drive.id).toBeTruthy();
    expect(drive.driveType).toBe("business");
  }, 30_000);
});

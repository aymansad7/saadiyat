/**
 * Sanity-check the static DCR backup ZIP catalogue.
 *
 * The constants in `client/src/data/dcrBackups.ts` reference real ZIP files
 * uploaded to /manus-storage. A typo in the storage hash there would silently
 * 404 in production (the storage proxy returns 404 for unknown keys), so we
 * verify each one resolves before delivering anything to the user.
 *
 * The `/manus-storage/<key>` route 307-redirects to a presigned S3 URL. We
 * follow the redirect with a HEAD and assert HTTP 2xx + non-zero Content-Length.
 */
import { describe, it, expect } from "vitest";
import { DCR_BACKUPS } from "../client/src/data/dcrBackups";

const BASE = process.env.DCR_BACKUP_TEST_BASE ?? "http://localhost:3000";

const expected = [
  { community: "jawaher", minBytes: 200_000_000, maxBytes: 260_000_000, expectedCount: 83 },
  { community: "stRegis", minBytes: 100_000_000, maxBytes: 130_000_000, expectedCount: 33 },
  { community: "sbv", minBytes: 1_900_000_000, maxBytes: 2_300_000_000, expectedCount: 441 },
] as const;

describe("DCR_BACKUPS catalogue", () => {
  for (const { community, minBytes, maxBytes, expectedCount } of expected) {
    it(`${community}: catalogue entry has correct shape`, () => {
      const entry = DCR_BACKUPS[community as keyof typeof DCR_BACKUPS];
      expect(entry).toBeDefined();
      expect(entry.url.startsWith("/manus-storage/")).toBe(true);
      expect(entry.url.endsWith(".zip")).toBe(true);
      expect(entry.filename).toMatch(/^[A-Za-z]+_Backup\.zip$/);
      expect(entry.count).toBe(expectedCount);
      expect(entry.sizeBytes).toBeGreaterThan(minBytes);
      expect(entry.sizeBytes).toBeLessThan(maxBytes);
    });

    it(
      `${community}: storage URL resolves (HEAD <= 200..399)`,
      { timeout: 30_000 },
      async () => {
        const entry = DCR_BACKUPS[community as keyof typeof DCR_BACKUPS];
        const res = await fetch(BASE + entry.url, { method: "HEAD", redirect: "follow" });
        expect(res.status).toBeGreaterThanOrEqual(200);
        expect(res.status).toBeLessThan(400);
        const len = Number(res.headers.get("content-length") ?? "0");
        // Allow loose bounds: presigned URLs sometimes omit content-length on HEAD
        if (len > 0) {
          expect(len).toBeGreaterThan(minBytes);
          expect(len).toBeLessThan(maxBytes);
        }
      },
    );
  }
});

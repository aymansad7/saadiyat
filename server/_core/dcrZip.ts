/**
 * DCR ZIP streaming endpoint.
 *
 * GET /api/dcr-zip?prefix=<villaKey-prefix>&name=<download-filename>
 *
 *   - Public (no auth): same access level as opening the PDFs individually.
 *   - Streams a ZIP on the fly. We never buffer the whole archive in memory.
 *   - PDFs are pulled from the same `/manus-storage/...` proxy path the front-end
 *     uses, then piped straight into the archive.
 *
 *  The endpoint is rate-limited by the natural cost of fetching N presigned URLs
 *  (typically 25–160 PDFs per pack); we don't add an explicit limiter for now.
 */
import type { Express, Request, Response } from "express";
// archiver v8 is ESM-pure and exports `ZipArchive` directly (no default fn).
// @ts-expect-error - @types/archiver targets v7 where ZipArchive isn't exported as a class.
import { ZipArchive } from "archiver";
import { listFilesByVillaKeyPrefix } from "../db";
import { ENV } from "./env";

// Same regex used in the tRPC router — accepts mixed-case villaKeys.
const PREFIX_REGEX = /^[A-Za-z0-9][A-Za-z0-9\-_/]{0,127}$/;

// Hard ceiling so a stray prefix can't try to ZIP, say, every file in the table.
const MAX_FILES_PER_ZIP = 600;

async function presignGet(storageKey: string): Promise<string | null> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) return null;
  const forgeUrl = new URL(
    "v1/storage/presign/get",
    ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
  );
  forgeUrl.searchParams.set("path", storageKey);
  const resp = await fetch(forgeUrl, {
    headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
  });
  if (!resp.ok) return null;
  const { url } = (await resp.json()) as { url?: string };
  return url ?? null;
}

function safeFilename(name: string): string {
  // Replace anything that would confuse a ZIP entry / disk path
  return name.replace(/[\\/:*?"<>|]+/g, "_").slice(0, 200) || "file.pdf";
}

export function registerDcrZipRoute(app: Express) {
  app.get("/api/dcr-zip", async (req: Request, res: Response) => {
    const prefix = String(req.query.prefix ?? "").trim();
    const downloadName =
      String(req.query.name ?? "").trim() || `dcr-pack-${Date.now()}.zip`;

    if (!prefix || !PREFIX_REGEX.test(prefix)) {
      res.status(400).send("Invalid or missing `prefix` query param");
      return;
    }

    let rows: Awaited<ReturnType<typeof listFilesByVillaKeyPrefix>>;
    try {
      rows = await listFilesByVillaKeyPrefix(prefix);
    } catch (err) {
      console.error("[dcr-zip] DB lookup failed:", err);
      res.status(500).send("Failed to list DCR PDFs");
      return;
    }

    // Only DCR PDFs — never ship arbitrary user uploads through this endpoint.
    const pdfs = rows.filter(
      (r) => r.mimeType === "application/pdf" && r.category === "dcr",
    );

    if (pdfs.length === 0) {
      res.status(404).send("No DCR PDFs found for this prefix");
      return;
    }
    if (pdfs.length > MAX_FILES_PER_ZIP) {
      res
        .status(413)
        .send(`Too many files (${pdfs.length} > ${MAX_FILES_PER_ZIP})`);
      return;
    }

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeFilename(downloadName)}"`,
      "Cache-Control": "no-store",
    });

    const archive = new ZipArchive({ zlib: { level: 6 } });
    archive.on("warning", (err: Error) =>
      console.warn("[dcr-zip] archiver warn:", err),
    );
    archive.on("error", (err: Error) => {
      console.error("[dcr-zip] archiver error:", err);
      // The response is already streaming; we can only end it abruptly.
      try {
        res.end();
      } catch {
        /* noop */
      }
    });

    archive.pipe(res);

    let added = 0;
    let skipped = 0;
    for (const f of pdfs) {
      const url = await presignGet(f.storageKey);
      if (!url) {
        skipped += 1;
        continue;
      }
      try {
        const fetched = await fetch(url);
        if (!fetched.ok || !fetched.body) {
          skipped += 1;
          continue;
        }
        const arr = new Uint8Array(await fetched.arrayBuffer());
        archive.append(Buffer.from(arr), {
          name: safeFilename(f.filename || `${f.villaKey}.pdf`),
        });
        added += 1;
      } catch (err) {
        console.warn("[dcr-zip] fetch failed for", f.storageKey, err);
        skipped += 1;
      }
    }

    if (added === 0) {
      // Nothing made it into the archive — still finalize so the response closes.
      console.warn(`[dcr-zip] no PDFs could be added for prefix=${prefix}`);
    }
    if (skipped > 0) {
      console.warn(
        `[dcr-zip] prefix=${prefix} added=${added} skipped=${skipped}`,
      );
    }

    await archive.finalize();
  });
}

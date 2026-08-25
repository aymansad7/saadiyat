import { existsSync } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const [label, startArg, endArg] = process.argv.slice(2);
const start = Number(startArg);
const end = Number(endArg);
if (!label || !Number.isInteger(start) || !Number.isInteger(end) || end < start) {
  throw new Error("Usage: node scripts/fetch-lagoons-dcr-range.mjs <label> <start> <end>");
}

const outputDir = new URL(`../tmp/${label}-dcrs/pdfs/`, import.meta.url);
const manifestFile = new URL(`../tmp/${label}-dcrs/download-manifest.json`, import.meta.url);
const concurrency = 8;
const identifiers = Array.from({ length: end - start + 1 }, (_, index) => start + index);

async function fetchOne(identifier) {
  const dcrId = `SDE3_${identifier}`;
  const url = `https://geosmart.dmt.gov.ae/dcr/${dcrId}.pdf`;
  const file = new URL(`${dcrId}.pdf`, outputDir);
  const filePath = fileURLToPath(file);
  if (existsSync(filePath)) {
    const current = await stat(filePath);
    if (current.size > 20_000) return { identifier, dcrId, url, status: "existing", size: current.size };
  }
  try {
    const response = await fetch(url, { redirect: "follow" });
    if (!response.ok) return { identifier, dcrId, url, status: "http_error", httpStatus: response.status };
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 20_000 || !bytes.subarray(0, 4).equals(Buffer.from("%PDF"))) {
      return { identifier, dcrId, url, status: "invalid_pdf", size: bytes.length };
    }
    await writeFile(file, bytes);
    return { identifier, dcrId, url, status: "downloaded", size: bytes.length };
  } catch (error) {
    return { identifier, dcrId, url, status: "error", error: error instanceof Error ? error.message : String(error) };
  }
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const outcomes = [];
  for (let index = 0; index < identifiers.length; index += concurrency) {
    outcomes.push(...(await Promise.all(identifiers.slice(index, index + concurrency).map(fetchOne))));
  }
  outcomes.sort((a, b) => a.identifier - b.identifier);
  const summary = {
    label,
    requestedRange: { start, end, count: identifiers.length },
    downloaded: outcomes.filter((outcome) => ["downloaded", "existing"].includes(outcome.status)).length,
    unavailable: outcomes.filter((outcome) => !["downloaded", "existing"].includes(outcome.status)).length,
    outcomes,
  };
  await writeFile(manifestFile, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify({ label, ...summary.requestedRange, downloaded: summary.downloaded, unavailable: summary.unavailable, manifest: manifestFile.pathname }));
}

await main();

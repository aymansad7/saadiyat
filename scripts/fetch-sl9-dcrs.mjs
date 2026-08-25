import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const probeFile = new URL("../tmp/sl9-dcrs/probe-results.json", import.meta.url);
const outputDir = new URL("../tmp/sl9-dcrs/pdfs/", import.meta.url);
const manifestFile = new URL("../tmp/sl9-dcrs/download-manifest.json", import.meta.url);
const concurrency = 10;

async function fetchOne(result) {
  const file = new URL(`${result.dcrId}.pdf`, outputDir);
  const filePath = fileURLToPath(file);
  if (existsSync(filePath)) {
    const current = await stat(filePath);
    if (current.size > 20_000) {
      return { dcrId: result.dcrId, url: result.url, status: "existing", size: current.size };
    }
  }
  try {
    const response = await fetch(result.url, { redirect: "follow" });
    if (!response.ok) {
      return { dcrId: result.dcrId, url: result.url, status: "http_error", httpStatus: response.status };
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 20_000 || !bytes.subarray(0, 4).equals(Buffer.from("%PDF"))) {
      return { dcrId: result.dcrId, url: result.url, status: "invalid_pdf", size: bytes.length };
    }
    await writeFile(file, bytes);
    return { dcrId: result.dcrId, url: result.url, status: "downloaded", size: bytes.length };
  } catch (error) {
    return { dcrId: result.dcrId, url: result.url, status: "error", error: error instanceof Error ? error.message : String(error) };
  }
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const probe = JSON.parse(await readFile(probeFile, "utf8"));
  const available = probe.results.filter((result) => result.available);
  const outcomes = [];
  for (let index = 0; index < available.length; index += concurrency) {
    outcomes.push(...(await Promise.all(available.slice(index, index + concurrency).map(fetchOne))));
  }
  outcomes.sort((a, b) => a.dcrId.localeCompare(b.dcrId));
  const summary = {
    requestedAvailable: available.length,
    downloaded: outcomes.filter((outcome) => outcome.status === "downloaded" || outcome.status === "existing").length,
    failures: outcomes.filter((outcome) => !["downloaded", "existing"].includes(outcome.status)).length,
    outcomes,
  };
  await writeFile(manifestFile, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify({
    requestedAvailable: summary.requestedAvailable,
    downloaded: summary.downloaded,
    failures: summary.failures,
    manifest: manifestFile.pathname,
  }));
}

await main();

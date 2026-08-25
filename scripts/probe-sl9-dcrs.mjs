import { mkdir, writeFile } from "node:fs/promises";

const start = 2000;
const end = 2407;
const outputDir = new URL("../tmp/sl9-dcrs/", import.meta.url);
const outputFile = new URL("../tmp/sl9-dcrs/probe-results.json", import.meta.url);
const concurrency = 12;

const identifiers = Array.from({ length: end - start + 1 }, (_, index) => start + index);

async function probe(identifier) {
  const url = `https://geosmart.dmt.gov.ae/dcr/SDE3_${identifier}.pdf`;
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    return {
      identifier,
      dcrId: `SDE3_${identifier}`,
      url,
      status: response.status,
      available: response.ok,
      contentType: response.headers.get("content-type") ?? "",
      contentLength: Number(response.headers.get("content-length") ?? 0),
    };
  } catch (error) {
    return {
      identifier,
      dcrId: `SDE3_${identifier}`,
      url,
      status: 0,
      available: false,
      contentType: "",
      contentLength: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const results = [];
  for (let index = 0; index < identifiers.length; index += concurrency) {
    const batch = identifiers.slice(index, index + concurrency);
    results.push(...(await Promise.all(batch.map(probe))));
  }
  results.sort((a, b) => a.identifier - b.identifier);
  const summary = {
    requestedRange: { start, end, count: identifiers.length },
    availableCount: results.filter((result) => result.available).length,
    unavailableCount: results.filter((result) => !result.available).length,
    results,
  };
  await writeFile(outputFile, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify({
    range: `${start}-${end}`,
    available: summary.availableCount,
    unavailable: summary.unavailableCount,
    output: outputFile.pathname,
  }));
}

await main();

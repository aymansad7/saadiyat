import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { extractOfficialWorldAldarUnits } from "./alGhadeerOfficialCapture";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEI_PROJECT_SLUG = "sei-saadiyat";
const SEI_ROUTE = "https://world.aldar.com/uae/abudhabi/seisaadiyat";
const SEI_PREFIX = "SeiSaadiyat-";

type SourceUnit = Record<string, unknown> & { unitNumber?: string };
type SeiUnit = Record<string, unknown> & { unit_name?: string | null; price_aed?: number | null };
type SeiDataset = { projects: Array<Record<string, unknown>> };

function readSaadiyatDataset(): SeiDataset {
  const candidates = [
    resolve(__dirname, "data/aldar_saadiyat.json"),
    resolve(__dirname, "../data/aldar_saadiyat.json"),
    resolve(process.cwd(), "server/data/aldar_saadiyat.json"),
    resolve(process.cwd(), "dist/data/aldar_saadiyat.json"),
  ];
  for (const path of candidates) {
    try {
      return JSON.parse(readFileSync(path, "utf8")) as SeiDataset;
    } catch {
      // Try the next deployment-safe data location.
    }
  }
  throw new Error("Sei Saadiyat baseline dataset was not found.");
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** AED 1 is the known placeholder supplied before Sei unit prices are released. */
export function isPublishedSeiUnitPrice(value: unknown): value is number {
  const price = numberOrNull(value);
  return price != null && price > 1;
}

function validSeiCode(value: unknown): value is string {
  return typeof value === "string" && /^SeiSaadiyat-T[1-6]-(?:\d{2}|G)-\d{2}$/i.test(value);
}

export async function captureSeiSaadiyatOfficialSnapshot(fetchImpl: typeof fetch = fetch) {
  const captureDate = new Date().toISOString().slice(0, 10);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetchImpl(SEI_ROUTE, {
      headers: { Accept: "text/html", "User-Agent": "SaadiyatResaleHub/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Sei Saadiyat: World of Aldar returned HTTP ${response.status}.`);
    const html = await response.text();
    const sourceUnits = extractOfficialWorldAldarUnits(html, SEI_PREFIX) as SourceUnit[];
    if (sourceUnits.length !== 778) {
      throw new Error(`Sei Saadiyat: expected 778 official units, received ${sourceUnits.length}.`);
    }
    if (new Set(sourceUnits.map(unit => unit.unitNumber)).size !== sourceUnits.length) {
      throw new Error("Sei Saadiyat: duplicate official unit code.");
    }

    const sourceByCode = new Map(sourceUnits.map(unit => [String(unit.unitNumber), unit]));
    const dataset = readSaadiyatDataset();
    const project = dataset.projects.find(item => item.slug === SEI_PROJECT_SLUG);
    if (!project || !Array.isArray(project.buildings)) throw new Error("Sei Saadiyat is absent from the Saadiyat baseline dataset.");

    let publishedPriceCount = 0;
    for (const building of project.buildings as Array<Record<string, unknown>>) {
      if (!Array.isArray(building.units)) continue;
      building.units = (building.units as SeiUnit[]).map(unit => {
        const unitName = unit.unit_name;
        if (!validSeiCode(unitName)) throw new Error("Sei Saadiyat: baseline contains an invalid unit code.");
        const source = sourceByCode.get(unitName);
        if (!source) throw new Error(`Sei Saadiyat: official source omitted ${unitName}.`);
        const officialPrice = numberOrNull(source.price);
        const priceAed = isPublishedSeiUnitPrice(officialPrice) ? officialPrice : (isPublishedSeiUnitPrice(unit.price_aed) ? unit.price_aed : null);
        if (priceAed != null) publishedPriceCount += 1;
        return {
          ...unit,
          price_aed: priceAed,
          price_source: isPublishedSeiUnitPrice(officialPrice) ? "World of Aldar live capture" : unit.price_source ?? null,
          price_source_captured_at: isPublishedSeiUnitPrice(officialPrice) ? captureDate : unit.price_source_captured_at ?? null,
          source_unit_status: typeof source.unitStatus === "string" && source.unitStatus.trim() ? source.unitStatus.trim() : unit.source_unit_status ?? null,
          source_captured_at: captureDate,
          source_route: new URL(SEI_ROUTE).pathname,
        };
      });
    }

    return {
      captureDate,
      dataset,
      publishedPriceCount,
      files: [{
        filename: `sei-saadiyat-live-${captureDate}.html`,
        bytes: Buffer.from(html),
        mimeType: "text/html",
      }],
    };
  } finally {
    clearTimeout(timeout);
  }
}

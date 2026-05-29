/**
 * Saadiyat — communities manifest
 *
 * Path A (lightweight): we only know the DCR PDF URL pattern and the plot
 * number for each villa. Coordinates / specs are not extracted here; the
 * existing St. Regis dataset (with full DCR data) lives in `villas.ts`.
 *
 * URL formats:
 *  - Jawaher Saadiyat:                   https://geosmart.dmt.gov.ae/dcr/SDN1_{n}.pdf       (n = 49..131)
 *  - Saadiyat Beach Villas — Gate 1:    https://geosmart.dmt.gov.ae/dcr/SDN2_6-1_2.pdf
 *                                         https://geosmart.dmt.gov.ae/dcr/SDN2_6_{n}.pdf   (n = 3..26)
 *  - Saadiyat Beach Villas — Gate 2:    https://geosmart.dmt.gov.ae/dcr/SDN2_{n}.pdf       (n = 1..156)
 *  - Saadiyat Beach Villas — Gate 3:    https://geosmart.dmt.gov.ae/dcr/SDN2_2_{n}.pdf     (n = 1..65)
 *  - Saadiyat Beach Villas — Gate 4:    https://geosmart.dmt.gov.ae/dcr/SDN2_3_{n}.pdf     (n = 1..59)
 *  - Saadiyat Beach Villas — Premium:   https://geosmart.dmt.gov.ae/dcr/SDN2_4_{n}.pdf     (n = 1..15)
 *  - Saadiyat Beach Villas — Gate 7:    https://geosmart.dmt.gov.ae/dcr/SDN4_1_{n}.pdf     (n = 1..126)
 */

const DCR_BASE = "https://geosmart.dmt.gov.ae/dcr";
export const MYLAND_URL = "https://myland.dmt.gov.ae/";

export interface SimplePlot {
  id: number;            // Sequential within the gate (1, 2, 3...)
  label: string;         // What we show as the headline (e.g. "Plot 49", "Plot 6-1/2")
  pdfFilename: string;   // The PDF basename (e.g. "SDN1_49.pdf")
  pdfUrl: string;        // Legacy DMT URL — kept for fallback only
  villaKey: string;      // DB villaKey to look up DCR PDF in our own storage (`<community>/<plotKey>`)
  mylandUrl: string;     // Always points to MyLand portal (filter manually)
}

export interface Gate {
  slug: string;          // URL slug (e.g. "gate-2")
  name: string;          // Human-readable (e.g. "Gate 2")
  blurb: string;         // Short description
  plots: SimplePlot[];
}

export interface Community {
  slug: string;
  name: string;
  cluster: string;
  gates: Gate[];         // For Saadiyat Beach Villas; empty array for flat communities
  flatPlots?: SimplePlot[]; // For communities without gates (Jawaher)
  totalPlots: number;
}

function buildPlot(filename: string, label: string, id: number, villaKey: string): SimplePlot {
  return {
    id,
    label,
    pdfFilename: filename,
    pdfUrl: `${DCR_BASE}/${filename}`,
    villaKey,
    mylandUrl: MYLAND_URL,
  };
}

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

// ───────────────────────── Jawaher Saadiyat ─────────────────────────
const jawaherPlots: SimplePlot[] = range(49, 131).map((n, i) =>
  buildPlot(`SDN1_${n}.pdf`, `Plot ${n}`, i + 1, `jawaher/Plot-${n}`)
);

// ───────────────────────── Saadiyat Beach Villas — Gates ─────────────────────────

// Gate 1: special first file SDN2_6-1_2.pdf, then SDN2_6_3 ... SDN2_6_26
const gate1Plots: SimplePlot[] = [
  buildPlot("SDN2_6-1_2.pdf", "Plots 1 & 2", 1, `saadiyat-beach-villas/Gate1-SDN2_6-1_2`),
  ...range(3, 26).map((n, i) =>
    buildPlot(`SDN2_6_${n}.pdf`, `Plot ${n}`, i + 2, `saadiyat-beach-villas/Gate1-Plot-${n}`)
  ),
];

const gate2Plots: SimplePlot[] = range(1, 156).map((n) =>
  buildPlot(`SDN2_${n}.pdf`, `Plot ${n}`, n, `saadiyat-beach-villas/Gate2-Plot-${n}`)
);

const gate3Plots: SimplePlot[] = range(1, 65).map((n) =>
  buildPlot(`SDN2_2_${n}.pdf`, `Plot ${n}`, n, `saadiyat-beach-villas/Gate3-Plot-${n}`)
);

const gate4Plots: SimplePlot[] = range(1, 59).map((n) =>
  buildPlot(`SDN2_3_${n}.pdf`, `Plot ${n}`, n, `saadiyat-beach-villas/Gate4-Plot-${n}`)
);

const premiumPlots: SimplePlot[] = range(1, 15).map((n) =>
  buildPlot(`SDN2_4_${n}.pdf`, `Plot ${n}`, n, `saadiyat-beach-villas/Premium-SDN2_4_${n}`)
);

const gate7Plots: SimplePlot[] = range(1, 126).map((n) =>
  buildPlot(`SDN4_1_${n}.pdf`, `Plot ${n}`, n, `saadiyat-beach-villas/Gate7-Plot-${n}`)
);

const sbvGates: Gate[] = [
  { slug: "gate-1", name: "Gate 1", blurb: "Beachfront entry · Cluster SDN2-6", plots: gate1Plots },
  { slug: "gate-2", name: "Gate 2", blurb: "Main residential cluster · SDN2", plots: gate2Plots },
  { slug: "gate-3", name: "Gate 3", blurb: "Inner cluster · SDN2-2", plots: gate3Plots },
  { slug: "gate-4", name: "Gate 4", blurb: "Inner cluster · SDN2-3", plots: gate4Plots },
  { slug: "premium", name: "Premium Villas", blurb: "Reserved waterfront line · SDN2-4", plots: premiumPlots },
  { slug: "gate-7", name: "Gate 7", blurb: "Northern cluster · SDN4-1", plots: gate7Plots },
];

const sbvTotal = sbvGates.reduce((s, g) => s + g.plots.length, 0);

export const COMMUNITIES: Community[] = [
  {
    slug: "jawaher",
    name: "Jawaher Saadiyat",
    cluster: "Saadiyat Reserve · SDN1",
    gates: [],
    flatPlots: jawaherPlots,
    totalPlots: jawaherPlots.length,
  },
  {
    slug: "saadiyat-beach-villas",
    name: "Saadiyat Beach Villas",
    cluster: "Saadiyat Beach District · SDN2 / SDN4",
    gates: sbvGates,
    totalPlots: sbvTotal,
  },
];

export function getCommunity(slug: string): Community | undefined {
  return COMMUNITIES.find((c) => c.slug === slug);
}

export function getGate(community: Community, gateSlug: string): Gate | undefined {
  return community.gates.find((g) => g.slug === gateSlug);
}

export function findPlot(community: Community, gateSlug: string | null, plotIndex: number): SimplePlot | undefined {
  if (community.flatPlots) {
    return community.flatPlots[plotIndex - 1];
  }
  const gate = gateSlug ? getGate(community, gateSlug) : community.gates[0];
  return gate?.plots[plotIndex - 1];
}

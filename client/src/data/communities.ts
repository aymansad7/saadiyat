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


// ───────────────────────── Saadiyat Beach Golf Views ─────────────────────────
// 26 plots — DCR reference only. PDFs uploaded to /manus-storage/.
const golfViewsPlots: SimplePlot[] = [
  buildPlot("SDN2_6-1_2.pdf", "Plot 6-1/2", 1, "golf-views/SDN2_6-1_2"),
  buildPlot("SDN2_6_3.pdf", "Plot 6/3", 2, "golf-views/SDN2_6_3"),
  buildPlot("SDN2_6_4.pdf", "Plot 6/4", 3, "golf-views/SDN2_6_4"),
  buildPlot("SDN2_6_5.pdf", "Plot 6/5", 4, "golf-views/SDN2_6_5"),
  buildPlot("SDN2_6_6.pdf", "Plot 6/6", 5, "golf-views/SDN2_6_6"),
  buildPlot("SDN2_6_7-6_8.pdf", "Plot 6/7–6/8", 6, "golf-views/SDN2_6_7-6_8"),
  buildPlot("SDN2_6_9.pdf", "Plot 6/9", 7, "golf-views/SDN2_6_9"),
  buildPlot("SDN2_6_10.pdf", "Plot 6/10", 8, "golf-views/SDN2_6_10"),
  buildPlot("SDN2_6_11.pdf", "Plot 6/11", 9, "golf-views/SDN2_6_11"),
  buildPlot("SDN2_6_12.pdf", "Plot 6/12", 10, "golf-views/SDN2_6_12"),
  buildPlot("SDN2_6_13.pdf", "Plot 6/13", 11, "golf-views/SDN2_6_13"),
  buildPlot("SDN2_6_14.pdf", "Plot 6/14", 12, "golf-views/SDN2_6_14"),
  buildPlot("SDN2_6_15.pdf", "Plot 6/15", 13, "golf-views/SDN2_6_15"),
  buildPlot("SDN2_6_16.pdf", "Plot 6/16", 14, "golf-views/SDN2_6_16"),
  buildPlot("SDN2_6_17.pdf", "Plot 6/17", 15, "golf-views/SDN2_6_17"),
  buildPlot("SDN2_6_18.pdf", "Plot 6/18", 16, "golf-views/SDN2_6_18"),
  buildPlot("SDN2_6_19.pdf", "Plot 6/19", 17, "golf-views/SDN2_6_19"),
  buildPlot("SDN2_6_20.pdf", "Plot 6/20", 18, "golf-views/SDN2_6_20"),
  buildPlot("SDN2_6_21.pdf", "Plot 6/21", 19, "golf-views/SDN2_6_21"),
  buildPlot("SDN2_6_22.pdf", "Plot 6/22", 20, "golf-views/SDN2_6_22"),
  buildPlot("SDN2_6_23-6_24.pdf", "Plot 6/23–6/24", 21, "golf-views/SDN2_6_23-6_24"),
  buildPlot("SDN2_6_25.pdf", "Plot 6/25", 22, "golf-views/SDN2_6_25"),
  buildPlot("SDN2_6_26.pdf", "Plot 6/26", 23, "golf-views/SDN2_6_26"),
  buildPlot("SDN2_6_27.pdf", "Plot 6/27", 24, "golf-views/SDN2_6_27"),
  buildPlot("SDN2_p38.pdf", "Plot p38", 25, "golf-views/SDN2_p38"),
  buildPlot("SDN3_14.pdf", "Plot SDN3-14 (Four Seasons)", 26, "golf-views/SDN3_14"),
];

// ───────────────────────── Private Villas Close to Four Seasons ─────────────────────────
// 7 plots — DCR reference only. PDFs uploaded to /manus-storage/.
const privateVillasPlots: SimplePlot[] = [
  buildPlot("SDN2_157.pdf", "Plot 157", 1, "private-villas/SDN2_157"),
  buildPlot("SDN2_158.pdf", "Plot 158", 2, "private-villas/SDN2_158"),
  buildPlot("SDN2_159.pdf", "Plot 159", 3, "private-villas/SDN2_159"),
  buildPlot("SDN2_160.pdf", "Plot 160", 4, "private-villas/SDN2_160"),
  buildPlot("SDN2_161.pdf", "Plot 161", 5, "private-villas/SDN2_161"),
  buildPlot("SDN2_163A.pdf", "Plot 163A", 6, "private-villas/SDN2_163A"),
  buildPlot("SDN2_163B.pdf", "Plot 163B", 7, "private-villas/SDN2_163B"),
];

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
  {
    slug: "saadiyat-golf-views",
    name: "Saadiyat Beach Golf Views",
    cluster: "Saadiyat Beach District · SDN2 / SDN3",
    gates: [],
    flatPlots: golfViewsPlots,
    totalPlots: golfViewsPlots.length,
  },
  {
    slug: "private-villas-four-seasons",
    name: "Private Villas Close to Four Seasons",
    cluster: "Saadiyat Beach District · SDN2",
    gates: [],
    flatPlots: privateVillasPlots,
    totalPlots: privateVillasPlots.length,
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

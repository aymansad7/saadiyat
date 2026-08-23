/**
 * Coastal Atelier — Jawaher Saadiyat (Path A)
 * Same shell as St. Regis but the cards are SimplePlotCards (DCR + MyLand only)
 * because per-plot specs are not yet extracted.
 *
 * Filters:
 *   - Search by plot number
 *   - Sort by plot number (asc/desc)
 *
 * Future: when PDFs are parsed, swap SimplePlotCard for a richer card and
 * add a plot map (this file changes minimally).
 */
import { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SimplePlotCard from "@/components/SimplePlotCard";
import { COMMUNITIES } from "@/data/communities";
import { jawaherPlotHistories, JAWAHER_TX_SUMMARY } from "@/data/jawaherTransactions";
import { getPlotLandArea } from "@/data/plotLandAreas";
import AreaFilterControls from "@/components/AreaFilterControls";
import { formatArea, isWithinAreaRange, matchesAreaQuery, type AreaUnit } from "@/lib/areaSearch";
import { useDcrPdfIndex } from "@/hooks/useDcrPdfIndex";
import { useListingIndex } from "@/hooks/useListingIndex";
import { findListingByVillaKey } from "@/data/propertyFinderListings";
import { DownloadDcrPackButton } from "@/components/DownloadDcrPackButton";
import { DownloadDcrBackupButton } from "@/components/DownloadDcrBackupButton";
import { DCR_BACKUPS } from "@/data/dcrBackups";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, ChevronUp, ChevronDown, ExternalLink, LayoutGrid, Table2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COMMUNITY = COMMUNITIES.find((c) => c.slug === "jawaher")!;

// Match transactions to plots by DCR land area (±100 sqft tolerance)
// Each jawaherPlotHistory has a unique landSqft from ADREC; we match it to the
// plot's DCR-measured land area to correctly assign transaction history.
const txByVillaKey = new Map<string, typeof jawaherPlotHistories[0]["transactions"]>();
{
  const plots = COMMUNITY.flatPlots ?? [];
  for (const p of plots) {
    const dcrArea = getPlotLandArea(p.villaKey);
    if (!dcrArea) continue;
    // Find the transaction history whose landSqft is closest to this plot's DCR area
    let bestMatch: typeof jawaherPlotHistories[0] | null = null;
    let bestDiff = Infinity;
    for (const ph of jawaherPlotHistories) {
      const diff = Math.abs(ph.landSqft - dcrArea.sqft);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestMatch = ph;
      }
    }
    // Only accept matches within 100 sqft tolerance
    if (bestMatch && bestDiff <= 100) {
      txByVillaKey.set(p.villaKey, bestMatch.transactions);
    }
  }
}

export default function Jawaher() {
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState<number>(48);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqm");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Bulk-fetch every Jawaher DCR PDF in one request → pdf URL map keyed by villaKey.
  const { index: pdfIndex, isLoading: pdfLoading } = useDcrPdfIndex("jawaher/");
  const pdfCount = pdfIndex.size;

  // Bulk-fetch every Jawaher listing row in a single request.
  const { index: listingIndex } = useListingIndex({ community: "jawaher" });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (COMMUNITY.flatPlots ?? []).filter((p) => {
      const area = getPlotLandArea(p.villaKey);
      if (!isWithinAreaRange(area ?? {}, areaUnit, areaMin, areaMax)) return false;
      if (!q) return true;
      return matchesAreaQuery(q, area ?? {}) || (
        p.label.toLowerCase().includes(q) ||
        p.pdfFilename.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    });
    list.sort((a, b) => (a.id - b.id) * (sortDir === "asc" ? 1 : -1));
    return list;
  }, [query, sortDir, areaUnit, areaMin, areaMax]);

  const visible = filtered.slice(0, pageSize);

  function reset() {
    setQuery("");
    setSortDir("asc");
    setPageSize(48);
    setAreaMin("");
    setAreaMax("");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle={`${COMMUNITY.name} · ${COMMUNITY.cluster}`} back={{ href: "/", label: "Back to Saadiyat" }} />

      {/* Page intro */}
      <section className="border-b border-border bg-card/50">
        <div className="container py-6 sm:py-8 grid grid-cols-12 gap-4 items-end">
          <div className="col-span-12 sm:col-span-7 lg:col-span-8">
            <div className="flex items-center gap-2 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
              <span className="h-px w-6 bg-primary/60" />
              {COMMUNITY.cluster}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] leading-tight text-foreground">
              {COMMUNITY.name}
              <span className="text-muted-foreground italic"> — {COMMUNITY.totalPlots} plots.</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
              Click any plot to open its official DCR sheet. For the precise
              location, open the MyLand portal and filter by community.
            </p>
          </div>
          <div className="col-span-12 sm:col-span-5 lg:col-span-4 flex flex-col gap-3 sm:items-end">
            <div className="flex flex-wrap gap-3 sm:justify-end">
              <Stat label="Plots" value={String(COMMUNITY.totalPlots)} />
              <Stat label="Showing" value={String(filtered.length)} accent />
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <DownloadDcrPackButton
                prefix="jawaher/"
                filename="Jawaher-DCRs.zip"
                count={pdfCount}
                loading={pdfLoading}
              />
              <DownloadDcrBackupButton backup={DCR_BACKUPS.jawaher} />
            </div>
            <Stat label="Source" value="DMT" />
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="border-b border-border bg-background sticky top-[60px] sm:top-[68px] z-30 backdrop-blur-md bg-background/85">
        <div className="container py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plot or area (e.g. 1050 m²)…"
              className="pl-9 bg-card border-border"
            />
          </div>
          <AreaFilterControls
            unit={areaUnit}
            onUnitChange={setAreaUnit}
            min={areaMin}
            max={areaMax}
            onMinChange={setAreaMin}
            onMaxChange={setAreaMax}
            compact
          />
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
              className="h-9 bg-card gap-1.5"
            >
              {sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {sortDir === "asc" ? "Ascending" : "Descending"}
            </Button>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="h-9 w-[140px] bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">Show 24</SelectItem>
                <SelectItem value="48">Show 48</SelectItem>
                <SelectItem value="96">Show 96</SelectItem>
                <SelectItem value="9999">Show all</SelectItem>
              </SelectContent>
            </Select>
            <div className="inline-flex rounded-md border border-border overflow-hidden">
              <Button type="button" variant={viewMode === "cards" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("cards")} className="rounded-none h-9 gap-1"><LayoutGrid className="h-3.5 w-3.5" /> Cards</Button>
              <Button type="button" variant={viewMode === "table" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("table")} className="rounded-none h-9 gap-1"><Table2 className="h-3.5 w-3.5" /> Table</Button>
            </div>
            <Button variant="ghost" size="sm" onClick={reset} className="h-9 text-muted-foreground hover:text-foreground gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button asChild variant="outline" size="sm" className="h-9 bg-card gap-1.5 hidden md:inline-flex">
              <a href="https://myland.dmt.gov.ae/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                MyLand
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Cards */}
      <main className="container py-6 sm:py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-md">
            <div className="font-display text-2xl text-foreground">No plots match this search</div>
            <Button onClick={reset} variant="outline" className="mt-4 bg-card">Reset</Button>
          </div>
        ) : viewMode === "table" ? (
          <div className="rounded-lg border border-border bg-card overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-accent/40 text-left text-[0.65rem] font-mono uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3">Plot</th><th className="px-4 py-3">Area</th><th className="px-4 py-3">Last sale date</th><th className="px-4 py-3">Last price</th><th className="px-4 py-3">Sales</th><th className="px-4 py-3">DCR</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((plot) => {
                  const transactions = txByVillaKey.get(plot.villaKey) ?? [];
                  const last = transactions[transactions.length - 1];
                  const area = getPlotLandArea(plot.villaKey);
                  return <tr key={plot.villaKey} className="hover:bg-accent/30"><td className="px-4 py-3 font-semibold">{plot.label}</td><td className="px-4 py-3 font-mono">{formatArea(area ?? {}, areaUnit)}</td><td className="px-4 py-3 font-mono">{last?.date ?? "—"}</td><td className="px-4 py-3 font-semibold">{last ? `AED ${last.priceAed.toLocaleString()}` : "—"}</td><td className="px-4 py-3">{transactions.length || "—"}</td><td className="px-4 py-3"><a href={pdfIndex.get(plot.villaKey) ?? undefined} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Open</a></td></tr>;
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visible.map((p) => (
                <SimplePlotCard
                  key={p.pdfFilename}
                  plot={p}
                  communityLabel={`Jawaher · SDN1`}
                  bigNumber={p.label.replace(/^Plot\s+/, "")}
                  pdfUrl={pdfIndex.get(p.villaKey) ?? null}
                  pdfLoading={pdfLoading}
                  listing={listingIndex.get(p.villaKey) ?? null}
                  community="jawaher"
                  transactions={txByVillaKey.get(p.villaKey)}
                  landSqft={getPlotLandArea(p.villaKey)?.sqft}
                  areaUnit={areaUnit}
                  detailHref={`/jawaher/plot/${p.id}`}
                  pfListing={findListingByVillaKey(p.villaKey) ?? undefined}
                />
              ))}
            </div>
            {filtered.length > visible.length && (
              <div className="text-center mt-8">
                <Button onClick={() => setPageSize((s) => s + 48)} variant="outline" className="bg-card">
                  Show more ({filtered.length - visible.length} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mt-auto border-t border-border bg-card/60">
        <div className="container py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-muted-foreground">
          <div className="font-mono uppercase tracking-[0.18em]">Saadiyat · Jawaher</div>
          <div>Source: DMT GeoSmart · DCR sheets hosted on Saadiyat archive</div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-3 py-2 border border-border rounded-sm bg-card min-w-[88px]">
      <div className="text-[0.62rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">{label}</div>
      <div className={`font-display num-display tabular text-2xl leading-none mt-0.5 ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}

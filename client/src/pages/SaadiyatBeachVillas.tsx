/**
 * Coastal Atelier — Saadiyat Beach Villas (Path A)
 * Multi-gate community: each Gate is a horizontal tab; selecting a gate
 * updates the search/sort/grid below.
 *
 * Gates: Gate 1, Gate 2, Gate 3, Gate 4, Premium Villas, Gate 7
 *
 * Like Jawaher, cards are SimplePlotCards (DCR + MyLand).
 */
import { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SimplePlotCard from "@/components/SimplePlotCard";
import { COMMUNITIES } from "@/data/communities";
import { sbvGateRecords, SDN2_SUMMARY } from "@/data/sdn2Transactions";
import { getPlotLandArea } from "@/data/plotLandAreas";
import { findSDN2Transactions } from "@/data/sdn2Transactions";
import AreaFilterControls from "@/components/AreaFilterControls";
import { getInitialProjectViewMode } from "@/lib/viewMode";
import { formatArea, isWithinAreaRange, matchesAreaQuery, type AreaUnit } from "@/lib/areaSearch";
import { useDcrPdfIndex } from "@/hooks/useDcrPdfIndex";
import { useListingIndex } from "@/hooks/useListingIndex";
import { DownloadDcrPackButton } from "@/components/DownloadDcrPackButton";
import { DownloadDcrBackupButton } from "@/components/DownloadDcrBackupButton";
import { DCR_BACKUPS } from "@/data/dcrBackups";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, ChevronUp, ChevronDown, ExternalLink, LayoutGrid, Table2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";

const COMMUNITY = COMMUNITIES.find((c) => c.slug === "saadiyat-beach-villas")!;

export default function SaadiyatBeachVillas() {
  // Use URL hash (#gate-2) so deep-links work. Default to first gate.
  const [location] = useLocation();
  const initialGateSlug = (() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && COMMUNITY.gates.find((g) => g.slug === hash)) return hash;
    return COMMUNITY.gates[0].slug;
  })();
  const [gateSlug, setGateSlug] = useState<string>(initialGateSlug);
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState<number>(48);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqm");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">(getInitialProjectViewMode);

  const activeGate = COMMUNITY.gates.find((g) => g.slug === gateSlug)!;

  // Compute villaKey prefix for the active gate so we can bulk-fetch DCR PDFs.
  // The first plot's villaKey looks like `saadiyat-beach-villas/Gate2-Plot-1`,
  // so we strip the trailing identifier to get the gate prefix.
  const pdfPrefix = useMemo(() => {
    const sample = activeGate.plots[0]?.villaKey ?? "";
    // e.g. "saadiyat-beach-villas/Gate2-Plot-1" -> "saadiyat-beach-villas/Gate2-"
    const match = sample.match(/^(saadiyat-beach-villas\/(?:Gate\d|Premium)-)/);
    return match?.[1] ?? null;
  }, [activeGate]);
  const { index: pdfIndex, isLoading: pdfLoading } = useDcrPdfIndex(pdfPrefix);
  const pdfCount = pdfIndex.size;
  const { index: listingIndex } = useListingIndex({ prefix: pdfPrefix ?? undefined });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = activeGate.plots.filter((p) => {
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
  }, [query, sortDir, activeGate, areaUnit, areaMin, areaMax]);

  const visible = filtered.slice(0, pageSize);

  function changeGate(slug: string) {
    setGateSlug(slug);
    setQuery("");
    setPageSize(48);
    window.location.hash = slug;
  }

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
              <span className="text-muted-foreground italic"> — {COMMUNITY.totalPlots} plots across {COMMUNITY.gates.length} gates.</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
              Choose a gate below to browse all plots in that cluster. Each card
              opens the official DCR sheet from our archive.
            </p>
          </div>
          <div className="col-span-12 sm:col-span-5 lg:col-span-4 flex flex-wrap gap-3 sm:justify-end">
            <Stat label="Plots" value={String(COMMUNITY.totalPlots)} />
            <Stat label="Gates" value={String(COMMUNITY.gates.length)} accent />
            <Stat label="Source" value="DMT" />
          </div>
        </div>
      </section>

      {/* Gate tabs */}
      <nav className="border-b border-border bg-background sticky top-[60px] sm:top-[68px] z-30 backdrop-blur-md bg-background/85">
        <div className="container">
          <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pt-2 pb-0">
            {COMMUNITY.gates.map((g) => {
              const active = g.slug === gateSlug;
              return (
                <button
                  key={g.slug}
                  onClick={() => changeGate(g.slug)}
                  className={[
                    "shrink-0 px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    active
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/30",
                  ].join(" ")}
                >
                  <span className="font-display">{g.name}</span>
                  <span className="ml-1.5 text-[0.7rem] font-mono tabular text-muted-foreground">
                    {g.plots.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter bar (under tabs) */}
          <div className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 border-t border-border/60">
            <div className="flex items-center gap-3">
              <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
                {activeGate.name}
              </div>
              <span className="text-xs text-muted-foreground hidden sm:inline">{activeGate.blurb}</span>
            </div>
            <div className="relative flex-1 max-w-xs ml-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search plot or area…"
                className="pl-9 bg-card border-border h-9"
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
                className="h-9 bg-card gap-1.5"
              >
                {sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {sortDir === "asc" ? "Asc" : "Desc"}
              </Button>
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="h-9 w-[120px] bg-card">
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
              {pdfPrefix && (
                <DownloadDcrPackButton
                  prefix={pdfPrefix}
                  filename={`SBV-${activeGate.name.replace(/\s+/g, "")}-DCRs.zip`}
                  count={pdfCount}
                  loading={pdfLoading}
                  className="h-9 hidden md:inline-flex"
                />
              )}
              <DownloadDcrBackupButton
                backup={DCR_BACKUPS.sbv}
                className="h-9 hidden lg:inline-flex"
              />
              <Button asChild variant="outline" size="sm" className="h-9 bg-card gap-1.5 hidden md:inline-flex">
                <a href="https://myland.dmt.gov.ae/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  MyLand
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

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
                <tr><th className="px-4 py-3">Plot</th><th className="px-4 py-3">Gate</th><th className="px-4 py-3">Area</th><th className="px-4 py-3">Last sale date</th><th className="px-4 py-3">Last price</th><th className="px-4 py-3">Sales</th><th className="px-4 py-3">DCR</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((plot) => {
                  const area = getPlotLandArea(plot.villaKey);
                  const transactions = area ? (findSDN2Transactions(area.sqft) ?? []) : [];
                  const last = transactions[transactions.length - 1];
                  return <tr key={plot.villaKey} className="hover:bg-accent/30"><td className="px-4 py-3 font-semibold">{plot.label}</td><td className="px-4 py-3">{activeGate.name}</td><td className="px-4 py-3 font-mono">{formatArea(area ?? {}, areaUnit)}</td><td className="px-4 py-3 font-mono">{last?.date ?? "—"}</td><td className="px-4 py-3 font-semibold">{last ? `AED ${last.priceAed.toLocaleString()}` : "—"}</td><td className="px-4 py-3">{transactions.length || "—"}</td><td className="px-4 py-3"><a href={pdfIndex.get(plot.villaKey) ?? undefined} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Open</a></td></tr>;
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
                  communityLabel={`SBV · ${activeGate.name}`}
                  bigNumber={p.label.replace(/^Plots?\s+/, "")}
                  pdfUrl={pdfIndex.get(p.villaKey) ?? null}
                  pdfLoading={pdfLoading}
                  listing={listingIndex.get(p.villaKey) ?? null}
                  community="saadiyat-beach-villas"
                  landSqft={getPlotLandArea(p.villaKey)?.sqft}
                  areaUnit={areaUnit}
                  transactions={(() => {
                    const area = getPlotLandArea(p.villaKey);
                    if (!area) return undefined;
                    return findSDN2Transactions(area.sqft);
                  })()}
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

      {/* ADREC Transaction History for SBV gates */}
      <section className="container py-10 sm:py-14 border-t border-border">
        <div className="mb-6">
          <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-2">ADREC Records · SDN2</div>
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">
            Transaction History
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            {sbvGateRecords.reduce((sum, r) => sum + r.transactions.length, 0)} official transactions for SBV gate villas (land 3,000–8,000 sqft).
            Each row represents a unique plot identified by its land area. Source: ad-transactions.com (updated 16 Aug 2026).
          </p>
        </div>
        <div className="border border-border rounded-md overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/30">
                  <th className="text-left px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">Land (sqft)</th>
                  <th className="text-left px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="text-left px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="text-right px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">Price (AED)</th>
                  <th className="text-right px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">Rate/sqft</th>
                  <th className="text-center px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sbvGateRecords
                  .sort((a, b) => b.transactions[b.transactions.length - 1].date.localeCompare(a.transactions[a.transactions.length - 1].date))
                  .map((record) => {
                    const lastTx = record.transactions[record.transactions.length - 1];
                    const firstTx = record.transactions[0];
                    let appreciation: number | null = null;
                    if (record.transactions.length > 1) {
                      appreciation = ((lastTx.priceAed - firstTx.priceAed) / firstTx.priceAed) * 100;
                    }
                    return (
                      <tr key={record.landSqft} className="hover:bg-accent/20">
                        <td className="px-3 py-2 font-mono text-xs text-foreground">{record.landSqft.toLocaleString()}</td>
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground whitespace-nowrap">{lastTx.date}</td>
                        <td className="px-3 py-2">
                          <span className={`text-[0.6rem] font-mono uppercase px-1.5 py-0.5 rounded-sm border ${
                            lastTx.saleType === "primary"
                              ? "text-primary border-primary/30 bg-primary/5"
                              : "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5"
                          }`}>
                            {lastTx.saleType === "primary" ? "Primary" : "Resale"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-xs text-foreground">{lastTx.priceAed.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground">{lastTx.ratePerSqft?.toLocaleString() ?? "—"}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="font-mono text-xs text-muted-foreground">{record.transactions.length}</span>
                          {appreciation !== null && (
                            <span className={`ml-1.5 text-[0.6rem] font-mono ${
                              appreciation >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            }`}>
                              {appreciation >= 0 ? "+" : ""}{appreciation.toFixed(0)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-border bg-card/60">
        <div className="container py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-muted-foreground">
          <div className="font-mono uppercase tracking-[0.18em]">Saadiyat · Saadiyat Beach Villas</div>
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

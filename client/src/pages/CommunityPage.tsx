/**
 * Generic community page for flat-plot communities (no gates).
 * Used for: Saadiyat Beach Golf Views, Private Villas Close to Four Seasons.
 * Accepts a community slug via URL params and renders the plot grid with
 * search, sort, and DCR PDF links.
 */
import { useMemo, useState } from "react";
import { useParams } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import SimplePlotCard, { type PlotTransaction } from "@/components/SimplePlotCard";
import { COMMUNITIES } from "@/data/communities";
import type { SimplePlot } from "@/data/communities";
import { useDcrPdfIndex } from "@/hooks/useDcrPdfIndex";
import { useListingIndex } from "@/hooks/useListingIndex";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";
import { golfViewsPlotData } from "@/data/golfViewsPlotData";
import { getPlotLandArea } from "@/data/plotLandAreas";
import AreaFilterControls, { type AreaViewMode } from "@/components/AreaFilterControls";
import {
  areaValue,
  formatArea,
  isWithinAreaRange,
  matchesAreaQuery,
  type AreaUnit,
  type AreaValues,
} from "@/lib/areaSearch";

type TableSortKey = "plot" | "area" | "date" | "price";
interface CommunityTableRow {
  plot: SimplePlot;
  area: AreaValues;
  transaction?: PlotTransaction;
}

export default function CommunityPage() {
  const { slug } = useParams<{ slug: string }>();
  const community = COMMUNITIES.find((c) => c.slug === slug);

  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqm");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [viewMode, setViewMode] = useState<AreaViewMode>("cards");
  const [tableSortKey, setTableSortKey] = useState<TableSortKey>("date");
  const [tableSortDir, setTableSortDir] = useState<"asc" | "desc">("desc");

  // Derive the villaKey prefix from the first plot (e.g. "golf-views/" not the URL slug)
  const villaKeyPrefix = useMemo(() => {
    const firstKey = community?.flatPlots?.[0]?.villaKey;
    if (!firstKey) return slug ? `${slug}/` : "";
    const slashIdx = firstKey.indexOf("/");
    return slashIdx > 0 ? firstKey.slice(0, slashIdx + 1) : `${slug}/`;
  }, [community, slug]);
  const { index: pdfIndex, isLoading: pdfLoading } = useDcrPdfIndex(villaKeyPrefix);
  const { index: listingIndex } = useListingIndex({ community: slug ?? "" });

  const filtered = useMemo(() => {
    if (!community?.flatPlots) return [];
    const q = query.trim().toLowerCase();
    const list = community.flatPlots.filter((p) => {
      const dcrArea = getPlotLandArea(p.villaKey);
      const golfArea = golfViewsPlotData[p.villaKey];
      const area = {
        sqm: golfArea?.landSqm ?? dcrArea?.sqm,
        sqft: golfArea?.landSqft ?? dcrArea?.sqft,
      };
      if (!isWithinAreaRange(area, areaUnit, areaMin, areaMax)) return false;
      if (!q) return true;
      return matchesAreaQuery(q, area) || (
        p.label.toLowerCase().includes(q) ||
        p.pdfFilename.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    });
    list.sort((a, b) => (a.id - b.id) * (sortDir === "asc" ? 1 : -1));
    return list;
  }, [community, query, sortDir, areaUnit, areaMin, areaMax]);

  const tableRows = useMemo(() => {
    const rows = filtered.flatMap<CommunityTableRow>((plot) => {
      const dcrArea = getPlotLandArea(plot.villaKey);
      const golfArea = golfViewsPlotData[plot.villaKey];
      const area = {
        sqm: golfArea?.landSqm ?? dcrArea?.sqm,
        sqft: golfArea?.landSqft ?? dcrArea?.sqft,
      };
      const transactions = slug === "saadiyat-golf-views" ? golfArea?.transactions ?? [] : [];
      if (transactions.length === 0) return [{ plot, area }];
      return transactions.map((transaction) => ({ plot, area, transaction }));
    });
    const direction = tableSortDir === "asc" ? 1 : -1;
    return rows.sort((a, b) => {
      if (tableSortKey === "plot") return (a.plot.id - b.plot.id) * direction;
      if (tableSortKey === "area") return ((areaValue(a.area, areaUnit) ?? 0) - (areaValue(b.area, areaUnit) ?? 0)) * direction;
      if (tableSortKey === "price") return ((a.transaction?.priceAed ?? 0) - (b.transaction?.priceAed ?? 0)) * direction;
      return (a.transaction?.date ?? "").localeCompare(b.transaction?.date ?? "") * direction;
    });
  }, [filtered, slug, tableSortDir, tableSortKey, areaUnit]);

  if (!community) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader subTitle="Community not found" back={{ href: "/", label: "Back" }} />
        <div className="container py-16 text-center text-muted-foreground">
          <p className="text-lg">Community &ldquo;{slug}&rdquo; not found.</p>
        </div>
      </div>
    );
  }

  function reset() {
    setQuery("");
    setSortDir("asc");
    setAreaMin("");
    setAreaMax("");
  }

  function changeTableSort(key: TableSortKey) {
    if (tableSortKey === key) setTableSortDir((current) => current === "asc" ? "desc" : "asc");
    else {
      setTableSortKey(key);
      setTableSortDir(key === "date" ? "desc" : "asc");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        subTitle={`${community.name} · ${community.cluster}`}
        back={{ href: "/", label: "Back to Saadiyat" }}
      />

      {/* Page intro */}
      <section className="border-b border-border bg-card/50">
        <div className="container py-6 sm:py-8">
          <div className="flex items-center gap-2 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
            <span className="h-px w-6 bg-primary/60" />
            {community.cluster}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] leading-tight text-foreground">
            {community.name}
            <span className="text-muted-foreground italic">
              {" "}— {community.totalPlots} plots.
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
            Click any plot to open its official DCR sheet. Each card links
            directly to the DMT-issued Development Control Regulation document.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="border-b border-border bg-background sticky top-0 z-20">
        <div className="container py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plot or area (e.g. 2500 m²)…"
              className="w-64"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
            className="gap-1 text-muted-foreground"
          >
            {sortDir === "asc" ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            Plot #
          </Button>
          <AreaFilterControls
            unit={areaUnit}
            onUnitChange={setAreaUnit}
            min={areaMin}
            max={areaMax}
            onMinChange={setAreaMin}
            onMaxChange={setAreaMax}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            compact
          />
          {(query || areaMin || areaMax) && (
            <Button variant="ghost" size="sm" onClick={reset} className="gap-1 text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          )}
          <span className="ml-auto text-[0.7rem] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            {filtered.length} / {community.totalPlots} plots
          </span>
        </div>
      </section>

      {/* Plot cards / table */}
      <section className="container py-6 sm:py-8">
        {viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((plot) => (
            <SimplePlotCard
              key={plot.id}
              plot={plot}
              communityLabel={community.name}
              pdfUrl={pdfIndex.get(plot.villaKey) ?? null}
              pdfLoading={pdfLoading}
              listing={listingIndex.get(plot.villaKey) ?? null}
              community={community.slug}
              transactions={slug === "saadiyat-golf-views" ? golfViewsPlotData[plot.villaKey]?.transactions : undefined}
              showTransactionStatus={slug === "saadiyat-golf-views"}
              landSqft={slug === "saadiyat-golf-views" ? golfViewsPlotData[plot.villaKey]?.landSqft : undefined}
              areaUnit={areaUnit}
              mapHref={slug === "saadiyat-golf-views" ? `/map?plot=${encodeURIComponent(plot.villaKey)}` : undefined}
            />
          ))}
        </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-accent/30 border-b border-border">
                <tr>
                  <th className="px-3 py-2 text-left"><button onClick={() => changeTableSort("date")} className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground hover:text-primary">Date</button></th>
                  <th className="px-3 py-2 text-left"><button onClick={() => changeTableSort("plot")} className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground hover:text-primary">Plot</button></th>
                  <th className="px-3 py-2 text-left font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">Project</th>
                  <th className="px-3 py-2 text-right"><button onClick={() => changeTableSort("area")} className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground hover:text-primary">Land ({areaUnit === "sqm" ? "m²" : "sqft"})</button></th>
                  <th className="px-3 py-2 text-right"><button onClick={() => changeTableSort("price")} className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground hover:text-primary">Price (AED)</button></th>
                  <th className="px-3 py-2 text-left font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">Primary / Secondary</th>
                  <th className="px-3 py-2 text-right font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tableRows.map(({ plot, area, transaction }, index) => (
                  <tr key={`${plot.villaKey}-${transaction?.date ?? "none"}-${transaction?.priceAed ?? 0}-${index}`} className="hover:bg-accent/20">
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground whitespace-nowrap">{transaction?.date ?? "—"}</td>
                    <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{plot.label}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{community.name}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs whitespace-nowrap">{formatArea(area, areaUnit)}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs whitespace-nowrap">{transaction ? transaction.priceAed.toLocaleString() : "No confirmed transaction"}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">{transaction ? (transaction.saleType === "primary" ? "Primary" : "Secondary") : "—"}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      {slug === "saadiyat-golf-views" && <a href={`/map?plot=${encodeURIComponent(plot.villaKey)}`} className="text-xs text-primary hover:underline">Map</a>}
                      {pdfIndex.get(plot.villaKey) && <a href={pdfIndex.get(plot.villaKey)!} target="_blank" rel="noopener noreferrer" className="ml-3 text-xs text-primary hover:underline">DCR</a>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No plots match your search.</p>
          <Button variant="outline" className="mt-4" onClick={reset}>
            Clear filter
          </Button>
        </div>
      )}
    </section>

  </div>
  );
}

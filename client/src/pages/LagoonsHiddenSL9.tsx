import { useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { ExternalLink, FileText, Map, Search } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import AreaFilterControls, { type AreaViewMode } from "@/components/AreaFilterControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditListingButton } from "@/components/ListingControls";
import { LAGOONS_HIDDEN_SL9_PLOTS, LAGOONS_HIDDEN_SL9_SUMMARY, type LagoonsHiddenSl9Plot } from "@/data/lagoonsHiddenSl9";
import { formatArea, isWithinAreaRange, matchesAreaQuery, type AreaUnit } from "@/lib/areaSearch";
import { getProjectViewMode } from "@/lib/viewMode";

function villaNumber(plot: LagoonsHiddenSl9Plot) {
  return plot.aldarPlotId.match(/VI-(\d+)$/)?.[1] ?? String(plot.plotNumber);
}

function scrollToPlot(plotNumber: number) {
  document.getElementById(`sl9-plot-${plotNumber}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export default function LagoonsHiddenSL9() {
  const searchString = useSearch();
  const [query, setQuery] = useState("");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqm");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [viewMode, setViewMode] = useState<AreaViewMode>(() => getProjectViewMode(searchString));

  const focusedKey = new URLSearchParams(searchString).get("plot");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return LAGOONS_HIDDEN_SL9_PLOTS.filter((plot) => {
      const land = { sqm: plot.landSqm, sqft: plot.landSqft };
      if (!isWithinAreaRange(land, areaUnit, areaMin, areaMax)) return false;
      if (!normalized) return true;
      return [
        `villa ${villaNumber(plot)}`,
        `plot ${plot.plotNumber}`,
        plot.aldarPlotId,
        plot.dcrId,
        plot.typology ?? "",
      ].some((value) => value.toLowerCase().includes(normalized)) || matchesAreaQuery(normalized, land);
    });
  }, [areaMax, areaMin, areaUnit, query]);

  const focused = focusedKey ? LAGOONS_HIDDEN_SL9_PLOTS.find((plot) => plot.villaKey === focusedKey) : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader subTitle="Saadiyat Lagoons · Hidden Phase SL9" back={{ href: "/", label: "Home" }} />
      <main className="container py-8 space-y-7">
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-primary">Saadiyat Lagoons · SDE3</p>
              <h1 className="mt-2 font-display text-3xl sm:text-5xl font-semibold">Hidden Phase SL9</h1>
              <p className="mt-3 max-w-3xl text-sm sm:text-base text-muted-foreground">
                {LAGOONS_HIDDEN_SL9_SUMMARY.officialPlotCount} plots sourced directly from individual DMT DCRs. Every marker uses an official DCR centroid and links back to its source document.
              </p>
            </div>
            <Button asChild className="gap-2 self-start lg:self-auto"><Link href="/map?plot=lagoons-hidden-sl9%2Fplot-2139"><Map className="h-4 w-4" />View on Map</Link></Button>
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Official DCR plots" value={String(LAGOONS_HIDDEN_SL9_SUMMARY.officialPlotCount)} />
            <Stat label="Phase" value="SL9" />
            <Stat label="Direct coordinates" value="257" />
            <Stat label="Availability" value="Not supplied" muted />
          </div>
        </section>

        {focused && <section className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5"><PlotDetails plot={focused} areaUnit={areaUnit} focused onDismiss={() => window.history.replaceState(null, "", "/lagoons-hidden-sl9")} /></section>}

        <section className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <div className="relative flex-1 min-w-[220px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Villa number, plot number, DCR or land area..." className="pl-9" /></div>
            <AreaFilterControls unit={areaUnit} onUnitChange={setAreaUnit} min={areaMin} max={areaMax} onMinChange={setAreaMin} onMaxChange={setAreaMax} viewMode={viewMode} onViewModeChange={setViewMode} compact />
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} / {LAGOONS_HIDDEN_SL9_PLOTS.length} official SL9 DCR plots shown. Green is reserved for documented Available/Listed inventory only; SL9 has no availability sheet yet.</p>
        </section>

        {viewMode === "cards" ? <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.map((plot) => <article key={plot.villaKey} id={`sl9-plot-${plot.plotNumber}`} className="rounded-xl border border-border bg-card p-5 scroll-mt-28"><PlotDetails plot={plot} areaUnit={areaUnit} onMapPlan={() => scrollToPlot(plot.plotNumber)} /></article>)}</section> : <section className="rounded-xl border border-border bg-card overflow-auto"><table className="w-full min-w-[960px] text-sm"><thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="text-left px-4 py-3">Villa / Plot</th><th className="text-left px-4 py-3">DCR</th><th className="text-left px-4 py-3">Typology</th><th className="text-right px-4 py-3">Land</th><th className="text-right px-4 py-3">Max GFA</th><th className="text-right px-4 py-3">Links</th></tr></thead><tbody>{filtered.map((plot) => <tr id={`sl9-plot-${plot.plotNumber}`} key={plot.villaKey} className="border-t border-border scroll-mt-28"><td className="px-4 py-3"><div className="font-semibold">Villa {villaNumber(plot)}</div><div className="text-xs text-muted-foreground">Plot {plot.plotNumber} · {plot.aldarPlotId}</div></td><td className="px-4 py-3 font-mono text-xs">{plot.dcrId}</td><td className="px-4 py-3">{plot.typology ?? "—"}</td><td className="px-4 py-3 text-right font-mono">{formatArea({ sqm: plot.landSqm, sqft: plot.landSqft }, areaUnit)}</td><td className="px-4 py-3 text-right font-mono">{plot.maxGfaSqm ? formatArea({ sqm: plot.maxGfaSqm, sqft: plot.maxGfaSqft ?? undefined }, areaUnit) : "—"}</td><td className="px-4 py-3 text-right whitespace-nowrap"><Link className="text-primary hover:underline" href={`/map?plot=${encodeURIComponent(plot.villaKey)}`}>Map</Link><a className="ml-3 text-primary hover:underline" href={plot.dcrUrl} target="_blank" rel="noreferrer">DCR</a><span className="inline-flex ml-3 align-middle"><EditListingButton villaKey={plot.villaKey} community="lagoons-hidden-sl9" villaLabel={`Lagoons · Villa ${villaNumber(plot)}`} /></span></td></tr>)}</tbody></table></section>}
      </main>
    </div>
  );
}

function Stat({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) { return <div className={`rounded-lg border p-3 ${muted ? "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/30" : "border-border bg-background"}`}><div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-1 text-lg font-semibold">{value}</div></div>; }

function PlotDetails({ plot, areaUnit, focused, onDismiss, onMapPlan }: { plot: LagoonsHiddenSl9Plot; areaUnit: AreaUnit; focused?: boolean; onDismiss?: () => void; onMapPlan?: () => void }) {
  return <div><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">{plot.aldarPlotId}</p><h2 className="font-display text-2xl font-semibold">Villa {villaNumber(plot)} <span className="text-base font-sans font-normal text-muted-foreground">· Plot {plot.plotNumber}</span></h2></div><span className="inline-flex rounded-full bg-slate-100 text-slate-600 px-2 py-1 text-[0.68rem] font-semibold">Reference only</span></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><Metric label="Land" value={formatArea({ sqm: plot.landSqm, sqft: plot.landSqft }, areaUnit)} /><Metric label="Max GFA" value={plot.maxGfaSqm ? formatArea({ sqm: plot.maxGfaSqm, sqft: plot.maxGfaSqft ?? undefined }, areaUnit) : "—"} /><Metric label="Typology" value={plot.typology ?? "—"} /><Metric label="Bedrooms" value="Not in DCR" /></div><p className="mt-3 text-[0.68rem] text-muted-foreground">Official DCR centroid from {plot.dcrId}. No availability, asking price, original price, or bedrooms are claimed until a source is added.</p><div className="mt-4 flex flex-wrap gap-2"><Button asChild size="sm" variant="outline"><Link href={`/map?plot=${encodeURIComponent(plot.villaKey)}`}><Map className="h-3.5 w-3.5 mr-1.5" />Map</Link></Button><Button asChild size="sm" variant="outline"><a href={plot.dcrUrl} target="_blank" rel="noreferrer"><FileText className="h-3.5 w-3.5 mr-1.5" />DCR</a></Button><Button asChild size="sm" variant="ghost"><a href={plot.googleMapsUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1.5" />Google Maps</a></Button><Button asChild size="sm" variant="ghost"><a href={plot.dmtUrl} target="_blank" rel="noreferrer">DMT</a></Button><EditListingButton villaKey={plot.villaKey} community="lagoons-hidden-sl9" villaLabel={`Lagoons · Villa ${villaNumber(plot)}`} />{focused && onDismiss && <Button size="sm" variant="ghost" onClick={onDismiss}>Close</Button>}{onMapPlan && <Button size="sm" variant="ghost" onClick={onMapPlan}>Find card</Button>}</div></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div><span className="text-xs text-muted-foreground">{label}</span><div className="font-semibold">{value}</div></div>; }

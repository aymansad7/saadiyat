import { useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { ExternalLink, FileText, Map, Search } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import AreaFilterControls, { type AreaViewMode } from "@/components/AreaFilterControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditListingButton, InteractiveMapLink } from "@/components/ListingControls";
import {
  BUILDING_PLOTS_SDW4,
  BUILDING_PLOTS_SDW4_UNAVAILABLE_DCRS,
  PRIVATE_OWNERS_VIP_PLOTS,
  PRIVATE_OWNERS_VIP_UNAVAILABLE_DCRS,
  type DcrCommunityPlot,
} from "@/data/privateOwnersVip";
import { formatArea, isWithinAreaRange, matchesAreaQuery, type AreaUnit } from "@/lib/areaSearch";
import { getProjectViewMode } from "@/lib/viewMode";

type CommunityKind = "private-owners-vip" | "building-plots-sdw4";

const CONFIG: Record<CommunityKind, {
  title: string;
  eyebrow: string;
  description: string;
  plots: DcrCommunityPlot[];
  unavailable: readonly string[];
}> = {
  "private-owners-vip": {
    title: "Private Owners VIP",
    eyebrow: "Saadiyat Beach District · SDN3",
    description: "Private VIP plots sourced directly from official DMT GeoSmart DCRs. Land area, maximum GFA and map positions use official DCR boundary data; no price or availability is claimed without a separate source.",
    plots: PRIVATE_OWNERS_VIP_PLOTS,
    unavailable: PRIVATE_OWNERS_VIP_UNAVAILABLE_DCRS,
  },
  "building-plots-sdw4": {
    title: "Building Plots SDW4",
    eyebrow: "NYU Precinct · Saadiyat Island",
    description: "Building development plots sourced directly from official DMT GeoSmart DCRs. Each card shows the official plot reference, site area, maximum GFA and official DCR centroid.",
    plots: BUILDING_PLOTS_SDW4,
    unavailable: BUILDING_PLOTS_SDW4_UNAVAILABLE_DCRS,
  },
};

export default function DcrCommunityPage({ kind }: { kind: CommunityKind }) {
  const config = CONFIG[kind];
  const searchString = useSearch();
  const [query, setQuery] = useState("");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqm");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [viewMode, setViewMode] = useState<AreaViewMode>(() => getProjectViewMode(searchString));
  const focusedKey = new URLSearchParams(searchString).get("plot");
  const focused = focusedKey ? config.plots.find((plot) => plot.villaKey === focusedKey) : undefined;
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return config.plots.filter((plot) => {
      const land = { sqm: plot.landSqm, sqft: plot.landSqft };
      return isWithinAreaRange(land, areaUnit, areaMin, areaMax) && (!normalized || [plot.plotNumber, plot.id, plot.projectLabel].some((value) => value.toLowerCase().includes(normalized)) || matchesAreaQuery(normalized, land));
    });
  }, [areaMax, areaMin, areaUnit, config.plots, query]);

  return <div className="min-h-screen bg-background text-foreground">
    <SiteHeader subTitle={config.title} back={{ href: "/", label: "Back to Saadiyat" }} />
    <main className="container py-8 space-y-7">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div><p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-primary">{config.eyebrow}</p><h1 className="mt-2 font-display text-3xl sm:text-5xl font-semibold">{config.title}</h1><p className="mt-3 max-w-3xl text-sm sm:text-base text-muted-foreground">{config.description}</p></div>
          <Button asChild className="gap-2 self-start lg:self-auto"><Link href={`/map?plot=${encodeURIComponent(config.plots[0]?.villaKey ?? "")}`}><Map className="h-4 w-4" />View on Map</Link></Button>
        </div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3"><Stat label="Official DCR plots" value={String(config.plots.length)} /><Stat label="Direct coordinates" value={String(config.plots.length)} /><Stat label="Availability" value="Not supplied" muted /><Stat label="Unavailable DCRs" value={String(config.unavailable.length)} muted /></div>
      </section>
      {focused && <section className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5"><PlotDetails plot={focused} community={kind} title={config.title} areaUnit={areaUnit} onClose={() => window.history.replaceState(null, "", `/${kind}`)} /></section>}
      <section className="rounded-xl border border-border bg-card p-4 space-y-3"><div className="flex flex-col xl:flex-row xl:items-center gap-3"><div className="relative flex-1 min-w-[220px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Plot number, DCR or land area..." className="pl-9" /></div><AreaFilterControls unit={areaUnit} onUnitChange={setAreaUnit} min={areaMin} max={areaMax} onMinChange={setAreaMin} onMaxChange={setAreaMax} viewMode={viewMode} onViewModeChange={setViewMode} compact /></div><p className="text-xs text-muted-foreground">{filtered.length} / {config.plots.length} official DCR plots shown. Green is reserved for documented available inventory.</p></section>
      {viewMode === "cards" ? <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.map((plot) => <article id={`${kind}-plot-${plot.id}`} key={plot.villaKey} className="rounded-xl border border-border bg-card p-5 scroll-mt-28"><PlotDetails plot={plot} community={kind} title={config.title} areaUnit={areaUnit} /></article>)}</section> : <PlotTable plots={filtered} community={kind} title={config.title} areaUnit={areaUnit} />}
      {filtered.length === 0 && <p className="text-center py-12 text-muted-foreground">No DCR plots match this search.</p>}
    </main>
  </div>;
}

function PlotTable({ plots, community, title, areaUnit }: { plots: DcrCommunityPlot[]; community: CommunityKind; title: string; areaUnit: AreaUnit }) {
  return <section className="rounded-xl border border-border bg-card overflow-auto"><table className="w-full min-w-[850px] text-sm"><thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="text-left px-4 py-3">Plot</th><th className="text-left px-4 py-3">DCR</th><th className="text-left px-4 py-3">Project</th><th className="text-right px-4 py-3">Land</th><th className="text-right px-4 py-3">Max GFA</th><th className="text-right px-4 py-3">Actions</th></tr></thead><tbody>{plots.map((plot) => <tr key={plot.villaKey} className="border-t border-border"><td className="px-4 py-3 font-semibold">{plot.plotNumber}</td><td className="px-4 py-3 font-mono text-xs">{plot.id}</td><td className="px-4 py-3 text-xs text-muted-foreground">{plot.projectLabel}</td><td className="px-4 py-3 text-right font-mono">{formatArea({ sqm: plot.landSqm, sqft: plot.landSqft }, areaUnit)}</td><td className="px-4 py-3 text-right font-mono">{formatArea({ sqm: plot.maxGfaSqm, sqft: plot.maxGfaSqft }, areaUnit)}</td><td className="px-4 py-3 text-right whitespace-nowrap"><Link className="text-primary hover:underline" href={`/${community}?plot=${encodeURIComponent(plot.villaKey)}`}>Details</Link><Link className="ml-3 text-primary hover:underline" href={`/map?plot=${encodeURIComponent(plot.villaKey)}`}>Map</Link><a className="ml-3 text-primary hover:underline" href={plot.dcrUrl} target="_blank" rel="noreferrer">DCR</a></td></tr>)}</tbody></table></section>;
}

function PlotDetails({ plot, community, title, areaUnit, onClose }: { plot: DcrCommunityPlot; community: CommunityKind; title: string; areaUnit: AreaUnit; onClose?: () => void }) {
  return <div><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">{plot.id} · {plot.projectLabel}</p><h2 className="font-display text-2xl font-semibold">Plot {plot.plotNumber}</h2></div><span className="inline-flex rounded-full bg-slate-100 text-slate-600 px-2 py-1 text-[0.68rem] font-semibold">Reference only</span></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><Metric label="Land" value={formatArea({ sqm: plot.landSqm, sqft: plot.landSqft }, areaUnit)} /><Metric label="Max GFA" value={formatArea({ sqm: plot.maxGfaSqm, sqft: plot.maxGfaSqft }, areaUnit)} /><Metric label="Availability" value="Not supplied" /><Metric label="Location" value="Official DCR centroid" /></div><p className="mt-3 text-[0.68rem] text-muted-foreground">No price, owner or availability is claimed until supplied by an authoritative source.</p><div className="mt-4 flex flex-wrap gap-2"><InteractiveMapLink villaKey={plot.villaKey} label="View on Map" /><Button asChild size="sm" variant="outline"><Link href={`/${community}?plot=${encodeURIComponent(plot.villaKey)}`}><FileText className="h-3.5 w-3.5 mr-1.5" />Full Details</Link></Button><Button asChild size="sm" variant="outline"><a href={plot.dcrUrl} target="_blank" rel="noreferrer"><FileText className="h-3.5 w-3.5 mr-1.5" />DCR</a></Button><Button asChild size="sm" variant="ghost"><a href={plot.googleMapsUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1.5" />Google Maps</a></Button><EditListingButton villaKey={plot.villaKey} community={community} villaLabel={`${title} · Plot ${plot.plotNumber}`} />{onClose && <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>}</div></div>;
}

function Stat({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) { return <div className={`rounded-lg border p-3 ${muted ? "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/30" : "border-border bg-background"}`}><div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-1 text-lg font-semibold">{value}</div></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div><span className="text-xs text-muted-foreground">{label}</span><div className="font-semibold">{value}</div></div>; }

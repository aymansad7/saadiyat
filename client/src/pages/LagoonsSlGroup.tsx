import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Map, Search } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import LagoonsVillaCard, { lagoonsVillaKey } from "@/components/LagoonsVillaCard";
import AreaFilterControls, { type AreaViewMode } from "@/components/AreaFilterControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListingIndex } from "@/hooks/useListingIndex";
import { trpc } from "@/lib/trpc";
import type { LagoonsVilla } from "@/data/lagoons";
import { formatArea, isWithinAreaRange, matchesAreaQuery, type AreaUnit } from "@/lib/areaSearch";
import { getProjectViewMode } from "@/lib/viewMode";

export const LAGOONS_SL_GROUPS = ["SL2", "SL3", "SL4", "SL5", "SL7", "SL8"] as const;
export type LagoonsSlPhase = (typeof LAGOONS_SL_GROUPS)[number];

const PHASE_INFO: Record<LagoonsSlPhase, { cluster: string; type: string; count: number; intro: string }> = {
  SL2: { cluster: "Ethir", type: "Ethir villas", count: 173, intro: "Phase explicitly identified in Aldar unit and building-section codes." },
  SL3: { cluster: "Al Sidr", type: "Al Sidr villas", count: 336, intro: "Phase explicitly identified in Aldar unit and building-section codes." },
  SL4: { cluster: "Al Ghaf", type: "Wilds villas", count: 147, intro: "Phase explicitly identified in Aldar unit and building-section codes." },
  SL5: { cluster: "Al Sidr", type: "Al Sidr villas", count: 283, intro: "Phase explicitly identified in Aldar unit and building-section codes." },
  SL7: { cluster: "Al Ghaf", type: "Wilds villas", count: 235, intro: "Phase explicitly identified in Aldar unit and building-section codes." },
  SL8: { cluster: "Al Ghaf", type: "Wilds villas", count: 375, intro: "Phase explicitly identified in Aldar unit and building-section codes." },
};

export function getLagoonsSlPhase(villa: LagoonsVilla): LagoonsSlPhase | null {
  const evidence = [villa.aldar_data?.building_section, villa.aldar_data?.aldar_unit_name].filter(Boolean).join(" · ");
  const match = evidence.match(/(?:^|[-\s])SL(2|3|4|5|7|8)(?:[-\s]|$)/i);
  return match ? (`SL${match[1]}` as LagoonsSlPhase) : null;
}

export default function LagoonsSlGroup({ phase }: { phase: LagoonsSlPhase }) {
  const { data: raw, isLoading } = trpc.lagoons.villasByPhase.useQuery({ phase });
  const all = (raw ?? []) as LagoonsVilla[];
  const { index: listingIndex } = useListingIndex({ prefix: "saadiyat-lagoons/" });
  const [query, setQuery] = useState("");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqm");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [viewMode, setViewMode] = useState<AreaViewMode>(() => getProjectViewMode(window.location.search));
  const info = PHASE_INFO[phase];
  const villas = useMemo(() => all.filter((villa) => getLagoonsSlPhase(villa) === phase), [all, phase]);
  const types = useMemo(() => Array.from(new Set(villas.map((villa) => villa.model || villa.variant || `${villa.bedrooms ?? "—"}BR`).filter(Boolean))).sort(), [villas]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return villas.filter((villa) => {
      const land = { sqm: villa.plot_area_sqm };
      return isWithinAreaRange(land, areaUnit, areaMin, areaMax) && (!normalized || [villa.short_name, villa.unit_name, villa.unit_number, villa.model ?? "", villa.variant ?? "", String(villa.bedrooms ?? "")].some((value) => value.toLowerCase().includes(normalized)) || matchesAreaQuery(normalized, land));
    });
  }, [areaMax, areaMin, areaUnit, query, villas]);

  return <div className="min-h-screen bg-background text-foreground"><SiteHeader subTitle={`Saadiyat Lagoons · ${phase}`} back={{ href: "/saadiyat-lagoons", label: "Back to Lagoons" }} /><main className="container py-8 space-y-7">
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-sm"><div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5"><div><p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-primary">Saadiyat Lagoons · Aldar-coded phase</p><h1 className="mt-2 font-display text-3xl sm:text-5xl font-semibold">{phase} <span className="text-muted-foreground">· {info.cluster}</span></h1><p className="mt-3 max-w-3xl text-sm sm:text-base text-muted-foreground">{info.intro} Type: {info.type}. Every villa retains its original unit code, card, details and map location.</p></div><Button asChild className="gap-2 self-start lg:self-auto"><Link href={`/map?phase=${phase.toLowerCase()}`}><Map className="h-4 w-4" />View {phase} on Map</Link></Button></div><div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3"><Stat label="Villas" value={String(isLoading ? info.count : villas.length)} /><Stat label="Cluster" value={info.cluster} /><Stat label="Documented types" value={String(types.length)} /><Stat label="Availability" value="Source-based" muted /></div></section>
    <section className="rounded-xl border border-border bg-card p-4 space-y-3"><div className="flex flex-col xl:flex-row xl:items-center gap-3"><div className="relative flex-1 min-w-[220px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Villa number, type, model or land area..." className="pl-9" /></div><AreaFilterControls unit={areaUnit} onUnitChange={setAreaUnit} min={areaMin} max={areaMax} onMinChange={setAreaMin} onMaxChange={setAreaMax} viewMode={viewMode} onViewModeChange={setViewMode} compact /></div><p className="text-xs text-muted-foreground">{filtered.length} / {villas.length} villas in {phase}. Types: {types.join(" · ") || "Not supplied"}.</p></section>
    {isLoading ? <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">Loading {phase} villas…</div> : viewMode === "cards" ? <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.map((villa) => <LagoonsVillaCard key={villa.id} villa={villa} listing={listingIndex.get(lagoonsVillaKey(villa))} areaUnit={areaUnit} />)}</section> : <section className="rounded-xl border border-border bg-card overflow-auto"><table className="w-full min-w-[920px] text-sm"><thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="text-left px-4 py-3">Villa</th><th className="text-left px-4 py-3">Type</th><th className="text-right px-4 py-3">Land</th><th className="text-right px-4 py-3">Bedrooms</th><th className="text-right px-4 py-3">Links</th></tr></thead><tbody>{filtered.map((villa) => <tr key={villa.id} className="border-t border-border"><td className="px-4 py-3"><div className="font-semibold">{villa.short_name}</div><div className="font-mono text-xs text-muted-foreground">{villa.aldar_data?.aldar_unit_name ?? villa.unit_name}</div></td><td className="px-4 py-3">{villa.model ?? villa.variant ?? "—"}</td><td className="px-4 py-3 text-right font-mono">{formatArea({ sqm: villa.plot_area_sqm }, areaUnit)}</td><td className="px-4 py-3 text-right">{villa.bedrooms ?? "—"}</td><td className="px-4 py-3 text-right"><Link className="text-primary hover:underline" href={`/saadiyat-lagoons/${villa.cluster}/${encodeURIComponent(villa.unit_name)}`}>Details</Link><Link className="ml-3 text-primary hover:underline" href={`/map?plot=${encodeURIComponent(`lagoons/${villa.unit_name}`)}`}>Map</Link></td></tr>)}</tbody></table></section>}
  </main></div>;
}

function Stat({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) { return <div className={`rounded-lg border p-3 ${muted ? "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/30" : "border-border bg-background"}`}><div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-1 text-lg font-semibold">{value}</div></div>; }

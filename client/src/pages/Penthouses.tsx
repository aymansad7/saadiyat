import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Building2, Crown, ExternalLink, Gem, Search, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { fmtAed, fmtArea } from "@/data/aldar/format";

export default function Penthouses() {
  const { data, isLoading } = trpc.penthouses.list.useQuery();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");

  const projects = useMemo(() => Array.from(new Set((data?.units ?? []).map(unit => unit.projectName))).sort(), [data?.units]);
  const units = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (data?.units ?? []).filter(unit => {
      const matchesProject = projectFilter === "all" || unit.projectName === projectFilter;
      const searchable = `${unit.projectName} ${unit.buildingName} ${unit.unitName} ${unit.unitType ?? ""} ${unit.bedrooms ?? ""}`.toLowerCase();
      return matchesProject && (!term || searchable.includes(term));
    });
  }, [data?.units, projectFilter, query]);

  return (
    <div className="min-h-screen bg-[#0c1720] text-slate-100">
      <SiteHeader subTitle="Private Collection" back={{ href: "/aldar-saadiyat", label: "Aldar Saadiyat" }} />
      <main>
        <section className="border-b border-amber-200/15 bg-[radial-gradient(circle_at_75%_5%,rgba(187,139,68,0.22),transparent_34%),linear-gradient(135deg,#0c1720_0%,#162937_55%,#0d1922_100%)]">
          <div className="container py-12 sm:py-16">
            <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-mono uppercase tracking-[0.25em] text-amber-200/80">
              <Crown className="h-3.5 w-3.5" /> Aldar private collection
            </div>
            <div className="mt-4 max-w-3xl">
              <h1 className="font-display text-5xl leading-[0.94] sm:text-7xl">Penthouses</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">A focused, client-ready view of Aldar units officially classified as penthouses. Every row opens the full unit card with documented specifications, official pricing where published, and verified media where available.</p>
            </div>
            {isLoading ? <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"><Skeleton className="h-20 bg-white/10" /><Skeleton className="h-20 bg-white/10" /><Skeleton className="h-20 bg-white/10" /><Skeleton className="h-20 bg-white/10" /></div> : data && <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-amber-200/20 bg-amber-200/15 sm:grid-cols-4">
              <SummaryStat label="Private residences" value={data.summary.totalUnits.toLocaleString()} />
              <SummaryStat label="Aldar projects" value={data.summary.totalProjects.toLocaleString()} />
              <SummaryStat label="Officially priced" value={data.summary.pricedUnits.toLocaleString()} />
              <SummaryStat label="Published price range" value={data.summary.priceMinAed != null ? `AED ${fmtAed(data.summary.priceMinAed)} – ${fmtAed(data.summary.priceMaxAed)}` : "Not published"} compact />
            </div>}
          </div>
        </section>

        <section className="bg-[#f8f6f1] text-slate-950">
          <div className="container py-8 sm:py-10">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[0.66rem] font-mono uppercase tracking-[0.2em] text-amber-700"><Gem className="h-3.5 w-3.5" /> Private inventory</div>
                <h2 className="mt-1 font-display text-3xl">Compare the collection</h2>
              </div>
              <div className="text-sm text-slate-500">{units.length.toLocaleString()} units shown</div>
            </div>
            <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_16rem]">
              <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search project, residence, or unit…" className="h-11 border-slate-300 bg-white pl-10" /></div>
              <Select value={projectFilter} onValueChange={setProjectFilter}><SelectTrigger className="h-11 border-slate-300 bg-white"><SelectValue placeholder="All projects" /></SelectTrigger><SelectContent><SelectItem value="all">All Aldar projects</SelectItem>{projects.map(project => <SelectItem key={project} value={project}>{project}</SelectItem>)}</SelectContent></Select>
            </div>
            {isLoading ? <div className="space-y-2">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-16 bg-slate-200" />)}</div> : units.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No penthouse matches this search.</div> : <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,32,0.08)]">
              <table className="w-full min-w-[1060px] text-left">
                <thead className="bg-[#132331] text-[0.65rem] font-mono uppercase tracking-[0.16em] text-slate-300"><tr><th className="px-5 py-4">Residence</th><th className="px-4 py-4">Unit</th><th className="px-4 py-4">Bedrooms / Type</th><th className="px-4 py-4">Documented area</th><th className="px-4 py-4">Official price</th><th className="px-4 py-4">AED / sqft</th><th className="px-4 py-4">AED / m²</th><th className="px-4 py-4 text-right">Details</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {units.map(unit => <tr key={`${unit.dataset}-${unit.projectSlug}-${unit.unitName}`} onClick={() => setLocation(unit.href)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") setLocation(unit.href); }} role="link" tabIndex={0} className="cursor-pointer transition-colors hover:bg-amber-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
                    <td className="px-5 py-4"><div className="font-display text-lg text-slate-950">{unit.projectName}</div><div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500"><Building2 className="h-3 w-3" /> {unit.buildingName}</div></td>
                    <td className="px-4 py-4 font-mono text-sm font-medium text-slate-900">{unit.unitName}</td>
                    <td className="px-4 py-4"><div className="text-sm font-medium">{unit.bedrooms ? `${unit.bedrooms} BR` : "—"}</div><div className="mt-0.5 max-w-48 truncate text-xs text-slate-500">{unit.unitType ?? "Penthouse"}</div></td>
                    <td className="px-4 py-4 text-sm"><div>{fmtArea(unit.areaSqm)}</div><div className="mt-0.5 text-xs text-slate-500">{unit.areaSource === "saleable" ? "Saleable" : unit.areaSource === "total" ? "Total / BUA" : "Not published"}</div></td>
                    <td className="px-4 py-4 font-display text-base">{unit.priceAed != null ? `AED ${fmtAed(unit.priceAed)}` : "Not published"}</td>
                    <td className="px-4 py-4 font-mono text-sm">{unit.pricePerSqftAed != null ? `AED ${fmtAed(unit.pricePerSqftAed)}` : "—"}</td>
                    <td className="px-4 py-4 font-mono text-sm">{unit.pricePerSqmAed != null ? `AED ${fmtAed(unit.pricePerSqmAed)}` : "—"}</td>
                    <td className="px-5 py-4 text-right"><Link href={unit.href} onClick={event => event.stopPropagation()} className="inline-flex items-center gap-1 text-sm font-medium text-amber-800 hover:text-amber-950">Open card <ExternalLink className="h-3.5 w-3.5" /></Link></td>
                  </tr>)}
                </tbody>
              </table>
            </div>}
            <p className="mt-4 text-xs leading-5 text-slate-500">Prices and price-density figures appear only when Aldar publishes both a valid unit price and a documented saleable or total area. Project-gallery images, where present on a unit card, remain clearly labelled as category imagery rather than exact-unit imagery.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function SummaryStat({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return <div className="min-h-22 bg-[#132331] px-4 py-4 sm:px-5"><div className="text-[0.6rem] font-mono uppercase tracking-[0.16em] text-slate-400">{label}</div><div className={`mt-2 font-display text-amber-100 ${compact ? "text-base leading-snug" : "text-3xl"}`}>{value}</div></div>;
}

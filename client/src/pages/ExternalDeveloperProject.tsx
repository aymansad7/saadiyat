import { useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, FileSpreadsheet, MapPin, Search } from "lucide-react";
import { Link, useRoute } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

function fmtArea(value: number | null | undefined) {
  return typeof value === "number" ? `${new Intl.NumberFormat("en-AE", { maximumFractionDigits: 2 }).format(value)} sqft` : "—";
}

export default function ExternalDeveloperProject() {
  const [, params] = useRoute("/non-aldar-projects/:project");
  const projectSlug = params?.project ?? "";
  const query = trpc.externalDevelopers.getProject.useQuery({ projectSlug }, { enabled: Boolean(projectSlug) });
  const [search, setSearch] = useState("");
  const units = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return query.data?.units ?? [];
    return (query.data?.units ?? []).filter(unit => [unit.unitNumber, unit.propertyType, unit.floorLabel, unit.viewLabel].some(value => String(value ?? "").toLowerCase().includes(needle)));
  }, [query.data?.units, search]);
  const project = query.data?.project;
  return <div className="min-h-screen bg-[#f7f5f0]">
    <SiteHeader subTitle={project ? `Emirates · ${project.displayName}` : "مشاريع غير الدار"} back={{ href: "/non-aldar-projects", label: "مشاريع غير الدار" }} />
    <main className="container py-8 sm:py-10">
      {query.isLoading ? <Skeleton className="h-[420px] rounded-xl" /> : project ? <>
        <section className="rounded-2xl border border-[#d7c8a7] bg-white p-6 shadow-[0_16px_40px_rgba(39,30,15,0.08)] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6"><div><div className="text-[0.66rem] font-mono uppercase tracking-[0.18em] text-amber-800">Emirates · non-Aldar source inventory</div><h1 className="mt-3 font-display text-4xl text-slate-950">{project.displayName}</h1><div className="mt-3 flex items-center gap-2 text-sm text-slate-600"><MapPin className="h-4 w-4 text-amber-700" /> {project.locationLabel}</div></div><div className="rounded-xl bg-[#10212d] px-5 py-4 text-white"><div className="text-[0.6rem] font-mono uppercase tracking-[0.16em] text-amber-200">Source available</div><div className="mt-1 font-display text-3xl">{project.sourceAvailableCount}</div><div className="mt-1 text-xs text-slate-300">of {project.sourceRowCount} source rows</div></div></div>
          <div className="mt-7 grid gap-4 border-t border-slate-100 pt-6 text-sm sm:grid-cols-3"><div><div className="text-xs uppercase tracking-[0.14em] text-slate-500">Workbook project</div><div className="mt-1 font-medium text-slate-900">{project.sourceProjectName}</div></div><div><div className="text-xs uppercase tracking-[0.14em] text-slate-500">Source file</div><div className="mt-1 font-medium text-slate-900">{project.sourceWorkbook}</div></div><div><div className="text-xs uppercase tracking-[0.14em] text-slate-500">Pricing</div><div className="mt-1 font-medium text-slate-900">Not supplied in workbook</div></div></div>
        </section>
        <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5"><div><div className="flex items-center gap-2 text-[0.65rem] font-mono uppercase tracking-[0.16em] text-amber-800"><FileSpreadsheet className="h-3.5 w-3.5" /> Source units</div><p className="mt-1 text-sm text-slate-600">All values retain the workbook’s original field labels.</p></div><div className="relative w-full sm:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search unit, type, floor or view" className="pl-9" /></div></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[960px] text-left"><thead className="bg-[#10212d] text-[0.64rem] font-mono uppercase tracking-[0.14em] text-slate-200"><tr><th className="px-5 py-4">Unit</th><th className="px-5 py-4">Source status</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Internal area*</th><th className="px-5 py-4">External area*</th><th className="px-5 py-4">Total area*</th><th className="px-5 py-4">View</th><th className="px-5 py-4">Source</th></tr></thead><tbody>{units.map(unit => <tr key={unit.id} className="border-b border-slate-100 last:border-0 hover:bg-amber-50/35"><td className="px-5 py-4"><Link href={`/non-aldar-projects/${project.projectSlug}/${unit.sourceId}`} className="font-display text-lg text-slate-950 underline decoration-amber-700/30 underline-offset-4 hover:decoration-amber-700">{unit.unitNumber}</Link>{unit.floorLabel && <div className="mt-1 text-xs text-slate-500">Floor {unit.floorLabel}</div>}</td><td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">{unit.sourceStatus ?? "Not stated"}</span></td><td className="max-w-[260px] px-5 py-4 text-sm text-slate-700">{unit.propertyType ?? "—"}</td><td className="px-5 py-4 font-mono text-sm text-slate-800">{fmtArea(unit.internalAreaSqft)}</td><td className="px-5 py-4 font-mono text-sm text-slate-800">{fmtArea(unit.externalAreaSqft)}</td><td className="px-5 py-4 font-mono text-sm text-slate-800">{fmtArea(unit.totalAreaSqft)}</td><td className="px-5 py-4 text-sm text-slate-700">{unit.viewLabel ?? "—"}</td><td className="px-5 py-4">{unit.sourceExplorerUrl ? <a href={unit.sourceExplorerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-amber-800 hover:text-amber-950"><ExternalLink className="h-3.5 w-3.5" /> Explorer</a> : "—"}</td></tr>)}</tbody></table></div>
          <p className="border-t border-slate-100 px-5 py-4 text-xs leading-6 text-slate-500">* Area values are shown exactly from source fields labelled “sqft” in the supplied workbook; no conversion or data correction has been inferred. Prices and payment plans are absent from this source.</p>
        </section>
      </> : <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900">Project not found in the imported Emirates source.</div>}
    </main>
  </div>;
}

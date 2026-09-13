import { Building2, FileSpreadsheet, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

function fmtCount(value: number) {
  return new Intl.NumberFormat("en-AE").format(value);
}

export default function ExternalDeveloperProjects() {
  const list = trpc.externalDevelopers.list.useQuery();
  const totalRows = list.data?.projects.reduce((sum, project) => sum + project.sourceRowCount, 0) ?? 0;
  return <div className="min-h-screen bg-[#f7f5f0]">
    <SiteHeader subTitle="مشاريع غير الدار" />
    <section className="border-b border-[#d8c69d]/40 bg-[radial-gradient(circle_at_78%_12%,rgba(174,127,54,0.18),transparent_35%),linear-gradient(135deg,#10212d,#1b3544)] text-white">
      <div className="container py-12 sm:py-16">
        <div className="flex items-center gap-2 text-[0.68rem] font-mono uppercase tracking-[0.2em] text-amber-200"><ShieldCheck className="h-3.5 w-3.5" /> Master-only source inventory</div>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl">مشاريع غير الدار</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">مجموعة مستقلة للمطوّر <strong className="text-white">Emirates</strong>. تعتمد البطاقات على ملف المالك المرفوع، وتُفصل تمامًا عن مخزون Aldar وأسعاره الرسمية.</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm"><span className="rounded-full border border-amber-100/25 bg-white/5 px-4 py-2">{list.isLoading ? "…" : `${fmtCount(totalRows)} source rows`}</span><span className="rounded-full border border-amber-100/25 bg-white/5 px-4 py-2">3 requested projects</span><span className="rounded-full border border-amber-100/25 bg-white/5 px-4 py-2">No prices supplied</span></div>
      </div>
    </section>
    <main className="container py-9 sm:py-12">
      <div className="mb-6 flex items-center gap-2 text-[0.7rem] font-mono uppercase tracking-[0.18em] text-amber-800"><FileSpreadsheet className="h-3.5 w-3.5" /> Owner-supplied workbook · source-labelled fields</div>
      <div className="grid gap-5 md:grid-cols-3">
        {list.isLoading ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-64 rounded-xl" />) : list.data?.projects.map(project => <Link key={project.projectSlug} href={`/non-aldar-projects/${project.projectSlug}`} className="group rounded-xl border border-[#d7c8a7] bg-white p-6 shadow-[0_14px_35px_rgba(39,30,15,0.08)] transition hover:-translate-y-0.5 hover:border-amber-700/50 hover:shadow-[0_20px_45px_rgba(39,30,15,0.14)]">
          <div className="flex items-start justify-between gap-3"><div><div className="text-[0.64rem] font-mono uppercase tracking-[0.16em] text-amber-800">Emirates · source project</div><h2 className="mt-2 font-display text-3xl text-slate-950">{project.displayName}</h2></div><Building2 className="h-6 w-6 text-amber-700" /></div>
          <div className="mt-5 flex items-center gap-2 text-sm text-slate-600"><MapPin className="h-4 w-4 text-amber-700" /> {project.locationLabel}</div>
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">Workbook project: <span className="font-medium text-slate-900">{project.sourceProjectName}</span></p>
          <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-lg bg-emerald-50 p-3"><div className="text-[0.6rem] font-mono uppercase tracking-[0.14em] text-emerald-700">Source available</div><div className="mt-1 font-display text-2xl text-emerald-900">{fmtCount(project.sourceAvailableCount)}</div></div><div className="rounded-lg bg-slate-50 p-3"><div className="text-[0.6rem] font-mono uppercase tracking-[0.14em] text-slate-600">Source rows</div><div className="mt-1 font-display text-2xl text-slate-900">{fmtCount(project.sourceRowCount)}</div></div></div>
          <div className="mt-5 text-sm font-medium text-amber-800 group-hover:text-amber-950">Open project inventory →</div>
        </Link>)}</div>
      <p className="mt-8 max-w-3xl text-xs leading-6 text-slate-500">Availability and all area fields are preserved as labelled in the supplied workbook. This source contains no price, payment-plan, map-coordinate or developer-verified availability field; those values are intentionally not inferred.</p>
    </main>
  </div>;
}

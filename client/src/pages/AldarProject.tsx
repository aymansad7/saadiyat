/**
 * /aldar-saadiyat/:project — Project page with buildings list via tRPC.
 */
import { useMemo, useState } from "react";
import { Redirect, useParams, Link } from "wouter";
import { Building2, ArrowRight, Sparkles, ExternalLink, Info } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Switch } from "@/components/ui/switch";
import { confirmedAvailableCount } from "@/data/aldar";
import type { StatusBreakdown } from "@/data/aldar";
import { buildingDisplayName } from "@/data/aldar/buildingLabels";
import { AldarStatusPills } from "@/components/AldarStatusPills";
import { trpc } from "@/lib/trpc";

type SourceStatusFilter = "all" | keyof Omit<StatusBreakdown, "total">;

const SOURCE_STATUS_OPTIONS: Array<{
  key: SourceStatusFilter;
  label: string;
  className: string;
}> = [
  { key: "all", label: "All", className: "border-border bg-muted text-muted-foreground" },
  { key: "available", label: "Available", className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { key: "new", label: "New", className: "border-sky-500/50 bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  { key: "booked", label: "Booked", className: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { key: "blocked", label: "Blocked", className: "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-300" },
  { key: "reserved", label: "Reserved", className: "border-violet-500/50 bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  { key: "sold", label: "Sold", className: "border-rose-400/40 bg-rose-500/5 text-rose-700 dark:text-rose-300" },
];

export function filterProjectBuildingsByStatus<T extends { breakdown: StatusBreakdown }>(
  buildings: T[],
  filter: SourceStatusFilter,
) {
  if (filter === "all") return buildings;
  return buildings.filter(building => building.breakdown[filter] > 0);
}

function ProjectSourceStatusSummary({
  breakdown,
  selected,
  onSelect,
}: {
  breakdown: StatusBreakdown;
  selected: SourceStatusFilter;
  onSelect: (filter: SourceStatusFilter) => void;
}) {
  return (
    <section className="mt-5 rounded-md border border-border bg-background/65 p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[0.66rem] font-mono uppercase tracking-[0.18em] text-primary">Official Aldar source status</div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Tap a status to show the buildings containing those exact official records. These are Aldar source labels, separate from NAS resale availability.</p>
        </div>
        <div className="shrink-0 text-xs font-mono text-muted-foreground">{breakdown.total.toLocaleString()} stored units</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {SOURCE_STATUS_OPTIONS.map(option => {
          const count = option.key === "all" ? breakdown.total : breakdown[option.key];
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onSelect(option.key)}
              aria-pressed={selected === option.key}
              className={`inline-flex min-h-8 items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 ${option.className} ${selected === option.key ? "ring-2 ring-primary/35" : "opacity-90 hover:opacity-100"}`}
            >
              <span className="num-display font-semibold">{count.toLocaleString()}</span>
              <span>{option.label}</span>
            </button>
          );
        })}
        {breakdown.other > 0 && <span className="inline-flex min-h-8 items-center gap-1.5 rounded-sm border border-border bg-muted/60 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground"><span className="num-display font-semibold">{breakdown.other.toLocaleString()}</span><span>Not stated</span></span>}
      </div>
    </section>
  );
}

function fmtAed(value: number | null | undefined) {
  return value == null ? "Not published" : `AED ${value.toLocaleString("en-US")}`;
}

function ProjectReleaseSummary({ summary }: { summary: any }) {
  if (!summary) return null;
  const typologies = Array.isArray(summary.typologies) ? summary.typologies : [];
  return (
    <section className="border-b border-border bg-primary/[0.025]">
      <div className="container py-6 sm:py-8">
        <div className="flex items-start gap-3 rounded-md border border-primary/20 bg-card/70 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <div className="text-[0.68rem] font-mono uppercase tracking-[0.18em] text-primary">Release status</div>
            <p className="mt-1 text-sm text-foreground">{summary.phase_status ?? "Project release information"}</p>
            {summary.unit_registry_status && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{summary.unit_registry_status}</p>}
            {summary.price_notice && <p className="mt-2 text-xs leading-relaxed text-amber-800 dark:text-amber-200">Pricing: {summary.price_notice}</p>}
          </div>
        </div>

        {typologies.length > 0 && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {typologies.map((type: any) => (
              <article key={type.label} className="rounded-md border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-xl text-foreground">{type.label}</div>
                    <div className="mt-1 text-[0.68rem] font-mono uppercase tracking-[0.16em] text-muted-foreground">{type.count} planned villas</div>
                  </div>
                  <div className="rounded-sm border border-border bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">{type.bedrooms} BR</div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                  <div><dt className="text-[0.62rem] font-mono uppercase tracking-[0.14em] text-muted-foreground">Villa area</dt><dd className="mt-1 text-foreground">{type.villa_area_sqm == null ? "Not published" : `${type.villa_area_sqm.toLocaleString()} m²`}</dd></div>
                  <div><dt className="text-[0.62rem] font-mono uppercase tracking-[0.14em] text-muted-foreground">Plot area</dt><dd className="mt-1 text-foreground">{type.plot_area_sqm == null ? "Not published" : `${type.plot_area_sqm.toLocaleString()} m²`}</dd></div>
                  <div className="col-span-2"><dt className="text-[0.62rem] font-mono uppercase tracking-[0.14em] text-muted-foreground">Starting price</dt><dd className="mt-1 text-foreground">{fmtAed(type.starting_price_aed)}{type.price_status && <span className="ml-1 text-xs text-muted-foreground">· {type.price_status}</span>}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {summary.location && <span>Location: {summary.location}</span>}
          {summary.developer && <span>Developer: {summary.developer}</span>}
          {summary.payment_plan && <span>Payment plan: {summary.payment_plan}</span>}
          {summary.handover && <span>Handover: {summary.handover}</span>}
          {summary.source_urls?.map((source: any) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
              {source.label}{source.classification ? ` · ${source.classification}` : ""}<ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectStartingPrices({ pricing }: { pricing: any }) {
  const prices = Array.isArray(pricing?.prices) ? pricing.prices : [];
  if (!pricing || prices.length === 0) return null;
  return (
    <section className="border-b border-border bg-amber-500/[0.035]">
      <div className="container py-6 sm:py-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[0.68rem] font-mono uppercase tracking-[0.18em] text-amber-800 dark:text-amber-200">Launch pricing</div>
            <h2 className="mt-1 font-display text-2xl text-foreground">{pricing.label ?? "Project starting prices"}</h2>
          </div>
          {pricing.payment_plan && <div className="text-sm text-muted-foreground">Payment plan: <span className="text-foreground">{pricing.payment_plan}</span></div>}
        </div>
        {pricing.price_notice && <p className="mt-3 max-w-4xl text-sm leading-relaxed text-muted-foreground">{pricing.price_notice}</p>}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {prices.map((price: any) => (
            <article key={`${price.unit_type}-${price.bedrooms ?? ""}`} className="rounded-md border border-amber-900/15 bg-card p-4">
              <div className="text-[0.65rem] uppercase tracking-[0.16em] font-mono text-muted-foreground">{price.unit_type}</div>
              <div className="mt-2 font-display text-2xl text-foreground">from {fmtAed(price.starting_price_aed)}</div>
              {price.bedrooms != null && <div className="mt-1 text-xs text-muted-foreground">{price.bedrooms} bedrooms</div>}
            </article>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {pricing.source && <span>Source: {pricing.source}</span>}
          {pricing.captured_at && <span>Captured: {pricing.captured_at}</span>}
          {pricing.source_url && <a href={pricing.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">View source <ExternalLink className="h-3 w-3" /></a>}
        </div>
      </div>
    </section>
  );
}

export default function AldarProject() {
  const { project: slug } = useParams<{ project: string }>();
  const { data: project, isLoading } = trpc.aldarSaadiyat.getProject.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug },
  );
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sourceStatusFilter, setSourceStatusFilter] = useState<SourceStatusFilter>("all");

  const projectBreakdown = useMemo<StatusBreakdown>(() => {
    const total: StatusBreakdown = { available: 0, new: 0, booked: 0, blocked: 0, reserved: 0, sold: 0, other: 0, total: 0 };
    for (const building of project?.buildings ?? []) {
      const breakdown = building.breakdown as StatusBreakdown;
      total.available += breakdown.available;
      total.new += breakdown.new;
      total.booked += breakdown.booked;
      total.blocked += breakdown.blocked;
      total.reserved += breakdown.reserved;
      total.sold += breakdown.sold;
      total.other += breakdown.other;
      total.total += breakdown.total;
    }
    return total;
  }, [project]);

  const buildings = useMemo(() => {
    if (!project) return [];
    const sourceFiltered = filterProjectBuildingsByStatus(project.buildings as Array<{ breakdown: StatusBreakdown }>, sourceStatusFilter);
    if (availableOnly) return sourceFiltered.filter((b: any) => confirmedAvailableCount(b.breakdown) > 0);
    return sourceFiltered;
  }, [project, availableOnly, sourceStatusFilter]);

  if (isLoading) {
    return (<div className="min-h-screen bg-background flex flex-col"><SiteHeader /><div className="flex-1 flex items-center justify-center"><div className="text-muted-foreground font-mono text-sm">Loading...</div></div></div>);
  }
  if (!project) return <Redirect to="/aldar-saadiyat" />;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle={`Aldar · ${project.name}`} />
      <section className="border-b border-border bg-card/40">
        <div className="container py-8 sm:py-10">
          <Link href="/aldar-saadiyat" className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary hover:underline mb-2 inline-block">← All projects</Link>
          <h1 className="font-display text-3xl sm:text-[2.4rem] leading-tight text-foreground">{project.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {project.unit_count === 0 && (project as any).release_summary?.total_villas
              ? `${(project as any).release_summary.total_villas} planned villas · official unit registry pending`
              : `${project.building_count} buildings · ${project.unit_count} units`}
          </p>
          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={availableOnly} onCheckedChange={setAvailableOnly} />
              <span className="text-muted-foreground">Available only</span>
            </label>
          </div>
          <ProjectSourceStatusSummary breakdown={projectBreakdown} selected={sourceStatusFilter} onSelect={setSourceStatusFilter} />
        </div>
      </section>
      <ProjectReleaseSummary summary={(project as any).release_summary} />
      <ProjectStartingPrices pricing={(project as any).published_starting_prices} />
      <section className="container py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.map((b: any) => {
            const bd = b.breakdown as StatusBreakdown;
            const available = confirmedAvailableCount(bd);
            const bld = buildingDisplayName(b.name);
            return (
              <Link key={b.slug} href={`/aldar-saadiyat/${slug}/${b.slug}`} className="group block rounded-md border border-border bg-card overflow-hidden hover:border-primary/60 transition-colors">
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-mono text-primary"><Building2 className="h-3 w-3" />{bld.primary}</div>
                    {available > 0 ? (<span className="text-[0.65rem] font-mono uppercase border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-sm">{available} available</span>)
                      : bd.new > 0 ? (<span className="text-[0.65rem] font-mono uppercase border border-sky-500/50 bg-sky-500/10 text-sky-700 px-2 py-0.5 rounded-sm">{bd.new} new · source</span>)
                      : bd.booked > 0 ? (<span className="text-[0.65rem] font-mono uppercase border border-amber-500/50 bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-sm">{bd.booked} booked · source</span>)
                      : bd.blocked > 0 ? (<span className="text-[0.65rem] font-mono uppercase border border-orange-500/50 bg-orange-500/10 text-orange-700 px-2 py-0.5 rounded-sm">{bd.blocked} blocked · source</span>)
                      : bd.reserved > 0 ? (<span className="text-[0.65rem] font-mono uppercase border border-violet-500/50 bg-violet-500/10 text-violet-700 px-2 py-0.5 rounded-sm">{bd.reserved} reserved · source</span>)
                      : bd.sold > 0 ? (<span className="text-[0.65rem] font-mono uppercase border border-rose-400/40 bg-rose-500/5 text-rose-700 px-2 py-0.5 rounded-sm">{bd.sold} sold · source</span>)
                      : (<span className="text-[0.65rem] font-mono uppercase border border-border bg-muted text-muted-foreground px-2 py-0.5 rounded-sm">No source state published</span>)}
                  </div>
                  {bld.secondary && <p className="text-xs text-muted-foreground mb-2">{bld.secondary}</p>}
                  <div className="text-[0.72rem] font-mono text-muted-foreground">{b.unit_count} units</div>
                  <div className="mt-3 pt-3 border-t border-border/60"><AldarStatusPills breakdown={bd} size="xs" /></div>
                  <div className="mt-3 flex items-center justify-end text-[0.72rem] font-mono uppercase text-primary">View units <ArrowRight className="ml-1 h-3 w-3" /></div>
                </div>
              </Link>
            );
          })}
        </div>
        {buildings.length === 0 && (<div className="text-center text-muted-foreground py-10">No buildings match the selected official source state.</div>)}
      </section>
    </div>
  );
}

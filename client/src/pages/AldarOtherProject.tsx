/**
 * /aldar-other/:project   (MASTER ONLY)
 */
import { useMemo, useState } from "react";
import { useParams, Link } from "wouter";
import { Building2, ArrowRight, Sparkles, Lock, FileText } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import MasterGate from "@/components/MasterGate";
import { trpc } from "@/lib/trpc";
import { AldarStatusPills } from "@/components/AldarStatusPills";

function Inner() {
  const { project: slug } = useParams<{ project: string }>();
  const [liveOnly, setLiveOnly] = useState(false);

  const project = trpc.aldarOther.getProject.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug },
  );

  const buildings = useMemo(() => {
    const all = project.data?.buildings ?? [];
    if (liveOnly) return all.filter(b => b.live_count > 0);
    return all;
  }, [project.data, liveOnly]);

  const totalLive = useMemo(
    () => (project.data?.buildings ?? []).reduce((s, b) => s + b.live_count, 0),
    [project.data],
  );

  // Aggregate project-level breakdown by summing buildings
  const projectBreakdown = useMemo(() => {
    const acc = {
      available: 0,
      new: 0,
      booked: 0,
      blocked: 0,
      reserved: 0,
      sold: 0,
      other: 0,
      total: 0,
    };
    for (const b of project.data?.buildings ?? []) {
      acc.available += b.breakdown.available;
      acc.new += b.breakdown.new;
      acc.booked += b.breakdown.booked;
      acc.blocked += b.breakdown.blocked;
      acc.reserved += b.breakdown.reserved;
      acc.sold += b.breakdown.sold;
      acc.other += b.breakdown.other;
      acc.total += b.breakdown.total;
    }
    return acc;
  }, [project.data]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        subTitle={
          project.data ? `Aldar · ${project.data.name}` : "Aldar · Other"
        }
        back={{ href: "/aldar-other", label: "All Other projects" }}
      />
      <section className="border-b border-border bg-card/40">
        <div className="container py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-rose-600 dark:text-rose-300">
            <Lock className="h-3.5 w-3.5" />
            Master-only · Aldar · Other
          </div>
          <h1 className="font-display text-4xl sm:text-[3rem] leading-tight text-foreground">
            {project.isLoading ? <Skeleton className="h-10 w-72" /> : project.data?.name}
          </h1>
          {project.data && (
            <>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-[0.78rem] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {project.data.building_count} buildings
                </span>
                <span>·</span>
                <span className="num-display">{project.data.unit_count} units</span>
              </div>
              <div className="mt-4">
              <AldarStatusPills breakdown={projectBreakdown} size="sm" />
              </div>
              {project.data.published_starting_prices && (
                <div className="mt-5 rounded-md border border-sky-500/25 bg-sky-500/5 p-4">
                  <p className="text-[0.68rem] font-mono uppercase tracking-[0.18em] text-sky-800 dark:text-sky-200">
                    {project.data.published_starting_prices.label}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3 text-sm text-foreground">
                    {project.data.published_starting_prices.prices.map(price => (
                      <div key={price.unit_type} className="rounded border border-border/70 bg-background/50 px-3 py-2">
                        <div>{price.unit_type}</div>
                        <div className="mt-1 font-semibold num-display">From AED {(price.starting_price_aed / 1_000_000).toFixed(1)}M</div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Payment plan: {project.data.published_starting_prices.payment_plan}. These are project starting prices by home type, not prices for NC/ND individual units.
                  </p>
                </div>
              )}
              {slug === "the-sustainable-city-yas-island" && (
                <div className="mt-4">
                  <Button asChild variant="outline" size="sm" className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                    <a href="/manus-storage/The_Sustainable_City_Yas_Island_91d99404.pdf" target="_blank" rel="noopener noreferrer">
                      <FileText className="h-3.5 w-3.5" />
                      Open Brochure
                    </a>
                  </Button>
                </div>
              )}
              <div className="mt-5">
                <label className="inline-flex items-center gap-2 text-sm">
                  <Switch checked={liveOnly} onCheckedChange={setLiveOnly} />
                  <span className="text-muted-foreground">
                    Live inventory only ({totalLive})
                  </span>
                </label>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="container py-8 sm:py-10">
        {project.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buildings.map(b => (
              <Link
                key={b.slug}
                href={`/aldar-other/${slug}/${b.slug}`}
                className="group block rounded-md border border-border bg-card overflow-hidden hover:border-primary/60 transition-colors"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-mono text-rose-600 dark:text-rose-300">
                      <Building2 className="h-3 w-3" /> Building
                    </div>
                    {b.live_count > 0 ? (
                      <span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-sm">
                        {b.live_count} live
                      </span>
                    ) : (
                      <span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] border border-border bg-muted text-muted-foreground px-2 py-0.5 rounded-sm">
                        No active inventory published
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-xl text-foreground group-hover:text-primary transition-colors">
                    {b.name}
                  </h2>
                  <div className="mt-2 text-[0.72rem] font-mono uppercase tracking-[0.18em] text-muted-foreground num-display">
                    {b.unit_count} units
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/60">
                    <AldarStatusPills breakdown={b.breakdown} size="xs" />
                  </div>
                  <div className="mt-3 flex items-center justify-end text-[0.72rem] font-mono uppercase tracking-[0.18em] text-primary">
                    View units <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!project.isLoading && buildings.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            No buildings match your filter.
          </div>
        )}
      </section>
    </div>
  );
}

export default function AldarOtherProject() {
  return (
    <MasterGate>
      <Inner />
    </MasterGate>
  );
}

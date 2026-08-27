/**
 * /aldar-saadiyat — Index of Aldar Saadiyat projects. Data loaded via tRPC.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, Building2, Sparkles, ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { actionableCount } from "@/data/aldar";
import type { StatusBreakdown } from "@/data/aldar";
import { AldarStatusBadge } from "@/components/AldarStatusBadge";
import AldarOfficialUnitLink from "@/components/AldarOfficialUnitLink";
import { AldarStatusPills } from "@/components/AldarStatusPills";
import { fmtAed, shortUnitNumber } from "@/data/aldar/format";
import { buildingDisplayName } from "@/data/aldar/buildingLabels";
import { trpc } from "@/lib/trpc";

export default function AldarSaadiyat() {
  const [availableOnly, setAvailableOnly] = useState(false);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const { data, isLoading } = trpc.aldarSaadiyat.listProjects.useQuery();
  const searchQuery = trpc.aldarSaadiyat.searchUnits.useQuery(
    { query: q, limit: 50 },
    { enabled: q.length >= 2 },
  );

  const projects = useMemo(() => {
    if (!data) return [];
    if (availableOnly) return data.projects.filter((p: any) => actionableCount(p.breakdown) > 0);
    return data.projects;
  }, [data, availableOnly]);

  const searchHits = searchQuery.data?.results ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground font-mono text-sm">Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle="Aldar Saadiyat · Inventory" />
      <section className="border-b border-border bg-card/40">
        <div className="container py-8 sm:py-10">
          <h1 className="font-display text-3xl sm:text-[2.4rem] leading-tight text-foreground">
            {data?.project_count ?? 0} projects ·{" "}
            <span className="num-display">{(data?.total_units ?? 0).toLocaleString()}</span> units ·{" "}
            <span className="text-primary num-display">{data?.total_available ?? 0}</span> available now
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
            Browse every Aldar Saadiyat project, drill into buildings, and view unit-level pricing, areas, status, finishes and payment plans.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a unit number across all projects…" className="w-72" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={availableOnly} onCheckedChange={setAvailableOnly} />
              <span className="text-muted-foreground">Available only</span>
            </label>
          </div>
        </div>
      </section>

      {q.length >= 2 && searchHits.length > 0 && (
        <section className="border-b border-border">
          <div className="container py-6">
            <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-3">
              {searchHits.length} matching unit{searchHits.length === 1 ? "" : "s"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchHits.map((hit: any) => {
                const bld = buildingDisplayName(hit.buildingName);
                return (
                  <div key={`${hit.projectSlug}/${hit.buildingSlug}/${hit.unitName}`} className="rounded-md border border-border bg-card p-3 transition-colors hover:border-primary/60">
                    <Link href={`/aldar-saadiyat/${hit.projectSlug}/${hit.buildingSlug}/${encodeURIComponent(hit.unitName ?? "")}`} className="block">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">{hit.projectName}</span>
                        <AldarStatusBadge status={hit.status} />
                      </div>
                      <div className="font-display text-lg text-foreground">{shortUnitNumber(hit.unitName)}</div>
                      <div className="text-[0.7rem] font-mono text-muted-foreground">{bld.primary}{bld.secondary && <span className="opacity-60"> · {bld.secondary}</span>}</div>
                      <div className="mt-2 text-sm num-display">AED {fmtAed(hit.price_aed)}</div>
                    </Link>
                    <AldarOfficialUnitLink aldarLink={hit.aldar_link} unitName={hit.unitName} compact className="mt-2" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="container py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p: any) => {
            const bd = p.breakdown as StatusBreakdown;
            const live = actionableCount(bd);
            return (
              <Link key={p.slug} href={`/aldar-saadiyat/${p.slug}`} className="group block rounded-md border border-border bg-card overflow-hidden hover:border-primary/60 transition-colors">
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-mono text-primary"><Sparkles className="h-3 w-3" />Aldar</div>
                    {live > 0 ? (<span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-sm">{live} live</span>) : (<span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] border border-border bg-muted text-muted-foreground px-2 py-0.5 rounded-sm">Sold out</span>)}
                  </div>
                  <h2 className="font-display text-xl text-foreground group-hover:text-primary transition-colors">{p.name}</h2>
                  <div className="mt-2 text-[0.72rem] font-mono uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {p.building_count} buildings</span>
                    <span>·</span>
                    <span className="num-display">{p.unit_count} units</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/60"><AldarStatusPills breakdown={bd} size="xs" /></div>
                  <div className="mt-3 flex items-center justify-end text-[0.72rem] font-mono uppercase tracking-[0.18em] text-primary">Explore <ArrowRight className="ml-1 h-3 w-3" /></div>
                </div>
              </Link>
            );
          })}
        </div>
        {projects.length === 0 && !isLoading && (<div className="text-center text-muted-foreground py-10">No project matches your filter.</div>)}
      </section>

      <footer className="mt-auto border-t border-border bg-card/40">
        <div className="container py-4 text-[0.7rem] font-mono uppercase tracking-[0.18em] text-muted-foreground flex items-center justify-between">
          <span>Source: Aldar inventory exports</span>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link href="/">Back home</Link></Button>
        </div>
      </footer>
    </div>
  );
}

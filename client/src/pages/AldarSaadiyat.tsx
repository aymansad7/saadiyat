/**
 * /aldar-saadiyat
 *
 * Index of every Aldar Saadiyat project pulled from the consolidated workbook
 * exports. Brokers can:
 *  - scan the project grid (with available counts vs total)
 *  - filter "Available only" to surface live inventory across all projects
 *  - cross-search any unit by number across all projects
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, Building2, Sparkles, ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ALDAR, allAvailableUnits } from "@/data/aldar";
import { AldarStatusBadge } from "@/components/AldarStatusBadge";
import { fmtAed, shortUnitNumber } from "@/data/aldar/format";
import { buildingDisplayName } from "@/data/aldar/buildingLabels";

export default function AldarSaadiyat() {
  const [availableOnly, setAvailableOnly] = useState(false);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const projects = useMemo(() => {
    if (availableOnly)
      return ALDAR.projects.filter(p => p.available_count > 0);
    return ALDAR.projects;
  }, [availableOnly]);

  const searchHits = useMemo(() => {
    if (q.length < 2) return [];
    const out: Array<{
      projectSlug: string;
      projectName: string;
      buildingSlug: string;
      buildingName: string;
      unit: { unit_name: string | null; status: string | null; price_aed: number | null };
    }> = [];
    for (const p of ALDAR.projects) {
      for (const b of p.buildings) {
        for (const u of b.units) {
          if (!u.unit_name) continue;
          if (u.unit_name.toLowerCase().includes(q)) {
            out.push({
              projectSlug: p.slug,
              projectName: p.name,
              buildingSlug: b.slug,
              buildingName: b.name,
              unit: u,
            });
          }
          if (out.length >= 30) return out;
        }
      }
    }
    return out;
  }, [q]);

  const totalAvail = allAvailableUnits().length;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle="Aldar Saadiyat · Inventory" />
      <section className="border-b border-border bg-card/40">
        <div className="container py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
            <span className="h-px w-6 bg-primary/60" />
            All Aldar inventory · Saadiyat
          </div>
          <h1 className="font-display text-3xl sm:text-[2.4rem] leading-tight text-foreground">
            {ALDAR.project_count} projects ·{" "}
            <span className="num-display">{ALDAR.total_units.toLocaleString()}</span> units ·{" "}
            <span className="text-primary num-display">{totalAvail}</span> available now
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
            Browse every Aldar Saadiyat project, drill into its individual
            buildings, and view unit-level pricing, areas, status, finishes and
            payment plans. Source: Aldar inventory exports as of{" "}
            <span className="font-mono">{ALDAR.exported_at}</span>.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search a unit number across all projects…"
                className="w-72"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={availableOnly}
                onCheckedChange={setAvailableOnly}
              />
              <span className="text-muted-foreground">
                Available only ({totalAvail})
              </span>
            </label>
          </div>
        </div>
      </section>

      {searchHits.length > 0 && (
        <section className="border-b border-border">
          <div className="container py-6">
            <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-3">
              {searchHits.length} matching unit{searchHits.length === 1 ? "" : "s"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchHits.map(hit => {
                const bld = buildingDisplayName(hit.buildingName);
                return (
                  <Link
                    key={`${hit.projectSlug}/${hit.buildingSlug}/${hit.unit.unit_name}`}
                    href={`/aldar-saadiyat/${hit.projectSlug}/${hit.buildingSlug}/${encodeURIComponent(hit.unit.unit_name ?? "")}`}
                    className="block rounded-md border border-border bg-card p-3 hover:border-primary/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {hit.projectName}
                      </span>
                      <AldarStatusBadge status={hit.unit.status} />
                    </div>
                    <div className="font-display text-lg text-foreground">
                      {shortUnitNumber(hit.unit.unit_name)}
                    </div>
                    <div className="text-[0.7rem] font-mono text-muted-foreground">
                      {bld.primary}
                      {bld.secondary && (
                        <span className="opacity-60"> · {bld.secondary}</span>
                      )}
                    </div>
                    <div className="mt-2 text-sm num-display">
                      AED {fmtAed(hit.unit.price_aed)}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="container py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => {
            const isLive = p.available_count > 0;
            return (
              <Link
                key={p.slug}
                href={`/aldar-saadiyat/${p.slug}`}
                className="group block rounded-md border border-border bg-card overflow-hidden hover:border-primary/60 transition-colors"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-mono text-primary">
                      <Sparkles className="h-3 w-3" />
                      Aldar
                    </div>
                    {isLive ? (
                      <span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-sm">
                        {p.available_count} available
                      </span>
                    ) : (
                      <span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] border border-border bg-muted text-muted-foreground px-2 py-0.5 rounded-sm">
                        Sold out
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-xl text-foreground group-hover:text-primary transition-colors">
                    {p.name}
                  </h2>
                  <div className="mt-2 text-[0.72rem] font-mono uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {p.building_count} buildings
                    </span>
                    <span>·</span>
                    <span className="num-display">{p.unit_count} units</span>
                  </div>
                  <div className="mt-4 flex items-center justify-end text-[0.72rem] font-mono uppercase tracking-[0.18em] text-primary">
                    Explore <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {projects.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            No project matches your filter. Try turning off "Available only".
          </div>
        )}
      </section>

      <footer className="mt-auto border-t border-border bg-card/40">
        <div className="container py-4 text-[0.7rem] font-mono uppercase tracking-[0.18em] text-muted-foreground flex items-center justify-between">
          <span>Source: Aldar inventory exports · {ALDAR.exported_at}</span>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}

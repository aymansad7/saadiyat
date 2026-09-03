/**
 * /aldar-other  (MASTER ONLY)
 *
 * Index of every Aldar project OUTSIDE Saadiyat, grouped by Area
 * (Yas Island, Al Shamkha, Al Ghadeer, …). Server route is guarded by
 * masterProcedure so non-master users see nothing in the network response.
 *
 * Filters (applied server-side at the project level):
 *   - Available only
 *   - Price range (AED, min/max over live units)
 *   - Search (project name) + cross-project unit-number search
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { getInventoryPublicationState } from "../lib/inventoryPublicationState";
import {
  Search,
  Building2,
  ArrowRight,
  Lock,
  MapPin,
  SlidersHorizontal,
  X,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import MasterGate from "@/components/MasterGate";
import { trpc } from "@/lib/trpc";
import { AldarStatusBadge } from "@/components/AldarStatusBadge";
import AldarOfficialUnitLink from "@/components/AldarOfficialUnitLink";
import { AldarStatusPills } from "@/components/AldarStatusPills";
import { fmtAed, shortUnitNumber } from "@/data/aldar/format";

function priceRangeLabel(min: number | null, max: number | null): string {
  if (min == null && max == null) return "—";
  if (min != null && max != null) {
    if (min === max) return `AED ${fmtAed(min)}`;
    return `AED ${fmtAed(min)} – ${fmtAed(max)}`;
  }
  return `AED ${fmtAed(min ?? max)}`;
}

function Inner() {
  const [availableOnly, setAvailableOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [priceMinStr, setPriceMinStr] = useState("");
  const [priceMaxStr, setPriceMaxStr] = useState("");

  const q = query.trim();

  // Parse price inputs to integers (AED). Empty -> undefined.
  const priceMin = useMemo(() => {
    const n = parseInt(priceMinStr.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [priceMinStr]);
  const priceMax = useMemo(() => {
    const n = parseInt(priceMaxStr.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [priceMaxStr]);

  const listInput = useMemo(
    () => ({ availableOnly, priceMin, priceMax, q: q || undefined }),
    [availableOnly, priceMin, priceMax, q],
  );

  const list = trpc.aldarOther.listByArea.useQuery(listInput);

  // Cross-project unit-number search (only when the query looks like a unit ref).
  const search = trpc.aldarOther.searchUnits.useQuery(
    { query: q, liveOnly: availableOnly, limit: 30 },
    { enabled: q.length >= 2 },
  );

  const hasActiveFilters =
    availableOnly || priceMin != null || priceMax != null || q.length > 0;

  const clearFilters = () => {
    setAvailableOnly(false);
    setQuery("");
    setPriceMinStr("");
    setPriceMaxStr("");
  };

  const totalAvailable = list.data?.total_available ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle="Aldar · Other projects" />

      {/* Header */}
      <section className="border-b border-border bg-card/40">
        <div className="container py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-rose-600 dark:text-rose-300">
            <Lock className="h-3.5 w-3.5" />
            Master-only · Aldar outside Saadiyat
          </div>
          <h1 className="font-display text-3xl sm:text-[2.4rem] leading-tight text-foreground">
            {list.isLoading ? (
              <Skeleton className="h-10 w-96" />
            ) : (
              <>
                <span className="num-display">
                  {list.data?.total_units.toLocaleString()}
                </span>{" "}
                units ·{" "}
                <span className="text-emerald-600 dark:text-emerald-300 num-display">
                  {totalAvailable}
                </span>{" "}
                available · grouped by area
              </>
            )}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
            Aldar inventory across Yas Island, Al Shamkha, Al Ghadeer and more —
            organised by area. Visible to master users only.
            {list.data?.exported_at && (
              <>
                {" "}
                Source: Aldar inventory exports as of{" "}
                <span className="font-mono">{list.data.exported_at}</span>.
              </>
            )}
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="border-b border-border bg-background sticky top-0 z-20">
        <div className="container py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] font-mono text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </div>

            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search project name or unit number…"
                className="w-72"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-[0.16em]">
                Price AED
              </span>
              <Input
                value={priceMinStr}
                onChange={e => setPriceMinStr(e.target.value)}
                placeholder="Min"
                inputMode="numeric"
                className="w-28"
              />
              <span className="text-muted-foreground">–</span>
              <Input
                value={priceMaxStr}
                onChange={e => setPriceMaxStr(e.target.value)}
                placeholder="Max"
                inputMode="numeric"
                className="w-28"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Switch checked={availableOnly} onCheckedChange={setAvailableOnly} />
              <span className="text-muted-foreground">Available only</span>
            </label>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            )}

            <div className="ml-auto text-[0.7rem] font-mono uppercase tracking-[0.16em] text-muted-foreground">
              {list.isFetching
                ? "…"
                : `${list.data?.matched_projects ?? 0} projects`}
            </div>
          </div>
        </div>
      </section>

      {/* Unit search results */}
      {q.length >= 2 && (search.data?.hits.length ?? 0) > 0 && (
        <section className="border-b border-border bg-card/30">
          <div className="container py-6">
            <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-3">
              {search.isFetching
                ? "Searching units…"
                : `${search.data?.hits.length ?? 0} matching unit${
                    (search.data?.hits.length ?? 0) === 1 ? "" : "s"
                  }`}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(search.data?.hits ?? []).map(hit => (
                <div key={`${hit.projectSlug}/${hit.buildingSlug}/${hit.unitName}`} className="rounded-md border border-border bg-card p-3 transition-colors hover:border-primary/60">
                  <Link href={`/aldar-other/${hit.projectSlug}/${hit.buildingSlug}/${encodeURIComponent(hit.unitName)}`} className="block">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">{hit.projectName}</span>
                      <AldarStatusBadge status={hit.status} />
                    </div>
                    <div className="font-display text-lg text-foreground">{shortUnitNumber(hit.unitName)}</div>
                    <div className="text-[0.7rem] font-mono text-muted-foreground">{hit.buildingName}</div>
                    <div className="mt-2 text-sm num-display">AED {fmtAed(hit.price_aed)}</div>
                  </Link>
                  <AldarOfficialUnitLink aldarLink={hit.aldar_link} unitName={hit.unitName} projectSlug={hit.projectSlug} compact className="mt-2" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Area-grouped project sections */}
      <section className="container py-8 sm:py-10 space-y-12">
        {list.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-md" />
            ))}
          </div>
        ) : (list.data?.areas.length ?? 0) === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No projects match these filters.</p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          list.data?.areas.map(area => (
            <div key={area.key} id={`area-${area.key}`}>
              {/* Area header */}
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5 pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-2xl text-foreground">
                    {area.name}
                  </h2>
                  <span className="font-mono text-sm text-muted-foreground">
                    {area.nameAr}
                  </span>
                </div>
                <div className="text-[0.72rem] font-mono uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-3">
                  <span className="num-display">{area.project_count} projects</span>
                  <span>·</span>
                  <span className="num-display">{area.unit_count} units</span>
                  <span>·</span>
                  <span className="text-emerald-600 dark:text-emerald-300 num-display">
                    {area.available_count} available
                  </span>
                </div>
              </div>

              {/* Project cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {area.projects.map(p => (
                  <Link
                    key={p.slug}
                    href={`/aldar-other/${p.slug}`}
                    className="group block rounded-md border border-border bg-card overflow-hidden hover:border-primary/60 transition-colors"
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-mono text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {area.name}
                        </div>
                        {getInventoryPublicationState(p.slug, p.available_count, p.live_count).tone === "available" ? (
                          <span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-sm">
                            {p.available_count} available
                          </span>
                        ) : getInventoryPublicationState(p.slug, p.available_count, p.live_count).tone === "live" ? (
                          <span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] border border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-sm">
                            {p.live_count} live
                          </span>
                        ) : getInventoryPublicationState(p.slug, p.available_count, p.live_count).tone === "registration" ? (
                          <span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] border border-sky-500/50 bg-sky-500/10 text-sky-800 dark:text-sky-200 px-2 py-0.5 rounded-sm">
                            Registration open
                          </span>
                        ) : (
                          <span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] border border-border bg-muted text-muted-foreground px-2 py-0.5 rounded-sm">
                            No active inventory published
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-xl text-foreground group-hover:text-primary transition-colors">
                        {p.name}
                      </h3>

                      <div className="mt-2 text-[0.72rem] font-mono uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {p.building_count} buildings
                        </span>
                        <span>·</span>
                        <span className="num-display">{p.unit_count} units</span>
                      </div>

                      {/* A project-type starting price is not a unit-level price. */}
                      <div className="mt-3 text-sm">
                        <span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] text-muted-foreground mr-2">
                          {p.official_starting_price_min != null ? "Official starting price" : "Price"}
                        </span>
                        <span className="num-display text-foreground">
                          {p.official_starting_price_min != null
                            ? `From AED ${fmtAed(p.official_starting_price_min)}`
                            : priceRangeLabel(p.price_min, p.price_max)}
                        </span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border/60">
                        <AldarStatusPills breakdown={p.breakdown} size="xs" />
                      </div>

                      <div className="mt-3 flex items-center justify-end text-[0.72rem] font-mono uppercase tracking-[0.18em] text-primary">
                        Explore <ArrowRight className="ml-1 h-3 w-3" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <footer className="mt-auto border-t border-border bg-card/40">
        <div className="container py-4 text-[0.7rem] font-mono uppercase tracking-[0.18em] text-muted-foreground flex items-center justify-between">
          <span>Source: Aldar inventory exports · {list.data?.exported_at}</span>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}

export default function AldarOther() {
  return (
    <MasterGate>
      <Inner />
    </MasterGate>
  );
}

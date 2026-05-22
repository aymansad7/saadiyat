/**
 * /aldar-other  (MASTER ONLY)
 *
 * Index of every Aldar project OUTSIDE Saadiyat (Yas Island, Al Reeman,
 * Al Ghadeer, Noya, etc.). Server-side route is guarded by masterProcedure
 * so non-master users see nothing in the network response either.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, Building2, Sparkles, ArrowRight, Lock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import MasterGate from "@/components/MasterGate";
import { trpc } from "@/lib/trpc";
import { AldarStatusBadge } from "@/components/AldarStatusBadge";
import { AldarStatusPills } from "@/components/AldarStatusPills";
import { fmtAed, shortUnitNumber } from "@/data/aldar/format";

function Inner() {
  const [liveOnly, setLiveOnly] = useState(false);
  const [query, setQuery] = useState("");
  const q = query.trim();

  const list = trpc.aldarOther.listProjects.useQuery();

  const search = trpc.aldarOther.searchUnits.useQuery(
    { query: q, liveOnly: false, limit: 30 },
    { enabled: q.length >= 2 },
  );

  const projects = useMemo(() => {
    const all = list.data?.projects ?? [];
    if (liveOnly) return all.filter(p => p.live_count > 0);
    return all;
  }, [list.data, liveOnly]);

  const totalLive = useMemo(
    () => (list.data?.projects ?? []).reduce((s, p) => s + p.live_count, 0),
    [list.data],
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle="Aldar · Other projects" />
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
                {list.data?.project_count} projects ·{" "}
                <span className="num-display">
                  {list.data?.total_units.toLocaleString()}
                </span>{" "}
                units ·{" "}
                <span className="text-primary num-display">{totalLive}</span>{" "}
                live
              </>
            )}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
            Aldar inventory across Yas Island, Al Reeman, Al Ghadeer, Noya,
            Reeman Living and more. Visible to master users only.
            {list.data?.exported_at && (
              <>
                {" "}
                Source: Aldar inventory exports as of{" "}
                <span className="font-mono">{list.data.exported_at}</span>.
              </>
            )}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search a unit number across all Other projects…"
                className="w-80"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={liveOnly} onCheckedChange={setLiveOnly} />
              <span className="text-muted-foreground">
                Live inventory only ({totalLive})
              </span>
            </label>
          </div>
        </div>
      </section>

      {q.length >= 2 && (
        <section className="border-b border-border">
          <div className="container py-6">
            <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-3">
              {search.isFetching
                ? "Searching…"
                : `${search.data?.hits.length ?? 0} matching unit${
                    (search.data?.hits.length ?? 0) === 1 ? "" : "s"
                  }`}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(search.data?.hits ?? []).map(hit => (
                <Link
                  key={`${hit.projectSlug}/${hit.buildingSlug}/${hit.unitName}`}
                  href={`/aldar-other/${hit.projectSlug}/${hit.buildingSlug}/${encodeURIComponent(hit.unitName)}`}
                  className="block rounded-md border border-border bg-card p-3 hover:border-primary/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                      {hit.projectName}
                    </span>
                    <AldarStatusBadge status={hit.status} />
                  </div>
                  <div className="font-display text-lg text-foreground">
                    {shortUnitNumber(hit.unitName)}
                  </div>
                  <div className="text-[0.7rem] font-mono text-muted-foreground">
                    {hit.buildingName}
                  </div>
                  <div className="mt-2 text-sm num-display">
                    AED {fmtAed(hit.price_aed)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container py-8 sm:py-10">
        {list.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <Link
                key={p.slug}
                href={`/aldar-other/${p.slug}`}
                className="group block rounded-md border border-border bg-card overflow-hidden hover:border-primary/60 transition-colors"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-mono text-rose-600 dark:text-rose-300">
                      <Sparkles className="h-3 w-3" />
                      Aldar · Other
                    </div>
                    {p.live_count > 0 ? (
                      <span className="text-[0.65rem] font-mono uppercase tracking-[0.18em] border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-sm">
                        {p.live_count} live
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

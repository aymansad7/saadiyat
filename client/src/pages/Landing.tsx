/**
 * Saadiyat Resale Hub — Landing
 * Editorial hero with the Saadiyat aerial photograph; below, a single
 * "Projects" rail listing every published Saadiyat project (St. Regis Villas,
 * Saadiyat Lagoons, Saadiyat Beach Villas, Jawaher…). Future projects use the
 * toast-coming-soon pattern.
 *
 * Design rules (binding):
 *   - Asymmetric hero (no centered text block)
 *   - Fraunces serif numerals, Inter Tight body
 *   - Terracotta accents only
 */
import { Link } from "wouter";
import { ArrowUpRight, Compass, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import { toast } from "sonner";
import { villas } from "@/data/villas";
import { COMMUNITIES } from "@/data/communities";

import { actionableCount } from "@/data/aldar";
import type { StatusBreakdown } from "@/data/aldar";
import { trpc } from "@/lib/trpc";
import { AldarStatusPills } from "@/components/AldarStatusPills";
import { AvailabilityFilter } from "@/components/AvailabilityFilter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCanAccessOther } from "@/hooks/useCanAccessOther";
import GlobalUnitSearch from "@/components/GlobalUnitSearch";

const jawaher = COMMUNITIES.find((c) => c.slug === "jawaher")!;
const sbv = COMMUNITIES.find((c) => c.slug === "saadiyat-beach-villas")!;
const golfViews = COMMUNITIES.find((c) => c.slug === "saadiyat-golf-views")!;
const privateVillas = COMMUNITIES.find((c) => c.slug === "private-villas-four-seasons")!;
const hugePlot = COMMUNITIES.find((c) => c.slug === "huge-plot-four-seasons-omniyat")!;

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030641160/cdNSYhri6jzahGcw5xtfw3/saadiyat-hero-fXHXGvSP5PsLtB8b7Rpzwu.webp";
const COMPASS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030641160/cdNSYhri6jzahGcw5xtfw3/compass-rose-deQv7pJ8D2hyEVdwDAWyyr.webp";

const communities = [
  {
    slug: "st-regis",
    name: "St. Regis Villas",
    cluster: "Saadiyat Beach District · SB-01",
    plots: villas.length,
    href: "/st-regis",
    available: true,
    rich: true,
  },
  {
    slug: "saadiyat-beach-villas",
    name: sbv.name,
    cluster: sbv.cluster,
    plots: sbv.totalPlots,
    href: "/saadiyat-beach-villas",
    available: true,
    rich: false,
  },
  {
    slug: "jawaher",
    name: jawaher.name,
    cluster: jawaher.cluster,
    plots: jawaher.totalPlots,
    href: "/jawaher",
    available: true,
    rich: false,
  },
  {
    slug: "saadiyat-lagoons",
    name: "Saadiyat Lagoons",
    cluster: "Aldar · SDE1 / SDE2 / SDE3",
    plots: 1549,
    href: "/saadiyat-lagoons",
    available: true,
    rich: true,
  },
  {
    slug: "lagoons-hidden-sl9",
    name: "Lagoons Hidden Phase SL9",
    cluster: "Saadiyat Lagoons · 257 official DCR plots",
    plots: 257,
    href: "/lagoons-hidden-sl9",
    available: true,
    rich: true,
  },
  {
    slug: "lagoons-hidden-sl10",
    name: "Lagoons Hidden Phase SL10",
    cluster: "Saadiyat Lagoons · 18 official DCR plots",
    plots: 18,
    href: "/lagoons-hidden-sl10",
    available: true,
    rich: true,
  },
  {
    slug: "lagoons-sl13",
    name: "Lagoons Phase SL13",
    cluster: "Saadiyat Lagoons · 12 official DCR plots",
    plots: 12,
    href: "/lagoons-sl13",
    available: true,
    rich: true,
  },
  {
    slug: "saadiyat-golf-views",
    name: golfViews.name,
    cluster: golfViews.cluster,
    plots: golfViews.totalPlots,
    href: "/community/saadiyat-golf-views",
    available: true,
    rich: false,
  },
  {
    slug: "private-villas-four-seasons",
    name: privateVillas.name,
    cluster: privateVillas.cluster,
    plots: privateVillas.totalPlots,
    href: "/community/private-villas-four-seasons",
    available: true,
    rich: false,
  },
  {
    slug: "four-seasons",
    name: "Four Seasons Private Residences",
    cluster: "Saadiyat Beach District · Official Master Plan",
    plots: 56,
    href: "/four-seasons",
    available: true,
    rich: true,
  },
  {
    slug: "saadiyat-reserve",
    name: "Saadiyat Reserve",
    cluster: "SDE3 · Phase 1, Phase 2 & Dunes",
    plots: 306,
    href: "/saadiyat-reserve",
    available: true,
    rich: true,
  },
  {
    slug: "huge-plot-four-seasons-omniyat",
    name: hugePlot.name,
    cluster: hugePlot.cluster,
    plots: hugePlot.totalPlots,
    href: "/community/huge-plot-four-seasons-omniyat",
    available: true,
    rich: false,
  },
  { slug: "hidd", name: "Hidd Al Saadiyat", cluster: "Saadiyat Island", plots: 469, href: "/hidd-al-saadiyat", available: true, rich: false },
];

const landingPlotCount = communities.reduce((total, community) => total + community.plots, 0);

export default function Landing() {
  const { data: aldarData } = trpc.aldarSaadiyat.listProjects.useQuery();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle="Saadiyat Island · Abu Dhabi" />

      {/* HERO — asymmetric two-column */}
      <section className="relative overflow-hidden">
        <div className="container pt-10 sm:pt-16 lg:pt-20 pb-14 sm:pb-20 grid grid-cols-12 gap-6 lg:gap-10">
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-5 text-xs uppercase tracking-[0.22em] font-mono text-primary">
              <span className="h-px w-8 bg-primary/60" />
              Saadiyat Resale Hub
            </div>
            <h1 className="font-display text-[2.5rem] leading-[1.05] sm:text-[3.4rem] lg:text-[4rem] font-medium text-foreground">
              Every Saadiyat project,
              <br />
              <span className="italic text-primary">villa by villa.</span>
            </h1>
            <p className="mt-6 text-[1.02rem] text-muted-foreground max-w-md leading-relaxed">
              A curated resale atlas of every master-planned project on
              Saadiyat Island — St. Regis Villas, Saadiyat Lagoons, Saadiyat
              Beach Villas, Jawaher and more. For each plot: the official DMT
              DCR sheet, a precise Google Maps pin, and live availability.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Button asChild size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-sm">
                <a href="#communities">
                  Browse projects
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
              <Link
                href="/st-regis"
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-dotted decoration-muted-foreground/60"
              >
                Jump to St. Regis Villas
              </Link>
            </div>

            {/* Global unit search */}
            <div className="mt-6">
              <GlobalUnitSearch />
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md border-t border-border pt-6">
              <div>
                <dt className="text-[0.7rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">Plots</dt>
                <dd className="font-display text-3xl text-foreground tabular num-display mt-1">{landingPlotCount}</dd>
              </div>
              <div>
                <dt className="text-[0.7rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">Projects</dt>
                <dd className="font-display text-2xl text-foreground mt-1">{communities.length}</dd>
              </div>
              <div>
                <dt className="text-[0.7rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">Source</dt>
                <dd className="font-display text-2xl text-foreground mt-1">DMT</dd>
              </div>
            </dl>
          </div>

          <div className="col-span-12 lg:col-span-7 relative">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md border border-border shadow-[0_30px_80px_-50px_rgba(34,30,25,0.55)]">
              <img
                src={HERO_IMG}
                alt="Aerial view of Saadiyat Beach villas at golden hour"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-[oklch(0.18_0.02_250/0.55)] to-transparent">
                <div className="font-display italic text-background/95 text-sm sm:text-base">
                  &ldquo;The pearl of the Arabian Gulf&rdquo;
                </div>
                <div className="text-[0.7rem] uppercase tracking-[0.18em] font-mono text-background/70 mt-1">
                  Saadiyat Beach · 24.53° N, 54.42° E
                </div>
              </div>
            </div>
            <img
              src={COMPASS_IMG}
              alt=""
              aria-hidden="true"
              className="hidden lg:block absolute -bottom-12 -left-12 w-36 opacity-60 pointer-events-none select-none rotate-[-8deg]"
            />
          </div>
        </div>
        <div className="container divider-rule" />
      </section>

      {/* COMMUNITIES */}
      <section id="communities" className="container py-14 sm:py-20 topo-bg">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.22em] font-mono text-primary">
              <Compass className="h-3.5 w-3.5" />
              Projects
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground">Choose a project</h2>
          </div>
          <p className="hidden sm:block text-sm text-muted-foreground max-w-sm">
            We are progressively cataloguing every gated project on the island.
            Today: {communities.length} projects, {landingPlotCount} plots and villas.
          </p>
        </div>

        <AvailabilityFilter communities={communities} />


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {communities.map((c) => {
            const inner = (
              <div
                className={[
                  "group h-full p-5 bg-card border border-border rounded-md flex flex-col transition-all",
                  c.available ? "hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-22px_rgba(34,30,25,0.4)]" : "opacity-60",
                ].join(" ")}
              >
                <div className="flex items-start justify-between">
                  <div className="text-[0.7rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
                    {c.cluster}
                  </div>
                  {c.available ? (
                    c.rich ? (
                      <span className="text-[0.65rem] uppercase tracking-[0.16em] font-mono text-primary border border-primary/40 px-1.5 py-0.5 rounded-sm bg-primary/5">
                        Full data
                      </span>
                    ) : (
                      <span className="text-[0.65rem] uppercase tracking-[0.16em] font-mono text-foreground border border-foreground/30 px-1.5 py-0.5 rounded-sm">
                        Index
                      </span>
                    )
                  ) : (
                    <span className="text-[0.65rem] uppercase tracking-[0.16em] font-mono text-muted-foreground border border-border px-1.5 py-0.5 rounded-sm">
                      Soon
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl mt-3 text-foreground group-hover:text-primary transition-colors">
                  {c.name}
                </h3>
                <div className="mt-auto pt-6 flex items-baseline justify-between border-t border-border/60 mt-6">
                  <div>
                    <div className="text-[0.7rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">Villas</div>
                    <div className="font-display num-display text-2xl">
                      {c.available ? c.plots : "—"}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            );
            if (c.available) {
              return (
                <Link key={c.slug} href={c.href} className="block">
                  {inner}
                </Link>
              );
            }
            return (
              <button
                key={c.slug}
                type="button"
                className="text-left w-full"
                onClick={() => toast(`${c.name} catalogue is coming soon.`)}
              >
                {inner}
              </button>
            );
          })}
        </div>
      </section>

      {/* ALDAR PROJECTS DASHBOARD */}
      <section id="aldar" className="border-t border-border bg-card/30">
        <div className="container py-14 sm:py-20">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.22em] font-mono text-primary">
                <Compass className="h-3.5 w-3.5" />
                Aldar Saadiyat inventory
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-foreground">
                All other Aldar Saadiyat projects
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Live status breakdown for every Aldar inventory file we have ingested.
                Apartments and townhouses across {aldarData?.project_count ?? 0} projects · {(aldarData?.total_units ?? 0).toLocaleString()} units.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex bg-card border-primary/30 text-primary hover:bg-primary/10 hover:text-primary">
              <Link href="/aldar-saadiyat">
                Open Aldar browser
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {(aldarData?.projects ?? [])
              .slice()
              .sort((a: any, b: any) => {
                const ba = actionableCount(a.breakdown);
                const bb = actionableCount(b.breakdown);
                if (ba !== bb) return bb - ba;
                return b.unit_count - a.unit_count;
              })
              .map((p: any) => {
                const bd = p.breakdown as StatusBreakdown;
                const live = actionableCount(bd);
                return (
                  <Link
                    key={p.slug}
                    href={`/aldar-saadiyat/${p.slug}`}
                    className="group block rounded-md border border-border bg-card p-4 hover:border-primary/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[0.6rem] uppercase tracking-[0.22em] font-mono text-muted-foreground">
                        Aldar · {p.building_count} bld
                      </span>
                      {live > 0 ? (
                        <span className="text-[0.6rem] uppercase tracking-[0.18em] font-mono border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-sm">
                          {live} live
                        </span>
                      ) : (
                        <span className="text-[0.6rem] uppercase tracking-[0.18em] font-mono border border-border bg-muted text-muted-foreground px-1.5 py-0.5 rounded-sm">
                          Sold out
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
                      {p.name}
                    </h3>
                    <div className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] font-mono text-muted-foreground num-display">
                      {p.unit_count} units
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/60">
                      <AldarStatusPills breakdown={bd} size="xs" showSold={true} />
                    </div>
                  </Link>
                );
              })}
          </div>
          <div className="mt-6 sm:hidden">
            <Button asChild variant="outline" size="sm" className="bg-card border-primary/30 text-primary hover:bg-primary/10 hover:text-primary w-full">
              <Link href="/aldar-saadiyat">Open Aldar browser <ArrowUpRight className="h-3.5 w-3.5 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <AldarOtherRail />

      <footer className="mt-auto border-t border-border bg-card/60">
        <div className="container py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-muted-foreground">
          <div className="font-mono uppercase tracking-[0.18em]">
            Saadiyat · An editorial property atlas
          </div>
          <div>
Data sourced from DMT GeoSmart and Aldar (world.aldar.com).
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Master-only rail listing Aldar projects outside Saadiyat.
 * Data is fetched only when the user is a master, so non-master users
 * never see any of these projects in their network traffic.
 */
function AldarOtherRail() {
  const canAccessOther = useCanAccessOther();
  const list = trpc.aldarOther.listProjects.useQuery(undefined, {
    enabled: canAccessOther,
  });

  if (!canAccessOther) return null;
  const projects = list.data?.projects ?? [];
  const totalLive = projects.reduce((s, p) => s + p.live_count, 0);

  return (
    <section id="aldar-other" className="border-t border-border bg-background">
      <div className="container py-14 sm:py-20">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.22em] font-mono text-rose-600 dark:text-rose-300">
              <Lock className="h-3.5 w-3.5" />
              Master-only · Aldar outside Saadiyat
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground">
              Other Aldar projects
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Aldar inventory across Yas Island, Al Reeman, Al Ghadeer, Noya and
              more. {list.data?.project_count ?? "…"} projects ·{" "}
              <span className="num-display">
                {list.data?.total_units.toLocaleString() ?? "…"}
              </span>{" "}
              units · <span className="text-primary num-display">{totalLive}</span> live.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex bg-card border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10"
          >
            <Link href="/aldar-other">
              Open Other browser
              <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        {list.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-md border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {projects.map(p => (
              <Link
                key={p.slug}
                href={`/aldar-other/${p.slug}`}
                className="group block rounded-md border border-border bg-card p-4 hover:border-rose-500/60 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[0.6rem] uppercase tracking-[0.22em] font-mono text-muted-foreground">
                    Aldar · {p.building_count} bld
                  </span>
                  {p.live_count > 0 ? (
                    <span className="text-[0.6rem] uppercase tracking-[0.18em] font-mono border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-sm">
                      {p.live_count} live
                    </span>
                  ) : (
                    <span className="text-[0.6rem] uppercase tracking-[0.18em] font-mono border border-border bg-muted text-muted-foreground px-1.5 py-0.5 rounded-sm">
                      Sold out
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors leading-tight">
                  {p.name}
                </h3>
                <div className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] font-mono text-muted-foreground num-display">
                  {p.unit_count} units
                </div>
                <div className="mt-3 pt-3 border-t border-border/60">
                  <AldarStatusPills breakdown={p.breakdown} size="xs" showSold={true} />
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-6 sm:hidden">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="bg-card border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10 w-full"
          >
            <Link href="/aldar-other">
              Open Other browser <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

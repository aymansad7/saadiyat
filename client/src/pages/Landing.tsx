/**
 * Coastal Atelier — Landing
 * Editorial hero with the Saadiyat aerial photograph; below, a single
 * "Communities" rail. Currently only St. Regis Villas is published; placeholders
 * for future communities use the toast-coming-soon pattern.
 *
 * Design rules (binding):
 *   - Asymmetric hero (no centered text block)
 *   - Fraunces serif numerals, Inter Tight body
 *   - Terracotta accents only
 */
import { Link } from "wouter";
import { ArrowUpRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import { toast } from "sonner";
import { villas } from "@/data/villas";
import { COMMUNITIES } from "@/data/communities";
import { LAGOONS_DATASET } from "@/data/lagoons";

const jawaher = COMMUNITIES.find((c) => c.slug === "jawaher")!;
const sbv = COMMUNITIES.find((c) => c.slug === "saadiyat-beach-villas")!;

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
    plots: LAGOONS_DATASET.total_villas,
    href: "/saadiyat-lagoons",
    available: true,
    rich: true,
  },
  { slug: "hidd", name: "Hidd Al Saadiyat", cluster: "Saadiyat Reserve", plots: 0, href: "#", available: false, rich: false },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle="Saadiyat Island · Abu Dhabi" />

      {/* HERO — asymmetric two-column */}
      <section className="relative overflow-hidden">
        <div className="container pt-10 sm:pt-16 lg:pt-20 pb-14 sm:pb-20 grid grid-cols-12 gap-6 lg:gap-10">
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-5 text-xs uppercase tracking-[0.22em] font-mono text-primary">
              <span className="h-px w-8 bg-primary/60" />
              An editorial property atlas
            </div>
            <h1 className="font-display text-[2.5rem] leading-[1.05] sm:text-[3.4rem] lg:text-[4rem] font-medium text-foreground">
              Saadiyat,
              <br />
              <span className="italic text-primary">villa by villa.</span>
            </h1>
            <p className="mt-6 text-[1.02rem] text-muted-foreground max-w-md leading-relaxed">
              A curated explorer of the master-planned villa communities of
              Saadiyat Island. For each plot: the official DMT plot regulation
              report, a precise Google Maps pin, and a Google Earth flight-in.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Button asChild size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-sm">
                <Link href="/st-regis">
                  Explore St. Regis Villas
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <a
                href="#communities"
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-dotted decoration-muted-foreground/60"
              >
                See all communities
              </a>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md border-t border-border pt-6">
              <div>
                <dt className="text-[0.7rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">Plots</dt>
                <dd className="font-display text-3xl text-foreground tabular num-display mt-1">{villas.length + jawaher.totalPlots + sbv.totalPlots + LAGOONS_DATASET.total_villas}</dd>
              </div>
              <div>
                <dt className="text-[0.7rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">Communities</dt>
                <dd className="font-display text-2xl text-foreground mt-1">4</dd>
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
              Communities
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground">Choose a community</h2>
          </div>
          <p className="hidden sm:block text-sm text-muted-foreground max-w-sm">
            We are progressively cataloguing every gated cluster on the island.
            Today: four communities, {villas.length + jawaher.totalPlots + sbv.totalPlots + LAGOONS_DATASET.total_villas} plots.
          </p>
        </div>

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

/**
 * Coastal Atelier — Saadiyat Lagoons (Aldar · 1,549 villas)
 *
 * Overview page for the Lagoons master community. Lists the three
 * sub-communities as cluster cards and links into their dedicated pages:
 *   /saadiyat-lagoons/ethir
 *   /saadiyat-lagoons/al-sidr
 *   /saadiyat-lagoons/al-ghaf
 */
import { Link } from "wouter";
import { ArrowUpRight, Compass, Trees, Waves, Building2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { LAGOONS_DATASET } from "@/data/lagoons";

const CLUSTERS = [
  {
    slug: "ethir",
    name: "Ethir",
    tagline: "The northern bow-tie · 173 villas",
    blurb:
      "A compact triangular cluster between two inlets, framed by Linear Parks and the Eco Cornich.",
    icon: Compass,
  },
  {
    slug: "al-sidr",
    name: "Al Sidr",
    tagline: "The central masterplan · 619 villas",
    blurb:
      "The largest of the three villages, wrapped around the Town Centre and Mosque, with direct Cultural Spine access.",
    icon: Trees,
  },
  {
    slug: "al-ghaf",
    name: "Al Ghaf",
    tagline: "Lagoon-front village · 757 villas",
    blurb:
      "Premium waterfront rows along the lagoon, with the most corner and single-row plots of the three.",
    icon: Waves,
  },
] as const;

export default function SaadiyatLagoons() {
  const totals = LAGOONS_DATASET.summary;
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        subTitle="Saadiyat Lagoons · Aldar"
        back={{ href: "/", label: "Back to Saadiyat" }}
      />

      {/* Intro */}
      <section className="border-b border-border bg-card/50">
        <div className="container py-8 sm:py-10 grid grid-cols-12 gap-5 items-end">
          <div className="col-span-12 md:col-span-8">
            <div className="flex items-center gap-2 mb-3 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
              <Compass className="h-3.5 w-3.5" />
              Saadiyat Island · SDE1 / SDE2 / SDE3
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] leading-tight text-foreground">
              Saadiyat Lagoons
              <span className="text-muted-foreground italic">
                {" "}
                — {LAGOONS_DATASET.total_villas} villas across three villages.
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
              Aldar's flagship lagoon-front masterplan on the western edge of
              Saadiyat Island: 4, 5 and 6-bedroom villas arranged around
              cultural spines, community parks, mosques, linear parks and the
              eco cornich.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 flex flex-wrap gap-3 md:justify-end">
            <Stat label="Villas" value={String(LAGOONS_DATASET.total_villas)} accent />
            <Stat label="Villages" value="3" />
            <Stat label="Models" value="4 · 5 · 6 BR" />
          </div>
        </div>
      </section>

      {/* Clusters */}
      <section className="container py-12 sm:py-16 topo-bg">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.22em] font-mono text-primary">
              <Building2 className="h-3.5 w-3.5" />
              Villages
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground">
              Choose a village
            </h2>
          </div>
          <p className="hidden md:block text-sm text-muted-foreground max-w-sm">
            Each village is a separate gated cluster with its own network of
            amenities. Click through to the villa list.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CLUSTERS.map((c) => {
            const s = totals[c.slug];
            const Icon = c.icon;
            return (
              <Link
                key={c.slug}
                href={`/saadiyat-lagoons/${c.slug}`}
                className="block"
              >
                <div className="group h-full p-5 sm:p-6 bg-card border border-border rounded-md flex flex-col transition-all hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-22px_rgba(34,30,25,0.4)]">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="text-[0.65rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
                      {c.tagline.split(" · ")[1]}
                    </div>
                  </div>
                  <h3 className="font-display text-2xl mt-4 text-foreground group-hover:text-primary transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {c.blurb}
                  </p>

                  <dl className="mt-5 grid grid-cols-3 gap-2 font-mono text-[0.7rem]">
                    <dt className="uppercase tracking-[0.16em] text-muted-foreground col-span-1">
                      4 BR
                    </dt>
                    <dt className="uppercase tracking-[0.16em] text-muted-foreground col-span-1">
                      5 BR
                    </dt>
                    <dt className="uppercase tracking-[0.16em] text-muted-foreground col-span-1">
                      6 BR
                    </dt>
                    <dd className="num-display font-display tabular text-xl text-foreground col-span-1">
                      {s?.by_model?.["4BHK"] ?? 0}
                    </dd>
                    <dd className="num-display font-display tabular text-xl text-foreground col-span-1">
                      {s?.by_model?.["5BHK"] ?? 0}
                    </dd>
                    <dd className="num-display font-display tabular text-xl text-foreground col-span-1">
                      {s?.by_model?.["6BHK"] ?? 0}
                    </dd>
                  </dl>

                  <div className="mt-auto pt-6 flex items-baseline justify-between border-t border-border/60 mt-6">
                    <div>
                      <div className="text-[0.7rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
                        Corners · Single-row
                      </div>
                      <div className="font-mono text-sm tabular text-foreground mt-0.5">
                        {s?.corners ?? 0} · {s?.edges ?? 0}
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Amenity rail */}
        <div className="mt-14 border border-border rounded-md bg-card/50 p-5 sm:p-7">
          <div className="flex items-center gap-2 mb-3 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
            <span className="h-px w-6 bg-primary/60" />
            Master amenities
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Every villa page lists its five nearest amenities with precise
            walking distances computed from the Aldar master plan. Master
            amenities include the Town Centre, Mosques, Community Parks,
            Cultural Spine, Linear Parks, Neighborhood plazas, and the Eco
            Cornich along the lagoon.
          </p>
        </div>
      </section>

      <footer className="mt-auto border-t border-border bg-card/60">
        <div className="container py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-muted-foreground">
          <div className="font-mono uppercase tracking-[0.18em]">
            Saadiyat · Saadiyat Lagoons
          </div>
          <div>
            Source: Aldar · world.aldar.com/uae/abudhabi/lagoons
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="px-3 py-2 border border-border rounded-sm bg-card min-w-[98px]">
      <div className="text-[0.62rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-display num-display tabular text-2xl leading-none mt-0.5 ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

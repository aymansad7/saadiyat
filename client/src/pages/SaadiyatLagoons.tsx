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
import { useState, useMemo } from "react";
import { ArrowUpRight, Compass, Trees, Waves, Building2, Tag, Search } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getAvailability } from "@/data/lagoonsAvailability";

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

type AvailFilter = "all" | "any" | "nas-luxury" | "aldar" | "others" | "none";

export default function SaadiyatLagoons() {
  const { data: lagoonsSummary } = trpc.lagoons.summary.useQuery();
  const { data: lagoonsAllData } = trpc.lagoons.allVillas.useQuery({ limit: 2000 });
  const lagoonsVillas = lagoonsAllData?.villas ?? [];

  const totals = lagoonsSummary?.summary ?? {};
  const [unitQuery, setUnitQuery] = useState("");
  const uq = unitQuery.trim().toLowerCase();
  const unitSearchHits = useMemo(() => {
    if (uq.length < 2) return [];
    const out: Array<{ id: string; unit_name: string; cluster: string; cluster_label: string; status: string | null }> = [];
    for (const v of lagoonsVillas ?? []) {
      if (!v.unit_name) continue;
      if (v.unit_name.toLowerCase().includes(uq) || v.id.toLowerCase().includes(uq) || v.short_name.toLowerCase().includes(uq)) {
        out.push({ id: v.id, unit_name: v.unit_name, cluster: v.cluster, cluster_label: v.cluster_label, status: v.status });
      }
      if (out.length >= 30) break;
    }
    return out;
  }, [uq]);

  // Per-cluster availability counters
  const counters: Record<
    string,
    { any: number; "nas-luxury": number; aldar: number; others: number; none: number }
  > = {
    ethir: { any: 0, "nas-luxury": 0, aldar: 0, others: 0, none: 0 },
    "al-sidr": { any: 0, "nas-luxury": 0, aldar: 0, others: 0, none: 0 },
    "al-ghaf": { any: 0, "nas-luxury": 0, aldar: 0, others: 0, none: 0 },
  };
  let totalAny = 0;
  let totalNas = 0;
  let totalAldar = 0;
  let totalOthers = 0;
  for (const v of lagoonsVillas ?? []) {
    const a = getAvailability(v.unit_name);
    const c = counters[v.cluster];
    if (!c) continue;
    if (a.sources.length > 0) {
      c.any += 1;
      totalAny += 1;
    } else {
      c.none += 1;
    }
    if (a.sources.includes("nas-luxury")) {
      c["nas-luxury"] += 1;
      totalNas += 1;
    }
    if (a.sources.includes("aldar")) {
      c.aldar += 1;
      totalAldar += 1;
    }
    if (a.sources.includes("others")) {
      c.others += 1;
      totalOthers += 1;
    }
  }
  const totalNone = lagoonsSummary?.total_villas ?? 1549 - totalAny;

  // Build hrefs that pre-apply the status filter on the cluster page
  const filterHref = (slug: string, filter: AvailFilter) =>
    filter === "all"
      ? `/saadiyat-lagoons/${slug}`
      : `/saadiyat-lagoons/${slug}?avail=${filter}`;

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
                — {lagoonsSummary?.total_villas ?? 1549} villas across three villages.
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
            <Stat label="Villas" value={String(lagoonsSummary?.total_villas ?? 1549)} />
            <Stat label="Villages" value="3" />
            <Stat label="Available" value={String(totalAny)} accent />
          </div>
          {/* Unit search */}
          <div className="col-span-12 mt-4">
            <div className="flex items-center gap-2 max-w-md">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={unitQuery}
                onChange={e => setUnitQuery(e.target.value)}
                placeholder="Search villa by unit number…"
                className="w-72"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Unit search results */}
      {unitSearchHits.length > 0 && (
        <section className="border-b border-border bg-card/30">
          <div className="container py-6">
            <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-3">
              {unitSearchHits.length} matching villa{unitSearchHits.length === 1 ? "" : "s"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {unitSearchHits.map(hit => (
                <Link
                  key={hit.id}
                  href={`/saadiyat-lagoons/${hit.cluster}/${hit.id}`}
                  className="block rounded-md border border-border bg-card p-3 hover:border-primary/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                      {hit.cluster_label}
                    </span>
                    <span className={`text-[0.65rem] font-mono uppercase ${
                      hit.status === "Sold" ? "text-muted-foreground" : "text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {hit.status || "—"}
                    </span>
                  </div>
                  <div className="font-display text-lg text-foreground">
                    {hit.id}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {hit.unit_name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Availability rail (unified status filter) */}
      <section className="border-b border-border bg-background">
        <div className="container py-6 sm:py-8">
          <div className="flex items-center gap-2 mb-4 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
            <Tag className="h-3.5 w-3.5" />
            Status filter — pick a status, then a village
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatusCard
              label="Any available"
              count={totalAny}
              total={lagoonsSummary?.total_villas ?? 1549}
              tone="emerald"
              variant="any"
              perCluster={counters}
              hrefFor={filterHref}
            />
            <StatusCard
              label="Available with NAS Luxury"
              count={totalNas}
              total={lagoonsSummary?.total_villas ?? 1549}
              tone="emerald-strong"
              variant="nas-luxury"
              perCluster={counters}
              hrefFor={filterHref}
            />
            <StatusCard
              label="Aldar Resale"
              count={totalAldar}
              total={lagoonsSummary?.total_villas ?? 1549}
              tone="amber"
              variant="aldar"
              perCluster={counters}
              hrefFor={filterHref}
            />
            <StatusCard
              label="Other brokers"
              count={totalOthers}
              total={lagoonsSummary?.total_villas ?? 1549}
              tone="slate"
              variant="others"
              perCluster={counters}
              hrefFor={filterHref}
            />
            <StatusCard
              label="Not available"
              count={totalNone}
              total={lagoonsSummary?.total_villas ?? 1549}
              tone="muted"
              variant="none"
              perCluster={counters}
              hrefFor={filterHref}
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Pick any status to drill down into the village. The same filter is
            also available on every cluster page and inside each villa detail.
          </p>
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
            const cc = counters[c.slug];
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

                  <div className="mt-auto pt-6 flex items-baseline justify-between border-t border-border/60 mt-6 gap-3">
                    <div>
                      <div className="text-[0.7rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
                        Corners · Single-row
                      </div>
                      <div className="font-mono text-sm tabular text-foreground mt-0.5">
                        {s?.corners ?? 0} · {s?.edges ?? 0}
                      </div>
                    </div>
                    {cc && cc.any > 0 ? (
                      <div className="text-right">
                        <div className="text-[0.7rem] uppercase tracking-[0.18em] font-mono text-emerald-700">
                          Available
                        </div>
                        <div className="font-mono text-sm tabular text-emerald-700 mt-0.5">
                          {cc.any} villa{cc.any === 1 ? "" : "s"}
                        </div>
                      </div>
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Amenity rail */}
        <div className="mt-10 border border-border rounded-md bg-card/50 p-5 sm:p-7">
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
          accent ? "text-emerald-700" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function StatusCard({
  label,
  count,
  total,
  tone,
  variant,
  perCluster,
  hrefFor,
}: {
  label: string;
  count: number;
  total: number;
  tone: "emerald" | "emerald-strong" | "amber" | "slate" | "muted";
  variant: AvailFilter;
  perCluster: Record<
    string,
    { any: number; "nas-luxury": number; aldar: number; others: number; none: number }
  >;
  hrefFor: (slug: string, filter: AvailFilter) => string;
}) {
  const toneClasses: Record<typeof tone, string> = {
    emerald: "border-emerald-200 bg-emerald-50/60 text-emerald-800",
    "emerald-strong": "border-emerald-400 bg-emerald-100/70 text-emerald-900",
    amber: "border-amber-200 bg-amber-50/60 text-amber-800",
    slate: "border-slate-200 bg-slate-50/70 text-slate-700",
    muted: "border-border bg-card text-muted-foreground",
  };
  const valueColor: Record<typeof tone, string> = {
    emerald: "text-emerald-700",
    "emerald-strong": "text-emerald-800",
    amber: "text-amber-700",
    slate: "text-slate-700",
    muted: "text-foreground",
  };
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div
      className={`p-4 rounded-md border ${toneClasses[tone]} flex flex-col gap-2`}
    >
      <div className="text-[0.65rem] uppercase tracking-[0.18em] font-mono">
        {label}
      </div>
      <div className={`font-display tabular text-3xl leading-none ${valueColor[tone]}`}>
        {count}
        <span className="text-xs font-mono ml-1.5 align-middle text-muted-foreground">
          / {total} ({pct}%)
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1 mt-1">
        {(["ethir", "al-sidr", "al-ghaf"] as const).map((slug) => {
          const c = perCluster[slug];
          const n =
            variant === "all"
              ? 0
              : variant === "any"
              ? c.any
              : variant === "none"
              ? c.none
              : c[variant];
          return (
            <Link
              key={slug}
              href={hrefFor(slug, variant)}
              className="text-[0.62rem] font-mono uppercase tracking-[0.14em] px-1.5 py-1 rounded-sm bg-white/60 hover:bg-white border border-transparent hover:border-current transition-colors flex items-center justify-between"
            >
              <span className="truncate">
                {slug === "al-sidr" ? "Sidr" : slug === "al-ghaf" ? "Ghaf" : "Ethir"}
              </span>
              <span className={`tabular ${valueColor[tone]}`}>{n}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

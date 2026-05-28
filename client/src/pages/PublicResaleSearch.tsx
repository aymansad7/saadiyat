/**
 * /resale-search — Resale Filter (admin-only)
 *
 * This page is gated TWICE:
 *   1. It sits behind the site-wide PasswordGate (see App.tsx).
 *   2. It additionally requires `ctx.user.role` to be `admin` or `master`.
 *
 * Two sources are merged:
 *   - "Resale with Aldar"  → owner-listed asking prices (~119 listings)
 *   - "Live primary"       → Aldar's own live inventory across Saadiyat +
 *                            other areas (Yas Island / Al Ghadeer / etc.)
 *
 * Filters: source, area, bedrooms, price range, free-text search.
 */
import { useEffect, useState } from "react";
import { Link, Redirect } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  ArrowUpRight,
  ExternalLink,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

type SourceKey = "all" | "nas-luxury" | "aldar-resale" | "primary-live";
type AreaKey = "all" | "saadiyat" | "yas-island" | "al-ghadeer" | "other";
type BedroomsKey = "all" | "studio" | "1" | "2" | "3" | "4" | "5+";
type SortKey = "price-asc" | "price-desc" | "area";

function fmtAed(n: number | null | undefined) {
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return null;
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m >= 100 ? m.toFixed(0) : m.toFixed(m >= 10 ? 1 : 2)}M`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(n);
}

function fmtAedFull(n: number | null | undefined) {
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return null;
  return new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(n);
}

const AREA_OPTIONS: { key: AreaKey; label: string }[] = [
  { key: "all", label: "All areas" },
  { key: "saadiyat", label: "Saadiyat Island" },
  { key: "yas-island", label: "Yas Island" },
  { key: "al-ghadeer", label: "Al Ghadeer" },
  { key: "other", label: "Other" },
];

const SOURCE_OPTIONS: { key: SourceKey; label: string; sub: string }[] = [
  { key: "all", label: "Any availability", sub: "NAS Luxury + Resale + Live" },
  { key: "nas-luxury", label: "Available with NAS Luxury", sub: "Curated Saadiyat Lagoons collection" },
  { key: "aldar-resale", label: "Resale with Aldar", sub: "Owner asking prices" },
  { key: "primary-live", label: "Live primary", sub: "Aldar inventory available now" },
];

const BEDROOM_OPTIONS: { key: BedroomsKey; label: string }[] = [
  { key: "all", label: "Any" },
  { key: "studio", label: "Studio" },
  { key: "1", label: "1" },
  { key: "2", label: "2" },
  { key: "3", label: "3" },
  { key: "4", label: "4" },
  { key: "5+", label: "5+" },
];

export default function PublicResaleSearch() {
  const { user, loading } = useAuth();
  const isMaster = user?.role === "master";
  const isAdmin = user?.role === "admin" || isMaster;

  const [source, setSource] = useState<SourceKey>("all");
  const [area, setArea] = useState<AreaKey>("all");
  const [bedrooms, setBedrooms] = useState<BedroomsKey>("all");
  const [sort, setSort] = useState<SortKey>("price-desc");
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 220);
    return () => clearTimeout(t);
  }, [query]);

  const minNum = minPrice.trim() === "" ? undefined : Number(minPrice);
  const maxNum = maxPrice.trim() === "" ? undefined : Number(maxPrice);

  const summary = trpc.publicResale.summary.useQuery(undefined, { enabled: isAdmin });
  const list = trpc.publicResale.list.useQuery(
    {
      query: debouncedQuery || undefined,
      source,
      area,
      bedrooms,
      sort,
      minPrice: typeof minNum === "number" && !Number.isNaN(minNum) ? minNum : undefined,
      maxPrice: typeof maxNum === "number" && !Number.isNaN(maxNum) ? maxNum : undefined,
      limit: 800,
    },
    { enabled: isAdmin },
  );

  const items = list.data?.items ?? [];

  // Auth guard: must be signed in AND admin/master.
  if (loading) return null;
  if (!user) {
    if (typeof window !== "undefined") window.location.href = getLoginUrl();
    return null;
  }
  if (!isAdmin) return <Redirect to="/" />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Admin-only header */}
      <header className="border-b border-border/70 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-3 sm:py-4 flex items-center gap-4">
          <Link href="/resale-search" className="flex items-center gap-2.5 group">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
              <MapPin className="h-3.5 w-3.5" />
            </span>
            <div className="leading-tight">
              <div className="font-display text-[1.35rem] sm:text-[1.55rem] font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                Saadiyat
              </div>
              <div className="text-[0.72rem] uppercase tracking-[0.18em] text-muted-foreground font-mono">
                Resale filter · admin
              </div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-card border-primary/30 text-primary hover:bg-primary/10 hover:text-primary gap-1.5"
            >
              <Link href="/">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>Back to dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO + FILTER STRIP */}
      <section className="border-b border-border bg-card/40">
        <div className="container py-8 sm:py-10">
          <div className="flex items-baseline gap-3 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Admin tools
          </div>
          <h1 className="font-display text-3xl sm:text-[3rem] leading-tight text-foreground">
            What is available right now,{" "}
            <span className="italic text-primary">across every area.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Pick a filter — Resale with Aldar, live Aldar inventory, or both —
            and instantly see every property currently on offer across
            Saadiyat, Yas Island, Al Ghadeer and other Aldar communities.
          </p>

          {/* Summary stats */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl">
            <Stat
              label="NAS Luxury"
              value={summary.data ? `${summary.data.nas_luxury}` : "…"}
              accent
            />
            <Stat
              label="Total listings"
              value={summary.data ? `${summary.data.total}` : "…"}
            />
            <Stat
              label="Resale w/ Aldar"
              value={summary.data ? `${summary.data.aldar_resale}` : "…"}
            />
            <Stat
              label="Live primary"
              value={summary.data ? `${summary.data.primary_live}` : "…"}
            />
            <Stat
              label="After filters"
              value={
                list.data ? `${list.data.total_after_filters}` : "…"
              }
            />
          </div>
        </div>
      </section>

      {/* PRIMARY FILTER — SOURCE (the headline filter the user asked for) */}
      <section className="border-b border-border bg-background">
        <div className="container py-5">
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-mono text-muted-foreground mb-3">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SOURCE_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSource(opt.key)}
                className={[
                  "text-left rounded-md border p-4 transition-all",
                  source === opt.key
                    ? "border-primary bg-primary/[0.06] shadow-[0_8px_30px_-15px_rgba(186,100,60,0.45)]"
                    : "border-border bg-card hover:border-primary/40",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg text-foreground">
                    {opt.label}
                  </span>
                  {source === opt.key && (
                    <span className="text-[0.6rem] font-mono uppercase tracking-[0.18em] text-primary border border-primary/40 px-1.5 py-0.5 rounded-sm">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {opt.sub}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECONDARY FILTERS — AREA / BEDROOMS / PRICE / SEARCH / SORT */}
      <section className="border-b border-border bg-card/30">
        <div className="container py-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-mono text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Refine
          </div>
          {/* Area pills */}
          <div className="flex items-center gap-1 rounded-md border border-border bg-card overflow-hidden">
            {AREA_OPTIONS.map(o => (
              <button
                key={o.key}
                onClick={() => setArea(o.key)}
                className={
                  "px-3 py-1.5 text-xs font-mono uppercase tracking-[0.16em] " +
                  (area === o.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {o.label}
              </button>
            ))}
          </div>
          {/* Bedrooms pills */}
          <div className="flex items-center gap-1 rounded-md border border-border bg-card overflow-hidden">
            <span className="px-2 text-[0.65rem] font-mono uppercase tracking-[0.16em] text-muted-foreground">
              BR
            </span>
            {BEDROOM_OPTIONS.map(o => (
              <button
                key={o.key}
                onClick={() => setBedrooms(o.key)}
                className={
                  "px-2.5 py-1.5 text-xs font-mono " +
                  (bedrooms === o.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {o.label}
              </button>
            ))}
          </div>
          {/* Price */}
          <div className="flex items-center gap-1.5">
            <span className="text-[0.65rem] font-mono uppercase tracking-[0.16em] text-muted-foreground">
              AED
            </span>
            <Input
              value={minPrice}
              onChange={e => setMinPrice(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Min"
              className="h-9 w-24"
              inputMode="numeric"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Max"
              className="h-9 w-24"
              inputMode="numeric"
            />
          </div>
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search project / unit / area"
              className="pl-9 h-9"
            />
          </div>
          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="h-9 rounded-md border border-border bg-card px-2 text-xs font-mono uppercase tracking-[0.14em] text-foreground"
          >
            <option value="price-desc">Price ↓</option>
            <option value="price-asc">Price ↑</option>
            <option value="area">By area</option>
          </select>
          {(source !== "all" ||
            area !== "all" ||
            bedrooms !== "all" ||
            query ||
            minPrice ||
            maxPrice) && (
            <button
              onClick={() => {
                setSource("all");
                setArea("all");
                setBedrooms("all");
                setQuery("");
                setMinPrice("");
                setMaxPrice("");
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-dotted"
            >
              Clear all
            </button>
          )}
        </div>
      </section>

      {/* RESULTS */}
      <main className="container py-6 sm:py-8 flex-1">
        {list.isLoading ? (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="font-display text-2xl text-foreground">
              No matches.
            </div>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Try widening your filter — pick "Any resale", switch area to
              "All areas", or clear price bounds.
            </p>
          </div>
        ) : (
          <>
            <div className="text-xs text-muted-foreground mb-3 font-mono uppercase tracking-[0.16em]">
              Showing {items.length}{" "}
              {list.data?.truncated && ` of ${list.data.total_after_filters}`}{" "}
              listings
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(it => (
                <ListingCard key={it.id} item={it} />
              ))}
            </div>
            {list.data?.truncated && (
              <div className="text-xs text-muted-foreground text-center mt-6">
                Truncated at 800 — refine your filters for a narrower list.
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-border bg-card/60">
        <div className="container py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-muted-foreground">
          <div className="font-mono uppercase tracking-[0.18em]">
            Saadiyat · Resale filter · admin
          </div>
          <div>
            Sources: Aldar Resale workbook · Aldar primary inventory.
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "rounded-md border px-3 py-2 " +
        (accent ? "border-primary/40 bg-primary/5" : "border-border bg-card")
      }
    >
      <div className="text-[0.65rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
        {label}
      </div>
      <div
        className={
          "font-display text-xl mt-0.5 num-display " +
          (accent ? "text-primary" : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}

type Listing = {
  id: string;
  source: "aldar-resale" | "primary-live" | "nas-luxury";
  area: string;
  area_label: string;
  project_name: string;
  building_name: string | null;
  unit_number: string;
  unit_type: string | null;
  bedrooms: number | null;
  saleable_area_sqft: number | null;
  status: string | null;
  price_aed: number | null;
  price_label: string;
  aldar_url: string | null;
  internal_href: string | null;
  nas_luxury?: {
    option: number;
    short_code: string;
    cluster_label: string;
    plot_sqm: number | null;
    built_up_sqft: number | null;
    built_up_sqm: number | null;
    position: string | null;
    finishing: string | null;
    specification: string | null;
    pod: boolean;
    premium: boolean;
    original_price_aed: number | null;
    payment_plan: string | null;
    paid_percent: number | null;
    highlights: string | null;
    signature_deal: boolean;
    agent: { name: string; email: string; phone: string };
  } | null;
};

function ListingCard({ item }: { item: Listing }) {
  const priceShort = fmtAed(item.price_aed);
  const priceFull = fmtAedFull(item.price_aed);
  const isResale = item.source === "aldar-resale";
  const isNas = item.source === "nas-luxury";
  const nl = item.nas_luxury ?? null;

  const inner = (
    <Card
      className={
        "relative h-full p-4 sm:p-5 transition-colors " +
        (isNas
          ? "border-primary/40 bg-primary/[0.025] hover:border-primary hover:bg-primary/[0.05] cursor-pointer ring-1 ring-primary/10"
          : item.internal_href || item.aldar_url
          ? "cursor-pointer hover:border-primary/50 hover:bg-primary/[0.02]"
          : "")
      }
    >
      {isNas && nl?.signature_deal && (
        <div className="absolute -top-2 right-3 text-[0.55rem] uppercase tracking-[0.2em] font-mono bg-primary text-primary-foreground px-2 py-0.5 rounded-sm shadow-sm">
          Signature deal
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.6rem] uppercase tracking-[0.22em] font-mono text-muted-foreground">
          {item.area_label}
        </span>
        {isNas ? (
          <span className="text-[0.6rem] uppercase tracking-[0.18em] font-mono px-1.5 py-0.5 rounded-sm border border-primary/50 bg-primary/10 text-primary">
            NAS Luxury
          </span>
        ) : isResale ? (
          <span className="text-[0.6rem] uppercase tracking-[0.18em] font-mono px-1.5 py-0.5 rounded-sm border border-emerald-500/40 bg-emerald-50 text-emerald-800">
            Resale
          </span>
        ) : (
          <span className="text-[0.6rem] uppercase tracking-[0.18em] font-mono px-1.5 py-0.5 rounded-sm border border-sky-500/40 bg-sky-50 text-sky-800">
            {item.status || "Live"}
          </span>
        )}
      </div>
      <h3 className="font-display text-lg text-foreground mt-2 leading-tight">
        {isNas && nl ? `Option ${nl.option} · ${nl.short_code}` : item.project_name}
      </h3>
      <div className="text-xs text-muted-foreground mt-0.5 truncate">
        {item.unit_number}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {typeof item.bedrooms === "number" && (
          <span>
            {item.bedrooms === 0 ? "Studio" : `${item.bedrooms} BR Villa`}
          </span>
        )}
        {isNas && nl?.plot_sqm ? (
          <span className="num-display">{Math.round(nl.plot_sqm)} m² plot</span>
        ) : (
          item.saleable_area_sqft && (
            <span className="num-display">
              {item.saleable_area_sqft.toLocaleString()} sqft
            </span>
          )
        )}
        {isNas && nl?.built_up_sqft && (
          <span className="num-display">{nl.built_up_sqft.toLocaleString()} sqft built-up</span>
        )}
      </div>
      {isNas && nl && (
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[0.7rem]">
          {nl.specification && (
            <div>
              <div className="text-[0.55rem] uppercase tracking-[0.16em] font-mono text-muted-foreground">Spec</div>
              <div className="text-foreground">{nl.specification}</div>
            </div>
          )}
          {nl.position && (
            <div>
              <div className="text-[0.55rem] uppercase tracking-[0.16em] font-mono text-muted-foreground">Position</div>
              <div className="text-foreground">{nl.position}</div>
            </div>
          )}
          {nl.finishing && (
            <div>
              <div className="text-[0.55rem] uppercase tracking-[0.16em] font-mono text-muted-foreground">Finishing</div>
              <div className="text-foreground">{nl.finishing}</div>
            </div>
          )}
          {nl.payment_plan && (
            <div>
              <div className="text-[0.55rem] uppercase tracking-[0.16em] font-mono text-muted-foreground">Plan</div>
              <div className="text-foreground num-display">
                {nl.payment_plan}
                {typeof nl.paid_percent === "number" ? ` · ${nl.paid_percent}% paid` : ""}
              </div>
            </div>
          )}
          {nl.original_price_aed && (
            <div className="col-span-2">
              <div className="text-[0.55rem] uppercase tracking-[0.16em] font-mono text-muted-foreground">Aldar original</div>
              <div className="text-foreground num-display">
                AED {fmtAedFull(nl.original_price_aed)}
              </div>
            </div>
          )}
          {nl.highlights && (
            <div className="col-span-2 text-foreground/80 italic">{nl.highlights}</div>
          )}
        </div>
      )}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-baseline justify-between">
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
            {item.price_label}
          </div>
          <div
            className="font-display text-2xl text-foreground num-display"
            title={priceFull ? `AED ${priceFull}` : undefined}
          >
            {priceShort ? `AED ${priceShort}` : "On request"}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {item.aldar_url && (
            <a
              href={item.aldar_url}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-muted-foreground hover:text-primary p-1"
              title="Aldar listing"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {item.internal_href && (
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
    </Card>
  );

  if (item.internal_href) {
    return (
      <Link href={item.internal_href} className="block h-full">
        {inner}
      </Link>
    );
  }
  if (item.aldar_url) {
    return (
      <a
        href={item.aldar_url}
        target="_blank"
        rel="noreferrer"
        className="block h-full"
      >
        {inner}
      </a>
    );
  }
  return <div className="block h-full">{inner}</div>;
}

/**
 * /resale  —  "Resale with Aldar"
 *
 * Lists all resale rows from the Aldar Resale ALL workbook. Admins see only
 * Saadiyat rows; masters see Saadiyat + Other Aldar projects. Each row links
 * back to its inventory unit when matched.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, Redirect } from "wouter";
import { ExternalLink, Search } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

function fmtAed(n: number | null | undefined) {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(n);
}

function unitHref(item: {
  matched: boolean;
  area?: "saadiyat" | "other";
  project_slug?: string;
  building_slug?: string | null;
  unit_number: string;
}) {
  if (!item.matched || !item.project_slug) return null;
  if (item.area === "other" && item.building_slug) {
    return `/aldar-other/${item.project_slug}/${item.building_slug}/${encodeURIComponent(item.unit_number)}`;
  }
  if (item.area === "saadiyat" && item.building_slug) {
    return `/aldar-saadiyat/${item.project_slug}/${item.building_slug}/${encodeURIComponent(item.unit_number)}`;
  }
  return null;
}

export default function Resale() {
  const { user, loading } = useAuth();
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<"all" | "saadiyat" | "other">("all");
  const [matchedOnly, setMatchedOnly] = useState(false);

  // Debounce query for tRPC calls
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 220);
    return () => clearTimeout(t);
  }, [query]);

  const isMaster = user?.role === "master";
  const isAdmin = user?.role === "admin" || isMaster;

  const summaryQ = trpc.resale.summary.useQuery(undefined, { enabled: isAdmin });
  const listQ = trpc.resale.list.useQuery(
    {
      query: debounced || undefined,
      area: isMaster ? area : "saadiyat",
      matchedOnly,
      limit: 500,
    },
    { enabled: isAdmin },
  );

  const items = listQ.data?.items ?? [];
  const showAreaFilter = isMaster;

  if (loading) return null;
  if (!user) {
    if (typeof window !== "undefined") window.location.href = getLoginUrl();
    return null;
  }
  if (!isAdmin) return <Redirect to="/" />;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle="Resale with Aldar" />
      <section className="border-b border-border bg-card/50">
        <div className="container py-8 sm:py-10">
          <div className="flex items-baseline gap-3 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
            <span className="h-px w-6 bg-primary/60" />
            Resale with Aldar
          </div>
          <h1 className="font-display text-4xl sm:text-[3rem] leading-tight text-foreground">
            Live resale listings
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Asking prices pulled from Aldar's resale workbook and matched to our inventory.
            Click any row to jump to the unit's full record.
          </p>

          {summaryQ.data && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              <Stat label="Visible to you" value={`${summaryQ.data.visible}`} />
              <Stat label="Saadiyat" value={`${summaryQ.data.saadiyat}`} />
              {isMaster && <Stat label="Other Aldar" value={`${summaryQ.data.other}`} />}
              <Stat
                label="Avg asking"
                value={
                  summaryQ.data.avg_asking_aed
                    ? `AED ${fmtAed(summaryQ.data.avg_asking_aed)}`
                    : "—"
                }
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search unit number, project, location"
                className="pl-9"
              />
            </div>
            {showAreaFilter && (
              <div className="flex items-center gap-1 rounded-md border border-border bg-card overflow-hidden">
                {(["all", "saadiyat", "other"] as const).map(a => (
                  <button
                    key={a}
                    onClick={() => setArea(a)}
                    className={
                      "px-3 py-1.5 text-xs uppercase tracking-[0.18em] font-mono " +
                      (area === a
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {a === "all" ? "All" : a === "saadiyat" ? "Saadiyat" : "Other Aldar"}
                  </button>
                ))}
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch checked={matchedOnly} onCheckedChange={setMatchedOnly} />
              Matched to inventory only
            </label>
          </div>
        </div>
      </section>

      <main className="container py-6 sm:py-8 flex-1">
        {listQ.isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            No resale rows match your filters.
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map(item => (
              <ResaleRow key={`${item.property_id}-${item.unit_number}`} item={item} />
            ))}
            {listQ.data?.truncated && (
              <div className="text-xs text-muted-foreground text-center pt-2">
                Showing first 500 — refine your search to narrow further.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2">
      <div className="text-[0.65rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-xl text-foreground mt-0.5 num-display">{value}</div>
    </div>
  );
}

function ResaleRow({
  item,
}: {
  item: {
    property_id: number | string;
    unit_number: string;
    project_resale_name: string;
    community_location: string;
    asking_price_aed: number | null;
    unit_type: string | null;
    bedrooms: number | null;
    saleable_area_sqft: number | null;
    aldar_url: string | null;
    matched: boolean;
    area?: "saadiyat" | "other";
    project_slug?: string;
    project_name?: string;
    building_slug?: string | null;
    building_name?: string | null;
    inventory_status?: string | null;
    is_resale: boolean;
    off_plan: boolean;
  };
}) {
  const href = unitHref(item);
  const price = fmtAed(item.asking_price_aed);
  const Wrapper: any = href ? Link : "div";
  const wrapperProps = href ? { href } : {};
  return (
    <Wrapper {...wrapperProps}>
      <Card
        className={
          "flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-5 sm:py-4 transition-colors " +
          (href ? "cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02]" : "")
        }
      >
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
            {item.community_location}
            {item.project_resale_name ? ` · ${item.project_resale_name}` : ""}
            {!item.matched && (
              <span className="ml-2 rounded-sm border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-amber-800">
                Unmatched
              </span>
            )}
          </div>
          <div className="font-display text-lg text-foreground mt-0.5 truncate">
            {item.unit_number}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {[
              item.unit_type,
              item.bedrooms ? `${item.bedrooms} BHK` : null,
              item.saleable_area_sqft ? `${item.saleable_area_sqft} sqft` : null,
              item.inventory_status ? `Status: ${item.inventory_status}` : null,
            ]
              .filter(Boolean)
              .join(" · ") || ""}
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0 min-w-[140px]">
          <div className="font-display text-2xl text-foreground num-display">
            {price ? `AED ${price}` : "Price on request"}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            {item.is_resale && (
              <span className="text-[0.62rem] uppercase tracking-[0.18em] font-mono px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                Resale
              </span>
            )}
            {item.off_plan && (
              <span className="text-[0.62rem] uppercase tracking-[0.18em] font-mono px-1.5 py-0.5 rounded-sm bg-sky-100 text-sky-800">
                Off-plan
              </span>
            )}
            {item.aldar_url && (
              <a
                href={item.aldar_url}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </Card>
    </Wrapper>
  );
}

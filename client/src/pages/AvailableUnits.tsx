/**
 * /available-units — Global filter page
 *
 * Shows all available units across ALL projects (Saadiyat, Other, Lagoons)
 * with bedroom filter buttons, price range inputs, and results grouped by project.
 * Public (behind passcode gate) — no login required.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Filter,
  Building2,
  MapPin,
  ArrowRight,
  X,
  BedDouble,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { fmtAed } from "@/data/aldar/format";

const BEDROOM_OPTIONS = [
  { label: "Studio", value: "Studio" },
  { label: "1 BR", value: "1" },
  { label: "2 BR", value: "2" },
  { label: "3 BR", value: "3" },
  { label: "4 BR", value: "4" },
  { label: "5+ BR", value: "5" },
];

function statusColor(status: string | null): string {
  if (!status) return "text-muted-foreground";
  const s = status.toLowerCase();
  if (s === "available" || s === "new") return "text-emerald-600 dark:text-emerald-400";
  if (s === "booked" || s === "reserved") return "text-amber-600 dark:text-amber-400";
  if (s === "sold") return "text-rose-600 dark:text-rose-400";
  return "text-muted-foreground";
}

function datasetBadge(dataset: string) {
  if (dataset === "saadiyat") return <span className="text-[0.6rem] font-mono uppercase tracking-wider text-primary border border-primary/40 px-1 rounded-sm">Saadiyat</span>;
  if (dataset === "other") return <span className="text-[0.6rem] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-300 border border-rose-500/40 px-1 rounded-sm">Other</span>;
  if (dataset === "lagoons") return <span className="text-[0.6rem] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-300 border border-blue-500/40 px-1 rounded-sm">Lagoons</span>;
  return null;
}

export default function AvailableUnits() {
  const [bedrooms, setBedrooms] = useState<string | undefined>(undefined);
  const [availableOnly, setAvailableOnly] = useState(true);
  const [priceMinStr, setPriceMinStr] = useState("");
  const [priceMaxStr, setPriceMaxStr] = useState("");
  const [dataset, setDataset] = useState<"all" | "saadiyat" | "other" | "lagoons">("all");

  const priceMin = useMemo(() => {
    const n = parseInt(priceMinStr.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [priceMinStr]);
  const priceMax = useMemo(() => {
    const n = parseInt(priceMaxStr.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [priceMaxStr]);

  const { data, isLoading } = trpc.unitSearch.filter.useQuery({
    availableOnly,
    bedrooms,
    dataset,
    priceMin,
    priceMax,
    limit: 500,
  });

  const results = data?.results ?? [];

  // Group results by project
  const grouped = useMemo(() => {
    const map = new Map<string, { projectName: string; dataset: string; units: typeof results }>();
    for (const u of results) {
      const key = `${u.dataset}:${u.projectSlug}`;
      if (!map.has(key)) {
        map.set(key, { projectName: u.projectName, dataset: u.dataset, units: [] });
      }
      map.get(key)!.units.push(u);
    }
    return Array.from(map.values()).sort((a, b) => b.units.length - a.units.length);
  }, [results]);

  const hasFilters = bedrooms || priceMinStr || priceMaxStr || dataset !== "all" || !availableOnly;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader subTitle="Available Units" back={{ href: "/", label: "Home" }} />

      <main className="container py-6 sm:py-8 space-y-6">
        {/* Title */}
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-primary" />
          <h1 className="font-display text-xl sm:text-2xl font-semibold tracking-tight">
            Filter All Units
          </h1>
          {data && (
            <span className="text-sm text-muted-foreground ml-auto">
              {results.length} unit{results.length !== 1 ? "s" : ""} found
            </span>
          )}
        </div>

        {/* Filter bar */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          {/* Bedroom buttons */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5" /> Bedrooms
            </label>
            <div className="flex flex-wrap gap-2">
              {BEDROOM_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={bedrooms === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBedrooms(bedrooms === opt.value ? undefined : opt.value)}
                  className="text-xs"
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Price range + toggles */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Min Price (AED)</label>
              <Input
                type="text"
                placeholder="e.g. 500000"
                value={priceMinStr}
                onChange={(e) => setPriceMinStr(e.target.value)}
                className="w-36 h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Max Price (AED)</label>
              <Input
                type="text"
                placeholder="e.g. 5000000"
                value={priceMaxStr}
                onChange={(e) => setPriceMaxStr(e.target.value)}
                className="w-36 h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={availableOnly} onCheckedChange={setAvailableOnly} id="avail-only" />
              <label htmlFor="avail-only" className="text-xs text-muted-foreground cursor-pointer">Available only</label>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={dataset}
                onChange={(e) => setDataset(e.target.value as typeof dataset)}
                className="h-9 rounded-md border border-border bg-card px-2 text-xs text-foreground"
              >
                <option value="all">All Projects</option>
                <option value="saadiyat">Saadiyat Only</option>
                <option value="other">Other Only</option>
                <option value="lagoons">Lagoons Only</option>
              </select>
            </div>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground gap-1"
                onClick={() => {
                  setBedrooms(undefined);
                  setPriceMinStr("");
                  setPriceMaxStr("");
                  setDataset("all");
                  setAvailableOnly(true);
                }}
              >
                <X className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Filter className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No units match your filters.</p>
            <p className="text-xs mt-1">Try adjusting bedrooms, price range, or availability.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={`${group.dataset}:${group.projectName}`} className="rounded-lg border border-border bg-card overflow-hidden">
                {/* Project header */}
                <div className="px-4 py-3 bg-accent/30 border-b border-border flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-display text-sm font-semibold text-foreground">{group.projectName}</span>
                  {datasetBadge(group.dataset)}
                  <span className="ml-auto text-xs text-muted-foreground">{group.units.length} unit{group.units.length !== 1 ? "s" : ""}</span>
                </div>
                {/* Unit rows */}
                <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                  {group.units.map((u, i) => (
                    <Link
                      key={`${u.unitName}-${i}`}
                      href={u.href}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/40 transition-colors"
                    >
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate block">{u.unitName}</span>
                        <span className="text-xs text-muted-foreground">
                          {u.buildingName ? `${u.buildingName} · ` : ""}
                          {u.bedrooms ? `${u.bedrooms} BR` : u.unitType || "—"}
                          {u.priceAed ? ` · AED ${fmtAed(u.priceAed)}` : ""}
                        </span>
                      </div>
                      <span className={`text-xs font-mono shrink-0 ${statusColor(u.status)}`}>
                        {u.status || "—"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

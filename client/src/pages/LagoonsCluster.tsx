/**
 * Coastal Atelier — Lagoons cluster page
 *
 * Lists every villa inside one of the three Lagoons villages
 * (Ethir / Al Sidr / Al Ghaf) with filters for bedrooms, position-type
 * (corner / single-row / interior), mirror, and a free-text search.
 *
 * Routes served:
 *   /saadiyat-lagoons/ethir
 *   /saadiyat-lagoons/al-sidr
 *   /saadiyat-lagoons/al-ghaf
 */
import { useMemo, useState } from "react";
import { Redirect, useParams } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import LagoonsVillaCard from "@/components/LagoonsVillaCard";
import {
  LAGOONS_DATASET,
  getLagoonsVillasByCluster,
  type LagoonsVilla,
} from "@/data/lagoons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw, ExternalLink } from "lucide-react";

const CLUSTER_LABELS: Record<string, string> = {
  ethir: "Ethir",
  "al-sidr": "Al Sidr",
  "al-ghaf": "Al Ghaf",
};

type PositionFilter = "all" | "corner" | "edge" | "interior";
type BedroomFilter = "all" | "4" | "5" | "6";

export default function LagoonsCluster() {
  const params = useParams<{ cluster: string }>();
  const cluster = params.cluster ?? "";
  if (!(cluster in CLUSTER_LABELS)) return <Redirect to="/saadiyat-lagoons" />;

  const label = CLUSTER_LABELS[cluster];
  const all = useMemo(() => getLagoonsVillasByCluster(cluster), [cluster]);
  const summary = LAGOONS_DATASET.summary[cluster];

  const [query, setQuery] = useState("");
  const [bedFilter, setBedFilter] = useState<BedroomFilter>("all");
  const [posFilter, setPosFilter] = useState<PositionFilter>("all");
  const [pageSize, setPageSize] = useState<number>(48);

  const filtered: LagoonsVilla[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((v) => {
        if (bedFilter !== "all" && String(v.bedrooms) !== bedFilter) return false;
        if (posFilter !== "all" && v.position_type !== posFilter) return false;
        if (q) {
          return (
            v.short_name.toLowerCase().includes(q) ||
            v.unit_name.toLowerCase().includes(q) ||
            (v.variant ?? "").toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => a.short_name.localeCompare(b.short_name, undefined, { numeric: true }));
  }, [all, query, bedFilter, posFilter]);

  const visible = filtered.slice(0, pageSize);

  function reset() {
    setQuery("");
    setBedFilter("all");
    setPosFilter("all");
    setPageSize(48);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        subTitle={`Saadiyat Lagoons · ${label}`}
        back={{ href: "/saadiyat-lagoons", label: "Back to Lagoons" }}
      />

      {/* Header */}
      <section className="border-b border-border bg-card/50">
        <div className="container py-6 sm:py-8 grid grid-cols-12 gap-4 items-end">
          <div className="col-span-12 md:col-span-8">
            <div className="flex items-center gap-2 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
              <span className="h-px w-6 bg-primary/60" />
              Saadiyat Lagoons · Aldar
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-foreground">
              {label}
              <span className="text-muted-foreground italic">
                {" "}
                — {summary?.total ?? all.length} villas
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
              Every card opens a detail view with the official Aldar portal
              page, a Google Maps pin for the village, and the five nearest
              amenities with distances in metres.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 flex flex-wrap gap-3 md:justify-end">
            <Stat
              label="4 BR"
              value={String(summary?.by_model?.["4BHK"] ?? 0)}
            />
            <Stat
              label="5 BR"
              value={String(summary?.by_model?.["5BHK"] ?? 0)}
            />
            <Stat
              label="6 BR"
              value={String(summary?.by_model?.["6BHK"] ?? 0)}
              accent
            />
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <nav className="border-b border-border bg-background sticky top-[60px] sm:top-[68px] z-30 backdrop-blur-md bg-background/85">
        <div className="container py-3 sm:py-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search villa (e.g. 001-01, A0, MIRROR)…"
              className="pl-9 bg-card border-border h-9"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <FilterSelect
              label="Bedrooms"
              value={bedFilter}
              onChange={(v) => setBedFilter(v as BedroomFilter)}
              options={[
                { value: "all", label: "All bedrooms" },
                { value: "4", label: "4 BR" },
                { value: "5", label: "5 BR" },
                { value: "6", label: "6 BR" },
              ]}
            />
            <FilterSelect
              label="Position"
              value={posFilter}
              onChange={(v) => setPosFilter(v as PositionFilter)}
              options={[
                { value: "all", label: "All positions" },
                { value: "corner", label: "Corner" },
                { value: "edge", label: "Single-row" },
                { value: "interior", label: "Interior" },
              ]}
            />
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="h-9 w-[120px] bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">Show 24</SelectItem>
                <SelectItem value="48">Show 48</SelectItem>
                <SelectItem value="96">Show 96</SelectItem>
                <SelectItem value="9999">Show all</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="h-9 text-muted-foreground hover:text-foreground gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 bg-card gap-1.5 hidden md:inline-flex"
            >
              <a
                href="https://world.aldar.com/uae/abudhabi/lagoons"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Aldar map
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Cards */}
      <main className="container py-6 sm:py-8">
        <div className="mb-4 text-xs font-mono text-muted-foreground">
          Showing{" "}
          <span className="text-foreground tabular">
            {Math.min(visible.length, filtered.length)}
          </span>{" "}
          of <span className="text-foreground tabular">{filtered.length}</span>{" "}
          villas
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-md">
            <div className="font-display text-2xl text-foreground">
              No villas match this filter
            </div>
            <Button onClick={reset} variant="outline" className="mt-4 bg-card">
              Reset
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visible.map((v) => (
                <LagoonsVillaCard key={v.unit_name} villa={v} />
              ))}
            </div>
            {filtered.length > visible.length && (
              <div className="text-center mt-8">
                <Button
                  onClick={() => setPageSize((s) => s + 48)}
                  variant="outline"
                  className="bg-card"
                >
                  Show more ({filtered.length - visible.length} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mt-auto border-t border-border bg-card/60">
        <div className="container py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-muted-foreground">
          <div className="font-mono uppercase tracking-[0.18em]">
            Saadiyat · Saadiyat Lagoons · {label}
          </div>
          <div>Source: Aldar · world.aldar.com/uae/abudhabi/lagoons</div>
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
    <div className="px-3 py-2 border border-border rounded-sm bg-card min-w-[88px]">
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[150px] bg-card" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

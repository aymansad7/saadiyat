/**
 * GlobalUnitSearch — a search input that queries across ALL datasets
 * (Saadiyat, Other, Lagoons) by unit name/number. Shows results in a
 * dropdown with project/building context and navigates to the unit detail.
 *
 * Uses debounced tRPC query (unitSearch.search) for instant results.
 */
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, X, MapPin, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";

function statusColor(status: string | null): string {
  if (!status) return "text-muted-foreground";
  const s = status.toLowerCase();
  if (s === "available" || s === "new") return "text-emerald-600 dark:text-emerald-400";
  if (s === "booked" || s === "reserved") return "text-amber-600 dark:text-amber-400";
  return "text-muted-foreground";
}

function datasetLabel(dataset: string): string {
  if (dataset === "saadiyat") return "Saadiyat";
  if (dataset === "other") return "Other";
  if (dataset === "lagoons") return "Lagoons";
  return dataset;
}

export default function GlobalUnitSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  // Debounce: wait 300ms after user stops typing
  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery("");
      return;
    }
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = trpc.unitSearch.search.useQuery(
    { q: debouncedQuery, limit: 20 },
    { enabled: debouncedQuery.length >= 2 },
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const results = data?.results ?? [];
  const showDropdown = open && debouncedQuery.length >= 2;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search unit, project, or area (e.g. 250 m² / 2,691 sqft)…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pl-10 pr-10 h-11 bg-card border-border text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg max-h-[360px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground text-center">Searching…</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No units found for &ldquo;{debouncedQuery}&rdquo;
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((r, i) => (
                <li key={`${r.unitName}-${i}`}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors flex items-center gap-3"
                    onClick={() => {
                      setOpen(false);
                      navigate(r.href);
                    }}
                  >
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {r.unitName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {r.projectName}
                        {r.buildingName ? ` · ${r.buildingName}` : ""}
                        {" · "}
                        <span className="uppercase text-[0.6rem] tracking-wider">
                          {datasetLabel(r.dataset)}
                        </span>
                      </div>
                      {r.areaSqm != null && (
                        <div className="text-[0.65rem] font-mono text-muted-foreground mt-0.5">
                          {r.areaSqm.toLocaleString(undefined, { maximumFractionDigits: 1 })} m²
                          {r.areaSqft != null ? ` · ${r.areaSqft.toLocaleString(undefined, { maximumFractionDigits: 0 })} sqft` : ""}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-mono ${statusColor(r.status)}`}>
                        {r.status || "—"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

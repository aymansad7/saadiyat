import { Link, useSearch } from "wouter";
import { ArrowUpRight, Building2, ExternalLink, Map, Search } from "lucide-react";
import { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

const SOURCE_COPY = {
  any: { title: "Available properties", description: "Source-backed availability across NAS, Aldar resale and documented broker records." },
  "nas-luxury": { title: "Available with NAS Luxury", description: "Includes each property whose stored sales status is currently set to Available, plus verified NAS listings." },
  aldar: { title: "Aldar Resale", description: "Curated Aldar resale records. Developer primary inventory remains separate in the Sales & inventory sync desk." },
  others: { title: "Other brokers", description: "Documented broker records, including the dated PropertyFinder snapshot. No unsupported availability is included." },
  manual: { title: "Manually recorded availability", description: "Admin-verified manual records only." },
} as const;

function readSource(search: string): keyof typeof SOURCE_COPY {
  const value = new URLSearchParams(search).get("source");
  return value && value in SOURCE_COPY ? value as keyof typeof SOURCE_COPY : "any";
}

function formatPrice(value: number | null) {
  return value == null ? "Price not stated" : `AED ${new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(value)}`;
}

export default function AvailabilityResults() {
  const search = useSearch();
  const source = readSource(search);
  const [query, setQuery] = useState("");
  const results = trpc.availability.results.useQuery({ source });
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return results.data ?? [];
    return (results.data ?? []).filter(row => `${row.title} ${row.community} ${row.unitKey} ${row.bedrooms ?? ""}`.toLowerCase().includes(q));
  }, [query, results.data]);
  const copy = SOURCE_COPY[source];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader subTitle="Availability" back={{ href: "/", label: "Home" }} />
      <main className="container py-7 space-y-6">
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[0.68rem] font-mono uppercase tracking-[0.18em] text-primary"><Building2 className="h-3.5 w-3.5" /> Source-led availability</div>
            <h1 className="mt-1 font-display text-3xl text-foreground">{copy.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{copy.description}</p>
          </div>
          <span className="font-mono text-xs text-muted-foreground">{visible.length.toLocaleString()} shown</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SOURCE_COPY) as (keyof typeof SOURCE_COPY)[]).filter(key => key !== "manual").map(key => <Button key={key} asChild size="sm" variant={source === key ? "default" : "outline"} className={source !== key ? "bg-card" : ""}><Link href={`/availability?source=${key}`}>{key === "any" ? "All sources" : key === "nas-luxury" ? "NAS Luxury" : key === "aldar" ? "Aldar Resale" : "Other brokers"}</Link></Button>)}
        </div>
        <label className="relative block max-w-2xl"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search project, unit or bedrooms" className="h-11 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" /></label>
        {results.isLoading ? <div className="py-10 text-sm text-muted-foreground">Loading documented availability…</div> : results.isError ? <div className="py-10 text-sm text-rose-600">Could not load availability. {results.error.message}</div> : visible.length === 0 ? <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">No documented available properties match this source and search.</div> : <div className="grid gap-3">{visible.map(row => <article key={row.id} className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-sm bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Available</span><h2 className="truncate font-medium text-foreground">{row.title}</h2></div><p className="mt-1 truncate text-xs text-muted-foreground">{row.community} · {row.bedrooms ? `${row.bedrooms} BR` : "Bedrooms not stated"} · {row.provenance}</p><div className="mt-2 text-sm font-semibold tabular text-foreground">{formatPrice(row.priceAed)}</div></div><div className="flex flex-wrap items-center gap-2">{row.href && <Button asChild size="sm" variant="outline" className="bg-card"><Link href={row.href}>{row.exactInternalMatch ? "Open property" : "View on map"} {row.exactInternalMatch ? <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" /> : <Map className="ml-1.5 h-3.5 w-3.5" />}</Link></Button>}{row.sourceUrl && <Button asChild size="sm" variant="ghost"><a href={row.sourceUrl} target="_blank" rel="noreferrer">Source <ExternalLink className="ml-1.5 h-3.5 w-3.5" /></a></Button>}</div></article>)}</div>}
      </main>
    </div>
  );
}

/**
 * Admin — Aldar Sales & Inventory Sync
 *
 * Combines the operational sync history with a current, searchable sales desk.
 * The desk only displays source-backed Aldar statuses and routes every row to
 * the matching internal unit detail card.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowUpRight,
  BedDouble,
  Building2,
  CalendarDays,
  ExternalLink,
  History,
  Plus,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AldarOfficialUnitLink from "@/components/AldarOfficialUnitLink";

function fmtDateTime(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtAed(value: number | null | undefined) {
  if (value == null) return null;
  return `AED ${new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(value)}`;
}

function sourceStatusClass(status: string | null) {
  if ((status ?? "").toLowerCase() === "available") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

type Rollup = {
  projectSlug: string;
  projectName: string | null;
  dataset: "saadiyat" | "other";
  newUnits: number;
  sold: number;
  statusChanges: number;
  priceChanges: number;
  removed: number;
  examples: string[];
};

type InventoryEvent = {
  id: number;
  runId: number;
  createdAt: Date | string;
  dataset: "saadiyat" | "other";
  projectSlug: string;
  projectName: string | null;
  unitName: string;
  eventType: "first_seen" | "status_change" | "price_change" | "removed" | "reappeared";
  fromStatus: string | null;
  toStatus: string | null;
  fromPriceAed: number | null;
  toPriceAed: number | null;
  href: string | null;
  buildingName: string | null;
  bedrooms: string | null;
  unitType: string | null;
};

const EVENT_OPTIONS: Array<{ value: InventoryEvent["eventType"] | "all"; label: string }> = [
  { value: "all", label: "All changes" },
  { value: "status_change", label: "Status changes" },
  { value: "price_change", label: "Price changes" },
  { value: "first_seen", label: "Newly tracked" },
  { value: "reappeared", label: "Reappeared" },
  { value: "removed", label: "Removed from source" },
];

function eventDescription(event: InventoryEvent) {
  if (event.eventType === "status_change") return `${event.fromStatus ?? "Unknown"} → ${event.toStatus ?? "Unknown"}`;
  if (event.eventType === "price_change") return "Price changed";
  if (event.eventType === "first_seen") return `Newly tracked${event.toStatus ? ` · ${event.toStatus}` : ""}`;
  if (event.eventType === "reappeared") return `Back in source${event.toStatus ? ` · ${event.toStatus}` : ""}`;
  return "Removed from source";
}

function priceDescription(event: InventoryEvent) {
  if (event.eventType !== "price_change" && event.eventType !== "first_seen" && event.eventType !== "reappeared") return "—";
  const from = fmtAed(event.fromPriceAed);
  const to = fmtAed(event.toPriceAed);
  return from && to ? `${from} → ${to}` : to ?? from ?? "—";
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "sold" | "new" | "price";
}) {
  const toneCls =
    tone === "sold"
      ? "text-rose-600 dark:text-rose-400"
      : tone === "new"
        ? "text-emerald-600 dark:text-emerald-400"
        : tone === "price"
          ? "text-amber-600 dark:text-amber-400"
          : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="text-[0.62rem] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className={`mt-1 font-display text-2xl ${toneCls}`}>{value}</div>
    </div>
  );
}

export default function AdminInventoryHistory() {
  const { user, loading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importTarget, setImportTarget] = useState<"saadiyat" | "other">("saadiyat");
  const [inventoryQuery, setInventoryQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "new">("available");
  const [eventProjectFilter, setEventProjectFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<InventoryEvent["eventType"] | "all">("all");
  const [eventQuery, setEventQuery] = useState("");

  const latest = trpc.inventoryHistory.latestRun.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const runs = trpc.inventoryHistory.runs.useQuery(
    { limit: 30 },
    { enabled: isAuthenticated },
  );
  const salesInventory = trpc.inventoryHistory.currentSaleInventory.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "admin" || user?.role === "master"),
  });
  const eventQueryInput = useMemo(
    () => ({
      limit: 500,
      projectSlug: eventProjectFilter === "all" ? undefined : eventProjectFilter,
      eventType: eventTypeFilter === "all" ? undefined : eventTypeFilter,
    }),
    [eventProjectFilter, eventTypeFilter],
  );
  const dailyEvents = trpc.inventoryHistory.recentEvents.useQuery(eventQueryInput, {
    enabled: isAuthenticated && (user?.role === "admin" || user?.role === "master"),
  });

  const syncNow = trpc.inventoryHistory.syncNow.useMutation({
    onSuccess: res => {
      toast.success(
        `Sync complete — ${res.summary.headline}`,
      );
      utils.inventoryHistory.latestRun.invalidate();
      utils.inventoryHistory.runs.invalidate();
      utils.inventoryHistory.currentSaleInventory.invalidate();
      utils.inventoryHistory.recentEvents.invalidate();
    },
    onError: e => toast.error(e.message || "Sync failed"),
  });

  const importMut = trpc.inventoryHistory.importDataset.useMutation({
    onSuccess: res => {
      toast.success(
        `Imported — ${res.summary.headline}`,
      );
      setImportOpen(false);
      setImportText("");
      utils.inventoryHistory.latestRun.invalidate();
      utils.inventoryHistory.runs.invalidate();
      utils.inventoryHistory.currentSaleInventory.invalidate();
      utils.inventoryHistory.recentEvents.invalidate();
    },
    onError: e => toast.error(e.message || "Import failed"),
  });

  const run = latest.data?.run ?? null;
  const rollups = (latest.data?.rollups ?? []) as Rollup[];
  const saleUnits = salesInventory.data?.units ?? [];
  const projects = useMemo(
    () =>
      Array.from(
        new Map(
          saleUnits.map(unit => [
            `${unit.dataset}:${unit.projectSlug}`,
            { key: `${unit.dataset}:${unit.projectSlug}`, label: unit.projectName ?? unit.projectSlug },
          ]),
        ).values(),
      ).sort((a, b) => a.label.localeCompare(b.label)),
    [saleUnits],
  );
  const displayedUnits = useMemo(() => {
    const q = inventoryQuery.trim().toLowerCase();
    return saleUnits.filter(unit => {
      if (projectFilter !== "all" && `${unit.dataset}:${unit.projectSlug}` !== projectFilter) return false;
      if (statusFilter !== "all" && (unit.status ?? "").toLowerCase() !== statusFilter) return false;
      if (!q) return true;
      return `${unit.unitName} ${unit.projectName ?? ""} ${unit.buildingName ?? ""} ${unit.bedrooms ?? ""} ${unit.unitType ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [inventoryQuery, projectFilter, saleUnits, statusFilter]);
  const availableCount = saleUnits.filter(unit => (unit.status ?? "").toLowerCase() === "available").length;
  const newCount = saleUnits.filter(unit => (unit.status ?? "").toLowerCase() === "new").length;
  const eventRows = (dailyEvents.data ?? []) as InventoryEvent[];
  const eventProjects = useMemo(
    () => Array.from(new Map(eventRows.map(event => [event.projectSlug, event.projectName ?? event.projectSlug])).entries())
      .map(([slug, label]) => ({ slug, label }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [eventRows],
  );
  const displayedEvents = useMemo(() => {
    const q = eventQuery.trim().toLowerCase();
    if (!q) return eventRows;
    return eventRows.filter(event => `${event.unitName} ${event.projectName ?? ""} ${event.buildingName ?? ""} ${event.fromStatus ?? ""} ${event.toStatus ?? ""}`.toLowerCase().includes(q));
  }, [eventQuery, eventRows]);

  function handleImport() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(importText);
    } catch {
      toast.error("Invalid JSON — could not parse.");
      return;
    }
    if (!parsed || typeof parsed !== "object" || !("projects" in (parsed as Record<string, unknown>))) {
      toast.error('JSON must be an object with a "projects" array.');
      return;
    }
    importMut.mutate({ [importTarget]: parsed } as never);
  }

  if (loading) return null;
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="container py-16">
          <Card><CardContent className="p-8 text-center"><h1 className="text-xl font-semibold">Admin sign-in required</h1><p className="mt-2 text-sm text-muted-foreground">Sign in with an admin account to use the sales and inventory desk.</p><Button className="mt-4" onClick={() => (window.location.href = getLoginUrl())}>Sign in</Button></CardContent></Card>
        </main>
      </div>
    );
  }
  if (user?.role !== "admin" && user?.role !== "master") {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="container py-16"><Card><CardContent className="p-8 text-center"><h1 className="text-xl font-semibold">Access denied</h1><p className="mt-2 text-sm text-muted-foreground">Your account does not have admin permissions.</p></CardContent></Card></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle="Sales & inventory sync" />
      <main className="container py-8 space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary"><History className="h-3.5 w-3.5" /> Aldar sales desk</div>
            <h1 className="mt-1 font-display text-3xl text-foreground">Current inventory, ready for a client meeting</h1>
            <p className="mt-1 text-sm text-muted-foreground">Last recorded snapshot: <span className="font-medium text-foreground">{fmtDateTime(run?.startedAt)}</span> · sync status <span className="font-medium">{run?.status ?? "—"}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-card" onClick={() => setImportOpen(v => !v)}><Upload className="h-4 w-4 mr-2" /> Import updated JSON</Button>
            <Button onClick={() => syncNow.mutate()} disabled={syncNow.isPending}><RefreshCw className={`h-4 w-4 mr-2 ${syncNow.isPending ? "animate-spin" : ""}`} />{syncNow.isPending ? "Running…" : "Run sync now"}</Button>
          </div>
        </div>

        {importOpen && (
          <Card><CardContent className="p-5 space-y-3">
            <div className="text-sm text-muted-foreground">Paste a fresh Aldar snapshot (same shape as the bundled dataset: <code>{`{ "projects": [ { "slug", "name", "buildings": [...] } ] }`}</code>). It is diffed against the last snapshot and recorded as a new run. On-disk baseline files are not overwritten.</div>
            <div className="flex items-center gap-2"><label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Dataset:</label><select className="rounded-md border border-border bg-background px-2 py-1 text-sm" value={importTarget} onChange={e => setImportTarget(e.target.value as "saadiyat" | "other")}><option value="saadiyat">Saadiyat</option><option value="other">Other Aldar</option></select></div>
            <textarea className="w-full h-40 rounded-md border border-border bg-background p-3 font-mono text-xs" placeholder='{ "projects": [ ... ] }' value={importText} onChange={e => setImportText(e.target.value)} />
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Button><Button onClick={handleImport} disabled={importMut.isPending || !importText.trim()}>{importMut.isPending ? "Importing…" : "Diff & record"}</Button></div>
          </CardContent></Card>
        )}

        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-5 sm:px-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.18em] font-mono text-primary"><Building2 className="h-3.5 w-3.5" /> Current Aldar inventory</div>
              <h2 className="mt-1 font-display text-2xl text-foreground">Purchasable units</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">This desk preserves Aldar&apos;s own status labels. <strong className="font-medium text-foreground">Available</strong> is shown by default; <strong className="font-medium text-foreground">New</strong> release inventory is available as a separate filter. Every row opens the exact internal unit card.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs"><span className="rounded-sm border border-emerald-500/30 bg-emerald-500/5 px-2 py-1 text-emerald-700 dark:text-emerald-300">{availableCount.toLocaleString()} Available</span><span className="rounded-sm border border-amber-500/30 bg-amber-500/5 px-2 py-1 text-amber-700 dark:text-amber-300">{newCount.toLocaleString()} New</span></div>
          </div>
          <div className="border-b border-border bg-muted/20 px-5 py-4 sm:px-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_150px]">
            <label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={inventoryQuery} onChange={event => setInventoryQuery(event.target.value)} placeholder="Search unit, project, building, type or bedrooms" className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/30" /></label>
            <select value={projectFilter} onChange={event => setProjectFilter(event.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"><option value="all">All projects</option>{projects.map(project => <option key={project.key} value={project.key}>{project.label}</option>)}</select>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as "all" | "available" | "new")} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"><option value="available">Available</option><option value="new">New release</option><option value="all">Available + New</option></select>
          </div>
          <div className="flex items-center justify-between gap-3 px-5 py-3 text-xs text-muted-foreground sm:px-6"><span>Source: deployed Aldar inventory snapshot. Importing fresh JSON records the change history; a genuine live API feed is not configured.</span><span className="shrink-0 font-mono">{displayedUnits.length.toLocaleString()} shown</span></div>
          {salesInventory.isLoading ? <div className="px-5 py-10 text-sm text-muted-foreground sm:px-6">Loading current inventory…</div> : salesInventory.isError ? <div className="px-5 py-10 text-sm text-rose-600 sm:px-6">Could not load the current sales inventory. {salesInventory.error.message}</div> : displayedUnits.length === 0 ? <div className="px-5 py-10 text-sm text-muted-foreground sm:px-6">No units match these sales-desk filters.</div> : (
            <div className="max-h-[660px] divide-y divide-border overflow-y-auto">
              {displayedUnits.map(unit => (
                <div key={`${unit.dataset}:${unit.projectSlug}:${unit.buildingSlug}:${unit.unitName}`} className="group grid gap-3 px-5 py-4 transition-colors hover:bg-accent/35 sm:px-6 md:grid-cols-[minmax(0,1.45fr)_minmax(150px,0.8fr)_minmax(150px,0.7fr)_auto] md:items-center">
                  <div className="min-w-0"><div className="flex min-w-0 items-center gap-2"><span className={`shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider ${sourceStatusClass(unit.status)}`}>{unit.status ?? "Unknown"}</span><span className="truncate font-medium text-foreground">{unit.unitName}</span></div><div className="mt-1 truncate text-xs text-muted-foreground">{unit.projectName ?? unit.projectSlug}{unit.buildingName ? ` · ${unit.buildingName}` : ""}</div></div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><BedDouble className="h-3.5 w-3.5 text-primary" /><span>{unit.bedrooms ? `${unit.bedrooms} BR` : "Bedrooms not stated"}{unit.unitType ? ` · ${unit.unitType}` : ""}</span></div>
                  <div className="text-sm font-semibold tabular text-foreground">{fmtAed(unit.priceAed) ?? "Price not stated"}</div>
                  <div className="flex flex-wrap items-center gap-2">{unit.href ? <Button asChild size="sm" className="gap-1.5 whitespace-nowrap"><Link href={unit.href}>Open card <ArrowUpRight className="h-3.5 w-3.5" /></Link></Button> : <span className="text-xs text-muted-foreground">Route unavailable</span>}<AldarOfficialUnitLink aldarLink={unit.aldarLink} unitName={unit.unitName} projectSlug={unit.projectSlug} compact /></div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[0.68rem] font-mono uppercase tracking-[0.18em] text-primary"><CalendarDays className="h-3.5 w-3.5" /> Daily unit movements</div>
                <h2 className="mt-1 font-display text-2xl text-foreground">Every recorded inventory change</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Status, price, new, returned, and removed events are retained by sync date. Select a unit to open its exact card; a removed source record is never given a guessed route.</p>
              </div>
              <div className="font-mono text-xs text-muted-foreground">{displayedEvents.length.toLocaleString()} of {eventRows.length.toLocaleString()} movements</div>
            </div>
          </div>
          <div className="grid gap-3 border-b border-border bg-muted/20 px-5 py-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_220px_190px]">
            <label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={eventQuery} onChange={event => setEventQuery(event.target.value)} placeholder="Search unit, project or status" className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/30" /></label>
            <select value={eventProjectFilter} onChange={event => setEventProjectFilter(event.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"><option value="all">All projects</option>{eventProjects.map(project => <option key={project.slug} value={project.slug}>{project.label}</option>)}</select>
            <select value={eventTypeFilter} onChange={event => setEventTypeFilter(event.target.value as InventoryEvent["eventType"] | "all")} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">{EVENT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          </div>
          {dailyEvents.isLoading ? <div className="px-5 py-10 text-sm text-muted-foreground sm:px-6">Loading recorded movements…</div> : dailyEvents.isError ? <div className="px-5 py-10 text-sm text-rose-600 sm:px-6">Could not load unit movements. {dailyEvents.error.message}</div> : displayedEvents.length === 0 ? <div className="px-5 py-10 text-sm text-muted-foreground sm:px-6">No recorded movements match these filters.</div> : (
            <>
              <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[920px] text-left text-sm"><thead className="border-b border-border bg-muted/10 text-[0.65rem] font-mono uppercase tracking-[0.14em] text-muted-foreground"><tr><th className="px-5 py-3 sm:px-6">Date</th><th className="px-3 py-3">Project</th><th className="px-3 py-3">Unit</th><th className="px-3 py-3">Movement</th><th className="px-3 py-3">Price</th><th className="px-5 py-3 text-right sm:px-6">Card</th></tr></thead><tbody className="divide-y divide-border">{displayedEvents.map(event => <tr key={event.id} className="transition-colors hover:bg-accent/35"><td className="whitespace-nowrap px-5 py-3 text-xs text-muted-foreground sm:px-6">{fmtDateTime(event.createdAt)}</td><td className="max-w-[220px] truncate px-3 py-3 text-muted-foreground">{event.projectName ?? event.projectSlug}</td><td className="px-3 py-3"><div className="font-medium text-foreground">{event.unitName}</div>{event.buildingName && <div className="mt-0.5 text-xs text-muted-foreground">{event.buildingName}</div>}</td><td className="px-3 py-3"><span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wide text-muted-foreground">{event.eventType.replace("_", " ")}</span><div className="mt-1 text-xs text-foreground">{eventDescription(event)}</div></td><td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">{priceDescription(event)}</td><td className="px-5 py-3 text-right sm:px-6">{event.href ? <Button asChild size="sm" variant="outline" className="bg-card"><Link href={event.href}>Open card <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link></Button> : <span className="text-xs text-muted-foreground">Source removed</span>}</td></tr>)}</tbody></table></div>
              <div className="divide-y divide-border md:hidden">{displayedEvents.map(event => <article key={event.id} className="space-y-3 px-5 py-4"><div className="flex items-start justify-between gap-3"><div><div className="font-medium text-foreground">{event.unitName}</div><div className="mt-0.5 text-xs text-muted-foreground">{event.projectName ?? event.projectSlug}{event.buildingName ? ` · ${event.buildingName}` : ""}</div></div><div className="text-right text-xs text-muted-foreground">{fmtDateTime(event.createdAt)}</div></div><div className="flex flex-wrap items-center gap-2"><span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wide text-muted-foreground">{event.eventType.replace("_", " ")}</span><span className="text-sm text-foreground">{eventDescription(event)}</span></div><div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{priceDescription(event)}</span>{event.href ? <Button asChild size="sm" variant="outline" className="bg-card"><Link href={event.href}>Open card <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link></Button> : <span className="text-xs text-muted-foreground">Source removed</span>}</div></article>)}</div>
            </>
          )}
        </section>

        {run ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"><StatCard label="Units scanned" value={Number(run.unitsScanned ?? 0).toLocaleString()} /><StatCard label="Newly tracked" value={run.newUnits ?? 0} tone="new" /><StatCard label="Sold" value={run.soldUnits ?? 0} tone="sold" /><StatCard label="Status changes" value={run.statusChanges ?? 0} /><StatCard label="Price changes" value={run.priceChanges ?? 0} tone="price" /><StatCard label="Removed" value={run.removedUnits ?? 0} /></div> : <Card><CardContent className="p-6 text-sm text-muted-foreground">No sync has run yet. Click <span className="font-medium">Run sync now</span> to take the first baseline.</CardContent></Card>}

        <section><h2 className="font-display text-xl text-foreground mb-3">Latest changes by project</h2>{rollups.length === 0 ? <Card><CardContent className="p-6 text-sm text-muted-foreground">No changes detected in the most recent run.</CardContent></Card> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{rollups.map(r => <Card key={`${r.dataset}-${r.projectSlug}`}><CardContent className="p-5"><div className="flex items-center justify-between gap-2"><div className="font-display text-lg text-foreground">{r.projectName ?? r.projectSlug}</div><span className="text-[0.6rem] font-mono uppercase tracking-wider rounded bg-muted px-1.5 py-0.5 text-muted-foreground">{r.dataset}</span></div><div className="mt-3 flex flex-wrap gap-3 text-sm">{r.sold > 0 && <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400"><TrendingDown className="h-3.5 w-3.5" /> {r.sold} sold</span>}{r.newUnits > 0 && <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><Plus className="h-3.5 w-3.5" /> {r.newUnits} new</span>}{r.priceChanges > 0 && <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400"><TrendingUp className="h-3.5 w-3.5" /> {r.priceChanges} price</span>}{r.statusChanges > 0 && <span className="text-muted-foreground">{r.statusChanges} status</span>}{r.removed > 0 && <span className="text-muted-foreground">{r.removed} removed</span>}</div>{r.examples.length > 0 && <ul className="mt-3 space-y-1 text-xs text-muted-foreground font-mono">{r.examples.map((ex, i) => <li key={i} className="truncate">• {ex}</li>)}</ul>}</CardContent></Card>)}</div>}</section>

        <section><h2 className="font-display text-xl text-foreground mb-3">Recent syncs</h2><Card><CardContent className="p-0"><div className="divide-y divide-border">{(runs.data ?? []).map(r => <div key={r.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm flex-wrap"><div className="flex items-center gap-3"><span className="font-mono text-xs text-muted-foreground">#{r.id}</span><span className="text-foreground">{fmtDateTime(r.startedAt)}</span><span className={"text-[0.6rem] font-mono uppercase tracking-wider rounded px-1.5 py-0.5 " + (r.status === "success" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : r.status === "error" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-muted text-muted-foreground")}>{r.status}</span><span className="text-[0.6rem] font-mono uppercase tracking-wider text-muted-foreground">{r.trigger}</span></div><div className="flex items-center gap-4 text-xs text-muted-foreground"><span>{Number(r.unitsScanned ?? 0).toLocaleString()} scanned</span><span className="text-rose-600 dark:text-rose-400">{r.soldUnits ?? 0} sold</span><span className="text-emerald-600 dark:text-emerald-400">{r.newUnits ?? 0} new</span><span className="text-amber-600 dark:text-amber-400">{r.priceChanges ?? 0} price</span></div></div>)}{(runs.data ?? []).length === 0 && <div className="px-5 py-6 text-sm text-muted-foreground">No runs recorded.</div>}</div></CardContent></Card></section>
      </main>
    </div>
  );
}

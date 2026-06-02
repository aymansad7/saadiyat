/**
 * Admin — Inventory Change History
 *
 * Shows the result of the weekly (Mon 06:00 Gulf) Aldar inventory sync:
 *   - headline of the latest run (units scanned, new, sold, status/price changes)
 *   - per-project rollup of what changed (e.g. "BS Park Place: 3 sold")
 *   - a list of recent sync runs
 *   - "Run sync now" button (diffs the on-disk datasets)
 *   - "Import updated JSON" button (diffs a freshly pasted/uploaded Aldar dump)
 *
 * Master/admin gated, mirroring AdminListings.
 */
import { useState } from "react";
import { History, RefreshCw, Upload, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  const latest = trpc.inventoryHistory.latestRun.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const runs = trpc.inventoryHistory.runs.useQuery(
    { limit: 30 },
    { enabled: isAuthenticated },
  );

  const syncNow = trpc.inventoryHistory.syncNow.useMutation({
    onSuccess: res => {
      toast.success(
        `Sync complete — ${res.counts.soldUnits} sold, ${res.counts.newUnits} new, ${res.counts.priceChanges} price changes`,
      );
      utils.inventoryHistory.latestRun.invalidate();
      utils.inventoryHistory.runs.invalidate();
    },
    onError: e => toast.error(e.message || "Sync failed"),
  });

  const importMut = trpc.inventoryHistory.importDataset.useMutation({
    onSuccess: res => {
      toast.success(
        `Imported — ${res.counts.soldUnits} sold, ${res.counts.newUnits} new, ${res.counts.priceChanges} price changes`,
      );
      setImportOpen(false);
      setImportText("");
      utils.inventoryHistory.latestRun.invalidate();
      utils.inventoryHistory.runs.invalidate();
    },
    onError: e => toast.error(e.message || "Import failed"),
  });

  if (loading) return null;
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="container py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-xl font-semibold">Admin sign-in required</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in with an admin account to view inventory history.
              </p>
              <Button className="mt-4" onClick={() => (window.location.href = getLoginUrl())}>
                Sign in
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  if (user?.role !== "admin" && user?.role !== "master") {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="container py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-xl font-semibold">Access denied</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your account does not have admin permissions.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const run = latest.data?.run ?? null;
  const rollups = (latest.data?.rollups ?? []) as Rollup[];

  function handleImport() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(importText);
    } catch {
      toast.error("Invalid JSON — could not parse.");
      return;
    }
    if (!parsed || typeof parsed !== "object" || !("projects" in (parsed as any))) {
      toast.error('JSON must be an object with a "projects" array.');
      return;
    }
    importMut.mutate({ [importTarget]: parsed } as any);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle="Inventory change history" />
      <main className="container py-8 space-y-8">
        {/* Header + actions */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
              <History className="h-3.5 w-3.5" />
              Aldar inventory sync
            </div>
            <h1 className="mt-1 font-display text-3xl text-foreground">What changed</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Automatic snapshot every Monday 06:00 (Gulf time). Last run:{" "}
              <span className="font-medium text-foreground">
                {fmtDateTime(run?.startedAt)}
              </span>{" "}
              · status{" "}
              <span className="font-medium">{run?.status ?? "—"}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-card"
              onClick={() => setImportOpen(v => !v)}
            >
              <Upload className="h-4 w-4 mr-2" /> Import updated JSON
            </Button>
            <Button onClick={() => syncNow.mutate()} disabled={syncNow.isPending}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncNow.isPending ? "animate-spin" : ""}`} />
              {syncNow.isPending ? "Running…" : "Run sync now"}
            </Button>
          </div>
        </div>

        {/* Import panel */}
        {importOpen && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="text-sm text-muted-foreground">
                Paste a fresh Aldar dump (same shape as the bundled dataset:{" "}
                <code>{`{ "projects": [ { "slug", "name", "buildings": [...] } ] }`}</code>).
                It is diffed against the last snapshot and recorded as a new run.
                On-disk baseline files are not overwritten.
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Dataset:
                </label>
                <select
                  className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                  value={importTarget}
                  onChange={e => setImportTarget(e.target.value as "saadiyat" | "other")}
                >
                  <option value="saadiyat">Saadiyat</option>
                  <option value="other">Other Aldar</option>
                </select>
              </div>
              <textarea
                className="w-full h-40 rounded-md border border-border bg-background p-3 font-mono text-xs"
                placeholder='{ "projects": [ ... ] }'
                value={importText}
                onChange={e => setImportText(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setImportOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={importMut.isPending || !importText.trim()}>
                  {importMut.isPending ? "Importing…" : "Diff & record"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Latest run stats */}
        {run ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Units scanned" value={Number(run.unitsScanned ?? 0).toLocaleString()} />
            <StatCard label="Newly tracked" value={run.newUnits ?? 0} tone="new" />
            <StatCard label="Sold" value={run.soldUnits ?? 0} tone="sold" />
            <StatCard label="Status changes" value={run.statusChanges ?? 0} />
            <StatCard label="Price changes" value={run.priceChanges ?? 0} tone="price" />
            <StatCard label="Removed" value={run.removedUnits ?? 0} />
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No sync has run yet. Click <span className="font-medium">Run sync now</span> to take
              the first baseline.
            </CardContent>
          </Card>
        )}

        {/* Per-project rollup */}
        <div>
          <h2 className="font-display text-xl text-foreground mb-3">By project</h2>
          {rollups.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No changes detected in the most recent run.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rollups.map(r => (
                <Card key={`${r.dataset}-${r.projectSlug}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-display text-lg text-foreground">
                        {r.projectName ?? r.projectSlug}
                      </div>
                      <span className="text-[0.6rem] font-mono uppercase tracking-wider rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                        {r.dataset}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm">
                      {r.sold > 0 && (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                          <TrendingDown className="h-3.5 w-3.5" /> {r.sold} sold
                        </span>
                      )}
                      {r.newUnits > 0 && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Plus className="h-3.5 w-3.5" /> {r.newUnits} new
                        </span>
                      )}
                      {r.priceChanges > 0 && (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <TrendingUp className="h-3.5 w-3.5" /> {r.priceChanges} price
                        </span>
                      )}
                      {r.statusChanges > 0 && (
                        <span className="text-muted-foreground">{r.statusChanges} status</span>
                      )}
                      {r.removed > 0 && (
                        <span className="text-muted-foreground">{r.removed} removed</span>
                      )}
                    </div>
                    {r.examples.length > 0 && (
                      <ul className="mt-3 space-y-1 text-xs text-muted-foreground font-mono">
                        {r.examples.map((ex, i) => (
                          <li key={i} className="truncate">
                            • {ex}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Run history */}
        <div>
          <h2 className="font-display text-xl text-foreground mb-3">Recent syncs</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {(runs.data ?? []).map(r => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-4 px-5 py-3 text-sm flex-wrap"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">#{r.id}</span>
                      <span className="text-foreground">{fmtDateTime(r.startedAt)}</span>
                      <span
                        className={
                          "text-[0.6rem] font-mono uppercase tracking-wider rounded px-1.5 py-0.5 " +
                          (r.status === "success"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : r.status === "error"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              : "bg-muted text-muted-foreground")
                        }
                      >
                        {r.status}
                      </span>
                      <span className="text-[0.6rem] font-mono uppercase tracking-wider text-muted-foreground">
                        {r.trigger}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{Number(r.unitsScanned ?? 0).toLocaleString()} scanned</span>
                      <span className="text-rose-600 dark:text-rose-400">{r.soldUnits ?? 0} sold</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{r.newUnits ?? 0} new</span>
                      <span className="text-amber-600 dark:text-amber-400">{r.priceChanges ?? 0} price</span>
                    </div>
                  </div>
                ))}
                {(runs.data ?? []).length === 0 && (
                  <div className="px-5 py-6 text-sm text-muted-foreground">No runs recorded.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

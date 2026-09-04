/**
 * UnitTimeline — renders the per-unit history captured by the weekly inventory
 * sync. Shows, newest-first, when a unit was first seen, when its status
 * changed (e.g. Available → Sold), and when its price changed.
 *
 * Data comes from trpc.inventoryHistory.timeline. The component is defensive:
 * if there is no history yet (e.g. only one baseline run) it shows a tidy
 * "tracking started" line so the section never looks broken.
 */
import { trpc } from "@/lib/trpc";
import { History, ArrowRight, Tag, CircleDot, PlusCircle, MinusCircle, RotateCcw } from "lucide-react";

function fmtAed(n: number | null): string {
  if (n == null) return "—";
  return "AED " + new Intl.NumberFormat("en-US").format(n);
}

function fmtDate(d: Date | string | number): string {
  const date = new Date(d);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type EventRow = {
  id: number;
  eventType: string;
  fromStatus: string | null;
  toStatus: string | null;
  fromSourceStatus?: string | null;
  toSourceStatus?: string | null;
  fromPriceAed: number | null;
  toPriceAed: number | null;
  createdAt: Date | string;
};

function iconFor(type: string) {
  switch (type) {
    case "first_seen":
      return <PlusCircle className="h-3.5 w-3.5" />;
    case "status_change":
      return <CircleDot className="h-3.5 w-3.5" />;
    case "price_change":
      return <Tag className="h-3.5 w-3.5" />;
    case "removed":
      return <MinusCircle className="h-3.5 w-3.5" />;
    case "reappeared":
      return <RotateCcw className="h-3.5 w-3.5" />;
    default:
      return <CircleDot className="h-3.5 w-3.5" />;
  }
}

function isSold(s: string | null) {
  return (s || "").trim().toLowerCase() === "sold";
}

function priceTransition(from: number | null, to: number | null) {
  return <><span className="text-muted-foreground">{from == null ? "Not published" : fmtAed(from)}</span><ArrowRight className="h-3 w-3 text-muted-foreground" /><span className="font-medium">{to == null ? "Not published" : fmtAed(to)}</span></>;
}

function describe(e: EventRow): React.ReactNode {
  switch (e.eventType) {
    case "first_seen":
      return (
        <span>
          Tracking started — status{" "}
          <span className="font-medium">{e.toStatus ?? "—"}</span>
          {e.toPriceAed != null && (
            <> at <span className="font-medium">{fmtAed(e.toPriceAed)}</span></>
          )}
        </span>
      );
    case "status_change":
      return (
        <span className="flex items-center gap-1.5 flex-wrap">
          <span className="text-muted-foreground">{e.fromStatus ?? "—"}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className={isSold(e.toStatus) ? "font-semibold text-rose-600 dark:text-rose-400" : "font-medium"}>
            {e.toStatus ?? "—"}
          </span>
          {isSold(e.toStatus) && (
            <span className="text-[0.6rem] uppercase tracking-wider rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5">
              sold
            </span>
          )}
        </span>
      );
    case "source_status_change":
      return (
        <span className="flex items-center gap-1.5 flex-wrap">
          <span className="text-muted-foreground">Official source state</span>
          <span>{e.fromSourceStatus ?? "Not published"}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">{e.toSourceStatus ?? "Not published"}</span>
        </span>
      );
    case "price_change":
      return (
        <span className="flex items-center gap-1.5 flex-wrap">
          <span className="text-muted-foreground">{e.fromPriceAed == null ? "Price first published" : "Price changed"}</span>
          {priceTransition(e.fromPriceAed, e.toPriceAed)}
          {e.fromPriceAed != null && e.toPriceAed != null && (
            <span
              className={
                "text-[0.6rem] uppercase tracking-wider rounded px-1.5 py-0.5 " +
                (e.toPriceAed > e.fromPriceAed
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400")
              }
            >
              {e.toPriceAed > e.fromPriceAed ? "↑" : "↓"}
              {Math.abs(
                Math.round(((e.toPriceAed - e.fromPriceAed) / e.fromPriceAed) * 100),
              )}
              %
            </span>
          )}
        </span>
      );
    case "removed":
      return <span>Removed from Aldar feed — status {e.fromStatus ?? "Not published"}{e.fromPriceAed != null ? ` · last price ${fmtAed(e.fromPriceAed)}` : ""}</span>;
    case "reappeared":
      return <span className="flex items-center gap-1.5 flex-wrap">Back in Aldar feed — status <span className="font-medium">{e.toStatus ?? "Not published"}</span>{e.fromPriceAed !== e.toPriceAed && priceTransition(e.fromPriceAed, e.toPriceAed)}</span>;
    default:
      return <span>{e.eventType}</span>;
  }
}

export function UnitTimeline({ unitName }: { unitName: string }) {
  const q = trpc.inventoryHistory.timeline.useQuery(
    { unitName },
    { enabled: Boolean(unitName), staleTime: 60_000 },
  );

  const events = (q.data?.events ?? []) as EventRow[];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
        <History className="h-3.5 w-3.5" />
        Sync history
      </div>

      {q.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading history…</div>
      ) : events.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No tracked changes yet. Weekly snapshots run every Monday at 06:00 (Gulf time);
          every recorded price, status, and official source-state change will appear here.
        </div>
      ) : (
        <ol className="relative border-l border-border ml-1.5 space-y-4">
          {events.map(e => (
            <li key={e.id} className="ml-4">
              <span className="absolute -left-[0.4rem] flex h-3 w-3 items-center justify-center rounded-full bg-background ring-2 ring-primary/40 text-primary">
                <span className="sr-only">{e.eventType}</span>
              </span>
              <div className="flex items-center gap-2 text-[0.62rem] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                <span className="text-primary/80">{iconFor(e.eventType)}</span>
                {fmtDate(e.createdAt)}
              </div>
              <div className="mt-1 text-sm text-foreground/90">{describe(e)}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default UnitTimeline;

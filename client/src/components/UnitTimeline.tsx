/**
 * UnitTimeline — combines developer-source movements with Master-only
 * operational card edits. A card sale never rewrites the Aldar source state.
 */
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { History, ArrowRight, Tag, CircleDot, PlusCircle, MinusCircle, RotateCcw, UserRoundCheck } from "lucide-react";

function fmtAed(n: number | null): string {
  if (n == null) return "—";
  return "AED " + new Intl.NumberFormat("en-US").format(n);
}

function fmtDate(d: Date | string | number): string {
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

type SourceEvent = {
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

type CardEvent = {
  id: string;
  eventType: "manual_sold" | "card_update";
  fromStatus: string | null;
  toStatus: string | null;
  fromPriceAed: number | null;
  toPriceAed: number | null;
  saleAgentName: string | null;
  soldAt: string | null;
  actorName: string | null;
  actorEmail: string;
  changes: Record<string, { from: unknown; to: unknown }>;
  createdAt: Date | string;
};

type TimelineEvent = (SourceEvent | CardEvent) & { origin: "aldar_source" | "card" };

function iconFor(type: string) {
  switch (type) {
    case "first_seen": return <PlusCircle className="h-3.5 w-3.5" />;
    case "status_change":
    case "manual_sold": return <UserRoundCheck className="h-3.5 w-3.5" />;
    case "price_change": return <Tag className="h-3.5 w-3.5" />;
    case "removed": return <MinusCircle className="h-3.5 w-3.5" />;
    case "reappeared": return <RotateCcw className="h-3.5 w-3.5" />;
    default: return <CircleDot className="h-3.5 w-3.5" />;
  }
}

function isSold(s: string | null) { return (s || "").trim().toLowerCase() === "sold"; }

function priceTransition(from: number | null, to: number | null) {
  return <><span className="text-muted-foreground">{from == null ? "Not published" : fmtAed(from)}</span><ArrowRight className="h-3 w-3 text-muted-foreground" /><span className="font-medium">{to == null ? "Not published" : fmtAed(to)}</span></>;
}

function describeSourceEvent(e: SourceEvent) {
  switch (e.eventType) {
    case "first_seen": return <span>Tracking started — status <span className="font-medium">{e.toStatus ?? "—"}</span>{e.toPriceAed != null && <> at <span className="font-medium">{fmtAed(e.toPriceAed)}</span></>}</span>;
    case "status_change": return <span className="flex items-center gap-1.5 flex-wrap"><span className="text-muted-foreground">{e.fromStatus ?? "—"}</span><ArrowRight className="h-3 w-3 text-muted-foreground" /><span className={isSold(e.toStatus) ? "font-semibold text-rose-600 dark:text-rose-400" : "font-medium"}>{e.toStatus ?? "—"}</span>{isSold(e.toStatus) && <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-rose-600 dark:text-rose-400">Sold</span>}</span>;
    case "source_status_change": return <span className="flex items-center gap-1.5 flex-wrap"><span className="text-muted-foreground">Official source state</span><span>{e.fromSourceStatus ?? "Not published"}</span><ArrowRight className="h-3 w-3 text-muted-foreground" /><span className="font-medium">{e.toSourceStatus ?? "Not published"}</span></span>;
    case "price_change": return <span className="flex items-center gap-1.5 flex-wrap"><span className="text-muted-foreground">{e.fromPriceAed == null ? "Price first published" : "Price changed"}</span>{priceTransition(e.fromPriceAed, e.toPriceAed)}</span>;
    case "removed": return <span>Removed from Aldar feed — previous status {e.fromStatus ?? "Not published"}{e.fromPriceAed != null ? ` · previous price ${fmtAed(e.fromPriceAed)}` : ""}</span>;
    case "reappeared": return <span className="flex items-center gap-1.5 flex-wrap">Back in Aldar feed — status <span className="font-medium">{e.toStatus ?? "Not published"}</span>{e.fromPriceAed !== e.toPriceAed && priceTransition(e.fromPriceAed, e.toPriceAed)}</span>;
    default: return <span>{e.eventType}</span>;
  }
}

const CARD_FIELD_LABELS: Record<string, string> = {
  askingPriceAed: "Asking price",
  status: "Operational status",
  saleAgentName: "Sale representative",
  soldAt: "Sale date",
  listingPartners: "Listing partners",
  publicNotes: "Public notes",
  landAreaSqm: "Land area",
  builtUpAreaSqm: "Built-up area",
  availableForRent: "Rental availability",
  rentPriceAed: "Rent price",
};
const PRIVATE_CARD_FIELDS = new Set(["ownerName", "ownerPhone", "ownerEmail", "internalNotes"]);

function valueText(value: unknown, field: string) {
  if (value == null || value === "") return "Not stated";
  if (field === "askingPriceAed" || field === "rentPriceAed") return fmtAed(typeof value === "number" ? value : Number(value));
  if (field === "soldAt") return fmtDate(String(value));
  return String(value);
}

function describeCardEvent(e: CardEvent) {
  const visible = Object.entries(e.changes).filter(([field]) => !PRIVATE_CARD_FIELDS.has(field));
  if (e.eventType === "manual_sold") {
    return <span className="flex flex-wrap items-center gap-1.5"><span className="font-semibold text-rose-600 dark:text-rose-400">Operational sale confirmed</span><span>{e.fromStatus ?? "Not stated"}</span><ArrowRight className="h-3 w-3 text-muted-foreground" /><span className="font-medium">Sold</span>{e.saleAgentName ? <span>· responsible: <span className="font-medium">{e.saleAgentName}</span></span> : null}{e.soldAt ? <span>· sale date: <span className="font-medium">{fmtDate(e.soldAt)}</span></span> : null}<span className="text-muted-foreground">· recorded by {e.actorName || e.actorEmail}</span></span>;
  }
  return <span className="space-y-1"><span className="font-medium">Operational card updated</span>{visible.slice(0, 3).map(([field, change]) => <span key={field} className="ml-1 inline-flex items-center gap-1 text-muted-foreground">· {CARD_FIELD_LABELS[field] ?? field}: <span>{valueText(change.from, field)}</span><ArrowRight className="h-3 w-3" /><span className="text-foreground">{valueText(change.to, field)}</span></span>)}<span className="ml-1 text-muted-foreground">· recorded by {e.actorName || e.actorEmail}</span></span>;
}

export function UnitTimeline({ unitName, villaKey }: { unitName: string; villaKey?: string }) {
  const { user } = useAuth();
  const source = trpc.inventoryHistory.timeline.useQuery({ unitName }, { enabled: Boolean(unitName), staleTime: 60_000 });
  const cards = trpc.villaListings.history.useQuery(
    { villaKey: villaKey ?? "", limit: 100 },
    { enabled: user?.role === "master" && Boolean(villaKey), staleTime: 60_000 },
  );
  const events = useMemo<TimelineEvent[]>(() => [
    ...((source.data?.events ?? []) as SourceEvent[]).map(event => ({ ...event, origin: "aldar_source" as const })),
    ...((cards.data ?? []) as CardEvent[]).map(event => ({ ...event, origin: "card" as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [cards.data, source.data]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-primary"><History className="h-3.5 w-3.5" /> Sync & card history</div>
      {source.isLoading || cards.isLoading ? <div className="text-sm text-muted-foreground">Loading history…</div> : events.length === 0 ? <div className="text-sm text-muted-foreground">No tracked changes yet. Daily snapshots run at 06:00 Gulf time; every source change and Master-recorded card change appears here.</div> : (
        <ol className="relative ml-1.5 space-y-4 border-l border-border">
          {events.map(event => <li key={`${event.origin}-${event.id}`} className="ml-4"><span className="absolute -left-[0.4rem] flex h-3 w-3 items-center justify-center rounded-full bg-background text-primary ring-2 ring-primary/40"><span className="sr-only">{event.eventType}</span></span><div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground"><span className="text-primary/80">{iconFor(event.eventType)}</span>{fmtDate(event.createdAt)}<span className="rounded bg-muted px-1.5 py-0.5 text-[0.55rem]">{event.origin === "card" ? "Card record" : "Aldar source"}</span></div><div className="mt-1 text-sm text-foreground/90">{event.origin === "card" ? describeCardEvent(event as CardEvent) : describeSourceEvent(event as SourceEvent)}</div></li>)}
        </ol>
      )}
    </div>
  );
}

export default UnitTimeline;

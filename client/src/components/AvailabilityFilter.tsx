/**
 * Unified Status filter — used on Landing (across all communities) and within
 * each community/cluster page (scoped).
 *
 * Sources live in the `availability_listings` table (admin-managed).
 * Counts come from `trpc.availability.summary` which is public.
 */
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Sparkles } from "lucide-react";

interface CommunityRef {
  slug: string;
  name: string;
  href: string;
  available: boolean;
}

interface Props {
  /** Communities to show counters for. */
  communities: CommunityRef[];
}

type Source = "nas-luxury" | "aldar" | "others" | "manual";

interface SummaryRow {
  community: string;
  total: number;
  available: number;
  reserved: number;
  sold: number;
  offMarket: number;
  bySource: Record<string, number>;
}

const SOURCE_LABEL: Record<Source, string> = {
  "nas-luxury": "NAS Luxury",
  aldar: "Aldar Resale",
  others: "Other brokers",
  manual: "Manual",
};

export function AvailabilityFilter({ communities }: Props) {
  const summary = trpc.availability.summary.useQuery();

  const rows = (summary.data?.communities ?? []) as SummaryRow[];
  const byCommunity = new Map(rows.map(r => [r.community, r]));

  const totalAvailable = rows.reduce((acc, r) => acc + r.available, 0);
  const totalNAS = rows.reduce(
    (acc, r) => acc + (r.bySource["nas-luxury"] ?? 0),
    0,
  );
  const totalAldar = rows.reduce(
    (acc, r) => acc + (r.bySource["aldar"] ?? 0),
    0,
  );
  const totalOthers = rows.reduce(
    (acc, r) => acc + (r.bySource["others"] ?? 0),
    0,
  );

  return (
    <div className="mb-8 rounded-md border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-mono text-primary mb-3">
        <Sparkles className="h-3.5 w-3.5" />
        Live availability
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <Stat label="Total available" value={totalAvailable} accent="primary" />
        <Stat
          label="Available with NAS Luxury"
          value={totalNAS}
          accent="emerald"
        />
        <Stat label="Aldar Resale" value={totalAldar} />
        <Stat label="Other brokers" value={totalOthers} />
      </div>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-1 py-1">Community</th>
              <th className="text-right px-1 py-1">NAS Luxury</th>
              <th className="text-right px-1 py-1">Aldar Resale</th>
              <th className="text-right px-1 py-1">Other brokers</th>
              <th className="text-right px-1 py-1">All available</th>
            </tr>
          </thead>
          <tbody>
            {communities
              .filter(c => c.available)
              .map(c => {
                const s = byCommunity.get(c.slug);
                const nas = s?.bySource["nas-luxury"] ?? 0;
                const aldar = s?.bySource["aldar"] ?? 0;
                const others = s?.bySource["others"] ?? 0;
                const all = s?.available ?? 0;
                const link = (count: number, qs: string) =>
                  count > 0 ? (
                    <Link
                      href={`${c.href}?${qs}`}
                      className="font-mono num-display text-primary hover:underline"
                    >
                      {count}
                    </Link>
                  ) : (
                    <span className="font-mono num-display text-muted-foreground">
                      —
                    </span>
                  );
                return (
                  <tr key={c.slug} className="border-t border-border/60">
                    <td className="px-1 py-2">{c.name}</td>
                    <td className="px-1 py-2 text-right">
                      {link(nas, "avail=nas")}
                    </td>
                    <td className="px-1 py-2 text-right">
                      {link(aldar, "avail=aldar")}
                    </td>
                    <td className="px-1 py-2 text-right">
                      {link(others, "avail=others")}
                    </td>
                    <td className="px-1 py-2 text-right">
                      {link(all, "avail=any")}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Counts are live from the admin-managed inventory.{" "}
        <Link
          href="/admin/availability"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Manage listings →
        </Link>
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "primary" | "emerald";
}) {
  const cls =
    accent === "emerald"
      ? "text-emerald-700"
      : accent === "primary"
        ? "text-primary"
        : "text-foreground";
  return (
    <div className="rounded-sm border border-border/60 bg-background p-3">
      <div className="text-[0.65rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
        {label}
      </div>
      <div className={`font-display num-display text-3xl mt-1 ${cls}`}>
        {value}
      </div>
    </div>
  );
}

import { formatArea } from "@/lib/areaSearch";
import type { FayaTransaction } from "@/data/fayaTransactions";

function formatAed(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export default function FayaTransactionTimeline({
  transactions,
  compact = false,
}: {
  transactions: FayaTransaction[];
  compact?: boolean;
}) {
  if (transactions.length === 0) return null;

  return (
    <div className={`rounded-md border border-primary/30 bg-primary/5 ${compact ? "p-3" : "p-4"}`}>
      <div className="text-[0.62rem] font-mono uppercase tracking-[0.18em] text-primary">
        ADREC transaction history
      </div>
      {transactions.map(transaction => (
        <div key={transaction.id} className="mt-2">
          <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-mono uppercase tracking-wider text-muted-foreground">
            <span>{transaction.date}</span>
            <span className="rounded border border-primary/30 px-1.5 py-0.5 text-primary">{transaction.saleType}</span>
            <span>{transaction.readiness}</span>
          </div>
          <div className={`${compact ? "text-lg" : "text-2xl"} mt-1 font-display text-foreground num-display`}>
            AED {formatAed(transaction.priceAed)}
          </div>
          <div className="mt-1 text-[0.7rem] font-mono text-muted-foreground">
            Combined land {formatArea({ sqm: transaction.landAreaSqm }, "sqm")} · Combined BUA {formatArea({ sqm: transaction.builtUpAreaSqm }, "sqm")}
          </div>
          <div className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
            Combined sale across the two largest Faya units. The AED 190M price and areas are shown in full and are not divided between the two cards.
          </div>
        </div>
      ))}
    </div>
  );
}

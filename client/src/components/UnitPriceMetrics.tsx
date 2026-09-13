import { fmtAed, getUnitPriceMetrics } from "@/data/aldar/format";

type Props = {
  priceAed: number | null | undefined;
  saleableAreaSqm: number | null | undefined;
  totalAreaSqm: number | null | undefined;
  compact?: boolean;
  className?: string;
};

/** Shows a transparent derived metric only when source price and area exist. */
export function UnitPriceMetrics({
  priceAed,
  saleableAreaSqm,
  totalAreaSqm,
  compact = false,
  className = "",
}: Props) {
  const metrics = getUnitPriceMetrics(priceAed, saleableAreaSqm, totalAreaSqm);
  if (!metrics) return null;

  const areaNote = metrics.areaSource === "saleable" ? "Saleable area" : "Total / BUA";
  if (compact) {
    return (
      <div className={`text-[0.66rem] font-mono leading-relaxed text-muted-foreground ${className}`}>
        <div>AED {fmtAed(metrics.pricePerSqftAed)} / sqft</div>
        <div>AED {fmtAed(metrics.pricePerSqmAed)} / m²</div>
      </div>
    );
  }

  return (
    <div className={`rounded-md border border-primary/20 bg-primary/[0.035] p-3 ${className}`}>
      <div className="text-[0.6rem] uppercase tracking-[0.18em] font-mono text-primary">Price density</div>
      <div className="mt-1 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.14em] font-mono text-muted-foreground">Per sqft</div>
          <div className="mt-0.5 font-display text-base num-display text-foreground">AED {fmtAed(metrics.pricePerSqftAed)}</div>
        </div>
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.14em] font-mono text-muted-foreground">Per m²</div>
          <div className="mt-0.5 font-display text-base num-display text-foreground">AED {fmtAed(metrics.pricePerSqmAed)}</div>
        </div>
      </div>
      <div className="mt-2 text-[0.6rem] font-mono text-muted-foreground">Calculated from documented {areaNote.toLowerCase()}.</div>
    </div>
  );
}

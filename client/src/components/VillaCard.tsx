/**
 * Coastal Atelier — VillaCard
 * Editorial card for a single villa: large serif numeral, hairline divider,
 * three external CTAs (PDF, Maps, Earth) and a "view detail" link.
 */
import { Link } from "wouter";
import { FileText, MapPin, Globe2, ArrowUpRight, TrendingUp } from "lucide-react";
import type { Villa } from "@/data/villas";
import { getVillaTransactions } from "@/data/stregisTransactions";
import { getPlotLandArea } from "@/data/plotLandAreas";
import type { ListingIndexEntry } from "@/hooks/useListingIndex";
import {
  EditListingButton,
  ListingBadge,
  ListingPriceLabel,
} from "@/components/ListingControls";

interface Props {
  villa: Villa;
  isActive: boolean;
  onHover: (id: number | null) => void;
  onSelect: (id: number) => void;
  listing?: ListingIndexEntry | null;
}

export default function VillaCard({ villa: v, isActive, onHover, onSelect, listing }: Props) {
  const villaKey = `st-regis/Plot-${v.id}`;
  const transactions = getVillaTransactions(v.id);
  return (
    <div
      onMouseEnter={() => onHover(v.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(v.id)}
      className={[
        "villa-card bg-card border border-border rounded-md overflow-hidden flex flex-col rise-in",
        isActive ? "is-active" : "",
      ].join(" ")}
    >
      <div className="p-4 sm:p-5 flex items-start gap-4">
        <div className="shrink-0 flex flex-col items-center">
          <div className="font-display num-display text-[3.2rem] leading-none text-foreground">
            {v.id}
          </div>
          <div className="text-[0.62rem] uppercase tracking-[0.18em] font-mono text-muted-foreground mt-1">
            Villa
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="font-mono text-xs text-muted-foreground truncate flex items-center gap-2">
              <span className="truncate">{v.admPlotId} · {v.aldarPlotId}</span>
              <ListingBadge status={listing?.status ?? null} />
            </div>
            <span className="text-[0.62rem] uppercase tracking-[0.16em] font-mono px-1.5 py-0.5 rounded-sm border border-primary/30 text-primary bg-primary/5">
              {v.bedrooms ? `${v.bedrooms} BR` : "Villa"}
            </span>
          </div>
          {listing?.askingPriceAed ? (
            <div className="mt-1">
              <ListingPriceLabel askingPriceAed={listing.askingPriceAed} />
              {listing.listingPartners && (
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 truncate">
                  with {listing.listingPartners}
                </div>
              )}
            </div>
          ) : null}
          <h3 className="font-display text-lg text-foreground mt-1 leading-snug">
            {v.buildingTypology || "St. Regis Villa"}
          </h3>
          {transactions.length > 0 && (() => {
            const last = transactions[transactions.length - 1];
            const fmtPrice = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(last.priceAed);
            const isPrimary = last.saleType === "primary";
            // Calculate appreciation if there's a primary and a later secondary
            const primary = transactions.find(t => t.saleType === "primary");
            const lastSecondary = [...transactions].reverse().find(t => t.saleType === "secondary");
            let appreciation: number | null = null;
            if (primary && lastSecondary && lastSecondary.date > primary.date) {
              appreciation = ((lastSecondary.priceAed - primary.priceAed) / primary.priceAed) * 100;
            }
            return (
              <div className="mt-2 p-2.5 rounded-md border border-border bg-accent/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[0.6rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${
                    isPrimary
                      ? "text-primary border-primary/30 bg-primary/5"
                      : "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5"
                  }`}>
                    {isPrimary ? "Primary" : "Resale"}
                  </span>
                  <span className="text-[0.6rem] font-mono text-muted-foreground">{last.date}</span>
                  {appreciation !== null && (
                    <span className="ml-auto text-[0.65rem] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      +{appreciation.toFixed(0)}%
                    </span>
                  )}
                </div>
                <div className="font-display text-base text-foreground">
                  AED {fmtPrice}
                </div>
                <div className="text-[0.6rem] font-mono text-muted-foreground mt-0.5">
                  {last.ratePerSqft.toLocaleString()} AED/sqft · {transactions.length} recorded sale{transactions.length > 1 ? "s" : ""}
                </div>
              </div>
            );
          })()}
          <dl className="mt-3 grid grid-cols-3 gap-3 text-[0.78rem]">
            <div>
              <dt className="text-[0.62rem] uppercase tracking-[0.14em] font-mono text-muted-foreground">Plot</dt>
              <dd className="tabular text-foreground mt-0.5">{(() => {
                const dcr = getPlotLandArea(`st-regis/Plot-${v.id}`);
                if (dcr) return `${dcr.sqft.toLocaleString()} sqft`;
                return v.plotAreaSqm ? `${v.plotAreaSqm.toFixed(0)} m²` : "—";
              })()}</dd>
            </div>
            <div>
              <dt className="text-[0.62rem] uppercase tracking-[0.14em] font-mono text-muted-foreground">GFA</dt>
              <dd className="tabular text-foreground mt-0.5">{v.maxGfaSqm ? `${v.maxGfaSqm.toFixed(0)} m²` : "—"}</dd>
            </div>
            <div>
              <dt className="text-[0.62rem] uppercase tracking-[0.14em] font-mono text-muted-foreground">Height</dt>
              <dd className="tabular text-foreground mt-0.5">{v.maxBuildingHeightM ? `${v.maxBuildingHeightM} m` : "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 sm:pb-5 mt-auto">
        <div className="divider-rule mb-3" />
        <div className="flex items-center gap-2 flex-wrap">
          <CTA href={v.pdfLocalUrl} icon={<FileText className="h-3.5 w-3.5" />} label="PDF" tone="primary" />
          <CTA href={v.googleMapsUrl} icon={<MapPin className="h-3.5 w-3.5" />} label="Maps" />
          <CTA href={v.googleEarthUrl} icon={<Globe2 className="h-3.5 w-3.5" />} label="Earth" />
          <div className="ml-auto flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <EditListingButton
              villaKey={villaKey}
              community="st-regis"
              villaLabel={`Villa ${v.id}`}
            />
            <Link
              href={`/st-regis/villa/${v.id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary"
            >
              Details
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CTA({ href, icon, label, tone }: { href: string; icon: React.ReactNode; label: string; tone?: "primary" }) {
  const base =
    "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sm border transition-colors";
  const cls =
    tone === "primary"
      ? `${base} bg-primary text-primary-foreground border-primary hover:bg-primary/90`
      : `${base} bg-card text-foreground border-border hover:bg-secondary hover:border-primary/30`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cls}
      onClick={(e) => e.stopPropagation()}
    >
      {icon}
      {label}
    </a>
  );
}

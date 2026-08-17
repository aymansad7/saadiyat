/**
 * SimplePlotCard — used by Jawaher and Saadiyat Beach Villas.
 *
 * The "Open DCR" button resolves the PDF URL from our own DB/S3 storage
 * (via `useDcrPdfUrl(villaKey)`). External DMT GeoSmart URLs are no longer used.
 * If the PDF isn't in DB (rare 404 plots), we show a disabled "Not available"
 * pill instead of leaking the external URL.
 */
import { FileText, MapPin, Loader2, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import type { SimplePlot } from "@/data/communities";
import { MYLAND_URL } from "@/data/communities";
import { useDcrPdfUrl } from "@/hooks/useDcrPdfUrl";
import type { ListingIndexEntry } from "@/hooks/useListingIndex";

export interface PlotTransaction {
  date: string;
  priceAed: number;
  saleType: "primary" | "secondary";
  ratePerSqft: number | null;
}
import {
  EditListingButton,
  ListingBadge,
  ListingPriceLabel,
} from "@/components/ListingControls";

interface Props {
  plot: SimplePlot;
  communityLabel: string; // shown above the title
  bigNumber?: string;     // override for the large numeral (defaults to plot.id)
  /**
   * Optional: a pre-resolved DCR PDF URL (or null if not in DB) when the parent
   * page bulk-fetches the entire community via `useDcrPdfIndex`. Keeps Jawaher
   * /SBV from issuing N separate per-card queries.
   */
  pdfUrl?: string | null;
  /** Whether the parent's bulk fetch is still loading. */
  pdfLoading?: boolean;
  /** Optional pre-resolved listing row. When omitted, the card hides listing chrome. */
  listing?: ListingIndexEntry | null;
  /** Community slug for the Edit dialog (required when admins should be able to start a new listing). */
  community?: string;
  /** Optional transaction history for this plot */
  transactions?: PlotTransaction[];
  /** Optional land area in sqft (from transaction data) */
  landSqft?: number;
  /** Optional link to detail page */
  detailHref?: string;
}

export default function SimplePlotCard({
  plot,
  communityLabel,
  bigNumber,
  pdfUrl: pdfUrlProp,
  pdfLoading: pdfLoadingProp,
  listing,
  community,
  transactions,
  landSqft,
  detailHref,
}: Props) {
  // If parent provided a bulk-resolved URL, use it. Otherwise fall back to the
  // single-villa hook (cheap on detail pages, expensive on listing pages).
  const useOwnQuery = pdfUrlProp === undefined;
  const own = useDcrPdfUrl(useOwnQuery ? plot.villaKey : undefined);
  const url = useOwnQuery ? own.url : pdfUrlProp;
  const isLoading = useOwnQuery ? own.isLoading : Boolean(pdfLoadingProp);
  const isFetched = useOwnQuery ? own.isFetched : !pdfLoadingProp;
  const hasPdf = Boolean(url);

  return (
    <div className="villa-card bg-card border border-border rounded-md overflow-hidden flex flex-col rise-in">
      <div className="p-4 sm:p-5 flex items-start gap-4">
        <div className="shrink-0 flex flex-col items-center">
          <div className="font-display num-display text-[3.2rem] leading-none text-foreground">
            {bigNumber ?? plot.id}
          </div>
          <div className="text-[0.62rem] uppercase tracking-[0.18em] font-mono text-muted-foreground mt-1">
            Plot
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground truncate flex items-center gap-2">
            <span className="truncate">{communityLabel}</span>
            <ListingBadge status={listing?.status ?? null} />
          </div>
          <h3 className="font-display text-lg text-foreground mt-1 leading-snug truncate">
            {plot.label}
          </h3>
          {landSqft && (
            <div className="font-mono text-xs text-muted-foreground mt-1">
              {landSqft.toLocaleString()} sqft · {(landSqft * 0.092903).toFixed(0)} m²
            </div>
          )}
          {transactions && transactions.length > 0 && (() => {
            const last = transactions[transactions.length - 1];
            const fmtPrice = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(last.priceAed);
            const isPrimary = last.saleType === "primary";
            const firstPrimary = transactions.find(t => t.saleType === "primary");
            const lastSecondary = [...transactions].reverse().find(t => t.saleType === "secondary");
            let appreciation: number | null = null;
            if (firstPrimary && lastSecondary && lastSecondary.date > firstPrimary.date) {
              appreciation = ((lastSecondary.priceAed - firstPrimary.priceAed) / firstPrimary.priceAed) * 100;
            }
            return (
              <div className="mt-2 p-2 rounded-md border border-border bg-accent/30">
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
                    <span className={`ml-auto text-[0.65rem] font-mono flex items-center gap-0.5 ${
                      appreciation >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}>
                      {appreciation >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {appreciation >= 0 ? "+" : ""}{appreciation.toFixed(0)}%
                    </span>
                  )}
                </div>
                <div className="font-display text-base text-foreground">
                  AED {fmtPrice}
                </div>
                <div className="text-[0.6rem] font-mono text-muted-foreground mt-0.5">
                  {last.ratePerSqft ? `${last.ratePerSqft.toLocaleString()} AED/sqft · ` : ""}{transactions.length} sale{transactions.length > 1 ? "s" : ""}
                </div>
              </div>
            );
          })()}
          {listing?.askingPriceAed ? (
            <div className="mt-1.5">
              <ListingPriceLabel askingPriceAed={listing.askingPriceAed} />
            </div>
          ) : (
            <div className="font-mono text-xs text-muted-foreground mt-1 truncate" title={plot.pdfFilename}>
              {plot.pdfFilename}
            </div>
          )}
          {listing?.listingPartners ? (
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 truncate">
              with {listing.listingPartners}
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 sm:pb-5 mt-auto">
        <div className="divider-rule mb-3" />
        <div className="flex items-center gap-2 flex-wrap">
          {isLoading && !isFetched ? (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sm border bg-muted text-muted-foreground border-border"
              aria-busy="true"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading DCR
            </span>
          ) : hasPdf ? (
            <a
              href={url!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sm border bg-primary text-primary-foreground border-primary hover:bg-primary/90"
            >
              <FileText className="h-3.5 w-3.5" />
              Open DCR
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sm border bg-muted text-muted-foreground border-border opacity-70"
              title="DCR not available for this plot"
            >
              <FileText className="h-3.5 w-3.5" />
              DCR not available
            </span>
          )}
          <a
            href={MYLAND_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sm border bg-card text-foreground border-border hover:bg-secondary hover:border-primary/30"
          >
            <MapPin className="h-3.5 w-3.5" />
            MyLand portal
          </a>
          {detailHref && (
            <Link
              href={detailHref}
              className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary ml-auto"
            >
              Details
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {community && !detailHref && (
            <EditListingButton
              villaKey={plot.villaKey}
              community={community}
              villaLabel={plot.label}
              className="ml-auto"
            />
          )}
        </div>
      </div>
    </div>
  );
}

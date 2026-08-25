/**
 * SimplePlotCard — used by Jawaher and Saadiyat Beach Villas.
 *
 * The "Open DCR" button resolves the PDF URL from our own DB/S3 storage
 * (via `useDcrPdfUrl(villaKey)`). External DMT GeoSmart URLs are no longer used.
 * If the PDF isn't in DB (rare 404 plots), we show a disabled "Not available"
 * pill instead of leaking the external URL.
 */
import { FileText, MapPin, Loader2, ArrowUpRight, Map } from "lucide-react";
import { Link } from "wouter";
import type { SimplePlot } from "@/data/communities";
import { MYLAND_URL } from "@/data/communities";
import { useDcrPdfUrl } from "@/hooks/useDcrPdfUrl";
import type { ListingIndexEntry } from "@/hooks/useListingIndex";
import type { PFListing } from "@/data/propertyFinderListings";
import { formatArea, type AreaUnit } from "@/lib/areaSearch";

export interface PlotTransaction {
  date: string;
  priceAed: number;
  saleType: "primary" | "secondary";
  ratePerSqft: number | null;
  builtUpAreaSqm?: number | null;
  builtUpAreaSqft?: number | null;
  confidence?: "exact" | "approved" | "possible" | "user-confirmed";
  areaDifferenceSqm?: number;
}
import {
  EditListingButton,
  ListingBadge,
  ListingPropertyFacts,
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
  /** Show a clear empty transaction state when no confirmed history exists. */
  showTransactionStatus?: boolean;
  /** Optional land area in sqft (from transaction data) */
  landSqft?: number;
  /** Optional authoritative land area in square metres (from DCR data). */
  landSqm?: number;
  /** Preferred land-area display unit. Defaults to square metres. */
  areaUnit?: AreaUnit;
  /** Optional link to detail page */
  detailHref?: string;
  /** Optional deep link to this plot on the interactive map */
  mapHref?: string;
  /** Optional PropertyFinder active listing (matched by land area) */
  pfListing?: PFListing;
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
  showTransactionStatus,
  landSqft,
  landSqm,
  areaUnit = "sqm",
  detailHref,
  mapHref,
  pfListing,
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
    <div id={`plot-${plot.id}`} className="villa-card bg-card border border-border rounded-md overflow-hidden flex flex-col rise-in scroll-mt-28">
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
          {(landSqft || landSqm) && (
            <div className="font-mono text-xs text-muted-foreground mt-1">
              {formatArea({ sqm: landSqm, sqft: landSqft }, areaUnit)}
            </div>
          )}
          <ListingPropertyFacts listing={listing} />
          {transactions && transactions.length > 0 && (
            <div className="mt-2 rounded-md border border-border bg-accent/20 overflow-hidden">
              <div className="px-2.5 py-1.5 border-b border-border bg-accent/30 text-[0.62rem] font-mono uppercase tracking-wider text-primary">
                Transaction history · {transactions.length} sale{transactions.length > 1 ? "s" : ""}
              </div>
              <div className="px-2.5 py-1">
                {transactions.map((transaction, index) => (
                  <div
                    key={`${transaction.date}-${transaction.priceAed}-${transaction.saleType}-${index}`}
                    className="border-t border-border/70 py-2 first:border-t-0"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[0.52rem] font-mono uppercase px-1 py-0.5 rounded-sm border ${
                        transaction.saleType === "primary"
                          ? "text-primary border-primary/30 bg-primary/5"
                          : "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5"
                      }`}>
                        {transaction.saleType === "primary" ? "Primary" : "Resale"}
                      </span>
                      <span className="text-[0.58rem] font-mono text-muted-foreground whitespace-nowrap">{transaction.date}</span>
                    </div>
                    <div className="mt-1 text-sm font-mono font-bold text-foreground whitespace-nowrap">
                      AED {new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(transaction.priceAed)}
                    </div>
                    {transaction.builtUpAreaSqm ? (
                      <div className="mt-0.5 text-[0.58rem] font-mono text-muted-foreground">
                        BUA {formatArea({ sqm: transaction.builtUpAreaSqm, sqft: transaction.builtUpAreaSqft ?? undefined }, areaUnit)}
                        {typeof transaction.areaDifferenceSqm === "number" && transaction.areaDifferenceSqm > 0.75
                          ? ` · Land Δ ${transaction.areaDifferenceSqm.toFixed(2)} m²`
                          : ""}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              {transactions.some((transaction) => transaction.confidence === "possible") && (
                <div className="border-t border-amber-300/60 bg-amber-50/80 px-2.5 py-2 text-[0.58rem] font-mono text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                  Possible transaction match — the recorded land area differs from this DCR plot area.
                </div>
              )}
            </div>
          )}
          {showTransactionStatus && (!transactions || transactions.length === 0) && (
            <div className="mt-2 rounded-md border border-dashed border-border bg-muted/30 px-2.5 py-2 text-[0.6rem] font-mono text-muted-foreground">
              No confirmed transaction matched to this DCR land area.
            </div>
          )}
          {listing?.askingPriceAed ? (
            <div className="mt-1.5">
              <ListingPriceLabel askingPriceAed={listing.askingPriceAed} />
            </div>
          ) : (
            <div className="font-mono text-xs text-muted-foreground mt-1 truncate" title={plot.pdfFilename}>
              {plot.pdfFilename}
            </div>
          )}
          {pfListing && (
            <div className="mt-2 p-2.5 rounded-md border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-700">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[0.6rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm border text-emerald-700 dark:text-emerald-300 border-emerald-500/40 bg-emerald-500/10">
                  Listed for Sale
                </span>
                <span className="text-[0.6rem] font-mono text-muted-foreground ml-auto">{pfListing.listedAgo} ago</span>
              </div>
              <div className="font-display text-base text-emerald-800 dark:text-emerald-200">
                AED {new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(pfListing.priceAed)}
              </div>
              <div className="text-[0.6rem] font-mono text-muted-foreground mt-0.5">
                {pfListing.agent} · {pfListing.agency}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Link
                  href={`/map?plot=${encodeURIComponent(plot.villaKey)}`}
                  className="inline-flex items-center gap-1 text-[0.65rem] font-medium text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  <Map className="h-3 w-3" /> View on Map
                </Link>
                <a
                  href={pfListing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[0.65rem] font-medium text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  <ArrowUpRight className="h-3 w-3" /> PropertyFinder
                </a>
              </div>
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
          {mapHref && (
            <Link
              href={mapHref}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sm border bg-card text-foreground border-border hover:bg-secondary hover:border-primary/30"
            >
              <Map className="h-3.5 w-3.5" />
              View on Map
            </Link>
          )}
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

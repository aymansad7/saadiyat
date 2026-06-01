/**
 * SimplePlotCard — used by Jawaher and Saadiyat Beach Villas.
 *
 * The "Open DCR" button resolves the PDF URL from our own DB/S3 storage
 * (via `useDcrPdfUrl(villaKey)`). External DMT GeoSmart URLs are no longer used.
 * If the PDF isn't in DB (rare 404 plots), we show a disabled "Not available"
 * pill instead of leaking the external URL.
 */
import { FileText, MapPin, Loader2 } from "lucide-react";
import type { SimplePlot } from "@/data/communities";
import { MYLAND_URL } from "@/data/communities";
import { useDcrPdfUrl } from "@/hooks/useDcrPdfUrl";
import type { ListingIndexEntry } from "@/hooks/useListingIndex";
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
}

export default function SimplePlotCard({
  plot,
  communityLabel,
  bigNumber,
  pdfUrl: pdfUrlProp,
  pdfLoading: pdfLoadingProp,
  listing,
  community,
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
          {community && (
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

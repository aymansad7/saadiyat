/**
 * Coastal Atelier — Lagoons villa card.
 *
 * Compact card listing one Saadiyat Lagoons villa with: bedroom count,
 * plot/saleable area, position-type badge (corner / single-row / interior),
 * two CTAs (Aldar portal + Google Maps), and **resale availability badges**
 * for any of the three sources the villa is listed in:
 *   - NAS Luxury Resale (emerald — confirmed availability)
 *   - Aldar Resale (amber — official source, subject to confirmation)
 *   - Others Resale (neutral — uncertain broker listings)
 */
import { Link } from "wouter";
import { ArrowUpRight, ExternalLink, MapPin } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import type { LagoonsVilla } from "@/data/lagoons";
import {
  getAvailability,
  SOURCE_META,
  type ResaleSource,
} from "@/data/lagoonsAvailability";
import type { ListingIndexEntry } from "@/hooks/useListingIndex";
import {
  EditListingButton,
  InteractiveMapLink,
  ListingBadge,
  ListingOwnerFacts,
  ListingPropertyFacts,
  ListingPriceLabel,
} from "@/components/ListingControls";
import { formatArea, type AreaUnit } from "@/lib/areaSearch";
import { trpc } from "@/lib/trpc";

function formatAed(value: number) {
  return new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(value);
}

export function lagoonsVillaKey(v: LagoonsVilla) {
  return `saadiyat-lagoons/${v.cluster}-${v.unit_name}`;
}

interface Props {
  villa: LagoonsVilla;
  listing?: ListingIndexEntry | null;
  areaUnit?: AreaUnit;
}

function positionBadge(villa: LagoonsVilla): { label: string; cls: string } | null {
  if (villa.position_type === "corner") {
    return {
      label: "Corner",
      cls: "border-primary/60 text-primary bg-primary/5",
    };
  }
  if (villa.position_type === "edge") {
    return {
      label: "Single-row",
      cls: "border-foreground/30 text-foreground bg-foreground/5",
    };
  }
  return null;
}

export default function LagoonsVillaCard({ villa, listing, areaUnit = "sqm" }: Props) {
  const { user } = useAuth();
  const permissions = trpc.propertyAccess.permissions.useQuery(
    { projects: ["lagoons"] },
    { enabled: Boolean(user) },
  );
  const canViewOriginalPrice =
    user?.role === "admin" ||
    user?.role === "master" ||
    permissions.data?.[0]?.permissions.canViewOriginalPrice === true;
  const badge = positionBadge(villa);
  const detailHref = `/saadiyat-lagoons/${villa.cluster}/${encodeURIComponent(villa.unit_name)}`;
  const availability = getAvailability(villa.unit_number);
  const originalPrice = villa.aldar_data?.selling_price_aed ?? null;
  const builtUpSqm = villa.aldar_data?.total_area_sqm ?? null;

  const sharedAskingPrice = availability.sharedAvailability?.asking_price_aed ?? null;
  const sourcedAskingPrice = availability.nasLuxury?.selling_price_aed
    ?? availability.aldar[0]?.asking_price_aed
    ?? sharedAskingPrice;
  const hasConfirmedAvailability = availability.sources.includes("nas-luxury") || availability.sources.includes("shared-availability");
  const cardRing = hasConfirmedAvailability ? SOURCE_META["shared-availability"].cardCls : "";

  return (
    <div
      className={[
        "villa-card group bg-card border border-border rounded-md overflow-hidden flex flex-col rise-in hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-22px_rgba(34,30,25,0.4)] transition-all",
        cardRing,
      ].join(" ")}
    >
      <Link href={detailHref} className="block p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                {villa.cluster_label}
              </span>
              <ListingBadge status={listing?.status ?? null} />
              {badge && (
                <span
                  className={[
                    "text-[0.58rem] uppercase tracking-[0.16em] font-mono px-1.5 py-0.5 rounded-sm border leading-none",
                    badge.cls,
                  ].join(" ")}
                >
                  {badge.label}
                </span>
              )}
            </div>
            <div className="font-display num-display text-[2rem] leading-none text-foreground mt-1.5 group-hover:text-primary transition-colors">
              {villa.short_name}
            </div>
            <div className="font-display text-sm text-foreground/90 mt-1">
              {villa.bedrooms ?? "—"}-BR Villa
              {villa.variant ? (
                <span className="text-muted-foreground font-normal"> · {villa.variant}</span>
              ) : null}
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
        <dl className="font-mono text-[0.7rem] text-muted-foreground mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.16em]">Plot</div>
            <div className="tabular text-foreground text-sm">
              {formatArea({ sqm: villa.plot_area_sqm }, areaUnit)}
            </div>
          </div>
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.16em]">Saleable</div>
            <div className="tabular text-foreground text-sm">
              {formatArea({ sqm: villa.saleable_area_sqm }, areaUnit)}
            </div>
          </div>
          {builtUpSqm != null && (
            <div>
              <div className="text-[0.6rem] uppercase tracking-[0.16em]">Built-up</div>
              <div className="tabular text-foreground text-sm">
                {formatArea({ sqm: builtUpSqm }, areaUnit)}
              </div>
            </div>
          )}
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.16em]">Status</div>
            <div className="tabular text-foreground text-sm">
              {villa.status ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.16em]">Mirror</div>
            <div className="tabular text-foreground text-sm">
              {villa.mirror === "MIRROR" ? "Yes" : "No"}
            </div>
          </div>
        </dl>

        {(listing?.askingPriceAed ?? sourcedAskingPrice) ? (
          <div className="mt-3">
            <ListingPriceLabel askingPriceAed={listing?.askingPriceAed ?? sourcedAskingPrice} />
            {listing?.listingPartners && (
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 truncate">
                with {listing.listingPartners}
              </div>
            )}
          </div>
        ) : null}
        <ListingPropertyFacts listing={listing} />
        <ListingOwnerFacts listing={listing} />
        {originalPrice != null && canViewOriginalPrice && (
          <div className="mt-3 border-l-2 border-primary/50 pl-2.5">
            <div className="text-[0.6rem] uppercase tracking-[0.16em] font-mono text-muted-foreground">
              Original price
            </div>
            <div className="font-display num-display text-lg text-foreground tabular">
              AED {formatAed(originalPrice)}
            </div>
          </div>
        )}
        {availability.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {availability.sources.map((src: ResaleSource) => (
              <span
                key={src}
                className={[
                  "text-[0.58rem] uppercase tracking-[0.14em] font-mono px-2 py-0.5 rounded-sm border leading-none",
                  SOURCE_META[src].cls,
                ].join(" ")}
              >
                {SOURCE_META[src].label}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="px-4 sm:px-5 pb-4 sm:pb-5 mt-auto">
        <div className="divider-rule mb-3" />
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={detailHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sm border bg-card text-foreground border-border hover:bg-secondary hover:border-primary/30"
          >
            Full details
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <InteractiveMapLink villaKey={`lagoons/${villa.unit_name}`} />
          <a
            href={villa.detail_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sm border bg-primary text-primary-foreground border-primary hover:bg-primary/90"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Aldar portal
          </a>
          <a
            href={villa.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sm border bg-card text-foreground border-border hover:bg-secondary hover:border-primary/30"
            onClick={(e) => e.stopPropagation()}
          >
            <MapPin className="h-3.5 w-3.5" />
            Google Maps
          </a>
          <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
            <EditListingButton
              villaKey={lagoonsVillaKey(villa)}
              community="saadiyat-lagoons"
              villaLabel={`${villa.cluster_label} · ${villa.short_name}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

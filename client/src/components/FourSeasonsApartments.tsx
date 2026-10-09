import { useMemo, useState } from "react";
import { Building2, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EditListingButton,
  ListingOwnerFacts,
  ListingPriceLabel,
  ListingPropertyFacts,
  OneDriveCardLinks,
} from "@/components/ListingControls";
import { FourSeasonsSourceStatusBadge } from "@/components/FourSeasonsSourceStatusBadge";
import {
  FOUR_SEASONS_ALAIN_APARTMENTS,
  FOUR_SEASONS_ALAIN_SNAPSHOT,
  type FourSeasonsAlainSourceStatus,
  type FourSeasonsAlainUnit,
} from "@/data/fourSeasonsAlainExplore";
import type { ListingIndexEntry } from "@/hooks/useListingIndex";
import { formatArea, type AreaUnit } from "@/lib/areaSearch";

const AED = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });
const SOURCE_FILTERS: Array<"all" | FourSeasonsAlainSourceStatus> = ["all", "Available", "Booked", "Reserved", "Blocked", "Sold"];

function listingIsAvailable(listing: ListingIndexEntry | null | undefined) {
  return listing?.status === "available";
}

function sourceUpdatedLabel() {
  return new Date(FOUR_SEASONS_ALAIN_SNAPSHOT.sourceFetchedAtUae).toLocaleString("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function area(unit: FourSeasonsAlainUnit, kind: "saleable" | "internal" | "balcony", areaUnit: AreaUnit) {
  const data = kind === "saleable"
    ? { sqm: unit.saleableAreaSqm, sqft: unit.saleableAreaSqft }
    : kind === "internal"
      ? { sqm: unit.internalAreaSqm, sqft: unit.internalAreaSqft }
      : { sqm: unit.balconyAreaSqm, sqft: unit.balconyAreaSqft };
  return formatArea(data, areaUnit);
}

function currentPrice(unit: FourSeasonsAlainUnit, listing: ListingIndexEntry | null | undefined) {
  return listing?.askingPriceAed ?? unit.priceAed;
}

export function FourSeasonsApartments({
  listingIndex,
  areaUnit,
}: {
  listingIndex: ReadonlyMap<string, ListingIndexEntry>;
  areaUnit: AreaUnit;
}) {
  const [query, setQuery] = useState("");
  const [bedrooms, setBedrooms] = useState<"all" | "2" | "3" | "4" | "5">("all");
  const [sourceStatus, setSourceStatus] = useState<"all" | FourSeasonsAlainSourceStatus>("all");

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return FOUR_SEASONS_ALAIN_APARTMENTS.filter((unit) => {
      if (bedrooms !== "all" && unit.bedrooms !== Number(bedrooms)) return false;
      if (sourceStatus !== "all" && unit.sourceStatus !== sourceStatus) return false;
      if (!normalized) return true;
      return [unit.unitNumber, unit.unitCode, unit.displayType, unit.floor ? `floor ${unit.floor}` : ""]
        .some((value) => value.toLowerCase().includes(normalized));
    });
  }, [bedrooms, query, sourceStatus]);

  const liveAvailable = (FOUR_SEASONS_ALAIN_SNAPSHOT.apartmentStatusCounts as Record<string, number>).Available ?? 0;

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border bg-gradient-to-br from-slate-950 via-slate-900 to-[#1b3f3a] p-5 text-white sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-amber-200/80">Tower 1 · residence inventory</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Apartments & Penthouses</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
              A separate collection of 60 published Tower 1 residences — not positioned on the villa master plan. Areas and source status are from the supplied Alain Explore snapshot.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-left sm:min-w-64">
            <Metric label="Published units" value="60" />
            <Metric label="Source available" value={String(liveAvailable)} />
            <Metric label="Penthouse" value="2" />
            <Metric label="Developer price" value="Not published" />
          </div>
        </div>
        <p className="mt-4 text-[0.67rem] leading-5 text-slate-300">
          Snapshot: {sourceUpdatedLabel()} · The source did not publish a public AED price for any Four Seasons unit. A NAS asking price appears only when added separately to the card.
        </p>
      </div>

      <div className="border-b border-border bg-background p-4 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Unit, floor or residence type…" className="pl-9" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <SlidersHorizontal className="mr-1 h-4 w-4 text-muted-foreground" />
            {(["all", "2", "3", "4", "5"] as const).map((value) => (
              <Button key={value} size="sm" variant={bedrooms === value ? "default" : "outline"} onClick={() => setBedrooms(value)}>
                {value === "all" ? "All beds" : `${value} BR`}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SOURCE_FILTERS.map((value) => (
              <Button key={value} size="sm" variant={sourceStatus === value ? "default" : "outline"} onClick={() => setSourceStatus(value)}>
                {value === "all" ? "All states" : value}
              </Button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{rows.length} residences shown · Tower 1</p>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((unit) => {
          const listing = listingIndex.get(unit.unitKey);
          const price = currentPrice(unit, listing);
          return (
            <article key={unit.unitKey} className={`bg-card p-5 ${listingIsAvailable(listing) ? "shadow-[inset_3px_0_0_0] shadow-emerald-500" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">Tower {unit.tower} · Floor {unit.floor ?? "—"}</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">Residence {unit.unitNumber}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{unit.displayType}</p>
                </div>
                <FourSeasonsSourceStatusBadge status={unit.sourceStatus} compact />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-border bg-muted/25 p-3 text-sm">
                <Fact label="Saleable" value={area(unit, "saleable", areaUnit)} />
                <Fact label="Internal" value={area(unit, "internal", areaUnit)} />
                <Fact label="Balcony" value={area(unit, "balcony", areaUnit)} />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground">Price</p>
                  {price ? <ListingPriceLabel askingPriceAed={price} /> : <p className="mt-1 text-sm font-medium text-muted-foreground">Not published</p>}
                </div>
                {listingIsAvailable(listing) ? <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">NAS Available</span> : null}
              </div>
              <ListingPropertyFacts listing={listing} />
              <ListingOwnerFacts listing={listing} />
              <OneDriveCardLinks villaKey={unit.unitKey} />
              <div className="mt-4 flex justify-end border-t border-border pt-3">
                <EditListingButton
                  villaKey={unit.unitKey}
                  community="four-seasons"
                  buildingKey="tower-1"
                  unitTypeKey={unit.sourceType ?? undefined}
                  bedrooms={unit.bedrooms}
                  villaLabel={`Four Seasons · Tower ${unit.tower} · Residence ${unit.unitNumber}`}
                />
              </div>
            </article>
          );
        })}
      </div>
      {rows.length === 0 ? <div className="p-10 text-center text-sm text-muted-foreground">No Tower 1 residence matches these filters.</div> : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-white/15 bg-white/10 px-3 py-2"><p className="text-[0.55rem] uppercase tracking-[0.12em] text-slate-300">{label}</p><p className="mt-1 text-sm font-semibold text-white">{value}</p></div>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[0.58rem] uppercase tracking-[0.1em] text-muted-foreground">{label}</p><p className="mt-1 font-semibold text-foreground">{value}</p></div>;
}

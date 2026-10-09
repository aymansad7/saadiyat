import { useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { AlertTriangle, BadgeCheck, ExternalLink, FileText, Map, Search, Video } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import SiteHeader from "@/components/SiteHeader";
import AreaFilterControls, { type AreaViewMode } from "@/components/AreaFilterControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditListingButton, ListingOwnerFacts, ListingPropertyFacts, ListingPriceLabel, OneDriveCardLinks } from "@/components/ListingControls";
import { FourSeasonsProjectDetails } from "@/components/FourSeasonsProjectDetails";
import { FourSeasonsApartments } from "@/components/FourSeasonsApartments";
import { FourSeasonsSourceStatusBadge } from "@/components/FourSeasonsSourceStatusBadge";
import { useListingIndex, type ListingIndexEntry } from "@/hooks/useListingIndex";
import {
  FOUR_SEASONS_MASTERPLAN_IMAGE,
  FOUR_SEASONS_VILLAS,
  type FourSeasonsVilla,
} from "@/data/fourSeasons";
import {
  FOUR_SEASONS_ALAIN_SNAPSHOT,
  FOUR_SEASONS_ALAIN_VILLA_BY_NUMBER,
  type FourSeasonsAlainUnit,
} from "@/data/fourSeasonsAlainExplore";
import { FOUR_SEASONS_PROJECT_DOCUMENT_LINKS } from "@/data/fourSeasonsProjectDetails";
import {
  FOUR_SEASONS_PENDING_SUMMARY,
} from "@/data/fourSeasonsPendingTransactions";
import { FOUR_SEASONS_FLOORPLAN_BY_VILLA } from "@/data/fourSeasonsFloorplans";
import {
  FOUR_SEASONS_TRANSACTION_SUMMARY,
  FOUR_SEASONS_UNMATCHED_TRANSACTIONS,
  getFourSeasonsTransactions,
  type FourSeasonsTransactionMatch,
} from "@/data/fourSeasonsTransactions";
import { formatArea, isWithinAreaRange, matchesAreaQuery, type AreaUnit } from "@/lib/areaSearch";
import { getProjectViewMode } from "@/lib/viewMode";
import { trpc } from "@/lib/trpc";

const AED = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });

function formatPrice(value: number | null) {
  return value ? `AED ${AED.format(value)}` : "—";
}

function isAvailableNow(villa: FourSeasonsVilla, source?: FourSeasonsAlainUnit, listing?: ListingIndexEntry | null) {
  return listing?.status && listing.status !== "draft"
    ? listing.status === "available"
    : source
      ? source.sourceStatus === "Available"
      : villa.status === "available";
}

function currentAskingPrice(villa: FourSeasonsVilla, listing?: ListingIndexEntry | null) {
  return listing?.askingPriceAed ?? villa.askingPriceAed;
}

function scrollToVilla(villaNumber: number) {
  document.getElementById(`villa-${villaNumber}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function getConfirmedTransaction(villaNumber: number) {
  return getFourSeasonsTransactions(villaNumber).find((transaction) => transaction.confidence === "confirmed");
}

function getVillaLandArea(villa: FourSeasonsVilla) {
  const floorplan = FOUR_SEASONS_FLOORPLAN_BY_VILLA.get(villa.villaNumber);
  const confirmed = getConfirmedTransaction(villa.villaNumber);
  return {
    sqm: villa.plotAreaSqm ?? floorplan?.plotAreaSqmPrinted ?? confirmed?.landAreaSqm ?? null,
    sqft: villa.plotAreaSqft ?? floorplan?.plotAreaSqft ?? (confirmed ? confirmed.landAreaSqm * 10.764 : null),
  };
}

function getVillaTotalArea(villa: FourSeasonsVilla, source?: FourSeasonsAlainUnit) {
  const floorplan = FOUR_SEASONS_FLOORPLAN_BY_VILLA.get(villa.villaNumber);
  const confirmed = getConfirmedTransaction(villa.villaNumber);
  return {
    sqm: source?.saleableAreaSqm ?? floorplan?.sellableAreaSqmPrinted ?? villa.builtUpAreaSqm ?? confirmed?.builtUpAreaSqm ?? null,
    sqft: source?.saleableAreaSqft ?? floorplan?.sellableAreaSqft ?? villa.builtUpAreaSqft ?? (confirmed ? confirmed.builtUpAreaSqm * 10.764 : null),
  };
}

export default function FourSeasons() {
  const searchString = useSearch();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "available">("all");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqm");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [viewMode, setViewMode] = useState<AreaViewMode>(() => getProjectViewMode(searchString));
  const [selectedVilla, setSelectedVilla] = useState<FourSeasonsVilla | null>(null);
  const { user } = useAuth();
  const canViewCategoryMedia = user?.role === "master";
  const { index: listingIndex } = useListingIndex({ community: "four-seasons" });
  const sourceVillaByNumber = FOUR_SEASONS_ALAIN_VILLA_BY_NUMBER;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return FOUR_SEASONS_VILLAS.filter((villa) => {
      const landArea = getVillaLandArea(villa);
      const source = sourceVillaByNumber.get(villa.villaNumber);
      const totalArea = getVillaTotalArea(villa, source);
      if (status === "available" && !isAvailableNow(villa, source, listingIndex.get(villa.villaKey))) return false;
      if (!isWithinAreaRange(landArea, areaUnit, areaMin, areaMax)) return false;
      if (!normalized) return true;
      return [villa.label, villa.villaType, villa.view ?? "", `${villa.bedrooms} br`, source?.unitCode ?? "", source?.displayType ?? "", villa.sdn3PlotNumber ? `sdn3 plot ${villa.sdn3PlotNumber}` : ""]
        .some((value) => value.toLowerCase().includes(normalized))
        || matchesAreaQuery(normalized, landArea)
        || matchesAreaQuery(normalized, totalArea);
    });
  }, [query, status, areaUnit, areaMin, areaMax, listingIndex, sourceVillaByNumber]);

  const availableCount = FOUR_SEASONS_VILLAS.filter(villa => isAvailableNow(villa, sourceVillaByNumber.get(villa.villaNumber), listingIndex.get(villa.villaKey))).length;
  const visibleNumbers = new Set(filtered.map(villa => villa.villaNumber));

  const selectFromPlan = (villa: FourSeasonsVilla) => {
    setSelectedVilla(villa);
    window.setTimeout(() => scrollToVilla(villa.villaNumber), 30);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader
        subTitle="Four Seasons Private Residences"
        back={{ href: "/", label: "Home" }}
      />

      <main className="container py-8 space-y-8">
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-primary">Saadiyat Island</p>
              <h1 className="mt-2 font-display text-3xl sm:text-5xl font-semibold">Four Seasons Private Residences</h1>
              <p className="mt-3 max-w-3xl text-sm sm:text-base text-muted-foreground">
                56 master-plan villas and 60 Tower 1 residences. Live developer-source status is shown separately from NAS owner/resale listings and municipal transaction history.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="gap-2">
                <a href={FOUR_SEASONS_PROJECT_DOCUMENT_LINKS.numberedMasterPlanUrl} target="_blank" rel="noreferrer">
                  <FileText className="h-4 w-4" /> Open Master Plan
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <a href={FOUR_SEASONS_PROJECT_DOCUMENT_LINKS.factSheetUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" /> Official Fact Sheet
                </a>
              </Button>
              <Button asChild className="gap-2">
                <Link href="/map?plot=four-seasons%2Fvilla-11">
                  <Map className="h-4 w-4" /> View on Map
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            <Stat label="Master plan villas" value="56" />
            <Stat label="Tower 1 residences" value="60" />
            <Stat label="Source available" value={String(FOUR_SEASONS_ALAIN_SNAPSHOT.villaStatusCounts.Available)} accent />
            <Stat label="Confirmed sales" value={String(FOUR_SEASONS_TRANSACTION_SUMMARY.confirmed)} />
            <Stat label="Possible matches" value={String(FOUR_SEASONS_TRANSACTION_SUMMARY.possible)} />
            <Stat label="Source sold" value={String(FOUR_SEASONS_ALAIN_SNAPSHOT.statusCounts.Sold)} />
          </div>
        </section>

        <FourSeasonsProjectDetails />

        <section className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold">Clickable Master Plan</h2>
              <p className="text-xs text-muted-foreground mt-1">Green means current source Available or a NAS Available listing. Purple marks a confirmed municipal sale; amber marks a possible area match. Source state, NAS listing and sale history remain separate.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-emerald-500" /> Available</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-violet-600" /> Confirmed sale</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-amber-500" /> Possible</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-slate-700" /> Reference</span>
            </div>
          </div>
          <div className="relative bg-slate-100 overflow-auto">
            <div className="relative min-w-[760px]">
              <img src={FOUR_SEASONS_MASTERPLAN_IMAGE} alt="Four Seasons Private Residences official master plan" className="w-full h-auto block" />
              {FOUR_SEASONS_VILLAS.map((villa) => {
                const transactions = getFourSeasonsTransactions(villa.villaNumber);
                const hasConfirmed = transactions.some((transaction) => transaction.confidence === "confirmed");
                const hasPossible = transactions.some((transaction) => transaction.confidence === "possible");
                const listing = listingIndex.get(villa.villaKey);
                const source = sourceVillaByNumber.get(villa.villaNumber);
                const available = isAvailableNow(villa, source, listing);
                const markerClass = available
                  ? "bg-emerald-500 text-white"
                  : hasConfirmed
                  ? "bg-violet-600 text-white"
                  : hasPossible
                  ? "bg-amber-500 text-white"
                  : "bg-slate-700/85 text-white";
                return (
                  <button
                    key={villa.villaKey}
                    type="button"
                    title={`${villa.label}${available ? ` — ${formatPrice(currentAskingPrice(villa, listing))}` : hasConfirmed ? " — confirmed municipal sale" : hasPossible ? " — possible municipal match" : ""}`}
                    aria-label={`Open ${villa.label}`}
                    onClick={() => selectFromPlan(villa)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 h-6 min-w-6 px-1 rounded-full border-2 border-white shadow-md text-[9px] font-bold transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary ${markerClass} ${visibleNumbers.has(villa.villaNumber) ? "opacity-100" : "opacity-20"}`}
                    style={{ left: `${villa.xPercent}%`, top: `${villa.yPercent}%` }}
                  >
                    {villa.villaNumber}
                  </button>
                );
              })}
            </div>
          </div>
          {selectedVilla && (
            <div className="border-t border-border p-4 sm:p-5 bg-emerald-50/60 dark:bg-emerald-950/20">
              <VillaSummary villa={selectedVilla} source={sourceVillaByNumber.get(selectedVilla.villaNumber)} listing={listingIndex.get(selectedVilla.villaKey)} areaUnit={areaUnit} canViewCategoryMedia={canViewCategoryMedia} />
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Villa number, type, view or area..."
                className="pl-9"
              />
            </div>
            <div className="inline-flex rounded-md border border-border p-0.5 self-start">
              <Button size="sm" variant={status === "all" ? "default" : "ghost"} onClick={() => setStatus("all")}>All 56</Button>
              <Button size="sm" variant={status === "available" ? "default" : "ghost"} onClick={() => setStatus("available")}>Available {availableCount}</Button>
            </div>
            <AreaFilterControls
              unit={areaUnit}
              onUnitChange={setAreaUnit}
              min={areaMin}
              max={areaMax}
              onMinChange={setAreaMin}
              onMaxChange={setAreaMax}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              compact
            />
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} villas shown</p>
        </section>

        {viewMode === "cards" ? (
          <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((villa) => (
              <article id={`villa-${villa.villaNumber}`} key={villa.villaKey} className={`rounded-xl border bg-card p-5 scroll-mt-28 ${isAvailableNow(villa, sourceVillaByNumber.get(villa.villaNumber), listingIndex.get(villa.villaKey)) ? "border-emerald-500/60 shadow-emerald-100 shadow-sm" : "border-border"}`}>
                <VillaSummary villa={villa} source={sourceVillaByNumber.get(villa.villaNumber)} listing={listingIndex.get(villa.villaKey)} areaUnit={areaUnit} canViewCategoryMedia={canViewCategoryMedia} />
                <div className="mt-4 border-t border-border pt-3 flex justify-end">
                  <EditListingButton villaKey={villa.villaKey} community="four-seasons" villaLabel={`Four Seasons · Villa ${villa.villaNumber}`} />
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-xl border border-border bg-card overflow-auto">
            <table className="w-full text-sm min-w-[980px]">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Villa</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Type / View</th>
                  <th className="text-right px-4 py-3">Land</th>
                  <th className="text-right px-4 py-3">BUA</th>
                  <th className="text-right px-4 py-3">Recorded sale</th>
                  <th className="text-right px-4 py-3">Price</th>
                  <th className="text-right px-4 py-3">Links</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((villa) => {
                  const floorplan = FOUR_SEASONS_FLOORPLAN_BY_VILLA.get(villa.villaNumber);
                  const transactions = getFourSeasonsTransactions(villa.villaNumber);
                  const latest = transactions[transactions.length - 1];
                  const landArea = getVillaLandArea(villa);
                  const source = sourceVillaByNumber.get(villa.villaNumber);
                  const totalArea = getVillaTotalArea(villa, source);
                  return (
                  <tr id={`villa-${villa.villaNumber}`} key={villa.villaKey} className="border-t border-border scroll-mt-28">
                    <td className="px-4 py-3 font-semibold">Villa {villa.villaNumber}<div className="text-xs font-normal text-muted-foreground">{villa.bedrooms} BR{villa.sdn3PlotNumber ? ` · SDN3 Plot ${villa.sdn3PlotNumber}` : ""}</div></td>
                    <td className="px-4 py-3 space-y-1"><StatusBadge available={isAvailableNow(villa, source, listingIndex.get(villa.villaKey))} /><FourSeasonsSourceStatusBadge status={source?.sourceStatus} compact /></td>
                    <td className="px-4 py-3">{villa.villaType}<div className="text-xs text-muted-foreground">{villa.view ?? "—"}</div></td>
                    <td className="px-4 py-3 text-right font-mono">{formatArea(landArea, areaUnit)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatArea(totalArea, areaUnit)}</td>
                    <td className="px-4 py-3 text-right">{latest ? <><div className="font-semibold">{formatPrice(latest.priceAed)}</div><div className={`text-[0.65rem] ${latest.confidence === "confirmed" ? "text-violet-700" : "text-amber-700"}`}>{latest.date} · {latest.confidence}</div></> : "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatPrice(currentAskingPrice(villa, listingIndex.get(villa.villaKey)))}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap"><Link className="text-primary hover:underline" href={`/map?plot=${encodeURIComponent(villa.villaKey)}`}>Map</Link>{floorplan && <a className="ml-3 text-primary hover:underline" href={floorplan.pdfUrl} target="_blank" rel="noreferrer">Floorplan</a>}<span className="inline-flex ml-3 align-middle"><EditListingButton villaKey={villa.villaKey} community="four-seasons" villaLabel={`Four Seasons · Villa ${villa.villaNumber}`} /></span></td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        <FourSeasonsApartments listingIndex={listingIndex} areaUnit={areaUnit} />

        <details className="rounded-xl border border-amber-300/60 bg-amber-50/60 dark:bg-amber-950/20 p-4">
          <summary className="cursor-pointer font-semibold">Municipal transactions still unmatched ({FOUR_SEASONS_TRANSACTION_SUMMARY.unmatched} of {FOUR_SEASONS_PENDING_SUMMARY.recordCount})</summary>
          <p className="mt-2 text-xs text-muted-foreground max-w-3xl">
            These records are preserved from ADREC but are not assigned to a villa until official land areas are received and matched.
          </p>
          <div className="mt-4 overflow-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead><tr className="text-xs text-muted-foreground border-b"><th className="text-left py-2">Date</th><th className="text-left">Type</th><th className="text-right">Land m²</th><th className="text-right">BUA m²</th><th className="text-right">Price</th></tr></thead>
              <tbody>
                {FOUR_SEASONS_UNMATCHED_TRANSACTIONS.map((tx) => (
                  <tr key={tx.sourceRow} className="border-b border-amber-200/60"><td className="py-2 font-mono">{tx.date}</td><td>{tx.saleSequence}</td><td className="text-right font-mono">{tx.landAreaSqm.toLocaleString()}</td><td className="text-right font-mono">{tx.builtUpAreaSqm.toLocaleString()}</td><td className="text-right font-semibold">{formatPrice(tx.priceAed)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </main>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className={`rounded-lg border p-3 ${accent ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" : "border-border bg-background"}`}><div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-1 text-lg font-semibold">{value}</div></div>;
}

function StatusBadge({ available }: { available: boolean }) {
  return available
    ? <span className="inline-flex rounded-full bg-emerald-100 text-emerald-800 px-2 py-1 text-[0.68rem] font-bold uppercase">Available</span>
    : <span className="inline-flex rounded-full bg-slate-100 text-slate-600 px-2 py-1 text-[0.68rem] font-semibold">Reference only</span>;
}

function VillaSummary({ villa, source, listing, areaUnit, canViewCategoryMedia }: { villa: FourSeasonsVilla; source?: FourSeasonsAlainUnit; listing?: ListingIndexEntry | null; areaUnit: AreaUnit; canViewCategoryMedia: boolean }) {
  const floorplan = FOUR_SEASONS_FLOORPLAN_BY_VILLA.get(villa.villaNumber);
  const transactions = getFourSeasonsTransactions(villa.villaNumber);
  const confirmed = getConfirmedTransaction(villa.villaNumber);
  const landArea = getVillaLandArea(villa);
  const totalArea = getVillaTotalArea(villa, source);
  const available = isAvailableNow(villa, source, listing);
  const askingPrice = currentAskingPrice(villa, listing);
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div><p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">{source?.displayType ?? villa.villaType}</p><h3 className="font-display text-2xl font-semibold">Villa {villa.villaNumber}</h3>{source ? <p className="mt-0.5 font-mono text-[0.58rem] text-muted-foreground">{source.unitCode}</p> : null}</div>
        <div className="flex flex-col items-end gap-1"><StatusBadge available={available} /><FourSeasonsSourceStatusBadge status={source?.sourceStatus} compact /></div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-xs text-muted-foreground">{confirmed && !villa.plotAreaSqm && !floorplan ? "ADREC land" : "Land"}</span><div className="font-semibold">{formatArea(landArea, areaUnit)}</div></div>
        <div><span className="text-xs text-muted-foreground">{floorplan ? "Sellable" : confirmed && !villa.builtUpAreaSqm ? "ADREC BUA" : "Total area"}</span><div className="font-semibold">{formatArea(totalArea, areaUnit)}</div></div>
        <div><span className="text-xs text-muted-foreground">Bedrooms</span><div className="font-semibold">{villa.bedrooms} BR</div></div>
        <div><span className="text-xs text-muted-foreground">View</span><div className="font-semibold">{villa.view ?? "—"}</div></div>
      </div>
      {source ? (
        <div className="mt-4 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">Alain Explore source · 9 Oct 2026</p>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div><span className="text-xs text-muted-foreground">Type</span><div className="font-semibold">{source.displayType}</div></div>
            <div><span className="text-xs text-muted-foreground">Saleable</span><div className="font-semibold">{formatArea({ sqm: source.saleableAreaSqm, sqft: source.saleableAreaSqft }, areaUnit)}</div></div>
            <div><span className="text-xs text-muted-foreground">Internal</span><div className="font-semibold">{formatArea({ sqm: source.internalAreaSqm, sqft: source.internalAreaSqft }, areaUnit)}</div></div>
            <div><span className="text-xs text-muted-foreground">Balcony</span><div className="font-semibold">{formatArea({ sqm: source.balconyAreaSqm, sqft: source.balconyAreaSqft }, areaUnit)}</div></div>
          </div>
          <p className="mt-2 text-[0.65rem] text-muted-foreground">Developer public price: {source.priceAed ? formatPrice(source.priceAed) : "not published in this source response"}.</p>
        </div>
      ) : null}
      {listing?.askingPriceAed ? <div className="mt-3"><ListingPriceLabel askingPriceAed={listing.askingPriceAed} /></div> : null}
      <ListingPropertyFacts listing={listing} />
      {listing?.publicNotes ? (
        <p className="mt-2 rounded-sm border border-sky-500/20 bg-sky-500/5 px-2.5 py-2 text-[0.65rem] text-muted-foreground">
          <span className="mr-1 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">Listing reference</span>
          {listing.publicNotes}
        </p>
      ) : null}
      <ListingOwnerFacts listing={listing} />
      {available && <div className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3"><p className="text-xs text-emerald-700 dark:text-emerald-300">Available · {listing?.publicNotes?.includes("1 Oct 2026") ? "owner-supplied proposal dated 1 Oct 2026" : "offer updated 8 Sep 2026"}</p><p className="text-xl font-semibold mt-0.5">{formatPrice(askingPrice)}</p></div>}
      {transactions.length > 0 && <FourSeasonsTransactionTimeline transactions={transactions} areaUnit={areaUnit} />}
      {floorplan && !available && <p className="mt-3 text-[0.68rem] text-muted-foreground">Plot and Sellable Area from the developer Floorplan. No current availability implied.</p>}
      {!floorplan && villa.historicalSpecSource && !available && <p className="mt-3 text-[0.68rem] text-muted-foreground">Areas from historical specification reference only. No current availability implied.</p>}
      <p className="mt-3 text-[0.68rem] text-muted-foreground">
        {villa.positionSource === "user_supplied_sdn3_coordinate"
          ? `Official SDN3 Plot ${villa.sdn3PlotNumber} coordinate supplied and mapped to Villa ${villa.villaNumber}.`
          : "Map position recalibrated from the official master plan to 9 SDN3 controls; not an individual DCR coordinate."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline"><Link href={`/map?plot=${encodeURIComponent(villa.villaKey)}`}><Map className="h-3.5 w-3.5 mr-1.5" />Map</Link></Button>
        {floorplan && <Button asChild size="sm" variant="outline"><a href={floorplan.pdfUrl} target="_blank" rel="noreferrer"><FileText className="h-3.5 w-3.5 mr-1.5" />Floorplan</a></Button>}
        <Button asChild size="sm" variant="ghost"><a href={`https://www.google.com/maps?q=${villa.latitude},${villa.longitude}`} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1.5" />Google Maps</a></Button>
      </div>
      <OneDriveCardLinks villaKey={villa.villaKey} />
      <FourSeasonsCategoryVideo bedrooms={villa.bedrooms} enabled={canViewCategoryMedia} />
    </div>
  );
}

function FourSeasonsCategoryVideo({ bedrooms, enabled }: { bedrooms: number; enabled: boolean }) {
  const category = bedrooms === 5 ? "5br" : bedrooms === 6 ? "6br" : bedrooms === 7 ? "7br" : null;
  const media = trpc.oneDrive.fourSeasonsCategoryMedia.useQuery(
    { category: category ?? "5br" },
    { enabled: enabled && category !== null, staleTime: 60_000 },
  );
  const rows = media.data ?? [];
  if (!enabled || category === null || rows.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {rows.map(video => (
        <a
          key={video.id}
          href={video.shareUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-sm border border-violet-500/30 bg-violet-500/5 px-2.5 py-1.5 text-xs font-medium text-violet-800 hover:bg-violet-500/10 dark:text-violet-200"
        >
          <Video className="h-3.5 w-3.5" /> View {bedrooms}BR video
        </a>
      ))}
    </div>
  );
}

function FourSeasonsTransactionTimeline({ transactions, areaUnit }: { transactions: readonly FourSeasonsTransactionMatch[]; areaUnit: AreaUnit }) {
  return (
    <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50/60 dark:border-violet-900 dark:bg-violet-950/20 overflow-hidden">
      <div className="px-3 py-2 border-b border-violet-200/70 dark:border-violet-900 text-[0.65rem] font-mono uppercase tracking-wider text-violet-800 dark:text-violet-300">Municipal transaction history</div>
      <div className="divide-y divide-violet-200/70 dark:divide-violet-900">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground">{transaction.date}</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.62rem] font-bold uppercase ${transaction.confidence === "confirmed" ? "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200" : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"}`}>
                {transaction.confidence === "confirmed" ? <BadgeCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {transaction.confidence}
              </span>
            </div>
            <div className="mt-1 text-xl font-semibold">{formatPrice(transaction.priceAed)}</div>
            <div className="mt-1 text-xs text-muted-foreground">Primary · Land {formatArea({ sqm: transaction.landAreaSqm }, areaUnit)} · BUA {formatArea({ sqm: transaction.builtUpAreaSqm }, areaUnit)}</div>
            {transaction.landDifferenceSqm != null && <div className="mt-1 text-[0.65rem] text-muted-foreground">Land match Δ {transaction.landDifferenceSqm.toFixed(2)} m²</div>}
            {transaction.confidence === "possible" && <p className="mt-1 text-[0.68rem] text-amber-800 dark:text-amber-300">Possible match only — awaiting user confirmation.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

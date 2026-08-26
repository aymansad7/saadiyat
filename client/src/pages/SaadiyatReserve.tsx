import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { ExternalLink, FileText, Home, Map, Search } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import AreaFilterControls, { type AreaViewMode } from "@/components/AreaFilterControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditListingButton, ListingOwnerFacts, ListingPropertyFacts, ListingPriceLabel } from "@/components/ListingControls";
import { useListingIndex, type ListingIndexEntry } from "@/hooks/useListingIndex";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  SAADIYAT_RESERVE_DUNES_VILLAS,
  SAADIYAT_RESERVE_LAND_PLOTS,
  SAADIYAT_RESERVE_MASTERPLAN_IMAGE_URL,
  SAADIYAT_RESERVE_MASTERPLAN_PDF_URL,
  SAADIYAT_RESERVE_RECORDS,
  SAADIYAT_RESERVE_WORLD_ALDAR_URL,
  type SaadiyatReservePhase,
  type SaadiyatReserveRecord,
} from "@/data/saadiyatReserve";
import { formatArea, isWithinAreaRange, matchesAreaQuery, type AreaUnit } from "@/lib/areaSearch";
import { getProjectViewMode } from "@/lib/viewMode";

type PhaseFilter = "all" | SaadiyatReservePhase;
type InventoryFilter = "all" | "available" | "land" | "built" | "dunes";

const PHASE_STYLES: Record<SaadiyatReservePhase, string> = {
  1: "bg-sky-600 text-white",
  2: "bg-fuchsia-700 text-white",
  3: "bg-amber-700 text-white",
};

const AED = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });

function formatPrice(value: number | null) {
  return value ? `AED ${AED.format(value)}` : "—";
}

function inventoryLabel(record: SaadiyatReserveRecord) {
  if (record.inventoryKind === "dunes_built_villa") return "Built Dunes villa";
  if (record.inventoryKind === "reserve_built_villa") return "Built Reserve villa";
  return "Land plot";
}

function availabilityLabel(record: SaadiyatReserveRecord) {
  if (record.availability === "available_for_sale") return "Available for sale";
  if (record.availability === "sold") return "Sold in source inventory";
  return "Not listed in current Excel";
}

function markerStyle(record: SaadiyatReserveRecord) {
  return record.availability === "available_for_sale"
    ? "bg-emerald-500 text-white"
    : PHASE_STYLES[record.phase];
}

function scrollToRecord(plotNumber: number) {
  document.getElementById(`reserve-record-${plotNumber}`)?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

function recordArea(record: SaadiyatReserveRecord) {
  return { sqm: record.plotAreaSqm, sqft: record.plotAreaSqft };
}

function recordBuiltArea(record: SaadiyatReserveRecord) {
  if (record.dunes) {
    return {
      sqm: record.dunes.totalAreaSqm,
      sqft: record.dunes.totalAreaSqm * 10.764,
    };
  }
  if (record.saleInventory?.builtUpAreaSqm) {
    return {
      sqm: record.saleInventory.builtUpAreaSqm,
      sqft: record.saleInventory.builtUpAreaSqm * 10.764,
    };
  }
  return { sqm: record.gfaSqm, sqft: record.gfaSqft };
}

export default function SaadiyatReserve() {
  const { user } = useAuth();
  const permissions = trpc.propertyAccess.permissions.useQuery(
    { projects: ["saadiyat-reserve"] },
    { enabled: Boolean(user) },
  );
  const canViewOriginalPrice =
    user?.role === "admin" ||
    user?.role === "master" ||
    permissions.data?.[0]?.permissions.canViewOriginalPrice === true;
  const searchString = useSearch();
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<PhaseFilter>("all");
  const [inventory, setInventory] = useState<InventoryFilter>("all");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqm");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [viewMode, setViewMode] = useState<AreaViewMode>(() => getProjectViewMode(searchString));
  const [selected, setSelected] = useState<SaadiyatReserveRecord | null>(null);
  const { index: listingIndex } = useListingIndex({ community: "saadiyat-reserve" });

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const plotNumber = Number(params.get("plot"));
    if (!Number.isInteger(plotNumber)) return;
    const record = SAADIYAT_RESERVE_RECORDS.find(item => item.plotNumber === plotNumber);
    if (!record) return;
    setSelected(record);
    setPhase(record.phase);
    window.setTimeout(() => scrollToRecord(record.plotNumber), 80);
  }, [searchString]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return SAADIYAT_RESERVE_RECORDS.filter(record => {
      if (phase !== "all" && record.phase !== phase) return false;
      if (inventory === "available" && record.availability !== "available_for_sale") return false;
      if (inventory === "land" && record.inventoryKind !== "reserve_land") return false;
      if (inventory === "built" && record.inventoryKind !== "reserve_built_villa") return false;
      if (inventory === "dunes" && record.inventoryKind !== "dunes_built_villa") return false;
      if (!isWithinAreaRange(recordArea(record), areaUnit, areaMin, areaMax)) return false;
      if (!normalized) return true;
      return [
        record.label,
        `plot ${record.plotNumber}`,
        `phase ${record.phase}`,
        record.dunes?.unitNumber ?? "",
        record.dunes?.villaType ?? "",
        record.dunes ? `${record.dunes.bedrooms} br` : record.saleInventory?.bedrooms ? `${record.saleInventory.bedrooms} br` : "land",
        record.saleInventory?.details ?? "",
        availabilityLabel(record),
      ].some(value => value.toLowerCase().includes(normalized))
        || matchesAreaQuery(normalized, recordArea(record))
        || matchesAreaQuery(normalized, recordBuiltArea(record));
    });
  }, [query, phase, inventory, areaUnit, areaMin, areaMax]);

  const visibleNumbers = new Set(filtered.map(record => record.plotNumber));
  const availableCount = SAADIYAT_RESERVE_RECORDS.filter(record => record.availability === "available_for_sale").length;

  const selectFromPlan = (record: SaadiyatReserveRecord) => {
    setSelected(record);
    window.setTimeout(() => scrollToRecord(record.plotNumber), 40);
  };

  const showOnPlan = (record: SaadiyatReserveRecord) => {
    setSelected(record);
    document.getElementById("reserve-masterplan")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader subTitle="Saadiyat Reserve" back={{ href: "/", label: "Home" }} />
      <main className="container py-8 space-y-8">
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-primary">Saadiyat Island · SDE3</p>
              <h1 className="mt-2 font-display text-3xl sm:text-5xl font-semibold">Saadiyat Reserve</h1>
              <p className="mt-3 max-w-3xl text-sm sm:text-base text-muted-foreground">
                One official master plan with 306 records. Phase 1 and Phase 2 contain 223 plots, including 3 built villas in the current Excel. Phase 3 was renamed Dunes and contains 83 built villas linked to their existing Aldar records.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="gap-2">
                <a href={SAADIYAT_RESERVE_MASTERPLAN_PDF_URL} target="_blank" rel="noreferrer">
                  <FileText className="h-4 w-4" /> Open Master Plan
                </a>
              </Button>
              <Button asChild className="gap-2">
                <Link href="/map?plot=saadiyat-reserve%2Fplot-21">
                  <Map className="h-4 w-4" /> View on Map
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            <Stat label="All records" value="306" />
            <Stat label="Phase 1 plots" value="116" accent="sky" />
            <Stat label="Phase 2 plots" value="107" accent="fuchsia" />
            <Stat label="Reserve land" value={String(SAADIYAT_RESERVE_LAND_PLOTS.length)} />
            <Stat label="Dunes villas" value={String(SAADIYAT_RESERVE_DUNES_VILLAS.length)} accent="amber" />
            <Stat label="Available now" value={String(availableCount)} accent="emerald" />
          </div>
        </section>

        <section id="reserve-masterplan" className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm scroll-mt-24">
          <div className="p-4 sm:p-5 border-b border-border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold">Clickable Official Master Plan</h2>
              <p className="text-xs text-muted-foreground mt-1">Green means Available for Sale in the 25 Aug 2026 Excel. Blue is Phase 1, purple is Phase 2, and amber is Phase 3 / Dunes when not currently listed.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <Legend colour="bg-sky-600" label="Phase 1" />
              <Legend colour="bg-fuchsia-700" label="Phase 2" />
              <Legend colour="bg-amber-700" label="Phase 3 / Dunes" />
              <Legend colour="bg-emerald-500" label="Available" />
            </div>
          </div>
          <div className="relative bg-slate-100 overflow-auto">
            <div className="relative min-w-[980px]">
              <img src={SAADIYAT_RESERVE_MASTERPLAN_IMAGE_URL} alt="Saadiyat Reserve official plots and GFA master plan" className="w-full h-auto block" />
              {SAADIYAT_RESERVE_RECORDS.map(record => (
                <button
                  key={record.villaKey}
                  type="button"
                  title={`${record.label} · Phase ${record.phase} · ${record.plotAreaSqm.toLocaleString()} m²`}
                  aria-label={`Open ${record.label}`}
                  onClick={() => selectFromPlan(record)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 h-4 min-w-4 px-0.5 rounded-full border border-white shadow text-[6px] font-bold transition-transform hover:scale-150 focus:outline-none focus:ring-2 focus:ring-primary ${markerStyle(record)} ${visibleNumbers.has(record.plotNumber) ? "opacity-100" : "opacity-10"}`}
                  style={{ left: `${record.hotspotXPercent}%`, top: `${record.hotspotYPercent}%` }}
                >
                  {record.plotNumber}
                </button>
              ))}
            </div>
          </div>
          {selected && (
            <div className="border-t border-border p-4 sm:p-5 bg-muted/30">
              <RecordSummary record={selected} areaUnit={areaUnit} canViewOriginalPrice={canViewOriginalPrice} />
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <div className="relative flex-1 min-w-[230px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Plot, villa, phase, bedrooms or area..." className="pl-9" />
            </div>
            <div className="inline-flex flex-wrap rounded-md border border-border p-0.5 self-start">
              {(["all", 1, 2, 3] as PhaseFilter[]).map(value => (
                <Button key={value} size="sm" variant={phase === value ? "default" : "ghost"} onClick={() => setPhase(value)}>
                  {value === "all" ? "All" : `Phase ${value}`}
                </Button>
              ))}
            </div>
            <div className="inline-flex flex-wrap rounded-md border border-border p-0.5 self-start">
              {(["all", "available", "land", "built", "dunes"] as InventoryFilter[]).map(value => (
                <Button key={value} size="sm" variant={inventory === value ? "secondary" : "ghost"} onClick={() => setInventory(value)}>
                  {value === "all" ? "All inventory" : value === "available" ? `Available ${availableCount}` : value === "land" ? "Land" : value === "built" ? "Reserve villas" : "Dunes villas"}
                </Button>
              ))}
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
          <p className="text-xs text-muted-foreground">{filtered.length} records shown. Green is limited to the {availableCount} rows explicitly available in the current Excel.</p>
        </section>

        {viewMode === "cards" ? (
          <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(record => (
              <article id={`reserve-record-${record.plotNumber}`} key={record.villaKey} className={`rounded-xl border bg-card p-5 scroll-mt-28 ${record.availability === "available_for_sale" ? "border-emerald-500/60 shadow-sm shadow-emerald-100" : "border-border"}`}>
                <RecordSummary record={record} listing={listingIndex.get(record.villaKey)} areaUnit={areaUnit} canViewOriginalPrice={canViewOriginalPrice} onShowPlan={() => showOnPlan(record)} />
                <div className="mt-4 border-t border-border pt-3 flex justify-end">
                  <EditListingButton villaKey={record.villaKey} community="saadiyat-reserve" villaLabel={record.label} />
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-xl border border-border bg-card overflow-auto">
            <table className="w-full text-sm min-w-[1250px]">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Plot / Villa</th>
                  <th className="text-left px-4 py-3">Phase</th>
                  <th className="text-left px-4 py-3">Inventory</th>
                  <th className="text-left px-4 py-3">Availability</th>
                  <th className="text-left px-4 py-3">Bedrooms</th>
                  <th className="text-right px-4 py-3">Plot area</th>
                  <th className="text-right px-4 py-3">GFA / Total</th>
                  <th className="text-right px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Position</th>
                  <th className="text-right px-4 py-3">Links</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(record => (
                  <tr id={`reserve-record-${record.plotNumber}`} key={record.villaKey} className="border-t border-border scroll-mt-28">
                    <td className="px-4 py-3 font-semibold">{record.label}<div className="text-xs font-normal text-muted-foreground">Master plan Plot {record.plotNumber}</div></td>
                    <td className="px-4 py-3"><PhaseBadge phase={record.phase} /></td>
                    <td className="px-4 py-3">{inventoryLabel(record)}</td>
                    <td className="px-4 py-3"><AvailabilityBadge record={record} /></td>
                    <td className="px-4 py-3">{record.dunes ? `${record.dunes.bedrooms} BR` : record.saleInventory?.bedrooms ? `${record.saleInventory.bedrooms} BR` : "—"}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatArea(recordArea(record), areaUnit)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatArea(recordBuiltArea(record), areaUnit)}</td>
                    <td className="px-4 py-3 text-right"><div className="font-semibold">{record.askingPriceAed ? formatPrice(record.askingPriceAed) : canViewOriginalPrice && record.originalPriceAed ? formatPrice(record.originalPriceAed) : "—"}</div><div className="text-[0.65rem] text-muted-foreground">{record.askingPriceAed ? "Available" : canViewOriginalPrice && record.originalPriceAed ? "Original" : ""}</div></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{record.positionSource === "user_supplied_sde3_coordinate" ? "Official SDE3 control" : "Master-plan calibrated"}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link className="text-primary hover:underline" href={`/map?plot=${encodeURIComponent(record.villaKey)}`}>Map</Link>
                      <button type="button" className="ml-3 text-primary hover:underline" onClick={() => showOnPlan(record)}>Plan</button>
                      {record.dunes && <Link className="ml-3 text-primary hover:underline" href={record.dunes.existingDetailsPath}>Details</Link>}
                      <span className="inline-flex ml-3 align-middle"><EditListingButton villaKey={record.villaKey} community="saadiyat-reserve" villaLabel={record.label} /></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "sky" | "fuchsia" | "amber" | "emerald" }) {
  const colour = accent === "sky" ? "border-sky-300 bg-sky-50 dark:bg-sky-950/30" : accent === "fuchsia" ? "border-fuchsia-300 bg-fuchsia-50 dark:bg-fuchsia-950/30" : accent === "amber" ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30" : accent === "emerald" ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30" : "border-border bg-background";
  return <div className={`rounded-lg border p-3 ${colour}`}><div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-1 text-lg font-semibold">{value}</div></div>;
}

function Legend({ colour, label }: { colour: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><i className={`h-3 w-3 rounded-full ${colour}`} />{label}</span>;
}

function PhaseBadge({ phase }: { phase: SaadiyatReservePhase }) {
  return <span className={`inline-flex rounded-full px-2 py-1 text-[0.68rem] font-bold uppercase ${PHASE_STYLES[phase]}`}>Phase {phase}</span>;
}

function AvailabilityBadge({ record }: { record: SaadiyatReserveRecord }) {
  if (record.availability === "available_for_sale") {
    return <span className="inline-flex rounded-full bg-emerald-100 text-emerald-800 px-2 py-1 text-[0.68rem] font-bold uppercase">Available</span>;
  }
  if (record.availability === "sold") {
    return <span className="inline-flex rounded-full bg-slate-200 text-slate-700 px-2 py-1 text-[0.68rem] font-semibold uppercase">Sold</span>;
  }
  return <span className="text-xs text-muted-foreground">Not listed</span>;
}

function RecordSummary({ record, listing, areaUnit, canViewOriginalPrice, onShowPlan }: { record: SaadiyatReserveRecord; listing?: ListingIndexEntry | null; areaUnit: AreaUnit; canViewOriginalPrice: boolean; onShowPlan?: () => void }) {
  const landArea = recordArea(record);
  const builtArea = recordBuiltArea(record);
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">{record.inventoryKind === "reserve_land" ? "Saadiyat Reserve land" : record.inventoryKind === "reserve_built_villa" ? "Saadiyat Reserve built villa" : "Saadiyat Reserve · Dunes"}</p>
          <h3 className="font-display text-2xl font-semibold">{record.label}</h3>
        </div>
        <div className="flex flex-col items-end gap-2"><PhaseBadge phase={record.phase} /><AvailabilityBadge record={record} /></div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-xs text-muted-foreground">Plot area</span><div className="font-semibold">{formatArea(landArea, areaUnit)}</div></div>
        <div><span className="text-xs text-muted-foreground">{record.dunes ? "Villa total area" : "Permitted GFA"}</span><div className="font-semibold">{formatArea(builtArea, areaUnit)}</div></div>
        <div><span className="text-xs text-muted-foreground">Inventory</span><div className="font-semibold">{inventoryLabel(record)}</div></div>
        <div><span className="text-xs text-muted-foreground">Current availability</span><div className="font-semibold">{availabilityLabel(record)}</div></div>
      </div>
      {listing?.askingPriceAed ? <div className="mt-3"><ListingPriceLabel askingPriceAed={listing.askingPriceAed} /></div> : null}
      <ListingPropertyFacts listing={listing} />
      <ListingOwnerFacts listing={listing} />
      {record.availability === "available_for_sale" && record.askingPriceAed && (
        <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="text-xs text-emerald-700 dark:text-emerald-300">Available price · updated {record.availabilityUpdatedAt}</p>
          <p className="mt-0.5 text-xl font-semibold">{formatPrice(record.askingPriceAed)}</p>
          {record.saleInventory?.details && <p className="mt-1 text-xs text-muted-foreground">{record.saleInventory.details}</p>}
        </div>
      )}
      {record.dunes && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900 dark:bg-amber-950/20">
          <div className="flex items-center gap-2"><Home className="h-4 w-4 text-amber-700" /><span className="font-semibold">{record.dunes.villaType}</span></div>
          <p className="mt-1 text-xs text-muted-foreground">{record.dunes.bedrooms} bedrooms · Interior {record.dunes.interiorAreaSqm.toLocaleString()} m² · Exterior {record.dunes.exteriorAreaSqm.toLocaleString()} m²</p>
          {canViewOriginalPrice && <p className="mt-2 text-lg font-semibold">Original Price {formatPrice(record.originalPriceAed)}</p>}
          <p className="mt-1 text-[0.68rem] text-muted-foreground">Historical Aldar launch status: {record.dunes.launchStatus}. This is not a current resale-availability status.</p>
        </div>
      )}
      <p className="mt-3 text-[0.68rem] text-muted-foreground">
        {record.positionSource === "user_supplied_sde3_coordinate" ? "Official per-plot SDE3 coordinate supplied by the user." : "Map position calibrated from the official master plan to SDE3 controls; not an individual DCR coordinate."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline"><Link href={`/map?plot=${encodeURIComponent(record.villaKey)}`}><Map className="h-3.5 w-3.5 mr-1.5" />Map</Link></Button>
        {onShowPlan && <Button type="button" size="sm" variant="outline" onClick={onShowPlan}><FileText className="h-3.5 w-3.5 mr-1.5" />Master Plan</Button>}
        {record.dunes && <Button asChild size="sm" variant="outline"><Link href={record.dunes.existingDetailsPath}><Home className="h-3.5 w-3.5 mr-1.5" />Full Details</Link></Button>}
        {record.dunes && <Button asChild size="sm" variant="ghost"><a href={record.dunes.officialWorldAldarUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1.5" />World of Aldar</a></Button>}
        <Button asChild size="sm" variant="ghost"><a href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1.5" />Google Maps</a></Button>
      </div>
      {record.dunes && (
        <a href={SAADIYAT_RESERVE_WORLD_ALDAR_URL} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-[0.68rem] text-primary hover:underline">Open official Dunes project experience</a>
      )}
    </div>
  );
}

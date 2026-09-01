import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table2 } from "lucide-react";
import hiddDataRaw from "@/data/hiddPublic.json";
import { hiddPlotRecords, HIDD_SUMMARY } from "@/data/hiddTransactions";
import AreaFilterControls from "@/components/AreaFilterControls";
import { EditListingButton, InteractiveMapLink } from "@/components/ListingControls";
import { trpc } from "@/lib/trpc";
import { getInitialProjectViewMode } from "@/lib/viewMode";
import { formatArea, isWithinAreaRange, matchesAreaQuery, sqftToSqm, type AreaUnit } from "@/lib/areaSearch";
import { propertyScopeKey } from "@shared/propertyAccess";

interface HiddVilla {
  villaNumber?: string;
  zone?: string;
  street?: string;
  bedrooms?: string;
  villaType?: string;
  plotNumberAlJaber?: string;
  admPlotNumber?: string;
  buaAreaSqM?: string;
  buaAreaSqFt?: string;
  plotAreaSqFt?: string;
  newBuaArea?: string;
  tocExpiry?: string;
  dlpExpiry?: string;
  owner1Name?: string;
  owner1Email?: string;
  owner1Mobile?: string;
  owner2Name?: string;
  owner2Relationship?: string;
  owner2Email?: string;
  owner2Mobile?: string;
  hiddCard?: string;
  plateNumber?: string;
  vehicleType?: string;
  ownerRepName?: string;
  ownerRepEmail?: string;
  ownerRepMobile?: string;
  registeredAccessCards?: string;
  repPlateNumber?: string;
  repVehicleType?: string;
  tenantName?: string;
  tenantRelationship?: string;
  tenantEmail?: string;
  tenantMobile?: string;
  tenancyStart?: string;
  tenancyEnd?: string;
  tenancyContractReceived?: string;
  tenantNationality?: string;
  tenantAccessCards?: string;
  tenantPlateNumber?: string;
  tenantVehicleType?: string;
}

// This client dataset intentionally includes property facts only. Owner and
// tenant facts are fetched through the permission-filtered server query below.
const villas: HiddVilla[] = (Array.isArray(hiddDataRaw) ? hiddDataRaw : (hiddDataRaw as any).default ?? []) as HiddVilla[];

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-xs font-medium text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}

function numericArea(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value.replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function villaAreas(villa: HiddVilla) {
  const plotSqft = numericArea(villa.plotAreaSqFt);
  const buaSqm = numericArea(villa.buaAreaSqM);
  return {
    plot: { sqft: plotSqft, sqm: plotSqft != null ? sqftToSqm(plotSqft) : undefined },
    bua: { sqm: buaSqm },
  };
}

function scopeKeyPart(value: string | undefined): string | null {
  const normalized = value?.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  return normalized || null;
}

function hiddScope(villa: HiddVilla) {
  const bedrooms = Number.parseInt(villa.bedrooms ?? "", 10);
  return {
    projectKey: "hidd",
    phaseKey: null,
    buildingKey: scopeKeyPart(`street-${villa.street ?? ""}`),
    unitTypeKey: scopeKeyPart(villa.villaType),
    bedrooms: Number.isInteger(bedrooms) ? bedrooms : null,
  };
}

function VillaCard({
  villa,
  permissions,
  isMaster,
  areaUnit,
}: {
  villa: HiddVilla;
  permissions?: { canViewOwnerName: boolean; canViewOwnerPhone: boolean; canEditProperties: boolean };
  isMaster: boolean;
  areaUnit: AreaUnit;
}) {
  const [expanded, setExpanded] = useState(false);
  const areas = villaAreas(villa);
  const canViewOwnerName = permissions?.canViewOwnerName === true;
  const canViewOwnerPhone = permissions?.canViewOwnerPhone === true;

  return (
    <Card id={`villa-${villa.villaNumber ?? "unknown"}-${villa.street ?? "unknown"}`} className="hover:shadow-md transition-shadow scroll-mt-28">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Villa {villa.villaNumber}
          </CardTitle>
          <div className="flex gap-1.5">
            {villa.zone && <Badge variant="outline" className="text-xs">Zone {villa.zone}</Badge>}
            {villa.bedrooms && <Badge variant="secondary" className="text-xs">{villa.bedrooms} BR</Badge>}
            {villa.street === "11" && <Badge className="text-xs bg-sky-600 hover:bg-sky-600">Sea View</Badge>}
          </div>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
          {villa.street && <span>Street {villa.street}</span>}
          {villa.admPlotNumber && <span>ADM: {villa.admPlotNumber}</span>}
          {villa.villaType && <span>Type {villa.villaType}</span>}
        </div>
        <div className="mt-2 text-xs font-mono text-foreground/80">
          Plot {formatArea(areas.plot, areaUnit)} · BUA {formatArea(areas.bua, areaUnit)}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-3">
          {/* Property Details */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Property Details</p>
            <DetailRow label="Villa #" value={villa.villaNumber} />
            <DetailRow label="Zone" value={villa.zone} />
            <DetailRow label="Street" value={villa.street} />
            <DetailRow label="ADM Plot #" value={villa.admPlotNumber} />
            <DetailRow label="Al Jaber Plot #" value={villa.plotNumberAlJaber} />
            <DetailRow label="Villa Type" value={villa.villaType} />
            <DetailRow label="Bedrooms" value={villa.bedrooms} />
            <DetailRow label="BUA (Sq.M)" value={villa.buaAreaSqM} />
            <DetailRow label="BUA (Sq.Ft)" value={villa.buaAreaSqFt} />
            <DetailRow label="Plot Area (Sq.Ft)" value={villa.plotAreaSqFt} />
            <DetailRow label="New BUA" value={villa.newBuaArea} />
            <DetailRow label="TOC Expiry" value={villa.tocExpiry} />
            <DetailRow label="DLP Expiry" value={villa.dlpExpiry} />
          </div>

          {/* Owner facts are supplied by the server only for this exact unit scope. */}
          {(canViewOwnerName || canViewOwnerPhone) && (villa.owner1Name || villa.owner1Mobile) && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Owner</p>
              {canViewOwnerName && <DetailRow label="Owner 1" value={villa.owner1Name} />}
              {isMaster && <DetailRow label="Email" value={villa.owner1Email} />}
              {canViewOwnerPhone && <DetailRow label="Mobile" value={villa.owner1Mobile} />}
              {canViewOwnerName && villa.owner2Name && (
                <>
                  <DetailRow label="Owner 2" value={villa.owner2Name} />
                  <DetailRow label="Relationship" value={villa.owner2Relationship} />
                  {isMaster && <DetailRow label="Email" value={villa.owner2Email} />}
                  {canViewOwnerPhone && <DetailRow label="Mobile" value={villa.owner2Mobile} />}
                </>
              )}
              {canViewOwnerName && villa.ownerRepName && (
                <>
                  <DetailRow label="Representative" value={villa.ownerRepName} />
                  {isMaster && <DetailRow label="Rep Email" value={villa.ownerRepEmail} />}
                  {canViewOwnerPhone && <DetailRow label="Rep Mobile" value={villa.ownerRepMobile} />}
                </>
              )}
              {isMaster && <DetailRow label="HIDD Card" value={villa.hiddCard} />}
              {isMaster && <DetailRow label="Plate #" value={villa.plateNumber} />}
              {isMaster && <DetailRow label="Vehicle" value={villa.vehicleType} />}
              {isMaster && <DetailRow label="Access Cards" value={villa.registeredAccessCards} />}
            </div>
          )}

          {/* Tenant facts are Master Admin only. */}
          {isMaster && villa.tenantName && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Tenant</p>
              <DetailRow label="Name" value={villa.tenantName} />
              <DetailRow label="Relationship" value={villa.tenantRelationship} />
              <DetailRow label="Email" value={villa.tenantEmail} />
              <DetailRow label="Mobile" value={villa.tenantMobile} />
              <DetailRow label="Nationality" value={villa.tenantNationality} />
              <DetailRow label="Contract Start" value={villa.tenancyStart} />
              <DetailRow label="Contract End" value={villa.tenancyEnd} />
              <DetailRow label="Contract Received" value={villa.tenancyContractReceived} />
              <DetailRow label="Access Cards" value={villa.tenantAccessCards} />
              <DetailRow label="Plate #" value={villa.tenantPlateNumber} />
              <DetailRow label="Vehicle" value={villa.tenantVehicleType} />
            </div>
          )}
        </CardContent>
      )}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <InteractiveMapLink villaKey={`hidd/${villa.villaNumber ?? "unknown"}/${villa.street ?? "unknown"}`} />
          <EditListingButton
            villaKey={`hidd/${villa.villaNumber ?? "unknown"}/${villa.street ?? "unknown"}`}
            community="hidd"
            buildingKey={hiddScope(villa).buildingKey}
            unitTypeKey={hiddScope(villa).unitTypeKey}
            bedrooms={hiddScope(villa).bedrooms}
            villaLabel={`Hidd · Villa ${villa.villaNumber ?? "—"}`}
          />
        </div>
      </div>
    </Card>
  );
}

export default function HiddAlSaadiyat() {
  const { user } = useAuth();
  const isMaster = user?.role === "master";
  const hiddScopes = useMemo(
    () => Array.from(new Map(villas.map(villa => {
      const scope = hiddScope(villa);
      return [propertyScopeKey(scope), scope];
    })).values()),
    [],
  );
  const permissions = trpc.propertyAccess.permissions.useQuery(
    { scopes: hiddScopes },
    { enabled: Boolean(user) },
  );
  const permissionsByScope = useMemo(
    () => new Map(permissions.data?.map(item => [propertyScopeKey(item.scope), item.permissions]) ?? []),
    [permissions.data],
  );
  const sensitiveFacts = trpc.hidd.sensitiveFacts.useQuery(undefined, { enabled: Boolean(user) });
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqm");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">(getInitialProjectViewMode);

  const enrichedVillas = useMemo(() => {
    const factsByKey = new Map((sensitiveFacts.data ?? []).map(fact => [fact.villaKey, fact]));
    return villas.filter(villa => permissionsByScope.get(propertyScopeKey(hiddScope(villa)))?.canAccess === true).map(villa => ({
      ...villa,
      ...factsByKey.get(`hidd/${villa.villaNumber ?? "unknown"}/${villa.street ?? "unknown"}`),
      owner1Name: factsByKey.get(`hidd/${villa.villaNumber ?? "unknown"}/${villa.street ?? "unknown"}`)?.ownerName,
      owner1Mobile: factsByKey.get(`hidd/${villa.villaNumber ?? "unknown"}/${villa.street ?? "unknown"}`)?.ownerPhone,
      owner1Email: factsByKey.get(`hidd/${villa.villaNumber ?? "unknown"}/${villa.street ?? "unknown"}`)?.ownerEmail,
      ownerRepMobile: factsByKey.get(`hidd/${villa.villaNumber ?? "unknown"}/${villa.street ?? "unknown"}`)?.ownerRepMobile,
      tenantName: factsByKey.get(`hidd/${villa.villaNumber ?? "unknown"}/${villa.street ?? "unknown"}`)?.tenant,
      tenantMobile: factsByKey.get(`hidd/${villa.villaNumber ?? "unknown"}/${villa.street ?? "unknown"}`)?.tenantPhone,
      tenantEmail: factsByKey.get(`hidd/${villa.villaNumber ?? "unknown"}/${villa.street ?? "unknown"}`)?.tenantEmail,
    }));
  }, [permissionsByScope, sensitiveFacts.data]);

  const zones = useMemo(() => {
    const s = new Set<string>();
    enrichedVillas.forEach((v) => v.zone && s.add(v.zone));
    return Array.from(s).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [enrichedVillas]);

  const filtered = useMemo(() => {
    let list = enrichedVillas;
    if (zoneFilter) {
      list = list.filter((v) => v.zone === zoneFilter);
    }
    list = list.filter((villa) => {
      const areas = villaAreas(villa);
      const preferred = areas.plot.sqm != null ? areas.plot : areas.bua;
      return isWithinAreaRange(preferred, areaUnit, areaMin, areaMax);
    });
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (v) => {
          const areas = villaAreas(v);
          return matchesAreaQuery(q, areas.plot) || matchesAreaQuery(q, areas.bua) ||
          v.villaNumber?.toLowerCase().includes(q) ||
          v.street?.toLowerCase().includes(q) ||
          v.admPlotNumber?.toLowerCase().includes(q) ||
          v.plotNumberAlJaber?.toLowerCase().includes(q) ||
          v.zone?.toLowerCase().includes(q) ||
          v.owner1Name?.toLowerCase().includes(q) ||
          v.tenantName?.toLowerCase().includes(q);
        }
      );
    }
    return list;
  }, [search, zoneFilter, areaUnit, areaMin, areaMax, enrichedVillas]);

  const hasOwnerNames = enrichedVillas.some(villa => Boolean(villa.owner1Name));

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Hidd Al Saadiyat</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {enrichedVillas.length} villas across {zones.length} zones
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-6">
        <Input
          placeholder="Search villa, street, plot, or area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
            <option value="">All Zones ({enrichedVillas.length})</option>
          {zones.map((z) => (
            <option key={z} value={z}>
              Zone {z} ({enrichedVillas.filter((v) => v.zone === z).length})
            </option>
          ))}
        </select>
        <AreaFilterControls unit={areaUnit} onUnitChange={setAreaUnit} min={areaMin} max={areaMax} onMinChange={setAreaMin} onMaxChange={setAreaMax} compact />
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          <Button type="button" variant={viewMode === "cards" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("cards")} className="rounded-none gap-1"><LayoutGrid className="h-3.5 w-3.5" /> Cards</Button>
          <Button type="button" variant={viewMode === "table" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("table")} className="rounded-none gap-1"><Table2 className="h-3.5 w-3.5" /> Table</Button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground mb-4">
        Showing {filtered.length} of {enrichedVillas.length} permitted villas
      </p>

      {/* Villa Results */}
      {viewMode === "table" ? (
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-accent/40 text-left text-[0.65rem] font-mono uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Villa</th><th className="px-4 py-3">Street</th><th className="px-4 py-3">Zone</th><th className="px-4 py-3">Bedrooms</th><th className="px-4 py-3">Plot</th><th className="px-4 py-3">BUA</th>{hasOwnerNames && <th className="px-4 py-3">Owner</th>}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((villa, i) => {
                const areas = villaAreas(villa);
                return <tr key={`${villa.zone}-${villa.villaNumber}-${i}`} className="hover:bg-accent/30"><td className="px-4 py-3 font-semibold">{villa.villaNumber ?? "—"}</td><td className="px-4 py-3">{villa.street ?? "—"}</td><td className="px-4 py-3">{villa.zone ?? "—"}</td><td className="px-4 py-3">{villa.bedrooms ?? "—"}</td><td className="px-4 py-3 font-mono">{formatArea(areas.plot, areaUnit)}</td><td className="px-4 py-3 font-mono">{formatArea(areas.bua, areaUnit)}</td>{hasOwnerNames && <td className="px-4 py-3">{villa.owner1Name ?? "—"}</td>}</tr>;
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((villa, i) => (
            <VillaCard key={`${villa.zone}-${villa.villaNumber}-${i}`} villa={villa} permissions={permissionsByScope.get(propertyScopeKey(hiddScope(villa)))} isMaster={isMaster} areaUnit={areaUnit} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No villas match your search.
        </div>
      )}

      {/* ADREC Transaction History */}
      <section className="mt-12 pt-10 border-t border-border">
        <div className="mb-6">
          <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-2">ADREC Records · SDN7</div>
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">
            Transaction History
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            {HIDD_SUMMARY.totalTransactions} official transactions for Hidd Al Saadiyat villas ({HIDD_SUMMARY.uniquePlots} unique plots).
            Source: ad-transactions.com (exported 17 Aug 2026). Grouped by land area.
          </p>
        </div>

        <div className="border border-border rounded-md overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/30">
                  <th className="text-left px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">Land ({areaUnit === "sqm" ? "m²" : "sqft"})</th>
                  <th className="text-left px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">Project</th>
                  <th className="text-left px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="text-left px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">Layout</th>
                  <th className="text-left px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="text-right px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">Price (AED)</th>
                  <th className="text-right px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">Rate/sqm</th>
                  <th className="text-center px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {hiddPlotRecords
                  .sort((a, b) => b.transactions[b.transactions.length - 1].date.localeCompare(a.transactions[a.transactions.length - 1].date))
                  .map((record) => {
                    const lastTx = record.transactions[record.transactions.length - 1];
                    const firstTx = record.transactions[0];
                    let appreciation: number | null = null;
                    if (record.transactions.length > 1) {
                      appreciation = ((lastTx.priceAed - firstTx.priceAed) / firstTx.priceAed) * 100;
                    }
                    return (
                      <tr key={record.landSqft} className="hover:bg-accent/20">
                        <td className="px-3 py-2 font-mono text-xs text-foreground">{formatArea({ sqft: record.landSqft }, areaUnit)}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[120px]">{lastTx.project.replace("Hidd Al Saadiyat - ", "")}</td>
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground whitespace-nowrap">{lastTx.date}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{lastTx.layout}</td>
                        <td className="px-3 py-2">
                          <span className={`text-[0.6rem] font-mono uppercase px-1.5 py-0.5 rounded-sm border ${
                            lastTx.saleType === "primary"
                              ? "text-primary border-primary/30 bg-primary/5"
                              : "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5"
                          }`}>
                            {lastTx.saleType === "primary" ? "Primary" : "Resale"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-xs text-foreground">{lastTx.priceAed.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground">{Math.round(lastTx.rateSqm).toLocaleString()}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="font-mono text-xs text-muted-foreground">{record.transactions.length}</span>
                          {appreciation !== null && (
                            <span className={`ml-1.5 text-[0.6rem] font-mono ${
                              appreciation >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            }`}>
                              {appreciation >= 0 ? "+" : ""}{appreciation.toFixed(0)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

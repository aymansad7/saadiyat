import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import hiddDataRaw from "../../../server/data/hidd_al_saadiyat.json";
import { hiddPlotRecords, HIDD_SUMMARY } from "@/data/hiddTransactions";

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

// Normalize: in production builds, JSON ESM interop may wrap as {default: [...]}
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

function VillaCard({ villa, isAdmin }: { villa: HiddVilla; isAdmin: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Villa {villa.villaNumber}
          </CardTitle>
          <div className="flex gap-1.5">
            {villa.zone && <Badge variant="outline" className="text-xs">Zone {villa.zone}</Badge>}
            {villa.bedrooms && <Badge variant="secondary" className="text-xs">{villa.bedrooms} BR</Badge>}
          </div>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
          {villa.street && <span>Street {villa.street}</span>}
          {villa.admPlotNumber && <span>ADM: {villa.admPlotNumber}</span>}
          {villa.villaType && <span>Type {villa.villaType}</span>}
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

          {/* Owner Info - Admin Only */}
          {isAdmin && villa.owner1Name && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Owner</p>
              <DetailRow label="Owner 1" value={villa.owner1Name} />
              <DetailRow label="Email" value={villa.owner1Email} />
              <DetailRow label="Mobile" value={villa.owner1Mobile} />
              {villa.owner2Name && (
                <>
                  <DetailRow label="Owner 2" value={villa.owner2Name} />
                  <DetailRow label="Relationship" value={villa.owner2Relationship} />
                  <DetailRow label="Email" value={villa.owner2Email} />
                  <DetailRow label="Mobile" value={villa.owner2Mobile} />
                </>
              )}
              {villa.ownerRepName && (
                <>
                  <DetailRow label="Representative" value={villa.ownerRepName} />
                  <DetailRow label="Rep Email" value={villa.ownerRepEmail} />
                  <DetailRow label="Rep Mobile" value={villa.ownerRepMobile} />
                </>
              )}
              <DetailRow label="HIDD Card" value={villa.hiddCard} />
              <DetailRow label="Plate #" value={villa.plateNumber} />
              <DetailRow label="Vehicle" value={villa.vehicleType} />
              <DetailRow label="Access Cards" value={villa.registeredAccessCards} />
            </div>
          )}

          {/* Tenant Info - Admin Only */}
          {isAdmin && villa.tenantName && (
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
    </Card>
  );
}

export default function HiddAlSaadiyat() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "master";
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");

  const zones = useMemo(() => {
    const s = new Set<string>();
    villas.forEach((v) => v.zone && s.add(v.zone));
    return Array.from(s).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, []);

  const filtered = useMemo(() => {
    let list = villas;
    if (zoneFilter) {
      list = list.filter((v) => v.zone === zoneFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.villaNumber?.toLowerCase().includes(q) ||
          v.street?.toLowerCase().includes(q) ||
          v.admPlotNumber?.toLowerCase().includes(q) ||
          v.plotNumberAlJaber?.toLowerCase().includes(q) ||
          v.zone?.toLowerCase().includes(q) ||
          (isAdmin && v.owner1Name?.toLowerCase().includes(q)) ||
          (isAdmin && v.tenantName?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [search, zoneFilter, isAdmin]);

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Hidd Al Saadiyat</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {villas.length} villas across {zones.length} zones
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search by villa #, street, ADM plot #, zone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="">All Zones ({villas.length})</option>
          {zones.map((z) => (
            <option key={z} value={z}>
              Zone {z} ({villas.filter((v) => v.zone === z).length})
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground mb-4">
        Showing {filtered.length} of {villas.length} villas
        {!isAdmin && " (owner/tenant details visible to admin only)"}
      </p>

      {/* Villa Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((villa, i) => (
          <VillaCard key={`${villa.zone}-${villa.villaNumber}-${i}`} villa={villa} isAdmin={isAdmin} />
        ))}
      </div>

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
                  <th className="text-left px-3 py-2 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">Land (sqft)</th>
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
                        <td className="px-3 py-2 font-mono text-xs text-foreground">{record.landSqft.toLocaleString()}</td>
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

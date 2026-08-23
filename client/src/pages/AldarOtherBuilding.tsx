/**
 * /aldar-other/:project/:building   (MASTER ONLY)
 *
 * Building page — grid of unit cards with per-project search bar,
 * available toggle, bedroom filter and sort.
 */
import { useMemo, useState } from "react";
import { useParams, Link } from "wouter";
import { Building2, Sparkles, ArrowUpDown, Lock, Search, Eye, EyeOff, User, LayoutGrid, Table2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import MasterGate from "@/components/MasterGate";
import { trpc } from "@/lib/trpc";
import { statusBucket } from "@/data/aldar";
import { AldarStatusPills } from "@/components/AldarStatusPills";
import { fmtAed, shortUnitNumber } from "@/data/aldar/format";
import { AldarStatusBadge } from "@/components/AldarStatusBadge";
import { useListingIndex } from "@/hooks/useListingIndex";
import {
  EditListingButton,
  ListingBadge,
  ListingPriceLabel,
} from "@/components/ListingControls";
import AreaFilterControls from "@/components/AreaFilterControls";
import { formatArea, isWithinAreaRange, matchesAreaQuery, type AreaUnit } from "@/lib/areaSearch";

function Inner() {
  const { project: projectSlug, building: buildingSlug } = useParams<{
    project: string;
    building: string;
  }>();

  const [liveOnly, setLiveOnly] = useState(false);
  const [bedroomFilter, setBedroomFilter] = useState<string>("all");
  const [sort, setSort] = useState<"price_asc" | "price_desc" | "area_asc" | "area_desc" | "unit">("unit");
  const [query, setQuery] = useState("");
  const [showOwners, setShowOwners] = useState(false);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqm");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const building = trpc.aldarOther.getBuilding.useQuery(
    {
      projectSlug: projectSlug ?? "",
      buildingSlug: buildingSlug ?? "",
    },
    { enabled: !!projectSlug && !!buildingSlug },
  );

  const allUnits = building.data?.units ?? [];

  // Bulk-fetch villa-listing rows for every unit in this building.
  const listingPrefix =
    projectSlug && buildingSlug ? `aldar-other/${projectSlug}/${buildingSlug}/` : undefined;
  const { index: listingIndex } = useListingIndex({ prefix: listingPrefix });

  const bedroomOptions = useMemo(() => {
    const set = new Set<string>();
    for (const u of allUnits) if (u.bedrooms) set.add(String(u.bedrooms));
    return Array.from(set).sort();
  }, [allUnits]);

  const units = useMemo(() => {
    let list = allUnits.slice();
    const q = query.trim().toLowerCase();
    list = list.filter(u => {
      const plotArea = { sqm: u.plot_area_sqm };
      const builtArea = { sqm: u.total_area_sqm ?? u.saleable_area_sqm };
      const preferredArea = u.plot_area_sqm != null ? plotArea : builtArea;
      if (!isWithinAreaRange(preferredArea, areaUnit, areaMin, areaMax)) return false;
      if (!q) return true;
      return (u.unit_name ?? "").toLowerCase().includes(q)
        || matchesAreaQuery(q, plotArea)
        || matchesAreaQuery(q, builtArea);
    });
    if (liveOnly)
      list = list.filter(u => {
        const b = statusBucket(u.status);
        return b !== "sold" && b !== "other";
      });
    if (bedroomFilter !== "all")
      list = list.filter(u => String(u.bedrooms) === bedroomFilter);

    const statusOrder: Record<string, number> = {
      available: 0,
      new: 1,
      reserved: 2,
      booked: 3,
      blocked: 4,
      other: 5,
      sold: 6,
    };
    const statusRank = (u: { status: string | null }) =>
      statusOrder[statusBucket(u.status)] ?? 9;

    if (sort === "price_asc") {
      list.sort((a, b) => {
        const sd = statusRank(a) - statusRank(b);
        if (sd !== 0) return sd;
        return (a.price_aed ?? Infinity) - (b.price_aed ?? Infinity);
      });
    } else if (sort === "price_desc") {
      list.sort((a, b) => {
        const sd = statusRank(a) - statusRank(b);
        if (sd !== 0) return sd;
        return (b.price_aed ?? -Infinity) - (a.price_aed ?? -Infinity);
      });
    } else if (sort === "area_asc" || sort === "area_desc") {
      list.sort((a, b) => {
        const areaA = a.plot_area_sqm ?? a.total_area_sqm ?? a.saleable_area_sqm ?? Infinity;
        const areaB = b.plot_area_sqm ?? b.total_area_sqm ?? b.saleable_area_sqm ?? Infinity;
        return sort === "area_asc" ? areaA - areaB : areaB - areaA;
      });
    } else {
      list.sort((a, b) => {
        const sd = statusRank(a) - statusRank(b);
        if (sd !== 0) return sd;
        return String(a.unit_name).localeCompare(String(b.unit_name), undefined, {
          numeric: true,
        });
      });
    }
    return list;
  }, [allUnits, liveOnly, bedroomFilter, sort, query, areaUnit, areaMin, areaMax]);

  const totalLive = useMemo(
    () =>
      (allUnits ?? []).filter(u => {
        const b = statusBucket(u.status);
        return b !== "sold" && b !== "other";
      }).length,
    [allUnits],
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        subTitle={
          building.data
            ? `${building.data.project.name} · ${building.data.name}`
            : "Aldar · Other"
        }
        back={{
          href: `/aldar-other/${projectSlug}`,
          label: building.data?.project.name ?? "Project",
        }}
      />
      <section className="border-b border-border bg-card/40">
        <div className="container py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-rose-600 dark:text-rose-300">
            <Lock className="h-3.5 w-3.5" />
            Master-only · {building.data?.project.name ?? "Aldar · Other"}
          </div>
          <h1 className="font-display text-4xl sm:text-[3rem] leading-tight text-foreground">
            {building.isLoading ? (
              <Skeleton className="h-10 w-72" />
            ) : (
              building.data?.name
            )}
          </h1>
          {building.data && (
            <>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-[0.78rem] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {building.data.unit_count} units
                </span>
              </div>
              <div className="mt-4">
                <AldarStatusPills breakdown={building.data.breakdown} size="sm" />
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search unit or area…"
                    className="w-56"
                  />
                </div>
                <AreaFilterControls
                  unit={areaUnit}
                  onUnitChange={setAreaUnit}
                  min={areaMin}
                  max={areaMax}
                  onMinChange={setAreaMin}
                  onMaxChange={setAreaMax}
                  compact
                />
                <label className="inline-flex items-center gap-2 text-sm">
                  <Switch checked={liveOnly} onCheckedChange={setLiveOnly} />
                  <span className="text-muted-foreground">
                    Live inventory only ({totalLive})
                  </span>
                </label>
                {bedroomOptions.length > 1 && (
                  <Select value={bedroomFilter} onValueChange={setBedroomFilter}>
                    <SelectTrigger className="w-44 text-sm">
                      <SelectValue placeholder="All bedrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All bedrooms</SelectItem>
                      {bedroomOptions.map(b => (
                        <SelectItem key={b} value={b}>
                          {b} BR
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select value={sort} onValueChange={v => setSort(v as typeof sort)}>
                  <SelectTrigger className="w-52 text-sm">
                    <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit">Sort: Unit number</SelectItem>
                    <SelectItem value="price_asc">Sort: Price ↑</SelectItem>
                    <SelectItem value="price_desc">Sort: Price ↓</SelectItem>
                    <SelectItem value="area_asc">Sort: Area ↑</SelectItem>
                    <SelectItem value="area_desc">Sort: Area ↓</SelectItem>
                  </SelectContent>
              </Select>
                <div className="inline-flex rounded-md border border-border overflow-hidden">
                  <Button type="button" variant={viewMode === "cards" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("cards")} className="rounded-none h-9 gap-1"><LayoutGrid className="h-3.5 w-3.5" /> Cards</Button>
                  <Button type="button" variant={viewMode === "table" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("table")} className="rounded-none h-9 gap-1"><Table2 className="h-3.5 w-3.5" /> Table</Button>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <Switch checked={showOwners} onCheckedChange={setShowOwners} />
                  <span className="text-muted-foreground flex items-center gap-1">
                    {showOwners ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {showOwners ? "Hide Owners" : "Show Owners"}
                  </span>
                </label>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="container py-8 sm:py-10">
        {building.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-md" />
            ))}
          </div>
        ) : units.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            No units match your filter.
          </div>
        ) : viewMode === "table" ? (
          <div className="rounded-lg border border-border bg-card overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-accent/40 text-left text-[0.65rem] font-mono uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Bedrooms</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Plot</th>
                  <th className="px-4 py-3">BUA / Saleable</th>
                  <th className="px-4 py-3">Price</th>
                  {showOwners && <th className="px-4 py-3">Owner</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {units.map(u => (
                  <tr key={u.unit_name} className="hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <Link href={`/aldar-other/${projectSlug}/${buildingSlug}/${encodeURIComponent(u.unit_name ?? "")}`} className="font-semibold hover:text-primary">
                        {shortUnitNumber(u.unit_name)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{u.bedrooms ? `${u.bedrooms} BR` : "—"}</td>
                    <td className="px-4 py-3"><AldarStatusBadge status={u.status} /></td>
                    <td className="px-4 py-3 font-mono">{formatArea({ sqm: u.plot_area_sqm }, areaUnit)}</td>
                    <td className="px-4 py-3 font-mono">{formatArea({ sqm: u.total_area_sqm ?? u.saleable_area_sqm }, areaUnit)}</td>
                    <td className="px-4 py-3 font-semibold">AED {fmtAed(u.price_aed)}</td>
                    {showOwners && <td className="px-4 py-3">{(u as any).owner_name ?? "—"}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {units.map(u => {
              const villaKey = `aldar-other/${projectSlug}/${buildingSlug}/${u.unit_name ?? ""}`;
              const listing = listingIndex.get(villaKey) ?? null;
              return (
              <div key={u.unit_name} className="group rounded-md border border-border bg-card overflow-hidden hover:border-primary/60 transition-colors flex flex-col">
                <Link
                  href={`/aldar-other/${projectSlug}/${buildingSlug}/${encodeURIComponent(u.unit_name ?? "")}`}
                  className="block flex-1"
                >
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                      Unit
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <ListingBadge status={listing?.status ?? null} />
                      <AldarStatusBadge status={u.status} />
                    </div>
                  </div>
                  <div className="font-display text-2xl text-foreground leading-none">
                    {shortUnitNumber(u.unit_name)}
                  </div>
                  <div className="text-[0.7rem] font-mono text-muted-foreground">
                    {u.unit_model ?? u.unit_category ?? "—"}
                    {u.bedrooms && ` · ${u.bedrooms}BR`}
                  </div>
                  <div className="mt-2 border-t border-border pt-2">
                    <div className="text-[0.62rem] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                      Original price (without add-ons)
                    </div>
                    <div className="font-display text-xl num-display text-foreground">
                      AED {fmtAed(u.price_aed)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[0.7rem] font-mono text-muted-foreground">
                    <div>
                      <div className="text-[0.6rem] uppercase tracking-[0.18em]">
                        Plot
                      </div>
                      <div className="text-foreground/80">{formatArea({ sqm: u.plot_area_sqm }, areaUnit)}</div>
                    </div>
                    <div>
                      <div className="text-[0.6rem] uppercase tracking-[0.18em]">
                        BUA / Saleable
                      </div>
                      <div className="text-foreground/80">
                        {formatArea({ sqm: u.total_area_sqm ?? u.saleable_area_sqm }, areaUnit)}
                      </div>
                    </div>
                  </div>
                  {listing?.askingPriceAed ? (
                    <div className="mt-1 -mb-1 flex items-center gap-1">
                      <span className="text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">Resale ask</span>
                      <ListingPriceLabel askingPriceAed={listing.askingPriceAed} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                  ) : null}
                  {listing?.listingPartners ? (
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                      with {listing.listingPartners}
                    </div>
                  ) : null}
                  {showOwners && (u as any).owner_name && (
                    <div className="mt-2 p-2 rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
                      <div className="flex items-center gap-1 mb-0.5">
                        <User className="h-3 w-3 text-blue-600" />
                        <span className="text-[0.6rem] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400">Owner</span>
                      </div>
                      <div className="text-sm font-medium text-foreground">{(u as any).owner_name}</div>
                      {(u as any).owner_mobile && (
                        <a href={`tel:${(u as any).owner_mobile}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                          {(u as any).owner_mobile}
                        </a>
                      )}
                    </div>
                  )}
                </div>
                </Link>
                <div className="px-4 pb-3">
                  <EditListingButton
                    villaKey={villaKey}
                    community="aldar-other"
                    villaLabel={u.unit_name ?? villaKey}
                    className="w-full justify-center"
                  />
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function AldarOtherBuilding() {
  return (
    <MasterGate>
      <Inner />
    </MasterGate>
  );
}

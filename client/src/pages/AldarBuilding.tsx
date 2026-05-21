/**
 * /aldar-saadiyat/:project/:building
 *
 * Building page — grid of unit cards. Each card highlights:
 *  - Original price (without add-ons)
 *  - Status badge (Available / Sold / etc.)
 *  - Bedrooms / area
 *  - Unit number (short form)
 * Filters: status (Available / All), bedrooms, sort by price.
 */
import { useMemo, useState } from "react";
import { Redirect, useParams, Link } from "wouter";
import { Building2, Sparkles, ArrowUpDown } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { getAldarBuilding, breakdownForBuilding, actionableCount, statusBucket } from "@/data/aldar";
import { AldarStatusPills } from "@/components/AldarStatusPills";
import { buildingDisplayName } from "@/data/aldar/buildingLabels";
import { fmtAed, shortUnitNumber, fmtArea } from "@/data/aldar/format";
import { AldarStatusBadge } from "@/components/AldarStatusBadge";

export default function AldarBuilding() {
  const { project: projectSlug, building: buildingSlug } = useParams<{
    project: string;
    building: string;
  }>();
  const ctx = projectSlug && buildingSlug ? getAldarBuilding(projectSlug, buildingSlug) : undefined;
  const [availableOnly, setAvailableOnly] = useState(false);
  const [bedroomFilter, setBedroomFilter] = useState<string>("all");
  const [sort, setSort] = useState<"price_asc" | "price_desc" | "unit">("unit");

  const allUnits = ctx?.building.units ?? [];

  const bedroomOptions = useMemo(() => {
    const set = new Set<string>();
    for (const u of allUnits) {
      if (u.bedrooms) set.add(String(u.bedrooms));
    }
    return Array.from(set).sort();
  }, [allUnits]);

  const units = useMemo(() => {
    let list = allUnits.slice();
    if (availableOnly)
      list = list.filter(u => {
        const b = statusBucket(u.status);
        return b !== "sold" && b !== "other";
      });
    if (bedroomFilter !== "all") list = list.filter(u => String(u.bedrooms) === bedroomFilter);
    if (sort === "price_asc")
      list.sort((a, b) => (a.price_aed ?? Infinity) - (b.price_aed ?? Infinity));
    else if (sort === "price_desc")
      list.sort((a, b) => (b.price_aed ?? -Infinity) - (a.price_aed ?? -Infinity));
    else
      list.sort((a, b) => String(a.unit_name).localeCompare(String(b.unit_name)));
    return list;
  }, [allUnits, availableOnly, bedroomFilter, sort]);

  if (!ctx) return <Redirect to="/aldar-saadiyat" />;
  const { project, building } = ctx;
  const dn = buildingDisplayName(building.name);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        subTitle={`${project.name} · ${dn.primary}`}
        back={{ href: `/aldar-saadiyat/${project.slug}`, label: project.name }}
      />
      <section className="border-b border-border bg-card/40">
        <div className="container py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {project.name}
          </div>
          <h1 className="font-display text-4xl sm:text-[3rem] leading-tight text-foreground">
            {dn.primary}
          </h1>
          {dn.secondary && (
            <div className="mt-1 font-mono text-[0.75rem] uppercase tracking-[0.18em] text-muted-foreground">
              {dn.secondary}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[0.78rem] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {building.unit_count} units
            </span>
          </div>
          <div className="mt-4">
            <AldarStatusPills breakdown={breakdownForBuilding(building)} size="sm" />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <Switch checked={availableOnly} onCheckedChange={setAvailableOnly} />
              <span className="text-muted-foreground">
                Live inventory only ({actionableCount(breakdownForBuilding(building))})
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
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-10">
        {units.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            No units match your filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {units.map(u => (
              <Link
                key={u.unit_name}
                href={`/aldar-saadiyat/${project.slug}/${building.slug}/${encodeURIComponent(u.unit_name ?? "")}`}
                className="group block rounded-md border border-border bg-card overflow-hidden hover:border-primary/60 transition-colors"
              >
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                      Unit
                    </div>
                    <AldarStatusBadge status={u.status} />
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
                      <div className="text-[0.6rem] uppercase tracking-[0.18em]">Plot</div>
                      <div className="text-foreground/80">{fmtArea(u.plot_area_sqm)}</div>
                    </div>
                    <div>
                      <div className="text-[0.6rem] uppercase tracking-[0.18em]">BUA / Saleable</div>
                      <div className="text-foreground/80">
                        {fmtArea(u.total_area_sqm ?? u.saleable_area_sqm)}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Building2, ExternalLink, LayoutGrid, MapPin, Table2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AreaFilterControls from "@/components/AreaFilterControls";
import { EditListingButton, ListingBadge, ListingPriceLabel, ListingPropertyFacts } from "@/components/ListingControls";
import { trpc } from "@/lib/trpc";
import { formatArea, isWithinAreaRange, matchesAreaQuery, type AreaUnit } from "@/lib/areaSearch";
import { getInitialProjectViewMode } from "@/lib/viewMode";
import { NUDRA_PAYMENT_PLAN_NOTE, NUDRA_SOURCE_LINKS, NUDRA_UNITS, type NudraUnit } from "@/data/nudra";

function formatAed(value?: number) {
  return value ? `AED ${new Intl.NumberFormat("en-AE").format(value)}` : "—";
}

function categoryTone(category: string) {
  if (category.startsWith("Shores")) return "text-amber-700 border-amber-300 bg-amber-50";
  if (category.startsWith("Beach")) return "text-sky-700 border-sky-300 bg-sky-50";
  return "text-violet-700 border-violet-300 bg-violet-50";
}

function UnitCard({ unit, listing, canViewOriginal }: { unit: NudraUnit; listing: any; canViewOriginal: boolean }) {
  const latest = unit.transactions.at(-1);
  return (
    <article id={`nudra-${unit.unitNumber}`} className="rounded-lg border border-border bg-card overflow-hidden shadow-sm flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between gap-3">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Nudra by IMKAN</p>
            <h2 className="font-display text-2xl text-foreground mt-1">{unit.unitNumber}</h2>
          </div>
          <div className="flex items-start gap-1.5 flex-wrap justify-end">
            <ListingBadge status={listing?.status} />
            <span className={`border rounded-full px-2 py-0.5 text-[0.62rem] font-mono uppercase tracking-wide ${categoryTone(unit.category)}`}>{unit.category.replace(" private mansion plot", "")}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-[0.62rem] uppercase tracking-[0.16em] font-mono text-muted-foreground">Land</p><p className="font-semibold mt-1">{formatArea({ sqm: listing?.landAreaSqm ?? unit.plotAreaSqm }, "sqm")}</p></div>
          <div><p className="text-[0.62rem] uppercase tracking-[0.16em] font-mono text-muted-foreground">Saleable</p><p className="font-semibold mt-1">{formatArea({ sqm: listing?.builtUpAreaSqm ?? unit.saleableAreaSqm }, "sqm")}</p></div>
        </div>
        {unit.bedrooms && <p className="mt-3 text-xs text-muted-foreground">{unit.bedrooms} BR · Shell & core delivery in supplied IMKAN material</p>}
        <ListingPropertyFacts listing={listing} />

        {canViewOriginal && (unit.originalPriceFiveYearAed || unit.originalPriceSevenYearAed) && (
          <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3">
            <p className="text-[0.62rem] uppercase tracking-[0.16em] font-mono text-primary">Original IMKAN price</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm tabular-nums">
              <div><span className="block text-[0.62rem] text-muted-foreground">5 year</span><b>{formatAed(unit.originalPriceFiveYearAed)}</b></div>
              <div><span className="block text-[0.62rem] text-muted-foreground">7 year</span><b>{formatAed(unit.originalPriceSevenYearAed)}</b></div>
            </div>
            <p className="mt-2 text-[0.65rem] leading-relaxed text-muted-foreground">{unit.paymentPlan}</p>
          </div>
        )}

        {listing?.askingPriceAed && <div className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 p-3"><p className="text-[0.62rem] uppercase tracking-[0.16em] font-mono text-emerald-700">Current documented price</p><ListingPriceLabel askingPriceAed={listing.askingPriceAed} className="mt-1 block text-emerald-900" /></div>}

        {latest && <div className="mt-4 border-t border-border pt-3"><p className="text-[0.62rem] uppercase tracking-[0.16em] font-mono text-muted-foreground">Transaction history</p>{unit.transactions.map((transaction) => <div key={`${transaction.date}-${transaction.saleType}`} className="mt-2 flex items-start justify-between gap-2 text-xs"><span><b className={transaction.saleType === "primary" ? "text-primary" : "text-amber-700"}>{transaction.saleType === "primary" ? "Primary" : "Secondary"}</b> · {transaction.date}{transaction.confidence === "possible" && <span className="ml-1 text-amber-700">Possible</span>}</span><span className="font-mono font-semibold whitespace-nowrap">{formatAed(transaction.priceAed)}</span></div>)}</div>}
      </div>
      <div className="p-4 pt-0 flex flex-wrap gap-2">
        <Link href={`/map?plot=nudra-${encodeURIComponent(unit.unitNumber)}`} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"><MapPin className="h-3.5 w-3.5" /> Map</Link>
        <EditListingButton villaKey={unit.villaKey} community="nudra" villaLabel={`Nudra · ${unit.unitNumber}`} />
      </div>
    </article>
  );
}

export default function Nudra() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqm");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">(getInitialProjectViewMode);
  const isAdmin = user?.role === "admin" || user?.role === "master";
  const permissions = trpc.propertyAccess.permissions.useQuery({ projects: ["nudra"] }, { enabled: Boolean(user) });
  const canViewOriginal = isAdmin || permissions.data?.[0]?.permissions.canViewOriginalPrice === true;
  const listings = trpc.villaListings.listByCommunity.useQuery({});
  const listingByKey = useMemo(() => new Map((listings.data ?? []).filter((row) => row.community === "nudra").map((row) => [row.villaKey, row])), [listings.data]);
  const filtered = useMemo(() => NUDRA_UNITS.filter((unit) => {
    const listing = listingByKey.get(unit.villaKey);
    const area = { sqm: listing?.landAreaSqm ?? unit.plotAreaSqm };
    if (!isWithinAreaRange(area, areaUnit, areaMin, areaMax)) return false;
    if (category !== "all" && !unit.category.startsWith(category)) return false;
    const q = search.trim().toLowerCase();
    return !q || unit.unitNumber.toLowerCase().includes(q) || unit.category.toLowerCase().includes(q) || matchesAreaQuery(q, area) || matchesAreaQuery(q, { sqm: unit.saleableAreaSqm });
  }), [search, category, areaUnit, areaMin, areaMax, listingByKey]);

  return <main className="container max-w-7xl py-8 sm:py-10">
    <header className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-[0.7rem] uppercase tracking-[0.24em] font-mono text-primary">Saadiyat Island · SDN1</p><h1 className="mt-2 font-display text-4xl sm:text-5xl text-foreground">Nudra <span className="text-primary">by IMKAN</span></h1><p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">38 source-backed plots and villas from the supplied IMKAN plot plan. Original launch pricing is separate from documented primary and secondary transactions. Address-level Yandex locations appear on the map only where the house number was returned exactly.</p></div>
        <div className="flex flex-wrap gap-2"><a href={NUDRA_SOURCE_LINKS.sitePlan} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground"><Building2 className="h-4 w-4" /> Site plan</a><a href={NUDRA_SOURCE_LINKS.availability} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground">Availability source</a><Link href="/map?community=nudra" className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><MapPin className="h-4 w-4" /> Open map</Link></div>
      </div>
    </header>

    <section className="mt-6 rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search unit, type, or area…" className="lg:max-w-sm" /><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="all">All 38 records</option><option value="Shores">Shores private mansions</option><option value="Beach">Beach villas</option><option value="Dunes">Dunes villas</option></select><AreaFilterControls unit={areaUnit} onUnitChange={setAreaUnit} min={areaMin} max={areaMax} onMinChange={setAreaMin} onMaxChange={setAreaMax} compact /><div className="inline-flex rounded-md border border-border overflow-hidden"><Button type="button" variant={viewMode === "cards" ? "default" : "ghost"} size="sm" className="rounded-none" onClick={() => setViewMode("cards")}><LayoutGrid className="h-3.5 w-3.5 mr-1" />Cards</Button><Button type="button" variant={viewMode === "table" ? "default" : "ghost"} size="sm" className="rounded-none" onClick={() => setViewMode("table")}><Table2 className="h-3.5 w-3.5 mr-1" />Table</Button></div></div>
      <p className="mt-3 text-xs text-muted-foreground">{filtered.length} of {NUDRA_UNITS.length} records · {NUDRA_PAYMENT_PLAN_NOTE}</p>
    </section>

    {viewMode === "cards" ? <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((unit) => <UnitCard key={unit.unitNumber} unit={unit} listing={listingByKey.get(unit.villaKey)} canViewOriginal={canViewOriginal} />)}</section> : <section className="mt-6 overflow-x-auto rounded-lg border border-border bg-card"><table className="w-full min-w-[980px] text-sm"><thead className="bg-muted/50 text-left text-[0.65rem] uppercase tracking-[0.16em] font-mono text-muted-foreground"><tr><th className="px-4 py-3">Unit</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Land</th><th className="px-4 py-3">Saleable</th>{canViewOriginal && <th className="px-4 py-3">Original 5Y / 7Y</th>}<th className="px-4 py-3">Latest transaction</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-border">{filtered.map((unit) => { const listing = listingByKey.get(unit.villaKey); const latest = unit.transactions.at(-1); return <tr key={unit.unitNumber} className="hover:bg-muted/30"><td className="px-4 py-3 font-semibold">{unit.unitNumber}</td><td className="px-4 py-3 text-muted-foreground">{unit.category}</td><td className="px-4 py-3 font-mono">{formatArea({ sqm: listing?.landAreaSqm ?? unit.plotAreaSqm }, "sqm")}</td><td className="px-4 py-3 font-mono">{formatArea({ sqm: listing?.builtUpAreaSqm ?? unit.saleableAreaSqm }, "sqm")}</td>{canViewOriginal && <td className="px-4 py-3 font-mono text-xs">{unit.originalPriceFiveYearAed ? `${formatAed(unit.originalPriceFiveYearAed)} / ${formatAed(unit.originalPriceSevenYearAed)}` : "—"}</td>}<td className="px-4 py-3 font-mono text-xs">{latest ? `${latest.date} · ${formatAed(latest.priceAed)}` : "—"}</td><td className="px-4 py-3"><div className="flex gap-2"><Link href={`/map?plot=nudra-${encodeURIComponent(unit.unitNumber)}`} className="text-primary"><ExternalLink className="h-4 w-4" /></Link><EditListingButton villaKey={unit.villaKey} community="nudra" villaLabel={`Nudra · ${unit.unitNumber}`} /></div></td></tr>; })}</tbody></table></section>}
  </main>;
}

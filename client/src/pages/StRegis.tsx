/**
 * Coastal Atelier — St. Regis Villas explorer
 *
 * Layout (desktop): asymmetric — left sticky map (~38%), right scroll grid of cards.
 * Mobile: collapsible map on top, then cards.
 *
 * Filter dimensions:
 *   - Search by villa #, ADM/ALDAR id
 *   - Bedrooms (4 BR / 5 BR / All)
 *   - Plot area range (slider)
 *   - Sort: Villa #, Plot area, GFA
 *
 * No purple gradients, no centered hero.
 */
import { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import PlotMap from "@/components/PlotMap";
import VillaCard from "@/components/VillaCard";
import { villas as ALL_VILLAS } from "@/data/villas";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronUp, RotateCcw, FileText, MapPin, Globe2 } from "lucide-react";
import { DownloadDcrPackButton } from "@/components/DownloadDcrPackButton";
import { useDcrPdfIndex } from "@/hooks/useDcrPdfIndex";

const PLOT_MIN = Math.floor(Math.min(...ALL_VILLAS.map((v) => v.plotAreaSqm ?? 0)));
const PLOT_MAX = Math.ceil(Math.max(...ALL_VILLAS.map((v) => v.plotAreaSqm ?? 0)));

type SortKey = "id" | "plot" | "gfa";

export default function StRegis() {
  const [query, setQuery] = useState("");
  const [bedrooms, setBedrooms] = useState<string>("all");
  const [plotRange, setPlotRange] = useState<[number, number]>([PLOT_MIN, PLOT_MAX]);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [mapOpenMobile, setMapOpenMobile] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_VILLAS.filter((v) => {
      if (q) {
        const hay = `${v.id} ${v.admPlotId} ${v.aldarPlotId}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (bedrooms !== "all" && v.bedrooms !== Number(bedrooms)) return false;
      const pa = v.plotAreaSqm ?? 0;
      if (pa < plotRange[0] || pa > plotRange[1]) return false;
      return true;
    }).sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "id") return (a.id - b.id) * dir;
      if (sortKey === "plot") return ((a.plotAreaSqm ?? 0) - (b.plotAreaSqm ?? 0)) * dir;
      if (sortKey === "gfa") return ((a.maxGfaSqm ?? 0) - (b.maxGfaSqm ?? 0)) * dir;
      return 0;
    });
  }, [query, bedrooms, plotRange, sortKey, sortDir]);

  const filteredIds = useMemo(() => new Set(filtered.map((v) => v.id)), [filtered]);
  const focusId = hoverId ?? activeId;
  // Bulk DCR PDF index for the whole community (33 plots).
  const { index: pdfIndex, isLoading: pdfLoading } = useDcrPdfIndex("st-regis/");
  const pdfCount = pdfIndex.size;

  function reset() {
    setQuery("");
    setBedrooms("all");
    setPlotRange([PLOT_MIN, PLOT_MAX]);
    setSortKey("id");
    setSortDir("asc");
    setActiveId(null);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle="St. Regis Villas · SB-01" back={{ href: "/", label: "Back to Saadiyat" }} />

      {/* Page intro */}
      <section className="border-b border-border bg-card/50">
        <div className="container py-6 sm:py-8 grid grid-cols-12 gap-4 items-end">
          <div className="col-span-12 sm:col-span-7 lg:col-span-8">
            <div className="flex items-center gap-2 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
              <span className="h-px w-6 bg-primary/60" />
              Saadiyat Beach District · Cluster SB-01
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] leading-tight text-foreground">
              St. Regis Villas
              <span className="text-muted-foreground italic"> — explore all 33 plots.</span>
            </h1>
          </div>
          <div className="col-span-12 sm:col-span-5 lg:col-span-4 flex flex-wrap gap-3 sm:justify-end">
            <Stat label="Plots" value={String(ALL_VILLAS.length)} />
            <Stat label="Showing" value={String(filtered.length)} accent />
            <Stat label="Layout" value="Coastal" />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-background sticky top-[60px] sm:top-[68px] z-30 backdrop-blur-md bg-background/85">
        <div className="container py-3 sm:py-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by villa #, ADM or ALDAR ID…"
              className="pl-9 bg-card border-border"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] uppercase tracking-[0.18em] font-mono text-muted-foreground hidden sm:block">Bedrooms</span>
            <ToggleGroup type="single" value={bedrooms} onValueChange={(v) => v && setBedrooms(v)} variant="outline" size="sm">
              <ToggleGroupItem value="all" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary">All</ToggleGroupItem>
              <ToggleGroupItem value="4" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary">4 BR</ToggleGroupItem>
              <ToggleGroupItem value="5" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary">5 BR</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-md">
            <span className="text-[0.7rem] uppercase tracking-[0.18em] font-mono text-muted-foreground whitespace-nowrap hidden sm:block">Plot area</span>
            <Slider
              value={plotRange}
              onValueChange={(v) => setPlotRange([v[0], v[1]])}
              min={PLOT_MIN}
              max={PLOT_MAX}
              step={10}
              minStepsBetweenThumbs={1}
              className="flex-1"
            />
            <span className="text-xs font-mono tabular text-foreground whitespace-nowrap">
              {plotRange[0]}–{plotRange[1]} m²
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger className="h-9 w-[150px] bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Sort: Villa #</SelectItem>
                <SelectItem value="plot">Sort: Plot area</SelectItem>
                <SelectItem value="gfa">Sort: GFA</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
              className="h-9 bg-card"
              aria-label="Toggle sort direction"
            >
              {sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={reset} className="h-9 text-muted-foreground hover:text-foreground gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <DownloadDcrPackButton
              prefix="st-regis/"
              filename="StRegis-DCRs.zip"
              count={pdfCount}
              loading={pdfLoading}
              className="h-9 hidden md:inline-flex"
            />
          </div>
        </div>
      </section>

      {/* Mobile map toggle */}
      <div className="lg:hidden border-b border-border bg-card">
        <button
          className="w-full container py-3 flex items-center justify-between text-sm"
          onClick={() => setMapOpenMobile((s) => !s)}
        >
          <span className="font-mono uppercase tracking-[0.18em] text-muted-foreground">Plot Map</span>
          {mapOpenMobile ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Main split view */}
      <div className="flex-1 container py-5 sm:py-7 grid grid-cols-12 gap-5 lg:gap-7">
        {/* Map pane */}
        <aside
          className={[
            "col-span-12 lg:col-span-5 xl:col-span-5",
            mapOpenMobile ? "" : "hidden lg:block",
          ].join(" ")}
        >
          <div className="lg:sticky lg:top-[156px]">
            <div className="bg-card border border-border rounded-md overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Cluster Map · SB-01
                </div>
                <div className="text-[0.7rem] font-mono tabular text-muted-foreground">
                  {filteredIds.size}/{ALL_VILLAS.length}
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-background topo-bg">
                <PlotMap
                  villas={ALL_VILLAS}
                  filteredIds={filteredIds}
                  activeId={focusId}
                  onHover={setHoverId}
                  onSelect={(id) => setActiveId((cur) => (cur === id ? null : id))}
                  className="aspect-[10/7] w-full"
                />
              </div>
            </div>

            {/* Active villa quick-access strip */}
            {focusId && (() => {
              const v = ALL_VILLAS.find((x) => x.id === focusId);
              if (!v) return null;
              return (
                <div className="mt-3 bg-card border border-border rounded-md p-4 rise-in">
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {v.admPlotId}
                      </div>
                      <h3 className="font-display text-xl text-foreground mt-0.5">
                        Villa {v.id}
                        <span className="text-muted-foreground italic font-normal"> — {v.buildingTypology}</span>
                      </h3>
                    </div>
                    <span className="font-mono text-xs tabular text-muted-foreground">
                      {v.latitude.toFixed(4)}°, {v.longitude.toFixed(4)}°
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5">
                      <a href={v.pdfLocalUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-3.5 w-3.5" />
                        DMT PDF
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-card gap-1.5">
                      <a href={v.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                        <MapPin className="h-3.5 w-3.5" />
                        Google Maps
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="bg-card gap-1.5">
                      <a href={v.googleEarthUrl} target="_blank" rel="noopener noreferrer">
                        <Globe2 className="h-3.5 w-3.5" />
                        Google Earth
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </aside>

        {/* Cards grid */}
        <main className="col-span-12 lg:col-span-7 xl:col-span-7">
          {filtered.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border rounded-md">
              <div className="font-display text-2xl text-foreground">No villas match these filters</div>
              <p className="text-sm text-muted-foreground mt-2">Try widening the plot-area range or clearing the search.</p>
              <Button onClick={reset} variant="outline" className="mt-4 bg-card">Reset filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filtered.map((v) => (
                <VillaCard
                  key={v.id}
                  villa={v}
                  isActive={focusId === v.id}
                  onHover={setHoverId}
                  onSelect={(id) => setActiveId((cur) => (cur === id ? null : id))}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <footer className="mt-auto border-t border-border bg-card/60">
        <div className="container py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-muted-foreground">
          <div className="font-mono uppercase tracking-[0.18em]">Saadiyat · St. Regis Villas Atlas</div>
          <div>Source: DMT GeoSmart · WGS84 / UTM Zone 40N</div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-3 py-2 border border-border rounded-sm bg-card min-w-[88px]">
      <div className="text-[0.62rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">{label}</div>
      <div className={`font-display num-display tabular text-2xl leading-none mt-0.5 ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}

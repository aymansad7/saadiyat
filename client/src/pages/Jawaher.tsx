/**
 * Coastal Atelier — Jawaher Saadiyat (Path A)
 * Same shell as St. Regis but the cards are SimplePlotCards (DCR + MyLand only)
 * because per-plot specs are not yet extracted.
 *
 * Filters:
 *   - Search by plot number
 *   - Sort by plot number (asc/desc)
 *
 * Future: when PDFs are parsed, swap SimplePlotCard for a richer card and
 * add a plot map (this file changes minimally).
 */
import { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SimplePlotCard from "@/components/SimplePlotCard";
import { COMMUNITIES } from "@/data/communities";
import { useDcrPdfIndex } from "@/hooks/useDcrPdfIndex";
import { DownloadDcrPackButton } from "@/components/DownloadDcrPackButton";
import { DownloadDcrBackupButton } from "@/components/DownloadDcrBackupButton";
import { DCR_BACKUPS } from "@/data/dcrBackups";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COMMUNITY = COMMUNITIES.find((c) => c.slug === "jawaher")!;

export default function Jawaher() {
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState<number>(48);

  // Bulk-fetch every Jawaher DCR PDF in one request → pdf URL map keyed by villaKey.
  const { index: pdfIndex, isLoading: pdfLoading } = useDcrPdfIndex("jawaher/");
  const pdfCount = pdfIndex.size;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (COMMUNITY.flatPlots ?? []).filter((p) => {
      if (!q) return true;
      return (
        p.label.toLowerCase().includes(q) ||
        p.pdfFilename.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    });
    list.sort((a, b) => (a.id - b.id) * (sortDir === "asc" ? 1 : -1));
    return list;
  }, [query, sortDir]);

  const visible = filtered.slice(0, pageSize);

  function reset() {
    setQuery("");
    setSortDir("asc");
    setPageSize(48);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle={`${COMMUNITY.name} · ${COMMUNITY.cluster}`} back={{ href: "/", label: "Back to Saadiyat" }} />

      {/* Page intro */}
      <section className="border-b border-border bg-card/50">
        <div className="container py-6 sm:py-8 grid grid-cols-12 gap-4 items-end">
          <div className="col-span-12 sm:col-span-7 lg:col-span-8">
            <div className="flex items-center gap-2 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
              <span className="h-px w-6 bg-primary/60" />
              {COMMUNITY.cluster}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] leading-tight text-foreground">
              {COMMUNITY.name}
              <span className="text-muted-foreground italic"> — {COMMUNITY.totalPlots} plots.</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
              Click any plot to open its official DCR sheet. For the precise
              location, open the MyLand portal and filter by community.
            </p>
          </div>
          <div className="col-span-12 sm:col-span-5 lg:col-span-4 flex flex-col gap-3 sm:items-end">
            <div className="flex flex-wrap gap-3 sm:justify-end">
              <Stat label="Plots" value={String(COMMUNITY.totalPlots)} />
              <Stat label="Showing" value={String(filtered.length)} accent />
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <DownloadDcrPackButton
                prefix="jawaher/"
                filename="Jawaher-DCRs.zip"
                count={pdfCount}
                loading={pdfLoading}
              />
              <DownloadDcrBackupButton backup={DCR_BACKUPS.jawaher} />
            </div>
            <Stat label="Source" value="DMT" />
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="border-b border-border bg-background sticky top-[60px] sm:top-[68px] z-30 backdrop-blur-md bg-background/85">
        <div className="container py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by plot number…"
              className="pl-9 bg-card border-border"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
              className="h-9 bg-card gap-1.5"
            >
              {sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {sortDir === "asc" ? "Ascending" : "Descending"}
            </Button>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="h-9 w-[140px] bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">Show 24</SelectItem>
                <SelectItem value="48">Show 48</SelectItem>
                <SelectItem value="96">Show 96</SelectItem>
                <SelectItem value="9999">Show all</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={reset} className="h-9 text-muted-foreground hover:text-foreground gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button asChild variant="outline" size="sm" className="h-9 bg-card gap-1.5 hidden md:inline-flex">
              <a href="https://myland.dmt.gov.ae/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                MyLand
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Cards */}
      <main className="container py-6 sm:py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-md">
            <div className="font-display text-2xl text-foreground">No plots match this search</div>
            <Button onClick={reset} variant="outline" className="mt-4 bg-card">Reset</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visible.map((p) => (
                <SimplePlotCard
                  key={p.pdfFilename}
                  plot={p}
                  communityLabel={`Jawaher · SDN1`}
                  bigNumber={p.label.replace(/^Plot\s+/, "")}
                  pdfUrl={pdfIndex.get(p.villaKey) ?? null}
                  pdfLoading={pdfLoading}
                />
              ))}
            </div>
            {filtered.length > visible.length && (
              <div className="text-center mt-8">
                <Button onClick={() => setPageSize((s) => s + 48)} variant="outline" className="bg-card">
                  Show more ({filtered.length - visible.length} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mt-auto border-t border-border bg-card/60">
        <div className="container py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-muted-foreground">
          <div className="font-mono uppercase tracking-[0.18em]">Saadiyat · Jawaher</div>
          <div>Source: DMT GeoSmart · DCR sheets hosted on Saadiyat archive</div>
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

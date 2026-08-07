/**
 * Generic community page for flat-plot communities (no gates).
 * Used for: Saadiyat Beach Golf Views, Private Villas Close to Four Seasons.
 * Accepts a community slug via URL params and renders the plot grid with
 * search, sort, and DCR PDF links.
 */
import { useMemo, useState } from "react";
import { useParams } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import SimplePlotCard from "@/components/SimplePlotCard";
import { COMMUNITIES } from "@/data/communities";
import { useDcrPdfIndex } from "@/hooks/useDcrPdfIndex";
import { useListingIndex } from "@/hooks/useListingIndex";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";

export default function CommunityPage() {
  const { slug } = useParams<{ slug: string }>();
  const community = COMMUNITIES.find((c) => c.slug === slug);

  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Derive the villaKey prefix from the first plot (e.g. "golf-views/" not the URL slug)
  const villaKeyPrefix = useMemo(() => {
    const firstKey = community?.flatPlots?.[0]?.villaKey;
    if (!firstKey) return slug ? `${slug}/` : "";
    const slashIdx = firstKey.indexOf("/");
    return slashIdx > 0 ? firstKey.slice(0, slashIdx + 1) : `${slug}/`;
  }, [community, slug]);
  const { index: pdfIndex, isLoading: pdfLoading } = useDcrPdfIndex(villaKeyPrefix);
  const { index: listingIndex } = useListingIndex({ community: slug ?? "" });

  const filtered = useMemo(() => {
    if (!community?.flatPlots) return [];
    const q = query.trim().toLowerCase();
    const list = community.flatPlots.filter((p) => {
      if (!q) return true;
      return (
        p.label.toLowerCase().includes(q) ||
        p.pdfFilename.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    });
    list.sort((a, b) => (a.id - b.id) * (sortDir === "asc" ? 1 : -1));
    return list;
  }, [community, query, sortDir]);

  if (!community) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader subTitle="Community not found" back={{ href: "/", label: "Back" }} />
        <div className="container py-16 text-center text-muted-foreground">
          <p className="text-lg">Community &ldquo;{slug}&rdquo; not found.</p>
        </div>
      </div>
    );
  }

  function reset() {
    setQuery("");
    setSortDir("asc");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        subTitle={`${community.name} · ${community.cluster}`}
        back={{ href: "/", label: "Back to Saadiyat" }}
      />

      {/* Page intro */}
      <section className="border-b border-border bg-card/50">
        <div className="container py-6 sm:py-8">
          <div className="flex items-center gap-2 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
            <span className="h-px w-6 bg-primary/60" />
            {community.cluster}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] leading-tight text-foreground">
            {community.name}
            <span className="text-muted-foreground italic">
              {" "}— {community.totalPlots} plots.
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
            Click any plot to open its official DCR sheet. Each card links
            directly to the DMT-issued Development Control Regulation document.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="border-b border-border bg-background sticky top-0 z-20">
        <div className="container py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plot number…"
              className="w-56"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
            className="gap-1 text-muted-foreground"
          >
            {sortDir === "asc" ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            Plot #
          </Button>
          {query && (
            <Button variant="ghost" size="sm" onClick={reset} className="gap-1 text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          )}
          <span className="ml-auto text-[0.7rem] font-mono uppercase tracking-[0.16em] text-muted-foreground">
            {filtered.length} / {community.totalPlots} plots
          </span>
        </div>
      </section>

      {/* Plot grid */}
      <section className="container py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((plot) => (
            <SimplePlotCard
              key={plot.id}
              plot={plot}
              communityLabel={community.name}
              pdfUrl={pdfIndex.get(plot.villaKey) ?? null}
              pdfLoading={pdfLoading}
              listing={listingIndex.get(plot.villaKey) ?? null}
              community={community.slug}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No plots match your search.</p>
            <Button variant="outline" className="mt-4" onClick={reset}>
              Clear filter
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

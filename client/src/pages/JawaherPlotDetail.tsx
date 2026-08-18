/**
 * Jawaher Plot Detail — shows full transaction history timeline for a specific plot.
 * Matched by plot index (1-based, corresponding to SDN1_49 through SDN1_131).
 */
import { useParams, Link } from "wouter";
import { useMemo } from "react";
import SiteHeader from "@/components/SiteHeader";
import { COMMUNITIES } from "@/data/communities";
import { jawaherPlotHistories } from "@/data/jawaherTransactions";
import { getPlotLandArea } from "@/data/plotLandAreas";
import { useDcrPdfUrl } from "@/hooks/useDcrPdfUrl";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, FileText, TrendingUp, TrendingDown, Minus } from "lucide-react";

const COMMUNITY = COMMUNITIES.find((c) => c.slug === "jawaher")!;

export default function JawaherPlotDetail() {
  const params = useParams<{ plotId: string }>();
  const plotIndex = Number(params.plotId); // 1-based index
  const plot = useMemo(() => COMMUNITY.flatPlots?.[plotIndex - 1], [plotIndex]);
  const transactions = useMemo(() => {
    // Match by DCR land area instead of index
    const villaKey = plot?.villaKey;
    if (!villaKey) return [];
    const dcrArea = getPlotLandArea(villaKey);
    if (!dcrArea) return [];
    let best: typeof jawaherPlotHistories[0] | null = null;
    let bestDiff = Infinity;
    for (const ph of jawaherPlotHistories) {
      const diff = Math.abs(ph.landSqft - dcrArea.sqft);
      if (diff < bestDiff) { bestDiff = diff; best = ph; }
    }
    return best && bestDiff <= 100 ? best.transactions : [];
  }, [plot]);

  const dcrLand = plot ? getPlotLandArea(plot.villaKey) : null;
  const landSqft = dcrLand?.sqft ?? transactions[0]?.landSqft ?? null;
  const landSqm = landSqft ? (landSqft * 0.092903).toFixed(0) : null;

  const { url: pdfUrl } = useDcrPdfUrl(plot?.villaKey);

  if (!plot) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader subTitle="Plot not found" back={{ href: "/jawaher", label: "Back to Jawaher" }} />
        <div className="container py-24 text-center">
          <h1 className="font-display text-3xl text-foreground">Plot not found</h1>
          <p className="text-muted-foreground mt-2">No record exists for plot #{plotIndex}.</p>
          <Button asChild className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/jawaher">Browse all plots</Link>
          </Button>
        </div>
      </div>
    );
  }

  const plotNumber = plot.label.replace(/^Plot\s+/, "");
  const totalPlots = COMMUNITY.flatPlots?.length ?? 83;
  const prevId = plotIndex === 1 ? totalPlots : plotIndex - 1;
  const nextId = plotIndex === totalPlots ? 1 : plotIndex + 1;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle={`Plot ${plotNumber} · Jawaher`} back={{ href: "/jawaher", label: "All plots" }} />

      {/* Header */}
      <section className="border-b border-border bg-card/50">
        <div className="container py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-3 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
            <span className="h-px w-6 bg-primary/60" />
            Jawaher Saadiyat · Saadiyat Reserve · SDN1
          </div>
          <div className="flex items-baseline gap-5">
            <div className="font-display num-display text-[6rem] sm:text-[7.5rem] leading-none text-foreground">
              {plotNumber}
            </div>
            <div className="pb-3">
              <h1 className="font-display text-2xl sm:text-3xl text-foreground">
                {plot.label}
              </h1>
              <div className="font-mono text-xs text-muted-foreground mt-1">
                {plot.pdfFilename}
              </div>
              {landSqft && (
                <div className="mt-2 flex gap-4">
                  <div>
                    <div className="text-[0.6rem] uppercase tracking-wider font-mono text-muted-foreground">Land Area</div>
                    <div className="font-display text-lg text-foreground">{landSqft.toLocaleString()} sqft</div>
                  </div>
                  <div>
                    <div className="text-[0.6rem] uppercase tracking-wider font-mono text-muted-foreground">Land Area</div>
                    <div className="font-display text-lg text-foreground">{landSqm} m²</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 flex-wrap">
            {pdfUrl && (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" />
                  Open DCR PDF
                </a>
              </Button>
            )}
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link href={`/jawaher/plot/${prevId}`}>
                <ArrowLeft className="h-4 w-4" />
                Plot {prevId === 0 ? totalPlots : prevId}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link href={`/jawaher/plot/${nextId}`}>
                Plot {nextId}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Transaction History */}
      <section className="container py-10 sm:py-14">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-2">ADREC Records</div>
            <h2 className="font-display text-2xl sm:text-3xl text-foreground">
              Transaction History
            </h2>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Official Abu Dhabi real estate transaction records for this plot.
              Source: ad-transactions.com (ADREC public sales records, updated 16 Aug 2026).
            </p>
            <div className="mt-4 flex gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-primary/80" />
                Primary (developer)
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Secondary (resale)
              </div>
            </div>
            {transactions.length > 0 && (
              <div className="mt-4 p-3 rounded-md border border-border bg-card">
                <div className="text-[0.6rem] uppercase tracking-wider font-mono text-muted-foreground mb-1">Summary</div>
                <div className="text-sm text-foreground">
                  {transactions.length} recorded sale{transactions.length > 1 ? "s" : ""}
                </div>
                {(() => {
                  const firstPrimary = transactions.find(t => t.saleType === "primary");
                  const lastSecondary = [...transactions].reverse().find(t => t.saleType === "secondary");
                  if (firstPrimary && lastSecondary && lastSecondary.date > firstPrimary.date) {
                    const appreciation = ((lastSecondary.priceAed - firstPrimary.priceAed) / firstPrimary.priceAed) * 100;
                    return (
                      <div className={`text-sm font-mono mt-1 ${appreciation >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {appreciation >= 0 ? "+" : ""}{appreciation.toFixed(1)}% from primary to latest resale
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-8">
            {transactions.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-md">
                <div className="font-display text-xl text-foreground">No transactions recorded</div>
                <p className="text-sm text-muted-foreground mt-2">No ADREC sales data available for this plot.</p>
              </div>
            ) : (
              <div className="border border-border rounded-md overflow-hidden bg-card">
                <div className="divide-y divide-border">
                  {transactions.map((tx, i) => {
                    const fmtPrice = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(tx.priceAed);
                    const isPrimary = tx.saleType === "primary";
                    let changePercent: number | null = null;
                    if (i > 0) {
                      const prev = transactions[i - 1];
                      changePercent = ((tx.priceAed - prev.priceAed) / prev.priceAed) * 100;
                    }
                    return (
                      <div key={`${tx.date}-${i}`} className="px-4 py-4 flex items-start gap-4">
                        <div className="flex flex-col items-center pt-1">
                          <div className={`h-3 w-3 rounded-full ${isPrimary ? "bg-primary/80" : "bg-amber-500"}`} />
                          {i < transactions.length - 1 && <div className="w-px flex-1 bg-border mt-1 min-h-[20px]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-muted-foreground">{tx.date}</span>
                            <span className={`text-[0.6rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${
                              isPrimary
                                ? "text-primary border-primary/40 bg-primary/5"
                                : "text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/5"
                            }`}>
                              {isPrimary ? "Primary" : "Secondary"}
                            </span>
                            {changePercent !== null && (
                              <span className={`text-xs font-mono flex items-center gap-0.5 ${
                                changePercent > 0 ? "text-emerald-600 dark:text-emerald-400" :
                                changePercent < 0 ? "text-rose-600 dark:text-rose-400" :
                                "text-muted-foreground"
                              }`}>
                                {changePercent > 0 ? <TrendingUp className="h-3 w-3" /> :
                                 changePercent < 0 ? <TrendingDown className="h-3 w-3" /> :
                                 <Minus className="h-3 w-3" />}
                                {changePercent > 0 ? "+" : ""}{changePercent.toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 flex items-baseline gap-3 flex-wrap">
                            <span className="font-display text-lg sm:text-xl text-foreground">
                              AED {fmtPrice}
                            </span>
                            {tx.ratePerSqft && (
                              <span className="text-xs text-muted-foreground font-mono">
                                {tx.ratePerSqft.toLocaleString()} AED/sqft
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {tx.propertyType}{tx.bedrooms ? ` · ${tx.bedrooms} bed${tx.bedrooms !== 1 ? "s" : ""}` : ""}
                            {tx.areaSqft ? ` · ${tx.areaSqft.toLocaleString()} sqft BUA` : ""}
                            {tx.landSqft ? ` · ${tx.landSqft.toLocaleString()} sqft land` : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-border bg-card/60">
        <div className="container py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-muted-foreground">
          <div className="font-mono uppercase tracking-[0.18em]">Jawaher · Plot {plotNumber}</div>
          <div className="flex gap-3">
            <Link href="/jawaher" className="hover:text-foreground">All plots</Link>
            <span>·</span>
            <Link href="/" className="hover:text-foreground">Saadiyat home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

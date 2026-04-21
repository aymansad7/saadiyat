/**
 * Coastal Atelier — Villa detail page
 * Shows all DCR data for a single villa, an embedded PDF viewer, and a focused
 * mini-map highlighting only this plot. Three primary CTAs (PDF / Maps / Earth).
 */
import { useParams, Link } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { villas as ALL_VILLAS } from "@/data/villas";
import SiteHeader from "@/components/SiteHeader";
import PlotMap from "@/components/PlotMap";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, FileText, MapPin, Globe2, Copy, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";

export default function VillaDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const villa = useMemo(() => ALL_VILLAS.find((v) => v.id === id), [id]);
  const [pdfOpen, setPdfOpen] = useState(false);

  useEffect(() => {
    setPdfOpen(false);
  }, [id]);

  if (!villa) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader subTitle="Villa not found" back={{ href: "/st-regis", label: "Back to St. Regis" }} />
        <div className="container py-24 text-center">
          <h1 className="font-display text-3xl text-foreground">Villa not found</h1>
          <p className="text-muted-foreground mt-2">No record exists for villa #{id}.</p>
          <Button asChild className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/st-regis">Browse all villas</Link>
          </Button>
        </div>
      </div>
    );
  }

  const prevId = villa.id === 1 ? ALL_VILLAS.length : villa.id - 1;
  const nextId = villa.id === ALL_VILLAS.length ? 1 : villa.id + 1;
  const filteredIds = useMemo(() => new Set([villa.id]), [villa.id]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast(`${label} copied to clipboard`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader subTitle={`Villa ${villa.id} · ${villa.admPlotId}`} back={{ href: "/st-regis", label: "All villas" }} />

      {/* Header card */}
      <section className="border-b border-border bg-card/50">
        <div className="container py-8 sm:py-10 grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 lg:col-span-7">
            <div className="flex items-center gap-2 mb-3 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
              <span className="h-px w-6 bg-primary/60" />
              St. Regis Villas · Saadiyat Beach District
            </div>
            <div className="flex items-baseline gap-5">
              <div className="font-display num-display text-[6rem] sm:text-[7.5rem] leading-none text-foreground">
                {villa.id}
              </div>
              <div className="pb-3">
                <h1 className="font-display text-2xl sm:text-3xl text-foreground">
                  {villa.buildingTypology || "St. Regis Villa"}
                </h1>
                <div className="font-mono text-xs text-muted-foreground mt-1">
                  ADM {villa.admPlotId} · ALDAR {villa.aldarPlotId} · Zone {villa.mpZoneId}
                </div>
                <div className="font-mono text-xs text-muted-foreground mt-1 tabular">
                  {villa.latitude.toFixed(6)}° N, {villa.longitude.toFixed(6)}° E
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 flex-wrap">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <a href={villa.pdfLocalUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" />
                  Open DMT PDF
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-card gap-2">
                <a href={villa.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin className="h-4 w-4" />
                  Google Maps
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-card gap-2">
                <a href={villa.googleEarthUrl} target="_blank" rel="noopener noreferrer">
                  <Globe2 className="h-4 w-4" />
                  Google Earth
                </a>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground gap-2"
                onClick={() => copy(`${villa.latitude}, ${villa.longitude}`, "Coordinates")}
              >
                <Copy className="h-4 w-4" />
                Copy coords
              </Button>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="bg-card border border-border rounded-md p-3">
              <PlotMap
                villas={ALL_VILLAS}
                filteredIds={filteredIds}
                activeId={villa.id}
                onHover={() => {}}
                onSelect={() => {}}
                className="aspect-[10/8] w-full"
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <Button asChild variant="ghost" size="sm" className="gap-1.5">
                <Link href={`/st-regis/villa/${prevId}`}>
                  <ArrowLeft className="h-4 w-4" />
                  Villa {prevId}
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="gap-1.5">
                <Link href={`/st-regis/villa/${nextId}`}>
                  Villa {nextId}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="container py-10 sm:py-14">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-2">DCR Specifications</div>
            <h2 className="font-display text-2xl sm:text-3xl text-foreground">
              Plot regulations
            </h2>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Extracted from the official DMT GeoSmart Detailed Control Regulation (DCR) sheet.
              All measurements per WGS84 / UTM Zone 40N.
            </p>
          </div>

          <div className="col-span-12 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-px bg-border rounded-md overflow-hidden border border-border">
            <Spec label="Land use" value={villa.landUse} wide />
            <Spec label="Allocation" value={villa.landAllocation} />
            <Spec label="Typology" value={villa.buildingTypology} />
            <Spec label="Plot area" value={villa.plotAreaSqm ? `${villa.plotAreaSqm.toFixed(2)} m²` : "—"} numeric />
            <Spec label="Max GFA" value={villa.maxGfaSqm ? `${villa.maxGfaSqm.toFixed(0)} m²` : "—"} numeric />
            <Spec label="FAR" value={villa.far?.toString() ?? "—"} numeric />
            <Spec label="Coverage" value={villa.maxPlotCoverage || "—"} numeric />
            <Spec label="Max height" value={villa.maxBuildingHeightM ? `${villa.maxBuildingHeightM} m` : "—"} numeric />
            <Spec label="Floors" value={villa.maxFloors || "—"} />
            <Spec label="Permitted units" value={villa.maxPermittedUnits?.toString() ?? "—"} numeric />
            <Spec label="Population" value={villa.projectedPopulation?.toString() ?? "—"} numeric />
            <Spec label="Cluster" value={villa.mpZoneId} />
          </div>
        </div>
      </section>

      {/* PDF preview */}
      <section className="container pb-14">
        <div className="bg-card border border-border rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                DCR Sheet · SDN1_C6_{villa.id}.pdf
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => setPdfOpen((s) => !s)}>
                {pdfOpen ? "Hide preview" : "Show preview"}
              </Button>
              <Button size="sm" asChild variant="outline" className="bg-card gap-1.5">
                <a href={villa.pdfLocalUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </a>
              </Button>
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5">
                <a href={villa.pdfLocalUrl} download>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </Button>
            </div>
          </div>
          {pdfOpen && (
            <div className="aspect-[4/3] sm:aspect-[16/10] w-full bg-background">
              <iframe
                src={villa.pdfLocalUrl}
                title={`Villa ${villa.id} DCR PDF`}
                className="w-full h-full border-0"
              />
            </div>
          )}
        </div>
      </section>

      <footer className="mt-auto border-t border-border bg-card/60">
        <div className="container py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-muted-foreground">
          <div className="font-mono uppercase tracking-[0.18em]">Saadiyat · Villa {villa.id}</div>
          <div className="flex gap-3">
            <Link href="/st-regis" className="hover:text-foreground">All villas</Link>
            <span>·</span>
            <Link href="/" className="hover:text-foreground">Saadiyat home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Spec({ label, value, numeric, wide }: { label: string; value: string; numeric?: boolean; wide?: boolean }) {
  return (
    <div className={`p-4 bg-card ${wide ? "sm:col-span-2" : ""}`}>
      <div className="text-[0.62rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">{label}</div>
      <div className={`mt-1.5 ${numeric ? "font-display num-display tabular text-xl text-foreground" : "text-sm text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}

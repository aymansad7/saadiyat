/**
 * Coastal Atelier — Lagoons single-villa detail page
 *
 * Route: /saadiyat-lagoons/:cluster/:unit
 *
 * Shows full specs, position-type badge, the five nearest amenities with
 * distances, the two CTAs (Aldar portal + Google Maps), and a table of
 * all detail fields.
 */
import { Redirect, useParams, Link } from "wouter";
import { ArrowLeft, ExternalLink, MapPin, Tag } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { getLagoonsVilla } from "@/data/lagoons";
import { RESALE_BY_UNIT } from "@/data/lagoonsResale";

function fmtAed(n: number): string {
  return new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(n);
}

export default function LagoonsVillaDetail() {
  const params = useParams<{ cluster: string; unit: string }>();
  const unit = params.unit ? decodeURIComponent(params.unit) : "";
  const villa = unit ? getLagoonsVilla(unit) : undefined;
  if (!villa) return <Redirect to={`/saadiyat-lagoons/${params.cluster ?? ""}`} />;
  const resaleListings = RESALE_BY_UNIT[villa.unit_name] ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        subTitle={`Saadiyat Lagoons · ${villa.cluster_label} · ${villa.short_name}`}
        back={{
          href: `/saadiyat-lagoons/${villa.cluster}`,
          label: `Back to ${villa.cluster_label}`,
        }}
      />

      <section className="border-b border-border bg-card/50">
        <div className="container py-8 sm:py-10 grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 md:col-span-8">
            <div className="flex items-center gap-2 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
              <span className="h-px w-6 bg-primary/60" />
              {villa.cluster_label} · {villa.model ?? ""}
              {villa.variant ? ` · ${villa.variant}` : ""}
            </div>
            <h1 className="font-display text-4xl sm:text-[3rem] leading-tight text-foreground">
              Villa{" "}
              <span className="num-display">{villa.short_name}</span>
              {villa.is_corner && (
                <span className="ml-3 text-[0.75rem] align-middle uppercase tracking-[0.18em] font-mono text-primary border border-primary/60 bg-primary/5 px-2 py-1 rounded-sm">
                  Corner plot
                </span>
              )}
              {!villa.is_corner && villa.is_edge && (
                <span className="ml-3 text-[0.75rem] align-middle uppercase tracking-[0.18em] font-mono text-foreground border border-foreground/30 bg-foreground/5 px-2 py-1 rounded-sm">
                  Single-row
                </span>
              )}
              {resaleListings.length > 0 && (
                <span className="ml-3 text-[0.75rem] align-middle uppercase tracking-[0.18em] font-mono text-emerald-700 border border-emerald-600/60 bg-emerald-50 px-2 py-1 rounded-sm">
                  Available · Resale
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl font-mono">
              {villa.unit_name}
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 flex flex-wrap gap-2 md:justify-end">
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            >
              <a
                href={villa.detail_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Open on Aldar
              </a>
            </Button>
            <Button asChild variant="outline" className="bg-card gap-1.5">
              <a
                href={villa.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="h-4 w-4" />
                Google Maps
              </a>
            </Button>
          </div>
        </div>
      </section>

      {resaleListings.length > 0 && (
        <section className="border-b border-border bg-emerald-50/50">
          <div className="container py-6 sm:py-8">
            <div className="flex items-center gap-2 mb-3 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-emerald-700">
              <Tag className="h-3.5 w-3.5" />
              Resale availability · {resaleListings.length} listing{resaleListings.length === 1 ? "" : "s"} matched to this villa
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resaleListings.map((r) => (
                <div
                  key={r.code}
                  className="border border-emerald-200 rounded-md bg-white p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-emerald-700">
                        Code {r.code}
                      </div>
                      <div className="font-display text-2xl text-foreground mt-1 num-display tabular">
                        AED {fmtAed(r.sellingAed)}
                      </div>
                      {r.originalAed && r.originalAed !== r.sellingAed && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Original: AED {fmtAed(r.originalAed)}
                        </div>
                      )}
                    </div>
                    <span className="text-[0.62rem] uppercase tracking-[0.18em] font-mono px-2 py-1 rounded-sm border border-primary/40 text-primary bg-primary/5">
                      {r.specification} · {r.finish}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-[0.7rem]">
                    <ResRow label="Payment plan" value={r.paymentPlan} />
                    <ResRow label="Resale policy" value={r.resalePolicy} />
                    <ResRow label="Row" value={r.rowType} />
                    <ResRow label="Position" value={r.positionType} />
                    <ResRow label="POD" value={r.pod ? "Yes" : "No"} />
                    <ResRow label="Parking" value={`${r.parking} bays`} />
                    <ResRow label="Completion" value={r.completion} />
                    {r.note && <ResRow label="Note" value={r.note} />}
                  </dl>
                  <div className="mt-3 text-[0.65rem] text-muted-foreground leading-relaxed">
                    Match scope: this resale code is one of {r.candidateCount} candidate villa{r.candidateCount === 1 ? "" : "s"} in the same block. Confirm exact unit with the broker.
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container py-8 sm:py-10 grid grid-cols-12 gap-6">
        {/* Specs */}
        <div className="col-span-12 md:col-span-7 lg:col-span-8">
          <div className="mb-4 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
            <Tag className="h-3.5 w-3.5" />
            Specifications
          </div>
          <div className="border border-border rounded-md bg-card overflow-hidden">
            <dl className="divide-y divide-border">
              <Row label="Bedrooms" value={villa.bedrooms != null ? `${villa.bedrooms}` : "—"} />
              <Row label="Model" value={villa.model ?? "—"} />
              <Row label="Type" value={villa.type ?? "—"} />
              <Row label="Variant" value={villa.variant ?? "—"} />
              <Row label="Variant code" value={villa.variant_code ?? "—"} />
              <Row label="Mirror" value={villa.mirror === "MIRROR" ? "Yes" : "No"} />
              <Row
                label="Plot area"
                value={
                  villa.plot_area_sqm
                    ? `${Math.round(villa.plot_area_sqm)} m²`
                    : "—"
                }
              />
              <Row
                label="Saleable area"
                value={
                  villa.saleable_area_sqm
                    ? `${Math.round(villa.saleable_area_sqm)} m²`
                    : "—"
                }
              />
              <Row
                label="Suite area"
                value={
                  villa.suite_area_sqm
                    ? `${Math.round(villa.suite_area_sqm)} m²`
                    : "—"
                }
              />
              <Row
                label="Balcony area"
                value={
                  villa.balcony_area_sqm
                    ? `${villa.balcony_area_sqm.toFixed(2)} m²`
                    : "—"
                }
              />
              <Row label="Status" value={villa.status ?? "—"} />
              <Row
                label="Position"
                value={
                  villa.position_type === "unknown"
                    ? "Not located on map"
                    : villa.position_type === "corner"
                      ? "Corner plot"
                      : villa.position_type === "edge"
                        ? "Single-row / edge"
                        : "Interior"
                }
              />
              <Row
                label="Nearby villas (≤60 m)"
                value={String(villa.neighbour_count)}
              />
              <Row
                label="Floorplan available"
                value={villa.has_floorplan ? "Yes" : "No"}
              />
              <Row
                label="Unique view"
                value={villa.has_unique_view ? "Yes" : "No"}
              />
              <Row
                label="Premium"
                value={villa.is_premium ? "Yes" : "No"}
              />
            </dl>
          </div>
        </div>

        {/* Amenities */}
        <aside className="col-span-12 md:col-span-5 lg:col-span-4">
          <div className="mb-4 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
            <MapPin className="h-3.5 w-3.5" />
            Nearest amenities
          </div>
          <div className="border border-border rounded-md bg-card overflow-hidden">
            {villa.nearest_amenities.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">
                Distance data unavailable (this villa was not located on the
                community map).
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {villa.nearest_amenities.map((a) => (
                  <li key={a.name} className="p-4 flex items-center justify-between gap-3">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 flex-1 group"
                    >
                      <div className="font-display text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {a.name}
                      </div>
                      <div className="text-[0.65rem] uppercase tracking-[0.16em] font-mono text-muted-foreground mt-0.5">
                        Tap to open on Aldar
                      </div>
                    </a>
                    <div className="font-display num-display tabular text-xl text-foreground shrink-0">
                      {a.distance_m}
                      <span className="font-mono text-[0.65rem] text-muted-foreground ml-1">
                        m
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 p-4 border border-border rounded-md bg-card/60 text-xs text-muted-foreground leading-relaxed">
            Distances are straight-line measurements on the official Aldar
            master plan, converted to metres at ~1.3 px/m. They are useful
            for relative comparison between villas, not for legal purposes.
          </div>

          <div className="mt-6">
            <Link
              href={`/saadiyat-lagoons/${villa.cluster}`}
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All {villa.cluster_label} villas
            </Link>
          </div>
        </aside>
      </section>

      <footer className="mt-auto border-t border-border bg-card/60">
        <div className="container py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-muted-foreground">
          <div className="font-mono uppercase tracking-[0.18em]">
            Saadiyat · Saadiyat Lagoons · {villa.cluster_label} ·{" "}
            {villa.short_name}
          </div>
          <div>Source: Aldar · world.aldar.com/uae/abudhabi/lagoons</div>
        </div>
      </footer>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-12 px-4 sm:px-5 py-3 gap-3">
      <dt className="col-span-5 sm:col-span-4 text-[0.72rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
        {label}
      </dt>
      <dd className="col-span-7 sm:col-span-8 font-mono text-sm text-foreground tabular">
        {value}
      </dd>
    </div>
  );
}

function ResRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-foreground tabular">{value}</dd>
    </>
  );
}

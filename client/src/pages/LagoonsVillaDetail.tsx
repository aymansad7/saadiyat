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
import { ArrowLeft, ExternalLink, MapPin, Tag, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { getLagoonsVilla } from "@/data/lagoons";
import { RESALE_BY_UNIT } from "@/data/lagoonsResale";
import { ResaleCard } from "@/components/ResaleCard";

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

      {/* Live resale listings (from Aldar Resale ALL workbook) */}
      <section className="border-b border-border">
        <div className="container py-6 sm:py-8">
          <ResaleCard
            unitNames={[
              villa.unit_name,
              villa.aldar_data?.aldar_unit_name ?? "",
            ].filter(Boolean)}
          />
        </div>
      </section>

      {villa.aldar_data && (
        <section className="border-b border-border bg-gradient-to-br from-primary/5 to-card/60">
          <div className="container py-8 sm:py-10">
            <div className="flex items-center gap-2 mb-5 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Key facts
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KeyFact
                label="Villa"
                value={villa.short_name}
                accent
              />
              {villa.aldar_data.selling_price_aed != null && (
                <KeyFact
                  label="Original price (without add-ons)"
                  value={`AED ${fmtAed(villa.aldar_data.selling_price_aed)}`}
                  accent
                  wide
                />
              )}
              {villa.aldar_data.plot_area_sqm != null && (
                <KeyFact
                  label="Plot area"
                  value={`${villa.aldar_data.plot_area_sqm.toFixed(2)} m²`}
                />
              )}
              {villa.aldar_data.total_area_sqm != null && (
                <KeyFact
                  label="Total built-up area"
                  value={`${villa.aldar_data.total_area_sqm.toFixed(2)} m²`}
                />
              )}
              {villa.aldar_data.mandatory_premium != null && (
                <KeyFact
                  label="Premium finishing"
                  value={villa.aldar_data.mandatory_premium ? "Yes" : "No"}
                />
              )}
              {villa.aldar_data.unit_finishes && (
                <KeyFact
                  label="Finishing tone"
                  value={villa.aldar_data.unit_finishes}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {villa.aldar_data && (
        <section className="border-b border-border bg-card/40">
          <div className="container py-6 sm:py-8">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Aldar inventory record
              </div>
              {villa.aldar_data.aldar_link && (
                <a
                  href={villa.aldar_data.aldar_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.18em] font-mono text-primary hover:underline"
                >
                  Aldar deep link <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {villa.aldar_data.aldar_unit_name && (
                <AldarStat label="Aldar Unit Name" value={villa.aldar_data.aldar_unit_name} mono />
              )}
              {villa.aldar_data.project_name && (
                <AldarStat label="Project" value={villa.aldar_data.project_name} />
              )}
              {villa.aldar_data.building_section && (
                <AldarStat label="Building Section" value={villa.aldar_data.building_section} mono />
              )}
              {villa.aldar_data.status && (
                <AldarStat label="Status" value={villa.aldar_data.status} />
              )}
              {villa.aldar_data.property_status && (
                <AldarStat label="Property Status" value={villa.aldar_data.property_status} />
              )}
              {villa.aldar_data.inventory_category && (
                <AldarStat label="Inventory Category" value={villa.aldar_data.inventory_category} />
              )}
              {villa.aldar_data.unit_type && (
                <AldarStat label="Unit Type" value={villa.aldar_data.unit_type} />
              )}
              {villa.aldar_data.unit_category && (
                <AldarStat label="Unit Category" value={villa.aldar_data.unit_category} />
              )}

              {villa.aldar_data.reservation_amount != null && (
                <AldarStat label="Reservation" value={`AED ${fmtAed(villa.aldar_data.reservation_amount)}`} />
              )}
              {villa.aldar_data.online_reservation_fee != null && (
                <AldarStat label="Online reservation" value={`AED ${fmtAed(villa.aldar_data.online_reservation_fee)}`} />
              )}
              {villa.aldar_data.saleable_area_sqm != null && (
                <AldarStat label="Saleable area (Aldar)" value={`${villa.aldar_data.saleable_area_sqm.toFixed(2)} m²`} />
              )}
              {villa.aldar_data.terrace_area_sqm != null && (
                <AldarStat label="Terrace" value={`${villa.aldar_data.terrace_area_sqm.toFixed(2)} m²`} />
              )}
              {villa.aldar_data.car_parks != null && (
                <AldarStat label="Car parks" value={`${villa.aldar_data.car_parks}`} />
              )}
              {villa.aldar_data.service_charges_aed_sqm != null && (
                <AldarStat label="Service charges" value={`AED ${villa.aldar_data.service_charges_aed_sqm}/m²`} />
              )}
              {villa.aldar_data.service_charge_escalation_pct != null && (
                <AldarStat label="SC escalation" value={`${villa.aldar_data.service_charge_escalation_pct}%`} />
              )}
              {villa.aldar_data.mandatory_pool != null && (
                <AldarStat label="Mandatory pool" value={villa.aldar_data.mandatory_pool ? "Yes" : "No"} />
              )}
              {villa.aldar_data.darna_applicable != null && (
                <AldarStat label="Darna applicable" value={villa.aldar_data.darna_applicable ? "Yes" : "No"} />
              )}
              {villa.aldar_data.virtual_tour && (
                <AldarStat
                  label="Virtual tour"
                  value={
                    <a
                      href={villa.aldar_data.virtual_tour}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Open
                    </a>
                  }
                />
              )}
              {villa.aldar_data.features_spec && (
                <AldarStat label="Features / spec" value={villa.aldar_data.features_spec} wide />
              )}
            </div>
            <div className="mt-3 text-[0.62rem] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              Source: Aldar inventory export · 1,549 units matched 1-on-1 by cluster + bedrooms
            </div>
          </div>
        </section>
      )}

      {villa.aldar_data?.payment_plans && villa.aldar_data?.selling_price_aed != null && (
        <PaymentSchedule
          rawPlans={villa.aldar_data.payment_plans}
          basePrice={villa.aldar_data.selling_price_aed}
        />
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

type ParsedPlan = {
  name: string;
  discountPct: number;
  installments: { label: string; pct: number }[];
};

function parsePaymentPlans(raw: string): ParsedPlan[] {
  return raw
    .split("|||")
    .map(s => s.trim())
    .filter(Boolean)
    .map(plan => {
      // "100 (Standard) Disc:5% => Upon Signing SPA: 100%"
      const [headerRaw, bodyRaw = ""] = plan.split("=>").map(s => s.trim());
      const discMatch = headerRaw.match(/Disc:\s*(\d+(?:\.\d+)?)%/i);
      const discountPct = discMatch ? parseFloat(discMatch[1]) : 0;
      const name = headerRaw.replace(/Disc:.*$/i, "").trim();
      const installments = bodyRaw
        .split(",")
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => {
          const m = part.match(/^(.*?):\s*(\d+(?:\.\d+)?)%$/);
          if (!m) return null;
          return { label: m[1].trim(), pct: parseFloat(m[2]) };
        })
        .filter((x): x is { label: string; pct: number } => Boolean(x));
      return { name, discountPct, installments };
    })
    .filter(p => p.installments.length > 0);
}

function PaymentSchedule({
  rawPlans,
  basePrice,
}: {
  rawPlans: string;
  basePrice: number;
}) {
  const plans = parsePaymentPlans(rawPlans);
  if (plans.length === 0) return null;
  return (
    <section className="border-b border-border bg-card/40">
      <div className="container py-6 sm:py-8">
        <div className="flex items-center gap-2 mb-4 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Payment plans
        </div>
        <div className="text-[0.7rem] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-4">
          Calculated on original price (without add-ons): AED {fmtAed(basePrice)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {plans.map((plan, idx) => {
            const effectivePrice = basePrice * (1 - plan.discountPct / 100);
            return (
              <div
                key={idx}
                className="rounded-md border border-border bg-card overflow-hidden flex flex-col"
              >
                <div className="px-4 py-3 border-b border-border bg-primary/5">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-display text-lg text-foreground">
                      Plan {plan.name}
                    </div>
                    {plan.discountPct > 0 && (
                      <div className="text-[0.65rem] uppercase tracking-[0.18em] font-mono text-primary">
                        {plan.discountPct}% discount
                      </div>
                    )}
                  </div>
                  {plan.discountPct > 0 && (
                    <div className="mt-1 text-[0.7rem] font-mono text-muted-foreground">
                      Effective price: AED {fmtAed(effectivePrice)}
                    </div>
                  )}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[0.65rem] uppercase tracking-[0.16em] font-mono text-muted-foreground border-b border-border">
                      <th className="px-4 py-2 font-medium">Milestone</th>
                      <th className="px-3 py-2 font-medium text-right">%</th>
                      <th className="px-4 py-2 font-medium text-right">Amount (AED)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {plan.installments.map((inst, i) => (
                      <tr key={i} className="hover:bg-primary/5">
                        <td className="px-4 py-2 text-foreground">{inst.label}</td>
                        <td className="px-3 py-2 text-right tabular num-display">
                          {inst.pct}%
                        </td>
                        <td className="px-4 py-2 text-right tabular num-display">
                          {fmtAed(effectivePrice * (inst.pct / 100))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-card/60">
                      <td className="px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
                        Total
                      </td>
                      <td className="px-3 py-2 text-right tabular num-display font-medium">
                        {plan.installments.reduce((s, i) => s + i.pct, 0).toFixed(0)}%
                      </td>
                      <td className="px-4 py-2 text-right tabular num-display font-medium">
                        {fmtAed(effectivePrice)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function KeyFact({
  label,
  value,
  accent = false,
  wide = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-md p-4 sm:p-5 border ${
        accent
          ? "bg-primary/10 border-primary/30"
          : "bg-card border-border"
      } ${wide ? "col-span-2 lg:col-span-2" : ""}`}
    >
      <div className="text-[0.6rem] uppercase tracking-[0.18em] font-mono text-muted-foreground leading-snug">
        {label}
      </div>
      <div
        className={`mt-1.5 font-display tabular text-foreground ${
          accent ? "text-2xl sm:text-3xl num-display" : "text-lg sm:text-xl"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function AldarStat({
  label,
  value,
  mono = false,
  highlight = false,
  wide = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  highlight?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={`border border-border rounded-md bg-card p-3 sm:p-4 ${
        wide ? "md:col-span-3" : ""
      } ${highlight ? "ring-1 ring-primary/40" : ""}`}
    >
      <div className="text-[0.62rem] uppercase tracking-[0.16em] font-mono text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 text-sm text-foreground ${
          mono ? "font-mono" : "font-display"
        } ${highlight ? "text-2xl num-display tabular" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

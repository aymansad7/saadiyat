/**
 * /aldar-other/:project/:building/:unit   (MASTER ONLY)
 *
 * Unit detail page mirroring AldarUnit (Saadiyat): hero with original price,
 * status, key facts; payment plan cards; full record table.
 */
import { useParams, Link } from "wouter";
import { ExternalLink, Sparkles, Tag, Lock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Skeleton } from "@/components/ui/skeleton";
import MasterGate from "@/components/MasterGate";
import { trpc } from "@/lib/trpc";
import { fmtAed, shortUnitNumber, fmtArea } from "@/data/aldar/format";
import { AldarStatusBadge } from "@/components/AldarStatusBadge";
import { parsePaymentPlans } from "./AldarUnit";
import { ResaleCard } from "@/components/ResaleCard";
import { UnitTimeline } from "@/components/UnitTimeline";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  EditListingButton,
  ListingBadge,
  ListingPriceLabel,
} from "@/components/ListingControls";

function Inner() {
  const params = useParams<{ project: string; building: string; unit: string }>();
  const unitName = params.unit ? decodeURIComponent(params.unit) : "";

  const ctxq = trpc.aldarOther.getUnit.useQuery(
    {
      projectSlug: params.project ?? "",
      buildingSlug: params.building ?? "",
      unitName,
    },
    { enabled: !!params.project && !!params.building && !!unitName },
  );

  const villaKey =
    params.project && params.building && unitName
      ? `aldar-other/${params.project}/${params.building}/${unitName}`
      : "";
  const listingQuery = trpc.villaListings.byKey.useQuery(
    { villaKey },
    { enabled: Boolean(villaKey), staleTime: 60_000 },
  );
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "master";
  const listing = listingQuery.data as
    | {
        askingPriceAed: number | null;
        status:
          | "draft"
          | "available"
          | "warm"
          | "reserved"
          | "sold"
          | "off-market"
          | null;
        listingPartners: string | null;
        publicNotes: string | null;
        ownerName?: string | null;
        ownerPhone?: string | null;
        ownerEmail?: string | null;
        internalNotes?: string | null;
      }
    | null
    | undefined;

  if (ctxq.isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader subTitle="Aldar · Other" />
        <main className="container py-10 space-y-4">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-40 w-full" />
        </main>
      </div>
    );
  }

  if (!ctxq.data) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader subTitle="Aldar · Other" />
        <main className="container py-16 text-center text-muted-foreground">
          Unit not found.{" "}
          <Link href={`/aldar-other/${params.project ?? ""}`} className="underline">
            Back to project
          </Link>
          .
        </main>
      </div>
    );
  }

  const { project, building, unit } = ctxq.data;
  const plans = unit.payment_plans ? parsePaymentPlans(unit.payment_plans) : [];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        subTitle={`${project.name} · ${building.name}`}
        back={{
          href: `/aldar-other/${project.slug}/${building.slug}`,
          label: `Back to ${building.name}`,
        }}
      />
      {/* HERO: Key facts */}
      <section className="border-b border-border bg-card/40">
        <div className="container py-8 sm:py-10 grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 md:col-span-8">
            <div className="flex items-center gap-2 mb-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-rose-600 dark:text-rose-300">
              <Lock className="h-3.5 w-3.5" />
              Master-only · {project.name} · {building.name}
            </div>
            <div className="flex items-baseline gap-4 flex-wrap">
              <h1 className="font-display text-4xl sm:text-[3.2rem] leading-none text-foreground">
                Unit <span className="num-display">{shortUnitNumber(unit.unit_name)}</span>
              </h1>
              <AldarStatusBadge status={unit.status} />
            </div>
            <div className="mt-2 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted-foreground">
              {unit.unit_name}
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <KeyFact
                label="Original price (without add-ons)"
                value={`AED ${fmtAed(unit.price_aed)}`}
                primary
              />
              <KeyFact label="Bedrooms" value={unit.bedrooms ? `${unit.bedrooms}` : "—"} />
              <KeyFact label="Type" value={unit.unit_model ?? unit.unit_category ?? "—"} />
              <KeyFact label="Plot area" value={fmtArea(unit.plot_area_sqm)} />
              <KeyFact
                label="Total / BUA"
                value={fmtArea(unit.total_area_sqm ?? unit.saleable_area_sqm)}
              />
              <KeyFact label="Terrace" value={fmtArea(unit.terrace_area_sqm)} />
              {unit.mandatory_premium != null && (
                <KeyFact
                  label="Premium finishing"
                  value={unit.mandatory_premium ? "Yes" : "No"}
                />
              )}
              {unit.unit_finishes && (
                <KeyFact label="Finishing tones" value={unit.unit_finishes} />
              )}
              {unit.car_parks != null && (
                <KeyFact label="Car parks" value={`${unit.car_parks}`} />
              )}
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 space-y-3">
            {unit.aldar_link && (
              <a
                href={unit.aldar_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md border border-primary/40 bg-primary/5 px-4 py-3 text-primary hover:bg-primary/10 transition-colors"
              >
                <div className="text-[0.65rem] uppercase tracking-[0.22em] font-mono">
                  Aldar deep link
                </div>
                <div className="font-display text-base flex items-center gap-2">
                  Open on world.aldar.com <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </a>
            )}
            {unit.virtual_tour && (
              <a
                href={unit.virtual_tour}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md border border-border bg-card px-4 py-3 hover:border-primary/40 transition-colors"
              >
                <div className="text-[0.65rem] uppercase tracking-[0.22em] font-mono text-muted-foreground">
                  Virtual tour
                </div>
                <div className="font-display text-base flex items-center gap-2 text-foreground">
                  Open viewer <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Resale listing card (admin manages, public sees price/status) */}
      <section className="border-b border-border bg-background">
        <div className="container py-6 sm:py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[0.65rem] uppercase tracking-[0.22em] font-mono text-muted-foreground mb-2">
                Resale listing
              </div>
              {listing ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ListingBadge status={listing.status ?? null} />
                    {listing.askingPriceAed ? (
                      <ListingPriceLabel
                        askingPriceAed={listing.askingPriceAed}
                        className="text-emerald-600 dark:text-emerald-400 text-base"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">No asking price set</span>
                    )}
                  </div>
                  {listing.listingPartners && (
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Listed with {listing.listingPartners}
                    </div>
                  )}
                  {listing.publicNotes && (
                    <div className="text-sm text-foreground/80 max-w-2xl">{listing.publicNotes}</div>
                  )}
                  {isAdmin && (listing.ownerName || listing.ownerPhone || listing.ownerEmail) && (
                    <div className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs space-y-0.5">
                      <div className="font-mono uppercase tracking-wider text-amber-700 dark:text-amber-300">Owner (internal — admin only)</div>
                      {listing.ownerName && <div>Name: <span className="font-medium">{listing.ownerName}</span></div>}
                      {listing.ownerPhone && <div>Phone: <span className="font-medium">{listing.ownerPhone}</span></div>}
                      {listing.ownerEmail && <div>Email: <span className="font-medium">{listing.ownerEmail}</span></div>}
                    </div>
                  )}
                  {isAdmin && listing.internalNotes && (
                    <div className="mt-1 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs">
                      <div className="font-mono uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-1">Internal notes</div>
                      <div className="whitespace-pre-wrap">{listing.internalNotes}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No resale listing yet.</div>
              )}
            </div>
            <EditListingButton
              villaKey={villaKey}
              community="aldar-other"
              villaLabel={`${project.name} · ${building.name} · ${unit.unit_name}`}
            />
          </div>
        </div>
      </section>

      {/* Resale with Aldar */}
      {unit.unit_name && (
        <section className="border-b border-border">
          <div className="container py-6 sm:py-8">
            <ResaleCard unitNames={[unit.unit_name]} />
          </div>
        </section>
      )}

      {/* Availability history / timeline */}
      {unit.unit_name && (
        <section className="border-b border-border bg-card/20">
          <div className="container py-6 sm:py-8">
            <UnitTimeline unitName={unit.unit_name} />
          </div>
        </section>
      )}

      {/* Payment plans */}
      {plans.length > 0 && unit.price_aed != null && (
        <section className="border-b border-border bg-card/30">
          <div className="container py-6 sm:py-8">
            <div className="flex items-center gap-2 mb-4 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
              <Tag className="h-3.5 w-3.5" />
              Payment plans
            </div>
            <div className="text-[0.7rem] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-4">
              Calculated on original price (without add-ons): AED {fmtAed(unit.price_aed)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {plans.map((plan, idx) => {
                const eff = (unit.price_aed ?? 0) * (1 - plan.discountPct / 100);
                return (
                  <div key={idx} className="rounded-md border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-primary/5">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="font-display text-lg text-foreground">{plan.name}</div>
                        {plan.discountPct > 0 && (
                          <div className="text-[0.65rem] uppercase tracking-[0.18em] font-mono text-primary">
                            {plan.discountPct}% discount
                          </div>
                        )}
                      </div>
                      {plan.discountPct > 0 && (
                        <div className="mt-1 text-[0.7rem] font-mono text-muted-foreground">
                          Effective price: AED {fmtAed(eff)}
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
                            <td className="px-3 py-2 text-right num-display">{inst.pct}%</td>
                            <td className="px-4 py-2 text-right num-display">
                              {fmtAed(eff * (inst.pct / 100))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-border bg-card/60">
                          <td className="px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
                            Total
                          </td>
                          <td className="px-3 py-2 text-right num-display font-medium">
                            {plan.installments.reduce((s, i) => s + i.pct, 0).toFixed(0)}%
                          </td>
                          <td className="px-4 py-2 text-right num-display font-medium">
                            {fmtAed(eff)}
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
      )}

      {/* Full details */}
      <section className="container py-8 sm:py-10">
        <div className="mb-4 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Full record
        </div>
        <div className="border border-border rounded-md bg-card overflow-hidden">
          <dl className="divide-y divide-border">
            <Row label="Aldar Unit Name" value={unit.unit_name ?? "—"} mono />
            <Row label="Building Section" value={building.name} mono />
            <Row label="Project" value={project.name} />
            <Row label="Unit Type" value={unit.unit_type ?? "—"} />
            <Row label="Unit Category" value={unit.unit_category ?? "—"} />
            <Row label="Unit Model" value={unit.unit_model ?? "—"} />
            <Row label="Bedrooms" value={unit.bedrooms ?? "—"} />
            <Row label="Status" value={unit.status ?? "—"} />
            <Row label="Property Status" value={unit.property_status ?? "—"} />
            <Row label="Inventory Category" value={unit.inventory_category ?? "—"} />
            <Row
              label="Original price (without add-ons)"
              value={`AED ${fmtAed(unit.price_aed)}`}
            />
            <Row
              label="Reservation Amount"
              value={unit.reservation_amount != null ? `AED ${fmtAed(unit.reservation_amount)}` : "—"}
            />
            <Row
              label="Online Reservation Fee"
              value={
                unit.online_reservation_fee != null
                  ? `AED ${fmtAed(unit.online_reservation_fee)}`
                  : "—"
              }
            />
            <Row label="Plot Area" value={fmtArea(unit.plot_area_sqm)} />
            <Row label="Saleable Area" value={fmtArea(unit.saleable_area_sqm)} />
            <Row label="Total Area / BUA" value={fmtArea(unit.total_area_sqm)} />
            <Row label="Terrace Area" value={fmtArea(unit.terrace_area_sqm)} />
            <Row label="Balcony Area" value={fmtArea(unit.balcony_area_sqm)} />
            <Row
              label="Car Parks"
              value={unit.car_parks != null ? String(unit.car_parks) : "—"}
            />
            <Row
              label="Service Charges"
              value={
                unit.service_charge_aed_sqm != null
                  ? `AED ${unit.service_charge_aed_sqm}/m²`
                  : "—"
              }
            />
            <Row
              label="SC Escalation"
              value={
                unit.service_charge_escalation_pct != null
                  ? `${unit.service_charge_escalation_pct}%`
                  : "—"
              }
            />
            <Row label="Finishing tones" value={unit.unit_finishes ?? "—"} />
            <Row
              label="Premium finishing"
              value={unit.mandatory_premium == null ? "—" : unit.mandatory_premium ? "Yes" : "No"}
            />
            <Row
              label="Mandatory Pool"
              value={unit.mandatory_pool == null ? "—" : unit.mandatory_pool ? "Yes" : "No"}
            />
            <Row
              label="Darna Applicable"
              value={unit.darna_applicable == null ? "—" : unit.darna_applicable ? "Yes" : "No"}
            />
            <Row label="Features / Spec" value={unit.features_spec ?? "—"} />
          </dl>
        </div>
      </section>
    </div>
  );
}

function KeyFact({
  label,
  value,
  primary = false,
}: {
  label: string;
  value: string;
  primary?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-3 ${primary ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}
    >
      <div className="text-[0.62rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 font-display ${primary ? "text-2xl text-primary" : "text-lg text-foreground"} num-display`}
      >
        {value}
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-12 gap-3 px-4 py-2 hover:bg-primary/5">
      <dt className="col-span-5 sm:col-span-4 text-[0.7rem] uppercase tracking-[0.18em] font-mono text-muted-foreground">
        {label}
      </dt>
      <dd className={`col-span-7 sm:col-span-8 text-sm text-foreground ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

export default function AldarOtherUnit() {
  return (
    <MasterGate>
      <Inner />
    </MasterGate>
  );
}

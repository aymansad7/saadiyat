/**
 * Coastal Atelier — Lagoons villa card.
 *
 * Compact card listing one Saadiyat Lagoons villa with: bedroom count,
 * plot/saleable area, position-type badge (corner / edge / interior),
 * and two CTAs (Aldar portal + Google Maps).
 *
 * Visual language matches SimplePlotCard / VillaCard: 8px radius, hairline
 * border, Fraunces numerals, mono labels, terracotta accents.
 */
import { Link } from "wouter";
import { ArrowUpRight, ExternalLink, MapPin } from "lucide-react";
import type { LagoonsVilla } from "@/data/lagoons";

interface Props {
  villa: LagoonsVilla;
}

function positionBadge(villa: LagoonsVilla): { label: string; cls: string } | null {
  if (villa.position_type === "corner") {
    return {
      label: "Corner",
      cls: "border-primary/60 text-primary bg-primary/5",
    };
  }
  if (villa.position_type === "edge") {
    return {
      label: "Single-row",
      cls: "border-foreground/30 text-foreground bg-foreground/5",
    };
  }
  return null;
}

export default function LagoonsVillaCard({ villa }: Props) {
  const badge = positionBadge(villa);
  const detailHref = `/saadiyat-lagoons/${villa.cluster}/${encodeURIComponent(villa.unit_name)}`;

  return (
    <div className="villa-card group bg-card border border-border rounded-md overflow-hidden flex flex-col rise-in hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-22px_rgba(34,30,25,0.4)] transition-all">
      <Link href={detailHref} className="block p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                {villa.cluster_label}
              </span>
              {badge && (
                <span
                  className={[
                    "text-[0.58rem] uppercase tracking-[0.16em] font-mono px-1.5 py-0.5 rounded-sm border leading-none",
                    badge.cls,
                  ].join(" ")}
                >
                  {badge.label}
                </span>
              )}
            </div>
            <div className="font-display num-display text-[2rem] leading-none text-foreground mt-1.5 group-hover:text-primary transition-colors">
              {villa.short_name}
            </div>
            <div className="font-display text-sm text-foreground/90 mt-1">
              {villa.bedrooms ?? "—"}-BR Villa
              {villa.variant ? (
                <span className="text-muted-foreground font-normal"> · {villa.variant}</span>
              ) : null}
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
        <dl className="font-mono text-[0.7rem] text-muted-foreground mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.16em]">Plot</div>
            <div className="tabular text-foreground text-sm">
              {villa.plot_area_sqm ? `${Math.round(villa.plot_area_sqm)} m²` : "—"}
            </div>
          </div>
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.16em]">Saleable</div>
            <div className="tabular text-foreground text-sm">
              {villa.saleable_area_sqm
                ? `${Math.round(villa.saleable_area_sqm)} m²`
                : "—"}
            </div>
          </div>
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.16em]">Status</div>
            <div className="tabular text-foreground text-sm">{villa.status ?? "—"}</div>
          </div>
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.16em]">Mirror</div>
            <div className="tabular text-foreground text-sm">
              {villa.mirror === "MIRROR" ? "Yes" : "No"}
            </div>
          </div>
        </dl>
      </Link>

      <div className="px-4 sm:px-5 pb-4 sm:pb-5 mt-auto">
        <div className="divider-rule mb-3" />
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={villa.detail_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sm border bg-primary text-primary-foreground border-primary hover:bg-primary/90"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Aldar portal
          </a>
          <a
            href={villa.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sm border bg-card text-foreground border-border hover:bg-secondary hover:border-primary/30"
            onClick={(e) => e.stopPropagation()}
          >
            <MapPin className="h-3.5 w-3.5" />
            Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}

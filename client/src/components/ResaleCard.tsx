/**
 * Renders the "Resale with Aldar" panel on a unit/villa detail page.
 *
 * Pass the inventory keys you want to look up (we accept multiple because
 * Lagoons villas have both a `unit_name` and an `aldar_unit_name`). Hidden
 * unless at least one matching resale row is visible to the current user.
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

function fmtAed(n: number | null | undefined) {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(n);
}

export function ResaleCard({ unitNames }: { unitNames: string[] }) {
  const { isAuthenticated } = useAuth();
  const keys = unitNames.filter(Boolean);
  const { data, isLoading } = trpc.resale.forUnit.useQuery(
    { unitNames: keys },
    { enabled: isAuthenticated && keys.length > 0 },
  );
  if (!isAuthenticated) return null;
  if (isLoading) return null;
  const items = data?.items ?? [];
  if (items.length === 0) return null;

  return (
    <Card className="bg-amber-50/60 border-amber-200/60 p-5 sm:p-6">
      <div className="flex items-baseline gap-3">
        <div className="text-[11px] uppercase tracking-[0.2em] text-amber-900/80">
          Resale with Aldar
        </div>
        <div className="text-[11px] text-amber-900/60">
          {items.length} listing{items.length === 1 ? "" : "s"}
        </div>
      </div>
      <div className="mt-3 space-y-3">
        {items.map(item => {
          const price = fmtAed(item.asking_price_aed);
          return (
            <div
              key={`${item.property_id}-${item.unit_number}`}
              className="rounded-lg border border-amber-200/70 bg-white/80 p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-serif text-2xl text-foreground">
                  {price ? `AED ${price}` : "Price on request"}
                </div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider">
                  {item.is_resale ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">
                      Resale
                    </span>
                  ) : null}
                  {item.off_plan ? (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-800">
                      Off-plan
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {[item.unit_type, item.bedrooms ? `${item.bedrooms} BHK` : null, item.saleable_area_sqft ? `${item.saleable_area_sqft} sqft` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
              <div className="mt-1 text-xs text-muted-foreground/80">
                {item.unit_number} · {item.community_location}
                {item.project_resale_name ? ` · ${item.project_resale_name}` : ""}
              </div>
              {item.aldar_url ? (
                <div className="mt-2">
                  <a
                    href={item.aldar_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-900 underline-offset-2 hover:underline"
                  >
                    View on aldar.com →
                  </a>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

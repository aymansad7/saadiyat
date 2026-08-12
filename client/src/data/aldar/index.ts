/**
 * Aldar Saadiyat types and utility functions.
 * Data is now served via tRPC (trpc.aldarSaadiyat.*) instead of bundled JSON.
 * This file only exports types and pure utility functions.
 */

export type AldarUnit = {
  unit_name: string | null;
  aldar_link: string | null;
  unit_type: string | null;
  unit_category: string | null;
  unit_model: string | null;
  bedrooms: string | null;
  total_rooms: string | null;
  status: string | null;
  price_aed: number | null;
  reservation_amount: number | null;
  online_reservation_fee: number | null;
  plot_area_sqm: number | null;
  saleable_area_sqm: number | null;
  total_area_sqm: number | null;
  terrace_area_sqm: number | null;
  balcony_area_sqm: number | null;
  service_charge_aed_sqm: number | null;
  service_charge_escalation_pct: number | null;
  car_parks: number | null;
  unit_finishes: string | null;
  features_spec: string | null;
  inventory_category: string | null;
  property_status: string | null;
  mandatory_pool: boolean | null;
  mandatory_premium: boolean | null;
  darna_applicable: boolean | null;
  virtual_tour: string | null;
  payment_plans: string | null;
  building_section: string | null;
  project_field: string | null;
};

export type AldarBuilding = {
  slug: string;
  name: string;
  unit_count: number;
  available_count: number;
  units: AldarUnit[];
};

export type AldarProject = {
  slug: string;
  name: string;
  source_file: string;
  unit_count: number;
  available_count: number;
  building_count: number;
  buildings: AldarBuilding[];
};

export type AldarDataset = {
  exported_at: string;
  project_count: number;
  total_units: number;
  total_available: number;
  projects: AldarProject[];
};

export function isAvailable(status: string | null | undefined): boolean {
  return (status ?? "").toLowerCase() === "available";
}

export function statusTone(
  status: string | null | undefined,
): "available" | "sold" | "reserved" | "other" {
  const s = (status ?? "").toLowerCase();
  if (s === "available" || s === "new") return "available";
  if (s === "sold") return "sold";
  if (s === "booked" || s === "blocked" || s === "reserved") return "reserved";
  return "other";
}

export type StatusBreakdown = {
  available: number;
  booked: number;
  blocked: number;
  reserved: number;
  new: number;
  sold: number;
  other: number;
  total: number;
};

export function statusBucket(
  status: string | null | undefined,
): keyof Omit<StatusBreakdown, "total"> {
  const s = (status ?? "").toLowerCase().trim();
  if (s === "available") return "available";
  if (s === "new") return "new";
  if (s === "booked") return "booked";
  if (s === "blocked") return "blocked";
  if (s === "reserved") return "reserved";
  if (s === "sold") return "sold";
  return "other";
}

export function emptyBreakdown(): StatusBreakdown {
  return { available: 0, booked: 0, blocked: 0, reserved: 0, new: 0, sold: 0, other: 0, total: 0 };
}

export function breakdownForUnits(units: { status: string | null }[]): StatusBreakdown {
  const out = emptyBreakdown();
  for (const u of units) {
    out[statusBucket(u.status)] += 1;
    out.total += 1;
  }
  return out;
}

export function breakdownForBuilding(b: AldarBuilding): StatusBreakdown {
  return breakdownForUnits(b.units);
}

export function breakdownForProject(p: AldarProject): StatusBreakdown {
  const out = emptyBreakdown();
  for (const b of p.buildings) {
    const sub = breakdownForBuilding(b);
    out.available += sub.available;
    out.booked += sub.booked;
    out.blocked += sub.blocked;
    out.reserved += sub.reserved;
    out.new += sub.new;
    out.sold += sub.sold;
    out.other += sub.other;
    out.total += sub.total;
  }
  return out;
}

export function actionableCount(b: StatusBreakdown): number {
  return b.available + b.new + b.booked + b.blocked + b.reserved;
}

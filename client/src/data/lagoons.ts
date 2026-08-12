// AUTO-GENERATED — do not edit manually.
// Source: https://world.aldar.com/uae/abudhabi/lagoons (captured 2026-04-21)

export interface LagoonsAldarData {
  aldar_unit_name: string | null;
  aldar_link: string | null;
  unit_type: string | null;
  unit_category: string | null;
  model: string | null;
  bedrooms: number | null;
  status: string | null;
  selling_price_aed: number | null;
  reservation_amount: number | null;
  online_reservation_fee: number | null;
  plot_area_sqm: number | null;
  saleable_area_sqm: number | null;
  total_area_sqm: number | null;
  terrace_area_sqm: number | null;
  service_charges_aed_sqm: number | null;
  service_charge_escalation_pct: number | null;
  car_parks: number | null;
  features_spec: string | null;
  inventory_category: string | null;
  property_status: string | null;
  mandatory_pool: boolean | null;
  mandatory_premium: boolean | null;
  project_name: string | null;
  darna_applicable: boolean | null;
  virtual_tour: string | null;
  building_section: string | null;
  unit_finishes: string | null;
  payment_plans: string | null;
}

export interface LagoonsAmenityHit { name: string; distance_m: number; url: string; }
export interface LagoonsVilla {
  id: string; short_name: string; unit_name: string; unit_number: string;
  cluster: 'ethir' | 'al-sidr' | 'al-ghaf';
  cluster_label: string;
  bedrooms: number | null; model: string | null; type: string | null;
  variant: string | null; variant_code: string | null; mirror: string | null;
  plot_area_sqm: number | null; saleable_area_sqm: number | null;
  suite_area_sqm: number | null; balcony_area_sqm: number | null;
  status: string | null; price: string | null;
  has_floorplan: boolean; has_interior: boolean; has_unique_view: boolean;
  is_premium: boolean; is_showhome: boolean;
  position_type: 'corner' | 'edge' | 'interior' | 'unknown';
  is_corner: boolean; is_edge: boolean; neighbour_count: number;
  map_x: number | null; map_y: number | null;
  detail_url: string; google_maps_url: string;
  nearest_amenities: LagoonsAmenityHit[];
  aldar_data?: LagoonsAldarData | null;
}

export interface LagoonsClusterSummary {
  cluster: string; cluster_label: string; total: number;
  by_model: Record<string, number>; by_status: Record<string, number>;
  corners: number; edges: number; interior: number; unknown_position: number;
  avg_plot_area: number; avg_saleable_area: number;
}

export interface LagoonsDataset {
  total_villas: number;
  community_centroids: Record<string, { lat: number; lng: number }>;
  summary: Record<string, LagoonsClusterSummary>;
  amenities: Record<string, { name: string; url: string }[]>;
  villas: LagoonsVilla[];
}


// Data is now served via tRPC (trpc.lagoons.*) instead of being bundled.
// Types and interfaces above are still used by components.

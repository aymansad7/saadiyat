/**
 * Interactive Map — Saadiyat Island
 * Shows all villas/plots as colored dots on Google Maps.
 * Click a dot → info window with full details.
 * Toggle button to show/hide owner info (ready for future data).
 */
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { MapView } from "@/components/Map";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { Link, useSearch } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Eye, EyeOff, Layers, Search, X } from "lucide-react";
import { villas } from "@/data/villas";
import { COMMUNITIES } from "@/data/communities";
import { getPlotLandArea } from "@/data/plotLandAreas";

/** Match a plot's DCR land area to a Jawaher transaction history (±100 sqft) */
function findJawaherTx(villaKey: string) {
  const dcrArea = getPlotLandArea(villaKey);
  if (!dcrArea) return undefined;
  let best: typeof jawaherPlotHistories[0] | undefined;
  let bestDiff = Infinity;
  for (const ph of jawaherPlotHistories) {
    const diff = Math.abs(ph.landSqft - dcrArea.sqft);
    if (diff < bestDiff) { bestDiff = diff; best = ph; }
  }
  return best && bestDiff <= 100 ? best : undefined;
}
import { getVillaTransactions } from "@/data/stregisTransactions";
import { jawaherPlotHistories } from "@/data/jawaherTransactions";
import { golfViewsPlotData } from "@/data/golfViewsPlotData";
import { findSDN2Transactions } from "@/data/sdn2Transactions";
import type { PlotTransaction } from "@/components/SimplePlotCard";
import { plotCoordinates } from "@/data/plotCoordinates";
import { pfListings, findListingByVillaKey, PF_SUMMARY } from "@/data/propertyFinderListings";
import type { PFListing } from "@/data/propertyFinderListings";
import { hiddVillaCoords } from "@/data/hiddCoordinates";
import { NUDRA_YANDEX_ADDRESS_POINTS } from "@/data/nudra";
import hiddDataRaw from "@/data/hiddPublic.json";
import { lagoonsVillaCoords } from "@/data/lagoonsCoordinates";
import { FOUR_SEASONS_VILLAS } from "@/data/fourSeasons";
import { FOUR_SEASONS_FLOORPLAN_BY_VILLA } from "@/data/fourSeasonsFloorplans";
import { getFourSeasonsTransactions } from "@/data/fourSeasonsTransactions";
import { SAADIYAT_RESERVE_RECORDS } from "@/data/saadiyatReserve";
import { LAGOONS_HIDDEN_SL9_PLOTS } from "@/data/lagoonsHiddenSl9";
import { LAGOONS_SL10_PLOTS, LAGOONS_SL13_PLOTS } from "@/data/lagoonsDcrPhases";
import { getAvailability } from "@/data/lagoonsAvailability";
import { BUILDING_PLOTS_SDW4, PRIVATE_OWNERS_VIP_PLOTS } from "@/data/privateOwnersVip";
import AreaFilterControls from "@/components/AreaFilterControls";
import { ListingEditor } from "@/components/ListingEditor";
import { trpc } from "@/lib/trpc";
import {
  formatArea,
  isWithinAreaRange,
  matchesAreaQuery,
  type AreaUnit,
} from "@/lib/areaSearch";
import { propertyScopeKey } from "@shared/propertyAccess";

// Known community centers on Saadiyat Island
export const COMMUNITY_CENTERS = {
  "st-regis": { lat: 24.5381, lng: 54.4246, label: "St. Regis Villas", color: "#C75B12" },
  "jawaher": { lat: 24.5465, lng: 54.4340, label: "Jawaher", color: "#2563EB" },
  "saadiyat-beach-villas": { lat: 24.5520, lng: 54.4280, label: "Saadiyat Beach Villas", color: "#0C4A6E" },
  "saadiyat-golf-views": { lat: 24.5440, lng: 54.4400, label: "Golf Views", color: "#7C3AED" },
  "hidd": { lat: 24.5580, lng: 54.4150, label: "Hidd Al Saadiyat", color: "#DC2626" },
  "nudra": { lat: 24.5383, lng: 54.4161, label: "Nudra by IMKAN", color: "#0891B2" },
  "private-villas": { lat: 24.5395, lng: 54.4200, label: "Private Villas (Four Seasons)", color: "#CA8A04" },
  "lagoons": { lat: 24.5309, lng: 54.4378, label: "Saadiyat Lagoons", color: "#0891B2" },
  "four-seasons": { lat: 24.5508, lng: 54.4421, label: "Four Seasons Private Residences", color: "#334155" },
  "huge-plot": { lat: 24.55285144, lng: 54.44457573, label: "Huge Plot Between Four Seasons and Omniyat", color: "#A16207" },
  "saadiyat-reserve": { lat: 24.5232, lng: 54.4427, label: "Saadiyat Reserve · Dunes", color: "#B45309" },
  "lagoons-hidden-sl9": { lat: 24.5395, lng: 54.4425, label: "Lagoons · Hidden Phase SL9", color: "#475569" },
  "lagoons-hidden-sl10": { lat: 24.5402, lng: 54.4454, label: "Lagoons · Hidden Phase SL10", color: "#7C3AED" },
  "lagoons-sl13": { lat: 24.5401, lng: 54.4422, label: "Lagoons · Phase SL13", color: "#0F766E" },
  "private-owners-vip": { lat: 24.5627, lng: 54.4554, label: "Private Owners VIP", color: "#9A3412" },
  "building-plots-sdw4": { lat: 24.5210, lng: 54.4342, label: "Building Plots SDW4", color: "#4338CA" },
};

export interface MapMarkerData {
  id: string;
  lat: number;
  lng: number;
  community: string;
  label: string;
  landSqft?: number;
  landSqm?: number;
  builtUpSqft?: number;
  builtUpSqm?: number;
  builtUpLabel?: string;
  saleableSqft?: number;
  saleableSqm?: number;
  bedrooms?: string;
  buildingKey?: string;
  unitTypeKey?: string;
  unitType?: string;
  model?: string;
  status?: string;
  developer?: string;
  originalPrice?: number;
  lastPrice?: number;
  lastDate?: string;
  saleType?: string;
  salesCount?: number;
  transactions?: PlotTransaction[];
  owner?: string;
  phone?: string;
  ownerEmail?: string;
  tenant?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  tenancyStart?: string;
  tenancyEnd?: string;
  tenancyContractReceived?: string;
  listing?: PFListing;
  villaKey?: string;
  slPhase?: string;
  detailHref?: string;
  tableHref?: string;
  detailLines?: string[];
  availabilityStatus?: "available";
  availabilityDate?: string;
  askingPrice?: number;
  availableForRent?: boolean;
  rentPrice?: number;
  floorplanHref?: string;
  dcrHref?: string;
  dmtHref?: string;
  googleMapsHref?: string;
  markerColor?: string;
}

function scopeKeyPart(value: string | null | undefined): string | null {
  const normalized = value?.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  return normalized || null;
}

function mapMarkerScope(marker: Pick<MapMarkerData, "community" | "slPhase" | "buildingKey" | "unitTypeKey" | "unitType" | "bedrooms">) {
  const parsedBedrooms = marker.bedrooms == null ? null : Number.parseInt(String(marker.bedrooms), 10);
  return {
    projectKey: marker.community,
    phaseKey: marker.slPhase ?? null,
    buildingKey: marker.buildingKey ?? null,
    unitTypeKey: marker.unitTypeKey ?? null,
    bedrooms: Number.isInteger(parsedBedrooms) ? parsedBedrooms : null,
  };
}

export function getMapMarkerColor(marker: Pick<MapMarkerData, "community" | "availabilityStatus" | "listing" | "markerColor">) {
  if (marker.availabilityStatus === "available" || marker.listing) return "#10B981";
  return marker.markerColor ?? COMMUNITY_CENTERS[marker.community as keyof typeof COMMUNITY_CENTERS]?.color ?? "#6B7280";
}

/** Normalizes project and unit text so `Lagoons 11102` finds `AlSidr-111-02`. */
export function normalizeMapSearchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

export function findMapSearchResults(markers: MapMarkerData[], query: string, limit = 8) {
  const tokens = query.trim().toLowerCase().split(/\s+/).map(normalizeMapSearchText).filter(Boolean);
  const requestedPhase = query.match(/\bphase\s*[-_]?\s*(\d+)\b/i)?.[1];
  if (tokens.length === 0) return [];
  return markers
    .filter(marker => {
      if (requestedPhase && normalizeMapSearchText(marker.slPhase ?? "") !== `phase${requestedPhase}`) return false;
      const searchable = normalizeMapSearchText([
        marker.label,
        marker.villaKey,
        marker.community,
        marker.slPhase,
        marker.developer,
        COMMUNITY_CENTERS[marker.community as keyof typeof COMMUNITY_CENTERS]?.label,
      ].filter(Boolean).join(" "));
      return tokens.every(token => searchable.includes(token));
    })
    .sort((a, b) => {
      const aExact = normalizeMapSearchText(a.label) === tokens.join("") ? 0 : 1;
      const bExact = normalizeMapSearchText(b.label) === tokens.join("") ? 0 : 1;
      return aExact - bExact || a.label.localeCompare(b.label);
    })
    .slice(0, limit);
}

type HiddMapVilla = {
  villaNumber?: string;
  street?: string;
  bedrooms?: string;
  villaType?: string;
  buaAreaSqM?: string;
  buaAreaSqFt?: string;
  plotAreaSqFt?: string;
  plotNumberAlJaber?: string;
  admPlotNumber?: string;
};

const hiddVillas: HiddMapVilla[] = (Array.isArray(hiddDataRaw)
  ? hiddDataRaw
  : (hiddDataRaw as { default?: HiddMapVilla[] }).default ?? []) as HiddMapVilla[];

function parseHiddNumber(value?: string) {
  const parsed = Number(value?.replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function buildMarkers(): MapMarkerData[] {
  const markers: MapMarkerData[] = [];

  // St. Regis — exact coordinates from villas.ts
  for (const v of villas) {
    const txs = getVillaTransactions(v.id);
    const lastTx = txs.length > 0 ? txs[txs.length - 1] : null;
    const dcrCoord = plotCoordinates[`st-regis/Plot-${v.id}`];
    markers.push({
      id: `st-regis-${v.id}`,
      lat: dcrCoord?.lat ?? v.latitude,
      lng: dcrCoord?.lng ?? v.longitude,
      community: "st-regis",
      label: `Plot ${v.id}`,
      landSqft: v.plotAreaSqm ? Math.round(v.plotAreaSqm * 10.7639) : undefined,
      landSqm: v.plotAreaSqm ?? undefined,
      builtUpSqft: v.maxGfaSqm ? Math.round(v.maxGfaSqm * 10.7639) : undefined,
      builtUpSqm: v.maxGfaSqm ?? undefined,
      builtUpLabel: "Max GFA",
      lastPrice: lastTx?.priceAed,
      lastDate: lastTx?.date,
      saleType: lastTx?.saleType,
      salesCount: txs.length || undefined,
      transactions: txs,
      villaKey: `st-regis/Plot-${v.id}`,
      detailHref: `/st-regis/villa/${v.id}`,
      tableHref: `/st-regis?view=table#villa-${v.id}`,
      detailLines: [v.bedrooms ? `${v.bedrooms} bedrooms` : "", v.buildingTypology ?? ""].filter(Boolean),
      dcrHref: v.pdfLocalUrl,
      dmtHref: v.dmtPdfUrl,
      googleMapsHref: v.googleMapsUrl,
    });
  }

  // Jawaher — real coordinates from DCR
  const jawaherComm = COMMUNITIES.find(c => c.slug === "jawaher");
  const jawaherPlots = jawaherComm?.flatPlots ?? [];
  for (let i = 0; i < jawaherPlots.length; i++) {
    const p = jawaherPlots[i];
    const coord = plotCoordinates[p.villaKey];
    if (!coord) continue;
    const area = getPlotLandArea(p.villaKey);
    const txData = findJawaherTx(p.villaKey);
    const lastTx = txData?.transactions?.[txData.transactions.length - 1];
    const landSqft = area?.sqft ?? txData?.landSqft;
    const listing = findListingByVillaKey(p.villaKey);
    markers.push({
      id: `jawaher-${p.id}`,
      lat: coord.lat, lng: coord.lng,
      community: "jawaher",
      label: p.label,
      landSqft,
      landSqm: area?.sqm,
      lastPrice: lastTx?.priceAed,
      lastDate: lastTx?.date,
      saleType: lastTx?.saleType,
      salesCount: txData?.transactions?.length || undefined,
      transactions: txData?.transactions,
      listing,
      villaKey: p.villaKey,
      detailHref: `/jawaher/plot/${p.id}`,
      tableHref: `/jawaher?view=table#plot-${p.id}`,
      dcrHref: p.pdfUrl,
    });
  }

  // Golf Views — real coordinates from DCR
  const gvComm = COMMUNITIES.find(c => c.slug === "saadiyat-golf-views");
  const gvPlots = gvComm?.flatPlots ?? [];
  for (let i = 0; i < gvPlots.length; i++) {
    const p = gvPlots[i];
    const coord = plotCoordinates[p.villaKey];
    if (!coord) continue;
    const plotData = golfViewsPlotData[p.villaKey];
    const lastTx = plotData?.transactions?.[plotData.transactions.length - 1];
    markers.push({
      id: `gv-${p.id}`,
      lat: coord.lat, lng: coord.lng,
      community: "saadiyat-golf-views",
      label: p.label,
      landSqft: plotData?.landSqft,
      landSqm: plotData?.landSqm,
      builtUpSqft: lastTx?.builtUpAreaSqft ?? undefined,
      builtUpSqm: lastTx?.builtUpAreaSqm ?? undefined,
      builtUpLabel: "Recorded BUA",
      lastPrice: lastTx?.priceAed,
      lastDate: lastTx?.date,
      saleType: lastTx?.saleType,
      salesCount: plotData?.transactions?.length || undefined,
      transactions: plotData?.transactions,
      villaKey: p.villaKey,
      detailHref: `/community/saadiyat-golf-views#plot-${p.id}`,
      tableHref: `/community/saadiyat-golf-views?view=table#plot-${p.id}`,
      dcrHref: p.pdfUrl,
    });
  }

  // SBV — real coordinates from DCR
  const sbvComm = COMMUNITIES.find(c => c.slug === "saadiyat-beach-villas");
  if (sbvComm?.gates) {
    for (const gate of sbvComm.gates) {
      // Gate 1 contains the same SDN2_6 plots that are modelled separately as
      // Saadiyat Beach Golf Views. Do not draw a second green SBV marker over
      // the authoritative purple Golf Views marker and hide its transactions.
      if (gate.slug === "gate-1") continue;
      for (const p of gate.plots) {
        const coord = plotCoordinates[p.villaKey];
        if (!coord) continue;
        const area = getPlotLandArea(p.villaKey);
        const transactions = area?.sqft ? findSDN2Transactions(area.sqft) : undefined;
        const lastTx = transactions?.[transactions.length - 1];
        markers.push({
          id: `sbv-${p.villaKey}`,
          lat: coord.lat, lng: coord.lng,
          community: "saadiyat-beach-villas",
          label: p.label,
          landSqft: area?.sqft,
          landSqm: area?.sqm,
          builtUpSqft: lastTx?.builtUpAreaSqft ?? undefined,
          builtUpSqm: lastTx?.builtUpAreaSqm ?? undefined,
          builtUpLabel: "Recorded BUA",
          lastPrice: lastTx?.priceAed,
          lastDate: lastTx?.date,
          saleType: lastTx?.saleType,
          salesCount: transactions?.length || undefined,
          transactions,
          villaKey: p.villaKey,
          detailHref: `/saadiyat-beach-villas#plot-${p.id}`,
          tableHref: `/saadiyat-beach-villas?view=table#${gate.slug}`,
          detailLines: [gate.name],
          dcrHref: p.pdfUrl,
        });
      }
    }
  }

  // Private Villas — real coordinates from DCR
  const pvComm = COMMUNITIES.find(c => c.slug === "private-villas-four-seasons");
  const pvPlots = pvComm?.flatPlots ?? [];
  for (let i = 0; i < pvPlots.length; i++) {
    const p = pvPlots[i];
    const coord = plotCoordinates[p.villaKey];
    if (!coord) continue;
    const area = getPlotLandArea(p.villaKey);
    markers.push({
      id: `pv-${p.id}`,
      lat: coord.lat, lng: coord.lng,
      community: "private-villas",
      label: p.label,
      landSqft: area?.sqft,
      landSqm: area?.sqm,
      villaKey: p.villaKey,
      detailHref: `/community/private-villas-four-seasons#plot-${p.id}`,
      tableHref: `/community/private-villas-four-seasons?view=table#plot-${p.id}`,
      dcrHref: p.pdfUrl,
    });
  }

  // Four Seasons — nine direct SDN3 controls plus master-plan positions
  // recalibrated by the audited quadratic model for the remaining villas.
  for (const villa of FOUR_SEASONS_VILLAS) {
    const floorplan = FOUR_SEASONS_FLOORPLAN_BY_VILLA.get(villa.villaNumber);
    const fourSeasonsTransactions: PlotTransaction[] = getFourSeasonsTransactions(villa.villaNumber).map((transaction) => ({
      date: transaction.date,
      priceAed: transaction.priceAed,
      saleType: transaction.saleSequence === "primary" ? "primary" : "secondary",
      ratePerSqft: null,
      builtUpAreaSqm: transaction.builtUpAreaSqm,
      builtUpAreaSqft: transaction.builtUpAreaSqm * 10.764,
      confidence: transaction.confidence === "possible"
        ? "possible"
        : transaction.matchBasis === "user_confirmed"
        ? "user-confirmed"
        : "exact",
      areaDifferenceSqm: transaction.landDifferenceSqm ?? undefined,
    }));
    const latestTransaction = fourSeasonsTransactions[fourSeasonsTransactions.length - 1];
    const confirmedTransaction = getFourSeasonsTransactions(villa.villaNumber).find((transaction) => transaction.confidence === "confirmed");
    markers.push({
      id: `four-seasons-${villa.villaNumber}`,
      lat: villa.latitude,
      lng: villa.longitude,
      community: "four-seasons",
      label: villa.label,
      landSqft: villa.plotAreaSqft ?? floorplan?.plotAreaSqft ?? (confirmedTransaction ? confirmedTransaction.landAreaSqm * 10.764 : undefined),
      landSqm: villa.plotAreaSqm ?? floorplan?.plotAreaSqmPrinted ?? confirmedTransaction?.landAreaSqm,
      builtUpSqft: villa.builtUpAreaSqft ?? floorplan?.sellableAreaSqft ?? (confirmedTransaction ? confirmedTransaction.builtUpAreaSqm * 10.764 : undefined),
      builtUpSqm: villa.builtUpAreaSqm ?? floorplan?.sellableAreaSqmPrinted ?? confirmedTransaction?.builtUpAreaSqm,
      builtUpLabel: floorplan ? "Sellable area" : "BUA",
      lastPrice: latestTransaction?.priceAed,
      lastDate: latestTransaction?.date,
      saleType: latestTransaction?.saleType,
      salesCount: fourSeasonsTransactions.length || undefined,
      transactions: fourSeasonsTransactions,
      villaKey: villa.villaKey,
      detailHref: `/four-seasons#villa-${villa.villaNumber}`,
      tableHref: `/four-seasons?view=table#villa-${villa.villaNumber}`,
      detailLines: [
        `${villa.bedrooms} BR`,
        floorplan?.villaType ?? villa.villaType,
        villa.view ?? "",
        floorplan ? "Developer Floorplan" : "",
        villa.positionSource === "user_supplied_sdn3_coordinate"
          ? `Official SDN3 Plot ${villa.sdn3PlotNumber} coordinate`
          : "Master plan · calibrated to 9 SDN3 controls",
      ].filter(Boolean),
      availabilityStatus: villa.status === "available" ? "available" : undefined,
      availabilityDate: villa.availabilityUpdatedAt ?? undefined,
      askingPrice: villa.askingPriceAed ?? undefined,
      floorplanHref: floorplan?.pdfUrl,
      googleMapsHref: `https://www.google.com/maps?q=${villa.latitude},${villa.longitude}`,
    });
  }

  // SDN3_10 — official DCR centroid and land area.
  const hugePlotCoord = plotCoordinates["huge-plot-four-seasons-omniyat/SDN3_10"];
  const hugePlotArea = getPlotLandArea("huge-plot-four-seasons-omniyat/SDN3_10");
  if (hugePlotCoord && hugePlotArea) {
    markers.push({
      id: "huge-plot-four-seasons-omniyat",
      lat: hugePlotCoord.lat,
      lng: hugePlotCoord.lng,
      community: "huge-plot",
      label: "A Huge Plot Between Four Seasons and Omniyat",
      landSqft: hugePlotArea.sqft,
      landSqm: hugePlotArea.sqm,
      villaKey: "huge-plot-four-seasons-omniyat/SDN3_10",
      detailHref: "/community/huge-plot-four-seasons-omniyat#plot-1",
      tableHref: "/community/huge-plot-four-seasons-omniyat?view=table#plot-1",
      detailLines: ["SDN3_10", "Official DCR"],
    });
  }

  // Saadiyat Reserve — all 306 official master-plan records. Phase 1 and 2
  // are land plots; Phase 3 is the renamed Dunes built-villa inventory.
  for (const record of SAADIYAT_RESERVE_RECORDS) {
    const isOfficialCoordinate = record.positionSource === "user_supplied_sde3_coordinate";
    markers.push({
      id: `saadiyat-reserve-${record.plotNumber}`,
      lat: record.latitude,
      lng: record.longitude,
      community: "saadiyat-reserve",
      label: record.label,
      landSqft: record.plotAreaSqft,
      landSqm: record.plotAreaSqm,
      builtUpSqft: Math.round(record.gfaSqm * 10.7639 * 100) / 100,
      builtUpSqm: record.gfaSqm,
      builtUpLabel: "GFA",
      originalPrice: record.originalPriceAed ?? undefined,
      villaKey: record.villaKey,
      detailHref: record.dunes
        ? record.dunes.existingDetailsPath
        : `/saadiyat-reserve?plot=${record.plotNumber}#reserve-record-${record.plotNumber}`,
      tableHref: `/saadiyat-reserve?view=table&plot=${record.plotNumber}#reserve-record-${record.plotNumber}`,
      detailLines: [
        `Phase ${record.phase}`,
        record.dunes
          ? `${record.dunes.bedrooms} BR · Built Dunes villa`
          : record.inventoryKind === "reserve_built_villa"
          ? `${record.saleInventory?.bedrooms ?? "—"} BR · Built Reserve villa`
          : "Reserve land plot",
        `GFA ${record.gfaSqm.toLocaleString()} m²`,
        record.originalPriceAed ? `Original Price AED ${record.originalPriceAed.toLocaleString()}` : "",
        record.availability === "sold" ? "Sold in current source inventory" : "",
        isOfficialCoordinate ? "Official SDE3 coordinate" : "Master-plan calibrated position",
      ].filter(Boolean),
      markerColor: record.availability === "available_for_sale"
        ? "#10B981"
        : record.phase === 1
        ? "#0284C7"
        : record.phase === 2
        ? "#A21CAF"
        : "#B45309",
      availabilityStatus: record.availability === "available_for_sale" ? "available" : undefined,
      availabilityDate: record.availabilityUpdatedAt ?? undefined,
      askingPrice: record.askingPriceAed ?? undefined,
      slPhase: `PHASE-${record.phase}`,
    });
  }

  // Hidden Lagoons Phase SL9 — 257 individual official DCR centroids.
  for (const plot of LAGOONS_HIDDEN_SL9_PLOTS) {
    const villaNumber = plot.aldarPlotId.match(/VI-(\d+)$/)?.[1] ?? String(plot.plotNumber);
    markers.push({
      id: `lagoons-hidden-sl9-${plot.plotNumber}`,
      lat: plot.latitude,
      lng: plot.longitude,
      community: "lagoons-hidden-sl9",
      label: `Villa ${villaNumber}`,
      landSqft: plot.landSqft,
      landSqm: plot.landSqm,
      builtUpSqft: plot.maxGfaSqft ?? undefined,
      builtUpSqm: plot.maxGfaSqm ?? undefined,
      builtUpLabel: "Max GFA",
      villaKey: plot.villaKey,
      detailHref: `/lagoons-hidden-sl9?plot=${encodeURIComponent(plot.villaKey)}#sl9-plot-${plot.plotNumber}`,
      tableHref: `/lagoons-hidden-sl9?view=table&plot=${encodeURIComponent(plot.villaKey)}#sl9-plot-${plot.plotNumber}`,
      detailLines: [`Plot ${plot.plotNumber}`, plot.aldarPlotId, plot.typology ?? "", "Official DCR centroid"].filter(Boolean),
      dcrHref: plot.dcrUrl,
      dmtHref: plot.dmtUrl,
      googleMapsHref: plot.googleMapsUrl,
    });
  }

  // SL10 and SL13 — direct official DCR centroids, with the same card and source links as SL9.
  for (const [phase, slug, plots] of [["SL10", "lagoons-hidden-sl10", LAGOONS_SL10_PLOTS], ["SL13", "lagoons-sl13", LAGOONS_SL13_PLOTS]] as const) {
    for (const plot of plots) {
      const villaNumber = plot.aldarPlotId.match(/VI-(\d+)$/)?.[1] ?? String(plot.plotNumber);
      markers.push({
        id: `${slug}-${plot.plotNumber}`,
        lat: plot.latitude,
        lng: plot.longitude,
        community: slug,
        label: `Villa ${villaNumber}`,
        landSqft: plot.landSqft,
        landSqm: plot.landSqm,
        builtUpSqft: plot.maxGfaSqft ?? undefined,
        builtUpSqm: plot.maxGfaSqm ?? undefined,
        builtUpLabel: "Max GFA",
        villaKey: plot.villaKey,
        detailHref: `/${slug}?plot=${encodeURIComponent(plot.villaKey)}`,
        tableHref: `/${slug}?view=table&plot=${encodeURIComponent(plot.villaKey)}`,
        detailLines: [`${phase} · Plot ${plot.plotNumber}`, plot.aldarPlotId, plot.typology ?? "", "Official DCR centroid"].filter(Boolean),
        dcrHref: plot.dcrUrl,
        dmtHref: plot.dmtUrl,
        googleMapsHref: plot.googleMapsUrl,
      });
    }
  }

  // Private Owners VIP and Building Plots SDW4 — each location is an official DCR UTM boundary centroid.
  for (const [community, title, plots, unitType] of [
    ["private-owners-vip", "Private Owners VIP", PRIVATE_OWNERS_VIP_PLOTS, "Private VIP plot"],
    ["building-plots-sdw4", "Building Plots SDW4", BUILDING_PLOTS_SDW4, "Building development plot"],
  ] as const) {
    for (const plot of plots) {
      markers.push({
        id: `${community}-${plot.id}`,
        lat: plot.latitude,
        lng: plot.longitude,
        community,
        label: `Plot ${plot.plotNumber}`,
        landSqm: plot.landSqm,
        landSqft: plot.landSqft,
        builtUpSqm: plot.maxGfaSqm,
        builtUpSqft: plot.maxGfaSqft,
        builtUpLabel: "Max GFA",
        unitType,
        developer: title,
        villaKey: plot.villaKey,
        detailHref: `/${community}?plot=${encodeURIComponent(plot.villaKey)}#${community}-plot-${plot.id}`,
        tableHref: `/${community}?view=table&plot=${encodeURIComponent(plot.villaKey)}#${community}-plot-${plot.id}`,
        detailLines: [plot.projectLabel, plot.locationSource],
        dcrHref: plot.dcrUrl,
        googleMapsHref: plot.googleMapsUrl,
      });
    }
  }

  // Hidd Al Saadiyat — user controls are exact; all other locations are calibrated from the preserved shape.
  for (const hv of hiddVillaCoords) {
    const hiddVilla = hiddVillas.find((villa) => String(villa.villaNumber) === hv.villaNumber && villa.street === hv.street);
    const sourceLabel = hv.positionSource === "user_supplied_coordinate"
      ? "User-supplied official control"
      : hv.positionSource === "yandex_exact_address_match"
        ? "Yandex exact house-address match"
      : hv.positionSource === "street_control_calibrated"
        ? "Street shape calibrated to official controls"
        : "Community shape calibrated to official controls";
    const landSqft = parseHiddNumber(hiddVilla?.plotAreaSqFt);
    const builtUpSqm = parseHiddNumber(hiddVilla?.buaAreaSqM);
    markers.push({
      id: `hidd-${hv.villaNumber}-${hv.street}`,
      lat: hv.lat,
      lng: hv.lng,
      community: "hidd",
      label: `Villa ${hv.villaNumber}`,
      landSqft,
      landSqm: landSqft ? landSqft / 10.7639 : undefined,
      builtUpSqft: parseHiddNumber(hiddVilla?.buaAreaSqFt),
      builtUpSqm,
      builtUpLabel: "BUA",
      bedrooms: hiddVilla?.bedrooms?.replace(/\.0$/, "") || undefined,
      buildingKey: scopeKeyPart(`street-${hv.street}`) ?? undefined,
      unitTypeKey: scopeKeyPart(hiddVilla?.villaType) ?? undefined,
      unitType: hiddVilla?.villaType || undefined,
      developer: "Hidd Al Saadiyat",
      villaKey: `hidd/${hv.villaNumber}/${hv.street}`,
      detailHref: `/hidd-al-saadiyat?view=cards#villa-${hv.villaNumber}-${hv.street}`,
      tableHref: `/hidd-al-saadiyat?view=table#villa-${hv.villaNumber}`,
      detailLines: [
        `Street ${hv.street === "BOULEVARD" ? "Boulevard / Al Dhiba" : hv.street}`,
        hv.street === "11" ? "Sea View · Street 11" : "",
        hiddVilla?.bedrooms ? `${hiddVilla.bedrooms.replace(/\.0$/, "")} bedrooms` : "",
        hiddVilla?.villaType ? `Type ${hiddVilla.villaType}` : "",
        hiddVilla?.plotNumberAlJaber ? `Plot ${hiddVilla.plotNumberAlJaber}` : "",
        hiddVilla?.admPlotNumber ? `ADM ${hiddVilla.admPlotNumber}` : "",
        sourceLabel,
      ].filter(Boolean),
      googleMapsHref: `https://www.google.com/maps?q=${hv.lat},${hv.lng}`,
    });
  }

  // Nudra by IMKAN — Yandex house-address results remain intentionally separate from B/D/S codes.
  // A source-backed crosswalk is needed before associating a map address with a coded IMKAN unit and its price.
  for (const address of NUDRA_YANDEX_ADDRESS_POINTS) {
    markers.push({
      id: `nudra-address-${address.addressNumber}`,
      lat: address.latitude,
      lng: address.longitude,
      community: "nudra",
      label: `Nudra · ${address.returnedAddress}`,
      developer: "Nudra by IMKAN",
      unitType: "Yandex exact house-address match",
      detailHref: "/nudra",
      tableHref: "/nudra?view=table",
      detailLines: ["SDN1 · Saadiyat Island", "Yandex exact house-address match", "Unit code and price shown after source-backed crosswalk"],
      googleMapsHref: `https://www.google.com/maps?q=${address.latitude},${address.longitude}`,
    });
  }

  // Lagoons — coordinates derived from masterplan map_x/map_y
  for (const lv of lagoonsVillaCoords) {
    const shortName = lv.unit_name.replace(/^(AlGhaf|AlSidr|Ethir)-/, '');
    const clusterLabel = lv.cluster === 'al-ghaf' ? 'Al Ghaf' : lv.cluster === 'al-sidr' ? 'Al Sidr' : 'Ethir';
    const availability = getAvailability(`Lagoons-${lv.unit_name.replace(/^(AlGhaf|AlSidr|Ethir)-/, "$1-V-")}`);
    const confirmedAvailable = Boolean(availability.nasLuxury || availability.aldar.length || availability.sharedAvailability);
    const resalePrice = availability.nasLuxury?.selling_price_aed
      ?? availability.aldar[0]?.asking_price_aed
      ?? availability.sharedAvailability?.asking_price_aed
      ?? undefined;
    const coordinateSource = lv.position_source === "official_user_control"
      ? "Official SDE3 coordinate"
      : lv.position_source === "legacy_position_retained_no_masterplan_coordinate"
        ? "Legacy location retained · master-plan position unavailable"
        : "Master-plan calibrated to official SDE3 controls";
    markers.push({
      id: `lagoons-${lv.unit_name}`,
      lat: lv.lat,
      lng: lv.lng,
      community: "lagoons",
      label: shortName,
      landSqft: lv.plot_area_sqm ? Math.round(lv.plot_area_sqm * 10.7639) : undefined,
      landSqm: lv.plot_area_sqm || undefined,
      builtUpSqft: lv.total_area_sqm ? Math.round(lv.total_area_sqm * 10.7639 * 100) / 100 : undefined,
      builtUpSqm: lv.total_area_sqm || undefined,
      builtUpLabel: "Built-up area",
      saleableSqft: lv.saleable_area_sqm ? Math.round(lv.saleable_area_sqm * 10.7639 * 100) / 100 : undefined,
      saleableSqm: lv.saleable_area_sqm || undefined,
      bedrooms: lv.bedrooms || undefined,
      buildingKey: scopeKeyPart(`cluster-${lv.cluster}`) ?? undefined,
      unitTypeKey: scopeKeyPart(lv.unit_type) ?? undefined,
      unitType: lv.unit_type || undefined,
      model: lv.model || undefined,
      slPhase: lv.sl_phase || undefined,
      status: lv.status || undefined,
      developer: "Aldar",
      originalPrice: lv.original_price_aed || undefined,
      lastPrice: resalePrice,
      saleType: resalePrice ? "resale" : undefined,
      availabilityStatus: confirmedAvailable ? "available" : undefined,
      askingPrice: resalePrice,
      availabilityDate: availability.sharedAvailability?.source_date ?? (confirmedAvailable ? "current resale source" : undefined),
      villaKey: `lagoons/${lv.unit_name}`,
      detailHref: `/saadiyat-lagoons/${lv.cluster}/${encodeURIComponent(lv.unit_name)}`,
      tableHref: `/saadiyat-lagoons/${lv.cluster}?view=table#unit-${encodeURIComponent(lv.unit_name)}`,
      detailLines: [lv.sl_phase || "", clusterLabel, coordinateSource].filter(Boolean),
      dcrHref: lv.dcr_url || undefined,
      googleMapsHref: `https://www.google.com/maps?q=${lv.lat},${lv.lng}`,
    });
  }

  return markers;
}

export default function SaadiyatMap() {
  const { user } = useAuth();
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const mapClickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const infoCloseListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const markerPinsRef = useRef(new Map<string, HTMLDivElement>());
  const selectedPinIdRef = useRef<string | null>(null);
  const [showOwners, setShowOwners] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerData | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [baseMarkerData] = useState<MapMarkerData[]>(() => buildMarkers());
  const [editingMarker, setEditingMarker] = useState<MapMarkerData | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [mapQuery, setMapQuery] = useState("");
  const [mapSearchOpen, setMapSearchOpen] = useState(false);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqm");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const searchString = useSearch();
  const plotParam = new URLSearchParams(searchString).get("plot");
  const phaseParam = new URLSearchParams(searchString).get("phase")?.toUpperCase() ?? null;
  const propertyOverrides = trpc.villaListings.listByCommunity.useQuery(
    {},
    {
      // The server returns only the public projection to visitors, while
      // authorised sessions receive only the fields allowed by their scope.
      // This keeps a saved Available status consistent on public cards and map
      // markers as well as in the Master Admin workspace.
      enabled: true,
      staleTime: 0,
      refetchOnMount: "always",
    },
  );
  const hiddSensitiveFacts = trpc.hidd.sensitiveFacts.useQuery(undefined, {
    enabled: Boolean(user),
  });
  const fahidSearch = trpc.unitSearch.search.useQuery(
    { q: mapQuery, dataset: "other", projectSlug: "thebeachhouse", limit: 100 },
    { enabled: mapSearchOpen && mapQuery.trim().length >= 2 },
  );
  const permissionScopes = useMemo(() => {
    const overridesByKey = new Map((propertyOverrides.data ?? []).map(row => [row.villaKey, row]));
    return Array.from(new Map(baseMarkerData.map(marker => {
      const override = marker.villaKey ? overridesByKey.get(marker.villaKey) : undefined;
      const scope = {
        ...mapMarkerScope(marker),
        buildingKey: override?.buildingKey ?? marker.buildingKey ?? null,
        unitTypeKey: override?.unitTypeKey ?? marker.unitTypeKey ?? null,
        bedrooms: override?.bedrooms ?? mapMarkerScope(marker).bedrooms,
      };
      return [propertyScopeKey(scope), scope];
    })).values());
  }, [baseMarkerData, propertyOverrides.data]);
  const projectPermissions = trpc.propertyAccess.permissions.useQuery(
    { scopes: permissionScopes },
    { enabled: Boolean(user) },
  );
  const permissionsByScope = useMemo(
    () => new Map(projectPermissions.data?.map(item => [propertyScopeKey(item.scope), item.permissions]) ?? []),
    [projectPermissions.data],
  );
  const markerData = useMemo(() => {
    const overridesByKey = new Map((propertyOverrides.data ?? []).map(row => [row.villaKey, row]));
    const hiddSensitiveByKey = new Map((hiddSensitiveFacts.data ?? []).map(row => [row.villaKey, row]));
    return baseMarkerData.map(marker => {
      const override = marker.villaKey ? overridesByKey.get(marker.villaKey) : undefined;
      const overrideWithProtectedFields = override as (typeof override & {
        ownerName?: string | null;
        ownerPhone?: string | null;
        ownerEmail?: string | null;
        buildingKey?: string | null;
        unitTypeKey?: string | null;
        bedrooms?: number | null;
      }) | undefined;
      const hiddSensitive = marker.villaKey ? hiddSensitiveByKey.get(marker.villaKey) : undefined;
      if (!override && !hiddSensitive) return marker;
      const hasManualStatus = override?.status && override.status !== "draft";
      return {
        ...marker,
        landSqm: override?.landAreaSqm ?? marker.landSqm,
        landSqft: override?.landAreaSqm != null ? Math.round(override.landAreaSqm * 10.7639) : marker.landSqft,
        builtUpSqm: override?.builtUpAreaSqm ?? marker.builtUpSqm,
        builtUpSqft: override?.builtUpAreaSqm != null ? Math.round(override.builtUpAreaSqm * 10.7639) : marker.builtUpSqft,
        status: hasManualStatus ? override?.status : marker.status,
        askingPrice: override?.askingPriceAed ?? marker.askingPrice,
        availableForRent: override?.availableForRent ?? marker.availableForRent,
        rentPrice: override?.rentPriceAed ?? marker.rentPrice,
        availabilityStatus: hasManualStatus
          ? (override?.status === "available" ? "available" : undefined)
          : marker.availabilityStatus,
        buildingKey: overrideWithProtectedFields?.buildingKey ?? marker.buildingKey,
        unitTypeKey: overrideWithProtectedFields?.unitTypeKey ?? marker.unitTypeKey,
        bedrooms: overrideWithProtectedFields?.bedrooms != null ? String(overrideWithProtectedFields.bedrooms) : marker.bedrooms,
        owner: overrideWithProtectedFields?.ownerName ?? hiddSensitive?.ownerName,
        phone: overrideWithProtectedFields?.ownerPhone ?? hiddSensitive?.ownerPhone,
        ownerEmail: user?.role === "master" ? (overrideWithProtectedFields?.ownerEmail ?? hiddSensitive?.ownerEmail) : undefined,
        tenant: user?.role === "master" ? hiddSensitive?.tenant : undefined,
        tenantPhone: user?.role === "master" ? hiddSensitive?.tenantPhone : undefined,
        tenantEmail: user?.role === "master" ? hiddSensitive?.tenantEmail : undefined,
        tenancyStart: user?.role === "master" ? hiddSensitive?.tenancyStart : undefined,
        tenancyEnd: user?.role === "master" ? hiddSensitive?.tenancyEnd : undefined,
        tenancyContractReceived: user?.role === "master" ? hiddSensitive?.tenancyContractReceived : undefined,
      };
    }).filter(marker => permissionsByScope.get(propertyScopeKey(mapMarkerScope(marker)))?.canAccess === true);
  }, [baseMarkerData, hiddSensitiveFacts.data, permissionsByScope, propertyOverrides.data, user?.role]);

  const smartSearchResults = useMemo(
    () => findMapSearchResults(markerData, mapQuery),
    [markerData, mapQuery],
  );
  const fahidSearchResults = useMemo(() => fahidSearch.data?.results ?? [], [fahidSearch.data]);
  const isFahidProjectSearch = normalizeMapSearchText(mapQuery).includes("fahid");

  const clearPlotDeepLink = useCallback(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("plot")) return;
    url.searchParams.delete("plot");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const highlightMarker = useCallback((markerId: string | null) => {
    const previousId = selectedPinIdRef.current;
    if (previousId) {
      const previousPin = markerPinsRef.current.get(previousId);
      if (previousPin) {
        previousPin.style.transform = "scale(1)";
        previousPin.style.outline = "none";
        previousPin.style.zIndex = previousPin.dataset.available === "true" ? "10" : "1";
      }
    }
    selectedPinIdRef.current = markerId;
    if (!markerId) return;
    const selectedPin = markerPinsRef.current.get(markerId);
    if (selectedPin) {
      selectedPin.style.transform = "scale(1.55)";
      selectedPin.style.outline = "3px solid #f8fafc";
      selectedPin.style.outlineOffset = "2px";
      selectedPin.style.zIndex = "100";
    }
  }, []);

  const closeSelectedMarker = useCallback(() => {
    highlightMarker(null);
    setSelectedMarker(null);
    infoWindowRef.current?.close();
    clearPlotDeepLink();
  }, [clearPlotDeepLink, highlightMarker]);

  const selectMarker = useCallback((data: MapMarkerData) => {
    const map = mapRef.current;
    if (map) {
      map.setCenter({ lat: data.lat, lng: data.lng });
      map.setZoom(Math.max(map.getZoom() ?? 14, 17));
    }
    highlightMarker(data.id);
    setSelectedMarker(data);
  }, [highlightMarker]);

  const selectSearchResult = useCallback((marker: MapMarkerData) => {
    setActiveFilter(null);
    setAreaMin("");
    setAreaMax("");
    setMapQuery("");
    setMapSearchOpen(false);
    selectMarker(marker);
  }, [selectMarker]);

  const getColor = (community: string) => {
    return COMMUNITY_CENTERS[community as keyof typeof COMMUNITY_CENTERS]?.color ?? "#6B7280";
  };

  const createInfoContent = useCallback((m: MapMarkerData) => {
    const permissions = permissionsByScope.get(propertyScopeKey(mapMarkerScope(m)));
    const canViewOwnerName = Boolean(permissions?.canViewOwnerName);
    const canViewOwnerPhone = Boolean(permissions?.canViewOwnerPhone);
    const canViewOwnerEmail = user?.role === "master";
    const canViewOriginalPrice = Boolean(permissions?.canViewOriginalPrice);
    const canEdit = Boolean(permissions?.canEditProperties);
    // Being authorised makes this control available; it does not reveal owner
    // data until the user deliberately activates the toggle.
    const showSensitiveDetails = showOwners;
    const fmt = (n: number) => new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(n);
    const communityLabel = COMMUNITY_CENTERS[m.community as keyof typeof COMMUNITY_CENTERS]?.label ?? m.community;
    
    const escapeHtml = (value: string | number) => String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]!);
    let html = `<div style="font-family:system-ui;width:min(290px,calc(100vw - 90px));max-width:290px;max-height:min(430px,60vh);overflow:auto;padding:6px 4px 8px">`;
    html += `<div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#888;margin-bottom:4px">${escapeHtml(communityLabel)}</div>`;
    html += `<div style="font-size:16px;font-weight:600;margin-bottom:8px">${escapeHtml(m.label)}</div>`;

    if (m.detailLines?.length) {
      html += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin:-2px 0 7px">`;
      for (const line of m.detailLines) {
        html += `<span style="font-size:10px;color:#6b625b;background:#f4f0eb;border-radius:999px;padding:2px 7px">${escapeHtml(line)}</span>`;
      }
      html += `</div>`;
    }

    if (showSensitiveDetails && (canViewOwnerName || canViewOwnerPhone) && (m.owner || m.phone || m.ownerEmail)) {
      html += `<div style="margin:1px 0 8px;padding:8px;background:#eff6ff;border-radius:6px;border:1px solid #93c5fd">`;
      html += `<div style="font-size:10px;color:#1d4ed8;font-weight:700;text-transform:uppercase;letter-spacing:.06em">Owner · Authorized View</div>`;
      if (canViewOwnerName && m.owner) html += `<div style="font-size:14px;font-weight:700;margin-top:3px;color:#172554">${escapeHtml(m.owner)}</div>`;
      if (canViewOwnerPhone && m.phone) html += `<div style="font-size:14px;font-weight:800;color:#1d4ed8;margin-top:2px;direction:ltr;text-align:left;word-break:break-all">${escapeHtml(m.phone)}</div>`;
      if (canViewOwnerEmail && m.ownerEmail) html += `<div style="font-size:11px;color:#475569;margin-top:2px;overflow-wrap:anywhere">${escapeHtml(m.ownerEmail)}</div>`;
      html += `</div>`;
    } else if (showSensitiveDetails && (canViewOwnerName || canViewOwnerPhone)) {
      html += `<div style="margin:1px 0 7px;font-size:11px;color:#999;font-style:italic">Owner info not yet added</div>`;
    }
    
    if (m.landSqft || m.landSqm) {
      html += `<div style="font-size:12px;color:#555;margin-bottom:4px">Land: ${formatArea({ sqft: m.landSqft, sqm: m.landSqm }, areaUnit)}</div>`;
    }
    if (m.builtUpSqft || m.builtUpSqm) {
      html += `<div style="font-size:12px;color:#555;margin-bottom:4px">${m.builtUpLabel ?? "BUA"}: ${formatArea({ sqft: m.builtUpSqft, sqm: m.builtUpSqm }, areaUnit)}</div>`;
    }
    if (m.saleableSqft || m.saleableSqm) {
      html += `<div style="font-size:12px;color:#555;margin-bottom:4px">Saleable: ${formatArea({ sqft: m.saleableSqft, sqm: m.saleableSqm }, areaUnit)}</div>`;
    }
    if (m.bedrooms || m.unitType || m.model || m.status || m.developer) {
      const facts = [
        m.bedrooms ? `${m.bedrooms} BR` : "",
        m.unitType ?? "",
        m.model ? `Model ${m.model}` : "",
        m.status ? `Status: ${m.status}` : "",
        m.developer ? `Developer: ${m.developer}` : "",
      ].filter(Boolean);
      if (facts.length) html += `<div style="font-size:11px;color:#555;margin:5px 0 4px;line-height:1.45">${facts.join(" · ")}</div>`;
    }
    if (m.originalPrice && canViewOriginalPrice) {
      html += `<div style="margin-top:6px;padding:6px;background:#f6f3ff;border-radius:4px;border:1px solid #ddd6fe"><div style="font-size:10px;color:#6d28d9;font-weight:700;text-transform:uppercase">Original Price</div><div style="font-size:15px;font-weight:700;margin-top:2px">AED ${fmt(m.originalPrice)}</div></div>`;
    }
    
    if (m.lastPrice && (!m.transactions || m.transactions.length === 0)) {
      const typeLabel = m.saleType === "primary" ? "Primary" : "Resale";
      const typeColor = m.saleType === "primary" ? "#C75B12" : "#D97706";
      html += `<div style="margin-top:6px;padding:6px;background:#f9f5f0;border-radius:4px;border:1px solid #e5e0d8">`;
      html += `<div style="font-size:10px;color:${typeColor};font-weight:600;text-transform:uppercase">${typeLabel} · ${m.lastDate}</div>`;
      html += `<div style="font-size:15px;font-weight:700;margin-top:2px">AED ${fmt(m.lastPrice)}</div>`;
      if (m.landSqft && m.lastPrice) {
        html += `<div style="font-size:11px;color:#888;margin-top:2px">${fmt(Math.round(m.lastPrice / m.landSqft))} AED/sqft</div>`;
      }
      if (m.salesCount && m.salesCount > 1) {
        html += `<div style="font-size:11px;color:#888;margin-top:2px">${m.salesCount} recorded sales</div>`;
      }
      html += `</div>`;
    }

    if (m.transactions && m.transactions.length > 0) {
      html += `<div style="margin-top:7px;border:1px solid #e5e0d8;border-radius:4px;overflow:hidden">`;
      html += `<div style="padding:5px 7px;background:#f7f3ee;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#7c5b42">Transaction History · ${m.transactions.length}</div>`;
      html += `<div style="max-height:150px;overflow:auto;padding:3px 7px">`;
      for (const transaction of m.transactions) {
        const badgeColor = transaction.saleType === "primary" ? "#C75B12" : "#D97706";
        const badge = transaction.saleType === "primary" ? "P" : "S";
        html += `<div style="padding:6px 0;border-top:1px solid #eee6dd">`;
        html += `<div style="display:flex;align-items:center;gap:6px;font-size:11px">`;
        html += `<span style="color:${badgeColor};font-weight:700">${badge}</span>`;
        html += `<span style="color:#777">${transaction.date}</span></div>`;
        html += `<div style="margin:2px 0 0 18px;font-size:13px;font-weight:800;white-space:nowrap;color:#1f2937">AED ${fmt(transaction.priceAed)}</div>`;
        if (transaction.builtUpAreaSqm) {
          html += `<div style="margin:2px 0 0 18px;font-size:10px;color:#6b7280">BUA ${formatArea({ sqm: transaction.builtUpAreaSqm, sqft: transaction.builtUpAreaSqft ?? undefined }, areaUnit)}</div>`;
        }
        if (typeof transaction.areaDifferenceSqm === "number" && transaction.areaDifferenceSqm > 0.75) {
          html += `<div style="margin:2px 0 0 18px;font-size:9px;color:#92400e">Land match Δ ${transaction.areaDifferenceSqm.toFixed(2)} m²</div>`;
        }
        html += `</div>`;
        if (transaction.confidence === "possible") {
          html += `<div style="margin:-2px 0 5px 20px;color:#92400e;font-size:9px">Possible match · area difference ${transaction.areaDifferenceSqm?.toFixed(2) ?? "—"} m²</div>`;
        }
      }
      html += `</div></div>`;
    }

    if (m.askingPrice) {
      html += `<div style="margin-top:6px;padding:7px;background:#ecfdf5;border-radius:6px;border:1px solid #6ee7b7">`;
      html += `<div style="font-size:10px;color:#047857;font-weight:700;text-transform:uppercase">${m.availabilityStatus === "available" ? "Available" : "Current recorded price"}${m.availabilityDate ? ` · ${m.availabilityDate}` : ""}</div>`;
      html += `<div style="font-size:15px;font-weight:800;color:#065f46;margin-top:2px;white-space:nowrap">AED ${fmt(m.askingPrice)}</div>`;
      html += `</div>`;
    }

    if (m.availableForRent === true || m.rentPrice) {
      html += `<div style="margin-top:6px;padding:7px;background:#eff6ff;border-radius:6px;border:1px solid #bfdbfe">`;
      html += `<div style="font-size:10px;color:#1d4ed8;font-weight:700;text-transform:uppercase">${m.availableForRent === true ? "Available for rent" : "Recorded rental price"}</div>`;
      if (m.rentPrice) html += `<div style="font-size:15px;font-weight:800;color:#1e3a8a;margin-top:2px;white-space:nowrap">AED ${fmt(m.rentPrice)} / year</div>`;
      html += `</div>`;
    }

    if (m.listing) {
      const l = m.listing;
      html += `<div style="margin-top:6px;padding:6px;background:#ecfdf5;border-radius:4px;border:1px solid #6ee7b7">`;
      html += `<div style="font-size:10px;color:#065F46;font-weight:600;text-transform:uppercase">🟢 Listed on PropertyFinder</div>`;
      html += `<div style="font-size:15px;font-weight:700;margin-top:2px;color:#065F46">AED ${fmt(l.priceAed)}</div>`;
      html += `<div style="font-size:11px;color:#555;margin-top:2px">${l.bedrooms}BR ${l.type} · ${fmt(l.areaSqft)} sqft</div>`;
      html += `<div style="font-size:11px;color:#555;margin-top:2px">Agent: ${l.agent} (${l.agency})</div>`;
      html += `<div style="font-size:10px;color:#888;margin-top:2px">Listed ${l.listedAgo} ago</div>`;
      html += `<a href="${l.url}" target="_blank" style="display:inline-block;margin-top:4px;font-size:11px;color:#065F46;text-decoration:underline">View on PropertyFinder →</a>`;
      html += `</div>`;
    }

    if (m.floorplanHref) {
      html += `<a href="${m.floorplanHref}" target="_blank" rel="noopener noreferrer" style="display:block;margin-top:7px;padding:7px;border:1px solid #d6d3d1;border-radius:6px;color:#7c3f1f;font-size:11px;font-weight:700;text-align:center;text-decoration:none">Open developer Floorplan →</a>`;
    }
    if (m.dcrHref || m.dmtHref || m.googleMapsHref) {
      html += `<div style="display:flex;flex-wrap:wrap;gap:9px;margin-top:8px;font-size:11px;font-weight:700">`;
      if (m.dcrHref) html += `<a href="${m.dcrHref}" target="_blank" rel="noopener noreferrer" style="color:#7c3f1f">Open DCR ↗</a>`;
      if (m.dmtHref) html += `<a href="${m.dmtHref}" target="_blank" rel="noopener noreferrer" style="color:#7c3f1f">DMT ↗</a>`;
      if (m.googleMapsHref) html += `<a href="${m.googleMapsHref}" target="_blank" rel="noopener noreferrer" style="color:#7c3f1f">Google Maps ↗</a>`;
      html += `</div>`;
    }

    if (showSensitiveDetails && (canViewOwnerName || canViewOwnerPhone) && (m.tenant || m.tenantPhone || m.tenantEmail || m.tenancyStart || m.tenancyEnd)) {
      html += `<div style="margin-top:6px;padding:6px;background:#fef9ec;border-radius:4px;border:1px solid #f5d58b">`;
      html += `<div style="font-size:10px;color:#9a6700;font-weight:600;text-transform:uppercase">Tenant & Tenancy</div>`;
      if (canViewOwnerName && m.tenant) html += `<div style="font-size:13px;font-weight:600;margin-top:2px">${m.tenant}</div>`;
      if (canViewOwnerPhone && m.tenantPhone) html += `<div style="font-size:12px;color:#555;margin-top:1px">${m.tenantPhone}</div>`;
      if (canViewOwnerPhone && m.tenantEmail) html += `<div style="font-size:12px;color:#555;margin-top:1px;overflow-wrap:anywhere">${m.tenantEmail}</div>`;
      if (canViewOwnerName && (m.tenancyStart || m.tenancyEnd)) html += `<div style="font-size:11px;color:#555;margin-top:3px">Tenancy: ${m.tenancyStart ?? "—"} → ${m.tenancyEnd ?? "—"}</div>`;
      if (canViewOwnerName && m.tenancyContractReceived) html += `<div style="font-size:11px;color:#555;margin-top:1px">Contract: ${m.tenancyContractReceived}</div>`;
      html += `</div>`;
    }

    // Full Details, editing, and table navigation
    if (m.detailHref || m.tableHref) {
      const actions = Number(Boolean(m.detailHref)) + Number(Boolean(m.tableHref)) + Number(Boolean(canEdit && m.villaKey));
      html += `<div style="display:grid;grid-template-columns:repeat(${actions},minmax(0,1fr));gap:6px;margin-top:9px">`;
      if (m.detailHref) html += `<a href="${m.detailHref}" style="display:block;font-size:11px;font-weight:700;color:#fff;background:#C75B12;text-align:center;text-decoration:none;padding:8px 6px;border-radius:6px;">Full Details</a>`;
      if (m.tableHref) html += `<a href="${m.tableHref}" style="display:block;font-size:11px;font-weight:700;color:#7c3f1f;background:#fff7ed;border:1px solid #fed7aa;text-align:center;text-decoration:none;padding:8px 6px;border-radius:6px;">Project Table</a>`;
      if (canEdit && m.villaKey) html += `<button type="button" data-map-edit-marker="${m.id}" style="border:1px solid #7c3f1f;background:#fff;color:#7c3f1f;font-size:11px;font-weight:700;padding:8px 6px;border-radius:6px;cursor:pointer;">Edit</button>`;
      html += `</div>`;
    } else if (canEdit && m.villaKey) {
      html += `<button type="button" data-map-edit-marker="${m.id}" style="display:block;width:100%;margin-top:9px;border:1px solid #7c3f1f;background:#fff;color:#7c3f1f;font-size:11px;font-weight:700;padding:8px 6px;border-radius:6px;cursor:pointer;">Edit</button>`;
    }

    html += `</div>`;
    return html;
  }, [showOwners, areaUnit, permissionsByScope, user?.role]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    clustererRef.current?.clearMarkers();
    clustererRef.current = null;
    for (const marker of markersRef.current) marker.map = null;
    markersRef.current = [];
    markerPinsRef.current.clear();
    selectedPinIdRef.current = null;
    mapClickListenerRef.current?.remove();
    infoCloseListenerRef.current?.remove();
    infoWindowRef.current?.close();
    infoWindowRef.current = new google.maps.InfoWindow();
    const dismissInfoWindow = () => closeSelectedMarker();
    mapClickListenerRef.current = map.addListener("click", dismissInfoWindow);
    infoCloseListenerRef.current = infoWindowRef.current.addListener("closeclick", clearPlotDeepLink);

    // Create markers for all plots
    for (const m of markerData) {
      const isListed = !!m.listing;
      const isAvailable = m.availabilityStatus === "available";
      const color = getMapMarkerColor(m);
      const pin = document.createElement("div");
      pin.style.width = isListed || isAvailable ? "16px" : "12px";
      pin.style.height = isListed || isAvailable ? "16px" : "12px";
      pin.style.borderRadius = "50%";
      pin.style.backgroundColor = color;
      pin.style.border = isListed || isAvailable ? "3px solid #065F46" : "2px solid white";
      pin.style.boxShadow = isListed || isAvailable ? "0 0 8px rgba(16,185,129,0.6)" : "0 1px 3px rgba(0,0,0,0.3)";
      pin.style.cursor = "pointer";
      pin.style.transition = "transform 160ms cubic-bezier(0.23, 1, 0.32, 1), outline-color 160ms ease-out";
      pin.dataset.available = String(isListed || isAvailable);
      if (isListed || isAvailable) {
        pin.style.animation = "pulse 2s infinite";
        pin.style.zIndex = "10";
      }
      pin.dataset.community = m.community;
      markerPinsRef.current.set(m.id, pin);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: m.lat, lng: m.lng },
        content: pin,
        title: m.label,
      });

      marker.addListener("click", () => {
        selectMarker(m);
      });

      markersRef.current.push(marker);
    }

    // Render through the official clusterer instead of mounting 2,500+ DOM
    // markers at once. Dense Hidd/Lagoons points expand progressively as the
    // user zooms, which keeps mobile pan/zoom responsive.
    clustererRef.current = new MarkerClusterer({
      map,
      markers: markersRef.current,
    });

    // Deep-link only after every marker exists. The earlier effect-based version
    // could run before handleMapReady and never retry because refs do not rerender.
    if (plotParam) {
      const requestedIndex = markerData.findIndex((marker) => marker.villaKey === plotParam);
      const requestedData = markerData[requestedIndex];
      const requestedMarker = markersRef.current[requestedIndex];
      if (requestedData && requestedMarker) {
        window.setTimeout(() => {
          selectMarker(requestedData);
        }, 300);
      }
    }
  }, [markerData, plotParam, selectMarker, closeSelectedMarker, clearPlotDeepLink]);

  // MapView initialises Google Maps only once. Owner/listing overrides arrive
  // asynchronously after authentication, so rebuild the marker closures when
  // markerData changes; otherwise an already-rendered Map Card keeps the
  // pre-auth marker object with no owner name/phone.
  useEffect(() => {
    if (!mapRef.current) return;
    handleMapReady(mapRef.current);
  }, [handleMapReady]);

  useEffect(() => {
    if (!selectedMarker) return;
    const refreshed = markerData.find(marker => marker.id === selectedMarker.id);
    if (refreshed) setSelectedMarker(refreshed);
    else setSelectedMarker(null);
  }, [markerData, selectedMarker?.id]);

  useEffect(() => () => {
    mapClickListenerRef.current?.remove();
    infoCloseListenerRef.current?.remove();
    infoWindowRef.current?.close();
  }, []);

  const toggleSatellite = () => {
    if (!mapRef.current) return;
    const newMode = !isSatellite;
    setIsSatellite(newMode);
    mapRef.current.setMapTypeId(newMode ? "satellite" : "roadmap");
  };

  const filterByCommunity = (community: string | null) => {
    setActiveFilter(community);

    // Zoom to filtered community
    if (community && mapRef.current) {
      const center = COMMUNITY_CENTERS[community as keyof typeof COMMUNITY_CENTERS];
      if (center) {
        mapRef.current.setCenter({ lat: center.lat, lng: center.lng });
        mapRef.current.setZoom(community === "st-regis" ? 16 : 15);
      }
    } else if (mapRef.current) {
      mapRef.current.setCenter({ lat: 24.5460, lng: 54.4300 });
      mapRef.current.setZoom(14);
    }
  };

  const markerMatchesFilters = useCallback((data: MapMarkerData) => {
    if (activeFilter && data.community !== activeFilter) return false;
    if (phaseParam && data.slPhase !== phaseParam) return false;
    if (!isWithinAreaRange({ sqm: data.landSqm, sqft: data.landSqft }, areaUnit, areaMin, areaMax)) return false;
    const q = mapQuery.trim().toLowerCase();
    if (!q) return true;
    const textMatch = `${data.label} ${data.villaKey ?? ""} ${COMMUNITY_CENTERS[data.community as keyof typeof COMMUNITY_CENTERS]?.label ?? ""}`
      .toLowerCase()
      .includes(q);
    return textMatch || matchesAreaQuery(q, { sqm: data.landSqm, sqft: data.landSqft });
  }, [activeFilter, areaUnit, areaMin, areaMax, mapQuery, phaseParam]);

  useEffect(() => {
    const clusterer = clustererRef.current;
    if (!clusterer) return;
    const visibleMarkers = markersRef.current.filter((_, index) => markerMatchesFilters(markerData[index]));
    clusterer.clearMarkers();
    clusterer.addMarkers(visibleMarkers);
  }, [markerData, markerMatchesFilters]);

  const visibleMarkerCount = markerData.filter(markerMatchesFilters).length;

  const mapProjectFilters = (
    <div
      className="flex max-w-full items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Map project filters"
    >
      <Button
        variant={activeFilter === null ? "default" : "outline"}
        size="sm"
        onClick={() => filterByCommunity(null)}
        className="h-7 shrink-0 text-xs"
      >
        <Layers className="mr-1 h-3 w-3" /> All projects
      </Button>
      {Object.entries(COMMUNITY_CENTERS).map(([key, val]) => (
        <Button
          key={key}
          variant={activeFilter === key ? "default" : "outline"}
          size="sm"
          onClick={() => filterByCommunity(key)}
          className="h-7 shrink-0 text-xs"
          aria-pressed={activeFilter === key}
        >
          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: val.color }} />
          {val.label}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="h-[100dvh] min-h-0 flex flex-col bg-background overflow-hidden overscroll-none">
      {!isHeaderCollapsed && (
        <SiteHeader fixed compact onCollapse={() => setIsHeaderCollapsed(true)} mapProjectFilters={mapProjectFilters} />
      )}
      {/* Full screen map container */}
      <div className={`flex-1 min-h-0 relative transition-[padding] duration-200 ${isHeaderCollapsed ? "pt-0" : "pt-[86px] sm:pt-[90px]"}`}>
        <div className="relative h-full min-h-0">
        {/* Controls overlay */}
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap gap-2 pointer-events-none">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg px-2.5 py-2 shadow-md border border-border/50">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={mapQuery}
                onChange={(event) => {
                  setMapQuery(event.target.value);
                  setMapSearchOpen(true);
                }}
                onFocus={() => setMapSearchOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    if (smartSearchResults[0]) {
                      event.preventDefault();
                      selectSearchResult(smartSearchResults[0]);
                    } else if (fahidSearchResults[0]) {
                      event.preventDefault();
                      window.location.assign(fahidSearchResults[0].href);
                    }
                  }
                  if (event.key === "Escape") setMapSearchOpen(false);
                }}
                placeholder="Project + unit · Lagoons 11102"
                className="h-8 w-40 pl-7 text-xs bg-card"
              />
              {mapSearchOpen && mapQuery.trim() && (
                <div className="absolute left-0 top-full z-40 mt-1 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-border bg-card shadow-xl">
                  {smartSearchResults.length === 0 && fahidSearchResults.length === 0 && !isFahidProjectSearch ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">{fahidSearch.isFetching ? "Searching documented Fahid units…" : "No mapped unit or documented Fahid unit matches this search."}</div>
                  ) : (
                    <ul className="max-h-72 overflow-y-auto">
                      {isFahidProjectSearch ? (
                        <li>
                          <Link
                            href="/aldar-other/thebeachhouse"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => { setMapSearchOpen(false); setMapQuery(""); }}
                            className="flex w-full items-center gap-2 border-b border-border bg-sky-50/70 px-3 py-2.5 text-left hover:bg-sky-100/70 dark:bg-sky-950/20"
                          >
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" />
                            <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-foreground">The Beach House Fahid · all units</span><span className="block text-[0.65rem] text-muted-foreground">Open the complete unit register. No physical pin is shown until source coordinates are registered.</span></span>
                            <span className="text-[0.62rem] font-mono text-primary">Open</span>
                          </Link>
                        </li>
                      ) : null}
                      {smartSearchResults.map(marker => (
                        <li key={marker.id}>
                          <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectSearchResult(marker)}
                            className="flex w-full items-center gap-2 border-b border-border/70 px-3 py-2 text-left last:border-b-0 hover:bg-secondary/50"
                          >
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: getMapMarkerColor(marker) }} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-semibold text-foreground">{marker.label}</span>
                              <span className="block truncate text-[0.65rem] text-muted-foreground">{COMMUNITY_CENTERS[marker.community as keyof typeof COMMUNITY_CENTERS]?.label ?? marker.community}{marker.slPhase ? ` · ${marker.slPhase}` : ""}</span>
                            </span>
                            <span className="text-[0.62rem] font-mono text-primary">Open</span>
                          </button>
                        </li>
                      ))}
                      {fahidSearchResults.length ? (
                        <li className="border-t border-border bg-muted/30 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Fahid inventory · card links</li>
                      ) : null}
                      {fahidSearchResults.map(unit => (
                        <li key={`${unit.projectSlug}/${unit.buildingSlug}/${unit.unitName}`}>
                          <Link
                            href={unit.href}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => { setMapSearchOpen(false); setMapQuery(""); }}
                            className="flex w-full items-center gap-2 border-b border-border/70 px-3 py-2 text-left last:border-b-0 hover:bg-secondary/50"
                          >
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-semibold text-foreground">{unit.unitName}</span>
                              <span className="block truncate text-[0.65rem] text-muted-foreground">{unit.projectName} · {unit.buildingName ?? "Building"}{unit.bedrooms ? ` · ${unit.bedrooms}BR` : ""}</span>
                            </span>
                            <span className="text-[0.62rem] font-mono text-primary">Open card</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <AreaFilterControls
              unit={areaUnit}
              onUnitChange={setAreaUnit}
              min={areaMin}
              max={areaMax}
              onMinChange={setAreaMin}
              onMaxChange={setAreaMax}
              compact
            />
            <span className="font-mono text-[0.65rem] text-muted-foreground whitespace-nowrap">{visibleMarkerCount} shown</span>
          </div>
          <div className="pointer-events-auto ml-auto flex gap-1.5">
            {isHeaderCollapsed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHeaderCollapsed(false)}
                className="text-xs h-7 bg-background/90 backdrop-blur-sm shadow-md"
                aria-label="Show map header"
                title="Show header"
              >
                <ChevronDown className="h-3.5 w-3.5 mr-1" /> Header
              </Button>
            )}
            <Button
              variant={isSatellite ? "default" : "outline"}
              size="sm"
              onClick={toggleSatellite}
              className="text-xs h-7 bg-background/90 backdrop-blur-sm shadow-md"
            >
              {isSatellite ? "Map" : "Satellite"}
            </Button>
            <Button
              variant={showOwners ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOwners(!showOwners)}
              className="text-xs h-7 bg-background/90 backdrop-blur-sm shadow-md"
            >
              {showOwners ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {showOwners ? "Hide" : "Owner & Tenant"}
            </Button>
          </div>
        </div>
        {/* Availability key only: project colors now live in the collapsible Header. */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <div className="pointer-events-auto inline-flex bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-800 shadow-[0_0_4px_rgba(16,185,129,0.6)]" />
              <span className="font-medium text-emerald-700">Available ({markerData.filter(m => m.availabilityStatus === "available").length}) · Listed ({markerData.filter(m => m.listing).length})</span>
            </div>
          </div>
        </div>
        {/* Map fills remaining space */}
        <MapView
          className="h-full w-full touch-none"
          initialCenter={{ lat: 24.5460, lng: 54.4300 }}
          initialZoom={14}
          onMapReady={handleMapReady}
          layoutVersion={isHeaderCollapsed ? 1 : 0}
        />
        {selectedMarker && (
          <aside
            aria-label={`${selectedMarker.label} details`}
            className="absolute z-30 right-3 top-3 bottom-3 w-[min(380px,calc(100%-1.5rem))] overflow-hidden rounded-xl border border-border bg-background/97 shadow-2xl backdrop-blur-md touch-pan-y md:top-4 md:right-4 md:bottom-4 max-md:top-auto max-md:left-3 max-md:right-3 max-md:bottom-3 max-md:w-auto max-md:max-h-[48dvh]"
            onClick={(event) => {
              const target = event.target as HTMLElement;
              const editButton = target.closest<HTMLButtonElement>(`[data-map-edit-marker="${selectedMarker.id}"]`);
              if (editButton) {
                event.preventDefault();
                setEditingMarker(selectedMarker);
              }
            }}
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-[0.68rem] font-mono uppercase tracking-[0.14em] text-muted-foreground">Selected unit</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeSelectedMarker} aria-label="Close selected unit card">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[calc(100%-49px)] overflow-y-auto overscroll-contain px-3 py-2 touch-pan-y" dangerouslySetInnerHTML={{ __html: createInfoContent(selectedMarker) }} />
          </aside>
        )}
        {editingMarker?.villaKey && (
          <ListingEditor
            open={Boolean(editingMarker)}
            onOpenChange={open => !open && setEditingMarker(null)}
            villaKey={editingMarker.villaKey}
            community={editingMarker.community}
            phaseKey={mapMarkerScope(editingMarker).phaseKey}
            buildingKey={mapMarkerScope(editingMarker).buildingKey}
            unitTypeKey={mapMarkerScope(editingMarker).unitTypeKey}
            bedrooms={mapMarkerScope(editingMarker).bedrooms}
            villaLabel={editingMarker.label}
          />
        )}
        </div>
      </div>
    </div>
  );
}

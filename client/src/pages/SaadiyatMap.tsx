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
import { useSearch } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Layers, Search } from "lucide-react";
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
import hiddDataRaw from "../../../server/data/hidd_al_saadiyat.json";
import { lagoonsVillaCoords } from "@/data/lagoonsCoordinates";
import { FOUR_SEASONS_VILLAS } from "@/data/fourSeasons";
import { FOUR_SEASONS_FLOORPLAN_BY_VILLA } from "@/data/fourSeasonsFloorplans";
import { getFourSeasonsTransactions } from "@/data/fourSeasonsTransactions";
import { SAADIYAT_RESERVE_RECORDS } from "@/data/saadiyatReserve";
import { LAGOONS_HIDDEN_SL9_PLOTS } from "@/data/lagoonsHiddenSl9";
import { LAGOONS_SL10_PLOTS, LAGOONS_SL13_PLOTS } from "@/data/lagoonsDcrPhases";
import { getAvailability } from "@/data/lagoonsAvailability";
import AreaFilterControls from "@/components/AreaFilterControls";
import { ListingEditor } from "@/components/ListingEditor";
import { trpc } from "@/lib/trpc";
import {
  formatArea,
  isWithinAreaRange,
  matchesAreaQuery,
  type AreaUnit,
} from "@/lib/areaSearch";

// Known community centers on Saadiyat Island
export const COMMUNITY_CENTERS = {
  "st-regis": { lat: 24.5381, lng: 54.4246, label: "St. Regis Villas", color: "#C75B12" },
  "jawaher": { lat: 24.5465, lng: 54.4340, label: "Jawaher", color: "#2563EB" },
  "saadiyat-beach-villas": { lat: 24.5520, lng: 54.4280, label: "Saadiyat Beach Villas", color: "#0C4A6E" },
  "saadiyat-golf-views": { lat: 24.5440, lng: 54.4400, label: "Golf Views", color: "#7C3AED" },
  "hidd": { lat: 24.5580, lng: 54.4150, label: "Hidd Al Saadiyat", color: "#DC2626" },
  "private-villas": { lat: 24.5395, lng: 54.4200, label: "Private Villas (Four Seasons)", color: "#CA8A04" },
  "lagoons": { lat: 24.5309, lng: 54.4378, label: "Saadiyat Lagoons", color: "#0891B2" },
  "four-seasons": { lat: 24.5508, lng: 54.4421, label: "Four Seasons Private Residences", color: "#334155" },
  "huge-plot": { lat: 24.55285144, lng: 54.44457573, label: "Huge Plot Between Four Seasons and Omniyat", color: "#A16207" },
  "saadiyat-reserve": { lat: 24.5232, lng: 54.4427, label: "Saadiyat Reserve · Dunes", color: "#B45309" },
  "lagoons-hidden-sl9": { lat: 24.5395, lng: 54.4425, label: "Lagoons · Hidden Phase SL9", color: "#475569" },
  "lagoons-hidden-sl10": { lat: 24.5402, lng: 54.4454, label: "Lagoons · Hidden Phase SL10", color: "#7C3AED" },
  "lagoons-sl13": { lat: 24.5401, lng: 54.4422, label: "Lagoons · Phase SL13", color: "#0F766E" },
};

interface MapMarkerData {
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
  detailHref?: string;
  tableHref?: string;
  detailLines?: string[];
  availabilityStatus?: "available";
  availabilityDate?: string;
  askingPrice?: number;
  floorplanHref?: string;
  dcrHref?: string;
  dmtHref?: string;
  googleMapsHref?: string;
  markerColor?: string;
}

export function getMapMarkerColor(marker: Pick<MapMarkerData, "community" | "availabilityStatus" | "listing" | "markerColor">) {
  if (marker.availabilityStatus === "available" || marker.listing) return "#10B981";
  return marker.markerColor ?? COMMUNITY_CENTERS[marker.community as keyof typeof COMMUNITY_CENTERS]?.color ?? "#6B7280";
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
  owner1Name?: string;
  owner1Email?: string;
  owner1Mobile?: string;
  owner2Name?: string;
  owner2Email?: string;
  owner2Mobile?: string;
  ownerRepName?: string;
  ownerRepEmail?: string;
  ownerRepMobile?: string;
  tenantName?: string;
  tenantEmail?: string;
  tenantMobile?: string;
  tenancyStart?: string;
  tenancyEnd?: string;
  tenancyContractReceived?: string;
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
      unitType: hiddVilla?.villaType || undefined,
      status: hiddVilla?.tenancyStart && !hiddVilla?.tenancyEnd ? "Occupied" : undefined,
      developer: "Hidd Al Saadiyat",
      owner: [hiddVilla?.owner1Name, hiddVilla?.owner2Name].filter(Boolean).join(" · ") || undefined,
      phone: [hiddVilla?.owner1Mobile, hiddVilla?.owner2Mobile].filter(Boolean).join(" · ") || undefined,
      ownerEmail: [hiddVilla?.owner1Email, hiddVilla?.owner2Email].filter(Boolean).join(" · ") || undefined,
      tenant: hiddVilla?.tenantName || undefined,
      tenantPhone: hiddVilla?.tenantMobile || undefined,
      tenantEmail: hiddVilla?.tenantEmail || undefined,
      tenancyStart: hiddVilla?.tenancyStart || undefined,
      tenancyEnd: hiddVilla?.tenancyEnd || undefined,
      tenancyContractReceived: hiddVilla?.tenancyContractReceived || undefined,
      villaKey: `hidd/${hv.villaNumber}/${hv.street}`,
      detailHref: `/hidd-al-saadiyat`,
      tableHref: `/hidd-al-saadiyat?view=table#villa-${hv.villaNumber}`,
      detailLines: [
        `Street ${hv.street === "BOULEVARD" ? "Boulevard / Al Dhiba" : hv.street}`,
        hiddVilla?.bedrooms ? `${hiddVilla.bedrooms.replace(/\.0$/, "")} bedrooms` : "",
        hiddVilla?.villaType ? `Type ${hiddVilla.villaType}` : "",
        hiddVilla?.plotNumberAlJaber ? `Plot ${hiddVilla.plotNumberAlJaber}` : "",
        hiddVilla?.admPlotNumber ? `ADM ${hiddVilla.admPlotNumber}` : "",
        sourceLabel,
      ].filter(Boolean),
      googleMapsHref: `https://www.google.com/maps?q=${hv.lat},${hv.lng}`,
    });
  }

  // Lagoons — coordinates derived from masterplan map_x/map_y
  for (const lv of lagoonsVillaCoords) {
    const shortName = lv.unit_name.replace(/^(AlGhaf|AlSidr|Ethir)-/, '');
    const clusterLabel = lv.cluster === 'al-ghaf' ? 'Al Ghaf' : lv.cluster === 'al-sidr' ? 'Al Sidr' : 'Ethir';
    const availability = getAvailability(`Lagoons-${lv.unit_name.replace(/^(AlGhaf|AlSidr|Ethir)-/, "$1-V-")}`);
    const confirmedAvailable = Boolean(availability.nasLuxury || availability.aldar.length);
    const resalePrice = availability.nasLuxury?.selling_price_aed
      ?? availability.aldar[0]?.asking_price_aed
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
      unitType: lv.unit_type || undefined,
      model: lv.model || undefined,
      status: lv.status || undefined,
      developer: "Aldar",
      originalPrice: lv.original_price_aed || undefined,
      lastPrice: resalePrice,
      saleType: resalePrice ? "resale" : undefined,
      availabilityStatus: confirmedAvailable ? "available" : undefined,
      askingPrice: resalePrice,
      availabilityDate: confirmedAvailable ? "current resale source" : undefined,
      villaKey: `lagoons/${lv.unit_name}`,
      detailHref: `/saadiyat-lagoons/${lv.cluster}/${encodeURIComponent(lv.unit_name)}`,
      tableHref: `/saadiyat-lagoons/${lv.cluster}?view=table#unit-${encodeURIComponent(lv.unit_name)}`,
      detailLines: [clusterLabel, coordinateSource].filter(Boolean),
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
  const [showOwners, setShowOwners] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [baseMarkerData] = useState<MapMarkerData[]>(() => buildMarkers());
  const [editingMarker, setEditingMarker] = useState<MapMarkerData | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const [mapQuery, setMapQuery] = useState("");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqm");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const searchString = useSearch();
  const plotParam = new URLSearchParams(searchString).get("plot");
  const propertyOverrides = trpc.villaListings.listByCommunity.useQuery({});
  const projectPermissions = trpc.propertyAccess.permissions.useQuery(
    { projects: Object.keys(COMMUNITY_CENTERS) },
    { enabled: Boolean(user) },
  );
  const permissionsByProject = useMemo(
    () => new Map(projectPermissions.data?.map(item => [item.projectKey, item.permissions]) ?? []),
    [projectPermissions.data],
  );
  const markerData = useMemo(() => {
    const overridesByKey = new Map((propertyOverrides.data ?? []).map(row => [row.villaKey, row]));
    return baseMarkerData.filter(marker => {
      if (user?.role === "admin" || user?.role === "master") return true;
      return permissionsByProject.get(marker.community)?.canAccess === true;
    }).map(marker => {
      const override = marker.villaKey ? overridesByKey.get(marker.villaKey) : undefined;
      if (!override) return marker;
      const hasManualStatus = override.status && override.status !== "draft";
      return {
        ...marker,
        landSqm: override.landAreaSqm ?? marker.landSqm,
        landSqft: override.landAreaSqm != null ? Math.round(override.landAreaSqm * 10.7639) : marker.landSqft,
        builtUpSqm: override.builtUpAreaSqm ?? marker.builtUpSqm,
        builtUpSqft: override.builtUpAreaSqm != null ? Math.round(override.builtUpAreaSqm * 10.7639) : marker.builtUpSqft,
        status: hasManualStatus ? override.status : marker.status,
        askingPrice: override.askingPriceAed ?? marker.askingPrice,
        availabilityStatus: hasManualStatus
          ? (override.status === "available" ? "available" : undefined)
          : marker.availabilityStatus,
        owner: (override as any).ownerName ?? marker.owner,
        phone: (override as any).ownerPhone ?? marker.phone,
      };
    });
  }, [baseMarkerData, permissionsByProject, propertyOverrides.data, user?.role]);

  const getColor = (community: string) => {
    return COMMUNITY_CENTERS[community as keyof typeof COMMUNITY_CENTERS]?.color ?? "#6B7280";
  };

  const createInfoContent = useCallback((m: MapMarkerData) => {
    const permissions = permissionsByProject.get(m.community);
    const canViewOwnerName = user?.role === "admin" || user?.role === "master" || Boolean(permissions?.canViewOwnerName);
    const canViewOwnerPhone = user?.role === "admin" || user?.role === "master" || Boolean(permissions?.canViewOwnerPhone);
    const canViewOriginalPrice = user?.role === "admin" || user?.role === "master" ||
      Boolean(permissions?.canViewOriginalPrice);
    const canEdit = user?.role === "admin" || user?.role === "master" ||
      Boolean(permissions?.canEditProperties);
    const fmt = (n: number) => new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(n);
    const communityLabel = COMMUNITY_CENTERS[m.community as keyof typeof COMMUNITY_CENTERS]?.label ?? m.community;
    
    let html = `<div style="font-family:system-ui;width:min(290px,calc(100vw - 90px));max-width:290px;max-height:min(430px,60vh);overflow:auto;padding:6px 4px 8px">`;
    html += `<div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#888;margin-bottom:4px">${communityLabel}</div>`;
    html += `<div style="font-size:16px;font-weight:600;margin-bottom:8px">${m.label}</div>`;

    if (m.detailLines?.length) {
      html += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin:-2px 0 7px">`;
      for (const line of m.detailLines) {
        html += `<span style="font-size:10px;color:#6b625b;background:#f4f0eb;border-radius:999px;padding:2px 7px">${line}</span>`;
      }
      html += `</div>`;
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

    if (m.availabilityStatus === "available" && m.askingPrice) {
      html += `<div style="margin-top:6px;padding:7px;background:#ecfdf5;border-radius:6px;border:1px solid #6ee7b7">`;
      html += `<div style="font-size:10px;color:#047857;font-weight:700;text-transform:uppercase">Available · ${m.availabilityDate ?? "current list"}</div>`;
      html += `<div style="font-size:15px;font-weight:800;color:#065f46;margin-top:2px;white-space:nowrap">AED ${fmt(m.askingPrice)}</div>`;
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

    if (showOwners && (canViewOwnerName || canViewOwnerPhone) && (m.owner || m.phone || m.ownerEmail)) {
      html += `<div style="margin-top:6px;padding:6px;background:#f0f4f9;border-radius:4px;border:1px solid #d0dae8">`;
      html += `<div style="font-size:10px;color:#2563EB;font-weight:600;text-transform:uppercase">Owner Info</div>`;
      if (canViewOwnerName && m.owner) html += `<div style="font-size:13px;font-weight:600;margin-top:2px">${m.owner}</div>`;
      if (canViewOwnerPhone && m.phone) html += `<div style="font-size:12px;color:#555;margin-top:1px">${m.phone}</div>`;
      if (canViewOwnerPhone && m.ownerEmail) html += `<div style="font-size:12px;color:#555;margin-top:1px;overflow-wrap:anywhere">${m.ownerEmail}</div>`;
      html += `</div>`;
    } else if (showOwners && (canViewOwnerName || canViewOwnerPhone)) {
      html += `<div style="margin-top:6px;font-size:11px;color:#999;font-style:italic">Owner info not yet added</div>`;
    }

    if (showOwners && (canViewOwnerName || canViewOwnerPhone) && (m.tenant || m.tenantPhone || m.tenantEmail || m.tenancyStart || m.tenancyEnd)) {
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
  }, [showOwners, areaUnit, permissionsByProject, user?.role]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();
    const openInfoWindow = (data: MapMarkerData, marker: google.maps.marker.AdvancedMarkerElement) => {
      infoWindowRef.current!.setContent(createInfoContent(data));
      infoWindowRef.current!.open(map, marker);
      google.maps.event.addListenerOnce(infoWindowRef.current!, "domready", () => {
        const editButton = document.querySelector<HTMLButtonElement>(`[data-map-edit-marker="${data.id}"]`);
        editButton?.addEventListener("click", () => {
          setEditingMarker(data);
          infoWindowRef.current?.close();
        });
      });
    };

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
      if (isListed || isAvailable) {
        pin.style.animation = "pulse 2s infinite";
        pin.style.zIndex = "10";
      }
      pin.dataset.community = m.community;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: m.lat, lng: m.lng },
        content: pin,
        title: m.label,
      });

      marker.addListener("click", () => {
        openInfoWindow(m, marker);
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
        map.setCenter({ lat: requestedData.lat, lng: requestedData.lng });
        map.setZoom(18);
        window.setTimeout(() => {
          openInfoWindow(requestedData, requestedMarker);
        }, 300);
      }
    }
  }, [markerData, createInfoContent, plotParam]);

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
    if (!isWithinAreaRange({ sqm: data.landSqm, sqft: data.landSqft }, areaUnit, areaMin, areaMax)) return false;
    const q = mapQuery.trim().toLowerCase();
    if (!q) return true;
    const textMatch = `${data.label} ${data.villaKey ?? ""} ${COMMUNITY_CENTERS[data.community as keyof typeof COMMUNITY_CENTERS]?.label ?? ""}`
      .toLowerCase()
      .includes(q);
    return textMatch || matchesAreaQuery(q, { sqm: data.landSqm, sqft: data.landSqft });
  }, [activeFilter, areaUnit, areaMin, areaMax, mapQuery]);

  useEffect(() => {
    const clusterer = clustererRef.current;
    if (!clusterer) return;
    const visibleMarkers = markersRef.current.filter((_, index) => markerMatchesFilters(markerData[index]));
    clusterer.clearMarkers();
    clusterer.addMarkers(visibleMarkers);
  }, [markerData, markerMatchesFilters]);

  const visibleMarkerCount = markerData.filter(markerMatchesFilters).length;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <SiteHeader />
      {/* Full screen map container */}
      <div className="flex-1 relative">
        {/* Controls overlay */}
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap gap-2 pointer-events-none">
          <div className="pointer-events-auto flex flex-wrap gap-1.5 bg-background/90 backdrop-blur-sm rounded-lg px-2.5 py-2 shadow-md border border-border/50">
            <Button
              variant={activeFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => filterByCommunity(null)}
              className="text-xs h-7"
            >
              <Layers className="h-3 w-3 mr-1" /> All
            </Button>
            {Object.entries(COMMUNITY_CENTERS).map(([key, val]) => (
              <Button
                key={key}
                variant={activeFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => filterByCommunity(key)}
                className="text-xs h-7"
              >
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: val.color }} />
                <span className="hidden sm:inline">{val.label}</span>
              </Button>
            ))}
          </div>
          <div className="pointer-events-auto flex flex-wrap items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg px-2.5 py-2 shadow-md border border-border/50">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={mapQuery}
                onChange={(event) => setMapQuery(event.target.value)}
                placeholder="Plot or area…"
                className="h-8 w-40 pl-7 text-xs bg-card"
              />
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
        {/* Legend overlay bottom */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <div className="pointer-events-auto flex flex-wrap gap-3 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-800 shadow-[0_0_4px_rgba(16,185,129,0.6)]" />
              <span className="font-medium text-emerald-700">Available ({markerData.filter(m => m.availabilityStatus === "available").length}) · Listed ({markerData.filter(m => m.listing).length})</span>
            </div>
            {Object.entries(COMMUNITY_CENTERS).map(([key, val]) => {
              const count = markerData.filter(m => m.community === key).length;
              return (
                <div key={key} className="flex items-center gap-1.5 hidden sm:flex">
                  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: val.color }} />
                  <span>{val.label} ({count})</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Map fills remaining space */}
        <MapView
          className="h-full w-full"
          initialCenter={{ lat: 24.5460, lng: 54.4300 }}
          initialZoom={14}
          onMapReady={handleMapReady}
        />
        {editingMarker?.villaKey && (
          <ListingEditor
            open={Boolean(editingMarker)}
            onOpenChange={open => !open && setEditingMarker(null)}
            villaKey={editingMarker.villaKey}
            community={editingMarker.community}
            villaLabel={editingMarker.label}
          />
        )}
      </div>
    </div>
  );
}

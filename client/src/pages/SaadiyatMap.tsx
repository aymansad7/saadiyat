/**
 * Interactive Map — Saadiyat Island
 * Shows all villas/plots as colored dots on Google Maps.
 * Click a dot → info window with full details.
 * Toggle button to show/hide owner info (ready for future data).
 */
import { useRef, useState, useCallback } from "react";
import { MapView } from "@/components/Map";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Layers } from "lucide-react";
import { villas } from "@/data/villas";
import { COMMUNITIES } from "@/data/communities";
import { getPlotLandArea } from "@/data/plotLandAreas";
import { getVillaTransactions } from "@/data/stregisTransactions";
import { jawaherPlotHistories } from "@/data/jawaherTransactions";
import { golfViewsPlotData } from "@/data/golfViewsPlotData";
import { plotCoordinates } from "@/data/plotCoordinates";
import { pfListings, findListingByArea, PF_SUMMARY } from "@/data/propertyFinderListings";
import type { PFListing } from "@/data/propertyFinderListings";

// Known community centers on Saadiyat Island
const COMMUNITY_CENTERS = {
  "st-regis": { lat: 24.5381, lng: 54.4246, label: "St. Regis Villas", color: "#C75B12" },
  "jawaher": { lat: 24.5465, lng: 54.4340, label: "Jawaher", color: "#2563EB" },
  "saadiyat-beach-villas": { lat: 24.5520, lng: 54.4280, label: "Saadiyat Beach Villas", color: "#059669" },
  "saadiyat-golf-views": { lat: 24.5440, lng: 54.4400, label: "Golf Views", color: "#7C3AED" },
  "hidd": { lat: 24.5580, lng: 54.4150, label: "Hidd Al Saadiyat", color: "#DC2626" },
  "private-villas": { lat: 24.5395, lng: 54.4200, label: "Private Villas (Four Seasons)", color: "#CA8A04" },
};

interface MapMarkerData {
  id: string;
  lat: number;
  lng: number;
  community: string;
  label: string;
  landSqft?: number;
  landSqm?: number;
  lastPrice?: number;
  lastDate?: string;
  saleType?: string;
  salesCount?: number;
  owner?: string;
  phone?: string;
  listing?: PFListing;
}

function buildMarkers(): MapMarkerData[] {
  const markers: MapMarkerData[] = [];

  // St. Regis — exact coordinates from villas.ts
  for (const v of villas) {
    const txs = getVillaTransactions(v.id);
    const lastTx = txs.length > 0 ? txs[txs.length - 1] : null;
    const dcrCoord = plotCoordinates[`st-regis/Plot-${v.id}`];
    const area = getPlotLandArea(`st-regis/Plot-${v.id}`);
    const listing = area ? findListingByArea("st-regis", area.sqft) : undefined;
    markers.push({
      id: `st-regis-${v.id}`,
      lat: dcrCoord?.lat ?? v.latitude,
      lng: dcrCoord?.lng ?? v.longitude,
      community: "st-regis",
      label: `Plot ${v.id}`,
      landSqft: v.plotAreaSqm ? Math.round(v.plotAreaSqm * 10.7639) : undefined,
      landSqm: v.plotAreaSqm ?? undefined,
      lastPrice: lastTx?.priceAed,
      lastDate: lastTx?.date,
      saleType: lastTx?.saleType,
      salesCount: txs.length || undefined,
      listing,
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
    const txData = jawaherPlotHistories[i];
    const lastTx = txData?.transactions?.[txData.transactions.length - 1];
    const landSqft = area?.sqft ?? txData?.landSqft;
    const listing = landSqft ? findListingByArea("jawaher", landSqft) : undefined;
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
      listing,
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
      lastPrice: lastTx?.priceAed,
      lastDate: lastTx?.date,
      saleType: lastTx?.saleType,
      salesCount: plotData?.transactions?.length || undefined,
    });
  }

  // SBV — real coordinates from DCR
  const sbvComm = COMMUNITIES.find(c => c.slug === "saadiyat-beach-villas");
  if (sbvComm?.gates) {
    for (const gate of sbvComm.gates) {
      for (const p of gate.plots) {
        const coord = plotCoordinates[p.villaKey];
        if (!coord) continue;
        const area = getPlotLandArea(p.villaKey);
        markers.push({
          id: `sbv-${p.villaKey}`,
          lat: coord.lat, lng: coord.lng,
          community: "saadiyat-beach-villas",
          label: p.label,
          landSqft: area?.sqft,
          landSqm: area?.sqm,
        });
      }
    }
  }

  // Private Villas — real coordinates from DCR
  const pvComm = COMMUNITIES.find(c => c.slug === "private-villas");
  const pvPlots = pvComm?.flatPlots ?? [];
  for (let i = 0; i < pvPlots.length; i++) {
    const p = pvPlots[i];
    const coord = plotCoordinates[p.villaKey];
    if (!coord) continue;
    markers.push({
      id: `pv-${p.id}`,
      lat: coord.lat, lng: coord.lng,
      community: "private-villas",
      label: p.label,
    });
  }

  return markers;
}

export default function SaadiyatMap() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [showOwners, setShowOwners] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [markerData] = useState<MapMarkerData[]>(() => buildMarkers());

  const getColor = (community: string) => {
    return COMMUNITY_CENTERS[community as keyof typeof COMMUNITY_CENTERS]?.color ?? "#6B7280";
  };

  const createInfoContent = useCallback((m: MapMarkerData) => {
    const fmt = (n: number) => new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(n);
    const communityLabel = COMMUNITY_CENTERS[m.community as keyof typeof COMMUNITY_CENTERS]?.label ?? m.community;
    
    let html = `<div style="font-family:system-ui;max-width:280px;padding:4px">`;
    html += `<div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#888;margin-bottom:4px">${communityLabel}</div>`;
    html += `<div style="font-size:16px;font-weight:600;margin-bottom:8px">${m.label}</div>`;
    
    if (m.landSqft) {
      html += `<div style="font-size:12px;color:#555;margin-bottom:4px">🏗️ Land: ${fmt(m.landSqft)} sqft (${m.landSqm ? m.landSqm.toFixed(0) : Math.round(m.landSqft * 0.092903)} m²)</div>`;
    }
    
    if (m.lastPrice) {
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

    if (showOwners && (m.owner || m.phone)) {
      html += `<div style="margin-top:6px;padding:6px;background:#f0f4f9;border-radius:4px;border:1px solid #d0dae8">`;
      html += `<div style="font-size:10px;color:#2563EB;font-weight:600;text-transform:uppercase">Owner Info</div>`;
      if (m.owner) html += `<div style="font-size:13px;font-weight:600;margin-top:2px">${m.owner}</div>`;
      if (m.phone) html += `<div style="font-size:12px;color:#555;margin-top:1px">${m.phone}</div>`;
      html += `</div>`;
    } else if (showOwners) {
      html += `<div style="margin-top:6px;font-size:11px;color:#999;font-style:italic">Owner info not yet added</div>`;
    }

    html += `</div>`;
    return html;
  }, [showOwners]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();

    // Create markers for all plots
    for (const m of markerData) {
      const isListed = !!m.listing;
      const color = isListed ? "#10B981" : getColor(m.community);
      const pin = document.createElement("div");
      pin.style.width = isListed ? "16px" : "12px";
      pin.style.height = isListed ? "16px" : "12px";
      pin.style.borderRadius = "50%";
      pin.style.backgroundColor = color;
      pin.style.border = isListed ? "3px solid #065F46" : "2px solid white";
      pin.style.boxShadow = isListed ? "0 0 8px rgba(16,185,129,0.6)" : "0 1px 3px rgba(0,0,0,0.3)";
      pin.style.cursor = "pointer";
      if (isListed) {
        pin.style.animation = "pulse 2s infinite";
        pin.style.zIndex = "10";
      }
      pin.dataset.community = m.community;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: m.lat, lng: m.lng },
        content: pin,
        title: m.label,
      });

      marker.addListener("click", () => {
        infoWindowRef.current!.setContent(createInfoContent(m));
        infoWindowRef.current!.open(map, marker);
      });

      markersRef.current.push(marker);
    }
  }, [markerData, createInfoContent]);

  const filterByCommunity = (community: string | null) => {
    setActiveFilter(community);
    markersRef.current.forEach((marker, i) => {
      const data = markerData[i];
      const visible = !community || data.community === community;
      marker.map = visible ? mapRef.current : null;
    });

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

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="container py-6">
        <div className="mb-6">
          <div className="text-[0.7rem] uppercase tracking-[0.22em] font-mono text-primary mb-2">Interactive Map</div>
          <h1 className="font-display text-3xl sm:text-4xl text-foreground">
            Saadiyat Island
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {markerData.length} plots across {Object.keys(COMMUNITY_CENTERS).length} communities. Click any dot for details.
            {" "}<span className="text-emerald-600 font-medium">{markerData.filter(m => m.listing).length} currently listed for sale</span> (green dots).
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={activeFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => filterByCommunity(null)}
            className="text-xs"
          >
            <Layers className="h-3 w-3 mr-1" /> All
          </Button>
          {Object.entries(COMMUNITY_CENTERS).map(([key, val]) => (
            <Button
              key={key}
              variant={activeFilter === key ? "default" : "outline"}
              size="sm"
              onClick={() => filterByCommunity(key)}
              className="text-xs"
            >
              <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: val.color }} />
              {val.label}
            </Button>
          ))}
          <div className="ml-auto">
            <Button
              variant={showOwners ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOwners(!showOwners)}
              className="text-xs"
            >
              {showOwners ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {showOwners ? "Hide Owners" : "Show Owners"}
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-lg overflow-hidden border border-border shadow-sm">
          <MapView
            className="h-[calc(100vh-280px)] min-h-[500px]"
            initialCenter={{ lat: 24.5460, lng: 54.4300 }}
            initialZoom={14}
            onMapReady={handleMapReady}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-emerald-800 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
            <span className="font-medium text-emerald-700">Listed for Sale ({markerData.filter(m => m.listing).length})</span>
          </div>
          {Object.entries(COMMUNITY_CENTERS).map(([key, val]) => {
            const count = markerData.filter(m => m.community === key).length;
            return (
              <div key={key} className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: val.color }} />
                <span>{val.label} ({count})</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

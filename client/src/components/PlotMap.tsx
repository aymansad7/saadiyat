/**
 * Coastal Atelier — PlotMap
 * Pure SVG cartographic view of the 33 plot polygons (lat/lng), drawn at scale.
 * Hover or click a polygon → callback. The active polygon is highlighted.
 *
 * Design rules:
 *   - Hairline strokes only
 *   - Fills swap to terracotta on hover/active
 *   - Villa numerals in Fraunces-style oldstyle figures via class
 */
import { useMemo } from "react";
import type { Villa } from "@/data/villas";

interface Props {
  villas: Villa[];
  filteredIds: Set<number>;
  activeId: number | null;
  onHover: (id: number | null) => void;
  onSelect: (id: number) => void;
  className?: string;
}

export default function PlotMap({ villas, filteredIds, activeId, onHover, onSelect, className }: Props) {
  // Compute bounds in lat/lng across all polygons
  const { minLat, maxLat, minLng, maxLng, allPolys } = useMemo(() => {
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    const polys = villas.map((v) => v.polygon);
    for (const poly of polys) {
      for (const p of poly) {
        if (p.lat < minLat) minLat = p.lat;
        if (p.lat > maxLat) maxLat = p.lat;
        if (p.lng < minLng) minLng = p.lng;
        if (p.lng > maxLng) maxLng = p.lng;
      }
    }
    return { minLat, maxLat, minLng, maxLng, allPolys: polys };
  }, [villas]);

  // Project lat/lng → SVG (x = lng, y = lat inverted)
  const padding = 24;
  const width = 1000;
  const height = 700;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const lngRange = maxLng - minLng || 1;
  const latRange = maxLat - minLat || 1;
  // Preserve aspect with cos(lat) compensation for longitude
  const meanLat = (minLat + maxLat) / 2;
  const lngScale = Math.cos((meanLat * Math.PI) / 180);
  const dataAspect = (lngRange * lngScale) / latRange; // width / height
  const containerAspect = innerW / innerH;
  let scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0;
  if (dataAspect > containerAspect) {
    // data wider → fit width
    scaleX = innerW / lngRange;
    scaleY = scaleX * lngScale; // keep aspect
    const usedH = latRange * scaleY;
    offsetY = (innerH - usedH) / 2;
  } else {
    scaleY = innerH / latRange;
    scaleX = scaleY / lngScale;
    const usedW = lngRange * scaleX;
    offsetX = (innerW - usedW) / 2;
  }

  function project(lat: number, lng: number) {
    const x = padding + offsetX + (lng - minLng) * scaleX;
    const y = padding + offsetY + (maxLat - lat) * scaleY;
    return [x, y];
  }

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full select-none"
        role="img"
        aria-label="Plot map of St. Regis Villas at Saadiyat Beach"
      >
        {/* Subtle background grid (graticule) */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(0.86 0.01 80)" strokeWidth="0.4" />
          </pattern>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.85 0.04 200 / 0.18)" />
            <stop offset="100%" stopColor="oklch(0.78 0.06 200 / 0.30)" />
          </linearGradient>
          <pattern id="topo" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M0 30 Q40 10 80 30 T160 30" fill="none" stroke="oklch(0.55 0.06 80 / 0.10)" strokeWidth="0.5" />
            <path d="M0 70 Q40 50 80 70 T160 70" fill="none" stroke="oklch(0.55 0.06 80 / 0.10)" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect x="0" y="0" width={width} height={height} fill="url(#grid)" />
        <rect x="0" y="0" width={width} height={height} fill="url(#topo)" />

        {/* North arrow */}
        <g transform={`translate(${width - 60} 50)`} className="font-mono">
          <circle r="22" fill="oklch(0.985 0.008 80)" stroke="oklch(0.62 0.13 45 / 0.7)" strokeWidth="0.7" />
          <path d="M 0 -16 L 5 6 L 0 2 L -5 6 Z" fill="oklch(0.62 0.13 45)" />
          <text x="0" y="-19" textAnchor="middle" fontSize="9" fill="oklch(0.45 0.025 250)">N</text>
        </g>

        {/* Plots */}
        {villas.map((v, i) => {
          const isFiltered = filteredIds.has(v.id);
          const isActive = activeId === v.id;
          const points = allPolys[i].map(({ lat, lng }) => project(lat, lng).join(",")).join(" ");
          // Centroid for label
          const cx = allPolys[i].reduce((s, p) => s + project(p.lat, p.lng)[0], 0) / allPolys[i].length;
          const cy = allPolys[i].reduce((s, p) => s + project(p.lat, p.lng)[1], 0) / allPolys[i].length;
          return (
            <g
              key={v.id}
              className={[
                "plot-group",
                isActive ? "is-active" : "",
                isFiltered ? "" : "opacity-25",
              ].join(" ")}
              onMouseEnter={() => onHover(v.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(v.id)}
              style={{ cursor: "pointer" }}
            >
              <polygon points={points} className="plot-fill plot-stroke" />
              <text
                x={cx}
                y={cy + 3.2}
                textAnchor="middle"
                fontSize="9"
                fontFamily="Fraunces, serif"
                fontWeight={500}
                fill={isActive ? "oklch(0.985 0.008 80)" : "oklch(0.30 0.025 250)"}
                pointerEvents="none"
              >
                {v.id}
              </text>
            </g>
          );
        })}

        {/* Sea hint band on the seaward edge (north side) */}
        <text x={padding + 10} y={padding + 18} fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="oklch(0.50 0.06 200)" opacity="0.7">
          Arabian Gulf
        </text>
      </svg>
    </div>
  );
}

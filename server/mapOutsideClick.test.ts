import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  resolve(process.cwd(), "client/src/pages/SaadiyatMap.tsx"),
  "utf8",
);

describe("Interactive Map card dismissal", () => {
  it("closes the active selected card when the user clicks empty map space", () => {
    expect(source).toContain('map.addListener("click", dismissInfoWindow)');
    expect(source).toContain("setSelectedMarker(null)");
    expect(source).toContain("infoWindowRef.current?.close()");
  });

  it("removes the plot deep link on map click and on the InfoWindow close button", () => {
    expect(source).toContain('url.searchParams.delete("plot")');
    expect(source).toContain('addListener("closeclick", clearPlotDeepLink)');
    expect(source).toContain("window.history.replaceState");
  });

  it("keeps the map canvas responsible for touch gestures while its compact Header can collapse and restore", () => {
    expect(source).toContain("<SiteHeader fixed compact onCollapse={() => setIsHeaderCollapsed(true)} />");
    expect(source).toContain("layoutVersion={isHeaderCollapsed ? 1 : 0}");
    expect(source).toContain("setIsHeaderCollapsed(false)");
    expect(source).toContain("className=\"h-full w-full touch-none\"");
    expect(source).toContain("selectedMarker &&");
    expect(source).toContain("map.setCenter({ lat: data.lat, lng: data.lng })");
    expect(source).toContain("highlightMarker(data.id)");
  });
});

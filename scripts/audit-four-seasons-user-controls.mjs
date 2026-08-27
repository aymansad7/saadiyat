import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const controls = JSON.parse(readFileSync(resolve(root, "server/data/four-seasons-user-controls-2026-08-27.json"), "utf8"));
const source = readFileSync(resolve(root, "client/src/data/fourSeasons.ts"), "utf8");
const raw = source.match(/export const FOUR_SEASONS_VILLAS = (\[.*\]) as const satisfies readonly FourSeasonsVilla\[\];/s)?.[1];
if (!raw) throw new Error("Could not parse Four Seasons villa registry");
const villas = JSON.parse(raw);
const byVilla = new Map(villas.map((villa) => [villa.villaNumber, villa]));
const byPlot = new Map();
for (const control of controls) {
  const list = byPlot.get(control.plot) ?? [];
  list.push(control.villa);
  byPlot.set(control.plot, list);
}
const existingPlots = new Map(villas.filter((villa) => villa.sdn3PlotNumber).map((villa) => [villa.sdn3PlotNumber, villa.villaNumber]));
const conflicts = controls.map((control) => {
  const existing = byVilla.get(control.villa);
  return {
    villa: control.villa,
    suppliedPlot: control.plot,
    priorPlot: existing?.sdn3PlotNumber ?? null,
    samePlotClaimedBy: byPlot.get(control.plot),
    currentlyAssignedToVilla: existingPlots.get(control.plot) ?? null,
    latitude: control.latitude,
    longitude: control.longitude,
  };
});
const lines = [
  "# Four Seasons User Control Audit — 27 Aug 2026",
  "",
  "All coordinates are preserved in latitude/longitude order after conversion from the user-supplied longitude/latitude input.",
  "",
  "| Villa | Supplied SDN3 plot | Existing SDN3 plot | Other supplied villa(s) sharing plot | Existing villa at plot | Result |",
  "|---:|---:|---:|---|---:|---|",
];
for (const row of conflicts) {
  const duplicate = row.samePlotClaimedBy.filter((villa) => villa !== row.villa);
  const mismatch = row.priorPlot !== null && row.priorPlot !== row.suppliedPlot;
  const occupied = row.currentlyAssignedToVilla !== null && row.currentlyAssignedToVilla !== row.villa;
  const result = duplicate.length || mismatch || occupied ? "Needs confirmation" : "Can apply";
  lines.push(`| ${row.villa} | ${row.suppliedPlot} | ${row.priorPlot ?? "—"} | ${duplicate.join(", ") || "—"} | ${row.currentlyAssignedToVilla ?? "—"} | ${result} |`);
}
lines.push("", "## Automated conflict flags", "");
for (const row of conflicts.filter((row) => row.samePlotClaimedBy.length > 1 || (row.priorPlot !== null && row.priorPlot !== row.suppliedPlot) || (row.currentlyAssignedToVilla !== null && row.currentlyAssignedToVilla !== row.villa))) {
  lines.push(`- Villa ${row.villa}: supplied plot ${row.suppliedPlot}; prior ${row.priorPlot ?? "none"}; same supplied plot claimed by ${row.samePlotClaimedBy.join(", ")}; existing plot holder ${row.currentlyAssignedToVilla ?? "none"}.`);
}
writeFileSync(resolve(root, "tmp/four-seasons-user-controls-audit.md"), `${lines.join("\n")}\n`);
console.log("Wrote tmp/four-seasons-user-controls-audit.md");

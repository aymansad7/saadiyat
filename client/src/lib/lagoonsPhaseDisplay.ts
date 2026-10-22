export type LagoonsClusterSlug = "ethir" | "al-sidr" | "al-ghaf";

/**
 * Aldar-coded phase groups shown on the three public Lagoons village cards.
 * These are project/source groupings, not map-inferred locations.
 */
export const LAGOONS_CLUSTER_PHASES: Record<LagoonsClusterSlug, readonly string[]> = {
  ethir: ["SL2"],
  "al-sidr": ["SL3", "SL5"],
  "al-ghaf": ["SL4", "SL7", "SL8"],
};

export function lagoonsPhaseForUnit(
  unitName: string,
  phaseRows: ReadonlyArray<{ unit_name: string; sl_phase: string }>,
): string | null {
  return phaseRows.find((row) => row.unit_name === unitName)?.sl_phase ?? null;
}

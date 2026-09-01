/**
 * Access policy for the Master-only "Other Projects" (non-Saadiyat Aldar) area.
 *
 * Rule:
 *   - Master Admin has universal access.
 *   - Other-project source screens remain Master-only until every source row
 *     carries canonical property scope metadata and can be served through the
 *     same grant-filtered card APIs as the unified unit register.
 *
 * Keep emails lowercase; comparison is case-insensitive.
 */
/**
 * Decide whether a user may access the Other Projects source area.
 */
export function canAccessOtherProjects(
  role: string | null | undefined,
  _email: string | null | undefined,
): boolean {
  return role === "master";
}

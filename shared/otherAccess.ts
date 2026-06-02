/**
 * Access policy for the Master-only "Other Projects" (non-Saadiyat Aldar) area.
 *
 * Rule (per owner):
 *   - All users with role="master" can access.
 *   - Specific admins listed here are ALSO allowed (currently: Hamzeh).
 *   - Every other admin (and every non-admin) is blocked.
 *
 * Keep emails lowercase; comparison is case-insensitive.
 */
export const OTHER_PROJECTS_ALLOWED_ADMINS: readonly string[] = [
  "hamzeh@nasluxury.com",
];

/**
 * Decide whether a user may access the Other Projects area.
 * `role` is the user's role; `email` is their account email (may be null).
 */
export function canAccessOtherProjects(
  role: string | null | undefined,
  email: string | null | undefined,
): boolean {
  if (role === "master") return true;
  if (role === "admin" && email) {
    return OTHER_PROJECTS_ALLOWED_ADMINS.includes(email.trim().toLowerCase());
  }
  return false;
}

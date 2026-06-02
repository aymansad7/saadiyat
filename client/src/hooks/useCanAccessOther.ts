import { useAuth } from "@/_core/hooks/useAuth";
import { canAccessOtherProjects } from "@shared/otherAccess";

/**
 * Whether the current user may access the Master-only "Other Projects" area.
 * Mirrors the server policy in shared/otherAccess.ts:
 *   - role === "master"            -> allowed
 *   - role === "admin" + allowlist -> allowed (currently Hamzeh only)
 *   - everyone else                -> blocked
 */
export function useCanAccessOther(): boolean {
  const { user } = useAuth();
  return canAccessOtherProjects(user?.role, user?.email);
}

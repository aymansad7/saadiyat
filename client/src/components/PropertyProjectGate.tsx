import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type ProjectAccessContextValue = {
  canViewOriginalPrice: boolean;
  canViewOwnerName: boolean;
  canViewOwnerPhone: boolean;
  canEditProperties: boolean;
  /** Null means a Master Admin or a documented whole-project grant. */
  allowedPhaseKeys: string[] | null;
};

const ProjectAccessContext = createContext<ProjectAccessContextValue>({
  canViewOriginalPrice: false,
  canViewOwnerName: false,
  canViewOwnerPhone: false,
  canEditProperties: false,
  allowedPhaseKeys: [],
});

export function useProjectAccess() {
  return useContext(ProjectAccessContext);
}

export function PropertyProjectGate({
  projectKey,
  phaseKeys,
  children,
}: {
  projectKey: string;
  /** Declare a route's source-backed phases when it is safe to access any one of them. */
  phaseKeys?: readonly string[];
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const phaseKeySignature = phaseKeys?.join("::") ?? "";
  const permissionInput = useMemo(
    () => phaseKeys?.length
      ? { scopes: phaseKeys.map(phaseKey => ({ projectKey, phaseKey })) }
      : { projects: [projectKey] },
    [projectKey, phaseKeySignature],
  );
  const permission = trpc.propertyAccess.permissions.useQuery(
    permissionInput,
    { enabled: Boolean(user) },
  );
  const permitted = permission.data?.filter(item => item.permissions.canAccess) ?? [];
  const canAccess =
    user?.role === "master" ||
    permitted.length > 0;
  const lastGranted = useRef<ProjectAccessContextValue | null>(null);
  if (canAccess) {
    const grant = permitted[0]?.permissions;
    const isPrivileged = user?.role === "master";
    lastGranted.current = {
      canViewOriginalPrice: isPrivileged || grant?.canViewOriginalPrice === true,
      canViewOwnerName: isPrivileged || grant?.canViewOwnerName === true,
      canViewOwnerPhone: isPrivileged || grant?.canViewOwnerPhone === true,
      canEditProperties: isPrivileged || grant?.canEditProperties === true,
      allowedPhaseKeys: isPrivileged || !phaseKeys?.length
        ? null
        : permitted.flatMap(item => item.scope.phaseKey ? [item.scope.phaseKey] : []),
    };
  }

  if (loading || permission.isLoading) {
    // Keep an already-authorized route rendered during a short resume/recheck.
    // This never grants first-load access: a no-cache visitor still sees the
    // safe loading shell until the server answers.
    if (lastGranted.current) {
      return <ProjectAccessContext.Provider value={lastGranted.current}>{children}</ProjectAccessContext.Provider>;
    }
    return <div className="min-h-screen bg-background"><SiteHeader /><main className="container py-12"><div className="h-28 animate-pulse rounded-lg bg-muted/45" /></main></div>;
  }
  if (canAccess) {
    return (
      <ProjectAccessContext.Provider value={lastGranted.current!}>{children}</ProjectAccessContext.Provider>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-16 max-w-2xl">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <LockKeyhole className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-4 font-display text-3xl">Project access required</h1>
          <p className="mt-3 text-muted-foreground">
            Your account is not permitted to view this project. Ask a Master Admin to grant access to this project or its area.
          </p>
        </div>
      </main>
    </div>
  );
}

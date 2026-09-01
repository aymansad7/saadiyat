import { createContext, useContext, type ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type ProjectAccessContextValue = {
  canViewOriginalPrice: boolean;
  canViewOwnerName: boolean;
  canViewOwnerPhone: boolean;
  canEditProperties: boolean;
};

const ProjectAccessContext = createContext<ProjectAccessContextValue>({
  canViewOriginalPrice: false,
  canViewOwnerName: false,
  canViewOwnerPhone: false,
  canEditProperties: false,
});

export function useProjectAccess() {
  return useContext(ProjectAccessContext);
}

export function PropertyProjectGate({ projectKey, children }: { projectKey: string; children: ReactNode }) {
  const { user, loading } = useAuth();
  const permission = trpc.propertyAccess.permissions.useQuery(
    { projects: [projectKey] },
    { enabled: Boolean(user) },
  );
  const canAccess =
    user?.role === "master" ||
    permission.data?.[0]?.permissions.canAccess === true;

  if (loading || permission.isLoading) {
    return <div className="min-h-screen bg-background" />;
  }
  if (canAccess) {
    const grant = permission.data?.[0]?.permissions;
    const isPrivileged = user?.role === "master";
    return (
      <ProjectAccessContext.Provider value={{
        canViewOriginalPrice: isPrivileged || grant?.canViewOriginalPrice === true,
        canViewOwnerName: isPrivileged || grant?.canViewOwnerName === true,
        canViewOwnerPhone: isPrivileged || grant?.canViewOwnerPhone === true,
        canEditProperties: isPrivileged || grant?.canEditProperties === true,
      }}>
        {children}
      </ProjectAccessContext.Provider>
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

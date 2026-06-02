/**
 * MasterGate — client-side guard for master-only routes.
 * Wraps children with auth check; redirects to login if not signed in,
 * shows Forbidden if signed in but not master. Server-side procedures
 * still enforce the role independently (defense in depth).
 */
import { ReactNode } from "react";
import { ShieldAlert, Lock } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { canAccessOtherProjects } from "@shared/otherAccess";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import SiteHeader from "@/components/SiteHeader";

export default function MasterGate({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="container py-16 text-muted-foreground">
          Checking access…
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="container py-16">
          <div className="max-w-md mx-auto bg-card border rounded-md p-8 text-center">
            <Lock className="h-8 w-8 text-primary mx-auto mb-4" />
            <h1 className="font-display text-2xl mb-2">Sign in required</h1>
            <p className="text-sm text-muted-foreground mb-6">
              This area is reserved for master users. Please sign in first.
            </p>
            <Button asChild>
              <a href={getLoginUrl()}>Sign in</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!canAccessOtherProjects(user?.role, user?.email)) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="container py-16">
          <div className="max-w-md mx-auto bg-card border rounded-md p-8 text-center">
            <ShieldAlert className="h-8 w-8 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-2xl mb-2">Restricted</h1>
            <p className="text-sm text-muted-foreground">
              You are signed in as{" "}
              <span className="font-mono">{user?.name ?? user?.email}</span>,
              but this section is reserved for NAS Luxury master users (and authorised admins).
            </p>
          </div>
        </main>
      </div>
    );
  }

  return <>{children}</>;
}

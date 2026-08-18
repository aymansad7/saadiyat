/**
 * Coastal Atelier — site header
 * Editorial wordmark "Saadiyat" with breadcrumb-style sub-label.
 */
import { Link, useLocation } from "wouter";
import { ArrowLeft, MapPin, ChevronDown, FolderOpen, LogOut, User as UserIcon, ShieldCheck, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCanAccessOther } from "@/hooks/useCanAccessOther";
import { getLoginUrl } from "@/const";

interface Props {
  subTitle?: string;
  back?: { href: string; label: string };
}

export default function SiteHeader({ subTitle, back }: Props) {
  const [location] = useLocation();
  const showHomeLink = location !== "/";
  const { user, isAuthenticated, logout } = useAuth();
  const canAccessOther = useCanAccessOther();
  return (
    <header className="border-b border-border/70 bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container py-3 sm:py-4 flex items-center gap-4">
        {back && (
          <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
            <Link href={back.href}>
              <ArrowLeft className="h-4 w-4" />
              <span>{back.label}</span>
            </Link>
          </Button>
        )}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
            <MapPin className="h-3.5 w-3.5" />
          </span>
          <div className="leading-tight">
            <div className="font-display text-[1.15rem] sm:text-[1.35rem] font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Saadiyat<span className="text-primary">.</span>Resale<span className="text-muted-foreground/70">Hub</span>
            </div>
            {subTitle ? (
              <div className="text-[0.72rem] uppercase tracking-[0.18em] text-muted-foreground font-mono">
                {subTitle}
              </div>
            ) : (
              <div className="text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground/70 font-mono hidden sm:block">
                Saadiyat Island · Abu Dhabi
              </div>
            )}
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {showHomeLink && (
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hidden sm:inline-flex">
              <Link href="/">Home</Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-card border-primary/30 text-primary hover:bg-primary/10 hover:text-primary gap-1.5">
                Projects <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                Saadiyat Island
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/st-regis" className="flex items-center justify-between w-full">
                  <span className="font-display text-sm">St. Regis Villas</span>
                  <span className="text-[0.65rem] font-mono text-primary border border-primary/40 px-1 rounded-sm">FULL</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/saadiyat-beach-villas" className="flex items-center justify-between w-full">
                  <span className="font-display text-sm">Saadiyat Beach Villas</span>
                  <span className="text-[0.65rem] font-mono text-foreground/70 border border-border px-1 rounded-sm">446</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/jawaher" className="flex items-center justify-between w-full">
                  <span className="font-display text-sm">Jawaher Saadiyat</span>
                  <span className="text-[0.65rem] font-mono text-foreground/70 border border-border px-1 rounded-sm">83</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/saadiyat-lagoons" className="flex items-center justify-between w-full">
                  <span className="font-display text-sm">Saadiyat Lagoons</span>
                  <span className="text-[0.65rem] font-mono text-primary border border-primary/40 px-1 rounded-sm">1549</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/community/saadiyat-golf-views" className="flex items-center justify-between w-full">
                  <span className="font-display text-sm">Golf Views</span>
                  <span className="text-[0.65rem] font-mono text-foreground/70 border border-border px-1 rounded-sm">26</span>
                </Link>
              </DropdownMenuItem>
             <DropdownMenuItem asChild>
               <Link href="/community/private-villas-four-seasons" className="flex items-center justify-between w-full">
                 <span className="font-display text-sm">Private Villas (Four Seasons)</span>
                 <span className="text-[0.65rem] font-mono text-foreground/70 border border-border px-1 rounded-sm">7</span>
               </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/hidd-al-saadiyat" className="flex items-center justify-between w-full">
                  <span className="font-display text-sm">Hidd Al Saadiyat</span>
                  <span className="text-[0.65rem] font-mono text-foreground/70 border border-border px-1 rounded-sm">469</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                Aldar inventory
              </DropdownMenuLabel>
             <DropdownMenuItem asChild>
               <Link href="/aldar-saadiyat" className="flex items-center justify-between w-full">
                 <span className="font-display text-sm">All Aldar Saadiyat projects</span>
                  <span className="text-[0.65rem] font-mono text-primary border border-primary/40 px-1 rounded-sm">19</span>
               </Link>
             </DropdownMenuItem>
             {canAccessOther && (
               <DropdownMenuItem asChild>
                 <Link href="/aldar-other" className="flex items-center justify-between w-full">
                   <span className="font-display text-sm">Other Aldar projects</span>
                    <span className="text-[0.65rem] font-mono text-rose-600 dark:text-rose-300 border border-rose-500/40 px-1 rounded-sm">35</span>
                 </Link>
               </DropdownMenuItem>
              )}
              {(user?.role === "admin" || user?.role === "master") && (
                <DropdownMenuItem asChild>
                  <Link href="/resale" className="flex items-center justify-between w-full">
                    <span className="font-display text-sm">Resale with Aldar</span>
                    <span className="text-[0.65rem] font-mono text-emerald-700 border border-emerald-500/40 px-1 rounded-sm">Live</span>
                  </Link>
                </DropdownMenuItem>
              )}
             <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/map" className="flex items-center justify-between w-full">
                  <span className="font-display text-sm">Interactive Map</span>
                  <span className="text-[0.65rem] font-mono text-emerald-600 border border-emerald-500/40 px-1 rounded-sm">NEW</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/available-units" className="flex items-center justify-between w-full">
                  <span className="font-display text-sm">Available Units Filter</span>
                  <span className="text-[0.65rem] font-mono text-emerald-600 border border-emerald-500/40 px-1 rounded-sm">NEW</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/documents" className="flex items-center justify-between w-full">
                  <span className="font-display text-sm flex items-center gap-2"><FolderOpen className="h-3.5 w-3.5" /> Documents</span>
                  <span className="text-[0.65rem] font-mono text-foreground/70 border border-border px-1 rounded-sm">LIB</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <UserIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline max-w-[10ch] truncate">{user?.name ?? "Account"}</span>
                  {user?.role === "admin" && (
                    <span className="text-[0.6rem] font-mono uppercase tracking-wider text-primary border border-primary/40 px-1 rounded-sm">Admin</span>
                  )}
                  {user?.role === "master" && (
                    <span className="text-[0.6rem] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-300 border border-rose-500/40 px-1 rounded-sm">Master</span>
                  )}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Signed in
                </DropdownMenuLabel>
                <DropdownMenuItem disabled className="opacity-100 text-foreground">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.name ?? "User"}</span>
                    {user?.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
                  </div>
                </DropdownMenuItem>
                {(user?.role === "admin" || user?.role === "master") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="gap-2">
                        <span className="text-[0.6rem] font-mono uppercase tracking-wider text-primary border border-primary/40 px-1 rounded-sm">Admin</span>
                        <span>Admin console</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/access" className="gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        <span>Manage access</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/listings" className="gap-2">
                        <FolderOpen className="h-3.5 w-3.5 text-primary" />
                        <span>Manage listings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/inventory-history" className="gap-2">
                        <History className="h-3.5 w-3.5 text-primary" />
                        <span>Inventory history</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {canAccessOther && (
                  <DropdownMenuItem asChild>
                    <Link href="/aldar-other" className="gap-2">
                      <span className="text-[0.6rem] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-300 border border-rose-500/40 px-1 rounded-sm">Master</span>
                      <span>Other Aldar projects</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => logout()} className="gap-2">
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <a href={getLoginUrl()}>Sign in</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

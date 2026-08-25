/**
 * Coastal Atelier — site header
 * Editorial wordmark "Saadiyat" with breadcrumb-style sub-label.
 */
import { Link, useLocation } from "wouter";
import { ArrowLeft, MapPin, ChevronDown, FolderOpen, LogOut, User as UserIcon, ShieldCheck, History, Map, Search } from "lucide-react";
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
import { useState, useRef, useEffect } from "react";

/** All navigable projects for quick search */
const ALL_PROJECTS = [
  { name: "Four Seasons Private Residences", href: "/four-seasons" },
  { name: "Saadiyat Reserve · Phase 1, Phase 2 & Dunes", href: "/saadiyat-reserve" },
  { name: "A Huge Plot Between Four Seasons and Omniyat", href: "/community/huge-plot-four-seasons-omniyat" },
  { name: "St. Regis Villas", href: "/st-regis" },
  { name: "Saadiyat Beach Villas", href: "/saadiyat-beach-villas" },
  { name: "Jawaher Saadiyat", href: "/jawaher" },
  { name: "Saadiyat Lagoons", href: "/saadiyat-lagoons" },
  { name: "Golf Views", href: "/community/saadiyat-golf-views" },
  { name: "Private Villas (Four Seasons)", href: "/community/private-villas-four-seasons" },
  { name: "Hidd Al Saadiyat", href: "/hidd-al-saadiyat" },
  { name: "Nouran Living", href: "/aldar-other/nouran-living" },
  { name: "Faya Al Saadiyat", href: "/aldar-saadiyat/faya-al-saadiyat" },
  { name: "Faya Al Saadiyat II", href: "/aldar-saadiyat/faya-al-saadiyat-ii" },
  { name: "Louvre Residences", href: "/aldar-saadiyat/louvreresidences" },
  { name: "Mamsha Gardens", href: "/aldar-saadiyat/mamsha-gardens" },
  { name: "Mamsha Palm", href: "/aldar-saadiyat/mamsha-palm" },
  { name: "Manarat Living", href: "/aldar-saadiyat/manarat-living" },
  { name: "Manarat Living II", href: "/aldar-saadiyat/manarat-living-ii" },
  { name: "Manarat Residences 3", href: "/aldar-saadiyat/manaratresidences3" },
  { name: "Nobu Residences", href: "/aldar-saadiyat/nobu-residences" },
  { name: "One Saadiyat", href: "/aldar-saadiyat/onesaadiyat" },
  { name: "Saadiyat Reserve The Dunes", href: "/aldar-saadiyat/saadiyat-reserve-the-dunes" },
  { name: "Sama Yas", href: "/aldar-saadiyat/sama-yas" },
  { name: "The Row Saadiyat", href: "/aldar-saadiyat/the-row-saadiyat" },
  { name: "The Source", href: "/aldar-saadiyat/the-source" },
  { name: "The Source II", href: "/aldar-saadiyat/the-source-ii" },
  { name: "The Source Terraces", href: "/aldar-saadiyat/the-source-terraces" },
  { name: "The Arthouse", href: "/aldar-saadiyat/thearthouse" },
  { name: "Fountain View Residences", href: "/aldar-saadiyat/fountainviewresidences" },
  { name: "Grove", href: "/aldar-saadiyat/grove" },
  { name: "Noya", href: "/aldar-other/noya" },
  { name: "Noya Viva", href: "/aldar-other/noya-viva" },
  { name: "Noya Luma", href: "/aldar-other/noya-luma" },
  { name: "Yas Park Gate", href: "/aldar-other/yas-park-gate" },
  { name: "Yas Park Views", href: "/aldar-other/yas-park-views" },
  { name: "Yas Golf Collection", href: "/aldar-other/yas-golf-collection" },
  { name: "The Sustainable City", href: "/aldar-other/the-sustainable-city-yas-island" },
  { name: "Al Ghadeer Gardens", href: "/aldar-other/al-ghadeer-gardens" },
  { name: "The Canopies", href: "/aldar-other/the-canopies" },
  { name: "Haven", href: "/aldar-other/haven" },
  { name: "Verdes", href: "/aldar-other/verdes" },
  { name: "The Wilds", href: "/aldar-other/the-wilds" },
  { name: "Rise by Athlon 1", href: "/aldar-other/rise-by-athlon-1" },
  { name: "Rise by Athlon 2", href: "/aldar-other/rise-by-athlon-2" },
  { name: "Rise by Athlon 3", href: "/aldar-other/rise-by-athlon-3" },
  { name: "Rise by Athlon 4", href: "/aldar-other/rise-by-athlon-4" },
  { name: "Al Marjan Island", href: "/aldar-other/almarjan" },
  { name: "Rosso Bay Residences", href: "/aldar-other/rosso-bay-residences" },
  { name: "Fahid Beach Terraces", href: "/aldar-other/fahid-beach-terraces" },
  { name: "The Beach House Fahid", href: "/aldar-other/the-beach-house-fahid" },
  { name: "Fahid Beach Residences", href: "/aldar-other/fahid-beach-residences" },
  { name: "Athlon", href: "/aldar-other/athlon" },
];

interface Props {
  subTitle?: string;
  back?: { href: string; label: string };
}

export default function SiteHeader({ subTitle, back }: Props) {
  const [location] = useLocation();
  const showHomeLink = location !== "/";
  const { user, isAuthenticated, logout } = useAuth();
  const canAccessOther = useCanAccessOther();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredProjects = searchQuery.trim()
    ? ALL_PROJECTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : ALL_PROJECTS;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

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
          {/* Project Search */}
          <div ref={searchRef} className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Search</span>
            </Button>
            {searchOpen && (
              <div className="absolute right-0 top-full mt-1 w-72 sm:w-80 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-2 border-b border-border">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search project name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredProjects.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">No projects found</div>
                  ) : (
                    filteredProjects.map((p) => (
                      <Link
                        key={p.href}
                        href={p.href}
                        className="block px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      >
                        {p.name}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
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
                <Link href="/four-seasons" className="flex items-center justify-between w-full">
                  <span className="font-display text-sm">Four Seasons Private Residences</span>
                  <span className="text-[0.65rem] font-mono text-emerald-700 border border-emerald-400 px-1 rounded-sm">11 AVAIL</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/saadiyat-reserve" className="flex items-center justify-between w-full">
                  <span className="font-display text-sm">Saadiyat Reserve</span>
                  <span className="text-[0.65rem] font-mono text-fuchsia-700 border border-fuchsia-400 px-1 rounded-sm">306</span>
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
          <Button asChild variant="outline" size="sm" className="bg-card border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 gap-1.5">
            <Link href="/map">
              <Map className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Map</span>
            </Link>
          </Button>
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

/**
 * Master Admin — Listings workspace
 *
 * `Available now` reads the source-aware availability aggregate. It never
 * creates a duplicate profile merely to display an Aldar/broker source row.
 * `Operational profiles` are the canonical, editable villa_listings records
 * and contain protected owner data for authorised staff only.
 */
import { useMemo, useState } from "react";
import { ExternalLink, FileText, MapPin, Pencil, Search, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EditListingButton,
  InteractiveMapLink,
  ListingBadge,
  ListingPriceLabel,
} from "@/components/ListingControls";

type WorkspaceView = "available" | "profiles";
type ListingSource = "nas-luxury" | "aldar" | "others" | "manual";

const STATUSES = [
  { value: "all", label: "Any profile status" },
  { value: "draft", label: "Draft" },
  { value: "available", label: "Available" },
  { value: "warm", label: "Warm" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "off-market", label: "Off-market" },
] as const;

const SOURCE_LABEL: Record<ListingSource, string> = {
  "nas-luxury": "NAS Luxury",
  aldar: "Aldar",
  others: "Other broker",
  manual: "Manual record",
};

const SOURCE_TONE: Record<ListingSource, string> = {
  "nas-luxury": "border-emerald-200 bg-emerald-50 text-emerald-800",
  aldar: "border-blue-200 bg-blue-50 text-blue-800",
  others: "border-violet-200 bg-violet-50 text-violet-800",
  manual: "border-amber-200 bg-amber-50 text-amber-800",
};

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function projectLabel(value: string) {
  return value
    .split(/[\/_-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function OwnerCell({ row }: { row?: { ownerName?: string | null; ownerPhone?: string | null } | null }) {
  if (!row?.ownerName && !row?.ownerPhone) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <div className="leading-tight text-xs">
      {row.ownerName ? <div className="font-medium text-foreground">{row.ownerName}</div> : null}
      {row.ownerPhone ? <div className="mt-0.5 font-mono text-muted-foreground">{row.ownerPhone}</div> : null}
    </div>
  );
}

export default function AdminListings() {
  const { user, loading, isAuthenticated } = useAuth();
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("available");
  const [community, setCommunity] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");
  const [priceMinStr, setPriceMinStr] = useState("");
  const [priceMaxStr, setPriceMaxStr] = useState("");

  const priceMin = useMemo(() => {
    const n = parseInt(priceMinStr.replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  }, [priceMinStr]);
  const priceMax = useMemo(() => {
    const n = parseInt(priceMaxStr.replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  }, [priceMaxStr]);

  const stats = trpc.villaListings.stats.useQuery(undefined, { enabled: isAuthenticated && user?.role === "master" });
  const profiles = trpc.villaListings.adminList.useQuery(
    {
      community: community === "all" ? undefined : community,
      status: status === "all" ? undefined : (status as Exclude<typeof STATUSES[number]["value"], "all">),
      q: q.trim() || undefined,
      priceMin,
      priceMax,
      limit: 500,
    },
    { enabled: isAuthenticated && user?.role === "master" },
  );
  // A source-aware read model: managed Available profiles, Aldar, curated
  // brokers, and NAS records are included without being merged by price/area.
  const available = trpc.availability.results.useQuery(
    { source: "any" },
    { enabled: isAuthenticated && user?.role === "master" },
  );

  const totalsByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of stats.data ?? []) {
      map[row.status] = (map[row.status] ?? 0) + Number(row.count);
    }
    return map;
  }, [stats.data]);

  const allProfiles = profiles.data ?? [];
  const profilesByKey = useMemo(
    () => new Map(allProfiles.map(row => [row.villaKey, row])),
    [allProfiles],
  );

  const communityOptions = useMemo(() => {
    const keys = new Set<string>();
    for (const row of profiles.data ?? []) keys.add(row.community);
    for (const row of available.data ?? []) keys.add(row.community);
    return Array.from(keys).sort((a, b) => projectLabel(a).localeCompare(projectLabel(b)));
  }, [available.data, profiles.data]);

  const availableRows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (available.data ?? []).filter(row => {
      if (community !== "all" && row.community !== community) return false;
      if (priceMin !== undefined && (row.priceAed == null || row.priceAed < priceMin)) return false;
      if (priceMax !== undefined && (row.priceAed == null || row.priceAed > priceMax)) return false;
      if (!query) return true;
      return [row.title, row.unitKey, row.community, row.provenance]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [available.data, community, priceMax, priceMin, q]);

  const availableBySource = useMemo(() => {
    const counts: Record<ListingSource, number> = {
      "nas-luxury": 0,
      aldar: 0,
      others: 0,
      manual: 0,
    };
    for (const row of available.data ?? []) counts[row.source] += 1;
    return counts;
  }, [available.data]);

  if (loading) return null;
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="container py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-xl font-semibold">Admin sign-in required</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in with an authorised account to manage operational property listings.
              </p>
              <Button className="mt-4" onClick={() => (window.location.href = getLoginUrl())}>
                Sign in
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (user?.role !== "master") {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="container py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-xl font-semibold">Access denied</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Listings include protected owner and publication data and are available to Master Admin only.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const loadingRows = workspaceView === "available" ? available.isLoading : profiles.isLoading;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <SiteHeader />
      <main className="container py-8 space-y-6">
        <section className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <ShieldCheck className="h-4 w-4" /> Master Admin workspace
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Listings</h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              A source-aware operational view. <strong className="text-foreground">Available now</strong> retains the Aldar, NAS, and broker provenance of every record. <strong className="text-foreground">Operational profiles</strong> are the same editable database records used by property cards and the Interactive Map.
            </p>
          </div>
          <div className="rounded-lg bg-muted px-4 py-3 text-sm">
            <div className="flex items-center justify-between gap-4"><div><div className="text-xs uppercase tracking-wide text-muted-foreground">Tracked profiles</div><div className="mt-1 text-2xl font-semibold tabular-nums">{Object.values(totalsByStatus).reduce((a, b) => a + b, 0)}</div></div><div className="flex flex-wrap gap-2"><Link href="/admin/owners" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-secondary"><ShieldCheck className="h-3.5 w-3.5" />Owners</Link><Link href="/admin/documents" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-secondary"><FileText className="h-3.5 w-3.5" />OneDrive documents</Link></div></div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {(["nas-luxury", "aldar", "others", "manual"] as ListingSource[]).map(source => (
            <Card key={source} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="text-xs font-medium text-muted-foreground">{SOURCE_LABEL[source]}</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">{availableBySource[source]}</div>
                <div className="mt-1 text-[0.65rem] text-muted-foreground">available records</div>
              </CardContent>
            </Card>
          ))}
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="text-xs font-medium text-muted-foreground">Profile status</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{totalsByStatus.available ?? 0}</div>
              <div className="mt-1 text-[0.65rem] text-muted-foreground">marked available</div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="gap-4 border-b pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={workspaceView === "available" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWorkspaceView("available")}
                >
                  Available now ({available.data?.length ?? 0})
                </Button>
                <Button
                  type="button"
                  variant={workspaceView === "profiles" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWorkspaceView("profiles")}
                >
                  Operational profiles ({Object.values(totalsByStatus).reduce((a, b) => a + b, 0)})
                </Button>
              </div>
              <CardTitle className="text-base">
                {workspaceView === "available" ? "Documented availability" : "Canonical editable profiles"}
              </CardTitle>
            </div>

            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1 lg:max-w-sm">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={workspaceView === "available" ? "Search project, unit, source…" : "Search unit, owner, internal notes…"}
                  className="h-9 pl-8"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <Input
                  placeholder="Min AED"
                  className="h-9 w-28"
                  inputMode="numeric"
                  value={priceMinStr}
                  onChange={e => setPriceMinStr(e.target.value)}
                />
                <Input
                  placeholder="Max AED"
                  className="h-9 w-28"
                  inputMode="numeric"
                  value={priceMaxStr}
                  onChange={e => setPriceMaxStr(e.target.value)}
                />
                <Select value={community} onValueChange={setCommunity}>
                  <SelectTrigger className="h-9 w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All projects</SelectItem>
                    {communityOptions.map(item => <SelectItem key={item} value={item}>{projectLabel(item)}</SelectItem>)}
                  </SelectContent>
                </Select>
                {workspaceView === "profiles" ? (
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : null}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit / plot</TableHead>
                    <TableHead>Project</TableHead>
                    {workspaceView === "available" ? <TableHead>Source</TableHead> : <TableHead>Status</TableHead>}
                    <TableHead>Price</TableHead>
                    <TableHead>Owner · authorised</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingRows ? (
                    <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">Loading listings…</TableCell></TableRow>
                  ) : workspaceView === "available" && availableRows.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No documented available listing matches these filters.</TableCell></TableRow>
                  ) : workspaceView === "profiles" && allProfiles.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No operational profile matches these filters. Open an existing property card and choose Edit to create one.</TableCell></TableRow>
                  ) : workspaceView === "available" ? availableRows.map(row => {
                    const profile = profilesByKey.get(row.unitKey);
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="font-medium">{row.title}</div>
                          <div className="mt-0.5 max-w-72 truncate font-mono text-[0.65rem] text-muted-foreground">{row.unitKey}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{projectLabel(row.community)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`whitespace-nowrap text-[0.65rem] ${SOURCE_TONE[row.source]}`}>{SOURCE_LABEL[row.source]}</Badge>
                          <div className="mt-1 max-w-48 text-[0.65rem] leading-4 text-muted-foreground">{row.provenance}</div>
                        </TableCell>
                        <TableCell><ListingPriceLabel askingPriceAed={row.priceAed} />{row.priceAed == null ? <span className="text-xs text-muted-foreground">—</span> : null}</TableCell>
                        <TableCell><OwnerCell row={profile} /></TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(row.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {row.href ? <Link href={row.href} className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-primary hover:bg-primary/5"><ExternalLink className="h-3.5 w-3.5" />Open</Link> : null}
                            {profile ? <EditListingButton villaKey={profile.villaKey} community={profile.community} villaLabel={profile.villaKey} trigger={({ onClick }) => <Button variant="ghost" size="sm" onClick={onClick} className="h-7 px-2 text-xs"><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>} /> : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }) : allProfiles.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium">{row.villaKey.split("/").at(-1)}</div>
                        <div className="mt-0.5 max-w-72 truncate font-mono text-[0.65rem] text-muted-foreground">{row.villaKey}</div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{projectLabel(row.community)}</TableCell>
                      <TableCell><ListingBadge status={row.status} />{row.status === "draft" ? <span className="text-xs text-muted-foreground">Draft</span> : null}</TableCell>
                      <TableCell><ListingPriceLabel askingPriceAed={row.askingPriceAed} />{row.askingPriceAed == null ? <span className="text-xs text-muted-foreground">—</span> : null}</TableCell>
                      <TableCell><OwnerCell row={row} /></TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(row.updatedAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <InteractiveMapLink villaKey={row.villaKey} label="Map" className="h-7 px-2 py-1" />
                          <EditListingButton villaKey={row.villaKey} community={row.community} villaLabel={row.villaKey} trigger={({ onClick }) => <Button variant="ghost" size="sm" onClick={onClick} className="h-7 px-2 text-xs"><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          A status changed to <strong className="font-medium text-foreground">Available</strong> on an operational profile is immediately included in NAS availability and reflected on the matching property card and Interactive Map. Aldar and broker source rows remain labelled with their documented origin and are not overwritten by this view.
        </p>
      </main>
    </div>
  );
}

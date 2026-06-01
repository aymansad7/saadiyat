/**
 * Admin — Property Listings
 *
 * One row per real-world villa/plot: shows price, status, listing partners,
 * owner contact, and last edit timestamp. Filters by community + status + free
 * text on `villaKey`. Each row exposes a quick `Edit` action that opens the
 * shared `<ListingEditor>` dialog.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Pencil, Search } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
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
  ListingBadge,
  ListingPriceLabel,
} from "@/components/ListingControls";

const COMMUNITIES = [
  { slug: "all", name: "All communities" },
  { slug: "st-regis", name: "St. Regis" },
  { slug: "jawaher", name: "Jawaher" },
  { slug: "saadiyat-beach-villas", name: "Saadiyat Beach Villas" },
  { slug: "saadiyat-lagoons", name: "Saadiyat Lagoons" },
];

const STATUSES = [
  { value: "all", label: "Any status" },
  { value: "draft", label: "Draft" },
  { value: "available", label: "Available" },
  { value: "warm", label: "Warm" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "off-market", label: "Off-market" },
];

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminListings() {
  const { user, loading, isAuthenticated } = useAuth();
  const [community, setCommunity] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");

  const stats = trpc.villaListings.stats.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const list = trpc.villaListings.adminList.useQuery(
    {
      community: community === "all" ? undefined : community,
      status: status === "all" ? (undefined as any) : (status as any),
      q: q.trim() || undefined,
      limit: 500,
    },
    { enabled: isAuthenticated },
  );

  const totalsByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of stats.data ?? []) {
      map[row.status] = (map[row.status] ?? 0) + Number(row.count);
    }
    return map;
  }, [stats.data]);

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
                Sign in with an admin account to manage property listings.
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

  if (user?.role !== "admin" && user?.role !== "master") {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="container py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-xl font-semibold">Access denied</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your account does not have admin permissions.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const rows = list.data ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <SiteHeader />
      <main className="container py-8 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Property listings</h1>
            <p className="text-sm text-muted-foreground">
              Manage price, status, listing partners, owner contact, and internal notes per villa/plot.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            Total tracked: <span className="font-medium text-foreground">{Object.values(totalsByStatus).reduce((a, b) => a + b, 0)}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {["available", "warm", "reserved", "sold", "off-market", "draft"].map(s => (
            <Card key={s}>
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s}</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {totalsByStatus[s] ?? 0}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 pb-3 md:flex-row md:items-end md:justify-between">
            <CardTitle className="text-base">Listings</CardTitle>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by villa key…"
                  className="h-9 w-56 pl-8"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
              </div>
              <Select value={community} onValueChange={setCommunity}>
                <SelectTrigger className="h-9 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMUNITIES.map(c => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Villa key</TableHead>
                  <TableHead>Community</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Asking price</TableHead>
                  <TableHead>Partners</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                )}
                {!list.isLoading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-sm text-muted-foreground">
                      No listings yet for this filter. Click <Link href="/" className="underline">a villa card</Link> and use the Edit button to start tracking it.
                    </TableCell>
                  </TableRow>
                )}
                {rows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.villaKey}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.community}</TableCell>
                    <TableCell>
                      <ListingBadge status={row.status} />
                      {row.status === "draft" && (
                        <span className="text-xs text-muted-foreground">Draft</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ListingPriceLabel askingPriceAed={row.askingPriceAed} />
                      {!row.askingPriceAed && <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm">
                      {row.listingPartners || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-xs">
                      {(row as any).ownerName ? (
                        <div className="leading-tight">
                          <div className="font-medium">{(row as any).ownerName}</div>
                          {(row as any).ownerPhone && (
                            <div className="text-muted-foreground">{(row as any).ownerPhone}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{fmtDate(row.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <EditListingButton
                        villaKey={row.villaKey}
                        community={row.community}
                        villaLabel={row.villaKey}
                        trigger={({ onClick }) => (
                          <Button variant="ghost" size="sm" onClick={onClick} className="h-7 px-2 text-xs">
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Button>
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

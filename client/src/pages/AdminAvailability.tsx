/**
 * Admin — Availability Listings
 *
 * Lets admins create / edit / delete availability listings for any community,
 * with timestamps automatically maintained by the DB. Used by the unified
 * Status filter shown on Landing + community + cluster pages.
 */
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Source = "nas-luxury" | "aldar" | "others" | "manual";
type Status = "available" | "reserved" | "sold" | "off-market";

interface Listing {
  id: number;
  community: string;
  unitKey: string;
  source: Source;
  status: Status;
  askingPriceAed: number | null;
  bedrooms: number | null;
  notes: string | null;
  contactLabel: string | null;
  addedByName: string | null;
  updatedAt: Date | string;
  createdAt: Date | string;
}

const COMMUNITIES = [
  { slug: "saadiyat-lagoons", name: "Saadiyat Lagoons" },
  { slug: "saadiyat-beach-villas", name: "Saadiyat Beach Villas" },
  { slug: "jawaher", name: "Jawaher Saadiyat" },
  { slug: "st-regis", name: "St. Regis (Mangrove Villas)" },
];

const SOURCE_LABELS: Record<Source, string> = {
  "nas-luxury": "NAS Luxury",
  aldar: "Aldar Resale",
  others: "Other brokers",
  manual: "Manual",
};

const STATUS_LABELS: Record<Status, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  "off-market": "Off-market",
};

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtAed(n: number | null) {
  if (n == null) return "—";
  return `AED ${n.toLocaleString()}`;
}

export default function AdminAvailability() {
  const { user, loading, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "master";

  const utils = trpc.useUtils();
  const list = trpc.availability.listAll.useQuery(undefined, {
    enabled: !!isAdmin,
  });

  const [editing, setEditing] = useState<Listing | null>(null);
  const [showForm, setShowForm] = useState(false);

  const createMut = trpc.availability.create.useMutation({
    onSuccess: () => {
      utils.availability.listAll.invalidate();
      utils.availability.summary.invalidate();
      toast.success("Listing added");
      setShowForm(false);
      setEditing(null);
    },
    onError: e => toast.error(e.message),
  });
  const updateMut = trpc.availability.update.useMutation({
    onSuccess: () => {
      utils.availability.listAll.invalidate();
      utils.availability.summary.invalidate();
      toast.success("Listing updated");
      setShowForm(false);
      setEditing(null);
    },
    onError: e => toast.error(e.message),
  });
  const deleteMut = trpc.availability.delete.useMutation({
    onSuccess: () => {
      utils.availability.listAll.invalidate();
      utils.availability.summary.invalidate();
      toast.success("Listing deleted");
    },
    onError: e => toast.error(e.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-16 text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-16">
          <p className="mb-4">You need to sign in to access admin tools.</p>
          <Button asChild>
            <a href={getLoginUrl()}>Sign in</a>
          </Button>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-16 text-muted-foreground">
          Admin access required.
        </div>
      </div>
    );
  }

  const rows = (list.data ?? []) as Listing[];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-10 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl">Availability listings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {rows.length} listing{rows.length === 1 ? "" : "s"} across all
              communities. Timestamps auto-update on every edit.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add listing
          </Button>
        </div>

        {showForm && (
          <ListingForm
            initial={editing}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            onSubmit={values => {
              if (editing) {
                updateMut.mutate({ id: editing.id, ...values });
              } else {
                createMut.mutate(values);
              }
            }}
            saving={createMut.isPending || updateMut.isPending}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All listings</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2">Updated</th>
                  <th className="text-left px-3 py-2">Community</th>
                  <th className="text-left px-3 py-2">Unit</th>
                  <th className="text-left px-3 py-2">Source</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Beds</th>
                  <th className="text-right px-3 py-2">Asking</th>
                  <th className="text-right px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted-foreground py-8">
                      No listings yet. Click "Add listing" to create one.
                    </td>
                  </tr>
                )}
                {rows.map(r => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {fmtDate(r.updatedAt)}
                    </td>
                    <td className="px-3 py-2">{r.community}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.unitKey}</td>
                    <td className="px-3 py-2">{SOURCE_LABELS[r.source]}</td>
                    <td className="px-3 py-2">{STATUS_LABELS[r.status]}</td>
                    <td className="px-3 py-2">{r.bedrooms ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {fmtAed(r.askingPriceAed)}
                    </td>
                    <td className="px-3 py-2 text-right space-x-2 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(r);
                          setShowForm(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (
                            confirm(`Delete listing for ${r.unitKey}?`)
                          ) {
                            deleteMut.mutate({ id: r.id });
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

interface ListingFormValues {
  community: string;
  unitKey: string;
  source: Source;
  status: Status;
  askingPriceAed: number | null;
  bedrooms: number | null;
  notes: string | null;
  contactLabel: string | null;
}

function ListingForm({
  initial,
  onCancel,
  onSubmit,
  saving,
}: {
  initial: Listing | null;
  onCancel: () => void;
  onSubmit: (v: ListingFormValues) => void;
  saving: boolean;
}) {
  const [community, setCommunity] = useState(
    initial?.community ?? COMMUNITIES[0]!.slug,
  );
  const [unitKey, setUnitKey] = useState(initial?.unitKey ?? "");
  const [source, setSource] = useState<Source>(initial?.source ?? "manual");
  const [status, setStatus] = useState<Status>(initial?.status ?? "available");
  const [askingPrice, setAskingPrice] = useState<string>(
    initial?.askingPriceAed != null ? String(initial.askingPriceAed) : "",
  );
  const [bedrooms, setBedrooms] = useState<string>(
    initial?.bedrooms != null ? String(initial.bedrooms) : "",
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [contactLabel, setContactLabel] = useState(
    initial?.contactLabel ?? "",
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {initial ? "Edit listing" : "Add listing"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase text-muted-foreground">Community</label>
            <Select value={community} onValueChange={setCommunity}>
              <SelectTrigger>
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
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">
              Unit key
            </label>
            <Input
              value={unitKey}
              onChange={e => setUnitKey(e.target.value)}
              placeholder="e.g. Lagoons-AlSidr-V-065-01"
            />
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">Source</label>
            <Select value={source} onValueChange={v => setSource(v as Source)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SOURCE_LABELS) as Source[]).map(s => (
                  <SelectItem key={s} value={s}>
                    {SOURCE_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">Status</label>
            <Select value={status} onValueChange={v => setStatus(v as Status)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABELS) as Status[]).map(s => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">
              Asking price (AED)
            </label>
            <Input
              type="number"
              value={askingPrice}
              onChange={e => setAskingPrice(e.target.value)}
              placeholder="e.g. 9200000"
            />
          </div>
          <div>
            <label className="text-xs uppercase text-muted-foreground">Bedrooms</label>
            <Input
              type="number"
              value={bedrooms}
              onChange={e => setBedrooms(e.target.value)}
              placeholder="e.g. 4"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs uppercase text-muted-foreground">
              Contact label (internal)
            </label>
            <Input
              value={contactLabel}
              onChange={e => setContactLabel(e.target.value)}
              placeholder="e.g. Ayman Sadieh"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs uppercase text-muted-foreground">Notes</label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Position, finishing, payment plan, signature deal..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!unitKey.trim()) {
                toast.error("Unit key is required");
                return;
              }
              onSubmit({
                community,
                unitKey: unitKey.trim(),
                source,
                status,
                askingPriceAed: askingPrice ? parseInt(askingPrice, 10) : null,
                bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
                notes: notes.trim() || null,
                contactLabel: contactLabel.trim() || null,
              });
            }}
            disabled={saving}
          >
            {saving ? "Saving…" : initial ? "Update" : "Create"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

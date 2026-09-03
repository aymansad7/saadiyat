/**
 * ListingEditor — admin-only dialog for editing the per-villa listing
 * profile (price, status, listing partners, public notes, owner contact,
 * internal notes). Designed to be opened from any plot/villa card or detail
 * page via the small `EditListingButton`.
 *
 * Visibility rules:
 *   - The button only renders for admin/master roles (see `EditListingButton`).
 *   - Owner contact + internal notes only appear in this editor; non-admin UI
 *     surfaces never request these fields.
 */
import { useEffect, useMemo, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export type ListingStatus =
  | "draft"
  | "available"
  | "warm"
  | "reserved"
  | "sold"
  | "off-market";

const STATUS_OPTIONS: { value: ListingStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "available", label: "Available" },
  { value: "warm", label: "Warm" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "off-market", label: "Off-market" },
];

type FormState = {
  askingPriceAed: string;
  status: ListingStatus;
  landAreaSqm: string;
  builtUpAreaSqm: string;
  availableForRent: "unset" | "yes" | "no";
  rentPriceAed: string;
  listingPartners: string;
  publicNotes: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  internalNotes: string;
};

const EMPTY_FORM: FormState = {
  askingPriceAed: "",
  status: "draft",
  landAreaSqm: "",
  builtUpAreaSqm: "",
  availableForRent: "unset",
  rentPriceAed: "",
  listingPartners: "",
  publicNotes: "",
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  internalNotes: "",
};

export type ListingEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  villaKey: string;
  community: string;
  phaseKey?: string | null;
  buildingKey?: string | null;
  unitTypeKey?: string | null;
  bedrooms?: number | null;
  inventoryKey?: string | null;
  villaLabel?: string;
};

export function ListingEditor({
  open,
  onOpenChange,
  villaKey,
  community,
  phaseKey,
  buildingKey,
  unitTypeKey,
  bedrooms,
  inventoryKey,
  villaLabel,
}: ListingEditorProps) {
  const utils = trpc.useUtils();
  const existing = trpc.villaListings.byKey.useQuery(
    { villaKey },
    { enabled: open },
  );
  const { user } = useAuth();
  const permissions = trpc.propertyAccess.permissions.useQuery(
    { scopes: [{ projectKey: community, phaseKey: phaseKey ?? null, buildingKey: buildingKey ?? null, unitTypeKey: unitTypeKey ?? null, bedrooms: bedrooms ?? null, inventoryKey: inventoryKey ?? null }] },
    { enabled: open && Boolean(user) },
  );
  const upsert = trpc.villaListings.upsert.useMutation();
  const isMaster = user?.role === "master";
  const canManageOwnerName = isMaster || permissions.data?.[0]?.permissions.canViewOwnerName === true;
  const canManageOwnerPhone = isMaster || permissions.data?.[0]?.permissions.canViewOwnerPhone === true;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Hydrate the form whenever the dialog opens with fresh data.
  useEffect(() => {
    if (!open) return;
    const row = existing.data as any;
    if (row) {
      setForm({
        askingPriceAed:
          row.askingPriceAed != null ? String(row.askingPriceAed) : "",
        status: (row.status ?? "draft") as ListingStatus,
        landAreaSqm: row.landAreaSqm != null ? String(row.landAreaSqm) : "",
        builtUpAreaSqm: row.builtUpAreaSqm != null ? String(row.builtUpAreaSqm) : "",
        availableForRent:
          row.availableForRent === true ? "yes" : row.availableForRent === false ? "no" : "unset",
        rentPriceAed: row.rentPriceAed != null ? String(row.rentPriceAed) : "",
        listingPartners: row.listingPartners ?? "",
        publicNotes: row.publicNotes ?? "",
        ownerName: row.ownerName ?? "",
        ownerPhone: row.ownerPhone ?? "",
        ownerEmail: row.ownerEmail ?? "",
        internalNotes: row.internalNotes ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, existing.data]);

  const isLoading = existing.isLoading && open;

  const heading = useMemo(() => {
    if (villaLabel) return villaLabel;
    return villaKey;
  }, [villaLabel, villaKey]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    const payload = {
      villaKey,
      community,
      ...(buildingKey !== undefined ? { buildingKey } : {}),
      ...(unitTypeKey !== undefined ? { unitTypeKey } : {}),
      ...(bedrooms !== undefined ? { bedrooms } : {}),
      ...(phaseKey !== undefined ? { phaseKey } : {}),
      ...(inventoryKey !== undefined ? { inventoryKey } : {}),
      askingPriceAed:
        form.askingPriceAed.trim() === ""
          ? null
          : Number(form.askingPriceAed.replace(/[,\s]/g, "")),
      status: form.status,
      landAreaSqm:
        form.landAreaSqm.trim() === "" ? null : Number(form.landAreaSqm.replace(/[,\s]/g, "")),
      builtUpAreaSqm:
        form.builtUpAreaSqm.trim() === "" ? null : Number(form.builtUpAreaSqm.replace(/[,\s]/g, "")),
      availableForRent:
        form.availableForRent === "unset" ? null : form.availableForRent === "yes",
      rentPriceAed:
        form.rentPriceAed.trim() === "" ? null : Number(form.rentPriceAed.replace(/[,\s]/g, "")),
      listingPartners: form.listingPartners.trim() || null,
      publicNotes: form.publicNotes.trim() || null,
      ...(canManageOwnerName ? { ownerName: form.ownerName.trim() || null } : {}),
      ...(canManageOwnerPhone ? { ownerPhone: form.ownerPhone.trim() || null } : {}),
      ...(isMaster ? {
        ownerEmail: form.ownerEmail.trim() || null,
        internalNotes: form.internalNotes.trim() || null,
      } : {}),
    };
    if (
      payload.askingPriceAed != null &&
      (!Number.isFinite(payload.askingPriceAed) || payload.askingPriceAed < 0)
    ) {
      toast.error("Invalid asking price.");
      return;
    }
    if (
      (payload.landAreaSqm != null && (!Number.isFinite(payload.landAreaSqm) || payload.landAreaSqm < 0)) ||
      (payload.builtUpAreaSqm != null && (!Number.isFinite(payload.builtUpAreaSqm) || payload.builtUpAreaSqm < 0)) ||
      (payload.rentPriceAed != null && (!Number.isFinite(payload.rentPriceAed) || payload.rentPriceAed < 0))
    ) {
      toast.error("Enter valid areas and rent price.");
      return;
    }
    try {
      await upsert.mutateAsync(payload);
      await Promise.all([
        utils.villaListings.byKey.invalidate({ villaKey }),
        utils.villaListings.listByCommunity.invalidate(),
        utils.villaListings.adminList.invalidate(),
        utils.villaListings.stats.invalidate(),
        utils.availability.results.invalidate(),
        utils.availability.summary.invalidate(),
        utils.availability.listForCommunity.invalidate(),
      ]);
      toast.success("Listing saved.");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save listing.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit listing — {heading}</DialogTitle>
          <DialogDescription>
            Public fields appear on the property card. Owner fields are shown
            only when this exact unit scope permits them.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading current listing…
          </div>
        ) : (
          <div className="grid gap-5">
            {/* ---------- public fields ---------- */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="asking-price">Asking price (AED)</Label>
                <Input
                  id="asking-price"
                  inputMode="numeric"
                  placeholder="e.g. 5,200,000"
                  value={form.askingPriceAed}
                  onChange={e => update("askingPriceAed", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={v => update("status", v as ListingStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="land-area">Land area (m²)</Label>
                <Input
                  id="land-area"
                  inputMode="decimal"
                  placeholder="e.g. 792"
                  value={form.landAreaSqm}
                  onChange={e => update("landAreaSqm", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="built-up-area">Built-up area (m²)</Label>
                <Input
                  id="built-up-area"
                  inputMode="decimal"
                  placeholder="e.g. 544.64"
                  value={form.builtUpAreaSqm}
                  onChange={e => update("builtUpAreaSqm", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Available for rent</Label>
                <Select
                  value={form.availableForRent}
                  onValueChange={v => update("availableForRent", v as FormState["availableForRent"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rental status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unset">Not specified</SelectItem>
                    <SelectItem value="yes">Available for rent</SelectItem>
                    <SelectItem value="no">Not available for rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="rent-price">Rent price (AED)</Label>
                <Input
                  id="rent-price"
                  inputMode="numeric"
                  placeholder="e.g. 650,000"
                  value={form.rentPriceAed}
                  onChange={e => update("rentPriceAed", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="listing-partners">Listing partners</Label>
              <Input
                id="listing-partners"
                placeholder="NAS Luxury, Allsopp & Allsopp, …"
                value={form.listingPartners}
                onChange={e => update("listingPartners", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated. Public — appears on the property card.
              </p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="public-notes">Public notes</Label>
              <Textarea
                id="public-notes"
                placeholder="Finishing, view, payment plan, signature features…"
                value={form.publicNotes}
                onChange={e => update("publicNotes", e.target.value)}
                rows={3}
              />
            </div>

            <Separator />

            {/* ---------- restricted owner fields ---------- */}
            {(canManageOwnerName || canManageOwnerPhone || isMaster) && <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-amber-600">
                <Lock className="h-3.5 w-3.5" />
                Restricted owner fields · never shown publicly
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {canManageOwnerName && <div className="grid gap-1.5">
                  <Label htmlFor="owner-name">Owner name</Label>
                  <Input
                    id="owner-name"
                    value={form.ownerName}
                    onChange={e => update("ownerName", e.target.value)}
                  />
                </div>}
                {canManageOwnerPhone && <div className="grid gap-1.5">
                  <Label htmlFor="owner-phone">Owner phone</Label>
                  <Input
                    id="owner-phone"
                    value={form.ownerPhone}
                    onChange={e => update("ownerPhone", e.target.value)}
                  />
                </div>}
                {isMaster && <div className="md:col-span-2 grid gap-1.5">
                  <Label htmlFor="owner-email">Owner email</Label>
                  <Input
                    id="owner-email"
                    type="email"
                    value={form.ownerEmail}
                    onChange={e => update("ownerEmail", e.target.value)}
                  />
                </div>}
                {isMaster && <div className="md:col-span-2 grid gap-1.5">
                  <Label htmlFor="internal-notes">Internal notes</Label>
                  <Textarea
                    id="internal-notes"
                    placeholder="Deal history, motivation, prior offers, do-not-disturb instructions…"
                    value={form.internalNotes}
                    onChange={e => update("internalNotes", e.target.value)}
                    rows={4}
                  />
                </div>}
              </div>
            </div>}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={upsert.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={upsert.isPending || isLoading}>
            {upsert.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save listing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

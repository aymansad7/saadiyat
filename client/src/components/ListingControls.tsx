/**
 * Small UI primitives for the per-villa listing system:
 *
 *   - `EditListingButton`  — admin-only icon button, opens `<ListingEditor>`.
 *   - `ListingBadge`        — coloured pill that renders a status label.
 *   - `ListingPriceLabel`   — formats AED with thousand separators; hides when null.
 *
 * The components are intentionally tiny so they can be slotted into existing
 * cards without disturbing layout.
 */
import { useState } from "react";
import { ExternalLink, FileText, MapPin, Pencil } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ListingEditor, type ListingStatus } from "./ListingEditor";
import { Link } from "wouter";

const STATUS_TONE: Record<ListingStatus, string> = {
  draft: "bg-muted text-muted-foreground border-transparent",
  available: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
  warm: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30",
  reserved: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30",
  sold: "bg-stone-500/15 text-stone-700 dark:text-stone-300 border border-stone-500/30",
  "off-market": "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30",
};

const STATUS_LABEL: Record<ListingStatus, string> = {
  draft: "Draft",
  available: "Available",
  warm: "Warm",
  reserved: "Reserved",
  sold: "Sold",
  "off-market": "Off-market",
};

export function ListingBadge({
  status,
  className,
}: {
  status: ListingStatus | null | undefined;
  className?: string;
}) {
  if (!status || status === "draft") return null;
  return (
    <Badge
      variant="outline"
      className={`px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${STATUS_TONE[status]} ${className ?? ""}`}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function ListingPriceLabel({
  askingPriceAed,
  className,
}: {
  askingPriceAed: number | null | undefined;
  className?: string;
}) {
  if (!askingPriceAed) return null;
  const formatted = new Intl.NumberFormat("en-AE").format(askingPriceAed);
  return (
    <span className={`text-sm font-semibold tabular-nums ${className ?? ""}`}>
      AED {formatted}
    </span>
  );
}

export type ListingPropertyFactsData = {
  landAreaSqm?: number | null;
  builtUpAreaSqm?: number | null;
  availableForRent?: boolean | null;
  rentPriceAed?: number | null;
};

/** Protected owner fields are returned only when the server grants visibility. */
export function ListingOwnerFacts({
  listing,
  className,
}: {
  listing?: { ownerName?: string | null; ownerPhone?: string | null } | null;
  className?: string;
}) {
  if (!listing?.ownerName && !listing?.ownerPhone) return null;
  return (
    <div className={`mt-2 rounded-sm border border-primary/20 bg-primary/5 px-2.5 py-2 text-[0.65rem] font-mono text-foreground ${className ?? ""}`}>
      <div className="uppercase tracking-[0.14em] text-[0.55rem] text-muted-foreground">Owner · authorized view</div>
      {listing.ownerName ? <div className="mt-0.5">{listing.ownerName}</div> : null}
      {listing.ownerPhone ? <div className="mt-0.5 tabular-nums">{listing.ownerPhone}</div> : null}
    </div>
  );
}

/** Compact, shared rendering of database-backed property overrides. */
export function ListingPropertyFacts({
  listing,
  className,
}: {
  listing?: ListingPropertyFactsData | null;
  className?: string;
}) {
  if (!listing) return null;
  const facts: string[] = [];
  const areaFormat = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 2 });
  if (listing.landAreaSqm != null) facts.push(`Land ${areaFormat.format(listing.landAreaSqm)} m²`);
  if (listing.builtUpAreaSqm != null) facts.push(`BUA ${areaFormat.format(listing.builtUpAreaSqm)} m²`);
  if (listing.availableForRent === true) {
    facts.push(
      listing.rentPriceAed
        ? `Rent AED ${new Intl.NumberFormat("en-AE").format(listing.rentPriceAed)}`
        : "Available for rent",
    );
  } else if (listing.availableForRent === false) {
    facts.push("Not available for rent");
  }
  if (facts.length === 0) return null;
  return (
    <div className={`mt-2 text-[0.65rem] font-mono text-muted-foreground ${className ?? ""}`}>
      {facts.join(" · ")}
    </div>
  );
}

/**
 * Links registered explicitly for a property card. The server returns only
 * brochure, floorplan, and marketing entries marked `card_link`; SPA and owner
 * document links never cross this card-facing API boundary.
 */
export function OneDriveCardLinks({ villaKey, className }: { villaKey: string; className?: string }) {
  const documents = trpc.oneDrive.cardLinks.useQuery(
    { villaKey },
    { enabled: Boolean(villaKey), staleTime: 60_000 },
  );
  const rows = documents.data ?? [];
  if (rows.length === 0) return null;
  return (
    <div className={`mt-3 flex flex-wrap gap-2 ${className ?? ""}`}>
      {rows.map(document => (
        <a
          key={document.id}
          href={document.shareUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-sm border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
        >
          {document.documentType === "brochure" ? "Open brochure" : document.documentType === "floorplan" ? "Open floorplan" : "Open document"}
          {document.documentType === "brochure" || document.documentType === "floorplan" ? <FileText className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
        </a>
      ))}
    </div>
  );
}

/** Direct deep-link to the matching Interactive Map marker. */
export function InteractiveMapLink({
  villaKey,
  className,
  label = "View on Map",
}: {
  villaKey: string;
  className?: string;
  label?: string;
}) {
  return (
    <Link
      href={`/map?plot=${encodeURIComponent(villaKey)}`}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sm border bg-card text-foreground border-border hover:bg-secondary hover:border-primary/30 ${className ?? ""}`}
    >
      <MapPin className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}

export type EditListingButtonProps = {
  villaKey: string;
  community: string;
  phaseKey?: string | null;
  villaLabel?: string;
  className?: string;
  /** Optional render slot — called with `onClick` so callers can custom-trigger. */
  trigger?: (props: { onClick: () => void }) => React.ReactNode;
};

export function EditListingButton({
  villaKey,
  community,
  phaseKey,
  villaLabel,
  className,
  trigger,
}: EditListingButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const grants = trpc.propertyAccess.permissions.useQuery(
    { scopes: [{ projectKey: community, phaseKey: phaseKey ?? null }] },
    { enabled: Boolean(user) },
  );
  const canEdit =
    user?.role === "admin" ||
    user?.role === "master" ||
    grants.data?.[0]?.permissions.canEditProperties === true;
  if (!canEdit) return null;

  return (
    <>
      {trigger ? (
        trigger({ onClick: () => setOpen(true) })
      ) : (
        <Button
          variant="outline"
          size="sm"
          className={`h-7 gap-1 px-2 text-xs ${className ?? ""}`}
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      )}
      <ListingEditor
        open={open}
        onOpenChange={setOpen}
        villaKey={villaKey}
        community={community}
        villaLabel={villaLabel}
      />
    </>
  );
}

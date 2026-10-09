import { Badge } from "@/components/ui/badge";
import type { FourSeasonsAlainSourceStatus } from "@/data/fourSeasonsAlainExplore";

const SOURCE_STATUS_STYLE: Record<FourSeasonsAlainSourceStatus, string> = {
  Available: "border-emerald-500/35 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
  Blocked: "border-orange-500/35 bg-orange-500/15 text-orange-800 dark:text-orange-200",
  Booked: "border-amber-500/35 bg-amber-500/15 text-amber-800 dark:text-amber-200",
  Reserved: "border-sky-500/35 bg-sky-500/15 text-sky-800 dark:text-sky-200",
  Sold: "border-rose-500/35 bg-rose-500/15 text-rose-800 dark:text-rose-200",
};

export function FourSeasonsSourceStatusBadge({
  status,
  compact = false,
}: {
  status: FourSeasonsAlainSourceStatus | null | undefined;
  compact?: boolean;
}) {
  if (!status) return null;
  return (
    <Badge
      variant="outline"
      className={`border px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide ${SOURCE_STATUS_STYLE[status]}`}
    >
      {compact ? status : `Source · ${status}`}
    </Badge>
  );
}

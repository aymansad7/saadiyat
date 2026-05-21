import { statusTone } from "@/data/aldar";

const TONE_STYLES: Record<string, string> = {
  available:
    "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  sold:
    "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  reserved:
    "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  other:
    "border-border bg-muted text-muted-foreground",
};

export function AldarStatusBadge({
  status,
  className = "",
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const tone = statusTone(status);
  const label = status ?? "—";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.18em] font-mono ${TONE_STYLES[tone]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

import type { StatusBreakdown } from "@/data/aldar";

/**
 * Compact row of status counts (Available / New / Booked / Blocked / Reserved / Sold).
 * Hides any bucket with 0. Use on cards (project, building) and headers.
 */
const SPEC: Array<{
  key: keyof Omit<StatusBreakdown, "total">;
  label: string;
  cls: string;
}> = [
  {
    key: "available",
    label: "Available",
    cls: "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  {
    key: "new",
    label: "New",
    cls: "border-sky-500/50 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  {
    key: "booked",
    label: "Booked",
    cls: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  {
    key: "blocked",
    label: "Blocked",
    cls: "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  },
  {
    key: "reserved",
    label: "Reserved",
    cls: "border-violet-500/50 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  {
    key: "sold",
    label: "Sold",
    cls: "border-rose-400/40 bg-rose-500/5 text-rose-600/80 dark:text-rose-300/80",
  },
];

export function AldarStatusPills({
  breakdown,
  size = "sm",
  showSold = true,
  className = "",
}: {
  breakdown: StatusBreakdown;
  size?: "xs" | "sm";
  showSold?: boolean;
  className?: string;
}) {
  const padding = size === "xs" ? "px-1.5 py-0.5" : "px-2 py-0.5";
  const text = size === "xs" ? "text-[0.6rem]" : "text-[0.65rem]";
  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {SPEC.map(s => {
        if (s.key === "sold" && !showSold) return null;
        const n = breakdown[s.key];
        if (!n) return null;
        return (
          <span
            key={s.key}
            className={`inline-flex items-center gap-1 rounded-sm border uppercase tracking-[0.16em] font-mono ${padding} ${text} ${s.cls}`}
          >
            <span className="num-display">{n}</span>
            <span>{s.label}</span>
          </span>
        );
      })}
    </div>
  );
}

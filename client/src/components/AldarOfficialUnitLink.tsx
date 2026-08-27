import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  aldarLink: string | null | undefined;
  unitName: string | null | undefined;
  projectSlug: string | null | undefined;
  compact?: boolean;
  className?: string;
};

/** Opens only the exact source-backed Aldar unit URL through the safe verifier. */
export default function AldarOfficialUnitLink({ aldarLink, unitName, projectSlug, compact = false, className }: Props) {
  if (!unitName || !projectSlug) {
    return <span className={cn("text-xs text-muted-foreground", className)}>Official Aldar unit link unavailable</span>;
  }
  const params = new URLSearchParams({ unit: unitName, project: projectSlug });
  if (aldarLink) params.set("url", aldarLink);
  const href = `/api/aldar/official-link?${params.toString()}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        compact
          ? "inline-flex items-center gap-1 text-xs text-primary hover:underline"
          : "inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10",
        className,
      )}
    >
      {compact ? "Official Aldar" : "Open exact Aldar unit page"} <ExternalLink className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
    </a>
  );
}

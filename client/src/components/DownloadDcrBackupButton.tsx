/**
 * "Download full backup" button — links to a pre-built ZIP in storage.
 *
 * Unlike `DownloadDcrPackButton` (which streams a fresh ZIP via
 * `/api/dcr-zip`), this is a static href. Use it for the "give me everything"
 * case on community landing pages so the user doesn't wait for an 8-minute
 * server build of a 2 GB SBV pack.
 */
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";
import type { DcrBackup } from "@/data/dcrBackups";

interface Props {
  backup: DcrBackup;
  /** Visual variant; defaults to "outline". */
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(0)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export function DownloadDcrBackupButton({
  backup,
  variant = "outline",
  className,
}: Props) {
  return (
    <Button asChild variant={variant} size="sm" className={["gap-1.5 bg-card", className ?? ""].join(" ")}>
      <a
        href={backup.url}
        download={backup.filename}
        rel="noopener"
        title={`Pre-built ZIP of all ${backup.count} DCR PDFs (${formatBytes(backup.sizeBytes)})`}
      >
        <Archive className="h-3.5 w-3.5" />
        Full backup ({backup.count} · {formatBytes(backup.sizeBytes)})
      </a>
    </Button>
  );
}

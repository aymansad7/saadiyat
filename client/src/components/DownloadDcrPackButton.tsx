/**
 * "Download DCR pack (ZIP)" button.
 *
 * Hits `/api/dcr-zip?prefix=…&name=…` which streams a freshly built ZIP of
 * every DCR PDF whose `villaKey` starts with `prefix`. The browser handles
 * the download via Content-Disposition; we don't need to fetch and blob it.
 *
 * Disabled state shows when the bulk PDF index for that prefix is empty/loading
 * (so users don't kick off a request that's guaranteed to 404).
 */
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  /** villaKey prefix, e.g. "jawaher/" or "saadiyat-beach-villas/Gate2-" */
  prefix: string;
  /** Filename hint shown in the download dialog. */
  filename: string;
  /** How many PDFs are about to be packed (for the label and disabled state). */
  count: number;
  /** True while parent's bulk index query is still loading. */
  loading?: boolean;
  /** Visual variant; defaults to "outline" so it doesn't fight CTA buttons. */
  variant?: "default" | "outline" | "ghost";
  /** Optional extra classes. */
  className?: string;
}

export function DownloadDcrPackButton({
  prefix,
  filename,
  count,
  loading,
  variant = "outline",
  className,
}: Props) {
  // We use an "I started the download" flag so the spinner appears immediately;
  // the browser will swap to the file-save dialog when the response begins.
  const [busy, setBusy] = useState(false);

  const disabled = loading || count === 0 || busy;

  function onClick() {
    if (disabled) return;
    setBusy(true);
    const url = `/api/dcr-zip?prefix=${encodeURIComponent(prefix)}&name=${encodeURIComponent(filename)}`;
    // Open in a hidden anchor so the request is treated as a download.
    const a = document.createElement("a");
    a.href = url;
    a.rel = "noopener";
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Reset after a short window — the actual stream is server-side.
    window.setTimeout(() => setBusy(false), 4000);
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={["gap-1.5 bg-card", className ?? ""].join(" ")}
      title={
        count === 0
          ? "No DCR PDFs available for this group"
          : `Bundle ${count} DCR PDFs into a single ZIP`
      }
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      {busy ? "Preparing…" : `Download DCRs (${count})`}
    </Button>
  );
}

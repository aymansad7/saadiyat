/**
 * SimplePlotCard — used by Jawaher and Saadiyat Beach Villas (Path A: URLs only).
 * Same visual language as the rich VillaCard but without the spec dl row.
 */
import { FileText, MapPin } from "lucide-react";
import type { SimplePlot } from "@/data/communities";
import { MYLAND_URL } from "@/data/communities";

interface Props {
  plot: SimplePlot;
  communityLabel: string; // shown above the title
  bigNumber?: string;     // override for the large numeral (defaults to plot.id)
}

export default function SimplePlotCard({ plot, communityLabel, bigNumber }: Props) {
  return (
    <div className="villa-card bg-card border border-border rounded-md overflow-hidden flex flex-col rise-in">
      <div className="p-4 sm:p-5 flex items-start gap-4">
        <div className="shrink-0 flex flex-col items-center">
          <div className="font-display num-display text-[3.2rem] leading-none text-foreground">
            {bigNumber ?? plot.id}
          </div>
          <div className="text-[0.62rem] uppercase tracking-[0.18em] font-mono text-muted-foreground mt-1">
            Plot
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground truncate">
            {communityLabel}
          </div>
          <h3 className="font-display text-lg text-foreground mt-1 leading-snug truncate">
            {plot.label}
          </h3>
          <div className="font-mono text-xs text-muted-foreground mt-1 truncate" title={plot.pdfFilename}>
            {plot.pdfFilename}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 sm:pb-5 mt-auto">
        <div className="divider-rule mb-3" />
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={plot.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sm border bg-primary text-primary-foreground border-primary hover:bg-primary/90"
          >
            <FileText className="h-3.5 w-3.5" />
            Open DCR
          </a>
          <a
            href={MYLAND_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-sm border bg-card text-foreground border-border hover:bg-secondary hover:border-primary/30"
          >
            <MapPin className="h-3.5 w-3.5" />
            MyLand portal
          </a>
        </div>
      </div>
    </div>
  );
}

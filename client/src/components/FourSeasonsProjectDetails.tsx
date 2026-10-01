import { ExternalLink, FileText, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FOUR_SEASONS_PROJECT_DETAILS,
  FOUR_SEASONS_PROJECT_DOCUMENT_LINKS,
} from "@/data/fourSeasonsProjectDetails";

export function FourSeasonsProjectDocumentLinks({ compact = false }: { compact?: boolean }) {
  const buttonClass = compact
    ? "border-white/25 bg-white/10 text-white hover:bg-white/15 hover:text-white"
    : "border-stone-300 text-stone-700 hover:bg-stone-100";
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" variant="outline" className={buttonClass}>
        <a href={FOUR_SEASONS_PROJECT_DOCUMENT_LINKS.factSheetUrl} target="_blank" rel="noreferrer">
          <FileText className="mr-1.5 h-3.5 w-3.5" /> Official fact sheet
        </a>
      </Button>
      <Button asChild size="sm" variant="outline" className={buttonClass}>
        <a href={FOUR_SEASONS_PROJECT_DOCUMENT_LINKS.collectionsMasterPlanUrl} target="_blank" rel="noreferrer">
          <MapPinned className="mr-1.5 h-3.5 w-3.5" /> Collection master plan
        </a>
      </Button>
    </div>
  );
}

export function FourSeasonsProjectDetails({ compact = false }: { compact?: boolean }) {
  const details = FOUR_SEASONS_PROJECT_DETAILS;
  if (compact) {
    return (
      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#8f7444]">Project reference</p>
        <h2 className="mt-1 font-display text-2xl font-semibold">Four curated collections</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
          {details.residenceCollections.join(", ")} — private residences with a project-level amenity program and two curated interior palettes.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {details.amenities.slice(0, 6).map((amenity) => (
            <span key={amenity} className="rounded-full bg-[#f6f3ee] px-3 py-1 text-xs text-stone-700">{amenity}</span>
          ))}
        </div>
        <div className="mt-5"><FourSeasonsProjectDocumentLinks /></div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-primary">Project reference</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">The Four Seasons residence proposition</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            The broker fact sheet describes four residence collections — {details.residenceCollections.join(", ")} — and the master plan differentiates the villa families shown below.
          </p>
        </div>
        <FourSeasonsProjectDocumentLinks />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Master-plan villa families</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {details.collections.map((collection) => (
              <span key={collection} className="rounded-full border border-[#c3a368]/45 bg-[#fbf7ef] px-3 py-1 text-xs font-medium text-[#765f39]">{collection}</span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Amenity program</h3>
          <p className="mt-3 text-sm leading-6 text-foreground">{details.amenities.join(" · ")}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Interior direction</h3>
          <p className="mt-3 text-sm leading-6 text-foreground">Two curated palettes: <strong>{details.interiorPalettes.join(" and ")}</strong>.</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{details.indicativeSpecifications[0]}</p>
        </div>
      </div>

      <details className="mt-6 border-t border-border pt-5">
        <summary className="cursor-pointer text-sm font-medium text-foreground">View indicative specifications and connectivity</summary>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
            {details.indicativeSpecifications.slice(1).map((specification) => <li key={specification}>• {specification}</li>)}
          </ul>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {details.nearbyMinutes.map((item) => (
              <div key={item.destination} className="flex items-baseline justify-between gap-3 border-b border-stone-100 py-1.5">
                <span className="text-muted-foreground">{item.destination}</span>
                <span className="font-medium whitespace-nowrap">{item.minutes} min</span>
              </div>
            ))}
          </div>
        </div>
      </details>
      <p className="mt-5 text-xs leading-5 text-muted-foreground">{details.sourceLabel}. {details.sourceNote}</p>
    </section>
  );
}

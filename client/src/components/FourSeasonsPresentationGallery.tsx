import { useState } from "react";
import { Expand, Images } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FOUR_SEASONS_PRESENTATION_IMAGES,
  type FourSeasonsPresentationImage,
} from "@/data/fourSeasonsPresentationMedia";

export function FourSeasonsPresentationGallery() {
  const [selected, setSelected] = useState<FourSeasonsPresentationImage | null>(null);
  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#8f7444]">The Four Seasons rhythm</p>
          <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">A sense of place, before the details.</h2>
        </div>
        <p className="max-w-sm text-sm leading-5 text-stone-600">Official project and lifestyle imagery, shown for context only — not tied to an individual residence.</p>
      </div>

      <div className="grid auto-rows-[12rem] grid-cols-2 gap-3 sm:auto-rows-[15rem] lg:grid-cols-4">
        {FOUR_SEASONS_PRESENTATION_IMAGES.map((image, index) => {
          const prominent = index === 0 || index === 3;
          const className = prominent
            ? "col-span-2 row-span-2"
            : index === 1
            ? "row-span-2"
            : "";
          return (
            <button
              key={image.url}
              type="button"
              onClick={() => setSelected(image)}
              className={`group relative overflow-hidden rounded-2xl bg-stone-900 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8f7444] focus:ring-offset-2 ${className}`}
              aria-label={`Open ${image.title} image`}
            >
              <img src={image.url} alt={image.alt} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                <p className="font-display text-base font-medium sm:text-lg">{image.title}</p>
                <p className="mt-1 hidden text-xs leading-4 text-white/75 sm:block">{image.kind === "lifestyle" ? "Lifestyle image" : "Sales-centre image"}</p>
              </div>
              <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                <Expand className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-stone-500"><Images className="h-3.5 w-3.5" /> Official project / lifestyle gallery · illustrative only</p>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-5xl overflow-hidden border-0 bg-stone-950 p-0 text-white sm:rounded-2xl">
            <DialogHeader className="sr-only">
              <DialogTitle>{selected.title}</DialogTitle>
              <DialogDescription>{selected.description}</DialogDescription>
            </DialogHeader>
            <img src={selected.url} alt={selected.alt} className="max-h-[76vh] w-full object-contain" />
            <div className="border-t border-white/10 p-4 sm:px-5">
              <p className="font-display text-xl">{selected.title}</p>
              <p className="mt-1 text-sm leading-5 text-white/70">{selected.description}</p>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}

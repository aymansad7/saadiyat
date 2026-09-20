import { Images, Sparkles } from "lucide-react";
import { useState } from "react";
import { TALAY_PROJECT_IMAGES } from "@/data/talayProjectMedia";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TalayProjectGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex == null ? null : TALAY_PROJECT_IMAGES[selectedIndex] ?? null;
  const hero = TALAY_PROJECT_IMAGES[0];

  return (
    <section className="border-b border-border bg-[#092c2d] text-white">
      <div className="container py-7 sm:py-10">
        <div className="grid overflow-hidden rounded-xl border border-white/15 bg-[#082324] shadow-[0_18px_55px_rgba(3,16,17,0.28)] md:grid-cols-[1.05fr_0.95fr]">
          <button type="button" onClick={() => setSelectedIndex(0)} className="group relative min-h-[260px] overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 md:min-h-full">
            <img src={hero.url} alt={hero.alt} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061e1f]/75 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 rounded-sm border border-white/35 bg-black/25 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white">Open full image</span>
          </button>
          <div className="p-5 sm:p-7">
            <div className="flex items-center gap-2 text-[0.66rem] font-mono uppercase tracking-[0.2em] text-amber-200"><Sparkles className="h-3.5 w-3.5" /> Talay visual collection</div>
            <h2 className="mt-3 font-display text-3xl leading-tight text-white">Marsa Al Saadiyat, through the project lens.</h2>
            <p className="mt-3 text-sm leading-6 text-teal-50/85">Supplied Talay project visuals: villa community perspectives, the green corridor, and children’s discovery garden. Browse the gallery for client presentation.</p>
            <p className="mt-4 border-t border-white/15 pt-3 text-xs leading-5 text-teal-100/65">Images are user-supplied Talay / Marsa Al Saadiyat project marketing visuals. They are not represented as the view, plot, architecture, or finishes of any exact villa card.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-2 text-[0.66rem] font-mono uppercase tracking-[0.2em] text-amber-200"><Images className="h-3.5 w-3.5" /> Project gallery</div>
          <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-teal-50/85">{TALAY_PROJECT_IMAGES.length} supplied visuals</div>
        </div>
        <Carousel opts={{ align: "start", loop: true }} className="mx-8 mt-4">
          <CarouselContent>
            {TALAY_PROJECT_IMAGES.map((image, index) => (
              <CarouselItem key={image.url} className="basis-full sm:basis-1/2 lg:basis-1/3">
                <button type="button" onClick={() => setSelectedIndex(index)} className="group block w-full overflow-hidden rounded-lg border border-white/15 bg-white/5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">
                  <img src={image.url} alt={image.alt} loading="lazy" className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                  <span className="block px-3 py-2.5 text-xs font-medium leading-5 text-teal-50">{image.label}</span>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-8 border-white/20 bg-[#082324] text-white hover:bg-[#0e3b3d] hover:text-white" />
          <CarouselNext className="-right-8 border-white/20 bg-[#082324] text-white hover:bg-[#0e3b3d] hover:text-white" />
        </Carousel>
      </div>

      <Dialog open={selectedIndex != null} onOpenChange={open => { if (!open) setSelectedIndex(null); }}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto border-slate-700 bg-[#082324] p-3 text-white sm:p-5">
          {selected && <>
            <DialogHeader className="pr-8 text-left">
              <DialogTitle className="font-display text-2xl text-white">{selected.label}</DialogTitle>
              <DialogDescription className="text-teal-100/75">User-supplied Talay project marketing image · not an exact villa representation</DialogDescription>
            </DialogHeader>
            <img src={selected.url} alt={selected.alt} className="mt-2 max-h-[70vh] w-full rounded-lg object-contain" />
          </>}
        </DialogContent>
      </Dialog>
    </section>
  );
}

import { FileText, Image as ImageIcon, Images, ReceiptText, Sparkles } from "lucide-react";
import { useState } from "react";
import { getPenthouseProjectPresentation, type PenthousePresentationProject } from "@/data/penthousePresentation";
import { OneDriveCardLinks } from "@/components/ListingControls";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SQFT_PER_SQM = 10.764;

function ProjectPerspective({ presentation }: { presentation: PenthousePresentationProject }) {
  return (
    <section className="overflow-hidden rounded-xl border border-amber-700/25 bg-[#10212d] text-white shadow-[0_18px_50px_rgba(15,23,32,0.16)]">
      <img src={presentation.imageUrl} alt={presentation.imageAlt} className="aspect-[16/8] w-full object-cover" />
      <div className="p-5">
        <div className="flex items-center gap-2 text-[0.65rem] font-mono uppercase tracking-[0.2em] text-amber-200"><ImageIcon className="h-3.5 w-3.5" /> Project perspective</div>
        <h2 className="mt-2 font-display text-3xl text-white">{presentation.title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-200">{presentation.narrative}</p>
        <p className="mt-4 border-t border-white/10 pt-3 text-[0.7rem] leading-5 text-slate-400">{presentation.sourceLabel}</p>
      </div>
    </section>
  );
}

function ProjectImageGallery({ presentation }: { presentation: PenthousePresentationProject }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const gallery = presentation.gallery ?? [];
  if (!gallery.length) return null;
  const selectedImage = selectedIndex == null ? null : gallery[selectedIndex] ?? null;

  return (
    <section className="overflow-hidden rounded-xl border border-amber-700/25 bg-[#10212d] p-5 text-white shadow-[0_18px_50px_rgba(15,23,32,0.16)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[0.65rem] font-mono uppercase tracking-[0.2em] text-amber-200"><Images className="h-3.5 w-3.5" /> Penthouse image library</div>
          <h3 className="mt-2 font-display text-2xl">Guggenheim views & Baccarat interiors</h3>
        </div>
        <div className="rounded-full border border-amber-200/25 bg-white/5 px-3 py-1.5 text-xs text-slate-200">{gallery.length} supplied visuals</div>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Select an image to view it in full. These are user-supplied project and category visuals for One Saadiyat / Baccarat; they are not represented as photography or renderings of this exact residence.</p>
      <Carousel opts={{ align: "start", loop: true }} className="mx-8 mt-5">
        <CarouselContent>
          {gallery.map((image, index) => (
            <CarouselItem key={image.url} className="basis-full sm:basis-1/2 lg:basis-1/3">
              <button type="button" onClick={() => setSelectedIndex(index)} className="group block w-full overflow-hidden rounded-lg border border-white/10 bg-white/5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">
                <img src={image.url} alt={image.alt} loading="lazy" className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                <span className="block px-3 py-2.5 text-xs font-medium text-slate-100">{image.label}</span>
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-8 border-amber-200/30 bg-[#10212d] text-amber-100 hover:bg-[#1a3444] hover:text-white" />
        <CarouselNext className="-right-8 border-amber-200/30 bg-[#10212d] text-amber-100 hover:bg-[#1a3444] hover:text-white" />
      </Carousel>
      <Dialog open={selectedIndex != null} onOpenChange={open => { if (!open) setSelectedIndex(null); }}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto border-slate-700 bg-[#0d1b25] p-3 text-white sm:p-5">
          {selectedImage && <>
            <DialogHeader className="pr-8 text-left">
              <DialogTitle className="font-display text-2xl text-white">{selectedImage.label}</DialogTitle>
              <DialogDescription className="text-slate-300">{presentation.sourceLabel}</DialogDescription>
            </DialogHeader>
            <img src={selectedImage.url} alt={selectedImage.alt} className="mt-2 max-h-[70vh] w-full rounded-lg object-contain" />
          </>}
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default function PenthousePresentation({
  projectSlug,
  villaKey,
  serviceChargeAedSqm,
  serviceChargeEscalationPct,
}: {
  projectSlug: string;
  villaKey: string;
  serviceChargeAedSqm?: number | null;
  serviceChargeEscalationPct?: number | null;
}) {
  const presentation = getPenthouseProjectPresentation(projectSlug);
  const serviceCharge = serviceChargeAedSqm != null && Number.isFinite(serviceChargeAedSqm) && serviceChargeAedSqm > 0
    ? serviceChargeAedSqm
    : null;
  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-amber-700/20 bg-amber-50/60 p-5">
        <div className="flex items-center gap-2 text-[0.65rem] font-mono uppercase tracking-[0.2em] text-amber-800"><Sparkles className="h-3.5 w-3.5" /> Penthouse presentation</div>
        <p className="mt-2 text-sm leading-6 text-slate-700">Use this card as the verified conversation base: official status, published price and documented area remain above; project imagery and floor-plan links below are clearly labelled by source.</p>
      </div>
      {presentation ? <ProjectPerspective presentation={presentation} /> : <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">No verified project rendering is currently linked to this penthouse. The official specifications and any card documents remain available on this page.</div>}
      {presentation && <ProjectImageGallery presentation={presentation} />}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 text-[0.65rem] font-mono uppercase tracking-[0.2em] text-slate-600"><ReceiptText className="h-3.5 w-3.5" /> Service charge</div>
        {serviceCharge != null ? <div className="mt-3"><div className="font-display text-2xl text-slate-950">AED {(serviceCharge / SQFT_PER_SQM).toFixed(2)} <span className="font-sans text-sm text-slate-500">/ sqft</span></div><p className="mt-1 text-sm leading-6 text-slate-600">AED {serviceCharge.toFixed(2)} / m² · Source period not stated{serviceChargeEscalationPct != null && Number.isFinite(serviceChargeEscalationPct) ? ` · ${serviceChargeEscalationPct}% published escalation` : ""}.</p></div> : <p className="mt-2 text-sm leading-6 text-slate-600">No service-charge figure is published in the current source record for this residence.</p>}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 text-[0.65rem] font-mono uppercase tracking-[0.2em] text-slate-600"><FileText className="h-3.5 w-3.5" /> Documented floor plans & materials</div>
        <p className="mt-2 text-sm leading-6 text-slate-600">Any linked floor plan, brochure or marketing document opens from the verified card library. If no link appears, no card-facing document has been registered for this exact unit.</p>
        <OneDriveCardLinks villaKey={villaKey} className="mt-4" />
      </div>
    </section>
  );
}

import { FileText, Image as ImageIcon, ReceiptText, Sparkles } from "lucide-react";
import { getPenthouseProjectPresentation, type PenthousePresentationProject } from "@/data/penthousePresentation";
import { OneDriveCardLinks } from "@/components/ListingControls";

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

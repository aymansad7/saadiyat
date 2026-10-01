import { MapPinned } from "lucide-react";
import { FOUR_SEASONS_MASTERPLAN_IMAGE } from "@/data/fourSeasons";
import type { PresentationCandidate } from "@/lib/fourSeasonsPresentation";

type FourSeasonsPresentationPlanProps = {
  candidates: readonly PresentationCandidate[];
  selectedVillaNumbers: ReadonlySet<number>;
  bedroom: number;
  clientMode: boolean;
  onVillaClick: (villaNumber: number) => void;
};

/**
 * The presentation uses the same verified master plan and percentage anchors
 * as the operational Four Seasons map. It deliberately renders only the
 * residences in the current private selection/category, never the whole stock.
 */
export function FourSeasonsPresentationPlan({
  candidates,
  selectedVillaNumbers,
  bedroom,
  clientMode,
  onVillaClick,
}: FourSeasonsPresentationPlanProps) {
  const selectedCount = candidates.filter((row) => selectedVillaNumbers.has(row.villa.villaNumber)).length;
  const subtitle = clientMode
    ? `${candidates.length} selected ${bedroom}-bedroom residence${candidates.length === 1 ? "" : "s"} shown on the master plan.`
    : `${candidates.length} active ${bedroom}-bedroom residence${candidates.length === 1 ? "" : "s"}. Select exact villas directly from the plan.`;

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-stone-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#8f7444]">Four Seasons Private Residences</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">Private master plan</h2>
          <p className="mt-1 text-sm text-stone-600">{subtitle}</p>
        </div>
        {!clientMode && selectedCount > 0 && (
          <span className="inline-flex w-fit items-center rounded-full border border-[#c3a368]/60 bg-[#fbf7ef] px-3 py-1 text-xs font-medium text-[#765f39]">
            {selectedCount} selected
          </span>
        )}
      </div>

      {candidates.length === 0 ? (
        <div className="p-10 text-center text-sm text-stone-500">No current residences are selected for this plan.</div>
      ) : (
        <div className="overflow-auto bg-[#e8e6df] p-3 sm:p-5">
          <div className="relative min-w-[760px] overflow-hidden rounded-xl border border-stone-300 bg-white shadow-inner">
            <img
              src={FOUR_SEASONS_MASTERPLAN_IMAGE}
              alt="Four Seasons Private Residences master plan with selected residence markers"
              className="block h-auto w-full"
            />
            {candidates.map(({ villa }) => {
              const selected = selectedVillaNumbers.has(villa.villaNumber);
              return (
                <button
                  key={villa.villaKey}
                  type="button"
                  title={`Villa ${villa.villaNumber}`}
                  aria-label={`${selected ? "Selected " : ""}Villa ${villa.villaNumber}`}
                  onClick={() => onVillaClick(villa.villaNumber)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white px-1.5 py-1 text-[10px] font-bold text-white shadow-lg transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-[#c3a368] ${
                    selected ? "bg-[#23483f] ring-2 ring-[#d7bc81]" : "bg-[#9a7a44]"
                  }`}
                  style={{ left: `${villa.xPercent}%`, top: `${villa.yPercent}%` }}
                >
                  {villa.villaNumber}
                </button>
              );
            })}
            <div className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-[#1f312c]/90 px-2.5 py-1.5 text-[0.62rem] font-medium text-white shadow">
              <MapPinned className="h-3 w-3 text-[#d7bc81]" />
              {clientMode ? "Private selection" : "Active private listings"}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

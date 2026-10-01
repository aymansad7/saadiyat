import { useMemo } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowLeft, Check, Copy, MapPin, Presentation, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { OneDriveCardLinks } from "@/components/ListingControls";
import { FourSeasonsPresentationPlan } from "@/components/FourSeasonsPresentationPlan";
import { FourSeasonsProjectDetails, FourSeasonsProjectDocumentLinks } from "@/components/FourSeasonsProjectDetails";
import { FOUR_SEASONS_VILLAS } from "@/data/fourSeasons";
import { useListingIndex } from "@/hooks/useListingIndex";
import {
  buildPresentationSearch,
  getAvailablePresentationCandidates,
  getPresentationPlanCandidates,
  isClientPresentation,
  parsePresentationBedroom,
  parsePresentationVillaSelection,
  PRESENTATION_BEDROOMS,
  type PresentationBedroom,
} from "@/lib/fourSeasonsPresentation";

const AED = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });
const NUMBER = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });

function formatPrice(value: number | null) {
  return value ? `AED ${AED.format(value)}` : "Price on request";
}

function formatArea(value: number | null) {
  return value ? `${NUMBER.format(value)} m²` : "—";
}

export default function FourSeasonsPresentation() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const bedroom = parsePresentationBedroom(search);
  const requestedSelection = parsePresentationVillaSelection(search, bedroom);
  const clientMode = isClientPresentation(search);
  const { index: listingIndex, isLoading } = useListingIndex({ community: "four-seasons" });

  const candidates = useMemo(
    () => getAvailablePresentationCandidates(FOUR_SEASONS_VILLAS, listingIndex, bedroom),
    [bedroom, listingIndex],
  );
  const candidateNumbers = new Set(candidates.map((row) => row.villa.villaNumber));
  const selectedNumbers = requestedSelection.filter((number) => candidateNumbers.has(number));
  const selectedNumberSet = new Set(selectedNumbers);
  const displayed = clientMode
    ? candidates.filter((row) => selectedNumberSet.has(row.villa.villaNumber))
    : selectedNumbers.length > 0
    ? candidates.filter((row) => selectedNumberSet.has(row.villa.villaNumber))
    : candidates;
  const planCandidates = getPresentationPlanCandidates(candidates, selectedNumberSet, clientMode);

  const navigate = (nextBedroom: PresentationBedroom, nextNumbers: readonly number[], nextClientMode = false) => {
    setLocation(`/presentation${buildPresentationSearch({ bedrooms: nextBedroom, villaNumbers: nextNumbers, clientView: nextClientMode })}`);
  };

  const selectBedroom = (nextBedroom: PresentationBedroom) => navigate(nextBedroom, [], false);
  const toggleResidence = (villaNumber: number) => {
    const next = selectedNumberSet.has(villaNumber)
      ? selectedNumbers.filter((number) => number !== villaNumber)
      : [...selectedNumbers, villaNumber];
    navigate(bedroom, next, false);
  };
  const handlePlanVilla = (villaNumber: number) => {
    if (!clientMode) {
      toggleResidence(villaNumber);
      return;
    }
    document.getElementById(`presentation-villa-${villaNumber}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const copyClientLink = async () => {
    const url = `${window.location.origin}/presentation${buildPresentationSearch({
      bedrooms: bedroom,
      villaNumbers: selectedNumbers,
      clientView: true,
    })}`;
    await navigator.clipboard?.writeText(url);
  };

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-stone-950">
      <SiteHeader subTitle="Private Residence Presentation" back={{ href: "/four-seasons", label: "Four Seasons" }} />
      <main className="container py-7 sm:py-10">
        <section className="relative overflow-hidden rounded-[1.7rem] border border-stone-200 bg-[#1f312c] px-5 py-8 text-white shadow-xl sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(199,169,109,0.35),transparent_62%)]" />
          <div className="relative max-w-3xl">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[#d7bc81]">Four Seasons Private Residences · Saadiyat Island</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-6xl">A private selection, prepared for today.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              {clientMode
                ? `A considered selection of ${bedroom}-bedroom private residences.`
                : "Choose only the residences that fit the conversation. This is a discreet client presentation—not an inventory screen."}
            </p>
            <div className="mt-5"><FourSeasonsProjectDocumentLinks compact /></div>
          </div>
        </section>

        {!clientMode && (
          <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-stone-500">Presentation builder</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">Select the residences to show</h2>
              </div>
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Bedroom selection">
                {PRESENTATION_BEDROOMS.map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={bedroom === value ? "default" : "outline"}
                    onClick={() => selectBedroom(value)}
                    className={bedroom === value ? "bg-[#8f7444] text-white hover:bg-[#765f39]" : "border-stone-300 text-stone-700 hover:bg-stone-100"}
                  >
                    {value} Bedroom
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-stone-600">
                {selectedNumbers.length > 0
                  ? `${selectedNumbers.length} residence${selectedNumbers.length === 1 ? "" : "s"} selected for this presentation.`
                  : "Select residences below to create a focused client view."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={copyClientLink} disabled={selectedNumbers.length === 0} className="border-stone-300 text-stone-800">
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy client link
                </Button>
                {selectedNumbers.length > 0 ? (
                  <Button asChild className="bg-[#23483f] text-white hover:bg-[#183932]">
                    <Link href={`/presentation${buildPresentationSearch({ bedrooms: bedroom, villaNumbers: selectedNumbers, clientView: true })}`}>
                      <Presentation className="mr-1.5 h-3.5 w-3.5" /> Open client view
                    </Link>
                  </Button>
                ) : (
                  <Button type="button" disabled className="bg-[#23483f] text-white">
                    <Presentation className="mr-1.5 h-3.5 w-3.5" /> Open client view
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}

        {clientMode && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
            <span>Private selection · {bedroom} Bedroom</span>
            <Link href="/four-seasons" className="inline-flex items-center gap-1 font-medium text-[#23483f] hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to residences
            </Link>
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-12 text-center text-sm text-stone-500">Preparing the selected residences…</div>
        ) : displayed.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
            <Sparkles className="mx-auto h-6 w-6 text-[#8f7444]" />
            <h2 className="mt-3 font-display text-2xl font-semibold">No selection to show</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
              {clientMode ? "This private selection is no longer active. Please ask your advisor for an updated presentation." : `No active ${bedroom}-bedroom listings are currently recorded.`}
            </p>
          </div>
        ) : (
          <>
            <FourSeasonsPresentationPlan
              candidates={planCandidates}
              selectedVillaNumbers={selectedNumberSet}
              bedroom={bedroom}
              clientMode={clientMode}
              onVillaClick={handlePlanVilla}
            />
            <FourSeasonsProjectDetails compact />
            <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {displayed.map(({ villa, listing }) => {
                const selected = selectedNumberSet.has(villa.villaNumber);
                return (
                  <article id={`presentation-villa-${villa.villaNumber}`} key={villa.villaKey} className="group scroll-mt-28 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="h-2 bg-gradient-to-r from-[#23483f] via-[#3c6757] to-[#c3a368]" />
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#8f7444]">Four Seasons Private Residences</p>
                          <h2 className="mt-1 font-display text-3xl font-semibold">Villa {villa.villaNumber}</h2>
                          <p className="mt-1 text-sm text-stone-600">{villa.villaType}{villa.view ? ` · ${villa.view}` : ""}</p>
                        </div>
                        {!clientMode && (
                          <Button
                            type="button"
                            size="sm"
                            variant={selected ? "default" : "outline"}
                            onClick={() => toggleResidence(villa.villaNumber)}
                            className={selected ? "bg-[#23483f] text-white hover:bg-[#183932]" : "border-stone-300 text-stone-700"}
                          >
                            {selected ? <><Check className="mr-1 h-3.5 w-3.5" /> Selected</> : "Add"}
                          </Button>
                        )}
                      </div>

                      <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-y border-stone-100 py-5 text-sm">
                        <div><dt className="text-[0.63rem] uppercase tracking-[0.13em] text-stone-500">Bedrooms</dt><dd className="mt-1 font-medium">{villa.bedrooms} Bedroom</dd></div>
                        <div><dt className="text-[0.63rem] uppercase tracking-[0.13em] text-stone-500">View</dt><dd className="mt-1 font-medium">{villa.view ?? "Private residence"}</dd></div>
                        <div><dt className="text-[0.63rem] uppercase tracking-[0.13em] text-stone-500">Land</dt><dd className="mt-1 font-medium">{formatArea(listing.landAreaSqm ?? villa.plotAreaSqm)}</dd></div>
                        <div><dt className="text-[0.63rem] uppercase tracking-[0.13em] text-stone-500">Total area</dt><dd className="mt-1 font-medium">{formatArea(listing.builtUpAreaSqm ?? villa.builtUpAreaSqm)}</dd></div>
                      </dl>

                      <div className="mt-5">
                        <p className="text-[0.63rem] uppercase tracking-[0.13em] text-stone-500">Asking price</p>
                        <p className="mt-1 font-display text-3xl font-semibold text-[#23483f]">{formatPrice(listing.askingPriceAed ?? villa.askingPriceAed)}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <Button asChild size="sm" variant="outline" className="border-stone-300 text-stone-700">
                          <Link href={`/map?plot=${encodeURIComponent(villa.villaKey)}`}><MapPin className="mr-1.5 h-3.5 w-3.5" /> Location</Link>
                        </Button>
                        <OneDriveCardLinks villaKey={villa.villaKey} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}

        {!clientMode && displayed.length > 0 && (
          <p className="mt-6 text-center text-xs text-stone-500">Prices and property details are presented per the selected owner/NAS listings. No availability count or stock indication is shown in the client view.</p>
        )}
      </main>
    </div>
  );
}

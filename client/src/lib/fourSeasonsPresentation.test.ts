import { describe, expect, it } from "vitest";
import type { FourSeasonsVilla } from "@/data/fourSeasons";
import type { ListingIndexEntry } from "@/hooks/useListingIndex";
import {
  buildPresentationSearch,
  getAvailablePresentationCandidates,
  parsePresentationBedroom,
  parsePresentationVillaSelection,
} from "./fourSeasonsPresentation";

const villa = (number: number, bedrooms: number): FourSeasonsVilla => ({
  villaKey: `four-seasons/villa-${number}`,
  villaNumber: number,
  label: `Villa ${number}`,
  villaType: "Garden Villa",
  bedrooms,
  bedroomLabel: null,
  status: "available",
  availabilityUpdatedAt: null,
  view: "Garden",
  internalAreaSqft: null,
  externalAreaSqft: null,
  builtUpAreaSqft: null,
  builtUpAreaSqm: null,
  plotAreaSqft: null,
  plotAreaSqm: null,
  askingPriceAed: null,
  sourcePage: null,
  historicalSpecSource: null,
  xPercent: 0,
  yPercent: 0,
  latitude: 0,
  longitude: 0,
  sdn3PlotNumber: null,
  positionSource: "masterplan_quadratic_calibrated_to_sdn3_controls",
});

const listing = (villaKey: string, status: ListingIndexEntry["status"]): ListingIndexEntry => ({
  villaKey,
  community: "four-seasons",
  askingPriceAed: 1,
  status,
  listingPartners: null,
  publicNotes: null,
  landAreaSqm: null,
  builtUpAreaSqm: null,
  availableForRent: null,
  rentPriceAed: null,
});

describe("Four Seasons presentation selection", () => {
  it("defaults to the six current five-bedroom proposal villas", () => {
    expect(parsePresentationBedroom("")).toBe(5);
    expect(parsePresentationVillaSelection("", 5)).toEqual([16, 19, 20, 21, 44, 45]);
  });

  it("uses only explicit active listings and the verified villa bedroom type", () => {
    const villas = [villa(16, 5), villa(19, 5), villa(12, 6)];
    const index = new Map<string, ListingIndexEntry>([
      ["four-seasons/villa-16", listing("four-seasons/villa-16", "available")],
      ["four-seasons/villa-19", listing("four-seasons/villa-19", "sold")],
      ["four-seasons/villa-12", listing("four-seasons/villa-12", "available")],
    ]);
    expect(getAvailablePresentationCandidates(villas, index, 5).map((row) => row.villa.villaNumber)).toEqual([16]);
    expect(getAvailablePresentationCandidates(villas, index, 6).map((row) => row.villa.villaNumber)).toEqual([12]);
  });

  it("creates a stable selected-residence client view URL", () => {
    expect(buildPresentationSearch({ bedrooms: 5, villaNumbers: [45, 16, 16], clientView: true }))
      .toBe("?beds=5&villas=16%2C45&mode=present");
  });
});

/**
 * Four Seasons developer floorplan and plot-detail sheets supplied on 23 Aug 2026.
 *
 * These documents are not municipal DCRs. Plot and Sellable Area values are
 * transcribed from the developer sheets. They do not imply current availability.
 */
export type FourSeasonsFloorplan = {
  villaKey: string;
  villaNumber: number;
  villaType: string;
  bedrooms: 5 | 6;
  plotAreaSqft: number;
  plotAreaSqmPrinted: number;
  sellableAreaSqft: number;
  sellableAreaSqmPrinted: number;
  pdfUrl: string;
  sourceKind: "developer_floorplan";
};

export const FOUR_SEASONS_FLOORPLANS = [
  { villaKey: "four-seasons/villa-12", villaNumber: 12, villaType: "Garden Villa", bedrooms: 6, plotAreaSqft: 17236, plotAreaSqmPrinted: 1601, sellableAreaSqft: 22718, sellableAreaSqmPrinted: 2111, pdfUrl: "/manus-storage/VILLA12_2367dfdc.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-13", villaNumber: 13, villaType: "Garden Villa", bedrooms: 6, plotAreaSqft: 16985, plotAreaSqmPrinted: 1578, sellableAreaSqft: 22718, sellableAreaSqmPrinted: 2111, pdfUrl: "/manus-storage/VILLA13_92fde60e.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-14", villaNumber: 14, villaType: "Signature Golf View Villa", bedrooms: 5, plotAreaSqft: 14116, plotAreaSqmPrinted: 1311, sellableAreaSqft: 19123, sellableAreaSqmPrinted: 1777, pdfUrl: "/manus-storage/Villa14_ec200360.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-15", villaNumber: 15, villaType: "Signature Golf View Villa", bedrooms: 5, plotAreaSqft: 15044, plotAreaSqmPrinted: 1398, sellableAreaSqft: 19123, sellableAreaSqmPrinted: 1777, pdfUrl: "/manus-storage/Villa15_399e85be.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-16", villaNumber: 16, villaType: "Signature Golf View Villa", bedrooms: 5, plotAreaSqft: 14363, plotAreaSqmPrinted: 1334, sellableAreaSqft: 19123, sellableAreaSqmPrinted: 1777, pdfUrl: "/manus-storage/Villa16_3a58285b.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-20", villaNumber: 20, villaType: "Garden Villa", bedrooms: 5, plotAreaSqft: 13226, plotAreaSqmPrinted: 1229, sellableAreaSqft: 17451, sellableAreaSqmPrinted: 1621, pdfUrl: "/manus-storage/Villa20_cac8c6bd.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-21", villaNumber: 21, villaType: "Golf View Villa", bedrooms: 5, plotAreaSqft: 13938, plotAreaSqmPrinted: 1295, sellableAreaSqft: 17451, sellableAreaSqmPrinted: 1621, pdfUrl: "/manus-storage/Villa21_5d992676.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-25", villaNumber: 25, villaType: "Golf Villa", bedrooms: 6, plotAreaSqft: 17818, plotAreaSqmPrinted: 1655, sellableAreaSqft: 22718, sellableAreaSqmPrinted: 2111, pdfUrl: "/manus-storage/VILLA25_8082a370.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-27", villaNumber: 27, villaType: "Golf Villa", bedrooms: 6, plotAreaSqft: 17942, plotAreaSqmPrinted: 1667, sellableAreaSqft: 22718, sellableAreaSqmPrinted: 2111, pdfUrl: "/manus-storage/VILLA27_8bf09b4f.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-29", villaNumber: 29, villaType: "Golf Villa", bedrooms: 6, plotAreaSqft: 18976, plotAreaSqmPrinted: 1763, sellableAreaSqft: 22718, sellableAreaSqmPrinted: 2111, pdfUrl: "/manus-storage/VILLA29_21eb5e73.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-31", villaNumber: 31, villaType: "Golf Villa", bedrooms: 6, plotAreaSqft: 19762, plotAreaSqmPrinted: 1836, sellableAreaSqft: 22718, sellableAreaSqmPrinted: 2113, pdfUrl: "/manus-storage/VILLA31_d61a0874.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-33", villaNumber: 33, villaType: "Golf Villa", bedrooms: 6, plotAreaSqft: 16840, plotAreaSqmPrinted: 1564, sellableAreaSqft: 22718, sellableAreaSqmPrinted: 2111, pdfUrl: "/manus-storage/VILLA33_99fbff21.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-37", villaNumber: 37, villaType: "Garden Villa", bedrooms: 5, plotAreaSqft: 13318, plotAreaSqmPrinted: 1237, sellableAreaSqft: 17451, sellableAreaSqmPrinted: 1621, pdfUrl: "/manus-storage/Villa37_23676584.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-38", villaNumber: 38, villaType: "Garden Villa", bedrooms: 5, plotAreaSqft: 13662, plotAreaSqmPrinted: 1269, sellableAreaSqft: 17451, sellableAreaSqmPrinted: 1621, pdfUrl: "/manus-storage/Villa38_23b0ebb6.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-39", villaNumber: 39, villaType: "Garden Villa", bedrooms: 5, plotAreaSqft: 16222, plotAreaSqmPrinted: 1507, sellableAreaSqft: 17542, sellableAreaSqmPrinted: 1629, pdfUrl: "/manus-storage/Villa39_14f283a8.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-40", villaNumber: 40, villaType: "Garden Villa", bedrooms: 5, plotAreaSqft: 13709, plotAreaSqmPrinted: 1274, sellableAreaSqft: 17451, sellableAreaSqmPrinted: 1621, pdfUrl: "/manus-storage/Villa40_80db15f2.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-43", villaNumber: 43, villaType: "Garden Villa", bedrooms: 5, plotAreaSqft: 13325, plotAreaSqmPrinted: 1238, sellableAreaSqft: 17451, sellableAreaSqmPrinted: 1621, pdfUrl: "/manus-storage/Villa43_09e202bb.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-44", villaNumber: 44, villaType: "Garden Villa", bedrooms: 5, plotAreaSqft: 13195, plotAreaSqmPrinted: 1226, sellableAreaSqft: 17451, sellableAreaSqmPrinted: 1621, pdfUrl: "/manus-storage/Villa44_5ffc2850.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-48", villaNumber: 48, villaType: "Garden Villa", bedrooms: 6, plotAreaSqft: 20508, plotAreaSqmPrinted: 1905, sellableAreaSqft: 20008, sellableAreaSqmPrinted: 1859, pdfUrl: "/manus-storage/VILLA48_6b5c051c.pdf", sourceKind: "developer_floorplan" },
  { villaKey: "four-seasons/villa-50", villaNumber: 50, villaType: "Garden Villa", bedrooms: 6, plotAreaSqft: 18565, plotAreaSqmPrinted: 1725, sellableAreaSqft: 20008, sellableAreaSqmPrinted: 1859, pdfUrl: "/manus-storage/VILLA50_2d63ad34.pdf", sourceKind: "developer_floorplan" },
] as const satisfies readonly FourSeasonsFloorplan[];

export const FOUR_SEASONS_FLOORPLAN_BY_VILLA: ReadonlyMap<number, FourSeasonsFloorplan> = new Map(
  FOUR_SEASONS_FLOORPLANS.map((floorplan) => [floorplan.villaNumber, floorplan] as const),
);

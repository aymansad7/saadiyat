/**
 * Four Seasons municipal transaction registry.
 * Source: AbuDhabi-Transactions-MasterExport_Column-Project-Nam-four_Column-Property-Ty-v_2026-08-23.csv
 * Imported: 2026-08-23
 *
 * These records remain intentionally unmatched until the user supplies the
 * official plot/villa list and areas. Do not infer unit assignments.
 */
export type FourSeasonsPendingTransaction = {
  id: string;
  sourceRow: number;
  date: string;
  assetClass: string;
  propertyType: string;
  layout: string;
  district: string;
  community: string;
  projectName: string;
  priceAed: number;
  builtUpAreaSqm: number;
  rateAedPerSqm: number;
  landAreaSqm: number;
  saleApplicationType: string;
  saleSequence: string;
  matchStatus: "pending_land_match";
  matchedVillaKey: null;
};

export const FOUR_SEASONS_PENDING_TRANSACTIONS = [
  {
    "id": "four-seasons-pending-row-2",
    "sourceRow": 2,
    "date": "2026-08-20",
    "assetClass": "residential",
    "propertyType": "villa",
    "layout": "6+ beds",
    "district": "Al Saadiyat Island",
    "community": "SDN3",
    "projectName": "Four Seasons Private Residences",
    "priceAed": 350000000.0,
    "builtUpAreaSqm": 2633.63,
    "rateAedPerSqm": 132896.42052983903,
    "landAreaSqm": 2789.03,
    "saleApplicationType": "off-plan",
    "saleSequence": "primary",
    "matchStatus": "pending_land_match",
    "matchedVillaKey": null
  },
  {
    "id": "four-seasons-pending-row-3",
    "sourceRow": 3,
    "date": "2026-05-05",
    "assetClass": "residential",
    "propertyType": "villa",
    "layout": "5 beds",
    "district": "Al Saadiyat Island",
    "community": "SDN3",
    "projectName": "Four Seasons Private Residences",
    "priceAed": 99500000.0,
    "builtUpAreaSqm": 1776.63,
    "rateAedPerSqm": 56004.908168836504,
    "landAreaSqm": 1304.38,
    "saleApplicationType": "off-plan",
    "saleSequence": "primary",
    "matchStatus": "pending_land_match",
    "matchedVillaKey": null
  },
  {
    "id": "four-seasons-pending-row-4",
    "sourceRow": 4,
    "date": "2026-05-05",
    "assetClass": "residential",
    "propertyType": "villa",
    "layout": "5 beds",
    "district": "Al Saadiyat Island",
    "community": "SDN3",
    "projectName": "Four Seasons Private Residences",
    "priceAed": 94500000.0,
    "builtUpAreaSqm": 1776.63,
    "rateAedPerSqm": 53190.59117542764,
    "landAreaSqm": 1176.03,
    "saleApplicationType": "off-plan",
    "saleSequence": "primary",
    "matchStatus": "pending_land_match",
    "matchedVillaKey": null
  },
  {
    "id": "four-seasons-pending-row-5",
    "sourceRow": 5,
    "date": "2026-04-26",
    "assetClass": "residential",
    "propertyType": "villa",
    "layout": "5 beds",
    "district": "Al Saadiyat Island",
    "community": "SDN3",
    "projectName": "Four Seasons Private Residences",
    "priceAed": 83400000.0,
    "builtUpAreaSqm": 1621.27,
    "rateAedPerSqm": 51441.15415692636,
    "landAreaSqm": 1269.23,
    "saleApplicationType": "off-plan",
    "saleSequence": "primary",
    "matchStatus": "pending_land_match",
    "matchedVillaKey": null
  },
  {
    "id": "four-seasons-pending-row-6",
    "sourceRow": 6,
    "date": "2026-04-21",
    "assetClass": "residential",
    "propertyType": "villa",
    "layout": "5 beds",
    "district": "Al Saadiyat Island",
    "community": "SDN3",
    "projectName": "Four Seasons Private Residences",
    "priceAed": 82900000.0,
    "builtUpAreaSqm": 1776.63,
    "rateAedPerSqm": 46661.37575071906,
    "landAreaSqm": 1176.03,
    "saleApplicationType": "off-plan",
    "saleSequence": "primary",
    "matchStatus": "pending_land_match",
    "matchedVillaKey": null
  },
  {
    "id": "four-seasons-pending-row-7",
    "sourceRow": 7,
    "date": "2026-04-13",
    "assetClass": "residential",
    "propertyType": "villa",
    "layout": "5 beds",
    "district": "Al Saadiyat Island",
    "community": "SDN3",
    "projectName": "Four Seasons Private Residences",
    "priceAed": 87500000.0,
    "builtUpAreaSqm": 1621.27,
    "rateAedPerSqm": 53970.035836103794,
    "landAreaSqm": 1273.62,
    "saleApplicationType": "off-plan",
    "saleSequence": "primary",
    "matchStatus": "pending_land_match",
    "matchedVillaKey": null
  },
  {
    "id": "four-seasons-pending-row-8",
    "sourceRow": 8,
    "date": "2026-04-01",
    "assetClass": "residential",
    "propertyType": "villa",
    "layout": "5 beds",
    "district": "Al Saadiyat Island",
    "community": "SDN3",
    "projectName": "Four Seasons Private Residences",
    "priceAed": 86800000.0,
    "builtUpAreaSqm": 1776.63,
    "rateAedPerSqm": 48856.54300557797,
    "landAreaSqm": 1176.03,
    "saleApplicationType": "off-plan",
    "saleSequence": "primary",
    "matchStatus": "pending_land_match",
    "matchedVillaKey": null
  },
  {
    "id": "four-seasons-pending-row-9",
    "sourceRow": 9,
    "date": "2026-04-01",
    "assetClass": "residential",
    "propertyType": "villa",
    "layout": "5 beds",
    "district": "Al Saadiyat Island",
    "community": "SDN3",
    "projectName": "Four Seasons Private Residences",
    "priceAed": 69500000.0,
    "builtUpAreaSqm": 1621.27,
    "rateAedPerSqm": 42867.6284641053,
    "landAreaSqm": 1320.81,
    "saleApplicationType": "off-plan",
    "saleSequence": "primary",
    "matchStatus": "pending_land_match",
    "matchedVillaKey": null
  },
  {
    "id": "four-seasons-pending-row-10",
    "sourceRow": 10,
    "date": "2026-03-30",
    "assetClass": "residential",
    "propertyType": "villa",
    "layout": "5 beds",
    "district": "Al Saadiyat Island",
    "community": "SDN3",
    "projectName": "Four Seasons Private Residences",
    "priceAed": 95500000.0,
    "builtUpAreaSqm": 1776.63,
    "rateAedPerSqm": 53753.45457410941,
    "landAreaSqm": 1293.98,
    "saleApplicationType": "off-plan",
    "saleSequence": "primary",
    "matchStatus": "pending_land_match",
    "matchedVillaKey": null
  },
  {
    "id": "four-seasons-pending-row-11",
    "sourceRow": 11,
    "date": "2026-02-18",
    "assetClass": "residential",
    "propertyType": "villa",
    "layout": "5 beds",
    "district": "Al Saadiyat Island",
    "community": "SDN3",
    "projectName": "Four Seasons Private Residences",
    "priceAed": 76300000.0,
    "builtUpAreaSqm": 1621.27,
    "rateAedPerSqm": 47061.871249082506,
    "landAreaSqm": 1299.45,
    "saleApplicationType": "off-plan",
    "saleSequence": "primary",
    "matchStatus": "pending_land_match",
    "matchedVillaKey": null
  },
  {
    "id": "four-seasons-pending-row-12",
    "sourceRow": 12,
    "date": "2026-01-21",
    "assetClass": "residential",
    "propertyType": "villa",
    "layout": "5 beds",
    "district": "Al Saadiyat Island",
    "community": "SDN3",
    "projectName": "Four Seasons Private Residences",
    "priceAed": 83200000.0,
    "builtUpAreaSqm": 1621.27,
    "rateAedPerSqm": 51317.79407501526,
    "landAreaSqm": 1276.82,
    "saleApplicationType": "off-plan",
    "saleSequence": "primary",
    "matchStatus": "pending_land_match",
    "matchedVillaKey": null
  },
  {
    "id": "four-seasons-pending-row-13",
    "sourceRow": 13,
    "date": "2026-01-21",
    "assetClass": "residential",
    "propertyType": "villa",
    "layout": "5 beds",
    "district": "Al Saadiyat Island",
    "community": "SDN3",
    "projectName": "Four Seasons Private Residences",
    "priceAed": 83800000.0,
    "builtUpAreaSqm": 1621.27,
    "rateAedPerSqm": 51687.874320748546,
    "landAreaSqm": 1342.66,
    "saleApplicationType": "off-plan",
    "saleSequence": "primary",
    "matchStatus": "pending_land_match",
    "matchedVillaKey": null
  },
  {
    "id": "four-seasons-pending-row-14",
    "sourceRow": 14,
    "date": "2026-01-21",
    "assetClass": "residential",
    "propertyType": "villa",
    "layout": "5 beds",
    "district": "Al Saadiyat Island",
    "community": "SDN3",
    "projectName": "Four Seasons Private Residences",
    "priceAed": 90600000.0,
    "builtUpAreaSqm": 1776.63,
    "rateAedPerSqm": 50995.42392056872,
    "landAreaSqm": 1176.03,
    "saleApplicationType": "off-plan",
    "saleSequence": "primary",
    "matchStatus": "pending_land_match",
    "matchedVillaKey": null
  },
  {
    "id": "four-seasons-pending-row-15",
    "sourceRow": 15,
    "date": "2026-01-20",
    "assetClass": "residential",
    "propertyType": "villa",
    "layout": "6+ beds",
    "district": "Al Saadiyat Island",
    "community": "SDN3",
    "projectName": "Four Seasons Private Residences",
    "priceAed": 116600000.0,
    "builtUpAreaSqm": 2110.57,
    "rateAedPerSqm": 55245.73930265284,
    "landAreaSqm": 1503.21,
    "saleApplicationType": "off-plan",
    "saleSequence": "primary",
    "matchStatus": "pending_land_match",
    "matchedVillaKey": null
  },
  {
    "id": "four-seasons-pending-row-16",
    "sourceRow": 16,
    "date": "2026-01-20",
    "assetClass": "residential",
    "propertyType": "villa",
    "layout": "6+ beds",
    "district": "Al Saadiyat Island",
    "community": "SDN3",
    "projectName": "Four Seasons Private Residences",
    "priceAed": 135000000.0,
    "builtUpAreaSqm": 2110.57,
    "rateAedPerSqm": 63963.76334355174,
    "landAreaSqm": 1393.45,
    "saleApplicationType": "off-plan",
    "saleSequence": "primary",
    "matchStatus": "pending_land_match",
    "matchedVillaKey": null
  }
] as const satisfies readonly FourSeasonsPendingTransaction[];

export const FOUR_SEASONS_PENDING_SUMMARY = {
  recordCount: FOUR_SEASONS_PENDING_TRANSACTIONS.length,
  latestDate: FOUR_SEASONS_PENDING_TRANSACTIONS[0]?.date ?? null,
  totalValueAed: FOUR_SEASONS_PENDING_TRANSACTIONS.reduce((sum, record) => sum + record.priceAed, 0),
  status: "pending_land_match" as const,
};

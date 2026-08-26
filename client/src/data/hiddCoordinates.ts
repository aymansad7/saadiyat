/**
 * Hidd Al Saadiyat villa coordinates.
 * User controls take priority. Exact Yandex house-address matches are retained as a separately labeled source; all remaining points are calibrated from the preserved shape and controls.
 */

export type HiddPositionSource = "user_supplied_coordinate" | "yandex_exact_address_match" | "street_control_calibrated" | "shape_control_calibrated";

export interface HiddVillaCoord {
  villaNumber: string;
  street: string;
  lat: number;
  lng: number;
  positionSource: HiddPositionSource;
  controlPlot: string | null;
}

export const hiddVillaCoords: HiddVillaCoord[] = [
  {
    "villaNumber": "100",
    "street": "BOULEVARD",
    "lat": 24.583868,
    "lng": 54.473022,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "102",
    "street": "BOULEVARD",
    "lat": 24.584025,
    "lng": 54.473147,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "117",
    "street": "BOULEVARD",
    "lat": 24.585734559239413,
    "lng": 54.475349484358766,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "118",
    "street": "BOULEVARD",
    "lat": 24.586218,
    "lng": 54.474764,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "119",
    "street": "BOULEVARD",
    "lat": 24.585996,
    "lng": 54.474548,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "120",
    "street": "BOULEVARD",
    "lat": 24.585766,
    "lng": 54.474324,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "121",
    "street": "BOULEVARD",
    "lat": 24.585511,
    "lng": 54.474108,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "122",
    "street": "BOULEVARD",
    "lat": 24.58524,
    "lng": 54.47392,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "123",
    "street": "BOULEVARD",
    "lat": 24.585181530587196,
    "lng": 54.47433692881032,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "89",
    "street": "BOULEVARD",
    "lat": 24.581519,
    "lng": 54.472087,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "91",
    "street": "BOULEVARD",
    "lat": 24.581831,
    "lng": 54.472366,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "93",
    "street": "BOULEVARD",
    "lat": 24.582004,
    "lng": 54.472527,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "95",
    "street": "BOULEVARD",
    "lat": 24.582176,
    "lng": 54.47268,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "97",
    "street": "BOULEVARD",
    "lat": 24.582341,
    "lng": 54.472851,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "99",
    "street": "BOULEVARD",
    "lat": 24.582447,
    "lng": 54.473093,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "101",
    "street": "BOULEVARD",
    "lat": 24.582595,
    "lng": 54.473246,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "103",
    "street": "BOULEVARD",
    "lat": 24.582735,
    "lng": 54.473399,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "104",
    "street": "BOULEVARD",
    "lat": 24.582907,
    "lng": 54.473569,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "90",
    "street": "BOULEVARD",
    "lat": 24.58270469005763,
    "lng": 54.47228733929177,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "92",
    "street": "BOULEVARD",
    "lat": 24.583047,
    "lng": 54.472321,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "94",
    "street": "BOULEVARD",
    "lat": 24.5834,
    "lng": 54.472473,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "96",
    "street": "BOULEVARD",
    "lat": 24.583482,
    "lng": 54.472734,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "98",
    "street": "BOULEVARD",
    "lat": 24.583688,
    "lng": 54.472869,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "75",
    "street": "BOULEVARD",
    "lat": 24.580221,
    "lng": 54.471108,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "77",
    "street": "BOULEVARD",
    "lat": 24.581664389168623,
    "lng": 54.47094945647911,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "79",
    "street": "BOULEVARD",
    "lat": 24.581676454896787,
    "lng": 54.47115150042985,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "81",
    "street": "BOULEVARD",
    "lat": 24.581683950412938,
    "lng": 54.47135183079044,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "83",
    "street": "BOULEVARD",
    "lat": 24.580804,
    "lng": 54.47153,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "85",
    "street": "BOULEVARD",
    "lat": 24.581043,
    "lng": 54.471719,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "87",
    "street": "BOULEVARD",
    "lat": 24.581281,
    "lng": 54.471898,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "105",
    "street": "BOULEVARD",
    "lat": 24.583359358985795,
    "lng": 54.473945070948105,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "106",
    "street": "BOULEVARD",
    "lat": 24.5834,
    "lng": 54.474045,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "107",
    "street": "BOULEVARD",
    "lat": 24.583414754906304,
    "lng": 54.4741507624767,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "108",
    "street": "BOULEVARD",
    "lat": 24.583688,
    "lng": 54.474737,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "109",
    "street": "BOULEVARD",
    "lat": 24.583852,
    "lng": 54.475016,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "110",
    "street": "BOULEVARD",
    "lat": 24.584074,
    "lng": 54.475294,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "111",
    "street": "BOULEVARD",
    "lat": 24.584312,
    "lng": 54.475528,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "112",
    "street": "BOULEVARD",
    "lat": 24.584583,
    "lng": 54.475734,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "113",
    "street": "BOULEVARD",
    "lat": 24.584871,
    "lng": 54.475887,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "114",
    "street": "BOULEVARD",
    "lat": 24.585166,
    "lng": 54.475995,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "115",
    "street": "BOULEVARD",
    "lat": 24.58547,
    "lng": 54.476076,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "116",
    "street": "BOULEVARD",
    "lat": 24.58575,
    "lng": 54.476192,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "68",
    "street": "BOULEVARD",
    "lat": 24.580484,
    "lng": 54.47021,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "70",
    "street": "BOULEVARD",
    "lat": 24.580673,
    "lng": 54.470353,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "72",
    "street": "BOULEVARD",
    "lat": 24.580862,
    "lng": 54.470506,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "74",
    "street": "BOULEVARD",
    "lat": 24.581248,
    "lng": 54.470776,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "76",
    "street": "BOULEVARD",
    "lat": 24.581462,
    "lng": 54.470955,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "78",
    "street": "BOULEVARD",
    "lat": 24.581642,
    "lng": 54.471108,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "80",
    "street": "BOULEVARD",
    "lat": 24.581831,
    "lng": 54.471252,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "82",
    "street": "BOULEVARD",
    "lat": 24.582143,
    "lng": 54.471521,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "84",
    "street": "BOULEVARD",
    "lat": 24.582324,
    "lng": 54.471674,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "86",
    "street": "BOULEVARD",
    "lat": 24.582113184549044,
    "lng": 54.47185938577702,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "88",
    "street": "BOULEVARD",
    "lat": 24.58238029442522,
    "lng": 54.47207051589725,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "47",
    "street": "BOULEVARD",
    "lat": 24.577770128282726,
    "lng": 54.467769889392116,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "49",
    "street": "BOULEVARD",
    "lat": 24.5780933369618,
    "lng": 54.46802838977508,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "51",
    "street": "BOULEVARD",
    "lat": 24.577831,
    "lng": 54.469114,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "53",
    "street": "BOULEVARD",
    "lat": 24.578012,
    "lng": 54.469257,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "55",
    "street": "BOULEVARD",
    "lat": 24.578184,
    "lng": 54.469383,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "57",
    "street": "11",
    "lat": 24.57556350370452,
    "lng": 54.469421320854565,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "57",
    "street": "BOULEVARD",
    "lat": 24.578348,
    "lng": 54.469518,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "58",
    "street": "11",
    "lat": 24.575846109067754,
    "lng": 54.46956314882349,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "59",
    "street": "11",
    "lat": 24.575681884836513,
    "lng": 54.46964268249888,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "59",
    "street": "BOULEVARD",
    "lat": 24.578504,
    "lng": 54.469689,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "60",
    "street": "11",
    "lat": 24.575969573653335,
    "lng": 54.46978414323131,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "61",
    "street": "11",
    "lat": 24.57580256561081,
    "lng": 54.46986378709124,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "61",
    "street": "BOULEVARD",
    "lat": 24.578685,
    "lng": 54.469823,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "62",
    "street": "11",
    "lat": 24.576095185440646,
    "lng": 54.47000488940656,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "63",
    "street": "11",
    "lat": 24.575925184520326,
    "lng": 54.470084602552554,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "63",
    "street": "BOULEVARD",
    "lat": 24.578841,
    "lng": 54.470012,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "65",
    "street": "BOULEVARD",
    "lat": 24.57903,
    "lng": 54.470165,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "67",
    "street": "BOULEVARD",
    "lat": 24.579211,
    "lng": 54.470344,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "69",
    "street": "BOULEVARD",
    "lat": 24.5794,
    "lng": 54.470479,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "71",
    "street": "BOULEVARD",
    "lat": 24.579581,
    "lng": 54.470641,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "73",
    "street": "BOULEVARD",
    "lat": 24.579737,
    "lng": 54.470785,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "40",
    "street": "BOULEVARD",
    "lat": 24.576615,
    "lng": 54.466886,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "41",
    "street": "BOULEVARD",
    "lat": 24.576779,
    "lng": 54.467057,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "42",
    "street": "BOULEVARD",
    "lat": 24.576968,
    "lng": 54.467236,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "43",
    "street": "BOULEVARD",
    "lat": 24.577157,
    "lng": 54.467398,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "44",
    "street": "BOULEVARD",
    "lat": 24.57733,
    "lng": 54.46756,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "45",
    "street": "BOULEVARD",
    "lat": 24.577502,
    "lng": 54.467712,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "46",
    "street": "BOULEVARD",
    "lat": 24.577699,
    "lng": 54.46782,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "48",
    "street": "BOULEVARD",
    "lat": 24.577855,
    "lng": 54.467964,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "50",
    "street": "BOULEVARD",
    "lat": 24.578337055159697,
    "lng": 54.46814936034404,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "52",
    "street": "BOULEVARD",
    "lat": 24.578365,
    "lng": 54.468359,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "54",
    "street": "BOULEVARD",
    "lat": 24.578841,
    "lng": 54.468799,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "56",
    "street": "BOULEVARD",
    "lat": 24.57917,
    "lng": 54.469024,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "58",
    "street": "BOULEVARD",
    "lat": 24.5794,
    "lng": 54.469293,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "60",
    "street": "BOULEVARD",
    "lat": 24.579622,
    "lng": 54.469527,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "62",
    "street": "BOULEVARD",
    "lat": 24.579819,
    "lng": 54.469662,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "64",
    "street": "BOULEVARD",
    "lat": 24.580024,
    "lng": 54.469805,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "66",
    "street": "BOULEVARD",
    "lat": 24.580205,
    "lng": 54.469958,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "47 & 49",
    "street": "11",
    "lat": 24.57506821750598,
    "lng": 54.46842244535913,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "11",
    "lat": 24.570117,
    "lng": 54.464568,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "11",
    "lat": 24.569764,
    "lng": 54.465853,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "11",
    "lat": 24.570183,
    "lng": 54.46588,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "11",
    "lat": 24.57038,
    "lng": 54.465889,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "11",
    "lat": 24.570577,
    "lng": 54.465898,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "11",
    "lat": 24.570766,
    "lng": 54.465898,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "11",
    "lat": 24.571078,
    "lng": 54.465916,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "11",
    "lat": 24.571283,
    "lng": 54.465997,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "25",
    "street": "11",
    "lat": 24.571472,
    "lng": 54.46605,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "27",
    "street": "11",
    "lat": 24.571661,
    "lng": 54.466104,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "29",
    "street": "11",
    "lat": 24.574319621494297,
    "lng": 54.46640698824908,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "30",
    "street": "11",
    "lat": 24.574539694841175,
    "lng": 54.46655487159904,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "31",
    "street": "11",
    "lat": 24.57438603461795,
    "lng": 54.466632428265946,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "32",
    "street": "11",
    "lat": 24.574609329447096,
    "lng": 54.46678004874558,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "33",
    "street": "11",
    "lat": 24.574456478130717,
    "lng": 54.46685749029412,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "35",
    "street": "11",
    "lat": 24.574531070547657,
    "lng": 54.467082154771596,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "37",
    "street": "11",
    "lat": 24.574609902469263,
    "lng": 54.467306419017135,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "39",
    "street": "11",
    "lat": 24.57469303124583,
    "lng": 54.46753029461886,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "41",
    "street": "11",
    "lat": 24.574780475675798,
    "lng": 54.467753804140436,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "43",
    "street": "11",
    "lat": 24.574872211126813,
    "lng": 54.46797697732762,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "45",
    "street": "11",
    "lat": 24.574968165621772,
    "lng": 54.46819984706176,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "51",
    "street": "11",
    "lat": 24.57522558960785,
    "lng": 54.468755892089206,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "BOULEVARD",
    "lat": 24.572171,
    "lng": 54.463104,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "BOULEVARD",
    "lat": 24.572401,
    "lng": 54.463266,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "12",
    "lat": 24.571136,
    "lng": 54.462188,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "BOULEVARD",
    "lat": 24.572622,
    "lng": 54.463427,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "12",
    "lat": 24.571324,
    "lng": 54.462322,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "12",
    "lat": 24.571464,
    "lng": 54.462466,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "BOULEVARD",
    "lat": 24.572959,
    "lng": 54.463481,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "12",
    "lat": 24.571653,
    "lng": 54.462592,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "12",
    "lat": 24.571809,
    "lng": 54.462718,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "BOULEVARD",
    "lat": 24.573115,
    "lng": 54.463589,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "BOULEVARD",
    "lat": 24.57328,
    "lng": 54.463697,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "BOULEVARD",
    "lat": 24.573452,
    "lng": 54.463823,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "BOULEVARD",
    "lat": 24.5736,
    "lng": 54.463921,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "BOULEVARD",
    "lat": 24.573797,
    "lng": 54.464011,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "BOULEVARD",
    "lat": 24.574068,
    "lng": 54.464191,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "BOULEVARD",
    "lat": 24.574224,
    "lng": 54.464308,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "BOULEVARD",
    "lat": 24.574381,
    "lng": 54.464433,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "BOULEVARD",
    "lat": 24.574553,
    "lng": 54.464568,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "BOULEVARD",
    "lat": 24.574693,
    "lng": 54.464721,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "BOULEVARD",
    "lat": 24.574841,
    "lng": 54.464856,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "26",
    "street": "BOULEVARD",
    "lat": 24.574972,
    "lng": 54.46499,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "28",
    "street": "BOULEVARD",
    "lat": 24.575112,
    "lng": 54.465134,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "30",
    "street": "BOULEVARD",
    "lat": 24.575268,
    "lng": 54.465269,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "32",
    "street": "BOULEVARD",
    "lat": 24.575399,
    "lng": 54.465413,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "34",
    "street": "BOULEVARD",
    "lat": 24.575596,
    "lng": 54.465601,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "35",
    "street": "BOULEVARD",
    "lat": 24.575752,
    "lng": 54.465745,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "36",
    "street": "BOULEVARD",
    "lat": 24.575859,
    "lng": 54.465952,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "37",
    "street": "BOULEVARD",
    "lat": 24.576007,
    "lng": 54.46614,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "38",
    "street": "BOULEVARD",
    "lat": 24.576147,
    "lng": 54.466338,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "39",
    "street": "BOULEVARD",
    "lat": 24.57627,
    "lng": 54.4665,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "34",
    "street": "11",
    "lat": 24.57468328553898,
    "lng": 54.46700475651857,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "36",
    "street": "11",
    "lat": 24.574761684111937,
    "lng": 54.46722899344769,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "38",
    "street": "11",
    "lat": 24.57484461151057,
    "lng": 54.467452775894614,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "40",
    "street": "11",
    "lat": 24.574932113279193,
    "lng": 54.46767613447569,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "42",
    "street": "11",
    "lat": 24.57502418812029,
    "lng": 54.467899109767124,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "44",
    "street": "11",
    "lat": 24.57512078256856,
    "lng": 54.468121747537566,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "46",
    "street": "11",
    "lat": 24.575221787190316,
    "lng": 54.46834409384035,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "48",
    "street": "11",
    "lat": 24.575327035165653,
    "lng": 54.468566190365124,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "50",
    "street": "11",
    "lat": 24.575381182926556,
    "lng": 54.46867715579834,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "52",
    "street": "11",
    "lat": 24.57549236252934,
    "lng": 54.468898936759956,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "53",
    "street": "11",
    "lat": 24.575335031755976,
    "lng": 54.46897791531629,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "54",
    "street": "11",
    "lat": 24.57560713654563,
    "lng": 54.46912052966339,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "55",
    "street": "11",
    "lat": 24.575447773984234,
    "lng": 54.46919972665083,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "56",
    "street": "11",
    "lat": 24.57572517186192,
    "lng": 54.4693419370954,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "BOULEVARD",
    "lat": 24.57383,
    "lng": 54.464981,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "BOULEVARD",
    "lat": 24.574027,
    "lng": 54.465125,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "BOULEVARD",
    "lat": 24.5742,
    "lng": 54.465287,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "25",
    "street": "BOULEVARD",
    "lat": 24.5777117802995,
    "lng": 54.46548776831231,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "27",
    "street": "BOULEVARD",
    "lat": 24.574545,
    "lng": 54.465619,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "29",
    "street": "BOULEVARD",
    "lat": 24.574726,
    "lng": 54.465808,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "31",
    "street": "BOULEVARD",
    "lat": 24.574882,
    "lng": 54.466006,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "33",
    "street": "BOULEVARD",
    "lat": 24.575021,
    "lng": 54.466203,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "13",
    "lat": 24.572836,
    "lng": 54.464299,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "13",
    "lat": 24.573354,
    "lng": 54.464532,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "13",
    "lat": 24.57268,
    "lng": 54.46446,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "13",
    "lat": 24.573288,
    "lng": 54.464748,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "13",
    "lat": 24.572606,
    "lng": 54.464649,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "13",
    "lat": 24.573222,
    "lng": 54.464937,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "13",
    "lat": 24.572532,
    "lng": 54.464838,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "13",
    "lat": 24.57314,
    "lng": 54.465125,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "13",
    "lat": 24.57245,
    "lng": 54.465251,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "13",
    "lat": 24.57291,
    "lng": 54.465467,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "13",
    "lat": 24.57236,
    "lng": 54.465476,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "13",
    "lat": 24.57282,
    "lng": 54.465691,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "13",
    "lat": 24.572269,
    "lng": 54.465691,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "13",
    "lat": 24.572729,
    "lng": 54.465916,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "BOULEVARD",
    "lat": 24.571316,
    "lng": 54.464047,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "BOULEVARD",
    "lat": 24.571505,
    "lng": 54.464101,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "BOULEVARD",
    "lat": 24.571694,
    "lng": 54.464155,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "BOULEVARD",
    "lat": 24.571867,
    "lng": 54.4642,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "BOULEVARD",
    "lat": 24.572056,
    "lng": 54.464254,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "BOULEVARD",
    "lat": 24.572269,
    "lng": 54.464308,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "11",
    "lat": 24.571218,
    "lng": 54.465125,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "11",
    "lat": 24.571398,
    "lng": 54.465179,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "11",
    "lat": 24.571587,
    "lng": 54.465233,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "26",
    "street": "11",
    "lat": 24.571768,
    "lng": 54.465278,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "28",
    "street": "11",
    "lat": 24.571965,
    "lng": 54.465341,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "11",
    "lat": 24.571004,
    "lng": 54.463814,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "11",
    "lat": 24.570922,
    "lng": 54.464029,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "11",
    "lat": 24.570166,
    "lng": 54.464362,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "11",
    "lat": 24.570823,
    "lng": 54.46438,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "11",
    "lat": 24.570766,
    "lng": 54.464622,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "11",
    "lat": 24.570109,
    "lng": 54.464757,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "11",
    "lat": 24.570832,
    "lng": 54.464856,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "11",
    "lat": 24.570068,
    "lng": 54.464963,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "11",
    "lat": 24.570791,
    "lng": 54.465062,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "11",
    "lat": 24.570026,
    "lng": 54.46517,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "11",
    "lat": 24.574077512239207,
    "lng": 54.464517957358765,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "11",
    "lat": 24.57391382186335,
    "lng": 54.464598398887496,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "11",
    "lat": 24.569977,
    "lng": 54.46588,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "12",
    "lat": 24.570717,
    "lng": 54.463014,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "12",
    "lat": 24.571398,
    "lng": 54.463275,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "12",
    "lat": 24.57084,
    "lng": 54.462843,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "12",
    "lat": 24.571497,
    "lng": 54.463104,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "12",
    "lat": 24.570963,
    "lng": 54.462682,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "9",
    "lat": 24.568622,
    "lng": 54.465026,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "9",
    "lat": 24.568794,
    "lng": 54.465125,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "9",
    "lat": 24.568967,
    "lng": 54.465269,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "1",
    "lat": 24.565335,
    "lng": 54.461819,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "3",
    "lat": 24.566494,
    "lng": 54.462861,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "9",
    "lat": 24.56909,
    "lng": 54.465431,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "1",
    "lat": 24.565582,
    "lng": 54.462143,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "3",
    "lat": 24.565976,
    "lng": 54.462808,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "7",
    "lat": 24.567726,
    "lng": 54.464335,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "3",
    "lat": 24.566075,
    "lng": 54.462996,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "7",
    "lat": 24.567652,
    "lng": 54.464784,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "25",
    "street": "3",
    "lat": 24.566157,
    "lng": 54.463176,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "25",
    "street": "7",
    "lat": 24.567849,
    "lng": 54.464811,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "26",
    "street": "3",
    "lat": 24.566247,
    "lng": 54.463364,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "26",
    "street": "7",
    "lat": 24.56803,
    "lng": 54.464847,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "27",
    "street": "7",
    "lat": 24.568227,
    "lng": 54.464874,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "5",
    "lat": 24.567759,
    "lng": 54.461721,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "5",
    "lat": 24.568088,
    "lng": 54.46208,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "5",
    "lat": 24.567652,
    "lng": 54.461873,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "5",
    "lat": 24.567981,
    "lng": 54.462233,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "5",
    "lat": 24.567545,
    "lng": 54.462008,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "5",
    "lat": 24.567882,
    "lng": 54.462367,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "5",
    "lat": 24.567463,
    "lng": 54.462152,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "5",
    "lat": 24.567775,
    "lng": 54.462502,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "5",
    "lat": 24.567365,
    "lng": 54.462286,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "5",
    "lat": 24.567539671761892,
    "lng": 54.46182867408356,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "5",
    "lat": 24.567217,
    "lng": 54.462538,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "5",
    "lat": 24.567529,
    "lng": 54.462969,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "5",
    "lat": 24.567143,
    "lng": 54.462709,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "5",
    "lat": 24.567463,
    "lng": 54.463113,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "5",
    "lat": 24.567077,
    "lng": 54.462861,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "5",
    "lat": 24.567389,
    "lng": 54.463275,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "5",
    "lat": 24.567003,
    "lng": 54.463032,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "5",
    "lat": 24.567324,
    "lng": 54.463445,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "5",
    "lat": 24.566937,
    "lng": 54.463185,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "5",
    "lat": 24.567258,
    "lng": 54.463598,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "5",
    "lat": 24.566864,
    "lng": 54.463338,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "5",
    "lat": 24.567192,
    "lng": 54.463751,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "5",
    "lat": 24.56679,
    "lng": 54.463517,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "5",
    "lat": 24.567126,
    "lng": 54.463939,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "25",
    "street": "5",
    "lat": 24.566543,
    "lng": 54.463877,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "26",
    "street": "5",
    "lat": 24.566666,
    "lng": 54.464065,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "27",
    "street": "5",
    "lat": 24.566773,
    "lng": 54.464227,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "28",
    "street": "5",
    "lat": 24.566888,
    "lng": 54.464407,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "7",
    "lat": 24.568564,
    "lng": 54.462529,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "7",
    "lat": 24.568942,
    "lng": 54.462852,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "7",
    "lat": 24.568515,
    "lng": 54.4627,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "7",
    "lat": 24.56886,
    "lng": 54.463023,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "7",
    "lat": 24.568433,
    "lng": 54.462852,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "7",
    "lat": 24.568778,
    "lng": 54.463194,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "7",
    "lat": 24.568367,
    "lng": 54.463014,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "7",
    "lat": 24.568696,
    "lng": 54.463347,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "7",
    "lat": 24.568293,
    "lng": 54.463167,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "7",
    "lat": 24.56863,
    "lng": 54.46349,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "7",
    "lat": 24.568219,
    "lng": 54.46332,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "7",
    "lat": 24.568523,
    "lng": 54.463751,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "7",
    "lat": 24.568112,
    "lng": 54.463544,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "7",
    "lat": 24.568449,
    "lng": 54.463912,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "7",
    "lat": 24.568038,
    "lng": 54.463697,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "7",
    "lat": 24.568367,
    "lng": 54.464074,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "7",
    "lat": 24.567956,
    "lng": 54.463859,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "7",
    "lat": 24.568293,
    "lng": 54.464218,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "7",
    "lat": 24.567882,
    "lng": 54.46402,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "7",
    "lat": 24.568219,
    "lng": 54.464407,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "7",
    "lat": 24.567808,
    "lng": 54.464164,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "7",
    "lat": 24.568522656735187,
    "lng": 54.464308573487706,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "9",
    "lat": 24.569435,
    "lng": 54.463158,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "9",
    "lat": 24.569838,
    "lng": 54.463382,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "9",
    "lat": 24.569353,
    "lng": 54.463329,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "9",
    "lat": 24.569755,
    "lng": 54.463571,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "9",
    "lat": 24.569271,
    "lng": 54.463499,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "9",
    "lat": 24.569681,
    "lng": 54.463733,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "9",
    "lat": 24.569213,
    "lng": 54.463643,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "9",
    "lat": 24.569599,
    "lng": 54.463877,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "9",
    "lat": 24.569139,
    "lng": 54.463805,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "9",
    "lat": 24.569534,
    "lng": 54.464029,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "9",
    "lat": 24.569016,
    "lng": 54.464128,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "9",
    "lat": 24.569394,
    "lng": 54.464362,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "9",
    "lat": 24.568942,
    "lng": 54.464308,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "9",
    "lat": 24.569336,
    "lng": 54.46455,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "9",
    "lat": 24.568876,
    "lng": 54.464478,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "9",
    "lat": 24.569279,
    "lng": 54.464712,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "9",
    "lat": 24.568827,
    "lng": 54.46464,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "9",
    "lat": 24.569221,
    "lng": 54.464883,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "2",
    "lat": 24.567973,
    "lng": 54.457966,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "2",
    "lat": 24.568153,
    "lng": 54.458082,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "2",
    "lat": 24.568293,
    "lng": 54.458199,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "4",
    "lat": 24.568778,
    "lng": 54.458657,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "10",
    "lat": 24.571012,
    "lng": 54.460804,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "25",
    "street": "2",
    "lat": 24.568441,
    "lng": 54.458343,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "25",
    "street": "4",
    "lat": 24.568917,
    "lng": 54.458819,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "25",
    "street": "6",
    "lat": 24.569328412829506,
    "lng": 54.46035062573273,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "25",
    "street": "8",
    "lat": 24.570257,
    "lng": 54.46022,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "25",
    "street": "10",
    "lat": 24.57116,
    "lng": 54.460939,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "26",
    "street": "4",
    "lat": 24.569041,
    "lng": 54.459008,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "26",
    "street": "6",
    "lat": 24.569673,
    "lng": 54.459583,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "26",
    "street": "8",
    "lat": 24.57056,
    "lng": 54.460472,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "26",
    "street": "10",
    "lat": 24.571308,
    "lng": 54.461065,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "27",
    "street": "6",
    "lat": 24.569821,
    "lng": 54.459726,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "27",
    "street": "10",
    "lat": 24.571456,
    "lng": 54.461209,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "28",
    "street": "6",
    "lat": 24.569961,
    "lng": 54.459852,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "10",
    "lat": 24.569624,
    "lng": 54.462781,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "10",
    "lat": 24.570043,
    "lng": 54.462996,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "10",
    "lat": 24.569723,
    "lng": 54.462619,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "10",
    "lat": 24.570142,
    "lng": 54.462825,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "10",
    "lat": 24.569821,
    "lng": 54.462466,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "10",
    "lat": 24.570248,
    "lng": 54.462682,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "10",
    "lat": 24.56992,
    "lng": 54.462349,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "10",
    "lat": 24.570339,
    "lng": 54.462547,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "10",
    "lat": 24.570018,
    "lng": 54.462215,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "10",
    "lat": 24.570437,
    "lng": 54.462412,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "10",
    "lat": 24.570125,
    "lng": 54.46208,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "10",
    "lat": 24.570618,
    "lng": 54.462179,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "10",
    "lat": 24.570273,
    "lng": 54.461873,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "10",
    "lat": 24.570717,
    "lng": 54.462053,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "10",
    "lat": 24.57038,
    "lng": 54.461739,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "10",
    "lat": 24.570832,
    "lng": 54.461927,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "10",
    "lat": 24.570487,
    "lng": 54.461604,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "10",
    "lat": 24.570947,
    "lng": 54.461783,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "10",
    "lat": 24.570593,
    "lng": 54.461469,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "10",
    "lat": 24.571045,
    "lng": 54.461649,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "10",
    "lat": 24.570684,
    "lng": 54.461325,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "10",
    "lat": 24.571152,
    "lng": 54.461505,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "10",
    "lat": 24.570807,
    "lng": 54.461182,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "8",
    "lat": 24.569172,
    "lng": 54.462448,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "8",
    "lat": 24.568802,
    "lng": 54.462161,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "8",
    "lat": 24.569287,
    "lng": 54.462304,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "8",
    "lat": 24.568917,
    "lng": 54.462008,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "8",
    "lat": 24.569386,
    "lng": 54.46217,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "8",
    "lat": 24.569016,
    "lng": 54.461882,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "8",
    "lat": 24.569492,
    "lng": 54.462035,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "8",
    "lat": 24.569123,
    "lng": 54.461748,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "8",
    "lat": 24.569591,
    "lng": 54.461909,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "8",
    "lat": 24.569221,
    "lng": 54.461622,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "8",
    "lat": 24.569698,
    "lng": 54.461774,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "8",
    "lat": 24.56932,
    "lng": 54.461496,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "8",
    "lat": 24.569887,
    "lng": 54.461532,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "8",
    "lat": 24.569525,
    "lng": 54.461226,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "8",
    "lat": 24.569994,
    "lng": 54.461379,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "8",
    "lat": 24.569649,
    "lng": 54.461083,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "8",
    "lat": 24.570084,
    "lng": 54.461244,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "8",
    "lat": 24.570042978312802,
    "lng": 54.461087876877194,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "8",
    "lat": 24.570183,
    "lng": 54.46111,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "8",
    "lat": 24.569829,
    "lng": 54.460813,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "8",
    "lat": 24.570281,
    "lng": 54.460966,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "8",
    "lat": 24.569928,
    "lng": 54.46067,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "8",
    "lat": 24.570396,
    "lng": 54.460813,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "8",
    "lat": 24.570043,
    "lng": 54.460508,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "6",
    "lat": 24.568375,
    "lng": 54.461739,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "6",
    "lat": 24.568047,
    "lng": 54.461388,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "6",
    "lat": 24.568498,
    "lng": 54.461604,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "6",
    "lat": 24.568162,
    "lng": 54.461253,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "6",
    "lat": 24.568605,
    "lng": 54.461478,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "6",
    "lat": 24.568277,
    "lng": 54.461137,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "6",
    "lat": 24.568704,
    "lng": 54.461343,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "6",
    "lat": 24.568375,
    "lng": 54.461011,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "6",
    "lat": 24.568811,
    "lng": 54.461217,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "6",
    "lat": 24.568482,
    "lng": 54.460894,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "6",
    "lat": 24.568926,
    "lng": 54.461092,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "6",
    "lat": 24.568605,
    "lng": 54.46075,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "6",
    "lat": 24.569123,
    "lng": 54.460831,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "6",
    "lat": 24.568794,
    "lng": 54.46049,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "6",
    "lat": 24.569221,
    "lng": 54.460696,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "6",
    "lat": 24.568893,
    "lng": 54.460373,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "6",
    "lat": 24.569328,
    "lng": 54.460553,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "6",
    "lat": 24.568991,
    "lng": 54.46022,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "6",
    "lat": 24.569427,
    "lng": 54.460418,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "6",
    "lat": 24.56909,
    "lng": 54.460086,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "6",
    "lat": 24.569525,
    "lng": 54.460283,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "6",
    "lat": 24.569197,
    "lng": 54.459942,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "6",
    "lat": 24.56964,
    "lng": 54.460131,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "6",
    "lat": 24.569304,
    "lng": 54.459789,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "4",
    "lat": 24.567702,
    "lng": 54.460975,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "4",
    "lat": 24.567414,
    "lng": 54.460571,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "4",
    "lat": 24.567817,
    "lng": 54.46084,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "4",
    "lat": 24.567537,
    "lng": 54.460427,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "4",
    "lat": 24.567923,
    "lng": 54.460714,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "4",
    "lat": 24.567652,
    "lng": 54.460301,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "4",
    "lat": 24.568022,
    "lng": 54.46058,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "4",
    "lat": 24.567759,
    "lng": 54.460184,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "4",
    "lat": 24.568129,
    "lng": 54.460463,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "4",
    "lat": 24.567866,
    "lng": 54.460059,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "4",
    "lat": 24.568244,
    "lng": 54.460328,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "4",
    "lat": 24.568079,
    "lng": 54.45978,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "4",
    "lat": 24.568408,
    "lng": 54.460113,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "4",
    "lat": 24.568162,
    "lng": 54.459645,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "4",
    "lat": 24.568507,
    "lng": 54.459969,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "4",
    "lat": 24.568252,
    "lng": 54.459502,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "4",
    "lat": 24.568597,
    "lng": 54.459825,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "4",
    "lat": 24.568359,
    "lng": 54.45934,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "4",
    "lat": 24.568718273784402,
    "lng": 54.459660527254286,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "4",
    "lat": 24.568441,
    "lng": 54.459196,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "4",
    "lat": 24.568786,
    "lng": 54.459529,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "4",
    "lat": 24.568548,
    "lng": 54.459053,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "4",
    "lat": 24.568885,
    "lng": 54.459376,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "2",
    "lat": 24.567126,
    "lng": 54.460122,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "2",
    "lat": 24.566872,
    "lng": 54.459663,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "2",
    "lat": 24.567233,
    "lng": 54.459978,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "2",
    "lat": 24.566987,
    "lng": 54.459538,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "2",
    "lat": 24.56734,
    "lng": 54.459843,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "2",
    "lat": 24.567085,
    "lng": 54.459412,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "2",
    "lat": 24.567439,
    "lng": 54.459717,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "2",
    "lat": 24.5672,
    "lng": 54.459268,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "2",
    "lat": 24.567545,
    "lng": 54.459574,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "2",
    "lat": 24.567324,
    "lng": 54.459071,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "2",
    "lat": 24.567677,
    "lng": 54.459376,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "2",
    "lat": 24.567414,
    "lng": 54.458918,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "2",
    "lat": 24.567775,
    "lng": 54.459214,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "2",
    "lat": 24.567513,
    "lng": 54.458774,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "2",
    "lat": 24.567874,
    "lng": 54.459071,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "2",
    "lat": 24.567611,
    "lng": 54.458639,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "2",
    "lat": 24.567964,
    "lng": 54.458936,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "2",
    "lat": 24.56771,
    "lng": 54.458487,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "2",
    "lat": 24.568063,
    "lng": 54.458792,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "2",
    "lat": 24.567808,
    "lng": 54.458334,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "2",
    "lat": 24.568162,
    "lng": 54.458648,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "1",
    "lat": 24.566551,
    "lng": 54.459987,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "1",
    "lat": 24.566822,
    "lng": 54.460436,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "1",
    "lat": 24.566586323459934,
    "lng": 54.46030048977219,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "1",
    "lat": 24.566566728535236,
    "lng": 54.460472100473616,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "1",
    "lat": 24.566470807625382,
    "lng": 54.4604703811548,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "1",
    "lat": 24.566451212700684,
    "lng": 54.46064199185623,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "1",
    "lat": 24.56635529179083,
    "lng": 54.46064027253741,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "1",
    "lat": 24.566335696866137,
    "lng": 54.46081188323883,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "1",
    "lat": 24.566239775956284,
    "lng": 54.460810163920016,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "1",
    "lat": 24.566220181031586,
    "lng": 54.460981774621445,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "1",
    "lat": 24.566124260121732,
    "lng": 54.46098005530263,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "1",
    "lat": 24.566157,
    "lng": 54.4612,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "1",
    "lat": 24.565853,
    "lng": 54.460849,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "1",
    "lat": 24.565989149362487,
    "lng": 54.46132155738666,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "1",
    "lat": 24.565893228452634,
    "lng": 54.461319838067844,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "1",
    "lat": 24.56587363352794,
    "lng": 54.46149144876927,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "1",
    "lat": 24.565777712618086,
    "lng": 54.461489729450456,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "1",
    "lat": 24.565758117693388,
    "lng": 54.46166134015188,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "1",
    "lat": 24.565662196783535,
    "lng": 54.46165962083306,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "1",
    "lat": 24.56564260185884,
    "lng": 54.46183123153449,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "1",
    "lat": 24.565546680948987,
    "lng": 54.46182951221567,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "3",
    "lat": 24.567118,
    "lng": 54.460894,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "3",
    "lat": 24.567398,
    "lng": 54.461298,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "3",
    "lat": 24.566987,
    "lng": 54.461038,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "3",
    "lat": 24.567283,
    "lng": 54.461424,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "3",
    "lat": 24.56688,
    "lng": 54.461173,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "3",
    "lat": 24.567176,
    "lng": 54.461559,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "3",
    "lat": 24.566781,
    "lng": 54.461298,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "3",
    "lat": 24.567069,
    "lng": 54.461676,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "3",
    "lat": 24.566666,
    "lng": 54.461451,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "3",
    "lat": 24.566979,
    "lng": 54.461828,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "3",
    "lat": 24.566576,
    "lng": 54.461595,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "3",
    "lat": 24.566847,
    "lng": 54.462062,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "3",
    "lat": 24.566436,
    "lng": 54.461846,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "3",
    "lat": 24.566841233089395,
    "lng": 54.46228860957185,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "3",
    "lat": 24.566362,
    "lng": 54.46199,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "3",
    "lat": 24.566707,
    "lng": 54.462349,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "3",
    "lat": 24.566288,
    "lng": 54.462143,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "3",
    "lat": 24.566625,
    "lng": 54.462529,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "3",
    "lat": 24.566215,
    "lng": 54.462322,
    "positionSource": "user_supplied_coordinate",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "3",
    "lat": 24.56656,
    "lng": 54.462673,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "3",
    "lat": 24.56613753958517,
    "lng": 54.46251160931464,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "7",
    "lat": 24.568696,
    "lng": 54.463347,
    "positionSource": "yandex_exact_address_match",
    "controlPlot": null
  }
];

export function findHiddCoord(villaNumber: string, street: string): HiddVillaCoord | undefined {
  return hiddVillaCoords.find(c => c.villaNumber === villaNumber && c.street === street);
}

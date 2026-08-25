/**
 * Hidd Al Saadiyat villa coordinates.
 * Direct controls are user-supplied sources; other coordinates are derived from the preserved street/master-plan shape and those controls.
 */

export type HiddPositionSource = "user_supplied_coordinate" | "street_control_calibrated" | "shape_control_calibrated";

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
    "lat": 24.583741744734866,
    "lng": 54.47341178869825,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "102",
    "street": "BOULEVARD",
    "lat": 24.583668155398602,
    "lng": 54.473631994813005,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.58573750212386,
    "lng": 54.474942653247524,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "120",
    "street": "BOULEVARD",
    "lat": 24.585700820192244,
    "lng": 54.47460067587635,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "121",
    "street": "BOULEVARD",
    "lat": 24.585300612520168,
    "lng": 54.4743597809262,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.582388853013597,
    "lng": 54.47217841916734,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "91",
    "street": "BOULEVARD",
    "lat": 24.582720622210186,
    "lng": 54.47239753982779,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "93",
    "street": "BOULEVARD",
    "lat": 24.583039807481622,
    "lng": 54.472620649114354,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "95",
    "street": "BOULEVARD",
    "lat": 24.58330676836179,
    "lng": 54.47284616022542,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "97",
    "street": "BOULEVARD",
    "lat": 24.583494320084135,
    "lng": 54.473072481746975,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "99",
    "street": "BOULEVARD",
    "lat": 24.583586815651802,
    "lng": 54.473297988545184,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "101",
    "street": "BOULEVARD",
    "lat": 24.583578445937633,
    "lng": 54.473520608906846,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "103",
    "street": "BOULEVARD",
    "lat": 24.583480680162808,
    "lng": 54.47373728942354,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "104",
    "street": "BOULEVARD",
    "lat": 24.583512655763034,
    "lng": 54.473843541248435,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.583039620325437,
    "lng": 54.47250896426015,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "94",
    "street": "BOULEVARD",
    "lat": 24.583339472490803,
    "lng": 54.472733875984254,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "96",
    "street": "BOULEVARD",
    "lat": 24.58356962444939,
    "lng": 54.47296042995039,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "98",
    "street": "BOULEVARD",
    "lat": 24.58370792286315,
    "lng": 54.4731870164751,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "75",
    "street": "BOULEVARD",
    "lat": 24.581601234096144,
    "lng": 54.47074418481622,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.581735309559303,
    "lng": 54.47155261009838,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "85",
    "street": "BOULEVARD",
    "lat": 24.581867127788335,
    "lng": 54.47175620492673,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "87",
    "street": "BOULEVARD",
    "lat": 24.582091012868204,
    "lng": 54.47196452233084,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.583644966738607,
    "lng": 54.47425863567147,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "109",
    "street": "BOULEVARD",
    "lat": 24.583919385982366,
    "lng": 54.47439285268669,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "110",
    "street": "BOULEVARD",
    "lat": 24.58442623079264,
    "lng": 54.47454942782574,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "111",
    "street": "BOULEVARD",
    "lat": 24.584720562535615,
    "lng": 54.474721562823085,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "112",
    "street": "BOULEVARD",
    "lat": 24.585247937732976,
    "lng": 54.47495928383798,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "113",
    "street": "BOULEVARD",
    "lat": 24.58532002787145,
    "lng": 54.475135719227794,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "114",
    "street": "BOULEVARD",
    "lat": 24.585685034067033,
    "lng": 54.4755097898645,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "115",
    "street": "BOULEVARD",
    "lat": 24.585579486006843,
    "lng": 54.47556197699489,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.58079634305453,
    "lng": 54.46999802327213,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "70",
    "street": "BOULEVARD",
    "lat": 24.58119910155248,
    "lng": 54.47021487717456,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "72",
    "street": "BOULEVARD",
    "lat": 24.581506012080016,
    "lng": 54.47042953652592,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "74",
    "street": "BOULEVARD",
    "lat": 24.58170529515263,
    "lng": 54.47064072585713,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "76",
    "street": "BOULEVARD",
    "lat": 24.581805162901258,
    "lng": 54.470847881078065,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "78",
    "street": "BOULEVARD",
    "lat": 24.581832874712738,
    "lng": 54.47105126274458,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.581849858749692,
    "lng": 54.47145201447319,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "84",
    "street": "BOULEVARD",
    "lat": 24.581935174680172,
    "lng": 54.47165371164432,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.578192866199725,
    "lng": 54.46825214992854,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "53",
    "street": "BOULEVARD",
    "lat": 24.578210147595826,
    "lng": 54.468454331718874,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "55",
    "street": "BOULEVARD",
    "lat": 24.578261161638803,
    "lng": 54.468649106065556,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.578402838646074,
    "lng": 54.46884442676255,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.578653811647158,
    "lng": 54.469043843020785,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.579009054669363,
    "lng": 54.46924856431176,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.579445759958613,
    "lng": 54.4694584667626,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "65",
    "street": "BOULEVARD",
    "lat": 24.579927181274265,
    "lng": 54.4696725257331,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "67",
    "street": "BOULEVARD",
    "lat": 24.580408404188212,
    "lng": 54.46988909847993,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "69",
    "street": "BOULEVARD",
    "lat": 24.580844523581693,
    "lng": 54.47010623784461,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "71",
    "street": "BOULEVARD",
    "lat": 24.581199337727174,
    "lng": 54.47032204571223,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "73",
    "street": "BOULEVARD",
    "lat": 24.581452133485737,
    "lng": 54.470534998138135,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.57653678134785,
    "lng": 54.46699536884943,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "42",
    "street": "BOULEVARD",
    "lat": 24.576719980828052,
    "lng": 54.46709847967835,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "43",
    "street": "BOULEVARD",
    "lat": 24.576767622101723,
    "lng": 54.467224226075906,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "44",
    "street": "BOULEVARD",
    "lat": 24.577092648635528,
    "lng": 54.467346794753105,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "45",
    "street": "BOULEVARD",
    "lat": 24.577241482203835,
    "lng": 54.46748892568288,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "46",
    "street": "BOULEVARD",
    "lat": 24.57766650143696,
    "lng": 54.46762947433768,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "48",
    "street": "BOULEVARD",
    "lat": 24.57813991726989,
    "lng": 54.46790797037784,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.578378140456756,
    "lng": 54.46855459309377,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "56",
    "street": "BOULEVARD",
    "lat": 24.578464091529852,
    "lng": 54.46874783896474,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "58",
    "street": "BOULEVARD",
    "lat": 24.578657550617255,
    "lng": 54.468944202931965,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "60",
    "street": "BOULEVARD",
    "lat": 24.578963316103916,
    "lng": 54.469145793222,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "62",
    "street": "BOULEVARD",
    "lat": 24.579366224830814,
    "lng": 54.46935299337222,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "64",
    "street": "BOULEVARD",
    "lat": 24.57983517047878,
    "lng": 54.46956512643077,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "66",
    "street": "BOULEVARD",
    "lat": 24.5803275400967,
    "lng": 54.469780766955495,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.573776092215702,
    "lng": 54.46370354217275,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "11",
    "lat": 24.574116684543142,
    "lng": 54.46474381675493,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "11",
    "lat": 24.574158425249536,
    "lng": 54.46497013506939,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "11",
    "lat": 24.57399687260704,
    "lng": 54.4650499022215,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "11",
    "lat": 24.574202930506917,
    "lng": 54.46519674835647,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "11",
    "lat": 24.574042537896688,
    "lng": 54.4652761378208,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "11",
    "lat": 24.574091207146022,
    "lng": 54.46550250671104,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "11",
    "lat": 24.574143067059342,
    "lng": 54.46572888083995,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "25",
    "street": "11",
    "lat": 24.574198303455336,
    "lng": 54.46595514685609,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "27",
    "street": "11",
    "lat": 24.574257097484924,
    "lng": 54.46618120849177,
    "positionSource": "shape_control_calibrated",
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
    "lat": 24.579290182232853,
    "lng": 54.463262514246054,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "BOULEVARD",
    "lat": 24.579198909314552,
    "lng": 54.46345850999949,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "12",
    "lat": 24.571705158926363,
    "lng": 54.46261049386554,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "BOULEVARD",
    "lat": 24.579102717172656,
    "lng": 54.463654186193665,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "12",
    "lat": 24.571537228459647,
    "lng": 54.462694874513886,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "12",
    "lat": 24.571720419931264,
    "lng": 54.46282966086939,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "BOULEVARD",
    "lat": 24.579001242370712,
    "lng": 54.46384950633574,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "12",
    "lat": 24.571551867040178,
    "lng": 54.4629158674223,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "12",
    "lat": 24.571737081708207,
    "lng": 54.463050014462965,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "BOULEVARD",
    "lat": 24.578894092180377,
    "lng": 54.464044428374955,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "BOULEVARD",
    "lat": 24.578780843649255,
    "lng": 54.46423890364561,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "BOULEVARD",
    "lat": 24.57856540971933,
    "lng": 54.46433615882865,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "BOULEVARD",
    "lat": 24.578661043718004,
    "lng": 54.46443287558853,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "BOULEVARD",
    "lat": 24.57844264092296,
    "lng": 54.46452988999364,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "BOULEVARD",
    "lat": 24.57853421124618,
    "lng": 54.46462627822038,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "BOULEVARD",
    "lat": 24.578312688240068,
    "lng": 54.464723023443256,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "BOULEVARD",
    "lat": 24.57839984247194,
    "lng": 54.46481903434394,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "BOULEVARD",
    "lat": 24.578257422683205,
    "lng": 54.46501105355923,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "BOULEVARD",
    "lat": 24.57810644930785,
    "lng": 54.465202230305934,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "BOULEVARD",
    "lat": 24.57794647649986,
    "lng": 54.46539244257557,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "26",
    "street": "BOULEVARD",
    "lat": 24.577777201377398,
    "lng": 54.46558155289885,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "28",
    "street": "BOULEVARD",
    "lat": 24.577598633608712,
    "lng": 54.46576941550632,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "30",
    "street": "BOULEVARD",
    "lat": 24.57741143745297,
    "lng": 54.465955899062095,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "32",
    "street": "BOULEVARD",
    "lat": 24.57721764211699,
    "lng": 54.466140947755385,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "34",
    "street": "BOULEVARD",
    "lat": 24.57702215800362,
    "lng": 54.466324736306014,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "35",
    "street": "BOULEVARD",
    "lat": 24.576794029537677,
    "lng": 54.466418935473534,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "36",
    "street": "BOULEVARD",
    "lat": 24.576836062351013,
    "lng": 54.466508052874104,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "37",
    "street": "BOULEVARD",
    "lat": 24.576629279702313,
    "lng": 54.466603790368964,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "38",
    "street": "BOULEVARD",
    "lat": 24.57668356763311,
    "lng": 54.466693211213574,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "39",
    "street": "BOULEVARD",
    "lat": 24.576521450599365,
    "lng": 54.46679316637508,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.57817506867732,
    "lng": 54.46491547854394,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "BOULEVARD",
    "lat": 24.57802930884557,
    "lng": 54.46510716170629,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "BOULEVARD",
    "lat": 24.577874982394043,
    "lng": 54.46529796530602,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.577539644743737,
    "lng": 54.46567644141045,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "29",
    "street": "BOULEVARD",
    "lat": 24.577359030076636,
    "lng": 54.46586386312882,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "31",
    "street": "BOULEVARD",
    "lat": 24.57717142579889,
    "lng": 54.46604996225136,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "33",
    "street": "BOULEVARD",
    "lat": 24.57698043375491,
    "lng": 54.46623482263757,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "13",
    "lat": 24.57347344930067,
    "lng": 54.46452455941898,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "13",
    "lat": 24.573678247563983,
    "lng": 54.46466698390727,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "13",
    "lat": 24.57351240395583,
    "lng": 54.46474901010694,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "13",
    "lat": 24.573719114306833,
    "lng": 54.46489209531304,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "13",
    "lat": 24.57355394310377,
    "lng": 54.46497394305842,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "13",
    "lat": 24.573762665839567,
    "lng": 54.46511760425956,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "13",
    "lat": 24.573598209290623,
    "lng": 54.465199234760256,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "13",
    "lat": 24.573809059061038,
    "lng": 54.4653433809523,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "13",
    "lat": 24.573645345083673,
    "lng": 54.46542476912925,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "13",
    "lat": 24.573858452017078,
    "lng": 54.46556930445418,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "13",
    "lat": 24.573695491685264,
    "lng": 54.46565043910632,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "13",
    "lat": 24.573911001827977,
    "lng": 54.465795264864504,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "13",
    "lat": 24.573748787137124,
    "lng": 54.46587614818551,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "13",
    "lat": 24.573966862148225,
    "lng": 54.466021165260855,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "BOULEVARD",
    "lat": 24.57917597755208,
    "lng": 54.463164496848904,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "BOULEVARD",
    "lat": 24.57908722973756,
    "lng": 54.463360651733886,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "BOULEVARD",
    "lat": 24.578993762120923,
    "lng": 54.46355650555046,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "BOULEVARD",
    "lat": 24.578895231015707,
    "lng": 54.46375202473089,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "BOULEVARD",
    "lat": 24.578791265626283,
    "lng": 54.46394717075149,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "BOULEVARD",
    "lat": 24.578681467293638,
    "lng": 54.46414189922753,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "11",
    "lat": 24.574250405607884,
    "lng": 54.46542350019512,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "11",
    "lat": 24.57430106181966,
    "lng": 54.46565024578934,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "11",
    "lat": 24.57435511240586,
    "lng": 54.46587685577023,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "26",
    "street": "11",
    "lat": 24.57441276806171,
    "lng": 54.46610321941846,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "28",
    "street": "11",
    "lat": 24.57447423199667,
    "lng": 54.46632924707717,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "11",
    "lat": 24.573719003026604,
    "lng": 54.46326262163247,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "11",
    "lat": 24.57391415004183,
    "lng": 54.463401321029416,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "11",
    "lat": 24.573746679671906,
    "lng": 54.46348241882889,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "11",
    "lat": 24.573943000744915,
    "lng": 54.4636224305317,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "11",
    "lat": 24.57397362095837,
    "lng": 54.46384480093897,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "11",
    "lat": 24.5738073707791,
    "lng": 54.463925851276024,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "11",
    "lat": 24.5740061462381,
    "lng": 54.46406828438344,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "11",
    "lat": 24.573840653071812,
    "lng": 54.46414919905565,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "11",
    "lat": 24.574040723544996,
    "lng": 54.46429272424946,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "11",
    "lat": 24.57387608514167,
    "lng": 54.46437343334487,
    "positionSource": "shape_control_calibrated",
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
    "lat": 24.573954026989234,
    "lng": 54.464823939763384,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "12",
    "lat": 24.57150018794501,
    "lng": 54.46204081227365,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "12",
    "lat": 24.57167803046275,
    "lng": 54.46217707175887,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "12",
    "lat": 24.571511616576842,
    "lng": 54.462256921241384,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "12",
    "lat": 24.571691099685488,
    "lng": 54.462392837778275,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "12",
    "lat": 24.57152388489984,
    "lng": 54.462475095564045,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "9",
    "lat": 24.569444092428274,
    "lng": 54.464743297749344,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "9",
    "lat": 24.56963868671171,
    "lng": 54.4648554855917,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "9",
    "lat": 24.56946861517302,
    "lng": 54.46496297455869,
    "positionSource": "shape_control_calibrated",
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
    "lat": 24.56966480892732,
    "lng": 54.4650756747059,
    "positionSource": "shape_control_calibrated",
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
    "lat": 24.566041365076387,
    "lng": 54.46267590179246,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "7",
    "lat": 24.5683494093881,
    "lng": 54.46442460878472,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "3",
    "lat": 24.566360360545485,
    "lng": 54.463110071960976,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "7",
    "lat": 24.56854342957627,
    "lng": 54.46452299787069,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "25",
    "street": "3",
    "lat": 24.565945190567604,
    "lng": 54.46284019427028,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "25",
    "street": "7",
    "lat": 24.56837269393648,
    "lng": 54.464636680537076,
    "positionSource": "shape_control_calibrated",
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
    "lat": 24.568566758886202,
    "lng": 54.46473689318044,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "27",
    "street": "7",
    "lat": 24.56839816166884,
    "lng": 54.46484867306914,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "5",
    "lat": 24.567650973314958,
    "lng": 54.46078683274889,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "5",
    "lat": 24.567803777160826,
    "lng": 54.460721006131145,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "5",
    "lat": 24.567584416712297,
    "lng": 54.46101598753993,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "5",
    "lat": 24.567742694340655,
    "lng": 54.46099287213331,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "5",
    "lat": 24.56750969220179,
    "lng": 54.46125942400029,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "5",
    "lat": 24.56767451476291,
    "lng": 54.46127225313021,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "5",
    "lat": 24.567432788744238,
    "lng": 54.461513937607016,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "5",
    "lat": 24.567604939005705,
    "lng": 54.46155270998568,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "5",
    "lat": 24.567359981039488,
    "lng": 54.46177319392084,
    "positionSource": "shape_control_calibrated",
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
    "lat": 24.567296650519424,
    "lng": 54.46203177549347,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "5",
    "lat": 24.5674831802787,
    "lng": 54.46209650517764,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "5",
    "lat": 24.567246079482537,
    "lng": 54.46228616992632,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "5",
    "lat": 24.56743777389613,
    "lng": 54.462354183984374,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "5",
    "lat": 24.567208106592336,
    "lng": 54.46253365215868,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "5",
    "lat": 24.567403451231925,
    "lng": 54.46260061918373,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "5",
    "lat": 24.567179553888057,
    "lng": 54.462771541116105,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "5",
    "lat": 24.567379273338503,
    "lng": 54.46283546364387,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "5",
    "lat": 24.567158643586744,
    "lng": 54.46299869133633,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "5",
    "lat": 24.567365725983134,
    "lng": 54.46305878528865,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "5",
    "lat": 24.56715020033314,
    "lng": 54.46321326643139,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "5",
    "lat": 24.567364748291283,
    "lng": 54.463270857727665,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "5",
    "lat": 24.56715948623293,
    "lng": 54.4634141497863,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "5",
    "lat": 24.567376396346344,
    "lng": 54.46347362915967,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "25",
    "street": "5",
    "lat": 24.56718356037227,
    "lng": 54.463605759816765,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "26",
    "street": "5",
    "lat": 24.567397645673807,
    "lng": 54.46367088078122,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "27",
    "street": "5",
    "lat": 24.56721556456404,
    "lng": 54.46379437438259,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "28",
    "street": "5",
    "lat": 24.567424627463115,
    "lng": 54.46386628315528,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "7",
    "lat": 24.568421866446094,
    "lng": 54.46165772576722,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "7",
    "lat": 24.568585481851883,
    "lng": 54.46176747202832,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "7",
    "lat": 24.56837884571003,
    "lng": 54.461962272017225,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "7",
    "lat": 24.568549047776376,
    "lng": 54.46206403341267,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "7",
    "lat": 24.5683437704179,
    "lng": 54.46224498168375,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "7",
    "lat": 24.568519909221504,
    "lng": 54.46234095987284,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "7",
    "lat": 24.568316733805894,
    "lng": 54.46251005331232,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "7",
    "lat": 24.568497989124843,
    "lng": 54.46260213498053,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "7",
    "lat": 24.568290921945994,
    "lng": 54.46288202706185,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "7",
    "lat": 24.568478138259305,
    "lng": 54.462971197002,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "7",
    "lat": 24.568283000677184,
    "lng": 54.46311700843563,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "7",
    "lat": 24.568473021955043,
    "lng": 54.463205823333546,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "7",
    "lat": 24.568281828240462,
    "lng": 54.4633443411665,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "7",
    "lat": 24.568473775860443,
    "lng": 54.46343376943224,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "7",
    "lat": 24.568286639128438,
    "lng": 54.463566015990565,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "7",
    "lat": 24.56847976242615,
    "lng": 54.46365675504051,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "7",
    "lat": 24.56829658391303,
    "lng": 54.46378370181273,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "7",
    "lat": 24.568490315024558,
    "lng": 54.46387618685106,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "7",
    "lat": 24.568310828529853,
    "lng": 54.46399873452964,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "7",
    "lat": 24.568504798974363,
    "lng": 54.46409317726784,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "7",
    "lat": 24.568328636239823,
    "lng": 54.46421212715172,
    "positionSource": "shape_control_calibrated",
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
    "lat": 24.569364731233172,
    "lng": 54.4626714781973,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "9",
    "lat": 24.569538039476612,
    "lng": 54.46279470678969,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "9",
    "lat": 24.569359194840906,
    "lng": 54.46291804553306,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "9",
    "lat": 24.56953603397346,
    "lng": 54.46303701054644,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "9",
    "lat": 24.56935751606471,
    "lng": 54.463158458398716,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "9",
    "lat": 24.56953749020451,
    "lng": 54.46327438896495,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "9",
    "lat": 24.569359632935267,
    "lng": 54.46339377028226,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "9",
    "lat": 24.569542384458174,
    "lng": 54.46350763634731,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "9",
    "lat": 24.569365432792036,
    "lng": 54.46362492722593,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "9",
    "lat": 24.56955064926063,
    "lng": 54.46373748287684,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "9",
    "lat": 24.569374768207112,
    "lng": 54.46385275658659,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "9",
    "lat": 24.569562186957363,
    "lng": 54.463964578420615,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "9",
    "lat": 24.56938747218337,
    "lng": 54.464077966061446,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "9",
    "lat": 24.569576881954305,
    "lng": 54.46418948681313,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "9",
    "lat": 24.56940337151851,
    "lng": 54.464301149110746,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "9",
    "lat": 24.56959461107389,
    "lng": 54.46441268684593,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "9",
    "lat": 24.569422297352368,
    "lng": 54.4645227944304,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "9",
    "lat": 24.56961525157834,
    "lng": 54.464634577491054,
    "positionSource": "shape_control_calibrated",
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
    "lat": 24.56832709764497,
    "lng": 54.458461498968745,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "2",
    "lat": 24.568057915844257,
    "lng": 54.45795178915242,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.57092545353793,
    "lng": 54.462523087580564,
    "positionSource": "shape_control_calibrated",
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
    "lat": 24.569082366282256,
    "lng": 54.45921912479591,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.56985394374256,
    "lng": 54.46194069423723,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "25",
    "street": "10",
    "lat": 24.57075736924407,
    "lng": 54.46261405382471,
    "positionSource": "shape_control_calibrated",
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
    "lat": 24.569454726630003,
    "lng": 54.46059644555043,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "26",
    "street": "8",
    "lat": 24.570016750765188,
    "lng": 54.46208946422822,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "26",
    "street": "10",
    "lat": 24.5709343947046,
    "lng": 54.462750058843675,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "27",
    "street": "6",
    "lat": 24.569294033354815,
    "lng": 54.46069231479905,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "27",
    "street": "10",
    "lat": 24.570765396613663,
    "lng": 54.46284336755257,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "28",
    "street": "6",
    "lat": 24.56942802639078,
    "lng": 54.460909393734795,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "10",
    "lat": 24.57066605714107,
    "lng": 54.46012761670678,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "10",
    "lat": 24.570833241933087,
    "lng": 54.46025402734623,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "10",
    "lat": 24.570682610948577,
    "lng": 54.46029070519681,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "10",
    "lat": 24.570847970019784,
    "lng": 54.46042504987706,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "10",
    "lat": 24.57069635972498,
    "lng": 54.460464806988625,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "10",
    "lat": 24.570860478904017,
    "lng": 54.46060549174127,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "10",
    "lat": 24.57070746811571,
    "lng": 54.46064977599784,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "10",
    "lat": 24.570870957032678,
    "lng": 54.460795058306104,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "10",
    "lat": 24.570716239794923,
    "lng": 54.46084493602498,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "10",
    "lat": 24.57087969550769,
    "lng": 54.46099306757211,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "10",
    "lat": 24.57072308378213,
    "lng": 54.46104917273131,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "10",
    "lat": 24.57088705974395,
    "lng": 54.46119853841045,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "10",
    "lat": 24.57072847616557,
    "lng": 54.46126107763736,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "10",
    "lat": 24.57089345978918,
    "lng": 54.46141030464812,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "10",
    "lat": 24.570732922439824,
    "lng": 54.46147911253431,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "10",
    "lat": 24.57089932281305,
    "lng": 54.46162713356487,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "10",
    "lat": 24.570736925305027,
    "lng": 54.461701760540414,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "10",
    "lat": 24.570905070487107,
    "lng": 54.461847829170196,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "10",
    "lat": 24.570740960905667,
    "lng": 54.46192764030129,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "10",
    "lat": 24.570911102592962,
    "lng": 54.46207130805866,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "10",
    "lat": 24.57074546407924,
    "lng": 54.462155574786124,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "10",
    "lat": 24.570917786793046,
    "lng": 54.46229664442351,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "10",
    "lat": 24.57075082131136,
    "lng": 54.46238461853454,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "8",
    "lat": 24.569780438006376,
    "lng": 54.45954805679974,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "8",
    "lat": 24.569950303058675,
    "lng": 54.45965211891919,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "8",
    "lat": 24.569820733178172,
    "lng": 54.45963006698508,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "8",
    "lat": 24.569983108989362,
    "lng": 54.459757773620204,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "8",
    "lat": 24.569853601562876,
    "lng": 54.459733557878984,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "8",
    "lat": 24.570009449190263,
    "lng": 54.45988360455307,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "8",
    "lat": 24.56987845072086,
    "lng": 54.45986249848633,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "8",
    "lat": 24.570029038988885,
    "lng": 54.46003209231553,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "8",
    "lat": 24.569895129530348,
    "lng": 54.460019861898665,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "8",
    "lat": 24.570041995520455,
    "lng": 54.460204350381964,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "8",
    "lat": 24.569903995180844,
    "lng": 54.460206222585896,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "8",
    "lat": 24.57004884829549,
    "lng": 54.46039952855435,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "8",
    "lat": 24.569905934154875,
    "lng": 54.46041905915484,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "8",
    "lat": 24.57005049960388,
    "lng": 54.460614776495696,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "8",
    "lat": 24.56990230192473,
    "lng": 54.460653226768564,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "8",
    "lat": 24.57004811810009,
    "lng": 54.46084582273269,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "8",
    "lat": 24.569894723988114,
    "lng": 54.460902294921766,
    "positionSource": "shape_control_calibrated",
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
    "lat": 24.569884824182395,
    "lng": 54.46116000066227,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "8",
    "lat": 24.570036302144086,
    "lng": 54.46133645688312,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "8",
    "lat": 24.569874019495593,
    "lng": 54.46142120620595,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "8",
    "lat": 24.570029155291603,
    "lng": 54.46158789378102,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "8",
    "lat": 24.569863440507543,
    "lng": 54.46168222179705,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "8",
    "lat": 24.570022409617938,
    "lng": 54.46183949294829,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "1",
    "street": "6",
    "lat": 24.568730176641676,
    "lng": 54.459601050478916,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "2",
    "street": "6",
    "lat": 24.56898201141696,
    "lng": 54.45947958206353,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "3",
    "street": "6",
    "lat": 24.568849522147918,
    "lng": 54.45946372712692,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "6",
    "lat": 24.569078071458886,
    "lng": 54.459407090594134,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "6",
    "lat": 24.56895798281009,
    "lng": 54.45935751218057,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "6",
    "lat": 24.56916714105715,
    "lng": 54.45935570801277,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "6",
    "lat": 24.569053149671955,
    "lng": 54.459292170797006,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "6",
    "lat": 24.569247206566313,
    "lng": 54.45933030146738,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "6",
    "lat": 24.569136823700195,
    "lng": 54.459260214297466,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "6",
    "lat": 24.569318145832188,
    "lng": 54.45932771985608,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "6",
    "lat": 24.569210588947225,
    "lng": 54.45924919523882,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "6",
    "lat": 24.569379469500642,
    "lng": 54.45934463887497,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "6",
    "lat": 24.56927340856683,
    "lng": 54.4592527180327,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "6",
    "lat": 24.5694295551203,
    "lng": 54.45938397811725,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "6",
    "lat": 24.56932203600388,
    "lng": 54.45927879234409,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "6",
    "lat": 24.569466601930845,
    "lng": 54.45945736830234,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "6",
    "lat": 24.569354873517387,
    "lng": 54.45935140124857,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "6",
    "lat": 24.56948994839244,
    "lng": 54.45958082451207,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "6",
    "lat": 24.569373259053336,
    "lng": 54.45949736168355,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "20",
    "street": "6",
    "lat": 24.569499410193377,
    "lng": 54.459764539335225,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "6",
    "lat": 24.5693749067406,
    "lng": 54.45972450413283,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "6",
    "lat": 24.569494846923416,
    "lng": 54.4600057373691,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "23",
    "street": "6",
    "lat": 24.5693579247751,
    "lng": 54.46001868865738,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "24",
    "street": "6",
    "lat": 24.569478447703236,
    "lng": 54.4602896469423,
    "positionSource": "shape_control_calibrated",
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
    "lat": 24.56774736045679,
    "lng": 54.46083760047662,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "4",
    "lat": 24.567601906091273,
    "lng": 54.46039289649252,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "4",
    "lat": 24.567868724622738,
    "lng": 54.460690466323825,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "4",
    "lat": 24.56772327025723,
    "lng": 54.460245762339724,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "4",
    "lat": 24.567990088788694,
    "lng": 54.46054333217103,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "4",
    "lat": 24.567844634423178,
    "lng": 54.46009862818694,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "4",
    "lat": 24.568111452954643,
    "lng": 54.460396198018245,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "4",
    "lat": 24.567965998589127,
    "lng": 54.45995149403416,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "4",
    "lat": 24.56823281712059,
    "lng": 54.46024906386546,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "4",
    "lat": 24.568087362755083,
    "lng": 54.45980435988136,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "4",
    "lat": 24.568354181286548,
    "lng": 54.460101929712664,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "14",
    "street": "4",
    "lat": 24.568208726921032,
    "lng": 54.45965722572856,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "15",
    "street": "4",
    "lat": 24.568475545452497,
    "lng": 54.45995479555987,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "4",
    "lat": 24.56833009108698,
    "lng": 54.45951009157578,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "4",
    "lat": 24.568596909618453,
    "lng": 54.45980766140707,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "4",
    "lat": 24.568451455252937,
    "lng": 54.459362957423,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.568572819418886,
    "lng": 54.4592158232702,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "21",
    "street": "4",
    "lat": 24.56883963795035,
    "lng": 54.4595133931015,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "22",
    "street": "4",
    "lat": 24.568694183584835,
    "lng": 54.4590686891174,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.567239905001202,
    "lng": 54.46000351464215,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "2",
    "lat": 24.56697072320049,
    "lng": 54.459493804825826,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "2",
    "lat": 24.56734862426558,
    "lng": 54.45984931307481,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "2",
    "lat": 24.567079442464873,
    "lng": 54.459339603258485,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "2",
    "lat": 24.567457343529956,
    "lng": 54.45969511150747,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "2",
    "lat": 24.56718816172925,
    "lng": 54.459185401691144,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "2",
    "lat": 24.56756606279433,
    "lng": 54.45954090994013,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "2",
    "lat": 24.567296880993624,
    "lng": 54.4590312001238,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "2",
    "lat": 24.56767478205871,
    "lng": 54.45938670837279,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "2",
    "lat": 24.567405600258,
    "lng": 54.45887699855646,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "2",
    "lat": 24.567783501323085,
    "lng": 54.45923250680545,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.56789222058746,
    "lng": 54.45907830523811,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "2",
    "lat": 24.567623038786753,
    "lng": 54.45856859542178,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "2",
    "lat": 24.56800093985184,
    "lng": 54.45892410367077,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "2",
    "lat": 24.567731758051128,
    "lng": 54.45841439385444,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "19",
    "street": "2",
    "lat": 24.568109659116214,
    "lng": 54.45876990210343,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.56821837838059,
    "lng": 54.458615700536086,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.566008744287185,
    "lng": 54.46114994668524,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.567003110164215,
    "lng": 54.461032977014206,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "4",
    "street": "3",
    "lat": 24.56732210563331,
    "lng": 54.461467147182724,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "5",
    "street": "3",
    "lat": 24.56690693565543,
    "lng": 54.461197269492025,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "6",
    "street": "3",
    "lat": 24.567225931124526,
    "lng": 54.46163143966056,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "7",
    "street": "3",
    "lat": 24.56681076114665,
    "lng": 54.461361561969845,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "8",
    "street": "3",
    "lat": 24.567129756615742,
    "lng": 54.46179573213839,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "9",
    "street": "3",
    "lat": 24.566714586637868,
    "lng": 54.46152585444768,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "10",
    "street": "3",
    "lat": 24.56703358210696,
    "lng": 54.46196002461621,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "11",
    "street": "3",
    "lat": 24.566618412129085,
    "lng": 54.4616901469255,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "12",
    "street": "3",
    "lat": 24.56693740759818,
    "lng": 54.46212431709403,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "13",
    "street": "3",
    "lat": 24.5665222376203,
    "lng": 54.46185443940333,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.566426063111518,
    "lng": 54.46201873188115,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "16",
    "street": "3",
    "lat": 24.56674505858061,
    "lng": 54.462452902049684,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "17",
    "street": "3",
    "lat": 24.566329888602734,
    "lng": 54.462183024358986,
    "positionSource": "street_control_calibrated",
    "controlPlot": null
  },
  {
    "villaNumber": "18",
    "street": "3",
    "lat": 24.56664888407183,
    "lng": 54.46261719452752,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.566552709563048,
    "lng": 54.46278148700534,
    "positionSource": "street_control_calibrated",
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
    "lat": 24.568497989124843,
    "lng": 54.46260213498053,
    "positionSource": "shape_control_calibrated",
    "controlPlot": null
  }
];

export function findHiddCoord(villaNumber: string, street: string): HiddVillaCoord | undefined {
  return hiddVillaCoords.find(c => c.villaNumber === villaNumber && c.street === street);
}

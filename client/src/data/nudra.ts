/** Generated from supplied IMKAN Nudra site plan, Sept-2019 availability list, and primary/secondary transaction exports. */
export type NudraTransactionConfidence = "confirmed" | "possible";
export interface NudraTransaction { date: string; priceAed: number; landAreaSqm?: number; saleableAreaSqm?: number; saleType: "primary" | "secondary"; confidence: NudraTransactionConfidence; note: string; }
export interface NudraUnit { unitNumber: string; villaKey: string; category: string; bedrooms?: string; saleableAreaSqm: number; plotAreaSqm: number; originalPriceFiveYearAed?: number; originalPriceSevenYearAed?: number; paymentPlan?: string; transactions: NudraTransaction[]; }
export interface NudraAddressPoint { addressNumber: string; returnedAddress: string; latitude: number; longitude: number; yandexUrl: string; }
export const NUDRA_UNITS: NudraUnit[] = [
  {
    "unitNumber": "S-1",
    "villaKey": "nudra/S-1",
    "category": "Shores private mansion plot",
    "saleableAreaSqm": 1900,
    "plotAreaSqm": 2832.2,
    "transactions": [
      {
        "date": "2019-09-08",
        "priceAed": 34199777,
        "landAreaSqm": 2832.81,
        "confidence": "confirmed",
        "note": "Land Δ 0.61 m²",
        "saleType": "primary"
      },
      {
        "date": "2020-10-22",
        "priceAed": 34199777,
        "landAreaSqm": 2832.81,
        "confidence": "confirmed",
        "note": "Land Δ 0.61 m²",
        "saleType": "secondary"
      }
    ]
  },
  {
    "unitNumber": "S-2",
    "villaKey": "nudra/S-2",
    "category": "Shores private mansion plot",
    "saleableAreaSqm": 1900,
    "plotAreaSqm": 2489.6,
    "originalPriceFiveYearAed": 26334777,
    "originalPriceSevenYearAed": 27650777,
    "paymentPlan": "IMKAN launch price: 5-year or 7-year post-handover payment plan",
    "transactions": [
      {
        "date": "2019-12-18",
        "priceAed": 26334777,
        "landAreaSqm": 2489.69,
        "confidence": "confirmed",
        "note": "Land Δ 0.09 m²",
        "saleType": "primary"
      },
      {
        "date": "2021-12-23",
        "priceAed": 26334777,
        "landAreaSqm": 2489.69,
        "confidence": "confirmed",
        "note": "Land Δ 0.09 m²",
        "saleType": "secondary"
      }
    ]
  },
  {
    "unitNumber": "S-3",
    "villaKey": "nudra/S-3",
    "category": "Shores private mansion plot",
    "saleableAreaSqm": 1900,
    "plotAreaSqm": 2565.3,
    "transactions": []
  },
  {
    "unitNumber": "S-4",
    "villaKey": "nudra/S-4",
    "category": "Shores private mansion plot",
    "saleableAreaSqm": 1900,
    "plotAreaSqm": 2653,
    "transactions": []
  },
  {
    "unitNumber": "B-1-1",
    "villaKey": "nudra/B-1-1",
    "category": "Beach villa",
    "bedrooms": "6",
    "saleableAreaSqm": 1261,
    "plotAreaSqm": 1135.6,
    "originalPriceFiveYearAed": 15477777,
    "originalPriceSevenYearAed": 16251777,
    "paymentPlan": "IMKAN launch price: 5-year or 7-year post-handover payment plan",
    "transactions": []
  },
  {
    "unitNumber": "B-1-2",
    "villaKey": "nudra/B-1-2",
    "category": "Beach villa",
    "bedrooms": "6",
    "saleableAreaSqm": 1261,
    "plotAreaSqm": 1247.7,
    "transactions": [
      {
        "date": "2023-02-02",
        "priceAed": 22707777,
        "landAreaSqm": 1243.21,
        "saleableAreaSqm": 1261.7,
        "confidence": "possible",
        "note": "Land Δ 4.49 m²; saleable area aligns",
        "saleType": "primary"
      }
    ]
  },
  {
    "unitNumber": "B-1-3",
    "villaKey": "nudra/B-1-3",
    "category": "Beach villa",
    "bedrooms": "6",
    "saleableAreaSqm": 1261,
    "plotAreaSqm": 1253.8,
    "transactions": []
  },
  {
    "unitNumber": "B-1-4",
    "villaKey": "nudra/B-1-4",
    "category": "Beach villa",
    "bedrooms": "6",
    "saleableAreaSqm": 1261,
    "plotAreaSqm": 1222.9,
    "originalPriceFiveYearAed": 16677777,
    "originalPriceSevenYearAed": 17511777,
    "paymentPlan": "IMKAN launch price: 5-year or 7-year post-handover payment plan",
    "transactions": [
      {
        "date": "2023-10-03",
        "priceAed": 17161777,
        "landAreaSqm": 1220.13,
        "saleableAreaSqm": 1261.7,
        "confidence": "possible",
        "note": "Land Δ 2.77 m²; saleable area aligns",
        "saleType": "primary"
      }
    ]
  },
  {
    "unitNumber": "B-1-5",
    "villaKey": "nudra/B-1-5",
    "category": "Beach villa",
    "bedrooms": "6",
    "saleableAreaSqm": 1261,
    "plotAreaSqm": 1097,
    "transactions": []
  },
  {
    "unitNumber": "B-1-6",
    "villaKey": "nudra/B-1-6",
    "category": "Beach villa",
    "bedrooms": "6",
    "saleableAreaSqm": 1261,
    "plotAreaSqm": 1056.8,
    "transactions": []
  },
  {
    "unitNumber": "B-2-1",
    "villaKey": "nudra/B-2-1",
    "category": "Beach villa",
    "bedrooms": "6",
    "saleableAreaSqm": 1262,
    "plotAreaSqm": 1000.1,
    "originalPriceFiveYearAed": 15647777,
    "originalPriceSevenYearAed": 16429777,
    "paymentPlan": "IMKAN launch price: 5-year or 7-year post-handover payment plan",
    "transactions": []
  },
  {
    "unitNumber": "B-2-2",
    "villaKey": "nudra/B-2-2",
    "category": "Beach villa",
    "bedrooms": "6",
    "saleableAreaSqm": 1262,
    "plotAreaSqm": 1000.9,
    "transactions": []
  },
  {
    "unitNumber": "B-2-3",
    "villaKey": "nudra/B-2-3",
    "category": "Beach villa",
    "bedrooms": "6",
    "saleableAreaSqm": 1262,
    "plotAreaSqm": 1007.1,
    "transactions": []
  },
  {
    "unitNumber": "B-2-4",
    "villaKey": "nudra/B-2-4",
    "category": "Beach villa",
    "bedrooms": "6",
    "saleableAreaSqm": 1262,
    "plotAreaSqm": 1007.4,
    "originalPriceFiveYearAed": 15877777,
    "originalPriceSevenYearAed": 16671777,
    "paymentPlan": "IMKAN launch price: 5-year or 7-year post-handover payment plan",
    "transactions": []
  },
  {
    "unitNumber": "B-2-5",
    "villaKey": "nudra/B-2-5",
    "category": "Beach villa",
    "bedrooms": "6",
    "saleableAreaSqm": 1262,
    "plotAreaSqm": 1004.5,
    "transactions": []
  },
  {
    "unitNumber": "D-1-1",
    "villaKey": "nudra/D-1-1",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 855,
    "plotAreaSqm": 865.3,
    "originalPriceFiveYearAed": 12977777,
    "originalPriceSevenYearAed": 13626777,
    "paymentPlan": "IMKAN launch price: 5-year or 7-year post-handover payment plan",
    "transactions": []
  },
  {
    "unitNumber": "D-1-2",
    "villaKey": "nudra/D-1-2",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 855,
    "plotAreaSqm": 885,
    "transactions": []
  },
  {
    "unitNumber": "D-1-3",
    "villaKey": "nudra/D-1-3",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 855,
    "plotAreaSqm": 933,
    "transactions": []
  },
  {
    "unitNumber": "D-1-4",
    "villaKey": "nudra/D-1-4",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 855,
    "plotAreaSqm": 910.7,
    "transactions": []
  },
  {
    "unitNumber": "D-1-5",
    "villaKey": "nudra/D-1-5",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 855,
    "plotAreaSqm": 832.3,
    "transactions": []
  },
  {
    "unitNumber": "D-1-6",
    "villaKey": "nudra/D-1-6",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 855,
    "plotAreaSqm": 681.2,
    "transactions": []
  },
  {
    "unitNumber": "D-1-7",
    "villaKey": "nudra/D-1-7",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 855,
    "plotAreaSqm": 637.7,
    "originalPriceFiveYearAed": 9677777,
    "originalPriceSevenYearAed": 10161777,
    "paymentPlan": "IMKAN launch price: 5-year or 7-year post-handover payment plan",
    "transactions": []
  },
  {
    "unitNumber": "D-1-8",
    "villaKey": "nudra/D-1-8",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 855,
    "plotAreaSqm": 637.7,
    "transactions": []
  },
  {
    "unitNumber": "D-1-9",
    "villaKey": "nudra/D-1-9",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 855,
    "plotAreaSqm": 699.5,
    "transactions": []
  },
  {
    "unitNumber": "D-1-10",
    "villaKey": "nudra/D-1-10",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 855,
    "plotAreaSqm": 827.8,
    "transactions": [
      {
        "date": "2025-02-06",
        "priceAed": 40000000,
        "landAreaSqm": 826.73,
        "saleableAreaSqm": 854.99,
        "confidence": "confirmed",
        "note": "Land Δ 1.07 m²; saleable area aligns",
        "saleType": "secondary"
      }
    ]
  },
  {
    "unitNumber": "D-1-11",
    "villaKey": "nudra/D-1-11",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 855,
    "plotAreaSqm": 827.7,
    "transactions": []
  },
  {
    "unitNumber": "D-1-12",
    "villaKey": "nudra/D-1-12",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 855,
    "plotAreaSqm": 743.4,
    "originalPriceFiveYearAed": 10877777,
    "originalPriceSevenYearAed": 11421777,
    "paymentPlan": "IMKAN launch price: 5-year or 7-year post-handover payment plan",
    "transactions": []
  },
  {
    "unitNumber": "D-1-13",
    "villaKey": "nudra/D-1-13",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 855,
    "plotAreaSqm": 771.7,
    "transactions": []
  },
  {
    "unitNumber": "D-1-14",
    "villaKey": "nudra/D-1-14",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 855,
    "plotAreaSqm": 732.8,
    "transactions": [
      {
        "date": "2024-08-02",
        "priceAed": 10036777,
        "landAreaSqm": 729.74,
        "saleableAreaSqm": 854.99,
        "confidence": "possible",
        "note": "Land Δ 3.06 m²; saleable area aligns",
        "saleType": "primary"
      }
    ]
  },
  {
    "unitNumber": "D-1-15",
    "villaKey": "nudra/D-1-15",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 855,
    "plotAreaSqm": 941.2,
    "transactions": []
  },
  {
    "unitNumber": "D-2-1",
    "villaKey": "nudra/D-2-1",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 852,
    "plotAreaSqm": 691.6,
    "transactions": []
  },
  {
    "unitNumber": "D-2-2",
    "villaKey": "nudra/D-2-2",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 852,
    "plotAreaSqm": 691.7,
    "transactions": []
  },
  {
    "unitNumber": "D-2-3",
    "villaKey": "nudra/D-2-3",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 852,
    "plotAreaSqm": 691.7,
    "transactions": []
  },
  {
    "unitNumber": "D-2-4",
    "villaKey": "nudra/D-2-4",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 852,
    "plotAreaSqm": 667.9,
    "transactions": []
  },
  {
    "unitNumber": "D-2-5",
    "villaKey": "nudra/D-2-5",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 852,
    "plotAreaSqm": 642.2,
    "transactions": []
  },
  {
    "unitNumber": "D-2-6",
    "villaKey": "nudra/D-2-6",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 852,
    "plotAreaSqm": 642.2,
    "transactions": []
  },
  {
    "unitNumber": "D-2-7",
    "villaKey": "nudra/D-2-7",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 852,
    "plotAreaSqm": 679.6,
    "transactions": []
  },
  {
    "unitNumber": "D-2-8",
    "villaKey": "nudra/D-2-8",
    "category": "Dunes villa",
    "bedrooms": "4",
    "saleableAreaSqm": 852,
    "plotAreaSqm": 767.6,
    "transactions": []
  }
];
export const NUDRA_YANDEX_ADDRESS_POINTS: NudraAddressPoint[] = [
  {
    "addressNumber": "1",
    "returnedAddress": "1, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.537638,
    "longitude": 54.415915,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZlQEQCQFxufXlydnpgbA==/?ll=54.416089%2C24.538335&z=18.51"
  },
  {
    "addressNumber": "2",
    "returnedAddress": "2, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.537859,
    "longitude": 54.415763,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZlTkMEQFxufXlydnRmbQ==/"
  },
  {
    "addressNumber": "3",
    "returnedAddress": "3, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.537991,
    "longitude": 54.415484,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZlTU0DQFxufXlydnVqZQ==/"
  },
  {
    "addressNumber": "4",
    "returnedAddress": "4, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.538016,
    "longitude": 54.41526,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZlS0MHQFxufXlyeXxiYg==/?ll=54.415260%2C24.538016&z=16"
  },
  {
    "addressNumber": "5",
    "returnedAddress": "5, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.537958,
    "longitude": 54.415017,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZlSUQAQFxufXlydnVmbA==/?ll=54.415017%2C24.537958&z=16"
  },
  {
    "addressNumber": "6",
    "returnedAddress": "6, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.537777,
    "longitude": 54.414846,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZkQUEBQFxufXlydntkYw==/"
  },
  {
    "addressNumber": "11",
    "returnedAddress": "11, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.536766,
    "longitude": 54.414811,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZkQUQGQFxufXlyd3tlYg==/?ll=54.414810%2C24.536767&z=16"
  },
  {
    "addressNumber": "18",
    "returnedAddress": "18, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.536906,
    "longitude": 54.41632,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZmSkcHQFxufXlyd3VjYg==/"
  },
  {
    "addressNumber": "20",
    "returnedAddress": "20, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.537309,
    "longitude": 54.416302,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZmSkUFQFxufXlydn9jbQ==/?ll=54.416301%2C24.537309&z=16"
  },
  {
    "addressNumber": "21",
    "returnedAddress": "21, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.537514,
    "longitude": 54.416284,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZmS00DQFxufXlydnliYA==/"
  },
  {
    "addressNumber": "22",
    "returnedAddress": "22, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.537687,
    "longitude": 54.416248,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZmS0EPQFxufXlydnprYw==/?ll=54.416248%2C24.537687&z=16"
  },
  {
    "addressNumber": "23",
    "returnedAddress": "23, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.537868,
    "longitude": 54.416185,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZmSE0CQFxufXlydnRlbA==/?ll=54.416185%2C24.537868&z=16"
  },
  {
    "addressNumber": "27",
    "returnedAddress": "27, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.538854,
    "longitude": 54.416068,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZmSUMPQFxufXlyeXRmYA==/?ll=54.416068%2C24.538854&z=16"
  },
  {
    "addressNumber": "29",
    "returnedAddress": "29, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.539339,
    "longitude": 54.416203,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZmS0UEQFxufXlyeH9gbQ==/?ll=54.416203%2C24.539339&z=16"
  },
  {
    "addressNumber": "31",
    "returnedAddress": "31, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.538509,
    "longitude": 54.4149,
    "yandexUrl": "https://yandex.uz/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZkQEUHQFxufXlyeXljbQ==/?ll=54.414901%2C24.538509&z=16"
  },
  {
    "addressNumber": "32",
    "returnedAddress": "32, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.538517,
    "longitude": 54.415143,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZlSEEEQFxufXlyeXliYw==/?ll=54.415143%2C24.538517&z=16"
  },
  {
    "addressNumber": "34",
    "returnedAddress": "1 Street, No:34, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.538558,
    "longitude": 54.415592,
    "yandexUrl": "https://yandex.com.tr/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZlTEwFQFxufXlyeXlmbA==/?ll=54.415592%2C24.538558&z=16"
  },
  {
    "addressNumber": "37",
    "returnedAddress": "37, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    "latitude": 24.539339,
    "longitude": 54.415457,
    "yandexUrl": "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZlTUAAQFxufXlyeH9gbQ==/?ll=54.415458%2C24.539339&z=16"
  }
];
export const NUDRA_UNMATCHED_TRANSACTIONS = [
  {
    "date": "2019-10-27",
    "priceAed": 33899777,
    "landAreaSqm": 2402.04,
    "saleableAreaSqm": 806.59,
    "note": "No unique schedule land-area match"
  },
  {
    "date": "2019-08-25",
    "priceAed": 24915777,
    "landAreaSqm": 2525.35,
    "note": "No unique schedule land-area match"
  },
  {
    "date": "2019-08-25",
    "priceAed": 26674777,
    "landAreaSqm": 2688.35,
    "saleableAreaSqm": 103.14,
    "note": "No unique schedule land-area match"
  },
  {
    "date": "2023-06-08",
    "priceAed": 26674777,
    "landAreaSqm": 2688.35,
    "saleableAreaSqm": 103.14,
    "note": "No unique schedule land-area match"
  },
  {
    "date": "2023-06-02",
    "priceAed": 24915777,
    "landAreaSqm": 2525.35,
    "note": "No unique schedule land-area match"
  }
];
export const NUDRA_PAYMENT_PLAN_NOTE = "Launch payment options in the supplied IMKAN availability list: 5-year plan (20% signing & handover, 20% July 2019, 60% across 10 equal semi-annual post-handover instalments) or 7-year plan (60% across 14 equal semi-annual instalments).";
export const NUDRA_SOURCE_LINKS = {
  factsheet: "/manus-storage/NudraFactsheet-V1-EnglishFactsheet_41133707.pdf",
  sitePlan: "/manus-storage/NudraSitePlan_a477c3db.pdf",
  availability: "/manus-storage/NudraAvailabilityList-Sept19_12d2f1fd.pdf",
} as const;

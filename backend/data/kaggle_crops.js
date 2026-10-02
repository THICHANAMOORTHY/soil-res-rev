// ============================================================
// kaggle_crops.js — Unified Tri-Source Kaggle Agronomy Model
// Datasets merged:
//   1. anshtanwar/current-daily-price-of-various-commodities-india (23,093 rows)
//   2. madhuraatmarambhagat/crop-recommendation-dataset (2,200 rows)
//   3. akshatgupta7/crop-yield-in-indian-states-dataset (19,689 rows)
// Total empirical records analyzed: 44,982 | Unique crops: 60
// Generated: 2026-10-01 17:11:11
// ============================================================

const kaggleCrops = [
  {
    "crop_id": 1,
    "name": "Apple",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 5.2,
    "ideal_ph_max": 6.7,
    "n_demand": 24.0,
    "p_demand": 136.5,
    "k_demand": 200.0,
    "stats": {
      "N": {
        "mean": 20.8,
        "stdev": 11.86,
        "median": 24.0
      },
      "P": {
        "mean": 134.22,
        "stdev": 8.14,
        "median": 136.5
      },
      "K": {
        "mean": 199.89,
        "stdev": 3.32,
        "median": 200.0
      },
      "yield": {
        "mean": 4000.0,
        "stdev": 800.0,
        "median": 4000.0,
        "low": 3200.0,
        "high": 4800.0
      }
    },
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 92.0,
    "avg_cultivation_cost": 50000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 22.6,
    "avg_humidity_pct": 92.3,
    "avg_rainfall_mm": 113.0,
    "top_states": [
      "All India"
    ],
    "total_records": 682,
    "data_sources": [
      "indian-mandi-prices (582 trades)",
      "crop-recommendation-dataset (100 sensor rows)"
    ]
  },
  {
    "crop_id": 2,
    "name": "Arecanut",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "High",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.2,
    "p_demand": 42.9,
    "k_demand": 42.9,
    "stats": {
      "N": {
        "mean": 57.2,
        "stdev": 11.44,
        "median": 57.2
      },
      "P": {
        "mean": 42.9,
        "stdev": 8.58,
        "median": 42.9
      },
      "K": {
        "mean": 42.9,
        "stdev": 8.58,
        "median": 42.9
      },
      "yield": {
        "mean": 849.8,
        "stdev": 182.7,
        "median": 522.0,
        "low": 339.3,
        "high": 704.7
      }
    },
    "avg_yield_per_acre": 522.0,
    "avg_market_price": 220,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1838.8,
    "top_states": [
      "Kerala",
      "Assam",
      "Karnataka",
      "Meghalaya"
    ],
    "total_records": 160,
    "data_sources": [
      "crop-yield-in-indian-states (160 harvest rows)"
    ]
  },
  {
    "crop_id": 3,
    "name": "Bajra",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.2,
    "n_demand": 72.2,
    "p_demand": 36.1,
    "k_demand": 36.1,
    "stats": {
      "N": {
        "mean": 72.2,
        "stdev": 14.44,
        "median": 72.2
      },
      "P": {
        "mean": 36.1,
        "stdev": 7.22,
        "median": 36.1
      },
      "K": {
        "mean": 36.1,
        "stdev": 7.22,
        "median": 36.1
      },
      "yield": {
        "mean": 983.4,
        "stdev": 147.3,
        "median": 420.9,
        "low": 273.6,
        "high": 568.2
      }
    },
    "avg_yield_per_acre": 420.9,
    "avg_market_price": 21.2,
    "avg_cultivation_cost": 11000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1052.8,
    "top_states": [
      "Karnataka",
      "Gujarat",
      "Andhra Pradesh",
      "Chhattisgarh"
    ],
    "total_records": 697,
    "data_sources": [
      "indian-mandi-prices (173 trades)",
      "crop-yield-in-indian-states (524 harvest rows)"
    ]
  },
  {
    "crop_id": 4,
    "name": "Banana",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.2,
    "ideal_ph_max": 6.7,
    "n_demand": 100.5,
    "p_demand": 81.0,
    "k_demand": 50.0,
    "stats": {
      "N": {
        "mean": 100.23,
        "stdev": 11.11,
        "median": 100.5
      },
      "P": {
        "mean": 82.01,
        "stdev": 7.69,
        "median": 81.0
      },
      "K": {
        "mean": 50.05,
        "stdev": 3.38,
        "median": 50.0
      },
      "yield": {
        "mean": 10954.9,
        "stdev": 2543.9,
        "median": 7268.2,
        "low": 4724.3,
        "high": 9812.1
      }
    },
    "avg_yield_per_acre": 7268.2,
    "avg_market_price": 27.0,
    "avg_cultivation_cost": 40000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 27.4,
    "avg_humidity_pct": 80.4,
    "avg_rainfall_mm": 1332.5,
    "top_states": [
      "Manipur",
      "Kerala",
      "Gujarat",
      "Meghalaya"
    ],
    "total_records": 1254,
    "data_sources": [
      "indian-mandi-prices (911 trades)",
      "crop-recommendation-dataset (100 sensor rows)",
      "crop-yield-in-indian-states (243 harvest rows)"
    ]
  },
  {
    "crop_id": 5,
    "name": "Barley",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.2,
    "n_demand": 72.2,
    "p_demand": 36.1,
    "k_demand": 36.1,
    "stats": {
      "N": {
        "mean": 72.2,
        "stdev": 14.44,
        "median": 72.2
      },
      "P": {
        "mean": 36.1,
        "stdev": 7.22,
        "median": 36.1
      },
      "K": {
        "mean": 36.1,
        "stdev": 7.22,
        "median": 36.1
      },
      "yield": {
        "mean": 647.5,
        "stdev": 194.0,
        "median": 554.4,
        "low": 360.4,
        "high": 748.4
      }
    },
    "avg_yield_per_acre": 554.4,
    "avg_market_price": 20,
    "avg_cultivation_cost": 12000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1102.2,
    "top_states": [
      "Jammu and Kashmir",
      "West Bengal",
      "Punjab",
      "Uttar Pradesh"
    ],
    "total_records": 297,
    "data_sources": [
      "crop-yield-in-indian-states (297 harvest rows)"
    ]
  },
  {
    "crop_id": 6,
    "name": "Black Gram",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.4,
    "ideal_ph_max": 7.9,
    "n_demand": 41.0,
    "p_demand": 67.0,
    "k_demand": 19.0,
    "stats": {
      "N": {
        "mean": 40.02,
        "stdev": 12.66,
        "median": 41.0
      },
      "P": {
        "mean": 67.47,
        "stdev": 7.15,
        "median": 67.0
      },
      "K": {
        "mean": 19.24,
        "stdev": 3.19,
        "median": 19.0
      },
      "yield": {
        "mean": 238.8,
        "stdev": 80.7,
        "median": 230.7,
        "low": 150.0,
        "high": 311.4
      }
    },
    "avg_yield_per_acre": 230.7,
    "avg_market_price": 87.75,
    "avg_cultivation_cost": 10500,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 30.0,
    "avg_humidity_pct": 65.1,
    "avg_rainfall_mm": 1252.7,
    "top_states": [
      "Odisha",
      "Puducherry",
      "Karnataka",
      "West Bengal"
    ],
    "total_records": 1014,
    "data_sources": [
      "indian-mandi-prices (184 trades)",
      "crop-recommendation-dataset (100 sensor rows)",
      "crop-yield-in-indian-states (730 harvest rows)"
    ]
  },
  {
    "crop_id": 7,
    "name": "Black pepper",
    "crop_family": "Spices",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "High",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "stats": {
      "N": {
        "mean": 57.8,
        "stdev": 11.56,
        "median": 57.8
      },
      "P": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "K": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "yield": {
        "mean": 335.9,
        "stdev": 73.6,
        "median": 210.4,
        "low": 136.8,
        "high": 284.0
      }
    },
    "avg_yield_per_acre": 210.4,
    "avg_market_price": 525.0,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1848.3,
    "top_states": [
      "Karnataka",
      "Kerala",
      "Puducherry",
      "Goa"
    ],
    "total_records": 159,
    "data_sources": [
      "indian-mandi-prices (33 trades)",
      "crop-yield-in-indian-states (126 harvest rows)"
    ]
  },
  {
    "crop_id": 8,
    "name": "Cardamom",
    "crop_family": "Spices",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 53.4,
    "p_demand": 40.0,
    "k_demand": 40.0,
    "stats": {
      "N": {
        "mean": 53.4,
        "stdev": 10.68,
        "median": 53.4
      },
      "P": {
        "mean": 40.0,
        "stdev": 8.0,
        "median": 40.0
      },
      "K": {
        "mean": 40.0,
        "stdev": 8.0,
        "median": 40.0
      },
      "yield": {
        "mean": 68.8,
        "stdev": 11.3,
        "median": 32.4,
        "low": 21.1,
        "high": 43.7
      }
    },
    "avg_yield_per_acre": 32.4,
    "avg_market_price": 1200.0,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1323.3,
    "top_states": [
      "Karnataka",
      "Kerala",
      "Tamil Nadu",
      "West Bengal"
    ],
    "total_records": 76,
    "data_sources": [
      "indian-mandi-prices (3 trades)",
      "crop-yield-in-indian-states (73 harvest rows)"
    ]
  },
  {
    "crop_id": 9,
    "name": "Cashewnut",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 60.4,
    "p_demand": 45.3,
    "k_demand": 45.3,
    "stats": {
      "N": {
        "mean": 60.4,
        "stdev": 12.08,
        "median": 60.4
      },
      "P": {
        "mean": 45.3,
        "stdev": 9.06,
        "median": 45.3
      },
      "K": {
        "mean": 45.3,
        "stdev": 9.06,
        "median": 45.3
      },
      "yield": {
        "mean": 1282.9,
        "stdev": 66.6,
        "median": 190.2,
        "low": 123.6,
        "high": 256.8
      }
    },
    "avg_yield_per_acre": 190.2,
    "avg_market_price": 180,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1434.6,
    "top_states": [
      "Kerala",
      "Andhra Pradesh",
      "Puducherry",
      "Tamil Nadu"
    ],
    "total_records": 132,
    "data_sources": [
      "crop-yield-in-indian-states (132 harvest rows)"
    ]
  },
  {
    "crop_id": 10,
    "name": "Castor seed",
    "crop_family": "Oilseed",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "stats": {
      "N": {
        "mean": 57.8,
        "stdev": 11.56,
        "median": 57.8
      },
      "P": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "K": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "yield": {
        "mean": 279.2,
        "stdev": 83.6,
        "median": 238.8,
        "low": 155.2,
        "high": 322.4
      }
    },
    "avg_yield_per_acre": 238.8,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1136.9,
    "top_states": [
      "Andhra Pradesh",
      "Gujarat",
      "Assam",
      "Meghalaya"
    ],
    "total_records": 300,
    "data_sources": [
      "crop-yield-in-indian-states (300 harvest rows)"
    ]
  },
  {
    "crop_id": 11,
    "name": "Chickpea",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.6,
    "ideal_ph_max": 8.1,
    "n_demand": 39.0,
    "p_demand": 68.0,
    "k_demand": 79.0,
    "stats": {
      "N": {
        "mean": 40.09,
        "stdev": 12.15,
        "median": 39.0
      },
      "P": {
        "mean": 67.79,
        "stdev": 7.5,
        "median": 68.0
      },
      "K": {
        "mean": 79.92,
        "stdev": 3.26,
        "median": 79.0
      },
      "yield": {
        "mean": 356.1,
        "stdev": 116.1,
        "median": 331.8,
        "low": 215.7,
        "high": 447.9
      }
    },
    "avg_yield_per_acre": 331.8,
    "avg_market_price": 53.65,
    "avg_cultivation_cost": 11000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 18.9,
    "avg_humidity_pct": 16.9,
    "avg_rainfall_mm": 1117.9,
    "top_states": [
      "Andhra Pradesh",
      "Karnataka",
      "Haryana",
      "Assam"
    ],
    "total_records": 956,
    "data_sources": [
      "indian-mandi-prices (367 trades)",
      "crop-recommendation-dataset (100 sensor rows)",
      "crop-yield-in-indian-states (489 harvest rows)"
    ]
  },
  {
    "crop_id": 12,
    "name": "Coconut",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.2,
    "ideal_ph_max": 6.7,
    "n_demand": 24.0,
    "p_demand": 15.5,
    "k_demand": 31.0,
    "stats": {
      "N": {
        "mean": 21.98,
        "stdev": 11.76,
        "median": 24.0
      },
      "P": {
        "mean": 16.93,
        "stdev": 8.36,
        "median": 15.5
      },
      "K": {
        "mean": 30.59,
        "stdev": 3.0,
        "median": 31.0
      },
      "yield": {
        "mean": 3649883.3,
        "stdev": 1233176.8,
        "median": 3523362.2,
        "low": 2290185.4,
        "high": 4756539.0
      }
    },
    "avg_yield_per_acre": 3523362.2,
    "avg_market_price": 20,
    "avg_cultivation_cost": 22000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 27.4,
    "avg_humidity_pct": 94.8,
    "avg_rainfall_mm": 1566.0,
    "top_states": [
      "Kerala",
      "West Bengal",
      "Assam",
      "Karnataka"
    ],
    "total_records": 265,
    "data_sources": [
      "crop-recommendation-dataset (100 sensor rows)",
      "crop-yield-in-indian-states (165 harvest rows)"
    ]
  },
  {
    "crop_id": 13,
    "name": "Coffee",
    "crop_family": "Commercial",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 103.0,
    "p_demand": 29.0,
    "k_demand": 30.0,
    "stats": {
      "N": {
        "mean": 101.2,
        "stdev": 12.35,
        "median": 103.0
      },
      "P": {
        "mean": 28.74,
        "stdev": 7.28,
        "median": 29.0
      },
      "K": {
        "mean": 29.94,
        "stdev": 3.25,
        "median": 30.0
      },
      "yield": {
        "mean": 4000.0,
        "stdev": 800.0,
        "median": 4000.0,
        "low": 3200.0,
        "high": 4800.0
      }
    },
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 200,
    "avg_cultivation_cost": 30000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 25.5,
    "avg_humidity_pct": 58.9,
    "avg_rainfall_mm": 157.8,
    "top_states": [
      "All India"
    ],
    "total_records": 100,
    "data_sources": [
      "crop-recommendation-dataset (100 sensor rows)"
    ]
  },
  {
    "crop_id": 14,
    "name": "Coriander",
    "crop_family": "Spices",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 60.3,
    "p_demand": 45.2,
    "k_demand": 45.2,
    "stats": {
      "N": {
        "mean": 60.3,
        "stdev": 12.06,
        "median": 60.3
      },
      "P": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "K": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "yield": {
        "mean": 263.0,
        "stdev": 68.0,
        "median": 194.2,
        "low": 126.2,
        "high": 262.2
      }
    },
    "avg_yield_per_acre": 194.2,
    "avg_market_price": 58.25,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1066.6,
    "top_states": [
      "Andhra Pradesh",
      "Karnataka",
      "Chhattisgarh",
      "Tamil Nadu"
    ],
    "total_records": 312,
    "data_sources": [
      "indian-mandi-prices (114 trades)",
      "crop-yield-in-indian-states (198 harvest rows)"
    ]
  },
  {
    "crop_id": 15,
    "name": "Cotton",
    "crop_family": "Commercial",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.2,
    "ideal_ph_max": 7.7,
    "n_demand": 117.0,
    "p_demand": 46.0,
    "k_demand": 19.0,
    "stats": {
      "N": {
        "mean": 117.77,
        "stdev": 11.63,
        "median": 117.0
      },
      "P": {
        "mean": 46.24,
        "stdev": 7.35,
        "median": 46.0
      },
      "K": {
        "mean": 19.56,
        "stdev": 3.17,
        "median": 19.0
      },
      "yield": {
        "mean": 732.5,
        "stdev": 203.9,
        "median": 582.7,
        "low": 378.8,
        "high": 786.6
      }
    },
    "avg_yield_per_acre": 582.7,
    "avg_market_price": 66.12,
    "avg_cultivation_cost": 24000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 24.0,
    "avg_humidity_pct": 79.8,
    "avg_rainfall_mm": 1220.5,
    "top_states": [
      "Karnataka",
      "Andhra Pradesh",
      "Tamil Nadu",
      "Assam"
    ],
    "total_records": 693,
    "data_sources": [
      "indian-mandi-prices (120 trades)",
      "crop-recommendation-dataset (100 sensor rows)",
      "crop-yield-in-indian-states (473 harvest rows)"
    ]
  },
  {
    "crop_id": 16,
    "name": "Cowpea",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 25.0,
    "p_demand": 55.1,
    "k_demand": 47.2,
    "stats": {
      "N": {
        "mean": 25.0,
        "stdev": 5.0,
        "median": 25.0
      },
      "P": {
        "mean": 55.1,
        "stdev": 11.02,
        "median": 55.1
      },
      "K": {
        "mean": 47.2,
        "stdev": 9.44,
        "median": 47.2
      },
      "yield": {
        "mean": 335.9,
        "stdev": 109.1,
        "median": 311.6,
        "low": 202.5,
        "high": 420.7
      }
    },
    "avg_yield_per_acre": 311.6,
    "avg_market_price": 45.0,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1238.5,
    "top_states": [
      "Karnataka",
      "Mizoram",
      "Andhra Pradesh",
      "Telangana"
    ],
    "total_records": 273,
    "data_sources": [
      "indian-mandi-prices (142 trades)",
      "crop-yield-in-indian-states (131 harvest rows)"
    ]
  },
  {
    "crop_id": 17,
    "name": "Dry chillies",
    "crop_family": "Other",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "stats": {
      "N": {
        "mean": 57.8,
        "stdev": 11.56,
        "median": 57.8
      },
      "P": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "K": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "yield": {
        "mean": 841.7,
        "stdev": 143.0,
        "median": 408.7,
        "low": 265.7,
        "high": 551.7
      }
    },
    "avg_yield_per_acre": 408.7,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1235.6,
    "top_states": [
      "Karnataka",
      "Andhra Pradesh",
      "Puducherry",
      "Manipur"
    ],
    "total_records": 419,
    "data_sources": [
      "crop-yield-in-indian-states (419 harvest rows)"
    ]
  },
  {
    "crop_id": 18,
    "name": "Garlic",
    "crop_family": "Vegetable",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "stats": {
      "N": {
        "mean": 57.8,
        "stdev": 11.56,
        "median": 57.8
      },
      "P": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "K": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "yield": {
        "mean": 1853.5,
        "stdev": 490.1,
        "median": 1400.2,
        "low": 910.1,
        "high": 1890.3
      }
    },
    "avg_yield_per_acre": 1400.2,
    "avg_market_price": 75.0,
    "avg_cultivation_cost": 26000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1117.8,
    "top_states": [
      "Gujarat",
      "Karnataka",
      "Uttarakhand",
      "Chhattisgarh"
    ],
    "total_records": 567,
    "data_sources": [
      "indian-mandi-prices (319 trades)",
      "crop-yield-in-indian-states (248 harvest rows)"
    ]
  },
  {
    "crop_id": 19,
    "name": "Ginger",
    "crop_family": "Spices",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "stats": {
      "N": {
        "mean": 57.8,
        "stdev": 11.56,
        "median": 57.8
      },
      "P": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "K": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "yield": {
        "mean": 2622.4,
        "stdev": 705.4,
        "median": 2015.3,
        "low": 1309.9,
        "high": 2720.7
      }
    },
    "avg_yield_per_acre": 2015.3,
    "avg_market_price": 120.0,
    "avg_cultivation_cost": 35000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1302.7,
    "top_states": [
      "Manipur",
      "Karnataka",
      "Andhra Pradesh",
      "Meghalaya"
    ],
    "total_records": 575,
    "data_sources": [
      "indian-mandi-prices (254 trades)",
      "crop-yield-in-indian-states (321 harvest rows)"
    ]
  },
  {
    "crop_id": 20,
    "name": "Grapes",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 5.3,
    "ideal_ph_max": 6.8,
    "n_demand": 24.0,
    "p_demand": 133.0,
    "k_demand": 201.0,
    "stats": {
      "N": {
        "mean": 23.18,
        "stdev": 12.47,
        "median": 24.0
      },
      "P": {
        "mean": 132.53,
        "stdev": 7.62,
        "median": 133.0
      },
      "K": {
        "mean": 200.11,
        "stdev": 3.27,
        "median": 201.0
      },
      "yield": {
        "mean": 4000.0,
        "stdev": 800.0,
        "median": 4000.0,
        "low": 3200.0,
        "high": 4800.0
      }
    },
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 80.0,
    "avg_cultivation_cost": 45000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 23.9,
    "avg_humidity_pct": 81.9,
    "avg_rainfall_mm": 69.5,
    "top_states": [
      "All India"
    ],
    "total_records": 131,
    "data_sources": [
      "indian-mandi-prices (31 trades)",
      "crop-recommendation-dataset (100 sensor rows)"
    ]
  },
  {
    "crop_id": 21,
    "name": "Green Gram",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 22.0,
    "p_demand": 47.0,
    "k_demand": 20.0,
    "stats": {
      "N": {
        "mean": 20.99,
        "stdev": 11.51,
        "median": 22.0
      },
      "P": {
        "mean": 47.28,
        "stdev": 7.87,
        "median": 47.0
      },
      "K": {
        "mean": 19.87,
        "stdev": 3.15,
        "median": 20.0
      },
      "yield": {
        "mean": 218.5,
        "stdev": 72.2,
        "median": 206.4,
        "low": 134.2,
        "high": 278.6
      }
    },
    "avg_yield_per_acre": 206.4,
    "avg_market_price": 84.7,
    "avg_cultivation_cost": 11000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 28.5,
    "avg_humidity_pct": 85.5,
    "avg_rainfall_mm": 1230.8,
    "top_states": [
      "West Bengal",
      "Odisha",
      "Karnataka",
      "Andhra Pradesh"
    ],
    "total_records": 974,
    "data_sources": [
      "indian-mandi-prices (140 trades)",
      "crop-recommendation-dataset (100 sensor rows)",
      "crop-yield-in-indian-states (734 harvest rows)"
    ]
  },
  {
    "crop_id": 22,
    "name": "Groundnut",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 25.0,
    "p_demand": 52.8,
    "k_demand": 45.2,
    "stats": {
      "N": {
        "mean": 25.0,
        "stdev": 5.0,
        "median": 25.0
      },
      "P": {
        "mean": 52.8,
        "stdev": 10.56,
        "median": 52.8
      },
      "K": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "yield": {
        "mean": 550.4,
        "stdev": 170.0,
        "median": 485.6,
        "low": 315.6,
        "high": 655.6
      }
    },
    "avg_yield_per_acre": 485.6,
    "avg_market_price": 69.4,
    "avg_cultivation_cost": 18000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1283.1,
    "top_states": [
      "Odisha",
      "West Bengal",
      "Karnataka",
      "Puducherry"
    ],
    "total_records": 862,
    "data_sources": [
      "indian-mandi-prices (137 trades)",
      "crop-yield-in-indian-states (725 harvest rows)"
    ]
  },
  {
    "crop_id": 23,
    "name": "Guar seed",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Low",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 25.0,
    "p_demand": 52.8,
    "k_demand": 45.3,
    "stats": {
      "N": {
        "mean": 25.0,
        "stdev": 5.0,
        "median": 25.0
      },
      "P": {
        "mean": 52.8,
        "stdev": 10.56,
        "median": 52.8
      },
      "K": {
        "mean": 45.3,
        "stdev": 9.06,
        "median": 45.3
      },
      "yield": {
        "mean": 396.6,
        "stdev": 89.5,
        "median": 327.8,
        "low": 238.3,
        "high": 417.3
      }
    },
    "avg_yield_per_acre": 327.8,
    "avg_market_price": 55,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 653.2,
    "top_states": [
      "Gujarat",
      "Punjab",
      "Uttar Pradesh",
      "Haryana"
    ],
    "total_records": 61,
    "data_sources": [
      "crop-yield-in-indian-states (61 harvest rows)"
    ]
  },
  {
    "crop_id": 24,
    "name": "Horse-gram",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 25.0,
    "p_demand": 52.8,
    "k_demand": 45.2,
    "stats": {
      "N": {
        "mean": 25.0,
        "stdev": 5.0,
        "median": 25.0
      },
      "P": {
        "mean": 52.8,
        "stdev": 10.56,
        "median": 52.8
      },
      "K": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "yield": {
        "mean": 190.2,
        "stdev": 60.9,
        "median": 174.0,
        "low": 113.1,
        "high": 234.9
      }
    },
    "avg_yield_per_acre": 174.0,
    "avg_market_price": 47.4,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1164.1,
    "top_states": [
      "Karnataka",
      "Andhra Pradesh",
      "Odisha",
      "Chhattisgarh"
    ],
    "total_records": 376,
    "data_sources": [
      "indian-mandi-prices (11 trades)",
      "crop-yield-in-indian-states (365 harvest rows)"
    ]
  },
  {
    "crop_id": 25,
    "name": "Jowar",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.2,
    "n_demand": 72.2,
    "p_demand": 36.1,
    "k_demand": 36.1,
    "stats": {
      "N": {
        "mean": 72.2,
        "stdev": 14.44,
        "median": 72.2
      },
      "P": {
        "mean": 36.1,
        "stdev": 7.22,
        "median": 36.1
      },
      "K": {
        "mean": 36.1,
        "stdev": 7.22,
        "median": 36.1
      },
      "yield": {
        "mean": 433.0,
        "stdev": 138.8,
        "median": 396.6,
        "low": 257.8,
        "high": 535.4
      }
    },
    "avg_yield_per_acre": 396.6,
    "avg_market_price": 26,
    "avg_cultivation_cost": 12000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1057.8,
    "top_states": [
      "Karnataka",
      "Andhra Pradesh",
      "Gujarat",
      "Maharashtra"
    ],
    "total_records": 513,
    "data_sources": [
      "crop-yield-in-indian-states (513 harvest rows)"
    ]
  },
  {
    "crop_id": 26,
    "name": "Jute",
    "crop_family": "Commercial",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "High",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 78.0,
    "p_demand": 46.0,
    "k_demand": 40.0,
    "stats": {
      "N": {
        "mean": 78.4,
        "stdev": 10.97,
        "median": 78.0
      },
      "P": {
        "mean": 46.86,
        "stdev": 7.2,
        "median": 46.0
      },
      "K": {
        "mean": 39.99,
        "stdev": 3.31,
        "median": 40.0
      },
      "yield": {
        "mean": 3334.6,
        "stdev": 1184.1,
        "median": 3383.2,
        "low": 2199.1,
        "high": 4567.3
      }
    },
    "avg_yield_per_acre": 3383.2,
    "avg_market_price": 45,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 25.0,
    "avg_humidity_pct": 79.6,
    "avg_rainfall_mm": 1714.2,
    "top_states": [
      "Assam",
      "Meghalaya",
      "West Bengal",
      "Odisha"
    ],
    "total_records": 266,
    "data_sources": [
      "crop-recommendation-dataset (100 sensor rows)",
      "crop-yield-in-indian-states (166 harvest rows)"
    ]
  },
  {
    "crop_id": 27,
    "name": "Khesari",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 25.0,
    "p_demand": 50.6,
    "k_demand": 43.3,
    "stats": {
      "N": {
        "mean": 25.0,
        "stdev": 5.0,
        "median": 25.0
      },
      "P": {
        "mean": 50.6,
        "stdev": 10.12,
        "median": 50.6
      },
      "K": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "yield": {
        "mean": 319.7,
        "stdev": 92.5,
        "median": 319.7,
        "low": 227.2,
        "high": 412.2
      }
    },
    "avg_yield_per_acre": 319.7,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1302.7,
    "top_states": [
      "West Bengal",
      "Bihar",
      "Chhattisgarh",
      "Madhya Pradesh"
    ],
    "total_records": 75,
    "data_sources": [
      "crop-yield-in-indian-states (75 harvest rows)"
    ]
  },
  {
    "crop_id": 28,
    "name": "Kidney Bean",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Low",
    "ideal_ph_min": 5.0,
    "ideal_ph_max": 6.5,
    "n_demand": 22.0,
    "p_demand": 67.0,
    "k_demand": 20.0,
    "stats": {
      "N": {
        "mean": 20.75,
        "stdev": 10.83,
        "median": 22.0
      },
      "P": {
        "mean": 67.54,
        "stdev": 7.57,
        "median": 67.0
      },
      "K": {
        "mean": 20.05,
        "stdev": 3.1,
        "median": 20.0
      },
      "yield": {
        "mean": 550.0,
        "stdev": 110.0,
        "median": 550.0,
        "low": 440.0,
        "high": 660.0
      }
    },
    "avg_yield_per_acre": 550.0,
    "avg_market_price": 80,
    "avg_cultivation_cost": 12000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 20.1,
    "avg_humidity_pct": 21.6,
    "avg_rainfall_mm": 107.4,
    "top_states": [
      "All India"
    ],
    "total_records": 100,
    "data_sources": [
      "crop-recommendation-dataset (100 sensor rows)"
    ]
  },
  {
    "crop_id": 29,
    "name": "Linseed",
    "crop_family": "Oilseed",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.2,
    "p_demand": 42.9,
    "k_demand": 42.9,
    "stats": {
      "N": {
        "mean": 57.2,
        "stdev": 11.44,
        "median": 57.2
      },
      "P": {
        "mean": 42.9,
        "stdev": 8.58,
        "median": 42.9
      },
      "K": {
        "mean": 42.9,
        "stdev": 8.58,
        "median": 42.9
      },
      "yield": {
        "mean": 194.2,
        "stdev": 62.3,
        "median": 178.1,
        "low": 115.8,
        "high": 240.4
      }
    },
    "avg_yield_per_acre": 178.1,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1223.0,
    "top_states": [
      "Assam",
      "West Bengal",
      "Bihar",
      "Madhya Pradesh"
    ],
    "total_records": 306,
    "data_sources": [
      "crop-yield-in-indian-states (306 harvest rows)"
    ]
  },
  {
    "crop_id": 30,
    "name": "Maize",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.5,
    "ideal_ph_max": 7.0,
    "n_demand": 76.0,
    "p_demand": 48.5,
    "k_demand": 20.0,
    "stats": {
      "N": {
        "mean": 77.76,
        "stdev": 11.95,
        "median": 76.0
      },
      "P": {
        "mean": 48.44,
        "stdev": 8.01,
        "median": 48.5
      },
      "K": {
        "mean": 19.79,
        "stdev": 2.94,
        "median": 20.0
      },
      "yield": {
        "mean": 1388.1,
        "stdev": 277.6,
        "median": 793.2,
        "low": 515.6,
        "high": 1070.8
      }
    },
    "avg_yield_per_acre": 793.2,
    "avg_market_price": 20.0,
    "avg_cultivation_cost": 19000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 22.4,
    "avg_humidity_pct": 65.1,
    "avg_rainfall_mm": 1242.3,
    "top_states": [
      "Karnataka",
      "Bihar",
      "Maharashtra",
      "Odisha"
    ],
    "total_records": 1371,
    "data_sources": [
      "indian-mandi-prices (297 trades)",
      "crop-recommendation-dataset (100 sensor rows)",
      "crop-yield-in-indian-states (974 harvest rows)"
    ]
  },
  {
    "crop_id": 31,
    "name": "Mango",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 5.0,
    "ideal_ph_max": 6.5,
    "n_demand": 21.0,
    "p_demand": 27.5,
    "k_demand": 30.0,
    "stats": {
      "N": {
        "mean": 20.07,
        "stdev": 12.33,
        "median": 21.0
      },
      "P": {
        "mean": 27.18,
        "stdev": 7.66,
        "median": 27.5
      },
      "K": {
        "mean": 29.92,
        "stdev": 3.1,
        "median": 30.0
      },
      "yield": {
        "mean": 4000.0,
        "stdev": 800.0,
        "median": 4000.0,
        "low": 3200.0,
        "high": 4800.0
      }
    },
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 30.0,
    "avg_cultivation_cost": 20000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 31.2,
    "avg_humidity_pct": 50.2,
    "avg_rainfall_mm": 94.9,
    "top_states": [
      "All India"
    ],
    "total_records": 470,
    "data_sources": [
      "indian-mandi-prices (370 trades)",
      "crop-recommendation-dataset (100 sensor rows)"
    ]
  },
  {
    "crop_id": 32,
    "name": "Mesta",
    "crop_family": "Other",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "stats": {
      "N": {
        "mean": 57.8,
        "stdev": 11.56,
        "median": 57.8
      },
      "P": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "K": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "yield": {
        "mean": 2213.6,
        "stdev": 739.4,
        "median": 2112.5,
        "low": 1373.1,
        "high": 2851.9
      }
    },
    "avg_yield_per_acre": 2112.5,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1402.7,
    "top_states": [
      "Meghalaya",
      "Andhra Pradesh",
      "Assam",
      "West Bengal"
    ],
    "total_records": 207,
    "data_sources": [
      "crop-yield-in-indian-states (207 harvest rows)"
    ]
  },
  {
    "crop_id": 33,
    "name": "Moth Bean",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.1,
    "ideal_ph_max": 7.6,
    "n_demand": 22.0,
    "p_demand": 48.5,
    "k_demand": 20.0,
    "stats": {
      "N": {
        "mean": 21.44,
        "stdev": 11.34,
        "median": 22.0
      },
      "P": {
        "mean": 48.01,
        "stdev": 7.55,
        "median": 48.5
      },
      "K": {
        "mean": 20.23,
        "stdev": 3.05,
        "median": 20.0
      },
      "yield": {
        "mean": 182.1,
        "stdev": 62.3,
        "median": 178.1,
        "low": 115.8,
        "high": 240.4
      }
    },
    "avg_yield_per_acre": 178.1,
    "avg_market_price": 60,
    "avg_cultivation_cost": 8500,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 28.2,
    "avg_humidity_pct": 53.2,
    "avg_rainfall_mm": 937.8,
    "top_states": [
      "Gujarat",
      "Uttarakhand",
      "Haryana",
      "Himachal Pradesh"
    ],
    "total_records": 208,
    "data_sources": [
      "crop-recommendation-dataset (100 sensor rows)",
      "crop-yield-in-indian-states (108 harvest rows)"
    ]
  },
  {
    "crop_id": 34,
    "name": "Muskmelon",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 5.6,
    "ideal_ph_max": 7.1,
    "n_demand": 100.0,
    "p_demand": 18.0,
    "k_demand": 50.0,
    "stats": {
      "N": {
        "mean": 100.32,
        "stdev": 12.18,
        "median": 100.0
      },
      "P": {
        "mean": 17.72,
        "stdev": 7.19,
        "median": 18.0
      },
      "K": {
        "mean": 50.08,
        "stdev": 3.22,
        "median": 50.0
      },
      "yield": {
        "mean": 4000.0,
        "stdev": 800.0,
        "median": 4000.0,
        "low": 3200.0,
        "high": 4800.0
      }
    },
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 35,
    "avg_cultivation_cost": 14000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 28.7,
    "avg_humidity_pct": 92.3,
    "avg_rainfall_mm": 24.7,
    "top_states": [
      "All India"
    ],
    "total_records": 100,
    "data_sources": [
      "crop-recommendation-dataset (100 sensor rows)"
    ]
  },
  {
    "crop_id": 35,
    "name": "Mustard",
    "crop_family": "Oilseed",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "stats": {
      "N": {
        "mean": 57.8,
        "stdev": 11.56,
        "median": 57.8
      },
      "P": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "K": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "yield": {
        "mean": 319.7,
        "stdev": 104.8,
        "median": 299.5,
        "low": 194.7,
        "high": 404.3
      }
    },
    "avg_yield_per_acre": 299.5,
    "avg_market_price": 54.75,
    "avg_cultivation_cost": 12000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1281.1,
    "top_states": [
      "Mizoram",
      "Assam",
      "Meghalaya",
      "West Bengal"
    ],
    "total_records": 906,
    "data_sources": [
      "indian-mandi-prices (378 trades)",
      "crop-yield-in-indian-states (528 harvest rows)"
    ]
  },
  {
    "crop_id": 36,
    "name": "Niger seed",
    "crop_family": "Oilseed",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "stats": {
      "N": {
        "mean": 57.8,
        "stdev": 11.56,
        "median": 57.8
      },
      "P": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "K": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "yield": {
        "mean": 174.0,
        "stdev": 51.0,
        "median": 145.7,
        "low": 94.7,
        "high": 196.7
      }
    },
    "avg_yield_per_acre": 145.7,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1306.0,
    "top_states": [
      "West Bengal",
      "Assam",
      "Karnataka",
      "Andhra Pradesh"
    ],
    "total_records": 190,
    "data_sources": [
      "crop-yield-in-indian-states (190 harvest rows)"
    ]
  },
  {
    "crop_id": 37,
    "name": "Onion",
    "crop_family": "Vegetable",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 60.3,
    "p_demand": 45.2,
    "k_demand": 45.2,
    "stats": {
      "N": {
        "mean": 60.3,
        "stdev": 12.06,
        "median": 60.3
      },
      "P": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "K": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "yield": {
        "mean": 5443.0,
        "stdev": 1341.3,
        "median": 3832.4,
        "low": 2491.1,
        "high": 5173.7
      }
    },
    "avg_yield_per_acre": 3832.4,
    "avg_market_price": 15.8,
    "avg_cultivation_cost": 22000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1111.7,
    "top_states": [
      "Karnataka",
      "Andhra Pradesh",
      "Uttar Pradesh",
      "Gujarat"
    ],
    "total_records": 1609,
    "data_sources": [
      "indian-mandi-prices (1,162 trades)",
      "crop-yield-in-indian-states (447 harvest rows)"
    ]
  },
  {
    "crop_id": 38,
    "name": "Orange",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 6.3,
    "ideal_ph_max": 7.8,
    "n_demand": 19.0,
    "p_demand": 16.0,
    "k_demand": 10.0,
    "stats": {
      "N": {
        "mean": 19.58,
        "stdev": 11.94,
        "median": 19.0
      },
      "P": {
        "mean": 16.55,
        "stdev": 7.69,
        "median": 16.0
      },
      "K": {
        "mean": 10.01,
        "stdev": 3.06,
        "median": 10.0
      },
      "yield": {
        "mean": 4000.0,
        "stdev": 800.0,
        "median": 4000.0,
        "low": 3200.0,
        "high": 4800.0
      }
    },
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 70.0,
    "avg_cultivation_cost": 22000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 22.8,
    "avg_humidity_pct": 92.2,
    "avg_rainfall_mm": 110.7,
    "top_states": [
      "All India"
    ],
    "total_records": 120,
    "data_sources": [
      "indian-mandi-prices (20 trades)",
      "crop-recommendation-dataset (100 sensor rows)"
    ]
  },
  {
    "crop_id": 39,
    "name": "Papaya",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 49.0,
    "p_demand": 60.0,
    "k_demand": 50.0,
    "stats": {
      "N": {
        "mean": 49.88,
        "stdev": 12.22,
        "median": 49.0
      },
      "P": {
        "mean": 59.05,
        "stdev": 7.06,
        "median": 60.0
      },
      "K": {
        "mean": 50.04,
        "stdev": 3.1,
        "median": 50.0
      },
      "yield": {
        "mean": 4000.0,
        "stdev": 800.0,
        "median": 4000.0,
        "low": 3200.0,
        "high": 4800.0
      }
    },
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 25.0,
    "avg_cultivation_cost": 18000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 33.7,
    "avg_humidity_pct": 92.4,
    "avg_rainfall_mm": 139.0,
    "top_states": [
      "All India"
    ],
    "total_records": 333,
    "data_sources": [
      "indian-mandi-prices (233 trades)",
      "crop-recommendation-dataset (100 sensor rows)"
    ]
  },
  {
    "crop_id": 40,
    "name": "Peas & Beans",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 25.0,
    "p_demand": 52.8,
    "k_demand": 45.2,
    "stats": {
      "N": {
        "mean": 25.0,
        "stdev": 5.0,
        "median": 25.0
      },
      "P": {
        "mean": 52.8,
        "stdev": 10.56,
        "median": 52.8
      },
      "K": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "yield": {
        "mean": 562.5,
        "stdev": 131.7,
        "median": 376.4,
        "low": 244.7,
        "high": 508.1
      }
    },
    "avg_yield_per_acre": 376.4,
    "avg_market_price": 52.95,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1317.2,
    "top_states": [
      "Nagaland",
      "Jammu and Kashmir",
      "Haryana",
      "Himachal Pradesh"
    ],
    "total_records": 512,
    "data_sources": [
      "indian-mandi-prices (143 trades)",
      "crop-yield-in-indian-states (369 harvest rows)"
    ]
  },
  {
    "crop_id": 41,
    "name": "Pigeon Pea",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.0,
    "ideal_ph_max": 6.5,
    "n_demand": 20.0,
    "p_demand": 69.5,
    "k_demand": 20.0,
    "stats": {
      "N": {
        "mean": 20.73,
        "stdev": 11.85,
        "median": 20.0
      },
      "P": {
        "mean": 67.73,
        "stdev": 7.29,
        "median": 69.5
      },
      "K": {
        "mean": 20.29,
        "stdev": 2.82,
        "median": 20.0
      },
      "yield": {
        "mean": 392.5,
        "stdev": 110.5,
        "median": 315.7,
        "low": 205.2,
        "high": 426.2
      }
    },
    "avg_yield_per_acre": 315.7,
    "avg_market_price": 100.16,
    "avg_cultivation_cost": 12000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 27.7,
    "avg_humidity_pct": 48.1,
    "avg_rainfall_mm": 1178.9,
    "top_states": [
      "Andhra Pradesh",
      "Assam",
      "Karnataka",
      "West Bengal"
    ],
    "total_records": 882,
    "data_sources": [
      "indian-mandi-prices (274 trades)",
      "crop-recommendation-dataset (100 sensor rows)",
      "crop-yield-in-indian-states (508 harvest rows)"
    ]
  },
  {
    "crop_id": 42,
    "name": "Pomegranate",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 5.7,
    "ideal_ph_max": 7.2,
    "n_demand": 18.0,
    "p_demand": 20.0,
    "k_demand": 40.0,
    "stats": {
      "N": {
        "mean": 18.87,
        "stdev": 12.62,
        "median": 18.0
      },
      "P": {
        "mean": 18.75,
        "stdev": 7.39,
        "median": 20.0
      },
      "K": {
        "mean": 40.21,
        "stdev": 3.03,
        "median": 40.0
      },
      "yield": {
        "mean": 4000.0,
        "stdev": 800.0,
        "median": 4000.0,
        "low": 3200.0,
        "high": 4800.0
      }
    },
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 67.1,
    "avg_cultivation_cost": 35000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 21.8,
    "avg_humidity_pct": 90.1,
    "avg_rainfall_mm": 107.6,
    "top_states": [
      "All India"
    ],
    "total_records": 391,
    "data_sources": [
      "indian-mandi-prices (291 trades)",
      "crop-recommendation-dataset (100 sensor rows)"
    ]
  },
  {
    "crop_id": 43,
    "name": "Potato",
    "crop_family": "Vegetable",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 60.3,
    "p_demand": 45.2,
    "k_demand": 45.2,
    "stats": {
      "N": {
        "mean": 60.3,
        "stdev": 12.06,
        "median": 60.3
      },
      "P": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "K": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "yield": {
        "mean": 5402.6,
        "stdev": 1441.9,
        "median": 4119.7,
        "low": 2677.8,
        "high": 5561.6
      }
    },
    "avg_yield_per_acre": 4119.7,
    "avg_market_price": 12.6,
    "avg_cultivation_cost": 25000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1296.3,
    "top_states": [
      "Karnataka",
      "Uttarakhand",
      "West Bengal",
      "Himachal Pradesh"
    ],
    "total_records": 1832,
    "data_sources": [
      "indian-mandi-prices (1,205 trades)",
      "crop-yield-in-indian-states (627 harvest rows)"
    ]
  },
  {
    "crop_id": 44,
    "name": "Ragi",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.2,
    "n_demand": 72.2,
    "p_demand": 36.1,
    "k_demand": 36.1,
    "stats": {
      "N": {
        "mean": 72.2,
        "stdev": 14.44,
        "median": 72.2
      },
      "P": {
        "mean": 36.1,
        "stdev": 7.22,
        "median": 36.1
      },
      "K": {
        "mean": 36.1,
        "stdev": 7.22,
        "median": 36.1
      },
      "yield": {
        "mean": 493.7,
        "stdev": 147.3,
        "median": 420.9,
        "low": 273.6,
        "high": 568.2
      }
    },
    "avg_yield_per_acre": 420.9,
    "avg_market_price": 32,
    "avg_cultivation_cost": 11000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1255.4,
    "top_states": [
      "Karnataka",
      "Odisha",
      "Andhra Pradesh",
      "Puducherry"
    ],
    "total_records": 498,
    "data_sources": [
      "crop-yield-in-indian-states (498 harvest rows)"
    ]
  },
  {
    "crop_id": 45,
    "name": "Red Lentil",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.2,
    "ideal_ph_max": 7.7,
    "n_demand": 16.5,
    "p_demand": 68.0,
    "k_demand": 19.0,
    "stats": {
      "N": {
        "mean": 18.77,
        "stdev": 12.2,
        "median": 16.5
      },
      "P": {
        "mean": 68.36,
        "stdev": 7.34,
        "median": 68.0
      },
      "K": {
        "mean": 19.41,
        "stdev": 2.97,
        "median": 19.0
      },
      "yield": {
        "mean": 283.3,
        "stdev": 96.8,
        "median": 283.3,
        "low": 186.5,
        "high": 380.1
      }
    },
    "avg_yield_per_acre": 283.3,
    "avg_market_price": 69.22,
    "avg_cultivation_cost": 9500,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 24.5,
    "avg_humidity_pct": 64.8,
    "avg_rainfall_mm": 1250.8,
    "top_states": [
      "West Bengal",
      "Punjab",
      "Jammu and Kashmir",
      "Haryana"
    ],
    "total_records": 604,
    "data_sources": [
      "indian-mandi-prices (180 trades)",
      "crop-recommendation-dataset (100 sensor rows)",
      "crop-yield-in-indian-states (324 harvest rows)"
    ]
  },
  {
    "crop_id": 46,
    "name": "Rice",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.7,
    "ideal_ph_max": 7.2,
    "n_demand": 80.0,
    "p_demand": 47.0,
    "k_demand": 40.0,
    "stats": {
      "N": {
        "mean": 79.89,
        "stdev": 11.92,
        "median": 80.0
      },
      "P": {
        "mean": 47.58,
        "stdev": 7.9,
        "median": 47.0
      },
      "K": {
        "mean": 39.87,
        "stdev": 2.95,
        "median": 40.0
      },
      "yield": {
        "mean": 898.4,
        "stdev": 311.6,
        "median": 890.3,
        "low": 578.7,
        "high": 1201.9
      }
    },
    "avg_yield_per_acre": 890.3,
    "avg_market_price": 24.35,
    "avg_cultivation_cost": 24000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 23.7,
    "avg_humidity_pct": 82.3,
    "avg_rainfall_mm": 1402.7,
    "top_states": [
      "Assam",
      "Karnataka",
      "West Bengal",
      "Bihar"
    ],
    "total_records": 2210,
    "data_sources": [
      "indian-mandi-prices (913 trades)",
      "crop-recommendation-dataset (100 sensor rows)",
      "crop-yield-in-indian-states (1,197 harvest rows)"
    ]
  },
  {
    "crop_id": 47,
    "name": "Safflower",
    "crop_family": "Oilseed",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "stats": {
      "N": {
        "mean": 57.8,
        "stdev": 11.56,
        "median": 57.8
      },
      "P": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "K": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "yield": {
        "mean": 230.7,
        "stdev": 79.3,
        "median": 226.6,
        "low": 147.3,
        "high": 305.9
      }
    },
    "avg_yield_per_acre": 226.6,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1157.0,
    "top_states": [
      "Andhra Pradesh",
      "West Bengal",
      "Karnataka",
      "Maharashtra"
    ],
    "total_records": 168,
    "data_sources": [
      "crop-yield-in-indian-states (168 harvest rows)"
    ]
  },
  {
    "crop_id": 48,
    "name": "Sannhamp",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 25.0,
    "p_demand": 50.1,
    "k_demand": 42.9,
    "stats": {
      "N": {
        "mean": 25.0,
        "stdev": 5.0,
        "median": 25.0
      },
      "P": {
        "mean": 50.1,
        "stdev": 10.02,
        "median": 50.1
      },
      "K": {
        "mean": 42.9,
        "stdev": 8.58,
        "median": 42.9
      },
      "yield": {
        "mean": 538.2,
        "stdev": 66.6,
        "median": 190.2,
        "low": 123.6,
        "high": 256.8
      }
    },
    "avg_yield_per_acre": 190.2,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1136.0,
    "top_states": [
      "West Bengal",
      "Karnataka",
      "Chhattisgarh",
      "Uttar Pradesh"
    ],
    "total_records": 153,
    "data_sources": [
      "crop-yield-in-indian-states (153 harvest rows)"
    ]
  },
  {
    "crop_id": 49,
    "name": "Sesamum",
    "crop_family": "Oilseed",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 60.3,
    "p_demand": 45.2,
    "k_demand": 45.2,
    "stats": {
      "N": {
        "mean": 60.3,
        "stdev": 12.06,
        "median": 60.3
      },
      "P": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "K": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "yield": {
        "mean": 246.9,
        "stdev": 62.3,
        "median": 178.1,
        "low": 115.8,
        "high": 240.4
      }
    },
    "avg_yield_per_acre": 178.1,
    "avg_market_price": 110,
    "avg_cultivation_cost": 11000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1309.0,
    "top_states": [
      "Odisha",
      "West Bengal",
      "Maharashtra",
      "Andhra Pradesh"
    ],
    "total_records": 684,
    "data_sources": [
      "crop-yield-in-indian-states (684 harvest rows)"
    ]
  },
  {
    "crop_id": 50,
    "name": "Small millets",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.2,
    "n_demand": 72.2,
    "p_demand": 36.1,
    "k_demand": 36.1,
    "stats": {
      "N": {
        "mean": 72.2,
        "stdev": 14.44,
        "median": 72.2
      },
      "P": {
        "mean": 36.1,
        "stdev": 7.22,
        "median": 36.1
      },
      "K": {
        "mean": 36.1,
        "stdev": 7.22,
        "median": 36.1
      },
      "yield": {
        "mean": 311.6,
        "stdev": 106.2,
        "median": 303.5,
        "low": 197.3,
        "high": 409.7
      }
    },
    "avg_yield_per_acre": 303.5,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1288.9,
    "top_states": [
      "West Bengal",
      "Andhra Pradesh",
      "Maharashtra",
      "Uttar Pradesh"
    ],
    "total_records": 484,
    "data_sources": [
      "crop-yield-in-indian-states (484 harvest rows)"
    ]
  },
  {
    "crop_id": 51,
    "name": "Soybean",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 25.0,
    "p_demand": 52.8,
    "k_demand": 45.2,
    "stats": {
      "N": {
        "mean": 25.0,
        "stdev": 5.0,
        "median": 25.0
      },
      "P": {
        "mean": 52.8,
        "stdev": 10.56,
        "median": 52.8
      },
      "K": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "yield": {
        "mean": 445.2,
        "stdev": 143.0,
        "median": 408.7,
        "low": 265.7,
        "high": 551.7
      }
    },
    "avg_yield_per_acre": 408.7,
    "avg_market_price": 47.75,
    "avg_cultivation_cost": 14000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1319.8,
    "top_states": [
      "Andhra Pradesh",
      "West Bengal",
      "Madhya Pradesh",
      "Uttar Pradesh"
    ],
    "total_records": 487,
    "data_sources": [
      "indian-mandi-prices (142 trades)",
      "crop-yield-in-indian-states (345 harvest rows)"
    ]
  },
  {
    "crop_id": 52,
    "name": "Sugarcane",
    "crop_family": "Commercial",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.2,
    "p_demand": 42.9,
    "k_demand": 42.9,
    "stats": {
      "N": {
        "mean": 57.2,
        "stdev": 11.44,
        "median": 57.2
      },
      "P": {
        "mean": 42.9,
        "stdev": 8.58,
        "median": 42.9
      },
      "K": {
        "mean": 42.9,
        "stdev": 8.58,
        "median": 42.9
      },
      "yield": {
        "mean": 20934.4,
        "stdev": 7529.6,
        "median": 21513.1,
        "low": 13983.5,
        "high": 29042.7
      }
    },
    "avg_yield_per_acre": 21513.1,
    "avg_market_price": 3.5,
    "avg_cultivation_cost": 38000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1329.1,
    "top_states": [
      "Manipur",
      "Uttar Pradesh",
      "Assam",
      "Meghalaya"
    ],
    "total_records": 605,
    "data_sources": [
      "crop-yield-in-indian-states (605 harvest rows)"
    ]
  },
  {
    "crop_id": 53,
    "name": "Sunflower",
    "crop_family": "Oilseed",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "stats": {
      "N": {
        "mean": 57.8,
        "stdev": 11.56,
        "median": 57.8
      },
      "P": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "K": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "yield": {
        "mean": 380.4,
        "stdev": 119.0,
        "median": 339.9,
        "low": 220.9,
        "high": 458.9
      }
    },
    "avg_yield_per_acre": 339.9,
    "avg_market_price": 50,
    "avg_cultivation_cost": 13000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1147.5,
    "top_states": [
      "Karnataka",
      "Maharashtra",
      "Nagaland",
      "Andhra Pradesh"
    ],
    "total_records": 440,
    "data_sources": [
      "crop-yield-in-indian-states (440 harvest rows)"
    ]
  },
  {
    "crop_id": 54,
    "name": "Sweet Potato",
    "crop_family": "Vegetable",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "stats": {
      "N": {
        "mean": 57.8,
        "stdev": 11.56,
        "median": 57.8
      },
      "P": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "K": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "yield": {
        "mean": 3808.1,
        "stdev": 1208.2,
        "median": 3452.0,
        "low": 2243.8,
        "high": 4660.2
      }
    },
    "avg_yield_per_acre": 3452.0,
    "avg_market_price": 23.0,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1291.5,
    "top_states": [
      "Andhra Pradesh",
      "Assam",
      "Meghalaya",
      "Kerala"
    ],
    "total_records": 293,
    "data_sources": [
      "indian-mandi-prices (25 trades)",
      "crop-yield-in-indian-states (268 harvest rows)"
    ]
  },
  {
    "crop_id": 55,
    "name": "Tapioca",
    "crop_family": "Vegetable",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 60.3,
    "p_demand": 45.2,
    "k_demand": 45.2,
    "stats": {
      "N": {
        "mean": 60.3,
        "stdev": 12.06,
        "median": 60.3
      },
      "P": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "K": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "yield": {
        "mean": 6778.5,
        "stdev": 1577.9,
        "median": 4508.2,
        "low": 2930.3,
        "high": 6086.1
      }
    },
    "avg_yield_per_acre": 4508.2,
    "avg_market_price": 30.0,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1563.4,
    "top_states": [
      "Puducherry",
      "Andhra Pradesh",
      "Kerala",
      "Assam"
    ],
    "total_records": 264,
    "data_sources": [
      "indian-mandi-prices (64 trades)",
      "crop-yield-in-indian-states (200 harvest rows)"
    ]
  },
  {
    "crop_id": 56,
    "name": "Tobacco",
    "crop_family": "Commercial",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 60.3,
    "p_demand": 45.2,
    "k_demand": 45.2,
    "stats": {
      "N": {
        "mean": 60.3,
        "stdev": 12.06,
        "median": 60.3
      },
      "P": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "K": {
        "mean": 45.2,
        "stdev": 9.04,
        "median": 45.2
      },
      "yield": {
        "mean": 857.9,
        "stdev": 198.3,
        "median": 566.6,
        "low": 368.3,
        "high": 764.9
      }
    },
    "avg_yield_per_acre": 566.6,
    "avg_market_price": 95,
    "avg_cultivation_cost": 28000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1206.3,
    "top_states": [
      "Gujarat",
      "Uttar Pradesh",
      "Andhra Pradesh",
      "Assam"
    ],
    "total_records": 362,
    "data_sources": [
      "crop-yield-in-indian-states (362 harvest rows)"
    ]
  },
  {
    "crop_id": 57,
    "name": "Tomato",
    "crop_family": "Solanaceae",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 48.0,
    "p_demand": 36.0,
    "k_demand": 36.0,
    "stats": {
      "N": {
        "mean": 48.0,
        "stdev": 9.6,
        "median": 48.0
      },
      "P": {
        "mean": 36.0,
        "stdev": 7.2,
        "median": 36.0
      },
      "K": {
        "mean": 36.0,
        "stdev": 7.2,
        "median": 36.0
      },
      "yield": {
        "mean": 4000.0,
        "stdev": 800.0,
        "median": 4000.0,
        "low": 3200.0,
        "high": 4800.0
      }
    },
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 79.5,
    "avg_cultivation_cost": 35000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1000.0,
    "top_states": [
      "All India"
    ],
    "total_records": 671,
    "data_sources": [
      "indian-mandi-prices (671 trades)"
    ]
  },
  {
    "crop_id": 58,
    "name": "Turmeric",
    "crop_family": "Spices",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "stats": {
      "N": {
        "mean": 57.8,
        "stdev": 11.56,
        "median": 57.8
      },
      "P": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "K": {
        "mean": 43.3,
        "stdev": 8.66,
        "median": 43.3
      },
      "yield": {
        "mean": 1359.7,
        "stdev": 286.1,
        "median": 817.5,
        "low": 531.4,
        "high": 1103.6
      }
    },
    "avg_yield_per_acre": 817.5,
    "avg_market_price": 98.37,
    "avg_cultivation_cost": 32000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1349.5,
    "top_states": [
      "Assam",
      "Karnataka",
      "Kerala",
      "Manipur"
    ],
    "total_records": 366,
    "data_sources": [
      "indian-mandi-prices (32 trades)",
      "crop-yield-in-indian-states (334 harvest rows)"
    ]
  },
  {
    "crop_id": 59,
    "name": "Watermelon",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.2,
    "n_demand": 99.0,
    "p_demand": 17.5,
    "k_demand": 50.5,
    "stats": {
      "N": {
        "mean": 99.42,
        "stdev": 12.57,
        "median": 99.0
      },
      "P": {
        "mean": 17.0,
        "stdev": 7.54,
        "median": 17.5
      },
      "K": {
        "mean": 50.22,
        "stdev": 3.26,
        "median": 50.5
      },
      "yield": {
        "mean": 4000.0,
        "stdev": 800.0,
        "median": 4000.0,
        "low": 3200.0,
        "high": 4800.0
      }
    },
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 35,
    "avg_cultivation_cost": 15000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 25.6,
    "avg_humidity_pct": 85.2,
    "avg_rainfall_mm": 50.7,
    "top_states": [
      "All India"
    ],
    "total_records": 100,
    "data_sources": [
      "crop-recommendation-dataset (100 sensor rows)"
    ]
  },
  {
    "crop_id": 60,
    "name": "Wheat",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.2,
    "n_demand": 72.2,
    "p_demand": 36.1,
    "k_demand": 36.1,
    "stats": {
      "N": {
        "mean": 72.2,
        "stdev": 14.44,
        "median": 72.2
      },
      "P": {
        "mean": 36.1,
        "stdev": 7.22,
        "median": 36.1
      },
      "K": {
        "mean": 36.1,
        "stdev": 7.22,
        "median": 36.1
      },
      "yield": {
        "mean": 813.4,
        "stdev": 236.5,
        "median": 675.8,
        "low": 439.3,
        "high": 912.3
      }
    },
    "avg_yield_per_acre": 675.8,
    "avg_market_price": 22.85,
    "avg_cultivation_cost": 18000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1246.2,
    "top_states": [
      "Andhra Pradesh",
      "Assam",
      "Karnataka",
      "West Bengal"
    ],
    "total_records": 1184,
    "data_sources": [
      "indian-mandi-prices (641 trades)",
      "crop-yield-in-indian-states (543 harvest rows)"
    ]
  }
];

module.exports = { kaggleCrops };

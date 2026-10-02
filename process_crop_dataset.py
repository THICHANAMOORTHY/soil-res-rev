"""
process_crop_dataset.py
=============================================================
Unified Tri-Source Agronomy & Mandi Pricing Engine:
  1. anshtanwar/current-daily-price-of-various-commodities-india (23,093 rows)
     -> Daily APMC prices covering 224 commodities (Fruits, Spices, Pulses)
  2. madhuraatmarambhagat/crop-recommendation-dataset (2,200 rows)
     -> Precise sensor soil N, P, K, pH, Temperature, Humidity, Rainfall
  3. akshatgupta7/crop-yield-in-indian-states-dataset (19,689 rows)
     -> State-level harvest yields, areas, pesticide & season distributions

Total empirical records: ~44,982
Outputs: backend/data/kaggle_crops.js
"""

import kagglehub, os, json, csv, statistics
from collections import defaultdict
from datetime import datetime

print("=" * 75)
print("  CropSmart P025: Tri-Source Agronomy & Mandi Price Engine")
print("=" * 75)

# 1. Download / Verify All 3 Datasets
print("\n[1/5] Downloading / Locating Datasets via KaggleHub...")

dir_mandi2 = kagglehub.dataset_download("anshtanwar/current-daily-price-of-various-commodities-india")
csv_mandi2 = os.path.join(dir_mandi2, "Price_Agriculture_commodities_Week.csv")
print(f"      1. Daily Commodity Prices (23k)  : {csv_mandi2}")

dir_rec = kagglehub.dataset_download("madhuraatmarambhagat/crop-recommendation-dataset")
csv_rec = os.path.join(dir_rec, "Crop_recommendation.csv")
print(f"      2. Soil Sensor NPK/pH CSV        : {csv_rec}")

dir_yld = kagglehub.dataset_download("akshatgupta7/crop-yield-in-indian-states-dataset")
csv_yld = os.path.join(dir_yld, "crop_yield.csv")
print(f"      3. Indian States Harvest Yields  : {csv_yld}")

# 2. Parse Daily Commodity Prices (anshtanwar: 23,093 rows, 224 commodities)
print("\n[2/5] Parsing Daily Commodity Mandi Prices (23,093 records)...")
daily_mandi_prices = defaultdict(list)
daily_rows = 0

COMMODITY_ALIASES_DAILY = {
    "potato": "Potato", "onion": "Onion", "wheat": "Wheat", "tomato": "Tomato",
    "rice": "Rice", "paddy(dhan)(common)": "Rice", "banana": "Banana",
    "banana - green": "Banana", "apple": "Apple", "mango": "Mango",
    "bengal gram(gram)(whole)": "Chickpea", "gram raw(chholia)": "Chickpea", "kabuli chana(chickpeas-white)": "Chickpea",
    "maize": "Maize", "pomegranate": "Pomegranate", "mustard": "Mustard",
    "garlic": "Garlic", "ginger(green)": "Ginger", "green chilli": "Dry Chillies",
    "papaya": "Papaya", "watermelon": "Watermelon", "grapes": "Grapes",
    "orange": "Orange", "black pepper": "Black pepper", "coriander(leaves)": "Coriander",
    "cotton": "Cotton", "soyabean": "Soybean", "groundnut": "Groundnut",
    "black gram (urd beans)(whole)": "Black Gram", "black gram dal (urd dal)": "Black Gram",
    "urad (black gram)(whole)": "Black Gram", "urad": "Black Gram",
    "green gram (moong)(whole)": "Green Gram", "green gram dal (moong dal)": "Green Gram",
    "moong(green gram)(whole)": "Green Gram", "moong": "Green Gram",
    "arhar (tur/red gram)(whole)": "Pigeon Pea", "arhar dal(tur dal)": "Pigeon Pea", "pegeon pea (arhar fali)": "Pigeon Pea",
    "lentil (masur)(whole)": "Red Lentil", "masur dal": "Red Lentil", "masur(whole)": "Red Lentil",
    "cowpea (lobia/karamani)": "Cowpea", "cowpea(veg)": "Cowpea",
    "kulthi(horse gram)": "Horse-gram",
    "peas(dry)": "Peas & Beans", "field pea": "Peas & Beans", "white peas": "Peas & Beans", "green peas": "Peas & Beans",
    "turmeric": "Turmeric", "bajra(pearl millet/cumbu)": "Bajra",
    "sweet potato": "Sweet Potato", "tapioca": "Tapioca", "cardamoms": "Cardamom",
}

with open(csv_mandi2, newline="", encoding="utf-8", errors="replace") as fp:
    reader = csv.DictReader(fp)
    for r in reader:
        daily_rows += 1
        raw_comm = r.get("Commodity", "").strip().lower()
        std_name = COMMODITY_ALIASES_DAILY.get(raw_comm)
        if not std_name:
            # Check partial match
            for alias, target in COMMODITY_ALIASES_DAILY.items():
                if alias in raw_comm:
                    std_name = target
                    break
        if not std_name: continue
        try:
            modal = float(r.get("Modal Price", 0) or 0)
            if 50 < modal < 500000:
                daily_mandi_prices[std_name].append(modal)
        except ValueError: pass

print(f"      Mapped daily market prices across {len(daily_mandi_prices)} crop categories.")

# Median modal price per crop (Rs/quintal -> Rs/kg)
combined_mandi_prices_kg = {}
combined_mandi_record_counts = {}

for c in daily_mandi_prices:
    all_quotes = daily_mandi_prices[c]
    if all_quotes:
        med_quintal = statistics.median(all_quotes)
        rs_kg = round(med_quintal / 100.0, 2)
        combined_mandi_prices_kg[c] = rs_kg
        combined_mandi_record_counts[c] = len(all_quotes)

print(f"      Calculated real Mandi prices for {len(combined_mandi_prices_kg)} crops:")
for c, p in sorted(combined_mandi_prices_kg.items(), key=lambda x: -combined_mandi_record_counts[x[0]])[:12]:
    print(f"        • {c:<12}: Rs. {p:>6.2f}/kg ({combined_mandi_record_counts[c]:,} quotes)")

# 4. Parse Soil Sensor NPK/pH Data (2,200 rows)
print("\n[3/5] Parsing Soil Sensor Recommendation Dataset (2,200 rows)...")
soil_sensor_data = defaultdict(lambda: {
    "N": [], "P": [], "K": [], "ph": [], "temperature": [], "humidity": [], "rainfall": []
})

with open(csv_rec, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        crop = r.get("label", "").strip().title()
        if not crop: continue
        try:
            soil_sensor_data[crop]["N"].append(float(r["N"]))
            soil_sensor_data[crop]["P"].append(float(r["P"]))
            soil_sensor_data[crop]["K"].append(float(r["K"]))
            soil_sensor_data[crop]["ph"].append(float(r["ph"]))
            soil_sensor_data[crop]["temperature"].append(float(r["temperature"]))
            soil_sensor_data[crop]["humidity"].append(float(r["humidity"]))
            soil_sensor_data[crop]["rainfall"].append(float(r["rainfall"]))
        except ValueError: pass

# 5. Parse Indian States Harvest Yields (19,689 rows)
print("\n[4/5] Parsing Indian States Harvest Yields (19,689 rows)...")
yield_groups = defaultdict(lambda: {
    "yields": [], "rainfall": [], "fert_per_ha": [], "pest_per_ha": [],
    "seasons": set(), "states": defaultdict(int), "records": 0
})

SKIP_GENERIC = {
    "oilseeds total", "other cereals", "other kharif pulses",
    "other  rabi pulses", "other summer pulses", "other oilseeds"
}

with open(csv_yld, newline="", encoding="utf-8", errors="replace") as f:
    reader = csv.DictReader(f)
    for row in reader:
        crop_name = row.get("Crop", "").strip()
        if not crop_name or crop_name.lower() in SKIP_GENERIC: continue
        try:
            area = float(row.get("Area", 0) or 0)
            fert = float(row.get("Fertilizer", 0) or 0)
            pest = float(row.get("Pesticide", 0) or 0)
            rain = float(row.get("Annual_Rainfall", 0) or 0)
            yld  = float(row.get("Yield", 0) or 0)
            season = row.get("Season", "").strip()
            state  = row.get("State", "").strip()

            if yld <= 0 or rain <= 0: continue

            g = yield_groups[crop_name]
            g["yields"].append(yld)
            g["rainfall"].append(rain)
            if area > 0:
                g["fert_per_ha"].append(fert / area)
                g["pest_per_ha"].append(pest / area)
            if season:
                s = season.strip()
                if "Whole" in s: g["seasons"].update(["Kharif", "Rabi"])
                elif "Summer" in s: g["seasons"].add("Zaid")
                elif "Autumn" in s or "Kharif" in s: g["seasons"].add("Kharif")
                elif "Winter" in s or "Rabi" in s: g["seasons"].add("Rabi")
            if state: g["states"][state] += 1
            g["records"] += 1
        except Exception: continue

# 6. Unify Into 60 Agronomic Profiles
print("\n[5/5] Unifying 3 datasets into comprehensive profiles...")

ALIASES = {
    "Blackgram": "Black Gram", "Mungbean": "Green Gram", "Moong(Green Gram)": "Green Gram",
    "Urad": "Black Gram", "Arhar/Tur": "Pigeon Pea", "Pigeonpeas": "Pigeon Pea",
    "Gram": "Chickpea", "Cotton(lint)": "Cotton", "Rapeseed &Mustard": "Mustard",
    "Kidneybeans": "Kidney Bean", "Mothbeans": "Moth Bean", "Moth": "Moth Bean",
    "Masoor": "Red Lentil", "Lentil": "Red Lentil", "Soyabean": "Soybean",
    "Sweet potato": "Sweet Potato", "Peas & beans (Pulses)": "Peas & Beans",
    "Cowpea(Lobia)": "Cowpea",
}

LEGUMES = {
    "Green Gram", "Black Gram", "Pigeon Pea", "Chickpea", "Groundnut",
    "Cowpea", "Horse-gram", "Khesari", "Red Lentil", "Moth Bean",
    "Peas & Beans", "Soybean", "Sannhamp", "Kidney Bean", "Guar seed"
}

FAMILY_MAP = {
    "Rice": "Cereal", "Wheat": "Cereal", "Maize": "Cereal", "Bajra": "Cereal",
    "Jowar": "Cereal", "Ragi": "Cereal", "Barley": "Cereal", "Small millets": "Cereal",
    "Green Gram": "Legume", "Black Gram": "Legume", "Pigeon Pea": "Legume",
    "Chickpea": "Legume", "Groundnut": "Legume", "Cowpea": "Legume",
    "Horse-gram": "Legume", "Khesari": "Legume", "Red Lentil": "Legume",
    "Moth Bean": "Legume", "Peas & Beans": "Legume", "Soybean": "Legume",
    "Kidney Bean": "Legume", "Sannhamp": "Legume", "Guar seed": "Legume",
    "Sugarcane": "Commercial", "Cotton": "Commercial", "Jute": "Commercial",
    "Tobacco": "Commercial", "Castor seed": "Oilseed", "Sunflower": "Oilseed",
    "Sesamum": "Oilseed", "Mustard": "Oilseed", "Safflower": "Oilseed",
    "Linseed": "Oilseed", "Niger seed": "Oilseed", "Potato": "Vegetable",
    "Onion": "Vegetable", "Sweet Potato": "Vegetable", "Tapioca": "Vegetable",
    "Garlic": "Vegetable", "Banana": "Fruit", "Coconut": "Fruit",
    "Cashewnut": "Fruit", "Arecanut": "Fruit", "Apple": "Fruit", "Grapes": "Fruit",
    "Mango": "Fruit", "Orange": "Fruit", "Papaya": "Fruit", "Pomegranate": "Fruit",
    "Watermelon": "Fruit", "Muskmelon": "Fruit", "Coffee": "Commercial",
    "Dry Chillies": "Spices", "Ginger": "Spices", "Turmeric": "Spices",
    "Black pepper": "Spices", "Cardamom": "Spices", "Coriander": "Spices",
    "Tomato": "Solanaceae"
}

FALLBACK_PRICES = {
    "Sugarcane": 3.5, "Coconut": 20, "Sunflower": 50, "Sesamum": 110,
    "Bajra": 22, "Jowar": 26, "Ragi": 32, "Barley": 20, "Tobacco": 95,
    "Jute": 45, "Coffee": 200, "Cashewnut": 180, "Arecanut": 220,
    "Kidney Bean": 80, "Moth Bean": 60, "Cardamom": 1200, "Guar seed": 55
}

COST_PER_ACRE = {
    "Green Gram": 11000, "Black Gram": 10500, "Pigeon Pea": 12000, "Chickpea": 11000,
    "Groundnut": 18000, "Rice": 24000, "Wheat": 18000, "Maize": 19000, "Potato": 25000,
    "Sugarcane": 38000, "Cotton": 24000, "Soybean": 14000, "Mustard": 12000, "Onion": 22000,
    "Banana": 40000, "Coconut": 22000, "Sunflower": 13000, "Sesamum": 11000, "Dry Chillies": 28000,
    "Ginger": 35000, "Turmeric": 32000, "Garlic": 26000, "Tomato": 35000, "Bajra": 11000,
    "Jowar": 12000, "Ragi": 11000, "Barley": 12000, "Tobacco": 28000, "Jute": 16000,
    "Apple": 50000, "Grapes": 45000, "Mango": 20000, "Orange": 22000, "Papaya": 18000,
    "Pomegranate": 35000, "Watermelon": 15000, "Muskmelon": 14000, "Coffee": 30000,
    "Kidney Bean": 12000, "Red Lentil": 9500, "Moth Bean": 8500
}

def stat_summary(lst):
    if not lst: return {"median": 0, "mean": 0, "min": 0, "max": 0, "stdev": 0, "n": 0}
    return {
        "median": round(statistics.median(lst), 2),
        "mean":   round(statistics.mean(lst), 2),
        "min":    round(min(lst), 2),
        "max":    round(max(lst), 2),
        "stdev":  round(statistics.stdev(lst), 2) if len(lst) > 1 else 0,
        "n":      len(lst),
    }

all_crop_names = set()
for k in soil_sensor_data.keys(): all_crop_names.add(ALIASES.get(k, k))
for k in yield_groups.keys(): all_crop_names.add(ALIASES.get(k, k))
all_crop_names.add("Tomato")

crops_out = []
for name in sorted(all_crop_names):
    sensor_key = next((k for k in soil_sensor_data if ALIASES.get(k, k) == name), None)
    yield_key  = next((k for k in yield_groups if ALIASES.get(k, k) == name), None)

    s_data = soil_sensor_data[sensor_key] if sensor_key else None
    y_data = yield_groups[yield_key] if yield_key else None

    family = FAMILY_MAP.get(name, "Other")
    is_n_fixer = name in LEGUMES or family == "Legume"

    # Soil NPK from sensor dataset or fertilizer mapping
    if s_data and s_data["N"]:
        n_stat = stat_summary(s_data["N"])
        p_stat = stat_summary(s_data["P"])
        k_stat = stat_summary(s_data["K"])
        ph_stat = stat_summary(s_data["ph"])
        t_stat = stat_summary(s_data["temperature"])
        h_stat = stat_summary(s_data["humidity"])
        n_demand = n_stat["median"]
        p_demand = p_stat["median"]
        k_demand = k_stat["median"]
        ideal_ph_min = round(max(4.5, ph_stat["mean"] - 0.75), 1)
        ideal_ph_max = round(min(9.0, ph_stat["mean"] + 0.75), 1)
        avg_temp = t_stat["mean"]
        avg_hum = h_stat["mean"]
        sensor_records = len(s_data["N"])
        crop_stats = {
            "N": {"mean": n_stat["mean"], "stdev": n_stat["stdev"], "median": n_stat["median"]},
            "P": {"mean": p_stat["mean"], "stdev": p_stat["stdev"], "median": p_stat["median"]},
            "K": {"mean": k_stat["mean"], "stdev": k_stat["stdev"], "median": k_stat["median"]}
        }
    else:
        f_stat = stat_summary(y_data["fert_per_ha"]) if y_data else {"median": 120.0}
        med_fert = f_stat["median"] if f_stat["median"] > 0 else 120.0
        if is_n_fixer:
            n_demand = round(min(med_fert * 0.20, 25.0), 1)
            p_demand = round(med_fert * 0.35, 1)
            k_demand = round(med_fert * 0.30, 1)
            ideal_ph_min, ideal_ph_max = 6.0, 7.5
        elif family == "Cereal":
            n_demand = round(med_fert * 0.50, 1)
            p_demand = round(med_fert * 0.25, 1)
            k_demand = round(med_fert * 0.25, 1)
            ideal_ph_min, ideal_ph_max = 5.8, 7.2
        else:
            n_demand = round(med_fert * 0.40, 1)
            p_demand = round(med_fert * 0.30, 1)
            k_demand = round(med_fert * 0.30, 1)
            ideal_ph_min, ideal_ph_max = 6.0, 7.2
        avg_temp, avg_hum = 26.5, 70.0
        sensor_records = 0
        crop_stats = {
            "N": {"mean": n_demand, "stdev": round(max(5.0, n_demand * 0.20), 2), "median": n_demand},
            "P": {"mean": p_demand, "stdev": round(max(3.0, p_demand * 0.20), 2), "median": p_demand},
            "K": {"mean": k_demand, "stdev": round(max(3.0, k_demand * 0.20), 2), "median": k_demand}
        }

    # Yield and production from Indian state harvest dataset
    if y_data and y_data["yields"]:
        y_stat = stat_summary(y_data["yields"])
        r_stat = stat_summary(y_data["rainfall"])
        p_stat = stat_summary(y_data["pest_per_ha"])
        yield_kg_acre = round(y_stat["median"] * 404.686, 1)
        # Robust yield standard deviation (filtering out extreme reporting outliers)
        valid_yields = [y for y in y_data["yields"] if y <= y_stat["median"] * 3.5]
        if len(valid_yields) > 1:
            raw_std = statistics.stdev(valid_yields) * 404.686
        else:
            raw_std = yield_kg_acre * 0.20
        yield_stdev_kg_acre = round(max(yield_kg_acre * 0.12, min(raw_std, yield_kg_acre * 0.35)), 1)
        yield_mean_kg_acre = round(y_stat["mean"] * 404.686, 1)
        avg_rain = r_stat["median"]
        med_pest = p_stat["median"]
        risk_index = round(min(max(med_pest * 40.0, 18.0), 70.0), 1)
        seasons_list = sorted(list(y_data["seasons"])) if y_data["seasons"] else ["Kharif"]
        top_states = [st for st, _ in sorted(y_data["states"].items(), key=lambda x: -x[1])[:4]]
        yield_records = len(y_data["yields"])
    else:
        yield_kg_acre = 1200.0 if family == "Cereal" else 550.0 if is_n_fixer else 4000.0
        yield_mean_kg_acre = yield_kg_acre
        yield_stdev_kg_acre = round(yield_kg_acre * 0.20, 1)
        avg_rain = round(statistics.median(s_data["rainfall"]), 1) if s_data else 1000.0
        risk_index = 30.0
        seasons_list = ["Kharif", "Rabi"]
        top_states = ["All India"]
        yield_records = 0

    crop_stats["yield"] = {
        "mean": yield_mean_kg_acre,
        "stdev": yield_stdev_kg_acre,
        "median": yield_kg_acre,
        "low": round(max(0, yield_kg_acre - yield_stdev_kg_acre), 1),
        "high": round(yield_kg_acre + yield_stdev_kg_acre, 1)
    }

    # Market Price: median modal price from the daily APMC mandi quotes
    mandi_records_count = combined_mandi_record_counts.get(name, 0)
    if name in combined_mandi_prices_kg:
        mkt_price = combined_mandi_prices_kg[name]
    else:
        mkt_price = FALLBACK_PRICES.get(name, 35)

    if avg_rain >= 1600: water_req = "High"
    elif avg_rain >= 900: water_req = "Medium"
    else: water_req = "Low"

    total_records = sensor_records + yield_records + mandi_records_count

    data_sources = []
    if mandi_records_count > 0:
        data_sources.append(f"indian-mandi-prices ({mandi_records_count:,} trades)")
    if sensor_records > 0:
        data_sources.append(f"crop-recommendation-dataset ({sensor_records:,} sensor rows)")
    if yield_records > 0:
        data_sources.append(f"crop-yield-in-indian-states ({yield_records:,} harvest rows)")

    crops_out.append({
        "crop_id":              len(crops_out) + 1,
        "name":                 name,
        "crop_family":          family,
        "is_nitrogen_fixer":    is_n_fixer,
        "growth_duration_days": 110 if family == "Cereal" else 75 if is_n_fixer else 120,
        "water_requirement":    water_req,
        "ideal_ph_min":         ideal_ph_min,
        "ideal_ph_max":         ideal_ph_max,
        "n_demand":             n_demand,
        "p_demand":             p_demand,
        "k_demand":             k_demand,
        "stats":                crop_stats,
        "avg_yield_per_acre":   yield_kg_acre,
        "avg_market_price":     mkt_price,
        "avg_cultivation_cost": COST_PER_ACRE.get(name, 16000),
        "disease_risk_index":   risk_index,
        "suitable_seasons":     seasons_list,
        "avg_temperature_c":    round(avg_temp, 1),
        "avg_humidity_pct":     round(avg_hum, 1),
        "avg_rainfall_mm":      round(avg_rain, 1),
        "top_states":           top_states,
        "total_records":        total_records,
        "data_sources":         data_sources,
    })

crops_out.sort(key=lambda c: c["name"])
for i, c in enumerate(crops_out, start=1):
    c["crop_id"] = i

print(f"\nWriting {len(crops_out)} unified crops to backend/data/kaggle_crops.js...")
output_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "data", "kaggle_crops.js")
js_content = f"""// ============================================================
// kaggle_crops.js — Unified Tri-Source Kaggle Agronomy Model
// Datasets merged:
//   1. anshtanwar/current-daily-price-of-various-commodities-india (23,093 rows)
//   2. madhuraatmarambhagat/crop-recommendation-dataset (2,200 rows)
//   3. akshatgupta7/crop-yield-in-indian-states-dataset (19,689 rows)
// Total empirical records analyzed: 44,982 | Unique crops: {len(crops_out)}
// Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
// ============================================================

const kaggleCrops = {json.dumps(crops_out, indent=2)};

module.exports = {{ kaggleCrops }};
"""

with open(output_file, "w", encoding="utf-8") as fp:
    fp.write(js_content)

print(f"      Saved to: {output_file}")
print("\n" + "=" * 75)
print(f"  SUCCESS: {len(crops_out)} Crops Enriched from 44,982 Empirical Records!")
print("=" * 75)

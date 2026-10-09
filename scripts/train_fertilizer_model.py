"""
train_fertilizer_model.py
=============================================================
Trains and compiles a Kaggle-compatible Fertilizer Recommendation Model.
Features:
  - Temparature, Humidity, Moisture, Soil Type, Crop Type, Nitrogen, Potassium, Phosphorous
Outputs:
  - backend/models/uzhavu_fertilizer_model.joblib
  - backend/models/uzhavu_fertilizer_model_compiled.json (pure JS runtime format)
=============================================================
"""

import os
import json
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import _tree

# Canonical Kaggle Fertilizer Recommendation Dataset Patterns
DATA = [
    # Temp, Hum, Moist, Soil, Crop, N, K, P, Fertilizer
    (26, 52, 38, "Sandy", "Maize", 37, 0, 0, "Urea"),
    (29, 52, 45, "Loamy", "Sugarcane", 12, 10, 13, "Urea"),
    (34, 65, 62, "Black", "Cotton", 7, 9, 30, "DAP"),
    (32, 62, 34, "Red", "Tobacco", 22, 0, 20, "14-35-14"),
    (28, 54, 46, "Clayey", "Paddy", 35, 0, 0, "Urea"),
    (26, 52, 35, "Sandy", "Barley", 12, 10, 13, "Urea"),
    (25, 50, 64, "Red", "Wheat", 9, 13, 22, "28-28-0"),
    (33, 64, 50, "Black", "Millets", 41, 0, 0, "Urea"),
    (30, 60, 42, "Sandy", "Oil seeds", 21, 9, 14, "17-17-17"),
    (27, 54, 28, "Black", "Pulses", 13, 0, 40, "DAP"),
    (28, 54, 40, "Red", "Groundnut", 24, 0, 39, "DAP"),
    (31, 62, 48, "Clayey", "Paddy", 14, 15, 12, "Urea"),
    (30, 60, 32, "Loamy", "Sugarcane", 4, 17, 16, "10-26-26"),
    (27, 54, 28, "Sandy", "Maize", 13, 0, 25, "14-35-14"),
    (25, 50, 39, "Clayey", "Wheat", 21, 0, 29, "28-28-0"),
    (32, 62, 34, "Black", "Cotton", 22, 0, 20, "14-35-14"),
    (31, 62, 49, "Loamy", "Sugarcane", 10, 13, 14, "Urea"),
    (29, 58, 33, "Red", "Groundnut", 15, 0, 42, "DAP"),
    (28, 54, 38, "Clayey", "Paddy", 39, 0, 0, "Urea"),
    (34, 65, 54, "Black", "Cotton", 13, 0, 36, "DAP"),
    (29, 58, 44, "Sandy", "Barley", 12, 10, 13, "Urea"),
    (32, 62, 30, "Loamy", "Sugarcane", 12, 10, 13, "Urea"),
    (33, 64, 41, "Black", "Millets", 11, 0, 38, "DAP"),
    (28, 54, 37, "Red", "Wheat", 36, 0, 0, "Urea"),
    (30, 60, 30, "Sandy", "Oil seeds", 13, 0, 22, "14-35-14"),
    (26, 52, 44, "Black", "Pulses", 23, 0, 42, "DAP"),
    (31, 62, 53, "Red", "Groundnut", 12, 14, 12, "Urea"),
    (25, 50, 26, "Clayey", "Paddy", 15, 14, 11, "Urea"),
    (29, 58, 38, "Loamy", "Sugarcane", 37, 0, 0, "Urea"),
    (34, 65, 33, "Black", "Cotton", 8, 8, 32, "DAP"),
    (28, 54, 45, "Red", "Tobacco", 13, 0, 19, "14-35-14"),
    (30, 60, 35, "Clayey", "Paddy", 21, 0, 28, "28-28-0"),
    (27, 54, 28, "Sandy", "Maize", 39, 0, 0, "Urea"),
    (33, 64, 50, "Black", "Millets", 10, 13, 35, "DAP"),
    (26, 52, 36, "Red", "Wheat", 14, 15, 12, "Urea"),
    (32, 62, 34, "Sandy", "Oil seeds", 40, 0, 0, "Urea"),
    (28, 54, 30, "Black", "Pulses", 12, 10, 13, "Urea"),
    (30, 60, 42, "Red", "Groundnut", 11, 12, 39, "DAP"),
    (25, 50, 46, "Clayey", "Paddy", 24, 0, 18, "14-35-14"),
    (31, 62, 55, "Loamy", "Sugarcane", 38, 0, 0, "Urea"),
    (29, 58, 32, "Sandy", "Barley", 15, 14, 11, "Urea"),
    (34, 65, 48, "Black", "Cotton", 13, 0, 20, "14-35-14"),
    (27, 54, 30, "Red", "Tobacco", 22, 0, 29, "28-28-0"),
    (33, 64, 43, "Black", "Millets", 35, 0, 0, "Urea"),
    (28, 54, 39, "Clayey", "Wheat", 12, 10, 13, "Urea"),
    (30, 60, 33, "Sandy", "Oil seeds", 23, 0, 40, "DAP"),
    (26, 52, 31, "Black", "Pulses", 24, 0, 19, "14-35-14"),
    (32, 62, 45, "Red", "Groundnut", 39, 0, 0, "Urea"),
    (25, 50, 48, "Clayey", "Paddy", 10, 13, 35, "DAP"),
    (31, 62, 37, "Loamy", "Sugarcane", 12, 10, 13, "Urea"),
    (29, 58, 41, "Sandy", "Barley", 22, 0, 20, "14-35-14"),
    (34, 65, 60, "Black", "Cotton", 36, 0, 0, "Urea"),
    (28, 54, 35, "Red", "Tobacco", 37, 0, 0, "Urea"),
    (30, 60, 40, "Black", "Millets", 21, 0, 28, "28-28-0"),
    (27, 54, 33, "Clayey", "Wheat", 13, 0, 40, "DAP"),
    (33, 64, 46, "Sandy", "Oil seeds", 12, 10, 13, "Urea"),
    (26, 52, 29, "Black", "Pulses", 38, 0, 0, "Urea"),
    (32, 62, 38, "Red", "Groundnut", 13, 0, 20, "14-35-14"),
    (25, 50, 42, "Clayey", "Paddy", 41, 0, 0, "Urea"),
    (31, 62, 50, "Loamy", "Sugarcane", 14, 15, 12, "Urea"),
    (29, 58, 36, "Sandy", "Barley", 35, 0, 0, "Urea"),
    (34, 65, 52, "Black", "Cotton", 21, 0, 29, "28-28-0"),
    (28, 54, 31, "Red", "Tobacco", 12, 10, 13, "Urea"),
    (30, 60, 45, "Black", "Millets", 13, 0, 25, "14-35-14"),
    (27, 54, 35, "Clayey", "Wheat", 40, 0, 0, "Urea"),
    (33, 64, 39, "Sandy", "Oil seeds", 15, 14, 11, "Urea"),
    (26, 52, 33, "Black", "Pulses", 10, 13, 35, "DAP"),
    (32, 62, 40, "Red", "Groundnut", 22, 0, 29, "28-28-0"),
    (25, 50, 40, "Clayey", "Paddy", 12, 10, 13, "Urea"),
    (31, 62, 47, "Loamy", "Sugarcane", 21, 0, 28, "28-28-0"),
    (29, 58, 30, "Sandy", "Barley", 13, 0, 40, "DAP"),
    (34, 65, 49, "Black", "Cotton", 40, 0, 0, "Urea"),
    (28, 54, 36, "Red", "Tobacco", 10, 13, 35, "DAP"),
    (30, 60, 44, "Black", "Millets", 12, 10, 13, "Urea"),
    (27, 54, 32, "Clayey", "Wheat", 22, 0, 20, "14-35-14"),
    (33, 64, 48, "Sandy", "Oil seeds", 39, 0, 0, "Urea"),
    (26, 52, 38, "Black", "Pulses", 21, 0, 28, "28-28-0"),
    (32, 62, 42, "Red", "Groundnut", 35, 0, 0, "Urea"),
    (25, 50, 45, "Clayey", "Paddy", 36, 0, 0, "Urea"),
    (31, 62, 52, "Loamy", "Sugarcane", 13, 0, 40, "DAP"),
    (29, 58, 34, "Sandy", "Barley", 24, 0, 18, "14-35-14"),
    (34, 65, 58, "Black", "Cotton", 12, 10, 13, "Urea"),
    (28, 54, 42, "Red", "Tobacco", 21, 0, 28, "28-28-0"),
    (30, 60, 38, "Black", "Millets", 37, 0, 0, "Urea"),
    (27, 54, 29, "Clayey", "Wheat", 15, 14, 11, "Urea"),
    (33, 64, 52, "Sandy", "Oil seeds", 13, 0, 36, "DAP"),
    (26, 52, 35, "Black", "Pulses", 41, 0, 0, "Urea"),
    (32, 62, 46, "Red", "Groundnut", 10, 13, 35, "DAP"),
    (25, 50, 50, "Clayey", "Paddy", 13, 0, 25, "14-35-14"),
    (31, 62, 44, "Loamy", "Sugarcane", 22, 0, 20, "14-35-14"),
    (29, 58, 39, "Sandy", "Barley", 38, 0, 0, "Urea"),
    (34, 65, 55, "Black", "Cotton", 15, 14, 11, "Urea"),
    (28, 54, 33, "Red", "Tobacco", 36, 0, 0, "Urea"),
    (30, 60, 48, "Black", "Millets", 14, 15, 12, "Urea"),
    (27, 54, 37, "Clayey", "Wheat", 13, 0, 25, "14-35-14"),
    (33, 64, 45, "Sandy", "Oil seeds", 21, 0, 29, "28-28-0"),
    (26, 52, 30, "Black", "Pulses", 36, 0, 0, "Urea"),
    (32, 62, 50, "Red", "Groundnut", 14, 15, 12, "Urea"),
    (25, 50, 43, "Clayey", "Paddy", 22, 0, 29, "28-28-0"),
    (31, 62, 54, "Loamy", "Sugarcane", 35, 0, 0, "Urea"),
    # Additional representative mappings for Tomato, Cotton, Sugarcane, Maize
    (28, 60, 45, "Loamy", "Tomato", 35, 20, 25, "17-17-17"),
    (29, 65, 50, "Clayey", "Tomato", 15, 10, 35, "DAP"),
    (30, 55, 40, "Red", "Tomato", 45, 10, 15, "Urea"),
    (27, 50, 35, "Sandy", "Tomato", 20, 30, 20, "10-26-26"),
]

def main():
    soil_types = sorted(list(set([row[3] for row in DATA])))
    crop_types = sorted(list(set([row[4] for row in DATA])))
    fertilizers = sorted(list(set([row[8] for row in DATA])))

    soil_le = {s: i for i, s in enumerate(soil_types)}
    crop_le = {c: i for i, c in enumerate(crop_types)}
    fert_le = {f: i for i, f in enumerate(fertilizers)}

    X = []
    y = []
    for row in DATA:
        # Features: [temperature, humidity, moisture, soil_code, crop_code, n, k, p]
        feat = [
            float(row[0]),
            float(row[1]),
            float(row[2]),
            float(soil_le[row[3]]),
            float(crop_le[row[4]]),
            float(row[5]),
            float(row[6]),
            float(row[7]),
        ]
        X.append(feat)
        y.append(fert_le[row[8]])

    X = np.array(X)
    y = np.array(y)

    print(f"Training RandomForestClassifier on {len(X)} samples with {len(fertilizers)} classes...")
    rf = RandomForestClassifier(n_estimators=50, max_depth=8, random_state=42)
    rf.fit(X, y)
    acc = rf.score(X, y)
    print(f"Training Accuracy: {acc*100:.1f}%")

    # Serialize joblib model
    os.makedirs("backend/models", exist_ok=True)
    joblib_path = "backend/models/uzhavu_fertilizer_model.joblib"
    joblib.dump({
        "model": rf,
        "soil_types": soil_types,
        "crop_types": crop_types,
        "fertilizers": fertilizers,
        "features": ["temperature", "humidity", "moisture", "soil_type", "crop_type", "n", "k", "p"]
    }, joblib_path)
    print(f"Saved joblib model to {joblib_path}")

    # Compile trees for pure JS runtime (zero python overhead in Node.js)
    compiled_trees = []
    for dt in rf.estimators_:
        t = dt.tree_
        tree_obj = {
            "l": t.children_left.tolist(),
            "r": t.children_right.tolist(),
            "f": t.feature.tolist(),
            "t": [round(float(th), 4) for th in t.threshold],
            "v": [v[0].tolist() for v in t.value]
        }
        compiled_trees.append(tree_obj)

    compiled_json = {
        "model_name": "Uzhavu-Fertilizer-Kaggle-RF",
        "classes": fertilizers,
        "soil_types": soil_types,
        "crop_types": crop_types,
        "feature_names": ["temperature", "humidity", "moisture", "soil_type", "crop_type", "n", "k", "p"],
        "trees": compiled_trees
    }

    json_path = "backend/models/uzhavu_fertilizer_model_compiled.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(compiled_json, f, separators=(',', ':'))
    print(f"Compiled model to {json_path} ({os.path.getsize(json_path):,} bytes)")

if __name__ == "__main__":
    main()

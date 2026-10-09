#!/usr/bin/env python3
"""
analyze_crop_model.py
============================================================
In-depth ML Model Inspection, Architecture Analysis, and Inference Runner
for 'uzhavu_crop_model.joblib' in Uzhavu Kaappaan.
============================================================
"""

import sys, os, types, argparse, joblib, numpy as np

# Mock Scikit-Learn modules dynamically to avoid any DLL/Scipy locks on Windows
class MockModule(types.ModuleType):
    def __getattr__(self, name):
        cls = type(name, (object,), {
            '__module__': self.__name__,
            '__init__': lambda self, *args, **kwargs: None,
            '__setstate__': lambda self, state: (
                self.__dict__.update(state) if isinstance(state, dict)
                else self.__dict__.update(state[1]) if isinstance(state, tuple) and len(state) > 1 and isinstance(state[1], dict)
                else setattr(self, '_state', state)
            )
        })
        setattr(self, name, cls)
        return cls

for m in ['sklearn', 'sklearn.base', 'sklearn.ensemble', 'sklearn.ensemble._forest', 'sklearn.tree', 'sklearn.tree._classes', 'sklearn.tree._tree']:
    if m not in sys.modules:
        sys.modules[m] = MockModule(m)

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uzhavu_crop_model.joblib")

def load_uzhavu_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    return joblib.load(MODEL_PATH)

def analyze_model():
    model_obj = load_uzhavu_model()
    features = model_obj.get("features", [])
    classes = model_obj.get("classes", [])
    rf = model_obj.get("model")
    estimators = getattr(rf, "estimators_", [])

    print("=" * 70)
    print("  UZHAVU KAAPPAAN: ML CROP MODEL ARCHITECTURE REPORT")
    print("=" * 70)
    print(f"File Path            : {MODEL_PATH}")
    print(f"File Size            : {os.path.getsize(MODEL_PATH) / (1024*1024):.2f} MB")
    print(f"Algorithm            : Random Forest Classifier (Ensemble of Decision Trees)")
    print(f"Total Decision Trees : {len(estimators)} trees")
    print(f"Input Feature Vector : {len(features)} variables")
    for idx, f in enumerate(features, 1):
        print(f"   [{idx}] {f}")
    
    print(f"\nTarget Predictors    : {len(classes)} Agronomic Crop Classes")
    for i in range(0, len(classes), 4):
        chunk = classes[i:i+4]
        print("   " + ", ".join(f"{c:<14}" for c in chunk))

    # Feature Importance (calculated from Gini impurity reductions across all 300 trees)
    print("\nFeature Importances:")
    importances = np.zeros(len(features), dtype=np.float64)
    for est in estimators:
        nodes = est.tree_.nodes
        for i in range(len(nodes)):
            f = nodes[i]['feature']
            if f >= 0 and f < len(features):
                # weight by impurity decrease
                importances[f] += float(nodes[i]['impurity'])
    if np.sum(importances) > 0:
        importances /= np.sum(importances)
        ranked = sorted(zip(features, importances), key=lambda x: x[1], reverse=True)
        for name, imp in ranked:
            bar = "#" * int(imp * 40)
            print(f"   {name:<12}: {imp*100:5.2f}% | {bar}")

    print("\n" + "=" * 70)

def predict_crop(n, p, k, temp, hum, ph, rain, top_k=5):
    model_obj = load_uzhavu_model()
    classes = model_obj.get("classes", [])
    estimators = model_obj.get("model").estimators_
    
    x = [n, p, k, temp, hum, ph, rain]
    accum = np.zeros(len(classes), dtype=np.float64)

    for est in estimators:
        nodes = est.tree_.nodes
        values = est.tree_.values
        idx = 0
        while nodes[idx]['left_child'] != -1:
            feat = nodes[idx]['feature']
            thresh = nodes[idx]['threshold']
            if x[feat] <= thresh:
                idx = nodes[idx]['left_child']
            else:
                idx = nodes[idx]['right_child']
        val = values[idx][0]
        prob = val / np.sum(val)
        accum += prob

    accum /= len(estimators)
    ranked = sorted([(classes[i], accum[i]) for i in range(len(classes))], key=lambda item: item[1], reverse=True)
    return ranked[:top_k]

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze or run inference on uzhavu_crop_model.joblib")
    parser.add_argument("--analyze", action="store_true", help="Print model architectural breakdown")
    parser.add_argument("--predict", action="store_true", help="Run ML crop prediction")
    parser.add_argument("--n", type=float, default=90.0, help="Nitrogen (mg/kg)")
    parser.add_argument("--p", type=float, default=42.0, help="Phosphorus (mg/kg)")
    parser.add_argument("--k", type=float, default=43.0, help="Potassium (mg/kg)")
    parser.add_argument("--temp", type=float, default=21.0, help="Temperature (°C)")
    parser.add_argument("--hum", type=float, default=82.0, help="Humidity (%%)")
    parser.add_argument("--ph", type=float, default=6.5, help="Soil pH")
    parser.add_argument("--rain", type=float, default=202.0, help="Rainfall (mm)")

    args = parser.parse_args()

    if args.predict:
        res = predict_crop(args.n, args.p, args.k, args.temp, args.hum, args.ph, args.rain)
        print(f"\n--- Prediction for Input [N={args.n}, P={args.p}, K={args.k}, Temp={args.temp}°C, Hum={args.hum}%, pH={args.ph}, Rain={args.rain}mm] ---")
        for rank, (crop, prob) in enumerate(res, 1):
            print(f" #{rank}: {crop.upper():<14} | Confidence: {prob*100:6.2f}%")
    else:
        analyze_model()

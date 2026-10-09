"""
test_fertilizer_feature.py — Automated Verification for Smart Fertilizer Feature
Tests:
1. GET /api/fertilizer/prices — price catalog verification, MRPs, sources
2. GET /api/fertilizer/crops-supported — supported crops & RDF profiles
3. GET /api/fertilizer/sensor-reading — ESP32 telemetry retrieval
4. POST /api/fertilizer/recommend — Agronomic STCR calculation + ML integration
5. POST /api/fertilizer/calculate-cost — Dynamic area cost recalculation
6. GET /api/fertilizer/history — History persistence
"""

import urllib.request
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:3000/api/fertilizer"

def test_api():
    print("==================================================")
    print("Testing Smart Fertilizer Recommendation Feature...")
    print("==================================================")

    # 1. Test Prices
    print("\n[1] Testing GET /api/fertilizer/prices ...")
    req = urllib.request.Request(f"{BASE_URL}/prices")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        data = json.loads(resp.read().decode('utf-8'))
        assert data.get('success') is True, "Failed success check"
        catalog = data.get('catalog', {})
        assert 'urea' in catalog, "Urea missing from catalog"
        assert 'dap' in catalog, "DAP missing from catalog"
        assert 'mop' in catalog, "MOP missing from catalog"
        assert 'ssp' in catalog, "SSP missing from catalog"
        urea = catalog['urea']
        assert urea['price_per_bag'] == 266.50, f"Urea price mismatch: {urea['price_per_bag']}"
        assert urea['bag_weight_kg'] == 45, f"Urea bag weight mismatch: {urea['bag_weight_kg']}"
        print(f"  ✓ Price catalog verified: {len(catalog)} fertilizers listed.")
        print(f"  ✓ Neem-Coated Urea: Rs {urea['price_per_bag']} / {urea['bag_weight_kg']}kg bag ({urea['price_type']})")

    # 2. Test Supported Crops
    print("\n[2] Testing GET /api/fertilizer/crops-supported ...")
    req = urllib.request.Request(f"{BASE_URL}/crops-supported")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode('utf-8'))
        assert data.get('success') is True
        crops = [c['name'] for c in data.get('crops', [])]
        for expected in ['Paddy', 'Maize', 'Sugarcane', 'Tomato', 'Groundnut', 'Cotton']:
            assert any(expected.lower() in c.lower() for c in crops), f"Crop {expected} missing in {crops}"
        print(f"  ✓ Supported crops verified: {crops}")

    # 3. Test Sensor Reading
    print("\n[3] Testing GET /api/fertilizer/sensor-reading ...")
    req = urllib.request.Request(f"{BASE_URL}/sensor-reading?farm_id=101")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode('utf-8'))
        assert data.get('success') is True
        print(f"  ✓ Sensor reading endpoint functional (device_id: {data.get('device_id')}, connected: {data.get('connected')})")

    # 4. Test Recommendation (Agronomic STCR + ML)
    print("\n[4] Testing POST /api/fertilizer/recommend ...")
    payload = {
        "farm_id": 101,
        "source": "sensor",
        "crop": "Paddy",
        "growth_stage": "Basal / Sowing",
        "soil_type": "Loamy Soil",
        "field_area": 2.5,
        "area_unit": "acres",
        "soil": {
            "nitrogen": 180,       # Low (<280)
            "phosphorus": 8,       # Low (<11)
            "potassium": 90,       # Low (<120)
            "ph": 6.5,
            "moisture": 42,
            "temperature": 28
        }
    }
    req = urllib.request.Request(
        f"{BASE_URL}/recommend",
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        res = json.loads(resp.read().decode('utf-8'))
        assert res.get('success') is True
        rec = res['data']
        assert 'Paddy' in rec['crop']
        assert rec['field_area_acres'] == 2.5
        
        # Check Soil Analysis
        diag = rec['soil_analysis']
        assert diag['nitrogen_status'] == 'Low', f"Expected Low, got {diag['nitrogen_status']}"
        assert diag['phosphorus_status'] == 'Low', f"Expected Low, got {diag['phosphorus_status']}"
        assert diag['potassium_status'] == 'Low', f"Expected Low, got {diag['potassium_status']}"
        print(f"  ✓ Soil Analysis: N={diag['nitrogen_status']}, P={diag['phosphorus_status']}, K={diag['potassium_status']}, pH={diag['ph_category']}")
        
        # Check Recommended Fertilizers
        recs = rec['recommended_fertilizers']
        assert len(recs) > 0, "Expected recommended fertilizers for depleted soil"
        rec_names = [r['fertilizer_name'] for r in recs]
        print(f"  ✓ Recommended Fertilizers: {rec_names}")
        for r in recs:
            print(f"    - {r['fertilizer_name']} ({r['grade']}): {r['recommended_dose_per_acre']} kg/acre -> Total: {r['total_field_kg']} kg ({r['bags_to_buy']} bags @ Rs {r['price_per_bag']}) = Rs {r['cost_inr']}")
            assert r['recommended_dose_per_acre'] > 0
            assert r['total_field_kg'] > 0
            assert r['bags_to_buy'] > 0
            assert r['cost_inr'] > 0

        # Check Cost Summary
        cost = rec['cost_summary']
        assert cost['total_estimated_cost_inr'] > 0
        print(f"  ✓ Cost Summary: Rs {cost['total_estimated_cost_inr']} across {cost['total_bags_to_purchase']} bags (Rs {cost['cost_per_acre_inr']}/acre)")

        # Check ML Insights (Kaggle RF model + Soil Cluster)
        ml = rec['ml_insights']
        assert ml is not None
        assert 'kaggle_fertilizer_prediction' in ml
        assert 'soil_profile_cluster' in ml
        kaggle_pred = ml['kaggle_fertilizer_prediction']
        print(f"  ✓ Kaggle ML Model Prediction: {kaggle_pred['suggested_category']} (Confidence: {kaggle_pred['confidence_pct']}%)")
        soil_cluster = ml['soil_profile_cluster']
        print(f"  ✓ KMeans Soil Cluster: {soil_cluster['cluster_name']}")

    # 5. Test Nutrient Adequate Scenario (Avoid Unnecessary Fertilizers)
    print("\n[5] Testing Adequate Soil Scenario (Phosphorus already High) ...")
    payload_high = {
        "farm_id": 101,
        "source": "manual",
        "crop": "Paddy",
        "growth_stage": "Basal / Sowing",
        "soil_type": "Loamy Soil",
        "field_area": 2.5,
        "area_unit": "acres",
        "soil": {
            "nitrogen": 180,       # Low (Needs N)
            "phosphorus": 35,      # High (>25 kg/ha) (Should NOT recommend DAP/SSP!)
            "potassium": 320,      # High (>280 kg/ha) (Should NOT recommend MOP!)
            "ph": 6.8,
            "moisture": 45,
            "temperature": 27
        }
    }
    req = urllib.request.Request(
        f"{BASE_URL}/recommend",
        data=json.dumps(payload_high).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        res = json.loads(resp.read().decode('utf-8'))
        recs = res['data']['recommended_fertilizers']
        rec_ids = [r['fertilizer_id'] for r in recs]
        print(f"  ✓ Resulting recommendations with High P & High K: {rec_ids}")
        assert 'dap' not in rec_ids and 'ssp' not in rec_ids, "DAP/SSP recommended when P was already high!"
        assert 'mop' not in rec_ids, "MOP recommended when K was already high!"
        print("  ✓ Correctly withheld redundant P and K fertilizers to avoid unnecessary expenditure.")

    # 6. Test Cost Recalculation
    print("\n[6] Testing Dynamic Area Recalculation ...")
    items = [
        {"id": "urea", "name": "Neem-Coated Urea", "total_kg_base": 100, "bag_weight_kg": 45, "price_per_bag": 266.50},
        {"id": "dap", "name": "DAP", "total_kg_base": 75, "bag_weight_kg": 50, "price_per_bag": 1350.00}
    ]
    calc_req = urllib.request.Request(
        f"{BASE_URL}/calculate-cost",
        data=json.dumps({"items": items, "area": 5.0, "original_area": 2.5}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(calc_req) as resp:
        assert resp.status == 200
        res = json.loads(resp.read().decode('utf-8'))
        assert res.get('success') is True
        assert res['items'][0]['total_kg'] == 200.0, "Urea didn't scale x2"
        assert res['items'][1]['total_kg'] == 150.0, "DAP didn't scale x2"
        print(f"  ✓ Scaled area from 2.5 to 5.0 acres: New Total Cost = Rs {res['total_cost_inr']}, Bags = {res['total_bags']}")

    # 7. Test History Persistence
    print("\n[7] Testing GET /api/fertilizer/history ...")
    req = urllib.request.Request(f"{BASE_URL}/history?farm_id=101")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode('utf-8'))
        assert data.get('success') is True
        assert len(data.get('history', [])) > 0, "History was empty"
        print(f"  ✓ Saved history verified: {len(data['history'])} records in in-memory database.")

    print("\n==================================================")
    print("ALL SMART FERTILIZER TESTS PASSED SUCCESSFULLY! ✓")
    print("==================================================")

if __name__ == '__main__':
    test_api()

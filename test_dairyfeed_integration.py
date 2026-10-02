import urllib.request
import json
import sys

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BASE = 'http://localhost:3000/api'

def test_api(name, path, method='GET', payload=None):
    url = f"{BASE}{path}"
    data = json.dumps(payload).encode('utf-8') if payload else None
    headers = {'Content-Type': 'application/json', 'User-Agent': 'TestClient/1.0'}
    req = urllib.request.Request(url, data=data, headers=headers)
    req.get_method = lambda: method
    with urllib.request.urlopen(req, timeout=10) as res:
        assert res.status == 200, f"Expected 200, got {res.status}"
        body = json.loads(res.read().decode('utf-8'))
        print(f"[PASS] {method} {path} -> {name}")
        return body

print("=" * 65)
print("UZHAVU KAAPPAAN — Dairy Feeder & Silage Quality Verification")
print("=" * 65)

# 1. Summary
summary = test_api("Silage Quality Summary Stats", "/dairyfeed/summary")
assert "total_samples" in summary
assert "quality_percentages" in summary
print(f"       Total Samples: {summary['total_samples']} | Avg Score: {summary['average_score']}/100")

# 2. History (Initially clean with 0 batches)
hist = test_api("Silage Batch Telemetry History", "/dairyfeed/history?page_size=5")
assert "items" in hist
print(f"       Loaded {len(hist['items'])} batches initially.")

# 3. New Test Submission (Live Real Test)
new_test = test_api("Submit Live Silage Screening", "/dairyfeed/test", method='POST', payload={
    "device_id": "DF02",
    "feed_type": "maize_silage",
    "farm_id": 101,
    "readings": {
        "ph": 4.10,
        "moisture_pct": 65.0,
        "sample_temp_c": 27.2,
        "ambient_temp_c": 26.0,
        "rgb": {"r": 145, "g": 140, "b": 52}
    },
    "mould_risk": "Low"
})
assert new_test["prediction"]["quality"] == "Good"
assert new_test["prediction"]["score"] >= 80
assert "advisory" in new_test and len(new_test["advisory"]["ta"]) > 10
print(f"       Evaluated Score: {new_test['prediction']['score']}/100 | Quality: {new_test['prediction']['quality']}")
print(f"       Tamil Advisory: {new_test['advisory']['ta'][:60]}...")

# 4. Cattle & Crop Rotation IFS Plan
cattle = test_api("IFS Cattle Feeding & Soil Loop Plan", "/dairyfeed/cattle-plan?farm_id=101&cows_count=5&rotation_crop=Maize&area_acres=4.5")
assert "silage_production" in cattle
assert "herd_feeding" in cattle
assert "economic_impact" in cattle
assert "soil_restorer_loop" in cattle
print(f"       Total Silage Yield: {cattle['silage_production']['total_silage_tonnes']} Tonnes")
print(f"       Daily Milk Gain: +{cattle['economic_impact']['daily_milk_gain_litres']} L/day (Extra Rev: ₹{cattle['economic_impact']['monthly_dairy_revenue_gain']:,}/mo)")
print(f"       Soil Restorer Return: {cattle['soil_restorer_loop']['seasonal_fym_tonnes']} Tonnes FYM, +{cattle['soil_restorer_loop']['recycled_nitrogen_kg']}kg N, +{cattle['soil_restorer_loop']['organic_carbon_boost_pct']}% Carbon")

print("=" * 65)
print("ALL 4 DAIRY FEED & SILAGE INTEGRATION TESTS PASSED (100%)!")
print("=" * 65)

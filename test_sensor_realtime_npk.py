import urllib.request
import json

BASE = 'http://localhost:3000/api'

def req(url, method='GET', body=None):
    data = json.dumps(body).encode('utf-8') if body else None
    headers = {'Content-Type': 'application/json'} if body else {}
    r = urllib.request.Request(f'{BASE}{url}', data=data, headers=headers)
    r.get_method = lambda: method
    with urllib.request.urlopen(r, timeout=5) as res:
        return json.loads(res.read().decode('utf-8'))

print("=== 1. Testing Direct Sensor Ingest (/api/soil-sensor/direct-feed) ===")
feed_payload = {
    'farm_id': 101,
    'device_id': 'Soil-Scout-01',
    'nitrogen': 130,
    'phosphorus': 48,
    'potassium': 95,
    'ph': 6.8,
    'soil_moisture': 36,
    'air_temperature': 28.2,
    'tds': 490,
    'light': 85
}
feed_res = req('/soil-sensor/direct-feed', 'POST', feed_payload)
assert feed_res['success'] is True, "Failed to ingest direct sensor telemetry"
assert feed_res['reading']['nitrogen'] == 130, "Nitrogen value mismatch"
assert feed_res['reading']['phosphorus'] == 48, "Phosphorus value mismatch"
assert feed_res['reading']['potassium'] == 95, "Potassium value mismatch"
print(f"[PASS] Direct Sensor Feed Ingested: {feed_res['reading']['nitrogen']}N : {feed_res['reading']['phosphorus']}P : {feed_res['reading']['potassium']}K kg/ha")
print(f"       Soil Health Score Computed: {feed_res['soil_health_score']} / 100")
print(f"       Top Predicted Crop from Sensor: {feed_res.get('top_predicted_crop')}")

print("\n=== 2. Testing Live Sensor Polling (/api/soil-sensor/latest) ===")
latest_res = req('/soil-sensor/latest?farm_id=101')
assert latest_res['connected'] is True, "Sensor should report connected"
assert latest_res['device_id'] == 'Soil-Scout-01', "Device ID mismatch"
assert latest_res['reading']['nitrogen'] == 130, "Latest reading N mismatch"
print(f"[PASS] Sensor Online: {latest_res['connected']} | Seconds ago: {latest_res['seconds_ago']}s | Device: {latest_res['device_id']}")

print("\n=== 3. Testing Dashboard Sensor Integration (/api/dashboard) ===")
dash_res = req('/dashboard?farm_id=101')
assert dash_res['sensor_data'] is not None, "Dashboard sensor_data should not be null"
assert dash_res['sensor_data']['nitrogen'] == 130, "Dashboard sensor_data nitrogen mismatch"
assert dash_res['sensor_data']['phosphorus'] == 48, "Dashboard sensor_data phosphorus mismatch"
assert dash_res['sensor_data']['potassium'] == 95, "Dashboard sensor_data potassium mismatch"
print(f"[PASS] Dashboard reflected direct sensor telemetry: {dash_res['sensor_data']['nitrogen']}N : {dash_res['sensor_data']['phosphorus']}P : {dash_res['sensor_data']['potassium']}K")

print("\n=== 4. Testing Live AI Crop Prediction from Sensor (/api/soil-sensor/predict) ===")
pred_res = req('/soil-sensor/predict?farm_id=101')
assert len(pred_res['predictions']) > 0, "No crop predictions returned"
print(f"[PASS] Predicted Top Crop: {pred_res['top_predicted_crop']} (Score: {pred_res['predictions'][0]['final_score']})")

print("\n>>> ALL REALTIME SENSOR NPK AND TELEMETRY TESTS PASSED SUCCESSFULLY! <<<")

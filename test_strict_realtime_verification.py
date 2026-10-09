import urllib.request
import urllib.error
import json
import time
import sys

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BASE = 'http://localhost:3000/api'
DEVICE_KEY = 'b2cd3ba3dca8ce14d6da53f323b802f759111246836157dc'

def api_call(path, method='GET', data=None, headers=None):
    url = f"{BASE}{path}"
    h = {'Content-Type': 'application/json'}
    if headers:
        h.update(headers)
    payload = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(url, data=payload, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            return res.status, json.loads(res.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode('utf-8')) if e.code in [400, 401, 403, 404, 500] else {}
        return e.code, body

print("=" * 70)
print("   STRICT REAL-TIME VS FAKE DATA TELEMETRY VERIFICATION SUITE")
print("=" * 70)

# STEP 1: Cold start / Hardware OFF test
print("\n[TEST 1] Verifying system behavior when hardware is OFF / idle...")
code, latest = api_call('/soil-sensor/latest?farm_id=101')
assert code == 200, f"Expected 200, got {code}"
assert latest['connected'] is False, f"Expected connected=False, got {latest['connected']}"
assert latest['reading'] is None, f"Expected reading=None, got {latest['reading']}"
assert latest['device_status'] == 'OFFLINE', f"Expected device_status=OFFLINE, got {latest['device_status']}"
print(f"  ✓ Sensor endpoint confirms: connected={latest['connected']}, device_status={latest['device_status']}, reading={latest['reading']}")

code, dash = api_call('/dashboard?farm_id=101')
assert code == 200
assert dash['sensor_data'] is None, f"Expected sensor_data=None when hardware is off, got {dash['sensor_data']}"
print(f"  ✓ Dashboard confirms: sensor_data={dash['sensor_data']} (NO FAKE TELEMETRY DISPLAYED)")

# STEP 2: Device Key Authentication & Security
print("\n[TEST 2] Verifying security: unauthenticated sensor push rejection...")
code, unauth_res = api_call('/soil-sensor/ingest', method='POST', data={'farm_id': 101, 'nitrogen': 100})
assert code == 401, f"Expected 401 Unauthorized without key, got {code}"
print(f"  ✓ Ingest endpoint strictly rejected unauthenticated push with HTTP {code}: {unauth_res.get('error')}")

# STEP 3: Real ESP32 Hardware Packet Ingest
print("\n[TEST 3] Simulating genuine ESP32 hardware packet transmission with valid key...")
real_hw_packet = {
    "farm_id": 101,
    "device_id": "ESP32-SoilScout-PROBE01",
    "nitrogen": 142.5,
    "phosphorus": 52.0,
    "potassium": 118.0,
    "ph": 6.85,
    "soil_moisture": 38.5,
    "air_temperature": 27.8,
    "air_humidity": 68.0,
    "tds": 510,
    "light": 82
}
code, ingest_res = api_call('/soil-sensor/ingest', method='POST', data=real_hw_packet, headers={'X-Device-Key': DEVICE_KEY})
assert code == 200, f"Expected 200, got {code}"
assert ingest_res['success'] is True
assert ingest_res['reading']['nitrogen'] == 142.5
assert ingest_res['reading']['phosphorus'] == 52.0
assert ingest_res['reading']['potassium'] == 118.0
print(f"  ✓ ESP32 packet accepted: {ingest_res['reading']['nitrogen']}N : {ingest_res['reading']['phosphorus']}P : {ingest_res['reading']['potassium']}K kg/ha")
print(f"    Computed Soil Health Score: {ingest_res['soil_health_score']} / 100")
print(f"    Realtime AI Crop Recommendation: {ingest_res['top_predicted_crop']}")

# STEP 4: Live Polling Verification
print("\n[TEST 4] Verifying live polling while hardware is transmitting...")
code, latest_live = api_call('/soil-sensor/latest?farm_id=101')
assert code == 200
assert latest_live['connected'] is True, f"Expected connected=True, got {latest_live['connected']}"
assert latest_live['device_status'] == 'ONLINE'
assert latest_live['reading'] is not None
assert latest_live['reading']['nitrogen'] == 142.5
assert latest_live['reading']['potassium'] == 118.0
assert latest_live['device_id'] == 'ESP32-SoilScout-PROBE01'
print(f"  ✓ /api/soil-sensor/latest confirms: ONLINE ({latest_live['seconds_ago']}s ago) | Device: {latest_live['device_id']}")

code, dash_live = api_call('/dashboard?farm_id=101')
assert code == 200
assert dash_live['sensor_data'] is not None, "Dashboard sensor_data should now be active"
assert dash_live['sensor_data']['is_live'] is True
assert dash_live['sensor_data']['nitrogen'] == 142.5
assert dash_live['sensor_data']['temperature'] == 27.8
print(f"  ✓ Dashboard confirms live sensor data active: N={dash_live['sensor_data']['nitrogen']}, Temp={dash_live['sensor_data']['temperature']}°C")

# STEP 5: Timeout / Power OFF verification (15 second live window)
print("\n[TEST 5] Waiting 16 seconds to simulate hardware being turned OFF (no signal past 15s window)...")
time.sleep(16)

code, latest_expired = api_call('/soil-sensor/latest?farm_id=101')
assert code == 200
assert latest_expired['connected'] is False, f"Expected connected=False after timeout, got {latest_expired['connected']}"
assert latest_expired['device_status'] == 'OFFLINE', f"Expected OFFLINE, got {latest_expired['device_status']}"
assert latest_expired['reading'] is None, f"Expected reading=None after power off, got {latest_expired['reading']}"
print(f"  ✓ Sensor endpoint automatically reverted to: connected={latest_expired['connected']}, device_status={latest_expired['device_status']}, reading={latest_expired['reading']}")

code, dash_expired = api_call('/dashboard?farm_id=101')
assert code == 200
assert dash_expired['sensor_data'] is None, f"Dashboard sensor_data should be None when hardware is offline, got {dash_expired['sensor_data']}"
print(f"  ✓ Dashboard automatically cleared live telemetry: sensor_data={dash_expired['sensor_data']}")

print("\n" + "=" * 70)
print("   RESULT: ALL STRICT REAL-TIME TESTS PASSED (ZERO FAKE DATA)")
print("=" * 70)

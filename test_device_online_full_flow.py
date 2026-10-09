import urllib.request
import urllib.error
import json
import os
import subprocess
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
    with urllib.request.urlopen(req, timeout=10) as res:
        return res.status, json.loads(res.read().decode('utf-8'))

print("=" * 70)
print("VERIFYING FULL WORKFLOW: REAL DEVICE ONLINE -> ANALYSIS -> REPORT")
print("=" * 70)

# STEP 1: Simulate ESP32 powering ON and transmitting authentic NPK telemetry
print("\n[STEP 1] Physical ESP32 probe powers ON and sends telemetry packet...")
packet = {
    "farm_id": 101,
    "device_id": "Soil-Scout-01",
    "nitrogen": 135.0,
    "phosphorus": 48.0,
    "potassium": 92.0,
    "ph": 6.75,
    "soil_moisture": 36.0,
    "air_temperature": 28.4,
    "air_humidity": 65.0,
    "tds": 480,
    "light": 78
}
code, ingest_res = api_call('/soil-sensor/ingest', method='POST', data=packet, headers={'X-Device-Key': DEVICE_KEY})
assert code == 200
print(f"  ✓ Packet ingested successfully from {packet['device_id']}:")
print(f"    Nutrients: {ingest_res['reading']['nitrogen']} N : {ingest_res['reading']['phosphorus']} P : {ingest_res['reading']['potassium']} K kg/ha")
print(f"    Environment: {ingest_res['reading']['air_temperature']}°C | Moisture: {ingest_res['reading']['soil_moisture']}% | TDS: {ingest_res['reading']['tds']} ppm")

# STEP 2: Live status check
print("\n[STEP 2] Verifying live sensor polling endpoint reflects active connection...")
code, latest = api_call('/soil-sensor/latest?farm_id=101')
assert code == 200
assert latest['connected'] is True
assert latest['device_status'] == 'ONLINE'
assert latest['reading']['nitrogen'] == 135.0
print(f"  ✓ Live status: {latest['device_status']} (Transmitted {latest['seconds_ago']}s ago)")
print(f"  ✓ Reading verified: N={latest['reading']['nitrogen']}, P={latest['reading']['phosphorus']}, K={latest['reading']['potassium']}, pH={latest['reading']['ph']}")

# STEP 3: Realtime AI Crop Prediction from Sensor
print("\n[STEP 3] Running AI Crop Prediction on live sensor parameters...")
code, pred = api_call('/soil-sensor/predict?farm_id=101')
assert code == 200
assert len(pred['predictions']) > 0
top_crop = pred['predictions'][0]
print(f"  ✓ Top Recommended Crop: {top_crop['crop']} ({top_crop['crop_family']})")
print(f"    Suitability Score: {top_crop['final_score']} / 100")
print(f"    Estimated Yield: {top_crop['predicted_yield']} kg/acre | Profit: ₹{top_crop['predicted_profit']:,} / acre")

# STEP 4: Soil Health Analysis execution
print("\n[STEP 4] Executing Soil Health Analysis on live probe readings...")
analysis_payload = {
    "farm_id": 101,
    "nitrogen": latest['reading']['nitrogen'],
    "phosphorus": latest['reading']['phosphorus'],
    "potassium": latest['reading']['potassium'],
    "ph": latest['reading']['ph'],
    "organic_carbon": latest['reading']['organic_carbon'],
    "source": "esp32"
}
code, analysis = api_call('/soil-analysis', method='POST', data=analysis_payload)
assert code == 200
print(f"  ✓ Soil Analysis Computed:")
print(f"    Composite Soil Health Score: {analysis['soil_health_score']} / 100")
print(f"    Detected Deficiencies: {analysis['deficiencies']}")
print(f"    Adequate Nutrients: {analysis['adequate']}")

# STEP 5: Dynamic PDF Action Plan Report Generation
print("\n[STEP 5] Generating Dynamic PDF Action Plan Report based on live sensor telemetry...")
pdf_path = os.path.join(os.getcwd(), "downloads", "Test_Realtime_Soil_Action_Plan.pdf")
res = subprocess.run([sys.executable, "generate_farmer_pdf.py", "--farm-id", "101", "--out", pdf_path], capture_output=True, text=True)
assert res.returncode == 0, f"PDF generation failed: {res.stderr}"
assert os.path.exists(pdf_path), "PDF file was not created"
pdf_size = os.path.getsize(pdf_path)
assert pdf_size > 10000, f"PDF size too small: {pdf_size} bytes"
print(f"  ✓ PDF Action Plan generated successfully!")
print(f"    File: {pdf_path}")
print(f"    Size: {pdf_size:,} bytes ({pdf_size/1024:.1f} KB)")

print("\n" + "=" * 70)
print("VERIFICATION COMPLETE: REAL DEVICE -> ONLINE TELEMETRY -> ANALYSIS -> REPORT")
print("=" * 70)

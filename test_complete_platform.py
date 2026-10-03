# ============================================================
# test_complete_platform.py
# End-to-End Comprehensive Verification of UZHAVU KAAPPAAN
# Tests Farmer Platform, B2B FPO Command Center, 6 RBAC Roles,
# Real-Time Telemetry Ingestion, and AI Agronomy Services
# ============================================================

import sys
import json
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:3000/api"
passed = 0
failed = 0

def test(name, url, method="GET", payload=None, headers=None, validator=None):
    global passed, failed
    req_headers = {"Content-Type": "application/json", "User-Agent": "HealthCheck/1.0"}
    if headers:
        req_headers.update(headers)
    
    data_bytes = json.dumps(payload).encode("utf-8") if payload else None
    req = urllib.request.Request(url, data=data_bytes, headers=req_headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            status = res.status
            body = res.read().decode("utf-8")
            data = json.loads(body) if body.startswith(("{", "[")) else body
            
            ok = True
            if validator:
                ok = validator(status, data)
            elif status not in (200, 201):
                ok = False
                        
            if ok:
                print(f"  [PASS] {name:<46} status={status}")
                passed += 1
                return data
            else:
                print(f"  [FAIL] {name:<46} status={status} response={str(data)[:60]}")
                failed += 1
                return None
    except urllib.error.HTTPError as e:
        status = e.code
        try:
            body = e.read().decode("utf-8")
            data = json.loads(body) if body.startswith(("{", "[")) else body
        except Exception:
            data = {}
        if validator and validator(status, data):
            print(f"  [PASS] {name:<46} status={status}")
            passed += 1
            return data
        else:
            print(f"  [FAIL] {name:<46} status={status} response={str(data)[:60]}")
            failed += 1
            return None
    except Exception as e:
        print(f"  [FAIL] {name:<46} Error: {str(e)[:60]}")
        failed += 1
        return None

print("\n" + "=" * 68)
print("  UZHAVU KAAPPAAN — MASTER END-TO-END HEALTH & INTEGRITY CHECK")
print("=" * 68)

print("\n[SECTION 1: B2B FPO COMMAND CENTER — 12 MODULES]")
test("1. Orgs Directory (GET /orgs)", f"{BASE_URL}/orgs", validator=lambda s, d: s == 200 and "organizations" in d)
test("2. Org Profile (GET /orgs/1)", f"{BASE_URL}/orgs/1", validator=lambda s, d: s == 200 and "name" in d and "metrics" in d)
test("3. Command Dashboard (GET /orgs/1/dashboard)", f"{BASE_URL}/orgs/1/dashboard", validator=lambda s, d: s == 200 and "metrics" in d and "soil_health_distribution" in d)
test("4. Members Roster (GET /orgs/1/members)", f"{BASE_URL}/orgs/1/members", validator=lambda s, d: s == 200 and "farmers" in d and "officers" in d)
test("5. Geographic Clusters (GET /orgs/1/clusters)", f"{BASE_URL}/orgs/1/clusters", validator=lambda s, d: s == 200 and "clusters" in d)
test("6. Enterprise Farms (GET /orgs/1/farms)", f"{BASE_URL}/orgs/1/farms", validator=lambda s, d: s == 200 and "farms" in d and len(d["farms"]) > 0)
test("7. Farm Drill-Down #101 (GET /orgs/1/farms/101)", f"{BASE_URL}/orgs/1/farms/101", validator=lambda s, d: s == 200 and d.get("farm_id") == 101)
test("8. Regional Soil (GET /orgs/1/soil)", f"{BASE_URL}/orgs/1/soil", validator=lambda s, d: s == 200 and "mean_nitrogen_kg_ha" in d and "regional_map" in d)
test("9. Crop Allocation (GET /orgs/1/crops)", f"{BASE_URL}/orgs/1/crops", validator=lambda s, d: s == 200 and "crop_distribution" in d and "growth_stages" in d)
test("10. Harvest Projections (GET /orgs/1/production)", f"{BASE_URL}/orgs/1/production", validator=lambda s, d: s == 200 and "procurement_schedule" in d)
test("11. IoT Fleet Telemetry (GET /orgs/1/sensors)", f"{BASE_URL}/orgs/1/sensors", validator=lambda s, d: s == 200 and "fleet_metrics" in d and "devices" in d)
test("12. IFS Dairy Silage (GET /orgs/1/ifs)", f"{BASE_URL}/orgs/1/ifs", validator=lambda s, d: s == 200 and "fodder_availability" in d and "silage_reserve" in d)
test("13. Action Center Alerts (GET /orgs/1/alerts)", f"{BASE_URL}/orgs/1/alerts", validator=lambda s, d: s == 200 and "alerts" in d)
test("14. Advisory Dispatch Log (GET /orgs/1/advisories)", f"{BASE_URL}/orgs/1/advisories", validator=lambda s, d: s == 200 and "advisories" in d)
test("15. Field Staff Tasks (GET /orgs/1/tasks)", f"{BASE_URL}/orgs/1/tasks", validator=lambda s, d: s == 200 and "tasks" in d)
test("16. Executive Reports (GET /orgs/1/reports)", f"{BASE_URL}/orgs/1/reports", validator=lambda s, d: s == 200 and "executive_summary" in d and "clusters" in d)
test("17. Org Settings (GET /orgs/1/settings)", f"{BASE_URL}/orgs/1/settings", validator=lambda s, d: s == 200 and "admin_name" in d)

print("\n[SECTION 2: ROLE-BASED ACCESS CONTROL (RBAC) — 6 PERSONAS]")
roles = [
    ("Farmer", "farmer", "Ramesh Kumar"),
    ("FPO Admin / CEO", "fpo_admin", "Dr. K. Swaminathan"),
    ("Operations Manager", "fpo_manager", "P. Selvan"),
    ("Senior Field Officer", "field_officer", "Anand Kumar"),
    ("Lead Agronomist", "agronomist", "Dr. Priya Balan"),
    ("IoT Fleet Engineer", "iot_technician", "Karthik Raja")
]
for label, r_code, expected_name in roles:
    test(f"Auth Login -> {label}", f"{BASE_URL}/auth/demo-login", method="POST", payload={"role": r_code},
         validator=lambda s, d, en=expected_name: s == 200 and d.get("user", {}).get("name") == en)

print("\n[SECTION 2B: GOOGLE MAIL CLOUD AUTHENTICATION (SUPABASE LIVE SYNC)]")
test("Google Auth Config Endpoint", f"{BASE_URL}/auth/google/config",
     validator=lambda s, d: s == 200 and "google_client_id" in d and (d.get("cloud_active") is True or d.get("cloud_sync") is True))
test("Google Mail Send Verification Code (Real OTP)", f"{BASE_URL}/auth/google/send-code", method="POST",
     payload={"email": "thichu683@gmail.com", "role": "farmer", "name": "Thichu"},
     validator=lambda s, d: s == 200 and d.get("success") is True and "email" in d)
test("Google Mail Verify Code (Reject Invalid OTP)", f"{BASE_URL}/auth/google/verify-code", method="POST",
     payload={"email": "thichu683@gmail.com", "code": "000000", "role": "farmer"},
     validator=lambda s, d: s == 400 and "error" in d)
test("Google Mail Login (Farmer) + Cloud Sync", f"{BASE_URL}/auth/google", method="POST",
     payload={
         "email": "farmer.google.cloud@gmail.com",
         "name": "Ramesh Google Cloud",
         "google_id": "goog-cloud-farm-101",
         "role": "farmer"
     },
     validator=lambda s, d: s == 200 and d.get("success") is True and d.get("cloud_synced") is True and ("access_token" in d or "token" in d) and d.get("user", {}).get("email") == "farmer.google.cloud@gmail.com")
test("Google Mail Login (FPO Executive) + Cloud Sync", f"{BASE_URL}/auth/google", method="POST",
     payload={
         "email": "fpo.director.cloud@gmail.com",
         "name": "Dr. Swaminathan Cloud",
         "google_id": "goog-cloud-fpo-102",
         "role": "fpo_admin"
     },
     validator=lambda s, d: s == 200 and d.get("success") is True and d.get("cloud_synced") is True and d.get("user", {}).get("role") == "fpo_admin")

print("\n[SECTION 3: REAL-TIME IOT TELEMETRY & HARDWARE INGESTION]")
realtime_payload = {
    "farm_id": 101,
    "device_id": "ESP32-SOIL-101",
    "nitrogen": 88,
    "phosphorus": 52,
    "potassium": 64,
    "ph": 6.8,
    "organic_carbon": 0.85,
    "soil_moisture": 58,
    "air_temperature": 29.0,
    "air_humidity": 65
}
test("Push Live ESP32 Telemetry Packet", f"{BASE_URL}/orgs/1/sensors/simulate-reading", method="POST", payload=realtime_payload,
     validator=lambda s, d: s == 200 and d.get("success") == True and "reading" in d)
test("Verify Hardware Telemetry Latency", f"{BASE_URL}/orgs/1/sensors",
     validator=lambda s, d: s == 200 and len(d.get("devices", [])) > 0 and d["devices"][0].get("status") == "Online")

print("\n[SECTION 4: CORE FARMER EXPERIENCE — ZERO REGRESSION]")
test("Farmer Dashboard (farm 101)", f"{BASE_URL}/dashboard?farm_id=101", validator=lambda s, d: s == 200 and "farm" in d and "recommended_crop" in d)
test("Candidate Crops (Kharif)", f"{BASE_URL}/candidate-crops?farm_id=101&season=Kharif", validator=lambda s, d: s == 200 and len(d.get("candidates", [])) > 0)
test("Crop Evaluation Engine", f"{BASE_URL}/crop-evaluation", method="POST", payload={"farm_id": 101, "candidate_crop_ids": [48, 50, 44]}, validator=lambda s, d: s == 200 and "results" in d)
test("Rotation Optimizer API", f"{BASE_URL}/optimize-rotation", method="POST", payload={"farm_id": 101, "horizon_seasons": 3}, validator=lambda s, d: s == 200 and "plans" in d)
test("Recommendation Generator", f"{BASE_URL}/recommendation?farm_id=101", validator=lambda s, d: s == 200 and "rotation_plan" in d)
test("GPS Precision Agronomy Zones", f"{BASE_URL}/gps-zones?farm_id=101", validator=lambda s, d: s == 200 and "zones" in d)
test("Agro Weather Forecast", f"{BASE_URL}/weather?farm_id=101", validator=lambda s, d: s == 200 and ("current" in d or "forecast" in d or "temperature" in d))
test("Live Sensor Target (/soil-sensor/latest)", f"{BASE_URL}/soil-sensor/latest?farm_id=101", validator=lambda s, d: s == 200)

print("\n" + "=" * 68)
print(f"  TOTAL CHECKS: {passed + failed} | PASSED: {passed} | FAILED: {failed}")
print("=" * 68)

if failed == 0:
    print("  ALL SYSTEMS OPERATIONAL (100% PASS RATE). Zero regressions detected.\n")
    sys.exit(0)
else:
    print(f"  {failed} checks failed.\n")
    sys.exit(1)

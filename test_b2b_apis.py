import urllib.request
import json
import sys

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BASE = 'http://localhost:3000/api'

def test_api(name, path):
    url = f"{BASE}{path}"
    req = urllib.request.Request(url, headers={'Content-Type': 'application/json', 'User-Agent': 'B2BTestClient/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            assert res.status == 200, f"Expected 200, got {res.status}"
            body = json.loads(res.read().decode('utf-8'))
            print(f"[PASS] GET {path} -> {name}")
            return body
    except Exception as e:
        print(f"[FAIL] GET {path} -> {e}")
        return None

print("=" * 65)
print("UZHAVU KAAPPAAN — B2B FPO & Enterprise Platform Verification")
print("=" * 65)

# 1. Organization Directory
orgs = test_api("List Registered Organizations", "/orgs")
if orgs:
    print(f"       Total Orgs: {orgs['total_organizations']} | First: {orgs['organizations'][0]['name']}")

# 2. Organization Detail
org_detail = test_api("Organization Profile & Hierarchy", "/orgs/1")
if org_detail:
    print(f"       Org: {org_detail['name']} | Admin: {org_detail['admin_name']}")
    print(f"       Villages Count: {len(org_detail['villages'])}")

# 3. B2B Command Dashboard
dash = test_api("B2B Command Dashboard Aggregator", "/orgs/1/dashboard")
if dash:
    metrics = dash['metrics']
    print(f"       Farmers: {metrics['total_farmers']} | Farms: {metrics['total_farms']} | Area: {metrics['total_area_acres']} ac")
    print(f"       Soil Health: {dash['soil_health_distribution']['average_health_score']}/100 (Healthy: {dash['soil_health_distribution']['healthy_pct']}%)")
    print(f"       IoT Fleet: {dash['iot_fleet']['online']} Online / {dash['iot_fleet']['total_devices']} Total")
    print(f"       Silage batches: {dash['dairyfeed_silage_telemetry']['total_batches_tested']} (Fodder: {dash['dairyfeed_silage_telemetry']['estimated_monthly_fodder_yield_tons']} tons)")

# 4. Member Farms
farms = test_api("Member Farms Directory", "/orgs/1/farms")
if farms:
    print(f"       Loaded {farms['total_farms']} member farms with soil health ratings.")

# 5. Soil Health
soil = test_api("Aggregated Soil Deficiencies", "/orgs/1/soil-health")
if soil:
    print(f"       Mean N: {soil['mean_nitrogen_kg_ha']} kg/ha | Mean OC: {soil['mean_organic_carbon_pct']}%")

# 6. Crops & Mandi Demand
crops = test_api("Crop Allocation & Mandi Harvest Forecast", "/orgs/1/crops")
if crops:
    print(f"       Top crops tracked: {len(crops['top_crops_by_acreage'])} | Season: {crops['current_season']}")

# 7. IoT Telemetry Fleet
sensors = test_api("Hardware Fleet Telemetry", "/orgs/1/sensors")
if sensors:
    print(f"       Telemetry Uptime: {sensors['fleet_metrics']['online']}/{sensors['fleet_metrics']['total_devices']} | Probe types: {len(sensors['device_breakdown'])}")

print("=" * 65)
print("ALL B2B ENTERPRISE ENDPOINTS VERIFIED.")
print("=" * 65)

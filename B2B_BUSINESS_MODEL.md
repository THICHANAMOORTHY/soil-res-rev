# UZHAVU KAAPPAAN — B2B & FPO Enterprise Platform
## Master Product, Architectural & Business Specification

[![B2B Platform](https://img.shields.io/badge/Platform-B2B%20Agri--Intelligence-purple.svg?style=flat-square)](#)
[![Multi-Tenant](https://img.shields.io/badge/Architecture-Multi--Tenant%20RBAC-blue.svg?style=flat-square)](#3-organizational-hierarchy)
[![IFS Loop](https://img.shields.io/badge/Differentiator-Closed--Loop%20IFS-success.svg?style=flat-square)](#9-module-5--integrated-farming-system-ifs-intelligence)
[![API Suite](https://img.shields.io/badge/API-REST%20%2Fapi%2Forgs-orange.svg?style=flat-square)](#14-backend-api-structure)

---

## 1. 🌐 Platform Overview

**UZHAVU KAAPPAAN (உழவு காப்பான்) B2B** is an enterprise agricultural intelligence platform engineered for Farmer Producer Organizations (FPOs), Dairy Cooperatives, Agribusiness Corporates, and Government Agricultural Missions to manage thousands of farmers, farms, village clusters, soil parameters, livestock feed resources, and IoT sensor fleets from a centralized command center.

Instead of managing each farm in isolation, the platform enforces an end-to-end multi-tenant hierarchy:

$$\text{Organization} \longrightarrow \text{Cluster} \longrightarrow \text{Farm} \longrightarrow \text{Farmer} \longrightarrow \text{Field Data} \longrightarrow \text{IoT Telemetry}$$

The platform provides dual-altitude intelligence:
1. **Macro-Level Executive Intelligence**: Cluster-wide soil degradation trends, harvest volume projections, fleet uptimes, and collective mandi bargaining power.
2. **Micro-Level Field Drill-Down**: 1-click drill-down to any individual farmer's parcel, live sensor graph, soil analysis, and multi-season crop plan.

---

## 2. 👥 Who Uses the Platform? (Primary Customer Segments)

```
                          UZHAVU KAAPPAAN B2B
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
      A. FPO              B. DAIRY COOPERATIVE       C. AGRIBUSINESS
   FPO Leadership            Dairy Union Board        Corporate Agronomy
   Field Officers            Veterinary Team          Procurement Heads
```

### A. Farmer Producer Organizations (FPOs)
* **Key Users**: FPO CEO, General Manager, Board of Directors, Field Extension Officers, Certified Agronomists.
* **Core Purpose**:
  * Member registry and landholding verification.
  * Geospatial soil health monitoring across village clusters.
  * Collective crop rotation planning to break monoculture and reduce synthetic fertilizer costs.
  * Production aggregation for direct bulk mandi and institutional sales.
  * Coordinated bulk procurement of certified seeds, bio-fertilizers, and microbial amendments.
  * Instant broadcast advisories (SMS & WhatsApp) for weather shocks and pest outbreaks.

### B. Dairy Cooperatives & Milk Federations (e.g., Aavin, Amul Model)
* **Key Users**: Dairy Cooperative Manager, Veterinary Officers, Cattle Feed Nutritionists, Milk Collection Center Supervisors.
* **Core Purpose**:
  * Link crop rotation fodder acreage (Maize, Napier Grass, Sorghum, Cowpea) with daily herd feed demand.
  * Rapid IoT screening of silage fermentation pits (pH, core temp rise $\Delta T$, optical color) to prevent mould and spoilage.
  * Elimination of herd acidosis and lactation drops (preventing 15%–30% milk yield crashes).
  * Quantification of Farmyard Manure (FYM) recycled back to member soils for Organic Carbon restoration.

### C. Agribusinesses & Food Processors
* **Key Users**: Procurement Managers, Contract Farming Directors, Field Agronomists, Export Quality Officers.
* **Core Purpose**:
  * Outgrower farm network monitoring and field protocol compliance.
  * Forward production forecasting and weekly harvest volume estimates.
  * Pre-Harvest Interval (PHI) and Minimum Residue Limit (MRL) traceability for export compliance.
  * Transparent, non-biased agronomic recommendations (platform preserves strict algorithmic neutrality).

---

## 3. 🏢 Organizational Hierarchy

The multi-tenant backbone powers scalable multi-level operations:

```
ORGANIZATION (e.g. Kovai FPO / Aavin Dairy / Kisan Shakti)
│
├── Village Cluster 1 (e.g. Pollachi North — 420 Farmers, 1,850 Acres)
│   ├── Farm 001 (4.5 ac · Drip · Tomato / Maize · Soil Score: 78)
│   │   └── Farmer (Ramesh Kumar)
│   ├── Farm 002 (6.0 ac · Drip · Maize Silage · Soil Score: 81)
│   │   └── Farmer (Murugan P.)
│   └── Farm 003 (3.8 ac · Rainfed · Groundnut · Soil Score: 85)
│       └── Farmer (Selvi S.)
│
├── Village Cluster 2 (e.g. Sulur Belt — 380 Farmers, 1,640 Acres)
│   ├── Farm 004 (5.2 ac · Canal · Cotton · Soil Score: 52)
│   │   └── Farmer (V. Sundaram)
│   └── Farm 005 (4.0 ac · Drip · Black Gram · Soil Score: 68)
│       └── Farmer (Anitha K.)
│
└── Village Cluster 3 (e.g. Thondamuthur Foothills — 450 Farmers, 1,930 Acres)
    └── Member Farms & Farmers
```

### Every Farm Entity Contains
* **Location & Geofencing**: Latitude, longitude, survey number, micro-cluster ID.
* **Acreage & Irrigation**: Total area, arable area, irrigation type (Drip, Canal, Rainfed).
* **Soil Data**: N-P-K (kg/ha), pH, Organic Carbon (%), EC, and soil texture.
* **Crop Data & History**: Current crop, historical rotations, multi-season yield, and profit.
* **IoT Sensor Nodes**: Paired 7-in-1 RS485 soil nodes and DairyFeed silage probes.
* **Farm Activities & Advisories**: Scheduled fertigation, field sprays, and broadcast directives.

---

## 4. 📊 B2B Command Center Dashboard

The primary executive interface for organization leadership:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   KOVAI FPO — B2B COMMAND CENTER                       │
├────────────────────────────────────────────────────────────────────────┤
│  FARMERS           FARMS             ACREAGE          AVG FARM SIZE    │
│   1,250            1,180           5,420 Acres          4.59 Acres     │
│                                                                        │
│  VILLAGE CLUSTERS  IOT NODES ACTIVE  FLEET UPTIME     CRITICAL ALERTS  │
│        18            391 / 420         93.1% 🟢             27 ⚠️      │
└────────────────────────────────────────────────────────────────────────┘
```

The Command Center is divided into **6 Dedicated Intelligence Modules**.

---

## 5. 🚜 Module 1 — Farmer & Farm Management

Enables the organization to administer its agricultural footprint:
* **Member Registry**: KYC verification, land record numbers, mobile contacts.
* **Farm Holdings**: Boundary mapping, soil baseline records, irrigation infrastructure.
* **Cluster Management**: Grouping farms into contiguous village zones for logistics and aggregation.

### Member Farm Directory
| Farm ID | Farmer Name | Village Cluster | Acres | Current Crop | Soil Score | IoT Status | Action |
|---|---|---|---|---|---|---|---|
| **F001** | Ramesh Kumar | Pollachi North | 4.5 | Tomato | 58 🟡 | Online 🟢 | `[Inspect Farm →]` |
| **F002** | Murugan P. | Pollachi North | 6.0 | Maize Silage | 78 🟢 | Online 🟢 | `[Inspect Farm →]` |
| **F003** | Selvi S. | Pollachi North | 3.8 | Groundnut | 82 🟢 | Online 🟢 | `[Inspect Farm →]` |
| **F004** | V. Sundaram | Sulur Belt | 5.2 | Cotton | 52 🔴 | Online 🟢 | `[Inspect Farm →]` |
| **F005** | Anitha K. | Sulur Belt | 4.0 | Black Gram | 68 🟡 | Online 🟢 | `[Inspect Farm →]` |
| **F006** | K. Chinnasamy | Thondamuthur | 7.5 | Sugarcane | 48 🔴 | Offline 🔴 | `[Inspect Farm →]` |

*Clicking **Inspect Farm** instantly switches context to the single-farm dashboard, loading full NPK history, rotation curves, and sensor logs.*

---

## 6. 🧪 Module 2 — Soil Intelligence

A centralized, cluster-wide soil health telemetry and laboratory aggregation system.

### Organization-Level Soil Health Distribution
```
Healthy (Score 75–100)    █████████████ 42% (2,276 Acres)
Moderate (Score 50–74)    ███████████   38% (2,060 Acres)
Poor (Score < 50)         ██████        20% (1,084 Acres)
```

### Cluster Breakdown
* **Pollachi North**: **Healthy (81/100)** — Adequate Organic Carbon (1.15%), optimal pH (6.8).
* **Sulur Belt**: **Moderate (60/100)** — Widespread Nitrogen depletion (48 kg/ha avg).
* **Annur Semi-Arid**: **Healthy (74/100)** — Balanced N-P-K reserves.
* **Thondamuthur Foothills**: **Poor (48/100)** — Soil acidification (pH 5.2–5.6) from continuous monoculture.

### Agronomic Decision Flow
$$\text{Where is the soil problem?} \longrightarrow \text{Which farms are affected?} \longrightarrow \text{What corrective action is required?}$$

---

## 7. 🌾 Module 3 — Crop & Production Intelligence

Answers: *What crops are planted, in what quantities, and when will harvest reach the market?*

### Seasonal Crop Acreage Allocation (Kharif 2026)
```
Maize (Fodder & Grain)  1,200 Acres (22.1%) 🌽
Pulses (Restorative)      900 Acres (16.6%) 🫘
Sugarcane                 850 Acres (15.7%) 🎋
Tomato (Vegetables)       750 Acres (13.8%) 🍅
Groundnut (Oilseed)       620 Acres (11.4%) 🥜
Cotton / Other          1,100 Acres (20.3%) ☁️
```

### Production & Mandi Yield Forecast
| Crop | Cultivated Area | Expected Yield / Acre | Total Harvest Forecast | Mandi Benchmark (₹/q) | Forward Value |
|---|---|---|---|---|---|
| **Maize (Grain/Fodder)** | 1,200 ac | 7,500 kg | **9,000 Tons** | ₹2,250 / q | ₹20.25 Cr |
| **Tomato** | 750 ac | 8,000 kg | **6,000 Tons** | ₹1,800 / q | ₹10.80 Cr |
| **Sugarcane** | 850 ac | 35,000 kg | **29,750 Tons** | ₹3,150 / ton | ₹9.37 Cr |
| **Groundnut** | 620 ac | 1,600 kg | **992 Tons** | ₹6,800 / q | ₹6.74 Cr |
| **Pulses (Black/Green Gram)** | 900 ac | 950 kg | **855 Tons** | ₹7,400 / q | ₹6.32 Cr |

*Supports collective buyer contracting, cold storage reservations, processing agreements, and logistics pooling.*

---

## 8. 📡 Module 4 — IoT Fleet Management

A dedicated **IoT Command Center** monitoring deployed field hardware:

```
ESP32 Cloud Ingestion Pipeline
  │
  ├── RS485 Modbus Soil Probes (NPK, pH, Moisture, EC, Temp)
  ├── Dual-Node Silage Probes (DS18B20 Temp + Optical TCS3200 RGB + pH)
  └── Field Micro-Weather Stations (Rain, Wind, Solar Lux, Humidity)
```

### Fleet Status
* **Total Deployed Nodes**: 420
* **Online & Reporting**: 391 🟢 (93.1%)
* **Offline / Weak Signal**: 21 🔴 (5.0%)
* **Maintenance / Calibration Due**: 8 🟡 (1.9%)

### Monitored Device Telemetry
* Device ID (e.g. `SS-NODE-104`, `DF-PROBE-02`)
* Linked Farm & Farmer
* Hardware Model & Firmware Version (`v1.4.2`)
* Battery Level (%) & Solar Charging Voltage
* Signal Strength (RSSI in dBm)
* Sensor Drift & Annual Calibration Expiry Date

---

## 9. 🐄 Module 5 — Integrated Farming System (IFS) Intelligence

The **core differentiator** that sets UZHAVU KAAPPAAN apart from standard farm management software:

```
                       SOIL (N-P-K & pH Scoring)
                                  │
                                  ▼
                      CROP ROTATION OPTIMIZER
                   (Evaluates 60 empirical crops)
                                  │
                                  ▼
                      FODDER HARVEST BIOMASS
                      (Maize, Sorghum, Cowpea)
                                  │
                                  ▼
                      RAPID SILAGE FERMENTATION
                   (Tested via Dual-Node IoT Probes)
                                  │
                                  ▼
                      DAIRY HERD MILK BOOST
                    (+1.5 to 2.5 L/cow/day gain)
                                  │
                                  ▼
                      FARMYARD MANURE (FYM)
                     (Enriched cattle dung & urine)
                                  │
                                  ▼
                      SOIL CARBON RESTORATION
                   (+0.2% to +0.4% Organic Carbon)
                                  │
                                  └───────────────► [Repeats next season]
```

* **Silage Screening**: Monitors pH (ideal 3.8–4.4), core temperature rise $\Delta T$ (< 3.0°C), and olive-green optical RGB spectrum to prevent cattle mycotoxicosis.
* **Manure Nutrient Recycler**: Tracks FYM tonnage generated by member herds and calculates Nitrogen/Organic Carbon returned to fields.

---

## 10. ⚠️ Module 6 — Alerts & Action Center

A centralized triage center that categorizes agronomic and technical events:

* 🔴 **Critical Severity**: *Sulur Cluster — Low Nitrogen detected across 24 farms.*
* 🟠 **Warning Severity**: *Pollachi Cluster — Tomato harvest volume peaking in 10 days (620 tons expected).*
* 🟡 **Maintenance Alert**: *7 soil probes in Thondamuthur have not reported heartbeats for > 24 hours.*
* 🟢 **Agronomic Recommendation**: *18 member farms in Annur ready for restorative pulse rotation (Cowpea / Green Gram).*

### Action Center Workflow
$$\text{View Affected Farms} \longrightarrow \text{Generate Directive} \longrightarrow \text{Broadcast to Farmers}$$

---

## 11. 📲 Farmer Communication System

Connects the organization leadership directly with member farmers via multiple notification channels:

```
FPO ADMIN / AGRONOMIST
    │
    ├── Emergency Weather Shock Alerts (Heatwaves, Frost, Unseasonal Rain)
    ├── Crop Rotation Recommendations (Legume Transition Directives)
    ├── Silage Quality Directives (Pit Compaction, Inoculant Application)
    ├── Mandi Batch Delivery Schedules (Pickup Windows)
    └── Government Subsidy & Input Announcements
             │
             ▼
        DISPATCH CHANNELS
        ├── In-App Real-Time Alerts
        ├── SMS Broadcast (Regional Language / Tamil)
        ├── WhatsApp Automated Alerts & PDF Action Plans
        └── Automated Voice IVR
             │
             ▼
        MEMBER FARMERS
```

---

## 12. 🔍 Macro-to-Micro Farm Drill-Down

The platform allows leadership to navigate seamlessly from regional trends down to localized sensor pins:

$$\begin{aligned}
&\text{Kovai FPO (Organization)} \\
&\quad\longrightarrow\text{Sulur Cluster (Village Cluster)} \\
&\qquad\longrightarrow\text{24 Nitrogen-Depleted Holdings (Cluster Filter)} \\
&\quad\qquad\longrightarrow\text{Farm \#104 (Individual Farm)} \\
&\quad\qquad\quad\longrightarrow\text{V. Sundaram (Farmer)} \\
&\quad\qquad\quad\quad\longrightarrow\text{Field Parcel \#2 (4.0 ac)} \\
&\quad\qquad\quad\quad\quad\longrightarrow\text{Soil Test: 38 kg/ha N, pH 7.2} \\
&\quad\qquad\quad\quad\quad\quad\longrightarrow\text{IoT Sensor: SS-NODE-104 (Moisture 24\%)} \\
&\quad\qquad\quad\quad\quad\quad\quad\longrightarrow\text{Action: Dispatched Green Gram Rotation Advisory}
\end{aligned}$$

---

## 13. 🔐 Multi-Tenant Data Architecture

```
                    ┌───────────────────────────┐
                    │       organizations       │
                    ├───────────────────────────┤
                    │ org_id (PK)               │
                    │ name, org_type, region    │
                    │ license_tier, created_at  │
                    └─────────────┬─────────────┘
                                  │ 1:N
                                  ▼
                    ┌───────────────────────────┐
                    │       org_clusters        │
                    ├───────────────────────────┤
                    │ cluster_id (PK)           │
                    │ org_id (FK)               │
                    │ cluster_code, name, state │
                    └─────────────┬─────────────┘
                                  │ 1:N
                                  ▼
                    ┌───────────────────────────┐
                    │           farms           │
                    ├───────────────────────────┤
                    │ farm_id (PK)              │
                    │ org_id (FK), cluster_id   │
                    │ farmer_id (FK)            │
                    │ area_acres, irrigation    │
                    └─────────────┬─────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│    soil_data     │    │   crop_history   │    │   org_sensors    │
│ (NPK, pH, OC)    │    │ (Rotation paths) │    │ (IoT Telemetry)  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 14. 🔌 Backend API Structure (`/api/orgs/*`)

All enterprise endpoints are implemented in [`backend/routes/orgs.js`](file:///e:/HACK-2K26/backend/routes/orgs.js):

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orgs` | Lists all registered organizations, active farmers, acreage, and fleet online rate. |
| `GET` | `/api/orgs/:id` | Organization profile, executive admin contacts, and village cluster hierarchies. |
| `GET` | `/api/orgs/:id/dashboard` | **Command Center Aggregator**: KPIs, soil health distribution, crop split, and action alerts. |
| `GET` | `/api/orgs/:id/farms` | Directory of all member farms with farmer names, locations, acres, crops, and soil scores. |
| `GET` | `/api/orgs/:id/soil-health` | Aggregated soil N-P-K, pH, and Organic Carbon averages across the organization. |
| `GET` | `/api/orgs/:id/crops` | Macro crop distribution, harvest tonnage projections, and Mandi price benchmarks. |
| `GET` | `/api/orgs/:id/sensors` | Hardware fleet status: online/offline nodes, probe breakdown, and telemetry latency. |
| `POST` | `/api/orgs/:id/advisories` | Creates and queues a regional agronomic directive for broadcast dispatch. |

---

## 15. 🛡️ User Roles & Role-Based Access Control (RBAC)

```
Organization Admin (FPO Board & CEO)
        │
        ├── FPO Manager (Operations, Inputs, Procurement)
        │      ├── Field Extension Officers (Cluster Monitoring)
        │      └── Certified Agronomist (Soil & Rotation Plans)
        │
        └── IoT Fleet Technician (Sensors, Hardware & Gateway)

Farmer ──► Individual Farm Dashboard (Restricted to own parcel)
```

| Role | Permissions & Scope |
|---|---|
| **Organization Admin** | Full read/write access to all clusters, financial metrics, user management, and exports. |
| **FPO Manager** | Manages farmers, farms, input procurement, harvest aggregation, and commercial mandi sales. |
| **Field Officer** | Assigned specific village clusters; conducts ground verifications and field visits. |
| **Agronomist** | Reviews regional soil tests, approves crop rotation recommendations, and drafts advisories. |
| **IoT Technician** | Monitors sensor battery levels, signal drop-offs, device firmware, and sensor calibrations. |
| **Farmer** | Access restricted strictly to their own farm parcel, soil readings, and received advisories. |

---

## 16. 📈 Reports & Analytics Generator

The platform generates audit-grade PDF, CSV, and JSON reports:
* **FPO Monthly Executive Intelligence Report**: Member growth, aggregate soil recovery, expected harvest value.
* **Cluster Soil Degradation Audit**: Taluk-level NPK depletion trends for government soil subsidy programs.
* **Mandi Collective Tonnage Schedule**: Forward harvest volume calendar for corporate procurement negotiations.
* **Silage & Feed Security Certificate**: Quality audit for cooperative milk collection centers.
* **IoT Sensor Telemetry Log**: Device calibration proof and network uptime compliance.

---

## 17. 💼 Commercial Revenue Model

*(Proposed pricing models for commercial validation)*

```
                      MONETIZATION MODEL
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
TIERED SAAS             PER-ACRE / SEASON           IOT-AS-A-SERVICE
SUBSCRIPTION               LICENSING                HARDWARE BUNDLE
Starter Tier:           ₹15 – ₹30 / acre/season     Annual Hardware Lease:
Up to 250 farmers       Frictionless scaling with   Sensors + Gateway +
₹25,000 / year          active member acreage       Cloud Telemetry +
Professional Tier:                                  Annual Calibration
Up to 1,500 farmers
₹75,000 / year
Enterprise Tier:
State Federations
₹2,50,000+ / year
```

---

## 18. 🏛️ Complete Platform Architecture

```
                    UZHAVU KAAPPAAN
                           │
              ┌────────────┴────────────┐
              │                         │
        FARMER PLATFORM            B2B PLATFORM
              │                         │
        Individual Farm            Organization
              │                         │
        Farmer Dashboard          Command Center
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                 PEOPLE              FARMS              DATA
                    │                   │                   │
                Farmers             Clusters              Soil
                Officers            Farms                 Crops
                Managers            Fields                IoT Telemetry
                                                          Production
                    │                   │                   │
                    └───────────────────┼───────────────────┘
                                        │
                              INTELLIGENCE ENGINE
                     (7-Dimension Rotation Optimizer,
                   Kaggle Empirical Agronomy Models,
                    DairyFeed AI & Closed-Loop IFS)
```

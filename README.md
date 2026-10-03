# UZHAVU KAAPPAAN (உழவு காப்பான்)
### Smart Crop Rotation, Soil Restorer & Enterprise FPO Agronomy Platform

[![GitHub Repo](https://img.shields.io/badge/GitHub-THICHANAMOORTHY%2Fsoil--res--rev-181717?style=flat-square&logo=github)](https://github.com/THICHANAMOORTHY/soil-res-rev)
[![Platform Tests](https://img.shields.io/badge/Tests-38%2F38%20Passed%20(100%25)-success?style=flat-square&logo=checkmarx)](test_complete_platform.py)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-Supabase%20Postgres%20%2B%20In--Memory-3ECF8E?style=flat-square&logo=supabase)](supabase/schema.sql)
[![Datasets](https://img.shields.io/badge/Datasets-3%20Kaggle%20Sources%20%C2%B7%2044%2C982%20Records-blue.svg?style=flat-square&logo=kaggle)](#dataset-engineering)
[![Crops](https://img.shields.io/badge/Master%20Crops-60%20Varieties-emerald.svg?style=flat-square)](#the-60-master-crops)
[![RBAC](https://img.shields.io/badge/RBAC-6%20Personas%20%C2%B7%20Admin%20Guarded-purple.svg?style=flat-square)](#role-based-access-control-rbac)
[![IoT](https://img.shields.io/badge/IoT-ESP32%20Telemetry%20%2B%20RS485-blueviolet.svg?style=flat-square)](#esp32-live-iot-sensor-architecture)
[![IFS Dairy](https://img.shields.io/badge/IFS-DairyFeed%20AI%20Bio--Loop-orange.svg?style=flat-square)](#dairyfeed-ai--integrated-farming-system-ifs)
[![Languages](https://img.shields.io/badge/UI-English%20%7C%20%E0%AE%A4%E0%AE%AE%E0%AE%BF%E0%AE%B4%E0%AF%8D-lightgrey.svg?style=flat-square)](#bilingual-ui--kisan-ai-voice)

**Problem Statement:** P025 — Smart Crop Rotation & Soil Restorer &nbsp;·&nbsp; **SIH Problem ID:** 26111 &nbsp;·&nbsp; **Hackathon:** HACK-2K26  
**Repository:** [https://github.com/THICHANAMOORTHY/soil-res-rev](https://github.com/THICHANAMOORTHY/soil-res-rev)

---

## Executive Overview

**UZHAVU KAAPPAAN (உழவு காப்பான்)** is an end-to-end precision agronomy, circular bio-economy, and enterprise farm intelligence platform designed for both **individual smallholder farmers** and **large-scale Farmer Producer Organizations (FPOs), Dairy Cooperatives, and Agribusinesses**.

The platform tackles soil degradation, unsustainable monoculture, erratic mandi price volatility, and livestock forage insecurity through:
1. **Soil Health Intelligence**: Real-time N-P-K, pH, and Organic Carbon scoring (0–100) via manual lab entry or live streaming from edge ESP32 RS485 IoT probes.
2. **Crop Evaluation & Restorative Rotation**: An AI ranking engine across 60 master crop varieties evaluating 7 agronomic dimensions, generating optimal 3-season rotation sequences (Status Quo, Restorative, Diversified) with simulated soil nutrient recovery curves.
3. **DairyFeed AI & Integrated Farming (IFS)**: A closed-loop biological system integrating forage crop rotation, dual-node rapid silage testing (ESP32 + ESP32-CAM), dairy herd ration planning, and farmyard manure (FYM) soil recovery.
4. **B2B Enterprise FPO Command Center**: Multi-tenant command hub providing cluster-level geospatial soil heatmaps, aggregated harvest projections, automated emergency advisory dispatches (SMS/WhatsApp/Voice), and IoT fleet telematics.
5. **Role-Based Access Control (RBAC)**: Secure multi-persona architecture with strict permission boundaries and admin-only visibility for executive switching and system configuration.

---

## Table of Contents

- [Key Platform Features](#key-platform-features)
- [System Architecture](#system-architecture)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Dataset Engineering](#dataset-engineering)
- [The 60 Master Crops](#the-60-master-crops)
- [Agronomy Engine & Scientific Modeling](#agronomy-engine--scientific-modeling)
- [ESP32 Live IoT Sensor Architecture](#esp32-live-iot-sensor-architecture)
- [DairyFeed AI & Integrated Farming System (IFS)](#dairyfeed-ai--integrated-farming-system-ifs)
- [B2B Enterprise FPO Command Center](#b2b-enterprise-fpo-command-center)
- [Complete API Reference](#complete-api-reference)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Verification & Test Suite](#verification--test-suite)
- [Deployment Guide](#deployment-guide)
- [Security & Data Integrity](#security--data-integrity)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Authors & License](#authors--license)

---

## Key Platform Features

| Capability | Description |
|---|---|
| **Soil Analysis & Health Scoring** | Algorithmic scoring of N, P, K, pH, and Organic Carbon against ideal agronomic thresholds into a 0–100 index with deficiency detection and targeted fertilizer recommendations. |
| **ESP32 Edge Telemetry Ingestion** | Device-authenticated (`X-Device-Key`) live data ingestion from 7-in-1 RS485 soil sensors and DHT11/soil-moisture stations with live latency monitoring. |
| **Crop History & Monoculture Detection** | Historical cropping analysis identifying continuous cultivation, nutrient depletion pressures, and vulnerable crop family voids. |
| **Multi-Dimensional Crop Evaluation** | Evaluates candidate crops across 7 weighted dimensions: Soil Suitability, Rotation Benefit, Seasonality, Irrigation Match, Mandi Profitability, Disease Risk, and Climate Fit. |
| **3-Season Rotation Optimizer** | Synthesizes Plans A (Status Quo Monoculture), B (Recommended Restorative), and C (High-Market Diversified) with financial yield projections and net profit forecasts. |
| **Dynamic Soil Simulation** | Multi-season biological timeline modeling nitrogen fixation from legumes (+20 kg/ha/season), heavy feeder nutrient extraction, and organic carbon build-up. |
| **DairyFeed AI (Silage Testing)** | Rapid on-farm quality scoring (0–100) based on acidity (pH), moisture %, temperature delta ($\Delta T$), and optical RGB reflectance with instant safety alerts (Safe / Caution / Danger). |
| **Closed-Loop IFS Nutrient Planner** | Quantifies herd feed requirements, silage bunk longevity, and daily/seasonal farmyard manure (FYM) returned to the soil to regenerate Organic Carbon. |
| **Enterprise FPO Command Center** | Multi-tenant organization dashboard (`/api/orgs/*`) for FPO CEOs, operations managers, and field staff overseeing clusters, member farms, and harvest tonnage. |
| **Precision GPS Micro-Zones** | Geospatial grid dividing farm plots into targeted management zones with tailored NPK adjustment formulas. |
| **Live Weather & Hyperlocal Advisories** | Real-time weather, 7-day agro-forecasts, spray-window advisories, irrigation advice, and pest alerts powered by Open-Meteo. |
| **Bilingual Kisan AI Voice Assistant** | Interactive AI agronomist powered by Google Gemini (with rule-based fallback) supporting speech-to-text and text-to-speech in English and Tamil (தமிழ்). |
| **Multi-Channel Advisory Broadcasts** | Enterprise communication hub allowing FPO admins to dispatch critical pest and weather advisories to thousands of farmers via SMS, WhatsApp, and Voice. |
| **Enterprise Data & PDF Exports** | Downloadable Farmer Action Plan PDF, master agronomic dataset in CSV and JSON formats, and executive FPO summary exports. |

---

## System Architecture

```
                                  UZHAVU KAAPPAAN
                   Unified Web Client (Desktop & Mobile PWA)
      ┌─────────────────────────────────┴─────────────────────────────────┐
      │                                                                   │
  [Farmer Platform]                                           [B2B FPO Command Center]
  • Dashboard & Soil Score                                    • 18 Geographic Clusters
  • Rotation Optimizer                                        • 1,180 Member Farms
  • Live Sensor Telemetry                                     • Harvest Forecasting
  • DairyFeed IFS Planner                                     • Multi-Channel Advisories
  • Kisan AI Voice Assistant                                  • IoT Fleet Telematics
      │                                                                   │
      └─────────────────────────────────┬─────────────────────────────────┘
                                        │  REST APIs (Bearer JWT / Refresh Cookie)
                                        ▼
                  Express.js Enterprise Core (backend/server.js)
  ┌───────────────────────────────────────────────────────────────────────────────┐
  │  [Auth & RBAC Middleware] ── JWT, bcryptjs, OTP Validator, Perms Guard        │
  │  [Agronomy Engine] ──────── SoilScoring, 60-Crop Evaluator, Rotation Optimizer │
  │  [Enterprise Core] ──────── Multi-Tenant Org Hub, Cluster GIS, Harvest Forecaster│
  │  [DairyFeed AI Loop] ────── Rapid Silage Evaluator, Animal Nutrition & FYM Calc│
  │  [IoT Gateway Engine] ───── RS485 Ingest, Sensor Poller, Fleet Health Monitor  │
  │  [AI & Agro-Services] ───── Google Gemini Client, Open-Meteo, Nodemailer SMTP │
  └───────────────────────────────────────────────────────────────────────────────┘
          │                              │                          │
          ▼                              ▼                          ▼
   [Database Layer]              [IoT Hardware]             [External Services]
• Supabase PostgreSQL          • ESP32 7-in-1 RS485        • Google Gemini AI
  (Users, Orgs, Clusters,        (N, P, K, pH, Moisture)   • Open-Meteo Forecast
   Farms, IoT Telemetry,       • ESP32-CAM (Silage Macro)  • Gmail / SMTP Server
   Advisories, Tasks)          • DHT11 / TDS Station       • Web Speech API
• Resilient In-Memory Fallback • Virtual ESP32 Simulator
```

---

## Role-Based Access Control (RBAC)

UZHAVU KAAPPAAN enforces enterprise-grade security boundaries across 6 distinct personas. Administrative switches and organizational configuration are protected by strict route guards and UI visibility filters:

```
                          ┌──────────────────────┐
                          │   👑 FPO Admin / CEO │ ◄── [Full Enterprise Access]
                          └──────────┬───────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│📋 Operations Mgr │       │ 🚜 Field Officer │       │ 🔬 Agronomist    │
└──────────────────┘       └──────────────────┘       └──────────────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         │                                                       │
         ▼                                                       ▼
┌──────────────────┐                                   ┌──────────────────┐
│📡 IoT Technician │                                   │ 🌾 Farmer        │
└──────────────────┘                                   └──────────────────┘
```

### 1. Personas & Permission Matrix

| Role Key | Persona Name & Title | Badge Color | Permitted Views & Capabilities |
|---|---|---|---|
| `fpo_admin` | **Dr. K. Swaminathan**<br>FPO Administrator / CEO | `#c084fc` (Purple) | **Full Administrative Access**: Overview, Members, Clusters, Farms, Soil, Crops, IoT Fleet, IFS Dairy, Action Center, Advisories, Reports, Organization Settings. **Exclusive access to Portal Switcher & Persona Switcher**. |
| `fpo_manager` | **P. Selvan**<br>Operations Manager | `#38bdf8` (Blue) | Operations oversight: Member rosters, cluster management, crop allocation, soil analytics, action alerts, advisory dispatch, executive reports. |
| `field_officer`| **Anand Kumar**<br>Senior Field Operations Officer | `#22c55e` (Green) | Field operations: Assigned clusters (Sulur, Pollachi), farm-level inspections, task execution, direct farmer advisory delivery. |
| `agronomist` | **Dr. Priya Balan**<br>Lead Agronomist & Soil Specialist | `#fbbf24` (Amber) | Agronomic intelligence: Soil deficiency analysis, crop matching, regional yield models, regenerative crop rotation plans, reports. |
| `iot_technician`| **Karthik Raja**<br>IoT & Telemetry Engineer | `#06b6d4` (Cyan) | Edge hardware fleet: 420 telemetry nodes, online/offline ping status, battery voltages, calibration offsets, device diagnostics. |
| `farmer` | **Ramesh Kumar**<br>Individual Farmer (Farm #101) | `#86efac` (Emerald) | Farmer workspace: Personal farm dashboard, crop rotation optimizer, soil testing, weather forecast, DairyFeed planner, Kisan AI chatbot. **Cannot view FPO analytics or other member farms**. |

### 2. Admin-Only Control Visibility
The following sidebar and navigation elements are strictly restricted to users with `fpo_admin` or `admin` permissions:
- `🏢 Switch to FPO Command Center` (`#btn-portal-switch`)
- `🎭 Switch Persona / Role` (`#btn-role-switcher`)
- Mobile bottom navigation FPO tab (`#mb-nav-b2b`)

If a non-admin attempts to access `/b2b` or trigger administrative modals, they are intercepted by the client-side router (`navigate('b2b')`) and server-side endpoints, with automatic redirection to the Farmer Dashboard.

---

## Dataset Engineering

The platform's agronomic decisions are backed by three merged Kaggle datasets processed through `process_crop_dataset.py`, encompassing **44,982 records** consolidated into `backend/data/kaggle_crops.js`:

```
   ┌──────────────────────────────────────────────────────────┐
   │  APMC Mandi Real Daily Prices (anshtanwar)               │
   │  23,093 records · 224 commodities across Indian Mandis    │
   └────────────────────────────┬─────────────────────────────┘
                                │
   ┌────────────────────────────┼─────────────────────────────┐
   │  Crop Recommendation Data  │  Crop Yield in Indian States│
   │  (madhuraatmarambhagat)    │  (akshatgupta7)             │
   │  2,200 records             │  19,689 records             │
   │  N, P, K, pH, Weather      │  Yield/Acre, Rain, Chemicals│
   └────────────────────────────┼─────────────────────────────┘
                                │
                                ▼
         ┌───────────────────────────────────────────────┐
         │   Master Agronomic Model: 60 Indian Crops     │
         │   22 Parameters per Crop · Economics & Soil   │
         └───────────────────────────────────────────────┘
```

### Crop Parameter Structure (22 Attributes)
Every crop in `kaggle_crops.js` includes:
- **Nutrient Baselines**: Ideal Nitrogen, Phosphorus, Potassium demand (kg/ha), and optimal pH tolerance range.
- **Environmental Parameters**: Average temperature (°C), relative humidity (%), and rainfall requirements (High / Medium / Low).
- **Yield & Risk Metrics**: Median yield (kg/acre), disease susceptibility index, pesticide intensity factor, and primary growing seasons.
- **Economic Benchmarks**: Mandi modal market price (₹/kg), baseline cultivation cost (₹/acre), and net profit potential.
- **Provenance**: Dataset citation flags and sample count verification.

---

## The 60 Master Crops

| Crop Category | Count | Varieties Included |
|---|---|---|
| **Legumes & Pulses** (Nitrogen-Fixing) | 14 | Black Gram, Chickpea, Cowpea, Green Gram, Groundnut, Horse-gram, Khesari, Kidney Bean, Moth Bean, Peas & Beans, Pigeon Pea, Red Lentil, Sannhamp, Soybean |
| **Fruits & Plantation** | 12 | Apple, Arecanut, Banana, Cashewnut, Coconut, Grapes, Mango, Muskmelon, Orange, Papaya, Pomegranate, Watermelon |
| **Cereals & Millets** | 8 | Bajra (Pearl Millet), Barley, Jowar (Sorghum), Maize, Ragi (Finger Millet), Rice, Small Millets, Wheat |
| **Oilseeds** | 7 | Castor Seed, Linseed, Mustard, Niger Seed, Safflower, Sesamum, Sunflower |
| **Commercial Cash Crops** | 5 | Coffee, Cotton, Jute, Sugarcane, Tobacco |
| **Spices & Condiments** | 5 | Black Pepper, Cardamom, Coriander, Ginger, Turmeric |
| **Tubers & Vegetables** | 5 | Garlic, Onion, Potato, Sweet Potato, Tapioca |
| **Fibers & Industrial** | 3 | Dry Chillies, Guar Seed, Mesta |
| **Solanaceous Heavy Feeders** | 1 | Tomato |

---

## Agronomy Engine & Scientific Modeling

### 1. Soil Health Index (0–100)
Soil health is evaluated via `backend/utils/soilScoring.js`:
$$\text{Score} = (0.25 \times S_N) + (0.20 \times S_P) + (0.20 \times S_K) + (0.20 \times S_{pH}) + (0.15 \times S_{OC})$$

- **Nitrogen ($S_N$)**: $\min(100, \frac{\text{Value}}{120} \times 100)$
- **Phosphorus ($S_P$)**: $\min(100, \frac{\text{Value}}{45} \times 100)$
- **Potassium ($S_K$)**: $\min(100, \frac{\text{Value}}{90} \times 100)$
- **pH ($S_{pH}$)**: 100 within $[6.0, 7.5]$; penalised by 40 points per full pH unit deviation outside the band.
- **Organic Carbon ($S_{OC}$)**: $\min(100, \frac{\text{Value}}{1.0} \times 100)$

### 2. Seven-Dimension Crop Evaluation Engine
When evaluating candidate crops for a farm, `POST /api/crop-evaluation` scores each crop across seven weighted dimensions:

```
  ┌─────────────────────────────────────────────────────────────┐
  │         SEVEN-DIMENSION WEIGHTED EVALUATION ENGINE          │
  ├──────────────────────────────┬──────────────────────────────┤
  │ Soil Suitability    (22%)    │ NPK balance & pH tolerance   │
  │ Rotation Fit        (20%)    │ Breaks monoculture cycles    │
  │ Seasonality         (18%)    │ Kharif, Rabi, Zaid readiness │
  │ Water & Irrigation  (15%)    │ Rainfed, Drip, Canal match   │
  │ Profit Potential    (13%)    │ Net return / acre benchmark  │
  │ Disease Resistance   (8%)    │ Pesticide & disease profile  │
  │ Climate Alignment    (4%)    │ Temperature & humidity match │
  └──────────────────────────────┴──────────────────────────────┘
```

### 3. Dynamic Multi-Season Soil Simulation
`POST /api/soil-simulation` projects nutrient fluctuations over 3 successive seasons:
- **Leguminous Restorative Crops**: Replenish nitrogen by $+20\text{ kg/ha}$ (cap $160\text{ kg/ha}$) and organic carbon by $+0.10\%$ (cap $2.0\%$).
- **Non-Legume Commercial Crops**: Deplete nitrogen by $-0.30 \times \text{Crop N Demand}$ (floor $20\text{ kg/ha}$), phosphorus by $-0.20 \times \text{Crop P Demand}$, and potassium by $-0.20 \times \text{Crop K Demand}$.
- **Organic Carbon Dynamics**: Heavy irrigation reduces OC by $-0.08\%$; balanced rotations with FYM return $+0.05\%$ to $+0.15\%$.

---

## ESP32 Live IoT Sensor Architecture

The platform supports live hardware telemetry directly from field-deployed IoT sensor stations.

```
       ┌──────────────────────────┐         ┌──────────────────────────┐
       │   7-in-1 RS485 Sensor    │         │  DHT11 / TDS / Moisture  │
       │ (N, P, K, pH, Moist, EC) │         │ (Air Temp, Humidity, TDS)│
       └────────────┬─────────────┘         └────────────┬─────────────┘
                    │ MAX485 (Modbus)                    │ Analog / GPIO
                    ▼                                    ▼
       ┌───────────────────────────────────────────────────────────────┐
       │                 ESP32 Microcontroller Node                    │
       │     (Wi-Fi 802.11 b/g/n · ArduinoJson · FreeRTOS Tasks)       │
       └───────────────────────────────┬───────────────────────────────┘
                                       │ HTTP POST /api/soil-sensor/ingest
                                       │ Header: X-Device-Key: <secret>
                                       ▼
       ┌───────────────────────────────────────────────────────────────┐
       │                 UZHAVU KAAPPAAN Express Core                  │
       │   • Authenticates device token                                │
       │   • Calculates instant 0-100 soil health score                │
       │   • Caches latest readings (latency monitoring)               │
       │   • Persists historical sensor run to farm record             │
       └───────────────────────────────────────────────────────────────┘
```

### Supported Hardware Setups
1. **Option A: 7-in-1 Soil Sensor Station** (`esp32/soil_sensor_client.ino`)
   - Uses an RS485 Modbus interface (MAX485 module: DI $\to$ GPIO 17, RO $\to$ GPIO 16, DE+RE $\to$ GPIO 4).
   - Measures Nitrogen, Phosphorus, Potassium (mg/kg), pH (0.1 resolution), soil temperature, and moisture.
2. **Option B: Environmental Micro-Climate Station** (`esp32/dht11_soil_moisture_client.ino`)
   - DHT11 for ambient temperature and relative humidity.
   - Capacitive v1.2 analog probe for soil moisture % (GPIO 34).
   - Analog TDS probe (GPIO 35) for salinity and total dissolved solids.

### Simulator & Ingestion Test
You can test the hardware pipeline without physical devices:
```bash
cd backend
npm run sim:esp32            # Simulates 7-in-1 RS485 sensor on Farm #101
npm run sim:esp32 -- 105     # Simulates sensor on Farm #105
npm run sim:esp32:env        # Simulates environmental station
```

---

## DairyFeed AI & Integrated Farming System (IFS)

**SIH Problem ID:** 26111 &nbsp;·&nbsp; **Ministry:** Fisheries, Animal Husbandry & Dairying  
**Theme:** Agriculture, FoodTech & Rural Development

UZHAVU KAAPPAAN couples crop rotation directly with livestock production to close the farm's biological nutrient loop:

```
  ┌──────────────────────────────────────────────────────────────────────────┐
  │                 CIRCULAR BIO-ECONOMY NUTRIENT CYCLE                     │
  │                                                                          │
  │    [Restorative Rotations] ─────────────► [Fodder Harvest]              │
  │    (Maize, Sorghum, Cowpea)                (High Protein Silage Biomass) │
  │               ▲                                      │                   │
  │               │                                      ▼                   │
  │    [Farmyard Manure / FYM]                [Silage Bunk Fermentation]     │
  │    (Nutrient Replenishment)                          │                   │
  │               ▲                                      ▼                   │
  │               │                               [DairyFeed AI IoT]         │
  │      [Dairy Herd Milk Yield] ◄──────────────── (Rapid 60-Sec Quality Test│
  │      (High Quality Bovine Feed)                (pH, Moisture, Temp, RGB) │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Rapid Quality Evaluation Formula
Silage batches are scored from 0 to 100 using four physical indicators:
1. **Acidity Score (40 Points)**: Lactic acid fermentation is optimal between pH 3.8 and 4.2. (0 pts if pH > 5.0).
2. **Moisture Content (30 Points)**: Optimal range 60%–70%. Penalized if too wet (< 50% or > 80% leading to butyric rot).
3. **Thermal Rise $\Delta T$ (20 Points)**: Measured as $\Delta T = T_{\text{sample}} - T_{\text{ambient}}$. Zero points if $\Delta T > 6^\circ\text{C}$ (indicating aerobic spoilage).
4. **Visual & Color Index (10 Points)**: Calibrated RGB reflection via optical sensor and macro image analysis.

---

## B2B Enterprise FPO Command Center

For cooperatives and agribusiness federations managing thousands of smallholders, the **B2B Command Center** provides a single operational cockpit across 12 modules:

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │           B2B ENTERPRISE FPO COMMAND CENTER — 12 CORE MODULES           │
  ├────────────────────────┬────────────────────────┬───────────────────────┤
  │ 1. Executive Overview  │ 2. Member Roster       │ 3. Geographic Clusters│
  │    5,420 ac · 1,180 fms│    Directory & status  │    18 regional zones  │
  ├────────────────────────┼────────────────────────┼───────────────────────┤
  │ 4. Farm Fleet Drilldown│ 5. Soil Intelligence   │ 6. Crop Intelligence  │
  │    Plot-level health   │    N-P-K & pH Heatmaps │    Tonnage projections│
  ├────────────────────────┼────────────────────────┼───────────────────────┤
  │ 7. IoT Telemetry Fleet │ 8. IFS Dairy Bio-Loop  │ 9. Action Alerts      │
  │    420 nodes live ping │    Silage biomass logs │    Automated triage   │
  ├────────────────────────┼────────────────────────┼───────────────────────┤
  │ 10. Advisory Dispatch  │ 11. Executive Reports  │ 12. Org Settings      │
  │     SMS/WhatsApp/Voice │     One-click PDF/CSV  │     Threshold configs │
  └────────────────────────┴────────────────────────┴───────────────────────┘
```

### Enterprise Capabilities
- **Cluster Hierarchy**: Manages organizations across geographic clusters (e.g. Kovai FPO: 18 Clusters across Sulur, Pollachi, Annur, Thondamuthur).
- **Aggregated Mandi Bargaining**: Aggregates expected yield across member farms (e.g., 2,450 tonnes Maize, 1,120 tonnes Black Gram) for wholesale price negotiations.
- **Automated Advisory Dispatches**: Broadcasts urgent agronomic advice across multiple delivery channels (SMS, WhatsApp, Voice Broadcast).
- **Field Staff Assignment**: Dispatches field officers to farms flagged with critical soil degradation or active silage heating.

---

## Complete API Reference

Base URL: `http://localhost:3000/api`  
Standard Header: `Authorization: Bearer <access_token>`

### 1. System & Reference Endpoints
| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | System health, uptime, active database mode |
| `GET` | `/db-status` | Supabase cloud connectivity and sync diagnostics |
| `GET` | `/crops` | Complete list of all 60 agronomic crop varieties |
| `GET` | `/farms` | Demo and registered farm entities |
| `GET` | `/farmers` | Registered farmer profiles |
| `GET` | `/seasons` | Kharif, Rabi, and Zaid seasonal calendar metadata |

### 2. Core Agronomy Engine
| Method | Path | Description |
|---|---|---|
| `POST` | `/soil-analysis` | Computes 0–100 health score, deficiency list, and fertilizer recommendations |
| `GET` | `/soil-analysis` | Retrieves current soil test record for a specific `farm_id` |
| `POST` | `/crop-history` | Submits crop sequence and evaluates monoculture risk |
| `GET` | `/crop-history` | Retrieves historical cultivation records for a farm |
| `GET` | `/candidate-crops` | Filters 60 crops by season, water availability, and rotation constraints |
| `POST` | `/crop-evaluation` | Computes seven-dimension weighted score and revenue projections |
| `POST` | `/optimize-rotation` | Generates Plans A (Status Quo), B (Restorative), and C (Diversified) |
| `POST` | `/soil-simulation` | Computes multi-season biological nutrient and organic carbon recovery |
| `GET` | `/recommendation` | Returns top recommended crop, optimal plan, and agronomic rationale |
| `GET` | `/dashboard` | Aggregated farm dashboard payload (KPIs, radar charts, weather) |
| `GET` | `/report` | Structured farm diagnostic summary |
| `GET` | `/gps-zones` | Returns precision management zones for GPS coordinates |
| `POST` | `/gps-zones/analyze` | Generates targeted fertilizer rate adjustments per micro-zone |
| `GET` | `/weather` | Real-time weather, 7-day forecast, spray windows, and pest risk |
| `GET` | `/weather/search` | Geocoding place search for selecting farm locations |
| `POST` | `/chat` | Kisan AI chatbot (Google Gemini with rule-based fallback; EN / TA) |

### 3. Authentication & Cloud Synchronization (`/auth`)
| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Registers farmer account, creates starter farm, initiates verification |
| `POST` | `/auth/login` | Authenticates with email/password; returns access token + refresh cookie |
| `POST` | `/auth/refresh` | Rotates refresh token and returns new 15-minute access token |
| `POST` | `/auth/logout` | Clears refresh cookie and revokes session |
| `GET` | `/auth/me` | Returns sanitized authenticated user profile and assigned role |
| `POST` | `/auth/demo-login` | 1-Click login for testing RBAC personas (`farmer`, `fpo_admin`, etc.) |
| `GET` | `/auth/google/config` | Returns Google OAuth and Supabase sync configuration |
| `POST` | `/auth/google/send-code` | Generates and sends a 6-digit real OTP verification code via email |
| `POST` | `/auth/google/verify-code` | Validates 6-digit OTP code |
| `POST` | `/auth/google` | Completes Google cloud login and syncs account into Supabase |
| `POST` | `/auth/forgot-password` | Initiates password recovery flow |
| `POST` | `/auth/reset-password-otp`| Verifies reset OTP and updates user password |
| `GET` | `/auth/verify-email` | Confirmation page for email verification |
| `POST` | `/auth/verify-email` | Consumes verification token and activates account |
| `POST` | `/auth/resend-verification`| Resends activation link with 60-second cooldown |

### 4. Edge IoT Soil Telemetry (`/soil-sensor`)
| Method | Path | Description |
|---|---|---|
| `POST` | `/soil-sensor/ingest` | Ingests real-time ESP32 packet (`X-Device-Key` header authentication) |
| `GET` | `/soil-sensor/latest` | Returns latest reading, connection status, and latency for a farm |

### 5. DairyFeed AI & Silage Quality (`/dairyfeed`)
| Method | Path | Description |
|---|---|---|
| `GET` | `/dairyfeed/summary` | Silage quality metrics, average scores, and spoilage distributions |
| `GET` | `/dairyfeed/history` | Paginated historical batch evaluations and test logs |
| `POST` | `/dairyfeed/test` | Evaluates silage sample (pH, moisture, temperature rise, RGB reflectance) |
| `GET` | `/dairyfeed/cattle-plan` | IFS feed budget, silo storage duration, and FYM soil recovery calculator |
| `GET` | `/dairyfeed/devices` | Telemetry status of active on-farm silage probe hardware |

### 6. B2B Enterprise FPO Command Center (`/orgs`)
| Method | Path | Description |
|---|---|---|
| `GET` | `/orgs` | Directory of registered FPOs, cooperatives, and agribusinesses |
| `GET` | `/orgs/:id` | Detailed organization profile, leadership, and operational footprint |
| `GET` | `/orgs/:id/dashboard` | **B2B Executive Command Dashboard**: acreage, soil health, harvest |
| `GET` | `/orgs/:id/members` | Full roster of member farmers and registration details |
| `GET` | `/orgs/:id/clusters` | Regional cluster analytics (Sulur, Pollachi, Annur, etc.) |
| `GET` | `/orgs/:id/farms` | List of member farms, acreages, and latest soil health scores |
| `GET` | `/orgs/:id/farms/:farmId`| Detailed diagnostic drill-down for an individual member farm |
| `GET` | `/orgs/:id/soil` | Aggregated organization-wide NPK, pH, and Organic Carbon indices |
| `GET` | `/orgs/:id/crops` | Macro crop acreage allocation and regional diversity breakdown |
| `GET` | `/orgs/:id/production` | Projected harvest volumes and expected Mandi market valuations |
| `GET` | `/orgs/:id/sensors` | IoT fleet status: online/offline nodes, battery voltages, ping |
| `GET` | `/orgs/:id/ifs` | Cluster-level silage testing volume and organic manure production |
| `GET` | `/orgs/:id/alerts` | Active operational alerts (critical acidity, severe soil degradation) |
| `POST` | `/orgs/:id/alerts/:alertId/resolve` | Resolves an operational alert with resolution notes |
| `GET` | `/orgs/:id/advisories` | Historical advisory dispatch logs across SMS, WhatsApp, and Voice |
| `POST` | `/orgs/:id/advisories` | Dispatches emergency regional advisory broadcast to farmers |
| `GET` | `/orgs/:id/tasks` | Dispatched field officer inspection and remediation task assignments |
| `POST` | `/orgs/:id/tasks` | Creates and assigns an inspection task to a field officer |
| `GET` | `/orgs/:id/reports` | Executive summary report data for export |
| `GET` | `/orgs/:id/settings` | Organizational thresholds and advisory notification preferences |
| `PUT` | `/orgs/:id/settings` | Updates organization operational thresholds |
| `POST` | `/orgs/:id/sensors/:nodeId/ping` | Sends real-time telemetry ping request to an edge sensor node |

### 7. File Downloads & Exports (`/download`)
| Method | Path | Description |
|---|---|---|
| `GET` | `/download/farmer-plan-pdf` | Generates and downloads the Farmer Soil Health Action Plan PDF |
| `GET` | `/download/crops-csv` | Downloads master 60-crop dataset in CSV format |
| `GET` | `/download/crops-json` | Downloads master 60-crop dataset in JSON format |

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TECHNOLOGY STACK                               │
├─────────────────────┬───────────────────────────────────────────────────────┤
│ Frontend Core       │ Vanilla JavaScript (ES6+), HTML5, CSS3                │
│ Data Visualization  │ Chart.js 4 (Radar, Doughnut, Multi-Axis Line charts)  │
│ Voice & AI Client   │ Web Speech API (SpeechRecognition & SpeechSynthesis)  │
│ Internationalization│ Custom bilingual engine (English & Tamil / தமிழ்)     │
│ Backend Framework   │ Node.js 18+ LTS, Express 4                            │
│ Database Layer      │ Supabase PostgreSQL + Resilient In-Memory Data Store  │
│ Authentication      │ JWT (jsonwebtoken), bcryptjs, Secure httpOnly Cookies │
│ AI LLM Integration │ @google/generative-ai (Google Gemini Pro / Flash)     │
│ Weather Provider    │ Open-Meteo API (Forecast & Geocoding — Zero API Key)  │
│ Edge Microcontroller│ ESP32 Dual-Core Tensilica LX6, Arduino C++            │
│ Sensor Protocols    │ RS485 Modbus RTU (MAX485), ADC1 (16-bit ADS1115), 1-Wire│
│ Python Tooling      │ Python 3.8+, kagglehub, urllib3                       │
│ Hosting Platforms   │ Netlify (Edge Functions) / Self-Hosted Node.js Server │
└─────────────────────┴───────────────────────────────────────────────────────┘
```

---

## Installation & Setup

### Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **Python** v3.8+ (for dataset pipeline and testing tools)
- **Git**

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/THICHANAMOORTHY/soil-res-rev.git
cd soil-res-rev/backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:
```bash
cp .env.example .env
```

Configure your secrets in `backend/.env`:
```env
PORT=3000
NODE_ENV=development

# JWT Secrets (generate using: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
JWT_ACCESS_SECRET=your_super_secret_access_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# Hardware IoT Secret
ESP32_DEVICE_KEY=your_esp32_shared_secret_key

# Optional: Google Gemini AI API Key
GEMINI_API_KEY=your_google_gemini_api_key

# Optional: Supabase Cloud Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-or-anon-key

# Optional: Outgoing Email (Gmail SMTP Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-google-app-password
MAIL_FROM="UZHAVU KAAPPAAN <your-email@gmail.com>"
APP_BASE_URL=http://localhost:3000
```

> **Note on Zero Configuration:** If Supabase, Gemini, or SMTP are left unconfigured, the application automatically runs on built-in resilient in-memory stores, rule-based chatbot heuristics, and on-screen developer verification links!

### 3. Initialize Database (Optional: Supabase)
If using Supabase:
1. Open your Supabase SQL editor and execute [`supabase/schema.sql`](supabase/schema.sql).
2. Populate the reference agronomic tables:
   ```bash
   cd backend
   npm run db:sync
   ```

### 4. Launch the Platform
```bash
cd backend
npm run dev          # Starts with nodemon live reload
# or
npm start            # Production start
```

Visit **`http://localhost:3000`** in your browser.

---

## Verification & Test Suite

The platform includes an automated end-to-end master test suite verifying all 4 architectural pillars:

```bash
# Run master platform verification (38 checks across all services)
python -u test_complete_platform.py
```

### Test Suite Execution Output
```
====================================================================
  UZHAVU KAAPPAAN — MASTER END-TO-END HEALTH & INTEGRITY CHECK
====================================================================

[SECTION 1: B2B FPO COMMAND CENTER — 12 MODULES]
  [PASS] 1. Orgs Directory (GET /orgs)                  status=200
  [PASS] 2. Org Profile (GET /orgs/1)                   status=200
  [PASS] 3. Command Dashboard (GET /orgs/1/dashboard)   status=200
  [PASS] 4. Members Roster (GET /orgs/1/members)        status=200
  [PASS] 5. Geographic Clusters (GET /orgs/1/clusters)  status=200
  [PASS] 6. Enterprise Farms (GET /orgs/1/farms)        status=200
  [PASS] 7. Farm Drill-Down #101 (GET /orgs/1/farms/101) status=200
  [PASS] 8. Regional Soil (GET /orgs/1/soil)            status=200
  [PASS] 9. Crop Allocation (GET /orgs/1/crops)         status=200
  [PASS] 10. Harvest Projections (GET /orgs/1/production) status=200
  [PASS] 11. IoT Fleet Telemetry (GET /orgs/1/sensors)  status=200
  [PASS] 12. IFS Dairy Silage (GET /orgs/1/ifs)         status=200
  [PASS] 13. Action Center Alerts (GET /orgs/1/alerts)  status=200
  [PASS] 14. Advisory Dispatch Log (GET /orgs/1/advisories) status=200
  [PASS] 15. Field Staff Tasks (GET /orgs/1/tasks)      status=200
  [PASS] 16. Executive Reports (GET /orgs/1/reports)    status=200
  [PASS] 17. Org Settings (GET /orgs/1/settings)        status=200

[SECTION 2: ROLE-BASED ACCESS CONTROL (RBAC) — 6 PERSONAS]
  [PASS] Auth Login -> Farmer                           status=200
  [PASS] Auth Login -> FPO Admin / CEO                  status=200
  [PASS] Auth Login -> Operations Manager               status=200
  [PASS] Auth Login -> Senior Field Officer             status=200
  [PASS] Auth Login -> Lead Agronomist                  status=200
  [PASS] Auth Login -> IoT Fleet Engineer               status=200

[SECTION 2B: GOOGLE MAIL CLOUD AUTHENTICATION (SUPABASE LIVE SYNC)]
  [PASS] Google Auth Config Endpoint                    status=200
  [PASS] Google Mail Send Verification Code (Real OTP)  status=200
  [PASS] Google Mail Verify Code (Reject Invalid OTP)   status=400
  [PASS] Google Mail Login (Farmer) + Cloud Sync        status=200
  [PASS] Google Mail Login (FPO Executive) + Cloud Sync status=200

[SECTION 3: REAL-TIME IOT TELEMETRY & HARDWARE INGESTION]
  [PASS] Push Live ESP32 Telemetry Packet               status=200
  [PASS] Verify Hardware Telemetry Latency              status=200

[SECTION 4: CORE FARMER EXPERIENCE — ZERO REGRESSION]
  [PASS] Farmer Dashboard (farm 101)                    status=200
  [PASS] Candidate Crops (Kharif)                       status=200
  [PASS] Crop Evaluation Engine                         status=200
  [PASS] Rotation Optimizer API                         status=200
  [PASS] Recommendation Generator                       status=200
  [PASS] GPS Precision Agronomy Zones                   status=200
  [PASS] Agro Weather Forecast                          status=200
  [PASS] Live Sensor Target (/soil-sensor/latest)       status=200

====================================================================
  TOTAL CHECKS: 38 | PASSED: 38 | FAILED: 0 (100% PASS RATE)
====================================================================
```

---

## Deployment Guide

### Option 1: Netlify (Serverless + Static CDN)
The repository is pre-configured with `netlify.toml` and serverless bridge `netlify/functions/api.js`:
1. Connect your repository on Netlify.
2. Build Settings:
   - **Publish directory**: `frontend`
   - **Functions directory**: `netlify/functions`
3. Configure environment variables (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `SUPABASE_URL`, etc.) in Netlify Site Settings.

### Option 2: Linux Container / VM Deployment (Docker / VPS)
For persistent real-time ESP32 edge telemetry and background poller sync:
```bash
cd backend
npm install --omit=dev
NODE_ENV=production PORT=3000 node server.js
```
Use `pm2` or `systemd` to keep the process alive behind an NGINX reverse proxy configured with HTTPS.

---

## Security & Data Integrity

- **Password Cryptography**: Passwords salted and hashed with `bcryptjs` (work factor 12).
- **Dual-Token Authentication**: Short-lived 15-minute JWT access tokens kept in memory; 30-day rotating refresh tokens stored in `httpOnly`, `SameSite=Lax`, `secure` cookies.
- **Role Permission Enforcement**: API route middleware and client-side router verify user claims before granting access to organizational endpoints.
- **Hardware Isolation**: ESP32 edge devices authenticate via dedicated `X-Device-Key` headers decoupled from user sessions.
- **Rate Limiting**: Authentication and password reset endpoints are guarded against brute-force attacks via `express-rate-limit`.

---

## Troubleshooting & FAQ

| Issue | Resolution |
|---|---|
| **"EADDRINUSE: port 3000"** | A previous instance is still bound to the port. Run `netstat -ano \| findstr :3000` on Windows or `lsof -i :3000` on Unix and kill the process. |
| **"Access restricted to administrators" alert** | You are currently logged in as a `farmer` or unauthenticated guest. Sign in as Dr. K. Swaminathan (`admin@kovaifpo.org`) or click the FPO Admin demo persona to access B2B controls. |
| **ESP32 Live Sensor indicator stays red** | Check that `ESP32_DEVICE_KEY` in `.env` matches the key defined in the firmware. For testing, run `npm run sim:esp32`. |
| **Google Mail verification fails** | Ensure 2-Step Verification is active on the sender account and that a 16-digit Google App Password is used without spaces. |
| **Tamil voice synthesis not speaking** | Browser Web Speech API language support depends on local OS voice packs. Chrome and Microsoft Edge on Windows 11 provide the best Tamil TTS support. |

---

## Authors & License

- **Project:** UZHAVU KAAPPAAN (உழவு காப்பான்)
- **Repository:** [THICHANAMOORTHY/soil-res-rev](https://github.com/THICHANAMOORTHY/soil-res-rev)
- **Problem Statement:** P025 — Smart Crop Rotation & Soil Restorer (HACK-2K26)
- **Dedicated to:** Sustainable agriculture, regenerative soil biology, and farmer prosperity.

*Distributed under the MIT License. See `LICENSE` for details.*

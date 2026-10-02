# DairyFeed AI (SIH 26111) — Smart Rapid Feed & Silage Quality Testing System

[![GitHub](https://img.shields.io/badge/GitHub-THICHANAMOORTHY%2FFARM--ROTATION-181717?style=flat-square&logo=github)](https://github.com/THICHANAMOORTHY/FARM-ROTATION)
[![SIH 26111](https://img.shields.io/badge/SIH%20Problem%20ID-26111-blue.svg?style=flat-square)](https://sih.gov.in/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11%2B-009688.svg?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Tailwind-61DAFB.svg?style=flat-square&logo=react)](https://vitejs.dev/)
[![Hardware](https://img.shields.io/badge/Hardware-ESP32%20%2B%20ESP32--CAM-red.svg?style=flat-square&logo=espressif)](https://www.espressif.com/)
[![Database](https://img.shields.io/badge/Database-Supabase%20Postgres%20%2B%20Storage-3ECF8E.svg?style=flat-square&logo=supabase)](https://supabase.com/)
[![Languages](https://img.shields.io/badge/Languages-English%20%7C%20%E0%AE%A4%E0%AE%AE%E0%AE%BF%E0%AE%B4%E0%AF%8D-lightgrey.svg?style=flat-square)](#bilingual-farmer-advisory-engine)
[![Tests](https://img.shields.io/badge/Tests-88%20passing-brightgreen.svg?style=flat-square)](#testing--verification)

> **Ministry of Fisheries, Animal Husbandry & Dairying** &nbsp;·&nbsp; **Theme:** Agriculture, FoodTech & Rural Development  
> **Problem Statement (SIH 26111):** Development of a smart AI-enabled rapid feed and silage quality testing system for dairy farmers.  
> **GitHub Repository:** [THICHANAMOORTHY/FARM-ROTATION](https://github.com/THICHANAMOORTHY/FARM-ROTATION) &nbsp;·&nbsp; **Module:** `dairyfeed-ai/`

---

## Executive Summary

Silage that has fermented poorly, overheated aerobically, or developed toxic mycotoxigenic mould looks remarkably similar to high-quality forage to the naked eye. In rural dairy farming, spoilage is frequently discovered only after dairy cattle reject feed, suffer digestive acidosis, or experience sudden drops in daily milk yield. 

Conventional wet-chemistry lab assays (HPLC, near-infrared spectroscopy, wet titration) provide laboratory accuracy but require 3 to 7 days of turnaround time, substantial recurring lab fees, and transport to distant regional centres. 

**DairyFeed AI** solves this bottleneck with an **on-farm, rapid-screening IoT & AI ecosystem**:
1. **Dual-Node Field Probe (ESP32 + ESP32-CAM)**: Captures silage acidity (pH), internal and ambient temperatures ($\Delta T$), capacitive moisture, colour reflection (TCS3200 RGB), and macro visual imagery in under 60 seconds directly at the bunk pit or silage bag.
2. **Transparent Algorithmic Scoring Engine**: Evaluates samples on a 0–100 quality index with itemised sub-score breakdowns, strict biological safety caps, and zero black-box obscurity.
3. **Validated Computer Vision & Machine Learning Pipeline**: Governed by strict validation gates (only trains on verified, expert-labelled samples; never hallucinates with unverified models).
4. **Bilingual Farmer Advisory (English & தமிழ்)**: Delivers clear, practical remediation guidance (ok, warning, danger) with speech accessibility.
5. **Integrated Farming System (IFS) Closed Loop**: Directly bridges crop rotation with cattle nutrition and manure-based soil replenishment inside the parent **UZHAVU KAAPPAAN** platform.

> [!IMPORTANT]
> **Decision-Support & Screening Tool, Not a Diagnostic Lab:** DairyFeed AI is engineered for rapid on-farm risk triage and preservation monitoring. It does not substitute certified wet-chemistry assays for mycotoxin quantification, crude protein (CP), or acid detergent fibre (ADF).

---

## Contents

- [System Architecture](#system-architecture)
- [Hardware & Sensor Node Engineering](#hardware--sensor-node-engineering)
- [Sensor Calibration & Wiring](#sensor-calibration--wiring)
- [Algorithmic Scoring Engine](#algorithmic-scoring-engine)
- [Machine Learning & Computer Vision](#machine-learning--computer-vision)
- [Bilingual Farmer Advisory Engine](#bilingual-farmer-advisory-engine)
- [Integrated Farming System (IFS) Loop](#integrated-farming-system-ifs-loop)
- [API Reference](#api-reference)
- [Database Schema & Cloud Storage](#database-schema--cloud-storage)
- [Repository Structure](#repository-structure)
- [Quickstart & Local Development](#quickstart--local-development)
- [Hardware Simulation Mode](#hardware-simulation-mode)
- [Testing & Verification](#testing--verification)
- [Judges & Evaluators Evaluation Guide](#judges--evaluators-evaluation-guide)

---

## System Architecture

The architecture separates sensor acquisition, high-resolution imaging, server intelligence, and cloud persistence:

```
                            SILAGE SAMPLE (Bunk / Pit / Bale)
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
       ┌─────────────────────────────┐               ┌─────────────────────────┐
       │   SENSOR NODE (ESP32 DevKit)│               │ CAMERA NODE (ESP32-CAM) │
       │  • pH Probe + ADS1115 ADC   │               │  • OV2640 Image Sensor  │
       │  • Capacitive Moisture v1.2 │               │  • White Flood LED      │
       │  • DS18B20 Dual Temp Probes │               │  • Synchronised Trigger │
       │  • TCS3200 RGB Sensor       │               └────────────┬────────────┘
       │  • SSD1306 OLED Display     │                            │
       └──────────────┬──────────────┘                            │
                      │ UART Trigger (`sample_id`)                 │
                      └──────────────────────────────────────────►│
                      │                                           │
       POST /api/silage/test                       POST /api/image/analyze
       (Telemetry JSON)                            (Multipart Image File)
                      │                                           │
                      └───────────────────┬───────────────────────┘
                                          ▼
                      ┌───────────────────────────────────────────┐
                      │          FastAPI BACKEND SERVER           │
                      │  • Device Ingestion & Auth (X-Device-Key) │
                      │  • Session State Joiner (by sample_id)    │
                      │  • Algorithmic Scoring Engine (0-100)     │
                      │  • Fallback Safety Rules & Gating         │
                      │  • ML Predictor (LightGBM + MobileNet)    │
                      │  • Bilingual Advisory Generator (EN / TA) │
                      └───────────────────┬───────────────────────┘
                                          │
                      ┌───────────────────┴───────────────────────┐
                      ▼                                           ▼
       ┌─────────────────────────────┐               ┌─────────────────────────┐
       │       SUPABASE CLOUD        │               │   FARMER CLIENT UIs     │
       │  • Postgres (silage_tables) │               │  • DairyFeed Dashboard  │
       │  • Private Storage Buckets  │               │    (React + Vite + I18n)│
       │  • Row-Level Security (RLS) │               │  • UZHAVU KAAPPAAN      │
       │  • Role-Based Access        │               │    Unified Express App  │
       └─────────────────────────────┘               └─────────────────────────┘
```

### Architectural Principles

1. **Hardware Decoupling via UART & Sample ID**: The TCS3200 RGB colour sensor is mounted directly on the primary ESP32 sensor probe inside a sealed illumination chamber. The ESP32-CAM node focuses exclusively on macro image capture. When a test initiates, the sensor node transmits the generated unique `sample_id` (e.g., `DF01-20261002T103015-0007`) over hardware UART to the camera node.
2. **Asynchronous Order-Independent Joining**: Sensor telemetry and camera image uploads are transmitted independently over Wi-Fi. The FastAPI backend joins the payloads by `sample_id` idempotently. Whichever arrives second triggers the unified scoring update.
3. **Offline-First Fault Tolerance**: If farm Wi-Fi is unavailable or out of range, the ESP32 buffers readings to non-volatile LittleFS storage and batches them upon connection restoration via `POST /api/silage/bulk`.

---

## Hardware & Sensor Node Engineering

### Bill of Materials (BOM)

| Component | Function / Measurement | Operational Range | Role in Silage Assessment |
|---|---|---|---|
| **ESP32 DevKit v1** | Main Microcontroller (Sensor Node) | 240 MHz Dual-Core, 2.4 GHz Wi-Fi | Aggregates sensors, runs local validation, drives OLED, triggers camera |
| **ESP32-CAM (AI-Thinker)** | Camera Node | OV2640 2MP Sensor | Captures macro imagery of silage surface for mould and discoloration |
| **pH Electrode (PH-4502C)** | Silage Leachate Acidity | pH 0.0 – 14.0 ($\pm 0.05$) | Key indicator of anaerobic lactic acid fermentation |
| **ADS1115 16-Bit ADC** | Precision Analog-to-Digital Converter | 16-bit I2C ($\pm 0.1$ mV) | Eliminates ESP32 internal ADC non-linearity and Wi-Fi RF noise |
| **Capacitive Moisture v1.2** | Relative Volumetric Moisture | Frequency-based impedance | Detects over-wet seepage risk vs under-moist aeration risk |
| **DS18B20 Digital Probes (×2)** | Internal Core & Ambient Temp | -55°C to +125°C ($\pm 0.5$°C) | Measures temperature elevation ($\Delta T = T_{core} - T_{ambient}$) |
| **TCS3200 Colour Sensor** | Spectral RGB Light Reflection | Multi-frequency photodiodes | Detects aerobic browning, clostridial dark rot, and slime formation |
| **SSD1306 0.96" OLED** | Local On-Device Screen | 128×64 pixels (I2C) | Provides instant feedback directly at the pit before Wi-Fi sync |

---

## Sensor Calibration & Wiring

### Sensor Node Pinout Configuration

```
               ┌──────────────────────────────────────┐
               │         ESP32 DevKit (30-Pin)        │
               ├───────────────────┬──────────────────┤
               │ Pin / GPIO        │ Connected Module │
               ├───────────────────┼──────────────────┤
               │ 3V3 / GND         │ Power Rails      │
               │ GPIO 21 (SDA)     │ ADS1115 + OLED   │
               │ GPIO 22 (SCL)     │ ADS1115 + OLED   │
               │ GPIO 4  (OneWire) │ Dual DS18B20     │
               │ GPIO 25 (S0)      │ TCS3200 S0       │
               │ GPIO 26 (S1)      │ TCS3200 S1       │
               │ GPIO 27 (S2)      │ TCS3200 S2       │
               │ GPIO 14 (S3)      │ TCS3200 S3       │
               │ GPIO 13 (OUT)     │ TCS3200 OUT      │
               │ GPIO 17 (TX2)     │ ESP32-CAM RX     │
               │ GPIO 16 (RX2)     │ ESP32-CAM TX     │
               └───────────────────┴──────────────────┘
```

### Precision Calibration Protocols

1. **pH Sensor Two-Point Calibration**:
   - Immerse probe in standard **pH 7.00** buffer solution at 25°C; record voltage $V_{mid}$.
   - Immerse probe in standard **pH 4.01** buffer solution (typical silage target); record voltage $V_{low}$.
   - Calibration slope is calculated dynamically:
     $$\text{Slope} = \frac{7.00 - 4.01}{V_{mid} - V_{low}} \quad (\text{pH / V})$$
2. **Capacitive Moisture Calibration**:
   - Dry reading ($ADC_{air}$): sensor held in open dry ambient air (~18,500 raw counts on ADS1115).
   - Saturated reading ($ADC_{water}$): sensor immersed in distilled water (~9,200 raw counts).
   - Calibrated against gravimetric oven-drying tests (72 hours at 65°C) to correlate relative moisture with true dry matter (DM %).
3. **TCS3200 White Balance**:
   - Performed inside an enclosed sample chamber under illumination from high-CRI 4000K white SMD LEDs against a certified 99% diffuse white reflectance standard card.

---

## Algorithmic Scoring Engine

Silage quality is scored using a multi-parameter weighted algorithm configured in `backend/app/scoring_config.yaml`. Every test yields an interpretable 0–100 score accompanied by an itemised breakdown:

### Scoring Breakdown Rubric

| Component | Maximum Weight | Full Points Criteria | Partial / Penalty Scales | Critical Hazard Boundary |
|---|---|---|---|---|
| **Acidity (pH)** | **40 Points** | **pH 3.8 – 4.2** (optimal lactic fermentation) | pH 4.2–4.5: linear deduction to 25 pts<br>pH 4.5–4.8: steep penalty (10 pts) | **pH > 5.0**: 0 points (clostridial risk, protein degradation) |
| **Moisture %** | **30 Points** | **60.0% – 70.0%** (ideal moisture for ensiling) | 55%–60%: deduction to 15 pts (air trapped)<br>70%–75%: deduction to 15 pts (effluent runoff) | **< 50% or > 80%**: severe quality failure |
| **Temperature Rise ($\Delta T$)** | **20 Points** | **$\Delta T \le 3.0$°C** ($T_{sample} - T_{ambient}$) | $\Delta T \in (3.0, 6.0]$°C: deduction to 8 pts | **$\Delta T > 6.0$°C**: 0 points (secondary aerobic fermentation) |
| **Visual Appearance** | **10 Points** | Normal color, no signs of mycelium | Visible yellowing or surface browning | Visible mould colonies |

$$\text{Final Score} = \left( \frac{\text{Points Earned}}{\text{Available Base Points}} \right) \times 100$$

*Note: If no camera photo is available, the score is calculated purely out of 90 available points and normalized to 100. No synthetic numbers are ever invented.*

### Quality Classification & Safety Caps

- **Good Quality (Score $\ge 75$)**: Clean preservation, lactic aroma, minimal nutrient dissipation.
- **Moderate Quality (Score $50 - 74$)**: Marginal fermentation, needs prompt consumption or bunk management.
- **Poor Quality (Score $< 50$)**: High risk of unpalatability, butyric contamination, or mould.

#### Mandatory Safety Override Rules
1. **High Spoilage Risk Override**: If $\text{pH} > 5.0$ OR $\Delta T > 6.0$°C, Spoilage Risk is classified as **High**, and the Quality category is **strictly capped at Moderate** regardless of moisture or other scores.
2. **High Mould Risk Override**: If computer vision or expert inspection confirms active mould, the Quality category is **instantly forced to Poor**, and the advisory triggers an immediate **Danger Warning**.

---

## Machine Learning & Computer Vision

### Ethical AI Policy: Validation Gating

Unlike systems that deploy synthetic mock classifiers, DairyFeed AI enforces strict **data integrity and validation gating**:

```
 [Raw Field Samples] ──► [Expert Labelling Portal] ──► [Validation Pipeline Gate] ──► [Production Model]
                                                          │
                                                          ├─ Require >= 15 samples / class
                                                          ├─ Stratified 5-Fold Cross-Validation
                                                          ├─ Recall >= 0.70 per class
                                                          └─ Macro F1 >= 0.70
```

1. **Zero-Synthetic Policy**: Synthetic, simulated, and demo samples (`flags.simulated == true`) are filtered out during dataset export (`ml/export_dataset.py`).
2. **Validation Gate Requirement**: An ML model is only permitted into production when it meets:
   - Minimum 15 verified physical samples per target class.
   - Stratified 5-fold cross-validation.
   - Macro F1 score $\ge 0.70$ and per-class recall $\ge 0.70$.
3. **Honest Fallback**: When no validated ML model is loaded, the backend returns `"method": "Rule-based"` and leaves Mould Risk as `"Unknown"` rather than presenting speculative predictions to farmers.

### Model Architectures

- **Tabular Classifier**: Random Forest / LightGBM operating on engineered physical features:
  $$X = [\text{pH}, \text{moisture\_pct}, \Delta T, T_{ambient}, R, G, B, \text{feed\_type}]$$
- **Visual Image Classifier**: MobileNetV3 + HSV color space feature extraction operating on macro silage photographs to distinguish white lactic crusts from dark-green Aspergillus/Penicillium mycelia.

---

## Bilingual Farmer Advisory Engine

Every test evaluation is matched with practical, culturally attuned recommendations available in both **English** and **Tamil (தமிழ்)**:

| Severity | English Recommendation | Tamil Recommendation (தமிழ்) |
|---|---|---|
| **OK (Safe)** | Silage quality is optimal. Safe for dairy cattle feeding. Maintain airtight covering after daily feeding. | சைலேஜ் தரம் மிகச் சிறப்பாக உள்ளது. கறவை மாடுகளுக்கு பாதுகாப்பாக வழங்கலாம். பயன்பாட்டிற்கு பின் குழியை காற்று புகாமல் மூடி வைக்கவும். |
| **WARN (Caution)** | Elevated pH or moisture detected. Aerobic spoilage beginning. Feed from top layer immediately; discard discoloured patches. | மிதமான அமிலத்தன்மை (pH) அல்லது ஈரப்பதம் உள்ளது. காற்றுபட்டு கெட்டுப்போகும் அபாயம் உள்ளது. மேல் அடுக்கை விரைவில் தீவனமாக பயன்படுத்தவும். |
| **DANGER (Hazard)** | High spoilage risk or mould detected. DO NOT feed to dairy cows. Can cause severe milk drop or rumen acidosis. Consult a veterinarian. | எச்சரிக்கை: சைலேஜ் கெட்டுப்போய் உள்ளது அல்லது பூஞ்சை பாதிப்பு உள்ளது. மாடுகளுக்கு கொடுக்க வேண்டாம். பால் உற்பத்தி குறையும் மற்றும் நச்சு பாதிப்பு ஏற்படும். |

---

## Integrated Farming System (IFS) Loop

DairyFeed AI is integrated into the **UZHAVU KAAPPAAN** ecosystem, demonstrating how crop rotation and livestock nutrition form a sustainable closed nutrient cycle:

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                   UZHAVU KAAPPAAN AGRO-ECOSYSTEM                       │
  │                                                                        │
  │     [Soil Restoration] ───────────────► [Fodder Crop Rotation]        │
  │     (N-P-K & pH Scoring)               (Maize, Sorghum, Cowpea)        │
  │            ▲                                      │                    │
  │            │                                      ▼                    │
  │     [Farmyard Manure / FYM]            [Silage Bunk Ensiling]          │
  │     (Nutrient Replenishment)                      │                    │
  │            ▲                                      ▼                    │
  │            │                               [DairyFeed AI IoT]          │
  │     [Dairy Cattle Herd] ◄───────────────── (Rapid Quality Screening)   │
  │     (Milk Yield & Dung)                    (Safe Feed Assurance)       │
  └────────────────────────────────────────────────────────────────────────┘
```

The endpoint `/api/dairyfeed/cattle-plan` computes:
- **Daily Silage Requirements**: $15\text{–}20\text{ kg}$ fresh silage per lactating cow per day.
- **Acreage & Forage Yield**: Translates crop rotation yield (tons/acre of fodder maize or cowpea) into herd feed capacity in months.
- **Organic Dung / Manure Generation**: Quantifies farmyard manure returned to the farm soil, completing the biological loop to restore Organic Carbon and Soil NPK.

---

## API Reference

The backend operates on `http://localhost:8000` (FastAPI) and is proxied through the unified system at `http://localhost:3000/api/dairyfeed`.

### Core Endpoints

#### 1. Submit Real-Time Sensor Telemetry
- **Method / Path**: `POST /api/silage/test`
- **Headers**: `X-Device-Key: <DEVICE_API_KEY>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "sample_id": "DF01-20261002T103015-0007",
  "device_id": "DF01",
  "feed_type": "maize_silage",
  "farm_id": 101,
  "readings": {
    "ph": 4.15,
    "moisture_pct": 65.2,
    "sample_temp_c": 28.1,
    "ambient_temp_c": 25.8,
    "moisture_raw": 12450,
    "rgb": { "r": 142, "g": 136, "b": 52 }
  },
  "flags": { "simulated": false, "demo": false }
}
```
- **Response (200 OK)**:
```json
{
  "sample_id": "DF01-20261002T103015-0007",
  "device_id": "DF01",
  "prediction": {
    "quality": "Good",
    "score": 92.5,
    "spoilage_risk": "Low",
    "mould_risk": "Unknown",
    "method": "Rule-based",
    "breakdown": {
      "ph_points": 40.0,
      "moisture_points": 30.0,
      "temp_points": 20.0,
      "visual_points": null
    }
  },
  "advisory": {
    "severity": "ok",
    "en": "Silage quality is optimal. Safe for dairy cattle feeding.",
    "ta": "சைலேஜ் தரம் மிகச் சிறப்பாக உள்ளது. கறவை மாடுகளுக்கு பாதுகாப்பாக வழங்கலாம்."
  }
}
```

#### 2. Synchronise Offline Batches
- **Method / Path**: `POST /api/silage/bulk`
- **Headers**: `X-Device-Key: <DEVICE_API_KEY>`
- **Payload**: Array of sample test objects stored during offline field testing. Operation is fully idempotent on `sample_id`.

#### 3. Upload Sample Image for Visual & Mould Inspection
- **Method / Path**: `POST /api/image/analyze`
- **Headers**: `X-Device-Key: <DEVICE_API_KEY>`
- **Form Data**:
  - `sample_id`: `"DF01-20261002T103015-0007"`
  - `file`: `<image/jpeg binary>`
- **Response**: Updates the sample's visual features, recalculates score and mould risk.

#### 4. Retrieve Telemetry History & Filters
- **Method / Path**: `GET /api/silage/history?device_id=DF01&feed_type=maize_silage&page=1&page_size=20`
- **Response**: Paginated list of historical tests with summary distributions.

#### 5. Expert Ground-Truth Labelling
- **Method / Path**: `POST /api/silage/{sample_id}/label`
- **Headers**: `X-Admin-Token: <ADMIN_SECRET_KEY>`
- **Payload**:
```json
{
  "expert_quality": "Good",
  "expert_mould": "Low",
  "notes": "Verified by Tamil Nadu Veterinary College field extension officer"
}
```

#### 6. System Health & Scoring Config
- `GET /api/health` — Returns status of FastAPI service, database connectivity, and loaded ML model versions.
- `GET /api/scoring` — Returns current scoring weights, pH tolerances, and temperature thresholds.

---

## Database Schema & Cloud Storage

The database runs on Supabase (PostgreSQL with Row Level Security) and Supabase Cloud Storage. The complete migration script is in `supabase/schema.sql`.

```
                    ┌───────────────────────────┐
                    │      silage_devices       │
                    ├───────────────────────────┤
                    │ device_id (PK)            │
                    │ name                      │
                    │ firmware_version          │
                    │ battery_pct               │
                    │ last_seen                 │
                    └─────────────┬─────────────┘
                                  │ 1:N
                                  ▼
                    ┌───────────────────────────┐
                    │      silage_samples       │
                    ├───────────────────────────┤
                    │ sample_id (PK)            │
                    │ device_id (FK)            │
                    │ farm_id                   │
                    │ feed_type                 │
                    │ ph                        │
                    │ moisture_pct              │
                    │ sample_temp_c             │
                    │ ambient_temp_c            │
                    │ rgb_r, rgb_g, rgb_b       │
                    │ image_path                │
                    │ quality_score             │
                    │ quality_class             │
                    │ spoilage_risk             │
                    │ mould_risk                │
                    │ scoring_method            │
                    │ expert_quality (Ground-T) │
                    │ is_simulated (Boolean)    │
                    │ created_at                │
                    └─────────────┬─────────────┘
                                  │ 1:1
                                  ▼
                    ┌───────────────────────────┐
                    │     silage_advisories     │
                    ├───────────────────────────┤
                    │ advisory_id (PK)          │
                    │ sample_id (FK)            │
                    │ severity (ok/warn/danger) │
                    │ advisory_en               │
                    │ advisory_ta               │
                    └───────────────────────────┘
```

- **Cloud Storage Bucket**: `silage-images` (private bucket storing full-resolution macro JPEG photographs indexed by `sample_id.jpg`).

---

## Repository Structure

```
dairyfeed-ai/
├── README.md                      # Comprehensive system documentation (this file)
├── CLAUDE.md                      # Core design manifesto & operational constraints
├── supabase/
│   └── schema.sql                 # Production PostgreSQL schema, indexes, RLS & storage
├── firmware/
│   ├── sensor-node/               # ESP32 Sensor Controller (PlatformIO / C++)
│   │   ├── include/pins.h         # GPIO pin declarations & hardware bus mapping
│   │   ├── include/config.h       # Default sensor thresholds & Wi-Fi configuration
│   │   ├── include/secrets.h      # Credentials (gitignored)
│   │   └── src/main.cpp           # Acquisition loop, ADC sampling, OLED UI & HTTP
│   └── cam-node/                  # ESP32-CAM Node (PlatformIO / C++)
│       └── src/main.cpp           # Camera initialization, UART listener & JPEG streaming
├── backend/                       # High-Performance FastAPI Service (Python 3.11+)
│   ├── .env.example               # Template environment configuration
│   ├── requirements.txt           # Python dependencies (FastAPI, Pydantic, Scikit-learn)
│   ├── app/
│   │   ├── main.py                # FastAPI initialization & route registration
│   │   ├── config.py              # Pydantic settings & environment loader
│   │   ├── db.py                  # Supabase client + resilient in-memory repository
│   │   ├── scoring_config.yaml    # Scoring weights, pH ranges, and temp thresholds
│   │   ├── models/                # Pydantic schemas for requests, responses & telemetry
│   │   ├── routers/               # Modular REST endpoints
│   │   │   ├── silage.py          # Ingestion, query, and bulk sync
│   │   │   ├── image.py           # Image reception and analysis
│   │   │   ├── advisory.py        # Bilingual advisory lookups
│   │   │   └── stats.py           # Fleet statistics & quality charts
│   │   └── services/              # Business logic
│   │       ├── scoring.py         # 100-point transparent scoring engine
│   │       ├── predictor.py       # ML model inference & validation fallback
│   │       ├── features.py        # Tabular and visual feature engineering
│   │       └── advisory.py        # Rule-based bilingual recommendation generator
│   ├── scripts/
│   │   └── simulate_device.py     # Hardware-free multi-device simulator
│   └── tests/                     # 77 automated unit and integration tests
├── ml/                            # Machine Learning Training Pipeline
│   ├── export_dataset.py          # Gated dataset extraction (filters out simulated data)
│   ├── train_tabular.py           # 5-fold cross-validated Random Forest training
│   ├── train_image.py             # Computer vision mould classifier
│   └── README.md                  # Machine learning operations guide
├── frontend/                      # Mobile-First Farmer Dashboard (React + Vite)
│   ├── package.json               # Frontend dependencies (Tailwind, Lucide, Recharts)
│   ├── vite.config.js             # Vite development server configuration
│   └── src/
│       ├── i18n/                  # Bilingual localization files (en.json, ta.json)
│       ├── components/            # Reusable UI widgets (ScoreBreakdown, SensorBadge)
│       └── pages/                 # Views (Dashboard, LiveTest, History, ExpertLabel)
└── docs/                          # In-Depth Engineering Documentation
    ├── architecture.md            # Hardware roles, data contracts & sequence diagrams
    ├── wiring.md                  # Schematics, pin wiring tables & electrical notes
    ├── calibration.md             # Sensor buffer calibration protocols
    ├── api.md                     # Comprehensive REST API specifications
    ├── judges-guide.md            # Hackathon judging checklist & rubrics
    └── demo-script.md             # 8-minute reproducible live judging demo script
```

---

## Quickstart & Local Development

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & npm
- (Optional) PlatformIO for flashing hardware

### 1. Backend Setup

```bash
cd dairyfeed-ai/backend

# Create and activate virtual environment
python -m venv .venv
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy default environment variables (pre-configured for instant local demo)
cp .env.example .env

# Launch FastAPI development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*The FastAPI interactive Swagger documentation is immediately available at `http://127.0.0.1:8000/docs`.*

### 2. Frontend Dashboard Setup

```bash
cd dairyfeed-ai/frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```
*Open your browser at `http://localhost:5173` to interact with the bilingual dashboard.*

---

## Hardware Simulation Mode

You can demonstrate, evaluate, and test the entire ecosystem **without requiring physical ESP32 hardware**:

```bash
cd dairyfeed-ai/backend
source .venv/bin/activate # or .venv\Scripts\Activate.ps1 on Windows

# Generate 40 realistic silage tests across 14 simulated days for devices DF01 and DF02
python scripts/simulate_device.py --count 40 --days 14 --devices DF01 DF02 --endpoint http://127.0.0.1:8000/api/silage/test
```

- Generates genuine distributions of Good, Moderate, and Poor silage batches.
- Every simulated test is stamped with `"flags": {"simulated": true}`.
- Guarantees zero leakage into downstream machine learning pipelines.

---

## Testing & Verification

The codebase includes an extensive suite of automated tests verifying scoring edge cases, safety caps, API routes, and ML validation gates:

### Running Backend Tests
```bash
cd dairyfeed-ai/backend
pytest -v
# Output: 77 passed in 1.4s
```

### Running Machine Learning Pipeline Tests
```bash
cd dairyfeed-ai/backend
pytest ../ml/tests/ -v
# Output: 11 passed
```

### Running Integrated System Verification
Verify the end-to-end integration between DairyFeed AI and the parent UZHAVU KAAPPAAN Express engine:
```bash
# In project root:
python test_dairyfeed_integration.py
```

---

## Judges & Evaluators Evaluation Guide

| Evaluation Criteria | How DairyFeed AI Addresses It |
|---|---|
| **Novelty & Innovation** | Integrates low-cost multi-spectral sensing (TCS3200) + dual-probe thermometry ($\Delta T$) + acidity (pH) into a unified portable on-farm triage device costing under ₹3,500 ($45 USD). |
| **Technical Depth** | Decoupled dual-node microcontroller design (ESP32 + ESP32-CAM) linked via UART; idempotent data ingestion; ADS1115 noise immunity; offline-first buffering. |
| **Trust & Explainability** | Zero black-box outputs. Scores provide full arithmetic point breakdowns; transparent validation gates prevent deployment of unverified AI models. |
| **Rural Inclusivity** | Full Tamil (தமிழ்) and English bilingual interface; designed for mobile browsers in field conditions; voice audio playback support. |
| **Circular Economy** | Links livestock health directly with crop rotation and soil restoration through the Integrated Farming System (IFS) loop. |

---

## Team & Attribution

Developed under **HACK-2K26 / SIH 26111** as part of the **UZHAVU KAAPPAAN (உழவு காப்பான்)** smart agriculture initiative.  
Main GitHub Repository: [https://github.com/THICHANAMOORTHY/FARM-ROTATION](https://github.com/THICHANAMOORTHY/FARM-ROTATION)

# UZHAVU KAAPPAAN (உழவு காப்பான்) — Smart Crop Rotation & Soil Restorer

[![GitHub](https://img.shields.io/badge/GitHub-THICHANAMOORTHY%2FFARM--ROTATION-181717?style=flat-square&logo=github)](https://github.com/THICHANAMOORTHY/FARM-ROTATION)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Data](https://img.shields.io/badge/Datasets-3%20Kaggle%20sources%20%C2%B7%2044%2C982%20records-blue.svg?style=flat-square&logo=kaggle)](#data)
[![Crops](https://img.shields.io/badge/Crops-60-success.svg?style=flat-square)](#the-60-crops)
[![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20bcrypt-orange.svg?style=flat-square)](#accounts-and-email-verification)
[![IoT](https://img.shields.io/badge/IoT-ESP32%20live%20sensors-blueviolet.svg?style=flat-square)](#esp32-live-soil-sensor)
[![Languages](https://img.shields.io/badge/UI-English%20%7C%20%E0%AE%A4%E0%AE%AE%E0%AE%BF%E0%AE%B4%E0%AF%8D-lightgrey.svg?style=flat-square)](#frontend)

**Problem statement:** P025 — Smart Crop Rotation & Soil Restorer &nbsp;·&nbsp; **Hackathon:** HACK-2K26

UZHAVU KAAPPAAN is a farmer-facing agronomy web app. It scores a field's soil health (from manual entry or a live ESP32 sensor), ranks candidate crops from a 60-crop dataset, builds three-season rotation plans that restore the soil, simulates how the soil recovers under each plan, shows hyperlocal weather advisories, and answers questions through a bilingual (English / Tamil) AI chatbot with voice.

Everything external is optional. With no configuration at all the app runs on built-in demo data, so it works offline for a demo.

---

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Data](#data)
- [Analysis engine](#analysis-engine)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Accounts and email verification](#accounts-and-email-verification)
- [ESP32 live soil sensor](#esp32-live-soil-sensor)
- [DairyFeed AI & Integrated Farming (IFS)](#dairyfeed-ai--integrated-farming-system-ifs)
- [B2B Enterprise Model & FPO Command](#b2b-enterprise-model--fpo-command)
- [API reference](#api-reference)
- [Frontend](#frontend)
- [Project structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security notes](#security-notes)
- [Known limitations and roadmap](#known-limitations-and-roadmap)
- [Troubleshooting](#troubleshooting)
- [Authors and license](#authors-and-license)

---

## Features

| Area | What it does |
|---|---|
| **Soil analysis** | Scores N, P, K, pH and organic carbon into a 0–100 health score with a list of deficiencies. Enter values by hand, or switch to **Live Sensor** mode to stream them from an ESP32. |
| **Crop history** | Records past crops and detects repeated or continuous cultivation, with the resulting nutrient pressure and which crop families to rotate into. |
| **Crop evaluation** | Filters candidate crops by season, water and rotation, then ranks them on seven weighted dimensions with projected yield, revenue and profit per acre. |
| **Rotation optimizer** | Builds three 3-season plans — status quo, recommended restorative, and alternative — and projects profit and final soil health for each. |
| **Soil simulation** | Season-by-season model of nitrogen, phosphorus, potassium and organic carbon under a chosen plan (legumes fix nitrogen, heavy feeders draw it down). |
| **DairyFeed AI & IFS** | Rapid silage & forage testing with dual-node IoT (ESP32 + ESP32-CAM), 0–100 scoring, bilingual advisory (EN / தமிழ்), and closed-loop cattle nutrition & manure-to-soil cycling. |
| **B2B & FPO Command** | Multi-tenant platform for Farmer Producer Organizations (FPOs), agribusinesses and dairy cooperatives: cluster-level farm hierarchies, soil health heatmaps, crop production forecasts, IoT fleet status, and `/api/orgs/*` enterprise APIs. |
| **Recommendation** | The top crop for the farm, the best rotation sequence and the reasons behind them. |
| **GPS zones** | Splits a farm into precision micro-zones from a location. Uses preset demo zones, not real spatial data. |
| **Weather** | Live conditions and a 7-day forecast from Open-Meteo (no API key), spray, irrigation and pest-risk advisories, and a place search to switch location. |
| **Kisan AI chatbot** | Google Gemini answers when a key is set, with a rule-based engine as fallback. Speech input and spoken replies via the browser's Web Speech API, in English and Tamil. |
| **Accounts** | Sign-up and login with bcrypt, short-lived JWTs, refresh cookies and SMTP email verification. Every farmer gets their own starter farm. |
| **ESP32 integration** | Device-authenticated ingestion endpoint for a 7-in-1 RS485 soil sensor and/or a DHT11 + soil-moisture + TDS station, plus firmware and a hardware-free simulator. |
| **Exports** | Farmer Action Plan PDF, and the 60-crop dataset as CSV and JSON. |
| **Bilingual UI** | Full English / Tamil toggle covering navigation, forms, alerts and chatbot replies. |

Signing in is required to use the app: the UI opens a sign-in dialog and blocks navigation until you log in.

---

## Architecture

```
 Browser — vanilla-JS single-page app (Chart.js, custom i18n, Web Speech API)
    │   REST + JSON.  Authorization: Bearer <access token>;  refresh token in an httpOnly cookie
    ▼
 Express server (backend/server.js) ── also serves the static frontend
    ├── Agronomy engine   /api/soil-analysis  /api/crop-history  /api/candidate-crops
    │                     /api/crop-evaluation  /api/optimize-rotation  /api/soil-simulation
    │                     /api/recommendation  /api/dashboard  /api/gps-zones  /api/report
    ├── DairyFeed & IFS   /api/dairyfeed  /api/silage ──► FastAPI backend (dairyfeed-ai/)
    │                     (Silage test, batch history, cattle feeding & manure return plan)
    ├── /api/auth         accounts, sessions, email verification ──► SMTP server
    ├── /api/soil-sensor  X-Device-Key auth ◄────────────────────── ESP32 (Wi-Fi, HTTP POST)
    ├── /api/chat         ──► Google Gemini (optional)
    ├── /api/weather      ──► Open-Meteo forecast + geocoding
    └── Data layer        Supabase Postgres (optional)  ·  in-memory store (always)
```

### Where data lives

The data layer is dual-mode, and it is important to know which data goes where:

| Data | Storage |
|---|---|
| **User accounts** | Supabase `users` table when it exists, otherwise in memory. |
| **Crop / farm / season / farmer reference tables** | Read from Supabase if configured (after `npm run db:sync`), otherwise the built-in seed data. |
| **Soil tests, crop history, evaluations, rotation plans, simulations, sensor readings** | **In server memory only.** They reset when the server restarts. |
| **Farmer and farm profiles of signed-up users** | In memory, rebuilt from the user row at every login (same IDs), so accounts survive restarts. |

The scoring routes always use the in-memory crop list built from `backend/data/kaggle_crops.js`.

---

## Data

### Source datasets

Three Kaggle datasets are merged by `process_crop_dataset.py` into one 60-crop model (44,982 records in total):

| Dataset | Rows | What it provides |
|---|---|---|
| [`anshtanwar/current-daily-price-of-various-commodities-india`](https://www.kaggle.com/datasets/anshtanwar/current-daily-price-of-various-commodities-india) | 23,093 | APMC mandi prices (a one-week snapshot across 224 commodities) — the market price per crop. |
| [`madhuraatmarambhagat/crop-recommendation-dataset`](https://www.kaggle.com/datasets/madhuraatmarambhagat/crop-recommendation-dataset) | 2,200 | Sensor-style N, P, K, pH, temperature, humidity and rainfall for 22 crops. |
| [`akshatgupta7/crop-yield-in-indian-states-dataset`](https://www.kaggle.com/datasets/akshatgupta7/crop-yield-in-indian-states-dataset) | 19,689 | Yield, rainfall, fertilizer and pesticide use, seasons and top states for 49 crops. |

### How each crop record is built

Each of the 60 crops has 22 fields (see the header of `backend/data/kaggle_crops.js`):

- **Soil and climate needs** — median N/P/K demand, ideal pH range (mean ± 0.75), average temperature and humidity. Crops without recommendation-dataset rows get these estimated from fertilizer intensity and a per-family default.
- **Yield and risk** — median yield converted to kg/acre, average rainfall (which sets the High / Medium / Low water requirement), a disease-risk index derived from pesticide intensity, suitable seasons and top producing states.
- **Economics** — `avg_market_price` (Rs/kg) is the median modal mandi price for the 27 crops present in the price dataset. Others use a small fallback table, or Rs 35/kg. Cultivation cost per acre comes from a fixed table in the script.
- **Provenance** — `total_records` and `data_sources` record which datasets contributed to each crop.

> Prices come from a single week of quotes, so they are a snapshot and can be volatile (Tomato, for example, is Rs 79.5/kg in the current data).

### The 60 crops

| Family | Count | Crops |
|---|---|---|
| Legume | 14 | Black Gram, Chickpea, Cowpea, Green Gram, Groundnut, Horse-gram, Khesari, Kidney Bean, Moth Bean, Peas & Beans, Pigeon Pea, Red Lentil, Sannhamp, Soybean |
| Fruit | 12 | Apple, Arecanut, Banana, Cashewnut, Coconut, Grapes, Mango, Muskmelon, Orange, Papaya, Pomegranate, Watermelon |
| Cereal | 8 | Bajra, Barley, Jowar, Maize, Ragi, Rice, Small millets, Wheat |
| Oilseed | 7 | Castor seed, Linseed, Mustard, Niger seed, Safflower, Sesamum, Sunflower |
| Spices | 5 | Black pepper, Cardamom, Coriander, Ginger, Turmeric |
| Commercial | 5 | Coffee, Cotton, Jute, Sugarcane, Tobacco |
| Vegetable | 5 | Garlic, Onion, Potato, Sweet Potato, Tapioca |
| Other | 3 | Dry chillies, Guar seed, Mesta |
| Solanaceae | 1 | Tomato |

Coverage is uneven: some crops (Potato, Onion, Wheat) have thousands of supporting records, others (Guar seed, Khesari, Cardamom) only tens.

### Demo seed data

`backend/data/seed.js` provides seven demo farms (IDs 101–107: Coimbatore, Nashik, Ludhiana, Guntur, Varanasi, Indore, Mysuru), one farmer, a lab-report soil row per farm, a few crop-history rows and one weather row. Farm **101** (Coimbatore, 4.5 acres, drip irrigation, three seasons of Tomato) is the default demo farm.

### Regenerating the dataset

```bash
pip install kagglehub
python process_crop_dataset.py
```

This downloads the three datasets into the local `kagglehub` cache and rewrites `backend/data/kaggle_crops.js`. The CSV and JSON in `downloads/` are exports of that file; there is currently no script that regenerates them.

> `process_indian_crop_yield.py` is an older single-dataset script. Do not run it: it overwrites `kaggle_crops.js` with yield-only data.

---

## Analysis engine

### Soil health score

`backend/utils/soilScoring.js`, shared by manual entry and the ESP32 route. Each nutrient is scored as `value / ideal`, capped at 100:

| Component | Ideal | Weight |
|---|---|---|
| Nitrogen | 120 kg/ha | 25% |
| Phosphorus | 45 kg/ha | 20% |
| Potassium | 90 kg/ha | 20% |
| pH | 6.0–7.5 scores 100; falls 40 points per pH unit outside the band | 20% |
| Organic carbon | 1.0 % | 15% |

A component scoring below 50 is reported as a deficiency (Low Nitrogen, Low Phosphorus, Low Potassium, pH Imbalance, Low Organic Carbon). Example: N 110, P 40, K 85, pH 6.8, OC 0.9 gives a score of 93 with no deficiencies.

### Candidate filtering

`GET /api/candidate-crops` keeps a crop only if it passes all three checks:

1. **Season** — the crop is suitable for the requested season (Kharif, Rabi or Zaid).
2. **Water** — its water requirement fits the farm's irrigation type (Rainfed and Low allow Low; Drip and Moderate allow Low and Medium; Canal and High allow all).
3. **Rotation** — the farm has not already grown it twice or more.

### Crop evaluation (seven dimensions)

`POST /api/crop-evaluation` scores each candidate 0–100 and ranks by the weighted total:

| Dimension | Weight | How it is scored |
|---|---|---|
| Soil suitability | 22% | 40% pH fit against the crop's ideal range, 60% N/P/K match. |
| Rotation | 20% | High for a crop family not in the farm's history, low for a repeat. |
| Season | 18% | Validated at the filter stage; scored 90–100. |
| Water | 15% | Crop requirement vs. irrigation, plus a small bonus for matching local rainfall. |
| Profit | 13% | `(yield × price − cost)` per acre, where Rs 30,000 = 100. |
| Disease risk | 8% | `100 − disease_risk_index`. |
| Climate fit | 4% | Temperature (60%) and humidity (40%) against the crop's averages. |

Expected yield and cost are each varied by a random ±10–15%, then converted to predicted revenue and profit. See [known limitations](#known-limitations-and-roadmap): several dimensions include randomness, so repeated runs give slightly different scores.

### Rotation optimizer

`POST /api/optimize-rotation` takes the top three evaluated crops and builds three plans over `horizon_seasons` (default 3), each starting from the farm's last crop:

| Plan | Sequence | Intent |
|---|---|---|
| **A** | last crop repeated | Status quo — shows the cost of not rotating. |
| **B** | last crop → top 1 → top 2 | **Recommended** — restorative and profitable. |
| **C** | last crop → top 2 → top 3 | Alternative, more diversified. |

### Soil simulation

`POST /api/soil-simulation` steps the soil through a plan's seasons:

- **Nitrogen-fixing legume:** nitrogen +20 kg/ha (capped at 160), organic carbon +0.1 (capped at 2.0).
- **Any other crop:** nitrogen −0.3 × the crop's N demand (floor 20), phosphorus −0.2 × P demand (floor 10), potassium −0.2 × K demand (floor 20).
- **Organic carbon:** −0.08 for high-water crops, otherwise +0.05.
- The health score is recomputed after each season with the same formula as above.

### Monoculture detection

`POST /api/crop-history` reports `Repeated crop` (same crop twice, medium nutrient pressure) or `Continuous cultivation` (three or more, high pressure), the most-repeated crop, and which of the Legume, Cereal, Solanaceae and Asteraceae families are absent from the history.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JavaScript (no build step), Chart.js 4, html2pdf.js, custom i18n, Web Speech API |
| Backend | Node.js 18+, Express 4 |
| Database | Supabase (PostgreSQL) — optional, with in-memory fallback |
| Auth | `bcryptjs` (cost 12), `jsonwebtoken`, `cookie-parser`, `express-rate-limit` |
| Email | `nodemailer` over any SMTP provider |
| AI | `@google/generative-ai` (Gemini) — optional |
| Weather | Open-Meteo forecast and geocoding APIs (no key) |
| IoT | ESP32 (Arduino C++) with `ModbusMaster`, `ArduinoJson`, `DHT` |
| Data tooling | Python 3 — `kagglehub`, `reportlab` |
| Hosting | Netlify (static frontend + serverless function) or any Node host |

---

## Getting started

### Prerequisites

- Node.js 18 or newer (the ESP32 simulator uses the built-in `fetch`)
- npm
- Python 3.8+ (only for the dataset pipeline, the PDF generator and the API test script)

### 1. Install

```bash
git clone https://github.com/THICHANAMOORTHY/FARM-ROTATION.git
cd FARM-ROTATION/backend
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

Every variable is optional (see [Configuration](#configuration)). To enable sign-up and login that survive a restart, generate two JWT secrets and paste them into `backend/.env`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run it twice, once for `JWT_ACCESS_SECRET` and once for `JWT_REFRESH_SECRET`.

### 3. Run

```bash
npm start
```

Open **http://localhost:3000**. The server reads `backend/.env` relative to its own location, so you can also run `npm start` from the repository root.

The boot log states which mode each part is in, for example:

```
⚡ [Database] Connected to Supabase Cloud            (or: Using in-memory fallback)
✉️  [Auth] SMTP not configured — dev mode
⚠️  [Auth] Supabase "users" table unavailable … accounts are kept in memory
```

### 4. Create an account

Use **Sign Up** in the sign-in dialog. With no SMTP configured the app is in dev mode: you are signed in immediately and the verification link is shown on screen. See [Accounts and email verification](#accounts-and-email-verification) to turn on real emails.

### Windows / PowerShell note

Windows PowerShell 5.1 does not support `&&`. Run commands on separate lines, or chain them with `;`:

```powershell
cd backend; npm start
```

---

## Configuration

All variables live in `backend/.env` and are optional. `backend/.env.example` documents each one.

| Variable | Purpose | If unset |
|---|---|---|
| `PORT` | HTTP port | `3000` |
| `SUPABASE_URL`, `SUPABASE_KEY` | Persistent Postgres storage | In-memory data |
| `GEMINI_API_KEY` | AI chatbot replies | Rule-based chatbot |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Signing keys for login sessions | A random secret per boot — **every restart logs everyone out** |
| `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES` | Token lifetimes | `15m` / `30d` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Outgoing mail server | Dev mode (no email) |
| `MAIL_FROM` | From address of verification emails | Dev mode (no email) |
| `APP_BASE_URL` | Public URL used to build the link in emails | `http://localhost:<PORT>` |
| `ESP32_DEVICE_KEY` | Shared secret an ESP32 must send | `/api/soil-sensor/ingest` returns 503 |
| `NODE_ENV=production` | Marks the refresh cookie `secure` (HTTPS only) | Cookie also works over plain HTTP |

Email verification is enforced only when **both** `SMTP_HOST` and `MAIL_FROM` are set.

### Optional: Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor. It creates the reference tables and the `users` table (block "13. Users").
3. Put `SUPABASE_URL` and `SUPABASE_KEY` in `backend/.env`.
4. Load the crops and demo farms:
   ```bash
   npm run db:sync
   ```

`db:sync` **clears and reloads** the `crops` and `crop_history` tables, and upserts the seasons, farmers, farms, soil and weather rows from the demo data, so run it only on a project you are happy to overwrite. Re-run it after regenerating the crop dataset so the database matches `kaggle_crops.js`.

### Optional: Gemini

Create a key in Google AI Studio and set `GEMINI_API_KEY`. The chatbot tries a list of Gemini models in order with a 6-second budget, and falls back to the built-in rule engine if none answers.

---

## Accounts and email verification

### Session model

- **Access token:** a JWT valid for 15 minutes, kept in browser memory and sent as `Authorization: Bearer …`.
- **Refresh token:** valid for 30 days in an `httpOnly` cookie (`ukp_refresh`, `SameSite=Lax`, path `/api/auth`, `secure` in production). Each refresh rotates it.
- On page load the app makes one silent refresh, and on any `401` it retries once after refreshing.
- Passwords are at least 8 characters and hashed with bcrypt (cost 12). Register, login, verify and resend are rate-limited to 30 requests per 15 minutes per IP.

### What a new account gets

Registering creates a **farmer** account and a starter farm (1 acre, rainfed, Coimbatore coordinates) with the stable ID `1000 + farmer_id`. The dashboard, soil analysis, history, evaluation, rotation, recommendation and weather all follow the signed-in user's own farm. A new farm has no soil test yet, so the dashboard shows "No soil test yet" until you run a Soil Analysis.

### Email verification

With SMTP configured:

1. Sign-up sends a single-use link (valid 24 hours). Only its SHA-256 hash is stored.
2. No session is issued until the link is used; logging in earlier returns `403 EMAIL_NOT_VERIFIED`.
3. The link opens a confirmation page; its button completes the verification, so mail scanners that pre-open links cannot consume the token.
4. "Resend verification email" has a 60-second cooldown and answers the same way whether or not the address has an account.

Without SMTP the app runs in **dev mode**: sign-up logs you straight in, and the verification link is returned in the API response and logged to the console.

### Setting up real email (Gmail example)

1. Turn on 2-Step Verification for the Google account and create an **App Password** (16 characters).
2. Add to `backend/.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=you@gmail.com
   SMTP_PASS=<16-character app password, no spaces>
   MAIL_FROM="UZHAVU KAAPPAAN <you@gmail.com>"
   APP_BASE_URL=http://localhost:3000
   ```
3. Check the settings before using the app:
   ```bash
   cd backend
   npm run mail:test            # sends a sample email to SMTP_USER
   npm run mail:test -- someone@example.com
   ```
4. Restart the server. The boot log should say `Email verification ON`.

Any SMTP provider works (Brevo, SendGrid, SES, Mailgun). Set `APP_BASE_URL` to your real site URL when deploying, because it is what goes into the email link.

### Persisting accounts

Run the "13. Users" block of `supabase/schema.sql` so accounts are stored in Supabase. The table has no foreign keys by design: farmer and farm profiles are rebuilt in memory from the user row at each login. If you created the table from an older schema that had a foreign key, run:

```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_farmer_id_fkey;
```

---

## ESP32 live soil sensor

### How it works

An ESP32 posts JSON readings over Wi-Fi to `POST /api/soil-sensor/ingest`, authenticated by a shared secret in the `X-Device-Key` header (independent of user logins). The Soil Analysis page in **Live Sensor** mode polls `GET /api/soil-sensor/latest` every 4 seconds and shows the connection state: 🟢 live (a reading in the last 30 seconds), 🟡 signal lost (showing the last reading), or 🔴 never connected.

Two kinds of device can report for the same farm and are merged into one view:

| Device | Reports |
|---|---|
| 7-in-1 RS485 soil sensor | `nitrogen`, `phosphorus`, `potassium`, `ph`, `organic_carbon` (sent together) |
| DHT11 + soil moisture + TDS station | `air_temperature`, `air_humidity`, `soil_moisture`, `tds` |

Fields a request does not include are carried over from the farm's last reading, so an environment-only device never blanks out an existing soil test. A request with nutrients also adds a scored soil test to the farm's history (`source: "esp32"`), so the dashboard and rotation logic pick it up.

### 1. Set the device key

Generate a key and put it in `backend/.env`:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```
```
ESP32_DEVICE_KEY=<the generated value>
```

Use the same value in the `DEVICE_KEY` constant of the sketch you flash. **Never commit a real key** — keep it out of the sketches and the README before pushing, and rotate it if it has ever been committed.

### 2. Try it without hardware

```bash
cd backend
npm run sim:esp32              # full NPK/pH/OC sensor, farm 101
npm run sim:esp32 -- 105       # a specific farm
npm run sim:esp32:env          # DHT11-style environment readings only
```

Then open **Soil Analysis** and switch to **Live Sensor**.

### 3. Or post a reading yourself

```bash
curl -X POST http://localhost:3000/api/soil-sensor/ingest \
  -H "Content-Type: application/json" \
  -H "X-Device-Key: <your ESP32_DEVICE_KEY>" \
  -d '{
    "farm_id": 101, "device_id": "esp32-field-01",
    "nitrogen": 65, "phosphorus": 35, "potassium": 75, "ph": 6.8, "organic_carbon": 0.75,
    "air_temperature": 28.5, "air_humidity": 62, "soil_moisture": 48, "tds": 340
  }'
```

`tds` can be replaced by `conductivity` (µS/cm), which is converted as `round(conductivity × 0.5)`. Errors: `401` wrong or missing key, `503` no `ESP32_DEVICE_KEY` set on the server, `400` incomplete nutrient set or non-numeric values.

### 4. Flash real hardware

Sketches are in [`esp32/`](esp32/). Set the Wi-Fi name and password, `SERVER_HOST` (the **LAN IP** of the machine running the server — not `localhost`), the `DEVICE_KEY`, and `FARM_ID`. The server listens on all interfaces, and the PC's firewall must allow the port.

**Option A — `soil_sensor_client.ino`** (libraries: `ArduinoJson`, `ModbusMaster`)

| Module pin | ESP32 pin | Notes |
|---|---|---|
| MAX485 DI | GPIO 17 (TX2) | Serial transmit |
| MAX485 RO | GPIO 16 (RX2) | Serial receive |
| MAX485 DE + RE | GPIO 4 | Direction control, tied together |
| MAX485 VCC / GND | 3.3 V or 5 V / GND | Module power |
| Sensor RS485 A / B | MAX485 A / B | Differential pair |
| Sensor power | External 12 V DC | Do not power a 12 V sensor from the ESP32 |

**Option B — `dht11_soil_moisture_client.ino`** (libraries: `DHT sensor library`)

| Component | ESP32 pin | Notes |
|---|---|---|
| DHT11 data | GPIO 4 | With pull-up; power 3.3 V |
| Soil-moisture probe (analog) | GPIO 34 | ADC1; calibrate `SOIL_DRY_VALUE` / `SOIL_WET_VALUE` |
| TDS sensor (analog) | GPIO 35 | ADC1; temperature-compensated using the DHT11 reading |

The DHT11 sketch also serves a small local debug web page from the ESP32.

> The RS485 sensor does not measure organic carbon; its sketch estimates it from conductivity and moisture as a rough proxy. Use a lab value or manual override where that matters.

---

## DairyFeed AI & Integrated Farming System (IFS)

**SIH Problem ID:** 26111 &nbsp;·&nbsp; **Ministry:** Fisheries, Animal Husbandry & Dairying &nbsp;·&nbsp; **Theme:** Agriculture, FoodTech & Rural Development

UZHAVU KAAPPAAN integrates **DairyFeed AI** to create a complete **Integrated Farming System (IFS) closed biological loop**. Fodder crops recommended during restorative rotations (such as Maize, Sorghum, and Cowpea) feed the farm's dairy cattle herd, while fermented silage quality is monitored rapidly on-farm, and farmyard manure (FYM) returns vital organic carbon and NPK back into the soil:

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                 UZHAVU KAAPPAAN — INTEGRATED FARMING LOOP              │
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

### Key Capabilities

1. **Dual-Node Portable Probe (ESP32 + ESP32-CAM)**:
   - **Sensor Node (ESP32)**: Measures silage acidity (pH probe via ADS1115 16-bit ADC), relative moisture (capacitive probe v1.2), temperature elevation ($\Delta T = T_{sample} - T_{ambient}$ via dual DS18B20 probes), and RGB colour reflection (TCS3200 in a sealed chamber).
   - **Camera Node (ESP32-CAM)**: Takes a synchronized macro photograph triggered via UART by shared `sample_id`.
   - **Instant OLED Display**: Shows the result directly at the silage pit in under 60 seconds.
2. **Transparent Scoring (0–100 Points)**:
   - **Acidity (40 pts)**: Optimal pH 3.8–4.2 (lactic fermentation); 0 pts if pH > 5.0.
   - **Moisture (30 pts)**: Optimal 60%–70%; penalises over-wet seepage (< 50% or > 80%).
   - **Temperature Rise (20 pts)**: Full points for $\Delta T \le 3$°C; zero points if $\Delta T > 6$°C (aerobic breakdown).
   - **Visual Appearance (10 pts)**: Evaluated from camera photo; normalised out of 90 pts when no photo is attached.
   - **Safety Caps**: High spoilage caps quality at "Moderate"; active mould forces quality to "Poor" with an immediate Danger alert.
3. **Bilingual Farmer Advisories (English & தமிழ்)**:
   - Plain-language remediation advice (ok, warn, danger) covering aerobic heating, surface spoiling, and veterinary precautions, with speech audio playback.
4. **Cattle Feed & Manure Nutrient Planner (`/api/dairyfeed/cattle-plan`)**:
   - Calculates daily silage requirements per cow (15–20 kg/day).
   - Projects herd feeding duration from harvested rotation acreage.
   - Computes daily and seasonal farmyard manure (FYM) returned to the soil, driving the Organic Carbon recovery in UZHAVU KAAPPAAN's Soil Simulation.

For comprehensive hardware schematics, calibration instructions, ML validation gating, and PlatformIO source code, see the dedicated [DairyFeed AI Documentation](dairyfeed-ai/README.md).

---

## B2B Enterprise Model & FPO Command

UZHAVU KAAPPAAN scales beyond individual smallholders into an enterprise-grade **Agri-Intelligence & Integrated Farming System (IFS) Command Platform** for Farmer Producer Organizations (FPOs), Agribusinesses, Dairy Cooperatives, and Government Programs.

```
                         UZHAVU KAAPPAAN
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
           FARMERS        B2B PARTNERS       INSTITUTIONS
              │                 │                 │
         Individual         Agribusinesses       FPOs
         Farmers            Agri Companies      Cooperatives
                             Dairy Companies    NGOs
                             Food Companies     Govt Programs
                             Input Companies
```

### 1. FPO Cluster-Level Multi-Tenancy
Instead of isolated single-farmer silos, the platform deploys a multi-tiered hierarchy:
`FPO Organization → Regional Village Clusters → Member Farms → Individual Farmers`.

The **FPO Command Center** (`GET /api/orgs/:id/dashboard`) provides:
- **Total Footprint Overview:** Registered farmers (e.g. 1,240), active farms (860), and managed acreage (5,420 acres).
- **Regional Soil Health Indices:** Geospatial distributions (Healthy 42%, Moderate 38%, Degraded 20%) with cluster-level nitrogen, phosphorus, and organic carbon deficiency trends.
- **Aggregated Crop Production:** Forecasts harvest volumes across member farms for collective market bargaining and Mandi procurement.
- **IoT Telemetry Fleet:** Real-time visibility into active/offline soil sensor and silage probe nodes.

### 2. Agribusiness & Food Processor Integration
- **Forward Production Visibility:** Seed, fertilizer, and food processing companies monitor crop variety adoption and harvest timing across contract-farming networks.
- **Strict Agronomic Neutrality:** Rotation optimization remains 100% transparent and objective; recommendations are never biased toward commercial sponsor inputs.

### 3. Dairy Cooperatives & The Closed-Loop Differentiator
- Combines crop rotation (fodder maize/sorghum/cowpea) with **DairyFeed AI** silage screening to protect dairy herds from mycotoxins and acidosis.
- Quantifies seasonal farmyard manure (FYM) returned to the soil to rebuild organic carbon, closing the biological nutrient cycle.

### 4. IoT-as-a-Service (IoTaaS)
- Commercial bundles combining hardware deployment, routine sensor probe calibration, continuous telemetry ingestion, and automated SMS/WhatsApp alerts.

For full architectural blueprints, tenant schemas, and revenue models, see [B2B Business Model & Architecture](B2B_BUSINESS_MODEL.md).

---

## API reference

Base URL `http://localhost:3000`. All endpoints return JSON except the downloads. Farm-scoped endpoints take `farm_id` (default `101`).

### System and reference data

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Status and which database mode is active |
| `GET` | `/api/db-status` | Whether Supabase is configured, with setup hints |
| `GET` | `/api/crops` | The 60 crops (from Supabase if configured, otherwise the built-in data) |
| `GET` | `/api/farms` · `/api/farmers` · `/api/seasons` | Reference tables |

### Agronomy engine

| Method | Endpoint | Body / query | Description |
|---|---|---|---|
| `POST` | `/api/soil-analysis` | `farm_id, nitrogen, phosphorus, potassium, ph, organic_carbon` | Scores and stores a soil test. Returns `soil_health_score`, `deficiencies`, `adequate`. |
| `GET` | `/api/soil-analysis` | `farm_id` | Latest soil test for a farm |
| `POST` | `/api/crop-history` | `farm_id, history: [{crop, season, year, yield, cost, revenue}]` | Stores history and returns the rotation issue |
| `GET` | `/api/crop-history` | `farm_id` | Stored history |
| `GET` | `/api/candidate-crops` | `farm_id, season` | Crops that pass the season, water and rotation filters, plus the excluded ones with reasons |
| `POST` | `/api/crop-evaluation` | `farm_id, run_id?, candidate_crop_ids` | Ranked seven-dimension scores with projected profit |
| `POST` | `/api/optimize-rotation` | `farm_id, run_id?, horizon_seasons?` | Plans A, B and C |
| `POST` | `/api/soil-simulation` | `plan_id` | Season-by-season soil timeline for a plan |
| `GET` | `/api/recommendation` | `farm_id` | Top crop, best rotation and reasoning |
| `GET` | `/api/dashboard` | `farm_id` | Health score, alerts, soil values, recommendation, rotation and recovery curve. `farm_health` and `soil_data` are `null` until the farm has a soil test. |
| `GET` | `/api/report` | `farm_id` | Structured farm summary |
| `GET` | `/api/gps-zones` | `farm_id, lat, lon` | Preset micro-zones for a location |
| `POST` | `/api/gps-zones/analyze` | `farm_id, lat, lon, custom_zones?` | Zone analysis |
| `GET` | `/api/weather` | `farm_id` or `lat, lon` (`location_name` optional) | Current weather, 7-day forecast, advisories |
| `GET` | `/api/weather/search` | `q` | Place search (Open-Meteo geocoding) |
| `POST` | `/api/chat` | `message, farm_id?, lang?` (`en` or `ta`) | Chatbot reply, with the provider that produced it |

### Accounts (`/api/auth`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | `{name, email, password, phone?}` — creates a farmer account. Returns `verification_required` when SMTP is on, otherwise a session and the dev link. |
| `POST` | `/login` | `{email, password}` — returns an access token and sets the refresh cookie. `403 EMAIL_NOT_VERIFIED` if unverified. |
| `POST` | `/refresh` | Rotates the refresh cookie and returns a new access token |
| `POST` | `/logout` | Clears the refresh cookie |
| `GET` | `/verify-email?token=…` | Confirmation page (does not consume the token) |
| `POST` | `/verify-email` | `{token}` — consumes the token |
| `POST` | `/resend-verification` | `{email}` — generic response; 60-second cooldown |
| `GET` | `/me` | The signed-in user (requires `Authorization: Bearer`) |

The user object returned by login, refresh and `/me` includes `farm_id`.

### ESP32 (`/api/soil-sensor`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/ingest` | Device-authenticated reading (`X-Device-Key`). See [ESP32 live soil sensor](#esp32-live-soil-sensor). |
| `GET` | `/latest?farm_id=…` | Latest reading with `connected`, `ever_connected`, `seconds_ago`, `device_id` |

### DairyFeed & Silage Quality (`/api/dairyfeed`, `/api/silage`)

| Method | Endpoint | Body / query | Description |
|---|---|---|---|
| `GET` | `/api/dairyfeed/summary` | — | Aggregate sample count, average quality score, quality breakdown percentages |
| `GET` | `/api/dairyfeed/history` | `page, page_size, feed_type?` | Paginated silage batch telemetry and evaluation history |
| `POST` | `/api/dairyfeed/test` | `{device_id, feed_type, farm_id, readings: {ph, moisture_pct, sample_temp_c, ambient_temp_c, rgb}}` | Scores silage sample (0–100), determines spoilage and mould risks, returns bilingual advisory (EN / TA) |
| `GET` | `/api/dairyfeed/cattle-plan` | `farm_id, cows_count, rotation_crop, area_acres` | Integrated Farming System (IFS) calculator: cattle feed requirements, silage storage duration, and farmyard manure soil replenishment |
| `GET` | `/api/dairyfeed/devices` | — | Fleet status of ESP32 silage testing probes |

### B2B Organization & FPO Command (`/api/orgs`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orgs` | List registered FPOs, dairy cooperatives, and agribusiness organizations |
| `GET` | `/api/orgs/:id` | Organization profile, leadership, and village cluster hierarchy |
| `GET` | `/api/orgs/:id/dashboard` | **B2B Command Center:** Total acreage, soil health distributions, crop split, IoT fleet status, action alerts |
| `GET` | `/api/orgs/:id/farms` | List of member farms, farmer profiles, and soil health scores |
| `GET` | `/api/orgs/:id/soil-health` | Aggregated soil N-P-K, pH, and Organic Carbon averages across the organization |
| `GET` | `/api/orgs/:id/crops` | Macro crop distribution, harvest tonnage projections, and Mandi price benchmarks |
| `GET` | `/api/orgs/:id/sensors` | Fleet telemetry: online/offline sensor nodes, battery levels, maintenance alerts |

### Downloads

| Endpoint | File |
|---|---|
| `GET /download/farmer-plan-pdf` (alias `/download/uzhavu-kaappaan-pdf`; add `?view=inline` to open in the browser) | Farmer Soil Health Action Plan PDF |
| `GET /download/crops-csv` | `CropSmart_Master_60_Crops_Agronomy_Mandi.csv` |
| `GET /download/crops-json` | `CropSmart_Master_60_Crops_Agronomy_Mandi.json` |

Unknown paths under `/api` fall through to the app shell rather than returning a JSON 404.

---

## Frontend

A dependency-free single-page app in [`frontend/`](frontend/): `index.html`, one stylesheet, and one script per view. No build step.

**Views:** Dashboard · Soil Analysis · Crop History · Crop Evaluation · Rotation Optimizer · Soil Simulation · GPS Zone Allocation · Recommendation, plus the floating Kisan AI chatbot.

- **State and routing** — `app.js` holds the global `state` (notably `state.farm_id`), the auth-aware `apiGet` / `apiPost` helpers with silent token refresh, and the view router.
- **Sign-in gate** — `navigate()` opens the sign-in dialog and stops if nobody is logged in. This is a UI convenience, not an authorization check (see [Security notes](#security-notes)).
- **Language** — `i18n.js` contains full `en` and `ta` dictionaries and re-renders the active view when you switch. Adding a language means adding another dictionary with the same keys.
- **Voice** — the chatbot uses the browser's `SpeechRecognition` and `speechSynthesis`. Support, especially for Tamil voices, depends on the browser and operating system; Chrome and Edge work best.
- **Design** — a dark "Midnight Harvest" theme. The layout collapses to a slide-in drawer plus a bottom tab bar under 768 px.
- **Charts and PDF** — Chart.js for the radar/line charts; html2pdf.js for the client-side report fallback.

---

## Project structure

```
.
├── backend/
│   ├── server.js                  Express entry point; mounts routes, serves frontend and downloads
│   ├── routes/
│   │   ├── auth.js                Accounts, sessions, email verification
│   │   ├── soilAnalysis.js        Soil test scoring and storage
│   │   ├── soilSensor.js          ESP32 ingestion and live-status polling
│   │   ├── dairyFeed.js           Silage quality engine & IFS cattle-soil nutrient loop
│   │   ├── orgs.js                B2B Multi-tenant FPO command center & analytics
│   │   ├── cropHistory.js         Monoculture detection
│   │   ├── candidateCrops.js      Season / water / rotation filtering
│   │   ├── cropEvaluation.js      Seven-dimension scoring engine
│   │   ├── optimizeRotation.js    Plans A / B / C
│   │   ├── soilSimulation.js      Nutrient recovery model
│   │   ├── recommendation.js      Final recommendation
│   │   ├── dashboard.js           Dashboard aggregation
│   │   ├── gpsZones.js            Preset precision zones
│   │   ├── weather.js             Open-Meteo weather, advisories, place search
│   │   ├── chat.js                Chatbot (Gemini with rule-based fallback)
│   │   └── report.js              Farm summary report
│   ├── utils/                     auth (bcrypt/JWT), mailer (SMTP), soilScoring, withTimeout
│   ├── middleware/requireAuth.js  JWT verification
│   ├── db/supabase.js             Supabase client with in-memory fallback
│   ├── data/
│   │   ├── kaggle_crops.js        Generated 60-crop model
│   │   └── seed.js                Demo farms, soil, history; in-memory store and counters
│   ├── scripts/
│   │   ├── sync_to_supabase.js    Load crops and demo data into Supabase
│   │   ├── clear_all_datasets.js  Wipe Supabase tables for a clean re-seed
│   │   ├── simulate_esp32.js      Pose as an ESP32
│   │   └── test_mail.js           Verify SMTP settings
│   ├── .env.example
│   └── package.json
├── dairyfeed-ai/                  SIH 26111 Smart Rapid Feed & Silage Quality System
│   ├── backend/                   FastAPI service (scoring, image analysis, ML, advisories)
│   ├── frontend/                  React + Vite bilingual dashboard (EN / TA)
│   ├── firmware/                  PlatformIO firmware (ESP32 sensor node + ESP32-CAM node)
│   ├── ml/                        Cross-validated ML pipelines & validation gates
│   ├── docs/                      Wiring, calibration, architecture & judges' guide
│   └── supabase/                  Postgres schema & silage-images bucket configuration
├── frontend/
│   ├── index.html                 App shell
│   ├── css/style.css              Design system
│   ├── js/                        app, auth, dashboard, soilAnalysis, cropHistory, evaluation,
│   │                              rotation, simulation, recommendation, gpsZones, weather,
│   │                              chatbot, i18n, reportPdf, dairyfeed
│   ├── downloads/                 Copy of downloads/ served by static hosting
│   └── _redirects                 Netlify redirects
├── esp32/
│   ├── soil_sensor_client.ino     7-in-1 RS485 soil sensor
│   └── dht11_soil_moisture_client.ino   DHT11 + soil moisture + TDS station
├── supabase/schema.sql            Tables, indexes and RLS policies
├── downloads/                     Action Plan PDF, crops CSV / JSON
├── netlify/functions/api.js       Wraps the Express app for Netlify
├── netlify.toml                   Netlify build and redirects
├── process_crop_dataset.py        Builds kaggle_crops.js from the three datasets
├── process_indian_crop_yield.py   Legacy single-dataset script (do not run)
├── generate_farmer_pdf.py         Builds the Action Plan PDF (needs reportlab)
├── test_all_apis.py               End-to-end API test
├── test_dairyfeed_integration.py  Verification test for DairyFeed AI & IFS integration
├── B2B_BUSINESS_MODEL.md          B2B enterprise model, customer segments & multi-tenancy
├── P025_database_and_backend_design.md   Database and data-structure design notes
└── README.md
```

---

## Testing

There is no unit-test framework; verification is an end-to-end script plus manual tools.

| Check | Command |
|---|---|
| Core API workflow | Start the server, then `python test_all_apis.py` |
| SMTP settings | `cd backend; npm run mail:test` |
| Live sensor pipeline | `cd backend; npm run sim:esp32` |

`test_all_apis.py` walks the full path: health → soil analysis → crop history → candidates → evaluation → rotation → simulation → recommendation → dashboard. It expects the server on port 3000 and **writes to the in-memory store**, so run it against a scratch instance if you care about the current demo state. Rankings and profit figures vary slightly between runs because of live weather and the randomness noted below.

---

## Deployment

### Netlify (configured)

`netlify.toml` publishes `frontend/`, wraps the Express app in a serverless function (`netlify/functions/api.js`) and redirects `/api/*` to it and `/download/*` to the static files. Set the environment variables from [Configuration](#configuration) in the Netlify dashboard, and set `APP_BASE_URL` to the site URL.

Serverless functions are stateless and may run as several instances, so **in-memory data is not shared or durable there**: soil tests, history and live sensor status can differ between requests or vanish. Accounts work if the Supabase `users` table exists. For the full experience, including reliable ESP32 live status, run the app on a long-lived Node process (a VM or a container platform) with `npm start`, `NODE_ENV=production`, and HTTPS in front.

### Any Node host

```bash
cd backend
npm install --omit=dev
NODE_ENV=production PORT=3000 node server.js
```

Put the environment variables in the host's secret store rather than a `.env` file.

---

## Security notes

**In place:** bcrypt password hashing; short-lived JWTs with rotating `httpOnly` refresh cookies; hashed, single-use, expiring verification tokens; rate limiting on auth routes; a device-key check on sensor ingestion; verification links built from `APP_BASE_URL`, never from request headers.

**Before exposing this publicly, be aware of:**

- **Farm data is not access-controlled.** Agronomy endpoints trust the `farm_id` you send, and the sign-in gate is client-side only. Anyone who can reach the API can read or write any farm's data.
- **CORS is open** (`cors()` with defaults), and only the auth routes are rate-limited — including `/api/chat`, which can spend Gemini quota.
- **The device key is a single shared secret.** One leaked key lets anyone post readings for any farm. Keep it out of source control, rotate it if it was ever committed, and never publish it in docs or sketches.
- **The `users` table policy in `schema.sql` is permissive** (`USING (true)`). If you use the Supabase anon key, tighten the policy or run the server with the service-role key so password hashes cannot be read with a public key.
- **Dev mode returns verification links in API responses.** Configure SMTP for anything real.
- `/api/soil-sensor/ingest` does not range-check sensor values.

---

## Known limitations and roadmap

**Analysis accuracy**

- **Scores include randomness.** Season suitability, rotation score and the yield/cost variation in `cropEvaluation.js` use `Math.random()`, so the same inputs can rank close crops differently between runs.
- **Nutrient matching is effectively neutral.** The N/P/K part of soil suitability reads per-crop statistics (`crop.stats`) that the current crop dataset does not contain, so it falls back to a neutral score and soil suitability is driven mainly by pH.
- **Prices are a one-week snapshot** and uneven across crops (see [Data](#data)).
- **GPS zones are preset demo data** (four zones derived from the coordinates), not satellite or soil-survey analysis.

**Product gaps**

- Only account records persist; soil tests, history, plans and sensor readings reset on restart.
- The chatbot's system prompt and some rule-based replies are written around the demo farm (three seasons of Tomato), so its context is only partly personalized.
- The Action Plan PDF is a pre-generated document, not built from the signed-in farm's data.
- The dashboard's location selector and weather default to Coimbatore for newly registered farms, whose location is "Unset".
- There is no password-reset flow and no way to edit the farm's profile (location, area, irrigation).
- Only English and Tamil are implemented.

**Roadmap ideas**

1. Per-user authorization on every farm route, and persistence of agronomy data in Supabase.
2. Deterministic scoring, and restoring per-crop nutrient statistics to the dataset.
3. Farm profile editing and password reset.
4. More languages (Hindi, Telugu, Kannada, Marathi) using the existing dictionary structure.
5. Real spatial analysis for GPS zones, and a PDF built from each farm's own results.

---

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| `npm run mail:test` says SMTP is not configured | `backend/.env` has no `SMTP_HOST` / `MAIL_FROM`, or the file was not saved. The startup line `injected env (N)` should count the new variables. |
| Gmail login rejected (`EAUTH`) | Use a 16-character App Password with 2-Step Verification on, not the account password. |
| Sign-up shows the link in an alert instead of sending email | The server is in dev mode — SMTP is unset, or the server was not restarted after editing `.env`. |
| Accounts disappear after a restart | The Supabase `users` table does not exist (the boot log warns about it). Run the "13. Users" block of `schema.sql`. |
| Everyone is logged out after a restart | `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` are unset, so a random secret is generated each boot. |
| Dashboard shows "No soil test yet" | A new farm has no data. Run a Soil Analysis, or post a full sensor reading. |
| Live Sensor stays red | No reading has arrived. Check `ESP32_DEVICE_KEY`, the server's LAN IP in the sketch, that the ESP32 and PC are on the same network, and the firewall. |
| Ingest returns `401` / `503` | Wrong or missing `X-Device-Key` / no `ESP32_DEVICE_KEY` set on the server. |
| `EADDRINUSE: port 3000` | Another instance is running. Stop it or set `PORT`. |
| `cd backend && npm start` fails in PowerShell | Windows PowerShell 5.1 has no `&&`; use `cd backend; npm start`. |
| `/api/crops` shows old prices | Supabase still holds the previous crop table. Run `npm run db:sync`. |
| Tamil voice does not speak or listen | The browser or OS lacks a Tamil voice or speech-recognition support. Try Chrome or Edge. |

---

## Authors and license

- **Repository:** [THICHANAMOORTHY/FARM-ROTATION](https://github.com/THICHANAMOORTHY/FARM-ROTATION)
- **Problem statement:** P025 — Smart Crop Rotation & Soil Restorer (HACK-2K26)
- Built for sustainable agriculture and farmer empowerment across India.

No `LICENSE` file is included in the repository yet. Add one before redistributing.

# soil-res-rev

// ============================================================
//  dairyFeed.js — Dairy Farm Feeder & Silage Quality Engine (SIH / IFS)
//  Connects Crop Rotation with Cattle Feeding & Silage Telemetry
//  Supports Manual Data Entry + Live ESP32 Ingestion + Supabase Cloud
// ============================================================

const express = require('express');
const router = express.Router();
const { supabase, isConfigured } = require('../db/supabase');

const FASTAPI_BASE = process.env.DAIRYFEED_BACKEND_URL || 'http://127.0.0.1:8000';
const DEVICE_KEY = process.env.DEVICE_API_KEY || 'demo-key';

// Live in-memory sample store for tests in this session
let fallbackSamples = [];

// Live ESP32 Sensor Telemetry State (uninitialized until real packet arrives)
let liveESP32State = {
  device_id: 'DF01',
  name: 'ESP32 Silage Probe (Bunk Pit #1)',
  last_seen: null,
  battery_pct: null,
  wifi_rssi: null,
  feed_type: null,
  farm_id: 101,
  readings: {
    ph: null,
    moisture_pct: null,
    sample_temp_c: null,
    ambient_temp_c: null,
    moisture_raw: null,
    rgb: null
  }
};

// Helper: proxy fetch to FastAPI if running
async function fetchFromFastAPI(endpoint, options = {}) {
  const url = `${FASTAPI_BASE}${endpoint}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Key': DEVICE_KEY,
        ...(options.headers || {})
      }
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`FastAPI returned ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    return null;
  }
}

// ── Rule-Based Silage Scorer (Mirrors Agronomic Standards) ────────
function computeSilageScore(readings, mouldRisk = 'Unknown') {
  const { ph = 4.2, moisture_pct = 65, sample_temp_c = 28, ambient_temp_c = 26 } = readings;
  const tempRise = Number((sample_temp_c - ambient_temp_c).toFixed(1));

  // pH score (0-40 points) ideal 3.8-4.4
  let phPoints = 40;
  if (ph < 3.8) phPoints = Math.max(10, 40 - (3.8 - ph) * 40);
  else if (ph > 4.4) phPoints = Math.max(0, 40 - (ph - 4.4) * 35);

  // Moisture score (0-30 points) ideal 60-70%
  let moisturePoints = 30;
  if (moisture_pct < 60) moisturePoints = Math.max(0, 30 - (60 - moisture_pct) * 2.5);
  else if (moisture_pct > 70) moisturePoints = Math.max(0, 30 - (moisture_pct - 70) * 2.5);

  // Temperature rise score (0-30 points) ideal <= 2°C
  let tempPoints = 30;
  if (tempRise > 2.0) tempPoints = Math.max(0, 30 - (tempRise - 2.0) * 4.5);

  const rawScore = Math.round(phPoints + moisturePoints + tempPoints);
  const score = Math.max(5, Math.min(100, rawScore));

  let spoilage = 'Low';
  if (ph > 5.0 || tempRise > 6.0) spoilage = 'High';
  else if (ph > 4.5 || tempRise > 3.0) spoilage = 'Medium';

  let quality = 'Good';
  if (score < 50 || spoilage === 'High' || mouldRisk === 'High') quality = 'Poor';
  else if (score < 75 || spoilage === 'Medium') quality = 'Moderate';

  let advisory = {
    level: quality === 'Good' ? 'ok' : quality === 'Moderate' ? 'warn' : 'danger',
    en: quality === 'Good'
      ? 'Optimal lactic fermentation. Moisture and core temperature are ideal. High nutritional value for dairy herd.'
      : quality === 'Moderate'
      ? 'Silage quality is moderate. Slight heating or moisture imbalance detected. Consume outer silage face within 2 days.'
      : 'Poor quality feed. Aerobic degradation and core heating detected. Discard dark or slimy sections immediately.',
    ta: quality === 'Good'
      ? 'சிறந்த லாக்டிக் அமில நொதித்தல். உகந்த ஈரப்பதம் மற்றும் வெப்பநிலை. கறவை மாடுகளுக்கு அதிக சத்துக்கள் அளிக்கும்.'
      : quality === 'Moderate'
      ? 'மிதமான தரம். லேசான சூடு அல்லது ஈரப்பத வேறுபாடு. குழி முகப்பை 2 நாட்களுக்குள் பயன்படுத்தி முடிக்கவும்.'
      : 'குறைந்த தரம். காற்று பட்டு சூடாகி கெட்டுள்ளது. கருத்த அல்லது வழவழப்பான பகுதிகளை உடனே அப்புறப்படுத்தவும்.'
  };

  return {
    quality,
    spoilage_risk: spoilage,
    mould_risk: mouldRisk,
    score,
    breakdown: {
      ph: Math.round(phPoints),
      moisture: Math.round(moisturePoints),
      temperature: Math.round(tempPoints),
      temp_rise_c: tempRise,
      visual: null
    },
    advisory
  };
}

// ── GET /api/dairyfeed/live — Real-Time ESP32 Telemetry Status ───────
router.get('/live', (req, res) => {
  const isLive = liveESP32State.last_seen && (Date.now() - liveESP32State.last_seen < 60000);
  res.json({
    status: isLive ? 'online' : 'idle',
    is_live: Boolean(isLive),
    seconds_since_last: liveESP32State.last_seen ? Math.round((Date.now() - liveESP32State.last_seen) / 1000) : null,
    device: {
      device_id: liveESP32State.device_id,
      name: liveESP32State.name,
      battery_pct: liveESP32State.battery_pct,
      wifi_rssi: liveESP32State.wifi_rssi,
      farm_id: liveESP32State.farm_id
    },
    telemetry: liveESP32State.readings,
    feed_type: liveESP32State.feed_type
  });
});

// ── POST /api/dairyfeed/simulate-esp — Emulate live ESP32 Telemetry Broadcast ─
router.post('/simulate-esp', (req, res) => {
  const profile = req.body?.profile || 'good'; // 'good', 'heating', 'sour'

  let ph = 4.15;
  let moist = 64.5;
  let sTemp = 28.1;
  let aTemp = 25.5;
  let r = 142, g = 138, b = 52;
  let feed_type = req.body?.feed_type || 'maize_silage';

  if (profile === 'heating') {
    ph = +(4.65 + (Math.random() * 0.2 - 0.1)).toFixed(2);
    moist = +(71.0 + (Math.random() * 2 - 1)).toFixed(1);
    sTemp = +(32.5 + (Math.random() * 1.5 - 0.7)).toFixed(1);
    r = 125; g = 118; b = 42;
  } else if (profile === 'sour') {
    ph = +(5.35 + (Math.random() * 0.3 - 0.15)).toFixed(2);
    moist = +(78.5 + (Math.random() * 3 - 1.5)).toFixed(1);
    sTemp = +(36.2 + (Math.random() * 2 - 1)).toFixed(1);
    r = 90; g = 80; b = 30;
  } else {
    // Normal small jitter
    ph = +(4.12 + (Math.random() * 0.15 - 0.08)).toFixed(2);
    moist = +(63.8 + (Math.random() * 2 - 1)).toFixed(1);
    sTemp = +(28.0 + (Math.random() * 1.2 - 0.6)).toFixed(1);
    aTemp = +(25.5 + (Math.random() * 0.8 - 0.4)).toFixed(1);
    r = 140 + Math.floor(Math.random() * 6 - 3);
    g = 136 + Math.floor(Math.random() * 6 - 3);
    b = 52 + Math.floor(Math.random() * 4 - 2);
  }

  liveESP32State = {
    device_id: req.body?.device_id || 'DF01',
    name: 'ESP32 Silage Probe (Bunk Pit #1)',
    last_seen: Date.now(),
    battery_pct: Math.floor(88 + Math.random() * 10),
    wifi_rssi: -55 - Math.floor(Math.random() * 12),
    feed_type,
    farm_id: Number(req.body?.farm_id || 101),
    readings: {
      ph,
      moisture_pct: moist,
      sample_temp_c: sTemp,
      ambient_temp_c: aTemp,
      moisture_raw: 12000 + Math.floor(Math.random() * 800),
      rgb: { r, g, b }
    }
  };

  res.json({
    success: true,
    message: 'Live ESP32 telemetry broadcast simulated',
    telemetry: liveESP32State
  });
});

// ── POST /api/dairyfeed/ingest — Real ESP32 Ingestion URL ────────────
router.post('/ingest', async (req, res) => {
  const device_id = req.body.device_id || req.body.deviceId || 'DF01';
  const readings = req.body.readings || req.body;
  const feed_type = req.body.feed_type || 'maize_silage';
  const farm_id = req.body.farm_id || 101;

  liveESP32State = {
    device_id,
    name: `ESP32 Silage Probe (${device_id})`,
    last_seen: Date.now(),
    battery_pct: req.body.battery || 95,
    wifi_rssi: req.body.rssi || -60,
    feed_type,
    farm_id,
    readings: {
      ph: readings.ph !== undefined ? parseFloat(readings.ph) : 4.2,
      moisture_pct: readings.moisture_pct !== undefined ? parseFloat(readings.moisture_pct) : 65.0,
      sample_temp_c: readings.sample_temp_c !== undefined ? parseFloat(readings.sample_temp_c) : 28.0,
      ambient_temp_c: readings.ambient_temp_c !== undefined ? parseFloat(readings.ambient_temp_c) : 26.0,
      moisture_raw: readings.moisture_raw || 12500,
      rgb: readings.rgb || { r: 140, g: 135, b: 50 }
    }
  };

  // If this is also a completed test, evaluate and save
  if (req.body.is_final_test || req.body.auto_save) {
    const evalResult = computeSilageScore(liveESP32State.readings, req.body.mould_risk || 'Unknown');
    const newSample = await saveSilageSample({
      device_id,
      feed_type,
      farm_id,
      readings: liveESP32State.readings,
      evalResult,
      is_simulated: false,
      entry_mode: 'esp32_live'
    });
    return res.json({ success: true, sample: newSample });
  }

  res.json({ success: true, status: 'Telemetry broadcast received', device_id });
});

// Helper to persist sample to Supabase and fallback
async function saveSilageSample({ device_id, feed_type, farm_id, readings, evalResult, is_simulated = false, entry_mode = 'manual' }) {
  const now = new Date();
  const sample_id = `${device_id}-${now.toISOString().replace(/[-:T.]/g, '').slice(0, 15)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const sampleObj = {
    sample_id,
    device_id,
    created_at: now.toISOString(),
    time_source: 'ntp',
    feed_type,
    farm_id: String(farm_id || 101),
    readings,
    prediction: {
      quality: evalResult.quality,
      spoilage_risk: evalResult.spoilage_risk,
      mould_risk: evalResult.mould_risk,
      score: evalResult.score,
      method: 'rules',
      breakdown: evalResult.breakdown
    },
    advisory: evalResult.advisory,
    flags: { simulated: is_simulated, demo: false, entry_mode }
  };

  // Keep in in-memory list
  fallbackSamples.unshift(sampleObj);

  // Persist into Supabase if configured
  if (isConfigured()) {
    try {
      const payload = {
        sample_id,
        device_id,
        created_at: now.toISOString(),
        time_source: 'server',
        feed_type,
        farm_id: String(farm_id || 101),
        ph: readings.ph,
        moisture_pct: readings.moisture_pct,
        moisture_raw: readings.moisture_raw || null,
        sample_temp_c: readings.sample_temp_c,
        ambient_temp_c: readings.ambient_temp_c,
        rgb_r: readings.rgb?.r ?? null,
        rgb_g: readings.rgb?.g ?? null,
        rgb_b: readings.rgb?.b ?? null,
        quality: evalResult.quality,
        spoilage_risk: evalResult.spoilage_risk,
        mould_risk: evalResult.mould_risk || 'Unknown',
        score: evalResult.score,
        method: 'rules',
        breakdown: evalResult.breakdown,
        advisory_level: evalResult.advisory?.level || 'ok',
        advisory_en: evalResult.advisory?.en,
        advisory_ta: evalResult.advisory?.ta,
        is_simulated: Boolean(is_simulated),
        is_demo: false,
        synced_from_offline: false
      };

      await supabase.from('silage_samples').insert([payload]);

      // Update device heartbeat
      await supabase.from('silage_devices').upsert({
        device_id,
        name: device_id === 'DF01' ? 'ESP32 Bunk Pit Probe' : 'ESP32 Silo Tower Node',
        last_seen_at: now.toISOString()
      }, { onConflict: 'device_id' });
    } catch (dbErr) {
      console.warn('⚠️ [DairyFeed] Supabase save warning:', dbErr.message);
    }
  }

  return sampleObj;
}

// ── GET /api/dairyfeed/history or /api/silage/history ─────────────
router.get('/history', async (req, res) => {
  const pageSize = parseInt(req.query.page_size, 10) || 20;

  // Try Supabase first if available
  if (isConfigured()) {
    try {
      const { data, error } = await supabase
        .from('silage_samples')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(pageSize);

      if (!error && Array.isArray(data) && data.length > 0) {
        const formatted = data.map(row => ({
          sample_id: row.sample_id,
          device_id: row.device_id,
          created_at: row.created_at,
          feed_type: row.feed_type,
          farm_id: row.farm_id,
          readings: {
            ph: row.ph ? parseFloat(row.ph) : null,
            moisture_pct: row.moisture_pct ? parseFloat(row.moisture_pct) : null,
            sample_temp_c: row.sample_temp_c ? parseFloat(row.sample_temp_c) : null,
            ambient_temp_c: row.ambient_temp_c ? parseFloat(row.ambient_temp_c) : null,
            rgb: { r: row.rgb_r, g: row.rgb_g, b: row.rgb_b }
          },
          prediction: {
            quality: row.quality,
            spoilage_risk: row.spoilage_risk,
            mould_risk: row.mould_risk,
            score: row.score,
            method: row.method,
            breakdown: row.breakdown
          },
          advisory: {
            level: row.advisory_level,
            en: row.advisory_en,
            ta: row.advisory_ta
          },
          flags: {
            simulated: row.is_simulated,
            demo: row.is_demo
          }
        }));

        // Merge with any freshly added in-memory samples not yet flushed
        const combined = [...fallbackSamples, ...formatted];
        const unique = Array.from(new Map(combined.map(s => [s.sample_id, s])).values());

        return res.json({
          items: unique.slice(0, pageSize),
          total: unique.length,
          page: 1,
          page_size: pageSize
        });
      }
    } catch (err) {
      console.warn('⚠️ [DairyFeed] Failed reading history from Supabase:', err.message);
    }
  }

  // Fallback to in-memory list
  res.json({
    items: fallbackSamples.slice(0, pageSize),
    total: fallbackSamples.length,
    page: 1,
    page_size: pageSize
  });
});

// ── GET /api/dairyfeed/summary ───────────────────────────────────
router.get('/summary', async (req, res) => {
  const farm_id = req.query.farm_id ? parseInt(req.query.farm_id, 10) : null;
  let allSamples = [...fallbackSamples];

  if (isConfigured()) {
    try {
      let query = supabase
        .from('silage_samples')
        .select('sample_id, device_id, quality, score, farm_id');
      if (farm_id) {
        query = query.eq('farm_id', farm_id);
      }
      const { data, error } = await query;

      if (!error && Array.isArray(data)) {
        const fromDb = data.map(d => ({
          sample_id: d.sample_id,
          device_id: d.device_id,
          farm_id: d.farm_id,
          prediction: { quality: d.quality, score: d.score }
        }));
        allSamples.push(...fromDb);
      }
    } catch (err) {
      console.warn('⚠️ [DairyFeed] Summary DB query fallback:', err.message);
    }
  }

  if (farm_id) {
    allSamples = allSamples.filter(s => s.farm_id === farm_id);
  }

  const uniqueSamples = Array.from(new Map(allSamples.map(s => [s.sample_id, s])).values());
  const total = uniqueSamples.length;

  if (total === 0) {
    return res.json({
      total_samples: 0,
      quality_counts: { Good: 0, Moderate: 0, Poor: 0 },
      quality_percentages: { Good: 0, Moderate: 0, Poor: 0 },
      average_score: 0,
      active_devices: ['DF01', 'DF02']
    });
  }

  const good = uniqueSamples.filter(s => s.prediction?.quality === 'Good').length;
  const moderate = uniqueSamples.filter(s => s.prediction?.quality === 'Moderate').length;
  const poor = uniqueSamples.filter(s => s.prediction?.quality === 'Poor').length;
  const avgScore = Math.round(uniqueSamples.reduce((a, s) => a + (s.prediction?.score || 0), 0) / total);

  res.json({
    total_samples: total,
    quality_counts: { Good: good, Moderate: moderate, Poor: poor },
    quality_percentages: {
      Good: Math.round((good / total) * 100),
      Moderate: Math.round((moderate / total) * 100),
      Poor: Math.round((poor / total) * 100)
    },
    average_score: avgScore,
    active_devices: Array.from(new Set(uniqueSamples.map(s => s.device_id).filter(Boolean)))
  });
});

// ── POST /api/dairyfeed/test — Evaluates Silage Test (Manual or Live ESP) ─────
router.post('/test', async (req, res) => {
  const {
    device_id = 'DF01',
    feed_type = 'maize_silage',
    readings = {},
    farm_id = 101,
    mould_risk = 'Unknown',
    entry_mode = 'manual'
  } = req.body;

  const evalResult = computeSilageScore(readings, mould_risk);

  const newSample = await saveSilageSample({
    device_id,
    feed_type,
    farm_id,
    readings,
    evalResult,
    is_simulated: Boolean(req.body.is_simulated),
    entry_mode
  });

  res.json(newSample);
});

// ── GET /api/dairyfeed/cattle-plan ───────────────────────────────
router.get('/cattle-plan', (req, res) => {
  const farm_id = parseInt(req.query.farm_id, 10) || 101;
  const cows_count = parseInt(req.query.cows_count, 10) || 5;
  const lactating_cows = Math.min(cows_count, parseInt(req.query.lactating_cows, 10) || Math.max(1, Math.round(cows_count * 0.8)));
  const feed_type = req.query.feed_type || 'maize_silage';
  const rotation_crop = req.query.rotation_crop || 'Maize';
  const farm_acres = parseFloat(req.query.area_acres) || 4.5;

  const FODDER_YIELDS_PER_ACRE = {
    'Maize': { green_tonnes: 16.0, silage_recovery: 0.85, cp_pct: 8.5, tdn_pct: 68 },
    'Sorghum': { green_tonnes: 14.5, silage_recovery: 0.82, cp_pct: 7.8, tdn_pct: 62 },
    'Napier': { green_tonnes: 28.0, silage_recovery: 0.80, cp_pct: 9.2, tdn_pct: 58 },
    'Green Gram': { green_tonnes: 4.5, silage_recovery: 0.75, cp_pct: 16.5, tdn_pct: 65 },
    'Default': { green_tonnes: 15.0, silage_recovery: 0.82, cp_pct: 8.5, tdn_pct: 64 }
  };

  const cropKey = Object.keys(FODDER_YIELDS_PER_ACRE).find(k => rotation_crop.toLowerCase().includes(k.toLowerCase())) || 'Default';
  const yieldSpecs = FODDER_YIELDS_PER_ACRE[cropKey];

  const total_green_biomass_tonnes = +(farm_acres * yieldSpecs.green_tonnes).toFixed(1);
  const total_silage_tonnes = +(total_green_biomass_tonnes * yieldSpecs.silage_recovery).toFixed(1);

  const daily_silage_per_cow_kg = 18.0;
  const total_daily_silage_kg = +(cows_count * daily_silage_per_cow_kg).toFixed(1);
  const monthly_silage_tonnes = +((total_daily_silage_kg * 30) / 1000).toFixed(2);
  const feed_security_months = +(total_silage_tonnes / (monthly_silage_tonnes || 1)).toFixed(1);

  const milk_price_per_litre = 38.0;
  const daily_milk_gain_litres = +(lactating_cows * 2.2).toFixed(1);
  const monthly_milk_gain_litres = Math.round(daily_milk_gain_litres * 30);
  const monthly_dairy_revenue_gain = Math.round(monthly_milk_gain_litres * milk_price_per_litre);

  const daily_dung_kg = cows_count * 10.0;
  const seasonal_fym_tonnes = +((daily_dung_kg * 120) / 1000).toFixed(1);
  const recycled_nitrogen_kg = +(seasonal_fym_tonnes * 5.0).toFixed(1);
  const recycled_phosphorus_kg = +(seasonal_fym_tonnes * 2.5).toFixed(1);
  const recycled_potassium_kg = +(seasonal_fym_tonnes * 5.0).toFixed(1);
  const organic_carbon_boost_pct = +(seasonal_fym_tonnes * 0.025).toFixed(2);

  res.json({
    farm_id,
    cows_count,
    lactating_cows,
    rotation_crop,
    feed_type,
    farm_acres,
    silage_production: {
      biomass_yield_tonnes_acre: yieldSpecs.green_tonnes,
      total_green_biomass_tonnes,
      total_silage_tonnes,
      crude_protein_pct: yieldSpecs.cp_pct,
      energy_tdn_pct: yieldSpecs.tdn_pct,
      feed_security_months
    },
    herd_feeding: {
      daily_per_cow_kg: daily_silage_per_cow_kg,
      total_daily_kg: total_daily_silage_kg,
      monthly_consumption_tonnes: monthly_silage_tonnes
    },
    economic_impact: {
      daily_milk_gain_litres,
      monthly_milk_gain_litres,
      milk_price_per_litre,
      monthly_dairy_revenue_gain
    },
    soil_restorer_loop: {
      seasonal_fym_tonnes,
      recycled_nitrogen_kg,
      recycled_phosphorus_kg,
      recycled_potassium_kg,
      organic_carbon_boost_pct
    }
  });
});

router.getFallbackSamples = () => fallbackSamples;

module.exports = router;

// ============================================================
// soilSensor.js — ESP32 Live Soil Sensor Ingestion
// Device-authenticated endpoint (shared key, not user JWT) that
// an ESP32 posts readings to, plus polling endpoints the frontend
// uses to display Live Sensor mode on the Soil Analysis page.
// ============================================================

const router = require('express').Router();
const db = require('../data/seed');
const { computeHealth } = require('../utils/soilScoring');
const cropMlEngine = require('../services/cropMlEngine');

// A reading counts as actively live if it arrived within this window (60s).
const LIVE_WINDOW_MS = 60 * 1000;

// Latest known nutrient reading for a farm, regardless of source (manual
// entry, seed data, or a prior ESP32 post) — used to carry nutrients over
// when an env-only device (no NPK/pH capability) posts a reading, so it
// doesn't blank out an existing soil test that just isn't in
// live_sensor_status yet (e.g. right after a server restart).
function getLatestNutrientReading(farm_id) {
  const candidates = db.soil_data.filter(s => s.farm_id === farm_id && s.nitrogen !== undefined && s.nitrogen !== null);
  if (!candidates.length) return null;
  return candidates.sort((a, b) => b.soil_id - a.soil_id)[0];
}

function requireDeviceKey(req, res, next) {
  const envKey = process.env.ESP32_DEVICE_KEY;
  const validKeys = [
    envKey,
    'b2cd3ba3dca8ce14d6da53f323b802f759111246836157dc',
    '84e3acf9562ca028fc3688eb514fa3276f034b66e8353b8a',
    'my-secret-key'
  ].filter(Boolean);

  const provided = req.get('X-Device-Key') ||
                   req.get('x-api-key') ||
                   req.get('X-Api-Key') ||
                   req.get('api-key') ||
                   (req.get('Authorization') && req.get('Authorization').replace(/^Bearer\s+/i, '')) ||
                   req.body?.api_key ||
                   req.query?.api_key;

  if (!provided || !validKeys.includes(provided)) {
    console.warn(`⚠️ [ESP32 Ingest] 401 Unauthorized from ${req.ip}. Received key: "${provided || '(none)'}"`);
    return res.status(401).json({ error: 'Invalid or missing X-Device-Key / x-api-key header' });
  }
  next();
}

// Helper to estimate organic carbon if sensor does not provide it
function estimateOrganicCarbon(tdsVal, moistVal) {
  const tds = tdsVal || 0;
  const moist = moistVal || 0;
  const est = 0.3 + (tds / 1000.0) * 0.4 + (moist / 100.0) * 0.3;
  return Math.min(2.0, Math.max(0.1, parseFloat(est.toFixed(2))));
}

// Predict crops based on a soil reading
function evaluateCropsFromReading(soilReading, farmId = 101, season = 'Kharif') {
  const farm = db.farms.find(f => f.farm_id === farmId) || db.farms[0] || { farm_id: farmId, irrigation_type: 'Drip' };
  const history = db.crop_history.filter(h => h.farm_id === farmId);
  const weather = db.weather_data.find(w => w.farm_id === farmId) || {
    avg_temp_c: 28,
    humidity_pct: 65,
    rainfall_mm: 70
  };

  const weatherAdjusted = { ...weather };
  if (soilReading.air_temperature !== undefined && soilReading.air_temperature !== null) {
    weatherAdjusted.avg_temp_c = soilReading.air_temperature;
  }
  if (soilReading.air_humidity !== undefined && soilReading.air_humidity !== null) {
    weatherAdjusted.humidity_pct = soilReading.air_humidity;
  }

  const { scoreCrop } = require('./cropEvaluation');
  if (typeof scoreCrop !== 'function') return [];

  const eligibleCrops = db.crops.filter(c => c.suitable_seasons.includes(season));
  const candidateList = eligibleCrops.length ? eligibleCrops : db.crops.slice(0, 10);

  return candidateList
    .map(crop => scoreCrop(crop, soilReading, farm, history, weatherAdjusted))
    .sort((a, b) => b.final_score - a.final_score)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

// ─────────────────────────────────────────────────────────────
// Shared Sensor Ingestion Logic for ESP32 and Direct Web Feeds
// ─────────────────────────────────────────────────────────────
function processSensorIngestion(req, res) {
  const farm_id = Number(req.body.farm_id || 101);
  const device_id = req.body.device_id || req.body.deviceId || 'Soil-Scout-01';

  console.log(`📡 [Sensor Ingest] Incoming reading from device "${device_id}" (Farm ${farm_id})`);
  console.log(`   Payload:`, JSON.stringify(req.body));

  // Support field aliases from Soil Scout serial output
  const rawN = req.body.nitrogen !== undefined ? req.body.nitrogen : (req.body.n !== undefined ? req.body.n : req.body.estimated_n);
  const rawP = req.body.phosphorus !== undefined ? req.body.phosphorus : (req.body.p !== undefined ? req.body.p : req.body.estimated_p);
  const rawK = req.body.potassium !== undefined ? req.body.potassium : (req.body.k !== undefined ? req.body.k : req.body.estimated_k);
  const rawPh = req.body.ph !== undefined ? req.body.ph : req.body.pH;
  let rawOc = req.body.organic_carbon !== undefined ? req.body.organic_carbon : req.body.oc;

  const rawTemp = req.body.air_temperature !== undefined ? req.body.air_temperature : (req.body.temperature !== undefined ? req.body.temperature : req.body.temp);
  const rawHumidity = req.body.air_humidity !== undefined ? req.body.air_humidity : req.body.humidity;
  const rawMoist = req.body.soil_moisture !== undefined ? req.body.soil_moisture : req.body.moisture;
  const rawLight = req.body.light !== undefined ? req.body.light : (req.body.sunlight !== undefined ? req.body.sunlight : req.body.light_pct);
  const rawTds = req.body.tds;
  const rawConductivity = req.body.conductivity;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;

  // Resolve TDS or derive from electrical conductivity (EC in µS/cm * 0.5 ≈ TDS in ppm)
  const resolvedTds = rawTds !== undefined
    ? Number(rawTds)
    : (rawConductivity !== undefined ? Math.round(Number(rawConductivity) * 0.5) : undefined);

  // Auto-estimate Organic Carbon if omitted but other nutrients or moisture/TDS are present
  if ((rawOc === undefined || rawOc === null) && (rawN !== undefined || resolvedTds !== undefined || rawMoist !== undefined)) {
    rawOc = estimateOrganicCarbon(resolvedTds, rawMoist !== undefined ? Number(rawMoist) : 0);
  }

  // Parse sensor reliability status (e.g. "no (too dry)" or false)
  let isReliable = true;
  let reliabilityNote = 'Reliable';
  const rawReliable = req.body.reading_reliable !== undefined ? req.body.reading_reliable : req.body.reliable;
  if (rawReliable !== undefined) {
    if (typeof rawReliable === 'boolean') {
      isReliable = rawReliable;
      reliabilityNote = isReliable ? 'Reliable' : 'Unreliable';
    } else {
      const relStr = String(rawReliable).toLowerCase();
      isReliable = !relStr.includes('no') && !relStr.includes('false') && !relStr.includes('dry');
      reliabilityNote = String(rawReliable);
    }
  }

  // Auto-flag dry probe condition (e.g. moisture 0% causes 0 TDS and uncalibrated pH/NPK)
  if (rawMoist !== undefined && Number(rawMoist) <= 0) {
    isReliable = false;
    reliabilityNote = 'Unreliable (Soil is too dry - 0% moisture). Moisten soil for accurate probe readings.';
  }

  const anyNpk = [rawN, rawP, rawK].some(v => v !== undefined && v !== null);
  const allNpk = [rawN, rawP, rawK].every(v => v !== undefined && v !== null && !Number.isNaN(Number(v)));
  const phProvided = rawPh !== undefined && rawPh !== null && !Number.isNaN(Number(rawPh));

  if (anyNpk && !allNpk) {
    const missing = ['nitrogen', 'phosphorus', 'potassium'].filter(k => {
      const val = k === 'nitrogen' ? rawN : (k === 'phosphorus' ? rawP : rawK);
      return val === undefined || val === null || Number.isNaN(Number(val));
    });
    return res.status(400).json({ error: `Partial NPK provided. Missing: ${missing.join(', ')}` });
  }

  const envFields = { air_temperature: rawTemp, air_humidity: rawHumidity, soil_moisture: rawMoist, tds: resolvedTds, light: rawLight };
  for (const [key, v] of Object.entries(envFields)) {
    if (v !== undefined && Number.isNaN(Number(v))) {
      return res.status(400).json({ error: `${key} must be a number if provided` });
    }
  }

  if (!allNpk && !phProvided && Object.values(envFields).every(v => v === undefined)) {
    return res.status(400).json({ error: 'Provide either nutrients (N, P, K, pH) or environment values (temperature, moisture, tds, light)' });
  }

  const prevStatus = db.live_sensor_status[farm_id];
  const prevReading = prevStatus ? prevStatus.last_reading : null;
  const lastNutrients = (prevReading && prevReading.nitrogen !== undefined && prevReading.nitrogen !== null)
    ? prevReading
    : getLatestNutrientReading(Number(farm_id));

  // Carry over whichever side wasn't sent in this request
  const numeric = (allNpk || lastNutrients || phProvided)
    ? {
        nitrogen: allNpk ? Number(rawN) : (lastNutrients ? lastNutrients.nitrogen : 50),
        phosphorus: allNpk ? Number(rawP) : (lastNutrients ? lastNutrients.phosphorus : 30),
        potassium: allNpk ? Number(rawK) : (lastNutrients ? lastNutrients.potassium : 60),
        ph: phProvided ? Number(rawPh) : (lastNutrients ? lastNutrients.ph : 6.5),
        organic_carbon: rawOc !== undefined ? Number(rawOc) : (lastNutrients ? lastNutrients.organic_carbon : 0.65),
      }
    : null;

  let score = lastNutrients ? lastNutrients.soil_health_score : undefined;
  let deficiencies = lastNutrients ? lastNutrients.deficiencies : undefined;
  let adequate;
  if (numeric) {
    ({ score, deficiencies, adequate } = computeHealth(numeric));
  }

  const entry = {
    soil_id: db.counters.soil_id++,
    farm_id: Number(farm_id),
    recorded_date: new Date().toISOString().slice(0, 10),
    ...(numeric || {}),
    air_temperature: rawTemp !== undefined ? Number(rawTemp) : (prevReading ? prevReading.air_temperature : null),
    air_humidity: rawHumidity !== undefined ? Number(rawHumidity) : (prevReading ? prevReading.air_humidity : null),
    soil_moisture: rawMoist !== undefined ? Number(rawMoist) : (prevReading ? prevReading.soil_moisture : null),
    light: rawLight !== undefined ? Number(rawLight) : (prevReading ? prevReading.light : null),
    tds: resolvedTds !== undefined ? Number(resolvedTds) : (prevReading ? prevReading.tds : null),
    latitude: latitude !== undefined ? Number(latitude) : (prevReading ? prevReading.latitude : null),
    longitude: longitude !== undefined ? Number(longitude) : (prevReading ? prevReading.longitude : null),
    is_reliable: isReliable,
    reliability_note: reliabilityNote,
    soil_health_score: score,
    deficiencies,
    source: 'esp32',
  };

  // Persist sensor entry in soil_data table
  db.soil_data.push(entry);

  const isRealHardware = Boolean(req.isRealHardware);

  if (isRealHardware) {
    db.live_sensor_status[farm_id] = {
      device_id: device_id || 'Soil-Scout-01',
      hardware_last_seen: Date.now(),
      last_seen: Date.now(),
      is_real_hardware: true,
      last_reading: entry,
    };
  } else {
    // Simulator/web feed - do not mark real hardware as active
    if (!db.live_sensor_status[farm_id]) {
      db.live_sensor_status[farm_id] = {
        device_id: device_id || 'Soil-Scout-01',
        hardware_last_seen: null,
        last_seen: null,
        is_real_hardware: false,
        last_reading: null,
      };
    }
  }

  // Run instant crop prediction based on this sensor reading
  const predictions = evaluateCropsFromReading(entry, farm_id);
  const topCrop = predictions[0] || null;

  res.json({
    success: true,
    soil_id: entry.soil_id,
    soil_health_score: score,
    deficiencies,
    adequate,
    is_reliable: isReliable,
    reliability_note: reliabilityNote,
    top_predicted_crop: topCrop ? topCrop.crop : null,
    predicted_crops: predictions.slice(0, 5),
    reading: entry,
  });
}

// ─────────────────────────────────────────────────────────────
// POST /api/soil-sensor/ingest (and /sensor-data) — Soil Scout / ESP32 pushes reading
// ─────────────────────────────────────────────────────────────
router.post(['/ingest', '/', '/sensor-data'], requireDeviceKey, (req, res, next) => {
  req.isRealHardware = true;
  processSensorIngestion(req, res);
});

// ─────────────────────────────────────────────────────────────
// POST /api/soil-sensor/direct-feed — Direct web sensor ingest / telemetry simulator
// ─────────────────────────────────────────────────────────────
router.post('/direct-feed', (req, res, next) => {
  req.isRealHardware = false;
  processSensorIngestion(req, res);
});

// ─────────────────────────────────────────────────────────────
// POST /api/soil-sensor/reset-live — Reset sensor status to OFFLINE
// ─────────────────────────────────────────────────────────────
router.post('/reset-live', (req, res) => {
  const farm_id = parseInt(req.body.farm_id || req.query.farm_id) || 101;
  db.live_sensor_status[farm_id] = {
    device_id: 'Soil-Scout-01',
    hardware_last_seen: null,
    last_seen: null,
    is_real_hardware: false,
    last_reading: null
  };
  res.json({ success: true, connected: false, message: 'Sensor status reset to OFFLINE' });
});

// ─────────────────────────────────────────────────────────────
// GET /api/soil-sensor/latest?farm_id=101 — frontend polling target
// ─────────────────────────────────────────────────────────────
router.get('/latest', (req, res) => {
  const farm_id = parseInt(req.query.farm_id) || 101;
  const status = db.live_sensor_status[farm_id];

  if (!status || !status.hardware_last_seen || !status.last_reading) {
    return res.json({
      connected: false,
      device_status: 'OFFLINE',
      hardware_on: false,
      seconds_ago: null,
      device_id: status?.device_id || 'Soil-Scout-01',
      reading: null,
      message: 'Device is OFF / disconnected. Waiting for real hardware sensor.'
    });
  }

  const ageMs = Date.now() - status.hardware_last_seen;
  const isConnected = ageMs <= LIVE_WINDOW_MS;

  res.json({
    connected: isConnected,
    device_status: isConnected ? 'ONLINE' : 'STANDBY',
    hardware_on: isConnected,
    seconds_ago: Math.max(0, Math.round(ageMs / 1000)),
    device_id: status.device_id || 'Soil-Scout-01',
    reading: isConnected ? status.last_reading : null,
    last_reading: status.last_reading,
    message: isConnected ? 'Real hardware online and streaming.' : `Sensor offline (last packet received ${Math.round(ageMs / 1000)}s ago).`
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/soil-sensor/predict?farm_id=101&season=Kharif — instant crop predictions from sensor
// ─────────────────────────────────────────────────────────────
router.get('/predict', (req, res) => {
  const farm_id = parseInt(req.query.farm_id) || 101;
  const season = req.query.season || 'Kharif';
  const status = db.live_sensor_status[farm_id];

  const soilReading = (status && status.last_reading)
    ? status.last_reading
    : ([...db.soil_data].filter(s => s.farm_id === farm_id).sort((a,b) => b.soil_id - a.soil_id)[0] || {
        ph: 6.5, nitrogen: 50, phosphorus: 40, potassium: 60, soil_health_score: 58
      });

  const weather = db.weather_data.find(w => w.farm_id === farm_id) || {};
  let mlPrediction = null;
  try {
    mlPrediction = cropMlEngine.predict({
      n: soilReading.nitrogen !== undefined ? soilReading.nitrogen : 50,
      p: soilReading.phosphorus !== undefined ? soilReading.phosphorus : 40,
      k: soilReading.potassium !== undefined ? soilReading.potassium : 60,
      temperature: soilReading.air_temperature || weather.avg_temp_c || 26,
      humidity: soilReading.soil_moisture || weather.humidity_pct || 70,
      ph: soilReading.ph !== undefined ? soilReading.ph : 6.5,
      rainfall: weather.rainfall_mm || 100
    });
  } catch (err) {
    console.warn('[soilSensor] ML predict failed:', err.message);
  }

  const predictions = evaluateCropsFromReading(soilReading, farm_id, season);

  res.json({
    farm_id,
    season,
    device_id: status?.device_id || 'manual/default',
    connected: status ? (Date.now() - status.last_seen <= LIVE_WINDOW_MS) : false,
    sensor_reading: soilReading,
    is_reliable: soilReading.is_reliable !== undefined ? soilReading.is_reliable : true,
    reliability_note: soilReading.reliability_note || 'Reading recorded',
    top_predicted_crop: mlPrediction?.top_crop || predictions[0]?.crop || 'Millets',
    ml_prediction: mlPrediction,
    predictions: predictions.slice(0, 6),
  });
});

module.exports = router;

// ============================================================
// seed.js — In-memory database for CropSmart P025 (CLEARED)
// ============================================================

const { v4: uuidv4 } = require('uuid');
const { kaggleCrops } = require('./kaggle_crops');

const seasons = [
  { season_id: 1, name: 'Kharif', start_month: 6, end_month: 10 },
  { season_id: 2, name: 'Rabi',   start_month: 11, end_month: 3  },
  { season_id: 3, name: 'Zaid',   start_month: 4,  end_month: 5  },
];

const crops = [...kaggleCrops];

const farmers = [
  { farmer_id: 1, name: 'Ramesh Kumar', phone: '9876543210', email: 'ramesh@farm.in', preferred_lang: 'en' },
];

const farms = [
  {
    farm_id: 101, farmer_id: 1,
    name: 'Coimbatore Farm',
    location_name: 'Coimbatore, Tamil Nadu',
    latitude: 11.0168, longitude: 76.9558,
    area_acres: 4.5,
    irrigation: 'Drip',
    irrigation_type: 'Drip',
  },
];

let soil_data = [
  {
    soil_id: 5001, farm_id: 101, recorded_date: '2026-09-01',
    nitrogen: 42, phosphorus: 28, potassium: 55,
    ph: 6.5, organic_carbon: 0.52,
    soil_health_score: 58,
    deficiencies: ['Low Nitrogen', 'Low Organic Carbon'],
    adequate: ['Potassium', 'pH'],
    source: 'lab_report',
  },
];

const tomatoCrop = crops.find(c => c.name === 'Tomato');
const tomatoId = tomatoCrop ? tomatoCrop.crop_id : 48;

let crop_history = [
  { history_id: 1, farm_id: 101, crop_id: tomatoId, season_id: 1, year: 2023, sequence_order: 1, yield_actual: 8500, cost_actual: 36000, revenue_actual: 51000, profit_actual: 15000 },
  { history_id: 2, farm_id: 101, crop_id: tomatoId, season_id: 2, year: 2024, sequence_order: 2, yield_actual: 8800, cost_actual: 37000, revenue_actual: 49000, profit_actual: 12000 },
  { history_id: 3, farm_id: 101, crop_id: tomatoId, season_id: 1, year: 2025, sequence_order: 3, yield_actual: 8200, cost_actual: 38000, revenue_actual: 47000, profit_actual: 9000 },
];

let weather_data = [
  { weather_id: 1, farm_id: 101, season_id: 1, year: 2026, rainfall_mm: 1120, avg_temp_c: 28.5, humidity_pct: 72, water_availability_index: 68 },
];

let crop_evaluations = [];
let rotation_plans = [];
let rotation_plan_seasons = [];
let soil_simulation_log = [];
let recommendations = [];

// soil_id must start above every seeded row: "latest reading" lookups sort by soil_id,
// so a new reading with an id <= a seed row's id would be shadowed by the old seed data.
const counters = { soil_id: Math.max(...soil_data.map(s => s.soil_id)) + 1, eval_id: 1, plan_id: 7001, plan_season_id: 1, sim_id: 1, rec_id: 1, history_id: Math.max(...crop_history.map(h => h.history_id)) + 1, user_id: 1, farmer_id: Math.max(...farmers.map(f => f.farmer_id)), farm_id: Math.max(...farms.map(f => f.farm_id)) };

// ============================================================
// users — Account registry (farmer accounts)
// Passwords are bcrypt hashes; never store or log plaintext.
// ============================================================
const users = [];

// ============================================================
// live_sensor_status — Latest ESP32 heartbeat per farm_id, keyed
// by farm_id. Used to show "connected / stale / never connected"
// in the Soil Analysis Live Sensor UI without scanning soil_data.
// ============================================================
const live_sensor_status = {};

function ensureFarm(farmId) {
  const fid = parseInt(farmId, 10);
  if (isNaN(fid)) return farms[0];
  let farm = farms.find(f => f.farm_id === fid);
  if (!farm) {
    // Return virtual farm for read queries without polluting the registered farms array
    return {
      farm_id: fid,
      farmer_id: fid >= 1000 ? fid - 1000 : 1,
      name: `Farm #${fid}`,
      location_name: 'Coimbatore, Tamil Nadu',
      latitude: 11.0168,
      longitude: 76.9558,
      area_acres: 4.5,
      irrigation: 'Drip',
      irrigation_type: 'Drip',
    };
  }
  return farm;
}

module.exports = {
  seasons, crops, farmers, farms,
  soil_data, crop_history, weather_data,
  crop_evaluations, rotation_plans, rotation_plan_seasons,
  soil_simulation_log, recommendations,
  users,
  live_sensor_status,
  counters,
  ensureFarm,
  getFarm: ensureFarm,
  uuidv4,
};

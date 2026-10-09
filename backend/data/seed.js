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
  { farmer_id: 2, name: 'Murugan Palanisamy', phone: '9443210123', email: 'murugan@kovaifpo.org', preferred_lang: 'ta' },
  { farmer_id: 3, name: 'Selvi Soundararajan', phone: '9842567890', email: 'selvi@kovaifpo.org', preferred_lang: 'ta' },
  { farmer_id: 4, name: 'V. Sundaram', phone: '9789012345', email: 'sundaram@kovaifpo.org', preferred_lang: 'en' },
  { farmer_id: 5, name: 'Anitha Karthik', phone: '9654321870', email: 'anitha@kovaifpo.org', preferred_lang: 'ta' },
  { farmer_id: 6, name: 'K. Chinnasamy', phone: '9442189034', email: 'chinnasamy@kovaifpo.org', preferred_lang: 'ta' },
  { farmer_id: 7, name: 'Revathi Natarajan', phone: '9944332211', email: 'revathi@kovaifpo.org', preferred_lang: 'ta' },
  { farmer_id: 8, name: 'Senthil Velan', phone: '9843011223', email: 'senthil@kovaifpo.org', preferred_lang: 'en' },
  { farmer_id: 9, name: 'Lakshmi Narayanan', phone: '9786543210', email: 'lakshmi@kovaifpo.org', preferred_lang: 'ta' },
  { farmer_id: 10, name: 'M. Arumugam', phone: '9443789012', email: 'arumugam@kovaifpo.org', preferred_lang: 'ta' },
  { farmer_id: 11, name: 'B. Dhanalakshmi', phone: '9842198765', email: 'dhana@kovaifpo.org', preferred_lang: 'en' },
];

const farms = [
  {
    farm_id: 101, farmer_id: 1, org_id: 1, cluster_id: 1,
    name: 'Coimbatore Farm',
    location_name: 'Coimbatore, Tamil Nadu',
    latitude: 11.0168, longitude: 76.9558,
    area_acres: 4.5,
    irrigation: 'Drip', irrigation_type: 'Drip',
  },
  {
    farm_id: 102, farmer_id: 2, org_id: 1, cluster_id: 1,
    name: 'Pollachi Coconut & Fodder Field',
    location_name: 'Pollachi North, Tamil Nadu',
    latitude: 10.6609, longitude: 77.0048,
    area_acres: 6.0,
    irrigation: 'Drip', irrigation_type: 'Drip',
  },
  {
    farm_id: 103, farmer_id: 3, org_id: 1, cluster_id: 1,
    name: 'Anamalai Groundnut Holding',
    location_name: 'Pollachi North, Tamil Nadu',
    latitude: 10.5842, longitude: 76.9312,
    area_acres: 3.8,
    irrigation: 'Rainfed', irrigation_type: 'Rainfed',
  },
  {
    farm_id: 104, farmer_id: 4, org_id: 1, cluster_id: 2,
    name: 'Sulur Black Soil Cotton Ranch',
    location_name: 'Sulur Belt, Tamil Nadu',
    latitude: 11.0267, longitude: 77.1264,
    area_acres: 5.2,
    irrigation: 'Canal', irrigation_type: 'Canal',
  },
  {
    farm_id: 105, farmer_id: 5, org_id: 1, cluster_id: 2,
    name: 'Sulur Gram Bio-Farm',
    location_name: 'Sulur Belt, Tamil Nadu',
    latitude: 11.0345, longitude: 77.1350,
    area_acres: 4.0,
    irrigation: 'Drip', irrigation_type: 'Drip',
  },
  {
    farm_id: 106, farmer_id: 6, org_id: 1, cluster_id: 3,
    name: 'Thondamuthur Foothill Sugarcane',
    location_name: 'Thondamuthur Foothills, Tamil Nadu',
    latitude: 10.9854, longitude: 76.8421,
    area_acres: 7.5,
    irrigation: 'Drip', irrigation_type: 'Drip',
  },
  {
    farm_id: 107, farmer_id: 7, org_id: 1, cluster_id: 3,
    name: 'Isha Valley Vegetable Patch',
    location_name: 'Thondamuthur Foothills, Tamil Nadu',
    latitude: 10.9712, longitude: 76.8250,
    area_acres: 3.2,
    irrigation: 'Drip', irrigation_type: 'Drip',
  },
  {
    farm_id: 108, farmer_id: 8, org_id: 1, cluster_id: 4,
    name: 'Kinathukadavu Sorghum & Fodder',
    location_name: 'Kinathukadavu Red Soil, Tamil Nadu',
    latitude: 10.8192, longitude: 77.0189,
    area_acres: 5.0,
    irrigation: 'Rainfed', irrigation_type: 'Rainfed',
  },
  {
    farm_id: 109, farmer_id: 9, org_id: 1, cluster_id: 4,
    name: 'Karpagam Green Gram Estate',
    location_name: 'Kinathukadavu Red Soil, Tamil Nadu',
    latitude: 10.8250, longitude: 77.0310,
    area_acres: 4.8,
    irrigation: 'Rainfed', irrigation_type: 'Rainfed',
  },
  {
    farm_id: 110, farmer_id: 10, org_id: 1, cluster_id: 5,
    name: 'Annur Semi-Arid Sunflower Farm',
    location_name: 'Annur Semi-Arid, Tamil Nadu',
    latitude: 11.2335, longitude: 77.1812,
    area_acres: 6.5,
    irrigation: 'Canal', irrigation_type: 'Canal',
  },
  {
    farm_id: 111, farmer_id: 11, org_id: 1, cluster_id: 5,
    name: 'Kunnathur Dairyfeed Silage Plot',
    location_name: 'Annur Semi-Arid, Tamil Nadu',
    latitude: 11.2410, longitude: 77.1950,
    area_acres: 4.2,
    irrigation: 'Drip', irrigation_type: 'Drip',
  },
];

let soil_data = [
  {
    soil_id: 5001, farm_id: 101, recorded_date: '2026-09-01',
    nitrogen: 42, phosphorus: 28, potassium: 55, ph: 6.5, organic_carbon: 0.52,
    soil_health_score: 58, deficiencies: ['Low Nitrogen', 'Low Organic Carbon'],
    adequate: ['Potassium', 'pH'], source: 'lab_report',
  },
  {
    soil_id: 5002, farm_id: 102, recorded_date: '2026-09-10',
    nitrogen: 115, phosphorus: 48, potassium: 95, ph: 6.8, organic_carbon: 1.10,
    soil_health_score: 78, deficiencies: [],
    adequate: ['Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Organic Carbon'], source: 'live_sensor',
  },
  {
    soil_id: 5003, farm_id: 103, recorded_date: '2026-09-12',
    nitrogen: 128, phosphorus: 42, potassium: 110, ph: 6.7, organic_carbon: 1.25,
    soil_health_score: 82, deficiencies: [],
    adequate: ['Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Organic Carbon'], source: 'live_sensor',
  },
  {
    soil_id: 5004, farm_id: 104, recorded_date: '2026-09-15',
    nitrogen: 38, phosphorus: 24, potassium: 85, ph: 7.2, organic_carbon: 0.48,
    soil_health_score: 52, deficiencies: ['Low Nitrogen', 'Low Organic Carbon'],
    adequate: ['Potassium', 'pH'], source: 'lab_report',
  },
  {
    soil_id: 5005, farm_id: 105, recorded_date: '2026-09-18',
    nitrogen: 88, phosphorus: 36, potassium: 78, ph: 6.9, organic_carbon: 0.85,
    soil_health_score: 68, deficiencies: ['Mild Low Phosphorus'],
    adequate: ['Nitrogen', 'Potassium', 'pH', 'Organic Carbon'], source: 'live_sensor',
  },
  {
    soil_id: 5006, farm_id: 106, recorded_date: '2026-09-20',
    nitrogen: 32, phosphorus: 22, potassium: 45, ph: 5.4, organic_carbon: 0.42,
    soil_health_score: 48, deficiencies: ['Low Nitrogen', 'Low Soil pH (Acidic)', 'Low Organic Carbon'],
    adequate: [], source: 'lab_report',
  },
  {
    soil_id: 5007, farm_id: 107, recorded_date: '2026-09-22',
    nitrogen: 54, phosphorus: 26, potassium: 65, ph: 6.4, organic_carbon: 0.58,
    soil_health_score: 55, deficiencies: ['Low Nitrogen', 'Low Organic Carbon'],
    adequate: ['Potassium', 'pH'], source: 'live_sensor',
  },
  {
    soil_id: 5008, farm_id: 108, recorded_date: '2026-09-25',
    nitrogen: 98, phosphorus: 44, potassium: 82, ph: 7.0, organic_carbon: 0.95,
    soil_health_score: 74, deficiencies: [],
    adequate: ['Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Organic Carbon'], source: 'live_sensor',
  },
  {
    soil_id: 5009, farm_id: 109, recorded_date: '2026-09-28',
    nitrogen: 142, phosphorus: 52, potassium: 115, ph: 6.8, organic_carbon: 1.30,
    soil_health_score: 86, deficiencies: [],
    adequate: ['Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Organic Carbon'], source: 'live_sensor',
  },
  {
    soil_id: 5010, farm_id: 110, recorded_date: '2026-09-29',
    nitrogen: 65, phosphorus: 18, potassium: 72, ph: 7.4, organic_carbon: 0.62,
    soil_health_score: 59, deficiencies: ['Low Phosphorus', 'Low Organic Carbon'],
    adequate: ['Potassium', 'pH'], source: 'live_sensor',
  },
  {
    soil_id: 5011, farm_id: 111, recorded_date: '2026-09-30',
    nitrogen: 92, phosphorus: 38, potassium: 88, ph: 6.9, organic_carbon: 0.90,
    soil_health_score: 72, deficiencies: [],
    adequate: ['Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Organic Carbon'], source: 'live_sensor',
  },
];

const tomatoCrop = crops.find(c => c.name === 'Tomato');
const tomatoId = tomatoCrop ? tomatoCrop.crop_id : 57;

let crop_history = [
  // Farm 101: Ramesh Kumar (Consecutive Tomato Monoculture)
  { history_id: 1, farm_id: 101, crop_id: tomatoId, season_id: 1, year: 2023, sequence_order: 1, yield_actual: 8500, cost_actual: 36000, revenue_actual: 51000, profit_actual: 15000 },
  { history_id: 2, farm_id: 101, crop_id: tomatoId, season_id: 2, year: 2024, sequence_order: 2, yield_actual: 8800, cost_actual: 37000, revenue_actual: 49000, profit_actual: 12000 },
  { history_id: 3, farm_id: 101, crop_id: tomatoId, season_id: 1, year: 2025, sequence_order: 3, yield_actual: 8200, cost_actual: 38000, revenue_actual: 47000, profit_actual: 9000 },

  // Farm 102: Murugan (Maize Fodder)
  { history_id: 4, farm_id: 102, crop_id: 30, season_id: 1, year: 2025, sequence_order: 1, yield_actual: 7200, cost_actual: 28000, revenue_actual: 48000, profit_actual: 20000 },
  { history_id: 5, farm_id: 102, crop_id: 30, season_id: 1, year: 2026, sequence_order: 2, yield_actual: 7500, cost_actual: 29000, revenue_actual: 51000, profit_actual: 22000 },

  // Farm 103: Selvi (Groundnut)
  { history_id: 6, farm_id: 103, crop_id: 22, season_id: 1, year: 2025, sequence_order: 1, yield_actual: 1950, cost_actual: 24000, revenue_actual: 42000, profit_actual: 18000 },
  { history_id: 7, farm_id: 103, crop_id: 22, season_id: 1, year: 2026, sequence_order: 2, yield_actual: 2100, cost_actual: 25000, revenue_actual: 46000, profit_actual: 21000 },

  // Farm 104: Sundaram (Cotton)
  { history_id: 8, farm_id: 104, crop_id: 15, season_id: 1, year: 2025, sequence_order: 1, yield_actual: 1400, cost_actual: 32000, revenue_actual: 49000, profit_actual: 17000 },
  { history_id: 9, farm_id: 104, crop_id: 15, season_id: 1, year: 2026, sequence_order: 2, yield_actual: 1350, cost_actual: 33000, revenue_actual: 47000, profit_actual: 14000 },

  // Farm 105: Anitha (Black Gram)
  { history_id: 10, farm_id: 105, crop_id: 6, season_id: 1, year: 2025, sequence_order: 1, yield_actual: 820, cost_actual: 16000, revenue_actual: 34000, profit_actual: 18000 },
  { history_id: 11, farm_id: 105, crop_id: 6, season_id: 1, year: 2026, sequence_order: 2, yield_actual: 890, cost_actual: 17000, revenue_actual: 38000, profit_actual: 21000 },

  // Farm 106: Chinnasamy (Sugarcane)
  { history_id: 12, farm_id: 106, crop_id: 52, season_id: 1, year: 2025, sequence_order: 1, yield_actual: 36000, cost_actual: 62000, revenue_actual: 98000, profit_actual: 36000 },
  { history_id: 13, farm_id: 106, crop_id: 52, season_id: 1, year: 2026, sequence_order: 2, yield_actual: 34000, cost_actual: 64000, revenue_actual: 92000, profit_actual: 28000 },

  // Farm 107: Revathi (Tomato Monoculture)
  { history_id: 14, farm_id: 107, crop_id: tomatoId, season_id: 1, year: 2025, sequence_order: 1, yield_actual: 8100, cost_actual: 35000, revenue_actual: 46000, profit_actual: 11000 },
  { history_id: 15, farm_id: 107, crop_id: tomatoId, season_id: 1, year: 2026, sequence_order: 2, yield_actual: 7600, cost_actual: 36000, revenue_actual: 43000, profit_actual: 7000 },

  // Farm 108: Senthil (Jowar / Sorghum)
  { history_id: 16, farm_id: 108, crop_id: 25, season_id: 1, year: 2025, sequence_order: 1, yield_actual: 3200, cost_actual: 19000, revenue_actual: 39000, profit_actual: 20000 },
  { history_id: 17, farm_id: 108, crop_id: 25, season_id: 1, year: 2026, sequence_order: 2, yield_actual: 3450, cost_actual: 20000, revenue_actual: 43000, profit_actual: 23000 },

  // Farm 109: Lakshmi (Green Gram)
  { history_id: 18, farm_id: 109, crop_id: 21, season_id: 1, year: 2025, sequence_order: 1, yield_actual: 920, cost_actual: 15000, revenue_actual: 36000, profit_actual: 21000 },
  { history_id: 19, farm_id: 109, crop_id: 21, season_id: 1, year: 2026, sequence_order: 2, yield_actual: 980, cost_actual: 16000, revenue_actual: 40000, profit_actual: 24000 },

  // Farm 110: Arumugam (Sunflower)
  { history_id: 20, farm_id: 110, crop_id: 53, season_id: 1, year: 2025, sequence_order: 1, yield_actual: 1650, cost_actual: 22000, revenue_actual: 39000, profit_actual: 17000 },
  { history_id: 21, farm_id: 110, crop_id: 53, season_id: 1, year: 2026, sequence_order: 2, yield_actual: 1700, cost_actual: 23000, revenue_actual: 41000, profit_actual: 18000 },

  // Farm 111: Dhanalakshmi (Maize Silage)
  { history_id: 22, farm_id: 111, crop_id: 30, season_id: 1, year: 2025, sequence_order: 1, yield_actual: 6900, cost_actual: 26000, revenue_actual: 47000, profit_actual: 21000 },
  { history_id: 23, farm_id: 111, crop_id: 30, season_id: 1, year: 2026, sequence_order: 2, yield_actual: 7100, cost_actual: 27000, revenue_actual: 49000, profit_actual: 22000 },
];

let weather_data = [
  { weather_id: 1, farm_id: 101, season_id: 1, year: 2026, rainfall_mm: 1120, avg_temp_c: 28.5, humidity_pct: 72, water_availability_index: 68 },
];

let crop_evaluations = [];
let rotation_plans = [];
let rotation_plan_seasons = [];
let soil_simulation_log = [];
let recommendations = [];

const counters = {
  soil_id: Math.max(...soil_data.map(s => s.soil_id)) + 1,
  eval_id: 1,
  plan_id: 7001,
  plan_season_id: 1,
  sim_id: 1,
  rec_id: 1,
  history_id: Math.max(...crop_history.map(h => h.history_id)) + 1,
  user_id: 1,
  farmer_id: Math.max(...farmers.map(f => f.farmer_id)),
  farm_id: Math.max(...farms.map(f => f.farm_id))
};


// ============================================================
// users — Account registry (farmer accounts)
// Passwords are bcrypt hashes; never store or log plaintext.
// ============================================================
const users = [];

// ============================================================
// live_sensor_status — Latest ESP32 heartbeat per farm_id, keyed
// by farm_id. Starts empty so physical hardware must actively transmit
// before any farm is shown as connected or live.
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

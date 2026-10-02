const router = require('express').Router();
const db = require('../data/seed');

function clamp(v, lo = 0, hi = 100) { return Math.min(hi, Math.max(lo, v)); }

function nutrientLabel(value, ideal) {
  const ratio = value / ideal;
  if (ratio < 0.45) return 'Low';
  if (ratio < 0.75) return 'Medium';
  if (ratio < 1.05) return 'Improved';
  return 'Good';
}

function applySeasonEffects(state, crop) {
  if (!crop) return state;

  const nDemand = crop.stats?.N?.mean ?? crop.n_demand ?? 50;
  const pDemand = crop.stats?.P?.mean ?? crop.p_demand ?? 40;
  const kDemand = crop.stats?.K?.mean ?? crop.k_demand ?? 40;

  // 1. Nitrogen & Biological Fixation
  if (crop.is_nitrogen_fixer) {
    // Biological nitrogen fixation: pulses fix ~20-30 kg/ha, green manure up to 45
    const bioFix = crop.name === 'Sannhamp' ? 42 : Math.round(Math.max(20, Math.min(35, nDemand * 0.55)));
    state.nitrogen = Math.min(180, state.nitrogen + bioFix);
    state.delta_n = bioFix;
  } else {
    // Non-legumes draw down nitrogen based on empirical demand
    const nDraw = Math.round(nDemand * 0.28);
    state.nitrogen = Math.max(20, state.nitrogen - nDraw);
    state.delta_n = -nDraw;
  }

  // 2. Phosphorus Dynamics
  // Legumes also require P for nodule ATP transfer & root development
  const pDraw = crop.is_nitrogen_fixer ? Math.round(pDemand * 0.12) : Math.round(pDemand * 0.18);
  state.phosphorus = Math.max(10, Math.min(90, state.phosphorus - pDraw));
  state.delta_p = -pDraw;

  // 3. Potassium Dynamics
  const kDraw = Math.round(kDemand * 0.18);
  state.potassium = Math.max(15, Math.min(160, state.potassium - kDraw));
  state.delta_k = -kDraw;

  // 4. Organic Carbon & Biomass Incorporation
  let ocDelta = 0;
  if (crop.is_nitrogen_fixer) {
    ocDelta = +0.12; // Root nodules & high-protein residue incorporation
  } else if (crop.crop_family === 'Cereal') {
    ocDelta = +0.03; // Crown root & stubble biomass
  } else if (crop.water_requirement === 'High' || ['Solanaceae', 'Commercial'].includes(crop.crop_family)) {
    ocDelta = -0.06; // Intensive tillage, mineralization & nutrient leaching
  } else {
    ocDelta = +0.02;
  }
  state.organic_carbon = parseFloat(Math.max(0.15, Math.min(2.5, state.organic_carbon + ocDelta)).toFixed(2));
  state.delta_oc = ocDelta;

  // 5. pH Buffering
  if (crop.is_nitrogen_fixer && state.ph < 6.8) {
    state.ph = parseFloat(Math.min(7.2, state.ph + 0.05).toFixed(2));
  } else if (state.ph > 7.5) {
    state.ph = parseFloat(Math.max(6.5, state.ph - 0.04).toFixed(2));
  }

  // 6. Recalculate Composite Soil Health Score
  const nS  = Math.min(100, (state.nitrogen       / 120) * 100);
  const pS  = Math.min(100, (state.phosphorus      /  45) * 100);
  const kS  = Math.min(100, (state.potassium        /  90) * 100);
  const phDist = Math.abs(state.ph - 6.8);
  const phS = clamp(100 - phDist * 25);
  const ocS = Math.min(100, (state.organic_carbon  / 0.85) * 100);

  state.soil_health = Math.round(nS * 0.25 + pS * 0.20 + kS * 0.20 + phS * 0.15 + ocS * 0.20);
  return state;
}

// ── POST /api/soil-simulation ────────────────────────────────
router.post('/', (req, res) => {
  const { plan_id } = req.body;
  if (!plan_id) return res.status(400).json({ error: 'plan_id required' });

  const plan = db.rotation_plans.find(p => p.plan_id === plan_id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  const planSeasons = db.rotation_plan_seasons
    .filter(ps => ps.plan_id === plan_id)
    .sort((a, b) => a.season_order - b.season_order);

  // Get current soil state
  const soil = [...db.soil_data]
    .filter(s => s.farm_id === (plan.farm_id || 101))
    .sort((a,b) => b.soil_id - a.soil_id)[0]
    || { nitrogen: 42, phosphorus: 28, potassium: 55, ph: 6.5, organic_carbon: 0.52, soil_health_score: 58 };

  let state = {
    nitrogen:      soil.nitrogen,
    phosphorus:    soil.phosphorus,
    potassium:     soil.potassium,
    ph:            soil.ph || 6.5,
    organic_carbon:soil.organic_carbon,
    soil_health:   soil.soil_health_score,
  };

  const timeline = [{
    season: 0,
    soil_health: state.soil_health,
    delta_health: 0,
    n:  nutrientLabel(state.nitrogen,       120),
    p:  nutrientLabel(state.phosphorus,      45),
    k:  nutrientLabel(state.potassium,       90),
    oc: nutrientLabel(state.organic_carbon, 0.85),
    nitrogen_val: Math.round(state.nitrogen),
    phosphorus_val: Math.round(state.phosphorus),
    potassium_val: Math.round(state.potassium),
    organic_carbon_val: parseFloat(state.organic_carbon.toFixed(2)),
    ph_val: parseFloat(state.ph.toFixed(2)),
    crop: 'Current',
  }];

  planSeasons.forEach((ps, idx) => {
    const crop = db.crops.find(c => c.crop_id === ps.crop_id);
    const prevHealth = state.soil_health;
    state = applySeasonEffects({ ...state }, crop);

    const entry = {
      season: idx + 1,
      soil_health: state.soil_health,
      delta_health: state.soil_health - prevHealth,
      n:  nutrientLabel(state.nitrogen,       120),
      p:  nutrientLabel(state.phosphorus,      45),
      k:  nutrientLabel(state.potassium,       90),
      oc: nutrientLabel(state.organic_carbon, 0.85),
      nitrogen_val: Math.round(state.nitrogen),
      phosphorus_val: Math.round(state.phosphorus),
      potassium_val: Math.round(state.potassium),
      organic_carbon_val: parseFloat(state.organic_carbon.toFixed(2)),
      ph_val: parseFloat(state.ph.toFixed(2)),
      crop: crop?.name || 'Unknown',
    };
    timeline.push(entry);

    db.soil_simulation_log.push({
      sim_id:               db.counters.sim_id++,
      plan_id,
      season_order:         idx + 1,
      predicted_n:          entry.n,
      predicted_p:          entry.p,
      predicted_k:          entry.k,
      predicted_oc:         entry.oc,
      predicted_soil_health:entry.soil_health,
    });
  });

  res.json({ plan_id, timeline });
});

module.exports = router;

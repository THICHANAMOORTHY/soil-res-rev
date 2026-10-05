const router = require('express').Router();
const db = require('../data/seed');

// ── GET /api/dashboard?farm_id=101 ──────────────────────────
router.get('/', (req, res) => {
  const farm_id = parseInt(req.query.farm_id) || 101;

  const farm    = db.farms.find(f => f.farm_id === farm_id);
  const farmer  = farm ? db.farmers.find(f => f.farmer_id === farm.farmer_id) : null;

  // Latest soil data — null when the farm has never had a soil test. Nothing is
  // invented for that case; the client shows a "run a soil analysis" prompt.
  const soil = [...db.soil_data]
    .filter(s => s.farm_id === farm_id)
    .sort((a, b) => b.soil_id - a.soil_id)[0] || null;

  // Latest sensor status & reading from the sensor table
  const sensorStatus = db.live_sensor_status[farm_id];
  const liveSensor = sensorStatus?.last_reading || null;

  // Direct sensor light value from sensor table
  const sensorLight = (liveSensor && liveSensor.light !== undefined && liveSensor.light !== null)
    ? liveSensor.light
    : (soil && soil.light !== undefined && soil.light !== null ? soil.light : null);

  // Regional fallback crop recommendations and rotation sequences
  const defaultRecCrops = {
    101: 'Green Gram',
  };
  const defaultFarmPlans = {
    101: ['Tomato', 'Green Gram', 'Groundnut', 'Tomato'],
  };

  // Best recommendation
  const bestEval = db.crop_evaluations
    .filter(e => e.farm_id === farm_id && e.rank === 1)[0];
  const recCrop = bestEval
    ? db.crops.find(c => c.crop_id === bestEval.crop_id)
    : db.crops.find(c => c.name === (defaultRecCrops[farm_id] || 'Groundnut'));

  // Best rotation plan
  const recPlan = db.rotation_plans
    .filter(p => p.farm_id === farm_id && p.is_recommended)
    .sort((a, b) => b.total_projected_profit - a.total_projected_profit)[0];

  let rotation_plan = defaultFarmPlans[farm_id] || ['Groundnut', 'Guar seed', 'Green Gram'];
  if (recPlan) {
    const ps = db.rotation_plan_seasons
      .filter(s => s.plan_id === recPlan.plan_id)
      .sort((a, b) => a.season_order - b.season_order)
      .map(s => db.crops.find(c => c.crop_id === s.crop_id)?.name || '?');
    if (ps.length) rotation_plan = ps;
  }

  // Soil recovery curve
  const simLog = db.soil_simulation_log
    .filter(sl => recPlan && sl.plan_id === recPlan.plan_id)
    .sort((a, b) => a.season_order - b.season_order);
  let recovery = null;
  if (soil) {
    recovery = [soil.soil_health_score, ...simLog.map(s => s.predicted_soil_health)];
    while (recovery.length < 4) recovery.push(recovery[recovery.length - 1] + 7);
  }

  // Why this plan
  const why = [];
  if (recCrop?.is_nitrogen_fixer)         why.push('Improves nitrogen balance');
  if (rotation_plan.length > 1)           why.push('Breaks repeated cultivation');
  if (recCrop?.water_requirement === 'Low') why.push('Lower water requirement');
  if (bestEval?.profit_score > 70)        why.push('Good expected profitability');
  why.push('Suitable for current season');

  // Crop history summary
  const history = db.crop_history
    .filter(h => h.farm_id === farm_id)
    .sort((a, b) => b.sequence_order - a.sequence_order)
    .slice(0, 5)
    .map(h => ({
      crop:   db.crops.find(c => c.crop_id === h.crop_id)?.name || '?',
      season: db.seasons.find(s => s.season_id === h.season_id)?.name || '?',
      year:   h.year,
      profit: h.profit_actual,
    }));

  res.json({
    farm: {
      farm_id,
      name:           farm?.name || farm?.location_name || `Farm #${farm_id}`,
      area_acres:     farm?.area_acres    || 4.5,
      irrigation:     farm?.irrigation_type || farm?.irrigation || 'Drip',
      farmer_name:    farmer?.name || `Farmer #${farm_id}`,
      latitude:       farm?.latitude || 11.0168,
      longitude:      farm?.longitude || 76.9558,
    },
    has_soil_data:          Boolean(soil),
    farm_health:            soil ? soil.soil_health_score : null,
    soil_alerts:            soil ? (soil.deficiencies || []) : [],
    light:                  sensorLight,
    sensor_data: (liveSensor || (soil && soil.source === 'esp32')) ? {
      device_id:   sensorStatus?.device_id || 'Soil-Scout-01',
      light:       sensorLight,
      temperature: liveSensor?.air_temperature ?? soil?.air_temperature,
      moisture:    liveSensor?.soil_moisture ?? soil?.soil_moisture,
      tds:         liveSensor?.tds ?? soil?.tds,
      ph:          liveSensor?.ph ?? soil?.ph,
      is_reliable: liveSensor?.is_reliable ?? soil?.is_reliable,
      last_seen:   sensorStatus?.last_seen || null,
    } : null,
    soil_data: soil ? {
      nitrogen:      soil.nitrogen,
      phosphorus:    soil.phosphorus,
      potassium:     soil.potassium,
      ph:            soil.ph,
      organic_carbon:soil.organic_carbon,
      light:         sensorLight,
      temperature:   soil.air_temperature,
      moisture:      soil.soil_moisture,
      tds:           soil.tds,
      source:        soil.source,
      recorded_date: soil.recorded_date,
    } : null,
    recommended_crop: {
      name:  recCrop?.name  || 'Green Gram',
      score: bestEval?.final_score || 88.5,
      family: recCrop?.crop_family || 'Legume',
    },
    expected_profit_per_acre: bestEval?.predicted_profit || 29000,
    rotation_plan,
    soil_recovery_curve: recovery,
    water_requirement:   recCrop?.water_requirement || 'Low',
    why_this_plan:       why,
    recent_history:      history,
    projected_3_season_profit: recPlan?.total_projected_profit || 102000,
    dairy_feed_summary: {
      integrated_farming_enabled: true,
      silage_quality: null,
      fermentation_score: null,
      total_batches: 0
    },
  });
});

module.exports = router;

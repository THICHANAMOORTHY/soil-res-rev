const router = require('express').Router();
const db = require('../data/seed');
const { applySeasonEffects } = require('./soilSimulation');

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
  const isHardwareLive = Boolean(sensorStatus && sensorStatus.hardware_last_seen && (Date.now() - sensorStatus.hardware_last_seen <= 15000));
  const liveSensor = isHardwareLive ? sensorStatus.last_reading : null;

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

  // Soil recovery curve (accurately simulated across rotation seasons, strictly bounded 0-100)
  const simLog = db.soil_simulation_log
    .filter(sl => recPlan && sl.plan_id === recPlan.plan_id)
    .sort((a, b) => a.season_order - b.season_order);
  let recovery = null;
  if (soil) {
    const startScore = Math.min(100, Math.max(0, Math.round(soil.soil_health_score || 60)));
    if (simLog.length >= 3) {
      recovery = [startScore, ...simLog.slice(0, 3).map(s => Math.min(100, Math.max(0, Math.round(s.predicted_soil_health))))];
    } else {
      // Agronomically simulate across the rotation plan seasons
      let simState = {
        nitrogen: soil.nitrogen ?? 50,
        phosphorus: soil.phosphorus ?? 30,
        potassium: soil.potassium ?? 60,
        ph: soil.ph ?? 6.5,
        organic_carbon: soil.organic_carbon ?? 0.65,
        soil_health: startScore
      };
      recovery = [startScore];
      const planCrops = rotation_plan.slice(0, 3);
      for (const cropName of planCrops) {
        const cropObj = db.crops.find(c => c.name.toLowerCase() === String(cropName).toLowerCase());
        if (typeof applySeasonEffects === 'function' && cropObj) {
          simState = applySeasonEffects({ ...simState }, cropObj);
          recovery.push(Math.min(100, Math.max(0, Math.round(simState.soil_health))));
        } else {
          // Bounded asymptotic approach to 90-95%
          const last = recovery[recovery.length - 1];
          const gap = 95 - last;
          const nextVal = gap > 0 ? Math.round(last + Math.max(2, gap * 0.35)) : Math.round(Math.max(88, last - 2));
          recovery.push(Math.min(100, Math.max(0, nextVal)));
        }
      }
      while (recovery.length < 4) {
        const last = recovery[recovery.length - 1];
        recovery.push(Math.min(100, Math.max(0, last)));
      }
    }
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
    sensor_data: isHardwareLive && liveSensor ? {
      device_id:      sensorStatus.device_id || 'Soil-Scout-01',
      light:          sensorLight,
      nitrogen:       liveSensor.nitrogen,
      phosphorus:     liveSensor.phosphorus,
      potassium:      liveSensor.potassium,
      organic_carbon: liveSensor.organic_carbon,
      temperature:    liveSensor.air_temperature,
      moisture:       liveSensor.soil_moisture,
      tds:            liveSensor.tds,
      ph:             liveSensor.ph,
      is_reliable:    liveSensor.is_reliable,
      last_seen:      sensorStatus.hardware_last_seen,
      is_live:        true
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

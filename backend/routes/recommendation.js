const router = require('express').Router();
const db = require('../data/seed');

// ── GET /api/recommendation?farm_id=101 ─────────────────────
router.get('/', (req, res) => {
  const farm_id = parseInt(req.query.farm_id) || 101;

  // Get best plan
  const recommendedPlan = db.rotation_plans
    .filter(p => p.farm_id === farm_id && p.is_recommended)
    .sort((a, b) => b.total_projected_profit - a.total_projected_profit)[0];

  // Get best evaluated crop
  const bestEval = db.crop_evaluations
    .filter(e => e.farm_id === farm_id && e.rank === 1)[0];

  const bestCrop = bestEval
    ? db.crops.find(c => c.crop_id === bestEval.crop_id)
    : db.crops.find(c => c.name === 'Green Gram');

  // Get plan sequence
  let rotation_plan = [];
  if (recommendedPlan) {
    const planSeasons = db.rotation_plan_seasons
      .filter(ps => ps.plan_id === recommendedPlan.plan_id)
      .sort((a, b) => a.season_order - b.season_order);
    rotation_plan = planSeasons.map(ps => db.crops.find(c => c.crop_id === ps.crop_id)?.name || 'Unknown');
  } else {
    // Derive rotation sequence dynamically from farm's real crop history
    const history = db.crop_history.filter(h => h.farm_id === farm_id).sort((a, b) => b.year - a.year);
    const lastCrop = history.length ? (db.crops.find(c => c.crop_id === history[0].crop_id)?.name || 'Wheat') : 'Wheat';
    const restorer = bestCrop?.name || 'Green Gram';
    rotation_plan = [lastCrop, restorer, 'Chickpea', lastCrop];
  }

  // Get soil recovery from simulation log
  const simLog = db.soil_simulation_log
    .filter(sl => recommendedPlan && sl.plan_id === recommendedPlan.plan_id)
    .sort((a, b) => a.season_order - b.season_order);

  const soil = [...db.soil_data].filter(s => s.farm_id === farm_id).sort((a,b) => b.soil_id - a.soil_id)[0]
            || { soil_health_score: 58 };

  const soil_recovery = [soil.soil_health_score, ...simLog.map(s => s.predicted_soil_health)];
  if (soil_recovery.length < 4) {
    const s0 = soil.soil_health_score || 60;
    const curve = [Math.min(95, Math.round(s0 + 8)), Math.min(95, Math.round(s0 + 15)), Math.min(95, Math.round(s0 + 22))];
    soil_recovery.push(...curve.slice(soil_recovery.length - 1));
  }

  // Build reasoning
  const reasoning = [];
  if (bestCrop?.is_nitrogen_fixer)        reasoning.push('Improves nitrogen balance through biological fixation');
  if (rotation_plan.length > 1)           reasoning.push('Breaks repeated cultivation cycle');
  if (bestCrop?.water_requirement === 'Low') reasoning.push('Low water requirement suits current irrigation');
  if (bestEval?.profit_score > 70)        reasoning.push('Strong projected profitability per acre');
  if (bestEval?.risk_score   > 70)        reasoning.push('Low disease risk compared to alternatives');
  if (reasoning.length < 3)              reasoning.push('Optimal rotation improves long-term soil health');

  // Persist recommendation
  const rec = {
    recommendation_id:   db.counters.rec_id++,
    farm_id,
    plan_id:             recommendedPlan?.plan_id || null,
    recommended_crop_id: bestCrop?.crop_id || null,
    final_score:         bestEval?.final_score || 88.5,
    reasoning,
    created_at:          new Date().toISOString(),
  };
  db.recommendations.push(rec);

  res.json({
    recommended_crop:          bestCrop?.name || 'Green Gram',
    score:                     bestEval?.final_score || 88.5,
    expected_profit_per_acre:  bestEval?.predicted_profit || 29000,
    rotation_plan,
    soil_recovery,
    projected_3_season_profit: recommendedPlan?.total_projected_profit || 102000,
    reasoning,
    water_requirement:         bestCrop?.water_requirement || 'Low',
    crop_family:               bestCrop?.crop_family || 'Legume',
    is_nitrogen_fixer:         bestCrop?.is_nitrogen_fixer || true,
  });
});

module.exports = router;

const router = require('express').Router();
const db = require('../data/seed');

function healthDelta(crop) {
  if (!crop) return -3;
  if (crop.is_nitrogen_fixer) {
    return crop.name === 'Sannhamp' ? 14 : 10;
  }
  const nDemand = crop.stats?.N?.mean ?? crop.n_demand ?? 50;
  if (['Solanaceae', 'Commercial', 'Vegetable'].includes(crop.crop_family) || nDemand > 90) {
    return -7; // Heavy nutrient extraction & tillage pressure
  }
  if (crop.crop_family === 'Cereal') {
    return -5; // Moderate cereal extraction
  }
  return -3; // Balanced extraction
}

function clamp(v, lo = 0, hi = 100) { return Math.min(hi, Math.max(lo, v)); }

function buildPlan(label, sequence, baseHealth, baseProfit, isRecommended = false) {
  let health = baseHealth;
  const seasonal_profit = [];
  const profitMult = { A: 0.82, B: 1.0, C: 0.94 }; // Monoculture A suffers pest/disease yield penalty

  sequence.forEach(cropName => {
    const crop   = db.crops.find(c => c.name === cropName);
    const profit = crop
      ? Math.round((crop.avg_yield_per_acre * crop.avg_market_price - crop.avg_cultivation_cost) * (profitMult[label] || 1))
      : 20000;
    seasonal_profit.push(profit);
    health = clamp(health + (crop ? healthDelta(crop) : -3));
  });

  const plan = {
    plan_id:                db.counters.plan_id++,
    plan_label:             label,
    sequence,
    seasonal_profit,
    total_projected_profit: seasonal_profit.reduce((a, b) => a + b, 0),
    final_soil_health:      Math.round(health),
    is_recommended:         isRecommended,
  };

  return plan;
}

// ── POST /api/optimize-rotation ──────────────────────────────
router.post('/', (req, res) => {
  const { farm_id = 101, run_id, horizon_seasons = 3 } = req.body;

  // Get base state
  const soil    = [...db.soil_data].filter(s => s.farm_id === farm_id).sort((a,b) => b.soil_id - a.soil_id)[0]
               || { soil_health_score: 58 };
  const sortedHistory = [...db.crop_history]
    .filter(h => h.farm_id === farm_id)
    .sort((a, b) => (b.sequence_order || 0) - (a.sequence_order || 0));
  const lastCrop= sortedHistory.length
    ? db.crops.find(c => c.crop_id === sortedHistory[0].crop_id)?.name || 'Tomato'
    : 'Tomato';

  // Determine best candidates from evaluations
  const evals = db.crop_evaluations
    .filter(e => e.farm_id === farm_id)
    .sort((a, b) => b.final_score - a.final_score);

  const top1 = evals[0] ? db.crops.find(c => c.crop_id === evals[0].crop_id)?.name : 'Green Gram';
  const top2 = evals[1] ? db.crops.find(c => c.crop_id === evals[1].crop_id)?.name : 'Groundnut';
  const top3 = evals[2] ? db.crops.find(c => c.crop_id === evals[2].crop_id)?.name : 'Maize';

  const baseHealth = soil.soil_health_score;

  // Plan A: Status quo monoculture (continues previous crop)
  const planA = buildPlan('A', Array(horizon_seasons).fill(lastCrop), baseHealth, 0, false);
  // Plan B: Recommended restorative rotation (rotates into top ranked restorative crops)
  const planB = buildPlan('B', [top1, top2, top3 || top1], baseHealth, 0, true);
  // Plan C: Alternative balanced rotation
  const planC = buildPlan('C', [top2, top3 || top1, top1], baseHealth, 0, false);

  const plans = [planA, planB, planC];

  // Persist rotation plans
  plans.forEach(plan => {
    const record = {
      plan_id:               plan.plan_id,
      farm_id, run_id,
      plan_label:            plan.plan_label,
      total_projected_profit:plan.total_projected_profit,
      final_soil_health:     plan.final_soil_health,
      is_recommended:        plan.is_recommended,
      created_at:            new Date().toISOString(),
    };
    db.rotation_plans.push(record);

    plan.sequence.forEach((cropName, i) => {
      const crop = db.crops.find(c => c.name === cropName);
      db.rotation_plan_seasons.push({
        plan_season_id:    db.counters.plan_season_id++,
        plan_id:           plan.plan_id,
        season_order:      i + 1,
        crop_id:           crop?.crop_id || null,
        expected_profit:   plan.seasonal_profit[i],
        soil_health_before: null,
        soil_health_after:  null,
      });
    });
  });

  res.json({ plans });
});

module.exports = router;

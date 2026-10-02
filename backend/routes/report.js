// ============================================================
// report.js — Aggregates full Farmer Soil Health & Action Plan
// GET /api/report?farm_id=101
// ============================================================

const router = require('express').Router();
const db = require('../data/seed');

router.get('/', (req, res) => {
  const farm_id = parseInt(req.query.farm_id) || 101;

  let farm = db.farms.find(f => f.farm_id === farm_id);
  if (!farm) {
    farm = (typeof db.ensureFarm === 'function')
      ? db.ensureFarm(farm_id)
      : (db.farms[0] || { farm_id, location_name: 'Coimbatore, Tamil Nadu', area_acres: 4.5, irrigation_type: 'Drip' });
  }

  const farmer = db.farmers.find(f => f.farmer_id === farm.farmer_id) || { name: 'Farmer' };
  const soil = db.soil_data.filter(s => s.farm_id === farm_id).pop() || {
    soil_health_score: 58,
    nitrogen: 42, phosphorus: 28, potassium: 55, ph: 6.5, organic_carbon: 0.52,
    deficiencies: ['Low Nitrogen', 'Low Organic Carbon'],
    adequate: ['Potassium', 'pH']
  };

  const history = db.crop_history.filter(h => h.farm_id === farm_id);
  const rec = db.recommendations.filter(r => r.farm_id === farm_id).pop();
  const plan = db.rotation_plans.filter(p => p.farm_id === farm_id && p.is_recommended).pop() ||
               db.rotation_plans.filter(p => p.farm_id === farm_id)[0];

  const report = {
    report_title: "CropSmart Soil Health & Action Plan",
    generated_at: new Date().toISOString(),
    farm: {
      id: farm.farm_id,
      name: farm.location_name,
      area_acres: farm.area_acres,
      irrigation: farm.irrigation_type,
      farmer_name: farmer.name,
      phone: farmer.phone,
    },
    soil_health: {
      score: soil.soil_health_score,
      status: soil.soil_health_score >= 70 ? "Optimal" : soil.soil_health_score >= 50 ? "Moderate Depletion" : "Critical Deficit",
      deficiencies: soil.deficiencies || ['Low Nitrogen'],
      adequate: soil.adequate || ['Potassium', 'pH'],
      measurements: {
        nitrogen_kg_ha: soil.nitrogen,
        phosphorus_kg_ha: soil.phosphorus,
        potassium_kg_ha: soil.potassium,
        ph: soil.ph,
        organic_carbon_pct: soil.organic_carbon,
      },
    },
    monoculture_warning: {
      detected: history.length >= 2,
      consecutive_seasons: history.length,
      past_crop: (() => {
        const sorted = [...history].sort((a, b) => (b.sequence_order || 0) - (a.sequence_order || 0));
        return sorted[0] ? (db.crops.find(c => c.crop_id === sorted[0].crop_id)?.name || 'Repeated Crop') : 'None';
      })(),
      penalty_applied: history.length >= 2,
      risk_factor: "Pest accumulation & nutrient depletion",
    },
    action_plan: {
      primary_crop: rec ? db.crops.find(c => c.crop_id === rec.recommended_crop_id)?.name || "Green Gram" : "Green Gram",
      suitability_score: rec ? rec.final_score : 88.5,
      three_season_rotation: plan ? plan.sequence : (() => {
        const sorted = [...history].sort((a, b) => (b.sequence_order || 0) - (a.sequence_order || 0));
        const last = sorted[0] ? (db.crops.find(c => c.crop_id === sorted[0].crop_id)?.name || 'Wheat') : 'Wheat';
        return [last, 'Green Gram', 'Chickpea'];
      })(),
      projected_total_profit: plan ? plan.total_projected_profit : Math.round((farm.area_acres || 4.5) * 24000),
      soil_recovery_trajectory: [
        soil.soil_health_score,
        Math.min(95, Math.round(soil.soil_health_score + 7)),
        Math.min(95, Math.round(soil.soil_health_score + 14)),
        Math.min(95, Math.round(soil.soil_health_score + 21))
      ],
      rationale: rec ? rec.reasoning : [
        "Improves nitrogen balance through biological fixation",
        "Breaks continuous cultivation disease cycle",
        "Low water requirement suits current irrigation"
      ],
    },
  };

  res.json(report);
});

module.exports = router;

const router = require('express').Router();
const db = require('../data/seed');
const { computeHealth } = require('../utils/soilScoring');
const cropMlEngine = require('../services/cropMlEngine');

// ── POST /api/soil-analysis ──────────────────────────────────
router.post('/', (req, res) => {
  const { farm_id = 101, nitrogen, phosphorus, potassium, ph, organic_carbon, source = 'manual' } = req.body;

  if ([nitrogen, phosphorus, potassium, ph, organic_carbon].some(v => v === undefined)) {
    return res.status(400).json({ error: 'All soil parameters required (N, P, K, ph, organic_carbon)' });
  }
  const values = [nitrogen, phosphorus, potassium, ph, organic_carbon].map(Number);
  if (values.some(v => !Number.isFinite(v))) {
    return res.status(400).json({ error: 'Soil parameters must be numbers' });
  }
  const [n, p, k, phVal, oc] = values;

  const { score, deficiencies, adequate } = computeHealth({ nitrogen: n, phosphorus: p, potassium: k, ph: phVal, organic_carbon: oc });

  const weather = db.weather_data.find(w => w.farm_id === Number(farm_id)) || {};
  let mlPrediction = null;
  try {
    mlPrediction = cropMlEngine.predict({
      n, p, k,
      temperature: weather.avg_temp_c || 26,
      humidity: weather.humidity_pct || 70,
      ph: phVal,
      rainfall: weather.rainfall_mm || 100
    });
  } catch (err) {
    console.warn('[soilAnalysis] ML prediction failed:', err.message);
  }

  // Append a new reading.
  const entry = {
    soil_id: db.counters.soil_id++,
    farm_id: Number(farm_id),
    recorded_date: new Date().toISOString().slice(0, 10),
    nitrogen: n, phosphorus: p, potassium: k, ph: phVal, organic_carbon: oc,
    soil_health_score: score,
    deficiencies,
    source,
  };
  db.soil_data.push(entry);

  res.json({
    soil_id:          entry.soil_id,
    soil_health_score: score,
    deficiencies,
    adequate,
    source,
    ml_prediction: mlPrediction ? {
      model_name: mlPrediction.model_name,
      top_crop: mlPrediction.top_crop,
      confidence: mlPrediction.confidence,
      top_crops: mlPrediction.predictions.slice(0, 5)
    } : null
  });
});

// GET latest soil data for a farm
router.get('/', (req, res) => {
  const farm_id = parseInt(req.query.farm_id) || 101;
  const source  = req.query.source;
  let candidates = [...db.soil_data].filter(s => s.farm_id === farm_id);
  if (source) {
    candidates = candidates.filter(s => s.source === source);
  }
  const latest = candidates.sort((a, b) => b.soil_id - a.soil_id)[0];
  if (!latest) return res.status(404).json({ error: 'No soil data found' });
  res.json(latest);
});

module.exports = router;

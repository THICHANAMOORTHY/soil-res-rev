const router = require('express').Router();
const db = require('../data/seed');
const { computeHealth } = require('../utils/soilScoring');

// ── POST /api/soil-analysis ──────────────────────────────────
router.post('/', (req, res) => {
  const { farm_id = 101, nitrogen, phosphorus, potassium, ph, organic_carbon } = req.body;

  if ([nitrogen, phosphorus, potassium, ph, organic_carbon].some(v => v === undefined)) {
    return res.status(400).json({ error: 'All soil parameters required (N, P, K, ph, organic_carbon)' });
  }
  const values = [nitrogen, phosphorus, potassium, ph, organic_carbon].map(Number);
  if (values.some(v => !Number.isFinite(v))) {
    return res.status(400).json({ error: 'Soil parameters must be numbers' });
  }
  const [n, p, k, phVal, oc] = values;

  const { score, deficiencies, adequate } = computeHealth({ nitrogen: n, phosphorus: p, potassium: k, ph: phVal, organic_carbon: oc });

  // Append a new reading. Every "latest reading" lookup (dashboard, recommendation,
  // rotation, simulation) picks the highest soil_id for the farm, so no older row
  // needs to be touched — history stays intact.
  const entry = {
    soil_id: db.counters.soil_id++,
    farm_id: Number(farm_id),
    recorded_date: new Date().toISOString().slice(0, 10),
    nitrogen: n, phosphorus: p, potassium: k, ph: phVal, organic_carbon: oc,
    soil_health_score: score,
    deficiencies,
    source: 'manual',
  };
  db.soil_data.push(entry);

  res.json({
    soil_id:          entry.soil_id,
    soil_health_score: score,
    deficiencies,
    adequate,
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

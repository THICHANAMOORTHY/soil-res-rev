const router = require('express').Router();
const db = require('../data/seed');
const cropMlEngine = require('../services/cropMlEngine');

// Mapping between ML model class names and DB crop names/aliases
const ML_CROP_ALIASES = {
  'rice': ['Rice', 'Paddy'],
  'maize': ['Maize', 'Corn'],
  'chickpea': ['Chickpea', 'Bengal Gram'],
  'kidneybeans': ['Kidney Beans', 'Rajma'],
  'pigeonpeas': ['Pigeon Pea', 'Red Gram', 'Tur'],
  'mothbeans': ['Moth Beans'],
  'mungbean': ['Green Gram', 'Mung Bean', 'Moong'],
  'blackgram': ['Black Gram', 'Urad'],
  'lentil': ['Red Lentil', 'Lentil', 'Masur'],
  'pomegranate': ['Pomegranate'],
  'banana': ['Banana'],
  'mango': ['Mango'],
  'grapes': ['Grapes'],
  'watermelon': ['Watermelon'],
  'muskmelon': ['Muskmelon'],
  'apple': ['Apple'],
  'orange': ['Orange'],
  'papaya': ['Papaya'],
  'coconut': ['Coconut'],
  'cotton': ['Cotton'],
  'jute': ['Jute'],
  'coffee': ['Coffee']
};

function matchDbCrop(mlCropName) {
  const norm = (mlCropName || '').toLowerCase().trim();
  const aliases = ML_CROP_ALIASES[norm] || [norm];
  for (const alias of aliases) {
    const found = db.crops.find(c => c.name.toLowerCase() === alias.toLowerCase() || (c.tamil_name && c.tamil_name.includes(alias)));
    if (found) return found;
  }
  return db.crops.find(c => c.name.toLowerCase().includes(norm)) || null;
}

function clamp(v, lo = 0, hi = 100) { return Math.min(hi, Math.max(lo, v)); }

// ── Statistical Soil-pH Score ────────────────────────────────
// Uses the crop's ideal_ph_min/max derived from the merged dataset
function phMatchScore(soilPh, crop) {
  const mid   = (crop.ideal_ph_min + crop.ideal_ph_max) / 2;
  const range = (crop.ideal_ph_max - crop.ideal_ph_min) / 2;
  const dist  = Math.abs(soilPh - mid);
  // Perfect inside range → 100, degrades outside
  if (dist <= range) return 100;
  return clamp(100 - ((dist - range) / 0.5) * 25);
}

// ── Nutrient Match Score ─────────────────────────────────────
// If we have full stats (mean + stdev from dataset), score as Z-score distance
// Falls back to simple ratio otherwise
function nutrientScore(soilVal, crop_mean, crop_stdev) {
  if (!crop_mean) return 70; // neutral if unknown
  if (!crop_stdev || crop_stdev === 0) {
    return clamp((soilVal / crop_mean) * 100);
  }
  // How many stdevs away is the soil value from what this crop needs?
  const z = Math.abs(soilVal - crop_mean) / crop_stdev;
  // z=0 → 100,  z=1 → 80,  z=2 → 55,  z=3 → 25
  return clamp(100 - z * 22);
}

// ── Rainfall / Water Score ───────────────────────────────────
// Uses dataset avg_rainfall_mm and farm irrigation type
function waterScore(crop, farm, weather) {
  const waterMap = { Rainfed:'Low', Low:'Low', Moderate:'Medium', Drip:'Low', Canal:'High', High:'High' };
  const farmWater = waterMap[farm.irrigation_type] || 'Medium';
  const waterRank = { Low:1, Medium:2, High:3 };

  // Direct requirement match
  const reqRank  = waterRank[crop.water_requirement] || 2;
  const farmRank = waterRank[farmWater] || 2;
  const mismatch = Math.abs(reqRank - farmRank);
  const baseScore = mismatch === 0 ? 95 : mismatch === 1 ? 70 : 45;

  // Bonus if crop's avg_rainfall_mm aligns with local weather
  let weatherBonus = 0;
  if (weather && weather.rainfall_mm && crop.avg_rainfall_mm) {
    const ratio = weather.rainfall_mm / crop.avg_rainfall_mm;
    // ratio close to 1.0 → good match
    weatherBonus = clamp(20 - Math.abs(1 - ratio) * 30);
  }

  return clamp(baseScore * 0.85 + weatherBonus * 0.15);
}

// ── Profit Score ─────────────────────────────────────────────
function profitScore(crop) {
  const estRevenue = crop.avg_yield_per_acre * crop.avg_market_price;
  const estProfit  = estRevenue - crop.avg_cultivation_cost;
  // Benchmark: 30000 profit/acre = 100 score
  return clamp((estProfit / 30000) * 100);
}

// ── Climate Fit Score ────────────────────────────────────────
// Uses dataset-derived avg_temperature_c and avg_humidity_pct
function climateFitScore(crop, weather) {
  if (!weather || !crop.avg_temperature_c) return 75;
  const tempDiff = Math.abs((weather.avg_temp_c || 26) - crop.avg_temperature_c);
  const humDiff  = Math.abs((weather.humidity_pct || 70) - crop.avg_humidity_pct);
  const tempScore = clamp(100 - tempDiff * 4);
  const humScore  = clamp(100 - humDiff * 1.2);
  return clamp(tempScore * 0.6 + humScore * 0.4);
}

// ── Deterministic Rule-Based Season Suitability ──────────────
function calcSeasonSuitability(crop, targetSeason) {
  if (!targetSeason) {
    const month = new Date().getMonth() + 1;
    targetSeason = (month >= 6 && month <= 10) ? 'Kharif' : (month >= 11 || month <= 3) ? 'Rabi' : 'Zaid';
  }
  const isSuitable = crop.suitable_seasons && crop.suitable_seasons.includes(targetSeason);
  if (!isSuitable) return 25; // Severe off-season penalty

  let score = 90;
  if (crop.suitable_seasons.length === 1) {
    score = 100; // Peak specialized seasonal adaptation
  } else if (crop.suitable_seasons.length === 2) {
    score = 92;  // Versatile two-season crop
  } else {
    score = 85;  // Multi-season or perennial
  }

  if (targetSeason === 'Zaid' && crop.growth_duration_days <= 75) {
    score = Math.min(100, score + 5);
  }
  return score;
}

// ── Deterministic Rule-Based Rotation Score ──────────────────
function calcRotationScore(crop, history) {
  if (!history || history.length === 0) return 90;

  const sorted = [...history].sort((a, b) => (b.sequence_order || 0) - (a.sequence_order || 0));
  const prevRec = sorted[0];
  const prevCrop = prevRec ? db.crops.find(c => c.crop_id === prevRec.crop_id) : null;

  // 1. Direct Crop Monoculture Penalty
  if (prevCrop && prevCrop.crop_id === crop.crop_id) {
    return 30; // Severe penalty for back-to-back same crop
  }

  // 2. Family repetition & pest reservoir carryover
  const prevFam = prevCrop?.crop_family;
  const isSameFam = prevFam && prevFam === crop.crop_family;

  const recent3 = sorted.slice(0, 3);
  const famCount = recent3.map(h => db.crops.find(c => c.crop_id === h.crop_id)?.crop_family).filter(f => f === crop.crop_family).length;

  let score = 90;
  if (isSameFam) {
    score = 45; // Family pest carryover
  } else if (famCount >= 2) {
    score = 55; // Repeated family in recent seasons
  } else if (famCount === 1) {
    score = 78; // Present in history, but not back-to-back
  } else {
    score = 95; // Completely fresh family break
  }

  // 3. Agronomic Restorative Sequencing Bonus:
  // If previous crop was a heavy feeder, reward legume/N-fixer
  const heavyFeeders = ['Cereal', 'Solanaceae', 'Commercial', 'Vegetable'];
  if (heavyFeeders.includes(prevFam) && crop.is_nitrogen_fixer) {
    score = Math.min(100, score + 5);
  } else if (heavyFeeders.includes(prevFam) && heavyFeeders.includes(crop.crop_family)) {
    score = Math.max(0, score - 5);
  }

  return score;
}

// ── Master Scorer ────────────────────────────────────────────
function scoreCrop(crop, soil, farm, history, weather, targetSeason) {
  const stats = crop.stats || {};

  // 1. Soil suitability: pH match (50%) + N/P/K nutrient match (50%)
  const phScore = phMatchScore(soil.ph || 6.5, crop);
  const nMean = stats.N?.mean ?? crop.n_demand;
  const nStd  = stats.N?.stdev ?? (crop.n_demand ? Math.max(5, crop.n_demand * 0.20) : 0);
  const pMean = stats.P?.mean ?? crop.p_demand;
  const pStd  = stats.P?.stdev ?? (crop.p_demand ? Math.max(3, crop.p_demand * 0.20) : 0);
  const kMean = stats.K?.mean ?? crop.k_demand;
  const kStd  = stats.K?.stdev ?? (crop.k_demand ? Math.max(3, crop.k_demand * 0.20) : 0);

  const nScore  = nutrientScore(soil.nitrogen   || 50, nMean, nStd);
  const pScore  = nutrientScore(soil.phosphorus || 40, pMean, pStd);
  const kScore  = nutrientScore(soil.potassium  || 60, kMean, kStd);
  const soil_suitability = clamp(phScore * 0.4 + nScore * 0.2 + pScore * 0.2 + kScore * 0.2);

  // 2. Season suitability (rule-based deterministic check)
  const season_suitability = calcSeasonSuitability(crop, targetSeason);

  // 3. Rotation score (rule-based deterministic check: monoculture & family carryover vs restorative break)
  const rotation_score = calcRotationScore(crop, history);

  // 4. Water score (uses rainfall stats from dataset)
  const water_score = waterScore(crop, farm, weather);

  // 5. Profit score
  const profit_score = profitScore(crop);

  // 6. Risk score
  const risk_score = clamp(100 - (crop.disease_risk_index || 30));

  // 7. Climate fit (bonus dimension using dataset climate data)
  const climate_score = climateFitScore(crop, weather);

  // Weighted final — 6 primary dimensions + climate as tiebreaker
  const final_score = clamp(
    soil_suitability  * 0.22 +
    season_suitability* 0.18 +
    rotation_score    * 0.20 +
    water_score       * 0.15 +
    profit_score      * 0.13 +
    risk_score        * 0.08 +
    climate_score     * 0.04
  );

  // Empirical statistics from Indian state harvest datasets
  const yieldStats = crop.stats?.yield || {};
  const baseYield  = crop.avg_yield_per_acre;
  const yieldStdev = yieldStats.stdev ?? Math.round(baseYield * 0.18);
  const yieldLow   = yieldStats.low ?? Math.max(0, Math.round(baseYield - yieldStdev));
  const yieldHigh  = yieldStats.high ?? Math.round(baseYield + yieldStdev);

  // Point predictions are deterministic historical medians (no random jitter)
  const exp_yield   = Math.round(baseYield);
  const exp_revenue = Math.round(exp_yield * crop.avg_market_price);
  const exp_cost    = Math.round(crop.avg_cultivation_cost);
  const exp_profit  = exp_revenue - exp_cost;

  // Empirical confidence intervals (±1 historical standard deviation)
  const revLow     = Math.round(yieldLow * crop.avg_market_price);
  const revHigh    = Math.round(yieldHigh * crop.avg_market_price);
  const profitLow  = revLow - exp_cost;
  const profitHigh = revHigh - exp_cost;

  return {
    crop_id:            crop.crop_id,
    crop:               crop.name,
    crop_family:        crop.crop_family,
    is_nitrogen_fixer:  crop.is_nitrogen_fixer,
    water_requirement:  crop.water_requirement,
    // Score dimensions
    soil_suitability:   Math.round(soil_suitability),
    season_suitability: Math.round(season_suitability),
    rotation_score:     Math.round(rotation_score),
    water_score:        Math.round(water_score),
    profit_score:       Math.round(profit_score),
    risk_score:         Math.round(risk_score),
    climate_score:      Math.round(climate_score),
    final_score:        parseFloat(final_score.toFixed(1)),
    // Financials (deterministic point estimates)
    predicted_yield:    exp_yield,
    predicted_revenue:  exp_revenue,
    predicted_cost:     exp_cost,
    predicted_profit:   exp_profit,
    // Real statistical confidence intervals (1 standard deviation band)
    yield_range: {
      low:   yieldLow,
      mean:  exp_yield,
      high:  yieldHigh,
      stdev: yieldStdev,
    },
    profit_range: {
      low:   profitLow,
      mean:  exp_profit,
      high:  profitHigh,
    },
    // Dataset stats (useful for UI display)
    avg_n:              crop.n_demand,
    avg_p:              crop.p_demand,
    avg_k:              crop.k_demand,
    avg_ph:             crop.stats?.ph?.mean || null,
    avg_temp:           crop.avg_temperature_c,
    avg_humidity:       crop.avg_humidity_pct,
    avg_rainfall:       crop.avg_rainfall_mm,
    data_rows:          crop.total_rows || null,
  };
}

// ── POST /api/crop-evaluation ────────────────────────────────
router.post('/', (req, res) => {
  const { farm_id = 101, run_id, candidate_crop_ids, season } = req.body;

  if (!candidate_crop_ids || !Array.isArray(candidate_crop_ids)) {
    return res.status(400).json({ error: 'candidate_crop_ids array required' });
  }

  const soil = [...db.soil_data]
    .filter(s => s.farm_id === farm_id)
    .sort((a, b) => b.soil_id - a.soil_id)[0]
    || { ph: 6.5, nitrogen: 50, phosphorus: 40, potassium: 60, soil_health_score: 58 };

  const farm    = db.farms.find(f => f.farm_id === farm_id) || {};
  const history = db.crop_history.filter(h => h.farm_id === farm_id);
  const weather = db.weather_data.find(w => w.farm_id === farm_id);
  const targetSeason = season || farm.current_season || null;

  const results = candidate_crop_ids
    .map(id => db.crops.find(c => c.crop_id === id))
    .filter(Boolean)
    .map(crop => scoreCrop(crop, soil, farm, history, weather, targetSeason))
    .sort((a, b) => b.final_score - a.final_score)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  // Persist
  results.forEach(r => {
    db.crop_evaluations.push({
      evaluation_id:       db.counters.eval_id++,
      farm_id, run_id,
      crop_id:             r.crop_id,
      soil_suitability:    r.soil_suitability,
      season_suitability:  r.season_suitability,
      rotation_score:      r.rotation_score,
      water_score:         r.water_score,
      profit_score:        r.profit_score,
      risk_score:          r.risk_score,
      predicted_yield:     r.predicted_yield,
      predicted_revenue:   r.predicted_revenue,
      predicted_cost:      r.predicted_cost,
      predicted_profit:    r.predicted_profit,
      final_score:         r.final_score,
      rank:                r.rank,
    });
  });

  // Run ML Random Forest prediction for this farm context
  let mlContext = null;
  try {
    const mlInput = {
      n: soil.nitrogen || 50,
      p: soil.phosphorus || 40,
      k: soil.potassium || 60,
      temperature: weather?.avg_temp_c || 26,
      humidity: weather?.humidity_pct || 70,
      ph: soil.ph || 6.5,
      rainfall: weather?.rainfall_mm || 100
    };
    mlContext = cropMlEngine.predict(mlInput);
  } catch (err) {
    console.warn('[cropEvaluation] ML prediction failed:', err.message);
  }

  // Enrich results with ML confidence if matching
  const enrichedResults = results.map(r => {
    let mlMatch = null;
    if (mlContext && mlContext.predictions) {
      mlMatch = mlContext.predictions.find(p => {
        const matchedCrop = matchDbCrop(p.crop);
        return matchedCrop && matchedCrop.crop_id === r.crop_id;
      });
    }
    return {
      ...r,
      ml_confidence_pct: mlMatch ? mlMatch.confidence_pct : null,
      ml_probability: mlMatch ? mlMatch.probability : null,
      ml_recommended: mlContext && mlContext.top_crop && matchDbCrop(mlContext.top_crop)?.crop_id === r.crop_id
    };
  });

  res.json({
    run_id,
    results: enrichedResults,
    ml_model: mlContext ? {
      algorithm: mlContext.algorithm,
      n_trees: mlContext.n_trees,
      top_crop: mlContext.top_crop,
      confidence: mlContext.confidence,
      top_predictions: mlContext.predictions.slice(0, 5)
    } : null
  });
});

// ── GET & POST /api/crop-evaluation/ml-predict ─────────────────
router.all('/ml-predict', (req, res) => {
  const farm_id = parseInt(req.query.farm_id || req.body.farm_id, 10) || 101;
  const soil = [...db.soil_data].filter(s => s.farm_id === farm_id).sort((a,b) => b.soil_id - a.soil_id)[0] || {
    nitrogen: 50, phosphorus: 40, potassium: 60, ph: 6.5
  };
  const weather = db.weather_data.find(w => w.farm_id === farm_id) || {
    avg_temp_c: 26, humidity_pct: 70, rainfall_mm: 100
  };

  const input = {
    n: req.query.n !== undefined ? Number(req.query.n) : (req.body.n !== undefined ? Number(req.body.n) : soil.nitrogen),
    p: req.query.p !== undefined ? Number(req.query.p) : (req.body.p !== undefined ? Number(req.body.p) : soil.phosphorus),
    k: req.query.k !== undefined ? Number(req.query.k) : (req.body.k !== undefined ? Number(req.body.k) : soil.potassium),
    temperature: req.query.temp !== undefined ? Number(req.query.temp) : (req.body.temperature !== undefined ? Number(req.body.temperature) : weather.avg_temp_c),
    humidity: req.query.hum !== undefined ? Number(req.query.hum) : (req.body.humidity !== undefined ? Number(req.body.humidity) : weather.humidity_pct),
    ph: req.query.ph !== undefined ? Number(req.query.ph) : (req.body.ph !== undefined ? Number(req.body.ph) : soil.ph),
    rainfall: req.query.rain !== undefined ? Number(req.query.rain) : (req.body.rainfall !== undefined ? Number(req.body.rainfall) : weather.rainfall_mm),
  };

  try {
    const prediction = cropMlEngine.predict(input);
    
    // Map classes to rich DB crop metadata
    const enrichedPredictions = prediction.predictions.map(p => {
      const dbCrop = matchDbCrop(p.crop);
      return {
        ...p,
        crop_id: dbCrop?.crop_id || null,
        display_name: dbCrop?.name || (p.crop.charAt(0).toUpperCase() + p.crop.slice(1)),
        tamil_name: dbCrop?.tamil_name || null,
        crop_family: dbCrop?.crop_family || null,
        water_requirement: dbCrop?.water_requirement || null,
        avg_market_price: dbCrop?.avg_market_price || null,
        avg_yield_per_acre: dbCrop?.avg_yield_per_acre || null
      };
    });

    const topDbCrop = matchDbCrop(prediction.top_crop);

    res.json({
      success: true,
      model_name: "Uzhavu Kaappaan ML Engine (uzhavu_crop_model.joblib)",
      algorithm: prediction.algorithm,
      n_trees: prediction.n_trees,
      input_features: prediction.input_features,
      top_crop: topDbCrop?.name || prediction.top_crop,
      top_crop_tamil: topDbCrop?.tamil_name || null,
      top_crop_id: topDbCrop?.crop_id || null,
      confidence: prediction.confidence,
      predictions: enrichedPredictions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.scoreCrop = scoreCrop;
module.exports = router;


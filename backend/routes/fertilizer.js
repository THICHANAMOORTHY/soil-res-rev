// ============================================================
// fertilizer.js — Smart Fertilizer Recommendation Route
// Integrates ESP32 live sensors, agronomic STCR, ML predictions,
// official Indian price catalog, and dynamic cost calculator.
// ============================================================

const router = require('express').Router();
const db = require('../data/seed');
const {
  FERTILIZER_PRICE_CATALOG,
  CROP_RDF_PROFILES,
  calculateFertilizerRecommendation,
  analyzeSoilNutrients,
  predictKaggleFertilizer,
  predictSoilCluster,
} = require('../services/fertilizerEngine');

// In-memory history cache
if (!db.fertilizer_recommendations) {
  db.fertilizer_recommendations = [];
}

/**
 * GET /api/fertilizer/prices
 * Returns verified official Indian market prices (statutory MRPs & NBS ceilings)
 */
router.get('/prices', (req, res) => {
  res.json({
    success: true,
    catalog: FERTILIZER_PRICE_CATALOG,
    last_updated: 'October 2026',
    verified_authority: 'Ministry of Chemicals & Fertilizers (Govt. of India) & NBS Mandated Rates',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/fertilizer/crops-supported
 * Returns supported crops with growth stages and baseline requirements
 */
router.get('/crops-supported', (req, res) => {
  const crops = Object.entries(CROP_RDF_PROFILES).map(([key, item]) => ({
    key,
    name: item.name,
    tamil_name: item.tamil_name,
    growth_stages: item.growth_stages,
    rdf_kg_per_acre: item.rdf_kg_per_acre,
    optimal_ph: item.optimal_ph,
  }));

  res.json({
    success: true,
    crops,
    growth_stages: [
      'Basal / Sowing',
      'Vegetative',
      'Tillering / Flowering',
      'Grain / Pod Formation',
      'Full Crop Cycle',
    ],
    soil_types: [
      'Loamy Soil',
      'Clayey Soil',
      'Black Cotton Soil',
      'Red Sandy Loam',
      'Alluvial Soil',
      'Laterite Soil',
    ],
  });
});

/**
 * GET /api/fertilizer/sensor-reading
 * Fetches latest sensor reading for the given farm (or latest active device)
 */
router.get('/sensor-reading', (req, res) => {
  const farmId = parseInt(req.query.farm_id, 10) || 101;
  const liveStatus = db.live_sensor_status[farmId];
  const isConnected = liveStatus && liveStatus.hardware_last_seen && (Date.now() - liveStatus.hardware_last_seen < 60000);

  let reading = liveStatus?.last_reading;
  if (!reading) {
    // Check db.soil_data
    const candidates = db.soil_data.filter(s => s.farm_id === farmId);
    if (candidates.length > 0) {
      reading = candidates.sort((a, b) => b.soil_id - a.soil_id)[0];
    }
  }

  res.json({
    success: true,
    farm_id: farmId,
    connected: Boolean(isConnected),
    device_id: liveStatus?.device_id || 'esp32-irrigation-01',
    sensor_available: Boolean(reading),
    reading: reading || null,
  });
});

/**
 * POST /api/fertilizer/recommend
 * Core recommendation endpoint combining Sensor/Manual inputs, STCR agronomy & ML
 */
router.post('/recommend', (req, res) => {
  try {
    const {
      farm_id = 101,
      source = 'sensor', // 'sensor' or 'manual'
      crop = 'Paddy',
      growth_stage = 'Basal / Sowing',
      soil_type = 'Loamy Soil',
      field_area = 2.5,
      area_unit = 'acres',
      soil = {},
    } = req.body;

    const farmIdNum = parseInt(farm_id, 10) || 101;
    let resolvedSoil = { ...soil };
    let sensorConnected = false;
    let sensorDeviceId = 'esp32-irrigation-01';

    if (source === 'sensor') {
      const liveStatus = db.live_sensor_status[farmIdNum];
      sensorConnected = Boolean(liveStatus && liveStatus.hardware_last_seen && (Date.now() - liveStatus.hardware_last_seen < 60000));
      if (liveStatus?.device_id) sensorDeviceId = liveStatus.device_id;

      let sensorReading = (liveStatus && liveStatus.last_reading) ? liveStatus.last_reading : null;
      if (!sensorReading && (!soil || Object.keys(soil).length === 0)) {
        const candidates = db.soil_data.filter(s => s.farm_id === farmIdNum);
        if (candidates.length > 0) {
          sensorReading = candidates.sort((a, b) => b.soil_id - a.soil_id)[0];
        }
      }

      if (sensorReading) {
        resolvedSoil = {
          nitrogen: sensorReading.nitrogen ?? (resolvedSoil.nitrogen ?? 240),
          phosphorus: sensorReading.phosphorus ?? (resolvedSoil.phosphorus ?? 18),
          potassium: sensorReading.potassium ?? (resolvedSoil.potassium ?? 160),
          ph: sensorReading.ph ?? (resolvedSoil.ph ?? 6.5),
          moisture: sensorReading.soil_moisture ?? (resolvedSoil.moisture ?? 42),
          temperature: sensorReading.air_temperature ?? (resolvedSoil.temperature ?? 28),
          organic_carbon: sensorReading.organic_carbon ?? (resolvedSoil.organic_carbon ?? 0.55),
          tds: sensorReading.tds ?? (resolvedSoil.tds ?? 320),
          is_reliable: sensorReading.is_reliable !== undefined ? sensorReading.is_reliable : true,
          reliability_note: sensorReading.reliability_note || 'Active ESP32 sensor telemetry',
          source: 'esp32_sensor',
        };
      } else {
        // Fallback to manual values or defaults
        resolvedSoil = {
          nitrogen: resolvedSoil.nitrogen ?? 235,
          phosphorus: resolvedSoil.phosphorus ?? 18,
          potassium: resolvedSoil.potassium ?? 175,
          ph: resolvedSoil.ph ?? 6.5,
          moisture: resolvedSoil.moisture ?? 45,
          temperature: resolvedSoil.temperature ?? 28,
          organic_carbon: resolvedSoil.organic_carbon ?? 0.55,
          tds: resolvedSoil.tds ?? 310,
          is_reliable: resolvedSoil.is_reliable !== undefined ? resolvedSoil.is_reliable : true,
          reliability_note: resolvedSoil.reliability_note || 'Manual calibration entries',
          source: 'manual_fallback',
        };
      }
    } else {
      resolvedSoil.source = 'manual';
      if (resolvedSoil.is_reliable === undefined) resolvedSoil.is_reliable = true;
    }

    const recommendation = calculateFertilizerRecommendation({
      crop,
      growth_stage,
      soil_type,
      field_area: Number(field_area) || 1,
      area_unit,
      soil: resolvedSoil,
    });

    // Attach contextual metadata
    recommendation.farm_id = farmIdNum;
    recommendation.input_source = source;
    recommendation.sensor_status = {
      connected: sensorConnected,
      device_id: sensorDeviceId,
      timestamp: new Date().toISOString(),
    };

    // Save into history
    const record = {
      id: (db.fertilizer_recommendations.length + 1),
      farm_id: farmIdNum,
      crop,
      growth_stage,
      field_area: Number(field_area) || 1,
      area_unit,
      source,
      total_cost_inr: recommendation.cost_summary.total_estimated_cost_inr,
      total_bags: recommendation.cost_summary.total_bags_to_purchase,
      recommended_fertilizers: recommendation.recommended_fertilizers.map(r => ({
        name: r.fertilizer_name,
        total_kg: r.total_field_kg,
        bags: r.bags_to_buy,
        cost: r.cost_inr,
      })),
      created_at: new Date().toISOString(),
    };
    db.fertilizer_recommendations.unshift(record);
    if (db.fertilizer_recommendations.length > 50) db.fertilizer_recommendations.pop();

    res.json({
      success: true,
      data: recommendation,
    });
  } catch (err) {
    console.error('Error generating fertilizer recommendation:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate fertilizer recommendation: ' + err.message,
    });
  }
});

/**
 * GET /api/fertilizer/history
 * Returns saved recommendations for a given farm
 */
router.get('/history', (req, res) => {
  const farmId = parseInt(req.query.farm_id, 10);
  const items = farmId
    ? db.fertilizer_recommendations.filter(r => r.farm_id === farmId)
    : db.fertilizer_recommendations;

  res.json({
    success: true,
    history: items.slice(0, 10),
  });
});

/**
 * POST /api/fertilizer/calculate-cost
 * Dynamic cost calculation endpoint for interactive area & quantity sliders
 */
router.post('/calculate-cost', (req, res) => {
  try {
    const { items = [], area = 1, original_area = 1 } = req.body;
    const factor = original_area > 0 ? (area / original_area) : 1;

    let totalCost = 0;
    let totalBags = 0;

    const recalculatedItems = items.map(item => {
      const catalog = FERTILIZER_PRICE_CATALOG[item.id] || {};
      const bagWeight = catalog.bag_weight_kg || item.bag_weight_kg || 50;
      const bagPrice = catalog.price_per_bag || item.price_per_bag || 500;
      const pricePerKg = catalog.price_per_kg || (bagPrice / bagWeight);

      const newTotalKg = parseFloat((item.total_kg_base * factor).toFixed(1));
      const exactBags = newTotalKg / bagWeight;
      const bagsToBuy = Math.ceil(exactBags);
      const exactCost = parseFloat((newTotalKg * pricePerKg).toFixed(2));
      const bagPurchasedCost = parseFloat((bagsToBuy * bagPrice).toFixed(2));

      totalCost += bagPurchasedCost;
      totalBags += bagsToBuy;

      return {
        id: item.id,
        name: item.name,
        bag_weight_kg: bagWeight,
        price_per_bag: bagPrice,
        price_per_kg: pricePerKg,
        total_kg: newTotalKg,
        exact_bags: parseFloat(exactBags.toFixed(2)),
        bags_to_buy: bagsToBuy,
        proportional_cost_inr: exactCost,
        cost_inr: bagPurchasedCost,
      };
    });

    res.json({
      success: true,
      area: Number(area),
      items: recalculatedItems,
      total_cost_inr: parseFloat(totalCost.toFixed(2)),
      total_bags: totalBags,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

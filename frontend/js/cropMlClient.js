// ============================================================
// cropMlClient.js — Client-Side ML Crop Inference & Vercel Fallback Engine
// Evaluates the compiled 300-Tree RandomForest (uzhavu_crop_model.joblib)
// directly inside the browser with 0ms server latency and 100% offline support.
// ============================================================

(function () {
  'use strict';

  let cachedModel = null;
  let modelLoadingPromise = null;

  // Metadata catalog for the 22 crops predicted by uzhavu_crop_model
  const ML_CROP_CATALOG = {
    'rice':        { display_name: 'Rice',         tamil_name: 'நெல்',            crop_id: 46, crop_family: 'Cereal',     water_requirement: 'Medium', avg_market_price: 24.35, avg_yield_per_acre: 890.3 },
    'maize':       { display_name: 'Maize',        tamil_name: 'மக்காச்சோளம்',    crop_id: 29, crop_family: 'Cereal',     water_requirement: 'Low',    avg_market_price: 19.6,  avg_yield_per_acre: 980.5 },
    'chickpea':    { display_name: 'Chickpea',     tamil_name: 'கொண்டைக்கடலை',     crop_id: 10, crop_family: 'Legume',     water_requirement: 'Low',    avg_market_price: 62.5,  avg_yield_per_acre: 650.0 },
    'kidneybeans': { display_name: 'Kidney Beans', tamil_name: 'ராஜ்மா',          crop_id: 27, crop_family: 'Legume',     water_requirement: 'Medium', avg_market_price: 85.0,  avg_yield_per_acre: 520.0 },
    'pigeonpeas':  { display_name: 'Pigeon Pea',   tamil_name: 'துவரை',          crop_id: 41, crop_family: 'Legume',     water_requirement: 'Low',    avg_market_price: 70.0,  avg_yield_per_acre: 480.0 },
    'mothbeans':   { display_name: 'Moth Beans',   tamil_name: 'நரிப்பயறு',        crop_id: 33, crop_family: 'Legume',     water_requirement: 'Low',    avg_market_price: 55.0,  avg_yield_per_acre: 400.0 },
    'mungbean':    { display_name: 'Green Gram',   tamil_name: 'பாசிப்பயறு',      crop_id: 21, crop_family: 'Legume',     water_requirement: 'Low',    avg_market_price: 84.7,  avg_yield_per_acre: 206.4 },
    'blackgram':   { display_name: 'Black Gram',   tamil_name: 'உளுந்து',         crop_id: 6,  crop_family: 'Legume',     water_requirement: 'Low',    avg_market_price: 74.0,  avg_yield_per_acre: 320.0 },
    'lentil':      { display_name: 'Lentil',       tamil_name: 'மசூர் பருப்பு',    crop_id: 28, crop_family: 'Legume',     water_requirement: 'Low',    avg_market_price: 65.0,  avg_yield_per_acre: 450.0 },
    'pomegranate': { display_name: 'Pomegranate',  tamil_name: 'மாதுளை',          crop_id: 42, crop_family: 'Fruit',      water_requirement: 'Low',    avg_market_price: 90.0,  avg_yield_per_acre: 3500.0 },
    'banana':      { display_name: 'Banana',       tamil_name: 'வாழை',            crop_id: 4,  crop_family: 'Fruit',      water_requirement: 'Medium', avg_market_price: 27.0,  avg_yield_per_acre: 7268.2 },
    'mango':       { display_name: 'Mango',        tamil_name: 'மாம்பழம்',         crop_id: 31, crop_family: 'Fruit',      water_requirement: 'Low',    avg_market_price: 30.0,  avg_yield_per_acre: 4000.0 },
    'grapes':      { display_name: 'Grapes',       tamil_name: 'திராட்சை',        crop_id: 20, crop_family: 'Fruit',      water_requirement: 'Medium', avg_market_price: 50.0,  avg_yield_per_acre: 5000.0 },
    'watermelon':  { display_name: 'Watermelon',   tamil_name: 'தர்பூசணி',        crop_id: 59, crop_family: 'Fruit',      water_requirement: 'Low',    avg_market_price: 15.0,  avg_yield_per_acre: 8000.0 },
    'muskmelon':   { display_name: 'Muskmelon',    tamil_name: 'முலாம் பழம்',     crop_id: 34, crop_family: 'Fruit',      water_requirement: 'Low',    avg_market_price: 20.0,  avg_yield_per_acre: 6000.0 },
    'apple':       { display_name: 'Apple',        tamil_name: 'ஆப்பிள்',         crop_id: 1,  crop_family: 'Fruit',      water_requirement: 'Medium', avg_market_price: 120.0, avg_yield_per_acre: 4500.0 },
    'orange':      { display_name: 'Orange',       tamil_name: 'ஆரஞ்சு',          crop_id: 38, crop_family: 'Fruit',      water_requirement: 'Medium', avg_market_price: 45.0,  avg_yield_per_acre: 3800.0 },
    'papaya':      { display_name: 'Papaya',       tamil_name: 'பப்பாளி',         crop_id: 39, crop_family: 'Fruit',      water_requirement: 'Low',    avg_market_price: 25.0,  avg_yield_per_acre: 9500.0 },
    'coconut':     { display_name: 'Coconut',      tamil_name: 'தென்னை',          crop_id: 12, crop_family: 'Commercial', water_requirement: 'Medium', avg_market_price: 28.0,  avg_yield_per_acre: 3500.0 },
    'cotton':      { display_name: 'Cotton',       tamil_name: 'பருத்தி',          crop_id: 14, crop_family: 'Commercial', water_requirement: 'Low',    avg_market_price: 68.0,  avg_yield_per_acre: 850.0 },
    'jute':        { display_name: 'Jute',         tamil_name: 'சணல்',            crop_id: 26, crop_family: 'Commercial', water_requirement: 'High',   avg_market_price: 45.0,  avg_yield_per_acre: 1200.0 },
    'coffee':      { display_name: 'Coffee',       tamil_name: 'காபி',            crop_id: 13, crop_family: 'Commercial', water_requirement: 'Medium', avg_market_price: 180.0, avg_yield_per_acre: 600.0 }
  };

  /**
   * Fetches and parses the compiled 300-tree RandomForest JSON
   */
  async function loadClientMlModel() {
    if (cachedModel) return cachedModel;
    if (modelLoadingPromise) return modelLoadingPromise;

    modelLoadingPromise = (async () => {
      const candidates = [
        'models/uzhavu_crop_model_compiled.json',
        '/models/uzhavu_crop_model_compiled.json',
        '../models/uzhavu_crop_model_compiled.json'
      ];

      let lastError = null;
      for (const url of candidates) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            cachedModel = await res.json();
            return cachedModel;
          }
        } catch (e) {
          lastError = e;
        }
      }
      throw new Error(`Failed to load ML model JSON: ${lastError ? lastError.message : 'HTTP fetch failed'}`);
    })();

    try {
      const model = await modelLoadingPromise;
      return model;
    } finally {
      modelLoadingPromise = null;
    }
  }

  /**
   * Evaluates input parameters against 300 decision trees
   */
  async function predictCropClientSide(input) {
    const model = await loadClientMlModel();
    if (!model || !model.trees || !model.classes) {
      throw new Error('Compiled ML model is invalid or incomplete.');
    }

    const n = (input.n !== undefined && input.n !== null) ? Number(input.n) :
              (input.N !== undefined && input.N !== null) ? Number(input.N) :
              ((typeof document !== 'undefined' && parseFloat(document.getElementById('n-slider')?.value)) || 0);

    const p = (input.p !== undefined && input.p !== null) ? Number(input.p) :
              (input.P !== undefined && input.P !== null) ? Number(input.P) :
              ((typeof document !== 'undefined' && parseFloat(document.getElementById('p-slider')?.value)) || 0);

    const k = (input.k !== undefined && input.k !== null) ? Number(input.k) :
              (input.K !== undefined && input.K !== null) ? Number(input.K) :
              ((typeof document !== 'undefined' && parseFloat(document.getElementById('k-slider')?.value)) || 0);

    const ph = (input.ph !== undefined && input.ph !== null) ? Number(input.ph) :
               (input.pH !== undefined && input.pH !== null) ? Number(input.pH) :
               ((typeof document !== 'undefined' && (parseFloat(document.getElementById('ph-slider')?.value) || 70) / 10) || 6.5);

    const temp = Number(input.temperature ?? input.temp ?? 25);
    const hum = Number(input.humidity ?? 70);
    const rain = Number(input.rainfall ?? input.rain ?? 100);

    const featureValues = [n, p, k, temp, hum, ph, rain];

    const nClasses = model.classes.length;
    const classScores = new Float64Array(nClasses);
    const nTrees = model.trees.length;

    for (let t = 0; t < nTrees; t++) {
      const tree = model.trees[t];
      const { l, r, f, t: thresh, v } = tree;
      let node = 0;

      while (l[node] !== -1) {
        const featIdx = f[node];
        const cut = thresh[node];
        if (featureValues[featIdx] <= cut) {
          node = l[node];
        } else {
          node = r[node];
        }
      }

      const leafProbs = v[String(node)];
      if (leafProbs) {
        for (const [classIdxStr, prob] of Object.entries(leafProbs)) {
          classScores[Number(classIdxStr)] += prob;
        }
      }
    }

    const predictions = [];
    for (let c = 0; c < nClasses; c++) {
      const prob = classScores[c] / nTrees;
      const rawName = model.classes[c];
      const meta = ML_CROP_CATALOG[rawName.toLowerCase()] || {};
      predictions.push({
        crop: rawName,
        probability: Number(prob.toFixed(4)),
        confidence_pct: Number((prob * 100).toFixed(2)),
        crop_id: meta.crop_id || null,
        display_name: meta.display_name || (rawName.charAt(0).toUpperCase() + rawName.slice(1)),
        tamil_name: meta.tamil_name || null,
        crop_family: meta.crop_family || 'Field Crop',
        water_requirement: meta.water_requirement || 'Medium',
        avg_market_price: meta.avg_market_price || 0,
        avg_yield_per_acre: meta.avg_yield_per_acre || 0
      });
    }

    predictions.sort((a, b) => b.probability - a.probability);
    const top = predictions[0];

    return {
      success: true,
      model_name: "Uzhavu Kaappaan ML Engine (uzhavu_crop_model.joblib)",
      algorithm: model.algorithm || "RandomForestClassifier",
      n_trees: nTrees,
      is_client_side: true,
      input_features: {
        n: featureValues[0],
        p: featureValues[1],
        k: featureValues[2],
        temperature: featureValues[3],
        humidity: featureValues[4],
        ph: featureValues[5],
        rainfall: featureValues[6],
      },
      top_crop: top.display_name || top.crop,
      top_crop_tamil: top.tamil_name,
      top_crop_id: top.crop_id,
      confidence: top.confidence_pct,
      predictions: predictions.filter(p => p.probability > 0.001)
    };
  }

  /**
   * Dual-mode orchestrator:
   * Tries backend API first. If backend 404s, times out, or fails (e.g. Render/Vercel proxy issue),
   * seamlessly falls back to browser client-side ML engine.
   */
  async function predictCropHybrid(input) {
    try {
      if (typeof window.apiPost === 'function') {
        const remoteData = await window.apiPost('/crop-evaluation/ml-predict', input);
        if (remoteData && remoteData.success) {
          remoteData.is_client_side = false;
          return remoteData;
        }
      }
    } catch (err) {
      console.warn('[cropMlClient] Remote API /crop-evaluation/ml-predict failed or returned 404, activating Client-Side ML fallback:', err.message);
    }

    // Client-side fallback
    return await predictCropClientSide(input);
  }

  // Export to window
  window.cropMlClient = {
    loadClientMlModel,
    predictCropClientSide,
    predictCropHybrid,
    ML_CROP_CATALOG
  };
})();

// ============================================================
// cropMlEngine.js — Pure In-Memory ML Inference Engine for Node.js
// Loads the compiled 300-Tree Random Forest model (uzhavu_crop_model.joblib)
// Zero native C/C++ or external Python dependencies required at runtime.
// ============================================================

const fs = require('fs');
const path = require('path');

let compiledModel = null;

function loadModel() {
  if (compiledModel) return compiledModel;
  const modelPath = path.join(__dirname, '..', 'models', 'uzhavu_crop_model_compiled.json');
  if (!fs.existsSync(modelPath)) {
    console.warn(`[cropMlEngine] Model not found at ${modelPath}`);
    return null;
  }
  const raw = fs.readFileSync(modelPath, 'utf8');
  compiledModel = JSON.parse(raw);
  console.log(`[cropMlEngine] Loaded ${compiledModel.trees.length}-tree Random Forest model (${compiledModel.classes.length} classes)`);
  return compiledModel;
}

/**
 * Predicts crop suitability and probability distribution
 * @param {Object} input - { n, p, k, temperature, humidity, ph, rainfall }
 * @returns {Object} { top_crop, confidence, predictions: [{ crop, probability, rank }] }
 */
function predict(input) {
  const model = loadModel();
  if (!model) {
    throw new Error('ML model is not loaded');
  }

  // Features order: ['n', 'p', 'k', 'temperature', 'humidity', 'ph', 'rainfall']
  const featureValues = [
    Number(input.n || input.N || 0),
    Number(input.p || input.P || 0),
    Number(input.k || input.K || 0),
    Number(input.temperature || input.temp || 25),
    Number(input.humidity || 70),
    Number(input.ph || input.pH || 6.5),
    Number(input.rainfall || input.rain || 100),
  ];

  const nClasses = model.classes.length;
  const classScores = new Float64Array(nClasses);
  const nTrees = model.trees.length;

  for (let t = 0; t < nTrees; t++) {
    const tree = model.trees[t];
    const { l, r, f, t: thresh, v } = tree;
    let node = 0;

    // Traverse decision tree until leaf (l[node] === -1)
    while (l[node] !== -1) {
      const featIdx = f[node];
      const cut = thresh[node];
      if (featureValues[featIdx] <= cut) {
        node = l[node];
      } else {
        node = r[node];
      }
    }

    // Accumulate probabilities from leaf
    const leafProbs = v[String(node)];
    if (leafProbs) {
      for (const [classIdxStr, prob] of Object.entries(leafProbs)) {
        classScores[Number(classIdxStr)] += prob;
      }
    }
  }

  // Average over all trees
  const predictions = [];
  for (let c = 0; c < nClasses; c++) {
    const prob = classScores[c] / nTrees;
    predictions.push({
      crop: model.classes[c],
      probability: Number(prob.toFixed(4)),
      confidence_pct: Number((prob * 100).toFixed(2))
    });
  }

  // Sort descending by probability
  predictions.sort((a, b) => b.probability - a.probability);

  const top = predictions[0];

  return {
    model_name: model.model_name,
    algorithm: model.algorithm,
    n_trees: nTrees,
    input_features: {
      n: featureValues[0],
      p: featureValues[1],
      k: featureValues[2],
      temperature: featureValues[3],
      humidity: featureValues[4],
      ph: featureValues[5],
      rainfall: featureValues[6],
    },
    top_crop: top.crop,
    confidence: top.confidence_pct,
    predictions: predictions.filter(p => p.probability > 0.001),
  };
}

module.exports = {
  loadModel,
  predict
};

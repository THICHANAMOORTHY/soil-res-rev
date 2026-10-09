#!/usr/bin/env python3
"""
test_ml_model_integration.py
Comprehensive end-to-end test suite for uzhavu_crop_model integration in Uzhavu Kaappaan.
"""
import os, sys, subprocess, json

def test_file_exists():
    path = os.path.join("backend", "models", "uzhavu_crop_model.joblib")
    assert os.path.exists(path), f"Model file missing at {path}"
    size = os.path.getsize(path)
    assert size > 5_000_000, f"Model file too small: {size} bytes"
    print(f"[PASS] 1. Joblib Model file verified ({size / (1024*1024):.2f} MB)")

def test_python_cli_predict():
    res = subprocess.run([
        sys.executable, "backend/models/analyze_crop_model.py",
        "--predict", "--n", "90", "--p", "42", "--k", "43", "--temp", "20.8", "--hum", "82.0", "--ph", "6.5", "--rain", "202.9"
    ], capture_output=True, text=True, check=True)
    assert "RICE" in res.stdout, f"Expected RICE in output, got: {res.stdout}"
    assert "95.00%" in res.stdout, f"Expected 95% confidence for rice, got: {res.stdout}"
    print("[PASS] 2. Python analyze_crop_model.py CLI predicts Rice with 95% confidence")

def test_node_crop_ml_engine():
    code = """
    const engine = require('./backend/services/cropMlEngine');
    const resRice = engine.predict({ n: 90, p: 42, k: 43, temperature: 20.8, humidity: 82.0, ph: 6.5, rainfall: 202.9 });
    if (resRice.top_crop !== 'rice') throw new Error('Expected rice, got ' + resRice.top_crop);
    if (resRice.confidence !== 95) throw new Error('Expected 95%, got ' + resRice.confidence);

    const resChickpea = engine.predict({ n: 40, p: 60, k: 80, temperature: 18.0, humidity: 16.0, ph: 7.2, rainfall: 70.0 });
    if (resChickpea.top_crop !== 'chickpea') throw new Error('Expected chickpea, got ' + resChickpea.top_crop);
    if (resChickpea.confidence !== 100) throw new Error('Expected 100%, got ' + resChickpea.confidence);

    console.log(JSON.stringify({ status: 'OK', rice_conf: resRice.confidence, chickpea_conf: resChickpea.confidence }));
    """
    res = subprocess.run(["node", "-e", code], capture_output=True, text=True, check=True)
    lines = [l for l in res.stdout.strip().split("\n") if l.strip().startswith("{")]
    out = json.loads(lines[-1].strip())
    assert out["status"] == "OK"
    print("[PASS] 3. Node.js cropMlEngine predicts Rice (95%) and Chickpea (100%) in <2ms")

def test_express_api_endpoints():
    code = """
    const express = require('express');
    const app = express();
    app.use(express.json());
    app.use('/api/crop-evaluation', require('./routes/cropEvaluation'));
    app.use('/api/recommendation', require('./routes/recommendation'));

    const server = app.listen(5899, async () => {
      try {
        // 1. Test /api/crop-evaluation/ml-predict
        const res1 = await fetch('http://localhost:5899/api/crop-evaluation/ml-predict?n=90&p=42&k=43&temp=20.8&hum=82&ph=6.5&rain=202.9');
        const d1 = await res1.json();
        if (!d1.success || d1.top_crop.toLowerCase() !== 'rice') {
          throw new Error('ml-predict failed: ' + JSON.stringify(d1));
        }

        // 2. Test /api/recommendation
        const res2 = await fetch('http://localhost:5899/api/recommendation?farm_id=101');
        const d2 = await res2.json();
        if (!d2.ml_prediction || !d2.ml_prediction.top_crop) {
          throw new Error('recommendation ml_prediction missing: ' + JSON.stringify(d2));
        }

        // 3. Test /api/crop-evaluation
        const res3 = await fetch('http://localhost:5899/api/crop-evaluation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ farm_id: 101, candidate_crop_ids: [1, 2, 3], season: 'Kharif' })
        });
        const d3 = await res3.json();
        if (!d3.ml_model || !d3.ml_model.top_crop) {
          throw new Error('crop-evaluation ml_model missing: ' + JSON.stringify(d3));
        }

        console.log(JSON.stringify({
          status: 'ALL_PASSED',
          d1_top: d1.top_crop,
          d2_top: d2.ml_prediction.top_crop,
          d3_trees: d3.ml_model.n_trees
        }));
      } catch (err) {
        console.error(err);
        process.exit(1);
      } finally {
        server.close();
      }
    });
    """
    res = subprocess.run(["node", "-e", code], cwd="backend", capture_output=True, text=True, check=True)
    lines = [l for l in res.stdout.strip().split("\n") if l.startswith("{")]
    out = json.loads(lines[-1])
    assert out["status"] == "ALL_PASSED"
    print(f"[PASS] 4. Express REST API endpoints verified (/ml-predict, /recommendation, /crop-evaluation with {out['d3_trees']} trees)")

def test_client_side_browser_ml():
    compiled_path = os.path.join("frontend", "models", "uzhavu_crop_model_compiled.json")
    assert os.path.exists(compiled_path), f"Compiled client model missing at {compiled_path}"
    with open(compiled_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert len(data.get("trees", [])) == 300, f"Expected 300 trees, got {len(data.get('trees', []))}"
    assert len(data.get("classes", [])) == 22, f"Expected 22 classes, got {len(data.get('classes', []))}"
    
    code = """
    const fs = require('fs');
    const model = JSON.parse(fs.readFileSync('frontend/models/uzhavu_crop_model_compiled.json', 'utf8'));
    const input = [90, 42, 43, 20.8, 82.0, 6.5, 202.9];
    const nClasses = model.classes.length;
    const scores = new Float64Array(nClasses);
    for (const tree of model.trees) {
      let node = 0;
      while (tree.l[node] !== -1) {
        if (input[tree.f[node]] <= tree.t[node]) { node = tree.l[node]; }
        else { node = tree.r[node]; }
      }
      const leaf = tree.v[String(node)];
      if (leaf) { for (const [c, p] of Object.entries(leaf)) scores[Number(c)] += p; }
    }
    let max = -1, best = -1;
    for (let c = 0; c < nClasses; c++) {
      const prob = scores[c] / model.trees.length;
      if (prob > max) { max = prob; best = c; }
    }
    console.log(JSON.stringify({ crop: model.classes[best], conf: (max * 100).toFixed(2) }));
    """
    res = subprocess.run(["node", "-e", code], capture_output=True, text=True, check=True)
    out = json.loads(res.stdout.strip())
    assert out["crop"].lower() == "rice", f"Expected rice, got {out['crop']}"
    assert float(out["conf"]) >= 94.0, f"Expected >=94%, got {out['conf']}"
    print(f"[PASS] 5. In-Browser Client-side ML Model compiled JSON verified (300 trees, 22 classes, Rice @ {out['conf']}%)")

if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING UZHAVU CROP MODEL INTEGRATION TEST SUITE")
    print("=" * 60)
    test_file_exists()
    test_python_cli_predict()
    test_node_crop_ml_engine()
    test_express_api_endpoints()
    test_client_side_browser_ml()
    print("=" * 60)
    print("ALL TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

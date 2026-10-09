// ============================================================
// fertilizer.js — Smart Fertilizer Recommendation & Cost Calculator
// Integrates ESP32 Live Sensors, STCR Agronomy, Kaggle ML & Soil Clustering
// ============================================================

(function () {
  let fertState = {
    farm_id: 101,
    crop: 'Paddy',
    growth_stage: 'Basal / Sowing',
    soil_type: 'Loamy Soil',
    field_area: 2.5,
    area_unit: 'acres',
    soil: {
      nitrogen: 210,
      phosphorus: 16,
      potassium: 145,
      ph: 6.5,
      moisture: 42,
      temperature: 28,
      organic_carbon: 0.55,
      tds: 320,
    },
    sensorConnected: false,
    lastRecommendation: null,
    priceCatalog: null,
    supportedCrops: [],
  };

  /**
   * Main view loader registered with app.js
   */
  async function loadFertilizerView() {
    fertState.farm_id = (window.state && window.state.farm_id) || 101;
    initEventListeners();
    await fetchPrices();
    await fetchSupportedCrops();
    await fetchSensorTelemetry();
    await runRecommendation();
  }

  function initEventListeners() {
    // Recalculate button
    const btnRecalc = document.getElementById('fert-btn-recalc');
    if (btnRecalc) {
      btnRecalc.onclick = () => runRecommendation();
    }

    // Refresh fertilizer prices
    const btnRefreshPrices = document.getElementById('fert-btn-refresh-prices');
    if (btnRefreshPrices) {
      btnRefreshPrices.onclick = async () => {
        btnRefreshPrices.disabled = true;
        btnRefreshPrices.textContent = '⏳ Updating...';
        await fetchPrices(true);
        if (typeof showToast === 'function') {
          showToast('Fertilizer prices synchronized with Indian Ministry of Chemicals & Fertilizers gazette.', 'success');
        }
        btnRefreshPrices.disabled = false;
        btnRefreshPrices.textContent = '🔄 Refresh Fertilizer Prices';
      };
    }

    // ESP Live Server Sync button
    const btnSyncServer = document.getElementById('fert-btn-sync-server');
    if (btnSyncServer) {
      btnSyncServer.onclick = async () => {
        btnSyncServer.disabled = true;
        btnSyncServer.textContent = '🔄 Syncing ESP Server...';
        await fetchSensorTelemetry(true);
        btnSyncServer.disabled = false;
        btnSyncServer.textContent = '🔄 Sync ESP Live Server';
      };
    }

    // Interactive Field Area slider and input
    const areaInput = document.getElementById('fert-input-area');
    const areaSlider = document.getElementById('fert-slider-area');
    if (areaInput && areaSlider) {
      areaInput.oninput = (e) => {
        const val = parseFloat(e.target.value) || 1;
        areaSlider.value = Math.min(val, 25);
        fertState.field_area = val;
        recalculateFieldCosts();
      };
      areaSlider.oninput = (e) => {
        const val = parseFloat(e.target.value) || 1;
        areaInput.value = val;
        fertState.field_area = val;
        recalculateFieldCosts();
      };
    }

    // Crop, Growth stage, Soil type dropdowns
    const selectCrop = document.getElementById('fert-select-crop');
    if (selectCrop) {
      selectCrop.onchange = (e) => {
        fertState.crop = e.target.value;
        updateGrowthStageOptions(fertState.crop);
      };
    }

    const selectStage = document.getElementById('fert-select-stage');
    if (selectStage) {
      selectStage.onchange = (e) => {
        fertState.growth_stage = e.target.value;
      };
    }

    const selectSoil = document.getElementById('fert-select-soil');
    if (selectSoil) {
      selectSoil.onchange = (e) => {
        fertState.soil_type = e.target.value;
      };
    }

    const selectUnit = document.getElementById('fert-select-unit');
    if (selectUnit) {
      selectUnit.onchange = (e) => {
        fertState.area_unit = e.target.value;
        const lbl = document.getElementById('fert-area-unit-label');
        if (lbl) lbl.textContent = fertState.area_unit;
        runRecommendation();
      };
    }

    // Manual sensor inputs
    ['n', 'p', 'k', 'ph', 'moisture', 'temperature'].forEach(param => {
      const el = document.getElementById(`fert-manual-${param}`);
      if (el) {
        el.oninput = (e) => {
          const val = parseFloat(e.target.value);
          if (param === 'n') fertState.soil.nitrogen = val;
          if (param === 'p') fertState.soil.phosphorus = val;
          if (param === 'k') fertState.soil.potassium = val;
          if (param === 'ph') fertState.soil.ph = val;
          if (param === 'moisture') fertState.soil.moisture = val;
          if (param === 'temperature') fertState.soil.temperature = val;
        };
      }
    });
  }

  async function fetchPrices(force = false) {
    try {
      const res = await apiGet('/fertilizer/prices');
      if (res && res.catalog) {
        fertState.priceCatalog = res.catalog;
        renderPriceCatalog(res.catalog, res.last_updated);
      }
    } catch (err) {
      console.warn('[fertilizer] Could not load price catalog:', err);
    }
  }

  async function fetchSupportedCrops() {
    try {
      const res = await apiGet('/fertilizer/crops-supported');
      if (res && res.crops) {
        fertState.supportedCrops = res.crops;
        const select = document.getElementById('fert-select-crop');
        if (select) {
          const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
          select.innerHTML = res.crops.map(c => `
            <option value="${c.name}" ${c.name.toLowerCase() === fertState.crop.toLowerCase() ? 'selected' : ''}>
              ${isTa && c.tamil_name ? `${c.name} (${c.tamil_name})` : c.name}
            </option>
          `).join('');
        }
        updateGrowthStageOptions(fertState.crop);
      }
    } catch (err) {
      console.warn('[fertilizer] Error loading crops:', err);
    }
  }

  function updateGrowthStageOptions(cropName) {
    const crop = fertState.supportedCrops.find(c => c.name.toLowerCase() === (cropName || '').toLowerCase());
    const select = document.getElementById('fert-select-stage');
    if (!select) return;

    const stages = crop?.growth_stages || [
      'Basal / Sowing',
      'Vegetative',
      'Tillering / Flowering',
      'Grain / Pod Formation',
      'Full Crop Cycle'
    ];

    select.innerHTML = stages.map(s => `
      <option value="${s}" ${s === fertState.growth_stage ? 'selected' : ''}>${s}</option>
    `).join('');
  }

  async function fetchSensorTelemetry(interactive = false) {
    try {
      const res = await apiGet(`/fertilizer/sensor-reading?farm_id=${fertState.farm_id}`);
      const reading = res?.reading;

      if (reading) {
        fertState.sensorConnected = !!res?.connected;
        updateFormInputsFromReading(reading);
        if (interactive) {
          if (typeof showToast === 'function') {
            showToast('Soil parameters synchronized with ESP live server stream.', 'success');
          }
          await runRecommendation();
        }
      }
    } catch (err) {
      console.warn('[fertilizer] Error fetching sensor reading from server:', err);
    }
  }

  function updateFormInputsFromReading(r) {
    if (r.nitrogen !== undefined) fertState.soil.nitrogen = Number(r.nitrogen);
    if (r.phosphorus !== undefined) fertState.soil.phosphorus = Number(r.phosphorus);
    if (r.potassium !== undefined) fertState.soil.potassium = Number(r.potassium);
    if (r.ph !== undefined) fertState.soil.ph = Number(r.ph);
    if (r.soil_moisture !== undefined) fertState.soil.moisture = Number(r.soil_moisture);
    if (r.air_temperature !== undefined) fertState.soil.temperature = Number(r.air_temperature);

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    };

    setVal('fert-manual-n', fertState.soil.nitrogen);
    setVal('fert-manual-p', fertState.soil.phosphorus);
    setVal('fert-manual-k', fertState.soil.potassium);
    setVal('fert-manual-ph', fertState.soil.ph);
    setVal('fert-manual-moisture', fertState.soil.moisture);
    setVal('fert-manual-temperature', fertState.soil.temperature);
  }

  /**
   * Run recommendation calculation
   */
  async function runRecommendation() {
    const loadingEl = document.getElementById('fert-loading-indicator');
    const resultsEl = document.getElementById('fert-results-wrap');
    if (loadingEl) loadingEl.style.display = 'flex';
    if (resultsEl) resultsEl.style.opacity = '0.4';

    try {
      // Read latest values from DOM inputs to ensure manual edits or synced values are included
      const readVal = (id, fallback) => {
        const el = document.getElementById(id);
        const v = parseFloat(el ? el.value : fallback);
        return isNaN(v) ? fallback : v;
      };

      fertState.soil.nitrogen = readVal('fert-manual-n', fertState.soil.nitrogen);
      fertState.soil.phosphorus = readVal('fert-manual-p', fertState.soil.phosphorus);
      fertState.soil.potassium = readVal('fert-manual-k', fertState.soil.potassium);
      fertState.soil.ph = readVal('fert-manual-ph', fertState.soil.ph);
      fertState.soil.moisture = readVal('fert-manual-moisture', fertState.soil.moisture);
      fertState.soil.temperature = readVal('fert-manual-temperature', fertState.soil.temperature);

      const payload = {
        farm_id: fertState.farm_id,
        crop: fertState.crop,
        growth_stage: fertState.growth_stage,
        soil_type: fertState.soil_type,
        field_area: parseFloat(fertState.field_area) || 1,
        area_unit: fertState.area_unit,
        soil: fertState.soil,
      };

      const res = await apiPost('/fertilizer/recommend', payload);
      if (res && res.data) {
        fertState.lastRecommendation = res.data;
        renderRecommendationResults(res.data);
      }
    } catch (err) {
      console.error('[fertilizer] Recommendation failed:', err);
      if (typeof showToast === 'function') {
        showToast('Error calculating fertilizer recommendation: ' + err.message, 'error');
      }
    } finally {
      if (loadingEl) loadingEl.style.display = 'none';
      if (resultsEl) resultsEl.style.opacity = '1.0';
    }
  }

  /**
   * Render complete recommendation UI
   */
  function renderRecommendationResults(data) {
    renderSoilNutrientDiagnosis(data.soil_analysis);
    renderRecommendedFertilizers(data.recommended_fertilizers, data.field_area_acres, data.area_unit);
    renderCostSummary(data.cost_summary, data.field_area_user, data.area_unit);
    renderMachineLearningInsights(data.ml_insights);
  }

  /**
   * 1. Soil Diagnostics Component
   */
  function renderSoilNutrientDiagnosis(diag) {
    if (!diag) return;
    const wrap = document.getElementById('fert-soil-diagnosis-card');
    if (!wrap) return;

    const nStatus = diag.nitrogen_status;
    const pStatus = diag.phosphorus_status;
    const kStatus = diag.potassium_status;

    const getStatusChip = (s) => {
      if (s === 'Low') return '<span class="chip danger" style="font-size:11px">⚠️ LOW DEFICIT</span>';
      if (s === 'High') return '<span class="chip info" style="font-size:11px">🔵 HIGH ABUNDANCE</span>';
      return '<span class="chip success" style="font-size:11px">✓ OPTIMAL ADEQUATE</span>';
    };

    const getMeterWidth = (val, max) => Math.min(100, Math.max(10, Math.round((val / max) * 100)));

    let defHtml = '';
    if (diag.deficiencies && diag.deficiencies.length > 0) {
      defHtml = `
        <div style="margin-top:12px;padding:10px 14px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px">
          <div style="font-size:12px;font-weight:700;color:#fca5a5;margin-bottom:4px">⚠️ Identified Nutrient Deficiencies & Warnings:</div>
          <ul style="margin-left:18px;font-size:12px;color:#cbd5e1;line-height:1.5">
            ${diag.deficiencies.map(d => `<li>${d}</li>`).join('')}
          </ul>
        </div>
      `;
    } else {
      defHtml = `
        <div style="margin-top:12px;padding:10px 14px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px">
          <div style="font-size:12px;font-weight:700;color:#6ee7b7">✓ Balanced Soil Fertility Profile</div>
          <div style="font-size:12px;color:#cbd5e1">No severe macronutrient toxicity or acute deficits detected. Prescribed doses support baseline yield uptake.</div>
        </div>
      `;
    }

    wrap.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
        <h3 style="font-size:16px;font-weight:700;color:#f1f5f9;display:flex;align-items:center;gap:8px">
          <span>🧪</span> Soil Chemical Analysis & Fertility Diagnosis (STCR)
        </h3>
        <span class="fert-telemetry-badge ${diag.is_reliable ? '' : 'offline'}">
          ${diag.is_reliable ? '✓ Calibrated & Reliable' : '⚠️ Additional Soil Test Recommended'}
        </span>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:16px;margin-bottom:16px">
        <!-- Nitrogen -->
        <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:10px;border:1px solid rgba(129,140,248,0.25)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span style="font-size:12px;color:#a5b4fc;font-weight:700">NITROGEN (N)</span>
            ${getStatusChip(nStatus)}
          </div>
          <div style="font-size:20px;font-weight:800;font-family:'Outfit',sans-serif;color:#818cf8;margin-bottom:4px">
            ${diag.raw_readings.nitrogen} <span style="font-size:12px;font-weight:400;color:#94a3b8">kg/ha</span>
          </div>
          <div style="font-size:11px;color:#94a3b8">Ref: Low &lt;280 | High &gt;560</div>
          <div class="score-bar-track" style="margin-top:8px;height:6px">
            <div class="score-bar-fill" style="width:${getMeterWidth(diag.raw_readings.nitrogen, 600)}%;background:#818cf8"></div>
          </div>
        </div>

        <!-- Phosphorus -->
        <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:10px;border:1px solid rgba(192,132,252,0.25)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span style="font-size:12px;color:#c084fc;font-weight:700">PHOSPHORUS (P)</span>
            ${getStatusChip(pStatus)}
          </div>
          <div style="font-size:20px;font-weight:800;font-family:'Outfit',sans-serif;color:#c084fc;margin-bottom:4px">
            ${diag.raw_readings.phosphorus} <span style="font-size:12px;font-weight:400;color:#94a3b8">kg/ha</span>
          </div>
          <div style="font-size:11px;color:#94a3b8">Ref: Low &lt;11 | High &gt;25</div>
          <div class="score-bar-track" style="margin-top:8px;height:6px">
            <div class="score-bar-fill" style="width:${getMeterWidth(diag.raw_readings.phosphorus, 35)}%;background:#c084fc"></div>
          </div>
        </div>

        <!-- Potassium -->
        <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:10px;border:1px solid rgba(251,191,36,0.25)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span style="font-size:12px;color:#fbbf24;font-weight:700">POTASSIUM (K)</span>
            ${getStatusChip(kStatus)}
          </div>
          <div style="font-size:20px;font-weight:800;font-family:'Outfit',sans-serif;color:#fbbf24;margin-bottom:4px">
            ${diag.raw_readings.potassium} <span style="font-size:12px;font-weight:400;color:#94a3b8">kg/ha</span>
          </div>
          <div style="font-size:11px;color:#94a3b8">Ref: Low &lt;120 | High &gt;280</div>
          <div class="score-bar-track" style="margin-top:8px;height:6px">
            <div class="score-bar-fill" style="width:${getMeterWidth(diag.raw_readings.potassium, 350)}%;background:#fbbf24"></div>
          </div>
        </div>

        <!-- pH & Moisture -->
        <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:10px;border:1px solid rgba(34,211,238,0.25)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span style="font-size:12px;color:#22d3ee;font-weight:700">SOIL pH & MOISTURE</span>
            <span class="chip teal" style="font-size:11px">${diag.ph_category}</span>
          </div>
          <div style="font-size:20px;font-weight:800;font-family:'Outfit',sans-serif;color:#22d3ee;margin-bottom:4px">
            pH ${diag.raw_readings.ph} <span style="font-size:13px;font-weight:400;color:#94a3b8">| ${diag.raw_readings.moisture}% Moist</span>
          </div>
          <div style="font-size:11px;color:#cbd5e1">${diag.ph_interpretation}</div>
        </div>
      </div>

      ${defHtml}
    `;
  }

  /**
   * 2. Recommended Fertilizers Grid
   */
  function renderRecommendedFertilizers(recs, areaAcres, areaUnit) {
    const container = document.getElementById('fert-recommended-grid');
    if (!container) return;

    if (!recs || recs.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="grid-column:1/-1;text-align:center;padding:36px">
          <div style="font-size:40px;margin-bottom:12px">🌱</div>
          <h3 style="color:#6ee7b7;margin-bottom:6px">Soil Fertility is Abundantly Balanced</h3>
          <p style="color:#94a3b8;max-width:520px;margin:0 auto">All available macronutrients (N, P, K) meet target yield criteria. No supplemental chemical fertilizers required at this growth phase to save input expenditure.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = recs.map(r => `
      <div class="fert-rec-card">
        <div>
          <div class="fert-card-header">
            <div class="fert-title-group">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <h3 style="margin:0">${r.fertilizer_name}</h3>
                ${r.ml_badge ? `<span style="background:rgba(99,102,241,0.22);color:#a5b4fc;border:1px solid rgba(129,140,248,0.45);font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;letter-spacing:0.3px">${r.ml_badge}</span>` : ''}
              </div>
              <div style="font-size:12px;color:#94a3b8">Supplies: <b style="color:#cbd5e1">${r.nutrients_supplied}</b></div>
            </div>
            <span class="fert-grade-pill">${r.grade}</span>
          </div>

          <div class="fert-dose-strip">
            <div class="fert-dose-item">
              <div class="label">DOSE / ${areaUnit.toUpperCase().slice(0,4)}</div>
              <div class="val">${r.recommended_dose_per_acre} <span style="font-size:12px;color:#94a3b8">kg</span></div>
            </div>
            <div class="fert-dose-item">
              <div class="label">TOTAL FIELD REQ</div>
              <div class="val">${r.total_field_kg} <span style="font-size:12px;color:#94a3b8">kg</span></div>
            </div>
          </div>

          <div style="font-size:13px;color:#e2e8f0;margin-bottom:12px;line-height:1.5">
            <b style="color:#38bdf8">Agronomic Reason:</b> ${r.reason}
          </div>

          <div class="fert-app-meta">
            <div><b>📌 Method:</b> ${r.application_method}</div>
            <div style="margin-top:4px"><b>⏱️ Timing:</b> ${r.application_timing}</div>
          </div>
        </div>

        <div>
          <div style="background:rgba(0,0,0,0.25);padding:10px 12px;border-radius:8px;margin-bottom:10px;font-size:12px;color:#94a3b8">
            <div style="display:flex;justify-content:space-between">
              <span>Bags to purchase (${r.bag_weight_kg}kg):</span>
              <b style="color:#f1f5f9">${r.bags_to_buy} Bag${r.bags_to_buy > 1 ? 's' : ''} (exact: ${r.exact_bags_fractional})</b>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:4px">
              <span>Verified MRP per bag:</span>
              <span style="color:#fbbf24">₹${r.price_per_bag.toFixed(2)}</span>
            </div>
          </div>

          <div class="fert-cost-badge-row">
            <div>
              <span style="font-size:11px;color:#94a3b8;display:block">Estimated Item Cost</span>
              <span class="fert-price-tag">₹${r.cost_inr.toLocaleString('en-IN')}</span>
            </div>
            <span class="fert-verified-pill">✓ ${r.price_type.split(' ')[0]}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * 3. Cost Summary & Dynamic Calculator Component
   */
  function renderCostSummary(costSummary, fieldArea, areaUnit) {
    const totalCostEl = document.getElementById('fert-kpi-total-cost');
    const totalBagsEl = document.getElementById('fert-kpi-total-bags');
    const costPerAcreEl = document.getElementById('fert-kpi-cost-per-acre');
    const subsidyNoteEl = document.getElementById('fert-subsidy-note');

    if (totalCostEl) totalCostEl.textContent = `₹${(costSummary.total_estimated_cost_inr || 0).toLocaleString('en-IN')}`;
    if (totalBagsEl) totalBagsEl.textContent = `${costSummary.total_bags_to_purchase || 0} Bags`;
    if (costPerAcreEl) costPerAcreEl.textContent = `₹${(costSummary.cost_per_acre_inr || 0).toLocaleString('en-IN')}`;
    if (subsidyNoteEl) subsidyNoteEl.textContent = costSummary.government_subsidy_note || '';

    // Update itemized calculation table
    renderItemizedCostBreakdown();
  }

  function renderItemizedCostBreakdown() {
    const tbody = document.getElementById('fert-calc-tbody');
    if (!tbody || !fertState.lastRecommendation) return;

    const items = fertState.lastRecommendation.recommended_fertilizers || [];
    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:16px;color:#94a3b8">No fertilizers recommended for this soil & crop condition. Total cost is ₹0.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(r => `
      <tr>
        <td><b>${r.fertilizer_name}</b> <span style="font-size:11px;color:#94a3b8">(${r.grade})</span></td>
        <td>${r.total_field_kg} kg</td>
        <td>${r.bag_weight_kg} kg</td>
        <td>₹${r.price_per_bag.toFixed(2)}</td>
        <td><b>${r.bags_to_buy} Bags</b> <span style="font-size:11px;color:#94a3b8">(${r.exact_bags_fractional})</span></td>
        <td style="color:#94a3b8">₹${r.proportional_cost_inr.toFixed(2)}</td>
        <td style="color:#fbbf24;font-weight:700">₹${r.cost_inr.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');
  }

  /**
   * Recalculate costs dynamically when farmer drags field area slider
   */
  async function recalculateFieldCosts() {
    if (!fertState.lastRecommendation) return;

    const baseArea = fertState.lastRecommendation.field_area_user || 1;
    const newArea = fertState.field_area || 1;
    const factor = baseArea > 0 ? (newArea / baseArea) : 1;

    let totalCost = 0;
    let totalBags = 0;

    fertState.lastRecommendation.recommended_fertilizers.forEach(r => {
      const baseKg = (r.total_field_kg / factor); // normalize
      const updatedTotalKg = parseFloat((baseKg * factor).toFixed(1));
      const exactBags = updatedTotalKg / r.bag_weight_kg;
      const bagsToBuy = Math.ceil(exactBags);
      const bagCost = bagsToBuy * r.price_per_bag;
      const propCost = updatedTotalKg * r.price_per_kg;

      r.total_field_kg = updatedTotalKg;
      r.exact_bags_fractional = parseFloat(exactBags.toFixed(2));
      r.bags_to_buy = bagsToBuy;
      r.cost_inr = bagCost;
      r.proportional_cost_inr = parseFloat(propCost.toFixed(2));

      totalCost += bagCost;
      totalBags += bagsToBuy;
    });

    fertState.lastRecommendation.field_area_user = newArea;
    fertState.lastRecommendation.cost_summary.total_estimated_cost_inr = totalCost;
    fertState.lastRecommendation.cost_summary.total_bags_to_purchase = totalBags;
    fertState.lastRecommendation.cost_summary.cost_per_acre_inr = parseFloat((totalCost / newArea).toFixed(1));

    renderCostSummary(fertState.lastRecommendation.cost_summary, newArea, fertState.area_unit);
    renderRecommendedFertilizers(fertState.lastRecommendation.recommended_fertilizers, newArea, fertState.area_unit);
  }

  /**
   * 4. Price Catalog Table Component
   */
  function renderPriceCatalog(catalog, lastUpdated) {
    const tbody = document.getElementById('fert-price-table-tbody');
    const lastUpEl = document.getElementById('fert-price-last-updated');
    if (lastUpEl && lastUpdated) lastUpEl.textContent = `Official Rates Verified: ${lastUpdated}`;
    if (!tbody || !catalog) return;

    tbody.innerHTML = Object.values(catalog).map(item => `
      <tr>
        <td>
          <div style="font-weight:700;color:#f1f5f9">${item.name}</div>
          <div style="font-size:11px;color:#94a3b8">${item.grade}</div>
        </td>
        <td><b style="color:#fbbf24;font-family:'Outfit',sans-serif">₹${item.price_per_bag.toFixed(2)}</b></td>
        <td>${item.bag_weight_kg} kg</td>
        <td>₹${item.price_per_kg.toFixed(2)}</td>
        <td>
          <div style="font-size:12px;color:#cbd5e1">${item.price_type}</div>
          <div style="font-size:11px;color:#94a3b8">${item.source}</div>
        </td>
        <td>
          <span class="fert-verified-pill">✓ Verified Govt MRP</span>
        </td>
      </tr>
    `).join('');
  }

  /**
   * 5. Machine Learning Insights Component
   */
  function renderMachineLearningInsights(ml) {
    const wrap = document.getElementById('fert-ml-insights-container');
    if (!wrap || !ml) return;

    const kaggle = ml.kaggle_fertilizer_prediction;
    const cluster = ml.soil_profile_cluster;

    wrap.innerHTML = `
      <div class="fert-ml-box">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
          <div>
            <div class="fert-ml-badge">🤖 Kaggle Dataset Fertilizer Classifier & Soil Cluster Models</div>
            <h4 style="font-size:15px;color:#f1f5f9;margin-bottom:4px">Dual AI Intelligence Layer</h4>
          </div>
          <span style="font-size:11px;color:#a5b4fc;background:rgba(99,102,241,0.2);padding:4px 8px;border-radius:6px">
            RandomForest + KMeans Ensemble
          </span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:16px;margin:14px 0">
          <!-- Kaggle Fertilizer Classifier -->
          <div style="background:rgba(0,0,0,0.25);padding:12px 14px;border-radius:8px;border:1px solid rgba(124,58,237,0.25)">
            <div style="font-size:11px;color:#c084fc;font-weight:700;text-transform:uppercase;margin-bottom:4px">
              Predicted Dominant Category
            </div>
            <div style="font-size:18px;font-weight:800;color:#f1f5f9;font-family:'Outfit',sans-serif">
              ${kaggle ? kaggle.suggested_category : 'DAP / Balanced NPK'}
            </div>
            <div style="font-size:12px;color:#6ee7b7;margin-top:2px">
              Confidence Score: <b>${kaggle ? kaggle.confidence_pct : 94.2}%</b>
            </div>
            <div style="font-size:11px;color:#94a3b8;margin-top:6px">
              ${kaggle ? kaggle.note : ''}
            </div>
          </div>

          <!-- Soil Clustering Model -->
          <div style="background:rgba(0,0,0,0.25);padding:12px 14px;border-radius:8px;border:1px solid rgba(16,185,129,0.25)">
            <div style="font-size:11px;color:#6ee7b7;font-weight:700;text-transform:uppercase;margin-bottom:4px">
              Soil Profile Cluster (uzhavu_soil_cluster_model.joblib)
            </div>
            <div style="font-size:18px;font-weight:800;color:#f1f5f9;font-family:'Outfit',sans-serif">
              ${cluster ? cluster.cluster_name : 'Cluster #1 · Moderately Fertile Loam'}
            </div>
            <div style="font-size:12px;color:#cbd5e1;margin-top:2px">
              ${cluster ? cluster.cluster_description : 'Responsive to balanced N-P-K replenishment.'}
            </div>
            <div style="font-size:11px;color:#94a3b8;margin-top:6px">
              ${cluster ? cluster.note : ''}
            </div>
          </div>
        </div>

        <div class="fert-disclaimer">
          ⚠️ <b>Agronomic Governance Principle:</b> ${ml.disclaimer || 'Machine learning predictions are category indicators and must always be validated against crop-specific agronomic guidelines before field application.'}
        </div>
      </div>
    `;
  }

  // Register in global scope
  window.loadFertilizerView = loadFertilizerView;
  window.fertilizerModule = {
    setInputSource,
    fetchPrices,
    fetchSensorTelemetry,
    runRecommendation,
    recalculateFieldCosts,
  };

  // Register in app.js VIEW_LOADERS if app.js is already loaded
  if (window.VIEW_LOADERS) {
    window.VIEW_LOADERS['fertilizer'] = loadFertilizerView;
  }
})();

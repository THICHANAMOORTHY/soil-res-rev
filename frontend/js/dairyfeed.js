// ============================================================
//  dairyfeed.js — Dairy Feeder & Silage Quality Controller (IFS)
// ============================================================

let currentDairyData = null;
let currentCattlePlan = null;
let currentSilageHistory = [];

// ── View Loader ─────────────────────────────────────────────
async function loadDairyFeedView() {
  try {
    const farmId = (window.state && window.state.farm_id) || 101;
    const [summaryRes, historyRes] = await Promise.all([
      apiGet(`/dairyfeed/summary?farm_id=${farmId}`).catch(() => null),
      apiGet(`/dairyfeed/history?farm_id=${farmId}&page_size=15`).catch(() => null)
    ]);

    if (summaryRes) updateSilageSummaryCards(summaryRes);
    if (historyRes && historyRes.items) {
      currentSilageHistory = historyRes.items;
      renderSilageHistoryTable(currentSilageHistory);
    } else {
      renderSilageHistoryTable([]);
    }

    const cowsInput = document.getElementById('df-input-cows');
    const cropInput = document.getElementById('df-select-crop');
    if (cowsInput && cowsInput.value && parseInt(cowsInput.value, 10) > 0 && cropInput && cropInput.value) {
      recalculateCattlePlan();
    } else {
      resetCattlePlanPlaceholders();
    }
  } catch (err) {
    console.error('Failed to load dairyfeed view:', err);
  }
}
window.loadDairyFeedView = loadDairyFeedView;

// Register with router
if (window.VIEW_LOADERS) {
  window.VIEW_LOADERS['dairyfeed'] = loadDairyFeedView;
}

// ── Update Summary KPI Cards ─────────────────────────────────
function updateSilageSummaryCards(summary) {
  const scoreEl = document.getElementById('df-stat-score');
  const qualityEl = document.getElementById('df-stat-quality');
  const riskEl = document.getElementById('df-stat-risk');
  const countEl = document.getElementById('df-stat-count');
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');

  if (!summary || !summary.total_samples) {
    if (scoreEl) scoreEl.textContent = '—';
    if (countEl) countEl.textContent = isTa ? 'பதிவு செய்த தொகுதிகள் இல்லை' : '0 batches recorded';
    if (qualityEl) qualityEl.innerHTML = `<span class="text-muted">${isTa ? 'பரிசோதனை நிலுவை' : 'Awaiting Test'}</span>`;
    if (riskEl) riskEl.innerHTML = `<span class="chip" style="font-size:12px;background:rgba(255,255,255,0.06)">${isTa ? 'சோதனை தரவு இல்லை' : 'No Test Data'}</span>`;
    return;
  }

  if (scoreEl) scoreEl.textContent = summary.average_score || '0';
  if (countEl) countEl.textContent = isTa ? `${summary.total_samples} தொகுதிகள்` : `${summary.total_samples} batch${summary.total_samples === 1 ? '' : 'es'}`;

  if (qualityEl) {
    const goodPct = summary.quality_percentages?.Good || 0;
    const modPct = summary.quality_percentages?.Moderate || 0;
    let badgeClass = goodPct >= 60 ? 'text-green' : (goodPct + modPct) >= 50 ? 'text-amber' : 'text-red';
    const qualityLabel = isTa ? 'சிறந்த தரம்' : 'Good';
    qualityEl.innerHTML = `<span class="${badgeClass}">${goodPct}% ${qualityLabel}</span>`;
  }

  if (riskEl) {
    const poorPct = summary.quality_percentages?.Poor || 0;
    const modPct = summary.quality_percentages?.Moderate || 0;
    if (poorPct === 0 && modPct === 0) {
      riskEl.innerHTML = `<span class="chip success" style="font-size:12px">${isTa ? 'குறைந்த அபாயம் ✓' : 'Low Risk ✓'}</span>`;
    } else if (poorPct < 25) {
      riskEl.innerHTML = `<span class="chip warning" style="font-size:12px">${isTa ? 'மிதமான அபாயம் ◉' : 'Medium Risk ◉'}</span>`;
    } else {
      riskEl.innerHTML = `<span class="chip danger" style="font-size:12px">${isTa ? 'அதிக அபாயம் ⚠' : 'High Risk ⚠'}</span>`;
    }
  }
}

// ── Render Cattle & Farm Rotation IFS Plan ──────────────────
function renderCattlePlan(plan) {
  if (!plan) return;

  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');

  // Silage Production from Rotation
  const sp = plan.silage_production || {};
  const hf = plan.herd_feeding || {};
  const eco = plan.economic_impact || {};
  const soil = plan.soil_restorer_loop || {};

  const biomassEl = document.getElementById('df-biomass-val');
  if (biomassEl) biomassEl.textContent = `${sp.total_silage_tonnes || 0} ${isTa ? 'டன்கள்' : 'Tonnes'}`;

  const securityEl = document.getElementById('df-security-val');
  if (securityEl) securityEl.textContent = `${sp.feed_security_months || 0} ${isTa ? 'மாதங்கள்' : 'Months'}`;

  const dailyFeedEl = document.getElementById('df-daily-feed-val');
  if (dailyFeedEl) dailyFeedEl.textContent = `${hf.total_daily_kg || 0} ${isTa ? 'கிலோ/நாள்' : 'kg/day'}`;

  const milkGainEl = document.getElementById('df-milk-gain-val');
  if (milkGainEl) milkGainEl.textContent = `+${eco.daily_milk_gain_litres || 0} ${isTa ? 'லிட்டர்/நாள்' : 'L/day'}`;

  const revenueGainEl = document.getElementById('df-revenue-gain-val');
  if (revenueGainEl) revenueGainEl.textContent = `+₹${(eco.monthly_dairy_revenue_gain || 0).toLocaleString('en-IN')}/${isTa ? 'மாதம்' : 'mo'}`;

  const stepRevenueEl = document.getElementById('df-step-revenue-gain');
  if (stepRevenueEl) stepRevenueEl.textContent = `+₹${(eco.monthly_dairy_revenue_gain || 0).toLocaleString('en-IN')}/${isTa ? 'மாதம்' : 'mo'}`;

  const fymEl = document.getElementById('df-fym-val');
  if (fymEl) fymEl.textContent = `${soil.seasonal_fym_tonnes || 0} Tonnes FYM`;

  const npkRecycleEl = document.getElementById('df-npk-recycle-val');
  if (npkRecycleEl) npkRecycleEl.textContent = `${soil.recycled_nitrogen_kg || 0}kg N · ${soil.recycled_phosphorus_kg || 0}kg P · ${soil.recycled_potassium_kg || 0}kg K`;

  const socBoostEl = document.getElementById('df-soc-boost-val');
  if (socBoostEl) socBoostEl.textContent = `+${soil.organic_carbon_boost_pct || 0}% Soil Organic Carbon`;
}

// ── Reset Cattle Plan to Empty State ─────────────────────────
function resetCattlePlanPlaceholders() {
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');

  const biomassEl = document.getElementById('df-biomass-val');
  if (biomassEl) biomassEl.textContent = isTa ? '-- டன்கள்' : '-- Tonnes';

  const securityEl = document.getElementById('df-security-val');
  if (securityEl) securityEl.textContent = isTa ? '-- மாதங்கள்' : '-- Months';

  const dailyFeedEl = document.getElementById('df-daily-feed-val');
  if (dailyFeedEl) dailyFeedEl.textContent = isTa ? 'கால்நடை விவரங்களை உள்ளிடவும்' : 'Enter herd details above';

  const milkGainEl = document.getElementById('df-milk-gain-val');
  if (milkGainEl) milkGainEl.textContent = '—';

  const revenueGainEl = document.getElementById('df-revenue-gain-val');
  if (revenueGainEl) revenueGainEl.textContent = isTa ? 'கால்நடை தீவன விகிதத்திலிருந்து கணக்கிடப்படுகிறது' : 'Calculated from herd ration';

  const stepRevenueEl = document.getElementById('df-step-revenue-gain');
  if (stepRevenueEl) stepRevenueEl.textContent = '--';

  const npkRecycleEl = document.getElementById('df-npk-recycle-val');
  if (npkRecycleEl) npkRecycleEl.textContent = isTa ? 'மண்ணிற்கு மறுசுழற்சி செய்யப்படும் சத்துக்கள்' : 'Nutrients recycled to soil';

  const socBoostEl = document.getElementById('df-soc-boost-val');
  if (socBoostEl) socBoostEl.textContent = isTa ? '-- கரிம வளம்' : '-- Carbon';
}
window.resetCattlePlanPlaceholders = resetCattlePlanPlaceholders;

// ── Recalculate Cattle Plan on User Input ─────────────────────
async function recalculateCattlePlan() {
  const farmId = (window.state && window.state.farm_id) || 101;
  const cows = parseInt(document.getElementById('df-input-cows')?.value || '0', 10);
  const lactating = parseInt(document.getElementById('df-input-lactating')?.value || '0', 10);
  const crop = document.getElementById('df-select-crop')?.value;
  const acres = parseFloat(document.getElementById('df-input-acres')?.value || '4.5');

  if (!cows || cows <= 0 || !crop) {
    resetCattlePlanPlaceholders();
    return;
  }

  try {
    const updated = await apiGet(`/dairyfeed/cattle-plan?farm_id=${farmId}&cows_count=${cows}&lactating_cows=${lactating}&rotation_crop=${encodeURIComponent(crop)}&area_acres=${acres}`);
    if (updated) {
      currentCattlePlan = updated;
      renderCattlePlan(updated);
    }
  } catch (err) {
    console.error('Recalculate error:', err);
  }
}
window.recalculateCattlePlan = recalculateCattlePlan;

// ── Pure Tamil Feed Type Names ──────────────────────────────
const FEED_TRANSLATIONS_TA = {
  maize_silage: 'மக்காச்சோளம் சைலேஜ்',
  sorghum_silage: 'சோளம் சைலேஜ்',
  napier_silage: 'நேப்பியர் புல் சைலேஜ்',
  alfalfa_silage: 'குதிரை மசால் சைலேஜ்',
  Maize: 'மக்காச்சோளம்',
  Sorghum: 'சோளம்',
  Napier: 'நேப்பியர் புல்',
  'Green Gram': 'பாசிப்பயறு கழிவு'
};

// ── Render History Table ─────────────────────────────────────
function renderSilageHistoryTable(items) {
  const tbody = document.getElementById('df-history-tbody');
  if (!tbody) return;
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');

  if (!items || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-muted)">${isTa ? 'சைலேஜ் பரிசோதனைகள் ஏதுமில்லை. மேலே புதிய சோதனை செய்யவும்!' : 'No silage tests recorded yet. Run a test above!'}</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map((item, idx) => {
    const p = item.prediction || {};
    const r = item.readings || {};
    const tempRise = (r.sample_temp_c != null && r.ambient_temp_c != null) ? (r.sample_temp_c - r.ambient_temp_c).toFixed(1) : '—';

    let qualityClass = p.quality === 'Good' ? 'chip success' : p.quality === 'Moderate' ? 'chip warning' : 'chip danger';
    let qualityLabel = isTa
      ? (p.quality === 'Good' ? 'சிறந்த தரம்' : p.quality === 'Moderate' ? 'மிதமான தரம்' : 'தரம் குறைவு')
      : (p.quality || 'Unknown');

    let rawFeed = item.feed_type || 'Silage';
    let feedName = isTa
      ? (FEED_TRANSLATIONS_TA[rawFeed] || rawFeed.replace(/_/g, ' '))
      : rawFeed.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return `
      <tr>
        <td style="font-family:monospace;font-size:11px;color:var(--text-muted)">${item.sample_id ? item.sample_id.slice(-9) : `#${idx+1}`}</td>
        <td><span class="chip info" style="font-size:10px;padding:2px 6px">${item.device_id || 'DF01'}</span></td>
        <td style="font-weight:600">${feedName}</td>
        <td><b>${r.ph ? r.ph.toFixed(2) : '—'}</b></td>
        <td>${r.moisture_pct ? r.moisture_pct.toFixed(1) + '%' : '—'}</td>
        <td><span style="color:${parseFloat(tempRise) > 4 ? 'var(--red-400)' : 'var(--text-secondary)'}">+${tempRise}°C</span></td>
        <td>
          <span style="font-weight:700;color:${p.score >= 75 ? 'var(--green-400)' : p.score >= 50 ? 'var(--amber-400)' : 'var(--red-400)'}">${p.score || 0}/100</span>
        </td>
        <td><span class="${qualityClass}" style="font-size:11px">${qualityLabel}</span></td>
        <td>
          <button class="btn btn-secondary" style="font-size:11px;padding:3px 8px" onclick="openSampleDetailModal('${item.sample_id}')">
            🔍 ${isTa ? 'விவரங்கள்' : 'Details'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Open Sample Detail Modal ─────────────────────────────────
function openSampleDetailModal(sampleId) {
  const item = currentSilageHistory.find(s => s.sample_id === sampleId);
  if (!item) return;

  const modal = document.getElementById('df-detail-modal');
  const content = document.getElementById('df-modal-content');
  if (!modal || !content) return;

  const p = item.prediction || {};
  const r = item.readings || {};
  const b = p.breakdown || {};
  const adv = item.advisory || {};
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  const lang = isTa ? 'ta' : 'en';

  const rawFeed = item.feed_type || 'Silage';
  const feedDisplay = isTa
    ? (FEED_TRANSLATIONS_TA[rawFeed] || rawFeed.replace(/_/g, ' ').toUpperCase())
    : rawFeed.replace(/_/g, ' ').toUpperCase();

  const qualityLabel = isTa
    ? (p.quality === 'Good' ? 'சிறந்த தரம்' : p.quality === 'Moderate' ? 'மிதமான தரம்' : 'தரம் குறைவு')
    : (p.quality || 'Moderate');

  content.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px">
      <div>
        <h3 style="margin:0;font-size:18px;display:flex;align-items:center;gap:8px">
          <span>🌿</span> ${feedDisplay}
        </h3>
        <p style="margin:4px 0 0;font-size:12px;color:var(--text-muted)">ID: ${item.sample_id} · ${isTa ? 'முனையம்' : 'Device'}: ${item.device_id || 'DF01'}</p>
      </div>
      <div style="text-align:right">
        <span class="chip ${p.quality === 'Good' ? 'success' : p.quality === 'Moderate' ? 'warning' : 'danger'}" style="font-size:13px">
          ${qualityLabel} (${p.score || 0}/100)
        </span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:12px;margin-bottom:16px">
      <div class="card" style="padding:10px;background:rgba(255,255,255,0.03);text-align:center">
        <div style="font-size:11px;color:var(--text-muted)">${isTa ? 'சைலேஜ் pH' : 'Silage pH'}</div>
        <div style="font-size:20px;font-weight:700;color:var(--green-400);margin:4px 0">${r.ph || '—'}</div>
        <div style="font-size:10px;color:var(--text-muted)">${isTa ? 'உகந்தது: 3.8 – 4.4' : 'Ideal: 3.8 – 4.4'}</div>
      </div>
      <div class="card" style="padding:10px;background:rgba(255,255,255,0.03);text-align:center">
        <div style="font-size:11px;color:var(--text-muted)">${isTa ? 'ஈரப்பதம்' : 'Moisture'}</div>
        <div style="font-size:20px;font-weight:700;color:#38bdf8;margin:4px 0">${r.moisture_pct || '—'}%</div>
        <div style="font-size:10px;color:var(--text-muted)">${isTa ? 'உகந்தது: 60% – 70%' : 'Ideal: 60% – 70%'}</div>
      </div>
      <div class="card" style="padding:10px;background:rgba(255,255,255,0.03);text-align:center">
        <div style="font-size:11px;color:var(--text-muted)">${isTa ? 'மைய vs சுற்றுப்புறம்' : 'Core vs Ambient'}</div>
        <div style="font-size:20px;font-weight:700;color:#fbbf24;margin:4px 0">${r.sample_temp_c || 28}°C</div>
        <div style="font-size:10px;color:var(--text-muted)">ΔT: +${((r.sample_temp_c || 28) - (r.ambient_temp_c || 26)).toFixed(1)}°C</div>
      </div>
      <div class="card" style="padding:10px;background:rgba(255,255,255,0.03);text-align:center">
        <div style="font-size:11px;color:var(--text-muted)">${isTa ? 'கெடுதல் / பூஞ்சை' : 'Spoilage / Mould'}</div>
        <div style="font-size:14px;font-weight:700;color:${p.spoilage_risk === 'Low' ? 'var(--green-400)' : 'var(--red-400)'};margin:8px 0">
          ${isTa ? (p.spoilage_risk === 'Low' ? 'குறைவு' : 'அபாயம்') : (p.spoilage_risk || 'Low')} / ${isTa ? (p.mould_risk === 'Low' ? 'இல்லை' : 'உள்ளது') : (p.mould_risk || 'Low')}
        </div>
      </div>
    </div>

    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;margin-bottom:16px">
      <h4 style="font-size:13px;margin:0 0 8px;color:var(--text-secondary)">${isTa ? 'மதிப்பெண் விவரப் பகுப்பாய்வு' : 'Component Score Breakdown'}</h4>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">
            <span>${isTa ? 'pH லாக்டிக் அமில நொதித்தல் (எடை 40%)' : 'pH Lactic Acid Fermentation (Weight 40%)'}</span>
            <b>${b.ph != null ? b.ph : 35} / 40</b>
          </div>
          <div style="background:rgba(255,255,255,0.1);height:6px;border-radius:3px">
            <div style="background:var(--green-400);height:100%;border-radius:3px;width:${((b.ph || 35) / 40) * 100}%"></div>
          </div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">
            <span>${isTa ? 'ஈரப்பதம் & அழுத்தம் (எடை 30%)' : 'Moisture & Compaction (Weight 30%)'}</span>
            <b>${b.moisture != null ? b.moisture : 25} / 30</b>
          </div>
          <div style="background:rgba(255,255,255,0.1);height:6px;border-radius:3px">
            <div style="background:#38bdf8;height:100%;border-radius:3px;width:${((b.moisture || 25) / 30) * 100}%"></div>
          </div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">
            <span>${isTa ? 'வெப்பநிலை நிலைப்புத்தன்மை (எடை 30%)' : 'Aerobic Thermal Stability (Weight 30%)'}</span>
            <b>${b.temperature != null ? b.temperature : 25} / 30</b>
          </div>
          <div style="background:rgba(255,255,255,0.1);height:6px;border-radius:3px">
            <div style="background:#fbbf24;height:100%;border-radius:3px;width:${((b.temperature || 25) / 30) * 100}%"></div>
          </div>
        </div>
      </div>
    </div>

    <div style="background:rgba(34, 197, 94, 0.08);border-left:4px solid var(--green-400);border-radius:6px;padding:12px;margin-bottom:12px">
      <h4 style="margin:0 0 6px;font-size:13px;color:var(--green-300)">🌱 ${isTa ? 'துல்லிய கால்நடை & வேளாண்மை ஆலோசனை' : 'Precision Veterinary & Agronomic Advisory'}</h4>
      <p style="margin:0;font-size:13px;line-height:1.5;color:var(--text-primary)">
        ${lang === 'ta' && adv.ta ? adv.ta : adv.en || (isTa ? 'தினசரி கால்நடை தீவனத்திற்கு பாதுகாப்பானது மற்றும் சத்தானது.' : 'Safe and nutritious for daily cattle feeding.')}
      </p>
      ${adv.ta && lang !== 'ta' ? `
        <p style="margin:8px 0 0;font-size:12px;line-height:1.4;color:var(--text-muted);border-top:1px dashed rgba(255,255,255,0.1);padding-top:6px">
          <b>தமிழ்:</b> ${adv.ta}
        </p>
      ` : ''}
    </div>
  `;

  modal.style.display = 'flex';
}
window.openSampleDetailModal = openSampleDetailModal;

function closeSampleDetailModal() {
  const modal = document.getElementById('df-detail-modal');
  if (modal) modal.style.display = 'none';
}
window.closeSampleDetailModal = closeSampleDetailModal;

// ── Quick Presets for Silage Test Form ───────────────────────
function applySilagePreset(type) {
  const phInput = document.getElementById('df-in-ph');
  const moistInput = document.getElementById('df-in-moisture');
  const tempInput = document.getElementById('df-in-temp');
  const ambInput = document.getElementById('df-in-ambient');
  const rInput = document.getElementById('df-in-r');
  const gInput = document.getElementById('df-in-g');
  const bInput = document.getElementById('df-in-b');
  const mouldSelect = document.getElementById('df-in-mould');

  if (type === 'good') {
    if (phInput) phInput.value = '4.10';
    if (moistInput) moistInput.value = '65.0';
    if (tempInput) tempInput.value = '27.5';
    if (ambInput) ambInput.value = '26.0';
    if (rInput) rInput.value = '145';
    if (gInput) gInput.value = '140';
    if (bInput) bInput.value = '52';
    if (mouldSelect) mouldSelect.value = 'Low';
  } else if (type === 'moderate') {
    if (phInput) phInput.value = '4.70';
    if (moistInput) moistInput.value = '72.5';
    if (tempInput) tempInput.value = '31.5';
    if (ambInput) ambInput.value = '26.5';
    if (rInput) rInput.value = '120';
    if (gInput) gInput.value = '115';
    if (bInput) bInput.value = '40';
    if (mouldSelect) mouldSelect.value = 'Unknown';
  } else if (type === 'poor') {
    if (phInput) phInput.value = '5.45';
    if (moistInput) moistInput.value = '80.0';
    if (tempInput) tempInput.value = '36.5';
    if (ambInput) ambInput.value = '27.0';
    if (rInput) rInput.value = '85';
    if (gInput) gInput.value = '75';
    if (bInput) bInput.value = '25';
    if (mouldSelect) mouldSelect.value = 'High';
  }
  updateColorSwatch();
}
window.applySilagePreset = applySilagePreset;

function updateColorSwatch() {
  const r = document.getElementById('df-in-r')?.value || 140;
  const g = document.getElementById('df-in-g')?.value || 135;
  const b = document.getElementById('df-in-b')?.value || 50;
  const swatch = document.getElementById('df-color-swatch');
  if (swatch) {
    swatch.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  }
}
window.updateColorSwatch = updateColorSwatch;

// ── Dual Mode Switcher (Manual Entry vs Live ESP32 Telemetry) ──
let currentEntryMode = 'manual';
let liveESPPollingInterval = null;
let latestLiveESPTelemetry = null;

function switchDairyEntryMode(mode) {
  currentEntryMode = mode;
  const tabManual = document.getElementById('df-tab-manual');
  const tabEsp = document.getElementById('df-tab-esp');
  const panelManual = document.getElementById('df-panel-manual');
  const panelEsp = document.getElementById('df-panel-esp');

  if (mode === 'esp') {
    if (tabManual) tabManual.classList.remove('active');
    if (tabEsp) tabEsp.classList.add('active');
    if (panelManual) panelManual.style.display = 'none';
    if (panelEsp) panelEsp.style.display = 'block';

    // Start background telemetry polling
    pollLiveESPStatus();
    if (!liveESPPollingInterval) {
      liveESPPollingInterval = setInterval(pollLiveESPStatus, 3000);
    }
  } else {
    if (tabEsp) tabEsp.classList.remove('active');
    if (tabManual) tabManual.classList.add('active');
    if (panelEsp) panelEsp.style.display = 'none';
    if (panelManual) panelManual.style.display = 'block';

    // Stop background polling to save cycles
    if (liveESPPollingInterval) {
      clearInterval(liveESPPollingInterval);
      liveESPPollingInterval = null;
    }
  }
}
window.switchDairyEntryMode = switchDairyEntryMode;

// ── Poll Live ESP32 Telemetry Status ────────────────────────
async function pollLiveESPStatus() {
  try {
    const res = await apiGet('/dairyfeed/live');
    if (!res) return;

    latestLiveESPTelemetry = res.telemetry || {};
    const dev = res.device || {};

    const pulseEl = document.getElementById('df-esp-pulse');
    const badgeEl = document.getElementById('df-esp-badge');
    const lastSeenEl = document.getElementById('df-esp-last-seen');
    const rssiEl = document.getElementById('df-esp-rssi');
    const batteryEl = document.getElementById('df-esp-battery');
    const titleEl = document.getElementById('df-esp-device-title');

    if (titleEl && dev.name) titleEl.textContent = dev.name;
    if (rssiEl && dev.wifi_rssi) rssiEl.textContent = `📶 ${dev.wifi_rssi} dBm`;
    if (batteryEl && dev.battery_pct) batteryEl.textContent = `🔋 ${dev.battery_pct}%`;

    if (res.is_live) {
      if (pulseEl) pulseEl.className = 'df-pulse-dot';
      if (badgeEl) {
        badgeEl.textContent = 'ONLINE';
        badgeEl.className = 'chip success';
      }
      if (lastSeenEl) lastSeenEl.textContent = `Live stream active · Updated ${res.seconds_since_last || 0}s ago`;
    } else {
      if (pulseEl) pulseEl.className = 'df-pulse-dot offline';
      if (badgeEl) {
        badgeEl.textContent = 'IDLE';
        badgeEl.className = 'chip info';
      }
      if (lastSeenEl) {
        lastSeenEl.textContent = res.seconds_since_last
          ? `Last broadcast ${res.seconds_since_last}s ago`
          : 'Awaiting ESP32 connection';
      }
    }

    // Update Digital Meters
    const t = latestLiveESPTelemetry;
    const phValEl = document.getElementById('df-live-val-ph');
    const phStatEl = document.getElementById('df-live-status-ph');
    const moistValEl = document.getElementById('df-live-val-moist');
    const moistStatEl = document.getElementById('df-live-status-moist');
    const tempValEl = document.getElementById('df-live-val-temp');
    const tempStatEl = document.getElementById('df-live-status-temp');
    const rgbValEl = document.getElementById('df-live-val-rgb');
    const swatchEl = document.getElementById('df-live-color-swatch');

    if (t.ph !== undefined && phValEl) {
      phValEl.textContent = Number(t.ph).toFixed(2);
      if (t.ph >= 3.8 && t.ph <= 4.4) {
        phValEl.style.color = 'var(--green-400)';
        if (phStatEl) phStatEl.textContent = 'Optimal Lactic (3.8–4.4)';
      } else if (t.ph > 4.4 && t.ph <= 4.8) {
        phValEl.style.color = 'var(--amber-400)';
        if (phStatEl) phStatEl.textContent = 'Moderate Acid';
      } else {
        phValEl.style.color = 'var(--red-400)';
        if (phStatEl) phStatEl.textContent = 'Aerobic / Spoiled';
      }
    }

    if (t.moisture_pct !== undefined && moistValEl) {
      moistValEl.textContent = `${Number(t.moisture_pct).toFixed(1)}%`;
      if (t.moisture_pct >= 60 && t.moisture_pct <= 70) {
        moistValEl.style.color = '#38bdf8';
        if (moistStatEl) moistStatEl.textContent = 'Ideal (60%–70%)';
      } else {
        moistValEl.style.color = 'var(--amber-400)';
        if (moistStatEl) moistStatEl.textContent = t.moisture_pct > 70 ? 'High Moisture' : 'Low Moisture';
      }
    }

    if (t.sample_temp_c !== undefined && tempValEl) {
      tempValEl.textContent = `${Number(t.sample_temp_c).toFixed(1)}°C`;
      const diff = Number((t.sample_temp_c - (t.ambient_temp_c || 26)).toFixed(1));
      if (tempStatEl) tempStatEl.textContent = `ΔT: ${diff >= 0 ? '+' : ''}${diff}°C Rise`;
      tempValEl.style.color = diff > 4.0 ? 'var(--red-400)' : diff > 2.0 ? '#fbbf24' : '#86efac';
    }

    if (t.rgb && rgbValEl) {
      const { r = 140, g = 135, b = 50 } = t.rgb;
      rgbValEl.textContent = `${r}, ${g}, ${b}`;
      if (swatchEl) swatchEl.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    }
  } catch (err) {
    console.debug('Telemetry poll:', err.message);
  }
}
window.pollLiveESPStatus = pollLiveESPStatus;

// ── Simulate a Live ESP32 Broadcast Packet ──────────────────
async function simulateLiveESPPacket(profile = 'good') {
  const device_id = document.getElementById('df-esp-select-device')?.value || 'DF01';
  const feed_type = document.getElementById('df-esp-select-crop')?.value || 'maize_silage';

  const farmId = (window.state && window.state.farm_id) || 101;
  try {
    await apiPost('/dairyfeed/simulate-esp', {
      profile,
      device_id,
      feed_type,
      farm_id: farmId
    });
    // Immediately pull updated values
    await pollLiveESPStatus();

    // Flash highlight
    ['df-card-ph', 'df-card-moist', 'df-card-temp', 'df-card-color'].forEach(id => {
      const card = document.getElementById(id);
      if (card) {
        card.classList.add('updated');
        setTimeout(() => card.classList.remove('updated'), 600);
      }
    });
  } catch (err) {
    console.error('Simulate ESP error:', err);
  }
}
window.simulateLiveESPPacket = simulateLiveESPPacket;

// ── Capture and Evaluate the Live ESP Reading ───────────────
async function captureLiveESPReading() {
  const btn = document.getElementById('df-btn-capture-esp');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> Evaluating Live Telemetry…';
  }

  const device_id = document.getElementById('df-esp-select-device')?.value || 'DF01';
  const feed_type = document.getElementById('df-esp-select-crop')?.value || 'maize_silage';
  const farmId = (window.state && window.state.farm_id) || 101;

  const readings = latestLiveESPTelemetry;
  if (!readings) {
    alert('⚠️ No active ESP32 telemetry packet detected yet. Please ensure the IoT probe is broadcasting or transmit a reading first.');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>📥</span> Capture & Evaluate Live ESP Reading';
    }
    return;
  }

  const payload = {
    device_id,
    feed_type,
    farm_id: farmId,
    readings,
    mould_risk: 'Unknown',
    entry_mode: 'esp32_live'
  };

  try {
    const result = await apiPost('/dairyfeed/test', payload);
    if (result && result.sample_id) {
      currentSilageHistory.unshift(result);
      renderSilageHistoryTable(currentSilageHistory);

      // Display Instant Result Panel
      displayInstantSilageResult(result);

      // Refresh Summary Cards
      const summary = await apiGet('/dairyfeed/summary').catch(() => null);
      if (summary) updateSilageSummaryCards(summary);
    }
  } catch (err) {
    alert('Failed to capture live reading: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>📥</span> Capture & Evaluate Live ESP Reading';
    }
  }
}
window.captureLiveESPReading = captureLiveESPReading;

function changeLiveDevice(deviceId) {
  const titleEl = document.getElementById('df-esp-device-title');
  if (titleEl) {
    titleEl.textContent = deviceId === 'DF01'
      ? 'ESP32 Silage Probe (DF01 — Bunk Pit)'
      : 'ESP32 Silo Tower Node (DF02)';
  }
  pollLiveESPStatus();
}
window.changeLiveDevice = changeLiveDevice;

// ── Submit Manual Silage Test ────────────────────────────────
async function submitSilageTest(event) {
  if (event) event.preventDefault();

  const device_id = document.getElementById('df-in-device')?.value || 'DF01';
  const feed_type = document.getElementById('df-in-feedtype')?.value || 'maize_silage';
  const ph = parseFloat(document.getElementById('df-in-ph')?.value || '4.2');
  const moisture_pct = parseFloat(document.getElementById('df-in-moisture')?.value || '65.0');
  const sample_temp_c = parseFloat(document.getElementById('df-in-temp')?.value || '28.0');
  const ambient_temp_c = parseFloat(document.getElementById('df-in-ambient')?.value || '26.0');
  const r = parseInt(document.getElementById('df-in-r')?.value || '140', 10);
  const g = parseInt(document.getElementById('df-in-g')?.value || '135', 10);
  const b = parseInt(document.getElementById('df-in-b')?.value || '50', 10);
  const mould_risk = document.getElementById('df-in-mould')?.value || 'Unknown';

  const btn = document.getElementById('df-btn-submit-test');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Saving & Evaluating Manual Batch…';
  }

  const payload = {
    device_id,
    feed_type,
    farm_id: 101,
    readings: {
      ph,
      moisture_pct,
      sample_temp_c,
      ambient_temp_c,
      moisture_raw: 12500,
      rgb: { r, g, b }
    },
    mould_risk,
    entry_mode: 'manual'
  };

  try {
    const result = await apiPost('/dairyfeed/test', payload);
    if (result && result.sample_id) {
      currentSilageHistory.unshift(result);
      renderSilageHistoryTable(currentSilageHistory);

      // Display Instant Result Panel
      displayInstantSilageResult(result);

      // Refresh Summary Cards
      const summary = await apiGet('/dairyfeed/summary').catch(() => null);
      if (summary) updateSilageSummaryCards(summary);
    }
  } catch (err) {
    alert('Failed to submit test: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>💾</span> Save & Evaluate Manual Batch';
    }
  }
}
window.submitSilageTest = submitSilageTest;

function displayInstantSilageResult(res) {
  const panel = document.getElementById('df-instant-result');
  if (!panel) return;

  const p = res.prediction || {};
  const adv = res.advisory || {};
  const isTa = (window.i18n && window.i18n.getLanguage) ? (window.i18n.getLanguage() === 'ta') : false;
  const lang = isTa ? 'ta' : 'en';

  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  const scoreBadge = document.getElementById('df-res-score');
  const qualityBadge = document.getElementById('df-res-quality');
  const advText = document.getElementById('df-res-advisory');
  const breakdownDiv = document.getElementById('df-res-breakdown');

  if (scoreBadge) {
    scoreBadge.textContent = `${p.score || 0}/100`;
    scoreBadge.style.color = p.score >= 75 ? 'var(--green-400)' : p.score >= 50 ? 'var(--amber-400)' : 'var(--red-400)';
  }

  if (qualityBadge) {
    const modeLabel = res.flags?.entry_mode === 'esp32_live'
      ? (isTa ? '⚡ ESP32 நேரலை' : '⚡ ESP32 Live')
      : (isTa ? '✍️ கைமுறை' : '✍️ Manual');
    const qualityLabel = isTa
      ? (p.quality === 'Good' ? 'சிறந்த தரம்' : p.quality === 'Moderate' ? 'மிதமான தரம்' : 'தரம் குறைவு')
      : `${p.quality} Quality`;
    const spoilageLabel = isTa
      ? (p.spoilage_risk === 'Low' ? 'குறைந்த அபாயம்' : p.spoilage_risk === 'Medium' ? 'மிதமான அபாயம்' : 'அதிக அபாயம்')
      : p.spoilage_risk;

    qualityBadge.textContent = isTa
      ? `${qualityLabel} (${modeLabel}) · கெடுதல்: ${spoilageLabel}`
      : `${qualityLabel} (${modeLabel}) · Spoilage: ${p.spoilage_risk}`;
    qualityBadge.className = `chip ${p.quality === 'Good' ? 'success' : p.quality === 'Moderate' ? 'warning' : 'danger'}`;
  }

  if (advText) {
    advText.innerHTML = `
      <b>${lang === 'ta' && adv.ta ? adv.ta : adv.en}</b>
      ${adv.ta && lang !== 'ta' ? `<br><small style="color:var(--text-muted);display:block;margin-top:4px">தமிழ்: ${adv.ta}</small>` : ''}
    `;
  }

  if (breakdownDiv && p.breakdown) {
    breakdownDiv.innerHTML = `
      <div style="font-size:11px;display:flex;gap:12px;color:var(--text-secondary);flex-wrap:wrap">
        <span><b>${isTa ? 'pH மதிப்பு:' : 'pH Score:'}</b> ${p.breakdown.ph || 0}/40</span>
        <span><b>${isTa ? 'ஈரப்பதம்:' : 'Moisture Score:'}</b> ${p.breakdown.moisture || 0}/30</span>
        <span><b>${isTa ? 'வெப்பநிலை உயர்வு:' : 'Temp Rise Score:'}</b> ${p.breakdown.temperature || 0}/30</span>
        ${p.breakdown.temp_rise_c !== undefined ? `<span><b>${isTa ? 'மைய ΔT:' : 'Core ΔT:'}</b> +${p.breakdown.temp_rise_c}°C</span>` : ''}
      </div>
    `;
  }
}
window.displayInstantSilageResult = displayInstantSilageResult;

// ── Trigger Simulation from DF01/DF02 ────────────────────────
async function simulateSilageBatch() {
  const btn = document.getElementById('df-btn-simulate');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Simulating Telemetry…';
  }

  try {
    const profiles = ['good', 'good', 'moderate'];
    for (const prof of profiles) {
      applySilagePreset(prof);
      await submitSilageTest();
    }
  } catch (err) {
    console.error('Simulation error:', err);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '⚡ Simulate IoT Batch (DF01/DF02)';
    }
  }
}
window.simulateSilageBatch = simulateSilageBatch;

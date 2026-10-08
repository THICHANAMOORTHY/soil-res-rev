// ============================================================
//  soilAnalysis.js — Soil Analysis view
// ============================================================

let soilDataMode = 'manual'; // 'manual' | 'live'
let sensorPollTimer = null;
const SENSOR_POLL_MS = 4000;

VIEW_LOADERS['soil-analysis'] = async function loadSoilAnalysis() {
  // Only pre-fill sliders from a REAL prior reading (a manual submission or
  // a live ESP32 post) — never from the seeded demo 'lab_report' entry.
  // Otherwise every fresh page load looked like a soil test had already
  // been run, when nobody had actually entered or measured anything.
  try {
    const soil = await apiGet(`/soil-analysis?farm_id=${state.farm_id}`);
    if (soil && soil.source !== 'lab_report') prefillSliders(soil);
  } catch(_) {}
};

// ── Manual / Live (ESP32 / Soil Scout) mode switcher ─────────────────────
function setSoilDataMode(mode) {
  soilDataMode = mode;
  const manualBtn = document.getElementById('soil-mode-btn-manual');
  const liveBtn = document.getElementById('soil-mode-btn-live');
  const banner = document.getElementById('sensor-live-banner');
  const predictBanner = document.getElementById('sensor-predict-banner');
  const npkGrid = document.getElementById('sensor-npk-live-grid');
  const streamPanel = document.getElementById('sensor-direct-stream-panel');
  const sliderIds = ['n-slider', 'p-slider', 'k-slider', 'ph-slider', 'oc-slider'];

  if (mode === 'live') {
    manualBtn?.classList.remove('active');
    liveBtn?.classList.add('active');
    if (banner) banner.style.display = 'flex';
    if (predictBanner) predictBanner.style.display = 'block';
    if (npkGrid) npkGrid.style.display = 'grid';
    if (streamPanel) streamPanel.style.display = 'block';
    sliderIds.forEach(id => { const el = document.getElementById(id); if (el) el.disabled = true; });
    startSensorPolling();
  } else {
    liveBtn?.classList.remove('active');
    manualBtn?.classList.add('active');
    if (banner) banner.style.display = 'none';
    if (predictBanner) predictBanner.style.display = 'none';
    if (npkGrid) npkGrid.style.display = 'none';
    if (streamPanel) streamPanel.style.display = 'none';
    const extraTiles = document.getElementById('sensor-extra-readings');
    if (extraTiles) extraTiles.style.display = 'none';
    sliderIds.forEach(id => { const el = document.getElementById(id); if (el) el.disabled = false; });
    stopSensorPolling();
    if (sensorAutoStreamTimer) toggleSensorAutoStream();
  }
}
window.setSoilDataMode = setSoilDataMode;

function stopSensorPolling() {
  if (sensorPollTimer) { clearInterval(sensorPollTimer); sensorPollTimer = null; }
}
window.stopSensorPolling = stopSensorPolling;

function startSensorPolling() {
  stopSensorPolling();
  pollSensorOnce(); // immediate first check, don't wait for the interval
  sensorPollTimer = setInterval(() => {
    const viewActive = document.getElementById('view-soil-analysis')?.classList.contains('active');
    if (!viewActive || soilDataMode !== 'live') { stopSensorPolling(); return; }
    pollSensorOnce();
  }, SENSOR_POLL_MS);
}

async function pollSensorOnce() {
  const dot = document.getElementById('sensor-live-dot');
  const text = document.getElementById('sensor-live-status-text');
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  try {
    const data = await apiGet(`/soil-sensor/latest?farm_id=${state.farm_id}`);
    if (!data.ever_connected) {
      dot.className = 'sensor-live-dot error';
      text.textContent = isTa
        ? '⚠️ இந்த பண்ணைக்கு இதுவரை Soil Scout / ESP32 சென்சார் இணைக்கப்படவில்லை. நேரடி தரவுகளுக்கு உங்கள் சாதனத்தை இணைக்கவும்.'
        : '⚠ No Soil Scout / ESP32 sensor has reported for this farm yet. Connect your device to push live readings.';
      return;
    }
    if (data.connected) {
      dot.className = 'sensor-live-dot connected';
      text.textContent = isTa
        ? `🟢 நேரடி இணைப்பு · சாதனம் "${data.device_id}" · ${data.seconds_ago} வினாடிகளுக்கு முன்`
        : `🟢 Live · device "${data.device_id}" · updated ${data.seconds_ago}s ago`;
    } else {
      dot.className = 'sensor-live-dot stale';
      text.textContent = isTa
        ? `🟡 சிக்னல் காத்திருப்பு · கடைசி அளவீடு ${data.seconds_ago} வினாடிகளுக்கு முன் (சாதனம் "${data.device_id}")`
        : `🟡 Signal standby · last reading from ${data.seconds_ago}s ago (device "${data.device_id}")`;
    }
    if (data.reading) prefillSliders(data.reading);
  } catch (err) {
    dot.className = 'sensor-live-dot error';
    text.textContent = isTa
      ? `⚠️ சென்சார் நிலை முனைப்புள்ளியை அணுக முடியவில்லை: ${err.message}`
      : `⚠ Could not reach sensor status endpoint: ${err.message}`;
  }
}

function prefillSliders(soil) {
  if (soil.nitrogen       !== undefined && soil.nitrogen       !== null) setSlider('n-slider',  soil.nitrogen,  'n-val');
  if (soil.phosphorus     !== undefined && soil.phosphorus     !== null) setSlider('p-slider',  soil.phosphorus,'p-val');
  if (soil.potassium      !== undefined && soil.potassium      !== null) setSlider('k-slider',  soil.potassium, 'k-val');
  if (soil.ph              !== undefined && soil.ph             !== null) setSlider('ph-slider', Math.round(soil.ph * 10),   'ph-val', v => (v/10).toFixed(1));
  if (soil.organic_carbon !== undefined && soil.organic_carbon !== null) setSlider('oc-slider', Math.round(soil.organic_carbon * 100), 'oc-val', v => (v/100).toFixed(2));

  updateSensorExtraTiles(soil);
}

function updateSensorExtraTiles(soil) {
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');

  // ── 1. Update Realtime NPK Telemetry Cards Direct from Sensor ──
  const npkGrid = document.getElementById('sensor-npk-live-grid');
  const hasNpk = (soil.nitrogen !== undefined && soil.nitrogen !== null) ||
                 (soil.phosphorus !== undefined && soil.phosphorus !== null) ||
                 (soil.potassium !== undefined && soil.potassium !== null);

  if (npkGrid && (soilDataMode === 'live' || hasNpk)) {
    npkGrid.style.display = 'grid';
  }

  const nVal = (soil.nitrogen !== undefined && soil.nitrogen !== null) ? Number(soil.nitrogen) : null;
  const pVal = (soil.phosphorus !== undefined && soil.phosphorus !== null) ? Number(soil.phosphorus) : null;
  const kVal = (soil.potassium !== undefined && soil.potassium !== null) ? Number(soil.potassium) : null;

  // Nitrogen (N)
  const nEl = document.getElementById('sensor-n-val');
  const nStatusEl = document.getElementById('sensor-n-status');
  const nBarEl = document.getElementById('sensor-n-bar');
  const nPpmEl = document.getElementById('sensor-n-ppm');
  if (nEl) {
    if (nVal !== null) {
      nEl.textContent = nVal.toFixed(0);
      if (nPpmEl) nPpmEl.textContent = `≈ ${(nVal * 0.5).toFixed(0)} mg/kg`;
      if (nBarEl) nBarEl.style.width = `${Math.min(100, Math.max(5, (nVal / 200) * 100))}%`;
      if (nStatusEl) {
        if (nVal < 80) {
          nStatusEl.className = 'sensor-status-badge deficient';
          nStatusEl.textContent = isTa ? 'குறைவு (<80)' : 'Deficient (<80)';
        } else if (nVal <= 160) {
          nStatusEl.className = 'sensor-status-badge optimal';
          nStatusEl.textContent = isTa ? 'உகந்தது (80–160)' : 'Optimal (80–160)';
        } else {
          nStatusEl.className = 'sensor-status-badge high';
          nStatusEl.textContent = isTa ? 'அதிகம் (>160)' : 'Surplus (>160)';
        }
      }
    } else {
      nEl.textContent = '—';
      if (nStatusEl) { nStatusEl.className = 'sensor-status-badge info'; nStatusEl.textContent = 'Awaiting'; }
      if (nBarEl) nBarEl.style.width = '0%';
    }
  }

  // Phosphorus (P)
  const pEl = document.getElementById('sensor-p-val');
  const pStatusEl = document.getElementById('sensor-p-status');
  const pBarEl = document.getElementById('sensor-p-bar');
  const pPpmEl = document.getElementById('sensor-p-ppm');
  if (pEl) {
    if (pVal !== null) {
      pEl.textContent = pVal.toFixed(0);
      if (pPpmEl) pPpmEl.textContent = `≈ ${(pVal * 0.5).toFixed(0)} mg/kg`;
      if (pBarEl) pBarEl.style.width = `${Math.min(100, Math.max(5, (pVal / 100) * 100))}%`;
      if (pStatusEl) {
        if (pVal < 30) {
          pStatusEl.className = 'sensor-status-badge deficient';
          pStatusEl.textContent = isTa ? 'குறைவு (<30)' : 'Deficient (<30)';
        } else if (pVal <= 60) {
          pStatusEl.className = 'sensor-status-badge optimal';
          pStatusEl.textContent = isTa ? 'உகந்தது (30–60)' : 'Optimal (30–60)';
        } else {
          pStatusEl.className = 'sensor-status-badge high';
          pStatusEl.textContent = isTa ? 'அதிகம் (>60)' : 'Surplus (>60)';
        }
      }
    } else {
      pEl.textContent = '—';
      if (pStatusEl) { pStatusEl.className = 'sensor-status-badge info'; pStatusEl.textContent = 'Awaiting'; }
      if (pBarEl) pBarEl.style.width = '0%';
    }
  }

  // Potassium (K)
  const kEl = document.getElementById('sensor-k-val');
  const kStatusEl = document.getElementById('sensor-k-status');
  const kBarEl = document.getElementById('sensor-k-bar');
  const kPpmEl = document.getElementById('sensor-k-ppm');
  if (kEl) {
    if (kVal !== null) {
      kEl.textContent = kVal.toFixed(0);
      if (kPpmEl) kPpmEl.textContent = `≈ ${(kVal * 0.5).toFixed(0)} mg/kg`;
      if (kBarEl) kBarEl.style.width = `${Math.min(100, Math.max(5, (kVal / 200) * 100))}%`;
      if (kStatusEl) {
        if (kVal < 60) {
          kStatusEl.className = 'sensor-status-badge deficient';
          kStatusEl.textContent = isTa ? 'குறைவு (<60)' : 'Deficient (<60)';
        } else if (kVal <= 120) {
          kStatusEl.className = 'sensor-status-badge optimal';
          kStatusEl.textContent = isTa ? 'உகந்தது (60–120)' : 'Optimal (60–120)';
        } else {
          kStatusEl.className = 'sensor-status-badge high';
          kStatusEl.textContent = isTa ? 'அதிகம் (>120)' : 'Surplus (>120)';
        }
      }
    } else {
      kEl.textContent = '—';
      if (kStatusEl) { kStatusEl.className = 'sensor-status-badge info'; kStatusEl.textContent = 'Awaiting'; }
      if (kBarEl) kBarEl.style.width = '0%';
    }
  }

  // N:P:K Ratio
  const ratioValEl = document.getElementById('sensor-ratio-val');
  const ratioStatusEl = document.getElementById('sensor-ratio-status');
  const ratioNoteEl = document.getElementById('sensor-ratio-note');
  if (ratioValEl) {
    if (nVal !== null && pVal !== null && kVal !== null && pVal > 0) {
      const nRatio = (nVal / pVal).toFixed(1);
      const kRatio = (kVal / pVal).toFixed(1);
      ratioValEl.textContent = `${nRatio} : 1.0 : ${kRatio}`;
      if (ratioStatusEl) {
        const isEquilibrium = (nVal / pVal >= 2.0 && nVal / pVal <= 4.5 && kVal / pVal >= 1.0 && kVal / pVal <= 3.0);
        ratioStatusEl.className = isEquilibrium ? 'sensor-status-badge optimal' : 'sensor-status-badge high';
        ratioStatusEl.textContent = isEquilibrium ? (isTa ? 'சமநிலை' : 'Equilibrium') : (isTa ? 'மாறுபட்டது' : 'Imbalance');
      }
      if (ratioNoteEl) ratioNoteEl.textContent = isTa ? 'நேரலை ஆய்வு' : 'Active Probe';
    } else if (nVal !== null && pVal !== null && kVal !== null) {
      ratioValEl.textContent = `${nVal} : ${pVal} : ${kVal}`;
      if (ratioStatusEl) {
        ratioStatusEl.className = 'sensor-status-badge deficient';
        ratioStatusEl.textContent = 'Zero P';
      }
    } else {
      ratioValEl.textContent = '— : — : —';
    }
  }

  // ── 2. Update Supplementary Environmental Tiles ──
  const wrap = document.getElementById('sensor-extra-readings');
  if (!wrap) return;

  const hasAnyEnvField = ['air_temperature', 'soil_moisture', 'tds', 'conductivity', 'light', 'is_reliable', 'ph']
    .some(k => soil[k] !== undefined && soil[k] !== null);
  wrap.style.display = hasAnyEnvField ? 'grid' : 'none';

  const predictBanner = document.getElementById('sensor-predict-banner');
  if (predictBanner && soilDataMode === 'live') predictBanner.style.display = 'block';

  if (!hasAnyEnvField) return;

  const tempEl = document.getElementById('sensor-temp-val');
  const moistEl = document.getElementById('sensor-soil-moisture-val');
  const phEl = document.getElementById('sensor-ph-val');
  const phStatusEl = document.getElementById('sensor-ph-status');
  const lightEl = document.getElementById('sensor-light-val');
  const tdsEl = document.getElementById('sensor-tds-val');
  const tdsStatusEl = document.getElementById('sensor-tds-status');
  const reliableEl = document.getElementById('sensor-reliable-val');
  const reliableSub = document.getElementById('sensor-reliable-sub');
  const dryWarning = document.getElementById('sensor-dry-warning');

  const curTemp = (soil.air_temperature !== undefined && soil.air_temperature !== null) ? soil.air_temperature : soil.temperature;
  const curMoist = (soil.soil_moisture !== undefined && soil.soil_moisture !== null) ? soil.soil_moisture : soil.moisture;
  if (tempEl) tempEl.textContent = (curTemp !== undefined && curTemp !== null) ? `${Number(curTemp).toFixed(1)} °C` : '— °C';
  if (moistEl) moistEl.textContent = (curMoist !== undefined && curMoist !== null) ? `${Number(curMoist).toFixed(0)} %` : '— %';
  if (lightEl) lightEl.textContent = (soil.light !== undefined && soil.light !== null) ? `${soil.light.toFixed(0)} %` : '— %';

  // Live pH calculation & status classification
  const rawPh = (soil.ph !== undefined && soil.ph !== null) ? soil.ph : soil.pH;
  if (phEl) {
    if (rawPh !== undefined && rawPh !== null && !isNaN(Number(rawPh))) {
      const phVal = Number(rawPh);
      phEl.textContent = phVal.toFixed(1);
      if (phStatusEl) {
        if (soil.soil_moisture !== undefined && Number(soil.soil_moisture) <= 0) {
          phStatusEl.textContent = '⚠️ Probe dry · Uncalibrated';
          phStatusEl.style.color = '#f59e0b';
        } else if (phVal < 5.5) {
          phStatusEl.textContent = '🔴 Strong Acid (<5.5)';
          phStatusEl.style.color = '#ef4444';
        } else if (phVal < 6.0) {
          phStatusEl.textContent = '🟡 Moderate Acid (5.5–6.0)';
          phStatusEl.style.color = '#f59e0b';
        } else if (phVal <= 7.5) {
          phStatusEl.textContent = '🟢 Optimal (6.0–7.5)';
          phStatusEl.style.color = '#10b981';
        } else if (phVal <= 8.5) {
          phStatusEl.textContent = '🟡 Alkaline (7.5–8.5)';
          phStatusEl.style.color = '#f59e0b';
        } else {
          phStatusEl.textContent = '🔴 High Alkaline (>8.5)';
          phStatusEl.style.color = '#ef4444';
        }
      }
    } else {
      phEl.textContent = '—';
      if (phStatusEl) {
        phStatusEl.textContent = 'ideal: 6.0–7.5';
        phStatusEl.style.color = 'var(--text-muted)';
      }
    }
  }

  // Reliability & Moisture check
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  const isReliable = soil.is_reliable !== undefined ? soil.is_reliable : (soil.soil_moisture > 5);
  if (reliableEl) {
    if (isReliable) {
      reliableEl.textContent = isTa ? '🟢 நம்பகமானது' : '🟢 Reliable';
      reliableEl.style.color = '#10b981';
      if (reliableSub) reliableSub.textContent = isTa ? 'உகந்த ஆய்வு ஈரப்பதம்' : 'Optimal probe moisture';
      if (dryWarning) dryWarning.style.display = 'none';
    } else {
      reliableEl.textContent = isTa ? '⚠️ நம்பகமற்றது' : '⚠️ Unreliable';
      reliableEl.style.color = '#f59e0b';
      if (reliableSub) reliableSub.textContent = isTa ? 'மண் மிக வறண்டுள்ளது' : (soil.reliability_note || 'Soil too dry for probe');
      if (dryWarning) dryWarning.style.display = 'block';
    }
  }

  const rawTds = (soil.tds !== undefined && soil.tds !== null)
    ? Number(soil.tds)
    : ((soil.conductivity !== undefined && soil.conductivity !== null) ? Number(soil.conductivity) * 0.5 : null);

  if (tdsEl) {
    if (rawTds !== null && !isNaN(rawTds)) {
      const roundedTds = Math.round(rawTds);
      tdsEl.textContent = `${roundedTds} ppm`;
      if (tdsStatusEl) {
        if (roundedTds < 300) {
          tdsStatusEl.textContent = isTa ? '🟢 குறைவு · உகந்தது: 300–700 ppm' : '🟢 Low · ideal: 300–700 ppm';
          tdsStatusEl.style.color = 'var(--text-muted)';
        } else if (roundedTds <= 700) {
          tdsStatusEl.textContent = isTa ? '🟢 உகந்தது (300–700 ppm)' : '🟢 Optimal (300–700 ppm)';
          tdsStatusEl.style.color = '#10b981';
        } else if (roundedTds <= 1200) {
          tdsStatusEl.textContent = isTa ? '🟡 மிதமான உப்புத்தன்மை' : '🟡 Moderate salinity';
          tdsStatusEl.style.color = '#f59e0b';
        } else {
          tdsStatusEl.textContent = isTa ? '🔴 அதிக உப்புத்தன்மை அழுத்தம்' : '🔴 High salinity stress';
          tdsStatusEl.style.color = '#ef4444';
        }
      }
    } else {
      tdsEl.textContent = '— ppm';
      if (tdsStatusEl) {
        tdsStatusEl.textContent = isTa ? 'உகந்தது: 300–700 ppm' : 'ideal: 300–700 ppm';
        tdsStatusEl.style.color = 'var(--text-muted)';
      }
    }
  }
}

// ── Instant Crop Prediction from Sensor Readings ───────────────
async function predictCropsFromSensor() {
  const btn = document.getElementById('btn-predict-sensor');
  const out = document.getElementById('sensor-predictions-output');
  if (!btn || !out) return;

  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  btn.disabled = true;
  btn.textContent = isTa ? '⏳ பொருத்தத்தைக் கணக்கிடுகிறது…' : '⏳ Calculating Suitability…';
  out.style.display = 'block';
  out.innerHTML = `<div class="loading-wrap" style="padding:16px"><div class="spinner"></div><span style="font-size:13px;color:var(--text-secondary)">${isTa ? 'சென்சார் அளவீடுகளிலிருந்து உகந்த பயிர்களைக் கணிக்கிறது...' : 'Predicting optimal crops from sensor parameters...'}</span></div>`;

  try {
    const data = await apiGet(`/soil-sensor/predict?farm_id=${state.farm_id}`);
    const top = data.predictions?.[0];

    const topName = top ? (window.tCrop ? tCrop(top.crop) : top.crop) : 'None';
    const topScore = top ? top.final_score : 0;
    const scoreColor = topScore >= 80 ? '#22c55e' : topScore >= 65 ? '#f59e0b' : '#ef4444';
    const famDisplay = isTa ? (window.t ? t((top?.crop_family || 'Legume').toLowerCase(), top?.crop_family || 'Legume') : (top?.crop_family || 'Legume')) : (top?.crop_family || 'Legume');

    let html = `
      <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px;margin-bottom:12px">
        <div class="flex items-center justify-between gap-12" style="flex-wrap:wrap">
          <div class="flex items-center gap-12">
            <span style="font-size:32px">${cropIcon(top?.crop)}</span>
            <div>
              <div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--green-400)">${isTa ? '🥇 சென்சார் பரிந்துரைக்கும் முதன்மைப் பயிர்' : '🥇 #1 Recommended Crop from Sensor'}</div>
              <div style="font-size:20px;font-weight:700;color:var(--text-primary)">${topName} (${famDisplay})</div>
              <div style="font-size:12px;color:var(--text-secondary)">${isTa ? 'எதிர்பார்க்கப்படும் மகசூல்' : 'Est. Yield'}: ${top?.predicted_yield || 0} ${isTa ? 'கிலோ/ஏக்கர்' : 'kg/acre'} · ${isTa ? 'லாபம்' : 'Est. Profit'}: ₹${(top?.predicted_profit || 0).toLocaleString('en-IN')} / ${isTa ? 'ஏக்கர்' : 'acre'}</div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:28px;font-weight:800;color:${scoreColor}">${topScore} <span style="font-size:14px;color:var(--text-muted)">/100</span></div>
            <div style="font-size:11px;color:var(--text-muted)">${isTa ? 'பொருத்த மதிப்பெண்' : 'Suitability Score'}</div>
          </div>
        </div>
      </div>

      <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--text-secondary)">${isTa ? 'இந்த சென்சார் நிலைக்கு ஏற்ற மாற்றுப் பயிர்கள்:' : 'Top Alternative Crops Predicted for this Sensor Profile:'}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:14px">
    `;

    data.predictions.slice(1, 5).forEach(c => {
      const cName = window.tCrop ? tCrop(c.crop) : c.crop;
      const wText = isTa
        ? (c.water_requirement === 'Low' ? 'குறைந்த நீர்' : c.water_requirement === 'Medium' ? 'மிதமான நீர்' : 'அதிக நீர்')
        : `${c.water_requirement} Water`;
      html += `
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;display:flex;align-items:center;justify-content:space-between">
          <div class="flex items-center gap-8">
            <span style="font-size:20px">${cropIcon(c.crop)}</span>
            <div>
              <div style="font-weight:600;font-size:13px">${cName}</div>
              <div style="font-size:11px;color:var(--text-muted)">${wText}</div>
            </div>
          </div>
          <span style="font-weight:700;color:var(--green-400);font-size:14px">${c.final_score}</span>
        </div>
      `;
    });

    html += `
      </div>
      <div class="flex items-center gap-12" style="justify-content:flex-end">
        <button type="button" class="btn btn-secondary" onclick="navigate('evaluation')" style="font-size:12px;padding:6px 14px">
          ${isTa ? 'முழு பயிர் மதிப்பீட்டு பட்டியலைக் காண்க →' : 'View Full Evaluation Leaderboard →'}
        </button>
        <button type="button" class="btn btn-primary" onclick="navigate('rotation')" style="font-size:12px;padding:6px 14px">
          ${isTa ? 'பயிர் சுழற்சி திட்டத்தை உருவாக்கு →' : 'Generate Multi-Season Crop Rotation →'}
        </button>
      </div>
    `;

    out.innerHTML = html;
  } catch(err) {
    out.innerHTML = `<div class="alert-banner warning">⚠️ ${err.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>⚡</span> ${isTa ? 'சென்சார் கணிப்பை புதுப்பி' : 'Refresh Sensor Prediction'}`;
  }
}
window.predictCropsFromSensor = predictCropsFromSensor;

function setSlider(sliderId, value, valId, formatter) {
  const slider = document.getElementById(sliderId);
  const valEl  = document.getElementById(valId);
  if (!slider || !valEl) return;
  slider.value = value;
  valEl.textContent = formatter ? formatter(value) : value;
}

// Wire up slider live updates
document.addEventListener('DOMContentLoaded', () => {
  const sliders = [
    { id: 'n-slider',  out: 'n-val',  fmt: v => v },
    { id: 'p-slider',  out: 'p-val',  fmt: v => v },
    { id: 'k-slider',  out: 'k-val',  fmt: v => v },
    { id: 'ph-slider', out: 'ph-val', fmt: v => (v/10).toFixed(1) },
    { id: 'oc-slider', out: 'oc-val', fmt: v => (v/100).toFixed(2) },
  ];
  sliders.forEach(({ id, out, fmt }) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      document.getElementById(out).textContent = fmt(el.value);
    });
  });

  // Form submit
  const form = document.getElementById('soil-form');
  if (form) form.addEventListener('submit', handleSoilSubmit);
});

async function handleSoilSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('soil-submit-btn');
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  btn.disabled = true;
  btn.textContent = isTa ? '⏳ பகுப்பாய்வு செய்கிறது…' : '⏳ Analysing…';

  const nitrogen       = parseFloat(document.getElementById('n-slider').value);
  const phosphorus     = parseFloat(document.getElementById('p-slider').value);
  const potassium      = parseFloat(document.getElementById('k-slider').value);
  const ph             = parseFloat(document.getElementById('ph-slider').value) / 10;
  const organic_carbon = parseFloat(document.getElementById('oc-slider').value) / 100;

  try {
    const result = await apiPost('/soil-analysis', {
      farm_id: state.farm_id,
      nitrogen, phosphorus, potassium, ph, organic_carbon,
    });
    state.soilData = result;
    renderSoilResult(result);
  } catch(err) {
    document.getElementById('soil-result').innerHTML =
      `<div class="alert-banner warning">⚠️ ${err.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = isTa ? '🔬 மண் பகுப்பாய்வு செய்' : '🔬 Analyse Soil';
  }
}

function renderSoilResult(result) {
  const container = document.getElementById('soil-result');
  container.style.display = '';

  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');

  const scoreColor = result.soil_health_score >= 70 ? 'var(--green-400)'
                   : result.soil_health_score >= 50 ? 'var(--amber-400)'
                   : 'var(--red-400)';

  const ringColor = result.soil_health_score >= 70 ? '#22c55e'
                  : result.soil_health_score >= 50 ? '#f59e0b'
                  : '#ef4444';

  container.innerHTML = `
    <div class="glass-card mt-24" id="soil-result-card">
      <div class="flex items-center justify-between mb-16" style="flex-wrap:wrap;gap:16px">
        <div>
          <div class="card-label">${isTa ? 'மண் வள பகுப்பாய்வு முடிவு' : 'Soil Health Analysis Result'}</div>
          <div style="font-family:'Outfit',sans-serif;font-size:32px;font-weight:800;color:${scoreColor}">
            ${isTa ? 'மதிப்பீடு' : 'Score'}: ${result.soil_health_score} / 100
          </div>
        </div>
        <div class="score-ring" id="soil-ring" style="width:90px;height:90px">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle class="ring-bg"   cx="45" cy="45" r="38"/>
            <circle class="ring-fill" cx="45" cy="45" r="38"
              style="stroke-dasharray:${2*Math.PI*38};stroke-dashoffset:${2*Math.PI*38};stroke:${ringColor}"/>
          </svg>
          <div class="ring-value" style="color:${scoreColor}">0</div>
        </div>
      </div>

      ${result.deficiencies.length ? `
        <div class="mb-16">
          <div class="card-label">${isTa ? 'கண்டறியப்பட்ட சத்து குறைபாடுகள்' : 'Deficiencies Detected'}</div>
          <div class="chips-wrap">${result.deficiencies.map(d => chipDanger(window.tAlert ? tAlert(d) : d)).join('')}</div>
        </div>` : ''}

      ${result.adequate.length ? `
        <div>
          <div class="card-label">${isTa ? 'போதுமான சத்துக்கள்' : 'Adequate Nutrients'}</div>
          <div class="chips-wrap">${result.adequate.map(a => chipSuccess(window.tAlert ? tAlert(a) : a)).join('')}</div>
        </div>` : ''}

      ${result.deficiencies.length ? `
        <div class="alert-banner warning mt-16" style="margin-top:16px">
          <span>⚠</span>
          <div>${isTa ? `<b>செயல் தேவை:</b> ${result.deficiencies.length} ஊட்டச்சத்து குறைபாடுகள் கண்டறியப்பட்டுள்ளன. அடுத்த பயிர் சாகுபடிக்கு முன் இயற்கை அல்லது பரிந்துரைக்கப்பட்ட உரமிடுதல் அவசியம்.` : `<b>Action Required:</b> ${result.deficiencies.length} deficiencie(s) detected. Consider soil amendments before next crop cycle.`}</div>
        </div>` : `
        <div class="alert-banner success mt-16" style="margin-top:16px">
          <span>✓</span>
          <div>${isTa ? '<b>சிறந்த மண் வளம்!</b> உங்கள் நிலம் நல்ல சமநிலையில் உள்ளது, பயிர் சாகுபடிக்கு உகந்தது.' : '<b>Excellent Soil Health!</b> Your farm is well-balanced and ready for optimal planting.'}</div>
        </div>`}
    </div>`;

  // Animate ring
  setTimeout(() => {
    const ring = document.getElementById('soil-ring');
    if (ring) {
      const fill  = ring.querySelector('.ring-fill');
      const label = ring.querySelector('.ring-value');
      const r = 38;
      const circ = 2 * Math.PI * r;
      fill.style.strokeDasharray  = circ;
      fill.style.strokeDashoffset = circ;
      fill.style.stroke = ringColor;
      let cur = 0;
      const target = result.soil_health_score;
      const step   = target / 60;
      const timer  = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(timer); }
        label.textContent = Math.round(cur);
        fill.style.strokeDashoffset = circ - (cur / 100) * circ;
      }, 16);
    }
  }, 80);

  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Direct Sensor Ingest & Auto-Streaming Controller ─────────────
let sensorAutoStreamTimer = null;

function toggleSensorFormVisibility() {
  const panel = document.getElementById('sensor-direct-stream-panel');
  if (!panel) return;
  const isHidden = (panel.style.display === 'none' || !panel.style.display);
  panel.style.display = isHidden ? 'block' : 'none';
  if (isHidden) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
window.toggleSensorFormVisibility = toggleSensorFormVisibility;

function applySensorPreset(preset) {
  const nInput = document.getElementById('direct-n-input');
  const pInput = document.getElementById('direct-p-input');
  const kInput = document.getElementById('direct-k-input');
  const phInput = document.getElementById('direct-ph-input');
  const moistInput = document.getElementById('direct-moisture-input');
  const tempInput = document.getElementById('direct-temp-input');
  const tdsInput = document.getElementById('direct-tds-input');
  const lightInput = document.getElementById('direct-light-input');

  const presets = {
    optimal: { n: 125, p: 45, k: 90, ph: 6.8, moist: 34, temp: 28.5, tds: 480, light: 82 },
    low_n:   { n: 38,  p: 42, k: 85, ph: 6.5, moist: 28, temp: 29.0, tds: 420, light: 80 },
    acidic:  { n: 65,  p: 20, k: 50, ph: 5.2, moist: 22, temp: 30.0, tds: 310, light: 85 },
    saline:  { n: 95,  p: 18, k: 110, ph: 8.2, moist: 35, temp: 31.0, tds: 920, light: 88 },
    dry:     { n: 0,   p: 0,  k: 0,  ph: 4.0, moist: 0,  temp: 32.5, tds: 0,   light: 95 }
  };

  const p = presets[preset] || presets.optimal;
  if (nInput) nInput.value = p.n;
  if (pInput) pInput.value = p.p;
  if (kInput) kInput.value = p.k;
  if (phInput) phInput.value = p.ph;
  if (moistInput) moistInput.value = p.moist;
  if (tempInput) tempInput.value = p.temp;
  if (tdsInput) tdsInput.value = p.tds;
  if (lightInput) lightInput.value = p.light;

  // Auto-transmit on preset click for instant feedback
  submitDirectSensorData();
}
window.applySensorPreset = applySensorPreset;

function randomizeSensorNoise() {
  const nInput = document.getElementById('direct-n-input');
  const pInput = document.getElementById('direct-p-input');
  const kInput = document.getElementById('direct-k-input');
  const phInput = document.getElementById('direct-ph-input');
  const moistInput = document.getElementById('direct-moisture-input');
  const tempInput = document.getElementById('direct-temp-input');

  const jitter = (val, maxDelta, min = 0, max = 300) => {
    const delta = (Math.random() * maxDelta * 2) - maxDelta;
    return Math.max(min, Math.min(max, Math.round(val + delta)));
  };

  if (nInput) nInput.value = jitter(Number(nInput.value) || 115, 6, 0, 250);
  if (pInput) pInput.value = jitter(Number(pInput.value) || 42, 4, 0, 150);
  if (kInput) kInput.value = jitter(Number(kInput.value) || 88, 5, 0, 250);
  if (phInput) phInput.value = Math.max(4.0, Math.min(9.0, Number((Number(phInput.value || 6.7) + (Math.random() * 0.4 - 0.2)).toFixed(1))));
  if (moistInput) moistInput.value = jitter(Number(moistInput.value) || 34, 3, 0, 100);
  if (tempInput) tempInput.value = (Number(tempInput.value || 28.5) + (Math.random() * 0.6 - 0.3)).toFixed(1);

  submitDirectSensorData();
}
window.randomizeSensorNoise = randomizeSensorNoise;

async function handleDirectSensorSubmit(event) {
  if (event) event.preventDefault();
  await submitDirectSensorData();
}
window.handleDirectSensorSubmit = handleDirectSensorSubmit;

async function submitDirectSensorData() {
  const btn = document.getElementById('btn-push-direct-sensor');
  const feedback = document.getElementById('sensor-transmit-feedback');
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');

  const deviceId = document.getElementById('direct-device-id')?.value || 'Soil-Scout-01';
  const n = parseFloat(document.getElementById('direct-n-input')?.value || 100);
  const p = parseFloat(document.getElementById('direct-p-input')?.value || 40);
  const k = parseFloat(document.getElementById('direct-k-input')?.value || 80);
  const ph = parseFloat(document.getElementById('direct-ph-input')?.value || 6.8);
  const moisture = parseFloat(document.getElementById('direct-moisture-input')?.value || 30);
  const temperature = parseFloat(document.getElementById('direct-temp-input')?.value || 28.5);
  const tds = parseFloat(document.getElementById('direct-tds-input')?.value || 450);
  const light = parseFloat(document.getElementById('direct-light-input')?.value || 80);

  const payload = {
    farm_id: state.farm_id,
    device_id: deviceId,
    nitrogen: n,
    phosphorus: p,
    potassium: k,
    ph: ph,
    soil_moisture: moisture,
    air_temperature: temperature,
    tds: tds,
    light: light,
    reading_reliable: moisture > 5
  };

  try {
    if (btn) btn.disabled = true;
    if (feedback) feedback.textContent = isTa ? '📡 சென்சார் தரவு அனுப்பப்படுகிறது…' : '📡 Transmitting sensor payload…';

    const res = await apiPost('/soil-sensor/direct-feed', payload);

    if (res.success && res.reading) {
      // Ensure we switch to live mode UI display
      if (soilDataMode !== 'live') {
        setSoilDataMode('live');
      }

      // Prefill sliders & realtime NPK cards
      prefillSliders(res.reading);

      // Render soil analysis result card
      if (res.soil_health_score !== undefined) {
        state.soilData = {
          ...res.reading,
          soil_health_score: res.soil_health_score,
          deficiencies: res.deficiencies || [],
          adequate: res.adequate || []
        };
        renderSoilResult(state.soilData);
      }

      // Update dot & status
      const dot = document.getElementById('sensor-live-dot');
      const text = document.getElementById('sensor-live-status-text');
      if (dot) dot.className = 'sensor-live-dot connected';
      if (text) {
        text.textContent = isTa
          ? `🟢 நேரடி இணைப்பு · சாதனம் "${deviceId}" · இப்போதுதான் புதுப்பிக்கப்பட்டது`
          : `🟢 Live · device "${deviceId}" · updated just now (direct stream)`;
      }

      if (feedback) {
        feedback.textContent = isTa
          ? `✓ சென்சார் அளவீடு வெற்றிகரமாக உட்செலுத்தப்பட்டது (${n}N : ${p}P : ${k}K)`
          : `✓ Telemetry synced: ${n}N : ${p}P : ${k}K kg/ha (Score: ${res.soil_health_score || '—'})`;
        setTimeout(() => { if (feedback) feedback.textContent = ''; }, 4000);
      }
    }
  } catch (err) {
    if (feedback) {
      feedback.textContent = `❌ ${err.message}`;
      feedback.style.color = 'var(--red-400)';
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}
window.submitDirectSensorData = submitDirectSensorData;

function toggleSensorAutoStream() {
  const btn = document.getElementById('btn-toggle-stream');
  const icon = document.getElementById('stream-btn-icon');
  const text = document.getElementById('stream-btn-text');
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');

  if (sensorAutoStreamTimer) {
    clearInterval(sensorAutoStreamTimer);
    sensorAutoStreamTimer = null;
    if (btn) btn.classList.remove('active');
    if (icon) icon.textContent = '▶';
    if (text) text.textContent = isTa ? 'நேரலை தானியங்கி ஒளிபரப்பு' : 'Start Auto-Stream';
  } else {
    // If not in live mode, switch to live mode
    if (soilDataMode !== 'live') setSoilDataMode('live');

    // Run first immediately
    randomizeSensorNoise();

    sensorAutoStreamTimer = setInterval(() => {
      const viewActive = document.getElementById('view-soil-analysis')?.classList.contains('active');
      if (!viewActive) {
        toggleSensorAutoStream(); // Stop if user leaves view
        return;
      }
      randomizeSensorNoise();
    }, 4500);

    if (btn) btn.classList.add('active');
    if (icon) icon.textContent = '⏹';
    if (text) text.textContent = isTa ? 'ஒளிபரப்பு இயங்குகிறது (நிறுத்து)' : 'Streaming Live (Stop)';
  }
}
window.toggleSensorAutoStream = toggleSensorAutoStream;


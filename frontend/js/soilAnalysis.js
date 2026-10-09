// ============================================================
//  soilAnalysis.js — Soil Analysis view
// ============================================================

let soilDataMode = 'live'; // Defaults to 'live' so physical hardware view is immediate
try {
  const saved = localStorage.getItem('soilDataMode');
  if (saved) soilDataMode = saved;
} catch(_) {}

let sensorPollTimer = null;
const SENSOR_POLL_MS = 4000;

function resetSlidersToDefault() {
  setSlider('n-slider', 0, 'n-val');
  setSlider('p-slider', 0, 'p-val');
  setSlider('k-slider', 0, 'k-val');
  setSlider('ph-slider', 70, 'ph-val', v => (v/10).toFixed(1));
  setSlider('oc-slider', 50, 'oc-val', v => (v/100).toFixed(2));
}
window.resetSlidersToDefault = resetSlidersToDefault;

VIEW_LOADERS['soil-analysis'] = async function loadSoilAnalysis() {
  let savedMode = 'live';
  try {
    savedMode = localStorage.getItem('soilDataMode') || 'live';
  } catch(_) {}
  setSoilDataMode(savedMode);

  if (savedMode === 'live') {
    // In live mode, poll genuine hardware; sliders stay locked/cleared until live packet arrives
    await pollSensorOnce();
  } else {
    // Only pre-fill manual sliders from a REAL PRIOR MANUAL entry, never from ESP32 or lab demo
    try {
      const soil = await apiGet(`/soil-analysis?farm_id=${state.farm_id}&source=manual`);
      if (soil && soil.source === 'manual') {
        prefillSliders(soil);
      } else {
        resetSlidersToDefault();
      }
    } catch(_) {
      resetSlidersToDefault();
    }
  }
};

// ── Manual / Live (ESP32 / Soil Scout) mode switcher ─────────────────────
function setSoilDataMode(mode) {
  soilDataMode = mode;
  try { localStorage.setItem('soilDataMode', mode); } catch(_) {}

  const manualBtn = document.getElementById('soil-mode-btn-manual');
  const liveBtn = document.getElementById('soil-mode-btn-live');
  const banner = document.getElementById('sensor-live-banner');
  const predictBanner = document.getElementById('sensor-predict-banner');
  const npkGrid = document.getElementById('sensor-npk-live-grid');
  const sliderIds = ['n-slider', 'p-slider', 'k-slider', 'ph-slider', 'oc-slider'];

  if (mode === 'live') {
    manualBtn?.classList.remove('active');
    liveBtn?.classList.add('active');
    if (banner) banner.style.display = 'flex';
    if (predictBanner) predictBanner.style.display = 'block';
    if (npkGrid) npkGrid.style.display = 'grid';
    sliderIds.forEach(id => { const el = document.getElementById(id); if (el) el.disabled = true; });

    // Instantly clear live telemetry cards until verified live packet arrives
    clearLiveSensorReadings();
    startSensorPolling();
  } else {
    liveBtn?.classList.remove('active');
    manualBtn?.classList.add('active');
    if (banner) banner.style.display = 'none';
    if (predictBanner) predictBanner.style.display = 'none';
    if (npkGrid) npkGrid.style.display = 'none';
    const extraTiles = document.getElementById('sensor-extra-readings');
    if (extraTiles) extraTiles.style.display = 'none';
    const soilResult = document.getElementById('soil-result');
    if (soilResult) soilResult.style.display = 'none';
    sliderIds.forEach(id => { const el = document.getElementById(id); if (el) el.disabled = false; });
    stopSensorPolling();
  }
}
window.setSoilDataMode = setSoilDataMode;

function stopSensorPolling() {
  if (sensorPollTimer) { clearInterval(sensorPollTimer); sensorPollTimer = null; }
}
window.stopSensorPolling = stopSensorPolling;

function startSensorPolling() {
  stopSensorPolling();
  pollSensorOnce(); // immediate check
  sensorPollTimer = setInterval(() => {
    const viewActive = document.getElementById('view-soil-analysis')?.classList.contains('active');
    if (!viewActive || soilDataMode !== 'live') { stopSensorPolling(); return; }
    pollSensorOnce();
  }, SENSOR_POLL_MS);
}

function clearLiveSensorReadings() {
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');

  // Nitrogen (N)
  const nEl = document.getElementById('sensor-n-val');
  const nStatusEl = document.getElementById('sensor-n-status');
  const nBarEl = document.getElementById('sensor-n-bar');
  const nPpmEl = document.getElementById('sensor-n-ppm');
  if (nEl) nEl.textContent = '—';
  if (nStatusEl) {
    nStatusEl.className = 'sensor-status-badge offline';
    nStatusEl.textContent = isTa ? 'சாதனம் ஆஃப்' : 'Device OFF';
  }
  if (nBarEl) nBarEl.style.width = '0%';
  if (nPpmEl) nPpmEl.textContent = '— mg/kg';

  // Phosphorus (P)
  const pEl = document.getElementById('sensor-p-val');
  const pStatusEl = document.getElementById('sensor-p-status');
  const pBarEl = document.getElementById('sensor-p-bar');
  const pPpmEl = document.getElementById('sensor-p-ppm');
  if (pEl) pEl.textContent = '—';
  if (pStatusEl) {
    pStatusEl.className = 'sensor-status-badge offline';
    pStatusEl.textContent = isTa ? 'சாதனம் ஆஃப்' : 'Device OFF';
  }
  if (pBarEl) pBarEl.style.width = '0%';
  if (pPpmEl) pPpmEl.textContent = '— mg/kg';

  // Potassium (K)
  const kEl = document.getElementById('sensor-k-val');
  const kStatusEl = document.getElementById('sensor-k-status');
  const kBarEl = document.getElementById('sensor-k-bar');
  const kPpmEl = document.getElementById('sensor-k-ppm');
  if (kEl) kEl.textContent = '—';
  if (kStatusEl) {
    kStatusEl.className = 'sensor-status-badge offline';
    kStatusEl.textContent = isTa ? 'சாதனம் ஆஃப்' : 'Device OFF';
  }
  if (kBarEl) kBarEl.style.width = '0%';
  if (kPpmEl) kPpmEl.textContent = '— mg/kg';

  // N:P:K Ratio
  const ratioValEl = document.getElementById('sensor-ratio-val');
  const ratioStatusEl = document.getElementById('sensor-ratio-status');
  const ratioNoteEl = document.getElementById('sensor-ratio-note');
  if (ratioValEl) ratioValEl.textContent = '— : — : —';
  if (ratioStatusEl) {
    ratioStatusEl.className = 'sensor-status-badge offline';
    ratioStatusEl.textContent = isTa ? 'ஆஃப்லைன்' : 'Offline';
  }
  if (ratioNoteEl) ratioNoteEl.textContent = isTa ? 'சிக்னல் இல்லை' : 'No Signal';

  // Environmental telemetry tiles
  const tempEl = document.getElementById('sensor-temp-val');
  const moistEl = document.getElementById('sensor-soil-moisture-val');
  const phEl = document.getElementById('sensor-ph-val');
  const phStatusEl = document.getElementById('sensor-ph-status');
  const lightEl = document.getElementById('sensor-light-val');
  const tdsEl = document.getElementById('sensor-tds-val');
  const tdsStatusEl = document.getElementById('sensor-tds-status');
  const reliableEl = document.getElementById('sensor-reliable-val');
  const reliableSub = document.getElementById('sensor-reliable-sub');

  if (tempEl) tempEl.textContent = '— °C';
  if (moistEl) moistEl.textContent = '— %';
  if (phEl) phEl.textContent = '—';
  if (phStatusEl) {
    phStatusEl.textContent = isTa ? 'சாதனம் ஆஃப்' : 'Device OFF';
    phStatusEl.style.color = 'var(--text-muted)';
  }
  if (lightEl) lightEl.textContent = '— %';
  if (tdsEl) tdsEl.textContent = '— ppm';
  if (tdsStatusEl) {
    tdsStatusEl.textContent = isTa ? 'ஆஃப்லைன்' : 'Offline';
    tdsStatusEl.style.color = 'var(--text-muted)';
  }
  if (reliableEl) {
    reliableEl.textContent = isTa ? '🔴 ஆஃப்லைன்' : '🔴 Offline';
    reliableEl.style.color = '#ef4444';
  }
  if (reliableSub) {
    reliableSub.textContent = isTa ? 'சென்சார் சாதனம் அணைக்கப்பட்டுள்ளது' : 'Device is powered off';
  }

  // Reset sliders so offline live mode never displays old/stale numbers
  if (soilDataMode === 'live') {
    resetSlidersToDefault();
  }

  // Clear soil analysis results card if visible in live mode so no fake data is displayed
  const soilResult = document.getElementById('soil-result');
  if (soilResult && soilDataMode === 'live') {
    soilResult.innerHTML = `
      <div class="glass-card mt-24 p-24" style="text-align:center;border:1px dashed rgba(239, 68, 68, 0.4);background:rgba(239, 68, 68, 0.04)">
        <div style="font-size:32px;margin-bottom:8px">🔌</div>
        <div style="font-size:18px;font-weight:700;color:var(--red-400);margin-bottom:6px">
          ${isTa ? 'சென்சார் சாதனம் தற்போது ஆஃப் (OFF) செய்யப்பட்டுள்ளது' : 'Real Hardware Sensor is Currently OFF'}
        </div>
        <div style="color:var(--text-muted);font-size:14px;max-width:540px;margin:0 auto">
          ${isTa ? 'நேரலை மண் பகுப்பாய்வை பெற உங்கள் ESP32 / Soil Scout சாதனத்தை இயக்கவும். சாதனம் ஆன் செய்யப்பட்டவுடன் உண்மையான நேரலை அளவீடுகள் தானாகவே காட்டப்படும்.' : 'Real-time telemetry and analysis will automatically activate once your physical ESP32 / Soil Scout probe is powered ON and begins transmitting.'}
        </div>
      </div>
    `;
    soilResult.style.display = 'block';
  }
}
window.clearLiveSensorReadings = clearLiveSensorReadings;

async function pollSensorOnce() {
  const dot = document.getElementById('sensor-live-dot');
  const text = document.getElementById('sensor-live-status-text');
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  try {
    const data = await apiGet(`/soil-sensor/latest?farm_id=${state.farm_id}`);
    
    // Strict Hardware Check: ONLY show Live / ON if hardware is actively transmitting within 15s
    if (data.connected && data.reading) {
      if (dot) dot.className = 'sensor-live-dot connected';
      if (text) {
        text.textContent = isTa
          ? `🟢 சாதனம் ஆன் செய்யப்பட்டுள்ளது · சாதனம் "${data.device_id}" · நேரலை சமிக்ஞை (${data.seconds_ago} வினாடிகளுக்கு முன்)`
          : `🟢 Device is ON · "${data.device_id}" transmitting realtime telemetry (${data.seconds_ago}s ago)`;
      }
      prefillSliders(data.reading);
    } else {
      // Physical hardware is OFF / disconnected
      if (dot) dot.className = 'sensor-live-dot offline';
      if (text) {
        const devName = data.device_id || 'Soil-Scout-01';
        text.textContent = isTa
          ? `🔴 சாதனம் ஆஃப் (OFF) செய்யப்பட்டுள்ளது · சாதனம் "${devName}" ஆஃப்லைனில் உள்ளது. நேரலை தரவுகளுக்கு சாதனத்தை ஆன் செய்யவும்.`
          : `🔴 Device is OFF / Disconnected · "${devName}" is offline. Power ON physical sensor to view realtime telemetry.`;
      }
      clearLiveSensorReadings();
    }
  } catch (err) {
    if (dot) dot.className = 'sensor-live-dot error';
    if (text) {
      text.textContent = isTa
        ? `⚠️ சென்சார் சேவையகத்தை அணுக முடியவில்லை: ${err.message}`
        : `⚠ Could not reach sensor status endpoint: ${err.message}`;
    }
    clearLiveSensorReadings();
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
    const latestCheck = await apiGet(`/soil-sensor/latest?farm_id=${state.farm_id}`).catch(() => ({ connected: false }));
    if (!latestCheck.connected) {
      out.innerHTML = `
        <div class="alert-banner warning" style="margin-top:12px">
          <span>🔌</span>
          <div>
            <b>${isTa ? 'சென்சார் சாதனம் தற்போது ஆஃப் செய்யப்பட்டுள்ளது' : 'Real Hardware Sensor is Currently OFF'}</b><br/>
            ${isTa ? 'நேரலைத் தரவுகளில் இருந்து பயிர் கணிப்பை பெற உங்கள் ESP32 சென்சாரை இயக்கவும்.' : 'Please power ON your ESP32 / Soil Scout probe to generate recommendations from real-time live telemetry.'}
          </div>
        </div>`;
      return;
    }

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

  let liveCheck = null;
  if (soilDataMode === 'live') {
    // Strict Hardware Check: live analysis requires an actively connected sensor
    try {
      liveCheck = await apiGet(`/soil-sensor/latest?farm_id=${state.farm_id}`);
      if (!liveCheck.connected || !liveCheck.reading) {
        document.getElementById('soil-result').innerHTML = `
          <div class="alert-banner warning mt-24">
            <span>🔌</span>
            <div>
              <b>${isTa ? 'சென்சார் சாதனம் தற்போது ஆஃப் செய்யப்பட்டுள்ளது!' : 'Sensor Hardware is Currently OFF!'}</b><br/>
              ${isTa ? 'நேரலை பகுப்பாய்வை இயக்க சென்சாரை ஆன் செய்து தரவு அனுப்ப வேண்டும். சாதனம் ஆன் செய்யப்பட்டவுடன் மட்டுமே பகுப்பாய்வு கணக்கிடப்படும்.' : 'Real-time soil analysis requires your physical sensor hardware to be powered ON and actively transmitting. Please power on your ESP32 / Soil Scout device.'}
            </div>
          </div>
        `;
        document.getElementById('soil-result').style.display = 'block';
        return;
      }
    } catch (_) {}
  }

  btn.disabled = true;
  btn.textContent = isTa ? '⏳ பகுப்பாய்வு செய்கிறது…' : '⏳ Analysing…';

  const r = liveCheck?.reading;
  const nitrogen       = (soilDataMode === 'live' && r?.nitrogen !== undefined) ? Number(r.nitrogen) : parseFloat(document.getElementById('n-slider').value);
  const phosphorus     = (soilDataMode === 'live' && r?.phosphorus !== undefined) ? Number(r.phosphorus) : parseFloat(document.getElementById('p-slider').value);
  const potassium      = (soilDataMode === 'live' && r?.potassium !== undefined) ? Number(r.potassium) : parseFloat(document.getElementById('k-slider').value);
  const ph             = (soilDataMode === 'live' && r?.ph !== undefined) ? Number(r.ph) : parseFloat(document.getElementById('ph-slider').value) / 10;
  const organic_carbon = (soilDataMode === 'live' && r?.organic_carbon !== undefined) ? Number(r.organic_carbon) : parseFloat(document.getElementById('oc-slider').value) / 100;

  try {
    const result = await apiPost('/soil-analysis', {
      farm_id: state.farm_id,
      nitrogen, phosphorus, potassium, ph, organic_carbon,
      source: soilDataMode === 'live' ? 'esp32' : 'manual'
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

      <div class="mt-20 flex items-center gap-12" style="flex-wrap:wrap">
        <button type="button" class="btn btn-primary" onclick="exportFarmerReportPDF()">
          <span>📄</span> <span>${isTa ? 'மண் வள திட்ட அறிக்கையைப் பதிவிறக்கு (PDF)' : 'Download Soil Action Plan Report (PDF)'}</span>
        </button>
        <button type="button" class="btn btn-secondary" onclick="navigate('crop-history')">
          <span>${isTa ? 'அடுத்தது: பயிர் வரலாறு →' : 'Next: Crop History →'}</span>
        </button>
      </div>
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




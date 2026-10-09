// ============================================================
//  dashboard.js — Dashboard view
// ============================================================

let recoveryChart = null;
let profitChart   = null;

VIEW_LOADERS['dashboard'] = async function loadDashboard() {
  const loadingEl = document.getElementById('dash-loading');
  const contentEl = document.getElementById('dash-content');

  if (loadingEl) loadingEl.style.display = '';
  if (contentEl) contentEl.style.display = 'none';

  // Remove existing error banner if any
  const oldErr = document.getElementById('dash-error-banner');
  if (oldErr) oldErr.remove();

  try {
    const data = await apiGet(`/dashboard?farm_id=${state.farm_id}`);
    state.dashboard = data;
    renderDashboard(data);
  } catch (e) {
    console.error('Dashboard load error:', e);
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) {
      contentEl.style.display = '';
      const banner = document.createElement('div');
      banner.id = 'dash-error-banner';
      banner.className = 'alert-banner warning mb-16';
      banner.textContent = `⚠ Could not connect to API (${e.message}). Make sure the backend is running on port 3000.`;
      contentEl.prepend(banner);
    }
  }
};


function renderDashboard(d) {
  const errBanner = document.getElementById('dash-error-banner');
  if (errBanner) errBanner.remove();  // Farm info
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  // Tamil text exists only for the demo farm/farmer; anyone else's real name is shown as-is.
  document.getElementById('dash-farm-name').textContent   = (isTa && (d.farm.name.includes('Coimbatore') || d.farm.name.includes('Kovai'))) ? 'கோவை பண்ணை (தமிழ்நாடு)' : d.farm.name;
  document.getElementById('dash-farmer-name').textContent = (isTa && d.farm.farmer_name === 'Ramesh Kumar') ? 'ரமேஷ் குமார்' : d.farm.farmer_name;
  document.getElementById('dash-area').textContent        = isTa
    ? `${d.farm.area_acres} ஏக்கர் · ${d.farm.irrigation.includes('Drip') ? 'சொட்டு நீர் பாசனம்' : d.farm.irrigation}`
    : `${d.farm.area_acres} acres · ${d.farm.irrigation}`;

  // Update sidebar active farm chip
  const fcName = document.querySelector('.fc-name');
  if (fcName) fcName.textContent = (isTa && (d.farm.name.includes('Coimbatore') || d.farm.name.includes('Kovai'))) ? 'கோவை பண்ணை' : d.farm.name;
  const fcMeta = document.querySelector('.fc-meta');
  if (fcMeta) fcMeta.textContent = isTa ? `${d.farm.area_acres} ஏக்கர் · ${d.farm.irrigation}` : `${d.farm.area_acres} acres · ${d.farm.irrigation}`;

  // KPI cards. farm_health is null until the farm has had a real soil test —
  // show that honestly rather than a made-up score.
  const hasSoil = d.has_soil_data && d.farm_health !== null && d.farm_health !== undefined;
  const healthColor = !hasSoil ? 'var(--text-muted)'
                    : d.farm_health >= 70 ? 'var(--green-400)' : d.farm_health >= 50 ? 'var(--amber-400)' : 'var(--red-400)';
  const healthEl = document.getElementById('dash-health-val');
  healthEl.textContent = hasSoil ? d.farm_health : '—';
  healthEl.style.color = healthColor;

  // Score ring
  if (hasSoil) {
    animateRing(document.getElementById('dash-ring'), d.farm_health, healthColor);
  } else {
    const fill = document.querySelector('#dash-ring .ring-fill');
    if (fill) fill.style.strokeDashoffset = 2 * Math.PI * 40;
  }

  // Soil alerts
  const alertsEl = document.getElementById('dash-alerts');
  if (!hasSoil) {
    alertsEl.innerHTML = chipWarning(isTa ? 'இன்னும் மண் பரிசோதனை இல்லை' : 'No soil test yet');
  } else if (d.soil_alerts && d.soil_alerts.length) {
    alertsEl.innerHTML = d.soil_alerts.map(a => chipDanger(window.tAlert ? tAlert(a) : a)).join('');
  } else {
    alertsEl.innerHTML = chipSuccess(window.t ? t('optimalNutrients', 'All Nutrients Adequate') : 'All Nutrients Adequate');
  }

  // Recommended crop
  const cropName = d.recommended_crop?.name || (hasSoil ? 'Green Gram' : '—');
  document.getElementById('dash-rec-crop').textContent   = (cropName !== '—' && window.tCrop) ? tCrop(cropName) : cropName;
  document.getElementById('dash-rec-score').textContent  = d.recommended_crop?.score || '—';
  document.getElementById('dash-rec-icon').textContent   = cropName !== '—' ? cropIcon(cropName) : '🌱';
  const fam = d.recommended_crop?.family || (hasSoil ? 'Legume' : '—');
  document.getElementById('dash-rec-family').textContent = (fam !== '—' && isTa) ? (window.t ? t(fam.toLowerCase(), fam) : fam) : fam;

  // Profit
  document.getElementById('dash-profit').textContent      = d.expected_profit_per_acre ? `₹${(d.expected_profit_per_acre/1000).toFixed(1)}K` : '—';
  document.getElementById('dash-profit-3s').textContent   = d.projected_3_season_profit ? `₹${(d.projected_3_season_profit/1000).toFixed(0)}K` : '—';

  // ── Read Light from Sensor Table (instead of weather) ──
  const lightEl = document.getElementById('dash-sensor-light');
  const lightSub = document.getElementById('dash-sensor-light-sub');
  const sensorLight = (d.sensor_data && d.sensor_data.light !== undefined && d.sensor_data.light !== null)
    ? d.sensor_data.light
    : (d.light !== undefined && d.light !== null ? d.light : (d.soil_data?.light ?? null));

  if (lightEl) {
    const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
    if (sensorLight !== null && sensorLight !== undefined && !isNaN(Number(sensorLight))) {
      lightEl.textContent = `${Number(sensorLight).toFixed(0)}%`;
      lightEl.style.color = '#eab308';
      if (lightSub) lightSub.textContent = `${isTa ? 'நேரடி சென்சார்' : 'Live Probe'} (${d.sensor_data?.device_id || 'Soil Scout'})`;
    } else {
      lightEl.textContent = '— %';
      if (lightSub) lightSub.textContent = isTa ? 'சென்சார் அளவீட்டிற்காக காத்திருக்கிறது' : 'Awaiting sensor reading';
    }
  }

  // Soil NPK chips
  const soil = d.soil_data;
  const npkEl = document.getElementById('dash-npk');
  if (soil || d.sensor_data) {
    const isLive = Boolean(d.sensor_data && d.sensor_data.is_live);
    const src = isLive ? (isTa ? 'நேரடி சென்சார் (ஆன்லைனில்)' : 'Live sensor (Online)')
              : soil?.source === 'manual' ? (isTa ? 'கைமுறை உள்ளீடு' : 'Manual entry')
              : (isTa ? 'ஆய்வக அறிக்கை' : 'Lab report');
    const phVal = Number(soil?.ph ?? d.sensor_data?.ph);
    const phChip = !isNaN(phVal)
      ? (phVal >= 6.0 && phVal <= 7.5 ? chipSuccess(`pH: ${phVal.toFixed(1)}`) : chipWarning(`pH: ${phVal.toFixed(1)}`))
      : chipInfo('pH: —');

    const nVal = (d.sensor_data && d.sensor_data.nitrogen !== undefined) ? d.sensor_data.nitrogen : soil?.nitrogen;
    const pVal = (d.sensor_data && d.sensor_data.phosphorus !== undefined) ? d.sensor_data.phosphorus : soil?.phosphorus;
    const kVal = (d.sensor_data && d.sensor_data.potassium !== undefined) ? d.sensor_data.potassium : soil?.potassium;
    const ocVal = (d.sensor_data && d.sensor_data.organic_carbon !== undefined) ? d.sensor_data.organic_carbon : soil?.organic_carbon;

    const chips = [
      chipInfo(`N: ${nVal ?? '—'} kg/ha`),
      chipInfo(`P: ${pVal ?? '—'} kg/ha`),
      chipInfo(`K: ${kVal ?? '—'} kg/ha`),
      phChip,
      chipInfo(`OC: ${ocVal ?? '—'}%`),
    ];
    if (sensorLight !== null && sensorLight !== undefined && !isNaN(Number(sensorLight))) {
      chips.push(chipTeal(`☀️ Light: ${Number(sensorLight).toFixed(0)}%`));
    }
    const devId = d.sensor_data?.device_id || 'Soil-Scout-01';
    const metaText = isLive
      ? `🟢 ${src} (${devId}) · Realtime Live Telemetry`
      : `📋 ${src} · ${soil?.recorded_date || 'Stored Test'}`;
    npkEl.innerHTML = chips.join('') + `<div class="text-muted" style="flex-basis:100%;font-size:12px;margin-top:6px">${metaText}</div>`;
  } else {
    npkEl.innerHTML = `<p class="text-muted" style="font-size:13px;margin:0">${isTa ? 'மண் பரிசோதனை தரவு இல்லை.' : 'No soil data recorded for this farm yet.'}
      <a href="#soil-analysis" onclick="navigate('soil-analysis');return false" style="color:var(--green-400)">${isTa ? 'மண் பகுப்பாய்வைத் தொடங்குங்கள் →' : 'Run a Soil Analysis →'}</a></p>`;
  }

  // Rotation strip
  renderRotationStrip('dash-rotation-strip', d.rotation_plan);

  // Why this plan
  const whyEl = document.getElementById('dash-why');
  if (whyEl && d.why_this_plan) {
    whyEl.innerHTML = d.why_this_plan.map(r => `
      <li class="reason-item">
        <div class="reason-icon">✓</div>
        <span>${window.tReason ? tReason(r) : r}</span>
      </li>`).join('');
  }

  // Recent history table
  const histEl = document.getElementById('dash-history');
  if (d.recent_history && d.recent_history.length) {
    histEl.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>${window.t ? t('thCrop') : 'Crop'}</th>
            <th>${window.t ? t('thSeason') : 'Season'}</th>
            <th>${window.t ? t('thYear') : 'Year'}</th>
            <th>${window.t ? t('thProfit') : 'Profit (₹)'}</th>
          </tr>
        </thead>
        <tbody>
          ${d.recent_history.map(h => `
            <tr>
              <td>${cropIcon(h.crop)} ${window.tCrop ? tCrop(h.crop) : h.crop}</td>
              <td>${window.tSeason ? tSeason(h.season) : h.season}</td>
              <td>${h.year}</td>
              <td style="color:${h.profit > 0 ? 'var(--green-400)' : 'var(--red-400)'}">
                ${h.profit > 0 ? '+' : ''}₹${(h.profit||0).toLocaleString('en-IN')}
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  } else {
    histEl.innerHTML = `<p class="text-muted" style="text-align:center;padding:20px">${window.t ? t('noHistoryYet') : 'No history yet. Add crop history to get started.'}</p>`;
  }

  // Recovery chart — it projects from the current soil score, so it needs a real one
  if (d.soil_recovery_curve) {
    renderRecoveryChart(d.soil_recovery_curve, d.rotation_plan);
  } else if (recoveryChart) {
    recoveryChart.destroy();
    recoveryChart = null;
  }

  document.getElementById('dash-content').style.display = '';
  document.getElementById('dash-loading').style.display = 'none';
}

function renderRotationStrip(containerId, plan) {
  const el = document.getElementById(containerId);
  if (!el || !plan) return;
  el.innerHTML = plan.map((crop, i) => `
    ${i > 0 ? '<span class="rot-arrow">→</span>' : ''}
    <div class="rot-crop">
      <div class="rot-crop-dot">${cropIcon(crop)}</div>
      <span class="rot-crop-name">${window.tCrop ? tCrop(crop) : crop}</span>
    </div>`).join('');
}
window.renderRotationStrip = renderRotationStrip;

function renderRecoveryChart(curve, plan) {
  const ctx = document.getElementById('recovery-chart');
  if (!ctx) return;
  if (recoveryChart) recoveryChart.destroy();

  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  const cleanCurve = (curve || []).map(v => Math.min(100, Math.max(0, Math.round(Number(v)))));
  const labels = [isTa ? 'தற்போதைய நிலை' : 'Current', ...(plan || []).slice(0, cleanCurve.length - 1).map((c, i) => isTa ? `பருவம் ${i+1}: ${window.tCrop ? tCrop(c) : c}` : `S${i+1}: ${c}`)];
  while (labels.length < cleanCurve.length) labels.push(isTa ? `பருவம் ${labels.length}` : `Season ${labels.length}`);

  recoveryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.slice(0, cleanCurve.length),
      datasets: [{
        label: isTa ? 'மண் வள குறியீடு' : 'Soil Health Score',
        data: cleanCurve,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
        fill: true,
        tension: 0.45,
        pointBackgroundColor: '#22c55e',
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHitRadius: 12,
        borderWidth: 2.5,
        clip: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 14,
          right: 14,
          bottom: 6,
          left: 6
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(11,26,34,0.95)',
          borderColor: 'rgba(34,197,94,0.3)',
          borderWidth: 1,
          titleColor: '#f0fdf4',
          bodyColor: '#94a3b8',
          callbacks: {
            label: ctx => ` ${isTa ? 'மண் வள குறியீடு' : 'Soil Health Score'}: ${ctx.parsed.y}/100`,
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#94a3b8', font: { size: 12 } }
        },
        y: {
          min: 0,
          max: 100,
          clip: false,
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#94a3b8', font: { size: 12 }, stepSize: 20 }
        }
      }
    }
  });
}

window.renderDashboard = renderDashboard;
window.renderRecoveryChart = renderRecoveryChart;

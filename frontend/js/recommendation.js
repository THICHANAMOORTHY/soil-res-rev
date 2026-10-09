// ============================================================
//  recommendation.js — Final Recommendation view
// ============================================================

VIEW_LOADERS['recommendation'] = async function loadRecommendation() {
  document.getElementById('rec-loading').style.display = '';
  document.getElementById('rec-content').style.display = 'none';

  try {
    const data = await apiGet(`/recommendation?farm_id=${state.farm_id}`);
    state.recData = data;
    renderRecommendation(data);
  } catch(e) {
    document.getElementById('rec-loading').innerHTML =
      `<div class="alert-banner warning">⚠ ${e.message}</div>`;
  }
};

function renderRecommendation(d) {
  document.getElementById('rec-loading').style.display = 'none';
  const container = document.getElementById('rec-content');
  container.style.display = '';

  const scoreColor = d.score >= 80 ? '#22c55e' : d.score >= 60 ? '#f59e0b' : '#ef4444';

  // Hero section
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  const cropTitle = window.tCrop ? tCrop(d.recommended_crop) : d.recommended_crop;
  const familyName = isTa ? (window.t ? t(d.crop_family?.toLowerCase(), d.crop_family) : d.crop_family) : (d.crop_family || 'Legume');
  const waterReq = isTa ? `${d.water_requirement === 'Low' ? 'குறைந்த' : d.water_requirement === 'Medium' ? 'மிதமான' : 'அதிக'} நீர் தேவை` : `${d.water_requirement} Water`;
  const nFixText = d.is_nitrogen_fixer ? (window.t ? t('nitrogenFixer', 'N-Fixer') : 'N-Fixer') + ' ✓' : (isTa ? 'தழைச்சத்து நிலைநிறுத்தாதது' : 'Non-Fixer');

  document.getElementById('rec-hero-icon').textContent  = cropIcon(d.recommended_crop);
  document.getElementById('rec-hero-name').textContent  = cropTitle;
  document.getElementById('rec-hero-meta').textContent  = `${familyName} · ${waterReq} · ${nFixText}`;
  document.getElementById('rec-score-num').textContent  = d.score;
  document.getElementById('rec-score-num').style.color  = scoreColor;

  // Stats
  document.getElementById('rec-profit').textContent  = `₹${(d.expected_profit_per_acre/1000).toFixed(1)}K`;
  document.getElementById('rec-3s-profit').textContent = `₹${(d.projected_3_season_profit/1000).toFixed(0)}K`;
  document.getElementById('rec-water').textContent   = isTa ? `${d.water_requirement === 'Low' ? 'குறைந்த' : d.water_requirement === 'Medium' ? 'மிதமான' : 'அதிக'} நீர்` : (d.water_requirement || 'Low');
  document.getElementById('rec-family').textContent  = familyName;

  const nfixEl = document.getElementById('rec-nfix');
  if (nfixEl) {
    let chipsHtml = d.is_nitrogen_fixer
      ? chipTeal('✓ ' + (window.t ? t('nitrogenFixer', 'Nitrogen Fixer') : 'Nitrogen Fixer'))
      : chipWarning(isTa ? 'தழைச்சத்து நிலைநிறுத்தாது' : 'No N-Fix');
    if (d.ml_prediction) {
      chipsHtml += ` <span class="chip info" style="background:rgba(16,185,129,0.18);border:1px solid rgba(52,211,153,0.38);color:#34d399;font-weight:700">🤖 ML Model: ${d.ml_prediction.confidence}% (${d.ml_prediction.top_crop.toUpperCase()})</span>`;
    }
    nfixEl.innerHTML = chipsHtml;
  }

  // Reasoning
  const reasonEl = document.getElementById('rec-reasoning');
  if (reasonEl && d.reasoning) {
    reasonEl.innerHTML = d.reasoning.map(r => `
      <li class="reason-item">
        <div class="reason-icon" style="background:var(--green-glow);color:var(--green-400)">✓</div>
        <span>${window.tReason ? tReason(r) : r}</span>
      </li>`).join('');
  }

  // Rotation strip
  renderRotationStrip('rec-rotation-strip', d.rotation_plan);

  // Soil recovery chart
  renderRecChart(d.soil_recovery, d.rotation_plan);
}

let recChart = null;
function renderRecChart(curve, plan) {
  const ctx = document.getElementById('rec-recovery-chart');
  if (!ctx) return;
  if (recChart) recChart.destroy();

  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  const labels = [isTa ? 'தற்போதைய நிலை' : 'Now', ...(plan||[]).slice(0, curve.length - 1).map((c, i) => `${isTa ? 'பருவம்' : 'S'}${i+1}: ${isTa && window.tCrop ? tCrop(c).split(' (')[0] : c}`)];
  while (labels.length < curve.length) labels.push(isTa ? `பருவம் ${labels.length}` : `S${labels.length}`);

  recChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.slice(0, curve.length),
      datasets: [
        {
          label: 'Soil Health',
          data: curve,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          fill: true,
          tension: 0.45,
          pointBackgroundColor: '#22c55e',
          pointRadius: 6,
          borderWidth: 2.5,
        },
        {
          label: 'Target (80)',
          data: Array(curve.length).fill(80),
          borderColor: 'rgba(255,255,255,0.15)',
          borderDash: [6, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { size: 12 }, boxWidth: 12 }
        },
        tooltip: {
          backgroundColor: 'rgba(11,26,34,0.95)',
          borderColor: 'rgba(34,197,94,0.3)',
          borderWidth: 1,
          titleColor: '#f0fdf4',
          bodyColor: '#94a3b8',
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8' } },
        y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

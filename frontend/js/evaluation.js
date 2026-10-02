// ============================================================
//  evaluation.js — Candidate Crops + Evaluation view
// ============================================================

let radarChart = null;
let selectedCropIds = [];

VIEW_LOADERS['evaluation'] = async function loadEvaluation() {
  const sel = document.getElementById('eval-season-sel');
  if (sel && !sel.dataset.bound) {
    sel.addEventListener('change', fetchCandidates);
    sel.dataset.bound = 'true';
  }
  if (!state.crops) {
    try { state.crops = await apiGet('/crops'); } catch(e) { console.warn('Could not fetch crops list:', e); }
  }
  await fetchCandidates();
};

async function fetchCandidates() {
  const season = document.getElementById('eval-season-sel')?.value || 'Kharif';
  document.getElementById('candidates-grid').innerHTML = `<div class="loading-wrap"><div class="spinner"></div></div>`;
  document.getElementById('eval-results').style.display = 'none';

  try {
    const data = await apiGet(`/candidate-crops?farm_id=${state.farm_id}&season=${season}`);
    state.candidates = data;
    state.run_id = data.run_id;
    renderCandidates(data);
  } catch(e) {
    document.getElementById('candidates-grid').innerHTML =
      `<div class="alert-banner warning">⚠ ${e.message}</div>`;
  }
}

function renderCandidates(data) {
  const grid = document.getElementById('candidates-grid');
  selectedCropIds = [];

  const allCrops = [];

  // Candidates
  data.candidates.forEach(name => {
    const crop = { name, family: getFamilyFromName(name), id: getIdFromName(name) };
    allCrops.push({ ...crop, excluded: false });
  });

  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');

  // Excluded
  if (data.excluded.length) {
    const excEl = document.getElementById('excluded-list');
    if (excEl) {
      excEl.innerHTML = data.excluded.map(e =>
        `<div class="flex items-center gap-8" style="margin-bottom:6px">
          <span>${cropIcon(e.crop)}</span>
          <span style="color:var(--text-secondary)">${window.tCrop ? tCrop(e.crop) : e.crop}</span>
          <span class="chip danger" style="margin-left:auto">${window.tAlert ? tAlert(e.reason) : e.reason}</span>
        </div>`
      ).join('');
    }
  }

  grid.innerHTML = data.candidates.map(name => {
    const id = getIdFromName(name);
    const fam = getFamilyFromName(name);
    const famDisplay = isTa ? (window.t ? t(fam.toLowerCase(), fam) : fam) : fam;
    return `
    <div class="crop-card" id="ccard-${id}" onclick="toggleCropSelect(${id}, '${name}')" data-id="${id}">
      <div class="crop-card-icon">${cropIcon(name)}</div>
      <div class="crop-card-name">${window.tCrop ? tCrop(name) : name}</div>
      <div class="crop-card-family">${famDisplay}</div>
      <div class="crop-card-tags">
        ${getWaterChip(name)}
        ${getNFixChip(name)}
      </div>
    </div>`;
  }).join('');

  if (!data.candidates.length) {
    grid.innerHTML = `<p class="text-muted" style="padding:24px;text-align:center">${isTa ? 'இந்தப் பருவத்திற்கு உகந்த பயிர்கள் எதுவும் கிடைக்கவில்லை.' : 'No candidates found for this season/water combination.'}</p>`;
  }
}

function toggleCropSelect(id, name) {
  const card = document.getElementById(`ccard-${id}`);
  if (selectedCropIds.includes(id)) {
    selectedCropIds = selectedCropIds.filter(i => i !== id);
    card.classList.remove('selected');
  } else {
    selectedCropIds.push(id);
    card.classList.add('selected');
  }
  document.getElementById('eval-count').textContent = selectedCropIds.length;
}
window.toggleCropSelect = toggleCropSelect;

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('run-eval-btn');
  if (btn) btn.addEventListener('click', runEvaluation);
});

async function runEvaluation() {
  if (selectedCropIds.length < 2) {
    alert('Please select at least 2 crops to evaluate.');
    return;
  }

  const btn = document.getElementById('run-eval-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Evaluating…';

  const season = document.getElementById('eval-season-sel')?.value || state.candidates?.season || 'Kharif';

  try {
    const result = await apiPost('/crop-evaluation', {
      farm_id: state.farm_id,
      run_id:  state.run_id,
      candidate_crop_ids: selectedCropIds,
      season:  season,
    });
    state.evaluation = result;
    renderEvaluationResults(result);
  } catch(e) {
    document.getElementById('eval-results').innerHTML =
      `<div class="alert-banner warning">⚠ ${e.message}</div>`;
    document.getElementById('eval-results').style.display = '';
  } finally {
    btn.disabled = false;
    btn.textContent = '🚀 Run Evaluation';
  }
}

function renderEvaluationResults(result) {
  const container = document.getElementById('eval-results');
  container.style.display = '';

  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');

  // Leaderboard table
  const tbody = document.getElementById('eval-tbody');
  tbody.innerHTML = result.results.map(r => `
    <tr>
      <td><span style="font-weight:700;color:${r.rank===1?'var(--green-400)':'var(--text-secondary)'}">
        ${r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : '#'+r.rank}
      </span></td>
      <td>${cropIcon(r.crop)} <b style="color:var(--text-primary)">${window.tCrop ? tCrop(r.crop) : r.crop}</b></td>
      <td>${scoreBar(r.soil_suitability)}</td>
      <td>${scoreBar(r.rotation_score)}</td>
      <td>${scoreBar(r.water_score)}</td>
      <td>${scoreBar(r.profit_score)}</td>
      <td style="color:var(--green-400);font-weight:700">${r.final_score}</td>
      <td>
        <div style="font-weight:700">₹${(r.predicted_profit||0).toLocaleString('en-IN')}</div>
        ${r.profit_range ? `<div style="font-size:11px;color:var(--text-secondary)" title="Statistical 1-sigma confidence range based on historical harvest variance">₹${(r.profit_range.low||0).toLocaleString('en-IN')} – ₹${(r.profit_range.high||0).toLocaleString('en-IN')}</div>` : ''}
      </td>
    </tr>`).join('');

  setTimeout(() => animateBars(container), 100);

  // Radar chart
  renderRadarChart(result.results.slice(0, 4));

  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderRadarChart(results) {
  const ctx = document.getElementById('radar-chart');
  if (!ctx) return;
  if (radarChart) radarChart.destroy();

  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  const COLORS = ['#22c55e','#3b82f6','#f59e0b','#f87171','#2dd4bf','#a855f7'];

  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: isTa ? ['மண் பொருத்தம்','பருவம்','சுழற்சி','நீர் தேவை','லாபம்','அபாயம்'] : ['Soil Suit.','Season','Rotation','Water','Profit','Risk'],
      datasets: results.map((r, i) => ({
        label: isTa && window.tCrop ? tCrop(r.crop).split(' (')[0] : r.crop,
        data: [r.soil_suitability, r.season_suitability, r.rotation_score, r.water_score, r.profit_score, r.risk_score],
        borderColor:     COLORS[i],
        backgroundColor: COLORS[i] + '22',
        borderWidth: 2,
        pointBackgroundColor: COLORS[i],
        pointRadius: 4,
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { size: 12 }, padding: 16 }
        },
        tooltip: {
          backgroundColor: 'rgba(11,26,34,0.95)',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f0fdf4',
          bodyColor: '#94a3b8',
        }
      },
      scales: {
        r: {
          min: 0, max: 100,
          grid:       { color: 'rgba(255,255,255,0.06)' },
          angleLines: { color: 'rgba(255,255,255,0.06)' },
          ticks: { display: false },
          pointLabels: { color: '#94a3b8', font: { size: 12 } }
        }
      }
    }
  });
}

// Dynamic crop lookup helpers
function findCrop(name) {
  if (state.crops) {
    const found = state.crops.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (found) return found;
  }
  return null;
}

function getIdFromName(name) {
  const c = findCrop(name);
  return c ? c.crop_id : 0;
}

function getFamilyFromName(name) {
  const c = findCrop(name);
  return c ? c.crop_family : 'Other';
}

function getWaterChip(name) {
  const c = findCrop(name);
  const w = c ? c.water_requirement : 'Medium';
  const cls = w === 'Low' ? 'success' : w === 'Medium' ? 'warning' : 'info';
  return `<span class="chip ${cls}" style="font-size:10px">💧${w}</span>`;
}

function getNFixChip(name) {
  const c = findCrop(name);
  const fix = c ? c.is_nitrogen_fixer : false;
  return fix ? `<span class="chip teal" style="font-size:10px">N-Fixer</span>` : '';
}

// ============================================================
//  rotation.js — Rotation Optimizer view
// ============================================================

VIEW_LOADERS['rotation'] = async function loadRotation() {
  // Check if we already have plans
  if (state.plans) { renderPlans(state.plans); return; }

  // Otherwise show the optimize button form
  document.getElementById('rotation-loading').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('optimize-btn');
  if (btn) btn.addEventListener('click', runOptimizer);
});

async function runOptimizer() {
  const btn = document.getElementById('optimize-btn');
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  btn.disabled = true;
  btn.textContent = isTa ? '⏳ உகந்ததாக்குகிறது…' : '⏳ Optimizing…';
  document.getElementById('rotation-loading').style.display = '';

  try {
    const result = await apiPost('/optimize-rotation', {
      farm_id:         state.farm_id,
      run_id:          state.run_id,
      horizon_seasons: 3,
    });
    state.plans = result.plans;
    renderPlans(result.plans);
  } catch(e) {
    document.getElementById('rotation-plans').innerHTML =
      `<div class="alert-banner warning">⚠️ ${e.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = isTa ? '⚡ பயிர் சுழற்சி உகந்ததாக்கு' : '⚡ Optimize Rotation';
    document.getElementById('rotation-loading').style.display = 'none';
  }
}

function renderPlans(plans) {
  const container = document.getElementById('rotation-plans');
  container.style.display = '';

  container.innerHTML = `
    <div class="plans-grid">
      ${plans.map(plan => renderPlanCard(plan)).join('')}
    </div>`;

  // Profit comparison bar chart
  renderProfitChart(plans);

  document.getElementById('rotation-chart-section').style.display = '';
  setTimeout(() => animateBars(container), 100);
}

function renderPlanCard(plan) {
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  const isRec     = plan.is_recommended;
  const profitColor = plan.total_projected_profit > 95000 ? 'var(--green-400)'
                    : plan.total_projected_profit > 80000 ? 'var(--amber-400)'
                    : 'var(--red-400)';
  const healthColor = plan.final_soil_health >= 70 ? 'var(--green-400)'
                    : plan.final_soil_health >= 50 ? 'var(--amber-400)'
                    : 'var(--red-400)';

  return `
    <div class="plan-card ${isRec ? 'recommended' : ''}">
      ${isRec ? `<div class="plan-badge">⭐ ${isTa ? 'பரிந்துரைக்கப்பட்டது' : 'Recommended'}</div>` : ''}
      <div class="plan-label">${isTa ? 'திட்டம் ' : 'Plan '}${plan.plan_label}</div>

      <div class="rotation-strip mb-16" id="plan-strip-${plan.plan_label}">
        ${(plan.sequence||[]).map((crop, i) => `
          ${i > 0 ? '<span class="rot-arrow">→</span>' : ''}
          <div class="rot-crop">
            <div class="rot-crop-dot">${cropIcon(crop)}</div>
            <span class="rot-crop-name">${window.tCrop ? tCrop(crop) : crop}</span>
          </div>`).join('')}
      </div>

      <div class="card-label">${isTa ? 'எதிர்பார்க்கப்படும் 3-பருவ லாபம்' : 'Projected 3-Season Profit'}</div>
      <div class="plan-profit" style="color:${profitColor}">
        ₹${(plan.total_projected_profit/1000).toFixed(0)}K
      </div>

      <div class="plan-health-bar mt-16">
        <div class="flex justify-between mb-4">
          <span class="card-label">${isTa ? 'இறுதி மண் வளம்' : 'Final Soil Health'}</span>
          <span style="font-weight:700;color:${healthColor}">${plan.final_soil_health}</span>
        </div>
        <div class="score-bar-track">
          <div class="score-bar-fill" data-target="${plan.final_soil_health}"
               style="background:${healthColor}"></div>
        </div>
      </div>

      <div class="mt-16">
        <div class="card-label">${isTa ? 'பருவ வாரியான லாபம்' : 'Seasonal Profits'}</div>
        ${(plan.seasonal_profit||[]).map((p, i) => `
          <div class="flex justify-between mt-4" style="font-size:13px">
            <span class="text-muted">${isTa ? 'பருவம்' : 'Season'} ${i+1} · ${isTa && window.tCrop ? tCrop(plan.sequence?.[i]||'').split(' (')[0] : (plan.sequence?.[i]||'')}</span>
            <span style="color:var(--green-400);font-weight:600">₹${(p/1000).toFixed(0)}K</span>
          </div>`).join('')}
      </div>

      ${isRec ? `
        <button class="btn btn-primary btn-sm" style="width:100%;margin-top:20px"
          onclick="runSimulation(${plan.plan_id})">
          🔮 ${isTa ? 'மண் வளம் உருவகப்படுத்து' : 'Run Soil Simulation'}
        </button>` : ''}
    </div>`;
}

async function runSimulation(planId) {
  // Save plan_id and navigate to simulation view
  state.selectedPlanId = planId;
  navigate('simulation');
}
window.runSimulation = runSimulation;

let _profitChart = null;
function renderProfitChart(plans) {
  const ctx = document.getElementById('profit-chart');
  if (!ctx) return;
  if (_profitChart) _profitChart.destroy();

  const COLORS = ['rgba(248,113,113,0.8)', 'rgba(34,197,94,0.8)', 'rgba(59,130,246,0.8)'];
  const BORDER = ['#f87171', '#22c55e', '#3b82f6'];

  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  _profitChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: plans.map(p => isTa ? `திட்டம் ${p.plan_label}` : `Plan ${p.plan_label}`),
      datasets: [{
        label: isTa ? 'மொத்த லாபம் (₹)' : 'Total Profit (₹)',
        data: plans.map(p => p.total_projected_profit),
        backgroundColor: COLORS,
        borderColor: BORDER,
        borderWidth: 2,
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(11,26,34,0.95)',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f0fdf4',
          bodyColor: '#94a3b8',
          callbacks: { label: ctx => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 13, weight: '600' } } },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#94a3b8', callback: v => `₹${(v/1000).toFixed(0)}K` }
        }
      }
    }
  });
}

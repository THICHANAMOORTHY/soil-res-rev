// ============================================================
//  simulation.js — Soil Simulation view
// ============================================================

let simStep    = 0;
let simTimeline = [];
let simInterval = null;

VIEW_LOADERS['simulation'] = async function loadSimulation() {
  // Use selected plan or recommended plan
  const planId = state.selectedPlanId || getRecommendedPlanId();
  if (!planId) {
    document.getElementById('sim-content').innerHTML = `
      <div class="alert-banner warning">
        ⚠ Please run the <b>Rotation Optimizer</b> first to generate plans, then run simulation.
      </div>`;
    return;
  }

  document.getElementById('sim-plan-id').textContent = planId;
  await fetchSimulation(planId);
};

function getRecommendedPlanId() {
  if (!state.plans) return null;
  const rec = state.plans.find(p => p.is_recommended);
  return rec?.plan_id || state.plans[0]?.plan_id || null;
}

async function fetchSimulation(planId) {
  document.getElementById('sim-content').innerHTML =
    `<div class="loading-wrap"><div class="spinner"></div><p class="loading-text">Running simulation…</p></div>`;

  try {
    const result = await apiPost('/soil-simulation', { plan_id: planId });
    state.simData  = result;
    simTimeline    = result.timeline;
    simStep        = 0;
    renderSimSetup(result);
  } catch(e) {
    document.getElementById('sim-content').innerHTML =
      `<div class="alert-banner warning">⚠ ${e.message}</div>`;
  }
}

function renderSimSetup(result) {
  const container = document.getElementById('sim-content');
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');

  container.innerHTML = `
    <div class="flex items-center gap-12 mb-24" style="flex-wrap:wrap">
      <button class="btn btn-primary" id="sim-play-btn" onclick="playSimulation()">▶ ${isTa ? 'இயக்குக (Animation)' : 'Play Animation'}</button>
      <button class="btn btn-secondary" onclick="resetSimulation()">↺ ${isTa ? 'மீட்டமை' : 'Reset'}</button>
      <span class="text-muted" id="sim-step-info">${isTa ? 'பருவம்' : 'Season'}: 0 / ${simTimeline.length - 1}</span>
    </div>
    <div class="sim-timeline" id="sim-cards"></div>`;

  buildSimCards(result.timeline);
  revealSimCard(0); // Show current state immediately
}

function buildSimCards(timeline) {
  const container = document.getElementById('sim-cards');
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');

  container.innerHTML = timeline.map((t, i) => `
    <div class="sim-card" id="sim-card-${i}">
      <div class="sim-season-label">${i === 0 ? (isTa ? 'தற்போதைய நிலை' : 'Current State') : (isTa ? `பருவம் ${i}` : `Season ${i}`)}</div>
      <div class="sim-crop-name">${cropIcon(t.crop)} ${window.tCrop ? tCrop(t.crop) : t.crop}</div>
      <div class="sim-health">${t.soil_health}</div>
      <div class="card-label">${isTa ? 'மண் வள குறியீடு' : 'Soil Health Score'}</div>
      <div class="sim-nutrients">
        ${nutrientChip('N', t.n)}
        ${nutrientChip('P', t.p)}
        ${nutrientChip('K', t.k)}
        ${nutrientChip('OC', t.oc)}
      </div>
    </div>`).join('');
}

function revealSimCard(index) {
  const card = document.getElementById(`sim-card-${index}`);
  if (card) card.classList.add('revealed');
  const info = document.getElementById('sim-step-info');
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  if (info) info.textContent = `${isTa ? 'பருவம்' : 'Season'}: ${index} / ${simTimeline.length - 1}`;
}

function playSimulation() {
  const btn = document.getElementById('sim-play-btn');
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
    btn.textContent = isTa ? '▶ இயக்குக' : '▶ Play Animation';
    return;
  }

  btn.textContent = isTa ? '⏸ இடைநிறுத்து' : '⏸ Pause';
  resetCardVisibility();
  revealSimCard(0);
  simStep = 1;

  simInterval = setInterval(() => {
    if (simStep >= simTimeline.length) {
      clearInterval(simInterval);
      simInterval = null;
      btn.textContent = isTa ? '▶ மீண்டும் இயக்கு' : '▶ Replay';
      return;
    }
    revealSimCard(simStep);
    simStep++;
  }, 900);
}
window.playSimulation = playSimulation;

function resetSimulation() {
  if (simInterval) { clearInterval(simInterval); simInterval = null; }
  const btn = document.getElementById('sim-play-btn');
  if (btn) btn.textContent = '▶ Play Animation';
  simStep = 0;
  resetCardVisibility();
  revealSimCard(0);
}
window.resetSimulation = resetSimulation;

function resetCardVisibility() {
  document.querySelectorAll('.sim-card').forEach(c => c.classList.remove('revealed'));
}

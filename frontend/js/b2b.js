// ============================================================
//  b2b.js — B2B Organization & FPO Command Center Controller
//  Supports FPOs, Dairy Cooperatives & Agribusiness Intelligence
// ============================================================

let currentOrgId = 1;
let currentOrgDashboard = null;
let currentOrgFarms = [];
let currentOrgCrops = null;
let currentOrgSensors = null;
let b2bCropChartInstance = null;
let activeVillageFilter = 'all';

// ── View Loader ─────────────────────────────────────────────
async function loadB2BView() {
  try {
    // 1. Fetch available organizations
    const orgsRes = await apiGet('/orgs').catch(() => null);
    if (orgsRes && orgsRes.organizations) {
      populateOrgSelector(orgsRes.organizations);
    }

    // 2. Fetch selected organization's full data
    await fetchOrgData(currentOrgId);
  } catch (err) {
    console.error('Failed to load B2B view:', err);
  }
}
window.loadB2BView = loadB2BView;

// Register with router
if (window.VIEW_LOADERS) {
  window.VIEW_LOADERS['b2b'] = loadB2BView;
}

// ── Fetch All Org Endpoints ─────────────────────────────────
async function fetchOrgData(orgId) {
  currentOrgId = parseInt(orgId, 10) || 1;
  const loadingEl = document.getElementById('b2b-loading-indicator');
  if (loadingEl) loadingEl.style.display = 'inline-flex';

  try {
    const [dashRes, farmsRes, cropsRes, sensorsRes] = await Promise.all([
      apiGet(`/orgs/${currentOrgId}/dashboard`).catch(() => null),
      apiGet(`/orgs/${currentOrgId}/farms`).catch(() => null),
      apiGet(`/orgs/${currentOrgId}/crops`).catch(() => null),
      apiGet(`/orgs/${currentOrgId}/sensors`).catch(() => null)
    ]);

    currentOrgDashboard = dashRes;
    currentOrgFarms = (farmsRes && farmsRes.farms) ? farmsRes.farms : [];
    currentOrgCrops = cropsRes;
    currentOrgSensors = sensorsRes;

    renderB2BDashboardHeader(dashRes);
    renderB2BMetricCards(dashRes);
    renderB2BSoilHealth(dashRes);
    renderB2BCropDistribution(dashRes);
    renderB2BLivestockSilage(dashRes);
    renderB2BIoTFleet(dashRes, sensorsRes);
    renderClusterTabs(currentOrgFarms);
    renderB2BFarmsTable(currentOrgFarms);
    renderB2BAlerts(dashRes ? dashRes.action_alerts : []);
  } catch (err) {
    console.error('Error fetching org data:', err);
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}
window.fetchOrgData = fetchOrgData;

// ── Populate Organization Dropdown ──────────────────────────
function populateOrgSelector(orgs) {
  const sel = document.getElementById('b2b-org-select');
  if (!sel) return;

  sel.innerHTML = orgs.map(o => `
    <option value="${o.org_id}" ${o.org_id === currentOrgId ? 'selected' : ''}>
      ${o.type === 'FPO' ? '🏢' : o.type === 'Dairy Cooperative' ? '🥛' : '🏭'} ${o.name} (${o.total_registered_farmers} farmers · ${o.total_cultivated_acres} ac)
    </option>
  `).join('');
}

// ── Header Information ──────────────────────────────────────
function renderB2BDashboardHeader(data) {
  if (!data) return;
  const nameEl = document.getElementById('b2b-org-name');
  const typeEl = document.getElementById('b2b-org-type-badge');
  const metaEl = document.getElementById('b2b-org-meta');

  if (nameEl) nameEl.textContent = data.name;
  if (typeEl) {
    typeEl.textContent = data.type;
    typeEl.style.background = data.type === 'FPO' ? '#7c3aed' : data.type === 'Dairy Cooperative' ? '#059669' : '#2563eb';
  }
  if (metaEl) {
    metaEl.textContent = `Enterprise Multi-Tenant Node · ${data.metrics.total_farmers.toLocaleString()} farmers · ${data.metrics.total_area_acres.toLocaleString()} acres`;
  }
}

// ── Top 4 Metric Cards ──────────────────────────────────────
function renderB2BMetricCards(data) {
  if (!data || !data.metrics) return;
  const { metrics, iot_fleet } = data;

  const fEl = document.getElementById('b2b-stat-farmers');
  const mEl = document.getElementById('b2b-stat-farms');
  const aEl = document.getElementById('b2b-stat-acres');
  const sEl = document.getElementById('b2b-stat-iot');

  const subClusters = document.getElementById('b2b-stat-clusters');
  const subAvg = document.getElementById('b2b-stat-avg-size');
  const subAcres = document.getElementById('b2b-stat-irrigation');
  const subIot = document.getElementById('b2b-stat-iot-sub');

  if (fEl) fEl.textContent = metrics.total_farmers.toLocaleString();
  if (mEl) mEl.textContent = metrics.total_farms.toLocaleString();
  if (aEl) aEl.textContent = `${metrics.total_area_acres.toLocaleString()} ac`;
  if (sEl) {
    sEl.innerHTML = `<span>${iot_fleet.online} <span style="font-size:14px;color:#86efac;font-weight:400">/ ${iot_fleet.total_devices}</span></span>`;
  }

  if (subClusters) subClusters.textContent = `Live Network (${metrics.total_farmers} Farmers)`;
  if (subAvg) subAvg.textContent = `Avg ${metrics.average_farm_size_acres} ac / farm`;
  if (subAcres) subAcres.textContent = `100% Registered Land Area`;
  if (subIot) {
    const pct = Math.round((iot_fleet.online / (iot_fleet.total_devices || 1)) * 100);
    subIot.textContent = `● ${pct}% Reporting Live`;
  }
}

// ── Regional Soil Health ─────────────────────────────────────
function renderB2BSoilHealth(data) {
  if (!data || !data.soil_health_distribution) return;
  const sh = data.soil_health_distribution;

  const scoreEl = document.getElementById('b2b-soil-score');
  const barHealthy = document.getElementById('b2b-bar-healthy');
  const barMod = document.getElementById('b2b-bar-mod');
  const barPoor = document.getElementById('b2b-bar-poor');
  const defContainer = document.getElementById('b2b-deficiencies-list');

  if (scoreEl) scoreEl.textContent = sh.average_health_score;
  if (barHealthy) {
    barHealthy.style.width = `${sh.healthy_pct}%`;
    barHealthy.textContent = `${sh.healthy_pct}%`;
  }
  if (barMod) {
    barMod.style.width = `${sh.moderate_pct}%`;
    barMod.textContent = `${sh.moderate_pct}%`;
  }
  if (barPoor) {
    barPoor.style.width = `${sh.poor_pct}%`;
    barPoor.textContent = `${sh.poor_pct}%`;
  }

  if (defContainer && sh.primary_deficiencies) {
    defContainer.innerHTML = sh.primary_deficiencies.map(d => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:12.5px">
        <span style="color:var(--text-secondary);display:flex;align-items:center;gap:6px">
          <span style="color:${d.affected_farms_pct >= 50 ? '#f87171' : '#fbbf24'}">●</span> ${d.nutrient}
        </span>
        <b style="color:${d.affected_farms_pct >= 50 ? '#f87171' : '#fbbf24'}">${d.affected_farms_pct}% of farms</b>
      </div>
    `).join('');
  }
}

// ── Crop Distribution & Mandi Projections ───────────────────
function renderB2BCropDistribution(data) {
  if (!data || !data.crop_distribution) return;
  const crops = data.crop_distribution;

  // Render Table
  const tbody = document.getElementById('b2b-crops-tbody');
  if (tbody) {
    tbody.innerHTML = crops.map(c => `
      <tr>
        <td style="font-weight:600;display:flex;align-items:center;gap:6px">
          <span>${window.cropIcon ? window.cropIcon(c.crop.split(' ')[0]) : '🌱'}</span> ${c.crop}
        </td>
        <td><b style="color:#86efac">${c.percentage}%</b></td>
        <td>${c.acreage.toLocaleString()} ac</td>
      </tr>
    `).join('');
  }

  // Render Chart.js
  const canvas = document.getElementById('b2b-crop-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  if (b2bCropChartInstance) b2bCropChartInstance.destroy();

  b2bCropChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: crops.map(c => c.crop),
      datasets: [{
        data: crops.map(c => c.percentage),
        backgroundColor: [
          '#22c55e', '#38bdf8', '#fbbf24', '#a855f7', '#f43f5e'
        ],
        borderWidth: 2,
        borderColor: '#0f172a'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, color: '#94a3b8', font: { size: 11 } }
        }
      },
      cutout: '65%'
    }
  });
}

// ── Livestock & Silage Telemetry ────────────────────────────
function renderB2BLivestockSilage(data) {
  if (!data || !data.dairyfeed_silage_telemetry) return;
  const st = data.dairyfeed_silage_telemetry;

  const bEl = document.getElementById('b2b-df-batches');
  const qEl = document.getElementById('b2b-df-quality');
  const pEl = document.getElementById('b2b-df-probes');
  const fEl = document.getElementById('b2b-df-fodder');

  if (bEl) bEl.textContent = st.total_batches_tested;
  if (qEl) {
    if (st.total_batches_tested > 0) {
      qEl.innerHTML = `<span style="color:#86efac">${st.quality_breakdown.good_pct}% Good</span> · <span style="color:#fbbf24">${st.quality_breakdown.moderate_pct}% Mod</span>`;
    } else {
      qEl.innerHTML = `<span style="color:#86efac">Silage Telemetry Ready</span>`;
    }
  }
  if (pEl) pEl.textContent = `${st.active_silage_probes} Probe`;
  if (fEl) fEl.textContent = `${st.estimated_monthly_fodder_yield_tons.toLocaleString()} Tons`;
}

// ── IoT Fleet Telemetry ─────────────────────────────────────
function renderB2BIoTFleet(data, sensors) {
  if (!data || !data.iot_fleet) return;
  const fleet = data.iot_fleet;

  const onEl = document.getElementById('b2b-fleet-online');
  const offEl = document.getElementById('b2b-fleet-offline');
  const rateEl = document.getElementById('b2b-fleet-uptime');
  const breakEl = document.getElementById('b2b-fleet-breakdown');

  const uptimePct = Math.round((fleet.online / (fleet.total_devices || 1)) * 100);

  if (onEl) onEl.textContent = fleet.online;
  if (offEl) offEl.textContent = fleet.offline;
  if (rateEl) rateEl.textContent = `${uptimePct}%`;

  if (breakEl && sensors && sensors.device_breakdown) {
    breakEl.innerHTML = sensors.device_breakdown.map(d => `
      <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;border-bottom:1px solid rgba(255,255,255,0.05)">
        <span style="color:var(--text-secondary)">${d.type}</span>
        <span><b style="color:#86efac">${d.active}</b> <span style="color:var(--text-muted)">/ ${d.total}</span></span>
      </div>
    `).join('');
  }
}

// ── Dynamic Cluster Tabs ────────────────────────────────────
function renderClusterTabs(farms) {
  const container = document.getElementById('b2b-cluster-tabs');
  if (!container) return;

  const clusters = ['all'];
  (farms || []).forEach(f => {
    const loc = (f.location || '').split(',')[0].trim();
    if (loc && !clusters.includes(loc)) {
      clusters.push(loc);
    }
  });

  container.innerHTML = clusters.map(c => `
    <button class="btn btn-secondary b2b-tab-btn ${c === activeVillageFilter ? 'active' : ''}" 
            style="font-size:11px;padding:5px 10px" 
            data-village="${c}" 
            onclick="filterVillageCluster('${c}')">
      ${c === 'all' ? 'All Clusters' : `${c} Cluster`}
    </button>
  `).join('');
}
window.renderClusterTabs = renderClusterTabs;

// ── Member Farms Table & Filter ─────────────────────────────
function filterVillageCluster(village) {
  activeVillageFilter = village;
  document.querySelectorAll('.b2b-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.village === village);
  });

  if (village === 'all') {
    renderB2BFarmsTable(currentOrgFarms);
  } else {
    const filtered = currentOrgFarms.filter(f => (f.location || '').toLowerCase().includes(village.toLowerCase()));
    renderB2BFarmsTable(filtered);
  }
}
window.filterVillageCluster = filterVillageCluster;

function searchB2BFarms(query) {
  const q = (query || '').toLowerCase().trim();
  const filtered = currentOrgFarms.filter(f => {
    return f.farmer_name.toLowerCase().includes(q) ||
           f.location.toLowerCase().includes(q) ||
           f.current_crop.toLowerCase().includes(q) ||
           String(f.farm_id).includes(q);
  });
  renderB2BFarmsTable(filtered);
}
window.searchB2BFarms = searchB2BFarms;

function renderB2BFarmsTable(farmsList) {
  const tbody = document.getElementById('b2b-farms-tbody');
  if (!tbody) return;

  if (!farmsList || farmsList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted)">No member farms match criteria</td></tr>`;
    return;
  }

  tbody.innerHTML = farmsList.map(f => {
    const soilScore = f.soil_score || 70;
    const scoreColor = soilScore >= 75 ? '#86efac' : soilScore >= 55 ? '#fbbf24' : '#f87171';
    const scoreBadge = soilScore >= 75 ? 'Healthy' : soilScore >= 55 ? 'Moderate' : 'Deficient';

    return `
      <tr>
        <td style="font-weight:600">
          <div style="font-size:13px;color:var(--text-primary)">${f.farmer_name}</div>
          <div style="font-size:11px;color:var(--text-muted)">Farm #${f.farm_id}</div>
        </td>
        <td style="font-size:12px;color:var(--text-secondary)">${f.location}</td>
        <td><b>${f.acres} ac</b></td>
        <td>
          <span class="chip info" style="font-size:11px">${f.current_crop}</span>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-family:'Outfit',sans-serif;font-weight:700;color:${scoreColor}">${soilScore}</span>
            <span class="chip" style="font-size:10px;background:rgba(255,255,255,0.06);color:${scoreColor}">${scoreBadge}</span>
          </div>
        </td>
        <td>
          <span style="display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:#86efac">
            <span style="width:6px;height:6px;border-radius:50%;background:#22c55e"></span> Online
          </span>
        </td>
        <td>
          <button class="btn btn-secondary" style="font-size:11px;padding:4px 10px" onclick="switchToFarmerFarm(${f.farm_id})">
            Inspect Farm
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Inspect Farm Action ─────────────────────────────────────
function switchToFarmerFarm(farmId) {
  if (window.state) {
    window.state.farm_id = farmId;
  }
  const select = document.getElementById('farm-location-select');
  if (select) {
    select.value = String(farmId);
  }
  navigate('dashboard');
  if (typeof fetchDashboardData === 'function') {
    fetchDashboardData(farmId);
  }
}
window.switchToFarmerFarm = switchToFarmerFarm;

// ── Enterprise Alerts ───────────────────────────────────────
function renderB2BAlerts(alerts) {
  const container = document.getElementById('b2b-alerts-container');
  if (!container) return;

  if (!alerts || alerts.length === 0) {
    container.innerHTML = `<p class="text-muted" style="font-size:12px">No critical cluster alerts active</p>`;
    return;
  }

  container.innerHTML = alerts.map(a => {
    const isDanger = a.level === 'DANGER';
    const isWarn = a.level === 'WARNING';
    const borderColor = isDanger ? '#ef4444' : isWarn ? '#f59e0b' : '#38bdf8';
    const bg = isDanger ? 'rgba(239, 68, 68, 0.1)' : isWarn ? 'rgba(245, 158, 11, 0.1)' : 'rgba(56, 189, 248, 0.1)';

    return `
      <div style="background:${bg};border-left:3px solid ${borderColor};border-radius:8px;padding:12px 14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <b style="font-size:12.5px;color:var(--text-primary)">${a.title}</b>
          <span class="chip" style="font-size:10px;background:rgba(255,255,255,0.08);color:${borderColor}">${a.count} farms affected</span>
        </div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">
          Directive: <b>${a.recommended_action}</b>
        </div>
        <button class="btn btn-secondary" style="font-size:10.5px;padding:3px 8px" onclick="broadcastDirective('${a.title}')">
          📲 Broadcast SMS & WhatsApp Advisory
        </button>
      </div>
    `;
  }).join('');
}

// ── Action: Broadcast Advisory ──────────────────────────────
function broadcastDirective(alertTitle) {
  alert(`✅ Directive Dispatched!\n\nBroadcast advisory queued for ${alertTitle}.\nNotification sent via SMS & WhatsApp to affected member farmers.`);
}
window.broadcastDirective = broadcastDirective;

// ── Action: Export FPO Summary ──────────────────────────────
function exportFPOSummary() {
  if (!currentOrgDashboard) return;
  const text = `UZHAVU KAAPPAAN — B2B FPO INTELLIGENCE REPORT
=====================================================
Organization: ${currentOrgDashboard.name} (${currentOrgDashboard.type})
Total Farmers: ${currentOrgDashboard.metrics.total_farmers}
Total Farms: ${currentOrgDashboard.metrics.total_farms}
Total Acreage: ${currentOrgDashboard.metrics.total_area_acres} Acres
Average Farm Size: ${currentOrgDashboard.metrics.average_farm_size_acres} Acres
Soil Health Status: Mean ${currentOrgDashboard.soil_health_distribution.average_health_score}/100
Healthy Farms: ${currentOrgDashboard.soil_health_distribution.healthy_pct}% | Moderate: ${currentOrgDashboard.soil_health_distribution.moderate_pct}% | Poor: ${currentOrgDashboard.soil_health_distribution.poor_pct}%
IoT Fleet: ${currentOrgDashboard.iot_fleet.online} Online / ${currentOrgDashboard.iot_fleet.total_devices} Deployed
Generated: ${new Date().toLocaleString()}
=====================================================`;

  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${currentOrgDashboard.name.replace(/\s+/g, '_')}_Intelligence_Report.txt`;
  a.click();
}
window.exportFPOSummary = exportFPOSummary;

// ============================================================
//  b2b.js — B2B Multi-Tenant Organization & FPO Command Center
//  Supports FPOs, Agribusinesses, Dairy Cooperatives & Federations
//  Full Enterprise Hierarchy: Org -> Cluster -> Farm -> Farmer -> Field & IoT
// ============================================================

let currentOrgId = 1;
let currentB2BSubview = 'overview';
let currentOrgDashboard = null;
let currentOrgFarms = [];
let currentOrgMembers = null;
let currentOrgClusters = [];
let currentOrgSoil = null;
let currentOrgCrops = null;
let currentOrgProduction = null;
let currentOrgSensors = null;
let currentOrgIFS = null;
let currentOrgAlerts = [];
let currentOrgAdvisories = [];
let currentOrgTasks = [];
let currentOrgSettings = null;

let b2bCropChartInstance = null;
let b2bGrowthChartInstance = null;
let activeClusterFilter = 'all';
let activeCropFilter = 'all';
let activeStatusFilter = 'all';
let activeFarmSearchQuery = '';

// Role Permissions Map
const ROLE_PERMISSIONS = {
  fpo_admin: {
    title: 'FPO Administrator / CEO',
    badge: '👑 Admin / CEO',
    color: '#a855f7',
    allowed_subviews: ['overview', 'members', 'clusters', 'farms', 'soil', 'crops', 'iot', 'ifs', 'action', 'advisories', 'reports', 'settings']
  },
  fpo_manager: {
    title: 'FPO Operations Manager',
    badge: '📋 Operations Manager',
    color: '#38bdf8',
    allowed_subviews: ['overview', 'members', 'clusters', 'farms', 'crops', 'soil', 'action', 'advisories', 'reports']
  },
  field_officer: {
    title: 'Senior Field Operations Officer',
    badge: '🚜 Field Officer',
    color: '#22c55e',
    allowed_subviews: ['overview', 'clusters', 'farms', 'action', 'advisories']
  },
  agronomist: {
    title: 'Lead Agronomist & Soil Specialist',
    badge: '🔬 Agronomist',
    color: '#f59e0b',
    allowed_subviews: ['overview', 'soil', 'crops', 'farms', 'action', 'advisories', 'reports']
  },
  iot_technician: {
    title: 'IoT & Telemetry Systems Engineer',
    badge: '📡 IoT Technician',
    color: '#06b6d4',
    allowed_subviews: ['overview', 'iot', 'farms', 'action', 'settings']
  },
  farmer: {
    title: 'Individual Farmer',
    badge: '🌾 Farmer',
    color: '#10b981',
    allowed_subviews: ['overview']
  }
};

// ── Portal Switcher: Enter Enterprise / B2B Platform ─────────
function enterB2BPortal(subview = 'overview') {
  if (!window.isAdminUser || !window.isAdminUser()) {
    if (typeof showToast === 'function') {
      showToast('Access to FPO Command Center is restricted to administrators', 'error');
    } else {
      alert('Access to FPO Command Center is restricted to administrators');
    }
    return;
  }

  const farmerNav = document.getElementById('farmer-nav-items');
  const b2bNav = document.getElementById('b2b-nav-items');
  const portalBtn = document.getElementById('btn-portal-switch');
  const sidebarChip = document.getElementById('sidebar-active-farm-chip');
  const sidebarOrgChip = document.getElementById('sidebar-active-org-chip');

  if (farmerNav) farmerNav.style.display = 'none';
  if (b2bNav) b2bNav.style.display = 'block';
  if (portalBtn) {
    portalBtn.innerHTML = '🌾 <span>Switch to Farmer Platform</span>';
    portalBtn.onclick = enterFarmerPortal;
    portalBtn.style.color = '#86efac';
    portalBtn.style.borderColor = 'rgba(34,197,94,0.4)';
  }
  if (sidebarChip) sidebarChip.style.display = 'none';
  if (sidebarOrgChip) sidebarOrgChip.style.display = 'block';

  document.body.classList.add('portal-b2b');
  document.body.classList.remove('portal-farmer');

  if (window.updateAdminVisibility) window.updateAdminVisibility();

  if (window.navigate) {
    window.navigate('b2b');
  }
  switchB2BSubview(subview);
  loadB2BView();
}
window.enterB2BPortal = enterB2BPortal;

// ── Portal Switcher: Return to Farmer Platform ───────────────
function enterFarmerPortal() {
  const farmerNav = document.getElementById('farmer-nav-items');
  const b2bNav = document.getElementById('b2b-nav-items');
  const portalBtn = document.getElementById('btn-portal-switch');
  const sidebarChip = document.getElementById('sidebar-active-farm-chip');
  const sidebarOrgChip = document.getElementById('sidebar-active-org-chip');

  if (farmerNav) farmerNav.style.display = 'block';
  if (b2bNav) b2bNav.style.display = 'none';
  if (portalBtn) {
    portalBtn.innerHTML = '🏢 <span>Switch to FPO Command Center</span>';
    portalBtn.onclick = () => enterB2BPortal('overview');
    portalBtn.style.color = '#c084fc';
    portalBtn.style.borderColor = 'rgba(124,58,237,0.4)';
  }
  if (sidebarChip) sidebarChip.style.display = 'block';
  if (sidebarOrgChip) sidebarOrgChip.style.display = 'none';

  document.body.classList.remove('portal-b2b');
  document.body.classList.add('portal-farmer');

  if (window.updateAdminVisibility) window.updateAdminVisibility();

  if (window.navigate) {
    window.navigate('dashboard');
  }
}
window.enterFarmerPortal = enterFarmerPortal;

// ── Real-Time Live Stream Poller (12s cadence) ──────────────
let b2bSyncTimer = null;

function startB2BLiveSync() {
  if (b2bSyncTimer) clearInterval(b2bSyncTimer);
  b2bSyncTimer = setInterval(() => {
    const b2bView = document.getElementById('view-b2b');
    if (b2bView && b2bView.classList.contains('active')) {
      fetchOrgData(currentOrgId, true);
    }
  }, 12000);
}

// ── Main B2B View Loader ─────────────────────────────────────
async function loadB2BView() {
  try {
    const orgsRes = await apiGet('/orgs').catch(() => null);
    if (orgsRes && orgsRes.organizations) {
      populateOrgSelector(orgsRes.organizations);
    }
    await fetchOrgData(currentOrgId);
    startB2BLiveSync();
  } catch (err) {
    console.error('Failed to load B2B view:', err);
  }
}
window.loadB2BView = loadB2BView;

if (window.VIEW_LOADERS) {
  window.VIEW_LOADERS['b2b'] = loadB2BView;
}

// ── Fetch All Org Endpoints in Parallel ─────────────────────
async function fetchOrgData(orgId, isSilent = false) {
  currentOrgId = parseInt(orgId, 10) || 1;
  const loadingEl = document.getElementById('b2b-loading-indicator');
  if (loadingEl && !isSilent) loadingEl.style.display = 'inline-flex';

  try {
    const [
      dashRes, farmsRes, membersRes, clustersRes,
      soilRes, cropsRes, prodRes, sensorsRes,
      ifsRes, alertsRes, advisoriesRes, tasksRes, settingsRes
    ] = await Promise.all([
      apiGet(`/orgs/${currentOrgId}/dashboard`).catch(() => null),
      apiGet(`/orgs/${currentOrgId}/farms`).catch(() => null),
      apiGet(`/orgs/${currentOrgId}/members`).catch(() => null),
      apiGet(`/orgs/${currentOrgId}/clusters`).catch(() => null),
      apiGet(`/orgs/${currentOrgId}/soil`).catch(() => null),
      apiGet(`/orgs/${currentOrgId}/crops`).catch(() => null),
      apiGet(`/orgs/${currentOrgId}/production`).catch(() => null),
      apiGet(`/orgs/${currentOrgId}/sensors`).catch(() => null),
      apiGet(`/orgs/${currentOrgId}/ifs`).catch(() => null),
      apiGet(`/orgs/${currentOrgId}/alerts`).catch(() => null),
      apiGet(`/orgs/${currentOrgId}/advisories`).catch(() => null),
      apiGet(`/orgs/${currentOrgId}/tasks`).catch(() => null),
      apiGet(`/orgs/${currentOrgId}/settings`).catch(() => null)
    ]);

    currentOrgDashboard = dashRes;
    currentOrgFarms = (farmsRes && farmsRes.farms) ? farmsRes.farms : [];
    currentOrgMembers = membersRes;
    currentOrgClusters = (clustersRes && clustersRes.clusters) ? clustersRes.clusters : [];
    currentOrgSoil = soilRes;
    currentOrgCrops = cropsRes;
    currentOrgProduction = prodRes;
    currentOrgSensors = sensorsRes;
    currentOrgIFS = ifsRes;
    currentOrgAlerts = (alertsRes && alertsRes.alerts) ? alertsRes.alerts : [];
    currentOrgAdvisories = (advisoriesRes && advisoriesRes.advisories) ? advisoriesRes.advisories : [];
    currentOrgTasks = (tasksRes && tasksRes.tasks) ? tasksRes.tasks : [];
    currentOrgSettings = settingsRes;

    renderEnterpriseHeader(dashRes);
    applyRolePermissions();

    // Render active subview
    renderB2BOverview(dashRes);
    renderB2BMembers(membersRes);
    renderB2BClusters(currentOrgClusters);
    renderB2BFarms(currentOrgFarms);
    renderB2BSoilIntelligence(soilRes);
    renderB2BCropIntelligence(cropsRes, prodRes);
    renderB2BIoTFleet(sensorsRes, dashRes);
    renderB2BIFS(ifsRes);
    renderB2BActionCenter(currentOrgAlerts);
    renderB2BAdvisories(currentOrgAdvisories);
    renderB2BReports();
    renderB2BSettings(settingsRes);
  } catch (err) {
    console.error('Error fetching org data:', err);
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}
window.fetchOrgData = fetchOrgData;

// ── Enterprise Header & Role Display ─────────────────────────
function renderEnterpriseHeader(data) {
  if (!data) return;
  const nameEl = document.getElementById('b2b-org-name');
  const typeEl = document.getElementById('b2b-org-type-badge');
  const metaEl = document.getElementById('b2b-org-meta');
  const regionEl = document.getElementById('b2b-header-region');
  const seasonEl = document.getElementById('b2b-header-season');
  const userPill = document.getElementById('b2b-header-user-pill');
  const sidebarOrgLabel = document.getElementById('sidebar-active-org-name');
  const sidebarAlertBadge = document.getElementById('b2b-sidebar-alert-badge');

  if (nameEl) nameEl.textContent = data.name;
  if (sidebarOrgLabel) sidebarOrgLabel.textContent = data.short_name || data.name;
  if (typeEl) {
    typeEl.textContent = data.type;
    typeEl.style.background = data.type === 'FPO' ? '#7c3aed' : data.type === 'Dairy Cooperative' ? '#059669' : '#2563eb';
  }
  if (metaEl) {
    metaEl.textContent = `Enterprise Multi-Tenant Node · ${data.metrics.total_farmers.toLocaleString()} Farmers · ${data.metrics.total_area_acres.toLocaleString()} Acres · ${data.metrics.active_clusters} Clusters`;
  }
  if (regionEl) regionEl.textContent = data.region || 'Coimbatore Region, Tamil Nadu';
  if (seasonEl) seasonEl.textContent = `${data.season || 'Kharif'} 2026`;

  const curRole = (window.authUser && window.authUser.role) || 'fpo_admin';
  const roleConfig = ROLE_PERMISSIONS[curRole] || ROLE_PERMISSIONS.fpo_admin;
  if (userPill) {
    userPill.innerHTML = `<span>${roleConfig.badge}</span> <span style="font-weight:400;opacity:0.8">| ${window.authUser ? window.authUser.name : 'Dr. K. Swaminathan'}</span>`;
    userPill.style.color = roleConfig.color;
  }
  if (sidebarAlertBadge && data.action_alerts) {
    sidebarAlertBadge.textContent = data.action_alerts.length;
  }
}

// ── Sub-view Switcher with Progressive Disclosure ────────────
function switchB2BSubview(subviewId) {
  currentB2BSubview = subviewId;

  // Update tabs in top subnav bar
  document.querySelectorAll('.b2b-subnav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.subview === subviewId);
  });

  // Update enterprise sidebar links
  document.querySelectorAll('#b2b-nav-items .nav-link').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.b2bSubview === subviewId);
  });

  // Show only selected subview
  document.querySelectorAll('.b2b-subview').forEach(view => {
    view.classList.toggle('active', view.id === `b2b-subview-${subviewId}`);
  });

  // Scroll to top
  const mainEl = document.querySelector('.main');
  if (mainEl) mainEl.scrollTop = 0;
}
window.switchB2BSubview = switchB2BSubview;

// ── Role Permissions Filter ──────────────────────────────────
function applyRolePermissions() {
  const curRole = (window.authUser && window.authUser.role) || 'fpo_admin';
  const roleConfig = ROLE_PERMISSIONS[curRole] || ROLE_PERMISSIONS.fpo_admin;
  const allowed = roleConfig.allowed_subviews;

  // Filter enterprise sidebar nav items
  document.querySelectorAll('#b2b-nav-items .nav-link[data-b2b-subview]').forEach(item => {
    const subview = item.dataset.b2bSubview;
    item.style.display = allowed.includes(subview) ? 'flex' : 'none';
  });

  // Filter top subnav bar items
  document.querySelectorAll('.b2b-subnav-item[data-subview]').forEach(item => {
    const subview = item.dataset.subview;
    item.style.display = allowed.includes(subview) ? 'inline-flex' : 'none';
  });

  // If current subview is not allowed for this role, auto-switch to first allowed
  if (!allowed.includes(currentB2BSubview)) {
    switchB2BSubview(allowed[0] || 'overview');
  }
}

// ── Populate Org Dropdown ───────────────────────────────────
function populateOrgSelector(orgs) {
  const sel = document.getElementById('b2b-org-select');
  if (!sel) return;
  sel.innerHTML = orgs.map(o => `
    <option value="${o.org_id}" ${o.org_id === currentOrgId ? 'selected' : ''}>
      ${o.type === 'FPO' ? '🏢' : o.type === 'Dairy Cooperative' ? '🥛' : '🏭'} ${o.name} (${o.total_registered_farmers} farmers · ${o.total_cultivated_acres} ac)
    </option>
  `).join('');
}

// ────────────────────────────────────────────────────────────
// SUB-VIEW 1: COMMAND CENTER OVERVIEW (HOME)
// ────────────────────────────────────────────────────────────
function renderB2BOverview(data) {
  if (!data) return;
  const { metrics, soil_health_distribution: sh, crop_distribution: crops, iot_fleet, villages, action_alerts } = data;

  // KPIs
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('b2b-stat-farmers', metrics.total_farmers.toLocaleString());
  setEl('b2b-stat-farms', metrics.total_farms.toLocaleString());
  setEl('b2b-stat-acres', `${metrics.total_area_acres.toLocaleString()} ac`);
  setEl('b2b-stat-clusters', `${metrics.active_clusters} Geographic Clusters`);
  setEl('b2b-stat-alerts', `${metrics.critical_alerts} Critical Alerts`);

  const iotEl = document.getElementById('b2b-stat-iot');
  if (iotEl) {
    iotEl.innerHTML = `${iot_fleet.online} <span style="font-size:14px;color:#86efac;font-weight:400">/ ${iot_fleet.total_devices} Online</span>`;
  }

  // Regional Soil Health Card
  setEl('b2b-soil-score', sh.average_health_score);
  const barH = document.getElementById('b2b-bar-healthy');
  const barM = document.getElementById('b2b-bar-mod');
  const barP = document.getElementById('b2b-bar-poor');
  if (barH) { barH.style.width = `${sh.healthy_pct}%`; barH.textContent = `${sh.healthy_pct}%`; }
  if (barM) { barM.style.width = `${sh.moderate_pct}%`; barM.textContent = `${sh.moderate_pct}%`; }
  if (barP) { barP.style.width = `${sh.poor_pct}%`; barP.textContent = `${sh.poor_pct}%`; }

  const defContainer = document.getElementById('b2b-deficiencies-list');
  if (defContainer && sh.primary_deficiencies) {
    defContainer.innerHTML = sh.primary_deficiencies.map(d => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:12.5px">
        <span style="color:var(--text-secondary);display:flex;align-items:center;gap:6px">
          <span style="color:${d.affected_farms_pct >= 20 ? '#f87171' : '#fbbf24'}">●</span> ${d.nutrient}
        </span>
        <b style="color:${d.affected_farms_pct >= 20 ? '#f87171' : '#fbbf24'}">${d.affected_farms} farms (${d.affected_farms_pct}%)</b>
      </div>
    `).join('');
  }

  // Crop Distribution Table & Chart
  const cropTbody = document.getElementById('b2b-crops-tbody');
  if (cropTbody && crops) {
    cropTbody.innerHTML = crops.slice(0, 5).map(c => `
      <tr>
        <td style="font-weight:600;display:flex;align-items:center;gap:6px">
          <span>${window.cropIcon ? window.cropIcon(c.crop.split(' ')[0]) : '🌱'}</span> ${c.crop}
        </td>
        <td><b style="color:#86efac">${c.percentage}%</b></td>
        <td>${c.acreage.toLocaleString()} ac</td>
        <td style="font-size:11px;color:var(--text-muted)">${c.expected_harvest_tons ? c.expected_harvest_tons.toLocaleString() + ' tons' : '—'}</td>
      </tr>
    `).join('');
  }

  const canvas = document.getElementById('b2b-crop-chart');
  if (canvas && typeof Chart !== 'undefined' && crops) {
    const ctx = canvas.getContext('2d');
    if (b2bCropChartInstance) b2bCropChartInstance.destroy();
    b2bCropChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: crops.map(c => c.crop),
        datasets: [{
          data: crops.map(c => c.percentage),
          backgroundColor: ['#22c55e', '#38bdf8', '#fbbf24', '#a855f7', '#f43f5e', '#6366f1', '#14b8a6'],
          borderWidth: 2,
          borderColor: '#0f172a'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 10, color: '#94a3b8', font: { size: 11 } } }
        },
        cutout: '65%'
      }
    });
  }

  // Cluster Performance Mini Table
  const clusterTbody = document.getElementById('b2b-clusters-perf-tbody');
  if (clusterTbody && villages) {
    clusterTbody.innerHTML = villages.slice(0, 5).map(v => `
      <tr style="cursor:pointer" onclick="filterByCluster('${v.name}')">
        <td style="font-weight:700;color:var(--text-primary)">📍 ${v.name}</td>
        <td>${v.farms || v.farmer_count || 120}</td>
        <td>${v.acreage.toLocaleString()} ac</td>
        <td>
          <span style="font-weight:700;color:${v.soil_score >= 75 ? '#86efac' : v.soil_score >= 60 ? '#fbbf24' : '#f87171'}">
            ${v.soil_score || 72}/100
          </span>
        </td>
        <td>
          <button class="btn btn-secondary" style="font-size:10.5px;padding:3px 8px" onclick="event.stopPropagation(); filterByCluster('${v.name}')">
            View Farms →
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Action Center Preview
  const actionContainer = document.getElementById('b2b-action-preview-container');
  if (actionContainer && action_alerts) {
    actionContainer.innerHTML = action_alerts.slice(0, 3).map(a => {
      const isCritical = a.level === 'CRITICAL' || a.level === 'DANGER';
      const isWarn = a.level === 'WARNING';
      const borderCol = isCritical ? '#ef4444' : isWarn ? '#f59e0b' : '#38bdf8';
      const icon = isCritical ? '🔴' : isWarn ? '🟠' : '🟡';
      return `
        <div class="b2b-action-card ${isCritical ? 'critical' : isWarn ? 'warning' : 'attention'}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-weight:700;font-size:13px;color:var(--text-primary)">${icon} ${a.level}: ${a.title}</span>
            <span class="chip" style="font-size:10px;background:rgba(255,255,255,0.08);color:${borderCol}">${a.count} farms</span>
          </div>
          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">
            Directive: <b>${a.recommended_action}</b>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-secondary" style="font-size:11px;padding:4px 10px" onclick="switchB2BSubview('farms')">
              🔍 View Farms
            </button>
            <button class="btn btn-primary" style="font-size:11px;padding:4px 10px" onclick="openCreateAdvisoryModal({ title: '${a.title}', target: '${a.cluster || 'Sulur Cluster'}' })">
              📢 Create Advisory
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ────────────────────────────────────────────────────────────
// SUB-VIEW 2: MEMBERS DIRECTORY (FARMERS & OFFICERS)
// ────────────────────────────────────────────────────────────
function renderB2BMembers(membersData) {
  if (!membersData) return;
  const { farmers: farmerList, officers: officerList } = membersData;

  const fTbody = document.getElementById('b2b-members-farmers-tbody');
  if (fTbody && farmerList) {
    fTbody.innerHTML = farmerList.map(f => `
      <tr>
        <td style="font-weight:600">
          <div style="color:var(--text-primary);font-size:13px">${f.name}</div>
          <div style="color:var(--text-muted);font-size:11px">Farmer ID #${f.farmer_id} · ${f.phone}</div>
        </td>
        <td>${f.cluster}</td>
        <td><b>${f.acres} ac</b></td>
        <td><span class="chip info" style="font-size:11px">${f.crops || 'Tomato'}</span></td>
        <td>
          <span style="font-weight:700;color:${(f.soil_score || 70) >= 75 ? '#86efac' : (f.soil_score || 70) >= 55 ? '#fbbf24' : '#f87171'}">
            ${f.soil_score || 70}/100
          </span>
        </td>
        <td><span class="status-badge online">Active</span></td>
        <td>
          <button class="btn btn-secondary" style="font-size:11px;padding:4px 10px" onclick="openFarmDrillDown(${f.farm_id || 101})">
            Inspect Farm
          </button>
        </td>
      </tr>
    `).join('');
  }

  const oTbody = document.getElementById('b2b-members-officers-tbody');
  if (oTbody && officerList) {
    oTbody.innerHTML = officerList.map(o => {
      const cfg = ROLE_PERMISSIONS[o.role] || ROLE_PERMISSIONS.field_officer;
      return `
        <tr>
          <td style="font-weight:600">
            <div style="color:var(--text-primary);font-size:13px">${o.name}</div>
            <div style="color:var(--text-muted);font-size:11px">${o.email} · ${o.phone}</div>
          </td>
          <td>
            <span class="chip" style="font-size:11px;background:rgba(255,255,255,0.06);color:${cfg.color};border:1px solid ${cfg.color}40">
              ${o.role_title}
            </span>
          </td>
          <td><span style="font-size:12px;color:var(--text-secondary)">${(o.assigned_clusters || []).join(', ')}</span></td>
          <td><span style="font-size:12px">${o.experience || '5+ yrs'}</span></td>
          <td><span class="status-badge online">${o.status}</span></td>
          <td>
            <button class="btn btn-secondary" style="font-size:11px;padding:4px 10px" onclick="openCreateTaskModal(null, null, '${o.name}')">
              Assign Task
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function switchMembersTab(tab) {
  const fTab = document.getElementById('tab-members-farmers');
  const oTab = document.getElementById('tab-members-officers');
  const fView = document.getElementById('members-view-farmers');
  const oView = document.getElementById('members-view-officers');

  if (fTab && oTab && fView && oView) {
    fTab.classList.toggle('active', tab === 'farmers');
    oTab.classList.toggle('active', tab === 'officers');
    fView.style.display = tab === 'farmers' ? 'block' : 'none';
    oView.style.display = tab === 'officers' ? 'block' : 'none';
  }
}
window.switchMembersTab = switchMembersTab;

// ────────────────────────────────────────────────────────────
// SUB-VIEW 3: CLUSTERS MANAGEMENT
// ────────────────────────────────────────────────────────────
function renderB2BClusters(clusters) {
  const grid = document.getElementById('b2b-clusters-grid');
  if (!grid || !clusters) return;

  grid.innerHTML = clusters.map(c => `
    <div class="b2b-cluster-card" onclick="filterByCluster('${c.name}')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <div>
          <div style="font-size:11px;color:#c084fc;font-weight:700">${c.cluster_id}</div>
          <h4 style="margin:2px 0 0;font-size:15px;color:var(--text-primary)">📍 ${c.name}</h4>
          <div style="font-size:11px;color:var(--text-muted)">${c.location}</div>
        </div>
        <span class="chip" style="font-size:11px;background:${c.alerts > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'};color:${c.alerts > 0 ? '#fca5a5' : '#86efac'}">
          ${c.alerts > 0 ? `${c.alerts} Alerts` : 'Optimal'}
        </span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0;background:rgba(0,0,0,0.25);padding:10px;border-radius:6px">
        <div>
          <div style="font-size:10px;color:var(--text-muted)">MANAGED FARMS</div>
          <div style="font-size:16px;font-weight:700;color:var(--text-primary)">${c.farms}</div>
        </div>
        <div>
          <div style="font-size:10px;color:var(--text-muted)">ACREAGE</div>
          <div style="font-size:16px;font-weight:700;color:#38bdf8">${c.acreage.toLocaleString()} ac</div>
        </div>
        <div>
          <div style="font-size:10px;color:var(--text-muted)">SOIL HEALTH</div>
          <div style="font-size:16px;font-weight:700;color:${c.soil_score >= 75 ? '#86efac' : c.soil_score >= 60 ? '#fbbf24' : '#f87171'}">${c.soil_score}/100</div>
        </div>
        <div>
          <div style="font-size:10px;color:var(--text-muted)">IOT NODES</div>
          <div style="font-size:16px;font-weight:700;color:#86efac">${c.iot_online}/${c.iot_total}</div>
        </div>
      </div>

      <div style="font-size:11.5px;color:var(--text-secondary);margin-bottom:8px">
        Primary Crops: <b>${(c.main_crops || []).join(', ')}</b>
      </div>
      <div style="font-size:11px;color:var(--text-muted);display:flex;justify-content:space-between;align-items:center">
        <span>Officer: <b>${c.officer || 'Anand Kumar'}</b></span>
        <span style="color:#c084fc;font-weight:600">Filter Farms →</span>
      </div>
    </div>
  `).join('');
}

function filterByCluster(clusterName) {
  activeClusterFilter = clusterName;
  switchB2BSubview('farms');
  const sel = document.getElementById('b2b-farms-cluster-filter');
  if (sel) sel.value = clusterName;
  applyFarmsFilter();
}
window.filterByCluster = filterByCluster;

// ────────────────────────────────────────────────────────────
// SUB-VIEW 4: FARMS DIRECTORY & MULTI-FARM MANAGEMENT
// ────────────────────────────────────────────────────────────
function renderB2BFarms(farmsList) {
  const tbody = document.getElementById('b2b-all-farms-tbody');
  const countEl = document.getElementById('b2b-farms-count-badge');
  if (!tbody) return;

  if (countEl) countEl.textContent = `${farmsList.length} Farms`;

  if (!farmsList || farmsList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted)">No member farms match criteria</td></tr>`;
    return;
  }

  tbody.innerHTML = farmsList.map(f => {
    const soilScore = f.soil_score || 70;
    const scoreColor = soilScore >= 75 ? '#86efac' : soilScore >= 55 ? '#fbbf24' : '#f87171';
    const isOnline = f.iot_status === 'Online';

    return `
      <tr>
        <td style="font-weight:600">
          <div style="font-size:13px;color:var(--text-primary)">${f.farmer_name}</div>
          <div style="font-size:11px;color:var(--text-muted)">Farm #${f.farm_id} · ${f.farm_name || ''}</div>
        </td>
        <td style="font-size:12px;color:var(--text-secondary)">
          <div>📍 ${f.cluster || 'Sulur Cluster'}</div>
          <div style="font-size:11px;color:var(--text-muted)">${f.location || ''}</div>
        </td>
        <td><b>${f.acres} ac</b></td>
        <td><span class="chip info" style="font-size:11px">${f.current_crop}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-family:'Outfit',sans-serif;font-weight:700;color:${scoreColor}">${soilScore}</span>
            <span class="chip" style="font-size:10px;background:rgba(255,255,255,0.06);color:${scoreColor}">
              ${soilScore >= 75 ? 'Healthy' : soilScore >= 55 ? 'Moderate' : 'Deficient'}
            </span>
          </div>
        </td>
        <td>
          <span class="status-badge ${isOnline ? 'online' : 'offline'}">
            <span style="width:6px;height:6px;border-radius:50%;background:${isOnline ? '#22c55e' : '#ef4444'}"></span>
            ${f.iot_status}
          </span>
        </td>
        <td>
          ${f.alerts_count > 0 ? `<span class="chip danger" style="font-size:10px">${f.alerts_count} Alert</span>` : '<span style="font-size:11px;color:var(--text-muted)">None</span>'}
        </td>
        <td>
          <button class="btn btn-secondary" style="font-size:11px;padding:4px 12px" onclick="openFarmDrillDown(${f.farm_id})">
            🔍 Inspect
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function applyFarmsFilter() {
  const clusterVal = document.getElementById('b2b-farms-cluster-filter')?.value || 'all';
  const cropVal = document.getElementById('b2b-farms-crop-filter')?.value || 'all';
  const statusVal = document.getElementById('b2b-farms-status-filter')?.value || 'all';
  const searchVal = (document.getElementById('b2b-farms-search-input')?.value || '').toLowerCase().trim();

  let filtered = [...currentOrgFarms];

  if (clusterVal !== 'all') {
    filtered = filtered.filter(f => (f.cluster && f.cluster.toLowerCase().includes(clusterVal.toLowerCase())) || (f.location && f.location.toLowerCase().includes(clusterVal.toLowerCase())));
  }
  if (cropVal !== 'all') {
    filtered = filtered.filter(f => f.current_crop && f.current_crop.toLowerCase() === cropVal.toLowerCase());
  }
  if (statusVal === 'healthy') filtered = filtered.filter(f => f.soil_score >= 75);
  else if (statusVal === 'moderate') filtered = filtered.filter(f => f.soil_score >= 50 && f.soil_score < 75);
  else if (statusVal === 'poor') filtered = filtered.filter(f => f.soil_score < 50);
  else if (statusVal === 'offline') filtered = filtered.filter(f => f.iot_status === 'Offline');

  if (searchVal) {
    filtered = filtered.filter(f =>
      f.farmer_name.toLowerCase().includes(searchVal) ||
      String(f.farm_id).includes(searchVal) ||
      (f.current_crop && f.current_crop.toLowerCase().includes(searchVal)) ||
      (f.location && f.location.toLowerCase().includes(searchVal))
    );
  }

  renderB2BFarms(filtered);
}
window.applyFarmsFilter = applyFarmsFilter;

// ────────────────────────────────────────────────────────────
// SUB-VIEW 5: SOIL INTELLIGENCE MODULE
// ────────────────────────────────────────────────────────────
function renderB2BSoilIntelligence(soilData) {
  if (!soilData) return;
  const { regional_map: mapData, nutrient_deficiencies: defs, actionable_interventions: intervs } = soilData;

  // Regional Map Matrix
  const mapGrid = document.getElementById('b2b-soil-regional-map');
  if (mapGrid && mapData) {
    mapGrid.innerHTML = mapData.map(c => `
      <div class="b2b-cluster-card" style="border-left:4px solid ${c.status === 'Healthy' ? '#22c55e' : c.status === 'Moderate' ? '#f59e0b' : '#ef4444'}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <b style="font-size:14px;color:var(--text-primary)">📍 ${c.name}</b>
          <span class="chip" style="font-size:10px;background:rgba(255,255,255,0.06);color:${c.status === 'Healthy' ? '#86efac' : c.status === 'Moderate' ? '#fbbf24' : '#f87171'}">${c.status}</span>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">${c.location} · ${c.farms_count} farms</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:11px;color:var(--text-muted)">Cluster Score</span>
          <span style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;color:${c.soil_score >= 75 ? '#86efac' : c.soil_score >= 60 ? '#fbbf24' : '#f87171'}">${c.soil_score}/100</span>
        </div>
        <div style="font-size:11.5px;color:${c.soil_score < 60 ? '#f87171' : 'var(--text-secondary)'};padding-top:6px;border-top:1px solid rgba(255,255,255,0.06)">
          Flag: <b>${c.primary_deficiency}</b>
        </div>
        <button class="btn btn-secondary" style="font-size:10.5px;width:100%;margin-top:8px;padding:4px" onclick="filterByCluster('${c.name}')">
          View Affected Farms (${c.farms_count})
        </button>
      </div>
    `).join('');
  }

  // Interventions List
  const intervBox = document.getElementById('b2b-soil-interventions-list');
  if (intervBox && intervs) {
    intervBox.innerHTML = intervs.map(it => `
      <div style="background:rgba(30,41,59,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px 14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <b style="font-size:13px;color:#86efac">🌱 ${it.deficiency}</b>
          <span style="font-size:11px;color:var(--text-muted)">Target: ${(it.target_clusters || []).join(', ')}</span>
        </div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">
          Protocol: <b>${it.recommended_input}</b>
        </div>
        <button class="btn btn-primary" style="font-size:11px;padding:4px 10px" onclick="openCreateAdvisoryModal({ title: 'Soil Remediation: ${it.deficiency}', target: '${(it.target_clusters || [])[0] || 'Sulur Cluster'}' })">
          📢 Broadcast Fertilizer Protocol
        </button>
      </div>
    `).join('');
  }
}

// ────────────────────────────────────────────────────────────
// SUB-VIEW 6: CROP INTELLIGENCE & PRODUCTION MODULE
// ────────────────────────────────────────────────────────────
function renderB2BCropIntelligence(cropData, prodData) {
  if (!cropData) return;
  const { top_crops_by_acreage: topCrops, growth_stages: stages, restorative_rotation_demand: rot } = cropData;

  // Stages Breakdown
  const stageBox = document.getElementById('b2b-crop-growth-stages-list');
  if (stageBox && stages) {
    stageBox.innerHTML = stages.map(s => `
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
          <span style="color:var(--text-secondary)">${s.stage}</span>
          <span><b>${s.acres.toLocaleString()} ac</b> (${s.percentage}%)</span>
        </div>
        <div style="height:8px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden">
          <div style="width:${s.percentage}%;height:100%;background:linear-gradient(90deg,#22c55e,#38bdf8)"></div>
        </div>
      </div>
    `).join('');
  }

  // Procurement & Aggregation Table
  const prodTbody = document.getElementById('b2b-procurement-tbody');
  if (prodTbody && prodData && prodData.procurement_schedule) {
    prodTbody.innerHTML = prodData.procurement_schedule.map(p => `
      <tr>
        <td style="font-weight:600;color:var(--text-primary)">${p.window}</td>
        <td>${p.crops.join(', ')}</td>
        <td><b style="color:#86efac">${p.expected_tons.toLocaleString()} tons</b></td>
        <td style="font-size:12px;color:var(--text-secondary)">${p.warehouse}</td>
      </tr>
    `).join('');
  }

  // Buyer Agreements Table
  const buyerTbody = document.getElementById('b2b-buyers-tbody');
  if (buyerTbody && prodData && prodData.buyer_agreements) {
    buyerTbody.innerHTML = prodData.buyer_agreements.map(b => `
      <tr>
        <td style="font-weight:600;color:var(--text-primary)">${b.buyer}</td>
        <td>${b.crop}</td>
        <td><b>${b.committed_tons.toLocaleString()} tons</b></td>
        <td>₹${(b.price_per_quintal_inr || b.price_per_ton_inr).toLocaleString()}</td>
        <td><span class="status-badge online">${b.status}</span></td>
      </tr>
    `).join('');
  }
}

// ────────────────────────────────────────────────────────────
// SUB-VIEW 7: IOT FLEET COMMAND MODULE
// ────────────────────────────────────────────────────────────
function renderB2BIoTFleet(sensorsData, dashData) {
  if (!sensorsData || !dashData) return;
  const { fleet_metrics: fleet, device_breakdown: breakdown, devices } = sensorsData;

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('b2b-iot-total-count', fleet.total_devices);
  setEl('b2b-iot-online-count', fleet.online);
  setEl('b2b-iot-offline-count', fleet.offline);
  setEl('b2b-iot-maint-count', fleet.maintenance || 8);

  const uptime = Math.round((fleet.online / (fleet.total_devices || 1)) * 100);
  setEl('b2b-iot-uptime-rate', `${uptime}%`);

  const devTbody = document.getElementById('b2b-devices-tbody');
  if (devTbody && devices) {
    devTbody.innerHTML = devices.map(d => {
      const isOnline = d.status === 'Online';
      const isOffline = d.status === 'Offline';
      return `
        <tr>
          <td style="font-weight:700;color:var(--text-primary)">
            <code>${d.device_id}</code>
          </td>
          <td>
            <div style="font-size:12.5px;color:var(--text-primary)">${d.farmer_name}</div>
            <div style="font-size:11px;color:var(--text-muted)">Farm #${d.farm_id} · ${d.cluster}</div>
          </td>
          <td style="font-size:12px;color:var(--text-secondary)">${d.device_type}</td>
          <td>
            <span class="status-badge ${isOnline ? 'online' : isOffline ? 'offline' : 'maint'}">
              ${d.status}
            </span>
          </td>
          <td style="font-size:12px">${d.last_data}</td>
          <td>
            <span style="font-weight:700;color:${d.battery > 50 ? '#86efac' : d.battery > 20 ? '#fbbf24' : '#f87171'}">
              ${d.battery}%
            </span>
          </td>
          <td><code style="font-size:11px;color:var(--text-muted)">${d.signal_rssi} dBm</code></td>
          <td>
            <button class="btn btn-secondary" style="font-size:10.5px;padding:3px 8px" onclick="pingDevice('${d.device_id}')">
              📡 Ping Node
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function pingDevice(deviceId) {
  alert(`📡 PING INITIATED to Node [${deviceId}]:\n\n✓ Gateway ACK: 142ms\n✓ Signal RSSI: -68 dBm (Strong)\n✓ Telemetry Payload: Valid (7 Parameters)\n✓ Node Health: Operational`);
}
window.pingDevice = pingDevice;

// ── Real-Time Sensor Telemetry Packet Injection ─────────────
async function pushLiveSensorTelemetry(farmId = 101) {
  try {
    const reading = {
      farm_id: farmId,
      device_id: `ESP32-SOIL-${farmId}`,
      nitrogen: Math.floor(45 + Math.random() * 55),
      phosphorus: Math.floor(25 + Math.random() * 35),
      potassium: Math.floor(55 + Math.random() * 50),
      ph: parseFloat((6.4 + Math.random() * 0.8).toFixed(1)),
      organic_carbon: parseFloat((0.65 + Math.random() * 0.35).toFixed(2)),
      soil_moisture: Math.floor(45 + Math.random() * 30),
      air_temperature: parseFloat((27 + Math.random() * 3).toFixed(1)),
      air_humidity: Math.floor(62 + Math.random() * 15)
    };

    const res = await apiPost(`/orgs/${currentOrgId}/sensors/simulate-reading`, reading);
    alert(`📡 Live ESP32 Hardware Packet Received!\n\n` +
          `• Node: ${reading.device_id} (Farm #${farmId})\n` +
          `• Telemetry: ${reading.nitrogen}N : ${reading.phosphorus}P : ${reading.potassium}K kg/ha\n` +
          `• Soil pH: ${reading.ph} | Organic Carbon: ${reading.organic_carbon}%\n` +
          `• Soil Moisture: ${reading.soil_moisture}% | Ambient Temp: ${reading.air_temperature}°C\n` +
          `• Instant Health Score: ${res.reading.soil_health_score} / 100\n\n` +
          `✓ Telemetry stream synced in real-time.`);
    await fetchOrgData(currentOrgId);
  } catch (err) {
    alert('Live telemetry push error: ' + err.message);
  }
}
window.pushLiveSensorTelemetry = pushLiveSensorTelemetry;

// ────────────────────────────────────────────────────────────
// SUB-VIEW 8: INTEGRATED FARMING SYSTEM (IFS)
// ────────────────────────────────────────────────────────────
function renderB2BIFS(ifsData) {
  if (!ifsData) return;
  const { fodder_availability: fa, silage_reserve: sr, manure_and_soil_restoration: mr } = ifsData;

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('b2b-ifs-fodder-yield', `${fa.total_monthly_fodder_yield_tons.toLocaleString()} Tons`);
  setEl('b2b-ifs-dairy-demand', `${fa.dairy_demand_tons.toLocaleString()} Tons`);
  setEl('b2b-ifs-silage-batches', sr.total_batches_tested);
  setEl('b2b-ifs-fym-return', `${mr.estimated_fym_produced_monthly_tons.toLocaleString()} Tons / mo`);
  setEl('b2b-ifs-oc-projection', `+${mr.organic_carbon_gain_projected_pct}% OC / year`);
}

// ────────────────────────────────────────────────────────────
// SUB-VIEW 9: ACTION CENTER
// ────────────────────────────────────────────────────────────
function renderB2BActionCenter(alertsList) {
  const container = document.getElementById('b2b-full-alerts-container');
  if (!container || !alertsList) return;

  container.innerHTML = alertsList.map(a => {
    const isCritical = a.level === 'CRITICAL';
    const isWarning = a.level === 'WARNING';
    const isResolved = a.status === 'Resolved';
    const borderCol = isResolved ? '#64748b' : isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#38bdf8';

    return `
      <div class="b2b-action-card ${isCritical ? 'critical' : isWarning ? 'warning' : 'attention'}" style="${isResolved ? 'opacity:0.6;border-left-color:#64748b' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <div>
            <span class="chip" style="font-size:10px;background:rgba(255,255,255,0.08);color:${borderCol};margin-right:8px">${a.level}</span>
            <b style="font-size:14px;color:var(--text-primary)">${a.title}</b>
          </div>
          <span style="font-size:12px;color:var(--text-muted)">Affected: <b>${a.affected_count} farms</b> · ${a.cluster || 'Sulur'}</span>
        </div>
        <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:10px">
          Action Protocol: <b>${a.recommended_action}</b>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary" style="font-size:11px;padding:4px 10px" onclick="filterByCluster('${a.cluster || 'Sulur'}')">
              🔍 Inspect Affected Farms
            </button>
            <button class="btn btn-primary" style="font-size:11px;padding:4px 10px" onclick="openCreateAdvisoryModal({ title: '${a.title}', target: '${a.cluster || 'Sulur'}' })">
              📢 Dispatch Advisory
            </button>
          </div>
          ${!isResolved ? `
            <button class="btn btn-secondary" style="font-size:11px;padding:4px 10px;color:#86efac;border-color:#22c55e40" onclick="resolveAlert('${a.alert_id}')">
              ✓ Mark Resolved
            </button>
          ` : '<span style="font-size:12px;color:#86efac">✓ Resolved</span>'}
        </div>
      </div>
    `;
  }).join('');
}

async function resolveAlert(alertId) {
  try {
    const res = await apiPost(`/orgs/${currentOrgId}/alerts/${alertId}/resolve`, { resolved_by: window.authUser ? window.authUser.name : 'Dr. K. Swaminathan (CEO)' });
    alert(`✅ Alert [${alertId}] marked as RESOLVED by ${res.alert?.resolved_by || 'Administrator'}.`);
    await fetchOrgData(currentOrgId);
  } catch (err) {
    alert('Error resolving alert: ' + err.message);
  }
}
window.resolveAlert = resolveAlert;

// ────────────────────────────────────────────────────────────
// SUB-VIEW 10: ADVISORIES SYSTEM
// ────────────────────────────────────────────────────────────
function renderB2BAdvisories(advList) {
  const container = document.getElementById('b2b-sent-advisories-list');
  if (!container || !advList) return;

  container.innerHTML = advList.map(a => `
    <div style="background:rgba(30,41,59,0.7);border:1px solid rgba(255,255,255,0.08);border-radius:var(--radius-md);padding:16px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <div>
          <span style="font-size:10px;color:#c084fc;font-weight:700">${a.advisory_id}</span>
          <h4 style="margin:2px 0 0;font-size:14px;color:var(--text-primary)">${a.title}</h4>
          <div style="font-size:11px;color:var(--text-muted)">Author: ${a.author} · ${new Date(a.created_at).toLocaleDateString()}</div>
        </div>
        <span class="chip info" style="font-size:11px">${a.category}</span>
      </div>
      <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.5;margin-bottom:12px">
        "${a.message}"
      </p>
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06);font-size:11.5px;color:var(--text-muted);flex-wrap:wrap;gap:8px">
        <div>Target: <b style="color:var(--text-primary)">${a.target_name} (${a.affected_count} farmers)</b></div>
        <div>Channels: <b style="color:#86efac">${(a.channels || []).join(' · ')}</b></div>
        <div>Delivery: <b style="color:#38bdf8">${a.read_count || a.affected_count}/${a.affected_count} Read</b> · <b style="color:#86efac">${a.acknowledged_count || 18} Ack</b></div>
      </div>
    </div>
  `).join('');
}

function openCreateAdvisoryModal(prefill = {}) {
  const modal = document.getElementById('b2b-advisory-modal');
  if (!modal) return;
  modal.style.display = 'flex';

  if (prefill.title) document.getElementById('adv-input-title').value = prefill.title;
  if (prefill.target) document.getElementById('adv-input-target-name').value = prefill.target;
}
window.openCreateAdvisoryModal = openCreateAdvisoryModal;

function closeCreateAdvisoryModal() {
  const modal = document.getElementById('b2b-advisory-modal');
  if (modal) modal.style.display = 'none';
}
window.closeCreateAdvisoryModal = closeCreateAdvisoryModal;

async function submitCreateAdvisory(e) {
  e.preventDefault();
  const title = document.getElementById('adv-input-title').value.trim();
  const category = document.getElementById('adv-input-category').value;
  const target_type = document.getElementById('adv-input-target-type').value;
  const target_name = document.getElementById('adv-input-target-name').value.trim();
  const message = document.getElementById('adv-input-message').value.trim();

  const channels = [];
  if (document.getElementById('adv-ch-inapp')?.checked) channels.push('In-App Notification');
  if (document.getElementById('adv-ch-sms')?.checked) channels.push('SMS');
  if (document.getElementById('adv-ch-wa')?.checked) channels.push('WhatsApp');
  if (document.getElementById('adv-ch-push')?.checked) channels.push('Push Notification');

  try {
    const res = await apiPost(`/orgs/${currentOrgId}/advisories`, {
      title, category, target_type, target_name, message, channels,
      author: window.authUser ? `${window.authUser.name} (${window.authUser.role})` : 'Dr. K. Swaminathan (FPO Admin)'
    });
    alert(`✅ Advisory Dispatched Successfully!\n\nMessage queued for ${target_name} via ${channels.join(', ')}.`);
    closeCreateAdvisoryModal();
    await fetchOrgData(currentOrgId);
  } catch (err) {
    alert('Error sending advisory: ' + err.message);
  }
}
window.submitCreateAdvisory = submitCreateAdvisory;

// ────────────────────────────────────────────────────────────
// SUB-VIEW 11: REPORTS & EXPORT
// ────────────────────────────────────────────────────────────
function renderB2BReports() {
  const meta = document.getElementById('b2b-reports-generated-time');
  if (meta) meta.textContent = `Live Aggregate · Generated ${new Date().toLocaleString()}`;
}

function exportFPOSummary(type = 'executive') {
  if (!currentOrgDashboard) return;
  const d = currentOrgDashboard;
  const text = `UZHAVU KAAPPAAN — B2B FPO ENTERPRISE INTELLIGENCE REPORT
=============================================================
Organization: ${d.name} (${d.type})
Region: ${d.region || 'Coimbatore Region, Tamil Nadu'}
Season: ${d.season || 'Kharif'} 2026
Generated: ${new Date().toLocaleString()}
-------------------------------------------------------------
EXECUTIVE KPIS:
- Total Registered Farmers: ${d.metrics.total_farmers}
- Managed Farms: ${d.metrics.total_farms}
- Total Cultivated Acreage: ${d.metrics.total_area_acres} Acres
- Average Farm Size: ${d.metrics.average_farm_size_acres} Acres
- Active Geographic Clusters: ${d.metrics.active_clusters}
- Critical Alerts Pending: ${d.metrics.critical_alerts}

REGIONAL SOIL HEALTH DISTRIBUTION:
- Mean Health Score: ${d.soil_health_distribution.average_health_score} / 100
- Healthy (75–100): ${d.soil_health_distribution.healthy_pct}%
- Moderate (50–74): ${d.soil_health_distribution.moderate_pct}%
- Poor (<50): ${d.soil_health_distribution.poor_pct}%

IOT FLEET ASSET STATUS:
- Total Nodes: ${d.iot_fleet.total_devices}
- Online: ${d.iot_fleet.online}
- Offline: ${d.iot_fleet.offline}
- Maintenance: ${d.iot_fleet.maintenance || 8}

LIVESTOCK SILAGE & INTEGRATED FARMING SYSTEM:
- Silage Batches Tested: ${d.dairyfeed_silage_telemetry.total_batches_tested}
- Active Pit Probes: ${d.dairyfeed_silage_telemetry.active_silage_probes}
- Monthly Fodder Yield Capacity: ${d.dairyfeed_silage_telemetry.estimated_monthly_fodder_yield_tons} Tons
- FYM Manure Soil Replenishment: ${d.dairyfeed_silage_telemetry.fym_manure_return_tons || 4800} Tons / mo
=============================================================
UZHAVU KAAPPAAN — Agriculture Intelligence & FPO Command Center
`;

  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${d.name.replace(/\s+/g, '_')}_FPO_Command_Report.txt`;
  a.click();
}
window.exportFPOSummary = exportFPOSummary;

// ────────────────────────────────────────────────────────────
// SUB-VIEW 12: ORGANIZATION SETTINGS
// ────────────────────────────────────────────────────────────
function renderB2BSettings(settingsData) {
  if (!settingsData) return;
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setVal('set-org-name', settingsData.name);
  setVal('set-org-region', settingsData.region);
  setVal('set-org-admin-name', settingsData.admin_name);
  setVal('set-org-admin-phone', settingsData.admin_phone);
  setVal('set-org-season', settingsData.season);
}

// ────────────────────────────────────────────────────────────
// INDIVIDUAL FARM DRILL-DOWN MODAL (4 TABS)
// Pattern: Organization -> Cluster -> Farm -> Farmer -> Field
// ────────────────────────────────────────────────────────────
async function openFarmDrillDown(farmId) {
  const modal = document.getElementById('b2b-farm-drilldown-modal');
  const body = document.getElementById('b2b-farm-drilldown-content');
  if (!modal || !body) return;

  modal.style.display = 'flex';
  body.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted)">Loading Farm #${farmId} telemetry & history…</div>`;

  try {
    const res = await apiGet(`/orgs/${currentOrgId}/farms/${farmId}`);
    const f = res;

    body.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:12px">
        <div>
          <div style="font-size:11px;color:#c084fc;font-weight:700">📍 ${f.cluster} · Farm #${f.farm_id}</div>
          <h2 style="margin:2px 0 0;font-size:20px;color:var(--text-primary)">${f.overview.farm_name}</h2>
          <div style="font-size:12px;color:var(--text-muted)">Farmer: <b style="color:var(--text-primary)">${f.farmer.name}</b> (${f.farmer.phone}) · ${f.overview.location}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" style="font-size:11px;padding:6px 12px" onclick="openCreateTaskModal(${f.farm_id}, '${f.farmer.name}', '${f.cluster}')">
            📋 Assign Field Task
          </button>
          <button class="btn btn-primary" style="font-size:11px;padding:6px 12px" onclick="openCreateAdvisoryModal({ title: 'Advisory for Farm #${f.farm_id}', target: 'Farmer ${f.farmer.name}' })">
            📢 Send Direct Advisory
          </button>
        </div>
      </div>

      <!-- Tab Buttons -->
      <div style="display:flex;gap:8px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:8px;margin-bottom:16px">
        <button class="b2b-tab-btn active" style="font-size:12px;padding:6px 12px" onclick="switchFarmTab('overview', this)">Overview & Land</button>
        <button class="b2b-tab-btn" style="font-size:12px;padding:6px 12px" onclick="switchFarmTab('soil', this)">Soil Health & NPK</button>
        <button class="b2b-tab-btn" style="font-size:12px;padding:6px 12px" onclick="switchFarmTab('crops', this)">Crops & Rotation</button>
        <button class="b2b-tab-btn" style="font-size:12px;padding:6px 12px" onclick="switchFarmTab('iot', this)">IoT Hardware Telemetry</button>
      </div>

      <!-- Tab 1: Overview -->
      <div id="farm-tab-overview" class="farm-tab-content">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:16px">
          <div style="background:rgba(30,41,59,0.7);padding:12px;border-radius:8px">
            <span style="font-size:11px;color:var(--text-muted)">LAND AREA</span>
            <div style="font-size:18px;font-weight:700;color:#38bdf8">${f.overview.acreage} Acres</div>
            <div style="font-size:11px;color:var(--text-muted)">${f.overview.irrigation} Irrigation</div>
          </div>
          <div style="background:rgba(30,41,59,0.7);padding:12px;border-radius:8px">
            <span style="font-size:11px;color:var(--text-muted)">SOIL HEALTH SCORE</span>
            <div style="font-size:18px;font-weight:700;color:${f.overview.soil_health_score >= 75 ? '#86efac' : '#fbbf24'}">${f.overview.soil_health_score} / 100</div>
            <div style="font-size:11px;color:var(--text-muted)">Status: ${f.overview.soil_health_score >= 75 ? 'Healthy' : 'Needs NPK Boost'}</div>
          </div>
          <div style="background:rgba(30,41,59,0.7);padding:12px;border-radius:8px">
            <span style="font-size:11px;color:var(--text-muted)">CURRENT CROP</span>
            <div style="font-size:18px;font-weight:700;color:#86efac">${f.overview.current_crop}</div>
            <div style="font-size:11px;color:var(--text-muted)">Kharif 2026 Cycle</div>
          </div>
          <div style="background:rgba(30,41,59,0.7);padding:12px;border-radius:8px">
            <span style="font-size:11px;color:var(--text-muted)">ASSIGNED OFFICER</span>
            <div style="font-size:18px;font-weight:700;color:#c084fc">${f.overview.field_officer}</div>
            <div style="font-size:11px;color:var(--text-muted)">Extension Contact</div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Soil -->
      <div id="farm-tab-soil" class="farm-tab-content" style="display:none">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:16px">
          <div style="background:rgba(30,41,59,0.7);padding:10px;border-radius:6px;text-align:center">
            <span style="font-size:11px;color:#818cf8">Nitrogen (N)</span>
            <div style="font-size:20px;font-weight:800;color:${f.soil_intelligence.latest.nitrogen < 50 ? '#f87171' : '#86efac'}">${f.soil_intelligence.latest.nitrogen}</div>
            <span style="font-size:10px;color:var(--text-muted)">kg/ha (Min: 120)</span>
          </div>
          <div style="background:rgba(30,41,59,0.7);padding:10px;border-radius:6px;text-align:center">
            <span style="font-size:11px;color:#c084fc">Phosphorus (P)</span>
            <div style="font-size:20px;font-weight:800;color:#86efac">${f.soil_intelligence.latest.phosphorus}</div>
            <span style="font-size:10px;color:var(--text-muted)">kg/ha</span>
          </div>
          <div style="background:rgba(30,41,59,0.7);padding:10px;border-radius:6px;text-align:center">
            <span style="font-size:11px;color:#fbbf24">Potassium (K)</span>
            <div style="font-size:20px;font-weight:800;color:#86efac">${f.soil_intelligence.latest.potassium}</div>
            <span style="font-size:10px;color:var(--text-muted)">kg/ha</span>
          </div>
          <div style="background:rgba(30,41,59,0.7);padding:10px;border-radius:6px;text-align:center">
            <span style="font-size:11px;color:#22d3ee">Soil pH</span>
            <div style="font-size:20px;font-weight:800;color:#86efac">${f.soil_intelligence.latest.ph}</div>
            <span style="font-size:10px;color:var(--text-muted)">Target: 6.5–7.5</span>
          </div>
          <div style="background:rgba(30,41,59,0.7);padding:10px;border-radius:6px;text-align:center">
            <span style="font-size:11px;color:#34d399">Org Carbon</span>
            <div style="font-size:20px;font-weight:800;color:#86efac">${f.soil_intelligence.latest.organic_carbon}%</div>
            <span style="font-size:10px;color:var(--text-muted)">Target: &gt;0.80%</span>
          </div>
        </div>
        <div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.3);border-radius:8px;padding:12px">
          <b style="font-size:12px;color:#c084fc">Agronomic Directive:</b>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">${f.soil_intelligence.fertilizer_recommendation}</div>
        </div>
      </div>

      <!-- Tab 3: Crops -->
      <div id="farm-tab-crops" class="farm-tab-content" style="display:none">
        <div style="background:rgba(30,41,59,0.7);padding:14px;border-radius:8px;margin-bottom:14px">
          <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px">Current Crop: ${f.crop_intelligence.current_crop}</div>
          <div style="font-size:12px;color:var(--text-secondary)">Growth Stage: <b style="color:#86efac">${f.crop_intelligence.growth_stage}</b></div>
          <div style="font-size:12px;color:var(--text-secondary)">Expected Harvest Date: <b style="color:#38bdf8">${f.crop_intelligence.expected_harvest}</b> · Estimated Yield: <b>${f.crop_intelligence.estimated_yield_tons} tons</b></div>
        </div>
        <h4 style="margin:0 0 8px;font-size:12px;color:var(--text-muted);text-transform:uppercase">Past Crop Rotation History</h4>
        <div class="table-responsive">
          <table class="data-table" style="font-size:12px">
            <thead><tr><th>Season</th><th>Crop</th><th>Yield</th><th>Profit Estimate</th></tr></thead>
            <tbody>
              ${(f.crop_intelligence.rotation_history || []).map(h => `
                <tr><td>${h.season_year}</td><td>${h.crop}</td><td>${h.yield} kg</td><td>₹${h.profit ? h.profit.toLocaleString() : '—'}</td></tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 4: IoT -->
      <div id="farm-tab-iot" class="farm-tab-content" style="display:none">
        <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(30,41,59,0.7);padding:12px 16px;border-radius:8px;margin-bottom:14px">
          <div>
            <div style="font-size:11px;color:var(--text-muted)">NODE HARDWARE</div>
            <div style="font-size:14px;font-weight:700;color:var(--text-primary)"><code>${f.iot_telemetry.device_id}</code> (${f.iot_telemetry.model})</div>
            <div style="font-size:11px;color:var(--text-muted)">Last Data: ${f.iot_telemetry.last_data} · Signal: ${f.iot_telemetry.signal_rssi} dBm</div>
          </div>
          <div style="text-align:right">
            <span class="status-badge ${f.iot_telemetry.status === 'Online' ? 'online' : 'offline'}">${f.iot_telemetry.status}</span>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Battery: <b>${f.iot_telemetry.battery_pct}%</b></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">
          <div style="background:rgba(0,0,0,0.25);padding:10px;border-radius:6px;text-align:center">
            <span style="font-size:10px;color:var(--text-muted)">SOIL MOISTURE</span>
            <div style="font-size:18px;font-weight:700;color:#38bdf8">${f.iot_telemetry.live_readings.soil_moisture_pct}%</div>
          </div>
          <div style="background:rgba(0,0,0,0.25);padding:10px;border-radius:6px;text-align:center">
            <span style="font-size:10px;color:var(--text-muted)">SOIL TEMP</span>
            <div style="font-size:18px;font-weight:700;color:#fbbf24">${f.iot_telemetry.live_readings.soil_temp_c}°C</div>
          </div>
          <div style="background:rgba(0,0,0,0.25);padding:10px;border-radius:6px;text-align:center">
            <span style="font-size:10px;color:var(--text-muted)">ELECTRICAL COND (EC)</span>
            <div style="font-size:18px;font-weight:700;color:#a855f7">${f.iot_telemetry.live_readings.ec_us_cm} µS/cm</div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    body.innerHTML = `<div style="text-align:center;padding:30px;color:#f87171">Failed to load farm details: ${err.message}</div>`;
  }
}
window.openFarmDrillDown = openFarmDrillDown;

function closeFarmDrillDown() {
  const modal = document.getElementById('b2b-farm-drilldown-modal');
  if (modal) modal.style.display = 'none';
}
window.closeFarmDrillDown = closeFarmDrillDown;

function switchFarmTab(tabName, btn) {
  document.querySelectorAll('.farm-tab-content').forEach(el => el.style.display = 'none');
  const target = document.getElementById(`farm-tab-${tabName}`);
  if (target) target.style.display = 'block';

  document.querySelectorAll('.b2b-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}
window.switchFarmTab = switchFarmTab;

// ────────────────────────────────────────────────────────────
// FIELD TASKS & INSPECTIONS MODAL
// ────────────────────────────────────────────────────────────
function openCreateTaskModal(farmId, farmerName, cluster) {
  const modal = document.getElementById('b2b-task-modal');
  if (!modal) return;
  modal.style.display = 'flex';

  if (farmId) document.getElementById('task-input-farm-id').value = farmId;
  if (farmerName) document.getElementById('task-input-title').value = `Field Inspection: Farm #${farmId} (${farmerName})`;
  if (cluster) document.getElementById('task-input-cluster').value = cluster;
}
window.openCreateTaskModal = openCreateTaskModal;

function closeCreateTaskModal() {
  const modal = document.getElementById('b2b-task-modal');
  if (modal) modal.style.display = 'none';
}
window.closeCreateTaskModal = closeCreateTaskModal;

async function submitCreateTask(e) {
  e.preventDefault();
  const farm_id = document.getElementById('task-input-farm-id').value;
  const title = document.getElementById('task-input-title').value.trim();
  const assigned_to = document.getElementById('task-input-officer').value;
  const type = document.getElementById('task-input-type').value;
  const due_date = document.getElementById('task-input-due-date').value;
  const notes = document.getElementById('task-input-notes').value.trim();

  try {
    const res = await apiPost(`/orgs/${currentOrgId}/tasks`, {
      farm_id, title, assigned_to, type, due_date, notes
    });
    alert(`✅ Task Successfully Dispatched!\n\nAssigned to ${assigned_to} for Farm #${farm_id}.\nDue: ${due_date}`);
    closeCreateTaskModal();
    await fetchOrgData(currentOrgId);
  } catch (err) {
    alert('Error assigning task: ' + err.message);
  }
}
window.submitCreateTask = submitCreateTask;

// ────────────────────────────────────────────────────────────
// QUICK ROLE & PERSONA SWITCHER MODAL (1-CLICK TESTER)
// ────────────────────────────────────────────────────────────
function openRoleSwitcherModal() {
  if (!window.isAdminUser || !window.isAdminUser()) {
    if (typeof showToast === 'function') {
      showToast('Role switcher is restricted to administrators', 'error');
    } else {
      alert('Role switcher is restricted to administrators');
    }
    return;
  }

  let modal = document.getElementById('b2b-role-switcher-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'b2b-role-switcher-modal';
    modal.className = 'b2b-modal-overlay';
    document.body.appendChild(modal);
  }

  const curRole = (window.authUser && window.authUser.role) || 'fpo_admin';

  modal.innerHTML = `
    <div class="b2b-modal-card" style="max-width:680px">
      <div class="b2b-modal-header">
        <div>
          <h3 style="margin:0;font-size:18px;color:var(--text-primary);display:flex;align-items:center;gap:8px">
            <span>🎭</span> Enterprise Role & Persona Switcher
          </h3>
          <p style="margin:2px 0 0;font-size:12px;color:var(--text-muted)">
            Select a verified persona to test separate logins, navigations, and permission boundaries
          </p>
        </div>
        <button class="auth-modal-close" onclick="closeRoleSwitcherModal()">✕</button>
      </div>

      <div class="persona-grid">
        <!-- 1. Farmer -->
        <button class="persona-card-btn ${curRole === 'farmer' ? 'active' : ''}" onclick="switchRole('farmer')">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <b style="color:#86efac;font-size:14px">🌾 Ramesh Kumar</b>
            <span class="chip" style="font-size:10px;background:rgba(34,197,94,0.15);color:#86efac">Farmer Platform</span>
          </div>
          <div style="font-size:12px;color:var(--text-primary)">Individual Farmer (Farm 101 · Coimbatore)</div>
          <div style="font-size:11px;color:var(--text-muted)">Access: Own farm, crops, soil sensor, silage plan. Cannot see other farms or FPO analytics.</div>
        </button>

        <!-- 2. FPO Admin -->
        <button class="persona-card-btn ${curRole === 'fpo_admin' ? 'active' : ''}" onclick="switchRole('fpo_admin')">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <b style="color:#c084fc;font-size:14px">🏢 Dr. K. Swaminathan</b>
            <span class="chip" style="font-size:10px;background:rgba(124,58,237,0.15);color:#c084fc">Full Admin / CEO</span>
          </div>
          <div style="font-size:12px;color:var(--text-primary)">FPO Administrator / CEO (Kovai FPO)</div>
          <div style="font-size:11px;color:var(--text-muted)">Access: Entire organization, all 18 clusters, 1,180 farms, IoT fleet, advisories, action center, reports.</div>
        </button>

        <!-- 3. FPO Manager -->
        <button class="persona-card-btn ${curRole === 'fpo_manager' ? 'active' : ''}" onclick="switchRole('fpo_manager')">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <b style="color:#38bdf8;font-size:14px">📋 P. Selvan</b>
            <span class="chip" style="font-size:10px;background:rgba(56,189,248,0.15);color:#38bdf8">Operations</span>
          </div>
          <div style="font-size:12px;color:var(--text-primary)">Operations Manager (Kovai FPO)</div>
          <div style="font-size:11px;color:var(--text-muted)">Access: Member farmers, clusters, crops, soil, reports, advisories dispatch.</div>
        </button>

        <!-- 4. Field Officer -->
        <button class="persona-card-btn ${curRole === 'field_officer' ? 'active' : ''}" onclick="switchRole('field_officer')">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <b style="color:#22c55e;font-size:14px">🚜 Anand Kumar</b>
            <span class="chip" style="font-size:10px;background:rgba(34,197,94,0.15);color:#86efac">Field Ops</span>
          </div>
          <div style="font-size:12px;color:var(--text-primary)">Senior Field Operations Officer</div>
          <div style="font-size:11px;color:var(--text-muted)">Access: Assigned Sulur & Pollachi clusters, field inspections, assigned tasks, farmer advisory.</div>
        </button>

        <!-- 5. Agronomist -->
        <button class="persona-card-btn ${curRole === 'agronomist' ? 'active' : ''}" onclick="switchRole('agronomist')">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <b style="color:#fbbf24;font-size:14px">🔬 Dr. Priya Balan</b>
            <span class="chip" style="font-size:10px;background:rgba(245,158,11,0.15);color:#fbbf24">Agronomy</span>
          </div>
          <div style="font-size:12px;color:var(--text-primary)">Lead Agronomist & Soil Specialist</div>
          <div style="font-size:11px;color:var(--text-muted)">Access: Soil intelligence, crop intelligence, regional deficiencies, restorative rotation plans.</div>
        </button>

        <!-- 6. IoT Technician -->
        <button class="persona-card-btn ${curRole === 'iot_technician' ? 'active' : ''}" onclick="switchRole('iot_technician')">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <b style="color:#06b6d4;font-size:14px">📡 Karthik Raja</b>
            <span class="chip" style="font-size:10px;background:rgba(6,182,212,0.15);color:#67e8f9">IoT Fleet</span>
          </div>
          <div style="font-size:12px;color:var(--text-primary)">IoT Telemetry & Systems Engineer</div>
          <div style="font-size:11px;color:var(--text-muted)">Access: 420 IoT nodes, sensor battery, offline devices, calibration, node ping.</div>
        </button>
      </div>

      <div style="margin-top:20px;text-align:right">
        <button class="btn btn-secondary" onclick="closeRoleSwitcherModal()">Cancel</button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}
window.openRoleSwitcherModal = openRoleSwitcherModal;

function closeRoleSwitcherModal() {
  const modal = document.getElementById('b2b-role-switcher-modal');
  if (modal) modal.style.display = 'none';
}
window.closeRoleSwitcherModal = closeRoleSwitcherModal;

async function switchRole(role) {
  try {
    const res = await apiPost('/auth/demo-login', { role });
    window.setAccessToken(res.access_token);
    window.authUser = res.user;

    closeRoleSwitcherModal();

    if (window.renderAccountWidget) window.renderAccountWidget();
    if (window.updateAdminVisibility) window.updateAdminVisibility();

    if (window.isAdminUser && window.isAdminUser()) {
      enterB2BPortal('overview');
      alert(`🏢 Switched to Admin / Enterprise Mode!\nLogged in as ${res.user.name} (${res.user.title || role}).`);
    } else {
      enterFarmerPortal();
      alert(`🌾 Switched to Farmer Platform!\nLogged in as ${res.user.name} (Farm #101). Admin & FPO options are hidden.`);
    }
  } catch (err) {
    alert('Failed to switch persona: ' + err.message);
  }
}
window.switchRole = switchRole;

console.log('🏢 UZHAVU KAAPPAAN — B2B FPO Command Center controller initialized.');

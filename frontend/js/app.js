// ============================================================
//  app.js — Router, API client, global state
// ============================================================

const API = window.BACKEND_API_URL || (
  (window.location.origin && window.location.origin !== 'null' && window.location.protocol.startsWith('http'))
    ? `${window.location.origin}/api`
    : 'http://localhost:3000/api'
);


window.state = {
  farm_id:    101,
  run_id:     null,
  soilData:   null,
  historyIssue: null,
  candidates: null,
  evaluation: null,
  plans:      null,
  simData:    null,
  recData:    null,
  dashboard:  null,
};

// ── Auth token (in-memory access token; refresh token lives in an
//    httpOnly cookie set by the server, never touched from JS) ──
let ACCESS_TOKEN = null;
function setAccessToken(t) { ACCESS_TOKEN = t; }
function getAccessToken()  { return ACCESS_TOKEN; }
window.setAccessToken = setAccessToken;
window.getAccessToken = getAccessToken;

// ── Admin Check & Visibility Control ─────────────────────────
function isAdminUser(user = window.authUser) {
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  return role === 'fpo_admin' || role === 'admin' || role === 'superadmin' || role.includes('admin') || user.is_admin === true;
}
window.isAdminUser = isAdminUser;

function updateAdminVisibility() {
  const isAdmin = isAdminUser();
  const adminSection = document.getElementById('sidebar-admin-section');
  const portalBtn = document.getElementById('btn-portal-switch');
  const roleBtn = document.getElementById('btn-role-switcher');
  const mbB2B = document.getElementById('mb-nav-b2b');
  const b2bHeaderRoleBtn = document.getElementById('btn-b2b-header-role-switch');

  if (adminSection) {
    adminSection.style.display = isAdmin ? 'block' : 'none';
  }
  if (portalBtn) {
    portalBtn.style.display = isAdmin ? 'flex' : 'none';
  }
  if (roleBtn) {
    roleBtn.style.display = isAdmin ? 'flex' : 'none';
  }
  if (mbB2B) {
    mbB2B.style.display = isAdmin ? 'flex' : 'none';
  }
  if (b2bHeaderRoleBtn) {
    b2bHeaderRoleBtn.style.display = isAdmin ? 'inline-flex' : 'none';
  }
}
window.updateAdminVisibility = updateAdminVisibility;

function authHeaders() {
  return ACCESS_TOKEN ? { 'Authorization': `Bearer ${ACCESS_TOKEN}` } : {};
}

// Attempts one silent refresh using the httpOnly refresh cookie.
// Returns true if a new access token was obtained.
let refreshInFlight = null;
async function trySilentRefresh() {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const res = await fetch(API + '/auth/refresh', { method: 'POST', credentials: 'same-origin' });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.access_token) {
        setAccessToken(data.access_token);
        if (window.onAuthRestored) window.onAuthRestored(data.user);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}
window.trySilentRefresh = trySilentRefresh;

// ── API Helpers ─────────────────────────────────────────────
async function apiGet(path, { retry = true } = {}) {
  const res = await fetch(API + path, { headers: authHeaders(), credentials: 'same-origin' });
  if (res.status === 401 && retry && !path.startsWith('/auth/')) {
    const refreshed = await trySilentRefresh();
    if (refreshed) return apiGet(path, { retry: false });
  }
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function apiPost(path, body, { retry = true } = {}) {
  const res = await fetch(API + path, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    credentials: 'same-origin',
    body:    JSON.stringify(body),
  });
  if (res.status === 401 && retry && !path.startsWith('/auth/')) {
    const refreshed = await trySilentRefresh();
    if (refreshed) return apiPost(path, body, { retry: false });
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const err = new Error(errBody.error || `API error ${res.status}: ${path}`);
    err.status = res.status;
    err.body = errBody;
    throw err;
  }
  return res.json();
}

window.apiGet  = apiGet;
window.apiPost = apiPost;

// ── Crop Icons Map (All 26 crops) ────────────────────────────
const CROP_ICONS = {
  'Tomato':      '🍅',
  'Green Gram':  '🫘',
  'Groundnut':   '🥜',
  'Maize':       '🌽',
  'Black Gram':  '🫘',
  'Blackgram':   '🫘',
  'Rice':        '🌾',
  'Soybean':     '🌱',
  'Sunflower':   '🌻',
  'Wheat':       '🌾',
  'Potato':      '🥔',
  'Sugarcane':   '🎋',
  'Apple':       '🍎',
  'Banana':      '🍌',
  'Chickpea':    '🫘',
  'Coconut':     '🥥',
  'Coffee':      '☕',
  'Cotton':      '☁️',
  'Grapes':      '🍇',
  'Jute':        '🌿',
  'Kidneybeans': '🫘',
  'Lentil':      '🥣',
  'Mango':       '🥭',
  'Mothbeans':   '🫘',
  'Mungbean':    '🫘',
  'Muskmelon':   '🍈',
  'Orange':      '🍊',
  'Papaya':      '🍈',
  'Pigeonpeas':  '🫘',
  'Pomegranate': '🪴',
  'Watermelon':  '🍉',
  'Default':     '🌱',
};
window.CROP_ICONS = CROP_ICONS;

function cropIcon(name) {
  return CROP_ICONS[name] || CROP_ICONS.Default;
}
window.cropIcon = cropIcon;

// ── Score Ring ───────────────────────────────────────────────
function animateRing(ringEl, score, color = '#22c55e') {
  const circle = ringEl.querySelector('.ring-fill');
  const label  = ringEl.querySelector('.ring-value');
  if (!circle || !label) return;

  const circumference = 2 * Math.PI * 40; // r=40
  circle.style.stroke = color;
  const offset = circumference - (score / 100) * circumference;

  // Animate number
  let current = 0;
  const step  = score / 60;
  const timer = setInterval(() => {
    current += step;
    if (current >= score) { current = score; clearInterval(timer); }
    label.textContent = Math.round(current);
    circle.style.strokeDashoffset = circumference - (current / 100) * circumference;
  }, 16);
}
window.animateRing = animateRing;

// ── Score bar helper ─────────────────────────────────────────
function scoreBar(value, label = '') {
  const color = value >= 75 ? 'var(--green-400)' : value >= 50 ? 'var(--amber-400)' : 'var(--red-400)';
  return `
    <div class="score-bar-wrap">
      <div class="score-bar-track">
        <div class="score-bar-fill" style="width:0%;background:${color}" data-target="${value}"></div>
      </div>
      <span class="score-bar-val" style="color:${color}">${value}</span>
    </div>`;
}
window.scoreBar = scoreBar;

function animateBars(container) {
  container.querySelectorAll('.score-bar-fill[data-target]').forEach(el => {
    const t = el.dataset.target;
    setTimeout(() => { el.style.width = t + '%'; }, 100);
  });
}
window.animateBars = animateBars;

// ── Chip helpers ─────────────────────────────────────────────
function chipDanger(text)  { return `<span class="chip danger">⚠ ${text}</span>`; }
function chipSuccess(text) { return `<span class="chip success">✓ ${text}</span>`; }
function chipInfo(text)    { return `<span class="chip info">◈ ${text}</span>`; }
function chipWarning(text) { return `<span class="chip warning">◉ ${text}</span>`; }
function chipTeal(text)    { return `<span class="chip teal">✦ ${text}</span>`; }

window.chipDanger  = chipDanger;
window.chipSuccess = chipSuccess;
window.chipInfo    = chipInfo;
window.chipWarning = chipWarning;
window.chipTeal    = chipTeal;

function nutrientChip(label, value) {
  return `<span class="sim-nutrient chip ns-${value}"><b>${label}</b> ${value}</span>`;
}
window.nutrientChip = nutrientChip;

// ── Router ───────────────────────────────────────────────────
const VIEW_LOADERS = {};

function navigate(viewId) {
  if (viewId === 'signup') {
    if (window.openAuthModal) window.openAuthModal('signup');
    return;
  }

  // Guard B2B view for admin only
  if (viewId === 'b2b' && !isAdminUser()) {
    const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
    const msg = isTa
      ? 'FPO கட்டுப்பாட்டு மைய அணுகல் நிர்வாகிகளுக்கு மட்டுமே அனுமதிக்கப்பட்டுள்ளது'
      : 'Access to FPO Command Center is restricted to administrators';
    if (typeof showToast === 'function') {
      showToast(msg, 'error');
    } else {
      alert(msg);
    }
    navigate('dashboard');
    return;
  }

  state.activeView = viewId;

  // Full-Screen mode toggle for Landing and Login portals
  if (viewId === 'landing' || viewId === 'login') {
    document.body.classList.add('mode-fullscreen');
  } else {
    document.body.classList.remove('mode-fullscreen');
  }

  // Sync B2B vs Farmer Portal layout
  const farmerNav = document.getElementById('farmer-nav-items');
  const b2bNav = document.getElementById('b2b-nav-items');
  const portalBtn = document.getElementById('btn-portal-switch');
  const sidebarChip = document.getElementById('sidebar-active-farm-chip');
  const sidebarOrgChip = document.getElementById('sidebar-active-org-chip');
  const isTaNav = (window.i18n && window.i18n.getLanguage() === 'ta');

  if (viewId === 'b2b') {
    if (farmerNav) farmerNav.style.display = 'none';
    if (b2bNav) b2bNav.style.display = 'block';
    if (portalBtn) {
      const switchFarmerText = isTaNav ? (window.t ? t('b2bSwitchToFarmer') : 'விவசாயி தளத்திற்கு மாறவும்') : 'Switch to Farmer Platform';
      portalBtn.innerHTML = `🌾 <span>${switchFarmerText}</span>`;
      portalBtn.onclick = () => window.enterFarmerPortal && window.enterFarmerPortal();
      portalBtn.style.color = '#86efac';
      portalBtn.style.borderColor = 'rgba(34,197,94,0.4)';
    }
    if (sidebarChip) sidebarChip.style.display = 'none';
    if (sidebarOrgChip) sidebarOrgChip.style.display = 'block';

    document.body.classList.add('portal-b2b');
    document.body.classList.remove('portal-farmer');
  } else if (viewId !== 'landing' && viewId !== 'login') {
    if (farmerNav) farmerNav.style.display = 'block';
    if (b2bNav) b2bNav.style.display = 'none';
    if (portalBtn) {
      const switchFpoText = isTaNav ? (window.t ? t('b2bSwitchToFPO') : 'FPO கட்டுப்பாட்டு மையத்திற்கு மாறவும்') : 'Switch to FPO Command Center';
      portalBtn.innerHTML = `🏢 <span>${switchFpoText}</span>`;
      portalBtn.onclick = () => window.enterB2BPortal && window.enterB2BPortal('overview');
      portalBtn.style.color = '#c084fc';
      portalBtn.style.borderColor = 'rgba(124,58,237,0.4)';
    }
    if (sidebarChip) sidebarChip.style.display = 'block';
    if (sidebarOrgChip) sidebarOrgChip.style.display = 'none';

    document.body.classList.remove('portal-b2b');
    document.body.classList.add('portal-farmer');
  }

  updateAdminVisibility();

  // Update active view
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.classList.add('active');

  // Update desktop nav links
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const navEl = document.querySelector(`.nav-link[data-view="${viewId}"]`);
  if (navEl) navEl.classList.add('active');

  // Update mobile bottom nav items
  document.querySelectorAll('.mb-nav-item').forEach(b => b.classList.remove('active'));
  const mbEl = document.querySelector(`.mb-nav-item[data-view="${viewId}"]`);
  if (mbEl) mbEl.classList.add('active');

  // Auto-close mobile drawer if open
  closeMobileSidebar();

  // Scroll main view to top smoothly
  const mainEl = document.querySelector('.main');
  if (mainEl) mainEl.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Run view loader
  if (VIEW_LOADERS[viewId]) VIEW_LOADERS[viewId]();

  window.location.hash = viewId;
}
window.navigate = navigate;
window.VIEW_LOADERS = VIEW_LOADERS;

// ── Mobile Sidebar Controls ──────────────────────────────────
function toggleMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const btn = document.getElementById('mobile-menu-btn');
  if (!sidebar) return;

  const isOpen = sidebar.classList.toggle('open');
  if (backdrop) backdrop.classList.toggle('active', isOpen);
  if (btn) btn.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const btn = document.getElementById('mobile-menu-btn');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('active');
  if (btn) btn.classList.remove('open');
  document.body.style.overflow = '';
}

function toggleLanguageMobile() {
  if (window.i18n) {
    const nextLang = (window.i18n.getLanguage() === 'ta') ? 'en' : 'ta';
    window.setLanguage(nextLang);
    const label = document.getElementById('mobile-lang-label');
    if (label) label.textContent = (nextLang === 'ta') ? 'English' : 'தமிழ்';
  }
}

window.toggleMobileSidebar = toggleMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;
window.toggleLanguageMobile = toggleLanguageMobile;

// ── Dedicated Login Form Handlers ────────────────────────────
function selectLoginTab(type) {
  const tabFarmer = document.getElementById('login-tab-farmer');
  const tabEnt = document.getElementById('login-tab-enterprise');
  const emailInput = document.getElementById('dedicated-login-email');
  const subEl = document.getElementById('login-dynamic-subtitle');

  if (type === 'farmer') {
    if (tabFarmer) tabFarmer.className = 'portal-toggle-btn active tab-farmer';
    if (tabEnt) tabEnt.className = 'portal-toggle-btn tab-enterprise';
    if (emailInput && (!emailInput.value || emailInput.value === 'admin@kovaifpo.org')) {
      emailInput.value = 'farmer@uzhavukaappaan.in';
    }
    if (subEl) subEl.textContent = 'Individual Farm Precision · Soil Sensing · Crop Rotation & Dairy Feeder';
  } else {
    if (tabFarmer) tabFarmer.className = 'portal-toggle-btn tab-farmer';
    if (tabEnt) tabEnt.className = 'portal-toggle-btn active tab-enterprise';
    if (emailInput && (!emailInput.value || emailInput.value === 'farmer@uzhavukaappaan.in')) {
      emailInput.value = 'admin@kovaifpo.org';
    }
    if (subEl) subEl.textContent = 'Enterprise Co-Op Cockpit · 18 Clusters · 1,250 Members · IoT Fleet';
  }
}
window.selectLoginTab = selectLoginTab;

function togglePasswordVisibility() {
  const input = document.getElementById('dedicated-login-password');
  const btn = document.querySelector('.login-pwd-toggle');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.textContent = '🙈';
  } else {
    input.type = 'password';
    if (btn) btn.textContent = '👁️';
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;

// ── Interactive Landing Page Live Telemetry Push ─────────────
async function simulateSensorReadingFromLanding() {
  const btn = document.getElementById('btn-landing-telemetry-pulse');
  const nEl = document.getElementById('landing-n-val');
  const pEl = document.getElementById('landing-p-val');
  const kEl = document.getElementById('landing-k-val');
  const mEl = document.getElementById('landing-m-val');
  const phEl = document.getElementById('landing-ph-val');
  const pingEl = document.getElementById('landing-ping-val');

  if (btn) {
    btn.disabled = true;
    btn.textContent = '📡 Transmitting Packet…';
  }

  // Generate realistic slight telemetry variations
  const newN = Math.floor(86 + Math.random() * 8);
  const newP = Math.floor(50 + Math.random() * 6);
  const newK = Math.floor(63 + Math.random() * 7);
  const newM = Math.floor(56 + Math.random() * 5);
  const newPh = (6.7 + Math.random() * 0.25).toFixed(1);
  const newPing = Math.floor(11 + Math.random() * 6);

  try {
    const payload = {
      farm_id: 101,
      device_id: 'ESP32-SOIL-101',
      nitrogen: newN,
      phosphorus: newP,
      potassium: newK,
      ph: parseFloat(newPh),
      soil_moisture: newM,
      organic_carbon: 0.88,
      air_temperature: 28.5,
      air_humidity: 64
    };

    await apiPost('/orgs/1/sensors/simulate-reading', payload);

    if (nEl) { nEl.innerHTML = `${newN} <span style="font-size:12px;color:#94a3b8">mg/kg</span>`; nEl.style.transform = 'scale(1.1)'; setTimeout(() => nEl.style.transform = 'scale(1)', 300); }
    if (pEl) { pEl.innerHTML = `${newP} <span style="font-size:12px;color:#94a3b8">mg/kg</span>`; pEl.style.transform = 'scale(1.1)'; setTimeout(() => pEl.style.transform = 'scale(1)', 300); }
    if (kEl) { kEl.innerHTML = `${newK} <span style="font-size:12px;color:#94a3b8">mg/kg</span>`; kEl.style.transform = 'scale(1.1)'; setTimeout(() => kEl.style.transform = 'scale(1)', 300); }
    if (mEl) { mEl.innerHTML = `${newM} <span style="font-size:12px;color:#94a3b8">%</span>`; mEl.style.transform = 'scale(1.1)'; setTimeout(() => mEl.style.transform = 'scale(1)', 300); }
    if (phEl) { phEl.innerHTML = `${newPh} <span style="font-size:12px;color:#94a3b8">pH</span>`; phEl.style.transform = 'scale(1.1)'; setTimeout(() => phEl.style.transform = 'scale(1)', 300); }
    if (pingEl) { pingEl.textContent = `${newPing}ms`; }

  } catch (err) {
    console.warn('Simulate pulse error:', err);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '✓ Pulse Ingested (Live)';
      setTimeout(() => {
        if (btn) btn.textContent = '⚡ Push Telemetry Pulse';
      }, 2000);
    }
  }
}
window.simulateSensorReadingFromLanding = simulateSensorReadingFromLanding;

async function handleDedicatedLogin(e) {
  if (e && e.preventDefault) e.preventDefault();
  const email = document.getElementById('dedicated-login-email')?.value.trim();
  const password = document.getElementById('dedicated-login-password')?.value;
  const msgEl = document.getElementById('login-feedback-msg');
  const btn = document.getElementById('dedicated-login-submit-btn');

  if (!email || !password) {
    if (msgEl) {
      msgEl.style.display = 'block';
      msgEl.style.background = 'rgba(239, 68, 68, 0.15)';
      msgEl.style.color = '#f87171';
      msgEl.textContent = 'Please provide both email and password.';
    }
    return false;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Authenticating…';
  }

  try {
    const res = await apiPost('/auth/login', { email, password });
    window.setAccessToken(res.access_token);
    window.authUser = res.user;

    if (msgEl) {
      msgEl.style.display = 'block';
      msgEl.style.background = 'rgba(34, 197, 94, 0.15)';
      msgEl.style.color = '#4ade80';
      msgEl.textContent = `Welcome back, ${res.user.name}! Redirecting...`;
    }

    if (window.renderAccountWidget) window.renderAccountWidget();
    if (window.updateAdminVisibility) window.updateAdminVisibility();

    setTimeout(() => {
      if (isAdminUser(res.user)) {
        enterB2BPortal('overview');
      } else {
        enterFarmerPortal();
      }
    }, 450);
  } catch (err) {
    if (msgEl) {
      msgEl.style.display = 'block';
      msgEl.style.background = 'rgba(239, 68, 68, 0.15)';
      msgEl.style.color = '#f87171';
      msgEl.textContent = err.message || 'Login failed. Please verify credentials.';
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Sign In to Platform';
    }
  }
  return false;
}
window.handleDedicatedLogin = handleDedicatedLogin;

function initAppAfterAuth() {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    navigate(hash);
  } else if (window.authUser) {
    if (isAdminUser(window.authUser)) {
      navigate('b2b');
    } else {
      navigate('dashboard');
    }
  } else {
    navigate('landing');
  }
  updateAdminVisibility();
}
window.initAppAfterAuth = initAppAfterAuth;

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Attach nav click handlers
  document.querySelectorAll('.nav-link[data-view]').forEach(link => {
    link.addEventListener('click', () => navigate(link.dataset.view));
  });
  updateAdminVisibility();
});


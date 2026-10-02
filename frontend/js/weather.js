// ============================================================
//  weather.js — Real-Time Live Weather & Agricultural Advisory
// ============================================================

let currentWeatherLocation = {
  farm_id: 101,
  location_name: 'Coimbatore, Tamil Nadu',
  latitude: 11.0168,
  longitude: 76.9558,
};

let weatherTimer = null;
let searchDebounceTimer = null;

async function initWeather() {
  await loadFarmsDropdown();
  await fetchLiveWeather();

  // Auto-refresh weather every 5 minutes (300,000 ms)
  if (weatherTimer) clearInterval(weatherTimer);
  weatherTimer = setInterval(() => {
    fetchLiveWeather(true);
  }, 5 * 60 * 1000);

  setupLocationSearch();
}

// ── Populate Farms Dropdown ──────────────────────────────────
async function loadFarmsDropdown() {
  const select = document.getElementById('farm-location-select');
  if (!select) return;

  try {
    const farms = await apiGet('/farms');
    select.innerHTML = farms.map(f => `
      <option value="${f.farm_id}" data-lat="${f.latitude}" data-lon="${f.longitude}" data-name="${f.location_name || f.name}" ${f.farm_id === state.farm_id ? 'selected' : ''}>
        📍 ${f.location_name || f.name} (${f.area_acres} ac · ${f.irrigation_type || f.irrigation})
      </option>
    `).join('') + `<option value="custom">🔍 Custom Searched Location...</option>`;

    select.addEventListener('change', handleFarmLocationChange);
  } catch (err) {
    console.warn('Could not load farms list for weather switcher:', err);
  }
}

// ── Handle Farm Selection Change ─────────────────────────────
async function handleFarmLocationChange(e) {
  const select = e.target;
  const val = select.value;

  if (val === 'custom') {
    document.getElementById('loc-search-box').style.display = 'block';
    document.getElementById('loc-search-input').focus();
    return;
  }

  document.getElementById('loc-search-box').style.display = 'none';
  const opt = select.options[select.selectedIndex];
  const farmId = parseInt(val, 10);

  currentWeatherLocation = {
    farm_id: farmId,
    location_name: opt.dataset.name,
    latitude: parseFloat(opt.dataset.lat),
    longitude: parseFloat(opt.dataset.lon),
  };

  // Update global state farm_id so dashboard and other views sync!
  state.farm_id = farmId;

  // Update active farm chip in sidebar
  const fcName = document.querySelector('.fc-name');
  if (fcName) fcName.textContent = opt.dataset.name;
  const fcMeta = document.querySelector('.fc-meta');
  if (fcMeta && opt.dataset.meta) fcMeta.textContent = opt.dataset.meta;

  // Reload weather and dashboard
  await fetchLiveWeather();
  if (window.VIEW_LOADERS && window.VIEW_LOADERS['dashboard']) {
    window.VIEW_LOADERS['dashboard']();
  }
}

// ── Setup Geocoding Search for Any Location ──────────────────
function setupLocationSearch() {
  const input = document.getElementById('loc-search-input');
  const resultsBox = document.getElementById('loc-search-results');
  if (!input || !resultsBox) return;

  input.addEventListener('input', () => {
    clearTimeout(searchDebounceTimer);
    const q = input.value.trim();
    if (q.length < 2) {
      resultsBox.style.display = 'none';
      return;
    }

    searchDebounceTimer = setTimeout(async () => {
      try {
        const data = await apiGet(`/weather/search?q=${encodeURIComponent(q)}`);
        if (data.results && data.results.length) {
          resultsBox.innerHTML = data.results.map(r => `
            <div class="loc-search-item" data-lat="${r.latitude}" data-lon="${r.longitude}" data-name="${r.display_name}">
              <span>📍</span>
              <div>
                <b>${r.name}</b> <span style="font-size:11px;color:var(--text-muted)">(${r.admin1 ? r.admin1 + ', ' : ''}${r.country})</span>
              </div>
            </div>
          `).join('');
          resultsBox.style.display = 'block';

          // Attach clicks
          resultsBox.querySelectorAll('.loc-search-item').forEach(item => {
            item.addEventListener('click', () => {
              const lat = parseFloat(item.dataset.lat);
              const lon = parseFloat(item.dataset.lon);
              const name = item.dataset.name;

              currentWeatherLocation = {
                farm_id: null,
                location_name: name,
                latitude: lat,
                longitude: lon,
              };

              input.value = name;
              resultsBox.style.display = 'none';

              // Set select to custom
              const sel = document.getElementById('farm-location-select');
              if (sel) sel.value = 'custom';

              // Update active farm chip in sidebar
              const fcName = document.querySelector('.fc-name');
              if (fcName) fcName.textContent = name.split(',')[0] + ' (Custom)';

              fetchLiveWeather();
            });
          });
        } else {
          resultsBox.innerHTML = `<div style="padding:10px 14px;color:var(--text-muted);font-size:12px">No locations found.</div>`;
          resultsBox.style.display = 'block';
        }
      } catch (err) {
        console.warn('Geocoding error:', err);
      }
    }, 300);
  });

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.loc-search-box')) {
      resultsBox.style.display = 'none';
    }
  });
}

// ── Fetch Realtime Live Weather ──────────────────────────────
async function fetchLiveWeather(isSilent = false) {
  const refreshBtn = document.getElementById('weather-refresh-btn');
  if (refreshBtn && !isSilent) refreshBtn.classList.add('spinning');

  try {
    let query = '';
    if (currentWeatherLocation.farm_id) {
      query = `farm_id=${currentWeatherLocation.farm_id}`;
    } else {
      query = `lat=${currentWeatherLocation.latitude}&lon=${currentWeatherLocation.longitude}&location_name=${encodeURIComponent(currentWeatherLocation.location_name)}`;
    }

    const data = await apiGet(`/weather?${query}`);
    renderWeatherCard(data);
  } catch (err) {
    console.error('Failed to load real-time weather:', err);
  } finally {
    if (refreshBtn) {
      setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
    }
  }
}

// ── Render Weather Widget DOM ────────────────────────────────
function renderWeatherCard(data) {
  window.lastWeatherData = data;
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  const cur = data.current;
  const loc = data.location;

  // Title & Location
  const locEl = document.getElementById('weather-loc-title');
  if (locEl) {
    if (isTa && loc.name.includes('Coimbatore')) {
      locEl.textContent = 'கோயம்புத்தூர், தமிழ்நாடு';
    } else {
      locEl.textContent = loc.name;
    }
  }

  const coordEl = document.getElementById('weather-loc-coords');
  if (coordEl) coordEl.textContent = `${loc.latitude.toFixed(2)}°N, ${loc.longitude.toFixed(2)}°E`;

  // Last Updated
  const updatedEl = document.getElementById('weather-updated-time');
  if (updatedEl) {
    const timeStr = new Date().toLocaleTimeString(isTa ? 'ta-IN' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    updatedEl.textContent = `${window.t ? t('updatedAt', 'Updated') : 'Updated'} ${timeStr}`;
  }

  // Hero Temp & Icon
  const tempEl = document.getElementById('weather-temp-val');
  if (tempEl) tempEl.textContent = cur.temperature.toFixed(1);

  const iconEl = document.getElementById('weather-icon-large');
  if (iconEl) iconEl.textContent = cur.icon;

  const condEl = document.getElementById('weather-cond-label');
  const rawCond = cur.label || cur.condition;
  if (condEl) condEl.textContent = window.tWeatherCond ? tWeatherCond(rawCond) : rawCond;

  const feelsEl = document.getElementById('weather-feels-like');
  if (feelsEl) feelsEl.textContent = `${window.t ? t('feelsLike', 'Feels like') : 'Feels like'} ${cur.feels_like.toFixed(1)}°C`;

  // Microclimate Parameters
  const humEl = document.getElementById('weather-param-humidity');
  if (humEl) humEl.textContent = `${cur.humidity}%`;

  const precipEl = document.getElementById('weather-param-precip');
  if (precipEl) precipEl.textContent = `${cur.precipitation_mm.toFixed(1)} mm`;

  const windEl = document.getElementById('weather-param-wind');
  if (windEl) windEl.textContent = `${cur.wind_speed_kmh} km/h`;

  const pressEl = document.getElementById('weather-param-pressure');
  if (pressEl) pressEl.textContent = `${cur.pressure_hpa} hPa`;

  // Agricultural Advisories
  const advContainer = document.getElementById('weather-advisories');
  if (advContainer && data.advisories && data.advisories.length) {
    advContainer.innerHTML = data.advisories.map(a => {
      const title = window.tAdvisoryTitle ? tAdvisoryTitle(a.title) : a.title;
      const cat = window.tAdvisoryCategory ? tAdvisoryCategory(a.category) : a.category;
      const msg = window.tAdvisoryMessage ? tAdvisoryMessage(a.message) : a.message;
      return `
      <div class="advisory-card ${a.status}">
        <div class="advisory-icon">${a.icon}</div>
        <div>
          <div class="advisory-head">${title} <span class="chip ${a.status}" style="font-size:10px;padding:2px 6px">${cat}</span></div>
          <div class="advisory-text">${msg}</div>
        </div>
      </div>`;
    }).join('');
  }

  // 7-Day Forecast Strip
  const forecastContainer = document.getElementById('weather-forecast-strip');
  if (forecastContainer && data.forecast && data.forecast.length) {
    forecastContainer.innerHTML = data.forecast.map((f, i) => {
      const dayName = (i === 0 || f.day === 'Today')
        ? (window.t ? t('today', 'Today') : 'Today')
        : (window.tDay ? tDay(f.day) : f.day);
      return `
      <div class="forecast-day-card">
        <div class="forecast-day-name">${dayName}</div>
        <div class="forecast-day-icon">${f.icon}</div>
        <div class="forecast-day-temps">
          ${f.max_temp}°<span class="forecast-min-temp">${f.min_temp}°</span>
        </div>
        <div class="forecast-rain-prob">
          💧 ${f.rain_probability}%
        </div>
      </div>`;
    }).join('');
  }
}
window.renderWeatherCard = renderWeatherCard;

// Global hook
window.initWeather = initWeather;
window.fetchLiveWeather = fetchLiveWeather;

document.addEventListener('DOMContentLoaded', () => {
  initWeather();
});

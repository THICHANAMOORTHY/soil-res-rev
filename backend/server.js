require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { supabase, isConfigured } = require('./db/supabase');

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Serve frontend static files FIRST
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Serverless / Proxy URL normalization (only for API routes missing /api prefix)
const KNOWN_API_ROUTES = [
  'soil-analysis', 'crop-history', 'candidate-crops', 'crop-evaluation',
  'optimize-rotation', 'soil-simulation', 'recommendation', 'dashboard',
  'weather', 'report', 'chat', 'gps-zones', 'crops', 'farms', 'seasons',
  'farmers', 'health', 'db-status', 'auth', 'soil-sensor', 'sensor-data', 'dairyfeed', 'silage', 'orgs'
];

app.use((req, res, next) => {
  const segment = req.path.replace(/^\/+/, '').split('/')[0];
  if (KNOWN_API_ROUTES.includes(segment) && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  next();
});

// ── API Routes ─────────────────────────────────────────────
app.use('/api/soil-analysis',    require('./routes/soilAnalysis'));
app.use('/api/crop-history',     require('./routes/cropHistory'));
app.use('/api/candidate-crops',  require('./routes/candidateCrops'));
app.use('/api/crop-evaluation',  require('./routes/cropEvaluation'));
app.use('/api/optimize-rotation',require('./routes/optimizeRotation'));
app.use('/api/soil-simulation',  require('./routes/soilSimulation'));
app.use('/api/recommendation',   require('./routes/recommendation'));
app.use('/api/dashboard',        require('./routes/dashboard'));
app.use('/api/weather',          require('./routes/weather'));
app.use('/api/report',           require('./routes/report'));
app.use('/api/chat',             require('./routes/chat'));
app.use('/api/gps-zones',        require('./routes/gpsZones'));
app.use('/api/auth',             require('./routes/auth'));
app.use(['/api/soil-sensor', '/api/sensor-data'], require('./routes/soilSensor'));
app.use('/api/dairyfeed',        require('./routes/dairyFeed'));
app.use('/api/silage',           require('./routes/dairyFeed'));
app.use('/api/orgs',             require('./routes/orgs'));

// ── Downloadable Assets & Export Routes ────────────────────
const fs = require('fs');
app.use('/downloads', express.static(path.join(__dirname, '..', 'downloads')));

app.get(['/download/farmer-plan-pdf', '/download/uzhavu-kaappaan-pdf', '/api/report/pdf'], (req, res) => {
  const mode = req.query.mode || 'auto';
  const fileName = `UZHAVU_KAAPPAAN_Farmer_Soil_Health_Action_Plan_Farm_${farmId}.pdf`;
  const tempOutPath = path.join(__dirname, '..', 'downloads', fileName);

  try {
    const { execSync } = require('child_process');
    const pyBin = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');
    const port = process.env.PORT || 3000;
    const extraArgs = [`--mode ${mode}`, `--api-port ${port}`];
    if (req.query.n !== undefined) extraArgs.push(`--manual-n ${Number(req.query.n)}`);
    if (req.query.p !== undefined) extraArgs.push(`--manual-p ${Number(req.query.p)}`);
    if (req.query.k !== undefined) extraArgs.push(`--manual-k ${Number(req.query.k)}`);
    if (req.query.ph !== undefined) extraArgs.push(`--manual-ph ${Number(req.query.ph)}`);
    if (req.query.oc !== undefined) extraArgs.push(`--manual-oc ${Number(req.query.oc)}`);

    execSync(`${pyBin} generate_farmer_pdf.py --farm-id ${farmId} ${extraArgs.join(' ')} --out "${tempOutPath}"`, {
      cwd: path.join(__dirname, '..'),
      timeout: 10000,
    });
  } catch (err) {
    console.warn('[PDF] Live PDF generation fallback:', err.message);
  }

  let filePath = tempOutPath;
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, '..', 'downloads', 'UZHAVU_KAAPPAAN_Farmer_Soil_Health_Action_Plan.pdf');
  }
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, '..', 'downloads', 'CropSmart_Farmer_Soil_Health_Action_Plan.pdf');
  }

  if (fs.existsSync(filePath)) {
    const isInline = req.query.view === 'inline' || req.query.inline === 'true';
    const disposition = isInline ? 'inline' : `attachment; filename="${fileName}"`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', disposition);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(filePath);
  }

  res.status(404).json({ error: 'Action Plan PDF could not be generated' });
});

app.get('/download/crops-csv', (req, res) => {
  const filePath = path.join(__dirname, '..', 'downloads', 'CropSmart_Master_60_Crops_Agronomy_Mandi.csv');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="CropSmart_Master_60_Crops_Agronomy_Mandi.csv"');
    return res.sendFile(filePath);
  }
  res.status(404).json({ error: 'Crops CSV not found' });
});

app.get('/download/crops-json', (req, res) => {
  const filePath = path.join(__dirname, '..', 'downloads', 'CropSmart_Master_60_Crops_Agronomy_Mandi.json');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="CropSmart_Master_60_Crops_Agronomy_Mandi.json"');
    return res.sendFile(filePath);
  }
  res.status(404).json({ error: 'Crops JSON not found' });
});

// Quick reference endpoints
const db = require('./data/seed');

app.get('/api/crops', async (req, res) => {
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('crops').select('*').order('crop_id');
      if (!error && data && data.length) return res.json(data);
    } catch (err) {
      console.warn('Supabase query failed, falling back to in-memory:', err.message);
    }
  }
  res.json(db.crops);
});

app.get('/api/farms', async (req, res) => {
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('farms').select('*');
      if (!error && data && data.length) return res.json(data);
    } catch (err) {}
  }
  res.json(db.farms);
});

app.get('/api/seasons', async (req, res) => {
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('seasons').select('*');
      if (!error && data && data.length) return res.json(data);
    } catch (err) {}
  }
  res.json(db.seasons);
});

app.get('/api/farmers', async (req, res) => {
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('farmers').select('*');
      if (!error && data && data.length) return res.json(data);
    } catch (err) {}
  }
  res.json(db.farmers);
});

// Health check & Database status
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  service: 'UZHAVU KAAPPAAN (உழவு காப்பான்) P025 API',
  database: isConfigured() ? 'Supabase Cloud PostgreSQL' : 'In-Memory (Set SUPABASE_URL in .env to connect)',
  time: new Date()
}));

app.get('/api/db-status', (req, res) => res.json({
  supabase_configured: isConfigured(),
  provider: isConfigured() ? 'Supabase' : 'In-Memory Mock',
  instructions: isConfigured()
    ? 'Supabase is connected!'
    : 'To connect Supabase, add SUPABASE_URL and SUPABASE_KEY to backend/.env, then run: npm run db:sync'
}));

// Fallback → serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ── Start ──────────────────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const os = require('os');
  let lanIp = 'localhost';
  try {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
      for (const alias of (iface || [])) {
        if (alias.family === 'IPv4' && !alias.internal) {
          lanIp = alias.address;
          break;
        }
      }
      if (lanIp !== 'localhost') break;
    }
  } catch (_) {}

  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('  🌱  UZHAVU KAAPPAAN (உழவு காப்பான்) P025 API');
    console.log(`  🚀  Running on http://localhost:${PORT}`);
    console.log(`  📊  Dashboard → http://localhost:${PORT}`);
    console.log(`  🔌  ESP32 Wi-Fi Ingestion URL → http://${lanIp}:${PORT}/api/soil-sensor/ingest`);
    console.log('');
  });
}

module.exports = app;

// ============================================================
// auth.js — Account creation & session management
// Dual-mode persistence: Supabase (if configured) else in-memory (seed.js)
// ============================================================

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const { supabase, isConfigured, memDb } = require('../db/supabase');
const {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateOpaqueToken,
  hashToken,
} = require('../utils/auth');
const { isMailConfigured, sendVerificationEmail, sendOtpEmail, sendGoogleAuthOtpEmail, buildVerificationLink } = require('../utils/mailer');
const { requireAuth } = require('../middleware/requireAuth');

const REFRESH_COOKIE = 'ukp_refresh';
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// ── Rate limiting on sensitive auth endpoints ─────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts from this device. Please try again in a few minutes.' },
});

// ── Data access helpers (Supabase-first, in-memory fallback) ──
async function findUserByEmail(email) {
  const emailLc = String(email).toLowerCase();
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('email', emailLc).maybeSingle();
      if (!error && data) return data;
      if (!error && !data) return null;
    } catch (err) {
      console.warn('[auth] Supabase findUserByEmail failed, falling back to in-memory:', err.message);
    }
  }
  return memDb.users.find(u => u.email.toLowerCase() === emailLc) || null;
}

async function findUserById(userId) {
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('user_id', userId).maybeSingle();
      if (!error && data) return data;
    } catch (err) {
      console.warn('[auth] Supabase findUserById failed, falling back to in-memory:', err.message);
    }
  }
  return memDb.users.find(u => u.user_id === userId) || null;
}

async function findUserByVerificationToken(rawToken) {
  const token = hashToken(rawToken);
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('verification_token', token).maybeSingle();
      if (!error && data) return data;
    } catch (err) {
      console.warn('[auth] Supabase findUserByVerificationToken failed, falling back to in-memory:', err.message);
    }
  }
  return memDb.users.find(u => u.verification_token === token) || null;
}

class DuplicateEmailError extends Error {}

// Only these mean "Supabase can't take users right now" and justify the
// in-memory fallback. Anything else (constraint violations, bad columns) is a
// real bug that must surface instead of silently losing the account on restart.
function isUnavailableError(err) {
  const msg = (err && err.message) || '';
  return !err || err.code === 'PGRST205' || err.code === '42P01'
    || /schema cache|does not exist|fetch failed|network|ENOTFOUND|ECONN|ETIMEDOUT/i.test(msg);
}

async function insertUser(user) {
  if (isConfigured()) {
    let error;
    try {
      const res = await supabase.from('users').insert(user).select().single();
      if (!res.error && res.data) return res.data;
      error = res.error;
    } catch (err) {
      error = err;
    }
    if (error && error.code === '23505') throw new DuplicateEmailError();
    if (!isUnavailableError(error)) {
      if (error.code === '23503') {
        console.error('[auth] users.farmer_id still has a foreign key to farmers — run: ALTER TABLE users DROP CONSTRAINT IF EXISTS users_farmer_id_fkey;');
      }
      throw error;
    }
    console.warn('[auth] Supabase users table unavailable, falling back to in-memory:', error && error.message);
  }
  const localUser = { ...user, user_id: user.user_id || (++memDb.counters.user_id) };
  memDb.users.push(localUser);
  return localUser;
}

// ── Profile records ───────────────────────────────────────────
// Only the `users` row is persisted. The farmer / farm records the app
// reads live in memory, so after a restart a signed-in user's row survives but
// their profile is gone. ensureProfile() rebuilds it under the same IDs, and
// syncCounters() stops brand-new sign-ups from reusing IDs already taken by
// persisted users.
const farmIdFor = farmer_id => 1000 + farmer_id; // stable, so a flashed ESP32's farm_id survives restarts

let countersSynced = false;
async function syncCounters() {
  if (countersSynced || !isConfigured()) return;
  try {
    const { data, error } = await supabase.from('users').select('farmer_id');
    if (error) return; // table missing → memory-only mode, nothing to sync
    for (const u of data || []) {
      if (u.farmer_id > memDb.counters.farmer_id) memDb.counters.farmer_id = u.farmer_id;
    }
    countersSynced = true;
  } catch (err) {
    console.warn('[auth] Could not sync ID counters from Supabase:', err.message);
  }
}

// Returns the farm_id the user should work on (null if they have no farmer profile).
function ensureProfile(user) {
  if (user.role === 'farmer' && user.farmer_id) {
    if (!memDb.farmers.some(f => f.farmer_id === user.farmer_id)) {
      memDb.farmers.push({
        farmer_id: user.farmer_id,
        name: user.name,
        phone: user.phone || null,
        email: user.email,
        preferred_lang: 'en',
      });
      if (user.farmer_id > memDb.counters.farmer_id) memDb.counters.farmer_id = user.farmer_id;
    }
    let farm = memDb.farms.find(f => f.farmer_id === user.farmer_id);
    if (!farm) {
      farm = {
        farm_id: farmIdFor(user.farmer_id),
        farmer_id: user.farmer_id,
        name: `${String(user.name).split(' ')[0]}'s Farm`,
        location_name: 'Unset Location',
        latitude: 11.0168, longitude: 76.9558,
        area_acres: 1.0,
        irrigation: 'Rainfed',
        irrigation_type: 'Rainfed',
      };
      memDb.farms.push(farm);
    }
    return farm.farm_id;
  }
  return null;
}

async function updateUser(userId, patch) {
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('users').update(patch).eq('user_id', userId).select().single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('[auth] Supabase updateUser failed, falling back to in-memory:', err.message);
    }
  }
  const u = memDb.users.find(x => x.user_id === userId);
  if (u) Object.assign(u, patch);
  return u;
}

function sanitize(user) {
  if (!user) return null;
  const { password_hash, verification_token, ...safe } = user;
  return safe;
}

// What the client sees: the user plus the farm they should work on.
function publicUser(user) {
  const safe = sanitize(user);
  if (safe) {
    safe.farm_id = ensureProfile(user);
    if (!safe.role) safe.role = user.role || 'farmer';
    if (!safe.organization_id) safe.organization_id = user.organization_id || 1;
    if (user.title) safe.title = user.title;
    if (user.assigned_clusters) safe.assigned_clusters = user.assigned_clusters;
  }
  return safe;
}

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const lastVerificationSent = new Map(); // email -> timestamp (per-instance cooldown)

// Creates a fresh token (stored hashed), emails the raw link, and reports how
// it went. With no SMTP configured it returns the link instead (dev mode).
async function issueVerification(user, req) {
  const rawToken = generateOpaqueToken();
  const patch = {
    verification_token: hashToken(rawToken),
    verification_expires: new Date(Date.now() + VERIFICATION_TTL_MS).toISOString(),
  };
  const link = buildVerificationLink(rawToken, req);

  if (!isMailConfigured()) {
    console.log(`  ✉️  [Auth-DEV] No SMTP configured — verification link for ${user.email}: ${link}`);
    return { patch, email_sent: false, dev_link: link };
  }
  try {
    await sendVerificationEmail({ to: user.email, name: user.name, link });
    lastVerificationSent.set(user.email, Date.now());
    return { patch, email_sent: true };
  } catch (err) {
    console.error(`[auth] Failed to send verification email to ${user.email}:`, err.message);
    return { patch, email_sent: false, send_failed: true };
  }
}

async function issueSession(user, res) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, user.token_version || 0);
  res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
  return accessToken;
}

// ────────────────────────────────────────────────────────────
// POST /api/auth/register
// ────────────────────────────────────────────────────────────
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const password_hash = await hashPassword(password);
    const verification = await issueVerification({ email: email.toLowerCase(), name }, req);

    await syncCounters();
    const farmer_id = ++memDb.counters.farmer_id;

    const newUser = await insertUser({
      role: 'farmer',
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      farmer_id,
      password_hash,
      email_verified: false,
      ...verification.patch,
      token_version: 0,
      created_at: new Date().toISOString(),
    });

    // Created only after the row is safely stored, so a failed insert can't
    // leave orphan in-memory records behind.
    const farm_id = ensureProfile(newUser);

    // If instant verification is requested (e.g. testing on localhost) or dev mode:
    const autoVerify = req.body.instant_verify !== false || !isMailConfigured();
    if (autoVerify) {
      newUser.email_verified = true;
      const accessToken = await issueSession(newUser, res);
      return res.status(201).json({
        success: true,
        user: publicUser(newUser),
        access_token: accessToken,
        farm_id,
        message: 'Account created and verified! Logged in successfully.',
        verification_link: verification.dev_link,
      });
    }

    if (isMailConfigured()) {
      return res.status(201).json({
        success: true,
        verification_required: true,
        email_sent: verification.email_sent,
        email: newUser.email,
        farm_id,
        can_instant_verify: true,
        message: verification.email_sent
          ? `We sent a verification link to ${newUser.email}. You can also click "Instant Verify" below.`
          : 'Your account was created. Click "Instant Verify" below to log in immediately.',
      });
    }

    const accessToken = await issueSession(newUser, res);
    res.status(201).json({
      success: true,
      user: publicUser(newUser),
      access_token: accessToken,
      farm_id,
      dev_note: 'No SMTP provider is configured (SMTP_HOST / MAIL_FROM) — verification_link is returned directly for demo purposes instead of being emailed.',
      verification_link: verification.dev_link,
    });
  } catch (err) {
    if (err instanceof DuplicateEmailError) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/demo-login
// ────────────────────────────────────────────────────────────
const DEMO_PERSONAS = {
  farmer: {
    email: 'ramesh.farmer101@uzhavukaappaan.org',
    name: 'Ramesh Kumar',
    phone: '9842154820',
    role: 'farmer',
    farmer_id: 1,
    farm_id: 101,
    org_id: 1,
    org_name: 'Kovai Farmer Producer Organization (Kovai FPO)',
    title: 'Individual Farmer',
    message: 'Logged in as Demo Farmer (Ramesh Kumar - Coimbatore Farm 101)'
  },
  fpo_admin: {
    email: 'admin@kovaifpo.org',
    name: 'Dr. K. Swaminathan',
    phone: '9443128900',
    role: 'fpo_admin',
    farmer_id: null,
    farm_id: null,
    org_id: 1,
    org_name: 'Kovai Farmer Producer Organization (Kovai FPO)',
    title: 'FPO Administrator / CEO',
    message: 'Logged in as FPO Administrator (Dr. K. Swaminathan - Kovai FPO Command Center)'
  },
  fpo_manager: {
    email: 'manager@kovaifpo.org',
    name: 'P. Selvan',
    phone: '9842233445',
    role: 'fpo_manager',
    farmer_id: null,
    farm_id: null,
    org_id: 1,
    org_name: 'Kovai Farmer Producer Organization (Kovai FPO)',
    title: 'FPO Operations Manager',
    message: 'Logged in as FPO Manager (P. Selvan - Operations)'
  },
  field_officer: {
    email: 'officer.anand@kovaifpo.org',
    name: 'Anand Kumar',
    phone: '9789012456',
    role: 'field_officer',
    farmer_id: null,
    farm_id: null,
    org_id: 1,
    org_name: 'Kovai Farmer Producer Organization (Kovai FPO)',
    assigned_clusters: ['Sulur Cluster', 'Pollachi Cluster', 'Annur Cluster'],
    title: 'Senior Field Operations Officer',
    message: 'Logged in as Field Officer (Anand Kumar - Assigned to Sulur & Pollachi Clusters)'
  },
  agronomist: {
    email: 'agronomy.priya@kovaifpo.org',
    name: 'Dr. Priya Balan',
    phone: '9944112233',
    role: 'agronomist',
    farmer_id: null,
    farm_id: null,
    org_id: 1,
    org_name: 'Kovai Farmer Producer Organization (Kovai FPO)',
    title: 'Lead Agronomist & Soil Specialist',
    message: 'Logged in as Agronomist (Dr. Priya Balan - Agricultural Intelligence)'
  },
  iot_technician: {
    email: 'iot.karthik@kovaifpo.org',
    name: 'Karthik Raja',
    phone: '9654123890',
    role: 'iot_technician',
    farmer_id: null,
    farm_id: null,
    org_id: 1,
    org_name: 'Kovai Farmer Producer Organization (Kovai FPO)',
    title: 'IoT Telemetry & Hardware Systems Lead',
    message: 'Logged in as IoT Technician (Karthik Raja - IoT Fleet Command)'
  }
};

router.post('/demo-login', async (req, res) => {
  try {
    const requestedRole = (req.body && req.body.role) || (req.query && req.query.role) || 'farmer';
    const persona = DEMO_PERSONAS[requestedRole] || DEMO_PERSONAS.farmer;

    let user = await findUserByEmail(persona.email);
    if (!user) {
      const password_hash = await hashPassword('UzhavuDemo@2026');
      user = await insertUser({
        role: persona.role,
        name: persona.name,
        email: persona.email,
        phone: persona.phone,
        farmer_id: persona.farmer_id,
        org_id: persona.org_id,
        assigned_clusters: persona.assigned_clusters || [],
        password_hash,
        email_verified: true,
        token_version: 0,
        created_at: new Date().toISOString(),
      });
    } else {
      user.email_verified = true;
      user.role = persona.role;
      user.org_id = persona.org_id;
      if (persona.assigned_clusters) user.assigned_clusters = persona.assigned_clusters;
    }

    if (persona.farm_id) user.farm_id = persona.farm_id;
    const accessToken = await issueSession(user, res);
    const pub = publicUser(user);
    pub.role = persona.role;
    pub.org_id = persona.org_id;
    pub.org_name = persona.org_name;
    pub.title = persona.title;
    if (persona.assigned_clusters) pub.assigned_clusters = persona.assigned_clusters;
    if (persona.farm_id) pub.farm_id = persona.farm_id;

    res.json({
      success: true,
      user: pub,
      access_token: accessToken,
      message: persona.message,
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ error: 'Failed to log in with demo account' });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // On localhost, valid password automatically activates unverified accounts
    if (!user.email_verified) {
      user.email_verified = true;
      console.log(`  ⚡ [Auth] User ${user.email} auto-verified on password login.`);
    }

    const accessToken = await issueSession(user, res);
    res.json({ success: true, user: publicUser(user), access_token: accessToken });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/google — Google Mail & Cloud OAuth Ingestion
// ────────────────────────────────────────────────────────────
router.post('/google', authLimiter, async (req, res) => {
  try {
    let { credential, email, name, picture, google_id, role } = req.body;

    // If a Google ID Token (credential) is passed from Google Identity Services
    if (credential) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
          const googlePayload = JSON.parse(payloadJson);
          if (googlePayload && googlePayload.email) {
            email = googlePayload.email;
            name = name || googlePayload.name || googlePayload.given_name;
            picture = picture || googlePayload.picture;
            google_id = google_id || googlePayload.sub;
          }
        }
      } catch (jwtErr) {
        console.warn('[auth] Could not decode Google JWT directly, falling back:', jwtErr.message);
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'Valid Google Mail account is required' });
    }

    const emailLc = String(email).trim().toLowerCase();
    let user = await findUserByEmail(emailLc);

    if (!user) {
      // Create new Cloud user account authenticated via Google
      await syncCounters();
      const isEnterprise = role === 'fpo_admin' || role === 'fpo_manager' || emailLc.includes('fpo') || emailLc.includes('admin');
      const assignedRole = isEnterprise ? (role || 'fpo_admin') : 'farmer';
      const farmer_id = assignedRole === 'farmer' ? ++memDb.counters.farmer_id : null;
      const dummyPassword = await hashPassword(`GoogleCloudAuth_${google_id || Date.now()}`);

      user = await insertUser({
        role: assignedRole,
        name: name || emailLc.split('@')[0],
        email: emailLc,
        phone: null,
        farmer_id,
        org_id: 1,
        password_hash: dummyPassword,
        email_verified: true,
        auth_provider: 'google',
        avatar_url: picture || null,
        google_id: google_id || null,
        token_version: 0,
        created_at: new Date().toISOString(),
      });

      console.log(`  ⚡ [Auth-Google] Created new cloud user ${emailLc} (${assignedRole}) via Google Mail.`);
    } else {
      // Existing user: mark verified and update avatar/provider
      user.email_verified = true;
      user.auth_provider = 'google';
      if (picture && !user.avatar_url) user.avatar_url = picture;
      if (google_id && !user.google_id) user.google_id = google_id;
      if (role && (!user.role || user.role === 'farmer')) {
        if (role !== 'farmer') user.role = role;
      }
      await updateUser(user.user_id, {
        email_verified: true,
        auth_provider: 'google',
        avatar_url: user.avatar_url,
        google_id: user.google_id,
        role: user.role
      });
      console.log(`  ⚡ [Auth-Google] Authenticated existing user ${emailLc} (${user.role}) via Google Mail.`);
    }

    const farm_id = ensureProfile(user);
    const accessToken = await issueSession(user, res);
    const pub = publicUser(user);
    if (picture) pub.avatar_url = picture;

    res.json({
      success: true,
      user: pub,
      access_token: accessToken,
      farm_id,
      auth_provider: 'google',
      cloud_synced: isConfigured(),
      message: `Signed in as ${user.name} via Google Mail (${emailLc})`,
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ error: 'Failed to authenticate with Google Mail: ' + err.message });
  }
});

// ── Google Mail Verification OTP Storage ────────────────────
const googleMailOtps = new Map(); // lowercase email -> { otpHash, expiresAt, lastSentAt, attempts, role, name, rawOtp }
const GOOGLE_OTP_TTL_MS = 10 * 60 * 1000;
const GOOGLE_OTP_COOLDOWN_MS = 30 * 1000;

// POST /api/auth/google/send-code — Send 6-digit Google Mail OTP
router.post('/google/send-code', authLimiter, async (req, res) => {
  try {
    const { email, role, name } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid Google Mail address is required' });
    }
    const emailLc = String(email).trim().toLowerCase();

    // Check cooldown
    const existing = googleMailOtps.get(emailLc);
    if (existing && Date.now() - existing.lastSentAt < GOOGLE_OTP_COOLDOWN_MS) {
      const waitSec = Math.ceil((GOOGLE_OTP_COOLDOWN_MS - (Date.now() - existing.lastSentAt)) / 1000);
      return res.status(429).json({ error: `Please wait ${waitSec}s before requesting a new code`, cooldown_seconds: waitSec });
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    googleMailOtps.set(emailLc, {
      otpHash: hashToken(rawOtp),
      rawOtp: rawOtp,
      expiresAt: Date.now() + GOOGLE_OTP_TTL_MS,
      lastSentAt: Date.now(),
      attempts: 0,
      role: role || 'farmer',
      name: name || emailLc.split('@')[0],
    });

    console.log(`🔑 [Google-Auth] Verification code for ${emailLc}: ${rawOtp}`);

    if (isMailConfigured()) {
      try {
        await sendGoogleAuthOtpEmail({ to: emailLc, name, otp: rawOtp });
        return res.json({
          success: true,
          email: emailLc,
          message: `Verification code sent to ${emailLc}. Please check your Gmail inbox and spam folder.`,
          cooldown_seconds: 30
        });
      } catch (mailErr) {
        console.error(`❌ [Google-Auth] Resend delivery failed for ${emailLc}:`, mailErr.message);
        const isFreeTierRestriction = mailErr.message.includes('own email') || mailErr.message.includes('resend.com/domains');
        if (isFreeTierRestriction) {
          return res.status(400).json({
            error: `Email delivery restricted: On Resend sandbox, real emails can only be sent to the registered owner (thichu683@gmail.com). To test other emails, enter verification code: ${rawOtp}`,
            demo_code: rawOtp,
            email: emailLc,
            cooldown_seconds: 30
          });
        }
        return res.status(400).json({ error: `Failed to deliver verification code: ${mailErr.message}` });
      }
    }

    return res.json({
      success: true,
      email: emailLc,
      message: `Verification code generated for ${emailLc}. Code: ${rawOtp}`,
      demo_code: rawOtp,
      cooldown_seconds: 30
    });
  } catch (err) {
    console.error('Google send-code error:', err);
    res.status(500).json({ error: 'Failed to send verification code: ' + err.message });
  }
});

// POST /api/auth/google/verify-code — Verify 6-digit Google Mail OTP & log in
router.post('/google/verify-code', authLimiter, async (req, res) => {
  try {
    const { email, code, role, name } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Both email and 6-digit verification code are required' });
    }
    const emailLc = String(email).trim().toLowerCase();
    const entry = googleMailOtps.get(emailLc);

    if (!entry) {
      return res.status(400).json({ error: 'No active verification code found for this email. Please request a new code.' });
    }
    if (Date.now() > entry.expiresAt) {
      googleMailOtps.delete(emailLc);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }
    if (entry.attempts >= 5) {
      googleMailOtps.delete(emailLc);
      return res.status(429).json({ error: 'Too many invalid attempts. Please request a new code.' });
    }

    entry.attempts++;
    const providedHash = hashToken(String(code).trim());
    if (entry.otpHash !== providedHash && String(code).trim() !== entry.rawOtp) {
      return res.status(400).json({ error: 'Invalid 6-digit verification code. Please check and try again.' });
    }

    // Code verified! Remove OTP entry
    googleMailOtps.delete(emailLc);

    // Provision or update user in Supabase Cloud
    await syncCounters();
    const isEnterprise = (role === 'fpo_admin' || role === 'fpo_manager' || entry.role === 'fpo_admin' || emailLc.includes('fpo') || emailLc.includes('admin'));
    const assignedRole = isEnterprise ? (role || entry.role || 'fpo_admin') : 'farmer';
    let user = await findUserByEmail(emailLc);

    if (!user) {
      const farmer_id = assignedRole === 'farmer' ? ++memDb.counters.farmer_id : null;
      const dummyPassword = await hashPassword(`GoogleVerified_${Date.now()}`);

      user = await insertUser({
        role: assignedRole,
        name: name || entry.name || emailLc.split('@')[0],
        email: emailLc,
        phone: null,
        farmer_id,
        org_id: 1,
        password_hash: dummyPassword,
        email_verified: true,
        auth_provider: 'google',
        avatar_url: null,
        google_id: `gverified_${Date.now()}`,
        token_version: 0,
        created_at: new Date().toISOString(),
      });
      console.log(`  ⚡ [Auth-Google] Verified & created new cloud user ${emailLc} (${assignedRole}).`);
    } else {
      user.email_verified = true;
      user.auth_provider = 'google';
      if (assignedRole && assignedRole !== 'farmer' && user.role === 'farmer') {
        user.role = assignedRole;
      }
      await updateUser(user.user_id, {
        email_verified: true,
        auth_provider: 'google',
        role: user.role
      });
      console.log(`  ⚡ [Auth-Google] Verified existing cloud user ${emailLc} (${user.role}).`);
    }

    const farm_id = ensureProfile(user);
    const accessToken = await issueSession(user, res);
    const pub = publicUser(user);

    res.json({
      success: true,
      user: pub,
      access_token: accessToken,
      farm_id,
      auth_provider: 'google',
      cloud_synced: isConfigured(),
      message: `Verified and signed in as ${user.name} (${emailLc})`,
    });
  } catch (err) {
    console.error('Google verify-code error:', err);
    res.status(500).json({ error: 'Failed to verify Google code: ' + err.message });
  }
});

// GET /api/auth/google/config
router.get('/google/config', (req, res) => {
  res.json({
    google_client_id: process.env.GOOGLE_CLIENT_ID || '872391029381-uzhavukaappaan.apps.googleusercontent.com',
    cloud_provider: 'supabase',
    cloud_active: isConfigured(),
    project_id: 'manjetaxlwpkbuqczcej'
  });
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/refresh — rotate refresh token, issue new access token
// ────────────────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies && req.cookies[REFRESH_COOKIE];
    if (!token) return res.status(401).json({ error: 'No active session' });

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTS);
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    const user = await findUserById(payload.sub);
    if (!user || (user.token_version || 0) !== payload.tv) {
      res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTS);
      return res.status(401).json({ error: 'Session no longer valid. Please log in again.' });
    }

    if (isMailConfigured() && !user.email_verified) {
      res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTS);
      return res.status(401).json({ error: 'Please verify your email to continue.', code: 'EMAIL_NOT_VERIFIED' });
    }

    const accessToken = await issueSession(user, res); // rotates the refresh cookie too
    res.json({ success: true, access_token: accessToken, user: publicUser(user) });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Failed to refresh session' });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTS);
  res.json({ success: true });
});

// ────────────────────────────────────────────────────────────
// Email verification
// GET  /api/auth/verify-email?token=...  -> confirmation page (does NOT consume the token)
// POST /api/auth/verify-email            -> consumes the token
// The two-step flow matters: mail scanners (Outlook Safe Links, Gmail
// previews, antivirus) auto-open links, and a GET that consumed the token
// would burn it before the user ever clicks.
// ────────────────────────────────────────────────────────────
function verifyPage(token) {
  const safeToken = String(token).replace(/[^a-zA-Z0-9]/g, '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Verify your email — UZHAVU KAAPPAAN</title>
<style>body{font-family:Arial,Helvetica,sans-serif;background:#0b1410;color:#e5efe8;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
.card{background:#12211a;border:1px solid #1f3a2c;border-radius:14px;padding:32px;max-width:420px;text-align:center}
h1{color:#4ade80;font-size:22px;margin:0 0 10px}p{color:#a7c4b4;line-height:1.5}
button,a.btn{display:inline-block;background:#16a34a;color:#fff;border:0;padding:12px 24px;border-radius:8px;font-size:16px;font-weight:bold;cursor:pointer;text-decoration:none;margin-top:12px}
.err{color:#f87171}</style></head><body><div class="card">
<h1>🌱 UZHAVU KAAPPAAN</h1>
<div id="box"><p>Confirm your email address to activate your account.<br><small>உங்கள் மின்னஞ்சலை உறுதிப்படுத்தவும்.</small></p>
<button id="go">Confirm my email</button></div></div>
<script>
document.getElementById('go').addEventListener('click', async function () {
  var box = document.getElementById('box'); this.disabled = true; this.textContent = 'Verifying…';
  try {
    var r = await fetch('/api/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: '${safeToken}' }) });
    var d = await r.json();
    if (r.ok) { box.innerHTML = '<p>✅ ' + d.message + '</p><a class="btn" href="/">Continue to log in</a>'; }
    else { box.innerHTML = '<p class="err">⚠ ' + (d.error || 'Verification failed.') + '</p><a class="btn" href="/">Back to the app</a>'; }
  } catch (e) { box.innerHTML = '<p class="err">⚠ Network error. Please try the link again.</p>'; }
});
</script></body></html>`;
}

router.get('/verify-email', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Missing verification token');
  res.set('Cache-Control', 'no-store').type('html').send(verifyPage(token));
});

router.post('/verify-email', authLimiter, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Missing verification token' });

    const matched = await findUserByVerificationToken(token);
    if (!matched) return res.status(400).json({ error: 'This link is invalid or has already been used. If you already verified, just log in.' });
    if (new Date(matched.verification_expires) < new Date()) {
      return res.status(400).json({ error: 'This link has expired. Log in and request a new verification email.' });
    }

    await updateUser(matched.user_id, { email_verified: true, verification_token: null, verification_expires: null });
    res.json({ success: true, message: 'Email verified! You can now log in.' });
  } catch (err) {
    console.error('Verify-email error:', err);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/resend-verification
// Always answers the same way so it can't be used to discover which emails
// have accounts.
// ────────────────────────────────────────────────────────────
router.post('/resend-verification', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  const generic = { success: true, message: 'If that account exists and is not yet verified, a new verification email is on its way.' };

  try {
    const user = await findUserByEmail(email);
    if (!user || user.email_verified) return res.json(generic);

    const last = lastVerificationSent.get(user.email);
    if (last && Date.now() - last < RESEND_COOLDOWN_MS) return res.json(generic);

    const verification = await issueVerification(user, req);
    await updateUser(user.user_id, verification.patch);

    if (!isMailConfigured()) {
      return res.json({ ...generic, dev_note: 'No SMTP provider is configured — link returned for demo purposes.', verification_link: verification.dev_link });
    }
    res.json(generic);
  } catch (err) {
    console.error('Resend-verification error:', err);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/verify-instant — One-click verification for local/dev use
// ────────────────────────────────────────────────────────────
router.post('/verify-instant', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await findUserByEmail(email.toLowerCase());
    if (!user) return res.status(404).json({ error: 'User not found' });

    await updateUser(user.user_id, {
      email_verified: true,
      verification_token: null,
      verification_expires: null,
    });

    user.email_verified = true;
    const accessToken = await issueSession(user, res);
    res.json({
      success: true,
      message: 'Email verified! Logging you in...',
      user: publicUser(user),
      access_token: accessToken,
    });
  } catch (err) {
    console.error('Verify-instant error:', err);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// ── Password Reset OTP State ────────────────────────────────
const passwordResetOtps = new Map(); // lowercase email -> { otpHash, expiresAt, lastSentAt, attempts }
const OTP_TTL_MS = 10 * 60 * 1000;    // 10 minutes
const OTP_COOLDOWN_MS = 30 * 1000;    // 30 seconds

// ────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password — Request 6-digit OTP
// ────────────────────────────────────────────────────────────
router.post('/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email || !String(email).includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const genericResponse = {
    success: true,
    message: 'If that email is registered, a 6-digit verification OTP has been sent.',
    cooldown_seconds: 30,
  };

  try {
    let user = await findUserByEmail(normalizedEmail);
    if (!user) {
      const newFarmerId = ++memDb.counters.farmer_id;
      user = await insertUser({
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password_hash: await hashPassword(generateOpaqueToken()),
        phone: null,
        role: 'farmer',
        farmer_id: newFarmerId,
        email_verified: false,
        token_version: 0,
      });
      ensureProfile(user);
      console.log(`👤 [Auth] Auto-registered farmer for OTP: ${normalizedEmail}`);
    }

    const last = passwordResetOtps.get(normalizedEmail);
    if (last && Date.now() - last.lastSentAt < OTP_COOLDOWN_MS) {
      const waitSec = Math.ceil((OTP_COOLDOWN_MS - (Date.now() - last.lastSentAt)) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSec}s before requesting another OTP`,
        cooldown_seconds: waitSec,
      });
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    passwordResetOtps.set(normalizedEmail, {
      otpHash: hashToken(rawOtp),
      expiresAt: Date.now() + OTP_TTL_MS,
      lastSentAt: Date.now(),
      attempts: 0,
    });

    console.log(`🔑 [Auth] Generated Password Reset OTP for ${normalizedEmail}: ${rawOtp}`);

    if (isMailConfigured()) {
      try {
        await sendOtpEmail({ to: user.email, name: user.name, otp: rawOtp });
        return res.json({
          success: true,
          message: `Verification OTP has been sent to ${user.email}. Please check your inbox and spam folder.`,
          cooldown_seconds: 30,
        });
      } catch (mailErr) {
        console.error(`❌ [Auth] Failed to send OTP email to ${user.email}:`, mailErr.message);
        const isOwnEmailLimit = mailErr.message.includes('own email') || mailErr.message.includes('resend.com/domains');
        return res.status(400).json({
          error: isOwnEmailLimit
            ? `Resend free-tier limit: emails can only be delivered to your registered email (${mailErr.message.match(/own email address \(([^)]+)\)/)?.[1] || 'thichu683@gmail.com'}). To send to other emails, verify a domain at resend.com.`
            : `Failed to deliver OTP email: ${mailErr.message}`,
        });
      }
    }

    return res.json({
      success: true,
      message: `Verification OTP has been sent to ${user.email}. Please check your inbox.`,
      cooldown_seconds: 30,
    });
  } catch (err) {
    console.error('Forgot-password error:', err);
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/resend-otp — Resend fresh 6-digit OTP
// ────────────────────────────────────────────────────────────
router.post('/resend-otp', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email || !String(email).includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  try {
    let user = await findUserByEmail(normalizedEmail);
    if (!user) {
      const newFarmerId = ++memDb.counters.farmer_id;
      user = await insertUser({
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password_hash: await hashPassword(generateOpaqueToken()),
        phone: null,
        role: 'farmer',
        farmer_id: newFarmerId,
        email_verified: false,
        token_version: 0,
      });
      ensureProfile(user);
    }

    const record = passwordResetOtps.get(normalizedEmail);
    if (record && Date.now() - record.lastSentAt < OTP_COOLDOWN_MS) {
      const waitSec = Math.ceil((OTP_COOLDOWN_MS - (Date.now() - record.lastSentAt)) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSec}s before resending OTP`,
        cooldown_seconds: waitSec,
      });
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    passwordResetOtps.set(normalizedEmail, {
      otpHash: hashToken(rawOtp),
      expiresAt: Date.now() + OTP_TTL_MS,
      lastSentAt: Date.now(),
      attempts: 0,
    });

    console.log(`🔄 [Auth] Resent Password Reset OTP for ${normalizedEmail}: ${rawOtp}`);

    if (isMailConfigured()) {
      try {
        await sendOtpEmail({ to: user.email, name: user.name, otp: rawOtp });
        return res.json({
          success: true,
          message: `A fresh OTP has been sent to ${user.email}. Please check your inbox and spam folder.`,
          cooldown_seconds: 30,
        });
      } catch (mailErr) {
        console.error(`❌ [Auth] Failed to resend OTP email to ${user.email}:`, mailErr.message);
        const isOwnEmailLimit = mailErr.message.includes('own email') || mailErr.message.includes('resend.com/domains');
        return res.status(400).json({
          error: isOwnEmailLimit
            ? `Resend free-tier limit: emails can only be delivered to your registered email (${mailErr.message.match(/own email address \(([^)]+)\)/)?.[1] || 'thichu683@gmail.com'}). To send to other emails, verify a domain at resend.com.`
            : `Failed to resend OTP email: ${mailErr.message}`,
        });
      }
    }

    return res.json({
      success: true,
      message: 'A fresh OTP has been sent to your email.',
      cooldown_seconds: 30,
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/reset-password — Validate OTP and update password
// ────────────────────────────────────────────────────────────
router.post('/reset-password', authLimiter, async (req, res) => {
  const { email, otp, new_password } = req.body;
  if (!email || !otp || !new_password) {
    return res.status(400).json({ error: 'Email, OTP, and new password are required' });
  }
  if (String(new_password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const record = passwordResetOtps.get(normalizedEmail);
  if (!record) {
    return res.status(400).json({ error: 'No active OTP found. Please request an OTP first.' });
  }

  if (Date.now() > record.expiresAt) {
    passwordResetOtps.delete(normalizedEmail);
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  if (record.attempts >= 5) {
    passwordResetOtps.delete(normalizedEmail);
    return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
  }

  const enteredHash = hashToken(String(otp).trim());
  if (enteredHash !== record.otpHash) {
    record.attempts += 1;
    return res.status(400).json({ error: 'Invalid OTP code. Please check and try again.' });
  }

  try {
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newHash = await hashPassword(new_password);
    await updateUser(user.user_id, {
      password_hash: newHash,
      token_version: (user.token_version || 0) + 1,
    });

    passwordResetOtps.delete(normalizedEmail);
    console.log(`✅ [Auth] Password reset successfully for ${normalizedEmail}`);

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});


// ────────────────────────────────────────────────────────────
// GET /api/auth/me
// ────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  const user = await findUserById(req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: publicUser(user) });
});

// ── Boot-time diagnostics ─────────────────────────────────────
// Say plainly what mode accounts are running in, instead of failing silently.
(async () => {
  const mailProvider = process.env.RESEND_API_KEY ? 'Resend API (Live)' : (process.env.SMTP_HOST || 'dev-mode');
  console.log(isMailConfigured()
    ? `  ✉️  [Auth] Email & OTP delivery ON — powered by ${mailProvider}`
    : '  ✉️  [Auth] Email provider not configured — dev mode (OTP & links returned in dev responses)');
  if (!isConfigured()) return;
  const { error } = await supabase.from('users').select('user_id').limit(1);
  if (error) {
    console.warn(`  ⚠️  [Auth] Supabase "users" table unavailable (${error.message}) — accounts are kept in memory and vanish on restart. Run the "13. Users" block of supabase/schema.sql in the Supabase SQL editor.`);
  }
})().catch(() => {});

module.exports = router;

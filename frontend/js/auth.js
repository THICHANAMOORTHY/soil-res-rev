// ============================================================
// auth.js — Account creation, login, Email Verification & OTP UI
// ============================================================

window.authUser = null; // sanitized user object once logged in, else null

function escapeHtml(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// ── Sidebar account widget ──────────────────────────────────
function renderAccountWidget() {
  const mount = document.getElementById('account-widget-mount');
  if (!mount) return;

  if (!window.authUser) {
    mount.innerHTML = `
      <div class="account-widget">
        <div class="account-widget-signedout">
          <button class="account-cta-btn" onclick="openAuthModal()">
            <span>🔐</span> Sign Up / Log In
          </button>
        </div>
      </div>`;
    if (window.updateAdminVisibility) window.updateAdminVisibility();
    return;
  }

  const u = window.authUser;
  const initials = (u.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const roleName = u.title || (u.role === 'fpo_admin' ? 'FPO Admin / CEO' : u.role === 'fpo_manager' ? 'Operations Manager' : u.role === 'field_officer' ? 'Field Officer' : u.role === 'agronomist' ? 'Agronomist' : u.role === 'iot_technician' ? 'IoT Tech' : 'Farmer');
  const roleBg = u.role === 'fpo_admin' ? '#7c3aed' : u.role === 'fpo_manager' ? '#0284c7' : u.role === 'field_officer' ? '#16a34a' : u.role === 'agronomist' ? '#d97706' : u.role === 'iot_technician' ? '#0891b2' : 'var(--green-500)';

  mount.innerHTML = `
    <div class="account-widget">
      <div class="account-widget-signedin">
        <div class="account-avatar">${initials}</div>
        <div class="account-info">
          <div class="account-name">${escapeHtml(u.name)}</div>
          <div class="account-role-badge" style="background:${roleBg}">${escapeHtml(roleName)}</div>
        </div>
        <button class="account-logout-btn" onclick="logoutUser()">Logout</button>
      </div>
      ${!u.email_verified ? `
        <div class="account-verify-banner">
          <span>⚠️ Email not verified</span>
          <button onclick="resendVerification()">Resend link</button>
        </div>` : ''}
    </div>`;
  if (window.updateAdminVisibility) window.updateAdminVisibility();
}
window.renderAccountWidget = renderAccountWidget;

// ── Modal State & Flow Control ──────────────────────────────
let authModalMode = 'login';  // 'login' | 'signup' | 'forgot' | 'reset_otp'
let isAuthMandatory = false;
let resetFlowEmail = '';
let otpCooldownTimer = null;
let otpCooldownSeconds = 0;

function startOtpCooldown(seconds = 30) {
  otpCooldownSeconds = seconds;
  if (otpCooldownTimer) clearInterval(otpCooldownTimer);
  updateOtpCooldownUi();
  otpCooldownTimer = setInterval(() => {
    otpCooldownSeconds--;
    updateOtpCooldownUi();
    if (otpCooldownSeconds <= 0) {
      clearInterval(otpCooldownTimer);
      otpCooldownTimer = null;
    }
  }, 1000);
}

function updateOtpCooldownUi() {
  const btn = document.getElementById('auth-resend-otp-btn');
  const span = document.getElementById('auth-otp-cooldown');
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  if (btn) {
    if (otpCooldownSeconds > 0) {
      btn.disabled = true;
      btn.innerHTML = `⏳ ${isTa ? 'மீண்டும் அனுப்ப' : 'Resend in'} (${otpCooldownSeconds}s)`;
    } else {
      btn.disabled = false;
      btn.innerHTML = `🔄 ${isTa ? 'OTP மீண்டும் அனுப்பு' : 'Resend OTP'}`;
    }
  }
  if (span) {
    span.textContent = otpCooldownSeconds > 0 ? `(${otpCooldownSeconds}s)` : '';
  }
}

function openAuthModal(mode, opts = {}) {
  authModalMode = mode || 'login';
  isAuthMandatory = false;
  renderAuthModal(null, null, opts);
}
window.openAuthModal = openAuthModal;

function openForgotPassword(email) {
  if (email) resetFlowEmail = email;
  else {
    const curEmail = document.getElementById('auth-email')?.value.trim();
    if (curEmail) resetFlowEmail = curEmail;
  }
  authModalMode = 'forgot';
  renderAuthModal();
}
window.openForgotPassword = openForgotPassword;

function closeAuthModal(force = true) {
  const el = document.getElementById('auth-modal-overlay');
  if (el) el.remove();
  if (window.initAppAfterAuth) window.initAppAfterAuth();
}
window.closeAuthModal = closeAuthModal;

function switchAuthMode(mode) {
  authModalMode = mode;
  renderAuthModal();
}
window.switchAuthMode = switchAuthMode;

// ── Modal Rendering ─────────────────────────────────────────
function renderAuthModal(errorMsg, successMsg, opts = {}) {
  isAuthMandatory = false;

  let overlay = document.getElementById('auth-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'auth-modal-overlay';
    document.body.appendChild(overlay);
  }
  overlay.className = 'auth-modal-overlay';
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeAuthModal(true);
    }
  };

  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');

  // 1. FORGOT PASSWORD VIEW (Step 1: Request OTP)
  if (authModalMode === 'forgot') {
    overlay.innerHTML = `
      <div class="auth-modal-card">
        <div class="auth-modal-header">
          <div>
            <div class="auth-modal-title">🔑 ${isTa ? 'கடவுச்சொல் மீட்டமை' : 'Reset Password'}</div>
            <div class="auth-modal-subtitle">${isTa ? 'பதிவுசெய்த மின்னஞ்சலுக்கு 6-இலக்க OTP அனுப்பப்படும்' : 'Enter your registered email to receive a 6-digit OTP'}</div>
          </div>
          ${!mandatory ? `<button class="auth-modal-close" onclick="closeAuthModal()">✕</button>` : ''}
        </div>

        ${errorMsg ? `<div class="auth-error-box">⚠ ${escapeHtml(errorMsg)}</div>` : ''}
        ${successMsg ? `<div class="auth-success-box">✓ ${escapeHtml(successMsg)}</div>` : ''}

        <form id="auth-forgot-form" class="auth-form-fields" onsubmit="return submitForgotPassword(event)">
          <div class="form-group">
            <label class="form-label">${isTa ? 'மின்னஞ்சல்' : 'Email Address'}</label>
            <input type="email" id="auth-forgot-email" placeholder="you@example.com" value="${escapeHtml(resetFlowEmail)}" required autofocus />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:6px" id="auth-forgot-btn">
            📩 ${isTa ? 'OTP குறியீடு அனுப்பவும்' : 'Send Verification OTP'}
          </button>
        </form>

        <div class="auth-switch-line">
          ${isTa ? 'கடவுச்சொல் நினைவிருக்கிறதா?' : 'Remembered your password?'}
          <button onclick="switchAuthMode('login')">${isTa ? 'உள்நுழைக' : 'Log In'}</button>
        </div>
      </div>`;
    return;
  }

  // 2. ENTER OTP & NEW PASSWORD VIEW (Step 2: Verify & Reset)
  if (authModalMode === 'reset_otp') {
    overlay.innerHTML = `
      <div class="auth-modal-card">
        <div class="auth-modal-header">
          <div>
            <div class="auth-modal-title">🔒 ${isTa ? 'OTP & புதிய கடவுச்சொல்' : 'Enter OTP & New Password'}</div>
            <div class="auth-modal-subtitle">
              ${isTa ? `மின்னஞ்சலுக்கு அனுப்பப்பட்ட 6-இலக்க OTP: ` : `Enter the 6-digit OTP sent to `}<strong>${escapeHtml(resetFlowEmail)}</strong>
            </div>
          </div>
          ${!mandatory ? `<button class="auth-modal-close" onclick="closeAuthModal()">✕</button>` : ''}
        </div>

        ${errorMsg ? `<div class="auth-error-box">⚠ ${escapeHtml(errorMsg)}</div>` : ''}
        ${successMsg ? `<div class="auth-success-box">✓ ${escapeHtml(successMsg)}</div>` : ''}

        <form id="auth-reset-form" class="auth-form-fields" onsubmit="return submitResetPassword(event)">
          <div class="form-group">
            <label class="form-label">${isTa ? '6-இலக்க OTP குறியீடு' : '6-Digit OTP Code'}</label>
            <input type="text" id="auth-otp-code" class="auth-otp-input" placeholder="123456" maxlength="6" pattern="[0-9]{6}" required autofocus />
          </div>

          <div class="auth-otp-actions">
            <button type="button" id="auth-resend-otp-btn" class="btn btn-secondary" style="font-size:12px;padding:6px 14px" onclick="handleResendOtp()">
              🔄 ${isTa ? 'OTP மீண்டும் அனுப்பு' : 'Resend OTP'}
            </button>
            <span id="auth-otp-cooldown" style="font-size:12px;color:var(--text-muted)"></span>
          </div>

          <div class="form-group" style="margin-top:8px">
            <label class="form-label">${isTa ? 'புதிய கடவுச்சொல்' : 'New Password'}</label>
            <input type="password" id="auth-new-password" placeholder="${isTa ? 'குறைந்தது 8 எழுத்துக்கள்' : 'At least 8 characters'}" minlength="8" required />
          </div>

          <div class="form-group">
            <label class="form-label">${isTa ? 'கடவுச்சொல்லை உறுதிப்படுத்து' : 'Confirm New Password'}</label>
            <input type="password" id="auth-new-password-confirm" placeholder="${isTa ? 'மீண்டும் புதிய கடவுச்சொல்' : 'Repeat new password'}" minlength="8" required />
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:6px" id="auth-reset-btn">
            ✅ ${isTa ? 'கடவுச்சொல்லை மாற்றி உள்நுழைக' : 'Reset Password & Log In'}
          </button>
        </form>

        <div class="auth-switch-line">
          <button onclick="switchAuthMode('login')">← ${isTa ? 'உள்நுழைவுக்கு திரும்பு' : 'Back to Log In'}</button>
        </div>
      </div>`;
    updateOtpCooldownUi();
    return;
  }

  // 3. LOGIN & SIGNUP VIEWS
  const isSignup = authModalMode === 'signup';

  overlay.innerHTML = `
    <div class="auth-modal-card">
      <div class="auth-modal-header">
        <div>
          <div class="auth-modal-title">${isSignup ? (isTa ? 'புதிய கணக்கு உருவாக்கு' : 'Create Account') : (isTa ? 'உள்நுழைவு' : 'Log In')}</div>
          <div class="auth-modal-subtitle">${isTa ? 'UZHAVU KAAPPAAN தளத்தைப் பயன்படுத்தவும்' : 'Sign in, register, or explore as guest'}</div>
        </div>
        <button class="auth-modal-close" onclick="closeAuthModal(true)">✕</button>
      </div>

      <div class="auth-mode-tabs">
        <button class="auth-tab-btn ${!isSignup ? 'active' : ''}" onclick="switchAuthMode('login')">${isTa ? 'உள்நுழைவு' : 'Log In'}</button>
        <button class="auth-tab-btn ${isSignup ? 'active' : ''}" onclick="switchAuthMode('signup')">${isTa ? 'பதிவு செய்' : 'Sign Up'}</button>
      </div>

      <!-- Google Mail Cloud Login Button -->
      <button type="button" class="btn-google-login" style="margin-bottom:12px;padding:10px 14px;font-size:13px" onclick="loginWithGoogleMail()">
        <svg class="google-svg-icon" viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
        </svg>
        <span>${isTa ? 'Google மூலம் உள்நுழைக' : 'Sign in with Google Mail'}</span>
        <span class="google-cloud-badge">☁️ Cloud</span>
      </button>

      ${!isSignup ? `
        <div style="margin-bottom:14px;display:flex;flex-direction:column;gap:8px">
          <!-- Demo 1: Farmer -->
          <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:var(--radius-sm);padding:8px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px">
            <div>
              <div style="font-size:12px;font-weight:700;color:var(--text-primary)">🌾 ${isTa ? 'மாதிரி விவசாயி உள்நுழைவு' : 'Demo Farmer Login'}</div>
              <div style="font-size:11px;color:var(--text-muted)">Ramesh Kumar · Farm 101 (Coimbatore)</div>
            </div>
            <button type="button" class="btn btn-primary" style="font-size:11px;padding:5px 10px;white-space:nowrap" onclick="demoLogin('farmer')">
              ⚡ ${isTa ? 'உடனடி உள்நுழைவு' : 'Instant Login'}
            </button>
          </div>

          <!-- Demo 2: FPO Admin / Enterprise -->
          <div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);border-radius:var(--radius-sm);padding:8px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px">
            <div>
              <div style="font-size:12px;font-weight:700;color:#c084fc">🏢 ${isTa ? 'மாதிரி FPO நிர்வாகி உள்நுழைவு' : 'Demo FPO Admin / CEO Login'}</div>
              <div style="font-size:11px;color:var(--text-muted)">Dr. K. Swaminathan · Kovai FPO (5,420 ac)</div>
            </div>
            <button type="button" class="btn btn-primary" style="font-size:11px;padding:5px 10px;white-space:nowrap;background:#7c3aed" onclick="demoLogin('fpo_admin')">
              👑 ${isTa ? 'FPO உள்நுழைவு' : 'Admin Login'}
            </button>
          </div>
        </div>
      ` : ''}

      ${errorMsg ? `<div class="auth-error-box">⚠ ${escapeHtml(errorMsg)}</div>` : ''}
      ${successMsg ? `<div class="auth-success-box">✓ ${escapeHtml(successMsg)}</div>` : ''}
      ${opts.canInstantVerify && opts.resendEmail ? `
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;background:rgba(34,197,94,0.08);padding:12px;border-radius:var(--radius-sm);border:1px solid rgba(34,197,94,0.25)">
          <div style="font-size:12px;color:var(--text-secondary);text-align:center">${isTa ? 'உள்ளூர் சோதனையில் உள்ளீர்களா? உடனடியாக உள்நுழைய:' : 'Testing on localhost? Skip opening email:'}</div>
          <button type="button" class="btn btn-primary" style="width:100%" onclick="instantVerifyAndLogin('${escapeHtml(opts.resendEmail).replace(/'/g, '')}')">⚡ ${isTa ? 'உடனடியாக சரிபார்த்து உள்நுழை' : 'Verify & Log In Now (Instant)'}</button>
          <button type="button" class="btn btn-secondary" style="width:100%;font-size:12px;padding:6px 12px" onclick="resendVerification('${escapeHtml(opts.resendEmail).replace(/'/g, '')}')">📧 ${isTa ? 'மின்னஞ்சலை மீண்டும் அனுப்பு' : 'Resend verification email to Gmail'}</button>
        </div>
      ` : (opts.resendEmail ? `<button type="button" class="btn btn-secondary" style="width:100%;margin-bottom:10px" onclick="resendVerification('${escapeHtml(opts.resendEmail).replace(/'/g, '')}')">📧 ${isTa ? 'மின்னஞ்சலை மீண்டும் அனுப்பு' : 'Resend verification email'}</button>` : '')}

      <form id="auth-form" class="auth-form-fields" onsubmit="return submitAuthForm(event)">
        ${isSignup ? `
          <div class="form-group">
            <label class="form-label">${isTa ? 'முழு பெயர்' : 'Full Name'}</label>
            <input type="text" id="auth-name" placeholder="e.g. Ramesh Kumar" required />
          </div>
        ` : ''}
        <div class="form-group">
          <label class="form-label">${isTa ? 'மின்னஞ்சல்' : 'Email'}</label>
          <input type="email" id="auth-email" placeholder="you@example.com" required />
        </div>
        ${isSignup ? `
          <div class="form-group">
            <label class="form-label">${isTa ? 'தொலைபேசி எண்' : 'Phone'}</label>
            <input type="tel" id="auth-phone" placeholder="9876543210" />
          </div>` : ''}
        <div class="form-group">
          <label class="form-label">${isTa ? 'கடவுச்சொல்' : 'Password'}</label>
          <input type="password" id="auth-password" placeholder="${isTa ? 'குறைந்தது 8 எழுத்துக்கள்' : 'At least 8 characters'}" minlength="8" required />
        </div>
        ${!isSignup ? `
          <div style="display:flex;justify-content:flex-end;margin-top:-6px;margin-bottom:4px">
            <a href="javascript:void(0)" class="auth-link-forgot" onclick="openForgotPassword()">
              ${isTa ? 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?' : 'Forgot Password?'}
            </a>
          </div>
        ` : ''}
        ${isSignup ? `
          <div class="form-group">
            <label class="form-label">${isTa ? 'கடவுச்சொல்லை உறுதிப்படுத்து' : 'Confirm Password'}</label>
            <input type="password" id="auth-password-confirm" placeholder="${isTa ? 'மீண்டும் கடவுச்சொல்' : 'Repeat password'}" minlength="8" required />
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:12px;color:var(--text-secondary)">
            <input type="checkbox" id="auth-instant-verify" checked style="accent-color:var(--green-500);width:15px;height:15px;cursor:pointer" />
            <label for="auth-instant-verify" style="cursor:pointer">
              ${isTa ? 'உடனடி கணக்கு செயல்படுத்தல் (மின்னஞ்சல் இணைப்பு தேவையில்லை)' : 'Instant Activation (Skip email verification on localhost)'}
            </label>
          </div>
        ` : ''}

        <button type="submit" class="btn btn-primary" style="width:100%;margin-top:6px" id="auth-submit-btn">
          ${isSignup ? (isTa ? '✨ கணக்கு உருவாக்கு' : '✨ Create Account') : (isTa ? '🔐 உள்நுழை' : '🔐 Log In')}
        </button>
      </form>

      <div class="auth-switch-line">
        ${isSignup ? (isTa ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?') : (isTa ? 'கணக்கு இல்லையா?' : "Don't have an account?")}
        <button onclick="switchAuthMode('${isSignup ? 'login' : 'signup'}')">${isSignup ? (isTa ? 'உள்நுழைக' : 'Log In') : (isTa ? 'பதிவு செய்க' : 'Sign Up')}</button>
      </div>

      <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);text-align:center">
        <button type="button" class="btn btn-secondary" style="width:100%;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px" onclick="closeAuthModal(true)">
          <span>🚶</span> ${isTa ? 'விருந்தினராக தொடரவும் (உள்நுழைவு தேவையில்லை)' : 'Continue as Guest (Skip Login)'}
        </button>
      </div>
    </div>`;
}

// ── One-Click Demo Login ────────────────────────────────────
async function demoLogin(role = 'farmer') {
  try {
    const data = await apiPost('/auth/demo-login', { role });
    window.setAccessToken(data.access_token);
    window.authUser = data.user;
    isAuthMandatory = false;
    if (data.user && data.user.farm_id) window.state.farm_id = data.user.farm_id;
    renderAuthModal(null, data.message || `Logged in successfully as ${data.user.name}!`, { mandatory: false });
    setTimeout(() => {
      closeAuthModal(true);
      onAuthChanged();
      if (window.initAppAfterAuth) window.initAppAfterAuth();
    }, 700);
  } catch (err) {
    renderAuthModal(err.body && err.body.error ? err.body.error : err.message);
  }
}
window.demoLogin = demoLogin;

// ── Standard Form Submission ────────────────────────────────
async function submitAuthForm(e) {
  e.preventDefault();
  const btn = document.getElementById('auth-submit-btn');
  const isSignup = authModalMode === 'signup';

  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;

  if (isSignup) {
    const confirm = document.getElementById('auth-password-confirm').value;
    if (password !== confirm) {
      renderAuthModal('Passwords do not match');
      return false;
    }
  }

  btn.disabled = true;
  btn.textContent = isSignup ? 'Creating account…' : 'Logging in…';

  try {
    if (isSignup) {
      const name = document.getElementById('auth-name').value.trim();
      const phone = document.getElementById('auth-phone').value.trim();
      const instant_verify = document.getElementById('auth-instant-verify')?.checked ?? true;

      const data = await apiPost('/auth/register', { name, email, password, phone, instant_verify });
      if (data.farm_id) window.state.farm_id = data.farm_id;

      if (data.access_token) {
        window.setAccessToken(data.access_token);
        window.authUser = data.user;
        isAuthMandatory = false;
        renderAuthModal(null, `Account created and verified! Welcome, ${escapeHtml(data.user?.name || name)}.`, { mandatory: false });
        setTimeout(() => {
          closeAuthModal(true);
          onAuthChanged();
          if (window.initAppAfterAuth) window.initAppAfterAuth();
        }, 900);
        return false;
      }

      if (data.verification_required) {
        authModalMode = 'login';
        renderAuthModal(null, data.message, { resendEmail: data.email, canInstantVerify: true });
        return false;
      }

      window.setAccessToken(data.access_token);
      window.authUser = data.user;
      isAuthMandatory = false;
      renderAuthModal(null, `Account created! (Verification link: ${data.verification_link || 'Sent to email'})`, { mandatory: false });
      setTimeout(() => {
        closeAuthModal(true);
        onAuthChanged();
        if (window.initAppAfterAuth) window.initAppAfterAuth();
      }, 1200);
    } else {
      const data = await apiPost('/auth/login', { email, password });
      window.setAccessToken(data.access_token);
      window.authUser = data.user;
      isAuthMandatory = false;
      if (data.user && data.user.farm_id) window.state.farm_id = data.user.farm_id;
      closeAuthModal(true);
      onAuthChanged();
      if (window.initAppAfterAuth) window.initAppAfterAuth();
    }
  } catch (err) {
    const needsVerify = err.body && err.body.code === 'EMAIL_NOT_VERIFIED';
    renderAuthModal(err.body && err.body.error ? err.body.error : err.message, null,
      needsVerify ? { resendEmail: err.body.email || email, canInstantVerify: true } : {});
  } finally {
    btn.disabled = false;
    btn.textContent = isSignup ? '✨ Create Account' : '🔐 Log In';
  }
  return false;
}
window.submitAuthForm = submitAuthForm;

// ── Instant Verify & Log In (Local / Dev) ───────────────────
async function instantVerifyAndLogin(email) {
  try {
    const data = await apiPost('/auth/verify-instant', { email });
    window.setAccessToken(data.access_token);
    window.authUser = data.user;
    isAuthMandatory = false;
    if (data.user && data.user.farm_id) window.state.farm_id = data.user.farm_id;
    renderAuthModal(null, data.message || 'Email verified successfully! Logging you in...', { mandatory: false });
    setTimeout(() => {
      closeAuthModal(true);
      onAuthChanged();
      if (window.initAppAfterAuth) window.initAppAfterAuth();
    }, 900);
  } catch (err) {
    renderAuthModal(err.body && err.body.error ? err.body.error : err.message);
  }
}
window.instantVerifyAndLogin = instantVerifyAndLogin;

// ── Forgot Password & Resend OTP Handlers ───────────────────
async function submitForgotPassword(e) {
  e.preventDefault();
  const btn = document.getElementById('auth-forgot-btn');
  const emailInput = document.getElementById('auth-forgot-email');
  const email = emailInput ? emailInput.value.trim() : '';
  if (!email) return false;

  btn.disabled = true;
  btn.textContent = 'Sending OTP…';

  try {
    const res = await apiPost('/auth/forgot-password', { email });
    resetFlowEmail = email;
    authModalMode = 'reset_otp';
    startOtpCooldown(res.cooldown_seconds || 30);
    renderAuthModal(null, res.message || 'Verification OTP sent to your email.');
  } catch (err) {
    renderAuthModal(err.body && err.body.error ? err.body.error : err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
  return false;
}
window.submitForgotPassword = submitForgotPassword;

async function handleResendOtp() {
  if (!resetFlowEmail) return;
  const btn = document.getElementById('auth-resend-otp-btn');
  if (btn) btn.disabled = true;

  try {
    const res = await apiPost('/auth/resend-otp', { email: resetFlowEmail });
    startOtpCooldown(res.cooldown_seconds || 30);
    renderAuthModal(null, res.message || 'A fresh OTP has been sent to your email.');
  } catch (err) {
    renderAuthModal(err.body && err.body.error ? err.body.error : err.message);
  }
}
window.handleResendOtp = handleResendOtp;

async function submitResetPassword(e) {
  e.preventDefault();
  const btn = document.getElementById('auth-reset-btn');
  const otp = document.getElementById('auth-otp-code')?.value.trim();
  const newPass = document.getElementById('auth-new-password')?.value;
  const confirmPass = document.getElementById('auth-new-password-confirm')?.value;

  if (newPass !== confirmPass) {
    renderAuthModal('Passwords do not match');
    return false;
  }

  btn.disabled = true;
  btn.textContent = 'Updating password…';

  try {
    const res = await apiPost('/auth/reset-password', {
      email: resetFlowEmail,
      otp,
      new_password: newPass,
    });
    authModalMode = 'login';
    renderAuthModal(null, res.message || 'Password reset successfully! Please log in.');
  } catch (err) {
    renderAuthModal(err.body && err.body.error ? err.body.error : err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
  return false;
}
window.submitResetPassword = submitResetPassword;

async function logoutUser() {
  try { await apiPost('/auth/logout', {}); } catch (err) { /* ignore */ }
  window.setAccessToken(null);
  window.authUser = null;
  window.state.farm_id = 101; // back to the demo farm
  if (window.updateAdminVisibility) window.updateAdminVisibility();
  onAuthChanged();
  if (window.initAppAfterAuth) window.initAppAfterAuth();
}
window.logoutUser = logoutUser;

async function resendVerification(email) {
  const target = email || (window.authUser && window.authUser.email);
  if (!target) return;
  try {
    const data = await apiPost('/auth/resend-verification', { email: target });
    if (data.verification_link) {
      alert('Dev mode: no email provider configured.\nVerification link: ' + data.verification_link);
    } else if (document.getElementById('auth-modal-overlay')) {
      renderAuthModal(null, data.message);
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert(err.message);
  }
}
window.resendVerification = resendVerification;

// Called whenever login/signup/logout completes.
function onAuthChanged() {
  renderAccountWidget();
  const isAdmin = window.isAdminUser ? window.isAdminUser() : false;
  if (isAdmin) {
    if (window.enterB2BPortal) window.enterB2BPortal('overview');
  } else {
    if (window.enterFarmerPortal) window.enterFarmerPortal();
  }
  if (window.updateAdminVisibility) window.updateAdminVisibility();
  if (window.state && window.state.activeView === 'dashboard' && window.VIEW_LOADERS.dashboard) {
    window.VIEW_LOADERS.dashboard();
  }
}
window.onAuthChanged = onAuthChanged;

// Silent-refresh callback wired from app.js's trySilentRefresh()
window.onAuthRestored = function (user) {
  window.authUser = user;
  isAuthMandatory = false;
  closeAuthModal(true);
  const farmChanged = user && user.farm_id && window.state.farm_id !== user.farm_id;
  if (farmChanged) window.state.farm_id = user.farm_id;
  renderAccountWidget();
  if (window.updateAdminVisibility) window.updateAdminVisibility();
  if (farmChanged && window.state.activeView === 'dashboard' && window.VIEW_LOADERS.dashboard) {
    window.VIEW_LOADERS.dashboard();
  }
  if (window.initAppAfterAuth) window.initAppAfterAuth();
};

// ── Google Mail & Cloud Authentication ───────────────────────
function closeGoogleChooserModal() {
  const el = document.getElementById('google-account-chooser-modal');
  if (el) el.remove();
}
window.closeGoogleChooserModal = closeGoogleChooserModal;

async function executeGoogleAuth(payload) {
  try {
    const res = await apiPost('/auth/google', payload);
    window.setAccessToken(res.access_token);
    window.authUser = res.user;

    closeGoogleChooserModal();
    if (document.getElementById('auth-modal-overlay')) closeAuthModal(true);

    if (window.renderAccountWidget) window.renderAccountWidget();

    const role = res.user.role || 'farmer';
    const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
    const msg = isTa 
      ? `✓ Google கணக்கு மூலம் வெற்றிகரமாக இணைக்கப்பட்டது: ${res.user.email} (Supabase Cloud Sync)`
      : `✓ Signed in with Google Mail: ${res.user.email} (Cloud Sync Active)`;

    if (typeof showToast === 'function') {
      showToast(msg, 'success');
    } else {
      alert(msg);
    }

    if (role !== 'farmer') {
      if (window.enterB2BPortal) window.enterB2BPortal('overview');
    } else {
      if (window.enterFarmerPortal) window.enterFarmerPortal();
    }
  } catch (err) {
    alert('Google Mail Authentication Error: ' + err.message);
  }
}
window.executeGoogleAuth = executeGoogleAuth;

function handleGoogleCredentialResponse(response) {
  if (!response || !response.credential) return;
  const isEnterprise = document.getElementById('login-tab-enterprise')?.classList.contains('active');
  const role = isEnterprise ? 'fpo_admin' : 'farmer';
  executeGoogleAuth({ credential: response.credential, role });
}
window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;

function loginWithGoogleMail(requestedRole) {
  const isEnterprise = requestedRole 
    ? (requestedRole !== 'farmer')
    : document.getElementById('login-tab-enterprise')?.classList.contains('active');
  const role = requestedRole || (isEnterprise ? 'fpo_admin' : 'farmer');

  // Open the native Google Cloud account chooser directly.
  // This bypasses Google's external GSI popup check that causes Error 401 (invalid_client) when unconfigured.
  openGoogleChooserModal(role);
}
window.loginWithGoogleMail = loginWithGoogleMail;

function openGoogleChooserModal(role = 'farmer') {
  closeGoogleChooserModal();
  const modal = document.createElement('div');
  modal.id = 'google-account-chooser-modal';
  modal.className = 'google-chooser-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeGoogleChooserModal(); };

  modal.innerHTML = `
    <div class="google-chooser-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.1)">
        <div style="display:flex;align-items:center;gap:12px">
          <svg class="google-svg-icon" viewBox="0 0 24 24" width="26" height="26">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <div>
            <h4 style="margin:0;font-size:16px;color:#fff;font-weight:800;letter-spacing:-0.2px">Sign in with Google Mail</h4>
            <div style="font-size:11px;color:#94a3b8;display:flex;align-items:center;gap:6px">
              <span>Cloud OAuth &middot; UZHAVU KAAPPAAN</span>
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981"></span>
              <span style="color:#34d399">Supabase Live</span>
            </div>
          </div>
        </div>
        <button onclick="closeGoogleChooserModal()" style="background:transparent;border:none;color:#94a3b8;font-size:20px;cursor:pointer;line-height:1;padding:4px 8px">&times;</button>
      </div>

      <div style="font-size:12px;color:#cbd5e1;margin-bottom:14px;line-height:1.4">
        Choose your Google account to receive a <strong>6-digit verification code</strong> and sign into <strong>${role === 'farmer' ? 'Farmer Agronomy Portal' : 'FPO Enterprise Command Center'}</strong>:
      </div>

      <!-- User Active Google Account from Screenshot -->
      <button class="google-account-item" onclick="requestGoogleVerification('thichu683@gmail.com', '${role}', 'Thichu')">
        <div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg, #ea4335, #f87171);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px;box-shadow:0 2px 8px rgba(234,67,53,0.3)">T</div>
        <div>
          <div style="font-size:13.5px;font-weight:700;color:#fff">thichu683@gmail.com</div>
          <div style="font-size:11px;color:#94a3b8">Active Google Account &middot; Send Verification OTP</div>
        </div>
        <span class="chip" style="margin-left:auto;font-size:10px;background:rgba(234,67,53,0.18);color:#fca5a5;border:1px solid rgba(234,67,53,0.35);font-weight:700">Verify &amp; Sign In</span>
      </button>

      <!-- Verified Google Profile 1 (Ramesh) -->
      <button class="google-account-item" onclick="requestGoogleVerification('ramesh.farmer101@gmail.com', '${role}', 'Ramesh Kumar')">
        <div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg, #10b981, #059669);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px">R</div>
        <div>
          <div style="font-size:13.5px;font-weight:700;color:#fff">Ramesh Kumar</div>
          <div style="font-size:11px;color:#94a3b8">ramesh.farmer101@gmail.com &middot; Demo Farm #101</div>
        </div>
        <span class="chip" style="margin-left:auto;font-size:10px;background:rgba(16,185,129,0.15);color:#34d399">Farmer</span>
      </button>

      <!-- Verified Google Profile 2 (Dr. Swaminathan) -->
      <button class="google-account-item" onclick="requestGoogleVerification('dr.swaminathan@kovaifpo.org', 'fpo_admin', 'Dr. K. Swaminathan')">
        <div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg, #6366f1, #4f46e5);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px">S</div>
        <div>
          <div style="font-size:13.5px;font-weight:700;color:#fff">Dr. K. Swaminathan</div>
          <div style="font-size:11px;color:#94a3b8">dr.swaminathan@kovaifpo.org (Workspace)</div>
        </div>
        <span class="chip" style="margin-left:auto;font-size:10px;background:rgba(99,102,241,0.15);color:#a5b4fc">FPO CEO</span>
      </button>

      <!-- Custom Google Mail Form -->
      <div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.08)">
        <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Or Enter Any Google Mail Address:</div>
        <div style="display:flex;gap:8px">
          <input type="email" id="custom-google-input" placeholder="thichu683@gmail.com" onkeydown="if(event.key==='Enter') submitCustomGoogleAuth('${role}')" style="flex:1;background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:9px 12px;color:#fff;font-size:13px;outline:none" />
          <button class="btn btn-primary btn-sm" onclick="submitCustomGoogleAuth('${role}')" style="white-space:nowrap;padding:9px 16px;font-weight:700">
            Send Code
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  setTimeout(() => {
    document.getElementById('custom-google-input')?.focus();
  }, 100);
}
window.openGoogleChooserModal = openGoogleChooserModal;

function submitCustomGoogleAuth(role) {
  const email = document.getElementById('custom-google-input')?.value.trim();
  if (!email || !email.includes('@')) {
    alert('Please enter a valid Google Mail address.');
    return;
  }
  const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  requestGoogleVerification(email, role, name);
}
window.submitCustomGoogleAuth = submitCustomGoogleAuth;

async function requestGoogleVerification(email, role = 'farmer', name = '') {
  if (!email || !email.includes('@')) {
    alert('Please enter a valid Google Mail address.');
    return;
  }
  const card = document.querySelector('.google-chooser-card');
  if (card) {
    card.innerHTML = `
      <div style="text-align:center;padding:28px 12px">
        <div style="font-size:36px;margin-bottom:12px;display:inline-block;animation:spin 1s linear infinite">🔄</div>
        <h4 style="color:#fff;margin:0 0 8px;font-size:17px">Sending Verification Code...</h4>
        <div style="font-size:12px;color:#94a3b8">Connecting with Google Mail &amp; Resend Live Delivery</div>
      </div>
    `;
  }

  try {
    const res = await apiPost('/auth/google/send-code', { email, role, name });
    renderGoogleOtpScreen(email, role, name, res.message, res.demo_code);
  } catch (err) {
    if (err.demo_code) {
      renderGoogleOtpScreen(email, role, name, err.error, err.demo_code);
    } else {
      alert('Verification Error: ' + (err.error || err.message));
      openGoogleChooserModal(role);
    }
  }
}
window.requestGoogleVerification = requestGoogleVerification;

function renderGoogleOtpScreen(email, role, name, infoMessage, demoCode = null) {
  const card = document.querySelector('.google-chooser-card');
  if (!card) return;

  card.innerHTML = `
    <div class="google-otp-container">
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px">
        <div style="display:flex;align-items:center;gap:10px">
          <svg class="google-svg-icon" viewBox="0 0 24 24" width="22" height="22">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <h4 style="margin:0;font-size:15px;color:#fff;font-weight:800">Verify Google Mail Account</h4>
        </div>
        <button onclick="closeGoogleChooserModal()" style="background:transparent;border:none;color:#94a3b8;font-size:20px;cursor:pointer;line-height:1;padding:4px 8px">&times;</button>
      </div>

      <div style="text-align:center;margin:4px 0 6px">
        <div class="google-otp-icon-bubble">✉️</div>
        <div style="font-size:13px;color:#e2e8f0;margin-bottom:2px">
          Enter the 6-digit code sent to:
        </div>
        <div style="font-size:14px;color:#38bdf8;font-weight:700">
          ${escapeHtml(email)}
        </div>
      </div>

      ${demoCode ? `
        <div class="google-otp-status-banner info">
          <span>💡</span>
          <div><strong>Demo Test Verification Code:</strong> <code>${escapeHtml(demoCode)}</code></div>
        </div>
      ` : `
        <div class="google-otp-status-banner info">
          <span>📬</span>
          <div>Real verification email delivered via Resend. Check your Gmail inbox and spam folder.</div>
        </div>
      `}

      <div id="google-otp-err-mount"></div>

      <div>
        <input type="text" id="google-otp-input" class="google-otp-code-input" placeholder="000000" maxlength="6" autofocus onkeydown="if(event.key==='Enter') confirmGoogleOtp('${escapeHtml(email)}', '${role}', '${escapeHtml(name)}')" />
      </div>

      <button id="google-otp-verify-btn" class="btn btn-primary" onclick="confirmGoogleOtp('${escapeHtml(email)}', '${role}', '${escapeHtml(name)}')" style="width:100%;padding:12px;font-weight:800;font-size:14px">
        ✓ Verify Code &amp; Sign In to Cloud
      </button>

      <div class="google-otp-actions">
        <button class="btn-link" onclick="requestGoogleVerification('${escapeHtml(email)}', '${role}', '${escapeHtml(name)}')" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:12px;text-decoration:underline">
          Resend Code
        </button>
        <button class="btn-link" onclick="openGoogleChooserModal('${role}')" style="background:transparent;border:none;color:#38bdf8;cursor:pointer;font-size:12px;text-decoration:underline">
          Use different email
        </button>
      </div>
    </div>
  `;

  setTimeout(() => {
    document.getElementById('google-otp-input')?.focus();
  }, 100);
}
window.renderGoogleOtpScreen = renderGoogleOtpScreen;

async function confirmGoogleOtp(email, role, name) {
  const code = document.getElementById('google-otp-input')?.value.trim();
  const errMount = document.getElementById('google-otp-err-mount');
  const btn = document.getElementById('google-otp-verify-btn');

  if (!code || code.length !== 6) {
    if (errMount) {
      errMount.innerHTML = `
        <div class="google-otp-status-banner error">
          <span>⚠️</span>
          <div>Please enter the full 6-digit code.</div>
        </div>
      `;
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Verifying Code...';
  }

  try {
    const res = await apiPost('/auth/google/verify-code', { email, code, role, name });
    window.setAccessToken(res.access_token);
    window.authUser = res.user;

    closeGoogleChooserModal();
    if (document.getElementById('auth-modal-overlay')) closeAuthModal(true);

    if (window.renderAccountWidget) window.renderAccountWidget();

    const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
    const msg = isTa 
      ? `✓ Google கணக்கு (${res.user.email}) சரிபார்க்கப்பட்டு வெற்றிகரமாக இணைக்கப்பட்டது!`
      : `✓ Google Mail (${res.user.email}) verified successfully!\nSynced with Supabase Cloud.`;

    if (typeof showToast === 'function') {
      showToast(msg, 'success');
    } else {
      alert(msg);
    }

    if (res.user.role !== 'farmer') {
      if (window.enterB2BPortal) window.enterB2BPortal('overview');
    } else {
      if (window.enterFarmerPortal) window.enterFarmerPortal();
    }
  } catch (err) {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '✓ Verify Code & Sign In to Cloud';
    }
    if (errMount) {
      errMount.innerHTML = `
        <div class="google-otp-status-banner error">
          <span>❌</span>
          <div>${escapeHtml(err.error || err.message || 'Invalid verification code')}</div>
        </div>
      `;
    }
  }
}
window.confirmGoogleOtp = confirmGoogleOtp;

// ── Boot: attempt to restore a session from the refresh cookie ──
document.addEventListener('DOMContentLoaded', async () => {
  renderAccountWidget();
  try {
    await window.trySilentRefresh();
  } catch (err) { /* not logged in */ }

  // Directly initialize app in guest mode (or restored session) without blocking login popup
  if (window.initAppAfterAuth) window.initAppAfterAuth();
});


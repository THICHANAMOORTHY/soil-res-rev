// ============================================================
// mailer.js — Transactional email (account verification)
// Generic SMTP via nodemailer, so any provider works (Gmail app
// password, Brevo, SendGrid/SES SMTP, Mailgun, ...). Configured
// entirely through env vars; when SMTP isn't configured the app runs
// in "dev mode" and auth.js falls back to returning the link directly.
// ============================================================

const nodemailer = require('nodemailer');

function isMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.MAIL_FROM));
}

let transport = null;
function getTransport() {
  if (transport) return transport;
  const port = Number(process.env.SMTP_PORT) || 587;
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 = implicit TLS; 587/25 = STARTTLS (upgraded automatically)
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    // Don't let a dead SMTP server hang the request.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return transport;
}

async function sendMailMessage({ to, subject, text, html }) {
  if (process.env.RESEND_API_KEY) {
    const from = process.env.MAIL_FROM || 'UZHAVU KAAPPAAN <onboarding@resend.dev>';
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'UZHAVU-KAAPPAAN/1.0',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ [Resend Error] Failed to send email to ${to}:`, errText);
      throw new Error(`Resend API failed (${res.status}): ${errText}`);
    }
    const result = await res.json();
    console.log(`✉️ [Resend-Success] Email sent to ${to}! Message ID: ${result.id}`);
    return result;
  }

  if (process.env.SMTP_HOST && process.env.MAIL_FROM) {
    return getTransport().sendMail({ from: process.env.MAIL_FROM, to, subject, text, html });
  }

  console.log(`[Mail-Dev] No email service configured. Target: ${to} | Subject: ${subject}`);
  return { dev: true };
}

// Base URL used to build links in emails.
function appBaseUrl(req) {
  const configured = process.env.APP_BASE_URL;
  if (configured) return configured.replace(/\/+$/, '');
  if (req) {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || (typeof req.get === 'function' ? req.get('host') : null);
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      return `${proto}://${host}`;
    }
  }
  // If running locally, check if we have a LAN IP so mobile phones can connect
  return `http://10.216.224.129:${process.env.PORT || 3000}`;
}

function buildVerificationLink(token, req) {
  return `${appBaseUrl(req)}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

async function sendVerificationEmail({ to, name, link }) {
  const safeName = escapeHtml(name || 'there');
  const subject = 'Verify your email — UZHAVU KAAPPAAN (உழவு காப்பான்)';

  const text =
`Hello ${name || 'there'},

Welcome to UZHAVU KAAPPAAN. Please confirm your email address by opening this link (valid for 24 hours):

${link}

உங்கள் மின்னஞ்சலை உறுதிப்படுத்த மேலே உள்ள இணைப்பைத் திறக்கவும்.

If you didn't create this account, you can ignore this email.`;

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f2937">
  <h2 style="color:#15803d;margin:0 0 12px">🌱 UZHAVU KAAPPAAN</h2>
  <p>Hello ${safeName},</p>
  <p>Welcome! Please confirm your email address to activate your account.</p>
  <p style="margin:24px 0">
    <a href="${escapeHtml(link)}" style="background:#16a34a;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Verify my email</a>
  </p>
  <p style="color:#6b7280;font-size:13px">உங்கள் மின்னஞ்சலை உறுதிப்படுத்த மேலே உள்ள பொத்தானை அழுத்தவும்.</p>
  <p style="color:#6b7280;font-size:13px">This link is valid for 24 hours. If the button doesn't work, paste this into your browser:<br>
    <span style="word-break:break-all">${escapeHtml(link)}</span></p>
  <p style="color:#6b7280;font-size:13px">If you didn't create this account, you can ignore this email.</p>
</div>`;

  return sendMailMessage({ to, subject, text, html });
}

async function sendOtpEmail({ to, name, otp }) {
  const safeName = escapeHtml(name || 'Farmer');
  const subject = `Password Reset OTP: ${otp} — UZHAVU KAAPPAAN (உழவு காப்பான்)`;

  const text =
`Hello ${name || 'Farmer'},

You requested a password reset for your UZHAVU KAAPPAAN account.
Your 6-digit verification OTP is:

${otp}

This OTP is valid for 10 minutes.
உங்கள் கடவுச்சொல் மீட்டமைப்பு OTP குறியீடு: ${otp} (10 நிமிடங்களுக்கு மட்டுமே செல்லுபடியாகும்).

If you did not request this, please ignore this email.`;

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;color:#1f2937;border:1px solid #e5e7eb">
  <div style="text-align:center;margin-bottom:18px">
    <h2 style="color:#15803d;margin:0 0 6px">🌱 UZHAVU KAAPPAAN</h2>
    <span style="font-size:13px;color:#6b7280">Smart Crop Rotation & Soil Restorer (உழவு காப்பான்)</span>
  </div>
  <p>Hello <strong>${safeName}</strong>,</p>
  <p>We received a request to reset your password. Use the following 6-digit OTP to complete your verification:</p>
  <div style="text-align:center;margin:28px 0">
    <div style="display:inline-block;letter-spacing:8px;font-size:32px;font-weight:bold;color:#15803d;background:#ecfdf5;padding:14px 28px;border-radius:10px;border:2px dashed #10b981">
      ${escapeHtml(otp)}
    </div>
  </div>
  <p style="font-size:13px;color:#047857;text-align:center">
    🔑 உங்கள் கடவுச்சொல் மீட்டமைப்பு OTP குறியீடு மேலே உள்ளது (10 நிமிடங்கள் வரை செல்லுபடியாகும்).
  </p>
  <p style="font-size:12px;color:#6b7280;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:12px">
    This OTP will expire in <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email.
  </p>
</div>`;

  return sendMailMessage({ to, subject, text, html });
}

async function sendGoogleAuthOtpEmail({ to, name, otp }) {
  const safeName = escapeHtml(name || 'Farmer');
  const subject = `Google Mail Verification Code: ${otp} — UZHAVU KAAPPAAN`;

  const text =
`Hello ${name || 'there'},

Your 6-digit Google Mail verification code for UZHAVU KAAPPAAN Cloud is:

${otp}

This code is valid for 10 minutes.
உங்கள் Google மின்னஞ்சல் சரிபார்ப்பு குறியீடு: ${otp} (10 நிமிடங்களுக்கு மட்டுமே செல்லுபடியாகும்).

If you did not request this, please ignore this email.`;

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#ffffff;border-radius:14px;color:#1f2937;border:1px solid #e2e8f0;box-shadow:0 4px 12px rgba(0,0,0,0.06)">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;border-bottom:1px solid #f1f5f9;padding-bottom:14px">
    <div style="font-size:24px">🌱</div>
    <div>
      <h3 style="color:#15803d;margin:0;font-size:17px">UZHAVU KAAPPAAN</h3>
      <span style="font-size:12px;color:#64748b">Google Mail & Cloud Verification (உழவு காப்பான்)</span>
    </div>
  </div>
  <p style="font-size:14px;color:#334155">Hello <strong>${safeName}</strong>,</p>
  <p style="font-size:13.5px;color:#475569;line-height:1.5">
    We received a request to sign in with your Google Mail account (<strong>${escapeHtml(to)}</strong>).
    Please use the following 6-digit verification code to complete your sign-in:
  </p>
  <div style="text-align:center;margin:24px 0">
    <div style="display:inline-block;letter-spacing:10px;font-size:34px;font-weight:800;color:#1e293b;background:#f8fafc;padding:14px 28px;border-radius:10px;border:2px solid #cbd5e1">
      ${escapeHtml(otp)}
    </div>
  </div>
  <p style="font-size:13px;color:#16a34a;text-align:center;font-weight:600">
    ✓ இந்த குறியீடு 10 நிமிடங்களுக்கு மட்டுமே செல்லுபடியாகும்.
  </p>
  <p style="font-size:12px;color:#94a3b8;margin-top:20px;border-top:1px solid #f1f5f9;padding-top:12px">
    Security notice: If you did not attempt to sign in, no action is needed. Never share this code with anyone.
  </p>
</div>`;

  return sendMailMessage({ to, subject, text, html });
}

module.exports = {
  isMailConfigured,
  getTransport,
  sendMailMessage,
  sendVerificationEmail,
  sendOtpEmail,
  sendGoogleAuthOtpEmail,
  buildVerificationLink,
};

// ============================================================
// supabase.js — Supabase client & repository layer with resilient fallback
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const dns = require('dns');
const { createClient } = require('@supabase/supabase-js');
const memDb = require('../data/seed');

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_KEY || '';

const hasCredentials = Boolean(
  url &&
  key &&
  !url.includes('your-project') &&
  !key.includes('your-anon')
);

let supabase = null;
let isAvailable = false;

if (hasCredentials) {
  try {
    const hostname = new URL(url).hostname;
    supabase = createClient(url, key, {
      auth: { persistSession: false },
      global: {
        fetch: (...args) => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);
          return fetch(args[0], { ...args[1], signal: controller.signal })
            .finally(() => clearTimeout(timer));
        }
      }
    });

    dns.lookup(hostname, (err) => {
      if (err) {
        console.warn(`  ⚠️  [Database] Supabase host '${hostname}' is unreachable (${err.code}). Using in-memory fallback.`);
        isAvailable = false;
        supabase = null;
      } else {
        isAvailable = true;
        console.log('  ⚡ [Database] Connected to Supabase Cloud:', url);
      }
    });
  } catch (err) {
    console.error('  ⚠️ [Database] Failed to initialize Supabase client:', err.message);
    supabase = null;
    isAvailable = false;
  }
} else {
  console.log('  ℹ️ [Database] Supabase credentials not set in .env. Using in-memory fallback.');
}

module.exports = {
  supabase,
  isConfigured: () => Boolean(supabase && isAvailable),
  memDb,
};

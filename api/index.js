// ============================================================
// api/index.js — Vercel Serverless Function Entrypoint
// Bridges Express REST API to Vercel Serverless Architecture
// ============================================================

const app = require('../backend/server');

module.exports = app;

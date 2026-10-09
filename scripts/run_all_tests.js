// ============================================================
// run_all_tests.js — Master Test Suite Runner for UZHAVU KAAPPAAN
// Runs all verification suites and reports aggregated results
// ============================================================

const { spawnSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const testSuites = [
  { name: 'Uzhavu Crop ML Model & Decision Trees (300 Trees)', cmd: 'python', args: ['-u', 'test_ml_model_integration.py'] },
  { name: 'B2B FPO Command Center (Registered Farms)', cmd: 'python', args: ['-u', 'test_b2b_apis.py'] },
  { name: 'DairyFeed AI & Silage Integration Suite', cmd: 'python', args: ['-u', 'test_dairyfeed_integration.py'] },
  { name: 'Full System 17-Endpoint Health Check', cmd: 'python', args: ['-u', 'test_full_system.py'] },
  { name: 'Auth & Password Reset OTP Suite', cmd: 'python', args: ['-u', 'test_auth_otp_suite.py'] },
  { name: 'Farmer Soil Health Action Plan PDF Dynamics', cmd: 'python', args: ['-u', 'test_pdf_content.py'] },
  { name: 'AI Precision Agronomist Chatbot Suite (11 Cases)', cmd: 'python', args: ['-u', 'test_chatbot_suite.py'] },
  { name: 'Smart Fertilizer Recommendation & ML Suite', cmd: 'python', args: ['-u', 'test_fertilizer_feature.py'] }
];

console.log('\n' + '='.repeat(70));
console.log('  🌱 UZHAVU KAAPPAAN — MASTER TEST SUITE RUNNER');
console.log('='.repeat(70) + '\n');

let passedCount = 0;
let failedCount = 0;
const results = [];

for (const suite of testSuites) {
  console.log(`\n▶ Running: ${suite.name}...`);
  const start = Date.now();
  
  const res = spawnSync(suite.cmd, suite.args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  if (res.status === 0) {
    passedCount++;
    results.push({ name: suite.name, status: 'PASS', duration: `${duration}s` });
    console.log(`\n✔ [PASS] ${suite.name} (${duration}s)`);
  } else {
    failedCount++;
    results.push({ name: suite.name, status: 'FAIL', duration: `${duration}s` });
    console.log(`\n✖ [FAIL] ${suite.name} (${duration}s) - Exit Code ${res.status}`);
  }
}

console.log('\n' + '='.repeat(70));
console.log('  TEST SUMMARY REPORT');
console.log('='.repeat(70));

results.forEach(r => {
  const icon = r.status === 'PASS' ? '✔' : '✖';
  console.log(`  ${icon} [${r.status}] ${r.name.padEnd(52)} ${r.duration}`);
});

console.log('-'.repeat(70));
console.log(`  Total: ${testSuites.length} Suites | Passed: ${passedCount} | Failed: ${failedCount}`);
console.log('='.repeat(70) + '\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL SYSTEM TEST SUITES COMPLETED SUCCESSFULLY (100% PASS)!\n');
  process.exit(0);
}

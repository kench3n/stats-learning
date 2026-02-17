/**
 * EXTENDED TEST RUNNER
 * Run: node tests/run_extended.js
 *
 * Runs the original 185 tests, then the new extended test suites.
 * Tests are SACRED. Never edit test files to make them pass.
 * Fix the SOURCE code instead.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('\n╔════════════════════════════════════════╗');
console.log('║  STATS HUB — EXTENDED TEST SUITE       ║');
console.log('╚════════════════════════════════════════╝\n');

let totalPassed = 0, totalFailed = 0;

function runSuite(name, file) {
  console.log('\n▶ Running: ' + name);
  console.log('─'.repeat(44));
  try {
    const output = execSync(
      'node ' + path.join(__dirname, '..', file),
      { encoding: 'utf8', cwd: path.join(__dirname, '..') }
    );
    console.log(output);
    // Check TOTAL first (run_all.js format), then RESULTS (individual file format)
    const mt = output.match(/TOTAL:\s*(\d+)\s*passed,\s*(\d+)\s*failed/);
    const m = mt || output.match(/RESULTS:\s*(\d+)\s*passed,\s*(\d+)\s*failed/);
    if (m) {
      totalPassed += parseInt(m[1], 10);
      totalFailed += parseInt(m[2], 10);
    }
  } catch(e) {
    const output = e.stdout || '';
    console.log(output);
    const mt = output.match(/TOTAL:\s*(\d+)\s*passed,\s*(\d+)\s*failed/);
    const m = mt || output.match(/RESULTS:\s*(\d+)\s*passed,\s*(\d+)\s*failed/);
    if (m) {
      totalPassed += parseInt(m[1], 10);
      totalFailed += parseInt(m[2], 10);
    } else {
      totalFailed++;
      console.log('FATAL: ' + name + ' failed to run');
      if (e.stderr) console.log(e.stderr);
    }
  }
}

// Original 185 tests
runSuite('HTML/CSS + Problems + Math + Visualizers (original)', 'tests/run_all.js');

// New extended tests
runSuite('Engagement Data Validation', 'tests/validate_engagement.js');
runSuite('UI Features Validation', 'tests/validate_ui_features.js');
runSuite('New Units 12-14 Validation', 'tests/validate_new_units.js');

console.log('\n╔════════════════════════════════════════╗');
console.log('║  EXTENDED TOTAL: ' + totalPassed + ' passed, ' + totalFailed + ' failed' + ' '.repeat(Math.max(0, 20 - String(totalPassed).length - String(totalFailed).length)) + '║');
console.log('╚════════════════════════════════════════╝\n');

if (totalFailed > 0) {
  console.log('STATUS: FAILING — fix source code (never tests)\n');
  process.exit(1);
} else {
  console.log('STATUS: ALL PASSING\n');
}

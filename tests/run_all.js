/**
 * MASTER TEST RUNNER
 * Run: node tests/run_all.js
 *
 * Executes all validation suites and reports aggregate results.
 * Tests are SACRED. Never edit test files to make them pass.
 * Fix the SOURCE code instead.
 */

const { execSync } = require('child_process');
const path = require('path');

const suites = [
  { name: 'HTML/CSS Validation', file: 'validate_html.js' },
  { name: 'Problem Validation', file: 'validate_problems.js' },
  { name: 'Math Correctness', file: 'validate_math.js' },
  { name: 'Visualizer Validation', file: 'validate_visualizers.js' },
];

console.log('\n╔════════════════════════════════════════╗');
console.log('║     STATS HUB — FULL TEST SUITE        ║');
console.log('╚════════════════════════════════════════╝\n');

let totalPassed = 0, totalFailed = 0;

suites.forEach(suite => {
  console.log(`\n▶ Running: ${suite.name}`);
  console.log('─'.repeat(44));

  try {
    const output = execSync(`node "${path.join(__dirname, suite.file)}"`, {
      encoding: 'utf8',
      timeout: 30000,
      cwd: path.join(__dirname, '..')
    });
    console.log(output);

    // Parse results from output
    const match = output.match(/RESULTS:\s*(\d+)\s*passed,\s*(\d+)\s*failed/);
    if (match) {
      totalPassed += parseInt(match[1]);
      totalFailed += parseInt(match[2]);
    }
  } catch (e) {
    console.log(e.stdout || '');
    console.log(e.stderr || '');

    const match = (e.stdout || '').match(/RESULTS:\s*(\d+)\s*passed,\s*(\d+)\s*failed/);
    if (match) {
      totalPassed += parseInt(match[1]);
      totalFailed += parseInt(match[2]);
    } else {
      totalFailed++;
    }
  }
});

console.log('\n╔════════════════════════════════════════╗');
console.log(`║  TOTAL: ${totalPassed} passed, ${totalFailed} failed${' '.repeat(Math.max(0, 18 - String(totalPassed).length - String(totalFailed).length))}║`);
console.log('╚════════════════════════════════════════╝\n');

if (totalFailed > 0) {
  console.log('STATUS: FAILING — fix source code (never tests)\n');
  process.exit(1);
} else {
  console.log('STATUS: ALL PASSING\n');
  process.exit(0);
}

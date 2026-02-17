/**
 * HTML STRUCTURE VALIDATION SUITE
 * Run: node tests/validate_html.js
 *
 * Tests are SACRED. Never edit this file to make it pass.
 * Fix the SOURCE code instead.
 */

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'stats_hub.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const cssPath = path.join(__dirname, '..', 'styles', 'stats_hub.css');
const css = fs.readFileSync(cssPath, 'utf8');

const jsPath = path.join(__dirname, '..', 'scripts', 'stats_hub.js');
const js = fs.readFileSync(jsPath, 'utf8');

let passed = 0, failed = 0, errors = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    failed++;
    errors.push({ name, error: e.message });
    console.log(`  FAIL  ${name}`);
    console.log(`        ${e.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

console.log('\n====================================');
console.log('  HTML/CSS VALIDATION SUITE');
console.log('====================================\n');

// ── HTML Structure ──
console.log('── HTML Structure ──');

test('HTML has DOCTYPE', () => {
  assert(html.trimStart().startsWith('<!DOCTYPE html'), 'Missing DOCTYPE');
});

test('HTML has viewport meta', () => {
  assert(html.includes('viewport'), 'Missing viewport meta tag');
});

test('HTML has stats_hub.css linked', () => {
  assert(html.includes('stats_hub.css'), 'Missing CSS link');
});

test('HTML has stats_hub.js script', () => {
  assert(html.includes('stats_hub.js'), 'Missing JS script tag');
});

test('HTML has nav with all tabs', () => {
  assert(html.includes('page-home'), 'Missing home page');
  assert(html.includes('page-roadmap'), 'Missing roadmap page');
  assert(html.includes('page-visualizer'), 'Missing visualizer page');
  assert(html.includes('page-practice'), 'Missing practice page');
});

test('HTML has unit selector for Practice', () => {
  assert(
    html.includes('unitSelect') || html.includes('unit-select') || html.includes('unit-selector') || html.includes('unitSelector'),
    'Missing unit selector element for practice page'
  );
});

test('HTML has bottom progress bar', () => {
  assert(html.includes('bpFill') || html.includes('bp-fill'), 'Missing bottom progress bar fill');
  assert(html.includes('bpText') || html.includes('bp-text'), 'Missing bottom progress bar text');
});

test('HTML has score bar', () => {
  assert(html.includes('scoreFill') || html.includes('score-fill'), 'Missing score bar fill');
  assert(html.includes('scoreText') || html.includes('score-text'), 'Missing score bar text');
});

test('HTML has probContainer', () => {
  assert(html.includes('probContainer') || html.includes('prob-container'), 'Missing problem container');
});

// ── Check for all unit visualizer canvases ──
console.log('\n── Visualizer Canvases ──');

const EXPECTED_CANVASES = [
  'histCanvas',      // Unit 1
  'boxCanvas',       // Unit 1
  'normCanvas',      // Unit 1
  'compCanvas',      // Unit 1
];

EXPECTED_CANVASES.forEach(canvasId => {
  test(`Canvas "${canvasId}" exists in HTML`, () => {
    assert(html.includes(canvasId), `Missing canvas element with id="${canvasId}"`);
  });
});

// ── Unit-specific visualizer presence ──
console.log('\n── Unit Visualizer Registration ──');

// Phase 1: 1 primary visualizer per unit — check for relevant keywords in JS
const UNIT_VIZ_KEYWORDS = {
  2: ['z-score', 'zscore', 'z score', 'drawZscore', 'drawZScore'],
  3: ['scatter', 'drawScatter', 'regression'],
  4: ['sampl', 'drawSampl'],
  5: ['venn', 'drawVenn'],
  6: ['binom', 'drawBinom'],
  7: ['clt', 'drawCLT', 'central limit'],
  8: ['coverage', 'drawCoverage', 'drawCI'],
  9: ['p-value', 'pvalue', 'drawPValue', 'drawPVal'],
  10: ['chi-square', 'chisq', 'drawChiSq', 'drawChi'],
  11: ['drawRegOut', 'drawRegInf', 'regression inference', 'drawSlope']
};

for (const [unit, keywords] of Object.entries(UNIT_VIZ_KEYWORDS)) {
  test(`Unit ${unit}: visualizer content exists in JS`, () => {
    const jsLower = js.toLowerCase();
    const found = keywords.some(kw => jsLower.includes(kw));
    assert(found, `No visualizer code found for unit ${unit}. Looked for: ${keywords.join(', ')}`);
  });
}

// ── CSS Checks ──
console.log('\n── CSS Checks ──');

test('CSS has root variables', () => {
  assert(css.includes(':root'), 'Missing :root CSS variables');
  assert(css.includes('--bg'), 'Missing --bg variable');
  assert(css.includes('--cyan'), 'Missing --cyan variable');
});

test('CSS has unit-selector styles', () => {
  assert(
    css.includes('unit-select') || css.includes('unit-nav') || css.includes('unitSelect'),
    'Missing unit selector CSS styles'
  );
});

test('CSS has responsive breakpoint', () => {
  assert(css.includes('@media'), 'Missing responsive media query');
});

test('CSS has practice styles', () => {
  assert(css.includes('.pc'), 'Missing problem card styles');
  assert(css.includes('.ch-btn'), 'Missing choice button styles');
  assert(css.includes('.fb'), 'Missing feedback styles');
});

test('CSS has visualizer styles', () => {
  assert(css.includes('.viz-box'), 'Missing viz-box styles');
  assert(css.includes('.controls'), 'Missing controls styles');
  assert(css.includes('.stats-row'), 'Missing stats-row styles');
});

// ── JS Function Checks ──
console.log('\n── JS Functions ──');

const REQUIRED_FUNCTIONS = [
  'goPage', 'showSub', 'buildProblems', 'ansMC', 'ansFR', 'showFB',
  'drawHist', 'drawBox', 'drawNorm', 'drawComp',
  'buildRoadmap', 'getTopicState', 'saveTopicState',
  'mean', 'median', 'stdev', 'quantile', 'normalPDF', 'normalCDF'
];

REQUIRED_FUNCTIONS.forEach(fn => {
  test(`Function "${fn}" exists in JS`, () => {
    assert(
      js.includes(`function ${fn}`) || js.includes(`${fn}=`) || js.includes(`${fn} =`),
      `Function ${fn} not found in stats_hub.js`
    );
  });
});

// ── Unit switching function ──
test('JS has unit switching logic', () => {
  assert(
    js.includes('setUnit') || js.includes('switchUnit') || js.includes('currentUnit') || js.includes('selectUnit'),
    'Missing unit switching function'
  );
});

// ── File existence checks ──
console.log('\n── File Existence ──');

test('index.html exists', () => {
  const indexPath = path.join(__dirname, '..', 'index.html');
  assert(fs.existsSync(indexPath), 'Missing index.html');
});

test('.gitignore exists', () => {
  const giPath = path.join(__dirname, '..', '.gitignore');
  assert(fs.existsSync(giPath), 'Missing .gitignore');
});

test('.gitignore ignores common junk', () => {
  const giPath = path.join(__dirname, '..', '.gitignore');
  if (fs.existsSync(giPath)) {
    const gi = fs.readFileSync(giPath, 'utf8');
    assert(gi.includes('.DS_Store') || gi.includes('*.png'), '.gitignore should ignore OS files or screenshots');
  }
});

// ── Summary ──
console.log('\n====================================');
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
console.log('====================================\n');

if (failed > 0) {
  console.log('FAILURES:');
  errors.forEach(e => console.log(`  - ${e.name}: ${e.error}`));
  process.exit(1);
}

process.exit(0);

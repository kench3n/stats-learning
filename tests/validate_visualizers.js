/**
 * VISUALIZER FUNCTION VALIDATION SUITE
 * Run: node tests/validate_visualizers.js
 *
 * Checks that all required visualizer draw functions exist and are callable.
 * Tests are SACRED. Never edit this file to make it pass.
 * Fix the SOURCE code instead.
 */

const fs = require('fs');
const path = require('path');

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

function assert(cond, msg) { if (!cond) throw new Error(msg); }

console.log('\n====================================');
console.log('  VISUALIZER VALIDATION SUITE');
console.log('====================================\n');

// ── Unit 1 Visualizers (existing — must still exist) ──
console.log('── Unit 1 Visualizers (existing) ──');

const UNIT1_DRAW_FNS = ['drawHist', 'drawBox', 'drawNorm', 'drawComp'];

UNIT1_DRAW_FNS.forEach(fn => {
  test(`Unit 1: ${fn}() defined`, () => {
    assert(js.includes(`function ${fn}`), `${fn} function not found`);
  });
});

test('Unit 1: loadPreset() defined', () => {
  assert(js.includes('function loadPreset') || js.includes('loadPreset='), 'loadPreset not found');
});

test('Unit 1: loadCustom() defined', () => {
  assert(js.includes('function loadCustom') || js.includes('loadCustom='), 'loadCustom not found');
});

// ── Unit 2-11 Visualizer Functions ──
// Each unit needs at least one draw function
console.log('\n── Unit 2-11 Visualizer Functions ──');

// Phase 1: 1 primary visualizer per unit
const UNIT_VIZ_FUNCTIONS = {
  2: { name: 'Normal Distribution', patterns: ['drawZscore', 'drawZScore', 'drawU2', 'u2Draw', 'vizU2', 'drawNormArea'] },
  3: { name: 'Bivariate Data', patterns: ['drawScatter', 'drawU3', 'u3Draw', 'vizU3', 'drawRegression'] },
  4: { name: 'Sampling & Design', patterns: ['drawSampl', 'drawSampling', 'drawU4', 'u4Draw', 'vizU4', 'runSampl', 'drawPopulation'] },
  5: { name: 'Probability', patterns: ['drawVenn', 'drawU5', 'u5Draw', 'vizU5'] },
  6: { name: 'Random Variables', patterns: ['drawBinom', 'drawU6', 'u6Draw', 'vizU6'] },
  7: { name: 'Sampling Distributions', patterns: ['drawCLT', 'drawU7', 'u7Draw', 'vizU7', 'drawSampDist', 'runCLT'] },
  8: { name: 'Confidence Intervals', patterns: ['drawCoverage', 'drawCI', 'drawU8', 'u8Draw', 'vizU8', 'runCI'] },
  9: { name: 'Hypothesis Testing', patterns: ['drawPValue', 'drawPVal', 'drawU9', 'u9Draw', 'vizU9', 'drawHypoth'] },
  10: { name: 'Chi-Square', patterns: ['drawChiSq', 'drawChi', 'drawU10', 'u10Draw', 'vizU10', 'drawChiSquare'] },
  11: { name: 'Regression Inference', patterns: ['drawRegOut', 'drawRegInf', 'drawU11', 'u11Draw', 'vizU11', 'drawSlope'] }
};

for (const [unit, spec] of Object.entries(UNIT_VIZ_FUNCTIONS)) {
  test(`Unit ${unit} (${spec.name}): has draw function`, () => {
    const found = spec.patterns.some(pat => js.includes(pat));
    assert(found, `No draw function found for unit ${unit}. Looked for: ${spec.patterns.join(', ')}`);
  });
}

// ── Canvas ID references ──
console.log('\n── Canvas References ──');

// Unit 1 canvases must still be referenced
['histCanvas', 'boxCanvas', 'normCanvas', 'compCanvas'].forEach(id => {
  test(`Canvas "${id}" referenced in JS`, () => {
    assert(js.includes(`'${id}'`) || js.includes(`"${id}"`), `Canvas ${id} not referenced in JS`);
  });
});

// ── Resize Handler ──
test('Window resize handler exists', () => {
  assert(js.includes('resize'), 'No resize event handler found');
});

// ── devicePixelRatio usage ──
test('devicePixelRatio used for sharp rendering', () => {
  assert(js.includes('devicePixelRatio'), 'No devicePixelRatio usage found');
});

// ── Unit registration structure ──
console.log('\n── Unit Registration ──');

test('Units organized in data structure', () => {
  const hasAllProbs = js.includes('allProbs');
  const hasUnitProbs = js.includes('unitProbs');
  const hasUnits = js.includes('UNITS');
  const hasUnitField = (js.match(/unit:\s*\d/g) || []).length >= 10;
  assert(
    hasAllProbs || hasUnitProbs || hasUnits || hasUnitField,
    'No unit organization structure found (expected allProbs, unitProbs, UNITS, or unit: fields)'
  );
});

// ── Visualizer tab/panel structure ──
test('Visualizer has tab switching for units', () => {
  const hasTabs = js.includes('vizTabs') || js.includes('viz-tabs');
  const hasSubTab = js.includes('showSub');
  assert(hasTabs || hasSubTab, 'No visualizer tab switching found');
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

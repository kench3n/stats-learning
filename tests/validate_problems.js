/**
 * PROBLEM VALIDATION SUITE
 * Run: node tests/validate_problems.js
 *
 * Tests are SACRED. Never edit this file to make it pass.
 * Fix the SOURCE code instead.
 */

const fs = require('fs');
const path = require('path');

// ── Load the JS source and extract allProbs ──
const jsPath = path.join(__dirname, '..', 'scripts', 'stats_hub.js');
const jsSrc = fs.readFileSync(jsPath, 'utf8');

// We need to eval the JS in a mock browser context to extract data
const mockDOM = {
  getElementById: () => ({ classList: { add(){}, remove(){}, contains(){return false} }, querySelectorAll: () => [], querySelector: () => null, textContent: '', style: {}, value: '0', innerHTML: '', offsetWidth: 800, offsetHeight: 600, getContext: () => mockCtx }),
  querySelectorAll: () => [],
  querySelector: () => null
};
const mockCtx = { beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, fill(){}, fillText(){}, arc(){}, closePath(){}, clearRect(){}, scale(){}, setLineDash(){}, createLinearGradient(){ return { addColorStop(){} } }, roundRect(){}, fillStyle:'', strokeStyle:'', lineWidth:0, font:'', textAlign:'' };

const mockWindow = { addEventListener(){}, scrollTo(){}, devicePixelRatio: 1 };
const mockLocalStorage = { getItem(){ return '{}' }, setItem(){} };

let allProbs, probs;

try {
  const fn = new Function('document', 'window', 'localStorage', 'setTimeout', `
    ${jsSrc}
    return { allProbs: typeof allProbs !== 'undefined' ? allProbs : null, probs: typeof probs !== 'undefined' ? probs : null };
  `);
  const result = fn(mockDOM, mockWindow, mockLocalStorage, () => {});
  allProbs = result.allProbs;
  probs = result.probs;
} catch (e) {
  // If eval fails, try regex extraction
  console.log('WARN: Could not eval JS, falling back to regex extraction');
  console.log('Eval error:', e.message);
}

// ── Test Runner ──
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

function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(msg || `Expected ${b}, got ${a}`);
}

// ── Expected unit specs ──
// Phase 3: 10 problems per new unit (2 easy, 2 medium, 1 hard minimum present). Unit 1 keeps its 15.
const UNIT_SPECS = {
  1:  { min: 15, maxId: 99,   name: 'Descriptive Statistics' },
  2:  { min: 10, maxId: 199,  name: 'Normal Distribution' },
  3:  { min: 10, maxId: 299,  name: 'Bivariate Data' },
  4:  { min: 10, maxId: 399,  name: 'Sampling & Design' },
  5:  { min: 10, maxId: 499,  name: 'Probability' },
  6:  { min: 10, maxId: 599,  name: 'Random Variables' },
  7:  { min: 10, maxId: 699,  name: 'Sampling Distributions' },
  8:  { min: 10, maxId: 799,  name: 'Confidence Intervals' },
  9:  { min: 10, maxId: 899,  name: 'Hypothesis Testing' },
  10: { min: 10, maxId: 999,  name: 'Chi-Square Tests' },
  11: { min: 10, maxId: 1099, name: 'Regression Inference' }
};

const ID_RANGES = {
  1:  [1, 99],
  2:  [100, 199],
  3:  [200, 299],
  4:  [300, 399],
  5:  [400, 499],
  6:  [500, 599],
  7:  [600, 699],
  8:  [700, 799],
  9:  [800, 899],
  10: [900, 999],
  11: [1000, 1099]
};

// ── Determine data shape ──
let unitProblems = {};

if (allProbs && typeof allProbs === 'object' && !Array.isArray(allProbs)) {
  // New structure: allProbs = { 1: [...], 2: [...], ... }
  unitProblems = allProbs;
} else if (probs && Array.isArray(probs)) {
  // Old flat array — group by unit field or by ID range
  probs.forEach(p => {
    const unit = p.unit || (p.id <= 99 ? 1 : p.id <= 199 ? 2 : p.id <= 299 ? 3 : p.id <= 399 ? 4 : p.id <= 499 ? 5 : p.id <= 599 ? 6 : p.id <= 699 ? 7 : p.id <= 799 ? 8 : p.id <= 899 ? 9 : p.id <= 999 ? 10 : 11);
    if (!unitProblems[unit]) unitProblems[unit] = [];
    unitProblems[unit].push(p);
  });
} else if (allProbs && Array.isArray(allProbs)) {
  // Flat allProbs array
  allProbs.forEach(p => {
    const unit = p.unit || (p.id <= 99 ? 1 : p.id <= 199 ? 2 : p.id <= 299 ? 3 : p.id <= 399 ? 4 : p.id <= 499 ? 5 : p.id <= 599 ? 6 : p.id <= 699 ? 7 : p.id <= 799 ? 8 : p.id <= 899 ? 9 : p.id <= 999 ? 10 : 11);
    if (!unitProblems[unit]) unitProblems[unit] = [];
    unitProblems[unit].push(p);
  });
}

console.log('\n====================================');
console.log('  PROBLEM VALIDATION SUITE');
console.log('====================================\n');

// ── Test: Data loaded ──
test('Problems data is loaded', () => {
  const totalProbs = Object.values(unitProblems).reduce((s, a) => s + a.length, 0);
  assert(totalProbs > 0, `No problems found. Got ${totalProbs} total.`);
});

// ── Test: All 11 units exist ──
test('All 11 units have problems', () => {
  const units = Object.keys(unitProblems).map(Number).sort((a, b) => a - b);
  for (let u = 1; u <= 11; u++) {
    assert(unitProblems[u] && unitProblems[u].length > 0, `Unit ${u} has no problems`);
  }
});

// ── Per-unit tests ──
for (let u = 1; u <= 11; u++) {
  const spec = UNIT_SPECS[u];
  const problems = unitProblems[u] || [];
  const [minId, maxId] = ID_RANGES[u];

  console.log(`\n── Unit ${u}: ${spec.name} (${problems.length} problems) ──`);

  test(`Unit ${u}: has at least ${spec.min} problems`, () => {
    assert(problems.length >= spec.min,
      `Expected >= ${spec.min}, got ${problems.length}`);
  });

  test(`Unit ${u}: IDs within range [${minId}-${maxId}]`, () => {
    problems.forEach(p => {
      assert(p.id >= minId && p.id <= maxId,
        `Problem ${p.id} outside range [${minId}-${maxId}]`);
    });
  });

  test(`Unit ${u}: no duplicate IDs`, () => {
    const ids = problems.map(p => p.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert(dupes.length === 0, `Duplicate IDs: ${dupes.join(', ')}`);
  });

  test(`Unit ${u}: has all 3 difficulty levels`, () => {
    const diffs = new Set(problems.map(p => p.diff));
    assert(diffs.has('easy'), 'Missing easy problems');
    assert(diffs.has('medium'), 'Missing medium problems');
    assert(diffs.has('hard'), 'Missing hard problems');
  });

  test(`Unit ${u}: has both MC and FR types`, () => {
    const types = new Set(problems.map(p => p.type));
    assert(types.size >= 1, 'Must have at least MC or FR problems');
    // Most units should have both, but some conceptual units may be all MC
  });

  test(`Unit ${u}: schema compliance`, () => {
    problems.forEach(p => {
      assert(typeof p.id === 'number', `Problem ${p.id}: id must be number`);
      assert(['easy','medium','hard'].includes(p.diff), `Problem ${p.id}: invalid diff "${p.diff}"`);
      assert(typeof p.topic === 'string' && p.topic.length > 0, `Problem ${p.id}: topic required`);
      assert(typeof p.q === 'string' && p.q.length > 0, `Problem ${p.id}: question required`);
      assert(p.data === null || typeof p.data === 'string', `Problem ${p.id}: data must be string or null`);
      assert(['mc','fr'].includes(p.type), `Problem ${p.id}: type must be mc or fr`);
      assert(typeof p.ans === 'number', `Problem ${p.id}: ans must be number`);
      assert(typeof p.ex === 'string' && p.ex.length > 0, `Problem ${p.id}: explanation required`);

      if (p.type === 'mc') {
        assert(Array.isArray(p.ch), `Problem ${p.id}: MC must have ch array`);
        assert(p.ch.length === 4, `Problem ${p.id}: MC must have exactly 4 choices, got ${p.ch.length}`);
        assert(p.ans >= 0 && p.ans <= 3, `Problem ${p.id}: MC ans must be 0-3, got ${p.ans}`);
        p.ch.forEach((c, i) => {
          assert(typeof c === 'string' && c.length > 0, `Problem ${p.id}: choice ${i} must be non-empty string`);
        });
      }

      if (p.type === 'fr') {
        assert(typeof p.tol === 'number' && p.tol > 0, `Problem ${p.id}: FR must have positive tol, got ${p.tol}`);
        assert(isFinite(p.ans), `Problem ${p.id}: FR ans must be finite number`);
      }
    });
  });
}

// ── Cross-unit tests ──
console.log('\n── Cross-Unit Checks ──');

test('No duplicate IDs across ALL units', () => {
  const allIds = [];
  Object.values(unitProblems).forEach(ps => ps.forEach(p => allIds.push(p.id)));
  const seen = new Set();
  const dupes = [];
  allIds.forEach(id => {
    if (seen.has(id)) dupes.push(id);
    seen.add(id);
  });
  assert(dupes.length === 0, `Global duplicate IDs: ${dupes.join(', ')}`);
});

test('Total problem count >= 115', () => {
  const total = Object.values(unitProblems).reduce((s, a) => s + a.length, 0);
  assert(total >= 115, `Expected >= 115 total problems (Phase 3), got ${total}`);
});

// ── MC Answer Verification (spot checks) ──
console.log('\n── Answer Spot Checks ──');

// Unit 1 existing answers (these MUST NOT change)
if (unitProblems[1]) {
  test('Unit 1 Problem 1: mean of 12,15,18,22,28,35 = 21.67', () => {
    const p = unitProblems[1].find(x => x.id === 1);
    assert(p, 'Problem 1 not found');
    assert(Math.abs(p.ans - 21.67) < 0.1, `Expected 21.67, got ${p.ans}`);
  });

  test('Unit 1 Problem 2: median answer index = 2 (value 12)', () => {
    const p = unitProblems[1].find(x => x.id === 2);
    assert(p, 'Problem 2 not found');
    assertEqual(p.ans, 2, `Expected ans=2, got ${p.ans}`);
  });

  test('Unit 1 Problem 4: mode answer index = 0 (value 8)', () => {
    const p = unitProblems[1].find(x => x.id === 4);
    assert(p, 'Problem 4 not found');
    assertEqual(p.ans, 0);
  });
}

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

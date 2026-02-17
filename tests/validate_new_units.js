/**
 * NEW UNITS VALIDATION SUITE (Units 12-14)
 * Run: node tests/validate_new_units.js
 *
 * Validates units 12, 13, 14 added in Phase 12.
 * Tests are SACRED. Never edit this file to make it pass.
 * Fix the SOURCE code instead.
 */

const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'scripts', 'stats_hub.js');
const jsSrc = fs.readFileSync(jsPath, 'utf8');

const mockCtx = {
  beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, fill(){},
  fillText(){}, arc(){}, closePath(){}, clearRect(){}, scale(){},
  setLineDash(){}, createLinearGradient(){ return { addColorStop(){} }; },
  roundRect(){}, fillStyle:'', strokeStyle:'', lineWidth:0, font:'', textAlign:'',
  save(){}, restore(){}, translate(){}, rotate(){}, measureText(){ return {width:0}; },
};
const mockDOM = {
  getElementById: () => ({
    classList: { add(){}, remove(){}, contains(){ return false; }, toggle(){} },
    querySelectorAll: () => [],
    querySelector: () => null,
    textContent: '', style: {}, value: '0', innerHTML: '',
    offsetWidth: 800, offsetHeight: 600,
    getContext: () => mockCtx,
    appendChild(){}, removeChild(){}, scrollTop: 0, scrollHeight: 0,
  }),
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: () => ({
    className:'', textContent:'', style:{}, id:'',
    appendChild(){}, setAttribute(){}, addEventListener(){},
  }),
  body: { appendChild(){} },
};
const mockWindow = { addEventListener(){}, scrollTo(){}, devicePixelRatio: 1, open(){ return { document:{ write(){}, close(){} } }; } };
const mockLS = (function(){
  const store={};
  return {
    getItem(k){ return store[k]||null; },
    setItem(k,v){ store[k]=v; },
    removeItem(k){ delete store[k]; },
    get length(){ return Object.keys(store).length; },
    key(i){ return Object.keys(store)[i]||null; },
  };
})();

let module_exports = {};
try {
  const fn = new Function('document','window','localStorage','setTimeout','navigator',`
    ${jsSrc}
    return {
      UNIT_META: typeof UNIT_META !== 'undefined' ? UNIT_META : null,
      allProbs: typeof allProbs !== 'undefined' ? allProbs : null,
      allViz: typeof allViz !== 'undefined' ? allViz : null,
      FORMULAS: typeof FORMULAS !== 'undefined' ? FORMULAS : null,
    };
  `);
  module_exports = fn(mockDOM, mockWindow, mockLS, () => {}, { serviceWorker: null });
} catch(e) {
  console.error('FATAL: Could not load stats_hub.js:', e.message);
  process.exit(1);
}

const { UNIT_META, allProbs, allViz, FORMULAS } = module_exports;

let passed = 0, failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  PASS  ' + name);
  } catch(e) {
    failed++;
    console.log('  FAIL  ' + name + ' — ' + e.message);
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('\n── Unit Meta for Units 12-14 ──');

[12, 13, 14].forEach(u => {
  test('UNIT_META[' + u + '] exists', () => {
    assert(UNIT_META[u], 'UNIT_META[' + u + '] should exist');
  });
  test('UNIT_META[' + u + '] has name', () => {
    assert(typeof UNIT_META[u].name === 'string' && UNIT_META[u].name.length > 0,
      'UNIT_META[' + u + '] should have name');
  });
});

console.log('\n── Problems for Units 12-14 ──');

[12, 13, 14].forEach(u => {
  test('allProbs[' + u + '] exists', () => {
    assert(Array.isArray(allProbs[u]), 'allProbs[' + u + '] should be array');
  });
  test('allProbs[' + u + '] has at least 10 problems', () => {
    assert(allProbs[u].length >= 10, 'allProbs[' + u + '] should have >=10 problems, got ' + allProbs[u].length);
  });
  test('allProbs[' + u + '] has all 3 difficulty levels', () => {
    const diffs = new Set(allProbs[u].map(p => p.diff));
    assert(diffs.has('easy'), 'unit ' + u + ' missing easy problems');
    assert(diffs.has('medium'), 'unit ' + u + ' missing medium problems');
    assert(diffs.has('hard'), 'unit ' + u + ' missing hard problems');
  });
  test('allProbs[' + u + '] has both MC and FR types', () => {
    const types = new Set(allProbs[u].map(p => p.type));
    assert(types.has('mc'), 'unit ' + u + ' missing MC problems');
    assert(types.has('fr'), 'unit ' + u + ' missing FR problems');
  });
  test('allProbs[' + u + '] problems have required schema', () => {
    allProbs[u].forEach((p, i) => {
      assert(typeof p.id === 'number', 'unit ' + u + ' prob[' + i + '] missing numeric id');
      assert(typeof p.q === 'string' && p.q.length > 0, 'unit ' + u + ' prob[' + i + '] missing question');
      assert(typeof p.unit === 'number', 'unit ' + u + ' prob[' + i + '] missing unit');
      assert(typeof p.diff === 'string', 'unit ' + u + ' prob[' + i + '] missing diff');
      assert(typeof p.type === 'string', 'unit ' + u + ' prob[' + i + '] missing type');
      assert(typeof p.ex === 'string', 'unit ' + u + ' prob[' + i + '] missing explanation');
    });
  });
});

console.log('\n── Visualizers for Units 12-14 ──');

[12, 13, 14].forEach(u => {
  test('allViz[' + u + '] exists', () => {
    assert(allViz[u] && typeof allViz[u] === 'object', 'allViz[' + u + '] should exist');
  });
  test('allViz[' + u + '] has draw function', () => {
    const viz = allViz[u];
    const hasDraw = viz.draw && typeof viz.draw === 'function';
    const hasVizs = Array.isArray(viz.vizs) && viz.vizs.length > 0;
    assert(hasDraw || hasVizs, 'allViz[' + u + '] should have draw function or vizs array');
  });
});

console.log('\n── Formulas for Units 12-14 ──');

[12, 13, 14].forEach(u => {
  test('FORMULAS[' + u + '] exists and has entries', () => {
    assert(Array.isArray(FORMULAS[u]) && FORMULAS[u].length > 0,
      'FORMULAS[' + u + '] should have entries');
  });
});

console.log('\n────────────────────────────────────');
console.log('\n── Unit ID Uniqueness ──');

test('All problem IDs across units 12-14 are unique', () => {
  const ids = [];
  [12, 13, 14].forEach(u => {
    (allProbs[u] || []).forEach(p => ids.push(p.id));
  });
  const unique = new Set(ids);
  assert(unique.size === ids.length, 'Duplicate problem IDs found in units 12-14');
});

console.log('\n====================================');
console.log('  RESULTS: ' + passed + ' passed, ' + failed + ' failed');
console.log('====================================\n');
process.exit(failed > 0 ? 1 : 0);

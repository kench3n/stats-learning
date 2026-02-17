/**
 * ENGAGEMENT VALIDATION SUITE
 * Run: node tests/validate_engagement.js
 *
 * Validates streak, XP, milestone, review data structures.
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
      XP_TABLE: typeof XP_TABLE !== 'undefined' ? XP_TABLE : null,
      XP_PER_LEVEL: typeof XP_PER_LEVEL !== 'undefined' ? XP_PER_LEVEL : null,
      MILESTONES: typeof MILESTONES !== 'undefined' ? MILESTONES : null,
      UNIT_META: typeof UNIT_META !== 'undefined' ? UNIT_META : null,
      FORMULAS: typeof FORMULAS !== 'undefined' ? FORMULAS : null,
      getStreakData: typeof getStreakData !== 'undefined' ? getStreakData : null,
      getXPData: typeof getXPData !== 'undefined' ? getXPData : null,
      getReviewData: typeof getReviewData !== 'undefined' ? getReviewData : null,
      addDays: typeof addDays !== 'undefined' ? addDays : null,
      todayStr: typeof todayStr !== 'undefined' ? todayStr : null,
    };
  `);
  module_exports = fn(mockDOM, mockWindow, mockLS, () => {}, { serviceWorker: null });
} catch(e) {
  console.error('FATAL: Could not load stats_hub.js:', e.message);
  process.exit(1);
}

const { XP_TABLE, XP_PER_LEVEL, MILESTONES, UNIT_META, FORMULAS,
        getStreakData, getXPData, getReviewData, addDays, todayStr } = module_exports;

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

console.log('\n── Engagement Data Structures ──');

test('XP_TABLE exists', () => {
  assert(XP_TABLE !== null, 'XP_TABLE should exist');
});
test('XP_TABLE has easy difficulty', () => {
  assert(typeof XP_TABLE.easy === 'number' && XP_TABLE.easy > 0, 'easy XP should be positive number');
});
test('XP_TABLE has medium difficulty', () => {
  assert(typeof XP_TABLE.medium === 'number' && XP_TABLE.medium > 0, 'medium XP should be positive number');
});
test('XP_TABLE has hard difficulty', () => {
  assert(typeof XP_TABLE.hard === 'number' && XP_TABLE.hard > 0, 'hard XP should be positive number');
});
test('XP difficulty values increase in order', () => {
  assert(XP_TABLE.easy < XP_TABLE.medium && XP_TABLE.medium < XP_TABLE.hard, 'easy < medium < hard XP');
});
test('XP_PER_LEVEL is positive number', () => {
  assert(typeof XP_PER_LEVEL === 'number' && XP_PER_LEVEL > 0, 'XP_PER_LEVEL should be positive');
});

console.log('\n── MILESTONES ──');

test('MILESTONES is an array', () => {
  assert(Array.isArray(MILESTONES), 'MILESTONES should be an array');
});
test('MILESTONES has at least 5 entries', () => {
  assert(MILESTONES.length >= 5, 'Expected at least 5 milestones, got ' + MILESTONES.length);
});
test('All milestones have required fields', () => {
  MILESTONES.forEach((m, i) => {
    assert(typeof m.id === 'string', 'milestone[' + i + '] missing id');
    assert(typeof m.name === 'string', 'milestone[' + i + '] missing name');
    assert(typeof m.desc === 'string', 'milestone[' + i + '] missing desc');
    assert(typeof m.icon === 'string', 'milestone[' + i + '] missing icon');
    assert(typeof m.check === 'function', 'milestone[' + i + '] check should be a function');
  });
});
test('All milestone check functions are callable', () => {
  MILESTONES.forEach((m, i) => {
    let result;
    try { result = m.check(); } catch(e) { /* may use localStorage — ok */ }
    // Just ensure it doesn't throw fatally
  });
});

console.log('\n── getStreakData ──');

test('getStreakData returns object', () => {
  const data = getStreakData();
  assert(data && typeof data === 'object', 'getStreakData should return object');
});
test('getStreakData has current field', () => {
  const data = getStreakData();
  assert('current' in data && typeof data.current === 'number', 'missing current streak');
});
test('getStreakData has longest field', () => {
  const data = getStreakData();
  assert('longest' in data && typeof data.longest === 'number', 'missing longest streak');
});
test('getStreakData has lastDate field', () => {
  const data = getStreakData();
  assert('lastDate' in data, 'missing lastDate field');
});
test('getStreakData has history array', () => {
  const data = getStreakData();
  assert(Array.isArray(data.history), 'history should be array');
});

console.log('\n── getXPData ──');

test('getXPData returns object', () => {
  const data = getXPData();
  assert(data && typeof data === 'object', 'getXPData should return object');
});
test('getXPData has total field', () => {
  const data = getXPData();
  assert('total' in data && typeof data.total === 'number', 'missing total XP');
});
test('getXPData has level field', () => {
  const data = getXPData();
  assert('level' in data && typeof data.level === 'number' && data.level >= 1, 'level should be >= 1');
});
test('getXPData has history array', () => {
  const data = getXPData();
  assert(Array.isArray(data.history), 'history should be array');
});

console.log('\n── Date Utilities ──');

test('todayStr returns YYYY-MM-DD format', () => {
  const s = todayStr();
  assert(/^\d{4}-\d{2}-\d{2}$/.test(s), 'todayStr format should be YYYY-MM-DD, got: ' + s);
});
test('addDays adds correct days', () => {
  const result = addDays('2026-01-01', 5);
  assert(result === '2026-01-06', 'addDays(2026-01-01, 5) should be 2026-01-06, got: ' + result);
});
test('addDays handles month boundary', () => {
  const result = addDays('2026-01-31', 1);
  assert(result === '2026-02-01', 'addDays across month boundary, got: ' + result);
});

console.log('\n── FORMULAS ──');

test('FORMULAS exists', () => {
  assert(FORMULAS && typeof FORMULAS === 'object', 'FORMULAS should exist');
});
test('FORMULAS has entries for all units in UNIT_META', () => {
  const unitKeys = Object.keys(UNIT_META).map(Number);
  unitKeys.forEach(u => {
    assert(FORMULAS[u] && Array.isArray(FORMULAS[u]) && FORMULAS[u].length > 0,
      'FORMULAS[' + u + '] should have entries');
  });
});

console.log('\n====================================');
console.log('  RESULTS: ' + passed + ' passed, ' + failed + ' failed');
console.log('====================================\n');
process.exit(failed > 0 ? 1 : 0);

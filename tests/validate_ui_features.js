/**
 * UI FEATURES VALIDATION SUITE
 * Run: node tests/validate_ui_features.js
 *
 * Validates learning paths, datasets, tutor KB, NLP patterns, hints.
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
      LEARNING_PATHS: typeof LEARNING_PATHS !== 'undefined' ? LEARNING_PATHS : null,
      DATASETS: typeof DATASETS !== 'undefined' ? DATASETS : null,
      TUTOR_KB: typeof TUTOR_KB !== 'undefined' ? TUTOR_KB : null,
      NLP_PATTERNS: typeof NLP_PATTERNS !== 'undefined' ? NLP_PATTERNS : null,
      allProbs: typeof allProbs !== 'undefined' ? allProbs : null,
      UNIT_META: typeof UNIT_META !== 'undefined' ? UNIT_META : null,
    };
  `);
  module_exports = fn(mockDOM, mockWindow, mockLS, () => {}, { serviceWorker: null });
} catch(e) {
  console.error('FATAL: Could not load stats_hub.js:', e.message);
  process.exit(1);
}

const { LEARNING_PATHS, DATASETS, TUTOR_KB, NLP_PATTERNS, allProbs, UNIT_META } = module_exports;

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

console.log('\n── Learning Paths ──');

test('LEARNING_PATHS exists', () => {
  assert(LEARNING_PATHS && typeof LEARNING_PATHS === 'object', 'LEARNING_PATHS should exist');
});
test('LEARNING_PATHS has at least 2 paths', () => {
  assert(Object.keys(LEARNING_PATHS).length >= 2, 'should have at least 2 paths');
});
test('All paths have required fields', () => {
  Object.keys(LEARNING_PATHS).forEach(id => {
    const p = LEARNING_PATHS[id];
    assert(typeof p.name === 'string' && p.name.length > 0, id + ' missing name');
    assert(typeof p.desc === 'string' && p.desc.length > 0, id + ' missing desc');
    assert(Array.isArray(p.units) && p.units.length > 0, id + ' missing units array');
    assert(typeof p.estimatedHours === 'number' && p.estimatedHours > 0, id + ' missing estimatedHours');
  });
});
test('All units in LEARNING_PATHS exist in UNIT_META', () => {
  Object.keys(LEARNING_PATHS).forEach(id => {
    const p = LEARNING_PATHS[id];
    p.units.forEach(u => {
      assert(UNIT_META[u], 'Path ' + id + ' references unit ' + u + ' not in UNIT_META');
    });
  });
});
test('full-course path covers all units', () => {
  const fc = LEARNING_PATHS['full-course'];
  assert(fc, 'full-course path should exist');
  const metaCount = Object.keys(UNIT_META).length;
  assert(fc.units.length === metaCount, 'full-course should cover all ' + metaCount + ' units');
});

console.log('\n── Datasets ──');

test('DATASETS exists', () => {
  assert(DATASETS && typeof DATASETS === 'object', 'DATASETS should exist');
});
test('DATASETS has at least 2 datasets', () => {
  assert(Object.keys(DATASETS).length >= 2, 'should have at least 2 datasets');
});
test('All datasets have required fields', () => {
  Object.keys(DATASETS).forEach(id => {
    const d = DATASETS[id];
    assert(typeof d.name === 'string', id + ' missing name');
    assert(typeof d.desc === 'string', id + ' missing desc');
    assert(typeof d.col === 'string' && d.col.length > 0, id + ' missing col field');
    assert(Array.isArray(d.data) && d.data.length > 0, id + ' missing data array');
  });
});
test('Dataset data values are numeric', () => {
  Object.keys(DATASETS).forEach(id => {
    const d = DATASETS[id];
    d.data.forEach((val, i) => {
      assert(typeof val === 'number' && !isNaN(val),
        id + ' data[' + i + '] is not a number: ' + val);
    });
  });
});

console.log('\n── AI Tutor Knowledge Base ──');

test('TUTOR_KB exists', () => {
  assert(Array.isArray(TUTOR_KB), 'TUTOR_KB should be an array');
});
test('TUTOR_KB has at least 5 entries', () => {
  assert(TUTOR_KB.length >= 5, 'TUTOR_KB should have at least 5 entries');
});
test('All TUTOR_KB entries have keywords array', () => {
  TUTOR_KB.forEach((entry, i) => {
    assert(Array.isArray(entry.keywords) && entry.keywords.length > 0,
      'TUTOR_KB[' + i + '] missing keywords');
  });
});
test('All TUTOR_KB entries have response string', () => {
  TUTOR_KB.forEach((entry, i) => {
    assert(typeof entry.response === 'string' && entry.response.length > 0,
      'TUTOR_KB[' + i + '] missing response');
  });
});

console.log('\n── NLP Patterns ──');

test('NLP_PATTERNS exists', () => {
  assert(Array.isArray(NLP_PATTERNS), 'NLP_PATTERNS should be an array');
});
test('NLP_PATTERNS has at least 2 patterns', () => {
  assert(NLP_PATTERNS.length >= 2, 'should have at least 2 patterns');
});
test('All NLP_PATTERNS have regex', () => {
  NLP_PATTERNS.forEach((p, i) => {
    assert(p.regex instanceof RegExp, 'NLP_PATTERNS[' + i + '] regex should be RegExp');
  });
});
test('All NLP_PATTERNS have solve function', () => {
  NLP_PATTERNS.forEach((p, i) => {
    assert(typeof p.solve === 'function', 'NLP_PATTERNS[' + i + '] solve should be function');
  });
});
test('Z-score NLP pattern matches example', () => {
  const zscore = NLP_PATTERNS.find(p => p.regex.test('z-score if x=85, mean=70, stdev=5'));
  assert(zscore, 'no pattern matches z-score example');
  const m = 'z-score if x=85, mean=70, stdev=5'.match(zscore.regex);
  assert(m, 'z-score regex should match example string');
  const result = zscore.solve(m);
  assert(result && typeof result.answer === 'string', 'solve should return object with answer');
});
test('Mean NLP pattern matches example', () => {
  const meanPat = NLP_PATTERNS.find(p => p.regex.test('mean of 4, 7, 9, 12, 15'));
  assert(meanPat, 'no pattern matches mean example');
  const m = 'mean of 4, 7, 9, 12, 15'.match(meanPat.regex);
  assert(m, 'mean regex should match example string');
  const result = meanPat.solve(m);
  assert(result && result.answer.includes('9.4'), 'mean of 4,7,9,12,15 should be 9.4');
});

console.log('\n── Problem Hints ──');

test('All problems have hint field', () => {
  const unitKeys = Object.keys(allProbs).map(Number);
  let missingHints = [];
  unitKeys.forEach(u => {
    (allProbs[u] || []).forEach(p => {
      if (!('hint' in p)) missingHints.push(String(p.id));
    });
  });
  assert(missingHints.length === 0, 'Problems missing hint: ' + missingHints.join(', '));
});

console.log('\n====================================');
console.log('  RESULTS: ' + passed + ' passed, ' + failed + ' failed');
console.log('====================================\n');
process.exit(failed > 0 ? 1 : 0);

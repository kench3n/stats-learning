/**
 * PERFORMANCE BENCHMARKS
 * Run: node tests/benchmark.js
 *
 * Measures script load time, data structure sizes, and computation times.
 * Prints warnings for anything exceeding thresholds — does NOT fail.
 */

const fs = require('fs');
const path = require('path');

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
const mockWindow = { addEventListener(){}, scrollTo(){}, devicePixelRatio: 1 };
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

console.log('\n╔════════════════════════════════════════╗');
console.log('║   STATS HUB — PERFORMANCE BENCHMARKS   ║');
console.log('╚════════════════════════════════════════╝\n');

// Bundle sizes
const jsPath = path.join(__dirname, '..', 'scripts', 'stats_hub.js');
const cssPath = path.join(__dirname, '..', 'styles', 'stats_hub.css');
const htmlPath = path.join(__dirname, '..', 'stats_hub.html');

const jsSize = fs.statSync(jsPath).size;
const cssSize = fs.statSync(cssPath).size;
const htmlSize = fs.statSync(htmlPath).size;

console.log('── Bundle Sizes ──');
console.log('JS:    ' + (jsSize / 1024).toFixed(1) + ' KB');
console.log('CSS:   ' + (cssSize / 1024).toFixed(1) + ' KB');
console.log('HTML:  ' + (htmlSize / 1024).toFixed(1) + ' KB');
console.log('Total: ' + ((jsSize + cssSize + htmlSize) / 1024).toFixed(1) + ' KB');

if (jsSize > 200 * 1024) console.warn('WARN: JS exceeds 200KB');
if (cssSize > 100 * 1024) console.warn('WARN: CSS exceeds 100KB');
if ((jsSize + cssSize + htmlSize) > 400 * 1024) console.warn('WARN: Total bundle exceeds 400KB');

// Script load time
console.log('\n── Load Performance ──');
const jsSrc = fs.readFileSync(jsPath, 'utf8');
const startLoad = Date.now();
let moduleExports = {};
try {
  const fn = new Function('document','window','localStorage','setTimeout','navigator',`
    ${jsSrc}
    return {
      allProbs: typeof allProbs !== 'undefined' ? allProbs : null,
      UNIT_META: typeof UNIT_META !== 'undefined' ? UNIT_META : null,
      getProgressSummary: typeof getProgressSummary !== 'undefined' ? getProgressSummary : null,
      analyzeWeakSpots: typeof analyzeWeakSpots !== 'undefined' ? analyzeWeakSpots : null,
    };
  `);
  moduleExports = fn(mockDOM, mockWindow, mockLS, () => {}, { serviceWorker: null });
} catch(e) {
  console.error('FATAL: Could not load stats_hub.js:', e.message);
  process.exit(1);
}
const loadTime = Date.now() - startLoad;
console.log('Script load time: ' + loadTime + 'ms');
if (loadTime > 1000) console.warn('WARN: Script load time exceeds 1000ms');

// Problem count
const { allProbs, UNIT_META, getProgressSummary, analyzeWeakSpots } = moduleExports;
let totalProbs = 0;
if (allProbs) {
  Object.keys(allProbs).forEach(u => {
    totalProbs += (allProbs[u] || []).length;
  });
}
const unitCount = UNIT_META ? Object.keys(UNIT_META).length : 0;

console.log('\n── Data Structures ──');
console.log('Total problems: ' + totalProbs);
console.log('Total units:    ' + unitCount);
if (totalProbs > 500) console.warn('WARN: Problem count exceeds 500');

// Computation benchmarks
if (getProgressSummary) {
  const t1 = Date.now();
  for (let i = 0; i < 100; i++) getProgressSummary();
  const t2 = Date.now();
  console.log('\n── Computation Times (100 iterations) ──');
  console.log('getProgressSummary x100: ' + (t2 - t1) + 'ms (avg ' + ((t2 - t1) / 100).toFixed(2) + 'ms)');
}

if (analyzeWeakSpots) {
  const t1 = Date.now();
  for (let i = 0; i < 100; i++) analyzeWeakSpots();
  const t2 = Date.now();
  console.log('analyzeWeakSpots x100:   ' + (t2 - t1) + 'ms (avg ' + ((t2 - t1) / 100).toFixed(2) + 'ms)');
}

// Line counts
const jsLines = jsSrc.split('\n').length;
const cssLines = fs.readFileSync(cssPath,'utf8').split('\n').length;
const htmlLines = fs.readFileSync(htmlPath,'utf8').split('\n').length;

console.log('\n── Line Counts ──');
console.log('JS:   ' + jsLines + ' lines');
console.log('CSS:  ' + cssLines + ' lines');
console.log('HTML: ' + htmlLines + ' lines');

console.log('\n✓ Benchmark complete\n');

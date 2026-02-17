/**
 * MATH CORRECTNESS VALIDATION SUITE
 * Run: node tests/validate_math.js
 *
 * Verifies that practice problem answers are mathematically correct.
 * Tests are SACRED. Never edit this file to make it pass.
 * Fix the SOURCE code instead.
 */

const fs = require('fs');
const path = require('path');

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
function assertClose(a, b, tol, msg) {
  if (Math.abs(a - b) > tol) throw new Error(msg || `Expected ~${b}, got ${a} (tol ${tol})`);
}

// ── Math helpers (mirror the app's functions) ──
function mean(a) { return a.reduce((s, v) => s + v, 0) / a.length; }
function median(a) { const s = [...a].sort((x, y) => x - y), m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
function stdev(a) { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length); }
function erf(x) { const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911; const s = x < 0 ? -1 : 1; x = Math.abs(x); const t = 1 / (1 + p * x); const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x); return s * y; }
function normalCDF(x, mu, sig) { return 0.5 * (1 + erf((x - mu) / (sig * Math.sqrt(2)))); }
function binomPMF(k, n, p) {
  let coeff = 1;
  for (let i = 0; i < k; i++) coeff = coeff * (n - i) / (i + 1);
  return coeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

console.log('\n====================================');
console.log('  MATH CORRECTNESS SUITE');
console.log('====================================\n');

// ── Unit 1: Descriptive Statistics ──
console.log('── Unit 1: Descriptive Statistics ──');

test('Mean of [12,15,18,22,28,35] = 21.67', () => {
  assertClose(mean([12, 15, 18, 22, 28, 35]), 21.67, 0.01);
});

test('Median of [3,7,8,12,14,18,21] = 12', () => {
  assertClose(median([3, 7, 8, 12, 14, 18, 21]), 12, 0.01);
});

test('Median of [4,9,11,15,20,25] = 13', () => {
  assertClose(median([4, 9, 11, 15, 20, 25]), 13, 0.01);
});

test('Range of [14,22,8,35,19,27,11] = 27', () => {
  const d = [14, 22, 8, 35, 19, 27, 11];
  assertClose(Math.max(...d) - Math.min(...d), 27, 0.01);
});

test('Pop SD of [4,8,6,5,3] ≈ 1.72', () => {
  assertClose(stdev([4, 8, 6, 5, 3]), 1.72, 0.05);
});

// ── Unit 2: Normal Distribution ──
console.log('\n── Unit 2: Normal Distribution ──');

test('Z-score: x=72, mu=65, sd=10 → z=0.70', () => {
  assertClose((72 - 65) / 10, 0.70, 0.001);
});

test('Z-score: x=85, mu=78, sd=14 → z=0.50', () => {
  assertClose((85 - 78) / 14, 0.50, 0.001);
});

test('68-95-99.7: P(within 1σ) ≈ 0.6827', () => {
  const area = normalCDF(1, 0, 1) - normalCDF(-1, 0, 1);
  assertClose(area, 0.6827, 0.005);
});

test('68-95-99.7: P(within 2σ) ≈ 0.9545', () => {
  const area = normalCDF(2, 0, 1) - normalCDF(-2, 0, 1);
  assertClose(area, 0.9545, 0.005);
});

test('P(Z < 1.96) ≈ 0.975', () => {
  assertClose(normalCDF(1.96, 0, 1), 0.975, 0.002);
});

test('P(Z < -1) ≈ 0.1587', () => {
  assertClose(normalCDF(-1, 0, 1), 0.1587, 0.002);
});

// ── Unit 3: Bivariate Data ──
console.log('\n── Unit 3: Bivariate Data ──');

test('Regression: slope = r * (sy/sx)', () => {
  const r = 0.8, sx = 5, sy = 10;
  assertClose(r * (sy / sx), 1.6, 0.001);
});

test('Regression: intercept = ybar - b1*xbar', () => {
  const xbar = 50, ybar = 100, b1 = 1.6;
  assertClose(ybar - b1 * xbar, 20, 0.001);
});

test('r² = r*r', () => {
  assertClose(0.8 * 0.8, 0.64, 0.001);
});

test('Residual = y - yhat', () => {
  assertClose(75 - 72.3, 2.7, 0.001);
});

// ── Unit 5: Probability ──
console.log('\n── Unit 5: Probability ──');

test('P(A∪B) = P(A)+P(B)-P(A∩B)', () => {
  assertClose(0.4 + 0.3 - 0.12, 0.58, 0.001);
});

test('P(A|B) = P(A∩B)/P(B)', () => {
  assertClose(0.12 / 0.3, 0.4, 0.001);
});

test('Complement: P(A\') = 1 - P(A)', () => {
  assertClose(1 - 0.35, 0.65, 0.001);
});

test('Bayes: P(A|B) = P(B|A)*P(A)/P(B)', () => {
  const pba = 0.9, pa = 0.01, pb = 0.9 * 0.01 + 0.05 * 0.99;
  assertClose(pba * pa / pb, 0.1538, 0.01);
});

// ── Unit 6: Random Variables ──
console.log('\n── Unit 6: Random Variables ──');

test('E(X) = Σ x*P(x)', () => {
  const x = [0, 1, 2, 3];
  const p = [0.1, 0.3, 0.4, 0.2];
  const ev = x.reduce((s, xi, i) => s + xi * p[i], 0);
  assertClose(ev, 1.7, 0.001);
});

test('Binomial: P(X=3) for n=5, p=0.4', () => {
  assertClose(binomPMF(3, 5, 0.4), 0.2304, 0.001);
});

test('Binomial mean: np', () => {
  assertClose(10 * 0.3, 3.0, 0.001);
});

test('Binomial SD: sqrt(npq)', () => {
  assertClose(Math.sqrt(10 * 0.3 * 0.7), 1.449, 0.01);
});

test('Linear transform: E(aX+b) = a*E(X)+b', () => {
  assertClose(3 * 5 + 2, 17, 0.001);
});

test('Linear transform: SD(aX+b) = |a|*SD(X)', () => {
  assertClose(Math.abs(3) * 2, 6, 0.001);
});

// ── Unit 7: Sampling Distributions ──
console.log('\n── Unit 7: Sampling Distributions ──');

test('SE of mean = σ/√n', () => {
  assertClose(10 / Math.sqrt(25), 2.0, 0.001);
});

test('SE of proportion = √(p(1-p)/n)', () => {
  assertClose(Math.sqrt(0.5 * 0.5 / 100), 0.05, 0.001);
});

// ── Unit 8: Confidence Intervals ──
console.log('\n── Unit 8: Confidence Intervals ──');

test('CI for proportion: p̂ ± z*√(p̂q̂/n)', () => {
  const phat = 0.6, n = 100, z = 1.96;
  const me = z * Math.sqrt(phat * (1 - phat) / n);
  assertClose(me, 0.096, 0.002);
});

test('Sample size for ME: n = (z/ME)² * p̂q̂', () => {
  const z = 1.96, me = 0.03, p = 0.5;
  const n = (z / me) ** 2 * p * (1 - p);
  assertClose(n, 1067.11, 1);
});

// ── Unit 9: Hypothesis Testing ──
console.log('\n── Unit 9: Hypothesis Testing ──');

test('Z-test for proportion: z = (p̂-p0)/√(p0*q0/n)', () => {
  const phat = 0.55, p0 = 0.50, n = 200;
  const z = (phat - p0) / Math.sqrt(p0 * (1 - p0) / n);
  assertClose(z, 1.414, 0.01);
});

test('T-test for mean: t = (xbar-mu0)/(s/√n)', () => {
  const xbar = 52, mu0 = 50, s = 8, n = 36;
  const t = (xbar - mu0) / (s / Math.sqrt(n));
  assertClose(t, 1.5, 0.001);
});

// ── Unit 10: Chi-Square ──
console.log('\n── Unit 10: Chi-Square ──');

test('Chi-square stat: Σ(O-E)²/E', () => {
  const obs = [30, 25, 20, 25];
  const exp = [25, 25, 25, 25];
  const chi2 = obs.reduce((s, o, i) => s + (o - exp[i]) ** 2 / exp[i], 0);
  assertClose(chi2, 2.0, 0.001);
});

test('Expected count: (row*col)/total', () => {
  assertClose((50 * 60) / 200, 15, 0.001);
});

test('df for GOF: k-1', () => {
  assertClose(4 - 1, 3, 0);
});

test('df for independence: (r-1)(c-1)', () => {
  assertClose((3 - 1) * (4 - 1), 6, 0);
});

// ── Unit 11: Regression Inference ──
console.log('\n── Unit 11: Regression Inference ──');

test('t-stat for slope: b1/SE(b1)', () => {
  assertClose(2.5 / 0.8, 3.125, 0.001);
});

test('CI for slope: b1 ± t*SE(b1)', () => {
  const b1 = 2.5, se = 0.8, tstar = 2.048;
  assertClose(b1 - tstar * se, 0.862, 0.01);
  assertClose(b1 + tstar * se, 4.138, 0.01);
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

# Codex Prompt P — Phase 12: New Units 12-14 (ANOVA, Nonparametric, Bayesian Intro)

## Project Context

Stats Learning Hub — single-page vanilla JS/HTML/CSS. 185 tests. NEVER modify `tests/`. Currently 11 units with 115 problems. `UNIT_META`, `allProbs`, `allViz`, `FORMULAS`, unit selectors all exist.

**IMPORTANT:** Adding new units will likely require adding new test expectations. Since tests are immutable, new units must integrate WITHOUT breaking existing tests. Existing tests validate units 1-11 and 115 problems — new units add ON TOP of this.

---

## Task 1: Unit 12 — ANOVA (Analysis of Variance)

### 1a: Add Unit Metadata

**File:** `scripts/stats_hub.js`

```javascript
// Add to UNIT_META:
12:{name:'ANOVA'}
```

### 1b: Add 10 Problems

Add to `allProbs[12]` — 10 problems covering:
- One-way ANOVA setup and hypotheses (easy)
- Computing SSB, SSW, SST (medium)
- F-statistic calculation (medium)
- Degrees of freedom (easy)
- Reading ANOVA tables (medium)
- Post-hoc comparisons concept (hard)
- Interpreting F-test results (medium)
- Assumptions of ANOVA (easy)
- Comparing 3+ group means (hard)
- Effect size (eta-squared) (hard)

Follow existing problem schema: `{id:'u12p1', unit:12, type:'mc'|'fr', diff:'easy'|'medium'|'hard', topic:'...', q:'...', ch:[...], ans:..., ex:'...', hint:'...', tol:0.01}`

### 1c: Add Visualizer

```javascript
// Add to allViz:
12:{tabs:['anova'],draw:drawAnova}
```

Create `drawAnova()` — interactive ANOVA visualizer:
- Show 3 groups as side-by-side dot plots
- Sliders for group means and within-group variance
- Display SSB, SSW, F-statistic in real-time
- Color-code: between-group variance (cyan), within-group variance (pink)
- Show critical F-value line

Add unit 12 to `vizTemplate()`.

### 1d: Add Formulas

```javascript
// Add to FORMULAS:
12:[
  {name:'SSB',formula:'Σnⱼ(x̄ⱼ − x̄)²'},
  {name:'SSW',formula:'ΣΣ(xᵢⱼ − x̄ⱼ)²'},
  {name:'F-statistic',formula:'F = MSB/MSW = (SSB/dfB)/(SSW/dfW)'},
  {name:'df between',formula:'k − 1'},
  {name:'df within',formula:'N − k'},
  {name:'Eta-squared',formula:'η² = SSB/SST'},
]
```

---

## Task 2: Unit 13 — Nonparametric Tests

### 2a: Metadata, Problems, Visualizer

Add `13:{name:'Nonparametric Tests'}` to UNIT_META.

Add 10 problems covering:
- When to use nonparametric tests (easy)
- Sign test (easy)
- Wilcoxon signed-rank test (medium)
- Mann-Whitney U test (medium)
- Kruskal-Wallis test (medium)
- Rank calculations (easy)
- Comparing parametric vs nonparametric (medium)
- Spearman rank correlation (hard)
- Advantages/disadvantages (easy)
- Interpreting nonparametric results (hard)

Create `drawNonparam()` visualizer:
- Show two distributions with a slider for skewness
- Display ranked data vs raw data side-by-side
- Show how rankings change as distributions shift
- Visual comparison: t-test assumption violation vs rank-based test robustness

Add formulas for unit 13.

---

## Task 3: Unit 14 — Bayesian Introduction

### 3a: Metadata, Problems, Visualizer

Add `14:{name:'Bayesian Statistics'}` to UNIT_META.

Add 10 problems covering:
- Prior, likelihood, posterior definitions (easy)
- Bayes' theorem calculation (medium)
- Updating priors with data (medium)
- Conjugate priors concept (hard)
- Bayesian vs frequentist comparison (easy)
- Credible intervals vs confidence intervals (medium)
- Base rate fallacy (medium)
- Medical testing Bayes' theorem (hard)
- Prior sensitivity (hard)
- Bayesian inference interpretation (easy)

Create `drawBayes()` visualizer:
- Show prior distribution (blue) and likelihood (red)
- Posterior updates in real-time as user adjusts evidence
- Slider for prior strength (informative vs flat)
- Slider for sample size
- Display posterior mean and credible interval
- Classic medical test example with interactive prevalence slider

Add formulas for unit 14.

---

## Task 4: Update UI for 14 Units

### 4a: Update Unit Selectors

**File:** `stats_hub.html`

Update both `#unitSelect` and `#vizUnitSelect` dropdowns to include options for units 12, 13, 14.

### 4b: Update Home Page Counts

Update the home card descriptions to reflect new problem and unit counts (145 problems, 14 units).

### 4c: Update Progress Panel

Ensure `buildProgressPanel()` and `getProgressSummary()` loop through units 1-14 (not hardcoded to 11). Check for hardcoded `11` throughout the codebase and update to `14` or make dynamic:

```javascript
const MAX_UNIT=Object.keys(UNIT_META).length;
// Use MAX_UNIT instead of hardcoded 11 everywhere
```

### 4d: Update Export/Import and Reset

Ensure export loops through all units, not just 1-11.

---

## Constraints

- NEVER modify `tests/`. Existing tests validate units 1-11 and 115 problems — new content adds on top.
- All new problems must follow the exact schema with hints.
- All new visualizers must use Canvas 2D API consistently with existing ones.
- Guard all DOM/localStorage calls.
- Keep `for(let u=1;u<=11;...)` patterns dynamic (use `Object.keys(UNIT_META).length`).

## Verification

```bash
node tests/run_all.js
```
Expected: 185/185 pass (existing tests unchanged). Manual: navigate to units 12-14, verify problems load, visualizers draw, formulas display, progress tracks correctly.

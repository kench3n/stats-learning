# Codex Build Prompt — Stats Learning Hub (Units 2-11) — Phase 1

## Your Task

Build out the remaining 10 units of a vanilla JS/HTML/CSS statistics learning app. Each unit gets **5 practice problems and 1 interactive canvas visualizer**. Everything lives in a single-page app (`stats_hub.html` + `scripts/stats_hub.js` + `styles/stats_hub.css`).

**Phase 1 scope: 50 new problems + 10 new visualizers. Keep it tight and correct.**

---

## EXISTING CODEBASE — READ THESE FIRST

Before writing anything, read and internalize these files:

```
stats_hub.html          — the single-page app (209 lines)
scripts/stats_hub.js    — all JS logic (271 lines)
styles/stats_hub.css    — all CSS (232 lines)
STUDY_PLAN.md           — unit topics and descriptions
```

---

## ARCHITECTURE

### Current Structure
- Flat `probs` array (15 Unit 1 problems)
- 4 hardcoded visualizers (histogram, boxplot, normal curve, compare)
- Sub-tab navigation via `showSub(prefix, id, btn)`
- localStorage for roadmap topic checkboxes

### Target Structure
- `probs` becomes `allProbs = { 1: [...], 2: [...], ... 11: [...] }`
- Unit selector dropdown on Practice and Visualizer pages
- Each unit's visualizer registered in `allViz = { 1: {tabs:[...], draw:fn}, ... }`
- Per-unit score tracking in localStorage
- All code stays in the existing 3 files (no new JS/CSS files)

---

## EXACT PROBLEM FORMAT

Every problem must match this schema exactly:

```js
{
  id: Number,        // unique across ALL units (see ID ranges below)
  unit: Number,      // 1-11
  diff: String,      // 'easy' | 'medium' | 'hard'
  topic: String,     // short topic label
  q: String,         // question text (HTML allowed)
  data: String|null, // data displayed in mono box, or null
  type: String,      // 'mc' | 'fr'
  ans: Number,       // for mc: 0-based index of correct choice. for fr: numeric answer
  tol: Number,       // for fr: acceptable tolerance (e.g. 0.1). omit or ignore for mc
  ch: Array|undefined, // for mc: exactly 4 choices as strings. omit for fr
  ex: String         // explanation shown after answering (HTML allowed)
}
```

**ID numbering scheme:**
- Unit 1: 1-15 (existing, DO NOT TOUCH)
- Unit 2: 101-105
- Unit 3: 201-205
- Unit 4: 301-305
- Unit 5: 401-405
- Unit 6: 501-505
- Unit 7: 601-605
- Unit 8: 701-705
- Unit 9: 801-805
- Unit 10: 901-905
- Unit 11: 1001-1005

**Per unit: 2 easy, 2 medium, 1 hard. Mix of MC and FR (at least 1 of each per unit).**

---

## EXACT VISUALIZER PATTERN

Every visualizer must:
1. Use a `<canvas>` element for drawing
2. Handle `window.devicePixelRatio` for sharp rendering
3. Use existing color variables: `--cyan`, `--amber`, `--pink`, `--green`, `--purple`, `--orange`
4. Have controls (sliders/selects) that call the draw function on `oninput`/`onchange`
5. Show computed stats in `.stats-row > .sc` boxes
6. Have an `.explain` section below with formulas
7. Redraw on window resize

Canvas boilerplate to follow:
```js
function drawMyViz(){
  const c=document.getElementById('myCanvas'),ctx=c.getContext('2d');
  const dpr=window.devicePixelRatio||1;
  c.width=c.offsetWidth*dpr;c.height=HEIGHT*dpr;
  ctx.scale(dpr,dpr);
  const W=c.offsetWidth,H=HEIGHT;
  ctx.clearRect(0,0,W,H);
  // ... drawing code ...
}
```

---

## UNIT SPECS (Phase 1 — 5 problems + 1 visualizer each)

### Unit 2: Normal Distribution
**IDs: 101-105 | Visualizer: `drawZscore`**

**5 problems:**
1. (easy, FR) Calculate z-score given x, μ, σ
2. (easy, MC) 68-95-99.7 rule application
3. (medium, FR) Find percentile from z-score (use normalCDF values)
4. (medium, MC) Compare two scores from different distributions using z-scores
5. (hard, MC) Reverse z-score — given a percentile, find the raw score

**Visualizer — Z-Score Explorer:**
- Sliders: x (raw score), μ (mean), σ (std dev)
- Normal curve drawn on canvas with x marked as vertical line
- Area to the left of x shaded
- Stats boxes: z-score, percentile (left area), right area
- Formula display: z = (x − μ) / σ

### Unit 3: Bivariate Data
**IDs: 201-205 | Visualizer: `drawScatter`**

**5 problems:**
1. (easy, MC) Identify direction/form/strength of association from description
2. (easy, MC) Interpret what r = -0.85 means
3. (medium, FR) Calculate predicted ŷ from regression equation
4. (medium, FR) Calculate a residual given y and ŷ
5. (hard, MC) Correlation ≠ causation scenario

**Visualizer — Interactive Scatterplot:**
- Canvas where clicking adds points
- Regression line drawn live with equation ŷ = a + bx displayed
- r and r² computed and shown in stats boxes
- Preset button to load sample datasets (positive, negative, no correlation)
- Clear button to reset

### Unit 4: Sampling & Design
**IDs: 301-305 | Visualizer: `drawSampling`**

**5 problems:**
1. (easy, MC) Observational study vs experiment identification
2. (easy, MC) Identify sampling method (SRS, stratified, cluster, etc.)
3. (medium, MC) Identify type of bias in a scenario
4. (medium, MC) Experimental design — identify confounding variable
5. (hard, MC) Complex scenario — design an experiment with proper controls

**Visualizer — Sampling Simulator:**
- 100 dots on canvas arranged in a grid, colored by 4 groups
- Buttons for each sampling method (SRS, Stratified, Cluster, Systematic)
- Clicking a method highlights selected dots with animation
- Shows sample composition vs population composition in stats boxes
- Reset button

### Unit 5: Probability
**IDs: 401-405 | Visualizer: `drawVenn`**

**5 problems:**
1. (easy, FR) Basic probability — complement rule
2. (easy, MC) Identify mutually exclusive events
3. (medium, FR) Conditional probability from a two-way table
4. (medium, MC) Addition rule P(A∪B) = P(A) + P(B) - P(A∩B)
5. (hard, FR) Bayes' theorem application

**Visualizer — Venn Diagram:**
- Two overlapping circles A and B on canvas
- Sliders: P(A), P(B), P(A∩B)
- Areas filled proportionally with colors
- Stats boxes: P(A∪B), P(A|B), P(B|A), P(A')
- Auto-check: "Independent? P(A∩B) = P(A)·P(B)?" displayed

### Unit 6: Random Variables
**IDs: 501-505 | Visualizer: `drawBinom`**

**5 problems:**
1. (easy, MC) Discrete vs continuous random variable identification
2. (easy, FR) Expected value E(X) from a probability table
3. (medium, FR) Binomial probability P(X=k) calculation
4. (medium, MC) Linear transformation rules: E(aX+b) and SD(aX+b)
5. (hard, FR) Combining independent random variables — E(X+Y) and SD(X+Y)

**Visualizer — Binomial Explorer:**
- Sliders: n (1-40), p (0.01-0.99)
- Bar chart of binomial PMF drawn on canvas
- Hover/highlight a bar to see P(X=k)
- Stats boxes: E(X) = np, SD(X) = √(npq), P(X ≤ k)
- Toggle to overlay normal approximation curve

### Unit 7: Sampling Distributions
**IDs: 601-605 | Visualizer: `drawCLT`**

**5 problems:**
1. (easy, MC) What is a sampling distribution?
2. (easy, FR) Calculate standard error SE = σ/√n
3. (medium, FR) Probability about sample mean using CLT
4. (medium, MC) Conditions for CLT to apply
5. (hard, FR) Sampling distribution of p̂ — find probability

**Visualizer — CLT Simulator:**
- Select population shape: uniform, right-skewed, bimodal
- Slider for sample size n (1, 5, 10, 30, 50)
- "Draw 1 sample" and "Draw 100 samples" buttons
- Top canvas: population distribution. Bottom canvas: sampling distribution of x̄ building up
- Stats boxes: population μ, mean of x̄'s, SE vs σ/√n

### Unit 8: Confidence Intervals
**IDs: 701-705 | Visualizer: `drawCoverage`**

**5 problems:**
1. (easy, MC) Interpret what "95% confidence" means
2. (easy, MC) Identify point estimate and margin of error from a CI
3. (medium, FR) Construct a 95% CI for a proportion
4. (medium, FR) Determine required sample size for desired margin of error
5. (hard, MC) Common CI misinterpretation — pick the WRONG statement

**Visualizer — CI Coverage Simulator:**
- Set true proportion p with slider
- Set confidence level (90%, 95%, 99%) and sample size n
- "Run 100 simulations" button
- Draw 100 horizontal CI segments — green if captures p, red if misses
- Stats boxes: capture count, actual capture rate, nominal rate
- Shows how capture rate converges to confidence level

### Unit 9: Hypothesis Testing
**IDs: 801-805 | Visualizer: `drawPValue`**

**5 problems:**
1. (easy, MC) Set up null and alternative hypotheses
2. (easy, MC) Identify Type I vs Type II error
3. (medium, FR) One-proportion z-test — compute test statistic
4. (medium, MC) Given p-value and α, state conclusion in context
5. (hard, FR) One-sample t-test — compute t-statistic

**Visualizer — P-Value Visualizer:**
- Select: left-tail, right-tail, two-tail
- Slider for test statistic z (or t)
- Normal/t curve drawn with rejection region shaded
- Slider for α (0.01, 0.05, 0.10)
- Stats boxes: test statistic, p-value, reject/fail to reject
- Critical value line drawn

### Unit 10: Chi-Square Tests
**IDs: 901-905 | Visualizer: `drawChiSq`**

**5 problems:**
1. (easy, FR) Calculate expected count: (row total × col total) / grand total
2. (easy, MC) State degrees of freedom for GOF test
3. (medium, FR) Compute χ² statistic from observed/expected
4. (medium, MC) Chi-square conditions — which is NOT required?
5. (hard, MC) Interpret chi-square test results in context

**Visualizer — Chi-Square Distribution Explorer:**
- Slider: degrees of freedom (1-15)
- Chi-square PDF curve drawn on canvas
- Slider: test statistic χ² value
- Area to the right shaded (p-value)
- Stats boxes: df, χ² value, p-value
- Critical value lines for α = 0.05 and 0.01

### Unit 11: Regression Inference
**IDs: 1001-1005 | Visualizer: `drawRegOut`**

**5 problems:**
1. (easy, MC) Identify LINE conditions for regression inference
2. (easy, MC) Read slope and SE from computer output table
3. (medium, FR) Compute t-statistic for slope: t = b₁/SE(b₁)
4. (medium, FR) Compute 95% CI for slope: b₁ ± t*·SE(b₁)
5. (hard, MC) Interpret regression output — is slope significant at α=0.05?

**Visualizer — Regression Output Interpreter:**
- Display mock computer output table (like Minitab) on canvas
- Highlight each value on hover with explanation
- Preset datasets that change the output numbers
- Stats boxes: slope, SE, t-stat, p-value, r²
- Formula: t = b₁/SE(b₁), CI: b₁ ± t*·SE(b₁)

---

## INFRASTRUCTURE CHANGES

### 1. Restructure `stats_hub.js`

Replace the flat `probs` array with:

```js
const allProbs = {
  1: [ /* existing 15 problems — copy them exactly, add unit:1 to each */ ],
  2: [ /* 5 new problems */ ],
  // ... through 11
};
```

Add unit management:

```js
let currentUnit = 1;

function setUnit(n) {
  currentUnit = n;
  buildProblems(n);
  buildVizForUnit(n);
  // update section-tag text to show unit name
}
```

Add unit metadata:

```js
const UNIT_META = {
  1: {name:'Descriptive Statistics'},
  2: {name:'Normal Distribution'},
  3: {name:'Bivariate Data'},
  4: {name:'Sampling & Design'},
  5: {name:'Probability'},
  6: {name:'Random Variables'},
  7: {name:'Sampling Distributions'},
  8: {name:'Confidence Intervals'},
  9: {name:'Hypothesis Testing'},
  10: {name:'Chi-Square Tests'},
  11: {name:'Regression Inference'}
};
```

### 2. Update `stats_hub.html`

Add unit selector to Practice page (before score-bar):
```html
<div class="unit-selector">
  <label class="cl">UNIT</label>
  <select id="unitSelect" onchange="setUnit(+this.value)">
    <option value="1">Unit 1: Descriptive Statistics</option>
    <option value="2">Unit 2: Normal Distribution</option>
    <!-- ... all 11 -->
  </select>
</div>
```

Add unit selector to Visualizer page header similarly.

Keep all existing Unit 1 visualizer HTML (canvases, controls, etc.) in place.
Add a container `<div id="viz-dynamic"></div>` for dynamic visualizer content for units 2-11.

### 3. Update `styles/stats_hub.css`

Add minimal styles:
```css
.unit-selector {
  display:flex; align-items:center; gap:10px;
  max-width:780px; margin:0 auto 18px; padding:0 24px;
}
.unit-selector select {
  font-family:'DM Sans',sans-serif; font-size:14px;
  padding:8px 14px; background:var(--bg3);
  border:1px solid var(--border); color:var(--text);
  border-radius:8px; cursor:pointer; flex:1;
}
.unit-selector select:hover { border-color:var(--border-h); }
```

### 4. Create new files

**`index.html`:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=stats_hub.html">
  <title>Stats Learning Hub</title>
</head>
<body>
  <p><a href="stats_hub.html">Go to Stats Learning Hub</a></p>
</body>
</html>
```

**`.gitignore`:**
```
*.png
.DS_Store
Thumbs.db
node_modules/
.env
```

---

## MATH REFERENCE — VERIFY EVERY ANSWER AGAINST THESE

### Z-scores & Normal
- z = (x - μ) / σ
- 68-95-99.7 rule: P(μ±1σ) ≈ 68.27%, P(μ±2σ) ≈ 95.45%, P(μ±3σ) ≈ 99.73%
- P(Z < 1.96) ≈ 0.975, P(Z < -1) ≈ 0.1587

### Regression
- slope b₁ = r(sy/sx), intercept b₀ = ȳ - b₁x̄
- r² = proportion of variance explained
- residual = y - ŷ

### Probability
- P(A∪B) = P(A) + P(B) - P(A∩B)
- P(A|B) = P(A∩B) / P(B)
- Bayes: P(A|B) = P(B|A)·P(A) / P(B)

### Binomial
- P(X=k) = C(n,k)·p^k·(1-p)^(n-k)
- E(X) = np, SD(X) = √(np(1-p))

### Confidence Intervals
- CI for p: p̂ ± z*√(p̂(1-p̂)/n)
- Sample size: n = (z*/ME)²·p̂(1-p̂)

### Hypothesis Testing
- z = (p̂ - p₀) / √(p₀(1-p₀)/n)
- t = (x̄ - μ₀) / (s/√n)

### Chi-Square
- χ² = Σ(O-E)²/E
- Expected = (row total)(col total) / grand total
- df(GOF) = k-1, df(independence) = (r-1)(c-1)

### Regression Inference
- t = b₁ / SE(b₁)
- CI for β₁: b₁ ± t*·SE(b₁)

---

## RULES

1. ALL code stays vanilla JS/HTML/CSS. No frameworks, no build tools, no npm.
2. ALL math must be correct. Double-check every answer against the reference above.
3. Problem explanations must show work step-by-step.
4. Canvas visualizers must handle `devicePixelRatio` and window resize.
5. Reuse existing utility functions: `randn()`, `mean()`, `median()`, `stdev()`, `quantile()`, `normalPDF()`, `normalCDF()`, `erf()`.
6. All IDs must be unique across the entire app.
7. Keep existing Unit 1 working exactly as-is (same 15 problems, same answers, same 4 visualizers).
8. Use existing CSS classes for new content.
9. The app must work offline (no CDN deps except Google Fonts which degrades gracefully).
10. Each unit must have both MC and FR problem types.

---

## VERIFICATION

After building, run:
```bash
node tests/run_all.js
```

Must pass ALL tests. If any fail, fix source code — never edit test files.

Individual suites:
```bash
node tests/validate_html.js        # HTML structure
node tests/validate_problems.js    # Problem schema, counts, IDs
node tests/validate_math.js        # Formula correctness
node tests/validate_visualizers.js # Draw functions exist
```

# Stats Learning Hub
[![Tests](https://github.com/kench3n/stats-learning/actions/workflows/test.yml/badge.svg)](https://github.com/kench3n/stats-learning/actions/workflows/test.yml)

A self-contained learning platform for introductory statistics and quantitative finance. Built with vanilla JavaScript and HTML5 Canvas — no external libraries.

## Quick Start

Open `stats_hub.html` in any modern browser. That's it — no build step, no server required.

## Project Structure

```
stats_learning/
├── stats_hub.html            # Main hub (all-in-one SPA)
├── index.html                # Redirect to stats_hub.html
├── scripts/
│   └── stats_hub.js          # Core logic: navigation, math, visualizations, practice
├── styles/
│   └── stats_hub.css         # All styling and responsive layout
├── tests/
│   ├── run_all.js            # Master test runner (node tests/run_all.js)
│   ├── validate_html.js      # HTML structure validation
│   ├── validate_problems.js  # Problem schema & content validation
│   ├── validate_math.js      # Formula correctness checks
│   └── validate_visualizers.js # Visualizer function validation
├── unit1_visualizer.html     # Standalone visualizer page
├── unit1_practice.html       # Standalone practice problems page
├── quant_roadmap.html        # Standalone roadmap page
├── STUDY_PLAN.md             # 11-unit curriculum outline
├── CODEX_PROMPT.md           # Build prompt for AI-assisted development
├── CLAUDE.md                 # AI assistant instructions
├── .gitignore
└── README.md                 # This file
```

The standalone pages (`unit1_*.html`, `quant_roadmap.html`) are self-contained with inline styles and scripts. `stats_hub.html` combines all features into a single multi-page app with unit selection across 11 units.

## Features

### Quant Roadmap

A structured learning path across **6 pillars** and **3 levels**:

| Pillar | Level 1 | Level 2 | Level 3 |
|--------|---------|---------|---------|
| Mathematics | Algebra & precalculus | Calculus & linear algebra | Stochastic calculus |
| Probability & Statistics | Descriptive stats, basic probability | Time series & regression | Bayesian, nonparametric, extreme value |
| Computer Science | Python, data structures, Big-O | Advanced algorithms, data engineering | — |
| Machine Learning | — | Supervised/unsupervised, evaluation | Financial ML, deep learning, RL |
| Finance & Economics | Markets, TVM, macro basics | Derivatives, CAPM, EMH | Behavioral finance, risk measures |
| Infrastructure | — | — | Low-latency, distributed systems, cloud |

- Checkbox tracking with localStorage persistence
- Career paths panel (Quant Trader, Developer, Researcher) with minimum-level requirements
- Bottom progress bar showing overall completion

### Interactive Visualizer

14 real-time canvas-based tools across 11 units:

**Unit 1 — Descriptive Statistics:**
- **Histogram** — Presets (symmetric, skewed, bimodal, uniform), adjustable bins and sample size, custom data input. Displays mean, median, mode, SD, IQR, and range.
- **Boxplot** — Five-number summary visualization with outlier detection (1.5 x IQR rule). Adjustable extreme value slider.
- **Normal Curve** — Adjustable mu and sigma. Shaded regions for the 68-95-99.7 rule and custom z-scores. Shows area, bounds.
- **Compare Distributions** — Two overlaid normal curves with independent mu/sigma controls.

**Units 2–11:** Z-Score Explorer, Interactive Scatterplot, Sampling Simulator, Venn Diagram, Binomial Explorer, CLT Simulator, CI Coverage Simulator, P-Value Visualizer, Chi-Square Explorer, Regression Output Interpreter.

Unit selector dropdown switches between units on both the Practice and Visualizer pages.

### Practice Problems

65 problems across 11 units and 3 difficulty levels (easy, medium, hard):

| Unit | Topic | Problems |
|------|-------|----------|
| 1 | Descriptive Statistics | 15 |
| 2 | Normal Distribution | 5 |
| 3 | Bivariate Data | 5 |
| 4 | Sampling & Design | 5 |
| 5 | Probability | 5 |
| 6 | Random Variables | 5 |
| 7 | Sampling Distributions | 5 |
| 8 | Confidence Intervals | 5 |
| 9 | Hypothesis Testing | 5 |
| 10 | Chi-Square Tests | 5 |
| 11 | Regression Inference | 5 |

Multiple choice and free response with tolerance-based grading and detailed explanations. Per-unit score tracking with localStorage persistence.

## Technical Details

### Dependencies

**External fonts only** (loaded from Google Fonts):
- `Space Mono` — monospace, used for labels and data
- `Instrument Serif` — headings
- `DM Sans` — body text

No JavaScript libraries. All visualizations use the native Canvas API.

### Browser Requirements

Any modern browser with Canvas support. Uses `CanvasRenderingContext2D.roundRect()` which requires Chrome 99+, Firefox 112+, Safari 15.4+, or Edge 99+.

### localStorage Keys

| Key | Used By | Stores |
|-----|---------|--------|
| `sh-topics` | `stats_hub.html` | Topic completion state (`{ "Topic Name": true }`) |
| `sh-practice-{unit}` | `stats_hub.html` | Per-unit answered state and scores |
| `quant-roadmap-state` | `quant_roadmap.html` | Same format, for the standalone roadmap |

Progress persists across browser sessions. Clear localStorage to reset.

### Key Functions (`stats_hub.js`)

**Math utilities:**
`mean`, `median`, `mode`, `stdev`, `quantile`, `normalPDF`, `normalCDF`, `erf`, `randn`, `comb`, `clamp`, `fmtPct`, `gNum`

**Unit 1 Rendering:**
`drawHist`, `drawBox`, `drawNorm`, `drawComp` — each redraws its canvas from current slider/data state

**Units 2–11 Rendering:**
`drawZscore`, `drawScatter`, `drawSampling`, `drawVenn`, `drawBinom`, `drawCLT`, `drawCoverage`, `drawPValue`, `drawChiSq`, `drawRegOut`

**Unit Management:**
`setUnit`, `buildVizForUnit`, `vizTemplate`, `drawActiveVisualizer`, `prepCanvas2`

**Roadmap:**
`buildRoadmap` — generates all pillar cards from the `RM` data object

**Practice:**
`buildProblems`, `ansMC`, `ansFR`, `getPracticeState`, `savePracticeState` — renders problems with per-unit persistence

All canvas visualizations automatically redraw on window resize.

### Running Tests

```bash
node tests/run_all.js          # Run all 185 tests
node tests/validate_html.js    # HTML structure only
node tests/validate_problems.js # Problem schema only
node tests/validate_math.js    # Formula correctness only
node tests/validate_visualizers.js # Visualizer functions only
```

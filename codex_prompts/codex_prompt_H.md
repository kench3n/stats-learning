# Codex Prompt H — Phase 5: Product Readiness

## Project Context

**Stats Learning Hub** is a single-page vanilla JS/HTML/CSS educational app for introductory statistics. No frameworks, no npm, no build step. 185 automated tests run via `node tests/run_all.js`.

### Key Files
- `stats_hub.html` — all markup
- `scripts/stats_hub.js` — all logic (~1450 lines)
- `styles/stats_hub.css` — all styles (~334 lines)
- `tests/` — 185 automated tests (Node.js). **NEVER modify these.**

### Completed Phases
- Phase 1: Core Expansion (11 units, 65 problems, visualizer placeholders)
- Phase 2: Visualizer Upgrades (10 full interactive visualizers)
- Phase 3: Content Expansion (115 total problems)
- Phase 4: Accessibility & Polish (WCAG AA, keyboard nav, ARIA, CSP)

---

## Task

Implement **Phase 5: Product Readiness** — 5 items described below.

---

## Item 1: Performance Optimization (Lazy Loading Visualizers)

**Files:** `scripts/stats_hub.js`

### Current State
- All visualizers draw immediately when their unit is selected via `setUnit()`
- `vizTemplate(unit)` generates HTML, then `allViz[unit].draw()` fires right away
- Unit 1 draws 4 canvases (histogram, boxplot, normal, comparison) on page load

### Required Changes

1. **Defer visualizer drawing until the Visualizer tab is actually visible.** In `goPage()`, only call the visualizer draw function when navigating TO the visualizer page. If the user is on Practice or Roadmap, skip drawing.

2. **In `setUnit()`, only draw the visualizer if the viz page is currently active.** Check which page is visible before calling draw:
```javascript
// Only draw if visualizer page is active
if(document.getElementById('pg-viz')?.classList.contains('active')){
  // draw visualizer
}
```

3. **Cache drawn state per unit.** Track which units have been drawn to avoid redundant full redraws when switching back:
```javascript
let vizDrawn = {};
// In draw logic:
if(!vizDrawn[unit]) { /* full draw */ vizDrawn[unit]=true; }
```

4. **Do NOT split stats_hub.js into multiple files** — keep it monolithic for simplicity.

---

## Item 2: Offline Support (Service Worker + Self-Hosted Fonts)

**Files:** New files: `service-worker.js`, `manifest.json`, `fonts/` directory. Modified: `stats_hub.html`, `styles/stats_hub.css`, `scripts/stats_hub.js`

### 2a: Self-Host Fonts

Download and save these Google Fonts as WOFF2 in a `fonts/` directory:
- `Space Mono` — 400, 700 weights
- `Instrument Serif` — 400, 400 italic
- `DM Sans` — 300, 400, 500, 600, 700 weights

Add `@font-face` declarations at the top of `styles/stats_hub.css`:
```css
@font-face {
  font-family: 'Space Mono';
  src: url('../fonts/space-mono-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
/* ... repeat for each weight/style */
```

Remove the Google Fonts `<link>` tags and preconnect hints from `stats_hub.html`.

Update the CSP meta tag: remove `https://fonts.googleapis.com` from `style-src` and `https://fonts.gstatic.com` from `font-src`.

### 2b: Web App Manifest

Create `manifest.json` in the project root:
```json
{
  "name": "Stats Learning Hub",
  "short_name": "Stats Hub",
  "description": "Interactive statistics learning platform",
  "start_url": "/stats_hub.html",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#00e5c7",
  "icons": []
}
```

Add to `stats_hub.html` `<head>`:
```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#00e5c7">
```

### 2c: Service Worker

Create `service-worker.js` in the project root with a cache-first strategy:

```javascript
const CACHE_NAME = 'stats-hub-v1';
const ASSETS = [
  '/stats_hub.html',
  '/scripts/stats_hub.js',
  '/styles/stats_hub.css',
  '/manifest.json',
  // All font files
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
```

Register in `scripts/stats_hub.js` (inside the existing DOM guard):
```javascript
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/service-worker.js');
}
```

---

## Item 3: Print-Friendly Styles

**File:** `styles/stats_hub.css`

Add a `@media print` block at the end of the file:

```css
@media print {
  /* Reset to light theme */
  :root {
    --bg: #fff; --bg2: #f5f5f5; --text: #111; --muted: #555;
    --border: #ccc;
  }

  /* Hide non-printable elements */
  .top-nav, .bottom-bar, .skip-link, body::before,
  .progress-panel, .score-bar, .tab-bar,
  canvas, .viz-controls, .preset-bar,
  .export-import-bar, .reset-bar,
  button, select, input[type="range"] { display: none !important; }

  /* Layout reset */
  body { background: #fff; color: #111; font-size: 11pt; line-height: 1.5; }
  .page { position: static !important; opacity: 1 !important; pointer-events: auto !important; }

  /* Practice problems */
  .pc { page-break-inside: avoid; border: 1px solid #ccc; margin-bottom: 12pt; padding: 8pt; }
  .pc-q { font-size: 11pt; }
  .choices { display: block; }
  .ch-btn { border: 1px solid #999; padding: 4pt 8pt; margin: 4pt 0; }

  /* Feedback visible if answered */
  .fb.show { display: block; }
  .fb-box { border: 1px solid #666; padding: 6pt; }

  /* Page headers */
  .section-header { text-align: left; }
  .section-title { font-size: 16pt; color: #111; }
}
```

---

## Item 4: Contributing Guide & Developer Documentation

**Files:** New files: `CONTRIBUTING.md`, `ARCHITECTURE.md`

### 4a: CONTRIBUTING.md

Create `CONTRIBUTING.md` in the project root with these sections:

```markdown
# Contributing to Stats Learning Hub

## Setup
1. Clone the repo: `git clone <url>`
2. Open `stats_hub.html` in any modern browser — no build step needed
3. Run tests: `node tests/run_all.js`

## Running Tests
- All tests: `node tests/run_all.js`
- HTML validation: `node tests/validate_html.js`
- Problem validation: `node tests/validate_problems.js`
- Math validation: `node tests/validate_math.js`
- Visualizer validation: `node tests/validate_visualizers.js`

All 185 tests must pass before submitting a PR.

## Adding a Practice Problem
1. Open `scripts/stats_hub.js` and find the `allProbs` data
2. Add a new object following the schema:
   - `id`: "u{unit}p{number}" (must be unique)
   - `unit`: 1-11
   - `type`: "mc" or "fr"
   - `diff`: "easy", "medium", or "hard"
   - `q`: question text
   - `ch`: array of 4 choices (MC only)
   - `ans`: correct answer index (MC) or number (FR)
   - `ex`: step-by-step explanation
3. Run `node tests/validate_problems.js` to verify

## Adding a Visualizer
1. Create a `drawXyz()` function in `scripts/stats_hub.js`
2. Register it in the `allViz` object with `{draw: drawXyz}`
3. Add controls in `vizTemplate()` for the unit
4. Run `node tests/validate_visualizers.js` to verify

## Code Style
- Vanilla JS only — no frameworks or npm packages
- Guard all DOM/localStorage calls: `if(typeof document!=='undefined')`
- Keep functions small and focused
- Follow existing naming conventions

## Tests Are Sacred
- NEVER modify files in `tests/`
- If a test fails, fix the source code, not the test
- Tests define correct behavior

## Git Workflow
- Create feature branches from `main`
- Write descriptive commit messages: `feat:`, `fix:`, `docs:`
- Ensure all tests pass before pushing
```

### 4b: ARCHITECTURE.md

Create `ARCHITECTURE.md` in the project root:

```markdown
# Architecture

## Overview
Single-page app (SPA) with vanilla HTML/CSS/JS. No build step, no dependencies.

## File Structure
- `stats_hub.html` — All markup, page structure
- `scripts/stats_hub.js` — All logic: math, visualizers, navigation, practice, roadmap
- `styles/stats_hub.css` — All styles with CSS custom properties
- `tests/` — 4 test suites, 185 total tests (Node.js)

## Data Structures
- `allProbs` — Object keyed by unit number, each containing array of problems
- `allViz` — Object keyed by unit number, each with `{draw, setup}` functions
- `UNIT_META` — Unit metadata (names, descriptions)
- `RM` — Roadmap data (pillars, topics, resources) keyed by level

## Navigation
- `goPage(id)` — switches between home, roadmap, visualizer, practice pages
- `showSub(id)` — switches sub-panels (roadmap levels, viz tabs)
- Pages use CSS visibility toggling (`.active` class)

## localStorage Keys
- `sh-practice-{unit}` — per-unit practice state (answers, scores)
- `sh-topics` — roadmap checkbox state
- `quant-roadmap-state` — roadmap UI state

## Visualizers
- Unit 1: 4 static canvases (histogram, boxplot, normal, comparison)
- Units 2-11: dynamic HTML via `vizTemplate()`, one canvas each
- All drawing uses HTML5 Canvas 2D API
- Slider/input changes trigger redraw of active visualizer

## Testing
- Tests run in Node.js (no DOM)
- All `document`/`window`/`localStorage` calls guarded with typeof checks
- Tests validate: HTML structure, problem schema, math correctness, visualizer functions
```

---

## Item 5: CI Pipeline

**Files:** New: `.github/workflows/test.yml`, `package.json`

### 5a: package.json

Create `package.json` in the project root:
```json
{
  "name": "stats-learning-hub",
  "version": "1.0.0",
  "description": "Interactive statistics learning platform",
  "private": true,
  "scripts": {
    "test": "node tests/run_all.js",
    "test:html": "node tests/validate_html.js",
    "test:problems": "node tests/validate_problems.js",
    "test:math": "node tests/validate_math.js",
    "test:visualizers": "node tests/validate_visualizers.js"
  }
}
```

### 5b: GitHub Actions Workflow

Create `.github/workflows/test.yml`:
```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

### 5c: README Badge

Add at the top of `README.md` (after the title):
```markdown
[![Tests](https://github.com/kench3n/stats-learning/actions/workflows/test.yml/badge.svg)](https://github.com/kench3n/stats-learning/actions/workflows/test.yml)
```

---

## Constraints

- **NEVER modify** any file in `tests/`
- Guard all `document`/`window`/`localStorage`/`navigator` calls with `if(typeof X!=='undefined')` for Node.js test compatibility
- Keep the app fully functional without a server (file:// protocol should still work for core features)
- Service worker registration should be conditional and fail gracefully
- Do not add npm dependencies — `package.json` is only for scripts
- Do not change existing behavior — all current features must work identically
- Self-hosted fonts must render identically to the Google Fonts versions

---

## Verification

After ALL changes, run:

```bash
node tests/run_all.js
```

**Expected:** 185/185 tests pass, 0 failures.

If any test fails, revert the breaking change and try again. Do NOT modify any file in `tests/`.

### Manual Verification

1. **Lazy loading:** Switch to Practice tab → switch to Visualizer → canvas should draw only then
2. **Offline:** Open in Chrome → DevTools → Application → Service Workers → should be registered. Go offline → reload → app should still work
3. **Print:** Press Ctrl+P on the Practice page → preview should show white background, readable problems, no nav/footer
4. **Fonts:** Text should render identically after switching to self-hosted fonts — compare screenshots before/after
5. **CI:** Push to GitHub → Actions tab → test workflow should run and pass
6. **No console errors** in any scenario

---

## Summary

| Item | What | Files |
|------|------|-------|
| 1 | Lazy load visualizers | `scripts/stats_hub.js` |
| 2 | Offline support (SW + fonts + manifest) | New: `service-worker.js`, `manifest.json`, `fonts/`. Modified: `stats_hub.html`, `stats_hub.css`, `stats_hub.js` |
| 3 | Print-friendly styles | `styles/stats_hub.css` |
| 4 | Contributing guide & architecture docs | New: `CONTRIBUTING.md`, `ARCHITECTURE.md` |
| 5 | CI pipeline | New: `.github/workflows/test.yml`, `package.json`. Modified: `README.md` |

**Scope:** 5 items covering performance, offline, print, docs, and CI. No changes to test files. No new dependencies.

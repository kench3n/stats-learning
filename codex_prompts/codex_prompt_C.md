# Codex Prompt C — Performance Optimizations

## Project Context

You are modifying a vanilla JS/HTML/CSS statistics learning web app ("Stats Learning Hub"). No build system — everything runs directly in the browser. The app lives in three files:

- `stats_hub.html` — single-page HTML
- `scripts/stats_hub.js` — all logic (~1,259+ lines after Prompts A & B)

### Key conventions
- All new `window`/`document`/`localStorage` calls must be guarded: `if(typeof document!=='undefined' && typeof document.addEventListener==='function'){ ... }` — tests run in Node.js where `window`, `document`, `setTimeout`, `requestAnimationFrame` do not exist.
- Never modify any file in `tests/`.
- The script tag uses `defer`, so it runs after DOM parsing.

### Current performance-relevant code

**Resize handlers** (two exist):
```js
// Line 319 — fires for Unit 1 canvases
window.addEventListener('resize', () => { drawHist(); drawBox(); drawNorm(); drawComp(); });

// Line 1258 — fires for all units
window.addEventListener('resize', () => { drawActiveVisualizer(); });
```

**Init sequence** (line 317–318, 1257):
```js
buildRoadmap(); buildProblems(); loadPreset();  // line 317-318
setUnit(1);                                      // line 1257
```

**`drawActiveVisualizer()`** (line 637–640):
```js
function drawActiveVisualizer(){
  if(currentUnit===1){drawHist();drawBox();drawNorm();drawComp();return;}
  const v=allViz[currentUnit];if(v&&typeof v.draw==='function')v.draw();
}
```

**`prepCanvas2(id, h)`** (line 558–571): Resizes canvas to match container width every call, always redraws.

**`goPage(id)`** (line 11–20): Switches pages. Calls `drawActiveVisualizer()` when switching to visualizer.

**Google Fonts link** (line 8 of HTML):
```html
<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">
```

---

## Task

Apply targeted performance optimizations without changing any visible behavior.

### 1. JS changes (`scripts/stats_hub.js`)

#### A. Debounce resize handlers

Replace **both** resize listeners with a single debounced one. Add a debounce helper near the utilities section:

```js
function debounce(fn, ms) {
  let t;
  return function() { clearTimeout(t); t = setTimeout(fn, ms); };
}
```

Then replace the two `window.addEventListener('resize', ...)` calls (lines 319 and 1258) with a **single** guarded listener:

```js
if(typeof window !== 'undefined' && typeof window.addEventListener === 'function'){
  window.addEventListener('resize', debounce(function(){ drawActiveVisualizer(); }, 150));
}
```

Remove the old line-319 listener entirely — `drawActiveVisualizer()` already handles Unit 1 by calling all four draw functions. The line-1258 listener should also be removed and replaced by this single one.

**Important**: The old line-319 listener is NOT guarded. Remove it. The new one must be guarded.

#### B. Skip draw when visualizer page is not visible

At the top of `drawActiveVisualizer()`, add a guard:

```js
function drawActiveVisualizer(){
  if(typeof document !== 'undefined'){
    const vizPage = document.getElementById('page-visualizer');
    if(vizPage && !vizPage.classList.contains('active')) return;
  }
  // ... existing logic
}
```

This prevents wasted canvas redraws when the user is on Home, Roadmap, or Practice pages.

#### C. Defer non-critical init

Wrap the initial `buildRoadmap()` and `loadPreset()` calls in deferred execution. The current code (around lines 317–318) is:

```js
buildRoadmap(); buildProblems(); loadPreset();
```

Change to:

```js
buildProblems();
if(typeof requestAnimationFrame !== 'undefined'){
  requestAnimationFrame(function(){ buildRoadmap(); loadPreset(); });
} else {
  buildRoadmap(); loadPreset();
}
```

`buildProblems()` stays synchronous (it's needed immediately). `buildRoadmap()` and `loadPreset()` are deferred to avoid blocking first paint. The `else` branch ensures Node.js compat (no `requestAnimationFrame` in Node).

#### D. Canvas resize optimization — cache dimensions in `prepCanvas2`

Add a dimension cache to skip redundant redraws. Before `prepCanvas2`, add:

```js
const _canvasCache = {};
```

Then modify `prepCanvas2` to check if dimensions actually changed:

```js
function prepCanvas2(id, h) {
  const c = document.getElementById(id);
  if (!c || !c.getContext) return null;
  const ctx = c.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = c.clientWidth || c.offsetWidth || 800;
  const newW = Math.max(1, Math.round(W * dpr));
  const newH = Math.max(1, Math.round(h * dpr));
  // Skip full resize if dimensions unchanged
  const cacheKey = id;
  if (_canvasCache[cacheKey] && _canvasCache[cacheKey].w === newW && _canvasCache[cacheKey].h === newH) {
    // Dimensions same — still clear and return context
    if(typeof ctx.setTransform === 'function') ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    else ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, h);
    return { c, ctx, W, H: h };
  }
  c.width = newW;
  c.height = newH;
  c.style.height = h + 'px';
  _canvasCache[cacheKey] = { w: newW, h: newH };
  if (typeof ctx.setTransform === 'function') ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  else ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, h);
  return { c, ctx, W, H: h };
}
```

This avoids expensive canvas buffer reallocation when dimensions haven't changed (e.g., slider changes that don't resize the window).

### 2. HTML changes (`stats_hub.html`)

Add `preconnect` hints **before** the existing Google Fonts `<link>` (line 8). Also add `fetchpriority` to the CSS link. The `<head>` should look like:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles/stats_hub.css" fetchpriority="high">
```

---

## Critical: Node.js test compatibility

Every new use of browser globals (`window`, `document`, `setTimeout`, `requestAnimationFrame`, `devicePixelRatio`) must be guarded. The test runner does `require('scripts/stats_hub.js')` in Node.js. Unguarded browser globals will crash the tests.

Pattern to use:
```js
if(typeof window !== 'undefined') { /* browser code */ }
if(typeof document !== 'undefined') { /* DOM code */ }
if(typeof requestAnimationFrame !== 'undefined') { /* rAF code */ } else { /* sync fallback */ }
```

---

## Verification

```bash
node tests/run_all.js   # Must remain 185 passed, 0 failed
```

Do NOT modify any file in `tests/`. If tests break, the source code fix is wrong — revert and try again.

## What NOT to change

- Do not refactor or restructure existing draw functions.
- Do not change any visual output or behavior.
- Do not add new UI elements (this prompt is optimization-only).
- Do not touch `styles/stats_hub.css` (no CSS changes in this prompt).

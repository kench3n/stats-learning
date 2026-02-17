# Codex Prompt A — Progress Dashboard & Reset

## Project Context

You are modifying a vanilla JS/HTML/CSS statistics learning web app ("Stats Learning Hub"). There is **no build system** — everything runs directly in the browser. The app lives in three files:

- `stats_hub.html` — single-page HTML
- `scripts/stats_hub.js` — all logic (~1,259 lines)
- `styles/stats_hub.css` — all styles (~277 lines)

### Key conventions
- All new `window`/`document`/`localStorage` calls must be guarded: `if(typeof document!=='undefined' && typeof document.addEventListener==='function'){ ... }` — the test runner evaluates the JS in Node.js where no DOM exists.
- Never modify any file in `tests/`. Tests are sacred.
- CSS uses custom properties from `:root` (e.g. `var(--bg2)`, `var(--cyan)`, `var(--border)`).
- Practice state is stored per-unit in localStorage keys `sh-practice-{unit}` as JSON `{answered: {id: value}}`. Roadmap checkbox state is in `sh-topics` as JSON `{topicName: true/false}`.
- The existing function `persistPracticeState()` (line 350) saves the current unit's state: `savePracticeState(currentUnit, {answered})`.
- `buildProblems(unit)` rebuilds the problem list, reads saved state from localStorage, and restores answered states.
- `buildRoadmap()` builds the roadmap DOM and restores topic checkboxes.
- `updateTopicProgress()` recounts checked topics and updates the bottom bar.
- `setAllScores()` updates the score bar text and fill width.
- `currentUnit` tracks the active unit (1–11). `allProbs` maps unit → problem array.

---

## Task

Add a **progress summary panel** and **reset functionality** to the Practice page.

### 1. HTML changes (`stats_hub.html`)

Inside `#page-practice`, **above** the existing `<div class="unit-selector">` block (line 216), insert a collapsible progress summary panel:

```html
<div class="progress-panel" id="progressPanel">
  <button class="progress-toggle" id="progressToggle" aria-expanded="true" onclick="toggleProgressPanel()">Progress Overview ▾</button>
  <div class="progress-grid" id="progressGrid" role="status" aria-live="polite"></div>
  <div class="progress-actions" id="progressActions">
    <button class="reset-btn" onclick="resetAllProgress()">Reset All Progress</button>
  </div>
</div>
```

Inside the existing `.score-bar` div (line 232), **after** the `<div class="score-text">` span, add a Reset Unit button:

```html
<button class="reset-btn reset-unit-btn" onclick="resetUnit(currentUnit)">Reset Unit</button>
```

### 2. JS changes (`scripts/stats_hub.js`)

Add these functions **before** the final `setUnit(1);` call (line 1257). All DOM-touching code must be guarded with `typeof document !== 'undefined'`.

#### `getProgressSummary()`
- Loop units 1–11.
- For each, read `localStorage.getItem('sh-practice-' + unit)`, parse JSON.
- Count `total` (from `allProbs[unit].length`), `attempted` (keys in `answered`), `correct` (re-check each answer against `allProbs[unit]` — for MC: `answered[id] === prob.ans`; for FR: `Math.abs(parseFloat(answered[id]) - prob.ans) <= (prob.tol || 0.1)`).
- Return an object `{ 1: {total, attempted, correct}, 2: {...}, ... 11: {...} }`.

#### `buildProgressPanel()`
- Call `getProgressSummary()`.
- Build 11 cells (one per unit) into `#progressGrid`. Each cell:
  - Shows unit number and `correct / total`.
  - Has a CSS class based on completion %: `>=80%` → `progress-cell-green`, `>=40%` → `progress-cell-amber`, else `progress-cell-red`. If `total === 0` or `attempted === 0`, use `progress-cell-empty`.
- Set `innerHTML` on `#progressGrid`.

#### `toggleProgressPanel()`
- Toggle a `collapsed` class on `#progressPanel`.
- Update `aria-expanded` on the toggle button and the button text arrow (▾ / ▸).

#### `resetUnit(unit)`
- Show `confirm('Reset all progress for Unit ' + unit + '?')`. If cancelled, return.
- `localStorage.removeItem('sh-practice-' + unit)`.
- Reset `answered = {}` and `pScore = 0`.
- Call `buildProblems(currentUnit)` to rebuild.
- Call `buildProgressPanel()` to refresh the summary.

#### `resetAllProgress()`
- Show `confirm('Reset ALL progress? This cannot be undone.')`. If cancelled, return.
- Loop 1–11: `localStorage.removeItem('sh-practice-' + i)`.
- `localStorage.removeItem('sh-topics')`.
- Reset `answered = {}` and `pScore = 0`.
- Call `buildProblems(currentUnit)`.
- Call `buildRoadmap()` (which calls `restoreTopics()` + `updateTopicProgress()` internally).
- Call `buildProgressPanel()`.

#### Update `persistPracticeState()`
Change the existing `persistPracticeState` function (line 350) from:
```js
function persistPracticeState(){savePracticeState(currentUnit,{answered})}
```
to:
```js
function persistPracticeState(){savePracticeState(currentUnit,{answered});if(typeof document!=='undefined')buildProgressPanel();}
```

#### Init call
After defining these functions, add a guarded init:
```js
if(typeof document!=='undefined' && typeof document.addEventListener==='function'){
  document.addEventListener('DOMContentLoaded', buildProgressPanel);
}
```
Or, if `DOMContentLoaded` has already fired by the time the script runs (it uses `defer`), just call `buildProgressPanel()` near the existing `setUnit(1)` line.

### 3. CSS changes (`styles/stats_hub.css`)

Add at the end of the file:

```css
/* ===================== PROGRESS PANEL ===================== */
.progress-panel{max-width:780px;margin:0 auto 18px;padding:0 24px;}
.progress-toggle{
  font-family:'Space Mono',monospace;font-size:11px;letter-spacing:1px;
  text-transform:uppercase;color:var(--dim);background:none;border:1px dashed var(--border);
  padding:8px 16px;border-radius:6px;cursor:pointer;width:100%;text-align:left;
  transition:all 0.2s;
}
.progress-toggle:hover{border-color:var(--border-h);color:var(--text);}
.progress-panel.collapsed .progress-grid,
.progress-panel.collapsed .progress-actions{display:none;}
.progress-grid{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));
  gap:8px;margin-top:10px;
}
.progress-cell{
  background:var(--bg2);border:1px solid var(--border);border-radius:8px;
  padding:10px 8px;text-align:center;transition:border-color 0.3s;
}
.progress-cell-label{font-family:'Space Mono',monospace;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;}
.progress-cell-score{font-family:'Space Mono',monospace;font-size:14px;font-weight:700;margin-top:2px;}
.progress-cell-green{border-color:rgba(52,211,153,0.4);}
.progress-cell-green .progress-cell-score{color:var(--green);}
.progress-cell-amber{border-color:rgba(245,158,11,0.4);}
.progress-cell-amber .progress-cell-score{color:var(--amber);}
.progress-cell-red{border-color:rgba(239,68,68,0.3);}
.progress-cell-red .progress-cell-score{color:var(--red);}
.progress-cell-empty .progress-cell-score{color:var(--muted);}
.progress-actions{margin-top:10px;display:flex;gap:8px;justify-content:flex-end;}
.reset-btn{
  font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;
  text-transform:uppercase;padding:7px 14px;border-radius:6px;cursor:pointer;
  background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.25);
  color:var(--red);transition:all 0.2s;
}
.reset-btn:hover{background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.4);}
.reset-unit-btn{margin-left:auto;font-size:9px;padding:4px 10px;}
```

---

## Verification

```bash
node tests/run_all.js   # Must remain 185 passed, 0 failed
```

Do NOT modify any file in `tests/`. If tests break, the source code fix is wrong — revert and try again.

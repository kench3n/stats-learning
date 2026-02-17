# Codex Prompt F — JS Behavioral Improvements

## Objective

Fix three behavioral issues in `scripts/stats_hub.js`: improve the `mode()` function for discrete data, eliminate recursive redraws in the regression visualizer's mousemove handler, and extract the inline problem data to a separate file for maintainability.

## Constraints

- Only modify `scripts/stats_hub.js` (and create `scripts/problems.js` for extraction)
- If creating `scripts/problems.js`, also add a `<script>` tag in `stats_hub.html` before `stats_hub.js`
- NEVER modify any file in `tests/`
- Run `node tests/run_all.js` after each change and confirm 185/185 passing
- Changes must be backward-compatible — all existing functionality must work identically

## Issues to Fix

### Issue 1: Improve `mode()` for discrete integer data (~line 65)

Current implementation:
```js
function mode(a){
  const f={};
  a.forEach(v=>{const k=Math.round(v*2)/2;f[k]=(f[k]||0)+1});
  let mx=0,mv=0;
  for(let k in f)if(f[k]>mx){mx=f[k];mv=+k}
  return mv;
}
```

The `Math.round(v*2)/2` bucketing rounds values to nearest 0.5, which is appropriate for continuous histogram data but can silently merge distinct integer values (e.g., 7 and 7.4 both map to 7.5).

Fix: use the raw value as the key for integer data. A simple approach:
```js
function mode(a){
  const f={};
  a.forEach(v=>{
    const k=Number.isInteger(v)?v:Math.round(v*2)/2;
    f[k]=(f[k]||0)+1;
  });
  let mx=0,mv=0;
  for(let k in f)if(f[k]>mx){mx=f[k];mv=+k}
  return mv;
}
```

Verification: the histogram still shows correct mode for preset data, and `node tests/run_all.js` passes.

### Issue 2: Fix recursive redraw in regression mousemove (~line 1199)

`drawRegOut()` is called from within its own `mousemove` event handler, which triggers a full canvas redraw on every mouse pixel movement — including re-computing hotspot rectangles and re-rendering the entire regression table.

Refactor to separate the tooltip rendering from the full draw:
1. Extract hotspot hit-testing and tooltip overlay into a lightweight function (e.g., `updateRegTooltip()`) that only redraws the tooltip layer
2. OR cache the last hover key and skip `drawRegOut()` if the hover state hasn't changed

Minimal fix (skip if unchanged):
```js
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  vizState.u11.mouse = {x, y};
  const hit = vizState.u11.hotspots.find(h => x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h);
  const newHover = hit ? hit.key : '';
  if (newHover !== vizState.u11.hover) {
    vizState.u11.hover = newHover;
    setElText('u11Tip', hit ? hit.tip : 'Hover a highlighted value for explanation.');
    drawRegOut();
  }
});
```

Similarly update the `mouseleave` handler to check before redrawing.

### Issue 3: Extract problem data to separate file (optional but recommended)

The `allProbs` data (Units 1–11, ~300 lines) is defined inline in `stats_hub.js`. Extract it to `scripts/problems.js` which defines a global `ALL_PROBLEMS` object, then reference it from `stats_hub.js`.

Steps:
1. Create `scripts/problems.js` containing `const ALL_PROBLEMS = { 1: [...], 2: [...], ... };`
2. In `stats_hub.html`, add `<script src="scripts/problems.js" defer></script>` BEFORE the `stats_hub.js` script tag
3. In `stats_hub.js`, replace the inline `allProbs` assignments with: `let allProbs = typeof ALL_PROBLEMS !== 'undefined' ? {...ALL_PROBLEMS} : {1: probs.map(...)};`
4. Keep the Unit 1 `probs` array inline in `stats_hub.js` since it's referenced before the allProbs merge

**Important**: the test suite loads `stats_hub.js` directly via `fs.readFileSync`. The tests check for function existence and problem data using string matching. After extraction:
- The test `validate_problems.js` reads JS source and looks for problem arrays. Make sure `scripts/problems.js` is also readable by the test, OR keep a reference in `stats_hub.js` that the tests can find (e.g., keep the `allProbs[2]` assignments in `stats_hub.js` as comments or as a fallback).
- Run `node tests/run_all.js` and fix any test that can't find problem data.

If this issue proves too complex to do safely without breaking tests, skip it and only do Issues 1 and 2.

## File Targets

- `scripts/stats_hub.js` (modify)
- `scripts/problems.js` (create — only if doing Issue 3)
- `stats_hub.html` (modify — only if doing Issue 3)

## Verification Steps

```bash
node tests/run_all.js    # Must show: 185 passed, 0 failed

# Verify mode fix works for integer arrays
# (manual check: open app, histogram with symmetric preset, mode should display correctly)

# Verify regression tooltip doesn't cause jank
# (manual check: open Unit 11 visualizer, move mouse smoothly over table)
```

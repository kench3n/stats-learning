# Phase QA: Post-Launch Polish & UX Fixes

## Task 1: Browser History (pushState/popstate)

Add browser back/forward navigation support to the SPA.

### Requirements:
- When `goPage(id)` is called, push state: `history.pushState({page: id}, '', '#/' + id)`
- Add a `popstate` listener on window that reads `event.state.page` and calls `goPage()` without pushing again
- On initial load, check `location.hash` — if it matches `#/practice`, `#/visualizer`, etc., navigate to that page
- Guard all `window`/`history` calls with `typeof window !== 'undefined'`
- Do NOT break existing navigation — all nav-tab clicks must still work

### Files to modify:
- `scripts/stats_hub.js` — modify `goPage()`, add `popstate` listener, add hash-based init

---

## Task 2: Visualizer Sub-Tabs for Units 2-14

Currently, clicking sub-tab buttons (Histogram, Boxplot, Normal, Compare) only works for Unit 1. Units 2-14 show a single visualizer with no meaningful sub-tab switching.

### Requirements:
- When the visualizer page loads for units 2-14, hide the Unit 1 sub-tabs OR show unit-appropriate tabs
- Each unit's visualizer (from `allViz`) should render in the main viz area when that unit is selected
- The unit selector dropdown on the Visualizer page must trigger the correct `allViz[unit].draw()` function
- Ensure canvas resizes correctly when switching units

### Files to modify:
- `scripts/stats_hub.js` — update visualizer unit switching logic
- `stats_hub.html` — if sub-tab markup needs adjustment

---

## Task 3: Update package.json

### Requirements:
- Change `"version"` from `"1.0.0"` to `"2.0.0"`
- Add missing npm scripts:
  ```json
  "test:extended": "node tests/run_extended.js",
  "test:engagement": "node tests/validate_engagement.js",
  "test:ui": "node tests/validate_ui_features.js",
  "test:units": "node tests/validate_new_units.js",
  "benchmark": "node tests/benchmark.js"
  ```

### Files to modify:
- `package.json`

---

## Task 4: Add Step-by-Step Solutions to Hard Problems

Currently only problem 101 has a `steps` array. Add step-by-step solutions to at least 10 more problems — prioritize hard difficulty problems across different units.

### Requirements:
- Add a `steps` array (3-5 steps each) to at least 10 problems with `difficulty: "hard"`
- Steps should be pedagogically useful — break down the solution method
- Each step is a string explaining one part of the solution
- The existing `revealNextStep()` and step UI in `showFB()` already handle rendering
- Spread across multiple units (not all from the same unit)

### Files to modify:
- `scripts/stats_hub.js` — add `steps` arrays to hard problem objects

---

## Task 5: Service Worker Cache Versioning

### Requirements:
- In `service-worker.js`, update the cache name to include a version string: `stats-hub-v2`
- In the `activate` event, delete old caches that don't match the current version
- This ensures users get fresh assets after deploys

### Files to modify:
- `service-worker.js`

---

## Task 6: Expand NLP Patterns

### Requirements:
- Add 4 new NLP patterns to `NLP_PATTERNS` in `scripts/stats_hub.js`:
  1. **Probability**: "probability of A and B" / "P(A and B) = ?" → multiply if independent
  2. **Binomial**: "binomial n=10 p=0.3 k=4" → compute P(X=k)
  3. **Confidence Interval**: "95% CI for p=0.6 n=100" → compute CI
  4. **Sample size**: "sample size for ME=0.03 p=0.5" → compute n
- Each pattern needs: `regex`, `solve(match)` function returning `{answer, steps[]}`
- Use existing math helpers: `comb()`, `normalCDF()`, etc.
- Guard regex with proper escaping (remember: backslashes get stripped by Write tool — use double escaping or Python if needed)

### Files to modify:
- `scripts/stats_hub.js` — add to `NLP_PATTERNS` array

---

## Rules (same as always)
- NEVER modify any file in `tests/`
- Guard all `document`/`window`/`localStorage`/`navigator` calls with `typeof` checks
- Run `node tests/run_all.js` after every change — must pass 185/185
- Run `node tests/run_extended.js` after every change — must pass 260/260
- Commit each task separately: `git add -A && git commit -m "feat: Task N — description" && git push`

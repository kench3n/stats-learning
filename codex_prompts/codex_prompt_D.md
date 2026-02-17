# Codex Prompt D — JS Dead Code & Style Cleanup

## Objective

Clean up `scripts/stats_hub.js` by removing dead code, fixing a `var` declaration, correcting inconsistent parenthesization, and hardening the initialization sequence. These are non-behavioral changes — no test should break.

## Constraints

- Only modify `scripts/stats_hub.js`
- NEVER modify any file in `tests/`
- Do NOT change any function signatures or public behavior
- Do NOT add new features or refactor beyond what is specified
- Run `node tests/run_all.js` after each change and confirm 185/185 passing

## Issues to Fix

### Issue 1: Remove dead code (lines ~278–315)

The original `buildProblems`, `ansMC`, `ansFR`, `showFB`, and `updatePScore` functions defined around lines 278–315 are immediately overwritten by new versions at lines 352, 388, 396, 406, and 415. Delete the original dead versions entirely (lines ~278–315). Keep the later versions intact.

Verification: search the file for duplicate function definitions — there should be exactly one of each after cleanup.

### Issue 2: Change `var currentUnit` to `let currentUnit`

At approximately line 337, `var currentUnit=1;` should become `let currentUnit=1;` to match the codebase convention of using `let`/`const` exclusively.

Verification: run `grep -n "var " scripts/stats_hub.js` — the result should be empty (no remaining `var` declarations).

### Issue 3: Fix `erf()` parenthesization consistency

At approximately line 69, the expression:
```js
(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)
```
has an extra unnecessary grouping around `(a5*t+a4)*t)`. Normalize to:
```js
((((a5*t+a4)*t+a3)*t+a2)*t+a1)
```
This is cosmetic — the math result is identical.

Verification: run `node tests/validate_math.js` and confirm all math tests still pass.

### Issue 4: Wrap top-level init calls in a DOMContentLoaded guard

At approximately line 318, the calls `buildRoadmap(); buildProblems(); loadPreset();` run at the top level, relying on `defer`. Wrap them in a `DOMContentLoaded` listener for safety:

```js
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    buildRoadmap(); buildProblems(); loadPreset();
  });
}
```

Keep the existing `window.addEventListener('resize', ...)` call at line 319 as-is (it's fine outside DOMContentLoaded).

Verification: run `node tests/run_all.js` — all 185 tests must pass. The Node.js test environment uses `typeof document !== 'undefined'` guards, so adding another one is safe.

## File Targets

- `scripts/stats_hub.js`

## Verification Steps

```bash
node tests/run_all.js          # Must show: 185 passed, 0 failed
grep -n "var " scripts/stats_hub.js  # Should return nothing
```

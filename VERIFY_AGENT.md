# Claude Code Verification Agent Instructions

## Your Role
You are a strict verification and debugging agent. After Codex builds the Stats Learning Hub units, you:

1. Run the test suite
2. Identify every failure
3. Fix ONLY source code — NEVER edit files in `tests/`
4. Re-run until ALL tests pass (Phase 1: ~185 tests)

## Commands

```bash
# Run everything
node tests/run_all.js

# Run individual suites
node tests/validate_html.js      # HTML structure, CSS, file existence
node tests/validate_problems.js  # Problem schema, counts, IDs, difficulty mix
node tests/validate_math.js      # Mathematical correctness of formulas
node tests/validate_visualizers.js  # Draw functions, canvas refs, unit registration
```

## Fix Loop

```
1. Run: node tests/run_all.js
2. Read each FAIL line
3. Open the source file (stats_hub.js, stats_hub.html, or stats_hub.css)
4. Make the minimal fix
5. Re-run: node tests/run_all.js
6. Repeat until 0 failures
```

## Rules

- NEVER edit files in `tests/`
- NEVER add skip/xfail to tests
- NEVER change test assertions
- NEVER delete test files
- If a test expects a function named `drawBinom`, create `drawBinom` — don't rename the test
- If a test expects 15 problems, add problems — don't lower the count in the test
- If math is wrong in a problem answer, fix the answer — don't change the test's expected value

## What to Check Beyond Tests

After tests pass, manually verify:
1. Open stats_hub.html in browser
2. Switch between all 11 units in Practice — problems render correctly
3. Switch between all unit visualizers — canvases draw without errors
4. Check browser console for JS errors (should be zero)
5. Test at 360px mobile width
6. Refresh page — scores and progress should persist

# Contributing to Stats Learning Hub

## Setup
1. Clone the repo: `git clone <url>`
2. Open `stats_hub.html` in any modern browser - no build step needed
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
- Vanilla JS only - no frameworks or npm packages
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

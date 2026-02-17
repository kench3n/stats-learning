# CLAUDE.md — Stats Learning Hub

## Project
Single-page vanilla HTML/CSS/JS app — no frameworks, no build step, no runtime deps.
Interactive statistics learning platform with 14 units, 145+ problems, visualizers, and gamification.

## File Structure
```
stats_hub.html          — All markup and page structure
scripts/stats_hub.js    — All logic (~4000 lines): math, nav, practice, visualizers, engagement
styles/stats_hub.css    — All styles with CSS custom properties (~990 lines)
tests/                  — Test suites (NEVER modify)
  run_all.js            — Core test runner (185 tests)
  run_extended.js       — Extended runner (260 tests)
  validate_html.js      — HTML/CSS structure validation
  validate_problems.js  — Problem schema + answer checks
  validate_math.js      — Math function correctness
  validate_visualizers.js — Visualizer function checks
  validate_engagement.js — XP, streaks, milestones
  validate_ui_features.js — Paths, datasets, tutor, NLP
  validate_new_units.js — Units 12-14 schema
  benchmark.js          — Performance benchmarks (informational)
service-worker.js       — PWA offline support
manifest.json           — PWA manifest
```

## Commands
```bash
node tests/run_all.js          # Must pass: 185/185
node tests/run_extended.js     # Must pass: 260/260
node tests/benchmark.js        # Informational only
git diff                       # Check changes
git checkout -- <file>         # Revert bad change
```

## Key Constants & Data Structures
- `MAX_UNIT` — dynamic: `Object.keys(UNIT_META).length` (currently 14). NEVER hardcode unit counts.
- `allProbs` — Object keyed by unit number, arrays of problem objects
- `allViz` — Object keyed by unit number, `{draw, setup}` functions
- `UNIT_META` — Unit metadata (name, desc, icon, color)
- `LEARNING_PATHS` — 4 predefined learning paths
- `TUTOR_KB` — 16-entry AI tutor knowledge base
- `NLP_PATTERNS` — Regex patterns for natural language solver
- `DATASETS` — Built-in datasets (iris, grades, housing)
- `XP_TABLE`, `MILESTONES` — Engagement system config

## Immutable Constraint
**Tests are SACRED.** NEVER modify any file in `tests/`. All fixes go to source code only.
Only touch: `scripts/stats_hub.js`, `styles/stats_hub.css`, `stats_hub.html`.

## Fix Workflow
1. Run `node tests/run_all.js` to see failures
2. Read failing test → find what it expects
3. Read source → find where behavior diverges
4. Fix source code only (minimal change)
5. Re-run tests. If fix breaks other tests → revert and try differently.
6. Commit: `git add -A && git commit -m "fix: <description>"`

## Critical Gotchas
- **typeof guards**: All `document`/`window`/`localStorage`/`navigator` calls MUST be guarded with `typeof` checks. Tests run in Node.js (no DOM).
- **Backslash stripping**: The Write tool strips `\s`, `\d` in template literals. Use Python or write to a file for regex patterns.
- **Quote escaping in onclick**: Use `&quot;` HTML entities, not `\'`, for quotes inside onclick attributes.
- **MAX_UNIT not 11**: Always loop to `MAX_UNIT`, never hardcode `u<=11`. Units 12-14 exist.
- **Git from project root**: Always run git commands from `/workspace`, not home directory.

## Rules
- When generating prompts/plans for another AI (Codex, GPT), do NOT implement — only produce text files.
- Respect current phase scope in phased development. Don't expand into later phases without explicit request.
- Keep fixes minimal. Don't refactor unrelated code.
- Follow existing code conventions.

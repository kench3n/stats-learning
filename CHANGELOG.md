# Changelog — Stats Learning Hub

## Phase 21 — Test Suite Expansion, Documentation, Benchmarks
- Added `tests/validate_engagement.js` (24 tests for XP, streaks, milestones, dates)
- Added `tests/validate_ui_features.js` (20 tests for paths, datasets, tutor KB, NLP)
- Added `tests/validate_new_units.js` (31 tests for units 12-14 schema)
- Added `tests/run_extended.js` (runs all 260 tests: 185 original + 75 new)
- Added `tests/benchmark.js` (bundle size, load time, computation benchmarks)
- Updated README.md, PHASES.md with current feature set

## Phase 20 — Learning Paths, Goals/Deadlines, Completion Certificates
- `LEARNING_PATHS` constant with 4 paths: Quick Start, Full Course, Quant Prep, Exam Cram
- Path progress tracking, step-by-step navigation
- Custom deadline input with days-remaining countdown and pace calculator
- Auto-generated printable certificate when all path units are complete

## Phase 19 — AI Tutor, Step-by-Step Solver, NLP Input
- `TUTOR_KB` (16 entries): slide-out chat panel, local knowledge base
- `showFB()` extended: problems with `steps[]` reveal solutions progressively
- NLP input bar: 4 regex patterns (z-score, mean, stdev, median) with solution steps

## Phase 18 — Custom Problem Creator, Deck Sharing, Problem Ratings
- Custom MC/FR problem creator with full schema (question, choices, explanation, hint)
- Export/import custom decks as JSON files
- Per-problem helpful/unclear rating UI

## Phase 17 — Real Datasets, CSV Upload, Live Visualizations
- 3 built-in datasets: Iris flower, Exam Scores, Housing Prices
- CSV upload with automatic column detection
- Live stats panel: mean, SD, min, max updates on data change

## Phase 16 — Flashcard Mode, Matching Games, Formula Builder
- Flashcard page: flip-style cards, keyboard navigation (J/K/Space/Arrow)
- Matching game: terms vs definitions with score tracking
- Formula builder: drag-and-drop assembly with correctness check

## Phase 15 — Analytics Dashboard, PDF Export, Study Calendar
- Analytics charts: accuracy trend, XP trend, per-unit breakdown (canvas)
- PDF export of practice session via browser print
- Calendar view: problem-attempt heatmap by date

## Phase 14 — Bookmarks, Notes, Search, Problem Filtering
- Bookmark any problem (persisted in localStorage)
- Per-problem freeform notes
- Search by keyword (live filter)
- Filter chips: All, Unanswered, Wrong, Bookmarked, Easy, Medium, Hard

## Phase 13 — Daily Challenges, Weekly Goals, Achievement Showcase
- Daily challenge: 3 random problems, refreshes daily
- Weekly goals: configurable problem-count targets with progress ring
- Achievements page: stats summary, badge gallery, activity heatmap

## Phase 12 — Units 12-14: ANOVA, Nonparametric, Bayesian
- 30 new problems: 10 each for ANOVA, Nonparametric Tests, Bayesian Statistics
- 3 new canvas visualizers: F-distribution, rank visualization, Bayesian posterior
- `MAX_UNIT` dynamic constant replaces all hardcoded `u<=11` loops

## Phase 11 — Weak Spot Detection, Focus Mode, Session Summary
- `analyzeWeakSpots()`: flags topics with <60% accuracy in a dedicated panel
- Focus Mode: hides nav/roadmap/achievements for distraction-free practice
- Session summary modal: per-session accuracy, XP earned, problems attempted

## Phase 10 — PWA Install, Mobile Optimization, Offline Indicator
- Web App Manifest + Service Worker for offline caching
- PWA install prompt (bottom banner with dismiss)
- Offline/online status indicator
- Mobile-optimized touch targets and viewport handling

## Phase 9 — Formula Reference, Hint System, Celebration Animations
- Per-unit formula reference panel (collapsible)
- Per-problem hints (shown on wrong answer)
- Confetti animation on correct answers

## Phase 8 — Pomodoro Timer, Dark/Light Theme, Keyboard Shortcuts
- 25-minute Pomodoro timer with pause/reset
- Dark/light theme toggle (T key)
- Full keyboard shortcuts: J/K for navigation, Enter/Space for submit, H for hints

## Phase 7 — Daily Digest, GitHub Pages Deploy, Cross-Links
- Daily digest panel (streak, XP, level, cards due, badges)
- GitHub Actions CI/CD pipeline for automated tests and Pages deploy
- Practice ↔ Visualizer cross-links (jump from problem to relevant viz)

## Phase 6 — XP, Streaks, Milestones, Spaced Repetition
- XP system with difficulty-weighted awards and level progression
- Daily streak tracking (current + longest)
- 10+ milestone badges with localStorage persistence
- SM-2 spaced repetition review queue with due-card counter

## Phases 1-5 — Core Build
- Multi-unit architecture (allProbs, UNIT_META, setUnit)
- 14 units with 145+ practice problems
- 14 interactive canvas visualizers
- Quant Roadmap (6 pillars × 3 levels, checkbox tracking)
- Test suite: 185 tests across 4 validation files

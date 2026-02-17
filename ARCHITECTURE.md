# Architecture

## Overview
Single-page app (SPA) with vanilla HTML/CSS/JS. No build step, no dependencies.

## File Structure
- `stats_hub.html` - All markup, page structure
- `scripts/stats_hub.js` - All logic: math, visualizers, navigation, practice, roadmap
- `styles/stats_hub.css` - All styles with CSS custom properties
- `tests/` - 4 test suites, 185 total tests (Node.js)

## Data Structures
- `allProbs` - Object keyed by unit number, each containing array of problems
- `allViz` - Object keyed by unit number, each with `{draw, setup}` functions
- `UNIT_META` - Unit metadata (names, descriptions)
- `RM` - Roadmap data (pillars, topics, resources) keyed by level

## Navigation
- `goPage(id)` - switches between home, roadmap, visualizer, practice pages
- `showSub(id)` - switches sub-panels (roadmap levels, viz tabs)
- Pages use CSS visibility toggling (`.active` class)

## localStorage Keys
- `sh-practice-{unit}` - per-unit practice state (answers, scores)
- `sh-topics` - roadmap checkbox state
- `quant-roadmap-state` - roadmap UI state

## Visualizers
- Unit 1: 4 static canvases (histogram, boxplot, normal, comparison)
- Units 2-11: dynamic HTML via `vizTemplate()`, one canvas each
- All drawing uses HTML5 Canvas 2D API
- Slider/input changes trigger redraw of active visualizer

## Testing
- Tests run in Node.js (no DOM)
- All `document`/`window`/`localStorage` calls guarded with typeof checks
- Tests validate: HTML structure, problem schema, math correctness, visualizer functions

# Codex Prompt Y — Phase 21: Test Suite Expansion, Documentation Overhaul, Performance Benchmarks

## Project Context

Stats Learning Hub — single-page vanilla JS/HTML/CSS. Current: 185 tests. NEVER modify existing tests. This phase ADDS new tests alongside existing ones.

**CRITICAL:** Existing test files in `tests/` are IMMUTABLE. New test files can be ADDED but existing ones must NOT be changed.

---

## Task 1: Expand Test Suite

Add new test files for features introduced in Phases 6-20. These are NEW files alongside existing ones.

### 1a: Create `tests/validate_engagement.js`

Validate streak, XP, milestone, and review data structures:

```javascript
// Tests for:
// - getStreakData() returns valid structure {current, longest, lastDate, history}
// - getXPData() returns valid structure {total, level, history}
// - XP_TABLE has correct values for all difficulty levels
// - MILESTONES array has required fields (id, name, desc, icon, check)
// - All milestone check functions are callable
// - getReviewData() returns valid structure
// - addDays() correctly adds days to date strings
// - todayStr() returns YYYY-MM-DD format
// - XP_PER_LEVEL is a positive number
// - FORMULAS object has entries for all units in UNIT_META
```

### 1b: Create `tests/validate_ui_features.js`

Validate UI feature data integrity:

```javascript
// Tests for:
// - LEARNING_PATHS has required fields (name, desc, units, estimatedHours)
// - All units referenced in LEARNING_PATHS exist in UNIT_META
// - DATASETS have required fields (name, desc, cols, data)
// - Dataset data rows match column count
// - TUTOR_KB entries have keywords array and response string
// - NLP_PATTERNS have regex and solve function
// - All problems have hint field (string or null)
// - Custom problem schema validation
```

### 1c: Create `tests/validate_new_units.js`

Validate units 12-14 if they exist:

```javascript
// Tests for:
// - UNIT_META has entries for units 12, 13, 14
// - allProbs[12], [13], [14] each have 10 problems
// - Problem IDs follow u{unit}p{n} pattern
// - allViz[12], [13], [14] have draw functions
// - FORMULAS[12], [13], [14] have entries
// - New unit problems have correct schema
```

### 1d: Update `tests/run_all.js`

Add the new test files to the runner. ONLY add — do not change how existing tests are loaded or run:

```javascript
// Add to the test files array:
'tests/validate_engagement.js',
'tests/validate_ui_features.js',
'tests/validate_new_units.js',
```

**Wait — this modifies an existing test file.** Instead, create a new runner:

Create `tests/run_extended.js` that:
1. Runs `tests/run_all.js` first (the original 185 tests)
2. Then runs the new test files
3. Reports combined totals

---

## Task 2: Documentation Overhaul

Update all documentation to reflect the full feature set.

### 2a: Update README.md

Rewrite README.md to cover:
- Full feature list (all phases)
- Getting started (clone, open, done)
- Feature highlights with screenshots description
- Technology stack
- Testing instructions (original + extended)
- Contributing link
- License

### 2b: Update ARCHITECTURE.md

Add sections for:
- Engagement system (streak, XP, milestones)
- Review/spaced repetition system
- Learning paths
- localStorage schema (all keys documented)
- Event flow (problem answered → XP → milestone check → streak → review enrollment)
- Custom problem system

### 2c: Update CONTRIBUTING.md

Add sections for:
- How to add engagement features
- How to add learning paths
- How to add tutor knowledge base entries
- How to add NLP patterns
- Testing extended features

### 2d: Update PHASES.md

Mark all phases through 21 with status. Add summary of what each phase delivered.

### 2e: Create CHANGELOG.md

Create a changelog documenting all phases:

```markdown
# Changelog

## Phase 1 — Core Expansion
- Multi-unit architecture (11 units)
- 65 practice problems
- Placeholder visualizers
- Test suite (185 tests)

## Phase 2 — Visualizer Upgrades
- 10 full interactive canvas visualizers
- Math bug fixes

... (through Phase 21)
```

---

## Task 3: Performance Benchmarks

Add performance measurement to ensure the app stays fast as it grows.

### 3a: Performance Test Script

Create `tests/benchmark.js`:

```javascript
// Measure:
// 1. Script parse time (require stats_hub.js)
// 2. allProbs total count
// 3. UNIT_META unit count
// 4. Memory footprint of data structures
// 5. Time to compute getProgressSummary() for all units
// 6. Time to run analyzeWeakSpots()
// 7. Total localStorage keys count
// 8. Warn if any single data structure exceeds size threshold

const startTime=Date.now();
// ... require and measure ...
const loadTime=Date.now()-startTime;

console.log('--- Performance Benchmarks ---');
console.log('Script load time: '+loadTime+'ms');
console.log('Total problems: '+totalProbs);
console.log('Total units: '+unitCount);
// ... etc

// Thresholds (warn, don't fail):
if(loadTime>1000)console.warn('WARN: Script load time exceeds 1000ms');
if(totalProbs>500)console.warn('WARN: Problem count exceeds 500');
```

### 3b: Memory Profile

Report estimated localStorage usage:

```javascript
function estimateStorageUsage(){
  let total=0;
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    total+=key.length+localStorage.getItem(key).length;
  }
  return total; // characters (roughly bytes for ASCII)
}
```

### 3c: Bundle Size Check

```javascript
const fs=require('fs');
const jsSize=fs.statSync('scripts/stats_hub.js').size;
const cssSize=fs.statSync('styles/stats_hub.css').size;
const htmlSize=fs.statSync('stats_hub.html').size;
console.log('JS: '+(jsSize/1024).toFixed(1)+'KB');
console.log('CSS: '+(cssSize/1024).toFixed(1)+'KB');
console.log('HTML: '+(htmlSize/1024).toFixed(1)+'KB');
console.log('Total: '+((jsSize+cssSize+htmlSize)/1024).toFixed(1)+'KB');
if(jsSize>200*1024)console.warn('WARN: JS exceeds 200KB');
```

---

## Constraints

- NEVER modify existing files in `tests/` (run_all.js, validate_*.js)
- New test files are ADDITIONS only
- Use `tests/run_extended.js` as the new comprehensive runner
- Documentation must be accurate to actual implemented features
- Benchmarks warn but don't fail — they're informational
- All new test files must run in Node.js without DOM

## Verification

```bash
node tests/run_all.js          # Original 185 tests still pass
node tests/run_extended.js     # All tests including new ones pass
node tests/benchmark.js        # Performance numbers printed
```

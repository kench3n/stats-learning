# Stats Learning Hub — Phase Definitions

## Phase 1: Core Expansion (COMPLETE)

### Status: DONE — 185/185 tests passing

### IN SCOPE
1. Multi-unit architecture: allProbs keyed by unit, UNIT_META, setUnit(), allViz
2. 50 new problems (5 per unit, Units 2-11) with correct ID ranges
3. Unit selector dropdowns on Practice and Visualizer pages
4. Per-unit localStorage persistence (sh-practice-{unit})
5. 10 placeholder visualizer draw functions (drawZscore through drawRegOut)
6. Helper utilities: gNum, fmtPct, clamp, comb
7. vizTemplate() for dynamic visualizer HTML generation
8. index.html redirect and .gitignore
9. Sacred test suite: validate_html, validate_problems, validate_math, validate_visualizers

### OUT OF SCOPE
- Full-featured visualizers (placeholder only)
- More than 5 problems per unit (Units 2-11)
- Backend/server components
- User authentication
- Frameworks or build tools

---

## Phase 2: Visualizer Upgrades & Bug Fixes (CURRENT)

### Status: IN PROGRESS

### IN SCOPE
1. Upgrade 10 placeholder visualizers to full interactive versions with proper math
2. Fix incorrect p-value formulas in drawChiSq and drawRegOut
3. Fix drawPValue visual/numeric mismatch for negative z-scores
4. Fix drawZscore coordinate mapping between curve and marker
5. Make drawScatter point correlation match displayed r value
6. Make drawCoverage intervals deterministic per slider value
7. Update vizTemplate() to generate richer per-unit control layouts
8. Add CSS for new visualizer controls (button groups, preset buttons)
9. Fix empty array guard in mean()
10. Fix sigma=0 guard in normalPDF/normalCDF
11. Update README and home page cards to reflect Phase 1 counts
12. Fix CLAUDE.md to reference correct paths and test commands

### OUT OF SCOPE
- New problems beyond existing 65
- New units beyond 11
- New test files (existing 185 tests must still pass)
- Modifying any file in tests/
- Backend, auth, frameworks, npm
- Mobile app or PWA features
- Data import/export
- User accounts or cloud sync

---

## Phase 3: Content Expansion (PLANNED)

### Status: NOT STARTED

### IN SCOPE
1. Expand to 10 problems per unit (Units 2-11): 50 additional problems
2. New test expectations for expanded problem counts
3. More diverse problem types within each unit
4. Data display (non-null `data` field) for problems that benefit from it

### OUT OF SCOPE
- New units beyond 11
- UI redesign
- Backend features
- Changes to Phase 1/2 visualizers

---

## Phase 4: Accessibility & Polish (PLANNED)

### Status: NOT STARTED

### IN SCOPE
1. Keyboard accessibility: home cards, roadmap checkboxes, choice buttons
2. Focus-visible styles on all interactive elements
3. ARIA labels on canvases, range inputs, progress bars
4. Semantic HTML: heading hierarchy, landmark roles, label associations
5. Skip navigation link
6. Color contrast fixes (--muted to meet WCAG AA 4.5:1)
7. Content Security Policy meta tag
8. Switch innerHTML to textContent/DOM APIs where possible

### OUT OF SCOPE
- Feature additions
- Problem content changes
- Visualizer logic changes
- Backend or auth

---

## Phase 5: Product Readiness (PLANNED)

### Status: NOT STARTED

### IN SCOPE
1. Performance optimization (lazy loading visualizers)
2. Offline support (service worker, self-hosted fonts)
3. Print-friendly styles for practice problems
4. Contributing guide and developer documentation
5. CI pipeline for test automation

### OUT OF SCOPE
- Backend services
- User accounts
- Monetization
- Mobile app

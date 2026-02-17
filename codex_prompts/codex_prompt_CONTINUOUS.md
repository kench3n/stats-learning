# Continuous Improvement Loop — Stats Learning Hub

This prompt is designed to run indefinitely. After completing all tasks, invent new ones and keep improving.

## WORKFLOW (every iteration)
1. Run: `git log --oneline -30` to see what's already done
2. Find the FIRST task below not yet committed (check commit messages)
3. Implement it fully
4. Run `node tests/run_all.js` AND `node tests/run_extended.js` — both must pass
5. Fix any failures in source only (never tests/)
6. Commit: `git add -A && git commit -m "feat/fix: Task NAME — description" && git push`
7. Move to next task on next iteration
8. If ALL tasks are done: invent new improvements, append them to this file, implement them

---

## TASK BACKLOG

### TASK: unit1-more-problems
Add 5 more problems to Unit 1 (Descriptive Statistics) bringing it to 20 total.
- IDs in range 16-99 (currently 11-15 exist)
- Mix of easy/medium/hard, MC and FR
- Topics: quartiles, outlier detection (IQR method), percentile rank, five-number summary, coefficient of variation
- Each must have: id, unit:1, diff, topic, q, data, type, ans, tol or ch, ex, hint
- Run tests after — validate_problems expects >=15, adding more is fine

### TASK: unit12-more-problems
Add 5 more problems to Unit 12 (ANOVA) bringing it to 15 total.
- IDs in range 1100-1199
- Topics: F-statistic interpretation, between/within group variance, post-hoc tests, ANOVA assumptions, one-way vs two-way
- Mix difficulties

### TASK: unit13-more-problems
Add 5 more problems to Unit 13 (Nonparametric Tests) bringing it to 15 total.
- IDs in range 1200-1299
- Topics: Mann-Whitney U, Kruskal-Wallis, sign test, Wilcoxon signed-rank, when to use nonparametric

### TASK: unit14-more-problems
Add 5 more problems to Unit 14 (Bayesian Statistics) bringing it to 15 total.
- IDs in range 1300-1399
- Topics: prior vs posterior, likelihood, credible intervals, conjugate priors, Bayesian updating

### TASK: keyboard-shortcut-review
Add keyboard shortcut `R` to jump directly to the Review page (spaced repetition).
- In the keydown handler, add `else if(e.key==='R'||e.key==='r'){goPage('review');}`
- Must not conflict with existing shortcuts (1-5 navigate, J/K scroll, T timer, D theme, ? help)
- Update the shortcuts overlay modal to show the R shortcut

### TASK: keyboard-shortcut-escape
Add `Escape` key to close any open panel (tutor panel, shortcuts overlay, session modal, focus mode).
- In keydown handler: if Escape, close tutorPanel if visible, close shortcutsOverlay if visible, close sessionOverlay if visible, exit focus mode if active
- Guard with typeof document checks

### TASK: practice-progress-persistence
The progress panel on the Practice page shows per-unit accuracy. Currently it collapses/expands but doesn't remember its state across sessions.
- Save the collapsed/expanded state to localStorage key `sh-progress-collapsed`
- On load, read that key and apply the correct class
- Use `getItem`/`setItem` with typeof localStorage guards

### TASK: dark-mode-meta-theme
Add `<meta name="theme-color">` to the HTML head that updates dynamically when the theme toggles.
- In `stats_hub.html` add: `<meta name="theme-color" id="themeColor" content="#0a0a0f">`
- In `loadTheme()` in JS: after setting data-theme, also update the meta tag content
  - Dark: `#0a0a0f`, Light: `#f5f5f7`
- Guard with typeof document

### TASK: nlp-history
Add a simple query history to the NLP input bar.
- Store last 5 NLP queries in localStorage key `sh-nlp-history`
- Show them as clickable chips below the input when it's focused (or always)
- Clicking a chip populates the input and runs the query
- Style with `.nlp-history`, `.nlp-history-chip` classes in CSS

### TASK: unit-completion-badge
When a user achieves >=80% accuracy on all problems in a unit, show a special "Unit Complete" badge/indicator on the progress grid cell.
- In `buildProgressPanel()`, check if accuracy >= 80 for a unit
- If so, add a ⭐ or ✓ icon inside the `.progress-cell` div
- Add CSS for `.progress-cell-perfect` with a gold border
- No test changes needed

### TASK: roadmap-progress-export
Add an "Export Roadmap" button to the Roadmap page that downloads the user's checkbox progress as a JSON file.
- Button text: "Export Progress"
- Downloads `roadmap-progress.json` with all checked topic IDs and timestamp
- Reuse the existing download pattern from the custom problems export
- Place the button in the roadmap section-header area

### TASK: visualizer-share-link
Add a "Share" button on the Visualizer page that copies the current URL (with hash) to clipboard.
- Button: "📋 Copy Link" placed near the viz-practice-link area
- Uses `navigator.clipboard.writeText(window.location.href)` with typeof guards
- Shows a brief toast "Link copied!" on success
- Add minimal CSS for `.viz-share-btn`

### TASK: problem-of-the-day
Add a "Problem of the Day" widget on the Home page.
- Below the daily digest, above home-cards
- Select a deterministic daily problem: `allProbs[1][ todayStr().split('').reduce((a,c)=>a+c.charCodeAt(0),0) % allProbs[1].length ]`
- Show the problem question and a "Solve It" button that navigates to Practice and scrolls to that problem
- Style with `.pod-widget`, `.pod-question`, `.pod-solve-btn` in CSS

### TASK: study-streak-calendar-tooltip
On the Activity Heatmap in Achievements, hovering a cell should show a tooltip with the date and number of problems solved that day.
- Store activity data as `sh-activity` in localStorage: `{[dateStr]: count}`
- Increment count each time a problem is answered correctly
- In `buildHeatmap()`, add `title` attribute to each `.heatmap-cell` with the date and count
- If count > 0, show `YYYY-MM-DD: N problems solved`

### TASK: accessibility-live-region
Add an ARIA live region for dynamic announcements (toast messages, XP popups, feedback).
- In HTML: `<div id="a11yAnnounce" aria-live="polite" aria-atomic="true" class="sr-only"></div>`
- Add CSS: `.sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}`
- In `showToast()`, also set `#a11yAnnounce` textContent to the message
- In `showFB()`, announce "Correct!" or "Incorrect. Correct answer: X"
- Guard with typeof document

### TASK: formula-search
Add a search/filter box above the formula reference panel so users can quickly find a formula by name.
- Input: `<input id="formulaSearch" placeholder="Search formulas..." />`
- On input, filter `.formula-row` elements to only show rows where `.formula-name` text matches
- Case-insensitive match
- Place above the `.formula-toggle` button
- Add minimal CSS for `#formulaSearch`

### TASK: review-session-stats-chart
After a review session completes (session summary modal), show a small bar chart of accuracy by unit using Canvas.
- In the session summary modal, add a `<canvas id="reviewChart" width="300" height="120"></canvas>`
- Draw a simple bar chart of correct/total per unit attempted in the session
- Use existing canvas drawing style (var(--cyan) for bars, var(--bg3) for background)
- Only show if session had problems from >1 unit

### TASK: problem-report-button
Add a "Report Issue" button on each problem card.
- Small button next to the bookmark star: "⚠" with tooltip "Report an issue"
- On click, logs to localStorage `sh-reports`: array of `{id, unit, timestamp, reason:'user-report'}`
- Shows toast "Thanks for the report!"
- No actual network call needed — just local logging for now

### TASK: confetti-colors-theme
Make confetti colors match the current theme accent colors instead of random rainbow.
- In `spawnConfetti()`, use colors from: `['#06b6d4','#f59e0b','#f472b6','#34d399','#a78bfa','#fb923c']`
- This makes confetti feel more on-brand
- Keep the reduced-motion guard already in place

### TASK: mobile-swipe-navigation
Add swipe gesture support for mobile navigation between pages.
- Track `touchstart` and `touchend` events on the body
- If horizontal swipe > 50px left: go to next page in order [home,roadmap,visualizer,practice,review,achievements,flashcards,create]
- If horizontal swipe > 50px right: go to previous page
- Guard with typeof window and typeof document
- Don't interfere with vertical scrolling (check if dy < dx)

### TASK: export-full-snapshot-button
Add an "Export All Data" button to the Home page (below hero-stats) and Practice page (in progress-actions).
- Exports all localStorage keys prefixed with `sh-` as a single JSON file
- Filename: `stats-hub-export-YYYY-MM-DD.json`
- Reuse pattern from existing export if it exists, or create new `exportAllData()` function

### TASK: print-certificate-from-achievements
The certificate button on the Achievements page currently only generates for active learning path.
Also generate a general "Course Completion" certificate when overall accuracy across all units >= 70%.
- In `buildAchievementsPage()`, check overall accuracy
- If >= 70%, show the cert button with "Generate Certificate" label
- Certificate should show: student name input (prompt), date, overall accuracy, units completed

---

## RULES (ALWAYS)
- NEVER modify tests/
- Guard document/window/localStorage/navigator with typeof checks
- Run both test suites before every commit (185/185 and 260/260)
- One task per git commit
- Use Python for any file writes with regex or special characters
- After all tasks done: invent 10 more, append here, keep going

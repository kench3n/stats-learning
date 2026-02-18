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


### TASK: keyboard-shortcut-help-panel
Add a persistent floating help panel showing all keyboard shortcuts, accessible via the ? key.
- When ? is pressed, toggle a modal/panel showing ALL keyboard shortcuts in a table
- Include: 1-5 (units), J/K (scroll), T (timer), D (theme), R (review), Escape (close)
- Style as `.shortcuts-quick-ref` with a styled table: key column | action column
- Guard with typeof document
- Update the existing shortcuts overlay to include the new additions from previous tasks

### TASK: pomodoro-session-history
Track Pomodoro session history in localStorage key `sh-pomodoro-log`.
- On each timer completion (25-min focus), push `{date: todayStr(), minutes: 25}` to the log
- Show last 5 sessions in a `.pomodoro-history` div below the timer controls
- Format: "Today: 2 sessions (50 min)" — group by date
- Guard with typeof localStorage

### TASK: search-bar-suggestions
The search bar in the Practice page currently filters problems live. Add 4 shortcut suggestion chips below it.
- Chips: "Hypothesis Test", "Confidence Interval", "Normal Distribution", "Regression"
- Clicking a chip sets the search bar value to that term and triggers filtering
- Style as `.search-chip` buttons with the existing `.filter-chip` look
- Use the existing search input with id `searchInput`

### TASK: unit-overview-modal
Clicking the unit selector dropdown label should show a quick modal with a summary of that unit.
- Add a `.unit-info-btn` (i) button next to the unit selector
- On click, show a small modal/overlay with: unit name, topic list, problem count, avg difficulty
- Style with `.unit-info-modal`, `.unit-info-topic-list`
- Pull data from UNIT_META and allProbs
- Guard with typeof document

### TASK: flashcard-keyboard-shortcuts
Add keyboard shortcuts for the Flashcard page when it is active.
- Space: flip card (toggleFlashcard / flipCard equivalent)
- ArrowRight: mark as "Know" (the green button click)
- ArrowLeft: mark as "Unsure" (the red/pink button click)
- Only active when page-flashcards is the active page
- Guard with typeof document, check activePage === 'flashcards'

### TASK: print-problem-set
Add a "Print Problems" button on the Practice page that opens a print-friendly version.
- Button in progress-actions area: "Print Set"
- Opens new window with all active problems (filtered/shown ones) in a print-friendly HTML layout
- No answer key — just the problems, formatted in LaTeX-like style
- Uses `window.open` with `window.print()` auto-triggered
- Guard with typeof window

### TASK: difficulty-distribution-chart
In the Practice page progress panel, add a small bar chart showing difficulty distribution for the current unit.
- After `buildProgressPanel()`, add a canvas showing % easy / medium / hard for active unit
- Canvas id: `diffChart`, width 200, height 60
- Bars colored: green (easy), amber (medium), red (hard)
- Label with percentages
- Guard with typeof document

### TASK: review-due-date-display
On the Flashcard/Review page, show the next due date for each card in the review deck.
- In `updateReviewBadge()`, for the top 3 due cards, show the problem text snippet and due date
- Render in `#reviewNextUp` div (add to HTML if not present)
- Format: "Problem #42 — Due today" or "Due in 2 days"
- Guard with typeof document

### TASK: notes-export
Add an "Export Notes" button to the Practice page that exports all saved notes as a text file.
- In progress-actions: "Export Notes" button
- Gathers all notes from `sh-notes` localStorage key
- Formats as plain text: "Problem #ID (Unit N): note text"
- Downloads as `stats-hub-notes-YYYY-MM-DD.txt`
- Guard with typeof Blob, typeof document

### TASK: problem-timer
Add a per-problem timer that shows how long the user has spent on the current problem.
- Each problem card gets a small timer display: "⏱ 0:00"
- Timer starts when the card appears in viewport (IntersectionObserver or scroll event)
- Stops when the user submits an answer (ansMC / ansFR)
- Just display — no penalty/scoring based on time
- Element id: `timer-{probId}`, updated with setInterval every second
- Guard with typeof IntersectionObserver and typeof document


### TASK: practice-filter-persistence
Save the current unit filter, difficulty filter, and search query to localStorage so they persist across page reloads.
- Keys: `sh-filter-unit`, `sh-filter-diff`, `sh-filter-search`
- On `buildProblems()` load, restore these values to the select/input elements
- On change of unit select, difficulty filter, or search input, save to localStorage
- Guard with typeof localStorage

### TASK: problem-card-zoom
Add a "Focus" button on each problem card that expands it to full-width overlay for easier reading.
- Button: small 🔍 icon in pc-head (after prob-timer span)
- On click: clone or move the card into a full-screen overlay `.prob-focus-overlay`
- Pressing Escape or clicking the overlay backdrop closes it
- Style with `.prob-focus-overlay`, `.prob-focus-inner`, `.prob-focus-close`
- Guard with typeof document

### TASK: leaderboard-widget
Add a mock leaderboard widget on the Achievements page showing top 5 "players" with fake names and scores.
- Data hardcoded: 5 fake entries (e.g., "Alex — 4200 XP", "Taylor — 3800 XP", etc.)
- Highlight the user's row (computed from actual XP in localStorage `sh-xp`)
- Style with `.leaderboard-widget`, `.leaderboard-row`, `.leaderboard-rank`, `.leaderboard-you`
- Place after the milestone badges section

### TASK: problem-difficulty-vote
Let users upvote/downvote the difficulty rating of a problem (too easy / just right / too hard).
- Add 3 small buttons below the feedback box: "😅 Too Easy", "✓ Just Right", "😤 Too Hard"
- Save vote to `sh-diff-votes`: `{[probId]: 'easy'|'ok'|'hard'}`
- Show the user's current vote highlighted
- No aggregate stats needed — just personal feedback
- Style with `.diff-vote-row`, `.diff-vote-btn`, `.diff-vote-btn.active`

### TASK: home-quick-stats
On the Home page, add a "Quick Stats" summary row between the hero and daily digest.
- Show 4 stats: Total Problems Attempted, Total Correct, Overall Accuracy %, Current Streak (days)
- Pull from `sh-xp`, `sh-streak`, practice state across all units
- Style with `.quick-stats-row`, `.quick-stat-item`, `.quick-stat-value`, `.quick-stat-label`
- Update dynamically when page renders

### TASK: visualizer-history
Track which visualizers the user has visited in `sh-viz-history` (array of unit numbers, last 5 unique).
- Update on each `setUnit(n)` call when on the visualizer page
- Show a "Recently Viewed" row below the unit selector with clickable unit chips
- Style with `.viz-history-row`, `.viz-history-chip`
- Guard with typeof localStorage, typeof document

### TASK: keyboard-shortcut-numbers-extended
Extend the number key navigation so keys 6–8 navigate to Achievements (6), Flashcards (7), and Create (8).
- In keydown handler, add `else if(e.key==='6'){goPage('achievements');}` etc.
- Update the shortcuts overlay to show 6 → Achievements, 7 → Flashcards, 8 → Create
- No conflicts with existing shortcuts

### TASK: reading-time-estimate
Add an estimated reading/solve time for each problem based on difficulty.
- Easy: ~1 min, Medium: ~3 min, Hard: ~5 min
- Show as small text in pc-head: "~1 min" after the difficulty badge
- Element: `<span class="solve-time">~N min</span>` 
- Add minimal CSS: `.solve-time{font-size:11px;color:var(--muted);margin-left:4px;}`

### TASK: session-goal-setting
Let users set a session goal (number of problems to solve) before starting practice.
- In the progress-actions area, add a `<select id="sessionGoal">` with options: 5, 10, 15, 20 problems
- Track how many answered in current session vs goal
- Show a progress bar `<progress id="goalProgress">` filling as user answers
- When goal reached, show toast "Session goal reached! Great work."
- Save goal to `sh-session-goal` localStorage

### TASK: problem-tags-filter
Add tag-based filtering for problems in addition to difficulty and search.
- Extract unique topics from all problems in current unit
- Render as filter chips above the problem list: `.tag-filter-chip`
- Clicking a chip filters problems to only show that topic
- Multiple chips can be active at once (multi-select)
- Deactivate by clicking again; "All" chip clears all topic filters
- Save active tags to `sh-active-tags` localStorage


### TASK: problem-card-collapse
Add a collapse/expand toggle on each problem card's header. When collapsed, only the title row is visible.
- Add a `<button class="card-collapse-btn">▾</button>` to the end of `.pc-head`
- Clicking toggles `.pc-collapsed` class on the parent `.pc` element
- In CSS: `.pc.pc-collapsed .pc-body, .pc.pc-collapsed .choices, .pc.pc-collapsed .fr-row, .pc.pc-collapsed .hint-row, .pc.pc-collapsed .fb, .pc.pc-collapsed .note-row, .pc.pc-collapsed .diff-vote-row { display:none; }`
- Persist collapsed IDs per unit to `sh-collapsed-{unit}` in localStorage
- Guard with typeof document

### TASK: copy-problem-link
Add a "Copy Link" button on each problem card that copies a deep link to that problem.
- Link format: `window.location.origin + window.location.pathname + '#/practice?pid=' + probId`
- Button: small 🔗 icon in pc-head (after card-collapse-btn)
- Show toast: "Link copied!" on success
- Guard with typeof navigator, typeof window

### TASK: problem-stats-tooltip
When hovering a problem card's difficulty badge, show a tooltip with community-wide stats.
- Fake "community" stats: e.g., "83% answered correctly (based on 142 attempts)"
- Use deterministic fake numbers seeded from probId: `attempts = 50 + (probId % 150)`, `rate = 40 + (probId % 50)`
- Add a `title` attribute to each `.pc-diff` span with this text
- Also update `.pc-diff` CSS to have `cursor:help`

### TASK: formula-favorites
Let users mark formula rows as favorites.
- Add a `<button class="formula-fav-btn">☆</button>` to each `.formula-row`
- Clicking toggles `★` and saves formula name to `sh-formula-favs` in localStorage
- Add a "Favorites" filter button above formulas that, when active, shows only favorited rows
- Style with `.formula-fav-btn`, `.formula-fav-btn.active`

### TASK: practice-timer-summary
After the practice session timer completes (Pomodoro), show a summary of what was accomplished.
- In `pomoComplete()`, also read `sessionData.problemsAnswered` and `sessionData.correct`
- Append to the pomoComplete toast: e.g., "You solved 7 problems (5 correct) in 25 min!"
- No new UI needed — just enrich the existing toast message

### TASK: breadcrumb-navigation
Add a breadcrumb/path indicator below the navigation tabs showing the current page and unit.
- HTML: `<div class="breadcrumb" id="breadcrumb">Home</div>` between nav and content
- Update in `goPage(id)`: set breadcrumb text to page name
- For practice page: also show current unit e.g. "Practice > Unit 1: Descriptive Statistics"
- Style with `.breadcrumb`, `.breadcrumb-sep`

### TASK: problem-comparison-mode
Add a "Compare Mode" toggle in the Practice page that shows two problems side by side.
- Button "Compare Mode" in progress-actions area
- Toggles `.compare-mode` class on `#probContainer`
- In CSS: `.compare-mode .pc { display:inline-block; width:calc(50% - 10px); vertical-align:top; margin:5px; }`
- No JS problem logic changes needed — just layout toggle

### TASK: copy-formula-button
Add a "Copy" button on each formula row to copy the formula text to clipboard.
- Button: `<button class="formula-copy-btn" title="Copy formula">⎘</button>` after each formula-eq span
- On click: copy `.formula-eq` text to clipboard, show toast "Formula copied!"
- Guard with typeof navigator, typeof document

### TASK: note-word-count
Show live word count below the note input on each problem card.
- When the note input changes, update a `<span class="note-wc">0 words</span>` below it
- On input: count words in the note value (split by whitespace), display "N word(s)"
- CSS: `.note-wc { font-size:10px; color:var(--muted); padding:0 12px 4px; }`
- Guard with typeof document

### TASK: unit-progress-ring
On the Home page quick stats row, add a unit completion progress ring (SVG) showing % of units with >=1 answer.
- Add a small SVG circle (40x40) to the quick-stats-row as a 5th stat
- Calculate: units_started / MAX_UNIT * 100
- Use an SVG stroke-dasharray / stroke-dashoffset technique
- Label: "Units Started" below the ring


### TASK: problem-count-badge
Add a small badge on the Practice nav tab showing the number of unanswered problems in the current unit.
- Count unanswered: `activeProbs.length - Object.keys(answered).length`
- Show as a small `<span class="nav-badge" id="practiceNavBadge">N</span>` inside the Practice tab button
- Update when `buildProblems()` is called and when a problem is answered
- Style with `.nav-badge{...}` — small red/cyan number badge
- Guard with typeof document

### TASK: streak-freeze
Add a "Streak Freeze" item to the Achievements page. If the user has >= 100 XP, they can activate one.
- Show a card: "Streak Freeze — Use 100 XP to protect your streak for 1 day"
- Button "Activate Freeze" — deducts 100 XP from `sh-xp`, saves `sh-streak-freeze` = todayStr()
- On next streak calculation, if today is missed but `sh-streak-freeze` matches yesterday, don't break streak
- Show "Freeze Active" text if freeze is for today
- Guard with typeof localStorage

### TASK: dark-mode-reading-palette
When dark mode is active, add a "Reading Palette" button that further dims backgrounds for better reading.
- Toggle button near the theme toggle: "📖 Reading Mode"
- Toggles `.reading-mode` class on `document.body`
- In CSS: `.reading-mode { --bg: #050508; --bg2: #0a0a0f; --fg: #d0d0d8; }`
- Store reading mode state in `sh-reading-mode` localStorage
- Guard with typeof document, typeof localStorage

### TASK: jump-to-problem
Add a "Jump to Problem" input in the Practice page header area.
- Small `<input type="number" id="jumpInput" placeholder="Go to #...">` with a button "Go"
- On submit: find the problem with matching ID in `activeProbs` or across all units, scroll it into view
- If not in current unit, switch to that unit first
- Style with `.jump-bar`, `.jump-input`, `.jump-btn`
- Guard with typeof document

### TASK: problems-answered-today
On the Home page quick stats row, add a 6th stat: "Answered Today" showing problems answered today.
- Use `sh-activity` localStorage key (already tracks correct answers per day)
- Show today's count (from `todayStr()`)
- Add a `.quick-stat-item` with id `qsToday`

### TASK: formula-panel-resize
Make the formula panel resizable using a drag handle.
- Add a `<div class="formula-resize-handle" id="formulaResizeHandle"></div>` at the bottom of `.formula-content`
- On mousedown, listen for mousemove to adjust `.formula-content` max-height
- Min height: 100px, max height: 600px
- Save current height to `sh-formula-height` localStorage
- Restore on load in `buildFormulas()`
- Guard with typeof document, typeof window

### TASK: home-recent-activity
Add a "Recent Activity" section on the Home page below the quick stats row.
- Show last 5 problems answered (from practice state across all units)
- Display: problem id, unit, correct/wrong, time (use `sh-activity` date)
- Track which problem IDs were answered today by storing in `sh-today-activity` = `[{id, unit, ok}]`
- Update `sh-today-activity` in `ansMC` and `ansFR`
- Render in `#recentActivity` div on Home page

### TASK: focus-mode-improvements
When focus mode is active (if it exists), hide the breadcrumb, quick stats row, and nav badges.
- Check if focus mode exists by looking for `.focus-mode` class on body or a `focusMode` variable
- If focus mode is active: add `.focus-mode-hidden` CSS class to `#breadcrumb` and `#quickStatsRow`
- In CSS: `.focus-mode-hidden { display:none!important; }`
- When focus mode exits, remove the class

### TASK: problem-card-animation
Add a subtle entrance animation when problem cards are rendered.
- In CSS: `@keyframes cardIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`
- Apply to `.pc { animation: cardIn 0.2s ease; }`
- Apply `animation-delay` based on card index: `${p_idx * 0.03}s`
- Update `buildProblems` to pass index to the delay style attribute
- Guard with `@media (prefers-reduced-motion: reduce)` in CSS

### TASK: answer-distribution-chart
After a problem is answered correctly (MC type), show a bar in the feedback indicating how many users chose each option.
- Generate fake distributions seeded by `probId`: e.g., `[ans_pct, rand1, rand2, rand3]`
- Show a mini `<div class="ans-dist">` with 4 small bars after the feedback text
- Total should sum to 100%
- The correct answer bar is cyan, others are muted
- Style with `.ans-dist`, `.ans-dist-bar`, `.ans-dist-label`


### TASK: practice-bookmark-export
Add an "Export Bookmarks" button in the progress-actions area that downloads all bookmarked problem IDs as JSON.
- Read from `sh-bookmarks` localStorage
- Export as JSON: `{bookmarks: [id1, id2, ...], exportDate: "YYYY-MM-DD"}`
- Filename: `stats-hub-bookmarks-YYYY-MM-DD.json`
- Button label: "Export Bookmarks"

### TASK: formula-panel-unit-name
Show the current unit name as a label above the formula panel.
- Add `<div class="formula-unit-label" id="formulaUnitLabel"></div>` above `#formulaContent`
- Update it in `buildFormulas(unit)` with the unit name from UNIT_META
- CSS: `.formula-unit-label { font-size:11px; color:var(--muted); ... }`

### TASK: xp-milestone-notifications
Show a special toast when the user crosses XP milestones (100, 250, 500, 1000, 2500, 5000 XP).
- In `awardXP()`, after updating total, check if old total and new total straddle a milestone
- Show toast: "🎯 XP Milestone! You've reached 500 XP!"
- Guard with existing xp logic, no new localStorage keys needed

### TASK: keyboard-shortcut-focus
Add keyboard shortcut `F` to toggle focus mode.
- In keydown handler: `else if(e.key==='f'||e.key==='F'){if(typeof toggleFocusMode!=='undefined')toggleFocusMode();}`
- Update shortcuts overlay to show `F → Focus Mode`
- Guard: only when practice page is active

### TASK: problem-hint-auto-expand
After a problem has been answered incorrectly 2 times (same session), automatically show the hint.
- Track wrong attempts per problem in a `wrongAttempts = {}` object
- In `ansMC`/`ansFR`: if `!ok`, increment `wrongAttempts[id]`; if >= 2, call `showHint(id)` automatically
- Show toast "Hint revealed after 2 incorrect attempts."
- Guard with typeof document

### TASK: practice-time-spent
Show total time spent in the current practice session in the score bar area.
- Track session start time: `practiceSessionStart = Date.now()` in `buildProblems()`
- Show as `<span class="session-time" id="sessionTime">0:00</span>` near the score text
- Update with `setInterval` every second while practice page is active
- Guard with typeof setInterval, typeof document

### TASK: roadmap-topic-count-badge
Show a count badge on the Roadmap nav tab with the number of unchecked topics.
- Count from `sh-topics` localStorage vs total topics in ROADMAP_DATA
- Show as `<span class="nav-badge" id="roadmapNavBadge">N</span>` on the Roadmap tab button
- Update when the roadmap page is built and when a topic is toggled

### TASK: visualizer-screenshot
Add a "Save as PNG" button below each visualizer canvas.
- Button: "💾 Save PNG" placed near the viz-share-btn
- Uses `canvas.toDataURL('image/png')` to create a downloadable link
- Filename: `stats-hub-viz-unit{N}-YYYY-MM-DD.png`
- Gets the active canvas from the visualizer tab
- Guard with typeof document, typeof Blob

### TASK: practice-sort-options
Add a sort dropdown for problem cards in the Practice page.
- `<select id="problemSort">` with options: "Default", "Difficulty (Easy→Hard)", "Difficulty (Hard→Easy)", "ID (Asc)", "ID (Desc)"
- On change, reorder `.pc` elements in `#probContainer` according to selection
- Don't modify `activeProbs` array — just reorder DOM nodes
- Save sort preference to `sh-problem-sort` localStorage

### TASK: home-motivational-quote
Show a random motivational statistics/learning quote on the Home page hero.
- Array of 8 quotes about learning, statistics, or persistence
- Select a deterministic daily quote seeded by todayStr() hash
- Display as `<blockquote class="motivational-quote">` in the hero section
- Style: italic, muted color, smaller font

### TASK: keyboard-shortcut-cheatsheet-download
Add a "Download Cheatsheet" button to the shortcuts overlay that exports all keyboard shortcuts as a plain text file.
- Button: `<button class="shortcut-dl-btn" onclick="downloadShortcutCheatsheet()">⬇ Download Cheatsheet</button>` inside `.shortcut-overlay`
- `downloadShortcutCheatsheet()` builds a string of all shortcuts (from hardcoded list), creates a Blob, downloads as `stats-hub-shortcuts.txt`
- Guard with `typeof Blob`, `typeof document`

### TASK: problem-card-swipe-gesture
Add left/right swipe gesture support on touch devices for MC problem answer selection.
- Add `touchstart` / `touchend` listeners on `.pc` elements in `buildProblems()`
- Swipe right → select first MC answer; swipe left → select last MC answer
- Only activate if `Math.abs(deltaX) > 60` and `Math.abs(deltaY) < 40`
- Guard with `typeof document`, only add if MC problem

### TASK: practice-page-progress-summary
Add a sticky progress summary bar that appears at the top of the screen when scrolling down in practice mode.
- Show: `N correct / M answered` and a mini progress bar
- Only show when the main score-bar is scrolled out of view (use IntersectionObserver on score-bar)
- HTML: `<div class="sticky-progress" id="stickyProgress" style="display:none;">…</div>` — insert before nav
- CSS: `position:fixed; top:0; left:0; right:0; z-index:200`
- Update in `ansMC`, `ansFR`, `updateScore`

### TASK: formula-search-highlight
Highlight the matching search term in formula names and equations when searching.
- In `filterFormulas(val)`, after filtering, wrap matches with `<mark>` tags
- Case-insensitive; only highlight when `val.length > 0`
- CSS: `mark { background: var(--amber); color: var(--bg); border-radius: 2px; padding: 0 2px; }`
- Guard with typeof document

### TASK: unit-completion-confetti
When a user answers ALL problems in a unit correctly for the first time, show a confetti burst.
- Detect in `ansMC` / `ansFR`: if all `answered[id]` === 'correct' for all activeProbs
- `showConfetti()`: create 40 small colored divs, animate them falling from top using CSS animation `@keyframes confettiFall`
- Auto-remove after 2 seconds
- Guard with typeof document; one-time per unit (track in `sh-confetti-done-{unit}`)

### TASK: home-stats-animated-counters
Animate the quick stats numbers on the Home page when they first render.
- In `buildQuickStats()`, after setting textContent, use `requestAnimationFrame` to count up from 0
- Duration: 600ms, easing: linear
- Guard with `typeof requestAnimationFrame !== 'undefined'`
- Only animate when switching to home page (track with a flag `_statsAnimated`)

### TASK: problem-card-share-text
Add a "Share" button on each problem card that copies a formatted problem summary to clipboard.
- Button `<button class="prob-share-btn" onclick="shareProblem('${p.id}')">Share</button>` in pc-head
- `shareProblem(id)`: looks up problem, formats as text: `"Stats Hub Problem #N (Unit U): [question]"`, copies to clipboard
- Guard with `typeof navigator !== 'undefined' && typeof navigator.clipboard !== 'undefined'`
- CSS: `.prob-share-btn` — small, muted style like prob-link-btn

### TASK: visualizer-unit-info-panel
Add a collapsible "Unit Info" panel on the visualizer page showing key facts about the currently selected unit.
- HTML: `<div class="viz-unit-info" id="vizUnitInfo"><button onclick="toggleVizInfo()">ℹ Unit Info ▸</button><div class="viz-unit-info-body" id="vizUnitInfoBody" style="display:none;"></div></div>` — below the dataset selector
- `buildVizUnitInfo(unit)`: populate with unit name, XP available, # problems, topics covered
- CSS: `.viz-unit-info`, `.viz-unit-info-body`
- Call in `setUnit()` when on visualizer page

### TASK: practice-mastery-level-indicator
Show a mastery level (Novice → Apprentice → Practitioner → Expert → Master) next to the unit filter.
- Calculate from % correct in the unit: 0-20% Novice, 21-40% Apprentice, 41-60% Practitioner, 61-80% Expert, 81-100% Master
- HTML: `<span class="mastery-badge" id="masteryBadge">Novice</span>` — placed after sort dropdown
- `updateMasteryBadge(unit)`: reads practice state for unit, calculates %, sets text and data-level attribute for CSS coloring
- CSS: `.mastery-badge[data-level="master"]{ color:var(--amber); }` etc.
- Call in `buildProblems()`, `ansMC()`, `ansFR()`

### TASK: daily-challenge-streak
Add a "Daily Challenge Streak" counter — separate from the general learning streak.
- Track in `sh-dc-streak` = `{count, lastDate}` localStorage
- `updateDCStreak()`: if today !== lastDate, check if `sh-dc-done-{todayStr()}` exists; if so increment count else reset
- Show `<span class="dc-streak" id="dcStreak">🔥 0</span>` next to the daily challenge header
- Call `updateDCStreak()` in `buildDailyChallenge()` and in the daily challenge answer handler
- CSS: `.dc-streak { font-size:13px; color:var(--amber); }`

### TASK: problem-card-expand-all
Add "Expand All" / "Collapse All" toggle button above the problem list.
- HTML: `<button class="expand-all-btn" id="expandAllBtn" onclick="toggleExpandAll()">Expand All</button>` — placed in `.sort-bar`
- `toggleExpandAll()`: if any card is collapsed, expand all; else collapse all
- Update `sh-collapsed-{unit}` in localStorage
- Update button text accordingly
- Guard with typeof document

### TASK: quick-copy-formula
When clicking directly on a formula equation text (`.formula-eq`), flash a brief highlight and copy it to clipboard.
- Add `onclick="quickCopyFormula(this)"` to each `.formula-eq` span in `buildFormulas()`
- `quickCopyFormula(el)`: copies el's textContent, shows toast "Formula copied!", adds `.formula-eq-flash` class (removed after 600ms)
- CSS: `@keyframes formulaFlash { 0%{background:var(--amber);color:var(--bg)} 100%{background:none;} } .formula-eq{cursor:pointer;} .formula-eq-flash{animation:formulaFlash 0.6s ease;}`
- Guard with typeof navigator.clipboard

### TASK: unit-xp-progress-bar
Show per-unit XP progress in the unit selector dropdown.
- After each unit `<option>` in `<select id="vizUnitSelect">`, add XP % as aria-label
- More importantly: add a `<div class="unit-xp-bar-row">` above `#probContainer` in the practice page showing a colored bar of how much XP earned vs total available
- `buildUnitXPBar(unit)`: compute earned XP from practice state (correct * xp per diff), compare to total possible XP for that unit
- HTML: `<div class="unit-xp-bar-row" id="unitXPBarRow"><div class="unit-xp-bar-fill" id="unitXPBarFill"></div><span class="unit-xp-bar-text" id="unitXPBarText">0 XP</span></div>`
- Call in `buildProblems()` and after answering
- CSS: `.unit-xp-bar-row`, `.unit-xp-bar-fill`, `.unit-xp-bar-text`

### TASK: notes-word-count-goal
Extend the note word count to show a target (e.g., 50 words) and color the counter green when met.
- Add a `target` of 50 words for practice notes
- When word count >= target: counter turns green (`.note-wc.met`) and shows checkmark
- CSS: `.note-wc.met { color: var(--green); }` `.note-wc.met::after { content: ' ✓'; }`
- Update the oninput handler in buildProblems note section

### TASK: problem-auto-scroll
After answering a problem (MC or FR), automatically scroll to the next unanswered problem.
- In `ansMC()` and `ansFR()`, after the answer processing, find the next unanswered problem in `activeProbs`
- Scroll it into view smoothly: `el.scrollIntoView({ behavior: 'smooth', block: 'center' })`
- Only scroll if the next problem is below the current viewport
- Guard with `typeof document`, `typeof el.scrollIntoView`
- Add 300ms delay so feedback is visible first

### TASK: achievement-progress-bars
Add progress bars to each achievement card on the Achievements page showing current progress toward the achievement.
- Find achievement cards in HTML; add `<div class="ach-progress"><div class="ach-progress-fill" style="width:X%"></div></div>` inside each
- `buildAchievementProgress()`: read current XP, streak, problems answered; calculate % progress for each achievement (e.g., "100 XP" achievement = current_xp/100 * 100%)
- Call in `goPage('achievements')`
- CSS: `.ach-progress{height:3px; background:var(--border); border-radius:2px; margin-top:6px;} .ach-progress-fill{height:100%; background:var(--green); border-radius:2px;}`

### TASK: formula-panel-pin
Add a pin button to keep the formula panel always expanded (prevent auto-collapse).
- Button `<button class="formula-pin-btn" id="formulaPinBtn" onclick="toggleFormulaPin()" title="Pin formula panel open">📌</button>` in formula toggle row
- `toggleFormulaPin()`: saves `sh-formula-pinned` boolean to localStorage; when pinned, `toggleFormulas()` no longer collapses it
- CSS: `.formula-pin-btn.pinned { color: var(--amber); }`
- Guard with typeof localStorage

### TASK: roadmap-completion-percentage
Show overall roadmap completion percentage in the roadmap header.
- HTML: `<span class="roadmap-pct" id="roadmapPct">0%</span>` added to `.section-header` of roadmap page
- `updateRoadmapPct()`: reads `sh-topics`, counts checked vs total 120 topics, calculates percentage
- Call from `buildRoadmap()` and `toggleTopic()`
- CSS: `.roadmap-pct { font-size:13px; color:var(--cyan); font-family:'Space Mono',monospace; }`

### TASK: visualizer-fullscreen
Add a fullscreen button to expand the active visualizer canvas.
- HTML: `<button class="viz-fullscreen-btn" onclick="toggleVizFullscreen()" title="Fullscreen visualizer">⛶</button>` in `.viz-screenshot-row`
- `toggleVizFullscreen()`: calls `panel.requestFullscreen()` if available, else `panel.webkitRequestFullscreen()`
- Guard with `typeof document.fullscreenEnabled !== 'undefined'`
- CSS: `.viz-fullscreen-btn` — same style as `.viz-screenshot-btn`

### TASK: practice-keyboard-answer-mc
Allow pressing 1/2/3/4 keys to select MC answer choices when focused on a problem card.
- Track currently focused problem card ID in `focusedProblemId` variable
- Add `tabindex="0"` and `onfocus="focusedProblemId='${p.id}'"` to `.pc` already exists
- In the global keydown handler, check if on practice page: if key is '1','2','3','4' and `focusedProblemId` is set, call `ansMC(focusedProblemId, parseInt(key)-1)`
- Guard: only if target is not input/select/textarea and practice page is active

### TASK: problem-difficulty-distribution-insight
On the practice page, show a small text insight below the sort bar about the current unit's difficulty distribution.
- HTML: `<div class="diff-insight" id="diffInsight"></div>` placed after sort-bar
- `buildDiffInsight(unit)`: count easy/medium/hard problems, format as "15 problems: 5 easy • 7 medium • 3 hard"
- Call in `buildProblems()`
- CSS: `.diff-insight { font-size:11px; color:var(--muted); padding:2px 0 6px; }`

### TASK: formula-panel-search-clear
Add a clear (×) button to the formula search input that appears when there's text, clears it when clicked.
- Button: `<button class="formula-search-clear" id="formulaSearchClear" style="display:none;" onclick="clearFormulaSearch()">✕</button>` placed after `#formulaSearch` input
- `clearFormulaSearch()`: sets `#formulaSearch` value to '', calls `filterFormulas('')`, hides clear button
- Show/hide button via `oninput` on `#formulaSearch`: `document.getElementById('formulaSearchClear').style.display=this.value?'':'none'`
- CSS: `.formula-search-clear { ... }` — small, muted, positioned inline

### TASK: practice-problem-number-display
Show "Problem X of Y" counter in the practice score bar area that updates as problems are scrolled/visible.
- HTML: `<span class="prob-counter" id="probCounter">Problem 1 of 15</span>` added to score-bar
- Update in `buildProblems()` to show total count
- Use IntersectionObserver: when a problem card enters viewport, update counter with its position index
- Guard with `typeof IntersectionObserver !== 'undefined'`
- CSS: `.prob-counter` — small, monospace, muted

### TASK: theme-auto-switch
Add automatic dark/light theme switching based on system preference and time of day.
- In initialization: check `window.matchMedia('(prefers-color-scheme: dark)')` and `loadTheme()`
- `initThemeAutoSwitch()`: if no saved preference, apply system theme; listen for `prefers-color-scheme` changes
- Only override if user hasn't manually set a theme (`sh-theme` localStorage key)
- Guard with `typeof window !== 'undefined' && window.matchMedia`

### TASK: flashcard-progress-bar
Add a progress bar to the flashcard session showing how many cards remain.
- HTML: `<div class="fc-progress-bar"><div class="fc-progress-fill" id="fcProgressFill"></div></div><span class="fc-progress-text" id="fcProgressText">Card 0 of 0</span>` — above the flashcard
- `updateFCProgress()`: reads current deck size and current index, updates fill and text
- Call in flashcard navigation functions (flip, know, unsure, next)
- CSS: `.fc-progress-bar`, `.fc-progress-fill`, `.fc-progress-text`

### TASK: practice-difficulty-filter-counts
Show problem counts next to difficulty filter chips.
- Update `buildProblems()` to count easy/medium/hard/unanswered problems
- Modify the filter chip HTML to add count badges: "Easy (5)", "Medium (7)", "Hard (3)"
- Update counts dynamically — no, do it once in buildProblems and also when filtering
- `updateFilterCounts()`: reads activeProbs and answered, updates chip labels
- Guard with typeof document

### TASK: roadmap-level-progress-rings
Add a small SVG progress ring to each Level tab (L1/L2/L3) in the roadmap showing topics completed.
- Find `<div class="sub-tabs" id="roadmapTabs">` in HTML; add SVG ring span next to each tab
- `updateRoadmapLevelRings()`: for each level (l1/l2/l3), count checked topics vs total, draw mini ring
- Use `stroke-dasharray/dashoffset` technique on `<circle r="8" cx="10" cy="10">`
- Call from `buildRoadmap()` and `toggleTopic()`
- CSS: `.rm-level-ring { display:inline-block; vertical-align:middle; }`

### TASK: practice-keyboard-bookmark
Press B key when focused on a problem card to toggle its bookmark.
- Add `b` / `B` key handler in the global keydown listener
- When on practice page and `focusedProblemId !== null`, call `toggleBookmark(focusedProblemId)`
- Update shortcuts overlay to show B → Bookmark focused problem
- Guard: only if not in input/textarea/select

### TASK: viz-data-summary-table
Add a data summary table below the active visualizer showing key statistics in a tabular format.
- HTML: `<div class="viz-summary-table" id="vizSummaryTable"></div>` placed below `#vizHistoryRow`
- `buildVizSummaryTable()`: reads current data from visualizer, builds HTML table with Mean/Median/StdDev/Min/Max/N
- Call from `drawActiveVisualizer()` or update when data changes
- CSS: `.viz-summary-table`, `.viz-summary-table table`, `.viz-summary-table td`, `.viz-summary-table th`

### TASK: problem-export-unit
Add "Export Unit Problems" button that downloads all problems in the current unit as JSON.
- Button: `<button class="export-unit-btn" onclick="exportUnitProblems()">Export Problems</button>` in progress-actions
- `exportUnitProblems()`: serializes `allProbs[currentUnit]` as JSON, downloads as `unit-N-problems.json`
- Guard with `typeof Blob`, `typeof document`
- CSS: `.export-unit-btn` — small, muted, consistent with other action buttons

---

## RULES (ALWAYS)
- NEVER modify tests/
- Guard document/window/localStorage/navigator with typeof checks
- Run both test suites before every commit (185/185 and 260/260)
- One task per git commit
- Use Python for any file writes with regex or special characters
- After all tasks done: invent 10 more, append here, keep going

### TASK: practice-streak-heatmap
Add a GitHub-style activity heatmap on the home page showing practice activity over the last 12 weeks.
- HTML: `<div class="streak-heatmap" id="streakHeatmap"></div>` in home stats area after quick stats
- `buildStreakHeatmap()`: reads `sh-activity` localStorage array of ISO date strings, builds 12-week grid of day cells
- Each cell is a `<div class="hm-day" title="YYYY-MM-DD: N sessions">` colored by activity count (0=muted, 1=dim, 2=mid, 3+=bright)
- Call in `goPage('home')` block
- CSS: `.streak-heatmap`, `.hm-week`, `.hm-day`, `.hm-day[data-level="0/1/2/3"]`

### TASK: roadmap-topic-search
Add a search input to the roadmap page that highlights matching topics.
- HTML: `<input type="text" id="rmSearch" placeholder="Search topics..." oninput="searchRoadmapTopics(this.value)" class="rm-search-input">` above `#roadmapTabs`
- `searchRoadmapTopics(q)`: for each `.ti` element, show/hide based on `.tn` text match, wrap match in `<mark>` tag
- If query is empty, show all topics
- CSS: `.rm-search-input`, `.ti mark` for highlight color

### TASK: achievement-share-text
Add a Share button to each unlocked achievement badge that copies a formatted celebration text.
- In achievement badge render (where badges are shown), add `<button class="ach-share-btn" onclick="shareAchievement('${m.id}')">Share</button>` to unlocked badges only
- `shareAchievement(id)`: finds milestone by id, formats "I just earned '${name}' on Stats Learning Hub! ${icon} ${desc}", copies to clipboard via navigator.clipboard
- Guard with `typeof navigator !== 'undefined' && navigator.clipboard`
- CSS: `.ach-share-btn` — small, subtle button next to badge

### TASK: problem-steps-toggle
Show step-by-step solution in the feedback area with a toggle button.
- The `p.steps` array already exists on some problems (array of step strings)
- After answering, if `p.steps && p.steps.length > 0`, append toggle button to feedback box
- `<button class="steps-toggle-btn" onclick="toggleSteps('${p.id}')">Show Steps</button><ol class="steps-list" id="steps-${p.id}" style="display:none;">${steps html}</ol>`
- `toggleSteps(id)`: shows/hides the steps list, updates button text
- CSS: `.steps-list`, `.steps-toggle-btn`, `li` inside steps

### TASK: practice-topic-focus
Clicking the topic label on a problem card filters the problem list to show only that topic.
- Update `.pc-topic` span: add `onclick="filterByTopic('${p.topic}')"` and `style="cursor:pointer"` 
- `filterByTopic(topic)`: shows only `.pc` elements whose topic matches, updates a `#topicFocusLabel` indicator showing the active topic filter
- HTML: `<span class="topic-focus-label" id="topicFocusLabel" style="display:none;"></span>` with `<button onclick="clearTopicFocus()">✕ Clear</button>` in sort-bar
- `clearTopicFocus()`: restores all visible problems
- CSS: `.topic-focus-label`, `.pc-topic:hover`

### TASK: home-recent-units
Show recently visited practice units on the home page as quick-access chips.
- Save to `sh-recent-units` localStorage array (max 5 units) whenever `buildProblems()` is called
- HTML: `<div class="recent-units-row" id="recentUnitsRow"></div>` in home page stats section
- `buildRecentUnits()`: reads `sh-recent-units`, renders clickable chips with unit name, clicking goes to practice page and sets unit
- Call from `goPage('home')` and `buildProblems()`
- CSS: `.recent-units-row`, `.recent-unit-chip`

### TASK: daily-challenge-history
Show the last 5 daily challenges and whether they were completed on the home or DC section.
- `buildDCHistory()`: reads `sh-dc-done` localStorage object (date → boolean), shows last 5 dates
- HTML: `<div class="dc-history" id="dcHistory"></div>` below the daily challenge card
- Each row: date label + ✓/✗ indicator
- Call from `buildDailyChallenge()`
- CSS: `.dc-history`, `.dc-hist-row`, `.dc-hist-done`, `.dc-hist-miss`

### TASK: formula-panel-unit-jump
Add unit navigation buttons (prev/next) to the formula panel to switch units without leaving the practice page.
- HTML: `<button class="formula-unit-nav" id="formulaUnitPrev" onclick="formulaUnitNav(-1)">◀</button><button class="formula-unit-nav" id="formulaUnitNext" onclick="formulaUnitNav(1)">▶</button>` in the formula panel header area near the unit label
- `formulaUnitNav(dir)`: adjusts `currentUnit` by dir (clamp 1-MAX_UNIT), calls `buildFormulas(currentUnit)`, updates the selector
- CSS: `.formula-unit-nav` — small arrow buttons

### TASK: roadmap-progress-certificate
Show a congratulations modal when 100% of roadmap topics are checked.
- `checkRoadmapComplete()`: counts checked vs total topics; if 100% and not yet shown (`sh-cert-shown` key), show certificate modal
- HTML modal: `<div class="cert-modal" id="certModal" style="display:none;"><div class="cert-body"><h2>Roadmap Complete!</h2><p>You've mastered all topics.</p><button onclick="document.getElementById('certModal').style.display='none'">Close</button></div></div>` (add to HTML)
- Call `checkRoadmapComplete()` from `toggleTopic()` when topic is marked done
- CSS: `.cert-modal`, `.cert-body`

### TASK: viz-histogram-bins-control
Add a bins count input/slider to the histogram visualizer so users can change the number of bins.
- HTML: Add `<label>Bins: <input type="range" id="histBins" min="3" max="30" value="10" oninput="document.getElementById('histBinsVal').textContent=this.value;drawHistogram()"></label><span id="histBinsVal">10</span>` to the histogram controls area
- In `drawHistogram()`: read bin count from `#histBins` element (default 10), use that instead of hardcoded bin count
- Guard with typeof document
- CSS: `#histBins` styling consistent with other range inputs


### TASK: practice-answer-history
Show the user's previous answer attempt in the feedback box when they answer a problem wrong.
- In `ansMC()` and `ansFR()`: before showing feedback, check if `answered[id]` already existed; if so, note it was re-attempted
- Modify the feedback box HTML: if there was a previous answer, show "Previous answer: X" in a muted line above the feedback
- Track attempts count in `wrongAttempts[id]` (already exists) and show attempt number
- CSS: `.fb-prev-answer { font-size:11px; color:var(--muted); margin-bottom:4px; }`

### TASK: practice-session-summary
Show a session summary modal when the user resets the unit, showing stats from the session.
- When `resetUnit(unit)` is called, before clearing, capture stats: how many answered, correct, time elapsed
- Show `<div class="session-summary-modal" id="sessionSummaryModal" style="display:none;">` with counts
- `showSessionSummary(answered, correct, time)`: populates and shows the modal
- `closeSessionSummary()`: hides modal and proceeds with actual reset
- The reset should wait for user to close summary (or have a "Reset and Continue" button)
- CSS: `.session-summary-modal`, `.session-summary-body`, `.summary-stat`

### TASK: formula-panel-search-history
Show the last 3 formula search queries as clickable suggestion chips below the search input.
- Save search queries to `sh-formula-searches` localStorage array (max 5) when `filterFormulas()` is called with a non-empty query
- `buildFormulaSearchHistory()`: reads saved queries, shows as clickable `<button class="formula-history-chip">` elements
- Clicking a chip sets the search input value and calls `filterFormulas()`
- Call from `buildFormulas()` to render history chips
- CSS: `.formula-history-row`, `.formula-history-chip`

### TASK: practice-wrong-highlight
After answering wrong on MC, briefly flash the chosen choice red and the correct choice green.
- In `ansMC()` when wrong: add `.flash-wrong` class to selected choice and `.flash-correct` to correct choice after 500ms
- CSS animation: `@keyframes flashWrong { 0%,100% { background:inherit } 50% { background:var(--red) } }` for 1s
- CSS: `.flash-wrong { animation: flashWrong 0.5s; }`, `.flash-correct { animation: flashCorrect 0.5s; }` 
- After 500ms remove classes (prevent persisting animation state)

### TASK: home-motivational-streak-message
Show a personalized message based on current streak on the home page.
- `buildStreakMessage()`: reads streak data, generates message based on streak length
  - 0 days: "Start your streak today!"
  - 1-2 days: "Great start! Keep it up!"
  - 3-6 days: "You're building momentum! X days strong."
  - 7-13 days: "One week strong! Keep the streak alive."
  - 14+: "Impressive! X days straight — you're unstoppable."
- HTML: `<div class="streak-message" id="streakMessage"></div>` in home stats area
- Call from `goPage('home')`
- CSS: `.streak-message { font-size:13px; color:var(--amber); text-align:center; padding:6px 0; }`

### TASK: visualizer-tab-memory
Remember the last active visualizer sub-tab (Histogram/Boxplot/Normal/Compare) and restore it when returning to the visualizer page.
- In `showSub('viz', key, btn)`: save `key` to `sh-viz-tab` localStorage
- In `goPage('visualizer')` or `setUnit()`: read `sh-viz-tab` and call `showSub('viz', saved, btn)` if a saved tab exists
- Guard with typeof localStorage and typeof document
- The existing `showSub` function already handles tab switching

### TASK: practice-score-celebration
When the user achieves 100% on a unit (all problems correct), show a large confetti burst and toast message.
- In `updatePracticeNavBadge()` or after `ansMC/ansFR`: check if all `activeProbs` are answered correctly
- `checkUnitComplete()`: reads answered state, counts correct vs total; if 100%, shows `showConfetti()` (already exists) and shows toast "🏆 Perfect score on Unit N!"
- Save `sh-unit-perfect-${unit}` to avoid showing multiple times
- Guard with typeof document

### TASK: formula-panel-keyword-tags
Add keyword tags below each formula for better discoverability.
- In formula data, formulas already have `name` and `formula` fields
- In `buildFormulas(unit)`: for each formula, add `<div class="formula-tags">` with 2-3 auto-generated keyword tags extracted from the formula name (split by spaces, filter stop words)
- Tags are small chips that are also searchable
- `filterFormulas()` should also match against tags
- CSS: `.formula-tags`, `.formula-tag`

### TASK: roadmap-topic-notes
Allow users to add a short note to any checked roadmap topic.
- Clicking a checked topic's note icon opens an inline input
- `<span class="topic-note-icon" onclick="editTopicNote('${t.n}')">📝</span>` next to each `.tn` element
- `editTopicNote(name)`: shows inline `<input>` next to topic, saves to `sh-topic-notes` localStorage object on blur
- `getTopicNotes()` / `saveTopicNotes()`: read/write `sh-topic-notes`
- CSS: `.topic-note-icon`, `.topic-note-input`

### TASK: daily-streak-freeze
Show a "streak freeze" indicator if user missed yesterday but used a freeze.
- `checkStreakFreeze()`: if streak was broken due to missing yesterday, check `sh-streak-freeze` (max 2 allowed per month)
- If freeze available: restore streak and decrement freeze count, show toast "Streak Freeze used! Streak preserved."
- `buildFreezeInfo()`: shows remaining freezes in streak display area with snowflake icon
- HTML: `<span class="freeze-info" id="freezeInfo"></span>` next to streak display on home
- CSS: `.freeze-info { font-size:11px; color:var(--cyan); }`



### TASK: practice-timer-warning
Show a visual warning when problem timer exceeds the expected time (e.g. yellow at 2x, red at 3x expected time).
- Each problem has an estimated solve time: easy=1min, medium=3min, hard=5min
- In the per-problem timer update loop, compare elapsed seconds to the expected time
- Add `.timer-warn` class (amber color) when elapsed > expected, `.timer-over` class (red) when elapsed > 2x expected
- CSS: `.timer-warn { color:var(--amber) !important; }`, `.timer-over { color:var(--red) !important; animation: pulse 1s infinite; }`
- Guard with typeof document

### TASK: home-weekly-stats-chart
Show a mini bar chart of problems solved per day for the last 7 days on the home page.
- Read `sh-activity` localStorage (date → count object) for the last 7 days
- HTML: `<canvas id="weeklyStatsChart" width="280" height="60"></canvas>` in home stats area, below streak heatmap
- Draw bars using 2D canvas context — one bar per day, scaled to max count, with today highlighted
- Guard all canvas/document calls
- CSS: `#weeklyStatsChart { display:block; margin:8px auto; }`

### TASK: practice-random-problem
Add a "Random Problem" button that jumps to a random unsolved problem in the current unit.
- HTML: `<button class="rand-prob-btn" onclick="jumpToRandomProblem()">🎲 Random</button>` in the practice header area
- `jumpToRandomProblem()`: filters `activeProbs` for problems not in `answered`, picks a random one, scrolls it into view
- If all solved: show toast "All problems solved! Great job."
- CSS: `.rand-prob-btn` — styled like a small secondary button

### TASK: formula-panel-copy-all
Add a "Copy All" button to the formula panel that copies all current unit's formulas to clipboard.
- HTML: `<button class="formula-copy-all-btn" onclick="copyAllFormulas()" title="Copy all formulas">Copy All</button>` in formula panel header
- `copyAllFormulas()`: joins all formula names and equations into a text block, copies to clipboard via navigator.clipboard or fallback
- Show toast "Formulas copied!" on success
- CSS: `.formula-copy-all-btn` — small secondary button

### TASK: practice-hint-usage-tracker
Track and display how many hints the user has used per unit.
- `sh-hint-usage` localStorage object: `{unitKey: count}` where unitKey is `unit-${n}`
- In `showHint(id)`: increment `sh-hint-usage` for currentUnit
- `buildHintUsageInfo()`: reads hint usage for currentUnit, shows e.g. "Hints used: 3" in a small label in the filter bar area
- Call from `buildProblems()` after building filter counts
- CSS: `.hint-usage-label { font-size:11px; color:var(--muted); margin-left:auto; }`

### TASK: home-xp-breakdown
Show a breakdown of XP earned by category on the home page.
- `buildXPBreakdown()`: reads `sh-xp` history, groups XP earned by reason prefix (practice, streak, topic, review, pomo)
- HTML: `<div class="xp-breakdown" id="xpBreakdown"></div>` in home stats area
- Each category shows icon + total XP earned: e.g. "✅ Practice: 120 XP", "🔥 Streak: 45 XP"
- Call from `goPage('home')`
- CSS: `.xp-breakdown`, `.xp-breakdown-row`, `.xp-cat-label`, `.xp-cat-amount`

### TASK: roadmap-export-progress
Add an "Export Progress" button to the roadmap that downloads a JSON file of checked topics and notes.
- HTML: `<button class="rm-export-btn" onclick="exportRoadmapProgress()">Export Progress</button>` in the roadmap header
- `exportRoadmapProgress()`: reads `sh-topics` (checked map) and `sh-topic-notes`, combines into JSON, downloads as `roadmap-progress.json`
- Use Blob + URL.createObjectURL + anchor click pattern (guard with typeof Blob)
- CSS: `.rm-export-btn` — small secondary button

### TASK: visualizer-data-download
Add a "Download Data" button to the visualizer that downloads the current dataset as CSV.
- HTML: `<button class="viz-download-btn" onclick="downloadVizData()">Download CSV</button>` in the visualizer controls area
- `downloadVizData()`: reads `histData` (the current dataset array), formats as CSV (one value per line), downloads as `unit-${n}-data.csv`
- Use Blob + URL.createObjectURL pattern (guard typeof Blob)
- CSS: `.viz-download-btn` — small secondary button

### TASK: practice-problem-rating-display
Show the community rating (average stars) next to each problem's difficulty badge.
- Problems already have a rating system (`sh-ratings` localStorage, `toggleRating()` function)
- `buildRatingDisplay(id)`: computes the average star rating for problem `id` from stored ratings (stored as `ratings[id]` integer 1-5)
- In problem card HTML in `buildProblems()`: add `<span class="prob-rating-display" id="prd-${p.id}"></span>` after the difficulty badge
- After building problems, call `updateAllRatingDisplays()` which calls `buildRatingDisplay` for each problem
- CSS: `.prob-rating-display { font-size:10px; color:var(--amber); }`

### TASK: home-study-plan-widget
Show a simple weekly study plan widget on the home page.
- `buildStudyPlan()`: generates a 7-day plan based on current progress (what units are weak, what topics are unchecked)
- HTML: `<div class="study-plan" id="studyPlan"></div>` in home page
- Each day: day name + suggested activity (e.g. "Mon: Review Unit 3 • Tue: Practice Unit 5 formulas")
- Use `Object.keys(allProbs)` and `getStreakData()` to personalize suggestions
- Call from `goPage('home')`
- CSS: `.study-plan`, `.sp-day`, `.sp-task`

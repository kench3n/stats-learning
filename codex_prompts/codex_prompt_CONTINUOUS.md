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

---

## RULES (ALWAYS)
- NEVER modify tests/
- Guard document/window/localStorage/navigator with typeof checks
- Run both test suites before every commit (185/185 and 260/260)
- One task per git commit
- Use Python for any file writes with regex or special characters
- After all tasks done: invent 10 more, append here, keep going

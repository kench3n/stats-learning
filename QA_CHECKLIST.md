# QA Checklist — Stats Learning Hub v2.0

Run automated tests first, then verify manually.

## Automated Tests

```bash
node tests/run_all.js          # Must: 185/185
node tests/run_extended.js     # Must: 260/260
node tests/benchmark.js        # Informational
```

---

## Core Navigation
- [ ] Home page loads with hero and digest (if has activity)
- [ ] All nav buttons work: Home, Roadmap, Visualizer, Practice, Review, Flashcards, Achievements, Create
- [ ] Keyboard shortcuts 1-5 navigate correctly
- [ ] `?` shows shortcut help overlay
- [ ] `J`/`K` scroll through problems
- [ ] `T` starts Pomodoro timer
- [ ] `D` toggles dark/light theme
- [ ] Browser back/forward buttons work

## Practice
- [ ] All 14 units load problems correctly
- [ ] MC answers submit and show feedback
- [ ] FR answers submit with tolerance checking
- [ ] Hints show on click (wrong answer or explicit)
- [ ] Step-by-step reveal works for problems with `steps[]`
- [ ] Formulas panel toggles per unit
- [ ] Search finds problems by keyword
- [ ] Filters work: All, Unanswered, Wrong, Bookmarked, Easy/Medium/Hard
- [ ] Bookmarks (stars) persist across sessions
- [ ] Notes save on change
- [ ] NLP input bar solves z-score, mean, stdev, median
- [ ] "Visualize" link jumps to correct unit visualizer
- [ ] Focus mode hides UI, highlights current problem
- [ ] PDF export opens printable page
- [ ] Weak spot panel shows topics below 60% accuracy

## Visualizers
- [ ] All 14 unit visualizers draw correctly
- [ ] Sliders/controls update in real-time
- [ ] "Practice this" button navigates to correct unit
- [ ] Dataset selector loads built-in datasets (iris, grades, housing)
- [ ] CSV upload parses custom data and updates visualizer
- [ ] Stats panel shows correct mean, SD, min, max

## Review (Spaced Repetition)
- [ ] Due badge shows correct count in nav
- [ ] "Start Review Session" loads due cards (max 10)
- [ ] Correct answers → interval increases
- [ ] Wrong answers → interval resets to 1 day
- [ ] Session summary shows at end of review

## Engagement
- [ ] Streak increments on first daily activity
- [ ] XP awards for correct answers (easy=5, medium=10, hard=20)
- [ ] Level-up toast at XP thresholds
- [ ] +XP popup animation appears
- [ ] Confetti on correct answers (if motion not reduced)
- [ ] Milestones unlock with toast notification
- [ ] Daily challenge shows 3 problems
- [ ] Daily challenge refreshes each day
- [ ] Weekly goals track problem count and auto-scale

## AI Tutor
- [ ] Tutor panel opens/closes via floating button
- [ ] Keyword queries return relevant responses from TUTOR_KB
- [ ] Unknown queries return helpful suggestions
- [ ] Chat scrolls to latest message

## Learning Paths & Goals
- [ ] Path grid shows all 4 paths (Quick Start, Full Course, Quant Prep, Exam Cram)
- [ ] Selecting a path marks it active and shows progress bar
- [ ] "Continue" button navigates to current path unit
- [ ] Goal date input shows days remaining and pace
- [ ] Certificate generates when all path units have ≥60% accuracy

## Roadmap
- [ ] All 3 levels load with topics
- [ ] Checkboxes toggle and persist
- [ ] Resources are clickable links opening in new tab
- [ ] Progress bar updates
- [ ] Career paths display correctly

## Timer & Theme
- [ ] Pomodoro starts/pauses/resets
- [ ] Timer shows in document title
- [ ] Session complete awards XP (15 min = 10XP, 25 min = 20XP, 45 min = 35XP)
- [ ] Dark/light theme toggles correctly
- [ ] Theme persists across sessions
- [ ] Both themes have readable contrast

## Achievements
- [ ] Badge grid shows all earned/locked badges
- [ ] Activity heatmap displays last 90 days
- [ ] Analytics charts render (accuracy, XP, unit breakdown)
- [ ] Study calendar navigates months
- [ ] Certificate button appears and generates PDF

## Flashcards & Games
- [ ] Flashcard page shows flash/match/build mode buttons
- [ ] Flashcards flip on click/space
- [ ] Arrow keys navigate between cards
- [ ] Card marked easy/hard adjusts review interval
- [ ] Matching game loads with shuffled term-definition pairs
- [ ] Clicking both sides of a correct pair marks them matched
- [ ] Formula builder shows shuffled pieces to assemble
- [ ] Correct formula assembly shows success message

## Custom Problems
- [ ] Create page shows form for MC and FR problems
- [ ] Custom problems appear in the custom problem list
- [ ] Export deck downloads JSON file
- [ ] Import deck loads problems from JSON
- [ ] Delete button removes custom problem
- [ ] Problems can be rated (helpful/unclear)

## Mobile
- [ ] Bottom nav appears on small screens (<768px)
- [ ] Touch targets are adequately sized
- [ ] Visualizers resize correctly on orientation change
- [ ] PWA install banner appears (Chrome/Edge on mobile)

## Offline
- [ ] Service worker registers (DevTools > Application > Service Workers)
- [ ] App loads after going offline
- [ ] Offline indicator appears/disappears
- [ ] All localStorage data persists offline

## Data Management
- [ ] Export downloads full JSON snapshot
- [ ] Import restores all data correctly
- [ ] Reset All clears all localStorage keys
- [ ] No console errors in any flow

## Accessibility
- [ ] Skip link works (Tab from address bar)
- [ ] All interactive elements reachable by Tab
- [ ] ARIA roles and labels on sections/buttons
- [ ] Focus indicators visible
- [ ] `prefers-reduced-motion` disables animations and confetti

---

*Generated for v2.0 release — 2026-02-17*

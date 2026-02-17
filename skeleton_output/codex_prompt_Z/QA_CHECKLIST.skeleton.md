# Skeleton for `QA_CHECKLIST.md`

- Source prompt: `codex_prompts/codex_prompt_Z.md`
- Generated scaffold only.

## Sections
- 3b: Manual QA Checklist

## Reference Snippets

### Snippet 1 (3b: Manual QA Checklist)
```markdown
# QA Checklist — v2.0 Release

## Core Navigation
- [ ] Home page loads with digest (if has activity)
- [ ] All nav buttons work (Home, Roadmap, Visualizer, Practice, Review, Flashcards, Achievements, Create)
- [ ] Keyboard shortcuts 1-5 navigate correctly
- [ ] ? shows shortcut help overlay
- [ ] Back/forward browser buttons work

## Practice
- [ ] All 14 units load problems correctly
- [ ] MC answers submit and show feedback
- [ ] FR answers submit with tolerance checking
- [ ] Hints show on click
- [ ] Formulas panel toggles per unit
- [ ] Search finds problems across units
- [ ] Filters work (all, unanswered, wrong, bookmarked, easy/medium/hard)
- [ ] Bookmarks persist across sessions
- [ ] Notes save on change
- [ ] "Visualize" link jumps to correct unit visualizer
- [ ] Focus mode hides UI, highlights current problem
- [ ] PDF export opens printable page

## Visualizers
- [ ] All 14 unit visualizers draw correctly
- [ ] Sliders/controls update in real-time
- [ ] "Practice this" button navigates to correct unit
- [ ] Dataset selector loads real data
- [ ] CSV upload parses and visualizes custom data
- [ ] Stats panel shows correct computed values

## Review (Spaced Repetition)
- [ ] Due badge shows correct count in nav
- [ ] "Start Review Session" loads due cards (max 10)
- [ ] Correct answers → longer interval
- [ ] Wrong answers → interval resets to 1 day
- [ ] Session summary shows at end

## Engagement
- [ ] Streak increments on first daily activity
... [truncated]
```

# Codex Prompt E — HTML & CSS Fixes

## Objective

Fix stale copy in `stats_hub.html`, add a `<noscript>` fallback, and reduce the CSS noise overlay z-index. These are presentational/content fixes with no logic changes.

## Constraints

- Only modify `stats_hub.html` and `styles/stats_hub.css`
- NEVER modify any file in `tests/`
- NEVER modify `scripts/stats_hub.js`
- Run `node tests/run_all.js` after changes and confirm 185/185 passing

## Issues to Fix

### Issue 1: Update stale problem count in home card (stats_hub.html ~line 55)

The practice card says:
```
65 problems across 11 units
```
and:
```
65 problems · 11 units · 3 difficulty levels
```

The actual count is **115+ problems** (15 in Unit 1, 10 each in Units 2–11). Update both strings:
- Line ~55 `.card-desc`: change "65 problems" to "115+ problems"
- Line ~56 `.card-meta`: change "65 problems" to "115+ problems"

### Issue 2: Update stale count in section header (stats_hub.html ~line 214)

The practice section header says:
```
15 problems from easy to hard. Work them by hand, then check.
```

This is only accurate for Unit 1. Change to something unit-agnostic:
```
Practice problems from easy to hard. Work them by hand, then check.
```

### Issue 3: Add `<noscript>` fallback (stats_hub.html)

Add a `<noscript>` tag inside `<body>`, right after the skip-link (after line 14):

```html
<noscript>
  <p style="padding:40px;text-align:center;color:#e6e4f0;font-family:sans-serif;">
    This app requires JavaScript to run. Please enable JavaScript in your browser settings.
  </p>
</noscript>
```

### Issue 4: Lower noise overlay z-index (stats_hub.css ~line 35)

In `styles/stats_hub.css`, the `body::before` noise texture has `z-index:9999`. This interferes with devtools element inspection. Lower it to `z-index:1` — it still renders above the background but won't sit above fixed nav or modals.

Change:
```css
z-index:9999;
```
To:
```css
z-index:1;
```

The element already has `pointer-events:none` so the value doesn't affect interaction.

## File Targets

- `stats_hub.html`
- `styles/stats_hub.css`

## Verification Steps

```bash
node tests/run_all.js              # Must show: 185 passed, 0 failed
grep "65 problems" stats_hub.html  # Should return nothing
grep "z-index:9999" styles/stats_hub.css  # Should return nothing
```

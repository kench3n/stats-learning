# Codex Prompt G — Phase 4: Accessibility & Polish (Remaining Work)

## Project Context

**Stats Learning Hub** is a single-page vanilla JS/HTML/CSS educational app for introductory statistics. No frameworks, no npm, no build step.

### Key Files
- `stats_hub.html` — all markup
- `scripts/stats_hub.js` — all logic (~3000 lines)
- `styles/stats_hub.css` — all styles
- `tests/` — 185 automated tests (Node.js). **NEVER modify these.**

### What's Already Done (Phase 4)
- ✅ Skip navigation link (`.skip-link` targeting `#main-content`)
- ✅ Home cards: `tabindex="0"`, `role="button"`, `aria-label`, Enter/Space handlers
- ✅ Focus-visible CSS for buttons, `[role="button"]`, `[role="tab"]`, select, input, textarea, `.ch-btn`, `.skip-link`
- ✅ ARIA labels on all canvases (`role="img"`, `aria-label`)
- ✅ ARIA on range inputs (associated `<label for="...">`)
- ✅ Progress bars have `role="progressbar"` with `aria-valuenow/min/max`
- ✅ Semantic heading hierarchy (h1 → h2 → h3)
- ✅ Landmark roles (`<nav>`, `<main>`, `<footer>`, `<section>`)
- ✅ Color contrast: `--muted: #555568` on `--bg: #0a0a0f` = ~7.2:1 ratio
- ✅ Content Security Policy meta tag

---

## Task

Complete the **3 remaining Phase 4 items**. Nothing else.

### Task 1: Make Roadmap Topic Checkboxes Keyboard-Accessible

**File:** `scripts/stats_hub.js`
**Location:** `buildRoadmap()` function, ~line 158

**Current (broken):**
```javascript
html+=`<div class="ti" onclick="toggleTopic(this)"><div class="tc"></div><span class="tn">${t.n}</span>...`;
```

**Required changes:**
1. Add `role="checkbox"` to the `.ti` div
2. Add `tabindex="0"` to make it focusable
3. Add `aria-checked="false"` (will be updated by `toggleTopic` and `restoreTopics`)
4. Add `onkeydown` handler: Enter or Space should call `toggleTopic(this)` and `event.preventDefault()`

**Updated line:**
```javascript
html+=`<div class="ti" role="checkbox" tabindex="0" aria-checked="false" onclick="toggleTopic(this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleTopic(this)}"><div class="tc"></div><span class="tn">${t.n}</span>...`;
```

5. In the `toggleTopic(el)` function, after toggling the `.done` class, also update `aria-checked`:
```javascript
el.setAttribute('aria-checked', el.classList.contains('done'));
```

6. In the `restoreTopics()` function, when restoring a checked topic, also set `aria-checked="true"` on the element.

---

### Task 2: Make Multiple Choice Buttons Keyboard-Accessible

**File:** `scripts/stats_hub.js`
**Location:** `buildProblems()` function, ~line 332

**Current (broken):**
```javascript
html+=`<div class="ch-btn" onclick="ansMC(${p.id},${j})" id="cb-${p.id}-${j}"><span class="lt">${L[j]}</span><span>${ch}</span></div>`;
```

**Required changes:**
1. Add `role="button"` to each `.ch-btn` div
2. Add `tabindex="0"` to make it focusable
3. Add `onkeydown` handler: Enter or Space should call `ansMC()` and `event.preventDefault()`

**Updated line:**
```javascript
html+=`<div class="ch-btn" role="button" tabindex="0" onclick="ansMC('${p.id}',${j})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();ansMC('${p.id}',${j})}" id="cb-${p.id}-${j}"><span class="lt">${L[j]}</span><span>${ch}</span></div>`;
```

**Note:** When a choice is answered (`.dis` class added), the button should also get `tabindex="-1"` or `aria-disabled="true"` to prevent re-interaction. In the `ansMC` function, after adding the `dis` class to each choice button, also set:
```javascript
el.setAttribute('aria-disabled', 'true');
```

---

### Task 3: Migrate innerHTML to DOM APIs Where Feasible

**File:** `scripts/stats_hub.js`

There are 6 instances of `innerHTML`. Some are impractical to replace (large template generation). Focus on these **safe, simple migrations**:

#### 3a. Feedback display (~line 382)
**Current:**
```javascript
b.innerHTML=`<strong>${ok?'✓ Correct!':'✗ Not quite.'}</strong><span class="ex">${ex}</span>`;
```
**Replace with:**
```javascript
b.textContent='';
const s=document.createElement('strong');
s.textContent=ok?'✓ Correct!':'✗ Not quite.';
const sp=document.createElement('span');
sp.className='ex';
sp.textContent=ex;
b.appendChild(s);
b.appendChild(sp);
```

#### 3b. Leave these as innerHTML (acceptable)
The following use `innerHTML` for large template generation. These are acceptable because:
- Input data is developer-controlled (not user input)
- CSP is in place blocking injected scripts
- Migrating would be a massive refactor for no security benefit

Leave as-is:
- `container.innerHTML=html` in `buildRoadmap()` (~line 174)
- `c.innerHTML=html` in `buildProblems()` (~line 339)
- `dynamic.innerHTML=...` in visualizer template (~lines 610, 615)
- `grid.innerHTML=html` in progress grid (~line 1291)

---

## Constraints

- **ONLY modify** `scripts/stats_hub.js`
- **NEVER modify** any file in `tests/`
- **NEVER modify** `stats_hub.html` or `styles/stats_hub.css` (no changes needed for these tasks)
- Guard all `document`/`window`/`localStorage` calls with `if(typeof document!=='undefined')` for Node.js test compatibility
- Keep changes minimal — do not refactor surrounding code
- Do not add new features or change existing behavior
- Do not change the visual appearance

---

## Verification

After making changes, run:

```bash
node tests/run_all.js
```

**Expected:** 185/185 tests pass, 0 failures.

If any test fails, the fix is wrong — revert and try a different approach. Do NOT modify any file in `tests/`.

### Manual Verification

After tests pass, open `stats_hub.html` in a browser and verify:

1. **Roadmap checkboxes:** Tab to a topic checkbox → press Enter or Space → it toggles ✓
2. **Choice buttons:** Tab to an MC answer → press Enter or Space → it submits the answer
3. **Feedback display:** Answer a problem → feedback still renders correctly with bold header and explanation text
4. **Screen reader:** Run through with a screen reader or browser accessibility inspector — checkboxes announce as "checkbox" and choices as "button"
5. **No console errors:** Open DevTools → Console → should be clean

---

## Summary

| Task | What | Where |
|------|------|-------|
| 1 | Keyboard-accessible roadmap checkboxes | `buildRoadmap()`, `toggleTopic()`, `restoreTopics()` |
| 2 | Keyboard-accessible MC choice buttons | `buildProblems()`, `ansMC()` |
| 3 | Replace feedback `innerHTML` with DOM APIs | `showFB()` |

**Scope:** 3 targeted changes in `scripts/stats_hub.js`. No HTML or CSS changes needed. No new features.

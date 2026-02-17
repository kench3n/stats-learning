# Codex Prompt B — Export & Share

## Project Context

You are modifying a vanilla JS/HTML/CSS statistics learning web app ("Stats Learning Hub"). No build system — everything runs directly in the browser. The app lives in three files:

- `stats_hub.html` — single-page HTML
- `scripts/stats_hub.js` — all logic
- `styles/stats_hub.css` — all styles

### Key conventions
- All new `window`/`document`/`localStorage` calls must be guarded: `if(typeof document!=='undefined' && typeof document.addEventListener==='function'){ ... }` — tests run in Node.js.
- Never modify any file in `tests/`.
- CSS uses custom properties from `:root`.
- Practice state: `sh-practice-{unit}` keys in localStorage (JSON `{answered: {...}}`).
- Roadmap state: `sh-topics` key in localStorage (JSON `{topicName: bool}`).
- `allProbs` maps unit (1–11) → array of problem objects.
- `UNIT_META` maps unit → `{name: string}`.

### Prerequisite (already done)
Prompt A added:
- A `#progressPanel` with `#progressGrid` and `.progress-actions` div inside `#page-practice`.
- `getProgressSummary()` — returns `{unit: {total, attempted, correct}}` for units 1–11.
- `buildProgressPanel()` — renders the 11-cell summary grid.
- `resetUnit(unit)` and `resetAllProgress()`.

---

## Task

Add **Export JSON**, **Copy Summary**, and **Import JSON** functionality to the progress panel.

### 1. HTML changes (`stats_hub.html`)

Inside the `.progress-actions` div (added in Prompt A, inside `#progressPanel`), add these buttons **before** the existing "Reset All Progress" button:

```html
<button class="share-btn" onclick="exportProgressJSON()">Export JSON</button>
<button class="share-btn" onclick="copyProgressSummary()">Copy Summary</button>
<label class="share-btn import-label">
  Import <input type="file" id="importFile" accept=".json" onchange="importProgressJSON(this.files[0])" hidden>
</label>
```

Add a hidden textarea and toast element at the end of `<main>`, before `</main>`:

```html
<textarea id="shareOutput" aria-hidden="true" style="position:absolute;left:-9999px;top:0;"></textarea>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
```

### 2. JS changes (`scripts/stats_hub.js`)

Add these functions near the other progress functions (before `setUnit(1);`). Guard all DOM access.

#### `showToast(msg, duration=2000)`
- Set `#toast` textContent to `msg`, add class `toast-visible`.
- After `duration` ms, remove `toast-visible`.

#### `exportProgressJSON()`
- Build an object: `{ version: 1, exported: new Date().toISOString(), practice: {}, topics: null }`.
- For `practice`, loop 1–11: `practice[unit] = JSON.parse(localStorage.getItem('sh-practice-' + unit) || 'null')`.
- For `topics`: `JSON.parse(localStorage.getItem('sh-topics') || 'null')`.
- Convert to JSON string with 2-space indent.
- Create a `Blob` with type `application/json`.
- Create a temporary `<a>` element, set `href = URL.createObjectURL(blob)`, `download = 'stats-hub-progress.json'`.
- Append to body, click, remove, revoke URL.
- Call `showToast('Exported!')`.

#### `copyProgressSummary()`
- Call `getProgressSummary()`.
- Build a plain-text summary string:
```
Stats Learning Hub — Progress
─────────────────────────────
Unit 1:  X/Y correct (Z%)
Unit 2:  X/Y correct (Z%)
...
Unit 11: X/Y correct (Z%)
─────────────────────────────
Roadmap: A/B topics checked
─────────────────────────────
Total:   X/Y correct (Z%)
```
- For roadmap count: read `sh-topics` from localStorage, count truthy values. For total topics, either hardcode the known total or count all keys. The roadmap DOM may not be available in all states, so reading from localStorage is safer.
- For total: sum all `correct` and `total` across units.
- Format each line so unit numbers align (pad single digits).
- Try `navigator.clipboard.writeText(text)`. If it fails (or unavailable), fall back to setting the `#shareOutput` textarea value, selecting it, and calling `document.execCommand('copy')`.
- Call `showToast('Copied to clipboard!')`.

#### `importProgressJSON(file)`
- If no file, return.
- Use `FileReader` to read as text.
- In `onload`: parse JSON. Validate it has a `practice` object.
- For each unit key in `practice`, if value is not null, `localStorage.setItem('sh-practice-' + unit, JSON.stringify(practice[unit]))`.
- If `topics` exists and is an object, `localStorage.setItem('sh-topics', JSON.stringify(topics))`.
- Call `buildProblems(currentUnit)` to reload current unit state.
- Call `buildRoadmap()` to reload roadmap checkboxes.
- Call `buildProgressPanel()` to refresh the summary grid.
- Call `showToast('Imported successfully!')`.
- If parsing fails, call `showToast('Invalid file format')`.

### 3. CSS changes (`styles/stats_hub.css`)

Add at the end:

```css
/* ===================== SHARE & TOAST ===================== */
.progress-actions{flex-wrap:wrap;}
.share-btn{
  font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;
  text-transform:uppercase;padding:7px 14px;border-radius:6px;cursor:pointer;
  background:var(--cyan-g);border:1px solid rgba(6,182,212,0.3);
  color:var(--cyan);transition:all 0.2s;
}
.share-btn:hover{background:rgba(6,182,212,0.18);border-color:rgba(6,182,212,0.5);}
.import-label{display:inline-flex;align-items:center;}
.import-label input[type="file"]{display:none;}
.toast{
  position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);
  font-family:'Space Mono',monospace;font-size:12px;
  padding:10px 20px;border-radius:8px;
  background:var(--bg3);border:1px solid var(--border-h);color:var(--text);
  opacity:0;pointer-events:none;transition:all 0.3s ease;z-index:2000;
}
.toast.toast-visible{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto;}
```

---

## Verification

```bash
node tests/run_all.js   # Must remain 185 passed, 0 failed
```

Do NOT modify any file in `tests/`. If tests break, the source code fix is wrong — revert and try again.

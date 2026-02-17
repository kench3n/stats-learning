# Codex Prompt L — Phase 8: Pomodoro Timer, Dark/Light Theme, Keyboard Shortcuts

## Project Context

Stats Learning Hub — single-page vanilla JS/HTML/CSS. 185 tests via `node tests/run_all.js`. NEVER modify `tests/`. All engagement systems (streak, XP, milestones, review, digest) exist from prior phases.

### Key Files
- `stats_hub.html`, `scripts/stats_hub.js`, `styles/stats_hub.css`

---

## Task 1: Pomodoro Study Timer

ADHD users struggle with time blindness. A built-in timer keeps sessions focused and creates natural break points.

### 1a: Timer UI

Add a floating timer widget (bottom-right corner, above footer):

**File:** `stats_hub.html`

```html
<div class="pomo-widget" id="pomoWidget">
  <button class="pomo-toggle" id="pomoToggle" onclick="togglePomoPanel()" aria-label="Toggle study timer">⏱</button>
  <div class="pomo-panel" id="pomoPanel" style="display:none;">
    <div class="pomo-display" id="pomoDisplay">25:00</div>
    <div class="pomo-label" id="pomoLabel">Focus Time</div>
    <div class="pomo-controls">
      <button onclick="startPomo()" id="pomoStart">Start</button>
      <button onclick="pausePomo()" id="pomoPause" style="display:none;">Pause</button>
      <button onclick="resetPomo()" id="pomoReset">Reset</button>
    </div>
    <div class="pomo-presets">
      <button onclick="setPomoTime(15)" class="pomo-preset">15m</button>
      <button onclick="setPomoTime(25)" class="pomo-preset active">25m</button>
      <button onclick="setPomoTime(45)" class="pomo-preset">45m</button>
    </div>
    <div class="pomo-stats">
      <span id="pomoSessions">0</span> sessions today
    </div>
  </div>
</div>
```

### 1b: Timer Logic

**File:** `scripts/stats_hub.js`

```javascript
let pomoState={running:false,seconds:25*60,total:25*60,interval:null,sessionsToday:0};

function togglePomoPanel(){
  const p=document.getElementById('pomoPanel');
  if(p)p.style.display=p.style.display==='none'?'':'none';
}

function setPomoTime(mins){
  if(pomoState.running)return;
  pomoState.seconds=mins*60;
  pomoState.total=mins*60;
  updatePomoDisplay();
  document.querySelectorAll('.pomo-preset').forEach(b=>b.classList.remove('active'));
  event.target.classList.add('active');
}

function startPomo(){
  if(pomoState.running)return;
  pomoState.running=true;
  document.getElementById('pomoStart').style.display='none';
  document.getElementById('pomoPause').style.display='';
  document.getElementById('pomoLabel').textContent='Focusing...';
  pomoState.interval=setInterval(()=>{
    pomoState.seconds--;
    updatePomoDisplay();
    if(pomoState.seconds<=0){
      clearInterval(pomoState.interval);
      pomoState.running=false;
      pomoComplete();
    }
  },1000);
}

function pausePomo(){
  clearInterval(pomoState.interval);
  pomoState.running=false;
  document.getElementById('pomoStart').style.display='';
  document.getElementById('pomoPause').style.display='none';
  document.getElementById('pomoLabel').textContent='Paused';
}

function resetPomo(){
  clearInterval(pomoState.interval);
  pomoState.running=false;
  pomoState.seconds=pomoState.total;
  updatePomoDisplay();
  document.getElementById('pomoStart').style.display='';
  document.getElementById('pomoPause').style.display='none';
  document.getElementById('pomoLabel').textContent='Focus Time';
}

function updatePomoDisplay(){
  const m=Math.floor(pomoState.seconds/60);
  const s=pomoState.seconds%60;
  const el=document.getElementById('pomoDisplay');
  if(el)el.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  // Update document title with timer
  if(pomoState.running)document.title='('+m+':'+String(s).padStart(2,'0')+') Stats Hub';
  else document.title='Stats Learning Hub';
}

function pomoComplete(){
  pomoState.sessionsToday++;
  setElText('pomoSessions',pomoState.sessionsToday);
  document.getElementById('pomoLabel').textContent='Break time! 🎉';
  document.getElementById('pomoStart').style.display='';
  document.getElementById('pomoPause').style.display='none';
  // Award XP for completing a focus session
  awardXP(15,'pomo-session');
  recordActivity();
  showToast('Focus session complete! +15 XP. Take a break.');
  // Save session count
  if(typeof localStorage!=='undefined'){
    const today=todayStr();
    const data=JSON.parse(localStorage.getItem('sh-pomo')||'{}');
    data[today]=(data[today]||0)+1;
    localStorage.setItem('sh-pomo',JSON.stringify(data));
  }
  // Reset for next session (5-min break default)
  pomoState.seconds=5*60;
  pomoState.total=5*60;
  updatePomoDisplay();
}
```

### 1c: Timer Styles

**File:** `styles/stats_hub.css`

```css
.pomo-widget{position:fixed;bottom:70px;right:20px;z-index:1500;}
.pomo-toggle{
  width:48px;height:48px;border-radius:50%;border:2px solid var(--cyan);
  background:var(--bg);color:var(--cyan);font-size:20px;cursor:pointer;
  transition:all 0.2s;box-shadow:0 2px 12px rgba(0,0,0,0.3);
}
.pomo-toggle:hover{background:var(--cyan);color:var(--bg);}
.pomo-panel{
  position:absolute;bottom:56px;right:0;width:220px;
  background:var(--bg2);border:1px solid var(--border);border-radius:12px;
  padding:16px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.4);
}
.pomo-display{font-size:36px;font-weight:700;color:var(--text);font-family:'Space Mono',monospace;}
.pomo-label{font-size:12px;color:var(--muted);margin:4px 0 12px;font-family:'Space Mono',monospace;}
.pomo-controls{display:flex;gap:8px;justify-content:center;margin-bottom:8px;}
.pomo-controls button{
  padding:6px 14px;border:1px solid var(--cyan);background:transparent;color:var(--cyan);
  border-radius:6px;font-size:12px;cursor:pointer;font-family:'Space Mono',monospace;
}
.pomo-controls button:hover{background:var(--cyan);color:var(--bg);}
.pomo-presets{display:flex;gap:6px;justify-content:center;margin-bottom:8px;}
.pomo-preset{
  padding:4px 10px;border:1px solid var(--border);background:transparent;color:var(--muted);
  border-radius:4px;font-size:11px;cursor:pointer;font-family:'Space Mono',monospace;
}
.pomo-preset.active{border-color:var(--cyan);color:var(--cyan);}
.pomo-stats{font-size:11px;color:var(--muted);font-family:'Space Mono',monospace;}

@media print{.pomo-widget{display:none !important;}}
```

---

## Task 2: Dark/Light Theme Toggle

### 2a: Theme Toggle Button

**File:** `stats_hub.html` — add in `.top-nav` (after existing nav pills):

```html
<button class="theme-toggle" id="themeToggle" onclick="toggleTheme()" aria-label="Toggle light/dark theme">🌙</button>
```

### 2b: Light Theme CSS Variables

**File:** `styles/stats_hub.css`

Add a `[data-theme="light"]` override block after the `:root` variables:

```css
[data-theme="light"]{
  --bg:#f5f5f7;--bg2:#ffffff;--text:#1a1a2e;--muted:#666680;
  --border:#d0d0dd;--cyan:#0095a3;--amber:#b8860b;--pink:#c2185b;
  --purple:#6a1b9a;--green:#2e7d32;--orange:#e65100;--red:#c62828;
}
[data-theme="light"] body::before{display:none;}
[data-theme="light"] .top-nav{background:rgba(245,245,247,0.92);}
[data-theme="light"] .pomo-panel{box-shadow:0 4px 24px rgba(0,0,0,0.1);}
```

### 2c: Theme Toggle Logic

**File:** `scripts/stats_hub.js`

```javascript
function toggleTheme(){
  if(typeof document==='undefined')return;
  const current=document.documentElement.getAttribute('data-theme');
  const next=current==='light'?'dark':'light';
  document.documentElement.setAttribute('data-theme',next);
  const btn=document.getElementById('themeToggle');
  if(btn)btn.textContent=next==='light'?'☀️':'🌙';
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-theme',next);
}

function loadTheme(){
  if(typeof localStorage==='undefined'||typeof document==='undefined')return;
  const saved=localStorage.getItem('sh-theme');
  if(saved){
    document.documentElement.setAttribute('data-theme',saved);
    const btn=document.getElementById('themeToggle');
    if(btn)btn.textContent=saved==='light'?'☀️':'🌙';
  }
}
```

Call `loadTheme()` in DOMContentLoaded handler (early, before other UI updates).

### 2d: Style the Toggle Button

```css
.theme-toggle{
  background:none;border:1px solid var(--border);border-radius:6px;
  padding:4px 8px;font-size:16px;cursor:pointer;transition:border-color 0.2s;
  margin-left:auto;
}
.theme-toggle:hover{border-color:var(--cyan);}
```

---

## Task 3: Keyboard Shortcuts

### 3a: Global Keyboard Handler

**File:** `scripts/stats_hub.js`

```javascript
if(typeof document!=='undefined'){
  document.addEventListener('keydown',function(e){
    // Don't trigger shortcuts when typing in inputs
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;

    // Navigation: 1-5 for pages
    if(e.key==='1'){goPage('home');}
    else if(e.key==='2'){goPage('roadmap');}
    else if(e.key==='3'){goPage('visualizer');}
    else if(e.key==='4'){goPage('practice');}
    else if(e.key==='5'){goPage('review');}

    // T = toggle timer
    else if(e.key==='t'||e.key==='T'){togglePomoPanel();}

    // D = toggle theme (dark/light)
    else if(e.key==='d'||e.key==='D'){toggleTheme();}

    // ? = show shortcuts help
    else if(e.key==='?'){toggleShortcutsHelp();}
  });
}
```

### 3b: Shortcuts Help Overlay

**File:** `stats_hub.html`

```html
<div class="shortcuts-overlay" id="shortcutsOverlay" style="display:none;" onclick="toggleShortcutsHelp()">
  <div class="shortcuts-modal" onclick="event.stopPropagation();">
    <h3>Keyboard Shortcuts</h3>
    <div class="shortcut-row"><kbd>1</kbd> Home</div>
    <div class="shortcut-row"><kbd>2</kbd> Roadmap</div>
    <div class="shortcut-row"><kbd>3</kbd> Visualizer</div>
    <div class="shortcut-row"><kbd>4</kbd> Practice</div>
    <div class="shortcut-row"><kbd>5</kbd> Review</div>
    <div class="shortcut-row"><kbd>T</kbd> Toggle Timer</div>
    <div class="shortcut-row"><kbd>D</kbd> Toggle Theme</div>
    <div class="shortcut-row"><kbd>?</kbd> This Help</div>
    <button onclick="toggleShortcutsHelp()">Close</button>
  </div>
</div>
```

**File:** `scripts/stats_hub.js`

```javascript
function toggleShortcutsHelp(){
  const el=document.getElementById('shortcutsOverlay');
  if(el)el.style.display=el.style.display==='none'?'flex':'none';
}
```

### 3c: Shortcuts Styles

**File:** `styles/stats_hub.css`

```css
.shortcuts-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2000;
  display:flex;align-items:center;justify-content:center;
}
.shortcuts-modal{
  background:var(--bg2);border:1px solid var(--border);border-radius:12px;
  padding:24px;min-width:260px;
}
.shortcuts-modal h3{margin:0 0 16px;font-size:16px;color:var(--text);font-family:'Space Mono',monospace;}
.shortcut-row{display:flex;align-items:center;gap:12px;padding:6px 0;font-size:13px;color:var(--text);}
.shortcut-row kbd{
  background:var(--bg);border:1px solid var(--border);border-radius:4px;
  padding:2px 8px;font-family:'Space Mono',monospace;font-size:12px;
  color:var(--cyan);min-width:24px;text-align:center;
}
.shortcuts-modal button{
  margin-top:16px;width:100%;padding:8px;border:1px solid var(--border);
  background:transparent;color:var(--muted);border-radius:6px;cursor:pointer;
  font-family:'Space Mono',monospace;
}
.shortcuts-modal button:hover{border-color:var(--cyan);color:var(--cyan);}

@media print{.shortcuts-overlay,.pomo-widget{display:none !important;}}
```

---

## Constraints

- NEVER modify `tests/`. Guard all DOM/localStorage calls. Only modify `stats_hub.html`, `scripts/stats_hub.js`, `styles/stats_hub.css`.
- Pomodoro timer must not block other interactions — it runs in background.
- Theme toggle must persist across sessions via localStorage key `sh-theme`.
- Light theme must maintain WCAG AA contrast ratios.
- Keyboard shortcuts must not fire when user is typing in input fields.

## Verification

```bash
node tests/run_all.js
```
Expected: 185/185 pass. Manual: test timer, theme toggle, all keyboard shortcuts.

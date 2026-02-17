# Codex Prompt O — Phase 11: Weak Spot Detection, Focus Mode, Session Summary

## Project Context

Stats Learning Hub — single-page vanilla JS/HTML/CSS. 185 tests. NEVER modify `tests/`. XP, streak, review, milestones, progress summary all exist.

---

## Task 1: Weak Spot Detection & Adaptive Recommendations

Analyze the user's answer history to identify weak topics and surface targeted recommendations.

### 1a: Weakness Analysis

**File:** `scripts/stats_hub.js`

```javascript
function analyzeWeakSpots(){
  const spots=[];
  for(let u=1;u<=11;u++){
    const probs=allProbs[u]||[];
    const state=getPracticeState(u);
    const ans=state.answered||{};
    let correct=0,wrong=0,unanswered=0;
    const wrongTopics={};

    probs.forEach(p=>{
      if(ans[p.id]===undefined){unanswered++;return;}
      let ok=false;
      if(p.type==='mc'){ok=(+ans[p.id])===p.ans;}
      else{const v=parseFloat(ans[p.id]);ok=Number.isFinite(v)&&Math.abs(v-p.ans)<=(p.tol||0.1);}
      if(ok)correct++;
      else{wrong++;wrongTopics[p.topic]=(wrongTopics[p.topic]||0)+1;}
    });

    if(wrong>0||unanswered>0){
      spots.push({
        unit:u,
        name:UNIT_META[u].name,
        correct,wrong,unanswered,
        total:probs.length,
        pct:probs.length?Math.round(correct/probs.length*100):0,
        weakTopics:Object.entries(wrongTopics).sort((a,b)=>b[1]-a[1]).map(e=>e[0])
      });
    }
  }
  // Sort by worst performance first
  spots.sort((a,b)=>a.pct-b.pct);
  return spots;
}
```

### 1b: Weak Spots Display

Add a "Weak Spots" section to the progress panel in the practice page:

**File:** `stats_hub.html` — inside `#progressPanel`, after milestone shelf:

```html
<div class="weakspot-panel" id="weakspotPanel">
  <h3 class="weakspot-title">🎯 Focus Areas</h3>
  <div id="weakspotList"></div>
</div>
```

```javascript
function updateWeakSpots(){
  const list=document.getElementById('weakspotList');
  if(!list)return;
  const spots=analyzeWeakSpots();
  if(!spots.length){list.innerHTML='<div class="weakspot-empty">No weak spots detected. Keep it up!</div>';return;}
  let html='';
  spots.slice(0,3).forEach(s=>{
    html+=`<div class="weakspot-card" onclick="goPage('practice');setUnit(${s.unit});">
      <div class="weakspot-unit">Unit ${s.unit}: ${s.name}</div>
      <div class="weakspot-bar"><div class="weakspot-fill" style="width:${s.pct}%;"></div></div>
      <div class="weakspot-detail">${s.correct}/${s.total} correct · ${s.wrong} wrong · ${s.unanswered} unanswered</div>
      ${s.weakTopics.length?'<div class="weakspot-topics">Weak: '+s.weakTopics.slice(0,2).join(', ')+'</div>':''}
    </div>`;
  });
  list.innerHTML=html;
}
```

Call `updateWeakSpots()` on page load and after answering problems.

### 1c: Weak Spot Styles

```css
.weakspot-panel{margin-top:16px;padding-top:16px;border-top:1px solid var(--border);}
.weakspot-title{font-size:14px;color:var(--text);margin-bottom:8px;font-family:'Space Mono',monospace;}
.weakspot-card{
  padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;
  margin-bottom:8px;cursor:pointer;transition:border-color 0.2s;
}
.weakspot-card:hover{border-color:var(--pink);}
.weakspot-unit{font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px;}
.weakspot-bar{height:6px;background:var(--bg2);border-radius:3px;overflow:hidden;margin-bottom:4px;}
.weakspot-fill{height:100%;background:var(--pink);border-radius:3px;transition:width 0.3s;}
.weakspot-detail{font-size:11px;color:var(--muted);font-family:'Space Mono',monospace;}
.weakspot-topics{font-size:11px;color:var(--amber);margin-top:4px;font-family:'Space Mono',monospace;}
.weakspot-empty{font-size:13px;color:var(--green);padding:8px 0;font-family:'Space Mono',monospace;}
```

---

## Task 2: Focus Mode

A distraction-free mode that hides everything except the current problem or review card. Essential for ADHD.

### 2a: Focus Mode Toggle

**File:** `stats_hub.html` — add button in practice section header:

```html
<button class="focus-btn" id="focusBtn" onclick="toggleFocusMode()" aria-label="Toggle focus mode">🎯 Focus Mode</button>
```

### 2b: Focus Mode Logic

**File:** `scripts/stats_hub.js`

```javascript
let focusModeActive=false;

function toggleFocusMode(){
  focusModeActive=!focusModeActive;
  document.body.classList.toggle('focus-mode',focusModeActive);
  const btn=document.getElementById('focusBtn');
  if(btn)btn.textContent=focusModeActive?'✕ Exit Focus':'🎯 Focus Mode';

  if(focusModeActive){
    // Scroll to first unanswered problem
    const probs=document.querySelectorAll('.pc');
    for(const pc of probs){
      if(!pc.classList.contains('correct')&&!pc.classList.contains('incorrect')){
        pc.scrollIntoView({behavior:'smooth',block:'center'});
        pc.classList.add('focus-highlight');
        break;
      }
    }
  }else{
    document.querySelectorAll('.focus-highlight').forEach(el=>el.classList.remove('focus-highlight'));
  }
}
```

### 2c: Focus Mode Styles

```css
.focus-btn{
  background:none;border:1px solid var(--amber);border-radius:6px;
  padding:6px 14px;color:var(--amber);font-size:12px;cursor:pointer;
  font-family:'Space Mono',monospace;
}
.focus-btn:hover{background:var(--amber);color:var(--bg);}

body.focus-mode .top-nav,
body.focus-mode .bottom-bar,
body.focus-mode .section-header,
body.focus-mode .progress-panel,
body.focus-mode .formula-panel,
body.focus-mode .pomo-widget,
body.focus-mode .daily-digest,
body.focus-mode .score-bar{display:none !important;}

body.focus-mode .page{padding-top:16px;}

body.focus-mode .pc{
  opacity:0.3;transition:opacity 0.3s;
}
body.focus-mode .pc.focus-highlight,
body.focus-mode .pc:focus-within{
  opacity:1;
  box-shadow:0 0 0 2px var(--cyan);
  border-radius:12px;
}

/* Auto-highlight next problem when current is answered */
body.focus-mode .pc.correct,
body.focus-mode .pc.incorrect{opacity:0.2;}
```

---

## Task 3: Session Summary

After a study session (timer ends or user navigates away), show a summary of what they accomplished.

### 3a: Track Session Activity

**File:** `scripts/stats_hub.js`

```javascript
let sessionData={startTime:Date.now(),problemsAnswered:0,correct:0,xpEarned:0,reviewsDone:0};

// Hook into existing functions:
// In ansMC/ansFR after scoring:
//   sessionData.problemsAnswered++;
//   if(ok) sessionData.correct++;

// In awardXP:
//   sessionData.xpEarned+=amount;

// In endReview:
//   sessionData.reviewsDone++;
```

### 3b: Session Summary Modal

```javascript
function showSessionSummary(){
  if(typeof document==='undefined')return;
  const elapsed=Math.round((Date.now()-sessionData.startTime)/60000);
  if(sessionData.problemsAnswered===0&&sessionData.reviewsDone===0)return;

  const overlay=document.createElement('div');
  overlay.className='session-overlay';
  overlay.onclick=function(){overlay.remove();};

  const modal=document.createElement('div');
  modal.className='session-modal';
  modal.onclick=function(e){e.stopPropagation();};

  modal.innerHTML=`
    <h3>Session Summary</h3>
    <div class="session-stats">
      <div class="session-stat"><span class="session-num">${elapsed}</span><span class="session-label">minutes</span></div>
      <div class="session-stat"><span class="session-num">${sessionData.problemsAnswered}</span><span class="session-label">problems</span></div>
      <div class="session-stat"><span class="session-num">${sessionData.correct}</span><span class="session-label">correct</span></div>
      <div class="session-stat"><span class="session-num">+${sessionData.xpEarned}</span><span class="session-label">XP earned</span></div>
    </div>
    <div class="session-message">${getSessionMessage()}</div>
    <button class="session-close" onclick="this.closest('.session-overlay').remove()">Nice! 🎉</button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

function getSessionMessage(){
  const pct=sessionData.problemsAnswered?Math.round(sessionData.correct/sessionData.problemsAnswered*100):0;
  if(pct>=90)return'Incredible accuracy! You\'re on fire.';
  if(pct>=70)return'Solid session. Keep building momentum.';
  if(pct>=50)return'Good effort! Review the tricky ones tomorrow.';
  return'Every problem makes you stronger. Come back tomorrow!';
}
```

Trigger `showSessionSummary()`:
- When Pomodoro timer completes
- When user clicks a "End Session" button (add to nav or digest)
- On `beforeunload` is NOT recommended (popups get blocked)

### 3c: Session Summary Styles

```css
.session-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2000;
  display:flex;align-items:center;justify-content:center;
}
.session-modal{
  background:var(--bg2);border:1px solid var(--border);border-radius:16px;
  padding:32px;text-align:center;max-width:360px;width:90%;
}
.session-modal h3{font-size:18px;color:var(--text);margin:0 0 20px;font-family:'Space Mono',monospace;}
.session-stats{display:flex;justify-content:space-around;margin-bottom:20px;}
.session-stat{display:flex;flex-direction:column;align-items:center;gap:4px;}
.session-num{font-size:28px;font-weight:700;color:var(--cyan);font-family:'Space Mono',monospace;}
.session-label{font-size:11px;color:var(--muted);text-transform:uppercase;font-family:'Space Mono',monospace;}
.session-message{font-size:14px;color:var(--text);margin-bottom:20px;line-height:1.5;}
.session-close{
  padding:12px 32px;background:var(--cyan);color:var(--bg);border:none;border-radius:8px;
  font-family:'Space Mono',monospace;font-size:14px;font-weight:700;cursor:pointer;
}
.session-close:hover{background:var(--amber);}
```

---

## Constraints

- NEVER modify `tests/`. Guard all DOM/localStorage calls.
- Focus mode must be toggleable and not break keyboard navigation.
- Weak spot analysis must handle empty/missing practice state gracefully.
- Session summary must not use `beforeunload` (unreliable and annoying).

## Verification

```bash
node tests/run_all.js
```
Expected: 185/185 pass. Manual: check weak spots accuracy, focus mode hide/show, session summary after timer completes.

# Codex Prompt J — Phase 6b: Spaced Repetition System

## Project Context

**Stats Learning Hub** — single-page vanilla JS/HTML/CSS app. 185 tests via `node tests/run_all.js`. **NEVER modify files in `tests/`.**

### Prerequisites
This prompt assumes **Prompt I** has been implemented first. The following systems must exist:
- Streak system (`sh-streak` in localStorage, `recordActivity()`, `todayStr()`)
- XP system (`sh-xp` in localStorage, `awardXP()`, `XP_TABLE`)
- Milestone system (`sh-milestones`, `checkMilestones()`)

### Current Practice State
Problems are stored in `allProbs` keyed by unit. Each problem: `{id, unit, type, diff, q, ans, ex, ch?, tol?}`

Practice state per unit in `sh-practice-{unit}`:
```json
{"answered":{"u3p1":2,"u3p5":1.75}}
```

Once answered, a problem is locked — the user cannot re-attempt it. This is fine for first-pass learning but bad for ADHD retention.

### ADHD + Spaced Repetition
People with ADHD benefit enormously from:
- **Re-encountering material** they've forgotten (not just new problems)
- **Short, focused review sessions** (5-10 problems, not 115)
- **Variable difficulty** (mixing easy wins with harder recalls)
- **Visible "due for review" counts** that create gentle urgency
- **No punishment for forgetting** — normalize re-learning

---

## Task: Build a Spaced Repetition Review System

### Overview

Add a **Review Mode** that resurfaces problems the user got wrong (or hasn't seen recently) using a simplified spaced repetition algorithm. This is a NEW page/tab, not a replacement for Practice.

---

### 1. Review Data Model

**File:** `scripts/stats_hub.js`

```javascript
// localStorage key: 'sh-review'
// Data format:
// {
//   "u3p1": { next: "2026-02-19", interval: 2, ease: 2.5, reps: 1, lastResult: "wrong" },
//   "u5p7": { next: "2026-02-20", interval: 4, ease: 2.5, reps: 2, lastResult: "correct" },
// }
//
// Algorithm (simplified SM-2):
// - New card: interval=1 day
// - Correct: interval = interval * ease, ease += 0.1 (max 3.0)
// - Wrong:   interval = 1, ease = max(1.3, ease - 0.2), reps = 0
// - Card is "due" when todayStr() >= next

function getReviewData(){
  if(typeof localStorage==='undefined')return{};
  try{return JSON.parse(localStorage.getItem('sh-review')||'{}');}catch{return{};}
}

function saveReviewData(data){
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-review',JSON.stringify(data));
}

function addToReview(probId, wasCorrect){
  const data=getReviewData();
  const today=todayStr();

  if(!data[probId]){
    // New card — schedule based on result
    data[probId]={
      next: wasCorrect ? addDays(today, 3) : addDays(today, 1),
      interval: wasCorrect ? 3 : 1,
      ease: 2.5,
      reps: wasCorrect ? 1 : 0,
      lastResult: wasCorrect ? 'correct' : 'wrong'
    };
  }
  // If card already exists, don't override — review will update it
  saveReviewData(data);
}

function addDays(dateStr, days){
  const d=new Date(dateStr);
  d.setDate(d.getDate()+days);
  return d.toISOString().slice(0,10);
}

function getDueCards(){
  const data=getReviewData();
  const today=todayStr();
  const due=[];
  for(const id in data){
    if(data[id].next<=today)due.push(id);
  }
  // Sort: wrong cards first, then by oldest due date
  due.sort((a,b)=>{
    const da=data[a], db=data[b];
    if(da.lastResult==='wrong'&&db.lastResult!=='wrong')return -1;
    if(db.lastResult==='wrong'&&da.lastResult!=='wrong')return 1;
    return da.next<db.next?-1:1;
  });
  return due;
}

function reviewAnswer(probId, wasCorrect){
  const data=getReviewData();
  const card=data[probId];
  if(!card)return;

  if(wasCorrect){
    card.reps++;
    card.ease=Math.min(3.0, card.ease+0.1);
    card.interval=Math.round(card.interval*card.ease);
    card.lastResult='correct';
  }else{
    card.reps=0;
    card.ease=Math.max(1.3, card.ease-0.2);
    card.interval=1;
    card.lastResult='wrong';
  }
  card.next=addDays(todayStr(), card.interval);

  saveReviewData(data);
}
```

### 2. Auto-Enroll Problems After First Attempt

In existing `ansMC()` and `ansFR()`, after determining correctness, enroll the problem:

```javascript
// In ansMC(), after scoring:
addToReview(p.id, ok);

// In ansFR(), after scoring:
addToReview(p.id, ok);
```

This means every problem the user attempts gets scheduled for future review.

---

### 3. Review Page UI

**File:** `stats_hub.html`

Add a new nav button in `.top-nav` (after the Practice button):
```html
<button class="nav-btn" onclick="goPage('review')" data-page="review">
  Review <span class="review-badge" id="reviewBadge" style="display:none;">0</span>
</button>
```

Add a new page section (after the practice section):
```html
<section id="pg-review" class="page" role="tabpanel" aria-label="Review">
  <header class="section-header">
    <p class="section-tag">Spaced Repetition</p>
    <h2 class="section-title">Review <em>Session</em></h2>
    <p class="section-desc" id="reviewDesc">Problems due for review will appear here.</p>
  </header>

  <div class="review-stats" id="reviewStats">
    <div class="review-stat">
      <span class="review-stat-num" id="reviewDueCount">0</span>
      <span class="review-stat-label">Due Today</span>
    </div>
    <div class="review-stat">
      <span class="review-stat-num" id="reviewTotalCount">0</span>
      <span class="review-stat-label">In Deck</span>
    </div>
    <div class="review-stat">
      <span class="review-stat-num" id="reviewMasteredCount">0</span>
      <span class="review-stat-label">Mastered</span>
    </div>
  </div>

  <div id="reviewContainer">
    <button class="start-review-btn" id="startReviewBtn" onclick="startReview()">
      Start Review Session
    </button>
  </div>

  <div id="reviewCard" style="display:none;">
    <div class="review-card-inner" id="reviewCardInner"></div>
    <div class="review-progress">
      <span id="reviewProgress">0 / 0</span>
    </div>
  </div>
</section>
```

### 4. Review Session Logic

**File:** `scripts/stats_hub.js`

```javascript
let reviewQueue=[];
let reviewIndex=0;
let reviewSessionCorrect=0;

function startReview(){
  const dueIds=getDueCards();
  if(dueIds.length===0){
    showToast('No cards due for review! Come back tomorrow.');
    return;
  }

  // Cap at 10 cards per session (ADHD-friendly: short sessions)
  reviewQueue=dueIds.slice(0,10);
  reviewIndex=0;
  reviewSessionCorrect=0;

  document.getElementById('startReviewBtn').style.display='none';
  document.getElementById('reviewCard').style.display='block';
  showReviewCard();
}

function showReviewCard(){
  if(reviewIndex>=reviewQueue.length){
    endReview();
    return;
  }

  const probId=reviewQueue[reviewIndex];
  // Find the problem across all units
  let prob=null;
  for(let u=1;u<=11;u++){
    prob=(allProbs[u]||[]).find(p=>p.id===probId);
    if(prob)break;
  }
  if(!prob){reviewIndex++;showReviewCard();return;}

  document.getElementById('reviewProgress').textContent=(reviewIndex+1)+' / '+reviewQueue.length;

  const card=document.getElementById('reviewCardInner');
  let html=`<div class="review-q">${prob.q}</div>`;
  if(prob.data)html+=`<div class="review-data">${prob.data}</div>`;

  if(prob.type==='mc'){
    html+='<div class="choices">';
    const L='ABCD';
    prob.ch.forEach((ch,j)=>{
      html+=`<div class="ch-btn" role="button" tabindex="0" onclick="reviewMC('${prob.id}',${j})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();reviewMC('${prob.id}',${j})}" id="rv-${prob.id}-${j}"><span class="lt">${L[j]}</span><span>${ch}</span></div>`;
    });
    html+='</div>';
  }else{
    html+=`<div class="fr-row"><input type="text" id="rv-fi-${prob.id}" placeholder="Your answer..." onkeydown="if(event.key==='Enter')reviewFR('${prob.id}')"><button onclick="reviewFR('${prob.id}')">Check</button></div>`;
  }

  html+=`<div class="fb" id="rv-fb-${prob.id}"><div class="fb-box" id="rv-fbx-${prob.id}"></div></div>`;
  card.innerHTML=html;
}

function reviewMC(probId, chosen){
  let prob=null;
  for(let u=1;u<=11;u++){prob=(allProbs[u]||[]).find(p=>p.id===probId);if(prob)break;}
  if(!prob)return;

  const ok=chosen===prob.ans;
  if(ok)reviewSessionCorrect++;

  // Show feedback
  prob.ch.forEach((_,j)=>{
    const el=document.getElementById('rv-'+probId+'-'+j);
    if(!el)return;
    el.classList.add('dis');
    el.setAttribute('aria-disabled','true');
    if(j===prob.ans)el.classList.add('right');
    else if(j===chosen&&!ok)el.classList.add('wrong');
  });

  const fb=document.getElementById('rv-fb-'+probId);
  const fbx=document.getElementById('rv-fbx-'+probId);
  if(fb)fb.classList.add('show');
  if(fbx){
    fbx.className='fb-box '+(ok?'fb-ok':'fb-no');
    fbx.textContent='';
    const s=document.createElement('strong');
    s.textContent=ok?'✓ Correct!':'✗ Not quite.';
    const sp=document.createElement('span');
    sp.className='ex';
    sp.textContent=prob.ex;
    fbx.appendChild(s);fbx.appendChild(sp);
  }

  // Update spaced repetition data
  reviewAnswer(probId, ok);
  awardXP(ok?XP_TABLE[prob.diff||'medium']:XP_TABLE.wrong, probId+'-review');
  recordActivity();

  // Auto-advance after delay
  setTimeout(()=>{reviewIndex++;showReviewCard();}, ok?1500:3000);
}

function reviewFR(probId){
  let prob=null;
  for(let u=1;u<=11;u++){prob=(allProbs[u]||[]).find(p=>p.id===probId);if(prob)break;}
  if(!prob)return;

  const inp=document.getElementById('rv-fi-'+probId);
  if(!inp)return;
  const v=parseFloat(inp.value);
  if(isNaN(v))return;

  const ok=Math.abs(v-prob.ans)<=(prob.tol||0.1);
  if(ok)reviewSessionCorrect++;

  inp.disabled=true;
  inp.style.borderColor=ok?'var(--green)':'var(--red)';

  const fb=document.getElementById('rv-fb-'+probId);
  const fbx=document.getElementById('rv-fbx-'+probId);
  if(fb)fb.classList.add('show');
  if(fbx){
    fbx.className='fb-box '+(ok?'fb-ok':'fb-no');
    fbx.textContent='';
    const s=document.createElement('strong');
    s.textContent=ok?'✓ Correct!':'✗ Not quite.';
    const sp=document.createElement('span');
    sp.className='ex';
    sp.textContent=ok?prob.ex:'Correct answer: '+prob.ans+'. '+prob.ex;
    fbx.appendChild(s);fbx.appendChild(sp);
  }

  reviewAnswer(probId, ok);
  awardXP(ok?XP_TABLE[prob.diff||'medium']:XP_TABLE.wrong, probId+'-review');
  recordActivity();

  setTimeout(()=>{reviewIndex++;showReviewCard();}, ok?1500:3000);
}

function endReview(){
  const card=document.getElementById('reviewCard');
  if(card)card.style.display='none';
  const btn=document.getElementById('startReviewBtn');
  if(btn){btn.style.display='';btn.textContent='Start Another Session';}

  const pct=reviewQueue.length?Math.round(reviewSessionCorrect/reviewQueue.length*100):0;
  showToast('Session complete! '+reviewSessionCorrect+'/'+reviewQueue.length+' correct ('+pct+'%)');

  // Bonus XP for completing a review session
  awardXP(10,'review-session');
  checkMilestones();
  updateReviewBadge();
}
```

### 5. Review Badge (Due Count in Nav)

```javascript
function updateReviewBadge(){
  const badge=document.getElementById('reviewBadge');
  if(!badge)return;
  const count=getDueCards().length;
  badge.textContent=count;
  badge.style.display=count>0?'inline-block':'none';

  // Also update review page stats
  const data=getReviewData();
  const total=Object.keys(data).length;
  const mastered=Object.values(data).filter(c=>c.interval>=30).length;
  setElText('reviewDueCount',count);
  setElText('reviewTotalCount',total);
  setElText('reviewMasteredCount',mastered);
}
```

Call `updateReviewBadge()` on page load and after any practice answer.

### 6. Update goPage()

In the `goPage()` function, add `'review'` to the list of valid pages. When navigating to review, call `updateReviewBadge()`.

---

### 7. Review-Specific Styles

**File:** `styles/stats_hub.css`

```css
/* Review badge in nav */
.review-badge{
  background:var(--pink);color:#fff;font-size:10px;font-weight:700;
  padding:1px 6px;border-radius:10px;margin-left:4px;
  font-family:'Space Mono',monospace;vertical-align:middle;
}

/* Review stats bar */
.review-stats{display:flex;gap:24px;justify-content:center;margin:24px 0;}
.review-stat{display:flex;flex-direction:column;align-items:center;gap:4px;}
.review-stat-num{font-size:28px;font-weight:700;color:var(--cyan);font-family:'Space Mono',monospace;}
.review-stat-label{font-size:12px;color:var(--muted);font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:1px;}

/* Start button */
.start-review-btn{
  display:block;margin:32px auto;padding:14px 32px;
  background:var(--cyan);color:var(--bg);border:none;border-radius:8px;
  font-family:'Space Mono',monospace;font-size:15px;font-weight:700;
  cursor:pointer;transition:background 0.2s,transform 0.1s;
}
.start-review-btn:hover{background:var(--amber);transform:scale(1.02);}
.start-review-btn:focus-visible{outline:2px solid var(--cyan);outline-offset:2px;}

/* Review card */
.review-card-inner{max-width:640px;margin:0 auto;padding:24px;}
.review-q{font-size:16px;line-height:1.6;margin-bottom:16px;}
.review-data{background:var(--bg2);padding:12px;border-radius:8px;margin-bottom:16px;font-family:'Space Mono',monospace;font-size:13px;}
.review-progress{text-align:center;margin-top:16px;font-size:13px;color:var(--muted);font-family:'Space Mono',monospace;}
```

---

### 8. Add Review Milestones

Add to the existing `MILESTONES` array (from Prompt I):

```javascript
{id:'review-10',   name:'Reviewer',     desc:'Complete 10 review sessions', icon:'🔄', check:d=>d.reviewSessions>=10},
{id:'review-50',   name:'Memory Master', desc:'Complete 50 review sessions', icon:'🧠', check:d=>d.reviewSessions>=50},
{id:'mastered-10', name:'Retention',     desc:'Master 10 cards (30+ day interval)', icon:'🏅', check:d=>d.mastered>=10},
```

Track review session count in XP history or a separate counter in `sh-review-meta`:
```javascript
// In endReview(), increment session counter:
const meta=JSON.parse(localStorage.getItem('sh-review-meta')||'{"sessions":0}');
meta.sessions++;
localStorage.setItem('sh-review-meta',JSON.stringify(meta));
```

Update `checkMilestones()` context to include:
```javascript
const reviewMeta=JSON.parse(localStorage.getItem('sh-review-meta')||'{"sessions":0}');
const reviewData=getReviewData();
const mastered=Object.values(reviewData).filter(c=>c.interval>=30).length;
// Add to ctx:
ctx.reviewSessions=reviewMeta.sessions;
ctx.mastered=mastered;
```

---

### 9. Update Export/Import

Add to `exportProgressJSON()`:
```javascript
payload.review=getReviewData();
payload.reviewMeta=JSON.parse(localStorage.getItem('sh-review-meta')||'null');
```

Add to `importProgressJSON()`:
```javascript
if(data.review&&typeof data.review==='object')localStorage.setItem('sh-review',JSON.stringify(data.review));
if(data.reviewMeta&&typeof data.reviewMeta==='object')localStorage.setItem('sh-review-meta',JSON.stringify(data.reviewMeta));
```

Add to reset functions:
```javascript
localStorage.removeItem('sh-review');
localStorage.removeItem('sh-review-meta');
```

---

## Constraints

- **NEVER modify** any file in `tests/`
- Guard all `document`/`window`/`localStorage` calls with `if(typeof X!=='undefined')`
- Only modify: `scripts/stats_hub.js`, `styles/stats_hub.css`, `stats_hub.html`
- Review mode must NOT interfere with Practice mode (separate state)
- The review auto-advance delay (1.5s correct, 3s wrong) is intentional for ADHD processing time
- Cap review sessions at 10 cards to prevent overwhelm
- Do not add npm dependencies

---

## Verification

```bash
node tests/run_all.js
```

**Expected:** 185/185 tests pass, 0 failures.

### Manual Verification

1. **Enrollment:** Answer a practice problem → it appears in review data (`localStorage sh-review`)
2. **Due count:** After problems are due → nav badge shows count (e.g., "3")
3. **Review session:** Click "Start Review Session" → see problem → answer → auto-advances
4. **Wrong answer:** Get one wrong → it comes back sooner (interval=1 day)
5. **Correct answer:** Get one right → interval grows (1→3→7→15→30+ days)
6. **Session end:** After 10 cards (or all due) → toast with score → bonus XP
7. **Mastered stat:** Cards with interval ≥30 show in "Mastered" count
8. **Review milestones:** Complete 10 review sessions → "Reviewer" badge earned
9. **Export/import:** Review data included in export and restored on import
10. **Reset:** Reset all → review data cleared
11. **No console errors** in any scenario
12. **Keyboard accessible:** Tab through review choices, Enter/Space to answer

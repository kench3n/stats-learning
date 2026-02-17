# Codex Prompt I — Phase 6a: Clickable Resources + ADHD Engagement Core

## Project Context

**Stats Learning Hub** is a single-page vanilla JS/HTML/CSS educational app. No frameworks, no npm deps, no build step. 185 tests via `node tests/run_all.js`. **NEVER modify files in `tests/`.**

### Key Files
- `stats_hub.html` — all markup
- `scripts/stats_hub.js` — all logic (~1450 lines)
- `styles/stats_hub.css` — all styles
- `tests/` — **SACRED. NEVER MODIFY.**

### Current State
- Roadmap resources are text-only: `{t:"Book", n:"Stewart — Precalculus"}` — no URLs
- Resources render as: `<div class="res-item"><div class="res-type">Book</div><div class="res-name">Stewart — Precalculus</div></div>`
- No streak, XP, badge, or daily tracking exists
- localStorage keys: `sh-practice-{1-11}`, `sh-topics`
- Export/import exists and must be updated to include new data

### ADHD Design Principles
The user has ADHD. Every feature must:
- Provide **immediate, visible feedback** (not delayed gratification)
- Use **short loops** (daily streaks, not monthly goals)
- Show **concrete progress** (numbers, bars, checkmarks — not vague encouragement)
- Create **micro-rewards** for small wins (not just big milestones)
- Avoid overwhelming UI — keep additions compact and optional

---

## Task 1: Make Roadmap Resources Clickable

### 1a: Add URLs to Resource Data

**File:** `scripts/stats_hub.js` (lines 92-137, the `RM` object)

Add a `url` field to every resource object. Use real, accurate URLs. Examples:

```javascript
// BEFORE
res:[{t:"Book",n:"Stewart — Precalculus"},{t:"Course",n:"Khan Academy — Algebra I & II"}]

// AFTER
res:[
  {t:"Book",n:"Stewart — Precalculus",url:"https://www.amazon.com/dp/1305071751"},
  {t:"Course",n:"Khan Academy — Algebra I & II",url:"https://www.khanacademy.org/math/algebra"}
]
```

**URL guidelines:**
- Books → Amazon product page or publisher page
- Courses → Official course landing page (Khan Academy, Coursera, MIT OCW, etc.)
- Videos → YouTube playlist or channel page (3Blue1Brown, StatQuest, etc.)
- Practice → Platform landing page (LeetCode, HackerRank, etc.)
- All URLs must be HTTPS
- Use the most stable/canonical URL available (avoid session-specific or affiliate links)

### 1b: Render Resources as Links

**File:** `scripts/stats_hub.js`, `buildRoadmap()` function (~line 161)

**Current:**
```javascript
(c.res||[]).forEach(r=>{html+=`<div class="res-item"><div class="res-type">${r.t}</div><div class="res-name">${r.n}</div></div>`;});
```

**Replace with:**
```javascript
(c.res||[]).forEach(r=>{
  if(r.url){
    html+=`<div class="res-item"><div class="res-type">${r.t}</div><a class="res-link" href="${r.url}" target="_blank" rel="noopener noreferrer">${r.n} ↗</a></div>`;
  }else{
    html+=`<div class="res-item"><div class="res-type">${r.t}</div><div class="res-name">${r.n}</div></div>`;
  }
});
```

### 1c: Style Resource Links

**File:** `styles/stats_hub.css`

Add after the existing `.res-name` styles:
```css
.res-link{color:var(--cyan);text-decoration:none;font-size:13px;transition:color 0.2s;}
.res-link:hover,.res-link:focus{color:var(--amber);text-decoration:underline;}
.res-link:focus-visible{outline:2px solid var(--cyan);outline-offset:2px;}
```

---

## Task 2: Study Streak System

### 2a: Streak Data Model

**File:** `scripts/stats_hub.js`

Add these functions for streak management:

```javascript
// localStorage key: 'sh-streak'
// Data format:
// {
//   current: 3,           // current streak count
//   longest: 7,           // all-time longest streak
//   lastDate: "2026-02-17", // last date user was active (YYYY-MM-DD)
//   history: ["2026-02-15","2026-02-16","2026-02-17"] // last 30 dates active
// }

function getStreakData(){
  if(typeof localStorage==='undefined')return{current:0,longest:0,lastDate:'',history:[]};
  try{return JSON.parse(localStorage.getItem('sh-streak')||'{}');}catch{return{};}
}

function saveStreakData(data){
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-streak',JSON.stringify(data));
}

function todayStr(){return new Date().toISOString().slice(0,10);}

function recordActivity(){
  const data=getStreakData();
  const today=todayStr();
  if(data.lastDate===today)return data; // already recorded today

  const yesterday=new Date();
  yesterday.setDate(yesterday.getDate()-1);
  const yesterdayStr=yesterday.toISOString().slice(0,10);

  if(data.lastDate===yesterdayStr){
    // Consecutive day — extend streak
    data.current=(data.current||0)+1;
  }else if(data.lastDate && data.lastDate!==today){
    // Missed a day — reset streak
    data.current=1;
  }else{
    // First ever activity
    data.current=1;
  }

  data.longest=Math.max(data.longest||0,data.current);
  data.lastDate=today;

  // Keep last 30 days of history
  if(!Array.isArray(data.history))data.history=[];
  if(!data.history.includes(today))data.history.push(today);
  if(data.history.length>30)data.history=data.history.slice(-30);

  saveStreakData(data);
  updateStreakDisplay();
  return data;
}
```

### 2b: Trigger Activity Recording

Call `recordActivity()` whenever the user does something meaningful:
- **Answers a problem** — in `ansMC()` and `ansFR()`, after scoring
- **Checks a roadmap topic** — in `toggleTopic()`, when checking (not unchecking)

```javascript
// In ansMC(), after pScore update:
recordActivity();

// In ansFR(), after pScore update:
recordActivity();

// In toggleTopic(), when marking done:
if(el.classList.contains('done')) recordActivity();
```

### 2c: Streak Display in Nav

**File:** `stats_hub.html`

Add a streak indicator in the top nav bar (after the existing topic count pill):

```html
<div class="nav-pill" id="streakPill" aria-label="Study streak">
  <span id="streakIcon">🔥</span>
  <span id="streakCount">0</span> day streak
</div>
```

**File:** `scripts/stats_hub.js`

```javascript
function updateStreakDisplay(){
  const data=getStreakData();
  const el=document.getElementById('streakCount');
  if(el)el.textContent=data.current||0;
  // Flame color based on streak length
  const icon=document.getElementById('streakIcon');
  if(icon){
    if(data.current>=7) icon.style.filter='hue-rotate(-10deg) brightness(1.3)'; // hot
    else if(data.current>=3) icon.style.filter=''; // normal
    else icon.style.filter='grayscale(0.5)'; // cool
  }
}
```

Call `updateStreakDisplay()` on page load (in the DOMContentLoaded handler).

### 2d: Style the Streak Pill

**File:** `styles/stats_hub.css`

```css
#streakPill{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--amber);font-family:'Space Mono',monospace;}
#streakIcon{font-size:16px;transition:filter 0.3s;}
```

---

## Task 3: XP System & Micro-Rewards

### 3a: XP Data Model

**File:** `scripts/stats_hub.js`

```javascript
// localStorage key: 'sh-xp'
// Data format: { total: 450, level: 5, history: [{date:"2026-02-17",earned:30,reason:"u3p5"}] }

// XP awards:
// Easy problem correct:    5 XP
// Medium problem correct: 10 XP
// Hard problem correct:   20 XP
// Wrong answer:            1 XP (reward effort, not just correctness)
// Roadmap topic checked:   3 XP
// Daily streak bonus:     streak_length * 2 XP (awarded once per day)

const XP_TABLE={easy:5,medium:10,hard:20,wrong:1,topic:3};
const XP_PER_LEVEL=50; // XP needed to advance one level

function getXPData(){
  if(typeof localStorage==='undefined')return{total:0,level:1,history:[]};
  try{return JSON.parse(localStorage.getItem('sh-xp')||'{"total":0,"level":1,"history":[]}');}catch{return{total:0,level:1,history:[]};}
}

function saveXPData(data){
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-xp',JSON.stringify(data));
}

function awardXP(amount,reason){
  if(typeof document==='undefined')return;
  const data=getXPData();
  const oldLevel=data.level;
  data.total+=amount;
  data.level=Math.floor(data.total/XP_PER_LEVEL)+1;

  // Keep last 100 history entries
  if(!Array.isArray(data.history))data.history=[];
  data.history.push({date:todayStr(),earned:amount,reason:reason});
  if(data.history.length>100)data.history=data.history.slice(-100);

  saveXPData(data);
  updateXPDisplay();

  // Show floating +XP animation
  showXPPopup('+'+amount+' XP');

  // Level up celebration
  if(data.level>oldLevel){
    showToast('Level Up! You are now Level '+data.level+' 🎉');
  }
}
```

### 3b: Integrate XP Awards

In `ansMC()`, after determining if answer is correct:
```javascript
const diff=p.diff||'medium';
awardXP(ok?XP_TABLE[diff]:XP_TABLE.wrong, p.id);
```

In `ansFR()`, same pattern:
```javascript
const diff=p.diff||'medium';
awardXP(ok?XP_TABLE[diff]:XP_TABLE.wrong, p.id);
```

In `toggleTopic()`, when checking a topic:
```javascript
if(el.classList.contains('done')) awardXP(XP_TABLE.topic, 'topic');
```

In `recordActivity()`, daily streak bonus (once per day):
```javascript
// After updating streak, award daily bonus
awardXP(data.current*2, 'streak-'+today);
```

### 3c: XP Display in Nav

**File:** `stats_hub.html`

Add after the streak pill:
```html
<div class="nav-pill" id="xpPill" aria-label="Experience points">
  <span class="xp-level" id="xpLevel">Lv 1</span>
  <div class="xp-bar-mini">
    <div class="xp-bar-fill" id="xpBarFill"></div>
  </div>
  <span class="xp-total" id="xpTotal">0 XP</span>
</div>
```

**File:** `scripts/stats_hub.js`

```javascript
function updateXPDisplay(){
  const data=getXPData();
  const el=document.getElementById('xpTotal');
  if(el)el.textContent=data.total+' XP';
  const lv=document.getElementById('xpLevel');
  if(lv)lv.textContent='Lv '+data.level;
  const bar=document.getElementById('xpBarFill');
  if(bar){
    const progress=(data.total%XP_PER_LEVEL)/XP_PER_LEVEL*100;
    bar.style.width=progress+'%';
  }
}
```

### 3d: Floating +XP Popup

**File:** `scripts/stats_hub.js`

```javascript
function showXPPopup(text){
  if(typeof document==='undefined')return;
  const popup=document.createElement('div');
  popup.className='xp-popup';
  popup.textContent=text;
  document.body.appendChild(popup);
  // Animate up and fade out
  requestAnimationFrame(()=>{popup.classList.add('xp-popup-show');});
  setTimeout(()=>{popup.remove();},1200);
}
```

**File:** `styles/stats_hub.css`

```css
/* XP pill in nav */
#xpPill{display:flex;align-items:center;gap:6px;font-size:12px;font-family:'Space Mono',monospace;}
.xp-level{color:var(--amber);font-weight:700;}
.xp-bar-mini{width:40px;height:6px;background:var(--bg2);border-radius:3px;overflow:hidden;}
.xp-bar-fill{height:100%;background:var(--cyan);border-radius:3px;transition:width 0.4s ease;}
.xp-total{color:var(--muted);font-size:11px;}

/* Floating XP popup */
.xp-popup{
  position:fixed;top:70px;right:20px;
  color:var(--amber);font-family:'Space Mono',monospace;font-size:18px;font-weight:700;
  opacity:0;transform:translateY(0);
  pointer-events:none;z-index:2000;
  transition:opacity 0.3s,transform 0.8s ease-out;
}
.xp-popup-show{opacity:1;transform:translateY(-40px);}
```

---

## Task 4: Milestone Badges

### 4a: Milestone Definitions

**File:** `scripts/stats_hub.js`

```javascript
const MILESTONES=[
  {id:'first-correct',   name:'First Blood',      desc:'Answer your first problem correctly', icon:'⚡', check:d=>d.totalCorrect>=1},
  {id:'streak-3',        name:'On a Roll',         desc:'3-day study streak',                  icon:'🔥', check:d=>d.streak>=3},
  {id:'streak-7',        name:'Week Warrior',      desc:'7-day study streak',                  icon:'💪', check:d=>d.streak>=7},
  {id:'streak-30',       name:'Monthly Master',    desc:'30-day study streak',                 icon:'👑', check:d=>d.streak>=30},
  {id:'unit-complete',   name:'Unit Clear',        desc:'Complete all problems in any unit',   icon:'✅', check:d=>d.unitsComplete>=1},
  {id:'all-units',       name:'Full Sweep',        desc:'Complete all 11 units',               icon:'🏆', check:d=>d.unitsComplete>=11},
  {id:'xp-100',          name:'Centurion',         desc:'Earn 100 XP',                         icon:'💯', check:d=>d.xp>=100},
  {id:'xp-500',          name:'Scholar',           desc:'Earn 500 XP',                         icon:'📚', check:d=>d.xp>=500},
  {id:'xp-1000',         name:'Expert',            desc:'Earn 1000 XP',                        icon:'🎓', check:d=>d.xp>=1000},
  {id:'topics-10',       name:'Pathfinder',        desc:'Check 10 roadmap topics',             icon:'🗺️', check:d=>d.topicsChecked>=10},
  {id:'topics-50',       name:'Navigator',         desc:'Check 50 roadmap topics',             icon:'🧭', check:d=>d.topicsChecked>=50},
  {id:'perfect-unit',    name:'Flawless',          desc:'100% correct on any unit',            icon:'💎', check:d=>d.perfectUnits>=1},
];
```

### 4b: Milestone Checking

```javascript
// localStorage key: 'sh-milestones'
// Data format: { "first-correct": "2026-02-17", "streak-3": "2026-02-18" }

function getMilestones(){
  if(typeof localStorage==='undefined')return{};
  try{return JSON.parse(localStorage.getItem('sh-milestones')||'{}');}catch{return{};}
}

function saveMilestones(data){
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-milestones',JSON.stringify(data));
}

function checkMilestones(){
  if(typeof document==='undefined')return;
  const earned=getMilestones();
  const streak=getStreakData();
  const xpData=getXPData();
  const summary=getProgressSummary();

  let totalCorrect=0, unitsComplete=0, perfectUnits=0;
  for(let u=1;u<=11;u++){
    const r=summary[u]||{total:0,correct:0};
    totalCorrect+=r.correct;
    if(r.total>0&&r.correct===r.total){unitsComplete++;perfectUnits++;}
    else if(r.total>0&&r.correct>=r.total*0.6)unitsComplete++; // 60% = "complete"
  }

  const topicsChecked=document.querySelectorAll('.ti.done').length||0;

  const ctx={
    totalCorrect, streak:streak.current||0, unitsComplete, perfectUnits,
    xp:xpData.total||0, topicsChecked
  };

  let newBadge=false;
  MILESTONES.forEach(m=>{
    if(!earned[m.id]&&m.check(ctx)){
      earned[m.id]=todayStr();
      newBadge=true;
      showToast(m.icon+' Badge Earned: '+m.name+' — '+m.desc);
    }
  });

  if(newBadge)saveMilestones(earned);
  updateMilestoneDisplay();
}
```

Call `checkMilestones()` after every `awardXP()` call and after `recordActivity()`.

### 4c: Milestone Display

Add a badge shelf to the progress panel in `stats_hub.html` (inside the existing `#progressPanel`):

```html
<div class="milestone-shelf" id="milestoneShelf">
  <h3 class="milestone-title">Badges</h3>
  <div class="milestone-grid" id="milestoneGrid"></div>
</div>
```

```javascript
function updateMilestoneDisplay(){
  const grid=document.getElementById('milestoneGrid');
  if(!grid)return;
  const earned=getMilestones();
  let html='';
  MILESTONES.forEach(m=>{
    const unlocked=!!earned[m.id];
    html+=`<div class="milestone-badge ${unlocked?'unlocked':'locked'}" title="${m.name}: ${m.desc}">
      <span class="badge-icon">${unlocked?m.icon:'🔒'}</span>
      <span class="badge-name">${m.name}</span>
    </div>`;
  });
  grid.innerHTML=html;
}
```

**File:** `styles/stats_hub.css`

```css
.milestone-shelf{margin-top:16px;padding-top:16px;border-top:1px solid var(--border);}
.milestone-title{font-size:14px;color:var(--text);margin-bottom:8px;font-family:'Space Mono',monospace;}
.milestone-grid{display:flex;flex-wrap:wrap;gap:8px;}
.milestone-badge{
  display:flex;flex-direction:column;align-items:center;gap:2px;
  width:64px;padding:8px 4px;border-radius:8px;
  background:var(--bg2);border:1px solid var(--border);
  font-size:10px;text-align:center;transition:transform 0.2s,border-color 0.2s;
}
.milestone-badge.unlocked{border-color:var(--amber);}
.milestone-badge.unlocked:hover{transform:scale(1.1);}
.milestone-badge.locked{opacity:0.4;filter:grayscale(0.8);}
.badge-icon{font-size:24px;}
.badge-name{color:var(--muted);font-family:'Space Mono',monospace;line-height:1.2;}
```

---

## Task 5: Update Export/Import

**File:** `scripts/stats_hub.js`

Update `exportProgressJSON()` (~line 1362) to include new data:

```javascript
// Add to payload object:
payload.streak=getStreakData();
payload.xp=getXPData();
payload.milestones=getMilestones();
```

Update `importProgressJSON()` (~line 1435) to restore new data:

```javascript
// After restoring practice and topics:
if(data.streak&&typeof data.streak==='object')localStorage.setItem('sh-streak',JSON.stringify(data.streak));
if(data.xp&&typeof data.xp==='object')localStorage.setItem('sh-xp',JSON.stringify(data.xp));
if(data.milestones&&typeof data.milestones==='object')localStorage.setItem('sh-milestones',JSON.stringify(data.milestones));
```

Update reset functions to also clear new keys:
```javascript
localStorage.removeItem('sh-streak');
localStorage.removeItem('sh-xp');
localStorage.removeItem('sh-milestones');
```

---

## Constraints

- **NEVER modify** any file in `tests/`
- Guard all `document`/`window`/`localStorage`/`navigator` calls with `if(typeof X!=='undefined')`
- Only modify: `scripts/stats_hub.js`, `styles/stats_hub.css`, `stats_hub.html`
- Do not add npm dependencies
- Do not break existing functionality
- All emoji usage is intentional for ADHD engagement — keep them

---

## Verification

```bash
node tests/run_all.js
```

**Expected:** 185/185 tests pass, 0 failures.

### Manual Verification

1. **Resources:** Click a roadmap resource → opens correct URL in new tab
2. **Streak:** Answer a problem → streak pill shows "1 day streak" with 🔥
3. **XP:** Answer a problem → see floating "+10 XP" animation → XP bar advances
4. **Level up:** Earn 50 XP → toast says "Level Up! You are now Level 2"
5. **Badges:** Answer first problem correctly → toast shows "⚡ Badge Earned: First Blood"
6. **Badge shelf:** Open progress panel → see badge grid with unlocked/locked badges
7. **Export:** Export progress → JSON includes streak, xp, milestones
8. **Import:** Import that JSON → all data restored
9. **Reset:** Reset all progress → streak, XP, milestones all cleared
10. **No console errors** in any scenario

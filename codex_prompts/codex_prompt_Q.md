# Codex Prompt Q — Phase 13: Daily Challenges, Weekly Goals, Achievement Showcase

## Project Context

Stats Learning Hub — single-page vanilla JS/HTML/CSS. NEVER modify `tests/`. XP, streak, milestones, review, weak spots all exist. Units now go up to 14.

---

## Task 1: Daily Challenges

A fresh challenge each day gives ADHD users a reason to come back. Deterministic per date (same challenge for everyone on the same day).

### 1a: Daily Challenge Generator

**File:** `scripts/stats_hub.js`

```javascript
function getDailyChallenge(){
  // Deterministic seed from today's date
  const today=todayStr();
  const seed=today.split('-').reduce((a,b)=>a*31+parseInt(b),0);

  // Collect all problem IDs across all units
  const allIds=[];
  for(const u in allProbs)(allProbs[u]||[]).forEach(p=>allIds.push(p.id));
  if(!allIds.length)return null;

  // Pick 3 problems deterministically
  const challenges=[];
  for(let i=0;i<3;i++){
    const idx=(seed*7+i*13)%allIds.length;
    const id=allIds[Math.abs(idx)];
    let prob=null;
    for(const u in allProbs){prob=(allProbs[u]||[]).find(p=>p.id===id);if(prob)break;}
    if(prob)challenges.push(prob);
  }

  return{date:today,problems:challenges};
}

function getDailyChallengeState(){
  if(typeof localStorage==='undefined')return{};
  try{return JSON.parse(localStorage.getItem('sh-daily')||'{}');}catch{return{};}
}

function saveDailyChallengeState(state){
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-daily',JSON.stringify(state));
}

function completeDailyChallenge(){
  const state=getDailyChallengeState();
  const today=todayStr();
  if(!state.completed)state.completed={};
  state.completed[today]=true;
  state.totalCompleted=(state.totalCompleted||0)+1;
  saveDailyChallengeState(state);
  awardXP(25,'daily-challenge-'+today);
  showToast('Daily Challenge complete! +25 XP 🏅');
  checkMilestones();
}
```

### 1b: Daily Challenge UI

Add to the home page digest panel or as a separate card:

```html
<div class="daily-challenge" id="dailyChallenge" style="display:none;">
  <div class="dc-header">
    <span class="dc-title">⚡ Daily Challenge</span>
    <span class="dc-date" id="dcDate"></span>
  </div>
  <div class="dc-problems" id="dcProblems"></div>
  <div class="dc-status" id="dcStatus"></div>
</div>
```

Render 3 mini problem cards. When all 3 are answered correctly, trigger `completeDailyChallenge()`.

### 1c: Daily Challenge Styles

```css
.daily-challenge{
  max-width:640px;margin:0 auto 24px;padding:20px;
  background:var(--bg2);border:1px solid var(--amber);border-radius:12px;
}
.dc-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
.dc-title{font-size:15px;font-weight:700;color:var(--amber);font-family:'Space Mono',monospace;}
.dc-date{font-size:12px;color:var(--muted);font-family:'Space Mono',monospace;}
.dc-status{text-align:center;margin-top:12px;font-size:13px;color:var(--green);font-family:'Space Mono',monospace;}
```

---

## Task 2: Weekly Goals

Set automatic weekly goals based on the user's pace. Goals create structure without overwhelming.

### 2a: Weekly Goal System

**File:** `scripts/stats_hub.js`

```javascript
function getWeekStart(){
  const d=new Date();d.setDate(d.getDate()-d.getDay());
  return d.toISOString().slice(0,10);
}

function getWeeklyGoals(){
  const weekStart=getWeekStart();
  const stored=typeof localStorage!=='undefined'?JSON.parse(localStorage.getItem('sh-weekly')||'{}'):{};

  // Generate goals if new week
  if(stored.weekStart!==weekStart){
    const streak=getStreakData();
    const xp=getXPData();
    // Scale goals based on user's pace
    const pace=Math.max(1,Math.min(5,Math.floor((xp.total||0)/200)+1));

    stored.weekStart=weekStart;
    stored.goals=[
      {id:'problems',target:pace*5,label:'Answer '+pace*5+' problems',current:0},
      {id:'streak',target:Math.min(7,pace+2),label:'Maintain a '+Math.min(7,pace+2)+'-day streak',current:streak.current||0},
      {id:'review',target:pace*2,label:'Complete '+pace*2+' review sessions',current:0},
    ];
    stored.completed=false;
    if(typeof localStorage!=='undefined')localStorage.setItem('sh-weekly',JSON.stringify(stored));
  }

  return stored;
}

function updateWeeklyProgress(goalId,increment){
  const data=getWeeklyGoals();
  const goal=data.goals.find(g=>g.id===goalId);
  if(!goal)return;
  goal.current+=increment;

  // Check if all goals met
  const allMet=data.goals.every(g=>g.current>=g.target);
  if(allMet&&!data.completed){
    data.completed=true;
    awardXP(50,'weekly-goals');
    showToast('All weekly goals complete! +50 XP 🎯');
  }

  if(typeof localStorage!=='undefined')localStorage.setItem('sh-weekly',JSON.stringify(data));
}
```

Integrate: call `updateWeeklyProgress('problems',1)` in ansMC/ansFR, `updateWeeklyProgress('review',1)` in endReview.

### 2b: Weekly Goals Display

Add to home page digest:

```html
<div class="weekly-goals" id="weeklyGoals">
  <h4 class="wg-title">📅 This Week</h4>
  <div id="wgList"></div>
</div>
```

Render each goal as a progress bar with current/target.

---

## Task 3: Achievement Showcase Page

A dedicated page to view all badges, stats, and history. Gives a sense of accomplishment.

### 3a: Add Showcase Nav Button

**File:** `stats_hub.html` — add nav button for achievements page:

```html
<button class="nav-btn" onclick="goPage('achievements')" data-page="achievements">Achievements</button>
```

### 3b: Achievements Page HTML

```html
<section id="pg-achievements" class="page" role="tabpanel" aria-label="Achievements">
  <header class="section-header">
    <p class="section-tag">Your Progress</p>
    <h2 class="section-title">Achievement <em>Showcase</em></h2>
  </header>

  <div class="achieve-stats" id="achieveStats"></div>
  <div class="achieve-badges" id="achieveBadges">
    <h3>Badges</h3>
    <div id="achieveBadgeGrid"></div>
  </div>
  <div class="achieve-history" id="achieveHistory">
    <h3>Activity Heatmap</h3>
    <div class="heatmap" id="heatmapGrid"></div>
  </div>
</section>
```

### 3c: Activity Heatmap

Render a GitHub-style activity heatmap showing the last 90 days of study activity:

```javascript
function buildHeatmap(){
  const grid=document.getElementById('heatmapGrid');
  if(!grid)return;
  const streak=getStreakData();
  const history=streak.history||[];
  const today=new Date();
  let html='';

  for(let i=89;i>=0;i--){
    const d=new Date(today);d.setDate(d.getDate()-i);
    const dateStr=d.toISOString().slice(0,10);
    const active=history.includes(dateStr);
    const cls=active?'heatmap-active':'heatmap-empty';
    html+=`<div class="heatmap-cell ${cls}" title="${dateStr}"></div>`;
  }
  grid.innerHTML=html;
}
```

### 3d: Heatmap Styles

```css
.heatmap{display:flex;flex-wrap:wrap;gap:3px;max-width:500px;}
.heatmap-cell{width:12px;height:12px;border-radius:2px;background:var(--bg2);border:1px solid var(--border);}
.heatmap-active{background:var(--cyan);border-color:var(--cyan);}
```

---

## Constraints

- NEVER modify `tests/`. Guard all DOM/localStorage calls.
- Daily challenges must be deterministic (same 3 problems for same date).
- Weekly goals auto-reset each Sunday.
- Achievement page must work with `goPage()` navigation system.
- Heatmap must handle sparse data gracefully.

## Verification

```bash
node tests/run_all.js
```
Expected: 185/185 pass. Manual: daily challenge renders 3 problems, weekly goals track progress, heatmap shows activity dots, achievements page loads all badges.

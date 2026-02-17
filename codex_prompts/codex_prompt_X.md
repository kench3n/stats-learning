# Codex Prompt X — Phase 20: Learning Paths, Goals/Deadlines, Completion Certificates

## Project Context

Stats Learning Hub — single-page vanilla JS/HTML/CSS. NEVER modify `tests/`. All prior systems (XP, milestones, achievements, weekly goals, analytics) exist.

---

## Task 1: Customizable Learning Paths

Pre-defined and custom paths through the material. Reduces ADHD overwhelm by providing clear sequences.

### 1a: Path Definitions

**File:** `scripts/stats_hub.js`

```javascript
const LEARNING_PATHS={
  'quick-start':{
    name:'Quick Start',
    desc:'Core stats in 5 units — perfect for beginners',
    icon:'🚀',
    units:[1,2,5,8,9],
    estimatedHours:10,
  },
  'full-course':{
    name:'Full Course',
    desc:'All 14 units in sequence',
    icon:'📚',
    units:[1,2,3,4,5,6,7,8,9,10,11,12,13,14],
    estimatedHours:40,
  },
  'quant-prep':{
    name:'Quant Finance Prep',
    desc:'Focus on probability, distributions, and inference',
    icon:'📈',
    units:[5,6,7,2,8,9,11,14],
    estimatedHours:20,
  },
  'exam-cram':{
    name:'Exam Cram',
    desc:'Hit the high-value topics fast',
    icon:'⚡',
    units:[1,2,8,9,11],
    estimatedHours:8,
  },
};

// localStorage key: 'sh-active-path'
// Data: { pathId:'quick-start', startDate:'2026-02-17', currentStep:2 }
```

### 1b: Path Selection UI

Add a path selector to the home page (or as a first-time setup modal):

```html
<div class="path-section" id="pathSection">
  <h3>Choose Your Learning Path</h3>
  <div class="path-grid" id="pathGrid"></div>
  <div class="active-path" id="activePath" style="display:none;">
    <div class="path-progress-bar"><div class="path-progress-fill" id="pathFill"></div></div>
    <span id="pathStatus">Unit 1 of 5</span>
    <button class="path-next-btn" id="pathNextBtn" onclick="goToPathUnit()">Continue →</button>
  </div>
</div>
```

### 1c: Path Logic

```javascript
function selectPath(pathId){
  const path=LEARNING_PATHS[pathId];
  if(!path)return;
  const data={pathId,startDate:todayStr(),currentStep:0};
  localStorage.setItem('sh-active-path',JSON.stringify(data));
  showToast('Started: '+path.name);
  updatePathDisplay();
}

function getActivePath(){
  try{return JSON.parse(localStorage.getItem('sh-active-path')||'null');}catch{return null;}
}

function advancePath(){
  const data=getActivePath();
  if(!data)return;
  const path=LEARNING_PATHS[data.pathId];
  if(!path)return;
  data.currentStep=Math.min(data.currentStep+1,path.units.length-1);
  localStorage.setItem('sh-active-path',JSON.stringify(data));
  updatePathDisplay();
}

function goToPathUnit(){
  const data=getActivePath();
  if(!data)return;
  const path=LEARNING_PATHS[data.pathId];
  if(!path)return;
  const unit=path.units[data.currentStep];
  goPage('practice');setUnit(unit);
}

function updatePathDisplay(){
  const data=getActivePath();
  const section=document.getElementById('activePath');
  if(!data||!section)return;
  const path=LEARNING_PATHS[data.pathId];
  if(!path){section.style.display='none';return;}
  section.style.display='';
  const pct=((data.currentStep+1)/path.units.length)*100;
  document.getElementById('pathFill').style.width=pct+'%';
  setElText('pathStatus','Unit '+(data.currentStep+1)+' of '+path.units.length+': '+UNIT_META[path.units[data.currentStep]].name);
}
```

Auto-advance when a unit is completed (all problems answered with ≥60% accuracy).

---

## Task 2: Goals & Deadlines

Let users set target completion dates. ADHD users benefit from external deadlines.

### 2a: Goal Setting UI

```html
<div class="goal-section" id="goalSection">
  <h3>🎯 Set a Goal</h3>
  <label>I want to finish my path by:
    <input type="date" id="goalDate" onchange="setGoal()">
  </label>
  <div class="goal-countdown" id="goalCountdown" style="display:none;">
    <span class="goal-days" id="goalDays">0</span> days remaining
    <div class="goal-pace" id="goalPace"></div>
  </div>
</div>
```

### 2b: Goal Logic

```javascript
// localStorage key: 'sh-goal'
function setGoal(){
  const date=document.getElementById('goalDate')?.value;
  if(!date)return;
  localStorage.setItem('sh-goal',date);
  updateGoalDisplay();
}

function updateGoalDisplay(){
  const goalDate=localStorage.getItem('sh-goal');
  if(!goalDate)return;
  const remaining=Math.ceil((new Date(goalDate)-new Date())/(1000*60*60*24));
  setElText('goalDays',Math.max(0,remaining));
  document.getElementById('goalCountdown').style.display='';

  // Calculate required pace
  const data=getActivePath();
  if(data){
    const path=LEARNING_PATHS[data.pathId];
    if(path){
      const unitsLeft=path.units.length-data.currentStep;
      const pace=remaining>0?Math.ceil(unitsLeft/remaining*7):0;
      setElText('goalPace','Pace needed: ~'+pace+' units/week');
    }
  }
}
```

---

## Task 3: Completion Certificates

Generate a certificate when a learning path is completed. Tangible achievement = dopamine hit.

### 3a: Certificate Generator

```javascript
function generateCertificate(){
  const data=getActivePath();
  if(!data)return;
  const path=LEARNING_PATHS[data.pathId];
  if(!path)return;

  // Check completion
  const summary=getProgressSummary();
  const allComplete=path.units.every(u=>{
    const r=summary[u]||{total:0,correct:0};
    return r.total>0&&r.correct/r.total>=0.6;
  });
  if(!allComplete){showToast('Complete all units in your path first!');return;}

  // Generate certificate in new window
  const today=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  const xp=getXPData();
  const streak=getStreakData();

  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Certificate of Completion</title>
    <style>
      body{font-family:Georgia,serif;text-align:center;padding:60px;background:#fffef5;color:#1a1a2e;}
      .cert{border:4px double #1a1a2e;padding:60px;max-width:700px;margin:0 auto;}
      h1{font-size:32px;margin-bottom:8px;letter-spacing:2px;}
      .subtitle{font-size:14px;color:#666;letter-spacing:4px;text-transform:uppercase;margin-bottom:40px;}
      .name{font-size:24px;font-style:italic;margin:20px 0;color:#0095a3;}
      .path{font-size:18px;margin:10px 0;}
      .stats{display:flex;justify-content:center;gap:40px;margin:30px 0;font-size:14px;color:#666;}
      .date{margin-top:40px;font-size:14px;color:#666;}
      .seal{font-size:48px;margin:20px 0;}
    </style></head><body>
    <div class="cert">
      <div class="seal">🎓</div>
      <h1>Certificate of Completion</h1>
      <div class="subtitle">Stats Learning Hub</div>
      <div class="path">${path.name}</div>
      <div class="name">${path.units.length} Units Completed</div>
      <div class="stats">
        <span>Level ${xp.level}</span>
        <span>${xp.total} XP</span>
        <span>Best Streak: ${streak.longest} days</span>
      </div>
      <div class="date">${today}</div>
    </div>
    <script>window.onload=function(){window.print();}</script>
    </body></html>`;

  const win=window.open('','_blank');
  if(win){win.document.write(html);win.document.close();}
  awardXP(100,'certificate');
  showToast('Congratulations! Certificate generated. 🎓');
}
```

Add a "Get Certificate" button that appears when path is complete.

---

## Constraints

- NEVER modify `tests/`. Guard all DOM/localStorage calls.
- Learning paths must not break existing unit navigation.
- Goals stored in localStorage — no server.
- Certificate opens in new window for printing — no external service.
- Path auto-advance only triggers when unit is genuinely complete (≥60% accuracy).

## Verification

```bash
node tests/run_all.js
```
Expected: 185/185 pass. Manual: select a learning path, follow units in order, set a deadline, complete path, generate certificate.

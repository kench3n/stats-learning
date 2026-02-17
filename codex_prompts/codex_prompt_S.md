# Codex Prompt S — Phase 15: Analytics Dashboard, PDF Export, Study Calendar

## Project Context

Stats Learning Hub — single-page vanilla JS/HTML/CSS. NEVER modify `tests/`. All engagement systems, weekly goals, session tracking exist.

---

## Task 1: Analytics Dashboard

A visual dashboard showing learning trends over time. Seeing progress graphs is deeply motivating for ADHD learners.

### 1a: Add Analytics to Achievements Page

Extend the achievements page with a canvas-based analytics section.

**File:** `stats_hub.html` — add inside `pg-achievements`:

```html
<div class="analytics-section">
  <h3>📈 Learning Analytics</h3>
  <div class="analytics-tabs">
    <button class="analytics-tab active" onclick="showAnalytics('accuracy')">Accuracy</button>
    <button class="analytics-tab" onclick="showAnalytics('xp')">XP Over Time</button>
    <button class="analytics-tab" onclick="showAnalytics('units')">Unit Breakdown</button>
  </div>
  <canvas id="analyticsCanvas" width="600" height="300" aria-label="Analytics chart" role="img"></canvas>
</div>
```

### 1b: Chart Rendering

**File:** `scripts/stats_hub.js`

Create simple canvas-based charts (no libraries):

```javascript
function showAnalytics(type){
  document.querySelectorAll('.analytics-tab').forEach(t=>t.classList.remove('active'));
  event.target.classList.add('active');

  if(type==='accuracy')drawAccuracyChart();
  else if(type==='xp')drawXPChart();
  else if(type==='units')drawUnitBreakdown();
}

function drawAccuracyChart(){
  // Bar chart: accuracy per unit
  const canvas=document.getElementById('analyticsCanvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const w=canvas.width,h=canvas.height;
  ctx.clearRect(0,0,w,h);

  const summary=getProgressSummary();
  const units=Object.keys(UNIT_META).map(Number);
  const barW=Math.floor((w-60)/units.length)-4;

  units.forEach((u,i)=>{
    const r=summary[u]||{total:0,correct:0};
    const pct=r.total?r.correct/r.total:0;
    const x=40+i*(barW+4);
    const barH=pct*(h-60);

    // Bar
    ctx.fillStyle=pct>=0.8?'#00e5c7':pct>=0.5?'#ffbf00':'#ff4081';
    ctx.fillRect(x,h-30-barH,barW,barH);

    // Label
    ctx.fillStyle='#888';
    ctx.font='10px Space Mono';
    ctx.textAlign='center';
    ctx.fillText('U'+u,x+barW/2,h-16);
    ctx.fillText(Math.round(pct*100)+'%',x+barW/2,h-34-barH);
  });
}

function drawXPChart(){
  // Line chart: cumulative XP from history
  const canvas=document.getElementById('analyticsCanvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const w=canvas.width,h=canvas.height;
  ctx.clearRect(0,0,w,h);

  const xpData=getXPData();
  const hist=xpData.history||[];
  if(!hist.length)return;

  // Group XP by date
  const byDate={};
  hist.forEach(e=>{byDate[e.date]=(byDate[e.date]||0)+e.earned;});
  const dates=Object.keys(byDate).sort();
  const last30=dates.slice(-30);

  let cumulative=0;
  const points=last30.map(d=>{cumulative+=byDate[d];return{date:d,total:cumulative};});
  const maxXP=Math.max(...points.map(p=>p.total),1);

  // Draw line
  ctx.strokeStyle='#00e5c7';
  ctx.lineWidth=2;
  ctx.beginPath();
  points.forEach((p,i)=>{
    const x=40+i*((w-60)/Math.max(points.length-1,1));
    const y=h-30-(p.total/maxXP)*(h-60);
    if(i===0)ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  });
  ctx.stroke();

  // Dots
  ctx.fillStyle='#00e5c7';
  points.forEach((p,i)=>{
    const x=40+i*((w-60)/Math.max(points.length-1,1));
    const y=h-30-(p.total/maxXP)*(h-60);
    ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();
  });
}

function drawUnitBreakdown(){
  // Horizontal stacked bar: correct/wrong/unanswered per unit
  // Similar canvas drawing pattern
}
```

---

## Task 2: PDF Export of Practice Problems

Let users print or save problems as a clean PDF. Study on paper, come back to check answers.

### 2a: Print-Optimized View

**File:** `scripts/stats_hub.js`

```javascript
function exportPracticePDF(unit){
  // Open a new window with print-friendly HTML
  const probs=allProbs[unit]||[];
  if(!probs.length){showToast('No problems for this unit.');return;}

  let html=`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Stats Hub — Unit ${unit}: ${UNIT_META[unit].name}</title>
    <style>
      body{font-family:'DM Sans',sans-serif;color:#111;padding:40px;max-width:700px;margin:0 auto;line-height:1.6;}
      h1{font-size:20px;border-bottom:2px solid #111;padding-bottom:8px;}
      .prob{margin-bottom:24px;page-break-inside:avoid;}
      .prob-head{display:flex;gap:12px;font-size:13px;color:#555;margin-bottom:4px;}
      .prob-q{font-size:14px;margin-bottom:8px;}
      .choices{margin-left:20px;}
      .choice{margin:4px 0;font-size:13px;}
      .answer{margin-top:12px;padding:8px 12px;background:#f0f0f0;border-radius:4px;font-size:12px;}
      .formula-ref{margin-top:32px;border-top:2px solid #111;padding-top:16px;}
      .formula-row{display:flex;justify-content:space-between;padding:4px 0;font-size:12px;border-bottom:1px solid #ddd;}
    </style></head><body>
    <h1>Unit ${unit}: ${UNIT_META[unit].name}</h1>`;

  probs.forEach((p,i)=>{
    html+=`<div class="prob"><div class="prob-head"><span>#${i+1}</span><span>${p.diff}</span><span>${p.topic}</span></div>`;
    html+=`<div class="prob-q">${p.q}</div>`;
    if(p.data)html+=`<div style="background:#f5f5f5;padding:8px;border-radius:4px;font-size:12px;margin-bottom:8px;">${p.data}</div>`;
    if(p.type==='mc'){
      html+='<div class="choices">';
      const L='ABCD';
      p.ch.forEach((c,j)=>{html+=`<div class="choice">${L[j]}. ${c}</div>`;});
      html+='</div>';
    }else{
      html+='<div style="border:1px solid #ccc;padding:8px;border-radius:4px;min-height:30px;margin-top:8px;color:#999;">Your answer:</div>';
    }
    html+=`<div class="answer"><strong>Answer:</strong> ${p.type==='mc'?'ABCD'[p.ans]:p.ans}<br><strong>Explanation:</strong> ${p.ex}</div></div>`;
  });

  // Add formula reference
  const formulas=FORMULAS[unit]||[];
  if(formulas.length){
    html+='<div class="formula-ref"><h2>Formula Reference</h2>';
    formulas.forEach(f=>{html+=`<div class="formula-row"><span>${f.name}</span><span>${f.formula}</span></div>`;});
    html+='</div>';
  }

  html+='</body></html>';

  const win=window.open('','_blank');
  if(win){win.document.write(html);win.document.close();win.print();}
}
```

### 2b: Export Button

Add to practice section header:
```html
<button class="export-pdf-btn" onclick="exportPracticePDF(currentUnit)" aria-label="Export problems as PDF">🖨 Export PDF</button>
```

---

## Task 3: Study Calendar

A calendar view showing planned study sessions and completed days. Helps ADHD users build routine.

### 3a: Calendar UI

Add to achievements page:

```html
<div class="calendar-section">
  <h3>📅 Study Calendar</h3>
  <div class="cal-nav">
    <button onclick="calPrev()">◀</button>
    <span id="calMonth"></span>
    <button onclick="calNext()">▶</button>
  </div>
  <div class="cal-grid" id="calGrid"></div>
</div>
```

### 3b: Calendar Rendering

```javascript
let calDate=new Date();

function buildCalendar(){
  const grid=document.getElementById('calGrid');
  const monthLabel=document.getElementById('calMonth');
  if(!grid||!monthLabel)return;

  const year=calDate.getFullYear(), month=calDate.getMonth();
  monthLabel.textContent=calDate.toLocaleString('default',{month:'long',year:'numeric'});

  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const streak=getStreakData();
  const history=streak.history||[];

  let html='<div class="cal-header">Su</div><div class="cal-header">Mo</div><div class="cal-header">Tu</div><div class="cal-header">We</div><div class="cal-header">Th</div><div class="cal-header">Fr</div><div class="cal-header">Sa</div>';

  for(let i=0;i<firstDay;i++)html+='<div class="cal-cell empty"></div>';

  for(let d=1;d<=daysInMonth;d++){
    const dateStr=year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const active=history.includes(dateStr);
    const isToday=dateStr===todayStr();
    html+=`<div class="cal-cell ${active?'cal-active':''} ${isToday?'cal-today':''}">${d}</div>`;
  }
  grid.innerHTML=html;
}

function calPrev(){calDate.setMonth(calDate.getMonth()-1);buildCalendar();}
function calNext(){calDate.setMonth(calDate.getMonth()+1);buildCalendar();}
```

### 3c: Calendar Styles

```css
.cal-nav{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:12px;}
.cal-nav button{background:none;border:1px solid var(--border);color:var(--text);padding:4px 10px;border-radius:4px;cursor:pointer;}
.cal-nav span{font-family:'Space Mono',monospace;font-size:14px;color:var(--text);}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;max-width:320px;margin:0 auto;}
.cal-header{font-size:11px;color:var(--muted);text-align:center;font-family:'Space Mono',monospace;padding:4px;}
.cal-cell{
  aspect-ratio:1;display:flex;align-items:center;justify-content:center;
  border-radius:6px;font-size:12px;color:var(--muted);background:var(--bg2);
  font-family:'Space Mono',monospace;
}
.cal-cell.empty{background:transparent;}
.cal-active{background:var(--cyan);color:var(--bg);font-weight:700;}
.cal-today{border:2px solid var(--amber);}
```

---

## Constraints

- NEVER modify `tests/`. Guard all DOM calls.
- PDF export opens in new window, uses `window.print()` — no server needed.
- Analytics charts use Canvas 2D (consistent with existing visualizers).
- Calendar must handle month boundaries correctly.

## Verification

```bash
node tests/run_all.js
```
Expected: 185/185 pass. Manual: check accuracy chart per unit, XP timeline, PDF print preview, calendar month navigation with active days highlighted.

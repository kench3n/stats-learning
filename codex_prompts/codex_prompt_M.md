# Codex Prompt M — Phase 9: Formula Reference, Hint System, Celebration Animations

## Project Context

Stats Learning Hub — single-page vanilla JS/HTML/CSS. 185 tests via `node tests/run_all.js`. NEVER modify `tests/`. All prior systems (streak, XP, milestones, review, digest, timer, theme, shortcuts) exist.

---

## Task 1: Formula Quick-Reference Sheet

A collapsible formula reference per unit, always accessible. ADHD learners need formulas at their fingertips — looking them up breaks flow.

### 1a: Formula Data

**File:** `scripts/stats_hub.js`

```javascript
const FORMULAS={
  1:[
    {name:'Mean',formula:'x̄ = Σxᵢ / n'},
    {name:'Median',formula:'Middle value of sorted data'},
    {name:'Mode',formula:'Most frequent value'},
    {name:'Range',formula:'max − min'},
    {name:'Variance',formula:'σ² = Σ(xᵢ − x̄)² / n'},
    {name:'Std Dev',formula:'σ = √(σ²)'},
    {name:'IQR',formula:'Q3 − Q1'},
    {name:'Z-score',formula:'z = (x − x̄) / σ'},
  ],
  2:[
    {name:'Z-score',formula:'z = (x − μ) / σ'},
    {name:'Normal PDF',formula:'f(x) = (1/σ√2π) e^(−(x−μ)²/2σ²)'},
    {name:'Empirical Rule',formula:'68-95-99.7% within 1,2,3σ'},
  ],
  3:[
    {name:'Correlation',formula:'r = Σ(zₓ·zᵧ) / (n−1)'},
    {name:'Regression Line',formula:'ŷ = a + bx'},
    {name:'Slope',formula:'b = r(sᵧ/sₓ)'},
    {name:'R²',formula:'Proportion of variance explained'},
  ],
  4:[
    {name:'Sampling Error',formula:'SE = σ / √n'},
    {name:'Bias',formula:'Systematic error in sampling method'},
  ],
  5:[
    {name:'P(A or B)',formula:'P(A) + P(B) − P(A∩B)'},
    {name:'P(A and B)',formula:'P(A) · P(B|A)'},
    {name:'P(A|B)',formula:'P(A∩B) / P(B)'},
    {name:'Complement',formula:'P(Aᶜ) = 1 − P(A)'},
  ],
  6:[
    {name:'Binomial PMF',formula:'P(X=k) = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ'},
    {name:'Mean',formula:'μ = np'},
    {name:'Std Dev',formula:'σ = √(np(1−p))'},
  ],
  7:[
    {name:'CLT',formula:'X̄ ~ N(μ, σ/√n) for large n'},
    {name:'Standard Error',formula:'SE = σ / √n'},
  ],
  8:[
    {name:'CI for μ',formula:'x̄ ± z* · (σ/√n)'},
    {name:'Margin of Error',formula:'E = z* · (σ/√n)'},
    {name:'Sample Size',formula:'n = (z* · σ / E)²'},
  ],
  9:[
    {name:'Test Statistic',formula:'z = (x̄ − μ₀) / (σ/√n)'},
    {name:'P-value',formula:'P(observing result | H₀ true)'},
    {name:'Decision Rule',formula:'Reject H₀ if p-value < α'},
  ],
  10:[
    {name:'Chi-Square',formula:'χ² = Σ(O−E)²/E'},
    {name:'df (GoF)',formula:'k − 1'},
    {name:'df (Independence)',formula:'(r−1)(c−1)'},
  ],
  11:[
    {name:'Regression t-test',formula:'t = b / SE_b'},
    {name:'Residual',formula:'e = y − ŷ'},
    {name:'R²',formula:'1 − (SS_res / SS_tot)'},
  ],
};
```

### 1b: Formula Panel UI

Add a collapsible formula panel to the practice page. Insert in `stats_hub.html` inside the practice section, before `probContainer`:

```html
<div class="formula-panel" id="formulaPanel">
  <button class="formula-toggle" id="formulaToggle" onclick="toggleFormulas()" aria-expanded="false">
    📐 Formulas <span id="formulaArrow">▸</span>
  </button>
  <div class="formula-content" id="formulaContent" style="display:none;"></div>
</div>
```

### 1c: Formula Rendering

**File:** `scripts/stats_hub.js`

```javascript
function buildFormulas(unit){
  const content=document.getElementById('formulaContent');
  if(!content)return;
  const formulas=FORMULAS[unit]||[];
  if(!formulas.length){content.innerHTML='';return;}
  let html='';
  formulas.forEach(f=>{
    html+=`<div class="formula-row"><span class="formula-name">${f.name}</span><span class="formula-eq">${f.formula}</span></div>`;
  });
  content.innerHTML=html;
}

function toggleFormulas(){
  const c=document.getElementById('formulaContent');
  const a=document.getElementById('formulaArrow');
  const t=document.getElementById('formulaToggle');
  if(!c)return;
  const show=c.style.display==='none';
  c.style.display=show?'':'none';
  if(a)a.textContent=show?'▾':'▸';
  if(t)t.setAttribute('aria-expanded',show);
}
```

Call `buildFormulas(unit)` inside `setUnit()` after `buildProblems()`.

### 1d: Formula Styles

```css
.formula-panel{margin-bottom:16px;}
.formula-toggle{
  background:var(--bg2);border:1px solid var(--border);border-radius:8px;
  padding:10px 16px;width:100%;text-align:left;cursor:pointer;
  color:var(--cyan);font-family:'Space Mono',monospace;font-size:13px;
  transition:border-color 0.2s;
}
.formula-toggle:hover{border-color:var(--cyan);}
.formula-content{
  background:var(--bg2);border:1px solid var(--border);border-top:none;
  border-radius:0 0 8px 8px;padding:12px 16px;
}
.formula-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);}
.formula-row:last-child{border-bottom:none;}
.formula-name{color:var(--text);font-size:13px;font-weight:600;}
.formula-eq{color:var(--amber);font-family:'Space Mono',monospace;font-size:13px;}
```

---

## Task 2: Problem Hint System

Before showing the full answer, offer a hint. Reduces frustration for ADHD learners who get stuck.

### 2a: Add Hints to Problem Data

Extend each problem object in `allProbs` with a `hint` field. Add hints to ALL existing problems. Hints should nudge toward the approach without giving the answer.

Examples:
```javascript
// Unit 1 problem
{id:'u1p1', ..., hint:'Add all values and divide by the count.'}
// Unit 2 problem
{id:'u2p1', ..., hint:'Use z = (x − μ) / σ. What are μ and σ?'}
// Unit 9 problem
{id:'u9p1', ..., hint:'First state H₀ and H₁. What is the test statistic?'}
```

### 2b: Hint Button in Problem Cards

In `buildProblems()`, add a hint button before the answer choices/input:

```javascript
// After pc-body div, before choices:
if(p.hint){
  html+=`<div class="hint-row"><button class="hint-btn" onclick="showHint('${p.id}')" id="hb-${p.id}">💡 Show Hint</button><div class="hint-text" id="ht-${p.id}" style="display:none;">${p.hint}</div></div>`;
}
```

```javascript
function showHint(id){
  const ht=document.getElementById('ht-'+id);
  const hb=document.getElementById('hb-'+id);
  if(ht)ht.style.display='block';
  if(hb)hb.style.display='none';
  // Small XP reward for using hints (encourages engagement)
  awardXP(1,'hint-'+id);
}
```

### 2c: Hint Styles

```css
.hint-row{margin:8px 0;}
.hint-btn{
  background:none;border:1px solid var(--amber);border-radius:6px;
  padding:6px 14px;color:var(--amber);font-size:12px;cursor:pointer;
  font-family:'Space Mono',monospace;transition:all 0.2s;
}
.hint-btn:hover{background:var(--amber);color:var(--bg);}
.hint-text{
  margin-top:8px;padding:10px 14px;background:rgba(255,191,0,0.08);
  border-left:3px solid var(--amber);border-radius:0 6px 6px 0;
  color:var(--text);font-size:13px;line-height:1.5;
}
```

---

## Task 3: Celebration Animations

Dopamine hits for correct answers. Small but impactful visual feedback.

### 3a: Confetti Burst on Correct Answer

**File:** `scripts/stats_hub.js`

```javascript
function spawnConfetti(){
  if(typeof document==='undefined')return;
  const colors=['var(--cyan)','var(--amber)','var(--pink)','var(--green)','var(--purple)'];
  for(let i=0;i<20;i++){
    const el=document.createElement('div');
    el.className='confetti-piece';
    el.style.left=Math.random()*100+'vw';
    el.style.backgroundColor=colors[Math.floor(Math.random()*colors.length)];
    el.style.animationDelay=Math.random()*0.5+'s';
    el.style.animationDuration=(1+Math.random())+'s';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),2000);
  }
}
```

Call `spawnConfetti()` in `showFB()` when `ok===true` (correct answer).
Also call it on level-up, milestone unlock, and review session complete.

### 3b: Correct Answer Pulse

Add a brief scale-up pulse animation to the problem card on correct answer. In `showFB()`, when marking correct:

```javascript
const card=document.getElementById('pc-'+id);
if(card){card.classList.add('correct-pulse');setTimeout(()=>card.classList.remove('correct-pulse'),600);}
```

### 3c: Animation Styles

```css
@keyframes confetti-fall{
  0%{transform:translateY(-10vh) rotate(0deg);opacity:1;}
  100%{transform:translateY(100vh) rotate(720deg);opacity:0;}
}
.confetti-piece{
  position:fixed;top:0;width:8px;height:8px;border-radius:2px;
  z-index:2001;pointer-events:none;
  animation:confetti-fall 1.5s ease-out forwards;
}
@keyframes correct-pulse{
  0%{transform:scale(1);}
  50%{transform:scale(1.02);}
  100%{transform:scale(1);}
}
.correct-pulse{animation:correct-pulse 0.4s ease;}

@media(prefers-reduced-motion:reduce){
  .confetti-piece,.correct-pulse{animation:none !important;}
}
```

---

## Constraints

- NEVER modify `tests/`. Guard all DOM/localStorage calls.
- Hints must be added to ALL 115 existing problems (all units 1-11).
- Formula data must cover all 11 units.
- Confetti respects `prefers-reduced-motion` for accessibility.
- Timer persists in title bar only while running.

## Verification

```bash
node tests/run_all.js
```
Expected: 185/185 pass. Manual: test formula panel per unit, hints on every problem, confetti on correct answers, reduced-motion disabled confetti.

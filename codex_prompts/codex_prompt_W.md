# Codex Prompt W — Phase 19: AI Tutor Placeholder, Step-by-Step Solver, NLP Input

## Project Context

Stats Learning Hub — single-page vanilla JS/HTML/CSS. NEVER modify `tests/`. All prior systems exist.

**NOTE:** This phase adds the UI and local logic for AI-powered features. The actual AI calls are stubbed/mocked — they can be connected to an API later. No API keys or external services required for this implementation.

---

## Task 1: AI Tutor Chat Panel

A chat interface where users can ask stats questions. Initially powered by a local knowledge base (not API).

### 1a: Chat Panel UI

Add a slide-out chat panel (right side, like a help sidebar):

```html
<div class="tutor-panel" id="tutorPanel" style="display:none;">
  <div class="tutor-header">
    <span>🤖 Stats Tutor</span>
    <button onclick="toggleTutor()" aria-label="Close tutor">✕</button>
  </div>
  <div class="tutor-messages" id="tutorMessages"></div>
  <div class="tutor-input-row">
    <input type="text" id="tutorInput" placeholder="Ask a stats question..." onkeydown="if(event.key==='Enter')sendTutorMessage()">
    <button onclick="sendTutorMessage()">Send</button>
  </div>
</div>
```

Add a toggle button (floating, bottom-left):

```html
<button class="tutor-toggle" id="tutorToggle" onclick="toggleTutor()" aria-label="Open stats tutor">🤖</button>
```

### 1b: Local Knowledge Base

```javascript
const TUTOR_KB=[
  {keywords:['mean','average'],response:'The mean (average) is calculated by summing all values and dividing by the count: x̄ = Σxᵢ / n'},
  {keywords:['median'],response:'The median is the middle value when data is sorted. For even n, average the two middle values.'},
  {keywords:['mode'],response:'The mode is the most frequently occurring value in a dataset. A dataset can have multiple modes.'},
  {keywords:['standard deviation','std dev','stdev'],response:'Standard deviation measures spread: σ = √(Σ(xᵢ - x̄)² / n). Larger σ = more spread.'},
  {keywords:['z-score','z score'],response:'Z-score tells how many standard deviations a value is from the mean: z = (x - μ) / σ'},
  {keywords:['normal distribution','bell curve'],response:'The normal distribution is symmetric and bell-shaped. ~68% within 1σ, ~95% within 2σ, ~99.7% within 3σ.'},
  {keywords:['correlation','r value'],response:'Correlation (r) measures linear relationship strength. r = 1 is perfect positive, r = -1 is perfect negative, r = 0 is no linear relationship.'},
  {keywords:['regression'],response:'Linear regression fits ŷ = a + bx to data. Slope b = r(sᵧ/sₓ). R² tells proportion of variance explained.'},
  {keywords:['p-value','p value'],response:'P-value is the probability of observing results at least as extreme as the data, assuming H₀ is true. Small p (< α) → reject H₀.'},
  {keywords:['confidence interval','ci'],response:'A confidence interval estimates a parameter: x̄ ± z*(σ/√n). A 95% CI means 95% of such intervals contain the true parameter.'},
  {keywords:['hypothesis','h0','h1'],response:'H₀ (null): no effect/difference. H₁ (alternative): there IS an effect. We test if data provides enough evidence to reject H₀.'},
  {keywords:['chi-square','chi square'],response:'Chi-square tests compare observed vs expected frequencies: χ² = Σ(O-E)²/E. Used for goodness-of-fit and independence tests.'},
  {keywords:['anova','f-test'],response:'ANOVA compares means across 3+ groups. F = MSB/MSW. Large F → groups differ significantly.'},
  {keywords:['bayes','posterior','prior'],response:'Bayes\' theorem: P(A|B) = P(B|A)P(A)/P(B). Prior beliefs are updated with data to get posterior probability.'},
  {keywords:['binomial'],response:'Binomial: P(X=k) = C(n,k)p^k(1-p)^(n-k). Mean = np, SD = √(np(1-p)). Used for fixed n trials with two outcomes.'},
  {keywords:['clt','central limit'],response:'Central Limit Theorem: for large n, the sampling distribution of x̄ is approximately Normal regardless of population shape.'},
];

function findTutorResponse(query){
  const q=query.toLowerCase();
  const match=TUTOR_KB.find(entry=>entry.keywords.some(kw=>q.includes(kw)));
  if(match)return match.response;
  return'I\'m not sure about that. Try asking about specific topics like mean, z-score, regression, or p-value. For detailed help, check the formula reference in Practice mode.';
}
```

### 1c: Chat Logic

```javascript
function toggleTutor(){
  const panel=document.getElementById('tutorPanel');
  if(panel)panel.style.display=panel.style.display==='none'?'flex':'none';
}

function sendTutorMessage(){
  const input=document.getElementById('tutorInput');
  if(!input||!input.value.trim())return;
  const query=input.value.trim();
  input.value='';

  addTutorMessage(query,'user');
  const response=findTutorResponse(query);
  setTimeout(()=>addTutorMessage(response,'tutor'),300+Math.random()*500);
}

function addTutorMessage(text,sender){
  const container=document.getElementById('tutorMessages');
  if(!container)return;
  const msg=document.createElement('div');
  msg.className='tutor-msg tutor-msg-'+sender;
  msg.textContent=text;
  container.appendChild(msg);
  container.scrollTop=container.scrollHeight;
}
```

### 1d: Tutor Styles

```css
.tutor-toggle{
  position:fixed;bottom:70px;left:20px;width:48px;height:48px;border-radius:50%;
  border:2px solid var(--purple);background:var(--bg);color:var(--purple);
  font-size:20px;cursor:pointer;z-index:1500;box-shadow:0 2px 12px rgba(0,0,0,0.3);
}
.tutor-toggle:hover{background:var(--purple);color:var(--bg);}
.tutor-panel{
  position:fixed;right:0;top:56px;bottom:0;width:320px;max-width:90vw;
  background:var(--bg2);border-left:1px solid var(--border);z-index:1500;
  display:flex;flex-direction:column;box-shadow:-4px 0 24px rgba(0,0,0,0.3);
}
.tutor-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border);font-family:'Space Mono',monospace;color:var(--text);}
.tutor-header button{background:none;border:none;color:var(--muted);font-size:18px;cursor:pointer;}
.tutor-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;}
.tutor-msg{padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.5;max-width:85%;}
.tutor-msg-user{background:var(--cyan);color:var(--bg);align-self:flex-end;border-radius:12px 12px 2px 12px;}
.tutor-msg-tutor{background:var(--bg);color:var(--text);align-self:flex-start;border-radius:12px 12px 12px 2px;}
.tutor-input-row{display:flex;gap:8px;padding:12px;border-top:1px solid var(--border);}
.tutor-input-row input{flex:1;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;}
.tutor-input-row button{padding:8px 16px;background:var(--purple);color:#fff;border:none;border-radius:6px;cursor:pointer;}
```

---

## Task 2: Step-by-Step Problem Solver

Show problems solved one step at a time, with each step revealed on click. Better than showing the full solution at once.

### 2a: Step-by-Step Data

Extend problem explanations to support multi-step format. Add a `steps` array to problems:

```javascript
// Example:
{id:'u2p1', ...,
  steps:[
    'Identify the values: x = 78, μ = 70, σ = 4',
    'Apply the z-score formula: z = (x − μ) / σ',
    'Substitute: z = (78 − 70) / 4 = 8 / 4',
    'Result: z = 2.0'
  ],
  ex:'z = (78-70)/4 = 2.0'
}
```

### 2b: Step Reveal UI

In `showFB()`, if the problem has `steps`, render them progressively:

```javascript
// Instead of showing full explanation at once:
if(prob.steps&&prob.steps.length){
  let html='<div class="steps-container">';
  prob.steps.forEach((step,i)=>{
    html+=`<div class="step hidden" id="step-${id}-${i}"><span class="step-num">Step ${i+1}:</span> ${step}</div>`;
  });
  html+=`<button class="step-reveal-btn" id="stepBtn-${id}" onclick="revealNextStep('${id}',${prob.steps.length})">Show Step 1 →</button>`;
  html+='</div>';
}
```

```javascript
let stepProgress={};

function revealNextStep(probId,total){
  if(!stepProgress[probId])stepProgress[probId]=0;
  const idx=stepProgress[probId];
  if(idx>=total)return;

  const step=document.getElementById('step-'+probId+'-'+idx);
  if(step)step.classList.remove('hidden');
  stepProgress[probId]++;

  const btn=document.getElementById('stepBtn-'+probId);
  if(stepProgress[probId]>=total){
    if(btn)btn.style.display='none';
  }else{
    if(btn)btn.textContent='Show Step '+(stepProgress[probId]+1)+' →';
  }
}
```

### 2c: Step Styles

```css
.steps-container{margin-top:8px;}
.step{padding:6px 0;border-bottom:1px solid var(--border);font-size:13px;color:var(--text);transition:opacity 0.3s;}
.step.hidden{display:none;}
.step-num{color:var(--cyan);font-weight:700;font-family:'Space Mono',monospace;}
.step-reveal-btn{
  margin-top:8px;padding:8px 16px;background:transparent;border:1px solid var(--cyan);
  color:var(--cyan);border-radius:6px;cursor:pointer;font-family:'Space Mono',monospace;font-size:12px;
}
.step-reveal-btn:hover{background:var(--cyan);color:var(--bg);}
```

---

## Task 3: Natural Language Problem Input

Let users type a problem in plain English and parse it into a solvable format. Local parsing, no API.

### 3a: NLP Input Bar

Add to practice page:

```html
<div class="nlp-bar" id="nlpBar">
  <input type="text" id="nlpInput" placeholder="Try: 'What is the z-score if x=85, mean=70, stdev=5?'" onkeydown="if(event.key==='Enter')solveNLP()">
  <button onclick="solveNLP()">Solve</button>
</div>
<div class="nlp-result" id="nlpResult" style="display:none;"></div>
```

### 3b: Pattern-Based Parser

```javascript
const NLP_PATTERNS=[
  {
    regex:/z.?score.*x\s*=?\s*([\d.]+).*mean\s*=?\s*([\d.]+).*(?:std|stdev|sigma|sd)\s*=?\s*([\d.]+)/i,
    solve:m=>{const z=(m[1]-m[2])/m[3];return{answer:'z = ('+m[1]+' − '+m[2]+') / '+m[3]+' = '+z.toFixed(4),steps:['x = '+m[1]+', μ = '+m[2]+', σ = '+m[3],'z = (x − μ) / σ','z = ('+m[1]+' − '+m[2]+') / '+m[3],'z = '+z.toFixed(4)]};},
  },
  {
    regex:/mean.*of\s+([\d.,\s]+)/i,
    solve:m=>{const vals=m[1].split(/[,\s]+/).map(Number).filter(v=>!isNaN(v));const avg=mean(vals);return{answer:'Mean = '+avg.toFixed(4),steps:['Values: '+vals.join(', '),'Sum = '+vals.reduce((a,b)=>a+b,0),'n = '+vals.length,'Mean = Sum / n = '+avg.toFixed(4)]};},
  },
  {
    regex:/(?:standard deviation|stdev|std dev).*of\s+([\d.,\s]+)/i,
    solve:m=>{const vals=m[1].split(/[,\s]+/).map(Number).filter(v=>!isNaN(v));const sd=stdev(vals);return{answer:'σ = '+sd.toFixed(4),steps:['Values: '+vals.join(', '),'Mean = '+mean(vals).toFixed(4),'σ = √(Σ(xᵢ − x̄)² / n)','σ = '+sd.toFixed(4)]};},
  },
  {
    regex:/median.*of\s+([\d.,\s]+)/i,
    solve:m=>{const vals=m[1].split(/[,\s]+/).map(Number).filter(v=>!isNaN(v));const med=median(vals);return{answer:'Median = '+med,steps:['Values sorted: '+sorted(vals).join(', '),'n = '+vals.length,'Median = '+med]};},
  },
  // Add more patterns: combinations, probability, CI, etc.
];

function solveNLP(){
  const input=document.getElementById('nlpInput');
  const result=document.getElementById('nlpResult');
  if(!input||!result)return;
  const query=input.value.trim();
  if(!query)return;

  for(const pattern of NLP_PATTERNS){
    const match=query.match(pattern.regex);
    if(match){
      const solution=pattern.solve(match);
      let html='<div class="nlp-answer">'+solution.answer+'</div>';
      if(solution.steps){
        html+='<div class="nlp-steps">';
        solution.steps.forEach((s,i)=>{html+='<div class="step"><span class="step-num">Step '+(i+1)+':</span> '+s+'</div>';});
        html+='</div>';
      }
      result.innerHTML=html;
      result.style.display='block';
      awardXP(3,'nlp-solve');
      return;
    }
  }

  result.innerHTML='<div class="nlp-no-match">I couldn\'t parse that. Try formats like:<br>• "z-score if x=85, mean=70, stdev=5"<br>• "mean of 4, 7, 9, 12, 15"<br>• "standard deviation of 10, 20, 30"</div>';
  result.style.display='block';
}
```

---

## Constraints

- NEVER modify `tests/`. Guard all DOM calls.
- Tutor chat is LOCAL only — no API calls, no network requests.
- NLP parser uses regex patterns — no external NLP library.
- Step-by-step data is optional on problems (fallback to full explanation).
- Tutor panel must not overlap pomodoro widget.

## Verification

```bash
node tests/run_all.js
```
Expected: 185/185 pass. Manual: ask tutor about z-scores, step through problem explanation, type "mean of 4,7,9" in NLP input → get correct answer.

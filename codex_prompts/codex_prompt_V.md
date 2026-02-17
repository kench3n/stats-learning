# Codex Prompt V — Phase 18: Custom Problem Creator, Deck Sharing, Community Voting

## Project Context

Stats Learning Hub — single-page vanilla JS/HTML/CSS. NEVER modify `tests/`. All prior systems exist. Problems follow schema: `{id, unit, type, diff, topic, q, ch?, ans, ex, hint, tol?}`.

---

## Task 1: Custom Problem Creator

Let users create their own practice problems. Creating problems is a powerful study technique (generation effect).

### 1a: Problem Creator Page

Add a new page or modal accessible from the practice page:

```html
<section id="pg-create" class="page" role="tabpanel" aria-label="Create Problem">
  <header class="section-header">
    <p class="section-tag">Create Your Own</p>
    <h2 class="section-title">Problem <em>Builder</em></h2>
  </header>
  <form class="create-form" id="createForm" onsubmit="event.preventDefault();saveCustomProblem();">
    <label>Unit:
      <select id="cpUnit"></select>
    </label>
    <label>Difficulty:
      <select id="cpDiff"><option value="easy">Easy</option><option value="medium" selected>Medium</option><option value="hard">Hard</option></select>
    </label>
    <label>Type:
      <select id="cpType" onchange="toggleCreateType()"><option value="mc">Multiple Choice</option><option value="fr">Free Response</option></select>
    </label>
    <label>Topic: <input type="text" id="cpTopic" required placeholder="e.g., Z-score calculation"></label>
    <label>Question: <textarea id="cpQuestion" required rows="3" placeholder="Write your question..."></textarea></label>
    <div id="cpMCFields">
      <label>Choice A: <input type="text" id="cpA" required></label>
      <label>Choice B: <input type="text" id="cpB" required></label>
      <label>Choice C: <input type="text" id="cpC" required></label>
      <label>Choice D: <input type="text" id="cpD" required></label>
      <label>Correct Answer:
        <select id="cpMCAns"><option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></select>
      </label>
    </div>
    <div id="cpFRFields" style="display:none;">
      <label>Correct Answer (number): <input type="number" id="cpFRAns" step="any"></label>
      <label>Tolerance: <input type="number" id="cpTol" value="0.1" step="0.01"></label>
    </div>
    <label>Explanation: <textarea id="cpExplanation" required rows="2" placeholder="Step-by-step solution..."></textarea></label>
    <label>Hint (optional): <input type="text" id="cpHint" placeholder="A nudge toward the approach..."></label>
    <button type="submit" class="create-submit">Save Problem</button>
  </form>
  <div class="custom-problems-list">
    <h3>Your Custom Problems (<span id="cpCount">0</span>)</h3>
    <div id="cpList"></div>
  </div>
</section>
```

### 1b: Custom Problem Storage

```javascript
// localStorage key: 'sh-custom-problems'
// Data: array of problem objects

function getCustomProblems(){
  if(typeof localStorage==='undefined')return[];
  try{return JSON.parse(localStorage.getItem('sh-custom-problems')||'[]');}catch{return[];}
}

function saveCustomProblem(){
  const unit=+document.getElementById('cpUnit').value;
  const type=document.getElementById('cpType').value;
  const customs=getCustomProblems();
  const id='custom-'+(customs.length+1);

  const prob={
    id, unit, type,
    diff:document.getElementById('cpDiff').value,
    topic:document.getElementById('cpTopic').value,
    q:document.getElementById('cpQuestion').value,
    ex:document.getElementById('cpExplanation').value,
    hint:document.getElementById('cpHint').value||null,
    custom:true
  };

  if(type==='mc'){
    prob.ch=[
      document.getElementById('cpA').value,
      document.getElementById('cpB').value,
      document.getElementById('cpC').value,
      document.getElementById('cpD').value
    ];
    prob.ans=+document.getElementById('cpMCAns').value;
  }else{
    prob.ans=+document.getElementById('cpFRAns').value;
    prob.tol=+document.getElementById('cpTol').value||0.1;
  }

  customs.push(prob);
  localStorage.setItem('sh-custom-problems',JSON.stringify(customs));

  // Also add to allProbs for the unit
  if(!allProbs[unit])allProbs[unit]=[];
  allProbs[unit].push(prob);

  showToast('Problem saved! Find it in Unit '+unit+' practice.');
  awardXP(10,'create-problem');
  document.getElementById('createForm').reset();
  buildCustomProblemList();
}
```

### 1c: Load Custom Problems on Startup

In DOMContentLoaded, merge custom problems into `allProbs`:

```javascript
const customs=getCustomProblems();
customs.forEach(p=>{
  if(!allProbs[p.unit])allProbs[p.unit]=[];
  if(!allProbs[p.unit].find(x=>x.id===p.id))allProbs[p.unit].push(p);
});
```

---

## Task 2: Deck Sharing (Export/Import Problem Sets)

### 2a: Export Custom Deck

```javascript
function exportCustomDeck(){
  const customs=getCustomProblems();
  if(!customs.length){showToast('No custom problems to export.');return;}
  const json=JSON.stringify({version:1,type:'custom-deck',problems:customs},null,2);
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='stats-hub-custom-deck.json';a.click();
  URL.revokeObjectURL(url);
}
```

### 2b: Import Custom Deck

```javascript
function importCustomDeck(){
  const input=document.createElement('input');
  input.type='file';input.accept='.json';
  input.onchange=function(e){
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=function(ev){
      try{
        const data=JSON.parse(ev.target.result);
        if(!data.problems||!Array.isArray(data.problems))throw new Error('invalid');
        const customs=getCustomProblems();
        let added=0;
        data.problems.forEach(p=>{
          // Re-ID to avoid collisions
          p.id='custom-'+(customs.length+added+1);
          p.custom=true;
          customs.push(p);
          if(!allProbs[p.unit])allProbs[p.unit]=[];
          allProbs[p.unit].push(p);
          added++;
        });
        localStorage.setItem('sh-custom-problems',JSON.stringify(customs));
        showToast('Imported '+added+' problems!');
        buildCustomProblemList();
      }catch{showToast('Invalid deck file.');}
    };
    reader.readAsText(file);
  };
  input.click();
}
```

### 2c: Share Buttons

Add export/import buttons to the create page:

```html
<div class="deck-actions">
  <button onclick="exportCustomDeck()">📤 Export Deck</button>
  <button onclick="importCustomDeck()">📥 Import Deck</button>
</div>
```

---

## Task 3: Problem Rating/Voting

Let users rate problems (both built-in and custom) for quality and difficulty accuracy.

### 3a: Rating UI

After each problem's feedback, add rating buttons:

```javascript
// In showFB(), after the explanation:
html+=`<div class="rating-row" id="rate-${id}">
  <span class="rate-label">Rate this problem:</span>
  <button onclick="rateProblem('${id}','easy')" class="rate-btn">Too Easy</button>
  <button onclick="rateProblem('${id}','right')" class="rate-btn rate-right">Just Right</button>
  <button onclick="rateProblem('${id}','hard')" class="rate-btn">Too Hard</button>
</div>`;
```

### 3b: Rating Storage

```javascript
// localStorage key: 'sh-ratings'
function rateProblem(probId, rating){
  const ratings=JSON.parse(localStorage.getItem('sh-ratings')||'{}');
  ratings[probId]=rating;
  localStorage.setItem('sh-ratings',JSON.stringify(ratings));
  const row=document.getElementById('rate-'+probId);
  if(row)row.innerHTML='<span class="rate-thanks">Thanks for rating!</span>';
  awardXP(1,'rate-'+probId);
}
```

Ratings can inform the weak spot detection and adaptive difficulty systems.

---

## Constraints

- NEVER modify `tests/`. Guard all DOM/localStorage calls.
- Custom problems must not interfere with test expectations (tests validate built-in problems only).
- Custom problem IDs use "custom-" prefix to distinguish from built-in IDs.
- Imported decks must re-ID problems to prevent collisions.
- Include custom problems and ratings in export/import/reset.

## Verification

```bash
node tests/run_all.js
```
Expected: 185/185 pass. Manual: create MC and FR problems, find them in practice, export deck, import on fresh browser, rate problems.

# Codex Prompt T — Phase 16: Flashcard Mode, Matching Games, Formula Builder

## Project Context

Stats Learning Hub — single-page vanilla JS/HTML/CSS. NEVER modify `tests/`. All prior systems exist. FORMULAS data exists per unit.

---

## Task 1: Flashcard Mode

Flip-card interface for reviewing concepts. Great for ADHD — tactile, quick, no writing required.

### 1a: Flashcard Page

Add new page accessible from nav:

```html
<section id="pg-flashcards" class="page" role="tabpanel" aria-label="Flashcards">
  <header class="section-header">
    <p class="section-tag">Quick Review</p>
    <h2 class="section-title">Flash<em>cards</em></h2>
    <p class="section-desc">Tap to flip. Swipe or arrow keys to advance.</p>
  </header>
  <div class="fc-unit-select">
    <label for="fcUnitSelect">Unit:</label>
    <select id="fcUnitSelect" onchange="buildFlashcards(+this.value)"></select>
  </div>
  <div class="fc-container" id="fcContainer"></div>
  <div class="fc-controls">
    <button onclick="fcPrev()" aria-label="Previous card">← Prev</button>
    <span id="fcProgress">1 / 10</span>
    <button onclick="fcNext()" aria-label="Next card">Next →</button>
  </div>
  <div class="fc-actions">
    <button class="fc-know" onclick="fcMark(true)">✓ I know this</button>
    <button class="fc-unsure" onclick="fcMark(false)">✗ Still learning</button>
  </div>
</section>
```

### 1b: Flashcard Logic

**File:** `scripts/stats_hub.js`

Generate flashcards from problems and formulas:

```javascript
let fcCards=[],fcIndex=0;

function buildFlashcards(unit){
  fcCards=[];fcIndex=0;

  // Add formula cards
  (FORMULAS[unit]||[]).forEach(f=>{
    fcCards.push({front:'What is the formula for '+f.name+'?',back:f.formula,type:'formula'});
  });

  // Add problem cards (convert to Q&A)
  (allProbs[unit]||[]).forEach(p=>{
    const answer=p.type==='mc'?p.ch[p.ans]:String(p.ans);
    fcCards.push({front:p.q,back:answer+' — '+p.ex,type:'problem'});
  });

  // Shuffle
  for(let i=fcCards.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [fcCards[i],fcCards[j]]=[fcCards[j],fcCards[i]];
  }

  renderFlashcard();
}

function renderFlashcard(){
  const container=document.getElementById('fcContainer');
  if(!container||!fcCards.length)return;
  const card=fcCards[fcIndex];
  container.innerHTML=`
    <div class="fc-card" id="fcCard" onclick="flipCard()" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' ')flipCard();">
      <div class="fc-front">${card.front}</div>
      <div class="fc-back" style="display:none;">${card.back}</div>
    </div>`;
  setElText('fcProgress',(fcIndex+1)+' / '+fcCards.length);
}

function flipCard(){
  const front=document.querySelector('.fc-front');
  const back=document.querySelector('.fc-back');
  if(!front||!back)return;
  const showing=back.style.display!=='none';
  front.style.display=showing?'':'none';
  back.style.display=showing?'none':'';
  document.getElementById('fcCard')?.classList.toggle('flipped',!showing);
}

function fcNext(){if(fcIndex<fcCards.length-1){fcIndex++;renderFlashcard();}}
function fcPrev(){if(fcIndex>0){fcIndex--;renderFlashcard();}}
function fcMark(known){
  if(known)awardXP(2,'flashcard');
  fcNext();
}
```

Arrow key support — add to global keydown handler:
```javascript
else if(e.key==='ArrowRight'){fcNext();}
else if(e.key==='ArrowLeft'){fcPrev();}
else if(e.key===' '&&document.getElementById('pg-flashcards')?.classList.contains('active')){e.preventDefault();flipCard();}
```

### 1c: Flashcard Styles

```css
.fc-container{display:flex;justify-content:center;padding:20px 0;}
.fc-card{
  width:100%;max-width:480px;min-height:240px;padding:32px;
  background:var(--bg2);border:2px solid var(--border);border-radius:16px;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  text-align:center;transition:transform 0.3s,border-color 0.3s;
  font-size:16px;line-height:1.6;
}
.fc-card:hover{border-color:var(--cyan);}
.fc-card.flipped{border-color:var(--amber);}
.fc-front{color:var(--text);font-size:16px;}
.fc-back{color:var(--cyan);font-family:'Space Mono',monospace;font-size:14px;}
.fc-controls{display:flex;justify-content:center;align-items:center;gap:20px;margin:16px 0;}
.fc-controls button{padding:8px 20px;border:1px solid var(--border);background:transparent;color:var(--text);border-radius:6px;cursor:pointer;font-family:'Space Mono',monospace;}
.fc-controls button:hover{border-color:var(--cyan);color:var(--cyan);}
.fc-actions{display:flex;justify-content:center;gap:12px;}
.fc-know{padding:10px 20px;background:var(--green);color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:'Space Mono',monospace;}
.fc-unsure{padding:10px 20px;background:var(--pink);color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:'Space Mono',monospace;}
```

---

## Task 2: Matching Games

Drag-and-drop or click-to-match games for terms ↔ definitions. Active learning is more engaging for ADHD than passive reading.

### 2a: Match Game Logic

```javascript
function startMatchGame(unit){
  const formulas=FORMULAS[unit]||[];
  if(formulas.length<4){showToast('Need at least 4 formulas for matching.');return;}

  // Pick 6 random pairs
  const pairs=formulas.sort(()=>Math.random()-0.5).slice(0,6);
  const leftItems=pairs.map((p,i)=>({id:i,text:p.name})).sort(()=>Math.random()-0.5);
  const rightItems=pairs.map((p,i)=>({id:i,text:p.formula})).sort(()=>Math.random()-0.5);

  // Render game board (click-to-match: select left, then right)
  // Track matches, show success/error feedback
  // Award XP on completion
}
```

### 2b: Click-to-Match UI

Render two columns. User clicks a term on the left, then clicks matching formula on the right. Correct matches highlight green and lock. Wrong matches flash red.

Track state: `matchSelected` (left item), `matchedPairs` count. When all matched, award XP and show time.

### 2c: Match Game accessible from flashcard page as a tab/button.

---

## Task 3: Interactive Formula Builder

Drag formula components to build equations. Reinforces understanding of formula structure.

### 3a: Formula Builder UI

A simplified builder where users assemble formulas from components:

```javascript
function startFormulaBuilder(unit){
  // Pick a random formula from the unit
  const formulas=FORMULAS[unit]||[];
  const target=formulas[Math.floor(Math.random()*formulas.length)];

  // Split formula into parts and shuffle
  const parts=target.formula.split(/([+\-*/=()²√Σ])/g).filter(p=>p.trim());
  const shuffled=[...parts].sort(()=>Math.random()-0.5);

  // Render: target name at top, shuffled pieces below
  // User clicks pieces in order to build the formula
  // Correct order = success + XP
}
```

### 3b: Builder is a mini-game accessible from the flashcard or practice page.

---

## Constraints

- NEVER modify `tests/`. Guard all DOM calls.
- Flashcards must work with keyboard (arrow keys, space to flip).
- Matching game uses click (not drag-and-drop) for accessibility and mobile support.
- Formula builder validates exact piece order.
- Add flashcards page to `goPage()` navigation.

## Verification

```bash
node tests/run_all.js
```
Expected: 185/185 pass. Manual: flashcards flip/navigate, matching game highlights correct/wrong, formula builder validates sequence.

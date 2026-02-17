# Codex Prompt R — Phase 14: Notes/Bookmarks, Search, Problem Filtering

## Project Context

Stats Learning Hub — single-page vanilla JS/HTML/CSS. NEVER modify `tests/`. All prior systems exist.

---

## Task 1: Notes & Bookmarks

Let users annotate problems and bookmark ones to revisit. ADHD learners often have "aha moments" they need to capture before they forget.

### 1a: Bookmark System

**File:** `scripts/stats_hub.js`

```javascript
// localStorage key: 'sh-bookmarks'
// Data: { "u3p5": true, "u7p2": true }

function getBookmarks(){
  if(typeof localStorage==='undefined')return{};
  try{return JSON.parse(localStorage.getItem('sh-bookmarks')||'{}');}catch{return{};}
}

function toggleBookmark(probId){
  const bm=getBookmarks();
  if(bm[probId])delete bm[probId];
  else bm[probId]=true;
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-bookmarks',JSON.stringify(bm));
  updateBookmarkUI(probId);
}

function updateBookmarkUI(probId){
  const btn=document.getElementById('bm-'+probId);
  if(!btn)return;
  const bm=getBookmarks();
  btn.textContent=bm[probId]?'★':'☆';
  btn.classList.toggle('bookmarked',!!bm[probId]);
}
```

### 1b: Add Bookmark Button to Problem Cards

In `buildProblems()`, add a bookmark star in the problem header:

```javascript
// In pc-head, after topic span:
html+=`<button class="bm-btn ${bm[p.id]?'bookmarked':''}" id="bm-${p.id}" onclick="toggleBookmark('${p.id}')" aria-label="Bookmark problem">${bm[p.id]?'★':'☆'}</button>`;
```

### 1c: Notes System

```javascript
// localStorage key: 'sh-notes'
// Data: { "u3p5": "Remember: use z-table for this type", "u7p2": "Tricky! CLT applies here" }

function getNotes(){
  if(typeof localStorage==='undefined')return{};
  try{return JSON.parse(localStorage.getItem('sh-notes')||'{}');}catch{return{};}
}

function saveNote(probId){
  const input=document.getElementById('note-'+probId);
  if(!input)return;
  const notes=getNotes();
  const val=input.value.trim();
  if(val)notes[probId]=val;
  else delete notes[probId];
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-notes',JSON.stringify(notes));
  showToast('Note saved');
}
```

Add a collapsible note field below each problem's feedback area:

```javascript
// In buildProblems(), after feedback div:
const note=notes[p.id]||'';
html+=`<div class="note-row"><input type="text" class="note-input" id="note-${p.id}" placeholder="Add a note..." value="${note.replace(/"/g,'&quot;')}" onchange="saveNote('${p.id}')"></div>`;
```

### 1d: Bookmark/Note Styles

```css
.bm-btn{background:none;border:none;font-size:18px;color:var(--muted);cursor:pointer;margin-left:auto;transition:color 0.2s;}
.bm-btn.bookmarked{color:var(--amber);}
.bm-btn:hover{color:var(--amber);}
.note-row{margin-top:8px;}
.note-input{
  width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);
  border-radius:6px;color:var(--text);font-size:12px;font-family:'Space Mono',monospace;
}
.note-input:focus{border-color:var(--cyan);outline:none;}
```

### 1e: Update Export/Import

Include bookmarks and notes in export/import/reset.

---

## Task 2: Search Functionality

Find problems by keyword. Essential when you remember a concept but not which unit it's in.

### 2a: Search Bar

**File:** `stats_hub.html` — add in practice section, above formula panel:

```html
<div class="search-bar" id="searchBar">
  <input type="text" id="searchInput" placeholder="Search problems..." oninput="searchProblems()" aria-label="Search problems">
  <button class="search-clear" id="searchClear" onclick="clearSearch()" style="display:none;">✕</button>
</div>
```

### 2b: Search Logic

**File:** `scripts/stats_hub.js`

```javascript
function searchProblems(){
  const query=document.getElementById('searchInput').value.toLowerCase().trim();
  const clearBtn=document.getElementById('searchClear');
  if(clearBtn)clearBtn.style.display=query?'':'none';

  if(!query){
    // Show all problems in current unit
    document.querySelectorAll('.pc').forEach(el=>el.style.display='');
    return;
  }

  // Search across ALL units
  const results=[];
  for(const u in allProbs){
    (allProbs[u]||[]).forEach(p=>{
      const text=(p.q+' '+p.topic+(p.hint||'')+' '+(p.data||'')).toLowerCase();
      if(text.includes(query))results.push(p.id);
    });
  }

  // If results span multiple units, show a results summary
  document.querySelectorAll('.pc').forEach(el=>{
    const id=el.id.replace('pc-','');
    el.style.display=results.includes(id)?'':'none';
  });

  // Update count
  setElText('practiceUnitTag','Search: '+results.length+' result'+(results.length===1?'':'s'));
}

function clearSearch(){
  const input=document.getElementById('searchInput');
  if(input)input.value='';
  searchProblems();
  setElText('practiceUnitTag','Unit '+currentUnit+' — '+UNIT_META[currentUnit].name);
}
```

### 2c: Search Styles

```css
.search-bar{display:flex;gap:8px;margin-bottom:12px;position:relative;}
.search-bar input{
  flex:1;padding:10px 14px;background:var(--bg);border:1px solid var(--border);
  border-radius:8px;color:var(--text);font-size:13px;font-family:'Space Mono',monospace;
}
.search-bar input:focus{border-color:var(--cyan);outline:none;}
.search-clear{
  position:absolute;right:8px;top:50%;transform:translateY(-50%);
  background:none;border:none;color:var(--muted);font-size:16px;cursor:pointer;
}
```

---

## Task 3: Problem Filtering

Filter by difficulty, status (answered/unanswered), and bookmarked.

### 3a: Filter Bar

**File:** `stats_hub.html` — add after search bar:

```html
<div class="filter-bar" id="filterBar">
  <button class="filter-chip active" onclick="filterProblems('all')" data-filter="all">All</button>
  <button class="filter-chip" onclick="filterProblems('unanswered')" data-filter="unanswered">Unanswered</button>
  <button class="filter-chip" onclick="filterProblems('wrong')" data-filter="wrong">Wrong</button>
  <button class="filter-chip" onclick="filterProblems('bookmarked')" data-filter="bookmarked">★ Bookmarked</button>
  <button class="filter-chip" onclick="filterProblems('easy')" data-filter="easy">Easy</button>
  <button class="filter-chip" onclick="filterProblems('medium')" data-filter="medium">Medium</button>
  <button class="filter-chip" onclick="filterProblems('hard')" data-filter="hard">Hard</button>
</div>
```

### 3b: Filter Logic

```javascript
function filterProblems(filter){
  // Update active chip
  document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));
  document.querySelector('.filter-chip[data-filter="'+filter+'"]')?.classList.add('active');

  const bm=getBookmarks();
  const state=getPracticeState(currentUnit);
  const ans=state.answered||{};

  document.querySelectorAll('.pc').forEach(el=>{
    const id=el.id.replace('pc-','');
    const prob=activeProbs.find(p=>String(p.id)===id);
    if(!prob){el.style.display='none';return;}

    let show=true;
    if(filter==='unanswered')show=ans[id]===undefined;
    else if(filter==='wrong'){
      if(ans[id]===undefined){show=false;}
      else if(prob.type==='mc'){show=(+ans[id])!==prob.ans;}
      else{const v=parseFloat(ans[id]);show=!Number.isFinite(v)||Math.abs(v-prob.ans)>(prob.tol||0.1);}
    }
    else if(filter==='bookmarked')show=!!bm[id];
    else if(filter==='easy')show=prob.diff==='easy';
    else if(filter==='medium')show=prob.diff==='medium';
    else if(filter==='hard')show=prob.diff==='hard';

    el.style.display=show?'':'none';
  });
}
```

### 3c: Filter Styles

```css
.filter-bar{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;}
.filter-chip{
  padding:6px 12px;border:1px solid var(--border);border-radius:20px;
  background:transparent;color:var(--muted);font-size:12px;cursor:pointer;
  font-family:'Space Mono',monospace;transition:all 0.2s;
}
.filter-chip:hover{border-color:var(--cyan);color:var(--cyan);}
.filter-chip.active{border-color:var(--cyan);background:var(--cyan);color:var(--bg);}
```

---

## Constraints

- NEVER modify `tests/`. Guard all DOM/localStorage calls.
- Notes use `onchange` (not `oninput`) to avoid excessive localStorage writes.
- Search must not break when switching units.
- Filters reset when switching units (call `filterProblems('all')` in `setUnit()`).
- Bookmarks and notes must be included in export/import/reset.

## Verification

```bash
node tests/run_all.js
```
Expected: 185/185 pass. Manual: bookmark a problem (star turns yellow), add notes, search across units, filter by difficulty/status/bookmarked.

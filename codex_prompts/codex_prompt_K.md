# Codex Prompt K — Phase 7: Daily Digest, GitHub Pages, Cross-Linking

## Project Context

**Stats Learning Hub** — single-page vanilla JS/HTML/CSS app for learning statistics. No frameworks, no npm deps (package.json is scripts-only), no build step. 185 tests via `node tests/run_all.js`. **NEVER modify files in `tests/`.**

### Key Files
- `stats_hub.html` — all markup
- `scripts/stats_hub.js` — all logic (~1500+ lines)
- `styles/stats_hub.css` — all styles
- `.github/workflows/test.yml` — CI (tests only, no deploy)
- `tests/` — **SACRED. NEVER MODIFY.**

### Prerequisites (Already Implemented)
These systems exist from Phase 6 (Prompts I & J):
- **Streak:** `getStreakData()`, `recordActivity()`, `todayStr()`, `sh-streak` localStorage
- **XP:** `getXPData()`, `awardXP()`, `XP_TABLE`, `XP_PER_LEVEL`, `sh-xp` localStorage
- **Milestones:** `MILESTONES[]`, `getMilestones()`, `checkMilestones()`, `sh-milestones` localStorage
- **Review:** `getDueCards()`, `getReviewData()`, `sh-review` localStorage, Review page (`pg-review`)
- **Progress:** `getProgressSummary()` returns `{[unit]: {total, attempted, correct}}`
- **Navigation:** `goPage(id)` switches pages; `setUnit(n)` switches units
- **Unit metadata:** `UNIT_META` = `{1:{name:'Descriptive Statistics'}, 2:{name:'Normal Distribution'}, ...}`

### ADHD Design Principles
- **Zero decision paralysis** — tell the user exactly what to do next
- **Immediate visual feedback** — every action should feel rewarding
- **One clear CTA** — don't present 5 equal options; highlight THE one thing to do
- **Glanceable** — key info visible in <2 seconds, no reading walls of text

---

## Task 1: Daily Digest Dashboard on Home Page

### 1a: Add Digest Panel to HTML

**File:** `stats_hub.html`

Insert a digest panel between the hero header and the card grid (after the `</p>` of section-desc, before `<div class="home-grid">`):

```html
<div class="daily-digest" id="dailyDigest" style="display:none;">
  <div class="digest-row">
    <div class="digest-stat">
      <span class="digest-num" id="digestStreak">0</span>
      <span class="digest-label">Day Streak</span>
    </div>
    <div class="digest-stat">
      <span class="digest-num" id="digestXP">0</span>
      <span class="digest-label">Total XP</span>
    </div>
    <div class="digest-stat">
      <span class="digest-num" id="digestLevel">1</span>
      <span class="digest-label">Level</span>
    </div>
    <div class="digest-stat">
      <span class="digest-num" id="digestDue">0</span>
      <span class="digest-label">Cards Due</span>
    </div>
    <div class="digest-stat">
      <span class="digest-num" id="digestBadges">0</span>
      <span class="digest-label">Badges</span>
    </div>
  </div>
  <div class="digest-cta" id="digestCTA">
    <!-- Single recommended action button inserted by JS -->
  </div>
  <div class="digest-next-milestone" id="digestMilestone">
    <!-- Next unlockable milestone shown here -->
  </div>
</div>
```

### 1b: Digest Logic

**File:** `scripts/stats_hub.js`

```javascript
function updateDailyDigest(){
  if(typeof document==='undefined')return;
  const panel=document.getElementById('dailyDigest');
  if(!panel)return;

  const streak=getStreakData();
  const xp=getXPData();
  const dueCount=getDueCards().length;
  const earned=getMilestones();
  const badgeCount=Object.keys(earned).length;
  const summary=getProgressSummary();

  // Populate stats
  setElText('digestStreak',streak.current||0);
  setElText('digestXP',xp.total||0);
  setElText('digestLevel',xp.level||1);
  setElText('digestDue',dueCount);
  setElText('digestBadges',badgeCount);

  // Show the panel (hide if user has never done anything)
  const hasActivity=(xp.total||0)>0||(streak.current||0)>0||dueCount>0;
  panel.style.display=hasActivity?'':'none';

  // Determine the ONE recommended action (priority order)
  const cta=document.getElementById('digestCTA');
  if(!cta)return;

  if(dueCount>0){
    // Priority 1: Review cards are due
    cta.innerHTML='';
    const btn=document.createElement('button');
    btn.className='digest-action-btn';
    btn.textContent='Review '+dueCount+' due card'+(dueCount===1?'':'s')+' →';
    btn.onclick=function(){goPage('review');};
    cta.appendChild(btn);
  }else{
    // Priority 2: Find weakest unit and suggest practice
    let weakest=null, weakestPct=101;
    for(let u=1;u<=11;u++){
      const r=summary[u]||{total:0,attempted:0,correct:0};
      if(r.total===0)continue;
      const pct=r.attempted>0?(r.correct/r.total)*100:0;
      if(pct<weakestPct){weakestPct=pct;weakest=u;}
    }
    cta.innerHTML='';
    const btn=document.createElement('button');
    btn.className='digest-action-btn';
    if(weakest&&weakestPct<80){
      btn.textContent='Practice Unit '+weakest+': '+UNIT_META[weakest].name+' →';
      btn.onclick=function(){goPage('practice');setUnit(weakest);};
    }else{
      // All units strong — suggest roadmap
      btn.textContent='Explore the Quant Roadmap →';
      btn.onclick=function(){goPage('roadmap');};
    }
    cta.appendChild(btn);
  }

  // Show next unlockable milestone
  const milestoneEl=document.getElementById('digestMilestone');
  if(milestoneEl){
    const next=MILESTONES.find(m=>!earned[m.id]);
    if(next){
      milestoneEl.textContent='Next badge: '+next.icon+' '+next.name+' — '+next.desc;
    }else{
      milestoneEl.textContent='All badges earned! 🏆';
    }
  }
}
```

Call `updateDailyDigest()`:
- In the DOMContentLoaded handler (on page load)
- In `goPage()` when navigating to home
- After `awardXP()` and `recordActivity()` (so it updates live)

### 1c: Digest Styles

**File:** `styles/stats_hub.css`

```css
/* Daily Digest */
.daily-digest{
  max-width:640px;margin:0 auto 32px;padding:20px 24px;
  background:var(--bg2);border:1px solid var(--border);border-radius:12px;
}
.digest-row{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.digest-stat{display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;min-width:60px;}
.digest-num{font-size:24px;font-weight:700;color:var(--cyan);font-family:'Space Mono',monospace;}
.digest-label{font-size:11px;color:var(--muted);font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.5px;}
.digest-cta{margin-top:16px;text-align:center;}
.digest-action-btn{
  padding:12px 28px;background:var(--cyan);color:var(--bg);border:none;border-radius:8px;
  font-family:'Space Mono',monospace;font-size:14px;font-weight:700;
  cursor:pointer;transition:background 0.2s,transform 0.1s;
}
.digest-action-btn:hover{background:var(--amber);transform:scale(1.02);}
.digest-action-btn:focus-visible{outline:2px solid var(--cyan);outline-offset:2px;}
.digest-next-milestone{
  margin-top:12px;text-align:center;font-size:12px;color:var(--muted);
  font-family:'Space Mono',monospace;
}

@media(max-width:480px){
  .digest-row{gap:8px;}
  .digest-num{font-size:18px;}
  .digest-stat{min-width:50px;}
}
```

---

## Task 2: GitHub Pages Auto-Deployment

### 2a: Create Deploy Workflow

**File:** `.github/workflows/deploy.yml` (NEW FILE)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 2b: Update Service Worker Paths

**File:** `service-worker.js`

The service worker cache list may use absolute paths starting with `/`. For GitHub Pages, the app lives at a subpath (`/stats-learning/`). Update the ASSETS array to use relative paths:

```javascript
const ASSETS = [
  './stats_hub.html',
  './scripts/stats_hub.js',
  './styles/stats_hub.css',
  './manifest.json',
  // All font files with ./ prefix
  './fonts/space-mono-400.woff2',
  './fonts/space-mono-700.woff2',
  './fonts/instrument-serif-400.woff2',
  './fonts/instrument-serif-400-italic.woff2',
  './fonts/dm-sans-300.woff2',
  './fonts/dm-sans-400.woff2',
  './fonts/dm-sans-500.woff2',
  './fonts/dm-sans-600.woff2',
  './fonts/dm-sans-700.woff2',
];
```

### 2c: Update Manifest

**File:** `manifest.json`

Change `start_url` to relative:
```json
"start_url": "./stats_hub.html"
```

### 2d: Update Service Worker Registration

**File:** `scripts/stats_hub.js`

Change the registration path to relative:
```javascript
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./service-worker.js');
}
```

### 2e: Add Deploy Badge to README

**File:** `README.md`

Add after the existing test badge:
```markdown
[![Deploy](https://github.com/kench3n/stats-learning/actions/workflows/deploy.yml/badge.svg)](https://kench3n.github.io/stats-learning/stats_hub.html)
```

**Note:** The user must enable GitHub Pages in repo Settings → Pages → Source: "GitHub Actions" for this to work. Add a comment in the workflow file noting this.

---

## Task 3: Cross-Link Practice ↔ Visualizer

### 3a: Add "See it visually" Link on Practice Problems

**File:** `scripts/stats_hub.js`, `buildProblems()` function (~line 329)

In the problem card header (after the topic span), add a visualizer link:

**Current (~line 329):**
```javascript
html+=`<div class="pc" id="pc-${p.id}"><div class="pc-head"><span class="pc-num">#${p.id}</span><span class="pc-diff ${dc}">${p.diff}</span><span class="pc-topic">${p.topic}</span></div>...`;
```

**Replace with:**
```javascript
html+=`<div class="pc" id="pc-${p.id}"><div class="pc-head"><span class="pc-num">#${p.id}</span><span class="pc-diff ${dc}">${p.diff}</span><span class="pc-topic">${p.topic}</span><a href="#" class="viz-link" onclick="goPage('visualizer');setUnit(${p.unit});return false;" title="Open Unit ${p.unit} visualizer">📊 Visualize</a></div>...`;
```

This adds a small "📊 Visualize" link on every problem card that jumps directly to that unit's visualizer.

### 3b: Add "Practice this" Button on Visualizer

**File:** `scripts/stats_hub.js`, `vizTemplate()` function (~line 564)

At the end of each unit's visualizer template (before the closing `</div></div>`), add a practice link:

```javascript
// Add this to the end of every vizTemplate return string (inside the outer div):
`<div class="viz-practice-link"><button class="viz-practice-btn" onclick="goPage('practice');setUnit(${unit});">Practice Unit ${unit}: ${UNIT_META[unit].name} →</button></div>`
```

For **Unit 1** (which has a static HTML structure), add the button in `stats_hub.html` after the last viz tab panel (after `viz-comp`, before the closing of the visualizer section):

```html
<div class="viz-practice-link">
  <button class="viz-practice-btn" onclick="goPage('practice');setUnit(1);">Practice Unit 1: Descriptive Statistics →</button>
</div>
```

### 3c: Cross-Link Styles

**File:** `styles/stats_hub.css`

```css
/* Practice → Visualizer link */
.viz-link{
  margin-left:auto;font-size:12px;color:var(--cyan);text-decoration:none;
  font-family:'Space Mono',monospace;white-space:nowrap;
  transition:color 0.2s;
}
.viz-link:hover,.viz-link:focus{color:var(--amber);text-decoration:underline;}
.viz-link:focus-visible{outline:2px solid var(--cyan);outline-offset:2px;}

/* Make pc-head a flex row so viz-link pushes right */
.pc-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}

/* Visualizer → Practice button */
.viz-practice-link{margin-top:20px;text-align:center;padding:16px 0;border-top:1px solid var(--border);}
.viz-practice-btn{
  padding:10px 24px;background:transparent;color:var(--cyan);
  border:1px solid var(--cyan);border-radius:8px;
  font-family:'Space Mono',monospace;font-size:13px;font-weight:600;
  cursor:pointer;transition:all 0.2s;
}
.viz-practice-btn:hover{background:var(--cyan);color:var(--bg);}
.viz-practice-btn:focus-visible{outline:2px solid var(--cyan);outline-offset:2px;}
```

---

## Constraints

- **NEVER modify** any file in `tests/`
- Guard all `document`/`window`/`localStorage`/`navigator` calls with `if(typeof X!=='undefined')`
- Only modify: `scripts/stats_hub.js`, `styles/stats_hub.css`, `stats_hub.html`, `service-worker.js`, `manifest.json`, `README.md`
- Only create: `.github/workflows/deploy.yml`
- Do not add npm dependencies
- Do not break existing functionality
- All paths in service worker and manifest must be relative (`./`) for GitHub Pages compatibility
- The `.pc-head` flex change must not break existing problem card layout — test visually

---

## Verification

```bash
node tests/run_all.js
```

**Expected:** 185/185 tests pass, 0 failures.

### Manual Verification

**Digest:**
1. Open app with some existing progress → digest panel shows stats (streak, XP, level, due cards, badges)
2. Digest shows ONE action button (review if cards due, otherwise weakest unit)
3. Click the action button → navigates to correct page
4. Next milestone shown at bottom of digest
5. Open app with zero progress → digest panel is hidden
6. Answer a problem → return to home → digest updates live

**GitHub Pages:**
7. Push to main → Actions tab shows deploy workflow running
8. After deploy → site accessible at `https://kench3n.github.io/stats-learning/stats_hub.html`
9. Service worker registers correctly on deployed site
10. App works offline after first visit on GitHub Pages

**Cross-Links:**
11. On Practice page → each problem card shows "📊 Visualize" link on the right
12. Click it → jumps to visualizer for that unit, canvas draws
13. On Visualizer page → "Practice Unit X" button at bottom of each visualizer
14. Click it → jumps to practice for that unit, problems load
15. Cross-links work for all 11 units
16. Links are keyboard-accessible (Tab, Enter)

**No console errors** in any scenario.

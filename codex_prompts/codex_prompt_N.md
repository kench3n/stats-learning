# Codex Prompt N — Phase 10: PWA Install, Mobile Optimization, Offline Indicator

## Project Context

Stats Learning Hub — single-page vanilla JS/HTML/CSS. 185 tests. NEVER modify `tests/`. Service worker and manifest.json already exist. App deploys to GitHub Pages.

---

## Task 1: PWA Install Prompt

The service worker and manifest exist but there's no install UX. Add a native-feeling install banner.

### 1a: Install Banner HTML

**File:** `stats_hub.html` — add before closing `</body>`:

```html
<div class="install-banner" id="installBanner" style="display:none;">
  <span class="install-text">📱 Install Stats Hub for offline access</span>
  <button class="install-btn" id="installBtn" onclick="installPWA()">Install</button>
  <button class="install-dismiss" onclick="dismissInstall()" aria-label="Dismiss">✕</button>
</div>
```

### 1b: Install Logic

**File:** `scripts/stats_hub.js`

```javascript
let deferredPrompt=null;

if(typeof window!=='undefined'){
  window.addEventListener('beforeinstallprompt',function(e){
    e.preventDefault();
    deferredPrompt=e;
    // Don't show if user dismissed before
    if(localStorage.getItem('sh-install-dismissed'))return;
    const banner=document.getElementById('installBanner');
    if(banner)banner.style.display='flex';
  });

  window.addEventListener('appinstalled',function(){
    const banner=document.getElementById('installBanner');
    if(banner)banner.style.display='none';
    deferredPrompt=null;
    showToast('App installed! Access Stats Hub from your home screen.');
  });
}

function installPWA(){
  if(!deferredPrompt)return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(function(result){
    if(result.outcome==='accepted')awardXP(25,'pwa-install');
    deferredPrompt=null;
    const banner=document.getElementById('installBanner');
    if(banner)banner.style.display='none';
  });
}

function dismissInstall(){
  const banner=document.getElementById('installBanner');
  if(banner)banner.style.display='none';
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-install-dismissed','1');
}
```

### 1c: Install Banner Styles

```css
.install-banner{
  position:fixed;bottom:0;left:0;right:0;z-index:1800;
  background:var(--bg2);border-top:1px solid var(--cyan);
  padding:12px 20px;display:flex;align-items:center;gap:12px;
  box-shadow:0 -2px 12px rgba(0,0,0,0.3);
}
.install-text{flex:1;font-size:13px;color:var(--text);font-family:'Space Mono',monospace;}
.install-btn{
  padding:8px 20px;background:var(--cyan);color:var(--bg);border:none;border-radius:6px;
  font-family:'Space Mono',monospace;font-size:13px;font-weight:700;cursor:pointer;
}
.install-btn:hover{background:var(--amber);}
.install-dismiss{background:none;border:none;color:var(--muted);font-size:18px;cursor:pointer;padding:4px;}
```

### 1d: Update Manifest for Installability

**File:** `manifest.json`

Ensure these fields exist for Chrome/Edge installability:
```json
{
  "name": "Stats Learning Hub",
  "short_name": "Stats Hub",
  "description": "Interactive statistics learning platform",
  "start_url": "./stats_hub.html",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#00e5c7",
  "orientation": "any",
  "categories": ["education"],
  "icons": [
    {"src": "./icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "./icons/icon-512.png", "sizes": "512x512", "type": "image/png"}
  ]
}
```

Create simple SVG-based PNG icons at `icons/icon-192.png` and `icons/icon-512.png`. Use a simple "SH" monogram on a dark background (#0a0a0f) with cyan text (#00e5c7). You can generate these with Canvas in a simple Node.js script, or create minimal PNGs.

---

## Task 2: Mobile Layout Optimization

### 2a: Touch-Friendly Targets

**File:** `styles/stats_hub.css`

Ensure all interactive elements meet 44x44px minimum touch target:

```css
@media(max-width:768px){
  .ch-btn{min-height:44px;padding:12px 16px;}
  .nav-btn,.nav-tab{min-height:44px;padding:8px 12px;font-size:13px;}
  .res-btn{min-height:44px;}
  .hint-btn{min-height:44px;padding:10px 16px;}
  .pomo-toggle{width:52px;height:52px;}
  .formula-toggle{min-height:44px;}
  .start-review-btn{min-height:48px;width:100%;font-size:16px;}
  .digest-action-btn{min-height:48px;width:100%;font-size:15px;}
}
```

### 2b: Mobile Navigation

Convert top nav to a bottom tab bar on mobile for thumb-friendly access:

```css
@media(max-width:600px){
  .top-nav{
    position:fixed;bottom:0;top:auto;
    border-bottom:none;border-top:1px solid var(--border);
    padding:0 8px;height:56px;justify-content:space-around;
  }
  .top-nav .nav-brand{display:none;}
  .top-nav .nav-pill{display:none;}
  .top-nav .theme-toggle{display:none;}
  body{padding-bottom:56px;padding-top:0;}
  .page{padding-top:16px;}
  .bottom-bar{display:none;}
  .pomo-widget{bottom:70px;}
  .install-banner{bottom:56px;}
}
```

### 2c: Mobile Visualizer Sizing

```css
@media(max-width:480px){
  canvas{max-height:240px;}
  .viz-controls{flex-direction:column;}
  .viz-controls label{font-size:12px;}
  .section-title{font-size:22px;}
  .section-desc{font-size:13px;}
}
```

---

## Task 3: Offline Status Indicator

Show users when they're offline so they know localStorage is their only persistence.

### 3a: Offline Banner

**File:** `stats_hub.html`

```html
<div class="offline-banner" id="offlineBanner" style="display:none;" role="alert">
  📡 You're offline — progress is saved locally
</div>
```

### 3b: Online/Offline Detection

**File:** `scripts/stats_hub.js`

```javascript
if(typeof window!=='undefined'){
  window.addEventListener('online',function(){
    const b=document.getElementById('offlineBanner');
    if(b)b.style.display='none';
  });
  window.addEventListener('offline',function(){
    const b=document.getElementById('offlineBanner');
    if(b)b.style.display='flex';
  });
  // Check on load
  if(typeof navigator!=='undefined'&&!navigator.onLine){
    document.addEventListener('DOMContentLoaded',function(){
      const b=document.getElementById('offlineBanner');
      if(b)b.style.display='flex';
    });
  }
}
```

### 3c: Offline Banner Style

```css
.offline-banner{
  position:fixed;top:0;left:0;right:0;z-index:2001;
  background:var(--amber);color:var(--bg);
  padding:8px 16px;text-align:center;
  font-family:'Space Mono',monospace;font-size:12px;font-weight:700;
}
```

---

## Constraints

- NEVER modify `tests/`. Guard all DOM/window/navigator calls.
- PWA install prompt must not show if user previously dismissed it.
- Mobile bottom nav must not break desktop layout.
- Offline indicator must not block content (positioned fixed, small height).
- Icons directory must be excluded from `.gitignore` (icons need to be committed).

## Verification

```bash
node tests/run_all.js
```
Expected: 185/185 pass. Manual: test install prompt in Chrome, bottom nav on mobile viewport, offline banner when disconnected.

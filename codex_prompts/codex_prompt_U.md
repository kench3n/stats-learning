# Codex Prompt U — Phase 17: Real Datasets, CSV Upload, Live Visualizations

## Project Context

Stats Learning Hub — single-page vanilla JS/HTML/CSS. NEVER modify `tests/`. Canvas-based visualizers exist for all units. `mean()`, `median()`, `mode()`, `stdev()`, `quantile()` functions exist.

---

## Task 1: Built-in Real Datasets

Replace synthetic data with curated, real-world datasets. Real data is more engaging and memorable.

### 1a: Dataset Library

**File:** `scripts/stats_hub.js`

```javascript
const DATASETS={
  iris:{
    name:'Iris Flower Measurements',
    desc:'150 measurements of 3 iris species (sepal/petal length & width)',
    cols:['sepal_length','sepal_width','petal_length','petal_width','species'],
    data:[
      // Include first 50 rows of classic iris dataset
      // Enough to demonstrate all statistical concepts
      [5.1,3.5,1.4,0.2,'setosa'],[4.9,3.0,1.4,0.2,'setosa'],
      // ... (include full 50 rows of setosa, 50 virginica, 50 versicolor)
    ]
  },
  grades:{
    name:'Student Exam Scores',
    desc:'200 students across 3 exam types with study hours',
    cols:['student_id','exam_type','score','study_hours','grade'],
    data:[
      // Generate realistic exam data: bimodal distribution, correlation between hours and scores
    ]
  },
  housing:{
    name:'Home Prices (sample)',
    desc:'50 homes with size, bedrooms, age, and sale price',
    cols:['sqft','bedrooms','age_years','price_k'],
    data:[
      // Realistic housing data for regression exercises
    ]
  }
};
```

### 1b: Dataset Selector on Visualizer Page

Add a "Load Dataset" dropdown to the visualizer controls:

```html
<div class="dataset-selector">
  <label for="datasetSelect">Dataset:</label>
  <select id="datasetSelect" onchange="loadDataset(this.value)">
    <option value="">Default (synthetic)</option>
    <option value="iris">Iris Flowers</option>
    <option value="grades">Exam Scores</option>
    <option value="housing">Home Prices</option>
    <option value="custom">Upload CSV...</option>
  </select>
</div>
```

### 1c: Dataset Integration

When a dataset is selected, extract the relevant column(s) and pass to the active visualizer:

```javascript
function loadDataset(key){
  if(key==='custom'){triggerCSVUpload();return;}
  if(!key){resetToDefaultData();return;}
  const ds=DATASETS[key];
  if(!ds)return;
  // Extract numeric columns
  const numericCols=ds.cols.filter((_,i)=>typeof ds.data[0][i]==='number');
  // Use first numeric column as primary data for histograms, boxplots etc.
  activeDataset=ds.data.map(row=>row[ds.cols.indexOf(numericCols[0])]);
  drawActiveVisualizer(true);
}
```

---

## Task 2: CSV Upload & Analysis

Let users upload their own data. Empowering and makes learning personal.

### 2a: CSV Parser

**File:** `scripts/stats_hub.js`

```javascript
function triggerCSVUpload(){
  const input=document.createElement('input');
  input.type='file';
  input.accept='.csv,.tsv,.txt';
  input.onchange=function(e){
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=function(ev){
      const text=ev.target.result;
      const parsed=parseCSV(text);
      if(parsed)loadCustomData(parsed);
    };
    reader.readAsText(file);
  };
  input.click();
}

function parseCSV(text){
  const lines=text.trim().split('\n');
  if(lines.length<2){showToast('CSV needs at least a header and one data row.');return null;}

  const delimiter=lines[0].includes('\t')?'\t':',';
  const headers=lines[0].split(delimiter).map(h=>h.trim().replace(/^"|"$/g,''));
  const data=[];

  for(let i=1;i<lines.length;i++){
    const vals=lines[i].split(delimiter).map(v=>v.trim().replace(/^"|"$/g,''));
    if(vals.length!==headers.length)continue;
    const row=vals.map(v=>{const n=parseFloat(v);return isNaN(n)?v:n;});
    data.push(row);
  }

  return{headers,data};
}

function loadCustomData(parsed){
  // Find numeric columns
  const numericIdx=parsed.headers.map((_,i)=>i).filter(i=>typeof parsed.data[0][i]==='number');
  if(!numericIdx.length){showToast('No numeric columns found in CSV.');return;}

  // Let user pick column if multiple
  activeDataset=parsed.data.map(row=>row[numericIdx[0]]).filter(v=>Number.isFinite(v));
  showToast('Loaded '+activeDataset.length+' values from column "'+parsed.headers[numericIdx[0]]+'"');
  drawActiveVisualizer(true);
}
```

### 2b: Column Picker (if multiple numeric columns)

Show a quick modal to pick which column to visualize:

```javascript
function showColumnPicker(parsed,numericIdx){
  // Render a simple dropdown overlay
  // User selects column → data loads → visualizer redraws
}
```

---

## Task 3: Live Data Visualizations

When custom or real data is loaded, update visualizers to use that data in real-time.

### 3a: Data-Aware Visualizers

Update Unit 1 visualizers to accept external data:

```javascript
// In drawHist(), drawBox(), drawNorm(), drawComp():
// Check if activeDataset is set, use it instead of default synthetic data
// Fall back to existing preset data if activeDataset is null

function getActiveData(){
  if(activeDataset&&activeDataset.length>0)return activeDataset;
  // Return default preset data
  return getPresetData();
}
```

### 3b: Auto-Computed Stats Panel

When custom data is loaded, show a stats summary:

```html
<div class="data-stats" id="dataStats" style="display:none;">
  <div class="data-stat">n = <span id="dsN">0</span></div>
  <div class="data-stat">x̄ = <span id="dsMean">0</span></div>
  <div class="data-stat">s = <span id="dsStdev">0</span></div>
  <div class="data-stat">med = <span id="dsMedian">0</span></div>
  <div class="data-stat">min = <span id="dsMin">0</span></div>
  <div class="data-stat">max = <span id="dsMax">0</span></div>
</div>
```

Update stats whenever data changes.

---

## Constraints

- NEVER modify `tests/`. Guard all DOM/FileReader calls.
- CSV parser must handle commas in quoted fields, empty rows, and mixed types.
- Datasets must be small enough to not bloat stats_hub.js (50-150 rows max per dataset).
- Custom data must not persist in localStorage (too large) — session only.
- Visualizers must gracefully fall back to synthetic data when no dataset is loaded.

## Verification

```bash
node tests/run_all.js
```
Expected: 185/185 pass. Manual: load iris dataset → histogram redraws with real data, upload a CSV → stats panel shows correct values, switch back to default → original data returns.

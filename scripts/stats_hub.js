// ===================== NAVIGATION =====================
function syncTabState(tabBar,activeTab){
  if(!tabBar)return;
  tabBar.querySelectorAll('[role="tab"]').forEach(t=>{
    const on=t===activeTab;
    t.setAttribute('aria-selected',on?'true':'false');
    t.setAttribute('tabindex',on?'0':'-1');
  });
}

function goPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  const navTabs=document.querySelector('.nav-tabs[role="tablist"]');
  const activeTab=[...document.querySelectorAll('.nav-tab')].find(t=>t.textContent.toLowerCase()===id);
  if(activeTab){activeTab.classList.add('active');syncTabState(navTabs,activeTab);}
  window.scrollTo(0,0);
  if(id==='visualizer'){setTimeout(()=>{drawActiveVisualizer();},50);}
}
function showSub(prefix,id,btn){
  if(prefix==='viz'&&currentUnit!==1)return;
  const parent=prefix==='rm'?'page-roadmap':prefix==='viz'?'page-visualizer':null;
  if(!parent)return;
  const tabBar=prefix==='rm'?document.getElementById('roadmapTabs'):document.getElementById('vizTabs');
  tabBar.querySelectorAll('.sub-tab').forEach(t=>t.classList.remove('active'));
  if(btn)btn.classList.add('active');
  syncTabState(tabBar,btn||null);
  const container=prefix==='rm'?document.getElementById('rm-panels'):document.getElementById('viz-panels');
  container.querySelectorAll('.sub-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById((prefix==='rm'?'rm-':prefix==='viz'?'viz-':'')+id).classList.add('active');
  if(prefix==='viz')setTimeout(()=>{if(id==='hist')drawHist();if(id==='box')drawBox();if(id==='norm')drawNorm();if(id==='comp')drawComp();},30);
}

// ===================== KEYBOARD NAV =====================
function handleTabKeyboard(e,tabBar){
  const tabs=[...tabBar.querySelectorAll('[role="tab"]')];
  const idx=tabs.indexOf(e.target);
  if(idx<0)return;
  let next=-1;
  if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();next=(idx+1)%tabs.length;}
  else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();next=(idx-1+tabs.length)%tabs.length;}
  else if(e.key==='Home'){e.preventDefault();next=0;}
  else if(e.key==='End'){e.preventDefault();next=tabs.length-1;}
  if(next>=0){tabs[next].focus();tabs[next].click();}
}
if(typeof document!=='undefined'&&typeof document.addEventListener==='function'){document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[role="tablist"]').forEach(tl=>{
    const active=tl.querySelector('[role="tab"][aria-selected="true"]')||tl.querySelector('[role="tab"]');
    syncTabState(tl,active||null);
  });
  document.addEventListener('keydown',e=>{
    const tab=e.target&&e.target.closest?e.target.closest('[role="tab"]'):null;
    const tabList=tab&&tab.closest?tab.closest('[role="tablist"]'):null;
    if(tab&&tabList)handleTabKeyboard(e,tabList);
  });
});}

// ===================== UTILITIES =====================
function rand(a,b){return a+Math.random()*(b-a)}
function randn(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function sorted(a){return[...a].sort((x,y)=>x-y)}
function mean(a){if(!a.length)return 0;return a.reduce((s,v)=>s+v,0)/a.length}
function median(a){const s=sorted(a),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2}
function mode(a){const f={};a.forEach(v=>{const k=Math.round(v*2)/2;f[k]=(f[k]||0)+1});let mx=0,mv=0;for(let k in f)if(f[k]>mx){mx=f[k];mv=+k}return mv}
function stdev(a){const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/a.length)}
function quantile(a,q){const s=sorted(a),p=(s.length-1)*q,b=Math.floor(p),f=p-b;return s[b]+(s[b+1]-s[b]||0)*f}
function normalPDF(x,mu,sig){if(sig<=0)return 0;return Math.exp(-0.5*((x-mu)/sig)**2)/(sig*Math.sqrt(2*Math.PI))}
function erf(x){const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;const s=x<0?-1:1;x=Math.abs(x);const t=1/(1+p*x);const y=1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);return s*y}
function normalCDF(x,mu,sig){if(sig<=0)return x>=mu?1:0;return 0.5*(1+erf((x-mu)/(sig*Math.sqrt(2))))}
function gNum(id,fallback){const el=document.getElementById(id);return el?+el.value:fallback}
function fmtPct(v){return (v*100).toFixed(1)+'%'}
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v))}
function comb(n,k){
  if(k<0||k>n)return 0;
  if(k===0||k===n)return 1;
  k=Math.min(k,n-k);
  let c=1;
  for(let i=0;i<k;i++)c=c*(n-i)/(i+1);
  return c;
}

// ===================== ROADMAP DATA =====================
const RM={l1:[
{p:"math",icon:"∑",time:"8–12 wk",name:"Mathematics",goal:"Establish and solve deterministic problems with algebra",topics:[
{n:"Solving linear and quadratic equations"},{n:"Functions and their graphs"},{n:"Polynomials and rational functions"},{n:"Exponents and logarithms"},{n:"Coordinate geometry"},{n:"Basic proofs and mathematical reasoning"}],
res:[{t:"Book",n:"Stewart — Precalculus"},{t:"Course",n:"Khan Academy — Algebra I & II"}]},
{p:"stats",icon:"μ",time:"8–12 wk",name:"Probability & Statistics",goal:"Model fixed randomness — dice rolls, coin flips, basic distributions",topics:[
{n:"Mean, median, mode, range"},{n:"Variance and standard deviation"},{n:"Sample spaces and events"},{n:"Conditional probability"},{n:"Combinatorics (permutations & combinations)"},{n:"Set theory basics"},{n:"Common distributions (normal, binomial, Poisson)",tag:"new"},{n:"Hypothesis testing & confidence intervals",tag:"new"}],
res:[{t:"Book",n:"Devore — Probability and Statistics"},{t:"Course",n:"MIT 18.05 (OCW)"},{t:"Course",n:"Khan Academy — Statistics"}]},
{p:"cs",icon:"{ }",time:"10–16 wk",name:"Computer Science",goal:"Write working programs, understand data structures & complexity",topics:[
{n:"Python fundamentals (or C++)"},{n:"Data structures: arrays, linked lists, hash maps, trees"},{n:"Sorting algorithms (merge, quick, heap)"},{n:"Time/space complexity (Big-O)"},{n:"CLI & Git"},{n:"SQL and relational databases",tag:"new"},{n:"Data wrangling (pandas, numpy)",tag:"new"}],
res:[{t:"Course",n:"MIT 6.0001 (OCW)"},{t:"Book",n:"CLRS — Intro to Algorithms"}]},
{p:"finance",icon:"$",time:"6–10 wk",name:"Finance & Economics",goal:"Understand financial news — interest rates, monetary vs. fiscal policy",topics:[
{n:"Market and macroeconomic basics"},{n:"Stocks, bonds, fixed income fundamentals"},{n:"Time value of money (PV, FV, NPV)"},{n:"Supply and demand, equilibrium"},{n:"GDP"},{n:"Monetary vs. fiscal policy"},{n:"Inflation and real vs. nominal values"},{n:"Market microstructure basics (bid-ask, order books)",tag:"new"}],
res:[{t:"Book",n:"Bodie, Kane, Marcus — Investments"},{t:"Course",n:"Yale ECON 252 (Shiller, Coursera)"}]}
],l2:[
{p:"math",icon:"∑",time:"12–16 wk",name:"Calculus & Linear Algebra",goal:"Solve problems with calculus; understand high-dimensional space",topics:[
{n:"Limits, derivatives, and integrals"},{n:"Optimization (minima/maxima)"},{n:"Multivariate calculus (partial derivatives, gradients)"},{n:"Vectors, matrices, matrix operations"},{n:"Eigenvalues and eigenvectors"},{n:"Solving systems of linear equations"},{n:"Numerical methods (root-finding, interpolation)",tag:"new"}],
res:[{t:"Book",n:"Stewart — Calculus"},{t:"Book",n:"Strang — Linear Algebra"},{t:"Video",n:"3Blue1Brown — Essence of Linear Algebra"}]},
{p:"stats",icon:"μ",time:"12–16 wk",name:"Time Series & Regression",goal:"Understand real-world modeling assumptions; basic stats often beat ML",topics:[
{n:"Linear regression (OLS, assumptions, diagnostics)"},{n:"AR and MA models"},{n:"ARMA / ARIMA / GARCH"},{n:"Stationarity and unit root tests"},{n:"Monte Carlo simulation",tag:"new"},{n:"Maximum likelihood estimation",tag:"new"},{n:"Probability distributions and inference"}],
res:[{t:"Book",n:"Hamilton — Time Series Analysis"},{t:"Book",n:"Tsay — Analysis of Financial Time Series"}]},
{p:"cs",icon:"{ }",time:"10–14 wk",name:"Advanced CS & Data Engineering",goal:"Algorithms, search procedures, reliable data pipelines",topics:[
{n:"Advanced data structures (graphs, heaps, tries)"},{n:"Dynamic programming"},{n:"OOP and functional patterns"},{n:"APIs, networking, HTTP"},{n:"Data pipelines and ETL",tag:"new"},{n:"Advanced SQL (window functions, CTEs)",tag:"new"},{n:"Testing and version control"}],
res:[{t:"Book",n:"Skiena — Algorithm Design Manual"},{t:"Practice",n:"LeetCode Medium/Hard + HackerRank SQL"}]},
{p:"ml",icon:"◎",time:"10–14 wk",name:"Machine Learning",goal:"Full model pipeline; know when ML actually beats simpler methods",topics:[
{n:"Supervised vs. unsupervised learning"},{n:"Bias-variance tradeoff",tag:"key"},{n:"Cross-validation and evaluation metrics"},{n:"Linear & logistic regression (as ML)"},{n:"Trees, random forests, gradient boosting"},{n:"SVM and k-nearest neighbors"},{n:"Intro to neural networks"},{n:"When NOT to use ML (baselines first)",tag:"new"}],
res:[{t:"Book",n:"Hastie — Elements of Statistical Learning"},{t:"Course",n:"Stanford CS229 (Andrew Ng)"}]},
{p:"finance",icon:"$",time:"8–12 wk",name:"Financial Theory & Instruments",goal:"Understand models deeply — then identify where they break down",topics:[
{n:"Options, futures, swaps"},{n:"Fixed income: yield, duration, convexity"},{n:"FX markets"},{n:"CAPM — learn it, then learn its limits"},{n:"EMH — weak, semi-strong, strong forms"},{n:"Alpha: why it exists and where to find it"},{n:"DCF valuation and risk management"},{n:"Order book dynamics, slippage, market impact",tag:"new"},{n:"Portfolio optimization (mean-variance, Sharpe)",tag:"new"}],
res:[{t:"Book",n:"Hull — Options, Futures, and Other Derivatives"},{t:"Book",n:"de Prado — Advances in Financial ML"}]}
],l3:[
{p:"math",icon:"∑",time:"16–24 wk",name:"Stochastic Calculus & Advanced Math",goal:"Apply stochastic calculus to pricing; understand financial mathematics",topics:[
{n:"Measure theory and real analysis",tag:"new"},{n:"Measure-theoretic probability",tag:"new"},{n:"Martingales, filtrations, conditional expectation"},{n:"Brownian motion and stochastic processes"},{n:"Itô calculus and SDEs"},{n:"Solving the Black-Scholes PDE"},{n:"Finite difference methods for PDEs",tag:"new"},{n:"Monte Carlo methods for pricing",tag:"new"}],
res:[{t:"Book",n:"Shreve — Stochastic Calculus for Finance I & II"},{t:"Course",n:"MIT 18.S096 (OCW)"}]},
{p:"stats",icon:"μ",time:"12–16 wk",name:"Advanced Statistics & Inference",goal:"Handle non-standard data, robust estimation, Bayesian reasoning",topics:[
{n:"Bayesian inference (prior, likelihood, posterior)"},{n:"Nonparametric methods"},{n:"Robust statistics (outliers, non-normal data)"},{n:"Causal inference"},{n:"Extreme value theory",tag:"new"},{n:"Copulas and dependence modeling",tag:"new"},{n:"Change-point detection and regime switching",tag:"new"}],
res:[{t:"Book",n:"Gelman — Bayesian Data Analysis"},{t:"Book",n:"Embrechts — Modelling Extremal Events"}]},
{p:"ml",icon:"◎",time:"12–16 wk",name:"ML for Finance & Advanced Methods",goal:"Apply ML rigorously to time series; avoid the traps that ruin financial ML",topics:[
{n:"Feature engineering for finance"},{n:"Walk-forward validation & backtesting",tag:"key"},{n:"Avoiding lookahead bias",tag:"key"},{n:"Deep learning: RNNs, LSTMs"},{n:"Reinforcement learning (policy search, Q-learning)"},{n:"Combining alpha signals"},{n:"Transformer models for financial data",tag:"new"}],
res:[{t:"Book",n:"de Prado — Advances in Financial ML"},{t:"Book",n:"Goodfellow — Deep Learning"}]},
{p:"finance",icon:"$",time:"10–14 wk",name:"Advanced Finance & Behavioral",goal:"Bridge theory to practice — form model-informed views on markets",topics:[
{n:"Behavioral finance and advanced risk mgmt"},{n:"Cognitive biases and market anomalies"},{n:"Exotic option pricing",tag:"new"},{n:"Tail risk and black swan events"},{n:"Factor models (Fama-French)",tag:"new"},{n:"Risk measures (VaR, CVaR, drawdown)",tag:"new"}],
res:[{t:"Book",n:"Taleb — Dynamic Hedging"},{t:"Book",n:"Ang — Asset Management"}]},
{p:"infra",icon:"⚡",time:"10–14 wk",name:"Infrastructure & Systems",goal:"Build production-grade: low-latency execution, distributed computing",topics:[
{n:"Numerical optimization (gradient descent, Newton)"},{n:"Low-latency architecture"},{n:"Concurrency and parallelism"},{n:"Distributed systems (microservices, MQ)"},{n:"Cloud computing (AWS/GCP)",tag:"new"},{n:"Execution systems & smart order routing",tag:"new"},{n:"Monitoring, logging, reliability",tag:"new"}],
res:[{t:"Book",n:"Kleppmann — Designing Data-Intensive Applications"}]}
]};

const roles=[
{title:"Quant Trader",reqs:[{n:"Mathematics",l:"Level 2",c:"rl-2"},{n:"Probability & Statistics",l:"Mastery",c:"rl-m"},{n:"Computer Science",l:"Level 2",c:"rl-2"},{n:"Machine Learning",l:"Level 2",c:"rl-2"},{n:"Finance & Economics",l:"Level 3",c:"rl-3"},{n:"Infrastructure",l:"Level 2",c:"rl-2"}]},
{title:"Quant Developer",reqs:[{n:"Mathematics",l:"Level 2",c:"rl-2"},{n:"Probability & Statistics",l:"Level 2",c:"rl-2"},{n:"Computer Science",l:"Mastery",c:"rl-m"},{n:"Machine Learning",l:"Level 3",c:"rl-3"},{n:"Finance & Economics",l:"Level 2",c:"rl-2"},{n:"Infrastructure",l:"Mastery",c:"rl-m"}]},
{title:"Quant Researcher",reqs:[{n:"Mathematics",l:"Mastery",c:"rl-m"},{n:"Probability & Statistics",l:"Mastery",c:"rl-m"},{n:"Computer Science",l:"Level 3",c:"rl-3"},{n:"Machine Learning",l:"Level 3",c:"rl-3"},{n:"Finance & Economics",l:"Level 3",c:"rl-3"},{n:"Infrastructure",l:"Level 2",c:"rl-2"}]}
];

const levelMeta={l1:{label:"Level 1",title:"Foundations — Learn to Do",desc:"Build the base. Solve deterministic problems, write code, understand basic probability, read financial news.",time:"6 – 12 months"},l2:{label:"Level 2",title:"Depth — Learn to Understand",desc:"Think critically, see connections. Build real models, evaluate rigorously, form views on markets.",time:"12 – 18 months"},l3:{label:"Level 3",title:"Mastery — Learn to Create",desc:"New quantitative ideas come from mastery. You're not just applying methods — you're inventing new ones.",time:"12 – 24+ months"}};

function buildRoadmap(){
  const container=document.getElementById('rm-panels');
  let html='';
  ['l1','l2','l3'].forEach(lk=>{
    const lm=levelMeta[lk];const cards=RM[lk];
    html+=`<div class="sub-panel ${lk==='l1'?'active':''}" id="rm-${lk}">
      <div class="level-header"><div class="level-label">${lm.label}</div><div class="level-title">${lm.title}</div><div class="level-desc">${lm.desc}</div><div class="level-time">${lm.time}</div></div>
      <div class="pillar-grid">`;
    cards.forEach(c=>{
      html+=`<div class="pillar-card" data-p="${c.p}"><div class="ph"><div class="pi">${c.icon}</div><span class="pt">${c.time}</span></div><div class="pn-row"><div class="pn">${c.name}</div></div><div class="pg">${c.goal}</div><div class="tl">`;
      c.topics.forEach(t=>{
        html+=`<div class="ti" onclick="toggleTopic(this)"><div class="tc"></div><span class="tn">${t.n}</span>${t.tag?`<span class="tt tt-${t.tag}">${t.tag}</span>`:''}</div>`;
      });
      html+=`</div><div class="res-tog"><button class="res-btn" onclick="toggleRes(this)">Resources ↓</button></div><div class="res-panel">`;
      (c.res||[]).forEach(r=>{html+=`<div class="res-item"><div class="res-type">${r.t}</div><div class="res-name">${r.n}</div></div>`;});
      html+=`</div></div>`;
    });
    html+=`</div></div>`;
  });
  // Roles
  html+=`<div class="sub-panel" id="rm-roles"><div class="level-header"><div class="level-label">Career Paths</div><div class="level-title">Minimum Levels by Role</div><div class="level-desc">You don't have to master everything. Here's the minimum for each role.</div></div><div class="roles-grid">`;
  roles.forEach(r=>{
    html+=`<div class="role-card"><div class="role-title">${r.title}</div>`;
    r.reqs.forEach(q=>{html+=`<div class="role-req"><span class="rn">${q.n}</span><span class="rl ${q.c}">${q.l}</span></div>`;});
    html+=`</div>`;
  });
  html+=`</div></div>`;
  container.innerHTML=html;
  restoreTopics();
  updateTopicProgress();
}

function getTopicState(){try{return JSON.parse(localStorage.getItem('sh-topics')||'{}')}catch{return{}}}
function saveTopicState(s){localStorage.setItem('sh-topics',JSON.stringify(s))}
function toggleTopic(el){el.classList.toggle('chk');const n=el.querySelector('.tn').textContent;const s=getTopicState();s[n]=el.classList.contains('chk');saveTopicState(s);updateTopicProgress();}
function restoreTopics(){const s=getTopicState();document.querySelectorAll('.ti').forEach(el=>{const n=el.querySelector('.tn').textContent;if(s[n])el.classList.add('chk');});}
function toggleRes(btn){const p=btn.closest('.pillar-card').querySelector('.res-panel');p.classList.toggle('open');btn.textContent=p.classList.contains('open')?'Resources ↑':'Resources ↓';}
function updateTopicProgress(){
  const total=document.querySelectorAll('.ti').length;
  const checked=document.querySelectorAll('.ti.chk').length;
  const pct=total?checked/total*100:0;
  document.getElementById('bpFill').style.width=pct+'%';
  document.getElementById('bpText').textContent=checked+' / '+total+' topics';
  document.getElementById('topicCount').textContent=checked;
  document.getElementById('topicTotal').textContent=total;
}

// ===================== HISTOGRAM =====================
let histData=[];
function genData(type,n){const d=[];if(type==='symmetric')for(let i=0;i<n;i++)d.push(randn()*15+50);else if(type==='right')for(let i=0;i<n;i++)d.push(Math.exp(randn()*0.5+2));else if(type==='left')for(let i=0;i<n;i++)d.push(100-Math.exp(randn()*0.5+2));else if(type==='bimodal')for(let i=0;i<n;i++)d.push(Math.random()<0.5?randn()*8+30:randn()*8+70);else if(type==='uniform')for(let i=0;i<n;i++)d.push(rand(10,90));return d;}
function loadPreset(){histData=genData(document.getElementById('histPreset').value,+document.getElementById('sizeSlider').value);drawHist();}
function loadCustom(){const nums=document.getElementById('customData').value.split(/[,\s]+/).map(Number).filter(v=>!isNaN(v));if(nums.length>1){histData=nums;drawHist();}}
function drawHist(){
  if(!histData.length)return;const c=document.getElementById('histCanvas'),ctx=c.getContext('2d');const dpr=window.devicePixelRatio||1;c.width=c.offsetWidth*dpr;c.height=300*dpr;ctx.scale(dpr,dpr);const W=c.offsetWidth,H=300;ctx.clearRect(0,0,W,H);
  const bins=+document.getElementById('binSlider').value;const mn=Math.min(...histData),mx=Math.max(...histData);const bw=(mx-mn)/bins||1;const counts=new Array(bins).fill(0);histData.forEach(v=>{let b=Math.min(Math.floor((v-mn)/bw),bins-1);counts[b]++;});const maxC=Math.max(...counts);
  const pad={l:46,r:16,t:16,b:36};const pw=W-pad.l-pad.r,ph=H-pad.t-pad.b;
  ctx.strokeStyle='#1c1c30';ctx.lineWidth=1;for(let i=0;i<=4;i++){const y=pad.t+ph*(1-i/4);ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();ctx.fillStyle='#55556888';ctx.font='10px Space Mono';ctx.textAlign='right';ctx.fillText(Math.round(maxC*i/4),pad.l-6,y+4);}
  const barW=pw/bins;counts.forEach((cc,i)=>{const x=pad.l+i*barW;const h=(cc/maxC)*ph;const y=pad.t+ph-h;const g=ctx.createLinearGradient(x,y,x,pad.t+ph);g.addColorStop(0,'rgba(6,182,212,0.7)');g.addColorStop(1,'rgba(6,182,212,0.15)');ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(x+1,y,barW-2,h,3);ctx.fill();});
  ctx.fillStyle='#55556888';ctx.font='10px Space Mono';ctx.textAlign='center';for(let i=0;i<=bins;i+=Math.max(1,Math.floor(bins/6)))ctx.fillText((mn+i*bw).toFixed(1),pad.l+i*barW,H-pad.b+16);
  const m=mean(histData),med=median(histData);const mX=pad.l+((m-mn)/(mx-mn))*pw,medX=pad.l+((med-mn)/(mx-mn))*pw;
  ctx.setLineDash([6,4]);ctx.strokeStyle='#06b6d4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(mX,pad.t);ctx.lineTo(mX,pad.t+ph);ctx.stroke();ctx.strokeStyle='#f59e0b';ctx.beginPath();ctx.moveTo(medX,pad.t);ctx.lineTo(medX,pad.t+ph);ctx.stroke();ctx.setLineDash([]);
  ctx.font='11px DM Sans';ctx.fillStyle='#06b6d4';ctx.textAlign='left';ctx.fillText('Mean',mX+5,pad.t+12);ctx.fillStyle='#f59e0b';ctx.fillText('Median',medX+5,pad.t+26);
  const sd=stdev(histData),q1=quantile(histData,0.25),q3=quantile(histData,0.75);
  document.getElementById('hMean').textContent=m.toFixed(2);document.getElementById('hMedian').textContent=med.toFixed(2);document.getElementById('hMode').textContent=mode(histData).toFixed(1);document.getElementById('hSD').textContent=sd.toFixed(2);document.getElementById('hIQR').textContent=(q3-q1).toFixed(2);document.getElementById('hRange').textContent=(mx-mn).toFixed(2);
}

// ===================== BOXPLOT =====================
function drawBox(){
  const type=document.getElementById('boxPreset').value;let data;
  if(type==='symmetric')data=[12,15,17,18,19,20,20,21,22,23,24,25,26,27,28,29,30,31,33,35];
  else if(type==='right')data=[2,3,4,5,5,6,7,8,9,10,12,15,20,25,35,50];
  else data=[5,10,12,14,15,16,17,18,19,20,21,22,23,24,25,60];
  const ov=+document.getElementById('outlierSlider').value;if(ov>0)data=[...data,data[data.length-1]+ov*1.5];
  const s=sorted(data);const mn=s[0],mx=s[s.length-1],q1=quantile(s,0.25),med=median(s),q3=quantile(s,0.75);const iqr=q3-q1,lo=q1-1.5*iqr,hi=q3+1.5*iqr;const wLo=s.find(v=>v>=lo),wHi=[...s].reverse().find(v=>v<=hi);const outliers=s.filter(v=>v<lo||v>hi);
  document.getElementById('bMin').textContent=mn.toFixed(1);document.getElementById('bQ1').textContent=q1.toFixed(1);document.getElementById('bMed').textContent=med.toFixed(1);document.getElementById('bQ3').textContent=q3.toFixed(1);document.getElementById('bMax').textContent=mx.toFixed(1);document.getElementById('bIQR').textContent=iqr.toFixed(1);
  const c=document.getElementById('boxCanvas'),ctx=c.getContext('2d');const dpr=window.devicePixelRatio||1;c.width=c.offsetWidth*dpr;c.height=260*dpr;ctx.scale(dpr,dpr);const W=c.offsetWidth,H=260;ctx.clearRect(0,0,W,H);
  const pad={l:50,r:50,t:50,b:50};const pw=W-pad.l-pad.r;const toX=v=>pad.l+((v-mn)/(mx-mn||1))*pw;const cy=H/2;
  ctx.strokeStyle='#1c1c30';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad.l,H-pad.b+16);ctx.lineTo(W-pad.r,H-pad.b+16);ctx.stroke();
  ctx.fillStyle='#55556888';ctx.font='10px Space Mono';ctx.textAlign='center';const step=(mx-mn)/5;for(let i=0;i<=5;i++)ctx.fillText((mn+i*step).toFixed(1),toX(mn+i*step),H-pad.b+32);
  ctx.strokeStyle='#8a88a0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(toX(wLo),cy);ctx.lineTo(toX(q1),cy);ctx.stroke();ctx.beginPath();ctx.moveTo(toX(q3),cy);ctx.lineTo(toX(wHi),cy);ctx.stroke();
  ctx.beginPath();ctx.moveTo(toX(wLo),cy-14);ctx.lineTo(toX(wLo),cy+14);ctx.stroke();ctx.beginPath();ctx.moveTo(toX(wHi),cy-14);ctx.lineTo(toX(wHi),cy+14);ctx.stroke();
  const bx=toX(q1),bx2=toX(q3),bh=56;const g=ctx.createLinearGradient(bx,cy-bh/2,bx2,cy+bh/2);g.addColorStop(0,'rgba(6,182,212,0.25)');g.addColorStop(1,'rgba(6,182,212,0.08)');ctx.fillStyle=g;ctx.strokeStyle='#06b6d4';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(bx,cy-bh/2,bx2-bx,bh,4);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#f59e0b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(toX(med),cy-bh/2);ctx.lineTo(toX(med),cy+bh/2);ctx.stroke();
  outliers.forEach(v=>{ctx.beginPath();ctx.arc(toX(v),cy,5,0,Math.PI*2);ctx.fillStyle='rgba(244,114,182,0.4)';ctx.fill();ctx.strokeStyle='#f472b6';ctx.lineWidth=1.5;ctx.stroke();});
  s.filter(v=>v>=lo&&v<=hi).forEach(v=>{ctx.beginPath();ctx.arc(toX(v),cy+bh/2+16,2,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fill();});
}

// ===================== NORMAL =====================
function drawNorm(){
  const mu=+document.getElementById('muSlider').value,sig=+document.getElementById('sigSlider').value,region=document.getElementById('normRegion').value;
  document.getElementById('muVal').textContent=mu.toFixed(1);document.getElementById('sigVal').textContent=sig.toFixed(1);document.getElementById('zGrp').style.display=region==='custom'?'flex':'none';
  let k=1;if(region==='68')k=1;else if(region==='95')k=2;else if(region==='997')k=3;else if(region==='custom'){k=+document.getElementById('zSlider').value;document.getElementById('zVal').textContent=k.toFixed(2);}
  const lo=mu-k*sig,hi=mu+k*sig;const area=region==='none'?0:(normalCDF(hi,mu,sig)-normalCDF(lo,mu,sig))*100;
  document.getElementById('nArea').textContent=region==='none'?'—':area.toFixed(1)+'%';document.getElementById('nLeft').textContent=region==='none'?'—':lo.toFixed(2);document.getElementById('nRight').textContent=region==='none'?'—':hi.toFixed(2);
  const c=document.getElementById('normCanvas'),ctx=c.getContext('2d');const dpr=window.devicePixelRatio||1;c.width=c.offsetWidth*dpr;c.height=340*dpr;ctx.scale(dpr,dpr);const W=c.offsetWidth,H=340;ctx.clearRect(0,0,W,H);
  const pad={l:44,r:24,t:24,b:44};const pw=W-pad.l-pad.r,ph=H-pad.t-pad.b;const xMin=-6,xMax=6;const toX=x=>pad.l+((x-xMin)/(xMax-xMin))*pw;const maxY=normalPDF(mu,mu,sig);const toY=y=>pad.t+ph*(1-y/maxY*0.9);
  ctx.strokeStyle='#1c1c30';ctx.lineWidth=1;for(let x=-6;x<=6;x++){if(!x)continue;ctx.beginPath();ctx.moveTo(toX(x),pad.t);ctx.lineTo(toX(x),pad.t+ph);ctx.stroke();}
  ctx.strokeStyle='#2c2c48';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pad.l,pad.t+ph);ctx.lineTo(W-pad.r,pad.t+ph);ctx.stroke();
  ctx.fillStyle='#55556888';ctx.font='10px Space Mono';ctx.textAlign='center';for(let x=-6;x<=6;x+=2)ctx.fillText(x,toX(x),H-pad.b+16);
  if(region!=='none'){ctx.beginPath();const lC=Math.max(xMin,lo),hC=Math.min(xMax,hi);ctx.moveTo(toX(lC),toY(0));for(let x=lC;x<=hC;x+=0.02)ctx.lineTo(toX(x),toY(normalPDF(x,mu,sig)));ctx.lineTo(toX(hC),toY(0));ctx.closePath();const g=ctx.createLinearGradient(0,pad.t,0,pad.t+ph);g.addColorStop(0,'rgba(6,182,212,0.3)');g.addColorStop(1,'rgba(6,182,212,0.02)');ctx.fillStyle=g;ctx.fill();}
  ctx.beginPath();for(let x=xMin;x<=xMax;x+=0.02){const px=toX(x),py=toY(normalPDF(x,mu,sig));x===xMin?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.strokeStyle='#06b6d4';ctx.lineWidth=2.5;ctx.stroke();
  ctx.setLineDash([6,4]);ctx.strokeStyle='rgba(6,182,212,0.4)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(toX(mu),pad.t);ctx.lineTo(toX(mu),pad.t+ph);ctx.stroke();ctx.setLineDash([]);
  if(region!=='none'){ctx.fillStyle='#06b6d4';ctx.font='13px DM Sans';ctx.textAlign='center';ctx.fillText(area.toFixed(1)+'%',toX(mu),toY(normalPDF(mu,mu,sig)*0.4));}
}

// ===================== COMPARE =====================
function drawComp(){
  const muA=+document.getElementById('muAS').value,sigA=+document.getElementById('sigAS').value,muB=+document.getElementById('muBS').value,sigB=+document.getElementById('sigBS').value;
  document.getElementById('muA').textContent=muA.toFixed(1);document.getElementById('sigA').textContent=sigA.toFixed(1);document.getElementById('muB').textContent=muB.toFixed(1);document.getElementById('sigB').textContent=sigB.toFixed(1);
  const c=document.getElementById('compCanvas'),ctx=c.getContext('2d');const dpr=window.devicePixelRatio||1;c.width=c.offsetWidth*dpr;c.height=320*dpr;ctx.scale(dpr,dpr);const W=c.offsetWidth,H=320;ctx.clearRect(0,0,W,H);
  const pad={l:36,r:24,t:24,b:44};const pw=W-pad.l-pad.r,ph=H-pad.t-pad.b;const xMin=-8,xMax=8;const toX=x=>pad.l+((x-xMin)/(xMax-xMin))*pw;const maxY=Math.max(normalPDF(muA,muA,sigA),normalPDF(muB,muB,sigB));const toY=y=>pad.t+ph*(1-y/maxY*0.9);
  ctx.strokeStyle='#2c2c48';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad.l,pad.t+ph);ctx.lineTo(W-pad.r,pad.t+ph);ctx.stroke();ctx.fillStyle='#55556888';ctx.font='10px Space Mono';ctx.textAlign='center';for(let x=-8;x<=8;x+=2)ctx.fillText(x,toX(x),H-pad.b+16);
  ctx.beginPath();ctx.moveTo(toX(xMin),toY(0));for(let x=xMin;x<=xMax;x+=0.02)ctx.lineTo(toX(x),toY(normalPDF(x,muA,sigA)));ctx.lineTo(toX(xMax),toY(0));ctx.closePath();ctx.fillStyle='rgba(6,182,212,0.1)';ctx.fill();
  ctx.beginPath();ctx.moveTo(toX(xMin),toY(0));for(let x=xMin;x<=xMax;x+=0.02)ctx.lineTo(toX(x),toY(normalPDF(x,muB,sigB)));ctx.lineTo(toX(xMax),toY(0));ctx.closePath();ctx.fillStyle='rgba(244,114,182,0.1)';ctx.fill();
  ctx.beginPath();for(let x=xMin;x<=xMax;x+=0.02){const px=toX(x),py=toY(normalPDF(x,muA,sigA));x===xMin?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.strokeStyle='#06b6d4';ctx.lineWidth=2.5;ctx.stroke();
  ctx.beginPath();for(let x=xMin;x<=xMax;x+=0.02){const px=toX(x),py=toY(normalPDF(x,muB,sigB));x===xMin?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.strokeStyle='#f472b6';ctx.lineWidth=2.5;ctx.stroke();
  ctx.font='12px DM Sans';ctx.fillStyle='#06b6d4';ctx.textAlign='center';ctx.fillText('A',toX(muA),toY(normalPDF(muA,muA,sigA))-10);ctx.fillStyle='#f472b6';ctx.fillText('B',toX(muB),toY(normalPDF(muB,muB,sigB))-10);
}

// ===================== PRACTICE =====================
const probs=[
{id:1,diff:'easy',topic:'Mean',q:'Find the mean of the following dataset:',data:'12, 15, 18, 22, 28, 35',type:'fr',ans:21.67,tol:0.1,ex:'Mean = (12+15+18+22+28+35)/6 = 130/6 ≈ 21.67'},
{id:2,diff:'easy',topic:'Median',q:'Find the median of this dataset:',data:'3, 7, 8, 12, 14, 18, 21',type:'mc',ans:2,ch:['8','14','12','11'],ex:'With 7 values, the median is the 4th: 3, 7, 8, [12], 14, 18, 21.'},
{id:3,diff:'easy',topic:'Median',q:'Find the median of this dataset:',data:'4, 9, 11, 15, 20, 25',type:'fr',ans:13,tol:0.1,ex:'Even count: average of 3rd and 4th → (11+15)/2 = 13.'},
{id:4,diff:'easy',topic:'Mode',q:'What is the mode of this dataset?',data:'5, 8, 8, 12, 15, 8, 20, 12, 8',type:'mc',ans:0,ch:['8','12','10','No mode'],ex:'8 appears 4 times — more than any other value.'},
{id:5,diff:'easy',topic:'Range',q:'Find the range of this dataset:',data:'14, 22, 8, 35, 19, 27, 11',type:'fr',ans:27,tol:0.1,ex:'Range = Max − Min = 35 − 8 = 27.'},
{id:6,diff:'medium',topic:'Std Dev',q:'Calculate the population standard deviation:',data:'4, 8, 6, 5, 3',type:'fr',ans:1.72,tol:0.15,ex:'Mean=5.2. Variance=14.8/5=2.96. SD=√2.96≈1.72.'},
{id:7,diff:'medium',topic:'IQR',q:'Find the IQR of this dataset:',data:'2, 5, 7, 10, 12, 15, 18, 20, 25',type:'fr',ans:13,tol:1,ex:'Q1=(5+7)/2=6. Q3=(18+20)/2=19. IQR=19−6=13.'},
{id:8,diff:'medium',topic:'Skewness',q:'Employee salaries: mean=$72,000, median=$55,000. What shape?',data:null,type:'mc',ans:1,ch:['Left skewed','Right skewed','Symmetric','Cannot determine'],ex:'Mean > median → right (positively) skewed. High salaries pull the mean right.'},
{id:9,diff:'medium',topic:'Outliers',q:'Five-number summary: Min=12, Q1=25, Med=32, Q3=41, Max=95. Is 95 an outlier (1.5×IQR rule)?',data:null,type:'mc',ans:0,ch:['Yes','No','Need more info','Only if n>30'],ex:'IQR=16. Fence=41+24=65. Since 95>65, yes — outlier.'},
{id:10,diff:'medium',topic:'Transforms',q:'Every value ×3 then +10. Original mean=20, SD=4. New mean and SD?',data:null,type:'mc',ans:2,ch:['Mean=70, SD=22','Mean=70, SD=4','Mean=70, SD=12','Mean=30, SD=12'],ex:'New mean=3(20)+10=70. New SD=3(4)=12. Adding a constant doesn\'t affect spread.'},
{id:11,diff:'hard',topic:'Resistance',q:'Which measure of center is more resistant to outliers?',data:null,type:'mc',ans:1,ch:['Mean — uses all data','Median — only depends on middle values','Mode — ignores values','Equally resistant'],ex:'Median depends only on position; one extreme value can\'t shift it much.'},
{id:12,diff:'hard',topic:'Z-scores',q:'Student A: 72 on a test (mean=65, SD=10). Student B: 85 (mean=78, SD=14). Who did better relative to class?',data:null,type:'mc',ans:0,ch:['Student A (z=0.7 vs 0.5)','Student B (scored 85)','Equal','Can\'t compare'],ex:'z_A=(72−65)/10=0.70. z_B=(85−78)/14=0.50. Student A is further above their class.'},
{id:13,diff:'hard',topic:'Std Dev',q:'Same mean of 50. A:{48,49,50,51,52}. B:{20,35,50,65,80}. Which has larger SD?',data:null,type:'mc',ans:1,ch:['Dataset A','Dataset B','Equal','Can\'t tell'],ex:'B has values much farther from the mean (20 and 80 are 30 away vs 1-2 in A).'},
{id:14,diff:'hard',topic:'Choosing Stats',q:'Home prices: most $200K–$400K, three mansions over $2M. Which stats to report?',data:null,type:'mc',ans:2,ch:['Mean and SD','Mean and range','Median and IQR','Mode and range'],ex:'Median and IQR resist outliers. This is why real estate uses median price.'},
{id:15,diff:'hard',topic:'Shape',q:'Histogram peaks near 90, tail stretches to 40. Mean=78, median=83. Shape?',data:null,type:'mc',ans:0,ch:['Left skewed','Right skewed','Symmetric','Bimodal'],ex:'Peak right, tail left → left skewed. Confirmed: mean(78)<median(83).'}
];

let answered={},pScore=0;
function buildProblems(){
  const c=document.getElementById('probContainer');let html='';
  probs.forEach(p=>{
    const dc=p.diff==='easy'?'d-e':p.diff==='medium'?'d-m':'d-h';
    html+=`<div class="pc" id="pc-${p.id}"><div class="pc-head"><span class="pc-num">#${p.id}</span><span class="pc-diff ${dc}">${p.diff}</span><span class="pc-topic">${p.topic}</span></div><div class="pc-body"><div class="pc-q">${p.q}</div>${p.data?'<div class="pc-data">'+p.data+'</div>':''}</div>`;
    if(p.type==='mc'){
      html+='<div class="choices" id="ch-'+p.id+'">';const L='ABCD';
      p.ch.forEach((c,j)=>{html+=`<div class="ch-btn" onclick="ansMC(${p.id},${j})" id="cb-${p.id}-${j}"><span class="lt">${L[j]}</span><span>${c}</span></div>`;});
      html+='</div>';
    }else{
      html+=`<div class="fr-row"><input type="text" id="fi-${p.id}" placeholder="Your answer..." onkeydown="if(event.key==='Enter')ansFR(${p.id})"><button onclick="ansFR(${p.id})">Check</button></div>`;
    }
    html+=`<div class="fb" id="fb-${p.id}"><div class="fb-box" id="fbx-${p.id}"></div></div></div>`;
  });
  c.innerHTML=html;
}
function ansMC(id,ch){
  if(answered[id]!==undefined)return;answered[id]=ch;const p=probs.find(x=>x.id===id);const ok=ch===p.ans;if(ok)pScore++;
  p.ch.forEach((_,j)=>{const el=document.getElementById('cb-'+id+'-'+j);el.classList.add('dis');if(j===p.ans)el.classList.add('right');else if(j===ch&&!ok)el.classList.add('wrong');});
  showFB(id,ok,p.ex);updatePScore();
}
function ansFR(id){
  if(answered[id]!==undefined)return;const p=probs.find(x=>x.id===id);const inp=document.getElementById('fi-'+id);const v=parseFloat(inp.value);if(isNaN(v))return;
  answered[id]=v;const ok=Math.abs(v-p.ans)<=(p.tol||0.1);if(ok)pScore++;
  inp.style.borderColor=ok?'var(--green)':'var(--red)';inp.disabled=true;
  showFB(id,ok,ok?p.ex:'Correct answer: '+p.ans+'. '+p.ex);updatePScore();
}
function showFB(id,ok,ex){
  document.getElementById('fb-'+id).classList.add('show');
  const b=document.getElementById('fbx-'+id);b.className='fb-box '+(ok?'fb-ok':'fb-no');
  b.innerHTML=`<strong>${ok?'✓ Correct!':'✗ Not quite.'}</strong><span class="ex">${ex}</span>`;
  document.getElementById('pc-'+id).classList.add(ok?'correct':'incorrect');
}
function updatePScore(){
  const n=Object.keys(answered).length;
  document.getElementById('scoreText').textContent=pScore+' / '+n+' correct';
  document.getElementById('scoreFill').style.width=(n/probs.length*100)+'%';
}

// ===================== INIT =====================
buildRoadmap();buildProblems();loadPreset();
window.addEventListener('resize',()=>{drawHist();drawBox();drawNorm();drawComp();});

// ===================== PHASE 1 CORE =====================
const UNIT_META={
  1:{name:'Descriptive Statistics'},
  2:{name:'Normal Distribution'},
  3:{name:'Bivariate Data'},
  4:{name:'Sampling & Design'},
  5:{name:'Probability'},
  6:{name:'Random Variables'},
  7:{name:'Sampling Distributions'},
  8:{name:'Confidence Intervals'},
  9:{name:'Hypothesis Testing'},
  10:{name:'Chi-Square Tests'},
  11:{name:'Regression Inference'}
};

let allProbs={1:probs.map(p=>({unit:1,tol:p.tol||0.01,...p}))};
var currentUnit=1;
let activeProbs=allProbs[1];

function setElText(id,val){const el=document.getElementById(id);if(el)el.textContent=val;}
function setAllScores(){
  const n=Object.keys(answered).length;
  const scoreText=document.getElementById('scoreText');
  const scoreFill=document.getElementById('scoreFill');
  if(scoreText)scoreText.textContent=pScore+' / '+n+' correct';
  if(scoreFill)scoreFill.style.width=(activeProbs.length?n/activeProbs.length*100:0)+'%';
}
function getPracticeState(unit){try{return JSON.parse(localStorage.getItem('sh-practice-'+unit)||'{}')}catch{return{}}}
function savePracticeState(unit,state){localStorage.setItem('sh-practice-'+unit,JSON.stringify(state))}
function persistPracticeState(){savePracticeState(currentUnit,{answered})}

buildProblems=function(unit=currentUnit){
  activeProbs=allProbs[unit]||[];
  const c=document.getElementById('probContainer');if(!c)return;
  let html='';
  activeProbs.forEach(p=>{
    const dc=p.diff==='easy'?'d-e':p.diff==='medium'?'d-m':'d-h';
    html+=`<div class="pc" id="pc-${p.id}"><div class="pc-head"><span class="pc-num">#${p.id}</span><span class="pc-diff ${dc}">${p.diff}</span><span class="pc-topic">${p.topic}</span></div><div class="pc-body"><div class="pc-q">${p.q}</div>${p.data?'<div class="pc-data">'+p.data+'</div>':''}</div>`;
    if(p.type==='mc'){
      html+='<div class="choices" id="ch-'+p.id+'">';const L='ABCD';
      p.ch.forEach((ch,j)=>{html+=`<div class="ch-btn" onclick="ansMC(${p.id},${j})" id="cb-${p.id}-${j}"><span class="lt">${L[j]}</span><span>${ch}</span></div>`;});
      html+='</div>';
    }else{
      html+=`<div class="fr-row"><input type="text" id="fi-${p.id}" placeholder="Your answer..." onkeydown="if(event.key==='Enter')ansFR(${p.id})"><button onclick="ansFR(${p.id})">Check</button></div>`;
    }
    html+=`<div class="fb" id="fb-${p.id}"><div class="fb-box" id="fbx-${p.id}"></div></div></div>`;
  });
  c.innerHTML=html;
  const saved=getPracticeState(unit);
  answered=saved.answered&&typeof saved.answered==='object'?saved.answered:{};
  pScore=0;
  activeProbs.forEach(p=>{
    if(answered[p.id]===undefined)return;
    if(p.type==='mc'){
      const ch=+answered[p.id],ok=ch===p.ans;if(ok)pScore++;
      p.ch.forEach((_,j)=>{const el=document.getElementById('cb-'+p.id+'-'+j);if(!el)return;el.classList.add('dis');if(j===p.ans)el.classList.add('right');else if(j===ch&&!ok)el.classList.add('wrong');});
      showFB(p.id,ok,ok?p.ex:'Correct answer: '+p.ch[p.ans]+'. '+p.ex);
    }else{
      const v=parseFloat(answered[p.id]);if(!Number.isFinite(v))return;
      const ok=Math.abs(v-p.ans)<=(p.tol||0.1);if(ok)pScore++;
      const inp=document.getElementById('fi-'+p.id);if(inp){inp.value=String(v);inp.disabled=true;inp.style.borderColor=ok?'var(--green)':'var(--red)';}
      showFB(p.id,ok,ok?p.ex:'Correct answer: '+p.ans+'. '+p.ex);
    }
  });
  setAllScores();
}

function ansMC(id,ch){
  if(answered[id]!==undefined)return;
  const p=activeProbs.find(x=>x.id===id);if(!p)return;
  answered[id]=ch;const ok=ch===p.ans;if(ok)pScore++;
  p.ch.forEach((_,j)=>{const el=document.getElementById('cb-'+id+'-'+j);if(!el)return;el.classList.add('dis');if(j===p.ans)el.classList.add('right');else if(j===ch&&!ok)el.classList.add('wrong');});
  showFB(id,ok,p.ex);persistPracticeState();setAllScores();
}

function ansFR(id){
  if(answered[id]!==undefined)return;
  const p=activeProbs.find(x=>x.id===id);if(!p)return;
  const inp=document.getElementById('fi-'+id);if(!inp)return;
  const v=parseFloat(inp.value);if(!Number.isFinite(v))return;
  answered[id]=v;const ok=Math.abs(v-p.ans)<=(p.tol||0.1);if(ok)pScore++;
  inp.style.borderColor=ok?'var(--green)':'var(--red)';inp.disabled=true;
  showFB(id,ok,ok?p.ex:'Correct answer: '+p.ans+'. '+p.ex);persistPracticeState();setAllScores();
}

function showFB(id,ok,ex){
  const fb=document.getElementById('fb-'+id),pc=document.getElementById('pc-'+id),b=document.getElementById('fbx-'+id);
  if(!fb||!pc||!b)return;
  fb.classList.add('show');
  b.className='fb-box '+(ok?'fb-ok':'fb-no');
  b.innerHTML=`<strong>${ok?'Correct!':'Not quite.'}</strong><span class="ex">${ex}</span>`;
  pc.classList.add(ok?'correct':'incorrect');
}

function updatePScore(){setAllScores()}

function setUnit(n){
  if(!UNIT_META[n])return;
  currentUnit=n;
  const sel=document.getElementById('unitSelect');if(sel)sel.value=String(n);
  const vsel=document.getElementById('vizUnitSelect');if(vsel)vsel.value=String(n);
  setElText('practiceUnitTag','Unit '+n+' - '+UNIT_META[n].name);
  setElText('vizUnitTag','Unit '+n+' - '+UNIT_META[n].name);
  buildProblems(n);
  buildVizForUnit(n);
}

allProbs[2]=[
  {id:101,unit:2,diff:'easy',topic:'Z-score',q:'Compute z for x=78, mu=70, sigma=4.',data:null,type:'fr',ans:2,tol:0.01,ex:'z=(78-70)/4=2.'},
  {id:102,unit:2,diff:'easy',topic:'68-95-99.7',q:'Within 2 SD of the mean is about:',data:null,type:'mc',ans:2,tol:0.01,ch:['50%','68%','95%','99.7%'],ex:'Rule: about 95% is within 2 SD.'},
  {id:103,unit:2,diff:'medium',topic:'Percentile',q:'For z=1.25, enter percentile as a percent.',data:null,type:'fr',ans:89.44,tol:0.2,ex:'P(Z<1.25)=0.8944, so 89.44%.'},
  {id:104,unit:2,diff:'medium',topic:'Relative Position',q:'A: x=82,mu=75,s=5. B: x=88,mu=80,s=4. Who is higher relative to class?',data:null,type:'mc',ans:1,tol:0.01,ch:['A','B','Equal','Cannot compare'],ex:'zA=1.4 and zB=2.0; B is higher.'},
  {id:105,unit:2,diff:'hard',topic:'Reverse Z',q:'Normal(mu=50,sigma=10). 90th percentile score is closest to:',data:null,type:'mc',ans:1,tol:0.01,ch:['56.4','62.8','69.6','74.0'],ex:'x=50+1.28*10=62.8.'},
  {id:106,unit:2,diff:'easy',topic:'Normal Shape',q:'In a normal distribution, what proportion lies above the mean?',data:null,type:'mc',ans:1,tol:0.01,ch:['About 34%','About 50%','About 68%','About 95%'],ex:'The normal curve is symmetric, so half the area is above the mean.'},
  {id:107,unit:2,diff:'easy',topic:'Standardization',q:'Standardize x=84 using mu=76 and sigma=8.',data:'x=84, mu=76, sigma=8',type:'fr',ans:1,tol:0.01,ex:'(84-76)/8=1.'},
  {id:108,unit:2,diff:'medium',topic:'Combining Normals',q:'If X and Y are independent with means 100 and 30, what is E(X+Y)?',data:'X: mu=100, Y: mu=30',type:'fr',ans:130,tol:0.01,ex:'Means add: 100+30=130.'},
  {id:109,unit:2,diff:'medium',topic:'Normal Approximation Check',q:'For a binomial model with n=200 and p=0.08, compute np.',data:'n=200, p=0.08',type:'fr',ans:16,tol:0.01,ex:'np=200*0.08=16.'},
  {id:110,unit:2,diff:'hard',topic:'Difference of Normals',q:'If X~N(50,4) and Y~N(20,3) are independent, SD(X-Y) is closest to:',data:null,type:'mc',ans:2,tol:0.01,ch:['1.0','4.0','5.0','7.0'],ex:'Var(X-Y)=4^2+3^2=25, so SD=5.'}
];

allProbs[3]=[
  {id:201,unit:3,diff:'easy',topic:'Association',q:'x rises, y rises in a tight line. This is:',data:null,type:'mc',ans:0,tol:0.01,ch:['Strong positive linear','Strong negative linear','Weak nonlinear','No association'],ex:'Tight upward line means strong positive linear.'},
  {id:202,unit:3,diff:'easy',topic:'Correlation',q:'r=-0.85 means:',data:null,type:'mc',ans:1,tol:0.01,ch:['Weak positive','Strong negative','No linear relation','Causation'],ex:'Near -1 implies strong negative linear relation.'},
  {id:203,unit:3,diff:'medium',topic:'Prediction',q:'yhat=12+1.8x. Find yhat for x=15.',data:null,type:'fr',ans:39,tol:0.01,ex:'12+1.8*15=39.'},
  {id:204,unit:3,diff:'medium',topic:'Residual',q:'Observed y=42 and yhat=39.5. Find residual.',data:null,type:'fr',ans:2.5,tol:0.01,ex:'Residual=y-yhat=2.5.'},
  {id:205,unit:3,diff:'hard',topic:'Causation',q:'Ice cream sales and drownings both rise in summer. Best conclusion?',data:null,type:'mc',ans:2,tol:0.01,ch:['Ice cream causes drownings','Drownings cause ice cream sales','Lurking variable like temperature affects both','Correlation proves causation'],ex:'Temperature can drive both variables.'},
  {id:206,unit:3,diff:'easy',topic:'r-squared Interpretation',q:'If r^2=0.64 in a linear model, this means:',data:null,type:'mc',ans:0,tol:0.01,ch:['64% of variation in y is explained by x','64% of points are on the line','r equals 0.64','64% of x is caused by y'],ex:'r^2 is the proportion of y-variation explained by the linear model.'},
  {id:207,unit:3,diff:'easy',topic:'Slope Interpretation',q:'For yhat=12+1.8x, what is the predicted change in y when x increases by 5?',data:'yhat=12+1.8x',type:'fr',ans:9,tol:0.01,ex:'Slope*change in x = 1.8*5 = 9.'},
  {id:208,unit:3,diff:'medium',topic:'Extrapolation',q:'A model was fit using x values from 10 to 30. Predicting at x=45 is:',data:null,type:'mc',ans:1,tol:0.01,ch:['Interpolation and safe','Extrapolation and potentially unreliable','Always valid if r is positive','Guaranteed unbiased'],ex:'x=45 is outside observed range, so this is extrapolation.'},
  {id:209,unit:3,diff:'medium',topic:'Residual Pattern',q:'A fitted line (with intercept) has residuals -2, -1, 0, 1, 2. Find the mean residual.',data:'Residuals: -2, -1, 0, 1, 2',type:'fr',ans:0,tol:0.01,ex:'They sum to 0, so mean residual is 0.'},
  {id:210,unit:3,diff:'hard',topic:'Influential Points',q:'A point lies far in x and far from the trend. It is most likely to:',data:null,type:'mc',ans:1,tol:0.01,ch:['Only change the intercept slightly','Strongly affect slope and correlation','Never affect the fitted line','Increase sample size but nothing else'],ex:'High-leverage outliers can strongly pull the regression line.'}
];

allProbs[4]=[
  {id:301,unit:4,diff:'easy',topic:'Study Type',q:'Random assignment to drug vs placebo is a:',data:null,type:'mc',ans:2,tol:0.01,ch:['Census','Observational study','Randomized experiment','Convenience sample'],ex:'Random assignment defines an experiment.'},
  {id:302,unit:4,diff:'easy',topic:'Sampling Method',q:'Randomly take 10 students from each grade. This is:',data:null,type:'mc',ans:1,tol:0.01,ch:['Cluster','Stratified random','Systematic','Convenience'],ex:'Sampling within each grade stratum is stratified.'},
  {id:303,unit:4,diff:'medium',topic:'Bias',q:'Survey posted only in a fitness app. Main bias?',data:null,type:'mc',ans:0,tol:0.01,ch:['Selection bias','Response bias','Measurement bias','Confounding'],ex:'App users are not representative.'},
  {id:304,unit:4,diff:'medium',topic:'Allocation',q:'A stratified sample of 40 is split equally across 4 groups. Per group?',data:null,type:'fr',ans:10,tol:0.01,ex:'40/4=10.'},
  {id:305,unit:4,diff:'hard',topic:'Design',q:'Best test of caffeine effect on quiz scores:',data:null,type:'mc',ans:3,tol:0.01,ch:['Compare current drinkers vs non-drinkers','Let students choose caffeine','Give caffeine to top students only','Randomly assign caffeine or placebo and keep conditions same'],ex:'Randomized placebo-controlled design reduces confounding.'},
  {id:306,unit:4,diff:'easy',topic:'Confounding',q:'In an observational study, coffee drinkers had higher exam scores. The main concern is:',data:null,type:'mc',ans:2,tol:0.01,ch:['Sampling error only','Measurement rounding','A lurking variable like study time','No concern because n is large'],ex:'Without random assignment, lurking variables can confound the association.'},
  {id:307,unit:4,diff:'easy',topic:'Blocking',q:'A trial has 120 participants split equally into 3 blocks. How many per block?',data:'Total=120, blocks=3',type:'fr',ans:40,tol:0.01,ex:'120/3=40 participants per block.'},
  {id:308,unit:4,diff:'medium',topic:'Blinding',q:'A double-blind experiment means:',data:null,type:'mc',ans:1,tol:0.01,ch:['Only subjects know treatment','Neither subjects nor evaluators know treatment assignments','Only researchers know treatment','Everyone knows treatment after randomization'],ex:'Double-blind hides treatment from participants and evaluators.'},
  {id:309,unit:4,diff:'medium',topic:'Sampling Frame',q:'Population has 2400 households; the sampling frame lists 2100. What percent of households are missing?',data:'Population=2400, frame=2100',type:'fr',ans:12.5,tol:0.1,ex:'Missing=300, and 300/2400=0.125=12.5%.'},
  {id:310,unit:4,diff:'hard',topic:'Voluntary Response',q:'A news website asks readers to click a poll about taxes. The biggest issue is:',data:null,type:'mc',ans:0,tol:0.01,ch:['Voluntary-response bias from self-selection','No bias if many people respond','Random assignment error','Blocking was not used'],ex:'People with strong opinions are more likely to respond.'}
];

allProbs[5]=[
  {id:401,unit:5,diff:'easy',topic:'Complement',q:'If P(A)=0.37, find P(A\').',data:null,type:'fr',ans:0.63,tol:0.001,ex:'1-0.37=0.63.'},
  {id:402,unit:5,diff:'easy',topic:'Mutually Exclusive',q:'Which pair is mutually exclusive in one die roll?',data:null,type:'mc',ans:1,tol:0.01,ch:['Even and >3','Roll 2 and roll 5','<4 and even','Prime and odd'],ex:'2 and 5 cannot happen together.'},
  {id:403,unit:5,diff:'medium',topic:'Conditional',q:'40 are in music, 20 in both music and soccer. Find P(Soccer|Music).',data:null,type:'fr',ans:0.5,tol:0.001,ex:'20/40=0.5.'},
  {id:404,unit:5,diff:'medium',topic:'Addition Rule',q:'If P(A)=0.45, P(B)=0.35, P(A and B)=0.15, then P(A union B)=',data:null,type:'mc',ans:2,tol:0.01,ch:['0.80','0.95','0.65','0.30'],ex:'0.45+0.35-0.15=0.65.'},
  {id:405,unit:5,diff:'hard',topic:'Bayes',q:'Prevalence 1%, sensitivity 92%, false positive 8%. Find P(Disease|Positive).',data:null,type:'fr',ans:0.104,tol:0.01,ex:'Bayes gives about 0.104.'},
  {id:406,unit:5,diff:'easy',topic:'Multiplication Rule',q:'If events A and B are independent with P(A)=0.60 and P(B)=0.30, find P(A and B).',data:'P(A)=0.60, P(B)=0.30',type:'fr',ans:0.18,tol:0.001,ex:'For independence, multiply: 0.60*0.30=0.18.'},
  {id:407,unit:5,diff:'easy',topic:'Independence',q:'Given P(A)=0.40, P(B)=0.50, and P(A and B)=0.20, are A and B independent?',data:null,type:'mc',ans:0,tol:0.01,ch:['Yes, because 0.40*0.50=0.20','No, because P(A and B) is too small','No, because probabilities must add to 1','Cannot determine'],ex:'Since P(A and B)=P(A)P(B), the events are independent.'},
  {id:408,unit:5,diff:'medium',topic:'At Least One',q:'A fair coin is tossed 3 times. Find P(at least one head).',data:null,type:'fr',ans:0.875,tol:0.001,ex:'Use complement: 1-P(no heads)=1-(1/2)^3=7/8=0.875.'},
  {id:409,unit:5,diff:'medium',topic:'Two-Way Table',q:'From counts A and B=18, A only=12, B only=22, neither=48, find P(A and B).',data:'A and B=18, A only=12, B only=22, neither=48',type:'mc',ans:0,tol:0.01,ch:['0.18','0.30','0.40','0.52'],ex:'Total is 100, so P(A and B)=18/100=0.18.'},
  {id:410,unit:5,diff:'hard',topic:'Tree Diagram',q:'Branch 1 has probability 0.4 with red chance 0.7; Branch 2 has probability 0.6 with red chance 0.2. Find overall P(red).',data:'P(B1)=0.4, P(red|B1)=0.7, P(B2)=0.6, P(red|B2)=0.2',type:'fr',ans:0.4,tol:0.001,ex:'Total probability: 0.4*0.7 + 0.6*0.2 = 0.4.'}
];

allProbs[6]=[
  {id:501,unit:6,diff:'easy',topic:'Discrete vs Continuous',q:'Which is discrete?',data:null,type:'mc',ans:0,tol:0.01,ch:['Number of emails today','Time to run 5 km','Body temperature','Rainfall amount'],ex:'Counts are discrete.'},
  {id:502,unit:6,diff:'easy',topic:'Expected Value',q:'X:0,1,2,3 with probs 0.1,0.3,0.4,0.2. Find E(X).',data:null,type:'fr',ans:1.7,tol:0.001,ex:'sum xP(x)=1.7.'},
  {id:503,unit:6,diff:'medium',topic:'Binomial',q:'For X~Binomial(5,0.4), find P(X=3).',data:null,type:'fr',ans:0.2304,tol:0.001,ex:'C(5,3)(0.4)^3(0.6)^2=0.2304.'},
  {id:504,unit:6,diff:'medium',topic:'Transform',q:'If E(X)=5, SD(X)=2, for Y=3X+2 which is correct?',data:null,type:'mc',ans:0,tol:0.01,ch:['E(Y)=17, SD(Y)=6','E(Y)=17, SD(Y)=2','E(Y)=15, SD(Y)=6','E(Y)=15, SD(Y)=8'],ex:'E(aX+b)=aE(X)+b and SD(aX+b)=|a|SD(X).'},
  {id:505,unit:6,diff:'hard',topic:'Combine',q:'Independent X,Y with SD(X)=3 and SD(Y)=4. Find SD(X+Y).',data:null,type:'fr',ans:5,tol:0.01,ex:'sqrt(3^2+4^2)=5.'},
  {id:506,unit:6,diff:'easy',topic:'Binomial Conditions',q:'Which setting is binomial?',data:null,type:'mc',ans:2,tol:0.01,ch:['Time until a bus arrives','Weight of 12 apples','Number of defective chips in 20 independent chips with same defect chance','Temperature at noon for 7 days'],ex:'Fixed n, independent trials, two outcomes, constant p.'},
  {id:507,unit:6,diff:'easy',topic:'Variance',q:'If SD(X)=4.5, find Var(X).',data:'SD(X)=4.5',type:'fr',ans:20.25,tol:0.01,ex:'Variance is SD squared: 4.5^2=20.25.'},
  {id:508,unit:6,diff:'medium',topic:'Probability Table',q:'Given X:0,1,2 with probabilities 0.25, 0.50, 0.25, find P(X>=1).',data:'X:0,1,2 and P:0.25,0.50,0.25',type:'fr',ans:0.75,tol:0.001,ex:'P(X>=1)=0.50+0.25=0.75.'},
  {id:509,unit:6,diff:'medium',topic:'Geometric',q:'If success probability per trial is p=0.20, the expected trial of first success is:',data:null,type:'mc',ans:1,tol:0.01,ch:['2','5','10','20'],ex:'For geometric random variable, E(X)=1/p=1/0.20=5.'},
  {id:510,unit:6,diff:'hard',topic:'SD of X',q:'X takes values 1 and 4 with probabilities 0.3 and 0.7. Find SD(X).',data:'X=1 (0.3), X=4 (0.7)',type:'fr',ans:1.375,tol:0.02,ex:'mu=3.1, Var=E(X^2)-mu^2=11.5-9.61=1.89, so SD=sqrt(1.89)=1.375.'}
];

allProbs[7]=[
  {id:601,unit:7,diff:'easy',topic:'Definition',q:'A sampling distribution is the distribution of:',data:null,type:'mc',ans:2,tol:0.01,ch:['Raw data','Population values','A statistic over repeated samples','Measurement errors'],ex:'It is the distribution of a statistic.'},
  {id:602,unit:7,diff:'easy',topic:'SE',q:'If sigma=18 and n=36, find SE of xbar.',data:null,type:'fr',ans:3,tol:0.01,ex:'18/sqrt(36)=3.'},
  {id:603,unit:7,diff:'medium',topic:'CLT Probability',q:'mu=50, sigma=12, n=36. Find P(xbar<53).',data:null,type:'fr',ans:0.9332,tol:0.01,ex:'z=1.5 so probability is 0.9332.'},
  {id:604,unit:7,diff:'medium',topic:'CLT Conditions',q:'Which is sufficient for normal approximation of xbar?',data:null,type:'mc',ans:1,tol:0.01,ch:['No assumptions ever needed','Random sample and large n (or normal population)','Only know mean','Only n<10'],ex:'Need randomness and normality/large n.'},
  {id:605,unit:7,diff:'hard',topic:'phat Distribution',q:'If p=0.40 and n=200, find P(phat>0.46).',data:null,type:'fr',ans:0.0416,tol:0.01,ex:'Using normal approx gives about 0.0416.'},
  {id:606,unit:7,diff:'easy',topic:'Mean of Sampling Dist',q:'For the sample mean xbar, which is true?',data:null,type:'mc',ans:0,tol:0.01,ch:['E(xbar)=mu','E(xbar)=sigma','E(xbar)=nmu','E(xbar)=0 always'],ex:'The sampling distribution of xbar is centered at the population mean.'},
  {id:607,unit:7,diff:'easy',topic:'Sample Size for SE',q:'If sigma=15 and desired SE(xbar)=3, find n.',data:'sigma=15, SE=3',type:'fr',ans:25,tol:0.01,ex:'SE=sigma/sqrt(n) so n=(15/3)^2=25.'},
  {id:608,unit:7,diff:'medium',topic:'Effect of n',q:'If sample size is multiplied by 4, SE of xbar will:',data:null,type:'mc',ans:1,tol:0.01,ch:['Double','Be cut in half','Stay the same','Increase by factor 4'],ex:'SE is proportional to 1/sqrt(n), so quadrupling n halves SE.'},
  {id:609,unit:7,diff:'medium',topic:'Bias',q:'An estimator has expected value 48 when the true parameter is 50. Compute bias (E-estimator minus true).',data:'E(estimator)=48, true=50',type:'fr',ans:-2,tol:0.01,ex:'Bias=48-50=-2.'},
  {id:610,unit:7,diff:'hard',topic:'Shape of Sampling Dist',q:'Population is strongly right-skewed, but n=45 random observations are averaged. Shape of xbar is best described as:',data:null,type:'mc',ans:2,tol:0.01,ch:['Still strongly right-skewed','Uniform','Approximately normal by CLT','Exactly symmetric for any n'],ex:'With large n, CLT makes sampling distribution of xbar approximately normal.'}
];

allProbs[8]=[
  {id:701,unit:8,diff:'easy',topic:'Interpretation',q:'A 95% confidence level means:',data:null,type:'mc',ans:0,tol:0.01,ch:['About 95% of intervals from this method capture the true parameter','This specific interval has 95% chance to contain parameter','95% of sample values are in interval','Parameter changes each sample'],ex:'Confidence is long-run method performance.'},
  {id:702,unit:8,diff:'easy',topic:'Point Estimate',q:'Given CI (0.42, 0.54), point estimate and ME are:',data:null,type:'mc',ans:0,tol:0.01,ch:['0.48 and 0.06','0.42 and 0.12','0.54 and 0.06','0.48 and 0.12'],ex:'Center 0.48 and half-width 0.06.'},
  {id:703,unit:8,diff:'medium',topic:'CI Bound',q:'For phat=0.60, n=100, 95% CI: lower endpoint?',data:null,type:'fr',ans:0.504,tol:0.01,ex:'ME=0.096 so lower=0.504.'},
  {id:704,unit:8,diff:'medium',topic:'Sample Size',q:'95% confidence, ME=0.03, use p-hat=0.5. Minimum n?',data:null,type:'fr',ans:1068,tol:1,ex:'Compute and round up to 1068.'},
  {id:705,unit:8,diff:'hard',topic:'Misinterpretation',q:'Choose the WRONG confidence-interval statement.',data:null,type:'mc',ans:1,tol:0.01,ch:['About 95% of intervals from this method capture truth','This specific interval has 95% chance to contain true value','Higher confidence usually means wider intervals','Larger n usually lowers margin of error'],ex:'The parameter is fixed; the interval is random.'},
  {id:706,unit:8,diff:'easy',topic:'Margin of Error',q:'Find the margin of error for CI (42, 58).',data:'CI=(42,58)',type:'fr',ans:8,tol:0.01,ex:'Margin of error is half-width: (58-42)/2=8.'},
  {id:707,unit:8,diff:'easy',topic:'Effect of CL',q:'If confidence level increases from 90% to 99% (same n), the interval will usually:',data:null,type:'mc',ans:2,tol:0.01,ch:['Become narrower','Stay same width','Become wider','Shift upward'],ex:'Higher confidence needs a larger critical value, so width increases.'},
  {id:708,unit:8,diff:'medium',topic:'Width Factors',q:'A study has margin of error 0.10 at sample size n. If sample size becomes 4n, new margin of error is:',data:null,type:'fr',ans:0.05,tol:0.005,ex:'ME scales as 1/sqrt(n), so quadrupling n halves ME.'},
  {id:709,unit:8,diff:'medium',topic:'CI for Mean',q:'For a small sample with unknown population sigma, which critical distribution is used for a mean CI?',data:null,type:'mc',ans:1,tol:0.01,ch:['Normal z only','Student t','Chi-square','Binomial'],ex:'For mean inference with unknown sigma, use t critical values.'},
  {id:710,unit:8,diff:'hard',topic:'Capture Rate',q:'If a 95% CI method is repeated 200 times, about how many intervals should capture the true parameter?',data:'Confidence=95%, intervals=200',type:'fr',ans:190,tol:1,ex:'Expected captures are 0.95*200=190.'}
];

allProbs[9]=[
  {id:801,unit:9,diff:'easy',topic:'Hypotheses',q:'Claim: more than 50% support. Correct hypotheses?',data:null,type:'mc',ans:1,tol:0.01,ch:['H0:p>0.50, Ha:p=0.50','H0:p=0.50, Ha:p>0.50','H0:p=0.50, Ha:p<0.50','H0:p!=0.50, Ha:p=0.50'],ex:'Null uses equality; claim direction goes in Ha.'},
  {id:802,unit:9,diff:'easy',topic:'Type I',q:'Rejecting a true H0 is called:',data:null,type:'mc',ans:0,tol:0.01,ch:['Type I error','Type II error','Power','No error'],ex:'Type I error is false rejection.'},
  {id:803,unit:9,diff:'medium',topic:'z-test',q:'Compute z for phat=0.55, p0=0.50, n=200.',data:null,type:'fr',ans:1.414,tol:0.02,ex:'z=(0.55-0.50)/sqrt(0.5*0.5/200)=1.414.'},
  {id:804,unit:9,diff:'medium',topic:'Conclusion',q:'If p-value=0.03 and alpha=0.05, conclude:',data:null,type:'mc',ans:0,tol:0.01,ch:['Reject H0','Fail to reject H0','Accept H0 as true','Cannot test'],ex:'Since 0.03 < 0.05, reject H0.'},
  {id:805,unit:9,diff:'hard',topic:'t-test',q:'Compute t for xbar=52, mu0=50, s=8, n=36.',data:null,type:'fr',ans:1.5,tol:0.01,ex:'t=(52-50)/(8/sqrt(36))=1.5.'},
  {id:806,unit:9,diff:'easy',topic:'Type II Error',q:'A Type II error occurs when you:',data:null,type:'mc',ans:2,tol:0.01,ch:['Reject a true H0','Reject a false H0','Fail to reject a false H0','Fail to reject a true H0'],ex:'Type II error is missing a real effect (false null not rejected).'},
  {id:807,unit:9,diff:'easy',topic:'Effect of n',q:'SE for a proportion was 0.10 at n=100. If n increases to 400 (same p), new SE is:',data:'SE=0.10 at n=100, new n=400',type:'fr',ans:0.05,tol:0.005,ex:'SE scales by 1/sqrt(n), so multiplying n by 4 halves SE.'},
  {id:808,unit:9,diff:'medium',topic:'Power',q:'Holding alpha fixed, which action usually increases test power?',data:null,type:'mc',ans:1,tol:0.01,ch:['Use a smaller sample','Use a larger sample','Increase measurement noise','Move effect closer to null'],ex:'Larger n reduces SE and makes true effects easier to detect.'},
  {id:809,unit:9,diff:'medium',topic:'Two-Sided Test',q:'A one-sided p-value is 0.018 for a symmetric test statistic. What is the two-sided p-value?',data:'one-sided p=0.018',type:'fr',ans:0.036,tol:0.001,ex:'Two-sided doubles the one-tail area: 2*0.018=0.036.'},
  {id:810,unit:9,diff:'hard',topic:'Practical Significance',q:'A study reports p<0.001 with a tiny effect size in a huge sample. Best interpretation?',data:null,type:'mc',ans:0,tol:0.01,ch:['Statistically significant but may lack practical importance','Practically important because p is tiny','No evidence against H0','Type I error is impossible'],ex:'Small p-value does not guarantee a meaningful real-world effect.'}
];

allProbs[10]=[
  {id:901,unit:10,diff:'easy',topic:'Expected Count',q:'Row total=50, column total=60, grand total=200. Expected count?',data:null,type:'fr',ans:15,tol:0.01,ex:'(50*60)/200=15.'},
  {id:902,unit:10,diff:'easy',topic:'df',q:'Goodness-of-fit with 6 categories: df=?',data:null,type:'mc',ans:2,tol:0.01,ch:['4','6','5','10'],ex:'df=k-1=5.'},
  {id:903,unit:10,diff:'medium',topic:'Chi-square',q:'Observed [30,25,20,25], expected [25,25,25,25]. Find chi-square.',data:null,type:'fr',ans:2,tol:0.01,ex:'Sum (O-E)^2/E = 2.'},
  {id:904,unit:10,diff:'medium',topic:'Conditions',q:'Which is NOT required for chi-square tests?',data:null,type:'mc',ans:3,tol:0.01,ch:['Independent observations','Expected counts large enough','Random sample or random assignment','Normally distributed population'],ex:'Normal population is not required.'},
  {id:905,unit:10,diff:'hard',topic:'Interpretation',q:'Chi-square test gives p=0.012 at alpha=0.05. Conclusion?',data:null,type:'mc',ans:0,tol:0.01,ch:['Reject H0; evidence of association/difference','Fail to reject H0','Accept H0','Test invalid'],ex:'p<alpha so reject H0.'},
  {id:906,unit:10,diff:'easy',topic:'GOF Setup',q:'For a fair die goodness-of-fit test, the null hypothesis is:',data:null,type:'mc',ans:1,tol:0.01,ch:['At least one face has p>1/6','All six face probabilities equal 1/6','Observed counts must all match exactly','The die is biased toward 6'],ex:'GOF null specifies the full probability model, here p1=...=p6=1/6.'},
  {id:907,unit:10,diff:'easy',topic:'Cell Contribution',q:'Compute this cell contribution to chi-square: (O-E)^2/E with O=18 and E=12.',data:'O=18, E=12',type:'fr',ans:3,tol:0.01,ex:'(18-12)^2/12 = 36/12 = 3.'},
  {id:908,unit:10,diff:'medium',topic:'Independence vs Homogeneity',q:'Researchers compare beverage preference across three age groups sampled separately. This is a chi-square test of:',data:null,type:'mc',ans:2,tol:0.01,ch:['Goodness-of-fit','Independence only','Homogeneity','Paired means'],ex:'Different populations/groups with same categorical variable implies homogeneity.'},
  {id:909,unit:10,diff:'medium',topic:'Small Expected',q:'A 3x4 table has 12 expected counts, and 2 are below 5. How many meet the >=5 rule?',data:'Total cells=12, below 5 =2',type:'fr',ans:10,tol:0.01,ex:'12-2=10 cells meet the rule.'},
  {id:910,unit:10,diff:'hard',topic:'Post-Hoc',q:'After a significant chi-square test, which cell contributes most to the statistic?',data:null,type:'mc',ans:3,tol:0.01,ch:['The cell with largest expected count','The cell with smallest observed count','Any cell in first row','The cell with largest (O-E)^2/E'],ex:'Each cell contributes (O-E)^2/E, so the largest value drives the most contribution.'}
];

allProbs[11]=[
  {id:1001,unit:11,diff:'easy',topic:'LINE',q:'Which list gives regression inference conditions?',data:null,type:'mc',ans:1,tol:0.01,ch:['Normality only','Linearity, Independence, Normal residuals, Equal variance','Equal sample sizes only','No outliers only'],ex:'LINE is the standard checklist.'},
  {id:1002,unit:11,diff:'easy',topic:'Output Reading',q:'Output: b1=2.5, SE(b1)=0.8, t=3.125, p=0.018. Slope and SE are:',data:null,type:'mc',ans:3,tol:0.01,ch:['2.5 and 3.125','0.8 and 0.018','3.125 and 0.8','2.5 and 0.8'],ex:'Slope 2.5 and SE 0.8.'},
  {id:1003,unit:11,diff:'medium',topic:'t-stat',q:'Compute t when b1=2.5 and SE(b1)=0.8.',data:null,type:'fr',ans:3.125,tol:0.01,ex:'t=b1/SE=3.125.'},
  {id:1004,unit:11,diff:'medium',topic:'CI',q:'For b1=2.5, SE=0.8, t*=2.048, find lower 95% CI endpoint.',data:null,type:'fr',ans:0.862,tol:0.02,ex:'2.5-2.048*0.8=0.862.'},
  {id:1005,unit:11,diff:'hard',topic:'Significance',q:'Slope p-value is 0.018 at alpha=0.05. Is slope significant?',data:null,type:'mc',ans:0,tol:0.01,ch:['Yes, reject H0: beta1=0','No, fail to reject H0','Cannot decide without r^2','Only if p<0.01'],ex:'0.018<0.05 so slope is significant.'},
  {id:1006,unit:11,diff:'easy',topic:'R-squared Interpretation',q:'If a regression reports r^2=0.81, this means:',data:null,type:'mc',ans:2,tol:0.01,ch:['81% of x is explained by y','r equals 0.81 exactly','81% of variation in y is explained by the model','81% of points lie on the line'],ex:'r^2 is explained variation in the response variable.'},
  {id:1007,unit:11,diff:'easy',topic:'df for Regression',q:'In simple linear regression with n=24 observations, what are the degrees of freedom for slope t inference?',data:'n=24',type:'fr',ans:22,tol:0.01,ex:'For simple linear regression, df=n-2=22.'},
  {id:1008,unit:11,diff:'medium',topic:'Residual Analysis',q:'A residual plot shows a clear curved pattern around 0. What does this suggest?',data:null,type:'mc',ans:1,tol:0.01,ch:['Variance is exactly constant','Linear model may be inappropriate','No outliers exist','r^2 must be 1'],ex:'Systematic curvature indicates nonlinearity not captured by a straight line.'},
  {id:1009,unit:11,diff:'medium',topic:'Prediction Interval',q:'A 95% prediction interval for a new y is (48, 72). Find its margin of error.',data:'Prediction interval=(48,72)',type:'fr',ans:12,tol:0.01,ex:'Half-width is (72-48)/2=12.'},
  {id:1010,unit:11,diff:'hard',topic:'SE Meaning',q:'Two models have the same slope b1=1.8. Model A has SE=0.9, Model B has SE=0.3. Which has stronger evidence against H0:beta1=0?',data:null,type:'mc',ans:1,tol:0.01,ch:['Model A, because larger SE is better','Model B, because smaller SE gives larger |t|','They are equal since slopes match','Cannot compare without intercept'],ex:'t=b1/SE, so Model B has much larger t and stronger evidence.'}
];

function prepCanvas2(id,h){
  const c=document.getElementById(id);
  if(!c||!c.getContext)return null;
  const ctx=c.getContext('2d');
  const dpr=window.devicePixelRatio||1;
  const W=c.clientWidth||c.offsetWidth||800;
  c.width=Math.max(1,Math.round(W*dpr));
  c.height=Math.max(1,Math.round(h*dpr));
  c.style.height=h+'px';
  if(typeof ctx.setTransform==='function')ctx.setTransform(dpr,0,0,dpr,0,0);
  else ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,W,h);
  return {c,ctx,W,H:h};
}

function vizTemplate(unit){
  if(unit===2){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Z-Score Explorer</div><div class="viz-desc">Adjust x, mu, and sigma to see left and right tail areas in real time.</div><canvas id="zCanvas" height="320"></canvas><div class="controls"><div class="cg"><span class="cl">x <span class="sv-val" id="u2XVal">72</span></span><input type="range" id="u2X" min="20" max="120" value="72" step="1" oninput="drawZscore()"></div><div class="cg"><span class="cl">mu <span class="sv-val" id="u2MuVal">70</span></span><input type="range" id="u2Mu" min="30" max="100" value="70" step="1" oninput="drawZscore()"></div><div class="cg"><span class="cl">sigma <span class="sv-val" id="u2SigVal">10</span></span><input type="range" id="u2Sig" min="1" max="25" value="10" step="1" oninput="drawZscore()"></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u2Z">-</div><div class="sl">z-score</div></div><div class="sc"><div class="sv sv-amber" id="u2Left">-</div><div class="sl">percentile</div></div><div class="sc"><div class="sv sv-pink" id="u2Right">-</div><div class="sl">right area</div></div></div></div><div class="explain"><h3>Formula</h3><p>z converts raw score to standard-deviation units.</p><div class="formula">z = (x - mu) / sigma</div></div></div>`;
  }
  if(unit===3){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Interactive Scatterplot</div><div class="viz-desc">Click to add points. Presets load example patterns for positive, negative, or no correlation.</div><canvas id="scatterCanvas" height="330"></canvas><div class="controls"><div class="cg"><span class="cl">Presets</span><div class="viz-btn-group"><button type="button" data-u3preset="positive" onclick="setScatterPreset('positive')">Positive</button><button type="button" data-u3preset="negative" onclick="setScatterPreset('negative')">Negative</button><button type="button" data-u3preset="none" onclick="setScatterPreset('none')">None</button><button type="button" onclick="clearScatter()">Clear</button></div></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u3Eq">-</div><div class="sl">regression line</div></div><div class="sc"><div class="sv sv-amber" id="u3R">-</div><div class="sl">r</div></div><div class="sc"><div class="sv sv-pink" id="u3R2">-</div><div class="sl">r^2</div></div><div class="sc"><div class="sv sv-purple" id="u3N">-</div><div class="sl">n</div></div></div></div><div class="explain"><h3>Least Squares Line</h3><p>Line updates from clicked points and minimizes squared residuals.</p><div class="formula" id="u3Formula">yhat = a + bx</div></div></div>`;
  }
  if(unit===4){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Sampling Simulator</div><div class="viz-desc">Population has 100 dots in 4 groups. Choose a method and compare sample composition.</div><canvas id="samplingCanvas" height="330"></canvas><div class="controls"><div class="cg"><span class="cl">Method</span><div class="viz-btn-group"><button type="button" data-u4method="srs" onclick="runSampling('srs')">SRS</button><button type="button" data-u4method="stratified" onclick="runSampling('stratified')">Stratified</button><button type="button" data-u4method="cluster" onclick="runSampling('cluster')">Cluster</button><button type="button" data-u4method="systematic" onclick="runSampling('systematic')">Systematic</button><button type="button" onclick="resetSampling()">Reset</button></div></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u4Pop">-</div><div class="sl">population composition</div></div><div class="sc"><div class="sv sv-amber" id="u4Sample">-</div><div class="sl">sample composition</div></div><div class="sc"><div class="sv sv-pink" id="u4Method">-</div><div class="sl">method</div></div><div class="sc"><div class="sv sv-purple" id="u4Size">-</div><div class="sl">sample size</div></div></div></div><div class="explain"><h3>Sampling Design Tradeoffs</h3><p>Method choice can bias representation even when sample size is unchanged.</p><div class="formula">Compare sample mix to population mix.</div></div></div>`;
  }
  if(unit===5){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Venn Diagram Probability</div><div class="viz-desc">Set P(A), P(B), and P(A and B) and watch conditional probabilities update.</div><canvas id="vennCanvas" height="320"></canvas><div class="controls"><div class="cg"><span class="cl">P(A) <span class="sv-val" id="u5PAVal">0.55</span></span><input type="range" id="u5PA" min="0" max="1" step="0.01" value="0.55" oninput="drawVenn()"></div><div class="cg"><span class="cl">P(B) <span class="sv-val" id="u5PBVal">0.45</span></span><input type="range" id="u5PB" min="0" max="1" step="0.01" value="0.45" oninput="drawVenn()"></div><div class="cg"><span class="cl">P(A and B) <span class="sv-val" id="u5PABVal">0.20</span></span><input type="range" id="u5PAB" min="0" max="0.45" step="0.01" value="0.20" oninput="drawVenn()"></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u5Union">-</div><div class="sl">P(A union B)</div></div><div class="sc"><div class="sv sv-amber" id="u5AcondB">-</div><div class="sl">P(A|B)</div></div><div class="sc"><div class="sv sv-pink" id="u5BcondA">-</div><div class="sl">P(B|A)</div></div><div class="sc"><div class="sv sv-purple" id="u5Comp">-</div><div class="sl">P(A')</div></div></div></div><div class="explain"><h3>Independence</h3><p id="u5Independence">Independent? Compare P(A and B) to P(A)P(B).</p><div class="formula">P(A union B) = P(A) + P(B) - P(A and B)</div></div></div>`;
  }
  if(unit===6){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Binomial Explorer</div><div class="viz-desc">PMF bars for X~Bin(n,p), with cumulative probability P(X<=k).</div><canvas id="binomCanvas" height="330"></canvas><div class="controls"><div class="cg"><span class="cl">n <span class="sv-val" id="u6NVal">12</span></span><input type="range" id="u6N" min="1" max="40" value="12" step="1" oninput="drawBinom()"></div><div class="cg"><span class="cl">p <span class="sv-val" id="u6PVal">0.40</span></span><input type="range" id="u6P" min="0.01" max="0.99" value="0.40" step="0.01" oninput="drawBinom()"></div><div class="cg"><span class="cl">k <span class="sv-val" id="u6KVal">4</span></span><input type="range" id="u6K" min="0" max="12" value="4" step="1" oninput="drawBinom()"></div><div class="cg"><span class="cl">Overlay</span><label class="viz-inline"><input type="checkbox" id="u6Normal" onchange="drawBinom()"> Normal approximation</label></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u6Mean">-</div><div class="sl">E(X)=np</div></div><div class="sc"><div class="sv sv-amber" id="u6SD">-</div><div class="sl">SD(X)=sqrt(npq)</div></div><div class="sc"><div class="sv sv-pink" id="u6Cum">-</div><div class="sl">P(X<=k)</div></div></div></div><div class="explain"><h3>Binomial PMF</h3><p>Each bar is P(X=k) for one count of successes.</p><div class="formula">P(X=k) = C(n,k)p^k(1-p)^(n-k)</div></div></div>`;
  }
  if(unit===7){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">CLT Simulator</div><div class="viz-desc">Top: population. Bottom: sampling distribution of xbar built from repeated samples.</div><div class="viz-split-label">Population</div><canvas id="cltPopCanvas" height="180"></canvas><div class="viz-split-label">Sampling distribution of xbar</div><canvas id="cltSampleCanvas" height="180"></canvas><div class="controls"><div class="cg"><span class="cl">Population shape</span><select id="u7Shape" onchange="setCLTShape(this.value)"><option value="uniform">Uniform</option><option value="right">Right-skewed</option><option value="bimodal">Bimodal</option></select></div><div class="cg"><span class="cl">Sample size n</span><select id="u7N" onchange="setCLTN(+this.value)"><option value="1">1</option><option value="5" selected>5</option><option value="10">10</option><option value="30">30</option><option value="50">50</option></select></div><div class="cg"><span class="cl">Sampling</span><div class="viz-btn-group"><button type="button" onclick="cltDraw(1)">Draw 1 Sample</button><button type="button" onclick="cltDraw(100)">Draw 100 Samples</button><button type="button" onclick="cltReset()">Reset</button></div></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u7PopMu">-</div><div class="sl">population mu</div></div><div class="sc"><div class="sv sv-amber" id="u7MeanXbar">-</div><div class="sl">mean of xbars</div></div><div class="sc"><div class="sv sv-pink" id="u7SE">-</div><div class="sl">SE obs/theory</div></div><div class="sc"><div class="sv sv-purple" id="u7Count">-</div><div class="sl">number of xbars</div></div></div></div><div class="explain"><h3>Central Limit Theorem</h3><p>As n increases, xbar becomes more normal and less variable.</p><div class="formula">SE(xbar) = sigma / sqrt(n)</div></div></div>`;
  }
  if(unit===8){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">CI Coverage Simulator</div><div class="viz-desc">Run 100 intervals and count captures of the true proportion.</div><canvas id="covCanvas" height="360"></canvas><div class="controls"><div class="cg"><span class="cl">True p <span class="sv-val" id="u8PVal">0.50</span></span><input type="range" id="u8P" min="0.10" max="0.90" step="0.01" value="0.50" oninput="drawCoverage()"></div><div class="cg"><span class="cl">Confidence</span><select id="u8CL" onchange="drawCoverage()"><option value="0.90">90%</option><option value="0.95" selected>95%</option><option value="0.99">99%</option></select></div><div class="cg"><span class="cl">Sample size n <span class="sv-val" id="u8NVal">100</span></span><input type="range" id="u8N" min="20" max="500" step="1" value="100" oninput="drawCoverage()"></div><div class="cg"><span class="cl">Simulation</span><button type="button" onclick="runCoverage()">Run 100 Simulations</button></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u8Capture">-</div><div class="sl">capture count</div></div><div class="sc"><div class="sv sv-amber" id="u8Actual">-</div><div class="sl">actual rate</div></div><div class="sc"><div class="sv sv-pink" id="u8Nominal">-</div><div class="sl">nominal rate</div></div></div></div><div class="explain"><h3>Coverage Meaning</h3><p>Confidence level is long-run capture rate of the method.</p><div class="formula">phat +/- z* sqrt(phat(1-phat)/n)</div></div></div>`;
  }
  if(unit===9){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">P-Value Visualizer</div><div class="viz-desc">Select tail type, test statistic, and alpha to compare p-value against critical boundaries.</div><canvas id="pvalCanvas" height="330"></canvas><div class="controls"><div class="cg"><span class="cl">Tail</span><select id="u9Tail" onchange="drawPValue()"><option value="left">Left-tail</option><option value="right" selected>Right-tail</option><option value="two">Two-tail</option></select></div><div class="cg"><span class="cl">z <span class="sv-val" id="u9ZVal">1.20</span></span><input type="range" id="u9Z" min="-4" max="4" step="0.01" value="1.20" oninput="drawPValue()"></div><div class="cg"><span class="cl">alpha</span><select id="u9Alpha" onchange="drawPValue()"><option value="0.01">0.01</option><option value="0.05" selected>0.05</option><option value="0.10">0.10</option></select></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u9Stat">-</div><div class="sl">test statistic</div></div><div class="sc"><div class="sv sv-amber" id="u9P">-</div><div class="sl">p-value</div></div><div class="sc"><div class="sv sv-pink" id="u9Decision">-</div><div class="sl">decision</div></div></div></div><div class="explain"><h3>Decision Rule</h3><p id="u9CritText">Reject H0 when p-value <= alpha.</p><div class="formula">Compare p-value to alpha.</div></div></div>`;
  }
  if(unit===10){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Chi-Square Distribution Explorer</div><div class="viz-desc">Use df and chi-square sliders to see the right-tail p-value and critical cutoffs.</div><canvas id="chiCanvas" height="330"></canvas><div class="controls"><div class="cg"><span class="cl">df <span class="sv-val" id="u10DfVal">4</span></span><input type="range" id="u10Df" min="1" max="15" value="4" step="1" oninput="drawChiSq()"></div><div class="cg"><span class="cl">chi^2 value <span class="sv-val" id="u10XVal">6.0</span></span><input type="range" id="u10X" min="0" max="30" value="6.0" step="0.1" oninput="drawChiSq()"></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u10DfStat">-</div><div class="sl">df</div></div><div class="sc"><div class="sv sv-amber" id="u10XStat">-</div><div class="sl">chi^2</div></div><div class="sc"><div class="sv sv-pink" id="u10PStat">-</div><div class="sl">p-value</div></div></div></div><div class="explain"><h3>Right Tail</h3><p id="u10CritText">Critical values shown for alpha=0.05 and 0.01.</p><div class="formula">p-value = P(Chi-square_df >= observed)</div></div></div>`;
  }
  if(unit===11){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Regression Output Interpreter</div><div class="viz-desc">Choose a dataset preset and hover highlighted values for quick interpretation tips.</div><canvas id="regCanvas" height="340"></canvas><div class="controls"><div class="cg"><span class="cl">Preset dataset</span><select id="u11Preset" onchange="drawRegOut()"><option value="study">Study Hours vs Score</option><option value="ads">Ad Spend vs Sales</option><option value="house">Home Size vs Price</option></select></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u11Slope">-</div><div class="sl">slope</div></div><div class="sc"><div class="sv sv-amber" id="u11SE">-</div><div class="sl">SE</div></div><div class="sc"><div class="sv sv-pink" id="u11T">-</div><div class="sl">t-stat</div></div><div class="sc"><div class="sv sv-purple" id="u11P">-</div><div class="sl">p-value</div></div><div class="sc"><div class="sv sv-green" id="u11R2">-</div><div class="sl">r^2</div></div></div><div id="u11Tip" class="viz-tip">Hover a highlighted value for explanation.</div></div><div class="explain"><h3>Inference Formulas</h3><p>Use slope inference to test whether the linear relationship differs from zero.</p><div class="formula">t = b1 / SE(b1) &nbsp;&nbsp; CI: b1 +/- t* SE(b1)</div></div></div>`;
  }
  return '';
}

const allViz={
  1:{tabs:['hist','box','norm','comp'],draw:()=>{drawHist();drawBox();drawNorm();drawComp();}},
  2:{tabs:['zscore'],draw:drawZscore},
  3:{tabs:['scatter'],draw:drawScatter},
  4:{tabs:['sampling'],draw:drawSampling},
  5:{tabs:['venn'],draw:drawVenn},
  6:{tabs:['binom'],draw:drawBinom},
  7:{tabs:['clt'],draw:drawCLT},
  8:{tabs:['coverage'],draw:drawCoverage},
  9:{tabs:['pvalue'],draw:drawPValue},
  10:{tabs:['chisq'],draw:drawChiSq},
  11:{tabs:['regout'],draw:drawRegOut}
};

function buildVizForUnit(unit=currentUnit){
  const tabs=document.getElementById('vizTabs');
  const panels=document.getElementById('viz-panels');
  const dynamic=document.getElementById('viz-dynamic');
  if(!tabs||!panels||!dynamic)return;
  if(unit===1){
    tabs.style.display='flex';panels.style.display='block';
    dynamic.style.display='none';dynamic.innerHTML='';
    setTimeout(()=>drawActiveVisualizer(),20);
    return;
  }
  tabs.style.display='none';panels.style.display='none';
  dynamic.style.display='block';dynamic.innerHTML=vizTemplate(unit);
  setTimeout(()=>{const v=allViz[unit];if(v&&typeof v.draw==='function')v.draw();},20);
}

function drawActiveVisualizer(){
  if(currentUnit===1){drawHist();drawBox();drawNorm();drawComp();return;}
  const v=allViz[currentUnit];if(v&&typeof v.draw==='function')v.draw();
}

const vizState={
  u3:{points:[]},
  u4:{method:'none',selected:[]},
  u7:{shape:'uniform',n:5,means:[]},
  u8:{key:'',intervals:[],captures:0},
  u11:{hotspots:[],hover:'',mouse:{x:0,y:0}}
};

function sampleUnique(arr,n){
  const pool=[...arr],out=[];
  while(pool.length&&out.length<n){
    const i=Math.floor(Math.random()*pool.length);
    out.push(pool.splice(i,1)[0]);
  }
  return out;
}

function approxInvNorm(p){
  let lo=-8,hi=8,target=clamp(p,1e-7,1-1e-7);
  for(let i=0;i<60;i++){
    const mid=(lo+hi)/2;
    if(normalCDF(mid,0,1)<target)lo=mid;else hi=mid;
  }
  return (lo+hi)/2;
}

function gammaLn(z){
  const c=[676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
  if(z<0.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-gammaLn(1-z);
  z-=1;
  let x=0.99999999999980993;
  for(let i=0;i<c.length;i++)x+=c[i]/(z+i+1);
  const t=z+c.length-0.5;
  return 0.5*Math.log(2*Math.PI)+(z+0.5)*Math.log(t)-t+Math.log(x);
}

function chiSqPDF(x,df){
  if(x<=0)return 0;
  const k=df/2;
  return Math.exp((k-1)*Math.log(x)-x/2-k*Math.log(2)-gammaLn(k));
}

function chiSqCDF(x,df){
  if(x<=0)return 0;
  const n=800,h=x/n;
  let area=0;
  for(let i=0;i<n;i++){
    const x0=i*h,x1=(i+1)*h;
    area+=(chiSqPDF(x0,df)+chiSqPDF(x1,df))*h*0.5;
  }
  return clamp(area,0,1);
}

const chiCriticalCache={};
function chiSqCritical(df,alpha){
  const key=df+'|'+alpha;
  if(chiCriticalCache[key]!==undefined)return chiCriticalCache[key];
  const target=1-alpha;
  let lo=0,hi=Math.max(20,df*3);
  while(chiSqCDF(hi,df)<target&&hi<500)hi*=1.5;
  for(let i=0;i<40;i++){
    const mid=(lo+hi)/2;
    if(chiSqCDF(mid,df)<target)lo=mid;else hi=mid;
  }
  const out=(lo+hi)/2;
  chiCriticalCache[key]=out;
  return out;
}

function setActiveButtons(selector,key,val){
  document.querySelectorAll(selector).forEach(btn=>{
    if(btn.dataset[key]===val)btn.classList.add('btn-a');
    else btn.classList.remove('btn-a');
  });
}

function drawZscore(){
  const x=gNum('u2X',72),mu=gNum('u2Mu',70),sig=Math.max(1,gNum('u2Sig',10));
  setElText('u2XVal',x.toFixed(0));
  setElText('u2MuVal',mu.toFixed(0));
  setElText('u2SigVal',sig.toFixed(0));
  const z=(x-mu)/sig,left=normalCDF(x,mu,sig),right=1-left;
  setElText('u2Z',z.toFixed(2));
  setElText('u2Left',fmtPct(left));
  setElText('u2Right',fmtPct(right));
  const cv=prepCanvas2('zCanvas',320);if(!cv)return;
  const {ctx,W,H}=cv,pad={l:38,r:20,t:20,b:36};
  const xMin=mu-4*sig,xMax=mu+4*sig,pw=W-pad.l-pad.r,ph=H-pad.t-pad.b;
  const maxY=normalPDF(mu,mu,sig);
  const toX=v=>pad.l+((v-xMin)/(xMax-xMin))*pw;
  const toY=v=>pad.t+ph*(1-v/(maxY*1.05));
  ctx.strokeStyle='#2c2c48';
  ctx.beginPath();ctx.moveTo(pad.l,H-pad.b);ctx.lineTo(W-pad.r,H-pad.b);ctx.stroke();
  for(let t=0;t<=4;t++){
    const xv=xMin+t*(xMax-xMin)/4;
    ctx.fillStyle='#55556888';ctx.font='10px Space Mono';ctx.textAlign='center';
    ctx.fillText(xv.toFixed(0),toX(xv),H-pad.b+15);
  }
  const shadeTo=Math.min(Math.max(x,xMin),xMax);
  if(shadeTo>xMin){
    ctx.beginPath();ctx.moveTo(toX(xMin),H-pad.b);
    for(let xv=xMin;xv<=shadeTo;xv+=(xMax-xMin)/220)ctx.lineTo(toX(xv),toY(normalPDF(xv,mu,sig)));
    ctx.lineTo(toX(shadeTo),H-pad.b);ctx.closePath();
    ctx.fillStyle='rgba(6,182,212,0.22)';ctx.fill();
  }
  ctx.beginPath();
  for(let xv=xMin;xv<=xMax;xv+=(xMax-xMin)/320){
    const px=toX(xv),py=toY(normalPDF(xv,mu,sig));
    xv===xMin?ctx.moveTo(px,py):ctx.lineTo(px,py);
  }
  ctx.strokeStyle='#06b6d4';ctx.lineWidth=2.5;ctx.stroke();
  ctx.setLineDash([6,4]);ctx.strokeStyle='#f59e0b';
  ctx.beginPath();ctx.moveTo(toX(x),pad.t);ctx.lineTo(toX(x),H-pad.b);ctx.stroke();
  ctx.setLineDash([]);
}

function scatterPreset(kind){
  const pts=[],noise=[0.6,-0.3,0.2,-0.5,0.1,0.5,-0.4,0.2,-0.1,0.4];
  for(let i=0;i<10;i++){
    const x=i+1;
    let y=5;
    if(kind==='positive')y=1.8*x+1+noise[i];
    else if(kind==='negative')y=20-1.6*x+noise[i];
    else y=5+noise[i]*6;
    pts.push({x,y:clamp(y,0.5,9.8)});
  }
  return pts;
}

function setScatterPreset(kind){
  vizState.u3.points=scatterPreset(kind);
  setActiveButtons('[data-u3preset]','u3preset',kind);
  drawScatter();
}

function clearScatter(){
  vizState.u3.points=[];
  setActiveButtons('[data-u3preset]','u3preset','');
  drawScatter();
}

function regressionStats(points){
  const n=points.length;
  if(n<2)return {n,slope:0,intercept:0,r:0,r2:0};
  const xs=points.map(p=>p.x),ys=points.map(p=>p.y),mx=mean(xs),my=mean(ys);
  let sxx=0,syy=0,sxy=0;
  for(let i=0;i<n;i++){
    const dx=xs[i]-mx,dy=ys[i]-my;
    sxx+=dx*dx;syy+=dy*dy;sxy+=dx*dy;
  }
  const slope=sxx? sxy/sxx : 0;
  const intercept=my-slope*mx;
  const r=(sxx&&syy)? sxy/Math.sqrt(sxx*syy) : 0;
  return {n,slope,intercept,r,r2:r*r};
}

function drawScatter(){
  const canvas=document.getElementById('scatterCanvas');
  if(canvas&&!canvas.dataset.bound){
    canvas.dataset.bound='1';
    canvas.addEventListener('click',e=>{
      const rect=canvas.getBoundingClientRect(),pad={l:44,r:20,t:20,b:34};
      const xPix=e.clientX-rect.left,yPix=e.clientY-rect.top;
      const x=clamp((xPix-pad.l)/(rect.width-pad.l-pad.r)*10,0,10);
      const y=clamp(10-(yPix-pad.t)/(rect.height-pad.t-pad.b)*10,0,10);
      vizState.u3.points.push({x,y});
      drawScatter();
    });
  }
  const pts=vizState.u3.points;
  const stats=regressionStats(pts);
  setElText('u3Eq','yhat = '+stats.intercept.toFixed(2)+' + '+stats.slope.toFixed(2)+'x');
  setElText('u3R','r = '+stats.r.toFixed(3));
  setElText('u3R2','r^2 = '+stats.r2.toFixed(3));
  setElText('u3N','n = '+stats.n);
  setElText('u3Formula','yhat = '+stats.intercept.toFixed(2)+' + '+stats.slope.toFixed(2)+'x');
  const cv=prepCanvas2('scatterCanvas',330);if(!cv)return;
  const {ctx,W,H}=cv,pad={l:44,r:20,t:20,b:34},pw=W-pad.l-pad.r,ph=H-pad.t-pad.b;
  const toX=x=>pad.l+(x/10)*pw,toY=y=>pad.t+((10-y)/10)*ph;
  ctx.strokeStyle='#1c1c30';
  for(let i=0;i<=10;i+=2){
    const x=toX(i),y=toY(i);
    ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,H-pad.b);ctx.stroke();
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();
    ctx.fillStyle='#55556888';ctx.font='10px Space Mono';ctx.textAlign='center';
    ctx.fillText(String(i),x,H-pad.b+15);
    ctx.textAlign='right';ctx.fillText(String(i),pad.l-6,y+3);
  }
  pts.forEach(p=>{ctx.beginPath();ctx.arc(toX(p.x),toY(p.y),4,0,Math.PI*2);ctx.fillStyle='rgba(6,182,212,0.9)';ctx.fill();});
  if(pts.length>=2){
    const y1=stats.intercept,y2=stats.intercept+stats.slope*10;
    ctx.strokeStyle='#f59e0b';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(toX(0),toY(y1));ctx.lineTo(toX(10),toY(y2));ctx.stroke();
  }
}

function u4Population(){
  const out=[];
  for(let r=0;r<10;r++)for(let c=0;c<10;c++)out.push({idx:r*10+c,row:r,col:c,group:Math.floor((r*10+c)/25)});
  return out;
}

function runSampling(method){
  const pop=u4Population();
  let picks=[];
  if(method==='srs')picks=sampleUnique(pop.map(p=>p.idx),20);
  if(method==='stratified')for(let g=0;g<4;g++)picks.push(...sampleUnique(pop.filter(p=>p.group===g).map(p=>p.idx),5));
  if(method==='cluster'){
    const rows=sampleUnique([0,1,2,3,4,5,6,7,8,9],2);
    picks=pop.filter(p=>rows.includes(p.row)).map(p=>p.idx);
  }
  if(method==='systematic'){
    const start=Math.floor(Math.random()*5);
    for(let i=start;i<100;i+=5)picks.push(i);
  }
  vizState.u4.method=method;
  vizState.u4.selected=picks;
  setActiveButtons('[data-u4method]','u4method',method);
  drawSampling();
}

function resetSampling(){
  vizState.u4.method='none';
  vizState.u4.selected=[];
  setActiveButtons('[data-u4method]','u4method','');
  drawSampling();
}

function drawSampling(){
  const pop=u4Population(),selected=new Set(vizState.u4.selected);
  const counts=[0,0,0,0];
  pop.forEach(p=>{if(selected.has(p.idx))counts[p.group]++;});
  setElText('u4Pop','A25 B25 C25 D25');
  setElText('u4Sample','A'+counts[0]+' B'+counts[1]+' C'+counts[2]+' D'+counts[3]);
  setElText('u4Method',vizState.u4.method==='none'?'None':vizState.u4.method);
  setElText('u4Size','n = '+selected.size);
  const cv=prepCanvas2('samplingCanvas',330);if(!cv)return;
  const {ctx,W,H}=cv,pad=28;
  const colors=['#06b6d4','#f59e0b','#f472b6','#34d399'];
  for(let r=0;r<10;r++){
    for(let c=0;c<10;c++){
      const idx=r*10+c;
      const x=pad+c*(W-pad*2)/9,y=pad+r*(H-pad*2)/9;
      ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);
      ctx.fillStyle=colors[Math.floor(idx/25)]+'66';ctx.fill();
      if(selected.has(idx)){
        ctx.beginPath();ctx.arc(x,y,8.5,0,Math.PI*2);
        ctx.strokeStyle='rgba(255,255,255,0.95)';ctx.lineWidth=2;ctx.stroke();
      }
    }
  }
}

function drawVenn(){
  const pA=clamp(gNum('u5PA',0.55),0,1),pB=clamp(gNum('u5PB',0.45),0,1);
  const abSlider=document.getElementById('u5PAB');
  const maxAB=Math.min(pA,pB);
  if(abSlider){abSlider.max=maxAB.toFixed(2);if(+abSlider.value>maxAB)abSlider.value=maxAB.toFixed(2);}
  const pAB=clamp(gNum('u5PAB',Math.min(pA,pB)/2),0,maxAB);
  setElText('u5PAVal',pA.toFixed(2));setElText('u5PBVal',pB.toFixed(2));setElText('u5PABVal',pAB.toFixed(2));
  const union=pA+pB-pAB,pAcondB=pB?pAB/pB:0,pBcondA=pA?pAB/pA:0,pComp=1-pA;
  setElText('u5Union',union.toFixed(3));
  setElText('u5AcondB',pAcondB.toFixed(3));
  setElText('u5BcondA',pBcondA.toFixed(3));
  setElText('u5Comp',pComp.toFixed(3));
  const indep=Math.abs(pAB-pA*pB)<=0.01;
  setElText('u5Independence','Independent? '+(indep?'Yes':'No')+' (P(A and B)='+pAB.toFixed(3)+' vs P(A)P(B)='+(pA*pB).toFixed(3)+')');
  const cv=prepCanvas2('vennCanvas',320);if(!cv)return;
  const {ctx,W,H}=cv;
  ctx.strokeStyle='#2c2c48';ctx.strokeRect(20,20,W-40,H-40);
  const rA=45+70*Math.sqrt(pA),rB=45+70*Math.sqrt(pB);
  const overlapRatio=maxAB?pAB/maxAB:0;
  const minD=Math.abs(rA-rB)+8,maxD=rA+rB-10;
  const d=clamp(maxD-overlapRatio*(maxD-minD),minD,maxD);
  const c1x=W/2-d/2,c2x=W/2+d/2,cy=H*0.56;
  ctx.beginPath();ctx.arc(c1x,cy,rA,0,Math.PI*2);ctx.fillStyle='rgba(6,182,212,0.22)';ctx.fill();
  ctx.beginPath();ctx.arc(c2x,cy,rB,0,Math.PI*2);ctx.fillStyle='rgba(244,114,182,0.22)';ctx.fill();
  ctx.beginPath();ctx.arc(c1x,cy,rA,0,Math.PI*2);ctx.strokeStyle='rgba(6,182,212,0.9)';ctx.stroke();
  ctx.beginPath();ctx.arc(c2x,cy,rB,0,Math.PI*2);ctx.strokeStyle='rgba(244,114,182,0.9)';ctx.stroke();
  ctx.fillStyle='#06b6d4';ctx.font='14px DM Sans';ctx.textAlign='center';ctx.fillText('A',c1x-rA*0.45,cy-rA*0.75);
  ctx.fillStyle='#f472b6';ctx.fillText('B',c2x+rB*0.45,cy-rB*0.75);
}

function drawBinom(){
  const n=Math.round(gNum('u6N',12)),p=clamp(gNum('u6P',0.4),0.01,0.99);
  const kSlider=document.getElementById('u6K');
  if(kSlider){kSlider.max=String(n);if(+kSlider.value>n)kSlider.value=String(n);}
  const k=Math.round(gNum('u6K',Math.min(4,n)));
  setElText('u6NVal',String(n));setElText('u6PVal',p.toFixed(2));setElText('u6KVal',String(k));
  const q=1-p,probs=[],meanX=n*p,sdX=Math.sqrt(n*p*q);
  for(let i=0;i<=n;i++)probs.push(comb(n,i)*Math.pow(p,i)*Math.pow(1-p,n-i));
  const cdf=probs.slice(0,k+1).reduce((s,v)=>s+v,0);
  setElText('u6Mean',meanX.toFixed(3));
  setElText('u6SD',sdX.toFixed(3));
  setElText('u6Cum',cdf.toFixed(4));
  const cv=prepCanvas2('binomCanvas',330);if(!cv)return;
  const {ctx,W,H}=cv,pad={l:36,r:20,t:16,b:34},pw=W-pad.l-pad.r,ph=H-pad.t-pad.b;
  const maxP=Math.max(...probs)*1.08,toX=i=>pad.l+(i/(n+1))*pw,toY=v=>pad.t+ph*(1-v/maxP),barW=pw/(n+1)*0.84;
  ctx.strokeStyle='#2c2c48';
  ctx.beginPath();ctx.moveTo(pad.l,H-pad.b);ctx.lineTo(W-pad.r,H-pad.b);ctx.stroke();
  for(let i=0;i<=n;i++){
    const x=toX(i),y=toY(probs[i]);
    ctx.fillStyle=i<=k?'rgba(245,158,11,0.72)':'rgba(6,182,212,0.72)';
    ctx.fillRect(x,y,barW,H-pad.b-y);
    if(n<=20||i%Math.ceil(n/10)===0){
      ctx.fillStyle='#55556888';ctx.font='10px Space Mono';ctx.textAlign='center';
      ctx.fillText(String(i),x+barW/2,H-pad.b+14);
    }
  }
  if(document.getElementById('u6Normal')?.checked&&sdX>0.01){
    ctx.beginPath();
    for(let xv=-0.5;xv<=n+0.5;xv+=0.05){
      const y=normalPDF(xv,meanX,sdX);
      const px=pad.l+((xv+0.5)/(n+1))*pw;
      const py=toY(y);
      xv===-0.5?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.strokeStyle='#f472b6';ctx.lineWidth=2;ctx.stroke();
  }
}

function sampleFromShape(shape){
  if(shape==='uniform')return Math.random();
  if(shape==='right')return Math.pow(Math.random(),2);
  return Math.random()<0.5?clamp(0.30+randn()*0.09,0,1):clamp(0.75+randn()*0.09,0,1);
}

function setCLTShape(shape){
  vizState.u7.shape=shape;
  vizState.u7.means=[];
  drawCLT();
}

function setCLTN(n){
  vizState.u7.n=n;
  vizState.u7.means=[];
  drawCLT();
}

function cltDraw(count){
  const shape=document.getElementById('u7Shape')?.value||vizState.u7.shape;
  const n=+(document.getElementById('u7N')?.value||vizState.u7.n||5);
  vizState.u7.shape=shape;
  vizState.u7.n=n;
  for(let i=0;i<count;i++){
    const sample=[];
    for(let j=0;j<n;j++)sample.push(sampleFromShape(shape));
    vizState.u7.means.push(mean(sample));
  }
  drawCLT();
}

function cltReset(){
  vizState.u7.means=[];
  drawCLT();
}

function drawCLT(){
  const shape=document.getElementById('u7Shape')?.value||vizState.u7.shape;
  const n=+(document.getElementById('u7N')?.value||vizState.u7.n||5);
  vizState.u7.shape=shape;
  vizState.u7.n=n;
  const popData=[];for(let i=0;i<2200;i++)popData.push(sampleFromShape(shape));
  const popMu=mean(popData),popSig=stdev(popData);
  const means=vizState.u7.means,meanXbar=means.length?mean(means):NaN,seObs=means.length>1?stdev(means):NaN,seTheory=popSig/Math.sqrt(n);
  setElText('u7PopMu',popMu.toFixed(3));
  setElText('u7MeanXbar',Number.isFinite(meanXbar)?meanXbar.toFixed(3):'-');
  setElText('u7SE',(Number.isFinite(seObs)?seObs.toFixed(3):'-')+' / '+seTheory.toFixed(3));
  setElText('u7Count',String(means.length));

  const top=prepCanvas2('cltPopCanvas',180);
  if(top){
    const {ctx,W,H}=top,pad={l:36,r:12,t:10,b:24},pw=W-pad.l-pad.r,ph=H-pad.t-pad.b,bins=20;
    const counts=new Array(bins).fill(0);
    popData.forEach(v=>{const b=Math.min(bins-1,Math.floor(v*bins));counts[b]++;});
    const mx=Math.max(...counts)||1;
    ctx.strokeStyle='#2c2c48';ctx.beginPath();ctx.moveTo(pad.l,H-pad.b);ctx.lineTo(W-pad.r,H-pad.b);ctx.stroke();
    for(let i=0;i<bins;i++){
      const x=pad.l+i*pw/bins,y=pad.t+ph*(1-counts[i]/mx),w=pw/bins-1;
      ctx.fillStyle='rgba(6,182,212,0.68)';ctx.fillRect(x,y,w,H-pad.b-y);
    }
    ctx.fillStyle='#55556888';ctx.font='10px Space Mono';ctx.textAlign='center';
    ctx.fillText('0.0',pad.l,H-8);ctx.fillText('1.0',W-pad.r,H-8);
  }

  const bot=prepCanvas2('cltSampleCanvas',180);
  if(bot){
    const {ctx,W,H}=bot,pad={l:36,r:12,t:10,b:24},pw=W-pad.l-pad.r,ph=H-pad.t-pad.b,bins=20;
    ctx.strokeStyle='#2c2c48';ctx.beginPath();ctx.moveTo(pad.l,H-pad.b);ctx.lineTo(W-pad.r,H-pad.b);ctx.stroke();
    if(means.length){
      const counts=new Array(bins).fill(0);
      means.forEach(v=>{const b=Math.min(bins-1,Math.floor(clamp(v,0,0.9999)*bins));counts[b]++;});
      const mx=Math.max(...counts)||1;
      for(let i=0;i<bins;i++){
        const x=pad.l+i*pw/bins,y=pad.t+ph*(1-counts[i]/mx),w=pw/bins-1;
        ctx.fillStyle='rgba(244,114,182,0.68)';ctx.fillRect(x,y,w,H-pad.b-y);
      }
      ctx.strokeStyle='#f59e0b';ctx.lineWidth=2;
      const xbarX=pad.l+clamp(meanXbar,0,1)*pw;
      ctx.beginPath();ctx.moveTo(xbarX,pad.t);ctx.lineTo(xbarX,H-pad.b);ctx.stroke();
    }
    ctx.fillStyle='#55556888';ctx.font='10px Space Mono';ctx.textAlign='center';
    ctx.fillText('0.0',pad.l,H-8);ctx.fillText('1.0',W-pad.r,H-8);
  }
}

function zStarFromCL(cl){
  if(cl>=0.99)return 2.576;
  if(cl>=0.95)return 1.96;
  return 1.645;
}

function runCoverage(){
  const p=clamp(gNum('u8P',0.5),0.1,0.9),cl=+((document.getElementById('u8CL')||{value:'0.95'}).value),n=Math.round(gNum('u8N',100));
  const z=zStarFromCL(cl),intervals=[];
  let captures=0;
  for(let i=0;i<100;i++){
    let x=0;
    for(let j=0;j<n;j++)if(Math.random()<p)x++;
    const phat=x/n,se=Math.sqrt(Math.max(phat*(1-phat)/n,1e-7)),me=z*se;
    const lo=clamp(phat-me,0,1),hi=clamp(phat+me,0,1),hit=lo<=p&&p<=hi;
    if(hit)captures++;
    intervals.push({lo,hi,hit});
  }
  vizState.u8={key:[p.toFixed(3),cl.toFixed(2),n].join('|'),intervals,captures};
  drawCoverage();
}

function drawCoverage(){
  const p=clamp(gNum('u8P',0.5),0.1,0.9),cl=+((document.getElementById('u8CL')||{value:'0.95'}).value),n=Math.round(gNum('u8N',100));
  setElText('u8PVal',p.toFixed(2));
  setElText('u8NVal',String(n));
  const key=[p.toFixed(3),cl.toFixed(2),n].join('|');
  if(vizState.u8.key!==key)vizState.u8={key,intervals:[],captures:0};
  const actual=vizState.u8.intervals.length?vizState.u8.captures/vizState.u8.intervals.length:0;
  setElText('u8Capture',vizState.u8.captures+' / '+vizState.u8.intervals.length);
  setElText('u8Actual',fmtPct(actual));
  setElText('u8Nominal',fmtPct(cl));
  const cv=prepCanvas2('covCanvas',360);if(!cv)return;
  const {ctx,W,H}=cv,pad={l:34,r:14,t:10,b:24},pw=W-pad.l-pad.r,ph=H-pad.t-pad.b;
  const toX=v=>pad.l+v*pw;
  ctx.strokeStyle='#2c2c48';ctx.beginPath();ctx.moveTo(pad.l,H-pad.b);ctx.lineTo(W-pad.r,H-pad.b);ctx.stroke();
  const px=toX(p);
  ctx.strokeStyle='#f59e0b';ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(px,pad.t);ctx.lineTo(px,H-pad.b);ctx.stroke();ctx.setLineDash([]);
  const intervals=vizState.u8.intervals,step=intervals.length?ph/intervals.length:0;
  intervals.forEach((it,i)=>{
    const y=pad.t+(i+0.5)*step;
    ctx.strokeStyle=it.hit?'rgba(52,211,153,0.8)':'rgba(239,68,68,0.8)';
    ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(toX(it.lo),y);ctx.lineTo(toX(it.hi),y);ctx.stroke();
  });
  ctx.fillStyle='#55556888';ctx.font='10px Space Mono';ctx.textAlign='center';
  for(let t=0;t<=5;t++){const v=t/5;ctx.fillText(v.toFixed(1),toX(v),H-8);}
}

function drawPValue(){
  const tail=(document.getElementById('u9Tail')||{value:'right'}).value;
  const z=clamp(gNum('u9Z',1.2),-4,4),alpha=+((document.getElementById('u9Alpha')||{value:'0.05'}).value);
  setElText('u9ZVal',z.toFixed(2));
  let pVal=0,critTxt='';
  const zLeft=approxInvNorm(alpha),zRight=approxInvNorm(1-alpha),zTwo=approxInvNorm(1-alpha/2);
  if(tail==='left'){pVal=normalCDF(z,0,1);critTxt='critical z = '+zLeft.toFixed(3);}
  if(tail==='right'){pVal=1-normalCDF(z,0,1);critTxt='critical z = '+zRight.toFixed(3);}
  if(tail==='two'){pVal=2*Math.min(normalCDF(z,0,1),1-normalCDF(z,0,1));critTxt='critical z = +/-'+zTwo.toFixed(3);}
  const reject=pVal<=alpha;
  setElText('u9Stat','z = '+z.toFixed(2));
  setElText('u9P',pVal.toFixed(4));
  setElText('u9Decision',reject?'Reject H0':'Fail to reject');
  setElText('u9CritText','Reject H0 when p-value <= alpha. '+critTxt);
  const cv=prepCanvas2('pvalCanvas',330);if(!cv)return;
  const {ctx,W,H}=cv,pad={l:36,r:18,t:16,b:32},pw=W-pad.l-pad.r,ph=H-pad.t-pad.b;
  const xMin=-4,xMax=4,maxY=normalPDF(0,0,1);
  const toX=x=>pad.l+((x-xMin)/(xMax-xMin))*pw,toY=y=>pad.t+ph*(1-y/(maxY*1.05));
  ctx.strokeStyle='#2c2c48';
  ctx.beginPath();ctx.moveTo(pad.l,H-pad.b);ctx.lineTo(W-pad.r,H-pad.b);ctx.stroke();
  const fillRegion=(a,b,color)=>{
    const lo=Math.max(xMin,a),hi=Math.min(xMax,b);if(hi<=lo)return;
    ctx.beginPath();ctx.moveTo(toX(lo),H-pad.b);
    for(let x=lo;x<=hi;x+=0.02)ctx.lineTo(toX(x),toY(normalPDF(x,0,1)));
    ctx.lineTo(toX(hi),H-pad.b);ctx.closePath();
    ctx.fillStyle=color;ctx.fill();
  };
  if(tail==='left')fillRegion(xMin,zLeft,'rgba(244,114,182,0.22)');
  if(tail==='right')fillRegion(zRight,xMax,'rgba(244,114,182,0.22)');
  if(tail==='two'){fillRegion(xMin,-zTwo,'rgba(244,114,182,0.22)');fillRegion(zTwo,xMax,'rgba(244,114,182,0.22)');}
  ctx.beginPath();
  for(let x=xMin;x<=xMax;x+=0.02)x===xMin?ctx.moveTo(toX(x),toY(normalPDF(x,0,1))):ctx.lineTo(toX(x),toY(normalPDF(x,0,1)));
  ctx.strokeStyle='#06b6d4';ctx.lineWidth=2.3;ctx.stroke();
  ctx.strokeStyle='#f59e0b';ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(toX(z),pad.t);ctx.lineTo(toX(z),H-pad.b);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='rgba(239,68,68,0.9)';ctx.lineWidth=1.5;
  if(tail==='left'||tail==='right'){
    const c=tail==='left'?zLeft:zRight;
    ctx.beginPath();ctx.moveTo(toX(c),pad.t);ctx.lineTo(toX(c),H-pad.b);ctx.stroke();
  }else{
    ctx.beginPath();ctx.moveTo(toX(-zTwo),pad.t);ctx.lineTo(toX(-zTwo),H-pad.b);ctx.stroke();
    ctx.beginPath();ctx.moveTo(toX(zTwo),pad.t);ctx.lineTo(toX(zTwo),H-pad.b);ctx.stroke();
  }
}

function drawChiSq(){
  const df=Math.round(gNum('u10Df',4)),xObs=clamp(gNum('u10X',6),0,30);
  setElText('u10DfVal',String(df));
  setElText('u10XVal',xObs.toFixed(1));
  const pVal=1-chiSqCDF(xObs,df),crit05=chiSqCritical(df,0.05),crit01=chiSqCritical(df,0.01);
  setElText('u10DfStat','df='+df);
  setElText('u10XStat','chi^2='+xObs.toFixed(2));
  setElText('u10PStat','p='+pVal.toFixed(4));
  setElText('u10CritText','critical(alpha=0.05)='+crit05.toFixed(2)+', critical(alpha=0.01)='+crit01.toFixed(2));
  const cv=prepCanvas2('chiCanvas',330);if(!cv)return;
  const {ctx,W,H}=cv,pad={l:38,r:18,t:16,b:34},pw=W-pad.l-pad.r,ph=H-pad.t-pad.b;
  const xMax=Math.max(30,crit01*1.2,xObs+5),toX=x=>pad.l+(x/xMax)*pw;
  let maxY=0;for(let x=0.01;x<=xMax;x+=xMax/500)maxY=Math.max(maxY,chiSqPDF(x,df));
  const toY=y=>pad.t+ph*(1-y/(maxY*1.08));
  ctx.strokeStyle='#2c2c48';
  ctx.beginPath();ctx.moveTo(pad.l,H-pad.b);ctx.lineTo(W-pad.r,H-pad.b);ctx.stroke();
  ctx.beginPath();
  for(let x=0.01;x<=xMax;x+=xMax/520){
    const px=toX(x),py=toY(chiSqPDF(x,df));
    x<=0.02?ctx.moveTo(px,py):ctx.lineTo(px,py);
  }
  ctx.strokeStyle='#06b6d4';ctx.lineWidth=2.4;ctx.stroke();
  ctx.beginPath();ctx.moveTo(toX(xObs),H-pad.b);
  for(let x=xObs;x<=xMax;x+=xMax/400)ctx.lineTo(toX(x),toY(chiSqPDF(x,df)));
  ctx.lineTo(toX(xMax),H-pad.b);ctx.closePath();
  ctx.fillStyle='rgba(244,114,182,0.22)';ctx.fill();
  ctx.strokeStyle='#f59e0b';ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(toX(xObs),pad.t);ctx.lineTo(toX(xObs),H-pad.b);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='rgba(239,68,68,0.9)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(toX(crit05),pad.t);ctx.lineTo(toX(crit05),H-pad.b);ctx.stroke();
  ctx.strokeStyle='rgba(251,146,60,0.95)';
  ctx.beginPath();ctx.moveTo(toX(crit01),pad.t);ctx.lineTo(toX(crit01),H-pad.b);ctx.stroke();
}

const regPresets={
  study:{name:'Study Hours vs Score',intercept:41.2,slope:2.48,se:0.62,p:0.0008,r2:0.64,n:32},
  ads:{name:'Ad Spend vs Sales',intercept:18.5,slope:1.17,se:0.34,p:0.0041,r2:0.51,n:28},
  house:{name:'Home Size vs Price',intercept:85.0,slope:0.118,se:0.041,p:0.0097,r2:0.47,n:30}
};

function drawRegOut(){
  const sel=(document.getElementById('u11Preset')||{value:'study'}).value;
  const row=regPresets[sel]||regPresets.study;
  const t=row.slope/row.se;
  setElText('u11Slope',row.slope.toFixed(3));
  setElText('u11SE',row.se.toFixed(3));
  setElText('u11T',t.toFixed(3));
  setElText('u11P',row.p.toFixed(4));
  setElText('u11R2',row.r2.toFixed(3));

  const canvas=document.getElementById('regCanvas');
  if(canvas&&!canvas.dataset.bound){
    canvas.dataset.bound='1';
    canvas.addEventListener('mousemove',e=>{
      const r=canvas.getBoundingClientRect();
      const x=e.clientX-r.left,y=e.clientY-r.top;
      vizState.u11.mouse={x,y};
      const hit=vizState.u11.hotspots.find(h=>x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h);
      vizState.u11.hover=hit?hit.key:'';
      setElText('u11Tip',hit?hit.tip:'Hover a highlighted value for explanation.');
      drawRegOut();
    });
    canvas.addEventListener('mouseleave',()=>{
      vizState.u11.hover='';
      setElText('u11Tip','Hover a highlighted value for explanation.');
      drawRegOut();
    });
  }

  const cv=prepCanvas2('regCanvas',340);if(!cv)return;
  const {ctx,W,H}=cv,x0=24,y0=30;
  ctx.fillStyle='#181828';ctx.fillRect(8,8,W-16,H-16);
  ctx.strokeStyle='#3a3a5c';ctx.strokeRect(8,8,W-16,H-16);
  ctx.fillStyle='#e6e4f0';ctx.font='16px DM Sans';ctx.fillText('Linear Regression Output',x0,y0);
  ctx.fillStyle='#8a88a0';ctx.font='12px DM Sans';ctx.fillText(row.name+' (n='+row.n+')',x0,y0+18);
  ctx.strokeStyle='#2c2c48';ctx.beginPath();ctx.moveTo(x0,y0+30);ctx.lineTo(W-24,y0+30);ctx.stroke();
  ctx.fillStyle='#e6e4f0';ctx.font='12px Space Mono';
  ctx.fillText('Term',x0,y0+52);ctx.fillText('Coef',x0+160,y0+52);ctx.fillText('SE Coef',x0+250,y0+52);ctx.fillText('T',x0+345,y0+52);ctx.fillText('P',x0+410,y0+52);
  ctx.strokeStyle='#2c2c48';ctx.beginPath();ctx.moveTo(x0,y0+58);ctx.lineTo(W-24,y0+58);ctx.stroke();

  const rows=[
    {term:'Constant',coef:row.intercept,se:6.10,t:row.intercept/6.1,p:0.0001},
    {term:'x',coef:row.slope,se:row.se,t,p:row.p}
  ];
  const hotspots=[];
  rows.forEach((r,i)=>{
    const yy=y0+86+i*28;
    ctx.fillStyle='#e6e4f0';ctx.font='12px Space Mono';
    ctx.fillText(r.term,x0,yy);
    const cRect={x:x0+150,y:yy-13,w:74,h:18,key:'coef'+i,val:r.coef.toFixed(3),tip:i?'Slope (b1): expected change in y per +1 x.':'Intercept (b0): predicted y when x=0.'};
    const seRect={x:x0+246,y:yy-13,w:84,h:18,key:'se'+i,val:r.se.toFixed(3),tip:'SE quantifies sampling variability of coefficient.'};
    const tRect={x:x0+336,y:yy-13,w:54,h:18,key:'t'+i,val:r.t.toFixed(3),tip:'t statistic = Coef / SE(Coef).'};
    const pRect={x:x0+404,y:yy-13,w:60,h:18,key:'p'+i,val:r.p.toFixed(4),tip:'p-value tests H0: coefficient = 0.'};
    [cRect,seRect,tRect,pRect].forEach(hs=>{
      if(vizState.u11.hover===hs.key){ctx.fillStyle='rgba(6,182,212,0.20)';ctx.fillRect(hs.x,hs.y,hs.w,hs.h);}
      ctx.fillStyle='#e6e4f0';ctx.fillText(hs.val,hs.x+4,yy);
      hotspots.push(hs);
    });
  });

  const r2Y=y0+160,r2Rect={x:x0+84,y:r2Y-13,w:80,h:18,key:'r2',tip:'r^2 is the proportion of y variation explained by x.'};
  if(vizState.u11.hover===r2Rect.key){ctx.fillStyle='rgba(52,211,153,0.20)';ctx.fillRect(r2Rect.x,r2Rect.y,r2Rect.w,r2Rect.h);}
  ctx.fillStyle='#8a88a0';ctx.font='12px Space Mono';ctx.fillText('R-Sq',x0,r2Y);
  ctx.fillStyle='#e6e4f0';ctx.fillText((row.r2*100).toFixed(1)+'%',x0+90,r2Y);
  hotspots.push(r2Rect);
  vizState.u11.hotspots=hotspots;

  if(vizState.u11.hover){
    const tip=vizState.u11.hotspots.find(h=>h.key===vizState.u11.hover)?.tip||'';
    if(tip){
      const tx=clamp(vizState.u11.mouse.x+12,16,W-270),ty=clamp(vizState.u11.mouse.y+10,16,H-44);
      ctx.fillStyle='rgba(10,10,15,0.96)';ctx.fillRect(tx,ty,250,28);
      ctx.strokeStyle='#3a3a5c';ctx.strokeRect(tx,ty,250,28);
      ctx.fillStyle='#e6e4f0';ctx.font='11px DM Sans';ctx.fillText(tip,tx+8,ty+18);
    }
  }
}

setUnit(1);
window.addEventListener('resize',()=>{drawActiveVisualizer();});

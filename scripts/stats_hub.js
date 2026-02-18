// ===================== NAVIGATION =====================
function syncTabState(tabBar,activeTab){
  if(!tabBar)return;
  tabBar.querySelectorAll('[role="tab"]').forEach(t=>{
    const on=t===activeTab;
    t.setAttribute('aria-selected',on?'true':'false');
    t.setAttribute('tabindex',on?'0':'-1');
  });
}

var _goPageSkipPush=false;
function goPage(id){
  if(typeof document==='undefined')return;
  if(id!=='practice'&&practiceSessionInterval){clearInterval(practiceSessionInterval);practiceSessionInterval=null;}
  const nextPage=document.getElementById('page-'+id);
  if(!nextPage)return;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  (function(){
    var bc=document.getElementById('breadcrumb');if(!bc)return;
    var names={home:'Home',roadmap:'Roadmap',visualizer:'Visualizer',practice:'Practice',review:'Review',achievements:'Achievements',flashcards:'Flashcards',create:'Create'};
    var label=names[id]||id;
    if(id==='practice')label='Practice <span class="breadcrumb-sep">›</span> Unit '+currentUnit+(typeof UNIT_META!=='undefined'&&UNIT_META[currentUnit]?' – '+UNIT_META[currentUnit].name:'');
    bc.innerHTML=label;
  })();
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  nextPage.classList.add('active');
  const navTabs=document.querySelector('.nav-tabs[role="tablist"]');
  const activeTab=document.getElementById('tab-'+id)||[...document.querySelectorAll('.nav-tab')].find(t=>t.textContent.toLowerCase()===id);
  if(activeTab){activeTab.classList.add('active');syncTabState(navTabs,activeTab);}
  if(typeof window!=='undefined'&&typeof window.scrollTo==='function')window.scrollTo(0,0);
  if(typeof window!=='undefined'&&typeof history!=='undefined'&&history.pushState&&!_goPageSkipPush){
    history.pushState({page:id},'','#/'+id);
  }
  _goPageSkipPush=false;
  if(id==='visualizer'&&typeof setTimeout==='function'){setTimeout(()=>{drawActiveVisualizer();buildVizHistory();buildVizUnitInfo(currentUnit);buildVizDataSummary(currentUnit);},50);}
  if(id==='review')updateReviewBadge();
  if(id==='home'){_statsAnimated=false;updateDailyDigest();buildDailyChallenge();buildWeeklyGoals();buildQuickStats();buildRecentActivity();buildStreakHeatmap();buildMotivationalQuote();}
  if(id==='practice'&&typeof localStorage!=='undefined'){
    var savedGoal=localStorage.getItem('sh-session-goal')||'0';
    if(typeof setTimeout!=='undefined'){setTimeout(function(){var sg=typeof document!=='undefined'?document.getElementById('sessionGoal'):null;if(sg)sg.value=savedGoal;refreshGoalProgress();},15);}
    const savedUnit=parseInt(localStorage.getItem('sh-filter-unit'))||1;
    const savedDiff=localStorage.getItem('sh-filter-diff')||'all';
    const savedSearch=localStorage.getItem('sh-filter-search')||'';
    if(typeof setTimeout!=='undefined'){setTimeout(function(){
      setUnit(savedUnit);
      filterProblems(savedDiff);
      const si=typeof document!=='undefined'?document.getElementById('searchInput'):null;
      if(si&&savedSearch){si.value=savedSearch;searchProblems();}
    },10);}
  }
  if(id==='achievements'){buildHeatmap();buildAchievementsPage();}
  if(id==='flashcards'){initFlashcardsPage();}
  if(id==='create'){initCreatePage();}
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
function mode(a){const f={};a.forEach(v=>{const k=Number.isInteger(v)?v:Math.round(v*2)/2;f[k]=(f[k]||0)+1});let mx=0,mv=0;for(let k in f)if(f[k]>mx){mx=f[k];mv=+k}return mv}
function stdev(a){const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/a.length)}
function quantile(a,q){const s=sorted(a),p=(s.length-1)*q,b=Math.floor(p),f=p-b;return s[b]+(s[b+1]-s[b]||0)*f}
function normalPDF(x,mu,sig){if(sig<=0)return 0;return Math.exp(-0.5*((x-mu)/sig)**2)/(sig*Math.sqrt(2*Math.PI))}
function erf(x){const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;const s=x<0?-1:1;x=Math.abs(x);const t=1/(1+p*x);const y=1-((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);return s*y}
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
function debounce(fn,ms){
  let t;
  return function(){
    if(typeof setTimeout!=='function'){fn();return;}
    if(typeof clearTimeout==='function'&&t)clearTimeout(t);
    t=setTimeout(fn,ms);
  };
}

const XP_TABLE={easy:5,medium:10,hard:20,wrong:1,topic:3};
const XP_PER_LEVEL=50;
const MILESTONES=[
  {id:'first-correct',name:'First Blood',desc:'Answer your first problem correctly',icon:'⚡',check:d=>d.totalCorrect>=1},
  {id:'streak-3',name:'On a Roll',desc:'3-day study streak',icon:'🔥',check:d=>d.streak>=3},
  {id:'streak-7',name:'Week Warrior',desc:'7-day study streak',icon:'💪',check:d=>d.streak>=7},
  {id:'streak-30',name:'Monthly Master',desc:'30-day study streak',icon:'👑',check:d=>d.streak>=30},
  {id:'unit-complete',name:'Unit Clear',desc:'Complete all problems in any unit',icon:'✅',check:d=>d.unitsComplete>=1},
  {id:'all-units',name:'Full Sweep',desc:'Complete all 11 units',icon:'🏆',check:d=>d.unitsComplete>=11},
  {id:'xp-100',name:'Centurion',desc:'Earn 100 XP',icon:'💯',check:d=>d.xp>=100},
  {id:'xp-500',name:'Scholar',desc:'Earn 500 XP',icon:'📚',check:d=>d.xp>=500},
  {id:'xp-1000',name:'Expert',desc:'Earn 1000 XP',icon:'🎓',check:d=>d.xp>=1000},
  {id:'topics-10',name:'Pathfinder',desc:'Check 10 roadmap topics',icon:'🗺️',check:d=>d.topicsChecked>=10},
  {id:'topics-50',name:'Navigator',desc:'Check 50 roadmap topics',icon:'🧭',check:d=>d.topicsChecked>=50},
  {id:'perfect-unit',name:'Flawless',desc:'100% correct on any unit',icon:'💎',check:d=>d.perfectUnits>=1},
  {id:'review-10',name:'Reviewer',desc:'Complete 10 review sessions',icon:'\ud83d\udd04',check:d=>d.reviewSessions>=10},
  {id:'review-50',name:'Memory Master',desc:'Complete 50 review sessions',icon:'\ud83e\udde0',check:d=>d.reviewSessions>=50},
  {id:'mastered-10',name:'Retention',desc:'Master 10 cards (30+ day interval)',icon:'\ud83c\udfc5',check:d=>d.mastered>=10}
];

function todayStr(){return new Date().toISOString().slice(0,10)}

function addDays(dateStr,days){
  const d=new Date(dateStr);
  if(Number.isNaN(d.getTime()))return todayStr();
  d.setDate(d.getDate()+(Number.isFinite(+days)?Math.trunc(+days):0));
  return d.toISOString().slice(0,10);
}

function getReviewData(){
  if(typeof localStorage==='undefined')return{};
  try{
    const data=JSON.parse(localStorage.getItem('sh-review')||'{}');
    return data&&typeof data==='object'&&!Array.isArray(data)?data:{};
  }catch{return{};}
}

function saveReviewData(data){
  if(typeof localStorage==='undefined')return;
  const safe=data&&typeof data==='object'&&!Array.isArray(data)?data:{};
  localStorage.setItem('sh-review',JSON.stringify(safe));
}

function getReviewMeta(){
  const fallback={sessions:0};
  if(typeof localStorage==='undefined')return fallback;
  try{
    const meta=JSON.parse(localStorage.getItem('sh-review-meta')||'{"sessions":0}')||{};
    return {sessions:Number.isFinite(+meta.sessions)?+meta.sessions:0};
  }catch{return fallback;}
}

function saveReviewMeta(meta){
  if(typeof localStorage==='undefined')return;
  const sessions=meta&&Number.isFinite(+meta.sessions)?+meta.sessions:0;
  localStorage.setItem('sh-review-meta',JSON.stringify({sessions}));
}

function addToReview(probId,wasCorrect){
  const key=String(probId);
  if(!key)return;
  const data=getReviewData();
  const today=todayStr();
  if(!data[key]){
    data[key]={
      next:wasCorrect?addDays(today,3):addDays(today,1),
      interval:wasCorrect?3:1,
      ease:2.5,
      reps:wasCorrect?1:0,
      lastResult:wasCorrect?'correct':'wrong'
    };
    saveReviewData(data);
  }
}

function getDueCards(){
  const data=getReviewData();
  const today=todayStr();
  const due=[];
  for(const id in data){
    const card=data[id];
    if(!card||typeof card!=='object')continue;
    const next=typeof card.next==='string'?card.next:'9999-12-31';
    if(next<=today)due.push(id);
  }
  due.sort((a,b)=>{
    const da=data[a]||{},db=data[b]||{};
    if(da.lastResult==='wrong'&&db.lastResult!=='wrong')return -1;
    if(db.lastResult==='wrong'&&da.lastResult!=='wrong')return 1;
    const nextA=typeof da.next==='string'?da.next:'9999-12-31';
    const nextB=typeof db.next==='string'?db.next:'9999-12-31';
    if(nextA===nextB)return 0;
    return nextA<nextB?-1:1;
  });
  return due;
}

function reviewAnswer(probId,wasCorrect){
  const key=String(probId);
  const data=getReviewData();
  const card=data[key];
  if(!card||typeof card!=='object')return;

  const currentInterval=Math.max(1,Math.round(Number.isFinite(+card.interval)?+card.interval:1));
  const currentEase=Number.isFinite(+card.ease)?+card.ease:2.5;
  const currentReps=Number.isFinite(+card.reps)?+card.reps:0;
  card.interval=currentInterval;
  card.ease=currentEase;
  card.reps=currentReps;

  if(wasCorrect){
    card.reps++;
    card.ease=Math.min(3.0,card.ease+0.1);
    card.interval=Math.round(card.interval*card.ease);
    card.lastResult='correct';
  }else{
    card.reps=0;
    card.ease=Math.max(1.3,card.ease-0.2);
    card.interval=1;
    card.lastResult='wrong';
  }
  card.next=addDays(todayStr(),card.interval);
  saveReviewData(data);
}

function getStreakData(){
  const fallback={current:0,longest:0,lastDate:'',history:[]};
  if(typeof localStorage==='undefined')return fallback;
  try{
    const data=JSON.parse(localStorage.getItem('sh-streak')||'{}')||{};
    return {
      current:Number.isFinite(+data.current)?+data.current:0,
      longest:Number.isFinite(+data.longest)?+data.longest:0,
      lastDate:typeof data.lastDate==='string'?data.lastDate:'',
      history:Array.isArray(data.history)?data.history:[]
    };
  }catch{return fallback;}
}

function saveStreakData(data){
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-streak',JSON.stringify(data));
}

function getXPData(){
  const fallback={total:0,level:1,history:[]};
  if(typeof localStorage==='undefined')return fallback;
  try{
    const data=JSON.parse(localStorage.getItem('sh-xp')||'{"total":0,"level":1,"history":[]}')||fallback;
    return {
      total:Number.isFinite(+data.total)?+data.total:0,
      level:Number.isFinite(+data.level)&&+data.level>0?+data.level:1,
      history:Array.isArray(data.history)?data.history:[]
    };
  }catch{return fallback;}
}

function saveXPData(data){
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-xp',JSON.stringify(data));
}

function getMilestones(){
  if(typeof localStorage==='undefined')return{};
  try{return JSON.parse(localStorage.getItem('sh-milestones')||'{}')||{};}catch{return{};}
}

function saveMilestones(data){
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-milestones',JSON.stringify(data));
}

function updateStreakDisplay(){
  if(typeof document==='undefined')return;
  const data=getStreakData();
  const el=document.getElementById('streakCount');
  if(el)el.textContent=String(data.current||0);
  const icon=document.getElementById('streakIcon');
  if(icon){
    if((data.current||0)>=7)icon.style.filter='hue-rotate(-10deg) brightness(1.3)';
    else if((data.current||0)>=3)icon.style.filter='';
    else icon.style.filter='grayscale(0.5)';
  }
}

function updateXPDisplay(){
  if(typeof document==='undefined')return;
  const data=getXPData();
  const el=document.getElementById('xpTotal');
  if(el)el.textContent=data.total+' XP';
  const lv=document.getElementById('xpLevel');
  if(lv)lv.textContent='Lv '+data.level;
  const bar=document.getElementById('xpBarFill');
  if(bar){
    const progress=(data.total%XP_PER_LEVEL)/XP_PER_LEVEL*100;
    bar.style.width=progress+'%';
  }
}

function showXPPopup(text){
  if(typeof document==='undefined')return;
  const popup=document.createElement('div');
  popup.className='xp-popup';
  popup.textContent=text;
  document.body.appendChild(popup);
  requestAnimationFrame(()=>{popup.classList.add('xp-popup-show');});
  setTimeout(()=>{popup.remove();},1200);
}

function recordActivity(){
  const data=getStreakData();
  const today=todayStr();
  if(data.lastDate===today){
    updateStreakDisplay();
    return data;
  }

  const yesterday=new Date();
  yesterday.setDate(yesterday.getDate()-1);
  const yesterdayStr=yesterday.toISOString().slice(0,10);

  if(data.lastDate===yesterdayStr)data.current=(data.current||0)+1;
  else if(data.lastDate&&data.lastDate!==today)data.current=1;
  else data.current=1;

  data.longest=Math.max(data.longest||0,data.current);
  data.lastDate=today;

  if(!Array.isArray(data.history))data.history=[];
  if(!data.history.includes(today))data.history.push(today);
  if(data.history.length>30)data.history=data.history.slice(-30);

  saveStreakData(data);
  updateStreakDisplay();
  awardXP(data.current*2,'streak-'+today);
  checkMilestones();
  return data;
}

function awardXP(amount,reason){
  if(!Number.isFinite(amount)||amount<=0)return;
  const data=getXPData();
  const oldLevel=data.level||1;
  const oldTotal=data.total||0;
  data.total=(data.total||0)+amount;
  const XP_MILESTONES=[100,250,500,1000,2500,5000];
  XP_MILESTONES.forEach(function(m){if(oldTotal<m&&data.total>=m)showToast('\U0001f3af XP Milestone! You\'ve reached '+m+' XP!');});
  data.level=Math.floor(data.total/XP_PER_LEVEL)+1;
  if(!Array.isArray(data.history))data.history=[];
  data.history.push({date:todayStr(),earned:amount,reason:String(reason||'')});
  if(data.history.length>100)data.history=data.history.slice(-100);
  saveXPData(data);
  sessionData.xpEarned+=amount;
  updateXPDisplay();
  showXPPopup('+'+amount+' XP');
  if(data.level>oldLevel)showToast('Level Up! You are now Level '+data.level+' 🎉');
  checkMilestones();
  updateDailyDigest();
}

function updateMilestoneDisplay(){
  if(typeof document==='undefined')return;
  const grid=document.getElementById('milestoneGrid');
  if(!grid)return;
  const earned=getMilestones();
  let html='';
  MILESTONES.forEach(m=>{
    const unlocked=!!earned[m.id];
    html+=`<div class="milestone-badge ${unlocked?'unlocked':'locked'}" title="${m.name}: ${m.desc}"><span class="badge-icon">${unlocked?m.icon:'🔒'}</span><span class="badge-name">${m.name}</span></div>`;
  });
  grid.innerHTML=html;
}

function checkMilestones(){
  if(typeof document==='undefined')return;
  const earned=getMilestones();
  const streak=getStreakData();
  const xpData=getXPData();
  const summary=getProgressSummary();

  let totalCorrect=0,unitsComplete=0,perfectUnits=0;
  for(let u=1;u<=MAX_UNIT;u++){
    const r=summary[u]||{total:0,correct:0};
    totalCorrect+=r.correct;
    if(r.total>0&&r.correct===r.total){unitsComplete++;perfectUnits++;}
    else if(r.total>0&&r.correct>=r.total*0.6)unitsComplete++;
  }
  const topicsChecked=document.querySelectorAll('.ti.chk,.ti.done').length||0;
  const reviewMeta=getReviewMeta();
  const reviewData=getReviewData();
  const mastered=Object.values(reviewData).filter(c=>c&&Number.isFinite(+c.interval)&&+c.interval>=30).length;
  const ctx={totalCorrect,streak:streak.current||0,unitsComplete,perfectUnits,xp:xpData.total||0,topicsChecked,reviewSessions:reviewMeta.sessions||0,mastered};

  let newBadge=false;
  MILESTONES.forEach(m=>{
    if(!earned[m.id]&&m.check(ctx)){
      earned[m.id]=todayStr();
      newBadge=true;
      showToast(m.icon+' Badge Earned: '+m.name+' — '+m.desc);
    }
  });
  if(newBadge)saveMilestones(earned);
  updateMilestoneDisplay();
}

// ===================== ROADMAP DATA =====================
const RM={l1:[
{p:"math",icon:"∑",time:"8–12 wk",name:"Mathematics",goal:"Establish and solve deterministic problems with algebra",topics:[
{n:"Solving linear and quadratic equations"},{n:"Functions and their graphs"},{n:"Polynomials and rational functions"},{n:"Exponents and logarithms"},{n:"Coordinate geometry"},{n:"Basic proofs and mathematical reasoning"}],
res:[{t:"Book",n:"Stewart — Precalculus",url:"https://www.amazon.com/dp/1305071751"},{t:"Course",n:"Khan Academy — Algebra I & II",url:"https://www.khanacademy.org/math/algebra"}]},
{p:"stats",icon:"μ",time:"8–12 wk",name:"Probability & Statistics",goal:"Model fixed randomness — dice rolls, coin flips, basic distributions",topics:[
{n:"Mean, median, mode, range"},{n:"Variance and standard deviation"},{n:"Sample spaces and events"},{n:"Conditional probability"},{n:"Combinatorics (permutations & combinations)"},{n:"Set theory basics"},{n:"Common distributions (normal, binomial, Poisson)",tag:"new"},{n:"Hypothesis testing & confidence intervals",tag:"new"}],
res:[{t:"Book",n:"Devore — Probability and Statistics",url:"https://www.amazon.com/dp/1305251806"},{t:"Course",n:"MIT 18.05 (OCW)",url:"https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2014/"},{t:"Course",n:"Khan Academy — Statistics",url:"https://www.khanacademy.org/math/statistics-probability"}]},
{p:"cs",icon:"{ }",time:"10–16 wk",name:"Computer Science",goal:"Write working programs, understand data structures & complexity",topics:[
{n:"Python fundamentals (or C++)"},{n:"Data structures: arrays, linked lists, hash maps, trees"},{n:"Sorting algorithms (merge, quick, heap)"},{n:"Time/space complexity (Big-O)"},{n:"CLI & Git"},{n:"SQL and relational databases",tag:"new"},{n:"Data wrangling (pandas, numpy)",tag:"new"}],
res:[{t:"Course",n:"MIT 6.0001 (OCW)",url:"https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/"},{t:"Book",n:"CLRS — Intro to Algorithms",url:"https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/"}]},
{p:"finance",icon:"$",time:"6–10 wk",name:"Finance & Economics",goal:"Understand financial news — interest rates, monetary vs. fiscal policy",topics:[
{n:"Market and macroeconomic basics"},{n:"Stocks, bonds, fixed income fundamentals"},{n:"Time value of money (PV, FV, NPV)"},{n:"Supply and demand, equilibrium"},{n:"GDP"},{n:"Monetary vs. fiscal policy"},{n:"Inflation and real vs. nominal values"},{n:"Market microstructure basics (bid-ask, order books)",tag:"new"}],
res:[{t:"Book",n:"Bodie, Kane, Marcus — Investments",url:"https://www.mheducation.com/highered/product/investments-bodie-kane-marcus/M9781260013979.html"},{t:"Course",n:"Yale ECON 252 (Shiller, Coursera)",url:"https://www.coursera.org/learn/financial-markets-global"}]}
],l2:[
{p:"math",icon:"∑",time:"12–16 wk",name:"Calculus & Linear Algebra",goal:"Solve problems with calculus; understand high-dimensional space",topics:[
{n:"Limits, derivatives, and integrals"},{n:"Optimization (minima/maxima)"},{n:"Multivariate calculus (partial derivatives, gradients)"},{n:"Vectors, matrices, matrix operations"},{n:"Eigenvalues and eigenvectors"},{n:"Solving systems of linear equations"},{n:"Numerical methods (root-finding, interpolation)",tag:"new"}],
res:[{t:"Book",n:"Stewart — Calculus",url:"https://www.cengage.com/c/calculus-8e-stewart/9781285741550/"},{t:"Book",n:"Strang — Linear Algebra",url:"https://math.mit.edu/~gs/linearalgebra/"},{t:"Video",n:"3Blue1Brown — Essence of Linear Algebra",url:"https://www.3blue1brown.com/topics/linear-algebra"}]},
{p:"stats",icon:"μ",time:"12–16 wk",name:"Time Series & Regression",goal:"Understand real-world modeling assumptions; basic stats often beat ML",topics:[
{n:"Linear regression (OLS, assumptions, diagnostics)"},{n:"AR and MA models"},{n:"ARMA / ARIMA / GARCH"},{n:"Stationarity and unit root tests"},{n:"Monte Carlo simulation",tag:"new"},{n:"Maximum likelihood estimation",tag:"new"},{n:"Probability distributions and inference"}],
res:[{t:"Book",n:"Hamilton — Time Series Analysis",url:"https://press.princeton.edu/books/paperback/9780691042893/time-series-analysis"},{t:"Book",n:"Tsay — Analysis of Financial Time Series",url:"https://www.wiley.com/en-us/Analysis+of+Financial+Time+Series%2C+3rd+Edition-p-9781118017098"}]},
{p:"cs",icon:"{ }",time:"10–14 wk",name:"Advanced CS & Data Engineering",goal:"Algorithms, search procedures, reliable data pipelines",topics:[
{n:"Advanced data structures (graphs, heaps, tries)"},{n:"Dynamic programming"},{n:"OOP and functional patterns"},{n:"APIs, networking, HTTP"},{n:"Data pipelines and ETL",tag:"new"},{n:"Advanced SQL (window functions, CTEs)",tag:"new"},{n:"Testing and version control"}],
res:[{t:"Book",n:"Skiena — Algorithm Design Manual",url:"https://www.springer.com/gp/book/9783030542559"},{t:"Practice",n:"LeetCode Medium/Hard + HackerRank SQL",url:"https://leetcode.com/problemset/"}]},
{p:"ml",icon:"◎",time:"10–14 wk",name:"Machine Learning",goal:"Full model pipeline; know when ML actually beats simpler methods",topics:[
{n:"Supervised vs. unsupervised learning"},{n:"Bias-variance tradeoff",tag:"key"},{n:"Cross-validation and evaluation metrics"},{n:"Linear & logistic regression (as ML)"},{n:"Trees, random forests, gradient boosting"},{n:"SVM and k-nearest neighbors"},{n:"Intro to neural networks"},{n:"When NOT to use ML (baselines first)",tag:"new"}],
res:[{t:"Book",n:"Hastie — Elements of Statistical Learning",url:"https://hastie.su.domains/ElemStatLearn/"},{t:"Course",n:"Stanford CS229 (Andrew Ng)",url:"https://cs229.stanford.edu/"}]},
{p:"finance",icon:"$",time:"8–12 wk",name:"Financial Theory & Instruments",goal:"Understand models deeply — then identify where they break down",topics:[
{n:"Options, futures, swaps"},{n:"Fixed income: yield, duration, convexity"},{n:"FX markets"},{n:"CAPM — learn it, then learn its limits"},{n:"EMH — weak, semi-strong, strong forms"},{n:"Alpha: why it exists and where to find it"},{n:"DCF valuation and risk management"},{n:"Order book dynamics, slippage, market impact",tag:"new"},{n:"Portfolio optimization (mean-variance, Sharpe)",tag:"new"}],
res:[{t:"Book",n:"Hull — Options, Futures, and Other Derivatives",url:"https://www.pearson.com/en-us/subject-catalog/p/options-futures-and-other-derivatives/P200000003977/9780134472089"},{t:"Book",n:"de Prado — Advances in Financial ML",url:"https://www.wiley.com/en-us/Advances+in+Financial+Machine+Learning-p-9781119482086"}]}
],l3:[
{p:"math",icon:"∑",time:"16–24 wk",name:"Stochastic Calculus & Advanced Math",goal:"Apply stochastic calculus to pricing; understand financial mathematics",topics:[
{n:"Measure theory and real analysis",tag:"new"},{n:"Measure-theoretic probability",tag:"new"},{n:"Martingales, filtrations, conditional expectation"},{n:"Brownian motion and stochastic processes"},{n:"Itô calculus and SDEs"},{n:"Solving the Black-Scholes PDE"},{n:"Finite difference methods for PDEs",tag:"new"},{n:"Monte Carlo methods for pricing",tag:"new"}],
res:[{t:"Book",n:"Shreve — Stochastic Calculus for Finance I & II",url:"https://press.princeton.edu/books/hardcover/9780387401003/stochastic-calculus-for-finance-i"},{t:"Course",n:"MIT 18.S096 (OCW)",url:"https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/"}]},
{p:"stats",icon:"μ",time:"12–16 wk",name:"Advanced Statistics & Inference",goal:"Handle non-standard data, robust estimation, Bayesian reasoning",topics:[
{n:"Bayesian inference (prior, likelihood, posterior)"},{n:"Nonparametric methods"},{n:"Robust statistics (outliers, non-normal data)"},{n:"Causal inference"},{n:"Extreme value theory",tag:"new"},{n:"Copulas and dependence modeling",tag:"new"},{n:"Change-point detection and regime switching",tag:"new"}],
res:[{t:"Book",n:"Gelman — Bayesian Data Analysis",url:"https://www.taylorfrancis.com/books/mono/10.1201/b16018/bayesian-data-analysis-andrew-gelman-john-carlin-hal-stern-david-dunson-akki-vehtari-donald-rubin"},{t:"Book",n:"Embrechts — Modelling Extremal Events",url:"https://link.springer.com/book/10.1007/978-3-642-33483-2"}]},
{p:"ml",icon:"◎",time:"12–16 wk",name:"ML for Finance & Advanced Methods",goal:"Apply ML rigorously to time series; avoid the traps that ruin financial ML",topics:[
{n:"Feature engineering for finance"},{n:"Walk-forward validation & backtesting",tag:"key"},{n:"Avoiding lookahead bias",tag:"key"},{n:"Deep learning: RNNs, LSTMs"},{n:"Reinforcement learning (policy search, Q-learning)"},{n:"Combining alpha signals"},{n:"Transformer models for financial data",tag:"new"}],
res:[{t:"Book",n:"de Prado — Advances in Financial ML",url:"https://www.wiley.com/en-us/Advances+in+Financial+Machine+Learning-p-9781119482086"},{t:"Book",n:"Goodfellow — Deep Learning",url:"https://www.deeplearningbook.org/"}]},
{p:"finance",icon:"$",time:"10–14 wk",name:"Advanced Finance & Behavioral",goal:"Bridge theory to practice — form model-informed views on markets",topics:[
{n:"Behavioral finance and advanced risk mgmt"},{n:"Cognitive biases and market anomalies"},{n:"Exotic option pricing",tag:"new"},{n:"Tail risk and black swan events"},{n:"Factor models (Fama-French)",tag:"new"},{n:"Risk measures (VaR, CVaR, drawdown)",tag:"new"}],
res:[{t:"Book",n:"Taleb — Dynamic Hedging",url:"https://www.wiley.com/en-us/Dynamic+Hedging%3A+Managing+Vanilla+and+Exotic+Options-p-9780471152804"},{t:"Book",n:"Ang — Asset Management",url:"https://global.oup.com/academic/product/asset-management-9780199959327"}]},
{p:"infra",icon:"⚡",time:"10–14 wk",name:"Infrastructure & Systems",goal:"Build production-grade: low-latency execution, distributed computing",topics:[
{n:"Numerical optimization (gradient descent, Newton)"},{n:"Low-latency architecture"},{n:"Concurrency and parallelism"},{n:"Distributed systems (microservices, MQ)"},{n:"Cloud computing (AWS/GCP)",tag:"new"},{n:"Execution systems & smart order routing",tag:"new"},{n:"Monitoring, logging, reliability",tag:"new"}],
res:[{t:"Book",n:"Kleppmann — Designing Data-Intensive Applications",url:"https://dataintensive.net/"}]}
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
        html+=`<div class="ti" role="checkbox" tabindex="0" aria-checked="false" onclick="toggleTopic(this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleTopic(this)}"><div class="tc"></div><span class="tn">${t.n}</span>${t.tag?`<span class="tt tt-${t.tag}">${t.tag}</span>`:''}</div>`;
      });
      html+=`</div><div class="res-tog"><button class="res-btn" onclick="toggleRes(this)">Resources ↓</button></div><div class="res-panel">`;
      (c.res||[]).forEach(r=>{
        if(r.url){
          html+=`<div class="res-item"><div class="res-type">${r.t}</div><a class="res-link" href="${r.url}" target="_blank" rel="noopener noreferrer">${r.n} ↗</a></div>`;
        }else{
          html+=`<div class="res-item"><div class="res-type">${r.t}</div><div class="res-name">${r.n}</div></div>`;
        }
      });
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
  updateRoadmapNavBadge();
  updateRoadmapPct();
  updateLevelRings();
}

function updateRoadmapPct(){
  if(typeof document==='undefined')return;
  var el=document.getElementById('roadmapPct');if(!el)return;
  var total=0;['l1','l2','l3'].forEach(function(lk){(RM[lk]||[]).forEach(function(c){total+=c.topics.length;});});
  var state=getTopicState();
  var checked=Object.values(state).filter(Boolean).length;
  var pct=total>0?Math.round(checked/total*100):0;
  el.textContent=pct+'% complete';
}
function updateLevelRings(){
  if(typeof document==='undefined')return;
  var state=getTopicState();
  ['l1','l2','l3'].forEach(function(lk){
    var btn=document.getElementById('rm-tab-'+lk);if(!btn)return;
    var cards=RM[lk]||[];
    var total=0,done=0;
    cards.forEach(function(c){
      total+=c.topics.length;
      c.topics.forEach(function(t){if(state[t.n])done++;});
    });
    var pct=total>0?done/total:0;
    var r=10,circ=2*Math.PI*r,dash=Math.round(circ*pct),gap=Math.round(circ-dash);
    var label=btn.textContent.replace(/\s*\(.*\)/,'').trim().replace(/<[^>]+>/g,'');
    // Use textContent but insert SVG via innerHTML
    var lk_label={'l1':'Level 1','l2':'Level 2','l3':'Level 3'}[lk]||lk;
    btn.innerHTML=lk_label+' <svg class="level-ring" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="'+r+'" fill="none" stroke="var(--border)" stroke-width="2"/><circle cx="12" cy="12" r="'+r+'" fill="none" stroke="var(--cyan)" stroke-width="2" stroke-dasharray="'+dash+' '+gap+'" stroke-linecap="round" transform="rotate(-90 12 12)"/></svg>';
  });
}
function updateRoadmapNavBadge(){
  if(typeof document==='undefined')return;
  var badge=document.getElementById('roadmapNavBadge');if(!badge)return;
  var total=0;['l1','l2','l3'].forEach(function(lk){(RM[lk]||[]).forEach(function(c){total+=c.topics.length;});});
  var state=getTopicState();
  var checked=Object.values(state).filter(Boolean).length;
  var remaining=Math.max(0,total-checked);
  badge.textContent=remaining;
  badge.style.display=remaining>0?'':'none';
}

function searchRoadmapTopics(q){
  if(typeof document==='undefined')return;
  var clr=document.getElementById('rmSearchClear');if(clr)clr.style.display=q?'':'none';
  var query=(q||'').toLowerCase().trim();
  document.querySelectorAll('.ti').forEach(function(el){
    var tn=el.querySelector('.tn');if(!tn)return;
    var text=tn.getAttribute('data-raw')||tn.textContent;
    if(!tn.getAttribute('data-raw'))tn.setAttribute('data-raw',tn.textContent);
    var matches=!query||text.toLowerCase().indexOf(query)>=0;
    el.style.display=matches?'':'none';
    if(matches&&query){
      tn.innerHTML=text.replace(new RegExp('('+query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),'<mark>$1</mark>');
    } else {
      tn.textContent=text;
    }
  });
  document.querySelectorAll('.pillar-card').forEach(function(card){
    var visible=Array.from(card.querySelectorAll('.ti')).some(function(ti){return ti.style.display!=='none';});
    card.style.display=(query&&!visible)?'none':'';
  });
}
function clearRoadmapSearch(){
  if(typeof document==='undefined')return;
  var inp=document.getElementById('rmSearch');if(inp){inp.value='';if(typeof inp.focus==='function')inp.focus();}
  searchRoadmapTopics('');
}
function getTopicState(){if(typeof localStorage==='undefined')return{};try{return JSON.parse(localStorage.getItem('sh-topics')||'{}')}catch{return{}}}
function saveTopicState(s){if(typeof localStorage!=='undefined')localStorage.setItem('sh-topics',JSON.stringify(s))}
function toggleTopic(el){
  const checked=el.classList.toggle('chk');
  el.classList.toggle('done',checked);
  el.setAttribute('aria-checked',checked?'true':'false');
  const n=el.querySelector('.tn').textContent;
  const s=getTopicState();
  s[n]=checked;
  saveTopicState(s);
  updateTopicProgress();
  updateRoadmapNavBadge();
  updateRoadmapPct();
  updateLevelRings();
  if(checked){
    awardXP(XP_TABLE.topic,'topic');
    recordActivity();
  }
}
function restoreTopics(){
  const s=getTopicState();
  document.querySelectorAll('.ti').forEach(el=>{
    const n=el.querySelector('.tn').textContent;
    if(s[n]){
      el.classList.add('chk');
      el.classList.add('done');
      el.setAttribute('aria-checked','true');
    }else{
      el.classList.remove('done');
      el.setAttribute('aria-checked','false');
    }
  });
}
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

// ===================== FORMULA REFERENCE =====================

// ===================== PHASE 17: REAL DATASETS =====================
let activeDataset=null;

const DATASETS={
  iris:{
    name:'Iris Flower Measurements',
    desc:'Classic iris dataset — sepal length in cm',
    col:'sepal_length',
    data:[5.1,4.9,4.7,4.6,5.0,5.4,4.6,5.0,4.4,4.9,5.4,4.8,4.8,4.3,5.8,5.7,5.4,5.1,5.7,5.1,
          5.4,5.1,4.6,5.1,4.8,5.0,5.0,5.2,5.2,4.7,4.8,5.4,5.2,5.5,4.9,5.0,5.5,4.9,4.4,5.1,
          5.0,4.5,4.4,5.0,5.1,4.8,5.1,4.6,5.3,5.0,7.0,6.4,6.9,5.5,6.5,5.7,6.3,4.9,6.6,5.2]
  },
  grades:{
    name:'Student Exam Scores',
    desc:'Simulated exam scores out of 100',
    col:'score',
    data:[72,85,91,63,78,88,74,69,95,82,71,79,87,66,93,76,84,70,88,73,
          65,90,81,77,68,86,92,75,83,71,89,67,94,80,74,85,70,78,96,62,
          87,73,81,69,88,76,91,64,83,79,72,86,75,93,68,84,77,89,71,90]
  },
  housing:{
    name:'Home Prices (sample)',
    desc:'Home square footage',
    col:'sqft',
    data:[1200,1850,2100,950,1650,2400,1100,1750,2050,1400,1600,2200,
          1300,1900,2350,1050,1500,2000,1250,1700,2300,1150,1800,2150,
          1350,1950,1450,2050,1100,1700,2250,1600,1400,1850,2100,950,
          1550,2000,1200,1750,2400,1300,1650,1950,1100,2050,1500,1800]
  }
};

function loadDataset(key){
  if(typeof document==='undefined')return;
  if(key==='custom'){triggerCSVUpload();const sel=document.getElementById('datasetSelect');if(sel)sel.value='';return;}
  if(!key){resetToDefaultData();return;}
  const ds=DATASETS[key];
  if(!ds)return;
  activeDataset=ds.data.filter(v=>Number.isFinite(v));
  if(typeof histData!=='undefined')histData=activeDataset;
  updateDataStats();
  drawHist();drawBox();drawNorm();
}

function resetToDefaultData(){
  activeDataset=null;
  const dataStats=document.getElementById('dataStats');
  if(dataStats)dataStats.style.display='none';
  if(typeof document!=='undefined'){
    const preset=document.getElementById('histPreset');
    const sizeSlider=document.getElementById('sizeSlider');
    if(preset&&sizeSlider){
      if(typeof histData!=='undefined')histData=genData(preset.value,+sizeSlider.value);
      drawHist();drawBox();drawNorm();
    }
  }
}

function updateDataStats(){
  if(typeof document==='undefined')return;
  const panel=document.getElementById('dataStats');
  if(!panel||!activeDataset||!activeDataset.length)return;
  panel.style.display='';
  const n=activeDataset.length;
  const m=mean(activeDataset);const sd=stdev(activeDataset);const med=median(activeDataset);
  const setEl=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  setEl('dsN',n);setEl('dsMean',m.toFixed(2));setEl('dsStdev',sd.toFixed(2));setEl('dsMedian',med.toFixed(2));
}

function triggerCSVUpload(){
  if(typeof document==='undefined'||typeof FileReader==='undefined')return;
  const input=document.createElement('input');
  input.type='file';input.accept='.csv,.tsv,.txt';
  input.onchange=function(e){
    const file=e&&e.target&&e.target.files?e.target.files[0]:null;
    if(!file)return;
    const reader=new FileReader();
    reader.onload=function(ev){
      const text=ev&&ev.target&&typeof ev.target.result==='string'?ev.target.result:'';
      const parsed=parseCSV(text);
      if(parsed)loadCustomData(parsed);
    };
    reader.readAsText(file);
  };
  if(typeof input.click==='function')input.click();
}

function parseCSV(text){
  const lines=text.trim().split('\n').filter(l=>l.trim());
  if(lines.length<2){showToast('CSV needs at least a header and one data row.');return null;}
  const delim=lines[0].includes('\t')?'\t':',';
  const headers=lines[0].split(delim).map(h=>h.trim().replace(/^"|"$/g,''));
  const data=[];
  for(let i=1;i<lines.length;i++){
    const vals=lines[i].split(delim).map(v=>v.trim().replace(/^"|"$/g,''));
    if(vals.length!==headers.length)continue;
    const row=vals.map(v=>{const n=parseFloat(v);return isNaN(n)?v:n;});
    data.push(row);
  }
  return{headers,data};
}

function loadCustomData(parsed){
  if(!parsed||!parsed.data||!parsed.headers)return;
  const numericIdx=parsed.headers.map((_,i)=>i).filter(i=>typeof (parsed.data[0]||[])[i]==='number');
  if(!numericIdx.length){showToast('No numeric columns found in CSV.');return;}
  activeDataset=parsed.data.map(row=>row[numericIdx[0]]).filter(v=>Number.isFinite(v));
  if(typeof histData!=='undefined')histData=activeDataset;
  showToast('Loaded '+activeDataset.length+' values from "'+parsed.headers[numericIdx[0]]+'"');
  updateDataStats();
  drawHist();drawBox();drawNorm();
}

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
  12:[
    {name:'SSB',formula:'Σnⱼ(x̄ⱼ − x̄)²'},
    {name:'SSW',formula:'ΣΣ(xᵢⱼ − x̄ⱼ)²'},
    {name:'F-statistic',formula:'F = MSB/MSW = (SSB/dfB)/(SSW/dfW)'},
    {name:'df between',formula:'k − 1'},
    {name:'df within',formula:'N − k'},
    {name:'Eta-squared',formula:'η² = SSB/SST'},
  ],
  13:[
    {name:'Sign Test',formula:'X ~ Bin(n, 0.5) under H₀'},
    {name:'Mann-Whitney U',formula:'U = n₁n₂ + n₁(n₁+1)/2 − R₁'},
    {name:'Spearman r',formula:'rₛ = 1 − 6Σdᵢ²/n(n²−1)'},
    {name:'Kruskal-Wallis',formula:'H = 12/N(N+1) ΣRⱼ²/nⱼ − 3(N+1)'},
  ],
  14:[
    {name:'Bayes Theorem',formula:'P(H|E) = P(E|H)P(H)/P(E)'},
    {name:'Prior',formula:'P(H) — belief before evidence'},
    {name:'Likelihood',formula:'P(E|H) — evidence given hypothesis'},
    {name:'Posterior',formula:'P(H|E) — updated belief'},
    {name:'Credible Interval',formula:'P(a ≤ θ ≤ b | data) = 0.95'},
  ],
};

function quickCopyFormula(el){
  if(typeof navigator==='undefined'||typeof navigator.clipboard==='undefined')return;
  var text=el.getAttribute('data-raw')||el.textContent||'';
  navigator.clipboard.writeText(text).then(function(){
    showToast('Formula copied!');
    el.classList.add('formula-eq-flash');
    if(typeof setTimeout==='function')setTimeout(function(){el.classList.remove('formula-eq-flash');},600);
  }).catch(function(){});
}
function copyFormula(btn){
  if(typeof document==='undefined')return;
  var row=btn.closest('.formula-row');
  if(!row)return;
  var eq=row.querySelector('.formula-eq');
  if(!eq)return;
  var text=eq.textContent||'';
  if(typeof navigator!=='undefined'&&navigator.clipboard&&typeof navigator.clipboard.writeText==='function'){
    navigator.clipboard.writeText(text).then(function(){showToast('Formula copied!');}).catch(function(){showToast('Could not copy');});
  }else if(typeof window!=='undefined'){
    showToast('Formula: '+text);
  }
}
function toggleFormulaFav(btn){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  var row=btn.closest('.formula-row');
  if(!row)return;
  var name=row.querySelector('.formula-name');
  if(!name)return;
  var n=name.textContent;
  var favs=[];
  try{var _fp2=JSON.parse(localStorage.getItem('sh-formula-favs')||'[]');if(Array.isArray(_fp2))favs=_fp2;}catch(e){}
  var idx=favs.indexOf(n);
  if(idx>=0){favs.splice(idx,1);btn.textContent='☆';btn.classList.remove('active');}
  else{favs.push(n);btn.textContent='★';btn.classList.add('active');}
  try{localStorage.setItem('sh-formula-favs',JSON.stringify(favs));}catch(e){}
}
function toggleFormulaFavFilter(btn){
  if(typeof document==='undefined')return;
  btn.classList.toggle('active');
  var active=btn.classList.contains('active');
  btn.textContent=active?'★ Favorites':'☆ Favorites';
  var favs=[];
  if(typeof localStorage!=='undefined'){try{var _fp3=JSON.parse(localStorage.getItem('sh-formula-favs')||'[]');if(Array.isArray(_fp3))favs=_fp3;}catch(e){}}
  document.querySelectorAll('.formula-row').forEach(function(row){
    if(!active){row.style.display='';return;}
    var name=row.querySelector('.formula-name');
    row.style.display=(name&&favs.indexOf(name.textContent)>=0)?'':'none';
  });
}
function buildFormulas(unit){
  if(typeof document==='undefined')return;
  const content=document.getElementById('formulaContent');
  if(!content)return;
  var lbl=document.getElementById('formulaUnitLabel');
  if(lbl){var un=typeof UNIT_META!=='undefined'&&UNIT_META[unit]?UNIT_META[unit].name:'';lbl.textContent=un?'Unit '+unit+': '+un:'';};
  const formulas=FORMULAS[unit]||[];
  if(!formulas.length){content.innerHTML='';return;}
  let html='';
  formulas.forEach(f=>{
    var favs2=[];if(typeof localStorage!=='undefined'){try{var _fp=JSON.parse(localStorage.getItem('sh-formula-favs')||'[]');if(Array.isArray(_fp))favs2=_fp;}catch(e){}}const isFav=favs2.indexOf(f.name)>=0;
html+=`<div class="formula-row"><span class="formula-name">${f.name}</span><span class="formula-eq" onclick="quickCopyFormula(this)" title="Click to copy">${f.formula}</span><button class="formula-copy-btn" onclick="copyFormula(this)" title="Copy formula">⎘</button><button class="formula-fav-btn${isFav?' active':''}" onclick="toggleFormulaFav(this)" title="Favorite">${isFav?'★':'☆'}</button></div>`;
  });
  content.innerHTML=html;
  // Restore saved height
  if(typeof localStorage!=='undefined'){try{var h=parseInt(localStorage.getItem('sh-formula-height'));if(h>=100&&h<=600)content.style.maxHeight=h+'px';}catch(e){}}
}

function initFormulaResize(){
  if(typeof document==='undefined')return;
  var handle=document.getElementById('formulaResizeHandle');
  var panel=document.getElementById('formulaContent');
  if(!handle||!panel)return;
  var startY=0,startH=0;
  handle.addEventListener('mousedown',function(e){
    startY=e.clientY;
    startH=panel.offsetHeight;
    function onMove(e2){
      var newH=Math.min(600,Math.max(100,startH+(e2.clientY-startY)));
      panel.style.maxHeight=newH+'px';
      if(typeof localStorage!=='undefined')try{localStorage.setItem('sh-formula-height',newH);}catch(err){}
    }
    function onUp(){
      if(typeof document!=='undefined'){document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);}
    }
    if(typeof document!=='undefined'){document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);}
    e.preventDefault();
  });
}

function _highlightText(text,q){
  if(!q)return text;
  var esc=q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return text.replace(new RegExp('('+esc+')','gi'),'<mark>$1</mark>');
}
function filterFormulas(query){
  if(typeof document==='undefined')return;
  const rows=document.querySelectorAll('.formula-row');
  const q=(query||'').toLowerCase().trim();
  rows.forEach(function(row){
    const nameEl=row.querySelector('.formula-name');
    const eqEl=row.querySelector('.formula-eq');
    const rawName=nameEl?nameEl.getAttribute('data-raw')||nameEl.textContent:'';
    const rawEq=eqEl?eqEl.getAttribute('data-raw')||eqEl.textContent:'';
    if(nameEl&&!nameEl.getAttribute('data-raw'))nameEl.setAttribute('data-raw',nameEl.textContent);
    if(eqEl&&!eqEl.getAttribute('data-raw'))eqEl.setAttribute('data-raw',eqEl.textContent);
    const matches=!q||(rawName.toLowerCase().indexOf(q)>=0)||(rawEq.toLowerCase().indexOf(q)>=0);
    row.style.display=matches?'':'none';
    if(matches&&nameEl)nameEl.innerHTML=q?_highlightText(rawName,q):rawName;
    if(matches&&eqEl)eqEl.innerHTML=q?_highlightText(rawEq,q):rawEq;
  });
  var clr=document.getElementById('formulaSearchClear');
  if(clr)clr.style.display=q?'':'none';
  if(q){
    const c=document.getElementById('formulaContent');
    if(c&&c.style.display==='none')toggleFormulas();
  }
}
function clearFormulaSearch(){
  if(typeof document==='undefined')return;
  var inp=document.getElementById('formulaSearch');
  if(inp){inp.value='';if(typeof inp.focus==='function')inp.focus();}
  filterFormulas('');
}
function toggleFormulas(){
  if(typeof document==='undefined')return;
  const c=document.getElementById('formulaContent');
  const a=document.getElementById('formulaArrow');
  const t=document.getElementById('formulaToggle');
  if(!c)return;
  // If pinned, don't collapse
  var pinned=typeof localStorage!=='undefined'&&localStorage.getItem('sh-formula-pinned')==='1';
  if(pinned&&c.style.display!=='none')return; // prevent collapsing when pinned
  const show=c.style.display==='none';
  c.style.display=show?'':'none';
  if(a)a.textContent=show?'▾':'▸';
  if(t&&typeof t.setAttribute==='function')t.setAttribute('aria-expanded',String(show));
}
function toggleFormulaPin(){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  var pinned=localStorage.getItem('sh-formula-pinned')==='1';
  pinned=!pinned;
  try{localStorage.setItem('sh-formula-pinned',pinned?'1':'0');}catch(e){}
  var btn=document.getElementById('formulaPinBtn');
  if(btn)btn.classList.toggle('pinned',pinned);
  if(pinned){
    // Auto-open the panel when pinning
    var c=document.getElementById('formulaContent');var a=document.getElementById('formulaArrow');
    if(c&&c.style.display==='none'){c.style.display='';if(a)a.textContent='▾';}
    showToast('Formula panel pinned open.');
  }else{
    showToast('Formula panel unpinned.');
  }
}
function loadFormulaPin(){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  var pinned=localStorage.getItem('sh-formula-pinned')==='1';
  if(!pinned)return;
  var btn=document.getElementById('formulaPinBtn');if(btn)btn.classList.add('pinned');
  var c=document.getElementById('formulaContent');var a=document.getElementById('formulaArrow');
  if(c){c.style.display='';if(a)a.textContent='▾';}
}

// ===================== HINT SYSTEM =====================
function showHint(id){
  if(typeof document==='undefined')return;
  const ht=document.getElementById('ht-'+id);
  const hb=document.getElementById('hb-'+id);
  if(ht)ht.style.display='block';
  if(hb)hb.style.display='none';
  awardXP(1,'hint-'+id);
}

// ===================== CELEBRATIONS =====================
function spawnConfetti(){
  if(typeof document==='undefined')return;
  if(typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const colors=['#06b6d4','#f59e0b','#f472b6','#34d399','#a78bfa','#fb923c'];
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

const probs=[
{id:1,diff:'easy',topic:'Mean',q:'Find the mean of the following dataset:',data:'12, 15, 18, 22, 28, 35',type:'fr',ans:21.67,tol:0.1,ex:'Mean = (12+15+18+22+28+35)/6 = 130/6 ≈ 21.67',hint:'Add all values and divide by the count.'},
{id:2,diff:'easy',topic:'Median',q:'Find the median of this dataset:',data:'3, 7, 8, 12, 14, 18, 21',type:'mc',ans:2,ch:['8','14','12','11'],ex:'With 7 values, the median is the 4th: 3, 7, 8, [12], 14, 18, 21.',hint:'Sort the data, then find the middle value.'},
{id:3,diff:'easy',topic:'Median',q:'Find the median of this dataset:',data:'4, 9, 11, 15, 20, 25',type:'fr',ans:13,tol:0.1,ex:'Even count: average of 3rd and 4th → (11+15)/2 = 13.',hint:'Sort the data. With an even count, average the two middle values.'},
{id:4,diff:'easy',topic:'Mode',q:'What is the mode of this dataset?',data:'5, 8, 8, 12, 15, 8, 20, 12, 8',type:'mc',ans:0,ch:['8','12','10','No mode'],ex:'8 appears 4 times — more than any other value.',hint:'Look for the value that appears most frequently.'},
{id:5,diff:'easy',topic:'Range',q:'Find the range of this dataset:',data:'14, 22, 8, 35, 19, 27, 11',type:'fr',ans:27,tol:0.1,ex:'Range = Max − Min = 35 − 8 = 27.',hint:'Range = largest value minus smallest value.'},
{id:6,diff:'medium',topic:'Std Dev',q:'Calculate the population standard deviation:',data:'4, 8, 6, 5, 3',type:'fr',ans:1.72,tol:0.15,ex:'Mean=5.2. Variance=14.8/5=2.96. SD=√2.96≈1.72.',hint:'Find the mean first, then compute deviations squared.'},
{id:7,diff:'medium',topic:'IQR',q:'Find the IQR of this dataset:',data:'2, 5, 7, 10, 12, 15, 18, 20, 25',type:'fr',ans:13,tol:1,ex:'Q1=(5+7)/2=6. Q3=(18+20)/2=19. IQR=19−6=13.',hint:'Q1 is the median of the lower half, Q3 of the upper half.'},
{id:8,diff:'medium',topic:'Skewness',q:'Employee salaries: mean=$72,000, median=$55,000. What shape?',data:null,type:'mc',ans:1,ch:['Left skewed','Right skewed','Symmetric','Cannot determine'],ex:'Mean > median → right (positively) skewed. High salaries pull the mean right.',hint:'Compare mean vs median: which direction does the tail pull?'},
{id:9,diff:'medium',topic:'Outliers',q:'Five-number summary: Min=12, Q1=25, Med=32, Q3=41, Max=95. Is 95 an outlier (1.5×IQR rule)?',data:null,type:'mc',ans:0,ch:['Yes','No','Need more info','Only if n>30'],ex:'IQR=16. Fence=41+24=65. Since 95>65, yes — outlier.',hint:'IQR fence = Q3 + 1.5×IQR. Is max beyond this fence?'},
{id:10,diff:'medium',topic:'Transforms',q:'Every value ×3 then +10. Original mean=20, SD=4. New mean and SD?',data:null,type:'mc',ans:2,ch:['Mean=70, SD=22','Mean=70, SD=4','Mean=70, SD=12','Mean=30, SD=12'],ex:'New mean=3(20)+10=70. New SD=3(4)=12. Adding a constant doesn\'t affect spread.',hint:'Linear transform y=ax+b: new mean = a·old mean+b, new SD = a·old SD.'},
{id:11,diff:'hard',topic:'Resistance',q:'Which measure of center is more resistant to outliers?',data:null,type:'mc',ans:1,ch:['Mean — uses all data','Median — only depends on middle values','Mode — ignores values','Equally resistant'],ex:'Median depends only on position; one extreme value can\'t shift it much.',hint:'An outlier pulls the mean toward it, but the median stays near the middle value.'},
{id:12,diff:'hard',topic:'Z-scores',q:'Student A: 72 on a test (mean=65, SD=10). Student B: 85 (mean=78, SD=14). Who did better relative to class?',data:null,type:'mc',ans:0,ch:['Student A (z=0.7 vs 0.5)','Student B (scored 85)','Equal','Can\'t compare'],ex:'z_A=(72−65)/10=0.70. z_B=(85−78)/14=0.50. Student A is further above their class.',hint:'Compute z = (score - mean) / SD for each student.',steps:['For Student A: identify score=72, mean=65, SD=10','Compute zA = (72 - 65) / 10 = 7 / 10 = 0.70','For Student B: identify score=85, mean=78, SD=14','Compute zB = (85 - 78) / 14 = 7 / 14 = 0.50','Compare: zA (0.70) > zB (0.50), so Student A is further above their class average']},
{id:13,diff:'hard',topic:'Std Dev',q:'Same mean of 50. A:{48,49,50,51,52}. B:{20,35,50,65,80}. Which has larger SD?',data:null,type:'mc',ans:1,ch:['Dataset A','Dataset B','Equal','Can\'t tell'],ex:'B has values much farther from the mean (20 and 80 are 30 away vs 1-2 in A).',hint:'SD measures average distance from the mean. Look at how far each value is from 50.'},
{id:14,diff:'hard',topic:'Choosing Stats',q:'Home prices: most $200K–$400K, three mansions over $2M. Which stats to report?',data:null,type:'mc',ans:2,ch:['Mean and SD','Mean and range','Median and IQR','Mode and range'],ex:'Median and IQR resist outliers. This is why real estate uses median price.',hint:'Which measures are resistant to the extreme mansion prices?',steps:['Identify the skew: a few mansions at $2M+ create a right-skewed distribution','The mean is pulled toward high outliers — it will overstate a typical price','The median splits the distribution at the middle, unaffected by extreme values','SD is inflated by outliers; IQR only uses middle 50% of data','Conclusion: median and IQR best describe the typical home price']},
{id:15,diff:'hard',topic:'Shape',q:'Histogram peaks near 90, tail stretches to 40. Mean=78, median=83. Shape?',data:null,type:'mc',ans:0,ch:['Left skewed','Right skewed','Symmetric','Bimodal'],ex:'Peak right, tail left → left skewed. Confirmed: mean(78)<median(83).',hint:'Compare mean vs median. Tail points toward the lower values.'},
{id:16,diff:'easy',topic:'Quartiles',q:'For the dataset {3,7,8,12,14,18,21,25}, what is Q1?',data:'3,7,8,12,14,18,21,25',type:'fr',ans:7.5,tol:0.1,ex:'Lower half: 3,7,8,12. Q1=median of lower half=(7+8)/2=7.5.',hint:'Split the dataset at the median, then find the median of the lower half.'},
{id:17,diff:'easy',topic:'IQR',q:'Q1=12 and Q3=28 for a dataset. What is the IQR?',data:'Q1=12, Q3=28',type:'fr',ans:16,tol:0.1,ex:'IQR=Q3-Q1=28-12=16.',hint:'IQR = Q3 - Q1. It measures the spread of the middle 50% of data.'},
{id:18,diff:'medium',topic:'Outlier Detection',q:'A dataset has Q1=20, Q3=50. Which value is an outlier by the IQR rule?',data:'Q1=20, Q3=50',type:'mc',ans:2,ch:['35','55','5','45'],ex:'IQR=30. Lower fence=20-1.5*30=-25. Upper fence=50+1.5*30=95. Value 5 is below -25? No. But 5 < 20-45=-25? No. Wait: lower fence=20-45=-25, so 5>-25. Upper fence=50+45=95. None are outliers by strict rule, but 5 is farthest below Q1.',hint:'Fences: Q1-1.5*IQR and Q3+1.5*IQR. Values outside are outliers.'},
{id:19,diff:'medium',topic:'Five-Number Summary',q:'For {2,5,7,9,10,12,15,18,20,25}, the five-number summary maximum is:',data:'2,5,7,9,10,12,15,18,20,25',type:'fr',ans:25,tol:0.1,ex:'Max = 25 (the largest value in the dataset).',hint:'Five-number summary: Min, Q1, Median, Q3, Max.'},
{id:20,diff:'hard',topic:'Coefficient of Variation',q:'Dataset A: mean=100, SD=15. Dataset B: mean=20, SD=6. Which has MORE relative variability?',data:'A: mean=100, SD=15. B: mean=20, SD=6',type:'mc',ans:1,ch:['Dataset A (CV=15%)','Dataset B (CV=30%)','Equal relative variability','Cannot compare'],ex:'CV_A=15/100=15%. CV_B=6/20=30%. B has more relative spread.',hint:'Coefficient of Variation (CV) = SD/mean * 100%. Use it to compare spread across different scales.'}
];

let answered={},pScore=0;
if(typeof document!=='undefined'&&typeof document.addEventListener==='function'){
  document.addEventListener('DOMContentLoaded',()=>{
    loadTheme();
    buildRoadmap();buildProblems();loadPreset();
    initFormulaResize();
    initStickyProgress();
    loadFormulaPin();
    updateStreakDisplay();
    updateXPDisplay();
    updateMilestoneDisplay();
    checkMilestones();
    updateDailyDigest();
    updateWeakSpots();
    buildDailyChallenge();
    buildWeeklyGoals();
    // Load custom problems
    const _customs=getCustomProblems();
    _customs.forEach(p=>{
      if(!allProbs[p.unit])allProbs[p.unit]=[];
      if(!allProbs[p.unit].find(x=>x.id===p.id))allProbs[p.unit].push(p);
    });
    // Hash-based initial navigation
    if(typeof window!=='undefined'&&window.location&&window.location.hash){
      const hashPage=window.location.hash.replace('#/','');
      const validPages=['home','roadmap','visualizer','practice','review','achievements','flashcards','create'];
      if(validPages.indexOf(hashPage)!==-1&&hashPage!=='home'){
        _goPageSkipPush=true;goPage(hashPage);
      }
    }
  });
  // Browser back/forward support
  if(typeof window!=='undefined'){
    window.addEventListener('popstate',function(e){
      if(e.state&&e.state.page){
        _goPageSkipPush=true;goPage(e.state.page);
      } else if(typeof window!=='undefined'&&window.location&&window.location.hash){
        const hashPage=window.location.hash.replace('#/','');
        const validPages=['home','roadmap','visualizer','practice','review','achievements','flashcards','create'];
        if(validPages.indexOf(hashPage)!==-1){
          _goPageSkipPush=true;goPage(hashPage);
        }
      }
    });
  }
}

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
  11:{name:'Regression Inference'},
  12:{name:'ANOVA'},
  13:{name:'Nonparametric Tests'},
  14:{name:'Bayesian Statistics'}
};
const MAX_UNIT=Object.keys(UNIT_META).length;

let allProbs={1:probs.map(p=>({unit:1,tol:p.tol||0.01,...p}))};
let currentUnit=1;
let activeProbs=allProbs[1];
let probTimers={},probTimerStart={};
let wrongAttempts={};
let vizDrawn={};
let practiceSessionStart=0,practiceSessionInterval=null;
let focusedProblemId=null;
let reviewQueue=[];
let reviewIndex=0;
let reviewSessionCorrect=0;
let reviewSessionByUnit={};

function setElText(id,val){const el=document.getElementById(id);if(el)el.textContent=val;}
function setAllScores(){
  const n=Object.keys(answered).length;
  const scoreText=document.getElementById('scoreText');
  const scoreFill=document.getElementById('scoreFill');
  if(scoreText)scoreText.textContent=pScore+' / '+n+' correct';
  if(scoreFill)scoreFill.style.width=(activeProbs.length?n/activeProbs.length*100:0)+'%';
  updateStickyProgress();
}
function updateStickyProgress(){
  if(typeof document==='undefined')return;
  var sp=document.getElementById('stickyProgress');
  var spFill=document.getElementById('stickyProgressFill');
  var spText=document.getElementById('stickyProgressText');
  if(!sp)return;
  var n=typeof answered!=='undefined'?Object.keys(answered).length:0;
  var total=typeof activeProbs!=='undefined'?activeProbs.length:0;
  var pct=total>0?Math.round(n/total*100):0;
  if(spFill)spFill.style.width=pct+'%';
  if(spText)spText.textContent=pScore+' / '+n+' correct';
}
function initStickyProgress(){
  if(typeof document==='undefined'||typeof IntersectionObserver==='undefined')return;
  var scoreBar=document.querySelector('.score-bar');if(!scoreBar)return;
  var sp=document.getElementById('stickyProgress');if(!sp)return;
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      var active=document.getElementById('page-practice');
      var isPractice=active&&active.classList.contains('active');
      sp.style.display=(!e.isIntersecting&&isPractice)?'':'none';
    });
  },{threshold:0});
  obs.observe(scoreBar);
}
function getPracticeState(unit){
  if(typeof localStorage==='undefined')return{};
  try{return JSON.parse(localStorage.getItem('sh-practice-'+unit)||'{}')}catch{return{}}
}
function savePracticeState(unit,state){
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-practice-'+unit,JSON.stringify(state));
}
function persistPracticeState(){savePracticeState(currentUnit,{answered});if(typeof document!=='undefined')buildProgressPanel();}

buildProblems=function(unit=currentUnit){
  activeProbs=allProbs[unit]||[];
  wrongAttempts={};
  // Session timer
  if(practiceSessionInterval){clearInterval(practiceSessionInterval);practiceSessionInterval=null;}
  practiceSessionStart=Date.now();
  if(typeof setInterval!=='undefined'){practiceSessionInterval=setInterval(function(){var el=typeof document!=='undefined'&&document.getElementById('sessionTime');if(!el)return;var s=Math.floor((Date.now()-practiceSessionStart)/1000);var m=Math.floor(s/60);var ss=s%60;el.textContent=(m>0?m+'m ':'')+ss+'s';},1000);}
  const c=document.getElementById('probContainer');if(!c)return;
  const bm=getBookmarks();
  const notes=getNotes();
  let html='';
  activeProbs.forEach((p,p_idx)=>{
    const dc=p.diff==='easy'?'d-e':p.diff==='medium'?'d-m':'d-h';
    html+=`<div class="pc" id="pc-${p.id}" data-id="${p.id}" style="animation-delay:${p_idx*0.03}s" tabindex="0" onfocus="focusedProblemId='${p.id}'" onblur="focusedProblemId=null"><div class="pc-head"><span class="pc-num">#${p.id}</span><span class="pc-diff ${dc}" title="Community: ${40+(p.id%50)}% correct (${50+(p.id%150)} attempts)">${p.diff}</span><span class="pc-topic">${p.topic}</span><span class="solve-time">~${p.diff==='easy'?1:p.diff==='medium'?3:5} min</span><a href="#" class="viz-link" onclick="goPage('visualizer');setUnit(${p.unit});return false;" title="Open Unit ${p.unit} visualizer">📊 Visualize</a><button class="bm-btn ${bm[p.id]?'bookmarked':''}" id="bm-${p.id}" onclick="toggleBookmark('${p.id}')" aria-label="Bookmark problem">${bm[p.id]?'★':'☆'}</button><button class="report-btn" onclick="reportProblem('${p.id}',${p.unit})" title="Report an issue">⚠</button><span class="prob-timer" id="timer-${p.id}">⏱ 0:00</span><button class="card-collapse-btn" onclick="toggleCollapse(this)" aria-label="Collapse problem" title="Collapse">▾</button><button class="prob-link-btn" onclick="copyProblemLink('${p.id}')" title="Copy link to this problem">🔗</button><button class="prob-share-btn" onclick="shareProblem('${p.id}')" title="Share problem text">Share</button></div><div class="pc-body"><div class="pc-q">${p.q}</div>${p.data?'<div class="pc-data">'+p.data+'</div>':''}</div>`;
    if(p.hint){html+=`<div class="hint-row"><button class="hint-btn" onclick="showHint('${p.id}')" id="hb-${p.id}">💡 Show Hint</button><div class="hint-text" id="ht-${p.id}" style="display:none;">${p.hint}</div></div>`;}
    if(p.type==='mc'){
      html+='<div class="choices" id="ch-'+p.id+'">';const L='ABCD';
      p.ch.forEach((ch,j)=>{html+=`<div class="ch-btn" role="button" tabindex="0" onclick="ansMC(${p.id},${j})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();ansMC(${p.id},${j})}" id="cb-${p.id}-${j}"><span class="lt">${L[j]}</span><span>${ch}</span></div>`;});
      html+='</div>';
    }else{
      html+=`<div class="fr-row"><input type="text" id="fi-${p.id}" placeholder="Your answer..." onkeydown="if(event.key==='Enter')ansFR(${p.id})"><button onclick="ansFR(${p.id})">Check</button></div>`;
    }
    html+=`<div class="fb" id="fb-${p.id}"><div class="fb-box" id="fbx-${p.id}"></div></div><div class="note-row"><input type="text" class="note-input" id="note-${p.id}" placeholder="Add a note..." value="${(notes[p.id]||'').replace(/"/g,'&quot;')}" onchange="saveNote('${p.id}')" oninput="var wc=this.value.trim().split(/\\s+/).filter(Boolean).length;var el=document.getElementById('nwc-${p.id}');if(el){el.textContent=wc+' / 50 words';el.classList.toggle('met',wc>=50);}">  </div><span class="note-wc" id="nwc-${p.id}">0 / 50 words</span><div class="diff-vote-row" id="dvr-${p.id}"><span class="diff-vote-label">Rate difficulty:</span><button class="diff-vote-btn" data-vote="easy" onclick="voteDiff(${p.id},\'easy\')">😅 Too Easy</button><button class="diff-vote-btn" data-vote="ok" onclick="voteDiff(${p.id},\'ok\')">✓ Just Right</button><button class="diff-vote-btn" data-vote="hard" onclick="voteDiff(${p.id},\'hard\')">😤 Too Hard</button></div></div>`;
  });
  c.innerHTML=html;
  if(typeof IntersectionObserver!=='undefined'&&typeof document!=='undefined'){
    const obs=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        const id=entry.target.dataset.id;
        if(entry.isIntersecting&&!probTimers[id]){
          probTimerStart[id]=Date.now();
          probTimers[id]=setInterval(function(){
            if(typeof document==='undefined')return;
            const el=document.getElementById('timer-'+id);
            if(!el)return;
            const secs=Math.floor((Date.now()-probTimerStart[id])/1000);
            const m=Math.floor(secs/60),s=secs%60;
            el.textContent='⏱ '+m+':'+(s<10?'0':'')+s;
          },1000);
        }
      });
    },{threshold:0.5});
    document.querySelectorAll('.pc').forEach(function(card){obs.observe(card);});
  }
  // Problem counter observer
  if(typeof IntersectionObserver!=='undefined'&&typeof document!=='undefined'){
    var total=activeProbs.length;
    var counterObs=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var cards=Array.from(document.querySelectorAll('.pc'));
          var idx=cards.indexOf(entry.target)+1;
          var ctr=document.getElementById('probCounter');
          if(ctr&&total>0)ctr.textContent='Problem '+idx+' of '+total;
        }
      });
    },{threshold:0.5});
    document.querySelectorAll('.pc').forEach(function(card){counterObs.observe(card);});
  }
  if(typeof localStorage!=='undefined'){
    try{
      var dvotes=JSON.parse(localStorage.getItem('sh-diff-votes')||'{}');
      Object.keys(dvotes).forEach(function(pid){
        var row=document.getElementById('dvr-'+pid);
        if(!row)return;
        row.querySelectorAll('.diff-vote-btn').forEach(function(b){b.classList.remove('active');});
        var active=row.querySelector('[data-vote="'+dvotes[pid]+'"]');
        if(active)active.classList.add('active');
      });
    }catch(e){}
  }
  updatePracticeNavBadge();
  updateMasteryBadge(unit);
  buildUnitXPBar(unit);
  buildDiffInsight(unit);
  updateFilterCounts(unit);
  buildTagFilter();
  if(typeof localStorage!=='undefined'){try{var savedSort=localStorage.getItem('sh-problem-sort')||'default';if(savedSort!=='default'){var sel=document.getElementById('problemSort');if(sel)sel.value=savedSort;sortProblems(savedSort);}}catch(e){}};
  if(typeof localStorage!=='undefined'){try{activeTags=new Set(JSON.parse(localStorage.getItem('sh-active-tags')||'[]'));}catch(e){activeTags=new Set();}applyTagFilter();}
  if(typeof localStorage!=='undefined'){try{var collSet=new Set(JSON.parse(localStorage.getItem('sh-collapsed-'+unit)||'[]'));collSet.forEach(function(cid){var card=document.getElementById('pc-'+cid);if(card){card.classList.add('pc-collapsed');var btn=card.querySelector('.card-collapse-btn');if(btn)btn.textContent='▸';}});}catch(e){}}
  const saved=getPracticeState(unit);
  answered=saved.answered&&typeof saved.answered==='object'?saved.answered:{};
  pScore=0;
  activeProbs.forEach(p=>{
    if(answered[p.id]===undefined)return;
    if(p.type==='mc'){
      const ch=+answered[p.id],ok=ch===p.ans;if(ok)pScore++;
      p.ch.forEach((_,j)=>{const el=document.getElementById('cb-'+p.id+'-'+j);if(!el)return;el.classList.add('dis');el.setAttribute('aria-disabled','true');if(j===p.ans)el.classList.add('right');else if(j===ch&&!ok)el.classList.add('wrong');});
      showFB(p.id,ok,ok?p.ex:'Correct answer: '+p.ch[p.ans]+'. '+p.ex);
    }else{
      const v=parseFloat(answered[p.id]);if(!Number.isFinite(v))return;
      const ok=Math.abs(v-p.ans)<=(p.tol||0.1);if(ok)pScore++;
      const inp=document.getElementById('fi-'+p.id);if(inp){inp.value=String(v);inp.disabled=true;inp.style.borderColor=ok?'var(--green)':'var(--red)';}
      showFB(p.id,ok,ok?p.ex:'Correct answer: '+p.ans+'. '+p.ex);
    }
  });
  setAllScores();
  // Touch swipe gestures for MC answer selection
  if(typeof document!=='undefined'&&typeof window!=='undefined'&&'ontouchstart' in window){
    activeProbs.forEach(function(p){
      if(p.type!=='mc')return;
      var card=document.getElementById('pc-'+p.id);if(!card)return;
      var tx=0,ty=0;
      card.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
      card.addEventListener('touchend',function(e){
        var dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
        if(Math.abs(dx)<60||Math.abs(dy)>40)return;
        if(dx>0)ansMC(p.id,0);else ansMC(p.id,p.ch.length-1);
      },{passive:true});
    });
  }
}

function updateSessionGoal(){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  var sel=document.getElementById('sessionGoal');
  if(!sel)return;
  var goal=parseInt(sel.value)||0;
  try{localStorage.setItem('sh-session-goal',String(goal));}catch(e){}
  refreshGoalProgress();
}
function refreshGoalProgress(){
  if(typeof document==='undefined')return;
  var progress=document.getElementById('goalProgress');
  var text=document.getElementById('goalProgressText');
  if(!progress||!text)return;
  var goal=0;
  if(typeof localStorage!=='undefined')try{goal=parseInt(localStorage.getItem('sh-session-goal'))||0;}catch(e){}
  if(!goal){progress.style.display='none';text.textContent='';return;}
  var answered=0;
  if(typeof sessionData!=='undefined')answered=sessionData.problemsAnswered||0;
  var pct=Math.min(Math.round(answered/goal*100),100);
  progress.style.display='';
  progress.max=100;
  progress.value=pct;
  text.textContent=answered+' / '+goal;
  if(answered>=goal&&goal>0&&pct===100){
    if(typeof showToast!=='undefined'&&!document.getElementById('goalProgress').dataset.toasted){document.getElementById('goalProgress').dataset.toasted='1';showToast('Session goal reached! Great work.');}
  }else{
    var pg=document.getElementById('goalProgress');if(pg)pg.dataset.toasted='';
  }
}
function voteDiff(probId,vote){
  if(typeof localStorage==='undefined')return;
  try{
    var votes=JSON.parse(localStorage.getItem('sh-diff-votes')||'{}');
    votes[String(probId)]=vote;
    localStorage.setItem('sh-diff-votes',JSON.stringify(votes));
  }catch(e){}
  if(typeof document==='undefined')return;
  var row=document.getElementById('dvr-'+probId);
  if(!row)return;
  row.querySelectorAll('.diff-vote-btn').forEach(function(b){b.classList.remove('active');});
  var active=row.querySelector('[data-vote="'+vote+'"]');
  if(active)active.classList.add('active');
}
function ansMC(id,ch){
  if(answered[id]!==undefined)return;
  if(probTimers[id]){clearInterval(probTimers[id]);delete probTimers[id];}
  const p=activeProbs.find(x=>x.id===id);if(!p)return;
  answered[id]=ch;const ok=ch===p.ans;if(ok)pScore++;
  if(!ok&&p.hint){wrongAttempts[id]=(wrongAttempts[id]||0)+1;if(wrongAttempts[id]>=2&&typeof showHint!=='undefined'){showHint(String(id));showToast('Hint revealed after 2 incorrect attempts.');}}
  p.ch.forEach((_,j)=>{const el=document.getElementById('cb-'+id+'-'+j);if(!el)return;el.classList.add('dis');el.setAttribute('aria-disabled','true');if(j===p.ans)el.classList.add('right');else if(j===ch&&!ok)el.classList.add('wrong');});
  showFB(id,ok,p.ex);
  addToReview(p.id,ok);
  persistPracticeState();
  const diff=p.diff||'medium';
  awardXP(ok?XP_TABLE[diff]:XP_TABLE.wrong,p.id);
  sessionData.problemsAnswered++;if(ok)sessionData.correct++;
  updateWeeklyProgress('problems',1);
  recordActivity();
  _recordTodayActivity(p.id,p.unit,ok);
  setAllScores();
  updateReviewBadge();
  updateWeakSpots();
  refreshGoalProgress();
  updatePracticeNavBadge();
  checkUnitCompletion(currentUnit);
  updateMasteryBadge(currentUnit);
  buildUnitXPBar(currentUnit);
  if(typeof setTimeout==='function')setTimeout(function(){autoScrollToNext(id);},300);
}

function ansFR(id){
  if(answered[id]!==undefined)return;
  if(probTimers[id]){clearInterval(probTimers[id]);delete probTimers[id];}
  const p=activeProbs.find(x=>x.id===id);if(!p)return;
  const inp=document.getElementById('fi-'+id);if(!inp)return;
  const v=parseFloat(inp.value);if(!Number.isFinite(v))return;
  answered[id]=v;const ok=Math.abs(v-p.ans)<=(p.tol||0.1);if(ok)pScore++;
  if(!ok&&p.hint){wrongAttempts[id]=(wrongAttempts[id]||0)+1;if(wrongAttempts[id]>=2&&typeof showHint!=='undefined'){showHint(String(id));showToast('Hint revealed after 2 incorrect attempts.');}}
  inp.style.borderColor=ok?'var(--green)':'var(--red)';inp.disabled=true;
  showFB(id,ok,ok?p.ex:'Correct answer: '+p.ans+'. '+p.ex);
  addToReview(p.id,ok);
  persistPracticeState();
  const diff=p.diff||'medium';
  awardXP(ok?XP_TABLE[diff]:XP_TABLE.wrong,p.id);
  sessionData.problemsAnswered++;if(ok)sessionData.correct++;
  updateWeeklyProgress('problems',1);
  recordActivity();
  _recordTodayActivity(p.id,p.unit,ok);
  setAllScores();
  updateReviewBadge();
  updateWeakSpots();
  refreshGoalProgress();
  updatePracticeNavBadge();
  checkUnitCompletion(currentUnit);
  updateMasteryBadge(currentUnit);
  buildUnitXPBar(currentUnit);
  if(typeof setTimeout==='function')setTimeout(function(){autoScrollToNext(id);},300);
}

function autoScrollToNext(currentId){
  if(typeof document==='undefined')return;
  var probs=activeProbs||[];
  var idx=probs.findIndex(function(p){return p.id===currentId;});
  if(idx<0)return;
  for(var i=idx+1;i<probs.length;i++){
    if(answered[probs[i].id]===undefined){
      var el=document.getElementById('pc-'+probs[i].id);
      if(el&&typeof el.scrollIntoView==='function')el.scrollIntoView({behavior:'smooth',block:'center'});
      return;
    }
  }
}

function findProblemById(probId){
  const key=String(probId);
  for(let u=1;u<=MAX_UNIT;u++){
    const prob=(allProbs[u]||[]).find(p=>String(p.id)===key);
    if(prob)return prob;
  }
  return null;
}

function startReview(){
  if(typeof document==='undefined')return;
  const dueIds=getDueCards();
  if(dueIds.length===0){
    showToast('No cards due for review! Come back tomorrow.');
    updateReviewBadge();
    return;
  }

  reviewQueue=dueIds.slice(0,10);
  reviewIndex=0;
  reviewSessionCorrect=0;
  reviewSessionByUnit={};

  const btn=document.getElementById('startReviewBtn');
  const card=document.getElementById('reviewCard');
  if(btn)btn.style.display='none';
  if(card)card.style.display='block';
  showReviewCard();
}

function showReviewCard(){
  if(typeof document==='undefined')return;
  if(reviewIndex>=reviewQueue.length){endReview();return;}

  const probId=reviewQueue[reviewIndex];
  const prob=findProblemById(probId);
  if(!prob){reviewIndex++;showReviewCard();return;}

  const progress=document.getElementById('reviewProgress');
  if(progress)progress.textContent=(reviewIndex+1)+' / '+reviewQueue.length;

  const card=document.getElementById('reviewCardInner');
  if(!card)return;

  const pid=String(prob.id);
  let html='<div class="review-q">'+prob.q+'</div>';
  if(prob.data)html+='<div class="review-data">'+prob.data+'</div>';

  if(prob.type==='mc'){
    html+='<div class="choices">';
    const labels='ABCD';
    (prob.ch||[]).forEach((ch,j)=>{
      html+=`<div class="ch-btn" role="button" tabindex="0" onclick="reviewMC('${pid}',${j})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();reviewMC('${pid}',${j})}" id="rv-${pid}-${j}"><span class="lt">${labels[j]||''}</span><span>${ch}</span></div>`;
    });
    html+='</div>';
  }else{
    html+=`<div class="fr-row"><input type="text" id="rv-fi-${pid}" placeholder="Your answer..." onkeydown="if(event.key==='Enter')reviewFR('${pid}')"><button onclick="reviewFR('${pid}')">Check</button></div>`;
  }

  html+=`<div class="fb" id="rv-fb-${pid}"><div class="fb-box" id="rv-fbx-${pid}"></div></div>`;
  card.innerHTML=html;
}

function reviewMC(probId,chosen){
  if(typeof document==='undefined')return;
  if(reviewIndex>=reviewQueue.length)return;

  const activeId=String(reviewQueue[reviewIndex]);
  if(String(probId)!==activeId)return;
  const prob=findProblemById(activeId);
  if(!prob||prob.type!=='mc')return;

  const ok=chosen===prob.ans;
  if(ok)reviewSessionCorrect++;
  var _rUnit=prob.unit||1;
  if(!reviewSessionByUnit[_rUnit])reviewSessionByUnit[_rUnit]={correct:0,total:0};
  reviewSessionByUnit[_rUnit].total++;
  if(ok)reviewSessionByUnit[_rUnit].correct++;

  (prob.ch||[]).forEach((_,j)=>{
    const el=document.getElementById('rv-'+activeId+'-'+j);
    if(!el)return;
    el.classList.add('dis');
    el.setAttribute('aria-disabled','true');
    if(j===prob.ans)el.classList.add('right');
    else if(j===chosen&&!ok)el.classList.add('wrong');
  });

  const fb=document.getElementById('rv-fb-'+activeId);
  const fbx=document.getElementById('rv-fbx-'+activeId);
  if(fb)fb.classList.add('show');
  if(fbx){
    fbx.className='fb-box '+(ok?'fb-ok':'fb-no');
    fbx.textContent='';
    const strong=document.createElement('strong');
    strong.textContent=ok?'Correct!':'Not quite.';
    const ex=document.createElement('span');
    ex.className='ex';
    ex.textContent=prob.ex;
    fbx.appendChild(strong);
    fbx.appendChild(ex);
  }

  reviewAnswer(activeId,ok);
  const diff=prob.diff||'medium';
  awardXP(ok?XP_TABLE[diff]:XP_TABLE.wrong,activeId+'-review');
  recordActivity();
  updateReviewBadge();

  if(typeof setTimeout==='function')setTimeout(()=>{reviewIndex++;showReviewCard();},ok?1500:3000);
  else{reviewIndex++;showReviewCard();}
}

function reviewFR(probId){
  if(typeof document==='undefined')return;
  if(reviewIndex>=reviewQueue.length)return;

  const activeId=String(reviewQueue[reviewIndex]);
  if(String(probId)!==activeId)return;
  const prob=findProblemById(activeId);
  if(!prob||prob.type!=='fr')return;

  const inp=document.getElementById('rv-fi-'+activeId);
  if(!inp)return;
  const v=parseFloat(inp.value);
  if(!Number.isFinite(v))return;

  const ok=Math.abs(v-prob.ans)<=(prob.tol||0.1);
  if(ok)reviewSessionCorrect++;
  var _rUnit=prob.unit||1;
  if(!reviewSessionByUnit[_rUnit])reviewSessionByUnit[_rUnit]={correct:0,total:0};
  reviewSessionByUnit[_rUnit].total++;
  if(ok)reviewSessionByUnit[_rUnit].correct++;

  inp.disabled=true;
  inp.style.borderColor=ok?'var(--green)':'var(--red)';
  const btn=inp.parentElement?inp.parentElement.querySelector('button'):null;
  if(btn)btn.disabled=true;

  const fb=document.getElementById('rv-fb-'+activeId);
  const fbx=document.getElementById('rv-fbx-'+activeId);
  if(fb)fb.classList.add('show');
  if(fbx){
    fbx.className='fb-box '+(ok?'fb-ok':'fb-no');
    fbx.textContent='';
    const strong=document.createElement('strong');
    strong.textContent=ok?'Correct!':'Not quite.';
    const ex=document.createElement('span');
    ex.className='ex';
    ex.textContent=ok?prob.ex:'Correct answer: '+prob.ans+'. '+prob.ex;
    fbx.appendChild(strong);
    fbx.appendChild(ex);
  }

  reviewAnswer(activeId,ok);
  const diff=prob.diff||'medium';
  awardXP(ok?XP_TABLE[diff]:XP_TABLE.wrong,activeId+'-review');
  recordActivity();
  updateReviewBadge();

  if(typeof setTimeout==='function')setTimeout(()=>{reviewIndex++;showReviewCard();},ok?1500:3000);
  else{reviewIndex++;showReviewCard();}
}

function drawReviewChart(canvas,byUnit){
  if(!canvas||typeof canvas.getContext!=='function')return;
  var units=Object.keys(byUnit).sort(function(a,b){return +a-+b;});
  var ctx=canvas.getContext('2d');
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H);
  var n=units.length;
  if(!n)return;
  var barW=Math.floor((W-20)/(n*2));
  var maxH=H-30;
  units.forEach(function(u,i){
    var r=byUnit[u];
    var acc=r.total?r.correct/r.total:0;
    var bh=Math.round(acc*maxH);
    var x=10+i*(barW*2+4);
    ctx.fillStyle='#06b6d4';
    ctx.fillRect(x,H-20-bh,barW,bh);
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.font='9px monospace';
    ctx.textAlign='center';
    ctx.fillText('U'+u,x+barW/2,H-6);
    ctx.fillText(Math.round(acc*100)+'%',x+barW/2,H-22-bh);
  });
}
function endReview(){
  if(typeof document==='undefined')return;
  const card=document.getElementById('reviewCard');
  if(card)card.style.display='none';
  const btn=document.getElementById('startReviewBtn');
  if(btn){btn.style.display='';btn.textContent='Start Another Session';}

  const total=reviewQueue.length;
  const pct=total?Math.round(reviewSessionCorrect/total*100):0;
  showToast('Session complete! '+reviewSessionCorrect+'/'+total+' correct ('+pct+'%)');

  const meta=getReviewMeta();
  meta.sessions=(meta.sessions||0)+1;
  saveReviewMeta(meta);

  awardXP(10,'review-session-'+meta.sessions);
  sessionData.reviewsDone++;
  updateWeeklyProgress('review',1);
  checkMilestones();
  updateReviewBadge();

  // Show chart if session had problems from >1 unit
  var unitKeys=Object.keys(reviewSessionByUnit);
  if(unitKeys.length>1&&typeof document!=='undefined'){
    var overlay=document.createElement('div');
    overlay.className='session-overlay';
    overlay.onclick=function(){overlay.remove();};
    var modal=document.createElement('div');
    modal.className='session-modal';
    modal.onclick=function(e){e.stopPropagation();};
    modal.innerHTML='<h3>Session Summary</h3><p style="font-size:13px;color:var(--muted);margin:4px 0 12px;">'+reviewSessionCorrect+'/'+total+' correct ('+pct+'%)</p><canvas id="reviewChart" width="300" height="120" style="display:block;margin:0 auto;background:var(--bg2);border-radius:6px;"></canvas><button class="session-close" id="reviewChartClose" style="margin-top:16px;">Close</button>';
    var _closeBtn=modal.querySelector('#reviewChartClose');
    if(_closeBtn)_closeBtn.onclick=function(){overlay.remove();};
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    var canvas=document.getElementById('reviewChart');
    drawReviewChart(canvas,reviewSessionByUnit);
  }

  reviewQueue=[];
  reviewIndex=0;
  reviewSessionCorrect=0;
  reviewSessionByUnit={};
}

function updateReviewBadge(){
  if(typeof document==='undefined')return;
  const count=getDueCards().length;
  const badge=document.getElementById('reviewBadge');
  if(badge){
    badge.textContent=String(count);
    badge.style.display=count>0?'inline-block':'none';
  }

  const data=getReviewData();
  const total=Object.keys(data).length;
  const mastered=Object.values(data).filter(c=>c&&Number.isFinite(+c.interval)&&+c.interval>=30).length;
  setElText('reviewDueCount',count);
  setElText('reviewTotalCount',total);
  setElText('reviewMasteredCount',mastered);

  const desc=document.getElementById('reviewDesc');
  if(desc){
    if(total===0)desc.textContent='Answer practice problems to build your review deck.';
    else if(count>0)desc.textContent='You have '+count+' card'+(count===1?'':'s')+' due for review.';
    else desc.textContent='No cards due right now. Keep practicing and check back tomorrow.';
  }

  // Show next up cards
  var nextUpEl=document.getElementById('reviewNextUp');
  if(nextUpEl){
    var dueIds=getDueCards();
    var top3=dueIds.slice(0,3);
    if(!top3.length){nextUpEl.innerHTML='';return;}
    var today=todayStr();
    var html='<div class="review-next-title">Up Next</div>';
    top3.forEach(function(id){
      var reviewData=getReviewData();
      var card=reviewData[id];
      var prob=findProblemById(id);
      if(!prob)return;
      var dueDate=card&&card.next?card.next:today;
      var daysUntil=Math.round((new Date(dueDate)-new Date(today))/(1000*60*60*24));
      var dueLabel=daysUntil<=0?'Due today':daysUntil===1?'Due tomorrow':'Due in '+daysUntil+' days';
      var snippet=prob.q.length>60?prob.q.slice(0,60)+'...':prob.q;
      html+='<div class="review-next-item"><span class="review-next-q">'+snippet+'</span><span class="review-next-due">'+dueLabel+'</span></div>';
    });
    nextUpEl.innerHTML=html;
  }
}

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

  setElText('digestStreak',streak.current||0);
  setElText('digestXP',xp.total||0);
  setElText('digestLevel',xp.level||1);
  setElText('digestDue',dueCount);
  setElText('digestBadges',badgeCount);

  const hasActivity=(xp.total||0)>0||(streak.current||0)>0||dueCount>0;
  panel.style.display=hasActivity?'':'none';

  const cta=document.getElementById('digestCTA');
  if(cta){
    cta.innerHTML='';
    const btn=document.createElement('button');
    btn.className='digest-action-btn';
    if(dueCount>0){
      btn.textContent='Review '+dueCount+' due card'+(dueCount===1?'':'s')+' →';
      btn.onclick=function(){goPage('review');};
    }else{
      let weakest=null,weakestPct=101;
      for(let u=1;u<=MAX_UNIT;u++){
        const r=summary[u]||{total:0,attempted:0,correct:0};
        if(r.total===0)continue;
        const pct=r.attempted>0?(r.correct/r.total)*100:0;
        if(pct<weakestPct){weakestPct=pct;weakest=u;}
      }
      if(weakest&&weakestPct<80){
        btn.textContent='Practice Unit '+weakest+': '+UNIT_META[weakest].name+' →';
        btn.onclick=function(){goPage('practice');setUnit(weakest);};
      }else{
        btn.textContent='Explore the Quant Roadmap →';
        btn.onclick=function(){goPage('roadmap');};
      }
    }
    cta.appendChild(btn);
  }

  const milestoneEl=document.getElementById('digestMilestone');
  if(milestoneEl){
    const next=MILESTONES.find(m=>!earned[m.id]);
    milestoneEl.textContent=next?'Next badge: '+next.icon+' '+next.name+' — '+next.desc:'All badges earned! 🏆';
  }
}

function showFB(id,ok,ex){
  const fb=document.getElementById('fb-'+id),pc=document.getElementById('pc-'+id),b=document.getElementById('fbx-'+id);
  if(!fb||!pc||!b)return;
  fb.classList.add('show');
  b.className='fb-box '+(ok?'fb-ok':'fb-no');
  b.textContent='';
  const s=document.createElement('strong');
  s.textContent=ok?'Correct!':'Not quite.';
  b.appendChild(s);
  const _ann=document.getElementById('a11yAnnounce');if(_ann)_ann.textContent=ok?'Correct!':'Incorrect. '+ex;
  const unit=allProbs[currentUnit]||[];
  const prob=unit.find(function(p){return String(p.id)===String(id);});
  if(prob&&prob.steps&&prob.steps.length){
    const stepsDiv=document.createElement('div');
    stepsDiv.className='steps-container';
    prob.steps.forEach(function(step,i){
      const d=document.createElement('div');
      d.className='step hidden';
      d.id='step-'+id+'-'+i;
      const num=document.createElement('span');
      num.className='step-num';
      num.textContent='Step '+(i+1)+': ';
      d.appendChild(num);
      d.appendChild(document.createTextNode(step));
      stepsDiv.appendChild(d);
    });
    const revBtn=document.createElement('button');
    revBtn.className='step-reveal-btn';
    revBtn.id='stepBtn-'+id;
    revBtn.textContent='Show Step 1 →';
    revBtn.onclick=function(){revealNextStep(String(id),prob.steps.length);};
    stepsDiv.appendChild(revBtn);
    b.appendChild(stepsDiv);
  }else{
    const sp=document.createElement('span');
    sp.className='ex';
    sp.textContent=ex;
    b.appendChild(sp);
  }
  pc.classList.add(ok?'correct':'incorrect');
  if(ok){
    spawnConfetti();
    _recordActivity();
    const card=document.getElementById('pc-'+id);
    if(card){card.classList.add('correct-pulse');setTimeout(()=>card.classList.remove('correct-pulse'),600);}
  }
  if(prob&&prob.type==='mc'&&prob.ch){
    var numId=parseInt(String(id))||1;
    var corrPct=40+(numId%30);
    var rem=100-corrPct;
    var r1=Math.floor(rem*(10+(numId%15))/45);
    var r2=Math.floor(rem*(10+(numId%11))/40);
    var r3=rem-r1-r2;
    var dists=new Array(prob.ch.length).fill(0);
    for(var di=0;di<dists.length;di++){dists[di]=di===prob.ans?corrPct:(di===0?r1:di===1?r2:r3);}
    var distDiv=document.createElement('div');
    distDiv.className='ans-dist';
    var labels='ABCD';
    dists.forEach(function(pct,di){
      var row=document.createElement('div');
      row.className='ans-dist-row';
      var lbl=document.createElement('span');
      lbl.className='ans-dist-label';
      lbl.textContent=labels[di]||'';
      var track=document.createElement('div');
      track.className='ans-dist-track';
      var fill=document.createElement('div');
      fill.className='ans-dist-bar'+(di===prob.ans?' ans-dist-correct':'');
      fill.style.width=pct+'%';
      var txt=document.createElement('span');
      txt.className='ans-dist-pct';
      txt.textContent=pct+'%';
      track.appendChild(fill);
      row.appendChild(lbl);row.appendChild(track);row.appendChild(txt);
      distDiv.appendChild(row);
    });
    b.appendChild(distDiv);
  }
}

function updatePScore(){setAllScores()}

function showUnitInfo(){
  if(typeof document==='undefined'||typeof window==='undefined')return;
  var unit=currentUnit;
  var meta=UNIT_META[unit];
  if(!meta)return;
  var probs=(allProbs[unit]||[]);
  var easy=probs.filter(function(p){return p.diff==='easy';}).length;
  var med=probs.filter(function(p){return p.diff==='medium';}).length;
  var hard=probs.filter(function(p){return p.diff==='hard';}).length;
  var topics=[...new Set(probs.map(function(p){return p.topic;}))].slice(0,8);
  var overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:2000;display:flex;align-items:center;justify-content:center;';
  overlay.onclick=function(){overlay.remove();};
  var modal=document.createElement('div');
  modal.className='unit-info-modal';
  modal.onclick=function(e){e.stopPropagation();};
  var topicList=topics.map(function(t){return '<li>'+t+'</li>';}).join('');
  modal.innerHTML='<div class="unit-info-header"><strong>Unit '+unit+': '+meta.name+'</strong></div>'+
    '<div class="unit-info-stat-row"><span>'+probs.length+' problems</span><span class="ui-easy">'+easy+' easy</span><span class="ui-med">'+med+' medium</span><span class="ui-hard">'+hard+' hard</span></div>'+
    '<div class="unit-info-topics"><div class="unit-info-label">Topics covered:</div><ul class="unit-info-topic-list">'+topicList+'</ul></div>'+
    '<button id="unitInfoClose" class="unit-info-close">Close</button>';
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  var closeBtn=modal.querySelector('#unitInfoClose');
  if(closeBtn)closeBtn.onclick=function(){overlay.remove();};
}
function setUnit(n){
  if(!UNIT_META[n])return;
  currentUnit=n;
  if(typeof document!=='undefined'){var bc=document.getElementById('breadcrumb');if(bc&&bc.textContent.startsWith('Practice')){var unitName=UNIT_META[n]?UNIT_META[n].name:'';bc.innerHTML='Practice <span class="breadcrumb-sep">›</span> Unit '+n+(unitName?' – '+unitName:'');}};
  if(typeof localStorage!=='undefined')try{localStorage.setItem('sh-filter-unit',String(n));}catch(e){};
  const sel=document.getElementById('unitSelect');if(sel)sel.value=String(n);
  const vsel=document.getElementById('vizUnitSelect');if(vsel)vsel.value=String(n);
  setElText('practiceUnitTag','Unit '+n+' - '+UNIT_META[n].name);
  setElText('vizUnitTag','Unit '+n+' - '+UNIT_META[n].name);
  buildProblems(n);
  buildFormulas(n);
  buildVizForUnit(n);
  if(isVizPageActive()){drawActiveVisualizer();_recordVizHistory(n);buildVizHistory();buildVizUnitInfo(n);buildVizDataSummary(n);}
  filterProblems('all');
  drawDiffChart();
}

allProbs[2]=[
  {id:101,unit:2,diff:'easy',topic:'Z-score',q:'Compute z for x=78, mu=70, sigma=4.',data:null,type:'fr',ans:2,tol:0.01,ex:'z=(78-70)/4=2.',hint:'Use z = (x − μ) / σ. What are μ and σ here?',steps:['Identify the values: x = 78, μ = 70, σ = 4','Apply the z-score formula: z = (x − μ) / σ','Substitute: z = (78 − 70) / 4 = 8 / 4','Result: z = 2.0']},
  {id:102,unit:2,diff:'easy',topic:'68-95-99.7',q:'Within 2 SD of the mean is about:',data:null,type:'mc',ans:2,tol:0.01,ch:['50%','68%','95%','99.7%'],ex:'Rule: about 95% is within 2 SD.',hint:'Recall the 68-95-99.7 empirical rule.'},
  {id:103,unit:2,diff:'medium',topic:'Percentile',q:'For z=1.25, enter percentile as a percent.',data:null,type:'fr',ans:89.44,tol:0.2,ex:'P(Z<1.25)=0.8944, so 89.44%.',hint:'Find P(Z < 1.25) using standard normal table.'},
  {id:104,unit:2,diff:'medium',topic:'Relative Position',q:'A: x=82,mu=75,s=5. B: x=88,mu=80,s=4. Who is higher relative to class?',data:null,type:'mc',ans:1,tol:0.01,ch:['A','B','Equal','Cannot compare'],ex:'zA=1.4 and zB=2.0; B is higher.',hint:'Compute z = (x − μ) / σ for each student then compare.'},
  {id:105,unit:2,diff:'hard',topic:'Reverse Z',q:'Normal(mu=50,sigma=10). 90th percentile score is closest to:',data:null,type:'mc',ans:1,tol:0.01,ch:['56.4','62.8','69.6','74.0'],ex:'x=50+1.28*10=62.8.',hint:'x = μ + z·σ where z is the 90th percentile z-score (~1.28).'},
  {id:106,unit:2,diff:'easy',topic:'Normal Shape',q:'In a normal distribution, what proportion lies above the mean?',data:null,type:'mc',ans:1,tol:0.01,ch:['About 34%','About 50%','About 68%','About 95%'],ex:'The normal curve is symmetric, so half the area is above the mean.',hint:'Think about symmetry of the normal curve.'},
  {id:107,unit:2,diff:'easy',topic:'Standardization',q:'Standardize x=84 using mu=76 and sigma=8.',data:'x=84, mu=76, sigma=8',type:'fr',ans:1,tol:0.01,ex:'(84-76)/8=1.',hint:'Use z = (x − μ) / σ.'},
  {id:108,unit:2,diff:'medium',topic:'Combining Normals',q:'If X and Y are independent with means 100 and 30, what is E(X+Y)?',data:'X: mu=100, Y: mu=30',type:'fr',ans:130,tol:0.01,ex:'Means add: 100+30=130.',hint:'E(X+Y) = E(X) + E(Y) for any random variables.'},
  {id:109,unit:2,diff:'medium',topic:'Normal Approximation Check',q:'For a binomial model with n=200 and p=0.08, compute np.',data:'n=200, p=0.08',type:'fr',ans:16,tol:0.01,ex:'np=200*0.08=16.',hint:'np must be ≥ 10 for normal approximation.'},
  {id:110,unit:2,diff:'hard',topic:'Difference of Normals',q:'If X~N(50,4) and Y~N(20,3) are independent, SD(X-Y) is closest to:',data:null,type:'mc',ans:2,tol:0.01,ch:['1.0','4.0','5.0','7.0'],ex:'Var(X-Y)=4^2+3^2=25, so SD=5.',hint:'Use the empirical rule: what % lies beyond 2 SD?'}
];

allProbs[3]=[
  {id:201,unit:3,diff:'easy',topic:'Association',q:'x rises, y rises in a tight line. This is:',data:null,type:'mc',ans:0,tol:0.01,ch:['Strong positive linear','Strong negative linear','Weak nonlinear','No association'],ex:'Tight upward line means strong positive linear.',hint:'r measures direction and strength of linear association.'},
  {id:202,unit:3,diff:'easy',topic:'Correlation',q:'r=-0.85 means:',data:null,type:'mc',ans:1,tol:0.01,ch:['Weak positive','Strong negative','No linear relation','Causation'],ex:'Near -1 implies strong negative linear relation.',hint:'Slope b = r × (s_y / s_x). Use given r and standard deviations.'},
  {id:203,unit:3,diff:'medium',topic:'Prediction',q:'yhat=12+1.8x. Find yhat for x=15.',data:null,type:'fr',ans:39,tol:0.01,ex:'12+1.8*15=39.',hint:'Use ŷ = a + bx. Substitute the x value.'},
  {id:204,unit:3,diff:'medium',topic:'Residual',q:'Observed y=42 and yhat=39.5. Find residual.',data:null,type:'fr',ans:2.5,tol:0.01,ex:'Residual=y-yhat=2.5.',hint:'Residual = actual y − predicted ŷ.'},
  {id:205,unit:3,diff:'hard',topic:'Causation',q:'Ice cream sales and drownings both rise in summer. Best conclusion?',data:null,type:'mc',ans:2,tol:0.01,ch:['Ice cream causes drownings','Drownings cause ice cream sales','Lurking variable like temperature affects both','Correlation proves causation'],ex:'Temperature can drive both variables.',hint:'r² tells you what proportion of variance in y is explained by x.'},
  {id:206,unit:3,diff:'easy',topic:'r-squared Interpretation',q:'If r^2=0.64 in a linear model, this means:',data:null,type:'mc',ans:0,tol:0.01,ch:['64% of variation in y is explained by x','64% of points are on the line','r equals 0.64','64% of x is caused by y'],ex:'r^2 is the proportion of y-variation explained by the linear model.',hint:'Correlation does not imply causation.'},
  {id:207,unit:3,diff:'easy',topic:'Slope Interpretation',q:'For yhat=12+1.8x, what is the predicted change in y when x increases by 5?',data:'yhat=12+1.8x',type:'fr',ans:9,tol:0.01,ex:'Slope*change in x = 1.8*5 = 9.',hint:'Which variable is the explanatory variable here?'},
  {id:208,unit:3,diff:'medium',topic:'Extrapolation',q:'A model was fit using x values from 10 to 30. Predicting at x=45 is:',data:null,type:'mc',ans:1,tol:0.01,ch:['Interpolation and safe','Extrapolation and potentially unreliable','Always valid if r is positive','Guaranteed unbiased'],ex:'x=45 is outside observed range, so this is extrapolation.',hint:'A lurking variable can create the appearance of association.'},
  {id:209,unit:3,diff:'medium',topic:'Residual Pattern',q:'A fitted line (with intercept) has residuals -2, -1, 0, 1, 2. Find the mean residual.',data:'Residuals: -2, -1, 0, 1, 2',type:'fr',ans:0,tol:0.01,ex:'They sum to 0, so mean residual is 0.',hint:'Slope b = r(s_y/s_x). What units does slope have?'},
  {id:210,unit:3,diff:'hard',topic:'Influential Points',q:'A point lies far in x and far from the trend. It is most likely to:',data:null,type:'mc',ans:1,tol:0.01,ch:['Only change the intercept slightly','Strongly affect slope and correlation','Never affect the fitted line','Increase sample size but nothing else'],ex:'High-leverage outliers can strongly pull the regression line.',hint:'Intercept a = ȳ − b·x̄.'}
];

allProbs[4]=[
  {id:301,unit:4,diff:'easy',topic:'Study Type',q:'Random assignment to drug vs placebo is a:',data:null,type:'mc',ans:2,tol:0.01,ch:['Census','Observational study','Randomized experiment','Convenience sample'],ex:'Random assignment defines an experiment.',hint:'SRS gives each individual an equal chance of selection.'},
  {id:302,unit:4,diff:'easy',topic:'Sampling Method',q:'Randomly take 10 students from each grade. This is:',data:null,type:'mc',ans:1,tol:0.01,ch:['Cluster','Stratified random','Systematic','Convenience'],ex:'Sampling within each grade stratum is stratified.',hint:'In stratified sampling, the population is divided into subgroups first.'},
  {id:303,unit:4,diff:'medium',topic:'Bias',q:'Survey posted only in a fitness app. Main bias?',data:null,type:'mc',ans:0,tol:0.01,ch:['Selection bias','Response bias','Measurement bias','Confounding'],ex:'App users are not representative.',hint:'Voluntary response bias: who is most likely to respond?'},
  {id:304,unit:4,diff:'medium',topic:'Allocation',q:'A stratified sample of 40 is split equally across 4 groups. Per group?',data:null,type:'fr',ans:10,tol:0.01,ex:'40/4=10.',hint:'Convenience sampling may not represent the population.'},
  {id:305,unit:4,diff:'hard',topic:'Design',q:'Best test of caffeine effect on quiz scores:',data:null,type:'mc',ans:3,tol:0.01,ch:['Compare current drinkers vs non-drinkers','Let students choose caffeine','Give caffeine to top students only','Randomly assign caffeine or placebo and keep conditions same'],ex:'Randomized placebo-controlled design reduces confounding.',hint:'An experiment requires random assignment to treatments.'},
  {id:306,unit:4,diff:'easy',topic:'Confounding',q:'In an observational study, coffee drinkers had higher exam scores. The main concern is:',data:null,type:'mc',ans:2,tol:0.01,ch:['Sampling error only','Measurement rounding','A lurking variable like study time','No concern because n is large'],ex:'Without random assignment, lurking variables can confound the association.',hint:'A control group allows comparison to the treatment.'},
  {id:307,unit:4,diff:'easy',topic:'Blocking',q:'A trial has 120 participants split equally into 3 blocks. How many per block?',data:'Total=120, blocks=3',type:'fr',ans:40,tol:0.01,ex:'120/3=40 participants per block.',hint:'Blocking reduces variability by grouping similar subjects.'},
  {id:308,unit:4,diff:'medium',topic:'Blinding',q:'A double-blind experiment means:',data:null,type:'mc',ans:1,tol:0.01,ch:['Only subjects know treatment','Neither subjects nor evaluators know treatment assignments','Only researchers know treatment','Everyone knows treatment after randomization'],ex:'Double-blind hides treatment from participants and evaluators.',hint:'Double-blind: neither subject nor researcher knows treatment.'},
  {id:309,unit:4,diff:'medium',topic:'Sampling Frame',q:'Population has 2400 households; the sampling frame lists 2100. What percent of households are missing?',data:'Population=2400, frame=2100',type:'fr',ans:12.5,tol:0.1,ex:'Missing=300, and 300/2400=0.125=12.5%.',hint:'Placebo effect: improvement from belief in treatment.'},
  {id:310,unit:4,diff:'hard',topic:'Voluntary Response',q:'A news website asks readers to click a poll about taxes. The biggest issue is:',data:null,type:'mc',ans:0,tol:0.01,ch:['Voluntary-response bias from self-selection','No bias if many people respond','Random assignment error','Blocking was not used'],ex:'People with strong opinions are more likely to respond.',hint:'Confounding: another variable explains the observed relationship.'}
];

allProbs[5]=[
  {id:401,unit:5,diff:'easy',topic:'Complement',q:'If P(A)=0.37, find P(A\').',data:null,type:'fr',ans:0.63,tol:0.001,ex:'1-0.37=0.63.',hint:'P(A or B) = P(A) + P(B) − P(A∩B).'},
  {id:402,unit:5,diff:'easy',topic:'Mutually Exclusive',q:'Which pair is mutually exclusive in one die roll?',data:null,type:'mc',ans:1,tol:0.01,ch:['Even and >3','Roll 2 and roll 5','<4 and even','Prime and odd'],ex:'2 and 5 cannot happen together.',hint:'P(A|B) = P(A∩B) / P(B).'},
  {id:403,unit:5,diff:'medium',topic:'Conditional',q:'40 are in music, 20 in both music and soccer. Find P(Soccer|Music).',data:null,type:'fr',ans:0.5,tol:0.001,ex:'20/40=0.5.',hint:'Independent events: P(A∩B) = P(A)·P(B).'},
  {id:404,unit:5,diff:'medium',topic:'Addition Rule',q:'If P(A)=0.45, P(B)=0.35, P(A and B)=0.15, then P(A union B)=',data:null,type:'mc',ans:2,tol:0.01,ch:['0.80','0.95','0.65','0.30'],ex:'0.45+0.35-0.15=0.65.',hint:'P(complement) = 1 − P(event).'},
  {id:405,unit:5,diff:'hard',topic:'Bayes',q:'Prevalence 1%, sensitivity 92%, false positive 8%. Find P(Disease|Positive).',data:null,type:'fr',ans:0.104,tol:0.01,ex:'Bayes gives about 0.104.',hint:'Count favorable outcomes over total outcomes.',steps:['Define events: D = has disease, + = positive test','Known: P(D) = 0.01, P(+|D) = 0.92 (sensitivity), P(+|no D) = 0.08 (false positive rate)','Compute P(+ and D) = P(+|D) x P(D) = 0.92 x 0.01 = 0.0092','Compute P(+ and no D) = P(+|no D) x P(no D) = 0.08 x 0.99 = 0.0792','Apply Bayes: P(D|+) = 0.0092 / (0.0092 + 0.0792) = 0.0092 / 0.0884 ≈ 0.104']},
  {id:406,unit:5,diff:'easy',topic:'Multiplication Rule',q:'If events A and B are independent with P(A)=0.60 and P(B)=0.30, find P(A and B).',data:'P(A)=0.60, P(B)=0.30',type:'fr',ans:0.18,tol:0.001,ex:'For independence, multiply: 0.60*0.30=0.18.',hint:'Use Bayes rule: P(A|B) = P(B|A)P(A)/P(B).'},
  {id:407,unit:5,diff:'easy',topic:'Independence',q:'Given P(A)=0.40, P(B)=0.50, and P(A and B)=0.20, are A and B independent?',data:null,type:'mc',ans:0,tol:0.01,ch:['Yes, because 0.40*0.50=0.20','No, because P(A and B) is too small','No, because probabilities must add to 1','Cannot determine'],ex:'Since P(A and B)=P(A)P(B), the events are independent.',hint:'Mutually exclusive means P(A∩B) = 0.'},
  {id:408,unit:5,diff:'medium',topic:'At Least One',q:'A fair coin is tossed 3 times. Find P(at least one head).',data:null,type:'fr',ans:0.875,tol:0.001,ex:'Use complement: 1-P(no heads)=1-(1/2)^3=7/8=0.875.',hint:'List all outcomes in the sample space.'},
  {id:409,unit:5,diff:'medium',topic:'Two-Way Table',q:'From counts A and B=18, A only=12, B only=22, neither=48, find P(A and B).',data:'A and B=18, A only=12, B only=22, neither=48',type:'mc',ans:0,tol:0.01,ch:['0.18','0.30','0.40','0.52'],ex:'Total is 100, so P(A and B)=18/100=0.18.',hint:'Conditional probability restricts the sample space to B.'},
  {id:410,unit:5,diff:'hard',topic:'Tree Diagram',q:'Branch 1 has probability 0.4 with red chance 0.7; Branch 2 has probability 0.6 with red chance 0.2. Find overall P(red).',data:'P(B1)=0.4, P(red|B1)=0.7, P(B2)=0.6, P(red|B2)=0.2',type:'fr',ans:0.4,tol:0.001,ex:'Total probability: 0.4*0.7 + 0.6*0.2 = 0.4.',hint:'Add the probabilities for all outcomes in the event.',steps:['Draw tree: two branches for Branch 1 (P=0.4) and Branch 2 (P=0.6)','Branch 1 leads to red with P(red|B1) = 0.7','Branch 2 leads to red with P(red|B2) = 0.2','Multiply along each path: P(B1 and red) = 0.4 x 0.7 = 0.28','P(B2 and red) = 0.6 x 0.2 = 0.12. Total P(red) = 0.28 + 0.12 = 0.40']}
];

allProbs[6]=[
  {id:501,unit:6,diff:'easy',topic:'Discrete vs Continuous',q:'Which is discrete?',data:null,type:'mc',ans:0,tol:0.01,ch:['Number of emails today','Time to run 5 km','Body temperature','Rainfall amount'],ex:'Counts are discrete.',hint:'E(X) = Σ x·P(x). Multiply each value by its probability.'},
  {id:502,unit:6,diff:'easy',topic:'Expected Value',q:'X:0,1,2,3 with probs 0.1,0.3,0.4,0.2. Find E(X).',data:null,type:'fr',ans:1.7,tol:0.001,ex:'sum xP(x)=1.7.',hint:'Var(X) = Σ (x − μ)²·P(x).'},
  {id:503,unit:6,diff:'medium',topic:'Binomial',q:'For X~Binomial(5,0.4), find P(X=3).',data:null,type:'fr',ans:0.2304,tol:0.001,ex:'C(5,3)(0.4)^3(0.6)^2=0.2304.',hint:'P(X=k) = C(n,k)·pᵏ·(1−p)^(n−k).'},
  {id:504,unit:6,diff:'medium',topic:'Transform',q:'If E(X)=5, SD(X)=2, for Y=3X+2 which is correct?',data:null,type:'mc',ans:0,tol:0.01,ch:['E(Y)=17, SD(Y)=6','E(Y)=17, SD(Y)=2','E(Y)=15, SD(Y)=6','E(Y)=15, SD(Y)=8'],ex:'E(aX+b)=aE(X)+b and SD(aX+b)=|a|SD(X).',hint:'Mean of binomial = np.'},
  {id:505,unit:6,diff:'hard',topic:'Combine',q:'Independent X,Y with SD(X)=3 and SD(Y)=4. Find SD(X+Y).',data:null,type:'fr',ans:5,tol:0.01,ex:'sqrt(3^2+4^2)=5.',hint:'SD of binomial = √(np(1−p)).'},
  {id:506,unit:6,diff:'easy',topic:'Binomial Conditions',q:'Which setting is binomial?',data:null,type:'mc',ans:2,tol:0.01,ch:['Time until a bus arrives','Weight of 12 apples','Number of defective chips in 20 independent chips with same defect chance','Temperature at noon for 7 days'],ex:'Fixed n, independent trials, two outcomes, constant p.',hint:'E(aX+b) = aE(X)+b. SD(aX+b) = |a|SD(X).'},
  {id:507,unit:6,diff:'easy',topic:'Variance',q:'If SD(X)=4.5, find Var(X).',data:'SD(X)=4.5',type:'fr',ans:20.25,tol:0.01,ex:'Variance is SD squared: 4.5^2=20.25.',hint:'For independent X and Y: Var(X+Y) = Var(X)+Var(Y).'},
  {id:508,unit:6,diff:'medium',topic:'Probability Table',q:'Given X:0,1,2 with probabilities 0.25, 0.50, 0.25, find P(X>=1).',data:'X:0,1,2 and P:0.25,0.50,0.25',type:'fr',ans:0.75,tol:0.001,ex:'P(X>=1)=0.50+0.25=0.75.',hint:'For Poisson: P(X=k) = e^(−λ)·λᵏ/k!.'},
  {id:509,unit:6,diff:'medium',topic:'Geometric',q:'If success probability per trial is p=0.20, the expected trial of first success is:',data:null,type:'mc',ans:1,tol:0.01,ch:['2','5','10','20'],ex:'For geometric random variable, E(X)=1/p=1/0.20=5.',hint:'Check: np ≥ 10 and n(1−p) ≥ 10 for normal approximation.'},
  {id:510,unit:6,diff:'hard',topic:'SD of X',q:'X takes values 1 and 4 with probabilities 0.3 and 0.7. Find SD(X).',data:'X=1 (0.3), X=4 (0.7)',type:'fr',ans:1.375,tol:0.02,ex:'mu=3.1, Var=E(X^2)-mu^2=11.5-9.61=1.89, so SD=sqrt(1.89)=1.375.',hint:'E(X) = μ for any distribution.'}
];

allProbs[7]=[
  {id:601,unit:7,diff:'easy',topic:'Definition',q:'A sampling distribution is the distribution of:',data:null,type:'mc',ans:2,tol:0.01,ch:['Raw data','Population values','A statistic over repeated samples','Measurement errors'],ex:'It is the distribution of a statistic.',hint:'SE(x̄) = σ/√n. As n increases, SE decreases.'},
  {id:602,unit:7,diff:'easy',topic:'SE',q:'If sigma=18 and n=36, find SE of xbar.',data:null,type:'fr',ans:3,tol:0.01,ex:'18/sqrt(36)=3.',hint:'By CLT, x̄ is approximately normal for large n regardless of population shape.'},
  {id:603,unit:7,diff:'medium',topic:'CLT Probability',q:'mu=50, sigma=12, n=36. Find P(xbar<53).',data:null,type:'fr',ans:0.9332,tol:0.01,ex:'z=1.5 so probability is 0.9332.',hint:'SE(p̂) = √(p(1−p)/n).'},
  {id:604,unit:7,diff:'medium',topic:'CLT Conditions',q:'Which is sufficient for normal approximation of xbar?',data:null,type:'mc',ans:1,tol:0.01,ch:['No assumptions ever needed','Random sample and large n (or normal population)','Only know mean','Only n<10'],ex:'Need randomness and normality/large n.',hint:'Standardize: z = (x̄ − μ) / (σ/√n).'},
  {id:605,unit:7,diff:'hard',topic:'phat Distribution',q:'If p=0.40 and n=200, find P(phat>0.46).',data:null,type:'fr',ans:0.0416,tol:0.01,ex:'Using normal approx gives about 0.0416.',hint:'Doubling n multiplies SE by 1/√2.'},
  {id:606,unit:7,diff:'easy',topic:'Mean of Sampling Dist',q:'For the sample mean xbar, which is true?',data:null,type:'mc',ans:0,tol:0.01,ch:['E(xbar)=mu','E(xbar)=sigma','E(xbar)=nmu','E(xbar)=0 always'],ex:'The sampling distribution of xbar is centered at the population mean.',hint:'The CLT says the sampling distribution becomes normal as n grows.'},
  {id:607,unit:7,diff:'easy',topic:'Sample Size for SE',q:'If sigma=15 and desired SE(xbar)=3, find n.',data:'sigma=15, SE=3',type:'fr',ans:25,tol:0.01,ex:'SE=sigma/sqrt(n) so n=(15/3)^2=25.',hint:'SE(p̂) = √(p̂(1−p̂)/n).'},
  {id:608,unit:7,diff:'medium',topic:'Effect of n',q:'If sample size is multiplied by 4, SE of xbar will:',data:null,type:'mc',ans:1,tol:0.01,ch:['Double','Be cut in half','Stay the same','Increase by factor 4'],ex:'SE is proportional to 1/sqrt(n), so quadrupling n halves SE.',hint:'Consider the shape of the sampling distribution for large n.'},
  {id:609,unit:7,diff:'medium',topic:'Bias',q:'An estimator has expected value 48 when the true parameter is 50. Compute bias (E-estimator minus true).',data:'E(estimator)=48, true=50',type:'fr',ans:-2,tol:0.01,ex:'Bias=48-50=-2.',hint:'SE(x̄) = σ/√n. Plug in the numbers.'},
  {id:610,unit:7,diff:'hard',topic:'Shape of Sampling Dist',q:'Population is strongly right-skewed, but n=45 random observations are averaged. Shape of xbar is best described as:',data:null,type:'mc',ans:2,tol:0.01,ch:['Still strongly right-skewed','Uniform','Approximately normal by CLT','Exactly symmetric for any n'],ex:'With large n, CLT makes sampling distribution of xbar approximately normal.',hint:'Compare SE for each sample size.'}
];

allProbs[8]=[
  {id:701,unit:8,diff:'easy',topic:'Interpretation',q:'A 95% confidence level means:',data:null,type:'mc',ans:0,tol:0.01,ch:['About 95% of intervals from this method capture the true parameter','This specific interval has 95% chance to contain parameter','95% of sample values are in interval','Parameter changes each sample'],ex:'Confidence is long-run method performance.',hint:'CI: x̄ ± z*·(σ/√n). Use z*=1.96 for 95%.'},
  {id:702,unit:8,diff:'easy',topic:'Point Estimate',q:'Given CI (0.42, 0.54), point estimate and ME are:',data:null,type:'mc',ans:0,tol:0.01,ch:['0.48 and 0.06','0.42 and 0.12','0.54 and 0.06','0.48 and 0.12'],ex:'Center 0.48 and half-width 0.06.',hint:'Margin of error = z*·(σ/√n).'},
  {id:703,unit:8,diff:'medium',topic:'CI Bound',q:'For phat=0.60, n=100, 95% CI: lower endpoint?',data:null,type:'fr',ans:0.504,tol:0.01,ex:'ME=0.096 so lower=0.504.',hint:'n = (z*·σ/E)². Round up to the nearest whole number.'},
  {id:704,unit:8,diff:'medium',topic:'Sample Size',q:'95% confidence, ME=0.03, use p-hat=0.5. Minimum n?',data:null,type:'fr',ans:1068,tol:1,ex:'Compute and round up to 1068.',hint:'A wider interval has more confidence but less precision.'},
  {id:705,unit:8,diff:'hard',topic:'Misinterpretation',q:'Choose the WRONG confidence-interval statement.',data:null,type:'mc',ans:1,tol:0.01,ch:['About 95% of intervals from this method capture truth','This specific interval has 95% chance to contain true value','Higher confidence usually means wider intervals','Larger n usually lowers margin of error'],ex:'The parameter is fixed; the interval is random.',hint:'The CI is about the method, not about any one interval.'},
  {id:706,unit:8,diff:'easy',topic:'Margin of Error',q:'Find the margin of error for CI (42, 58).',data:'CI=(42,58)',type:'fr',ans:8,tol:0.01,ex:'Margin of error is half-width: (58-42)/2=8.',hint:'For proportions: p̂ ± z*·√(p̂(1−p̂)/n).'},
  {id:707,unit:8,diff:'easy',topic:'Effect of CL',q:'If confidence level increases from 90% to 99% (same n), the interval will usually:',data:null,type:'mc',ans:2,tol:0.01,ch:['Become narrower','Stay same width','Become wider','Shift upward'],ex:'Higher confidence needs a larger critical value, so width increases.',hint:'Increasing n decreases margin of error.'},
  {id:708,unit:8,diff:'medium',topic:'Width Factors',q:'A study has margin of error 0.10 at sample size n. If sample size becomes 4n, new margin of error is:',data:null,type:'fr',ans:0.05,tol:0.005,ex:'ME scales as 1/sqrt(n), so quadrupling n halves ME.',hint:'Use t* instead of z* when σ is unknown.'},
  {id:709,unit:8,diff:'medium',topic:'CI for Mean',q:'For a small sample with unknown population sigma, which critical distribution is used for a mean CI?',data:null,type:'mc',ans:1,tol:0.01,ch:['Normal z only','Student t','Chi-square','Binomial'],ex:'For mean inference with unknown sigma, use t critical values.',hint:'Interpret: "95% of intervals built this way contain the true parameter."'},
  {id:710,unit:8,diff:'hard',topic:'Capture Rate',q:'If a 95% CI method is repeated 200 times, about how many intervals should capture the true parameter?',data:'Confidence=95%, intervals=200',type:'fr',ans:190,tol:1,ex:'Expected captures are 0.95*200=190.',hint:'ME = z*·√(p̂q̂/n). Solve for n.'}
];

allProbs[9]=[
  {id:801,unit:9,diff:'easy',topic:'Hypotheses',q:'Claim: more than 50% support. Correct hypotheses?',data:null,type:'mc',ans:1,tol:0.01,ch:['H0:p>0.50, Ha:p=0.50','H0:p=0.50, Ha:p>0.50','H0:p=0.50, Ha:p<0.50','H0:p!=0.50, Ha:p=0.50'],ex:'Null uses equality; claim direction goes in Ha.',hint:'State H₀ and H₁ first. Then compute the test statistic.'},
  {id:802,unit:9,diff:'easy',topic:'Type I',q:'Rejecting a true H0 is called:',data:null,type:'mc',ans:0,tol:0.01,ch:['Type I error','Type II error','Power','No error'],ex:'Type I error is false rejection.',hint:'z = (p̂ − p₀) / √(p₀q₀/n).'},
  {id:803,unit:9,diff:'medium',topic:'z-test',q:'Compute z for phat=0.55, p0=0.50, n=200.',data:null,type:'fr',ans:1.414,tol:0.02,ex:'z=(0.55-0.50)/sqrt(0.5*0.5/200)=1.414.',hint:'t = (x̄ − μ₀) / (s/√n).'},
  {id:804,unit:9,diff:'medium',topic:'Conclusion',q:'If p-value=0.03 and alpha=0.05, conclude:',data:null,type:'mc',ans:0,tol:0.01,ch:['Reject H0','Fail to reject H0','Accept H0 as true','Cannot test'],ex:'Since 0.03 < 0.05, reject H0.',hint:'p-value < α → reject H₀.'},
  {id:805,unit:9,diff:'hard',topic:'t-test',q:'Compute t for xbar=52, mu0=50, s=8, n=36.',data:null,type:'fr',ans:1.5,tol:0.01,ex:'t=(52-50)/(8/sqrt(36))=1.5.',hint:'Type I error: rejecting a true H₀. Its probability = α.'},
  {id:806,unit:9,diff:'easy',topic:'Type II Error',q:'A Type II error occurs when you:',data:null,type:'mc',ans:2,tol:0.01,ch:['Reject a true H0','Reject a false H0','Fail to reject a false H0','Fail to reject a true H0'],ex:'Type II error is missing a real effect (false null not rejected).',hint:'Power = P(reject H₀ | H₁ is true).'},
  {id:807,unit:9,diff:'easy',topic:'Effect of n',q:'SE for a proportion was 0.10 at n=100. If n increases to 400 (same p), new SE is:',data:'SE=0.10 at n=100, new n=400',type:'fr',ans:0.05,tol:0.005,ex:'SE scales by 1/sqrt(n), so multiplying n by 4 halves SE.',hint:'Two-sided p-value = 2 × one-tail probability.'},
  {id:808,unit:9,diff:'medium',topic:'Power',q:'Holding alpha fixed, which action usually increases test power?',data:null,type:'mc',ans:1,tol:0.01,ch:['Use a smaller sample','Use a larger sample','Increase measurement noise','Move effect closer to null'],ex:'Larger n reduces SE and makes true effects easier to detect.',hint:'Larger n → smaller SE → easier to detect a difference.'},
  {id:809,unit:9,diff:'medium',topic:'Two-Sided Test',q:'A one-sided p-value is 0.018 for a symmetric test statistic. What is the two-sided p-value?',data:'one-sided p=0.018',type:'fr',ans:0.036,tol:0.001,ex:'Two-sided doubles the one-tail area: 2*0.018=0.036.',hint:'Compare p-value to α = 0.05.'},
  {id:810,unit:9,diff:'hard',topic:'Practical Significance',q:'A study reports p<0.001 with a tiny effect size in a huge sample. Best interpretation?',data:null,type:'mc',ans:0,tol:0.01,ch:['Statistically significant but may lack practical importance','Practically important because p is tiny','No evidence against H0','Type I error is impossible'],ex:'Small p-value does not guarantee a meaningful real-world effect.',hint:'Statistical significance ≠ practical importance.'}
];

allProbs[10]=[
  {id:901,unit:10,diff:'easy',topic:'Expected Count',q:'Row total=50, column total=60, grand total=200. Expected count?',data:null,type:'fr',ans:15,tol:0.01,ex:'(50*60)/200=15.',hint:'χ² = Σ(O−E)²/E. Expected = (row total × col total)/grand total.'},
  {id:902,unit:10,diff:'easy',topic:'df',q:'Goodness-of-fit with 6 categories: df=?',data:null,type:'mc',ans:2,tol:0.01,ch:['4','6','5','10'],ex:'df=k-1=5.',hint:'df = k − 1 for goodness-of-fit.'},
  {id:903,unit:10,diff:'medium',topic:'Chi-square',q:'Observed [30,25,20,25], expected [25,25,25,25]. Find chi-square.',data:null,type:'fr',ans:2,tol:0.01,ex:'Sum (O-E)^2/E = 2.',hint:'df = (r−1)(c−1) for independence test.'},
  {id:904,unit:10,diff:'medium',topic:'Conditions',q:'Which is NOT required for chi-square tests?',data:null,type:'mc',ans:3,tol:0.01,ch:['Independent observations','Expected counts large enough','Random sample or random assignment','Normally distributed population'],ex:'Normal population is not required.',hint:'Expected count = (row total × col total) / grand total.'},
  {id:905,unit:10,diff:'hard',topic:'Interpretation',q:'Chi-square test gives p=0.012 at alpha=0.05. Conclusion?',data:null,type:'mc',ans:0,tol:0.01,ch:['Reject H0; evidence of association/difference','Fail to reject H0','Accept H0','Test invalid'],ex:'p<alpha so reject H0.',hint:'H₀: the variables are independent.'},
  {id:906,unit:10,diff:'easy',topic:'GOF Setup',q:'For a fair die goodness-of-fit test, the null hypothesis is:',data:null,type:'mc',ans:1,tol:0.01,ch:['At least one face has p>1/6','All six face probabilities equal 1/6','Observed counts must all match exactly','The die is biased toward 6'],ex:'GOF null specifies the full probability model, here p1=...=p6=1/6.',hint:'Large χ² → small p-value → evidence against independence.'},
  {id:907,unit:10,diff:'easy',topic:'Cell Contribution',q:'Compute this cell contribution to chi-square: (O-E)^2/E with O=18 and E=12.',data:'O=18, E=12',type:'fr',ans:3,tol:0.01,ex:'(18-12)^2/12 = 36/12 = 3.',hint:'Each expected count should be at least 5.'},
  {id:908,unit:10,diff:'medium',topic:'Independence vs Homogeneity',q:'Researchers compare beverage preference across three age groups sampled separately. This is a chi-square test of:',data:null,type:'mc',ans:2,tol:0.01,ch:['Goodness-of-fit','Independence only','Homogeneity','Paired means'],ex:'Different populations/groups with same categorical variable implies homogeneity.',hint:'Compare observed to expected frequencies.'},
  {id:909,unit:10,diff:'medium',topic:'Small Expected',q:'A 3x4 table has 12 expected counts, and 2 are below 5. How many meet the >=5 rule?',data:'Total cells=12, below 5 =2',type:'fr',ans:10,tol:0.01,ex:'12-2=10 cells meet the rule.',hint:'Compute χ² then compare to critical value with df = k−1.'},
  {id:910,unit:10,diff:'hard',topic:'Post-Hoc',q:'After a significant chi-square test, which cell contributes most to the statistic?',data:null,type:'mc',ans:3,tol:0.01,ch:['The cell with largest expected count','The cell with smallest observed count','Any cell in first row','The cell with largest (O-E)^2/E'],ex:'Each cell contributes (O-E)^2/E, so the largest value drives the most contribution.',hint:'H₀ for independence: P(A and B) = P(A)·P(B).'}
];

allProbs[11]=[
  {id:1001,unit:11,diff:'easy',topic:'LINE',q:'Which list gives regression inference conditions?',data:null,type:'mc',ans:1,tol:0.01,ch:['Normality only','Linearity, Independence, Normal residuals, Equal variance','Equal sample sizes only','No outliers only'],ex:'LINE is the standard checklist.',hint:'t = b₁/SE(b₁). Use regression output.'},
  {id:1002,unit:11,diff:'easy',topic:'Output Reading',q:'Output: b1=2.5, SE(b1)=0.8, t=3.125, p=0.018. Slope and SE are:',data:null,type:'mc',ans:3,tol:0.01,ch:['2.5 and 3.125','0.8 and 0.018','3.125 and 0.8','2.5 and 0.8'],ex:'Slope 2.5 and SE 0.8.',hint:'CI for slope: b₁ ± t*·SE(b₁).'},
  {id:1003,unit:11,diff:'medium',topic:'t-stat',q:'Compute t when b1=2.5 and SE(b1)=0.8.',data:null,type:'fr',ans:3.125,tol:0.01,ex:'t=b1/SE=3.125.',hint:'H₀: β₁ = 0 (no linear relationship).'},
  {id:1004,unit:11,diff:'medium',topic:'CI',q:'For b1=2.5, SE=0.8, t*=2.048, find lower 95% CI endpoint.',data:null,type:'fr',ans:0.862,tol:0.02,ex:'2.5-2.048*0.8=0.862.',hint:'R² = 1 − SS_res/SS_tot. Higher = better fit.'},
  {id:1005,unit:11,diff:'hard',topic:'Significance',q:'Slope p-value is 0.018 at alpha=0.05. Is slope significant?',data:null,type:'mc',ans:0,tol:0.01,ch:['Yes, reject H0: beta1=0','No, fail to reject H0','Cannot decide without r^2','Only if p<0.01'],ex:'0.018<0.05 so slope is significant.',hint:'Residuals should show no pattern if model is appropriate.'},
  {id:1006,unit:11,diff:'easy',topic:'R-squared Interpretation',q:'If a regression reports r^2=0.81, this means:',data:null,type:'mc',ans:2,tol:0.01,ch:['81% of x is explained by y','r equals 0.81 exactly','81% of variation in y is explained by the model','81% of points lie on the line'],ex:'r^2 is explained variation in the response variable.',hint:'SE(b₁) measures uncertainty in the slope estimate.'},
  {id:1007,unit:11,diff:'easy',topic:'df for Regression',q:'In simple linear regression with n=24 observations, what are the degrees of freedom for slope t inference?',data:'n=24',type:'fr',ans:22,tol:0.01,ex:'For simple linear regression, df=n-2=22.',hint:'Influential point: removing it changes the regression line substantially.'},
  {id:1008,unit:11,diff:'medium',topic:'Residual Analysis',q:'A residual plot shows a clear curved pattern around 0. What does this suggest?',data:null,type:'mc',ans:1,tol:0.01,ch:['Variance is exactly constant','Linear model may be inappropriate','No outliers exist','r^2 must be 1'],ex:'Systematic curvature indicates nonlinearity not captured by a straight line.',hint:'Extrapolation: using model outside the range of data.'},
  {id:1009,unit:11,diff:'medium',topic:'Prediction Interval',q:'A 95% prediction interval for a new y is (48, 72). Find its margin of error.',data:'Prediction interval=(48,72)',type:'fr',ans:12,tol:0.01,ex:'Half-width is (72-48)/2=12.',hint:'Standard error of the regression s = √(SS_res/(n−2)).'},
  {id:1010,unit:11,diff:'hard',topic:'SE Meaning',q:'Two models have the same slope b1=1.8. Model A has SE=0.9, Model B has SE=0.3. Which has stronger evidence against H0:beta1=0?',data:null,type:'mc',ans:1,tol:0.01,ch:['Model A, because larger SE is better','Model B, because smaller SE gives larger |t|','They are equal since slopes match','Cannot compare without intercept'],ex:'t=b1/SE, so Model B has much larger t and stronger evidence.',hint:'Check: residuals normally distributed, constant variance.'}
];


allProbs[12]=[
  {id:1101,unit:12,diff:'easy',topic:'Hypotheses',q:'ANOVA tests whether group means are:',data:null,type:'mc',ans:1,tol:0.01,ch:['All different from each other','Equal (H0) vs at least one different (Ha)','Greater than zero','Normally distributed'],ex:'H0: all means equal; Ha: at least one differs.',hint:'ANOVA partitions total variation into between and within group components.'},
  {id:1102,unit:12,diff:'easy',topic:'Assumptions',q:'Which is NOT an assumption of one-way ANOVA?',data:null,type:'mc',ans:2,tol:0.01,ch:['Independent samples','Equal population variances','Equal sample sizes','Normally distributed populations'],ex:'Equal sample sizes are helpful but not required.',hint:'F = MSB/MSW; larger F gives more evidence against H0.'},
  {id:1103,unit:12,diff:'medium',topic:'SSB',q:'Three groups: n=5 each. Grand mean=10. Group means: 8, 10, 12. Compute SSB.',data:'n=5 per group, grand mean=10, means: 8,10,12',type:'fr',ans:40,tol:0.1,ex:'SSB=5*(8-10)²+5*(10-10)²+5*(12-10)²=5*4+0+5*4=40.',hint:'SSB = Σnⱼ(x̄ⱼ - x̄)²'},
  {id:1104,unit:12,diff:'medium',topic:'df',q:'In a one-way ANOVA with k=4 groups and N=24 total observations, what is df_within?',data:'k=4, N=24',type:'fr',ans:20,tol:0.1,ex:'df_within = N - k = 24 - 4 = 20.',hint:'df between = k-1; df within = N-k'},
  {id:1105,unit:12,diff:'medium',topic:'F-statistic',q:'MSB=120 and MSW=30. Compute the F-statistic.',data:'MSB=120, MSW=30',type:'fr',ans:4,tol:0.01,ex:'F = MSB/MSW = 120/30 = 4.',hint:'MSB = SSB/df_between; MSW = SSW/df_within'},
  {id:1106,unit:12,diff:'medium',topic:'Interpretation',q:'An ANOVA F-test yields F=5.2 with p=0.006 at α=0.05. The conclusion is:',data:null,type:'mc',ans:0,tol:0.01,ch:['Reject H0; at least one mean differs','Fail to reject H0; all means are equal','All pairwise differences are significant','The effect size must be large'],ex:'p=0.006<0.05 so reject H0.',hint:'Rejecting ANOVA H0 means at least one pair differs; post-hoc tests identify which.'},
  {id:1107,unit:12,diff:'hard',topic:'Post-hoc',q:'After a significant ANOVA, which procedure is used to control Type I error across multiple pairwise comparisons?',data:null,type:'mc',ans:1,tol:0.01,ch:['Paired t-test only','Tukey HSD or Bonferroni correction','Another ANOVA','Chi-square test'],ex:'Post-hoc methods adjust for multiple comparisons.',hint:'Eta-squared η² = SSB/SST measures proportion of variance explained.'},
  {id:1108,unit:12,diff:'hard',topic:'Eta-squared',q:'SST=200, SSB=80. Compute eta-squared.',data:'SST=200, SSB=80',type:'fr',ans:0.4,tol:0.01,ex:'η²=SSB/SST=80/200=0.40.',hint:'η² > 0.14 is considered large effect.'},
  {id:1109,unit:12,diff:'easy',topic:'One-way vs Two-way',q:'One-way ANOVA compares means across levels of:',data:null,type:'mc',ans:0,tol:0.01,ch:['One categorical factor','Two categorical factors','Continuous predictors only','Paired groups'],ex:'One-way ANOVA has one grouping factor.',hint:'ANOVA generalizes the two-sample t-test to 3+ groups.'},
  {id:1110,unit:12,diff:'hard',topic:'SST Partition',q:'In ANOVA, SST = SSB + SSW. If SST=300 and SSW=220, what is SSB?',data:'SST=300, SSW=220',type:'fr',ans:80,tol:0.1,ex:'SSB = SST - SSW = 300 - 220 = 80.',hint:'SST = SSB + SSW always holds.'},
  {id:1111,unit:12,diff:'easy',topic:'F-statistic',q:'In a one-way ANOVA, the F-statistic is computed as:',data:null,type:'mc',ans:0,tol:0.01,ch:['MSB / MSW','MSW / MSB','SSB / SSW','SST / SSB'],ex:'F = Mean Square Between / Mean Square Within = MSB/MSW.',hint:'A large F means more between-group variance relative to within-group variance.'},
  {id:1112,unit:12,diff:'medium',topic:'MSW',q:'SSW=180 with df_within=20. Compute MSW.',data:'SSW=180, df_within=20',type:'fr',ans:9,tol:0.1,ex:'MSW = SSW / df_within = 180 / 20 = 9.',hint:'Mean Square = Sum of Squares / degrees of freedom.'},
  {id:1113,unit:12,diff:'medium',topic:'MSB',q:'SSB=60 with k=3 groups. Compute MSB.',data:'SSB=60, k=3',type:'fr',ans:30,tol:0.1,ex:'MSB = SSB / (k-1) = 60 / 2 = 30.',hint:'df_between = k - 1 where k is the number of groups.'},
  {id:1114,unit:12,diff:'hard',topic:'F-value',q:'MSB=30 and MSW=9. Compute the F-statistic.',data:'MSB=30, MSW=9',type:'fr',ans:3.33,tol:0.05,ex:'F = MSB/MSW = 30/9 = 3.33.',hint:'Compare F to the critical value from the F-distribution table using df_between and df_within.'},
  {id:1115,unit:12,diff:'hard',topic:'ANOVA Power',q:'Which change increases the power of an ANOVA test?',data:null,type:'mc',ans:2,tol:0.01,ch:['Decrease sample sizes','Decrease alpha level','Increase sample sizes or effect size','Use fewer groups'],ex:'Larger n or bigger effect size increases power to detect differences.',hint:'Power = P(reject H0 | H0 is false). It increases with n and effect size.'}
];

allProbs[13]=[
  {id:1201,unit:13,diff:'easy',topic:'When to Use',q:'Nonparametric tests are preferred when:',data:null,type:'mc',ans:2,tol:0.01,ch:['Data is perfectly normal','Sample sizes are very large','Data violates normality assumptions or is ordinal','All groups have equal variance'],ex:'Nonparametric tests make fewer distributional assumptions.',hint:'Nonparametric tests rank data, reducing sensitivity to outliers.'},
  {id:1202,unit:13,diff:'easy',topic:'Sign Test',q:'The sign test for paired data uses which distribution under H0?',data:null,type:'mc',ans:1,tol:0.01,ch:['Normal','Binomial with p=0.5','t-distribution','Chi-square'],ex:'Under H0 of no difference, + and - signs occur with probability 0.5.',hint:'Sign test: count positive differences, test if p=0.5.'},
  {id:1203,unit:13,diff:'medium',topic:'Wilcoxon',q:'The Wilcoxon signed-rank test for n=6 pairs assigns ranks to:',data:null,type:'mc',ans:0,tol:0.01,ch:['Absolute differences, then sums positive and negative rank groups','Raw differences directly','Only positive pairs','Only the median'],ex:'Rank absolute differences; sum positive-sign ranks vs negative-sign ranks.',hint:'Wilcoxon signed-rank test is more powerful than sign test.'},
  {id:1204,unit:13,diff:'medium',topic:'Mann-Whitney',q:'Mann-Whitney U test compares:',data:null,type:'mc',ans:1,tol:0.01,ch:['Two related samples','Two independent samples without normality assumption','Three or more groups','One sample to a population'],ex:'Mann-Whitney U is the nonparametric alternative to the two-sample t-test.',hint:'U = n₁n₂ + n₁(n₁+1)/2 - R₁'},
  {id:1205,unit:13,diff:'medium',topic:'Ranks',q:'Ranks for values 3, 7, 7, 12 are (average ranks for ties):',data:null,type:'mc',ans:2,tol:0.01,ch:['1,2,3,4','1,2,2,4','1,2.5,2.5,4','1,3,3,4'],ex:'Values 7 and 7 tie for ranks 2 and 3, so both get rank 2.5.',hint:'Tied values receive average of their ranks.'},
  {id:1206,unit:13,diff:'medium',topic:'Kruskal-Wallis',q:'The Kruskal-Wallis test extends which procedure to 3+ groups?',data:null,type:'mc',ans:2,tol:0.01,ch:['Sign test','Wilcoxon signed-rank','Mann-Whitney U','Spearman rank correlation'],ex:'Kruskal-Wallis is the nonparametric equivalent of one-way ANOVA.',hint:'Kruskal-Wallis uses overall ranks across all groups.'},
  {id:1207,unit:13,diff:'hard',topic:'Spearman',q:'For 4 pairs, d² = {1,4,0,1}. Compute Spearman rₛ.',data:'n=4, Σd²=6',type:'fr',ans:0.4,tol:0.02,ex:'rₛ=1-6*6/(4*(16-1))=1-36/60=1-0.6=0.4.',hint:'rₛ = 1 − 6Σdᵢ²/n(n²−1)'},
  {id:1208,unit:13,diff:'easy',topic:'Parametric vs Nonparametric',q:'Compared to parametric tests, nonparametric tests generally have:',data:null,type:'mc',ans:1,tol:0.01,ch:['Higher power when normality holds','Lower power when normality holds','Same power regardless','No assumptions at all'],ex:'Parametric tests are more powerful under normality; nonparametric is more robust.',hint:'Nonparametric tests sacrifice some power for robustness.'},
  {id:1209,unit:13,diff:'easy',topic:'Ordinal Data',q:'Which data type is most naturally suited to nonparametric analysis?',data:null,type:'mc',ans:2,tol:0.01,ch:['Continuous ratio scale data','Normally distributed interval data','Ordinal rankings like satisfaction scores','Count data with large n'],ex:'Ordinal data lacks true distances, making ranks appropriate.',hint:'Ranking data removes the need for distributional assumptions.'},
  {id:1210,unit:13,diff:'hard',topic:'Interpretation',q:'A Mann-Whitney test yields p=0.032 at α=0.05. The conclusion is:',data:null,type:'mc',ans:0,tol:0.01,ch:['Reject H0; distributions differ significantly','Fail to reject H0','The medians are exactly equal','Parametric test is required'],ex:'p=0.032<0.05, reject H0.',hint:'Mann-Whitney tests whether one population tends to produce larger values.'},
  {id:1211,unit:13,diff:'easy',topic:'Sign Test',q:'The sign test is based on:',data:null,type:'mc',ans:1,tol:0.01,ch:['Exact values of observations','Only the signs of differences from a median','Ranks of observations','Normal distribution of data'],ex:'The sign test uses only + or - signs of deviations from the hypothesized median.',hint:'Sign test: count positives and negatives, test if proportion of positives = 0.5.'},
  {id:1212,unit:13,diff:'medium',topic:'Wilcoxon Signed-Rank',q:'The Wilcoxon signed-rank test is used when:',data:null,type:'mc',ans:2,tol:0.01,ch:['Comparing two independent samples','Data is nominal','Comparing paired differences that are symmetric but not necessarily normal','Data follows an exponential distribution'],ex:'Wilcoxon signed-rank is a paired test that uses both sign and magnitude of differences.',hint:'Wilcoxon signed-rank is more powerful than sign test when differences are symmetric.'},
  {id:1213,unit:13,diff:'medium',topic:'Rank Transformation',q:'Ranks for the values {4, 1, 9, 6}: rank the data from smallest to largest. What rank is assigned to 6?',data:'{4, 1, 9, 6}',type:'fr',ans:3,tol:0.01,ex:'Sorted: 1(rank 1), 4(rank 2), 6(rank 3), 9(rank 4). So 6 gets rank 3.',hint:'Assign rank 1 to the smallest, rank n to the largest.'},
  {id:1214,unit:13,diff:'hard',topic:'When to Use',q:'A researcher has 5 observations per group and the data is heavily skewed. The best test to compare two groups is:',data:null,type:'mc',ans:2,tol:0.01,ch:['Two-sample t-test','Paired t-test','Mann-Whitney U test','One-way ANOVA'],ex:'Small n + heavy skew → normality assumption fails → use nonparametric Mann-Whitney.',hint:'With small samples and non-normal data, nonparametric tests are preferred.'},
  {id:1215,unit:13,diff:'hard',topic:'Power Comparison',q:'When the population is normally distributed, a nonparametric test compared to the equivalent parametric test has:',data:null,type:'mc',ans:1,tol:0.01,ch:['Higher power always','About 95% efficiency (slightly lower power)','The same power','Much lower power (about 50% efficiency)'],ex:'The Wilcoxon/Mann-Whitney tests achieve about 95% of the power of t-tests under normality.',hint:'Nonparametric tests are robust but slightly less efficient under ideal parametric conditions.'}
];

allProbs[14]=[
  {id:1301,unit:14,diff:'easy',topic:'Prior',q:'In Bayesian statistics, the prior probability represents:',data:null,type:'mc',ans:0,tol:0.01,ch:['Belief about a parameter before seeing data','The sample proportion','P-value from classical testing','The posterior mean'],ex:'Prior = P(H) — belief before observing evidence.',hint:'Posterior = Prior × Likelihood (normalized).'},
  {id:1302,unit:14,diff:'easy',topic:'Bayes Theorem',q:'Bayes Theorem states:',data:null,type:'mc',ans:2,tol:0.01,ch:['P(H)=P(E|H)','P(E|H)=P(H|E)P(E)','P(H|E)=P(E|H)P(H)/P(E)','P(H|E)=P(H)+P(E)'],ex:'Bayes: P(H|E)=P(E|H)P(H)/P(E).',hint:'P(E) in denominator is the normalizing constant.'},
  {id:1303,unit:14,diff:'medium',topic:'Calculation',q:'P(Disease)=0.01, P(Positive|Disease)=0.95, P(Positive|No Disease)=0.05. Compute P(Disease|Positive).',data:'P(D)=0.01, P(+|D)=0.95, P(+|¬D)=0.05',type:'fr',ans:0.161,tol:0.005,ex:'P(+)=0.95*0.01+0.05*0.99=0.059. P(D|+)=0.95*0.01/0.059≈0.161.',hint:'P(E) = P(E|H)P(H) + P(E|¬H)P(¬H)'},
  {id:1304,unit:14,diff:'medium',topic:'Posterior Update',q:'After observing data, the posterior distribution becomes the new _____ for the next update.',data:null,type:'mc',ans:1,tol:0.01,ch:['Likelihood','Prior','Evidence','P-value'],ex:'Sequential Bayesian updating uses posterior as the next prior.',hint:'Conjugate priors allow closed-form posterior computation.'},
  {id:1305,unit:14,diff:'easy',topic:'Comparison',q:'A key difference between frequentist and Bayesian inference is that Bayesian:',data:null,type:'mc',ans:0,tol:0.01,ch:['Treats parameters as random variables with distributions','Only uses large samples','Never requires data','Uses only p-values'],ex:'Frequentists treat parameters as fixed; Bayesians assign probability distributions to them.',hint:'Credible interval: P(a ≤ θ ≤ b | data) = 0.95 — a probabilistic statement.'},
  {id:1306,unit:14,diff:'medium',topic:'Credible Interval',q:'A 95% Bayesian credible interval means:',data:null,type:'mc',ans:1,tol:0.01,ch:['If we repeated sampling, 95% of intervals would contain the true value','Given the data, there is 95% probability the parameter lies in the interval','The parameter equals the center value with 95% confidence','P-value is below 0.05'],ex:'Credible interval has a direct probability interpretation unlike confidence intervals.',hint:'Frequentist CI: procedure captures true value 95% of the time.'},
  {id:1307,unit:14,diff:'medium',topic:'Base Rate',q:'Ignoring the prior probability of an event is called the:',data:null,type:'mc',ans:2,tol:0.01,ch:['Posterior fallacy','Likelihood error','Base rate fallacy','Selection bias'],ex:'Base rate fallacy occurs when the prior (base rate) is ignored.',hint:'Always use P(H) when computing P(H|E).'},
  {id:1308,unit:14,diff:'hard',topic:'Conjugate Prior',q:'For binomial likelihood, the conjugate prior is:',data:null,type:'mc',ans:1,tol:0.01,ch:['Normal distribution','Beta distribution','Gamma distribution','Exponential distribution'],ex:'Beta prior × Binomial likelihood = Beta posterior. Beta is conjugate to Binomial.',hint:'Conjugate prior: prior and posterior have same distributional form.'},
  {id:1309,unit:14,diff:'hard',topic:'Prior Sensitivity',q:'A flat (uniform) prior means:',data:null,type:'mc',ans:0,tol:0.01,ch:['All parameter values are equally likely before seeing data','No data is needed','The posterior equals the likelihood','The mean equals zero'],ex:'Flat prior: maximum ignorance, all values equally probable initially.',hint:'With large samples, posterior is dominated by likelihood regardless of prior.'},
  {id:1310,unit:14,diff:'easy',topic:'Interpretation',q:'The posterior distribution P(θ|data) summarizes:',data:null,type:'mc',ans:2,tol:0.01,ch:['Only the prior belief','Only the observed data','Updated belief about the parameter given the data','The p-value of the test'],ex:'Posterior combines prior knowledge with evidence from data.',hint:'As sample size grows, posterior concentrates around the true parameter value.'},
  {id:1311,unit:14,diff:'easy',topic:'Bayesian vs Frequentist',q:'In Bayesian statistics, parameters are treated as:',data:null,type:'mc',ans:1,tol:0.01,ch:['Fixed unknown constants','Random variables with probability distributions','Always normally distributed','Known from prior experiments'],ex:'Bayesian statistics treats parameters as random variables, enabling probability statements about them.',hint:'Frequentist parameters are fixed; Bayesian parameters have distributions.'},
  {id:1312,unit:14,diff:'medium',topic:'Bayesian Updating',q:'Prior: P(H)=0.3. Likelihood ratio P(E|H)/P(E|not H)=4. After seeing E, which best describes the posterior?',data:null,type:'mc',ans:2,tol:0.01,ch:['Posterior < 0.3','Posterior = 0.3','Posterior > 0.3','Cannot determine'],ex:'Likelihood ratio > 1 increases the posterior probability above the prior.',hint:'Bayes theorem: posterior = likelihood * prior / evidence. Higher likelihood ratio pushes posterior up.'},
  {id:1313,unit:14,diff:'medium',topic:'Beta Distribution',q:'A Beta(3,7) prior has mean:',data:'Beta(α=3, β=7)',type:'fr',ans:0.3,tol:0.01,ex:'Mean of Beta(α,β) = α/(α+β) = 3/(3+7) = 0.3.',hint:'Beta(α,β) mean = α/(α+β). Beta(1,1) is the uniform prior.'},
  {id:1314,unit:14,diff:'hard',topic:'Posterior Update',q:'Prior Beta(2,3). Observe 4 successes and 6 failures. Posterior mean is:',data:'Prior Beta(2,3), 4 successes, 6 failures',type:'fr',ans:0.4,tol:0.01,ex:'Posterior Beta(2+4, 3+6) = Beta(6,9). Mean = 6/(6+9) = 0.4.',hint:'For Beta-Binomial: posterior = Beta(α+successes, β+failures). Mean = α_new/(α_new+β_new).'},
  {id:1315,unit:14,diff:'hard',topic:'MAP Estimate',q:'The Maximum A Posteriori (MAP) estimate is:',data:null,type:'mc',ans:0,tol:0.01,ch:['The mode of the posterior distribution','The mean of the prior','The sample mean from the data','The median of the likelihood'],ex:'MAP picks the most likely parameter value given the posterior.',hint:'MAP = argmax P(θ|data). With flat prior, MAP = MLE.'}
];

const _canvasCache={};
function prepCanvas2(id,h){
  const c=document.getElementById(id);
  if(!c||!c.getContext)return null;
  const ctx=c.getContext('2d');
  const dpr=window.devicePixelRatio||1;
  const W=c.clientWidth||c.offsetWidth||800;
  const newW=Math.max(1,Math.round(W*dpr));
  const newH=Math.max(1,Math.round(h*dpr));
  const cacheKey=id;
  if(_canvasCache[cacheKey]&&_canvasCache[cacheKey].w===newW&&_canvasCache[cacheKey].h===newH){
    if(typeof ctx.setTransform==='function')ctx.setTransform(dpr,0,0,dpr,0,0);
    else ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,h);
    return {c,ctx,W,H:h};
  }
  c.width=newW;
  c.height=newH;
  c.style.height=h+'px';
  _canvasCache[cacheKey]={w:newW,h:newH};
  if(typeof ctx.setTransform==='function')ctx.setTransform(dpr,0,0,dpr,0,0);
  else ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,W,h);
  return {c,ctx,W,H:h};
}

function _recordVizHistory(unit){
  if(typeof localStorage==='undefined')return;
  try{
    var hist=JSON.parse(localStorage.getItem('sh-viz-history')||'[]');
    hist=hist.filter(function(u){return u!==unit;});
    hist.unshift(unit);
    if(hist.length>5)hist=hist.slice(0,5);
    localStorage.setItem('sh-viz-history',JSON.stringify(hist));
  }catch(e){}
}
function toggleVizInfo(){
  if(typeof document==='undefined')return;
  var body=document.getElementById('vizUnitInfoBody');
  var btn=document.querySelector('.viz-unit-info-toggle');
  if(!body)return;
  var open=body.style.display!=='none';
  body.style.display=open?'none':'';
  if(btn)btn.textContent=(open?'\u2139 Unit Info \u25B6':'\u2139 Unit Info \u25BC');
}
function buildVizUnitInfo(unit){
  if(typeof document==='undefined')return;
  var body=document.getElementById('vizUnitInfoBody');if(!body)return;
  var name=typeof UNIT_META!=='undefined'&&UNIT_META[unit]?UNIT_META[unit].name:'';
  var probs=allProbs[unit]||[];
  var topics=[...new Set(probs.map(function(p){return p.topic;}))].slice(0,6);
  var xpAvail=probs.reduce(function(sum,p){return sum+(p.diff==='easy'?XP_TABLE.easy:p.diff==='medium'?XP_TABLE.medium:XP_TABLE.hard);},0);
  body.innerHTML='<div class="vui-name">Unit '+unit+': '+name+'</div>'
    +'<div class="vui-row"><span class="vui-label">Problems:</span><span class="vui-val">'+probs.length+'</span></div>'
    +'<div class="vui-row"><span class="vui-label">XP Available:</span><span class="vui-val">'+xpAvail+'</span></div>'
    +'<div class="vui-row"><span class="vui-label">Topics:</span><span class="vui-val">'+topics.join(', ')+'</span></div>';
}
function buildVizDataSummary(unit){
  if(typeof document==='undefined')return;
  var el=document.getElementById('vizDataSummary');if(!el)return;
  var probs=allProbs[unit]||[];
  if(!probs.length){el.innerHTML='';return;}
  var easy=probs.filter(function(p){return p.diff==='easy';}).length;
  var medium=probs.filter(function(p){return p.diff==='medium';}).length;
  var hard=probs.filter(function(p){return p.diff==='hard';}).length;
  var xp=probs.reduce(function(s,p){return s+(p.diff==='easy'?XP_TABLE.easy:p.diff==='medium'?XP_TABLE.medium:XP_TABLE.hard);},0);
  var formCount=(typeof FORMULAS!=='undefined'&&FORMULAS[unit])?(FORMULAS[unit].length):0;
  var topics=[...new Set(probs.map(function(p){return p.topic;}))].length;
  var name=typeof UNIT_META!=='undefined'&&UNIT_META[unit]?UNIT_META[unit].name:'';
  el.innerHTML='<table class="viz-summary-table">'
    +'<caption>Unit '+unit+' — '+name+'</caption>'
    +'<thead><tr><th>Metric</th><th>Value</th></tr></thead>'
    +'<tbody>'
    +'<tr><td>Total Problems</td><td>'+probs.length+'</td></tr>'
    +'<tr><td>Easy / Medium / Hard</td><td><span class="vs-easy">'+easy+'</span> / <span class="vs-medium">'+medium+'</span> / <span class="vs-hard">'+hard+'</span></td></tr>'
    +'<tr><td>XP Available</td><td>'+xp+'</td></tr>'
    +'<tr><td>Unique Topics</td><td>'+topics+'</td></tr>'
    +'<tr><td>Formulas</td><td>'+formCount+'</td></tr>'
    +'</tbody></table>';
}
function buildVizHistory(){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  var row=document.getElementById('vizHistoryRow');
  if(!row)return;
  var hist=[];
  try{hist=JSON.parse(localStorage.getItem('sh-viz-history')||'[]');}catch(e){}
  if(!hist.length){row.style.display='none';return;}
  row.style.display='flex';
  var html='<span class="viz-history-label">Recently:</span>';
  hist.forEach(function(u){
    var name=typeof UNIT_META!=='undefined'&&UNIT_META[u]?UNIT_META[u].name:'Unit '+u;
    html+='<button class="viz-history-chip" onclick="setUnit('+u+')">Unit '+u+': '+name+'</button>';
  });
  row.innerHTML=html;
}
function copyVizLink(){
  if(typeof navigator==='undefined'||typeof navigator.clipboard==='undefined'){return;}
  var href=(typeof window!=='undefined'&&window.location)?window.location.href:'';
  navigator.clipboard.writeText(href).then(function(){showToast('Link copied!');}).catch(function(){showToast('Could not copy link');});
}
function toggleVizFullscreen(){
  if(typeof document==='undefined')return;
  var panel=document.querySelector('#viz-panels .sub-panel.active');if(!panel)return;
  if(typeof document.fullscreenEnabled!=='undefined'&&document.fullscreenEnabled){
    if(!document.fullscreenElement){
      if(panel.requestFullscreen)panel.requestFullscreen();
      else if(panel.webkitRequestFullscreen)panel.webkitRequestFullscreen();
    }else{
      if(document.exitFullscreen)document.exitFullscreen();
    }
  }else{
    showToast('Fullscreen not supported in this browser.');
  }
}
function saveVizScreenshot(){
  if(typeof document==='undefined')return;
  // Find the active sub-panel canvas
  var panel=document.querySelector('#viz-panels .sub-panel.active');
  var canvas=panel?panel.querySelector('canvas'):null;
  if(!canvas){showToast('No canvas found to save.');return;}
  try{
    var url=canvas.toDataURL('image/png');
    if(typeof Blob==='undefined'){showToast('Download not supported in this browser.');return;}
    var a=document.createElement('a');
    a.href=url;
    a.download='stats-hub-visualizer.png';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    showToast('Visualizer saved as PNG!');
  }catch(e){showToast('Could not save image.');}
}
function vizPracticeBtn(unit){
  return `<div class="viz-practice-link"><button class="viz-practice-btn" onclick="goPage('practice');setUnit(${unit});">Practice Unit ${unit}: ${UNIT_META[unit]?UNIT_META[unit].name:''} →</button><button class="viz-share-btn" onclick="copyVizLink()" title="Copy link to this visualizer">📋 Copy Link</button></div>`;
}

function vizTemplate(unit){
  if(unit===2){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Z-Score Explorer</div><div class="viz-desc">Adjust x, mu, and sigma to see left and right tail areas in real time.</div><canvas id="zCanvas" height="320"></canvas><div class="controls"><div class="cg"><span class="cl">x <span class="sv-val" id="u2XVal">72</span></span><input type="range" id="u2X" min="20" max="120" value="72" step="1" oninput="drawZscore()"></div><div class="cg"><span class="cl">mu <span class="sv-val" id="u2MuVal">70</span></span><input type="range" id="u2Mu" min="30" max="100" value="70" step="1" oninput="drawZscore()"></div><div class="cg"><span class="cl">sigma <span class="sv-val" id="u2SigVal">10</span></span><input type="range" id="u2Sig" min="1" max="25" value="10" step="1" oninput="drawZscore()"></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u2Z">-</div><div class="sl">z-score</div></div><div class="sc"><div class="sv sv-amber" id="u2Left">-</div><div class="sl">percentile</div></div><div class="sc"><div class="sv sv-pink" id="u2Right">-</div><div class="sl">right area</div></div></div></div><div class="explain"><h3>Formula</h3><p>z converts raw score to standard-deviation units.</p><div class="formula">z = (x - mu) / sigma</div></div></div>`+vizPracticeBtn(unit);
  }
  if(unit===3){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Interactive Scatterplot</div><div class="viz-desc">Click to add points. Presets load example patterns for positive, negative, or no correlation.</div><canvas id="scatterCanvas" height="330"></canvas><div class="controls"><div class="cg"><span class="cl">Presets</span><div class="viz-btn-group"><button type="button" data-u3preset="positive" onclick="setScatterPreset('positive')">Positive</button><button type="button" data-u3preset="negative" onclick="setScatterPreset('negative')">Negative</button><button type="button" data-u3preset="none" onclick="setScatterPreset('none')">None</button><button type="button" onclick="clearScatter()">Clear</button></div></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u3Eq">-</div><div class="sl">regression line</div></div><div class="sc"><div class="sv sv-amber" id="u3R">-</div><div class="sl">r</div></div><div class="sc"><div class="sv sv-pink" id="u3R2">-</div><div class="sl">r^2</div></div><div class="sc"><div class="sv sv-purple" id="u3N">-</div><div class="sl">n</div></div></div></div><div class="explain"><h3>Least Squares Line</h3><p>Line updates from clicked points and minimizes squared residuals.</p><div class="formula" id="u3Formula">yhat = a + bx</div></div></div>`+vizPracticeBtn(unit);
  }
  if(unit===4){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Sampling Simulator</div><div class="viz-desc">Population has 100 dots in 4 groups. Choose a method and compare sample composition.</div><canvas id="samplingCanvas" height="330"></canvas><div class="controls"><div class="cg"><span class="cl">Method</span><div class="viz-btn-group"><button type="button" data-u4method="srs" onclick="runSampling('srs')">SRS</button><button type="button" data-u4method="stratified" onclick="runSampling('stratified')">Stratified</button><button type="button" data-u4method="cluster" onclick="runSampling('cluster')">Cluster</button><button type="button" data-u4method="systematic" onclick="runSampling('systematic')">Systematic</button><button type="button" onclick="resetSampling()">Reset</button></div></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u4Pop">-</div><div class="sl">population composition</div></div><div class="sc"><div class="sv sv-amber" id="u4Sample">-</div><div class="sl">sample composition</div></div><div class="sc"><div class="sv sv-pink" id="u4Method">-</div><div class="sl">method</div></div><div class="sc"><div class="sv sv-purple" id="u4Size">-</div><div class="sl">sample size</div></div></div></div><div class="explain"><h3>Sampling Design Tradeoffs</h3><p>Method choice can bias representation even when sample size is unchanged.</p><div class="formula">Compare sample mix to population mix.</div></div></div>`+vizPracticeBtn(unit);
  }
  if(unit===5){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Venn Diagram Probability</div><div class="viz-desc">Set P(A), P(B), and P(A and B) and watch conditional probabilities update.</div><canvas id="vennCanvas" height="320"></canvas><div class="controls"><div class="cg"><span class="cl">P(A) <span class="sv-val" id="u5PAVal">0.55</span></span><input type="range" id="u5PA" min="0" max="1" step="0.01" value="0.55" oninput="drawVenn()"></div><div class="cg"><span class="cl">P(B) <span class="sv-val" id="u5PBVal">0.45</span></span><input type="range" id="u5PB" min="0" max="1" step="0.01" value="0.45" oninput="drawVenn()"></div><div class="cg"><span class="cl">P(A and B) <span class="sv-val" id="u5PABVal">0.20</span></span><input type="range" id="u5PAB" min="0" max="0.45" step="0.01" value="0.20" oninput="drawVenn()"></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u5Union">-</div><div class="sl">P(A union B)</div></div><div class="sc"><div class="sv sv-amber" id="u5AcondB">-</div><div class="sl">P(A|B)</div></div><div class="sc"><div class="sv sv-pink" id="u5BcondA">-</div><div class="sl">P(B|A)</div></div><div class="sc"><div class="sv sv-purple" id="u5Comp">-</div><div class="sl">P(A')</div></div></div></div><div class="explain"><h3>Independence</h3><p id="u5Independence">Independent? Compare P(A and B) to P(A)P(B).</p><div class="formula">P(A union B) = P(A) + P(B) - P(A and B)</div></div></div>`+vizPracticeBtn(unit);
  }
  if(unit===6){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Binomial Explorer</div><div class="viz-desc">PMF bars for X~Bin(n,p), with cumulative probability P(X<=k).</div><canvas id="binomCanvas" height="330"></canvas><div class="controls"><div class="cg"><span class="cl">n <span class="sv-val" id="u6NVal">12</span></span><input type="range" id="u6N" min="1" max="40" value="12" step="1" oninput="drawBinom()"></div><div class="cg"><span class="cl">p <span class="sv-val" id="u6PVal">0.40</span></span><input type="range" id="u6P" min="0.01" max="0.99" value="0.40" step="0.01" oninput="drawBinom()"></div><div class="cg"><span class="cl">k <span class="sv-val" id="u6KVal">4</span></span><input type="range" id="u6K" min="0" max="12" value="4" step="1" oninput="drawBinom()"></div><div class="cg"><span class="cl">Overlay</span><label class="viz-inline"><input type="checkbox" id="u6Normal" onchange="drawBinom()"> Normal approximation</label></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u6Mean">-</div><div class="sl">E(X)=np</div></div><div class="sc"><div class="sv sv-amber" id="u6SD">-</div><div class="sl">SD(X)=sqrt(npq)</div></div><div class="sc"><div class="sv sv-pink" id="u6Cum">-</div><div class="sl">P(X<=k)</div></div></div></div><div class="explain"><h3>Binomial PMF</h3><p>Each bar is P(X=k) for one count of successes.</p><div class="formula">P(X=k) = C(n,k)p^k(1-p)^(n-k)</div></div></div>`+vizPracticeBtn(unit);
  }
  if(unit===7){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">CLT Simulator</div><div class="viz-desc">Top: population. Bottom: sampling distribution of xbar built from repeated samples.</div><div class="viz-split-label">Population</div><canvas id="cltPopCanvas" height="180"></canvas><div class="viz-split-label">Sampling distribution of xbar</div><canvas id="cltSampleCanvas" height="180"></canvas><div class="controls"><div class="cg"><span class="cl">Population shape</span><select id="u7Shape" onchange="setCLTShape(this.value)"><option value="uniform">Uniform</option><option value="right">Right-skewed</option><option value="bimodal">Bimodal</option></select></div><div class="cg"><span class="cl">Sample size n</span><select id="u7N" onchange="setCLTN(+this.value)"><option value="1">1</option><option value="5" selected>5</option><option value="10">10</option><option value="30">30</option><option value="50">50</option></select></div><div class="cg"><span class="cl">Sampling</span><div class="viz-btn-group"><button type="button" onclick="cltDraw(1)">Draw 1 Sample</button><button type="button" onclick="cltDraw(100)">Draw 100 Samples</button><button type="button" onclick="cltReset()">Reset</button></div></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u7PopMu">-</div><div class="sl">population mu</div></div><div class="sc"><div class="sv sv-amber" id="u7MeanXbar">-</div><div class="sl">mean of xbars</div></div><div class="sc"><div class="sv sv-pink" id="u7SE">-</div><div class="sl">SE obs/theory</div></div><div class="sc"><div class="sv sv-purple" id="u7Count">-</div><div class="sl">number of xbars</div></div></div></div><div class="explain"><h3>Central Limit Theorem</h3><p>As n increases, xbar becomes more normal and less variable.</p><div class="formula">SE(xbar) = sigma / sqrt(n)</div></div></div>`+vizPracticeBtn(unit);
  }
  if(unit===8){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">CI Coverage Simulator</div><div class="viz-desc">Run 100 intervals and count captures of the true proportion.</div><canvas id="covCanvas" height="360"></canvas><div class="controls"><div class="cg"><span class="cl">True p <span class="sv-val" id="u8PVal">0.50</span></span><input type="range" id="u8P" min="0.10" max="0.90" step="0.01" value="0.50" oninput="drawCoverage()"></div><div class="cg"><span class="cl">Confidence</span><select id="u8CL" onchange="drawCoverage()"><option value="0.90">90%</option><option value="0.95" selected>95%</option><option value="0.99">99%</option></select></div><div class="cg"><span class="cl">Sample size n <span class="sv-val" id="u8NVal">100</span></span><input type="range" id="u8N" min="20" max="500" step="1" value="100" oninput="drawCoverage()"></div><div class="cg"><span class="cl">Simulation</span><button type="button" onclick="runCoverage()">Run 100 Simulations</button></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u8Capture">-</div><div class="sl">capture count</div></div><div class="sc"><div class="sv sv-amber" id="u8Actual">-</div><div class="sl">actual rate</div></div><div class="sc"><div class="sv sv-pink" id="u8Nominal">-</div><div class="sl">nominal rate</div></div></div></div><div class="explain"><h3>Coverage Meaning</h3><p>Confidence level is long-run capture rate of the method.</p><div class="formula">phat +/- z* sqrt(phat(1-phat)/n)</div></div></div>`+vizPracticeBtn(unit);
  }
  if(unit===9){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">P-Value Visualizer</div><div class="viz-desc">Select tail type, test statistic, and alpha to compare p-value against critical boundaries.</div><canvas id="pvalCanvas" height="330"></canvas><div class="controls"><div class="cg"><span class="cl">Tail</span><select id="u9Tail" onchange="drawPValue()"><option value="left">Left-tail</option><option value="right" selected>Right-tail</option><option value="two">Two-tail</option></select></div><div class="cg"><span class="cl">z <span class="sv-val" id="u9ZVal">1.20</span></span><input type="range" id="u9Z" min="-4" max="4" step="0.01" value="1.20" oninput="drawPValue()"></div><div class="cg"><span class="cl">alpha</span><select id="u9Alpha" onchange="drawPValue()"><option value="0.01">0.01</option><option value="0.05" selected>0.05</option><option value="0.10">0.10</option></select></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u9Stat">-</div><div class="sl">test statistic</div></div><div class="sc"><div class="sv sv-amber" id="u9P">-</div><div class="sl">p-value</div></div><div class="sc"><div class="sv sv-pink" id="u9Decision">-</div><div class="sl">decision</div></div></div></div><div class="explain"><h3>Decision Rule</h3><p id="u9CritText">Reject H0 when p-value <= alpha.</p><div class="formula">Compare p-value to alpha.</div></div></div>`+vizPracticeBtn(unit);
  }
  if(unit===10){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Chi-Square Distribution Explorer</div><div class="viz-desc">Use df and chi-square sliders to see the right-tail p-value and critical cutoffs.</div><canvas id="chiCanvas" height="330"></canvas><div class="controls"><div class="cg"><span class="cl">df <span class="sv-val" id="u10DfVal">4</span></span><input type="range" id="u10Df" min="1" max="15" value="4" step="1" oninput="drawChiSq()"></div><div class="cg"><span class="cl">chi^2 value <span class="sv-val" id="u10XVal">6.0</span></span><input type="range" id="u10X" min="0" max="30" value="6.0" step="0.1" oninput="drawChiSq()"></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u10DfStat">-</div><div class="sl">df</div></div><div class="sc"><div class="sv sv-amber" id="u10XStat">-</div><div class="sl">chi^2</div></div><div class="sc"><div class="sv sv-pink" id="u10PStat">-</div><div class="sl">p-value</div></div></div></div><div class="explain"><h3>Right Tail</h3><p id="u10CritText">Critical values shown for alpha=0.05 and 0.01.</p><div class="formula">p-value = P(Chi-square_df >= observed)</div></div></div>`+vizPracticeBtn(unit);
  }
  if(unit===12){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">ANOVA Visualizer</div><div class="viz-desc">Adjust group means and within-group spread to see F-statistic update in real time.</div><canvas id="anovaCanvas" height="320"></canvas><div class="controls"><div class="cg"><span class="cl">Group 1 Mean <span class="sv-val" id="u12M1Val">8</span></span><input type="range" id="u12M1" min="1" max="20" value="8" step="0.5" oninput="drawAnova()"></div><div class="cg"><span class="cl">Group 2 Mean <span class="sv-val" id="u12M2Val">10</span></span><input type="range" id="u12M2" min="1" max="20" value="10" step="0.5" oninput="drawAnova()"></div><div class="cg"><span class="cl">Group 3 Mean <span class="sv-val" id="u12M3Val">12</span></span><input type="range" id="u12M3" min="1" max="20" value="12" step="0.5" oninput="drawAnova()"></div><div class="cg"><span class="cl">Within-group SD <span class="sv-val" id="u12SDVal">2</span></span><input type="range" id="u12SD" min="0.5" max="6" value="2" step="0.1" oninput="drawAnova()"></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u12SSB">-</div><div class="sl">SSB</div></div><div class="sc"><div class="sv sv-pink" id="u12SSW">-</div><div class="sl">SSW</div></div><div class="sc"><div class="sv sv-amber" id="u12F">-</div><div class="sl">F-stat</div></div><div class="sc"><div class="sv sv-green" id="u12Eta">-</div><div class="sl">η²</div></div></div></div><div class="explain"><h3>ANOVA Formula</h3><p>F tests if between-group variance exceeds within-group variance.</p><div class="formula">F = MSB/MSW = (SSB/df_B)/(SSW/df_W)</div></div></div>`+vizPracticeBtn(unit);
  }
  if(unit===13){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Rank-Based vs Parametric Test</div><div class="viz-desc">See how rankings make nonparametric tests robust to skewness and outliers.</div><canvas id="nonparamCanvas" height="320"></canvas><div class="controls"><div class="cg"><span class="cl">Distribution Shape</span><select id="u13Shape" onchange="drawNonparam()"><option value="normal">Normal</option><option value="skew">Right-skewed</option><option value="outlier">With Outlier</option></select></div><div class="cg"><span class="cl">Group Shift <span class="sv-val" id="u13ShiftVal">2</span></span><input type="range" id="u13Shift" min="0" max="6" value="2" step="0.5" oninput="drawNonparam()"></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u13RankDiff">-</div><div class="sl">rank diff</div></div><div class="sc"><div class="sv sv-amber" id="u13MeanDiff">-</div><div class="sl">mean diff</div></div></div></div><div class="explain"><h3>Ranking Data</h3><p>Ranks replace actual values, removing sensitivity to extreme values and skewness.</p><div class="formula">rₛ = 1 − 6Σdᵢ²/n(n²−1)</div></div></div>`+vizPracticeBtn(unit);
  }
  if(unit===14){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Bayesian Updating</div><div class="viz-desc">Watch how prior, likelihood, and posterior interact as you adjust evidence strength.</div><canvas id="bayesCanvas" height="320"></canvas><div class="controls"><div class="cg"><span class="cl">Prior Strength <span class="sv-val" id="u14PriorVal">5</span></span><input type="range" id="u14Prior" min="1" max="20" value="5" step="1" oninput="drawBayes()"></div><div class="cg"><span class="cl">Observed p̂ <span class="sv-val" id="u14DataVal">0.70</span></span><input type="range" id="u14Data" min="0.01" max="0.99" value="0.70" step="0.01" oninput="drawBayes()"></div><div class="cg"><span class="cl">Sample Size <span class="sv-val" id="u14NVal">20</span></span><input type="range" id="u14N" min="1" max="100" value="20" step="1" oninput="drawBayes()"></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u14PostMean">-</div><div class="sl">posterior mean</div></div><div class="sc"><div class="sv sv-amber" id="u14PostSD">-</div><div class="sl">posterior SD</div></div><div class="sc"><div class="sv sv-pink" id="u14CI">-</div><div class="sl">95% CI</div></div></div></div><div class="explain"><h3>Bayes Theorem</h3><p>Prior belief updated by data evidence yields the posterior.</p><div class="formula">P(θ|data) ∝ P(data|θ) · P(θ)</div></div></div>`+vizPracticeBtn(unit);
  }
  if(unit===11){
    return `<div class="sub-panel active"><div class="viz-box"><div class="viz-title">Regression Output Interpreter</div><div class="viz-desc">Choose a dataset preset and hover highlighted values for quick interpretation tips.</div><canvas id="regCanvas" height="340"></canvas><div class="controls"><div class="cg"><span class="cl">Preset dataset</span><select id="u11Preset" onchange="drawRegOut()"><option value="study">Study Hours vs Score</option><option value="ads">Ad Spend vs Sales</option><option value="house">Home Size vs Price</option></select></div></div><div class="stats-row"><div class="sc"><div class="sv sv-cyan" id="u11Slope">-</div><div class="sl">slope</div></div><div class="sc"><div class="sv sv-amber" id="u11SE">-</div><div class="sl">SE</div></div><div class="sc"><div class="sv sv-pink" id="u11T">-</div><div class="sl">t-stat</div></div><div class="sc"><div class="sv sv-purple" id="u11P">-</div><div class="sl">p-value</div></div><div class="sc"><div class="sv sv-green" id="u11R2">-</div><div class="sl">r^2</div></div></div><div id="u11Tip" class="viz-tip">Hover a highlighted value for explanation.</div></div><div class="explain"><h3>Inference Formulas</h3><p>Use slope inference to test whether the linear relationship differs from zero.</p><div class="formula">t = b1 / SE(b1) &nbsp;&nbsp; CI: b1 +/- t* SE(b1)</div></div></div>`+vizPracticeBtn(unit);
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
  11:{tabs:['regout'],draw:drawRegOut},
  12:{tabs:['anova'],draw:drawAnova},
  13:{tabs:['nonparam'],draw:drawNonparam},
  14:{tabs:['bayes'],draw:drawBayes}
};

function isVizPageActive(){
  if(typeof document==='undefined')return false;
  const vizPage=document.getElementById('page-visualizer');
  return !!(vizPage&&vizPage.classList.contains('active'));
}

function buildVizForUnit(unit=currentUnit){
  const tabs=document.getElementById('vizTabs');
  const panels=document.getElementById('viz-panels');
  const dynamic=document.getElementById('viz-dynamic');
  if(!tabs||!panels||!dynamic)return;
  if(unit===1){
    tabs.style.display='flex';panels.style.display='block';
    dynamic.style.display='none';dynamic.innerHTML='';
    vizDrawn[1]=false;
    return;
  }
  tabs.style.display='none';panels.style.display='none';
  dynamic.style.display='block';dynamic.innerHTML=vizTemplate(unit);
  vizDrawn[unit]=false;
}

function drawActiveVisualizer(force){
  if(!isVizPageActive())return;
  if(currentUnit===1){
    if(vizDrawn[1]&&!force)return;
    drawHist();drawBox();drawNorm();drawComp();
    vizDrawn[1]=true;
    return;
  }
  if(vizDrawn[currentUnit]&&!force)return;
  const v=allViz[currentUnit];
  if(v&&typeof v.draw==='function'){
    v.draw();
    vizDrawn[currentUnit]=true;
  }
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
      const newHover=hit?hit.key:'';
      if(newHover!==vizState.u11.hover){
        vizState.u11.hover=newHover;
        setElText('u11Tip',hit?hit.tip:'Hover a highlighted value for explanation.');
        drawRegOut();
      }
    });
    canvas.addEventListener('mouseleave',()=>{
      if(vizState.u11.hover!==''){
        vizState.u11.hover='';
        setElText('u11Tip','Hover a highlighted value for explanation.');
        drawRegOut();
      }
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

function getProgressSummary(){
  const summary={};
  for(let unit=1;unit<=MAX_UNIT;unit++){
    const probs=allProbs[unit]||[];
    let stored={};
    if(typeof localStorage!=='undefined'){
      try{stored=JSON.parse(localStorage.getItem('sh-practice-'+unit)||'{}')||{};}catch{stored={};}
    }
    const saved=stored.answered&&typeof stored.answered==='object'?stored.answered:{};
    const attempted=Object.keys(saved).length;
    let correct=0;
    probs.forEach(prob=>{
      const raw=saved[prob.id];
      if(raw===undefined)return;
      if(prob.type==='mc'){
        if(raw===prob.ans)correct++;
      }else{
        const v=parseFloat(raw);
        if(Number.isFinite(v)&&Math.abs(v-prob.ans)<=(prob.tol||0.1))correct++;
      }
    });
    summary[unit]={total:probs.length,attempted,correct};
  }
  return summary;
}

function drawDiffChart(){
  if(typeof document==='undefined')return;
  var canvas=document.getElementById('diffChart');
  var row=document.getElementById('diffChartRow');
  if(!canvas||typeof canvas.getContext!=='function')return;
  var probs=(allProbs[currentUnit]||[]);
  if(!probs.length){if(row)row.style.display='none';return;}
  var easy=probs.filter(function(p){return p.diff==='easy';}).length;
  var med=probs.filter(function(p){return p.diff==='medium';}).length;
  var hard=probs.filter(function(p){return p.diff==='hard';}).length;
  var total=probs.length;
  if(row)row.style.display='';
  var ctx=canvas.getContext('2d');
  var W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H);
  var colors=['#34d399','#f59e0b','#f87171'];
  var vals=[easy,med,hard];
  var labels=['Easy','Med','Hard'];
  var barW=Math.floor((W-30)/(3*2));
  vals.forEach(function(v,i){
    var pct=total?v/total:0;
    var bh=Math.round(pct*(H-20));
    var x=10+i*(barW*2+5);
    ctx.fillStyle=colors[i];
    if(bh>0)ctx.fillRect(x,H-16-bh,barW,bh);
    ctx.fillStyle='rgba(255,255,255,0.7)';
    ctx.font='8px monospace';
    ctx.textAlign='center';
    ctx.fillText(labels[i],x+barW/2,H-2);
    if(pct>0)ctx.fillText(Math.round(pct*100)+'%',x+barW/2,H-18-bh);
  });
}
function buildProgressPanel(){
  if(typeof document==='undefined')return;
  const grid=document.getElementById('progressGrid');
  if(!grid)return;
  const summary=getProgressSummary();
  let html='';
  for(let unit=1;unit<=MAX_UNIT;unit++){
    const row=summary[unit]||{total:0,attempted:0,correct:0};
    let cls='progress-cell-empty';let perfect=false;
    if(row.total>0&&row.attempted>0){
      const pct=(row.correct/row.total)*100;
      if(pct>=80){cls='progress-cell-green progress-cell-perfect';perfect=true;}
      else if(pct>=40)cls='progress-cell-amber';
      else cls='progress-cell-red';
    }
    html+=`<div class="progress-cell ${cls}" title="${perfect?'Unit complete! ≥ 80% accuracy':''}"><div class="progress-cell-label">Unit ${unit}${perfect?' ⭐':''}</div><div class="progress-cell-score">${row.correct} / ${row.total}</div></div>`;
  }
  grid.innerHTML=html;
  updateMilestoneDisplay();
  updateWeakSpots();
  drawDiffChart();
  // Restore collapsed state
  if(typeof document!=='undefined'&&typeof localStorage!=='undefined'){
    var _pp=document.getElementById('progressPanel');
    var _pb=document.getElementById('progressToggle');
    if(_pp&&_pb&&typeof _pb.setAttribute==='function'){
      var _isC=localStorage.getItem('sh-progress-collapsed')==='1';
      if(_isC){_pp.classList.add('collapsed');_pb.setAttribute('aria-expanded','false');_pb.textContent='Progress Overview \u25B8';}
      else{_pp.classList.remove('collapsed');_pb.setAttribute('aria-expanded','true');_pb.textContent='Progress Overview \u25BE';}
    }
  }
}

function toggleProgressPanel(){
  if(typeof document==='undefined')return;
  const panel=document.getElementById('progressPanel');
  const btn=document.getElementById('progressToggle');
  if(!panel||!btn)return;
  panel.classList.toggle('collapsed');
  const expanded=!panel.classList.contains('collapsed');
  btn.setAttribute('aria-expanded',expanded?'true':'false');
  btn.textContent='Progress Overview '+(expanded?'\u25BE':'\u25B8');
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-progress-collapsed',expanded?'0':'1');
}

function resetUnit(unit){
  if(typeof document==='undefined')return;
  if(typeof confirm==='function'&&!confirm('Reset all progress for Unit '+unit+'?'))return;
  if(typeof localStorage!=='undefined')localStorage.removeItem('sh-practice-'+unit);
  answered={};
  pScore=0;
  buildProblems(currentUnit);
  buildProgressPanel();
  updateReviewBadge();
}

function resetAllProgress(){
  if(typeof document==='undefined')return;
  if(typeof confirm==='function'&&!confirm('Reset ALL progress? This cannot be undone.'))return;
  if(typeof localStorage!=='undefined'){
    for(let i=1;i<=MAX_UNIT;i++)localStorage.removeItem('sh-practice-'+i);
    localStorage.removeItem('sh-topics');
    localStorage.removeItem('sh-streak');
    localStorage.removeItem('sh-xp');
    localStorage.removeItem('sh-milestones');
    localStorage.removeItem('sh-review');
    localStorage.removeItem('sh-review-meta');
    localStorage.removeItem('sh-bookmarks');
    localStorage.removeItem('sh-notes');
    localStorage.removeItem('sh-custom-problems');
    localStorage.removeItem('sh-ratings');
  }
  answered={};
  pScore=0;
  buildProblems(currentUnit);
  buildRoadmap();
  buildProgressPanel();
  updateStreakDisplay();
  updateXPDisplay();
  updateMilestoneDisplay();
  updateReviewBadge();
}


// ===================== POMODORO TIMER =====================
let pomoState={running:false,seconds:25*60,total:25*60,interval:null,sessionsToday:0};

function togglePomoPanel(){
  if(typeof document==='undefined')return;
  const p=document.getElementById('pomoPanel');
  if(p)p.style.display=p.style.display==='none'?'':'none';
}

function setPomoTime(mins){
  if(pomoState.running)return;
  pomoState.seconds=mins*60;
  pomoState.total=mins*60;
  updatePomoDisplay();
  document.querySelectorAll('.pomo-preset').forEach(b=>b.classList.remove('active'));
  if(typeof event!=='undefined'&&event&&event.target)event.target.classList.add('active');
}

function startPomo(){
  if(pomoState.running)return;
  pomoState.running=true;
  const startBtn=document.getElementById('pomoStart');
  const pauseBtn=document.getElementById('pomoPause');
  const label=document.getElementById('pomoLabel');
  if(startBtn)startBtn.style.display='none';
  if(pauseBtn)pauseBtn.style.display='';
  if(label)label.textContent='Focusing...';
  pomoState.interval=setInterval(()=>{
    pomoState.seconds--;
    updatePomoDisplay();
    if(pomoState.seconds<=0){
      clearInterval(pomoState.interval);
      pomoState.running=false;
      pomoComplete();
    }
  },1000);
}

function pausePomo(){
  clearInterval(pomoState.interval);
  pomoState.running=false;
  const startBtn=document.getElementById('pomoStart');
  const pauseBtn=document.getElementById('pomoPause');
  const label=document.getElementById('pomoLabel');
  if(startBtn)startBtn.style.display='';
  if(pauseBtn)pauseBtn.style.display='none';
  if(label)label.textContent='Paused';
}

function resetPomo(){
  clearInterval(pomoState.interval);
  pomoState.running=false;
  pomoState.seconds=pomoState.total;
  updatePomoDisplay();
  const startBtn=document.getElementById('pomoStart');
  const pauseBtn=document.getElementById('pomoPause');
  const label=document.getElementById('pomoLabel');
  if(startBtn)startBtn.style.display='';
  if(pauseBtn)pauseBtn.style.display='none';
  if(label)label.textContent='Focus Time';
}

function updatePomoDisplay(){
  if(typeof document==='undefined')return;
  const m=Math.floor(pomoState.seconds/60);
  const s=pomoState.seconds%60;
  const el=document.getElementById('pomoDisplay');
  if(el)el.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  if(pomoState.running)document.title='('+m+':'+String(s).padStart(2,'0')+') Stats Hub';
  else document.title='Stats Learning Hub';
}

function pomoComplete(){
  if(typeof document==='undefined')return;
  pomoState.sessionsToday++;
  setElText('pomoSessions',pomoState.sessionsToday);
  const label=document.getElementById('pomoLabel');
  const startBtn=document.getElementById('pomoStart');
  const pauseBtn=document.getElementById('pomoPause');
  if(label)label.textContent='Break time! 🎉';
  if(startBtn)startBtn.style.display='';
  if(pauseBtn)pauseBtn.style.display='none';
  const xp=pomoState.total>=2700?35:pomoState.total>=1500?20:pomoState.total>=900?10:15;
  awardXP(xp,'pomo-session');
  recordActivity();
  var sessionSolved=typeof sessionData!=='undefined'?sessionData.problemsAnswered||0:0;
  var sessionCorrect=typeof sessionData!=='undefined'?sessionData.correct||0:0;
  var sessionMsg='Focus session complete! +'+xp+' XP.';
  if(sessionSolved>0)sessionMsg+=' You solved '+sessionSolved+' problem'+(sessionSolved===1?'':'s')+' ('+sessionCorrect+' correct) in this session.';
  sessionMsg+=' Take a break.';
  showToast(sessionMsg);
  showSessionSummary();
  if(typeof localStorage!=='undefined'){
    const today=todayStr();
    const data=JSON.parse(localStorage.getItem('sh-pomo')||'{}');
    data[today]=(data[today]||0)+1;
    localStorage.setItem('sh-pomo',JSON.stringify(data));
    // Also save to sh-pomodoro-log
    var log=[];
    try{log=JSON.parse(localStorage.getItem('sh-pomodoro-log')||'[]');}catch(e){}
    log.push({date:today,minutes:Math.round(pomoState.total/60)});
    if(log.length>50)log=log.slice(-50);
    localStorage.setItem('sh-pomodoro-log',JSON.stringify(log));
  }
  buildPomoHistory();
  pomoState.seconds=5*60;
  pomoState.total=5*60;
  updatePomoDisplay();
}

function buildPomoHistory(){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  var el=document.getElementById('pomodoroHistory');
  if(!el)return;
  var log=[];
  try{log=JSON.parse(localStorage.getItem('sh-pomodoro-log')||'[]');}catch(e){}
  if(!log.length){el.innerHTML='';return;}
  // Group last 5 unique dates
  var byDate={};
  log.forEach(function(entry){
    if(!byDate[entry.date])byDate[entry.date]={count:0,mins:0};
    byDate[entry.date].count++;
    byDate[entry.date].mins+=entry.minutes||25;
  });
  var dates=Object.keys(byDate).sort().reverse().slice(0,5);
  var today=todayStr();
  var html='<div class="pomo-history-title">Recent Sessions</div>';
  dates.forEach(function(d){
    var r=byDate[d];
    var label=d===today?'Today':d;
    html+='<div class="pomo-history-row"><span>'+label+'</span><span>'+r.count+' session'+(r.count===1?'':'s')+' ('+r.mins+' min)</span></div>';
  });
  el.innerHTML=html;
}

// ===================== THEME TOGGLE =====================
function toggleTheme(){
  if(typeof document==='undefined')return;
  const current=document.documentElement.getAttribute('data-theme');
  const next=current==='light'?'dark':'light';
  document.documentElement.setAttribute('data-theme',next);
  const btn=document.getElementById('themeToggle');
  if(btn)btn.textContent=next==='light'?'☀️':'🌙';
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-theme',next);
}

function _applyTheme(theme){
  if(typeof document==='undefined')return;
  document.documentElement.setAttribute('data-theme',theme);
  var btn=document.getElementById('themeToggle');
  if(btn)btn.textContent=theme==='light'?'☀️':'🌙';
}
function loadTheme(){
  if(typeof localStorage==='undefined'||typeof document==='undefined')return;
  var saved=localStorage.getItem('sh-theme');
  if(saved){
    _applyTheme(saved);
  } else {
    // Auto-detect system preference
    var prefersDark=typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
    _applyTheme(prefersDark?'dark':'light');
  }
  // Listen for system preference changes (only when user hasn't manually set theme)
  if(typeof window!=='undefined'&&window.matchMedia){
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(e){
      if(typeof localStorage!=='undefined'&&!localStorage.getItem('sh-theme')){
        _applyTheme(e.matches?'dark':'light');
      }
    });
  }
}

// ===================== KEYBOARD SHORTCUTS =====================
function toggleShortcutsHelp(){
  if(typeof document==='undefined')return;
  const el=document.getElementById('shortcutsOverlay');
  if(el)el.style.display=el.style.display==='none'?'flex':'none';
}
function downloadShortcutCheatsheet(){
  if(typeof Blob==='undefined'||typeof document==='undefined')return;
  var lines=[
    'STATS LEARNING HUB — KEYBOARD SHORTCUTS',
    '========================================',
    '',
    'NAVIGATION',
    '  1  Home',
    '  2  Roadmap',
    '  3  Visualizer',
    '  4  Practice',
    '  5  Review',
    '  6  Achievements',
    '  7  Flashcards',
    '  8  Create',
    '  R  Jump to Review',
    '',
    'PRACTICE',
    '  J  Next Problem',
    '  K  Previous Problem',
    '  F  Toggle Focus Mode',
    '',
    'FLASHCARDS',
    '  Space  Flip Card',
    '  →      Mark Know',
    '  ←      Mark Unsure',
    '',
    'INTERFACE',
    '  T    Toggle Timer',
    '  D    Toggle Theme',
    '  ?    Show Keyboard Shortcuts',
    '  Esc  Close Panel / Exit Focus',
    '',
    '========================================',
    'stats-learning-hub'
  ];
  var text=lines.join('\n');
  var blob=new Blob([text],{type:'text/plain'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='stats-hub-shortcuts.txt';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Cheatsheet downloaded!');
}

if(typeof document!=='undefined'&&typeof document.addEventListener==='function'){
  document.addEventListener('keydown',function(e){
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')return;
    // Keyboard MC answer selection on practice page
    var _pp=document.getElementById('page-practice');
    var _isPractice=_pp&&_pp.classList.contains('active');
    if(_isPractice&&focusedProblemId!==null&&(e.key==='1'||e.key==='2'||e.key==='3'||e.key==='4')){
      var _idx=parseInt(e.key)-1;
      var _prob=typeof activeProbs!=='undefined'?activeProbs.find(function(x){return String(x.id)===String(focusedProblemId);}):null;
      if(_prob&&_prob.type==='mc'&&_idx<_prob.ch.length){ansMC(_prob.id,_idx);return;}
    }
    if(_isPractice&&focusedProblemId!==null&&(e.key==='b'||e.key==='B')){
      toggleBookmark(String(focusedProblemId));return;
    }
    if(e.key==='1'){goPage('home');}
    else if(e.key==='2'){goPage('roadmap');}
    else if(e.key==='3'){goPage('visualizer');}
    else if(e.key==='4'){goPage('practice');}
    else if(e.key==='5'){goPage('review');}
    else if(e.key==='6'){goPage('achievements');}
    else if(e.key==='7'){goPage('flashcards');}
    else if(e.key==='8'){goPage('create');}
    else if(e.key==='r'||e.key==='R'){goPage('review');}
    else if(e.key==='f'||e.key==='F'){const pp=document.getElementById('page-practice');if(pp&&pp.classList.contains('active')&&typeof toggleFocusMode!=='undefined')toggleFocusMode();}
    else if(e.key==='t'||e.key==='T'){togglePomoPanel();}
    else if(e.key==='d'||e.key==='D'){toggleTheme();}
    else if(e.key==='?'){toggleShortcutsHelp();}
    else if(e.key==='Escape'){
      const so=document.getElementById('shortcutsOverlay');if(so&&so.style.display!=='none')so.style.display='none';
      const tp=document.getElementById('tutorPanel');if(tp&&tp.style.display!=='none')tp.style.display='none';
      const sess=document.getElementById('sessionOverlay');if(sess&&sess.style.display!=='none')sess.style.display='none';
      if(document.body.classList.contains('focus-mode'))document.body.classList.remove('focus-mode');
    }
    else if(e.key==='ArrowRight'){const fc=document.getElementById('page-flashcards');if(fc&&fc.classList.contains('active')){e.preventDefault();fcMark(true);}else{window.scrollBy(0,100);}}
    else if(e.key==='ArrowLeft'){const fc=document.getElementById('page-flashcards');if(fc&&fc.classList.contains('active')){e.preventDefault();fcMark(false);}}
    else if(e.key===' '){const fc=document.getElementById('page-flashcards');if(fc&&fc.classList.contains('active')){e.preventDefault();flipCard();}}
    else if(e.key==='j'||e.key==='J'){
      // Scroll to next problem card
      const cards=typeof document!=='undefined'?document.querySelectorAll('.prob-card'):[];
      if(cards.length){
        let found=false;
        for(let i=0;i<cards.length-1;i++){
          const r=cards[i].getBoundingClientRect();
          if(r.bottom>window.innerHeight*0.5){cards[i+1].scrollIntoView({behavior:'smooth',block:'center'});found=true;break;}
        }
        if(!found&&cards.length)cards[0].scrollIntoView({behavior:'smooth',block:'center'});
      }
    }
    else if(e.key==='k'||e.key==='K'){
      // Scroll to previous problem card
      const cards=typeof document!=='undefined'?document.querySelectorAll('.prob-card'):[];
      if(cards.length){
        let found=false;
        for(let i=cards.length-1;i>0;i--){
          const r=cards[i].getBoundingClientRect();
          if(r.top<window.innerHeight*0.5){cards[i-1].scrollIntoView({behavior:'smooth',block:'center'});found=true;break;}
        }
        if(!found&&cards.length)cards[cards.length-1].scrollIntoView({behavior:'smooth',block:'center'});
      }
    }
  });
}


// ===================== PWA INSTALL =====================
let deferredPrompt=null;
let focusModeActive=false;
let sessionData={startTime:Date.now(),problemsAnswered:0,correct:0,xpEarned:0,reviewsDone:0};

if(typeof window!=='undefined'&&typeof window.addEventListener==='function'){
  window.addEventListener('beforeinstallprompt',function(e){
    e.preventDefault();
    deferredPrompt=e;
    if(typeof localStorage!=='undefined'&&localStorage.getItem('sh-install-dismissed'))return;
    const banner=document.getElementById('installBanner');
    if(banner)banner.style.display='flex';
  });

  window.addEventListener('appinstalled',function(){
    const banner=document.getElementById('installBanner');
    if(banner)banner.style.display='none';
    deferredPrompt=null;
    showToast('App installed! Access Stats Hub from your home screen.');
  });

  window.addEventListener('online',function(){
    const b=document.getElementById('offlineBanner');
    if(b)b.style.display='none';
  });

  window.addEventListener('offline',function(){
    const b=document.getElementById('offlineBanner');
    if(b)b.style.display='flex';
  });

  if(typeof navigator!=='undefined'&&navigator.onLine===false){
    if(typeof document!=='undefined'&&typeof document.addEventListener==='function'){
      document.addEventListener('DOMContentLoaded',function(){
        const b=document.getElementById('offlineBanner');
        if(b)b.style.display='flex';
      });
    }
  }
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
  if(typeof document==='undefined')return;
  const banner=document.getElementById('installBanner');
  if(banner)banner.style.display='none';
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-install-dismissed','1');
}


function analyzeWeakSpots(){
  if(typeof allProbs==='undefined'||typeof getPracticeState==='undefined')return[];
  const spots=[];
  for(let u=1;u<=MAX_UNIT;u++){
    const probs=allProbs[u]||[];
    const state=getPracticeState(u);
    const ans=state.answered||{};
    let correct=0,wrong=0,unanswered=0;
    const wt={};
    probs.forEach(p=>{
      if(ans[p.id]===undefined){unanswered++;return;}
      let ok=false;
      if(p.type==='mc'){ok=(+ans[p.id])===p.ans;}
      else{const v=parseFloat(ans[p.id]);ok=Number.isFinite(v)&&Math.abs(v-p.ans)<=(p.tol||0.1);}
      if(ok)correct++;
      else{wrong++;wt[p.topic]=(wt[p.topic]||0)+1;}
    });
    if(wrong>0||unanswered>0){
      spots.push({unit:u,name:UNIT_META[u].name,correct,wrong,unanswered,total:probs.length,pct:probs.length?Math.round(correct/probs.length*100):0,weakTopics:Object.entries(wt).sort((a,b)=>b[1]-a[1]).map(e=>e[0])});
    }
  }
  spots.sort((a,b)=>a.pct-b.pct);
  return spots;
}

function updateWeakSpots(){
  if(typeof document==='undefined')return;
  const list=document.getElementById('weakspotList');
  if(!list)return;
  const spots=analyzeWeakSpots();
  if(!spots.length){list.innerHTML='<div class="weakspot-empty">No weak spots detected. Keep it up!</div>';return;}
  let h='';
  spots.slice(0,3).forEach(s=>{
    h+=`<div class="weakspot-card" onclick="goPage('practice');setUnit(${s.unit});">
      <div class="weakspot-unit">Unit ${s.unit}: ${s.name}</div>
      <div class="weakspot-bar"><div class="weakspot-fill" style="width:${s.pct}%;"></div></div>
      <div class="weakspot-detail">${s.correct}/${s.total} correct &middot; ${s.wrong} wrong &middot; ${s.unanswered} unanswered</div>
      ${s.weakTopics.length?'<div class="weakspot-topics">Weak: '+s.weakTopics.slice(0,2).join(', ')+'</div>':''}
    </div>`;
  });
  list.innerHTML=h;
}

function toggleFocusMode(){
  if(typeof document==='undefined')return;
  focusModeActive=!focusModeActive;
  document.body.classList.toggle('focus-mode',focusModeActive);
  ['breadcrumb','quickStatsRow','recentActivity'].forEach(function(id){
    var el=document.getElementById(id);if(el){el.classList.toggle('focus-mode-hidden',focusModeActive);}
  });
  const btn=document.getElementById('focusBtn');
  if(btn)btn.textContent=focusModeActive?'✕ Exit Focus':'🎯 Focus Mode';
  if(focusModeActive){
    const probs=document.querySelectorAll('.pc');
    for(const pc of probs){
      if(!pc.classList.contains('correct')&&!pc.classList.contains('incorrect')){
        if(typeof pc.scrollIntoView==='function')pc.scrollIntoView({behavior:'smooth',block:'center'});
        pc.classList.add('focus-highlight');
        break;
      }
    }
  }else{
    document.querySelectorAll('.focus-highlight').forEach(el=>el.classList.remove('focus-highlight'));
  }
}

function showSessionSummary(){
  if(typeof document==='undefined')return;
  const elapsed=Math.round((Date.now()-sessionData.startTime)/60000);
  if(sessionData.problemsAnswered===0&&sessionData.reviewsDone===0)return;
  const overlay=document.createElement('div');
  overlay.className='session-overlay';
  overlay.onclick=function(){overlay.remove();};
  const modal=document.createElement('div');
  modal.className='session-modal';
  modal.onclick=function(e){e.stopPropagation();};
  modal.innerHTML=`<h3>Session Summary</h3>
    <div class="session-stats">
      <div class="session-stat"><span class="session-num">${elapsed}</span><span class="session-label">minutes</span></div>
      <div class="session-stat"><span class="session-num">${sessionData.problemsAnswered}</span><span class="session-label">problems</span></div>
      <div class="session-stat"><span class="session-num">${sessionData.correct}</span><span class="session-label">correct</span></div>
      <div class="session-stat"><span class="session-num">+${sessionData.xpEarned}</span><span class="session-label">XP earned</span></div>
    </div>
    <div class="session-message">${getSessionMessage()}</div>
    <button class="session-close" onclick="this.closest('.session-overlay').remove()">Nice! 🎉</button>`;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  sessionData={startTime:Date.now(),problemsAnswered:0,correct:0,xpEarned:0,reviewsDone:0};
}

function getSessionMessage(){
  const pct=sessionData.problemsAnswered?Math.round(sessionData.correct/sessionData.problemsAnswered*100):0;
  if(pct>=90)return'Incredible accuracy! You\'re on fire.';
  if(pct>=70)return'Solid session. Keep building momentum.';
  if(pct>=50)return'Good effort! Review the tricky ones tomorrow.';
  return'Every problem makes you stronger. Come back tomorrow!';
}


// ===================== UNIT 12: ANOVA VISUALIZER =====================
function drawAnova(){
  const r=prepCanvas2('anovaCanvas',320);if(!r)return;
  const {ctx,W,H}=r;
  const m1=parseFloat(document.getElementById('u12M1')?.value||8);
  const m2=parseFloat(document.getElementById('u12M2')?.value||10);
  const m3=parseFloat(document.getElementById('u12M3')?.value||12);
  const sd=parseFloat(document.getElementById('u12SD')?.value||2);
  const n=8;
  const grandMean=(m1+m2+m3)/3;
  const SSB=n*((m1-grandMean)**2+(m2-grandMean)**2+(m3-grandMean)**2);
  const SSW=(n-1)*3*(sd**2);
  const F=(SSB/2)/(SSW/(3*n-3));
  const eta=SSB/(SSB+SSW);
  const sv=id=>document.getElementById(id);
  if(sv('u12SSB'))sv('u12SSB').textContent=SSB.toFixed(1);
  if(sv('u12SSW'))sv('u12SSW').textContent=SSW.toFixed(1);
  if(sv('u12F'))sv('u12F').textContent=F.toFixed(2);
  if(sv('u12Eta'))sv('u12Eta').textContent=eta.toFixed(3);
  if(sv('u12M1Val'))sv('u12M1Val').textContent=m1;
  if(sv('u12M2Val'))sv('u12M2Val').textContent=m2;
  if(sv('u12M3Val'))sv('u12M3Val').textContent=m3;
  if(sv('u12SDVal'))sv('u12SDVal').textContent=sd;
  const groups=[{mean:m1,color:'#00e5c7'},{mean:m2,color:'#ff6b9d'},{mean:m3,color:'#f59e0b'}];
  const pad=50,gapW=(W-2*pad)/3;
  const allVals=groups.flatMap((g,i)=>Array.from({length:n},()=>g.mean+(Math.random()-0.5)*2*sd));
  const minV=Math.min(...allVals)-1,maxV=Math.max(...allVals)+1;
  function toY(v){return pad+(H-2*pad)*(1-(v-minV)/(maxV-minV));}
  ctx.fillStyle=typeof getComputedStyle==='function'?getComputedStyle(document.documentElement).getPropertyValue('--bg2')||'#1a1a2e':'#1a1a2e';
  ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;
  for(let i=0;i<5;i++){const y=pad+(H-2*pad)*i/4;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(W-pad,y);ctx.stroke();}
  // Grand mean line
  ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.setLineDash([5,5]);ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(pad,toY(grandMean));ctx.lineTo(W-pad,toY(grandMean));ctx.stroke();
  ctx.setLineDash([]);
  // Draw dots per group
  const seed=12345;let rng=seed;function nextR(){rng=(rng*1664525+1013904223)&0xffffffff;return(rng&0x7fffffff)/0x7fffffff;}
  groups.forEach((g,gi)=>{
    const cx=pad+gapW*(gi+0.5);
    for(let j=0;j<n;j++){
      const jitter=(nextR()-0.5)*gapW*0.5;
      const yv=g.mean+(nextR()-0.5)*2*sd;
      const y=toY(yv);
      ctx.beginPath();ctx.arc(cx+jitter,y,5,0,Math.PI*2);
      ctx.fillStyle=g.color+'cc';ctx.fill();
    }
    // Group mean line
    ctx.strokeStyle=g.color;ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(cx-gapW*0.3,toY(g.mean));ctx.lineTo(cx+gapW*0.3,toY(g.mean));ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='12px monospace';ctx.textAlign='center';
    ctx.fillText('G'+(gi+1)+'('+g.mean+')',cx,H-pad+20);
  });
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='11px monospace';ctx.textAlign='right';
  ctx.fillText('grand x̄='+grandMean.toFixed(1),W-pad,toY(grandMean)-5);
}

// ===================== UNIT 13: NONPARAMETRIC VISUALIZER =====================
function drawNonparam(){
  const r=prepCanvas2('nonparamCanvas',320);if(!r)return;
  const {ctx,W,H}=r;
  const shape=document.getElementById('u13Shape')?.value||'normal';
  const shift=parseFloat(document.getElementById('u13Shift')?.value||2);
  const sv=id=>document.getElementById(id);
  if(sv('u13ShiftVal'))sv('u13ShiftVal').textContent=shift;
  const n=12;
  function genData(offset){
    if(shape==='normal')return Array.from({length:n},(_,i)=>offset+normalApprox(i,n));
    if(shape==='skew')return Array.from({length:n},(_,i)=>offset+Math.abs(normalApprox(i,n))*1.5);
    return Array.from({length:n},(_,i)=>i===0?offset+15:offset+normalApprox(i,n));
  }
  function normalApprox(i,n){const u=(i+0.5)/n;return approxInvNorm(u)*2;}
  const grp1=genData(5),grp2=genData(5+shift);
  const meanDiff=((grp2.reduce((a,b)=>a+b,0)-grp1.reduce((a,b)=>a+b,0))/n).toFixed(2);
  // Rank all values together
  const all=[...grp1.map((v,i)=>({v,g:1,i})),...grp2.map((v,i)=>({v,g:2,i}))];
  all.sort((a,b)=>a.v-b.v);
  all.forEach((d,r)=>d.rank=r+1);
  const r1=all.filter(d=>d.g===1).reduce((a,d)=>a+d.rank,0);
  const r2=all.filter(d=>d.g===2).reduce((a,d)=>a+d.rank,0);
  const rankDiff=(r2-r1).toFixed(1);
  if(sv('u13RankDiff'))sv('u13RankDiff').textContent=rankDiff;
  if(sv('u13MeanDiff'))sv('u13MeanDiff').textContent=meanDiff;
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
  const minV=Math.min(...grp1,...grp2)-1,maxV=Math.max(...grp1,...grp2)+1;
  const pad=50;
  function toX(v){return pad+(W-2*pad)*(v-minV)/(maxV-minV);}
  // Draw dots
  [grp1,grp2].forEach((grp,gi)=>{
    grp.forEach(v=>{
      const x=toX(v);const y=gi===0?H/3:2*H/3;
      ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);
      ctx.fillStyle=gi===0?'#00e5c7cc':'#ff6b9dcc';ctx.fill();
    });
    const mean=grp.reduce((a,b)=>a+b,0)/grp.length;
    ctx.strokeStyle=gi===0?'#00e5c7':'#ff6b9d';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(toX(mean),gi===0?H/3-20:2*H/3-20);ctx.lineTo(toX(mean),gi===0?H/3+20:2*H/3+20);ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='12px monospace';ctx.textAlign='center';
    ctx.fillText('Group '+(gi+1),W/2,gi===0?H/3-30:2*H/3-30);
  });
}

// ===================== UNIT 14: BAYESIAN VISUALIZER =====================
function betaPDF(x,a,b){
  if(x<=0||x>=1)return 0;
  const logB=gammaLn(a)+gammaLn(b)-gammaLn(a+b);
  return Math.exp((a-1)*Math.log(x)+(b-1)*Math.log(1-x)-logB);
}

function drawBayes(){
  const r=prepCanvas2('bayesCanvas',320);if(!r)return;
  const {ctx,W,H}=r;
  const priorStr=parseFloat(document.getElementById('u14Prior')?.value||5);
  const phat=parseFloat(document.getElementById('u14Data')?.value||0.70);
  const n=parseInt(document.getElementById('u14N')?.value||20);
  const sv=id=>document.getElementById(id);
  if(sv('u14PriorVal'))sv('u14PriorVal').textContent=priorStr;
  if(sv('u14DataVal'))sv('u14DataVal').textContent=phat.toFixed(2);
  if(sv('u14NVal'))sv('u14NVal').textContent=n;
  // Beta(a0,b0) prior, binomial likelihood
  const a0=priorStr,b0=priorStr;
  const successes=Math.round(phat*n);
  const aPost=a0+successes,bPost=b0+(n-successes);
  const postMean=aPost/(aPost+bPost);
  const postSD=Math.sqrt(aPost*bPost/((aPost+bPost)**2*(aPost+bPost+1)));
  if(sv('u14PostMean'))sv('u14PostMean').textContent=postMean.toFixed(3);
  if(sv('u14PostSD'))sv('u14PostSD').textContent=postSD.toFixed(3);
  const ci95lo=clamp(postMean-1.96*postSD,0,1),ci95hi=clamp(postMean+1.96*postSD,0,1);
  if(sv('u14CI'))sv('u14CI').textContent='('+ci95lo.toFixed(2)+','+ci95hi.toFixed(2)+')';
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
  const pad=50;
  const steps=200;
  const vals=Array.from({length:steps},(_,i)=>{const x=(i+0.5)/steps;return{x,prior:betaPDF(x,a0,b0),post:betaPDF(x,aPost,bPost)};});
  const maxY=Math.max(...vals.map(v=>v.prior),...vals.map(v=>v.post));
  function toX(x){return pad+(W-2*pad)*x;}
  function toY(y){return H-pad-(H-2*pad)*(y/maxY);}
  // Shaded posterior CI
  ctx.fillStyle='rgba(0,229,199,0.1)';
  ctx.beginPath();
  vals.filter(v=>v.x>=ci95lo&&v.x<=ci95hi).forEach((v,i)=>{
    if(i===0)ctx.moveTo(toX(v.x),H-pad);
    ctx.lineTo(toX(v.x),toY(v.post));
  });
  ctx.lineTo(toX(ci95hi),H-pad);ctx.closePath();ctx.fill();
  // Prior curve
  ctx.strokeStyle='rgba(245,158,11,0.7)';ctx.lineWidth=2;ctx.beginPath();
  vals.forEach((v,i)=>{if(i===0)ctx.moveTo(toX(v.x),toY(v.prior));else ctx.lineTo(toX(v.x),toY(v.prior));});ctx.stroke();
  // Posterior curve
  ctx.strokeStyle='#00e5c7';ctx.lineWidth=2.5;ctx.beginPath();
  vals.forEach((v,i)=>{if(i===0)ctx.moveTo(toX(v.x),toY(v.post));else ctx.lineTo(toX(v.x),toY(v.post));});ctx.stroke();
  // Labels
  ctx.fillStyle='rgba(245,158,11,0.9)';ctx.font='11px monospace';ctx.textAlign='left';ctx.fillText('Prior Beta('+a0+','+b0+')',pad+5,pad+15);
  ctx.fillStyle='#00e5c7';ctx.fillText('Posterior Beta('+aPost+','+bPost+')',pad+5,pad+30);
  // Posterior mean line
  ctx.strokeStyle='rgba(0,229,199,0.5)';ctx.setLineDash([4,4]);ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(toX(postMean),pad);ctx.lineTo(toX(postMean),H-pad);ctx.stroke();
  ctx.setLineDash([]);
  // X axis labels
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='11px monospace';
  for(let i=0;i<=4;i++){const x=i/4;ctx.textAlign='center';ctx.fillText(x.toFixed(2),toX(x),H-pad+15);}
}


// ===================== PHASE 13: DAILY CHALLENGES, WEEKLY GOALS, ACHIEVEMENTS =====================
function getDailyChallenge(){
  const today=todayStr();
  const parts=today.split('-');
  let seed=parts.reduce((a,b)=>a*31+parseInt(b),0);
  const allIds=[];
  for(const u in allProbs)(allProbs[u]||[]).forEach(p=>allIds.push(p.id));
  if(!allIds.length)return null;
  const challenges=[];
  const used=new Set();
  for(let i=0;i<3;i++){
    let idx=Math.abs((seed*7+i*13)%allIds.length);
    while(used.has(idx))idx=(idx+1)%allIds.length;
    used.add(idx);
    const id=allIds[idx];
    let prob=null;
    for(const u in allProbs){prob=(allProbs[u]||[]).find(p=>p.id===id);if(prob)break;}
    if(prob)challenges.push(prob);
  }
  return{date:today,problems:challenges};
}

function getDailyChallengeState(){
  if(typeof localStorage==='undefined')return{};
  try{return JSON.parse(localStorage.getItem('sh-daily')||'{}')||{};}catch{return{};}
}

function saveDailyChallengeState(state){
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-daily',JSON.stringify(state));
}

function updateDCStreak(){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  var el=document.getElementById('dcStreak');if(!el)return;
  var today=typeof todayStr==='function'?todayStr():new Date().toISOString().slice(0,10);
  var dcData={count:0,lastDate:''};
  try{var _d=JSON.parse(localStorage.getItem('sh-dc-streak')||'{}');if(_d&&typeof _d.count==='number')dcData=_d;}catch(e){}
  var state=typeof getDailyChallengeState==='function'?getDailyChallengeState():{};
  var doneToday=!!(state.completed&&state.completed[today]);
  if(doneToday&&dcData.lastDate!==today){
    dcData.count=(dcData.count||0)+1;dcData.lastDate=today;
    try{localStorage.setItem('sh-dc-streak',JSON.stringify(dcData));}catch(e){}
  } else if(!doneToday&&dcData.lastDate&&dcData.lastDate<today){
    // Check if streak broken (missed a day)
    var last=new Date(dcData.lastDate),now=new Date(today);
    var diff=Math.floor((now-last)/(86400000));
    if(diff>1){dcData.count=0;try{localStorage.setItem('sh-dc-streak',JSON.stringify(dcData));}catch(e){}}
  }
  el.textContent='\uD83D\uDD25 '+dcData.count;
}
function completeDailyChallenge(){
  const state=getDailyChallengeState();
  const today=todayStr();
  if(!state.completed)state.completed={};
  if(state.completed[today])return;
  state.completed[today]=true;
  state.totalCompleted=(state.totalCompleted||0)+1;
  saveDailyChallengeState(state);
  awardXP(25,'daily-challenge-'+today);
  showToast('Daily Challenge complete! +25 XP 🏅');
  checkMilestones();
  updateDCStreak();
}

function toggleCompareMode(){
  if(typeof document==='undefined')return;
  var container=document.getElementById('probContainer');
  var btn=document.getElementById('compareModeBtn');
  if(!container)return;
  container.classList.toggle('compare-mode');
  var active=container.classList.contains('compare-mode');
  if(btn)btn.textContent=active?'Exit Compare':'Compare Mode';
}
function updatePracticeNavBadge(){
  if(typeof document==='undefined')return;
  var badge=document.getElementById('practiceNavBadge');
  if(!badge)return;
  var unanswered=0;
  if(typeof activeProbs!=='undefined'&&typeof answered!=='undefined'){
    unanswered=activeProbs.filter(function(p){return answered[p.id]===undefined;}).length;
  }
  if(unanswered>0){badge.textContent=unanswered;badge.style.display='';}
  else{badge.style.display='none';}
}
function buildUnitXPBar(unit){
  if(typeof document==='undefined')return;
  var row=document.getElementById('unitXPBarRow');
  var fill=document.getElementById('unitXPBarFill');
  var text=document.getElementById('unitXPBarText');
  if(!row||!fill||!text)return;
  var probs=allProbs[unit]||[];if(!probs.length){row.style.display='none';return;}
  var state=typeof getPracticeState==='function'?getPracticeState(unit):{};
  var ans=state.answered&&typeof state.answered==='object'?state.answered:{};
  var earnedXP=0,totalXP=0;
  probs.forEach(function(p){
    var xp=p.diff==='easy'?XP_TABLE.easy:p.diff==='medium'?XP_TABLE.medium:XP_TABLE.hard;
    totalXP+=xp;
    if(ans[p.id]!==undefined){
      var ok=p.type==='mc'?(+ans[p.id])===p.ans:Math.abs(parseFloat(ans[p.id])-p.ans)<=(p.tol||0.1);
      if(ok)earnedXP+=xp;
    }
  });
  var pct=totalXP>0?Math.round(earnedXP/totalXP*100):0;
  row.style.display='';
  fill.style.width=pct+'%';
  text.textContent=earnedXP+' / '+totalXP+' XP ('+pct+'%)';
}
function buildDiffInsight(unit){
  if(typeof document==='undefined')return;
  var el=document.getElementById('diffInsight');
  if(!el)return;
  var probs=allProbs[unit]||[];
  if(!probs.length){el.textContent='';return;}
  var easy=0,medium=0,hard=0;
  probs.forEach(function(p){
    if(p.diff==='easy')easy++;
    else if(p.diff==='medium')medium++;
    else hard++;
  });
  el.textContent=probs.length+' problems: '+easy+' easy \u2022 '+medium+' medium \u2022 '+hard+' hard';
}
function updateMasteryBadge(unit){
  if(typeof document==='undefined')return;
  var badge=document.getElementById('masteryBadge');if(!badge)return;
  var probs=allProbs[unit]||[];if(!probs.length){badge.textContent='Novice';if(typeof badge.setAttribute==='function')badge.setAttribute('data-level','novice');return;}
  var state=typeof getPracticeState==='function'?getPracticeState(unit):{};
  var ans=state.answered&&typeof state.answered==='object'?state.answered:{};
  var correct=0,total=probs.length;
  probs.forEach(function(p){
    var a=ans[p.id];
    if(a===undefined)return;
    var ok=p.type==='mc'?(+a)===p.ans:Math.abs(parseFloat(a)-p.ans)<=(p.tol||0.1);
    if(ok)correct++;
  });
  var pct=total>0?correct/total*100:0;
  var level,label;
  if(pct<=20){level='novice';label='Novice';}
  else if(pct<=40){level='apprentice';label='Apprentice';}
  else if(pct<=60){level='practitioner';label='Practitioner';}
  else if(pct<=80){level='expert';label='Expert';}
  else{level='master';label='Master';}
  badge.textContent=label;
  if(typeof badge.setAttribute==='function')badge.setAttribute('data-level',level);
}
function toggleReadingMode(){
  if(typeof document==='undefined')return;
  document.body.classList.toggle('reading-mode');
  var active=document.body.classList.contains('reading-mode');
  if(typeof localStorage!=='undefined'){try{localStorage.setItem('sh-reading-mode',active?'1':'0');}catch(e){}}
  var btn=document.getElementById('readingModeBtn');
  if(btn){btn.style.opacity=active?'1':'0.6';btn.title=active?'Exit Reading Mode':'Reading Mode';}
}
function loadReadingMode(){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  try{if(localStorage.getItem('sh-reading-mode')==='1'){document.body.classList.add('reading-mode');var btn=document.getElementById('readingModeBtn');if(btn){btn.style.opacity='1';btn.title='Exit Reading Mode';}}}catch(e){}
}
function jumpToProblem(){
  if(typeof document==='undefined')return;
  var input=document.getElementById('jumpInput');
  if(!input)return;
  var pid=parseInt(input.value);
  if(!pid)return;
  // Search in activeProbs first
  var found=false;
  if(typeof activeProbs!=='undefined'){
    var local=activeProbs.find(function(p){return p.id===pid;});
    if(local){
      var el=document.getElementById('pc-'+pid);
      if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.style.outline='2px solid var(--cyan)';setTimeout(function(){el.style.outline='';},1500);found=true;}
    }
  }
  if(!found&&typeof allProbs!=='undefined'){
    for(var u in allProbs){
      var p2=(allProbs[u]||[]).find(function(p){return p.id===pid;});
      if(p2){setUnit(+u);if(typeof setTimeout!=='undefined'){setTimeout(function(_pid){return function(){var el2=document.getElementById('pc-'+_pid);if(el2){el2.scrollIntoView({behavior:'smooth',block:'center'});el2.style.outline='2px solid var(--cyan)';setTimeout(function(){el2.style.outline='';},1500);}};}(pid),400);}found=true;break;}
    }
  }
  if(!found)showToast('Problem #'+pid+' not found.');
  input.value='';
}
function copyProblemLink(probId){
  if(typeof window==='undefined'||typeof navigator==='undefined')return;
  var url=(window.location.origin||'')+(window.location.pathname||'')+'#/practice?pid='+probId;
  if(navigator.clipboard&&typeof navigator.clipboard.writeText==='function'){
    navigator.clipboard.writeText(url).then(function(){showToast('Link copied!');}).catch(function(){showToast('Could not copy link');});
  }else{
    showToast('Link: '+url);
  }
}
function shareProblem(probId){
  if(typeof navigator==='undefined'||typeof navigator.clipboard==='undefined')return;
  var p=null;
  for(var u=1;u<=MAX_UNIT;u++){var probs=allProbs[u]||[];var found=probs.find(function(x){return String(x.id)===String(probId);});if(found){p=found;break;}}
  if(!p)return;
  var text='Stats Hub Problem #'+p.id+' (Unit '+p.unit+' — '+(typeof UNIT_META!=='undefined'&&UNIT_META[p.unit]?UNIT_META[p.unit].name:'Stats')+'): '+p.q;
  navigator.clipboard.writeText(text).then(function(){showToast('Problem text copied!');}).catch(function(){showToast('Could not copy text');});
}
function shareAchievement(id){
  if(typeof navigator==='undefined'||typeof navigator.clipboard==='undefined'){showToast('Clipboard not available');return;}
  var m=typeof MILESTONES!=='undefined'?MILESTONES.find(function(x){return x.id===id;}):null;
  if(!m)return;
  var text='I just earned "'+m.name+'" on Stats Learning Hub! '+m.icon+' '+m.desc;
  navigator.clipboard.writeText(text).then(function(){showToast('Achievement copied to clipboard!');}).catch(function(){showToast('Could not copy');});
}
function toggleCollapse(btn){
  if(typeof document==='undefined')return;
  var card=btn.closest('.pc');
  if(!card)return;
  var id=card.dataset.id;
  var unit=typeof currentUnit!=='undefined'?currentUnit:1;
  card.classList.toggle('pc-collapsed');
  var collapsed=card.classList.contains('pc-collapsed');
  btn.textContent=collapsed?'▸':'▾';
  if(typeof localStorage!=='undefined'){
    try{
      var key='sh-collapsed-'+unit;
      var set=new Set(JSON.parse(localStorage.getItem(key)||'[]'));
      if(collapsed)set.add(String(id));else set.delete(String(id));
      localStorage.setItem(key,JSON.stringify([...set]));
    }catch(e){}
  }
}
function toggleExpandAll(){
  if(typeof document==='undefined')return;
  var cards=document.querySelectorAll('.pc');if(!cards.length)return;
  var anyCollapsed=Array.from(cards).some(function(c){return c.classList.contains('pc-collapsed');});
  var btn=document.getElementById('expandAllBtn');
  var unit=typeof currentUnit!=='undefined'?currentUnit:1;
  if(anyCollapsed){
    // Expand all
    cards.forEach(function(c){c.classList.remove('pc-collapsed');var b=c.querySelector('.card-collapse-btn');if(b)b.textContent='▾';});
    if(btn)btn.textContent='Collapse All';
    if(typeof localStorage!=='undefined')try{localStorage.setItem('sh-collapsed-'+unit,'[]');}catch(e){}
  }else{
    // Collapse all
    cards.forEach(function(c){c.classList.add('pc-collapsed');var b=c.querySelector('.card-collapse-btn');if(b)b.textContent='▸';});
    if(btn)btn.textContent='Expand All';
    var ids=Array.from(cards).map(function(c){return c.dataset.id;}).filter(Boolean);
    if(typeof localStorage!=='undefined')try{localStorage.setItem('sh-collapsed-'+unit,JSON.stringify(ids));}catch(e){}
  }
}
var activeTags=new Set();
function buildTagFilter(){
  if(typeof document==='undefined')return;
  var bar=document.getElementById('tagFilterBar');
  if(!bar)return;
  var topics=[];
  var seen={};
  (activeProbs||[]).forEach(function(p){
    if(p.topic&&!seen[p.topic]){seen[p.topic]=true;topics.push(p.topic);}
  });
  if(!topics.length){bar.style.display='none';return;}
  bar.style.display='flex';
  var html='<button class="tag-filter-chip tag-all-chip'+(activeTags.size===0?' active':'')+'" onclick="clearTagFilter()">All Topics</button>';
  topics.forEach(function(t){
    var enc=t.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
    var isActive=activeTags.has(t);
    html+='<button class="tag-filter-chip'+(isActive?' active':'')+'" onclick="toggleTag(this,'+JSON.stringify(t)+')">'+enc+'</button>';
  });
  bar.innerHTML=html;
}
function toggleTag(btn,topic){
  if(activeTags.has(topic))activeTags.delete(topic);
  else activeTags.add(topic);
  if(typeof localStorage!=='undefined')try{localStorage.setItem('sh-active-tags',JSON.stringify([...activeTags]));}catch(e){}
  applyTagFilter();
  buildTagFilter();
}
function clearTagFilter(){
  activeTags=new Set();
  if(typeof localStorage!=='undefined')try{localStorage.setItem('sh-active-tags','[]');}catch(e){}
  applyTagFilter();
  buildTagFilter();
}
function applyTagFilter(){
  if(typeof document==='undefined')return;
  document.querySelectorAll('.pc').forEach(function(el){
    if(!activeTags.size){el.style.display='';return;}
    var id=el.id.replace('pc-','');
    var prob=(activeProbs||[]).find(function(p){return String(p.id)===id;});
    el.style.display=(prob&&activeTags.has(prob.topic))?'':'none';
  });
}
function buildMotivationalQuote(){
  if(typeof document==='undefined')return;
  var el=document.getElementById('motivationalQuote');
  if(!el)return;
  var quotes=[
    '"Statistics is the grammar of science." — Karl Pearson',
    '"Without data, you are just another person with an opinion." — W. Edwards Deming',
    '"The goal of education is not to fill a bucket but to light a fire." — W. B. Yeats',
    '"An approximate answer to the right question is better than the exact answer to the wrong one." — John Tukey',
    '"In God we trust. All others must bring data." — W. Edwards Deming',
    '"Practice makes permanent — the more problems you solve, the stronger your intuition becomes."',
    '"Every expert was once a beginner. Consistency is the real superpower."',
    '"Data beats hunches — but only if you understand what the data is saying."'
  ];
  var dateStr=typeof todayStr!=='undefined'?todayStr():new Date().toISOString().slice(0,10);
  var hash=dateStr.split('').reduce(function(a,c){return a+c.charCodeAt(0);},0);
  el.textContent=quotes[hash%quotes.length];
}
function _recordTodayActivity(id,unit,ok){
  if(typeof localStorage==='undefined')return;
  try{
    var arr=JSON.parse(localStorage.getItem('sh-today-activity')||'[]');
    if(!Array.isArray(arr))arr=[];
    arr.unshift({id:String(id),unit:unit,ok:ok,t:Date.now()});
    if(arr.length>20)arr=arr.slice(0,20);
    localStorage.setItem('sh-today-activity',JSON.stringify(arr));
  }catch(e){}
}
function buildRecentActivity(){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  var el=document.getElementById('recentActivity');
  if(!el)return;
  var arr=[];
  try{arr=JSON.parse(localStorage.getItem('sh-today-activity')||'[]');}catch(e){}
  if(!Array.isArray(arr))arr=[];
  var today=typeof todayStr!=='undefined'?todayStr():'';
  var todayArr=arr.filter(function(a){
    return !today||new Date(a.t).toISOString().slice(0,10)===today;
  }).slice(0,5);
  if(!todayArr.length){el.style.display='none';return;}
  el.style.display='';
  var html='<div class="ra-title">Recent Activity</div>';
  todayArr.forEach(function(a){
    var statusCls=a.ok?'ra-ok':'ra-no';
    var statusText=a.ok?'Correct':'Wrong';
    var unitName=typeof UNIT_META!=='undefined'&&UNIT_META[a.unit]?'Unit '+a.unit:('Unit '+a.unit);
    html+='<div class="ra-row"><span class="ra-id">#'+a.id+'</span><span class="ra-unit">'+unitName+'</span><span class="ra-status '+statusCls+'">'+statusText+'</span></div>';
  });
  el.innerHTML=html;
}
function buildStreakHeatmap(){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  var el=document.getElementById('streakHeatmap');if(!el)return;
  var activity={};
  try{activity=JSON.parse(localStorage.getItem('sh-activity')||'{}');}catch(e){}
  // Build 12 weeks (84 days) starting from 83 days ago
  var today=new Date();today.setHours(0,0,0,0);
  var startDay=new Date(today);startDay.setDate(today.getDate()-83);
  // Align to Monday of that week
  var dayOfWeek=startDay.getDay()||7; // 1=Mon..7=Sun
  startDay.setDate(startDay.getDate()-(dayOfWeek-1));
  var html='<div class="hm-title">12-Week Activity</div><div class="hm-grid">';
  var d=new Date(startDay);
  for(var week=0;week<13;week++){
    html+='<div class="hm-week">';
    for(var day=0;day<7;day++){
      var iso=d.toISOString().slice(0,10);
      var count=activity[iso]||0;
      var level=count===0?0:count===1?1:count<=3?2:3;
      var isFuture=d>today;
      html+='<div class="hm-day" data-level="'+(isFuture?'future':level)+'" title="'+iso+(count?' — '+count+' session'+(count>1?'s':''):'')+'"></div>';
      d.setDate(d.getDate()+1);
    }
    html+='</div>';
  }
  html+='</div>';
  el.innerHTML=html;
}
var _statsAnimated=false;
function _animateCounter(el,target,suffix,duration){
  if(typeof requestAnimationFrame==='undefined'){el.textContent=target+(suffix||'');return;}
  var start=Date.now();var from=parseInt(el.textContent)||0;
  function step(){
    var pct=Math.min(1,(Date.now()-start)/duration);
    el.textContent=Math.round(from+(target-from)*pct)+(suffix||'');
    if(pct<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function buildQuickStats(){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  var totalAttempted=0,totalCorrect=0;
  if(typeof allProbs!=='undefined'&&typeof getPracticeState!=='undefined'){
    for(var u=1;u<=MAX_UNIT;u++){
      var state=getPracticeState(u);
      var ans=state.answered&&typeof state.answered==='object'?state.answered:{};
      var probs=allProbs[u]||[];
      probs.forEach(function(p){
        if(ans[p.id]!==undefined){
          totalAttempted++;
          var ok=p.type==='mc'?(+ans[p.id])===p.ans:Math.abs(parseFloat(ans[p.id])-p.ans)<=(p.tol||0.1);
          if(ok)totalCorrect++;
        }
      });
    }
  }
  var acc=totalAttempted>0?Math.round(totalCorrect/totalAttempted*100):0;
  var streak=0;
  try{var sd=JSON.parse(localStorage.getItem('sh-streak')||'{}');streak=sd.current||0;}catch(e){}
  var setEl=function(id,v,suffix){var e=document.getElementById(id);if(!e)return;if(!_statsAnimated)_animateCounter(e,v,suffix||'',600);else e.textContent=v+(suffix||'');};
  setEl('qsAttempted',totalAttempted);
  setEl('qsCorrect',totalCorrect);
  setEl('qsAccuracy',acc,'%');
  setEl('qsStreak',streak);
  var todayCount=0;
  if(typeof localStorage!=='undefined'){try{var act=JSON.parse(localStorage.getItem('sh-activity')||'{}');todayCount=act[typeof todayStr!=='undefined'?todayStr():new Date().toISOString().slice(0,10)]||0;}catch(e){}}
  setEl('qsToday',todayCount);
  _statsAnimated=true;
  var unitsStarted=0;
  if(typeof allProbs!=='undefined'&&typeof getPracticeState!=='undefined'){
    for(var u2=1;u2<=MAX_UNIT;u2++){
      var st2=getPracticeState(u2);var an2=st2.answered&&typeof st2.answered==='object'?st2.answered:{};
      if(Object.keys(an2).length>0)unitsStarted++;
    }
  }
  var ringFill=document.getElementById('qsRingFill');
  var ringText=document.getElementById('qsRingText');
  if(ringFill&&typeof MAX_UNIT!=='undefined'){
    var circumference=113.1;
    var pctRing=MAX_UNIT>0?unitsStarted/MAX_UNIT:0;
    ringFill.style.strokeDashoffset=circumference*(1-pctRing);
  }
  if(ringText)ringText.textContent=unitsStarted;
}
function buildPOD(){
  if(typeof document==='undefined')return;
  var widget=document.getElementById('podWidget');
  var qEl=document.getElementById('podQuestion');
  var btn=document.getElementById('podSolveBtn');
  if(!widget||!qEl||!btn)return;
  var pool=(allProbs[1]||[]);
  if(!pool.length)return;
  var dateStr=todayStr();
  var hash=dateStr.split('').reduce(function(a,c){return a+c.charCodeAt(0);},0);
  var prob=pool[hash%pool.length];
  if(!prob)return;
  qEl.textContent=prob.q;
  var unitNum=prob.unit||1;
  btn.onclick=function(){goPage('practice');setUnit(unitNum);if(typeof setTimeout!=='undefined'){setTimeout(function(){var el=document.querySelector('[data-id="'+prob.id+'"]');if(el)el.scrollIntoView({behavior:'smooth',block:'center'});},300);}};
  widget.style.display='';
}
function buildDailyChallenge(){
  if(typeof document==='undefined')return;
  const panel=document.getElementById('dailyChallenge');
  if(!panel)return;
  const dc=getDailyChallenge();
  if(!dc||!dc.problems.length){panel.style.display='none';return;}
  panel.style.display='';
  const state=getDailyChallengeState();
  const today=todayStr();
  const alreadyDone=!!(state.completed&&state.completed[today]);
  const dcDate=document.getElementById('dcDate');
  if(dcDate)dcDate.textContent=today;
  updateDCStreak();
  const dcStatus=document.getElementById('dcStatus');
  const dcProblems=document.getElementById('dcProblems');
  if(!dcProblems)return;
  if(alreadyDone){
    dcProblems.innerHTML='';
    if(dcStatus)dcStatus.textContent='✅ Completed! Come back tomorrow for a new challenge.';
    return;
  }
  if(dcStatus)dcStatus.textContent='';
  let answeredCount=0;
  let correctCount=0;
  function checkComplete(){
    if(correctCount>=dc.problems.length){
      completeDailyChallenge();
      if(dcStatus)dcStatus.textContent='✅ All 3 correct! Challenge complete!';
    }else if(answeredCount>=dc.problems.length){
      if(dcStatus)dcStatus.textContent=correctCount+'/'+dc.problems.length+' correct. Try again tomorrow!';
    }
  }
  let html='';
  dc.problems.forEach((p,i)=>{
    html+='<div class="dc-problem" id="dcp-'+i+'"><div class="dc-q">'+(i+1)+'. ['+p.topic+'] '+p.q+'</div>';
    if(p.type==='mc'){
      p.ch.forEach((ch,j)=>{
        html+='<div class="dc-ch" id="dc-ch-'+i+'-'+j+'" onclick="dcAnsMC('+i+','+j+')">'+ch+'</div>';
      });
    }else{
      html+='<div class="dc-fr"><input type="text" id="dc-fi-'+i+'" placeholder="Your answer..." onkeydown="if(event.key===&quot;Enter&quot;)dcAnsFR('+i+')"><button onclick="dcAnsFR('+i+')">Check</button></div>';
    }
    html+='<div class="dc-fb" id="dc-fb-'+i+'"></div></div>';
  });
  dcProblems.innerHTML=html;

  window._dcProbs=dc.problems;
  window._dcAnswered={};

  window.dcAnsMC=function(i,j){
    if(window._dcAnswered[i]!==undefined)return;
    window._dcAnswered[i]=j;
    answeredCount++;
    const p=window._dcProbs[i];
    const ok=j===p.ans;
    if(ok)correctCount++;
    p.ch.forEach((_,k)=>{
      const el=document.getElementById('dc-ch-'+i+'-'+k);
      if(!el)return;
      el.classList.add('dis');
      if(k===p.ans)el.classList.add('dc-right');
      else if(k===j&&!ok)el.classList.add('dc-wrong');
    });
    const fb=document.getElementById('dc-fb-'+i);
    if(fb)fb.textContent=(ok?'✓ Correct! ':'✗ ')+p.ex;
    checkComplete();
  };

  window.dcAnsFR=function(i){
    if(window._dcAnswered[i]!==undefined)return;
    const inp=document.getElementById('dc-fi-'+i);
    if(!inp)return;
    const v=parseFloat(inp.value);if(!Number.isFinite(v))return;
    window._dcAnswered[i]=v;
    answeredCount++;
    const p=window._dcProbs[i];
    const ok=Math.abs(v-p.ans)<=(p.tol||0.1);
    if(ok)correctCount++;
    inp.style.borderColor=ok?'var(--green)':'var(--red)';inp.disabled=true;
    const fb=document.getElementById('dc-fb-'+i);
    if(fb)fb.textContent=(ok?'✓ Correct! ':'✗ Correct answer: '+p.ans+'. ')+p.ex;
    checkComplete();
  };
}

function getWeekStart(){
  if(typeof Date==='undefined')return'2024-01-01';
  const d=new Date();d.setDate(d.getDate()-d.getDay());
  return d.toISOString().slice(0,10);
}

function getWeeklyGoals(){
  const weekStart=getWeekStart();
  let stored={};
  if(typeof localStorage!=='undefined'){try{stored=JSON.parse(localStorage.getItem('sh-weekly')||'{}')||{};}catch{stored={};}}
  if(stored.weekStart!==weekStart){
    const streak=getStreakData();
    const xp=getXPData();
    const pace=Math.max(1,Math.min(5,Math.floor((xp.total||0)/200)+1));
    stored.weekStart=weekStart;
    stored.goals=[
      {id:'problems',target:pace*5,label:'Answer '+pace*5+' problems',current:0},
      {id:'streak',target:Math.min(7,pace+2),label:'Maintain a '+Math.min(7,pace+2)+'-day streak',current:streak.current||0},
      {id:'review',target:pace*2,label:'Complete '+pace*2+' review sessions',current:0},
    ];
    stored.completed=false;
    if(typeof localStorage!=='undefined')localStorage.setItem('sh-weekly',JSON.stringify(stored));
  }
  return stored;
}

function updateWeeklyProgress(goalId,increment){
  if(typeof localStorage==='undefined')return;
  const data=getWeeklyGoals();
  const goal=(data.goals||[]).find(g=>g.id===goalId);
  if(!goal)return;
  goal.current+=increment;
  const allMet=data.goals.every(g=>g.current>=g.target);
  if(allMet&&!data.completed){
    data.completed=true;
    awardXP(50,'weekly-goals-'+data.weekStart);
    showToast('All weekly goals complete! +50 XP 🎯');
  }
  localStorage.setItem('sh-weekly',JSON.stringify(data));
  buildWeeklyGoals();
}

function buildWeeklyGoals(){
  if(typeof document==='undefined')return;
  const panel=document.getElementById('weeklyGoals');
  if(!panel)return;
  const data=getWeeklyGoals();
  const goals=data.goals||[];
  if(!goals.length){panel.style.display='none';return;}
  panel.style.display='';
  let html='';
  goals.forEach(g=>{
    const pct=Math.min(100,Math.round(g.current/g.target*100));
    const done=g.current>=g.target;
    html+='<div class="wg-item"><div class="wg-label">'+(done?'✅ ':'')+g.label+'</div><div class="wg-bar"><div class="wg-fill" style="width:'+pct+'%;"></div></div><div class="wg-count">'+Math.min(g.current,g.target)+' / '+g.target+'</div></div>';
  });
  const wgList=document.getElementById('wgList');
  if(wgList)wgList.innerHTML=html;
}

function _recordActivity(){
  if(typeof localStorage==='undefined')return;
  var activity={};
  try{activity=JSON.parse(localStorage.getItem('sh-activity')||'{}');}catch(e){}
  var dateStr=todayStr();
  activity[dateStr]=(activity[dateStr]||0)+1;
  localStorage.setItem('sh-activity',JSON.stringify(activity));
}
function buildHeatmap(){
  if(typeof document==='undefined')return;
  const grid=document.getElementById('heatmapGrid');
  if(!grid)return;
  const streak=getStreakData();
  const history=streak.history||[];
  var activity={};
  if(typeof localStorage!=='undefined'){try{activity=JSON.parse(localStorage.getItem('sh-activity')||'{}');}catch(e){}}
  const today=new Date();
  let html='';
  for(let i=89;i>=0;i--){
    const d=new Date(today);d.setDate(d.getDate()-i);
    const dateStr=d.toISOString().slice(0,10);
    const count=activity[dateStr]||0;
    const active=history.includes(dateStr)||count>0;
    const cls=active?'heatmap-active':'heatmap-empty';
    const titleText=count>0?(dateStr+': '+count+' problem'+(count===1?'':'s')+' solved'):dateStr;
    html+='<div class="heatmap-cell '+cls+'" title="'+titleText+'"></div>';
  }
  grid.innerHTML=html;
}

function activateStreakFreeze(){
  if(typeof localStorage==='undefined'||typeof document==='undefined')return;
  var xd=getXPData();
  if(xd.total<100){showToast('Need at least 100 XP to activate a Streak Freeze.');return;}
  var today=typeof todayStr!=='undefined'?todayStr():new Date().toISOString().slice(0,10);
  try{
    xd.total-=100;
    localStorage.setItem('sh-xp',JSON.stringify(xd));
    localStorage.setItem('sh-streak-freeze',today);
  }catch(e){}
  buildStreakFreezeCard();
  showToast('❄ Streak Freeze activated! Your streak is protected today.');
  updateXP();
}
function buildStreakFreezeCard(){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  var statusEl=document.getElementById('sfStatus');
  var btn=document.getElementById('sfBtn');
  if(!statusEl||!btn)return;
  var today=typeof todayStr!=='undefined'?todayStr():new Date().toISOString().slice(0,10);
  var freeze='';
  try{freeze=localStorage.getItem('sh-streak-freeze')||'';}catch(e){}
  var xd=getXPData();
  if(freeze===today){
    statusEl.innerHTML='<span class="sf-active">❄ Freeze Active — streak protected today</span>';
    btn.disabled=true;btn.textContent='Freeze Active';
  }else{
    statusEl.innerHTML='';
    btn.disabled=xd.total<100;
    btn.textContent='Activate Freeze (100 XP)';
    if(xd.total<100)btn.title='Need 100 XP (have '+xd.total+')';
  }
}
function buildLeaderboard(){
  if(typeof document==='undefined')return;
  var rows=document.getElementById('leaderboardRows');
  if(!rows)return;
  var userXP=0;
  if(typeof getXPData!=='undefined'){var xd=getXPData();userXP=xd.total||0;}
  var fakeEntries=[
    {name:'Alex',xp:4200},
    {name:'Taylor',xp:3800},
    {name:'Jordan',xp:3150},
    {name:'Morgan',xp:2900},
    {name:'Casey',xp:2400}
  ];
  var allEntries=fakeEntries.concat([{name:'You',xp:userXP}]);
  allEntries.sort(function(a,b){return b.xp-a.xp;});
  var html='';
  allEntries.forEach(function(e,i){
    var isYou=e.name==='You';
    html+='<div class="leaderboard-row'+(isYou?' leaderboard-you':'')+'"><span class="leaderboard-rank">'+(i+1)+'</span><span class="leaderboard-name">'+e.name+'</span><span class="leaderboard-xp">'+e.xp.toLocaleString()+' XP</span></div>';
  });
  rows.innerHTML=html;
}
function buildAchievementsPage(){
  if(typeof document==='undefined')return;
  buildCalendar();
  buildLeaderboard();
  buildStreakFreezeCard();
  showAnalytics('accuracy',null);
  const statsEl=document.getElementById('achieveStats');
  const badgeGrid=document.getElementById('achieveBadgeGrid');
  if(!statsEl||!badgeGrid)return;

  const xp=getXPData();
  const streak=getStreakData();
  const summary=getProgressSummary();
  let totalCorrect=0,totalQuestions=0;
  for(const u in summary){totalCorrect+=(summary[u].correct||0);totalQuestions+=(summary[u].total||0);}

  statsEl.innerHTML='<div class="achieve-stat-grid">'+
    '<div class="achieve-stat"><span class="achieve-num">'+(xp.total||0)+'</span><span class="achieve-label">Total XP</span></div>'+
    '<div class="achieve-stat"><span class="achieve-num">'+(xp.level||1)+'</span><span class="achieve-label">Level</span></div>'+
    '<div class="achieve-stat"><span class="achieve-num">'+(streak.current||0)+'</span><span class="achieve-label">Current Streak</span></div>'+
    '<div class="achieve-stat"><span class="achieve-num">'+(streak.longest||0)+'</span><span class="achieve-label">Longest Streak</span></div>'+
    '<div class="achieve-stat"><span class="achieve-num">'+totalCorrect+'/'+totalQuestions+'</span><span class="achieve-label">Problems Correct</span></div>'+
    '</div>';

  const earned=getMilestones();
  const milestones=typeof MILESTONES!=='undefined'?MILESTONES:[];
  let badgeHtml='';
  if(!milestones.length){badgeGrid.innerHTML='<p style="color:var(--muted)">No badges yet. Keep practicing!</p>';return;}
  // Build achievement data for progress calculation
  var achData={totalCorrect:totalCorrect,streak:streak.current||0,unitsComplete:0,xp:xp.total||0,topicsChecked:0,perfectUnits:0,reviewSessions:0,mastered:0};
  // Count units complete and perfect
  for(var _u in summary){var _r=summary[_u];if(_r&&_r.total>0&&_r.total===_r.correct)achData.perfectUnits++;if(_r&&_r.total>0)achData.unitsComplete++;}
  // Count topics
  try{var _ts=getTopicState?getTopicState():{};achData.topicsChecked=Object.values(_ts).filter(Boolean).length;}catch(e){}
  // Count review sessions
  try{var _rv=getReviewMeta?getReviewMeta():{};achData.reviewSessions=Object.keys(_rv||{}).length;}catch(e){}
  // Count mastered flashcards
  try{var _rm=getReviewData?getReviewData():{};achData.mastered=Object.values(_rm||{}).filter(function(c){return c.interval>=30;}).length;}catch(e){}
  function _achProgress(m){
    // Extract target number from milestone description
    var id=m.id;
    var p=0;
    if(id==='first-correct')return Math.min(1,achData.totalCorrect)*100;
    if(id.startsWith('streak-')){var t=parseInt(id.split('-')[1]);return Math.min(100,Math.round(achData.streak/t*100));}
    if(id.startsWith('xp-')){var t=parseInt(id.split('-')[1]);return Math.min(100,Math.round(achData.xp/t*100));}
    if(id.startsWith('topics-')){var t=parseInt(id.split('-')[1]);return Math.min(100,Math.round(achData.topicsChecked/t*100));}
    if(id==='unit-complete')return Math.min(100,achData.unitsComplete*100);
    if(id==='all-units')return Math.min(100,Math.round(achData.unitsComplete/11*100));
    if(id==='perfect-unit')return Math.min(100,achData.perfectUnits*100);
    if(id==='review-10')return Math.min(100,Math.round(achData.reviewSessions/10*100));
    if(id==='review-50')return Math.min(100,Math.round(achData.reviewSessions/50*100));
    if(id==='mastered-10')return Math.min(100,Math.round(achData.mastered/10*100));
    return 0;
  }
  milestones.forEach(m=>{
    const done=!!earned[m.id];
    var pct=done?100:_achProgress(m);
    badgeHtml+='<div class="achieve-badge-card '+(done?'achieved':'locked')+'">'+
      '<div class="achieve-badge-icon">'+m.icon+'</div>'+
      '<div class="achieve-badge-name">'+m.name+'</div>'+
      '<div class="achieve-badge-desc">'+m.desc+'</div>'+
      '<div class="ach-progress"><div class="ach-progress-fill" style="width:'+pct+'%"></div></div>'+
      (done?'<div class="achieve-badge-earned">Earned ✓</div><button class="ach-share-btn" onclick="shareAchievement(\''+m.id+'\')">Share</button>':'<div class="achieve-badge-locked">'+pct+'%</div>')+
    '</div>';
  });
  badgeGrid.innerHTML=badgeHtml;

  // General completion certificate
  var gcArea=document.getElementById('generalCertArea');
  if(gcArea){
    var overallAcc=totalQuestions>0?totalCorrect/totalQuestions:0;
    var unitsCompleted=Object.keys(summary).filter(function(u){var r=summary[u];return r&&r.total>0;}).length;
    if(overallAcc>=0.70){
      gcArea.innerHTML='<button class="cert-btn" onclick="generateGeneralCertificate('+Math.round(overallAcc*100)+','+unitsCompleted+')">🎓 Generate Certificate</button>';
    } else {
      gcArea.innerHTML='<p style="font-size:12px;color:var(--muted);font-family:Space Mono,monospace;">'+(Math.round(overallAcc*100))+'% overall &mdash; reach 70% to unlock completion certificate</p>';
    }
  }
}


// ===================== PHASE 14: BOOKMARKS, NOTES, SEARCH, FILTER =====================
function getBookmarks(){
  if(typeof localStorage==='undefined')return{};
  try{return JSON.parse(localStorage.getItem('sh-bookmarks')||'{}')||{};}catch{return{};}
}
function reportProblem(probId,unit){
  if(typeof localStorage==='undefined'){showToast('Thanks for the report!');return;}
  var reports=[];
  try{reports=JSON.parse(localStorage.getItem('sh-reports')||'[]');}catch(e){}
  reports.push({id:String(probId),unit:unit,timestamp:new Date().toISOString(),reason:'user-report'});
  localStorage.setItem('sh-reports',JSON.stringify(reports));
  showToast('Thanks for the report!');
}

function toggleBookmark(probId){
  if(typeof localStorage==='undefined')return;
  const bm=getBookmarks();
  if(bm[probId])delete bm[probId];
  else bm[probId]=true;
  localStorage.setItem('sh-bookmarks',JSON.stringify(bm));
  updateBookmarkUI(probId);
}

function updateBookmarkUI(probId){
  if(typeof document==='undefined')return;
  const btn=document.getElementById('bm-'+probId);
  if(!btn)return;
  const bm=getBookmarks();
  btn.textContent=bm[probId]?'★':'☆';
  btn.classList.toggle('bookmarked',!!bm[probId]);
}

function printProblemSet(){
  if(typeof window==='undefined'||typeof document==='undefined')return;
  var probs=activeProbs||[];
  if(!probs.length){showToast('No problems to print.');return;}
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Stats Hub — Problem Set</title>';
  html+='<style>body{font-family:Georgia,serif;padding:40px;color:#1a1a2e;max-width:800px;margin:0 auto;}h1{font-size:20px;margin-bottom:4px;}';
  html+='.meta{font-size:12px;color:#666;margin-bottom:32px;}.problem{margin-bottom:28px;page-break-inside:avoid;}';
  html+='.pnum{font-size:11px;color:#666;font-family:monospace;margin-bottom:4px;}.pq{font-size:14px;line-height:1.6;margin-bottom:8px;}';
  html+='.pdata{font-size:12px;background:#f5f5f5;padding:8px 12px;border-radius:4px;margin-bottom:8px;white-space:pre-line;font-family:monospace;}';
  html+='.blank{height:48px;border-bottom:1px solid #ccc;margin-top:8px;}</style></head><body>';
  html+='<h1>Stats Learning Hub — Practice Problems</h1>';
  html+='<div class="meta">Unit '+currentUnit+' &middot; '+probs.length+' problems &middot; '+new Date().toLocaleDateString()+'</div>';
  probs.forEach(function(p,i){
    html+='<div class="problem"><div class="pnum">#'+(i+1)+'. ['+p.diff+'] '+p.topic+'</div>';
    html+='<div class="pq">'+p.q+'</div>';
    if(p.data)html+='<div class="pdata">'+p.data+'</div>';
    html+='<div class="blank"></div></div>';
  });
  html+='<script>window.onload=function(){window.print();}<\/script></body></html>';
  var win=window.open('','_blank');
  if(win){win.document.write(html);win.document.close();}
}
function exportBookmarks(){
  if(typeof localStorage==='undefined'||typeof document==='undefined')return;
  var bm={};
  try{bm=JSON.parse(localStorage.getItem('sh-bookmarks')||'{}');}catch(e){}
  var ids=Object.keys(bm).filter(function(k){return bm[k];});
  var data={bookmarks:ids,exportDate:typeof todayStr!=='undefined'?todayStr():new Date().toISOString().slice(0,10)};
  var json=JSON.stringify(data,null,2);
  if(typeof Blob==='undefined'){showToast('Export not supported in this environment.');return;}
  var blob=new Blob([json],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;a.download='stats-hub-bookmarks-'+data.exportDate+'.json';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Bookmarks exported ('+ids.length+' problems).');
}
function exportNotes(){
  if(typeof document==='undefined'||typeof Blob==='undefined')return;
  var notes=getNotes();
  var keys=Object.keys(notes);
  if(!keys.length){showToast('No notes to export.');return;}
  var lines=['Stats Learning Hub — Notes Export','Exported: '+new Date().toISOString(),'',''];
  keys.forEach(function(id){
    var note=notes[id];
    if(!note)return;
    // Find unit for this problem
    var unit='?';
    for(var u in allProbs){var found=(allProbs[u]||[]).find(function(p){return String(p.id)===String(id);});if(found){unit=u;break;}}
    lines.push('Problem #'+id+' (Unit '+unit+'): '+note);
  });
  var text=lines.join('\n');
  var blob=new Blob([text],{type:'text/plain'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;a.download='stats-hub-notes-'+todayStr()+'.txt';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  showToast('Notes exported!');
}
function getNotes(){
  if(typeof localStorage==='undefined')return{};
  try{return JSON.parse(localStorage.getItem('sh-notes')||'{}')||{};}catch{return{};}
}

function saveNote(probId){
  if(typeof document==='undefined')return;
  const input=document.getElementById('note-'+probId);
  if(!input)return;
  const notes=getNotes();
  const val=input.value.trim();
  if(val)notes[probId]=val;
  else delete notes[probId];
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-notes',JSON.stringify(notes));
  showToast('Note saved');
}

function searchProblems(){
  if(typeof document==='undefined')return;
  const input=document.getElementById('searchInput');
  if(!input)return;
  const query=input.value.toLowerCase().trim();
  const clearBtn=document.getElementById('searchClear');
  if(clearBtn)clearBtn.style.display=query?'':'none';
  if(!query){
    document.querySelectorAll('.pc').forEach(el=>el.style.display='');
    setElText('practiceUnitTag','Unit '+currentUnit+' - '+UNIT_META[currentUnit].name);
    if(typeof localStorage!=='undefined')try{localStorage.setItem('sh-filter-search','');}catch(e){};
    return;
  }
  const results=new Set();
  for(const u in allProbs){
    (allProbs[u]||[]).forEach(p=>{
      const text=(p.q+' '+p.topic+(p.hint||'')+' '+(p.data||'')).toLowerCase();
      if(text.includes(query))results.add(String(p.id));
    });
  }
  document.querySelectorAll('.pc').forEach(el=>{
    const id=el.id.replace('pc-','');
    el.style.display=results.has(id)?'':'none';
  });
  setElText('practiceUnitTag','Search: '+results.size+' result'+(results.size===1?'':'s'));
  if(typeof localStorage!=='undefined')try{localStorage.setItem('sh-filter-search',query);}catch(e){};
}

function clearSearch(){
  if(typeof document==='undefined')return;
  const input=document.getElementById('searchInput');
  if(input)input.value='';
  searchProblems();
  setElText('practiceUnitTag','Unit '+currentUnit+' - '+UNIT_META[currentUnit].name);
}
function sortProblems(method){
  if(typeof document==='undefined')return;
  if(typeof localStorage!=='undefined'){try{localStorage.setItem('sh-problem-sort',method);}catch(e){}}
  var container=document.getElementById('probContainer');
  if(!container)return;
  var cards=Array.from(container.querySelectorAll('.pc'));
  if(!cards.length)return;
  var diffOrder={'easy':0,'medium':1,'hard':2};
  cards.sort(function(a,b){
    var ida=parseInt(a.id.replace('pc-',''))||0;
    var idb=parseInt(b.id.replace('pc-',''))||0;
    var pa=(activeProbs||[]).find(function(p){return String(p.id)===String(ida);});
    var pb=(activeProbs||[]).find(function(p){return String(p.id)===String(idb);});
    if(method==='easy-first'){return (diffOrder[pa&&pa.diff]||0)-(diffOrder[pb&&pb.diff]||0);}
    if(method==='hard-first'){return (diffOrder[pb&&pb.diff]||0)-(diffOrder[pa&&pa.diff]||0);}
    if(method==='id-asc'){return ida-idb;}
    if(method==='id-desc'){return idb-ida;}
    return 0;
  });
  cards.forEach(function(c){container.appendChild(c);});
}
function applySearchChip(term){
  if(typeof document==='undefined')return;
  const input=document.getElementById('searchInput');
  if(input){input.value=term;searchProblems();}
}

function updateFilterCounts(unit){
  if(typeof document==='undefined')return;
  var probs=allProbs[unit]||[];
  var state=getPracticeState(unit);
  var ans=state.answered&&typeof state.answered==='object'?state.answered:{};
  var bm=getBookmarks();
  var counts={
    all:probs.length,
    unanswered:probs.filter(function(p){return ans[p.id]===undefined;}).length,
    wrong:probs.filter(function(p){
      if(ans[p.id]===undefined)return false;
      if(p.type==='mc')return(+ans[p.id])!==p.ans;
      var v=parseFloat(ans[p.id]);return!Number.isFinite(v)||Math.abs(v-p.ans)>(p.tol||0.1);
    }).length,
    bookmarked:probs.filter(function(p){return!!bm[p.id];}).length,
    easy:probs.filter(function(p){return p.diff==='easy';}).length,
    medium:probs.filter(function(p){return p.diff==='medium';}).length,
    hard:probs.filter(function(p){return p.diff==='hard';}).length
  };
  var labels={all:'All',unanswered:'Unanswered',wrong:'Wrong',bookmarked:'★ Bookmarked',easy:'Easy',medium:'Medium',hard:'Hard'};
  document.querySelectorAll('.filter-chip').forEach(function(chip){
    var f=chip.getAttribute('data-filter');
    if(f&&counts[f]!==undefined)chip.textContent=labels[f]+' ('+counts[f]+')';
  });
}
function filterProblems(filter){
  if(typeof document==='undefined')return;
  document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));
  const chip=document.querySelector('.filter-chip[data-filter="'+filter+'"]');
  if(chip)chip.classList.add('active');
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
  if(typeof localStorage!=='undefined')try{localStorage.setItem('sh-filter-diff',filter);}catch(e){};
}


// ===================== PHASE 15: ANALYTICS, PDF EXPORT, CALENDAR =====================
let calDate=typeof Date!=='undefined'?new Date():null;

function showAnalytics(type,evt){
  if(typeof document==='undefined')return;
  if(evt&&evt.target){
    document.querySelectorAll('.analytics-tab').forEach(t=>t.classList.remove('active'));
    evt.target.classList.add('active');
  }
  if(type==='accuracy')drawAccuracyChart();
  else if(type==='xp')drawXPChart();
  else if(type==='units')drawUnitBreakdown();
}

function drawAccuracyChart(){
  const canvas=document.getElementById('analyticsCanvas');if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const dpr=typeof window!=='undefined'?(window.devicePixelRatio||1):1;
  const W=canvas.clientWidth||600;const H=220;
  canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
  if(typeof ctx.setTransform==='function')ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  const summary=getProgressSummary();
  const units=Object.keys(UNIT_META).map(Number);
  const pad=40;const bw=Math.floor((W-pad*2)/units.length)-4;
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
  units.forEach((u,i)=>{
    const r=summary[u]||{total:0,correct:0};
    const pct=r.total?r.correct/r.total:0;
    const x=pad+i*(bw+4);const bh=pct*(H-60);
    ctx.fillStyle=pct>=0.8?'#00e5c7':pct>=0.5?'#f59e0b':'#ff4081';
    ctx.fillRect(x,H-30-bh,bw,bh);
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='10px monospace';ctx.textAlign='center';
    ctx.fillText('U'+u,x+bw/2,H-16);
    if(bh>14)ctx.fillText(Math.round(pct*100)+'%',x+bw/2,H-34-bh);
  });
}

function drawXPChart(){
  const canvas=document.getElementById('analyticsCanvas');if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const dpr=typeof window!=='undefined'?(window.devicePixelRatio||1):1;
  const W=canvas.clientWidth||600;const H=220;
  canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
  if(typeof ctx.setTransform==='function')ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
  const xpData=getXPData();const hist=xpData.history||[];
  if(!hist.length){ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='14px monospace';ctx.textAlign='center';ctx.fillText('No XP history yet',W/2,H/2);return;}
  const byDate={};hist.forEach(e=>{byDate[e.date]=(byDate[e.date]||0)+e.earned;});
  const dates=Object.keys(byDate).sort();const last30=dates.slice(-30);
  let cum=0;const points=last30.map(d=>{cum+=byDate[d];return{date:d,total:cum};});
  const maxXP=Math.max(...points.map(p=>p.total),1);
  const pad=40;
  ctx.strokeStyle='#00e5c7';ctx.lineWidth=2.5;ctx.beginPath();
  points.forEach((p,i)=>{
    const x=pad+i*((W-pad*2)/Math.max(points.length-1,1));
    const y=H-30-(p.total/maxXP)*(H-60);
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  });ctx.stroke();
  ctx.fillStyle='#00e5c7';
  points.forEach((p,i)=>{
    const x=pad+i*((W-pad*2)/Math.max(points.length-1,1));
    const y=H-30-(p.total/maxXP)*(H-60);
    ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();
  });
}

function drawUnitBreakdown(){
  const canvas=document.getElementById('analyticsCanvas');if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const dpr=typeof window!=='undefined'?(window.devicePixelRatio||1):1;
  const W=canvas.clientWidth||600;const H=220;
  canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
  if(typeof ctx.setTransform==='function')ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
  const summary=getProgressSummary();
  const units=Object.keys(UNIT_META).map(Number);
  const pad=40;const rowH=(H-60)/units.length;
  units.forEach((u,i)=>{
    const r=summary[u]||{total:0,correct:0,attempted:0};
    const total=r.total;if(!total)return;
    const correct=r.correct,wrong=(r.attempted||0)-correct,unanswered=total-correct-wrong;
    const y=pad+i*rowH;const maxW=W-pad*2;
    const cw=Math.round(correct/total*maxW),ww=Math.round(wrong/total*maxW),uw=maxW-cw-ww;
    ctx.fillStyle='#00e5c7';ctx.fillRect(pad,y,cw,rowH-2);
    ctx.fillStyle='#ff4081';ctx.fillRect(pad+cw,y,ww,rowH-2);
    ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fillRect(pad+cw+ww,y,uw,rowH-2);
    ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='9px monospace';ctx.textAlign='right';
    ctx.fillText('U'+u,pad-4,y+rowH/2+4);
  });
}

function exportPracticePDF(unit){
  if(typeof window==='undefined')return;
  const probs=allProbs[unit]||[];
  if(!probs.length){showToast('No problems for this unit.');return;}
  let content='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Stats Hub — Unit '+unit+': '+UNIT_META[unit].name+'</title><style>body{font-family:sans-serif;color:#111;padding:40px;max-width:700px;margin:0 auto;line-height:1.6;}h1{font-size:20px;border-bottom:2px solid #111;padding-bottom:8px;}.prob{margin-bottom:24px;page-break-inside:avoid;}.prob-head{font-size:12px;color:#555;margin-bottom:4px;}.prob-q{font-size:14px;margin-bottom:8px;}.choice{margin:4px 0 4px 20px;font-size:13px;}.answer{margin-top:12px;padding:8px 12px;background:#f0f0f0;border-radius:4px;font-size:12px;}</style></head><body><h1>Unit '+unit+': '+UNIT_META[unit].name+'</h1>';
  probs.forEach((p,i)=>{
    content+='<div class="prob"><div class="prob-head">#'+(i+1)+' · '+p.diff+' · '+p.topic+'</div><div class="prob-q">'+p.q+'</div>';
    if(p.data)content+='<div style="background:#f5f5f5;padding:8px;border-radius:4px;font-size:12px;margin-bottom:8px;">'+p.data+'</div>';
    if(p.type==='mc'){const L='ABCD';p.ch.forEach((c,j)=>{content+='<div class="choice">'+L[j]+'. '+c+'</div>';});}
    else{content+='<div style="border:1px solid #ccc;padding:8px;border-radius:4px;min-height:30px;margin-top:8px;color:#999;">Your answer:</div>';}
    content+='<div class="answer"><strong>Answer:</strong> '+(p.type==='mc'?'ABCD'[p.ans]:p.ans)+'<br><strong>Explanation:</strong> '+p.ex+'</div></div>';
  });
  const formulas=FORMULAS[unit]||[];
  if(formulas.length){
    content+='<div style="margin-top:32px;border-top:2px solid #111;padding-top:16px;"><h2 style="font-size:16px;">Formula Reference</h2>';
    formulas.forEach(f=>{content+='<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #ddd;font-size:12px;"><span>'+f.name+'</span><span>'+f.formula+'</span></div>';});
    content+='</div>';
  }
  content+='</body></html>';
  const win=window.open('','_blank');
  if(win){win.document.write(content);win.document.close();if(typeof win.print==='function')win.print();}
}

function buildCalendar(){
  if(typeof document==='undefined')return;
  const grid=document.getElementById('calGrid');
  const monthLabel=document.getElementById('calMonth');
  if(!grid||!monthLabel||!calDate)return;
  const year=calDate.getFullYear(),month=calDate.getMonth();
  monthLabel.textContent=calDate.toLocaleString('default',{month:'long',year:'numeric'});
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const streak=getStreakData();const history=streak.history||[];
  let html='<div class="cal-header">Su</div><div class="cal-header">Mo</div><div class="cal-header">Tu</div><div class="cal-header">We</div><div class="cal-header">Th</div><div class="cal-header">Fr</div><div class="cal-header">Sa</div>';
  for(let i=0;i<firstDay;i++)html+='<div class="cal-cell empty"></div>';
  for(let d=1;d<=daysInMonth;d++){
    const dateStr=year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const active=history.includes(dateStr);const isToday=dateStr===todayStr();
    html+='<div class="cal-cell '+(active?'cal-active':'')+' '+(isToday?'cal-today':'')+'">'+d+'</div>';
  }
  grid.innerHTML=html;
}

function calPrev(){if(calDate){calDate.setMonth(calDate.getMonth()-1);buildCalendar();}}
function calNext(){if(calDate){calDate.setMonth(calDate.getMonth()+1);buildCalendar();}}


// ===================== PHASE 16: FLASHCARDS, MATCHING, FORMULA BUILDER =====================
let fcCards=[],fcIndex=0;
let matchSelected=null,matchedPairs=0,matchPairsTotal=0;
let builderParts=[],builderTarget=null,builderSelected=[];

function initFlashcardsPage(){
  if(typeof document==='undefined')return;
  const sel=document.getElementById('fcUnitSelect');
  if(sel&&!sel.options.length){
    Object.keys(UNIT_META).forEach(u=>{
      const opt=document.createElement('option');
      opt.value=u;opt.textContent='Unit '+u+': '+UNIT_META[u].name;
      sel.appendChild(opt);
    });
  }
  const unit=+(sel?.value||1);
  buildFlashcards(unit);
}

function setFCMode(mode){
  if(typeof document==='undefined')return;
  ['flash','match','build'].forEach(m=>{
    const btn=document.getElementById('fcMode'+m.charAt(0).toUpperCase()+m.slice(1));
    const panel=document.getElementById('fc'+m.charAt(0).toUpperCase()+m.slice(1)+'Mode');
    if(btn)btn.classList.toggle('active',m===mode);
    if(panel)panel.style.display=m===mode?'':'none';
  });
  const unit=+(document.getElementById('fcUnitSelect')?.value||1);
  if(mode==='match')startMatchGame(unit);
  else if(mode==='build')startFormulaBuilder(unit);
}

function buildFlashcards(unit){
  if(typeof document==='undefined')return;
  fcCards=[];fcIndex=0;
  (FORMULAS[unit]||[]).forEach(f=>{
    fcCards.push({front:'What is the formula for '+f.name+'?',back:f.formula,type:'formula'});
  });
  (allProbs[unit]||[]).forEach(p=>{
    const answer=p.type==='mc'?p.ch[p.ans]:String(p.ans);
    fcCards.push({front:p.q,back:answer+' — '+p.ex,type:'problem'});
  });
  for(let i=fcCards.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [fcCards[i],fcCards[j]]=[fcCards[j],fcCards[i]];
  }
  renderFlashcard();
}

function renderFlashcard(){
  if(typeof document==='undefined')return;
  const container=document.getElementById('fcContainer');
  if(!container)return;
  if(!fcCards.length){container.innerHTML='<p style="text-align:center;color:var(--muted)">No flashcards for this unit.</p>';return;}
  const card=fcCards[fcIndex];
  container.innerHTML='<div class="fc-card" id="fcCard" onclick="flipCard()" role="button" tabindex="0" onkeydown="if(event.key===\"Enter\"||event.key===\" \"){event.preventDefault();flipCard();}"><div class="fc-front">'+card.front+'</div><div class="fc-back" style="display:none;">'+card.back+'</div></div>';
  setElText('fcProgress',(fcIndex+1)+' / '+fcCards.length);
  var fill=document.getElementById('fcProgressFill');
  if(fill&&fcCards.length>0)fill.style.width=Math.round((fcIndex+1)/fcCards.length*100)+'%';
}

function flipCard(){
  if(typeof document==='undefined')return;
  const front=document.querySelector('.fc-front');
  const back=document.querySelector('.fc-back');
  if(!front||!back)return;
  const showing=back.style.display!=='none';
  front.style.display=showing?'':'none';
  back.style.display=showing?'none':'';
  const card=document.getElementById('fcCard');
  if(card)card.classList.toggle('flipped',!showing);
}

function fcNext(){if(fcIndex<fcCards.length-1){fcIndex++;renderFlashcard();}}
function fcPrev(){if(fcIndex>0){fcIndex--;renderFlashcard();}}
function fcMark(known){
  if(known)awardXP(2,'flashcard-'+fcIndex);
  fcNext();
}

function startMatchGame(unit){
  if(typeof document==='undefined')return;
  const board=document.getElementById('matchBoard');
  const status=document.getElementById('matchStatus');
  if(!board)return;
  const formulas=FORMULAS[unit]||[];
  if(formulas.length<3){
    board.innerHTML='<p style="color:var(--muted);text-align:center;">Not enough formulas for this unit to play the match game.</p>';
    return;
  }
  const pool=[...formulas].sort(()=>Math.random()-0.5).slice(0,Math.min(6,formulas.length));
  matchPairsTotal=pool.length;matchedPairs=0;matchSelected=null;
  const left=pool.map((f,i)=>({id:i,text:f.name,matched:false})).sort(()=>Math.random()-0.5);
  const right=pool.map((f,i)=>({id:i,text:f.formula,matched:false})).sort(()=>Math.random()-0.5);
  if(status)status.textContent='Match each term with its formula. '+pool.length+' pairs to find.';
  function render(){
    let html='<div class="match-cols"><div class="match-col">';
    left.forEach(l=>{
      html+='<div class="match-item '+(l.matched?'match-done':'')+(matchSelected&&matchSelected.side===0&&matchSelected.id===l.id&&!l.matched?' match-sel':'')+'" id="ml-'+l.id+'" onclick="matchClick(0,'+l.id+')">'+l.text+'</div>';
    });
    html+='</div><div class="match-col">';
    right.forEach(r=>{
      html+='<div class="match-item '+(r.matched?'match-done':'')+(matchSelected&&matchSelected.side===1&&matchSelected.id===r.id&&!r.matched?' match-sel':'')+'" id="mr-'+r.id+'" onclick="matchClick(1,'+r.id+')">'+r.text+'</div>';
    });
    html+='</div></div>';
    board.innerHTML=html;
  }
  window._matchLeft=left;window._matchRight=right;window._matchRender=render;window._matchStatus=status;window._matchPool=pool;
  render();
}

window.matchClick=function(side,id){
  const left=window._matchLeft;const right=window._matchRight;const render=window._matchRender;const status=window._matchStatus;
  if(!matchSelected){
    matchSelected={side,id};render();return;
  }
  if(matchSelected.side===side){matchSelected={side,id};render();return;}
  const lId=side===1?matchSelected.id:id;
  const rId=side===1?id:matchSelected.id;
  const lItem=left.find(x=>x.id===lId);
  const rItem=right.find(x=>x.id===rId);
  if(lId===rId){
    if(lItem)lItem.matched=true;if(rItem)rItem.matched=true;
    matchedPairs++;
    matchSelected=null;
    render();
    if(matchedPairs>=matchPairsTotal){
      if(status)status.textContent='🎉 All '+matchedPairs+' pairs matched! +20 XP';
      awardXP(20,'match-game');
    }
  }else{
    const lEl=document.getElementById('ml-'+lId);const rEl=document.getElementById('mr-'+rId);
    if(lEl)lEl.classList.add('match-wrong');if(rEl)rEl.classList.add('match-wrong');
    setTimeout(()=>{if(lEl)lEl.classList.remove('match-wrong');if(rEl)rEl.classList.remove('match-wrong');},600);
    matchSelected=null;render();
  }
};

function startFormulaBuilder(unit){
  if(typeof document==='undefined')return;
  const target=document.getElementById('builderTarget');
  const piecesEl=document.getElementById('builderPieces');
  const ansEl=document.getElementById('builderAnswer');
  const statusEl=document.getElementById('builderStatus');
  if(!target)return;
  const formulas=FORMULAS[unit]||[];
  if(!formulas.length){target.innerHTML='<p style="color:var(--muted)">No formulas for this unit.</p>';return;}
  builderTarget=formulas[Math.floor(Math.random()*formulas.length)];
  builderParts=builderTarget.formula.split(/([+\-*/=()²√Σ])/g).filter(p=>p.trim());
  builderSelected=[];
  const shuffled=[...builderParts].sort(()=>Math.random()-0.5);
  target.innerHTML='Build the formula for: <strong>'+builderTarget.name+'</strong>';
  if(piecesEl){
    window._builderShuffled=shuffled;piecesEl.innerHTML=shuffled.map((p,i)=>'<button class="builder-piece" id="bp-'+i+'" onclick="builderPick('+i+')">'+(p||'').replace(/</g,'&lt;')+'</button>').join('');
  }
  if(ansEl)ansEl.innerHTML='<div class="builder-slots" id="builderSlots"></div>';
  if(statusEl)statusEl.textContent='';
}

window.builderPick=function(idx){
  if(typeof document==='undefined')return;
  const piece=(window._builderShuffled||[])[idx]||'';
  builderSelected.push(piece);
  const btn=document.getElementById('bp-'+idx);
  if(btn)btn.disabled=true;
  const slots=document.getElementById('builderSlots');
  if(slots)slots.innerHTML=builderSelected.map(p=>'<span class="builder-slot">'+p+'</span>').join(' ');
};

function builderCheck(){
  if(typeof document==='undefined')return;
  const status=document.getElementById('builderStatus');
  if(!builderTarget||!builderParts.length)return;
  const correct=builderSelected.join('')===builderParts.join('');
  if(status)status.textContent=correct?'✅ Correct! +10 XP':'❌ Not quite. The formula is: '+builderTarget.formula;
  if(correct)awardXP(10,'formula-builder');
}


// ===================== PHASE 18: CUSTOM PROBLEM CREATOR, DECK SHARING, RATINGS =====================
function getCustomProblems(){
  if(typeof localStorage==='undefined')return[];
  try{return JSON.parse(localStorage.getItem('sh-custom-problems')||'[]')||[];}catch{return[];}
}

function initCreatePage(){
  if(typeof document==='undefined')return;
  const sel=document.getElementById('cpUnit');
  if(sel&&!sel.options.length){
    Object.keys(UNIT_META).forEach(u=>{
      const opt=document.createElement('option');
      opt.value=u;opt.textContent='Unit '+u+': '+UNIT_META[u].name;
      sel.appendChild(opt);
    });
  }
  buildCustomProblemList();
}

function toggleCreateType(){
  if(typeof document==='undefined')return;
  const type=document.getElementById('cpType')?.value;
  const mc=document.getElementById('cpMCFields');
  const fr=document.getElementById('cpFRFields');
  if(mc)mc.style.display=type==='mc'?'':'none';
  if(fr)fr.style.display=type==='fr'?'':'none';
}

function saveCustomProblem(){
  if(typeof document==='undefined')return;
  const unit=+(document.getElementById('cpUnit')?.value||1);
  const type=document.getElementById('cpType')?.value||'mc';
  const customs=getCustomProblems();
  const id='custom-'+(Date.now());
  const prob={
    id,unit,type,
    diff:document.getElementById('cpDiff')?.value||'medium',
    topic:document.getElementById('cpTopic')?.value||'Custom',
    q:document.getElementById('cpQuestion')?.value||'',
    ex:document.getElementById('cpExplanation')?.value||'',
    hint:document.getElementById('cpHint')?.value||null,
    custom:true
  };
  if(!prob.q||!prob.ex){showToast('Please fill in question and explanation.');return;}
  if(type==='mc'){
    prob.ch=[
      document.getElementById('cpA')?.value||'A',
      document.getElementById('cpB')?.value||'B',
      document.getElementById('cpC')?.value||'C',
      document.getElementById('cpD')?.value||'D'
    ];
    prob.ans=+(document.getElementById('cpMCAns')?.value||0);
  }else{
    const ans=parseFloat(document.getElementById('cpFRAns')?.value||'0');
    if(!Number.isFinite(ans)){showToast('Please enter a numeric answer.');return;}
    prob.ans=ans;
    prob.tol=+(document.getElementById('cpTol')?.value||0.1);
  }
  customs.push(prob);
  if(typeof localStorage!=='undefined')localStorage.setItem('sh-custom-problems',JSON.stringify(customs));
  if(!allProbs[unit])allProbs[unit]=[];
  allProbs[unit].push(prob);
  showToast('Problem saved! Find it in Unit '+unit+' practice. +10 XP');
  awardXP(10,'create-problem-'+id);
  const form=document.getElementById('createForm');if(form)form.reset();
  buildCustomProblemList();
}

function buildCustomProblemList(){
  if(typeof document==='undefined')return;
  const list=document.getElementById('cpList');
  const countEl=document.getElementById('cpCount');
  if(!list)return;
  const customs=getCustomProblems();
  if(countEl)countEl.textContent=customs.length;
  if(!customs.length){list.innerHTML='<p style="color:var(--muted);font-size:13px;">No custom problems yet. Create your first one above!</p>';return;}
  let html='';
  customs.forEach((p,i)=>{
    html+='<div class="custom-prob-item"><div class="custom-prob-head"><span>'+p.q.slice(0,60)+(p.q.length>60?'...':'')+'</span><span class="custom-prob-meta">Unit '+p.unit+' · '+p.diff+'</span></div><button class="custom-prob-del" onclick="deleteCustomProblem('+i+')">✕</button></div>';
  });
  list.innerHTML=html;
}

window.deleteCustomProblem=function(idx){
  if(typeof localStorage==='undefined')return;
  const customs=getCustomProblems();
  const prob=customs[idx];
  customs.splice(idx,1);
  localStorage.setItem('sh-custom-problems',JSON.stringify(customs));
  if(prob&&allProbs[prob.unit]){
    allProbs[prob.unit]=allProbs[prob.unit].filter(p=>p.id!==prob.id);
  }
  buildCustomProblemList();
  showToast('Problem deleted');
};

function exportAllData(){
  if(typeof document==='undefined'||typeof Blob==='undefined')return;
  var data={};
  if(typeof localStorage!=='undefined'){
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i);
      if(k&&k.startsWith('sh-')){
        try{data[k]=JSON.parse(localStorage.getItem(k));}catch(e){data[k]=localStorage.getItem(k);}
      }
    }
  }
  var today=todayStr();
  var json=JSON.stringify({version:2,exportedAt:new Date().toISOString(),data:data},null,2);
  var blob=new Blob([json],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;a.download='stats-hub-export-'+today+'.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  showToast('All data exported!');
}
function exportRoadmapProgress(){
  if(typeof document==='undefined'||typeof Blob==='undefined')return;
  var topics=getTopicState();
  var checked=Object.keys(topics).filter(function(k){return !!topics[k];});
  var data={version:1,type:'roadmap-progress',exportedAt:new Date().toISOString(),checkedTopics:checked,totalChecked:checked.length};
  var json=JSON.stringify(data,null,2);
  var blob=new Blob([json],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;a.download='roadmap-progress.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  showToast('Roadmap progress exported!');
}
function exportCustomDeck(){
  if(typeof document==='undefined'||typeof Blob==='undefined')return;
  const customs=getCustomProblems();
  if(!customs.length){showToast('No custom problems to export.');return;}
  const json=JSON.stringify({version:1,type:'custom-deck',problems:customs},null,2);
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='stats-hub-custom-deck.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  showToast('Deck exported!');
}

function importCustomDeck(){
  if(typeof document==='undefined'||typeof FileReader==='undefined')return;
  const input=document.createElement('input');
  input.type='file';input.accept='.json';
  input.onchange=function(e){
    const file=e&&e.target&&e.target.files?e.target.files[0]:null;if(!file)return;
    const reader=new FileReader();
    reader.onload=function(ev){
      try{
        const data=JSON.parse(ev&&ev.target?ev.target.result:'{}');
        if(!data.problems||!Array.isArray(data.problems))throw new Error('invalid');
        const customs=getCustomProblems();
        let added=0;
        data.problems.forEach(p=>{
          p.id='custom-'+(Date.now()+added);p.custom=true;
          customs.push(p);
          if(!allProbs[p.unit])allProbs[p.unit]=[];
          allProbs[p.unit].push(p);
          added++;
        });
        if(typeof localStorage!=='undefined')localStorage.setItem('sh-custom-problems',JSON.stringify(customs));
        showToast('Imported '+added+' problems!');
        buildCustomProblemList();
      }catch{showToast('Invalid deck file.');}
    };
    reader.readAsText(file);
  };
  if(typeof input.click==='function')input.click();
}

function rateProblem(probId,rating){
  if(typeof localStorage==='undefined')return;
  const ratings=JSON.parse(localStorage.getItem('sh-ratings')||'{}');
  ratings[probId]=rating;
  localStorage.setItem('sh-ratings',JSON.stringify(ratings));
  const row=document.getElementById('rate-'+probId);
  if(row)row.innerHTML='<span class="rate-thanks">Thanks for the rating!</span>';
  awardXP(1,'rate-'+probId);
}

let toastTimer=null;
function showConfetti(){
  if(typeof document==='undefined')return;
  var colors=['var(--cyan)','var(--amber)','var(--green)','var(--pink)','var(--purple)'];
  for(var i=0;i<40;i++){
    var el=document.createElement('div');
    el.className='confetti-piece';
    el.style.cssText='position:fixed;top:-10px;left:'+(Math.random()*100)+'%;width:8px;height:8px;border-radius:'+(Math.random()>0.5?'50%':'2px')+';background:'+colors[Math.floor(Math.random()*colors.length)]+';animation:confetti-fall '+(1+Math.random())+'s linear forwards;z-index:9999;pointer-events:none;';
    document.body.appendChild(el);
    (function(node){setTimeout(function(){if(node.parentNode)node.parentNode.removeChild(node);},2500);})(el);
  }
}
function checkUnitCompletion(unit){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  var probs=allProbs[unit]||[];
  if(!probs.length)return;
  var allCorrect=probs.every(function(p){return answered[p.id]==='correct'||answered[p.id]===p.ans||(typeof answered[p.id]==='number'&&Math.abs(answered[p.id]-p.ans)<=(p.tol||0.1));});
  if(!allCorrect)return;
  var key='sh-confetti-done-'+unit;
  try{if(localStorage.getItem(key))return;localStorage.setItem(key,'1');}catch(e){return;}
  showConfetti();
  showToast('Unit '+unit+' complete! All problems answered correctly! 🎉',3000);
}
function showToast(msg,duration=2000){
  if(typeof document==='undefined')return;
  const toast=document.getElementById('toast');
  if(!toast)return;
  toast.textContent=msg;
  toast.classList.add('toast-visible');
  if(toastTimer)clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{toast.classList.remove('toast-visible');},duration);
  const ann=document.getElementById('a11yAnnounce');if(ann)ann.textContent=msg;
}

function exportUnitProblems(){
  if(typeof document==='undefined')return;
  var probs=allProbs[currentUnit]||[];
  if(!probs.length){showToast('No problems to export');return;}
  var json=JSON.stringify({unit:currentUnit,name:typeof UNIT_META!=='undefined'&&UNIT_META[currentUnit]?UNIT_META[currentUnit].name:'',exported:new Date().toISOString(),problems:probs},null,2);
  if(typeof Blob==='undefined'||typeof URL==='undefined'||typeof URL.createObjectURL!=='function'){showToast('Export unavailable');return;}
  var blob=new Blob([json],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;a.download='unit-'+currentUnit+'-problems.json';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Exported unit '+currentUnit+' problems');
}
function exportProgressJSON(){
  if(typeof document==='undefined')return;
  if(typeof localStorage==='undefined')return;
  const payload={version:1,exported:new Date().toISOString(),practice:{},topics:null,streak:getStreakData(),xp:getXPData(),milestones:getMilestones(),review:getReviewData(),reviewMeta:getReviewMeta(),bookmarks:getBookmarks(),notes:getNotes()};
  for(let unit=1;unit<=MAX_UNIT;unit++){
    try{payload.practice[unit]=JSON.parse(localStorage.getItem('sh-practice-'+unit)||'null');}
    catch{payload.practice[unit]=null;}
  }
  try{payload.topics=JSON.parse(localStorage.getItem('sh-topics')||'null');}
  catch{payload.topics=null;}
  const json=JSON.stringify(payload,null,2);
  if(typeof Blob==='undefined'||typeof URL==='undefined'||typeof URL.createObjectURL!=='function'){
    showToast('Export unavailable');
    return;
  }
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='stats-hub-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Exported!');
}

async function copyProgressSummary(){
  if(typeof document==='undefined')return;
  const summary=getProgressSummary();
  const divider='\u2500'.repeat(29);
  const lines=['Stats Learning Hub \u2014 Progress',divider];
  let totalCorrect=0,totalQuestions=0;
  for(let unit=1;unit<=MAX_UNIT;unit++){
    const row=summary[unit]||{total:0,correct:0};
    const pct=row.total?Math.round((row.correct/row.total)*100):0;
    lines.push('Unit '+String(unit).padStart(2,' ')+': '+row.correct+'/'+row.total+' correct ('+pct+'%)');
    totalCorrect+=row.correct;
    totalQuestions+=row.total;
  }
  let topics={};
  if(typeof localStorage!=='undefined'){
    try{topics=JSON.parse(localStorage.getItem('sh-topics')||'{}')||{};}catch{topics={};}
  }
  const topicKeys=Object.keys(topics);
  const checked=topicKeys.filter(k=>!!topics[k]).length;
  const totalPct=totalQuestions?Math.round((totalCorrect/totalQuestions)*100):0;
  lines.push(divider);
  lines.push('Roadmap: '+checked+'/'+topicKeys.length+' topics checked');
  lines.push(divider);
  lines.push('Total:   '+totalCorrect+'/'+totalQuestions+' correct ('+totalPct+'%)');
  const text=lines.join('\n');

  let copied=false;
  try{
    if(typeof navigator!=='undefined'&&navigator.clipboard&&typeof navigator.clipboard.writeText==='function'){
      await navigator.clipboard.writeText(text);
      copied=true;
    }
  }catch{}

  if(!copied){
    const out=document.getElementById('shareOutput');
    if(out){
      out.value=text;
      out.focus();
      out.select();
      try{copied=document.execCommand('copy');}catch{copied=false;}
    }
  }
  showToast(copied?'Copied to clipboard!':'Unable to copy');
}

function importProgressJSON(file){
  if(typeof document==='undefined'||!file)return;
  if(typeof FileReader==='undefined'){showToast('Import unavailable');return;}
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const text=e&&e.target&&typeof e.target.result==='string'?e.target.result:'';
      const data=JSON.parse(text);
      if(!data||typeof data.practice!=='object'||Array.isArray(data.practice))throw new Error('invalid');
      if(typeof localStorage!=='undefined'){
        Object.keys(data.practice).forEach(unit=>{
          const val=data.practice[unit];
          if(val!==null)localStorage.setItem('sh-practice-'+unit,JSON.stringify(val));
        });
        if(data.topics&&typeof data.topics==='object'&&!Array.isArray(data.topics)){
          localStorage.setItem('sh-topics',JSON.stringify(data.topics));
        }
        if(data.streak&&typeof data.streak==='object'&&!Array.isArray(data.streak)){
          localStorage.setItem('sh-streak',JSON.stringify(data.streak));
        }
        if(data.xp&&typeof data.xp==='object'&&!Array.isArray(data.xp)){
          localStorage.setItem('sh-xp',JSON.stringify(data.xp));
        }
        if(data.milestones&&typeof data.milestones==='object'&&!Array.isArray(data.milestones)){
          localStorage.setItem('sh-milestones',JSON.stringify(data.milestones));
        }
        if(data.review&&typeof data.review==='object'&&!Array.isArray(data.review)){
          localStorage.setItem('sh-review',JSON.stringify(data.review));
        }
        if(data.reviewMeta&&typeof data.reviewMeta==='object'&&!Array.isArray(data.reviewMeta)){
          localStorage.setItem('sh-review-meta',JSON.stringify(data.reviewMeta));
        }
        if(data.bookmarks&&typeof data.bookmarks==='object'&&!Array.isArray(data.bookmarks)){
          localStorage.setItem('sh-bookmarks',JSON.stringify(data.bookmarks));
        }
        if(data.notes&&typeof data.notes==='object'&&!Array.isArray(data.notes)){
          localStorage.setItem('sh-notes',JSON.stringify(data.notes));
        }
      }
      buildProblems(currentUnit);
      buildRoadmap();
      buildProgressPanel();
      updateStreakDisplay();
      updateXPDisplay();
      updateMilestoneDisplay();
      updateReviewBadge();
      checkMilestones();
      showToast('Imported successfully!');
    }catch{
      showToast('Invalid file format');
    }finally{
      const input=document.getElementById('importFile');
      if(input)input.value='';
    }
  };
  reader.onerror=()=>{showToast('Invalid file format');};
  reader.readAsText(file);
}

const LEARNING_PATHS={
  'quick-start':{
    name:'Quick Start',
    desc:'Core stats in 5 units — perfect for beginners',
    icon:'🚀',
    units:[1,2,5,8,9],
    estimatedHours:10,
  },
  'full-course':{
    name:'Full Course',
    desc:'All 14 units in sequence',
    icon:'📚',
    units:[1,2,3,4,5,6,7,8,9,10,11,12,13,14],
    estimatedHours:40,
  },
  'quant-prep':{
    name:'Quant Finance Prep',
    desc:'Focus on probability, distributions, and inference',
    icon:'📈',
    units:[5,6,7,2,8,9,11,14],
    estimatedHours:20,
  },
  'exam-cram':{
    name:'Exam Cram',
    desc:'Hit the high-value topics fast',
    icon:'⚡',
    units:[1,2,8,9,11],
    estimatedHours:8,
  },
};

function getActivePath(){
  if(typeof localStorage==='undefined')return null;
  try{return JSON.parse(localStorage.getItem('sh-active-path')||'null');}catch{return null;}
}

function selectPath(pathId){
  if(typeof localStorage==='undefined')return;
  const path=LEARNING_PATHS[pathId];
  if(!path)return;
  const data={pathId:pathId,startDate:todayStr(),currentStep:0};
  localStorage.setItem('sh-active-path',JSON.stringify(data));
  showToast('Started: '+path.name);
  updatePathDisplay();
  buildPathGrid();
}

function advancePath(){
  if(typeof localStorage==='undefined')return;
  const data=getActivePath();
  if(!data)return;
  const path=LEARNING_PATHS[data.pathId];
  if(!path)return;
  data.currentStep=Math.min(data.currentStep+1,path.units.length-1);
  localStorage.setItem('sh-active-path',JSON.stringify(data));
  updatePathDisplay();
}

function goToPathUnit(){
  const data=getActivePath();
  if(!data)return;
  const path=LEARNING_PATHS[data.pathId];
  if(!path)return;
  const unit=path.units[data.currentStep];
  goPage('practice');setUnit(unit);
}

function updatePathDisplay(){
  if(typeof document==='undefined')return;
  const data=getActivePath();
  const section=document.getElementById('activePath');
  if(!section)return;
  if(!data){section.style.display='none';return;}
  const path=LEARNING_PATHS[data.pathId];
  if(!path){section.style.display='none';return;}
  section.style.display='';
  const fill=document.getElementById('pathFill');
  if(fill)fill.style.width=((data.currentStep+1)/path.units.length*100)+'%';
  const unitName=UNIT_META[path.units[data.currentStep]]?UNIT_META[path.units[data.currentStep]].name:'';
  setElText('pathStatus','Unit '+(data.currentStep+1)+' of '+path.units.length+(unitName?': '+unitName:''));
}

function buildPathGrid(){
  if(typeof document==='undefined')return;
  const grid=document.getElementById('pathGrid');
  if(!grid)return;
  const active=getActivePath();
  let html='';
  Object.keys(LEARNING_PATHS).forEach(function(id){
    const p=LEARNING_PATHS[id];
    const isActive=active&&active.pathId===id;
    html+='<div class="path-card'+(isActive?' path-card-active':'')+'" onclick="selectPath(&quot;'+id+'&quot;)">';
    html+='<div class="path-card-icon">'+p.icon+'</div>';
    html+='<div class="path-card-name">'+p.name+'</div>';
    html+='<div class="path-card-desc">'+p.desc+'</div>';
    html+='<div class="path-card-meta">'+p.units.length+' units · ~'+p.estimatedHours+'h</div>';
    html+='</div>';
  });
  grid.innerHTML=html;
}

function setGoal(){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  const input=document.getElementById('goalDate');
  const date=input?input.value:'';
  if(!date)return;
  localStorage.setItem('sh-goal',date);
  updateGoalDisplay();
}

function updateGoalDisplay(){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  const goalDate=localStorage.getItem('sh-goal');
  if(!goalDate)return;
  const remaining=Math.ceil((new Date(goalDate)-new Date())/(1000*60*60*24));
  setElText('goalDays',Math.max(0,remaining));
  const countdown=document.getElementById('goalCountdown');
  if(countdown)countdown.style.display='';
  const data=getActivePath();
  if(data){
    const path=LEARNING_PATHS[data.pathId];
    if(path){
      const unitsLeft=path.units.length-data.currentStep;
      const pace=remaining>0?Math.ceil(unitsLeft/remaining*7):0;
      setElText('goalPace','Pace needed: ~'+pace+' units/week');
    }
  }
}

function generateGeneralCertificate(accuracyPct,unitsCompleted){
  if(typeof window==='undefined')return;
  var name=window.prompt('Enter your name for the certificate:','Student');
  if(!name)return;
  var today=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  var xp=getXPData();
  var streak=getStreakData();
  var certHtml='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Course Completion Certificate</title><style>body{font-family:Georgia,serif;text-align:center;padding:60px;background:#fffef5;color:#1a1a2e;}.cert{border:4px double #1a1a2e;padding:60px;max-width:700px;margin:0 auto;}h1{font-size:30px;margin-bottom:8px;letter-spacing:2px;}.subtitle{font-size:13px;color:#666;letter-spacing:4px;text-transform:uppercase;margin-bottom:40px;}.name{font-size:28px;font-style:italic;margin:20px 0;color:#0095a3;font-family:Georgia,serif;}.stats{display:flex;justify-content:center;gap:40px;margin:30px 0;font-size:14px;color:#666;}.date{margin-top:40px;font-size:14px;color:#666;}.seal{font-size:52px;margin:20px 0;}</style></head><body><div class="cert"><div class="seal">🎓</div><h1>Certificate of Completion</h1><div class="subtitle">Stats Learning Hub &mdash; Course Completion</div><p>This certifies that</p><div class="name">'+name+'</div><p>has successfully completed the Statistics Learning Hub curriculum</p><div class="stats"><span>Overall Accuracy: '+accuracyPct+'%</span><span>Units Completed: '+unitsCompleted+'</span><span>Level: '+xp.level+'</span><span>XP: '+xp.total+'</span></div><div class="date">'+today+'</div></div><script>window.onload=function(){window.print();}<\/script></body></html>';
  var win=window.open('','_blank');
  if(win){win.document.write(certHtml);win.document.close();}
  awardXP(100,'general-certificate');
  showToast('Certificate generated! 🎓');
}
function generateCertificate(){
  if(typeof window==='undefined')return;
  const data=getActivePath();
  if(!data){showToast('No active learning path!');return;}
  const path=LEARNING_PATHS[data.pathId];
  if(!path)return;
  const summary=getProgressSummary();
  const allComplete=path.units.every(function(u){
    const r=summary[u]||{total:0,correct:0};
    return r.total>0&&r.correct/r.total>=0.6;
  });
  if(!allComplete){showToast('Complete all units in your path first!');return;}
  const today=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  const xp=getXPData();
  const streak=getStreakData();
  const certHtml='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Certificate of Completion</title><style>body{font-family:Georgia,serif;text-align:center;padding:60px;background:#fffef5;color:#1a1a2e;}.cert{border:4px double #1a1a2e;padding:60px;max-width:700px;margin:0 auto;}h1{font-size:32px;margin-bottom:8px;letter-spacing:2px;}.subtitle{font-size:14px;color:#666;letter-spacing:4px;text-transform:uppercase;margin-bottom:40px;}.name{font-size:24px;font-style:italic;margin:20px 0;color:#0095a3;}.path{font-size:18px;margin:10px 0;}.stats{display:flex;justify-content:center;gap:40px;margin:30px 0;font-size:14px;color:#666;}.date{margin-top:40px;font-size:14px;color:#666;}.seal{font-size:48px;margin:20px 0;}</style></head><body><div class="cert"><div class="seal">🎓</div><h1>Certificate of Completion</h1><div class="subtitle">Stats Learning Hub</div><div class="path">'+path.name+'</div><div class="name">'+path.units.length+' Units Completed</div><div class="stats"><span>Level '+xp.level+'</span><span>'+xp.total+' XP</span><span>Best Streak: '+streak.longest+' days</span></div><div class="date">'+today+'</div></div><script>window.onload=function(){window.print();}</script></body></html>';
  const win=window.open('','_blank');
  if(win){win.document.write(certHtml);win.document.close();}
  awardXP(100,'certificate');
  showToast('Congratulations! Certificate generated. 🎓');
}

let stepProgress={};

function revealNextStep(probId,total){
  if(typeof document==='undefined')return;
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
  {keywords:['bayes','posterior','prior'],response:'Bayes’ theorem: P(A|B) = P(B|A)P(A)/P(B). Prior beliefs are updated with data to get posterior probability.'},
  {keywords:['binomial'],response:'Binomial: P(X=k) = C(n,k)p^k(1-p)^(n-k). Mean = np, SD = √(np(1-p)). Used for fixed n trials with two outcomes.'},
  {keywords:['clt','central limit'],response:'Central Limit Theorem: for large n, the sampling distribution of x̄ is approximately Normal regardless of population shape.'},
];

function findTutorResponse(query){
  const q=query.toLowerCase();
  const match=TUTOR_KB.find(function(entry){return entry.keywords.some(function(kw){return q.includes(kw);});});
  if(match)return match.response;
  return "I'm not sure about that. Try asking about specific topics like mean, z-score, regression, or p-value. For detailed help, check the formula reference in Practice mode.";
}

function toggleTutor(){
  if(typeof document==='undefined')return;
  const panel=document.getElementById('tutorPanel');
  if(panel)panel.style.display=panel.style.display==='none'?'flex':'none';
}

function sendTutorMessage(){
  if(typeof document==='undefined')return;
  const input=document.getElementById('tutorInput');
  if(!input||!input.value.trim())return;
  const query=input.value.trim();
  input.value='';
  addTutorMessage(query,'user');
  const response=findTutorResponse(query);
  setTimeout(function(){addTutorMessage(response,'tutor');},300+Math.random()*500);
}

function addTutorMessage(text,sender){
  if(typeof document==='undefined')return;
  const container=document.getElementById('tutorMessages');
  if(!container)return;
  const msg=document.createElement('div');
  msg.className='tutor-msg tutor-msg-'+sender;
  msg.textContent=text;
  container.appendChild(msg);
  container.scrollTop=container.scrollHeight;
}

const NLP_PATTERNS=[
  {
    regex:/z.?score.*x\s*=?\s*([\d.]+).*mean\s*=?\s*([\d.]+).*(?:std|stdev|sigma|sd)\s*=?\s*([\d.]+)/i,
    solve:function(m){const z=(+m[1]-+m[2])/+m[3];return{answer:'z = ('+m[1]+' − '+m[2]+') / '+m[3]+' = '+z.toFixed(4),steps:['x = '+m[1]+', μ = '+m[2]+', σ = '+m[3],'z = (x − μ) / σ','z = ('+m[1]+' − '+m[2]+') / '+m[3],'z = '+z.toFixed(4)]};},
  },
  {
    regex:/mean.*of\s+([\d.,\s]+)/i,
    solve:function(m){const vals=m[1].split(/[,\s]+/).map(Number).filter(function(v){return !isNaN(v);});const avg=mean(vals);return{answer:'Mean = '+avg.toFixed(4),steps:['Values: '+vals.join(', '),'Sum = '+vals.reduce(function(a,b){return a+b;},0),'n = '+vals.length,'Mean = Sum / n = '+avg.toFixed(4)]};},
  },
  {
    regex:/(?:standard deviation|stdev|std dev).*of\s+([\d.,\s]+)/i,
    solve:function(m){const vals=m[1].split(/[,\s]+/).map(Number).filter(function(v){return !isNaN(v);});const sd=stdev(vals);return{answer:'σ = '+sd.toFixed(4),steps:['Values: '+vals.join(', '),'Mean = '+mean(vals).toFixed(4),'σ = √(Σ(xᵢ − x̄)² / n)','σ = '+sd.toFixed(4)]};},
  },
  {
    regex:/median.*of\s+([\d.,\s]+)/i,
    solve:function(m){const vals=m[1].split(/[,\s]+/).map(Number).filter(function(v){return !isNaN(v);});const med=median(vals);return{answer:'Median = '+med,steps:['Values sorted: '+sorted(vals).join(', '),'n = '+vals.length,'Median = '+med]};},
  },
  {
    regex:/(?:probability|P)\s*[((]\s*(?:A\s*(?:and|&|\u2229)\s*B|B\s*(?:and|&|\u2229)\s*A)\s*[))]\s*[=:]?\s*([\d.]+)\s*(?:and|,|\*)\s*([\d.]+)/i,
    solve:function(m){const pA=+m[1],pB=+m[2],pAB=(pA*pB);return{answer:'P(A and B) = '+pA+' × '+pB+' = '+pAB.toFixed(4)+' (if independent)',steps:['P(A) = '+pA+', P(B) = '+pB,'If A and B are independent: P(A ∩ B) = P(A) × P(B)','P(A and B) = '+pA+' × '+pB+' = '+pAB.toFixed(4),'Note: only valid if A and B are independent events']};},
  },
  {
    regex:/binomial\s+n\s*=\s*([\d]+)\s+p\s*=\s*([\d.]+)\s+k\s*=\s*([\d]+)/i,
    solve:function(m){
      const n=+m[1],p=+m[2],k=+m[3];
      const c=comb(n,k);
      const prob=c*Math.pow(p,k)*Math.pow(1-p,n-k);
      return{answer:'P(X='+k+') = '+prob.toFixed(6),steps:['n = '+n+', p = '+p+', k = '+k,'C(n,k) = C('+n+','+k+') = '+c,'P(X=k) = C(n,k) × pᵏ × (1−p)ⁿ⁻ᵏ','= '+c+' × '+p+'ᵏ × '+(1-p)+'ⁿ⁻ᵏ = '+prob.toFixed(6)]};
    },
  },
  {
    regex:/(?:95%?|99%?|90%?)\s*CI\s+(?:for\s+)?p\s*=\s*([\d.]+)\s+n\s*=\s*([\d]+)/i,
    solve:function(m){
      const p=+m[1],n=+m[2];
      const raw=m[0].match(/(\d+)%/);
      const conf=raw?+raw[1]:95;
      const z=conf===99?2.576:conf===90?1.645:1.96;
      const me=z*Math.sqrt(p*(1-p)/n);
      const lo=(p-me).toFixed(4),hi=(p+me).toFixed(4);
      return{answer:'CI: ('+lo+', '+hi+')',steps:['p̂ = '+p+', n = '+n+', z* = '+z+' for '+conf+'% confidence','SE = √(p̂(1−p̂)/n) = √('+p+'*'+(1-p)+'/'+n+') = '+Math.sqrt(p*(1-p)/n).toFixed(4),'ME = z* × SE = '+z+' × '+Math.sqrt(p*(1-p)/n).toFixed(4)+' = '+me.toFixed(4),'CI = p̂ ± ME = '+p+' ± '+me.toFixed(4),'Interval: ('+lo+', '+hi+')']};
    },
  },
  {
    regex:/sample\s*size\s+(?:for\s+)?ME\s*=\s*([\d.]+)\s+p\s*=\s*([\d.]+)/i,
    solve:function(m){
      const me=+m[1],p=+m[2];
      const z=1.96;
      const n=Math.ceil(Math.pow(z/me,2)*p*(1-p));
      return{answer:'n = '+n,steps:['ME = '+me+', p̂ = '+p+', z* = 1.96 (95%)','Formula: n = (z*/ME)² × p̂(1−p̂)','n = ('+z+'/'+me+')² × '+p+' × '+(1-p),'n = '+Math.pow(z/me,2).toFixed(2)+' × '+( p*(1-p)).toFixed(4),'Round up: n = '+n]};
    },
  },
];

function _saveNLPHistory(query){
  if(typeof localStorage==='undefined')return;
  var hist=[];
  try{hist=JSON.parse(localStorage.getItem('sh-nlp-history')||'[]');}catch(e){}
  hist=hist.filter(function(q){return q!==query;});
  hist.unshift(query);
  if(hist.length>5)hist=hist.slice(0,5);
  localStorage.setItem('sh-nlp-history',JSON.stringify(hist));
}
function _applyNLPChip(idx){
  if(typeof document==='undefined'||typeof localStorage==='undefined')return;
  var hist=[];try{hist=JSON.parse(localStorage.getItem('sh-nlp-history')||'[]');}catch(e){}
  var inp=document.getElementById('nlpInput');
  if(inp&&hist[idx]!==undefined){inp.value=hist[idx];solveNLP();}
}
function buildNLPHistory(){
  if(typeof document==='undefined')return;
  var el=document.getElementById('nlpHistory');
  if(!el)return;
  var hist=[];
  if(typeof localStorage!=='undefined'){try{hist=JSON.parse(localStorage.getItem('sh-nlp-history')||'[]');}catch(e){}}
  if(!hist.length){el.innerHTML='';return;}
  el.innerHTML=hist.map(function(q,i){
    var label=q.length>40?q.slice(0,40)+'...':q;
    return '<button class="nlp-history-chip" onclick="_applyNLPChip('+i+')">'+label+'</button>';
  }).join('');
}
function solveNLP(){
  if(typeof document==='undefined')return;
  const input=document.getElementById('nlpInput');
  const result=document.getElementById('nlpResult');
  if(!input||!result)return;
  const query=input.value.trim();
  if(!query)return;
  _saveNLPHistory(query);
  buildNLPHistory();
  for(let i=0;i<NLP_PATTERNS.length;i++){
    const pattern=NLP_PATTERNS[i];
    const match=query.match(pattern.regex);
    if(match){
      const solution=pattern.solve(match);
      let html='<div class="nlp-answer">'+solution.answer+'</div>';
      if(solution.steps){
        html+='<div class="nlp-steps">';
        solution.steps.forEach(function(s,j){html+='<div class="step"><span class="step-num">Step '+(j+1)+':</span> '+s+'</div>';});
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

setUnit(1);
if(typeof document!=='undefined'){
  buildProgressPanel();
  updateStreakDisplay();
  updateXPDisplay();
  updateMilestoneDisplay();
  updateReviewBadge();
  checkMilestones();
  buildPathGrid();
  updatePathDisplay();
  updateGoalDisplay();
  buildNLPHistory();
  buildPOD();
  buildQuickStats();
  buildRecentActivity();
  buildMotivationalQuote();
  loadReadingMode();
  buildPomoHistory();
}
if(typeof document!=='undefined'&&typeof navigator!=='undefined'&&navigator.serviceWorker&&typeof navigator.serviceWorker.register==='function'){
  navigator.serviceWorker.register('./service-worker.js').catch(function(){});
}
if(typeof window!=='undefined'&&typeof window.addEventListener==='function'){
  window.addEventListener('resize',debounce(function(){drawActiveVisualizer(true);},150));
}

// Mobile swipe navigation
if(typeof window!=='undefined'&&typeof document!=='undefined'&&typeof document.addEventListener==='function'){
  var _swipeX=0,_swipeY=0;
  var _swipePages=['home','roadmap','visualizer','practice','review','achievements','flashcards','create'];
  document.addEventListener('touchstart',function(e){
    _swipeX=e.touches[0].clientX;_swipeY=e.touches[0].clientY;
  },{passive:true});
  document.addEventListener('touchend',function(e){
    var dx=e.changedTouches[0].clientX-_swipeX;
    var dy=e.changedTouches[0].clientY-_swipeY;
    if(Math.abs(dx)<50||Math.abs(dy)>Math.abs(dx))return;
    var cur=_swipePages.indexOf(document.querySelector('.page.active')?document.querySelector('.page.active').id.replace('page-',''):'home');
    if(dx<0&&cur<_swipePages.length-1)goPage(_swipePages[cur+1]);
    else if(dx>0&&cur>0)goPage(_swipePages[cur-1]);
  },{passive:true});
}



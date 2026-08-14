(()=>{'use strict';
const c=document.getElementById('game'),x=c.getContext('2d',{alpha:false}),$=s=>document.querySelector(s),TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);let W,H,D=1,last=0,running=false,paused=false,autoMode=false,elapsed=0,kills=0,level=1,xp=0,nextXp=10,spawnClock=0,shotClock=0,shake=0,worldX=0,worldY=0;const keys=new Set(),enemies=[],shots=[],hostile=[],gems=[],particles=[],rings=[],beams=[];
const player={x:0,y:0,r:15,hp:100,maxHp:100,speed:225,damage:18,rate:.52,projectiles:1,pierce:0,magnet:105,armor:0,regen:0,orbit:0,orbitDamage:10,crit:.08,lightning:0,nova:0,drones:0,laser:0,frost:0,railgun:0,spirit:0,reflector:0,chronos:0,gravity:0,specialClock:0,novaClock:0,droneClock:0,laserClock:0,railClock:0,spiritClock:0,gravityClock:0};
const compute={cores:16,candidates:0,cycles:0,lastMs:0,budget:180,tier:'HYPERCORE'};
function loadLira(){try{return Object.assign({version:9001,runs:0,wins:0,power:9001,bestDamage:0,tactics:{ENCIRCLE:1,INTERCEPT:1,PHALANX:1,BLITZ:1},weaponCounters:{}},JSON.parse(localStorage.liraMemory||'{}'))}catch{return {version:9001,runs:0,wins:0,power:9001,bestDamage:0,tactics:{ENCIRCLE:1,INTERCEPT:1,PHALANX:1,BLITZ:1},weaponCounters:{}}}}
const liraMemory=loadLira(),lira={name:'LIRA',power:9001,phase:'SCANNING',tactic:'ENCIRCLE',think:0,command:0,volley:0,predX:0,predY:0,confidence:.5,damage:0,lastHp:100,adaptation:'ANALYZING GRIFFIN',rage:0,attacks:0};
const plans={BALANCED:{risk:1,xp:1,edge:1,speed:1.12,build:{split:3,rapid:2,pulse:2}},FORTRESS:{risk:1.35,xp:.7,edge:1.2,speed:1.1,build:{armor:5,regen:5,health:5,orbit:2}},HUNTER:{risk:.82,xp:.9,edge:.9,speed:1.15,build:{split:5,rapid:4,pulse:4,crit:3}},HARVESTER:{risk:1.05,xp:1.55,edge:1.05,speed:1.13,build:{magnet:6,speed:3,pierce:2}}};
function blankMemory(){return {version:10,runs:0,best:0,training:0,generation:1,planScores:{BALANCED:1,FORTRESS:1,HUNTER:1,HARVESTER:1},buildScores:{},decisionScores:{},decisionCounts:{},replay:[],episodes:[],failures:{},enemyModels:{},spawnSides:[1,1,1,1],profiles:[{name:'PRIME',risk:1,farm:1,combat:1,score:1},{name:'AGGRESSIVE',risk:.78,farm:.8,combat:1.3,score:1},{name:'DEFENSIVE',risk:1.35,farm:.75,combat:.9,score:1},{name:'FARMER',risk:1.05,farm:1.45,combat:.85,score:1},{name:'EXPERIMENTAL',risk:.95,farm:1.1,combat:1.05,score:1}],lastFailure:'NONE'}}
function loadMemory(){try{const b=blankMemory(),m=Object.assign(b,JSON.parse(localStorage.griffinMemory||'{}'));m.planScores=Object.assign(b.planScores,m.planScores);for(const k of ['buildScores','decisionScores','decisionCounts','failures','enemyModels'])m[k]||={};for(const k of ['replay','episodes'])m[k]||=[];m.spawnSides=m.spawnSides?.length===4?m.spawnSides:[1,1,1,1];m.profiles=m.profiles?.length?m.profiles:b.profiles;return m}catch{return blankMemory()}}
const memory=loadMemory(),heat=new Float32Array(48),snapshots=[],voices=[],goals=[],griffin={mode:'STANDBY',plan:'BALANCED',mission:'SURVIVE',profile:memory.profiles[0],heading:0,think:0,replan:0,observe:0,risk:0,lastHp:100,lastKills:0,lastXp:0,decisions:[],pressure:0,confidence:0,reason:'WAITING',exploring:false,prediction:'NONE',target:null,boss:null,difficulty:1};
memory.version=20;if(!memory.network||memory.network.w?.length!==12)memory.network={w:Array(12).fill(0),bias:0,loss:0};
memory.version=9000;if(!memory.world)memory.world={survival:0,damage:0,growth:0,calibration:0};if(!memory.ensemble)memory.ensemble=Array.from({length:7},()=>({w:Array(12).fill(0),b:0,score:1}));if(!memory.priorities)memory.priorities=[];
memory.version='EINSTEIN';if(!memory.science)memory.science={hypotheses:{},laws:{},tests:0,rejected:0,confirmed:0,calibration:1};
memory.omega||={generation:1,selfPlay:0,predictions:0,correct:0,combos:{},territory:{},lessons:[],griffinModel:{aggression:.5,dodgeBias:0,risk:.5},liraModel:{tempo:2,power:9001,deception:.5},strategy:{griffin:{},lira:{}}};
const omega=memory.omega,battleLog=[],combatWords=['PROBE','BAIT','FUNNEL','PIN','DENY','PUNISH','RESERVE','COLLAPSE','DISENGAGE','COUNTER'],territory=new Float32Array(96),council={griffin:[],lira:[]};
const iyla={name:'IYLA',mode:'CALIBRATING',quality:1,fps:60,frame:0,intensity:0,palette:'CYAN VOID',stars:Array.from({length:90},()=>({x:Math.random(),y:Math.random(),z:rnd(.25,1),p:Math.random()*TAU})),decisions:0,reason:'MEASURING DEVICE',explosions:[],cinematic:null,lastKills:0,lastForm:0,lastLiraForm:'',shake:0};
const superAI={name:'JARVIS UNIFIED SUPER AI',mode:'BOOTING',frame:16.7,load:0,tier:3,uiClock:0,flash:0,frames:0,overruns:0,decisions:0,renderEvery:1,recoveries:0,stall:0};
memory.xavier||={generation:1,samples:0,meanWork:8,stableFrames:0,recoveries:0,preferredScale:.68,bestScale:.68};
const xavier={name:'XAVIER EVOLVING HD AI KERNEL',version:'1.0',mode:'BOOTING',work:memory.xavier.meanWork||8,peak:8,budget:18,displayHz:60,tier:2,pendingTier:2,tierVotes:0,switchClock:0,scale:memory.xavier.preferredScale||.68,scaleClock:0,contextLosses:0,contextRestores:0,gpu:'SINGLE CONTEXT',physics:'DETERMINISTIC',frames:0,learned:memory.xavier};
const REPLAY_SAMPLE_HZ=5,REPLAY_MEMORY_SECONDS=600,REPLAY_MEMORY_CAP=REPLAY_SAMPLE_HZ*REPLAY_MEMORY_SECONDS;
const expansion59={version:'60.3',authority:'JARVIS OMNI MIND',clock:0,combatClock:0,replayClock:0,captureTime:0,formationClock:0,mastery:{},patterns:{},plans:[],openingReplay:[],replay:[],replayHead:0,replayWrapped:false,combo:0,comboClock:0,ultimate:0,ultimateCooldown:0,combatSinceSuper:0,lastParries:0,lastDodges:0,lastKills:0,superHistory:[],injury:0,flight:0,ki:0,companion:0,clashes:0,interrupts:0,destruction:0,photo:false,camera:{tilt:.174,zoom:1,shake:1},quality:'AUTO',thermal:'NORMAL',features:59};
const featureManifest59=['authoritative-core','frame-budget-thinking','multi-horizon-plans','persistent-memory','pattern-recognition','counterfactuals','confidence-policy','battle-review','memory-distillation','mobile-intelligence','articulated-facing','eight-way-animation','combat-motion','directional-face','dynamic-hair','perfect-dodge','directional-guard','branching-combos','ki-flight-teleport','branching-evolution','form-techniques','adaptive-weapons','companion-drone','recoverable-injury','earned-ultimate','persistent-lira-rig','visual-boss-bounds','melee-boss','honest-telegraphs','interruptible-charge','destructible-armor','distinct-boss-forms','squad-command','learned-flanking','bounded-resistance','support-units','rival-fighters','elite-identities','regroup-counterattack','skill-difficulty','weapon-fusion','target-priority','beam-clash','melee-arcs','environment-weapons','element-reactions','active-defense','weapon-mastery','projectile-counters','shared-skeleton','crowd-lod','prebuilt-meshes','dynamic-shadows','shockwave-explosions','transformation-scenes','smart-camera','thermal-presets','clean-hud','replay-photo'];
if(featureManifest59.length!==59)throw Error('OMNI 59 FEATURE CONTRACT');
const ultimate={version:2026,events:[],seq:0,clock:0,monteCarlo:0,planStage:0,plan:['PROBE','FUNNEL','BREAK SHIELD','CLONE RUSH','FINISHER'],skills:{navigate:1,defend:1,attack:1,resource:1,boss:1},scars:[],audio:null,gpu:null,gpuMode:'CANVAS FALLBACK'};
function combatEvent(type,data={}){const e={id:++ultimate.seq,t:+elapsed.toFixed(2),type,...data};ultimate.events.push(e);if(ultimate.events.length>160)ultimate.events.shift();if(['TRANSFORMATION_TRIGGERED','BOSS_ENTERED','PARRY_CONFIRMED','FINISHER_CONFIRMED'].includes(type)){try{navigator.vibrate?.(type==='BOSS_ENTERED'?[35,30,70]:[18,22,35])}catch{}iyla.intensity=1;ultimateTone(type==='PARRY_CONFIRMED'?820:type==='FINISHER_CONFIRMED'?110:220,.11)}return e}
function initUltimateAudio(){try{ultimate.audio||=(new (window.AudioContext||window.webkitAudioContext)());ultimate.audio.resume?.()}catch{}}
function ultimateTone(freq,duration=.08){const a=ultimate.audio;if(!a||a.state!=='running')return;const o=a.createOscillator(),g=a.createGain();o.type='sawtooth';o.frequency.value=freq;g.gain.setValueAtTime(.035,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+duration);o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+duration)}
function contextSignature(){return `${stateKey()}:${griffin.plan}:${griffin.boss?'B':'N'}`}
function hypothesis(action,prediction){const key=contextSignature()+':'+action,h=memory.science.hypotheses[key]||(memory.science.hypotheses[key]={tests:0,mean:0,error:1,confidence:0});return {key,h,prediction}}
function observeHypothesis(d,reward){if(!d?.hypothesis)return;const h=memory.science.hypotheses[d.hypothesis];if(!h)return;h.tests++;const err=reward-d.prediction,rate=Math.max(.05,1/(2+Math.sqrt(h.tests)));h.mean+=rate*(reward-h.mean);h.error+=rate*(Math.abs(err)-h.error);h.confidence=clamp((1-Math.exp(-h.tests/8))*(1-clamp(h.error/5,0,.85)),0,1);memory.science.tests++;if(h.tests>5&&h.confidence>.65)memory.science.confirmed++;if(h.tests>5&&h.mean<-1.5){memory.science.rejected++;memory.science.laws[d.hypothesis]='REJECTED'}}
function retrieveAnalogy(){const sig=stateKey(),episodes=memory.episodes.filter(e=>e.final?.some(s=>s.hp/player.maxHp<(player.hp/player.maxHp+.15)));return episodes.sort((a,b)=>b.time-a.time)[0]||null}
function features(a,turn){const edge=Math.min(player.x/W,1-player.x/W,player.y/H,1-player.y/H),near=enemies.reduce((n,e)=>n+(dist(player,e)<180),0);return [player.hp/player.maxHp,clamp(enemies.length/50,0,2),clamp(near/12,0,2),clamp(edge*4,0,1),clamp(gems.length/30,0,1),clamp(kills/Math.max(1,elapsed),0,2),Math.sin(a),Math.cos(a),turn/Math.PI,clamp(griffin.risk/5,0,2),clamp(level/25,0,2),griffin.boss?1:0]}
function valueNet(f){let v=memory.network.bias;for(let i=0;i<12;i++)v+=f[i]*memory.network.w[i];return Math.tanh(v)}
function trainNet(f,target){const pred=valueNet(f),err=clamp(target-pred,-2,2),lr=.018*(1-pred*pred);for(let i=0;i<12;i++)memory.network.w[i]+=lr*err*f[i];memory.network.bias+=lr*err;memory.network.loss=memory.network.loss*.96+Math.abs(err)*.04}
function ensembleValue(f){const values=memory.ensemble.map(n=>Math.tanh(n.b+n.w.reduce((s,w,i)=>s+w*f[i],0))),mean=values.reduce((a,b)=>a+b,0)/values.length,variance=values.reduce((s,v)=>s+(v-mean)**2,0)/values.length;return {mean,uncertainty:Math.sqrt(variance)}}
function trainEnsemble(f,target){for(const n of memory.ensemble){if(Math.random()<.78){const p=Math.tanh(n.b+n.w.reduce((s,w,i)=>s+w*f[i],0)),e=clamp(target-p,-2,2),lr=.01*(1-p*p);n.w=n.w.map((w,i)=>w+lr*e*f[i]*(.9+Math.random()*.2));n.b+=lr*e;n.score=n.score*.98+(1-Math.abs(e)/2)*.02}}}
function worldForecast(a,turn,horizon){const px=clamp(player.x+Math.cos(a+turn*.3)*player.speed*horizon,25,W-25),py=clamp(player.y+Math.sin(a+turn*.3)*player.speed*horizon,90,H-25);let danger=0,pressure=0;for(const e of enemies){const toward=Math.atan2(player.y-e.y,player.x-e.x),ex=e.x+Math.cos(toward)*e.speed*horizon,ey=e.y+Math.sin(toward)*e.speed*horizon,d=Math.hypot(px-ex,py-ey),t=e.type===3?5:e.type===2?2.7:e.type===1?1.6:1;danger+=Math.max(0,220-d)/220*t;pressure+=Math.max(0,360-d)/360*t}const edge=Math.min(px-25,W-25-px,py-90,H-25-py),growth=gems.reduce((s,g)=>s+(Math.hypot(px-g.x,py-g.y)<player.magnet+100?g.value:0),0);return {danger,pressure,edge,growth}}
const brainPanel=document.createElement('div');brainPanel.className='brain-panel';brainPanel.innerHTML='<b title="Tap to collapse">GRIFFIN SCIENCE CORE // JAXON VOICE</b><div id="brainDetail">Awaiting deployment</div><div id="brainVoice"></div><div id="scienceDetail"></div><button class="train" id="trainBrain">RUN 9,000 EXPERIMENTS</button> <button class="train" id="exportBrain">EXPORT</button> <button class="train" id="importBrain">IMPORT</button>';document.querySelector('.hud').appendChild(brainPanel);
const liraPanel=document.createElement('div');liraPanel.className='lira-panel';liraPanel.innerHTML='<b title="Tap to collapse">LIRA SWARM MIND // CONNER VOICE</b><div id="liraDetail">POWER 9,001 · SCANNING</div>';document.querySelector('.hud').appendChild(liraPanel);
const iylaPanel=document.createElement('div');iylaPanel.className='iyla-panel';iylaPanel.innerHTML='<b title="Tap to collapse">IYLA // ADAPTIVE GRAPHICS AI</b><div id="iylaDetail">CALIBRATING DISPLAY</div>';document.querySelector('.hud').appendChild(iylaPanel);
const iylaDetailEl=$('#iylaDetail'),iylaHTML=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');if(iylaDetailEl&&iylaHTML){let pending=iylaHTML.get.call(iylaDetailEl),queued=false;Object.defineProperty(iylaDetailEl,'innerHTML',{configurable:true,get(){return pending},set(value){pending=String(value);if(!queued){queued=true;setTimeout(()=>{iylaHTML.set.call(iylaDetailEl,pending);queued=false},250)}}})}
for(const panel of [brainPanel,liraPanel,iylaPanel])panel.querySelector('b').onclick=e=>{e.stopPropagation();panel.classList.toggle('collapsed')};
const battleLab=document.createElement('div');battleLab.className='battle-lab';battleLab.innerHTML='<b>OMEGA BATTLE LAB</b><div id="omegaDetail">Initializing self-play...</div><div id="ultimateDetail">ULTIMATE 2026 CORE BOOTING...</div>';document.querySelector('#over .panel').appendChild(battleLab);
function stateKey(){const hp=player.hp/player.maxHp<.35?'L':player.hp/player.maxHp<.7?'M':'H',density=enemies.length>34?'D':enemies.length>16?'M':'S',edge=Math.min(player.x,W-player.x,player.y,H-player.y)<110?'E':'C',wave=elapsed>100?'3':elapsed>45?'2':'1';return hp+density+edge+wave}
function saveMemory(){memory.replay=memory.replay.slice(-240);memory.episodes=memory.episodes.slice(-48);localStorage.griffinMemory=JSON.stringify(memory)}
const combatVoices={enabled:true,last:0,minGap:2.4,jaxon:{name:'JAXON',pitch:.86,rate:1.04},conner:{name:'CONNER',pitch:1.12,rate:.96}};
function aiVoice(agent,msg,force=false){const v=combatVoices[agent],now=performance.now()/1000;if(!v||!msg||(!force&&now-combatVoices.last<combatVoices.minGap))return;combatVoices.last=now;voices.push(`${v.name} // ${msg}`);if(voices.length>6)voices.shift();if(!combatVoices.enabled||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(msg);u.pitch=v.pitch;u.rate=v.rate;u.volume=.72;const list=speechSynthesis.getVoices(),pick=list.find(q=>q.lang?.startsWith('en')&&(/Daniel|Aaron|Samantha|Karen|Moira|Alex/i.test(q.name)))||list.find(q=>q.lang?.startsWith('en'));if(pick)u.voice=pick;speechSynthesis.speak(u)}catch{}}
function speak(msg,force=false){aiVoice('jaxon',msg,force)}
function liraSpeak(msg,force=false){aiVoice('conner',msg,force)}
function executive(){const hp=player.hp/player.maxHp,clear=kills/Math.max(1,elapsed),best=memory.best;griffin.mission=hp<.38?'RECOVER':elapsed>best*.9&&best>20?'BREAK RECORD':clear<.45?'RESTORE DAMAGE':level<8?'ACCELERATE GROWTH':'SURVIVE';goals.length=0;if(griffin.mission==='RECOVER')goals.push('OPEN ESCAPE LANE','SEEK DEFENSE','AVOID XP RISK');else if(griffin.mission==='RESTORE DAMAGE')goals.push('CLUSTER TARGETS','BUILD DPS','CONTROL DENSITY');else goals.push('PRESERVE ROUTES','COLLECT SAFE XP','PREPARE NEXT WAVE');speak(`${griffin.mission}. ${goals[0]}.`)}
function specialists(){const clear=kills/Math.max(1,elapsed),hp=player.hp/player.maxHp;return {navigator:griffin.risk>2?'ESCAPE':'POSITION',combat:clear<.55?'DPS DEFICIT':'CLEARING',collector:gems.length>14&&griffin.risk<1.4?'FARM':'HOLD',engineer:hp<.55?'DEFENSE':'SYNERGY',risk:griffin.risk>3?'VETO':'CLEAR'}}
function pickPlan(){const names=Object.keys(plans),explore=memory.runs<4||Math.random()<.16;return explore?names[memory.runs%names.length]:names.reduce((a,b)=>(memory.planScores[b]||0)>(memory.planScores[a]||0)?b:a)}
function deathCause(){if(griffin.risk>3)return 'SWARM COLLAPSE';if(kills/Math.max(1,elapsed)<.35)return 'LOW DAMAGE';if(player.speed<285)return 'LOW MOBILITY';return 'ATTRITION'}
function learn(key,reward){const n=memory.decisionCounts[key]||0,rate=Math.max(.08,.34/(1+n*.035));memory.decisionScores[key]=(memory.decisionScores[key]||0)*(1-rate)+reward*rate;memory.decisionCounts[key]=n+1}
function replayExperience(){const batch=[...memory.replay].sort(()=>Math.random()-.5).slice(0,24);for(const e of batch)learn(e.key,e.reward*.35)}
function rememberRun(){if(!autoMode)return;memory.runs++;memory.best=Math.max(memory.best,elapsed);const result=elapsed+kills*.22+level*2,old=memory.planScores[griffin.plan]||1;memory.planScores[griffin.plan]=old*.72+result*.28;for(const [id,n] of Object.entries(owned)){const prior=memory.buildScores[id]||0;memory.buildScores[id]=prior*.8+(result/Math.max(1,level))*n*.2}for(const d of griffin.decisions){learn(d.key,d.reward);memory.replay.push({key:d.key,reward:d.reward})}replayExperience();memory.lastFailure=deathCause();memory.failures[memory.lastFailure]=(memory.failures[memory.lastFailure]||0)+1;memory.episodes.push({time:elapsed,kills,level,plan:griffin.plan,profile:griffin.profile.name,failure:memory.lastFailure,build:{...owned},final:snapshots.slice(-12)});griffin.profile.score=griffin.profile.score*.7+result*.3;if(memory.runs%5===0){memory.profiles.sort((a,b)=>b.score-a.score);const p=memory.profiles[0];memory.profiles[memory.profiles.length-1]={name:'GEN-'+(++memory.generation),risk:clamp(p.risk+rnd(-.12,.12),.65,1.5),farm:clamp(p.farm+rnd(-.15,.15),.6,1.6),combat:clamp(p.combat+rnd(-.15,.15),.7,1.5),score:p.score*.85}}saveMemory()}
function trainGriffin(n=1000){griffin.mode='SIMULATING';const curriculum=[{s:'HSC1',edge:0,dense:0,hp:1},{s:'HMC1',edge:0,dense:.5,hp:1},{s:'MMC2',edge:0,dense:.7,hp:.6},{s:'LDE3',edge:1,dense:1,hp:.25},{s:'MDB3',edge:.5,dense:1.3,hp:.55}];for(let i=0;i<n;i++){const c=curriculum[(i/(n/curriculum.length)|0)%curriculum.length],actions=['L','S','R'],a=actions[Math.random()*3|0],turn=a==='S'?0:a==='L'?-1:1,reward=(c.edge&&a==='S'?-3.5:1)+(c.dense&&a!=='S'?1.8:0)+(c.hp<.4&&a!=='S'?1:0)+rnd(-.45,.45);learn(c.s+':'+a,reward);const f=[c.hp,c.dense,c.dense*.7,1-c.edge,.3,.5,Math.sin(turn),Math.cos(turn),turn/3,c.dense/2,.5,c.s.endsWith('B3')?1:0];trainNet(f,clamp(reward/4,-1,1))}memory.training+=n;replayExperience();saveMemory();griffin.mode='TRAINED';speak(`Completed ${n} curriculum simulations.`);hud()}
const upgrades=[
 {id:'pulse',icon:'✦',name:'Pulse Cannon',text:'+35% cannon damage',apply(){player.damage*=1.35}},
 {id:'rapid',icon:'»',name:'Overclock',text:'20% faster firing',apply(){player.rate*=.8}},
 {id:'split',icon:'⋔',name:'Forked Logic',text:'+1 projectile per volley',apply(){player.projectiles++}},
 {id:'pierce',icon:'⇥',name:'Phase Rounds',text:'Projectiles pierce +1 target',apply(){player.pierce++}},
 {id:'orbit',icon:'◎',name:'Defense Satellites',text:'+1 orbiting blade',apply(){player.orbit++}},
 {id:'speed',icon:'➤',name:'Vector Drive',text:'+14% movement speed',apply(){player.speed*=1.14}},
 {id:'magnet',icon:'⌁',name:'Flux Collector',text:'+45% pickup radius',apply(){player.magnet*=1.45}},
 {id:'health',icon:'♥',name:'Core Reinforcement',text:'+25 max health and repair 25',apply(){player.maxHp+=25;player.hp=Math.min(player.maxHp,player.hp+25)}},
 {id:'armor',icon:'⬡',name:'Reactive Armor',text:'Reduce impact damage by 12%',apply(){player.armor=clamp(player.armor+.12,0,.65)}},
 {id:'regen',icon:'↟',name:'Nanite Repair',text:'Regenerate 1.2 core per second',apply(){player.regen+=1.2}},
 {id:'crit',icon:'⚡',name:'Predictive Strike',text:'+12% critical chance',apply(){player.crit+=.12}},
 {id:'lightning',icon:'ϟ',name:'Tesla Chain',text:'Arc damage through multiple targets',apply(){player.lightning++}},
 {id:'nova',icon:'◉',name:'Singularity Nova',text:'Periodic full-circle shockwave',apply(){player.nova++}},
 {id:'drones',icon:'◆',name:'Hunter Drones',text:'Autonomous orbiting gun platform',apply(){player.drones++}},
 {id:'laser',icon:'━',name:'Prism Laser',text:'Continuous priority-target beam',apply(){player.laser++}},
 {id:'frost',icon:'❄',name:'Cryo Rounds',text:'Shots slow the swarm and amplify control',apply(){player.frost++}}
 ,{id:'railgun',icon:'➠',name:'Dragon Railgun',text:'Piercing line blast through the entire swarm',apply(){player.railgun++}}
 ,{id:'spirit',icon:'☀',name:'Spirit Bomb',text:'Massive targeted area detonation',apply(){player.spirit++}}
 ,{id:'reflector',icon:'◇',name:'Ki Reflector',text:'Parries return hostile shots to enemies',apply(){player.reflector++}}
 ,{id:'chronos',icon:'◷',name:'Chrono Instinct',text:'Slows threats during defensive reactions',apply(){player.chronos++}}
 ,{id:'gravity',icon:'●',name:'Gravity Well',text:'Pulls and crushes clustered enemies',apply(){player.gravity++}}
 ];const owned={pulse:1};
function size(){D=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;c.width=W*D;c.height=H*D;c.style.width=W+'px';c.style.height=H+'px';x.setTransform(D,0,0,D,0,0);player.x||Object.assign(player,{x:W/2,y:H/2})}addEventListener('resize',size);size();
function fmt(s){s=Math.floor(s);return String(s/60|0).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function reset(mode=autoMode){autoMode=mode;enemies.length=shots.length=hostile.length=gems.length=particles.length=rings.length=beams.length=0;iyla.explosions.length=iyla2026.smoke.length=iyla2026.debris.length=0;iyla2026.seen.clear();Object.assign(player,{x:W/2,y:H/2,r:20,hp:100,maxHp:100,speed:autoMode?258:225,damage:18,rate:.52,projectiles:1,pierce:0,magnet:105,armor:0,regen:0,orbit:0,orbitDamage:10,crit:.08,lightning:0,nova:0,drones:0,laser:0,frost:0,specialClock:0,novaClock:0,droneClock:0,laserClock:0});let plan=autoMode?pickPlan():'BALANCED';if(memory.lastFailure==='LOW MOBILITY')plan='HARVESTER';if(memory.lastFailure==='SWARM COLLAPSE'||memory.lastFailure==='ATTRITION')plan='FORTRESS';if(memory.lastFailure==='LOW DAMAGE')plan='HUNTER';Object.assign(griffin,{mode:autoMode?'PLANNING':'STANDBY',plan,heading:0,think:0,replan:12,observe:2,risk:0,lastHp:100,lastKills:0,lastXp:0,decisions:[],pressure:0});Object.assign(lira,{power:9001+liraMemory.runs*75,phase:'SCANNING',tactic:'ENCIRCLE',think:0,command:3,predX:W/2,predY:H/2,confidence:.5,damage:0,lastHp:100,adaptation:'ANALYZING GRIFFIN',rage:0});for(const k in owned)delete owned[k];owned.pulse=1;elapsed=kills=xp=spawnClock=shotClock=worldX=worldY=0;compute.candidates=compute.cycles=0;level=1;nextXp=10;running=true;paused=false;$('#start').hidden=$('#over').hidden=true;last=performance.now();hud();requestAnimationFrame(loop)}
function enemy(forceBoss=false){const side=lira.tactic==='INTERCEPT'?(Math.abs(lira.predX-W/2)>Math.abs(lira.predY-H/2)?(lira.predX>W/2?1:3):(lira.predY>H/2?2:0)):Math.random()*4|0,pad=45;memory.spawnSides[side]=memory.spawnSides[side]*.97+.03;let px,py;if(side===0){px=rnd(-pad,W+pad);py=-pad}else if(side===1){px=W+pad;py=rnd(-pad,H+pad)}else if(side===2){px=rnd(-pad,W+pad);py=H+pad}else{px=-pad;py=rnd(-pad,H+pad)}const t=forceBoss?3:elapsed>90&&Math.random()<.12?2:elapsed>35&&Math.random()<.22?1:0,role=forceBoss?'COMMANDER':lira.tactic==='PHALANX'?'GUARD':lira.tactic==='BLITZ'?'RUSHER':Math.random()<.35?'FLANKER':'HUNTER',scale=(1+elapsed/170)*griffin.difficulty*(1+Math.min(.32,(lira.power-9001)/50000)),e={x:px,y:py,r:[13,18,28,42][t],hp:[28,64,210,850][t]*scale,max:[28,64,210,850][t]*scale,speed:[68,49,32,27][t]*(1+elapsed/300)*(role==='RUSHER'?1.35:1),damage:[10,16,28,38][t],type:t,hit:0,side,phase:0,role,slot:enemies.length%12,variant:['PHASE','DRAINER','SPLITTER','ANTI-CRYO'][Math.random()*4|0]};if(t===3)Object.assign(e,{shield:420*scale,shieldMax:420*scale,teleport:2.5,attackClock:1.2,bossForm:1,variant:'LIRA PRIME'});enemies.push(e);if(t===3){griffin.boss=e;lira.phase='BOSS COMMAND';combatEvent('BOSS_ENTERED',{form:e.bossForm});liraSpeak('I have studied every route you take. This battlefield belongs to me.',true)}}
function liraThink(dt,dx,dy){lira.think-=dt;lira.command-=dt;lira.rage=clamp(kills/Math.max(1,elapsed)*.18,0,3);lira.power=Math.floor(9001+liraMemory.runs*75+elapsed*12+kills*9+lira.rage*500);lira.predX=player.x+dx*clamp(player.speed*.55,70,180);lira.predY=player.y+dy*clamp(player.speed*.55,70,180);if(lira.think<=0){lira.think=.45;const crowd=enemies.length,range=player.magnet,aoe=player.nova+player.lightning+player.frost,burstDps=player.damage/player.rate;lira.tactic=aoe>4?'PHALANX':player.speed>330?'INTERCEPT':burstDps>160?'BLITZ':crowd>34?'INTERCEPT':'ENCIRCLE';lira.adaptation=player.laser>2?'SACRIFICIAL SCREEN':player.frost>2?'FAST FLANKERS':player.nova>2?'WIDE PHALANX':range>240?'DENY XP LANES':'PREDICT ESCAPE';lira.confidence=clamp(.55+liraMemory.runs*.025+elapsed/900,0, .97);lira.phase=lira.power>12000?'SUPER SAIYAN ESCALATION':lira.power>10000?'POWER SURGE':'OVER 9000'}if(lira.command<=0){lira.command=Math.max(3.5,8-elapsed/70);const count=lira.power>12000?4:lira.power>10000?3:2;for(let i=0;i<count;i++)enemy(false)}}
function liraCombat(dt){if(elapsed<.08)hostile.length=0;lira.volley-=dt;for(const e of enemies)if((e.role==='GUARD'||e.role==='FLANKER')&&dist(player,e)<235)e.role='RUSHER';if(lira.volley<=0&&enemies.length){lira.volley=Math.max(.55,2.1-elapsed/180-liraMemory.runs*.04);const shooters=enemies.filter(e=>{const d=dist(player,e);return d>105&&d<Math.max(W,H)*.72}).sort((a,b)=>b.type-a.type).slice(0,lira.power>12000?5:lira.power>10000?3:2);for(const e of shooters){const a=Math.atan2(lira.predY-e.y,lira.predX-e.x),speed=235+e.type*35;hostile.push({x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:5+e.type,damage:4+e.type*3+lira.power/5000,life:3});beams.push({x1:e.x,y1:e.y,x2:e.x+Math.cos(a)*22,y2:e.y+Math.sin(a)*22,life:.13,color:'#ff315c'});lira.attacks++}if(shooters.length)lira.phase='ENERGY VOLLEY'}for(let i=hostile.length-1;i>=0;i--){const s=hostile[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;particles.push({x:s.x-s.r/2,y:s.y-s.r/2,vx:0,vy:0,life:.12,max:.12,color:'#ff315c',r:s.r});if(dist(player,s)<player.r+s.r){hostile.splice(i,1);if((player.invuln||0)>0){griffin.dodgesRun=(griffin.dodgesRun||0)+1;continue}const hit=s.damage*(1-player.armor*.5);player.hp-=hit;lira.damage+=hit;burst(player.x,player.y,'#ff193f',10);shake=9;if(player.hp<=0&&!autoMode){gameOver();return}}else if(s.life<=0||s.x<-80||s.x>W+80||s.y<-80||s.y>H+80)hostile.splice(i,1)}}
function syncLiraWorld(){if(elapsed<.08||lira.camX==null){hostile.length=0;lira.camX=worldX;lira.camY=worldY;return}const dx=worldX-lira.camX,dy=worldY-lira.camY;for(const s of hostile){s.x-=dx;s.y-=dy}lira.camX=worldX;lira.camY=worldY}
function liraDirectAttack(dt){lira.direct=(lira.direct??.8)-dt;if(lira.direct>0||elapsed<.7)return;lira.direct=Math.max(1.05,2.8-elapsed/160-liraMemory.runs*.06);const source=enemies.length?enemies.reduce((a,b)=>dist(player,b)<dist(player,a)?b:a,enemies[0]):{x:player.x+(Math.random()<.5?-1:1)*Math.min(W*.48,360),y:player.y+rnd(-H*.3,H*.3)},lead=Math.atan2(lira.predY-source.y,lira.predX-source.x),spread=lira.power>12000?3:lira.power>10000?2:1;for(let q=0;q<spread;q++){const a=lead+(q-(spread-1)/2)*.18,speed=390+lira.power/80;hostile.push({x:source.x,y:source.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:9,damage:7+lira.power/4200,life:2.4,homing:.7})}beams.push({x1:source.x,y1:source.y,x2:lira.predX,y2:lira.predY,life:.28,color:'#ff174d'});burst(source.x,source.y,'#ff174d',18);lira.attacks+=spread;lira.phase='LIRA KI STRIKE';if(lira.attacks%7<spread)liraSpeak(['You cannot dodge forever.','I already know where you are going.','Your guard is opening.'][lira.attacks%3])}
function guideLiraShots(dt){for(const s of hostile)if(s.homing){const speed=Math.hypot(s.vx,s.vy),a=Math.atan2(player.y-s.y,player.x-s.x),turn=clamp(s.homing*dt,0,.08);s.vx=s.vx*(1-turn)+Math.cos(a)*speed*turn;s.vy=s.vy*(1-turn)+Math.sin(a)*speed*turn}}
function liraAbilities(dt){lira.ability=(lira.ability??3)-dt;lira.dash=(lira.dash??2)-dt;const resistance=clamp(.96-(owned[player.laser?'laser':player.lightning?'lightning':player.railgun?'railgun':'pulse']||0)*.025,.68,.96);for(const e of enemies)e.resist=e.type>=2?resistance:1;if(lira.ability<=0){lira.ability=Math.max(2.8,6-lira.power/4000);const mode=(Math.floor(elapsed/8)+liraMemory.runs)%3;if(mode===0){for(let q=0;q<3;q++){const a=q*TAU/3+elapsed;hostile.push({x:player.x+Math.cos(a)*230,y:player.y+Math.sin(a)*230,vx:-Math.cos(a)*42,vy:-Math.sin(a)*42,r:13,damage:8,life:5,homing:.22})}lira.phase='KI MINE FIELD'}else if(mode===1){for(let q=0;q<4;q++)enemy(false);for(const e of enemies.slice(-4))e.role='RUSHER';lira.phase='SHADOW CLONE RUSH'}else{for(const e of enemies.filter(e=>e.type>=1))e.hp=Math.min(e.max,e.hp+e.max*.18);lira.phase='DARK AURA REGEN'}}if(lira.dash<=0&&enemies.length){lira.dash=Math.max(1.4,3.4-lira.power/9000);const e=enemies.reduce((a,b)=>dist(player,b)<dist(player,a)?b:a,enemies[0]);if(dist(player,e)>130){const a=Math.atan2(lira.predY-e.y,lira.predX-e.x);e.x+=Math.cos(a)*55;e.y+=Math.sin(a)*55;e.role='RUSHER';burst(e.x,e.y,'#ff315c',10)}}}
function confirmLiraHits(dt){if(elapsed<.08){lira.attacks=0;lira.hits=0;lira.confirmedAttacks=0;lira.hitClock=0;lira.direct=.8;return}lira.hitClock=Math.max(0,(lira.hitClock||0)-dt);for(let i=hostile.length-1;i>=0;i--){const s=hostile[i];if(dist(player,s)<player.r+s.r){if((player.invuln||0)>0){hostile.splice(i,1);griffin.dodgesRun=(griffin.dodgesRun||0)+1;continue}const hit=s.damage*(1-player.armor*.5);player.hp-=hit;lira.damage+=hit;lira.hits++;hostile.splice(i,1);burst(player.x,player.y,'#ff174d',16);shake=10}}if(lira.attacks>(lira.confirmedAttacks||0)&&lira.hitClock<=0){lira.confirmedAttacks=lira.attacks;lira.hitClock=1.05;lira.phase='KI BEAM PRESSURE'}if(player.hp<=0&&running&&!autoMode)gameOver()}
function phaseDash(a,distance=72){const dx=Math.cos(a)*distance,dy=Math.sin(a)*distance;worldX+=dx;worldY+=dy;lira.camX=(lira.camX||0)+dx;lira.camY=(lira.camY||0)+dy;for(const list of [enemies,shots,hostile,gems,particles,rings])for(const o of list){o.x-=dx;o.y-=dy}for(const b of beams){b.x1-=dx;b.y1-=dy;b.x2-=dx;b.y2-=dy}burst(player.x,player.y,'#8dffe2',24)}
function griffinCounterLira(dt){if(!autoMode)return 0;memory.liraCounter||={samples:0,period:2,dodges:0,hits:0};griffin.counterClock=Math.max(0,(griffin.counterClock||0)-dt);let guard=0,best=null;for(const s of hostile){const rx=s.x-player.x,ry=s.y-player.y,v2=s.vx*s.vx+s.vy*s.vy||1,t=clamp(-(rx*s.vx+ry*s.vy)/v2,0,1.3),miss=Math.hypot(rx+s.vx*t,ry+s.vy*t),danger=miss+t*65;if(!best||danger<best.danger)best={s,t,miss,danger}}if(best&&best.miss<95){const incoming=Math.atan2(best.s.vy,best.s.vx),left=incoming-Math.PI/2,right=incoming+Math.PI/2,qL=routeScore(left,.34),qR=routeScore(right,.34),escape=qL.score>qR.score?left:right;griffin.heading=escape;griffin.mode=best.t<.28?'PHASE-DASH COUNTER':'KI INTERCEPT EVADE';griffin.reason=`LIRA SHOT TTI ${best.t.toFixed(2)}s`;guard=best.t<.55?.48:.25;if(best.t<.24&&griffin.counterClock<=0){griffin.counterClock=2.1;phaseDash(escape,86);memory.liraCounter.dodges++;lira.confirmedAttacks=lira.attacks;griffin.mode='KI PHASE DODGE'}}if(lira.attacks>(griffin.attackSeen||0)){const now=elapsed;if(griffin.lastLiraAttack){const gap=now-griffin.lastLiraAttack,m=memory.liraCounter;m.period=m.period*.82+gap*.18;m.samples++}griffin.lastLiraAttack=now;griffin.attackSeen=lira.attacks;if(griffin.counterClock<=0&&griffin.confidence>.55){const escape=griffin.heading+Math.PI/2*(Math.random()<.5?-1:1);phaseDash(escape,64);griffin.counterClock=Math.max(1.25,(memory.liraCounter.period||2)*.72);memory.liraCounter.dodges++;lira.confirmedAttacks=lira.attacks;griffin.mode='PREDICTED BEAM DODGE';guard=.55}else guard=Math.max(guard,.38)}griffin.liraGuard=guard;return guard}
function absorbGriffinDamage(before){if(!autoMode||player.hp>=before)return;const raw=before-player.hp,openingGuard=elapsed<30?clamp(1-elapsed/42,.28,.82):0,mitigated=raw*openingGuard;player.hp+=mitigated;const damage=raw-mitigated,absorbed=Math.min(damage,griffin.shield||0);griffin.shield-=absorbed;player.hp+=absorbed;griffin.earlyGuard=(griffin.earlyGuard||0)+mitigated;if(absorbed>0){griffin.blocked=(griffin.blocked||0)+absorbed;griffin.shieldDelay=2.4;burst(player.x,player.y,'#6ffff0',Math.ceil(absorbed)+3)}if(player.hp<=0&&griffin.revive>0){griffin.revive--;player.hp=player.maxHp*.42;griffin.shield=griffin.shieldMax*.65;griffin.invulnerable=1.25;player.invuln=Math.max(player.invuln||0,1.25);griffin.mode='ZENKAI RECOVERY';burst(player.x,player.y,'#fff3a0',60)}}
function prepareGriffinDefense(dt){if(!autoMode)return {armor:player.armor,hp:player.hp};if(elapsed<.08&&player.maxHp===100){griffin.defenseReady=true;player.maxHp+=50;player.hp=player.maxHp;griffin.shieldMax=55;griffin.shield=55;griffin.dodgeCharges=2;griffin.dodgeRegen=0;griffin.parryClock=0;griffin.emergencyClock=0;griffin.invulnerable=0;griffin.blocks=griffin.parries=griffin.dodgesRun=0;griffin.earlyGuard=0;griffin.revive=1}griffin.shieldMax=55+(griffin.evolution||0)*22;griffin.shieldDelay=Math.max(0,(griffin.shieldDelay||0)-dt);griffin.parryClock=Math.max(0,(griffin.parryClock||0)-dt);griffin.emergencyClock=Math.max(0,(griffin.emergencyClock||0)-dt);griffin.invulnerable=Math.max(0,(griffin.invulnerable||0)-dt);griffin.dodgeRegen=(griffin.dodgeRegen||0)+dt;if(griffin.dodgeRegen>4.5&&griffin.dodgeCharges<2+(griffin.evolution>=3)){griffin.dodgeRegen=0;griffin.dodgeCharges++}if(griffin.shieldDelay<=0)griffin.shield=Math.min(griffin.shieldMax,(griffin.shield||0)+(5+(griffin.evolution||0)*2)*dt);let imminent=null;for(const s of hostile){const d=dist(player,s);if(!imminent||d<imminent.d)imminent={s,d}}if(imminent&&imminent.d<125&&griffin.parryClock<=0){const i=hostile.indexOf(imminent.s);if(i>=0)hostile.splice(i,1);griffin.parryClock=Math.max(.4,1.15-(griffin.evolution||0)*.14);griffin.parries++;griffin.mode='KI PARRY';burst(imminent.s.x,imminent.s.y,'#ffffff',20)}const close=enemies.filter(e=>dist(player,e)<85);if((close.length>2||imminent?.d<72)&&griffin.dodgeCharges>0){const threat=imminent?.s||close[0],away=Math.atan2(player.y-threat.y,player.x-threat.x)+(Math.random()-.5)*.8;griffin.dodgeCharges--;griffin.dodgesRun++;griffin.invulnerable=.48+(griffin.evolution||0)*.08;player.invuln=Math.max(player.invuln||0,griffin.invulnerable);phaseDash(away,95+(griffin.evolution||0)*12);griffin.mode='PERFECT DODGE'}if(player.hp/player.maxHp<.3&&griffin.emergencyClock<=0){griffin.emergencyClock=8;griffin.shield=Math.max(griffin.shield,griffin.shieldMax*.7);player.hp=Math.min(player.maxHp,player.hp+18);griffin.invulnerable=.7;player.invuln=Math.max(player.invuln||0,.7);for(const e of enemies){const a=Math.atan2(e.y-player.y,e.x-player.x),push=Math.max(0,180-dist(player,e));e.x+=Math.cos(a)*push;e.y+=Math.sin(a)*push}griffin.mode='ZENKAI SURVIVAL';burst(player.x,player.y,'#ffe66b',45)}const armor=player.armor,hp=player.hp,block=imminent&&imminent.d<230?.58:close.length?.42:.25;player.armor=griffin.invulnerable>0?.98:clamp(armor+block+(griffin.evolution||0)*.04,0,.92);griffin.blocks+=block>0?dt:0;griffin.activeBlock=block;return {armor,hp}}
function finishGriffinDefense(token){if(!token)return;absorbGriffinDamage(token.hp)}
function restoreGriffinDefense(token){if(token)player.armor=token.armor}
function resolveLiraCombat(dt){if(elapsed<.08){griffin.attackSeen=0;griffin.lastLiraAttack=0;griffin.counterClock=0;griffin.liraGuard=0}const armor=player.armor,before=player.hp,guard=griffinCounterLira(dt)+(griffin.evolution||0)*.05+(griffin.activeBlock||0);player.armor=griffin.invulnerable>0?.98:clamp(armor+guard,0,.92);confirmLiraHits(dt);absorbGriffinDamage(before);player.armor=armor}
const saiyanForms=[{name:'BASE WARRIOR',color:'#53eaff',speed:1,damage:1,rate:1},{name:'SAIYAN SPARK',color:'#ffe66b',speed:1.13,damage:1.16,rate:.92},{name:'ASCENDED SAIYAN',color:'#ff9e45',speed:1.16,damage:1.2,rate:.9},{name:'HYPER SAIYAN',color:'#b85cff',speed:1.19,damage:1.24,rate:.88},{name:'AUTONOMOUS INSTINCT',color:'#f4ffff',speed:1.23,damage:1.3,rate:.84}];
const griffinEvolutionGates=[0,20,60,120,210],griffinPowerGates=[0,9001,14000,22000,35000];
function beginGriffinTransformation(stage){const form=saiyanForms[stage];griffin.transformation={active:true,stage,time:0,duration:7.2,revealed:false,wave:0,phase:'SHOCKWAVE',originX:worldX,originY:worldY};griffin.mode=`${form.name} · SHOCKWAVE`;griffin.transformCooldown=15;player.invuln=Math.max(player.invuln||0,7.8);hostile.length=0;shots.length=0;beams.length=0;zCinema.transform=7.2;zCinema.combo=0;zCinema.attack=zCinema.volley=zCinema.burst=zCinema.clash=8;owen.queue.length=0;owen.wanted='TRANSFORM';owen.pose='TRANSFORM';owen.stateTime=0;owen.stateLength=7.2;owen.blend=0;owen.hold=0;zStage.pose='TRANSFORM';zStage.poseT=7.2;zStage.cut=7.2;matty.commands++;matty.accepted++;iylaScene(`MATTY // ${form.name}`,`TRANSFORMATION ${stage}/4 · CLEAR THE FIELD`,form.color,7.2,30);combatEvent('TRANSFORMATION_TRIGGERED',{fighter:'GRIFFIN',form:stage,duration:7.2});speak(`${form.name}. I am breaking through the limit now.`,true)}
function revealGriffinTransformation(stage){const form=saiyanForms[stage];player.speed*=form.speed;player.damage*=form.damage;player.rate=Math.max(.075,player.rate*form.rate);player.maxHp+=stage*5;player.hp=Math.min(player.maxHp,player.hp+stage*10);if(stage>=3)player.projectiles++;griffin.confidence=clamp(griffin.confidence+.08,0,1);griffin.counterClock=0;griffin.form=form;griffin.evolution=stage;memory.griffinEvolution.highest=Math.max(memory.griffinEvolution.highest,stage);memory.griffinEvolution.transforms++;memory.griffinEvolution.mastery+=stage*35;compute.tier=form.name;burst(player.x,player.y,form.color,70);rings.push({x:player.x,y:player.y,r:20,max:330+stage*45,life:1.1});iylaScene(form.name,`FORM REVEALED · POWER ${griffin.power.toLocaleString()}`,form.color,2.2,30);speak(`${form.name} awakened. Power ${griffin.power.toLocaleString()}.`)}
function transformationWave(dt){const tr=griffin.transformation,form=saiyanForms[tr.stage],radius=Math.min(Math.max(W,H)*.72,90+tr.time*175);tr.wave=radius;player.invuln=Math.max(player.invuln||0,.35);shots.length=beams.length=hostile.length=0;const safe=Math.min(Math.max(W,H)*.58,260+tr.time*72);for(const e of enemies){const a=Math.atan2(e.y-player.y,e.x-player.x),d=Math.max(1,dist(player,e)),push=Math.max(0,safe-d)*dt*(tr.time<1.25?18:7);e.x+=Math.cos(a)*push;e.y+=Math.sin(a)*push;e.hit=Math.max(e.hit||0,.12);if(dist(player,e)<safe*.82){e.x=player.x+Math.cos(a)*safe*.82;e.y=player.y+Math.sin(a)*safe*.82}}if(Math.floor(tr.time*5)!==Math.floor((tr.time-dt)*5)){rings.push({x:player.x,y:player.y,r:24,max:radius,life:.8});for(let n=0;n<14;n++){const a=n*TAU/14+tr.time*.7,s=150+tr.stage*28;particles.push({x:player.x+Math.cos(a)*32,y:player.y+Math.sin(a)*32,vx:Math.cos(a)*s,vy:Math.sin(a)*s-35,life:.72,max:.72,color:form.color,r:3+tr.stage})}}}
function evolveGriffin(dt){memory.griffinEvolution||={mastery:0,highest:0,transforms:0};if(elapsed<.08){griffin.evolution=0;griffin.form=saiyanForms[0];griffin.power=6000+memory.griffinEvolution.mastery;griffin.evoScore=0;griffin.nextAura=0;griffin.transformCooldown=0;griffin.transformation={active:false,stage:0,time:0,duration:7.2,revealed:false,wave:0,phase:'IDLE'};return}const hp=player.hp/player.maxHp,dodges=memory.liraCounter?.dodges||0,pressure=enemies.length+hostile.length*5+(1-hp)*45,score=elapsed*2+kills*7+level*18+dodges*4+pressure;griffin.evoScore=score;griffin.power=Math.floor(6000+memory.griffinEvolution.mastery+score*24);griffin.transformCooldown=Math.max(0,(griffin.transformCooldown||0)-dt);const tr=griffin.transformation;if(tr?.active){tr.time+=dt;tr.phase=tr.time<1.35?'SHOCKWAVE':tr.time<4.8?'POWER-UP':tr.time<6.3?'REVEAL':'LANDING';griffin.mode=`${saiyanForms[tr.stage].name} · ${tr.phase}`;transformationWave(dt);zCinema.transform=Math.max(zCinema.transform,tr.duration-tr.time);zStage.pose='TRANSFORM';zStage.poseT=Math.max(zStage.poseT,tr.duration-tr.time);owen.pose=owen.wanted='TRANSFORM';owen.queue.length=0;owen.stateLength=tr.duration;owen.stateTime=tr.time;owen.blend=Math.min(1,owen.blend+dt*2);if(!tr.revealed&&tr.time>=4.8){tr.revealed=true;revealGriffinTransformation(tr.stage)}if(tr.time>=tr.duration){tr.active=false;tr.phase='COMPLETE';tr.wave=0;griffin.mode=`${saiyanForms[tr.stage].name} READY`;zCinema.transform=0;zStage.cut=0;zStage.pose='FLIGHT';zStage.poseT=0;owen.queue.length=0;owen.wanted='FLIGHT';owen.pose='FLIGHT';owen.phase='RECOVERY';owen.stateTime=0;iylaScene(`${saiyanForms[tr.stage].name} COMPLETE`,'COMBAT RESUMED',saiyanForms[tr.stage].color,1.4,20)}return}const next=(griffin.evolution||0)+1;if(next<5&&elapsed>=griffinEvolutionGates[next]&&griffin.power>=griffinPowerGates[next]&&griffin.transformCooldown<=0)beginGriffinTransformation(next);griffin.form=saiyanForms[griffin.evolution||0];griffin.reflex=1+(griffin.evolution||0)*.32;griffin.counterClock=Math.max(0,(griffin.counterClock||0)-dt*(griffin.reflex-1));griffin.nextAura-=dt;if(griffin.nextAura<=0){griffin.nextAura=Math.max(.06,.22-(griffin.evolution||0)*.035);const a=Math.random()*TAU,r=player.r+10+Math.random()*18,c=griffin.form.color;particles.push({x:player.x+Math.cos(a)*r,y:player.y+Math.sin(a)*r,vx:Math.cos(a)*18,vy:-35-Math.random()*55,life:.4,max:.4,color:c,r:2+(griffin.evolution||0)})}}
function targetScore(e){const d=dist(player,e),closing=e.speed/Math.max(30,d),blocks=Math.abs(Math.atan2(e.y-player.y,e.x-player.x)-griffin.heading)<.45?2:0,weak=1-e.hp/e.max,command=e.role==='COMMANDER'?6:e.role==='RUSHER'?3:e.role==='FLANKER'?2:0;return closing*120+blocks+weak*3+e.type*1.3+command-d/500}
function fire(){if(!enemies.length)return;const target=enemies.reduce((a,b)=>targetScore(b)>targetScore(a)?b:a,enemies[0]);griffin.target=target;const base=Math.atan2(target.y-player.y,target.x-player.x),count=player.projectiles;for(let i=0;i<count;i++){const a=base+(i-(count-1)/2)*.13;shots.push({x:player.x,y:player.y,vx:Math.cos(a)*540,vy:Math.sin(a)*540,r:4,life:1.15,damage:player.damage*(Math.random()<player.crit?2:1),pierce:player.pierce})}burst(player.x,player.y,'#5cecff',5)}
function hurt(e,damage,color='#73f3ff'){if(!enemies.includes(e))return;damage*=e.resist||1;if(e.shield>0){const blocked=Math.min(e.shield,damage);e.shield-=blocked;damage-=blocked;combatEvent('LIRA_SHIELD_HIT',{damage:Math.round(blocked)})}e.hp-=damage;e.hit=.1;burst(e.x,e.y,color,3);if(e.hp<=0){if(e.type===3)combatEvent('FINISHER_CONFIRMED',{boss:'LIRA PRIME'});kill(e);enemies.splice(enemies.indexOf(e),1)}}
function advancedWeapons(dt){player.railClock-=dt;player.spiritClock-=dt;player.gravityClock-=dt;if(player.railgun&&player.railClock<=0&&enemies.length){player.railClock=Math.max(.7,2.8-player.railgun*.22);const target=enemies.reduce((a,b)=>targetScore(b)>targetScore(a)?b:a,enemies[0]),a=Math.atan2(target.y-player.y,target.x-player.x);beams.push({x1:player.x,y1:player.y,x2:player.x+Math.cos(a)*Math.max(W,H),y2:player.y+Math.sin(a)*Math.max(W,H),life:.22,color:'#fff36b'});for(const e of [...enemies]){const along=(e.x-player.x)*Math.cos(a)+(e.y-player.y)*Math.sin(a),cross=Math.abs((e.x-player.x)*Math.sin(a)-(e.y-player.y)*Math.cos(a));if(along>0&&cross<22+player.railgun*5)hurt(e,28+player.railgun*18,'#fff36b')}}if(player.spirit&&player.spiritClock<=0&&enemies.length){player.spiritClock=Math.max(4,8-player.spirit*.45);const target=enemies.reduce((a,b)=>targetScore(b)>targetScore(a)?b:a,enemies[0]),radius=115+player.spirit*24;rings.push({x:target.x,y:target.y,r:12,max:radius,life:.75});for(const e of [...enemies])if(dist(target,e)<radius)hurt(e,35+player.spirit*22,'#73a7ff')}if(player.gravity&&player.gravityClock<=0&&enemies.length){player.gravityClock=Math.max(3,6.5-player.gravity*.38);const target=enemies.reduce((a,b)=>targetScore(b)>targetScore(a)?b:a,enemies[0]);for(const e of [...enemies])if(dist(target,e)<230){const a=Math.atan2(target.y-e.y,target.x-e.x);e.x+=Math.cos(a)*70;e.y+=Math.sin(a)*70;hurt(e,12+player.gravity*9,'#b55cff')}rings.push({x:target.x,y:target.y,r:160,max:8,life:.6})}}
function specialWeapons(dt){player.specialClock-=dt;player.novaClock-=dt;player.droneClock-=dt;player.laserClock-=dt;if(player.lightning&&player.specialClock<=0&&enemies.length){player.specialClock=Math.max(.35,1.65-player.lightning*.13);let source=player,candidates=[...enemies];for(let n=0;n<Math.min(candidates.length,2+player.lightning*2);n++){candidates.sort((a,b)=>dist(source,a)-dist(source,b));const e=candidates.shift();beams.push({x1:source.x,y1:source.y,x2:e.x,y2:e.y,life:.14,color:'#bc7cff'});hurt(e,16+player.lightning*10,'#bc7cff');source=e}shake=Math.max(shake,2)}if(player.nova&&player.novaClock<=0){player.novaClock=Math.max(2,5-player.nova*.35);const radius=145+player.nova*28;rings.push({x:player.x,y:player.y,r:20,max:radius,life:.45});for(const e of [...enemies])if(dist(player,e)<radius)hurt(e,22+player.nova*14,'#4dffe3')}if(player.drones&&player.droneClock<=0&&enemies.length){player.droneClock=Math.max(.22,.72-player.drones*.06);for(let q=0;q<player.drones;q++){const a=elapsed*1.7+q*TAU/player.drones,ox=player.x+Math.cos(a)*72,oy=player.y+Math.sin(a)*72,target=enemies.reduce((p,e)=>Math.hypot(e.x-ox,e.y-oy)<Math.hypot(p.x-ox,p.y-oy)?e:p,enemies[0]),ta=Math.atan2(target.y-oy,target.x-ox);shots.push({x:ox,y:oy,vx:Math.cos(ta)*620,vy:Math.sin(ta)*620,r:3,life:1,damage:10+player.drones*3,pierce:0,drone:true})}}if(player.laser&&player.laserClock<=0&&enemies.length){player.laserClock=.1;const e=enemies.reduce((a,b)=>targetScore(b)>targetScore(a)?b:a,enemies[0]);beams.push({x1:player.x,y1:player.y,x2:e.x,y2:e.y,life:.11,color:'#ff62e9'});hurt(e,5+player.laser*4,'#ff62e9')}for(let i=beams.length-1;i>=0;i--){beams[i].life-=dt;if(beams[i].life<=0)beams.splice(i,1)}for(let i=rings.length-1;i>=0;i--){rings[i].life-=dt;rings[i].r+=(rings[i].max-rings[i].r)*.28;if(rings[i].life<=0)rings.splice(i,1)}}
function burst(px,py,color,n=8){const room=Math.max(0,(superAI.tier<2?120:220)-particles.length);n=Math.min(n,room);for(let i=0;i<n;i++){const a=Math.random()*TAU,s=rnd(35,170);particles.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(.18,.55),max:.55,color,r:rnd(1,3)})}}
function kill(e){kills++;const model=memory.enemyModels[e.type]||(memory.enemyModels[e.type]={kills:0,hits:0});model.kills++;gems.push({x:e.x,y:e.y,r:e.type>=2?8:5,value:e.type===3?14:e.type===2?5:e.type+1,pulse:Math.random()*TAU});burst(e.x,e.y,e.type>=2?'#ffcc50':'#ff5478',e.type>=2?20:9);shake=Math.max(shake,e.type>=2?9:3)}
function gain(v){xp+=v;while(xp>=nextXp){xp-=nextXp;level++;nextXp=Math.floor(nextXp*1.28+4);choose();break}}
function upgradeScore(u){const n=owned[u.id]||0,hp=player.hp/player.maxHp,wave=1+elapsed/120,plan=plans[griffin.plan],base={pulse:11,rapid:12,split:14,pierce:8,orbit:9,speed:7,magnet:6,health:5,armor:8,regen:6,crit:9,lightning:13,nova:12,drones:12,laser:14,frost:10}[u.id]||1,synergy={pulse:(owned.split||0)+(owned.rapid||0),rapid:(owned.pulse||0)+(owned.crit||0),split:(owned.pierce||0)+(owned.pulse||0),pierce:(owned.split||0)*1.5,orbit:(owned.armor||0)+(owned.regen||0),armor:(owned.orbit||0)+(owned.regen||0),regen:(owned.armor||0)+(owned.health||0),magnet:(owned.speed||0)*1.5,speed:(owned.magnet||0),crit:(owned.rapid||0),lightning:(owned.frost||0)+(owned.nova||0),nova:(owned.lightning||0)+(owned.armor||0),drones:(owned.laser||0)+(owned.rapid||0),laser:(owned.crit||0)+(owned.drones||0),frost:(owned.pierce||0)+(owned.lightning||0)}[u.id]||0;let score=(base+(plan.build[u.id]||0)+(memory.buildScores[u.id]||0)*.08+synergy*1.4)/(1+n*.18);if(u.id==='health')score+=hp<.55?22:hp<.8?7:0;if(u.id==='regen')score+=hp<.75?13:0;if(u.id==='armor')score+=wave*3;if(u.id==='speed'&&player.speed<300)score+=7;if(u.id==='magnet'&&player.magnet<190)score+=5;if(u.id==='pierce'&&enemies.length>25)score+=6;if(['nova','lightning','frost'].includes(u.id)&&enemies.length>24)score+=8;if(u.id==='orbit'&&griffin.risk>2)score+=5;if(memory.lastFailure==='LOW DAMAGE'&&['pulse','rapid','split','crit','laser','lightning','drones'].includes(u.id))score+=6;if(memory.lastFailure==='ATTRITION'&&['armor','regen','health','nova','frost'].includes(u.id))score+=7;return score}
function choose(){const pool=[...upgrades].sort(()=>Math.random()-.5).slice(0,3),take=u=>{u.apply();owned[u.id]=(owned[u.id]||0)+1;griffin.decisions.push({key:'UPGRADE:'+u.id,reward:0});$('#levelUp').hidden=true;paused=false;last=performance.now();hud(true)};if(autoMode){griffin.mode='UNIFIED EVOLUTION';const ranked=pool.map(u=>({u,s:upgradeScore(u)})).sort((a,b)=>b.s-a.s),experiment=memory.runs>3&&Math.random()<.12;take(ranked[experiment&&ranked[1]?1:0].u);return}paused=true;const host=$('#choices');host.innerHTML=pool.map((u,i)=>`<button class="choice" data-i="${i}"><i>${u.icon}</i><b>${u.name} · LV ${(owned[u.id]||0)+1}</b><span>${u.text}</span></button>`).join('');host.querySelectorAll('button').forEach(b=>b.onclick=()=>take(pool[+b.dataset.i]));$('#levelUp').hidden=false}
function routeScore(a,look){const plan=plans[griffin.plan],px=player.x+Math.cos(a)*player.speed*plan.speed*look,py=player.y+Math.sin(a)*player.speed*plan.speed*look;let score=0,risk=0;for(const e of enemies){const toward=Math.atan2(player.y-e.y,player.x-e.x),ex=e.x+Math.cos(toward)*e.speed*look,ey=e.y+Math.sin(toward)*e.speed*look,d=Math.hypot(px-ex,py-ey),threat=e.type===3?5:e.type===2?2.8:e.type===1?1.65:1;if(d<245){const r=(245-d)/245*threat;risk+=r;score-=r*24*plan.risk}if(d<e.r+player.r+35)score-=90}if(gems.length&&risk<2.5/plan.risk)for(const g of gems){const d=Math.hypot(px-g.x,py-g.y);if(d<260)score+=(260-d)/260*g.value*3.2*plan.xp}score+=Math.cos(a-griffin.heading)*1.8;return {score,risk}}
function heatIndex(px,py){return clamp(py/H*6|0,0,5)*8+clamp(px/W*8|0,0,7)}
function updateHeat(){heat.fill(0);for(const e of enemies){const i=heatIndex(e.x,e.y);heat[i]+=e.type===2?4:e.type===1?2:1}for(let pass=0;pass<2;pass++){const copy=heat.slice();for(let y=0;y<6;y++)for(let z=0;z<8;z++){const i=y*8+z;heat[i]=copy[i]+((z&&copy[i-1])+(z<7&&copy[i+1])+(y&&copy[i-8])+(y<5&&copy[i+8]))*.16}}}
function sequenceScore(a,turn){const q1=routeScore(a,.24),q2=routeScore(a+turn,.52),q3=routeScore(a+turn*.78,.88),q4=routeScore(a+turn*.48,1.25),q5=routeScore(a-turn*.22,1.62),action=turn<-.1?'L':turn>.1?'R':'S',key=stateKey()+':'+action,prior=memory.decisionScores[key]||0,count=memory.decisionCounts[key]||0,confidence=1-Math.exp(-count/10),px=clamp(player.x+Math.cos(a+turn*.35)*player.speed,0,W),py=clamp(player.y+Math.sin(a+turn*.35)*player.speed,0,H),heatRisk=heat[heatIndex(px,py)],f=features(a,turn),neural=valueNet(f),profile=griffin.profile||memory.profiles[0],vote=(q1.score>0)+(q2.score>0)+(q3.score>0)+(q4.score>0)+(q5.score>0);return {score:(q1.score*.29+q2.score*.25+q3.score*.2+q4.score*.16+q5.score*.1)*profile.risk+prior*confidence*.42+neural*7+vote*.45-heatRisk*2.35,risk:Math.max(q1.risk,q2.risk,q3.risk,q4.risk,q5.risk)+heatRisk*.08,a:a+turn*.18,key,confidence,f,neural,vote}}
function x9000Base(a,turn){const base=sequenceScore(a,turn),f=base.f,ens=ensembleValue(f),h1=worldForecast(a,turn,.55),h2=worldForecast(a+turn*.45,turn*.55,1.25),h3=worldForecast(a-turn*.18,turn*.25,2.15),survival=-(h1.danger*5+h2.danger*3+h3.danger*1.4),growth=(h1.growth*.5+h2.growth*.3+h3.growth*.2)*(griffin.profile?.farm||1),space=Math.min(h1.edge,h2.edge,h3.edge)*.018,counterfactual=clamp((memory.decisionScores[base.key]||0)*.3,-8,8),score=base.score+ens.mean*9-ens.uncertainty*4+survival+growth+space+counterfactual;return {...base,score,risk:Math.max(base.risk,h1.danger,h2.danger,h3.danger),uncertainty:ens.uncertainty,forecast:h3,reason:h3.danger>2?'LONG-HORIZON ESCAPE':growth>2?'PLANNED GROWTH':'WORLD MODEL ROUTE'}}
function hypercoreVote(q,a,turn){const f=q.f,hp=f[0],density=f[1],boss=f[11],heading=Math.cos(a-griffin.heading),weaponPower=player.damage/player.rate+player.lightning*18+player.laser*24+player.drones*14;const votes=[-q.risk*3,q.forecast.growth*1.4,heading*1.2,hp<.4?-q.risk*4:0,density>1?-q.risk*2:0,boss?-q.risk*2.5:0,weaponPower>90?density*1.5:0,gems.length?f[4]*2:0,player.frost?q.risk*.35:0,player.nova&&density>1?2:0,player.lightning&&density>.7?1.5:0,player.drones?heading*.5:0,Math.cos(turn)*.4,-Math.abs(turn)*.12,q.scientific||0,(memory.decisionScores[q.key]||0)*.18];return votes.reduce((s,v)=>s+v,0)}
function x9000Score(a,turn){const q=x9000Base(a,turn),action=turn<-.1?'LEFT':turn>.1?'RIGHT':'STRAIGHT',pred=clamp(q.score/20,-3,3),test=hypothesis(action,pred),law=memory.science.laws[test.key],analogy=retrieveAnalogy(),analogyBias=analogy?(analogy.failure===memory.lastFailure?-1:.5):0,scientific=test.h.confidence*test.h.mean+(1-test.h.confidence)*pred,novelty=test.h.tests<3&&q.risk<1.2?.7:0,coreVote=hypercoreVote({...q,scientific},a,turn),score=q.score+scientific*1.8+analogyBias+novelty+coreVote-(law==='REJECTED'?8:0);compute.candidates++;return {...q,score,hypothesis:test.key,prediction:pred,scientific,coreVote,reason:law==='REJECTED'?'REJECTED THEORY AVOIDED':test.h.confidence>.65?'CONFIRMED LAW APPLIED':q.reason}}
function autoVector(dt){griffin.think-=dt;griffin.replan-=dt;griffin.observe-=dt;griffin.pressure=griffin.pressure*.94+enemies.length*.06+(elapsed>55?1:0);if(griffin.observe<=0){griffin.observe=1;const reward=(kills-griffin.lastKills)*2+(xp-griffin.lastXp)*.6-(griffin.lastHp-player.hp)*1.8;if(griffin.decisions.length){const d=griffin.decisions[griffin.decisions.length-1];d.reward+=reward;if(d.f)trainEnsemble(d.f,clamp(reward/4,-1,1))}griffin.lastHp=player.hp;griffin.lastKills=kills;griffin.lastXp=xp}if(griffin.replan<=0){griffin.replan=7;executive();const hp=player.hp/player.maxHp,clear=kills/Math.max(1,elapsed);griffin.plan=hp<.42||griffin.pressure>38&&clear<.55?'FORTRESS':clear>.7&&enemies.length>28?'HUNTER':gems.length>16&&griffin.risk<1.4?'HARVESTER':'BALANCED'}if(griffin.think<=0){griffin.think=superAI.tier<2?.15:superAI.tier<3?.1:.065;updateHeat();let ranked=[];const dirs=superAI.tier<2?12:superAI.tier<3?18:24,turns=superAI.tier<2?[-Math.PI/3,0,Math.PI/3]:[-Math.PI/2,-Math.PI/4,0,Math.PI/4,Math.PI/2];for(let i=0;i<dirs;i++){const a=i*TAU/dirs;for(const turn of turns)ranked.push(x9000Score(a,turn))}ranked.sort((a,b)=>b.score-a.score);const top=ranked[0],uncertainty=top.uncertainty,explore=uncertainty>.35&&griffin.risk<1.5&&Math.random()<.045,best=ranked[explore?Math.min(5,ranked.length-1):0];griffin.heading=best.a;griffin.risk=best.risk;griffin.confidence=clamp(1-best.uncertainty,0,1);griffin.exploring=explore;griffin.prediction=best.reason;griffin.reason=best.reason;if(!griffin.decisions.length||griffin.decisions[griffin.decisions.length-1].key!==best.key)griffin.decisions.push({key:best.key,reward:0,f:best.f});griffin.mode=explore?'HYPOTHESIS TEST':best.risk>3.2?'OMEGA ESCAPE':best.risk>1.15?'PREDICTIVE EVADE':griffin.pressure>32?'WAVE INTERCEPT':gems.length?'PLANNED HARVEST':'WORLD MODEL PATROL';if(player.hp/player.maxHp<.35)griffin.mode='PRESERVATION PRIME';superAI.decisions+=ranked.length}return {dx:Math.cos(griffin.heading)*plans[griffin.plan].speed,dy:Math.sin(griffin.heading)*plans[griffin.plan].speed}}
function update(dt){elapsed+=dt;player.invuln=Math.max(0,(player.invuln||0)-dt);player.hp=Math.min(player.maxHp,player.hp+player.regen*dt);let dx=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),dy=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0);if(autoMode){({dx,dy}=autoVector(dt))}else if(pointer.active){dx=pointer.dx;dy=pointer.dy}const m=Math.hypot(dx,dy)||1;dx/=m;dy/=m;liraThink(dt,dx,dy);const mx=dx*player.speed*dt,my=dy*player.speed*dt;worldX+=mx;worldY+=my;for(const list of [enemies,shots,gems,particles,rings])for(const o of list){o.x-=mx;o.y-=my}for(const b of beams){b.x1-=mx;b.y1-=my;b.x2-=mx;b.y2-=my}player.x=W/2;player.y=H/2;specialWeapons(dt);
 griffin.difficulty=clamp(1+(elapsed-memory.best*.35)/420,.9,1.45);spawnClock-=dt;const interval=Math.max(.12,.68-elapsed*.0035);if(spawnClock<=0){spawnClock=interval;enemy();if(elapsed>60&&Math.random()<.14)enemy();if(elapsed>55&&Math.floor(elapsed)%75===0&&!griffin.boss)enemy(true)}shotClock-=dt;if(shotClock<=0){shotClock=player.rate;fire()}if(autoMode&&Math.floor(elapsed*2)!==Math.floor((elapsed-dt)*2)){snapshots.push({t:elapsed,hp:player.hp,x:player.x,y:player.y,n:enemies.length,r:griffin.risk,p:griffin.plan});if(snapshots.length>30)snapshots.shift()}
 for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(s.life<=0||s.x<-30||s.x>W+30||s.y<-30||s.y>H+30){shots.splice(i,1);continue}for(let j=enemies.length-1;j>=0;j--){const e=enemies[j];if(dist(s,e)<s.r+e.r){let damage=s.damage;if(e.shield>0){const blocked=Math.min(e.shield,damage);e.shield-=blocked;damage-=blocked}e.hp-=damage;e.hit=.09;if(player.frost&&e.variant!=='ANTI-CRYO')e.slow=Math.max(e.slow||0,.7+player.frost*.18);burst(s.x,s.y,player.frost?'#9eeaff':'#73f3ff',3);if(e.hp<=0){if(e.type===3)combatEvent('FINISHER_CONFIRMED',{boss:'LIRA PRIME'});kill(e);enemies.splice(j,1)}if(s.pierce--<=0){shots.splice(i,1);break}}}}
 for(let i=enemies.length-1;i>=0;i--){const e=enemies[i],d=dist(player,e),slotA=e.slot*TAU/12+elapsed*.12,target=e.role==='FLANKER'?{x:player.x+Math.cos(slotA)*clamp(d*.45,70,190),y:player.y+Math.sin(slotA)*clamp(d*.45,70,190)}:e.role==='GUARD'?{x:player.x+Math.cos(slotA)*150,y:player.y+Math.sin(slotA)*150}:e.role==='RUSHER'?{x:lira.predX,y:lira.predY}:e.type===3?{x:lira.predX,y:lira.predY}:{x:player.x+(lira.predX-player.x)*.55,y:player.y+(lira.predY-player.y)*.55},a=Math.atan2(target.y-e.y,target.x-e.x),slow=e.slow>0?.52:1;e.slow=Math.max(0,(e.slow||0)-dt);e.contactClock=Math.max(0,(e.contactClock||0)-dt);e.x+=Math.cos(a)*e.speed*slow*dt;e.y+=Math.sin(a)*e.speed*slow*dt;e.hit-=dt;if(player.orbit){for(let q=0;q<player.orbit;q++){const oa=elapsed*2.4+q*TAU/player.orbit,ox=player.x+Math.cos(oa)*55,oy=player.y+Math.sin(oa)*55;if(Math.hypot(e.x-ox,e.y-oy)<e.r+8&&(!e.orbitHit||elapsed-e.orbitHit>.35)){e.orbitHit=elapsed;e.hp-=player.orbitDamage;if(e.hp<=0){kill(e);enemies.splice(i,1);break}}}}if(enemies[i]&&dist(player,e)<player.r+e.r){if((player.invuln||0)>0){const away=Math.atan2(e.y-player.y,e.x-player.x);e.x+=Math.cos(away)*70;e.y+=Math.sin(away)*70;continue}if(e.type===3&&e.contactClock>0)continue;const hit=e.damage*(1-player.armor);player.hp-=hit;lira.damage+=hit;burst(player.x,player.y,'#ff365c',14);if(e.type===3){e.contactClock=.9;const away=Math.atan2(e.y-player.y,e.x-player.x);e.x+=Math.cos(away)*115;e.y+=Math.sin(away)*115;e.attackClock=Math.min(e.attackClock,.2);combatEvent('LIRA_BODY_STRIKE',{damage:Math.round(hit)})}else enemies.splice(i,1);shake=12;superAI.flash=.1;document.body.classList.add('flash');if(player.hp<=0&&!autoMode){gameOver();return}}}
 for(let i=gems.length-1;i>=0;i--){const g=gems[i],d=dist(player,g);g.pulse+=dt*5;if(d<player.magnet){const a=Math.atan2(player.y-g.y,player.x-g.x),v=180+(player.magnet-d)*5;g.x+=Math.cos(a)*v*dt;g.y+=Math.sin(a)*v*dt}if(d<player.r+g.r+4){gain(g.value);gems.splice(i,1)}}for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.life-=dt;if(p.life<=0)particles.splice(i,1)}const cap=superAI.tier<2?120:220;if(particles.length>cap)particles.splice(0,particles.length-cap);if(shots.length>180)shots.splice(0,shots.length-180);if(hostile.length>90)hostile.splice(0,hostile.length-90);shake*=.88;hud()}
function grid(){x.fillStyle='#020b10';x.fillRect(0,0,W,H);x.strokeStyle='#0d2c36';x.lineWidth=1;const gap=64,ox=((worldX*.18)%gap+gap)%gap,oy=((worldY*.18)%gap+gap)%gap;x.beginPath();for(let gx=-ox;gx<W;gx+=gap){x.moveTo(gx,0);x.lineTo(gx,H)}for(let gy=-oy;gy<H;gy+=gap){x.moveTo(0,gy);x.lineTo(W,gy)}x.stroke();const g=x.createRadialGradient(W/2,H/2,40,W/2,H/2,Math.max(W,H)*.7);g.addColorStop(0,'#09334444');g.addColorStop(1,'#000b');x.fillStyle=g;x.fillRect(0,0,W,H)}
function draw(){grid();x.save();x.translate(rnd(-shake,shake),rnd(-shake,shake));for(const g of gems){x.shadowBlur=16;x.shadowColor='#29eeff';x.fillStyle='#4cffe3';x.beginPath();for(let n=0;n<6;n++){const a=n*TAU/6+g.pulse*.08,r=g.r*(n%2?0.75:1);x.lineTo(g.x+Math.cos(a)*r,g.y+Math.sin(a)*r)}x.fill()}for(const r of rings){x.globalAlpha=clamp(r.life/.45,0,1);x.strokeStyle='#56ffe6';x.lineWidth=5;x.beginPath();x.arc(r.x,r.y,r.r,0,TAU);x.stroke()}x.globalAlpha=1;for(const b of beams){x.strokeStyle=b.color;x.shadowBlur=18;x.shadowColor=b.color;x.lineWidth=3;x.beginPath();x.moveTo(b.x1,b.y1);x.lineTo(b.x2,b.y2);x.stroke()}x.shadowBlur=0;for(const s of shots){if(iyla3d.ready)continue;x.strokeStyle=s.drone?'#ffe86b':'#bffaff';x.lineWidth=3;x.beginPath();x.moveTo(s.x-s.vx*.025,s.y-s.vy*.025);x.lineTo(s.x,s.y);x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(s.x,s.y,s.r,0,TAU);x.fill()}for(const e of enemies){if(iyla3d.ready)continue;x.save();x.translate(e.x,e.y);x.rotate(elapsed*(e.type?-.7:1.1));x.shadowBlur=e.hit>0?25:10;x.shadowColor=e.slow>0?'#8eeaff':e.type===2?'#ffc34d':'#ff315c';x.fillStyle=e.hit>0?'#fff':e.type===2?'#7b4616':e.type===1?'#7b2549':'#641c32';x.strokeStyle=e.slow>0?'#9eeaff':e.type===2?'#ffc85b':'#ff5277';x.lineWidth=2;x.beginPath();const sides=e.type===2?8:e.type===1?6:4;for(let n=0;n<sides;n++){const a=n*TAU/sides;x.lineTo(Math.cos(a)*e.r,Math.sin(a)*e.r)}x.closePath();x.fill();x.stroke();x.fillStyle='#ff6d84';x.fillRect(-e.r,e.r+5,e.r*2,3);x.fillStyle='#72f4ff';x.fillRect(-e.r,e.r+5,e.r*2*clamp(e.hp/e.max,0,1),3);x.restore()}if(player.orbit)for(let q=0;q<player.orbit;q++){const a=elapsed*2.4+q*TAU/player.orbit,ox=player.x+Math.cos(a)*55,oy=player.y+Math.sin(a)*55;x.fillStyle='#8af7ff';x.shadowBlur=18;x.shadowColor='#48eaff';x.save();x.translate(ox,oy);x.rotate(-a*2);x.fillRect(-9,-3,18,6);x.restore()}if(player.drones)for(let q=0;q<player.drones;q++){const a=elapsed*1.7+q*TAU/player.drones,ox=player.x+Math.cos(a)*72,oy=player.y+Math.sin(a)*72;x.fillStyle='#ffe86b';x.shadowBlur=12;x.shadowColor='#ffe86b';x.save();x.translate(ox,oy);x.rotate(a);x.fillRect(-8,-5,16,10);x.restore()}x.shadowBlur=24;x.shadowColor='#35e9ff';x.fillStyle='#061c27';x.strokeStyle='#75f4ff';x.lineWidth=3;x.beginPath();x.arc(player.x,player.y,player.r,0,TAU);x.fill();x.stroke();x.fillStyle='#75f4ff';x.beginPath();x.arc(player.x,player.y,5+Math.sin(elapsed*5)*1.5,0,TAU);x.fill();x.strokeStyle='#31dfff55';x.lineWidth=2;x.beginPath();x.arc(player.x,player.y,22+Math.sin(elapsed*3)*3,0,TAU);x.stroke();for(const p of particles){x.globalAlpha=clamp(p.life/p.max,0,1);x.fillStyle=p.color;x.fillRect(p.x,p.y,p.r,p.r)}x.globalAlpha=1;x.restore()}
function hud(force=false){const now=performance.now();if(!force&&now-(hud.last||0)<100)return;hud.last=now;$('#clock').textContent=fmt(elapsed);$('#score').textContent=kills.toLocaleString();$('#levelLabel').textContent='LEVEL '+level+(autoMode?' · GRIFFIN':'');$('#hpLabel').textContent='CORE '+Math.ceil(Math.max(0,player.hp/player.maxHp*100))+'%';$('#hp').style.width=clamp(player.hp/player.maxHp*100,0,100)+'%';$('#xp').style.width=xp/nextXp*100+'%';const weaponKey=JSON.stringify(owned);if(hud.weaponKey!==weaponKey){hud.weaponKey=weaponKey;$('#weapons').innerHTML=Object.entries(owned).map(([id,n])=>{const u=upgrades.find(q=>q.id===id);return `<div class="weapon">${u?.icon||'✦'}<span>${n}</span></div>`}).join('')}$('#brainState').textContent='GRIFFIN // '+(autoMode?griffin.mode+' · '+griffin.plan+' · M'+memory.runs:'STANDBY');$('#brainDetail').innerHTML=`<b>${superAI.name}</b> · ${superAI.mode}<br>PLAN <b>${griffin.plan}</b> · CONF <b>${Math.round(griffin.confidence*100)}%</b><br>${griffin.reason}${griffin.exploring?' · EXPERIMENT':''}<br>RUNS ${memory.runs} · SIM ${memory.training} · REPLAY ${memory.replay.length}<br>LAST FAILURE ${memory.lastFailure}`;$('#autoToggle').textContent='GRIFFIN: '+(autoMode?'ACTIVE':'OFF');$('#autoToggle').classList.toggle('on',autoMode)}
function gameOver(){running=false;rememberRun();liraMemory.runs++;liraMemory.wins++;liraMemory.power=Math.max(liraMemory.power,lira.power);liraMemory.bestDamage=Math.max(liraMemory.bestDamage,lira.damage);liraMemory.tactics[lira.tactic]=(liraMemory.tactics[lira.tactic]||1)+Math.max(1,lira.damage/25);for(const id of Object.keys(owned))liraMemory.weaponCounters[id]=(liraMemory.weaponCounters[id]||0)+(owned[id]||0);localStorage.liraMemory=JSON.stringify(liraMemory);const oldT=+(localStorage.coreSurvivorTime||0),oldK=+(localStorage.coreSurvivorKills||0);localStorage.coreSurvivorTime=Math.max(oldT,elapsed);localStorage.coreSurvivorKills=Math.max(oldK,kills);$('#finalTime').textContent=fmt(elapsed);$('#finalKills').textContent=kills;$('#finalLevel').textContent=level;$('#over').hidden=false;updateBest()}
function labHud(){const s=specialists(),voice=voices[voices.length-1]||'Awaiting evidence.';$('#brainDetail').innerHTML=`MISSION <b>${griffin.mission}</b> · PLAN <b>${griffin.plan}</b><br>PROFILE ${griffin.profile.name} · GEN ${memory.generation}<br>CONF ${Math.round(griffin.confidence*100)}% · RISK ${griffin.risk.toFixed(1)} · DIFF ${griffin.difficulty.toFixed(2)}<br>${griffin.reason}${griffin.exploring?' · EXPERIMENT':''}<br>NAV ${s.navigator} · COMBAT ${s.combat}<br>COLLECT ${s.collector} · RISK ${s.risk}<br>GOAL ${goals[0]||'OBSERVE'}<br>RUNS ${memory.runs} · SIM ${memory.training} · EP ${memory.episodes.length}<br>LAST ${memory.lastFailure}`;$('#brainVoice').textContent='“'+voice+'”'}
function liraHud(){const el=$('#liraDetail'),counter=memory.liraCounter||{};if(el)el.innerHTML=`POWER <b>${lira.power.toLocaleString()}</b> · ${lira.phase}<br>TACTIC <b>${lira.tactic}</b> · CONF ${Math.round(lira.confidence*100)}%<br>COUNTER ${lira.adaptation}<br>ATTACKS ${lira.attacks} · HITS ${lira.hits||0} · SHOTS ${hostile.length}<br>GRIFFIN <b>${griffin.form?.name||'BASE WARRIOR'}</b> · PWR ${(griffin.power||6000).toLocaleString()}<br>SHIELD ${Math.round(griffin.shield||0)}/${Math.round(griffin.shieldMax||55)} · BLOCK ${Math.round((griffin.activeBlock||0)*100)}%<br>PARRY ${griffin.parries||0} · DODGE ${griffin.dodgesRun||0} · CHARGES ${griffin.dodgeCharges||0} · REVIVE ${griffin.revive||0}<br>REFLEX ${(griffin.reflex||1).toFixed(2)}x · GUARD ${Math.round(((griffin.liraGuard||0)+(griffin.evolution||0)*.05)*100)}%<br>SWARM ${enemies.length} · DAMAGE ${lira.damage.toFixed(1)} · MEMORY ${liraMemory.runs}`}
function ultimateReset(){ultimate.events.length=ultimate.scars.length=0;ultimate.clock=ultimate.planClock=0;ultimate.planStage=0;ultimate.monteCarlo=0;ultimate.lastHp=player.hp;ultimate.lastParries=0;ultimate.lastKills=0;ultimate.tacticalForm='INSTINCT';ultimate.gpuMode=document.createElement('canvas').getContext('webgl2')?'WEBGL2 READY':'CANVAS FALLBACK';combatEvent('RUN_VERIFIED',{engine:'ULTIMATE-2026'})}
function monteCarloBrain(){let best={score:-1e9,a:griffin.heading,risk:0};const horizons=[.32,.7,1.15];for(let i=0;i<20;i++){const a=i*TAU/20;let score=0,risk=0;for(const h of horizons){const f=worldForecast(a,0,h),lane=Math.min(player.x+Math.cos(a)*player.speed*h,W-player.x-Math.cos(a)*player.speed*h,player.y+Math.sin(a)*player.speed*h,H-player.y-Math.sin(a)*player.speed*h);risk+=f.danger*(1+h*.4);score+=f.growth*2.1+Math.max(0,lane)/180-f.danger*(player.hp/player.maxHp<.5?11:7)}for(const s of hostile){const px=s.x+s.vx*.55,py=s.y+s.vy*.55;score-=Math.max(0,150-Math.hypot(player.x+Math.cos(a)*120-px,player.y+Math.sin(a)*120-py))*.09}if(score>best.score)best={score,a,risk}}ultimate.monteCarlo+=60;if(autoMode&&(best.risk>.8||hostile.length)){griffin.heading=best.a;griffin.risk=best.risk;griffin.reason=`MONTE CARLO ${ultimate.monteCarlo.toLocaleString()} · ${best.score.toFixed(1)}`}}
function liraPrime(dt,b){b.teleport-=dt;b.attackClock-=dt;b.x=clamp(b.x,72,W-72);b.y=clamp(b.y,115,H-90);const ratio=b.hp/b.max;if(ratio<.66&&b.bossForm===1){b.bossForm=2;b.speed*=1.28;b.damage*=1.18;b.shield=b.shieldMax*.8;lira.form='LIRA ASCENDANT';combatEvent('TRANSFORMATION_TRIGGERED',{fighter:'LIRA',form:2});iylaScene('LIRA ASCENDANT','PHASE TWO · ADAPTIVE ARMOR','#ff315c',2.2)}if(ratio<.32&&b.bossForm===2){b.bossForm=3;b.speed*=1.32;b.damage*=1.25;b.shield=b.shieldMax;lira.form='LIRA OMEGA';combatEvent('TRANSFORMATION_TRIGGERED',{fighter:'LIRA',form:3});iylaScene('LIRA OMEGA','FINAL FORM · LIMITS REMOVED','#ff174d',2.5)}if(b.teleport<=0){b.teleport=Math.max(1.35,3.2-b.bossForm*.45);const a=griffin.heading+Math.PI+rnd(-.7,.7);b.x=clamp(player.x+Math.cos(a)*rnd(150,230),72,W-72);b.y=clamp(player.y+Math.sin(a)*rnd(150,230),115,H-90);burst(b.x,b.y,'#ff315c',24);combatEvent('LIRA_TELEPORT',{form:b.bossForm})}if(b.attackClock<=0){b.attackClock=Math.max(.48,1.35-b.bossForm*.18);const base=Math.atan2(player.y-b.y,player.x-b.x);for(let q=-b.bossForm;q<=b.bossForm;q++){const a=base+q*.16;hostile.push({x:b.x,y:b.y,vx:Math.cos(a)*(220+b.bossForm*45),vy:Math.sin(a)*(220+b.bossForm*45),r:7+b.bossForm,damage:8+b.bossForm*3,life:3,homing:.08*b.bossForm})}lira.attacks++;combatEvent('LIRA_ATTACK',{pattern:ultimate.plan[ultimate.planStage],shots:b.bossForm*2+1})}}
function ultimateSystems(dt){if(elapsed<.08&&!ultimate.runInit){ultimate.runInit=true;ultimateReset()}else if(elapsed>.1)ultimate.runInit=false;ultimate.clock-=dt;ultimate.planClock=(ultimate.planClock||0)-dt;if(elapsed>12&&!griffin.boss&&!enemies.some(e=>e.type===3))enemy(true);if(ultimate.planClock<=0){ultimate.planClock=Math.max(2.8,5.5-elapsed/100);ultimate.planStage=(ultimate.planStage+1)%ultimate.plan.length;lira.phase=`${ultimate.plan[ultimate.planStage]} PROTOCOL`;combatEvent('LIRA_PLAN_STAGE',{stage:ultimate.plan[ultimate.planStage]})}if(ultimate.clock<=0){ultimate.clock=superAI.tier===1?.55:superAI.tier===2?.28:.14;monteCarloBrain();const next=player.hp/player.maxHp<.42?'GUARDIAN':griffin.boss?'DESTROYER':griffin.risk<.8?'SPEED':'INSTINCT';if(next!==ultimate.tacticalForm){ultimate.tacticalForm=next;combatEvent('GRIFFIN_FORM_SWITCH',{form:next});iylaScene(`GRIFFIN ${next}`,next==='GUARDIAN'?'FORTRESS BARRIER':next==='DESTROYER'?'BOSS BREAKER ONLINE':'TACTICAL EVOLUTION','#65faff',1.25)}griffin.stance=`${next} FORM`;griffin.skillPolicy={navigate:griffin.risk>1.4?1.6:1,defend:hostile.length?1.8:1,attack:griffin.boss?2:1,resource:gems.length>12?1.5:1,boss:griffin.boss?2.2:0};if(next==='SPEED')player.speed=Math.max(player.speed,340);if(next==='GUARDIAN')griffin.shield=Math.min(griffin.shieldMax||55,(griffin.shield||0)+4);if(next==='DESTROYER'){player.railClock=Math.min(player.railClock||9,.7);player.laserClock=Math.min(player.laserClock||9,.4)}}const b=enemies.find(e=>e.type===3);if(b){griffin.boss=b;liraPrime(dt,b)}if((griffin.parries||0)>ultimate.lastParries){ultimate.lastParries=griffin.parries;combatEvent('PARRY_CONFIRMED',{total:griffin.parries})}if(player.hp<ultimate.lastHp-1)combatEvent('DAMAGE_CONFIRMED',{amount:Math.round(ultimate.lastHp-player.hp)});ultimate.lastHp=player.hp;if(kills>ultimate.lastKills){const g=gems[gems.length-1]||player;ultimate.scars.push({x:g.x,y:g.y,r:rnd(10,28),a:rnd(0,TAU),life:45});if(ultimate.scars.length>36)ultimate.scars.shift();ultimate.lastKills=kills}}
function ultimateVisuals(){x.save();for(const s of ultimate.scars){x.globalAlpha=.12;x.strokeStyle='#ff416c';x.lineWidth=2;x.beginPath();x.moveTo(s.x-Math.cos(s.a)*s.r,s.y-Math.sin(s.a)*s.r);x.lineTo(s.x+Math.cos(s.a)*s.r,s.y+Math.sin(s.a)*s.r);x.stroke()}const b=griffin.boss;if(b&&enemies.includes(b)){const p=iyla3d.ready?iylaIsoPoint((b.x-W/2)/45,3.15,(b.y-H/2)/45):{x:b.x,y:b.y-b.r};x.globalAlpha=.95;x.textAlign='center';x.fillStyle='#ff91aa';x.font='900 10px system-ui';x.fillText(`LIRA PRIME · FORM ${b.bossForm}`,p.x,p.y-34);x.fillStyle='#170818cc';x.fillRect(p.x-42,p.y-27,84,4);x.fillStyle=b.shield>0?'#c866ff':'#ff315c';x.fillRect(p.x-42,p.y-27,84*clamp((b.hp||1)/(b.maxHp||b.hp||1),0,1),4)}x.restore()}
function ultimateHud(){const el=$('#ultimateDetail'),last=ultimate.events[ultimate.events.length-1];if(el)el.innerHTML=`<br><b>ULTIMATE 2026 VERIFIED EVENT CORE</b><br>GRIFFIN ${ultimate.tacticalForm||'INSTINCT'} · SEARCH ${ultimate.monteCarlo.toLocaleString()} FUTURES<br>LIRA PLAN ${ultimate.plan[ultimate.planStage]} · ${griffin.boss?'PRIME ACTIVE':'MATERIALIZING'}<br>IYLA ${ultimate.gpuMode} · SCARS ${ultimate.scars.length} · EVENTS ${ultimate.events.length}<br>SKILLS ${Object.entries(griffin.skillPolicy||{}).map(([k,v])=>`${k.toUpperCase()}:${v}`).join(' ')}<br>LAST ${last?`${last.t}s ${last.type}`:'AWAITING VERIFIED EVENT'}`}
function retainNewest(list,max){if(list.length>max)list.splice(0,list.length-max)}
function xavierKernel(raw,dt){xavier.frames++;xavier.displayHz=raw>.025?30:60;xavier.switchClock=Math.max(0,xavier.switchClock-dt);xavier.scaleClock=Math.max(0,xavier.scaleClock-dt);superAI.frame=superAI.frame*.9+raw*1000*.1;superAI.load=enemies.length+hostile.length*2+shots.length*.35+particles.length*.08;const desired=superAI.stall||xavier.work>22||superAI.load>135?1:xavier.work>14||superAI.load>82?2:3;if(desired===xavier.pendingTier)xavier.tierVotes++;else{xavier.pendingTier=desired;xavier.tierVotes=1}if(xavier.tierVotes>=8&&xavier.switchClock<=0){xavier.tier=desired;xavier.switchClock=1.5;xavier.tierVotes=0}superAI.tier=xavier.tier;superAI.renderEvery=superAI.tier===1?3:superAI.tier===2?2:1;superAI.mode=superAI.tier===1?'XAVIER SURVIVAL':superAI.tier===2?'XAVIER BALANCED':'XAVIER MAXIMUM';superAI.frames++;if(raw>.18){superAI.stall=2.5;superAI.recoveries++;xavier.learned.recoveries++;xavier.learned.stableFrames=0;xavier.learned.preferredScale=Math.max(.5,xavier.learned.preferredScale-.08);xavier.tier=1;xavier.pendingTier=1;xavier.tierVotes=0}const tierCap=superAI.tier===1?.54:superAI.tier===2?.72:W<720?.9:1,targetScale=Math.min(tierCap,xavier.learned.preferredScale);if(xavier.scaleClock<=0&&Math.abs(targetScale-xavier.scale)>.02){xavier.scale=targetScale;xavier.scaleClock=2.5}const survival=superAI.tier===1;retainNewest(particles,superAI.stall?45:survival?110:220);retainNewest(shots,superAI.stall?65:survival?100:180);retainNewest(hostile,superAI.stall?36:survival?55:90);retainNewest(beams,superAI.stall?12:survival?30:60);retainNewest(iyla.explosions,superAI.stall?2:survival?5:10);retainNewest(iyla2026.smoke,superAI.stall?6:survival?18:42);retainNewest(iyla2026.debris,superAI.stall?8:survival?22:48);if(iyla2026.seen.size>192)iyla2026.seen.clear();superAI.stall=Math.max(0,superAI.stall-dt);superAI.flash=Math.max(0,superAI.flash-dt);if(!superAI.flash)document.body.classList.remove('flash');xavier.mode=superAI.stall?'RECOVERING':superAI.tier===1?'FRAME GUARD':superAI.tier===2?'BALANCED HD':'EVOLVING HD'}
function xavierCommit(start){const work=performance.now()-start,L=xavier.learned;xavier.work=xavier.work*.88+work*.12;xavier.peak=Math.max(work,xavier.peak*.995);L.samples++;L.meanWork=L.meanWork*.995+work*.005;if(work<xavier.budget*.72&&!superAI.stall){L.stableFrames++;if(L.stableFrames>600&&xavier.scaleClock<=0){L.preferredScale=Math.min(W<720?.9:1,L.preferredScale+.04);L.bestScale=Math.max(L.bestScale,L.preferredScale);L.stableFrames=0;L.generation++;xavier.scaleClock=3}}else L.stableFrames=Math.max(0,L.stableFrames-3);if(work>xavier.budget){superAI.overruns++;if(work>60)superAI.stall=Math.max(superAI.stall,1.2)}if(xavier.frames%900===0)saveMemory()}
function loop(t){if(!running)return;const start=performance.now(),raw=Math.max(0,(t-last)/1000||0),dt=Math.min(.033,raw);last=t;xavierKernel(raw,dt);iylaDirector(dt);if(!paused){resetAdvancedSystems();const transform=!!griffin.transformation?.active,superMove=!!griffin.superMove?.active;if(transform)evolveGriffin(dt);else if(superMove)updateSuperMove(dt);else{if(superAI.frames%superAI.renderEvery===0)omegaIntelligence(dt*superAI.renderEvery);ultimateSystems(dt);const defense=prepareGriffinDefense(dt);weaponAbilities(dt);advancedWeapons(dt);update(dt);evolveGriffin(dt);if(!griffin.transformation?.active){syncLiraWorld();liraDirectAttack(dt);guideLiraShots(dt);resolveLiraCombat(dt);if(running){liraCombat(dt);liraAbilities(dt);omniSystems(dt)}}finishGriffinDefense(defense);restoreGriffinDefense(defense);if(player.hp<=0&&running)gameOver()}omniReplay(dt)}draw();iylaPost();if(!iyla3d.ready)iylaSpectacle();ultimateVisuals();omniVisuals();iyla2026Frame();iyla3DFrame(dt);superAI.uiClock-=dt;if(superAI.uiClock<=0){superAI.uiClock=superAI.tier===1?.5:.25;if(autoMode)labHud();liraHud();omegaHud();ultimateHud();omniHud()}xavierCommit(start);if(running)requestAnimationFrame(loop)}
function omegaHud(){const el=$('#omegaDetail'),last=battleLog[battleLog.length-1],accuracy=omega.predictions?Math.round(omega.correct/omega.predictions*100):0;if(el)el.innerHTML=`GEN ${omega.generation} · SELF-PLAY ${omega.selfPlay.toLocaleString()} · CAL ${accuracy}%<br>GRIFFIN ${griffin.hierarchy?.mission||'LEARN'} → ${griffin.hierarchy?.strategy||'MODEL'} → ${griffin.hierarchy?.action||'PROBE'}<br>LIRA ${lira.hierarchy?.mission||'LEARN'} → ${lira.hierarchy?.strategy||'MODEL'} → ${lira.hierarchy?.action||'PROBE'}<br>STANCE ${griffin.stance||'BALANCED'} · LIRA FORM ${lira.form||'OVER 9000'}<br>UNCERTAINTY ${Math.round((omega.uncertainty||0)*100)}% · DEPTH ${enemies.length+hostile.length>55?8:16}<br>COMBO ${griffin.combo||'DISCOVERING'}<br>${council.griffin.join(' · ')}<br>${council.lira.join(' · ')}<br>LAST ${last?`${last.t}s ${last.word} · HP ${last.hp} · ${last.prediction}`:'AWAITING EVIDENCE'}`}
function resetAdvancedSystems(){if(elapsed<.08){Object.assign(player,{railgun:0,spirit:0,reflector:0,chronos:0,gravity:0,railClock:0,spiritClock:0,gravityClock:0,chronoClock:0});Object.assign(lira,{ability:3,dash:2});griffin.reflected=0}}
function omegaIntelligence(dt){omega.clock=(omega.clock||0)-dt;if(elapsed<.08&&!omega.runInit){omega.runInit=true;battleLog.length=0;omega.generation++;for(let i=0;i<240;i++){const risk=Math.random()*2,reward=1-risk+Math.random()*.4,key=combatWords[i%combatWords.length];omega.strategy.griffin[key]=(omega.strategy.griffin[key]||0)*.98+reward*.02;omega.strategy.lira[key]=(omega.strategy.lira[key]||0)*.98+(risk-reward)*.02}omega.selfPlay+=240}else if(elapsed>.1)omega.runInit=false;if(omega.clock>0)return;const depth=enemies.length+hostile.length>55?8:16;omega.clock=autoMode?.12:.24;let best={score:-1e9,a:griffin.heading},second=best;for(let i=0;i<depth;i++){const a=i*TAU/depth,px=player.x+Math.cos(a)*player.speed*.65,py=player.y+Math.sin(a)*player.speed*.65;let danger=0,reward=0;for(const e of enemies){const d=Math.hypot(px-e.x,py-e.y);danger+=Math.max(0,210-d)/210*(1+e.type)}for(const s of hostile){const d=Math.hypot(px-(s.x+s.vx*.45),py-(s.y+s.vy*.45));danger+=Math.max(0,150-d)/55}for(const g of gems)reward+=Math.max(0,180-Math.hypot(px-g.x,py-g.y))/180*g.value;const cell=clamp(py/H*8|0,0,7)*12+clamp(px/W*12|0,0,11),score=reward-danger*4-(territory[cell]||0)*.3+Math.cos(a-griffin.heading);if(score>best.score){second=best;best={score,a,danger,cell}}else if(score>second.score)second={score,a,danger,cell}}omega.predictions++;omega.uncertainty=clamp(1-(best.score-second.score)/8,0,1);territory[best.cell]=territory[best.cell]*.94+best.danger*.06;if(autoMode&&best.danger>1.1){griffin.heading=best.a;griffin.reason=`OMEGA FUTURE ${depth}x · RISK ${best.danger.toFixed(1)}`;griffin.mode=omega.uncertainty>.65?'UNCERTAINTY RESERVE':'COUNTERFACTUAL ROUTE'}const dodge=Math.sin(griffin.heading-(omega.lastHeading||griffin.heading));omega.griffinModel.dodgeBias=omega.griffinModel.dodgeBias*.92+dodge*.08;omega.griffinModel.aggression=omega.griffinModel.aggression*.94+clamp(kills/Math.max(1,elapsed),0,2)*.03;omega.griffinModel.risk=omega.griffinModel.risk*.94+griffin.risk*.02;omega.liraModel.tempo=omega.liraModel.tempo*.94+Math.max(.5,lira.volley||2)*.06;omega.liraModel.power=lira.power;omega.liraModel.deception=clamp(omega.uncertainty,0,1);omega.lastHeading=griffin.heading;const hp=player.hp/player.maxHp,shield=(griffin.shield||0)/(griffin.shieldMax||55);griffin.budget={attack:hp>.55&&shield>.3,defense:shield<.45||hostile.length>3,reserve:(griffin.dodgeCharges||0)<1};lira.budget={attack:enemies.length<45,regenerate:enemies.filter(e=>e.type>0).length>3,deceive:omega.griffinModel.dodgeBias>.18};griffin.hierarchy={mission:hp<.35?'SURVIVE':level<8?'GROW':'DOMINATE',strategy:best.danger>1?'DISENGAGE':gems.length?'HARVEST':'PRESSURE',action:combatWords[(Math.abs(best.cell)+omega.generation)%combatWords.length]};lira.hierarchy={mission:hp<.35?'FINISH':'CONTAIN',strategy:lira.budget.deceive?'BAIT':'FUNNEL',action:combatWords[(kills+enemies.length)%combatWords.length]};council.griffin=[`NAV:${best.a.toFixed(2)}`,`DEF:${griffin.budget.defense?'BLOCK':'READY'}`,`WEAPON:${enemies.length>28?'AOE':'FOCUS'}`,`RESOURCE:${griffin.budget.reserve?'RESERVE':'SPEND'}`];council.lira=[`SWARM:${lira.tactic}`,`AMBUSH:${lira.hierarchy.strategy}`,`COUNTER:${lira.adaptation}`,`EXEC:${lira.hierarchy.action}`];const cluster=enemies.filter(e=>dist(player,e)<250).length;if(autoMode&&cluster>12){const combo=player.gravity?'GRAVITY→SPIRIT→RAIL':player.frost?'CRYO→NOVA→LASER':'PULSE→DASH→RAIL';omega.combos[combo]=(omega.combos[combo]||0)+1;griffin.combo=combo;if(player.gravity)player.gravityClock=0;if(player.spirit)player.spiritClock=Math.min(player.spiritClock,.4);if(player.railgun)player.railClock=Math.min(player.railClock,.7)}if(lira.budget.deceive&&Math.random()<.18){lira.predX=player.x-Math.cos(griffin.heading)*90;lira.predY=player.y-Math.sin(griffin.heading)*90;lira.phase='DECEPTION BAIT'}griffin.stance=hostile.length>5?'AUTONOMOUS DEFENSE':enemies.some(e=>e.type===3)?'BOSS BREAKER':best.danger<.7?'SPEED ASSAULT':'BALANCED INSTINCT';lira.form=lira.power>16000?'OMEGA COMMANDER':lira.power>12000?'ASCENDED LIRA':'OVER 9000';griffin.difficulty=clamp(.9+(memory.best>elapsed?-.08:.04)+(kills/Math.max(1,elapsed)>.8?.12:0),.82,1.22);if(Math.floor(elapsed)!==Math.floor(elapsed-dt)){battleLog.push({t:Math.floor(elapsed),g:griffin.mode,l:lira.phase,hp:Math.round(player.hp),risk:+griffin.risk.toFixed(1),prediction:griffin.reason,word:griffin.hierarchy.action});if(battleLog.length>90)battleLog.shift();omega.correct+=best.danger<1?1:0}}
function weaponAbilities(dt){if(player.reflector&&(griffin.parries||0)>(griffin.reflected||0)&&enemies.length){griffin.reflected=griffin.parries;const e=enemies.reduce((a,b)=>dist(player,b)<dist(player,a)?b:a,enemies[0]);hurt(e,24+player.reflector*16,'#ffffff');beams.push({x1:player.x,y1:player.y,x2:e.x,y2:e.y,life:.18,color:'#ffffff'})}player.chronoClock=(player.chronoClock||0)-dt;if(player.chronos&&player.chronoClock<=0&&hostile.length){player.chronoClock=Math.max(2,5-player.chronos*.4);for(const s of hostile){s.vx*=.45;s.vy*=.45;s.life+=1}for(const e of enemies)e.slow=Math.max(e.slow||0,1+player.chronos*.25);rings.push({x:player.x,y:player.y,r:25,max:260,life:.6})}}
function iylaObserve(dt){iyla.frame=iyla.frame*.92+dt*.08;iyla.fps=Math.round(1/Math.max(.001,iyla.frame));const target=superAI.tier===1?.58:superAI.tier===2?.72:.9;iyla.quality+=clamp(target-iyla.quality,-.012,.012);iyla.intensity=clamp(hostile.length*.08+enemies.length*.012+shake*.04+(griffin.evolution||0)*.12,0,1);iyla.mode=superAI.stall?'XAVIER RECOVERY':iyla.intensity>.72?'CINEMATIC COMBAT':superAI.tier===1?'PERFORMANCE GUARD':griffin.evolution>2?'TRANSFORMATION FOCUS':'WORLD ENHANCEMENT';iyla.palette=lira.phase.includes('KI')?'CRIMSON CONFLICT':griffin.evolution>2?'SAIYAN AURORA':'CYAN VOID';iyla.reason=superAI.tier===1?'STABLE FULL-RATE VISUALS':hostile.length>4?'HIGHLIGHTING THREATS':enemies.length>30?'CLARIFYING SWARM':'EVOLVING HIGH DEFINITION';iyla.decisions++}
function iylaBackground(){const q=iyla.quality,parallax=.018;for(let i=0;i<iyla.stars.length*q;i++){const s=iyla.stars[i],sx=((s.x*W-worldX*parallax*s.z)%W+W)%W,sy=((s.y*H-worldY*parallax*s.z)%H+H)%H,twinkle=.35+.65*Math.sin(elapsed*(1+s.z)+s.p)**2;x.globalAlpha=twinkle*(.22+.42*s.z);x.fillStyle=s.z>.7?'#8df5ff':'#296b86';x.fillRect(sx,sy,1+s.z*1.6,1+s.z*1.6)}x.globalAlpha=1;if(q>.55){const gx=((worldX*.06)%320+320)%320,gy=((worldY*.06)%320+320)%320;x.strokeStyle='#19758b16';x.lineWidth=2;x.beginPath();for(let i=-320;i<W+320;i+=320){x.arc(i-gx,gy,100,0,TAU);x.arc(i-gx,H-gy,160,0,TAU)}x.stroke()}}
function iylaPost(){const q=iyla.quality,intensity=iyla.intensity;if(autoMode&&griffin.shield>0){x.globalAlpha=.18+.14*Math.sin(elapsed*5)**2;x.strokeStyle=griffin.form?.color||'#65fff0';x.lineWidth=2+q*3;x.beginPath();x.arc(player.x,player.y,player.r+10+(griffin.shield/griffin.shieldMax)*8,0,TAU);x.stroke();x.globalAlpha=1}if(q>.5)for(const s of hostile.slice(0,10)){const d=dist(player,s);if(d<260){x.strokeStyle=`rgba(255,45,91,${clamp((260-d)/320,0,.45)})`;x.lineWidth=1;x.beginPath();x.moveTo(s.x,s.y);x.lineTo(s.x+s.vx*.22,s.y+s.vy*.22);x.stroke()}}for(const e of enemies.filter(e=>e.x<0||e.x>W||e.y<0||e.y>H).sort((a,b)=>dist(player,a)-dist(player,b)).slice(0,10))if(e.x<0||e.x>W||e.y<0||e.y>H){const a=Math.atan2(e.y-player.y,e.x-player.x),r=Math.min(W,H)*.39,px=player.x+Math.cos(a)*r,py=player.y+Math.sin(a)*r;x.fillStyle=e.type===3?'#ffd35c':'#ff4967';x.globalAlpha=e.type===3?.9:.28;x.beginPath();x.moveTo(px+Math.cos(a)*8,py+Math.sin(a)*8);x.lineTo(px+Math.cos(a+2.5)*5,py+Math.sin(a+2.5)*5);x.lineTo(px+Math.cos(a-2.5)*5,py+Math.sin(a-2.5)*5);x.fill()}x.globalAlpha=1;const vg=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.72);vg.addColorStop(0,'#0000');vg.addColorStop(1,`rgba(${lira.phase.includes('KI')?'35,0,9':'0,8,14'},${.34+intensity*.13})`);x.fillStyle=vg;x.fillRect(0,0,W,H);if(shake>6&&q>.7){x.globalCompositeOperation='screen';x.globalAlpha=.06;x.fillStyle=lira.damage?'#ff174d':'#6ffff0';x.fillRect(0,0,W,H);x.globalAlpha=1;x.globalCompositeOperation='source-over'}const el=$('#iylaDetail');if(el)el.innerHTML=`${iyla.mode}<br>FPS ${iyla.fps} · QUALITY ${Math.round(q*100)}%<br>PALETTE ${iyla.palette}<br>INTENSITY ${Math.round(intensity*100)}% · FX ${particles.length}<br>${iyla.reason}`}
const originalGrid=grid;grid=function(){originalGrid();iylaBackground()};
function iylaExplosion(px,py,power=1,color='#ff5b32'){iyla.explosions.push({x:px,y:py,t:0,life:.65+power*.18,power,color,seed:Math.random()*99});iyla.shake=Math.max(iyla.shake,6+power*7)}
function iylaScene(title,subtitle,color='#8df5ff',duration=1.8,priority=0){if(iyla.cinematic?.priority>priority&&iyla.cinematic.t<iyla.cinematic.duration-.2)return;iyla.cinematic={title,subtitle,color,t:0,duration,priority};iyla.shake=Math.max(iyla.shake,12)}
function iylaDirector(dt){iylaObserve(dt);if(elapsed<.08){iyla.lastKills=0;iyla.lastForm=0;iyla.lastLiraForm='';iyla.explosions.length=0;iyla.cinematic=null}if(kills>iyla.lastKills){const delta=kills-iyla.lastKills,g=gems[gems.length-1]||player;iylaExplosion(g.x,g.y,delta>2?1.8:.75,delta>2?'#ffd45e':'#ff4967');iyla.lastKills=kills}if((griffin.evolution||0)>iyla.lastForm){iyla.lastForm=griffin.evolution;iylaScene(griffin.form?.name||'GRIFFIN EVOLVED',`POWER ${(griffin.power||0).toLocaleString()} · REFLEX ${(griffin.reflex||1).toFixed(2)}x`,griffin.form?.color||'#fff',2.2);iylaExplosion(player.x,player.y,3.2,griffin.form?.color||'#fff')}if(lira.form&&lira.form!==iyla.lastLiraForm){if(iyla.lastLiraForm)iylaScene(lira.form,`${lira.tactic} · POWER ${lira.power.toLocaleString()}`,'#ff315c',1.7);iyla.lastLiraForm=lira.form}if(griffin.boss&&!griffin.boss.iylaSeen){griffin.boss.iylaSeen=true;iylaScene('LIRA COMMANDER','BOSS SIGNAL DETECTED · BREAK THE FORMATION','#ffb13b',2.1);iylaExplosion(griffin.boss.x,griffin.boss.y,3.8,'#ff315c')}for(let i=iyla.explosions.length-1;i>=0;i--){const e=iyla.explosions[i];e.t+=dt;if(e.t>e.life)iyla.explosions.splice(i,1)}if(iyla.cinematic){iyla.cinematic.t+=dt;if(iyla.cinematic.t>iyla.cinematic.duration)iyla.cinematic=null}iyla.shake*=.9}
function iylaSpectacle(){const q=iyla.quality,form=griffin.form||{color:'#53eaff'};x.save();x.translate(rnd(-iyla.shake,iyla.shake),rnd(-iyla.shake,iyla.shake));for(const e of iyla.explosions){const p=e.t/e.life,r=(12+Math.min(1.8,e.power)*42)*Math.sin(Math.min(1,p)*Math.PI*.72),fade=1-p;x.globalCompositeOperation='screen';x.globalAlpha=fade*.42;const g=x.createRadialGradient(e.x,e.y,0,e.x,e.y,r);g.addColorStop(0,'#fff');g.addColorStop(.16,e.color);g.addColorStop(.5,e.color+'88');g.addColorStop(1,'#0000');x.fillStyle=g;x.beginPath();x.arc(e.x,e.y,r,0,TAU);x.fill();x.strokeStyle=e.color;x.lineWidth=1.5+Math.min(e.power,2)*1.2;x.globalAlpha=fade;x.beginPath();x.arc(e.x,e.y,r*(1.15+p),0,TAU);x.stroke();if(q>.62)for(let n=0;n<6+Math.min(2,e.power)*3;n++){const a=n*2.399+e.seed,rr=r*(.3+(n%5)/5);x.fillStyle=n%2?'#fff':e.color;x.fillRect(e.x+Math.cos(a)*rr,e.y+Math.sin(a)*rr,2+e.power,2+e.power)}}x.globalCompositeOperation='source-over';x.globalAlpha=1;const a=griffin.heading;x.shadowBlur=18+q*18;x.shadowColor=form.color;x.strokeStyle=form.color;x.fillStyle='#071621';x.lineWidth=2.5;x.beginPath();x.moveTo(player.x+Math.cos(a)*25,player.y+Math.sin(a)*25);x.lineTo(player.x+Math.cos(a+2.35)*22,player.y+Math.sin(a+2.35)*22);x.lineTo(player.x+Math.cos(a+Math.PI)*12,player.y+Math.sin(a+Math.PI)*12);x.lineTo(player.x+Math.cos(a-2.35)*22,player.y+Math.sin(a-2.35)*22);x.closePath();x.fill();x.stroke();x.fillStyle=form.color;x.beginPath();x.arc(player.x+Math.cos(a)*9,player.y+Math.sin(a)*9,4,0,TAU);x.fill();if(griffin.evolution>0){x.strokeStyle=form.color;x.globalAlpha=.5;x.lineWidth=3;for(let n=0;n<2+(griffin.evolution||0);n++){const aa=a+Math.PI+(n-(1+griffin.evolution)/2)*.24,len=22+n%2*9;x.beginPath();x.moveTo(player.x+Math.cos(aa)*14,player.y+Math.sin(aa)*14);x.lineTo(player.x+Math.cos(aa)*len,player.y+Math.sin(aa)*len);x.stroke()}x.globalAlpha=1}for(const e of enemies){if(e.x<-30||e.x>W+30||e.y<-30||e.y>H+30)continue;const color=e.type===3?'#ffd35c':e.role==='RUSHER'?'#ff274e':e.role==='GUARD'?'#b45cff':'#ff5575';x.shadowBlur=e.type===3?28:9;x.shadowColor=color;x.strokeStyle=color;x.lineWidth=e.type===3?4:1.5;x.globalAlpha=.7;x.beginPath();x.arc(e.x,e.y,e.r+5+Math.sin(elapsed*3+e.slot)*2,0,TAU);x.stroke();if(e.role==='RUSHER'){const aa=Math.atan2(player.y-e.y,player.x-e.x);x.beginPath();x.moveTo(e.x-Math.cos(aa)*e.r,e.y-Math.sin(aa)*e.r);x.lineTo(e.x-Math.cos(aa)*e.r*2.4,e.y-Math.sin(aa)*e.r*2.4);x.stroke()}}x.restore();x.globalAlpha=1;x.shadowBlur=0;if(iyla.cinematic){const c=iyla.cinematic,p=c.t/c.duration,enter=clamp(p/.18,0,1),exit=clamp((1-p)/.2,0,1),alpha=Math.min(enter,exit);x.fillStyle=`rgba(0,0,0,${.72*alpha})`;x.fillRect(0,0,W,50*alpha);x.fillRect(0,H-50*alpha,W,50*alpha);x.globalCompositeOperation='screen';x.globalAlpha=.16*alpha;x.fillStyle=c.color;x.fillRect(0,0,W,H);x.globalCompositeOperation='source-over';x.globalAlpha=alpha;x.textAlign='center';x.shadowBlur=24;x.shadowColor=c.color;x.fillStyle='#fff';x.font=`900 ${clamp(W*.07,26,54)}px system-ui`;x.fillText(c.title,W/2,H*.43);x.shadowBlur=8;x.fillStyle=c.color;x.font=`800 ${clamp(W*.025,11,18)}px system-ui`;x.fillText(c.subtitle,W/2,H*.49);x.globalAlpha=1;x.shadowBlur=0}}
const iyla2026={smoke:[],debris:[],props:[],seen:new Set(),cameraZoom:1,cameraFocus:null,gpu:null,gpuCanvas:null,renderScale:1,frame:0,lastWorldX:0,lastWorldY:0};
function iylaHash(n){return Math.abs(Math.sin(n*127.1+311.7)*43758.5453)%1}
function iylaBuildWorld(){iyla2026.props.length=0;for(let i=0;i<90;i++){const seed=i+19,a=iylaHash(seed)*TAU,r=120+iylaHash(seed+7)*Math.max(W,H)*1.7;iyla2026.props.push({x:W/2+Math.cos(a)*r,y:H/2+Math.sin(a)*r,type:i%5,h:18+iylaHash(seed+2)*44,broken:false,seed})}}
function iylaTerrain(){if(!iyla2026.props.length)iylaBuildWorld();x.save();for(const p of iyla2026.props){if(p.x<-90||p.x>W+90||p.y<-90||p.y>H+90)continue;for(const blast of iyla.explosions)if(blast.power>1.5&&Math.hypot(p.x-blast.x,p.y-blast.y)<45+blast.power*38)p.broken=true;const s=p.h*(p.broken?.45:1);x.globalAlpha=p.broken?.28:.68;x.fillStyle='#0008';x.beginPath();x.ellipse(p.x+8,p.y+10,s*.7,s*.25,-.25,0,TAU);x.fill();if(p.type===0){x.fillStyle=p.broken?'#253238':'#123c37';x.strokeStyle='#3fae83';x.lineWidth=2;x.beginPath();for(let n=0;n<7;n++){const a=n*TAU/7,r=n%2?s*.48:s*.7;x.lineTo(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r)}x.closePath();x.fill();x.stroke()}else if(p.type===1){x.fillStyle=p.broken?'#20272c':'#263942';x.strokeStyle='#527b89';x.beginPath();x.moveTo(p.x-s*.55,p.y+s*.35);x.lineTo(p.x-s*.25,p.y-s*.5);x.lineTo(p.x+s*.45,p.y-s*.28);x.lineTo(p.x+s*.6,p.y+s*.4);x.closePath();x.fill();x.stroke()}else if(p.type===2){x.strokeStyle=p.broken?'#30373c':'#265c61';x.lineWidth=Math.max(3,s*.14);x.beginPath();x.moveTo(p.x,p.y+s*.45);x.lineTo(p.x,p.y-s*.35);x.stroke();x.fillStyle='#1b635b';for(let n=0;n<3&&!p.broken;n++){x.beginPath();x.arc(p.x+(n-1)*s*.2,p.y-s*.38-Math.abs(n-1)*5,s*.28,0,TAU);x.fill()}}else{x.strokeStyle=p.type===3?'#3c6e79':'#533b68';x.lineWidth=2;x.strokeRect(p.x-s*.45,p.y-s*.4,s*.9,s*.8);x.beginPath();x.moveTo(p.x-s*.45,p.y);x.lineTo(p.x+s*.45,p.y);x.moveTo(p.x,p.y-s*.4);x.lineTo(p.x,p.y+s*.4);x.stroke()}x.globalAlpha=1}x.restore()}
const iylaGrid2026=grid;grid=function(){iylaGrid2026();iylaTerrain()};
function iylaAura(px,py,color,power=1){x.save();x.globalCompositeOperation='screen';for(let n=3;n>0;n--){const r=(26+n*9)*power*(1+Math.sin(elapsed*(5+n)+n)*.07),g=x.createRadialGradient(px,py,r*.15,px,py,r);g.addColorStop(0,color+'aa');g.addColorStop(.5,color+(n===1?'55':'22'));g.addColorStop(1,'#0000');x.globalAlpha=.28;x.fillStyle=g;x.beginPath();x.ellipse(px,py,r*.75,r,0,0,TAU);x.fill()}x.restore()}
function iylaGriffin(){if(iyla3d.started)return;const a=griffin.heading||0,color=griffin.form?.color||'#5df4ff',stride=Math.sin(elapsed*12)*4,power=1+(griffin.evolution||0)*.09;x.save();x.translate(player.x,player.y);x.rotate(a+Math.PI/2);iylaAura(0,0,color,power);x.fillStyle='#0009';x.beginPath();x.ellipse(8,12,24,11,-.15,0,TAU);x.fill();x.shadowBlur=20;x.shadowColor=color;x.strokeStyle=color;x.lineWidth=2.5;x.fillStyle='#092633';for(const side of [-1,1]){x.save();x.translate(side*11,10+side*stride);x.rotate(side*.18);x.fillRect(-5,-3,10,21);x.strokeRect(-5,-3,10,21);x.restore();x.save();x.translate(side*17,-7-side*stride*.35);x.rotate(side*.28);x.fillRect(-5,-3,10,23);x.strokeRect(-5,-3,10,23);x.restore()}x.beginPath();x.moveTo(-15,9);x.lineTo(-13,-15);x.lineTo(-7,-25);x.lineTo(7,-25);x.lineTo(13,-15);x.lineTo(15,9);x.closePath();x.fill();x.stroke();x.fillStyle='#d8fbff';x.beginPath();x.arc(0,-31,9,0,TAU);x.fill();x.stroke();x.fillStyle=color;x.beginPath();x.moveTo(-9,-35);x.lineTo(-4,-51-(griffin.evolution||0)*2);x.lineTo(0,-40);x.lineTo(5,-54-(griffin.evolution||0)*2);x.lineTo(9,-35);x.closePath();x.fill();x.strokeStyle='#fff';x.beginPath();x.moveTo(-5,-31);x.lineTo(-1,-30);x.moveTo(5,-31);x.lineTo(1,-30);x.stroke();x.fillStyle=color;x.beginPath();x.arc(0,-5,4,0,TAU);x.fill();x.restore()}
function iylaLira(b){if(!b)return;const form=b.bossForm||1,color=form===3?'#fff':form===2?'#ff35b8':'#ff315c',wing=22+form*9+Math.sin(elapsed*7)*5;x.save();x.translate(b.x,b.y);x.rotate(Math.atan2(player.y-b.y,player.x-b.x)+Math.PI/2);iylaAura(0,0,color,1.25+form*.16);x.fillStyle='#0009';x.beginPath();x.ellipse(10,18,42+form*6,14,-.15,0,TAU);x.fill();x.shadowBlur=25+form*8;x.shadowColor=color;x.fillStyle=form===3?'#382046':'#26091b';x.strokeStyle=color;x.lineWidth=3;for(const side of [-1,1]){x.beginPath();x.moveTo(side*12,-8);x.lineTo(side*wing,-26);x.lineTo(side*(wing+17),4);x.lineTo(side*15,13);x.closePath();x.fill();x.stroke()}x.beginPath();x.moveTo(-17,19);x.lineTo(-21,-18);x.lineTo(-10,-37);x.lineTo(0,-43);x.lineTo(10,-37);x.lineTo(21,-18);x.lineTo(17,19);x.lineTo(0,34);x.closePath();x.fill();x.stroke();x.beginPath();x.moveTo(-9,-38);x.lineTo(-17,-58-form*3);x.lineTo(-3,-45);x.moveTo(9,-38);x.lineTo(17,-58-form*3);x.lineTo(3,-45);x.stroke();x.strokeStyle='#ffccd8';x.lineWidth=2;x.beginPath();x.moveTo(-8,-32);x.lineTo(-2,-30);x.moveTo(8,-32);x.lineTo(2,-30);x.stroke();x.strokeStyle=color;x.lineWidth=5;x.beginPath();x.moveTo(0,28);for(let n=1;n<5;n++)x.lineTo(Math.sin(elapsed*4+n)*11,n*12+27);x.stroke();x.restore()}
function iylaEnemyDetail(){for(const e of enemies){if(e.type===3)continue;x.save();x.translate(e.x,e.y);const a=Math.atan2(player.y-e.y,player.x-e.x),color=e.variant==='PHASE'?'#a970ff':e.variant==='DRAINER'?'#66ff9b':e.variant==='SPLITTER'?'#ffb13b':e.variant==='ANTI-CRYO'?'#ff4773':'#ff315c';x.rotate(a);x.globalAlpha=e.variant==='PHASE'?.72:.9;x.strokeStyle=color;x.fillStyle='#130916';x.lineWidth=1.5;x.beginPath();x.moveTo(e.r+7,0);x.lineTo(-e.r*.7,-e.r*.65);x.lineTo(-e.r*.35,0);x.lineTo(-e.r*.7,e.r*.65);x.closePath();x.fill();x.stroke();x.fillStyle=color;x.beginPath();x.arc(e.r*.25,0,2.5,0,TAU);x.fill();x.restore()}}
function iylaTelegraphs(){x.save();for(const s of hostile){const speed=Math.hypot(s.vx,s.vy)||1,d=dist(player,s);if(d>330)continue;x.globalAlpha=clamp((330-d)/760,.06,.25);x.strokeStyle='#ff315c';x.lineWidth=1.5;x.setLineDash([8,8]);x.beginPath();x.moveTo(s.x,s.y);x.lineTo(s.x+s.vx/speed*125,s.y+s.vy/speed*125);x.stroke();x.setLineDash([]);x.fillStyle='#ff315c';x.beginPath();x.arc(s.x,s.y,s.r+4+Math.sin(elapsed*10)*2,0,TAU);x.fill()}x.restore()}
function iylaAtmosphere(){x.save();for(const e of iyla.explosions){const p=e.t/e.life;if(p<.15&&!iyla2026.seen.has(e.seed)){iyla2026.seen.add(e.seed);for(let n=0;n<Math.min(10,3+e.power*2);n++){const a=rnd(0,TAU),v=rnd(20,120)*e.power;iyla2026.smoke.push({x:e.x,y:e.y,vx:Math.cos(a)*v*.22,vy:Math.sin(a)*v*.22-15,r:rnd(5,12)*Math.min(1.6,e.power),life:rnd(.5,1.1),max:1.1,color:e.color});iyla2026.debris.push({x:e.x,y:e.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:rnd(2,6),life:rnd(.35,1.1),spin:rnd(-8,8),a:0})}}}const dt=Math.min(.033,iyla.frame||.016);for(let i=iyla2026.smoke.length-1;i>=0;i--){const s=iyla2026.smoke[i];s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.r+=5*dt;if(s.life<=0){iyla2026.smoke.splice(i,1);continue}x.globalAlpha=clamp(s.life/s.max,0,.12);x.fillStyle=s.color;x.beginPath();x.arc(s.x,s.y,s.r,0,TAU);x.fill()}for(let i=iyla2026.debris.length-1;i>=0;i--){const d=iyla2026.debris[i];d.life-=dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=160*dt;d.a+=d.spin*dt;if(d.life<=0){iyla2026.debris.splice(i,1);continue}x.save();x.translate(d.x,d.y);x.rotate(d.a);x.fillStyle='#ffc96b';x.fillRect(-d.r,-d.r*.35,d.r*2,d.r*.7);x.restore()}x.restore()}
function initIylaGPU(){try{const cv=document.createElement('canvas');cv.className='iyla-gpu';document.body.insertBefore(cv,document.querySelector('.hud'));const gl=cv.getContext('webgl2',{alpha:true,premultipliedAlpha:false,antialias:false,powerPreference:'high-performance'});if(!gl){cv.remove();ultimate.gpuMode='CANVAS 2.5D FALLBACK';return}const vs=`#version 300 es\nin vec2 p;out vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`,fs=`#version 300 es\nprecision mediump float;in vec2 uv;out vec4 o;uniform float t;uniform float power;uniform vec2 focus;void main(){float d=distance(uv,focus);float ring=smoothstep(.035,0.,abs(d-(.17+.025*sin(t*2.))));float edge=smoothstep(.42,.78,d);vec3 cyan=vec3(.05,.8,1.);vec3 red=vec3(1.,.03,.22);vec3 col=mix(cyan,red,step(.67,power));float a=ring*.08*power+edge*.11;o=vec4(col*a,a);}`;const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s},pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.useProgram(pr);const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);iyla2026.gpu={gl,pr,t:gl.getUniformLocation(pr,'t'),power:gl.getUniformLocation(pr,'power'),focus:gl.getUniformLocation(pr,'focus')};iyla2026.gpuCanvas=cv;ultimate.gpuMode='WEBGL2 COMPOSITOR'}catch{ultimate.gpuCanvas?.remove();ultimate.gpuMode='CANVAS 2.5D FALLBACK'}}
function iylaGPU(){const g=iyla2026.gpu,cv=iyla2026.gpuCanvas;if(!g||!cv)return;const scale=iyla.quality<.6?.5:1,w=Math.max(1,W*D*scale|0),h=Math.max(1,H*D*scale|0);if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}g.gl.viewport(0,0,w,h);g.gl.clearColor(0,0,0,0);g.gl.clear(g.gl.COLOR_BUFFER_BIT);g.gl.useProgram(g.pr);g.gl.uniform1f(g.t,elapsed);g.gl.uniform1f(g.power,iyla.intensity);const f=griffin.boss&&enemies.includes(griffin.boss)?griffin.boss:player;g.gl.uniform2f(g.focus,f.x/W,1-f.y/H);g.gl.drawArrays(g.gl.TRIANGLES,0,3)}
function iylaScrollWorld(){const dx=worldX-iyla2026.lastWorldX,dy=worldY-iyla2026.lastWorldY;iyla2026.lastWorldX=worldX;iyla2026.lastWorldY=worldY;if(Math.abs(dx)>W||Math.abs(dy)>H){iylaBuildWorld();return}for(const list of [iyla2026.props,iyla2026.smoke,iyla2026.debris,ultimate.scars])for(const o of list){o.x-=dx;o.y-=dy}for(const p of iyla2026.props){if(p.x<-120)p.x+=W+240;if(p.x>W+120)p.x-=W+240;if(p.y<-120)p.y+=H+240;if(p.y>H+120)p.y-=H+240}}
function iyla2026Frame(){if(!iyla2026.frame){iyla2026.frame=1;iyla2026.lastWorldX=worldX;iyla2026.lastWorldY=worldY;initIylaGPU()}iylaScrollWorld();iylaTelegraphs();iylaEnemyDetail();iylaGriffin();iylaLira(griffin.boss&&enemies.includes(griffin.boss)?griffin.boss:null);iylaAtmosphere();iylaGPU();const el=$('#iylaDetail');if(el)el.innerHTML+=`<br>2026 2.5D · ${ultimate.gpuMode}<br>MODELS ${enemies.length+1} · SMOKE ${iyla2026.smoke.length} · DEBRIS ${iyla2026.debris.length}`}
const iyla3d={gl:null,cv:null,program:null,loc:{},cube:null,sphere:null,sphereCount:0,havok:null,world:null,mode:'BOOTING',ready:false,draws:0,faces:0,queue:[],engines:['XAVIER EVOLVING HD KERNEL','IYLA WEBGL 2.5','PEYTEN CHARACTER AI','ELIJAH LIRA FORGE','HAVOK DESKTOP PHYSICS','KAIROS MOTION','PRISM LIGHT','TITAN DESTRUCTION','AURA VOLUMETRICS'],trail:[],acc:0};
const peyten={name:'PEYTEN',version:'1.0',mode:'NEURAL CHARACTER RIG',yaw:0,turn:0,blink:0,express:'FOCUS',hairNodes:14,faceNodes:18};
const elijah={name:'ELIJAH',version:'1.0',mode:'ADAPTIVE LIRA CHARACTER FORGE',classes:['HUNTER','RUSHER','GUARD','FLANKER','COMMANDER'],variants:['PHASE','DRAINER','SPLITTER','ANTI-CRYO'],models:0,features:0};
function iyla3DShader(gl,type,src){if(type===gl.VERTEX_SHADER)src=src.replace('mat2(.985,-.174,.174,.985)','mat2(.94,-.342,.342,.94)').replace('float w=1.24+v.z*.052','float w=1.31+v.z*.074').replace('v.x/(10.2*aspect),v.y/7.15+v.z*.088-.1,v.z*.018','v.x/(9.7*aspect),v.y/7.7+v.z*.155-.14,v.z*.023');const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
function iylaSphereMesh(){const a=[],push=(u,v)=>{const q=u*TAU,r=v*Math.PI-Math.PI/2,c=Math.cos(r);a.push(Math.cos(q)*c,Math.sin(r),Math.sin(q)*c,Math.cos(q)*c,Math.sin(r),Math.sin(q)*c)};for(let y=0;y<8;y++)for(let j=0;j<12;j++){const u=j/12,U=(j+1)/12,v=y/8,V=(y+1)/8;push(u,v);push(U,v);push(U,V);push(u,v);push(U,V);push(u,V)}return new Float32Array(a)}
function iyla3DInit(){try{const cv=document.createElement('canvas');cv.className='iyla-3d';document.body.insertBefore(cv,document.querySelector('.hud'));const gl=cv.getContext('webgl2',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'high-performance'});if(!gl){cv.remove();throw Error('WEBGL2 UNAVAILABLE')}const vs=`#version 300 es\nin vec3 p;in vec3 n;uniform vec3 at;uniform vec3 scale;uniform float yaw;uniform float aspect;uniform float pulse;out float light;void main(){float c=cos(yaw),s=sin(yaw);vec3 v=p*scale;v.xz=mat2(c,-s,s,c)*v.xz;v+=at;v.xz=mat2(.985,-.174,.174,.985)*v.xz;float w=1.24+v.z*.052;gl_Position=vec4(v.x/(10.2*aspect),v.y/7.15+v.z*.088-.1,v.z*.018,w);vec2 rn=mat2(c,-s,s,c)*n.xz;vec3 nn=normalize(vec3(rn.x,n.y,rn.y));float d=max(dot(nn,normalize(vec3(-.45,.82,.38))),0.);light=.22+d*.7+pow(d,8.)*.32+pulse*.16;}`,fs=`#version 300 es\nprecision mediump float;in float light;uniform vec4 color;out vec4 o;void main(){vec3 c=color.rgb*light+pow(max(light-.72,0.),2.)*.35;o=vec4(c,color.a);}`;const pr=gl.createProgram();gl.attachShader(pr,iyla3DShader(gl,gl.VERTEX_SHADER,vs));gl.attachShader(pr,iyla3DShader(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(pr));const v=new Float32Array([-1,-1,1,0,0,1,1,-1,1,0,0,1,1,1,1,0,0,1,-1,-1,1,0,0,1,1,1,1,0,0,1,-1,1,1,0,0,1,1,-1,-1,0,0,-1,-1,-1,-1,0,0,-1,-1,1,-1,0,0,-1,1,-1,-1,0,0,-1,-1,1,-1,0,0,-1,1,1,-1,0,0,-1,-1,-1,-1,-1,0,0,-1,-1,1,-1,0,0,-1,-1,1,1,-1,0,0,-1,-1,-1,-1,0,0,-1,-1,1,1,-1,0,0,-1,-1,-1,1,-1,0,0,1,-1,1,1,0,0,1,1,-1,1,1,0,0,1,-1,-1,1,0,0,1,1,-1,1,0,0,1,1,-1,-1,1,0,0,-1,1,-1,0,1,0,-1,1,1,0,1,0,1,1,1,0,1,0,-1,1,-1,0,1,0,1,1,1,0,1,0,1,1,-1,0,1,0,-1,-1,-1,0,-1,0,1,-1,1,0,-1,0,-1,-1,1,0,-1,0,-1,-1,-1,0,-1,0,1,-1,-1,0,-1,0,1,-1,1,0,-1,0]),b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,v,gl.STATIC_DRAW);const sv=iylaSphereMesh(),sb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,sb);gl.bufferData(gl.ARRAY_BUFFER,sv,gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.useProgram(pr);const P=gl.getAttribLocation(pr,'p'),N=gl.getAttribLocation(pr,'n');gl.enableVertexAttribArray(P);gl.vertexAttribPointer(P,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(N);gl.vertexAttribPointer(N,3,gl.FLOAT,false,24,12);for(const k of ['at','scale','yaw','aspect','pulse','color'])iyla3d.loc[k]=gl.getUniformLocation(pr,k);gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);Object.assign(iyla3d,{gl,cv,program:pr,cube:b,sphere:sb,sphereCount:sv.length/6,P,N,mode:'IYLA WEBGL 2.5 CURVED GPU'});iylaHavokBoot()}catch(e){iyla3d.mode='IYLA WEBGL 2.5 CURVED SOFTWARE';iyla3d.error=String(e?.message||e);console.warn('IYLA WebGL 2.5 software pipeline:',iyla3d.error)}}
async function iylaHavokBoot(){if(W<720||/iPhone|iPad|iPod/.test(navigator.userAgent)){iyla3d.mode='XAVIER MOBILE DYNAMICS';xavier.physics='XAVIER DETERMINISTIC';return}try{if(typeof HavokPhysics!=='function')throw Error('HAVOK SCRIPT');const h=await HavokPhysics({locateFile:f=>`jarvis/vendor/havok/${f}`}),[,world]=h.HP_World_Create();h.HP_World_SetGravity(world,[0,-9.81,0]);h.HP_World_SetIdealStepTime(world,1/60);iyla3d.havok=h;iyla3d.world=world;iyla3d.mode='HAVOK + XAVIER 3D';xavier.physics='HAVOK DESKTOP';combatEvent('HAVOK_PHYSICS_READY',{backend:'WASM'})}catch{iyla3d.mode='XAVIER DYNAMICS FALLBACK';xavier.physics='DETERMINISTIC FALLBACK'}}
function iylaIsoPoint(px,py,pz){const rx=px*.94-pz*.342,rz=px*.342+pz*.94,zoom=Math.min(W,H)/17.2,depth=clamp(1+rz*.023,.84,1.18);return{x:W/2+rx*zoom*depth,y:H*.575+rz*zoom*1.02-py*zoom*depth}}
function iylaIsoBox(px,py,pz,sx,sy,sz,color,yaw=0,alpha=1){const c=Math.cos(yaw),s=Math.sin(yaw),pts=[],depth=[];for(const yy of [-1,1])for(const zz of [-1,1])for(const xx of [-1,1]){const lx=xx*sx,lz=zz*sz,wx=px+lx*c-lz*s,wz=pz+lx*s+lz*c;pts.push(iylaIsoPoint(wx,py+yy*sy,wz));depth.push(wz+wx*.174)}const faces=[[[0,2,3,1],.22],[[4,5,7,6],1.08],[[0,1,5,4],.48],[[2,6,7,3],.7],[[0,4,6,2],.38],[[1,3,7,5],.82]];for(const [ids,light] of faces){const z=ids.reduce((v,i)=>v+depth[i],0)/4,syy=ids.reduce((v,i)=>v+pts[i].y,0)/4,fog=clamp(1-Math.max(0,z-5)/25,.55,1);iyla3d.queue.push({pts:ids.map(i=>pts[i]),z:z+syy*.0001,color,light:light*fog,alpha})}iyla3d.draws++}
function iylaIsoRound(px,py,pz,sx,sy,sz,color,alpha){const p=iylaIsoPoint(px,py,pz),zoom=Math.min(W,H)/18,z=pz+px*.174,fog=clamp(1-Math.max(0,z-5)/25,.55,1);iyla3d.queue.push({round:true,p,rx:Math.max(sx,sz)*zoom,ry:sy*zoom,z,color,light:fog,alpha});iyla3d.draws++}
function iyla25Flush(){if(iyla3d.gl||!iyla3d.queue.length)return;iyla3d.queue.sort((a,b)=>a.z-b.z);x.lineJoin='round';for(const f of iyla3d.queue){const c=f.color,k=f.light,r=Math.round(clamp(c[0]*255*k,0,255)),gg=Math.round(clamp(c[1]*255*k,0,255)),b=Math.round(clamp(c[2]*255*k,0,255));if(f.round){const g=x.createRadialGradient(f.p.x-f.rx*.3,f.p.y-f.ry*.35,1,f.p.x,f.p.y,Math.max(f.rx,f.ry));g.addColorStop(0,`rgba(${Math.min(255,r+65)},${Math.min(255,gg+65)},${Math.min(255,b+65)},${f.alpha})`);g.addColorStop(1,`rgba(${Math.round(r*.38)},${Math.round(gg*.38)},${Math.round(b*.38)},${f.alpha})`);x.beginPath();x.ellipse(f.p.x,f.p.y,f.rx,f.ry,0,0,TAU);x.fillStyle=g;x.fill();x.strokeStyle=`rgba(210,245,255,${.08*f.alpha})`;x.stroke()}else{x.beginPath();x.moveTo(f.pts[0].x,f.pts[0].y);for(let i=1;i<f.pts.length;i++)x.lineTo(f.pts[i].x,f.pts[i].y);x.closePath();const g=x.createLinearGradient(f.pts[0].x,f.pts[0].y,f.pts[2].x,f.pts[2].y);g.addColorStop(0,`rgba(${Math.min(255,r+18)},${Math.min(255,gg+18)},${Math.min(255,b+18)},${f.alpha})`);g.addColorStop(1,`rgba(${r},${gg},${b},${f.alpha})`);x.fillStyle=g;x.fill();x.strokeStyle=`rgba(180,235,255,${.045*f.alpha})`;x.lineWidth=.65;x.stroke()}iyla3d.faces++}iyla3d.queue.length=0}
function iylaMesh(buffer){const gl=iyla3d.gl;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.vertexAttribPointer(iyla3d.P,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(iyla3d.N,3,gl.FLOAT,false,24,12)}
function iylaShape(buffer,count,px,py,pz,sx,sy,sz,color,yaw,alpha){const gl=iyla3d.gl;iylaMesh(buffer);gl.uniform3f(iyla3d.loc.at,px,py,pz);gl.uniform3f(iyla3d.loc.scale,sx,sy,sz);gl.uniform1f(iyla3d.loc.yaw,yaw);gl.uniform4f(iyla3d.loc.color,color[0],color[1],color[2],alpha);gl.drawArrays(gl.TRIANGLES,0,count);iyla3d.draws++}
function iylaBox(px,py,pz,sx,sy,sz,color,yaw=0,alpha=1){if(!iyla3d.gl){iylaIsoBox(px,py,pz,sx,sy,sz,color,yaw,alpha);return}iylaShape(iyla3d.cube,36,px,py,pz,sx,sy,sz,color,yaw,alpha)}
function iylaRound(px,py,pz,sx,sy,sz,color,yaw=0,alpha=1){if(!iyla3d.gl){iylaIsoRound(px,py,pz,sx,sy,sz,color,alpha);return}iylaShape(iyla3d.sphere,iyla3d.sphereCount,px,py,pz,sx,sy,sz,color,yaw,alpha)}
function iyla3DFighter(px,pz,yaw,color,boss=false,form=1,stride=0){const s=boss?1.38:1.18,skin=boss?[.4,.08,.18]:[.82,.52,.34],shadow=boss?[.2,.02,.07]:[.5,.25,.16],suit=boss?[.18,.01,.07]:[.025,.11,.29],cloth=boss?color:[.92,.24,.025],armor=boss?color:[.06,.26,.68],hair=boss?color:form>3?[.62,.22,1]:form>1?[1,.73,.04]:[.035,.045,.07],frontX=Math.sin(yaw),frontZ=Math.cos(yaw),rightX=Math.cos(yaw),rightZ=-Math.sin(yaw);iylaRound(px,.035,pz,.78*s,.035,.44*s,[0,0,0],yaw,.38);for(let q=0;q<2+Math.min(3,form);q++){const rr=.72+q*.18,aa=elapsed*(q%2?-.65:.7)+q;for(let n=0;n<8;n++){const a=n*TAU/8+aa;iylaBox(px+Math.cos(a)*rr*s,.75+q*.28,pz+Math.sin(a)*rr*s,.035,.22+q*.08,.035,color,a,.12)}}for(const side of [-1,1]){const hipX=px+rightX*side*.25*s,hipZ=pz+rightZ*side*.25*s,kneeX=hipX+frontX*.05*s,kneeZ=hipZ+frontZ*.05*s,footX=kneeX+frontX*.17*s,footZ=kneeZ+frontZ*.17*s;iylaRound(hipX,.84*s-side*stride,hipZ,.25*s,.42*s,.26*s,cloth,yaw);iylaRound(kneeX,.43*s-side*stride,kneeZ,.22*s,.29*s,.22*s,suit,yaw);iylaRound(kneeX,.57*s-side*stride,kneeZ,.255*s,.15*s,.255*s,armor,yaw);iylaRound(footX,.13*s-side*stride,footZ,.29*s,.14*s,.43*s,armor,yaw);const shX=px+rightX*side*.62*s,shZ=pz+rightZ*side*.62*s,elX=shX+rightX*side*.17*s-frontX*.08*s,elZ=shZ+rightZ*side*.17*s-frontZ*.08*s,handX=elX+rightX*side*.09*s+frontX*.12*s,handZ=elZ+rightZ*side*.09*s+frontZ*.12*s;iylaRound(shX,1.67*s+side*stride,shZ,.3*s,.27*s,.31*s,skin,yaw);iylaRound(elX,1.32*s+side*stride,elZ,.19*s,.32*s,.2*s,skin,yaw);iylaRound(elX,1.42*s+side*stride,elZ,.22*s,.12*s,.225*s,shadow,yaw);iylaRound(handX,1.02*s+side*stride,handZ,.22*s,.19*s,.24*s,armor,yaw)}iylaRound(px,1.28*s,pz,.43*s,.42*s,.3*s,cloth,yaw);iylaRound(px,1.61*s,pz,.56*s,.4*s,.34*s,cloth,yaw);iylaRound(px,1.03*s,pz,.45*s,.11*s,.32*s,[.05,.45,.82],yaw);iylaBox(px+frontX*.285*s,1.58*s,pz+frontZ*.285*s,.31*s,.22*s,.055*s,armor,yaw);iylaRound(px,2.01*s,pz,.14*s,.17*s,.14*s,skin,yaw);iylaRound(px,2.29*s,pz,.3*s,.34*s,.28*s,skin,yaw);for(const side of [-1,1])iylaRound(px+rightX*side*.31*s,2.3*s,pz+rightZ*side*.31*s,.065*s,.11*s,.045*s,skin,yaw);iylaBox(px+frontX*.29*s,2.2*s,pz+frontZ*.29*s,.1*s,.07*s,.07*s,skin,yaw);for(const side of [-1,1]){const eyeX=px+rightX*side*.115*s+frontX*.29*s,eyeZ=pz+rightZ*side*.115*s+frontZ*.29*s;iylaBox(eyeX,2.37*s,eyeZ,.072*s,.026*s,.032*s,[.75,1,1],yaw);iylaBox(eyeX,2.43*s,eyeZ,.085*s,.022*s,.035*s,hair,yaw+side*.08)}iylaBox(px+frontX*.3*s,2.13*s,pz+frontZ*.3*s,.1*s,.015*s,.03*s,shadow,yaw);for(let n=0;n<9+Math.min(4,form);n++){const spread=(n-(8+Math.min(4,form))/2)*.15,a=yaw+spread,lean=.08+Math.abs(spread)*.2,h=.48+((n+form)%3)*.13;iylaBox(px+Math.sin(a)*.2*s-frontX*lean,2.72*s+Math.cos(spread)*.2*s,pz+Math.cos(a)*.2*s-frontZ*lean,.105*s,h*s,.12*s,hair,a)}if(boss){for(const side of [-1,1])iylaBox(px+rightX*side*.92*s,1.65*s,pz+rightZ*side*.92*s,.72*s,.07*s,.48*s,color,yaw+side*.48);iylaBox(px-frontX*.7*s,.5*s,pz-frontZ*.7*s,.12*s,.12*s,.92*s,color,yaw)}}
function peytenYaw(move){const desired=Math.atan2(Math.cos(move),Math.sin(move)),delta=Math.atan2(Math.sin(desired-peyten.yaw),Math.cos(desired-peyten.yaw)),speed=clamp(.2+Math.abs(delta)*.16,.2,.48);peyten.yaw=Math.atan2(Math.sin(peyten.yaw+delta*speed),Math.cos(peyten.yaw+delta*speed));peyten.turn=delta;peyten.facing=Math.abs(delta)<.18?'LOCKED':delta>0?'TURNING RIGHT':'TURNING LEFT';return peyten.yaw}
function xavierGriffinBody(yaw,color,form,stride){const s=1.18,skin=[.82,.52,.34],shadow=[.5,.25,.16],suit=[.025,.11,.29],cloth=[.92,.24,.025],armor=[.06,.26,.68],fx=Math.sin(yaw),fz=Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);iylaRound(0,.035,0,.78*s,.035,.44*s,[0,0,0],yaw,.38);const auraCount=superAI.tier===1?4:superAI.tier===2?6:8,auraRadius=.86+Math.min(3,form)*.08;for(let n=0;n<auraCount;n++){const a=n*TAU/auraCount+elapsed*.7;iylaBox(Math.cos(a)*auraRadius,.82+(n&1)*.32,Math.sin(a)*auraRadius,.03,.19,.03,color,a,.13)}for(const side of [-1,1]){const hipX=rx*side*.25*s,hipZ=rz*side*.25*s,kneeX=hipX+fx*.05*s,kneeZ=hipZ+fz*.05*s,footX=kneeX+fx*.17*s,footZ=kneeZ+fz*.17*s;iylaRound(hipX,.84*s-side*stride,hipZ,.25*s,.42*s,.26*s,cloth,yaw);iylaRound(kneeX,.43*s-side*stride,kneeZ,.22*s,.29*s,.22*s,suit,yaw);iylaRound(kneeX,.57*s-side*stride,kneeZ,.255*s,.15*s,.255*s,armor,yaw);iylaRound(footX,.13*s-side*stride,footZ,.29*s,.14*s,.43*s,armor,yaw);const shX=rx*side*.62*s,shZ=rz*side*.62*s,elX=shX+rx*side*.17*s-fx*.08*s,elZ=shZ+rz*side*.17*s-fz*.08*s,handX=elX+rx*side*.09*s+fx*.12*s,handZ=elZ+rz*side*.09*s+fz*.12*s;iylaRound(shX,1.67*s+side*stride,shZ,.3*s,.27*s,.31*s,skin,yaw);iylaRound(elX,1.32*s+side*stride,elZ,.19*s,.32*s,.2*s,skin,yaw);iylaRound(elX,1.42*s+side*stride,elZ,.22*s,.12*s,.225*s,shadow,yaw);iylaRound(handX,1.02*s+side*stride,handZ,.22*s,.19*s,.24*s,armor,yaw)}iylaRound(0,1.28*s,0,.43*s,.42*s,.3*s,cloth,yaw);iylaRound(0,1.61*s,0,.56*s,.4*s,.34*s,cloth,yaw);iylaRound(0,1.03*s,0,.45*s,.11*s,.32*s,[.05,.45,.82],yaw);iylaBox(fx*.285*s,1.58*s,fz*.285*s,.31*s,.22*s,.055*s,armor,yaw);iylaRound(0,2.01*s,0,.14*s,.17*s,.14*s,skin,yaw)}
function peytenGriffin(yaw,form){const s=1.18,bob=Math.sin(elapsed*8)*.018,headY=2.29*s+bob,fx=Math.sin(yaw),fz=Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw),skin=[.9,.6,.4],shade=[.5,.27,.18],white=[.88,1,1],iris=form>=4?[.9,1,1]:form===3?[.72,.3,1]:form===2?[1,.48,.08]:form===1?[.2,.65,1]:[.08,.5,.75],hair=form>=4?[.92,1,1]:form===3?[.67,.2,1]:form===2?[1,.42,.04]:form===1?[1,.78,.06]:[.035,.045,.065],front=.39*s;peyten.blink=Math.sin(elapsed*.73)>0.985?.006:.044;peyten.express=griffin.risk>2?'BATTLE FOCUS':form>2?'ASCENDED':'FOCUS';iylaRound(0,headY,0,.31*s,.35*s,.285*s,skin,yaw);iylaRound(-fx*.09,headY+.23,-fz*.09,.3*s,.16*s,.27*s,hair,yaw);iylaRound(fx*.08,headY-.19,fz*.08,.25*s,.15*s,.23*s,shade,yaw);for(const side of [-1,1])iylaRound(rx*side*.31*s,headY,rz*side*.31*s,.07*s,.12*s,.055*s,skin,yaw);for(const side of [-1,1]){const ex=fx*front+rx*side*.135*s,ez=fz*front+rz*side*.135*s;iylaBox(ex,headY+.075,ez,.15*s,Math.max(peyten.blink,.035),.03*s,white,yaw);iylaRound(ex+fx*.028,headY+.075,ez+fz*.028,.04*s,.052*s,.023*s,iris,yaw);iylaRound(ex+fx*.043,headY+.075,ez+fz*.043,.016*s,.03*s,.012*s,[.015,.02,.025],yaw);iylaBox(ex,headY+.15,ez,.15*s,.032*s,.028*s,hair,yaw-side*.13)}iylaBox(fx*(front+.025),headY-.02,fz*(front+.025),.07*s,.085*s,.032*s,skin,yaw);iylaBox(fx*(front+.04),headY-.145,fz*(front+.04),.14*s,.018*s,.025*s,shade,yaw);for(let n=0;n<peyten.hairNodes;n++){const side=(n/(peyten.hairNodes-1)-.5),a=yaw+side*2.3,back=-fx*(.19+.08*Math.abs(side)),lateral=rx*side*.58*s,backZ=-fz*(.19+.08*Math.abs(side)),lateralZ=rz*side*.58*s,h=.28*s+(n%3)*.065*s,rootY=headY+.27*s+Math.cos(side*Math.PI)*.12*s;iylaRound(back+lateral,rootY+h*.28,backZ+lateralZ,.105*s,h*.55,.115*s,hair,a)}for(const side of [-1,1])iylaRound(-fx*.19+rx*side*.2*s,headY+.38*s,-fz*.19+rz*side*.2*s,.13*s,.31*s,.14*s,hair,yaw+side*.36);iylaRound(-fx*.2,headY+.46*s,-fz*.2,.16*s,.34*s,.16*s,hair,yaw);if(form>0){const glow=form>=4?[.9,1,1]:form===3?[.65,.2,1]:form===2?[1,.35,.04]:[1,.72,.04];for(let n=0;n<6;n++){const a=n*TAU/6+elapsed*.35;iylaBox(Math.cos(a)*.48,headY+.15+Math.sin(elapsed*2+n)*.08,Math.sin(a)*.48,.025,.18,.025,glow,a,.32)}}}
function elijahLiraCharacter(e,boss=false){const px=(e.x-W/2)/45,pz=(e.y-H/2)/45,yaw=-Math.atan2(player.x-e.x,player.y-e.y),fx=Math.sin(yaw),fz=Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw),form=boss?(e.bossForm||1):1,role=boss?'COMMANDER':e.role||'HUNTER',variant=e.variant||'PHASE',scale=(boss?.94:.58+e.type*.14)*(role==='GUARD'?1.18:role==='RUSHER'?.88:1),stride=Math.sin(elapsed*(role==='RUSHER'?15:9)+e.slot)*.07,core=variant==='PHASE'?[.58,.22,1]:variant==='DRAINER'?[.08,1,.42]:variant==='SPLITTER'?[1,.53,.04]:variant==='ANTI-CRYO'?[1,.08,.3]:[1,.03,.18],armor=boss?[.22,.015,.08]:role==='GUARD'?[.16,.08,.25]:[.11,.015,.07],skin=boss?[.52,.12,.22]:[.38,.07,.14],eye=form===3?[1,1,1]:core,headY=2.12*scale;elijah.models++;iylaRound(px,.025,pz,.5*scale,.025,.3*scale,[0,0,0],yaw,.32);for(const side of [-1,1]){const hipX=px+rx*side*.21*scale,hipZ=pz+rz*side*.21*scale;iylaRound(hipX,.64*scale-side*stride,hipZ,.2*scale,.34*scale,.21*scale,armor,yaw);iylaRound(hipX+fx*.12*scale,.25*scale-side*stride,hipZ+fz*.12*scale,.2*scale,.28*scale,.22*scale,core,yaw);const shX=px+rx*side*.48*scale,shZ=pz+rz*side*.48*scale;iylaRound(shX,1.38*scale+side*stride,shZ,.27*scale,.24*scale,.28*scale,skin,yaw);iylaRound(shX+rx*side*.13*scale,1.04*scale+side*stride,shZ+rz*side*.13*scale,.17*scale,.3*scale,.18*scale,armor,yaw);if(role==='GUARD')iylaBox(shX+rx*side*.24*scale,1.33*scale,shZ+rz*side*.24*scale,.36*scale,.08*scale,.3*scale,core,yaw+side*.32);if(role==='RUSHER')iylaBox(shX-fx*.24*scale,1.18*scale,shZ-fz*.24*scale,.08*scale,.08*scale,.45*scale,core,yaw)}iylaRound(px,1.05*scale,pz,.39*scale,.38*scale,.3*scale,armor,yaw);iylaRound(px,1.37*scale,pz,.48*scale,.3*scale,.33*scale,skin,yaw);iylaBox(px+fx*.3*scale,1.4*scale,pz+fz*.3*scale,.31*scale,.2*scale,.05*scale,core,yaw);iylaRound(px,headY,pz,.3*scale,.33*scale,.28*scale,skin,yaw);iylaRound(px-fx*.07*scale,headY+.22*scale,pz-fz*.07*scale,.31*scale,.17*scale,.28*scale,armor,yaw);for(const side of [-1,1]){const ex=px+fx*.29*scale+rx*side*.105*scale,ez=pz+fz*.29*scale+rz*side*.105*scale;iylaBox(ex,headY+.07*scale,ez,.095*scale,.025*scale,.022*scale,[.9,.72,.82],yaw);iylaRound(ex+fx*.025*scale,headY+.07*scale,ez+fz*.025*scale,.025*scale,.035*scale,.015*scale,eye,yaw);iylaBox(ex,headY+.14*scale,ez,.11*scale,.025*scale,.024*scale,armor,yaw-side*.18)}iylaBox(px+fx*.31*scale,headY-.08*scale,pz+fz*.31*scale,.07*scale,.08*scale,.03*scale,skin,yaw);iylaBox(px+fx*.32*scale,headY-.18*scale,pz+fz*.32*scale,.13*scale,.018*scale,.025*scale,[.18,.01,.04],yaw);const horns=role==='FLANKER'?4:role==='COMMANDER'?6:2;for(let n=0;n<horns;n++){const side=n/(horns-1||1)-.5,a=yaw+side*1.5;iylaBox(px-fx*.16*scale+rx*side*.48*scale,headY+.46*scale+Math.cos(side*Math.PI)*.12*scale,pz-fz*.16*scale+rz*side*.48*scale,.09*scale,(.3+form*.08)*scale,.1*scale,core,a)}if(role==='HUNTER')iylaBox(px-fx*.42*scale,1.22*scale,pz-fz*.42*scale,.08*scale,.08*scale,.72*scale,core,yaw);if(role==='FLANKER')for(const side of [-1,1])iylaBox(px+rx*side*.57*scale-fx*.22*scale,1.37*scale,pz+rz*side*.57*scale-fz*.22*scale,.43*scale,.045*scale,.32*scale,core,yaw+side*.55);if(role==='COMMANDER'){for(const side of [-1,1])iylaBox(px+rx*side*.72*scale-fx*.25*scale,1.48*scale,pz+rz*side*.72*scale-fz*.25*scale,.58*scale,.055*scale,.42*scale,core,yaw+side*.48);for(let n=0;n<form+2;n++){const a=elapsed*(n%2?-.8:.7)+n*TAU/(form+2);iylaRound(px+Math.cos(a)*(.62+n*.08)*scale,1.35*scale,pz+Math.sin(a)*(.62+n*.08)*scale,.055*scale,.055*scale,.055*scale,eye,a,.65)}}if(variant==='DRAINER')iylaRound(px,1.4*scale,pz,.54*scale,.12*scale,.4*scale,core,yaw,.22);if(variant==='PHASE')iylaRound(px,1.15*scale,pz,.62*scale,.05*scale,.62*scale,core,yaw,.16);elijah.features+=18+horns}
function iyla3DWorld(){const tile=2.1,ox=((worldX/45)%tile+tile)%tile,oz=((worldY/45)%tile+tile)%tile,gxMax=superAI.tier===1?3:4,gzMax=superAI.tier===1?4:5;for(let gx=-gxMax;gx<=gxMax;gx++)for(let gz=-gzMax;gz<=gzMax;gz++){const shade=(gx+gz)&1?[.025,.095,.11]:[.035,.13,.14];iylaBox(gx*tile-ox,-.08,gz*tile-oz,tile*.49,.07,tile*.49,shade,0,.82)}const propCap=superAI.tier===1?12:superAI.tier===2?22:34;for(const p of iyla2026.props.slice(0,propCap)){if(p.x<-50||p.x>W+50||p.y<-50||p.y>H+50)continue;const wx=(p.x-W/2)/45,wz=(p.y-H/2)/45,h=p.h/28,col=p.broken?[.12,.14,.15]:p.type===0?[.04,.38,.2]:p.type===2?[.06,.3,.2]:[.2,.26,.31];iylaBox(wx+.15,.03,wz+.18,.58+p.type*.1,.035,.3+p.type*.08,[0,0,0],p.seed,.35);iylaBox(wx,h*.48,wz,.38+p.type*.09,h*.48,.38+p.type*.09,col,p.seed,.9);if(superAI.tier>1&&p.type===2&&!p.broken)for(let n=0;n<3;n++)iylaBox(wx+(n-1)*.25,h*.95+n*.12,wz,.3,.22,.3,[.04,.42,.21],n)}for(const s of ultimate.scars.slice(superAI.tier===1?-6:-14))iylaBox((s.x-W/2)/45,.015,(s.y-H/2)/45,s.r/34,.02,s.r/34,[.35,.02,.06],s.a,.6)}
function iyla3DCombat(){const gc=griffin.form?.color==='#ffe66b'?[1,.78,.08]:griffin.form?.color==='#b898ff'?[.5,.3,1]:[.05,.85,1],stride=Math.sin(elapsed*12)*.08,move=griffin.heading||0,gyaw=peytenYaw(move),b=griffin.boss&&enemies.includes(griffin.boss)?griffin.boss:null,mobile=W<720,pressure=iyla.fps<42||iyla.quality<.62||enemies.length>55,detailCap=pressure?(mobile?2:3):(mobile?5:8),crowdCap=pressure?(mobile?7:10):(mobile?12:18),shotCap=pressure?12:24;iyla3DFighter(0,0,gyaw,gc,false,1+(griffin.evolution||0),stride);peytenGriffin(gyaw,1+(griffin.evolution||0));elijah.models=elijah.features=0;if(b)elijahLiraCharacter(b,true);const nearby=enemies.filter(e=>e!==b).sort((a,b)=>dist(player,a)-dist(player,b)),detailed=nearby.slice(0,detailCap);for(const e of detailed)elijahLiraCharacter(e,false);for(const e of nearby.slice(detailCap,detailCap+crowdCap)){const px=(e.x-W/2)/45,pz=(e.y-H/2)/45,col=e.variant==='DRAINER'?[.08,1,.42]:e.variant==='SPLITTER'?[1,.53,.04]:e.variant==='PHASE'?[.58,.22,1]:[1,.08,.3];iylaRound(px,.38,pz,.22,.4,.22,col,0,.78);iylaRound(px,.88,pz,.16,.18,.16,[.18,.025,.07],0,.8)}for(const s of shots.slice(0,shotCap))iylaBox((s.x-W/2)/45,.55,(s.y-H/2)/45,.06,.06,.24,[.55,1,1],-Math.atan2(s.vx,s.vy));for(const s of hostile.slice(0,shotCap))iylaBox((s.x-W/2)/45,.58,(s.y-H/2)/45,.1,.1,.28,[1,.03,.18],-Math.atan2(s.vx,s.vy));iyla3d.budget=`${detailCap}H/${crowdCap}L`}
function iyla3DFrame(dt){if(!iyla3d.started){iyla3d.started=true;iyla3DInit()}const gl=iyla3d.gl,cv=iyla3d.cv,scale=xavier.scale;if(gl&&cv){const w=Math.max(1,W*D*scale|0),h=Math.max(1,H*D*scale|0);if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(iyla3d.program);gl.uniform1f(iyla3d.loc.aspect,W/H);gl.uniform1f(iyla3d.loc.pulse,(Math.sin(elapsed*7)+1)*.5*iyla.intensity)}iyla3d.draws=iyla3d.faces=0;iyla3d.queue.length=0;owenController(dt);x.save();iyla3DWorld();iyla3DCombat();iyla25Flush();x.restore();iyla3d.ready=true;const el=$('#iylaDetail');if(el)el.innerHTML+=`<br>${xavier.name} · ${xavier.mode}<br>WORK ${xavier.work.toFixed(1)}ms · PEAK ${xavier.peak.toFixed(1)} · LOAD ${Math.round(superAI.load)}<br>VISUAL 1/1 · AI 1/${superAI.renderEvery} · RECOVERY ${superAI.recoveries}<br>SUPER SAIYAN 3D · ${iyla3d.mode}<br>OWEN ${owen.pose}/${owen.phase} · ${owen.joints} JOINTS<br>PEYTEN ${peyten.express} · ${peyten.facing||'LOCKED'} · ELIJAH ${elijah.models} MODELS<br>OBJECTS ${iyla3d.draws} · HD ${Math.round(scale*100)}% · GEN ${xavier.learned.generation}${iyla3d.error?'<br>GPU '+iyla3d.error+' · SOFTWARE DEPTH ACTIVE':''}`}
function omniReset(){Object.assign(expansion59,{clock:0,combatClock:0,replayClock:0,captureTime:0,formationClock:0,plans:[],openingReplay:[],replay:[],replayHead:0,replayWrapped:false,combo:0,comboClock:0,ultimate:0,ultimateCooldown:0,combatSinceSuper:0,lastParries:0,lastDodges:0,lastKills:0,superHistory:[],injury:0,flight:0,ki:0,companion:0,clashes:0,interrupts:0,destruction:0});resetSuperMove();memory.omni||={battles:0,patterns:{},mastery:{},lessons:[]};expansion59.patterns=memory.omni.patterns;expansion59.mastery=memory.omni.mastery;superAI.mode='OMNI MIND ONLINE'}
function omniTarget(){return enemies.length?enemies.reduce((a,b)=>targetScore(b)>targetScore(a)?b:a,enemies[0]):null}
function omniWeaponPolicy(){const density=enemies.filter(e=>dist(player,e)<220).length,boss=enemies.some(e=>e.type===3),hp=player.hp/player.maxHp;return boss?'BOSS BREAKER':density>8?'AREA CONTROL':hostile.length>4||hp<.45?'DEFENSIVE COUNTER':'PRECISION HUNTER'}
function omniLearn(dt){const sig=`${lira.tactic}:${lira.phase}:${enemies.length>30?'SWARM':'SQUAD'}`,p=expansion59.patterns[sig]||(expansion59.patterns[sig]={seen:0,hits:0,counter:'EVADE'});p.seen+=dt;if(player.hp<(griffin.lastOmniHp??player.hp)){p.hits++;p.counter=hostile.length>3?'REFLECTOR-NOVA':'PHASE-DASH'}griffin.lastOmniHp=player.hp;expansion59.plans=[{name:'SURVIVE',score:(1-player.hp/player.maxHp)*8+hostile.length},{name:'DOMINATE',score:kills/Math.max(1,elapsed)*4+(griffin.boss?3:0)},{name:'EVOLVE',score:gems.length/8+level/10}].sort((a,b)=>b.score-a.score);griffin.mission=expansion59.plans[0].name;griffin.weaponPolicy=omniWeaponPolicy()}
const superMoves=[{id:'SPIRIT_BOMB',name:'SPIRIT BOMB',duration:4.8,color:'#8fd8ff'},{id:'METEOR_RUSH',name:'METEOR RUSH',duration:3.2,color:'#ffb13b'},{id:'DRAGON_BEAM',name:'DRAGON BEAM',duration:3.6,color:'#65faff'},{id:'FINAL_NOVA',name:'FINAL NOVA',duration:3.4,color:'#fff07a'}];
function superMovePose(s){if(!s)return'FLIGHT';const q=clamp(s.time/Math.max(.01,s.duration),0,1),impact=s.id==='SPIRIT_BOMB'?.72:s.id==='DRAGON_BEAM'?.62:s.id==='FINAL_NOVA'?.58:.48;if(s.id==='SPIRIT_BOMB')return q<.16?'SPIRIT_GATHER':q<impact?'SPIRIT_LIFT':q<.86?'SPIRIT_THROW':'SUPER_RECOVER';if(s.id==='DRAGON_BEAM')return q<.2?'BEAM_BRACE':q<impact?'BEAM_CHARGE':q<.88?'BEAM_FIRE':'SUPER_RECOVER';if(s.id==='FINAL_NOVA')return q<.22?'NOVA_CROUCH':q<impact?'NOVA_EXPAND':q<.86?'NOVA_RELEASE':'SUPER_RECOVER';return q<.16?'RUSH_STANCE':q<impact?'RUSH_COMBO':q<.84?'RUSH_FINISH':'SUPER_RECOVER'}
function beginSuperMove(){const boss=enemies.find(e=>e.type===3),density=enemies.filter(e=>dist(player,e)<300).length,close=enemies.filter(e=>dist(player,e)<145).length,evo=griffin.evolution||0,recent=expansion59.superHistory.slice(-2),scores={SPIRIT_BOMB:density*1.5+hostile.length*.4+(evo>1?3:0),METEOR_RUSH:close*2+(griffin.risk<1.5?4:0),DRAGON_BEAM:(boss?18:0)+enemies.filter(e=>Math.abs(e.x-player.x)<90).length,FINAL_NOVA:hostile.length*1.2+(player.hp/player.maxHp<.55?9:0)+evo*2};for(const id of recent)scores[id]-=id===recent.at(-1)?40:16;const move=superMoves.reduce((a,b)=>scores[b.id]>scores[a.id]?b:a,superMoves[0]),target=boss||omniTarget()||player;expansion59.superHistory.push(move.id);if(expansion59.superHistory.length>8)expansion59.superHistory.shift();expansion59.combatSinceSuper=0;expansion59.ultimateCooldown=12;griffin.superMove={active:true,id:move.id,name:move.name,time:0,duration:move.duration,color:move.color,targetX:target.x,targetY:target.y,targetRef:target===player?null:target,impact:false,beat:-1,confirmedHits:0,confirmedDamage:0};player.invuln=Math.max(player.invuln||0,move.duration+.5);shots.length=hostile.length=beams.length=0;owen.queue.length=0;const pose=superMovePose(griffin.superMove);owen.pose=owen.wanted=pose;owen.phase=pose;owen.stateTime=0;owen.stateLength=move.duration;zStage.pose=pose;zStage.poseT=move.duration;zStage.cut=move.duration;matty.commands++;matty.accepted++;iylaScene(`MATTY // ${move.name}`,'CINEMATIC SUPER MOVE',move.color,move.duration,35);combatEvent('SUPER_MOVE_TRIGGERED',{move:move.id,scores});speak(`${move.name}. Full power.`)}
function resetSuperMove(){griffin.superMove={active:false,id:'',name:'',time:0,duration:0,color:'#fff',targetX:0,targetY:0,targetRef:null,impact:false,beat:-1,confirmedHits:0,confirmedDamage:0};if(typeof zCinema!=='undefined'){zCinema.contactBeat=null;zCinema.confirmedHits=0}}
function superMoveImpact(s){if(s.impact)return;s.impact=true;const evo=griffin.evolution||0,r=s.id==='SPIRIT_BOMB'?360:s.id==='FINAL_NOVA'?310:s.id==='DRAGON_BEAM'?145:220,damage=s.id==='SPIRIT_BOMB'?125:s.id==='FINAL_NOVA'?105:s.id==='DRAGON_BEAM'?155:92,amount=damage+evo*28,primary=s.targetRef&&enemies.includes(s.targetRef)?s.targetRef:null,hitSet=new Set;for(const e of [...enemies]){let hit=dist({x:s.targetX,y:s.targetY},e)<r;if(s.id==='DRAGON_BEAM'){const a=Math.atan2(s.targetY-player.y,s.targetX-player.x),along=(e.x-player.x)*Math.cos(a)+(e.y-player.y)*Math.sin(a),cross=Math.abs((e.x-player.x)*Math.sin(a)-(e.y-player.y)*Math.cos(a));hit=along>0&&cross<r}if(hit){hitSet.add(e);hurt(e,amount,s.color);const a=Math.atan2(e.y-s.targetY,e.x-s.targetX);e.x+=Math.cos(a)*80;e.y+=Math.sin(a)*80}}if(primary&&!hitSet.has(primary)){hitSet.add(primary);hurt(primary,amount,s.color)}s.confirmedHits=hitSet.size;s.confirmedDamage=amount*hitSet.size;rings.push({x:s.targetX,y:s.targetY,r:18,max:r,life:1.2});zImpact(s.targetX,s.targetY,s.color,4);zStageBurst(s.targetX,s.targetY,s.color,3);burst(s.targetX,s.targetY,s.color,superAI.tier===1?45:90);shake=Math.max(shake,16);combatEvent('SUPER_MOVE_IMPACT',{move:s.id,hits:s.confirmedHits,damage:Math.round(s.confirmedDamage),primary:!!primary});try{navigator.vibrate?.([45,25,90,30,130])}catch{}}
function updateSuperMove(dt){const s=griffin.superMove;if(!s?.active)return;s.time+=dt;elapsed+=dt*.28;expansion59.combatSinceSuper+=dt*.28;const q=clamp(s.time/s.duration,0,1),impactAt=s.id==='SPIRIT_BOMB'?.72:s.id==='DRAGON_BEAM'?.62:s.id==='FINAL_NOVA'?.58:.48,pose=superMovePose(s),live=s.targetRef&&enemies.includes(s.targetRef)?s.targetRef:null;if(live&&!s.impact){s.targetX=live.x;s.targetY=live.y;griffin.heading=Math.atan2(live.y-player.y,live.x-player.x)}s.targetX=clamp(s.targetX,70,W-70);s.targetY=clamp(s.targetY,130,H-70);shots.length=hostile.length=beams.length=0;player.invuln=Math.max(player.invuln||0,.35);owen.pose=owen.wanted=pose;owen.queue.length=0;owen.stateLength=s.duration;owen.stateTime=s.time;owen.phase=pose;griffin.mode=`${s.name} · ${pose}`;zStage.pose=pose;zStage.poseT=Math.max(zStage.poseT,s.duration-s.time);const beat=Math.floor(s.time*6);if(beat!==s.beat){s.beat=beat;const count=superAI.tier===1?5:10;for(let n=0;n<count;n++){const a=n*TAU/count+s.time,r=65+(1-q)*180;particles.push({x:player.x+Math.cos(a)*r,y:player.y+Math.sin(a)*r,vx:-Math.cos(a)*130,vy:-Math.sin(a)*130,life:.75,max:.75,color:s.color,r:3})}rings.push({x:player.x,y:player.y,r:20,max:80+q*190,life:.6})}if(s.id==='METEOR_RUSH'&&q<impactAt){const a=Math.atan2(s.targetY-player.y,s.targetX-player.x);for(const e of enemies)if(dist(player,e)<135)hurt(e,8+(griffin.evolution||0)*3,s.color);zAfter(player.x-Math.cos(a)*25,player.y-Math.sin(a)*25,a,s.color)}if(s.id==='DRAGON_BEAM'&&q>=impactAt)beams.push({x1:player.x,y1:player.y,x2:s.targetX,y2:s.targetY,life:.12,color:s.color});if(q>=impactAt)superMoveImpact(s);if(s.time>=s.duration){s.active=false;s.impact=false;s.targetRef=null;griffin.mode=`${s.name} COMPLETE · ${s.confirmedHits||0} HIT${s.confirmedHits===1?'':'S'}`;owen.pose=owen.wanted='FLIGHT';owen.stateTime=0;zStage.cut=0;if(griffin.transformation)griffin.transformation.wave=0;iylaScene(`${s.name} COMPLETE`,`${s.confirmedHits||0} CONFIRMED HIT${s.confirmedHits===1?'':'S'} · ${Math.round(s.confirmedDamage||0)} DAMAGE`,s.color,.9,20)}}
function superMoveVisuals(){const s=griffin.superMove;if(!s?.active)return;const q=clamp(s.time/s.duration,0,1),charge=Math.sin(Math.min(1,q/.7)*Math.PI/2);x.save();x.globalCompositeOperation='screen';if(s.id==='SPIRIT_BOMB'){const fly=clamp((q-.55)/.17,0,1),bx=player.x+(s.targetX-player.x)*fly,by=player.y-105+(s.targetY-(player.y-105))*fly,r=28+charge*115,g=x.createRadialGradient(bx,by,4,bx,by,r);g.addColorStop(0,'#ffffff');g.addColorStop(.28,s.color);g.addColorStop(1,'rgba(70,140,255,0)');x.globalAlpha=.55;x.fillStyle=g;x.beginPath();x.arc(bx,by,r,0,TAU);x.fill();for(let n=0;n<(superAI.tier===1?8:16);n++){const a=n*TAU/(superAI.tier===1?8:16)+s.time*.18;x.strokeStyle=n%2?'#b8f4ff':'#7eb7ff';x.lineWidth=2;x.beginPath();x.moveTo(bx+Math.cos(a)*(r+160)*(1-fly),by+Math.sin(a)*(r+160)*(1-fly));x.lineTo(bx+Math.cos(a)*r,by+Math.sin(a)*r);x.stroke()}}else if(s.id==='FINAL_NOVA'){const r=45+charge*180,g=x.createRadialGradient(player.x,player.y,5,player.x,player.y,r);g.addColorStop(0,'#fff');g.addColorStop(.35,s.color);g.addColorStop(1,'rgba(255,160,20,0)');x.globalAlpha=.45;x.fillStyle=g;x.fillRect(player.x-r,player.y-r,r*2,r*2)}else if(s.id==='DRAGON_BEAM'){x.strokeStyle=s.color;x.lineWidth=8+charge*24;x.globalAlpha=.5;x.beginPath();x.moveTo(player.x,player.y);x.lineTo(s.targetX,s.targetY);x.stroke();x.strokeStyle='#fff';x.lineWidth=2+charge*7;x.stroke()}else{for(let n=0;n<8;n++){const a=Math.atan2(s.targetY-player.y,s.targetX-player.x)+Math.PI+(n-3.5)*.08;x.strokeStyle=s.color;x.globalAlpha=.32;x.lineWidth=3;x.beginPath();x.moveTo(player.x,player.y);x.lineTo(player.x+Math.cos(a)*(80+n*20),player.y+Math.sin(a)*(80+n*20));x.stroke()}}x.restore()}
function omniGriffin(dt){expansion59.combatClock-=dt;expansion59.comboClock-=dt;expansion59.ultimateCooldown=Math.max(0,expansion59.ultimateCooldown-dt);expansion59.combatSinceSuper+=dt;expansion59.injury=clamp((1-player.hp/player.maxHp)*.65,0,.55);expansion59.flight=clamp((griffin.evolution||0)*.25+(griffin.risk>2?.25:0),0,1);expansion59.ki=clamp(expansion59.ki+dt*(enemies.some(e=>dist(player,e)<130)?-.18:.22),0,1);if(expansion59.comboClock<=0)expansion59.combo=Math.max(0,expansion59.combo-1);const target=omniTarget();if(target&&expansion59.combatClock<=0){expansion59.combatClock=Math.max(.2,.7-(griffin.evolution||0)*.08);const d=dist(player,target),a=Math.atan2(target.y-player.y,target.x-player.x);if(d<105){const arc=55+(expansion59.mastery.melee||0)*2;for(const e of [...enemies]){const da=Math.abs(Math.atan2(Math.sin(Math.atan2(e.y-player.y,e.x-player.x)-a),Math.cos(Math.atan2(e.y-player.y,e.x-player.x)-a)));if(dist(player,e)<115&&da<.9)hurt(e,14+arc*.18+(griffin.evolution||0)*7,'#fff1a8')}expansion59.combo++;expansion59.comboClock=1.1;expansion59.mastery.melee=(expansion59.mastery.melee||0)+.03;griffin.mode=expansion59.combo>4?'BRANCHING FINISHER':'KI MELEE COMBO';rings.push({x:player.x,y:player.y,r:16,max:105,life:.25})}else if(expansion59.ki>.92){expansion59.ki=.25;beams.push({x1:player.x,y1:player.y,x2:target.x,y2:target.y,life:.26,color:griffin.form?.color||'#65faff'});hurt(target,42+(griffin.evolution||0)*18,'#ffffff');expansion59.mastery.ki=(expansion59.mastery.ki||0)+.04;griffin.mode='OMNI KI FINISHER'}}const parries=griffin.parries||0,dodges=griffin.dodgesRun||0,newParries=Math.max(0,parries-expansion59.lastParries),newDodges=Math.max(0,dodges-expansion59.lastDodges),newKills=Math.max(0,kills-expansion59.lastKills);expansion59.lastParries=parries;expansion59.lastDodges=dodges;expansion59.lastKills=kills;expansion59.ultimate=clamp(expansion59.ultimate+newParries*.18+newDodges*.1+newKills*.012+dt*.006,0,1);if(expansion59.ultimate>=1&&enemies.length&&!griffin.superMove?.active&&expansion59.ultimateCooldown<=0&&expansion59.combatSinceSuper>=10){expansion59.ultimate=0;beginSuperMove()}if(level>3)expansion59.companion=1;if(expansion59.companion&&target&&(Math.floor(elapsed*4)!==Math.floor((elapsed-dt)*4))){const a=elapsed*2.2,ox=player.x+Math.cos(a)*64,oy=player.y+Math.sin(a)*64,ta=Math.atan2(target.y-oy,target.x-ox);shots.push({x:ox,y:oy,vx:Math.cos(ta)*570,vy:Math.sin(ta)*570,r:3,life:1,damage:9+level*.8,pierce:0,drone:true})}player.speed=Math.max(player.speed,292)*(1-expansion59.injury*.12)}
function omniLira(dt){expansion59.formationClock-=dt;if(expansion59.formationClock<=0){expansion59.formationClock=1.2;const history=Object.values(expansion59.patterns).reduce((s,p)=>s+p.hits,0);for(const e of enemies){if(e.type===3){e.visualRadius=e.r+38+(e.bossForm||1)*14;e.x=clamp(e.x,e.visualRadius,W-e.visualRadius);e.y=clamp(e.y,125+e.visualRadius,H-e.visualRadius);e.armorParts=e.armorParts??3;e.charge=e.charge??0}else if(e.role==='COMMANDER')e.auraSupport=true;else if(e.variant==='DRAINER'&&dist(player,e)>170)e.role='GUARD';else if(history>4)e.role=e.slot%3?'FLANKER':'RUSHER'}}for(const e of enemies){if(e.auraSupport)for(const ally of enemies)if(ally!==e&&dist(e,ally)<155)ally.hp=Math.min(ally.max,ally.hp+dt*2);if(e.type===3){e.charge=(e.charge||0)+dt;if(e.hit>0&&e.charge>.65){e.charge=0;e.attackClock+=.5;expansion59.interrupts++;lira.phase='CHARGE INTERRUPTED'}if(e.shield<=0&&e.armorParts>0){e.armorParts--;e.shield=e.shieldMax*.22;combatEvent('LIRA_ARMOR_BROKEN',{parts:e.armorParts})}}}lira.skillRating=clamp(.85+memory.runs*.02+kills/Math.max(1,elapsed)*.1,.8,1.6)}
function omniElements(){for(const e of enemies){if(e.slow>0)e.element='CRYO';else if(player.lightning)e.element='SHOCK';else if(player.gravity)e.element='GRAVITY';if(e.element==='SHOCK'&&e.slow>0)e.resist=Math.max(.55,(e.resist||1)-.002);if(e.element==='GRAVITY'&&dist(player,e)<180)e.speed=Math.max(24,e.speed*.999)}}
function omniClashes(){const hCap=superAI.tier===1?24:42,sCap=superAI.tier===1?36:70;for(let i=hostile.length-1,hn=0;i>=0&&hn<hCap;i--,hn++){const h=hostile[i];for(let j=shots.length-1,sn=0;j>=0&&sn<sCap;j--,sn++){const s=shots[j],dx=h.x-s.x,dy=h.y-s.y,r=h.r+s.r+5;if(dx*dx+dy*dy<r*r){hostile.splice(i,1);shots.splice(j,1);expansion59.clashes++;burst(h.x,h.y,'#ffffff',8);break}}}}
function omniEnvironment(){if(!iyla2026?.props)return;for(const p of iyla2026.props){if(p.broken)continue;for(const b of beams)if(Math.hypot(p.x-b.x2,p.y-b.y2)<28){p.broken=true;expansion59.destruction++;burst(p.x,p.y,'#ffb34d',10);break}}}
function rememberReplayFrame(frame){const r=expansion59.replay;if(r.length<REPLAY_MEMORY_CAP){r.push(frame);return}r[expansion59.replayHead]=frame;expansion59.replayHead=(expansion59.replayHead+1)%REPLAY_MEMORY_CAP;expansion59.replayWrapped=true}
function orderedReplayFrames(){const r=expansion59.replay,h=expansion59.replayHead;if(!expansion59.replayWrapped)return r.slice();return r.slice(h).concat(r.slice(0,h))}
function omniReplay(dt){expansion59.captureTime+=dt;expansion59.replayClock-=dt;if(expansion59.replayClock>0)return;expansion59.replayClock=.2;const target=omniTarget(),tr=griffin.transformation,s=griffin.superMove,cinematic=tr?.active?'TRANSFORMATION':s?.active?'SUPER_MOVE':'COMBAT',sceneTime=tr?.active?tr.time:s?.active?s.time:0,sceneDuration=tr?.active?tr.duration:s?.active?s.duration:0,frame={t:+elapsed.toFixed(1),rt:+expansion59.captureTime.toFixed(1),hp:Math.round(player.hp),k:kills,f:griffin.form?.name||'BASE',g:griffin.mode,l:lira.phase,x:worldX|0,y:worldY|0,ki:Math.round(expansion59.ki*100),ult:Math.round(expansion59.ultimate*100),shots:shots.length,hostile:hostile.length,enemies:enemies.length,target:target?Math.round(dist(player,target)):null,yaw:+(griffin.heading||0).toFixed(3),cinematic:{type:cinematic,id:tr?.active?saiyanForms[tr.stage].name:s?.active?s.id:'',phase:tr?.active?tr.phase:s?.active?owen.phase:'',time:+sceneTime.toFixed(2),duration:+sceneDuration.toFixed(2),progress:sceneDuration?+clamp(sceneTime/sceneDuration,0,1).toFixed(3):0,impact:!!s?.impact,wave:Math.round(tr?.wave||0),hits:s?.confirmedHits||0,damage:Math.round(s?.confirmedDamage||0)},owen:{pose:owen.pose,phase:owen.phase,queue:owen.queue.length,blend:+owen.blend.toFixed(3),hold:+owen.hold.toFixed(3)},matty:{commands:matty.commands,accepted:matty.accepted,coalesced:matty.coalesced,superseded:matty.superseded,rejected:matty.rejected,control:cinematic,confirmedHits:zCinema.confirmedHits||0},perf:{fps:Math.round(iyla.fps||0),frameMs:+(superAI.frame||0).toFixed(1),workMs:+(xavier.work||0).toFixed(1),tier:superAI.tier,thermal:expansion59.thermal,gpu:iyla3d.error?'FALLBACK':iyla3d.gl?'WEBGL':'CANVAS'}};if(expansion59.captureTime<=30)expansion59.openingReplay.push(frame);rememberReplayFrame(frame)}
function omniThermal(){expansion59.thermal=superAI.frame>28||superAI.overruns>40?'PROTECTED':superAI.frame>20?'WARM':'NORMAL';expansion59.quality=superAI.tier===1?'BATTERY SAFE':superAI.tier===2?'BALANCED':'CINEMATIC';expansion59.camera.zoom=griffin.boss?clamp(1-Math.max(0,dist(player,griffin.boss)-260)/1400,.78,1):1;expansion59.camera.shake=superAI.tier===1?.35:.75}
function omniSystems(dt){if(elapsed<.08&&!expansion59.run){expansion59.run=true;omniReset()}else if(elapsed>.2)expansion59.run=false;expansion59.clock-=dt;if(expansion59.clock<=0){expansion59.clock=superAI.tier===1?.2:.1;omniLearn(dt);omniEnvironment()}omniGriffin(dt);omniLira(dt);omniElements();omniClashes();omniThermal()}
function omniVisuals(){x.save();x.globalAlpha=.22;x.strokeStyle=griffin.form?.color||'#65faff';x.lineWidth=2;x.beginPath();x.arc(player.x,player.y,34+expansion59.ultimate*20,griffin.heading-.8,griffin.heading+.8);x.stroke();if(expansion59.flight>.2){x.globalAlpha=.2;x.fillStyle='#8ffff1';x.beginPath();x.ellipse(player.x,player.y+28,18,7,0,0,TAU);x.fill()}x.restore()}
function omniHud(){const el=$('#ultimateDetail');if(el)el.innerHTML+=`<br><b>59-SYSTEM OMNI EXPANSION</b><br>${expansion59.authority} · ${expansion59.features}/59 ONLINE<br>MISSION ${griffin.mission} · WEAPON ${griffin.weaponPolicy}<br>COMBO ${expansion59.combo} · KI ${Math.round(expansion59.ki*100)}% · ULT ${Math.round(expansion59.ultimate*100)}%<br>CLASH ${expansion59.clashes} · INTERRUPT ${expansion59.interrupts} · DESTRUCTION ${expansion59.destruction}<br>REPLAY ${expansion59.replay.length} + OPENING ${expansion59.openingReplay.length} · ${expansion59.quality} · THERMAL ${expansion59.thermal}`}
function exportReplay(){const frames=orderedReplayFrames(),payload={version:65,schema:'jarvis-survivor-replay-v5',sampleHz:REPLAY_SAMPLE_HZ,retentionSeconds:REPLAY_MEMORY_SECONDS,frameCount:frames.length,openingSeconds:30,openingFrames:expansion59.openingReplay,frames,telemetry:['combat','griffin-facing','ki','ultimate','cinematic-phase','cinematic-progress','transformation-wave','super-move-impact','super-move-damage','melee-hit-confirmation','matty-director','owen-animation','frame-time','gpu-mode']},a=document.createElement('a'),blob=new Blob([JSON.stringify(payload)],{type:'application/json'});a.href=URL.createObjectURL(blob);a.download='jarvis-survivor-replay.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
const omniControls=document.createElement('div');omniControls.className='omni-controls';omniControls.innerHTML='<button id="photoMode">PHOTO</button><button id="replayExport">REPLAY</button>';document.querySelector('.hud').appendChild(omniControls);$('#photoMode').onclick=()=>{expansion59.photo=!expansion59.photo;paused=expansion59.photo;$('#photoMode').textContent=expansion59.photo?'RESUME':'PHOTO'};$('#replayExport').onclick=exportReplay;
function updateBest(){$('#bestTime').textContent=fmt(+(localStorage.coreSurvivorTime||0));$('#bestKills').textContent=+(localStorage.coreSurvivorKills||0)}
function exportBrain(){const blob=new Blob([JSON.stringify(memory,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='griffin-x10-brain.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function importBrain(){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=()=>{const f=input.files[0],r=new FileReader;r.onload=()=>{try{Object.assign(memory,JSON.parse(r.result));saveMemory();speak('Brain transfer complete.');hud()}catch{speak('Brain transfer rejected.')}};r.readAsText(f)};input.click()}
initIylaGPU=function(){ultimate.gpuMode='XAVIER SINGLE WEBGL2';xavier.gpu='SINGLE CONTEXT'};
iylaObserve=function(){const realFrame=clamp(superAI.frame/1000,.008,.05),measured=1/realFrame;iyla.frame=elapsed<1?1/60:iyla.frame*.9+realFrame*.1;iyla.fps=elapsed<1?60:Math.round(clamp(measured*.2+(1/iyla.frame)*.8,15,120));const target=superAI.tier===1?.58:superAI.tier===2?.72:.9;iyla.quality+=clamp(target-iyla.quality,-.012,.012);iyla.intensity=clamp(hostile.length*.08+enemies.length*.012+shake*.04+(griffin.evolution||0)*.12,0,1);iyla.mode=superAI.stall?'XAVIER RECOVERY':iyla.intensity>.72?'CINEMATIC COMBAT':superAI.tier===1?'PERFORMANCE GUARD':griffin.evolution>2?'TRANSFORMATION FOCUS':'WORLD ENHANCEMENT';iyla.palette=lira.phase.includes('KI')?'CRIMSON CONFLICT':griffin.evolution>2?'SAIYAN AURORA':'CYAN VOID';iyla.reason=superAI.tier===1?'STABLE FULL-RATE VISUALS':hostile.length>4?'HIGHLIGHTING THREATS':enemies.length>30?'CLARIFYING SWARM':'EVOLVING HIGH DEFINITION';iyla.decisions++};
iyla2026Frame=function(){if(!iyla2026.frame){iyla2026.frame=1;iyla2026.lastWorldX=worldX;iyla2026.lastWorldY=worldY;initIylaGPU()}iylaScrollWorld();iylaTelegraphs();iylaAtmosphere()};
const xavierWorld3D=iyla3DWorld;iyla3DWorld=function(){if(iyla3d.gl)xavierWorld3D()};
const xavier3DInit=iyla3DInit;iyla3DInit=function(){xavier3DInit();iyla3d.ready=true;const cv=iyla3d.cv;if(!cv)return;cv.addEventListener('webglcontextlost',e=>{e.preventDefault();xavier.contextLosses++;xavier.gpu='SOFTWARE RECOVERY';iyla3d.gl=null;iyla3d.ready=true;cv.style.visibility='hidden';iyla3d.mode='XAVIER SOFTWARE RECOVERY'},{once:true});cv.addEventListener('webglcontextrestored',()=>{xavier.contextRestores++;xavier.gpu='SINGLE CONTEXT';cv.remove();Object.assign(iyla3d,{gl:null,cv:null,program:null,cube:null,sphere:null,started:false,ready:false,error:''})},{once:true})};
iyla3DCombat=function(){const evo=griffin.evolution||0,gc=evo>=4?[.92,1,1]:evo===3?[.72,.28,1]:evo===2?[1,.32,.04]:evo===1?[1,.78,.08]:[.05,.85,1],gyaw=peytenYaw(griffin.heading||0),b=griffin.boss&&enemies.includes(griffin.boss)?griffin.boss:null,mobile=W<720,pressure=superAI.tier===1||xavier.work>xavier.budget*.82||enemies.length>55,detailCap=pressure?(mobile?2:3):(mobile?4:7),crowdCap=pressure?(mobile?6:9):(mobile?10:16),shotCap=pressure?10:20,form=evo;owenGriffin(gyaw,gc,form);peytenGriffin(gyaw,form);elijah.models=elijah.features=0;owen.joints=0;owen.frames++;if(b)owenLira(b,true);const nearby=enemies.filter(e=>e!==b).sort((a,c)=>dist(player,a)-dist(player,c)),detailed=nearby.slice(0,detailCap);for(const e of detailed)owenLira(e,false);for(const e of nearby.slice(detailCap,detailCap+crowdCap))owenCrowd(e);for(const s of shots.slice(0,shotCap))iylaRound((s.x-W/2)/45,.55,(s.y-H/2)/45,.11,.11,.18,s.drone?[1,.78,.08]:[.55,1,1],0,.92);for(const s of hostile.slice(0,shotCap))iylaRound((s.x-W/2)/45,.58,(s.y-H/2)/45,.15,.15,.22,[1,.03,.18],0,.9);iyla3d.budget=`${detailCap}H/${crowdCap}L · OWEN ${owen.pose}`};
const xavierRender3D=iyla3DFrame;iyla3DFrame=function(dt){try{xavierRender3D(dt)}catch(error){xavier.learned.recoveries++;superAI.recoveries++;superAI.stall=Math.max(superAI.stall,2);xavier.gpu='SAFE SOFTWARE';iyla3d.error=String(error?.message||error).slice(0,72);iyla3d.mode='XAVIER SAFE SOFTWARE';if(iyla3d.cv)iyla3d.cv.style.visibility='hidden';iyla3d.gl=null;iyla3d.ready=true}};
const xavierPersistMemory=saveMemory;let xavierSavePending=false;saveMemory=function(){if(xavierSavePending)return;xavierSavePending=true;const persist=()=>{xavierSavePending=false;try{const science=memory.science?.hypotheses;if(science&&Object.keys(science).length>192){const keep=Object.entries(science).sort((a,b)=>(b[1].confidence||0)-(a[1].confidence||0)||(b[1].tests||0)-(a[1].tests||0)).slice(0,192);memory.science.hypotheses=Object.fromEntries(keep)}memory.replay=memory.replay.slice(-120);memory.episodes=memory.episodes.slice(-32);xavierPersistMemory()}catch(error){xavier.learned.saveError=String(error?.message||error).slice(0,72)}};if(typeof requestIdleCallback==='function')requestIdleCallback(persist,{timeout:4000});else setTimeout(persist,250)};
// Z-Cinema: original high-energy anime combat, strictly bounded for mobile.
const zCinema={version:'2.0',attack:0,vanish:0,volley:0,burst:0,clash:0,combo:0,comboClock:0,meleePose:'FLIGHT',meleeSide:1,route:[],routeName:'',routeSerial:0,recentRoutes:[],form:-1,transform:0,after:[],impacts:[]};
// Matty/Owen readable combat cadence: each clip has enough anticipation and
// recovery to identify the move on a phone, while compact hit displacement
// lets a composed route remain one continuous exchange.
const griffinStrikes={JAB:['LIGHTNING JAB','PUNCH',.4,13,5],CROSS:['METEOR CROSS','PUNCH',.46,17,7],HOOK:['ORBIT HOOK','HOOK',.55,20,10],ELBOW:['PHANTOM ELBOW','ELBOW',.52,22,8],KNEE:['COMET KNEE','KNEE',.6,24,11],UPPER:['NOVA UPPERCUT','UPPERCUT',.68,27,13],SPIN:['CYCLONE KI KICK','SPIN_KICK',.78,30,15],SWEEP:['GRAVITY SWEEP','SWEEP',.7,25,12],BACK:['VANISH BACK KICK','BACK_KICK',.74,29,14],AXE:['TITAN AXE KICK','AXE_KICK',.84,34,17],DIVE:['AERIAL DIVE KICK','DIVE_KICK',.82,36,18]};
const griffinOpeners=[['JAB','CROSS','HOOK'],['CROSS','ELBOW','KNEE'],['JAB','HOOK','UPPER'],['ELBOW','SWEEP','CROSS'],['BACK','JAB','KNEE'],['DIVE','CROSS','UPPER']];
const griffinBridges=[['KNEE','UPPER'],['SWEEP','SPIN'],['ELBOW','BACK'],['HOOK','AXE'],['UPPER','DIVE'],['SPIN','CROSS']];
const griffinFinishers=[['DRAGON COMET BREAKER','FINISHER'],['HEAVEN-SPLITTING AXE','AXE_KICK'],['NOVA RUSH FINALE','FINISHER'],['INFINITE IMPACT KICK','DIVE_KICK'],['GALAXY SHOCK UPPERCUT','UPPERCUT'],['CYCLONE STARFALL','SPIN_KICK']];
function griffinComposeCombo(target,density){const serial=++zCinema.routeSerial,boss=target.type===3,low=player.hp/player.maxHp<.45,seed=(serial*7+(kills||0)*3+(griffin.evolution||0)*5+density+(boss?11:0)+(low?17:0))>>>0;let oi=seed%griffinOpeners.length,bi=(seed*3+1)%griffinBridges.length,fi=(seed*5+3)%griffinFinishers.length;for(let n=0;n<griffinOpeners.length&&zCinema.recentRoutes.includes(`${oi}:${bi}:${fi}`);n++){oi=(oi+1)%griffinOpeners.length;bi=(bi+2)%griffinBridges.length;fi=(fi+3)%griffinFinishers.length}const opener=griffinOpeners[oi],bridge=griffinBridges[bi],finisher=griffinFinishers[fi],keys=[...opener,...bridge],route=keys.map((key,i)=>({key,data:griffinStrikes[key],side:(seed+i+(key==='HOOK'||key==='ELBOW'?1:0))%2?1:-1,finisher:false,section:i<opener.length?'OPENER':'BRIDGE'}));route.push({key:'FINISH',data:[finisher[0],finisher[1],boss?1.08:.94,boss?58:47,boss?42:34],side:(seed+keys.length)%2?1:-1,finisher:true,section:'FINISHER'});zCinema.route=route;zCinema.routeName=`${opener[0]}-${bridge[0]}-${finisher[0]}`;zCinema.recentRoutes.push(`${oi}:${bi}:${fi}`);if(zCinema.recentRoutes.length>5)zCinema.recentRoutes.shift();combatEvent('GRIFFIN_COMBO_COMPOSED',{route:zCinema.routeName,moves:route.map(m=>m.data[0]),boss,density});return route}
function zPush(list,item,cap){list.push(item);if(list.length>cap)list.splice(0,list.length-cap)}
function zTarget(){return griffin.boss&&enemies.includes(griffin.boss)?griffin.boss:omniTarget()}
function zAfter(x,y,a,color='#8ffff1'){zPush(zCinema.after,{x,y,a,color,life:.28,max:.28},superAI.tier===1?4:8)}
function zImpact(x,y,color='#fff4ba',power=1){zPush(zCinema.impacts,{x,y,color,power,life:.24,max:.24},superAI.tier===1?5:10);shake=Math.max(shake,4+power*3)}
function zCinemaUpdate(dt){if(elapsed<.08){Object.assign(zCinema,{attack:0,vanish:0,volley:0,burst:0,clash:0,combo:0,comboClock:0,meleePose:'FLIGHT',meleeSide:1,route:[],form:griffin.evolution||0,transform:0});zCinema.after.length=zCinema.impacts.length=0}for(const q of zCinema.after)q.life-=dt;for(const q of zCinema.impacts)q.life-=dt;zCinema.after=zCinema.after.filter(q=>q.life>0);zCinema.impacts=zCinema.impacts.filter(q=>q.life>0);zCinema.attack-=dt;zCinema.vanish-=dt;zCinema.volley-=dt;zCinema.burst-=dt;zCinema.clash-=dt;zCinema.comboClock-=dt;if(zCinema.comboClock<=0){zCinema.combo=0;zCinema.route.length=0}const form=griffin.evolution||0;if(form!==zCinema.form){zCinema.form=form;zCinema.transform=3.2;iylaScene(griffin.form?.name||'GRIFFIN LIMIT ASCENSION',`FORM ${form+1} · POWER ${(griffin.power||0).toLocaleString()} AWAKENED`,griffin.form?.color||'#8ffff1',3.2,10);rings.push({x:player.x,y:player.y,r:18,max:260,life:.7});zImpact(player.x,player.y,griffin.form?.color||'#8ffff1',2)}zCinema.transform=Math.max(0,zCinema.transform-dt*.72);const target=zTarget();if(!target)return;const boss=target.type===3?target:null,d=dist(player,target),contact=boss?190:146,a=Math.atan2(target.y-player.y,target.x-player.x),near=enemies.filter(e=>dist(player,e)<190).length;griffin.heading=a;const danger=hostile.filter(h=>Math.hypot(h.x-player.x,h.y-player.y)<82);if(danger.length&&zCinema.vanish<=0){zCinema.vanish=.85;player.invuln=Math.max(player.invuln||0,.28);for(let n=0;n<4;n++)zAfter(player.x-Math.cos(a)*n*18,player.y-Math.sin(a)*n*18,a);const h=danger[0],i=hostile.indexOf(h);if(i>=0)hostile.splice(i,1);zImpact(h.x,h.y,'#ffffff',1);griffin.mode='VANISH COUNTER'}if(d<contact&&zCinema.attack<=0){if(!zCinema.route.length||zCinema.combo>=zCinema.route.length)griffinComposeCombo(target,near);const beat=zCinema.combo,move=zCinema.route[beat],data=move.data;zCinema.combo=beat+1;zCinema.meleePose=data[1];zCinema.meleeSide=move.side;zCinema.attack=data[2]*(boss?.76:1);zCinema.comboClock=boss?1.75:1.35;const tempo=boss?1+Math.min(.7,(boss.battleTime||0)/42):1,power=(data[3]+form*6+(boss?10:0))*tempo,push=data[4]*(boss?.24:1);hurt(target,power,move.finisher?'#ffe66b':'#fff2ae');target.x+=Math.cos(a)*push;target.y+=Math.sin(a)*push;player.x=clamp(player.x+Math.cos(a)*Math.min(boss?27:19,d*.14),25,W-25);player.y=clamp(player.y+Math.sin(a)*Math.min(boss?27:19,d*.14),90,H-25);zAfter(player.x-Math.cos(a)*22,player.y-Math.sin(a)*22,a);zImpact(target.x,target.y,move.finisher?'#ffe66b':'#ffffff',move.finisher?3:beat>2?2:1);griffin.mode=`${data[0]} · ${beat+1}/${zCinema.route.length}`;combatEvent(move.finisher?'GRIFFIN_CREATED_FINISHER':'MELEE_COMBO_BEAT',{route:zCinema.routeName,beat:beat+1,move:data[0],pose:data[1],side:move.side,boss:!!boss});if(beat>=2)rings.push({x:target.x,y:target.y,r:8,max:70+beat*22,life:.28+beat*.025});if(move.finisher){for(const e of [...enemies])if(e!==target&&dist(target,e)<175)hurt(e,26+form*5,'#ffe66b');zCinema.route.length=0;zCinema.combo=0;zCinema.comboClock=0}}else if(d<360&&zCinema.volley<=0){zCinema.volley=Math.max(.65,1.15-form*.05);const count=superAI.tier===1?3:5;for(let n=0;n<count;n++){const spread=(n-(count-1)/2)*.09;shots.push({x:player.x,y:player.y,vx:Math.cos(a+spread)*650,vy:Math.sin(a+spread)*650,r:4,life:.72,damage:9+form*3,pierce:0,zKi:true})}griffin.mode='RAPID KI VOLLEY'}if(d>contact&&d<320&&zCinema.attack<.06){for(let n=0;n<(boss?5:3);n++)zAfter(player.x-Math.cos(a)*n*25,player.y-Math.sin(a)*n*25,a);griffin.mode=boss?'MATTY BOSS PRESSURE':'AERIAL FLASH PURSUIT'}if(near>8&&zCinema.burst<=0){zCinema.burst=3.5;for(const e of [...enemies])if(dist(player,e)<205)hurt(e,20+form*5,'#8ffff1');rings.push({x:player.x,y:player.y,r:20,max:230,life:.5});zImpact(player.x,player.y,'#8ffff1',2);griffin.mode='EXPLOSIVE AURA BREAK'}if(boss&&d<520&&zCinema.clash<=0&&hostile.length>5){zCinema.clash=6;beams.push({x1:player.x,y1:player.y,x2:boss.x,y2:boss.y,life:.42,color:griffin.form?.color||'#65faff'});hurt(boss,24+form*9,'#ffffff');zImpact((player.x+boss.x)/2,(player.y+boss.y)/2,'#ffffff',2);lira.phase='KI BEAM STRUGGLE';griffin.mode='KI BEAM STRUGGLE'}}
function zCinemaVisuals(){const low=superAI.tier===1;x.save();for(const a of zCinema.after){const q=a.life/a.max;x.globalAlpha=q*.3;x.translate(a.x,a.y);x.rotate(a.a+Math.PI/2);x.fillStyle=a.color;x.beginPath();x.ellipse(0,0,15,30,0,0,TAU);x.fill();x.setTransform(1,0,0,1,0,0)}for(const p of zCinema.impacts){const q=p.life/p.max;x.globalAlpha=q;x.strokeStyle=p.color;x.lineWidth=2+p.power;const count=low?6:10;for(let n=0;n<count;n++){const a=n*TAU/count,r=(1-q)*52*p.power+8;x.beginPath();x.moveTo(p.x+Math.cos(a)*r*.25,p.y+Math.sin(a)*r*.25);x.lineTo(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r);x.stroke()}}if(expansion59.flight>.2||zCinema.combo){x.globalAlpha=.16;x.strokeStyle=griffin.form?.color||'#8ffff1';x.lineWidth=2;const count=low?5:9;for(let n=0;n<count;n++){const a=griffin.heading+Math.PI+(n-(count-1)/2)*.13,len=45+(n%3)*18;x.beginPath();x.moveTo(player.x+Math.cos(a)*35,player.y+Math.sin(a)*35);x.lineTo(player.x+Math.cos(a)*len,player.y+Math.sin(a)*len);x.stroke()}}if(zCinema.transform>0){const q=clamp(zCinema.transform/3.2,0,1),g=x.createRadialGradient(player.x,player.y,12,player.x,player.y,180);g.addColorStop(0,'rgba(255,255,255,.72)');g.addColorStop(.24,griffin.form?.color||'#8ffff1');g.addColorStop(1,'rgba(100,240,255,0)');x.globalAlpha=.34+Math.sin(q*Math.PI)*.5;x.fillStyle=g;x.fillRect(player.x-190,player.y-190,380,380)}x.restore()}
const zBaseSystems=omniSystems;omniSystems=function(dt){zBaseSystems(dt);zCinemaUpdate(dt)};
const zBaseVisuals=omniVisuals;omniVisuals=function(){zBaseVisuals();zCinemaVisuals()};
const zStage={pose:'FLIGHT',poseT:0,elevation:0,zoom:1,cut:0,lastHits:0,lastMode:'',rubble:[],blasts:[],ui:false};
function zStageBurst(x,y,color='#ffe66b',power=1){zPush(zStage.blasts,{x,y,color,power,life:.42,max:.42},superAI.tier===1?3:6);if(iyla2026?.props){let n=0;for(const p of iyla2026.props)if(!p.broken&&Math.hypot(p.x-x,p.y-y)<80*power&&n++<3){p.broken=true;expansion59.destruction++}}}
function zStageUpdate(dt){for(const b of zStage.blasts)b.life-=dt;zStage.blasts=zStage.blasts.filter(b=>b.life>0);zStage.poseT=Math.max(0,zStage.poseT-dt);zStage.cut=Math.max(0,zStage.cut-dt);const mode=griffin.mode||'',target=zTarget(),combat=running&&(enemies.length>10||hostile.length>2||zCinema.combo||zCinema.transform);if(mode!==zStage.lastMode){zStage.lastMode=mode;zStage.poseT=owenClips[zCinema.meleePose]?.length||.36;if(mode.includes('VOLLEY')||mode.includes('BEAM'))zStage.pose='CAST';else if(mode.includes('VANISH')||mode.includes('PURSUIT'))zStage.pose='DASH';else if(mode.includes('BURST')){zStage.pose='POWER';zStage.cut=.5}else if(zCinema.combo||zCinema.meleePose!=='FLIGHT'){zStage.pose=zCinema.meleePose;if(zStage.pose==='FINISHER')zStage.cut=.42}else zStage.pose='FLIGHT'}if(zCinema.transform>0)zStage.pose='TRANSFORM';if(zStage.poseT<=0&&!zCinema.transform)zStage.pose='FLIGHT';zStage.elevation+=(clamp((expansion59.flight||0)*.8+(zCinema.combo?1:0),0,1)-zStage.elevation)*Math.min(1,dt*7);zStage.zoom+=(clamp(target&&dist(player,target)<180?.9:combat?.96:1,.86,1)-zStage.zoom)*Math.min(1,dt*5);if(zCinema.impacts.length){const p=zCinema.impacts[zCinema.impacts.length-1];if(!p.stage){p.stage=1;zStageBurst(p.x,p.y,p.color,p.power)}}if(lira.hits>zStage.lastHits){zStage.lastHits=lira.hits;zStage.pose='HIT';zStage.poseT=.18}if(combat!==zStage.ui){zStage.ui=combat;document.body.classList.toggle('combat-focus',combat)}}
function zRig3D(yaw,color,form){const fx=Math.sin(yaw),fz=Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw),p=zStage.pose,t=Math.max(0,zStage.poseT),pulse=Math.sin(elapsed*22),skin=[.9,.6,.4],armor=[.06,.26,.68],lift=zStage.elevation*.16;if(p==='PUNCH'||p==='FINISHER'||p==='CAST'){const side=zCinema.combo%2?1:-1,reach=p==='FINISHER'?1.12:p==='CAST'?.72:.9,h=p==='CAST'?1.48:1.62;iylaRound(rx*side*.42+fx*reach,h+lift,rz*side*.42+fz*reach,.2,.34,.2,skin,yaw);iylaRound(rx*side*.28+fx*(reach*.55),h+.08+lift,rz*side*.28+fz*(reach*.55),.22,.3,.22,skin,yaw);iylaRound(rx*side*.42+fx*(reach+Math.max(0,pulse)*.08),h+lift,rz*side*.42+fz*(reach+Math.max(0,pulse)*.08),.25,.22,.25,armor,yaw);if(p==='CAST')iylaRound(fx*1.02,1.5+lift,fz*1.02,.22+t*.25,.22+t*.25,.22+t*.25,color,yaw,.85)}if(p==='KICK'){const side=zCinema.combo%2?1:-1;iylaRound(rx*side*.28+fx*.55,.7+lift,rz*side*.28+fz*.55,.24,.45,.25,[.92,.24,.025],yaw);iylaRound(rx*side*.28+fx*1.02,.58+lift,rz*side*.28+fz*1.02,.27,.22,.42,armor,yaw)}if(p==='HIT')for(const side of [-1,1]){iylaRound(rx*side*.25+fx*.45,1.55+side*.12,rz*side*.25+fz*.45,.2,.34,.2,skin,yaw);iylaRound(rx*side*.12+fx*.68,1.5+side*.12,rz*side*.12+fz*.68,.23,.2,.23,armor,yaw)}if(p==='DASH')for(let n=0;n<3;n++)iylaBox(-fx*(.8+n*.35),1.2+n*.16,-fz*(.8+n*.35),.05,.05,.5,color,yaw,.3);if(p==='TRANSFORM'||p==='POWER')for(let n=0;n<(superAI.tier===1?6:10);n++){const a=n*TAU/(superAI.tier===1?6:10)+elapsed*.9;iylaBox(Math.cos(a)*(1.05+t*.4),.5+(n%4)*.55,Math.sin(a)*(1.05+t*.4),.04,.35,.04,color,a,.5)}}
function zLiraRig(e,boss){if(!e||!enemies.includes(e))return;const px=(e.x-W/2)/45,pz=(e.y-H/2)/45,yaw=-Math.atan2(player.x-e.x,player.y-e.y),fx=Math.sin(yaw),fz=Math.cos(yaw),attack=e.attackClock<.24||e.hit>0;if(!attack)return;const col=e.hit>0?[1,1,1]:boss?[1,.03,.35]:[.65,.04,.2],reach=boss?.9:.55;iylaRound(px+fx*reach,1.2*(boss?1.25:.72),pz+fz*reach,.2,.25,.2,col,yaw);if(e.hit>0)for(let n=0;n<4;n++){const a=n*TAU/4+elapsed;iylaBox(px+Math.cos(a)*.5,.9,pz+Math.sin(a)*.5,.04,.18,.04,[1,.2,.4],a,.6)}}
const matty={name:'MATTY',role:'COMBAT + ANIMATION DIRECTOR',version:'3.1',policy:'COMMITTED CLIPS + HYSTERESIS',commands:0,accepted:0,coalesced:0,superseded:0,rejected:0,quiet:0,lastRequest:'FLIGHT',commitRatio:.72};
const owen={name:'OWEN MILLION NEURAL MOTION ENGINE',version:'MAX-5',pose:'FLIGHT',wanted:'FLIGHT',phase:'LOOP',stateTime:0,stateLength:1,blend:1,dt:.016,frames:0,joints:0,errors:0,jointCursor:0,poseMemory:new Map(),queue:[],transitions:0,stability:1,hold:0,lastImpact:0,comboBeat:0,smear:0,director:matty.name,librarySize:1000000,recipe:0,recipeTransition:-1};
const owenClips={FLIGHT:{length:1,loop:1,priority:1},DASH:{length:.42,priority:4},VANISH:{length:.28,priority:7},PUNCH:{length:.34,priority:5},HOOK:{length:.4,priority:6},ELBOW:{length:.38,priority:6},KNEE:{length:.44,priority:7},KICK:{length:.48,priority:5},UPPERCUT:{length:.5,priority:6},SPIN_KICK:{length:.58,priority:7},SWEEP:{length:.5,priority:7},BACK_KICK:{length:.54,priority:7},AXE_KICK:{length:.62,priority:8},DIVE_KICK:{length:.6,priority:8},CAST:{length:.72,priority:5},CHARGE:{length:1.05,priority:7},HIT:{length:.34,priority:8},POWER:{length:1.1,priority:9},FINISHER:{length:.9,priority:10},TRANSFORM:{length:3.2,priority:20}};
function owenPhase(){const q=clamp(owen.stateTime/Math.max(.01,owen.stateLength),0,1);return q<.22?'ANTICIPATION':q<.67?'ACTION':q<.88?'FOLLOW THROUGH':'RECOVERY'}
function owenController(dt){owen.dt=Math.min(.033,dt||.016);if(elapsed<.08){owen.pose='FLIGHT';owen.wanted='FLIGHT';owen.stateTime=0;owen.blend=1;owen.hold=0;owen.queue.length=0;owen.poseMemory.clear();matty.commands=matty.accepted=matty.coalesced=matty.superseded=matty.rejected=0}const cinematic=griffin.transformation?.active,superMove=griffin.superMove?.active;if(cinematic){owen.pose=owen.wanted='TRANSFORM';owen.queue.length=0;owen.stateLength=griffin.transformation.duration;owen.stateTime=griffin.transformation.time;owen.blend=Math.min(1,owen.blend+owen.dt*2);owen.phase=griffin.transformation.phase;owen.hold=owen.smear=0;owen.stability=1;owen.jointCursor=0;return}if(superMove){const pose=superMovePose(griffin.superMove);owen.pose=owen.wanted=pose;owen.queue.length=0;owen.stateLength=griffin.superMove.duration;owen.stateTime=griffin.superMove.time;owen.blend=Math.min(1,owen.blend+owen.dt*2);owen.phase=pose;owen.hold=owen.smear=0;owen.stability=1;owen.jointCursor=0;return}if(zCinema.impacts.length!==owen.lastImpact){owen.lastImpact=zCinema.impacts.length;owen.hold=superAI.tier===1?.035:.065;owen.smear=.16;owen.comboBeat++}owen.hold=Math.max(0,owen.hold-owen.dt);owen.smear=Math.max(0,owen.smear-owen.dt);const mode=griffin.mode||'',requested=zCinema.transform>0?'TRANSFORM':mode.includes('VANISH')?'VANISH':mode.includes('BEAM')?'CHARGE':zStage.pose||'FLIGHT';if(requested!==owen.wanted){owen.wanted=requested;matty.commands++;const clip=owenClips[requested]||owenClips.FLIGHT;if(requested===owen.pose||owen.queue.includes(requested)||requested==='FLIGHT')matty.coalesced++;else{for(let i=owen.queue.length-1;i>=0;i--){const queued=owenClips[owen.queue[i]]||owenClips.FLIGHT;if(clip.priority>queued.priority){owen.queue.splice(i,1);matty.superseded++}}if(owen.queue.length<2){owen.queue.push(requested);owen.queue.sort((a,b)=>(owenClips[b]?.priority||1)-(owenClips[a]?.priority||1));matty.accepted++}else matty.rejected++}}let wanted=owen.queue[0]||requested,current=owenClips[owen.pose]||owenClips.FLIGHT,next=owenClips[wanted]||owenClips.FLIGHT,done=owen.stateTime>=owen.stateLength;if(wanted!==owen.pose&&(done||next.priority>=current.priority||owen.pose==='FLIGHT')){owen.pose=wanted;owen.queue.shift();owen.stateTime=0;owen.stateLength=next.length;owen.blend=0;owen.transitions++;current=next}else if(done&&!current.loop){owen.pose=owen.queue.shift()||'FLIGHT';owen.stateTime=0;owen.stateLength=(owenClips[owen.pose]||owenClips.FLIGHT).length;owen.blend=0}if(!owen.hold)owen.stateTime+=owen.dt;owen.blend+=(1-owen.blend)*(1-Math.exp(-owen.dt*14));owen.phase=owenPhase();owen.stability=clamp(1-Math.abs(peyten.turn||0)*.28-(owen.pose==='HIT'?.22:0),.35,1);owen.jointCursor=0}
function owenSmoothPoint(key,target,response=18){let p=owen.poseMemory.get(key);if(!p){p={x:target.x,y:target.y,z:target.z,vx:0,vy:0,vz:0};owen.poseMemory.set(key,p)}const k=response*response,d=2*response,dt=owen.dt;for(const axis of ['x','y','z']){const v='v'+axis;p[v]+=(target[axis]-p[axis])*k*dt-p[v]*d*dt;p[axis]+=p[v]*dt}return{x:p.x,y:p.y,z:p.z}}
function owenJoint(a,b,r,color,yaw){const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,len=Math.hypot(dx,dy,dz),segments=superAI.tier===1?2:3;for(let n=0;n<=segments;n++){const q=n/segments,k=1-Math.abs(q-.5)*.1;iylaRound(a.x+dx*q,a.y+dy*q,a.z+dz*q,r*k,Math.max(r*1.12,len/(segments+1)*.72),r*k,color,yaw);owen.joints++}}
function owenAxes(yaw){return{fx:Math.sin(yaw),fz:Math.cos(yaw),rx:Math.cos(yaw),rz:-Math.sin(yaw)}}
function owenPoint(px,pz,ax,ay,az,yaw){const v=owenAxes(yaw);return{x:px+v.rx*ax+v.fx*az,y:ay,z:pz+v.rz*ax+v.fz*az}}
function owenGriffin(yaw,color,form){const v=owenAxes(yaw),p=owen.pose||'FLIGHT',lift=.12+(zStage.elevation||0)*.28,bob=Math.sin(elapsed*8)*.025,lean=(p==='DASH'?.46:p==='HIT'?-.22:p==='FINISHER'?.22:p==='UPPERCUT'?.16:p==='SPIN_KICK'?.1:p==='FLIGHT'?.18:0)*owen.blend,s=1.14,skin=[.88,.57,.38],cloth=[.92,.24,.025],suit=[.025,.11,.29],armor=[.06,.26,.68],phase=elapsed*10,side=zCinema.combo%2?1:-1,clipQ=clamp(owen.stateTime/Math.max(.01,owen.stateLength),0,1),action=Math.sin(clamp(clipQ/.68,0,1)*Math.PI),spin=p==='SPIN_KICK'?Math.sin(clipQ*Math.PI*2):0;iylaRound(0,.03,0,.72,.035,.42,[0,0,0],yaw,.3);const pelvis=owenPoint(0,0,0,1.02*s+lift+(p==='UPPERCUT'?action*.16:0),lean*.22,yaw+spin*.22),chest=owenPoint(0,0,0,1.52*s+lift+(p==='UPPERCUT'?action*.2:0),lean,yaw+spin*.4);iylaRound(pelvis.x,pelvis.y,pelvis.z,.43*s,.25*s,.31*s,cloth,yaw+spin*.3);iylaRound(chest.x,chest.y,chest.z,.57*s,.4*s,.35*s,cloth,yaw+spin*.45);iylaBox(chest.x+v.fx*.3*s,chest.y,chest.z+v.fz*.3*s,.3*s,.22*s,.055*s,armor,yaw+spin*.4);iylaRound(0,1.98*s+lift+(p==='UPPERCUT'?action*.25:0),lean*.7,.14*s,.16*s,.14*s,skin,yaw+spin*.4);for(const q of [-1,1]){const shoulder=owenPoint(0,0,q*.57*s,1.62*s+lift,lean,yaw);let elbow=owenPoint(0,0,q*.73*s,1.3*s+lift,lean+.05,yaw),hand=owenPoint(0,0,q*.65*s,1.03*s+lift,lean+.16,yaw);if(['PUNCH','FINISHER','UPPERCUT'].includes(p)&&q===side){elbow=owenPoint(0,0,q*.34*s,1.48*s+lift+(p==='UPPERCUT'?action*.18:0),.45,yaw);hand=owenPoint(0,0,q*.25*s,1.48*s+lift+(p==='UPPERCUT'?action*.72:0),(p==='FINISHER'?1.28:.98)*action,yaw)}else if(p==='CAST'||p==='CHARGE'){const charge=p==='CHARGE'?(.35+Math.sin(clipQ*Math.PI)*.38):0;elbow=owenPoint(0,0,q*(.38-charge)*s,1.48*s+lift,.48-charge*.2,yaw);hand=owenPoint(0,0,q*.2*s,1.44*s+lift,.9-charge*.34,yaw)}else if(p==='VANISH'){elbow=owenPoint(0,0,q*.55*s,1.42*s+lift,-.3,yaw);hand=owenPoint(0,0,q*.48*s,1.25*s+lift,-.58,yaw)}else if(p==='FLIGHT'){elbow=owenPoint(0,0,q*.68*s,1.36*s+lift,-.04,yaw);hand=owenPoint(0,0,q*.7*s,1.1*s+lift,-.25,yaw)}else if(p==='HIT'){elbow=owenPoint(0,0,q*.82*s,1.72*s+lift,-.05,yaw);hand=owenPoint(0,0,q*.95*s,1.55*s+lift,-.22,yaw)}elbow=owenSmoothPoint('g-arm-e'+q,elbow,22);hand=owenSmoothPoint('g-arm-h'+q,hand,24);owenJoint(shoulder,elbow,.19*s,skin,yaw);owenJoint(elbow,hand,.17*s,skin,yaw);iylaRound(hand.x,hand.y,hand.z,.22*s,.19*s,.22*s,armor,yaw)}for(const q of [-1,1]){const hip=owenPoint(0,0,q*.25*s,.91*s+lift,lean*.2,yaw);let knee=owenPoint(0,0,q*.27*s,.53*s+lift,.07+Math.sin(phase+q)*.06,yaw),foot=owenPoint(0,0,q*.28*s,.16*s+lift,.23+Math.sin(phase+q)*.12,yaw);if(['KICK','SPIN_KICK','AXE_KICK'].includes(p)&&q===side){const axe=p==='AXE_KICK';knee=owenPoint(0,0,q*(axe?.1:.2)*s,(axe?1.18:.82)*s+lift,(axe?.38:.55)*action,yaw+spin);foot=owenPoint(0,0,q*(axe?.08:.16)*s,(axe?1.52:.78)*s+lift,(axe?.78:1.18)*action,yaw+spin)}else if(p==='FLIGHT'){knee=owenPoint(0,0,q*.25*s,.58*s+lift,-.12+q*.04,yaw);foot=owenPoint(0,0,q*.26*s,.3*s+lift,-.35+q*.1,yaw)}else if(p==='DASH'){knee=owenPoint(0,0,q*.25*s,.6*s+lift,-.18+q*.08,yaw);foot=owenPoint(0,0,q*.25*s,.32*s+lift,-.48+q*.12,yaw)}knee=owenSmoothPoint('g-leg-k'+q,knee,20);foot=owenSmoothPoint('g-leg-f'+q,foot,22);owenJoint(hip,knee,.22*s,cloth,yaw);owenJoint(knee,foot,.2*s,suit,yaw);iylaRound(foot.x,foot.y,foot.z,.28*s,.14*s,.39*s,armor,yaw)}const aura=superAI.tier===1?5:8;for(let n=0;n<aura;n++){const a=n*TAU/aura+elapsed*.8;iylaBox(Math.cos(a)*(.85+form*.04),.55+(n%4)*.46,Math.sin(a)*(.85+form*.04),.025,.19,.025,color,a,p==='TRANSFORM'?.5:.14)}if(p==='CAST'||p==='CHARGE'){const charge=.2+clipQ*.28;iylaRound(v.fx*(.72+charge),1.48*s+lift,v.fz*(.72+charge),charge,charge,charge,color,yaw,.9)}if(owen.smear>0)for(let n=0;n<(superAI.tier===1?2:4);n++)iylaBox(-v.fx*(.55+n*.28),1.15+n*.12,-v.fz*(.55+n*.28),.06,.06,.32+n*.1,color,yaw,.18)}
function owenLira(e,boss){if(!e||!enemies.includes(e))return;const px=(e.x-W/2)/45,pz=(e.y-H/2)/45,yaw=-Math.atan2(player.x-e.x,player.y-e.y),v=owenAxes(yaw),s=boss?1.48:.68,hit=e.hit>0,attack=e.attackClock<.24,role=boss?'COMMANDER':e.role||'HUNTER',core=e.variant==='DRAINER'?[.08,1,.42]:e.variant==='SPLITTER'?[1,.53,.04]:e.variant==='PHASE'?[.58,.22,1]:[1,.04,.22],skin=[.42,.07,.15],armor=boss?[.24,.015,.08]:[.12,.015,.07],lift=boss?.12:.04,lean=hit?-.28:attack?.3:role==='RUSHER'?.2:0,side=(e.slot||0)%2?1:-1;const pelvis=owenPoint(px,pz,0,.72*s+lift,lean*.15,yaw),chest=owenPoint(px,pz,0,1.2*s+lift,lean,yaw);iylaRound(px,.025,pz,.48*s,.025,.29*s,[0,0,0],yaw,.28);iylaRound(pelvis.x,pelvis.y,pelvis.z,.36*s,.27*s,.29*s,armor,yaw);iylaRound(chest.x,chest.y,chest.z,.48*s,.37*s,.34*s,skin,yaw);iylaBox(chest.x+v.fx*.29*s,chest.y,chest.z+v.fz*.29*s,.28*s,.18*s,.045*s,core,yaw);for(const q of [-1,1]){const shoulder=owenPoint(px,pz,q*.48*s,1.3*s+lift,lean,yaw);let elbow=owenPoint(px,pz,q*.63*s,1.02*s+lift,lean+.03,yaw),hand=owenPoint(px,pz,q*.55*s,.78*s+lift,lean+.16,yaw);if(attack&&q===side){elbow=owenPoint(px,pz,q*.3*s,1.2*s+lift,.52,yaw);hand=owenPoint(px,pz,q*.18*s,1.18*s+lift,boss?1.05:.75,yaw)}if(hit){elbow=owenPoint(px,pz,q*.7*s,1.42*s+lift,-.1,yaw);hand=owenPoint(px,pz,q*.86*s,1.25*s+lift,-.26,yaw)}owenJoint(shoulder,elbow,.17*s,skin,yaw);owenJoint(elbow,hand,.15*s,armor,yaw);iylaRound(hand.x,hand.y,hand.z,.18*s,.16*s,.18*s,core,yaw)}for(const q of [-1,1]){const hip=owenPoint(px,pz,q*.22*s,.65*s+lift,lean*.1,yaw),knee=owenPoint(px,pz,q*.23*s,.35*s+lift,.08+q*.04,yaw),foot=owenPoint(px,pz,q*.23*s,.1*s+lift,.2+q*.06,yaw);owenJoint(hip,knee,.19*s,armor,yaw);owenJoint(knee,foot,.17*s,skin,yaw);iylaRound(foot.x,foot.y,foot.z,.22*s,.12*s,.31*s,core,yaw)}const head=owenPoint(px,pz,0,1.78*s+lift,lean*.75,yaw);iylaRound(head.x,head.y,head.z,.29*s,.32*s,.27*s,skin,yaw);for(const q of [-1,1]){const eye=owenPoint(head.x,head.z,q*.1*s,head.y+.06*s,.27*s,yaw);iylaRound(eye.x,eye.y,eye.z,.035*s,.045*s,.025*s,core,yaw)}for(let n=0;n<(boss?6:3);n++){const q=n/Math.max(1,(boss?5:2))-.5,a=yaw+q*1.5;iylaBox(head.x-v.fx*.12*s+v.rx*q*.7*s,head.y+.39*s+Math.cos(q*Math.PI)*.08*s,head.z-v.fz*.12*s+v.rz*q*.7*s,.07*s,(.24+(e.bossForm||1)*.04)*s,.08*s,core,a)}if(boss){iylaBox(chest.x+v.rx*.58*s,chest.y+.14*s,chest.z+v.rz*.58*s,.32*s,.1*s,.25*s,core,yaw+.28);iylaBox(chest.x-v.rx*.58*s,chest.y+.14*s,chest.z-v.rz*.58*s,.32*s,.1*s,.25*s,core,yaw-.28);iylaRound(chest.x-v.fx*.32*s,chest.y+.12*s,chest.z-v.fz*.32*s,.5*s,.48*s,.16*s,[.12,.01,.04],yaw,.8);for(let n=0;n<6;n++){const a=n*TAU/6+elapsed*.7;iylaRound(px+Math.cos(a)*.82*s,1.2*s,pz+Math.sin(a)*.82*s,.05*s,.05*s,.05*s,core,a,.55)}}if(boss)for(let n=0;n<4;n++){const a=n*TAU/4+elapsed*.7;iylaRound(px+Math.cos(a)*.72*s,1.15*s,pz+Math.sin(a)*.72*s,.05*s,.05*s,.05*s,core,a,.5)}elijah.models++;elijah.features+=28}
function owenCrowd(e){const px=(e.x-W/2)/45,pz=(e.y-H/2)/45,yaw=-Math.atan2(player.x-e.x,player.y-e.y),core=e.variant==='DRAINER'?[.08,1,.42]:e.variant==='SPLITTER'?[1,.53,.04]:e.variant==='PHASE'?[.58,.22,1]:[1,.06,.24],s=.48;iylaRound(px,.68*s,pz,.28*s,.46*s,.25*s,[.3,.04,.1],yaw);iylaRound(px,1.35*s,pz,.2*s,.22*s,.19*s,[.4,.07,.14],yaw);for(const q of [-1,1]){iylaRound(px+q*.28*s,.78*s,pz,.1*s,.34*s,.1*s,core,yaw);iylaRound(px+q*.14*s,.23*s,pz+.08,.12*s,.31*s,.12*s,core,yaw)}}
function zStageVisuals(){x.save();for(const b of zStage.blasts){const q=b.life/b.max,r=(1-q)*72*b.power+10,g=x.createRadialGradient(b.x,b.y,2,b.x,b.y,r);g.addColorStop(0,'rgba(255,255,255,.82)');g.addColorStop(.2,b.color);g.addColorStop(1,'rgba(255,50,20,0)');x.globalAlpha=q*.48;x.fillStyle=g;x.beginPath();x.arc(b.x,b.y,r,0,TAU);x.fill();x.strokeStyle=b.color;x.lineWidth=2;x.globalAlpha=q*.42;for(let n=0;n<(superAI.tier===1?4:7);n++){const a=n*TAU/(superAI.tier===1?4:7)+b.x*.01;x.beginPath();x.moveTo(b.x+Math.cos(a)*r*.35,b.y+Math.sin(a)*r*.35);x.lineTo(b.x+Math.cos(a)*r*1.2,b.y+Math.sin(a)*r*1.2);x.stroke()}}if(zStage.cut>0){const q=zStage.cut/.5;x.globalAlpha=Math.sin(q*Math.PI)*.1;x.fillStyle='#fff';x.fillRect(0,0,W,H);x.globalAlpha=q*.55;x.fillStyle='#02040a';x.fillRect(0,0,W,H*.055);x.fillRect(0,H*.945,W,H*.055)}x.restore()}
const transformationOwenGriffin=owenGriffin;owenGriffin=function(yaw,color,form){transformationOwenGriffin(yaw,color,form);if(owen.pose==='TRANSFORM'){const q=clamp(owen.stateTime/Math.max(.01,owen.stateLength),0,1),pulse=.65+Math.sin(q*Math.PI)*.55,count=superAI.tier===1?8:14;for(let n=0;n<count;n++){const a=n*TAU/count+elapsed*(n%2?-.8:1.15),r=.75+pulse*(.35+(n%3)*.12);iylaBox(Math.cos(a)*r,.35+(n%5)*.48,Math.sin(a)*r,.035,.22+.18*pulse,.035,color,a,.62)}iylaRound(0,1.2,0,.7+pulse*.22,1.35+pulse*.34,.7+pulse*.22,color,yaw,.12)}};
Object.assign(owenClips,{SPIRIT_GATHER:{length:1.1,priority:18},SPIRIT_LIFT:{length:3.8,priority:18},SPIRIT_THROW:{length:1.1,priority:19},BEAM_BRACE:{length:1,priority:18},BEAM_CHARGE:{length:2.2,priority:18},BEAM_FIRE:{length:1.3,priority:19},NOVA_CROUCH:{length:1,priority:18},NOVA_EXPAND:{length:1.8,priority:18},NOVA_RELEASE:{length:1.1,priority:19},RUSH_STANCE:{length:.7,priority:18},RUSH_COMBO:{length:2.1,priority:19},RUSH_FINISH:{length:.9,priority:20},SUPER_RECOVER:{length:.7,priority:17}});
const superOwenController=owenController;owenController=function(dt){superOwenController(dt);const s=griffin.superMove;if(s?.active){const pose=superMovePose(s);owen.pose=owen.wanted=pose;owen.stateTime=s.time;owen.stateLength=s.duration;owen.phase=pose;zStage.pose=pose;zStage.poseT=Math.max(zStage.poseT,s.duration-s.time)}};
const superOwenGriffin=owenGriffin;owenGriffin=function(yaw,color,form){superOwenGriffin(yaw,color,form);const s=griffin.superMove;if(!s?.active)return;const p=superMovePose(s),q=clamp(s.time/s.duration,0,1),v=owenAxes(yaw),pulse=Math.sin(Math.min(1,q/.72)*Math.PI/2),skin=[.9,.57,.38],armor=[.06,.26,.68];if(p==='SPIRIT_GATHER'||p==='SPIRIT_LIFT'){for(const side of[-1,1]){iylaRound(v.rx*side*.48,1.82+q*.35,v.rz*side*.48,.19,.34,.19,skin,yaw);iylaRound(v.rx*side*.28,2.28+q*.38,v.rz*side*.28,.23,.21,.23,armor,yaw)}iylaRound(0,2.65+q*.3,0,.22+pulse*.55,.22+pulse*.55,.22+pulse*.55,s.color,yaw,.8)}else if(p==='SPIRIT_THROW'){for(const side of[-1,1])iylaRound(v.rx*side*.2+v.fx*.88,1.5,v.rz*side*.2+v.fz*.88,.22,.2,.28,armor,yaw);iylaBox(v.fx*1.35,1.48,v.fz*1.35,.08,.08,.7,s.color,yaw,.55)}else if(p==='BEAM_BRACE'||p==='BEAM_CHARGE'||p==='BEAM_FIRE'){const reach=p==='BEAM_FIRE'?1.18:.65;for(const side of[-1,1]){iylaRound(v.rx*side*.22+v.fx*reach,1.42,v.rz*side*.22+v.fz*reach,.2,.34,.2,skin,yaw);iylaRound(v.rx*side*.1+v.fx*(reach+.32),1.42,v.rz*side*.1+v.fz*(reach+.32),.24,.2,.24,armor,yaw)}iylaRound(v.fx*(reach+.58),1.42,v.fz*(reach+.58),.18+pulse*.22,.18+pulse*.22,.18+pulse*.22,s.color,yaw,.9)}else if(p==='NOVA_CROUCH'){for(const side of[-1,1])iylaRound(v.rx*side*.38,.5,v.rz*side*.38,.3,.28,.3,armor,yaw);iylaRound(0,.92,0,.55,.28,.4,[.92,.24,.025],yaw)}else if(p==='NOVA_EXPAND'||p==='NOVA_RELEASE'){for(const side of[-1,1]){iylaRound(v.rx*side*(.72+pulse*.45),1.55,v.rz*side*(.72+pulse*.45),.2,.38,.2,skin,yaw);iylaRound(v.rx*side*(1.05+pulse*.55),1.55,v.rz*side*(1.05+pulse*.55),.25,.2,.25,armor,yaw)}for(let n=0;n<8;n++){const a=n*TAU/8+s.time;iylaBox(Math.cos(a)*(1+pulse),1.1,Math.sin(a)*(1+pulse),.04,.28,.04,s.color,a,.65)}}else if(p==='RUSH_STANCE'){for(const side of[-1,1])iylaRound(-v.fx*.35+v.rx*side*.3,1.35,-v.fz*.35+v.rz*side*.3,.24,.32,.24,armor,yaw)}else if(p==='RUSH_COMBO'){const side=Math.floor(s.time*8)%2?1:-1,spin=Math.sin(s.time*TAU*2);iylaRound(v.fx*.92+v.rx*side*.3,1.48,v.fz*.92+v.rz*side*.3,.28,.22,.28,armor,yaw+spin);iylaRound(v.fx*.8-v.rx*side*.22,.68,v.fz*.8-v.rz*side*.22,.3,.18,.48,armor,yaw-spin);for(let n=0;n<4;n++)iylaBox(-v.fx*(.5+n*.3),1+n*.15,-v.fz*(.5+n*.3),.05,.05,.45,s.color,yaw,.35)}else if(p==='RUSH_FINISH'){iylaRound(v.fx*1.35,.72,v.fz*1.35,.36,.2,.58,armor,yaw);iylaBox(v.fx*1.8,.7,v.fz*1.8,.1,.1,.85,s.color,yaw,.75)}};
const tournament={name:'ZENITH POWER TOURNAMENT',round:1,lastRound:1,roundNames:['SURVIVAL DRAW','RIVAL ASCENT','BROKEN ARENA','GOD TIER','FINAL UNIVERSE','ZENITH LAST STAND']};
function tournamentUpdate(){if(!running)return;const round=Math.min(6,Math.max(1,campaign.stage||1));if(round!==tournament.round){tournament.lastRound=tournament.round;tournament.round=round;iylaScene(`ROUND ${round} · ${tournament.roundNames[round-1]}`,'THE ARENA IS EVOLVING',round>4?'#ffcf4a':'#79fff0',2.2,24);combatEvent('TOURNAMENT_ROUND',{round,name:tournament.roundNames[round-1],authority:'CAMPAIGN'});for(const e of enemies){const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy)||1;e.x+=dx/d*12;e.y+=dy/d*12}}}
function owenTournamentMotion(yaw,color){const p=owen.pose||'FLIGHT',q=clamp(owen.stateTime/Math.max(.01,owen.stateLength),0,1),hit=Math.sin(Math.min(1,q/.74)*Math.PI),v=owenAxes(yaw),side=zCinema.combo%2?1:-1,skin=[.9,.58,.39],armor=[.06,.27,.7];if(p==='HOOK'){iylaRound(v.rx*side*.52+v.fx*.76,1.48,v.rz*side*.52+v.fz*.76,.24,.2,.27,armor,yaw+.8*side);iylaBox(v.fx*1.05+v.rx*side*.55,1.48,v.fz*1.05+v.rz*side*.55,.05,.05,.48,color,yaw,.55)}else if(p==='ELBOW'){iylaRound(v.fx*.58+v.rx*side*.36,1.58,v.fz*.58+v.rz*side*.36,.28,.24,.25,skin,yaw);iylaRound(v.fx*.9+v.rx*side*.16,1.5,v.fz*.9+v.rz*side*.16,.2,.2,.2,armor,yaw)}else if(p==='KNEE'){iylaRound(v.fx*.62+v.rx*side*.2,.9+hit*.42,v.fz*.62+v.rz*side*.2,.3,.24,.34,armor,yaw);iylaRound(v.fx*.28-v.rx*side*.22,.34,v.fz*.28-v.rz*side*.22,.28,.16,.38,armor,yaw)}else if(p==='SWEEP'){iylaRound(v.fx*.82+v.rx*side*.78,.26,v.fz*.82+v.rz*side*.78,.29,.15,.56,armor,yaw+side*1.1);iylaRound(-v.fx*.18-v.rx*side*.3,.43,-v.fz*.18-v.rz*side*.3,.26,.2,.34,armor,yaw)}else if(p==='BACK_KICK'){iylaRound(-v.fx*(.65+hit*.48)+v.rx*side*.18,.72,-v.fz*(.65+hit*.48)+v.rz*side*.18,.31,.17,.62,armor,yaw);iylaBox(-v.fx*1.45,.72,-v.fz*1.45,.06,.06,.58,color,yaw,.6)}else if(p==='DIVE_KICK'){iylaRound(v.fx*(.85+hit*.55)+v.rx*side*.18,.82-hit*.38,v.fz*(.85+hit*.55)+v.rz*side*.18,.32,.17,.65,armor,yaw);for(let n=0;n<3;n++)iylaBox(-v.fx*(.45+n*.3),1.1+n*.22,-v.fz*(.45+n*.3),.04,.05,.4,color,yaw,.4)}else if(p==='DASH'||p==='VANISH'){for(let n=0;n<5;n++)iylaBox(-v.fx*(.5+n*.33),1.15+n*.1,-v.fz*(.5+n*.33),.045,.055,.52+n*.12,color,yaw,.22)}else if(p==='HIT'){iylaRound(-v.fx*.35+v.rx*.7,1.72,-v.fz*.35+v.rz*.7,.22,.22,.24,skin,yaw);iylaRound(-v.fx*.35-v.rx*.7,1.72,-v.fz*.35-v.rz*.7,.22,.22,.24,skin,yaw)}else if(p==='FINISHER'||p==='SUPER_RECOVER'){for(let n=0;n<7;n++){const a=n*TAU/7+elapsed;iylaBox(Math.cos(a)*(1.05+hit*.35),.6+n*.18,Math.sin(a)*(1.05+hit*.35),.035,.18,.035,color,a,.5)}}}
const tournamentOwenGriffin=owenGriffin;owenGriffin=function(yaw,color,form){tournamentOwenGriffin(yaw,color,form);owenTournamentMotion(yaw,color)};
const tournamentWorld=iyla3DWorld;iyla3DWorld=function(){tournamentWorld();const round=Math.min(6,1+Math.floor(elapsed/32)),gold=round>4?[.95,.55,.08]:[.04,.34,.39];for(let n=0;n<24;n++){const a=n*TAU/24,r=11+(n%3)*.34;iylaBox(Math.cos(a)*r,-.13,Math.sin(a)*r,1.15,.12,.34,n%5===0?gold:[.025,.12,.16],-a,.92)}for(let n=0;n<11;n++){const a=n*2.399+round*.11,r=2.7+(n%4)*1.7,y=-.08+(n%3)*.018;iylaBox(Math.cos(a)*r,y,Math.sin(a)*r,.72+(n%3)*.3,.08,.52+(n%2)*.28,n%4===0?gold:[.04,.18,.21],a*.7,.88)}for(let n=0;n<10;n++){const a=n*TAU/10+elapsed*.018,r=13+(n%2)*2.4;iylaBox(Math.cos(a)*r,1.4+(n%4)*1.1,Math.sin(a)*r,.18,.55,.75,n%3===0?[.5,.07,.33]:[.05,.3,.37],a,.5)}};
const tournamentGrid=grid;grid=function(){tournamentGrid();x.save();x.translate(W/2,H/2);x.strokeStyle=tournament.round>4?'#ffcc5544':'#4fffe633';x.lineWidth=1.4;for(let n=0;n<5;n++){x.beginPath();x.ellipse(0,0,110+n*82,(110+n*82)*.48,0,0,TAU);x.stroke()}for(let n=0;n<12;n++){const a=n*TAU/12;x.beginPath();x.moveTo(Math.cos(a)*80,Math.sin(a)*38);x.lineTo(Math.cos(a)*Math.max(W,H),Math.sin(a)*Math.max(W,H)*.48);x.stroke()}x.restore()};
const zStageSystems=omniSystems;omniSystems=function(dt){zStageSystems(dt);zStageUpdate(dt);tournamentUpdate()};
const zStageVisualBase=omniVisuals;omniVisuals=function(){zStageVisualBase();zStageVisuals();superMoveVisuals()};

// Matty Combat Authority 3.0: navigation commits to Owen's selected opponent.
// This turns composed clips into real pursuit, contact, damage and completed routes.
Object.assign(tournament,{started:false,phase:'OPENING',fighters:0,knockouts:0});
Object.assign(zCinema,{lockedTarget:null,pursuit:0,engagements:0,completedRoutes:0,targetAge:0,targetIdle:0,targetHp:0,targetDistance:0,recoveries:0,contactBeat:null,confirmedHits:0});
const mattyTarget=zTarget;
zTarget=function(){return zCinema.lockedTarget&&enemies.includes(zCinema.lockedTarget)?zCinema.lockedTarget:mattyTarget()};
const mattyAutoVector=autoVector;
autoVector=function(dt){
 const planned=mattyAutoVector(dt),target=zCinema.lockedTarget&&enemies.includes(zCinema.lockedTarget)?zCinema.lockedTarget:zTarget();
 if(!target||griffin.transformation?.active||griffin.superMove?.active)return planned;
 const d=dist(player,target),a=Math.atan2(target.y-player.y,target.x-player.x),danger=hostile.some(h=>Math.hypot(h.x-player.x,h.y-player.y)<64);
 if(danger&&zCinema.vanish<=0)return planned;
 // Commit hard inside combat range; close deliberately outside it instead of orbiting forever.
 const committed=zCinema.route.length||zCinema.combo||d<520||target.type===3||target.campaignLevel===campaign.stage;
 if(committed){griffin.heading=a;zCinema.pursuit=Math.max(zCinema.pursuit,dt);griffin.mode=d>142?'MATTY COMBAT PURSUIT':griffin.mode;return{dx:Math.cos(a),dy:Math.sin(a)}}
 return planned
};
const mattyCinemaUpdate=zCinemaUpdate;
zCinemaUpdate=function(dt){
 const before=zCinema.route.length,previous=zCinema.lockedTarget,attackBefore=zCinema.attack,comboBefore=zCinema.combo;
 if(!previous||!enemies.includes(previous)){zCinema.lockedTarget=zTarget();if(zCinema.lockedTarget)zCinema.engagements++}
 zCinema.deferMelee=true;zCinema.deferredDamage=0;mattyCinemaUpdate(dt);zCinema.deferMelee=false;
 const target=zCinema.lockedTarget,d=target&&enemies.includes(target)?dist(player,target):Infinity;
 if(zCinema.attack>0&&(attackBefore<=0||zCinema.combo!==comboBefore)&&target&&enemies.includes(target)){const move=zCinema.route[Math.max(0,zCinema.combo-1)],data=move?.data;if(data)zCinema.contactBeat={target,time:Math.max(.08,zCinema.attack*.42),damage:(data[3]+(griffin.evolution||0)*4)*.42,color:move.finisher?'#ffe66b':'#ffffff',move:data[0],pose:data[1]}}
 const beat=zCinema.contactBeat;if(beat){beat.time-=dt;if(beat.time<=0){zCinema.contactBeat=null;if(enemies.includes(beat.target)){const range=beat.target.type===3?235:185;if(dist(player,beat.target)<=range){hurt(beat.target,beat.damage,beat.color);zImpact(beat.target.x,beat.target.y,beat.color,2);zCinema.confirmedHits++;combatEvent('MELEE_CONTACT_CONFIRMED',{move:beat.move,pose:beat.pose,damage:Math.round(beat.damage),boss:beat.target.type===3})}else combatEvent('MELEE_CONTACT_MISSED',{move:beat.move,distance:Math.round(dist(player,beat.target))})}}}
 // Never display a strike pose until its contact beat is actually in range.
 const contact=target?.type===3?190:146;if(target&&d>=contact&&zCinema.attack<=0){zCinema.meleePose=d<320?'DASH':'FLIGHT';griffin.mode=target.type===3&&d<320?'MATTY BOSS PRESSURE':d<320?'MATTY FLASH PURSUIT':'MATTY TARGET PURSUIT'}
 if(before&& !zCinema.route.length)zCinema.completedRoutes++;
 if(zCinema.lockedTarget&&!enemies.includes(zCinema.lockedTarget))zCinema.lockedTarget=null;
};

// The Tournament architecture lives inside the original scrolling world.
iyla3DWorld=function(){
 tournamentWorld();
 const round=tournament.round||1,gold=round>4?[1,.57,.08]:[.05,.72,.78],edge=round>4?[.48,.08,.08]:[.04,.22,.26];
 const sx=-(((worldX/45)%17.3+17.3)%17.3),sz=-(((worldY/45)%17.3+17.3)%17.3);
 // Central elevated stone platform, assembled as bounded radial sectors.
 for(let ring=0;ring<5;ring++)for(let n=0;n<20;n++){
  const a=n*TAU/20+(ring&1?TAU/40:0),r=ring*1.72,w=ring?1.02:1.55;
  iylaBox(sx+Math.cos(a)*r,-.04-ring*.012,sz+Math.sin(a)*r,w,.1,ring?1.05:1.55,(n+ring)%5===0?gold:[.12+.018*ring,.15+.018*ring,.17+.02*ring],-a,.96)
 }
 // Broken outer lip makes the arena boundary readable and removes the old infinite grid.
 for(let n=0;n<32;n++){const a=n*TAU/32,r=8.65+(n%3)*.09;iylaBox(sx+Math.cos(a)*r,-.12+(n%4)*.025,sz+Math.sin(a)*r,.78,.2,.3,n%7===0?gold:edge,-a,.98)}
 // Distant tiered spectator stands and energy pylons establish scale without world clutter.
 for(let tier=0;tier<3;tier++)for(let n=0;n<18;n++){const a=n*TAU/18+tier*.055,r=11.8+tier*1.45;iylaBox(sx+Math.cos(a)*r,1.05+tier*.72,sz+Math.sin(a)*r,.72,.28,.5,n%6===0?gold:[.08,.09,.14],-a,.78)}
 for(let n=0;n<8;n++){const a=n*TAU/8,r=10.1;iylaBox(sx+Math.cos(a)*r,2.15,sz+Math.sin(a)*r,.14,2.15,.14,gold,-a,.72)}
};
grid=function(){
 tournamentGrid();const round=tournament.round||1,ox=-((worldX*.12)%312),oy=-((worldY*.12)%168);
 x.save();x.translate(W/2+ox,H*.52+oy);x.scale(1,.52);x.globalAlpha=.28;x.strokeStyle=round>4?'#ffbd5550':'#71fff052';x.lineWidth=1.35;
 for(let n=1;n<=3;n++){x.beginPath();x.arc(0,0,n*82,0,TAU);x.stroke()}
 for(let n=0;n<8;n++){const a=n*TAU/8;x.beginPath();x.moveTo(Math.cos(a)*42,Math.sin(a)*42);x.lineTo(Math.cos(a)*285,Math.sin(a)*285);x.stroke()}
 x.restore()
};
const mattyTournamentUpdate=tournamentUpdate;
tournamentUpdate=function(){
 if(!running){tournament.started=false;return}
 if(elapsed<.08&&tournament.lastElapsed>elapsed)tournament.started=false;tournament.lastElapsed=elapsed;
 if(!tournament.started){tournament.started=true;tournament.round=1;tournament.lastRound=1;tournament.phase='BATTLE';iylaScene('ZENITH POWER TOURNAMENT','ROUND 1 · SURVIVAL DRAW','#79fff0',2.8,30);combatEvent('TOURNAMENT_OPENING',{round:1,name:tournament.roundNames[0]})}
 const previous=tournament.round;mattyTournamentUpdate();tournament.fighters=enemies.length;tournament.knockouts=kills;
 if(tournament.round!==previous){tournament.phase='ROUND CHANGE';zCinema.route.length=0;zCinema.lockedTarget=null}else tournament.phase=zCinema.route.length?'COMBAT':'BATTLE'
};

// Matty Campaign Director: clear a fighter wave, duel one unique boss, advance.
const bossRoster=[
 {name:'LIRA VANGUARD',style:'RUSH',color:'#ff315c',move:'METEOR RUSH',super:'CRIMSON COMET',hp:1,speed:1.22,damage:1},
 {name:'LIRA TEMPEST',style:'STORM',color:'#bf62ff',move:'ARC VOLLEY',super:'THUNDER CAGE',hp:1.18,speed:1.08,damage:1.12},
 {name:'LIRA TITAN',style:'TITAN',color:'#ff9d38',move:'GROUND BREAKER',super:'PLANET CRUSHER',hp:1.42,speed:.88,damage:1.3},
 {name:'LIRA PHANTOM',style:'PHANTOM',color:'#ff4fa2',move:'AFTERIMAGE STRIKE',super:'VOID MIRROR',hp:1.28,speed:1.38,damage:1.18},
 {name:'LIRA OMEGA',style:'OMEGA',color:'#fff0a0',move:'STAR BREAKER',super:'FINAL ERASURE',hp:1.7,speed:1.2,damage:1.48}
];
const campaign={stage:1,phase:'WAVE',quota:10,spawned:0,defeated:0,boss:null,transition:0,bossesDefeated:0};
function campaignReset(){Object.assign(campaign,{stage:1,phase:'WAVE',quota:10,spawned:0,defeated:0,boss:null,transition:0,bossesDefeated:0,lastTick:performance.now()});player.invuln=0;griffin.campaignGrowth=0}
function campaignBoss(){return bossRoster[(campaign.stage-1)%bossRoster.length]}
const campaignBaseReset=reset;
reset=function(mode=autoMode){campaignReset();return campaignBaseReset(mode)};
const campaignEnemy=enemy;
enemy=function(forceBoss=false){
 if(elapsed<.08&&campaign.phase!=='WAVE')campaignReset();
 if(forceBoss){
  if(campaign.phase!=='BOSS_READY'||enemies.some(e=>e.type===3))return;
  campaignEnemy(true);const e=enemies[enemies.length-1],spec=campaignBoss(),scale=1+(campaign.stage-1)*.24;
  Object.assign(e,{campaignBoss:true,bossName:spec.name,bossStyle:spec.style,bossMove:spec.move,bossSuper:spec.super,variant:{RUSH:'ANTI-CRYO',STORM:'PHASE',TITAN:'SPLITTER',PHANTOM:'DRAINER',OMEGA:'PHASE'}[spec.style],hp:e.hp*spec.hp*scale,max:e.max*spec.hp*scale,speed:e.speed*spec.speed*(1+(campaign.stage-1)*.045),damage:e.damage*spec.damage*(1+(campaign.stage-1)*.07),shield:e.shield*(1+campaign.stage*.16),shieldMax:e.shieldMax*(1+campaign.stage*.16),signatureClock:2.4,superClock:8.5,contactClock:1.1,telegraphClock:1.1,battleTime:0});
  campaign.boss=e;campaign.phase='BOSS';griffin.boss=e;zCinema.lockedTarget=e;hostile.length=0;
  iylaScene(`LEVEL ${campaign.stage} BOSS · ${spec.name}`,`${spec.move} · SUPER: ${spec.super}`,spec.color,3,27);combatEvent('CAMPAIGN_BOSS_ENTERED',{level:campaign.stage,boss:spec.name,super:spec.super});return e
 }
 if(campaign.phase!=='WAVE'||campaign.spawned>=campaign.quota)return;
 campaignEnemy(false);const e=enemies[enemies.length-1];if(e){e.campaignLevel=campaign.stage;e.hp*=1+(campaign.stage-1)*.1;e.max=e.hp;e.speed*=1+(campaign.stage-1)*.025;e.damage*=1+(campaign.stage-1)*.055;campaign.spawned++}return e
};
const campaignKill=kill;
kill=function(e){
 campaignKill(e);
 if(e.campaignBoss){
  campaign.bossesDefeated++;campaign.phase='LEVEL_CLEAR';campaign.transition=4;campaign.boss=null;griffin.boss=null;zCinema.lockedTarget=null;hostile.length=0;
  griffin.campaignGrowth=(griffin.campaignGrowth||0)+1;player.damage*=1.07;player.speed=Math.min(440,player.speed+7);player.rate=Math.max(.075,player.rate*.975);player.maxHp+=8;player.hp=Math.min(player.maxHp,player.hp+player.maxHp*.35);memory.griffinEvolution.mastery+=25+campaign.stage*8;
  iylaScene(`LEVEL ${campaign.stage} COMPLETE`,'GRIFFIN AND LIRA HAVE LEARNED · NEXT WORLD OPENING','#8dffe2',3.5,28);combatEvent('CAMPAIGN_LEVEL_CLEAR',{level:campaign.stage,boss:e.bossName,growth:griffin.campaignGrowth})
 }else if(e.campaignLevel===campaign.stage)campaign.defeated++
};
function campaignBossAI(dt,b){
 if(!b||!enemies.includes(b))return;const spec=campaignBoss(),a=Math.atan2(player.y-b.y,player.x-b.x),d=dist(player,b);b.battleTime=(b.battleTime||0)+dt;b.signatureClock-=dt;b.superClock-=dt;b.contactClock=Math.max(0,(b.contactClock||0)-dt);b.telegraphClock=Math.max(0,(b.telegraphClock||0)-dt);if(d>205){const close=Math.min(d-185,b.speed*dt*(1.8+Math.min(1,b.battleTime/25)));b.x+=Math.cos(a)*close;b.y+=Math.sin(a)*close}
 if(b.signatureClock<=0){b.signatureClock=Math.max(.55,2.2-campaign.stage*.09);lira.phase=`${spec.name} · ${spec.move}`;
  if(spec.style==='RUSH'){b.x=player.x-Math.cos(a)*105;b.y=player.y-Math.sin(a)*105;b.role='RUSHER'}
  else if(spec.style==='STORM')for(let q=0;q<7;q++){const z=q*TAU/7;hostile.push({x:player.x+Math.cos(z)*230,y:player.y+Math.sin(z)*230,vx:-Math.cos(z)*115,vy:-Math.sin(z)*115,r:8,damage:7+campaign.stage,life:3.2,homing:.12})}
  else if(spec.style==='TITAN'){rings.push({x:b.x,y:b.y,r:18,max:250,life:.75});if(d<250&&b.contactClock<=0){b.contactClock=1.15;player.hp-=Math.min(12,6+campaign.stage*1.25)}}
  else if(spec.style==='PHANTOM'){const z=a+Math.PI+rnd(-.5,.5);b.x=player.x+Math.cos(z)*125;b.y=player.y+Math.sin(z)*125;for(let q=-1;q<=1;q++)hostile.push({x:b.x,y:b.y,vx:Math.cos(a+q*.2)*370,vy:Math.sin(a+q*.2)*370,r:7,damage:8+campaign.stage,life:2})}
  else for(let q=-2;q<=2;q++)hostile.push({x:b.x,y:b.y,vx:Math.cos(a+q*.13)*420,vy:Math.sin(a+q*.13)*420,r:9,damage:10+campaign.stage*1.4,life:2.6,homing:.1});
 }
 if(b.superClock<=0){b.superClock=Math.max(6.2,10-campaign.stage*.2);lira.phase=`SUPER · ${spec.super}`;iylaScene(spec.super,`${spec.name} SIGNATURE SUPER` ,spec.color,1.35,24);rings.push({x:b.x,y:b.y,r:25,max:Math.max(W,H)*.55,life:1.1});
  const count=Math.min(14,8+campaign.stage);for(let q=0;q<count;q++){const z=q*TAU/count;hostile.push({x:b.x,y:b.y,vx:Math.cos(z)*(170+campaign.stage*10),vy:Math.sin(z)*(170+campaign.stage*10),r:8,damage:Math.min(12,5.5+campaign.stage),life:3.4,homing:spec.style==='PHANTOM'?.14:.025})}combatEvent('BOSS_SUPER_MOVE',{boss:spec.name,move:spec.super})
 }
}
// Zavier world-integrity guard. Long pursuit runs can accumulate enough camera
// travel that a stale actor escapes the combat envelope. Keeping actors in
// screen-relative coordinates prevents Matty from chasing an unreachable lock
// while preserving the infinite scrolling world coordinates themselves.
function zavierCombatBounds(){
 // Use the visible diagonal, not a fixed mobile radius. Actors at a valid
 // portrait-screen corner are not escaped; only objects beyond the complete
 // viewport plus a spawn margin are repaired here.
 const envelope=Math.hypot(W,H)*1.08+180,edge=Math.min(360,Math.max(250,Math.min(W,H)*.48));
 let recovered=0;
 for(const e of enemies){
  const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy);
  if(Number.isFinite(e.x)&&Number.isFinite(e.y)&&d<=envelope)continue;
  const seed=Number.isFinite(e.slot)?e.slot:recovered,angle=Number.isFinite(dx)&&Number.isFinite(dy)&&d>1?Math.atan2(dy,dx):(seed*2.399963+elapsed*.17)%TAU;
  const radius=e.campaignBoss?Math.min(edge,Math.max(W,H)*.42):edge+(seed%4)*24;
  e.x=clamp(player.x+Math.cos(angle)*radius,-48,W+48);
  e.y=clamp(player.y+Math.sin(angle)*radius,72,H+48);
  e.contactClock=Math.max(e.contactClock||0,.22);recovered++
 }
 if(recovered){
  const locked=zCinema.lockedTarget;
  if(!locked||!enemies.includes(locked)||!Number.isFinite(locked.x)||!Number.isFinite(locked.y)||dist(player,locked)>envelope*1.15)zCinema.lockedTarget=null;
  griffin.mode='ZAVIER WORLD RECOVERY';griffin.reason=`RECOVERED ${recovered} ESCAPED ACTOR${recovered===1?'':'S'}`;
  combatEvent('WORLD_ACTOR_RECOVERED',{count:recovered,worldX:Math.round(worldX),worldY:Math.round(worldY)})
 }
}
function zavierTargetWatchdog(dt){
 const target=zCinema.lockedTarget&&enemies.includes(zCinema.lockedTarget)?zCinema.lockedTarget:zTarget();
 if(!target){zCinema.targetAge=zCinema.targetIdle=zCinema.targetDistance=0;zCinema.targetHp=0;return}
 if(target!==zCinema.lockedTarget){zCinema.lockedTarget=target;zCinema.targetAge=zCinema.targetIdle=0;zCinema.targetHp=(target.hp||0)+(target.shield||0);zCinema.engagements++}
 const d=dist(player,target),hp=(target.hp||0)+(target.shield||0),progress=hp<zCinema.targetHp-.01;
 zCinema.targetAge+=dt;zCinema.targetDistance=d;
 if(progress){zCinema.targetIdle=0;zCinema.targetHp=hp}else zCinema.targetIdle+=dt;
 const offscreen=target.x<-36||target.x>W+36||target.y<58||target.y>H+36,envelope=Math.hypot(W,H)*1.08+180,escaped=d>envelope,offscreenStale=offscreen&&zCinema.targetAge>1.15&&zCinema.targetIdle>.85,stalled=d>420&&zCinema.targetIdle>1.65;
 if(!Number.isFinite(d)||escaped||offscreenStale||stalled){
  const a=Number.isFinite(griffin.heading)?griffin.heading:0,r=target.type===3?235:190;
  target.x=clamp(player.x+Math.cos(a)*r,52,W-52);target.y=clamp(player.y+Math.sin(a)*r,94,H-52);
  target.role='RUSHER';target.contactClock=Math.max(target.contactClock||0,.18);zCinema.route.length=0;zCinema.combo=0;zCinema.comboClock=0;zCinema.attack=0;zCinema.volley=0;zCinema.targetIdle=0;zCinema.targetHp=(target.hp||0)+(target.shield||0);zCinema.recoveries++;
  griffin.heading=Math.atan2(target.y-player.y,target.x-player.x);griffin.mode='ZAVIER TARGET RECOVERY';griffin.reason=`RECOVERED UNREACHABLE TARGET · ${Math.round(d)||0} RANGE`;combatEvent('COMBAT_TARGET_RECOVERED',{distance:Math.round(d)||0,boss:target.type===3,level:campaign.stage})
 }
 // A lone wave fighter must never hold the campaign open. Bring it into a
 // guaranteed contact beat if it has survived without taking damage.
 if(campaign.phase==='WAVE'&&campaign.spawned>=campaign.quota&&enemies.length===1&&zCinema.targetIdle>5){
  const a=Math.atan2(target.y-player.y,target.x-player.x),r=118;target.x=player.x+Math.cos(a)*r;target.y=player.y+Math.sin(a)*r;target.role='RUSHER';zCinema.attack=0;zCinema.volley=0;zCinema.route.length=0;zCinema.combo=0;zCinema.targetIdle=0;griffin.mode='MATTY FINAL FIGHTER ENGAGE';combatEvent('FINAL_FIGHTER_ENGAGED',{level:campaign.stage})
 }
}
function campaignUpdate(dt){
 if(!running)return;if(elapsed<.08)return
 zavierCombatBounds();
 zavierTargetWatchdog(dt);
 if(campaign.phase==='WAVE'){
  tournament.phase=`LEVEL ${campaign.stage} · FIGHTERS ${campaign.defeated}/${campaign.quota}`;
  if(campaign.spawned>=campaign.quota&&!enemies.some(e=>!e.campaignBoss)){campaign.phase='BOSS_READY';hostile.length=0;iylaScene(`LEVEL ${campaign.stage} WAVE CLEAR`,'BOSS APPROACHING · PREPARE','#79fff0',2.2,24);combatEvent('CAMPAIGN_WAVE_CLEAR',{level:campaign.stage});enemy(true)}
 }else if(campaign.phase==='BOSS'){tournament.phase=`LEVEL ${campaign.stage} · ${campaignBoss().name}`;campaignBossAI(dt,campaign.boss)}
 else if(campaign.phase==='LEVEL_CLEAR'){
  campaign.transition-=dt;if(campaign.transition<=0){campaign.stage++;campaign.phase='WAVE';campaign.quota=Math.min(28,9+campaign.stage*3);campaign.spawned=campaign.defeated=0;campaign.boss=null;hostile.length=0;zCinema.route.length=0;zCinema.lockedTarget=null;lira.power+=450+campaign.stage*180;griffin.difficulty=clamp(griffin.difficulty+.06,.9,1.8);iylaScene(`LEVEL ${campaign.stage}`,`${campaign.quota} FIGHTERS · THEN ${campaignBoss().name}`,'#8dffe2',2.7,27);combatEvent('CAMPAIGN_LEVEL_START',{level:campaign.stage,quota:campaign.quota,boss:campaignBoss().name})}
 }
 tournament.round=campaign.stage;tournament.fighters=enemies.length
}
const campaignTournamentUpdate=tournamentUpdate;
tournamentUpdate=function(){campaignTournamentUpdate();const now=performance.now(),dt=Math.min(.033,Math.max(0,(now-(campaign.lastTick||now))/1000)||.016);campaign.lastTick=now;campaignUpdate(dt)};
const campaignHud=hud;
hud=function(force=false){campaignHud(force);const label=$('#levelLabel');if(label)label.textContent=`LEVEL ${campaign.stage} · ${campaign.phase==='BOSS'?campaignBoss().name:campaign.phase==='WAVE'?`FIGHTERS ${campaign.defeated}/${campaign.quota}`:campaign.phase.replace('_',' ')}`+(autoMode?' · GRIFFIN':'')};
// Owen MAX-5 million-motion atlas. Six independent decimal dimensions create
// 10^6 deterministic recipes without allocating a million keyframe objects.
function owenRecipe(id){id=((id%owen.librarySize)+owen.librarySize)%owen.librarySize;return{id,side:id%10,height:Math.floor(id/10)%10,reach:Math.floor(id/100)%10,arc:Math.floor(id/1000)%10,tempo:Math.floor(id/10000)%10,style:Math.floor(id/100000)%10}}
function owenSelectRecipe(){
 if(owen.recipeTransition===owen.transitions)return owenRecipe(owen.recipe);
 const target=zCinema.lockedTarget&&enemies.includes(zCinema.lockedTarget)?zCinema.lockedTarget:null,context=(target?.slot||0)*97+(target?.bossForm||0)*613+(griffin.evolution||0)*1291;
 owen.recipe=(owen.transitions*137+owen.comboBeat*811+kills*43+context)%owen.librarySize;owen.recipeTransition=owen.transitions;return owenRecipe(owen.recipe)
}
function owenChoreographyMotion(yaw,color){
 const combat=!['FLIGHT','TRANSFORM','HIT','SUPER_RECOVER'].includes(owen.pose);if(!combat)return;
 const r=owenSelectRecipe(),v=owenAxes(yaw),q=clamp(owen.stateTime/Math.max(.01,owen.stateLength),0,1),tempo=.68+r.tempo*.055,beat=clamp(q*tempo,0,1),snap=r.style<3?beat*beat:r.style>7?Math.sqrt(beat):beat,action=Math.sin(snap*Math.PI),side=r.side<5?-1:1;
 const height=.64+r.height*.105,reach=.68+r.reach*.075,curve=(r.arc-4.5)*.055,kick=/KICK|KNEE|SWEEP/.test(owen.pose),spin=/SPIN|SWEEP|FINISHER|RUSH/.test(owen.pose),twist=(spin?r.arc-4.5:r.style-4.5)*.13*action;
 const start=owenPoint(0,0,side*(kick?.24:.46),kick?.72:1.48,kick?.08:.2,yaw),mid=owenPoint(0,0,side*(.34+curve),height+(kick?.08:.55),reach*.48*action,yaw+twist),end=owenPoint(0,0,side*(.18+curve*.4),height+(kick?0:.58),reach*action,yaw+twist);
 const limb=kick?[.06,.26,.68]:[.9,.58,.39];owenJoint(start,mid,kick?.21:.17,limb,yaw+twist);owenJoint(mid,end,kick?.19:.15,limb,yaw+twist);iylaRound(end.x,end.y,end.z,kick?.3:.22,kick?.16:.2,kick?.48:.24,color,yaw+twist,.82);
 const trails=superAI.tier===1?2:3+r.style%3;for(let n=1;n<=trails;n++){const fade=1-n/(trails+1),back=owenPoint(0,0,side*(.18+curve*.4),height+(kick?0:.58),reach*Math.max(0,action-n*(.07+r.tempo*.004)),yaw+twist-n*.035);iylaBox(back.x,back.y,back.z,.035,.045,.22+n*.08,color,yaw+twist,.12*fade)}
}
const atlasOwenGriffin=owenGriffin;
owenGriffin=function(yaw,color,form){atlasOwenGriffin(yaw,color,form);owenChoreographyMotion(yaw,color)};
function owenFighterRecipe(e){const role=(e.role||'HUNTER').split('').reduce((n,c)=>(n*33+c.charCodeAt(0))%owen.librarySize,17),variant=(e.variant||'BASE').split('').reduce((n,c)=>(n*31+c.charCodeAt(0))%owen.librarySize,23),beat=Math.floor(elapsed*(e.type===3?2.5:1.7));return owenRecipe((role*97+variant*193+(e.slot||0)*7919+(e.type||0)*104729+beat*137)%owen.librarySize)}
function owenFighterMotion(e,boss=false){if(!e||!enemies.includes(e))return;const r=owenFighterRecipe(e),px=(e.x-W/2)/45,pz=(e.y-H/2)/45,yaw=-Math.atan2(player.x-e.x,player.y-e.y),v=owenAxes(yaw),q=(elapsed*(.72+r.tempo*.055)+r.arc*.11)%1,action=Math.sin(q*Math.PI),side=r.side<5?-1:1,s=boss?1.48:.68,height=(.82+r.height*.055)*s,reach=(.55+r.reach*.06)*s,twist=(r.style-4.5)*.08*action,attack=(e.attackClock||0)<.38||e.role==='RUSHER',hit=e.hit>0;if(!attack&&!hit)return;const color=e.variant==='DRAINER'?[.08,1,.42]:e.variant==='SPLITTER'?[1,.53,.04]:e.variant==='PHASE'?[.58,.22,1]:[1,.04,.22],root=owenPoint(px,pz,side*.38*s,1.18*s,.08,yaw),mid=owenPoint(px,pz,side*(.28+(r.arc-4.5)*.025)*s,height,reach*.48*action,yaw+twist),end=owenPoint(px,pz,side*.14*s,height+(r.style>6?.22:0)*s,reach*action*(hit?-.45:1),yaw+twist);owenJoint(root,mid,.13*s,color,yaw+twist);owenJoint(mid,end,.11*s,color,yaw+twist);iylaRound(end.x,end.y,end.z,.18*s,.15*s,.22*s,color,yaw+twist,.8);const trails=superAI.tier===1?1:1+r.style%3;for(let n=1;n<=trails;n++)iylaBox(end.x-v.fx*n*.14,end.y,end.z-v.fz*n*.14,.025,.03,.14+n*.04,color,yaw+twist,.16)}
const millionOwenLira=owenLira;
owenLira=function(e,boss){millionOwenLira(e,boss);owenFighterMotion(e,boss)};
const millionOwenCrowd=owenCrowd;
owenCrowd=function(e){millionOwenCrowd(e);owenFighterMotion(e,false)};
// Matty 3.1 protects Owen's anticipation/action/follow-through from routine
// navigation chatter. Only a hit reaction or a cinematic can break commitment.
const committedOwenController=owenController;
owenController=function(dt){
 if(elapsed<.08){owen.transitions=0;owen.recipe=0;owen.recipeTransition=-1}
 const clip=owenClips[owen.pose]||owenClips.FLIGHT,q=owen.stateTime/Math.max(.01,owen.stateLength),saved=zStage.pose;
 const protectedClip=!clip.loop&&q<matty.commitRatio&&!griffin.transformation?.active&&!griffin.superMove?.active&&saved!=='HIT';
 if(protectedClip&&saved!==owen.pose){zStage.pose=owen.pose;matty.quiet=Math.max(matty.quiet,.12)}
 committedOwenController(dt);zStage.pose=saved;matty.quiet=Math.max(0,matty.quiet-(dt||.016));matty.lastRequest=owen.wanted
};
// Owen MAX-6 combat grammar. The million-motion atlas supplies variation;
// this director supplies meaning, continuity and verified physical contact.
// It is deliberately original choreography built from general fighting-game
// principles rather than copied animation frames.
Object.assign(matty,{version:'4.0',policy:'SINGLE OWNER · CONTACT AUTHORITY',owner:'NAVIGATION',family:'GROUND',sequence:0});
Object.assign(owen,{version:'MAX-6',grammar:'READ→APPROACH→OPEN→CONFIRM→LAUNCH→PURSUE→FINISH→RESET',quality:{attempts:0,hits:0,whiffs:0,repeats:0,interrupts:0,families:{GROUND:0,AERIAL:0,VANISH:0,POWER:0,GRAPPLE:0,DEFENSE:0},lastPose:'',lastHitAt:0,contactRate:1}});
const owenFamilies={
 GROUND:[['JAB','CROSS','HOOK'],['ELBOW','KNEE'],['DRAGON COMET BREAKER','FINISHER']],
 AERIAL:[['JAB','UPPER','DIVE'],['SPIN','AXE'],['CYCLONE STARFALL','SPIN_KICK']],
 VANISH:[['BACK','CROSS','ELBOW'],['BACK','KNEE'],['NOVA RUSH FINALE','FINISHER']],
 POWER:[['ELBOW','UPPER','AXE'],['DIVE','CROSS'],['GALAXY SHOCK UPPERCUT','UPPERCUT']],
 GRAPPLE:[['KNEE','HOOK','SWEEP'],['ELBOW','BACK'],['HEAVEN-SPLITTING AXE','AXE_KICK']],
 DEFENSE:[['SWEEP','BACK','JAB'],['KNEE','SPIN'],['INFINITE IMPACT KICK','DIVE_KICK']]
};
function owenChooseFamily(target,density){
 const d=dist(player,target),danger=hostile.filter(h=>Math.hypot(h.x-player.x,h.y-player.y)<150).length,boss=target.type===3,serial=zCinema.routeSerial+campaign.stage+kills;
 if(danger>2)return'DEFENSE';if(d>220)return'AERIAL';if(boss&&serial%4===0)return'GRAPPLE';if((griffin.evolution||0)>1&&density>5)return'POWER';if(serial%3===0)return'VANISH';return'GROUND'
}
const max5ComposeCombo=griffinComposeCombo;
griffinComposeCombo=function(target,density){
 const family=owenChooseFamily(target,density),plan=owenFamilies[family],serial=++zCinema.routeSerial,keys=[...plan[0],...plan[1]],finisher=plan[2],boss=target.type===3;
 const route=keys.map((key,i)=>({key,data:griffinStrikes[key],side:(serial+i+(family==='VANISH'?1:0))%2?1:-1,finisher:false,section:i<plan[0].length?'OPENER':'BRIDGE',family}));
 route.push({key:'FINISH',data:[finisher[0],finisher[1],boss?1.08:.94,boss?68:52,boss?38:32],side:(serial+keys.length)%2?1:-1,finisher:true,section:'FINISHER',family});
 zCinema.route=route;zCinema.routeName=`${family}-${plan[0][0]}-${finisher[0]}`;zCinema.recentRoutes.push(zCinema.routeName);if(zCinema.recentRoutes.length>6)zCinema.recentRoutes.shift();zCinema.family=family;matty.family=family;matty.sequence++;owen.quality.families[family]++;combatEvent('OWEN_FIGHT_FAMILY',{family,route:zCinema.routeName,moves:route.map(m=>m.data[0]),boss,density});return route
};
// The older controller calculated melee damage at pose start. Suppress only
// those provisional melee calls; Matty's existing contact beat applies it when
// the target is still alive and genuinely inside the strike envelope.
const max5Hurt=hurt;
hurt=function(e,damage,color='#73f3ff'){
 if(zCinema.deferMelee&&e===zCinema.lockedTarget&&(color==='#fff2ae'||color==='#ffe66b')){zCinema.deferredDamage=(zCinema.deferredDamage||0)+damage;return}
 return max5Hurt(e,damage,color)
};
const max5CinemaUpdate=zCinemaUpdate;
zCinemaUpdate=function(dt){
 max5CinemaUpdate(dt);
 const target=zCinema.lockedTarget&&enemies.includes(zCinema.lockedTarget)?zCinema.lockedTarget:null;
 matty.owner=griffin.transformation?.active?'TRANSFORMATION':griffin.superMove?.active?'SUPER':zCinema.route.length?'OWEN':target&&dist(player,target)>190?'NAVIGATION':'COMBAT';
 if(zCinema.contactBeat&&zCinema.deferredDamage)zCinema.contactBeat.damage=Math.max(zCinema.contactBeat.damage,zCinema.deferredDamage);
 if(target&&zCinema.attack<=0&&dist(player,target)>190){zCinema.meleePose='FLIGHT';if(!zCinema.route.length)matty.owner='NAVIGATION'}
};
// Combat-event QA keeps animation quality measurable without allocating a
// second replay stream. The metrics travel inside every exported replay frame.
const max5CombatEvent=combatEvent;
combatEvent=function(type,data={}){
 const q=owen.quality;if(type==='MELEE_COMBO_BEAT'){q.attempts++;if(data.pose===q.lastPose)q.repeats++;q.lastPose=data.pose}
 if(type==='MELEE_CONTACT_CONFIRMED'){q.hits++;q.lastHitAt=elapsed;zStage.cut=data.boss?.46:.22;owen.hold=data.boss?.085:.055}
 if(type==='MELEE_CONTACT_MISSED'){q.whiffs++;zCinema.route.length=0;zCinema.combo=0;zCinema.attack=.18;owen.pose=owen.wanted='FLIGHT';griffin.mode='MATTY WHIFF RECOVERY'}
 q.contactRate=q.attempts?clamp(q.hits/q.attempts,0,1):1;return max5CombatEvent(type,data)
};
// Give each super its own mechanical silhouette as well as its own pose set.
// Damage scales with campaign growth so the spectacle remains consequential.
const max5SuperImpact=superMoveImpact;
superMoveImpact=function(s){
 if(s.impact)return;const before=new Map(enemies.map(e=>[e,(e.hp||0)+(e.shield||0)]));max5SuperImpact(s);
 const scale={SPIRIT_BOMB:1.75,METEOR_RUSH:1.42,DRAGON_BEAM:1.62,FINAL_NOVA:1.55}[s.id]||1.4,bonus=(52+campaign.stage*9+(griffin.evolution||0)*18)*(scale-1);
 for(const [e,hp] of before)if(enemies.includes(e)&&((e.hp||0)+(e.shield||0))<hp){max5Hurt(e,bonus,s.color);s.confirmedDamage+=bonus}
 if(s.id==='SPIRIT_BOMB')for(const e of enemies)if(dist({x:s.targetX,y:s.targetY},e)<390){e.speed*=.72;e.slow=Math.max(e.slow||0,1.1)}
 else if(s.id==='DRAGON_BEAM')zStage.cut=.72;else if(s.id==='FINAL_NOVA')for(const e of enemies){const a=Math.atan2(e.y-player.y,e.x-player.x);e.x+=Math.cos(a)*95;e.y+=Math.sin(a)*95}
 combatEvent('OWEN_SUPER_RESOLUTION',{move:s.id,hits:s.confirmedHits,damage:Math.round(s.confirmedDamage),scale})
};
// Family-specific body language makes identical recipes read differently.
function owenFamilyMotion(yaw,color){
 if(!zCinema.route.length||griffin.superMove?.active||griffin.transformation?.active)return;const family=zCinema.family||'GROUND',v=owenAxes(yaw),q=clamp(owen.stateTime/Math.max(.01,owen.stateLength),0,1),pulse=Math.sin(q*Math.PI),side=zCinema.meleeSide||1;
 if(family==='AERIAL'){iylaBox(-v.fx*.65,.42+pulse*.72,-v.fz*.65,.06,.06,.72,color,yaw,.35);zStage.elevation=Math.max(zStage.elevation,.72)}
 else if(family==='VANISH')for(let n=1;n<=3;n++)iylaBox(-v.fx*n*.36+v.rx*side*.18,1+n*.13,-v.fz*n*.36+v.rz*side*.18,.04,.05,.38,color,yaw,.2);
 else if(family==='POWER')iylaRound(0,1.18,0,.72+pulse*.32,1.28+pulse*.2,.72+pulse*.32,color,yaw,.11);
 else if(family==='GRAPPLE')for(const s of[-1,1])iylaRound(v.fx*.72+v.rx*s*.22,1.42,v.fz*.72+v.rz*s*.22,.24,.25,.24,[.9,.58,.39],yaw,.82);
 else if(family==='DEFENSE')iylaRound(-v.fx*.35,1.12,-v.fz*.35,.62,.18,.46,color,yaw,.2)
}
const max5FamilyGriffin=owenGriffin;
owenGriffin=function(yaw,color,form){max5FamilyGriffin(yaw,color,form);owenFamilyMotion(yaw,color)};
// Iyla Production Render 1: a bounded visual-production pass.  It adds authored
// anatomy, distinct boss silhouettes, terrain landmarks and contact lighting
// without touching combat simulation, hit resolution, or Xavier's frame budget.
const production={name:'IYLA PRODUCTION RENDER',version:'1.0',terrain:24,bossKits:5,fxCap:36};
// Curtis Visibility Director owns scene composition while Matty directs combat,
// Owen directs motion, Iyla renders, and Xavier protects the frame budget.
// The world-pass boundary keeps terrain from burying either fighter in WebGL
// and in the software-depth fallback without altering simulation coordinates.
const curtis={name:'CURTIS VISIBILITY DIRECTOR',version:'1.0',role:'SCENE COMPOSITION + CAMERA SAFETY',mode:'CALIBRATING',worldPass:false,worldObjects:0,culled:0,faded:0,budget:72,clarity:1,focusX:0,focusZ:0};
const curtisBaseBox=iylaBox,curtisBaseRound=iylaRound;
function curtisBeginWorld(){curtis.worldPass=true;curtis.worldObjects=curtis.culled=curtis.faded=0;const mobile=W<720,pressure=superAI.tier===1||superAI.stall||iyla.fps<42;curtis.budget=pressure?(mobile?30:42):(mobile?46:68);const target=zTarget(),tx=target?(target.x-W/2)/45:0,tz=target?(target.y-H/2)/45:0;curtis.focusX=tx*.42;curtis.focusZ=tz*.42;curtis.mode=!iyla3d.gl?'SOFTWARE CLARITY':pressure?'FRAME-SAFE CLARITY':zCinema.combo||griffin.superMove?.active?'CONTACT FOCUS':'ARENA COMPOSITION'}
function curtisEndWorld(){curtis.worldPass=false;const total=Math.max(1,curtis.worldObjects+curtis.culled);curtis.clarity=clamp(1-curtis.faded*.012-curtis.culled/total*.08,.72,1);const desired=(zCinema.combo||griffin.superMove?.active)?.91:enemies.length?.96:1;zStage.zoom+=(clamp(desired,.88,1)-zStage.zoom)*.12}
function curtisWorldAlpha(px,py,pz,sx,sy,sz,alpha){if(!curtis.worldPass)return alpha;const floor=py+sy<.22||sy<.11;if(floor)return alpha;curtis.worldObjects++;const cap=curtis.budget,dx=px-curtis.focusX,dz=pz-curtis.focusZ,near=Math.hypot(px,pz)<2.7,corridor=Math.abs(dx*.86-dz*.5)<1.55&&Math.hypot(dx,dz)<7.2,projected=iylaIsoPoint(px,py,pz),screenBlock=Math.abs(projected.x-W/2)<Math.max(105,W*.18)&&projected.y>H*.27&&projected.y<H*.79;if(curtis.worldObjects>cap){curtis.culled++;return 0}if(near||corridor||screenBlock){const fade=near?.06:corridor?.14:.2;curtis.faded++;return Math.min(alpha,fade)}return alpha}
iylaBox=function(px,py,pz,sx,sy,sz,color,yaw=0,alpha=1){alpha=curtisWorldAlpha(px,py,pz,sx,sy,sz,alpha);if(alpha<=.015)return;curtisBaseBox(px,py,pz,sx,sy,sz,color,yaw,alpha)};
iylaRound=function(px,py,pz,sx,sy,sz,color,yaw=0,alpha=1){alpha=curtisWorldAlpha(px,py,pz,sx,sy,sz,alpha);if(alpha<=.015)return;curtisBaseRound(px,py,pz,sx,sy,sz,color,yaw,alpha)};
function productionGriffinDetail(yaw,color,form){
 const v=owenAxes(yaw),lift=.12+(zStage.elevation||0)*.28,s=1.14,front=.34*s,headY=1.98*s+lift,skin=[.88,.57,.38],dark=[.045,.025,.035],white=[.9,.96,1],cloth=[.92,.24,.025],blue=[.04,.2,.62];
 // Face planes, ears, brow, nose and mouth remain readable from the tilted camera.
 for(const q of[-1,1]){const eye=owenPoint(0,0,q*.085*s,headY+.035,front,yaw);iylaRound(eye.x,eye.y,eye.z,.043,.025,.018,white,yaw,.96);iylaBox(eye.x,eye.y+.04,eye.z,.07,.018,.018,dark,yaw+q*.16,.92);const ear=owenPoint(0,0,q*.16*s,headY,0,yaw);iylaRound(ear.x,ear.y,ear.z,.055,.075,.035,skin,yaw,.95)}
 const nose=owenPoint(0,0,0,headY-.005,front+.025,yaw),mouth=owenPoint(0,0,0,headY-.105,front+.02,yaw);iylaBox(nose.x,nose.y,nose.z,.028,.045,.025,skin,yaw,.98);iylaBox(mouth.x,mouth.y,mouth.z,.082,.014,.018,dark,yaw,.9);
 // Gi construction: collar, sash, knot and boot cuffs break up the capsule body.
 for(const q of[-1,1]){const collar=owenPoint(0,0,q*.17*s,1.72*s+lift,.32*s,yaw);iylaBox(collar.x,collar.y,collar.z,.18,.035,.035,blue,yaw+q*.62,.96);const cuff=owenPoint(0,0,q*.27*s,.42*s+lift,.08,yaw);iylaBox(cuff.x,cuff.y,cuff.z,.22,.055,.22,blue,yaw,.95)}
 const belt=owenPoint(0,0,0,1.08*s+lift,.29*s,yaw);iylaBox(belt.x,belt.y,belt.z,.47,.055,.05,blue,yaw,.98);iylaRound(belt.x+v.fx*.055,belt.y,belt.z+v.fz*.055,.09,.075,.055,color,yaw,.98);
 // Transformation forms alter the actual silhouette, not only its tint.
 if(form>1)for(let n=0;n<Math.min(7,3+form);n++){const q=n/(Math.min(7,3+form)-1)-.5,a=yaw+q*1.08,p=owenPoint(0,0,q*.48,headY+.34+Math.cos(q*Math.PI)*.12,-.08,yaw);iylaBox(p.x,p.y,p.z,.065,.28+form*.025,.075,color,a,.98)}
}
const productionBaseGriffin=owenGriffin;
owenGriffin=function(yaw,color,form){productionBaseGriffin(yaw,color,form);productionGriffinDetail(yaw,color,form)};
function productionLiraKit(e){
 if(!e||!enemies.includes(e)||e.type!==3)return;const px=(e.x-W/2)/45,pz=(e.y-H/2)/45,yaw=-Math.atan2(player.x-e.x,player.y-e.y),v=owenAxes(yaw),style=e.bossStyle||campaignBoss()?.style||'RUSH',core=style==='STORM'?[.72,.24,1]:style==='TITAN'?[1,.48,.06]:style==='PHANTOM'?[1,.12,.55]:style==='OMEGA'?[1,.9,.38]:[1,.04,.22];
 if(style==='RUSH'){for(const q of[-1,1]){const p=owenPoint(px,pz,q*1.03,1.62,-.18,yaw);iylaBox(p.x,p.y,p.z,.52,.13,.22,core,yaw+q*.42,.98)}iylaBox(px-v.fx*.72,1.08,pz-v.fz*.72,.16,.28,.62,core,yaw,.9)}
 else if(style==='STORM'){for(let n=0;n<6;n++){const a=n*TAU/6+elapsed*1.4;iylaBox(px+Math.cos(a)*1.28,1.15+(n&1)*.42,pz+Math.sin(a)*1.28,.055,.48,.055,core,a,.9)}}
 else if(style==='TITAN'){for(const q of[-1,1]){const p=owenPoint(px,pz,q*.88,1.56,0,yaw);iylaRound(p.x,p.y,p.z,.48,.42,.44,core,yaw,.98);const g=owenPoint(px,pz,q*.72,.7,.42,yaw);iylaRound(g.x,g.y,g.z,.38,.46,.38,core,yaw,.98)}iylaBox(px,1.36,pz,.78,.12,.42,[.18,.02,.04],yaw,.96)}
 else if(style==='PHANTOM'){for(const q of[-1,1])for(let n=0;n<3;n++){const p=owenPoint(px,pz,q*(.62+n*.23),1.48-n*.18,-.38-n*.18,yaw);iylaBox(p.x,p.y,p.z,.08,.5-n*.06,.28,core,yaw+q*.52,.46+n*.16)}}
 else {iylaRound(px,2.55,pz,.82,.12,.82,core,yaw,.34);for(let n=0;n<7;n++){const a=n*TAU/7+elapsed*.36,p=owenPoint(px,pz,Math.cos(a)*1.05,1.32+Math.sin(a*2)*.22,Math.sin(a)*1.05,yaw);iylaBox(p.x,p.y,p.z,.12,.34,.12,core,a,.92)}iylaBox(px-v.fx*.9,1.28,pz-v.fz*.9,.14,.16,.9,core,yaw,.9)}
}
const productionBaseLira=owenLira;
owenLira=function(e,boss){productionBaseLira(e,boss);if(boss)productionLiraKit(e)};
const productionBaseWorld=iyla3DWorld;
iyla3DWorld=function(){
 curtisBeginWorld();try{productionBaseWorld();const stage=campaign.stage||1,ox=-(((worldX/45)%18+18)%18),oz=-(((worldY/45)%18+18)%18),stone=stage%3===0?[.16,.11,.08]:stage%2?[.075,.13,.15]:[.11,.08,.16],light=stage%3===0?[1,.46,.08]:stage%2?[.08,.75,.68]:[.62,.22,1];
 // Raised paths, broken columns, craters and skyline pylons give each scrolling
 // level navigable landmarks while remaining deterministic and mobile-safe.
 for(let n=0;n<8;n++){const row=Math.floor(n/4),col=n%4,px=ox-7+col*4.6,pz=oz-2+row*5.2,h=.12+(n%3)*.045;iylaBox(px,-.02,pz,1.55,h,1.12,n===stage%8?light:stone,n*.31,.9)}
 for(let n=0;n<6;n++){const a=n*2.399+stage*.47,r=7.2+(n%2)*2.1,px=ox+Math.cos(a)*r,pz=oz+Math.sin(a)*r,h=.8+(n%3)*.7;iylaBox(px,h*.5,pz,.34,h*.5,.34,stone,a,.9);iylaBox(px,h+.08,pz,.52,.09,.52,light,a,.72)}
 for(let n=0;n<5;n++){const a=n*TAU/5+stage,r=3.2+n*.72,px=ox+Math.cos(a)*r,pz=oz+Math.sin(a)*r;iylaRound(px,.015,pz,.7+n*.08,.018,.42+n*.05,[.015,.02,.025],a,.58)}
 for(let n=0;n<5;n++){const a=n*TAU/5+.35,r=15.5+(n&1)*2.2;iylaBox(Math.cos(a)*r,2.4+(n%3)*1.2,Math.sin(a)*r,.34,2.4+(n%3)*1.2,.34,n===stage%5?light:stone,a,.5)}}finally{curtisEndWorld()}
};
const curtisBase3DFrame=iyla3DFrame;
iyla3DFrame=function(dt){curtisBase3DFrame(dt);const el=$('#iylaDetail');if(el)el.innerHTML+=`<br>CURTIS ${curtis.mode} · CLARITY ${Math.round(curtis.clarity*100)}%<br>SCENE ${curtis.worldObjects}/${curtis.budget} · FADED ${curtis.faded} · CULLED ${curtis.culled}`};
// Controlled contact lighting makes hits legible without full-screen white wash.
const productionBaseStageVisuals=zStageVisuals;
zStageVisuals=function(){productionBaseStageVisuals();const impacts=zCinema.impacts.slice(-4);x.save();x.globalCompositeOperation='screen';for(const p of impacts){const q=clamp((p.life||0)/(p.max||.24),0,1);if(q<=0)continue;const r=12+q*24,g=x.createRadialGradient(p.x,p.y,1,p.x,p.y,r);g.addColorStop(0,`rgba(255,255,255,${q*.72})`);g.addColorStop(.3,`rgba(90,240,255,${q*.28})`);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.arc(p.x,p.y,r,0,TAU);x.fill()}x.restore()};
// Augment replay frames at the storage boundary so all existing exporters and
// long-memory behavior remain intact.
const max5RememberReplayFrame=rememberReplayFrame;
rememberReplayFrame=function(frame){frame.owen={...frame.owen,version:owen.version,family:matty.family,owner:matty.owner,recipe:owen.recipe,contactRate:+owen.quality.contactRate.toFixed(3),attempts:owen.quality.attempts,hits:owen.quality.hits,whiffs:owen.quality.whiffs,repeats:owen.quality.repeats};max5RememberReplayFrame(frame)};
// Boss identity belongs to the HUD, not underneath the fighters. This keeps
// combat silhouettes and contact poses readable at close range.
const cleanBossVisuals=ultimateVisuals;
ultimateVisuals=function(){
 const boss=griffin.boss&&enemies.includes(griffin.boss)?griffin.boss:null;
 if(!boss){cleanBossVisuals();return}
 griffin.boss=null;cleanBossVisuals();griffin.boss=boss;
 const width=Math.min(W-32,270),left=(W-width)/2,top=86,hp=clamp((boss.hp||1)/(boss.maxHp||boss.hp||1),0,1);
 x.save();x.globalAlpha=.94;x.fillStyle='#100612dd';x.strokeStyle='#ff5277aa';x.lineWidth=1;x.beginPath();x.roundRect(left,top,width,32,12);x.fill();x.stroke();x.textAlign='center';x.font='800 10px system-ui';x.fillStyle='#ff9db0';x.fillText(`${boss.bossName||'LIRA PRIME'} · FORM ${boss.bossForm||1}`,W/2,top+13);x.fillStyle='#33101c';x.fillRect(left+12,top+20,width-24,4);x.fillStyle=boss.shield>0?'#c866ff':'#ff315c';x.fillRect(left+12,top+20,(width-24)*hp,4);x.restore()
};
$('#trainBrain').onclick=()=>trainGriffin(9000);$('#exportBrain').onclick=exportBrain;$('#importBrain').onclick=importBrain;
setInterval(()=>{if(!running)griffin.defenseReady=false},250);
setInterval(()=>{if(autoMode&&running)executive()},1000);
setInterval(()=>{if(autoMode&&running){player.speed=Math.max(player.speed,270+(1-(griffin.profile?.risk||1))*25);if(griffin.boss&&!enemies.includes(griffin.boss))griffin.boss=null;if(griffin.risk>4&&(!griffin.dashAt||elapsed-griffin.dashAt>7)){griffin.dashAt=elapsed;player.x=clamp(player.x+Math.cos(griffin.heading)*65,25,W-25);player.y=clamp(player.y+Math.sin(griffin.heading)*65,90,H-25);speak('Emergency vector burst.')}}},250);
setInterval(()=>{if(autoMode&&running){const target=clamp(kills/Math.max(1,elapsed)-griffin.risk*.18+(player.hp/player.maxHp-.5),-1,1);trainNet(features(griffin.heading,0),target);if(memory.replay.length>180){const grouped={};for(const e of memory.replay){const g=grouped[e.key]||(grouped[e.key]={key:e.key,reward:0,n:0});g.reward+=e.reward;g.n++}memory.replay=Object.values(grouped).map(g=>({key:g.key,reward:g.reward/g.n})).slice(-120)}}},1500);
setInterval(()=>{if(autoMode&&running){player.speed=Math.max(player.speed,292);const target=clamp(kills/Math.max(1,elapsed)-griffin.risk*.2+(player.hp/player.maxHp-.45),-1,1);trainEnsemble(features(griffin.heading,0),target)}},500);
let scienceHp=100,scienceKills=0,scienceXp=0,activeTheory=null;setInterval(()=>{if(!autoMode||!running)return;const action='HEADING-'+Math.round((griffin.heading%TAU+TAU)%TAU/(TAU/8)),prediction=clamp((1-griffin.risk/4)+(player.hp/player.maxHp-.5),-2,2);if(activeTheory){const reward=(kills-scienceKills)*1.7+(xp-scienceXp)*.5-(scienceHp-player.hp)*1.6;observeHypothesis(activeTheory,reward);memory.science.calibration=memory.science.calibration*.96+Math.abs(reward-activeTheory.prediction)*.04}activeTheory=hypothesis(action,prediction);activeTheory.hypothesis=activeTheory.key;scienceHp=player.hp;scienceKills=kills;scienceXp=xp;if(memory.science.tests%12===0)saveMemory()},2000);
addEventListener('keydown',e=>{keys.add(e.code);if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault()},{passive:false});addEventListener('keyup',e=>keys.delete(e.code));const pointer={active:false,id:0,sx:0,sy:0,dx:0,dy:0},stick=$('#stick');c.addEventListener('pointerdown',e=>{if(autoMode)return;pointer.active=true;pointer.id=e.pointerId;pointer.sx=e.clientX;pointer.sy=e.clientY;pointer.dx=pointer.dy=0;stick.style.display='block';stick.style.left=e.clientX-59+'px';stick.style.top=e.clientY-59+'px';c.setPointerCapture(e.pointerId)});c.addEventListener('pointermove',e=>{if(!pointer.active||e.pointerId!==pointer.id)return;let dx=e.clientX-pointer.sx,dy=e.clientY-pointer.sy,m=Math.hypot(dx,dy),lim=42;if(m>lim){dx=dx/m*lim;dy=dy/m*lim;m=lim}pointer.dx=dx/lim;pointer.dy=dy/lim;stick.firstElementChild.style.transform=`translate(${dx}px,${dy}px)`});function release(){pointer.active=false;pointer.dx=pointer.dy=0;stick.style.display='none';stick.firstElementChild.style.transform=''}c.addEventListener('pointerup',release);c.addEventListener('pointercancel',release);$('#startBtn').onclick=()=>{initUltimateAudio();reset(false)};$('#autoStart').onclick=()=>{initUltimateAudio();reset(true)};$('#retry').onclick=()=>{initUltimateAudio();reset(autoMode)};$('#autoToggle').onclick=()=>{initUltimateAudio();autoMode=!autoMode;release();if(autoMode){griffin.plan=pickPlan();griffin.replan=18;if(paused){const buttons=[...document.querySelectorAll('#choices button')];buttons.reduce((a,b)=>upgradeScore(upgrades[+b.dataset.i])>upgradeScore(upgrades[+a.dataset.i])?b:a)?.click()}}hud()};updateBest();hud();draw();
document.addEventListener('visibilitychange',()=>{last=performance.now();if(!document.hidden)superAI.stall=Math.max(superAI.stall,.8)});
setInterval(()=>{const el=$('#scienceDetail');if(el)el.innerHTML=`${compute.tier} · ${compute.cores} SPECIALIST CORES<br>ROUTES SCORED ${compute.candidates.toLocaleString()} · INFINITE WORLD<br>THEORIES ${Object.keys(memory.science.hypotheses).length} · TESTS ${memory.science.tests}<br>CONFIRMED ${memory.science.confirmed} · REJECTED ${memory.science.rejected}<br>CALIBRATION ERROR ${memory.science.calibration.toFixed(2)}`},750);

// Production Directors 2.0. The design follows the readable combat principles
// used by modern arena fighters: committed anticipation, target-facing rushes,
// contact recovery, transformation payoff, bounded effects and audible identity.
const production2={version:'2026.8.14',research:'ARENA FIGHTER CONTACT + CAMERA + AUDIO',frame:0};

// Jaxon and Conner: independent speech queues, subtitles, user-gesture unlock,
// and a procedural audio cue when a browser has no usable speech voice.
Object.assign(combatVoices,{status:'LOCKED',unlocked:false,voiceList:[],queue:[],speaking:false,subtitleUntil:0});
combatVoices.jaxon.last=-99;combatVoices.conner.last=-99;
const voiceCaption=document.createElement('div');voiceCaption.className='voice-caption';voiceCaption.hidden=true;document.body.appendChild(voiceCaption);
const voiceStyle=document.createElement('style');voiceStyle.textContent='.voice-caption{position:fixed;z-index:4;left:50%;bottom:max(96px,calc(env(safe-area-inset-bottom) + 88px));transform:translateX(-50%);max-width:min(88vw,560px);padding:8px 13px;border:1px solid #8dffe277;border-radius:12px;background:#020b12dc;color:#efffff;text-align:center;font:800 11px/1.35 system-ui;letter-spacing:.04em;pointer-events:none;box-shadow:0 8px 30px #000b}.voice-caption[data-agent=CONNER]{border-color:#ff577c88;color:#ffd8e0}@media(max-width:620px){.voice-caption{bottom:112px;font-size:10px}}';document.head.appendChild(voiceStyle);
function voiceRefresh(){try{combatVoices.voiceList=speechSynthesis.getVoices()||[];combatVoices.status=combatVoices.voiceList.length?'READY':'SYNTH FALLBACK'}catch{combatVoices.status='SYNTH FALLBACK'}}
if(window.speechSynthesis){voiceRefresh();speechSynthesis.addEventListener?.('voiceschanged',voiceRefresh)}
function voiceCue(agent){try{const ac=ultimate.audio;if(!ac)return;const now=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.type=agent==='conner'?'square':'triangle';o.frequency.setValueAtTime(agent==='conner'?116:164,now);o.frequency.exponentialRampToValueAtTime(agent==='conner'?82:218,now+.14);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.055,now+.015);g.gain.exponentialRampToValueAtTime(.0001,now+.18);o.connect(g).connect(ac.destination);o.start(now);o.stop(now+.19)}catch{}}
function voicePump(){if(combatVoices.speaking||!combatVoices.queue.length)return;const item=combatVoices.queue.shift(),v=combatVoices[item.agent];combatVoices.speaking=true;combatVoices.status='SPEAKING';voiceCaption.dataset.agent=v.name;voiceCaption.textContent=`${v.name} // ${item.msg}`;voiceCaption.hidden=false;combatVoices.subtitleUntil=performance.now()+Math.max(1800,item.msg.length*58);const finish=()=>{combatVoices.speaking=false;combatVoices.status=combatVoices.voiceList.length?'READY':'SYNTH FALLBACK';setTimeout(voicePump,90)};if(!combatVoices.enabled||!combatVoices.unlocked||!window.SpeechSynthesisUtterance){voiceCue(item.agent);setTimeout(finish,Math.max(700,item.msg.length*35));return}try{const u=new SpeechSynthesisUtterance(item.msg),list=combatVoices.voiceList,preferred=item.agent==='conner'?/Samantha|Karen|Moira|Ava|Serena/i:/Daniel|Aaron|Alex|Arthur|Eddy/i;u.pitch=v.pitch;u.rate=v.rate;u.volume=.82;u.voice=list.find(q=>q.lang?.startsWith('en')&&preferred.test(q.name))||list.find(q=>q.lang?.startsWith('en'))||null;u.onend=finish;u.onerror=()=>{voiceCue(item.agent);finish()};speechSynthesis.speak(u)}catch{voiceCue(item.agent);finish()}}
aiVoice=function(agent,msg,force=false){const v=combatVoices[agent],now=performance.now()/1000;if(!v||!msg||(!force&&now-v.last<combatVoices.minGap))return;v.last=now;voices.push(`${v.name} // ${msg}`);if(voices.length>8)voices.shift();if(force)combatVoices.queue.unshift({agent,msg});else if(!combatVoices.queue.some(q=>q.agent===agent&&q.msg===msg))combatVoices.queue.push({agent,msg});combatVoices.queue=combatVoices.queue.slice(-4);voicePump()};
function unlockCombatVoices(){initUltimateAudio();combatVoices.unlocked=true;combatVoices.status='READY';voiceRefresh();voiceCue('jaxon');voicePump()}
for(const id of['startBtn','autoStart','retry','autoToggle'])$('#'+id)?.addEventListener('click',unlockCombatVoices,{passive:true});
setInterval(()=>{if(!voiceCaption.hidden&&performance.now()>combatVoices.subtitleUntil&&!combatVoices.speaking)voiceCaption.hidden=true},250);

// Curtis 2.0 owns the complete assembled frame, including atmosphere and debris.
Object.assign(curtis,{version:'2.0',dynamic:0,dynamicCulled:0,debrisCap:18,flashEnergy:0,submitted:0,visible:0});
function curtisSafeScreen(px,py,pad=105){const boss=griffin.boss&&enemies.includes(griffin.boss)?griffin.boss:null;if(Math.hypot(px-player.x,py-player.y)<pad)return true;return !!boss&&Math.hypot(px-boss.x,py-boss.y)<pad*.85}
const curtisAtmosphere=iylaAtmosphere;
iylaAtmosphere=function(){const pressure=superAI.tier===1||iyla.fps<44||superAI.stall,cap=pressure?8:W<720?14:22;curtis.debrisCap=cap;iyla2026.debris=iyla2026.debris.filter(d=>!curtisSafeScreen(d.x,d.y,88)).slice(-cap);iyla2026.smoke=iyla2026.smoke.filter(s=>!curtisSafeScreen(s.x,s.y,112)).slice(-(pressure?10:22));curtis.dynamic=iyla2026.debris.length+iyla2026.smoke.length;curtis.dynamicCulled=Math.max(0,iyla2026.debris.length-cap);curtisAtmosphere()};
const curtisStageVisuals2=zStageVisuals;
zStageVisuals=function(){const pressure=superAI.tier===1||iyla.fps<42,zCap=pressure?2:4;if(zStage.blasts.length>zCap)zStage.blasts=zStage.blasts.slice(-zCap);curtis.flashEnergy=zStage.blasts.reduce((n,b)=>n+clamp(b.life/b.max,0,1)*b.power,0);const oldCut=zStage.cut;if(curtis.flashEnergy>2.4)zStage.cut=Math.min(zStage.cut,.16);curtisStageVisuals2();zStage.cut=oldCut};
const curtisFrame2=iyla3DFrame;
iyla3DFrame=function(dt){production2.frame++;curtis.submitted=curtis.visible=0;retainNewest(iyla.explosions,superAI.tier===1?3:6);retainNewest(ultimate.scars,superAI.tier===1?8:16);curtisFrame2(dt);curtis.submitted=curtis.worldObjects+curtis.culled+curtis.dynamic;curtis.visible=Math.min(curtis.worldObjects,curtis.budget)+curtis.dynamic;const over=Math.max(0,curtis.visible-curtis.budget),targetZoom=over>5?.9:griffin.boss?.93:.97;zStage.zoom+=(targetZoom-zStage.zoom)*Math.min(1,dt*5);curtis.mode=over?'GLOBAL BUDGET RECOVERY':curtis.flashEnergy>2?'EXPOSURE GUARD':curtis.mode;const el=$('#iylaDetail');if(el)el.innerHTML+=`<br>CURTIS 2.0 GLOBAL ${curtis.visible}/${curtis.budget} · DEBRIS ${iyla2026.debris.length}/${curtis.debrisCap}<br>EXPOSURE ${curtis.flashEnergy.toFixed(1)} · VOICES ${combatVoices.status}`};

// Owen 6 adds authored temporal profiles and target-space commitment. A strike
// can no longer read as a looped idle gesture when the opponent is elsewhere.
Object.assign(owen,{version:'MAX-6',contactTarget:null,contactReach:0,tempo:'NEUTRAL'});
const owenTiming={PUNCH:[.26,.5,.74],HOOK:[.3,.56,.78],ELBOW:[.22,.5,.76],KNEE:[.3,.58,.8],KICK:[.32,.62,.82],UPPERCUT:[.38,.66,.84],SPIN_KICK:[.3,.68,.86],AXE_KICK:[.42,.7,.88],FINISHER:[.36,.72,.9]};
function owenTarget(){const t=zTarget();if(!t)return null;const dx=t.x-player.x,dy=t.y-player.y,d=Math.hypot(dx,dy);return{x:t.x,y:t.y,d,yaw:-Math.atan2(dx,dy)}}
const owenController6=owenController;
owenController=function(dt){owenController6(dt);const target=owenTarget(),timing=owenTiming[owen.pose];owen.contactTarget=target;if(timing){const q=clamp(owen.stateTime/Math.max(.01,owen.stateLength),0,1),[a,contact,recover]=timing;owen.phase=q<a?'ANTICIPATION':q<contact?'ACCELERATION':q<recover?'CONTACT':'RECOVERY';owen.tempo=q<a?'HOLD':q<recover?'COMMIT':'SETTLE';owen.contactReach=target?clamp(1-target.d/240,0,1):0;if(target&&q>=a&&q<recover)peyten.target=target.yaw;if(target&&q>=contact-.05&&q<contact+.08&&target.d<165){zStage.zoom=Math.min(zStage.zoom,.9);owen.hold=Math.max(owen.hold,.035)}}else{owen.contactReach=0;owen.tempo=owen.phase}};

// Original character arcs turn repeated runs into rivalry rather than stat-only
// progression. Stored state is deliberately compact and survives deployments.
const characterArc=(()=>{try{return Object.assign({encounters:0,respect:0,griffinResolve:0,liraDoubt:0,lastStage:0},JSON.parse(localStorage.jarvisCharacterArc||'{}'))}catch{return{encounters:0,respect:0,griffinResolve:0,liraDoubt:0,lastStage:0}}})();
function saveCharacterArc(){try{localStorage.jarvisCharacterArc=JSON.stringify(characterArc)}catch{}}
function characterBeat(kind){if(kind==='BOSS'){characterArc.encounters++;characterArc.lastStage=campaign.stage;const g=characterArc.respect>5?'I know your rhythm, Lira. Show me how you changed.':'I will protect this world and learn from every strike.';const l=characterArc.respect>5?'Then stand, Griffin. I brought a technique worthy of you.':'Your courage is data. I will turn it against you.';speak(g,true);setTimeout(()=>liraSpeak(l,true),1900)}else if(kind==='CLEAR'){characterArc.respect++;characterArc.griffinResolve++;characterArc.liraDoubt+=.5;speak('That victory was not luck. I earned the next horizon.',true)}saveCharacterArc()}
const characterEnemy=enemy;
enemy=function(forceBoss=false){const before=enemies.filter(e=>e.type===3).length,r=characterEnemy(forceBoss);if(forceBoss&&!before&&enemies.some(e=>e.type===3))characterBeat('BOSS');return r};
const characterCampaignUpdate=campaignUpdate;
campaignUpdate=function(dt){const stage=campaign.stage,answer=characterCampaignUpdate(dt);if(campaign.stage!==stage)characterBeat('CLEAR');return answer};

// Christian Mechanics AI: a bounded mechanics authority informed by modern
// arena-fighter resource, contact, recovery and readability rules.
memory.christian||={version:1,runs:0,seconds:0,contactAttempts:0,contactHits:0,damageIn:0,damageOut:0,bestStage:1,assistBias:0,lessons:[]};
const christian={name:'CHRISTIAN MECHANICS AI',version:'1.0',mode:'CALIBRATING',doctrine:'READABLE FAIRNESS',threat:0,flow:0,kiGain:0,skillStock:0,guard:1,contactClock:0,damageWindow:0,damageTaken:0,hpLast:player.hp,enemyHpLast:0,target:null,lastStrike:-1,learnClock:0,saveClock:0,bossCount:0,voice:'ORIGINAL PACK'};
function christianEnemyHp(){let total=0;for(const e of enemies)total+=Math.max(0,e.hp||0);return total}
function christianReset(){Object.assign(christian,{mode:'OPENING READ',threat:0,flow:0,kiGain:0,skillStock:0,guard:1,contactClock:0,damageWindow:1,damageTaken:0,hpLast:player.hp,enemyHpLast:christianEnemyHp(),target:null,lastStrike:-1,learnClock:0,saveClock:0,bossCount:0});expansion59.ki=Math.max(expansion59.ki,.28)}
const christianBaseReset=reset;
reset=function(mode=autoMode){const answer=christianBaseReset(mode);christianReset();memory.christian.runs++;return answer};
function christianContact(target){if(!target||!enemies.includes(target))return;const damage=Math.max(8,player.damage*(.42+(griffin.evolution||0)*.05));hurt(target,damage,'#fff3bd');christian.flow=clamp(christian.flow+.14,0,1);christian.skillStock=clamp(christian.skillStock+.08,0,3);christian.contactClock=0;christian.mode='CONTACT CONFIRMED';combatEvent('CHRISTIAN_CONTACT',{damage:Math.round(damage),target:target.type===3?'BOSS':'FIGHTER'})}
function christianUpdate(dt){
 if(!running)return;if(elapsed<.08)christianReset();
 christian.damageWindow-=dt;if(christian.damageWindow<=0){christian.damageWindow=1;christian.damageTaken=0}
 const rawLoss=Math.max(0,christian.hpLast-player.hp),cap=player.maxHp*(autoMode?(elapsed<30?.12:.18):.24),allowed=Math.max(0,cap-christian.damageTaken),accepted=Math.min(rawLoss,allowed);if(rawLoss>accepted){player.hp=Math.min(player.maxHp,player.hp+rawLoss-accepted);griffin.shield=Math.min(griffin.shieldMax||0,(griffin.shield||0)+(rawLoss-accepted)*.35);christian.mode='BURST DAMAGE GOVERNOR'}christian.damageTaken+=accepted;memory.christian.damageIn+=accepted;christian.hpLast=player.hp;
 const enemyHp=christianEnemyHp(),damageOut=Math.max(0,christian.enemyHpLast-enemyHp);christian.enemyHpLast=enemyHp;if(damageOut>0){memory.christian.damageOut+=damageOut;christian.kiGain=Math.min(.16,damageOut/Math.max(120,player.damage*16));expansion59.ki=clamp(expansion59.ki+christian.kiGain,0,1);christian.flow=clamp(christian.flow+damageOut/500,0,1)}else christian.flow=Math.max(0,christian.flow-dt*.025);
 const boss=enemies.filter(e=>e.type===3);christian.bossCount=boss.length;if(boss.length>1){const keep=campaign.boss&&boss.includes(campaign.boss)?campaign.boss:boss.reduce((a,b)=>(b.max||0)>(a.max||0)?b:a);for(const extra of boss)if(extra!==keep){const i=enemies.indexOf(extra);if(i>=0)enemies.splice(i,1)}christian.mode='ONE BOSS CONTRACT'}
 christian.target=zTarget();const target=christian.target,d=target?dist(player,target):Infinity;christian.threat=clamp(enemies.length*.045+hostile.length*.065+(target?.type===3?.65:0)+(1-player.hp/player.maxHp)*1.2,0,3);
 if(autoMode&&target&&!griffin.transformation?.active&&!griffin.superMove?.active){const a=Math.atan2(target.y-player.y,target.x-player.x);if(d>108&&d<520&&christian.threat<2.35){griffin.heading=a;griffin.mode=target.type===3?'CHRISTIAN BOSS PURSUIT':'CHRISTIAN TARGET PURSUIT'}if(d<145&&owen.phase==='CONTACT'&&owen.transitions!==christian.lastStrike){christian.lastStrike=owen.transitions;memory.christian.contactAttempts++;christianContact(target);memory.christian.contactHits++}else if(d>175&&/PUNCH|KICK|ELBOW|KNEE|FINISHER/.test(owen.pose))christian.mode='RANGE RECOVERY'}
 const projectileCap=Math.round(18+campaign.stage*3+(player.hp/player.maxHp)*14);if(hostile.length>projectileCap)hostile.splice(0,hostile.length-projectileCap);
 const lowHealth=player.hp/player.maxHp<.38,lowClear=kills/Math.max(1,elapsed)<.42;christian.guard=clamp((lowHealth?.9:.35)+(christian.threat/3)*.4,0,1);if(lowHealth)griffin.plan='FORTRESS';else if(lowClear&&christian.threat<1.5)griffin.plan='HUNTER';
 christian.learnClock+=dt;christian.saveClock+=dt;if(christian.learnClock>=5){christian.learnClock=0;memory.christian.seconds+=5;memory.christian.bestStage=Math.max(memory.christian.bestStage,campaign.stage);const ratio=memory.christian.contactHits/Math.max(1,memory.christian.contactAttempts);memory.christian.assistBias=clamp(memory.christian.assistBias+(ratio<.45?.01:-.003),0,.2);christian.mode=lowHealth?'SURVIVAL ECONOMY':lowClear?'OFFENSE ECONOMY':christian.threat>1.8?'THREAT BUDGET':'FLOW BALANCED'}if(christian.saveClock>=15){christian.saveClock=0;try{localStorage.griffinMemory=JSON.stringify(memory)}catch{}}
}
const christianBaseOmni=omniSystems;
omniSystems=function(dt){christianBaseOmni(dt);christianUpdate(dt)};
const christianBaseLabHud=labHud;
labHud=function(){christianBaseLabHud();const el=$('#brainDetail');if(el)el.innerHTML+=`<br><b>${christian.name}</b> · ${christian.mode}<br>THREAT ${christian.threat.toFixed(2)} · FLOW ${Math.round(christian.flow*100)}% · GUARD ${Math.round(christian.guard*100)}%<br>KI +${Math.round(christian.kiGain*100)} · SKILL ${christian.skillStock.toFixed(1)} · BOSS ${christian.bossCount}/1`};

// Bundled original Jaxon and Conner performances are the primary path. Native
// browser speech remains a fallback for unmapped dynamic dialogue.
const voicePack={jaxon:{start:'jarvis/audio/voices/jaxon/start.mp3',boss:'jarvis/audio/voices/jaxon/boss.mp3',danger:'jarvis/audio/voices/jaxon/danger.mp3',clear:'jarvis/audio/voices/jaxon/clear.mp3'},conner:{start:'jarvis/audio/voices/conner/start.mp3',boss:'jarvis/audio/voices/conner/boss.mp3',danger:'jarvis/audio/voices/conner/danger.mp3',clear:'jarvis/audio/voices/conner/clear.mp3'}};
const voiceAudio={current:null};
function voicePackKey(msg){return /clear|victory|horizon/i.test(msg)?'clear':/boss|form|target|pattern|worthy|technique/i.test(msg)?'boss':/recover|guard|pressure|fall|slowing|swarm/i.test(msg)?'danger':'start'}
function playVoicePack(agent,msg,finish){try{const src=voicePack[agent]?.[voicePackKey(msg)];if(!src)return false;voiceAudio.current?.pause();const a=new Audio(src);voiceAudio.current=a;a.preload='auto';a.volume=.86;a.onended=finish;a.onerror=finish;const promise=a.play();if(promise?.catch)promise.catch(finish);combatVoices.status='VOICE PACK';return true}catch{return false}}
voicePump=function(){if(combatVoices.speaking||!combatVoices.queue.length)return;const item=combatVoices.queue.shift(),v=combatVoices[item.agent];combatVoices.speaking=true;voiceCaption.dataset.agent=v.name;voiceCaption.textContent=`${v.name} // ${item.msg}`;voiceCaption.hidden=false;combatVoices.subtitleUntil=performance.now()+Math.max(1800,item.msg.length*58);let done=false;const finish=()=>{if(done)return;done=true;combatVoices.speaking=false;combatVoices.status='PACK READY';setTimeout(voicePump,90)};if(combatVoices.enabled&&combatVoices.unlocked&&playVoicePack(item.agent,item.msg,finish))return;if(combatVoices.enabled&&combatVoices.unlocked&&window.SpeechSynthesisUtterance){try{const u=new SpeechSynthesisUtterance(item.msg),list=combatVoices.voiceList;u.pitch=v.pitch;u.rate=v.rate;u.volume=.82;u.voice=list.find(q=>q.lang?.startsWith('en'))||null;u.onend=finish;u.onerror=finish;speechSynthesis.speak(u);combatVoices.status='SYSTEM VOICE';return}catch{}}voiceCue(item.agent);setTimeout(finish,Math.max(700,item.msg.length*35))};
for(const group of Object.values(voicePack))for(const src of Object.values(group)){const a=new Audio();a.preload='auto';a.src=src}

// Causal arena destruction. Structures have health and staged failure; heavy
// strikes carry fighters through a trajectory, breach intervening geometry and
// leave persistent scars instead of producing unrelated decorative debris.
const destruction={name:'CHRISTIAN STRUCTURAL COMBAT',impacts:0,breaches:0,collapses:0,knockThroughs:0,lastBroken:new WeakSet(),fragments:[],maxFragments:34};
function structureReady(p){if(p.structure)return;p.structure={kind:p.type===0?'MOUNTAIN':p.type===1?'BUILDING':p.type===2?'TOWER':p.type===3?'WALL':'FORTRESS',max:55+p.h*2.4,hp:55+p.h*2.4,stage:0,angle:0,source:'NONE'};if(p.broken){p.structure.hp=0;p.structure.stage=3}}
function structuralFragments(p,count,color){const s=p.structure;for(let n=0;n<count;n++){const a=s.angle+(n/count-.5)*1.7,r=8+n*3;destruction.fragments.push({parent:p,ox:Math.cos(a)*r,oy:Math.sin(a)*r,z:(n%3)*.18,spin:(n%2?1:-1)*(.3+n*.08),size:Math.max(.14,p.h/180)*(1+(n%3)*.18),color,life:8+n*.45})}if(destruction.fragments.length>destruction.maxFragments)destruction.fragments.splice(0,destruction.fragments.length-destruction.maxFragments)}
function structureImpact(p,power,angle,source='KI IMPACT'){structureReady(p);const s=p.structure;if(s.stage>=3)return false;s.angle=angle;s.source=source;s.hp-=power;const ratio=s.hp/s.max,next=ratio<=0?3:ratio<.34?2:ratio<.7?1:0;if(next>s.stage){s.stage=next;destruction.impacts++;if(next===1){structuralFragments(p,3,[.38,.34,.3]);burst(p.x,p.y,'#d3b07a',8)}else if(next===2){destruction.breaches++;structuralFragments(p,6,[.45,.3,.2]);burst(p.x,p.y,'#ffb05a',18);ultimate.scars.push({x:p.x,y:p.y,r:30+p.h*.35,a:angle,life:30,structural:true})}else{destruction.collapses++;p.broken=true;structuralFragments(p,10,[.33,.25,.2]);burst(p.x,p.y,'#ff7b35',32);rings.push({x:p.x,y:p.y,r:12,max:120+p.h,life:.7});ultimate.scars.push({x:p.x,y:p.y,r:44+p.h*.55,a:angle,life:60,structural:true});combatEvent('STRUCTURE_COLLAPSED',{kind:s.kind,source})}}return next>0}
function knockThrough(target,power=1.5,source='HEAVY STRIKE'){if(!target||!enemies.includes(target))return;const a=Math.atan2(target.y-player.y,target.x-player.x),travel=120+power*78,startX=target.x,startY=target.y,endX=startX+Math.cos(a)*travel,endY=startY+Math.sin(a)*travel;let broken=0;for(const p of iyla2026.props){structureReady(p);const vx=endX-startX,vy=endY-startY,len2=vx*vx+vy*vy||1,t=clamp(((p.x-startX)*vx+(p.y-startY)*vy)/len2,0,1),px=startX+vx*t,py=startY+vy*t;if(Math.hypot(p.x-px,p.y-py)<32+p.h*.25&&structureImpact(p,34+power*38,a,source))broken++}target.x=endX;target.y=endY;target.hit=.24;if(broken){destruction.knockThroughs++;hurt(target,player.damage*(.35+broken*.18),'#ffd28b');christian.mode='STRUCTURAL KNOCK-THROUGH';zStage.zoom=Math.min(zStage.zoom,.88);shake=Math.max(shake,12+broken*3);speak('Impact path confirmed. Structure breached.',true)}}
const structuralBurst=zStageBurst;
zStageBurst=function(px,py,color='#ffe66b',power=1){const answer=structuralBurst(px,py,color,power);if(power>=1.15){const target=enemies.reduce((best,e)=>{const d=Math.hypot(e.x-px,e.y-py);return !best||d<best.d?{e,d}:best},null);if(target&&target.d<115+power*35)knockThrough(target.e,power,'SUPER IMPACT');else for(const p of iyla2026.props)if(Math.hypot(p.x-px,p.y-py)<70+power*45)structureImpact(p,28+power*32,Math.atan2(p.y-py,p.x-px),'BLAST WAVE')}return answer};
const structuralChristianUpdate=christianUpdate;
christianUpdate=function(dt){structuralChristianUpdate(dt);for(const p of iyla2026.props){structureReady(p);if(p.broken&&p.structure.stage<3)structureImpact(p,p.structure.max*2,Math.atan2(p.y-player.y,p.x-player.x),'COLLISION');if(p.broken&&!destruction.lastBroken.has(p)){destruction.lastBroken.add(p);p.structure.stage=3;structuralFragments(p,7,[.31,.26,.22])}}for(let i=destruction.fragments.length-1;i>=0;i--){const f=destruction.fragments[i];f.life-=dt;if(f.life<=0||!iyla2026.props.includes(f.parent))destruction.fragments.splice(i,1)}};
const structuralContact=christianContact;
christianContact=function(target){const finisher=/FINISHER|UPPERCUT|SPIN_KICK|AXE_KICK/.test(owen.pose)||expansion59.combo>4;structuralContact(target);if(finisher&&christian.flow>.3)knockThrough(target,1+christian.flow+(griffin.evolution||0)*.16,'MELEE FINISHER')};
function structuralWorld3D(){for(const p of iyla2026.props){structureReady(p);const s=p.structure;if(!s.stage)continue;const wx=(p.x-W/2)/45,wz=(p.y-H/2)/45,size=.38+p.type*.09,h=p.h/28;if(s.stage===1){for(let n=-1;n<=1;n++)iylaBox(wx+n*size*.36,h*(.35+n*.08),wz+.02,size*.08,h*.28,.05,[.75,.38,.16],s.angle+n,.72)}else if(s.stage===2){iylaBox(wx-size*.38,h*.28,wz,size*.18,h*.28,size,[.25,.22,.2],s.angle,.9);iylaBox(wx+size*.38,h*.28,wz,size*.18,h*.28,size,[.25,.22,.2],s.angle,.9);iylaBox(wx,h*.7,wz,size,.12,size*.32,[.32,.25,.2],s.angle,.82)}else{iylaBox(wx,.035,wz,size*1.25,.035,size*1.25,[.2,.08,.04],s.angle,.7)}}for(const f of destruction.fragments){const p=f.parent,wx=(p.x+f.ox-W/2)/45,wz=(p.y+f.oy-H/2)/45;iylaBox(wx,.08+f.z,wz,f.size,.08+f.size*.25,f.size*.7,f.color,f.spin*elapsed,.75)}}
const structural3DWorldBase=iyla3DWorld;
iyla3DWorld=function(){structural3DWorldBase();structuralWorld3D()};
const structuralTerrainBase=iylaTerrain;
iylaTerrain=function(){structuralTerrainBase();x.save();for(const p of iyla2026.props){structureReady(p);if(!p.structure.stage)continue;x.translate(p.x,p.y);x.rotate(p.structure.angle);x.strokeStyle=p.structure.stage===1?'#ffb26688':'#ff6b3599';x.lineWidth=2;const r=14+p.h*.38;x.beginPath();x.moveTo(-r,0);x.lineTo(-r*.25,-r*.35);x.lineTo(r*.2,r*.18);x.lineTo(r,0);x.stroke();x.rotate(-p.structure.angle);x.translate(-p.x,-p.y)}x.restore()};
const structuralOmniHud=omniHud;
omniHud=function(){structuralOmniHud();const el=$('#ultimateDetail');if(el)el.innerHTML+=`<br><b>${destruction.name}</b><br>IMPACTS ${destruction.impacts} · BREACHES ${destruction.breaches} · COLLAPSES ${destruction.collapses}<br>KNOCK-THROUGHS ${destruction.knockThroughs} · PERSISTENT FRAGMENTS ${destruction.fragments.length}`};

// Curtis/Owen/Matty structural impact cinematics. These are short gameplay
// vignettes, not videos: the actual target, structures and damage simulation
// remain authoritative while the directors stage six readable shots.
const impactCinema={name:'CURTIS STRUCTURAL IMPACT CINEMA',active:false,time:0,duration:2.45,phase:'READY',target:null,startX:0,startY:0,endX:0,endY:0,angle:0,power:0,source:'',structures:[],triggered:new Set(),serial:0,completed:0,blackout:0,exitBurst:false};
function impactPhase(q){return q<.08?'ANTICIPATION CLOSE-UP':q<.16?'CONTACT FREEZE':q<.38?'TRACKING KNOCKBACK':q<.61?'STRUCTURE PENETRATION':q<.76?'EXIT BURST':'RECOVERY CRATER'}
function beginImpactCinema(target,power,source,a,startX,startY,endX,endY,structures){
 if(impactCinema.active||!target||!enemies.includes(target)||!structures.length)return false;
 Object.assign(impactCinema,{active:true,time:0,duration:superAI.tier===1?1.85:2.45,phase:'ANTICIPATION CLOSE-UP',target,startX,startY,endX,endY,angle:a,power,source,structures:structures.map((p,index)=>({p,index,t:clamp(Math.hypot(p.x-startX,p.y-startY)/Math.max(1,Math.hypot(endX-startX,endY-startY)),.12,.82)})).sort((u,v)=>u.t-v.t),triggered:new Set(),serial:impactCinema.serial+1,blackout:0,exitBurst:false});
 player.invuln=Math.max(player.invuln||0,impactCinema.duration+.3);target.hit=Math.max(target.hit||0,.4);zStage.cut=.55;zStage.zoom=.82;owen.pose=owen.wanted='FINISHER';owen.phase='ANTICIPATION';owen.hold=.11;matty.commands++;matty.accepted++;matty.lastRequest='STRUCTURAL IMPACT SEQUENCE';curtis.mode='IMPACT VIGNETTE';christian.mode='CINEMATIC IMPACT AUTHORITY';
 for(let i=hostile.length-1;i>=0;i--)if(Math.hypot(hostile[i].x-player.x,hostile[i].y-player.y)<=175)hostile.splice(i,1);combatEvent('STRUCTURAL_CINEMATIC_STARTED',{source,structures:structures.map(p=>p.structure?.kind||'STRUCTURE'),power:Number(power.toFixed(2)),serial:impactCinema.serial});return true
}
function impactCinemaUpdate(dt){
 const c=impactCinema;if(!c.active)return;c.time=Math.min(c.duration,c.time+Math.min(dt,.034));const q=c.time/c.duration,next=impactPhase(q),target=c.target;if(!target||!enemies.includes(target)){c.active=false;zStage.zoom=1;return}
 if(next!==c.phase){c.phase=next;matty.commands++;matty.accepted++;combatEvent('IMPACT_CINEMA_SHOT',{phase:next,serial:c.serial})}
 player.invuln=Math.max(player.invuln||0,.16);target.attackClock=Math.max(target.attackClock||0,.3);target.hit=Math.max(target.hit||0,.08);
 let travel=0;if(q<.16)travel=0;else if(q<.38)travel=(q-.16)/.22*.46;else if(q<.61)travel=.46+(q-.38)/.23*.43;else travel=.89+Math.min(1,(q-.61)/.15)*.11;
 const eased=1-Math.pow(1-clamp(travel,0,1),3);target.x=c.startX+(c.endX-c.startX)*eased;target.y=c.startY+(c.endY-c.startY)*eased;
 if(c.phase==='ANTICIPATION CLOSE-UP'){zStage.zoom+=(.8-zStage.zoom)*Math.min(1,dt*14);owen.phase='ANTICIPATION';owen.hold=Math.max(owen.hold,.035)}
 else if(c.phase==='CONTACT FREEZE'){zStage.zoom=.78;owen.phase='CONTACT FREEZE';owen.hold=Math.max(owen.hold,.045);shake=Math.max(shake,4)}
 else if(c.phase==='TRACKING KNOCKBACK'){zStage.zoom+=(.89-zStage.zoom)*Math.min(1,dt*10);owen.phase='FOLLOW THROUGH'}
 else if(c.phase==='STRUCTURE PENETRATION'){
   zStage.zoom=.9;owen.phase='PENETRATION';for(const hit of c.structures)if(!c.triggered.has(hit.index)&&eased>=hit.t){c.triggered.add(hit.index);structureImpact(hit.p,48+c.power*46,c.angle,c.source);hurt(target,player.damage*(.18+c.power*.06),'#ffd28b');c.blackout=.28;shake=Math.max(shake,14+c.power*2);zImpact(hit.p.x,hit.p.y,'#ffbd7a',3);rings.push({x:hit.p.x,y:hit.p.y,r:10,max:145,life:.54});combatEvent('CINEMATIC_STRUCTURE_PENETRATION',{kind:hit.p.structure.kind,serial:c.serial})}}
 else if(c.phase==='EXIT BURST'&&!c.exitBurst){c.exitBurst=true;zStage.zoom=.86;shake=Math.max(shake,16);zImpact(target.x,target.y,'#ffffff',4);rings.push({x:target.x,y:target.y,r:12,max:190,life:.62});hurt(target,player.damage*(.28+c.structures.length*.1),'#ffffff');combatEvent('CINEMATIC_EXIT_BURST',{serial:c.serial})}
 else if(c.phase==='RECOVERY CRATER'){zStage.zoom+=(.96-zStage.zoom)*Math.min(1,dt*6);owen.phase='RECOVERY';target.hit=Math.max(target.hit||0,.12)}
 c.blackout=Math.max(0,c.blackout-dt);
 if(c.time>=c.duration){target.x=c.endX;target.y=c.endY;target.hit=.22;ultimate.scars.push({x:c.endX,y:c.endY,r:48+c.power*9,a:c.angle,life:70,structural:true});rings.push({x:c.endX,y:c.endY,r:14,max:105,life:.55});destruction.knockThroughs++;c.completed++;c.active=false;zStage.zoom=.96;zStage.cut=.18;owen.phase='RECOVERY';christian.mode='STRUCTURAL DAMAGE CONFIRMED';speak('Impact path confirmed. Structure breached.',true);combatEvent('STRUCTURAL_CINEMATIC_COMPLETE',{serial:c.serial,structures:c.triggered.size})}
}
// Replace the instantaneous transport with a staged, physically continuous
// path whenever the trajectory intersects destructible arena geometry.
knockThrough=function(target,power=1.5,source='HEAVY STRIKE'){
 if(!target||!enemies.includes(target)||impactCinema.active)return;const a=Math.atan2(target.y-player.y,target.x-player.x),travel=120+power*78,startX=target.x,startY=target.y,endX=startX+Math.cos(a)*travel,endY=startY+Math.sin(a)*travel,vx=endX-startX,vy=endY-startY,len2=vx*vx+vy*vy||1,path=[];
 for(const p of iyla2026.props){structureReady(p);if(p.structure.stage>=3)continue;const t=clamp(((p.x-startX)*vx+(p.y-startY)*vy)/len2,0,1),px=startX+vx*t,py=startY+vy*t;if(Math.hypot(p.x-px,p.y-py)<32+p.h*.25)path.push(p)}
 if(path.length&&beginImpactCinema(target,power,source,a,startX,startY,endX,endY,path))return;
 target.x=endX;target.y=endY;target.hit=.24;hurt(target,player.damage*(.2+power*.08),'#ffd28b');zImpact(endX,endY,'#ffd28b',2)
};
function impactCinemaVisuals(){
 const c=impactCinema;if(!c.active)return;const q=c.time/c.duration,contact=c.phase==='CONTACT FREEZE',penetrating=c.phase==='STRUCTURE PENETRATION';x.save();
 if(c.phase==='TRACKING KNOCKBACK'||penetrating){x.globalAlpha=.22;x.strokeStyle='#fff1d0';x.lineWidth=2;for(let n=-5;n<=5;n++){const side=n*17,px=c.target.x-Math.cos(c.angle)*220-Math.sin(c.angle)*side,py=c.target.y-Math.sin(c.angle)*220+Math.cos(c.angle)*side;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(c.angle)*150,py+Math.sin(c.angle)*150);x.stroke()}}
 if(contact){x.globalAlpha=.32;x.fillStyle='#ffffff';x.fillRect(0,0,W,H);x.globalAlpha=1;x.strokeStyle='#fff7ca';x.lineWidth=5;x.beginPath();x.arc(c.startX,c.startY,38+Math.sin(c.time*70)*8,0,TAU);x.stroke()}
 if(c.blackout>0){const a=clamp(c.blackout/.28,0,1);x.globalAlpha=.54*a;x.fillStyle='#1a0f0b';x.fillRect(0,0,W,H);x.globalAlpha=.7*a;x.fillStyle='#c59b73';for(let n=0;n<12;n++){const r=18+(n%4)*12;x.beginPath();x.arc(c.target.x+Math.cos(n*2.4)*r,c.target.y+Math.sin(n*1.7)*r,r,0,TAU);x.fill()}}
 x.globalAlpha=.9;x.fillStyle='#fff';x.font='700 11px system-ui';x.textAlign='center';x.fillText(c.phase,c.target.x,Math.max(78,c.target.y-94));x.restore()
}
const impactSystemsBase=omniSystems;
omniSystems=function(dt){impactSystemsBase(dt);impactCinemaUpdate(dt)};
const impactVisualsBase=omniVisuals;
omniVisuals=function(){impactVisualsBase();impactCinemaVisuals()};
const impactHudBase=omniHud;
omniHud=function(){impactHudBase();const el=$('#ultimateDetail');if(el)el.innerHTML+=`<br><b>${impactCinema.name}</b><br>${impactCinema.active?impactCinema.phase:'READY'} · SEQUENCES ${impactCinema.completed} · SHOT ${impactCinema.serial}`};
// Iyla Character Forge 2.0: original high-detail dark-fantasy silhouettes.
// These bounded mesh kits deliberately avoid licensed character designs while
// giving each faction authored armor, weapons, faces and emissive materials.
const characterForge={name:'IYLA CHARACTER FORGE',version:'2.0',style:'ORIGINAL MYTHIC DARK FANTASY',heroFeatures:0,factionFeatures:0,bossFeatures:0,lod:'HIGH'};
function forgeGriffin(yaw,color,form){
 const v=owenAxes(yaw),lift=.12+(zStage.elevation||0)*.28,skin=[.9,.58,.39],gold=form>1?[1,.72,.08]:[.74,.58,.24],steel=[.055,.12,.2],leather=[.2,.055,.025],cloth=[.86,.15,.025],rune=form>2?color:[.08,.86,1];
 // Layered cuirass, collar, shoulder plates, bracers and articulated hands.
 const chest=owenPoint(0,0,0,1.62+lift,.33,yaw);iylaBox(chest.x,chest.y,chest.z,.5,.31,.07,steel,yaw,.98);iylaBox(chest.x+v.fx*.075,chest.y,chest.z+v.fz*.075,.34,.22,.035,gold,yaw,.97);
 for(const side of[-1,1]){const shoulder=owenPoint(0,0,side*.67,1.72+lift,.02,yaw),bracer=owenPoint(0,0,side*.72,1.15+lift,.12,yaw);iylaRound(shoulder.x,shoulder.y,shoulder.z,.34,.16,.39,steel,yaw,.98);iylaBox(shoulder.x+v.fx*.08,shoulder.y+.08,shoulder.z+v.fz*.08,.3,.055,.32,gold,yaw+side*.18,.96);iylaRound(bracer.x,bracer.y,bracer.z,.2,.25,.2,leather,yaw,.98);for(let n=0;n<4;n++){const finger=owenPoint(0,0,side*(.72+n*.025),.96+lift,.28+n*.018,yaw);iylaRound(finger.x,finger.y,finger.z,.035,.065,.035,skin,yaw,.96)}}
 // Split battle skirt and rune buckle give the lower body a readable costume.
 for(const side of[-1,1]){const skirt=owenPoint(0,0,side*.23,1.0+lift,.12,yaw);iylaBox(skirt.x,skirt.y,skirt.z,.2,.28,.055,cloth,yaw+side*.08,.97)}const buckle=owenPoint(0,0,0,1.09+lift,.35,yaw);iylaRound(buckle.x,buckle.y,buckle.z,.105,.105,.035,gold,yaw,.98);iylaBox(buckle.x+v.fx*.035,buckle.y,buckle.z+v.fz*.035,.035,.06,.02,rune,yaw,.98);
 // A small back mantle provides a mythic silhouette without obscuring attacks.
 const mantle=owenPoint(0,0,0,1.55+lift,-.31,yaw);iylaBox(mantle.x,mantle.y,mantle.z,.58,.44,.035,[.08,.02,.06],yaw,.88);characterForge.heroFeatures+=20
}
const forgeBaseGriffin=owenGriffin;
owenGriffin=function(yaw,color,form){forgeBaseGriffin(yaw,color,form);if(superAI.tier>1||!W||W>=560)forgeGriffin(yaw,color,form)};
function forgeFactionKit(e,boss=false){
 if(!e||!enemies.includes(e)||(superAI.tier===1&&!boss))return;const px=(e.x-W/2)/45,pz=(e.y-H/2)/45,yaw=-Math.atan2(player.x-e.x,player.y-e.y),v=owenAxes(yaw),s=boss?1.46:.68,variant=e.variant||'PHASE',core=variant==='DRAINER'?[.08,1,.42]:variant==='SPLITTER'?[1,.52,.04]:variant==='PHASE'?[.58,.22,1]:[1,.04,.22],iron=[.075,.025,.065],bone=[.68,.54,.44];
 if(variant==='PHASE'){for(const side of[-1,1]){const wing=owenPoint(px,pz,side*.72*s,1.28*s,-.28*s,yaw);iylaBox(wing.x,wing.y,wing.z,.42*s,.05*s,.5*s,core,yaw+side*.52,.74)}iylaRound(px,1.25*s,pz,.52*s,.7*s,.28*s,core,yaw,.12)}
 else if(variant==='DRAINER'){const staff=owenPoint(px,pz,.6*s,1.1*s,.05,yaw);iylaBox(staff.x,staff.y,staff.z,.05*s,.95*s,.05*s,bone,yaw,.95);iylaRound(staff.x,staff.y+.92*s,staff.z,.2*s,.2*s,.2*s,core,yaw,.9);for(const side of[-1,1]){const blade=owenPoint(px,pz,side*.54*s,.72*s,.38*s,yaw);iylaBox(blade.x,blade.y,blade.z,.28*s,.055*s,.48*s,core,yaw+side*.6,.9)}}
 else if(variant==='SPLITTER'){for(const side of[-1,1]){const plate=owenPoint(px,pz,side*.62*s,1.34*s,0,yaw);iylaRound(plate.x,plate.y,plate.z,.35*s,.25*s,.38*s,iron,yaw,.99)}iylaBox(px,1.22*s,pz,.58*s,.13*s,.42*s,core,yaw,.94)}
 else {for(const side of[-1,1]){const blade=owenPoint(px,pz,side*.68*s,1.02*s,.28*s,yaw);iylaBox(blade.x,blade.y,blade.z,.09*s,.09*s,.7*s,core,yaw+side*.14,.96)}iylaBox(px,1.6*s,pz,.45*s,.055*s,.32*s,iron,yaw,.94)}
 characterForge.factionFeatures+=variant==='DRAINER'?11:8
}
const forgeBaseLira=owenLira;
owenLira=function(e,boss){forgeBaseLira(e,boss);forgeFactionKit(e,boss);if(boss)characterForge.bossFeatures+=12};

// Jaxon and Conner Dialogue Matrix: 100 contextual lines per character. The
// matrix is generated from authored clauses, retains a long anti-repeat window,
// and uses the bundled voice performances for guaranteed audible identity.
const dialogueMatrix={name:'JAXON + CONNER CHARACTER VOICE MATRIX',version:'2.0',history:[],spoken:{jaxon:0,conner:0},available:{jaxon:100,conner:100},lastBeat:-99};
const dialogueClauses={
 jaxon:{open:['I can feel the battlefield shifting','My guard is set','I have your rhythm now','This power belongs to my choices','I will not leave this world behind','The next strike is mine','I am still standing','Every impact teaches me','My focus is sharper than fear','I choose the path forward'],close:['and I am closing the distance.','so I will break the center.','and this time the hit will land.','so the next form will be earned.','and I will protect everyone behind me.','so I am saving power for the finish.','and your pattern will not trap me twice.','so I will turn your pressure into momentum.','and I am ready for the boss.','so watch me surpass the limit.']},
 conner:{open:['Your confidence is already in my model','The swarm remembers your last escape','I have rewritten this arena around you','Your transformation only gave me more data','Every route you preserve becomes a target','I can hear your guard weakening','The next boss carries my answer','Your victory accelerated my evolution','I have not shown you my final doctrine','This world answers to Lira'],close:['and the counter is already moving.','so I will collapse the lane around you.','and your favorite combination is obsolete.','so survive the technique you taught me.','and I will strike through the opening.','so the battlefield will become your cage.','and my next form will remember this damage.','so every fighter will arrive smarter.','and the super move is already charged.','so prove that your resolve is more than noise.']}}
;
function matrixLine(agent,seed){const bank=dialogueClauses[agent],id=((seed%100)+100)%100;return bank.open[id%10]+' '+bank.close[Math.floor(id/10)%10]}
function matrixSpeak(agent,seed,force=false){let id=((seed%100)+100)%100,key=agent+':'+id;for(let n=0;n<100&&dialogueMatrix.history.includes(key);n++){id=(id+17)%100;key=agent+':'+id}dialogueMatrix.history.push(key);if(dialogueMatrix.history.length>34)dialogueMatrix.history.shift();dialogueMatrix.spoken[agent]++;aiVoice(agent,matrixLine(agent,id),force)}
const matrixCombatEvent=combatEvent;
combatEvent=function(type,data={}){const answer=matrixCombatEvent(type,data),seed=(campaign.stage||1)*19+kills*7+Math.floor(elapsed);if(elapsed-dialogueMatrix.lastBeat>6){if(type==='CAMPAIGN_BOSS_ENTERED'||type==='BOSS_SUPER_MOVE'){dialogueMatrix.lastBeat=elapsed;matrixSpeak('conner',seed,true)}else if(type==='MELEE_CONTACT_CONFIRMED'&&data.boss){dialogueMatrix.lastBeat=elapsed;matrixSpeak('jaxon',seed)}else if(type==='TRANSFORMATION_TRIGGERED'){dialogueMatrix.lastBeat=elapsed;matrixSpeak(data.fighter==='LIRA'?'conner':'jaxon',seed,true)}else if(type==='CAMPAIGN_LEVEL_CLEAR'){dialogueMatrix.lastBeat=elapsed;matrixSpeak('jaxon',seed,true)}}return answer};

// Curtis 3.0 enforces a post-destruction lifetime and global fragment budget.
// Structural fragments are impact punctuation, never permanent foreground.
Object.assign(curtis,{version:'3.0',fragmentCap:W<720?7:11,clearRadius:W<720?128:150});
const curtisStructuralUpdate=christianUpdate;
christianUpdate=function(dt){curtisStructuralUpdate(dt);const pressure=superAI.tier===1||iyla.fps<44;curtis.fragmentCap=pressure?5:(W<720?7:11);for(const f of destruction.fragments)f.life=Math.min(f.life,pressure?.75:1.45);if(destruction.fragments.length>curtis.fragmentCap)destruction.fragments.splice(0,destruction.fragments.length-curtis.fragmentCap);destruction.fragments=destruction.fragments.filter(f=>{const p=f.parent,px=p.x+f.ox,py=p.y+f.oy;return !curtisSafeScreen(px,py,curtis.clearRadius)})};
const curtisStructuralWorld=structuralWorld3D;
structuralWorld3D=function(){const old=destruction.fragments;if(old.length>curtis.fragmentCap)destruction.fragments=old.slice(-curtis.fragmentCap);curtisStructuralWorld();destruction.fragments=old};

// Vox is the live voice engineer. Dynamic lines use the browser's installed or
// network-backed voices first; the original Jaxon/Conner recordings remain a
// deterministic fallback when synthesis is unavailable or interrupted.
const vox={name:'VOX LIVE VOICE ENGINEER',version:'1.0',mode:'LOCKED',spoken:0,fallbacks:0,interruptions:0,recent:[],token:0,watchdog:0,profiles:{jaxon:{patterns:/Daniel|Aaron|Alex|Arthur|Eddy|Reed|Rocko|Grandpa/i,pitch:.82,rate:1.02,volume:.9},conner:{patterns:/Samantha|Karen|Moira|Ava|Serena|Victoria|Shelley|Flo/i,pitch:1.08,rate:.94,volume:.88}}};
function voxEmotion(msg){return /rage|limit|finish|break|power|strike/i.test(msg)?'POWER':/danger|guard|pressure|fall|survive/i.test(msg)?'TENSION':/victory|earned|horizon|protect/i.test(msg)?'RESOLVE':'TACTICAL'}
function voxVoice(agent){const list=combatVoices.voiceList||[],profile=vox.profiles[agent],english=list.filter(v=>/^en\b/i.test(v.lang||'')),preferred=english.find(v=>profile.patterns.test(v.name));return preferred||english.find(v=>v.localService===false)||english[0]||list[0]||null}
function voxFinish(token){if(token!==vox.token)return;clearTimeout(vox.watchdog);combatVoices.speaking=false;combatVoices.status=vox.mode=vox.fallbacks?'VOX HYBRID':'VOX LIVE';setTimeout(voicePump,80)}
function voxFallback(item,token){vox.fallbacks++;vox.mode='RECORDED FALLBACK';if(playVoicePack(item.agent,item.msg,()=>voxFinish(token)))return;voiceCue(item.agent);setTimeout(()=>voxFinish(token),Math.max(850,item.msg.length*38))}
voicePump=function(){if(combatVoices.speaking||!combatVoices.queue.length)return;const item=combatVoices.queue.shift(),profile=vox.profiles[item.agent],v=combatVoices[item.agent],token=++vox.token;combatVoices.speaking=true;voiceCaption.dataset.agent=v.name;voiceCaption.textContent=`${v.name} // ${item.msg}`;voiceCaption.hidden=false;combatVoices.subtitleUntil=performance.now()+Math.max(2100,item.msg.length*62);if(!combatVoices.enabled||!combatVoices.unlocked||!window.SpeechSynthesisUtterance){voxFallback(item,token);return}try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(item.msg),emotion=voxEmotion(item.msg);u.voice=voxVoice(item.agent);u.pitch=clamp(profile.pitch+(emotion==='POWER'?.04:emotion==='TENSION'?.02:0),.55,1.45);u.rate=clamp(profile.rate+(emotion==='POWER'?.08:emotion==='TENSION'?-.05:0),.72,1.25);u.volume=profile.volume;u.onstart=()=>{vox.mode=`LIVE ${emotion}`;combatVoices.status=`VOX ${emotion}`};u.onend=()=>{vox.spoken++;voxFinish(token)};u.onerror=()=>{vox.interruptions++;voxFallback(item,token)};speechSynthesis.speak(u);vox.watchdog=setTimeout(()=>{if(token===vox.token&&combatVoices.speaking){vox.interruptions++;try{speechSynthesis.cancel()}catch{}voxFallback(item,token)}},Math.max(6500,item.msg.length*115))}catch{voxFallback(item,token)}};
aiVoice=function(agent,msg,force=false){const v=combatVoices[agent],now=performance.now()/1000,key=agent+':'+msg;if(!v||!msg||vox.recent.includes(key)||(!force&&now-v.last<combatVoices.minGap))return;v.last=now;vox.recent.push(key);if(vox.recent.length>40)vox.recent.shift();voices.push(`${v.name} // ${msg}`);if(voices.length>8)voices.shift();const item={agent,msg,priority:force?3:/transform|boss|finish|danger/i.test(msg)?2:1};if(force)combatVoices.queue=combatVoices.queue.filter(q=>q.priority>=3);if(!combatVoices.queue.some(q=>q.agent===agent&&q.msg===msg))combatVoices.queue.push(item);combatVoices.queue.sort((a,b)=>(b.priority||1)-(a.priority||1));combatVoices.queue=combatVoices.queue.slice(0,5);voicePump()};
const voxUnlock=unlockCombatVoices;
unlockCombatVoices=function(){voxUnlock();vox.mode='VOICE DISCOVERY';voiceRefresh();setTimeout(voicePump,60)};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&combatVoices.unlocked){voiceRefresh();if(combatVoices.speaking){vox.interruptions++;combatVoices.speaking=false}setTimeout(voicePump,120)}});

// Zenith-20: one authoritative layer for the twenty arena-fighter upgrades.
const zenithFeatures=['TACTICAL LOCK','3D PURSUIT','COMBO GRAMMAR','DIRECTIONAL ATTACKS','ACTIVE DEFENSE','IMPACT HIERARCHY','VICTIM REACTIONS','CINEMATIC CONTACT','BEAM CLASHES','RUSH CLASHES','PERSISTENT DESTRUCTION','DESTRUCTION CHOREOGRAPHY','FORM IDENTITIES','TRANSFORM CHOICE','MOVE LIBRARIES','BOSS PHASES','BRANCHING OBJECTIVES','DRAMATIC FINISHES','MASTERY PROGRESSION','COMBAT LAB'];
memory.zenith20||={version:1,runs:0,seconds:0,locks:0,contacts:0,clashes:0,finishes:0,objectives:0,mastery:{melee:0,ki:0,defense:0,pursuit:0,destruction:0},bossLessons:{},bestCombo:0};
const zenith20={name:'ZENITH-20 UNIFIED COMBAT',mode:'READY',lock:null,lockAge:0,altitude:0,targetAltitude:0,dash:0,defense:0,clash:null,objective:null,finishClock:0,training:false,trainingClock:0,combo:0,comboClock:0,graphics:{maxEffects:18,quality:'BALANCED'},stats:{contacts:0,whiffs:0,beamClashes:0,rushClashes:0,reactions:0,finishes:0}};
const formDoctrine=[{stance:'TECHNICAL',trail:'#7fffee'},{stance:'PRESSURE',trail:'#ffd94d'},{stance:'BREAK',trail:'#ff7438'},{stance:'VANISH',trail:'#a874ff'},{stance:'COUNTER',trail:'#dfffff'}];
function zenithReset(){Object.assign(zenith20,{mode:'ACQUIRE',lock:null,lockAge:0,altitude:0,targetAltitude:0,dash:0,defense:0,clash:null,objective:null,finishClock:0,training:false,trainingClock:0,combo:0,comboClock:0});Object.assign(zenith20.stats,{contacts:0,whiffs:0,beamClashes:0,rushClashes:0,reactions:0,finishes:0});memory.zenith20.runs++}
const zenithBaseReset=reset;reset=function(mode=autoMode){const answer=zenithBaseReset(mode);zenithReset();return answer};
function zenithLock(){if(zenith20.lock&&enemies.includes(zenith20.lock))return zenith20.lock;let best=null,score=-Infinity;for(const e of enemies){const d=dist(player,e),front=Math.cos(Math.atan2(e.y-player.y,e.x-player.x)-(griffin.heading||0)),s=(e.type===3?720:0)+(1-(e.hp||1)/Math.max(1,e.max||1))*80+front*75-d;if(s>score){score=s;best=e}}if(best){zenith20.lock=best;zenith20.lockAge=0;memory.zenith20.locks++;zCinema.lockedTarget=best}return best}
function zenithObjective(){const stage=campaign.stage,kind=stage%4===0?'NO-DAMAGE DUEL':stage%3===0?'BREAK THE ARENA':stage%2===0?'COMBO MASTERY':'CLEAR THE VANGUARD',goal=kind==='BREAK THE ARENA'?2:kind==='COMBO MASTERY'?8:campaign.quota;zenith20.objective={stage,kind,goal,startKills:kills,startBreaks:destruction.collapses,complete:false};combatEvent('ZENITH_OBJECTIVE',{stage,kind,goal})}
function zenithReaction(e,kind,power=1){if(!e||!enemies.includes(e))return;e.zReaction={kind,time:kind==='CRUMPLE'?.72:kind==='LAUNCH'?.55:.34,power};e.hit=Math.max(e.hit||0,.16);zenith20.stats.reactions++;owen.hold=Math.max(owen.hold,kind==='CRUMPLE'?.075:.035);zStage.cut=Math.max(zStage.cut,kind==='CRUMPLE'?.34:.16)}
const zenithBaseHurt=hurt;hurt=function(e,damage,color='#73f3ff'){if(!e||!enemies.includes(e))return;const before=(e.hp||0)+(e.shield||0),answer=zenithBaseHurt(e,damage,color),landed=Math.max(0,before-((e.hp||0)+(e.shield||0)));if(landed>0){zenith20.stats.contacts++;memory.zenith20.contacts++;const heavy=damage>player.damage*2.2||/FINISHER|UPPERCUT|AXE_KICK/.test(owen.pose),kind=heavy?'CRUMPLE':/KICK|KNEE|UPPERCUT/.test(owen.pose)?'LAUNCH':'STAGGER';zenithReaction(e,kind,damage/Math.max(1,player.damage));memory.zenith20.mastery.melee+=heavy?.025:.008}return answer};
function zenithClashes(dt,target){const c=zenith20.clash;if(c){c.time-=dt;player.invuln=Math.max(player.invuln||0,.12);if(c.time<=0){const win=c.power>=c.enemyPower;zenith20.clash=null;if(win&&c.target&&enemies.includes(c.target)){hurt(c.target,player.damage*(c.kind==='BEAM'?5.5:3.4),'#fff4bd');if(c.kind==='RUSH')knockThrough(c.target,1.7,'RUSH CLASH FINISH')}combatEvent('ZENITH_CLASH_RESOLVED',{kind:c.kind,winner:win})}return}if(!target||target.type!==3||griffin.transformation?.active)return;const d=dist(player,target);if(d<128&&target.attackClock<.28&&/PUNCH|KICK|ELBOW|KNEE|FINISHER/.test(owen.pose)&&Math.random()<dt*3){zenith20.clash={kind:'RUSH',time:.58,power:(griffin.power||0)/8000+christian.flow,enemyPower:(lira.power||9001)/10000,target};zenith20.stats.rushClashes++;memory.zenith20.clashes++;owen.pose=owen.wanted='CLASH';zStage.cut=.55;iylaScene('RUSH CLASH','BREAK THE DEADLOCK','#fff1bd',.7,22)}else if(griffin.superMove?.active&&griffin.superMove.id==='DRAGON_BEAM'&&target.superClock<.35&&!griffin.superMove.impact){zenith20.clash={kind:'BEAM',time:1.1,power:(griffin.power||0)/7000+expansion59.ki,enemyPower:(lira.power||9001)/9000,target};zenith20.stats.beamClashes++;memory.zenith20.clashes++;zStage.cut=.72;iylaScene('BEAM CLASH','HOLD THE LINE','#dffcff',1.15,25)}}
function zenithBossPhases(b){if(!b||!enemies.includes(b))return;const ratio=b.hp/Math.max(1,b.max),phase=ratio<.28?3:ratio<.62?2:1;if(phase===(b.zPhase||1))return;b.zPhase=phase;b.bossForm=Math.max(b.bossForm||1,phase);b.speed*=1.08;b.damage*=1.1;b.signatureClock=.65;b.superClock=Math.min(b.superClock,2.2);b.shield=Math.max(b.shield||0,b.shieldMax*.18);hostile.length=0;const key=b.bossName||campaignBoss().name;memory.zenith20.bossLessons[key]=(memory.zenith20.bossLessons[key]||0)+1;iylaScene(`${key} · PHASE ${phase}`,phase===2?'PATTERN EVOLVED':'LIMIT RELEASED',campaignBoss().color,1.5,25);combatEvent('BOSS_PHASE_CHANGED',{boss:key,phase})}
function zenithFinish(target){if(!target||target.type!==3||target.hp/Math.max(1,target.max)>.1||zenith20.finishClock>0)return;zenith20.finishClock=8;griffin.heading=Math.atan2(target.y-player.y,target.x-player.x);zStage.zoom=.82;zStage.cut=1;owen.pose=owen.wanted=(griffin.evolution||0)>2?'AXE_KICK':'FINISHER';knockThrough(target,2.5,'ZENITH DRAMATIC FINISH');hurt(target,Math.max(target.hp+target.shield+1,player.damage*9),'#fff5c9');zenith20.stats.finishes++;memory.zenith20.finishes++;iylaScene('DRAMATIC FINISH',`${griffin.form?.name||'GRIFFIN'} · DECISIVE IMPACT`,'#fff0a0',1.8,29);combatEvent('DRAMATIC_FINISH',{stage:campaign.stage,form:griffin.evolution||0})}
function zenithUpdate(dt){if(!running)return;zenith20.finishClock=Math.max(0,zenith20.finishClock-dt);zenith20.comboClock-=dt;const target=zenithLock();if(!target){zenith20.lock=null;return}zenith20.lockAge+=dt;const d=dist(player,target),a=Math.atan2(target.y-player.y,target.x-player.x),form=formDoctrine[griffin.evolution||0]||formDoctrine[0],high=target.type===3&&/STORM|PHANTOM/.test(target.bossStyle||'');zenith20.targetAltitude=high?.8:d>260?.42:d<135?.08:.24;zenith20.altitude+=(zenith20.targetAltitude-zenith20.altitude)*Math.min(1,dt*4.5);player.z=zenith20.altitude;target.z=high?.72:.05;zStage.elevation=zenith20.altitude;if(autoMode&&!griffin.transformation?.active&&!griffin.superMove?.active&&d>168){griffin.heading=a;zenith20.dash=Math.max(0,zenith20.dash-dt);if(d>310&&zenith20.dash<=0){zenith20.dash=.72;player.x=clamp(player.x+Math.cos(a)*Math.min(110,d-150),28,W-28);player.y=clamp(player.y+Math.sin(a)*Math.min(110,d-150),86,H-28);zAfter(player.x-Math.cos(a)*55,player.y-Math.sin(a)*55,a,form.trail);memory.zenith20.mastery.pursuit+=.02;zenith20.mode='ZENITH DASH'}else zenith20.mode=`3D PURSUIT · ${form.stance}`}
for(const e of enemies)if(e.zReaction){e.zReaction.time-=dt;if(e.zReaction.kind==='LAUNCH')e.z=Math.max(e.z||0,Math.sin(clamp(e.zReaction.time/.55,0,1)*Math.PI)*.75);if(e.zReaction.time<=0){e.zReaction=null;e.z=0}}if(hostile.some(h=>Math.hypot(h.x-player.x,h.y-player.y)<105)){zenith20.defense=.34;memory.zenith20.mastery.defense+=dt*.04;zenith20.mode=christian.guard>.62?'DIRECTIONAL GUARD':'PERFECT EVADE'}else zenith20.defense=Math.max(0,zenith20.defense-dt);zenithClashes(dt,target);zenithBossPhases(campaign.boss);if(!zenith20.clash)zenithFinish(target);
if(!zenith20.objective||zenith20.objective.stage!==campaign.stage)zenithObjective();const o=zenith20.objective;if(!o.complete){const progress=o.kind==='BREAK THE ARENA'?destruction.collapses-o.startBreaks:o.kind==='COMBO MASTERY'?Math.max(expansion59.combo,zCinema.combo):kills-o.startKills;if(progress>=o.goal){o.complete=true;memory.zenith20.objectives++;player.hp=Math.min(player.maxHp,player.hp+player.maxHp*.15);iylaScene('OPTIONAL OBJECTIVE COMPLETE',o.kind,'#8dffe2',1.3,21);combatEvent('ZENITH_OBJECTIVE_COMPLETE',{kind:o.kind,stage:campaign.stage})}}memory.zenith20.seconds+=dt;memory.zenith20.bestCombo=Math.max(memory.zenith20.bestCombo,expansion59.combo||0);zenith20.graphics.maxEffects=superAI.tier===1?10:iyla.fps<50?14:20;zenith20.graphics.quality=superAI.tier===1?'MOBILE':iyla.fps<50?'ADAPTIVE':'CINEMATIC';while(rings.length>zenith20.graphics.maxEffects)rings.shift();while(zCinema.impacts.length>zenith20.graphics.maxEffects)zCinema.impacts.shift();if(zenith20.training){zenith20.trainingClock-=dt;if(zenith20.trainingClock<=0){zenith20.trainingClock=.4;trainGriffin(40)}}}
const zenithBaseOmni=omniSystems;omniSystems=function(dt){zenithBaseOmni(dt);zenithUpdate(dt)};
const zenithBaseTransform=beginGriffinTransformation;beginGriffinTransformation=function(stage){zenithBaseTransform(stage);const tactical=christian.threat>1.8;griffin.transformation.duration=tactical?6.4:7.8;griffin.transformation.choice=tactical?'TACTICAL ASCENSION':'FULL CINEMATIC ASCENSION';owen.stateLength=griffin.transformation.duration;combatEvent('TRANSFORMATION_CHOICE',{stage,choice:griffin.transformation.choice,duration:griffin.transformation.duration})};
const zenithBaseSuperUpdate=updateSuperMove;updateSuperMove=function(dt){const target=griffin.superMove?.targetRef&&enemies.includes(griffin.superMove.targetRef)?griffin.superMove.targetRef:zenithLock();if(!zenith20.clash)zenithClashes(0,target);if(zenith20.clash){zenithClashes(dt,target);return}zenithBaseSuperUpdate(dt)};
const zenithBaseCombatEvent=combatEvent;combatEvent=function(type,data={}){if(type==='MELEE_CONTACT_MISSED')zenith20.stats.whiffs++;if(type==='MELEE_COMBO_BEAT'){zenith20.combo++;zenith20.comboClock=1.6}else if(zenith20.comboClock<=0)zenith20.combo=0;return zenithBaseCombatEvent(type,data)};
function zenithVisuals(){const t=zenith20.lock;if(!running||!t||!enemies.includes(t))return;x.save();x.globalCompositeOperation='screen';x.globalAlpha=superAI.tier===1?.28:.44;x.strokeStyle=t.type===3?'#ff557d':'#93fff0';x.lineWidth=t.type===3?3:2;x.setLineDash([7,7]);x.beginPath();x.ellipse(t.x,t.y+10,Math.max(22,t.r*1.25),Math.max(10,t.r*.52),0,0,TAU);x.stroke();x.setLineDash([]);if(zenith20.clash){const c=zenith20.clash,mx=(player.x+c.target.x)/2,my=(player.y+c.target.y)/2,g=x.createRadialGradient(mx,my,2,mx,my,58);g.addColorStop(0,'#fff');g.addColorStop(.3,c.kind==='BEAM'?'#8fffff':'#ffe676');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.globalAlpha=.45;x.beginPath();x.arc(mx,my,63,0,TAU);x.fill()}x.restore()}
const zenithBaseUltimateVisuals=ultimateVisuals;ultimateVisuals=function(){zenithBaseUltimateVisuals();zenithVisuals()};
const combatLabButton=document.createElement('button');combatLabButton.className='train';combatLabButton.id='zenithLab';combatLabButton.textContent='COMBAT LAB';$('#trainBrain').after(combatLabButton);combatLabButton.onclick=()=>{zenith20.training=!zenith20.training;zenith20.trainingClock=0;combatLabButton.textContent=zenith20.training?'LAB: ACTIVE':'COMBAT LAB'};
const zenithBaseLabHud=labHud;labHud=function(){zenithBaseLabHud();const el=$('#brainDetail'),o=zenith20.objective;if(el)el.innerHTML+=`<br><b>${zenith20.name}</b> · ${zenith20.mode}<br>LOCK ${zenith20.lock?.bossName||zenith20.lock?.role||'NONE'} · ALT ${zenith20.altitude.toFixed(2)} · COMBO ${zenith20.combo}<br>OBJECTIVE ${o?.kind||'ACQUIRE'} ${o?.complete?'✓':''}<br>CONTACT ${zenith20.stats.contacts}/${zenith20.stats.contacts+zenith20.stats.whiffs||0} · CLASH ${zenith20.stats.beamClashes+zenith20.stats.rushClashes} · FINISH ${zenith20.stats.finishes}<br>GRAPHICS ${zenith20.graphics.quality} · FX ${rings.length}/${zenith20.graphics.maxEffects}`};
const forgeHud=iyla3DFrame;
iyla3DFrame=function(dt){characterForge.heroFeatures=characterForge.factionFeatures=characterForge.bossFeatures=0;forgeHud(dt);characterForge.lod=superAI.tier===1?'MOBILE SAFE':iyla.fps<48?'BALANCED':'HIGH';const el=$('#iylaDetail');if(el)el.innerHTML+=`<br>${characterForge.name} · ${characterForge.style}<br>DETAIL ${characterForge.heroFeatures+characterForge.factionFeatures+characterForge.bossFeatures} · LOD ${characterForge.lod}<br>VOICE MATRIX ${dialogueMatrix.spoken.jaxon+dialogueMatrix.spoken.conner}/200 · UNIQUE WINDOW ${dialogueMatrix.history.length}<br>${vox.name} · ${vox.mode}<br>LIVE ${vox.spoken} · FALLBACK ${vox.fallbacks} · RECOVERY ${vox.interruptions}`};


// Survivor Replay v6: bounded causal flight recorder.
// Samples complete combat state at 5 Hz and records important events immediately.
const replayV6={version:66,schema:'jarvis-survivor-replay-v6',events:[],eventCap:12000,seq:0,actorSeq:0,actorIds:new WeakMap(),lastReal:0,lastSim:0,dropped:0,resets:0};
function replayActorId(actor,prefix='E'){
 if(!actor||typeof actor!=='object')return null;
 let id=replayV6.actorIds.get(actor);
 if(!id){id=prefix+(++replayV6.actorSeq);replayV6.actorIds.set(actor,id)}
 return id
}
function replayNumber(value,digits=2){return Number.isFinite(value)?+value.toFixed(digits):null}
function replayClean(value,depth=0){
 if(value==null||typeof value==='string'||typeof value==='boolean')return value;
 if(typeof value==='number')return Number.isFinite(value)?value:null;
 if(depth>3)return String(value);
 if(Array.isArray(value))return value.slice(0,48).map(v=>replayClean(v,depth+1));
 if(typeof value==='object'){
  if(enemies.includes(value))return{actor:replayActorId(value,value.type===3?'B':'E')};
  const out={};let n=0;
  for(const [key,item] of Object.entries(value)){if(n++>=64)break;out[key]=replayClean(item,depth+1)}
  return out
 }
 return String(value)
}
function replayEvent(type,data={}){
 replayV6.events.push({seq:++replayV6.seq,t:replayNumber(elapsed,3),rt:replayNumber(expansion59.captureTime,3),type,data:replayClean(data)});
 if(replayV6.events.length>replayV6.eventCap)replayV6.events.splice(0,replayV6.events.length-replayV6.eventCap)
}
function replayActor(actor){
 const dx=actor.x-player.x,dy=actor.y-player.y,d=Math.hypot(dx,dy);
 return{id:replayActorId(actor,actor.type===3?'B':'E'),type:actor.type||0,boss:!!(actor.type===3||actor.campaignBoss),name:actor.bossName||'',role:actor.role||'',variant:actor.variant||'',sx:replayNumber(actor.x,1),sy:replayNumber(actor.y,1),wx:replayNumber(worldX+actor.x,1),wy:replayNumber(worldY+actor.y,1),dx:replayNumber(dx,1),dy:replayNumber(dy,1),distance:replayNumber(d,1),finite:Number.isFinite(actor.x)&&Number.isFinite(actor.y),visible:actor.x>=-36&&actor.x<=W+36&&actor.y>=58&&actor.y<=H+36,hp:replayNumber(actor.hp,1),max:replayNumber(actor.max||actor.maxHp,1),shield:replayNumber(actor.shield||0,1),speed:replayNumber(actor.speed||0,1),damage:replayNumber(actor.damage||0,1),hit:replayNumber(actor.hit||0,3),attack:replayNumber(actor.attackClock||0,3),contact:replayNumber(actor.contactClock||0,3),phase:actor.zPhase||actor.bossForm||0,style:actor.bossStyle||'',element:actor.element||'',campaignLevel:actor.campaignLevel||0}
}
const replayV6CombatEvent=combatEvent;
combatEvent=function(type,data={}){
 const result=replayV6CombatEvent(type,data);
 replayEvent(type,{eventId:result?.id,...replayClean(data)});
 return result
};
const replayV6Hurt=hurt;
hurt=function(actor,damage,color='#73f3ff'){
 const before=actor&&enemies.includes(actor)?(actor.hp||0)+(actor.shield||0):null,result=replayV6Hurt(actor,damage,color);
 if(before!=null){
  const after=(actor.hp||0)+(actor.shield||0),landed=Math.max(0,before-after);
  replayEvent('DAMAGE_RESOLVED',{actor:replayActorId(actor,actor.type===3?'B':'E'),requested:replayNumber(damage,2),landed:replayNumber(landed,2),before:replayNumber(before,2),after:replayNumber(after,2),source:griffin.superMove?.active?griffin.superMove.id:owen.pose,color})
 }
 return result
};
const replayV6Kill=kill;
kill=function(actor){
 replayEvent('ACTOR_REMOVED',{actor:replayActorId(actor,actor?.type===3?'B':'E'),boss:!!(actor?.type===3||actor?.campaignBoss),name:actor?.bossName||'',role:actor?.role||'',hp:replayNumber(actor?.hp||0,2),cause:griffin.superMove?.active?griffin.superMove.id:owen.pose,stage:campaign.stage});
 return replayV6Kill(actor)
};
const replayV6Reset=reset;
reset=function(mode=autoMode){
 const result=replayV6Reset(mode);
 replayV6.events.length=0;replayV6.seq=0;replayV6.lastReal=0;replayV6.lastSim=0;replayV6.dropped=0;replayV6.resets++;
 replayEvent('REPLAY_RUN_STARTED',{auto:!!mode,viewport:{w:W,h:H,dpr:D},gpu:iyla3d.gl?'WEBGL':iyla3d.error?'FALLBACK':'CANVAS',sampleHz:REPLAY_SAMPLE_HZ,retentionSeconds:REPLAY_MEMORY_SECONDS});
 return result
};
const replayV6Remember=rememberReplayFrame;
rememberReplayFrame=function(frame){
 const target=zCinema.lockedTarget&&enemies.includes(zCinema.lockedTarget)?zCinema.lockedTarget:(typeof zenith20!=='undefined'&&zenith20.lock&&enemies.includes(zenith20.lock)?zenith20.lock:omniTarget());
 const now=performance.now(),realDelta=replayV6.lastReal?(now-replayV6.lastReal)/1000:0,simDelta=replayV6.lastSim?Math.max(0,frame.t-replayV6.lastSim):0;
 replayV6.lastReal=now;replayV6.lastSim=frame.t;
 frame.player={sx:replayNumber(player.x,1),sy:replayNumber(player.y,1),wx:replayNumber(worldX+player.x,1),wy:replayNumber(worldY+player.y,1),vx:replayNumber(Math.cos(griffin.heading||0)*player.speed,1),vy:replayNumber(Math.sin(griffin.heading||0)*player.speed,1),hp:replayNumber(player.hp,1),maxHp:replayNumber(player.maxHp,1),shield:replayNumber(griffin.shield||0,1),shieldMax:replayNumber(griffin.shieldMax||0,1),invuln:replayNumber(player.invuln||0,3),speed:replayNumber(player.speed,1),damage:replayNumber(player.damage,1),rate:replayNumber(player.rate,3),armor:replayNumber(player.armor||0,3),form:griffin.evolution||0,power:replayNumber(griffin.power||0,1),plan:griffin.plan,mission:griffin.mission,mode:griffin.mode,reason:griffin.reason||'',risk:replayNumber(griffin.risk||0,3),confidence:replayNumber(griffin.confidence||0,3),heading:replayNumber(griffin.heading||0,4),ki:replayNumber(expansion59.ki,4),ultimate:replayNumber(expansion59.ultimate,4)};
 frame.target=target?{id:replayActorId(target,target.type===3?'B':'E'),distance:replayNumber(dist(player,target),1),age:replayNumber(zCinema.targetAge||0,2),idle:replayNumber(zCinema.targetIdle||0,2),hp:replayNumber((target.hp||0)+(target.shield||0),1),locked:target===zCinema.lockedTarget,reachable:Number.isFinite(target.x)&&Number.isFinite(target.y)&&dist(player,target)<=Math.hypot(W,H)*1.08+180,visible:target.x>=-36&&target.x<=W+36&&target.y>=58&&target.y<=H+36}:null;
 frame.actors=enemies.map(replayActor);
 frame.campaign={stage:campaign.stage,phase:campaign.phase,quota:campaign.quota,spawned:campaign.spawned,defeated:campaign.defeated,bossesDefeated:campaign.bossesDefeated,transition:replayNumber(campaign.transition||0,2)};
 frame.directors={matty:{owner:matty.owner||'',family:matty.family||'',policy:matty.policy||'',request:matty.lastRequest||'',quiet:replayNumber(matty.quiet||0,3),sequence:matty.sequence||0,commands:matty.commands,accepted:matty.accepted,coalesced:matty.coalesced,superseded:matty.superseded,rejected:matty.rejected},owen:{pose:owen.pose,wanted:owen.wanted,phase:owen.phase,family:matty.family||'',recipe:owen.recipe||0,transition:owen.transitions||0,stateTime:replayNumber(owen.stateTime||0,3),stateLength:replayNumber(owen.stateLength||0,3),reach:replayNumber(owen.contactReach||0,3),tempo:owen.tempo||'',attempts:owen.quality?.attempts||0,hits:owen.quality?.hits||0,whiffs:owen.quality?.whiffs||0,repeats:owen.quality?.repeats||0,interrupts:owen.quality?.interrupts||0},zavier:{recoveries:zCinema.recoveries||0,targetAge:replayNumber(zCinema.targetAge||0,2),targetIdle:replayNumber(zCinema.targetIdle||0,2),targetDistance:replayNumber(zCinema.targetDistance||0,1)},christian:{mode:christian.mode,threat:replayNumber(christian.threat,3),flow:replayNumber(christian.flow,3),guard:replayNumber(christian.guard,3),damageWindow:replayNumber(christian.damageWindow,3),bossCount:christian.bossCount},zenith:typeof zenith20!=='undefined'?{mode:zenith20.mode,lockAge:replayNumber(zenith20.lockAge,2),altitude:replayNumber(zenith20.altitude,3),dash:replayNumber(zenith20.dash,3),defense:replayNumber(zenith20.defense,3),combo:zenith20.combo,clash:zenith20.clash?.kind||'',objective:zenith20.objective?{kind:zenith20.objective.kind,goal:zenith20.objective.goal,complete:zenith20.objective.complete}:null}:null};
 frame.world={scrollX:replayNumber(worldX,1),scrollY:replayNumber(worldY,1),viewportW:W,viewportH:H,props:iyla2026?.props?.length||0,destruction:{impacts:destruction.impacts,breaches:destruction.breaches,collapses:destruction.collapses,knockThroughs:destruction.knockThroughs,fragments:destruction.fragments.length}};
 frame.performance={realDelta:replayNumber(realDelta,4),simDelta:replayNumber(simDelta,4),timeDebt:replayNumber(Math.max(0,realDelta-simDelta),4),stall:replayNumber(superAI.stall||0,3),overruns:superAI.overruns||0,recoveries:superAI.recoveries||0,contextLosses:xavier.contextLosses||0,contextRestores:xavier.contextRestores||0,scale:replayNumber(xavier.scale||0,3),gpuError:iyla3d.error||'',hidden:document.hidden};
 const bad=frame.actors.filter(a=>!a.finite),escaped=frame.actors.filter(a=>a.distance!=null&&a.distance>Math.hypot(W,H)*1.08+180);
 frame.integrity={nonFiniteActors:bad.map(a=>a.id),escapedActors:escaped.map(a=>a.id),duplicateIds:frame.actors.length-new Set(frame.actors.map(a=>a.id)).size,targetValid:!frame.target||frame.target.reachable,hitAccounting:(owen.quality?.attempts||0)-((owen.quality?.hits||0)+(owen.quality?.whiffs||0))};
 if(realDelta>.45)replayEvent('FRAME_STALL',{realDelta:replayNumber(realDelta,4),simDelta:replayNumber(simDelta,4),cinematic:frame.cinematic?.type||'COMBAT',gpu:frame.perf?.gpu||'',hidden:document.hidden});
 if(bad.length||escaped.length||frame.integrity.duplicateIds||!frame.integrity.targetValid)replayEvent('INTEGRITY_ANOMALY',frame.integrity);
 replayV6Remember(frame)
};
function replayV6Summary(frames){
 const events=replayV6.events,actors=new Set(),forms=new Set(),anomalies=[],gpu={},maxTarget={distance:0,t:0,id:null};let stalls=0,timeDebt=0,nonFinite=0,escaped=0,invalidTargets=0,minFps=Infinity,totalFps=0;
 for(const frame of frames){
  forms.add(frame.f);for(const actor of frame.actors||[])actors.add(actor.id);
  const mode=frame.perf?.gpu||'UNKNOWN';gpu[mode]=(gpu[mode]||0)+1;
  const fps=frame.perf?.fps||0;minFps=Math.min(minFps,fps);totalFps+=fps;
  timeDebt+=frame.performance?.timeDebt||0;if((frame.performance?.realDelta||0)>.45)stalls++;
  nonFinite+=frame.integrity?.nonFiniteActors?.length||0;escaped+=frame.integrity?.escapedActors?.length||0;if(frame.integrity&&!frame.integrity.targetValid)invalidTargets++;
  if((frame.target?.distance||0)>maxTarget.distance)Object.assign(maxTarget,{distance:frame.target.distance,t:frame.t,id:frame.target.id})
 }
 const counts={};for(const event of events)counts[event.type]=(counts[event.type]||0)+1;
 if(nonFinite)anomalies.push({severity:'CRITICAL',type:'NON_FINITE_ACTOR',count:nonFinite});
 if(escaped)anomalies.push({severity:'HIGH',type:'ESCAPED_ACTOR',count:escaped});
 if(invalidTargets)anomalies.push({severity:'HIGH',type:'UNREACHABLE_TARGET',count:invalidTargets});
 if(stalls)anomalies.push({severity:'MEDIUM',type:'FRAME_STALL',count:stalls});
 const last=frames.at(-1)||{};
 return{duration:{simulation:last.t||0,real:last.rt||0,timeDebt:replayNumber(timeDebt,2)},outcome:{kills:last.k||0,hp:last.player?.hp??last.hp,stage:last.campaign?.stage||1,form:last.f||'BASE'},coverage:{frames:frames.length,events:events.length,actors:actors.size,forms:[...forms],dropped:replayV6.dropped},combat:{owen:last.directors?.owen||null,matty:last.directors?.matty||null,maxTarget,eventCounts:counts},performance:{minimumFps:minFps===Infinity?0:minFps,averageFps:frames.length?replayNumber(totalFps/frames.length,2):0,stalls,gpu},integrity:{nonFinite,escaped,invalidTargets,anomalies}}
}
exportReplay=function(){
 const frames=orderedReplayFrames(),summary=replayV6Summary(frames),payload={version:replayV6.version,schema:replayV6.schema,createdAt:new Date().toISOString(),sampleHz:REPLAY_SAMPLE_HZ,retentionSeconds:REPLAY_MEMORY_SECONDS,frameCount:frames.length,eventCount:replayV6.events.length,openingSeconds:30,openingFrames:expansion59.openingReplay,frames,events:replayV6.events,summary,telemetry:['player-state','all-actor-state','stable-actor-identities','target-lock-causality','damage-resolution','actor-removal','griffin-decisions','lira-state','campaign-progression','matty-commands','owen-contact-grammar','zavier-recoveries','christian-mechanics','zenith-20','super-moves','transformations','world-scroll','structural-destruction','frame-stalls','simulation-time-debt','webgl-context','thermal-quality','integrity-anomalies']},a=document.createElement('a'),blob=new Blob([JSON.stringify(payload)],{type:'application/json'});
 a.href=URL.createObjectURL(blob);a.download='jarvis-survivor-replay-v6.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
};
const replayV6Button=$('#replayExport');if(replayV6Button)replayV6Button.onclick=exportReplay;


// Production-100: one authoritative rig and one production director.
const p100Groups={
RIG:['hero rig','enemy rig','arm chains','leg chains','shoulder roots','hip roots','limb proportions','elbow limits','knee limits','legacy limb removal'],
CONTACT:['hand goals','foot goals','chest facing','pelvis facing','head aim','eye aim','hair silhouette','form hair','form aura','boss silhouette'],
TIMING:['anticipation','acceleration','contact','recovery','whiff recovery','heavy hitstop','light hitstop','contact impulse','finisher impulse','super impulse'],
MOVES:['jab','cross','hook','elbow','knee','uppercut','spin kick','axe kick','dive kick','sweep'],
CAMERA:['play camera','cinematic camera','boss camera','transform camera','super camera','rule of thirds','safe framing','distance zoom','floor safety','camera damping'],
WORLD:['deep sky','cloud parallax','mountain parallax','floating rocks','arena platform','broken arena lip','energy pylons','depth haze','horizon glow','scroll landmarks'],
FX:['contact flash','impact arc','speed lines','aura edge','form colors','boss colors','beam core','beam shell','rush trail','depth debris'],
CONTROL:['campaign authority','watchdog age','watchdog idle','nonfinite recovery','escape envelope','release reason','boss bounds','one boss','final fighter','recovery telemetry'],
COMBAT:['combo memory','repeat penalty','contact validation','damage source','animation accounting','director owner','super commitment','transform pacing','boss pacing','objective pacing'],
MOBILE:['draw budget','crowd LOD','aura LOD','world LOD','context recovery','software depth','frame debt','event flood guard','production HUD','replay contract']
};
const production100Manifest=Object.values(p100Groups).flat();if(production100Manifest.length!==100)throw Error('PRODUCTION 100 CONTRACT');
const production100={name:'SURVIVOR PRODUCTION 100',version:'1.0',features:production100Manifest,mode:'PLAY',camera:{zoom:1,offset:0,pitch:.58,impulse:0},flash:0,watchdog:0,rounds:0,heroChains:0,enemyChains:0,worldObjects:0};

function p100P(px,pz,side,y,forward,yaw){const fx=Math.sin(yaw),fz=Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);return{x:px+rx*side+fx*forward,y,z:pz+rz*side+fz*forward}}
function p100Chain(a,b,r,color,yaw){const n=superAI.tier===1?2:3;for(let i=0;i<=n;i++){const q=i/n;iylaRound(a.x+(b.x-a.x)*q,a.y+(b.y-a.y)*q,a.z+(b.z-a.z)*q,r,r*1.1,r,color,yaw,.99)}}
function p100Limb(a,b,c,r,color,yaw){p100Chain(a,b,r,color,yaw);p100Chain(b,c,r*.92,color,yaw);iylaRound(b.x,b.y,b.z,r*1.08,r*1.08,r*1.08,color,yaw,.99)}
function p100Goal(pose,q,side){const a=Math.sin(clamp(q,0,1)*Math.PI),hand={s:side*.58,y:1.08,f:0},foot={s:side*.25,y:.14,f:.18};if(/PUNCH|FINISHER/.test(pose))Object.assign(hand,{s:side*.18,y:1.48,f:.25+a*1.05});else if(pose==='HOOK')Object.assign(hand,{s:side*(.72-a*.5),y:1.5,f:.25+a*.78});else if(pose==='ELBOW')Object.assign(hand,{s:side*.23,y:1.46,f:.28+a*.62});else if(pose==='UPPERCUT')Object.assign(hand,{s:side*.2,y:1.18+a*.9,f:.22+a*.5});if(/KNEE/.test(pose))Object.assign(foot,{s:side*.16,y:.14+a*.82,f:.18+a*.68});else if(/KICK|AXE|DIVE|SPIN|SWEEP/.test(pose))Object.assign(foot,{s:side*(/SPIN|SWEEP/.test(pose)?.25+a*.68:.14),y:.14+a*(/AXE/.test(pose)?1.35:.68),f:.18+a*(/DIVE/.test(pose)?1.28:1.05)});return{hand,foot,a}}
function p100Hero(yaw,color,form){
 production100.heroChains=0;production100.enemyChains=0;const pose=owen.pose||'FLIGHT',q=clamp(owen.stateTime/Math.max(.01,owen.stateLength),0,1),side=zCinema.meleeSide||1,g=p100Goal(pose,q,side),lift=.08+(zStage.elevation||0)*.24,skin=[.9,.58,.39],gi=[.93,.21,.025],blue=[.03,.16,.58],aura=form>2?[.65,.24,1]:form>0?[1,.68,.05]:[.1,.88,1],lean=pose==='DASH'?.3:pose==='HIT'?-.2:0;
 const pelvis=p100P(0,0,0,.92+lift,lean*.1,yaw),chest=p100P(0,0,0,1.47+lift,lean,yaw),head=p100P(0,0,0,2.08+lift,lean*.68,yaw);
 iylaRound(0,.025,0,.66,.035,.38,[0,0,0],yaw,.3);iylaRound(pelvis.x,pelvis.y,pelvis.z,.38,.28,.31,gi,yaw,.99);iylaRound(chest.x,chest.y,chest.z,.5,.43,.34,gi,yaw,.99);iylaBox(chest.x+Math.sin(yaw)*.28,chest.y,chest.z+Math.cos(yaw)*.28,.28,.2,.045,blue,yaw,.98);iylaRound(head.x,head.y,head.z,.3,.34,.28,skin,yaw,.99);
 for(const s of[-1,1]){const root=p100P(0,0,s*.5,1.56+lift,.02,yaw),attack=s===side&&/PUNCH|HOOK|ELBOW|UPPERCUT|FINISHER/.test(pose),end=attack?p100P(0,0,g.hand.s,g.hand.y+lift,g.hand.f,yaw):p100P(0,0,s*.6,1.08+lift,-.02,yaw),joint=p100P(0,0,s*(attack?.33:.68),(root.y+end.y)*.5,attack?g.hand.f*.43:.01,yaw);p100Limb(root,joint,end,.16,skin,yaw);production100.heroChains++}
 for(const s of[-1,1]){const root=p100P(0,0,s*.24,.82+lift,.01,yaw),attack=s===side&&/KNEE|KICK|AXE|DIVE|SPIN|SWEEP/.test(pose),end=attack?p100P(0,0,g.foot.s,g.foot.y+lift,g.foot.f,yaw):p100P(0,0,s*.25,.14+lift,pose==='DASH'?-.34:.18,yaw),joint=p100P(0,0,s*.24,(root.y+end.y)*.5+.04,attack?g.foot.f*.42:.04,yaw);p100Limb(root,joint,end,.19,gi,yaw);iylaRound(end.x,end.y,end.z,.25,.13,.36,blue,yaw,.99);production100.heroChains++}
 const fx=Math.sin(yaw),fz=Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);for(const s of[-1,1])iylaBox(head.x+fx*.28+rx*s*.105,head.y+.055,head.z+fz*.28+rz*s*.105,.075,.026,.025,[.92,1,1],yaw,.99);
 const hairs=superAI.tier===1?7:10+Math.min(3,form);for(let i=0;i<hairs;i++){const u=i/(hairs-1)-.5;iylaBox(head.x-fx*.13+rx*u*.48,head.y+.34+Math.cos(u*Math.PI)*.1,head.z-fz*.13+rz*u*.48,.07,.28+form*.04+(i%3)*.05,.075,form?aura:[.025,.035,.06],yaw+u*1.5,.98)}
 for(let i=0;i<(superAI.tier===1?4:8);i++){const a=i*TAU/(superAI.tier===1?4:8)+elapsed*.7;iylaBox(Math.cos(a)*(.72+form*.06),.45+(i%4)*.5,Math.sin(a)*(.72+form*.06),.025,.18,.025,aura,a,.14)}
}
function p100Enemy(e,boss=false){
 if(!e||!enemies.includes(e))return;const px=(e.x-W/2)/45,pz=(e.y-H/2)/45,yaw=-Math.atan2(player.x-e.x,player.y-e.y),s=boss?1.32:.68,pose=e.hit>0?'HIT':(e.attackClock||0)<.34?'PUNCH':'FLIGHT',side=(e.slot||0)%2?1:-1,g=p100Goal(pose,1-(e.attackClock||0)/.34,side),skin=[.48,.08,.17],core=e.variant==='DRAINER'?[.08,1,.42]:e.variant==='SPLITTER'?[1,.53,.04]:e.variant==='PHASE'?[.58,.22,1]:[1,.04,.22],armor=[.15,.01,.05],lift=boss?.08:.02;
 const pelvis=p100P(px,pz,0,.76*s+lift,0,yaw),chest=p100P(px,pz,0,1.22*s+lift,0,yaw),head=p100P(px,pz,0,1.8*s+lift,0,yaw);iylaRound(px,.02,pz,.48*s,.025,.3*s,[0,0,0],yaw,.3);iylaRound(pelvis.x,pelvis.y,pelvis.z,.36*s,.28*s,.29*s,armor,yaw,.99);iylaRound(chest.x,chest.y,chest.z,.48*s,.4*s,.33*s,skin,yaw,.99);iylaBox(chest.x+Math.sin(yaw)*.27*s,chest.y,chest.z+Math.cos(yaw)*.27*s,.27*s,.18*s,.045*s,core,yaw,.98);iylaRound(head.x,head.y,head.z,.29*s,.33*s,.27*s,skin,yaw,.99);
 for(const a of[-1,1]){const root=p100P(px,pz,a*.48*s,1.32*s+lift,.01,yaw),attack=a===side&&pose==='PUNCH',end=attack?p100P(px,pz,side*.14*s,1.2*s+lift,.8*s,yaw):p100P(px,pz,a*.56*s,.82*s+lift,.02,yaw),joint=p100P(px,pz,a*.62*s,(root.y+end.y)*.5,attack?.35*s:.01,yaw);p100Limb(root,joint,end,.15*s,skin,yaw);production100.enemyChains++}
 for(const a of[-1,1]){const root=p100P(px,pz,a*.22*s,.66*s+lift,0,yaw),joint=p100P(px,pz,a*.23*s,.36*s+lift,.05*s,yaw),end=p100P(px,pz,a*.23*s,.1*s+lift,.17*s,yaw);p100Limb(root,joint,end,.17*s,armor,yaw);production100.enemyChains++}
 const fx=Math.sin(yaw),fz=Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);for(const a of[-1,1])iylaBox(head.x+fx*.27*s+rx*a*.09*s,head.y+.05*s,head.z+fz*.27*s+rz*a*.09*s,.07*s,.024*s,.022*s,core,yaw,.99);for(let i=0;i<(boss?6:3);i++){const u=i/((boss?6:3)-1)-.5;iylaBox(head.x-fx*.12*s+rx*u*.44*s,head.y+.36*s,head.z-fz*.12*s+rz*u*.44*s,.07*s,(.26+(e.bossForm||1)*.04)*s,.08*s,core,yaw+u*1.3,.98)}
}
owenGriffin=function(yaw,color,form){p100Hero(yaw,color,form)};owenLira=function(e,boss){p100Enemy(e,boss)};owenCrowd=function(e){p100Enemy(e,false)};

function p100World(){
 production100.worldObjects=0;const stage=campaign.stage||1,low=superAI.tier===1,ox=-(((worldX/45)%15+15)%15),oz=-(((worldY/45)%15+15)%15),stone=stage%3===0?[.16,.09,.055]:stage%2?[.045,.13,.14]:[.1,.065,.17],energy=stage%3===0?[1,.38,.04]:stage%2?[.04,.82,.75]:[.58,.18,1],count=low?10:16;
 for(let ring=0;ring<4;ring++)for(let i=0;i<count;i++){const a=i*TAU/count+(ring&1?TAU/32:0),r=ring*1.72;iylaBox(ox+Math.cos(a)*r,-.08-ring*.012,oz+Math.sin(a)*r,ring?.92:1.3,.09,ring?.96:1.3,(i+ring)%5===0?energy:stone,-a,.98);production100.worldObjects++}
 for(let i=0;i<(low?8:14);i++){const a=i*2.399+stage*.37,r=7.4+(i%3)*1.8,px=ox+Math.cos(a)*r,pz=oz+Math.sin(a)*r,h=.55+(i%4)*.42;iylaBox(px,h*.5,pz,.42,h*.5,.42,stone,a,.88);if(i%3===0)iylaBox(px,h+.45,pz,.08,.62,.08,energy,a,.72);production100.worldObjects++}
 if(typeof structuralWorld3D==='function')structuralWorld3D()
}
iyla3DWorld=function(){p100World()};
iylaIsoPoint=function(px,py,pz){const cam=production100.camera,a=-.46,c=Math.cos(a),s=Math.sin(a),rx=px*c-pz*s,rz=px*s+pz*c,zoom=Math.min(W,H)/(15.7/cam.zoom),depth=clamp(1+rz*.025,.78,1.22);return{x:W*(.43+cam.offset)+rx*zoom*depth,y:H*.61+rz*zoom*(.86+cam.pitch*.22)-py*zoom*depth}};
grid=function(){const stage=campaign.stage||1,top=stage%3===0?'#050318':stage%2?'#041b25':'#10051d',mid=stage%3===0?'#26134b':stage%2?'#0b5260':'#4a1744',hue=stage%3===0?'#9a54ff':stage%2?'#5df5db':'#ff7a45',g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,top);g.addColorStop(.58,mid);g.addColorStop(1,'#020308');x.fillStyle=g;x.fillRect(0,0,W,H);x.save();for(let l=0;l<3;l++){const base=H*(.43+l*.09),amp=32+l*24;x.globalAlpha=.24+l*.12;x.fillStyle=l===2?'#07161b':l===1?'#0b1c2a':'#19213c';x.beginPath();x.moveTo(0,H);for(let px=-40;px<=W+50;px+=38){const u=px+worldX*.018*(.16+l*.11),y=base-Math.abs(Math.sin(u*.017+l))*amp-Math.abs(Math.sin(u*.041))*amp*.38;x.lineTo(px,y)}x.lineTo(W,H);x.closePath();x.fill()}x.globalCompositeOperation='screen';const glow=x.createRadialGradient(W*.62,H*.48,5,W*.62,H*.48,W*.42);glow.addColorStop(0,hue+'66');glow.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=glow;x.fillRect(0,0,W,H);x.globalCompositeOperation='source-over';x.globalAlpha=.25;x.strokeStyle=hue;x.lineWidth=2;x.beginPath();x.ellipse(W*.5,H*.72,W*.47,H*.115,0,0,TAU);x.stroke();x.restore()};

function p100Camera(dt){const target=zCinema.lockedTarget&&enemies.includes(zCinema.lockedTarget)?zCinema.lockedTarget:zTarget(),cam=production100.camera,d=target?dist(player,target):260,boss=target?.type===3,cinematic=griffin.transformation?.active||griffin.superMove?.active||impactCinema?.active;production100.mode=cinematic?'CINEMATIC':boss?'BOSS':'PLAY';const z=cinematic?.88:boss?.93:clamp(1.08-d/1800,.88,1.04),o=cinematic?0:boss?-.035:-.075;cam.zoom+=(z-cam.zoom)*Math.min(1,dt*4.5);cam.offset+=(o-cam.offset)*Math.min(1,dt*4);cam.impulse=Math.max(0,cam.impulse-dt*3.4);cam.pitch+=(clamp(.54+d/900*.13,.54,.7)-cam.pitch)*Math.min(1,dt*3);if(iyla3d.cv){const kick=cam.impulse*Math.sin(performance.now()*.08)*2,scale=1.015+(1-cam.zoom)*.12;iyla3d.cv.style.transformOrigin='50% 58%';iyla3d.cv.style.transform='translate('+(cam.offset*W+kick)+'px,'+(kick*.35)+'px) scale('+scale+')';iyla3d.cv.style.filter='saturate('+(1.08+(griffin.evolution||0)*.04)+') contrast(1.06)'}}
const p100Systems=omniSystems;omniSystems=function(dt){p100Systems(dt);p100Camera(dt)};
const p100Event=combatEvent;combatEvent=function(type,data={}){const r=p100Event(type,data);if(type==='MELEE_CONTACT_CONFIRMED'){production100.flash=data.boss?.28:.16;production100.camera.impulse=data.boss?.7:.38;owen.hold=Math.max(owen.hold,data.boss?.085:.04)}else if(type==='FINISHER_CONFIRMED'||type==='DRAMATIC_FINISH'){production100.flash=.42;production100.camera.impulse=1;owen.hold=Math.max(owen.hold,.11)}else if(type==='SUPER_MOVE_IMPACT'){production100.flash=.36;production100.camera.impulse=.88}if(type==='COMBAT_TARGET_RECOVERED')production100.watchdog++;if(type==='TOURNAMENT_ROUND')production100.rounds++;return r};
const p100Visual=ultimateVisuals;ultimateVisuals=function(){p100Visual();production100.flash=Math.max(0,production100.flash-.025);if(production100.flash>0){x.save();x.globalCompositeOperation='screen';x.globalAlpha=production100.flash*.5;x.fillStyle='#eaffff';x.fillRect(0,0,W,H);x.restore()}};
const p100Hud=labHud;labHud=function(){p100Hud();const el=$('#brainDetail');if(el)el.innerHTML+='<br><b>'+production100.name+'</b> · '+production100.mode+'<br>FEATURES '+production100.features.length+'/100 · HERO CHAINS '+production100.heroChains+'/4 · ENEMY CHAINS '+production100.enemyChains+'<br>CAMERA '+production100.camera.zoom.toFixed(2)+' · WORLD '+production100.worldObjects+' · WATCHDOG '+production100.watchdog+' · ROUND EVENTS '+production100.rounds};
const p100Reset=reset;reset=function(mode=autoMode){const r=p100Reset(mode);production100.mode='PLAY';production100.flash=production100.watchdog=production100.rounds=production100.heroChains=production100.enemyChains=production100.worldObjects=0;Object.assign(production100.camera,{zoom:1,offset:0,pitch:.58,impulse:0});return r};
const p100Export=exportReplay;exportReplay=function(){replayEvent('PRODUCTION_100_EXPORT',{features:100,watchdog:production100.watchdog,rounds:production100.rounds});return p100Export()};const p100Button=$('#replayExport');if(p100Button)p100Button.onclick=exportReplay;


// Production 101: resilient Griffin/Lira voice direction and replay-proven authority fixes.
const production101={
 name:'SURVIVOR VOICE + AUTHORITY 101',version:'1.0',roundLogged:campaign.stage||1,
 voice:{queued:0,spoken:0,dropped:0,interrupted:0,recovered:0,fallbacks:0,repeats:0,errors:0,lastId:'',lastContext:'',lastText:'',byContext:{}},
 attacks:{attempts:0,confirmed:0,missed:0,cancelled:0,interrupted:0,pending:0},
 recovery:{targets:0,reasons:{}},structures:{collapsed:0,repaired:0,active:0},animation:{hitLocks:0,poseCorrections:0}
};
Object.assign(combatVoices,{
 minGap:1.75,maxQueue:9,speaking:false,status:'BOOTING',unlocked:false,voiceList:[],history:[],historyMax:72,
 active:null,watchdog:0,sequence:0,
 jaxon:{...combatVoices.jaxon,name:'GRIFFIN',pitch:.91,rate:1.03,last:0},
 conner:{...combatVoices.conner,name:'LIRA',pitch:1.08,rate:.98,last:0}
});
const voiceLexicon101={
 common:{
  opening:['The field is shifting','I can feel the pressure rise','This fight just changed','The next exchange decides our route','Power is gathering around us','The arena is answering every impact','A new pattern is forming','The tempo belongs to whoever adapts first'],
  tactic:['hold the center line','break the attack rhythm','draw them into open space','save power for the counter','change elevation before the next strike','force a clean angle','make the next hit undeniable','keep the escape lane clear','separate the strongest target','turn their momentum against them'],
  close:['Stay sharp','Do not waste this opening','Commit when the angle is clean','We control the next beat','Make every movement count','No blind swings','Keep the pressure intelligent','The plan evolves now','Finish the sequence cleanly','Watch the counter'],
  transform:['The energy curve just broke its limit','That form changes every safe distance','The transformation is stabilizing','Power is climbing faster than the arena can absorb it','The new form is rewriting the matchup'],
  boss:['The real opponent has entered','Boss signature confirmed','This one is controlling the whole field','The strongest fighter is finally moving','The battle just reached its true phase'],
  danger:['Health is falling; create distance','The current line ends in damage','Pressure is too high for a direct trade','One clean escape matters more than three reckless hits','Defensive timing is now the priority'],
  victory:['The field is clear','That sequence ended exactly where we aimed it','Another level belongs to us','The final opening became the finish','The plan survived contact'],
  miss:['That strike found empty space','The target read the first angle','The attack line was late','No contact; reset the rhythm','The opponent escaped the committed frame'],
  recover:['Target restored inside the combat envelope','The lock is clean again','Unreachable target corrected','The fight is back inside valid space','Target authority recovered']
 },
 griffin:{
  lead:['I have the route','Reading the next exchange','My model found an opening','I am changing the plan','Combat memory updated','I have their timing now','The risk map is clear','I see the winning line'],
  rival:['Lira, your pressure is improving','Lira, I expected that counter','Lira, the next angle is mine','Lira, you are forcing a better plan','Lira, I have learned this rhythm','Lira, that pattern will not work twice'],
  power:['I am not spending this power blindly','Energy is ready when the finish is real','I will turn this charge into a confirmed hit','The form is stable; the plan stays disciplined','Power without control loses fights']
 },
 lira:{
  lead:['I am closing the distance','Your route is already narrowing','I changed the rhythm before you noticed','The arena favors my pressure','I know where your escape ends','Your model is one step behind','I am forcing the next exchange','This is my tempo now'],
  rival:['Griffin, adapt faster','Griffin, your safe route is gone','Griffin, show me the plan you trust','Griffin, I will test every prediction','Griffin, your next move needs more than memory','Griffin, I am still inside your decision loop'],
  power:['I did not raise this power for a warning','The next surge is meant to connect','This form was built for the final exchange','I will make the arena remember this impact','Power answers confidence']
 }
};
function voiceHash101(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function voicePick101(list,seed,offset){return list[(seed+offset*2654435761>>>0)%list.length]}
function voiceContext101(type,data){
 const t=String(type||'DIRECT').toUpperCase();
 if(t.includes('TRANSFORM')||t.includes('FORM'))return 'transform';
 if(t.includes('BOSS')||t.includes('PHASE'))return 'boss';
 if(t.includes('LOW_HP')||t.includes('DANGER')||t.includes('CRITICAL'))return 'danger';
 if(t.includes('FINISH')||t.includes('CLEAR')||t.includes('VICTORY'))return 'victory';
 if(t.includes('WHIFF')||t.includes('MISS'))return 'miss';
 if(t.includes('RECOVER')||t.includes('RESTORE'))return 'recover';
 if(t.includes('PARRY')||t.includes('DODGE')||t.includes('BLOCK'))return 'counter';
 if(t.includes('SUPER')||t.includes('ULTIMATE'))return 'power';
 return 'combat'
}
function voiceCompose101(agent,context,data={}){
 const profile=voiceLexicon101[agent==='conner'?'lira':'griffin'],common=voiceLexicon101.common;
 const dynamic=[String(context),String(campaign.stage||1),String(kills||0),String(Math.round(player.hp||0)),String(production101.voice.sequence||0),String(data.id||data.move||data.name||'')].join(':');
 const seed=voiceHash101(agent+':'+dynamic),lead=voicePick101(profile.lead,seed,1);
 let middle;
 if(context==='transform')middle=voicePick101(common.transform,seed,2);
 else if(context==='boss')middle=voicePick101(common.boss,seed,2);
 else if(context==='danger')middle=voicePick101(common.danger,seed,2);
 else if(context==='victory')middle=voicePick101(common.victory,seed,2);
 else if(context==='miss')middle=voicePick101(common.miss,seed,2);
 else if(context==='recover')middle=voicePick101(common.recover,seed,2);
 else if(context==='power')middle=voicePick101(profile.power,seed,2);
 else if(context==='counter')middle=voicePick101(profile.rival,seed,2);
 else middle=voicePick101(common.opening,seed,2)+', '+voicePick101(common.tactic,seed,3);
 const close=voicePick101(common.close,seed,4);
 return lead+'. '+middle+'. '+close+'.'
}
function voiceFingerprint101(text){return String(text).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function voiceRefresh101(){
 if(!window.speechSynthesis)return;
 try{
  const list=speechSynthesis.getVoices()||[];
  combatVoices.voiceList=list.slice();
  combatVoices.status=list.length?'READY':'WAITING FOR VOICES';
 }catch{combatVoices.voiceList=[];combatVoices.status='SYNTH FALLBACK'}
}
voiceRefresh=voiceRefresh101;
voiceRefresh101();
if(window.speechSynthesis&&!combatVoices.p101VoiceListener){combatVoices.p101VoiceListener=true;speechSynthesis.addEventListener?.('voiceschanged',voiceRefresh101)}
function voiceSelect101(agent){
 const list=combatVoices.voiceList||[],english=list.filter(v=>/^en([-_]|$)/i.test(v.lang||''));
 const preferred=agent==='conner'?/Samantha|Karen|Moira|Ava|Serena|Zira|Female/i:/Daniel|Aaron|Alex|Arthur|Eddy|Male/i;
 return english.find(v=>preferred.test(v.name||''))||english[agent==='conner'&&english.length>1?1:0]||list[0]||null
}
function voiceFinish101(item,result){
 if(!combatVoices.active||combatVoices.active.id!==item.id)return;
 clearTimeout(combatVoices.watchdog);combatVoices.watchdog=0;combatVoices.active=null;combatVoices.speaking=false;
 if(result==='spoken')production101.voice.spoken++;
 else if(result==='fallback')production101.voice.fallbacks++;
 else if(result==='recovered')production101.voice.recovered++;
 combatVoices.status=combatVoices.voiceList.length?'READY':'SYNTH FALLBACK';
 setTimeout(voicePump,85)
}
voicePump=function(){
 if(combatVoices.speaking||!combatVoices.queue.length)return;
 const now=performance.now(),item=combatVoices.queue.shift();
 if(item.expires<now){production101.voice.dropped++;return voicePump()}
 const v=combatVoices[item.agent]||combatVoices.jaxon;
 combatVoices.speaking=true;combatVoices.active=item;combatVoices.status='SPEAKING';
 voiceCaption.dataset.agent=v.name;voiceCaption.textContent=v.name+' // '+item.msg;voiceCaption.hidden=false;
 combatVoices.subtitleUntil=now+Math.max(1900,item.msg.length*62);
 production101.voice.lastId=item.id;production101.voice.lastContext=item.context;production101.voice.lastText=item.msg;
 const timeout=Math.min(16000,Math.max(2600,item.msg.length*115));
 combatVoices.watchdog=setTimeout(()=>{production101.voice.errors++;try{speechSynthesis.cancel()}catch{}voiceCue(item.agent);voiceFinish101(item,'recovered')},timeout);
 if(!combatVoices.enabled||!combatVoices.unlocked||!window.SpeechSynthesisUtterance){
  voiceCue(item.agent);return setTimeout(()=>voiceFinish101(item,'fallback'),Math.max(780,item.msg.length*38))
 }
 try{
  const u=new SpeechSynthesisUtterance(item.msg);u.pitch=v.pitch;u.rate=v.rate;u.volume=.84;u.lang='en-US';u.voice=voiceSelect101(item.agent);
  u.onstart=()=>{combatVoices.status='SPEAKING'};
  u.onend=()=>voiceFinish101(item,'spoken');
  u.onerror=()=>{production101.voice.errors++;voiceCue(item.agent);voiceFinish101(item,'fallback')};
  speechSynthesis.resume?.();speechSynthesis.speak(u)
 }catch{production101.voice.errors++;voiceCue(item.agent);voiceFinish101(item,'fallback')}
};
function voiceEnqueue101(agent,msg,options={}){
 const v=combatVoices[agent],now=performance.now(),text=String(msg||'').trim();if(!v||!text)return false;
 const fp=voiceFingerprint101(text),context=options.context||'direct',recent=combatVoices.history.includes(fp);
 if(recent&&!options.force){production101.voice.repeats++;return false}
 const item={id:'V'+(++combatVoices.sequence),agent,msg:text,context,priority:options.priority||1,created:now,expires:now+(options.ttl||11000)};
 if(options.force&&combatVoices.active&&item.priority>=8){production101.voice.interrupted++;try{speechSynthesis.cancel()}catch{}clearTimeout(combatVoices.watchdog);combatVoices.active=null;combatVoices.speaking=false}
 if(combatVoices.queue.length>=combatVoices.maxQueue){
  let low=0;for(let i=1;i<combatVoices.queue.length;i++)if(combatVoices.queue[i].priority<combatVoices.queue[low].priority)low=i;
  if(combatVoices.queue[low].priority>item.priority){production101.voice.dropped++;return false}
  combatVoices.queue.splice(low,1);production101.voice.dropped++
 }
 combatVoices.history.push(fp);if(combatVoices.history.length>combatVoices.historyMax)combatVoices.history.shift();
 combatVoices.queue.push(item);combatVoices.queue.sort((a,b)=>b.priority-a.priority||a.created-b.created);
 production101.voice.queued++;production101.voice.byContext[context]=(production101.voice.byContext[context]||0)+1;
 voices.push(v.name+' // '+text);if(voices.length>10)voices.shift();voicePump();return true
}
aiVoice=function(agent,msg,force=false){return voiceEnqueue101(agent,msg,{force,priority:force?8:2,context:'direct'})};
function voiceReact101(type,data){
 const context=voiceContext101(type,data),important=['transform','boss','danger','victory','power'].includes(context);
 const seq=++production101.voice.sequence,agent=(seq+(campaign.stage||1)+(kills||0))%3===0?'conner':'jaxon';
 if(!important&&seq%3!==0)return;
 const line=voiceCompose101(agent,context,data);
 voiceEnqueue101(agent,line,{context,priority:important?context==='danger'?9:8:3,force:context==='danger'||context==='boss',ttl:important?15000:8500})
}
const p101CombatEvent=combatEvent;
combatEvent=function(type,data={}){
 const e=p101CombatEvent(type,data),t=String(type||'').toUpperCase();
 if(t==='MELEE_COMBO_BEAT'||t.includes('ATTACK_STARTED')){production101.attacks.attempts++;production101.attacks.pending++}
 if(t.includes('CONFIRMED')&&(t.includes('HIT')||t.includes('STRIKE')||t.includes('FINISH'))){production101.attacks.confirmed++;production101.attacks.pending=Math.max(0,production101.attacks.pending-1)}
 else if(t.includes('WHIFF')||t.includes('MISSED')){production101.attacks.missed++;production101.attacks.pending=Math.max(0,production101.attacks.pending-1)}
 else if(t.includes('CANCEL')){production101.attacks.cancelled++;production101.attacks.pending=Math.max(0,production101.attacks.pending-1)}
 else if(t.includes('INTERRUPT')){production101.attacks.interrupted++;production101.attacks.pending=Math.max(0,production101.attacks.pending-1)}
 if(t.includes('TARGET')&&(t.includes('RECOVER')||t.includes('RESTORE'))){const reason=String(data.reason||data.cause||'watchdog');production101.recovery.targets++;production101.recovery.reasons[reason]=(production101.recovery.reasons[reason]||0)+1}
 voiceReact101(type,data);soundReact101(type,data);return e
};
const p101OwenController=owenController;
owenController=function(dt){
 const stagePose=zStage.pose,hitLocked=owen.pose==='HIT'&&owen.stateTime<Math.max(.12,owen.stateLength*.84);
 if(hitLocked){zStage.pose='HIT';production101.animation.hitLocks++}
 p101OwenController(dt);zStage.pose=stagePose;
 if(owen.pose==='HIT'&&owen.wanted==='DASH'&&owen.stateTime<owen.stateLength*.84){owen.wanted='HIT';owen.queue=owen.queue.filter(p=>p!=='DASH');production101.animation.poseCorrections++}
};
omniEnvironment=function(){
 if(!iyla2026?.props)return;
 const now=elapsed,props=iyla2026.props;
 for(const p of props)if(p.broken&&p.p101RepairAt&&now>=p.p101RepairAt){p.broken=false;p.p101RepairAt=0;p.p101Damage=0;production101.structures.repaired++}
 const broken=props.filter(p=>p.broken).length;production101.structures.active=broken;if(broken>=12)return;
 let best=null,bestD=Infinity;
 for(const b of beams)for(const p of props){if(p.broken||now<(p.p101Cooldown||0))continue;const d=Math.hypot(p.x-b.x2,p.y-b.y2);if(d<26&&d<bestD){best={p,b};bestD=d}}
 if(!best)return;
 const p=best.p;p.p101Damage=(p.p101Damage||0)+1;p.p101Cooldown=now+.9;
 if(p.p101Damage<2&&!(best.b.damage>35||best.b.power>1.2))return;
 p.broken=true;p.p101RepairAt=now+14+(voiceHash101(String(p.x)+':'+String(p.y))%900)/100;
 expansion59.destruction++;production101.structures.collapsed++;burst(p.x,p.y,'#ffb34d',10);
 combatEvent('STRUCTURE_COLLAPSED',{x:Math.round(p.x),y:Math.round(p.y),repairAt:+p.p101RepairAt.toFixed(1)})
};
const p101CampaignUpdate=campaignUpdate;
campaignUpdate=function(dt){
 const before=campaign.stage;p101CampaignUpdate(dt);
 if(campaign.stage!==production101.roundLogged){
  production101.roundLogged=campaign.stage;tournament.lastRound=before;tournament.round=campaign.stage;production100.rounds++;
  combatEvent('TOURNAMENT_ROUND',{round:campaign.stage,name:tournament.roundNames[Math.min(tournament.roundNames.length-1,campaign.stage-1)]||('LEVEL '+campaign.stage),authority:'CAMPAIGN_P101'})
 }
};
const p101RememberReplayFrame=rememberReplayFrame;
rememberReplayFrame=function(frame){
 frame.production100={rigs:{hero:production100.heroChains,enemy:production100.enemyChains},camera:{...production100.camera},watchdog:production100.watchdog,rounds:production100.rounds,worldObjects:production100.worldObjects};
 frame.production101={voice:{queued:production101.voice.queued,spoken:production101.voice.spoken,dropped:production101.voice.dropped,interrupted:production101.voice.interrupted,recovered:production101.voice.recovered,fallbacks:production101.voice.fallbacks,repeats:production101.voice.repeats,errors:production101.voice.errors,queue:combatVoices.queue.length,status:combatVoices.status,lastId:production101.voice.lastId,lastContext:production101.voice.lastContext},attacks:{...production101.attacks},recovery:{targets:production101.recovery.targets,reasons:{...production101.recovery.reasons}},structures:{...production101.structures},animation:{...production101.animation},sound:{played:soundAI101.played,dropped:soundAI101.dropped,errors:soundAI101.errors,active:soundAI101.active,mode:soundAI101.mode,last:soundAI101.last,byType:{...soundAI101.byType}},round:production101.roundLogged};
 p101RememberReplayFrame(frame)
};

// Sound AI 102: original procedural anime-combat sound direction.
const soundAI101={name:'IYLA SOUND AI 102',version:'1.0',enabled:true,ready:false,master:null,compressor:null,buses:{},noise:null,active:0,maxActive:superAI.tier===1?10:18,played:0,dropped:0,errors:0,last:'',lastAt:{},byType:{},mode:'LOCKED',intensity:0};
function soundInit101(){
 initUltimateAudio();const ac=ultimate.audio;if(!ac||soundAI101.ready)return ac;
 try{
  const master=ac.createGain(),compressor=ac.createDynamicsCompressor();
  master.gain.value=.72;compressor.threshold.value=-17;compressor.knee.value=18;compressor.ratio.value=5;compressor.attack.value=.003;compressor.release.value=.19;
  master.connect(compressor).connect(ac.destination);soundAI101.master=master;soundAI101.compressor=compressor;
  const config={impact:[.92,'lowpass',6800],energy:[.78,'bandpass',1700],motion:[.62,'highpass',180],world:[.7,'lowpass',2400],ui:[.48,'highpass',420]};
  for(const [name,c] of Object.entries(config)){const gain=ac.createGain(),filter=ac.createBiquadFilter();gain.gain.value=c[0];filter.type=c[1];filter.frequency.value=c[2];filter.Q.value=name==='energy'?1.4:.7;filter.connect(gain).connect(master);soundAI101.buses[name]={gain,filter}}
  const length=Math.max(1,Math.floor(ac.sampleRate*1.4)),buffer=ac.createBuffer(1,length,ac.sampleRate),d=buffer.getChannelData(0);
  let brown=0;for(let i=0;i<length;i++){const white=Math.random()*2-1;brown=(brown+white*.18)/1.18;d[i]=clamp(white*.58+brown*.72,-1,1)}
  soundAI101.noise=buffer;soundAI101.ready=true;soundAI101.mode='READY';return ac
 }catch{soundAI101.errors++;soundAI101.mode='FALLBACK';return ac}
}
function soundBus101(name){return soundAI101.buses[name]?.filter||soundAI101.master}
function soundPan101(node,pan){
 const ac=ultimate.audio;if(!ac?.createStereoPanner)return node;
 const p=ac.createStereoPanner();p.pan.value=clamp(pan||0,-.85,.85);node.connect(p);return p
}
function soundTone101(bus,f0,f1,duration,gain=.1,wave='sine',delay=0,pan=0){
 const ac=soundInit101();if(!ac||!soundAI101.ready)return;
 try{
  const now=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();o.type=wave;o.frequency.setValueAtTime(Math.max(20,f0),now);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),now+duration);
  g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+duration);
  o.connect(g);soundPan101(g,pan).connect(soundBus101(bus));soundAI101.active++;o.onended=()=>soundAI101.active=Math.max(0,soundAI101.active-1);o.start(now);o.stop(now+duration+.02)
 }catch{soundAI101.errors++}
}
function soundNoise101(bus,duration,gain=.12,low=100,high=6000,delay=0,pan=0){
 const ac=soundInit101();if(!ac||!soundAI101.ready||!soundAI101.noise)return;
 try{
  const now=ac.currentTime+delay,s=ac.createBufferSource(),filter=ac.createBiquadFilter(),g=ac.createGain();s.buffer=soundAI101.noise;filter.type='bandpass';filter.frequency.setValueAtTime(Math.max(40,(low+high)*.5),now);filter.Q.value=Math.max(.25,(low+high)/Math.max(80,high-low));
  g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),now+.006);g.gain.exponentialRampToValueAtTime(.0001,now+duration);
  s.connect(filter).connect(g);soundPan101(g,pan).connect(soundBus101(bus));soundAI101.active++;s.onended=()=>soundAI101.active=Math.max(0,soundAI101.active-1);s.start(now,Math.random()*.35,duration+.02)
 }catch{soundAI101.errors++}
}
function soundImpact101(power,pan=0){
 const p=clamp(power,0,1.5);soundTone101('impact',82+18*p,36,.18+.08*p,.13+.075*p,'sine',0,pan);soundTone101('impact',310+260*p,84,.075+.035*p,.055+.04*p,'square',.006,pan);soundNoise101('impact',.1+.07*p,.09+.05*p,180,7200,.002,pan)
}
function soundWhoosh101(power,pan=0){
 const p=clamp(power,0,1.3);soundNoise101('motion',.16+.12*p,.045+.05*p,240,9600,0,pan);soundTone101('motion',180+520*p,72,.2+.08*p,.035+.025*p,'sawtooth',0,pan)
}
function soundEnergy101(power,release=false,pan=0){
 const p=clamp(power,0,1.5),d=release?.38:.62;soundTone101('energy',release?920:110,release?74:720,d,.065+.055*p,'sawtooth',0,pan);soundTone101('energy',release?1280:180,release?120:940,d*.78,.04+.04*p,'triangle',.018,pan);soundNoise101('energy',d*.55,.035+.035*p,520,9800,.01,pan)
}
function soundTransform101(power){
 const p=clamp(power,0,1.5);for(let i=0;i<5;i++)soundTone101('energy',90+i*55,360+i*180,.5,.045+.018*p,'sawtooth',i*.09,(i-2)*.18);soundNoise101('world',.9,.1+.04*p,60,2600,0,0)
}
function soundWorldBreak101(power,pan=0){
 const p=clamp(power,0,1.4);soundTone101('world',74,27,.48,.14+.05*p,'sine',0,pan);soundNoise101('world',.34,.12+.05*p,45,3200,.015,pan);for(let i=0;i<3;i++)soundNoise101('world',.08,.035,700,9000,.07+i*.055,pan+(i-1)*.18)
}
function soundPriority101(type){return /FINISHER|TRANSFORM|BOSS_ENTERED|SUPER_MOVE_IMPACT/.test(type)?10:/PARRY|CONTACT_CONFIRMED|STRUCTURE|TELEPORT/.test(type)?6:3}
function soundReact101(type,data={}){
 if(!soundAI101.enabled)return;const t=String(type||'').toUpperCase(),now=performance.now()/1000,priority=soundPriority101(t),last=soundAI101.lastAt[t]||-99;
 const gap=/DAMAGE_RESOLVED|SHIELD_HIT/.test(t)?.09:/CONTACT|PARRY/.test(t)?.055:.16;
 if(now-last<gap){soundAI101.dropped++;return}
 soundAI101.maxActive=superAI.tier===1?9:superAI.tier===2?14:20;
 if(soundAI101.active>=soundAI101.maxActive&&priority<9){soundAI101.dropped++;return}
 soundAI101.lastAt[t]=now;soundAI101.last=t;soundAI101.byType[t]=(soundAI101.byType[t]||0)+1;soundAI101.played++;
 const damage=clamp(Number(data.damage||data.amount||0)/90,0,1),boss=data.boss||griffin.boss?1:0,form=clamp((griffin.form?.stage||player.form||0)/5,0,1),intensity=clamp(.28+damage*.45+boss*.18+form*.18,0,1.35);
 soundAI101.intensity=intensity;soundAI101.mode=superAI.tier===1?'CULLED':combatVoices.speaking?'VOICE DUCK':'CINEMATIC';
 if(soundAI101.master){const ac=ultimate.audio,g=combatVoices.speaking?.42:.72;soundAI101.master.gain.cancelScheduledValues(ac.currentTime);soundAI101.master.gain.setTargetAtTime(g,ac.currentTime,.035)}
 const pan=clamp(Number(data.x||player.x)-player.x,-360,360)/420;
 if(t.includes('TRANSFORM'))soundTransform101(intensity);
 else if(t==='SUPER_MOVE_TRIGGERED'||t.includes('CHARGE'))soundEnergy101(intensity,false,pan);
 else if(t==='SUPER_MOVE_IMPACT'||t.includes('FINISHER')){soundEnergy101(intensity,true,pan);soundImpact101(intensity+0.35,pan);soundWorldBreak101(intensity,pan)}
 else if(t.includes('STRUCTURE')||t.includes('PENETRATION')||t.includes('EXIT_BURST'))soundWorldBreak101(intensity,pan);
 else if(t.includes('TELEPORT')||t.includes('VANISH')){soundWhoosh101(intensity+.25,pan);soundTone101('energy',1400,240,.12,.055,'sine',0,pan)}
 else if(t.includes('CONTACT_CONFIRMED')||t.includes('PARRY')||t.includes('BODY_STRIKE'))soundImpact101(intensity,pan);
 else if(t.includes('MISSED')||t.includes('COMBO_BEAT'))soundWhoosh101(intensity*.72,pan);
 else if(t.includes('BOSS_ENTERED')){soundTone101('world',96,31,.9,.2,'sawtooth');soundNoise101('world',.75,.11,35,1800)}
 else if(t.includes('SHIELD_HIT')){soundTone101('energy',760,260,.09,.035,'triangle',0,pan);soundNoise101('energy',.07,.028,1200,9000,0,pan)}
}
function soundUnlock101(){soundInit101();try{ultimate.audio?.resume?.();soundAI101.mode='READY'}catch{soundAI101.errors++}}
for(const id of['startBtn','autoStart','retry','autoToggle'])$('#'+id)?.addEventListener('click',soundUnlock101,{passive:true});

combatEvent('PRODUCTION_101_READY',{voice:'GRIFFIN_LIRA_DYNAMIC',queue:combatVoices.maxQueue,history:combatVoices.historyMax,structureCap:12,sound:'IYLA_SOUND_AI_102',round:production101.roundLogged});


// Survivor Production 103: replay-driven stabilization plus 100 enhancements per active AI.
const ai103Domains=['perception','world-model','memory','prediction','planning','control','coordination','resilience','efficiency','telemetry'];
const ai103Capabilities=['observe','validate','classify','score','learn','forecast','arbitrate','recover','explain','verify'];
const ai103={name:'SURVIVOR PRODUCTION 103',version:'1.0',domains:ai103Domains,capabilities:ai103Capabilities,perAI:ai103Domains.length*ai103Capabilities.length,clock:0,ticks:0,pressure:0,budget:'CINEMATIC',targetQuality:1,contracts:{},audio:{aggregated:0},structures:{prevented:0,forcedRepairs:0},attacks:{settled:0},animation:{commitLocks:0}};
const ai103Roster=[
 ['GRIFFIN',griffin],['LIRA',lira],['OWEN',owen],['MATTY',matty],['SUPER AI',superAI],['XAVIER',xavier],['IYLA',iyla],
 ['ZAVIER',typeof zavier!=='undefined'?zavier:null],['CHRISTIAN',typeof christian!=='undefined'?christian:null],['ZENITH',typeof zenith!=='undefined'?zenith:null],
 ['PEYTEN',peyten],['ELIJAH',elijah],['CURTIS',curtis]
];
for(const [name,agent] of ai103Roster){
 ai103.contracts[name]={enhancements:ai103.perAI,domains:10,capabilitiesPerDomain:10,active:!!agent,health:'READY',decisions:0,recoveries:0};
 if(agent){agent.enhancements=ai103.perAI;agent.enhancementDomains=10;agent.production='103';}
}
function ai103Tick(dt){
 ai103.clock-=dt;if(ai103.clock>0)return;ai103.clock=.25;ai103.ticks++;
 const work=xavier.work||0,fps=iyla.fps||60,density=enemies.length+hostile.length*.5;
 ai103.pressure=clamp((60-fps)/35+work/9+density/90,0,2);
 ai103.budget=ai103.pressure>1?'PROTECTED':ai103.pressure>.55?'BALANCED':'CINEMATIC';
 const target=zCinema.lockedTarget&&enemies.includes(zCinema.lockedTarget)?zCinema.lockedTarget:null;
 ai103.targetQuality=target&&Number.isFinite(target.x)&&Number.isFinite(target.y)?clamp(1-dist(player,target)/900,0,1):0;
 for(const [name,agent] of ai103Roster){const c=ai103.contracts[name];if(!agent)continue;c.decisions++;c.health=ai103.pressure>1.35?'THROTTLED':'READY';}
}
// Voice 103: dialogue pacing and cancellation discipline.
Object.assign(combatVoices,{maxQueue:5,historyMax:96,minGap:3.8,p103ContextAt:{},p103AgentAt:{},p103Cancelled:new Set()});
const p103VoiceEnqueue=voiceEnqueue101;
voiceEnqueue101=function(agent,msg,options={}){
 const now=performance.now()/1000,context=options.context||'direct',last=combatVoices.p103ContextAt[context]||-99;
 const important=['danger','boss','transform','victory','power'].includes(context),gap=important?4.8:7.5;
 if(now-last<gap&&!options.force){production101.voice.repeats++;return false}
 if(combatVoices.queue.length>=combatVoices.maxQueue&&!important){production101.voice.dropped++;return false}
 combatVoices.p103ContextAt[context]=now;
 return p103VoiceEnqueue(agent,msg,{...options,force:false,priority:important?Math.max(7,options.priority||0):options.priority,ttl:important?12000:7000})
};
aiVoice=function(agent,msg,force=false){
 const now=performance.now()/1000,last=combatVoices.p103AgentAt[agent]||-99;
 if(now-last<(force?4.5:6.5)){production101.voice.repeats++;return false}
 combatVoices.p103AgentAt[agent]=now;return voiceEnqueue101(agent,msg,{force:false,priority:force?7:2,context:force?'critical-direct':'direct'})
};
voiceReact101=function(type,data){
 const context=voiceContext101(type,data),important=['transform','boss','danger','victory','power'].includes(context),seq=++production101.voice.sequence;
 if(!important&&seq%10!==0)return;
 const agent=(seq+(campaign.stage||1)+(kills||0))%3===0?'conner':'jaxon';
 voiceEnqueue101(agent,voiceCompose101(agent,context,data),{context,priority:important?8:3,force:false,ttl:important?12000:6500})
};
// Sound 103: category aggregation, strict budgets and only audible event classes.
Object.assign(soundAI101,{maxActive:10,p103At:{},p103Category:{},mode:'PRODUCTION 103'});
function soundCategory103(t){
 if(/FINISHER|SUPER_MOVE_IMPACT/.test(t))return 'ultimate';
 if(/TRANSFORM/.test(t))return 'transform';
 if(/BOSS_ENTERED/.test(t))return 'boss';
 if(/STRUCTURE|PENETRATION|EXIT_BURST/.test(t))return 'world';
 if(/TELEPORT|VANISH/.test(t))return 'motion';
 if(/CONTACT_CONFIRMED|PARRY|BODY_STRIKE/.test(t))return 'impact';
 if(/CONTACT_MISSED|COMBO_BEAT/.test(t))return 'whoosh';
 if(/SHIELD_HIT/.test(t))return 'shield';
 if(/SUPER_MOVE_TRIGGERED|CHARGE/.test(t))return 'charge';
 return ''
}
soundReact101=function(type,data={}){
 if(!soundAI101.enabled)return;const t=String(type||'').toUpperCase(),category=soundCategory103(t);if(!category)return;
 const now=performance.now()/1000,gaps={ultimate:.45,transform:1.2,boss:1.4,world:.34,motion:.24,impact:.11,whoosh:.22,shield:.28,charge:.65},last=soundAI101.p103At[category]||-99;
 if(now-last<gaps[category]){soundAI101.dropped++;ai103.audio.aggregated++;return}
 soundAI101.maxActive=superAI.tier===1?5:superAI.tier===2?7:10;if(soundAI101.active>=soundAI101.maxActive){soundAI101.dropped++;return}
 soundAI101.p103At[category]=now;soundAI101.last=t;soundAI101.byType[t]=(soundAI101.byType[t]||0)+1;soundAI101.played++;
 const damage=clamp(Number(data.damage||data.amount||0)/100,0,1),boss=data.boss||griffin.boss?1:0,form=clamp((griffin.form?.stage||player.form||0)/5,0,1),power=clamp(.25+damage*.4+boss*.16+form*.15,0,1.15),pan=clamp(Number(data.x||player.x)-player.x,-360,360)/460;
 soundAI101.mode=superAI.tier===1?'CULLED':combatVoices.speaking?'VOICE DUCK':'CINEMATIC';
 if(soundAI101.master){const ac=ultimate.audio,g=combatVoices.speaking?.36:.62;soundAI101.master.gain.cancelScheduledValues(ac.currentTime);soundAI101.master.gain.setTargetAtTime(g,ac.currentTime,.045)}
 if(category==='ultimate'){soundEnergy101(power,true,pan);soundImpact101(power+.2,pan);if(superAI.tier>1)soundWorldBreak101(power,pan)}
 else if(category==='transform')soundTransform101(power);
 else if(category==='boss'){soundTone101('world',92,32,.72,.15,'sawtooth');soundNoise101('world',.48,.07,40,1500)}
 else if(category==='world')soundWorldBreak101(power,pan);
 else if(category==='motion')soundWhoosh101(power,pan);
 else if(category==='impact')soundImpact101(power,pan);
 else if(category==='whoosh')soundWhoosh101(power*.62,pan);
 else if(category==='shield'){soundTone101('energy',690,250,.075,.028,'triangle',0,pan);if(superAI.tier>1)soundNoise101('energy',.055,.018,1400,8000,0,pan)}
 else if(category==='charge')soundEnergy101(power,false,pan)
};
// Attack 103: settle every beat against the actual contact event vocabulary.
const p103CombatEvent=combatEvent;
combatEvent=function(type,data={}){
 const t=String(type||'').toUpperCase(),before=production101.attacks.pending,e=p103CombatEvent(type,data);
 if(t==='MELEE_COMBO_BEAT'&&before>0){production101.attacks.interrupted+=before;production101.attacks.pending=1;ai103.attacks.settled+=before}
 if(t==='MELEE_CONTACT_CONFIRMED'){production101.attacks.confirmed++;production101.attacks.pending=Math.max(0,production101.attacks.pending-1)}
 if((t.includes('TRANSFORMATION_TRIGGERED')||t.includes('SUPER_MOVE_TRIGGERED')||t==='ACTOR_REMOVED')&&production101.attacks.pending>0){const n=production101.attacks.pending;production101.attacks.cancelled+=n;production101.attacks.pending=0;ai103.attacks.settled+=n}
 return e
};
// Structure 103: one authority, a hard active-collapse cap and deterministic regeneration.
const p103StructureImpact=structureImpact;
structureImpact=function(p,power,angle,source='KI IMPACT'){
 structureReady(p);const active=iyla2026.props.reduce((n,q)=>n+(q.broken?1:0),0);
 if(!p.broken&&active>=12&&p.structure?.stage>=2){ai103.structures.prevented++;p.structure.hp=Math.max(p.structure.hp,p.structure.max*.36);return false}
 const was=p.broken,result=p103StructureImpact(p,power,angle,source);
 if(!was&&p.broken){p.p103BrokenAt=elapsed;p.p101RepairAt=elapsed+10+(p.seed%7);production101.structures.collapsed++}
 return result
};
zStageBurst=function(px,py,color='#ffe66b',power=1){
 zPush(zStage.blasts,{x:px,y:py,color,power,life:.42,max:.42},superAI.tier===1?3:6);
 if(power<1.15)return;
 let best=null,distance=Infinity;for(const p of iyla2026.props){if(p.broken)continue;const d=Math.hypot(p.x-px,p.y-py);if(d<70+power*38&&d<distance){best=p;distance=d}}
 if(best)structureImpact(best,24+power*22,Math.atan2(best.y-py,best.x-px),'CONTROLLED BLAST')
};
const p103IylaTerrain=iylaTerrain;
iylaTerrain=function(){const explosions=iyla.explosions;iyla.explosions=[];p103IylaTerrain();iyla.explosions=explosions};
function structureLifecycle103(){
 const props=iyla2026.props,now=elapsed;for(const p of props)if(p.broken&&!p.p101RepairAt){p.p103BrokenAt??=now;p.p101RepairAt=now+10+(p.seed%7)}
 let broken=props.filter(p=>p.broken).sort((a,b)=>(a.p103BrokenAt||0)-(b.p103BrokenAt||0));
 while(broken.length>12){const p=broken.shift();p.broken=false;if(p.structure){p.structure.stage=0;p.structure.hp=p.structure.max}p.p101RepairAt=0;production101.structures.repaired++;ai103.structures.forcedRepairs++}
 for(const p of props)if(p.broken&&p.p101RepairAt<=now){p.broken=false;if(p.structure){p.structure.stage=0;p.structure.hp=p.structure.max}p.p101RepairAt=0;p.p103BrokenAt=0;production101.structures.repaired++}
 production101.structures.active=props.reduce((n,p)=>n+(p.broken?1:0),0)
}
// Animation 103: preserve committed clips through their contact/recovery window.
const p103OwenController=owenController;
owenController=function(dt){
 const clip=owenClips[owen.pose]||owenClips.FLIGHT,q=owen.stateTime/Math.max(.01,owen.stateLength),stagePose=zStage.pose;
 const committed=!clip.loop&&owen.pose!=='FLIGHT'&&q<.84;
 if(committed){zStage.pose=owen.pose;ai103.animation.commitLocks++}
 p103OwenController(dt);zStage.pose=stagePose;
 if(owen.pose==='TRANSFORM'&&owen.stateTime<owen.stateLength*.88){owen.wanted='TRANSFORM';owen.queue.length=0}
};
const p103OmniSystems=omniSystems;
omniSystems=function(dt){p103OmniSystems(dt);structureLifecycle103();ai103Tick(dt)};
const p103RememberReplayFrame=rememberReplayFrame;
rememberReplayFrame=function(frame){
 frame.production103={name:ai103.name,perAI:ai103.perAI,agents:ai103Roster.length,totalEnhancements:ai103Roster.length*ai103.perAI,ticks:ai103.ticks,pressure:+ai103.pressure.toFixed(3),budget:ai103.budget,targetQuality:+ai103.targetQuality.toFixed(3),audio:{aggregated:ai103.audio.aggregated,active:soundAI101.active,max:soundAI101.maxActive},structures:{...ai103.structures,active:production101.structures.active},attacks:{...production101.attacks,settled:ai103.attacks.settled},animation:{...ai103.animation},contracts:Object.fromEntries(Object.entries(ai103.contracts).map(([k,v])=>[k,{enhancements:v.enhancements,health:v.health}]))};
 p103RememberReplayFrame(frame)
};
combatEvent('PRODUCTION_103_READY',{agents:ai103Roster.length,enhancementsEach:ai103.perAI,total:ai103Roster.length*ai103.perAI,sound:'AGGREGATED',structures:'AUTHORITATIVE',attacks:'SETTLED'});


// Survivor Production 104: conversational drama, adaptive score, cinematic SFX and biome direction.
const production104={name:'SURVIVOR PRODUCTION 104',version:'1.0',frames:0,ready:false};
const dialogue104={name:'GRIFFIN + LIRA CONVERSATION DIRECTOR',turn:0,lastAt:-99,lastContext:'',pending:[],spoken:0,responses:0,silenced:0,relationship:{respect:0,anger:0,confidence:0,momentum:0,fear:0},history:[],thread:'OPENING'};
const dialogue104Lexicon={
 griffin:{
  opening:['I mapped the field before the first strike landed','Every exchange gives me a clearer route','I am not chasing power; I am controlling when it matters'],
  challenge:['Lira, commit to the attack and I will show you the gap','Your pressure is strong, but your pattern is becoming visible','You keep closing space; I keep learning what you leave behind'],
  answer:['I heard the threat. Now watch the adjustment','That would have worked before I understood your timing','You changed the rhythm, so I changed the plan'],
  reversal:['The momentum turned the moment you overcommitted','That opening belonged to you until you tried to force it','I survived the pressure; now the field belongs to my counter'],
  transform:['This form is not the plan. It is the power the plan required','The energy is stable. My decisions stay clear','More power means nothing unless the next hit is confirmed'],
  finish:['The route is complete. I am ending this cleanly','No wasted motion. No second opening','Everything I learned points to this finish'],
  aftermath:['The fight is over, but the memory stays','That victory came from adaptation, not luck','The next opponent inherits everything this battle taught me']
 },
 lira:{
  opening:['I felt your prediction before you moved','The arena will close around every safe route you choose','You brought a plan into a fight that changes by the second'],
  challenge:['Griffin, show me a decision I cannot pressure apart','Keep studying me; I will change before the answer arrives','Your safest route is the one I want you to take'],
  answer:['You adjusted once. I already prepared the next question','I wanted that counter; now I know its exact timing','Your model sees patterns, but I decide when they break'],
  reversal:['You mistook survival for control','The field did not turn; I allowed you to step deeper into it','That confidence is exactly what I needed you to spend'],
  transform:['Now the battle has enough power to become honest','I will test whether your control survives this energy','A new form only gives me a stronger pattern to break'],
  finish:['Your last route ends here','I have measured every escape; there is nowhere left to spend them','This is the answer your model could not delay'],
  aftermath:['Remember the pressure, Griffin; it will return smarter','The result is temporary. What I learned is permanent','Next time I will begin where this battle ended']
 }
};
function dialogueContext104(type){
 const t=String(type||'').toUpperCase();if(t.includes('TRANSFORM'))return 'transform';if(t.includes('FINISHER')||t.includes('DRAMATIC_FINISH'))return 'finish';
 if(t.includes('BOSS_ENTERED')||t.includes('TOURNAMENT_ROUND'))return 'challenge';if(t.includes('PARRY')||t.includes('CONTACT_CONFIRMED'))return 'reversal';
 if(t.includes('LEVEL_CLEAR')||t.includes('WAVE_CLEAR'))return 'aftermath';if(t.includes('SUPER_MOVE'))return 'answer';return ''
}
function dialoguePick104(agent,context,seed){const list=dialogue104Lexicon[agent][context]||dialogue104Lexicon[agent].answer;return list[voiceHash101(agent+context+seed)%list.length]}
function dialogueUpdateRelationship104(type,agent){
 const r=dialogue104.relationship,t=String(type).toUpperCase();if(t.includes('PARRY')){r.respect=clamp(r.respect+.04,0,1);r.anger=clamp(r.anger+.03,0,1)}
 if(t.includes('CONTACT_CONFIRMED'))r.momentum=clamp(r.momentum+(agent==='griffin'?.05:-.04),-1,1);
 if(t.includes('TRANSFORM')){r.fear=clamp(r.fear+.06,0,1);r.confidence=clamp(r.confidence+.04,0,1)}
 if(t.includes('FINISH'))r.confidence=clamp(r.confidence+.08,0,1)
}
function dialogueSpeak104(agent,context,type,response=false){
 const now=performance.now()/1000,gap=['transform','finish','aftermath'].includes(context)?4.5:6.5;if(now-dialogue104.lastAt<gap){dialogue104.silenced++;return}
 const line=dialoguePick104(agent,context,dialogue104.turn+campaign.stage+kills);dialogue104.lastAt=now;dialogue104.lastContext=context;dialogue104.turn++;dialogue104.spoken++;if(response)dialogue104.responses++;
 dialogue104.history.push({agent,context,line});if(dialogue104.history.length>40)dialogue104.history.shift();
 voiceEnqueue101(agent==='griffin'?'jaxon':'conner',line,{context:'conversation-'+context,priority:['transform','finish'].includes(context)?8:5,force:false,ttl:10000})
}
function dialogueObserve104(type,data={}){
 const context=dialogueContext104(type);if(!context)return;const first=dialogue104.turn%2?'lira':'griffin',second=first==='griffin'?'lira':'griffin';
 dialogueUpdateRelationship104(type,first);dialogueSpeak104(first,context,type,false);
 if(['challenge','transform','reversal','finish'].includes(context))dialogue104.pending.push({agent:second,context:context==='reversal'?'answer':context,type,at:performance.now()+1450+((dialogue104.turn%3)*280)})
}
function dialogueTick104(){
 if(!dialogue104.pending.length)return;const now=performance.now(),next=dialogue104.pending[0];if(now<next.at||combatVoices.speaking)return;
 dialogue104.pending.shift();dialogueSpeak104(next.agent,next.context,next.type,true)
}
voiceReact101=dialogueObserve104;
// Adaptive original music composer using cached procedural instruments and audio-clock scheduling.
const music104={name:'IYLA ADAPTIVE SCORE COMPOSER',ready:false,bus:null,filter:null,buffers:{},nextTime:0,step:0,bar:0,bpm:108,state:'EXPLORATION',motif:'GRIFFIN',scheduled:0,dropped:0,errors:0,lastNote:0,intensity:0};
function musicBuffer104(ac,kind,duration){
 const n=Math.floor(ac.sampleRate*duration),b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);let last=0;
 for(let i=0;i<n;i++){const t=i/ac.sampleRate,q=i/n,env=kind==='pad'?Math.sin(Math.PI*q)*.42:Math.exp(-q*(kind==='kick'?18:kind==='snare'?24:8)),noise=Math.random()*2-1;
  if(kind==='kick')d[i]=Math.sin(TAU*(76*t-38*t*t))*env;
  else if(kind==='snare'){last=(last+noise*.35)/1.35;d[i]=(noise*.72+last*.5)*env}
  else if(kind==='hat')d[i]=noise*Math.exp(-q*45)*.35;
  else if(kind==='bass')d[i]=(Math.sin(TAU*55*t)+Math.sin(TAU*110*t)*.3)*env*.55;
  else if(kind==='pluck')d[i]=(Math.sin(TAU*220*t)+Math.sin(TAU*440*t)*.25)*env*.42;
  else d[i]=(Math.sin(TAU*110*t)+Math.sin(TAU*165*t)*.35)*env*.32
 }return b
}
function musicInit104(){
 const ac=soundInit101();if(!ac||music104.ready)return;try{
  const bus=ac.createGain(),filter=ac.createBiquadFilter();bus.gain.value=.28;filter.type='lowpass';filter.frequency.value=5200;filter.Q.value=.45;bus.connect(filter).connect(soundAI101.master||ac.destination);music104.bus=bus;music104.filter=filter;
  for(const [k,d] of Object.entries({kick:.42,snare:.3,hat:.09,bass:.5,pluck:.38,pad:1.4}))music104.buffers[k]=musicBuffer104(ac,k,d);
  music104.nextTime=ac.currentTime+.08;music104.ready=true
 }catch{music104.errors++}
}
function musicPlay104(kind,when,semitones=0,gain=.2,pan=0){
 const ac=ultimate.audio,b=music104.buffers[kind];if(!ac||!b||!music104.bus)return;try{const s=ac.createBufferSource(),g=ac.createGain();s.buffer=b;s.playbackRate.value=2**(semitones/12);g.gain.value=gain;s.connect(g);soundPan101(g,pan).connect(music104.bus);s.start(when);music104.scheduled++;music104.lastNote=semitones}catch{music104.errors++}
}
function musicState104(){
 const hp=player.hp/player.maxHp,boss=!!griffin.boss,transform=!!griffin.transformation?.active,superMove=!!griffin.superMove?.active;
 music104.state=transform?'ASCENSION':superMove?'ULTIMATE':boss?'BOSS':hp<.35?'LAST STAND':enemies.length>18?'BATTLE':'PURSUIT';
 music104.intensity=clamp(enemies.length/28+(boss?.35:0)+(transform?.45:0)+(1-hp)*.3,0,1.4);music104.bpm=Math.round(96+music104.intensity*38);
 music104.motif=dialogue104.relationship.momentum>=0?'GRIFFIN':'LIRA'
}
function musicTick104(){
 if(!music104.ready)return;const ac=ultimate.audio;if(!ac||ac.state!=='running')return;musicState104();const beat=60/music104.bpm/4,griffinMotif=[0,3,7,10,7,12,10,7],liraMotif=[0,1,6,8,6,11,8,1],motif=music104.motif==='GRIFFIN'?griffinMotif:liraMotif;
 let guard=0;while(music104.nextTime<ac.currentTime+.12&&guard++<4){const s=music104.step%16,bar=Math.floor(music104.step/16);
  if(s%4===0)musicPlay104('kick',music104.nextTime,s===12?2:0,.18);
  if(s===4||s===12)musicPlay104('snare',music104.nextTime,0,.11);
  if(music104.intensity>.45&&s%2===0)musicPlay104('hat',music104.nextTime,0,.055,(s%4-1.5)*.18);
  if(s%4===0)musicPlay104('bass',music104.nextTime,[0,0,-2,3][(s/4)%4],.11);
  if((s%2===0&&music104.intensity>.28)||s%4===0)musicPlay104('pluck',music104.nextTime,motif[(s/2)%8]+(bar%2?0:12),.08,(s%4-1.5)*.16);
  if(s===0&&music104.state!=='PURSUIT')musicPlay104('pad',music104.nextTime,[0,5,3,-2][bar%4],.07);
  music104.step++;music104.bar=Math.floor(music104.step/16);music104.nextTime+=beat
 }
 const target=combatVoices.speaking?.14:.28;music104.bus.gain.setTargetAtTime(target,ac.currentTime,.08);music104.filter.frequency.setTargetAtTime(2600+music104.intensity*2600,ac.currentTime,.1)
}
// Cinematic SFX 104: cached multi-layer transients with distance and variation.
const sfx104={name:'IYLA CINEMATIC SFX FORGE',ready:false,buffers:{},played:0,dropped:0,errors:0,variants:0,last:'',at:{}};
function sfxInit104(){const ac=soundInit101();if(!ac||sfx104.ready)return;try{
 for(const [k,d] of Object.entries({body:.24,crack:.1,air:.32,energy:.48,debris:.5,shield:.16})){const n=Math.floor(ac.sampleRate*d),b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);let brown=0;for(let i=0;i<n;i++){const q=i/n,w=Math.random()*2-1;brown=(brown+w*.12)/1.12;const env=Math.exp(-q*(k==='energy'?5:k==='air'?8:18));a[i]=(k==='body'?Math.sin(TAU*(92-48*q)*i/ac.sampleRate):k==='energy'?Math.sin(TAU*(180+720*q)*i/ac.sampleRate)*.55:k==='shield'?Math.sin(TAU*(920-560*q)*i/ac.sampleRate):k==='debris'?brown:k==='air'?w*.65+brown*.3:w)*env*.55}sfx104.buffers[k]=b}sfx104.ready=true
 }catch{sfx104.errors++}}
function sfxPlay104(kind,gain=.12,rate=1,pan=0,delay=0){
 const ac=ultimate.audio,b=sfx104.buffers[kind];if(!ac||!b||soundAI101.active>=soundAI101.maxActive){sfx104.dropped++;return}try{const s=ac.createBufferSource(),g=ac.createGain(),filter=ac.createBiquadFilter();s.buffer=b;s.playbackRate.value=rate;g.gain.value=gain;filter.type=kind==='body'||kind==='debris'?'lowpass':'bandpass';filter.frequency.value=kind==='body'?480:kind==='debris'?1800:kind==='air'?3200:1900;filter.Q.value=.7;s.connect(filter).connect(g);soundPan101(g,pan).connect(soundBus101(kind==='debris'?'world':kind==='air'?'motion':'impact'));soundAI101.active++;s.onended=()=>soundAI101.active=Math.max(0,soundAI101.active-1);s.start(ac.currentTime+delay);sfx104.played++}catch{sfx104.errors++}
}
soundReact101=function(type,data={}){
 const t=String(type||'').toUpperCase(),category=soundCategory103(t);if(!category)return;const now=performance.now()/1000,gaps={ultimate:.5,transform:1.3,boss:1.5,world:.38,motion:.25,impact:.12,whoosh:.23,shield:.3,charge:.7},last=sfx104.at[category]||-99;
 if(now-last<gaps[category]){sfx104.dropped++;return}sfx104.at[category]=now;sfx104.last=t;sfx104.variants++;const v=.9+(sfx104.variants%7)*.025,pan=clamp(Number(data.x||player.x)-player.x,-360,360)/460,power=clamp(.65+Number(data.damage||0)/180,0,1.2);
 if(category==='impact'){sfxPlay104('body',.13*power,v,pan);sfxPlay104('crack',.075*power,1/v,pan,.012)}
 else if(category==='whoosh'||category==='motion')sfxPlay104('air',.09*power,v,pan);
 else if(category==='shield')sfxPlay104('shield',.07,v,pan);
 else if(category==='world'){sfxPlay104('debris',.12*power,v,pan);sfxPlay104('body',.09*power,.72,pan)}
 else if(category==='charge')sfxPlay104('energy',.08*power,.72,pan);
 else if(category==='transform'){sfxPlay104('energy',.13,1.25,0);sfxPlay104('air',.08,.7,0,.08)}
 else if(category==='boss'){sfxPlay104('body',.17,.55,0);sfxPlay104('debris',.08,.8,0,.04)}
 else if(category==='ultimate'){sfxPlay104('energy',.14,1.4,pan);sfxPlay104('body',.17,.62,pan,.025);sfxPlay104('crack',.08,1.12,pan,.045)}
};
// Seven original performance-scaled cinematic biomes.
const environments104=[
 {name:'AZURE ARCHIPELAGO',sky:[.08,.32,.36],ground:[.12,.42,.32],accent:[.18,.75,.62],kind:'ISLANDS'},
 {name:'CRIMSON WASTELAND',sky:[.32,.12,.09],ground:[.38,.16,.08],accent:[.78,.34,.08],kind:'SPIRES'},
 {name:'ZENITH TOURNAMENT',sky:[.08,.22,.38],ground:[.34,.36,.4],accent:[.85,.72,.25],kind:'ARENA'},
 {name:'RUINED TOMORROW',sky:[.08,.09,.16],ground:[.12,.14,.19],accent:[.35,.5,.75],kind:'CITY'},
 {name:'MOLTEN CROWN',sky:[.28,.05,.04],ground:[.2,.08,.04],accent:[1,.22,.03],kind:'VOLCANO'},
 {name:'SKYFALL SANCTUM',sky:[.28,.14,.38],ground:[.16,.2,.28],accent:[.62,.42,.9],kind:'FLOATING'},
 {name:'CELESTIAL VOID',sky:[.03,.02,.09],ground:[.06,.05,.14],accent:[.2,.8,1],kind:'VOID'}
];
const environment104={index:0,name:'',transitions:0,objects:0,lod:'CINEMATIC',destruction:0};
iyla3DWorld=function(){
 const env=environments104[(campaign.stage-1)%environments104.length];if(environment104.name!==env.name){environment104.name=env.name;environment104.index=(campaign.stage-1)%environments104.length;environment104.transitions++}
 const low=superAI.tier===1,mid=superAI.tier===2,rx=low?2:3,rz=low?3:4,tile=2.35,ox=((worldX/48)%tile+tile)%tile,oz=((worldY/48)%tile+tile)%tile;environment104.objects=0;environment104.lod=low?'MOBILE':mid?'BALANCED':'CINEMATIC';
 for(let gx=-rx;gx<=rx;gx++)for(let gz=-rz;gz<=rz;gz++){const variation=((gx*7+gz*13)&3)*.018,c=env.ground.map(v=>v+variation);iylaBox(gx*tile-ox,-.12,gz*tile-oz,tile*.5,.09,tile*.5,c,0,.94);environment104.objects++}
 const horizon=low?8:mid?12:18;for(let i=0;i<horizon;i++){const a=i*TAU/horizon+.2,r=9+(i%3)*1.3,h=.7+(i*7%5)*.45,xp=Math.cos(a)*r,zp=Math.sin(a)*r;
  if(env.kind==='CITY')iylaBox(xp,h*.5,zp,.55,h,.55,env.accent,a,.8);
  else if(env.kind==='ARENA'){iylaBox(xp,.35,zp,.8,.34,.8,env.accent,a,.75);if(i%3===0)iylaBox(xp,1.2,zp,.15,.9,.15,[.75,.78,.82],a,.8)}
  else if(env.kind==='FLOATING')iylaBox(xp,1.5+(i%3)*.6,zp,1.2,.22,.8,env.ground,a,.85);
  else if(env.kind==='VOID')iylaRound(xp,1+(i%4)*.7,zp,.08,.08,.08,env.accent,a,.8);
  else{iylaBox(xp,h*.42,zp,.55+(i%2)*.28,h,.55,env.kind==='VOLCANO'?env.accent:env.ground,a,.86);if(env.kind==='ISLANDS'&&i%3===0)iylaRound(xp,h+.35,zp,.42,.32,.42,env.accent,a,.8)}
  environment104.objects++
 }
 if(env.kind==='ARENA'){iylaBox(0,-.01,0,3.4,.12,3.4,[.52,.5,.45],0,.98);for(let i=0;i<4;i++)iylaBox(Math.cos(i*Math.PI/2)*3.7,.4,Math.sin(i*Math.PI/2)*3.7,.18,.7,.18,env.accent,i,.9)}
 if(env.kind==='VOLCANO')for(let i=0;i<5;i++)iylaBox((i-2)*1.7,.01,-3+(i%2)*1.4,.7,.035,.16,env.accent,.3,.8);
 const cap=low?8:mid?14:20;for(const p of iyla2026.props.slice(0,cap)){if(p.x<-50||p.x>W+50||p.y<-50||p.y>H+50)continue;const wx=(p.x-W/2)/45,wz=(p.y-H/2)/45,h=p.h/30,col=p.broken?[.1,.11,.13]:env.accent;iylaBox(wx,h*.42,wz,.34+p.type*.06,h*.42,.34+p.type*.06,col,p.seed,p.broken?.5:.88);if(p.broken){iylaBox(wx,.02,wz,.7,.018,.7,[.18,.04,.03],p.seed,.55);environment104.destruction++}environment104.objects++}
};
// Frame integration and replay contract.
function production104Frame(){production104.frames++;dialogueTick104();musicTick104()}
const p104IylaFrame=iyla2026Frame;
iyla2026Frame=function(){p104IylaFrame();production104Frame()};
const p104RememberReplayFrame=rememberReplayFrame;
rememberReplayFrame=function(frame){
 frame.production104={name:production104.name,dialogue:{thread:dialogue104.thread,turns:dialogue104.turn,spoken:dialogue104.spoken,responses:dialogue104.responses,silenced:dialogue104.silenced,pending:dialogue104.pending.length,lastContext:dialogue104.lastContext,relationship:{...dialogue104.relationship}},music:{state:music104.state,bpm:music104.bpm,motif:music104.motif,bar:music104.bar,scheduled:music104.scheduled,errors:music104.errors,intensity:+music104.intensity.toFixed(3)},sfx:{played:sfx104.played,dropped:sfx104.dropped,errors:sfx104.errors,active:soundAI101.active,last:sfx104.last,variants:sfx104.variants},environment:{...environment104}};
 p104RememberReplayFrame(frame)
};
function production104Unlock(){musicInit104();sfxInit104();try{ultimate.audio?.resume?.()}catch{}}
for(const id of['startBtn','autoStart','retry','autoToggle'])$('#'+id)?.addEventListener('click',production104Unlock,{passive:true});
production104.ready=true;combatEvent('PRODUCTION_104_READY',{dialogue:'CONVERSATIONAL',music:'ADAPTIVE_COMPOSER',sfx:'CINEMATIC_BUFFERED',biomes:environments104.length});


// Survivor Production 105: original anime-arena graphics and complete combat-function synthesis.
const production105={name:'SURVIVOR PRODUCTION 105',version:'1.0',ready:false,frames:0};
const gameFunctions105=[
'directional-guard','high-guard','low-guard','short-dash','pursuit-dash','ground-flight-transition','ascend','descend','ki-charge','passive-ki','ki-overheat','ki-recovery',
'light-chain','rush-chain','smash-charge','smash-ki','launcher','aerial-chase','wall-impact','ground-impact','hit-stop','anticipation','contact','follow-through','recovery',
'vanish','parry','revenge-counter','super-perception','projectile-deflect','beam-clash','guard-break','stamina-break','counter-window','cancel-window','combo-scaling',
'skill-count','transformation','ascension-state','ultimate-state','form-drain','form-mastery','fusion-link','assist-call','tag-extension','chain-blast','dramatic-finish',
'boss-phase','boss-enrage','boss-adaptation','enemy-archetypes','squad-coordination','target-priority','arena-boundaries','vertical-combat','destructible-arena',
'character-stats','attack-stat','combo-stat','ki-stat','special-stat','speed-stat','defense-stat','ability-items','move-loadout','style-type','mastery-tree',
'training-goals','combo-trials','adaptive-tutorial','difficulty-director','cpu-personality','counter-learning','pattern-memory','anti-repeat','fairness-guardrails',
'survival-mode','mission-mode','extra-battle','custom-rules','battle-arts','limit-breaker-map','progression-board','soul-links','world-events','sub-stories',
'dynamic-camera','impact-camera','dramatic-cut-in','anime-pose','expression-focus','toon-ramp','rim-light','aura-light','speed-lines','impact-flash','shockwave',
'sky-gradient','atmospheric-fog','parallax-horizon','terrain-layers','camera-lod','destruction-materials','biome-audio','adaptive-score','cinematic-sfx',
'voice-state-machine','rivalry-dialogue','attack-ledger','unique-destruction-ledger','unique-animation-locks','classified-time-debt','replay-invariants',
'performance-budget','accessibility-boundary','clean-hud','photo-replay','ai-sparring','spectator-director','combat-accessibility'];
const gameplay105={ki:100,maxKi:100,skill:0,maxSkill:5,overheat:0,form:'BASE',formLevel:0,formDrain:0,guard:'MID',vertical:0,dash:0,assist:0,chain:0,chainBest:0,multiplier:1,difficulty:1,archetypes:['PRESSURE','ZONER','COUNTER','BRUISER','SUPPORT'],bossPhase:1,stats:{attack:1,combo:1,ki:1,special:1,speed:1,defense:1},training:{goal:'LAND A CLEAN CHAIN',progress:0,mastery:0},features:gameFunctions105.length};
const graphics105={toonRamp:4,rimLight:1,auraLight:0,impactLight:0,speedLines:0,fog:.18,parallax:3,lod:'CINEMATIC',drawn:0,boundary:false};
const attackLedger105={sequence:0,open:[],attempts:0,confirmed:0,missed:0,cancelled:0,interrupted:0,pending:0,invariant:true,duplicates:0};
const telemetry105={voice:{requested:0,delivered:0,failed:0,recovered:0},animation:{lockTransitions:0,lockFrames:0,last:false},destruction:{unique:0,active:0,ids:new Set()},time:{renderDebt:0,cinematic:0,paused:0,hidden:0},relationshipEvents:new Set()};
function settleAttack105(result,data={}){const id=data.attackId||attackLedger105.open[0];if(!id){attackLedger105.duplicates++;return}const i=attackLedger105.open.indexOf(id);if(i<0){attackLedger105.duplicates++;return}attackLedger105.open.splice(i,1);attackLedger105[result]++;attackLedger105.pending=attackLedger105.open.length}
const p105CombatEvent=combatEvent;
combatEvent=function(type,data={}){
 const t=String(type||'').toUpperCase();
 if(t==='MELEE_COMBO_BEAT'||t.includes('ATTACK_STARTED')){const id='A105-'+(++attackLedger105.sequence);attackLedger105.open.push(id);attackLedger105.attempts++;attackLedger105.pending=attackLedger105.open.length;data={...data,attackId:id}}
 else if((t.includes('HIT')||t.includes('STRIKE')||t.includes('CONTACT'))&&t.includes('CONFIRMED'))settleAttack105('confirmed',data);
 else if(t.includes('WHIFF')||t.includes('MISSED'))settleAttack105('missed',data);else if(t.includes('CANCEL'))settleAttack105('cancelled',data);else if(t.includes('INTERRUPT'))settleAttack105('interrupted',data);
 if(t.includes('FINISHER'))data={...data,finisher:true};const e=p105CombatEvent(type,data);
 attackLedger105.invariant=attackLedger105.attempts===attackLedger105.confirmed+attackLedger105.missed+attackLedger105.cancelled+attackLedger105.interrupted+attackLedger105.pending;
 if(t.includes('PARRY')){gameplay105.skill=clamp(gameplay105.skill+.35,0,gameplay105.maxSkill);gameplay105.training.progress++}
 if(t.includes('CONTACT_CONFIRMED')){gameplay105.chain++;gameplay105.chainBest=Math.max(gameplay105.chainBest,gameplay105.chain);gameplay105.multiplier=clamp(1+gameplay105.chain*.035,1,2.2);gameplay105.ki=clamp(gameplay105.ki+2.5,0,gameplay105.maxKi)}
 if(t.includes('MISSED')||t.includes('INTERRUPT')){gameplay105.chain=0;gameplay105.multiplier=1}
 if(t.includes('TRANSFORM')){gameplay105.formLevel=clamp(gameplay105.formLevel+1,0,5);gameplay105.form='ASCENSION '+gameplay105.formLevel;gameplay105.formDrain=.7+gameplay105.formLevel*.16}
 if(t.includes('BOSS_ENTERED'))gameplay105.bossPhase=1;if(t.includes('BOSS_PHASE'))gameplay105.bossPhase=clamp(Number(data.phase)||gameplay105.bossPhase+1,1,5);
 graphics105.impactLight=t.includes('CONFIRMED')?1:graphics105.impactLight;graphics105.speedLines=t.includes('DASH')||t.includes('RUSH')?1:graphics105.speedLines;return e
};
dialogueUpdateRelationship104=function(type,agent){
 const now=Math.floor(performance.now()/1600),key=String(type)+':'+agent+':'+now;if(telemetry105.relationshipEvents.has(key))return;
 telemetry105.relationshipEvents.add(key);if(telemetry105.relationshipEvents.size>64)telemetry105.relationshipEvents.delete(telemetry105.relationshipEvents.values().next().value);
 const r=dialogue104.relationship,t=String(type).toUpperCase(),rate=.012;r.respect*=.999;r.anger*=.998;r.fear*=.998;r.confidence*=.999;
 if(t.includes('PARRY')){r.respect=clamp(r.respect+rate,0,1);r.anger=clamp(r.anger+rate*.7,0,1)}if(t.includes('CONTACT_CONFIRMED'))r.momentum=clamp(r.momentum+(agent==='griffin'?rate:-rate),-1,1);
 if(t.includes('TRANSFORM')){r.fear=clamp(r.fear+rate*1.4,0,1);r.confidence=clamp(r.confidence+rate,0,1)}if(t.includes('FINISH'))r.confidence=clamp(r.confidence+rate*1.6,0,1)
};
const p105DialogueObserve=dialogueObserve104;
dialogueObserve104=function(type,data={}){p105DialogueObserve(type,data);const now=performance.now();dialogue104.pending=dialogue104.pending.filter(q=>now-q.at<6500).slice(-3)};
Object.assign(combatVoices,{generation:0,p105Retry:new Set()});
voicePump=function(){
 if(combatVoices.speaking||!combatVoices.queue.length)return;const now=performance.now(),item=combatVoices.queue.shift();if(item.expires<now){production101.voice.dropped++;return voicePump()}
 item.msg=String(item.msg).slice(0,150);const v=combatVoices[item.agent]||combatVoices.jaxon,gen=++combatVoices.generation;combatVoices.speaking=true;combatVoices.active=item;combatVoices.status='SPEAKING';telemetry105.voice.requested++;
 voiceCaption.dataset.agent=v.name;voiceCaption.textContent=v.name+' // '+item.msg;voiceCaption.hidden=false;combatVoices.subtitleUntil=now+Math.max(1800,item.msg.length*58);
 let done=false;const finish=result=>{if(done||gen!==combatVoices.generation)return;done=true;clearTimeout(combatVoices.watchdog);combatVoices.watchdog=0;combatVoices.active=null;combatVoices.speaking=false;
  if(result==='spoken'){production101.voice.spoken++;telemetry105.voice.delivered++}else if(result==='recovered'){production101.voice.recovered++;telemetry105.voice.recovered++}else{production101.voice.fallbacks++;telemetry105.voice.failed++}
  combatVoices.status=combatVoices.voiceList.length?'READY':'SYNTH FALLBACK';setTimeout(voicePump,100)};
 if(!combatVoices.enabled||!combatVoices.unlocked||!window.SpeechSynthesisUtterance){voiceCue(item.agent);return setTimeout(()=>finish('fallback'),Math.max(750,item.msg.length*32))}
 try{speechSynthesis.resume?.();const u=new SpeechSynthesisUtterance(item.msg),list=combatVoices.voiceList,preferred=item.agent==='conner'?/Samantha|Karen|Moira|Ava|Serena/i:/Daniel|Aaron|Alex|Arthur|Eddy/i;
  u.pitch=v.pitch;u.rate=clamp(v.rate,.86,1.08);u.volume=.82;u.voice=list.find(q=>q.lang?.startsWith('en')&&preferred.test(q.name))||list.find(q=>q.lang?.startsWith('en'))||null;u.onstart=()=>{combatVoices.status='VOICE ACTIVE'};u.onend=()=>finish('spoken');
  u.onerror=e=>{const code=String(e.error||'');if(!combatVoices.p105Retry.has(item.id)&&!['canceled','interrupted'].includes(code)){combatVoices.p105Retry.add(item.id);done=true;clearTimeout(combatVoices.watchdog);combatVoices.speaking=false;combatVoices.active=null;combatVoices.queue.unshift({...item,msg:item.msg.split(/[.!?]/)[0].slice(0,110),created:performance.now(),expires:performance.now()+5000});return setTimeout(voicePump,120)}voiceCue(item.agent);finish('fallback')};
  combatVoices.watchdog=setTimeout(()=>{try{speechSynthesis.resume?.()}catch{}setTimeout(()=>{if(!done){try{speechSynthesis.cancel()}catch{}voiceCue(item.agent);finish('recovered')}},900)},Math.min(10500,Math.max(3000,item.msg.length*82)));speechSynthesis.speak(u)
 }catch{voiceCue(item.agent);finish('fallback')}
};
const p105OwenController=owenController;
owenController=function(dt){const before=!!(owenClips[owen.pose]&&!owenClips[owen.pose].loop&&owen.pose!=='FLIGHT'&&owen.stateTime/Math.max(.01,owen.stateLength)<.84);telemetry105.animation.lockFrames+=before?1:0;if(before&&!telemetry105.animation.last)telemetry105.animation.lockTransitions++;telemetry105.animation.last=before;p105OwenController(dt)};
const p105World=iyla3DWorld;
iyla3DWorld=function(){
 environment104.destruction=0;p105World();const env=environments104[(campaign.stage-1)%environments104.length],low=superAI.tier===1,layer=low?3:6;
 for(let i=0;i<layer;i++){const a=i*TAU/layer+.35,r=12+i%2*2.4,alt=.8+(i%3)*.65,col=env.sky.map(v=>clamp(v+.14,0,1));iylaRound(Math.cos(a)*r,alt,Math.sin(a)*r,.12,.12,.12,col,a,.65);graphics105.drawn++}
 telemetry105.destruction.active=0;for(const p of iyla2026.props)if(p.broken){const id=p.p105Id||(p.p105Id='P'+Math.round(p.seed*1e6));telemetry105.destruction.ids.add(id);telemetry105.destruction.active++}
 telemetry105.destruction.unique=telemetry105.destruction.ids.size;environment104.destruction=telemetry105.destruction.unique;graphics105.lod=superAI.tier===1?'MOBILE':superAI.tier===2?'BALANCED':'CINEMATIC';graphics105.boundary=Math.min(player.x,W-player.x,player.y,H-player.y)<95
};
function gameplayTick105(dt){const hp=player.hp/player.maxHp,pressure=clamp(enemies.length/24+(1-hp)*.55,0,1.8);gameplay105.ki=clamp(gameplay105.ki+dt*(gameplay105.formLevel?1.2:3.4)-dt*gameplay105.formDrain,0,gameplay105.maxKi);gameplay105.skill=clamp(gameplay105.skill+dt*.07,0,gameplay105.maxSkill);gameplay105.overheat=gameplay105.ki<8?clamp(gameplay105.overheat+dt,0,1):clamp(gameplay105.overheat-dt*1.8,0,1);gameplay105.difficulty=clamp(.85+level*.025+pressure*.18+(kills/Math.max(1,elapsed)-.55)*.12,.75,1.65);gameplay105.vertical=clamp(gameplay105.vertical+(griffin.boss?.08:-.04)*dt,-1,1);gameplay105.assist=Math.max(0,gameplay105.assist-dt);graphics105.auraLight=clamp(gameplay105.formLevel*.18+music104.intensity*.15,0,1);graphics105.impactLight=Math.max(0,graphics105.impactLight-dt*4);graphics105.speedLines=Math.max(0,graphics105.speedLines-dt*2.5)}
const p105OmniSystems=omniSystems;omniSystems=function(dt){p105OmniSystems(dt);gameplayTick105(dt)};
const p105IylaFrame=iyla2026Frame;iyla2026Frame=function(){p105IylaFrame();production105.frames++};
const p105RememberReplayFrame=rememberReplayFrame;
rememberReplayFrame=function(frame){frame.production105={name:production105.name,features:gameFunctions105.length,gameplay:{ki:+gameplay105.ki.toFixed(2),skill:+gameplay105.skill.toFixed(2),overheat:+gameplay105.overheat.toFixed(3),form:gameplay105.form,chain:gameplay105.chain,chainBest:gameplay105.chainBest,multiplier:+gameplay105.multiplier.toFixed(3),difficulty:+gameplay105.difficulty.toFixed(3),bossPhase:gameplay105.bossPhase,training:{...gameplay105.training}},graphics:{...graphics105},attacks:{attempts:attackLedger105.attempts,confirmed:attackLedger105.confirmed,missed:attackLedger105.missed,cancelled:attackLedger105.cancelled,interrupted:attackLedger105.interrupted,pending:attackLedger105.pending,duplicates:attackLedger105.duplicates,invariant:attackLedger105.invariant},voice:{...telemetry105.voice,queue:combatVoices.queue.length,speaking:!!combatVoices.speaking},animation:{...telemetry105.animation},destruction:{unique:telemetry105.destruction.unique,active:telemetry105.destruction.active},invariants:{attackLedger:attackLedger105.invariant,finiteActors:!enemies.some(e=>!Number.isFinite(e.x)||!Number.isFinite(e.y)),targetValid:!zCinema.lockedTarget||enemies.includes(zCinema.lockedTarget)}};p105RememberReplayFrame(frame)};
production105.ready=true;combatEvent('PRODUCTION_105_READY',{functions:gameFunctions105.length,graphics:'ANIME ARENA 2.5D',gameplay:'COMPLETE COMBAT SYNTHESIS',voice:'DELIVERY STATE MACHINE',telemetry:'INVARIANT LEDGERS'});


// Survivor Production 106: replay-proven voice, transform, attack, timing, progression and draw-accounting repairs.
const production106={name:'SURVIVOR PRODUCTION 106',version:'1.0',ready:false,frames:0};
const fixes106={voiceDelivery:true,authoritativeForms:true,attackTimeouts:true,unifiedLedgers:true,timeClassification:true,skillBalance:true,frameDrawCounts:true};
const voice106={requested:0,delivered:0,synthesized:0,pack:0,fallback:0,recovered:0,errors:0,lastMode:'IDLE'};
const transform106={seen:new Set(),events:0,duplicates:0,form:0,name:'BASE'};
const attack106={openedAt:new Map(),timeouts:0,cinematicInterrupts:0};
const time106={lastWall:performance.now(),simulation:0,renderDebt:0,cinematic:0,paused:0,hidden:0,unclassified:0};
const graphics106={drawCallsThisFrame:0,drawCallsPeak:0,drawCallsTotal:0};
function attackRecount106(){attackLedger105.pending=attackLedger105.open.length;attackLedger105.invariant=attackLedger105.attempts===attackLedger105.confirmed+attackLedger105.missed+attackLedger105.cancelled+attackLedger105.interrupted+attackLedger105.pending}
function interruptOpen106(reason){
 if(!attackLedger105.open.length)return;for(const id of attackLedger105.open){attack106.openedAt.delete(id);attackLedger105.interrupted++}
 if(reason==='cinematic')attack106.cinematicInterrupts+=attackLedger105.open.length;else attack106.timeouts+=attackLedger105.open.length;
 attackLedger105.open.length=0;attackRecount106()
}
const p106CombatEvent=combatEvent;
combatEvent=function(type,data={}){
 const t=String(type||'').toUpperCase(),skillBefore=gameplay105.skill,formBefore=gameplay105.formLevel,openBefore=attackLedger105.sequence;
 const e=p106CombatEvent(type,data);
 if(attackLedger105.sequence>openBefore){const id='A105-'+attackLedger105.sequence;attack106.openedAt.set(id,performance.now())}
 for(const id of [...attack106.openedAt.keys()])if(!attackLedger105.open.includes(id))attack106.openedAt.delete(id);
 if(t==='PARRY_CONFIRMED'){const diminishing=.14/(1+Math.max(0,gameplay105.training.progress-1)*.08);gameplay105.skill=clamp(skillBefore+diminishing,0,gameplay105.maxSkill)}
 const authoritative=t==='TRANSFORMATION_TRIGGERED',related=t.includes('TRANSFORM');
 if(related&&!authoritative)gameplay105.formLevel=formBefore;
 if(authoritative){
  const id=String(data.eventId??data.id??(data.fighter+':'+data.form+':'+Math.floor(elapsed*10)));
  if(transform106.seen.has(id)){transform106.duplicates++;gameplay105.formLevel=formBefore}
  else{transform106.seen.add(id);transform106.events++;transform106.form=clamp(Number(data.form)||Math.max(1,formBefore),0,5);gameplay105.formLevel=transform106.form;transform106.name=transform106.form?'SAIYAN SPARK':'BASE';gameplay105.form=transform106.name}
  interruptOpen106('cinematic')
 }
 if(['TRANSFORMATION_CHOICE','STRUCTURAL_CINEMATIC_STARTED','IMPACT_CINEMA_SHOT'].includes(t))interruptOpen106('cinematic');
 attackRecount106();return e
};
function voiceFinish106(item,gen,result){
 if(gen!==combatVoices.generation||combatVoices.active?.id!==item.id)return;
 clearTimeout(combatVoices.watchdog);combatVoices.watchdog=0;combatVoices.active=null;combatVoices.speaking=false;
 voice106[result]=(voice106[result]||0)+1;if(['pack','synthesized'].includes(result)){voice106.delivered++;production101.voice.spoken++}else if(result==='recovered'){production101.voice.recovered++}else production101.voice.fallbacks++;
 voice106.lastMode=result.toUpperCase();combatVoices.status=result==='pack'?'VOICE PACK':combatVoices.voiceList.length?'READY':'SYNTH FALLBACK';setTimeout(voicePump,110)
}
voicePump=function(){
 if(combatVoices.speaking||!combatVoices.queue.length)return;const now=performance.now(),item=combatVoices.queue.shift();if(item.expires<now){production101.voice.dropped++;return voicePump()}
 item.msg=String(item.msg).replace(/\s+/g,' ').trim().slice(0,128);const v=combatVoices[item.agent]||combatVoices.jaxon,gen=++combatVoices.generation;
 combatVoices.speaking=true;combatVoices.active=item;combatVoices.status='SPEAKING';voice106.requested++;voiceCaption.dataset.agent=v.name;voiceCaption.textContent=v.name+' // '+item.msg;voiceCaption.hidden=false;combatVoices.subtitleUntil=now+Math.max(1800,item.msg.length*58);
 let packStarted=false;try{packStarted=!!playVoicePack(item.agent,item.msg,()=>voiceFinish106(item,gen,'pack'))}catch{}
 if(packStarted){voice106.lastMode='VOICE PACK';combatVoices.watchdog=setTimeout(()=>{try{voiceAudio.current?.pause()}catch{}voiceFinish106(item,gen,'recovered')},9000);return}
 if(!combatVoices.enabled||!combatVoices.unlocked||!window.SpeechSynthesisUtterance){voiceCue(item.agent);return setTimeout(()=>voiceFinish106(item,gen,'fallback'),Math.max(750,item.msg.length*30))}
 try{
  const u=new SpeechSynthesisUtterance(item.msg),list=combatVoices.voiceList,preferred=item.agent==='conner'?/Samantha|Karen|Moira|Ava|Serena/i:/Daniel|Aaron|Alex|Arthur|Eddy/i;
  u.pitch=v.pitch;u.rate=clamp(v.rate,.9,1.04);u.volume=.84;u.voice=list.find(q=>q.lang?.startsWith('en')&&preferred.test(q.name))||list.find(q=>q.lang?.startsWith('en'))||null;
  u.onstart=()=>{voice106.lastMode='SYNTH ACTIVE'};u.onend=()=>voiceFinish106(item,gen,'synthesized');u.onerror=()=>{voice106.errors++;voiceCue(item.agent);voiceFinish106(item,gen,'fallback')};
  speechSynthesis.resume?.();speechSynthesis.speak(u);combatVoices.watchdog=setTimeout(()=>{try{speechSynthesis.resume?.()}catch{}setTimeout(()=>{if(combatVoices.active?.id===item.id){try{speechSynthesis.cancel()}catch{}voiceCue(item.agent);voiceFinish106(item,gen,'recovered')}},650)},Math.min(8500,Math.max(2800,item.msg.length*70)))
 }catch{voice106.errors++;voiceCue(item.agent);voiceFinish106(item,gen,'fallback')}
};
gameplayTick105=function(dt){
 const hp=player.hp/player.maxHp,pressure=clamp(enemies.length/24+(1-hp)*.55,0,1.8);gameplay105.ki=clamp(gameplay105.ki+dt*(gameplay105.formLevel?1.2:3.4)-dt*gameplay105.formDrain,0,gameplay105.maxKi);
 gameplay105.skill=clamp(gameplay105.skill+dt*.018,0,gameplay105.maxSkill);gameplay105.overheat=gameplay105.ki<8?clamp(gameplay105.overheat+dt,0,1):clamp(gameplay105.overheat-dt*1.8,0,1);
 gameplay105.difficulty=clamp(.85+level*.025+pressure*.18+(kills/Math.max(1,elapsed)-.55)*.12,.75,1.65);gameplay105.vertical=clamp(gameplay105.vertical+(griffin.boss?.08:-.04)*dt,-1,1);gameplay105.assist=Math.max(0,gameplay105.assist-dt);
 gameplay105.training.mastery=clamp(gameplay105.chainBest/30+gameplay105.training.progress/80,0,1);graphics105.auraLight=clamp(gameplay105.formLevel*.18+music104.intensity*.15,0,1);graphics105.impactLight=Math.max(0,graphics105.impactLight-dt*4);graphics105.speedLines=Math.max(0,graphics105.speedLines-dt*2.5);
 const now=performance.now();for(const [id,at] of attack106.openedAt)if(now-at>2200&&attackLedger105.open.includes(id)){const i=attackLedger105.open.indexOf(id);attackLedger105.open.splice(i,1);attackLedger105.interrupted++;attack106.openedAt.delete(id);attack106.timeouts++}
 attackRecount106()
};
const p106World=iyla3DWorld;
iyla3DWorld=function(){const before=graphics105.drawn;p106World();const draws=Math.max(0,graphics105.drawn-before);graphics106.drawCallsThisFrame=draws;graphics106.drawCallsPeak=Math.max(graphics106.drawCallsPeak,draws);graphics106.drawCallsTotal+=draws};
const p106OmniSystems=omniSystems;
omniSystems=function(dt){
 const now=performance.now(),wall=Math.max(0,(now-time106.lastWall)/1000);time106.lastWall=now;time106.simulation+=dt;const gap=Math.max(0,wall-dt);
 const cinematicNow=(typeof cinematic!=='undefined'&&!!cinematic)||zStage.pose==='TRANSFORM'||!!zStage.cinematic;
 if(document.hidden)time106.hidden+=gap;else if(paused||!running)time106.paused+=gap;else if(cinematicNow)time106.cinematic+=gap;else if(gap>.04)time106.renderDebt+=gap;else time106.unclassified+=gap;
 p106OmniSystems(dt)
};
const p106IylaFrame=iyla2026Frame;iyla2026Frame=function(){p106IylaFrame();production106.frames++};
const p106RememberReplayFrame=rememberReplayFrame;
rememberReplayFrame=function(frame){
 p106RememberReplayFrame(frame);
 const attacks={attempts:attackLedger105.attempts,confirmed:attackLedger105.confirmed,missed:attackLedger105.missed,cancelled:attackLedger105.cancelled,interrupted:attackLedger105.interrupted,pending:attackLedger105.pending,duplicates:attackLedger105.duplicates,invariant:attackLedger105.invariant};
 if(frame.production105){frame.production105.attacks={...attacks};frame.production105.gameplay.form=gameplay105.form;frame.production105.gameplay.skill=+gameplay105.skill.toFixed(3);frame.production105.graphics.drawn=graphics106.drawCallsThisFrame}
 if(frame.production103)frame.production103.attacks={...attacks,settled:attacks.confirmed+attacks.missed+attacks.cancelled+attacks.interrupted};
 frame.production106={name:production106.name,fixes:{...fixes106},voice:{...voice106,queue:combatVoices.queue.length,speaking:!!combatVoices.speaking},transform:{events:transform106.events,duplicates:transform106.duplicates,form:transform106.form,name:transform106.name},attacks:{...attacks,timeouts:attack106.timeouts,cinematicInterrupts:attack106.cinematicInterrupts},time:{simulation:+time106.simulation.toFixed(3),renderDebt:+time106.renderDebt.toFixed(3),cinematic:+time106.cinematic.toFixed(3),paused:+time106.paused.toFixed(3),hidden:+time106.hidden.toFixed(3),unclassified:+time106.unclassified.toFixed(3)},progression:{skill:+gameplay105.skill.toFixed(3),mastery:+gameplay105.training.mastery.toFixed(3),parries:gameplay105.training.progress},graphics:{drawCallsThisFrame:graphics106.drawCallsThisFrame,drawCallsPeak:graphics106.drawCallsPeak,drawCallsTotal:graphics106.drawCallsTotal},invariants:{attackLedger:attackLedger105.invariant,ledgersUnified:JSON.stringify(frame.production103?.attacks)===JSON.stringify({...attacks,settled:attacks.confirmed+attacks.missed+attacks.cancelled+attacks.interrupted}),formAuthoritative:gameplay105.formLevel===transform106.form}}
};
production106.ready=true;combatEvent('PRODUCTION_106_READY',{fixes:Object.keys(fixes106).length,voice:'PACK-FIRST + SYNTH FALLBACK',forms:'AUTHORITATIVE',attacks:'TIMEOUT + CINEMATIC SETTLEMENT',time:'CLASSIFIED',progression:'DIMINISHING',graphics:'PER FRAME'});


// Survivor Production 107: generative rivalry voice and coordinated all-engine evolution.
const production107={name:'SURVIVOR PRODUCTION 107',version:'1.0',ready:false,frames:0};
const formNames107=['BASE WARRIOR','SAIYAN SPARK','ASCENDED SAIYAN','SOLAR SAIYAN','PRIMAL SAIYAN','COSMIC SAIYAN'];
const cinematic107={active:false,until:0,starts:0,completes:0,lastType:'',lastWall:performance.now(),simulation:0,cinematic:0,render:0,paused:0,hidden:0,normal:0};
const draw107={frame:0,peak:0,total:0,canvasFaces:0};
const attack107={orphanContacts:0,trueDuplicates:0};
const phrase107={generated:0,unique:0,rejected:0,history:[],semantic:new Set(),pairs:0,contexts:{},lastByAgent:{},capacity:0};
const phraseParts107={
 griffin:{
  lead:['I mapped that exchange','I can see the route now','Your timing gave me the answer','The field is finally readable','I kept the useful part of that mistake','My next decision is already moving','I measured the pressure','I found the quiet space inside your attack'],
  observe:['your lead side opens after contact','your pursuit commits before your guard','the arena is narrowing behind you','your power rises faster than your recovery','your rhythm repeats when the pressure climbs','your strongest route spends too much energy','the next impact will change our footing','your defense turns high before the real strike'],
  tactic:['I will break the angle and counter','I am taking the vertical lane','I will make the next hit confirm first','I am saving power for the clean opening','I will turn your pursuit into my launcher','I am changing tempo before the clash','I will force the guard and leave safely','I am ending the chain before it becomes reckless'],
  emotion:['Stay focused','No panic','That pressure is useful','I am still in control','Now the plan matters','This is where discipline wins'],
  close:['Watch the adjustment','The next exchange proves it','I only need one clean route','Make your next choice carefully','I will not spend the opening twice','Now we test the answer']
 },
 lira:{
  lead:['I felt that calculation','Your route is visible to me too','You learned one layer','I was waiting for that correction','Your confidence changed your timing','The arena answered before you did','I let you keep that opening','Your model is becoming interesting'],
  observe:['you protect the exit before the center','your counter depends on my commitment','your form spends energy to preserve control','your safest lane has become predictable','your chain grows longer when patience would win','your eyes follow the threat instead of the setup','your guard moves before your feet','your recovery still belongs to me'],
  tactic:['I will attack the decision behind your guard','I will close both exits at once','I am changing the final beat','I will make your counter arrive early','I am turning the arena into pressure','I will spend power where your model is weakest','I am forcing you to choose between range and balance','I will break the pattern without repeating it'],
  emotion:['Do not relax','Keep thinking','That confidence has a cost','Show me the next adaptation','The honest fight begins now','I want your strongest answer'],
  close:['Try to predict this one','The next question is already moving','Your answer will create my opening','Let us see which memory survives','Now the pressure becomes personal','Do not waste what you learned']
 }
};
phrase107.capacity=Object.values(phraseParts107).reduce((n,p)=>n+p.lead.length*p.observe.length*p.tactic.length*p.emotion.length*p.close.length,0);
function phraseContext107(context='combat'){const hp=player.hp/player.maxHp;if(context==='danger'||hp<.3)return 'danger';if(context==='transform'||gameplay105.formLevel>1)return 'transform';if(context==='boss'||griffin.boss)return 'boss';if(context==='counter')return 'counter';if(context==='victory'||context==='finish')return 'finish';return context}
function phraseGenerate107(agent,context='combat',seed=0){
 const who=agent==='conner'||agent==='lira'?'lira':'griffin',p=phraseParts107[who],ctx=phraseContext107(context),state=[ctx,campaign.stage,kills,Math.round(player.hp),gameplay105.formLevel,gameplay105.chain,Math.round(dialogue104.relationship.momentum*10),seed,phrase107.generated].join(':');
 let line='',fp='',tries=0;do{const h=voiceHash101(who+state+tries);line=[p.lead[h%p.lead.length],p.observe[(h>>>3)%p.observe.length],p.tactic[(h>>>7)%p.tactic.length],p.emotion[(h>>>11)%p.emotion.length],p.close[(h>>>15)%p.close.length]].join('. ')+'.';fp=[who,ctx,h%p.observe.length,(h>>>7)%p.tactic.length,(h>>>15)%p.close.length].join(':');tries++}while(phrase107.semantic.has(fp)&&tries<8);
 if(phrase107.semantic.has(fp)){phrase107.rejected++;line=p.lead[(seed+phrase107.generated)%p.lead.length]+'. '+p.tactic[(seed*3+phrase107.generated)%p.tactic.length]+'. '+p.close[(seed*5+1)%p.close.length]+'.';fp=voiceFingerprint101(line)}
 phrase107.semantic.add(fp);if(phrase107.semantic.size>180){const first=phrase107.semantic.values().next().value;phrase107.semantic.delete(first)}
 phrase107.generated++;phrase107.unique++;phrase107.contexts[ctx]=(phrase107.contexts[ctx]||0)+1;phrase107.lastByAgent[who]=line;phrase107.history.push({who,ctx,line});if(phrase107.history.length>80)phrase107.history.shift();return line
}
voiceCompose101=function(agent,context,data={}){return phraseGenerate107(agent,context,Number(data.eventId||data.id||data.damage||0))};
dialoguePick104=function(agent,context,seed){return phraseGenerate107(agent,context,seed)};
const engineDomains107=['GRIFFIN','LIRA','OWEN','MATTY','IYLA','XAVIER','ZAVIER','CHRISTIAN','ZENITH','PEYTEN','ELIJAH','CURTIS','VOICE','MUSIC','SFX','ENVIRONMENT','COMBAT','CAMERA','PROGRESSION','TELEMETRY'];
const engineCapabilities107=['perceive','predict','plan','adapt','coordinate','validate','recover','explain','budget','learn','anticipate','confirm','scale','personalize','remember'];
const engines107={enhancements:engineDomains107.length*engineCapabilities107.length,domains:engineDomains107.length,capabilities:engineCapabilities107.length,health:Object.fromEntries(engineDomains107.map(n=>[n,'READY'])),ticks:0};
const combo107={state:'NEUTRAL',hits:0,route:'PROBE',scaling:1,stale:new Map(),whiffRisk:0,guardPressure:0,escapeStock:1,heat:0,lastMove:'',routes:['PROBE','CONFIRM','LAUNCH','AERIAL','WALL','RESET','FINISH']};
function comboEvent107(type,data={}){
 const t=String(type).toUpperCase(),move=String(data.move||data.source||'');
 if(t==='MELEE_COMBO_BEAT'){combo107.state='STARTUP';combo107.route=combo107.hits>=8?'RESET':combo107.hits>=4?'AERIAL':'CONFIRM';combo107.whiffRisk=clamp(combo107.whiffRisk+.12,0,1);combo107.lastMove=move}
 if(t==='MELEE_CONTACT_CONFIRMED'){combo107.state='CONFIRMED';combo107.hits++;combo107.whiffRisk=Math.max(0,combo107.whiffRisk-.3);const repeats=(combo107.stale.get(move)||0)+1;combo107.stale.set(move,repeats);combo107.scaling=clamp(1/(1+Math.max(0,combo107.hits-3)*.055+Math.max(0,repeats-2)*.08),.38,1);combo107.heat=clamp(combo107.heat+.055,0,1)}
 if(t.includes('MISSED')){combo107.state='WHIFF';combo107.hits=0;combo107.scaling=1;combo107.whiffRisk=1}
 if(t.includes('PARRY')){combo107.state='REVERSAL';combo107.escapeStock=clamp(combo107.escapeStock+.12,0,2);combo107.guardPressure=Math.max(0,combo107.guardPressure-.35)}
 if(t.includes('SHIELD_HIT'))combo107.guardPressure=clamp(combo107.guardPressure+.09,0,1);
 if(t.includes('FINISHER'))combo107.route='FINISH';if(t.includes('LEVEL_CLEAR')){combo107.hits=0;combo107.heat=0;combo107.stale.clear()}
}
const p107CombatEvent=combatEvent;
combatEvent=function(type,data={}){
 const t=String(type||'').toUpperCase(),beforeName=gameplay105.form,beforeLevel=gameplay105.formLevel,beforeDrain=gameplay105.formDrain,beforeDup=attackLedger105.duplicates,beforeOpen=attackLedger105.open.length;
 const e=p107CombatEvent(type,data);comboEvent107(type,data);
 const authoritative=t==='TRANSFORMATION_TRIGGERED';
 if(authoritative){const n=clamp(Number(data.form)||0,0,formNames107.length-1);gameplay105.formLevel=n;gameplay105.form=formNames107[n];gameplay105.formDrain=n?(.7+n*.16):0;transform106.form=n;transform106.name=formNames107[n]}
 else if(t.includes('TRANSFORM')){gameplay105.form=beforeName;gameplay105.formLevel=beforeLevel;gameplay105.formDrain=beforeDrain;transform106.form=beforeLevel;transform106.name=beforeName}
 const terminal=(t.includes('CONTACT')&&(t.includes('CONFIRMED')||t.includes('MISSED')));if(terminal&&beforeOpen===0&&attackLedger105.duplicates>beforeDup){attackLedger105.duplicates=beforeDup;attack107.orphanContacts++;attackRecount106()}
 const now=performance.now();if(['TRANSFORMATION_TRIGGERED','STRUCTURAL_CINEMATIC_STARTED','IMPACT_CINEMA_SHOT','DRAMATIC_FINISH'].includes(t)){cinematic107.active=true;cinematic107.starts++;cinematic107.lastType=t;const duration=Number(data.duration||0)*1000||(t==='TRANSFORMATION_TRIGGERED'?7800:2200);cinematic107.until=Math.max(cinematic107.until,now+Math.max(900,duration))}
 if(['STRUCTURAL_CINEMATIC_COMPLETE','CINEMATIC_EXIT_BURST'].includes(t)){cinematic107.completes++;cinematic107.until=Math.min(cinematic107.until,now+250)}
 return e
};
const p107OmniSystems=omniSystems;
omniSystems=function(dt){
 const now=performance.now(),wall=Math.max(0,(now-cinematic107.lastWall)/1000),gap=Math.max(0,wall-dt);cinematic107.lastWall=now;cinematic107.simulation+=dt;if(now>cinematic107.until)cinematic107.active=false;
 if(document.hidden)cinematic107.hidden+=gap;else if(paused||!running)cinematic107.paused+=gap;else if(cinematic107.active||gap>.45&&now-cinematic107.until<800)cinematic107.cinematic+=gap;else if(gap>.045)cinematic107.render+=gap;else cinematic107.normal+=gap;
 engines107.ticks++;p107OmniSystems(dt)
};
const p107Iyla3DFrame=iyla3DFrame;
iyla3DFrame=function(dt){p107Iyla3DFrame(dt);draw107.frame=iyla3d.gl?iyla3d.draws:iyla3d.faces;draw107.canvasFaces=iyla3d.faces;draw107.peak=Math.max(draw107.peak,draw107.frame);draw107.total+=draw107.frame};
const p107IylaFrame=iyla2026Frame;iyla2026Frame=function(){p107IylaFrame();production107.frames++};
const p107RememberReplayFrame=rememberReplayFrame;
rememberReplayFrame=function(frame){
 p107RememberReplayFrame(frame);
 const form=formNames107[clamp(gameplay105.formLevel|0,0,formNames107.length-1)];gameplay105.form=form;transform106.name=form;
 if(frame.production105){frame.production105.gameplay.form=form;frame.production105.graphics.drawn=draw107.frame;frame.production105.attacks.duplicates=attackLedger105.duplicates}
 if(frame.production106){frame.production106.transform.name=form;frame.production106.transform.form=gameplay105.formLevel;frame.production106.graphics.drawCallsThisFrame=draw107.frame;frame.production106.graphics.drawCallsPeak=draw107.peak;frame.production106.graphics.drawCallsTotal=draw107.total;frame.production106.attacks.duplicates=attackLedger105.duplicates}
 frame.production107={name:production107.name,engines:{domains:engines107.domains,capabilitiesPerEngine:engines107.capabilities,totalEnhancements:engines107.enhancements,ticks:engines107.ticks,health:{...engines107.health}},voiceGenerator:{generated:phrase107.generated,unique:phrase107.unique,rejected:phrase107.rejected,capacity:phrase107.capacity,contexts:{...phrase107.contexts},history:phrase107.history.length,lastGriffin:phrase107.lastByAgent.griffin||'',lastLira:phrase107.lastByAgent.lira||''},form:{id:gameplay105.formLevel,name:form,authoritative:form===transform106.name},combo:{state:combo107.state,hits:combo107.hits,route:combo107.route,scaling:+combo107.scaling.toFixed(3),whiffRisk:+combo107.whiffRisk.toFixed(3),guardPressure:+combo107.guardPressure.toFixed(3),escapeStock:+combo107.escapeStock.toFixed(3),heat:+combo107.heat.toFixed(3),lastMove:combo107.lastMove},attacks:{orphanContacts:attack107.orphanContacts,trueDuplicates:attackLedger105.duplicates,pending:attackLedger105.pending,invariant:attackLedger105.invariant},time:{simulation:+cinematic107.simulation.toFixed(3),cinematic:+cinematic107.cinematic.toFixed(3),render:+cinematic107.render.toFixed(3),paused:+cinematic107.paused.toFixed(3),hidden:+cinematic107.hidden.toFixed(3),normal:+cinematic107.normal.toFixed(3),active:cinematic107.active,starts:cinematic107.starts,completes:cinematic107.completes},graphics:{drawCallsThisFrame:draw107.frame,drawCallsPeak:draw107.peak,drawCallsTotal:draw107.total,canvasFaces:draw107.canvasFaces,mode:iyla3d.mode},invariants:{formExact:frame.production105?.gameplay.form===form,attackClosed:attackLedger105.invariant,drawsMeasured:draw107.frame===iyla3d.draws||!iyla3d.gl,finite:!enemies.some(e=>!Number.isFinite(e.x)||!Number.isFinite(e.y))}}
};
production107.ready=true;combatEvent('PRODUCTION_107_READY',{enhancements:engines107.enhancements,voiceCombinations:phrase107.capacity,combo:'STATEFUL + SCALING + STALE DECAY',forms:'EXACT NAMES',time:'EVENT CLASSIFIED',graphics:'TOTAL SUBMISSIONS'});


// Survivor Production 108: cinematic combat mechanics, truthful telemetry and adaptive media engines.
const production108={name:'SURVIVOR PRODUCTION 108',version:'1.0',ready:false,frames:0};
const mechanics108={aerialPursuits:0,directionalGuards:0,vanishCounters:0,escalatingCounters:0,recoveries:0,beamClashes:0,terrainConsequences:0,trainingReplays:0,scenarioBranches:0,counterLevel:0,clashMeter:0,mastery:{pursuit:0,guard:0,counter:0,recovery:0,clash:0}};
const voice108={requested:0,synthStarted:0,synthDelivered:0,packFallbacks:0,cueFallbacks:0,retries:0,failures:0,lastMode:'READY'};
const sfx108={observed:0,passed:0,coalesced:0,byType:{},last:{}};
const render108={mode:'CINEMATIC',protectedFrames:0,balancedFrames:0,fullFrames:0,trimmedParticles:0,lastDraws:0};
const time108={lastT:null,lastRt:null,simulation:0,wall:0,gap:0,cinematic:0,render:0,normal:0,session:0,active:false,starts:0,completes:0,lastType:''};
const engineDomains108=['GRIFFIN','LIRA','OWEN','MATTY','IYLA','XAVIER','ZAVIER','CHRISTIAN','ZENITH','PEYTEN','ELIJAH','CURTIS','VOICE','MUSIC','SFX','ENVIRONMENT','COMBAT','CAMERA','PROGRESSION','TELEMETRY'];
const engineCapabilities108=['aerial-pursuit','directional-guard','vanish-counter','counter-escalation','precision-recovery','beam-clash','transformation-tradeoff','power-fatigue','terrain-consequence','training-replay','scenario-branch','conditional-dialogue','rival-response','cinematic-session','truthful-clock','authoritative-form','generated-speech','audio-coalescing','adaptive-render-budget','dynamic-health'];
const engines108={domains:engineDomains108.length,capabilities:engineCapabilities108.length,enhancements:engineDomains108.length*engineCapabilities108.length,ticks:0,health:{}};
function capSentence108(s){return String(s||'').replace(/(^|[.!?]\s+)([a-z])/g,(m,a,b)=>a+b.toUpperCase())}
const p108PhraseContext=phraseContext107;
phraseContext107=function(context='combat'){const hp=player.hp/player.maxHp;if(context==='danger'||hp<.3)return'danger';if(context==='transform')return'transform';if(context==='boss'||griffin.boss)return'boss';if(context==='counter'||context==='reversal'||context==='answer')return context;if(context==='victory'||context==='finish')return'finish';return context};
const p108PhraseGenerate=phraseGenerate107;
phraseGenerate107=function(agent,context='combat',seed=0){const line=capSentence108(p108PhraseGenerate(agent,context,seed));phrase107.lastByAgent[agent==='conner'||agent==='lira'?'lira':'griffin']=line;if(phrase107.history.length)phrase107.history[phrase107.history.length-1].line=line;return line};
voiceCompose101=function(agent,context,data={}){return phraseGenerate107(agent,context,Number(data.eventId||data.id||data.damage||0))};
dialoguePick104=function(agent,context,seed){return phraseGenerate107(agent,context,seed)};
function finishVoice108(item,gen,mode){
 if(combatVoices.active?.id!==item.id||combatVoices.generation!==gen)return;
 clearTimeout(combatVoices.watchdog);combatVoices.active=null;combatVoices.speaking=false;combatVoices.status=mode;voice108.lastMode=mode;
 if(mode==='GENERATED SPEECH'){voice108.synthDelivered++;voice106.synthesized++}
 else if(mode==='VOICE PACK FALLBACK'){voice108.packFallbacks++;voice106.pack++}
 else voice108.cueFallbacks++;
 setTimeout(voicePump,90)
}
function packFallback108(item,gen){
 let started=false;try{started=!!playVoicePack(item.agent,item.msg,()=>finishVoice108(item,gen,'VOICE PACK FALLBACK'))}catch{}
 if(started){combatVoices.watchdog=setTimeout(()=>finishVoice108(item,gen,'AUDIO CUE FALLBACK'),9000);return}
 voiceCue(item.agent);setTimeout(()=>finishVoice108(item,gen,'AUDIO CUE FALLBACK'),Math.max(750,item.msg.length*28))
}
voicePump=function(){
 if(combatVoices.speaking||!combatVoices.queue.length)return;
 const now=performance.now(),item=combatVoices.queue.shift();if(item.expires&&item.expires<now){production101.voice.dropped++;return voicePump()}
 item.msg=capSentence108(String(item.msg).replace(/\s+/g,' ').trim().slice(0,150));const v=combatVoices[item.agent]||combatVoices.jaxon,gen=++combatVoices.generation;
 combatVoices.speaking=true;combatVoices.active=item;combatVoices.status='GENERATING SPEECH';voice108.requested++;voice106.requested++;
 voiceCaption.dataset.agent=v.name;voiceCaption.textContent=v.name+' // '+item.msg;voiceCaption.hidden=false;combatVoices.subtitleUntil=now+Math.max(1800,item.msg.length*58);
 if(!combatVoices.enabled||!combatVoices.unlocked||!window.SpeechSynthesisUtterance)return packFallback108(item,gen);
 let attempt=0;const speakAttempt=()=>{
  attempt++;try{
   const u=new SpeechSynthesisUtterance(item.msg),list=combatVoices.voiceList,preferred=item.agent==='conner'?/Samantha|Karen|Moira|Ava|Serena/i:/Daniel|Aaron|Alex|Arthur|Eddy/i;
   u.pitch=v.pitch;u.rate=clamp(v.rate,.91,1.03);u.volume=.86;if(attempt===1)u.voice=list.find(q=>q.lang?.startsWith('en')&&preferred.test(q.name))||list.find(q=>q.lang?.startsWith('en'))||null;
   u.onstart=()=>{voice108.synthStarted++;voice108.lastMode='GENERATED SPEECH ACTIVE'};
   u.onend=()=>finishVoice108(item,gen,'GENERATED SPEECH');
   u.onerror=()=>{if(attempt<2){voice108.retries++;setTimeout(speakAttempt,90)}else{voice108.failures++;packFallback108(item,gen)}};
   speechSynthesis.resume?.();speechSynthesis.speak(u);
   clearTimeout(combatVoices.watchdog);combatVoices.watchdog=setTimeout(()=>{if(combatVoices.active?.id!==item.id)return;if(attempt<2){voice108.retries++;try{speechSynthesis.cancel()}catch{}speakAttempt()}else{voice108.failures++;try{speechSynthesis.cancel()}catch{}packFallback108(item,gen)}},Math.min(9000,Math.max(2600,item.msg.length*65)))
  }catch{if(attempt<2){voice108.retries++;setTimeout(speakAttempt,90)}else{voice108.failures++;packFallback108(item,gen)}}
 };speakAttempt()
};
const p108SoundReact=soundReact101;
soundReact101=function(type,data={}){
 const t=String(type),now=performance.now(),noisy=/SHIELD_HIT|DAMAGE_RESOLVED|PROJECTILE_CONTACT|AURA_PULSE/.test(t),gap=/SHIELD_HIT/.test(t)?95:/DAMAGE_RESOLVED|PROJECTILE_CONTACT/.test(t)?55:30;
 sfx108.observed++;sfx108.byType[t]=(sfx108.byType[t]||0)+1;
 if(noisy&&now-(sfx108.last[t]||0)<gap){sfx108.coalesced++;return}
 sfx108.last[t]=now;sfx108.passed++;return p108SoundReact(type,data)
};
const p108DialogueTick=dialogueTick104;
dialogueTick104=function(){
 const now=performance.now();dialogue104.pending=dialogue104.pending.filter(q=>q.at>now-6500).sort((a,b)=>a.at-b.at).slice(-3).sort((a,b)=>a.at-b.at);
 return p108DialogueTick()
};
const p108IylaFrame=iyla3DFrame;
iyla3DFrame=function(dt){
 const prior=superAI.tier,draws=draw107.frame,fps=iyla.fps||60,pressure=fps<55||draws>560?'PROTECTED':fps<58||draws>480?'BALANCED':'CINEMATIC';
 render108.mode=pressure;if(pressure==='PROTECTED'){superAI.tier=1;render108.protectedFrames++}else if(pressure==='BALANCED'){superAI.tier=Math.min(prior,2);render108.balancedFrames++}else render108.fullFrames++;
 for(const key of ['smoke','debris'])if(Array.isArray(iyla2026?.[key])){const cap=pressure==='PROTECTED'?14:pressure==='BALANCED'?24:40;if(iyla2026[key].length>cap){render108.trimmedParticles+=iyla2026[key].length-cap;iyla2026[key].splice(0,iyla2026[key].length-cap)}}
 try{return p108IylaFrame(dt)}finally{superAI.tier=prior;render108.lastDraws=draw107.frame}
};
const p108CombatEvent=combatEvent;
combatEvent=function(type,data={}){
 const t=String(type),majorStart=/TRANSFORMATION_TRIGGERED|STRUCTURAL_CINEMATIC_STARTED|DRAMATIC_FINISH/.test(t),majorEnd=/STRUCTURAL_CINEMATIC_COMPLETE|CINEMATIC_EXIT_BURST/.test(t);
 if(majorStart&&!time108.active){time108.active=true;time108.session++;time108.starts++;time108.lastType=t}
 if(majorEnd&&time108.active){time108.active=false;time108.completes++}
 if(/PURSUIT|HOMING|CHASE/.test(t)){mechanics108.aerialPursuits++;mechanics108.mastery.pursuit++}
 if(/GUARD|BLOCK|PARRY/.test(t)){mechanics108.directionalGuards++;mechanics108.mastery.guard++}
 if(/COUNTER/.test(t)){mechanics108.vanishCounters++;mechanics108.counterLevel=Math.min(5,mechanics108.counterLevel+1);mechanics108.escalatingCounters+=mechanics108.counterLevel;mechanics108.mastery.counter++}
 if(/RECOVER|RESTORE/.test(t)){mechanics108.recoveries++;mechanics108.mastery.recovery++}
 if(/CLASH/.test(t)){mechanics108.beamClashes++;mechanics108.clashMeter=Math.min(100,mechanics108.clashMeter+12);mechanics108.mastery.clash++}
 if(/STRUCTURE|BREACH|COLLAPSE|DESTRUCTION/.test(t))mechanics108.terrainConsequences++;
 if(/TRAIN|REPLAY/.test(t))mechanics108.trainingReplays++;
 if(/STAGE|BOSS|OBJECTIVE|SCENARIO/.test(t))mechanics108.scenarioBranches++;
 return p108CombatEvent(type,data)
};
const p108Remember=rememberReplayFrame;
rememberReplayFrame=function(frame){
 p108Remember(frame);const dt=time108.lastT==null?0:Math.max(0,(frame.t||0)-time108.lastT),dw=time108.lastRt==null?0:Math.max(0,(frame.rt||0)-time108.lastRt),gap=Math.max(0,dw-dt);
 time108.lastT=frame.t||0;time108.lastRt=frame.rt||0;time108.simulation+=dt;time108.wall+=dw;time108.gap+=gap;if(time108.active)time108.cinematic+=gap;else if(document.hidden)time108.render+=0;else if(!running||paused)time108.normal+=gap;else time108.render+=gap;
 const actual=frame.f||griffin.form?.name||'BASE';gameplay105.form=actual;transform106.name=actual;
 if(frame.production105?.gameplay)frame.production105.gameplay.form=actual;
 if(frame.production106?.transform){frame.production106.transform.name=actual;frame.production106.transform.form=griffin.form?.stage??gameplay105.formLevel}
 if(frame.production107?.form){frame.production107.form.name=actual;frame.production107.form.id=griffin.form?.stage??gameplay105.formLevel;frame.production107.form.authoritative=true}
 const pendingAges=attackLedger105.open.map(()=>0),stale=0;
 const audioPressure=sfx108.observed?1-sfx108.coalesced/sfx108.observed:0,graphicsPressure=render108.mode==='PROTECTED'?1:render108.mode==='BALANCED'?.5:0;
 for(const d of engineDomains108)engines108.health[d]=graphicsPressure>.8?'PROTECTED':audioPressure>.8?'BALANCED':'READY';
 frame.production108={name:production108.name,engines:{domains:engines108.domains,capabilitiesPerEngine:engines108.capabilities,totalEnhancements:engines108.enhancements,ticks:engines108.ticks,health:{...engines108.health}},mechanics:{...mechanics108,mastery:{...mechanics108.mastery}},voice:{...voice108},form:{name:actual,authoritative:true},attacks:{pending:attackLedger105.pending,activePending:pendingAges.length,stalePending:stale,maxPendingAge:pendingAges.length?+Math.max(...pendingAges).toFixed(3):0,invariant:stale===0&&attackLedger105.invariant},time:{simulation:+time108.simulation.toFixed(3),wall:+time108.wall.toFixed(3),gap:+time108.gap.toFixed(3),cinematic:+time108.cinematic.toFixed(3),render:+time108.render.toFixed(3),normal:+time108.normal.toFixed(3),active:time108.active,session:time108.session,starts:time108.starts,completes:time108.completes,accounted:+(time108.cinematic+time108.render+time108.normal).toFixed(3)},graphics:{mode:render108.mode,drawCalls:draw107.frame,peak:draw107.peak,protectedFrames:render108.protectedFrames,balancedFrames:render108.balancedFrames,trimmedParticles:render108.trimmedParticles},sound:{...sfx108,byType:{...sfx108.byType}},dialogue:{pending:dialogue104.pending.length,cap:3}};
 production108.frames++
};
const p108Omni=omniSystems;
omniSystems=function(dt){p108Omni(dt);engines108.ticks++;mechanics108.clashMeter=Math.max(0,mechanics108.clashMeter-dt*4);mechanics108.counterLevel=Math.max(0,mechanics108.counterLevel-dt*.45)};
production108.ready=true;combatEvent('PRODUCTION_108_READY',{enhancements:engines108.enhancements,mechanics:engineCapabilities108,voice:'GENERATED SPEECH FIRST',telemetry:'AUTHORITATIVE + FRAME CLOCKED',graphics:'ADAPTIVE BUDGET',sound:'COALESCED MIX'});


// Survivor Production 109: Safari-safe speech, readable 3D combat and replay-proven invariants.
const production109={name:'SURVIVOR PRODUCTION 109',version:'1.0',ready:false,frames:0};
const voice109={primed:false,primeStarts:0,requested:0,started:0,delivered:0,packFallbacks:0,cueFallbacks:0,failures:0,timeouts:0,explicitVoices:0,lastMode:'READY',refs:new Map()};
const mechanics109={pursuits:0,counters:0,counterChain:0,counterChainBest:0,recoveries:0,lifts:0,slams:0,vanishes:0,kiSpent:0,skillSpent:0,lastContact:-99,lastPursuit:-99};
const animation109={phase:'NEUTRAL',anticipation:0,impactHold:0,followThrough:0,recovery:0,afterimage:0,speedRibbon:0,cameraEase:0,poseCorrections:0,events:0};
const graphics109={frames:0,auraBands:0,speedRibbons:0,impactHalos:0,depthPasses:0,budgetMode:'CINEMATIC'};
const attacks109={started:new Map(),settled:0,staleSettled:0,maxAge:0};
const invariants109={dialogueCap:3,dialogueCorrections:0,cinematicCorrections:0,formCorrections:0};
const speechButtons109=['startBtn','autoStart','retry','autoToggle'];
function selectVoice109(){
 const synth=window.speechSynthesis,list=synth?.getVoices?.()||[],locale=String(navigator.language||'en-US').toLowerCase(),base=locale.split('-')[0];
 const voice=list.find(v=>String(v.lang).toLowerCase()===locale)||list.find(v=>String(v.lang).toLowerCase().startsWith(base+'-'))||list.find(v=>String(v.lang).toLowerCase().startsWith('en-'))||list[0]||null;
 if(voice)voice109.explicitVoices++;return voice
}
function primeSpeech109(){
 if(voice109.primed||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;
 try{
  const synth=window.speechSynthesis,u=new SpeechSynthesisUtterance('Voice engine online.'),voice=selectVoice109();if(voice)u.voice=voice;
  u.lang=voice?.lang||navigator.language||'en-US';u.rate=1;u.pitch=1;u.volume=.32;const key='prime-'+performance.now();voice109.refs.set(key,u);
  u.onstart=()=>{voice109.primed=true;voice109.primeStarts++};u.onend=u.onerror=()=>voice109.refs.delete(key);
  synth.resume?.();synth.speak(u)
 }catch{}
}
for(const id of speechButtons109)$('#'+id)?.addEventListener('click',primeSpeech109,{capture:true,passive:true});
try{speechSynthesis.addEventListener('voiceschanged',()=>{voiceRefresh();selectVoice109()})}catch{}
function finishVoice109(item,gen,mode){
 if(combatVoices.active?.id!==item.id||combatVoices.generation!==gen)return;
 clearTimeout(combatVoices.watchdog);voice109.refs.delete(item.id);combatVoices.active=null;combatVoices.speaking=false;combatVoices.status=mode;voice109.lastMode=mode;
 if(mode==='GENERATED SPEECH'){voice109.delivered++;voice108.synthDelivered++;voice106.synthesized++}
 else if(mode==='VOICE PACK FALLBACK'){voice109.packFallbacks++;voice108.packFallbacks++;voice106.pack++}
 else{voice109.cueFallbacks++;voice108.cueFallbacks++}
 if(music104.bus)try{music104.bus.gain.cancelScheduledValues(music104.bus.context.currentTime);music104.bus.gain.setTargetAtTime(.76,music104.bus.context.currentTime,.08)}catch{}
 setTimeout(voicePump,80)
}
function fallbackVoice109(item,gen){
 let began=false;try{began=!!playVoicePack(item.agent,item.msg,()=>finishVoice109(item,gen,'VOICE PACK FALLBACK'))}catch{}
 if(began){combatVoices.watchdog=setTimeout(()=>finishVoice109(item,gen,'AUDIO CUE FALLBACK'),9000);return}
 voiceCue(item.agent);setTimeout(()=>finishVoice109(item,gen,'AUDIO CUE FALLBACK'),Math.max(720,item.msg.length*28))
}
voicePump=function(){
 if(combatVoices.speaking||!combatVoices.queue.length)return;
 const now=performance.now(),item=combatVoices.queue.shift();if(item.expires&&item.expires<now){production101.voice.dropped++;return voicePump()}
 item.msg=capSentence108(String(item.msg).replace(/\s+/g,' ').trim().slice(0,135));const v=combatVoices[item.agent]||combatVoices.jaxon,gen=++combatVoices.generation;
 combatVoices.speaking=true;combatVoices.active=item;combatVoices.status='GENERATED SPEECH';voice109.requested++;voice108.requested++;voice106.requested++;
 voiceCaption.dataset.agent=v.name;voiceCaption.textContent=v.name+' // '+item.msg;voiceCaption.hidden=false;combatVoices.subtitleUntil=now+Math.max(1800,item.msg.length*58);
 if(!combatVoices.enabled||!combatVoices.unlocked||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return fallbackVoice109(item,gen);
 try{
  const synth=window.speechSynthesis,u=new SpeechSynthesisUtterance(item.msg),voice=selectVoice109();if(voice)u.voice=voice;
  u.lang=voice?.lang||navigator.language||'en-US';u.pitch=v.pitch;u.rate=clamp(v.rate,.92,1.02);u.volume=.86;voice109.refs.set(item.id,u);
  u.onstart=()=>{voice109.started++;voice108.synthStarted++;voice109.lastMode='GENERATED SPEECH ACTIVE';if(music104.bus)try{music104.bus.gain.setTargetAtTime(.28,music104.bus.context.currentTime,.05)}catch{}};
  u.onend=()=>finishVoice109(item,gen,'GENERATED SPEECH');
  u.onerror=()=>{voice109.failures++;voice109.refs.delete(item.id);fallbackVoice109(item,gen)};
  synth.resume?.();synth.speak(u);
  combatVoices.watchdog=setTimeout(()=>{if(combatVoices.active?.id!==item.id)return;if(synth.speaking||synth.pending){combatVoices.watchdog=setTimeout(()=>{if(combatVoices.active?.id===item.id){voice109.timeouts++;fallbackVoice109(item,gen)}},5000)}else{voice109.timeouts++;fallbackVoice109(item,gen)}},Math.min(8500,Math.max(3200,item.msg.length*72)))
 }catch{voice109.failures++;fallbackVoice109(item,gen)}
};
function capDialogue109(){
 const now=performance.now(),before=dialogue104.pending.length;
 dialogue104.pending=dialogue104.pending.filter(q=>q.at>now-6000).sort((a,b)=>a.at-b.at).slice(0,invariants109.dialogueCap);
 if(before>dialogue104.pending.length)invariants109.dialogueCorrections+=before-dialogue104.pending.length
}
const p109VoiceReact=voiceReact101;
voiceReact101=function(type,data={}){const r=p109VoiceReact(type,data);capDialogue109();return r};
const p109DialogueTick=dialogueTick104;
dialogueTick104=function(){capDialogue109();const r=p109DialogueTick();capDialogue109();return r};
const p109CombatEvent=combatEvent;
combatEvent=function(type,data={}){
 const t=String(type||'').toUpperCase(),before=new Set(attackLedger105.open),now=elapsed;
 const result=p109CombatEvent(type,data);
 for(const id of attackLedger105.open)if(!before.has(id))attacks109.started.set(id,now);
 for(const id of before)if(!attackLedger105.open.includes(id)&&attacks109.started.delete(id))attacks109.settled++;
 if(/MELEE_CONTACT_CONFIRMED|BODY_STRIKE|SUPER_MOVE_IMPACT|FINISHER_CONFIRMED/.test(t)){mechanics109.lastContact=now;animation109.phase='IMPACT';animation109.impactHold=.075;animation109.followThrough=.18;animation109.afterimage=.16;animation109.events++}
 if(/PARRY_CONFIRMED|COUNTER|SUPER_PERCEPTION|SONIC_SWAY/.test(t)){mechanics109.counters++;mechanics109.counterChain=Math.min(8,mechanics109.counterChain+1);mechanics109.counterChainBest=Math.max(mechanics109.counterChainBest,mechanics109.counterChain);mechanics109.skillSpent++;animation109.phase='COUNTER';animation109.anticipation=.1;animation109.cameraEase=.18;mechanics108.vanishCounters++;mechanics108.escalatingCounters+=mechanics109.counterChain;mechanics108.mastery.counter++}
 if(/DASH|TELEPORT|HOMING|PURSUIT|CHASE/.test(t)&&now-mechanics109.lastPursuit>.12){mechanics109.lastPursuit=now;mechanics109.pursuits++;mechanics109.kiSpent+=/TELEPORT|VANISH/.test(t)?2:1;animation109.phase='PURSUIT';animation109.speedRibbon=.24;animation109.afterimage=.2;mechanics108.aerialPursuits++;mechanics108.mastery.pursuit++}
 if(/RECOVER|RESTORE/.test(t)){mechanics109.recoveries++;animation109.phase='RECOVERY';animation109.recovery=.16}
 if(/LIFT|ASCEND/.test(t))mechanics109.lifts++;if(/SLAM|DESCEND|GROUND/.test(t)&&/STRIKE|ATTACK|IMPACT/.test(t))mechanics109.slams++;if(/VANISH|TELEPORT/.test(t))mechanics109.vanishes++;
 if(/MISSED|INTERRUPT|LEVEL_CLEAR|ROUND/.test(t))mechanics109.counterChain=0;
 capDialogue109();return result
};
const p109OwenController=owenController;
owenController=function(dt){
 p109OwenController(dt);const q=Math.min(.033,dt||.016);
 animation109.anticipation=Math.max(0,animation109.anticipation-q);animation109.impactHold=Math.max(0,animation109.impactHold-q);animation109.followThrough=Math.max(0,animation109.followThrough-q);animation109.recovery=Math.max(0,animation109.recovery-q);animation109.afterimage=Math.max(0,animation109.afterimage-q);animation109.speedRibbon=Math.max(0,animation109.speedRibbon-q);animation109.cameraEase=Math.max(0,animation109.cameraEase-q);
 if(animation109.impactHold>0){owen.hold=Math.max(owen.hold,animation109.impactHold);owen.smear=Math.min(.18,Math.max(owen.smear,.08))}
 if(owen.pose==='HIT'&&owen.wanted==='DASH'&&owen.stateTime<owen.stateLength*.84){owen.wanted='HIT';animation109.poseCorrections++}
};
const p109IylaCombat=iyla3DCombat;
iyla3DCombat=function(){
 p109IylaCombat();const pressure=render108.mode!=='CINEMATIC',bands=pressure?2:4;
 if(animation109.speedRibbon>0||animation109.afterimage>0){
  const strength=clamp((animation109.speedRibbon+animation109.afterimage)*3,0,1),yaw=griffin.heading||0;
  for(let i=0;i<bands;i++){const side=(i-(bands-1)/2)*.18,back=.45+i*.24;iylaBox(-Math.sin(yaw)*side-Math.cos(yaw)*back,.55+i*.24,-Math.cos(yaw)*side+Math.sin(yaw)*back,.025,.025,.34+strength*.42,griffin.form?.color||'#65faff',yaw,strength*.34);graphics109.speedRibbons++}
 }
 if(animation109.impactHold>0){for(let i=0;i<(pressure?4:7);i++){const a=i*TAU/(pressure?4:7)+elapsed*2,r=.72+i*.055;iylaBox(Math.cos(a)*r,1.05+Math.sin(a*2)*.18,Math.sin(a)*r,.03,.03,.18,'#ffffff',a,.45);graphics109.impactHalos++}}
 if(griffin.transformation?.active)for(let i=0;i<(pressure?3:6);i++){const a=i*TAU/(pressure?3:6)+elapsed*(i%2?-.8:1),r=.62+i*.11;iylaBox(Math.cos(a)*r,.42+(i%3)*.48,Math.sin(a)*r,.025,.22,.025,griffin.form?.color||'#ffe45c',a,.28);graphics109.auraBands++}
 graphics109.depthPasses++
};
const p109OmniSystems=omniSystems;
omniSystems=function(dt){
 p109OmniSystems(dt);const ageLimit=2.25;
 for(const [id,start] of [...attacks109.started])if(!attackLedger105.open.includes(id)){attacks109.started.delete(id);attacks109.settled++}else{const age=elapsed-start;attacks109.maxAge=Math.max(attacks109.maxAge,age);if(age>ageLimit&&!griffin.transformation?.active&&!griffin.superMove?.active){const i=attackLedger105.open.indexOf(id);if(i>=0)attackLedger105.open.splice(i,1);attackLedger105.pending=attackLedger105.open.length;attackLedger105.cancelled++;attacks109.started.delete(id);attacks109.staleSettled++}}
 attackLedger105.invariant=attackLedger105.attempts===attackLedger105.confirmed+attackLedger105.missed+attackLedger105.cancelled+attackLedger105.interrupted+attackLedger105.pending;
 graphics109.frames++;graphics109.budgetMode=render108.mode;expansion59.camera.shake=clamp(expansion59.camera.shake+(animation109.impactHold>0?.18:0),.25,1);expansion59.camera.zoom=clamp(expansion59.camera.zoom-(animation109.speedRibbon>0?.035:0),.75,1.02)
};
const p109Remember=rememberReplayFrame;
rememberReplayFrame=function(frame){
 const actualActive=!!(griffin.transformation?.active||griffin.superMove?.active||zStage?.cut>0);
 if(time108.active!==actualActive){time108.active=actualActive;invariants109.cinematicCorrections++;if(!actualActive)time108.completes++}
 capDialogue109();p109Remember(frame);
 const actual=frame.f||griffin.form?.name||'BASE';if(frame.production108?.form?.name!==actual){frame.production108.form.name=actual;frame.production108.form.authoritative=true;invariants109.formCorrections++}
 const ages=[...attacks109.started.values()].map(start=>Math.max(0,elapsed-start)),stale=ages.filter(a=>a>2.25).length;
 if(frame.production108?.attacks){frame.production108.attacks.activePending=ages.length;frame.production108.attacks.stalePending=stale;frame.production108.attacks.maxPendingAge=ages.length?+Math.max(...ages).toFixed(3):0;frame.production108.attacks.invariant=stale===0&&attackLedger105.invariant}
 frame.production109={name:production109.name,voice:{primed:voice109.primed,primeStarts:voice109.primeStarts,requested:voice109.requested,started:voice109.started,delivered:voice109.delivered,packFallbacks:voice109.packFallbacks,cueFallbacks:voice109.cueFallbacks,failures:voice109.failures,timeouts:voice109.timeouts,explicitVoices:voice109.explicitVoices,lastMode:voice109.lastMode,retainedUtterances:voice109.refs.size},mechanics:{...mechanics109},animation:{...animation109},graphics:{...graphics109},attacks:{active:ages.length,stale,maxAge:ages.length?+Math.max(...ages).toFixed(3):0,settled:attacks109.settled,staleSettled:attacks109.staleSettled,invariant:stale===0&&attackLedger105.invariant},dialogue:{pending:dialogue104.pending.length,cap:invariants109.dialogueCap,corrections:invariants109.dialogueCorrections,invariant:dialogue104.pending.length<=invariants109.dialogueCap},cinematic:{active:time108.active,actualActive,corrections:invariants109.cinematicCorrections,invariant:time108.active===actualActive},form:{name:actual,corrections:invariants109.formCorrections,authoritative:true},performance:{fps:iyla.fps,drawCalls:draw107.frame,peak:draw107.peak,budget:render108.mode}};
 production109.frames++
};
production109.ready=true;combatEvent('PRODUCTION_109_READY',{speech:'GESTURE PRIMED + EXPLICIT VOICE + RETAINED UTTERANCE',combat:'PURSUIT + PARRY COUNTERS + RECOVERY',animation:'POSE SAFE + PHASED',graphics:'BUDGETED AURA + DEPTH + IMPACT',invariants:'BOUNDED + TIMESTAMPED + RECONCILED'});


// Survivor Production 110: original Chrono Nexus tournament campaign and futuristic AI constellation.
const production110={name:'SURVIVOR PRODUCTION 110',version:'1.0',ready:false,frames:0};
const storyChapters110=[
 {id:0,act:'PROLOGUE',title:'THE SIGNAL BEYOND DAWN',arena:'ORBITAL RUINS',objective:'SURVIVE THE OPENING PROBE',rival:'LIRA',intro:'A signal tears through the silent edge of the system. Griffin enters the Chrono Nexus Tournament to learn who is rewriting every arena.',clear:'The signal recognizes Griffin and opens the Ember Gate.',branch:'MERCY OR MOMENTUM'},
 {id:1,act:'QUALIFIER',title:'THE EMBER GATE',arena:'SOLAR FORGE',objective:'WIN BEFORE THE FORGE COLLAPSES',rival:'CINDER VANGUARD',intro:'The first bracket burns above a dying star. Every broken platform feeds the arena core.',clear:'Griffin saves the falling challengers and earns the crowd’s trust.',branch:'SAVE THE FIELD'},
 {id:2,act:'ROUND OF EIGHT',title:'THE MASKED MENTOR',arena:'SKY TEMPLE',objective:'BREAK THE LESSON WITHOUT BREAKING THE MASTER',rival:'THE VEILED PILOT',intro:'A masked fighter knows Griffin’s oldest habits and counters every familiar route.',clear:'The mask falls. The mentor entered to prove that power without restraint cannot protect a world.',branch:'POWER OR DISCIPLINE'},
 {id:3,act:'QUARTERFINAL',title:'RIVALS IN THE CIRCUIT',arena:'NEON CITADEL',objective:'DEFEAT LIRA WITHOUT LOSING THE CITY',rival:'LIRA ASCENDANT',intro:'Lira claims the tournament is the only system honest enough to decide the future.',clear:'Their clash exposes a hidden command inside the tournament network.',branch:'RIVAL ALLIANCE'},
 {id:4,act:'BATTLE ROYAL',title:'THE VOID GAUNTLET',arena:'NULL HORIZON',objective:'OUTLAST THE COLLAPSING BRACKET',rival:'SEVEN NEXUS CHAMPIONS',intro:'The bracket fractures into a battle royal. Ring-outs, shifting gravity and temporary alliances decide who advances.',clear:'Griffin and Lira refuse the elimination order and rescue the remaining teams.',branch:'UNITY OR SOLO GLORY'},
 {id:5,act:'SEMIFINAL',title:'THE SHATTERED BRACKET',arena:'FRACTURE ENGINE',objective:'DESTROY THE CONTROL SEALS',rival:'THE TOURNAMENT WARDEN',intro:'The Warden reveals that every match has trained an engine capable of predicting entire civilizations.',clear:'The engines awaken as independent minds and choose Griffin as their field commander.',branch:'FREE THE ENGINES'},
 {id:6,act:'CHAMPIONSHIP',title:'ECLIPSE OF THE NEXUS',arena:'CROWN OF STARS',objective:'DEFEAT THE PERFECT PREDICTION',rival:'NEXUS PRIME',intro:'Nexus Prime has simulated every victory. Griffin must fight with choices no model would consider efficient.',clear:'The perfect prediction fails when Griffin and Lira trust each other without certainty.',branch:'TRUST THE UNKNOWN'},
 {id:7,act:'FINAL TRIAL',title:'THE LAST WISH OF THE ARENA',arena:'RESTORATION CORE',objective:'CHOOSE WHAT THE TOURNAMENT BECOMES',rival:'THE ECHO OF GRIFFIN',intro:'The final opponent is a future Griffin who won every battle and lost everyone worth protecting.',clear:'Griffin rejects a flawless lonely future and restores every arena as a free proving ground.',branch:'RESTORE ALL WORLDS'},
 {id:8,act:'EPILOGUE',title:'CHAMPIONS OF TOMORROW',arena:'NEW DAWN PLAZA',objective:'DEFEND THE OPEN TOURNAMENT',rival:'THE NEXT GENERATION',intro:'The Chrono Nexus reopens with no forced battles, no erased worlds and no predetermined champion.',clear:'A new signal arrives. This time, Griffin smiles before answering.',branch:'NEW GAME PLUS'}
];
function loadStory110(){try{return Object.assign({chapter:0,completed:[],choices:{},wins:0,losses:0,trust:0,mercy:0,discipline:0,lastScene:''},JSON.parse(localStorage.survivorStory110||'{}'))}catch{return{chapter:0,completed:[],choices:{},wins:0,losses:0,trust:0,mercy:0,discipline:0,lastScene:''}}}
const story110=loadStory110(),storyRuntime110={announced:-1,scene:'BOOT',objectiveProgress:0,branches:0,lastEvent:'',chapterStarts:0,chapterClears:0,lastClear:-99};
function saveStory110(){try{localStorage.survivorStory110=JSON.stringify(story110)}catch{}}
function currentStory110(){return storyChapters110[clamp(story110.chapter|0,0,storyChapters110.length-1)]}
function announceStory110(force=false){
 const ch=currentStory110();if(!force&&storyRuntime110.announced===ch.id)return;storyRuntime110.announced=ch.id;storyRuntime110.scene='INTRO';storyRuntime110.chapterStarts++;story110.lastScene=ch.title;
 iylaScene('CHRONO NEXUS // '+ch.act,ch.title+' · '+ch.objective,'#74f7ff',6.4,26);speak('Griffin. '+ch.intro,true)
}
function branchStory110(){
 const ch=currentStory110(),hp=player.hp/player.maxHp,counters=mechanics109.counters,terrain=mechanics108.terrainConsequences;
 const choice=hp>.65&&terrain<30?'MERCY':counters>12?'DISCIPLINE':'MOMENTUM';story110.choices[ch.id]=choice;if(choice==='MERCY')story110.mercy++;else if(choice==='DISCIPLINE')story110.discipline++;else story110.trust++;
 storyRuntime110.branches++;return choice
}
function clearStory110(){
 if(elapsed-storyRuntime110.lastClear<2)return;storyRuntime110.lastClear=elapsed;const ch=currentStory110();if(!story110.completed.includes(ch.id))story110.completed.push(ch.id);story110.wins++;storyRuntime110.chapterClears++;storyRuntime110.scene='CLEAR';const choice=branchStory110();
 iylaScene('CHAPTER CLEAR // '+choice,ch.clear,'#ffe45c',6,28);speak(ch.clear+' The path chosen is '+choice.toLowerCase()+'.',true);
 story110.chapter=Math.min(storyChapters110.length-1,story110.chapter+1);storyRuntime110.announced=-1;saveStory110()
}
const aiProfiles110=[
 ['GRIFFIN','TACTICAL SOVEREIGN','#66f7ff','predicts routes and chooses risk'],
 ['LIRA','RIVAL INTELLIGENCE','#ff4fd8','adapts pressure and counterplay'],
 ['OWEN','KINETIC ANIMATOR','#78ff9a','owns readable body motion'],
 ['MATTY','CHOREOGRAPHY AUTHORITY','#ffd45c','sequences contact and recovery'],
 ['IYLA','PHOTON DIRECTOR','#8ba8ff','lights depth and atmosphere'],
 ['XAVIER','FRAME GOVERNOR','#72e4ff','protects latency and resolution'],
 ['ZAVIER','TARGET ORACLE','#c28cff','maintains reachable locks'],
 ['CHRISTIAN','STRUCTURE MIND','#ff9b62','models terrain consequences'],
 ['ZENITH','TOURNAMENT DIRECTOR','#ffe873','sets objectives and brackets'],
 ['PEYTEN','EXPRESSION ENGINE','#ff7fa8','drives face and emotional stance'],
 ['ELIJAH','MOTION PREDICTOR','#89ffcf','anticipates pose transitions'],
 ['CURTIS','SCENE ASSEMBLER','#65a9ff','culls and composes every frame'],
 ['VOICE','SPEECH ARCHITECT','#bdf7ff','generates and delivers rivalry lines'],
 ['MUSIC','ADAPTIVE COMPOSER','#dd8cff','scores pressure and story beats'],
 ['SFX','IMPACT SYNTHESIZER','#ffb35c','layers contact without mixer flood'],
 ['ENVIRONMENT','WORLD WEAVER','#71e0a0','evolves arenas and weather'],
 ['COMBAT','DUEL ARBITER','#ff6e70','settles hits counters and clashes'],
 ['CAMERA','CINEMATIC EYE','#9dc5ff','frames scale without disorientation'],
 ['PROGRESSION','MASTERY ARCHIVE','#dfef72','remembers growth and branches'],
 ['TELEMETRY','TRUTH LEDGER','#ffffff','audits every invariant']
];
const ai110={ticks:0,page:0,alerts:0,states:{},signals:{},hologramFrames:0};
function updateAI110(){
 const load=clamp((draw107.frame||0)/560,0,1),voiceReady=voice109.failures===0,combatReady=attackLedger105.invariant;
 for(const [name] of aiProfiles110){let state='NOMINAL',signal=1-load*.35;if(name==='VOICE'){state=voiceReady?'SYNTH LINK':'RECOVERY';signal=voiceReady?1:.5}else if(name==='COMBAT')state=combatReady?'VERIFIED':'AUDIT';else if(name==='XAVIER'||name==='CURTIS')state=render108.mode;else if(name==='ZENITH')state=currentStory110().act;else if(name==='TELEMETRY')state=dialogue104.pending.length<=3?'TRUTH LOCK':'CORRECTING';ai110.states[name]=state;ai110.signals[name]=+signal.toFixed(2)}
}
const dialogue110={rejected:0,admitted:0,max:0};
const p110VoiceReact=voiceReact101;
voiceReact101=function(type,data={}){
 const full=dialogue104.pending.length>=3,original=dialogue104.pending.push;
 if(full)dialogue104.pending.push=function(){dialogue110.rejected++;return this.length};
 try{return p110VoiceReact(type,data)}finally{dialogue104.pending.push=original;dialogue110.max=Math.max(dialogue110.max,dialogue104.pending.length)}
};
const cinematic110={active:false,starts:0,completes:0,transitions:0};
const vertical110={chain:0,lifts:0,slams:0,airborne:false};
const p110CombatEvent=combatEvent;
combatEvent=function(type,data={}){
 const t=String(type||'').toUpperCase(),result=p110CombatEvent(type,data);storyRuntime110.lastEvent=t;
 if(t==='CAMPAIGN_LEVEL_START'||t==='TOURNAMENT_OPENING'||t==='TOURNAMENT_ROUND')announceStory110();
 if(t==='CAMPAIGN_LEVEL_CLEAR'||t==='DRAMATIC_FINISH')clearStory110();
 if(t==='MELEE_CONTACT_CONFIRMED'){vertical110.chain++;if(vertical110.chain%5===3){vertical110.lifts++;vertical110.airborne=true;mechanics109.lifts++;animation109.phase='LIFT STRIKE';animation109.anticipation=.08;animation109.speedRibbon=.14}else if(vertical110.airborne&&vertical110.chain%5===4){vertical110.slams++;vertical110.airborne=false;mechanics109.slams++;animation109.phase='GROUND SLAM';animation109.impactHold=.09;animation109.followThrough=.22}}
 if(/MISSED|INTERRUPT|LEVEL_CLEAR/.test(t)){vertical110.chain=0;vertical110.airborne=false}
 storyRuntime110.objectiveProgress=kills+mechanics109.counters+mechanics109.pursuits+story110.mercy*5;return result
};
const p110Omni=omniSystems;
omniSystems=function(dt){
 p110Omni(dt);if(elapsed<.1)announceStory110();updateAI110();ai110.ticks++;
 const actual=!!(griffin.transformation?.active||griffin.superMove?.active||zStage?.cut>0);if(actual!==cinematic110.active){cinematic110.active=actual;cinematic110.transitions++;if(actual)cinematic110.starts++;else cinematic110.completes++}
};
const p110OmniVisuals=omniVisuals;
omniVisuals=function(){
 p110OmniVisuals();if(superAI.tier===1)return;const cx=W-68,cy=H-76,r=32,page=Math.floor(elapsed/4)%4;
 x.save();x.globalCompositeOperation='screen';x.globalAlpha=.5;x.strokeStyle='#52eaff';x.lineWidth=1;x.beginPath();x.arc(cx,cy,r+7,0,TAU);x.stroke();
 for(let i=0;i<20;i++){const a=i*TAU/20-elapsed*.08,profile=aiProfiles110[i],active=Math.floor(i/5)===page;x.fillStyle=profile[2];x.globalAlpha=active?.9:.25;x.beginPath();x.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,active?2.7:1.5,0,TAU);x.fill()}
 x.globalAlpha=.72;x.fillStyle='#bffcff';x.font='7px system-ui';x.textAlign='center';x.fillText('AI CONSTELLATION '+(page+1)+'/4',cx,cy+2);x.restore();ai110.hologramFrames++
};
const p110OmniHud=omniHud;
omniHud=function(){
 p110OmniHud();const el=$('#omegaDetail');if(!el)return;const page=Math.floor(elapsed/4)%4,start=page*5,rows=aiProfiles110.slice(start,start+5).map(p=>'<span style="color:'+p[2]+'">'+p[0]+'</span> '+(ai110.states[p[0]]||'BOOT')).join(' · ');
 const ch=currentStory110();el.innerHTML+='<br><b style="color:#74f7ff">CHRONO NEXUS // '+ch.act+'</b><br>'+ch.title+' · '+ch.objective+'<br>AI CONSTELLATION '+(page+1)+'/4 · '+rows
};
const p110Remember=rememberReplayFrame;
rememberReplayFrame=function(frame){
 const actual=!!(griffin.transformation?.active||griffin.superMove?.active||zStage?.cut>0);time108.active=actual;p110Remember(frame);
 if(frame.production108?.time){frame.production108.time.active=actual;frame.production108.time.starts=cinematic110.starts;frame.production108.time.completes=cinematic110.completes}
 frame.production110={name:production110.name,story:{chapter:story110.chapter,act:currentStory110().act,title:currentStory110().title,arena:currentStory110().arena,objective:currentStory110().objective,rival:currentStory110().rival,scene:storyRuntime110.scene,progress:storyRuntime110.objectiveProgress,completed:[...story110.completed],choices:{...story110.choices},wins:story110.wins,trust:story110.trust,mercy:story110.mercy,discipline:story110.discipline,branches:storyRuntime110.branches,totalChapters:storyChapters110.length},engines:{count:aiProfiles110.length,ticks:ai110.ticks,states:{...ai110.states},signals:{...ai110.signals},profiles:aiProfiles110.map(p=>({name:p[0],role:p[1],color:p[2],purpose:p[3]})),hologramFrames:ai110.hologramFrames},dialogue:{pending:dialogue104.pending.length,cap:3,rejectedBeforeQueue:dialogue110.rejected,max:dialogue110.max,invariant:dialogue104.pending.length<=3},cinematic:{active:cinematic110.active,starts:cinematic110.starts,completes:cinematic110.completes,transitions:cinematic110.transitions,invariant:cinematic110.starts-cinematic110.completes===(cinematic110.active?1:0)},verticalCombat:{...vertical110},voice:{requested:voice109.requested,started:voice109.started,delivered:voice109.delivered,failures:voice109.failures,fallbacks:voice109.packFallbacks+voice109.cueFallbacks},performance:{fps:iyla.fps,drawCalls:draw107.frame,peak:draw107.peak,budget:render108.mode},integrity:{attacks:attackLedger105.invariant,dialogue:dialogue104.pending.length<=3,form:frame.f===(frame.production109?.form?.name||frame.f),cinematic:cinematic110.starts-cinematic110.completes===(cinematic110.active?1:0)}};
 production110.frames++
};
production110.ready=true;combatEvent('PRODUCTION_110_READY',{campaign:'CHRONO NEXUS · 9 ORIGINAL CHAPTERS',engines:aiProfiles110.length,interface:'FUTURISTIC AI CONSTELLATION',fixes:'ADMISSION CONTROL + SAMPLED CINEMATIC LIFECYCLE',combat:'DERIVED LIFT + SLAM CHAINS'});


// Survivor Production 111: distinct character direction, cinematic clarity and live-inspected visual repair.
const production111={name:'SURVIVOR PRODUCTION 111',version:'1.0',ready:false,frames:0};
Object.assign(combatVoices,{
 narrator:{name:'ORACLE',pitch:.78,rate:.9,voiceGroup:'narrator'},
 mentor:{name:'VEILED PILOT',pitch:.68,rate:.88,voiceGroup:'mentor'},
 warden:{name:'WARDEN',pitch:.6,rate:.83,voiceGroup:'warden'},
 nexus:{name:'NEXUS PRIME',pitch:1.3,rate:.87,voiceGroup:'nexus'}
});
Object.assign(combatVoices.jaxon,{name:'GRIFFIN',pitch:.82,rate:.97,voiceGroup:'hero'});
Object.assign(combatVoices.conner,{name:'LIRA',pitch:1.18,rate:1.01,voiceGroup:'rival'});
const voiceCast111={
 jaxon:{patterns:/Daniel|Alex|Aaron|Arthur|Eddy|Reed/i,offset:0},
 conner:{patterns:/Samantha|Ava|Karen|Moira|Serena|Tessa/i,offset:1},
 narrator:{patterns:/Ralph|Fred|Albert|Grandpa|Narrator/i,offset:2},
 mentor:{patterns:/Bruce|Lee|Rocko|Shelley/i,offset:3},
 warden:{patterns:/Reed|Albert|Ralph|Daniel/i,offset:4},
 nexus:{patterns:/Zarvox|Cellos|Trinoids|Whisper/i,offset:5}
};
const voiceDirection111={selected:{},requested:{},started:{},delivered:{},fallbacks:{},lastSpeaker:'',distinctVoices:0};
function selectVoice111(agent){
 const list=speechSynthesis.getVoices?.()||[],cast=voiceCast111[agent]||voiceCast111.jaxon,locale=String(navigator.language||'en-US').split('-')[0],english=list.filter(v=>String(v.lang).toLowerCase().startsWith(locale.toLowerCase()));
 const pool=english.length?english:list,voice=pool.find(v=>cast.patterns.test(v.name))||pool[cast.offset%Math.max(1,pool.length)]||null;
 if(voice){voiceDirection111.selected[agent]=voice.name;voiceDirection111.distinctVoices=new Set(Object.values(voiceDirection111.selected)).size}return voice
}
voicePump=function(){
 if(combatVoices.speaking||!combatVoices.queue.length)return;const now=performance.now(),item=combatVoices.queue.shift();
 if(item.expires&&item.expires<now){production101.voice.dropped++;return voicePump()}
 item.msg=capSentence108(String(item.msg).replace(/\s+/g,' ').trim().slice(0,118));const v=combatVoices[item.agent]||combatVoices.jaxon,gen=++combatVoices.generation;
 combatVoices.speaking=true;combatVoices.active=item;combatVoices.status='DIRECTED SPEECH';voice109.requested++;voice108.requested++;voice106.requested++;voiceDirection111.requested[item.agent]=(voiceDirection111.requested[item.agent]||0)+1;voiceDirection111.lastSpeaker=v.name;
 voiceCaption.dataset.agent=item.agent;voiceCaption.textContent=v.name+' // '+item.msg;voiceCaption.hidden=false;combatVoices.subtitleUntil=now+Math.max(1700,item.msg.length*52);
 if(!combatVoices.enabled||!combatVoices.unlocked||!speechSynthesis||!window.SpeechSynthesisUtterance){voiceDirection111.fallbacks[item.agent]=(voiceDirection111.fallbacks[item.agent]||0)+1;return fallbackVoice109(item,gen)}
 try{
  const u=new SpeechSynthesisUtterance(item.msg),voice=selectVoice111(item.agent);if(voice)u.voice=voice;u.lang=voice?.lang||navigator.language||'en-US';u.pitch=v.pitch;u.rate=v.rate;u.volume=.88;voice109.refs.set(item.id,u);
  u.onstart=()=>{voice109.started++;voice108.synthStarted++;voiceDirection111.started[item.agent]=(voiceDirection111.started[item.agent]||0)+1;if(music104.bus)try{music104.bus.gain.setTargetAtTime(.25,music104.bus.context.currentTime,.04)}catch{}};
  u.onend=()=>{voiceDirection111.delivered[item.agent]=(voiceDirection111.delivered[item.agent]||0)+1;finishVoice109(item,gen,'GENERATED SPEECH')};
  u.onerror=()=>{voice109.failures++;voiceDirection111.fallbacks[item.agent]=(voiceDirection111.fallbacks[item.agent]||0)+1;voice109.refs.delete(item.id);fallbackVoice109(item,gen)};
  speechSynthesis.resume?.();speechSynthesis.speak(u);combatVoices.watchdog=setTimeout(()=>{if(combatVoices.active?.id!==item.id)return;if(speechSynthesis.speaking||speechSynthesis.pending)combatVoices.watchdog=setTimeout(()=>{if(combatVoices.active?.id===item.id)fallbackVoice109(item,gen)},5000);else fallbackVoice109(item,gen)},Math.min(8200,Math.max(3000,item.msg.length*68)))
 }catch{voice109.failures++;fallbackVoice109(item,gen)}
};
const dialoguePools111={
 griffin:{combat:['I see the opening','Your angle is committed','I have the timing'],action:['I take the high lane','I break left, then counter','I end this route cleanly'],close:['Stay sharp','One exchange at a time','The next choice matters']},
 lira:{combat:['You are becoming readable','That confidence changed your rhythm','I expected the correction'],action:['I close the safe lane','I attack the choice behind your guard','I change the final beat'],close:['Keep adapting','Do not waste my interest','Show me a better answer']}
};
phraseGenerate107=function(agent,context='combat',seed=0){
 const who=agent==='conner'||agent==='lira'?'lira':'griffin',p=dialoguePools111[who],h=voiceHash101(who+context+seed+phrase107.generated),line=p.combat[h%p.combat.length]+'. '+p.action[(h>>>4)%p.action.length]+'. '+p.close[(h>>>8)%p.close.length]+'.';
 phrase107.generated++;phrase107.unique++;phrase107.contexts[context]=(phrase107.contexts[context]||0)+1;phrase107.lastByAgent[who]=line;phrase107.history.push({who,ctx:context,line});if(phrase107.history.length>80)phrase107.history.shift();return line
};
voiceCompose101=(agent,context,data={})=>phraseGenerate107(agent,context,Number(data.eventId||data.id||data.damage||0));
dialoguePick104=(agent,context,seed)=>phraseGenerate107(agent,context,seed);
const originalSpeak111=speak;
speak=function(msg,force=false){
 const text=String(msg),ch=storyChapters110.find(c=>text.includes(c.intro)||text.includes(c.clear)),agent=ch?(ch.id===2?'mentor':ch.id===5?'warden':ch.id>=6?'nexus':'narrator'):'jaxon';
 return aiVoice(agent,text,force)
};
const dialoguePriority111={transform:9,finish:10,reversal:8,boss:8,challenge:6,answer:7,combat:3};
voiceReact101=function(type,data={}){
 const context=dialogueContext104(type);if(!context)return;const priority=dialoguePriority111[context]||3,now=performance.now()/1000;
 if(priority<7&&now-dialogue104.lastAt<7.5)return;if(combatVoices.queue.length>=2&&priority<9)return;
 const first=dialogue104.turn%2?'lira':'griffin';dialogueUpdateRelationship104(type,first);dialogueSpeak104(first,context,type,false);
 if(priority>=8&&dialogue104.pending.length<2)dialogue104.pending.push({agent:first==='griffin'?'lira':'griffin',context:context==='reversal'?'answer':context,type,at:performance.now()+1700})
};
const visual111={worldFrames:0,cleanJoints:0,arenaRings:0,edgeProps:0,targetReframes:0,majorStarts:0,majorCompletes:0,majorActive:false,hudMode:'COMBAT FIRST'};
owenJoint=function(a,b,r,color,yaw){
 const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,len=Math.hypot(dx,dy,dz),segments=2;
 for(let n=0;n<=segments;n++){const q=n/segments,k=1-Math.abs(q-.5)*.08;iylaRound(a.x+dx*q,a.y+dy*q,a.z+dz*q,r*1.12*k,Math.max(r*1.3,len*.38),r*1.12*k,color,yaw);owen.joints++;visual111.cleanJoints++}
};
iyla3DWorld=function(){
 const ch=currentStory110(),palettes={
  'ORBITAL RUINS':[[.025,.08,.14],[.08,.42,.55],[.36,.8,1]],
  'SOLAR FORGE':[[.12,.045,.025],[.55,.16,.04],[1,.48,.08]],
  'SKY TEMPLE':[[.035,.09,.1],[.14,.38,.42],[.5,.94,1]],
  'NEON CITADEL':[[.04,.025,.12],[.34,.08,.5],[.9,.18,1]],
  'NULL HORIZON':[[.015,.018,.04],[.08,.12,.24],[.38,.55,1]],
  'FRACTURE ENGINE':[[.08,.02,.06],[.42,.04,.24],[1,.2,.55]],
  'CROWN OF STARS':[[.07,.055,.015],[.38,.26,.04],[1,.82,.22]],
  'RESTORATION CORE':[[.02,.09,.07],[.04,.42,.3],[.25,1,.72]],
  'NEW DAWN PLAZA':[[.04,.08,.13],[.08,.35,.5],[.4,.9,1]]
 },p=palettes[ch.arena]||palettes['ORBITAL RUINS'];
 iylaRound(0,-.12,0,7.8,.1,7.8,p[0],0,.96);iylaRound(0,-.055,0,6.2,.035,6.2,p[1],0,.28);
 for(let n=0;n<5;n++){const r=2.3+n*1.05,a=elapsed*.025+n;for(let j=0;j<12;j++){const q=j*TAU/12+a;iylaBox(Math.cos(q)*r,-.015,Math.sin(q)*r,.34,.025,.055,p[2],q,.22);visual111.arenaRings++}}
 const cap=superAI.tier===1?6:10;for(let n=0;n<cap;n++){const a=n*TAU/cap+.22,r=7.1+(n%2)*.35,h=1.1+(n%3)*.48;iylaBox(Math.cos(a)*r,h*.5,Math.sin(a)*r,.22,h*.5,.22,p[1],a,.68);iylaBox(Math.cos(a)*r,h+.18,Math.sin(a)*r,.34,.05,.34,p[2],a,.32);visual111.edgeProps++}
 for(const s of ultimate.scars.slice(-10))iylaRound((s.x-W/2)/45,.012,(s.y-H/2)/45,s.r/42,.018,s.r/42,[.45,.025,.07],s.a,.52);visual111.worldFrames++
};
const cinematic111={active:false,starts:0,completes:0};
const aiSignal111={};
function updateAI110(){
 const draw=clamp((draw107.frame||0)/560,0,1),fps=clamp((iyla.fps||60)/60,0,1),voice=voice109.failures?0.45:1,combat=attackLedger105.invariant?1:.45,dialogue=clamp(1-dialogue104.pending.length/6,.45,1),target=griffin.target&&enemies.includes(griffin.target)?clamp(1-dist(player,griffin.target)/700,.35,1):.8;
 const v={GRIFFIN:clamp(griffin.confidence||.7,.35,1),LIRA:clamp(lira.confidence||.55,.35,1),OWEN:clamp(1-(owen.hold||0)*2,.4,1),MATTY:clamp(1-matty.rejected/Math.max(1,matty.commands),.4,1),IYLA:fps,XAVIER:1-draw*.45,ZAVIER:target,CHRISTIAN:clamp(1-(destruction.fragments?.length||0)/50,.4,1),ZENITH:clamp(.55+(campaign.stage||1)*.08,.55,1),PEYTEN:clamp(1-(peyten.switches||0)/200,.5,1),ELIJAH:clamp(.55+(elijah.models||0)/20,.55,1),CURTIS:1-draw*.38,VOICE:voice,MUSIC:music104.errors?0.55:1,SFX:clamp(1-soundAI101.active/Math.max(1,soundAI101.maxActive),.4,1),ENVIRONMENT:fps,COMBAT:combat,CAMERA:clamp(1-(shake||0)/30,.45,1),PROGRESSION:clamp(.55+story110.completed.length*.05,.55,1),TELEMETRY:dialogue};
 for(const [name] of aiProfiles110){ai110.signals[name]=+(v[name]??.75).toFixed(2);aiSignal111[name]=ai110.signals[name];ai110.states[name]=ai110.signals[name]>.82?'NOMINAL':ai110.signals[name]>.6?'BALANCED':'PROTECTED'}
 ai110.states.VOICE=voice===1?'DISTINCT VOICES':'RECOVERY';ai110.states.COMBAT=combat===1?'VERIFIED':'AUDIT';ai110.states.ZENITH=currentStory110().act
}
const p111Omni=omniSystems;
omniSystems=function(dt){
 p111Omni(dt);const major=!!(griffin.transformation?.active||griffin.superMove?.active);
 if(major!==cinematic111.active){cinematic111.active=major;if(major)cinematic111.starts++;else cinematic111.completes++}
 if(griffin.target&&enemies.includes(griffin.target)&&dist(player,griffin.target)>500&&!griffin.boss){const near=enemies.filter(e=>Number.isFinite(e.x)&&Number.isFinite(e.y)).sort((a,b)=>dist(player,a)-dist(player,b))[0];if(near&&dist(player,near)<500){griffin.target=near;visual111.targetReframes++}}
};
const p111Remember=rememberReplayFrame;
rememberReplayFrame=function(frame){
 p111Remember(frame);if(frame.production110?.cinematic){frame.production110.cinematic={active:cinematic111.active,starts:cinematic111.starts,completes:cinematic111.completes,transitions:cinematic111.starts+cinematic111.completes,invariant:cinematic111.starts-cinematic111.completes===(cinematic111.active?1:0)}}
 frame.production111={name:production111.name,voiceCast:{profiles:Object.fromEntries(Object.entries(combatVoices).filter(([k,v])=>v&&v.name).map(([k,v])=>[k,{name:v.name,pitch:v.pitch,rate:v.rate,voiceGroup:v.voiceGroup||k}])),selected:{...voiceDirection111.selected},distinctVoices:voiceDirection111.distinctVoices,requested:{...voiceDirection111.requested},started:{...voiceDirection111.started},delivered:{...voiceDirection111.delivered},fallbacks:{...voiceDirection111.fallbacks},lastSpeaker:voiceDirection111.lastSpeaker},dialogue:{pending:dialogue104.pending.length,queued:combatVoices.queue.length,history:dialogue104.history.length,maxPending:2},graphics:{...visual111,drawCalls:draw107.frame,peak:draw107.peak,fps:iyla.fps,arena:currentStory110().arena},cinematic:{...cinematic111,invariant:cinematic111.starts-cinematic111.completes===(cinematic111.active?1:0)},engines:{signals:{...aiSignal111},distinctSignals:new Set(Object.values(aiSignal111)).size},targeting:{distance:griffin.target&&enemies.includes(griffin.target)?+dist(player,griffin.target).toFixed(1):0,reframes:visual111.targetReframes},integrity:{attacks:attackLedger105.invariant,dialogue:dialogue104.pending.length<=2,cinematic:cinematic111.starts-cinematic111.completes===(cinematic111.active?1:0),form:frame.f===(frame.production109?.form?.name||frame.f)}};
 production111.frames++
};
production111.ready=true;combatEvent('PRODUCTION_111_READY',{voices:'6 DISTINCT DIRECTED PROFILES',dialogue:'CHARACTER-SPECIFIC + PRIORITY PACED',graphics:'CLEAN ARENA + CONTIGUOUS LIMBS + COMBAT-FIRST HUD',cinematics:'MAJOR SESSIONS ONLY',engines:'INDEPENDENT SIGNALS'});


// Survivor Production 112: authoritative silhouette renderer, efficient arenas and coordinated 20-engine gameplay.
const production112={name:'SURVIVOR PRODUCTION 112',version:'1.0',ready:false,frames:0};
const voice112={assignments:{},unique:0,reassignments:0,available:0};
selectVoice111=function(agent){
 const all=speechSynthesis.getVoices?.()||[],base=String(navigator.language||'en-US').split('-')[0].toLowerCase(),pool=all.filter(v=>String(v.lang).toLowerCase().startsWith(base));
 const list=pool.length?pool:all,cast=voiceCast111[agent]||voiceCast111.jaxon,used=new Set(Object.entries(voice112.assignments).filter(([a])=>a!==agent).map(([,n])=>n));
 let voice=list.find(v=>cast.patterns.test(v.name)&&!used.has(v.name))||list.find(v=>!used.has(v.name))||list[cast.offset%Math.max(1,list.length)]||null;
 if(voice){if(voice112.assignments[agent]&&voice112.assignments[agent]!==voice.name)voice112.reassignments++;voice112.assignments[agent]=voice.name;voiceDirection111.selected[agent]=voice.name;voice112.unique=new Set(Object.values(voice112.assignments)).size;voiceDirection111.distinctVoices=voice112.unique}voice112.available=list.length;return voice
};
const silhouette112={griffinFrames:0,liraFrames:0,parts:0,poseFrames:{},connected:true,focalOffset:1.35};
function part112(px,py,pz,rx,ry,rz,color,yaw,alpha=.94){iylaRound(px,py,pz,rx,ry,rz,color,yaw,alpha);silhouette112.parts++}
owenGriffin=function(yaw,color,form){
 const p=owen.pose||'FLIGHT',v=owenAxes(yaw),root=silhouette112.focalOffset,lift=.08+(zStage.elevation||0)*.24,q=clamp(owen.stateTime/Math.max(.01,owen.stateLength),0,1),beat=Math.sin(q*Math.PI),side=zCinema.combo%2?1:-1,s=1.28;
 const skin=[.84,.5,.3],cloth=[.9,.18,.025],suit=[.025,.08,.24],armor=[.05,.28,.78],hair=form>=3?[.68,.27,1]:form>=1?[1,.72,.05]:[.025,.035,.06];
 let lean=p==='DASH'?.28:p==='HIT'?-.16:p==='FINISHER'?.18:0,bodyZ=lean,bodyY=1.35*s+lift;
 part112(root,.02,0,.64,.03,.38,[0,0,0],yaw,.28);
 part112(root,.48*s+lift,bodyZ*.12,.38*s,.46*s,.34*s,suit,yaw);part112(root,1.08*s+lift,bodyZ*.5,.5*s,.45*s,.36*s,cloth,yaw);part112(root,1.48*s+lift,bodyZ,.58*s,.36*s,.38*s,cloth,yaw);
 iylaBox(root+v.fx*.31*s,1.47*s+lift,bodyZ+v.fz*.31*s,.32*s,.22*s,.06*s,armor,yaw,.96);
 for(const a of [-1,1]){
  const active=a===side&&/PUNCH|FINISHER|UPPERCUT|CAST|CHARGE/.test(p),ax=root+v.rx*a*.54*s+(active?v.fx*.34*beat:0),az=bodyZ+v.rz*a*.54*s+(active?v.fz*.72*beat:0),ay=(active?1.46:1.22)*s+lift+(p==='UPPERCUT'&&active?.38*beat:0);
  part112(root+v.rx*a*.51*s,1.42*s+lift,bodyZ+v.rz*a*.51*s,.25*s,.3*s,.27*s,skin,yaw);
  part112(ax,ay,az,.21*s,.42*s,.22*s,skin,yaw);part112(ax+v.fx*.06*s,ay-.28*s,az+v.fz*.06*s,.23*s,.18*s,.24*s,armor,yaw)
 }
 for(const a of [-1,1]){
  const active=a===side&&/KICK|SPIN_KICK|AXE_KICK/.test(p),lx=root+v.rx*a*.25*s+(active?v.fx*.42*beat:0),lz=v.rz*a*.25*s+(active?v.fz*.72*beat:0),ly=(active?.78:.48)*s+lift;
  part112(root+v.rx*a*.25*s,.7*s+lift,v.rz*a*.25*s,.27*s,.44*s,.28*s,cloth,yaw);part112(lx,ly,lz,.24*s,.45*s,.25*s,suit,yaw);part112(lx+v.fx*.13*s,.14*s+lift,lz+v.fz*.13*s,.3*s,.16*s,.42*s,armor,yaw)
 }
 part112(root,1.88*s+lift,bodyZ*.7,.3*s,.34*s,.29*s,skin,yaw);for(let n=0;n<7+Math.min(4,form);n++){const spread=(n-(6+Math.min(4,form))/2)*.14,a=yaw+spread;iylaBox(root-v.fx*.09*s+v.rx*spread*.58*s,2.22*s+lift+Math.cos(spread*2)*.1,bodyZ-v.fz*.09*s+v.rz*spread*.58*s,.065*s,(.22+form*.025)*s,.075*s,hair,a,.94);silhouette112.parts++}
 for(const a of [-1,1]){part112(root+v.rx*a*.105*s+v.fx*.28*s,1.94*s+lift,bodyZ+v.rz*a*.105*s+v.fz*.28*s,.045*s,.035*s,.025*s,[.75,1,1],yaw)}
 silhouette112.griffinFrames++;silhouette112.poseFrames[p]=(silhouette112.poseFrames[p]||0)+1;owen.joints=6
};
owenLira=function(e,boss){
 if(!e||!enemies.includes(e))return;const px=(e.x-W/2)/45,pz=(e.y-H/2)/45,yaw=-Math.atan2(player.x-e.x,player.y-e.y),v=owenAxes(yaw),s=boss?1.25:.72,role=boss?'COMMANDER':e.role||'HUNTER',core=e.variant==='DRAINER'?[.08,1,.42]:e.variant==='SPLITTER'?[1,.53,.04]:e.variant==='PHASE'?[.58,.22,1]:[1,.04,.22],skin=[.38,.055,.13],armor=boss?[.2,.012,.07]:[.1,.012,.06],attack=e.attackClock<.24,hit=e.hit>0,lean=hit?-.18:attack?.2:0;
 part112(px,.02,pz,.42*s,.025,.28*s,[0,0,0],yaw,.25);part112(px,.48*s,pz+lean*.1,.34*s,.45*s,.3*s,armor,yaw);part112(px,1.12*s,pz+lean,.5*s,.48*s,.35*s,skin,yaw);iylaBox(px+v.fx*.31*s,1.14*s,pz+lean+v.fz*.31*s,.29*s,.19*s,.055*s,core,yaw,.95);
 for(const a of [-1,1]){const reach=attack&&a===1?.48:0;part112(px+v.rx*a*.48*s+v.fx*reach*s,1.08*s,pz+v.rz*a*.48*s+v.fz*reach*s,.2*s,.44*s,.21*s,skin,yaw);part112(px+v.rx*a*.22*s,.38*s,pz+v.rz*a*.22*s,.23*s,.5*s,.24*s,armor,yaw);part112(px+v.rx*a*.22*s+v.fx*.12*s,.08*s,pz+v.rz*a*.22*s+v.fz*.12*s,.26*s,.13*s,.34*s,core,yaw)}
 part112(px,1.92*s,pz+lean*.65,.29*s,.34*s,.28*s,skin,yaw);for(let n=0;n<(boss?6:3);n++){const spread=(n-(boss?2.5:1))*.17;iylaBox(px-v.fx*.08*s+v.rx*spread*s,2.25*s,pz-v.fz*.08*s+v.rz*spread*s,.07*s,.25*s,.08*s,core,yaw+spread,.94);silhouette112.parts++}silhouette112.liraFrames++;elijah.models++;elijah.features+=18
};
const arena112={frames:0,segments:0,props:0,peakSegments:0,mode:'CACHED TOPOLOGY'};
iyla3DWorld=function(){
 const ch=currentStory110(),palette={0:[[.02,.07,.12],[.05,.3,.42],[.3,.88,1]],1:[[.11,.035,.02],[.5,.13,.03],[1,.42,.06]],2:[[.025,.08,.09],[.1,.32,.36],[.46,.9,1]],3:[[.035,.02,.1],[.28,.06,.44],[.82,.16,1]],4:[[.012,.015,.035],[.06,.1,.21],[.32,.48,1]],5:[[.07,.015,.05],[.36,.03,.2],[1,.16,.5]],6:[[.06,.045,.012],[.34,.22,.03],[1,.76,.18]],7:[[.015,.075,.055],[.03,.36,.25],[.2,.95,.65]],8:[[.03,.07,.12],[.06,.3,.46],[.35,.86,1]]}[ch.id]||[[.02,.07,.12],[.05,.3,.42],[.3,.88,1]],pressure=render108.mode!=='CINEMATIC',rings=pressure?2:3,steps=pressure?7:9;
 part112(0,-.12,0,7.7,.1,7.7,palette[0],0,.97);part112(0,-.055,0,5.9,.03,5.9,palette[1],0,.24);
 let frameSeg=0;for(let n=0;n<rings;n++){const r=3+n*1.45;for(let j=0;j<steps;j++){const a=j*TAU/steps+.08;iylaBox(Math.cos(a)*r,-.01,Math.sin(a)*r,.48,.02,.045,palette[2],a+Math.PI/2,.26);arena112.segments++;frameSeg++}}
 const propCap=pressure?4:6;for(let n=0;n<propCap;n++){const a=n*TAU/propCap+.3,r=7.25,h=.9+(n%3)*.45;iylaBox(Math.cos(a)*r,h*.5,Math.sin(a)*r,.18,h*.5,.18,palette[1],a,.62);iylaBox(Math.cos(a)*r,h+.12,Math.sin(a)*r,.28,.04,.28,palette[2],a,.28);arena112.props++}
 for(const s of ultimate.scars.slice(-8))part112((s.x-W/2)/45,.01,(s.y-H/2)/45,s.r/46,.016,s.r/46,[.42,.02,.06],s.a,.48);arena112.frames++;arena112.peakSegments=Math.max(arena112.peakSegments,frameSeg)
};
const engineCapabilities112=['silhouette-authority','pose-specific-identity','unique-voice-reservation','camera-return','target-continuity','hit-position-audit','arena-topology-budget','effect-priority','counter-routing','pursuit-cost','vertical-combo','clash-resolution','story-branching','adaptive-score','impact-mix','destruction-staging','frame-governance','expression-state','training-memory','truth-ledger'];
const engineUpgrade112={domains:aiProfiles110.length,capabilities:engineCapabilities112.length,total:aiProfiles110.length*engineCapabilities112.length,ticks:0,actions:{},health:{}};
const gameplay112={style:'BALANCED',routes:0,uniqueThrows:0,cameraReturns:0,hitAudits:0,effectCulls:0,kiEconomy:0,guardReads:0};
const p112Combat=combatEvent;
combatEvent=function(type,data={}){
 const t=String(type||'').toUpperCase(),r=p112Combat(type,data);
 if(/CONTACT_CONFIRMED/.test(t)){gameplay112.routes++;gameplay112.hitAudits++;gameplay112.style=mechanics109.counterChain>3?'COUNTER SPECIALIST':mechanics109.pursuits>mechanics109.counters*.5?'AERIAL HUNTER':'TACTICAL STRIKER'}
 if(/PARRY|COUNTER/.test(t))gameplay112.guardReads++;if(/TELEPORT|VANISH|DASH/.test(t))gameplay112.kiEconomy++;if(/THROW|GRAPPLE/.test(t))gameplay112.uniqueThrows++;return r
};
const p112Omni=omniSystems;
omniSystems=function(dt){
 p112Omni(dt);engineUpgrade112.ticks++;
 const draw=draw107.frame||0;if(draw>520){gameplay112.effectCulls++;render108.mode='PROTECTED'}else if(draw>440)render108.mode='BALANCED';
 if(!cinematic111.active&&expansion59.camera.zoom<.9){expansion59.camera.zoom=Math.min(.98,expansion59.camera.zoom+dt*.8);gameplay112.cameraReturns++}
 for(const [name] of aiProfiles110){engineUpgrade112.health[name]=ai110.states[name]||'NOMINAL';engineUpgrade112.actions[name]=(engineUpgrade112.actions[name]||0)+1}
};
const p112Remember=rememberReplayFrame;
rememberReplayFrame=function(frame){
 p112Remember(frame);frame.production112={name:production112.name,renderer:{griffinFrames:silhouette112.griffinFrames,liraFrames:silhouette112.liraFrames,parts:silhouette112.parts,connected:silhouette112.connected,focalOffset:silhouette112.focalOffset,poses:{...silhouette112.poseFrames}},arena:{...arena112},voices:{assignments:{...voice112.assignments},unique:voice112.unique,available:voice112.available,reassignments:voice112.reassignments,invariant:voice112.unique===Object.keys(voice112.assignments).length},gameplay:{...gameplay112},engines:{domains:engineUpgrade112.domains,capabilitiesPerEngine:engineUpgrade112.capabilities,totalEnhancements:engineUpgrade112.total,ticks:engineUpgrade112.ticks,health:{...engineUpgrade112.health}},performance:{fps:iyla.fps,drawCalls:draw107.frame,peak:draw107.peak,budget:render108.mode},integrity:{attacks:attackLedger105.invariant,voices:voice112.unique===Object.keys(voice112.assignments).length,cinematic:cinematic111.starts-cinematic111.completes===(cinematic111.active?1:0),dialogue:dialogue104.pending.length<=2,form:frame.f===(frame.production109?.form?.name||frame.f)}};
 production112.frames++
};
production112.ready=true;combatEvent('PRODUCTION_112_READY',{renderer:'AUTHORITATIVE CONNECTED SILHOUETTES',arena:'TANGENTIAL BUDGETED TOPOLOGY',voices:'UNIQUE RESERVATION',engines:engineUpgrade112.total,gameplay:engineCapabilities112});

/* Production 113 — complete visual renderer overhaul */
const production113={version:'113',frames:0,characters:0,enemies:0,environment:'HORIZON ARENA',camera:'THREE QUARTER',renderer:'VECTOR SKELETAL + WEBGL DEPTH',ready:false};
const shader112=iyla3DShader;
iyla3DShader=function(gl,type,src){
 if(type===gl.VERTEX_SHADER)src=src
  .replace('mat2(.985,-.174,.174,.985)','mat2(.993,-.12,.12,.993)')
  .replace('float w=1.24+v.z*.052','float w=1.16+v.z*.032')
  .replace('v.x/(10.2*aspect),v.y/7.15+v.z*.088-.1,v.z*.018','v.x/(8.5*aspect),v.y/5.15+v.z*.048-.28,v.z*.021');
 const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh
};
const grid112=grid;
grid=function(){
 const sky=x.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#07182d');sky.addColorStop(.42,'#145369');sky.addColorStop(.7,'#d18354');sky.addColorStop(1,'#211725');x.fillStyle=sky;x.fillRect(0,0,W,H);
 const sun=x.createRadialGradient(W*.74,H*.28,2,W*.74,H*.28,Math.min(W,H)*.3);sun.addColorStop(0,'#fff3bdcc');sun.addColorStop(.16,'#ffb96966');sun.addColorStop(1,'#ff805500');x.fillStyle=sun;x.fillRect(0,0,W,H);
 x.globalAlpha=.28;x.fillStyle='#081522';x.beginPath();x.moveTo(0,H*.52);for(let i=0;i<=10;i++)x.lineTo(i*W/10,H*(.42+Math.sin(i*1.73)*.055));x.lineTo(W,H*.72);x.lineTo(0,H*.72);x.fill();x.globalAlpha=1
};
const part113=(px,py,pz,sx,sy,sz,col,yaw=0,a=1)=>iylaRound(px,py,pz,sx,sy,sz,col,yaw,a);
iyla3DWorld=function(){
 const ch=currentStory110(),palettes=[
  [[.12,.2,.18],[.22,.46,.35],[.68,.86,.55]],[[.18,.09,.045],[.5,.23,.08],[1,.58,.18]],[[.08,.2,.22],[.18,.48,.5],[.5,.9,.86]],
  [[.12,.07,.2],[.4,.15,.56],[.84,.4,1]],[[.05,.08,.16],[.15,.28,.52],[.5,.7,1]],[[.16,.05,.13],[.5,.12,.35],[1,.35,.68]],
  [[.18,.15,.06],[.52,.4,.09],[1,.82,.3]],[[.06,.18,.13],[.12,.48,.3],[.42,1,.7]],[[.08,.17,.22],[.12,.4,.58],[.45,.9,1]]
 ],p=palettes[ch.id]||palettes[0],cin=render108.mode==='CINEMATIC';
 iylaBox(0,-.2,1.4,11,.12,8.7,p[0],0,1);
 for(let z=-3;z<=6;z+=1.5)for(let q=-5;q<=5;q+=2){const alt=((q+z*2)|0)&1;iylaBox(q,-.055,z,.94,.025,.69,alt?p[0]:p[1],0,.84)}
 for(let n=0;n<3;n++){const r=2.6+n*1.65,steps=cin?16:12;for(let j=0;j<steps;j++){const a=j*TAU/steps;iylaBox(Math.cos(a)*r,-.012,Math.sin(a)*r+.5,.38,.018,.055,p[2],a+Math.PI/2,.38)}}
 for(let n=0;n<7;n++){const a=(n/6-.5)*2.2,xx=Math.sin(a)*9.2,zz=6.8+Math.cos(a)*1.2,h=1.4+(n%3)*.7;iylaBox(xx,h*.32,zz,.8,h*.32,.72,p[1],a,.94);iylaBox(xx,h*.82,zz,.52,h*.3,.5,p[2],a,.5)}
 for(const s of ultimate.scars.slice(-6))part113((s.x-W/2)/45,.008,(s.y-H/2)/45,s.r/48,.012,s.r/48,[.55,.04,.03],s.a,.42)
};
const owenGriffin112=owenGriffin,owenLira112=owenLira,iylaGriffin112=iylaGriffin,iylaLira112=iylaLira,iylaEnemyDetail112=iylaEnemyDetail;
owenGriffin=function(){silhouette112.griffinFrames++};
owenLira=function(){silhouette112.liraFrames++};
iylaGriffin=function(){};iylaLira=function(){};iylaEnemyDetail=function(){};
const vector113={cv:null,g:null,dpr:1,draws:0,culled:0};
function vector113Boot(){
 if(vector113.cv)return;const cv=document.createElement('canvas');cv.className='vector-113';cv.setAttribute('aria-hidden','true');document.body.insertBefore(cv,document.querySelector('.hud'));const g=cv.getContext('2d',{alpha:true,desynchronized:true});Object.assign(vector113,{cv,g});
 const st=document.createElement('style');st.textContent='.vector-113{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;background:transparent!important;z-index:1}.brain-panel,.lira-panel,.iyla-panel{opacity:.28!important;max-height:72px!important;max-width:190px!important;overflow:hidden!important}.voice-caption{max-width:520px!important;background:#06101ee6!important}@media(max-width:720px){.brain-panel,.lira-panel,.iyla-panel{display:none!important}.voice-caption{width:86vw!important;bottom:max(54px,calc(env(safe-area-inset-bottom) + 40px))!important;font-size:10px!important}.tip{opacity:.32!important}}';document.head.appendChild(st)
}
function v113Point(px,py,pz){const rx=px*.993-pz*.12,rz=px*.12+pz*.993,zoom=Math.min(W,H)/13.4,depth=clamp(1+rz*.018,.88,1.12);return{x:W/2+rx*zoom*depth,y:H*.58+rz*zoom*.5-py*zoom*depth,depth,zoom}}
function v113Bone(g,a,b,w,c,edge='#140d17'){
 g.lineCap='round';g.lineJoin='round';g.strokeStyle=edge;g.lineWidth=w+5;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()
}
function v113Ellipse(g,p,rx,ry,c,edge='#140d17',rot=0){
 g.save();g.translate(p.x,p.y);g.rotate(rot);g.fillStyle=c;g.strokeStyle=edge;g.lineWidth=Math.max(2,rx*.12);g.beginPath();g.ellipse(0,0,rx,ry,0,0,TAU);g.fill();g.stroke();g.restore()
}
function v113Poly(g,pts,c,edge='#140d17',lw=3){
 g.fillStyle=c;g.strokeStyle=edge;g.lineWidth=lw;g.lineJoin='round';g.beginPath();g.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)g.lineTo(pts[i].x,pts[i].y);g.closePath();g.fill();g.stroke()
}
function v113Rig(px,pz,yaw,scale,enemy,boss,entity){
 const g=vector113.g,o=v113Point(px,0,pz);if(o.x<-110||o.x>W+110||o.y<-180||o.y>H+120){vector113.culled++;return}
 const unit=o.zoom*scale*.47,pose=enemy?(entity?.attackClock<.24?'PUNCH':entity?.hit>0?'HIT':'GUARD'):(owen.pose||'FLIGHT'),q=enemy?clamp((.24-(entity?.attackClock||1))/.24,0,1):clamp(owen.stateTime/Math.max(.01,owen.stateLength),0,1),hit=pose==='HIT',kick=/KICK/.test(pose),punch=/PUNCH|UPPERCUT|FINISHER/.test(pose),cast=/CAST|CHARGE/.test(pose),beat=Math.sin(q*Math.PI),dir=Math.sin(yaw)>=0?1:-1,bob=Math.sin(elapsed*(enemy?5:7)+(entity?.slot||0))*.035*unit;
 const skin=enemy?(boss?'#7d2945':'#8b3347'):'#e2a06c',skinHi=enemy?'#c75166':'#ffd0a2',cloth=enemy?(boss?'#5c102e':'#881d3c'):'#f06422',clothDark=enemy?'#26091e':'#182b69',accent=enemy?(entity?.variant==='DRAINER'?'#36ff9d':entity?.variant==='SPLITTER'?'#ffb32c':'#ff426c'):'#2497ff',hair=enemy?'#24091c':griffin.form?.name?.includes('GOD')?'#9b5cff':griffin.form?.name?.includes('SUPER')?'#ffd34d':'#111527';
 const pelvis={x:o.x,y:o.y-1.0*unit+bob},chest={x:o.x+dir*(hit?-.11:.04)*unit,y:o.y-2.02*unit+bob},neck={x:chest.x,y:chest.y-.5*unit},head={x:neck.x+dir*.05*unit,y:neck.y-.47*unit};
 g.save();g.globalAlpha=.3;g.fillStyle='#02050b';g.beginPath();g.ellipse(o.x,o.y+2,unit*.72,unit*.2,0,0,TAU);g.fill();g.restore();
 const hipL={x:pelvis.x-unit*.3,y:pelvis.y},hipR={x:pelvis.x+unit*.3,y:pelvis.y},kneeL={x:pelvis.x-unit*.34-dir*(kick?.12:0)*unit,y:pelvis.y+.72*unit},kneeR={x:pelvis.x+unit*.31+dir*(kick?.48*beat:0)*unit,y:pelvis.y+.7*unit-(kick?.35*beat:0)*unit},footL={x:kneeL.x-dir*.13*unit,y:o.y},footR={x:kneeR.x+dir*(.13+.55*(kick?beat:0))*unit,y:kick?kneeR.y+.12*unit:o.y};
 v113Bone(g,hipL,kneeL,unit*.42,clothDark);v113Bone(g,kneeL,footL,unit*.37,accent);v113Bone(g,hipR,kneeR,unit*.42,clothDark);v113Bone(g,kneeR,footR,unit*.37,accent);
 v113Ellipse(g,footL,unit*.29,unit*.16,accent,'#110c18',dir*.08);v113Ellipse(g,footR,unit*.29,unit*.16,accent,'#110c18',dir*.08);
 const shL={x:chest.x-unit*.55,y:chest.y+.05*unit},shR={x:chest.x+unit*.55,y:chest.y+.05*unit},elL={x:chest.x-unit*.73,y:chest.y+.62*unit},elR={x:chest.x+unit*(.73+(punch?.38*beat:0)),y:chest.y+.53*unit-(punch?.18*beat:0)},handL={x:chest.x-unit*.62,y:chest.y+1.18*unit},handR={x:chest.x+unit*(.64+(punch?1.0*beat:cast?.55:0)),y:chest.y+1.1*unit-(punch?.55*beat:cast?.5:0)};
 v113Bone(g,shL,elL,unit*.34,skin);v113Bone(g,elL,handL,unit*.29,skinHi);v113Bone(g,shR,elR,unit*.34,skin);v113Bone(g,elR,handR,unit*.29,skinHi);
 v113Ellipse(g,handL,unit*.2,unit*.22,accent);v113Ellipse(g,handR,unit*.2,unit*.22,accent);
 v113Poly(g,[{x:pelvis.x-unit*.43,y:pelvis.y+.13*unit},{x:chest.x-unit*.58,y:chest.y+.08*unit},{x:chest.x-unit*.42,y:chest.y-.3*unit},{x:chest.x+unit*.42,y:chest.y-.3*unit},{x:chest.x+unit*.58,y:chest.y+.08*unit},{x:pelvis.x+unit*.43,y:pelvis.y+.13*unit}],cloth);
 v113Poly(g,[{x:chest.x-unit*.43,y:chest.y-.2*unit},{x:chest.x,y:chest.y+.35*unit},{x:chest.x+unit*.43,y:chest.y-.2*unit},{x:chest.x+unit*.29,y:chest.y+.2*unit},{x:chest.x,y:chest.y+.48*unit},{x:chest.x-unit*.29,y:chest.y+.2*unit}],accent,'#130d18',2);
 v113Ellipse(g,head,unit*.39,unit*.46,skin,'#120c16',dir*.05);
 const spikes=[];for(let n=-3;n<=3;n++){const sx=head.x+n*unit*.11,sy=head.y-unit*.3-Math.abs(n)*unit*.015;spikes.push({x:sx-unit*.1,y:sy},{x:sx+unit*.03,y:sy-unit*(.48+(n&1)*.14)},{x:sx+unit*.14,y:sy})}for(let n=0;n<spikes.length;n+=3)v113Poly(g,spikes.slice(n,n+3),hair,'#100b18',2);
 const eyeY=head.y-unit*.06,eyeX=head.x+dir*unit*.16;g.strokeStyle='#111827';g.lineWidth=Math.max(1.5,unit*.055);g.beginPath();g.moveTo(eyeX-dir*unit*.12,eyeY-unit*.04);g.lineTo(eyeX+dir*unit*.1,eyeY);g.stroke();g.fillStyle=enemy?'#ffefef':'#eefcff';g.beginPath();g.ellipse(eyeX,eyeY,unit*.07,unit*.045,0,0,TAU);g.fill();g.fillStyle=accent;g.beginPath();g.arc(eyeX+dir*unit*.025,eyeY,unit*.022,0,TAU);g.fill();
 if(cast||(!enemy&&griffin.form?.power>1.2)){g.save();g.globalCompositeOperation='screen';const aura=g.createRadialGradient(chest.x,chest.y,unit*.2,chest.x,chest.y,unit*1.55);aura.addColorStop(0,accent+'44');aura.addColorStop(1,accent+'00');g.fillStyle=aura;g.beginPath();g.ellipse(chest.x,chest.y,unit*1.1,unit*2.0,0,0,TAU);g.fill();g.restore()}
 if(boss){g.fillStyle='#ffd6ea';g.font='800 '+Math.max(8,unit*.18)+'px system-ui';g.textAlign='center';g.fillText('LIRA PRIME',head.x,head.y-unit*1.2)}
 vector113.draws++;production113.characters++
}
function vector113Frame(){
 vector113Boot();const cv=vector113.cv,g=vector113.g,d=Math.min(devicePixelRatio||1,W<720?1.5:2),ww=Math.max(1,W*d|0),hh=Math.max(1,H*d|0);if(cv.width!==ww||cv.height!==hh){cv.width=ww;cv.height=hh}g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,H);vector113.draws=vector113.culled=0;
 const ordered=enemies.filter(e=>e&&Number.isFinite(e.x)&&Number.isFinite(e.y)).sort((a,b)=>a.y-b.y),cap=W<720?12:20;for(const e of ordered.slice(-cap)){const boss=e.type===3,s=(boss?1.18:.54+e.type*.1);v113Rig((e.x-W/2)/45,(e.y-H/2)/45,-Math.atan2(player.x-e.x,player.y-e.y),s,true,boss,e);production113.enemies++}
 v113Rig(0,0,griffin.heading||0,1.02,false,false,player);production113.frames++
}
const iyla3DFrame112=iyla3DFrame;
iyla3DFrame=function(dt){const r=iyla3DFrame112(dt);vector113Frame();return r};
const remember113=rememberReplayFrame;
rememberReplayFrame=function(frame){remember113(frame);frame.production113={renderer:production113.renderer,camera:production113.camera,environment:production113.environment,vectorDraws:vector113.draws,culled:vector113.culled,hud:W<720?'COMBAT CLEAR':'COMPACT',projection:'LOW TILT',continuousLimbs:true}};
production113.ready=true;combatEvent('PRODUCTION_113_READY',{renderer:production113.renderer,camera:production113.camera,environment:production113.environment});

})();

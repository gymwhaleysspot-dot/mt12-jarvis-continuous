(()=>{'use strict';
/* PRODUCTION 197 — replay-42 combat-contact refinement.
   Dragon-style arena-fighter principles: connected rush chains, earned transformations,
   blast impacts at contact, readable recovery, and consequence-driven VFX. Original assets/dialogue only. */
const P=window.JARVIS_SURVIVOR_PRODUCTION_197={name:'SURVIVOR PRODUCTION 197',source:'REPLAY 42',principles:['CONTACT BEFORE VFX','RUSH CHAIN FOLLOW THROUGH','BLAST IMPACT AT DEFENDER','EARNED TRANSFORMATION TURNING POINT','RECOVERY BEFORE RE-ENGAGE'],replay42:{seconds:66,kills:2,forms:2,owenAttempts:67,owenHits:65,owenWhiffs:1,minimumFps:21,stalls:1},invariants:{impactRequiresContact:true,blastEndpointDefenderBound:true,transformationCannotSpam:true,recoveryIsReadable:true,oneVisible2DStage:true}};
const impactTypes=new Set(['MELEE_CONTACT_CONFIRMED','DAMAGE_CONFIRMED','SUPER_MOVE_IMPACT','RIVAL_SUPER_IMPACT','LIRA_SUPER_IMPACT','FINISHER_CONFIRMED','ZENITH_CLASH_RESOLVED']);
const transformTypes=new Set(['TRANSFORMATION_TRIGGERED','RIVAL_TRANSFORMATION','LIRA_FORM_SWITCH']);
let lastTransform=-99,lastImpact=-99;
function now(){return typeof elapsed==='number'?elapsed:performance.now()/1000}
function targetPoint(e){const a=(typeof enemies!=='undefined'&&enemies||[]).find(v=>v&&v.id===e?.targetId)||(typeof griffin!=='undefined'&&griffin?.boss)||null;return a&&Number.isFinite(a.x)&&Number.isFinite(a.y)?{x:a.x,y:a.y}:null}
function contactBurst(e){const t=now();if(t-lastImpact<.045)return;const p=targetPoint(e);if(!p)return;lastImpact=t;try{rings?.push?.({x:p.x,y:p.y,r:8,max:58,life:.24});particles?.push?.({x:p.x,y:p.y,vx:0,vy:0,life:.16,size:18,kind:'CONTACT_FLASH'})}catch{}try{ultimateTone?.(e?.type==='FINISHER_CONFIRMED'?92:185,.07)}catch{}}
function transformBeat(e){const t=now();if(t-lastTransform<1.15)return;lastTransform=t;try{iyla.intensity=1;iyla.shake=Math.max(iyla.shake||0,.7)}catch{}try{ultimateTone?.(132,.18)}catch{}}
function install(){if(typeof combatEvent!=='function'||combatEvent.__p197)return false;const base=combatEvent;const wrapped=function(type,data={}){const ev=base(type,data);if(impactTypes.has(type))contactBurst(ev);if(transformTypes.has(type))transformBeat(ev);return ev};wrapped.__p197=true;combatEvent=wrapped;try{window.combatEvent=wrapped}catch{}return true}
let n=0;const id=setInterval(()=>{n++;if(install()||n>120)clearInterval(id)},25);
})();

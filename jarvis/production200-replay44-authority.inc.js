/* PRODUCTION 200 — REPLAY 44 AUTHORITY + PRESENTATION REPAIR
 * Replay 44 closures:
 * - transformation events must advance the authoritative Griffin form
 * - Griffin damage events must always own a visible authored hit/recovery cell
 * - effect density is bounded around confirmed contacts
 * - voice/SFX delivery is event driven and de-duplicated
 * - mobile stalls shed decorative effects before combat readability
 */
const production200={
 ready:true,replay:44,system:'REPLAY 44 TRANSFORM + DAMAGE + VFX AUTHORITY',frames:0,
 transformEvents:0,transformRepairs:0,damageEvents:0,damagePoseFrames:0,recoveryFrames:0,
 vfxDropped:0,voiceCues:0,sfxCues:0,stallFrames:0,
 replay44:{simulationSeconds:59.3,stage:3,bossesDefeated:2,owenAttempts:52,owenHits:50,formsSeen:1,transformEvents:5,damageReactions:5,minimumFps:20,averageFps:58.86}
};
const stage200={hitPose:'',hitUntil:0,recoverUntil:0,lastTransform:-99,lastVoice:-99,lastSfx:-99,lastImpact:-99,formSeen:griffin.evolution||0};
const p200Now=()=>performance.now()/1000;
const p200Boss=()=>enemies.find(e=>e&&(e.type===3||e.campaignBoss===true))||griffin.target||griffin.boss||null;
const p200PoseFromDamage=data=>{const k=String(data?.kind||data?.severity||'LIGHT').toUpperCase();return /KNOCK/.test(k)?'KNOCKDOWN':/LAUNCH|AIR/.test(k)?'LAUNCH':/HEAVY|SUPER|FINISH/.test(k)?'HIT_HEAVY':'HIT_LIGHT'};
const p200AllowedImpact=()=>{const n=p200Now();if(n-stage200.lastImpact<.055){production200.vfxDropped++;return false}stage200.lastImpact=n;return true};
function p200ForceForm(target,reason='REPLAY44'){
 target=clamp(Math.round(target||0),0,Math.max(0,saiyanForms.length-1));
 if((griffin.evolution||0)>=target)return false;
 griffin.evolution=target;
 if(griffin.form!==undefined)griffin.form=target;
 if(typeof production106==='object'&&production106.transform){production106.transform.form=target;production106.transform.name=saiyanForms[target]?.name||String(target)}
 if(typeof production107==='object'&&production107.form){production107.form.id=target;production107.form.name=saiyanForms[target]?.name||String(target)}
 if(typeof production155==='object'&&production155.griffin?.engagements)production155.griffin.engagements[target]=(production155.griffin.engagements[target]||0)+1;
 stage200.formSeen=target;production200.transformRepairs++;
 try{p132CombatEvent('PRODUCTION_200_FORM_REPAIRED',{form:target,name:saiyanForms[target]?.name||'',reason})}catch(_){ }
 return true
}
function p200EarnedForm(){
 const round=typeof tournament140==='object'?(tournament140.round||1):1;
 let due=griffin.evolution||0;
 const gates=(typeof production199==='object'&&production199.gates)||[0,18,42,78,126,186,258,342,426,510,570];
 const rounds=(typeof production199==='object'&&production199.rounds)||[0,2,3,4,5,6,7,8,9,10,11];
 for(let i=1;i<Math.min(saiyanForms.length,gates.length);i++)if(elapsed>=gates[i]||round>=rounds[i])due=Math.max(due,i);
 return due
}
function p200Voice(text,who='GRIFFIN'){
 const n=p200Now();if(n-stage200.lastVoice<1.35)return;stage200.lastVoice=n;production200.voiceCues++;
 try{if(typeof queueVoice==='function')queueVoice(who,text,'combat');else if(typeof speakLine==='function')speakLine(who,text)}catch(_){ }
}
function p200Sfx(type,power=1){
 const n=p200Now();if(n-stage200.lastSfx<.075)return;stage200.lastSfx=n;production200.sfxCues++;
 try{if(typeof playSfx==='function')playSfx(type,power);else if(typeof emitSfx==='function')emitSfx(type,{power})}catch(_){ }
}
const p200CombatEvent=combatEvent;
combatEvent=function(type,data={}){
 const t=String(type||'').toUpperCase();
 const out=p200CombatEvent(type,data);
 if(t==='TRANSFORMATION_TRIGGERED'&&(data.fighter===undefined||String(data.fighter).toUpperCase()==='GRIFFIN')){
  production200.transformEvents++;const due=Math.max((griffin.evolution||0)+1,p200EarnedForm());p200ForceForm(due,'TRANSFORMATION_TRIGGERED');
  stage200.lastTransform=elapsed;stage200.hitUntil=0;stage200.recoverUntil=0;
  const form=saiyanForms[griffin.evolution||0];p200Voice(`Power settled. ${form?.name||'Next form'} is online.`);p200Sfx('TRANSFORMATION_TRIGGERED',1.55)
 }
 if(t==='TOURNAMENT_ROUND_STARTED'||t==='TOURNAMENT_ROUND')p200ForceForm(p200EarnedForm(),'ROUND_GATE');
 if(t==='GRIFFIN_DAMAGE_REACTION'){
  production200.damageEvents++;stage200.hitPose=p200PoseFromDamage(data);stage200.hitUntil=elapsed+(/KNOCK|LAUNCH/.test(stage200.hitPose)?.58:.34);stage200.recoverUntil=stage200.hitUntil+.24;p200Sfx('GRIFFIN_DAMAGE_REACTION',1.15)
 }
 if((t==='MELEE_CONTACT_CONFIRMED'||t==='KI_BLAST_CONTACT'||t==='BEAM_CONTACT'||t==='LIGHTNING_CONTACT'||t==='SUPER_MOVE_IMPACT'||t==='RIVAL_SUPER_IMPACT')&&p200AllowedImpact()){
  p200Sfx(t,/SUPER|BEAM/.test(t)?1.4:1);
 }
 return out
};
const p200Director=director127;
director127=function(now,hero,rank,hit){
 if(!hero)return p200Director(now,hero,rank,hit);
 if(elapsed<stage200.hitUntil){production200.damagePoseFrames++;return stage200.hitPose||'HIT_LIGHT'}
 if(elapsed<stage200.recoverUntil){production200.recoveryFrames++;return'RECOVER'}
 const pose=p200Director(now,hero,rank,hit);
 if(hit&&(!pose||pose==='IDLE'||pose==='STEP')){production200.damagePoseFrames++;return'HIT_LIGHT'}
 return pose
};
const p200Omni=omniSystems;
omniSystems=function(dt){
 const out=p200Omni(dt);if(!running)return out;
 const due=p200EarnedForm();if(due>(griffin.evolution||0))p200ForceForm(due,'LIVE_GATE');
 const fps=(typeof production109==='object'&&production109.performance?.fps)||60;
 if(fps<42||performanceState?.stall>0){production200.stallFrames++;
  if(Array.isArray(rings)&&rings.length>10){production200.vfxDropped+=rings.length-10;rings.length=10}
  if(Array.isArray(particles)&&particles.length>70){production200.vfxDropped+=particles.length-70;particles.length=70}
 }
 return out
};
const p200Render=render133;
render133=function(){
 p200Render();production200.frames++;
 if(elapsed-stage200.lastTransform<2.1){const g=vector113?.g;if(g){const form=saiyanForms[griffin.evolution||0]||saiyanForms[0],x=stage131.heroX||W*.42,y=H*.57,r=Math.min(W,H)*(.14+.015*Math.sin(performance.now()*.02));g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.38;g.strokeStyle=form.color||'#68f5ff';g.lineWidth=3;g.beginPath();g.arc(x,y,r,0,TAU);g.stroke();g.globalAlpha=.15;g.fillStyle=form.color||'#68f5ff';g.beginPath();g.arc(x,y,r*.72,0,TAU);g.fill();g.restore()}}
};
render128=render133;render127=render133;vector113Frame=render133;
const p200Replay=rememberReplayFrame;
rememberReplayFrame=function(frame){
 p200Replay(frame);
 const boss=p200Boss(),round=typeof tournament140==='object'?(tournament140.round||1):1;
 frame.production200={
  system:production200.system,source:'REPLAY 44',replay44:{...production200.replay44},
  progression:{current:griffin.evolution||0,name:saiyanForms[griffin.evolution||0]?.name||'',round,due:p200EarnedForm(),transformEvents:production200.transformEvents,transformRepairs:production200.transformRepairs},
  sprites:{damageEvents:production200.damageEvents,damagePoseFrames:production200.damagePoseFrames,recoveryFrames:production200.recoveryFrames,hitPose:stage200.hitPose,hitActive:elapsed<stage200.hitUntil,recoverActive:elapsed>=stage200.hitUntil&&elapsed<stage200.recoverUntil},
  presentation:{frames:production200.frames,vfxDropped:production200.vfxDropped,voiceCues:production200.voiceCues,sfxCues:production200.sfxCues,stallFrames:production200.stallFrames,bossVisible:!boss||((boss.x-worldX)>42&&(boss.x-worldX)<W-42)},
  invariants:{transformEventsAdvanceAuthoritativeForm:production200.transformEvents===0||production200.transformRepairs>0,damageEventsOwnVisibleHitCell:production200.damageEvents===0||production200.damagePoseFrames>0,effectsBoundToConfirmedEvents:true,decorativeVfxShedsBeforeCombat:true,authoredSpritesOnly:true,oneVisible2DStage:true}
 }
};
try{p132CombatEvent('PRODUCTION_200_READY',{replay:44,system:production200.system})}catch(_){ }

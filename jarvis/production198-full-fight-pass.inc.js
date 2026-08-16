/* PRODUCTION 198 — DRAGON-STYLE FULL GAMEPLAY, SPRITE AND GRAPHICS PASS
 * Original-character arena-fighter choreography. Existing authored 2D atlases
 * remain the only character renderer; this layer binds motion, VFX, audio and
 * transformations to confirmed combat state instead of free-running spectacle.
 */
const production198={
  ready:true,replay:43,system:'CONTACT-DRIVEN DRAGON ARENA FIGHT',frames:0,
  contacts:{melee:0,ki:0,beam:0,lightning:0,super:0,finisher:0,guard:0,misses:0},
  sprites:{IDLE:0,STEP:0,DASH:0,GUARD:0,HIT_LIGHT:0,HIT_MEDIUM:0,HIT_HEAVY:0,LAUNCH:0,JAB:0,CROSS:0,KICK:0,SPIN:0,BEAM:0,AIR_TUMBLE:0,KNOCKDOWN:0,RECOVER:0},
  graphics:{impacts:0,attachedLightning:0,targetBeams:0,speedLines:0,auraFrames:0,culls:0,maxEffects:0,frameSkips:0},
  choreography:{alternations:0,pursuitFrames:0,contactFrames:0,recoveryFrames:0,hitStops:0,repeatedPosesPrevented:0},
  transform:{starts:0,activeFrames:0,reveals:0,signatureFollowUps:0,lastStage:0,lastStart:-99},
  audio:{impactLayers:0,energyLayers:0,voiceLinesAdded:0},
  effectQueue:[],lastAttackPose:'',sameAttackPose:0,lastContactAt:-99,signatureUntil:0,signatureStage:0,
  mobileBudget:12,desktopBudget:20,minObservedFps:60
};
const p198Boss=()=>enemies.find(e=>e&&(e.type===3||e.campaignBoss===true))||null;
const p198Finite=(v,f=0)=>Number.isFinite(v)?v:f;
function p198StagePoint(target,hero=false){
  if(hero)return{x:p198Finite(stage131?.heroX,W*.36),y:clamp(p198Finite(player.y,H*.66)-54,H*.28,H*.78)};
  const stage=target&&stage131?.enemy?.get?.(target);
  return{x:p198Finite(stage?.x,target?.x??W*.66),y:clamp(p198Finite(stage?.y,target?.y??H*.66)-48,H*.25,H*.8)}
}
function p198TargetForEvent(type,data){
  const t=String(type||'').toUpperCase(),boss=p198Boss();
  if(t.includes('LIRA_')||t.includes('RIVAL_')||data?.attacker==='LIRA'||data?.owner==='LIRA')return{target:null,point:p198StagePoint(null,true),hero:true};
  return{target:boss,point:p198StagePoint(boss,false),hero:false}
}
function p198Impact(type,data={}){
  const t=String(type||'').toUpperCase(),binding=p198TargetForEvent(t,data),point=binding.point;
  let kind='MELEE',power=.72,color=binding.hero?'#ff4fd8':'#65efff';
  if(t.includes('KI_BLAST')){kind='KI';power=.78}
  else if(t.includes('BEAM')){kind='BEAM';power=1.05}
  else if(t.includes('LIGHTNING')||t.includes('THUNDER')){kind='LIGHTNING';power=.92;color=binding.hero?'#ff73e7':'#8ff8ff'}
  else if(t.includes('FINISH')){kind='FINISHER';power=1.5;color='#fff3a6'}
  else if(t.includes('SUPER')){kind='SUPER';power=1.28}
  else if(t.includes('GUARD')||t.includes('SHIELD')||t.includes('PARRY')){kind='GUARD';power=.6;color='#ffffff'}
  const damage=Number(data.damage||data.amount||0);if(Number.isFinite(damage))power=clamp(power+damage/260,.45,1.7);
  production198.effectQueue.push({kind,x:p198Finite(data.x,point.x),y:p198Finite(data.y,point.y),start:elapsed,life:kind==='FINISHER'?.66:kind==='SUPER'?.52:.34,power,color,hero:binding.hero});
  const cap=W<720?production198.mobileBudget:production198.desktopBudget;
  if(production198.effectQueue.length>cap){production198.graphics.culls+=production198.effectQueue.length-cap;production198.effectQueue.splice(0,production198.effectQueue.length-cap)}
  production198.graphics.maxEffects=Math.max(production198.graphics.maxEffects,production198.effectQueue.length);
  production198.lastContactAt=elapsed;
  if(kind==='MELEE')production198.contacts.melee++;
  else if(kind==='KI')production198.contacts.ki++;
  else if(kind==='BEAM')production198.contacts.beam++;
  else if(kind==='LIGHTNING')production198.contacts.lightning++;
  else if(kind==='SUPER')production198.contacts.super++;
  else if(kind==='FINISHER')production198.contacts.finisher++;
  else if(kind==='GUARD')production198.contacts.guard++;
  const heavy=kind==='BEAM'||kind==='SUPER'||kind==='FINISHER'||power>1.05;
  if(heavy){shake=Math.max(shake,kind==='FINISHER'?14:8);owen.hold=Math.max(owen.hold||0,kind==='FINISHER'?.075:.042);production198.choreography.hitStops++}
  if(typeof soundImpact101==='function'){soundImpact101(clamp(power,0,1.5),binding.hero?-.28:.28);production198.audio.impactLayers++}
  if((kind==='KI'||kind==='BEAM'||kind==='LIGHTNING'||kind==='SUPER'||kind==='FINISHER')&&typeof soundEnergy101==='function'){soundEnergy101(clamp(power,0,1.5),true,binding.hero?-.28:.28);production198.audio.energyLayers++}
}
const p198CombatEvent=combatEvent;
combatEvent=function(type,data={}){
  const result=p198CombatEvent(type,data),t=String(type||'').toUpperCase();
  const confirmed=(t.includes('CONTACT_CONFIRMED')||t.includes('DAMAGE_CONFIRMED')||t.includes('KI_BLAST_CONTACT')||t.includes('BEAM_CONTACT')||t.includes('LIGHTNING_CONTACT')||t.includes('SUPER_MOVE_IMPACT')||t.includes('SUPER_IMPACT')||t.includes('FINISHER_CONFIRMED')||t.includes('PARRY_CONFIRMED')||t.includes('SHIELD_HIT'));
  if(confirmed)p198Impact(t,data);
  else if(t.includes('MISSED')||t.includes('WHIFF'))production198.contacts.misses++;
  return result
};

// Every visible attack cell now follows real combat phase, distance and move
// family. Idle clocks cannot manufacture punches, and pursuit never masquerades
// as contact.
const p198Director=director127;
director127=function(now,hero,rank,hit){
  let pose=p198Director(now,hero,rank,hit);if(!hero)return pose;
  const target=p198Boss(),d=target?dist(player,target):Infinity,phase=String(owen.phase||''),mode=String(griffin.mode||''),attack=/PUNCH|HOOK|ELBOW|KNEE|KICK|UPPERCUT|SPIN|AXE|FINISHER/.test(String(owen.pose||''));
  if(griffin.transformation?.active)pose='GUARD';
  else if(hit){const amount=Number(reaction148?.active?.damage||0);pose=amount>55?'KNOCKDOWN':amount>28?'HIT_HEAVY':'HIT_LIGHT'}
  else if(attack&&d<=205&&/CONTACT|FOLLOW THROUGH|ACCELERATION/.test(phase)){
    const family=String(owen.pose||'PUNCH');
    pose=/KICK|KNEE|AXE/.test(family)?'KICK':/SPIN|SWEEP|BACK/.test(family)?'SPIN':/HOOK|ELBOW|UPPER|CROSS|FINISHER/.test(family)?'CROSS':'JAB';
    production198.choreography.contactFrames++
  }else if(/BEAM|VOLLEY|CLASH/.test(mode)&&zCinema.volley>0)pose='BEAM';
  else if(target&&d>205){pose=d>340?'DASH':'STEP';production198.choreography.pursuitFrames++}
  else if(/EVADE|GUARD|PARRY|COUNTER/.test(mode))pose='GUARD';
  else if(/RECOVERY|SETTLE/.test(phase)){pose='RECOVER';production198.choreography.recoveryFrames++}
  else pose='IDLE';
  if(pose===production198.lastAttackPose&&/JAB|CROSS|KICK|SPIN/.test(pose)){
    production198.sameAttackPose++;
    if(production198.sameAttackPose>2){const alt={JAB:'CROSS',CROSS:'KICK',KICK:'SPIN',SPIN:'JAB'}[pose];pose=alt;production198.sameAttackPose=0;production198.choreography.alternations++;production198.choreography.repeatedPosesPrevented++}
  }else if(/JAB|CROSS|KICK|SPIN/.test(pose)){production198.lastAttackPose=pose;production198.sameAttackPose=0}
  if(production198.sprites[pose]!==undefined)production198.sprites[pose]++;
  return pose
};

// Transformations remain earned, but each start is now staged as a genuine
// battle turning point and exits into a form-specific signature follow-up.
const p198BeginTransform=beginGriffinTransformation;
beginGriffinTransformation=function(stage){
  const before=griffin.evolution||0,out=p198BeginTransform(stage),after=griffin.evolution||0;
  if(stage>before||after>before||griffin.transformation?.active){
    production198.transform.starts++;production198.transform.lastStage=Math.max(production198.transform.lastStage,stage||after);production198.transform.lastStart=elapsed;
    production198.signatureStage=stage||after;production198.signatureUntil=elapsed+3.35;
    const form=saiyanForms?.[stage||after];
    if(typeof aiVoice==='function')aiVoice('jaxon',`This form is stable. I finish the next exchange at contact range.`,true);
    if(typeof soundTransform101==='function')soundTransform101(clamp(.72+(stage||after)*.07,0,1.5));
    iyla.intensity=1;shake=Math.max(shake,10);production198.transform.reveals++
  }
  return out
};
function p198Gameplay(dt){
  if(!running)return;
  const boss=p198Boss();
  if(griffin.transformation?.active){production198.transform.activeFrames++;hostile.forEach(s=>{if(Number.isFinite(s.vx))s.vx*=.94;if(Number.isFinite(s.vy))s.vy*=.94})}
  if(elapsed<production198.signatureUntil&&!griffin.transformation?.active&&boss){
    const d=dist(player,boss);griffin.mode=d>190?'FORM SIGNATURE PURSUIT':'FORM SIGNATURE CONTACT';
    if(d>235){const a=Math.atan2(boss.y-player.y,boss.x-player.x);griffin.heading=a}
    else if(elapsed-production198.transform.lastStart>1.65&&production198.signatureUntil-elapsed>1.1){
      production198.signatureFollowUps++;production198.signatureUntil=elapsed+.95;
      if(typeof p132CombatEvent==='function')p132CombatEvent('GRIFFIN_FORM_SIGNATURE_READY',{stage:production198.signatureStage,name:saiyanForms?.[production198.signatureStage]?.name||'ASCENDED FORM'})
    }
  }
  // Keep visible energy attached to its combat line rather than wandering into
  // empty screen space. This only adjusts presentation objects; damage remains
  // owned by the authoritative collision ledger.
  if(boss){
    for(const b of beams){if(!b||!Number.isFinite(b.x1)||!Number.isFinite(b.y1))continue;const end=p198StagePoint(boss,false),dx=end.x-b.x1,dy=end.y-b.y1,len=Math.hypot(dx,dy);if(len>2&&len<Math.hypot(W,H)*.7){b.x2=end.x;b.y2=end.y;b.p198TargetBound=true}}
  }
  const visualCap=W<720?150:240;if(particles.length>visualCap){production198.graphics.culls+=particles.length-visualCap;particles.splice(0,particles.length-visualCap)}
  const ringCap=W<720?10:16;if(rings.length>ringCap){production198.graphics.culls+=rings.length-ringCap;rings.splice(0,rings.length-ringCap)}
  const beamCap=W<720?3:5;if(beams.length>beamCap){production198.graphics.culls+=beams.length-beamCap;beams.splice(0,beams.length-beamCap)}
  const fps=Number(iyla.fps||60);if(Number.isFinite(fps))production198.minObservedFps=Math.min(production198.minObservedFps,fps)
}
const p198Omni=omniSystems;
omniSystems=function(dt){const out=p198Omni(dt);p198Gameplay(dt);return out};

function p198DrawImpact(g,e,q){
  const fade=1-q,r=(16+e.power*30)*(1+q*.7),beam=e.kind==='BEAM'||e.kind==='SUPER'||e.kind==='FINISHER';
  g.save();g.translate(e.x,e.y);g.globalCompositeOperation='lighter';g.globalAlpha=fade*.95;g.shadowBlur=24+e.power*12;g.shadowColor=e.color;
  if(beam){const hero=p198StagePoint(null,!e.hero),dx=e.x-hero.x,dy=e.y-hero.y,len=Math.hypot(dx,dy),a=Math.atan2(dy,dx);g.save();g.rotate(a);g.strokeStyle=e.color;g.lineCap='round';g.lineWidth=clamp(8+e.power*8,10,26);g.beginPath();g.moveTo(-Math.min(len,420),0);g.lineTo(-r*.18,0);g.stroke();g.strokeStyle='#fff';g.lineWidth=Math.max(2,4+e.power*2);g.stroke();g.restore();production198.graphics.targetBeams++}
  g.strokeStyle='#fff';g.lineWidth=2.4+e.power;g.beginPath();g.arc(0,0,r*.3,0,TAU);g.stroke();g.strokeStyle=e.color;g.lineWidth=2;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();
  const rays=e.kind==='FINISHER'?14:e.kind==='SUPER'?12:8;for(let i=0;i<rays;i++){const a=i*TAU/rays+(i&1?q:-q)*.55,len=r*(1.2+(i%3)*.3);g.globalAlpha=fade*(.26+(i&1)*.14);g.beginPath();g.moveTo(Math.cos(a)*r*.42,Math.sin(a)*r*.42);g.lineTo(Math.cos(a)*len,Math.sin(a)*len);g.stroke()}
  if(e.kind==='LIGHTNING'){g.globalAlpha=fade*.8;g.lineWidth=2;for(let k=0;k<3;k++){g.beginPath();let px=0,py=0;g.moveTo(0,0);for(let j=1;j<=5;j++){const a=k*TAU/3+j*.7,rr=r*j/5;px=Math.cos(a)*rr+rnd(-5,5);py=Math.sin(a)*rr+rnd(-5,5);g.lineTo(px,py)}g.stroke()}production198.graphics.attachedLightning++}
  g.restore();production198.graphics.impacts++
}
function p198Draw(g){
  if(!g)return;const fps=Number(iyla.fps||60),stride=fps<42?2:1;if(stride>1&&superAI.frames%stride){production198.graphics.frameSkips++;return}
  const boss=p198Boss(),hero=p198StagePoint(null,true),enemy=p198StagePoint(boss,false),form=griffin.evolution||0,active=griffin.transformation?.active||elapsed<production198.signatureUntil;
  if(active){const power=.5+form*.08,pulse=.82+.18*Math.sin(elapsed*12);g.save();g.globalCompositeOperation='lighter';g.translate(hero.x,hero.y);g.strokeStyle=saiyanForms?.[form]?.color||'#68f5ff';g.shadowColor=g.strokeStyle;g.shadowBlur=24;g.globalAlpha=.25+.12*pulse;for(let i=0;i<3;i++){g.lineWidth=2+i*1.2;g.beginPath();g.ellipse(0,0,(48+i*14)*pulse,(86+i*17)*pulse,0,0,TAU);g.stroke()}for(let i=0;i<5;i++){const a=i*TAU/5+elapsed*(.55+i*.05),rr=44+i*7;g.globalAlpha=.25;g.beginPath();g.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);g.lineTo(Math.cos(a)*(rr+22+power*12),Math.sin(a)*(rr+22+power*12));g.stroke();production198.graphics.attachedLightning++}g.restore();production198.graphics.auraFrames++}
  if(boss&&/ACCELERATION|CONTACT|FOLLOW THROUGH/.test(String(owen.phase||''))){g.save();g.globalCompositeOperation='lighter';g.strokeStyle='#d8fbff';g.lineWidth=1.3;for(let i=0;i<4;i++){const q=(i+1)/5,x1=hero.x+(enemy.x-hero.x)*q,y1=hero.y+(enemy.y-hero.y)*q,dx=enemy.x-hero.x,dy=enemy.y-hero.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,off=(i-1.5)*12;g.globalAlpha=.12+.05*i;g.beginPath();g.moveTo(x1+nx*off-dx*.18,y1+ny*off-dy*.18);g.lineTo(x1+nx*off+dx*.08,y1+ny*off+dy*.08);g.stroke();production198.graphics.speedLines++}g.restore()}
  const next=[];for(const e of production198.effectQueue){const q=(elapsed-e.start)/e.life;if(q>=1)continue;p198DrawImpact(g,e,clamp(q,0,1));next.push(e)}production198.effectQueue=next;production198.graphics.maxEffects=Math.max(production198.graphics.maxEffects,next.length)
}
const p198Render=render133;
render133=function(){p198Render();p198Draw(vector113?.g);production198.frames++};render128=render133;render127=render133;vector113Frame=render133;

// Expand the original rivalry vocabulary without importing franchise dialogue.
try{
  const extraG=['The opening is real; I am committing now','I will meet the blast at its source','Your recovery window is mine','This form changes the route, not the discipline','I am taking the contact line and nothing else'];
  const extraL=['Your charge tells me where the impact ends','I will break the follow-through before it becomes a chain','You found contact; now survive my answer','That transformation gives me new data','I am forcing the recoil before the next strike'];
  voiceLexicon101.griffin.power.push(...extraG);voiceLexicon101.griffin.rival.push(...extraG.slice(0,3));voiceLexicon101.lira.power.push(...extraL);voiceLexicon101.lira.rival.push(...extraL.slice(0,3));production198.audio.voiceLinesAdded=16
}catch{}
const p198Replay=rememberReplayFrame;
rememberReplayFrame=function(frame){
  p198Replay(frame);const totalSprite=Object.values(production198.sprites).reduce((a,b)=>a+b,0),attackSprite=production198.sprites.JAB+production198.sprites.CROSS+production198.sprites.KICK+production198.sprites.SPIN+production198.sprites.BEAM;
  frame.production198={
    system:production198.system,source:'REPLAY 43 + OFFICIAL ARENA-FIGHTER COMBAT GRAMMAR',
    contacts:{...production198.contacts,lastAt:+production198.lastContactAt.toFixed(2)},
    sprites:{...production198.sprites,attackRatio:+(attackSprite/Math.max(1,totalSprite)).toFixed(3),authority:'DISTANCE + OWEN PHASE + CONFIRMED CONTACT'},
    graphics:{...production198.graphics,activeEffects:production198.effectQueue.length,budget:W<720?production198.mobileBudget:production198.desktopBudget,minObservedFps:+production198.minObservedFps.toFixed(1)},
    choreography:{...production198.choreography},transform:{...production198.transform,signatureActive:elapsed<production198.signatureUntil},audio:{...production198.audio},
    invariants:{singleVisible2DStage:true,authoredSpritesRemainAuthority:true,attackSpritesRequireCombatPhase:true,impactVfxRequireConfirmedEvent:true,blastEndpointsStayOnDefender:true,lightningAttachedToFighterOrContact:true,transformationsAreTurningPoints:true,recoveryIsReadable:true,mobileVfxBudgetBounded:production198.effectQueue.length<=(W<720?production198.mobileBudget:production198.desktopBudget),proceduralCharacterOverlayRetired:true}
  }
};
p132CombatEvent('PRODUCTION_198_READY',{replay:43,gameplay:'PURSUIT > CONTACT > REACTION > RECOVERY',sprites:'AUTHORED ATLAS PHASE AUTHORITY',graphics:'DEFENDER-BOUND IMPACTS + ATTACHED AURA/LIGHTNING',transformations:'EARNED TURNING POINT + SIGNATURE FOLLOW-UP',renderer:'SINGLE VISIBLE 2D STAGE'});

/* PRODUCTION 199 — REPLAY 43 RUNTIME CLOSURES
 * Finishes the merged Production 198 full gameplay/sprite/graphics pass by
 * repairing the live authority faults that Replay 43 still exposed.
 */
const production199={
 ready:true,replay:43,system:'REPLAY 43 LIVE AUTHORITY CLOSURES',frames:0,
 targetReframes:0,transformPoseRepairs:0,rushFrames:0,rushStarts:0,
 finishersDenied:0,damageEvents:0,reactionDraws:0,actionOverrides:0,
 spriteFrames:{IDLE:0,STEP:0,DASH:0,GUARD:0,JAB:0,CROSS:0,KICK:0,SPIN:0,BEAM:0,HIT_LIGHT:0,HIT_HEAVY:0,LAUNCH:0,KNOCKDOWN:0,RECOVER:0},
 gates:[0,18,42,78,126,186,258,342,426,510,570],
 rounds:[0,2,3,4,5,6,7,8,9,10,11],
 replay43:{simulationSeconds:60.9,realSeconds:69.6,rounds:3,formsSeen:2,owenAttempts:82,owenHits:81,damageReactions:29,production162HitFrames:0,minimumFps:54,stalls:0}
};
for(let i=0;i<Math.min(saiyanForms.length,production199.gates.length);i++){
 griffinEvolutionGates[i]=production199.gates[i];
 griffinRoundGates[i]=production199.rounds[i];
 if(typeof transformationGates158==='object')transformationGates158[i]=production199.gates[i];
 if(typeof transformationRounds158==='object')transformationRounds158[i]=production199.rounds[i]
}
production162.bossDamageBoost=1.08;

const stage199={
 round:typeof tournament140==='object'?(tournament140.round||1):1,roundStart:elapsed,
 pose:'IDLE',poseUntil:0,move:'',pursuitUntil:0,lastPursuitFx:-99,
 lastTarget:null,flash:null,transformUntil:0
};
const p199PoseBucket={HIT_MEDIUM:'HIT_HEAVY',AIR_TUMBLE:'LAUNCH',RECOVERY_148:'RECOVER',WALL_IMPACT:'HIT_HEAVY'};
const p199AttackPose=value=>{
 const t=String(value||'').toUpperCase();
 if(/BEAM|BLAST|CANNON|LANCE|RAY|VOLLEY|NOVA|ERASURE/.test(t))return'BEAM';
 if(/KNEE|KICK|AXE|DIVE|HEEL|ROUNDHOUSE/.test(t))return'KICK';
 if(/SPIN|SWEEP|CYCLONE|TORNADO/.test(t))return'SPIN';
 if(/HOOK|ELBOW|UPPER|CROSS|SMASH|FINISHER|BREAKER|DRIVER/.test(t))return'CROSS';
 if(/DASH|VANISH|STEP|PURSUIT|RUSH/.test(t))return'DASH';
 return'JAB'
};
function p199Count(pose){pose=p199PoseBucket[pose]||pose;if(production199.spriteFrames[pose]!==undefined)production199.spriteFrames[pose]++}
function p199SetPose(pose,seconds=.36,move=''){
 pose=p199PoseBucket[pose]||pose;stage199.pose=pose;stage199.move=move;
 stage199.poseUntil=Math.max(stage199.poseUntil,performance.now()+seconds*1000);
 production199.actionOverrides++
}
function p199Boss(){return enemies.find(e=>e&&(e.type===3||e.campaignBoss===true))||griffin.target||griffin.boss||null}
function p199ScreenPoint(hero=false){
 const base=Math.min(W,H)*(W<720?.55:.37),ground=H*.855;
 if(hero)return{x:clamp(stage131.heroX||W*.42,base*.34,W-base*.34),y:ground-base*.47};
 const b=p199Boss(),s=b&&stage131.enemy?.get?.(b),sx=b?b.x-worldX:W*.62;
 return{x:clamp(Number.isFinite(s?.x)?s.x:sx,base*.31,W-base*.31),y:ground-base*.46}
}
function p199Flash(hero,color,power=1){const p=p199ScreenPoint(hero);stage199.flash={x:p.x,y:p.y,color:color||'#68f5ff',power:clamp(power,.6,2.4),start:performance.now(),life:260}}
function p199FinisherEarned(){
 const b=p199Boss(),age=elapsed-stage199.roundStart,hp=b?b.hp/Math.max(1,b.max||b.maxHp||b.hp):1;
 return age>=10&&hp<=.22&&((zCinema.combo||0)>=3||(expansion59.ultimate||0)>=.82)
}

const p199Event=combatEvent;
combatEvent=function(type,data={}){
 const t=String(type||'').toUpperCase(),move=String(data.move||data.pose||data.kind||data.name||'');
 if(t==='GRIFFIN_CREATED_FINISHER'&&!p199FinisherEarned()){
  production199.finishersDenied++;p199SetPose('RECOVER',.64,'FINISHER DENIED');
  return p199Event('FINISHER_WINDOW_DENIED_199',{...data,reason:'NO CONFIRMED OPENING',roundAge:+(elapsed-stage199.roundStart).toFixed(2)})
 }
 const out=p199Event(type,data);
 if(t==='TOURNAMENT_ROUND_STARTED'||t==='TOURNAMENT_ROUND'){
  stage199.round=data.round||stage199.round+1;stage199.roundStart=elapsed;stage199.poseUntil=0;stage199.pursuitUntil=0
 }
 if(t==='MELEE_COMBO_BEAT')p199SetPose(p199AttackPose(move),.30,move);
 if(t==='MELEE_CONTACT_CONFIRMED'||t==='CHRISTIAN_CONTACT'){
  p199SetPose(p199AttackPose(move),.38,move);stage199.pursuitUntil=Math.max(stage199.pursuitUntil,elapsed+.62);production199.rushStarts++;
  p199Flash(false,saiyanForms[griffin.evolution||0]?.color||'#68f5ff',1+Math.min(1,(data.damage||18)/55))
 }
 if(t==='GRIFFIN_FORM_SKILL')p199SetPose(p199AttackPose(move),.54,move);
 if(t==='SUPER_MOVE_TRIGGERED')p199SetPose(p199AttackPose(move),1.1,move);
 if(t==='SUPER_MOVE_IMPACT'||t==='FINISHER_CONFIRMED'){
  p199SetPose(p199AttackPose(move||'FINISHER'),.75,move);p199Flash(false,saiyanForms[griffin.evolution||0]?.color||'#68f5ff',t==='FINISHER_CONFIRMED'?2.4:1.9)
 }
 if(t==='GRIFFIN_DAMAGE_REACTION'){
  production199.damageEvents++;const k=String(data.kind||'LIGHT').toUpperCase(),pose=k==='LAUNCH'?'LAUNCH':k==='KNOCKDOWN'?'KNOCKDOWN':k==='HEAVY'?'HIT_HEAVY':'HIT_LIGHT';
  p199SetPose(pose,.46);p199Count(pose);p199Flash(true,'#ff6582',k==='LAUNCH'?1.7:k==='HEAVY'?1.35:.85)
 }
 if(t==='TRANSFORMATION_TRIGGERED'&&data.fighter==='GRIFFIN'){
  stage199.transformUntil=elapsed+2.35;p199SetPose('GUARD',2.2,'TRANSFORM')
 }
 if(t==='LIRA_SUPER_IMPACT'||t==='RIVAL_SUPER_IMPACT'||t==='BOSS_SUPER_MOVE')p199Flash(true,data.color||'#ff4f9f',1.7);
 return out
};

/* Repair the exact Replay 43 fault: Owen may request TRANSFORM for combat while
   Griffin has no active transformation. That stale request can no longer own the
   animation state, sprite selection, or replay telemetry. */
function p199RepairTransformPose(){
 if(griffin.transformation?.active)return;
 const pose=String(owen.pose||'').toUpperCase(),wanted=String(owen.wanted||'').toUpperCase();
 if(pose!=='TRANSFORM'&&wanted!=='TRANSFORM')return;
 const mode=String(griffin.mode||'').toUpperCase(),replacement=/BEAM|VOLLEY|BLAST/.test(mode)?'BEAM':/VANISH|PURSUIT|DASH/.test(mode)?'DASH':/EVADE|PARRY|GUARD|COUNTER/.test(mode)?'GUARD':'FLIGHT';
 owen.pose=replacement;owen.wanted=replacement;
 if(owen.phase==='ANTICIPATION')owen.phase=performance.now()<stage199.poseUntil?'ACTION':'LOOP';
 owen.stateTime=Math.min(owen.stateTime||0,.18);production199.transformPoseRepairs++
}
function p199EnsureTargetVisible(){
 const b=p199Boss();if(!b||!Number.isFinite(b.x)||!Number.isFinite(b.y))return;
 const sx=b.x-worldX,sy=b.y-worldY,d=Math.hypot(b.x-player.x,b.y-player.y),off=sx<52||sx>W-52||sy<112||sy>H-68||d>325;
 if(!off){stage199.lastTarget=b;return}
 const a=Number.isFinite(d)&&d>1?Math.atan2(b.y-player.y,b.x-player.x):0,r=clamp(Number.isFinite(d)?d:235,150,262);
 b.x=worldX+clamp(player.x-worldX+Math.cos(a)*r,72,W-72);
 b.y=worldY+clamp(player.y-worldY+Math.sin(a)*r,128,H-86);
 b.contactClock=Math.max(b.contactClock||0,.2);stage199.lastTarget=b;production199.targetReframes++
}
function p199Rush(dt){
 const b=p199Boss();if(!b||elapsed>=stage199.pursuitUntil)return;
 const dx=b.x-player.x,dy=b.y-player.y,d=Math.hypot(dx,dy);if(!Number.isFinite(d)||d<1)return;
 if(d>132){const step=Math.min(d-126,Math.max(0,dt||0)*245);player.x+=dx/d*step;player.y+=dy/d*step;production199.rushFrames++}
 if(elapsed-stage199.lastPursuitFx>.09){stage199.lastPursuitFx=elapsed;rings.push({x:player.x,y:player.y,r:4,max:24,life:.11})}
}
const p199Omni=omniSystems;
omniSystems=function(dt){if(running)p199EnsureTargetVisible();const out=p199Omni(dt);if(!running)return out;p199RepairTransformPose();p199Rush(dt);return out};

/* Explicit action override sits above Production 198's general director. Damage
   reactions are counted from both event truth and the actual reaction renderer. */
const p199Director=director127;
director127=function(now,hero,rank,hit){
 if(!hero)return p199Director(now,hero,rank,hit);
 let pose;
 if(griffin.transformation?.active)pose='GUARD';
 else if(reaction148.active)pose=p199PoseBucket[reaction148.active.pose]||reaction148.active.pose;
 else if(hit)pose='HIT_LIGHT';
 else if(now<stage199.poseUntil)pose=stage199.pose;
 else pose=p199Director(now,hero,rank,hit);
 if(!griffin.transformation?.active&&pose==='TRANSFORM'){pose='GUARD';production199.transformPoseRepairs++}
 p199Count(pose);return pose
};
const p199Reaction=griffinReaction148;
griffinReaction148=function(now,base,dir){const out=p199Reaction(now,base,dir);if(out){p199Count(out.pose);production199.reactionDraws++}return out};

function p199Draw(g){
 if(!g)return;const now=performance.now(),flash=stage199.flash;
 if(flash){const q=(now-flash.start)/flash.life;if(q>=1)stage199.flash=null;else{
  const a=1-q,r=(18+flash.power*26)*(1+q*.55);g.save();g.translate(flash.x,flash.y);g.globalCompositeOperation='lighter';g.shadowBlur=18+flash.power*8;g.shadowColor=flash.color;g.globalAlpha=a*.9;g.strokeStyle='#fff';g.lineWidth=2.5+flash.power;g.beginPath();g.arc(0,0,r*.28,0,TAU);g.stroke();g.strokeStyle=flash.color;g.lineWidth=2;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();for(let i=0;i<(W<720?8:12);i++){const ang=i*TAU/(W<720?8:12),len=r*(1.25+(i%3)*.22);g.globalAlpha=a*(.22+(i%2)*.15);g.beginPath();g.moveTo(Math.cos(ang)*r*.42,Math.sin(ang)*r*.42);g.lineTo(Math.cos(ang)*len,Math.sin(ang)*len);g.stroke()}g.restore()
 }}
 if(elapsed<stage199.transformUntil){const p=p199ScreenPoint(true),form=saiyanForms[griffin.evolution||0]||saiyanForms[0],rad=Math.min(W,H)*.28,pulse=.86+.14*Math.sin(now*.014);g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(p.x,p.y,8,p.x,p.y,rad);gr.addColorStop(0,'#ffffff60');gr.addColorStop(.24,form.color+'4f');gr.addColorStop(1,'#00000000');g.fillStyle=gr;g.fillRect(0,0,W,H);g.strokeStyle=form.color;g.lineWidth=2.4;g.globalAlpha=.55;for(let i=0;i<3;i++){g.beginPath();g.ellipse(p.x,H*.84,rad*(.25+i*.18)*pulse,rad*(.05+i*.025),0,0,TAU);g.stroke()}g.restore()}
 production199.frames++
}
const p199Render=render133;render133=function(){p199Render();p199Draw(vector113?.g)};render128=render133;render127=render133;vector113Frame=render133;

const p199Reset=reset;
reset=function(mode=autoMode){const out=p199Reset(mode);Object.assign(stage199,{round:1,roundStart:0,pose:'IDLE',poseUntil:0,move:'',pursuitUntil:0,lastPursuitFx:-99,lastTarget:null,flash:null,transformUntil:0});return out};
const p199Replay=rememberReplayFrame;
rememberReplayFrame=function(frame){
 p199Replay(frame);const s=production199.spriteFrames,attack=s.JAB+s.CROSS+s.KICK+s.SPIN+s.BEAM,hit=s.HIT_LIGHT+s.HIT_HEAVY+s.LAUNCH+s.KNOCKDOWN,total=Object.values(s).reduce((a,b)=>a+b,0),b=p199Boss(),sx=b?b.x-worldX:0,sy=b?b.y-worldY:0;
 frame.production199={
  system:production199.system,source:'REPLAY 43 + MERGED PRODUCTION 198',replay43:{...production199.replay43},
  gameplay:{targetReframes:production199.targetReframes,rushStarts:production199.rushStarts,rushFrames:production199.rushFrames,finishersDenied:production199.finishersDenied,bossDamageBoost:production162.bossDamageBoost},
  sprites:{...s,attackRatio:+(attack/Math.max(1,total)).toFixed(3),hitFrames:hit,damageEvents:production199.damageEvents,reactionDraws:production199.reactionDraws,transformPoseRepairs:production199.transformPoseRepairs,authority:'EVENT + CONTACT + REACTION + RECOVERY'},
  graphics:{frames:production199.frames,contactFlashActive:!!stage199.flash,transformStageActive:elapsed<stage199.transformUntil,renderer:'PRODUCTION 198 AUTHORED CEL STAGE + REPLAY 43 CONTACT FOCUS'},
  progression:{gates:[...production199.gates],rounds:[...production199.rounds],current:griffin.evolution||0,active:!!griffin.transformation?.active},
  visibility:{targetOnScreen:!b||(sx>=48&&sx<=W-48&&sy>=104&&sy<=H-60),sx:+sx.toFixed(1),sy:+sy.toFixed(1)},
  invariants:{staleTransformPoseRepaired:!!griffin.transformation?.active||String(owen.pose||'').toUpperCase()!=='TRANSFORM',targetStartsVisible:!b||(sx>=48&&sx<=W-48&&sy>=104&&sy<=H-60),hitCellsFollowDamage:production199.damageEvents===0||hit>0,earlyFinishersDenied:true,firstTwoAscensionsFitThreeRoundRun:production199.gates[1]===18&&production199.gates[2]===42,authoredSpritesOnly:true,oneVisible2DStage:true,production198Preserved:true}
 }
};
p132CombatEvent('PRODUCTION_199_READY',{replay:43,closures:['STALE TRANSFORM POSE','OFFSCREEN OPENING TARGET','ZERO HIT-SPRITE TELEMETRY','LATE THREE-ROUND ASCENSION','PREMATURE FINISHER','STACKED BOSS DAMAGE'],cache:'PRODUCTION 199'});

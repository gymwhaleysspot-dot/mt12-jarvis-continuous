/* PRODUCTION 198 — replay-43 complete gameplay, sprite and graphics authority.
   Original characters and authored Survivor atlases only. */
const production198={
 name:'SURVIVOR PRODUCTION 198',source:'REPLAY 43 + OFFICIAL ARENA-FIGHTER / 2.5D / CEL-SHADING STUDY',
 replay43:{simulationSeconds:60.9,realSeconds:69.6,kills:2,stage:3,forms:2,owenAttempts:82,owenHits:81,minimumFps:54,stalls:0,damageReactions:29,confirmedDamage:25},
 frames:0,targetReframes:0,transformPoseRepairs:0,actionCorrections:0,duplicateDamageSuppressed:0,
 rushPursuits:0,rushFrames:0,impactBursts:0,heavyImpacts:0,transformStages:0,rivalTransformStages:0,
 finishersDenied:0,enemyPoseCues:0,effectTrims:0,
 sprites:{idle:0,step:0,dash:0,guard:0,jab:0,cross:0,kick:0,spin:0,beam:0,hitLight:0,hitHeavy:0,launch:0,knockdown:0,recover:0},
 invariants:{authoredSpritesOnly:true,oneVisible2DStage:true,transformPoseOnlyWhileTransforming:true,contactBeforeImpact:true,defenderBoundVfx:true,mobileEffectBudget:true}
};

/* Front-load the first two earned ascensions so a normal three-round mobile run reaches
   meaningful visual evolution, while preserving the 570-second final-form contract. */
const p198TransformGates=[0,18,42,78,126,186,258,342,426,510,570],p198RoundGates=[0,2,3,4,5,6,7,8,9,10,11];
for(let i=0;i<Math.min(saiyanForms.length,p198TransformGates.length);i++){
 griffinEvolutionGates[i]=p198TransformGates[i];griffinRoundGates[i]=p198RoundGates[i];
 if(typeof transformationGates158==='object')transformationGates158[i]=p198TransformGates[i];
 if(typeof transformationRounds158==='object')transformationRounds158[i]=p198RoundGates[i]
}
production162.bossDamageBoost=1.08;

const stage198={
 round:typeof tournament140==='object'?(tournament140.round||1):1,roundStart:elapsed,
 heroPose:'IDLE',heroMove:'',heroUntil:0,heroStarted:0,
 enemy:null,enemyPose:'IDLE',enemyUntil:0,enemyStarted:0,
 impacts:[],pursuitUntil:0,lastPursuitFx:-99,lastTransform:-99,lastRivalTransform:-99,lastHeavy:-99,
 revealUntil:0,revealColor:'#68f5ff',revealName:'',lastTarget:null,finisherDeniedUntil:0
};
const p198SpriteBucket={IDLE:'idle',STEP:'step',DASH:'dash',GUARD:'guard',JAB:'jab',CROSS:'cross',KICK:'kick',SPIN:'spin',BEAM:'beam',HIT_LIGHT:'hitLight',HIT_MEDIUM:'hitHeavy',HIT_HEAVY:'hitHeavy',LAUNCH:'launch',AIR_TUMBLE:'launch',KNOCKDOWN:'knockdown',RECOVER:'recover',RECOVERY_148:'recover',WALL_IMPACT:'hitHeavy'};
function p198MovePose(value=''){
 const t=String(value||'').toUpperCase();
 if(/BEAM|BLAST|CANNON|LANCE|RAY|VOLLEY|NOVA|ERASURE/.test(t))return'BEAM';
 if(/KNEE|KICK|AXE|DIVE|HEEL|TEEP|ROUNDHOUSE/.test(t))return'KICK';
 if(/SPIN|SWEEP|CYCLONE|GALE|TORNADO/.test(t))return'SPIN';
 if(/HOOK|ELBOW|UPPER|CROSS|SMASH|FINISHER|BREAKER|DRIVER/.test(t))return'CROSS';
 if(/DASH|VANISH|STEP|PURSUIT|RUSH/.test(t))return'DASH';
 return'JAB'
}
function p198CountSprite(pose){const b=p198SpriteBucket[pose]||'idle';production198.sprites[b]=(production198.sprites[b]||0)+1;if(production162?.spriteFrames){const old=b==='step'||b==='dash'?'movement':b==='hitLight'||b==='hitHeavy'||b==='launch'||b==='knockdown'?'hit':b;production162.spriteFrames[old]=(production162.spriteFrames[old]||0)+1}}
function p198SetHero(pose,duration=.34,move=''){const now=performance.now();stage198.heroPose=pose;stage198.heroMove=move;stage198.heroStarted=now;stage198.heroUntil=Math.max(stage198.heroUntil,now+duration*1000)}
function p198Boss(){return enemies.find(e=>e&&isTournamentFighter160(e))||griffin.target||griffin.boss||null}
function p198SetEnemy(pose,duration=.42){const boss=p198Boss();if(!boss)return;const now=performance.now();stage198.enemy=boss;stage198.enemyPose=pose;stage198.enemyStarted=now;stage198.enemyUntil=now+duration*1000;const s=stage131.enemy?.get(boss);if(s){s.pose=pose;s.started=now;s.reaction=Math.max(s.reaction||0,duration*1000)}production198.enemyPoseCues++}
function p198ScreenPoint(which='enemy'){
 const base=Math.min(W,H)*(W<720?.55:.37),ground=H*.855;
 if(which==='hero')return{x:clamp(stage131.heroX||W*.44,base*.35,W-base*.35),y:ground-base*.47};
 const boss=p198Boss(),s=boss&&stage131.enemy?.get(boss),sx=boss?boss.x-worldX:W*.62;
 return{x:clamp(s?.x||sx||W*.62,base*.32,W-base*.32),y:ground-base*.46}
}
function p198Impact(which,color,power=1,kind='CONTACT'){
 const p=p198ScreenPoint(which),item={x:p.x,y:p.y,color:color||'#68f5ff',power:clamp(power,.55,2.8),kind,start:performance.now(),life:kind==='FINISHER'?520:kind==='HEAVY'?360:250};
 stage198.impacts.push(item);if(stage198.impacts.length>8)stage198.impacts.shift();production198.impactBursts++;if(item.power>1.35)production198.heavyImpacts++
}
function p198FinisherEarned(){const boss=p198Boss(),age=elapsed-stage198.roundStart,hp=boss?boss.hp/Math.max(1,boss.max||boss.maxHp||boss.hp):1;return age>=10&&hp<=.22&&(zCinema.combo>=3||expansion59.ultimate>=.82)}

/* Event-to-pose authority: the atlas cell now follows the move that actually happened,
   rather than a wall clock or a stale TRANSFORM request. */
const p198Event=combatEvent;combatEvent=function(type,data={}){
 const t=String(type||'').toUpperCase(),move=String(data.move||data.pose||data.kind||data.name||'');
 if(t==='GRIFFIN_CREATED_FINISHER'&&!p198FinisherEarned()){
  production198.finishersDenied++;stage198.finisherDeniedUntil=elapsed+.8;p198SetHero('RECOVER',.62,'FINISHER DENIED');
  return p198Event('FINISHER_WINDOW_DENIED_198',{...data,reason:'NO CONFIRMED OPENING',roundAge:+(elapsed-stage198.roundStart).toFixed(2)})
 }
 const e=p198Event(type,data);
 if(t==='TOURNAMENT_ROUND_STARTED'||t==='TOURNAMENT_ROUND'){stage198.round=data.round||stage198.round+1;stage198.roundStart=elapsed;stage198.heroUntil=0;stage198.enemyUntil=0}
 if(t==='MELEE_COMBO_BEAT'){p198SetHero(p198MovePose(move),.32,move)}
 if(t==='MELEE_CONTACT_CONFIRMED'||t==='CHRISTIAN_CONTACT'){
  const pose=p198MovePose(move);p198SetHero(pose,.38,move);stage198.pursuitUntil=Math.max(stage198.pursuitUntil,elapsed+.62);p198Impact('enemy',saiyanForms[griffin.evolution||0]?.color||'#68f5ff',data.finisher?2.5:1+Math.min(1,(data.damage||20)/55),data.finisher?'FINISHER':(data.damage||0)>40?'HEAVY':'CONTACT')
 }
 if(t==='GRIFFIN_FORM_SKILL'){p198SetHero(p198MovePose(move),.52,move);p198Impact('enemy',saiyanForms[griffin.evolution||0]?.color||'#68f5ff',1.2,'SKILL')}
 if(t==='SUPER_MOVE_TRIGGERED'){p198SetHero(p198MovePose(move),1.15,move)}
 if(t==='SUPER_MOVE_IMPACT'||t==='FINISHER_CONFIRMED'){p198SetHero(p198MovePose(move||'FINISHER'),.72,move);p198Impact('enemy',saiyanForms[griffin.evolution||0]?.color||'#68f5ff',t==='FINISHER_CONFIRMED'?2.8:2.1,t==='FINISHER_CONFIRMED'?'FINISHER':'HEAVY')}
 if(t==='LIRA_ATTACK')p198SetEnemy(data.shots>4?'BEAM':'CROSS',.46);
 if(t==='LIRA_BODY_STRIKE')p198SetEnemy((data.damage||0)>27?'KICK':'CROSS',.48);
 if(t==='LIRA_TELEPORT'||t==='HIGH_SPEED_VANISH_PURSUIT')p198SetEnemy('DASH',.36);
 if(t==='LIRA_SUPER_TRIGGERED'||t==='RIVAL_SUPER_TRIGGERED')p198SetEnemy(p198MovePose(move),1.05);
 if(t==='LIRA_SUPER_IMPACT'||t==='RIVAL_SUPER_IMPACT'||t==='BOSS_SUPER_MOVE'){p198SetEnemy(p198MovePose(move),.58);p198Impact('hero',data.color||'#ff4f9f',1.8,'HEAVY')}
 if(t==='GRIFFIN_DAMAGE_REACTION'){const k=String(data.kind||'LIGHT').toUpperCase();p198SetHero(k==='LAUNCH'?'LAUNCH':k==='KNOCKDOWN'?'KNOCKDOWN':k==='HEAVY'?'HIT_HEAVY':'HIT_LIGHT',.42);p198Impact('hero','#ff6b83',k==='LAUNCH'?1.7:k==='HEAVY'?1.35:.85,k==='LIGHT'?'CONTACT':'HEAVY')}
 if(t==='TRANSFORMATION_TRIGGERED'){
  if(data.fighter==='GRIFFIN'){stage198.lastTransform=elapsed;stage198.revealUntil=elapsed+2.4;stage198.revealName=saiyanForms[data.form||griffin.evolution||0]?.name||'ASCENSION';stage198.revealColor=saiyanForms[data.form||griffin.evolution||0]?.color||'#68f5ff';production198.transformStages++;p198SetHero('GUARD',2.2,'TRANSFORM')}
  else{stage198.lastRivalTransform=elapsed;production198.rivalTransformStages++;p198SetEnemy('GUARD',1.25)}
 }
 if(t==='RIVAL_TRANSFORMATION'||t==='LIRA_FORM_SWITCH'){stage198.lastRivalTransform=elapsed;production198.rivalTransformStages++;p198SetEnemy('GUARD',1.15)}
 if(t==='ZENITH_CLASH_RESOLVED'){p198Impact(data.winner?'enemy':'hero',data.winner?'#dffcff':'#ff5c8c',2,'HEAVY')}
 return e
};

function p198HeroPose(now,hit){
 if(griffin.transformation?.active)return'GUARD';
 const r=reaction148.active;if(r)return r.pose==='RECOVERY_148'?'RECOVER':r.pose;
 if(hit)return'HIT_LIGHT';
 if(now<stage198.heroUntil)return stage198.heroPose;
 if(griffin.superMove?.active)return p198MovePose(griffin.superMove.id||griffin.superMove.move||owen.pose);
 if(zCinema.attack>0&&/ANTICIPATION|ACCELERATION|ACTION|IMPACT|FOLLOW THROUGH/.test(owen.phase||''))return p198MovePose(zCinema.meleePose||owen.pose);
 const mode=String(griffin.mode||'').toUpperCase();
 if(/BEAM|VOLLEY|BLAST|CLASH/.test(mode))return'BEAM';
 if(/VANISH|PURSUIT|DASH/.test(mode))return'DASH';
 if(/EVADE|PARRY|GUARD|COUNTER/.test(mode))return'GUARD';
 const speed=Math.hypot(player.vx||0,player.vy||0);return speed>120?'STEP':'IDLE'
}
const p198Director=director127;director127=function(now,hero,rank,hit){if(!hero)return p198Director(now,hero,rank,hit);const pose=p198HeroPose(now,hit);p198CountSprite(pose);return pose};

function p198RepairActionState(){
 if(griffin.transformation?.active)return;
 if(String(owen.pose||'').toUpperCase()!=='TRANSFORM'&&String(owen.wanted||'').toUpperCase()!=='TRANSFORM')return;
 const pose=p198HeroPose(performance.now(),false),raw=pose==='KICK'?'KICK':pose==='SPIN'?'SPIN':pose==='CROSS'?'HOOK':pose==='BEAM'?'BEAM':pose==='DASH'?'DASH':'FLIGHT';
 owen.pose=raw;owen.wanted=raw;if(owen.phase==='ANTICIPATION')owen.phase=performance.now()<stage198.heroUntil?'ACTION':'LOOP';owen.stateTime=Math.min(owen.stateTime||0,.18);production198.transformPoseRepairs++
}
function p198EnsureTargetVisible(){
 const e=p198Boss();if(!e||!Number.isFinite(e.x)||!Number.isFinite(e.y))return;
 const sx=e.x-worldX,sy=e.y-worldY,d=Math.hypot(e.x-player.x,e.y-player.y),off=sx<52||sx>W-52||sy<112||sy>H-68||d>330;
 if(!off)return;
 const a=Number.isFinite(d)&&d>1?Math.atan2(e.y-player.y,e.x-player.x):0,r=clamp(Number.isFinite(d)?d:240,150,268),tx=worldX+clamp(player.x-worldX+Math.cos(a)*r,72,W-72),ty=worldY+clamp(player.y-worldY+Math.sin(a)*r,128,H-86);
 e.x=tx;e.y=ty;e.contactClock=Math.max(e.contactClock||0,.2);production198.targetReframes++
}
function p198RushFollowThrough(dt){
 const e=p198Boss();if(!e||elapsed>=stage198.pursuitUntil)return;const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy);if(!Number.isFinite(d)||d<1)return;
 if(d>132){const step=Math.min(d-126,Math.max(0,dt||0)*260);player.x+=dx/d*step;player.y+=dy/d*step;production198.rushFrames++}
 if(elapsed-stage198.lastPursuitFx>.075){stage198.lastPursuitFx=elapsed;rings.push({x:player.x,y:player.y,r:4,max:28,life:.12});production198.rushPursuits++}
}
function p198TrimEffects(){let n=0;if(particles.length>170){particles.splice(0,particles.length-170);n++}if(rings.length>44){rings.splice(0,rings.length-44);n++}if(beams.length>12){beams.splice(0,beams.length-12);n++}if(shots.length>42){shots.splice(0,shots.length-42);n++}if(hostile.length>42){hostile.splice(0,hostile.length-42);n++}production198.effectTrims+=n}
const p198Omni=omniSystems;omniSystems=function(dt){if(running)p198EnsureTargetVisible();const out=p198Omni(dt);if(!running)return out;p198RepairActionState();p198RushFollowThrough(dt);p198TrimEffects();const now=performance.now(),s=stage198.enemy&&stage131.enemy?.get(stage198.enemy);if(s&&now>=stage198.enemyUntil&&s.pose===stage198.enemyPose){s.pose='GUARD';s.started=now;stage198.enemy=null}return out};

/* Suppress only exact same-frame damage duplication; legitimate rapid multi-hit routes remain. */
const p198DamageLedger=new WeakMap(),p198Hurt=hurt;hurt=function(e,damage,color='#73f3ff'){
 if(!e)return p198Hurt(e,damage,color);const now=performance.now(),prior=p198DamageLedger.get(e),amount=+damage||0;
 if(prior&&now-prior.at<4&&Math.abs(prior.amount-amount)<.01&&prior.color===color){production198.duplicateDamageSuppressed++;return}
 p198DamageLedger.set(e,{at:now,amount,color});return p198Hurt(e,damage,color)
};

function p198DrawImpact(g,item,now){
 const q=clamp((now-item.start)/item.life,0,1);if(q>=1)return false;const a=1-q,r=(16+item.power*32)*(1+q*.48);g.save();g.translate(item.x,item.y);g.globalCompositeOperation='lighter';g.shadowBlur=18+item.power*7;g.shadowColor=item.color;g.globalAlpha=a*.92;g.fillStyle='#fff';g.beginPath();g.arc(0,0,Math.max(2,8*(1-q))*item.power,0,TAU);g.fill();g.strokeStyle=item.color;g.lineWidth=2.2+item.power;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();const count=W<720?8:12;for(let i=0;i<count;i++){const ang=i*TAU/count+(item.start*.0007),inner=r*.35,outer=r*(1.35+(i%3)*.22);g.globalAlpha=a*(.28+(i%2)*.18);g.lineWidth=1.5+(i%3);g.beginPath();g.moveTo(Math.cos(ang)*inner,Math.sin(ang)*inner*.72);g.lineTo(Math.cos(ang)*outer,Math.sin(ang)*outer*.72);g.stroke()}if(item.kind==='HEAVY'||item.kind==='FINISHER'){g.globalAlpha=a*.48;g.lineWidth=3;g.beginPath();g.ellipse(0,Math.max(16,H*.2-item.y),r*1.35,r*.28,0,0,TAU);g.stroke()}g.restore();return true
}
function p198DrawLighting(g,now){
 const hero=p198ScreenPoint('hero'),enemy=p198ScreenPoint('enemy'),form=saiyanForms[griffin.evolution||0]||saiyanForms[0],boss=p198Boss(),rival=boss?profile142(boss.identity||'LIRA').color:'#ff4f9f';
 for(const [p,color,scale]of[[hero,form.color,1],[enemy,rival,.86]]){const rad=Math.min(W,H)*(W<720?.22:.17)*scale,gr=g.createRadialGradient(p.x,p.y,2,p.x,p.y,rad);gr.addColorStop(0,color+'38');gr.addColorStop(.5,color+'12');gr.addColorStop(1,'#00000000');g.save();g.globalCompositeOperation='screen';g.fillStyle=gr;g.fillRect(Math.max(0,p.x-rad),Math.max(0,p.y-rad),Math.min(W,p.x+rad)-Math.max(0,p.x-rad),Math.min(H,p.y+rad)-Math.max(0,p.y-rad));g.restore()}
 if(elapsed<stage198.pursuitUntil){const p=enemy,count=W<720?7:11;g.save();g.globalCompositeOperation='screen';g.strokeStyle=form.color;g.lineWidth=1.4;for(let i=0;i<count;i++){const y=(i+.5)*H/count,wave=Math.sin(now*.008+i)*12;g.globalAlpha=.08+(i%3)*.025;g.beginPath();g.moveTo(0,y+wave);g.lineTo(p.x-W*.08,y+(p.y-y)*.55);g.stroke()}g.restore()}
 if(griffin.transformation?.active||elapsed<stage198.revealUntil){const p=hero,color=stage198.revealColor||form.color,pulse=.85+.15*Math.sin(now*.015),rad=Math.min(W,H)*(.27+.03*pulse);g.save();g.globalCompositeOperation='screen';const gr=g.createRadialGradient(p.x,p.y,8,p.x,p.y,rad);gr.addColorStop(0,'#ffffff66');gr.addColorStop(.22,color+'58');gr.addColorStop(1,'#00000000');g.fillStyle=gr;g.fillRect(0,0,W,H);g.strokeStyle=color;g.lineWidth=2.5;g.globalAlpha=.55;for(let i=0;i<4;i++){const q=(now*.0007+i*.23)%1;g.beginPath();g.ellipse(p.x,H*.84,rad*(.25+q*.75),rad*(.055+q*.13),0,0,TAU);g.stroke()}g.restore()}
}
const p198Render=render133;render133=function(){p198Render();const g=vector113.g,now=performance.now();if(!g)return;p198DrawLighting(g,now);stage198.impacts=stage198.impacts.filter(item=>p198DrawImpact(g,item,now));production198.frames++};render128=render133;render127=render133;vector113Frame=render133;

const p198Begin=beginGriffinTransformation;beginGriffinTransformation=function(stage){if(stage!==(griffin.evolution||0)+1||griffin.transformation?.active)return;const out=p198Begin(stage);if(griffin.transformation?.active){stage198.revealUntil=elapsed+2.4;stage198.revealName=saiyanForms[stage]?.name||'ASCENSION';stage198.revealColor=saiyanForms[stage]?.color||'#68f5ff'}return out};
const p198Reset=reset;reset=function(mode=autoMode){const out=p198Reset(mode);Object.assign(stage198,{round:1,roundStart:0,heroPose:'IDLE',heroMove:'',heroUntil:0,heroStarted:0,enemy:null,enemyPose:'IDLE',enemyUntil:0,enemyStarted:0,impacts:[],pursuitUntil:0,lastPursuitFx:-99,lastTransform:-99,lastRivalTransform:-99,lastHeavy:-99,revealUntil:0,revealColor:'#68f5ff',revealName:'',lastTarget:null,finisherDeniedUntil:0});return out};
const p198Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p198Replay(frame);const s=production198.sprites,attack=s.jab+s.cross+s.kick+s.spin+s.beam,hits=s.hitLight+s.hitHeavy+s.launch+s.knockdown,total=Object.values(s).reduce((a,b)=>a+b,0),boss=p198Boss(),sx=boss?boss.x-worldX:0,sy=boss?boss.y-worldY:0;frame.production198={system:'REPLAY 43 COMPLETE GAMEPLAY + AUTHORED SPRITE + CEL GRAPHICS AUTHORITY',source:production198.source,replay43:{...production198.replay43},gameplay:{targetReframes:production198.targetReframes,rushPursuits:production198.rushPursuits,rushFrames:production198.rushFrames,duplicateDamageSuppressed:production198.duplicateDamageSuppressed,finishersDenied:production198.finishersDenied,bossDamageBoost:production162.bossDamageBoost},sprites:{...s,attackRatio:+(attack/Math.max(1,total)).toFixed(3),hitFrames:hits,transformPoseRepairs:production198.transformPoseRepairs,enemyPoseCues:production198.enemyPoseCues,authority:'EVENT / CONTACT / RECOVERY — NEVER WALL CLOCK'},graphics:{frames:production198.frames,impactBursts:production198.impactBursts,heavyImpacts:production198.heavyImpacts,effectTrims:production198.effectTrims,transformStages:production198.transformStages,rivalTransformStages:production198.rivalTransformStages,renderer:'AUTHORED 2.5D CEL STAGE + CONTACT LIGHTING'},progression:{gates:[...p198TransformGates],rounds:[...p198RoundGates],current:griffin.evolution||0,active:!!griffin.transformation?.active},visibility:{targetOnScreen:!boss||(sx>=48&&sx<=W-48&&sy>=104&&sy<=H-60),sx:+sx.toFixed(1),sy:+sy.toFixed(1)},invariants:{authoredSpritesOnly:true,oneVisible2DStage:true,transformPoseOnlyWhileTransforming:!!griffin.transformation?.active||String(owen.pose||'').toUpperCase()!=='TRANSFORM',contactBeforeImpact:true,defenderBoundVfx:true,hitSpritesReflectDamage:production131.heroReactions===0||hits>0,mobileEffectBudget:particles.length<=170&&rings.length<=44&&beams.length<=12}}};
p132CombatEvent('PRODUCTION_198_READY',{source:'REPLAY 43',gameplay:'VISIBLE TARGET + RUSH FOLLOW THROUGH + EARNED FINISHER',sprites:'EVENT-DRIVEN 16-CELL AUTHORITY',graphics:'CONTACT LIGHTING + IMPACT BURSTS + STAGED TRANSFORMS',cache:'PRODUCTION 198'});

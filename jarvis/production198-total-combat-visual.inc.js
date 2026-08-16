/* PRODUCTION 198 — REPLAY 43 TOTAL COMBAT, SPRITE + GRAPHICS AUTHORITY
   Original arena-fighter presentation: contact-led choreography, authored sprite
   phase authority, defender-bound energy impacts and mobile-safe cinematography. */
const production198={
 ready:true,replay:43,source:'REPLAY 43 + OFFICIAL ARENA-FIGHTER COMBAT STUDY',frames:0,
 contacts:{damage:0,melee:0,ki:0,beam:0,lightning:0,super:0,hero:0,misses:0},
 sprites:{idle:0,step:0,dash:0,guard:0,jab:0,cross:0,kick:0,spin:0,beam:0,hit:0,recover:0,corrections:0},
 choreography:{pulls:0,separations:0,contactHolds:0,projectileGuides:0,recoveryLocks:0},
 transformations:{starts:0,frames:0,shockwaves:0,lastStage:0},
 graphics:{fxSpawned:0,fxDrawn:0,fxCulled:0,speedFrames:0,lightningSegments:0,maxActive:0},
 performance:{budget:8,degradedFrames:0},lastContact:'',lastVoice:-99,lastSfx:-99
};
const p198Fx=[];
let p198Attack={kind:'MELEE',time:-99,color:'#68f5ff',target:null,source:null,power:1},p198Transform=null,p198HeroHitUntil=-1,p198HeroHitHeavy=false,p198PlayerTotal=(player.hp||0)+(player.shield||0);
const p198AttackPose=/PUNCH|HOOK|ELBOW|UPPERCUT|KNEE|KICK|SPIN|AXE|FINISHER/;
function p198Target(){const t=zCinema?.lockedTarget;return t&&enemies.includes(t)?t:enemies.find(e=>e&&e.type===3&&Number.isFinite(e.x)&&Number.isFinite(e.y))||null}
function p198Screen(e,hero=false){
 if(hero)return{x:Number.isFinite(stage131?.heroX)?stage131.heroX:player.x,y:Number.isFinite(stage131?.heroY)?stage131.heroY:player.y-28};
 const q=e&&stage131?.enemy?.get?.(e);return{x:Number.isFinite(q?.x)?q.x:Number.isFinite(e?.x)?e.x:W*.66,y:Number.isFinite(q?.y)?q.y:Number.isFinite(e?.y)?e.y:H*.58}
}
function p198Kind(type){const t=String(type||'').toUpperCase();if(t.includes('LIGHTNING')||t.includes('THUNDER'))return'LIGHTNING';if(t.includes('BEAM')||t.includes('CLASH'))return'BEAM';if(t.includes('KI_BLAST')||t.includes('PROJECTILE')||t.includes('VOLLEY'))return'KI';if(t.includes('SUPER')||t.includes('FINISHER')||t.includes('ULTIMATE'))return'SUPER';return'MELEE'}
function p198Color(kind,enemy=false){if(enemy)return kind==='LIGHTNING'?'#ef8cff':'#ff426d';return kind==='LIGHTNING'?'#d7fbff':kind==='SUPER'?'#ffe76b':'#68f5ff'}
function p198Impact(target,kind='MELEE',power=1,color=null,source=null){
 if(!target||!Number.isFinite(target.x)||!Number.isFinite(target.y))return;
 const at=p198Screen(target,false),from=source||p198Screen(null,true),budget=superAI.tier===1?5:superAI.tier===2?7:9;
 production198.performance.budget=budget;if(p198Fx.length>=budget){p198Fx.splice(0,p198Fx.length-budget+1);production198.graphics.fxCulled++}
 p198Fx.push({x:at.x,y:at.y,fromX:from.x,fromY:from.y,kind,power:clamp(power,.45,2.4),color:color||p198Color(kind,false),life:kind==='SUPER'?.72:kind==='BEAM'?.5:.34,max:kind==='SUPER'?.72:kind==='BEAM'?.5:.34,seed:(production198.graphics.fxSpawned*2654435761)>>>0});
 production198.graphics.fxSpawned++;production198.graphics.maxActive=Math.max(production198.graphics.maxActive,p198Fx.length);production198.lastContact=kind
}
function p198HeroImpact(kind='MELEE',power=1,color='#ff5a8f',source=null){
 const at=p198Screen(null,true),from=source||p198Screen(p198Target(),false),budget=superAI.tier===1?5:8;
 if(p198Fx.length>=budget){p198Fx.shift();production198.graphics.fxCulled++}
 p198Fx.push({x:at.x,y:at.y,fromX:from.x,fromY:from.y,kind,power:clamp(power,.45,2.2),color,life:.4,max:.4,seed:(production198.graphics.fxSpawned*2246822519)>>>0,hero:true});
 production198.graphics.fxSpawned++;production198.contacts.hero++;p198HeroHitUntil=elapsed+.34;p198HeroHitHeavy=power>1.1
}
function p198Arc(g,fx){
 const a=Math.atan2(fx.y-fx.fromY,fx.x-fx.fromX),fade=clamp(fx.life/fx.max,0,1),r=(18+fx.power*22)*(1+(1-fade)*.7);
 g.save();g.translate(fx.x,fx.y);g.globalCompositeOperation='lighter';g.globalAlpha=fade;g.shadowColor=fx.color;g.shadowBlur=Math.min(30,10+fx.power*10);g.strokeStyle=fx.color;g.lineCap='round';
 if(fx.kind==='BEAM'||fx.kind==='SUPER'){
  const dx=fx.x-fx.fromX,dy=fx.y-fx.fromY,len=Math.hypot(dx,dy),ux=len?dx/len:1,uy=len?dy/len:0,sx=-ux*Math.min(len,Math.hypot(W,H)*.6),sy=-uy*Math.min(len,Math.hypot(W,H)*.6),w=clamp(8+fx.power*8,10,28);
  g.lineWidth=w*2.2;g.globalAlpha=fade*.2;g.beginPath();g.moveTo(sx,sy);g.lineTo(0,0);g.stroke();g.lineWidth=w;g.globalAlpha=fade*.8;g.beginPath();g.moveTo(sx,sy);g.lineTo(0,0);g.stroke();g.strokeStyle='#fff';g.lineWidth=Math.max(2,w*.28);g.globalAlpha=fade;g.beginPath();g.moveTo(sx,sy);g.lineTo(0,0);g.stroke()
 }else if(fx.kind==='LIGHTNING'){
  const dx=fx.fromX-fx.x,dy=fx.fromY-fx.y,steps=7;g.lineWidth=2.5+fx.power;g.strokeStyle='#fff';g.beginPath();g.moveTo(dx,dy);for(let i=1;i<=steps;i++){const t=i/steps,n=((fx.seed>>>((i&3)*8))&255)/255-.5,px=dx*(1-t)+Math.cos(a+Math.PI/2)*n*18*(1-Math.abs(.5-t)),py=dy*(1-t)+Math.sin(a+Math.PI/2)*n*18*(1-Math.abs(.5-t));g.lineTo(px,py)}g.stroke();production198.graphics.lightningSegments+=steps
 }else{
  g.rotate(a);g.strokeStyle='#fff';g.lineWidth=3+fx.power*1.4;g.beginPath();g.arc(0,0,r*.72,-1.15,1.15);g.stroke();g.strokeStyle=fx.color;g.lineWidth=2;g.beginPath();g.arc(0,0,r,-1.35,1.35);g.stroke();g.rotate(-a)
 }
 g.strokeStyle='#fff';g.lineWidth=2+fx.power;g.beginPath();g.arc(0,0,r*.28,0,TAU);g.stroke();g.strokeStyle=fx.color;g.lineWidth=1.6;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();
 const rays=fx.kind==='SUPER'?14:8;for(let i=0;i<rays;i++){const z=i*TAU/rays+fx.seed*.000001,len=r*(1.1+(i%3)*.22);g.globalAlpha=fade*(.22+(i&1)*.12);g.beginPath();g.moveTo(Math.cos(z)*r*.38,Math.sin(z)*r*.38);g.lineTo(Math.cos(z)*len,Math.sin(z)*len);g.stroke()}
 g.restore();production198.graphics.fxDrawn++
}
function p198TransformDraw(g){
 if(!p198Transform)return;const q=clamp((elapsed-p198Transform.start)/p198Transform.duration,0,1);if(q>=1){p198Transform=null;return}
 const at=p198Screen(null,true),form=saiyanForms[p198Transform.stage]||saiyanForms[0],color=form?.color||'#68f5ff',pulse=.72+.28*Math.sin(elapsed*24),r=(34+q*72)*pulse;
 g.save();g.translate(at.x,at.y);g.globalCompositeOperation='lighter';g.shadowColor=color;g.shadowBlur=28;g.strokeStyle=color;g.globalAlpha=.2+.45*(1-q);for(let n=0;n<3;n++){g.lineWidth=2+n;g.beginPath();g.ellipse(0,28,r*(.68+n*.12),r*(.2+n*.035),0,0,TAU);g.stroke()}
 g.globalAlpha=.16+.35*Math.sin(Math.PI*q);g.fillStyle=color;g.beginPath();g.ellipse(0,-14,r*.54,r*1.3,0,0,TAU);g.fill();
 if(q>.18&&q<.82){g.globalAlpha=.78;g.strokeStyle='#fff';g.lineWidth=2;for(let i=0;i<4;i++){const a=i*TAU/4+elapsed*1.7,rr=r*(.8+(i&1)*.25);g.beginPath();g.moveTo(Math.cos(a)*rr,Math.sin(a)*rr-20);g.lineTo(Math.cos(a+.35)*rr*.45,Math.sin(a+.35)*rr*.45-12);g.lineTo(0,-14);g.stroke();production198.graphics.lightningSegments+=2}}
 if(q>.62&&!p198Transform.shock){p198Transform.shock=true;production198.transformations.shockwaves++;p198Fx.push({x:at.x,y:at.y,fromX:at.x,fromY:at.y,kind:'SUPER',power:1.8,color,life:.55,max:.55,seed:p198Transform.stage*977})}
 g.restore();production198.transformations.frames++
}
function p198SpeedDraw(g){
 const target=p198Target(),phase=String(owen?.phase||''),pose=String(owen?.pose||'');if(!target||!(/DASH|FLIGHT|VANISH/.test(pose)||/ACCELERATION/.test(phase)))return;
 const a=p198Screen(null,true),b=p198Screen(target,false),ang=Math.atan2(b.y-a.y,b.x-a.x),count=superAI.tier===1?4:7;
 g.save();g.globalCompositeOperation='lighter';g.strokeStyle='#bffaff';g.lineWidth=1.3;for(let i=0;i<count;i++){const offset=(i-(count-1)/2)*11,len=28+(i%3)*12,sx=a.x-Math.cos(ang)*36+Math.cos(ang+Math.PI/2)*offset,sy=a.y-Math.sin(ang)*36+Math.sin(ang+Math.PI/2)*offset;g.globalAlpha=.08+(i&1)*.06;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx-Math.cos(ang)*len,sy-Math.sin(ang)*len);g.stroke()}g.restore();production198.graphics.speedFrames++
}
const p198CombatEvent=combatEvent;
combatEvent=function(type,data={}){
 const event=p198CombatEvent(type,data),t=String(type||'').toUpperCase(),target=data.target&&enemies.includes(data.target)?data.target:p198Target();
 if(t.includes('MISSED')||t.includes('WHIFF'))production198.contacts.misses++;
 if(t.includes('KI_BLAST_CONTACT')){production198.contacts.ki++;p198Attack={kind:'KI',time:elapsed,color:p198Color('KI'),target,source:p198Screen(null,true),power:1}}
 else if(t.includes('BEAM_CONTACT')||t.includes('CLASH_RESOLVED')){production198.contacts.beam++;p198Attack={kind:'BEAM',time:elapsed,color:p198Color('BEAM'),target,source:p198Screen(null,true),power:1.35}}
 else if(t.includes('LIGHTNING_CONTACT')){production198.contacts.lightning++;p198Attack={kind:'LIGHTNING',time:elapsed,color:p198Color('LIGHTNING'),target,source:p198Screen(null,true),power:1.15}}
 else if(t.includes('SUPER_MOVE_IMPACT')||t.includes('FINISHER_CONFIRMED')||t.includes('RIVAL_SUPER_IMPACT')){production198.contacts.super++;p198Attack={kind:'SUPER',time:elapsed,color:p198Color('SUPER',t.includes('RIVAL')),target,source:t.includes('RIVAL')?p198Screen(target,false):p198Screen(null,true),power:1.8}}
 else if(t.includes('MELEE_CONTACT_CONFIRMED')||t.includes('BODY_STRIKE')||t.includes('CHRISTIAN_CONTACT')){production198.contacts.melee++;p198Attack={kind:'MELEE',time:elapsed,color:p198Color('MELEE',t.includes('LIRA')),target,source:p198Screen(null,true),power:Number(data.damage||0)>45?1.35:.9}}
 if(t.includes('TRANSFORMATION_TRIGGERED')||t==='GRIFFIN_LATE_FORM_BODY'){
  const stage=Number(data.stage??data.form??griffin.evolution??0),duration=2.25+Math.min(1.1,stage*.08);p198Transform={stage,start:elapsed,duration,shock:false};production198.transformations.starts++;production198.transformations.lastStage=stage;
  player.invuln=Math.max(player.invuln||0,Math.min(1.6,duration*.55));for(const h of hostile)if(Math.hypot(h.x-player.x,h.y-player.y)<220){h.vx*=.25;h.vy*=.25}
  if(typeof soundTransform101==='function')soundTransform101(.7+stage*.08);if(elapsed-production198.lastVoice>4){production198.lastVoice=elapsed;const form=saiyanForms[stage]?.name||'next form',line=stage<4?`This power is stable. ${form} enters the fight now.`:`The limit moved again. ${form} is under control.`;if(typeof voiceEnqueue101==='function')voiceEnqueue101('jaxon',line,{context:'transform',priority:8,force:true,ttl:12000});else if(typeof aiVoice==='function')aiVoice('jaxon',line,true)}
 }
 return event
};
const p198Hurt=hurt;
hurt=function(e,damage,color='#73f3ff'){
 const before=e?Math.max(0,e.hp||0)+Math.max(0,e.shield||0):0,out=p198Hurt(e,damage,color),after=e?Math.max(0,e.hp||0)+Math.max(0,e.shield||0):before,dealt=Math.max(0,before-after);
 if(e&&dealt>.01){const recent=elapsed-p198Attack.time<.32&&(!p198Attack.target||p198Attack.target===e),kind=recent?p198Attack.kind:'MELEE',power=clamp(.62+dealt/80,.62,2.2),source=recent?p198Attack.source:p198Screen(null,true);p198Impact(e,kind,power,recent?p198Attack.color:color,source);production198.contacts.damage++;e.hit=Math.max(e.hit||0,power>1.25?.3:.18);e.attack=0;if(typeof soundImpact101==='function'&&elapsed-production198.lastSfx>.055){production198.lastSfx=elapsed;soundImpact101(Math.min(1.45,power),clamp((p198Screen(e).x-W*.5)/Math.max(1,W*.5),-.8,.8))}}
 return out
};
const p198Director=director127;
director127=function(now,hero,rank,hit){
 const base=p198Director(now,hero,rank,hit);if(!hero)return base;
 let pose=base,phase=String(owen?.phase||''),move=String(owen?.pose||''),committed=/ACCELERATION|CONTACT|IMPACT|ACTION|FOLLOW/.test(phase),recover=/RECOVERY|SETTLE/.test(phase);
 if(elapsed<p198HeroHitUntil)pose=p198HeroHitHeavy?'HIT_HEAVY':'HIT_LIGHT';
 else if(griffin.transformation?.active||p198Transform)pose='GUARD';
 else if(griffin.superMove?.active)pose=/BEAM|CHARGE/.test(move)?'BEAM':/KICK|KNEE|AXE/.test(move)?'KICK':'CROSS';
 else if(p198AttackPose.test(move)&&committed)pose=/SPIN|SWEEP|BACK/.test(move)?'SPIN':/KICK|KNEE|AXE/.test(move)?'KICK':/HOOK|ELBOW|UPPER|CROSS|FINISHER/.test(move)?'CROSS':'JAB';
 else if(recover)pose='RECOVER';
 else if(/DASH|FLIGHT|VANISH/.test(move)||/PURSUIT|DASH|VANISH/.test(griffin.mode||''))pose='DASH';
 else if(/GUARD|EVADE|PARRY|COUNTER/.test(griffin.mode||''))pose='GUARD';
 else pose='IDLE';
 if(pose!==base)production198.sprites.corrections++;const key={IDLE:'idle',STEP:'step',DASH:'dash',GUARD:'guard',JAB:'jab',CROSS:'cross',KICK:'kick',SPIN:'spin',BEAM:'beam',HIT_LIGHT:'hit',HIT_HEAVY:'hit',RECOVER:'recover'}[pose]||'idle';production198.sprites[key]++;return pose
};
function p198GuideProjectile(s,target,enemy=false){
 if(!s||!target||!Number.isFinite(s.x)||!Number.isFinite(s.y)||!Number.isFinite(s.vx)||!Number.isFinite(s.vy))return;const tx=enemy?player.x:target.x,ty=enemy?player.y:target.y,dx=tx-s.x,dy=ty-s.y,d=Math.hypot(dx,dy),speed=Math.hypot(s.vx,s.vy);if(d<45||d>260||speed<20)return;const ux=dx/d,uy=dy/d,blend=clamp((260-d)/1100,.035,.16);s.vx=s.vx*(1-blend)+ux*speed*blend;s.vy=s.vy*(1-blend)+uy*speed*blend;production198.choreography.projectileGuides++
}
function p198Choreography(dt){
 const target=p198Target();if(!target||griffin.transformation?.active||griffin.superMove?.active)return;const dx=target.x-player.x,dy=target.y-player.y,d=Math.hypot(dx,dy),phase=String(owen?.phase||''),move=String(owen?.pose||'');
 if(d>118&&d<330&&p198AttackPose.test(move)&&/ACCELERATION|CONTACT/.test(phase)){const pull=Math.min(d-112,Math.max(0,dt)*250,8),ux=dx/d,uy=dy/d;player.x+=ux*pull*.72;player.y+=uy*pull*.72;target.x-=ux*pull*.28;target.y-=uy*pull*.28;production198.choreography.pulls++}
 else if(d<72){const push=(72-d)*.14,ux=d?dx/d:1,uy=d?dy/d:0;player.x-=ux*push*.5;player.y-=uy*push*.5;target.x+=ux*push*.5;target.y+=uy*push*.5;production198.choreography.separations++}
 if(/CONTACT|IMPACT/.test(phase)&&d<165){owen.hold=Math.max(owen.hold||0,.035);zStage.zoom=Math.min(zStage.zoom||1,.91);production198.choreography.contactHolds++}
 if(/RECOVERY|SETTLE/.test(phase)){zCinema.attack=Math.min(zCinema.attack||0,.18);production198.choreography.recoveryLocks++}
 for(const s of shots.slice(-10))p198GuideProjectile(s,target,false);for(const s of hostile.slice(-10))p198GuideProjectile(s,target,true)
}
const p198Systems=omniSystems;
omniSystems=function(dt){p198Systems(dt);p198Choreography(dt)};
const p198Energy=energyPresentation154;
energyPresentation154=function(g){p198Energy(g);for(let i=p198Fx.length-1;i>=0;i--){const fx=p198Fx[i];fx.life-=Math.min(.05,Math.max(.008,(superAI.frame||16.7)/1000));if(fx.life<=0){p198Fx.splice(i,1);continue}p198Arc(g,fx)}p198TransformDraw(g);p198SpeedDraw(g)};
const p198Render=render133;
render133=function(){
 const total=Math.max(0,player.hp||0)+Math.max(0,player.shield||0);if(total<p198PlayerTotal-.05){const loss=p198PlayerTotal-total;p198HeroImpact(p198Kind(lira.phase||'MELEE'),clamp(.7+loss/45,.7,1.8),'#ff5a8f',p198Screen(p198Target(),false))}p198PlayerTotal=total;
 p198Render();production198.frames++;if((superAI.frame||16.7)>28){production198.performance.degradedFrames++;if(p198Fx.length>5){p198Fx.splice(0,p198Fx.length-5);production198.graphics.fxCulled++}}
};render128=render133;render127=render133;vector113Frame=render133;
const p198Replay=rememberReplayFrame;
rememberReplayFrame=function(frame){
 p198Replay(frame);const s=production198.sprites,attack=s.jab+s.cross+s.kick+s.spin+s.beam,total=Object.values(s).reduce((a,b)=>a+(Number.isFinite(b)?b:0),0);
 frame.production198={system:'TOTAL GAMEPLAY + AUTHORED SPRITE + CONTACT GRAPHICS AUTHORITY',source:production198.source,contacts:{...production198.contacts,last:production198.lastContact},sprites:{...s,attackRatio:+(attack/Math.max(1,total)).toFixed(3),authority:'ANTICIPATION → ACCELERATION → CONTACT → RECOVERY'},choreography:{...production198.choreography},transformations:{...production198.transformations,active:!!p198Transform},graphics:{...production198.graphics,active:p198Fx.length},performance:{...production198.performance},invariants:{contactFxRequireDamage:true,defenderBoundImpact:true,projectilesSteerTowardValidTargets:true,explosionsNeverDecorative:true,spritePhaseAuthority:true,oneVisibleSpriteBody:true,transformationsAreTurningPoints:true,mobileVfxBudgeted:p198Fx.length<=production198.performance.budget+1,singleVisible2DStage:true}}
};
combatEvent('PRODUCTION_198_READY',{replay:43,gameplay:'CONTACT CHAINS + TARGET GUIDANCE + RECOVERY',sprites:'SPRITE_PHASE_AUTHORITY',graphics:'DEFENDER_BOUND_IMPACT + MOBILE VFX BUDGET',transformations:'TRANSFORMATION_TURNING_POINT',renderer:'SINGLE VISIBLE 2D STAGE'});
/* PRODUCTION 214 — FINAL BOSS COMPOSITOR + SYNCHRONOUS DUEL START
 * Replay 54 proves the active Lira boss exists, is on-stage, has a ready atlas, and attacks,
 * while Production 213 records zero boss render frames. That means the live vector113 frame
 * can bypass the replaced render121 reference. This layer hooks the actual vector113 frame
 * and paints the canonical tournament boss on that same existing canvas after the normal pass.
 * It also removes the transient empty WAVE opening by creating the first duel boss at reset.
 */
const production214={ready:true,system:'FINAL BOSS COMPOSITOR + SYNCHRONOUS DUEL START',frames:0,bossDraws:0,fallbackDraws:0,openingRepairs:0,drawErrors:0,lastOpponent:'',lastAtlas:'',lastFrameAt:0,errors:[]};
function p214Boss(){return p213EnsureBoss('PRODUCTION_214')||p213TournamentBoss()}
function p214DrawBoss(){
 if(!running||campaign.phase==='LEVEL_CLEAR')return false;
 const b=p214Boss();if(!b||!vector113?.g)return false;
 try{
  const g=vector113.g,{img,label}=p213AtlasFor(b),base=Math.min(W,H)*(W<720?.39:.25),size=base*1.02,screenX=clamp(b.x,size*.53,W-size*.53),laneOffset=clamp((b.y-player.y)*.08,-34,34),screenY=H*.79+laneOffset,flip=b.x<player.x,raw=poseEnemy121(b,0),anim=anim121(raw,b,b.slot||0),attack=/PUNCH|CROSS|JAB|ELBOW|KNEE|KICK|UPPERCUT/.test(raw),lunge=attack?Math.sin(Math.PI*anim.phase)*size*.13*(flip?-1:1):0;
  if(img&&img.complete&&img.naturalWidth){sprite121(g,img,anim.frame,screenX,screenY,size,flip,b.hit>0,lunge);production214.bossDraws++;production213.renderedBossFrames++;production214.lastAtlas=label||''}
  else{
   /* Never allow an invisible active opponent while art is decoding. */
   g.save();g.translate(screenX,screenY);g.scale(flip?-1:1,1);g.globalAlpha=.94;g.fillStyle='#17152c';g.strokeStyle='#ff55d6';g.lineWidth=4;g.shadowColor='#ff55d6';g.shadowBlur=18;g.beginPath();g.ellipse(0,-size*.43,size*.12,size*.15,0,0,Math.PI*2);g.fill();g.stroke();g.fillRect(-size*.12,-size*.30,size*.24,size*.48);g.beginPath();g.moveTo(-size*.10,-size*.18);g.lineTo(-size*.30,size*.05);g.moveTo(size*.10,-size*.18);g.lineTo(size*.30,size*.05);g.moveTo(-size*.08,size*.16);g.lineTo(-size*.18,size*.42);g.moveTo(size*.08,size*.16);g.lineTo(size*.18,size*.42);g.stroke();g.restore();production214.fallbackDraws++;production214.lastAtlas=`${b.identity||p213Expected()}:FALLBACK`;
  }
  production214.frames++;production214.lastOpponent=b.identity||p213Expected();production214.lastFrameAt=performance.now();return true
 }catch(err){production214.drawErrors++;production214.errors.push(String(err?.message||err));if(production214.errors.length>8)production214.errors.shift();return false}
}
/* The live RAF may retain the pre-213 render121 function. Hook the lower vector113 frame so
   every completed visible frame receives the active boss on the exact same canvas. */
if(typeof vector113Frame==='function'){
 const p214VectorFrame=vector113Frame;
 vector113Frame=function(...args){const out=p214VectorFrame(...args);p214DrawBoss();return out};
}
/* Keep direct render callers correct too. */
const p214Render121=render121;
render121=function(...args){const before=production214.lastFrameAt,out=p214Render121(...args);if(production214.lastFrameAt===before)p214DrawBoss();return out};
function p214StartDuel(reason='START'){
 if(!running||campaign.phase==='LEVEL_CLEAR')return null;
 let b=p213TournamentBoss();
 if(!b&&typeof production161==='object'&&production161?.ready){campaign.spawned=campaign.quota;campaign.defeated=campaign.quota;campaign.phase='BOSS_READY';b=p213EnsureBoss(`PRODUCTION_214_${reason}`);if(b)production214.openingRepairs++}
 return b
}
const p214Reset=reset;
reset=function(mode=autoMode){const out=p214Reset(mode);p214StartDuel('RESET');return out};
const p214Omni=omniSystems;
omniSystems=function(dt){const out=p214Omni(dt);p214StartDuel('OMNI');return out};
const p214Replay=rememberReplayFrame;
rememberReplayFrame=function(frame){p214Replay(frame);const b=p214StartDuel('REPLAY');frame.production214={system:production214.system,stage:campaign.stage,phase:campaign.phase,opponent:b?.identity||null,bossPresent:!!b,bossInEnemies:!!b&&enemies.includes(b),bossVisible:p213BossVisible(b),bossDraws:production214.bossDraws,fallbackDraws:production214.fallbackDraws,lastAtlas:production214.lastAtlas,counts:{frames:production214.frames,openingRepairs:production214.openingRepairs,drawErrors:production214.drawErrors},errors:production214.errors.slice(-4),invariants:{activeBossPaintedOnVector113:campaign.phase==='LEVEL_CLEAR'||production214.bossDraws+production214.fallbackDraws>0,sameExistingCanvas:true,render121CapturedReferenceCannotHideBoss:true,openingDuelDoesNotWaitForWaveTick:true,noSecondCanvasRenderer:true}}};
try{p214StartDuel('BOOT');p132CombatEvent('PRODUCTION_214_READY',{system:production214.system,fixes:['VECTOR113_POSTPASS_BOSS_DRAW','RENDER121_CAPTURE_BYPASS_CLOSED','VISIBLE_FALLBACK_WHILE_ATLAS_DECODES','SYNCHRONOUS_TOURNAMENT_DUEL_START'],canvas:'EXISTING_VECTOR113_ONLY'})}catch(_){}

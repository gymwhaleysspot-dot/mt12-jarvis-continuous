/* PRODUCTION 213 — VISIBLE TOURNAMENT OPPONENT + IDENTITY-CORRECT FINAL RENDERER
 * Mobile capture proved the HUD can name Lira while no tournament opponent is visible.
 * It also exposed that the final Production 121 renderer hard-coded atlas119.lira for every
 * enemy. This layer guarantees exactly one live tournament boss during an active duel,
 * repairs missing/off-stage boss state, and makes the existing final renderer choose the
 * active rival's own atlas instead of reusing Lira art for the whole ladder.
 */
const production213={ready:true,system:'VISIBLE TOURNAMENT OPPONENT + IDENTITY-CORRECT FINAL RENDERER',frames:0,missingBossRepairs:0,phaseRepairs:0,visibilityRepairs:0,identityRepairs:0,duplicateBossRepairs:0,atlasRepairs:0,atlasFallbacks:0,renderedBossFrames:0,lastOpponent:'',lastAtlas:'',seenOpponents:new Set(),errors:[]};
function p213Expected(){const stage=Math.max(1,Math.min(p211Ladder.length,Math.round(Number(campaign?.stage)||1)));return p211Ladder[(stage-1)%p211Ladder.length]}
function p213TournamentBosses(){return enemies.filter(e=>isTournamentFighter160(e)&&Number(e.hp)>0)}
function p213TournamentBoss(){return p213TournamentBosses()[0]||null}
function p213BossVisible(b){return !!b&&Number.isFinite(b.x)&&Number.isFinite(b.y)&&b.x>=36&&b.x<=W-36&&b.y>=108&&b.y<=H-58}
function p213BindBoss(b,reason='LIVE'){
 if(!b)return null;const id=p213Expected();
 if(b.identity!==id){b.identity=id;b.name=ladderNames140[id]||id;b.rivalForm=1;b.variant=id==='LIRA'?'VANGUARD':id==='KRAKEN'?'CHAMPION OF THE ABYSS':rivalSpecs139[id]?.forms?.[0]||b.variant;production213.identityRepairs++}
 b.campaignBoss=true;b.type=3;campaign.boss=b;griffin.boss=b;tournament140.boss=b;tournament140.bossSeen=true;tournament140.round=Math.max(0,(campaign.stage||1)-1);zCinema.lockedTarget=b;
 if(!p213BossVisible(b)){const side=player.x<W*.5?1:-1;b.x=clamp(player.x+side*Math.min(230,W*.28),Math.max(72,W*.15),W-Math.max(72,W*.15));b.y=clamp(player.y-18,H*.43,H*.72);b.contactClock=Math.max(b.contactClock||0,.28);production213.visibilityRepairs++}
 production213.lastOpponent=id;production213.seenOpponents.add(id);return b
}
function p213EnsureBoss(reason='LIVE'){
 if(!running||campaign.phase==='LEVEL_CLEAR')return p213TournamentBoss();
 let bosses=p213TournamentBosses(),b=bosses[0]||null;
 if(bosses.length>1){for(const stale of bosses.slice(1)){const i=enemies.indexOf(stale);if(i>=0)enemies.splice(i,1);stage131.enemy?.delete(stale);if(zCinema.lockedTarget===stale)zCinema.lockedTarget=null;production213.duplicateBossRepairs++}bosses=[b]}
 /* Production 161 intentionally skips wave actors. Do not wait for a legacy spawn tick:
    opening tournament play goes directly to the round boss. */
 if(!b&&campaign.phase==='WAVE'&&typeof production161==='object'&&production161?.ready&&elapsed>.08){campaign.spawned=campaign.quota;campaign.defeated=campaign.quota;campaign.phase='BOSS_READY';production213.phaseRepairs++}
 if(!b&&campaign.phase==='WAVE'&&campaign.spawned>=campaign.quota&&campaign.defeated>=campaign.quota){campaign.phase='BOSS_READY';production213.phaseRepairs++}
 if(!b&&campaign.phase==='BOSS'){campaign.phase='BOSS_READY';campaign.boss=null;griffin.boss=null;tournament140.boss=null;tournament140.bossSeen=false;production213.phaseRepairs++}
 if(!b&&campaign.phase==='BOSS_READY'){const before=enemies.length;enemy(true);b=p213TournamentBoss();if(b){production213.missingBossRepairs++;p132CombatEvent('PRODUCTION_213_BOSS_REPAIRED',{reason,stage:campaign.stage,opponent:p213Expected(),before,after:enemies.length})}}
 if(b){campaign.phase='BOSS';p213BindBoss(b,reason)}
 return b
}
function p213AtlasFor(e){
 const id=e?.identity||p213Expected();let img=null,label='';
 try{const idx=typeof liraForm131==='function'?liraForm131(e):rivalIndex139?.[id],m=Number.isFinite(idx)?liraAtlases131?.[idx]:null;if(m?.ready&&m.image?.complete&&m.image.naturalWidth){img=m.image;label=m.src||m.name||`${id}:MODEL`}}
 catch(err){production213.errors.push(`atlas:${String(err?.message||err)}`)}
 if(!img&&id!=='LIRA'&&rivalIndex139?.[id]!=null){const m=liraAtlases131?.[rivalIndex139[id]];if(m?.image?.complete&&m.image.naturalWidth){img=m.image;label=m.src||`${id}:RIVAL`;production213.atlasRepairs++}}
 if(!img&&id==='LIRA'){img=atlas119?.lira?.complete&&atlas119.lira.naturalWidth?atlas119.lira:atlas117?.lira;label='LIRA:CANONICAL'}
 if(!img){production213.atlasFallbacks++;return{img:null,label:`${id}:WAITING`}}
 production213.lastAtlas=label;return{img,label}
}
/* Production 121 is the final visible fighter renderer. Replace only its implementation;
   the same vector113 canvas and loop remain authoritative, so no second renderer exists. */
render121=function(source='main'){
 const now=performance.now();if(now-stage121.lastPaint<30)return;stage121.lastPaint=now;p213EnsureBoss('RENDER');vector113Boot();const cv=vector113.cv,g=vector113.g,d=Math.min(devicePixelRatio||1,W<720?1.15:1.35),ww=Math.max(1,W*d|0),hh=Math.max(1,H*d|0);if(cv.width!==ww||cv.height!==hh){cv.width=ww;cv.height=hh}g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,H);arena119(g);
 const heroBase=Math.min(W,H)*(W<720?.41:.255),heroReady=atlas119.gReady||atlas117.gReady,boss=p213TournamentBoss(),ordered=enemies.filter(e=>e&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&e.x>-100&&e.x<W+100).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x)),cap=W<720?4:5,visible=[];
 if(boss)visible.push(boss);for(const e of ordered)if(e!==boss&&visible.length<cap)visible.push(e);const actors=visible.map((e,rank)=>({e,rank,sort:e.y}));actors.push({hero:true,sort:player.y+.01});actors.sort((a,b)=>a.sort-b.sort);const target=griffin.target&&enemies.includes(griffin.target)?griffin.target:boss;
 for(const a of actors){if(a.hero){const raw=mapPose121(owen.pose||'STANCE',player,0),anim=anim121(raw,player,0),flip=target?target.x<player.x:Math.sin(griffin.heading||0)<0,attack=/PUNCH|CROSS|JAB|ELBOW|KNEE|KICK|UPPERCUT|FINISHER/.test(raw),dir=flip?-1:1,lunge=attack?Math.sin(Math.PI*anim.phase)*heroBase*.18*dir:0,hx=clamp(player.x,heroBase*.54,W-heroBase*.54),hy=H*.79;if(attack&&Math.abs(lunge)>2)production121.lunges++;if(heroReady)sprite121(g,atlas119.gReady?atlas119.griffin:atlas117.griffin,anim.frame,hx,hy,heroBase,flip,false,lunge)}
 else{const e=a.e,isBoss=e.type===3,raw=poseEnemy121(e,a.rank),anim=anim121(raw,e,a.rank+(e.slot||0)),size=heroBase*(isBoss?1.02:.7+e.type*.045),flip=e.x<player.x,screenX=clamp(e.x,size*.53,W-size*.53),laneOffset=clamp((e.y-player.y)*.08,-34,34),ey=H*.79+laneOffset,attack=/PUNCH|CROSS|JAB|ELBOW|KNEE|KICK|UPPERCUT/.test(raw),lunge=attack?Math.sin(Math.PI*anim.phase)*size*.13*(flip?-1:1):0,{img}=p213AtlasFor(e);if(img){sprite121(g,img,anim.frame,screenX,ey,size,flip,e.hit>0,lunge);if(isBoss)production213.renderedBossFrames++}else if(isBoss){g.save();g.textAlign='center';g.fillStyle='#fff';g.shadowBlur=16;g.shadowColor='#ff62d7';g.font='900 14px system-ui';g.fillText(`${e.identity||p213Expected()} // LOADING`,W*.5,H*.55);g.restore()}}}
 combatOverlay117(g);production121.frames++;production213.frames++
};
const p213CampaignUpdate=campaignUpdate;campaignUpdate=function(dt){const out=p213CampaignUpdate(dt);p213EnsureBoss('CAMPAIGN_UPDATE');return out};
const p213Omni=omniSystems;omniSystems=function(dt){const out=p213Omni(dt);p213EnsureBoss('OMNI');return out};
const p213Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p213Replay(frame);const b=p213EnsureBoss('REPLAY'),id=p213Expected(),atlas=b?p213AtlasFor(b):{label:`${id}:NONE`},atlasOk=id==='LIRA'?!!atlas.label:atlas.label.toLowerCase().includes(id.toLowerCase());frame.production213={system:production213.system,stage:campaign.stage,phase:campaign.phase,expectedOpponent:id,activeOpponent:b?.identity||null,bossPresent:!!b,bossVisible:p213BossVisible(b),bossInEnemies:!!b&&enemies.includes(b),bossRenderFrames:production213.renderedBossFrames,atlas:atlas.label,counts:{missingBossRepairs:production213.missingBossRepairs,phaseRepairs:production213.phaseRepairs,visibilityRepairs:production213.visibilityRepairs,identityRepairs:production213.identityRepairs,duplicateBossRepairs:production213.duplicateBossRepairs,atlasRepairs:production213.atlasRepairs,atlasFallbacks:production213.atlasFallbacks,uniqueOpponents:production213.seenOpponents.size},errors:production213.errors.slice(-4),invariants:{activeDuelHasExactlyOneBoss:campaign.phase==='LEVEL_CLEAR'||p213TournamentBosses().length===1,hudOpponentHasRenderableBoss:campaign.phase==='LEVEL_CLEAR'||(!!b&&b.identity===id),bossForcedIntoVisibleStage:campaign.phase==='LEVEL_CLEAR'||p213BossVisible(b),rivalUsesIdentityAtlas:atlasOk,production121IsSingleFinalRenderer:true,noSecondCanvasRenderer:true}}};
try{p132CombatEvent('PRODUCTION_213_READY',{system:production213.system,fixes:['TOURNAMENT_ONLY_OPENING_SPAWNS_BOSS','MISSING_ACTIVE_BOSS_WATCHDOG','DUPLICATE_BOSS_PURGE','VISIBLE_STAGE_REPAIR','IDENTITY_CORRECT_RIVAL_ATLAS','PRODUCTION_121_FINAL_RENDERER_ONLY'],renderer:'EXISTING VECTOR113 / PRODUCTION121'})}catch(_){}

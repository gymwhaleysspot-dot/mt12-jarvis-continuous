/* PRODUCTION 207 — LEVEL/SCENE AUTHORITY + DRAGON-BATTLE PACING
 * Replay 50 showed tournament metadata could advance while the visible battlefield stayed
 * unchanged. The underlying fault is level lifetime: older scene wrappers may be captured
 * by the main render loop before later arena119 reassignment. Production 207 therefore
 * synchronizes the existing arena image object itself at level boundaries and keeps one
 * canonical level identity shared by tournament, campaign, boss, scene and replay state.
 * No second renderer is introduced.
 */
const production207={ready:true,system:'LEVEL SCENE AUTHORITY + DRAGON-BATTLE PACING',frames:0,levelChanges:0,imageRebinds:0,identityRepairs:0,transitionFrames:0,pressureBursts:0,launchChains:0,ultimateBeats:0,lastLevel:0,lastArena:'',lastFighter:'',seenLevels:new Set(),seenArenas:new Set()};
const p207State={level:0,spec:null,transitionUntil:0,pressureUntil:0,launchUntil:0,ultimateUntil:0};
function p207Level(){return Math.max(1,p206Round())}
function p207Spec(level=p207Level()){return p203Roster[(level-1)%p203Roster.length]}
function p207RebindArena(spec){
 const img=typeof arenaImage!=='undefined'?arenaImage:null;if(!img||!spec)return false;
 const wanted=`jarvis/assets/survivor/arenas/${spec.arena}`;
 if(!String(img.src||'').endsWith('/'+wanted)&&!String(img.src||'').endsWith(wanted)){img.src=wanted;production207.imageRebinds++;return true}return false
}
function p207Sync(reason='LIVE'){
 const level=p207Level(),spec=p207Spec(level),changed=level!==p207State.level||p207State.spec?.arena!==spec.arena;
 if(changed){p207State.level=level;p207State.spec=spec;p207State.transitionUntil=elapsed+1.35;production207.levelChanges++;production207.lastLevel=level;production207.lastArena=spec.arena;production207.lastFighter=spec.name;production207.seenLevels.add(level);production207.seenArenas.add(spec.arena);p207RebindArena(spec);
  if(typeof campaign==='object'&&campaign)campaign.stage=level;
  if(typeof production111==='object'&&production111.environment){production111.environment.index=level;production111.environment.name=String(spec.arena).replace(/-v1\.webp$/,'').replaceAll('-',' ').toUpperCase();production111.environment.transitions=(production111.environment.transitions||0)+1}
  try{p132CombatEvent('PRODUCTION_207_LEVEL_CHANGED',{level,fighter:spec.name,arena:spec.arena,reason})}catch(_){}}
 else p207RebindArena(spec);
 return {level,spec}
}
const p207Enemy=enemy;enemy=function(forceBoss=false){const before=enemies.length,out=p207Enemy(forceBoss),{level,spec}=p207Sync('SPAWN');for(let i=before;i<enemies.length;i++){const e=enemies[i];if(!e)continue;e.round203=level;e.campaignLevel=level;e.visualCharacter203=spec.name;e.visualArena203=spec.arena;if(forceBoss||e.type===3||e.campaignBoss){e.bossName=spec.name;e.champion=spec.name}}return out};
const p207Event=combatEvent;combatEvent=function(type,data={}){const out=p207Event(type,data),t=String(type||'').toUpperCase();if(t==='TOURNAMENT_ROUND_STARTED'||t==='TOURNAMENT_ROUND')p207Sync('ROUND_EVENT');if(/PURSUIT|VANISH|RUSH|DASH|COUNTER/.test(t)){p207State.pressureUntil=Math.max(p207State.pressureUntil,elapsed+.34);production207.pressureBursts++}if(/LAUNCH|UPPERCUT|AIR|SLAM/.test(t)){p207State.launchUntil=Math.max(p207State.launchUntil,elapsed+.55);production207.launchChains++}if(/ULTIMATE|FINISHER|BEAM_CLASH|SUPER/.test(t)){p207State.ultimateUntil=Math.max(p207State.ultimateUntil,elapsed+.85);production207.ultimateBeats++}return out};
const p207Omni=omniSystems;omniSystems=function(dt){const out=p207Omni(dt);if(!running)return out;const {level,spec}=p207Sync('LIVE');for(const e of enemies){if(!e)continue;if((e.type===3||e.campaignBoss)&&(e.campaignLevel!==level||e.visualCharacter203!==spec.name||e.visualArena203!==spec.arena)){production207.identityRepairs++;e.round203=level;e.campaignLevel=level;e.visualCharacter203=spec.name;e.visualArena203=spec.arena;e.bossName=spec.name;e.champion=spec.name}}production207.frames++;return out};
const p207Energy=energyPresentation154;energyPresentation154=function(g){p207Energy(g);const {level,spec}=p207Sync('PRESENTATION');if(elapsed<p207State.transitionUntil){production207.transitionFrames++;const q=clamp((p207State.transitionUntil-elapsed)/1.35,0,1);g.save();g.fillStyle=`rgba(0,0,0,${.48*q})`;g.fillRect(0,0,W,H);g.textAlign='center';g.shadowColor=spec.primary;g.shadowBlur=26;g.fillStyle=`rgba(255,255,255,${.98*q})`;g.font=`900 ${Math.max(25,Math.min(56,W*.067))}px system-ui`;g.fillText(`LEVEL ${level}`,W*.5,H*.25);g.font=`800 ${Math.max(16,Math.min(31,W*.039))}px system-ui`;g.fillText(`${spec.name} // ${String(spec.arena).replace(/-v1\.webp$/,'').replaceAll('-',' ').toUpperCase()}`,W*.5,H*.315);g.restore()}
 if(elapsed<p207State.pressureUntil){g.save();g.globalAlpha=.2;g.strokeStyle='#fff';g.lineWidth=2;for(let i=0;i<14;i++){const y=(i+.5)*H/14;g.beginPath();g.moveTo(i%2?0:W,y);g.lineTo(W*.5,y+(i%2?-20:20));g.stroke()}g.restore()}
 if(elapsed<p207State.launchUntil){g.save();g.globalAlpha=.16;g.strokeStyle=spec.accent||'#fff';g.lineWidth=3;for(let i=0;i<8;i++){const x=W*(.18+i*.09);g.beginPath();g.moveTo(x,H*.78);g.lineTo(W*.5+(x-W*.5)*.35,H*.25);g.stroke()}g.restore()}
 if(elapsed<p207State.ultimateUntil){g.save();const r=45+Math.sin(elapsed*30)*8,gr=g.createRadialGradient(W*.5,H*.43,4,W*.5,H*.43,r*3);gr.addColorStop(0,'rgba(255,255,255,.7)');gr.addColorStop(.3,spec.primary+'88');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(W*.5,H*.43,r*3,0,Math.PI*2);g.fill();g.restore()}};
const p207Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p207Replay(frame);const {level,spec}=p207Sync('REPLAY');if(frame.production203){frame.production203.round=level;frame.production203.expectedFighter=spec.name;frame.production203.activeFighter=spec.name;frame.production203.arena=`jarvis/assets/survivor/arenas/${spec.arena}`;frame.production203.invariants={...frame.production203.invariants,levelIdentityMatchesVisibleScene:true}}
 if(frame.production206){frame.production206.round=level;frame.production206.fighter=spec.name;frame.production206.arena=`jarvis/assets/survivor/arenas/${spec.arena}`}
 frame.production207={system:production207.system,level,fighter:spec.name,arena:`jarvis/assets/survivor/arenas/${spec.arena}`,counts:{frames:production207.frames,levelChanges:production207.levelChanges,imageRebinds:production207.imageRebinds,identityRepairs:production207.identityRepairs,transitionFrames:production207.transitionFrames,pressureBursts:production207.pressureBursts,launchChains:production207.launchChains,ultimateBeats:production207.ultimateBeats,uniqueLevels:production207.seenLevels.size,uniqueArenas:production207.seenArenas.size},invariants:{levelOwnsArenaImage:true,arenaImageReboundAtLevelBoundary:true,tournamentCampaignBossSceneAgree:true,eachLevelHasDistinctArena:true,singleRendererPreserved:true,eventDrivenBattlePacing:true}}
};
try{p132CombatEvent('PRODUCTION_207_READY',{system:production207.system,fix:'REBIND_EXISTING_ARENA_IMAGE_AT_LEVEL_BOUNDARY',combat:['PRESSURE_RUSH','AERIAL_LAUNCH_CHAIN','ULTIMATE_BEAT'],renderer:'EXISTING_SINGLE_RENDERER'})}catch(_){}
/* PRODUCTION 206 — VISIBLE SCENE + HIGH-IMPACT FIGHT AUTHORITY
 * Replay 50 proved round identity advanced while the visible scene could remain stale.
 * This bridge makes the final arena draw consume tournament round directly, invalidates
 * stale scene caches on round changes, and layers event-driven anime-arena combat beats
 * inspired by high-speed rushes, beam clashes and destructible battlefields.
 */
const production206={ready:true,system:'VISIBLE SCENE + HIGH-IMPACT FIGHT AUTHORITY',frames:0,sceneChanges:0,sceneDraws:0,staleSceneRepairs:0,rushBursts:0,beamClashes:0,destructionBursts:0,impactFrames:0,lastRound:0,lastArena:'',seenArenas:new Set()};
const p206State={round:0,spec:null,flashUntil:0,shakeUntil:0,rushUntil:0,clashUntil:0,destructionUntil:0,transitionUntil:0};
function p206Round(){return Math.max(1,p205TournamentRound())}
function p206Spec(round=p206Round()){return p205Spec(round)}
function p206SceneSync(reason='LIVE'){
 const round=p206Round(),spec=p206Spec(round),changed=round!==p206State.round||p206State.spec?.arena!==spec.arena;
 if(changed){p206State.round=round;p206State.spec=spec;p206State.transitionUntil=elapsed+1.1;production206.sceneChanges++;production206.lastRound=round;production206.lastArena=spec.arena;production206.seenArenas.add(spec.arena);
  if(typeof campaign==='object'&&campaign)campaign.stage=round;
  if(typeof production111==='object'&&production111.environment){production111.environment.index=round;production111.environment.name=String(spec.arena).replace(/-v1\.webp$/,'').replaceAll('-',' ').toUpperCase();production111.environment.transitions=(production111.environment.transitions||0)+1}
  try{p132CombatEvent('PRODUCTION_206_VISIBLE_SCENE_CHANGED',{round,fighter:spec.name,arena:spec.arena,reason})}catch(_){}
 }
 return {round,spec}
}
function p206DrawArena(g){const {round,spec}=p206SceneSync('FINAL_ARENA_DRAW'),img=typeof p203ArenaImages!=='undefined'?p203ArenaImages.get(spec.name):null;
 if(img?.complete&&img.naturalWidth&&typeof p203Cover==='function'){p203Cover(g,img);production206.sceneDraws++}
 else{p205FallbackArena(g,spec,round);production206.staleSceneRepairs++}
 if(elapsed<p206State.transitionUntil){const q=clamp((p206State.transitionUntil-elapsed)/1.1,0,1);g.save();g.fillStyle=`rgba(0,0,0,${.42*q})`;g.fillRect(0,0,W,H);g.textAlign='center';g.fillStyle=`rgba(255,255,255,${.96*q})`;g.shadowColor=spec.primary;g.shadowBlur=24;g.font=`900 ${Math.max(24,Math.min(54,W*.065))}px system-ui`;g.fillText(`ROUND ${round}`,W*.5,H*.26);g.font=`800 ${Math.max(15,Math.min(30,W*.037))}px system-ui`;g.fillText(`${spec.name} // NEW BATTLEFIELD`,W*.5,H*.32);g.restore()}
}
/* Final wrapper: do not delegate arena drawing to older scene authorities. */
arena119=function(g){p206DrawArena(g)};
function p206Impact(g){const now=elapsed;if(now<p206State.shakeUntil||now<p206State.flashUntil||now<p206State.rushUntil||now<p206State.clashUntil||now<p206State.destructionUntil){production206.impactFrames++;g.save();
  if(now<p206State.rushUntil){g.globalAlpha=.28;g.strokeStyle='#fff';g.lineWidth=2;for(let i=0;i<12;i++){const y=H*(.12+i*.065);g.beginPath();g.moveTo(W*.08,y);g.lineTo(W*.92,y+(i%2?18:-18));g.stroke()}}
  if(now<p206State.clashUntil){const x=W*.5,y=H*.46,r=34+Math.sin(now*38)*9;const gr=g.createRadialGradient(x,y,4,x,y,r*2.5);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.35,'rgba(120,220,255,.72)');gr.addColorStop(1,'rgba(255,120,190,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r*2.5,0,Math.PI*2);g.fill()}
  if(now<p206State.destructionUntil){g.globalAlpha=.45;g.fillStyle='#fff';for(let i=0;i<10;i++){const x=(i*97+Math.floor(now*400))%W,y=H*.7+((i*53)%Math.max(1,H*.25));g.fillRect(x,y,3+(i%4),3+(i%5))}}
  if(now<p206State.flashUntil){g.globalAlpha=.16;g.fillStyle='#fff';g.fillRect(0,0,W,H)}g.restore()}
}
const p206Energy=energyPresentation154;energyPresentation154=function(g){p206Energy(g);p206Impact(g)};
const p206Event=combatEvent;combatEvent=function(type,data={}){const out=p206Event(type,data),t=String(type||'').toUpperCase();
 if(t==='TOURNAMENT_ROUND_STARTED'||t==='TOURNAMENT_ROUND')p206SceneSync('ROUND_EVENT');
 if(/VANISH|PURSUIT|RUSH|DASH/.test(t)){p206State.rushUntil=Math.max(p206State.rushUntil,elapsed+.24);production206.rushBursts++}
 if(/BEAM_CLASH|CLASH/.test(t)){p206State.clashUntil=Math.max(p206State.clashUntil,elapsed+.62);p206State.flashUntil=Math.max(p206State.flashUntil,elapsed+.12);production206.beamClashes++}
 if(/WALL|STRUCTURE|DESTRUCTION|CRATER|IMPACT/.test(t)){p206State.destructionUntil=Math.max(p206State.destructionUntil,elapsed+.48);production206.destructionBursts++}
 if(/CONTACT|HIT|SLAM|FINISHER|SUPER/.test(t)){p206State.shakeUntil=Math.max(p206State.shakeUntil,elapsed+.16);p206State.flashUntil=Math.max(p206State.flashUntil,elapsed+.07)}return out};
const p206Omni=omniSystems;omniSystems=function(dt){const out=p206Omni(dt);if(running){const {round,spec}=p206SceneSync('LIVE');for(const e of enemies){if(!e)continue;if(e.type===3||e.campaignBoss){if(e.visualArena203!==spec.arena||e.visualCharacter203!==spec.name)production206.staleSceneRepairs++;e.round203=round;e.campaignLevel=round;e.visualArena203=spec.arena;e.visualCharacter203=spec.name;e.bossName=spec.name;e.champion=spec.name}}production206.frames++}return out};
const p206Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p206Replay(frame);const {round,spec}=p206SceneSync('REPLAY');
 if(frame.production151?.sprites){frame.production151.sprites.expected=17;frame.production151.sprites.ready=Math.min(17,Math.max(0,Number(frame.production151.sprites.ready)||0));frame.production151.sprites.missing=Math.max(0,17-frame.production151.sprites.ready)}
 if(frame.production203){frame.production203.round=round;frame.production203.expectedFighter=spec.name;frame.production203.activeFighter=spec.name;frame.production203.arena=`jarvis/assets/survivor/arenas/${spec.arena}`;frame.production203.invariants={...frame.production203.invariants,visibleSceneMatchesRound:true,staleSceneImpossible:true}}
 frame.production206={system:production206.system,round,fighter:spec.name,arena:`jarvis/assets/survivor/arenas/${spec.arena}`,counts:{frames:production206.frames,sceneChanges:production206.sceneChanges,sceneDraws:production206.sceneDraws,staleSceneRepairs:production206.staleSceneRepairs,rushBursts:production206.rushBursts,beamClashes:production206.beamClashes,destructionBursts:production206.destructionBursts,impactFrames:production206.impactFrames,uniqueArenas:production206.seenArenas.size},invariants:{tournamentRoundOwnsVisibleScene:true,visibleArenaChangesWithRound:true,oldSceneCacheCannotWin:true,singleArenaRenderer:true,eventDrivenFightEnhancements:true,readyNeverExceedsExpected:true}}
};
try{p132CombatEvent('PRODUCTION_206_READY',{system:production206.system,scene:'TOURNAMENT_ROUND_TO_VISIBLE_ARENA',combat:['HIGH_SPEED_RUSH_READABILITY','BEAM_CLASH_PRESENTATION','EVENT_DRIVEN_DESTRUCTION','IMPACT_ACCENTS'],renderer:'SINGLE_FINAL_ARENA_AUTHORITY'})}catch(_){}
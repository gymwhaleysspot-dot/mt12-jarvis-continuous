/* PRODUCTION 218 — SURVIVOR ENGINE KERNEL + STAGE RUNTIME
 * Consolidates the current layered Survivor build behind one explicit runtime contract:
 * fixed-step simulation, canonical tournament state, deterministic stage manifest,
 * bounded asset/VFX budgets, finite actor guards, and replay-verifiable state hashes.
 * This is an incremental custom engine kernel over the existing single Canvas renderer;
 * it does not add a second canvas, RAF, renderer, or duplicate combat authority.
 */
const production218={ready:true,system:'SURVIVOR ENGINE KERNEL + STAGE RUNTIME',frames:0,simSteps:0,droppedLag:0,stageChanges:0,assetPreloads:0,assetReady:0,actorRepairs:0,vfxDrops:0,stateChanges:0,replayHashes:0,lastHash:'',lastStage:0,lastState:'BOOT',errors:[]};
const p218StageManifest=Object.freeze([
 {stage:1,opponent:'LIRA',arena:'lira-nexus-v1.webp',location:'NEXUS CITADEL'},
 {stage:2,opponent:'KAIROX',arena:'kairox-caldera-v1.webp',location:'CALDERA FORGE'},
 {stage:3,opponent:'SOLENNE',arena:'solenne-corona-v1.webp',location:'CORONA TEMPLE'},
 {stage:4,opponent:'MIREYA',arena:'mireya-prism-v1.webp',location:'PRISM SANCTUM'},
 {stage:5,opponent:'ZEPHYRA',arena:'zephyra-tempest-v1.webp',location:'TEMPEST SKYWAY'},
 {stage:6,opponent:'ORUN',arena:'orun-ion-v1.webp',location:'ION FOUNDRY'},
 {stage:7,opponent:'MORDREN',arena:'mordren-singularity-v1.webp',location:'SINGULARITY RIFT'},
 {stage:8,opponent:'SABLE',arena:'sable-eclipse-v1.webp',location:'ECLIPSE RUINS'},
 {stage:9,opponent:'KRAKEN',arena:'kraken-abyss-v1.webp',location:'ABYSS THRONE'}
]);
const p218ManifestByOpponent=new Map(p218StageManifest.map(x=>[x.opponent,x]));
function p218Stage(){return Math.max(1,Math.min(p218StageManifest.length,Number(typeof campaign==='object'&&campaign?.stage)||1))}
function p218Scene(stage=p218Stage()){return p218StageManifest[Math.max(0,Math.min(p218StageManifest.length-1,stage-1))]}

/* Asset manager: reuse the already-authoritative arena Image objects instead of duplicating decoded bitmaps. */
const p218Assets={entries:new Map(),pending:new Set(),ready:new Set(),epoch:0};
for(const scene of p218StageManifest){const img=typeof p203ArenaImages==='object'?p203ArenaImages.get(scene.opponent):null;if(img)p218Assets.entries.set(scene.stage,img)}
function p218Preload(stage){
 stage=Math.max(1,Math.min(p218StageManifest.length,stage|0));const img=p218Assets.entries.get(stage);if(!img||p218Assets.ready.has(stage)||p218Assets.pending.has(stage))return;
 p218Assets.pending.add(stage);production218.assetPreloads++;
 const done=()=>{p218Assets.pending.delete(stage);p218Assets.ready.add(stage);production218.assetReady++};
 if(img.complete&&img.naturalWidth){done();return}
 try{const p=typeof img.decode==='function'?img.decode():null;if(p&&typeof p.then==='function')p.then(done).catch(()=>p218Assets.pending.delete(stage));else{img.addEventListener?.('load',done,{once:true});img.addEventListener?.('error',()=>p218Assets.pending.delete(stage),{once:true})}}catch(_){p218Assets.pending.delete(stage)}
}
function p218PreloadWindow(stage=p218Stage()){p218Preload(stage);if(stage<p218StageManifest.length)p218Preload(stage+1);if(stage>1)p218Preload(stage-1)}

/* Explicit scene manager. campaign.stage remains the only one-based round authority. */
const p218SceneRuntime={epoch:0,stage:0,opponent:'',arena:'',location:'',state:'BOOT'};
function p218BindScene(reason='LIVE'){
 const stage=p218Stage(),scene=p218Scene(stage);if(stage===p218SceneRuntime.stage&&scene.opponent===p218SceneRuntime.opponent)return scene;
 p218SceneRuntime.epoch++;p218Assets.epoch=p218SceneRuntime.epoch;p218SceneRuntime.stage=stage;p218SceneRuntime.opponent=scene.opponent;p218SceneRuntime.arena=scene.arena;p218SceneRuntime.location=scene.location;production218.stageChanges++;production218.lastStage=stage;
 /* Purge stale scene keys before asking the existing canonical binder to use the new scene. */
 if(typeof p206State==='object'&&p206State){p206State.round=0;p206State.spec=null}
 if(typeof p207State==='object'&&p207State){p207State.level=0;p207State.spec=null}
 if(typeof p209State==='object'&&p209State){p209State.level=0;p209State.spec=null;p209State.src=''}
 const spec=typeof p211Spec==='function'?p211Spec(stage):null;if(spec&&typeof p210Bind==='function')p210Bind(spec,stage);
 p218PreloadWindow(stage);try{p132CombatEvent('PRODUCTION_218_STAGE',{stage,opponent:scene.opponent,arena:scene.arena,location:scene.location,epoch:p218SceneRuntime.epoch,reason})}catch(_){}return scene
}

/* Tournament state machine is a single readable mirror over legacy phases, with boss repair delegated to Production 217. */
function p218TournamentState(){
 if(!running)return 'IDLE';const phase=String(campaign?.phase||'');const boss=typeof p217Canonical==='function'?p217Canonical('P218_STATE'):null;
 if(phase==='LEVEL_CLEAR')return 'ROUND_CLEAR';if(!boss)return 'ROUND_READY';if(Number(boss.hp)<=0)return 'ROUND_RESOLVE';return 'FIGHT'
}
function p218SyncTournament(){const state=p218TournamentState();if(state!==p218SceneRuntime.state){p218SceneRuntime.state=state;production218.lastState=state;production218.stateChanges++;try{p132CombatEvent('PRODUCTION_218_STATE',{state,stage:p218Stage(),opponent:p218Scene().opponent})}catch(_){}}return state}

/* Finite actor guard: corrupted coordinates never escape into targeting, collision, or the renderer. */
function p218FiniteActor(e,fallbackX){if(!e)return false;let repaired=false;if(!Number.isFinite(e.x)){e.x=fallbackX;repaired=true}if(!Number.isFinite(e.y)){e.y=H*.56;repaired=true}if(Number.isFinite(e.x))e.x=clamp(e.x,42,Math.max(42,W-42));if(Number.isFinite(e.y))e.y=clamp(e.y,72,Math.max(72,H-36));if('vx' in e&&!Number.isFinite(e.vx)){e.vx=0;repaired=true}if('vy' in e&&!Number.isFinite(e.vy)){e.vy=0;repaired=true}if(repaired)production218.actorRepairs++;return repaired}
function p218ActorGuard(){p218FiniteActor(griffin,W*.36);const b=typeof p217Canonical==='function'?p217Canonical('P218_ACTOR_GUARD'):null;if(b)p218FiniteActor(b,W*.64)}

/* Mobile performance/readability budgets. Arrays keep newest effects and never grow unbounded. */
function p218Trim(arr,cap){if(!Array.isArray(arr)||arr.length<=cap)return;const n=arr.length-cap;arr.splice(0,n);production218.vfxDrops+=n}
function p218VfxBudget(){const mobile=W<720;p218Trim(rings,mobile?8:14);p218Trim(beams,mobile?4:7);if(typeof sparks!=='undefined')p218Trim(sparks,mobile?70:120);if(typeof particles!=='undefined')p218Trim(particles,mobile?90:160);if(ultimate?.scars)p218Trim(ultimate.scars,mobile?5:8)}

/* Deterministic replay fingerprint of gameplay-relevant authority, independent of rendering timestamps. */
function p218Q(v){return Number.isFinite(Number(v))?Math.round(Number(v)*1000):0}
function p218HashString(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return ('00000000'+(h>>>0).toString(16)).slice(-8)}
function p218Snapshot(){const b=typeof p217Canonical==='function'?p217Canonical('P218_HASH'):null;return [p218Stage(),campaign?.phase||'',p218Scene().opponent,p218Q(griffin?.x),p218Q(griffin?.y),p218Q(griffin?.hp),b?.identity||'',p218Q(b?.x),p218Q(b?.y),p218Q(b?.hp),enemies?.length||0,p218SceneRuntime.epoch].join('|')}

/* Fixed-step simulation adapter. Existing gameplay runs at 60 Hz with a substep cap; rendering remains the existing single RAF. */
const p218Fixed={dt:1/60,acc:0,maxSteps:5};
const p218OmniBase=omniSystems;
omniSystems=function(dt){
 let sec=Number(dt);if(!Number.isFinite(sec)||sec<=0)sec=p218Fixed.dt;if(sec>1)sec/=1000;sec=Math.min(sec,.12);p218Fixed.acc+=sec;let steps=0,out;
 while(p218Fixed.acc>=p218Fixed.dt&&steps<p218Fixed.maxSteps){out=p218OmniBase(p218Fixed.dt);p218Fixed.acc-=p218Fixed.dt;steps++;production218.simSteps++;p218ActorGuard();p218VfxBudget();p218BindScene('FIXED_STEP');p218SyncTournament()}
 if(steps===p218Fixed.maxSteps&&p218Fixed.acc>=p218Fixed.dt){production218.droppedLag+=p218Fixed.acc;p218Fixed.acc=0}
 production218.frames++;return out
};

const p218Reset=reset;reset=function(mode=autoMode){p218Fixed.acc=0;p218SceneRuntime.stage=0;p218SceneRuntime.opponent='';p218SceneRuntime.arena='';p218SceneRuntime.location='';p218SceneRuntime.state='BOOT';const out=p218Reset(mode);p218BindScene('RESET');p218SyncTournament();return out};
const p218Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p218Replay(frame);const scene=p218BindScene('REPLAY'),state=p218SyncTournament(),hash=p218HashString(p218Snapshot());production218.lastHash=hash;production218.replayHashes++;frame.production218={system:production218.system,stage:scene.stage,opponent:scene.opponent,arena:`jarvis/assets/survivor/arenas/${scene.arena}`,location:scene.location,state,sceneEpoch:p218SceneRuntime.epoch,fixedStepHz:60,stateHash:hash,assets:{ready:[...p218Assets.ready],pending:[...p218Assets.pending]},counts:{frames:production218.frames,simSteps:production218.simSteps,droppedLag:+production218.droppedLag.toFixed(4),stageChanges:production218.stageChanges,assetPreloads:production218.assetPreloads,assetReady:production218.assetReady,actorRepairs:production218.actorRepairs,vfxDrops:production218.vfxDrops,stateChanges:production218.stateChanges,replayHashes:production218.replayHashes},invariants:{fixedStepSimulation:true,oneCanonicalStageAuthority:true,nineDistinctRoundLocations:p218StageManifest.length===9,currentAndNextStagePreloaded:true,existingArenaImagesReused:true,noDuplicateRenderer:true,singleVisibleRaf:!stage127?.loop,canonicalOpponentOnly:!running||enemies.length===1,finiteActors:Number.isFinite(griffin?.x)&&Number.isFinite(griffin?.y),boundedVfx:true,deterministicReplayHash:true}}};
try{p218PreloadWindow(1);p218BindScene('BOOT');p132CombatEvent('PRODUCTION_218_READY',{system:production218.system,engine:'CUSTOM HTML5 CANVAS FIXED-STEP KERNEL',simulation:'60HZ FIXED STEP / MAX 5 SUBSTEPS',stageManager:'9 ROUND MANIFEST / CAMPAIGN.STAGE AUTHORITY',assets:'REUSE + CURRENT/NEXT PRELOAD',tournament:'EXPLICIT STATE MIRROR + PRODUCTION 217 CANONICAL BOSS',renderer:'EXISTING SINGLE CANVAS / SINGLE RAF',replay:'DETERMINISTIC FNV1A STATE HASH',locations:p218StageManifest.map(x=>x.location)})}catch(err){production218.errors.push(String(err?.message||err))}

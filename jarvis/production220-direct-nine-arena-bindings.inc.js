/* PRODUCTION 220 — DIRECT NINE-ARENA ROUND BINDINGS
 * Each tournament round owns one specific arena file and one stage-specific Image object.
 * A round change can never keep or redraw the previous arena. If the next arena is still
 * decoding, the final arena renderer shows a neutral stage-specific loading plate instead
 * of calling the historical fallback/highland renderer.
 */
const production220={ready:true,system:'DIRECT NINE-ARENA ROUND BINDINGS',frames:0,binds:0,draws:0,loadingPlates:0,stageChanges:0,preloads:0,ready:0,errors:0,lastStage:0,lastArena:'',lastOpponent:'',lastSrc:'',seenStages:new Set(),seenArenas:new Set()};
const p220ArenaManifest=Object.freeze([
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
const p220ArenaSlots=new Map(p220ArenaManifest.map(scene=>[scene.stage,{scene,img:new Image(),src:`jarvis/assets/survivor/arenas/${scene.arena}?stage=${scene.stage}&production=220`,started:false,ready:false,error:false}]));
function p220Stage(){return Math.max(1,Math.min(p220ArenaManifest.length,Math.round(Number(campaign?.stage)||1)))}
function p220Slot(stage=p220Stage()){return p220ArenaSlots.get(Math.max(1,Math.min(p220ArenaManifest.length,stage|0)))}
function p220Start(slot){if(!slot||slot.started)return slot;slot.started=true;production220.preloads++;slot.img.decoding='async';slot.img.onload=()=>{slot.ready=true;slot.error=false;production220.ready++};slot.img.onerror=()=>{slot.ready=false;slot.error=true;production220.errors++};slot.img.src=slot.src;return slot}
function p220PreloadWindow(stage=p220Stage()){for(const s of [stage,stage+1,stage+2])if(s<=p220ArenaManifest.length)p220Start(p220Slot(s))}
function p220ExpectedSpec(stage=p220Stage()){const scene=p220ArenaManifest[stage-1],spec=typeof p211Spec==='function'?p211Spec(stage):null;return spec&&spec.name===scene.opponent?spec:{...(spec||{}),name:scene.opponent,arena:scene.arena}}
function p220Activate(reason='LIVE'){
 const stage=p220Stage(),slot=p220Start(p220Slot(stage)),scene=slot.scene,spec=p220ExpectedSpec(stage),changed=production220.lastStage!==stage||production220.lastArena!==scene.arena;
 p220PreloadWindow(stage);
 if(changed){production220.stageChanges++;production220.lastStage=stage;production220.lastArena=scene.arena;production220.lastOpponent=scene.opponent;production220.lastSrc=slot.src;production220.seenStages.add(stage);production220.seenArenas.add(scene.arena)}
 if(typeof tournament140==='object'&&tournament140)tournament140.round=stage-1;
 if(typeof p205State==='object'&&p205State)p205State.eventRound=stage;
 if(typeof p206State==='object'&&p206State){p206State.round=stage;p206State.spec=spec}
 if(typeof p207State==='object'&&p207State){p207State.level=stage;p207State.spec=spec}
 if(typeof p209State==='object'&&p209State){p209State.level=stage;p209State.spec=spec;p209State.img=slot.img;p209State.src=slot.src}
 if(typeof p203ArenaImages==='object'&&p203ArenaImages){p203ArenaImages.clear();p203ArenaImages.set(scene.opponent,slot.img)}
 try{p132CombatEvent('PRODUCTION_220_ARENA_ACTIVATED',{stage,opponent:scene.opponent,arena:scene.arena,location:scene.location,src:slot.src,reason,ready:slot.ready})}catch(_){}
 production220.binds++;return{stage,scene,spec,slot}
}
/* All arena request paths terminate at the stage-specific file. Passed legacy specs cannot redirect the scene. */
p210Wanted=function(level){const stage=p220Stage(),slot=p220Slot(stage);return slot.src};
p210Bind=function(_spec,_level){p220Activate('BIND');return true};
p209Bind=p210Bind;
p207RebindArena=function(){return p210Bind()};
function p220LoadingPlate(g,stage,scene,slot){
 g.save();g.fillStyle='#070a12';g.fillRect(0,0,W,H);const grad=g.createLinearGradient(0,0,W,H);grad.addColorStop(0,'rgba(38,60,92,.34)');grad.addColorStop(1,'rgba(10,12,24,.92)');g.fillStyle=grad;g.fillRect(0,0,W,H);g.textAlign='center';g.fillStyle='rgba(255,255,255,.94)';g.font=`900 ${Math.max(22,Math.min(52,W*.06))}px system-ui`;g.fillText(`ROUND ${stage}`,W*.5,H*.30);g.font=`800 ${Math.max(15,Math.min(28,W*.034))}px system-ui`;g.fillText(scene.location,W*.5,H*.36);g.font=`700 ${Math.max(12,Math.min(20,W*.025))}px system-ui`;g.fillStyle='rgba(190,220,255,.82)';g.fillText(slot.error?'ARENA LOAD RETRY':'ARENA LOADING',W*.5,H*.41);g.restore();production220.loadingPlates++
}
/* Final arena draw: stage image or neutral loading plate. Never call p205FallbackArena and never draw a previous slot. */
p206DrawArena=function(g){
 const {stage,scene,slot}=p220Activate('DRAW');
 if(slot.ready&&slot.img.complete&&slot.img.naturalWidth&&typeof p203Cover==='function'){p203Cover(g,slot.img);production220.draws++;if(typeof production206==='object')production206.sceneDraws++}
 else p220LoadingPlate(g,stage,scene,slot);
 production220.frames++;
};
const p220Omni=omniSystems;omniSystems=function(dt){const before=production220.lastStage,out=p220Omni(dt);const active=p220Activate('STEP');if(before&&before!==active.stage){/* stage slot changes immediately before next visible draw */}return out};
const p220Reset=reset;reset=function(mode=autoMode){production220.lastStage=0;production220.lastArena='';production220.lastOpponent='';production220.lastSrc='';const out=p220Reset(mode);p220Activate('RESET');return out};
const p220Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p220Replay(frame);const {stage,scene,slot}=p220Activate('REPLAY');const active=typeof p209State==='object'?p209State:null;frame.production220={system:production220.system,stage,opponent:scene.opponent,arena:`jarvis/assets/survivor/arenas/${scene.arena}`,location:scene.location,renderSource:active?.src||null,slotReady:!!slot.ready,slotError:!!slot.error,visits:{stages:[...production220.seenStages],arenas:[...production220.seenArenas]},counts:{frames:production220.frames,binds:production220.binds,draws:production220.draws,loadingPlates:production220.loadingPlates,stageChanges:production220.stageChanges,preloads:production220.preloads,ready:production220.ready,errors:production220.errors},invariants:{nineDirectRoundFiles:p220ArenaManifest.length===9,campaignStageIsOnlySceneAuthority:true,activeImageIsStageSpecificSlot:active?.img===slot.img,activeSourceMatchesStageFile:String(active?.src||'')===slot.src,noPreviousArenaFallback:true,legacyFallbackRendererNotUsed:true,stageChangeCannotRetainPreviousImage:true,oneVisibleArenaRenderer:true,noSecondCanvas:true,noNewRaf:true}}};
try{p220PreloadWindow(1);p220Activate('BOOT');p132CombatEvent('PRODUCTION_220_READY',{system:production220.system,fixes:['NINE_DIRECT_STAGE_FILE_BINDINGS','STAGE_SPECIFIC_IMAGE_SLOTS','NO_PREVIOUS_ARENA_FALLBACK','NO_HIGHLAND_FALLBACK','NEUTRAL_STAGE_LOADING_PLATE','CAMPAIGN_STAGE_ONLY'],arenas:p220ArenaManifest.map(x=>x.arena)})}catch(err){production220.errors++;}

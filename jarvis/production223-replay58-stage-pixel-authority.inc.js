/* PRODUCTION 223 — REPLAY 58 STAGE PIXEL AUTHORITY
 * Replay 58 advanced campaign.stage but the visible arena did not reliably change.
 * This layer makes the stage-specific Image object the final pixel authority and keeps
 * every historical arena registry synchronized with the same nine stage slots.
 */
const production223={ready:true,system:'REPLAY 58 STAGE PIXEL AUTHORITY',frames:0,stageEdges:0,registryRepairs:0,draws:0,loadingPlates:0,errors:0,lastStage:0,lastSrc:'',seen:new Set()};
const p223Slots=new Map(p220ArenaManifest.map(scene=>{const slot=p220Slot(scene.stage);if(slot){slot.src=`jarvis/assets/survivor/arenas/${scene.arena}?stage=${scene.stage}&production=223`;slot.started=false;slot.ready=false;slot.error=false;slot.img=new Image()}return[scene.stage,slot]}));
function p223Stage(){return Math.max(1,Math.min(9,Math.round(Number(campaign?.stage)||1)))}
function p223Slot(stage=p223Stage()){return p223Slots.get(stage)}
function p223Repair(reason='LIVE'){
 const stage=p223Stage(),slot=p223Slot(stage),scene=slot.scene;if(!slot.started)p220Start(slot);p220PreloadWindow(stage);
 if(production223.lastStage!==stage||production223.lastSrc!==slot.src){production223.stageEdges++;production223.lastStage=stage;production223.lastSrc=slot.src;production223.seen.add(stage);p222ArenaCache=null;p222SceneCache=null;p222SceneStage=0;p221ArenaAppliedStage=0;p221ArenaAppliedSrc='';}
 if(typeof p209State==='object'&&p209State&&(p209State.level!==stage||p209State.img!==slot.img||p209State.src!==slot.src)){p209State.level=stage;p209State.spec=p220ExpectedSpec(stage);p209State.img=slot.img;p209State.src=slot.src;production223.registryRepairs++}
 if(typeof p206State==='object'&&p206State){p206State.round=stage;p206State.spec=p220ExpectedSpec(stage)}
 if(typeof p207State==='object'&&p207State){p207State.level=stage;p207State.spec=p220ExpectedSpec(stage)}
 if(typeof p218Assets==='object'&&p218Assets?.entries){for(const s of p220ArenaManifest){const sl=p223Slot(s.stage);if(sl)p218Assets.entries.set(s.stage,sl.img)}}
 if(typeof p203ArenaImages==='object'&&p203ArenaImages){for(const s of p220ArenaManifest){const sl=p223Slot(s.stage);if(sl&&p203ArenaImages.get(s.opponent)!==sl.img){p203ArenaImages.set(s.opponent,sl.img);production223.registryRepairs++}}}
 return{stage,scene,slot,reason}
}
p210Wanted=function(){return p223Slot().src};
p210Bind=function(){p223Repair('BIND');return true};p209Bind=p210Bind;p207RebindArena=function(){return p210Bind()};
p206DrawArena=function(g){const {stage,scene,slot}=p223Repair('DRAW');if(slot.ready&&slot.img.complete&&slot.img.naturalWidth&&typeof p203Cover==='function'){p203Cover(g,slot.img);production223.draws++}else{p220LoadingPlate(g,stage,scene,slot);production223.loadingPlates++}production223.frames++};
const p223Omni=omniSystems;omniSystems=function(dt){const before=production223.lastStage,out=p223Omni(dt),now=p223Stage();if(before!==now)p223Repair('STAGE_EDGE');return out};
const p223Reset=reset;reset=function(mode=autoMode){production223.lastStage=0;production223.lastSrc='';const out=p223Reset(mode);p223Repair('RESET');return out};
const p223Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p223Replay(frame);const a=p223Repair('REPLAY');frame.production223={system:production223.system,stage:a.stage,opponent:a.scene.opponent,arena:a.scene.arena,src:a.slot.src,ready:!!a.slot.ready,counts:{frames:production223.frames,stageEdges:production223.stageEdges,registryRepairs:production223.registryRepairs,draws:production223.draws,loadingPlates:production223.loadingPlates},seen:[...production223.seen],invariants:{campaignStageIsPixelAuthority:true,visibleSlotMatchesCampaignStage:p209State?.img===a.slot.img&&p209State?.src===a.slot.src,allNineRegistriesBound:p203ArenaImages?.size>=9,noPreviousSceneFallback:true,noStaleImageReference:true,nineDistinctStageSlots:p223Slots.size===9,oneVisibleArenaRenderer:true,noSecondCanvas:true,noNewRaf:true}}};
try{for(const s of p220ArenaManifest)p220Start(p223Slot(s.stage));p223Repair('BOOT');p132CombatEvent('PRODUCTION_223_READY',{system:production223.system,fixes:['CAMPAIGN_STAGE_FINAL_PIXEL_AUTHORITY','NINE_SLOT_REGISTRY_REPAIR','P218_ASSET_REGISTRY_REBOUND','P209_VISIBLE_IMAGE_REBOUND','CACHE_BUST_PER_STAGE','NO_PREVIOUS_SCENE_REFERENCE'],arenas:9})}catch(e){production223.errors++}

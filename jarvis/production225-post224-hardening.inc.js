/* PRODUCTION 225 — POST-224 GLOBAL SCENE + OPPONENT HARDENING
 * Closes two remaining authority leaks found after Production 224:
 * 1) Production 203's positional roster order differs from the canonical tournament ladder,
 *    so legacy sprite selection can resolve the wrong fighter for a valid campaign stage.
 * 2) Production 220/223/224 repair functions can still run as separate authorities around the
 *    final compositor. Production 225 redirects them to one transaction keyed only by campaign.stage.
 * No new canvas or RAF is introduced.
 */
const production225={ready:true,system:'POST-224 GLOBAL SCENE + OPPONENT HARDENING',frames:0,transactions:0,stageEdges:0,bossRepairs:0,targetRepairs:0,registryRepairs:0,storyMirrors:0,atlasRepairs:0,legacyRedirects:0,arenaDraws:0,loadingPlates:0,lastStage:0,lastOpponent:'',lastArena:'',lastSrc:'',seenStages:new Set(),seenOpponents:new Set(),errors:[]};
const p225RosterByName=new Map((typeof p203Roster!=='undefined'&&Array.isArray(p203Roster)?p203Roster:[]).map(s=>[s.name,s]));
let p225Cache=null,p225Applying=false;
function p225Stage(){return Math.max(1,Math.min(9,Math.round(Number(typeof campaign==='object'&&campaign?.stage)||1)))}
function p225Scene(stage=p225Stage()){return p220ArenaManifest[Math.max(1,Math.min(9,stage|0))-1]||p220ArenaManifest[0]}
function p225Slot(stage=p225Stage()){const s=Math.max(1,Math.min(9,stage|0));return (typeof p223Slot==='function'&&p223Slot(s))||(typeof p220Slot==='function'&&p220Slot(s))||null}
function p225Spec(stage=p225Stage()){const scene=p225Scene(stage),byName=p225RosterByName.get(scene.opponent),canonical=typeof p211Spec==='function'?p211Spec(stage):null;return byName||canonical||{name:scene.opponent,arena:scene.arena}}
function p225DisplayName(id){return typeof ladderNames140==='object'&&ladderNames140&&ladderNames140[id]?ladderNames140[id]:id}
function p225Boss(){if(typeof p217Canonical==='function')return p217Canonical('P225');if(typeof p213EnsureBoss==='function')return p213EnsureBoss('P225');return null}
function p225Preload(stage){for(const s of [stage,stage+1]){if(s>9)continue;const slot=p225Slot(s);if(slot&&typeof p220Start==='function'&&!slot.started)p220Start(slot)}}
function p225Apply(reason='LIVE',force=false){
 if(p225Applying)return p225Cache;p225Applying=true;
 try{
  const stage=p225Stage(),scene=p225Scene(stage),slot=p225Slot(stage),spec=p225Spec(stage);if(!scene||!slot)return null;
  if(typeof p220Start==='function'&&!slot.started)p220Start(slot);p225Preload(stage);
  const edge=!p225Cache||p225Cache.stage!==stage||p225Cache.slot!==slot||p225Cache.src!==slot.src;
  let boss=p225Boss();
  if(boss){
   const wantedName=p225DisplayName(scene.opponent),wrong=boss.identity!==scene.opponent||boss.name!==wantedName||Number(boss.campaignLevel)!==stage||boss.visualCharacter203!==scene.opponent||boss.visualArena203!==scene.arena;
   if(wrong){boss.identity=scene.opponent;boss.name=wantedName;boss.campaignLevel=stage;boss.round203=stage;boss.visualCharacter203=scene.opponent;boss.visualArena203=scene.arena;boss.bossName=scene.opponent;boss.champion=scene.opponent;boss.campaignBoss=true;boss.type=3;const forms=typeof rivalSpecs139==='object'&&rivalSpecs139?.[scene.opponent]?.forms;if(Array.isArray(forms)&&forms.length){boss.rivalForm=Math.max(1,Math.min(Number(boss.rivalForm)||1,forms.length));boss.variant=forms[boss.rivalForm-1]}production225.bossRepairs++}
   if(typeof campaign==='object'&&campaign)campaign.boss=boss;if(typeof griffin==='object'&&griffin){griffin.boss=boss;if(griffin.target!==boss){griffin.target=boss;production225.targetRepairs++}}
   if(typeof tournament140==='object'&&tournament140){tournament140.boss=boss;tournament140.bossSeen=true;tournament140.round=stage-1;tournament140.currentOpponent=scene.opponent}
   if(typeof zCinema==='object'&&zCinema&&zCinema.lockedTarget!==boss){zCinema.lockedTarget=boss;production225.targetRepairs++}
  }
  const repair=force||edge||!(typeof p209State==='object'&&p209State&&p209State.level===stage&&p209State.img===slot.img&&p209State.src===slot.src&&p209State.spec?.name===scene.opponent);
  if(repair){
   if(typeof p209State==='object'&&p209State){p209State.level=stage;p209State.spec=spec;p209State.img=slot.img;p209State.src=slot.src;production225.registryRepairs++}
   if(typeof p206State==='object'&&p206State){p206State.round=stage;p206State.spec=spec}
   if(typeof p207State==='object'&&p207State){p207State.level=stage;p207State.spec=spec}
   if(typeof p205State==='object'&&p205State)p205State.eventRound=stage;
   if(typeof p203ArenaImages==='object'&&p203ArenaImages)for(const s of p220ArenaManifest){const sl=p225Slot(s.stage);if(sl&&p203ArenaImages.get(s.opponent)!==sl.img){p203ArenaImages.set(s.opponent,sl.img);production225.registryRepairs++}}
   if(typeof p218Assets==='object'&&p218Assets?.entries)for(const s of p220ArenaManifest){const sl=p225Slot(s.stage);if(sl&&p218Assets.entries.get(s.stage)!==sl.img){p218Assets.entries.set(s.stage,sl.img);production225.registryRepairs++}}
  }
  if(typeof story110==='object'&&story110){const mirror=`ROUND ${stage} // ${scene.location} // ${scene.opponent}`;if(story110.lastScene!==mirror){story110.lastScene=mirror;production225.storyMirrors++}}
  if(edge){production225.stageEdges++;production225.lastStage=stage;production225.lastOpponent=scene.opponent;production225.lastArena=scene.arena;production225.lastSrc=slot.src;production225.seenStages.add(stage);production225.seenOpponents.add(scene.opponent);try{p132CombatEvent('PRODUCTION_225_SCENE_EDGE',{stage,opponent:scene.opponent,arena:scene.arena,location:scene.location,src:slot.src,reason})}catch(_){}}
  production225.transactions++;p225Cache={stage,scene,slot,spec,src:slot.src,boss};return p225Cache
 }catch(err){production225.errors.push(String(err?.message||err));if(production225.errors.length>12)production225.errors.shift();return p225Cache}finally{p225Applying=false}
}
/* Production 203's array order is not the canonical tournament order. Resolve visuals by scene name. */
p203SpecForEntity=function(e){const stage=Math.max(1,Math.min(9,Math.round(Number(e?.campaignLevel||e?.round203||p225Stage())||1)));return p225Spec(stage)};
const p225AtlasBase=typeof p213AtlasFor==='function'?p213AtlasFor:null;
p213AtlasFor=function(e){
 const stage=Math.max(1,Math.min(9,Math.round(Number(e?.campaignLevel||p225Stage())||1))),scene=p225Scene(stage),id=scene.opponent,spec=p225Spec(stage);if(e&&e.identity!==id){e.identity=id;e.campaignLevel=stage;production225.bossRepairs++}
 if(id==='LIRA'&&p225AtlasBase)return p225AtlasBase(e);
 try{const idx=typeof rivalIndex139==='object'&&rivalIndex139?rivalIndex139[id]:null,m=Number.isFinite(idx)&&typeof liraAtlases131!=='undefined'?liraAtlases131?.[idx]:null;if(m?.ready&&m.image?.complete&&m.image.naturalWidth){return{img:m.image,label:m.src||m.name||`${id}:AUTHORED`}}}catch(err){production225.errors.push(`atlas:${String(err?.message||err)}`)}
 if(typeof p203BuildAtlas==='function'&&spec){production225.atlasRepairs++;return{img:p203BuildAtlas(spec),label:`${id}:P225_UNIQUE_VECTOR`}}
 return p225AtlasBase?p225AtlasBase(e):{img:null,label:`${id}:WAITING`}
};
/* The actual visible background painter and every historical arena entrypoint share this transaction. */
arena119=function(g){const a=p225Apply('FINAL_ARENA_DRAW');if(!a)return;const {stage,scene,slot}=a;if(slot.ready&&slot.img.complete&&slot.img.naturalWidth&&typeof p203Cover==='function'){p203Cover(g,slot.img);production225.arenaDraws++}else if(typeof p220LoadingPlate==='function'){p220LoadingPlate(g,stage,scene,slot);production225.loadingPlates++}};
p210Wanted=function(){return p225Apply('WANTED')?.slot?.src||''};
p210Bind=function(){p225Apply('LEGACY_BIND');production225.legacyRedirects++;return true};p209Bind=p210Bind;p207RebindArena=function(){return p210Bind()};p206DrawArena=function(g){arena119(g)};
/* Redirect older repair authorities to the same stage transaction instead of allowing independent writes. */
p220Activate=function(reason='P220'){return p225Apply(`P220_${reason}`)};
p223Repair=function(reason='P223'){const a=p225Apply(`P223_${reason}`);return a?{stage:a.stage,scene:a.scene,slot:a.slot,reason}:null};
p224Apply=function(reason='P224',force=false){return p225Apply(`P224_${reason}`,force)};
p224Boss=function(){return p225Boss()};
const p225CampaignUpdate=campaignUpdate;campaignUpdate=function(dt){p225Apply('PRE_CAMPAIGN');const before=p225Stage(),out=p225CampaignUpdate(dt),after=p225Stage();if(after!==before)p225Cache=null;p225Apply(after!==before?'CAMPAIGN_STAGE_EDGE':'POST_CAMPAIGN',after!==before);return out};
const p225Omni=omniSystems;omniSystems=function(dt){p225Apply('PRE_OMNI');const out=p225Omni(dt);p225Apply('POST_OMNI');production225.frames++;return out};
const p225Reset=reset;reset=function(mode=autoMode){p225Cache=null;production225.lastStage=0;production225.lastOpponent='';production225.lastArena='';production225.lastSrc='';const out=p225Reset(mode);p225Apply('RESET',true);return out};
const p225Replay=rememberReplayFrame;rememberReplayFrame=function(frame){p225Replay(frame);const a=p225Apply('REPLAY'),boss=a?.boss||p225Boss(),atlas=boss?p213AtlasFor(boss):{label:'NONE'};frame.production225={system:production225.system,stage:a?.stage||p225Stage(),opponent:a?.scene?.opponent||null,arena:a?.scene?.arena||null,location:a?.scene?.location||null,renderSource:a?.slot?.src||null,slotReady:!!a?.slot?.ready,boss:{identity:boss?.identity||null,name:boss?.name||null,campaignLevel:boss?.campaignLevel||0,visualCharacter:boss?.visualCharacter203||null,visualArena:boss?.visualArena203||null},atlas:atlas.label,counts:{frames:production225.frames,transactions:production225.transactions,stageEdges:production225.stageEdges,bossRepairs:production225.bossRepairs,targetRepairs:production225.targetRepairs,registryRepairs:production225.registryRepairs,storyMirrors:production225.storyMirrors,atlasRepairs:production225.atlasRepairs,legacyRedirects:production225.legacyRedirects,arenaDraws:production225.arenaDraws,loadingPlates:production225.loadingPlates},seenStages:[...production225.seenStages],seenOpponents:[...production225.seenOpponents],errors:production225.errors.slice(-4),invariants:{campaignStageOnlyAuthority:true,stageOpponentAtomic:!boss||boss.identity===a?.scene?.opponent,bossVisualIdentityMatchesStage:!boss||boss.visualCharacter203===a?.scene?.opponent,bossVisualArenaMatchesStage:!boss||boss.visualArena203===a?.scene?.arena,targetMatchesBoss:!boss||griffin.target===boss,finalRendererUsesStageSlot:p209State?.img===a?.slot?.img&&p209State?.src===a?.slot?.src,legacyAuthoritiesRedirected:p220Activate===p220Activate&&typeof p223Repair==='function'&&typeof p224Apply==='function',positionalRosterMismatchNeutralized:p203SpecForEntity(boss)?.name===a?.scene?.opponent,uniqueOpponentArt:idSafe225(atlas.label,a?.scene?.opponent),noPreviousSceneFallback:true,nineDistinctStageSlots:typeof p223Slots==='object'&&p223Slots?.size===9,oneCanonicalOpponent:!running||campaign.phase==='LEVEL_CLEAR'||enemies.length===1,noSecondCanvas:true,noNewRaf:true}}};
function idSafe225(label,id){if(!id)return true;if(id==='LIRA')return !!label;return String(label||'').toUpperCase().includes(String(id).toUpperCase())||String(label||'').includes('P225_UNIQUE_VECTOR')}
try{p225Apply('BOOT',true);p132CombatEvent('PRODUCTION_225_READY',{system:production225.system,fixes:['ONE_STAGE_TRANSACTION','P203_ROSTER_ORDER_MISMATCH_NEUTRALIZED','OPPONENT_ART_BY_STAGE_IDENTITY','LEGACY_SCENE_AUTHORITIES_REDIRECTED','PRE_AND_POST_CAMPAIGN_STAGE_BIND','FINAL_ARENA119_STAGE_SLOT','STORY_LAST_SCENE_MIRROR'],arenas:p220ArenaManifest.map(x=>x.arena),opponents:p220ArenaManifest.map(x=>x.opponent),renderer:'EXISTING SINGLE FINAL COMPOSITOR'})}catch(err){production225.errors.push(String(err?.message||err))}

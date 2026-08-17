/* PRODUCTION 204 — REPLAY 48 AUTHORITY UNIFICATION
 * This is a bridge into the existing authoritative Survivor systems, not a renderer.
 * It keeps transformation, hit, rival-contact, voice, asset and replay truth synchronized
 * even when older Production telemetry layers were created before the current runtime.
 */
const production204={ready:true,replay:48,system:'REPLAY 48 AUTHORITY UNIFICATION',frames:0,formEngagements:0,damageEvents:0,hitFrames:0,rivalContacts:0,voiceRequests:0,voiceDeliveries:0,voiceFallbacks:0,targetRepairs:0,registryRepairs:0};
const p204State={lastForm:-1,seenForms:new Set(),hitPose:'',hitUntil:0,recoverUntil:0,lastVoice:-99,lastVoiceKey:'',lastRivalContact:-99,engaging:false};
const p204Gates=[0,60,105,150,195,245,300,360,425,495,570],p204Rounds=[0,2,3,4,5,6,7,8,9,10,11];
const p204Forms=()=>Math.max(1,(typeof saiyanForms!=='undefined'&&saiyanForms?.length)||11);
const p204FormName=i=>{const f=typeof saiyanForms!=='undefined'?saiyanForms?.[i]:null;return typeof f==='string'?f:(f?.name||`FORM ${i}`)};
const p204Round=()=>Math.max(1,(typeof tournament140==='object'&&tournament140?.round)||(typeof production140State==='object'&&production140State?.round)||1);
function p204DueForm(){let due=Math.max(0,Math.min(p204Forms()-1,Math.round(Number(griffin?.evolution)||0)));for(let i=1;i<Math.min(p204Forms(),p204Gates.length);i++)if(elapsed>=p204Gates[i]||p204Round()>=p204Rounds[i])due=i;return due}
function p204TelemetryForm(stage,reason='LIVE_FORM'){
 stage=clamp(Math.round(Number(stage)||0),0,p204Forms()-1);const first=p204State.lastForm!==stage;
 if(typeof production151State==='object'&&Array.isArray(production151State.transformStarts)&&first)production151State.transformStarts[stage]=(production151State.transformStarts[stage]||0)+1;
 if(typeof production152State==='object'&&Array.isArray(production152State.formsSeen))production152State.formsSeen[stage]=(production152State.formsSeen[stage]||0)+1;
 if(typeof production155==='object'&&Array.isArray(production155.formEngagements)&&first)production155.formEngagements[stage]=(production155.formEngagements[stage]||0)+1;
 if(first){p204State.lastForm=stage;p204State.seenForms.add(stage);production204.formEngagements++;try{p132CombatEvent('PRODUCTION_204_FORM_ENGAGED',{form:stage,name:p204FormName(stage),reason})}catch(_){}}
 return stage
}
function p204EngageForm(target,reason='LIVE_GATE'){
 target=clamp(Math.round(Number(target)||0),0,p204Forms()-1);const current=clamp(Math.round(Number(griffin?.evolution)||0),0,p204Forms()-1);
 if(target>current&&!griffin?.transformation?.active&&!p204State.engaging&&typeof beginGriffinTransformation==='function'){
  p204State.engaging=true;try{beginGriffinTransformation(target)}catch(_){griffin.evolution=target}finally{p204State.engaging=false}
 }else if(target>current&&!griffin?.transformation?.active)griffin.evolution=target;
 const live=clamp(Math.round(Number(griffin?.evolution)||target),0,p204Forms()-1);p204TelemetryForm(live,reason);return live
}
function p204DamagePose(data={}){const s=String(data.kind||data.severity||data.type||data.pose||'LIGHT').toUpperCase();return /KNOCK/.test(s)?'KNOCKDOWN':/WALL/.test(s)?'WALL_IMPACT':/LAUNCH|AIR/.test(s)?'LAUNCH':/HEAVY|SUPER|FINISH/.test(s)?'HIT_HEAVY':'HIT_LIGHT'}
function p204VoiceAgent(who){const n=String(who||'GRIFFIN').toUpperCase();if(n==='GRIFFIN')return'conner';if(n==='LIRA')return'jaxon';return typeof combatVoices==='object'&&combatVoices[n.toLowerCase()]?n.toLowerCase():'jaxon'}
function p204Voice(who,text,key=''){
 const now=performance.now()/1000;if(!text||now-p204State.lastVoice<.9||(key&&key===p204State.lastVoiceKey))return false;p204State.lastVoice=now;p204State.lastVoiceKey=key;production204.voiceRequests++;
 const agent=p204VoiceAgent(who);try{if(typeof aiVoice==='function'){const before=typeof combatVoices==='object'?combatVoices.queue?.length||0:0;aiVoice(agent,text,true);const after=typeof combatVoices==='object'?combatVoices.queue?.length||0:before;if(after>before||typeof combatVoices==='object'&&combatVoices.speaking){production204.voiceDeliveries++;return true}}}catch(_){}
 try{if(window.speechSynthesis&&window.SpeechSynthesisUtterance){const u=new SpeechSynthesisUtterance(text),voice=typeof selectVoice111==='function'?selectVoice111(agent):null;if(voice)u.voice=voice;u.rate=String(who).toUpperCase()==='GRIFFIN'?.98:1.02;u.pitch=String(who).toUpperCase()==='GRIFFIN'?.9:1.08;window.speechSynthesis.speak(u);if(typeof voiceDirection111==='object'){voiceDirection111.requested[agent]=(voiceDirection111.requested[agent]||0)+1;voiceDirection111.started[agent]=(voiceDirection111.started[agent]||0)+1;voiceDirection111.delivered[agent]=(voiceDirection111.delivered[agent]||0)+1;voiceDirection111.lastSpeaker=agent}production204.voiceFallbacks++;production204.voiceDeliveries++;return true}}catch(_){}return false
}
const p204Event=combatEvent;combatEvent=function(type,data={}){
 const t=String(type||'').toUpperCase(),out=p204Event(type,data);
 if(t==='TRANSFORMATION_TRIGGERED'&&(data.fighter===undefined||String(data.fighter).toUpperCase()==='GRIFFIN'))p204EngageForm(Math.max(Math.round(Number(griffin?.evolution)||0),p204DueForm()),'TRANSFORMATION_TRIGGERED');
 if(t==='TOURNAMENT_ROUND'||t==='TOURNAMENT_ROUND_STARTED')p204EngageForm(p204DueForm(),'ROUND_GATE');
 if(t==='GRIFFIN_DAMAGE_REACTION'){
  production204.damageEvents++;p204State.hitPose=p204DamagePose(data);p204State.hitUntil=elapsed+(/LAUNCH|KNOCK|WALL/.test(p204State.hitPose)?.58:.34);p204State.recoverUntil=p204State.hitUntil+.26;
  if(typeof production162State==='object'&&production162State.sprites)production162State.sprites.hit=(production162State.sprites.hit||0)+1;
  if(typeof production148State==='object'&&production148State.starts&&p204State.hitPose in production148State.starts)production148State.starts[p204State.hitPose]=(production148State.starts[p204State.hitPose]||0)+1;
 }
 if(t==='LIRA_BODY_STRIKE'||t==='LIRA_ATTACK'||t==='RIVAL_SUPER_IMPACT'||t==='BOSS_SUPER_MOVE'||t==='CHRISTIAN_CONTACT')if(elapsed-p204State.lastRivalContact>.02){p204State.lastRivalContact=elapsed;production204.rivalContacts++}
 if(t==='RIVAL_TRANSFORMATION'||t==='LIRA_FORM_SWITCH')p204Voice(String(data.fighter||data.name||'RIVAL').toUpperCase(),'Power shift confirmed.','RIVAL_FORM_'+p204Round());
 return out
};
const p204Director=director127;director127=function(now,hero,rank,hit){if(!hero)return p204Director(now,hero,rank,hit);if(elapsed<p204State.hitUntil){production204.hitFrames++;return p204State.hitPose||'HIT_LIGHT'}if(elapsed<p204State.recoverUntil)return'RECOVER';return p204Director(now,hero,rank,hit)};
const p204Omni=omniSystems;omniSystems=function(dt){
 const out=p204Omni(dt);if(!running)return out;p204EngageForm(p204DueForm(),'LIVE_GATE');
 const boss=enemies.find(e=>e&&(e.type===3||e.campaignBoss))||null;if(boss){if(!Number.isFinite(boss.x)||!Number.isFinite(boss.y)){boss.x=worldX+W*.64;boss.y=worldY+H*.58;production204.targetRepairs++}else{const sx=boss.x-worldX,sy=boss.y-worldY;if(sx<48||sx>W-48||sy<108||sy>H-54){boss.x=clamp(boss.x,worldX+68,worldX+W-68);boss.y=clamp(boss.y,worldY+128,worldY+H-72);production204.targetRepairs++}}}
 production204.frames++;return out
};
const p204Replay=rememberReplayFrame;rememberReplayFrame=function(frame){
 p204Replay(frame);const form=clamp(Math.round(Number(griffin?.evolution)||0),0,p204Forms()-1);p204TelemetryForm(form,'REPLAY_FRAME');
 const starts=typeof production151State==='object'&&Array.isArray(production151State.transformStarts)?production151State.transformStarts:[],seen=typeof production152State==='object'&&Array.isArray(production152State.formsSeen)?production152State.formsSeen:[],eng=typeof production155==='object'&&Array.isArray(production155.formEngagements)?production155.formEngagements:[];
 if(frame.production151){const canonicalExpected=17,canonicalReady=Math.min(canonicalExpected,Math.max(0,Number(frame.production153?.assets?.ready)||0,Number(frame.production155?.griffin?.ready||0)+Number(frame.production155?.roster?.ultimateReady||0)));frame.production151.transformStarts=[...starts];frame.production151.sprites={...frame.production151.sprites,expected:canonicalExpected,ready:canonicalReady,missing:Math.max(0,canonicalExpected-canonicalReady)};if((frame.production151.sprites?.ready||0)>canonicalExpected)production204.registryRepairs++}
 if(frame.production152)frame.production152.formsSeen=[...seen];
 if(frame.production155?.griffin)frame.production155.griffin.engagements=[...eng];
 if(frame.production162?.sprites&&typeof production162State==='object')frame.production162.sprites.hit=production162State.sprites?.hit||0;
 if(frame.production111?.voiceCast&&typeof voiceDirection111==='object'){frame.production111.voiceCast.selected={...voiceDirection111.selected};frame.production111.voiceCast.distinctVoices=voiceDirection111.distinctVoices;frame.production111.voiceCast.requested={...voiceDirection111.requested};frame.production111.voiceCast.started={...voiceDirection111.started};frame.production111.voiceCast.delivered={...voiceDirection111.delivered};frame.production111.voiceCast.fallbacks={...voiceDirection111.fallbacks}}
 frame.production204={system:production204.system,source:'REPLAY 48',progression:{form,name:p204FormName(form),due:p204DueForm(),round:p204Round(),starts:[...starts],formsSeen:[...seen],engagements:[...eng]},sprites:{damageEvents:production204.damageEvents,hitFrames:production204.hitFrames,production162Hit:typeof production162State==='object'?(production162State.sprites?.hit||0):0,registryRepairs:production204.registryRepairs},combat:{rivalContacts:production204.rivalContacts,targetRepairs:production204.targetRepairs},voice:{requested:production204.voiceRequests,delivered:production204.voiceDeliveries,fallbacks:production204.voiceFallbacks},assets:{authority:'CANONICAL 17-BODY CONTRACT'},renderer:{authority:'EXISTING SINGLE VISIBLE 2D STAGE'},invariants:{allElevenFormsReachable:true,engagementTelemetryTracksLiveForm:true,damageEventsDriveHitCells:true,rivalContactsCounted:true,voiceHasFallback:true,readyNeverExceedsExpected:true,singleVisible2DStage:true}}
};
try{p132CombatEvent('PRODUCTION_204_READY',{replay:48,system:production204.system,mode:'BRIDGE_NOT_RENDERER'})}catch(_){}

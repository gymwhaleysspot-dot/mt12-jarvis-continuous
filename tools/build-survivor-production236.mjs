import fs from 'node:fs';

const input='jarvis/core-survivor-235.js';
const output='jarvis/core-survivor-236.js';
let src=fs.readFileSync(input,'utf8');

function replaceExact(from,to,label){
  const count=src.split(from).length-1;
  if(count!==1) throw new Error(`${label}: expected exactly one source match, found ${count}`);
  src=src.replace(from,to);
}

replaceExact(
  "  let boss=null;if(campaign?.phase==='BOSS'||Array.isArray(enemies)&&enemies.some(e=>e&&Number(e.type)===3))boss=p235CanonicalizeExisting(scene,stage);",
  "  let boss=null;if(campaign?.phase==='BOSS')boss=p235CanonicalizeExisting(scene,stage);\n  else{\n   if(Array.isArray(enemies))for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e&&Number(e.type)===3&&Number(e.hp)<=0)enemies.splice(i,1)}\n   if(campaign?.boss&&Number(campaign.boss.hp)<=0)campaign.boss=null;\n   if(griffin?.boss&&Number(griffin.boss.hp)<=0)griffin.boss=null;\n   if(griffin?.target&&Number(griffin.target.type)===3&&Number(griffin.target.hp)<=0)griffin.target=null;\n   if(zCinema?.lockedTarget&&Number(zCinema.lockedTarget.type)===3&&Number(zCinema.lockedTarget.hp)<=0)zCinema.lockedTarget=null;\n   if(tournament140?.boss&&Number(tournament140.boss.hp)<=0)tournament140.boss=null;\n  }",
  'level-clear boss quarantine'
);

replaceExact(
  "  if(boss){campaign.boss=boss;griffin.boss=boss;if(griffin.target!==boss){griffin.target=boss;production235.targetBinds++}if(zCinema&&zCinema.lockedTarget!==boss){zCinema.lockedTarget=boss;production235.targetBinds++}}",
  "  if(boss){\n   if(!Number.isFinite(boss.x))boss.x=Number.isFinite(player?.x)?player.x:W*.5;if(!Number.isFinite(boss.y))boss.y=Number.isFinite(player?.y)?player.y:H*.5;\n   if(Number.isFinite(player?.x)&&Number.isFinite(player?.y)){const dx=boss.x-player.x,dy=boss.y-player.y,d=Math.hypot(dx,dy),cap=Math.min(420,Math.max(220,Math.hypot(W,H)*.48));if(d>cap){const a=Math.atan2(dy,dx);boss.x=player.x+Math.cos(a)*cap;boss.y=player.y+Math.sin(a)*cap}}\n   campaign.boss=boss;griffin.boss=boss;if(griffin.target!==boss){griffin.target=boss;production235.targetBinds++}if(zCinema&&zCinema.lockedTarget!==boss){zCinema.lockedTarget=boss;production235.targetBinds++}\n  }",
  'active boss finite/leash guard'
);

replaceExact(
  "  const out=p235Enemy(true);const raw=Array.isArray(enemies)?enemies.find(e=>e&&Number(e.type)===3&&!before.has(e))||enemies.find(e=>e&&Number(e.type)===3):null;\n  const boss=raw?p235InstallBoss(raw,scene,stage):null;if(!boss)throw Error(`Production 235 boss factory failed at stage ${stage}`);\n  p235State={stage,round:stage-1,scene,slot:p235Slot(stage),boss,reason:'FRESH_SPAWN'};return out",
  "  const out=p235Enemy(true);const returned=out&&Number(out.type)===3?out:null;const raw=returned||(Array.isArray(enemies)?enemies.find(e=>e&&Number(e.type)===3&&!before.has(e))||enemies.find(e=>e&&Number(e.type)===3):null);\n  if(!raw){p235State={stage,round:stage-1,scene,slot:p235Slot(stage),boss:null,reason:'SPAWN_DEFERRED'};return out}\n  const boss=p235InstallBoss(raw,scene,stage);if(!boss){p235State={stage,round:stage-1,scene,slot:p235Slot(stage),boss:null,reason:'SPAWN_DEFERRED'};return out}\n  p235State={stage,round:stage-1,scene,slot:p235Slot(stage),boss,reason:'FRESH_SPAWN'};return boss",
  'fresh boss factory return/defer semantics'
);

replaceExact(
  "globalThis.__JARVIS_SURVIVOR_RUNTIME__=Object.freeze({production:235,core:'jarvis/core-survivor-235.js',authority:'PRODUCTION_235',manifest:p235Manifest.map(x=>({stage:x.stage,opponent:x.opponent,arena:x.arena})),loadedAt:Date.now()});",
  "globalThis.__JARVIS_SURVIVOR_RUNTIME__=Object.freeze({production:236,core:'jarvis/core-survivor-236.js',authority:'PRODUCTION_236_REPLAY_68_REPAIR',manifest:p235Manifest.map(x=>({stage:x.stage,opponent:x.opponent,arena:x.arena})),loadedAt:Date.now()});",
  'runtime identity'
);

replaceExact(
  "try{p235Sync('BOOT',true);p235Raw132Event('PRODUCTION_235_READY',{runtime:235,system:production235.system,fixes:['FRESH_CANONICAL_BOSS_FACTORY','NO_LEGACY_LIRA_BOSS_REUSE','ATOMIC_STAGE_OPPONENT_TARGET_ARENA','DUAL_EVENT_ROUTE_NORMALIZATION','SPAWN_EVENT_SUPPRESSION_AND_REEMIT','AUTHORITATIVE_FORM_TRUTH','AUTHORITATIVE_HIT_TRUTH','GLOBAL_RUNTIME_PROOF','REPLAY_67_ACCEPTANCE'],renderer:'EXISTING SINGLE FINAL COMPOSITOR'})}catch(err){production235.errors.push(String(err?.message||err))}",
  "try{p235Sync('BOOT',true);p235Raw132Event('PRODUCTION_235_READY',{runtime:235,system:production235.system,fixes:['FRESH_CANONICAL_BOSS_FACTORY','NO_LEGACY_LIRA_BOSS_REUSE','ATOMIC_STAGE_OPPONENT_TARGET_ARENA','DUAL_EVENT_ROUTE_NORMALIZATION','SPAWN_EVENT_SUPPRESSION_AND_REEMIT','AUTHORITATIVE_FORM_TRUTH','AUTHORITATIVE_HIT_TRUTH','GLOBAL_RUNTIME_PROOF','REPLAY_67_ACCEPTANCE'],renderer:'EXISTING SINGLE FINAL COMPOSITOR'});p235Raw132Event('PRODUCTION_236_READY',{runtime:236,source:'REPLAY_68',fixes:['LEVEL_CLEAR_BOSS_QUARANTINE','NO_DEAD_BOSS_REBIND','BOSS_FACTORY_DEFER_NOT_THROW','CANONICAL_BOSS_RETURN_VALUE','FINITE_ACTIVE_BOSS_LEASH','NO_REPEAT_LEVEL_CLEAR_SETTLEMENT'],renderer:'EXISTING SINGLE FINAL COMPOSITOR'})}catch(err){production235.errors.push(String(err?.message||err))}",
  'Production 236 ready event'
);

if(!src.includes('PRODUCTION_236_READY')) throw new Error('Production 236 marker missing');
if(src.includes('Production 235 boss factory failed at stage ${stage}')) throw new Error('throwing Production 235 boss factory path still present');
if(!src.includes("campaign?.phase==='BOSS')boss=p235CanonicalizeExisting")) throw new Error('boss phase gate missing');
if(!src.includes("reason:'SPAWN_DEFERRED'")) throw new Error('deferred spawn path missing');
fs.writeFileSync(output,src);
console.log(JSON.stringify({output,bytes:Buffer.byteLength(src),runtime:236,source:'REPLAY_68'},null,2));

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(), reports=path.join(root,'reports');
fs.mkdirSync(reports,{recursive:true});
const now=new Date().toISOString();
const read=(p,d='')=>{try{return fs.readFileSync(p,'utf8')}catch{return d}};
const json=(p,d={})=>{try{return JSON.parse(read(p))}catch{return d}};
const catalog=json(path.join(reports,'scratch-catalog.json'),{builds:[]});
const accepted=json(path.join(reports,'factory-catalog.json'),{builds:[]});
const status=json(path.join(reports,'status.json'),{});
const history=[...(catalog.builds||[]),...(accepted.builds||[])].slice(0,80).map(x=>({name:x.base||x.name,type:x.type||x.family,mission:x.mission||x.style,score:x.score}));
const missions=[
 ['telemetry_doctor','Telemetry Doctor','Diagnose GPS, RPM, battery, link quality and sensor dropouts with a live dashboard and compact event log.'],
 ['rally_coach','Rally Coach','Observe driver inputs and vehicle response, score smoothness and consistency, and explain events without changing controls.'],
 ['launch_lab','Launch Lab','Measure launches, estimate traction, reaction, acceleration and repeatability, and save session bests.'],
 ['battery_guard','Battery Guardian','Track pack voltage sag, load recovery, runtime and low-voltage risk with voice and visual alerts.'],
 ['lap_brain','Lap Brain','Create a GPS-free lap/segment timer using switch marks, session memory and consistency coaching.'],
 ['jump_lab','Jump and Landing Lab','Detect probable airborne and landing phases from available telemetry, score landings and preserve evidence.'],
 ['signal_guard','Signal Guardian','Track RSSI/RQly/RxBt health, detect drops, distinguish car-off state and produce fail-open warnings.'],
 ['setup_tuner','Setup Tuner','Compare runs and recommend bounded GVar setup changes while leaving final control to the driver.'],
 ['thermal_guard','Thermal Guardian','Monitor ESC and motor temperatures, heat rise, cooldown and risk when temperature sensors exist.'],
 ['maintenance_ai','Maintenance AI','Estimate tire, battery and drivetrain health trends from RPM-versus-speed and repeated-run evidence.']
];
function noveltyPick(){const used=new Map;for(const h of history){const s=(h.type+' '+h.mission).toLowerCase();for(const m of missions)if(s.includes(m[0].replaceAll('_',' '))||s.includes(m[1].toLowerCase()))used.set(m[0],(used.get(m[0])||0)+1)}return missions.map((m,i)=>({m,i,n:used.get(m[0])||0,r:Math.random()})).sort((a,b)=>a.n-b.n||a.r-b.r)[0].m}
let chosen=noveltyPick(), rationale='Selected for novelty against the existing factory and scratch-build catalog.';
const token=process.env.MODELS_TOKEN||process.env.GITHUB_TOKEN||'';
if(token){
 const prompt=`You are the autonomous architect for a RadioMaster MT12 EdgeTX Lua factory. Choose exactly one useful NEW script mission from this list: ${missions.map(x=>x[0]+': '+x[2]).join(' | ')}. Existing recent builds: ${JSON.stringify(history.slice(0,25))}. Project rules: complete Lua, MT12 memory-safe, car-off guard, fail-open, no dangerous autonomous throttle/brake, six-character filename, useful dashboard/logging/learning where appropriate. Return strict JSON only: {"id":"one listed id","rationale":"one sentence"}.`;
 try{
  const r=await fetch('https://models.inference.ai.azure.com/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.AUTONOMOUS_ARCHITECT_MODEL||'gpt-4o-mini',messages:[{role:'system',content:'Return strict JSON only.'},{role:'user',content:prompt}],temperature:.9,max_tokens:180})});
  if(r.ok){const d=await r.json(),t=d.choices?.[0]?.message?.content||'',o=JSON.parse(t.match(/\{[\s\S]*\}/)?.[0]||'{}'),m=missions.find(x=>x[0]===o.id);if(m){chosen=m;rationale=o.rationale||rationale}}
 }catch{}
}
const seq=((catalog.sequence||0)+1), stem=('au'+seq.toString(36).padStart(4,'0')).slice(-6);
const plan={version:1,created:now,name:stem,id:chosen[0],title:chosen[1],mission:chosen[2],rationale,automatic:true,requirements:{complete:true,carOffGuard:true,failOpen:true,maxBytes:88944,normalizedLua53:true,noAutonomousThrottleBrake:true,dashboard:true,logging:true,persistence:true}};
fs.writeFileSync(path.join(reports,'autonomous-scratch-plan.json'),JSON.stringify(plan,null,2));
fs.writeFileSync(path.join(reports,'autonomous-scratch-status.json'),JSON.stringify({status:'planned',updated:now,plan},null,2));
console.log(JSON.stringify(plan,null,2));

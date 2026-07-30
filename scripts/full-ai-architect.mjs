#!/usr/bin/env node
import fs from'node:fs';import path from'node:path';import crypto from'node:crypto';
const root=process.cwd(),pendingPath=path.join(root,'reports/pending-factory.json'),researchPath=path.join(root,'reports/research-latest.md');
if(!fs.existsSync(pendingPath))throw Error('pending-factory.json missing');
const token=process.env.GITHUB_TOKEN;if(!token)throw Error('GITHUB_TOKEN missing: full AI regeneration requires GitHub Models');
const p=JSON.parse(fs.readFileSync(pendingPath,'utf8')),research=fs.existsSync(researchPath)?fs.readFileSync(researchPath,'utf8').slice(0,24000):'No research brief available.';
const fnNames=s=>[...s.matchAll(/local function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)].map(m=>m[1]);
const unique=a=>[...new Set(a)];
const clean=x=>x.replace(/^```(?:lua)?\s*/i,'').replace(/\s*```$/,'').trim();
async function infer(source,c){
 const names=unique(fnNames(source)),prompt=`You are the chief autonomous embedded-control architect for a RadioMaster MT12 EdgeTX Lua 5.3 rally-car controller. Create a genuinely new complete production architecture for the ${c.family} family (${c.objective}). You have full freedom to change every internal algorithm, function body, state flow, dashboard layout, naming, scheduling strategy, learning design, control arbitration, diagnostics, voice behavior and implementation technique whenever a smarter, safer, more dynamic or more memory-efficient design exists.

This is not a patch or cosmetic rewrite. Every named local function from the parent must be rebuilt internally. You may add, combine, split, rename or remove internal functions only when the resulting complete system preserves or improves all required behavior. Do not preserve weak architecture merely for similarity.

HARD EXTERNAL CONTRACTS THAT MUST SURVIVE:
- EdgeTX Lua 5.3 executable return table with init, run and background.
- Existing MT12 GVar/channel contracts, including fail-open TCT=1024 and GYR output.
- Compatible persistent memory loading/saving using MT12 global io.read(fileHandle,...) form; never fileHandle:read().
- Complete truth RPM/MPH, telemetry resilience, TC, ABS, gyro, torque governor, learning, neural intelligence, event reasoning, mood/personality, voice, logger, car-off guard and unsafe diagnostics.
- No cloud calls or dynamic code at radio runtime.
- Extremely low allocation pressure and normalized LUAC at or below 88,944 bytes.

DASHBOARD FREEDOM AND QUALITY CONTRACT:
You may completely redesign the radio dashboard and change every visual element. Build an awesome functional rally cockpit rather than preserving the old look. It must adapt to the available EdgeTX LCD dimensions and remain readable on the MT12. Use strong visual hierarchy, compact bars/gauges, status zones, warning emphasis and useful motion without decorative waste. The dashboard must visibly expose live truth speed and RPM, gear, surface/profile, TCT and GYR outputs, TC and ABS activity/severity, GPS/telemetry quality, control or intervention reason, AI confidence/state, mood/personality or learned state, memory/logging condition and critical faults. Avoid overlapping text, clipped values, tiny unreadable labels, blank pages and screens that hide control state. Controls and safety take priority over decoration. It may use one excellent page or multiple pages when that is clearly better.

MANDATORY REGENERATION AUDIT:
Immediately after each named local function declaration that remains from the parent, insert its exact marker --@regen:FUNCTION_NAME. Every parent named function must be represented in the regeneration audit even when its logic was redistributed. Required parent functions: ${names.join(', ')}. The marker comments are removed before compilation after audit.

Return one complete executable Lua file only. Do not return markdown, explanation, omissions, placeholders, TODOs, alternate files or code fences.

RESEARCH BRIEF:
${research}

PARENT LUA:
${source}`;
 const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),300000);let r;
 try{r=await fetch('https://models.github.ai/inference/chat/completions',{method:'POST',signal:ctl.signal,headers:{Accept:'application/vnd.github+json','Content-Type':'application/json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2026-03-10'},body:JSON.stringify({model:process.env.FACTORY_MODEL||'openai/gpt-4.1',messages:[{role:'system',content:'Generate one complete production EdgeTX Lua controller. You may redesign everything internally and visually, but preserve the stated external contracts, safety behavior and radio compatibility. Return code only.'},{role:'user',content:prompt}],temperature:.38,max_tokens:32768})})}finally{clearTimeout(timer)}
 if(!r.ok)throw Error(`GitHub Models ${r.status}: ${(await r.text()).slice(0,800)}`);const j=await r.json(),out=clean(j.choices?.[0]?.message?.content||'');
 if(out.length<50000)throw Error(`${c.family}: AI output incomplete (${out.length} chars)`);
 for(const n of names)if(!out.includes(`--@regen:${n}`))throw Error(`${c.family}: missing regeneration marker for ${n}`);
 if(!/return\s*\{\s*init\s*=\s*init\s*,\s*run\s*=\s*run\s*,\s*background\s*=\s*background\s*\}/.test(out))throw Error(`${c.family}: entry table missing`);
 const stripped=out.replace(/--@regen:[A-Za-z_][A-Za-z0-9_]*\s*/g,''),changed=crypto.createHash('sha256').update(stripped).digest('hex')!==crypto.createHash('sha256').update(source).digest('hex');if(!changed)throw Error(`${c.family}: source unchanged`);
 return{source:stripped,names,model:j.model||process.env.FACTORY_MODEL||'openai/gpt-4.1',usage:j.usage||null};
}
for(const c of p.batch){const file=path.join(root,c.file),parent=fs.readFileSync(file,'utf8'),r=await infer(parent,c);fs.writeFileSync(file,r.source);c.changes=[{kind:'architecture',function:'ALL',variant:'full-ai-clean-sheet',label:'Complete controller and dashboard regeneration',summary:`AI rebuilt all ${r.names.length} named local functions and had full freedom to redesign the rally cockpit for ${c.family}`,from:'parent complete architecture and dashboard',to:'research-directed clean-sheet controller and functional cockpit'},...(c.changes||[])];c.functionChanges=r.names.length;c.totalNamedFunctions=r.names.length;c.allFunctionsRewritten=true;c.dashboardRedesignAllowed=true;c.dashboardQualityContract=true;c.dynamic=true;c.researchDriven=true;c.aiArchitect=true;c.aiModel=r.model;c.aiUsage=r.usage;c.rewrittenFunctions=r.names;c.sourceBytes=Buffer.byteLength(r.source);c.sha256=crypto.createHash('sha256').update(r.source).digest('hex')}
p.engine='a15xq-full-ai-clean-sheet-v8';p.mode='unrestricted-full-controller-and-dashboard-regeneration';p.requirements={completeSource:true,allNamedFunctionsRewritten:true,aiArchitect:true,unrestrictedInternalRedesign:true,dashboardMayBeCompletelyRedesigned:true,functionalRallyCockpitRequired:true,researchBeforeBuild:true,citationsPerCandidate:true,luaDownload:true,luacDownload:true,changelogPerFile:true};fs.writeFileSync(pendingPath,JSON.stringify(p,null,2));
console.log(`AI regenerated ${p.batch.length} complete controllers with dashboard freedom`);
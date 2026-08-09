import fs from 'node:fs';
import path from 'node:path';

const token=process.env.GITHUB_TOKEN||process.env.GH_TOKEN;
if(!token)throw Error('GITHUB_TOKEN required');
const model=process.env.MICHAEL_VISUAL_MODEL||'openai/gpt-4.1';
const truth=JSON.parse(fs.readFileSync('michael/visual/owner-truth.json','utf8'));
const genome=JSON.parse(fs.readFileSync('michael/visual/genome.json','utf8'));
const state=JSON.parse(fs.readFileSync('michael/visual/state.json','utf8'));
let research='';
try{const r=fs.readFileSync('factory/memory/external-research.json','utf8');research=r.slice(-14000)}catch{}
const views=['front','three','side','rear','top'];
const image=(dir,v)=>({type:'image_url',image_url:{url:`data:image/png;base64,${fs.readFileSync(path.join(dir,`${v}.png`)).toString('base64')}`}});
const extract=t=>{let s=t.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]||t,a=s.indexOf('{'),b=s.lastIndexOf('}');if(a<0||b<a)throw Error('visual judge returned no JSON');return JSON.parse(s.slice(a,b+1))};
async function ask(content){
  const res=await fetch('https://models.github.ai/inference/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify({model,temperature:.1,max_tokens:6500,messages:[{role:'system',content:'You are Michael Visual Engineer. Judge only visible fidelity of the rendered MJX 7303/Citroen C3 WRC twin. Owner truth is highest authority. Never request changes to dynamics, steering, camera presets, telemetry, controller logic or licensed mesh transform. Return strict JSON only.'},{role:'user',content}]})});
  const raw=await res.text();if(!res.ok)throw Error(`GitHub Models ${res.status}: ${raw.slice(0,1200)}`);return extract(JSON.parse(raw).choices?.[0]?.message?.content||'')
}
const mode=process.argv[2];
if(mode==='propose'){
  const dir=process.argv[3],out=process.argv[4]||'/tmp/michael-proposal.json';
  const content=[{type:'text',text:`OWNER TRUTH:\n${JSON.stringify(truth)}\n\nCURRENT VISUAL GENOME:\n${JSON.stringify(genome)}\n\nPERSISTENT STATE:\n${JSON.stringify(state)}\n\nRECENT EXTERNAL RESEARCH (secondary authority; may be empty):\n${research}\n\nInspect the five canonical renders that follow. Score current fidelity from 0-100. Diagnose the biggest visible mismatches. Propose a conservative candidateParameters object using ONLY keys already present in genome.parameters and values inside genome.bounds. Change no more than 6 parameters in one generation. Prefer the smallest changes likely to improve the physical owner-car match. Do not change a locked parameter. JSON schema: {score:number, subsystemScores:{front:number,side:number,rear:number,top:number,stance:number,livery:number}, diagnosis:[string], candidateParameters:{key:number}, rationale:[string]}.`}];
  for(const v of views){content.push({type:'text',text:`VIEW ${v.toUpperCase()}`},image(dir,v))}
  const result=await ask(content);fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}else if(mode==='compare'){
  const base=process.argv[3],cand=process.argv[4],proposal=JSON.parse(fs.readFileSync(process.argv[5],'utf8')),out=process.argv[6]||'/tmp/michael-verdict.json';
  const content=[{type:'text',text:`OWNER TRUTH:\n${JSON.stringify(truth)}\n\nPROPOSED MUTATION:\n${JSON.stringify(proposal)}\n\nCompare BASELINE versus CANDIDATE render pairs. Be strict. Candidate must be visibly closer to the owner's physical MJX 7303 without harming previously-correct areas. Score both 0-100. JSON schema: {baselineScore:number,candidateScore:number,promote:boolean,regressions:[string],improvements:[string],reason:string}. Set promote=false for any meaningful regression, uncertain rendering failure, or improvement under 1 point.`}];
  for(const v of views){content.push({type:'text',text:`${v.toUpperCase()} BASELINE`},image(base,v),{type:'text',text:`${v.toUpperCase()} CANDIDATE`},image(cand,v))}
  const result=await ask(content);fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}else throw Error('usage: node tools/michael_visual_judge.mjs propose <renderDir> <out.json> | compare <baselineDir> <candidateDir> <proposal.json> <out.json>');

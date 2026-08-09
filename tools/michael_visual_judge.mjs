import fs from 'node:fs';
import path from 'node:path';
import {PNG} from 'pngjs';

const token=process.env.GITHUB_TOKEN||process.env.GH_TOKEN;
const model=process.env.MICHAEL_VISUAL_MODEL||'openai/gpt-4.1';
const truth=JSON.parse(fs.readFileSync('michael/visual/owner-truth.json','utf8'));
const genome=JSON.parse(fs.readFileSync('michael/visual/genome.json','utf8'));
const state=JSON.parse(fs.readFileSync('michael/visual/state.json','utf8'));
let research='';try{research=fs.readFileSync('factory/memory/external-research.json','utf8').slice(-14000)}catch{}
const views=['front','three','side','rear','top'];
const image=(dir,v)=>({type:'image_url',image_url:{url:`data:image/png;base64,${fs.readFileSync(path.join(dir,`${v}.png`)).toString('base64')}`}});
const extract=t=>{let s=t.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]||t,a=s.indexOf('{'),b=s.lastIndexOf('}');if(a<0||b<a)throw Error('visual judge returned no JSON');return JSON.parse(s.slice(a,b+1))};
async function ask(content){
  if(!token)throw Error('no GitHub Models token');
  const res=await fetch('https://models.github.ai/inference/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify({model,temperature:.1,max_tokens:6500,messages:[{role:'system',content:'You are Michael Visual Engineer. Judge only visible fidelity of the rendered MJX 7303/Citroen C3 WRC twin. Owner truth is highest authority. Never request changes to dynamics, steering, camera presets, telemetry, controller logic or licensed mesh transform. Return strict JSON only.'},{role:'user',content}]})});
  const raw=await res.text();if(!res.ok)throw Error(`GitHub Models ${res.status}: ${raw.slice(0,1200)}`);return extract(JSON.parse(raw).choices?.[0]?.message?.content||'')
}
function pngStats(file){
  const p=PNG.sync.read(fs.readFileSync(file)),w=p.width,h=p.height,d=p.data;let minx=w,miny=h,maxx=0,maxy=0,redCount=0;
  for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const i=(y*w+x)*4,r=d[i],g=d[i+1],b=d[i+2];if(r>55&&r>g*1.35&&r>b*1.25){redCount++;minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y)}}
  if(redCount<80)return{valid:false,red:0,dark:0,white:0,yellow:0};
  minx=Math.max(0,minx-8);maxx=Math.min(w-1,maxx+8);miny=Math.max(0,miny-8);maxy=Math.min(h-1,maxy+8);
  let n=0,red=0,dark=0,white=0,yellow=0;
  for(let y=miny;y<=maxy;y+=2)for(let x=minx;x<=maxx;x+=2){const i=(y*w+x)*4,r=d[i],g=d[i+1],b=d[i+2];n++;if(r>55&&r>g*1.35&&r>b*1.25)red++;if(r<52&&g<58&&b<64)dark++;if(r>150&&g>150&&b>145&&Math.max(r,g,b)-Math.min(r,g,b)<55)white++;if(r>125&&g>72&&g<190&&b<90&&r>g*1.15)yellow++}
  return{valid:true,red:red/n,dark:dark/n,white:white/n,yellow:yellow/n,bbox:[minx,miny,maxx,maxy]};
}
function localAnalyze(dir){const s={};for(const v of views)s[v]=pngStats(path.join(dir,`${v}.png`));return s}
function localScore(s){
  if(!s.front.valid||!s.side.valid||!s.top.valid)return 0;
  const targets={frontDark:.19,sideDark:.15,sideYellow:.007,sideWhite:.045,topWhite:.16};
  const err=Math.abs(s.front.dark-targets.frontDark)*150+Math.abs(s.side.dark-targets.sideDark)*120+Math.abs(s.side.yellow-targets.sideYellow)*500+Math.abs(s.side.white-targets.sideWhite)*90+Math.abs(s.top.white-targets.topWhite)*90;
  return Math.max(0,Math.min(100,100-err));
}
function bounded(k,v){const [lo,hi]=genome.bounds[k],old=genome.parameters[k],max=(hi-lo)*(genome.maxStepFraction||.18);return Math.round(Math.max(old-max,Math.min(old+max,Math.max(lo,Math.min(hi,v))))*10000)/10000}
function localProposal(dir,why){const s=localAnalyze(dir),score=localScore(s),c={},d=[];
  if(s.front.dark<.17){c.grille_half_bottom=bounded('grille_half_bottom',genome.parameters.grille_half_bottom+.025);c.grille_half_top=bounded('grille_half_top',genome.parameters.grille_half_top+.02);c.grille_top_y=bounded('grille_top_y',genome.parameters.grille_top_y+.012);d.push('Front intake reads too body-colored; expand black grille authority.')}else if(s.front.dark>.28){c.grille_half_bottom=bounded('grille_half_bottom',genome.parameters.grille_half_bottom-.02);c.grille_half_top=bounded('grille_half_top',genome.parameters.grille_half_top-.015);d.push('Front dark mass is excessive; tighten grille authority.')}
  if(s.side.dark<.13){c.door_black_top=bounded('door_black_top',genome.parameters.door_black_top+.018);c.door_black_bottom=bounded('door_black_bottom',genome.parameters.door_black_bottom-.008);d.push('Side lower black insert is visually weak.')}else if(s.side.dark>.23){c.door_black_top=bounded('door_black_top',genome.parameters.door_black_top-.015);d.push('Side black insert is visually too dominant.')}
  if(s.side.yellow<.0045){c.skirt_y_top=bounded('skirt_y_top',genome.parameters.skirt_y_top+.008);d.push('Yellow skirt accent is underrepresented.')}
  if(!Object.keys(c).length){c.projector_black_outer_rx=bounded('projector_black_outer_rx',genome.parameters.projector_black_outer_rx-.006);d.push('Conservative pod refinement while color-mass targets are near range.')}
  return{score,subsystemScores:{front:Math.round((100-Math.abs(s.front.dark-.19)*250)*10)/10,side:Math.round((100-Math.abs(s.side.dark-.15)*220)*10)/10,rear:75,top:Math.round((100-Math.abs(s.top.white-.16)*180)*10)/10,stance:78,livery:Math.round((100-Math.abs(s.side.yellow-.007)*600)*10)/10},diagnosis:[...d,`Local deterministic vision fallback used: ${why}`],candidateParameters:c,rationale:['Bounded color-mass optimization against protected owner-truth proportions.'],localStats:s,fallback:true}}
function localVerdict(base,cand,why){const bs=localAnalyze(base),cs=localAnalyze(cand),b=localScore(bs),c=localScore(cs),gain=c-b,reg=[];if(!cs.front.valid||!cs.side.valid||!cs.top.valid)reg.push('Candidate render lost detectable red body silhouette');return{baselineScore:b,candidateScore:c,promote:gain>=1&&!reg.length,regressions:reg,improvements:gain>0?[`Deterministic owner-truth score improved ${gain.toFixed(2)} points`]:[],reason:`Local deterministic vision fallback used because ${why}`,fallback:true,baselineStats:bs,candidateStats:cs}}
async function robust(content,fallback){try{return await ask(content)}catch(e){console.warn('External visual judge unavailable; using deterministic fallback:',e.message);return fallback(e.message)}}
const mode=process.argv[2];
if(mode==='propose'){
  const dir=process.argv[3],out=process.argv[4]||'/tmp/michael-proposal.json';
  const content=[{type:'text',text:`OWNER TRUTH:\n${JSON.stringify(truth)}\n\nCURRENT VISUAL GENOME:\n${JSON.stringify(genome)}\n\nPERSISTENT STATE:\n${JSON.stringify(state)}\n\nRECENT EXTERNAL RESEARCH:\n${research}\n\nInspect the five renders. Score 0-100 and propose at most 6 conservative parameter values using only genome keys and bounds. Return {score,subsystemScores,diagnosis,candidateParameters,rationale}.`}];for(const v of views)content.push({type:'text',text:`VIEW ${v.toUpperCase()}`},image(dir,v));
  const result=await robust(content,e=>localProposal(dir,e));fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}else if(mode==='compare'){
  const base=process.argv[3],cand=process.argv[4],proposal=JSON.parse(fs.readFileSync(process.argv[5],'utf8')),out=process.argv[6]||'/tmp/michael-verdict.json';
  const content=[{type:'text',text:`OWNER TRUTH:\n${JSON.stringify(truth)}\n\nPROPOSED MUTATION:\n${JSON.stringify(proposal)}\n\nCompare BASELINE and CANDIDATE pairs. Return {baselineScore,candidateScore,promote,regressions,improvements,reason}. Candidate must be visibly closer and have no meaningful regression.`}];for(const v of views)content.push({type:'text',text:`${v.toUpperCase()} BASELINE`},image(base,v),{type:'text',text:`${v.toUpperCase()} CANDIDATE`},image(cand,v));
  const result=await robust(content,e=>localVerdict(base,cand,e));fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}else throw Error('usage: node tools/michael_visual_judge.mjs propose <renderDir> <out.json> | compare <baselineDir> <candidateDir> <proposal.json> <out.json>');

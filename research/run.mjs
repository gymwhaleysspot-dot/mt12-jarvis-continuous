#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const cfg=JSON.parse(fs.readFileSync('research/config.json','utf8'));
const questions=JSON.parse(fs.readFileSync('research/questions.json','utf8'));
const now=()=>new Date().toISOString();
const runId=`research-${Date.now()}`;
const token=process.env.GITHUB_TOKEN||'';
const requested=(process.env.RESEARCH_TOPIC||'').trim();
const model=process.env.RESEARCH_MODEL||cfg.primaryModel;
const open=questions.questions.filter(q=>q.status==='OPEN').sort((a,b)=>b.priority-a.priority);
const topic=requested||open[0]?.question||cfg.topics[0];
const queries=[topic,...cfg.topics.filter(x=>x!==topic).slice(0,4)];
const activity=[];
const sources=[];
const rejectedSources=[];
const seen=new Set();
const currentYear=new Date().getUTCFullYear();
const addActivity=(phase,message,extra={})=>activity.push({at:now(),phase,message,...extra});
const clean=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&[a-z]+;/gi,' ').replace(/\s+/g,' ').trim();
const key=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,20);
const words=s=>new Set(clean(s).toLowerCase().split(/[^a-z0-9+.-]+/).filter(x=>x.length>2));
const DOMAIN_TERMS=['vehicle','automotive','traction','wheelspin','wheel slip','slip ratio','anti-lock','abs','braking','airborne','jump','landing','inertial','imu','gps','gnss','rpm','wheel speed','sensor fusion','kalman','latency','delay compensation','dropout','fault detection','embedded','real-time','controller','control system','edge computing','lua','memory allocation','garbage collection','microcontroller','radio control','rc vehicle','telemetry','adaptive filtering','state estimation'];
const HARD_NOISE=['mosquito','stuttering','speech-language','air pollution','construction worker','plant extract','lucilia','building heritage','aluminum casting','covid-19','fintech','medical patient','cancer','drug','granules','public facility'];
function publishedYear(value){const m=String(value||'').match(/\b(19|20|21)\d{2}\b/);return m?Number(m[0]):null}
function relevance(source){
  if(source.kind==='release'&&source.provider==='GitHub')return{score:100,reason:'official engineering source'};
  const text=`${source.title||''} ${source.summary||''}`.toLowerCase();
  const qwords=words(source.query||topic);
  const twords=words(text);
  let queryHits=0;for(const w of qwords)if(twords.has(w))queryHits++;
  let domainHits=0;for(const term of DOMAIN_TERMS)if(text.includes(term))domainHits++;
  const noise=HARD_NOISE.filter(term=>text.includes(term));
  const year=publishedYear(source.published);
  if(year&&year>currentYear+1)return{score:-100,reason:`future publication year ${year}`};
  if(noise.length&&domainHits<2)return{score:-80,reason:`irrelevant domain: ${noise.slice(0,3).join(', ')}`};
  let score=domainHits*14+Math.min(30,queryHits*6);
  if(source.provider==='arXiv')score+=8;
  if(source.doi)score+=2;
  if((source.summary||'').length>200)score+=4;
  if(/radio.?master|edgetx|lua 5\.3|traction control|wheel slip|sensor fusion|vehicle dynamics|embedded controller/i.test(text))score+=28;
  return{score,reason:`domainHits=${domainHits}; queryHits=${queryHits}`};
}
function addSource(source){
  if(!source.url||!source.title)return;
  const id=key(source.url);if(seen.has(id))return;seen.add(id);
  const s={id,retrievedAt:now(),...source};
  const r=relevance(s);s.relevanceScore=r.score;s.relevanceReason=r.reason;
  const minimum=source.kind==='release'?0:24;
  if(r.score<minimum){rejectedSources.push({id,title:s.title,url:s.url,provider:s.provider,query:s.query,score:r.score,reason:r.reason});return}
  sources.push(s);
}
async function get(url,headers={}){const r=await fetch(url,{headers:{'User-Agent':'A17Y-Engineering-Research/4.0',Accept:'application/json, application/atom+xml, text/html;q=0.8',...headers}});if(!r.ok)throw Error(`${r.status} ${url}`);return r;}
async function arxiv(q){
  addActivity('SEARCH',`Searching arXiv: ${q}`);
  const u='https://export.arxiv.org/api/query?search_query=all:'+encodeURIComponent(q)+'&start=0&max_results=10&sortBy=relevance&sortOrder=descending';
  const text=await(await get(u)).text();
  for(const e of text.matchAll(/<entry>([\s\S]*?)<\/entry>/g)){
    const x=e[1],title=clean(x.match(/<title>([\s\S]*?)<\/title>/)?.[1]),url=x.match(/<id>(.*?)<\/id>/)?.[1],summary=clean(x.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]);
    addSource({kind:'paper',provider:'arXiv',title,url,summary,published:x.match(/<published>(.*?)<\/published>/)?.[1]||null,query:q});
  }
}
async function crossref(q){
  addActivity('SEARCH',`Searching Crossref: ${q}`);
  const u='https://api.crossref.org/works?rows=20&select=DOI,title,URL,abstract,container-title,published&query.bibliographic='+encodeURIComponent(q);
  const j=await(await get(u)).json();
  for(const x of j.message?.items||[])addSource({kind:'paper',provider:'Crossref',title:clean(x.title?.[0]),url:x.URL,summary:clean(x.abstract||x['container-title']?.[0]||''),published:x.published?.['date-parts']?.[0]?.join('-')||null,query:q,doi:x.DOI||null});
}
async function github(){
  addActivity('SEARCH','Checking official EdgeTX and Lua releases');
  const h=token?{Authorization:`Bearer ${token}`}:{};
  for(const repo of ['EdgeTX/edgetx','lua/lua']){
    try{const j=await(await get(`https://api.github.com/repos/${repo}/releases?per_page=5`,h)).json();for(const x of j)addSource({kind:'release',provider:'GitHub',title:`${repo} ${x.name||x.tag_name}`,url:x.html_url,summary:clean(x.body||''),published:x.published_at,query:'official releases'});}catch(e){addActivity('WARNING',`Release source unavailable: ${repo}`,{error:e.message});}
  }
}
for(const q of queries){
  try{await arxiv(q)}catch(e){addActivity('WARNING','arXiv query failed',{query:q,error:e.message})}
  try{await crossref(q)}catch(e){addActivity('WARNING','Crossref query failed',{query:q,error:e.message})}
}
await github();
sources.sort((a,b)=>b.relevanceScore-a.relevanceScore||String(b.published||'').localeCompare(String(a.published||'')));
const limited=sources.slice(0,cfg.maxSourcesPerRun);
addActivity('FILTER',`Accepted ${limited.length}; rejected ${rejectedSources.length} irrelevant or implausible sources`,{minimumRelevance:24});
function extractJson(t){const f=t.match(/```(?:json)?\s*([\s\S]*?)```/i);if(f)t=f[1];const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<a)throw Error('No JSON object');return JSON.parse(t.slice(a,b+1));}
async function synthesize(){
  if(!token||limited.length===0)return null;
  const digest=limited.map(s=>({id:s.id,title:s.title,url:s.url,provider:s.provider,published:s.published,relevanceScore:s.relevanceScore,summary:s.summary.slice(0,1200),query:s.query}));
  const prompt=`Research topic: ${topic}\nController context: RadioMaster MT12, EdgeTX Lua 5.3, A17Y embedded RC vehicle control, 87 KB normalized bytecode ceiling.\nOnly the prefiltered sources below may be cited. A source can still be rejected after semantic review.\nSources: ${JSON.stringify(digest)}\nReturn strict JSON with summary, acceptedFindings[], rejectedFindings[], conflicts[], newQuestions[], engineeringImpacts[]. Every accepted finding must contain claim, sourceIds, confidence 0..1, affectedSystems, testableHypothesis, and reason. Reject material that is not directly applicable to embedded vehicle sensing, control, runtime reliability, or the named hardware/software. Do not invent citations.`;
  const models=[model,...cfg.fallbackModels.filter(x=>x!==model)];
  for(const m of models)for(let attempt=1;attempt<=3;attempt++){
    addActivity('SYNTHESIS',`Model ${m}, attempt ${attempt}`);
    try{const r=await fetch('https://models.github.ai/inference/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({model:m,temperature:.08,max_tokens:9000,messages:[{role:'system',content:'You are a skeptical embedded vehicle-control research scientist. Irrelevant evidence must be rejected. Separate evidence from inference and cite only supplied IDs.'},{role:'user',content:prompt}]})});if(!r.ok)throw Error(`${r.status}: ${await r.text()}`);const j=await r.json();return{model:m,...extractJson(j.choices?.[0]?.message?.content||'')}}catch(e){addActivity('WARNING','Synthesis attempt failed',{model:m,attempt,error:e.message});await new Promise(r=>setTimeout(r,attempt*5000))}
  }
  return null;
}
const ai=await synthesize();
const validIds=new Set(limited.map(s=>s.id));
const accepted=(ai?.acceptedFindings||[]).filter(f=>Array.isArray(f.sourceIds)&&f.sourceIds.length&&f.sourceIds.every(id=>validIds.has(id))&&Number(f.confidence)>=0.55).slice(0,cfg.maxAcceptedPerRun);
const rejected=ai?.rejectedFindings||[];
const conflicts=(ai?.conflicts||[]).filter(c=>JSON.stringify(c).match(/[a-f0-9]{20}/));
const summary=limited.length?ai?.summary||`Collected ${limited.length} relevant sources; AI synthesis unavailable.`:'No relevant sources passed deterministic filtering; no engineering finding was accepted.';
const report={schema:2,runId,topic,startedAt:activity[0]?.at||now(),completedAt:now(),queries,sources:limited,sourceFiltering:{accepted:limited.length,rejected:rejectedSources.length,rejectedExamples:rejectedSources.slice(0,30),minimumScore:24},acceptedFindings:accepted,rejectedFindings:rejected,conflicts,newQuestions:ai?.newQuestions||[],engineeringImpacts:ai?.engineeringImpacts||[],summary,model:ai?.model||null,activity};
fs.mkdirSync('research/history',{recursive:true});
fs.writeFileSync('research/current.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(`research/history/${runId}.json`,JSON.stringify(report,null,2)+'\n');
const state={schema:2,status:'COMPLETE',phase:'COMPLETE',currentTopic:topic,startedAt:report.startedAt,updatedAt:now(),lastCompletedAt:report.completedAt,lastRunId:runId,sourcesRead:limited.length,sourcesRejected:rejectedSources.length,accepted:accepted.length,rejected:rejected.length,conflicts:conflicts.length,message:summary,recentActivity:activity.slice(-30)};
fs.writeFileSync('research/state.json',JSON.stringify(state,null,2)+'\n');
if(ai?.newQuestions?.length){const existing=new Set(questions.questions.map(q=>q.question.toLowerCase()));for(const x of ai.newQuestions){const text=typeof x==='string'?x:x.question;if(!text||existing.has(text.toLowerCase()))continue;questions.questions.push({id:`q-${key(text)}`,question:text,priority:Number(x.priority)||60,status:'OPEN',system:x.system||'research',createdAt:now(),evidence:x.sourceIds||[]});existing.add(text.toLowerCase())}fs.writeFileSync('research/questions.json',JSON.stringify(questions,null,2)+'\n')}
console.log(JSON.stringify({runId,topic,sources:limited.length,sourceNoiseRejected:rejectedSources.length,accepted:accepted.length,rejected:rejected.length,conflicts:conflicts.length,model:ai?.model||null},null,2));

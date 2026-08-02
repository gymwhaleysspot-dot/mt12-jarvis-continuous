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
const seen=new Set();
const addActivity=(phase,message,extra={})=>activity.push({at:now(),phase,message,...extra});
const clean=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const key=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,20);
const addSource=s=>{if(!s.url||!s.title)return;const id=key(s.url);if(seen.has(id))return;seen.add(id);sources.push({id,retrievedAt:now(),...s});};
async function get(url,headers={}){const r=await fetch(url,{headers:{'User-Agent':'A17Y-Engineering-Research/3.0',Accept:'application/json, application/atom+xml, text/html;q=0.8',...headers}});if(!r.ok)throw Error(`${r.status} ${url}`);return r;}
async function arxiv(q){addActivity('SEARCH',`Searching arXiv: ${q}`);const u='https://export.arxiv.org/api/query?search_query=all:'+encodeURIComponent(q)+'&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending';const text=await(await get(u)).text();for(const e of text.matchAll(/<entry>([\s\S]*?)<\/entry>/g)){const x=e[1],title=clean(x.match(/<title>([\s\S]*?)<\/title>/)?.[1]),url=x.match(/<id>(.*?)<\/id>/)?.[1],summary=clean(x.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]);addSource({kind:'paper',provider:'arXiv',title,url,summary,published:x.match(/<published>(.*?)<\/published>/)?.[1]||null,query:q});}}
async function crossref(q){addActivity('SEARCH',`Searching Crossref: ${q}`);const u='https://api.crossref.org/works?rows=5&sort=published&order=desc&query='+encodeURIComponent(q);const j=await(await get(u)).json();for(const x of j.message?.items||[]){addSource({kind:'paper',provider:'Crossref',title:clean(x.title?.[0]),url:x.URL,summary:clean(x.abstract||x['container-title']?.[0]||''),published:x.published?.['date-parts']?.[0]?.join('-')||null,query:q,doi:x.DOI||null});}}
async function github(){addActivity('SEARCH','Checking EdgeTX and Lua ecosystem releases');const h=token?{Authorization:`Bearer ${token}`}:{};for(const repo of ['EdgeTX/edgetx','lua/lua']){try{const j=await(await get(`https://api.github.com/repos/${repo}/releases?per_page=5`,h)).json();for(const x of j)addSource({kind:'release',provider:'GitHub',title:`${repo} ${x.name||x.tag_name}`,url:x.html_url,summary:clean(x.body||''),published:x.published_at,query:'official releases'});}catch(e){addActivity('WARNING',`Release source unavailable: ${repo}`,{error:e.message});}}}
for(const q of queries){try{await arxiv(q);}catch(e){addActivity('WARNING','arXiv query failed',{query:q,error:e.message});}try{await crossref(q);}catch(e){addActivity('WARNING','Crossref query failed',{query:q,error:e.message});}}
await github();
sources.sort((a,b)=>String(b.published||'').localeCompare(String(a.published||'')));
const limited=sources.slice(0,cfg.maxSourcesPerRun);
addActivity('READ',`Collected ${limited.length} unique cited sources`);
function extractJson(t){const f=t.match(/```(?:json)?\s*([\s\S]*?)```/i);if(f)t=f[1];const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<a)throw Error('No JSON object');return JSON.parse(t.slice(a,b+1));}
async function synthesize(){if(!token)return null;const sourceDigest=limited.map(s=>({id:s.id,title:s.title,url:s.url,provider:s.provider,published:s.published,summary:s.summary.slice(0,1200),query:s.query}));const prompt=`Research topic: ${topic}\nController context: RadioMaster MT12, EdgeTX Lua 5.3, A17Y embedded RC vehicle control, 87 KB normalized bytecode ceiling.\nSources: ${JSON.stringify(sourceDigest)}\nReturn strict JSON with summary, acceptedFindings[], rejectedFindings[], conflicts[], newQuestions[], engineeringImpacts[]. Every accepted finding must contain claim, sourceIds, confidence 0..1, affectedSystems, testableHypothesis, and reason. Reject unsupported or irrelevant material. Conflicts must name sourceIds on both sides. Do not invent citations.`;const models=[model,...cfg.fallbackModels.filter(x=>x!==model)];for(const m of models){for(let attempt=1;attempt<=3;attempt++){addActivity('SYNTHESIS',`Model ${m}, attempt ${attempt}`);try{const r=await fetch('https://models.github.ai/inference/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({model:m,temperature:.12,max_tokens:9000,messages:[{role:'system',content:'You are a skeptical embedded-control research scientist. Separate evidence from inference. Cite only supplied source IDs.'},{role:'user',content:prompt}]})});if(!r.ok)throw Error(`${r.status}: ${await r.text()}`);const j=await r.json();return{model:m,...extractJson(j.choices?.[0]?.message?.content||'')};}catch(e){addActivity('WARNING','Synthesis attempt failed',{model:m,attempt,error:e.message});await new Promise(r=>setTimeout(r,attempt*5000));}}}return null;}
const ai=await synthesize();
const validIds=new Set(limited.map(s=>s.id));
const accepted=(ai?.acceptedFindings||[]).filter(f=>Array.isArray(f.sourceIds)&&f.sourceIds.length&&f.sourceIds.every(id=>validIds.has(id))).slice(0,cfg.maxAcceptedPerRun);
const rejected=ai?.rejectedFindings||[];
const conflicts=(ai?.conflicts||[]).filter(c=>JSON.stringify(c).match(/[a-f0-9]{20}/));
const report={schema:1,runId,topic,startedAt:activity[0]?.at||now(),completedAt:now(),queries,sources:limited,acceptedFindings:accepted,rejectedFindings:rejected,conflicts,newQuestions:ai?.newQuestions||[],engineeringImpacts:ai?.engineeringImpacts||[],summary:ai?.summary||`Collected ${limited.length} sources; AI synthesis unavailable.`,model:ai?.model||null,activity};
fs.mkdirSync('research/history',{recursive:true});
fs.writeFileSync('research/current.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(`research/history/${runId}.json`,JSON.stringify(report,null,2)+'\n');
const state={schema:1,status:'COMPLETE',phase:'COMPLETE',currentTopic:topic,startedAt:report.startedAt,updatedAt:now(),lastCompletedAt:report.completedAt,lastRunId:runId,sourcesRead:limited.length,accepted:accepted.length,rejected:rejected.length,conflicts:conflicts.length,message:report.summary,recentActivity:activity.slice(-30)};
fs.writeFileSync('research/state.json',JSON.stringify(state,null,2)+'\n');
if(ai?.newQuestions?.length){const existing=new Set(questions.questions.map(q=>q.question.toLowerCase()));for(const x of ai.newQuestions){const text=typeof x==='string'?x:x.question;if(!text||existing.has(text.toLowerCase()))continue;questions.questions.push({id:`q-${key(text)}`,question:text,priority:Number(x.priority)||60,status:'OPEN',system:x.system||'research',createdAt:now(),evidence:x.sourceIds||[]});existing.add(text.toLowerCase());}fs.writeFileSync('research/questions.json',JSON.stringify(questions,null,2)+'\n');}
console.log(JSON.stringify({runId,topic,sources:limited.length,accepted:accepted.length,rejected:rejected.length,conflicts:conflicts.length,model:ai?.model||null},null,2));

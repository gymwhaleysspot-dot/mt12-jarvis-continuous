#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';

const root=process.cwd();
const contract=fs.readFileSync(path.join(root,'spec/master-ai-contract.md'),'utf8');
const acceptedDir=path.join(root,'generations/accepted');
const candidatesDir=path.join(root,'generations/candidates');
const reportsDir=path.join(root,'reports');
for(const d of [acceptedDir,candidatesDir,reportsDir]) fs.mkdirSync(d,{recursive:true});

function latestLua(dir){
  if(!fs.existsSync(dir)) return null;
  const files=fs.readdirSync(dir).filter(x=>x.endsWith('.lua')).sort();
  return files.length?path.join(dir,files.at(-1)):null;
}
function generation(){
  const n=fs.readdirSync(acceptedDir).filter(x=>x.endsWith('.lua')).length+1;
  return String(n).padStart(4,'0');
}
function parseJSON(text){
  const clean=text.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  const a=clean.indexOf('{'),b=clean.lastIndexOf('}');
  if(a<0||b<a) throw new Error('model did not return a JSON object');
  return JSON.parse(clean.slice(a,b+1));
}

const previous=latestLua(acceptedDir);
const previousSource=previous?fs.readFileSync(previous,'utf8'):'No accepted controller exists yet. Create Generation 1 from scratch.';
const recentReports=fs.readdirSync(reportsDir).filter(x=>x.endsWith('.txt')).sort().slice(-3).map(x=>fs.readFileSync(path.join(reportsDir,x),'utf8')).join('\n---\n')||'No previous reports.';
const model=process.env.OPENAI_MODEL||'gpt-5';
if(!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY secret is required');
const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
const gen=generation();
const prompt=`You are the Master AI Programmer for a RadioMaster MT12 running EdgeTX Lua 5.3.\n\n${contract}\n\nCURRENT ACCEPTED SOURCE:\n${previousSource}\n\nRECENT ENGINEERING REPORTS:\n${recentReports}\n\nBuild exactly one complete candidate named j${gen.slice(-3)}. It must be a full loadable EdgeTX controller, not pseudocode, placeholders, TODOs or omitted functions. Improve the accepted source measurably while preserving every working behavior. Keep deployed source compact and allocation-conscious. Do not use unsupported Lua libraries. Do not claim tests passed.\n\nReturn only JSON with keys: name, objective, lua_source, engineering_notes, expected_improvements, risks. lua_source must contain the complete source.`;

const response=await client.responses.create({model,input:prompt});
const data=parseJSON(response.output_text);
if(typeof data.lua_source!=='string'||data.lua_source.length<500) throw new Error('candidate source missing or implausibly small');
const safe=(data.name||`j${gen.slice(-3)}`).toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,6)||`j${gen.slice(-3)}`;
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const luaPath=path.join(candidatesDir,`${gen}-${safe}.lua`);
const metaPath=path.join(reportsDir,`${gen}-${safe}-model.txt`);
fs.writeFileSync(luaPath,data.lua_source.trimEnd()+'\n');
fs.writeFileSync(metaPath,[`generation=${gen}`,`name=${safe}`,`model=${model}`,`created=${new Date().toISOString()}`,`objective=${data.objective||''}`,`expected=${JSON.stringify(data.expected_improvements||[])}`,`risks=${JSON.stringify(data.risks||[])}`,'',data.engineering_notes||''].join('\n'));
fs.writeFileSync(path.join(root,'reports/latest-model.json'),JSON.stringify({...data,name:safe,generation:gen,created:stamp,lua_path:path.relative(root,luaPath)},null,2));
console.log(luaPath);

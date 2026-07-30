#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const reports=path.join(root,'reports');
const accepted=path.join(root,'generations','accepted');
const resultsPath=path.join(reports,'factory-results.tsv');
const minGain=Number(process.env.MIN_CHAMPION_GAIN||0.15);
const hardMargin=Number(process.env.MT12_HARD_MARGIN||48);
const reserveTarget=Number(process.env.MT12_RESERVE_TARGET||256);

const readJson=p=>{try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch{return null}};
const rows=fs.existsSync(resultsPath)?fs.readFileSync(resultsPath,'utf8').trim().split(/\r?\n/).filter(Boolean).map(line=>{
  const [pass,score,family,base,bytes='',margin='']=line.split('\t');
  return{pass:pass==='1',score:Number(score)||0,family,base,bytes:Number(bytes)||0,margin:Number(margin)||0};
}):[];

function acceptedCandidates(){
  if(!fs.existsSync(accepted))return[];
  return fs.readdirSync(accepted).filter(x=>x.endsWith('-changelog.json')).map(name=>{
    const j=readJson(path.join(accepted,name));
    if(!j)return null;
    const base=j.candidate||name.replace('-changelog.json','');
    const sim=readJson(path.join(reports,`${base}-sim.json`));
    return{base,score:Number(sim?.score??j.score??0),margin:Number(j.files?.luac?.margin??0),bytes:Number(j.files?.luac?.bytes??0)};
  }).filter(Boolean);
}

const acceptedRows=acceptedCandidates().sort((a,b)=>b.score-a.score);
const champion=acceptedRows[0]||{base:null,score:0,margin:hardMargin,bytes:0};
const parentMargin=champion.margin>0?champion.margin:hardMargin;
const requiredMargin=Math.max(hardMargin,Math.min(reserveTarget,parentMargin));

const evaluated=rows.map(x=>{
  const sim=readJson(path.join(reports,`${x.base}-sim.json`));
  const gate=readJson(path.join(reports,`${x.base}-changelog.json`));
  const regressions=sim?.regressions||[];
  const scoreGain=Number((x.score-champion.score).toFixed(3));
  const effectiveMargin=x.margin||Number(gate?.files?.luac?.margin||0);
  const reasons=[];
  if(!x.pass)reasons.push('build-gate');
  if(sim?.passed!==true)reasons.push('simulator');
  if(regressions.length)reasons.push(`regressions:${regressions.join(',')}`);
  if(scoreGain<minGain)reasons.push(`gain:${scoreGain}<${minGain}`);
  if(effectiveMargin<requiredMargin)reasons.push(`margin:${effectiveMargin}<${requiredMargin}`);
  return{...x,margin:effectiveMargin,scoreGain,reasons,eligible:reasons.length===0};
}).sort((a,b)=>b.score-a.score||b.margin-a.margin);

const selected=evaluated.find(x=>x.eligible)||null;
const decision={
  schema:1,
  champion,
  policy:{minGain,hardMargin,reserveTarget,requiredMargin},
  selected,
  candidates:evaluated,
  status:selected?'promote':'hold-champion',
  created:new Date().toISOString()
};
fs.writeFileSync(path.join(reports,'champion-decision.json'),JSON.stringify(decision,null,2));
if(selected){
  process.stdout.write(`${selected.score}\t${selected.family}\t${selected.base}\t${selected.margin}\n`);
}else{
  console.error(JSON.stringify(decision,null,2));
  process.exit(3);
}

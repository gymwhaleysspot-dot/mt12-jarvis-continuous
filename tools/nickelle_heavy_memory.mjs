import fs from 'node:fs';

const input=process.argv[2]||'/tmp/nickelle-heavy.json';
const out=process.argv[3]||'nickelle/heavy-memory.json';
const h=JSON.parse(fs.readFileSync(input,'utf8'));
const previous=fs.existsSync(out)?JSON.parse(fs.readFileSync(out,'utf8')):{schema:1,runs:0,history:[]};
const views=h.views||{},summary=h.summary||{};
const vehicleViews=Object.fromEntries(Object.entries(views).map(([k,v])=>[k,v?.segmentation?.groups?.vehicle||0]));
const depthViews=Object.fromEntries(Object.entries(views).map(([k,v])=>[k,{range:v?.depth?.range||0,edge:v?.depth?.edge||0,std:v?.depth?.std||0}]));
const confidence=Math.max(0,Math.min(1,(summary.consistency||0)*.55+Math.min(1,(summary.vehicleCoverage||0)/.12)*.30+Math.min(1,(summary.depthEdge||0)/.08)*.15));
const item={at:new Date().toISOString(),segmentationModel:h.segmentationModel,depthModel:h.depthModel,summary,vehicleViews,depthViews,confidence};
const result={schema:1,name:'Nickelle Heavy Vision Memory',runs:(previous.runs||0)+1,last:item,history:[...(previous.history||[]),item].slice(-12)};
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({runs:result.runs,confidence,summary},null,2));

#!/usr/bin/env node
import fs from'node:fs';import path from'node:path';
const file=process.argv[2];if(!file)throw Error('usage: node scripts/all-function-gate.mjs <candidate.lua>');
const root=process.cwd(),p=JSON.parse(fs.readFileSync(path.join(root,'reports/pending-factory.json'),'utf8')),base=path.basename(file,'.lua'),c=p.batch.find(x=>path.basename(x.file,'.lua')===base);if(!c)throw Error('candidate metadata missing');
const src=fs.readFileSync(file,'utf8'),names=[...new Set([...src.matchAll(/local function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)].map(m=>m[1]))],listed=new Set(c.rewrittenFunctions||[]),missing=names.filter(n=>!listed.has(n));
const report={candidate:base,engine:p.engine,allFunctionsRewritten:c.allFunctionsRewritten===true,aiArchitect:c.aiArchitect===true,sourceNamedFunctions:names.length,reportedRewrittenFunctions:listed.size,missing,passed:c.allFunctionsRewritten===true&&c.aiArchitect===true&&names.length>30&&missing.length===0&&listed.size>=names.length};
console.log(JSON.stringify(report,null,2));if(!report.passed)process.exit(2);
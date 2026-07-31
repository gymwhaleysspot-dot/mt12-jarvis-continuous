#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd();
const cfg=JSON.parse(fs.readFileSync(path.join(root,'spec/factory.json'),'utf8'));
const source=fs.readFileSync(path.join(root,cfg.source),'utf8');
const baseline=fs.readFileSync(path.join(root,cfg.baseline_source),'utf8');
const normalized=fs.readFileSync(path.join(root,cfg.normalized_output));
const checks={sourceNotEmpty:source.length>1000,baselinePresent:baseline.length>1000,carOffGuard:/car|arm|disarm|connected/i.test(source),globalVariableIO:source.includes('model.setGlobalVariable')&&source.includes('model.getGlobalVariable'),mt12FileRead:source.includes('io.read'),noMethodRead:!source.includes(':read('),runEntry:/function\s+run|run\s*=\s*function/.test(source),initEntry:/function\s+init|init\s*=\s*function/.test(source),sizePass:normalized.length<=cfg.size_limit};
const passed=Object.values(checks).every(Boolean);
const report={passed,checks,baselineBytes:Buffer.byteLength(baseline),candidateBytes:Buffer.byteLength(source),normalizedBytes:normalized.length,sha256:crypto.createHash('sha256').update(normalized).digest('hex')};
fs.writeFileSync(path.join(root,'dist/audit.json'),JSON.stringify(report,null,2)+'\n');
if(!passed){console.error(report);process.exit(1)}
console.log(JSON.stringify(report,null,2));

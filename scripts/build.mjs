#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const cfg=JSON.parse(fs.readFileSync(path.join(root,'spec/factory.json'),'utf8'));
const out=path.join(root,'dist');
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
const src=path.join(root,cfg.source);
if(!fs.existsSync(src)) throw new Error(`Missing source: ${cfg.source}`);
const text=fs.readFileSync(src,'utf8');
for(const token of cfg.required_tokens||[]) if(!text.includes(token)) throw new Error(`Contract token missing: ${token}`);
for(const token of cfg.forbidden_tokens||[]) if(text.includes(token)) throw new Error(`Forbidden token present: ${token}`);
execFileSync('luac5.3',['-p',src],{stdio:'inherit'});
const raw=path.join(root,cfg.raw_output);
const normalized=path.join(root,cfg.normalized_output);
execFileSync('luac5.3',['-s','-o',raw,src],{stdio:'inherit'});
execFileSync('node',[path.join(root,'toolchain/normalize_luac53_mt12.js'),raw,normalized],{stdio:'inherit'});
const b=fs.readFileSync(normalized);
if(b.length>cfg.size_limit) throw new Error(`Normalized LUAC ${b.length} exceeds ${cfg.size_limit}`);
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const report={factory:cfg.name,version:cfg.version,source:cfg.source,sourceBytes:Buffer.byteLength(text),sourceSha256:sha(Buffer.from(text)),rawBytes:fs.statSync(raw).size,normalizedBytes:b.length,normalizedSha256:sha(b),limit:cfg.size_limit,margin:cfg.size_limit-b.length,luaVersion:'5.3',normalized:true,passed:true,builtAt:new Date().toISOString()};
fs.writeFileSync(path.join(root,cfg.report_output),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(out,'SHA256SUMS'),`${report.normalizedSha256}  ${path.basename(normalized)}\n${report.sourceSha256}  ${path.basename(src)}\n`);
console.log(JSON.stringify(report,null,2));

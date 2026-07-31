#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const cfg=JSON.parse(fs.readFileSync(path.join(root,'spec/master-factory.json'),'utf8'));
const dist=path.join(root,cfg.output_root);
const reportPath=path.join(dist,'factory-report.json');
const hardLimit=cfg.radio_luac_limit||cfg.normalized_luac_limit;
const fail=m=>{throw new Error(`RELEASE REJECTED: ${m}`)};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const run=(cmd,args)=>execFileSync(cmd,args,{stdio:'pipe',maxBuffer:128*1024*1024});

if(!fs.existsSync(reportPath))fail('factory-report.json missing');
const report=JSON.parse(fs.readFileSync(reportPath,'utf8'));
if(report.status!=='verified-ai-release')fail(`factory status is ${report.status}`);
if(!report.winner?.name)fail('winner metadata missing');

const name=report.winner.name;
const source=path.join(dist,`${name}.lua`);
const candidate=path.join(dist,`${name}.luac`);
const deploy=path.join(dist,'DEPLOY.luac');
for(const p of [source,candidate,deploy])if(!fs.existsSync(p))fail(`${path.basename(p)} missing`);

const text=fs.readFileSync(source,'utf8');
if(/\dlocal\s+[A-Za-z_]/.test(text))fail('joined numeric initializer/local declaration detected');
if(/local\s+[A-Za-z_]\w*\s*=\s*[^;\n]+local\s+[A-Za-z_]/.test(text))fail('joined local declarations detected');
if(text.includes('local evABS=0local sessOn=false'))fail('known evABS/session syntax defect present');
if(text.includes(':read('))fail('MT12-incompatible fileHandle:read found');
if(!text.includes('io.read('))fail('MT12-compatible io.read(fileHandle,...) missing');
if(!/setgv\(7,1024\)/.test(text))fail('GV7=1024 pass-through guard missing');

run('luac5.3',['-p',source]);
const tmp=path.join(dist,'.release-verify');
fs.rmSync(tmp,{recursive:true,force:true});fs.mkdirSync(tmp,{recursive:true});
const raw=path.join(tmp,`${name}_raw.luac`),rebuilt=path.join(tmp,`${name}.luac`);
run('luac5.3',['-s','-o',raw,source]);
run('node',[path.join(root,'toolchain/normalize_luac53_mt12.js'),raw,rebuilt]);

const srcBytes=fs.readFileSync(source),candBytes=fs.readFileSync(candidate),depBytes=fs.readFileSync(deploy),rebBytes=fs.readFileSync(rebuilt);
if(!candBytes.equals(rebBytes))fail('included source does not reproduce included normalized LUAC byte-for-byte');
if(!depBytes.equals(candBytes))fail('DEPLOY.luac differs from winning normalized LUAC');
if(sha(srcBytes)!==report.winner.sourceSha256)fail('source SHA-256 differs from report');
if(sha(candBytes)!==report.winner.normalizedSha256)fail('LUAC SHA-256 differs from report');
if(candBytes.length!==report.winner.normalizedBytes)fail('LUAC byte count differs from report');
if(candBytes.length>hardLimit)fail(`LUAC exceeds physical limit: ${candBytes.length}`);
const margin=hardLimit-candBytes.length;
if(margin<(cfg.minimum_luac_margin||0))fail(`only ${margin} bytes margin; minimum is ${cfg.minimum_luac_margin}`);

const release=path.join(dist,'verified-release');
fs.rmSync(release,{recursive:true,force:true});fs.mkdirSync(release,{recursive:true});
for(const f of [`${name}.lua`,`${name}.luac`,'DEPLOY.luac','CHANGELOG.md','factory-report.json']){
 const p=path.join(dist,f);if(fs.existsSync(p))fs.copyFileSync(p,path.join(release,f));
}
const manifest={status:'independently-verified',name,sourceBytes:srcBytes.length,sourceSha256:sha(srcBytes),normalizedBytes:candBytes.length,normalizedSha256:sha(candBytes),deploySha256:sha(depBytes),physicalLimit:hardLimit,factoryAcceptanceLimit:cfg.normalized_luac_limit,margin,minimumMargin:cfg.minimum_luac_margin||0,reproducible:true,verifiedAt:new Date().toISOString()};
fs.writeFileSync(path.join(release,'VERIFIED-MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(release,'README.txt'),`${name} independently verified\nSource recompiles to the exact included normalized LUAC.\nDeploy only DEPLOY.luac.\nSize: ${candBytes.length} bytes\nPhysical-limit margin: ${margin} bytes\n`);
fs.rmSync(tmp,{recursive:true,force:true});
console.log(JSON.stringify(manifest,null,2));

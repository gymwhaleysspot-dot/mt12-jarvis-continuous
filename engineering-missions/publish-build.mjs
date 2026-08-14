#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const missionRoot=path.resolve(process.argv[2]);
const publicRoot=path.resolve(process.argv[3]||'public/builds');
const mission=JSON.parse(fs.readFileSync(path.join(missionRoot,'MISSION.json'),'utf8'));
const profile=mission.selectedCandidate;
if(!profile){console.log('No selected candidate; no public build published.');process.exit(0)}
const workbench=path.join(missionRoot,'tournament',profile,'workbench');
const source=path.join(workbench,'CHILD.lua');
const luac=path.join(workbench,'DEPLOY.luac');
const report=path.join(workbench,'REPORT.json');
if(!fs.existsSync(source)||!fs.existsSync(luac)||!fs.existsSync(report)){
  console.log(`Selected candidate ${profile} has no complete deploy files; no public build published.`);process.exit(0)
}
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const buildDir=path.join(publicRoot,mission.id);
fs.rmSync(buildDir,{recursive:true,force:true});fs.mkdirSync(buildDir,{recursive:true});
const copy=(src,name)=>{const dst=path.join(buildDir,name);fs.copyFileSync(src,dst);return dst};
const outSource=copy(source,'candidate.lua');
const outLuac=copy(luac,'candidate.luac');
const outReport=copy(report,'REPORT.json');
for(const name of ['IDENTITY.json','PROMOTION.txt','DIFF.json','CREW-CHIEF.txt']){
  const src=path.join(workbench,name);if(fs.existsSync(src))copy(src,name)
}
for(const name of ['MISSION.json','RELEASE.json','RELEASE-NOTES.md','BENCH-PACKAGE.json','TOURNAMENT-RESULT.json','ADVERSARIAL-REVIEW.json','AUDIT-MANIFEST.json']){
  const src=path.join(missionRoot,name);if(fs.existsSync(src))copy(src,name)
}
const wb=JSON.parse(fs.readFileSync(report,'utf8'));
const replayLogs=Number(wb.replayExecution?.executedLogs||0);
const replayPassed=replayLogs>0&&mission.releaseLadder?.find(x=>x.stage==='LOG_REPLAY_PASSED')?.passed===true;
const authority=replayPassed?'REPLAY_PASSED_BENCH_REQUIRED':'UNVERIFIED_DRIVE_CANDIDATE';
const status={schema:1,mission:mission.id,profile,authority,automaticPromotion:false,benchRequired:true,roadRequired:true,createdAt:new Date().toISOString(),source:{file:'candidate.lua',sha256:sha(outSource),bytes:fs.statSync(outSource).size},luac:{file:'candidate.luac',sha256:sha(outLuac),bytes:fs.statSync(outLuac).size,format:'MT12 normalized Lua 5.3'},replay:{logs:replayLogs,passed:replayPassed},warnings:['Experimental candidate. Keep the current trusted LUAC available for immediate rollback.','A successful drive does not promote this build; upload the resulting radio and blackbox logs for parent-versus-candidate evaluation.']};
fs.writeFileSync(path.join(buildDir,'STATUS.json'),JSON.stringify(status,null,2)+'\n');
const files=fs.readdirSync(buildDir).filter(n=>fs.statSync(path.join(buildDir,n)).isFile()).sort();
fs.writeFileSync(path.join(buildDir,'SHA256SUMS.txt'),files.map(n=>`${sha(path.join(buildDir,n))}  ${n}`).join('\n')+'\n');
fs.mkdirSync(publicRoot,{recursive:true});
const indexPath=path.join(publicRoot,'index.json');let index={schema:1,updatedAt:null,builds:[]};try{index=JSON.parse(fs.readFileSync(indexPath,'utf8'))}catch{}
index.schema=1;index.updatedAt=new Date().toISOString();index.builds=[{mission:mission.id,profile,authority,createdAt:status.createdAt,sourceSha256:status.source.sha256,luacSha256:status.luac.sha256,luacBytes:status.luac.bytes,replayLogs,base:`public/builds/${mission.id}/`},...(index.builds||[]).filter(x=>x.mission!==mission.id)].slice(0,100);
fs.writeFileSync(indexPath,JSON.stringify(index,null,2)+'\n');
console.log(JSON.stringify(status,null,2));

#!/usr/bin/env node
import fs from 'node:fs';
const file=process.argv[2];
if(!file) throw new Error('usage: node scripts/static-gate.mjs <candidate.lua>');
const s=fs.readFileSync(file,'utf8');
const checks={
 edgeTxReturn:/return\s*\{[\s\S]*init\s*=[\s\S]*run\s*=[\s\S]*background\s*=/.test(s),
 gvarWrite:/model\.setGlobalVariable/.test(s),
 tct1024:/1024/.test(s),
 truthSpeed:/truth|mph/i.test(s),
 rpm:/rpm/i.test(s),
 tc:/traction|\btc\b/i.test(s),
 abs:/\babs\b|lock/i.test(s),
 gyro:/gyro|gyr/i.test(s),
 failOpen:/fail.?open|tct\s*=\s*1024|return\s+1024/i.test(s),
 clamp:/clamp/.test(s),
 carGuard:/car.?off|armed|connected|startup|stage/i.test(s)
};
const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
const report={file,bytes:Buffer.byteLength(s),checks,passed:failed.length===0,failed};
console.log(JSON.stringify(report,null,2));
if(failed.length) process.exit(2);

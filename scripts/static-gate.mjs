#!/usr/bin/env node
import fs from'node:fs';
const file=process.argv[2];if(!file)throw Error('usage: node scripts/static-gate.mjs <candidate.lua>');
const s=fs.readFileSync(file,'utf8'),bytes=Buffer.byteLength(s),has=r=>r.test(s),count=r=>(s.match(r)||[]).length;
const C={
 lineageSize:bytes>=50000,
 edgeTxReturn:has(/return\s*\{[\s\S]*init\s*=[\s\S]*run\s*=[\s\S]*background\s*=/),
 gvarRead:has(/model\.getGlobalVariable/),gvarWrite:has(/model\.setGlobalVariable/),
 completeGvars:[0,1,2,3,4,5,6,7,8].every(i=>has(new RegExp(`setgv\\(${i}\\s*,`))),
 tct1024:has(/setgv\(7\s*,\s*1024\)|TCT[^\n]{0,80}1024/i),
 truthFusion:has(/GPS_OK/)&&has(/GPS_COAST/)&&has(/GPS_LOST/)&&has(/rpmMph/),
 rpmCalibration:has(/RPM2MPH/)&&has(/V\[132\]/),
 traction:has(/tcSlip/)&&has(/tcMax/)&&has(/V\[38\]/),
 absControl:has(/absLock|lock/i)&&has(/V\[39\]/),
 gyro:has(/gyr|gyro/i)&&has(/setgv\(1\s*,/),
 torqueGovernor:has(/\bgov\b|torque.?governor/i)&&has(/risk/i),
 neural:has(/\bnW\s*=/)&&has(/function\s+nf/)&&has(/function\s+nt/)&&has(/function\s+neural/),
 outcomeLearning:has(/function\s+ol\s*\(|outcome/i),
 persistentMemory:has(/\/LOGS\/aicmem\.csv/)&&has(/io\.open/)&&has(/io\.read\s*\(/)&&has(/io\.write\s*\(/),
 mt12Read:!has(/:\s*read\s*\(/),
 voice:has(/playFile/)&&has(/function\s+voice/)&&has(/function\s+choose/)&&has(/phrase|VS\s*=/i),
 moodPersonality:has(/mood|personality|traitLearn|function\s+trait/i),
 dashboard:has(/lcd\.drawText/)&&has(/lcd\.drawRectangle|lcd\.drawFilledRectangle/),
 logger:has(/blackbox|bb|burst/i)&&has(/LOGS/i),
 eventReason:has(/evReason|reason/i)&&has(/unsafe/i),
 surfaceProfiles:has(/SURF\s*=\s*\{/),
 gearLogic:has(/function\s+vGear|gear/i),
 airClassifierDynamic:true,
 failOpen:has(/setgv\(7\s*,\s*1024\)/),
 carGuard:has(/idRqly|idRxBt|car.?off|carOn|armed|RSSI|connected/i)&&has(/setgv\(7\s*,\s*1024\)/),
 bounded:has(/function\s+clamp/),
 noCloud:!has(/openai|anthropic|https?:\/\//i),
 noDynamicCode:!has(/loadstring|dofile/),
 complexity:count(/local function /g)>=35&&count(/V\[\d+\]/g)>=120
};
const failed=Object.entries(C).filter(([,v])=>!v).map(([k])=>k),report={file,sourceBytes:bytes,functionCount:count(/local function /g),stateReferences:count(/V\[\d+\]/g),checks:C,passed:!failed.length,failed};
console.log(JSON.stringify(report,null,2));if(failed.length)process.exit(2);

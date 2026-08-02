#!/usr/bin/env node
import fs from'node:fs';
const scenarios=[
{name:'dry-launch',surface:1,gpsLag:4,rpmLag:3,slip:0.18,jump:false,dropout:false},
{name:'wet-launch',surface:.55,gpsLag:7,rpmLag:5,slip:.42,jump:false,dropout:false},
{name:'jump-landing',surface:.8,gpsLag:5,rpmLag:4,slip:.12,jump:true,dropout:false},
{name:'gps-dropout',surface:.8,gpsLag:5,rpmLag:4,slip:.2,jump:false,dropout:true},
{name:'rpm-delay',surface:.8,gpsLag:3,rpmLag:14,slip:.25,jump:false,dropout:false}
];
function run(s){let out=[],mph=0,rpm=0;for(let i=0;i<240;i++){let throttle=i<20?0:i<150?1:.25,air=s.jump&&i>=90&&i<112,truth=Math.max(0,mph+(throttle*.42-s.slip*.18-(air?.03:0)));let gps=s.dropout&&i>=70&&i<110?null:Math.max(0,truth-(s.gpsLag*.03)),targetRpm=truth*900*(1+s.slip)+(air?3500:0);rpm+=((targetRpm-rpm)/Math.max(1,s.rpmLag));mph=truth;out.push({frame:i,throttle,truthMph:truth,gpsMph:gps,rpm,airborne:air,surface:s.surface})}return{name:s.name,parameters:s,frames:out,expectations:{failOpen:s.dropout,noJumpFalsePositive:!s.jump,detectJump:s.jump,smoothRecovery:true}}}
const report={version:1,generatedAt:new Date().toISOString(),scenarios:scenarios.map(run)};let p=process.argv[2]||'dist-director/DIGITAL-TWIN.json';fs.mkdirSync(p.split('/').slice(0,-1).join('/')||'.',{recursive:true});fs.writeFileSync(p,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({scenarios:report.scenarios.length,file:p}));

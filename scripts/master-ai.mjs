#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(),A=path.join(root,'generations/accepted'),C=path.join(root,'generations/candidates'),R=path.join(root,'reports');
for(const d of [A,C,R])fs.mkdirSync(d,{recursive:true});
const statePath=path.join(R,'hand-ai-state.json');
const defaults={cycle:0,seed:7303,best:null,params:{rpm2mph:.000914,tcSlip:25,tcSpan:24,tcCut:330,absLock:7200,gyrBase:120,gyrMax:460,truthRate:.45,trustRate:.04,coast:.985},history:[]};
let S=fs.existsSync(statePath)?{...defaults,...JSON.parse(fs.readFileSync(statePath,'utf8'))}:defaults;
S.cycle++;
function rnd(){S.seed=(S.seed*1664525+1013904223)>>>0;return S.seed/4294967296}
const objectives=['truth-lag','traction-smoothness','abs-release','gyro-stability','dropout-safety','memory-size'];
const objective=objectives[(S.cycle-1)%objectives.length];
const step={rpm2mph:.000003,tcSlip:.35,tcSpan:.4,tcCut:3,absLock:30,gyrBase:1,gyrMax:2,truthRate:.004,trustRate:.002,coast:.0003};
const keyMap={
 'truth-lag':['truthRate','trustRate','coast','rpm2mph'],
 'traction-smoothness':['tcSlip','tcSpan','tcCut'],
 'abs-release':['absLock'],
 'gyro-stability':['gyrBase','gyrMax'],
 'dropout-safety':['trustRate','coast'],
 'memory-size':['tcSpan','truthRate']
};
const p={...S.params};for(const k of keyMap[objective])p[k]+=(rnd()>.5?1:-1)*step[k];
p.rpm2mph=Math.max(.00075,Math.min(.0011,p.rpm2mph));p.tcSlip=Math.max(10,Math.min(45,p.tcSlip));p.tcSpan=Math.max(12,Math.min(40,p.tcSpan));p.tcCut=Math.max(180,Math.min(430,p.tcCut));p.absLock=Math.max(6000,Math.min(9000,p.absLock));p.gyrBase=Math.max(80,Math.min(220,p.gyrBase));p.gyrMax=Math.max(300,Math.min(520,p.gyrMax));p.truthRate=Math.max(.2,Math.min(.7,p.truthRate));p.trustRate=Math.max(.01,Math.min(.12,p.trustRate));p.coast=Math.max(.96,Math.min(.999,p.coast));
const n=String(S.cycle).padStart(4,'0'),name=`j${n.slice(-3)}`;
const f=x=>Number(x).toFixed(6).replace(/0+$/,'').replace(/\.$/,'');
const lua=`--${name} hand-built MT12 Jarvis cycle ${S.cycle}\n-- objective:${objective}\nlocal abs,min,max,floor=math.abs,math.min,math.max,math.floor\nlocal V=setmetatable({},{__index=function()return 0 end})\nlocal function cl(x,a,b)if x<a then return a elseif x>b then return b end return x end\nlocal function val(x,d)local v=getValue(x);if type(v)~='number'or v~=v then return d or 0 end return v end\nlocal function gv(i,v)model.setGlobalVariable(i,0,floor(cl(v,-1024,1024)+.5))end\nlocal function init()V[10]=${f(p.rpm2mph)};V[11]=${f(p.tcSlip)};V[12]=${f(p.tcSpan)};V[13]=${f(p.tcCut)};V[14]=${f(p.absLock)};V[15]=${f(p.gyrBase)};V[16]=${f(p.gyrMax)};V[17]=${f(p.truthRate)};V[18]=${f(p.trustRate)};V[19]=${f(p.coast)};V[20]=1024 end\nlocal function sense()local g=val('GSpd',val('GPS',0)),r=val('RPM',0),s=val('Sats',0),rm=r*V[10],q=s>=5 and 1 or s>=4 and .55 or .2;V[1]=V[1]+(q-V[1])*V[18];local t;if q>.8 then t=g+cl(rm-g,0,8)*.45 elseif rm>1 then t=rm*.98 else t=V[2]*V[19] end;V[2]=V[2]+(cl(t,0,120)-V[2])*V[17];V[3]=r;V[4]=g;return V[2],r,q end\nlocal function brain(mph,rpm,q)local th=val('thr',0),st=val('ste',0),sl=max(0,rpm*V[10]-mph),tc=0,lk=0;if th>120 and mph>1 then tc=cl((sl-V[11])/V[12],0,1)end;if th<-80 and mph>4 then lk=cl((V[14]-rpm)/V[14],0,1)end;local risk=max(tc,lk)*(1-q*.25),tct=1024-floor(tc*V[13]);if q<.2 then tct=1024 end;local gyr=cl(V[15]+abs(st)*.05+tc*90-lk*25,80,V[16]);gv(7,tct);gv(1,gyr);gv(8,50+risk*40);V[30]=tc;V[31]=lk;V[32]=risk;V[33]=sl end\nlocal function run()local m,r,q=sense();brain(m,r,q);return 0 end\nlocal function background()run()end\nreturn{init=init,run=run,background=background}\n`;
const file=path.join(C,`${n}-${name}.lua`);fs.writeFileSync(file,lua);
S.params=p;S.history.push({cycle:S.cycle,name,objective,params:p,created:new Date().toISOString()});S.history=S.history.slice(-100);fs.writeFileSync(statePath,JSON.stringify(S,null,2));
fs.writeFileSync(path.join(R,`${n}-${name}-hand-ai.txt`),`engine=hand-built deterministic\ncycle=${S.cycle}\nname=${name}\nobjective=${objective}\nmutation=${JSON.stringify(keyMap[objective])}\nparams=${JSON.stringify(p)}\nsource=${path.relative(root,file)}\n`);
console.log(file);

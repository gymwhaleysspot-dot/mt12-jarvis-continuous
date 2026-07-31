#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const specPath=process.argv[2];
if(!specPath)throw new Error('Usage: node scripts/scratch-lua-generator.mjs <spec.json>');
const s=JSON.parse(fs.readFileSync(specPath,'utf8'));
const clean=x=>String(x??'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,6).toLowerCase();
const name=clean(s.name)||'mtapp';
const category=String(s.category||'dashboard');
const mission=String(s.mission||'General MT12 utility').replace(/[\r\n]+/g,' ').slice(0,240);
const sensors=Array.isArray(s.sensors)?s.sensors:[];
const outputs=Array.isArray(s.outputs)?s.outputs:[];
const features=new Set(Array.isArray(s.features)?s.features:[]);
const outDir=path.resolve(s.outDir||'generations/scratch');
fs.mkdirSync(outDir,{recursive:true});

const q=v=>JSON.stringify(String(v));
const sensorDefs=sensors.map((x,i)=>`{n=${q(x.name||('S'+(i+1)))},u=${q(x.unit||'')},d=${Number(x.default)||0}}`).join(',');
const outputDefs=outputs.map((x,i)=>`{g=${Math.max(0,Math.min(8,Number(x.gvar??i)))},a=${Number(x.min??0)},b=${Number(x.max??1024)},d=${Number(x.default??0)}}`).join(',');

const modeCode={
 dashboard:`local function logic()\n  for i=1,#SN do SV[i]=readSensor(SN[i]) end\nend`,
 logger:`local function logic()\n  for i=1,#SN do SV[i]=readSensor(SN[i]) end\n  if armed and tick%LOG_DIV==0 then logRow() end\nend`,
 alarm:`local function logic()\n  for i=1,#SN do SV[i]=readSensor(SN[i]) end\n  local alarm=false\n  for i=1,#SV do if math.abs(SV[i])>alarmLimit then alarm=true end end\n  state=alarm and 2 or 1\n  if alarm and not alarmLatch then playTone(1200,180,0,PLAY_NOW);alarmLatch=true elseif not alarm then alarmLatch=false end\nend`,
 mixer:`local function logic()\n  local x=gv(0);local y=gv(1);local mix=clamp((x+y)*.5,0,1024)\n  setgv(2,mix);state=1\nend`,
 crawler:`local function logic()\n  local th=input('thr');local st=input('ail');local crawl=clamp(math.abs(th)/1024,0,1)\n  local assist=clamp((1-crawl)*math.abs(st)/1024*420,0,420)\n  setgv(0,1024-assist);setgv(1,assist);state=1\nend`,
 lap:`local function logic()\n  for i=1,#SN do SV[i]=readSensor(SN[i]) end\n  local trig=switch('SH')\n  if trig and not lastTrig then local now=getTime();if lapStart>0 then lastLap=(now-lapStart)/100 end;lapStart=now;laps=laps+1 end\n  lastTrig=trig;state=1\nend`,
 rally:`local function logic()\n  for i=1,#SN do SV[i]=readSensor(SN[i]) end\n  local mph=SV[1] or 0;local rpm=SV[2] or 0;local th=input('thr')\n  local est=rpm*RPM2MPH;local slip=math.max(0,est-mph);local cut=clamp((slip-slipTarget)*18,0,420)\n  if th<40 or mph<1 then cut=0 end\n  setgv(7,1024-cut);setgv(8,cut>0 and 1 or 0);state=cut>0 and 2 or 1\nend`,
 custom:`local function logic()\n  for i=1,#SN do SV[i]=readSensor(SN[i]) end\n  local sum=0;for i=1,#SV do sum=sum+SV[i] end\n  customValue=#SV>0 and sum/#SV or 0\n  state=armed and 1 or 0\nend`
};
const logic=modeCode[category]||modeCode.custom;
const hasLogger=features.has('logger')||category==='logger';
const hasMemory=features.has('memory');
const hasVoice=features.has('voice');
const hasPages=features.has('pages');

const lua=`-- ${name}: complete MT12 EdgeTX Lua generated from scratch\n-- Mission: ${mission}\nlocal APP=${q(name.toUpperCase())}\nlocal SN={${sensorDefs}}\nlocal OD={${outputDefs}}\nlocal SV={}\nlocal IDs={}\nlocal tick,state,armed=0,0,false\nlocal page=1\nlocal LOG_DIV=10\nlocal LOG_PATH=${q('/LOGS/'+name+'.csv')}\nlocal MEM_PATH=${q('/LOGS/'+name+'mem.csv')}\nlocal logFile,headerDone=nil,false\nlocal alarmLimit=${Number(s.alarmLimit)||100}\nlocal alarmLatch=false\nlocal lapStart,lastLap,laps,lastTrig=0,0,0,false\nlocal customValue=0\nlocal RPM2MPH=${Number(s.rpm2mph)||0.000914}\nlocal slipTarget=${Number(s.slipTarget)||25}\nlocal function clamp(x,a,b)if x<a then return a elseif x>b then return b else return x end end\nlocal function input(n)local ok,v=pcall(getValue,n);return ok and type(v)=='number' and v or 0 end\nlocal function switch(n)local ok,v=pcall(getValue,n);return ok and (v==true or type(v)=='number' and v>0) or false end\nlocal function gv(i)local ok,v=pcall(model.getGlobalVariable,i,0);return ok and type(v)=='number' and v or 0 end\nlocal function setgv(i,v)pcall(model.setGlobalVariable,i,0,math.floor(clamp(v,-1024,1024)+.5))end\nlocal function readSensor(d)local id=IDs[d.n];if id==nil then local f=getFieldInfo(d.n);id=f and f.id or false;IDs[d.n]=id end;if not id then return d.d end;local ok,v=pcall(getValue,id);return ok and type(v)=='number' and v or d.d end\nlocal function closeLog()if logFile then pcall(io.close,logFile);logFile=nil end end\nlocal function logRow()\n if not logFile then logFile=io.open(LOG_PATH,'a');if not logFile then return end end\n if not headerDone then local h={'tick','state'};for i=1,#SN do h[#h+1]=SN[i].n end;io.write(logFile,table.concat(h,',')..'\\n');headerDone=true end\n local r={tick,state};for i=1,#SV do r[#r+1]=SV[i] end;io.write(logFile,table.concat(r,',')..'\\n')\nend\nlocal function loadMem()\n local f=io.open(MEM_PATH,'r');if not f then return end;local row=io.read(f,256);pcall(io.close,f);if not row then return end\n local a,b,c=string.match(row,'([^,]+),([^,]+),([^,]+)');page=clamp(tonumber(a) or 1,1,3);slipTarget=clamp(tonumber(b) or slipTarget,1,99);alarmLimit=tonumber(c) or alarmLimit\nend\nlocal function saveMem()local f=io.open(MEM_PATH,'w');if f then io.write(f,page..','..slipTarget..','..alarmLimit..'\\n');pcall(io.close,f)end end\n${logic}\nlocal function drawBar(y,label,v,a,b)lcd.drawText(2,y,label,SMLSIZE);lcd.drawRectangle(42,y+1,82,7);local w=math.floor(clamp((v-a)/(b-a),0,1)*80);if w>0 then lcd.drawFilledRectangle(43,y+2,w,5)end;lcd.drawNumber(127,y,v,SMLSIZE+RIGHT)end\nlocal function refresh(e)\n lcd.clear();lcd.drawText(2,0,APP,MIDSIZE);lcd.drawText(127,1,state==0 and 'IDLE' or state==1 and 'RUN' or 'ACTIVE',SMLSIZE+RIGHT)\n if ${hasPages and 'true' or 'false'} and e==EVT_PAGE_BREAK then page=page%3+1 end\n if page==1 then for i=1,math.min(#SN,6) do drawBar(10+i*8,SN[i].n,SV[i] or 0,0,math.max(1,math.abs(SV[i] or 100))) end\n elseif page==2 then lcd.drawText(2,14,'Mission',SMLSIZE);lcd.drawText(2,24,${q(mission.slice(0,34))},SMLSIZE);lcd.drawText(2,36,'Lap '..laps..'  '..string.format('%.2f',lastLap),SMLSIZE);lcd.drawText(2,48,'Custom '..string.format('%.1f',customValue),SMLSIZE)\n else lcd.drawText(2,14,'Outputs',SMLSIZE);for i=1,math.min(#OD,5) do lcd.drawText(2,14+i*9,'GV'..(OD[i].g+1)..' '..gv(OD[i].g),SMLSIZE) end end\nend\nlocal function init()\n tick=0;state=0;armed=false;${hasMemory?'loadMem()':''}\n for i=1,#OD do setgv(OD[i].g,OD[i].d) end\nend\nlocal function run(e)\n tick=tick+1;armed=switch('SA') or input('thr')~=0\n if not armed then state=0;closeLog();for i=1,#OD do setgv(OD[i].g,OD[i].d) end;refresh(e);return 20 end\n logic();${hasVoice?"if state==2 and tick%100==1 then playTone(900,100,0,PLAY_NOW) end":""}\n refresh(e);return 20\nend\nlocal function background()tick=tick+1;if armed then logic() end end\nlocal function destroy()closeLog();${hasMemory?'saveMem()':''}end\nreturn{init=init,run=run,background=background,destroy=destroy}\n`;

const file=path.join(outDir,name+'.lua');
fs.writeFileSync(file,lua);
fs.writeFileSync(path.join(outDir,name+'-spec.json'),JSON.stringify({...s,name,generated:new Date().toISOString()},null,2));
console.log(file);

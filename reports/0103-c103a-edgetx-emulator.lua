local realio=io
SMLSIZE=1;MIDSIZE=2;DBLSIZE=4;INVERS=8;BLINK=16;RIGHT=32;CENTER=64;PREC1=128;PREC2=256;LCD_W=128;LCD_H=64
local now=0;local killed=false;local gv={};local vals={RPM=0,GSpd=0,Sats=0,RxBt=0,RQly=0,ST=0,TH=0};local files={};local writes={};local sounds={};local lcdCalls=0
local function resetRuntime()now=0;killed=false;gv={};vals={RPM=0,GSpd=0,Sats=0,RxBt=0,RQly=0,ST=0,TH=0};writes={};sounds={};lcdCalls=0 end
function getTime()return now end
function getFieldInfo(n)return{id=n,name=n}end
function getValue(n)local v=vals[n]or vals[tostring(n)];if type(v)=='function'then return v(now)end;return v or 0 end
model={getGlobalVariable=function(i,f)return gv[i]or 0 end,setGlobalVariable=function(i,f,v)gv[i]=v end}
lcd=setmetatable({clear=function()lcdCalls=lcdCalls+1 end,getWindowSize=function()return LCD_W,LCD_H end},{__index=function()return function()lcdCalls=lcdCalls+1 end end})
function playFile(x)sounds[#sounds+1]=x end;function playNumber(x,u)sounds[#sounds+1]=tostring(x)end
local H={};H.__index=H
function H:read(n)return io.read(self,n)end;function H:write(...)return io.write(self,...)end;function H:close()return io.close(self)end
io.open=function(p,m)local mode=m or'r';if mode:find('r')and files[p]==nil then return nil end;return setmetatable({path=p,mode=mode,pos=1,buf=mode:find('a')and(files[p]or'')or''},H)end
io.read=function(f,n)if type(f)~='table'then return nil end;local s=files[f.path]or f.buf or'';if n=='*a'then local r=s:sub(f.pos);f.pos=#s+1;return r end;n=tonumber(n)or #s;local r=s:sub(f.pos,f.pos+n-1);f.pos=f.pos+#r;return #r>0 and r or nil end
io.write=function(f,...)if type(f)~='table'then return nil end;local a={...};for i=1,#a do f.buf=f.buf..tostring(a[i])end;files[f.path]=f.buf;writes[f.path]=f.buf;return true end
io.close=function(f)if type(f)=='table'then files[f.path]=f.buf or files[f.path];f.closed=true;return true end end
local function loadController()local ok,m=pcall(dofile,"/home/runner/work/mt12-jarvis-continuous/mt12-jarvis-continuous/generations/candidates/0103-c103a.lua");if not ok then return nil,'load:'..tostring(m)end;if type(m)~='table'then return nil,'module-return'end;return m end
local function call(m,k,...)if killed then return false,'killed'end;if type(m[k])~='function'then return true end;local ok,e=pcall(m[k],...);if not ok then killed=true;return false,k..':'..tostring(e)end;return true end
local function frame(m,n)for i=1,n do now=now+3;local ok,e=call(m,'run',0);if not ok then return false,e end;if i%6==0 then ok,e=call(m,'background');if not ok then return false,e end end end;return true end
local results={};local function scenario(name,seed,steps)resetRuntime();files['/LOGS/aicmem.csv']=seed;local m,e=loadController();if not m then results[#results+1]={name=name,passed=false,error=e};return end;local ok;ok,e=call(m,'init');if ok then ok,e=steps(m)end;results[#results+1]={name=name,passed=ok,error=e,tct=gv[7],gyr=gv[1],lcd=lcdCalls,sounds=#sounds,wrote=writes['/LOGS/aicmem.csv']~=nil,writeBytes=#(writes['/LOGS/aicmem.csv']or'')} end
scenario('missing-memory',nil,function(m)assert(frame(m,8));return call(m,'draw',0,0)end)
scenario('truncated-memory','AIC9Z,18,24,50,xx',function(m)assert(frame(m,8));return true end)
scenario('valid-memory','AIC9Z,18,24,'..string.rep('50,',80)..'151,0,500,'..string.rep('0,',43)..'152,'..string.rep('55555,',10)..'505050,505050,505050',function(m)assert(frame(m,10));return true end)
scenario('car-off',nil,function(m)vals.RxBt=0;vals.RQly=0;local ok,e=frame(m,20);if not ok then return false,e end;if(gv[7]or 1024)<1000 then return false,'car-off-not-fail-open'end;return true end)
scenario('car-on-drive',nil,function(m)vals.RxBt=7.8;vals.RQly=100;vals.Sats=9;vals.TH=850;vals.RPM=24000;vals.GSpd=18;local ok,e=frame(m,80);if not ok then return false,e end;return call(m,'draw',18,24000)end)
scenario('telemetry-dropout',nil,function(m)vals.RxBt=7.8;vals.RQly=100;vals.Sats=8;vals.TH=900;vals.RPM=27000;vals.GSpd=20;assert(frame(m,30));vals.RQly=0;vals.Sats=0;vals.GSpd=0;local ok,e=frame(m,20);if not ok then return false,e end;if(gv[7]or 1024)<1000 then return false,'dropout-not-fail-open'end;vals.RQly=100;vals.Sats=8;vals.GSpd=12;return frame(m,20)end)
scenario('rpm-spike-gps-freeze',nil,function(m)vals.RxBt=7.8;vals.RQly=100;vals.Sats=8;vals.TH=700;vals.GSpd=15;vals.RPM=function(t)return t<60 and 18000 or(t<90 and 78000 or 20000)end;return frame(m,50)end)
scenario('wet-brake',nil,function(m)vals.RxBt=7.8;vals.RQly=100;vals.Sats=8;vals.GSpd=28;vals.RPM=35000;vals.TH=-900;return frame(m,50)end)
scenario('scheduler-restart',nil,function(m)vals.RxBt=7.8;vals.RQly=100;vals.Sats=8;vals.GSpd=10;vals.RPM=14000;assert(frame(m,20));local n,e=loadController();if not n then return false,e end;assert(call(n,'init'));return frame(n,20)end)
local pass=true;for _,r in ipairs(results)do if not r.passed then pass=false end end
local function esc(s)s=tostring(s);local bs=string.char(92);s=s:gsub(bs,bs..bs);s=s:gsub('"',bs..'"');s=s:gsub(string.char(10),bs..'n');return s end
local j='{"schema":2,"engine":"official-edgetx-source-backed-mt12-emulator","edgetxCommit":"f8a89393c560a1057b045048f4b6ff5096ca22a0","candidate":"0103-c103a","passed":'..tostring(pass)..',"scenarios":[';for i,r in ipairs(results)do if i>1 then j=j..','end;j=j..'{"name":"'..esc(r.name)..'","passed":'..tostring(r.passed)..',"error":'..(r.error and('"'..esc(r.error)..'"')or'null')..',"tct":'..tostring(r.tct or 0)..',"gyr":'..tostring(r.gyr or 0)..',"lcd":'..tostring(r.lcd or 0)..',"sounds":'..tostring(r.sounds or 0)..',"wrote":'..tostring(r.wrote or false)..',"writeBytes":'..tostring(r.writeBytes or 0)..'}'end;j=j..']}'
local f=assert(realio.open("/home/runner/work/mt12-jarvis-continuous/mt12-jarvis-continuous/reports/0103-c103a-edgetx-emulator.json",'w'));f:write(j);f:close();print(j);if not pass then os.exit(2)end

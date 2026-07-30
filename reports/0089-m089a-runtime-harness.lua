local gv={}
local vals={RPM=12000,GSpd=12,Sats=8,RxBt=7.8,RQly=100,ST=0,TH=0}
function getFieldInfo(n)return{id=n}end
function getValue(n)return vals[n] or vals[tostring(n)] or 0 end
model={getGlobalVariable=function(i)return gv[i] or 0 end,setGlobalVariable=function(i,f,v)gv[i]=v end}
lcd=setmetatable({},{__index=function()return function()end end})
function playFile()end function playNumber()end function getTime()return 100 end
io.open=function()return nil end
local ok,m=pcall(dofile,"/home/runner/work/mt12-jarvis-continuous/mt12-jarvis-continuous/generations/candidates/0089-m089a.lua");if not ok then error('load:'..tostring(m))end
if type(m)~='table' then error('module return')end
local function call(k,...)if type(m[k])=='function'then local o,e=pcall(m[k],...);if not o then error(k..':'..tostring(e))end end end
call('init') call('run',0) call('background') vals.TH=900 vals.RPM=25000 vals.GSpd=5 call('run',0) vals.RQly=0 call('run',0) if (gv[7] or 1024)<1000 then error('fail-open')end vals.RQly=100 vals.GSpd=0 vals.RPM=0 call('run',0) call('background') call('draw',0) print('runtime-ok')

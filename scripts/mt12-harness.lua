local src,out=arg[1],arg[2]
assert(src and out,'usage: lua5.3 mt12-harness.lua candidate.lua trace.csv')
local t=0
local gv={}
local sensors={GSpd=0,RPM=0,Sats=0,RxBt=0,RQly=0,ch1=0,ch2=0}
model={getGlobalVariable=function(i) return gv[i] or 0 end,setGlobalVariable=function(i,_,v) assert(type(v)=='number' and v==v and math.abs(v)<1e9,'bad gvar');gv[i]=v end}
function getTime() return t end
function getFieldInfo(n) return {id=n} end
function getValue(n) return sensors[n] or 0 end
lcd=setmetatable({}, {__index=function() return function() end end})
function playFile() end
function playNumber() end
function playTone() end
function killEvents() end
local realio=io
local mem={}
io={}
function io.open(path,mode)
  local h={path=path,mode=mode,pos=1,closed=false}
  if mode and mode:find('w') then mem[path]='' end
  return h
end
function io.read(h,n)
  if not h or h.closed then return nil end
  local s=mem[h.path] or ''
  if h.pos>#s then return nil end
  local r=s:sub(h.pos,h.pos+(tonumber(n) or #s)-1);h.pos=h.pos+#r;return r
end
function io.write(h,...)
  assert(h and not h.closed,'bad file handle')
  local a={...};for i=1,#a do mem[h.path]=(mem[h.path] or '')..tostring(a[i]) end
  return true
end
function io.close(h) if h then h.closed=true end return true end
local chunk,err=loadfile(src);assert(chunk,err)
local app=chunk();assert(type(app)=='table' and type(app.init)=='function' and type(app.background)=='function' and type(app.run)=='function','bad EdgeTX return contract')
app.init()
local f=assert(realio.open(out,'w'));f:write('tick,g0,g1,g3,g4,g7\n')
local function row()
  for _,i in ipairs({0,1,3,4,7}) do local v=gv[i] or 0;assert(type(v)=='number' and v==v and math.abs(v)<1e9,'nonfinite gvar '..i) end
  assert((gv[7] or 0)>=1000,'GV7 throttle pass-through dropped below safe scale')
  f:write(table.concat({t,gv[0]or 0,gv[1]or 0,gv[3]or 0,gv[4]or 0,gv[7]or 0},','),'\n')
end
for i=1,80 do t=t+1;app.background();if i%5==0 then row() end end
sensors.RxBt=8.1;sensors.RQly=95;sensors.Sats=12;sensors.RPM=3000;sensors.GSpd=2
for i=1,180 do
 t=t+1
 sensors.ch2=(i<50 and i*12 or i<110 and 700 or 250)
 sensors.ch1=math.floor(math.sin(i/12)*500)
 sensors.RPM=3000+i*95
 sensors.GSpd=2+i*.18
 if i>=115 and i<130 then sensors.GSpd=0;sensors.Sats=0 else sensors.Sats=12 end
 if i>=145 and i<155 then sensors.RPM=0 end
 app.background();if i%5==0 then row() end
end
sensors.RxBt=0;sensors.RQly=0;sensors.Sats=0;sensors.RPM=0;sensors.GSpd=0;sensors.ch1=0;sensors.ch2=0
for i=1,40 do t=t+1;app.background();if i%5==0 then row() end end
app.run(0)
f:close()
print('HARNESS_OK')

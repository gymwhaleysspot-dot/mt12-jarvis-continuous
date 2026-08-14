local src,csv,out=arg[1],arg[2],arg[3]
assert(src and csv and out,'usage: lua5.3 mt12-replay.lua controller.lua log.csv trace.csv')
local function split(s)local a,q,z={},'',false;for i=1,#s do local c=s:sub(i,i);if c=='"'then z=not z elseif c==','and not z then a[#a+1]=q;q=''else q=q..c end end;a[#a+1]=q;return a end
local function key(s)return(s or''):lower():gsub('[^a-z0-9]+','_')end
local fi=assert(io.open(csv,'r'));local h=split(fi:read('*l')or'');local map={};for i,n in ipairs(h)do map[key(n)]=i end
local function val(r,names)for _,n in ipairs(names)do local i=map[key(n)];if i then local v=tonumber((r[i]or''):gsub('[^0-9%+%-%.eE]',''));if v then return v end end end return 0 end
local t,gv,sensors=0,{},{}
model={getGlobalVariable=function(i)return gv[i]or 0 end,setGlobalVariable=function(i,_,v)assert(type(v)=='number'and v==v and math.abs(v)<1e9,'bad gvar');gv[i]=v end}
function getTime()return t end;function getFieldInfo(n)return{id=n}end;function getValue(n)return sensors[n]or 0 end
lcd=setmetatable({},{__index=function()return function()end end});function playFile()end;function playNumber()end;function playTone()end;function killEvents()end
local realio=io;local mem={};io={};function io.open(p,m)local x={path=p,mode=m,pos=1};if m and m:find('w')then mem[p]=''end;return x end
function io.read(x,n)local s=mem[x.path]or'';if x.pos>#s then return nil end;local r=s:sub(x.pos,x.pos+(tonumber(n)or#s)-1);x.pos=x.pos+#r;return r end
function io.write(x,...)for _,v in ipairs({...})do mem[x.path]=(mem[x.path]or'')..tostring(v)end return true end;function io.close()return true end
local chunk,err=loadfile(src);assert(chunk,err);local app=chunk();assert(type(app)=='table'and app.init and app.background and app.run,'bad contract');app.init()
local fo=assert(realio.open(out,'w'));fo:write('frame,g0,g1,g3,g4,g7,GSpd,RPM,Sats,RxBt,RQly,ch1,ch2\n');local frame=0
for line in fi:lines()do local r=split(line);frame=frame+1;t=t+1;sensors.GSpd=val(r,{'GSpd','GPS speed','speed','mph','truth_mph'});sensors.RPM=val(r,{'RPM','truth_rpm'});sensors.Sats=val(r,{'Sats','satellites','gps_sats'});sensors.RxBt=val(r,{'RxBt','rx_batt','receiver_voltage'});sensors.RQly=val(r,{'RQly','rssi','link_quality'});sensors.ch1=val(r,{'ch1','steering','st'});sensors.ch2=val(r,{'ch2','throttle','thr'});app.background();fo:write(table.concat({frame,gv[0]or 0,gv[1]or 0,gv[3]or 0,gv[4]or 0,gv[7]or 0,sensors.GSpd,sensors.RPM,sensors.Sats,sensors.RxBt,sensors.RQly,sensors.ch1,sensors.ch2},','),'\n')end
app.run(0);fi:close();fo:close();print('REPLAY_OK '..frame)

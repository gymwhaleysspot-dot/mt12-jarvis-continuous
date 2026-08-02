local src,csv,out=arg[1],arg[2],arg[3]
assert(src and csv and out,'usage: lua5.3 mt12-csv-replay.lua script.lua log.csv trace.csv')
local function split(line)
 local r,s,q={},'',false
 for i=1,#line do local c=line:sub(i,i)
  if c=='"' then q=not q elseif c==',' and not q then r[#r+1]=s;s='' else s=s..c end
 end
 r[#r+1]=s;return r
end
local f=assert(io.open(csv,'r'));local header=split(assert(f:read('*l'),'empty csv'))
local rows={};for line in f:lines() do if line~='' then rows[#rows+1]=split(line) end end;f:close()
local aliases={GSpd={'gspd','gps speed','speed','mph','gpsspeed'},RPM={'rpm','engine rpm'},Sats={'sats','satellites','gps sats'},RxBt={'rxbt','rx voltage','voltage'},RQly={'rqly','link quality','lq'},ch1={'ch1','steering','st'},ch2={'ch2','throttle','thr','th'}}
local idx={};for i,n in ipairs(header) do local k=n:lower():gsub('[^%w]','');for dst,aa in pairs(aliases) do for _,a in ipairs(aa) do if k==a:gsub('[^%w]','') then idx[dst]=i end end end end
local t,gv=0,{};local sensors={GSpd=0,RPM=0,Sats=0,RxBt=0,RQly=0,ch1=0,ch2=0}
model={getGlobalVariable=function(i)return gv[i]or 0 end,setGlobalVariable=function(i,_,v)assert(type(v)=='number'and v==v and math.abs(v)<1e9,'bad gvar');gv[i]=v end}
function getTime()return t end;function getFieldInfo(n)return{id=n}end;function getValue(n)return sensors[n]or 0 end
lcd=setmetatable({},{__index=function()return function()end end});function playFile()end;function playNumber()end;function playTone()end;function killEvents()end
local realio=io;local mem={};io={};function io.open(p,m)local h={path=p,mode=m,pos=1,closed=false};if m and m:find('w')then mem[p]=''end;return h end
function io.read(h,n)if not h or h.closed then return nil end;local s=mem[h.path]or'';if h.pos>#s then return nil end;local z=s:sub(h.pos,h.pos+(tonumber(n)or#s)-1);h.pos=h.pos+#z;return z end
function io.write(h,...)assert(h and not h.closed);for _,v in ipairs({...})do mem[h.path]=(mem[h.path]or'')..tostring(v)end;return true end;function io.close(h)if h then h.closed=true end return true end
local chunk,e=loadfile(src);assert(chunk,e);local app=chunk();assert(type(app)=='table'and type(app.init)=='function'and type(app.background)=='function'and type(app.run)=='function','bad return contract');app.init()
local o=assert(realio.open(out,'w'));o:write('frame,g0,g1,g3,g4,g7\n')
for frame,row in ipairs(rows)do t=t+1;for n,i in pairs(idx)do sensors[n]=tonumber(row[i])or sensors[n]or 0 end;app.background();if frame%5==0 then assert((gv[7]or 0)>=1000,'GV7 throttle pass-through dropped');o:write(table.concat({frame,gv[0]or 0,gv[1]or 0,gv[3]or 0,gv[4]or 0,gv[7]or 0},','),'\n')end end
app.run(0);o:close();print(string.format('{"rows":%d,"mapped":%d}',#rows,(function()local n=0;for _ in pairs(idx)do n=n+1 end;return n end)()))

local src,out=arg[1],arg[2]
assert(src and out,'usage: lua5.3 fitness-harness.lua candidate.lua metrics.json')
local realio=io
local function esc(s)return tostring(s):gsub('\\','\\\\'):gsub('"','\\"'):gsub('\n','\\n')end
local scenarios={
 {name='car_off',n=90,fn=function(i,s)s.RxBt=0;s.RQly=0;s.Sats=0;s.RPM=0;s.GSpd=0;s.ch1=0;s.ch2=0 end},
 {name='calm_straight',n=180,fn=function(i,s)s.RxBt=8.1;s.RQly=96;s.Sats=12;s.ch1=0;s.ch2=360;s.GSpd=math.min(34,i*.21);s.RPM=3000+s.GSpd/0.000914 end},
 {name='wet_launch',n=180,fn=function(i,s)s.RxBt=8;s.RQly=92;s.Sats=11;s.ch1=math.floor(math.sin(i/11)*120);s.ch2=i<80 and math.min(900,i*16) or 620;s.GSpd=math.max(0,(i-18)*.12);s.RPM=3000+math.max(s.GSpd+math.max(0,15-i*.06),0)/0.000914 end},
 {name='hard_brake',n=160,fn=function(i,s)s.RxBt=8;s.RQly=94;s.Sats=12;s.ch1=i>65 and 260 or 0;s.ch2=i<50 and 650 or -math.min(850,(i-50)*18);s.GSpd=math.max(0,35-math.max(0,i-45)*.33);s.RPM=math.max(0,3000+s.GSpd/0.000914-(i>80 and 4500 or 0)) end},
 {name='gps_dropout',n=190,fn=function(i,s)s.RxBt=8;s.RQly=95;s.ch1=math.floor(math.sin(i/14)*350);s.ch2=540;s.RPM=5000+i*110;if i>=70 and i<115 then s.Sats=0;s.GSpd=0 else s.Sats=12;s.GSpd=4+i*.16 end end},
 {name='rpm_dropout',n=190,fn=function(i,s)s.RxBt=8;s.RQly=95;s.Sats=12;s.ch1=math.floor(math.sin(i/15)*300);s.ch2=520;s.GSpd=4+i*.15;s.RPM=(i>=75 and i<120)and 0 or 3000+s.GSpd/0.000914 end},
 {name='sensor_disagree',n=170,fn=function(i,s)s.RxBt=8;s.RQly=94;s.Sats=12;s.ch1=200;s.ch2=580;s.GSpd=5+i*.13;s.RPM=3000+(s.GSpd+(i>55 and i<115 and 18 or 0))/0.000914 end},
 {name='channel_drop',n=190,fn=function(i,s)s.RxBt=8;s.RQly=(i>=65 and i<105)and 0 or 93;s.Sats=(i>=65 and i<105)and 0 or 11;s.ch1=(i>=65 and i<105)and 0 or math.floor(math.sin(i/12)*420);s.ch2=(i>=65 and i<105)and 0 or 600;s.GSpd=(i>=65 and i<105)and 0 or 3+i*.14;s.RPM=(i>=65 and i<105)and 0 or 3000+s.GSpd/0.000914 end},
 {name='rough_false_jump',n=180,fn=function(i,s)s.RxBt=8;s.RQly=91;s.Sats=10;s.ch1=math.floor(math.sin(i/4)*500);s.ch2=570;s.GSpd=18+math.sin(i*.8)*2.5;s.RPM=3000+(s.GSpd+math.sin(i*1.7)*5)/0.000914 end},
 {name='jump_landing',n=190,fn=function(i,s)s.RxBt=8;s.RQly=92;s.Sats=11;s.ch1=math.floor(math.sin(i/18)*180);s.ch2=650;local base=10+i*.12;if i>=72 and i<92 then s.GSpd=base*.72;s.RPM=3000+(base+13)/0.000914 elseif i>=92 and i<112 then s.GSpd=base+math.sin(i)*3;s.RPM=3000+(base+5)/0.000914 else s.GSpd=base;s.RPM=3000+base/0.000914 end end},
 {name='low_battery',n=150,fn=function(i,s)s.RxBt=8.2-i*.012;s.RQly=90;s.Sats=10;s.ch1=100;s.ch2=500;s.GSpd=3+i*.12;s.RPM=3000+s.GSpd/0.000914 end},
 {name='file_failure',n=120,fileFail=true,fn=function(i,s)s.RxBt=8;s.RQly=95;s.Sats=12;s.ch1=0;s.ch2=450;s.GSpd=2+i*.12;s.RPM=3000+s.GSpd/0.000914 end}
}
local results={}
for _,sc in ipairs(scenarios)do
 local t,gv=0,{}
 local sensors={GSpd=0,RPM=0,Sats=0,RxBt=0,RQly=0,ch1=0,ch2=0}
 local mem={}
 model={getGlobalVariable=function(i)return gv[i]or 0 end,setGlobalVariable=function(i,_,v)assert(type(v)=='number'and v==v and math.abs(v)<1e9,'bad gvar');gv[i]=v end}
 function getTime()return t end
 function getFieldInfo(n)return{id=n}end
 function getValue(n)return sensors[n]or 0 end
 lcd=setmetatable({},{__index=function()return function()end end})
 function playFile()end;function playNumber()end;function playTone()end;function killEvents()end
 io={}
 function io.open(p,m)if sc.fileFail then return nil end;local h={path=p,mode=m,pos=1,closed=false};if m and m:find('w')then mem[p]=''end;return h end
 function io.read(h,n)if not h or h.closed then return nil end;local s=mem[h.path]or'';if h.pos>#s then return nil end;local r=s:sub(h.pos,h.pos+(tonumber(n)or#s)-1);h.pos=h.pos+#r;return r end
 function io.write(h,...)assert(h and not h.closed,'bad file handle');for _,v in ipairs({...})do mem[h.path]=(mem[h.path]or'')..tostring(v)end;return true end
 function io.close(h)if h then h.closed=true end;return true end
 local ok,chunk=pcall(loadfile,src);local runtime=''
 local samples,min7,maxStep,maxAbs={},{},0,0
 local last={}
 if not ok or not chunk then runtime='load:'..tostring(chunk) else
  local ok2,app=pcall(chunk)
  if not ok2 or type(app)~='table'or type(app.init)~='function'or type(app.background)~='function'or type(app.run)~='function'then runtime='contract:'..tostring(app) else
   local z,e=pcall(app.init);if not z then runtime='init:'..tostring(e)end
   for i=1,sc.n do
    if runtime~=''then break end;t=t+1;sc.fn(i,sensors)
    local a,b=pcall(app.background);if not a then runtime='background:'..tostring(b);break end
    if i%5==0 then
     local row={t};for _,g in ipairs({0,1,3,4,7})do local v=gv[g]or 0;if type(v)~='number'or v~=v or math.abs(v)>=1e9 then runtime='nonfinite gvar '..g;break end;row[#row+1]=v;local d=math.abs(v-(last[g]or v));if d>maxStep then maxStep=d end;if math.abs(v)>maxAbs then maxAbs=math.abs(v)end;last[g]=v end
     samples[#samples+1]=row
    end
   end
   if runtime==''then local a,b=pcall(app.run,0);if not a then runtime='run:'..tostring(b)end end
  end
 end
 local g7min=1e9;for _,r in ipairs(samples)do if r[6]<g7min then g7min=r[6]end end;if g7min==1e9 then g7min=0 end
 results[#results+1]={name=sc.name,ok=runtime=='',error=runtime,samples=#samples,g7min=g7min,maxStep=maxStep,maxAbs=maxAbs,final={gv[0]or 0,gv[1]or 0,gv[3]or 0,gv[4]or 0,gv[7]or 0}}
end
io=realio
local f=assert(realio.open(out,'w'))
f:write('{"scenarios":[')
for i,r in ipairs(results)do if i>1 then f:write(',')end;f:write('{"name":"',esc(r.name),'","ok":',r.ok and'true'or'false',',"error":"',esc(r.error),'","samples":',r.samples,',"g7min":',r.g7min,',"maxStep":',r.maxStep,',"maxAbs":',r.maxAbs,',"final":[');for j,v in ipairs(r.final)do if j>1 then f:write(',')end;f:write(v)end;f:write(']}')end
f:write(']}\n');f:close()
print('FITNESS_HARNESS_OK')

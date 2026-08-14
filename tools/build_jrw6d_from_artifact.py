from pathlib import Path
import re,sys
src=Path(sys.argv[1]); out=Path(sys.argv[2])
s=src.read_text()
def one(old,new,name):
    global s
    n=s.count(old)
    if n!=1: raise SystemExit(f'{name}: expected 1, got {n}')
    s=s.replace(old,new,1)
# identity/header
s=re.sub(r'^--[^\n]*','--jrw6d defended observability evolution',s,count=1)
s=s.replace('T(2,1,"JRW4"','T(2,1,"JRW6D"',1)
# protected EdgeTX API wrappers
one('local function fid(n)local f=getFieldInfo(n);if f then return f.id end end\nlocal function val(id,d)if id==nil then return d or 0 end;local v=getValue(id);if type(v)=="number"then return v end;return d or 0 end\nlocal function ival(id)return m_floor(val(id,0)+0.5)end\nlocal function gv(i)local v=model.getGlobalVariable(i,0);if type(v)=="number"then return v end;return 0 end\nlocal function setgv(i,v)model.setGlobalVariable(i,0,m_floor(v+0.5))end\nlocal MEMPATH,memSaved,memLoaded="/LOGS/aicmem.csv",0,0',
'''local pc=pcall
local function fid(n)local o,f=pc(getFieldInfo,n);if o and f then return f.id end end
local function val(id,d)if id==nil then return d or 0 end;local o,v=pc(getValue,id);return o and type(v)=="number"and v==v and m_abs(v)<=3.4e38 and v or d or 0 end
local function ival(id)return m_floor(val(id,0)+.5)end
local function gv(i)local o,v=pc(model.getGlobalVariable,i,0);return o and type(v)=="number"and v==v and m_abs(v)<=3.4e38 and v or 0 end
local function setgv(i,v)pc(model.setGlobalVariable,i,0,m_floor(v+.5))end
local MA,MB,MEMPATH="/LOGS/m0","/LOGS/m1","/LOGS/aicmem.csv";local memGen,memSaved,memLoaded=0,0,0''','api wrappers')
# A/B + checksum read validation, legacy compatible
one('''local function rdmem()
 local f=io.open(MEMPATH,"r");if not f then return end;local tag=io.read(f,5);io.read(f,1);local function I()local x=tonumber(io.read(f,"*n"));io.read(f,1);return x end;local ok=tag=="AIC9Z";for i=1,122 do local x=I();if not x or(i==1 and x~=18)or(i==2 and x~=24)or(i==60 and x~=151)or(i==106 and x~=152)then ok=false;break end end;if ok and io.read(f,1)then ok=false end;io.close(f);if not ok then return end
 f=io.open(MEMPATH,"r");io.read(f,6);local function it()local x=tonumber(io.read(f,"*n"));io.read(f,1);return x end;local function nx(d,a,b)return clamp(it()or d,a,b)end''',
'''local function rdmem()
 local function C(p,l)local f=io.open(p,"r");if not f then return end;local t=io.read(f,5);io.read(f,1);local c=0;local function I()local x=tonumber(io.read(f,"*n"));io.read(f,1);return x end;local o=t=="AIC9Z";for i=1,122 do local x=I();if not x or(i==1 and x~=18)or(i==2 and x~=24)or(i==60 and x~=151)or(i==106 and x~=152)then o=false;break end;c=c+x end;local g;if o then g=tonumber(io.read(f,"*n"));if g then io.read(f,1);c=c+g;local h=tonumber(io.read(f,"*n"));io.read(f,1);if h~=c or io.read(f,1)then o=false end elseif not l then o=false elseif io.read(f,1)then o=false end end;io.close(f);return o and(g or 0)end
 local a,b=C(MA),C(MB);if a and(not b or a>=b)then MEMPATH=MA;memGen=a elseif b then MEMPATH=MB;memGen=b elseif not C(MEMPATH,1)then return end
 local f=io.open(MEMPATH,"r");io.read(f,6);local function it()local x=tonumber(io.read(f,"*n"));io.read(f,1);return x end;local function nx(d,a,b)return clamp(it()or d,a,b)end''','rdmem')
# remove single-file early open
one(';local f=io.open(MEMPATH,"w");if not f then return end\n local clean=', '\n local clean=', 'wrmem early open')
# append generation/checksum and alternate-file write
one(''' local out=tostring(row[1]);for i=2,#row do out=out..","..tostring(row[i])end
 io.write(f,out,"\\n");io.close(f);V[294]=1''',
''' local c=0;for i=2,#row do c=c+row[i]end;local g=memGen+1;row[#row+1]=g;row[#row+1]=c+g;local p=MEMPATH==MA and MB or MA;local f=io.open(p,"w");if not f then memSaved=0;return end;local out=tostring(row[1]);for i=2,#row do out=out..","..tostring(row[i])end
 io.write(f,out,"\\n");io.close(f);MEMPATH=p;memGen=g;V[294]=1''','wrmem tail')
# fixed causal learning coefficient and conservative progressive authority startup
s,n=re.subn(r'V\[179\]\*\(\.00435\+\.00015\*m_min\(1,X\[46\]/120\)\)', 'V[179]*.0045', s, count=1)
if n!=1: raise SystemExit('causal weight not found')
one('if X[46]<120 then ac=m_min(ac,96)end;','if X[46]<120 then local dc=m_max(0,m_min(1,X[46]/120));ac=m_min(ac,92+4*dc)end;','authority ramp')
# protect remaining direct reads
one('local brakeSw=getValue("L4");brakeSw=brakeSw==true or(type(brakeSw)=="number"and brakeSw>0);','local _,brakeSw=pc(getValue,"L4");brakeSw=brakeSw==true or(type(brakeSw)=="number"and brakeSw>0);','L4 read')
one('local st=getValue("ch1");if type(st)~="number"then st=0 end;local th=getValue("ch2");if type(th)~="number"then th=0 end;','local st=val("ch1");local th=val("ch2");','channel reads')
# memory pressure + watchdog + compact reset helper
anchor='local bootStage=0;local bootStable=0;local bootTick=0;local bootSb=0;local warm=0'
if s.count(anchor)!=1: raise SystemExit('boot anchor')
defs='''local wd,mb=0,0
local function memOpt()local k=collectgarbage("count");if mb==0 then mb=k end;if k-mb>260 then collectgarbage("collect");mb=k elseif k-mb>100 then collectgarbage("step",120)end end
local function watch()wd=(wd+1)%17;if wd>0 then return end;memOpt();local a,b=gv(7),gv(3);if a<1000 or b<70 or b>1024 then setgv(7,1024);setgv(3,100);V[655]=0;X[7]=0 elseif X[7]==0 then X[7]=1 end end
local function safe()setgv(0,0);setgv(1,0);setgv(3,100);setgv(7,1024)end
'''
s=s.replace(anchor,defs+anchor,1)
s=s.replace('setgv(0,0);setgv(1,0);setgv(3,100);setgv(7,1024);','safe();')
one('local mph=update(gps,e,st,sats,m_abs(th),th,b,rq);cache[1]=mph;','local mph=update(gps,e,st,sats,m_abs(th),th,b,rq);watch();cache[1]=mph;','watch invoke')
# hard acceptance assertions
req=['V[704]=nx(50,0,99)','setgv(3,m_min(V[35],ac))','V[179]*.0045','92+4*dc','/LOGS/m0','/LOGS/m1','local function memOpt()','local function watch()','bb_line(144,li1,0)','bb_line(148,rg1,0)']
for x in req:
    if x not in s: raise SystemExit('missing '+x)
for x in ['local function fid(n)local f=getFieldInfo','local v=getValue(id)','local v=model.getGlobalVariable','model.setGlobalVariable(i,0,m_floor']:
    if x in s: raise SystemExit('unprotected '+x)
out.write_text(s)
print({'sourceBytes':len(s.encode()),'pcall':s.count('pc('),'m0':s.count('/LOGS/m0'),'watch':s.count('watch()')})

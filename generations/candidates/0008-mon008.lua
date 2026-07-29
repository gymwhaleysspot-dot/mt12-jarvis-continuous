--mon008 monday LUAC Factory generation 8
-- style:balanced; independently synthesized MT12 controller
local abs,min,max,floor=math.abs,math.min,math.max,math.floor
local V=setmetatable({},{__index=function()return 0 end})
local function cl(x,a,b)if x<a then return a elseif x>b then return b end return x end
local function val(x,d)local v=getValue(x);if type(v)~='number'or v~=v then return d or 0 end return v end
local function gv(i,v)model.setGlobalVariable(i,0,floor(cl(v,-1024,1024)+.5))end
local function init()V[10]=0.000912;V[11]=21.556097;V[12]=22.269645;V[13]=337;V[14]=7123;V[15]=123;V[16]=468;V[17]=0.396182;V[18]=0.042362;V[19]=0.984931;V[20]=0.001544;end
local function sense()local g=val('GSpd',val('GPS',0));local r=val('RPM',0);local s=val('Sats',0);local rm=r*V[10];local q=s>=6 and 1 or s>=5 and .82 or s>=4 and .5 or .15;local d=rm-g;V[6]=V[6]+(q-V[6])*V[18];V[5]=V[5]+(d-V[5])*.08;local t=q>.72 and g+cl(d,-2,9)*.44 or rm>1 and rm*.98 or V[2]*V[19];V[2]=V[2]+(cl(t,0,120)-V[2])*V[17];V[35]=r-V[3];V[3]=r;return V[2],r,g,q,rm end
local function brain(m,r,g,q,rm)local th=val('thr',0);local st=val('ste',0);V[30]=V[30]+(th-V[30])*.3;V[31]=V[31]+(st-V[31])*.28;V[34]=m-V[33];V[33]=m;local sl=max(0,rm-m);local x=(sl-V[11])/V[12];local tc=0;local lk=0;if th>120 and m>1 then tc=cl(x*.62+x*x*.28,0,1)end;if th<-80 and m>4 then lk=cl((V[14]-r)/V[14]*.72+max(0,-V[35]/12000)*.28,0,1)end;local air=V[35]>3200 and V[34]<-1.2 and th>80;if air then tc=0 end;local unc=1-q;local risk=cl(max(tc,lk)*(.82+unc*.18),0,1);local tct=1024-floor(tc*V[13]);if q<.2 or air then tct=1024 end;local gyr=cl(V[15]+abs(st)*.05+tc*88-lk*24+abs(V[34])*2.2,80,V[16]);gv(7,tct);gv(1,gyr);gv(8,50+risk*40);if q>.8 and abs(th)<500 and r>1200 and g>4 then V[10]=cl(V[10]+(g/r-V[10])*V[20],.0008,.00105)end;V[70]=tc;V[71]=lk;V[72]=risk;V[73]=sl;V[74]=air and 1 or 0 end
local function run()local car=val('RSSI',0)>0 or val('RPM',0)>0 or val('GSpd',0)>0;if not car then gv(7,1024);gv(1,0);gv(8,0);V[90]=0;return 0 end;if V[90]<20 then V[90]=V[90]+1;gv(7,1024);gv(1,0);return 0 end;local m,r,g,q,rm=sense();brain(m,r,g,q,rm);return 0 end
local function background()run()end
return{init=init,run=run,background=background}

-- factory full-lineage cycle 29; cloud; gen 29; experiment 2; parent a15xq.lua; objective confidence arbitration, neural learning and reasoning
local ZMT={__index=function()return 0 end}
local V=setmetatable({},ZMT)
local S="\001\002\006\001\007\001\035\100\057\100\061\100\065\001\087\001\090\050\063\050\091\100\092\110\093\100\094\100\095\025\096\030\097\072\098\002\099\002\104\035\105\018\106\094\107\094\108\090\109\106\127\050\128\050\129\050\130\050\132\100\141\100\146\001\151\050\152\050\153\050\154\050\156\050\159\001\160\001\165\001\170\032\171\014\172\008\173\010\174\052\177\045";for i=1,#S,2 do V[string.byte(S,i)]=string.byte(S,i+1)end;S=nil;V[29]=430;V[30]=430;V[31]=430;V[40]=.5;V[145]=.5
local L={1,1,1,1,1,1,1,1,1}
local X={99,0,0,-1,0,0,1,0,0,99,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,50,0,0,50,0,0}
local GPS_OK,GPS_COAST,GPS_LOST=0,1,2
local POLE=2;local RPM2MPH=0.000914;local WB=0.375;local MAX_STEER=26
local SURF={
{"GRIP",335,145,16,36,0.28,1.03},
{"RLY",390,235,12,30,0.42,0.98},
{"LOOS",425,310,8,23,0.52,0.94},
{"LOW",410,255,12,31,0.47,0.96}
}
local idSpd,idRpm,idSats,idRxBt,idRqly
local m_abs=math.abs
local m_max=math.max
local m_min=math.min
local m_floor=math.floor
local m_tan=math.tan
local m_atan=math.atan
local m_pi=math.pi
local function clamp(x,a,b)x=x or 0;a=a or 0;b=b or a;if x<a then return a elseif x>b then return b else return x end end
local function bad(x)return not(type(x)=="number"and x==x and m_abs(x)<=3.4e38)end
local function q(x,a,b)if bad(x)then return 0 end;return m_floor(clamp(x,a or 0,b or 99)+.5)end
-- BB rule: never hand-build dV packs; only p332/p2221 stay below 2^24 exactness risk. Bad inputs return loud sentinel 9999999.
local function p332(a,b,c)return(bad(a)or bad(b)or bad(c))and 9999999 or q(a,0,999)*10000+q(b)*100+q(c)end
local function p2221(a,b,c,d)return(bad(a)or bad(b)or bad(c)or bad(d))and 9999999 or q(a)*100000+q(b)*1000+q(c)*10+q(d,0,9)end
local function u3(x,j)V[j]=m_floor(x/10000);V[j+1]=m_floor(x/100)%100;V[j+2]=x%100 end
local function lerp(a,b,t)t=clamp(t,0,1);return a+(b-a)*t end
local function fid(n)local ok,f=pcall(function()return getFieldInfo(n)end);if ok and f then return f.id end end
local function val(id,d)if id==nil then return d or 0 end;local ok,v=pcall(function()return getValue(id)end);if ok and type(v)=="number"then return v end;return d or 0 end
local function ival(id)return m_floor(val(id,0)+0.5)end
local function sw(n)local ok,v=pcall(function()return getValue(n)end);if not ok then return false end;if type(v)=="boolean"then return v end;if type(v)=="number"then return v>0 end;return false end
local function gv(i)local ok,v=pcall(function()return model.getGlobalVariable(i,0)end);if ok and type(v)=="number"then return v end;return 0 end
local function setgv(i,v)pcall(function()model.setGlobalVariable(i,0,m_floor(v+0.5))end)end
local MEMPATH="/LOGS/aicmem.csv";local memSaved=0;local memLoaded=0
local nW,N;local VS={55555,55555,55555,55555,55555,55555,55555,55555,55555,55555};local function vs(i,v)local k=m_floor((i-1)/5)+1;local p=10^((i-1)%5);local z=VS[k];local o=m_floor(z/p)%10;if v then VS[k]=z+(v-o)*p end;return o end
local function rd1(p)local f=io.open(p,"r");if not f then return end;local s=io.read(f,512);pcall(io.close,f);return s and string.match(s,"([^\r\n]+)")end
local function rdmem()
 local s=rd1(MEMPATH);if not s then return end
 local it=string.gmatch(s,"[^,]+");local tag=it();if not string.match(tag or"","^AIC%d+[A-Z]$")then return end
 local n=0;local function nx(d,a,b)local x=it();n=n+1;return clamp(tonumber(x)or d,a,b)end
 nx(0,0,99);nx(0,0,99)
 local function R(i,d,a,b)V[i]=nx(d,a or 0,b or 99)end
 for i=127,130 do R(i,50,0,100)end;R(132,100,85,115);R(321,50);R(329,50);for i=560,562 do R(i,50)end;V[325]=V[560];V[326]=V[561];V[327]=V[562]
 R(330,70);R(331,0);for i=333,335 do R(i,0)end;for i=336,340 do R(i,50,35,65)end;R(350,50);R(361,1,0,9);R(362,50);R(363,50);R(364,0,0,9);for i=370,375 do R(i,50)end;R(376,0)
 R(500,85);R(503,0);R(510,20);R(511,20);R(520,20);R(521,80);R(530,0);R(533,50);R(542,70);R(545,50);R(550,0);R(551,50);R(505,V[57]or 85);R(580,0);for _,i in ipairs({581,582,583,602,607,608,610,612})do R(i,50)end;u3(nx(505050,0,9999999),629);u3(nx(505050,0,9999999),632);u3(nx(500050,0,9999999),635)
 local mk=tonumber(it()or"");if mk==151 then N[1]=clamp(tonumber(it()or"")or 0,0,9999);N[2]=clamp((tonumber(it()or"")or 500)/1000,0,1);N[3]=1-N[2];for i=1,43 do nW[i]=clamp((tonumber(it()or"")or 0)/1000,-1.5,1.5)end;N[4]=1;local z=tonumber(it()or"");if z==152 then for k=1,10 do local q=tonumber(it()or"");VS[k]=q and q>=0 and q<1e5 and q or 55555 end;local z=tonumber(it()or"")or 505050;V[672]=m_floor(z/10000);V[673]=m_floor(z/100)%100;V[678]=z%100;local a=tonumber(it()or"");local b=tonumber(it()or"");if a then V[671]=m_floor(a/10000);V[674]=m_floor(a/100)%100;V[675]=a%100 end;if b then V[676]=m_floor(b/10000);V[677]=m_floor(b/100)%100 end end end
 if V[333]>=90 then V[333]=m_floor(V[333]*.5)end;if V[334]>=90 then V[334]=m_floor(V[334]*.5)end;if V[335]>=90 then V[335]=m_floor(V[335]*.5)end
 if n<34 then return end;memLoaded=1;s=nil;it=nil
end

local function i9(x)return clamp(x+1,0,99)end
local function trait(old,score,rate)old=clamp(old or 50,0,99);score=clamp(score or 50,0,99);return clamp(old+(score-old)*(rate or .015)*clamp(.7+(V[638]or 50)/100,.85,1.35),0,99)end
local function md(j,x,b)local d=x-(V[b]or x);local s=(V[j]-50)*d>0 and 1 or 0;V[j]=trait(V[j],clamp(50+d*4,0,99),.3);V[b]=clamp((V[b]or x)*.7+x*.3,0,99);return s end
local function traitLearn()
 local clean=clamp((V[333])/(m_max(1,V[289]or 1))*100,0,99);local ev=clamp(V[289],0,99);local sev=clamp(V[302],0,99);local swing=clamp((V[341])+(V[342])*1.5+(V[343]),0,99);local data=clamp(V[347]or 80,0,99);local mismatch=clamp(V[304]or V[216],0,99);local speed=clamp(V[331],0,55)
 local commit=clamp(42+speed*.75+clean*.20+(V[325]or 50)*.18-sev*.55-ev*.04,0,99)
 local compose=clamp(52+clean*.45+data*.12-sev*.55-swing*.36,0,99)
 local adapt=clamp(50+((V[239]or 65)-65)*.55+(data-80)*.20-mismatch*.18-(V[119])*16,0,99)
 local sty=clamp((V[560]or V[325]or 50)*.44+(V[561]or V[326]or 50)*.30+(V[562]or V[327]or 50)*.26,0,99)
 local note=clamp(46+data*.38-mismatch*.30+((V[239]or 65)-65)*.25+clean*.10-sev*.12,0,99)
 V[370]=trait(V[370],commit,.014);V[371]=trait(V[371],compose,.014);V[372]=trait(V[372],adapt,.012);V[373]=trait(V[373],sty,.016);V[374]=trait(V[374],note,.012);V[375]=clamp((V[370]+V[371]+V[372]+V[374])*.25,0,99);V[376]=i9(V[376])
end
local function wrmem()
 if memSaved>0 then return end;memSaved=1;local a={m_max(V[513],100-(V[239]or 50),100-(V[602]or 50)),m_max(V[520],V[606]),m_max(V[503],V[262])-(V[501])*.2,100-(V[168])+(V[69])*20};local k=1;local h=a[1];local l=0;for i=2,4 do if a[i]>h then l=h;h=a[i];k=i elseif a[i]>l then l=a[i]end end;local cc=clamp(h-l,0,99);if cc<12 or k==4 then V[638]=m_max(20,V[638]-6)elseif k~=3 then V[503]=V[503]*.85 end;V[405]=p2221(k,cc,V[520],(V[503])/10);if V[655]>0 and (V[541]or 50)>38 and (V[543])==0 then traitLearn();V[548]=0 else V[548]=1 end;local f=io.open(MEMPATH,"w");if not f then return end
 local clean=((V[302])<20 and (V[303])>78)and 1 or 0;local tcT=clamp((V[334])+(V[100]),0,99);local abT=clamp((V[335])+(V[101]),0,99)
 local cr=clamp((V[333])/m_max(1,V[289]or 1)*100,0,99);local n=md(629,cr,580)+md(630,V[521]or 50,581)+md(631,V[530]or 50,582)+md(632,100-(V[543])*40,583);V[633]=clamp(V[633]+(n>2 and 8 or -4),0,99);local x=((V[239]or 50)>65 and cr<45)or((V[610]or 50)>65 and(V[606])>40)or((V[500]or 50)>75 and V[628]>55);V[634]=trait(V[634],x and 90 or 20,.25);V[635]=trait(V[635],100-m_abs((V[239]or 50)-cr),.25);V[638]=clamp(50+(V[635]-50)*.4-V[634]*.35+(V[633]-50)*.15,20,80);if V[634]>65 then V[603]=m_max(V[603],20)end;if V[333]>=90 then V[333]=m_floor(V[333]*.5)end;if V[334]>=90 then V[334]=m_floor(V[334]*.5)end;if V[335]>=90 then V[335]=m_floor(V[335]*.5)end;tcT=clamp((V[334])+(V[100]),0,99);abT=clamp((V[335])+(V[101]),0,99);local row={"AIC9Z",18,24};local function A(x,a,b)row[#row+1]=q(x,a,b)end
 for i=127,130 do A(V[i],0,100)end;A(V[132],85,115);A(V[321]);A(V[329]);A(V[560]or V[325]);A(V[561]or V[326]);A(V[562]or V[327]);A(V[239]or V[330]);A(V[331]);A(V[333]+clean);A(tcT);A(abT)
 for i=336,340 do A(V[i],35,65)end;A(V[350]);A(V[361]or 1,0,9);A(V[362]or 50);A(V[363]or 50);A(V[364],0,9);for i=370,376 do A(V[i])end
 for _,i in ipairs({500,503,510,511,520,521,530,533})do A(V[i])end;A(V[542]or 70);A(V[545]or 50);A(V[550]);A(V[551]or 50);A(V[505]or V[57]or 85)
 for _,i in ipairs({580,581,582,583,602,607,608,610,612})do A(V[i]or 50)end;row[#row+1]=p332(V[629],V[630],V[631]);row[#row+1]=p332(V[632],V[633],V[634]);row[#row+1]=p332(V[635],V[637],V[638])
 row[#row+1]=151;row[#row+1]=m_floor(N[1]+.5);row[#row+1]=m_floor(N[2]*1000+.5);for i=1,43 do row[#row+1]=m_floor(clamp(nW[i],-1.5,1.5)*1000)end;row[#row+1]=152;for k=1,10 do row[#row+1]=VS[k]end;row[#row+1]=p332(V[672],V[673],V[678]);row[#row+1]=p332(V[671],V[674],V[675]);row[#row+1]=p332(V[676],V[677],0)
 local out=tostring(row[1]);for i=2,#row do out=out..","..tostring(row[i])end
 io.write(f,out,"\n");pcall(io.close,f);V[294]=1
end
local function loadMem()
V[90]=50;V[63]=50
for i=127,177 do V[i]=nil end;for i=325,612 do V[i]=nil end
V[127]=50;V[128]=50;V[129]=50;V[130]=50;V[141]=100;V[145]=.5;V[146]=1;V[151]=50;V[152]=50;V[153]=50;V[154]=50;V[156]=50;V[159]=1;V[160]=1;V[165]=1;V[170]=32;V[171]=14;V[172]=8;V[173]=10
V[325]=50;V[326]=50;V[327]=50;V[329]=50;V[330]=70;for i=336,340 do V[i]=50 end;for i=671,678 do V[i]=50 end;V[344]=80;V[346]=50;V[347]=80;V[349]=99;V[350]=50;V[361]=1;V[362]=50;V[363]=50;for i=370,375 do V[i]=50 end;V[380]=80;V[382]=80;V[383]=100;V[384]=100;V[385]=100;V[389]=80;V[500]=85;V[504]=85;V[505]=85;V[510]=20;V[511]=20;V[512]=80;V[520]=20;V[521]=80;V[523]=80;V[531]=50;V[532]=50;V[533]=50;V[540]=80;V[541]=70;V[542]=70;V[545]=50;V[551]=50;V[560]=50;V[561]=50;V[562]=50;V[581]=50;V[582]=50;V[583]=50;V[602]=50;V[607]=50;V[608]=50;V[610]=50;V[612]=50
rdmem()
if memLoaded==0 then V[560]=V[325];V[561]=V[326];V[562]=V[327]end
local tc=(V[127]-50)/50;local rg=(V[128]-50)/50;local ab=(V[130]-50)/50
L[5]=clamp(1-0.15*tc+0.10*rg,0.70,1.60);L[6]=clamp(1+0.12*tc-0.08*rg,0.50,1.25);L[8]=clamp(1+0.08*tc-0.08*rg,0.70,1.28)
L[7]=clamp(1-0.12*ab+0.10*rg,0.75,1.60);V[40]=clamp(V[129]/100,0.25,1)
end
local sR=0;local cL=0;local srt=55;local clt=30;local sndCd=0;local sndPr=0;local sndLast=0;local metaLast=0;local vcCd=0;local vcLast=0;local vcCnt=0;local vcPr=0;local vBoot=1;local vWait=90;local vLoad=0;local vQuiet=50;local voiceBlock=0;local sndBlock=0
local function memLearn(moving)
if not moving then return end
local gpsBad=1-V[114];local tcT=clamp(50+V[116]*28-V[113]*22-(V[36]>25 and 12 or 0),0,100)
local rgT=clamp(50+(V[113]+V[119]+gpsBad)*18,0,100);local gpT=clamp(V[40]*100,0,100);local abT=clamp(50+V[117]*30-(V[37]>25 and 10 or 0),0,100)
V[127]=V[127]+(tcT-V[127])*0.012;V[128]=V[128]+(rgT-V[128])*0.012;V[129]=V[129]+(gpT-V[129])*0.010;V[130]=V[130]+(abT-V[130])*0.010
if sR>.35 then srt=clamp(srt+(((V[16]>0)and 50 or 62)-srt)*.006,45,70)end
clt=clamp(clt+(((cL>.55)and 24 or 34)-clt)*.003,20,50)
V[131]=V[131]+1;if V[131]>90 then V[131]=0 end
end
local function bar(x,y,w,h,p)p=clamp(p or 0,0,1);lcd.drawRectangle(x,y,w,h);local fw=m_floor((w-2)*p);if fw>0 then lcd.drawFilledRectangle(x+1,y+1,fw,h-2)end end

local VC="\090\091\092\093\094\095\070\001\002\003\004\015\016\017\019\030\031\040\041\050\051\060\061\080\081\082\083\084\085\086\087\088\089\100\101\102\103\104\105\106\107\108\109\110\111\112\113\114\115\116"
local function vi(n)return(string.find(VC,string.char(n),1,true))end
local function vf(n)local i=vi(n);if i then return"/SOUNDS/en/aic/"..n..".wav" end end
local function vl(n,d)local i=vi(n);if i and V[30]>5 and V[114]>.58 and X[7]>0 and V[1]==GPS_OK then local z=vs(i);vs(i,clamp(z+d,0,9));V[578]=n;V[579]=d end end
local function voice(n,p,cd)
 p=p or 2;cd=cd or 260;local vq=clamp(vQuiet/50,1,2.6)
 if p<5 and vLoad>85 then voiceBlock=i9(voiceBlock);return end
 if p<4 and (V[550])>72 then voiceBlock=i9(voiceBlock);return end
 cd=m_floor(cd*vq+.5);if vcCd>0 and(p<vcPr or n==vcLast)then voiceBlock=i9(voiceBlock);return end
 local f=vf(n);if not f then voiceBlock=i9(voiceBlock);return end;pcall(playFile,f)
 vcLast=n;vcPr=p;vcCd=cd;vcCnt=i9(vcCnt);V[570]=n;V[571]=vcCnt;V[572]=p;V[573]=cd/10;vLoad=clamp(vLoad+p*5,0,99);return n
end
local function voiceTick()
 if vcCd>0 then vcCd=vcCd-1;if vcCd==0 then vcPr=0 end end
 vLoad=clamp(vLoad*.985,0,99);vQuiet=clamp(50+vLoad*.45+(V[550])*.20+(V[386])*.10,50,99)
 if vWait>0 then vWait=vWait-1;return end
 if vBoot==1 then voice(90,5,115);vBoot=2;vWait=42
 elseif vBoot==2 then voice((memLoaded>0)and 92 or 91,5,115);vBoot=3;vWait=36
 elseif vBoot==3 then if memLoaded>0 and V[376]>0 then voice(93,5,95);pcall(playNumber,V[376],0)else voice(94,5,95)end;vBoot=4;vWait=18
 elseif vBoot==4 then voice(30,5,100);vBoot=5;vWait=20 elseif vBoot==5 then voice(95,5,140);vBoot=0 end
end
local function cue(n,p,cd)
 p=p or 2;cd=cd or 90;if V[654]==0 and p<4 then sndBlock=i9(sndBlock);return end;if p<4 and((V[36])>12 or(V[37])>10)then sndBlock=i9(sndBlock);return end;if sndCd>0 and(p<sndPr or n==sndLast)then sndBlock=i9(sndBlock);return end;if not voice(n,p,cd*2)then return end;sndCd=cd;sndPr=p;sndLast=n;V[550]=clamp((V[550])+p*2,0,99);return n
end
local function choose(a,b)return vs(vi(a))>=vs(vi(b))and a or b end
local function qs(k,n,p)V[667+k]=n+p*128+180*1024 end
local function qt()
 local b,r=0,-1;for i=668,670 do local z=V[i]-1024;V[i]=z>1024 and z or 0;if z>1024 then local n=z%128;local x=(m_floor(z/128)%8)*8+vs(vi(n)or 1);if x>r then b,r=i,x end end end;if sndCd==0 and b>0 then local z=V[b];if cue(z%128,m_floor(z/128)%8,220)then V[b]=0 end end
end
local function rpmMph(e)if V[132]<85 or V[132]>115 then V[132]=100 end;return(e/POLE)*RPM2MPH*V[132]/100 end
local pL=0;local pTH=0;local vG=1;local vGT=0;local yP=0;local pM=0;local pF=0;local eS=0;local tF=0;local gC=0;local tN=0;local tC=0;local aC=0;local pD=0;local xW=0;local qJ=0;local fC=1;local aT=0;local aR=0;local eT=0;local eM=0;local dT=0;local r0=0;local tS=0;local hD=0;local dI=0;local btT=0;local bR=0;local pB=false;local ld=0;local exR=0;local yZ=0;local yT=0;local gQ=1;local tcK=0;local offN=999;local GM={0,0,0,0,0,0};local evK=0;local evDur=0;local evPeak=0;local evEntry=0;local evReason=0;local evMin=100;local evTC=0;local evABS=0local sessOn=false;local sumSent=false;local sessNo=0;local readyDone=false;local unsafeLast=0;local unsafePending=0;local sC=50;local sM=50;local sK=50;local sB=0
local RMT={__index=function(_,k)return k==2 and 50 or 0 end};local SG=setmetatable({},{__index=function(t,k)local r=setmetatable({},RMT);rawset(t,k,r);return r end});local aiNext=0;local aiCool=0;local aiShadow=100;local aiGuard=0
local function vGear(mph,rpm,th) local g=(mph<6 and 1)or(mph<12 and 2)or(mph<19 and 3)or(mph<27 and 4)or(mph<34 and 5)or 6;if rpm>62000 and g<6 then g=g+1 elseif rpm<18000 and g>1 and th>250 then g=g-1 end;if g~=vG then vG=g;vGT=18;gC=6 end;if vGT>0 then vGT=vGT-1 end;if gC>0 then gC=gC-1 end;return vG,vGT end
local function pLead(th,br)local d=th-pTH;pTH=th;local t=0;if th>250 and d>80 then t=clamp(d/1024*3+th/1024*1.2,0,3.5)elseif br and d<-80 then t=-clamp((-d)/1024*3.5+(-th)/1024*1.2,0,4)end;pL=pL*.65+t*.35;return pL end
local function lrn(i,t,u,d,a,b)local v=L[i]or 1;local r=(t>v)and u or d;v=v+(t-v)*r;L[i]=clamp(v,a,b)end
local function segIndex(mph,gear,steer)return clamp(m_floor(clamp(mph,0,48)/2)+1+((m_abs(steer)>420)and 1 or 0)+((gear>4)and 1 or 0),1,24)end
nW={.42,-.31,.28,.18,-.16,.36,-.22,.33,.41,-.27,.19,.24,.35,.12,-.38,.29,.26,-.21,.31,.17,.14,.37,-.25,.32,.08,-.06,.04,.38,-.24,.29,-.18,.33,.22,-.31,.27,.16,-.20,.34,-.28,.25,.03,-.02,.05};N={0,.5,.5,0,0,0,0,0,0,0,0,0,0,0};local nH={0,0,0,0};local nO1,nO2,nO3=.5,.5,.5
local function na(x)return clamp(.5+x*.25,0,1)end
local function nf(a,b,c,d,e,f)
 local k=1;for j=1,4 do local z=nW[24+j];local q=k;z=z+nW[q]*a+nW[q+1]*b+nW[q+2]*c+nW[q+3]*d+nW[q+4]*e+nW[q+5]*f;nH[j]=na(z);k=k+6 end
 local h1,h2,h3,h4=nH[1],nH[2],nH[3],nH[4];nO1=na(nW[29]*h1+nW[30]*h2+nW[31]*h3+nW[32]*h4+nW[41]);nO2=na(nW[33]*h1+nW[34]*h2+nW[35]*h3+nW[36]*h4+nW[42]);nO3=na(nW[37]*h1+nW[38]*h2+nW[39]*h3+nW[40]*h4+nW[43]);return nO1,nO2,nO3
end
local om=1;local oj=0;local os=0;local ot=1;local ow=0
local function ol(p,o,v,n)local k=670+p;V[k]=clamp((V[k]>0 and V[k]or 50)+(o>0 and 1 or-1),20,80);V[680]=p;V[681]=o;V[682]=clamp(v or 0,0,99);V[683]=n or 0;if n and n>0 then vl(n,o>0 and 1 or-1)end end
local function nt(t1,t2,t3)
 local o1,o2,o3=nf(N[6],N[7],N[8],N[9],N[10],N[11]);local e1=t1-o1;local e2=t2-o2;local e3=t3-o3;local lr=.0008+.0018*(1-N[3]);N[17]=e1*((o1>0 and o1<1)and .25 or 0);N[18]=e2*((o2>0 and o2<1)and .25 or 0);N[19]=e3*((o3>0 and o3<1)and .25 or 0)
 for j=1,4 do local h=nH[j];local de=0;for o=1,3 do local k=24+o*4+j;local w=nW[k];local x=N[16+o];de=de+x*w;nW[k]=clamp(w+lr*x*h,-1.5,1.5)end;de=de*((h>0 and h<1)and .25 or 0);local q=(j-1)*6+1;for i=0,5 do nW[q+i]=clamp(nW[q+i]+lr*de*N[6+i],-1.5,1.5)end;nW[24+j]=clamp(nW[24+j]+lr*de,-1.5,1.5)end
 for o=1,3 do nW[40+o]=clamp(nW[40+o]+lr*N[16+o],-1.5,1.5)end;local er=(m_abs(e1)+m_abs(e2)+m_abs(e3))/3;N[2]=N[2]*.985+er*.015;N[3]=clamp(1-N[2],0,1);N[1]=m_min(N[1]+1,9999);V[277]=er*100
end
local function neural(a,b,c,d,e,f,learn)
 local o1,o2,o3=nf(a,b,c,d,e,f)
 if N[5]>0 then local tc=(V[38]>0)and clamp(.55+V[36]/80,.55,1)or 0;local ab=(V[39]>0)and clamp(.55+V[37]/80,.55,1)or 0;N[12]=m_max(N[12],a,d*.75,e*.45,tc);N[13]=m_max(N[13],b,d*.55,e*.35,ab);N[14]=m_max(N[14],c,d*.45,f,(V[1]~=0)and .7 or 0);N[5]=N[5]-1;if N[5]==0 then if (N[15]or 0)>0 then local ok=(N[16]==1 and N[12]>.42)or(N[16]==2 and N[13]>.42)or(N[16]==3 and N[14]>.42);vl(N[15],ok and 1 or-1);V[574]=N[15];V[575]=N[16];V[577]=ok and 1 or 0;if not ok then V[662]=109;vl(109,1)end;N[15]=0;N[16]=0 end;nt(clamp(N[12],0,1),clamp(N[13],0,1),clamp(1-N[14],0,1));o1,o2,o3=nf(a,b,c,d,e,f)end
 elseif learn>0 and getTime()%12==0 then N[6],N[7],N[8],N[9],N[10],N[11]=a,b,c,d,e,f;N[12],N[13],N[14]=a,b,m_max(c,f);N[5]=12 end
 V[270]=o1*100;V[271]=o2*100;V[272]=o3*100;V[273]=N[3]*100;V[278]=N[1]%10000;return o1,o2,o3
end
local function superBrain(mph,th,st,brakeSw,rough,contactLow,gear,spR,brR,dbR,hz,md,good,lg)
 local dl=clamp(th/1024,0,1);local sl=clamp(m_abs(st)/1024,0,1);local tr=clamp(V[114],0,1);local gb=1-tr
 local mr=(V[322]==1 and .86)or(V[322]==2 and .46)or(V[322]==4 and .10)or .23
 local p=V[361]or 1;local pr=(p==5 and .68)or(p==6 and .76)or(p==7 and .60)or(p==4 and .36)or(p==2 and .17)or(p==9 and .08)or(p==8 and .11)or .24
 local j=(V[620]>0 and V[620]~=3)and 1 or 0;local sk=V[624]>0 and 1 or 0;local pt=V[620]==3 and 1 or 0
 local r=clamp(spR*.29+brR*.23+dbR*.16+hz*.18+contactLow*.10+gb*.10+mr*.05+pr*.04+j*.18+sk*.22,0,1);V[274]=r*100;local nt,nb,nq=neural(spR,brR,dbR,hz,contactLow,gb,lg);local nd=(nt-.5)*.08+(nb-.5)*.04;r=clamp(r+nd,0,1);V[275]=nd*100;V[276]=r*100
 if good>0 and sl<.18 and mph>18 then r=r*.62 end
 local si=segIndex(mph,gear,st);local a=SG[si];local nx=SG[clamp(si+1,1,24)]
 if V[401]~=si then a[8]=m_min(a[8]+1,99);V[401]=si end
 local fm=m_min((a[8]-1)/5,1)*m_max(1-a[7]/55,0);local nr=m_min(nx[1]/2+nx[3]/18+nx[4]/15,1)
 aiNext=clamp(nr*(.35+m_min(nx[7]/45,1)*.65)+.10-fm*.12+(V[403]>0 and .12 or 0),0,1)
 if lg>0 then a[1]=a[1]*.986+r*1.4;a[2]=a[2]+((1-r)*100-a[2])*.016;a[3]=a[3]*.965+(V[38]>0 and 7 or 0);a[4]=a[4]*.975+(spR+brR)*2.5
  if r>.38 then a[7]=clamp(a[7]+r*1.5,0,99)elseif good>0 then a[7]=a[7]*.972 end
 end
 local atk=clamp(74+dl*18+good*12-r*48-gb*14,0,99)
 local tc=clamp(48+spR*49+hz*16+contactLow*16+aiNext*10+nt*12,0,99)
 local ab=brakeSw and clamp(50+brR*45+hz*14+contactLow*9+nb*12,0,99)or 0
 local ry=clamp(48+sl*22+rough*24+spR*18-pt*8-r*12,0,99)
 local jp=j>0 and clamp(66+V[410]*.28+V[426]*.20,0,99)or 0
 local es=sk>0 and clamp(78+dl*18,0,99)or 0
 local dg=gb>.45 and clamp(58+gb*36+md*28,0,99)or 0
 local ca=clamp(62+good*25+(1-r)*20-(V[342]or 0)*1.1,0,99)
 local mo=1;local bs=atk;if tc>bs then mo=2;bs=tc end;if ab>bs then mo=3;bs=ab end;if ry>bs then mo=4;bs=ry end;if jp>bs then mo=5;bs=jp end;if es>bs then mo=6;bs=es end;if dg>bs then mo=7;bs=dg end;if ca>bs then mo=8;bs=ca end;local un=clamp(100-m_abs(bs-atk)*2,0,99)
 if om~=mo then if om==1 then ol(1,(good>0 and r<.35)and 1 or 0,r*100,r<.35 and 111 or 102)elseif om==4 then ol(4,(rough<.38 and V[38]==0 and V[39]==0)and 1 or 0,rough*100,om==4 and 111 or 0)elseif om==5 then ol(5,(V[620]==0 and V[35]>82)and 1 or 0,100-V[35],V[620]==0 and 85 or 86)elseif om==6 then ol(6,(sk==0 and mph>2)and 1 or 0,dl*100,sk==0 and 89 or 88)elseif om==7 then ol(7,(good>0 and md<.35)and 1 or 0,md*100,good>0 and 41 or 40)elseif om==8 then ol(8,(r<.42 and good>0)and 1 or 0,r*100,(r<.42 and 108 or 109))end;om=mo end
 if oj>0 and V[620]==0 then ol(5,(V[35]>82 and V[38]==0)and 1 or 0,100-V[35],V[35]>82 and 87 or 86)end;oj=V[620]
 if os>0 and sk==0 then ol(6,mph>2 and 1 or 0,dl*100,mph>2 and 89 or 105)end;os=sk
 if ot~=good and good>0 then ol(7,(V[114]>.58 and md<.4)and 1 or 0,md*100,41)end;ot=good;local w=(V[503]>58 and 1)or(V[513]>55 and 2)or(V[520]>70 and 3)or 0;if ow>0 and w==0 then ol(1,good>0 and 1 or 0,r*100,111)end;ow=w
 if V[38]>0 or V[39]>0 or j+sk>0 then V[650]=2;V[651]=24 elseif V[651]>0 then V[651]=V[651]-1;V[650]=2 elseif r>.30 then V[650]=1 else V[650]=0 end;local bp=(mo>1 and mo<8)and mo or 1;if mo>1 and mo<4 and V[678]>V[670+mo]+8 then bp=8 end;V[652]=bp;V[658]=mo;V[653]=(mo==4 and 108)or(mo==5 and 112)or(mo==6 and 92)or(mo==7 and 88)or 100
 local cut=0;local cap=100;local rel=1
 if mo==2 then cut=r*8+spR*6;cap=97;rel=.86 elseif mo==3 then cut=brR*10+r*3;cap=96;rel=.80
 elseif mo==4 then cut=rough*3+spR*3;cap=98;rel=.94 elseif mo==5 then cut=r*5;cap=97;rel=.82
 elseif mo==6 then rel=1.10 elseif mo==7 then cut=r*6+gb*4;cap=96;rel=.78 elseif mo==8 then rel=1.08 end
 if pt>0 then cut=cut*.45;cap=m_max(cap,98);rel=m_max(rel,1.02)end
 local h=clamp((V[344]or 80)*.34+(V[347]or 80)*.30+(V[375]or 50)*.20+(100-(V[343]or 0))*.16,0,99)
 local d=clamp(m_abs(r-mr)*55+m_abs(r-pr)*35+(V[342]or 0)*.8+(V[343]or 0)*.7+md*20,0,99)
 local t=clamp(tr*42+h*.28+(1-r)*20+(V[374]or 50)*.12+nq*10-d*.10,0,99)
 local au=clamp(100-r*28+(t-50)*.18-d*.08+((V[370]or 50)-50)*.05,72,110)
 local mm=clamp(100-d*.20-r*8+((V[371]or 50)-50)*.10,80,110)
 local lm=clamp(100+(t-50)*.20-r*17-d*.09+((V[372]or 50)-50)*.15,58,110)
 local sf=(t<34 or d>70 or h<35)and 1 or 0;V[654]=(sf>0 and 0)or((mo==2 or mo==3 or mo==5 or mo==7)and 2)or 1;V[655]=(lg>0 and sf==0 and good>0)and 1 or 0
 V[180]=mo;V[181]=(mo==2 and 1)or(mo==3 and 2)or(mo==7 and 3)or(mo==5 and 4)or(mo==6 and 5)or(mo==4 and 6)or 0
 V[182]=t;V[183]=r*100;V[184]=d;V[185]=h;V[186]=si;V[187]=aiNext*100;V[188]=cut;V[189]=cap;V[190]=rel*100;V[191]=bs;V[192]=a[2];V[193]=a[3];V[194]=a[4];V[195]=good*100
 V[205]=r*100;V[206]=mo;V[207]=cut;V[208]=cap;V[209]=rel*100;V[210]=spR*100;V[211]=brR*100;V[212]=dbR*100
 V[380]=h;V[381]=r*100;V[382]=t;V[383]=au;V[384]=mm;V[385]=lm;V[386]=d;V[387]=mo;V[388]=sf;V[389]=clamp((V[389]or 80)*.95+h*.05,0,99)
 V[540]=ca;V[541]=t;V[542]=clamp((V[542]or 70)+(t-(V[542]or 70))*((t<(V[542]or 70))and .010 or .003),0,99);V[543]=sf;V[544]=mo;V[545]=clamp((t+h+(V[533]or 50))/3-(V[302]or 0)*.18,0,99);V[551]=clamp(50+(V[550]or 0)*.40+vLoad*.22+d*.10+sf*18,50,99)
 V[223]=(mo==2 and 1)or(mo==3 and 2)or(mo==7 and 3)or(mo==4 and 4)or(mo==5 and 5)or(mo==6 and 6)or 0;V[287]=0;V[230]=m_min(a[7]/45,1)*100;V[402]=p2221(fm*100,aiNext*100,V[403],mo)
 local s1=V[662];local p1=4;local s2=0;local p2=3;local s3=0;local p3=2;local go=V[1]==GPS_OK and 1 or 0
 if s1>0 then V[662]=0 elseif V[620]==2 then s1=84 elseif V[620]==3 then s1=(V[38]>0 and 104 or 85) elseif V[620]==4 then s1=86
 elseif V[621]>0 and V[620]==0 then s1=87 elseif sk>0 then s1=(dl>.34 and 105 or 88) elseif sk==0 and (V[657]==88 or V[657]==105) then s1=89
 elseif V[39]>0 and V[37]>12 then s1=(lg>0 and choose(101,106)or 51) elseif V[38]>0 and V[36]>18 then s1=(lg>0 and choose(100,106)or 50)
 elseif go~=V[663] then s1=(go>0 and 41 or 40) elseif V[1]~=GPS_OK then s1=40 end
 if sf>0 then s2=choose(h<35 and 31 or 115,103);p2=4 elseif dbR>.58 then s2=30 elseif tr<.48 then s2=choose(103,115) elseif r>.58 then s2=choose(102,17) elseif nq>.72 and r>.30 then s2=choose(108,116) elseif N[5]>0 then s2=116 elseif a[8]>5 and aiNext>.28 then s2=choose(113,108) elseif lg>0 and good>0 then s2=choose(106,107) end
 if V[680]>0 and V[681]>0 then s3=choose(61,111) elseif V[680]>0 and V[681]==0 then s3=choose(60,109)
 elseif V[239]<38 then s3=110 elseif V[239]>82 and good>0 then s3=111 elseif V[239]<55 and V[232]>0 then s3=112 elseif V[503]>58 then s3=80 elseif V[513]>55 then s3=81 elseif V[520]>70 then s3=82 elseif V[530]>88 then s3=83 elseif p==6 then s3=16 elseif p==7 then s3=17 elseif p==9 then s3=19 elseif p==5 then s3=15 elseif V[322]==1 then s3=1 elseif V[322]==2 then s3=2 elseif V[322]==3 then s3=(good>0 and 4 or 3) end
 V[663]=go;if s1~=V[657] then V[657]=s1;if s1>0 then qs(1,s1,p1)end end;if s2~=V[665] then V[665]=s2;if s2>0 then qs(2,s2,p2)end end;if s3~=V[667] then V[667]=s3;if s3>0 then qs(3,s3,p3)end end;V[659]=mo;V[660]=V[223];V[661]=un;qt()
 return cut,cap,rel,clamp(au/100,.88,1.08),clamp(mm/100,.80,1.10),clamp(lm/100,.58,1.10)
end
local function aiGate(moving,mph,rM,rough,hz,brake)
local md=(mph>3 and rM>1)and clamp(m_abs(rM-mph)/(mph+3),0,1)or 0;local g=clamp(V[114]*.44+gQ*.22+(1-V[119])*.20+(1-md)*.14,0,1)
if moving and mph>3 and V[114]>.45 then V[224]=clamp((V[224])+1,0,900)else V[224]=clamp((V[224])-3,0,900)end
if not moving or V[23]>0 or mph<3 then g=g*.35 end;if V[161]>0 or V[164]>0 or rough>0 then g=g*.72 end;if brake then g=g*.90 end;if hz>.65 then g=g*.82 end
if hz>.68 or V[36]>25 or V[37]>25 then aiCool=25 elseif aiCool>0 then aiCool=m_max(0,aiCool-(.85+((V[371]or 50)-50)/100)) end
local gr=0;if not moving or mph<3 then gr=1 elseif g<=.58 then gr=2 elseif V[114]<=.62 then gr=3 elseif V[119]>=.48 then gr=4 elseif V[224]<=45 then gr=5 elseif aiCool>0 then gr=6 elseif V[23]>0 then gr=7 elseif V[161]>0 or V[164]>0 then gr=8 end
local l=(gr==0)and 1 or 0;V[288]=gr
V[215]=g*100;V[216]=md*100;V[217]=l*100;V[218]=aiCool;return g,l
end
local function learn(moving,slipRatio,spin,lock,rough,gtrust)
local t=gtrust or 0;local gpsBad=clamp((0.65-t)/0.65,0,1);local r=clamp(m_max(rough or 0,gpsBad*0.65),0,1)
local sp=clamp(m_max(slipRatio or 0,(spin or 0)*0.7),0,1);local real=(t>0.62 and r<0.45)and sp or 0;local fspin=m_max(r,gpsBad)*sp
local good=(moving and t>0.70 and sp<0.18 and r<0.25 and (lock or 0)<0.2)and 1 or 0
local tc=V[38]>0 and 1 or 0;local ab=V[39]>0 and 1 or 0;local tcBig=V[36]>22 and 1 or 0;local abBig=V[37]>22 and 1 or 0
local tcGood=tc*clamp(0.55-sp,0,0.55)/0.55;local tcWeak=tc*clamp(sp-0.45,0,0.55)/0.55;local tcHarsh=tc*tcBig*clamp(0.30-sp,0,0.30)/0.30
local abGood=ab*(lock or 0)*clamp(0.85-r,0,0.85)/0.85;local abHarsh=ab*abBig*clamp(0.35-(lock or 0),0,0.35)/0.35;local u=0.10;local d=0.025
lrn(1,1+good*0.03+r*0.02-tcHarsh*0.04,u,d,0.92,1.08)
lrn(2,1+real*0.12+good*0.05-fspin*0.10,u,d,0.85,1.25)
lrn(3,1+abGood*0.08+r*0.04+tcWeak*0.05-tcHarsh*0.08,u,d,0.85,1.20)
lrn(4,1+fspin*0.32+gpsBad*0.20-real*0.10-good*0.04,u,d,0.75,1.45)
lrn(5,1+fspin*0.42+tcHarsh*0.28-real*0.22-tcWeak*0.18,u,d,0.70,1.60)
lrn(6,1+tcWeak*0.22-tcHarsh*0.35-fspin*0.30,u,d,0.50,1.25)
lrn(7,1+fspin*0.35+gpsBad*0.20+abHarsh*0.25-abGood*0.18,u,d,0.75,1.60)
lrn(8,1+real*0.10+tcWeak*0.12-fspin*0.22-tcHarsh*0.18,u,d,0.70,1.28)
lrn(9,1+good*0.10+tcGood*0.08-r*0.10-tcWeak*0.08,u,d,0.78,1.22)
if not moving then for i=1,9 do lrn(i,1,0.015,0.015,0.5,1.6)end end
end
local function gripSM(moving,slip,tcActive,fakeScore,realScore)
if not moving then V[135]=0;V[136]=0;V[137]=0;V[138]=0;V[140]=V[140]*0.90;return end
local st=V[135]
if tcActive>0 or(slip>2.0 and(realScore or 0)>0.25)then
if st==0 then V[139]=slip;V[136]=0 end
V[135]=1;V[136]=V[136]+1
if slip<1.2 then V[135]=2;V[137]=0 end
elseif st==1 then
V[135]=2;V[137]=0
elseif st==2 then
V[137]=V[137]+1
if slip<1.0 then
local q;if V[137]<=4 then q=0.08 elseif V[137]<=12 then q=0.03 elseif V[137]<=25 then q=-0.03 else q=-0.08 end
if(fakeScore or 0)>0.45 then q=q*0.25 end
V[140]=q;V[40]=clamp(V[40]+q,0.25,1);V[135]=3;V[138]=20
elseif V[137]>28 then
V[140]=-0.06;V[40]=clamp(V[40]-0.06,0.25,1);V[135]=3;V[138]=20
end
elseif st==3 then
V[138]=V[138]-1
if slip>2.0 and V[138]>0 then
V[140]=-0.05;V[40]=clamp(V[40]-0.05,0.25,1);V[135]=1;V[136]=0;V[139]=slip
elseif V[138]<=0 then V[135]=0;V[140]=V[140]*0.85 end
end
if V[135]==0 then
if slip<1 then V[40]=clamp(V[40]+(1-V[40])*0.012,0.25,1)else V[40]=clamp(V[40]-slip*0.0012,0.25,1)end
end
end
local function battery(rx)
if rx<=3.5 then return V[57]end;if rx>V[58]then V[58]=rx end;if V[60]==0 then V[60]=rx end
if V[59]==0 and V[58]>3.5 then V[59]=clamp(m_floor(V[58]/4.2+0.5),1,6)end
local c=V[59];if c==0 then c=4 end;local raw=clamp(rx/(c*4.2)*100,0,100);V[57]=V[57]+(raw-V[57])*0.02;setgv(5,V[57]);return m_floor(V[57]+0.5)
end
local function condBrain(moving,mph,e,rM,th,thDelta,st,dSt,brake,brakeLoad,slip,tcCut,absCut,md,btl,rq,sats,brR,spR,hz,good,scare)
 if not moving then return end
 if V[502]==0 or btl>V[502]then V[502]=btl end
 local sag=clamp((V[502]or btl)-btl,0,99);V[501]=clamp((V[501])*.96+sag*.04,0,99)
 V[505]=clamp((V[505]or btl)*.992+btl*.008-(th>250 and .003 or .001),0,99);V[500]=clamp((V[500]or 85)*.992+(100-(V[501])*2)*.008,0,99);V[503]=clamp((V[503])*.996+clamp((V[505]or btl)-btl,0,30)*.025+(V[262])*.012-(V[262]<8 and .08 or 0),0,99);V[504]=clamp((V[505]or btl)*.45+(rq or 0)*.22+(sats>=5 and 22 or 7)-(V[501])*.35,0,99)
 local rear=clamp((slip*mph)*.10+(tcCut or 0)*.65+((th>450)and 8 or 0)+(V[38]>0 and 8 or 0),0,99)
 local front=clamp((absCut or 0)*1.10+brR*42+brakeLoad*22+m_abs(st)/1024*16+(V[39]>0 and 9 or 0),0,99)
 V[510]=clamp((V[510]or 20)+((rear-(V[510]or 20))*((rear>V[510])and .035 or .010)),0,99);V[511]=clamp((V[511]or 20)+((front-(V[511]or 20))*((front>V[511])and .035 or .012)),0,99)
 local tireAvg=((V[510])+(V[511]))*.5;V[512]=clamp(100-m_abs(tireAvg-48)*1.25-(V[513])*.25,0,99);V[513]=clamp((V[513])*.985+clamp(tireAvg-62,0,40)*.05+((tcCut or 0)+(absCut or 0))*.012,0,99)
 local jit=clamp(m_abs(dSt)/520+m_abs(thDelta)/820+(brake and m_abs(thDelta)/900 or 0),0,1);local evt=((tcCut or 0)>2 or(absCut or 0)>2)and 1 or 0
 V[520]=clamp((V[520]or 20)*.985+(jit*55+evt*18+(V[343])*.5+hz*18)*.015,0,99);V[521]=clamp(100-(V[520])*.75-(V[204])*.25,0,99);V[522]=clamp((V[522])*.995+((V[300])>900 and V[520]>45 and .12 or 0)-((good>0 and V[520]<25)and .04 or 0),0,99);V[523]=clamp(100-(V[520])*.55-(V[522])*.35-(V[342])*.7,0,99)
 V[530]=clamp((V[347]or 80)*.38+(V[512]or 80)*.18+(V[521]or 80)*.16+(good>0 and 18 or 0)-scare*12-md*18,0,99);V[531]=clamp((V[531]or 50)+(V[530]-50)*.001+(((tcCut or 0)>2 and good>0)and .012 or 0),0,99);V[532]=clamp((V[532]or 50)+(V[530]-50)*.001+(((absCut or 0)>1 and brake)and .012 or 0),0,99);V[533]=clamp((V[303]or 100)*.30+(V[530])*.32+(V[521])*.16+(V[500]or 80)*.10-(V[513])*.18,0,99)
 V[534]=(V[503]>35 and 3)or(V[513]>28 and 4)or(V[520]>55 and 5)or(V[530]>78 and 2)or 1
 if V[503]>42 then V[339]=clamp((V[339]or 50)-.004,35,65);V[340]=clamp((V[340]or 50)-.003,35,65)end
 if V[513]>35 then V[337]=clamp((V[337]or 50)+.004,35,65);V[338]=clamp((V[338]or 50)+.003,35,65)end
 if V[520]>55 then V[336]=clamp((V[336]or 50)-.005,35,65);V[361]=((V[361]or 1)==9)and 2 or V[361]end
end
local function updateClassifier(mph,steerDelta,drift)
local steer=m_abs(steerDelta);local dr=drift and 1 or 0
V[71]=V[71]+(mph-V[71])*.24;V[79]=V[79]+(mph-V[79])*.10;V[72]=V[72]+(mph-V[72])*.03;V[82]=V[82]+(mph-V[82])*.01
V[73]=V[73]+(steer-V[73])*.24;V[80]=V[80]+(steer-V[80])*.10;V[74]=V[74]+(steer-V[74])*.035
V[75]=V[75]+(dr-V[75])*.24;V[81]=V[81]+(dr-V[81])*.10;V[76]=V[76]+(dr-V[76])*.035
local mot=clamp(m_abs(mph-V[82])/3,0,1)*.45+clamp(steer/600,0,1)*.22+dr*.33
local lat=clamp(V[413]/100,0,1);local lon=clamp(V[412]/100,0,1);local vr=clamp(V[415]/100,0,1);local obs=clamp(V[414]/100,0,1)
V[85]=V[85]+(mot-V[85])*.055;V[86]=V[86]+(V[85]-V[86])*.018
local score=clamp(V[85]*.34+V[86]*.18+lon*.28+lat*.15+vr*.12-(1-obs)*.12,0,1);V[64]=score;V[418]=clamp(obs*100-m_abs(score-(V[417]or score))*45,0,99);V[417]=score
local cand=1;if lon>.58 and lat<.42 then cand=4 elseif lat>.57 then cand=3 elseif score>.29 or lon>.28 or vr>.36 then cand=2 end
if V[410]>48 or V[620]>0 then cand=V[6]end
local hold=(V[409]>62 and obs>.62 and 18)or((V[410]>25 or obs<.48)and 60)or 36
if cand==V[7]then V[8]=V[8]+1;if V[8]>=hold and cand~=V[6]then V[416]=V[6]*10+cand;V[6]=cand;setgv(4,cand-1);V[8]=0 end else V[7]=cand;V[8]=0 end
end
local function update(gps,e,st,sats,thrAbs,th,btl,rq)
if X[17]<100 then X[17]=X[17]+1 elseif X[17]==100 then X[17]=101;X[7]=(V[292]==31 and gv(3)>=95 and gv(7)>=1000)and 1 or 0;X[29]=p2221(5,X[7],gv(3),gv(7)/103) end
if rq<V[61]then V[61]=rq end;if rq<90 then V[62]=V[62]+1 else V[62]=0 end
local rM=rpmMph(e);local mph
local thDelta=th-V[20];V[20]=th;local brake=th<-100;if pB and not brake then bR=5 elseif bR>0 then bR=bR-1 end;if bR>0 and th>120 and thDelta>45 then btT=10;bR=0 elseif btT>0 then btT=btT-1 end;pB=brake
local erpmDelta=m_abs(e-V[27]);local spin=(erpmDelta>6500)and 1 or 0;local rpmDrop=V[27]-e;V[27]=e
if sats>=5 then V[1]=GPS_OK;V[2]=0;V[3]=gps;V[5]=1.0 elseif sats>=4 then V[1]=GPS_COAST;V[2]=V[2]+1;V[5]=0.55 else V[2]=V[2]+1;if V[2]>150 then V[1]=GPS_LOST end;V[5]=0.25 end;gQ=gQ+(V[5]-gQ)*((V[5]>gQ)and .018 or .006)
if V[1]==GPS_OK then local up=(th>120 and not brake and rM>gps and(erpmDelta>850 or thDelta>160));local dn=(brake and rM<gps and(rpmDrop>850 or thDelta<-160));local lg=clamp(V[174]/100,0.30,0.72);local bg=clamp(V[177]/100,0.25,0.70);local lead=up and clamp((rM-gps)*lg,0,8.5)or 0;local pull=dn and clamp((gps-rM)*bg,0,7.5)or 0;mph=clamp(gps+lead-pull,0,m_max(gps,rM));if up then local e1=gps-V[175];if V[176]>0 then if e1>1.2 then V[174]=m_min(V[174]+0.25,72)elseif e1<-1.2 then V[174]=m_max(V[174]-0.35,30)end end;V[176]=1 else V[176]=0 end;if dn then local e2=pM-gps;if pF>0 then if e2>1.2 then V[177]=m_min(V[177]+0.25,70)elseif e2<-1.2 then V[177]=m_max(V[177]-0.35,25)end end;pF=1 else pF=0 end;V[175]=mph;pM=mph;V[3]=mph;V[4]=V[4]+(mph-V[4])*0.65 elseif V[1]==GPS_COAST then if brake then V[3]=V[3]*0.982 elseif thrAbs<50 then V[3]=V[3]*0.990 end;mph=V[3];V[4]=V[4]+(mph-V[4])*0.30 else local bias=(SURF[V[6]]or SURF[1])[7];if rM<1 then V[69]=1 -- no GPS or usable RPM speed: decay last known speed
;V[3]=V[3]*0.985;mph=V[3]else V[69]=0;mph=rM*bias end;V[4]=V[4]+(mph-V[4])*0.18 end
local md=(gps>1 and rM>1)and clamp(m_abs(rM-gps)/(gps+3),0,1)or 0;if gps==X[4]and mph>2 and th>150 then X[5]=m_min(99,X[5]+1)else X[5]=m_max(0,X[5]-2)end;X[4]=gps;V[166]=clamp((V[1]==GPS_OK and sats>=5 and 95)or(V[1]==GPS_COAST and 58)or 8,0,99);V[167]=clamp((rM>1 and 82-clamp(md*45,0,50))or 5,0,99);if V[69]>0 then V[169]=i9(V[169])else V[169]=0 end;V[168]=clamp((V[1]==GPS_OK and V[166])or(rM>1 and V[167])or m_max(0,55-(V[169])*2),0,99);local pp=pLead(th,brake);if pp~=0 then mph=clamp(mph+pp,0,m_max(m_max(gps,rM),mph)+3.5)end
local gear,shift=vGear(mph,e,thrAbs)
if V[1]==GPS_OK and sats>=5 and gps>7 and e>2000 and not brake and V[16]==0 and V[23]==0 and V[38]==0 and V[39]==0 and V[119]<.35 and m_abs(thDelta)<180 and erpmDelta<2500 and rM>1 then local rs=clamp(V[132]*gps/rM,85,115);V[132]=V[132]+(rs-V[132])*.004;X[1]=0;X[2]=m_min(99,X[2]+1);X[3]=m_min(99,X[3]+.2)else X[6]=X[6]+1;if X[6]>=50 then X[6]=0;X[1]=m_min(99,X[1]+1);X[3]=m_max(0,X[3]-.2)end end
if mph>V[32]then V[32]=mph end
local slip=0;if V[1]==GPS_OK and gps>1 and e>100 then slip=m_max(rM-gps,0);V[34]=1 elseif V[1]==GPS_COAST then slip=m_max(rM-V[3],0)*0.65;V[34]=1 else V[34]=0 end;V[33]=slip
local cls=0;local ws=0;local gglt=0;local blp=0;local rml=0;if V[1]==GPS_OK then if th>250 and rM>gps+2.2 and erpmDelta>1200 then cls=1;ws=clamp((rM-gps)/10+erpmDelta/28000,0,1)elseif gps>pM+4 and erpmDelta<1800 then cls=2;gglt=clamp((gps-pM)/10,0,1)elseif brake and rpmDrop>4200 and gps>4 then cls=3;blp=clamp(rpmDrop/18000,0,1)elseif md>.42 and erpmDelta<2200 then cls=4;gglt=clamp(md,0,1)end elseif e<300 and gps>3 then cls=5;rml=clamp(gps/20,0,1)end;V[232]=cls;V[233]=ws*100;V[234]=gglt*100;V[235]=blp*100;V[236]=rml*100;V[237]=md*100;if(cls==2 or cls==4)and V[1]==GPS_OK and mph>3 then V[246]=8;V[247]=clamp((V[247]or mph)*.72+rM*.28,0,m_max(mph,rM)+2);mph=lerp(mph,V[247],.62);V[248]=2 elseif V[246]>0 then V[246]=V[246]-1;mph=lerp(mph,V[247]or mph,.36);V[248]=3 else V[247]=mph;V[248]=(V[1]==GPS_OK and 1)or(V[1]==GPS_COAST and 4)or 5 end
local oldSt=V[28];local dSt=st-oldSt;V[28]=st;sR=sR*.75+clamp(m_abs(dSt)/220,0,1)*.25
local ms=mph*.44704;local yr=(ms<.5)and 0 or ms*m_tan(clamp(st/1024,-1,1)*MAX_STEER*m_pi/180)/WB;V[13]=V[13]*.9+yr*.1;V[12]=(ms<1)and 0 or clamp(m_atan(V[13]*WB/ms)*57.2958,-30,30);local ay=m_abs(V[13]);yT=clamp(yT+(((ay-yZ)>.02 and th>180 and m_abs(st)>140)and .12 or -.04),0,1);yZ=ay
V[17]=V[16];V[16]=V[16]>0 and 1 or 0
local driftThresh=3.1*L[4];local steerSig=m_abs(st)>=220;local rateSig=m_abs(dSt)>=105 or sR>srt/100;local angleSig=m_abs(V[12])>=6.5;local driftSig=(V[34]>0 and slip>=driftThresh and(steerSig or angleSig or rateSig))or(V[34]==0 and mph>3 and(angleSig or(steerSig and rateSig)))
if driftSig then V[14]=V[14]+1;V[15]=0;if V[14]>=3 then V[16]=1 end else V[15]=V[15]+1;V[14]=0;if V[15]>=V[105] then V[16]=0 end end
if V[17]>0 and V[16]==0 then eS=18 end;if eS>0 then eS=eS-1 end
local obs=clamp(V[168],0,99);local gap=m_max(rM-mph,0);local flare=clamp(erpmDelta/18000,0,1);local lon=clamp(gap/9*.55+slip/8*.30+((V[38]>0)and .18 or 0),0,1);local lat=clamp(m_abs(V[12])/16*.45+sR*.28+(V[16]>0 and .32 or 0),0,1);local var=clamp(m_abs(mph-V[71])/4*.55+md*.35,0,1)
local dg=gap-(V[420]or gap);V[420]=gap;V[421]=(V[421])*.7+dg*.3;V[422]=clamp((V[422])+((mph>4 and obs>48 and(th>100 or gap>3))and 1 or -1),0,9)
local j=clamp(gap*5+V[421]*28+flare*28+(V[422]>2 and 12 or 0)-md*35,0,99);local w=clamp(lon*70+th/40+m_max(mph-V[155],0)*8,0,99);local x=clamp(md*90+(obs<45 and 20 or 0)-flare*25,0,99);local l=clamp(-V[421]*35+rpmDrop/250+(rM<mph+3 and 20 or 0),0,99)
V[423]=V[423]+(j-V[423])*.24;V[424]=V[424]+(w-V[424])*.2;V[425]=V[425]+(x-V[425])*.2;V[426]=V[426]+(l-V[426])*.28;V[409]=V[424];V[410]=V[423];V[412]=V[412]+(lon*100-V[412])*.12;V[413]=V[413]+(lat*100-V[413])*.09;V[415]=V[415]+(var*100-V[415])*.06;V[414]=V[414]+(obs-V[414])*.12;V[418]=(m_abs(j-w)<14 and m_max(j,w)>32)and 75 or 0
local jp=V[620];if jp==0 then if V[119]*100<22 then X[12]=1 end;if X[12]>0 and V[410]>20 and V[423]>V[425]+7 then V[620]=1;V[604]=1;X[8]=(X[8]%99)+1;X[9]=0 end elseif jp==1 then V[604]=V[604]+1;if V[410]>36 or(V[423]>46 and V[604]>1)then V[620]=2;V[621]=12 elseif V[604]>7 or V[410]<9 then X[9]=1;V[620]=0;V[604]=0 end elseif jp==2 then V[604]=V[604]+1;if V[426]>38 then X[9]=3;V[620]=3;V[621]=18;X[10]=V[119]*100;X[12]=0 elseif V[604]>18 then X[9]=2;V[620]=4;V[621]=9;X[10]=V[119]*100;X[12]=0 end else X[10]=m_min(X[10],V[119]*100);if X[10]<22 and V[119]*100-X[10]>16 and V[119]*100-X[11]>2 then X[12]=1 end;if jp==3 and X[12]>0 and V[410]>20 and V[423]>V[425]+7 then V[620]=1;V[604]=1;X[8]=(X[8]%99)+1;X[9]=0;X[12]=0 elseif V[621]>0 then V[621]=V[621]-1 else V[620]=0;V[604]=0 end end;X[11]=V[119]*100;if V[620]~=jp then if(jp==1 and V[620]==0)or(jp==2 and V[620]>=3)then X[24]=p2221(X[8],9,X[9],(V[38]>0 and 1 or 0)+(V[39]>0 and 2 or 0))elseif not(jp>=3 and V[620]==0)then X[24]=p2221(X[8],jp,V[620],X[9])end;X[25]=p2221(clamp(md*100,0,99),clamp(V[119]*100,0,99),clamp(j,0,99),clamp(l/10,0,9))end;if V[620]>0 and V[620]~=3 then V[603]=m_max(V[603],14);V[409]=m_max(0,V[409]-2)end;updateClassifier(mph,dSt,V[16]>0)
local tr=m_abs(st)>130;local ph=not tr and 0 or(brake and 1)or((V[16]>0 or slip>2.5)and 2)or(th>120 and 4)or 3
if V[605]~=V[6]then V[404]=V[404]+1;if V[404]>18 then V[605]=V[6];V[603]=60;V[403]=90;V[404]=0 end else V[404]=0;V[603]=m_max(0,V[603]-1)end;V[403]=m_max(0,V[403]-1)
V[606]=clamp((V[606])+((V[38]>0 or V[39]>0)and 12 or -1),0,99)
if ph>0 then if V[600]==0 then V[614]=mph;V[615]=0;V[616]=0;V[613]=(st<0)and 1 or 2 end;V[615]=m_max(V[615],slip);if V[38]>0 or V[39]>0 then V[616]=1 end elseif V[600]>0 and V[603]==0 and V[604]==0 and V[627]>0 then local z=clamp(50+(mph-V[614])*4-(V[615])*2-(V[616])*12,0,99);V[601]=z;V[602]=trait(V[602],z,.01);V[(V[613]==1)and 607 or 608]=trait(V[(V[613]==1)and 607 or 608],z,.012);V[610]=trait(V[610],100-m_abs(z-50)-V[606]*.2,.01);if V[616]==0 then V[611]=i9(V[611]);V[612]=trait(V[612],z,.015)end end
V[600]=ph;V[609]=brake and(tr and 2 or 1)or 0
if m_abs(slip-(V[622]or slip))>3.5 and mph>5 and V[38]==0 then V[603]=m_max(V[603],20)end;V[622]=slip
V[623]=clamp(V[623]+((th>350 and mph<1.5 and rM>4)and 1 or -2),0,60);V[624]=(V[623]>24)and 1 or 0;if mph>3 or th<100 then V[623]=0;V[624]=0 end;if V[624]~=X[13]then X[29]=p2221(1,V[624],clamp(th/11,0,99),clamp(mph*3,0,9));X[13]=V[624]end
V[625]=clamp(V[625]+((m_abs(V[607]-V[608])>14)and .04 or -.01),0,99);if ((V[625]>70)and 1 or 0)~=X[14]then X[29]=p2221(2,(V[625]>70)and 1 or 0,V[625],m_abs(V[607]-V[608])/10);X[14]=(V[625]>70)and 1 or 0 end
V[628]=clamp(V[628]+(((V[262])>55 and(V[505])>60 and(V[501])<8)and .04 or -.01),0,99);if ((V[628]>70)and 1 or 0)~=X[15]then X[29]=p2221(3,(V[628]>70)and 1 or 0,V[628],V[501]/10);X[15]=(V[628]>70)and 1 or 0 end;if V[625]>70 or V[628]>70 then V[603]=m_max(V[603],15)end
V[626]=clamp(V[626]+((mph>7 and(m_abs(st)>100 or th>300 or brake or V[38]>0 or V[39]>0))and 2 or -.5),0,99);V[627]=(V[626]>30)and 1 or 0
if V[600]==0 and ph>0 then local sm=SG[aiSeg];sm[7]=clamp((sm[7]or 0)+(50-(V[601]or 50))*.02,0,99)end
local s=SURF[V[6]]or SURF[1];local base=s[2];if mph>=s[5]then base=s[3]elseif mph>s[4]then base=lerp(s[2],s[3],(mph-s[4])/(s[5]-s[4]))end
local agr=gv(2);local sxp=gv(0);local ecu=gv(8);local bmx=gv(6);local tct=gv(7);if tct>100 then tct=tct/10.24 end;tct=clamp(tct,0,100)
local smart=base*(0.80+ecu*0.004)*(1.10-agr*0.003)*(1.05-sxp/400)*(0.90+btl/1000)*(1+(100-tct)/1000)*(1-bmx*0.0008)*L[1]*(V[91]/100)
if V[16]>0 then smart=smart*s[6]*L[2]*(V[92]/100) end;smart=smart+clamp(m_abs(V[12])/30*30,0,30)
local counter=(V[16]>0 and m_abs(V[12])>3 and st*V[12]<0);if counter then smart=smart*(V[108]/100)end;smart=smart+(50-V[601])*.05+V[409]*.035-V[410]*.025+(tr and(50-(st<0 and V[607]or V[608]))*.04 or 0)+aiNext*5+(V[603]>0 and 3 or 0)+(V[625]>70 and 4 or 0);if V[628]>70 then smart=smart-3 end;if(V[604]>0 and V[604]<4)or V[620]==3 then smart=m_max(smart,145)end
if thDelta<-150 and mph>s[4]then V[21]=1;V[22]=8 end;if V[22]>0 then V[22]=V[22]-1 else V[21]=0 end
if V[17]>0 and V[16]==0 then V[50]=1;V[51]=18 end;if V[51]>0 then V[51]=V[51]-1 else V[50]=0 end
if V[45]==0 and m_abs(st)>360 and m_abs(dSt)>180 then V[45]=1;V[46]=16;V[47]=st>0 and 1 or -1 end
if V[45]>0 then V[46]=V[46]-1;if V[46]<=0 then V[45]=0 elseif(st*V[47]<0 and m_abs(dSt)>180)then V[48]=1;V[49]=10;V[45]=0 end end
if V[49]>0 then V[49]=V[49]-1 else V[48]=0 end
if erpmDelta>(6500*(100/clamp(V[94],50,150))) then V[41]=1;V[42]=10 end;if V[42]>0 then V[42]=V[42]-1 else V[41]=0 end
if spin>0 and th>200 and mph-V[71]<0.4 then V[43]=1;V[44]=8 end;if V[44]>0 then V[44]=V[44]-1 else V[43]=0 end
local steerInc=m_abs(st)>m_abs(oldSt)
local steerLoad=clamp(m_abs(st)/1024,0,1);local thrLoad=clamp((th>0 and th or 0)/1024,0,1);local brakeLoad=brake and clamp((-th)/1024,0,1)or 0;local moving=mph>1 or thrAbs>100
V[66]=clamp((th>0 and th or 0)/1024*steerLoad,0,1);V[67]=brake and steerLoad or 0;if brake then V[245]=i9(V[245])else V[245]=0 end;local bsh=0;if brake then if mph<6 then bsh=5 elseif brakeLoad>.72 and rpmDrop>5000 then bsh=3 elseif steerLoad>.22 then bsh=4 elseif V[245]<6 and brakeLoad>.35 then bsh=1 else bsh=2 end end;V[240]=bsh
local ph;if mph<3 and th>300 then ph=5 elseif brake and steerLoad>.18 then ph=6 elseif not steerSig or mph<2 then ph=1 elseif brake then ph=2 elseif th>350 and (not steerInc or m_abs(st)<m_abs(oldSt)+80) then ph=4 else ph=3 end;V[238]=ph;V[65]=(ph==5 and 4)or(ph==6 and 2)or ph
if V[258]==0 then V[258]=100;V[259]=100;V[260]=100;V[265]=65;V[269]=50;V[271]=100 end
local lprof=0;if gear==1 and mph<8 and th>300 then if th<260 then lprof=5 elseif steerLoad>.18 then lprof=3 elseif V[233]>35 or slip>4 then lprof=4 elseif V[6]==4 or V[40]<.55 then lprof=2 else lprof=1 end end;V[249]=lprof
local px=0;if ph==4 and thDelta>20 and th>250 then px=clamp(thDelta/420+V[233]/110+(100-(V[239]or 65))/130+(SG[segIndex(mph,gear,st)][7]or 0)/160,0,1)end;V[250]=V[250]*.70+px*30
local bz=SG[segIndex(mph,gear,st)];if brake and mph>5 then bz[8]=clamp((bz[8]or 0)*.985+V[117]*3+((V[39]>0)and 2 or 0),0,99)elseif moving and not brake and V[117]<.12 and V[39]==0 then bz[8]=(bz[8]or 0)*.995 end;V[251]=bz[8]or 0
V[253]=V[253]+((thDelta>130 and th>450)and 1 or -0.15);V[254]=V[254]+((brakeLoad>.45 and rpmDrop>2500)and 1 or -0.12);V[255]=V[255]+(((V[16]>0 or steerLoad>.32)and th>180)and 1 or -0.10);V[256]=V[256]+((moving and V[38]==0 and V[39]==0 and V[119]<.30)and 0.25 or -0.10);V[253]=clamp(V[253],0,99);V[254]=clamp(V[254],0,99);V[255]=clamp(V[255],0,99);V[256]=clamp(V[256],0,99);V[252]=(V[255]>42 and 4)or(V[254]>42 and 3)or(V[253]>42 and 2)or(V[256]>50 and 1)or 0
V[257]=clamp(V[257]*.92+((V[38]>0 or V[39]>0 or V[250]>14 or V[251]>35)and 9 or -1),0,99)
if V[1]==GPS_OK and gps>5 and rM>1 and V[119]<.32 and V[38]==0 and V[39]==0 and md<.20 then local z=(gps<12 and 258)or(gps<25 and 259)or 260;local rr=clamp(V[z]*gps/rM,85,115);V[z]=V[z]+(rr-V[z])*.002;V[132]=V[z] end
if V[248]==1 and V[261]<100 then V[261]=clamp(V[261]+3,0,100)elseif V[248]>1 then V[261]=clamp(V[261]-2,0,100)end
local accel=mph-V[155];local pow=clamp(thrLoad*.45+erpmDelta/22000*.25+V[33]/12*.20+brakeLoad*.10,0,1);V[269]=V[269]+(pow*100-V[269])*.012;local fade=(th>550 and mph>8 and V[38]==0 and V[39]==0 and slip<2.5 and steerLoad<.32 and V[168]>60 and V[414]>58 and V[409]<28 and V[620]==0 and V[604]==0 and(V[249])==0 and accel<clamp((th-550)/150,.2,3)*(1-mph/65))and 1 or 0;V[262]=clamp(V[262]+(fade>0 and .32 or -.18),0,99)

-- numeric-only tire/surface learner from proven 14g
if V[300]>120 and V[300]%20==0 and V[1]==GPS_OK and mph>6 and mph<34 and(V[620]==0 or V[620]==3)and md<.32 then
 local sf=V[6]or 1
 if not brake and th>420 then
  local z=50
  if sf>1 then z=50+slip*3+V[36]*.8-V[159]*20 else z=50+V[119]*30-accel*8+V[36]*.3 end
  z=clamp(z,0,99);X[31]=X[31]+(z-X[31])*.025;X[32]=clamp(X[32]+.4,0,99)
 elseif brake and th< -286 then
  local z=50
  if sf>1 then z=50+(-accel)*8-V[117]*24-V[37]*.45-V[119]*18 else z=50+V[117]*24+V[37]*.45+V[119]*18+accel*6 end
  z=clamp(z,0,99);X[34]=X[34]+(z-X[34])*.025;X[35]=clamp(X[35]+.4,0,99)
 end
end
X[33]=(X[31]-50)/50*clamp((X[32]-20)/40,0,1);X[36]=(X[34]-50)/50*clamp((X[35]-20)/40,0,1)
V[263]=clamp(V[263]+(((steerLoad<.08 and th>520 and V[38]==0 and V[39]==0 and V[119]<.28)and 100 or 0)-V[263])*.025,0,99)
if bR>0 and thDelta>90 and not brake then V[264]=18 elseif V[264]>0 then V[264]=V[264]-1 end
local sb=clamp(72-(V[116]*30+V[117]*24+V[119]*18)+(V[244])*.12,12,99);V[265]=V[265]+(sb-V[265])*.025
V[266]=clamp(((rq<80 and 25 or 0)+(sats<5 and 25 or 0)+(V[248]>1 and 25 or 0)+(e<300 and mph>4 and 25 or 0)),0,99)
if lprof==4 and mph<2 and thDelta<0 then V[267]=18 elseif V[267]>0 then V[267]=V[267]-1 end
V[268]=clamp(V[268]+(((V[110]>.78 or V[269]>78 or cL>.55)and 100 or 0)-V[268])*.010,0,99)

local cabs=m_abs(st)
if V[65]~=1 then
if V[148]==0 then V[149]=mph end
if cabs>V[148]then V[148]=cabs end
if V[48]>0 then V[147]=3 end
if V[65]==4 and V[147]==0 then if V[48]>0 or m_abs(dSt)>520 then V[147]=3 elseif V[148]>720 and V[149]<16 then V[147]=1 elseif V[149]>16 and V[148]>260 then V[147]=2 else V[147]=4 end end
else
if V[148]>0 then if V[147]==0 then if V[148]>720 and V[149]<16 then V[147]=1 elseif V[149]>16 and V[148]>260 then V[147]=2 else V[147]=4 end end;V[150]=18;V[158]=V[147];V[148]=0;V[149]=0;V[147]=0 end
end
if V[150]>0 then V[150]=V[150]-1 end
local rough=m_max(V[41],V[43])
ld=clamp(ld+((th>650 and(m_abs(st)>180 or V[33]>2 or V[38]>0))and .006 or -.001),0,1);if V[65]==4 and th>120 then exR=exR*.78+clamp(thDelta/300,0,1)*.22 else exR=exR*.92 end
V[112]=clamp(slip/10,0,1);V[114]=V[5];V[119]=clamp(rough*0.48+clamp(V[64]-V[86],0,1)*0.42+clamp((0.50-V[5])*1.0,0,1)*0.24,0,1)
local contactDrop=clamp(V[119]*0.30+rough*0.18+V[43]*0.18+spin*0.10+clamp(slip/12,0,1)*0.08+clamp(thrLoad*steerLoad*0.14,0,0.14),0,0.68)
local contact=clamp(1-contactDrop,0.25,1);V[163]=contactDrop
if V[160]==0 then V[160]=contact end
V[160]=V[160]+(contact-V[160])*((contact<V[160]) and 0.22 or 0.06);V[159]=V[160]
if V[160]<0.52 then V[161]=10 elseif V[161]>0 then V[161]=V[161]-1 end
if V[43]>0 or V[41]>0 then V[162]=8 elseif V[162]>0 then V[162]=V[162]-1 end
local contactLow=clamp((0.62-V[160])/0.42,0,1);if V[165]<0.62 and V[160]>=0.62 then V[164]=m_floor(8+clamp(0.62-V[165],0,0.42)*18+0.5)end;V[165]=V[160];if V[164]>0 then V[164]=V[164]-1 end;local settle=V[164]>0 and clamp(V[164]/18,0,1)or 0;V[119]=clamp(V[119]+contactLow*0.22+settle*0.10,0,1)
local gpsGate=clamp((V[114]-(V[104]/100))/m_max(1-(V[104]/100),0.01),0,1)
if m_abs(st)>450 or rateSig then xW=18 elseif xW>0 then xW=xW-1 end;pD=(rough>0 and 5)or(V[16]>0 and 2)or(((eS>0 or xW>0)and th>250 and thDelta>20 and m_abs(st)<420)and 3)or((m_abs(dSt)>120 and m_abs(st)>180)and 1)or(V[50]>0 and 4)or((yT>.55)and 6)or 0;local gTr=clamp(V[114]*.55+gQ*.45,0,1);fC=clamp(gTr*(1-V[119]*.55)*(1-V[77]*.003)*(1-cL*.20)+qJ*.18,.35,1.08);aT=clamp(aT+((fC-.72)+qJ*.30-V[119]*.55-cL*.18)*.006,-1,1);aR=clamp(aR+(V[119]*.8+cL*.25+(1-fC)-.45)*.008,0,1)
local intentRaw=0;if V[48]>0 then intentRaw=1 elseif counter then intentRaw=0.90 elseif V[16]>0 then intentRaw=0.82 elseif brakeLoad>0.15 and steerLoad>0.15 then intentRaw=0.68 elseif V[66]>0.24 then intentRaw=0.62 else intentRaw=steerLoad*0.45 end
V[115]=intentRaw
local spinRaw=clamp(m_max(V[112],spin*0.65),0,1);V[121]=clamp(spinRaw*thrLoad*gpsGate*(1-V[119]*0.70)*(V[16]==0 and 1 or 0),0,1)
V[113]=clamp(spinRaw*m_max(V[119],1-V[114])*(thrLoad+0.25),0,1)
V[117]=brake and clamp((rpmDrop/16000)*clamp(V[114]+0.25,0,1)*(1-V[119]*0.35),0,1)or 0;V[122]=V[117]
V[116]=V[121];V[118]=clamp(intentRaw*0.45+steerLoad*0.30+m_abs(V[12])/40+V[119]*0.20,0,1);V[123]=intentRaw;V[124]=V[40]
local topScore=m_max(m_max(V[121],V[117]),m_max(V[113],m_max(V[119],intentRaw)));V[125]=clamp(topScore*0.75+V[114]*0.25,0,1);V[126]=clamp(V[121]-V[113]+V[117]-V[119]*0.25,0,1);if V[239]==0 then V[239]=65 end;local clean=(moving and mph>6 and V[114]>.58 and V[119]<.28 and V[116]<.18 and V[117]<.18 and V[38]==0 and V[39]==0)and 1 or 0;local gripT=clamp(82-clean*0+clean*10-V[116]*38-V[117]*34-V[119]*26-(1-V[114])*18+V[40]*8,18,100);V[239]=V[239]+(gripT-V[239])*(gripT<V[239] and .045 or .015);V[244]=clean*100
if V[48]>0 then V[115]=4 elseif counter then V[115]=5 elseif V[16]>0 then V[115]=6 elseif brakeLoad>0.15 and steerLoad>0.15 then V[115]=3 elseif thrLoad>0.25 and steerLoad>0.15 then V[115]=2 else V[115]=1 end
local joyRaw=clamp(thrLoad*0.25+steerLoad*0.20+intentRaw*0.20+V[40]*0.25+V[159]*0.15-(V[113]*0.45+V[119]*0.30+brakeLoad*0.18),0,1)
if V[38]>0 or V[39]>0 then joyRaw=joyRaw*0.35 end
V[640]=V[640]+(joyRaw-V[640])*(joyRaw>V[640] and 0.04 or 0.015);V[640]=V[640]
if V[640]>0.62 and V[65]~=1 then V[641]=8 elseif V[641]>0 then V[641]=V[641]-1 end
local heatIn=0;if moving then heatIn=clamp(thrAbs/1024*0.20+V[33]/8*0.45+(brake and 0.18 or 0)+(rough*0.10),0,1)end;V[110]=clamp(V[110]+(heatIn-V[110])*(heatIn>V[110] and 0.018 or 0.005),0,1)
if V[16]>0 and V[33]>driftThresh and m_abs(st)>220 then local ts=(st>0)and 1 or -1;V[111]=clamp(V[111]+ts*clamp(V[33]/8,0,1)*0.001,-1,1)end
local tsign=(st>60 and 1)or(st<-60 and -1)or 0;if tsign~=0 then smart=smart*(1+clamp(V[111]*tsign,-0.03,0.03))end
if brake and steerInc and V[25]==0 then V[25]=1;V[26]=V[29]end;if V[25]>0 then if not brake then V[25]=0 else smart=V[26]end end;if V[67]>0.20 and mph>8 then smart=smart*(V[109]/100)end
if mph<3.5 and th<250 then V[55]=m_min(V[55]+1,20)else V[55]=m_max(V[55]-1,0)end;if V[56]>0 and th<250 and V[55]>=10 then V[56]=0 end;local lj=(th>800 and thDelta>450)or(erpmDelta>800 and th>500);if V[23]==0 and V[56]==0 and V[55]>=10 and lj then V[23]=1;V[24]=5;V[56]=1 end;if mph>9 then V[23]=0;V[24]=0 end;if V[23]>0 then if V[24]>0 then smart=smart*(.92+(5-V[24])*.016);V[24]=V[24]-1 else V[23]=0 end end
local csc=V[93]/100;if V[48]>0 then smart=smart*(1.16*L[3]*csc)elseif V[50]>0 then smart=smart*((V[106]/100)*L[3]*csc)elseif V[21]>0 then smart=smart*(1.15*L[3]*csc)end
V[68]=(V[66]>0.24 and mph>s[4])and 1 or 0;if V[68]>0 then smart=smart*clamp((V[107]/100)*L[2]*(V[92]/100),0.75,1.12)end;if V[41]>0 then smart=smart*(1-(0.04*V[94]/100)) end;if V[43]>0 then smart=smart*(1-(0.02*V[94]/100)) end
if pD==3 then smart=smart*1.04 elseif pD==4 then smart=smart*1.03 elseif pD==5 then smart=smart*.97 end;smart=smart*clamp(.92+fC*.10+aT*.025-aR*.018,.93,1.055);if contactLow>0 then smart=smart*(1-contactLow*0.04)end;if settle>0 then smart=smart*(1-settle*0.035)end;if V[641]>0 or V[640]>0.50 then smart=smart*clamp(1-V[640]*0.030,0.965,1)end;if sR>srt/100 and m_abs(st)>160 then smart=smart*(1-clamp((sR-srt/100)*.10,0,.05))end
local ge=clamp((m_abs(V[13])-m_abs(yP))*24+((yP*V[13]<0)and 18 or 0),0,100)*clamp(m_abs(smart-base)/220,0,1);yP=V[13];V[19]=V[19]*.92+ge*.08;smart=smart*clamp(1-clamp(V[19]-28,0,60)*.002,0.88,1)*clamp(1-V[77]*.0009,0.92,1)
smart=smart*((gear==1 and 1.06)or(gear==2 and 1.035)or(gear==3 and 1.015)or(gear==4 and 1)or(gear==5 and .985)or .97)
if mph<8 and thrAbs<50 then smart=smart*(0.70+clamp(mph/8,0,1)*0.30)end
;smart=smart*(V[653]or 100)/100;local gf=(mph>8 and 135 or 120);if V[50]>0 and mph>6 then gf=160 elseif yT>.55 then gf=150 elseif eS>0 and mph>8 then gf=145 end;V[31]=clamp(smart,m_max(gf,s[3]*0.65),460);local up,dn=12,8;if V[31]<V[29]then V[29]=m_max(V[31],V[29]-dn)else V[29]=m_min(V[31],V[29]+up)end;V[30]=m_floor(V[29]+0.5);setgv(1,V[30])
local lock=V[117];learn(moving,clamp(slip/8,0,1),spin,lock,rough,V[5]);memLearn(moving)
gripSM(moving,slip,V[38],V[113],V[116])
local trLow=clamp((62-(V[239]or 65))/62,0,1);local spR=clamp(V[116]*.44+V[113]*.28+clamp(slip/10,0,1)*.22+contactLow*.25+V[119]*.20-thrLoad*.06+(V[233]/100)*.16+trLow*.10,0,1);local brR=clamp(V[117]*.58+brakeLoad*.28+clamp(rpmDrop/16000,0,1)*.18+V[119]*.12+(V[235]/100)*.22+((V[240]==4)and .08 or 0),0,1);local dbR=clamp((1-V[114])*.55+V[119]*.35+((erpmDelta>9000)and .18 or 0)+(V[234]/100)*.24+(V[236]/100)*.18,0,1);local hz=clamp(spR*.45+brR*.35+dbR*.28+contactLow*.22+trLow*.12,0,1);V[196]=spR*100;V[197]=brR*100;V[198]=dbR*100;V[199]=hz*100;local gyroPref=(not brake and V[30]>120 and steerLoad>.16 and hz<.46 and V[116]<.34 and V[119]<.42 and (V[16]>0 or V[238]==3 or V[238]==4))and clamp((V[30]-120)/240*(.55-hz),0,.38)or 0;V[243]=gyroPref*100;local aiAuth,aiLearnOK=aiGate(moving,mph,rM,rough,hz,brake);local pf=(gps>90 or e>60000 or md>.85 or X[5]>25)and 1 or 0;if pf>0 or X[7]==0 or(V[620]>0 and V[620]~=3)or V[1]==GPS_LOST then aiLearnOK=0 end;if ((aiLearnOK==0)and 1 or 0)~=X[16]then X[29]=p2221(4,(aiLearnOK==0)and 1 or 0,pf,(V[1]==GPS_LOST and 1 or((V[620]>0 and V[620]~=3)and 2 or 0)));X[16]=(aiLearnOK==0)and 1 or 0 end;aiAuth=clamp(aiAuth*clamp((V[339]or 50)/50,.85,1.12)*clamp(.98+((V[370]or 50)-50)/900+((V[374]or 50)-50)/1400,.94,1.08)*clamp(1+(X[33]+X[36])*.025,.95,1.05),0,1);if X[7]==0 then aiAuth=0 end;if sndCd>0 then sndCd=sndCd-1;if sndCd==0 then sndPr=0 end end;local good=(moving and mph>5 and V[114]>.58 and V[119]<.30 and V[38]==0 and V[39]==0)and 1 or 0;local scare=clamp((V[38]>0 and V[36]/32 or 0)+(V[39]>0 and V[37]/28 or 0)+hz*1.1+V[119]*.6+(md>.55 and .5 or 0),0,2);local msen=clamp(((V[336]or 50)/50)*clamp(1-((V[371]or 50)-50)/650,.92,1.08),.70,1.30);local mt=(V[321]>0 and V[321]or(V[329]or 50));local rq=clamp(((V[346]or 50)-50)/50,-1,1);V[346]=(V[346]or 50)+(50-(V[346]or 50))*.002;mt=mt+good*(.16+m_max(0,rq)*.08)*msen-scare*(.95-rq*.15)*msen-((V[204])>18 and .25*msen or 0)+((V[239]or 65)>84 and good>0 and .08*msen or 0);V[321]=clamp(mt,0,99);local ms=(V[321]<26 and 1)or(V[321]<51 and 2)or(V[321]<76 and 3)or 4;V[322]=ms;local mdm=m_abs(V[321]-(V[328]or V[321]));V[328]=V[321];V[341]=clamp((V[341])*.985+mdm*.35,0,99);if metaLast>0 and ms~=metaLast then V[342]=i9(V[342])else V[342]=clamp((V[342])*.998,0,99)end;metaLast=ms;local tiny=(V[38]==0 and V[39]==0 and hz<.40 and (100-V[35])<7)and 1 or 0;if V[342]>12 and tiny>0 then V[343]=clamp((V[343])+.18,0,99)else V[343]=clamp((V[343])-.035,0,99)end;if V[343]>20 then V[336]=clamp((V[336]or 50)-.006,35,65)elseif good>0 and V[343]<8 then V[336]=clamp((V[336]or 50)+.002,35,65)end;if (V[204])>25 and V[36]<16 then V[337]=clamp((V[337]or 50)+.006,35,65)else V[337]=clamp((V[337]or 50)+(50-(V[337]or 50))*.0008,35,65)end;if brR>.55 and V[39]==0 and brake then V[338]=clamp((V[338]or 50)+.004,35,65)else V[338]=clamp((V[338]or 50)+(50-(V[338]or 50))*.0006,35,65)end;V[344]=clamp(100-(V[343])*.8-(V[119])*25-(hz*18),0,99);V[347]=clamp((V[114])*70+(1-md)*30,0,99);V[350]=clamp((V[350]or 50)+((V[344]-50)*.001)+((good>0)and .006 or 0)-(scare>.9 and .018 or 0),0,99);V[345]=((V[343])>20 and 1)or((V[204])>25 and 2)or(md>.55 and 3)or((V[338]or 50)>55 and 4)or 0;V[323]=clamp(spR*45+brR*38+hz*32+(V[38]>0 and 18 or 0)+(V[39]>0 and 18 or 0),0,99);V[324]=clamp((V[230])*.25+aiNext*55+(V[251])*.20+(100-(V[239]or 65))*.28,0,99);V[325]=clamp((V[325]or 50)+(((th>380 and thDelta>30)and 100 or 0)-(V[325]or 50))*.006,0,99);V[326]=clamp((V[326]or 50)+((steerLoad*100)-(V[326]or 50))*.006,0,99);V[327]=clamp((V[327]or 50)+((brakeLoad*100)-(V[327]or 50))*.006,0,99);if moving then V[560]=clamp((V[560]or V[325])+(V[325]-(V[560]or V[325]))*.012,0,99);V[561]=clamp((V[561]or V[326])+(V[326]-(V[561]or V[326]))*.012,0,99);V[562]=clamp((V[562]or V[327])+(V[327]-(V[562]or V[327]))*.012,0,99)end;V[329]=clamp((V[329]or 50)+((good>0 and .018 or 0)-(scare>.8 and .045 or 0)),0,99);local calm=clamp(100-(V[323])-(V[324])*.45-(V[343])*.55,0,99);local work=clamp((V[325]or 50)*.45+(V[326]or 50)*.35+(V[327]or 50)*.20,0,99);local focs=clamp(clamp(100-m_abs(work-55)*2,0,100)*.45+(V[347]or 50)*.25+(V[239]or 65)*.20-(V[343])*.70-hz*35+((V[371]or 50)-50)*.05,0,99);local play=clamp((V[16]>0 and 32 or 0)+(V[238]==4 and 22 or 0)+(V[243])*.35+(V[239]or 65)*.18-hz*70+((V[370]or 50)-50)*.08,0,99);local aggr=clamp((V[325]or 50)*.45+(V[263])*.35+(V[239]or 65)*.22-(V[302])*1.5+((V[370]or 50)-50)*.10,0,99);local nerv=clamp((V[343])*1.25+(V[216])*.45+(V[119])*80+(V[342])*1.4-((V[371]or 50)-50)*.10,0,99);local hunt=clamp((V[342])*2.1+(V[343])*1.1+(V[232]>0 and 18 or 0)+(V[288]>0 and 10 or 0),0,99);local prot=clamp(brR*70+(V[39]>0 and 18 or 0)+(V[251])*.35+(V[268])*2.2-((V[371]or 50)-50)*.08,0,99);local conf=clamp((V[321]or 50)*.45+(V[329]or 50)*.28+(V[239]or 65)*.32-(V[302])*1.4,0,99);local flow=clamp(conf*.65+calm*.45+good*22-(V[323])*.45-(V[324])*.25,0,99);local pp=1;local ps=calm;local pr=1;if focs>ps then pp=2;ps=focs;pr=7 end;if hunt>ps then pp=6;ps=hunt;pr=6 end;if nerv>ps then pp=5;ps=nerv;pr=3 end;if prot>ps then pp=7;ps=prot;pr=2 end;if play>ps then pp=3;ps=play;pr=5 end;if aggr>ps then pp=4;ps=aggr;pr=4 end;if conf>ps then pp=8;ps=conf;pr=8 end;if flow>ps then pp=9;ps=flow;pr=9 end;if V[322]==1 and prot>35 then pp=7;ps=m_max(ps,prot);pr=2 end;if (V[342])>14 and (V[343])>8 then pp=6;ps=m_max(ps,hunt);pr=6 end;local oldp=V[361]or 1;local ph=8;if oldp==7 or oldp==5 then ph=clamp(8-((V[371]or 50)-50)*.08,5,11)end;if pp~=oldp and ps<(V[362]or 50)+ph then pp=oldp end;V[361]=pp;V[362]=clamp((V[362]or 50)+(ps-(V[362]or 50))*.08,0,99);V[363]=clamp(100-(V[342])*2-(V[343])*.9,0,99);V[364]=pr;local psoft=(pp==6 and .96)or(pp==5 and .97)or(pp==7 and .98)or(pp==2 and 1.01)or(pp==9 and 1.03)or(pp==8 and 1.02)or 1;V[339]=clamp((V[339]or 50)*.999+(50*psoft)*.001,35,65);local brakeSw=sw("L4");local sbCut,sbCap,sbRel,sbAuth,sbMood,sbLearn=superBrain(mph,thrAbs,st,brakeSw,rough,contactLow,gear,spR,brR,dbR,hz,md,good,aiLearnOK);if(V[543]or 0)>0 and unsafeLast==0 then V[588]=V[543];V[589]=mph;V[590]=slip;V[591]=m_floor((m_abs(st)/1024)*99);V[592]=m_floor((m_abs(th)/1024)*99);V[593]=(V[38]>0 and 1 or 0)+(V[39]>0 and 2 or 0)+(V[1]~=GPS_OK and 4 or 0);unsafePending=1 end;unsafeLast=((V[543]or 0)>0)and 1 or 0;aiAuth=clamp(aiAuth*sbAuth,0,1);V[336]=clamp((V[336]or 50)*.999+(50*sbMood)*.001,35,65);V[340]=clamp((V[340]or 50)*.999+(50*sbLearn)*.001,35,65);V[546]=V[546]*.996;V[547]=V[547]*.996;V[394]=m_max(0,V[394]-.015);V[397]=(V[394]<18 and V[38]==0)and V[397]+1 or 0;if V[397]>330 then V[396]=0;V[397]=0 end
local ct=(V[147]>0)and V[147]or((V[150]>0)and V[158]or 0);local cm=(ct>0 and ct<5)and V[150+ct]or 50;V[157]=clamp((cm-50)/50,-0.7,0.7);V[156]=clamp(cm,0,100);local hf=(V[110]<0.28 and 0.94 or((V[110]>0.84)and 0.92 or 1.04));local bts=clamp(1+V[113]*0.45-V[116]*0.18+(1-V[125])*0.10,0.75,1.65);local btm=clamp(1+V[116]*0.20-V[113]*0.35,0.55,1.35);local bas=clamp(1+V[113]*0.35-V[117]*0.20+(1-V[125])*0.08,0.75,1.60)*clamp(1.15-(V[63]-50)/200,0.85,1.15);local pred=1+V[157]*0.10;local gts=(gear==1 and -.55)or(gear==2 and -.28)or(gear==3 and -.10)or(gear==4 and .05)or(gear==5 and .15)or .25;local gtm=(gear==1 and 1.12)or(gear==2 and 1.07)or(gear==3 and 1.03)or(gear==4 and 1)or(gear==5 and .97)or .94;local gal=(gear==1 and 450)or(gear==2 and 250)or(gear==3 and 0)or(gear==4 and -200)or(gear==5 and -500)or -900;local sh=(shift>0 and .92 or 1);local eP=(eS>0 and th>350 and thDelta>20 and m_abs(st)<380)and .55 or 0;local cP=clamp(cL-clt/100,0,.34);local gP=(gC>0 and .35 or 0);local cd=(tC>0 and .45 or 0);local gm=GM[gear]or 0;local iB=(V[50]>0 and -.10)or(yT>.55 and -.18)or(btT>0 and -.45)or(((V[23]>0)or(V[70]==10))and 1.4)or((V[65]==4 and th>120)and(.28-exR*.70))or((tcK>.55 and(m_abs(st)>180 or V[119]>.28))and .12)or((tcK>.55)and -.24)or((ld>.45)and -ld*.45)or 0;iB=iB*clamp(.7+fC*.35-aR*.15,.5,1.05)*(qJ<-.4 and .85 or 1);local tcSlip=(V[95]/10)*L[5]*hf*bts*clamp(pred,0.92,1.12)+(1-V[40])*1.5+contactLow*0.7+V[640]*0.50+V[77]*.006-V[78]*.004+gts-cP*.32-eP+gP+cd+((pD==3)and -.35 or 0)+(1-fC)*.55-aT*.12+aR*.36+((mph<7)and .65 or 0)+iB+gm*.28+((V[6]>1)and X[33]*.55 or -X[33]*.30);if mph>14 and m_abs(st)<100 and V[77]<15 then tcSlip=tcSlip+clamp((mph-14)*.04,0,.7)end;local tcMax=clamp((V[96]*L[6]+(1-V[40])*8)*btm*clamp(1-V[157]*0.06,0.94,1.06)*(1-contactLow*0.08)*(1-V[640]*0.04)*(1+V[78]*.0007-V[77]*.001)*gtm*sh*(1-gP*.10)*clamp(.88+fC*.18-aR*.08+aT*.04,.80,1.07),12,54)*clamp(1+((V[6]>1)and X[33]*.06 or -X[33]*.04),.94,1.06);tcSlip=tcSlip-clamp(hz*.55+spR*.35+trLow*.25+(V[250]/100)*.55+((V[249]==4)and .45 or 0)+(V[265]<35 and .25 or 0),0,1.85)+gyroPref*.35;tcMax=tcMax*(1-clamp(hz*.10+dbR*.08+trLow*.06+V[268]*.0012+V[266]*.0010,0,.30))*(1-gyroPref*.08);tcSlip=tcSlip+((V[600]==2 or V[600]==3)and clamp(((V[602]or 50)-50)*.018,0,.8)or 0)+(V[603]>0 and .35 or 0)-clamp(V[606]*.006,0,.45)+(V[610]+V[612]-100)*.004-aiNext*((V[628]>70 or V[634]>65)and 0 or .18*V[638]/50)+(V[624]>0 and 1.8 or 0);local minSpd=5.5;local raw=0
if th>120 and mph>minSpd and V[16]==0 and V[34]>0 and V[5]>(V[104]/100) and slip>tcSlip then raw=clamp((slip-tcSlip)*7,0,tcMax)end;if V[604]>0 and V[604]<4 then raw=m_min(raw,10)end;if V[624]>0 then raw=m_min(raw,5)end;if raw>0 then tcK=clamp(tcK+.18,0,1)else tcK=tcK*0.98989328 end;tS=tcSlip;r0=raw
if raw>0 then tN=tN+1 else if tN>7 then tC=clamp(5+m_floor(V[78]/8),5,12) end;tN=0 end;if tC>0 then tC=tC-1;if raw==0 and m_abs(st)<120 then tC=m_max(tC-1,0)end end;if tN>16 then raw=raw*.82 end;local slCap=clamp(26+fC*6,26,32);if raw>slCap and m_abs(st)<80 and V[77]<20 and V[119]<.18 and fC>.75 then raw=slCap end;local hxSlip=tcSlip+clamp(1.5+V[78]*.04+(1-fC)*2,1.5,4.5);local hx=(mph>eM+5 and slip<hxSlip and m_abs(st)<140);if hx then hD=5 elseif hD>0 then hD=hD-1 end;if raw>24 and (tN>3 or V[36]>18) and (pD>0 or eS>0 or V[50]>0 or xW>0 or V[77]>18 or V[119]>.28)then if eT==0 then eM=mph end;eT=m_min(eT+1,8)else eT=m_max(eT-1,0);if eT==0 then eM=0 end end;if raw>18 and V[35]<88 then dT=m_min(dT+1,6)else dT=m_max(dT-1,0)end;local eTcap=clamp(18+fC*6,18,24);local dTcap=clamp(20+fC*6,20,26);local eTmin=clamp(2+m_floor(V[78]/15),2,5);if hx and eT>eTmin and raw>eTcap then raw=eTcap elseif dT>2 and m_abs(st)<160 and raw>dTcap then raw=dTcap end;if raw>V[36]then V[36]=m_min(raw,V[36]+15);tF=V[36]else local tFrate=hx and clamp(.35+fC*.08,.35,.43)or((eT>0)and clamp(.42+fC*.06,.42,.48)or clamp(.55+fC*.08,.55,.63));tF=tF*tFrate;V[36]=m_max(raw,m_max(tF,V[36]-(8+(1-V[40])*8)))end;V[38]=(V[36]>1)and 1 or 0;V[78]=(V[38]>0)and m_max(V[78]*.9,V[36])or V[78]*.88
local absLock=((V[97]*100)*L[7]*hf+(1-V[40])*3900)*bas*(1+V[77]*.0008)+gal-cP*520+(V[38]>0 and 420 or 0)-((brake and mph>24)and 430 or 0)+((mph<12)and 520 or 0)+(1-fC)*360-aT*190+aR*220+((V[6]>1)and X[36]*260 or -X[36]*180);absLock=absLock+((V[609]==2)and 180 or 0);local decelAssist=(brake and mph>8 and accel<-0.75)and clamp((-accel-.75)*260,0,520)or 0;local absAssist=clamp((brR*.26+hz*.14+trLow*.09+(V[235]/100)*.16+brakeLoad*.10)*2600,0,1180);absLock=absLock-absAssist-decelAssist;if V[240]==4 then absLock=absLock+140 elseif V[240]==3 then absLock=absLock-360 elseif V[240]==5 then absLock=absLock+420 end;absLock=absLock-(V[251])*9+((V[264]>0)and 180 or 0);V[286]=clamp(absAssist/30+decelAssist/20,0,99);local ar=0;if brake and mph>4.5 and rpmDrop>absLock and V[5]>m_max(0.20,(V[104]/100)-0.10) then ar=clamp((rpmDrop-absLock)/650+brakeLoad*1.2+(decelAssist>0 and .8 or 0),0,42);if V[240]==4 then ar=ar*.88 elseif V[240]==3 then ar=ar*1.10 end end;V[37]=V[37]+(ar-V[37])*0.42;V[39]=(V[37]>1.5)and 1 or 0;if V[39]>0 then aC=5 end;if aC>0 then aC=aC-1;tC=m_max(tC,3)end
condBrain(moving,mph,e,rM,th,thDelta,st,dSt,brake,brakeLoad,slip,V[36],V[37],md,btl,rq,sats,brR,spR,hz,good,scare)
if moving and ct>0 and ct<5 and (V[65]==4 or V[150]>0)then local mi=150+ct;local q=clamp(50+accel*4-slip*1.8-V[36]*0.25-V[113]*10+V[40]*8+(V[90]-50)*0.15+(V[63]-50)*0.10,15,85);V[mi]=V[mi]+(q-V[mi])*(0.040*clamp(.88+((V[372]or 50)-50)/500,.82,1.16)*clamp((V[385]or 100)/100,.55,1.12));V[157]=clamp((V[mi]-50)/50,-0.7,0.7);V[156]=clamp(V[mi],0,100)end
cL=clamp(cL*.94+((V[38]>0 or V[39]>0 or V[43]>0)and .10 or 0),0,1);if cL>clt/100 then V[77]=clamp(V[77]+cL*.45,0,100)end
local wasTc=V[102];local wasAbs=V[103]
if V[38]>0 then V[133]=V[133]+1;V[143]=0 else if wasTc>0 then V[143]=m_floor(clamp(10+V[133]*0.35+(1-V[40])*8,10,24)*clamp(1.15-(V[90]-50)/200,0.85,1.15)+0.5);V[144]=V[133];V[145]=V[40];V[146]=V[65];if V[18]<=0 then V[9]=slip;V[10]=V[40];V[11]=V[16];V[18]=15 end end;V[133]=0 end
if V[39]>0 then V[134]=V[134]+1 else if wasAbs>0 and V[54]<=0 then V[52]=V[117];V[53]=mph;V[54]=15 end;V[134]=0 end
if V[133]>8 then local h=clamp((V[133]-8)/18,0,1);local runaway=(V[116]>0.78 and V[113]<0.20 and V[114]>0.60 and slip>tcSlip+3 and raw>V[36]*0.90);if not runaway then local rel=0.10*h+0.10*V[113]+0.06*(1-V[114]);if mph<8 then rel=rel+0.06*h end;V[36]=V[36]*(1-clamp(rel,0,0.45))end end
if V[134]>12 then local h=clamp((V[134]-12)/20,0,1);local hardLock=(V[117]>0.75 and V[114]>0.55);if not hardLock then V[37]=V[37]*(1-clamp(0.06*h+0.05*(1-V[117]),0,0.35))end end
if V[38]>0 and V[102]==0 then V[100]=V[100]+1 end;V[102]=V[38]
if V[39]>0 and V[103]==0 then V[101]=V[101]+1 end;V[103]=V[39]
if V[18]>0 then V[18]=V[18]-1;if V[18]==0 then local sg=(slip<=V[9]*0.6)and 1 or((slip>=V[9])and -1 or 0);local dg=(V[11]>0 and V[16]==0)and 0.3 or((V[11]==0 and V[16]>0)and -0.3 or 0);local gg=clamp((V[40]-V[10])*2,-0.3,0.3);local oq=sg+dg+gg;qJ=clamp(qJ+oq*.12,-1,1);GM[vG]=clamp((GM[vG]or 0)+oq*.05,-1,1);V[90]=clamp(V[90]+sg*6+dg*6+gg*6,0,100)end end
if V[54]>0 then V[54]=V[54]-1;if V[54]==0 then local lg=(V[117]<=V[52]*0.5)and 1 or((V[117]>=V[52])and -1 or 0);local mg=(mph>=V[53]*0.85)and 0.5 or((mph<V[53]*0.6)and -0.5 or 0);qJ=clamp(qJ+(lg+mg)*.10,-1,1);V[63]=clamp(V[63]+lg*8+mg*6,0,100)end end
qJ=qJ*.999;V[90]=V[90]+(50-V[90])*.004;V[63]=V[63]+(50-V[63])*.004
local baseTarget=100-(brakeSw and V[37]or V[36]);local target=baseTarget;local aiCut,aiCap,aiRel=sbCut,sbCap,sbRel;local feel=(V[6]==1 and .82)or(V[6]==2 and 1)or(V[6]==3 and 1.16)or 1.08;V[231]=feel*100;local proof=clamp(V[224]/900,0,1);local maxAi=(clamp(4+aiAuth*8+hz*4,4,16)*feel)+clamp(((V[370]or 50)-50)/22,-2,2);if hz<.75 then maxAi=m_min(maxAi,8+proof*8)end;aiCut=clamp(aiCut*aiAuth*feel,0,maxAi);aiCap=100-(100-aiCap)*aiAuth*feel;if hz<.75 then aiCap=m_max(aiCap,94-proof*6)end;local extra=clamp(V[250]*.05+((V[249]==4)and 2.2 or 0)+V[251]*.025+V[257]*.018+V[262]*.012+V[266]*.018+V[268]*.025-((V[263]>70 and hz<.35)and 1 or 0),0,6);aiCut=aiCut+extra;local msc=(V[322]==1 and 1.08)or(V[322]==2 and 1.03)or(V[322]==4 and .94)or 1;aiCut=clamp(aiCut*msc,0,maxAi+2);if V[322]==1 then aiCap=m_max(92,aiCap-1)elseif V[322]==4 then aiCap=m_min(100,aiCap+1)end;V[225]=(V[38]>0)and V[36]or 0;V[226]=((V[39]>0)or brakeSw)and V[37]or 0;V[227]=hz*100;V[228]=aiCut;V[229]=clamp(100-aiCap,0,99);V[219]=baseTarget;V[220]=aiCut;V[221]=aiCap;local gpRel=1-gyroPref*.35;target=clamp(target+aT*.8-aR*1.2-aiCut*gpRel,0,aiCap);if shift>0 and thrAbs>360 and not brake then target=m_min(target,96)end;if gear==1 and thrAbs>520 and mph<6 and not brake then target=m_min(target,94+((V[6]>1)and X[33]or-X[33])*.8)end;if hz>.70 and target>92 then target=m_min(target,92-(hz-.70)*20)end;aiShadow=aiShadow*.80+target*.20;if m_abs(aiShadow-target)>7 then aiGuard=clamp(aiGuard+6,0,80)else aiGuard=aiGuard*.94 end;V[213]=aiShadow;V[214]=aiGuard;if aiGuard>10 and target<99 and hz<.35 and V[38]==0 and V[39]==0 and not brakeSw then target=clamp(target+aiGuard*.018*aiAuth,0,100)end;local lt=V[203]or target;local tj=m_abs(target-lt);if moving and th>120 and not brake and (V[38]>0 or V[36]>2) and tj>3 then V[200]=clamp((V[200])+tj*.18+1,0,70)else V[200]=(V[200])*.94 end;if((moving and th>120 and not brake and V[38]~=(V[201]))or(moving and brakeSw and V[39]~=(V[202])))then V[204]=clamp((V[204])+16,0,85)else V[204]=(V[204])*.965 end;V[201]=V[38];V[202]=V[39];V[203]=target;if(V[204])>8 and target<99 and hz<.45 and V[38]==0 and V[39]==0 then target=clamp(target+(100-target)*clamp((V[204])*.003,0,.24),0,100)end;if(V[200])>8 and target<98 and hz<.45 and V[38]==0 and V[39]==0 then target=clamp(target+(V[200])*.032,0,100)end;V[222]=target
if target>98 and V[38]==0 and V[39]==0 and V[143]<=0 and V[161]<=0 and V[164]<=0 and V[78]<5 and V[77]<20 then V[35]=100;V[141]=100;V[142]=0 else local diff=m_abs(target-V[35]);local rate;if target<V[35]then rate=clamp(V[98]*L[8]*0.6,0.4,2.5)*(1+V[78]*.001-V[77]*.001)else rate=clamp(V[99]*L[9]+diff*0.08,1,5)*clamp(1-V[78]*.0015-V[77]*.0015,.65,1);if V[143]>0 then local hf=clamp(V[144]/35,0,1);local gf=clamp(1-V[145],0,1);local pf=((V[146]==3 or V[146]==4)and 0.35 or((V[146]==2)and 0.20 or 0));local sf=clamp((s[6]-0.32)/0.26,0,1)*0.20;rate=rate*clamp(1-(0.38*hf+0.30*gf+pf+sf),0.38,1);V[143]=V[143]-1 end end;local rr=(target<V[35])and(1+V[116]*0.18-V[113]*0.28)or(1+V[40]*0.10-V[119]*0.15);if (V[65]==4 or V[150]>0)then local eb=V[157];if target<V[35]then rate=rate*clamp(1+eb*0.18,0.70,1.12)else rate=rate*clamp(1+eb*0.22,0.62,1.18)end end;rate=rate*clamp(rr,0.55,1.25);rate=rate*clamp(0.65+0.35*V[159],0.55,1);if settle>0 then rate=rate*clamp(1-settle*0.28,0.62,1)end;if target<V[35]then rate=rate*clamp(1-V[640]*0.10,0.90,1)else rate=rate*clamp(1+V[640]*0.12,1,1.12)end;if target<V[35]then local dl=clamp(th/1024,0,1);local sl=clamp(m_abs(st)/1024,0,1);local ml=clamp((22-mph)/22,0,1);local sr=clamp(slip/8,0,1);local risk=clamp(dl*(0.18+0.32*sl+0.24*ml+0.18*sr)+contactLow*0.22,0,0.75);if V[116]>0.82 and V[113]<0.18 and V[114]>0.65 and mph>18 then risk=risk*0.55 end;local gov=clamp(1-risk,0.38,1);V[141]=gov*100;V[142]=risk*100;rate=rate*gov*clamp(1-X[33]*.05,.95,1.05)end;if rough>0 then rate=rate*0.75 end;if V[5]<0.5 then rate=rate*0.75 end;rate=rate*clamp(aiRel or 1,0.55,1.18);if target<V[35]then V[35]=m_max(target,V[35]-rate)else V[35]=m_min(target,V[35]+rate)end end
local sxpt=6+clamp(mph/35,0,1)*V[171]+rough*8+V[413]*.025-V[410]*.018+(1-V[40])*8+aR*5-aT*2+((V[6]>1)and -X[33]*2 or X[33])+X[36]*.6;if brake and mph>10 then sxpt=sxpt+V[172] end;if mph<12 and m_abs(st)>450 then sxpt=sxpt-V[173] end;if V[16]>0 or V[33]>4 then sxpt=sxpt-(V[173]*0.6) end;sxpt=clamp(sxpt,0,V[170]);local sr=(sxpt>V[169])and 0.04 or 0.08;local ns=V[169]+(sxpt-V[169])*sr;if ns>V[169]+2 then ns=V[169]+2 elseif ns<V[169]-2 then ns=V[169]-2 end;V[169]=clamp(ns,0,40);setgv(0,V[169]);setgv(3,V[35]);setgv(8,50+(1-V[40])*30);setgv(2,50+(V[16]>0 and 20 or 0)+aT*3-aR*4);setgv(6,clamp(26+(1-V[40])*12+V[412]*.035+V[410]*.02,24,38))
if V[232]>0 and V[232]<5 then V[120]=9 elseif brakeSw and (V[39]>0 or V[117]>0.45) then V[120]=2 elseif V[116]>0.35 and V[116]>V[113] then V[120]=1 elseif V[113]>0.38 and V[113]>=V[116] then V[120]=3 elseif V[48]>0 or V[123]>0.92 then V[120]=4 elseif V[16]>0 then V[120]=5 elseif V[114]<0.50 then V[120]=7 elseif V[119]>0.48 then V[120]=8 elseif V[239]>78 and V[244]>0 then V[120]=10 else V[120]=6 end
if brakeSw and V[39]>0 then V[70]=2 elseif V[38]>0 then V[70]=1 elseif V[48]>0 then V[70]=7 elseif V[43]>0 then V[70]=8 elseif V[41]>0 then V[70]=9 elseif V[23]>0 then V[70]=10 elseif V[50]>0 then V[70]=11 elseif V[16]>0 then V[70]=3 elseif V[21]>0 then V[70]=5 elseif V[25]>0 then V[70]=6 elseif V[68]>0 then V[70]=12 else V[70]=0 end
V[300]=clamp((V[300])+1,0,9999);V[301]=m_max(V[301],slip);V[302]=m_max(V[302],100-V[35]);if(V[303])==0 then V[303]=100 end;V[303]=m_min(V[303],V[35]);V[304]=m_max(V[304],md*100);V[305]=m_max(V[305],V[37]/10);V[306]=m_max(V[306],e/1000);V[308]=clamp(V[300]/300,0,99);V[311]=clamp(100-(btl or 100),0,99);V[312]=clamp(V[269],0,99)
V[155]=mph
return mph,rM
end
local function draw(m,r)
 local T=lcd.drawText;local D=lcd.drawNumber;local Z=SMLSIZE;local n=m_floor;local q=r or 0;local st=(V[38]>0 and"TC")or(V[39]>0 and"ABS")or(V[620]>1 and"AIR")or(V[624]>0 and"ESC")or(V[1]~=0 and"TRUTH")or"AI";lcd.clear();lcd.drawFilledRectangle(0,0,128,9);T(2,1,"A15XQ",Z+INVERS);T(94,1,st,Z+INVERS)
 T(2,11,"MPH",Z);D(2,17,n(m+.5),DBLSIZE);T(45,11,"G",Z);D(53,11,vG,Z);bar(2,37,54,3,m/50)
 T(62,11,"RPM",Z);D(93,11,n(q/1000+.5),Z);bar(62,20,63,5,q/78000);T(62,29,"AI",Z);D(80,29,n(V[182]+.5),Z);bar(97,30,28,4,V[182]/100)
 T(2,44,"TC",Z);D(19,44,n(V[36]+.5),Z);T(43,44,"ABS",Z);D(67,44,n(V[37]+.5),Z);T(91,44,"GYR",Z);D(113,44,n(V[30]+.5),Z)
 lcd.drawFilledRectangle(0,56,128,8);T(2,57,(V[650]==2 and"BURST")or(V[650]==1 and"WATCH")or"CALM",Z+INVERS);T(55,57,"P",Z+INVERS);D(63,57,V[652],Z+INVERS);T(87,57,"V",Z+INVERS);D(98,57,V[570],Z+INVERS)
end
local function alive(g,e,rx,s,rq)return rx>3.5 or(rq>0 and(s>0 or e>100 or g>.2))end
local bc,bm,bi=0,0,0
local function gm(g)return(g>8 and g<15)and g+((g<11 and 119)or(g==11 and 121)or 127)or g end
local function bb_line(g,dv,ev,gg,sc)
local f=io.open("/LOGS/gvbb.csv","a");if f then io.write(f,getTime(),",",ev or 0,",",gg or 0,",",sc or m_floor(V[132]+.5),",",g,",",dv,"\n");pcall(io.close,f)end
end
local function xd(g,e,gps)if g==125 then return p2221((X[2]>20 and X[1]<20)and 2 or(X[2]>0 and 3 or 0),X[1],X[2],X[3]/10)end;local rm=rpmMph(e);local md=(gps>1 and rm>1)and clamp(m_abs(rm-gps)/(gps+3),0,1)or 0;local dm=(V[1]==GPS_OK and 1)or(V[1]==GPS_COAST and 2)or(rm>1 and 3 or 4);local pf=(gps>90 or e>60000 or md>.85 or X[5]>25)and 1 or 0;if g==126 then return p2221(dm,pf,(pf>0 or X[7]==0 or(V[620]>0 and V[620]~=3)or dm==4)and 1 or 0,0)end;if g==127 then return p2221(V[155]>1 and 1 or 0,X[7],0,V[168]/10)end;if g==128 then return p2221(V[370],V[336],V[545],V[339]/10)end;local ac=clamp(100-V[222],0,99);local hr=clamp(V[625]*.45+V[628]*.35+(100-(V[505]or 85))*.20,0,99);return p2221(ac,V[346],hr,V[620]==3 and 5 or(V[620]>0 and 4 or(V[39]>0 and 3 or(V[38]>0 and 2 or(ac>4 and 1 or 0)))))end
local function bb_tick(gps,e,rx,sats,rq)
if not alive(gps,e,rx,sats,rq)then vG=1;vGT=0;bc=0;bm=0;return end
bm=V[650];bc=bc+1;if bc<((bm==0 and 3)or(bm==1 and 2)or 1)then return end;bc=0
if unsafePending>0 then bb_line(108,p2221(V[588],V[589],V[590],V[593]),0);bb_line(109,p2221(V[591],V[592],V[168],V[169]),0);unsafePending=0 end;if (V[594])>0 then bb_line(116,V[594],0);V[594]=0 end;if X[24]>0 then bb_line(130,X[24],0);bb_line(131,X[25],0);X[24]=0;X[25]=0 end;if X[29]>0 then bb_line(135,X[29],0);if X[30]>0 then bb_line(136,X[30],0)end;X[29]=0;X[30]=0 end
local ev=(V[38]>0 and 1 or 0)+(V[39]>0 and 2 or 0)+(V[23]>0 and 4 or 0)+(V[16]>0 and 8 or 0)+(((V[41]>0 or V[43]>0 or V[119]>.48)and 16 or 0))+((V[1]~=GPS_OK)and 32 or 0)+((V[620]==3)and 64 or 0)+bm*128
local ck=(V[39]>0 and V[38]>0 and 3)or(V[39]>0 and 2)or(V[38]>0 and 1)or 0;if ck>0 then if evK==0 then evK=ck;evDur=0;evPeak=0;evEntry=V[155];evReason=V[223];evMin=V[35];evTC=0;evABS=0;V[679]=V[652]end;if ck==3 then evK=3 end;evDur=evDur+1;evPeak=m_max(evPeak,100-V[35]);evMin=m_min(evMin,V[35]);evTC=m_max(evTC,V[225]or 0);evABS=m_max(evABS,V[226]or 0);if V[223]>0 and V[223]~=9 then evReason=V[223]end elseif evK>0 then local rc=(V[35]>90 and evMin>78 and V[119]<.65)and 1 or 0;V[346]=clamp(100-evPeak*2-evDur*.7+(rc>0 and 18 or 0),0,99);bb_line(80,p2221(evK,evDur,evPeak,evReason),ev);bb_line(81,p2221(evEntry,V[35],rc,evMin/10),ev);bb_line(85,p2221(evTC,evABS,rc,evMin/10),ev);V[289]=V[289]+1;if evK==1 or evK==3 then V[549]=V[549]+1 end;if evK==2 or evK==3 then V[552]=V[552]+1 end;if rc==0 then V[553]=V[553]+1 end;V[554]=evK;V[555]=evPeak;V[556]=evDur;V[557]=rc;evK=0;evTC=0;evABS=0 end
local gg=vG*10+(vGT>0 and 1 or 0);local sc=m_floor(V[132]+.5);dI=dI%24+1;local dG;if bm>1 then bi=bi%9+1;dG=gm(string.byte("\061\062\075\057\011\013\106\008\046\075\057\061\011\008\106\013\046\067\075\057\061\008\106\013\046\074\011\058\059\061\057\075\013\008\067\011\123\124\075\061\057\126\011\013\008\123\124\061\075\057\011\013\008\046\125\126\127\046\074\057\011\013\106\061\062\009\010\011\106\013\057\075",(V[652]-1)*9+bi))else dG=gm(string.byte("\046\057\058\059\061\062\067\074\075\095\106\123\124\125\126\127\009\010\011\012\013\014\008\001",dI))end;local dV=0
if dG==46 then dV=p332(V[155]*10,rpmMph(e),V[182])elseif dG==57 then dV=p2221(V[113]*100,V[116]*100,V[117]*100,V[119]*10)elseif dG==58 then dV=p332(V[30],V[169],gv(6))elseif dG==59 then dV=p2221(V[70],V[120],vG,V[6])elseif dG==61 then dV=p2221(V[180],V[181],V[182],V[183]/10)elseif dG==62 then dV=p2221(V[184],V[185],V[187],V[186]/10)elseif dG==1 then dV=p332(pD,eT,dT)elseif dG==67 then local sm=SG[V[186]]or{0,50,0,0,0,0,0};dV=p2221(sm[1],sm[5],sm[6],(sm[7]or 0)/10)elseif dG==74 then dV=p332(e/100,V[100],V[101])elseif dG==75 then dV=p2221(V[35],V[223],V[225],V[226]/10)elseif dG==95 then dV=p2221(V[373],V[375],V[376],memLoaded)elseif dG==106 then dV=p2221(V[570],vLoad,voiceBlock,sndBlock/10)elseif dG==123 then dV=p2221(V[423],V[424],V[620],V[6])elseif dG==124 then dV=p2221(V[409],V[410],V[418],V[604])elseif dG>=125 and dG<=129 then dV=xd(dG,e,gps)elseif dG==132 then dV=p2221(X[31],X[34],m_min(X[32],X[35]),V[6])elseif dG==139 then dV=p2221(V[570],V[659],V[660],V[661]/10)elseif dG==140 then dV=p2221(V[650],V[652],V[658],V[670+V[652]]/10)elseif dG==141 then dV=p2221(V[680],V[681],V[682],V[683]/10)else dV=p2221(V[119]*100,V[117]*100,sR*100,cL*10)end
bb_line(dG,dV,ev,gg,sc)
end
local bootStage=0;local bootStable=0;local bootTick=0;local bootSb=0;local warm=0
local function init()
 setgv(0,0);setgv(1,0);setgv(3,100);setgv(4,0);setgv(7,1024);loadMem();pcall(collectgarbage,"collect");V[654]=1;V[601]=50;V[602]=50;V[607]=50;V[608]=50;V[610]=50;V[612]=50;for i=629,635 do V[i]=V[i]>0 and V[i]or 50 end;V[638]=V[638]>0 and V[638]or 50;V[132]=V[132]or 100;V[290]=12;V[293]=0;V[303]=100;V[505]=V[505]>0 and V[505]or 85;bootStage=0;bootStable=0;bootTick=getTime()
end
local function bootStep()
 if bootStage==0 then idRxBt=fid("RxBt");bootStage=1;return false end
 if bootStage==1 then idRqly=fid("RQly");bootStage=2;return false end
 if bootStage==2 then idSats=fid("Sats");bootStage=3;return false end
 if bootStage==3 then idRpm=fid("RPM");bootStage=4;return false end
 if bootStage==4 then idSpd=fid("GSpd");bootStage=5;bootSb=(idSpd and 1 or 0)+(idRpm and 2 or 0)+(idSats and 4 or 0)+(idRxBt and 8 or 0)+(idRqly and 16 or 0);return false end
 if bootStage==5 then local g=val(idSpd,0);local e=ival(idRpm);local r=val(idRxBt,0);local s=ival(idSats);local ql=ival(idRqly);if alive(g,e,r,s,ql)then bootStable=bootStable+1 else bootStable=0 end;if bootStable<50 then return false end;bootStage=6;bootTick=getTime();return false end
 if bootStage==6 then if getTime()-bootTick<50 then return false end;for i=1,36 do X[i]=0 end;X[1]=99;X[4]=-1;X[7]=1;X[10]=99;X[12]=1;X[31]=50;X[34]=50;V[292]=bootSb;V[239]=V[330]or 70;V[321]=V[321]>0 and V[321]or(V[329]or 50);V[322]=V[322]>0 and V[322]or 2;bb_line(88,p2221(18,bootSb,95,0),0);bb_line(89,p2221(18,24,11,4),0);setgv(0,V[169]);setgv(1,V[30]);setgv(3,100);setgv(4,0);setgv(7,1024);X[7]=(bootSb==31 and gv(3)>=95 and gv(7)>=1000)and 1 or 0;warm=120;pcall(collectgarbage,"collect");bootStage=7;return false end
 return true
end
local cache={0,0,0,0,0,0}
local function background()
if not bootStep()then setgv(0,0);setgv(1,0);setgv(3,100);setgv(7,1024);return end
local gps=val(idSpd,0);local e=ival(idRpm);local rx=val(idRxBt,0);local sats=ival(idSats);local rq=ival(idRqly);local st=getValue("ch1");if type(st)~="number"then st=0 end;local th=getValue("ch2");if type(th)~="number"then th=0 end;if warm>0 then warm=warm-1;if warm==0 then pcall(collectgarbage,"collect")end else voiceTick()end;if V[627]==0 then vQuiet=m_max(vQuiet,70);V[606]=m_max(0,V[606]-1)end
setgv(7,1024);if rx<=3.5 and e<100 and gps<0.1 and sats==0 then offN=offN+1;if sessOn and not sumSent then bb_line(82,p2221(1,V[289],V[223],V[288]),0);bb_line(83,p332(V[301],V[302],V[303]),0);bb_line(84,p332(V[304],V[305],V[306]),0);local dC=clamp((V[371]or 50)-sC+50,0,99);local dM=clamp((V[321]or 50)-sM+50,0,99);local dK=clamp((V[530]or 50)-sK+50,0,99);local dB=clamp((V[503])-sB+50,0,99);bb_line(112,p2221(dC,dM,dK,dB/10),0);bb_line(118,p2221(V[602],V[610],V[612],V[606]/10),0);bb_line(119,p2221(V[620],V[624],V[625],V[628]),0);bb_line(120,p2221(V[633],V[634],V[635],V[638]/10),0);bb_line(121,V[402],0);bb_line(113,p2221(sessNo,V[289],V[333],V[543]),0);if dK>54 then cue(83,3,250)elseif dB>60 then cue(80,3,280)elseif dC>54 or dM>54 then cue(19,2,240)end;wrmem();bb_line(122,V[405],0);sndCd=0;vcCd=0;cue(N[1]>0 and 114 or 70,5,120);sumSent=true;sessOn=false;V[293]=1;V[620]=0;V[621]=0;V[622]=0;V[623]=0;V[624]=0;V[625]=0;V[626]=0;V[627]=0;V[628]=0;V[636]=0;V[639]=0 end;if offN<300 then setgv(0,0);setgv(1,0);setgv(3,100);setgv(7,1024);cache[1]=0;cache[2]=rx;cache[3]=rq;cache[4]=sats;cache[6]=e;bb_tick(gps,e,rx,sats,rq);return end
for i=112,126 do V[i]=nil end;for i=133,150 do V[i]=nil end;for i=155,169 do V[i]=nil end;for i=215,328 do V[i]=nil end;for i=341,349 do V[i]=nil end;for i=361,364 do V[i]=nil end;for i=380,397 do V[i]=nil end;for i=401,426 do V[i]=nil end;for i=500,504 do V[i]=nil end;for i=510,513 do V[i]=nil end;for i=520,523 do V[i]=nil end;for i=530,534 do V[i]=nil end;for i=540,545 do V[i]=nil end;for i=546,548 do V[i]=nil end;for i=620,628 do V[i]=nil end;V[550]=nil;V[551]=50;X[1]=99;X[2]=0;X[3]=0;X[4]=-1;X[5]=0;X[6]=0;X[7]=1
V[1]=GPS_LOST;V[35]=100;V[69]=1;V[124]=V[40];V[141]=100;V[145]=.5;V[146]=1;V[156]=50;V[159]=1;V[160]=1;V[165]=1;V[90]=50;V[63]=50;V[219]=100;V[221]=100;V[222]=100;V[231]=100;V[239]=V[330]or 70;V[303]=100;V[344]=80;V[346]=50;V[347]=80;V[349]=99;V[321]=V[329]or 50;V[322]=2;V[325]=50;V[326]=50;V[327]=50;V[361]=1;V[362]=50;V[363]=50;V[380]=80;V[382]=80;V[383]=100;V[384]=100;V[385]=100;V[389]=80;V[500]=85;V[504]=85;V[510]=20;V[511]=20;V[512]=80;V[520]=20;V[521]=80;V[523]=80;V[531]=50;V[532]=50;V[533]=50;V[540]=80;V[541]=70;V[542]=V[542]or 70;V[545]=50;V[182]=0;V[410]=0;V[418]=0;V[426]=0;V[503]=0;V[620]=0
setgv(0,0);setgv(1,0);setgv(3,100);setgv(7,1024);pL=0;pTH=th;sR=0;cL=0;srt=55;clt=30;pM=0;pF=0;eS=0;tF=0;gC=0;tN=0;tC=0;aC=0;pD=0;xW=0;qJ=0;fC=1;aT=0;aR=0;eT=0;eM=0;dT=0;r0=0;tS=0;hD=0;dI=0;bc=0;bm=0;bi=0;yP=0;btT=0;bR=0;pB=false;ld=0;exR=0;yZ=0;yT=0;gQ=1;tcK=0;GM={0,0,0,0,0,0};evK=0;evDur=0;evPeak=0;evEntry=0;evReason=0;evMin=100;evTC=0;evABS=0;V[549]=0;V[552]=0;V[553]=0;V[554]=0;V[555]=0;V[556]=0;V[557]=1;V[558]=0;aiShadow=100;aiGuard=0;aiCool=0;vLoad=0;voiceBlock=0;sndBlock=0;readyDone=false;unsafeLast=0;vQuiet=50;V[546]=0;V[547]=0;V[640]=0;V[641]=0;V[650]=0;V[651]=0;V[652]=1;V[653]=100;V[654]=1;V[655]=0;V[656]=0;V[657]=0;V[658]=0;V[659]=0;V[660]=0;V[661]=0;V[662]=0;V[663]=0;V[665]=0;V[667]=0;V[668]=0;V[669]=0;V[670]=0;V[680]=0;V[681]=0;V[682]=0;V[683]=0;om=1;oj=0;os=0;ot=1;ow=0;cache[1]=0;cache[2]=rx;cache[3]=rq;cache[4]=sats;cache[5]=V[57];cache[6]=e;bb_tick(gps,e,rx,sats,rq);return
end
offN=0;if not sessOn then voiceBlock=0;sndBlock=0;sessNo=sessNo+1;sC=V[371]or 50;sM=V[321]or 50;sK=V[530]or 50;sB=V[503];readyDone=false;sessOn=true;sumSent=false;memSaved=0 end;local b=battery(rx);local mph=update(gps,e,st,sats,m_abs(th),th,b,rq);cache[1]=mph;cache[2]=rx;cache[3]=rq;cache[4]=sats;cache[5]=b;cache[6]=e;if warm==0 then if not readyDone then local g3=gv(3);local g7=gv(7);local ok=((V[292])==31 and g3>=95 and g7>=1000)and 1 or 0;local fault=((idRpm and 0 or 1)+(idSpd and 0 or 2)+(g3>=95 and 0 or 4)+(g7>=1000 and 0 or 8));bb_line(110,p2221(sessNo,memLoaded,V[132]or 100,V[292]),0);bb_line(111,p2221(ok,fault,V[292],m_floor(g7/100)),0);if ok>0 then cue(90,3,220)elseif not idSpd then cue(40,4,240)else cue(31,4,260)end;readyDone=true end;bb_tick(gps,e,rx,sats,rq)end
end
local ui_tick=0
local function run(event)
ui_tick=(ui_tick+1)%3
if ui_tick~=0 and (event==0 or event==nil)then return end
draw(cache[1],cache[6])
end
return{init=init,run=run,background=background}

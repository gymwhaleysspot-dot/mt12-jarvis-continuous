from pathlib import Path
p=Path('a17y.lua')
s=p.read_text()
s=s.replace('--a17x transactional memory loader','--a17z unified world-model controller',1)
s=s.replace('T(2,1,"A17Y",Z+INVERS)','T(2,1,"A17Z",Z+INVERS)',1)
s=s.replace(';bb_line(142,p2221(V[248],V[232],V[166],V[167]),0)','',1)
def cut(name):
 global s
 a=s.index('local function '+name);b=s.index('\nlocal function ',a+1);s=s[:a]+s[b+1:]
for name in ('neural','evo','superBrain','aiGate','learn','condBrain'):cut(name)
ins=s.index('local function gripSM')
zb=r'''local function zBrain(k,a,b,c,d,e,f,g,h,i,j,l,m,n,o,p,r,u,w,y)
 if k==1 then
  local t=f or 0;local q=c1((.65-t)/.65);local z=c1(m_max(e or 0,q*.65));local x=c1(m_max(b or 0,(c or 0)*.7));local v=(t>.62 and z<.45)and x or 0;local F=m_max(z,q)*x;local G=(a and t>.70 and x<.18 and z<.25 and(d or 0)<.2)and 1 or 0;local T=V[38]>0 and 1 or 0;local A=V[39]>0 and 1 or 0;local tg=T*clamp(.55-x,0,.55)/.55;local tw=T*clamp(x-.45,0,.55)/.55;local th=T*(V[36]>22 and 1 or 0)*clamp(.30-x,0,.30)/.30;local ag=A*(d or 0)*clamp(.85-z,0,.85)/.85;local ah=A*(V[37]>22 and 1 or 0)*clamp(.35-(d or 0),0,.35)/.35;local U=.10;local D=.025
  lrn(1,1+G*.03+z*.02-th*.04,U,D,.92,1.08);lrn(2,1+v*.12+G*.05-F*.10,U,D,.85,1.25);lrn(3,1+ag*.08+z*.04+tw*.05-th*.08,U,D,.85,1.20);lrn(4,1+F*.32+q*.20-v*.10-G*.04,U,D,.75,1.45);lrn(5,1+F*.42+th*.28-v*.22-tw*.18,U,D,.70,1.60);lrn(6,1+tw*.22-th*.35-F*.30,U,D,.50,1.25);lrn(7,1+F*.35+q*.20+ah*.25-ag*.18,U,D,.75,1.60);lrn(8,1+v*.10+tw*.12-F*.22-th*.18,U,D,.70,1.28);lrn(9,1+G*.10+tg*.08-z*.10-tw*.08,U,D,.78,1.22);if not a then for I=1,9 do lrn(I,1,.015,.015,.5,1.6)end end;return
 elseif k==2 then
  local md=(a>3 and b>1)and c1(m_abs(b-a)/(a+3))or 0;local q=c1(V[114]*.44+gQ*.22+(1-V[119])*.20+(1-md)*.14);if c and a>3 and V[114]>.45 then V[224]=clamp(V[224]+1,0,900)else V[224]=clamp(V[224]-3,0,900)end;if not c or V[23]>0 or a<3 then q=q*.35 end;if V[161]>0 or V[164]>0 or d>0 then q=q*.72 end;if f then q=q*.90 end;if e>.65 then q=q*.82 end;if e>.68 or V[36]>25 or V[37]>25 then aiCool=25 elseif aiCool>0 then aiCool=m_max(0,aiCool-(.85+(V[371]-50)/100))end;local R=0;if not c or a<3 then R=1 elseif q<=.58 then R=2 elseif V[114]<=.62 then R=3 elseif V[119]>=.48 then R=4 elseif V[224]<=45 then R=5 elseif aiCool>0 then R=6 elseif V[23]>0 then R=7 elseif V[161]>0 or V[164]>0 then R=8 end;local L=R==0 and 1 or 0;V[288]=R;V[215]=q*100;V[216]=md*100;V[217]=L*100;V[218]=aiCool;V[680]=q*100;V[681]=md*100;return q,L
 elseif k==4 then
  if not a then return end;local mph=b;local th=e;local td=f;local st=g;local ds=h;local brake=i;local bl=j;local slip=l;local tc=m;local ab=n;local md=o;local btl=p;local rq=r;local sats=u;local br=w;local hz=V[179]/100;local good=(V[114]>.58 and V[119]<.3 and V[38]==0 and V[39]==0)and 1 or 0
  if V[502]==0 or btl>V[502]then V[502]=btl end;local sag=c9(V[502]-btl);V[501]=c9(V[501]*.96+sag*.04);V[505]=c9((V[505]>0 and V[505]or btl)*.992+btl*.008-(th>250 and .003 or .001));V[500]=c9(V[500]*.992+(100-V[501]*2)*.008);V[503]=c9(V[503]*.996+clamp(V[505]-btl,0,30)*.025+V[262]*.012-(V[262]<8 and .08 or 0));V[504]=c9(V[505]*.45+(rq or 0)*.22+(sats>=5 and 22 or 7)-V[501]*.35)
  local rear=c9((slip*mph)*.10+(tc or 0)*.65+(th>450 and 8 or 0)+(V[38]>0 and 8 or 0));local front=c9((ab or 0)*1.10+br*.42+bl*22+m_abs(st)/1024*16+(V[39]>0 and 9 or 0));V[510]=c9(V[510]+(rear-V[510])*(rear>V[510]and .035 or .010));V[511]=c9(V[511]+(front-V[511])*(front>V[511]and .035 or .012));local ta=(V[510]+V[511])*.5;V[512]=c9(100-m_abs(ta-48)*1.25-V[513]*.25);V[513]=c9(V[513]*.985+clamp(ta-62,0,40)*.05+((tc or 0)+(ab or 0))*.012)
  local jit=c1(m_abs(ds)/520+m_abs(td)/820+(brake and m_abs(td)/900 or 0));local evt=((tc or 0)>2 or(ab or 0)>2)and 1 or 0;V[520]=c9(V[520]*.985+(jit*55+evt*18+V[343]*.5+hz*18)*.015);V[521]=c9(100-V[520]*.75-V[204]*.25);V[522]=c9(V[522]*.995+((V[300]>900 and V[520]>45)and .12 or 0)-((good>0 and V[520]<25)and .04 or 0));V[523]=c9(100-V[520]*.55-V[522]*.35-V[342]*.7);V[530]=c9(V[347]*.38+V[512]*.18+V[521]*.16+(good>0 and 18 or 0)-md*18);V[531]=c9(V[531]+(V[530]-50)*.001+(((tc or 0)>2 and good>0)and .012 or 0));V[532]=c9(V[532]+(V[530]-50)*.001+(((ab or 0)>1 and brake)and .012 or 0));V[533]=c9(V[303]*.30+V[530]*.32+V[521]*.16+V[500]*.10-V[513]*.18);V[534]=(V[503]>35 and 3)or(V[513]>28 and 4)or(V[520]>55 and 5)or(V[530]>78 and 2)or 1;return
 end
 local mph=a;local th=b;local st=c;local brake=d;local rough=e;local cl=f;local gear=g;local sp=h;local br=i;local db=j;local hz=l;local md=m;local good=n;local lg=o
 local dl=c1(th/1024);local sl=c1(m_abs(st)/1024);local tr=c1(V[114]);local gb=1-tr;local air=(V[620]>0 and V[620]~=3)and 1 or 0;local esc=V[624]>0 and 1 or 0;local pt=V[620]==3 and 1 or 0
 local obs=c1(V[114]*.45+(1-V[119])*.30+(1-md)*.25);local rsk=c1(sp*.31+br*.24+db*.17+hz*.17+cl*.10+gb*.08+air*.18+esc*.22+(1-obs)*.18);local coh=c1((sp+br+db+hz+cl+gb)/6);local mem=clamp((V[704]-50)/250,-.18,.18);local pred=c1((V[270]+V[271]+100-V[272])/300);rsk=c1(rsk+coh*.05+(pred-.5)*.06+mem*.05);if good>0 and sl<.18 and mph>18 then rsk=rsk*.62 end
 local si=segIndex(mph,gear,st);local A=SG[si];local B=SG[clamp(si+1,1,24)];if V[401]~=si then A[8]=m_min(A[8]+1,99);V[401]=si end;local fm=m_min((A[8]-1)/5,1)*m_max(1-A[7]/55,0);local nr=m_min(B[1]/2+B[3]/18+B[4]/15,1);aiNext=c1(nr*(.35+m_min(B[7]/45,1)*.65)+.10-fm*.12+(V[403]>0 and .12 or 0));if lg>0 then A[1]=A[1]*.986+rsk*1.4;A[2]=A[2]+((1-rsk)*100-A[2])*.016;A[3]=A[3]*.965+(V[38]>0 and 7 or 0);A[4]=A[4]*.975+(sp+br)*2.5;if rsk>.38 then A[7]=c9(A[7]+rsk*1.5)elseif good>0 then A[7]=A[7]*.972 end end
 local atk=c9(74+dl*18+good*12-rsk*48-gb*14);local tc=c9(48+sp*49+hz*16+cl*16+aiNext*10+pred*12);local ab=brake and c9(50+br*45+hz*14+cl*9+pred*10)or 0;local ry=c9(48+sl*22+rough*24+sp*18-pt*8-rsk*12);local jp=air>0 and c9(66+V[410]*.28+V[426]*.20)or 0;local es=esc>0 and c9(78+dl*18)or 0;local dg=gb>.45 and c9(58+gb*36+md*28)or 0;local ca=c9(62+good*25+(1-rsk)*20-V[342]*1.1);local mo=1;local bs=atk;if tc>bs then mo=2;bs=tc end;if ab>bs then mo=3;bs=ab end;if ry>bs then mo=4;bs=ry end;if jp>bs then mo=5;bs=jp end;if es>bs then mo=6;bs=es end;if dg>bs then mo=7;bs=dg end;if ca>bs then mo=8;bs=ca end
 V[650]=(V[38]>0 or V[39]>0 or air+esc>0)and 2 or(rsk>.30 and 1 or 0);V[652]=(mo>1 and mo<8)and mo or 1;V[658]=mo;V[653]=(mo==4 and 108)or(mo==5 and 112)or(mo==6 and 92)or(mo==7 and 88)or 100;V[680]=obs*100;V[681]=rsk*100;V[682]=mo;V[683]=c9(bs);V[687]=p2221(mo,(obs<.45 and 4)or(lg>0 and 2)or(hz>.45 and 6)or 1,lg,0)
 local cut=0;local cap=100;local rel=1;if mo==2 then cut=rsk*8+sp*6;cap=97;rel=.86 elseif mo==3 then cut=br*10+rsk*3;cap=96;rel=.80 elseif mo==4 then cut=rough*3+sp*3;cap=98;rel=.94 elseif mo==5 then cut=rsk*5;cap=97;rel=.82 elseif mo==6 then rel=1.10 elseif mo==7 then cut=rsk*6+gb*4;cap=96;rel=.78 elseif mo==8 then rel=1.08 end;if pt>0 then cut=cut*.45;cap=m_max(cap,98);rel=m_max(rel,1.02)end;local auth=c1(obs*(.55+.45*good)*(lg>0 and 1 or .35));cut=m_min(cut*(.88+rsk*.24),clamp(7+rsk*8,5,14));V[182]=rsk*100;V[183]=auth*100;V[184]=mo;V[185]=bs;V[186]=si;V[187]=obs*100;return cut,cap,rel,auth,.96+rsk*.04,.94+obs*.06
end
'''
s=s[:ins]+zb+s[ins:]
s=s.replace('learn(moving,c1(slip/8),spin,lock,rough,V[5])','zBrain(1,moving,c1(slip/8),spin,lock,rough,V[5])',1)
s=s.replace('local aiAuth,aiLearnOK=aiGate(moving,mph,rM,rough,hz,brake)','local aiAuth,aiLearnOK=zBrain(2,mph,rM,moving,rough,hz,brake)',1)
s=s.replace('superBrain(mph,thrAbs,st,brakeSw,rough,contactLow,gear,spR,brR,dbR,hz,md,good,aiLearnOK)','zBrain(3,mph,thrAbs,st,brakeSw,rough,contactLow,gear,spR,brR,dbR,hz,md,good,aiLearnOK)',1)
s=s.replace('condBrain(moving,mph,e,rM,th,thDelta,st,dSt,brake,brakeLoad,slip,V[36],V[37],md,btl,rq,sats,brR,spR,hz,good,scare)','zBrain(4,moving,mph,e,rM,th,thDelta,st,dSt,brake,brakeLoad,slip,V[36],V[37],md,btl,rq,sats,brR,spR)',1)
for n in ('neural','evo','superBrain','aiGate','learn','condBrain'):
 assert 'local function '+n not in s
Path('a17z.lua').write_text(s)
print('A17Z source bytes',len(s))

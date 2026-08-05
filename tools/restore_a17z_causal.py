from pathlib import Path
p=Path('a17z.lua')
s=p.read_text()
anchor=' local obs=c1(V[114]*.45+(1-V[119])*.30+(1-md)*.25);local rsk='
assert s.count(anchor)==1
champ=''' local z=m_max(sp,br,db,hz);if X[7]>0 then X[46]=m_min(X[46]+1,200)else X[46]=0 end;if X[47]>0 then X[47]=X[47]-1 end
 local cf=c1(V[179]*.0045+V[114]*.25+(1-md)*.2+(1-V[119])*.1);local ev=(V[38]+V[39]+V[620]>0)and 1 or 0;local xs=X[37]or 0;local km=(V[620]>0 and 5)or(V[39]>0 and 2)or(V[38]>0 and((V[116]>.55 and 3)or 1))or(hz>.45 and 4 or 6);local elig=(md<.42 and V[119]<.45 and X[46]>120 and V[543]==0 and((V[38]>0 and V[39]>0)and 0 or 1))and 1 or 0
 if ev>0 then if xs~=3 then if X[39]>0 then V[705]=c9(V[705]+1)end;X[38]=z;X[41]=z*.55;X[42]=km;X[43]=elig end;X[38]=m_max(X[38],z);xs=3 elseif xs==3 then local ok=(good>0 or z<X[41])and 1 or 0;local er=clamp((X[41]-z)*100,-99,99);V[701]=ok;V[706]=c9(50+er*.5);V[709]=X[43]*100;V[710]=X[42];V[711]=c9(X[41]*100);V[712]=c9(z*100);km=X[42];local cj=740+km;local ch=V[cj];local bk=750+km;if V[bk]==0 then V[bk]=ch end;if X[43]>0 then local dl=clamp(er*.018,-1.2,1.2);local dr=dl>0 and 1 or-1;if X[48]~=0 and dr~=X[48]and X[47]>0 then dl=0 end;V[760+km]=V[760+km]+(ok>0 and 1 or-1);if X[50+km]==0 then X[50+km]=ch end;if V[760+km]>2 then V[cj]=clamp(ch+dl,X[50+km]-3,X[50+km]+3);V[bk]=V[cj];V[760+km]=0;V[713]=km;V[715]=dl>0 and 1 or 2;X[48]=dr;X[47]=25 elseif V[760+km]<-1 then V[cj]=V[bk];V[760+km]=0;V[714]=km;V[715]=3;X[47]=25 end;V[704]=c9(V[704]+(ok>0 and-1 or 2))end;X[39]=20;xs=ok>0 and 5 or 6 elseif X[39]>0 then X[39]=X[39]-1;xs=4 else xs=(z>.42 and 2)or(z>.3 and 1)or 0 end
 if V[620]>0 and V[620]~=3 then X[44]=1 elseif X[44]==1 and V[620]==3 then X[44]=2;X[45]=18 elseif X[45]>0 then X[45]=X[45]-1;X[44]=(X[45]>8 and 3)or 4 elseif X[44]>0 then X[44]=0 end;V[708]=X[44]
 local unc=c9(70-cf*70+md*20+V[119]*10);local ef=.72+cf*.28;local cm=.82+V[704]/278+(V[740+km]-50)*.004;local lm=(X[44]==2 and .78)or(X[44]==3 and .88)or 1;X[37]=xs
'''
s=s.replace(anchor,champ+anchor,1)
s=s.replace('rsk=c1(rsk+coh*.05+(pred-.5)*.06+mem*.05);','rsk=c1((rsk+coh*.05+(pred-.5)*.06+mem*.05)*ef);',1)
s=s.replace('return cut,cap,rel,auth,.96+rsk*.04,.94+obs*.06','return cut,cap,rel*cm*(pt>0 and .92 or 1)*lm,auth,.96+rsk*.04,(.94+obs*.06)*(unc>35 and .88 or 1)',1)
old='setgv(0,V[169]);setgv(3,V[35]);setgv(8,50+(1-V[40])*30);'
assert s.count(old)==1
new='setgv(0,V[169]);local ac=clamp(100-(V[704]-50)*.10-V[119]*7+(V[114]-.5)*5,82,100);if X[46]<120 then ac=m_min(ac,96)end;if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,94)end;V[720]=ac;setgv(3,m_min(V[35],ac));setgv(8,50+(1-V[40])*30);'
s=s.replace(old,new,1)
p.write_text(s)

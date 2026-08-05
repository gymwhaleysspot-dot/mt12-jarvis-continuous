from pathlib import Path
import re
p=Path('a17z.lua')
s=p.read_text()
anchor='local function gripSM'
assert anchor in s
champ=r'''local function zChampion(m,p,o,c)
 local I=710+clamp(m,1,8);if V[I]==0 then V[I]=100 end;if V[696]==0 then V[696]=100 end
 if X[41]~=m or m_abs((X[42]or 0)-p)>2 then X[41]=m;X[42]=p;X[43]=0;X[46]=0 end
 if o>0 and c>.62 then X[43]=m_min(X[43]+1,12);X[46]=m_max(X[46]-1,0)elseif o<0 then X[46]=m_min(X[46]+1,9);X[43]=m_max(X[43]-2,0)else X[43]=m_max(X[43]-.0045,0);X[46]=m_max(X[46]-.002,0)end
 if X[43]>=6 then V[I]=clamp(V[I]+(X[42]-V[I])*.25,78,100);V[697]=V[697]+1;X[43]=0;X[46]=0 elseif X[46]>=3 then X[42]=V[I];V[698]=V[698]+1;X[43]=0;X[46]=0 end
 local q=V[I];if c<.45 or o<0 then V[696]=m_max(78,V[696]-.08)else V[696]=m_min(q+4,V[696]+.03)end;V[699]=c*100;return q,V[696]
end
'''
s=s.replace(anchor,champ+anchor,1)
needle='local cut=0;local cap=100;local rel=1;'
assert needle in s
inject='local prop=clamp(100-rsk*18+(good>0 and 3 or 0),78,100);local out=(good>0 and obs>.62 and rsk<.38)and 1 or((obs<.4 or rsk>.72)and-1 or 0);local ch,ceil=zChampion(mo,prop,out,obs);'
s=s.replace(needle,inject+needle,1)
old='local auth=c1(obs*(.55+.45*good)*(lg>0 and 1 or .35));'
assert old in s
s=s.replace(old,'local auth=c1(obs*(.55+.45*good)*(lg>0 and 1 or .35)*ceil/100);',1)
s,n1=re.subn(r'setgv\(3,100\)', 'setgv(3,m_min(100,V[696]>0 and V[696]or 100))', s)
s,n2=re.subn(r'setgv\(3,V\[35\]\)', 'setgv(3,m_min(V[35],V[696]>0 and V[696]or V[35]))', s)
assert n1+n2>0
for token in ('X[41]','X[42]','X[43]','X[46]','.0045','V[696]','V[697]','V[698]','zChampion'):
 assert token in s,token
p.write_text(s)
print('A17Z-R1 source bytes',len(s),'authority replacements',n1+n2)

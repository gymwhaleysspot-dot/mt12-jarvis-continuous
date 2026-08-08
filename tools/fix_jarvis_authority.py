from __future__ import annotations
import re
from pathlib import Path

P=Path(__file__).with_name('controller_rewrite_hotfix.py')
OLD='"balanced":"local function jA2(a)local q=c1(V[114]);local u=c1(V[119]);local e=c1((V[161]+V[164])/2);X[55]=lerp(X[55]or e,e,.14);local d=e-(X[55]or e);X[56]=lerp(X[56]or 0,m_abs(d),.2);local sev=c1(e*.55+(X[56]or 0)*1.8+u*.3);local rel=c1(q*(1-u));X[57]=lerp(X[57]or sev,sev,sev>.5 and .25 or .08);return m_min(a,96-5*(X[57]or 0)+2*rel)end",'
NEW='"balanced":"local function jA2(a)local q=c1(V[114]);local u=c1(V[119]);local e=c1((V[161]+V[164])/2);X[67]=lerp(X[67]or e,e,.14);local d=e-(X[67]or e);X[68]=lerp(X[68]or 0,m_abs(d),.2);local sev=c1(e*.55+(X[68]or 0)*1.8+u*.3);local rel=c1(q*(1-u));X[69]=lerp(X[69]or sev,sev,sev>.5 and .25 or .08);return m_min(a,96-5*(X[69]or 0)+2*rel)end",'
FINALIZE=r'''
def _authority_finalize(text:str,profile:str)->str:
 # Strip inherited architecture helper *lines*. Evolution parents may already contain
 # one or many old jA*/jAS helpers; carrying them forward caused JRW6 call stacking.
 lines=text.splitlines()
 keep=[]; found={}
 for line in lines:
  st=line.strip()
  if re.match(r"local function jA[1-6]\\(a\\)",st) or st.startswith("local function jAS(a)"):
   m=re.match(r"local function (jA[1-6]|jAS)\\(a\\)",st)
   if m:found.setdefault(m.group(1),[]).append(st)
   continue
  keep.append(line)
 text="\\n".join(keep)
 lerp_line="local function lerp(a,b,t)t=c1(t);return a+(b-a)*t end"
 if lerp_line not in text:raise RuntimeError("authority lexical anchor missing")
 if profile=="synthesis":
  # Preserve the newly synthesized staged jAS, but install exactly one jA6 and one
  # isolated jA2. jAS internally evaluates jA6; jA2 remains the independent
  # traction ceiling. Scratch ownership: jA6=55..62, jAS=63..66, jA2=67..69.
  js=(found.get("jAS")or[])
  if not js:raise RuntimeError("synthesis helper jAS missing")
  ja=ARCH["synthesis"]+"\\n"+js[-1]+"\\n"+ARCH["balanced"]
  calls="ac=jAS(ac);ac=jA2(ac);"
 else:
  name="jA"+str(list(LABEL).index(profile)+1)
  ja=ARCH[profile];calls="ac="+name+"(ac);"
 text=text.replace(lerp_line,lerp_line+"\\n"+ja,1)
 tail="V[720]=ac;setgv(3,m_min(V[35],ac));"
 pos=text.find(tail)
 if pos<0:raise RuntimeError("authority gate missing")
 start=pos;pat=re.compile(r"ac=(?:jA[1-6]|jAS)\\(ac\\);")
 while True:
  last=None
  for m in pat.finditer(text,max(0,start-1024),start):last=m
  if last and last.end()==start:start=last.start()
  else:break
 text=text[:start]+calls+text[pos:]
 return text
'''
CHECKS=r'''
 # Authority architecture must be closed, singular, and lexically safe.
 lm=text.find("local function lerp(a,b,t)t=c1(t);return a+(b-a)*t end")
 for n in ("jA1","jA2","jA3","jA4","jA5","jA6","jAS"):
  dc=text.count("local function "+n+"(a)");cc=text.count(n+"(ac)")
  if dc>1:e.append("authority-duplicate-definition:"+n)
  if cc>1:e.append("authority-duplicate-call:"+n)
  if cc and not dc:e.append("authority-call-without-definition:"+n)
  p=text.find("local function "+n+"(a)")
  if p>=0 and (lm<0 or p<lm):e.append("authority-helper-before-local-lerp:"+n)
 m=re.search(r'T\\(2,1,"JRW([1-6])",Z\\+INVERS\\)',text)
 if m and m.group(1)=="6":
  for x in ("local function jA6(a)","local function jAS(a)","local function jA2(a)","ac=jAS(ac);ac=jA2(ac);","X[67]=lerp","X[68]=lerp","X[69]=lerp"):
   if x not in text:e.append("authority-synthesis-missing:"+x)
  j2=next((z for z in text.splitlines() if z.strip().startswith("local function jA2(a)")),"")
  if any(("X[%d]"%i) in j2 for i in range(55,67)):e.append("authority-scratch-collision:jA2")
'''

def main():
 s=P.read_text()
 if OLD in s:s=s.replace(OLD,NEW,1)
 elif NEW not in s:raise RuntimeError('balanced architecture anchor changed')
 if 'def _authority_finalize(' not in s:
  anchor='def _label(text:str,p:str)->str:'
  if anchor not in s:raise RuntimeError('finalizer insertion anchor missing')
  s=s.replace(anchor,FINALIZE+'\n'+anchor,1)
 if 'authority-duplicate-definition:' not in s:
  anchor=' if not re.search(r\'T\\(2,1,"[A-Za-z0-9]{3,8}",Z\\+INVERS\\)\',text):e.append("missing:generated runtime release label")'
  if anchor not in s:raise RuntimeError('protected-check insertion anchor missing')
  s=s.replace(anchor,CHECKS+'\n'+anchor,1)
 old='return _label(_inject(x,profile),profile)'
 new='return _label(_authority_finalize(_inject(x,profile),profile),profile)'
 if old in s:s=s.replace(old,new,1)
 elif new not in s:raise RuntimeError('experiment finalization anchor changed')
 P.write_text(s)
 print({'patched':str(P),'bytes':len(s.encode())})
if __name__=='__main__':main()

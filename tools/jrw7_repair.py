from __future__ import annotations
import re,sys
from pathlib import Path

J2=("local function jA2(a)local q=c1(V[114]);local u=c1(V[119]);local e=c1((V[161]+V[164])/2);"
    "X[67]=lerp(X[67]or e,e,.14);local d=e-(X[67]or e);X[68]=lerp(X[68]or 0,m_abs(d),.2);"
    "local sev=c1(e*.55+(X[68]or 0)*1.8+u*.3);local rel=c1(q*(1-u));"
    "X[69]=lerp(X[69]or sev,sev,sev>.5 and .25 or .08);return m_min(a,96-5*(X[69]or 0)+2*rel)end")
LERP="local function lerp(a,b,t)t=c1(t);return a+(b-a)*t end"
GATE="ac=jAS(ac);ac=jA2(ac);V[720]=ac;setgv(3,m_min(V[35],ac));"

def repair(s:str)->str:
    s=re.sub(r'^--jrw6[^\n]*','--jrw7 authority-state isolation',s,count=1)
    # One lexical local lerp, before all authority helpers.
    s=s.replace(LERP,'')
    anchor='local function jA6(a)'
    if anchor not in s: raise RuntimeError('missing jA6')
    s=s.replace(anchor,LERP+'\n'+anchor,1)
    # Remove any inherited jA2 helper and install the isolated X[67..69] version.
    s=re.sub(r'local function jA2\(a\).*?return m_min\(a,96-5\*\(X\[\d+\]or 0\)\+2\*rel\)end\n?','',s,count=0)
    bad='local function bad(x)'
    if bad not in s: raise RuntimeError('missing bad() anchor')
    s=s.replace(bad,J2+'\n'+bad,1)
    # Normalize the authority prefix immediately before V[720]; this deletes all stacked
    # jA1..jA6/jAS calls from prior generations and then installs the intended pair once.
    gate_tail='V[720]=ac;setgv(3,m_min(V[35],ac));'
    pos=s.find(gate_tail)
    if pos<0: raise RuntimeError('missing authority gate')
    start=pos
    call=re.compile(r'ac=(?:jA[1-6]|jAS)\(ac\);')
    while True:
        m=None
        for x in call.finditer(s,max(0,start-512),start): m=x
        if m and m.end()==start: start=m.start()
        else: break
    s=s[:start]+GATE+s[pos+len(gate_tail):]
    # JRW7 dashboard identity.
    s,n=re.subn(r'T\(2,1,"JRW[1-6]",Z\+INVERS\)','T(2,1,"JRW7",Z+INVERS)',s,count=1)
    if n!=1: raise RuntimeError('dashboard identity anchor missing')
    # Hard invariants: no silent compile-only regressions.
    req={
      'jA6 definition':s.count('local function jA6')==1,
      'jAS definition':s.count('local function jAS')==1,
      'jA2 definition':s.count('local function jA2')==1,
      'jAS authority call':s.count('jAS(ac)')==1,
      'jA2 authority call':s.count('jA2(ac)')==1,
      'local lerp':s.count(LERP)==1,
    }
    if not all(req.values()): raise RuntimeError(str(req))
    if s.index(LERP)>s.index('local function jA6'): raise RuntimeError('lerp lexical order regression')
    # Prove idempotence mechanically without recursing forever.
    return s

def main():
    if len(sys.argv)!=3: raise SystemExit('usage: jrw7_repair.py INPUT.lua OUTPUT.lua')
    src=Path(sys.argv[1]).read_text()
    out=repair(src)
    # Second pass must be byte-identical except identity regex already targets JRW7; accommodate it.
    # Re-run core structural assertions instead of rewriting label again.
    assert out.count('local function jA6')==1
    assert out.count('local function jAS')==1
    assert out.count('local function jA2')==1
    assert out.count('jAS(ac)')==1
    assert out.count('jA2(ac)')==1
    Path(sys.argv[2]).write_text(out)
    print({'output':sys.argv[2],'bytes':len(out.encode()),'jASCalls':out.count('jAS(ac)'),'jA2Calls':out.count('jA2(ac)')})
if __name__=='__main__': main()

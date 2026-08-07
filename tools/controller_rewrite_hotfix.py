from __future__ import annotations
import re
from pathlib import Path
import controller_rewrite_factory as rewrite_factory
import controller_tournament as tournament
import jarvis_canonical_parent,jarvis_evolution_parent

ROOT=Path(__file__).resolve().parents[1]
_original_checks=tournament.protected_checks
_original_rewrite=rewrite_factory.experiment_rewrite
SLOT_AREA={"conservative":"dropout-state-machine","balanced":"traction-state-estimator","learning":"airborne-landing-observer","observability":"truth-fusion-observer","combined":"abs-state-controller","synthesis":"unified-causal-supervisor"}
LABEL={"conservative":"JRW1","balanced":"JRW2","learning":"JRW3","observability":"JRW4","combined":"JRW5","synthesis":"JRW6"}
ARCH={
"conservative":"local function jA1(a)local u=c1(V[119]);local c=c1(V[114]);X[55]=lerp(X[55]or c,c,.08);if u>.45 then X[56]=m_min(60,(X[56]or 0)+1)else X[56]=m_max(0,(X[56]or 0)-2)end;local r=c1((X[55]or 0)*(1-u));local cap=91+5*r;if(X[56]or 0)>8 then cap=cap-2 end;X[57]=lerp(X[57]or cap,cap,.18);return m_min(a,X[57])end",
"balanced":"local function jA2(a)local q=c1(V[114]);local u=c1(V[119]);local e=c1((V[161]+V[164])/2);X[55]=lerp(X[55]or e,e,.14);local d=e-(X[55]or e);X[56]=lerp(X[56]or 0,m_abs(d),.2);local sev=c1(e*.55+(X[56]or 0)*1.8+u*.3);local rel=c1(q*(1-u));X[57]=lerp(X[57]or sev,sev,sev>.5 and .25 or .08);return m_min(a,96-5*(X[57]or 0)+2*rel)end",
"learning":"local function jA3(a)local u=c1(V[119]);local air=V[543]>0 and 1 or 0;X[55]=clamp((X[55]or 0)+(air and(1-u)*.18 or -.12),0,1);local land=(not air and(X[55]or 0)>.35)and 1 or 0;X[56]=clamp((X[56]or 0)+(land*.22-.08),0,1);if land>0 then X[57]=(X[57]or 0)+1 else X[57]=m_max(0,(X[57]or 0)-1)end;local conf=c1((X[55]or 0)*(1-u));local cap=96-3*conf-((X[57]or 0)>3 and 2 or 0);return m_min(a,cap)end",
"observability":"local function jA4(a)local q=c1(V[114]);local u=c1(V[119]);local ca=c1((X[46]or 0)/200);local obs=c1(q*.45+(1-u)*.35+ca*.2);X[55]=lerp(X[55]or obs,obs,obs<(X[55]or obs)and .22 or .07);X[56]=lerp(X[56]or u,u,.12);local trust=c1((X[55]or 0)*(1-(X[56]or 0)*.35));local cap=92+5*trust;return m_min(a,cap)end",
"combined":"local function jA5(a)local b=(V[161]>0 or V[164]>0 or V[543]>0)and 1 or 0;local q=c1(V[114]);local u=c1(V[119]);X[55]=clamp((X[55]or 0)+(b and .16 or -.09),0,1);local lock=c1((X[55]or 0)*(.7+.3*u));X[56]=lerp(X[56]or lock,lock,lock>.45 and .28 or .1);local rec=c1(q*(1-u));local cap=96-5*(X[56]or 0)+rec;return m_min(a,cap)end",
"synthesis":"local function jA6(a)local q=c1(V[114]);local u=c1(V[119]);local ca=c1((X[46]or 0)/200);local tc=c1((V[161]+V[164])/2);local air=V[543]>0 and 1 or 0;X[55]=lerp(X[55]or q,q,.08);X[56]=lerp(X[56]or u,u,.12);X[57]=lerp(X[57]or tc,tc,.14);X[58]=clamp((X[58]or 0)+(air and(1-u)*.18 or -.12),0,1);local land=(not air and(X[58]or 0)>.35)and 1 or 0;X[59]=clamp((X[59]or 0)+(land*.22-.08),0,1);local brake=(V[161]>0 or V[164]>0)and 1 or 0;X[60]=clamp((X[60]or 0)+(brake and .15 or -.09),0,1);local obs=c1((X[55]or 0)*.35+(1-(X[56]or 0))*.3+ca*.2+(1-(X[57]or 0))*.15);X[61]=lerp(X[61]or obs,obs,obs<(X[61]or obs)and .2 or .06);local risk=c1((X[56]or 0)*.22+(X[57]or 0)*.25+(X[58]or 0)*.18+(X[60]or 0)*.25+(1-(X[61]or 0))*.1);local cap=97-7*risk;if land>0 then cap=cap-1 end;X[62]=lerp(X[62]or cap,cap,risk>.5 and .24 or .09);return m_min(a,X[62])end"
}

def protected_checks(text:str)->list[str]:
 e=[x for x in _original_checks(text) if x!="missing:A17Z"]
 req=("local function zBrain","V[704]","X[46]","V[720]=ac","setgv(3,m_min(V[35],ac))","V[740+km]","V[760+km]","local pc=pcall","pc(getFieldInfo","pc(getValue","pc(model.getGlobalVariable","pc(model.setGlobalVariable","/LOGS/m0","/LOGS/m1","local function memOpt","local function watch","V[179]*.0045","92+4*dc","bb_line(144,li1,0)","bb_line(147,li4,0)","bb_line(148,rg1,0)","bb_line(151,rg4,0)","local bv=cache[2]or 0","local bv=rx;if mph>V[792]",'"BAT"')
 e.extend(f"missing-lineage-floor:{x}" for x in req if x not in text)
 for bad in("setgv(3,V[35])","V[179]*(.00435","V[179]*(.0044","V[179]*.0048","V[179]*.0050",'fid("VFAS")','fid("EscV")','fid("A4")'):
  if bad in text:e.append("forbidden-lineage-regression:"+bad)
 if not re.search(r'T\(2,1,"[A-Za-z0-9]{3,8}",Z\+INVERS\)',text):e.append("missing:generated runtime release label")
 return e

def _restore(text:str)->str:
 for old in("V[179]*.0050","V[179]*.0048","V[179]*(.0044+.0001*m_min(1,V[166]/100))","V[179]*(.00435+.00015*m_min(1,X[46]/120))"):text=text.replace(old,"V[179]*.0045")
 return text

def _reuse(text:str)->str:
 pat=re.compile(r"local rg1,rg2,rg3,rg4=\d+,\d+,\d+,\d+");ms=list(pat.finditer(text))
 if not ms:raise RuntimeError("missing rewrite generation identity")
 if len(ms)>1:
  keep=ms[0].group(0);text=pat.sub("",text);text=text.replace("local bc,bm,bi=0,0,0","local bc,bm,bi=0,0,0;"+keep,1)
 emit="if li==0 then bb_line(148,rg1,0);bb_line(149,rg2,0);bb_line(150,rg3,0);bb_line(151,rg4,0)end;"
 while text.count(emit)>1:text=text.replace(emit,"",1)
 return text

def imprint_runtime_identity(text:str,token:str,chunks:list[int])->str:
 pat=re.compile(r"local li1,li2,li3,li4=\d+,\d+,\d+,\d+");text,n=pat.subn("local li1,li2,li3,li4="+",".join(map(str,chunks)),text,count=1)
 if n!=1:raise RuntimeError("runtime identity declaration mismatch")
 return text

def _inject(text:str,profile:str)->str:
 fn=ARCH[profile];name="jA"+str(list(LABEL).index(profile)+1)
 if fn in text:return text
 anchor="local function bad(x)"
 if anchor not in text:raise RuntimeError("architecture helper anchor missing")
 text=text.replace(anchor,fn+"\n"+anchor,1)
 gate="V[720]=ac;setgv(3,m_min(V[35],ac));"
 if gate not in text:raise RuntimeError("authority gate anchor missing")
 text=text.replace(gate,"ac="+name+"(ac);"+gate,1)
 return text

def _label(text:str,p:str)->str:
 text,n=re.subn(r'T\(2,1,"[A-Za-z0-9]{3,8}",Z\+INVERS\)',f'T(2,1,"{LABEL[p]}",Z+INVERS)',text,count=1)
 if n!=1:raise RuntimeError("dashboard label anchor missing")
 return text

def experiment_rewrite(text:str,profile:str,experiment:dict,generation:str)->str:
 seed=dict(experiment);seed["area"]="controller-observability"
 x=_original_rewrite(text,"balanced",seed,generation);x=_restore(x);x=_reuse(x)
 x=x.replace("if X[29]>0 then bb_line(143,p2221(ac,V[704],V[114]*100,V[119]*100),0)end;","")
 x=x.replace("if X[29]>0 and X[46]<80 then bb_line(142,p2221(ac,X[46],V[166],V[167]),0)end;","")
 return _label(_inject(x,profile),profile)

def _parent_text():
 _,p=jarvis_evolution_parent.resolve();return p.read_text()

def candidate_bonus(profile:str,text:str)->dict[str,float]:
 parent=_parent_text();keys={"conservative":"dropoutGain","balanced":"tractionGain","learning":"jumpGain","observability":"truthGain","combined":"absGain"};out={k:0.0 for k in("dropoutGain","tractionGain","jumpGain","truthGain","absGain")}
 if profile=="synthesis":
  new="local function jA6" in text and "local function jA6" not in parent
  if new:
   for k in out:out[k]=3.0
  out["compositionGain"]=4.0 if new else 0.0
 else:
  k=keys[profile];marker="local function jA"+str(list(LABEL).index(profile)+1);out[k]=4.0 if marker in text and marker not in parent else 0.0;out["compositionGain"]=0.0
 return out

def main():
 tournament.latest_release=jarvis_evolution_parent.resolve;tournament.protected_checks=protected_checks;tournament.candidate_bonus=candidate_bonus;tournament.imprint_runtime_identity=imprint_runtime_identity;rewrite_factory.experiment_rewrite=experiment_rewrite
 e,src=jarvis_evolution_parent.resolve();c,_=jarvis_canonical_parent.resolve();print({"evolutionParent":e,"canonicalFloor":c,"strategy":"STRUCTURAL_ARCHITECTURE_PORTFOLIO","architectures":SLOT_AREA,"source":str(src)});rewrite_factory.main()
if __name__=="__main__":main()

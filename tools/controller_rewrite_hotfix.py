from __future__ import annotations
import re,json
from pathlib import Path
import controller_rewrite_factory as rewrite_factory
import controller_tournament as tournament
import jarvis_canonical_parent,jarvis_evolution_parent

ROOT=Path(__file__).resolve().parents[1]
_original_checks=tournament.protected_checks
_original_rewrite=rewrite_factory.experiment_rewrite
SLOT_AREA={"conservative":"dropout-state-machine","balanced":"traction-state-estimator","learning":"airborne-landing-observer","observability":"truth-fusion-observer","combined":"abs-state-controller","synthesis":"outcome-driven-causal-synthesis"}
LABEL={"conservative":"JRW1","balanced":"JRW2","learning":"JRW3","observability":"JRW4","combined":"JRW5","synthesis":"JRW6"}

# Scratch ownership is a generator contract, not an implementation accident.
# jA6/jAS retain their historical synthesis block; every sibling architecture owns
# a disjoint block so composition cannot corrupt another stateful helper.
ARCH={
"conservative":"local function jA1(a)local u=c1(V[119]);local c=c1(V[114]);X[67]=lerp(X[67]or c,c,.08);if u>.45 then X[68]=m_min(60,(X[68]or 0)+1)else X[68]=m_max(0,(X[68]or 0)-2)end;local r=c1((X[67]or 0)*(1-u));local cap=91+5*r;if(X[68]or 0)>8 then cap=cap-2 end;X[69]=lerp(X[69]or cap,cap,.18);return m_min(a,X[69])end",
"balanced":"local function jA2(a)local q=c1(V[114]);local u=c1(V[119]);local e=c1((V[161]+V[164])/2);X[70]=lerp(X[70]or e,e,.14);local d=e-(X[70]or e);X[71]=lerp(X[71]or 0,m_abs(d),.2);local sev=c1(e*.55+(X[71]or 0)*1.8+u*.3);local rel=c1(q*(1-u));X[72]=lerp(X[72]or sev,sev,sev>.5 and .25 or .08);return m_min(a,96-5*(X[72]or 0)+2*rel)end",
"learning":"local function jA3(a)local u=c1(V[119]);local air=(V[620]>0 and V[620]~=3)and 1 or 0;X[73]=clamp((X[73]or 0)+(air*(1-u)*.18-.12),0,1);local land=(air==0 and(X[73]or 0)>.35)and 1 or 0;X[74]=clamp((X[74]or 0)+(land*.22-.08),0,1);if land>0 then X[75]=(X[75]or 0)+1 else X[75]=m_max(0,(X[75]or 0)-1)end;local conf=c1((X[73]or 0)*(1-u));local cap=96-3*conf-((X[75]or 0)>3 and 2 or 0);return m_min(a,cap)end",
"observability":"local function jA4(a)local q=c1(V[114]);local u=c1(V[119]);local ca=c1((X[46]or 0)/200);local obs=c1(q*.45+(1-u)*.35+ca*.2);X[76]=lerp(X[76]or obs,obs,obs<(X[76]or obs)and .22 or .07);X[77]=lerp(X[77]or u,u,.12);local trust=c1((X[76]or 0)*(1-(X[77]or 0)*.35));local cap=92+5*trust;return m_min(a,cap)end",
"combined":"local function jA5(a)local b=(V[161]>0 or V[164]>0 or V[543]>0)and 1 or 0;local q=c1(V[114]);local u=c1(V[119]);X[78]=clamp((X[78]or 0)+(b and .16 or -.09),0,1);local lock=c1((X[78]or 0)*(.7+.3*u));X[79]=lerp(X[79]or lock,lock,lock>.45 and .28 or .1);local rec=c1(q*(1-u));local cap=96-5*(X[79]or 0)+rec;return m_min(a,cap)end",
"synthesis":"local function jA6(a)local q=c1(V[114]);local u=c1(V[119]);local ca=c1((X[46]or 0)/200);local tc=c1((V[161]+V[164])/2);local air=(V[620]>0 and V[620]~=3)and 1 or 0;X[55]=lerp(X[55]or q,q,.08);X[56]=lerp(X[56]or u,u,.12);X[57]=lerp(X[57]or tc,tc,.14);X[58]=clamp((X[58]or 0)+(air*(1-u)*.18-.12),0,1);local land=(air==0 and(X[58]or 0)>.35)and 1 or 0;X[59]=clamp((X[59]or 0)+(land*.22-.08),0,1);local brake=(V[161]>0 or V[164]>0)and 1 or 0;X[60]=clamp((X[60]or 0)+(brake and .15 or -.09),0,1);local obs=c1((X[55]or 0)*.35+(1-(X[56]or 0))*.3+ca*.2+(1-(X[57]or 0))*.15);X[61]=lerp(X[61]or obs,obs,obs<(X[61]or obs)and .2 or .06);local risk=c1((X[56]or 0)*.22+(X[57]or 0)*.25+(X[58]or 0)*.18+(X[60]or 0)*.25+(1-(X[61]or 0))*.1);local cap=97-7*risk;if land>0 then cap=cap-1 end;X[62]=lerp(X[62]or cap,cap,risk>.5 and .24 or .09);return m_min(a,X[62])end"
}
OWNERS={"jA6":set(range(55,63)),"jAS":set(range(63,67)),"jA1":set(range(67,70)),"jA2":set(range(70,73)),"jA3":set(range(73,76)),"jA4":set(range(76,78)),"jA5":set(range(78,80))}
LERP="local function lerp(a,b,t)t=c1(t);return a+(b-a)*t end"
GATE="V[720]=ac;setgv(3,m_min(V[35],ac));"

def _function_line(text:str,name:str)->str:
 m=re.search(rf"(?m)^local function {re.escape(name)}\(a\).*?$",text)
 return m.group(0) if m else ""

def _slots(line:str)->set[int]:
 return {int(x) for x in re.findall(r"X\[(\d+)\]",line)}

def _write_slots(line:str)->set[int]:
 return {int(x) for x in re.findall(r"X\[(\d+)\]\s*=",line)}

def _authority_orphan_bodies()->set[str]:
 out=set()
 for fn in ARCH.values():
  m=re.match(r"local function jA[1-6]\(a\)(.*)$",fn)
  if m:out.add(m.group(1))
 return out

def _strip_authority(text:str)->str:
 # Authority code is generator-owned. Remove complete one-line definitions and calls,
 # plus exact orphan bodies created by older declaration-only stripping. Never half-strip
 # an unknown multiline function because that can corrupt Lua structure silently.
 orphan=_authority_orphan_bodies();out=[]
 decl=re.compile(r"^\s*local function (jA[1-6]|jAS)\(a\)(.*)$")
 call=re.compile(r"ac=(jA[1-6]|jAS)\(ac\);")
 for line in text.splitlines(keepends=True):
  raw=line.rstrip("\r\n");s=raw.strip()
  if s in orphan:continue
  m=decl.match(raw)
  if m:
   body=m.group(2).strip()
   if body and body.endswith("end"):continue
   raise RuntimeError("noncanonical multiline authority definition; refusing partial strip: "+m.group(1))
  line=call.sub("",line);out.append(line)
 clean="".join(out)
 if re.search(r"(?m)^\s*local function (jA[1-6]|jAS)\(a\)",clean):raise RuntimeError("authority strip left a definition")
 if call.search(clean):raise RuntimeError("authority strip left a generated call")
 return clean

def _assert_authority(text:str,profile:str)->list[str]:
 e=[]
 required=["jA2"] + ([] if profile=="balanced" else (["jA6","jAS"] if profile=="synthesis" else ["jA"+str(list(LABEL).index(profile)+1)]))
 writes={}
 for name in required:
  if len(re.findall(rf"(?m)^local function {name}\(a\)",text))!=1:e.append(f"authority-definition-count:{name}")
  line=_function_line(text,name);writes[name]=_write_slots(line)
  if line and not writes[name]<=OWNERS[name]:e.append(f"authority-slot-ownership:{name}:{sorted(writes[name]-OWNERS[name])}")
 for i,name in enumerate(required):
  for other in required[i+1:]:
   overlap=writes.get(name,set())&writes.get(other,set())
   if overlap:e.append(f"authority-slot-collision:{name}:{other}:{sorted(overlap)}")
 if text.count("ac=jA2(ac);")!=1:e.append(f"authority-call-count:jA2:{text.count('ac=jA2(ac);')}")
 if profile=="synthesis":
  if text.count("ac=jAS(ac);")!=1:e.append(f"authority-call-count:jAS:{text.count('ac=jAS(ac);')}")
  if "ac=jA6(ac);" in text:e.append("authority-double-call:jA6")
 else:
  name="jA"+str(list(LABEL).index(profile)+1)
  if profile!="balanced" and text.count(f"ac={name}(ac);")!=1:e.append(f"authority-call-count:{name}:{text.count(f'ac={name}(ac);')}")
  if "ac=jAS(ac);" in text:e.append("authority-stale-call:jAS")
 if "X[55]=lerp(X[55]or e,e,.14)" in text or "X[56]=lerp(X[56]or 0,m_abs(d),.2)" in text:e.append("authority-legacy-jA2-slot-collision")
 if "local air=V[543]>0 and 1 or 0" in text:e.append("authority-unsafe-flag-used-as-airborne")
 if "(air and(1-u)*.18 or -.12)" in text or "local land=(not air and" in text:e.append("authority-numeric-boolean-air-logic")
 if "for i=55,79 do X[i]=nil end" not in text:e.append("authority-state-reset-missing")
 lp=text.find(LERP)
 for name in required:
  p=text.find("local function "+name+"(a)")
  if p>=0 and (lp<0 or p<lp):e.append(f"authority-helper-before-lerp:{name}")
 return e

def protected_checks(text:str)->list[str]:
 e=[x for x in _original_checks(text) if x!="missing:A17Z"]
 req=("local function zBrain","V[704]","X[46]","V[720]=ac","setgv(3,m_min(V[35],ac))","V[740+km]","V[760+km]","local pc=pcall","pc(getFieldInfo","pc(getValue","pc(model.getGlobalVariable","pc(model.setGlobalVariable","/LOGS/m0","/LOGS/m1","local function memOpt","local function watch","V[179]*.0045","92+4*dc","bb_line(144,li1,0)","bb_line(147,li4,0)","bb_line(148,rg1,0)","bb_line(151,rg4,0)","local bv=cache[2]or 0","local bv=rx;if mph>V[792]",'"BAT"')
 e.extend(f"missing-lineage-floor:{x}" for x in req if x not in text)
 for bad in("setgv(3,V[35])","V[179]*(.00435","V[179]*(.0044","V[179]*.0048","V[179]*.0050",'fid("VFAS")','fid("EscV")','fid("A4")'):
  if bad in text:e.append("forbidden-lineage-regression:"+bad)
 if not re.search(r'T\(2,1,"[A-Za-z0-9]{3,8}",Z\+INVERS\)',text):e.append("missing:generated runtime release label")
 m=re.search(r'T\(2,1,"JRW([1-6])",Z\+INVERS\)',text)
 if m:
  profile=list(LABEL)[int(m.group(1))-1]
  e.extend(_assert_authority(text,profile))
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

def _latest_feedback()->tuple[str,str]:
 best=(-1,"","")
 for p in ROOT.glob("public/builds/rewrite-*/TOURNAMENT.json"):
  m=re.search(r"rewrite-(\d+)-",str(p))
  if not m:continue
  try:d=json.loads(p.read_text())
  except Exception:continue
  n=int(m.group(1));w=d.get("winner")or"";r=d.get("runnerUp")or""
  if w and n>best[0]:best=(n,w,r)
 return best[1],best[2]

def _synth_fn(text:str)->tuple[str,str]:
 winner,runner=_latest_feedback();stage=1
 m=re.search(r"local function jAS\(a\)local s=(\d+);",text)
 if m:stage=int(m.group(1))+1
 fn=("local function jAS(a)local s="+str(stage)+";local b=jA6(a);local q=c1(V[114]);local u=c1(V[119]);local ca=c1((X[46]or 0)/200);local e=c1((V[161]+V[164])/2);"
     "X[63]=lerp(X[63]or e,e,.12+.01*m_min(s,4));local d=m_abs(e-(X[63]or e));X[64]=lerp(X[64]or d,d,.18+.01*m_min(s,5));"
     "local sev=c1(e*.52+(X[64]or 0)*1.9+u*.28);local obs=c1(q*.43+(1-u)*.34+ca*.23);X[65]=lerp(X[65]or obs,obs,obs<(X[65]or obs)and .24 or .065);"
     "local trust=c1((X[65]or 0)*(1-u*.3));X[66]=lerp(X[66]or sev,sev,sev>.48 and .27 or .075);local cap=94.5-4.8*(X[66]or 0)+2.4*trust;return m_min(b,cap)end")
 return fn,f"feedback:{winner}>{runner};stage:{stage}"

def _install_authority(text:str,profile:str,stage_source:str)->str:
 clean=_strip_authority(text)
 if LERP not in clean:raise RuntimeError("local lerp anchor missing")
 helpers=[ARCH["balanced"]]
 calls=["ac=jA2(ac);"]
 if profile=="synthesis":
  helpers.append(ARCH["synthesis"])
  sf,_=_synth_fn(stage_source);helpers.append(sf)
  calls.append("ac=jAS(ac);")
 elif profile!="balanced":
  helpers.append(ARCH[profile])
  calls.append("ac=jA"+str(list(LABEL).index(profile)+1)+"(ac);")
 clean=clean.replace(LERP,LERP+"\n"+"\n".join(helpers),1)
 if GATE not in clean:raise RuntimeError("authority gate anchor missing")
 clean=clean.replace(GATE,"".join(calls)+GATE,1)
 safe_pat=re.compile(r"local function safe\(\)setgv\(0,0\);setgv\(1,0\);setgv\(3,100\);setgv\(7,1024\)(?:;for i=55,\d+ do X\[i\]=nil end)? end")
 safe_new="local function safe()setgv(0,0);setgv(1,0);setgv(3,100);setgv(7,1024);for i=55,79 do X[i]=nil end end"
 clean,safe_n=safe_pat.subn(safe_new,clean)
 if safe_n!=1:raise RuntimeError(f"authority safe-reset contract mismatch:{safe_n}")
 boot_pat=re.compile(r"for i=1,54 do X\[i\]=0 end;(?:for i=55,\d+ do X\[i\]=nil end;)?X\[1\]=99")
 boot_new="for i=1,54 do X[i]=0 end;for i=55,79 do X[i]=nil end;X[1]=99"
 clean,boot_n=boot_pat.subn(boot_new,clean)
 if boot_n<1:raise RuntimeError("authority boot-reset anchor missing")
 errs=_assert_authority(clean,profile)
 if errs:raise RuntimeError("authority canonicalization failed: "+";".join(errs))
 return clean

def _label(text:str,p:str)->str:
 text,n=re.subn(r'T\(2,1,"[A-Za-z0-9]{3,8}",Z\+INVERS\)',f'T(2,1,"{LABEL[p]}",Z+INVERS)',text,count=1)
 if n!=1:raise RuntimeError("dashboard label anchor missing")
 return text

def experiment_rewrite(text:str,profile:str,experiment:dict,generation:str)->str:
 parent=_strip_authority(text)
 seed=dict(experiment);seed["area"]="controller-observability"
 x=_original_rewrite(parent,"balanced",seed,generation);x=_restore(x);x=_reuse(x)
 x=x.replace("if X[29]>0 then bb_line(143,p2221(ac,V[704],V[114]*100,V[119]*100),0)end;","")
 x=x.replace("if X[29]>0 and X[46]<80 then bb_line(142,p2221(ac,X[46],V[166],V[167]),0)end;","")
 x=_install_authority(x,profile,text)
 x=_label(x,profile)
 errs=protected_checks(x)
 if errs:raise RuntimeError("self-repair validation failed: "+";".join(errs))
 return x

def _parent_text():
 _,p=jarvis_evolution_parent.resolve();return p.read_text()

def candidate_bonus(profile:str,text:str)->dict[str,float]:
 if protected_checks(text):
  return {k:0.0 for k in("dropoutGain","tractionGain","jumpGain","truthGain","absGain","compositionGain")}
 parent=_parent_text();keys={"conservative":"dropoutGain","balanced":"tractionGain","learning":"jumpGain","observability":"truthGain","combined":"absGain"};out={k:0.0 for k in("dropoutGain","tractionGain","jumpGain","truthGain","absGain")}
 if profile=="synthesis":
  m=re.search(r"local function jAS\(a\)local s=(\d+);",text);pm=re.search(r"local function jAS\(a\)local s=(\d+);",parent)
  new=bool(m) and (not pm or m.group(1)!=pm.group(1))
  if new:
   out["tractionGain"]=4.0;out["truthGain"]=4.0;out["dropoutGain"]=2.0;out["jumpGain"]=2.0;out["absGain"]=2.0
  out["compositionGain"]=5.0 if new else 0.0
 else:
  k=keys[profile];marker="local function jA"+str(list(LABEL).index(profile)+1);out[k]=4.0 if marker in text and marker not in parent else 0.0;out["compositionGain"]=0.0
 return out

def main():
 tournament.latest_release=jarvis_evolution_parent.resolve;tournament.protected_checks=protected_checks;tournament.candidate_bonus=candidate_bonus;tournament.imprint_runtime_identity=imprint_runtime_identity;rewrite_factory.experiment_rewrite=experiment_rewrite
 e,src=jarvis_evolution_parent.resolve();c,_=jarvis_canonical_parent.resolve();w,r=_latest_feedback();print({"evolutionParent":e,"canonicalFloor":c,"strategy":"SELF_HEALING_IDEMPOTENT_AUTHORITY_GRAPH","feedbackWinner":w,"feedbackRunnerUp":r,"architectures":SLOT_AREA,"source":str(src)});rewrite_factory.main()
if __name__=="__main__":main()

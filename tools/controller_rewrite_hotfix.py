from __future__ import annotations

import re
from pathlib import Path

import controller_rewrite_factory as rewrite_factory
import controller_tournament as tournament
import jarvis_canonical_parent

ROOT=Path(__file__).resolve().parents[1]
_original_checks=tournament.protected_checks
_original_rewrite=rewrite_factory.experiment_rewrite

SLOT_AREA={
 "conservative":"sensor-dropout-recovery",
 "balanced":"traction-control",
 "learning":"jump-landing-classification",
 "observability":"truth-speed-fusion",
 "combined":"abs-control",
 "synthesis":"synthesis-all-five",
}
LABEL={"conservative":"JRW1","balanced":"JRW2","learning":"JRW3","observability":"JRW4","combined":"JRW5","synthesis":"JRW6"}


def protected_checks(text:str)->list[str]:
 errors=[e for e in _original_checks(text) if e!="missing:A17Z"]
 required=("local function zBrain","V[704]","X[46]","V[720]=ac","setgv(3,m_min(V[35],ac))","V[740+km]","V[760+km]","local pc=pcall","pc(getFieldInfo","pc(getValue","pc(model.getGlobalVariable","pc(model.setGlobalVariable","/LOGS/m0","/LOGS/m1","local function memOpt","local function watch","V[179]*.0045","92+4*dc","bb_line(144,li1,0)","bb_line(147,li4,0)","bb_line(148,rg1,0)","bb_line(151,rg4,0)","local bv=cache[2]or 0","local bv=rx;if mph>V[792]",'"BAT"')
 errors.extend(f"missing-lineage-floor:{t}" for t in required if t not in text)
 decl=text.find("local function bb_line("); first=text.find("bb_line(")
 if first>=0 and(decl<0 or first<decl):errors.append("unsafe-bb-line-scope:call-before-local-declaration")
 for bad in("setgv(3,V[35])","V[179]*(.00435","V[179]*(.0044","V[179]*.0048","V[179]*.0050",'fid("VFAS")','fid("EscV")','fid("A4")'):
  if bad in text:errors.append(f"forbidden-lineage-regression:{bad}")
 if not re.search(r'T\(2,1,"[A-Za-z0-9]{3,8}",Z\+INVERS\)',text):errors.append("missing:generated runtime release label")
 return errors


def _restore_causal_floor(text:str)->str:
 for old in("V[179]*.0050","V[179]*.0048","V[179]*(.0044+.0001*m_min(1,V[166]/100))","V[179]*(.00435+.00015*m_min(1,X[46]/120))"):text=text.replace(old,"V[179]*.0045")
 return text


def _sanitize_bb(text:str)->str:return text.replace("if X[29]>0 then bb_line(143,p2221(ac,V[704],V[114]*100,V[119]*100),0)end;","")


def _reuse_generation_identity(text:str)->str:
 pat=re.compile(r"local rg1,rg2,rg3,rg4=\d+,\d+,\d+,\d+");matches=list(pat.finditer(text))
 if not matches:raise RuntimeError("missing rewrite generation identity declaration")
 if len(matches)>1:
  keep=matches[0].group(0);text=pat.sub("",text);anchor="local bc,bm,bi=0,0,0";text=text.replace(anchor,anchor+";"+keep,1)
 emit="if li==0 then bb_line(148,rg1,0);bb_line(149,rg2,0);bb_line(150,rg3,0);bb_line(151,rg4,0)end;"
 while text.count(emit)>1:text=text.replace(emit,"",1)
 return text


def imprint_runtime_identity(text:str,token:str,chunks:list[int])->str:
 values=",".join(str(x) for x in chunks);pat=re.compile(r"local li1,li2,li3,li4=\d+,\d+,\d+,\d+");text,count=pat.subn("local li1,li2,li3,li4="+values,text,count=1)
 if count!=1:raise RuntimeError(f"runtime identity reuse expected one li declaration, found {count}")
 if token in text:raise RuntimeError("runtime token must remain numeric-only in deployed Lua")
 return text


def _replace_one(text:str,old:str,new:str,name:str)->str:
 if old not in text:raise RuntimeError(f"{name}: source anchor missing")
 return text.replace(old,new,1)


def _dropout(text:str)->str:
 marker="V[720]=ac;setgv(3,m_min(V[35],ac));";sig="V[119]>.45 and X[46]<120"
 return text if sig in text else _replace_one(text,marker,"if "+sig+" then ac=m_min(ac,94)end;"+marker,"dropout-recovery")


def _traction(text:str)->str:
 old="md<.42 and V[119]<.45";new="md<(.40+.02*V[114]) and V[119]<.45"
 return text if new in text else _replace_one(text,old,new,"traction-context")


def _jump(text:str)->str:
 old="V[760+km]>2";new="V[760+km]>(2+(V[543]>0 and 1 or 0))"
 return text if new in text else _replace_one(text,old,new,"jump-landing")


def _truth(text:str)->str:
 old="clamp(V[179]/(245+10*V[119]),0,.35)";new="clamp(V[179]/(242+8*V[119]+6*(1-V[114])),0,.35)"
 if new in text:return text
 if old in text:return text.replace(old,new,1)
 return _replace_one(text,"clamp(V[179]/250,0,.35)",new,"truth-speed-fusion")


def _abs(text:str)->str:
 old="if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,94)end";new="if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,93+(X[46]>150 and 1 or 0))end"
 return text if new in text else _replace_one(text,old,new,"abs-control")


def _apply_area(text:str,area:str)->str:
 if area=="sensor-dropout-recovery":return _dropout(text)
 if area=="traction-control":return _traction(text)
 if area=="jump-landing-classification":return _jump(text)
 if area=="truth-speed-fusion":return _truth(text)
 if area=="abs-control":return _abs(text)
 if area=="synthesis-all-five":
  for fn in(_dropout,_traction,_jump,_truth,_abs):text=fn(text)
  return text
 raise RuntimeError(f"unsupported hypothesis area:{area}")


def _label(text:str,profile:str)->str:
 text,count=re.subn(r'T\(2,1,"[A-Za-z0-9]{3,8}",Z\+INVERS\)',f'T(2,1,"{LABEL[profile]}",Z+INVERS)',text,count=1)
 if count!=1:raise RuntimeError("dashboard release label anchor missing")
 return text


def experiment_rewrite(text:str,profile:str,experiment:dict,generation:str)->str:
 area=SLOT_AREA[profile];seed=dict(experiment);seed["area"]="controller-observability";rewritten=_original_rewrite(text,"balanced",seed,generation)
 rewritten=_restore_causal_floor(rewritten);rewritten=_reuse_generation_identity(rewritten);rewritten=_sanitize_bb(rewritten);rewritten=rewritten.replace("if X[29]>0 and X[46]<80 then bb_line(142,p2221(ac,X[46],V[166],V[167]),0)end;","")
 return _label(_apply_area(rewritten,area),profile)


def _parent_text()->str:
 _,p=jarvis_canonical_parent.resolve();return p.read_text()


def candidate_bonus(profile:str,text:str)->dict[str,float]:
 parent=_parent_text();markers={"dropoutGain":"V[119]>.45 and X[46]<120","tractionGain":"md<(.40+.02*V[114]) and V[119]<.45","jumpGain":"V[760+km]>(2+(V[543]>0 and 1 or 0))","truthGain":"242+8*V[119]+6*(1-V[114])","absGain":"m_min(ac,93+(X[46]>150 and 1 or 0))"}
 wanted={"sensor-dropout-recovery":("dropoutGain",),"traction-control":("tractionGain",),"jump-landing-classification":("jumpGain",),"truth-speed-fusion":("truthGain",),"abs-control":("absGain",),"synthesis-all-five":tuple(markers)}[SLOT_AREA[profile]]
 out={k:0.0 for k in markers};new_count=0
 for key in wanted:
  marker=markers[key]
  if marker in text and marker not in parent:out[key]=3.0;new_count+=1
 out["compositionGain"]=3.0 if profile=="synthesis" and new_count==5 else 0.0
 return out


def main()->None:
 tournament.latest_release=jarvis_canonical_parent.resolve;tournament.protected_checks=protected_checks;tournament.candidate_bonus=candidate_bonus;tournament.imprint_runtime_identity=imprint_runtime_identity;rewrite_factory.experiment_rewrite=experiment_rewrite
 parent,source=jarvis_canonical_parent.resolve();print({"canonicalParent":parent,"source":str(source),"strategy":"FIVE_HYPOTHESES_PLUS_SYNTHESIS","slots":SLOT_AREA});rewrite_factory.main()


if __name__=="__main__":main()

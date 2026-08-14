from __future__ import annotations
import re
import controller_rewrite_hotfix as base

# Preserve the canonical scorer before main() temporarily installs the compact scorer.
_BASE_CANDIDATE_BONUS=base.candidate_bonus


def _jas(text:str)->str:
 m=re.search(r"local function jAS\(a\).*?(?=\nlocal function (?:bad|jA[1-6])\(|$)",text,re.S)
 return m.group(0).strip() if m else ""


def _compact_template(runner:str)->str:
 if runner=="jrw4":
  return "local function jAS(a)local b=jA6(a);local u=X[56]or 0;local o=X[61]or 0;X[63]=lerp(X[63]or o,o,o<(X[63]or o)and .24 or .065);return m_min(b,92+5*c1(X[63]*(1-u*.3)))end"
 if runner=="jrw1":
  return "local function jAS(a)local b=jA6(a);local u=X[56]or 0;X[63]=lerp(X[63]or u,u,.16);return m_min(b,96-4*X[63]+2*c1((X[55]or 0)*(1-u)))end"
 if runner=="jrw3":
  return "local function jAS(a)local b=jA6(a);local r=c1((X[58]or 0)+(X[59]or 0)*.6);X[63]=lerp(X[63]or r,r,.18);return m_min(b,96-3*X[63])end"
 if runner=="jrw5":
  return "local function jAS(a)local b=jA6(a);local r=c1((X[60]or 0)*(.7+.3*(X[56]or 0)));X[63]=lerp(X[63]or r,r,.2);return m_min(b,96-5*X[63]+c1((X[55]or 0)*(1-(X[56]or 0))))end"
 # Default / JRW2: reuse jA6 traction, uncertainty and observability states rather than recomputing them.
 return "local function jAS(a)local b=jA6(a);local e=X[57]or 0;X[63]=lerp(X[63]or e,e,.16);X[64]=lerp(X[64]or 0,m_abs(e-X[63]),.22);local v=c1(e*.52+(X[64]or 0)*1.9+(X[56]or 0)*.28);X[66]=lerp(X[66]or v,v,v>.48 and .27 or .075);return m_min(b,94.5-4.8*X[66]+2.4*c1((X[61]or 0)*(1-(X[56]or 0)*.3)))end"


def compact_synth_fn(stage_source:str)->tuple[str,str]:
 """Provide compact synthesis through the current canonical _synth_fn contract.

 The authority installer owns placement, call count and scratch validation. Compact mode only
 chooses the jAS body; it must never wrap or edit the authority gate itself.
 """
 winner,runner=base._latest_feedback()
 fn=_compact_template(runner)
 return fn,f"compact-feedback:{winner}>{runner}"


def compact_candidate_bonus(profile:str,text:str)->dict[str,float]:
 if profile!="synthesis":return _BASE_CANDIDATE_BONUS(profile,text)
 if base.protected_checks(text):
  return {k:0.0 for k in("dropoutGain","tractionGain","jumpGain","truthGain","absGain","compositionGain")}
 parent=base._parent_text();new=bool(_jas(text)) and _jas(text)!=_jas(parent)
 out={k:0.0 for k in("dropoutGain","tractionGain","jumpGain","truthGain","absGain")}
 if new:
  out["tractionGain"]=4.0;out["truthGain"]=4.0;out["dropoutGain"]=2.0;out["jumpGain"]=2.0;out["absGain"]=2.0
 out["compositionGain"]=5.0 if new else 0.0
 return out


def main()->None:
 old_synth=base._synth_fn;old_bonus=base.candidate_bonus
 base._synth_fn=compact_synth_fn;base.candidate_bonus=compact_candidate_bonus
 try:base.main()
 finally:base._synth_fn=old_synth;base.candidate_bonus=old_bonus


if __name__=="__main__":main()

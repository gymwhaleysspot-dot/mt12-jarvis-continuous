from __future__ import annotations

import json,re,subprocess,sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
STATE=ROOT/'factory/memory/prebuild-reclaim.json'
SEED=ROOT/'factory/memory/reclaimed-evolution-seed.lua'
RAW=ROOT/'factory/memory/reclaimed-evolution-seed_raw.luac'
LUAC=ROOT/'factory/memory/reclaimed-evolution-seed.luac'


def _compile(src:Path,out:Path)->None:
    raw=RAW if out==LUAC else out.with_name(out.stem+'_raw.luac')
    subprocess.run(['lua5.3','-e',f"assert(loadfile('{src}'))"],check=True)
    subprocess.run(['luac5.3','-s','-o',str(raw),str(src)],check=True)
    subprocess.run(['node',str(ROOT/'normalize_luac53_mt12.js'),str(raw),str(out)],check=True)


def _constant_fold_outcome_stage(text:str)->tuple[str,list[dict]]:
    changes=[]
    m=re.search(r'local function jAS\(a\)local s=(\d+);',text)
    if not m:return text,changes
    stage=int(m.group(1))
    for limit,base in ((4,.12),(5,.18)):
        old=f'{base:.2f}+.01*m_min(s,{limit})'.lstrip('0')
        # deployed source uses .12/.18 spelling
        old=old.replace('0.12','.12').replace('0.18','.18')
        val=base+.01*min(stage,limit)
        new=(f'{val:.2f}').rstrip('0').rstrip('.').replace('0.','.')
        count=text.count(old)
        if count:
            text=text.replace(old,new)
            changes.append({'kind':'constant-fold','expression':old,'replacement':new,'count':count,'proof':f's is immutable local constant {stage}'})
    return text,changes


def _remove_duplicate_identity_emits(text:str)->tuple[str,list[dict]]:
    changes=[]
    emit='if li==0 then bb_line(148,rg1,0);bb_line(149,rg2,0);bb_line(150,rg3,0);bb_line(151,rg4,0)end;'
    n=text.count(emit)
    if n>1:
        first=text.find(emit);pos=first+len(emit)
        while text.count(emit)>1:
            i=text.find(emit,pos)
            if i<0:break
            text=text[:i]+text[i+len(emit):]
        changes.append({'kind':'duplicate-removal','token':'rewrite identity emit','removed':n-1,'proof':'byte-identical duplicate side effect in same logger cycle'})
    return text,changes


def reclaim()->dict:
    sys.path.insert(0,str(ROOT/'tools'))
    import jarvis_evolution_parent as evo
    import controller_rewrite_hotfix as hotfix
    release,src=evo.resolve()
    before_text=src.read_text();before_size=(ROOT/json.loads((ROOT/'factory/evolution-controller.json').read_text())['deployPath']).stat().st_size
    text,changes=_constant_fold_outcome_stage(before_text)
    text,c2=_remove_duplicate_identity_emits(text);changes.extend(c2)
    SEED.parent.mkdir(parents=True,exist_ok=True);SEED.write_text(text)
    errors=hotfix.protected_checks(text)
    if errors:raise RuntimeError('reclaimed seed violated protected contract: '+repr(errors))
    _compile(SEED,LUAC)
    after_size=LUAC.stat().st_size
    if after_size>before_size:
        SEED.write_text(before_text);_compile(SEED,LUAC);after_size=LUAC.stat().st_size;changes=[]
    doc={'schema':'JARVIS-PREBUILD-RECLAIM-1','release':release,'source':str(src.relative_to(ROOT)),'seed':str(SEED.relative_to(ROOT)),'parentNormalizedBytes':before_size,'reclaimedNormalizedBytes':after_size,'bytesReclaimed':max(0,before_size-after_size),'changes':changes,'protectedContractErrors':errors,'policy':'ONLY_BEHAVIOR_EQUIVALENT_PROVABLE_RECLAMATION; NEVER_REMOVE_FEATURES'}
    STATE.write_text(json.dumps(doc,indent=2)+'\n')
    return doc


def install_seed()->dict:
    doc=reclaim()
    sys.path.insert(0,str(ROOT/'tools'))
    import jarvis_evolution_parent as evo
    release=doc['release']
    original=evo.resolve
    def resolved():return release,SEED
    evo.resolve=resolved
    return {'doc':doc,'restore':lambda:setattr(evo,'resolve',original)}


def main()->None:print(json.dumps(reclaim(),indent=2))

if __name__=='__main__':main()

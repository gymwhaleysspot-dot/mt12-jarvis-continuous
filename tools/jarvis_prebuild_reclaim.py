from __future__ import annotations

import json,re,subprocess,sys,tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
STATE=ROOT/'factory/memory/prebuild-reclaim.json'
SEED=ROOT/'factory/memory/reclaimed-evolution-seed.lua'
LUAC=ROOT/'factory/memory/reclaimed-evolution-seed.luac'


def _compile(src:Path,out:Path)->None:
    subprocess.run(['lua5.3','-e',f"assert(loadfile('{src}'))"],check=True,stdout=subprocess.DEVNULL)
    subprocess.run([str(ROOT/'toolchain/compile_mt12.sh'),str(src),str(out)],check=True,stdout=subprocess.DEVNULL)


def _hotfix():
    sys.path.insert(0,str(ROOT/'tools'))
    import controller_rewrite_hotfix as hotfix
    return hotfix


def _protected(text:str)->list[str]:
    return _hotfix().protected_checks(text)


def _profile(text:str)->str:
    hotfix=_hotfix()
    m=re.search(r'T\(2,1,"JRW([1-6])",Z\+INVERS\)',text)
    if m:return list(hotfix.LABEL)[int(m.group(1))-1]
    if 'local function jAS(a)' in text or 'local function jA6(a)' in text:return 'synthesis'
    try:
        p=json.loads((ROOT/'factory/evolution-controller.json').read_text()).get('candidate','').upper()
        if re.fullmatch(r'JRW[1-6]',p):return list(hotfix.LABEL)[int(p[-1])-1]
    except Exception:pass
    return 'balanced'


def _legacy_authority_scrub(text:str)->tuple[str,list[str]]:
    """Remove historical generated authority declarations/calls before canonical rebuild.

    Authority helpers are generator-owned and historically emitted as standalone one-line
    declarations. We remove every such legacy declaration regardless of indentation, strip
    every generated authority call, and refuse ambiguous mixed-content lines instead of
    guessing. This is the migration boundary from pre-canonical JRW parents to the current
    owned-scratch authority graph.
    """
    out=[];removed=[]
    decl=re.compile(r'^\s*local function (jA[1-6]|jAS)\(a\).*?\r?\n?$')
    any_decl=re.compile(r'local function (jA[1-6]|jAS)\(a\)')
    call=re.compile(r'ac=(jA[1-6]|jAS)\(ac\);')
    for line in text.splitlines(keepends=True):
        m=decl.match(line)
        if m:
            removed.append('definition:'+m.group(1));continue
        if any_decl.search(line):
            raise RuntimeError('unsafe mixed-line legacy authority declaration; refusing destructive repair')
        names=call.findall(line)
        if names:removed.extend('call:'+n for n in names);line=call.sub('',line)
        out.append(line)
    cleaned=''.join(out)
    leftovers=any_decl.findall(cleaned)
    stale_calls=call.findall(cleaned)
    if leftovers or stale_calls:
        raise RuntimeError(f'legacy authority scrub incomplete definitions={leftovers} calls={stale_calls}')
    return cleaned,removed


def _self_heal_parent(text:str)->tuple[str,dict|None]:
    hotfix=_hotfix();profile=_profile(text);before=hotfix.protected_checks(text)
    authority_errors=[e for e in before if e.startswith('authority-')]
    if not authority_errors:return text,None
    scrubbed,removed=_legacy_authority_scrub(text)
    healed=hotfix._install_authority(scrubbed,profile,text)
    healed=hotfix._label(healed,profile)
    after=hotfix.protected_checks(healed)
    if after:raise RuntimeError('Jarvis parent self-heal failed: '+repr(after))
    return healed,{'kind':'parent-self-heal','profile':profile,'detected':authority_errors,'legacyRemoved':removed,'verified':'LEGACY_AUTHORITY_MIGRATION+AUTHORITY_CANONICALIZE+PROTECTED_CONTRACT'}


def _norm_size(text:str)->int:
    with tempfile.TemporaryDirectory(prefix='jarvis-reclaim-') as td:
        src=Path(td)/'r.lua';out=Path(td)/'r.luac';src.write_text(text);_compile(src,out);return out.stat().st_size


def _trial(current:str,current_size:int,candidate:str,proof:dict)->tuple[str,int,dict|None]:
    if candidate==current:return current,current_size,None
    errors=_protected(candidate)
    if errors:return current,current_size,None
    try:size=_norm_size(candidate)
    except Exception:return current,current_size,None
    if size>=current_size:return current,current_size,None
    p=dict(proof);p['beforeNormalizedBytes']=current_size;p['afterNormalizedBytes']=size;p['bytesReclaimed']=current_size-size;p['verified']='LUA53_LOAD+MT12_NORMALIZE+PROTECTED_CONTRACT+STRICT_SIZE_REDUCTION'
    return candidate,size,p


def _stage_fold_proposals(text:str):
    m=re.search(r'local function jAS\(a\)local s=(\d+);',text)
    if not m:return
    stage=int(m.group(1))
    for limit,base in ((4,.12),(5,.18)):
        old=(f'{base:.2f}+.01*m_min(s,{limit})').replace('0.12','.12').replace('0.18','.18')
        val=base+.01*min(stage,limit);new=(f'{val:.2f}').rstrip('0').rstrip('.').replace('0.','.')
        if old in text:
            yield text.replace(old,new),{'kind':'constant-fold','expression':old,'replacement':new,'count':text.count(old),'proof':f'jAS local s is immutable constant {stage}'}


def _dead_stage_local_proposal(text:str):
    m=re.search(r'(local function jAS\(a\))local s=(\d+);',text)
    if not m:return None
    start=m.end();end=text.find('end\nlocal function bad',start)
    if end<0:return None
    body=text[start:end]
    if re.search(r'\bs\b',body):return None
    candidate=text[:m.start()]+m.group(1)+text[m.end():]
    return candidate,{'kind':'dead-local-removal','local':'s','proof':'immutable synthesis-stage local has zero references after constant folding'}


def _duplicate_identity_proposals(text:str):
    emit='if li==0 then bb_line(148,rg1,0);bb_line(149,rg2,0);bb_line(150,rg3,0);bb_line(151,rg4,0)end;'
    positions=[m.start() for m in re.finditer(re.escape(emit),text)]
    for pos in positions[1:]:
        yield text[:pos]+text[pos+len(emit):],{'kind':'duplicate-removal','token':'rewrite identity emit','proof':'byte-identical duplicate logger side effect; first copy retained'}


def _unused_simple_local_proposals(text:str):
    pat=re.compile(r'(?m)^local ([A-Za-z_]\w*)=([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)?|[-+]?\d+(?:\.\d+)?|"[^"\\]*"|\'[^\'\\]*\')\s*$')
    protected_names={'pc','m_abs','m_max','m_min','m_floor','m_tan','m_atan','m_pi','MA','MB','MEMPATH'}
    for m in list(pat.finditer(text)):
        name=m.group(1)
        if name in protected_names:continue
        if len(re.findall(r'\b'+re.escape(name)+r'\b',text))!=1:continue
        candidate=text[:m.start()]+text[m.end():]
        yield candidate,{'kind':'dead-local-removal','local':name,'rhs':m.group(2),'proof':'simple side-effect-free local has zero references outside its declaration'}


def _unused_local_function_proposals(text:str):
    pat=re.compile(r'(?m)^local function ([A-Za-z_]\w*)\([^\n]*?\).*?end\s*$')
    protected={'zBrain','memOpt','watch','bad','lerp','fid','val','gv','setgv','rdmem','wrmem','jA1','jA2','jA3','jA4','jA5','jA6','jAS'}
    for m in list(pat.finditer(text)):
        name=m.group(1)
        if name in protected:continue
        if len(re.findall(r'\b'+re.escape(name)+r'\b',text))!=1:continue
        candidate=text[:m.start()]+text[m.end():]
        yield candidate,{'kind':'dead-helper-removal','helper':name,'proof':'one-line local function has zero call/reference sites in deployed source'}


def reclaim()->dict:
    sys.path.insert(0,str(ROOT/'tools'))
    import jarvis_evolution_parent as evo
    release,src=evo.resolve();pointer=json.loads((ROOT/'factory/evolution-controller.json').read_text())
    before_text=src.read_text();before_size=(ROOT/pointer['deployPath']).stat().st_size
    current,healing=_self_heal_parent(before_text)
    current_size=_norm_size(current) if healing else before_size
    changes=[];rounds=0
    if healing:
        healing['beforeNormalizedBytes']=before_size;healing['afterNormalizedBytes']=current_size
        healing['bytesDelta']=current_size-before_size;changes.append(healing)

    while rounds<8:
        rounds+=1;accepted=False
        proposal_groups=[]
        proposal_groups.extend(list(_stage_fold_proposals(current) or []))
        d=_dead_stage_local_proposal(current)
        if d:proposal_groups.append(d)
        proposal_groups.extend(list(_duplicate_identity_proposals(current)))
        proposal_groups.extend(list(_unused_simple_local_proposals(current)))
        proposal_groups.extend(list(_unused_local_function_proposals(current)))
        for candidate,proof in proposal_groups:
            new_text,new_size,kept=_trial(current,current_size,candidate,proof)
            if kept:
                current,current_size=new_text,new_size;changes.append(kept);accepted=True;break
        if not accepted:break

    SEED.parent.mkdir(parents=True,exist_ok=True);SEED.write_text(current)
    errors=_protected(current)
    if errors:raise RuntimeError('reclaimed seed violated protected contract after self-heal: '+repr(errors))
    _compile(SEED,LUAC);final_size=LUAC.stat().st_size
    if final_size!=current_size:current_size=final_size
    if not healing and current_size>before_size:
        SEED.write_text(before_text);_compile(SEED,LUAC);current_size=LUAC.stat().st_size;changes=[]
    doc={'schema':'JARVIS-PREBUILD-RECLAIM-4','release':release,'source':str(src.relative_to(ROOT)),'seed':str(SEED.relative_to(ROOT)),'parentNormalizedBytes':before_size,'reclaimedNormalizedBytes':current_size,'bytesReclaimed':max(0,before_size-current_size),'selfHealed':bool(healing),'discoveryRounds':rounds,'acceptedChanges':len(changes),'changes':changes,'protectedContractErrors':errors,'policy':'LEGACY_AUTHORITY_MIGRATION+SELF_HEAL_PARENT+DISCOVER+TRIAL_COMPILE; REPAIR_STRUCTURAL_CORRUPTION_BEFORE_RECLAMATION; NEVER_REMOVE_LIVE_FEATURES','acceptanceRule':'LEGACY_MIGRATION_MUST_BE_UNAMBIGUOUS; SELF_HEAL_MUST_PASS_PROTECTED_CONTRACT; EACH_RECLAIM_CHANGE_MUST_LOAD_LUA53+PASS_PROTECTED_CONTRACT+NORMALIZE_MT12+STRICTLY_REDUCE_BYTES'}
    STATE.write_text(json.dumps(doc,indent=2)+'\n');return doc


def install_seed()->dict:
    doc=reclaim();sys.path.insert(0,str(ROOT/'tools'));import jarvis_evolution_parent as evo
    release=doc['release'];original=evo.resolve
    def resolved():return release,SEED
    evo.resolve=resolved
    return {'doc':doc,'restore':lambda:setattr(evo,'resolve',original)}


def main()->None:print(json.dumps(reclaim(),indent=2))

if __name__=='__main__':main()

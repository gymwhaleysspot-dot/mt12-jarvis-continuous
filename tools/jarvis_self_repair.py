from __future__ import annotations

import json,re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
STATE=ROOT/'factory/memory/jarvis-self-repair.json'
REPAIRABLE_PREFIXES=(
    'authority-',
    'forbidden-lineage-regression:',
    'missing:generated runtime release label',
)
PROFILE_BY_LABEL={
    '1':'conservative','2':'balanced','3':'learning',
    '4':'observability','5':'combined','6':'synthesis',
}


def _profile_from_text(text:str,fallback:str)->str:
    m=re.search(r'T\(2,1,"JRW([1-6])",Z\+INVERS\)',text)
    return PROFILE_BY_LABEL.get(m.group(1),fallback) if m else fallback


def repair_text(base,text:str,profile:str,journal:list|None=None,phase:str='candidate')->str:
    journal=journal if journal is not None else []
    detected=base.protected_checks(text)
    y=text
    for attempt in range(1,4):
        before=y
        y=base._restore(y)
        y=base._reuse(y)
        y=base._authority_finalize(y,profile)
        y=base._label(y,profile)
        y=y.replace('if X[29]>0 then bb_line(143,p2221(ac,V[704],V[114]*100,V[119]*100),0)end;','')
        y=y.replace('if X[29]>0 and X[46]<80 then bb_line(142,p2221(ac,X[46],V[166],V[167]),0)end;','')
        errors=base.protected_checks(y)
        fatal=[e for e in errors if not e.startswith(REPAIRABLE_PREFIXES)]
        if not errors:
            if detected or y!=text:
                journal.append({'phase':phase,'profile':profile,'attempt':attempt,'detected':detected,'status':'REPAIRED_AND_VERIFIED'})
            return y
        if fatal:
            journal.append({'phase':phase,'profile':profile,'attempt':attempt,'detected':errors,'status':'HARD_STOP_UNKNOWN_OR_PROTECTED_DEFECT'})
            raise RuntimeError('jarvis-self-repair-fatal:'+';'.join(fatal))
        if y==before:
            break
    errors=base.protected_checks(y)
    journal.append({'phase':phase,'profile':profile,'attempt':3,'detected':errors,'status':'REPAIR_EXHAUSTED'})
    raise RuntimeError('jarvis-self-repair-exhausted:'+';'.join(errors))


def install(base):
    """Wrap Jarvis rewrite with bounded pre-generation and post-generation self-repair.

    Generator-owned structural defects are canonicalized before the inherited
    controller is handed to the rewrite engine and again after candidate
    generation. Unknown or protected-controller defects remain fatal.
    """
    original=base.experiment_rewrite
    journal=[]

    def wrapped(text:str,profile:str,experiment:dict,generation:str)->str:
        parent=text
        if text and 'local function zBrain' in text:
            parent_profile=_profile_from_text(text,profile)
            parent_errors=base.protected_checks(text)
            if parent_errors:
                parent=repair_text(base,text,parent_profile,journal,'parent')
        candidate=original(parent,profile,experiment,generation)
        return repair_text(base,candidate,profile,journal,'candidate')

    base.experiment_rewrite=wrapped

    def restore():
        base.experiment_rewrite=original

    def write_state():
        STATE.parent.mkdir(parents=True,exist_ok=True)
        STATE.write_text(json.dumps({
            'schema':'JARVIS-SELF-REPAIR-2',
            'policy':'PRE_AND_POST_GENERATION_BOUNDED_KNOWN_REPAIR_ONLY; UNKNOWN_OR_PROTECTED_DEFECTS_HARD_STOP',
            'maxAttemptsPerPhase':3,
            'repairs':journal,
        },indent=2)+'\n')

    return {'restore':restore,'write_state':write_state,'journal':journal}

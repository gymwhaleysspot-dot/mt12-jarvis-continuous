from __future__ import annotations

import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
STATE=ROOT/'factory/memory/jarvis-self-repair.json'
REPAIRABLE_PREFIXES=(
    'authority-',
    'forbidden-lineage-regression:',
    'missing:generated runtime release label',
)


def install(base):
    """Wrap Jarvis's rewrite function with bounded, auditable self-repair.

    The repairer only canonicalizes known generator-owned structural surfaces. It
    never deletes protected controller features to force a pass. Unknown defects
    remain fatal so Jarvis cannot hide a regression from its own verifier.
    """
    original=base.experiment_rewrite
    journal=[]

    def heal(text:str,profile:str)->str:
        detected=base.protected_checks(text)
        y=text
        for attempt in range(1,4):
            before=y
            # Known safe/idempotent generator repairs.
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
                    journal.append({
                        'profile':profile,
                        'attempt':attempt,
                        'detected':detected,
                        'status':'REPAIRED_AND_VERIFIED',
                    })
                return y
            if fatal:
                journal.append({'profile':profile,'attempt':attempt,'detected':errors,'status':'HARD_STOP_UNKNOWN_OR_PROTECTED_DEFECT'})
                raise RuntimeError('jarvis-self-repair-fatal:'+';'.join(fatal))
            if y==before:
                break
        errors=base.protected_checks(y)
        journal.append({'profile':profile,'attempt':3,'detected':errors,'status':'REPAIR_EXHAUSTED'})
        raise RuntimeError('jarvis-self-repair-exhausted:'+';'.join(errors))

    def wrapped(text:str,profile:str,experiment:dict,generation:str)->str:
        # Let the normal generator create the candidate, then independently audit
        # and canonicalize it before compilation/scoring/promotion eligibility.
        candidate=original(text,profile,experiment,generation)
        return heal(candidate,profile)

    base.experiment_rewrite=wrapped

    def restore():
        base.experiment_rewrite=original

    def write_state():
        STATE.parent.mkdir(parents=True,exist_ok=True)
        STATE.write_text(json.dumps({
            'schema':'JARVIS-SELF-REPAIR-1',
            'policy':'BOUNDED_KNOWN_REPAIR_ONLY; UNKNOWN_OR_PROTECTED_DEFECTS_HARD_STOP',
            'maxAttemptsPerCandidate':3,
            'repairs':journal,
        },indent=2)+'\n')

    return {'restore':restore,'write_state':write_state,'journal':journal}

from __future__ import annotations

import json
from pathlib import Path
import controller_rewrite_hotfix as hotfix

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist-controller-tournament'
POINTER=ROOT/'factory/evolution-controller.json'
MAX_BYTES=87000
MIN_INTEL_PER_100_GROWTH_BYTES=0.50


def _postprocess()->None:
    result=json.loads((OUT/'TOURNAMENT.json').read_text())
    parent_doc=json.loads(POINTER.read_text())
    parent_bytes=int(parent_doc.get('normalizedBytes') or 0)
    eligible=[]
    for c in result.get('candidates',[]):
        if c.get('status')!='COMPILED' or not c.get('normalizedBytes'):
            continue
        size=int(c['normalizedBytes'])
        intel=float(c.get('intelligenceDelta') or 0.0)
        reclaimed=parent_bytes-size
        growth=max(0,size-parent_bytes)
        saved=max(0,reclaimed)
        density=(intel*100.0/growth) if growth else (intel+saved/500.0)
        reclaim_bonus=min(5.0,saved/200.0)
        growth_penalty=min(8.0,growth/300.0)
        justified=(growth==0 or density>=MIN_INTEL_PER_100_GROWTH_BYTES)
        budget_headroom=MAX_BYTES-size
        budget_bonus=max(-6.0,min(3.0,budget_headroom/500.0))
        efficiency_adjustment=reclaim_bonus-growth_penalty+budget_bonus
        base_score=float(c.get('score') or 0.0)
        efficiency_score=base_score+efficiency_adjustment
        c['resourceEfficiency']={
            'policy':'RECLAIM_RETHINK_BUILD_COMPETE_SYNTHESIZE_COMPRESS_VERIFY_INHERIT',
            'parentNormalizedBytes':parent_bytes,
            'candidateNormalizedBytes':size,
            'bytesReclaimed':saved,
            'bytesSpent':growth,
            'headroomBytes':budget_headroom,
            'intelligenceDelta':round(intel,3),
            'intelligencePer100GrowthBytes':round(density,3),
            'growthJustified':justified,
            'reclaimBonus':round(reclaim_bonus,3),
            'growthPenalty':round(growth_penalty,3),
            'budgetBonus':round(budget_bonus,3),
            'efficiencyAdjustment':round(efficiency_adjustment,3),
        }
        c['preEfficiencyScore']=round(base_score,3)
        c['score']=round(efficiency_score,3)
        c['promotionEfficiencyEligible']=bool(justified and intel>0 and size<=MAX_BYTES)
        cid=c['candidate']; manifest_path=OUT/cid/'MANIFEST.json'
        if manifest_path.is_file():
            m=json.loads(manifest_path.read_text())
            m['resourceEfficiency']=c['resourceEfficiency']
            m['preEfficiencyScore']=c['preEfficiencyScore']
            m['score']=c['score']
            m['promotionEfficiencyEligible']=c['promotionEfficiencyEligible']
            manifest_path.write_text(json.dumps(m,indent=2)+'\n')
        if c['promotionEfficiencyEligible']:
            eligible.append(c)
    result['candidates'].sort(key=lambda x:x.get('score',-1e9),reverse=True)
    eligible.sort(key=lambda x:x.get('score',-1e9),reverse=True)
    result['winner']=eligible[0]['candidate'] if eligible else None
    result['runnerUp']=eligible[1]['candidate'] if len(eligible)>1 else None
    result['resourcePolicy']={
        'schema':'JARVIS-RESOURCE-EVOLUTION-1',
        'cycle':['reclaim','rethink','build','compete','synthesize','compress','verify','inherit'],
        'parentNormalizedBytes':parent_bytes,
        'hardCeilingBytes':MAX_BYTES,
        'minimumIntelligencePer100GrowthBytes':MIN_INTEL_PER_100_GROWTH_BYTES,
        'rule':'SIZE_EFFICIENCY_ALWAYS_SCORED_NOT_ONLY_NEAR_LIMIT',
        'growthWithoutEnoughIntelligence':'NOT_PROMOTION_ELIGIBLE',
    }
    result['verdict']='IMPROVEMENT_FOUND' if eligible else 'NO_RESOURCE_JUSTIFIED_IMPROVEMENT'
    (OUT/'TOURNAMENT.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({
        'resourcePolicy':result['resourcePolicy'],
        'winner':result['winner'],
        'runnerUp':result['runnerUp'],
        'ranking':[
            {
                'candidate':c.get('candidate'),
                'score':c.get('score'),
                'normalizedBytes':c.get('normalizedBytes'),
                'intelligenceDelta':c.get('intelligenceDelta'),
                'efficiency':c.get('resourceEfficiency'),
                'eligible':c.get('promotionEfficiencyEligible'),
            } for c in result.get('candidates',[])
        ],
    },indent=2))


def main()->None:
    print({'jarvisResourceCycle':'RECLAIM_RETHINK_BUILD_COMPETE_SYNTHESIZE_COMPRESS_VERIFY_INHERIT','alwaysOn':True,'hardCeilingBytes':MAX_BYTES})
    hotfix.main()
    _postprocess()


if __name__=='__main__':
    main()

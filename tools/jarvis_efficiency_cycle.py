from __future__ import annotations

import json
from pathlib import Path
import controller_rewrite_compact as hotfix
import jarvis_prebuild_reclaim as prebuild

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist-controller-tournament'
POINTER=ROOT/'factory/evolution-controller.json'
RECLAIM_STATE=ROOT/'factory/memory/prebuild-reclaim.json'
MAX_BYTES=87000
MIN_INTEL_PER_100_GROWTH_BYTES=0.50
SYNTH_RECLAIM_SPEND_FRACTION=0.45
SYNTH_MIN_BUDGET=160
SYNTH_MAX_BUDGET=420


def _postprocess()->None:
    result=json.loads((OUT/'TOURNAMENT.json').read_text())
    parent_doc=json.loads(POINTER.read_text())
    parent_bytes=int(parent_doc.get('normalizedBytes') or 0)
    reclaim=json.loads(RECLAIM_STATE.read_text()) if RECLAIM_STATE.is_file() else {}
    seed_bytes=int(reclaim.get('reclaimedNormalizedBytes') or parent_bytes)
    pre_reclaimed=int(reclaim.get('bytesReclaimed') or 0)
    synth_budget=max(SYNTH_MIN_BUDGET,min(SYNTH_MAX_BUDGET,int(pre_reclaimed*SYNTH_RECLAIM_SPEND_FRACTION))) if pre_reclaimed else SYNTH_MIN_BUDGET
    eligible=[]
    for c in result.get('candidates',[]):
        if c.get('status')!='COMPILED' or not c.get('normalizedBytes'):
            continue
        size=int(c['normalizedBytes']);intel=float(c.get('intelligenceDelta') or 0.0)
        reclaimed=parent_bytes-size;growth=max(0,size-parent_bytes);saved=max(0,reclaimed);seed_growth=max(0,size-seed_bytes)
        density=(intel*100.0/growth) if growth else (intel+saved/500.0)
        reclaim_bonus=min(5.0,saved/200.0);growth_penalty=min(8.0,growth/300.0);justified=(growth==0 or density>=MIN_INTEL_PER_100_GROWTH_BYTES)
        budget_headroom=MAX_BYTES-size;budget_bonus=max(-6.0,min(3.0,budget_headroom/500.0))
        is_synth=c.get('profile')=='synthesis';synth_within=(not is_synth) or seed_growth<=synth_budget
        retained=max(0,pre_reclaimed-seed_growth) if is_synth else 0;retained_bonus=min(2.0,retained/250.0) if is_synth else 0.0
        synth_penalty=0.0 if synth_within else min(10.0,(seed_growth-synth_budget)/100.0)
        efficiency_adjustment=reclaim_bonus-growth_penalty+budget_bonus+retained_bonus-synth_penalty
        base_score=float(c.get('score') or 0.0);efficiency_score=base_score+efficiency_adjustment
        c['resourceEfficiency']={
            'policy':'RECLAIM_RETHINK_BUILD_COMPETE_SYNTHESIZE_COMPRESS_VERIFY_INHERIT','parentNormalizedBytes':parent_bytes,
            'prebuildSeedNormalizedBytes':seed_bytes,'prebuildBytesReclaimed':pre_reclaimed,'candidateNormalizedBytes':size,
            'bytesReclaimedVsParent':saved,'bytesSpentVsParent':growth,'bytesSpentAfterReclaim':seed_growth,'headroomBytes':budget_headroom,
            'intelligenceDelta':round(intel,3),'intelligencePer100GrowthBytes':round(density,3),'growthJustified':justified,
            'synthesisByteBudget':synth_budget if is_synth else None,'synthesisWithinBudget':synth_within if is_synth else None,
            'reclaimedCapacityRetained':retained if is_synth else None,'retainedCapacityBonus':round(retained_bonus,3),'synthesisBudgetPenalty':round(synth_penalty,3),
            'reclaimBonus':round(reclaim_bonus,3),'growthPenalty':round(growth_penalty,3),'budgetBonus':round(budget_bonus,3),'efficiencyAdjustment':round(efficiency_adjustment,3)}
        c['preEfficiencyScore']=round(base_score,3);c['score']=round(efficiency_score,3)
        behavior_novel=bool((c.get('rewriteContract') or {}).get('behaviorNovel'))
        c['promotionEfficiencyEligible']=bool(behavior_novel and justified and synth_within and intel>0 and size<=MAX_BYTES)
        cid=c['candidate'];manifest_path=OUT/cid/'MANIFEST.json'
        if manifest_path.is_file():
            m=json.loads(manifest_path.read_text());m['resourceEfficiency']=c['resourceEfficiency'];m['preEfficiencyScore']=c['preEfficiencyScore'];m['score']=c['score'];m['promotionEfficiencyEligible']=c['promotionEfficiencyEligible'];m['behaviorNovel']=behavior_novel;manifest_path.write_text(json.dumps(m,indent=2)+'\n')
        if c['promotionEfficiencyEligible']:eligible.append(c)
    result['candidates'].sort(key=lambda x:x.get('score',-1e9),reverse=True);eligible.sort(key=lambda x:x.get('score',-1e9),reverse=True)
    result['winner']=eligible[0]['candidate'] if eligible else None;result['runnerUp']=eligible[1]['candidate'] if len(eligible)>1 else None
    result['resourcePolicy']={'schema':'JARVIS-RESOURCE-EVOLUTION-3','cycle':['reclaim','rethink','build','compete','synthesize','compress','verify','inherit'],
        'parentNormalizedBytes':parent_bytes,'prebuildSeedNormalizedBytes':seed_bytes,'prebuildBytesReclaimed':pre_reclaimed,'prebuildChanges':reclaim.get('changes',[]),
        'hardCeilingBytes':MAX_BYTES,'minimumIntelligencePer100GrowthBytes':MIN_INTEL_PER_100_GROWTH_BYTES,'synthesisSpendFractionOfReclaim':SYNTH_RECLAIM_SPEND_FRACTION,
        'synthesisByteBudget':synth_budget,'synthesisBudgetBounds':[SYNTH_MIN_BUDGET,SYNTH_MAX_BUDGET],
        'rule':'PREBUILD_RECLAMATION+COMPACT_SYNTHESIS+RETAINED_CAPACITY_ALWAYS_ON','growthWithoutEnoughIntelligence':'NOT_PROMOTION_ELIGIBLE','synthesisOverByteBudget':'NOT_PROMOTION_ELIGIBLE','identityOnlyRewrite':'REJECTED_NOT_PROMOTION_ELIGIBLE'}
    result['verdict']='IMPROVEMENT_FOUND' if eligible else 'NO_RESOURCE_JUSTIFIED_IMPROVEMENT';(OUT/'TOURNAMENT.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'resourcePolicy':result['resourcePolicy'],'winner':result['winner'],'runnerUp':result['runnerUp'],'ranking':[{'candidate':c.get('candidate'),'score':c.get('score'),'normalizedBytes':c.get('normalizedBytes'),'intelligenceDelta':c.get('intelligenceDelta'),'efficiency':c.get('resourceEfficiency'),'eligible':c.get('promotionEfficiencyEligible')} for c in result.get('candidates',[])]},indent=2))


def main()->None:
    print({'jarvisResourceCycle':'RECLAIM_RETHINK_BUILD_COMPETE_SYNTHESIZE_COMPRESS_VERIFY_INHERIT','alwaysOn':True,'hardCeilingBytes':MAX_BYTES,'compactSynthesis':True})
    seed=prebuild.install_seed();print(json.dumps({'prebuildReclamation':seed['doc']},indent=2))
    try:hotfix.main()
    finally:seed['restore']()
    _postprocess()


if __name__=='__main__':main()

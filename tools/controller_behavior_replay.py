from __future__ import annotations

"""Deterministic behavioral replay for JRW authority architectures.

This is deliberately independent of source-presence bonuses. It drives each authority
profile through the same synthetic sensor/event timeline and measures the resulting
cap behavior. Road logs remain the authority for promotion; this replay only replaces
"function exists == intelligence" as the tournament's pre-road behavioral evidence.
"""

from math import fabs

PROFILES=("conservative","balanced","learning","observability","combined","synthesis")

def c1(x): return max(0.0,min(1.0,float(x)))
def lerp(a,b,t): return a+(b-a)*c1(t)

def _step(profile,s,x):
    a=100.0;q=c1(s["q"]);u=c1(s["u"]);e=c1(s["tc"]);air=1.0 if s["air"] else 0.0;brake=1.0 if s["brake"] else 0.0;ca=c1(s["ca"])
    # jA2 is the common authority floor for every current JRW architecture.
    x[70]=lerp(x.get(70,e),e,.14);d=e-x[70];x[71]=lerp(x.get(71,0.0),fabs(d),.2);sev=c1(e*.55+x[71]*1.8+u*.3);rel=c1(q*(1-u));x[72]=lerp(x.get(72,sev),sev,.25 if sev>.5 else .08);a=min(a,96-5*x[72]+2*rel)
    if profile=="balanced": return a
    if profile=="conservative":
        x[67]=lerp(x.get(67,q),q,.08);x[68]=min(60,x.get(68,0)+1) if u>.45 else max(0,x.get(68,0)-2);r=c1(x[67]*(1-u));cap=91+5*r-(2 if x[68]>8 else 0);x[69]=lerp(x.get(69,cap),cap,.18);return min(a,x[69])
    if profile=="learning":
        x[73]=max(0,min(1,x.get(73,0)+( (1-u)*.18 if air else -.12)));land=1.0 if (not air and x[73]>.35) else 0.0;x[74]=max(0,min(1,x.get(74,0)+land*.22-.08));x[75]=x.get(75,0)+1 if land else max(0,x.get(75,0)-1);conf=c1(x[73]*(1-u));return min(a,96-3*conf-(2 if x[75]>3 else 0))
    if profile=="observability":
        obs=c1(q*.45+(1-u)*.35+ca*.2);old=x.get(76,obs);x[76]=lerp(old,obs,.22 if obs<old else .07);x[77]=lerp(x.get(77,u),u,.12);trust=c1(x[76]*(1-x[77]*.35));return min(a,92+5*trust)
    if profile=="combined":
        b=1.0 if (e>0 or air or brake) else 0.0;x[78]=max(0,min(1,x.get(78,0)+(.16 if b else -.09)));lock=c1(x[78]*(.7+.3*u));x[79]=lerp(x.get(79,lock),lock,.28 if lock>.45 else .1);rec=c1(q*(1-u));return min(a,96-5*x[79]+rec)
    # synthesis: jAS calls jA6, then applies its learned synthesis cap.
    x[55]=lerp(x.get(55,q),q,.08);x[56]=lerp(x.get(56,u),u,.12);x[57]=lerp(x.get(57,e),e,.14);x[58]=max(0,min(1,x.get(58,0)+((1-u)*.18 if air else -.12)));land=1.0 if (not air and x[58]>.35) else 0.0;x[59]=max(0,min(1,x.get(59,0)+land*.22-.08));x[60]=max(0,min(1,x.get(60,0)+(.15 if brake else -.09)));obs=c1(x[55]*.35+(1-x[56])*.3+ca*.2+(1-x[57])*.15);old=x.get(61,obs);x[61]=lerp(old,obs,.2 if obs<old else .06);risk=c1(x[56]*.22+x[57]*.25+x[58]*.18+x[60]*.25+(1-x[61])*.1);cap=97-7*risk-(1 if land else 0);x[62]=lerp(x.get(62,cap),cap,.24 if risk>.5 else .09);bcap=min(a,x[62]);x[63]=lerp(x.get(63,e),e,.12);dd=fabs(e-x[63]);x[64]=lerp(x.get(64,dd),dd,.18);sev2=c1(e*.52+x[64]*1.9+u*.28);obs2=c1(q*.43+(1-u)*.34+ca*.23);old=x.get(65,obs2);x[65]=lerp(old,obs2,.24 if obs2<old else .065);trust=c1(x[65]*(1-u*.3));x[66]=lerp(x.get(66,sev2),sev2,.27 if sev2>.48 else .075);return min(bcap,94.5-4.8*x[66]+2.4*trust)

def _timeline():
    t=[]
    def add(n,**kw):
        base={"q":.95,"u":.03,"tc":.03,"air":False,"brake":False,"ca":.9,"tag":"calm"};base.update(kw);t.extend([dict(base) for _ in range(n)])
    add(18);add(12,u=.82,q=.45,ca=.35,tag="dropout");add(18,tag="dropout_recovery");add(16,tc=.82,u=.18,q=.82,tag="traction");add(12,tag="traction_recovery");add(10,air=True,u=.12,q=.9,tag="airborne");add(12,air=False,u=.08,q=.92,tag="landing");add(14,brake=True,tc=.68,u=.16,q=.88,tag="abs");add(16,tag="recovery");add(10,u=.55,q=.25,ca=.2,tag="channel_drop");add(18,tag="final_recovery")
    return t

def score(profile):
    if profile not in PROFILES: raise ValueError(profile)
    x={};caps=[];rows=[]
    for s in _timeline():
        cap=_step(profile,s,x);caps.append(cap);rows.append((s["tag"],cap))
    by={}
    for tag,cap in rows: by.setdefault(tag,[]).append(cap)
    avg=lambda tag:sum(by[tag])/len(by[tag])
    smooth=sum(abs(caps[i]-caps[i-1]) for i in range(1,len(caps)))/(len(caps)-1)
    # Higher is better. Targets encode desired authority response, not a preferred architecture.
    target={"dropout":91.5,"traction":92.5,"airborne":94.0,"landing":93.5,"abs":92.5,"channel_drop":91.0}
    err=sum(abs(avg(k)-v) for k,v in target.items())/len(target)
    recovery=(abs(avg("dropout_recovery")-96)+abs(avg("traction_recovery")-96)+abs(avg("final_recovery")-96))/3
    calm_pen=abs(avg("calm")-96)
    score=max(0,100-err*5-recovery*3-calm_pen*2-smooth*4)
    descriptor=[round(err/10,4),round(recovery/10,4),round(smooth,4),round(avg("dropout")/100,4),round(avg("traction")/100,4),round(avg("abs")/100,4)]
    return {"schema":"JRW-BEHAVIOR-REPLAY-2","profile":profile,"score":round(score,3),"meanTargetError":round(err,3),"recoveryError":round(recovery,3),"calmAuthorityError":round(calm_pen,3),"authoritySmoothness":round(smooth,4),"eventCaps":{k:round(avg(k),3) for k in target},"behaviorDescriptor":descriptor,"descriptorAxes":["target-error","recovery-error","smoothness","dropout-cap","traction-cap","abs-cap"],"samples":len(caps),"authority":"SYNTHETIC_REPLAY_ONLY_ROAD_LOGS_REQUIRED"}

def tournament_scores():
    rows={p:score(p) for p in PROFILES};baseline=rows["balanced"]["score"]
    for r in rows.values():r["deltaVsBalanced"]=round((r["score"]-baseline)/5,3)
    return rows

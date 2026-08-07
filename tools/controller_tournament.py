from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist-controller-tournament"
POLICY = json.loads((ROOT / "controller-release-policy.json").read_text())


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def latest_release() -> tuple[str, Path]:
    latest = json.loads((ROOT / "public/builds/latest.json").read_text())
    name = latest["release"]
    src = ROOT / "public/builds/releases" / name / latest["source"]
    if not src.is_file(): raise FileNotFoundError(src)
    return name, src


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if text.count(old) != 1: raise RuntimeError(f"{label}: expected one match, found {text.count(old)}")
    return text.replace(old, new, 1)


def runtime_identity(parent_source_sha: str, candidate: str, profile: str) -> tuple[str, list[int]]:
    token = hashlib.sha256(f"MT12-LUAC-ID|{parent_source_sha}|{candidate}|{profile}".encode()).hexdigest()[:16]
    return token, [int(token[i:i + 4], 16) for i in range(0, 16, 4)]


def imprint_runtime_identity(text: str, token: str, chunks: list[int]) -> str:
    decl = "local bc,bm,bi=0,0,0"; values = ",".join(str(x) for x in chunks)
    text = replace_once(text, decl, decl + f";local li=599;local li1,li2,li3,li4={values}", "runtime identity declaration")
    marker = "if unsafePending>0 then bb_line(108,p2221(V[588],V[589],V[590],V[593]),0);bb_line(109,p2221(V[591],V[592],V[168],V[169]),0);unsafePending=0 end"
    emit = "li=li+1;if li>=600 then bb_line(144,li1,0);bb_line(145,li2,0);bb_line(146,li3,0);bb_line(147,li4,0);li=0 end;"
    text = replace_once(text, marker, emit + marker, "runtime identity logger")
    if token in text: raise RuntimeError("runtime token must remain numeric-only in deployed Lua")
    return text


def make_candidate(base: str, profile: str) -> str:
    s = base
    if profile == "conservative":
        s = replace_once(s, ",82,100);if X[46]<120 then ac=m_min(ac,96)end;if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,94)end", ",80,98);if X[46]<140 then ac=m_min(ac,94)end;if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,92)end", profile)
    elif profile == "balanced": pass
    elif profile == "learning":
        s = replace_once(s, "V[179]*.0045", "V[179]*.0050", profile); s = replace_once(s, "V[760+km]>2", "V[760+km]>3", profile)
    elif profile == "observability":
        marker = "V[720]=ac;setgv(3,m_min(V[35],ac));"; s = replace_once(s, marker, marker + "if X[29]>0 then bb_line(143,p2221(ac,V[704],V[114]*100,V[119]*100),0)end;", profile)
    elif profile == "combined":
        s = replace_once(s, "V[179]*.0045", "V[179]*.0048", profile); s = replace_once(s, ",82,100);if X[46]<120 then ac=m_min(ac,96)end;if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,94)end", ",81,99);if X[46]<130 then ac=m_min(ac,95)end;if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,93)end", profile)
    elif profile == "synthesis": pass
    else: raise ValueError(profile)
    return s


def protected_checks(text: str) -> list[str]:
    required = ["local function zBrain","X[41]","X[42]","X[43]","X[46]","V[179]*","V[740+km]","local bk=750+km","V[760+km]","V[720]=ac","setgv(3,m_min(V[35],ac))","io.read(","A17Z","bb_line(144,li1,0)","bb_line(145,li2,0)","bb_line(146,li3,0)","bb_line(147,li4,0)"]
    missing=[x for x in required if x not in text]; forbidden=[x for x in ["setgv(3,V[35])","local function neural","local function evo","local function superBrain","local function aiGate","local function condBrain"] if x in text]
    return [f"missing:{x}" for x in missing]+[f"forbidden:{x}" for x in forbidden]


def feature_score(text: str) -> dict[str, float]:
    groups={"adaptiveLearning":["V[740+km]","V[760+km]","V[179]*","V[720]=ac","zBrain"],"sensorTruth":["GPS_OK","GPS_COAST","GPS_LOST","V[166]","V[167]","V[179]"],"faultTolerance":["io.read(","car","drop","mismatch","unsafePending"],"causalReasoning":["reason","cause","X[29]","X[30]","bb_line(135","bb_line(136"],"observability":["bb_line(","X[24]","X[25]","X[29]","X[30]"],"controlCoordination":["setgv(3,m_min(V[35],ac))","TC","ABS","gyro","throttle"]}
    weights={"adaptiveLearning":24.0,"sensorTruth":20.0,"faultTolerance":18.0,"causalReasoning":14.0,"observability":12.0,"controlCoordination":12.0}; scores={}
    for name,tokens in groups.items(): scores[name]=round(weights[name]*sum(1 for token in tokens if token in text)/len(tokens),3)
    scores["total"]=round(sum(scores.values()),3); return scores


def candidate_bonus(profile: str, text: str) -> dict[str, float]:
    bonus={"learningGain":0.0,"safetyGain":0.0,"observabilityGain":0.0}
    if profile=="learning": bonus["learningGain"]=3.0 if ".0050" in text and "V[760+km]>3" in text else 0.0
    elif profile=="conservative": bonus["safetyGain"]=2.5 if "X[46]<140" in text and "m_min(ac,92)" in text else 0.0
    elif profile=="observability": bonus["observabilityGain"]=3.0 if "bb_line(143" in text else 0.0
    elif profile=="combined":
        bonus["learningGain"]=1.5 if ".0048" in text else 0.0; bonus["safetyGain"]=1.5 if "X[46]<130" in text and "m_min(ac,93)" in text else 0.0
    return bonus


def run() -> None:
    parent_name,src_path=latest_release(); base=src_path.read_text(); parent_source_sha=sha256(src_path); parent_intelligence=feature_score(base)
    release_type=os.environ.get("RELEASE_TYPE","X").upper(); series=re.sub(r"[^a-z0-9]","",os.environ.get("SERIES",parent_name+"x"))[:8]; profiles=POLICY["candidateProfiles"]
    shutil.rmtree(OUT,ignore_errors=True); OUT.mkdir(parents=True); rows=[]
    risk_map={"conservative":2.0,"balanced":0.5,"learning":3.0,"observability":1.0,"combined":2.5,"synthesis":3.5}
    for index,profile in enumerate(profiles,1):
        cid=f"{series}{index}"; d=OUT/cid; d.mkdir(); lua=d/f"{cid}.lua"; luac=d/f"{cid}.luac"; status="REJECTED"; errors=[]; text=""; token,chunks=runtime_identity(parent_source_sha,cid,profile)
        try:
            text=make_candidate(base,profile); text=text.replace('T(2,1,"A17Z",Z+INVERS)',f'T(2,1,"{cid.upper()}",Z+INVERS)',1); text=imprint_runtime_identity(text,token,chunks); lua.write_text(text); errors.extend(protected_checks(text))
            if errors: raise RuntimeError("; ".join(errors))
            subprocess.run(["lua5.3","-e",f"assert(loadfile('{lua}'))"],check=True); subprocess.run([str(ROOT/"toolchain/compile_mt12.sh"),str(lua),str(luac)],check=True); status="COMPILED"
        except Exception as exc: errors.append(str(exc))
        intelligence=feature_score(text) if text else {"total":0.0}; bonus=candidate_bonus(profile,text); risk=risk_map.get(profile,3.0); raw_delta=intelligence.get("total",0.0)-parent_intelligence["total"]+sum(bonus.values()); score=(100.0 if status=="COMPILED" else 0.0)+raw_delta-risk
        manifest={"candidate":cid,"parent":parent_name,"releaseType":release_type,"profile":profile,"status":status,"authority":"EXPERIMENTAL_ROAD_REQUIRED","sourceBytes":lua.stat().st_size if lua.exists() else None,"normalizedBytes":luac.stat().st_size if luac.exists() else None,"sourceSha256":sha256(lua) if lua.exists() else None,"luacSha256":sha256(luac) if luac.exists() else None,"runtimeIdentity":{"schema":"MT12BBID1","token":token,"groups":[144,145,146,147],"chunks":chunks,"emitPolicy":"first logger cycle and every 600 logger cycles","floatExact":True,"mapsToFinalHashesInManifest":True},"parentIntelligence":parent_intelligence,"candidateIntelligence":intelligence,"intelligenceBonus":bonus,"intelligenceDelta":round(raw_delta,3),"riskPenalty":risk,"score":round(score,3),"errors":errors,"replayAuthority":"STATIC_SELF_EVALUATION_ONLY; ROAD_LOGS_STILL_REQUIRED"}
        (d/"MANIFEST.json").write_text(json.dumps(manifest,indent=2)+"\n"); (d/"IDENTITY.json").write_text(json.dumps({"schema":"MT12BBID1","controller":cid,"parent":parent_name,"runtimeToken":token,"blackboxGroups":[144,145,146,147],"numericChunks":chunks,"sourceSha256":manifest["sourceSha256"],"luacSha256":manifest["luacSha256"]},indent=2)+"\n")
        if status=="COMPILED": subprocess.run(["zip","-9",f"{cid}.zip",lua.name,luac.name,"MANIFEST.json","IDENTITY.json"],cwd=d,check=True)
        rows.append(manifest)
    rows.sort(key=lambda x:x["score"],reverse=True); improved=[r for r in rows if r["status"]=="COMPILED" and r["intelligenceDelta"]>0]
    result={"parent":parent_name,"releaseType":release_type,"parentIntelligence":parent_intelligence,"winner":improved[0]["candidate"] if improved else None,"runnerUp":improved[1]["candidate"] if len(improved)>1 else None,"candidates":rows,"runtimeIdentitySchema":"MT12BBID1","verdict":"IMPROVEMENT_FOUND" if improved else "NO_PROVEN_IMPROVEMENT","promotion":"NEVER_AUTOMATIC; self-evaluation plus bench and returned road logs required"}
    (OUT/"TOURNAMENT.json").write_text(json.dumps(result,indent=2)+"\n"); print(json.dumps(result,indent=2))
    if not any(r["status"]=="COMPILED" for r in rows): raise SystemExit("no candidate compiled")


if __name__=="__main__": run()

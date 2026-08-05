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
    if not src.is_file():
        raise FileNotFoundError(src)
    return name, src


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if text.count(old) != 1:
        raise RuntimeError(f"{label}: expected one match, found {text.count(old)}")
    return text.replace(old, new, 1)


def make_candidate(base: str, profile: str) -> str:
    s = base
    if profile == "conservative":
        s = replace_once(s, ",82,100);if X[46]<120 then ac=m_min(ac,96)end;if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,94)end", ",80,98);if X[46]<140 then ac=m_min(ac,94)end;if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,92)end", profile)
    elif profile == "balanced":
        pass
    elif profile == "learning":
        s = replace_once(s, "V[179]*.0045", "V[179]*.0050", profile)
        s = replace_once(s, "V[760+km]>2", "V[760+km]>3", profile)
    elif profile == "observability":
        marker = "V[720]=ac;setgv(3,m_min(V[35],ac));"
        s = replace_once(s, marker, marker + "if X[29]>0 then bb_line(143,p2221(ac,V[704],V[114]*100,V[119]*100),0)end;", profile)
    elif profile == "combined":
        s = replace_once(s, "V[179]*.0045", "V[179]*.0048", profile)
        s = replace_once(s, ",82,100);if X[46]<120 then ac=m_min(ac,96)end;if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,94)end", ",81,99);if X[46]<130 then ac=m_min(ac,95)end;if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,93)end", profile)
    else:
        raise ValueError(profile)
    return s


def protected_checks(text: str) -> list[str]:
    required = [
        "local function zBrain",
        "X[41]", "X[42]", "X[43]", "X[46]", ".0045" if "*.0045" in text else "V[179]*",
        "V[740+km]", "local bk=750+km", "V[760+km]", "V[720]=ac",
        "setgv(3,m_min(V[35],ac))", "io.read(", "A17Z"
    ]
    missing = [x for x in required if x not in text]
    forbidden = [x for x in ["setgv(3,V[35])", "local function neural", "local function evo", "local function superBrain", "local function aiGate", "local function condBrain"] if x in text]
    return [f"missing:{x}" for x in missing] + [f"forbidden:{x}" for x in forbidden]


def run() -> None:
    parent_name, src_path = latest_release()
    base = src_path.read_text()
    release_type = os.environ.get("RELEASE_TYPE", "X").upper()
    series = re.sub(r"[^a-z0-9]", "", os.environ.get("SERIES", parent_name + "x"))[:8]
    profiles = POLICY["candidateProfiles"]
    shutil.rmtree(OUT, ignore_errors=True)
    OUT.mkdir(parents=True)
    rows = []
    for index, profile in enumerate(profiles, 1):
        cid = f"{series}{index}"
        d = OUT / cid
        d.mkdir()
        lua = d / f"{cid}.lua"
        luac = d / f"{cid}.luac"
        status = "REJECTED"
        errors: list[str] = []
        try:
            text = make_candidate(base, profile)
            text = text.replace('T(2,1,"A17Z",Z+INVERS)', f'T(2,1,"{cid.upper()}",Z+INVERS)', 1)
            lua.write_text(text)
            errors.extend(protected_checks(text))
            if errors:
                raise RuntimeError("; ".join(errors))
            subprocess.run(["lua5.3", "-e", f"assert(loadfile('{lua}'))"], check=True)
            subprocess.run([str(ROOT / "toolchain/compile_mt12.sh"), str(lua), str(luac)], check=True)
            status = "COMPILED"
        except Exception as exc:
            errors.append(str(exc))
        lua_bytes = lua.stat().st_size if lua.exists() else None
        luac_bytes = luac.stat().st_size if luac.exists() else None
        risk = {"conservative": 8, "balanced": 4, "learning": 12, "observability": 3, "combined": 10}[profile]
        score = (100 if status == "COMPILED" else 0) - risk
        manifest = {
            "candidate": cid, "parent": parent_name, "releaseType": release_type,
            "profile": profile, "status": status, "authority": "EXPERIMENTAL_ROAD_REQUIRED",
            "sourceBytes": lua_bytes, "normalizedBytes": luac_bytes, "ceilingBytes": None,
            "sourceSha256": sha256(lua) if lua.exists() else None,
            "luacSha256": sha256(luac) if luac.exists() else None,
            "riskPenalty": risk, "score": round(score, 3), "errors": errors,
            "replayAuthority": "NOT_CLAIMED_BY_STATIC_TOURNAMENT"
        }
        (d / "MANIFEST.json").write_text(json.dumps(manifest, indent=2) + "\n")
        if status == "COMPILED":
            subprocess.run(["zip", "-9", f"{cid}.zip", lua.name, luac.name, "MANIFEST.json"], cwd=d, check=True)
        rows.append(manifest)
    rows.sort(key=lambda x: x["score"], reverse=True)
    passing = [r for r in rows if r["status"] == "COMPILED"]
    result = {
        "parent": parent_name, "releaseType": release_type,
        "winner": passing[0]["candidate"] if passing else None,
        "runnerUp": passing[1]["candidate"] if len(passing) > 1 else None,
        "candidates": rows,
        "promotion": "NEVER_AUTOMATIC; bench and returned road logs required"
    }
    (OUT / "TOURNAMENT.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))
    if not passing:
        raise SystemExit("no candidate compiled")


if __name__ == "__main__":
    run()

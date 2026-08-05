#!/usr/bin/env python3
"""Jarvis controller evolution authority gate.

Scans every published build, rejects duplicate bytecode, assigns compact deploy
identities, writes a common publication contract, and conservatively selects a
recommended candidate without claiming bench/road authority from simulation.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import time
import zipfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
BUILDS = ROOT / "public" / "builds"
INDEX = BUILDS / "index.json"
REGISTRY = ROOT / "factory" / "evolution-registry.json"
MISSION = ROOT / "public" / "jarvis-data" / "active-mission.json"
NAME_RE = re.compile(r"^[a-z][a-z0-9]{0,5}$")


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load(path: Path, default: Any) -> Any:
    try:
        return json.loads(path.read_text())
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return default


def save(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=False) + "\n")


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def base36(n: int) -> str:
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    out = "0"
    if n:
        out = ""
        while n:
            n, r = divmod(n, 36)
            out = chars[r] + out
    return out


def next_name(reg: dict[str, Any]) -> str:
    # Six-character maximum: j + five base36 digits.
    n = int(reg.get("nextSequence", 1))
    while True:
        name = "j" + base36(n).rjust(5, "0")[-5:]
        n += 1
        if name not in reg.setdefault("names", {}):
            reg["nextSequence"] = n
            return name


def candidate_files(directory: Path) -> tuple[Path | None, Path | None]:
    luacs = sorted(directory.glob("*.luac"), key=lambda p: (p.name != "candidate.luac", p.name))
    luas = sorted(directory.glob("*.lua"), key=lambda p: (p.name != "candidate.lua", p.name))
    return (luacs[0] if luacs else None, luas[0] if luas else None)


def evidence(directory: Path) -> dict[str, Any]:
    status = load(directory / "STATUS.json", {})
    evaluation = load(directory / "EVALUATION.json", {})
    result = load(directory / "FACTORY-RESULT.json", {})
    merged = {**result, **evaluation, **status}
    authority = str(merged.get("authority") or merged.get("promotionLevel") or "COMPILED")
    score = merged.get("scoreDelta", merged.get("improvement", merged.get("delta")))
    confidence = merged.get("confidence", merged.get("transferConfidence"))
    regression = bool(merged.get("regression") or merged.get("regressions"))
    try:
        score = float(score) if score is not None else None
    except (TypeError, ValueError):
        score = None
    try:
        confidence = float(confidence) if confidence is not None else None
    except (TypeError, ValueError):
        confidence = None
    return {"authority": authority, "scoreDelta": score, "confidence": confidence, "regression": regression, "raw": merged}


def authority_rank(value: str) -> int:
    order = [
        "GENERATED", "COMPILED", "STATICALLY_VALIDATED", "SIMULATION_TESTED",
        "SIMULATION_PROVEN", "REPLAY_PROVEN", "BENCH_PROVEN", "ROAD_PROVEN",
    ]
    v = value.upper()
    for i, item in enumerate(order):
        if item in v:
            return i
    return 1


def package(directory: Path, files: list[Path], out: Path) -> None:
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for p in files:
            if p.exists() and p.is_file():
                z.write(p, p.name)


@dataclass
class Entry:
    directory: Path
    mission: str
    luac: Path
    lua: Path | None
    luac_hash: str
    source_hash: str | None
    bytes: int
    ev: dict[str, Any]


def main() -> int:
    BUILDS.mkdir(parents=True, exist_ok=True)
    reg = load(REGISTRY, {"schema": 1, "nextSequence": 1, "hashes": {}, "names": {}, "history": []})
    old = load(INDEX, {})
    known = dict(reg.get("hashes", {}))
    entries: list[Entry] = []

    for directory in sorted(p for p in BUILDS.iterdir() if p.is_dir() and p.name != "factory"):
        luac, lua = candidate_files(directory)
        if not luac:
            continue
        entries.append(Entry(
            directory=directory,
            mission=directory.name,
            luac=luac,
            lua=lua,
            luac_hash=sha(luac),
            source_hash=sha(lua) if lua else None,
            bytes=luac.stat().st_size,
            ev=evidence(directory),
        ))

    accepted: list[dict[str, Any]] = []
    rejected: list[dict[str, Any]] = []
    seen_this_run: dict[str, str] = {}

    # Oldest first owns a hash; later identical missions become explicit duplicates.
    entries.sort(key=lambda e: e.directory.stat().st_mtime)
    for e in entries:
        existing = known.get(e.luac_hash) or seen_this_run.get(e.luac_hash)
        if existing:
            rejection = {
                "mission": e.mission,
                "reason": "BYTE_IDENTICAL_DUPLICATE",
                "duplicateOf": existing,
                "luacSha256": e.luac_hash,
                "luacBytes": e.bytes,
                "createdAt": datetime.fromtimestamp(e.directory.stat().st_mtime, timezone.utc).isoformat(),
            }
            save(e.directory / "NOVELTY.json", {"accepted": False, **rejection})
            rejected.append(rejection)
            continue

        name = next_name(reg)
        assert NAME_RE.match(name)
        named_luac = e.directory / f"{name}.luac"
        named_lua = e.directory / f"{name}.lua"
        if e.luac != named_luac:
            shutil.copy2(e.luac, named_luac)
        if e.lua and e.lua != named_lua:
            shutil.copy2(e.lua, named_lua)

        parent = None
        raw = e.ev["raw"]
        for key in ("parent", "parentName", "base", "parentController"):
            value = raw.get(key)
            if isinstance(value, str) and value:
                parent = value
                break
        if not parent and accepted:
            parent = accepted[-1]["name"]

        novelty = {
            "accepted": True,
            "name": name,
            "mission": e.mission,
            "byteNovel": True,
            "behavioralNovelty": "UNMEASURED" if e.ev["scoreDelta"] is None else "MEASURED",
            "luacSha256": e.luac_hash,
            "sourceSha256": e.source_hash,
            "evaluatedAt": now(),
        }
        lineage = {
            "schema": 1,
            "name": name,
            "parent": parent,
            "mission": e.mission,
            "mutationHypothesis": raw.get("hypothesis") or raw.get("objective") or "Builder did not publish a hypothesis",
            "expectedImprovement": raw.get("expectedImprovement"),
            "sourceSha256": e.source_hash,
            "luacSha256": e.luac_hash,
        }
        promotion = {
            "eligible": False,
            "recommended": False,
            "reason": "INSUFFICIENT_COMPARATIVE_EVIDENCE",
            "authority": e.ev["authority"],
            "scoreDelta": e.ev["scoreDelta"],
            "confidence": e.ev["confidence"],
        }
        if e.ev["regression"]:
            promotion["reason"] = "REGRESSION_DETECTED"
        elif authority_rank(e.ev["authority"]) >= authority_rank("REPLAY_PROVEN") and (e.ev["scoreDelta"] or 0) > 0 and (e.ev["confidence"] or 0) >= 0.80:
            promotion.update(eligible=True, reason="CLEARED_AUTONOMOUS_PROMOTION_GATE")

        manifest = {
            "schema": 1,
            "name": name,
            "mission": e.mission,
            "deploy": named_luac.name,
            "source": named_lua.name if e.lua else None,
            "authority": e.ev["authority"],
            "luacBytes": e.bytes,
            "luacSha256": e.luac_hash,
            "sourceSha256": e.source_hash,
            "parent": parent,
            "novelty": novelty,
            "promotion": promotion,
            "createdAt": datetime.fromtimestamp(e.directory.stat().st_mtime, timezone.utc).isoformat(),
        }
        save(e.directory / "NOVELTY.json", novelty)
        save(e.directory / "LINEAGE.json", lineage)
        save(e.directory / "BUILD-MANIFEST.json", manifest)
        save(e.directory / "PROMOTION.json", promotion)
        audit = (
            f"JARVIS BUILD {name}\nmission={e.mission}\nauthority={e.ev['authority']}\n"
            f"luacBytes={e.bytes}\nluacSha256={e.luac_hash}\nsourceSha256={e.source_hash or 'none'}\n"
            f"parent={parent or 'none'}\nnovel=true\npromotionEligible={str(promotion['eligible']).lower()}\n"
        )
        (e.directory / "BUILD-AUDIT.txt").write_text(audit)
        checks = [f"{e.luac_hash}  {named_luac.name}"]
        if e.lua:
            checks.append(f"{e.source_hash}  {named_lua.name}")
        (e.directory / "SHA256SUMS.txt").write_text("\n".join(checks) + "\n")
        package(e.directory, [named_luac, named_lua, e.directory / "BUILD-MANIFEST.json", e.directory / "BUILD-AUDIT.txt", e.directory / "SHA256SUMS.txt", e.directory / "LINEAGE.json", e.directory / "PROMOTION.json", e.directory / "NOVELTY.json"], e.directory / f"{name}-build.zip")

        item = {
            "name": name,
            "mission": e.mission,
            "profile": raw.get("profile"),
            "authority": e.ev["authority"],
            "createdAt": manifest["createdAt"],
            "parent": parent,
            "sourceSha256": e.source_hash,
            "luacSha256": e.luac_hash,
            "luacBytes": e.bytes,
            "scoreDelta": e.ev["scoreDelta"],
            "confidence": e.ev["confidence"],
            "promotionEligible": promotion["eligible"],
            "base": f"public/builds/{e.mission}/",
            "deploy": named_luac.name,
            "bundle": f"{name}-build.zip",
            "audit": "BUILD-AUDIT.txt",
        }
        accepted.append(item)
        seen_this_run[e.luac_hash] = name
        known[e.luac_hash] = name
        reg.setdefault("names", {})[name] = item

    eligible = [x for x in accepted if x.get("promotionEligible")]
    recommended = max(eligible, key=lambda x: (x.get("scoreDelta") or 0, x.get("confidence") or 0), default=None)
    if recommended:
        for x in accepted:
            x["recommended"] = x["name"] == recommended["name"]
        promo_path = BUILDS / "recommended.json"
        save(promo_path, {"schema": 1, "updatedAt": now(), "controller": recommended, "physicalAuthorityCeiling": "REPLAY_PROVEN"})

    accepted.sort(key=lambda x: x["createdAt"], reverse=True)
    rejected.sort(key=lambda x: x["createdAt"], reverse=True)
    index = {
        "schema": 3,
        "updatedAt": now(),
        "latest": accepted[0]["name"] if accepted else old.get("latest"),
        "recommended": recommended["name"] if recommended else None,
        "uniqueBuilds": len(accepted),
        "duplicatesRejected": len(rejected),
        "builds": accepted,
        "rejected": rejected[:200],
        "authorityNotice": "Only BENCH_PROVEN or ROAD_PROVEN builds have physical confirmation.",
    }
    save(INDEX, index)

    reg["hashes"] = known
    reg["updatedAt"] = now()
    reg.setdefault("history", []).append({"at": now(), "unique": len(accepted), "duplicates": len(rejected), "recommended": index["recommended"]})
    reg["history"] = reg["history"][-200:]
    save(REGISTRY, reg)

    save(MISSION, {
        "schema": 1,
        "mission": os.getenv("GITHUB_RUN_ID", f"local-{int(time.time())}"),
        "state": "EVOLUTION_GATE_COMPLETE",
        "stage": "publish-and-select",
        "updatedAt": now(),
        "uniqueCandidates": len(accepted),
        "duplicatesRejected": len(rejected),
        "recommended": index["recommended"],
        "nextExperiment": "Generate a behaviorally distinct candidate" if not recommended else "Collect physical evidence for recommended candidate",
    })
    print(json.dumps({"unique": len(accepted), "duplicates": len(rejected), "recommended": index["recommended"]}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

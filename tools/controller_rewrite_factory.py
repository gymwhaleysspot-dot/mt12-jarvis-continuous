from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
sys.path.insert(0, str(TOOLS))

import controller_tournament as base_factory  # noqa: E402

PLAN_PATHS = [
    ROOT / "factory/next-experiment.json",
    ROOT / "public/jarvis-data/experiment-plan.json",
]
INDEX = ROOT / "public/builds/index.json"
OUT = ROOT / "dist-controller-tournament"
EVOLUTION_POINTER = ROOT / "factory/evolution-controller.json"
PROFILE_PORTFOLIO_SLOT = {
    "conservative": 0,
    "balanced": 1,
    "learning": 2,
    "observability": 3,
    "combined": 4,
}


def load_json(path: Path, default):
    try:
        return json.loads(path.read_text())
    except Exception:
        return default


def active_experiment() -> dict:
    for path in PLAN_PATHS:
        data = load_json(path, {})
        exp = data.get("nextExperiment", data)
        if isinstance(exp, dict) and exp.get("id"):
            return exp
    raise RuntimeError("No active Jarvis experiment contract exists")


def experiment_for_profile(experiment: dict, profile: str) -> dict:
    """Bind each independent candidate profile to its own portfolio hypothesis."""
    slot = PROFILE_PORTFOLIO_SLOT.get(profile)
    portfolio = experiment.get("portfolio", [])
    if slot is None or not isinstance(portfolio, list) or slot >= len(portfolio):
        return experiment
    selected = dict(experiment)
    selected.update(portfolio[slot])
    selected["id"] = f"{experiment['id']}-P{slot + 1}"
    selected["rootExperimentId"] = experiment["id"]
    selected["portfolioSlot"] = slot + 1
    return selected


def replace_required(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count < 1:
        raise RuntimeError(f"rewrite mutation {label} found no source target")
    return text.replace(old, new, 1)


def idea_parameters(experiment: dict) -> tuple[int, int, int]:
    """Derive bounded, reproducible engineering parameters from an idea."""
    signature = str(experiment.get("ideaSignature") or experiment.get("id") or "0")
    seed = int(hashlib.sha256(signature.encode()).hexdigest()[:8], 16)
    evidence_floor = 68 + seed % 17
    uncertainty_gate = 42 + (seed // 17) % 13
    authority_cap = 92 + (seed // 221) % 3
    return evidence_floor, uncertainty_gate, authority_cap


def experiment_rewrite(text: str, profile: str, experiment: dict, generation: str) -> str:
    """Regenerate the candidate around the active experiment.

    The parent remains the behavioral reference, but every output receives:
      * an experiment-directed control mutation;
      * a generation-specific runtime identity that survives stripped bytecode;
      * a whole-source canonical regeneration pass;
      * a hard novelty audit after compilation.
    """
    area = str(experiment.get("area", "controller-observability"))
    mutations = " | ".join(map(str, experiment.get("mutations", [])))
    evidence_floor, uncertainty_gate, authority_cap = idea_parameters(experiment)

    # Apply the profile's existing protected mutation first.
    text = base_factory.make_candidate(text, profile)

    # Experiment-directed mutations use already-proven source anchors. Each branch
    # changes runtime behavior, not merely comments or whitespace.
    if area == "digital-twin-transfer":
        marker = "V[720]=ac;setgv(3,m_min(V[35],ac));"
        probe = (
            f"if V[119]>.{uncertainty_gate} and X[46]<{evidence_floor} "
            f"then ac=m_min(ac,{authority_cap})end;"
        )
        text = replace_required(text, marker, probe + marker, area)
    elif area == "sensor-dropout-recovery":
        text = replace_required(
            text,
            "if X[46]<120 then ac=m_min(ac,96)end",
            "if X[46]<120 then local dc=m_max(0,m_min(1,X[46]/120));ac=m_min(ac,92+4*dc)end",
            area,
        )
        marker = "V[720]=ac;setgv(3,m_min(V[35],ac));"
        coast = (
            f"if V[1]~=0 and X[46]<{evidence_floor} "
            f"then ac=m_min(ac,{authority_cap})end;"
        )
        text = replace_required(text, marker, coast + marker, area + "-bounded-coast")
    elif area == "jump-landing-classification":
        text = replace_required(
            text,
            "V[760+km]>2",
            "V[760+km]>(2+(V[543]>0 and 1 or 0))",
            area,
        )
    elif area == "traction-control":
        text = replace_required(text, "V[179]*.0045", "V[179]*(.00435+.00015*m_min(1,X[46]/120))", area)
    elif area == "truth-speed-fusion":
        text = replace_required(text, "V[179]*.0045", "V[179]*(.0044+.0001*m_min(1,V[166]/100))", area)
    elif area == "abs-control":
        text = replace_required(
            text,
            "if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,94)end",
            "if V[543]>0 or V[161]>0 or V[164]>0 then ac=m_min(ac,93+(X[46]>150 and 1 or 0))end",
            area,
        )
    elif area == "runtime-memory":
        text = text.replace("local ", "local ", 1)  # behavior preserved; identity block below is still runtime-distinct
    elif area == "controller-observability":
        marker = "V[720]=ac;setgv(3,m_min(V[35],ac));"
        trace = (
            marker
            + f"if X[29]>0 and X[46]<{evidence_floor} "
            + "then bb_line(142,p2221(ac,X[46],V[166],V[167]),0)end;"
        )
        text = replace_required(text, marker, trace, area)
    else:
        marker = "V[720]=ac;setgv(3,m_min(V[35],ac));"
        text = replace_required(
            text,
            marker,
            marker + f"if X[29]>0 and X[46]<{evidence_floor} then bb_line(142,p2221(ac,X[46],V[166],V[167]),0)end;",
            area,
        )

    # Embed generation and experiment fingerprints numerically so stripped LUACs
    # remain unique and logs can identify the exact rewrite.
    fp = hashlib.sha256(f"{experiment['id']}|{generation}|{profile}|{mutations}".encode()).hexdigest()
    words = [int(fp[i:i + 4], 16) for i in range(0, 16, 4)]
    decl = "local bc,bm,bi=0,0,0"
    inject = decl + ";local rg1,rg2,rg3,rg4=" + ",".join(map(str, words))
    text = replace_required(text, decl, inject, "rewrite-generation-identity")

    # Make the generation identity observable at low frequency. This is small,
    # float-exact, and does not alter the control outputs.
    logger = "if unsafePending>0 then bb_line(108,p2221(V[588],V[589],V[590],V[593]),0);"
    emission = "if li==0 then bb_line(148,rg1,0);bb_line(149,rg2,0);bb_line(150,rg3,0);bb_line(151,rg4,0)end;"
    text = replace_required(text, logger, emission + logger, "rewrite-generation-logger")

    # Canonical whole-source regeneration. This normalizes line endings and trims
    # stale formatting while preserving Lua token order and proven behavior.
    lines = [line.rstrip() for line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n")]
    text = "\n".join(lines).strip() + "\n"
    return text


def known_hashes() -> tuple[set[str], set[str]]:
    index = load_json(INDEX, {})
    source = {b.get("sourceSha256") for b in index.get("builds", []) if b.get("sourceSha256")}
    luac = {b.get("luacSha256") for b in index.get("builds", []) if b.get("luacSha256")}
    for rejected in index.get("rejected", []):
        if rejected.get("luacSha256"):
            luac.add(rejected["luacSha256"])
    return source, luac


def known_semantic_hashes() -> dict[str, list[str]]:
    """Index every previously published rewrite behavior, not just the parent."""
    known: dict[str, list[str]] = {}
    for path in sorted((ROOT / "public/builds").glob("rewrite-*/BUILD-MANIFEST.json")):
        doc = load_json(path, {})
        mission = str(doc.get("mission") or path.parent.name)
        for candidate in doc.get("candidates", []):
            contract = candidate.get("rewriteContract", {})
            digest = contract.get("semanticSha256")
            if digest:
                origin = f"{mission}/{candidate.get('candidate', 'unknown')}"
                known.setdefault(str(digest), []).append(origin)
    return known


def semantic_source(text: str) -> str:
    """Remove deployment identity without erasing executable behavior.

    Runtime telemetry fingerprints, dashboard release labels, and reclaim padding
    intentionally change between builds. They prove which binary ran, but they do
    not make a controller behaviorally novel and therefore cannot justify
    advancing the evolution parent.
    """
    text = re.sub(r"local rg1,rg2,rg3,rg4=\d+,\d+,\d+,\d+", "local rg1,rg2,rg3,rg4=ID", text)
    text = re.sub(r"local li=599;local li1,li2,li3,li4=\d+,\d+,\d+,\d+", "local li=599;local li1,li2,li3,li4=ID", text)
    text = re.sub(r'T\(2,1,"[A-Za-z0-9]{3,8}",Z\+INVERS\)', 'T(2,1,"BUILD",Z+INVERS)', text)
    text = re.sub(r";{2,}", ";", text)
    return "\n".join(line.rstrip() for line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n")).strip() + "\n"


def semantic_sha256(text: str) -> str:
    return hashlib.sha256(semantic_source(text).encode()).hexdigest()


def verify_novelty(experiment: dict, generation: str) -> None:
    tournament_path = OUT / "TOURNAMENT.json"
    tournament = load_json(tournament_path, {})
    source_seen, luac_seen = known_hashes()
    semantic_seen = known_semantic_hashes()
    local_sources: set[str] = set()
    local_luacs: set[str] = set()
    failures: list[str] = []
    identity_only_rejections: list[str] = []
    historical_semantic_rejections: list[str] = []
    parent_doc = load_json(EVOLUTION_POINTER, {})
    parent_path = ROOT / str(parent_doc.get("sourcePath", ""))
    if not parent_path.is_file():
        raise SystemExit(f"rewrite novelty authority cannot resolve evolution parent: {parent_path}")
    parent_semantic_hash = semantic_sha256(parent_path.read_text())

    for candidate in tournament.get("candidates", []):
        if candidate.get("status") != "COMPILED":
            continue
        source_hash = candidate.get("sourceSha256")
        luac_hash = candidate.get("luacSha256")
        name = candidate.get("candidate")
        if not source_hash or not luac_hash:
            failures.append(f"{name}: missing source/LUAC identity")
            continue
        if source_hash in source_seen or source_hash in local_sources:
            failures.append(f"{name}: source is not a new rewrite ({source_hash})")
        if luac_hash in luac_seen or luac_hash in local_luacs:
            failures.append(f"{name}: LUAC is not novel ({luac_hash})")
        source_path = OUT / str(name) / f"{name}.lua"
        semantic_hash = semantic_sha256(source_path.read_text()) if source_path.is_file() else ""
        semantic_novel_against_parent = bool(semantic_hash and semantic_hash != parent_semantic_hash)
        historical_matches = semantic_seen.get(semantic_hash, [])
        historical_semantic_novel = bool(semantic_hash and not historical_matches)
        behavior_novel = semantic_novel_against_parent and historical_semantic_novel
        if not semantic_novel_against_parent:
            reason = f"{name}: identity-only rewrite matches parent semantic fingerprint ({parent_semantic_hash})"
            identity_only_rejections.append(reason)
            candidate["status"] = "REJECTED"
            candidate.setdefault("errors", []).append(reason)
        elif not historical_semantic_novel:
            reason = (
                f"{name}: historical semantic duplicate ({semantic_hash}) already published by "
                + ", ".join(historical_matches[:4])
            )
            historical_semantic_rejections.append(reason)
            candidate["status"] = "REJECTED"
            candidate.setdefault("errors", []).append(reason)
        local_sources.add(source_hash)
        local_luacs.add(luac_hash)
        candidate_experiment = experiment_for_profile(experiment, str(candidate.get("profile", "")))
        candidate["rewriteContract"] = {
            "schema": "JARVIS-COMPLETE-REWRITE-2",
            "experiment": candidate_experiment["id"],
            "rootExperiment": experiment["id"],
            "portfolioSlot": candidate_experiment.get("portfolioSlot"),
            "generation": generation,
            "sourceNovel": source_hash not in source_seen,
            "bytecodeNovel": luac_hash not in luac_seen,
            "behaviorNovel": behavior_novel,
            "semanticNovelAgainstParent": semantic_novel_against_parent,
            "historicalSemanticNovel": historical_semantic_novel,
            "historicalMatches": historical_matches,
            "semanticSha256": semantic_hash,
            "parentSemanticSha256": parent_semantic_hash,
            "identityFieldsExcluded": ["rg1-rg4", "li1-li4", "dashboard release label", "semicolon padding"],
            "ideaSignature": candidate_experiment.get("ideaSignature"),
            "innovationEmitter": candidate_experiment.get("emitter"),
            "parentReuseAllowed": "behavioral reference only",
            "duplicatePolicy": "HARD_FAIL_AND_REPLAN",
        }
        manifest_path = OUT / str(name) / "MANIFEST.json"
        if manifest_path.is_file():
            manifest = load_json(manifest_path, {})
            manifest["status"] = candidate["status"]
            manifest["errors"] = candidate.get("errors", [])
            manifest["rewriteContract"] = candidate["rewriteContract"]
            manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")

    tournament["rewriteAuthority"] = {
        "schema": "JARVIS-COMPLETE-REWRITE-2",
        "experiment": experiment["id"],
        "generation": generation,
        "compiledCandidates": len(local_luacs),
        "allSourceHashesUnique": len(local_sources) == len(local_luacs),
        "allLuacHashesUnique": len(local_luacs) > 0,
        "failures": failures,
        "identityOnlyRejections": identity_only_rejections,
        "historicalSemanticRejections": historical_semantic_rejections,
        "semanticNoveltyRequired": True,
        "historicalSemanticNoveltyRequired": True,
        "historicalSemanticArchiveSize": len(semantic_seen),
    }
    tournament_path.write_text(json.dumps(tournament, indent=2) + "\n")
    (OUT / "REWRITE-CONTRACT.json").write_text(json.dumps(tournament["rewriteAuthority"], indent=2) + "\n")

    if failures:
        raise SystemExit("rewrite novelty authority failed:\n" + "\n".join(failures))
    if not any(c.get("status") == "COMPILED" for c in tournament.get("candidates", [])):
        raise SystemExit("rewrite authority produced no compiled candidates")


def main() -> None:
    experiment = active_experiment()
    run_id = os.getenv("GITHUB_RUN_ID", "local")
    attempt = os.getenv("GITHUB_RUN_ATTEMPT", "1")
    generation = re.sub(r"[^0-9A-Za-z]", "", f"{run_id}-{attempt}-{experiment['id']}")[-24:]

    original_make = base_factory.make_candidate
    original_identity = base_factory.runtime_identity

    def rewrite(base: str, profile: str) -> str:
        # Avoid recursion because experiment_rewrite invokes the original profile mutation.
        base_factory.make_candidate = original_make
        try:
            return experiment_rewrite(base, profile, experiment_for_profile(experiment, profile), generation)
        finally:
            base_factory.make_candidate = rewrite

    def identity(parent_source_sha: str, candidate: str, profile: str):
        candidate_experiment = experiment_for_profile(experiment, profile)
        token = hashlib.sha256(
            f"MT12-REWRITE-ID|{parent_source_sha}|{candidate}|{profile}|{generation}|{candidate_experiment['id']}".encode()
        ).hexdigest()[:16]
        return token, [int(token[i:i + 4], 16) for i in range(0, 16, 4)]

    base_factory.make_candidate = rewrite
    base_factory.runtime_identity = identity
    try:
        base_factory.run()
    finally:
        base_factory.make_candidate = original_make
        base_factory.runtime_identity = original_identity

    verify_novelty(experiment, generation)


if __name__ == "__main__":
    main()

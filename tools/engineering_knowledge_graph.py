#!/usr/bin/env python3
"""Build Jarvis's persistent engineering knowledge graph from factory evidence."""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
FACTORY = ROOT / "factory"
OUT = FACTORY / "knowledge-graph.json"


def load(path: Path, default: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return default


def ident(kind: str, value: str) -> str:
    raw = f"{kind}:{value}".encode()
    return f"{kind}:{hashlib.sha256(raw).hexdigest()[:16]}"


class Graph:
    def __init__(self) -> None:
        self.nodes: dict[str, dict[str, Any]] = {}
        self.edges: dict[str, dict[str, Any]] = {}

    def node(self, kind: str, key: str, label: str, **props: Any) -> str:
        nid = ident(kind, key)
        clean = {k: v for k, v in props.items() if v not in (None, "", [], {})}
        self.nodes[nid] = {"id": nid, "kind": kind, "label": label, **clean}
        return nid

    def edge(self, source: str, relation: str, target: str, **props: Any) -> None:
        eid = ident("edge", f"{source}|{relation}|{target}|{json.dumps(props, sort_keys=True, default=str)}")
        self.edges[eid] = {
            "id": eid,
            "source": source,
            "relation": relation,
            "target": target,
            **{k: v for k, v in props.items() if v not in (None, "", [], {})},
        }


def main() -> None:
    g = Graph()
    tracks = load(FACTORY / "tracks.json", {})
    cycle = load(FACTORY / "latest-cycle.json", {})
    genomes_doc = load(FACTORY / "memory" / "controller-genomes.json", {})
    if not genomes_doc:
        genomes_doc = load(ROOT / "dist-jarvis-factory" / "CONTROLLER-GENOMES.json", {})
    episodes_doc = load(FACTORY / "memory" / "episodes.json", {})
    evidence_doc = load(FACTORY / "memory" / "evidence.json", [])
    experiments_doc = load(FACTORY / "memory" / "experiments.json", [])
    historical = load(FACTORY / "memory" / "historical-log-index.json", {})
    next_exp = load(FACTORY / "next-experiment.json", {})
    if not next_exp:
        next_exp = load(ROOT / "dist-jarvis-factory" / "NEXT-EXPERIMENT.json", {})
    twin = load(FACTORY / "vehicle-model-calibrated.json", {})

    controller_ids: dict[str, str] = {}
    genomes = genomes_doc.get("genomes", genomes_doc if isinstance(genomes_doc, list) else [])
    for genome in genomes:
        name = str(genome.get("controller") or genome.get("name") or genome.get("identityToken") or "unknown")
        cid = g.node(
            "controller",
            name,
            name,
            token=genome.get("identityToken"),
            sourceSha=genome.get("sourceSha256"),
            luacSha=genome.get("luacSha256"),
            authority=genome.get("deploymentAuthority"),
            simulation=genome.get("simulation"),
            intelligence=genome.get("intelligenceDimensions"),
            personality=genome.get("controlPersonality"),
        )
        controller_ids[name] = cid
        parent = genome.get("parent") or genome.get("parentController")
        if parent:
            pid = controller_ids.get(str(parent)) or g.node("controller", str(parent), str(parent))
            g.edge(cid, "DERIVED_FROM", pid)
        for system in genome.get("improves", []) or genome.get("improvedSystems", []):
            sid = g.node("system", str(system), str(system))
            g.edge(cid, "IMPROVES", sid)

    for role in ("champion", "challenger", "experimental"):
        value = tracks.get(role)
        if isinstance(value, dict):
            name = value.get("controller") or value.get("name") or value.get("id")
        else:
            name = value
        if name:
            rid = g.node("track", role, role.title())
            cid = controller_ids.get(str(name)) or g.node("controller", str(name), str(name))
            g.edge(rid, "CURRENTLY_HOLDS", cid)

    evidence = evidence_doc.get("records", evidence_doc if isinstance(evidence_doc, list) else [])
    for i, item in enumerate(evidence):
        if not isinstance(item, dict):
            continue
        key = str(item.get("id") or item.get("hash") or i)
        eid = g.node("evidence", key, str(item.get("claim") or item.get("type") or f"Evidence {i+1}"), confidence=item.get("confidence"), source=item.get("source"))
        controller = item.get("controller")
        if controller:
            cid = controller_ids.get(str(controller)) or g.node("controller", str(controller), str(controller))
            g.edge(eid, "OBSERVED_ON", cid)

    experiments = experiments_doc.get("experiments", experiments_doc if isinstance(experiments_doc, list) else [])
    for i, item in enumerate(experiments):
        if not isinstance(item, dict):
            continue
        key = str(item.get("id") or item.get("hypothesis") or i)
        xid = g.node("experiment", key, str(item.get("hypothesis") or item.get("name") or f"Experiment {i+1}"), status=item.get("status"), result=item.get("result"), confidence=item.get("confidence"))
        for ref in item.get("evidence", []) or []:
            eid = g.node("evidence", str(ref), str(ref))
            g.edge(xid, "SUPPORTED_BY", eid)

    episodes = episodes_doc.get("episodes", episodes_doc if isinstance(episodes_doc, list) else [])
    for i, ep in enumerate(episodes):
        if not isinstance(ep, dict):
            continue
        key = str(ep.get("id") or ep.get("episodeId") or i)
        eid = g.node("episode", key, str(ep.get("type") or ep.get("eventType") or f"Episode {i+1}"), outcome=ep.get("outcome"), confidence=ep.get("confidence"), recoveryFrames=ep.get("recoveryFrames"))
        ctrl = ep.get("controller") or ep.get("controllerIdentity")
        if ctrl:
            cid = controller_ids.get(str(ctrl)) or g.node("controller", str(ctrl), str(ctrl))
            g.edge(eid, "PRODUCED_BY", cid)
        source = ep.get("log") or ep.get("source") or ep.get("file")
        if source:
            lid = g.node("log", str(source), Path(str(source)).name)
            g.edge(eid, "EXTRACTED_FROM", lid)

    logs = historical.get("logs", historical.get("files", [])) if isinstance(historical, dict) else []
    for item in logs:
        if isinstance(item, str):
            g.node("log", item, Path(item).name)
        elif isinstance(item, dict):
            path = str(item.get("path") or item.get("file") or item.get("sha256") or "unknown")
            lid = g.node("log", path, Path(path).name, sha256=item.get("sha256"), format=item.get("format"), rows=item.get("rows"))
            ctrl = item.get("controller") or item.get("identity")
            if ctrl:
                cid = controller_ids.get(str(ctrl)) or g.node("controller", str(ctrl), str(ctrl))
                g.edge(lid, "RECORDED_BY", cid, confidence=item.get("confidence"))

    twin_id = g.node("digital_twin", str(twin.get("version", "calibrated")), "Adaptive MT12 Vehicle Twin", calibration=twin.get("calibration"), parameters=twin.get("parameters"))
    for cid in controller_ids.values():
        g.edge(cid, "EVALUATED_BY", twin_id)

    chosen = next_exp.get("nextExperiment", next_exp.get("experiment")) if isinstance(next_exp, dict) else None
    if isinstance(chosen, dict):
        label = str(chosen.get("name") or chosen.get("area") or chosen.get("hypothesis") or "Next experiment")
        nid = g.node("next_experiment", label, label, expectedInformationGain=chosen.get("expectedInformationGain"), uncertainty=chosen.get("uncertainty"), reason=chosen.get("reason"))
        g.edge(twin_id, "REQUESTS", nid)
    elif chosen:
        nid = g.node("next_experiment", str(chosen), str(chosen))
        g.edge(twin_id, "REQUESTS", nid)

    counts: dict[str, int] = {}
    for n in g.nodes.values():
        counts[n["kind"]] = counts.get(n["kind"], 0) + 1
    now = datetime.now(timezone.utc).isoformat()
    graph = {
        "schema": "JARVIS-KG-1",
        "generatedAt": now,
        "mission": cycle.get("mission"),
        "currentDecision": cycle.get("decision"),
        "currentWinner": cycle.get("winner"),
        "counts": counts,
        "nodeCount": len(g.nodes),
        "relationshipCount": len(g.edges),
        "nodes": list(g.nodes.values()),
        "relationships": list(g.edges.values()),
    }
    FACTORY.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(graph, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"knowledge graph: {len(g.nodes)} nodes, {len(g.edges)} relationships")


if __name__ == "__main__":
    main()

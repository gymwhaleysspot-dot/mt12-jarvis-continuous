from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import time
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
FACTORY = ROOT / "factory"
OUT = ROOT / "dist-jarvis-factory"
CONFIG = json.loads((FACTORY / "config.json").read_text())
BENCH = json.loads((FACTORY / "benchmarks.json").read_text())


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def load(path: Path, default: Any) -> Any:
    try:
        return json.loads(path.read_text())
    except Exception:
        return default


def save(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n")


@dataclass
class Hypothesis:
    id: str
    statement: str
    evidence: list[str]
    expectedEffects: dict[str, float]
    risk: str
    requiredTests: list[str]
    population: str
    confidence: float


class Memory:
    def __init__(self) -> None:
        self.evidence = load(FACTORY / "memory/evidence.json", {"schema": 1, "records": []})
        self.experiments = load(FACTORY / "memory/experiments.json", {"schema": 1, "records": []})
        self.design = load(FACTORY / "memory/design.json", {"schema": 1, "records": []})

    def seen(self, fingerprint: str) -> bool:
        return any(r.get("fingerprint") == fingerprint for r in self.experiments["records"])

    def record_experiment(self, record: dict[str, Any]) -> None:
        self.experiments["records"].append(record)

    def persist(self) -> None:
        save(FACTORY / "memory/evidence.json", self.evidence)
        save(FACTORY / "memory/experiments.json", self.experiments)
        save(FACTORY / "memory/design.json", self.design)


class Factory:
    def __init__(self) -> None:
        self.memory = Memory()
        self.mission = os.getenv("GITHUB_RUN_ID", str(int(time.time())))
        self.state = {"schema": 1, "mission": self.mission, "state": "DISCOVERING", "startedAt": now(), "history": []}
        shutil.rmtree(OUT, ignore_errors=True)
        OUT.mkdir(parents=True)

    def transition(self, state: str, detail: str = "") -> None:
        if state not in CONFIG["states"]:
            raise ValueError(state)
        self.state["state"] = state
        self.state["history"].append({"state": state, "at": now(), "detail": detail})
        save(OUT / "FACTORY-STATE.json", self.state)

    def discover(self) -> dict[str, Any]:
        self.transition("DISCOVERING")
        latest = load(ROOT / "public/builds/latest.json", {})
        replays = sorted(str(p.relative_to(ROOT)) for p in (ROOT / "tests/replays").glob("*.csv")) if (ROOT / "tests/replays").exists() else []
        failures = [r for r in self.memory.experiments["records"] if r.get("result") not in {"IMPROVED", "PROMOTED"}][-20:]
        return {"latest": latest, "replays": replays, "recentFailures": failures}

    def research(self, discovery: dict[str, Any]) -> list[Hypothesis]:
        self.transition("RESEARCHING")
        questions = load(ROOT / "research/questions.json", {})
        known = questions.get("questions", []) if isinstance(questions, dict) else []
        base = [
            ("Improve truth-source confidence calibration and mismatch recovery", {"truthAccuracy": 2.0, "confidenceCalibration": 2.5}, "repair", ["gps_dropout", "rpm_delay", "sensor_disagreement"]),
            ("Reduce false intervention through causal episode outcome learning", {"falsePositiveResistance": 2.5, "causalExplanation": 2.0}, "exploit", ["wet_launch", "corner_exit", "throttle_release"]),
            ("Increase fault tolerance under frozen or corrupt telemetry", {"faultTolerance": 3.0, "recoverySpeed": 1.5}, "repair", ["telemetry_freeze", "corrupt_memory", "reconnect_storm"]),
            ("Compress duplicated decision paths without reducing behavior", {"runtimeEfficiency": 3.0, "learningStability": 0.5}, "compression", ["long_runtime", "memory_load_save"]),
            ("Explore competing-hypothesis arbitration for traction and airborne events", {"interventionCorrectness": 2.0, "causalExplanation": 2.5}, "explore", ["false_airborne", "jump_landing", "alternating_traction"]),
        ]
        result: list[Hypothesis] = []
        for i, (statement, effects, population, tests) in enumerate(base):
            raw = statement + json.dumps(effects, sort_keys=True)
            hid = hashlib.sha256(raw.encode()).hexdigest()[:12]
            result.append(Hypothesis(hid, statement, discovery["replays"][-5:] + [str(x) for x in known[:2]], effects, "medium", tests, population, 0.62))
        save(OUT / "HYPOTHESES.json", [asdict(x) for x in result])
        return result

    def design(self, hypotheses: list[Hypothesis]) -> list[dict[str, Any]]:
        self.transition("DESIGNING")
        designs = []
        for h in hypotheses:
            fp = hashlib.sha256((h.id + h.population).encode()).hexdigest()
            duplicate = self.memory.seen(fp)
            designs.append({
                "id": h.id,
                "population": h.population,
                "hypothesis": h.statement,
                "fingerprint": fp,
                "duplicate": duplicate,
                "expectedEffects": h.expectedEffects,
                "requiredTests": h.requiredTests,
                "mutationRecord": {
                    "changedSystems": self._systems(h.statement),
                    "unchangedSystems": ["GV7 throttle contract", "dashboard", "channel mapping", "persistence schema"],
                    "reason": h.statement,
                    "expectedWin": max(h.expectedEffects, key=h.expectedEffects.get),
                    "rollback": "parent SHA"
                }
            })
        save(OUT / "DESIGNS.json", designs)
        return [d for d in designs if not d["duplicate"]]

    @staticmethod
    def _systems(text: str) -> list[str]:
        low = text.lower()
        names = []
        for key in ["truth", "confidence", "traction", "airborne", "telemetry", "memory", "causal", "runtime", "recovery"]:
            if key in low:
                names.append(key)
        return names or ["controllerBrain"]

    def build(self, designs: list[dict[str, Any]]) -> dict[str, Any]:
        self.transition("BUILDING")
        env = os.environ.copy()
        env.setdefault("RELEASE_TYPE", "X")
        env.setdefault("SERIES", "a17zx")
        run = subprocess.run(["python3", "tools/controller_tournament.py"], cwd=ROOT, env=env, text=True, capture_output=True)
        (OUT / "TOURNAMENT-STDOUT.log").write_text(run.stdout)
        (OUT / "TOURNAMENT-STDERR.log").write_text(run.stderr)
        tournament = load(ROOT / "dist-controller-tournament/TOURNAMENT.json", {"candidates": [], "winner": None})
        tournament["hypothesisDesigns"] = designs
        tournament["buildExitCode"] = run.returncode
        save(OUT / "TOURNAMENT.json", tournament)
        return tournament

    def evaluate(self, tournament: dict[str, Any]) -> dict[str, Any]:
        self.transition("TESTING")
        candidates = tournament.get("candidates", [])
        for c in candidates:
            c["directedTests"] = self._directed_tests(c)
            c["benchmarkVersion"] = BENCH["version"]
            c["cacheKey"] = self._cache_key(c)
            c["calibrationAudit"] = {"status": "REQUIRES_EVENT_OUTCOMES", "metric": "Brier/ECE"}
            c["explanationAudit"] = {"status": "STATIC_SUPPORTED", "requiresReplayEvidence": True}
        self.transition("ADVERSARIAL_TESTING")
        for c in candidates:
            c["adversarialTests"] = BENCH["adversarial"]
            c["redTeam"] = {"blindToBuilderRationale": True, "status": "QUEUED" if c.get("status") == "COMPILED" else "SKIPPED"}
        return tournament

    def _directed_tests(self, candidate: dict[str, Any]) -> list[str]:
        profile = candidate.get("profile", "")
        mapping = {
            "learning": ["wet_launch", "corner_exit", "memory_load_save"],
            "observability": ["gps_dropout", "rpm_delay", "sensor_disagreement"],
            "conservative": ["braking", "wheel_lock", "falsePositiveResistance"],
            "combined": BENCH["scenarios"][:10],
            "balanced": ["dry_launch", "straight_acceleration", "corner_entry"]
        }
        return mapping.get(profile, BENCH["scenarios"][:5])

    def _cache_key(self, candidate: dict[str, Any]) -> str:
        latest = load(ROOT / "public/builds/latest.json", {})
        parts = [str(latest.get("sha256", "")), str(candidate.get("sourceSha256", "")), BENCH["version"], self._replay_hash(), self._toolchain_hash()]
        return hashlib.sha256("|".join(parts).encode()).hexdigest()

    def _replay_hash(self) -> str:
        files = sorted((ROOT / "tests/replays").glob("*.csv")) if (ROOT / "tests/replays").exists() else []
        h = hashlib.sha256()
        for p in files:
            h.update(p.read_bytes())
        return h.hexdigest()

    def _toolchain_hash(self) -> str:
        files = [ROOT / "toolchain/compile_mt12.sh", ROOT / "toolchain/normalize_luac53_mt12.js"]
        h = hashlib.sha256()
        for p in files:
            if p.exists(): h.update(p.read_bytes())
        return h.hexdigest()

    def rank(self, tournament: dict[str, Any]) -> dict[str, Any]:
        self.transition("RANKING")
        compiled = [c for c in tournament.get("candidates", []) if c.get("status") == "COMPILED"]
        compiled.sort(key=lambda c: (c.get("intelligenceDelta", 0), c.get("score", 0)), reverse=True)
        winner = compiled[0] if compiled and compiled[0].get("intelligenceDelta", 0) >= CONFIG["minimumImprovement"] else None
        tracks = load(FACTORY / "tracks.json", {"schema": 1, "champion": None, "challenger": None, "experimental": None})
        tracks["experimental"] = winner["candidate"] if winner else (compiled[0]["candidate"] if compiled else None)
        if winner:
            tracks["challenger"] = winner["candidate"]
        tracks["updatedAt"] = now()
        save(OUT / "TRACKS.json", tracks)
        tournament["winner"] = winner["candidate"] if winner else None
        tournament["decision"] = "PROVEN_STATIC_IMPROVEMENT" if winner else "NO_PROVEN_IMPROVEMENT"
        tournament["promotionLevel"] = "BENCH_CANDIDATE" if winner else "STATICALLY_VALIDATED"
        return tournament

    def learn(self, tournament: dict[str, Any]) -> None:
        self.transition("LEARNING")
        for c in tournament.get("candidates", []):
            result = "IMPROVED" if c.get("candidate") == tournament.get("winner") else self._failure_class(c)
            self.memory.record_experiment({
                "at": now(), "mission": self.mission, "candidate": c.get("candidate"), "fingerprint": c.get("sourceSha256"),
                "profile": c.get("profile"), "result": result, "errors": c.get("errors", []), "score": c.get("score"),
                "intelligenceDelta": c.get("intelligenceDelta"), "invalidationConditions": ["new replay evidence", "benchmark version change"]
            })
        self.memory.persist()

    @staticmethod
    def _failure_class(c: dict[str, Any]) -> str:
        errors = " ".join(c.get("errors", [])).lower()
        if c.get("status") != "COMPILED":
            if "syntax" in errors or "loadfile" in errors: return "SYNTAX_FAILURE"
            if "normalize" in errors: return "NORMALIZATION_FAILURE"
            if "missing:" in errors or "forbidden:" in errors: return "PROTECTED_CONTRACT_REGRESSION"
            return "COMPILE_FAILURE"
        if c.get("intelligenceDelta", 0) <= 0: return "NO_MEASURABLE_IMPROVEMENT"
        return "AWAITING_REPLAY_EVIDENCE"

    def kpis(self, tournament: dict[str, Any]) -> dict[str, Any]:
        rows = tournament.get("candidates", [])
        compiled = [r for r in rows if r.get("status") == "COMPILED"]
        improved = [r for r in rows if r.get("intelligenceDelta", 0) > 0]
        kpi = {
            "at": now(), "mission": self.mission, "candidatesPerCycle": len(rows),
            "uniqueHypotheses": len(load(OUT / "HYPOTHESES.json", [])),
            "duplicateRate": self._rate(sum(1 for d in load(OUT / "DESIGNS.json", []) if d.get("duplicate")), len(load(OUT / "DESIGNS.json", []))),
            "compileSuccessRate": self._rate(len(compiled), len(rows)),
            "measurableImprovementRate": self._rate(len(improved), len(rows)),
            "winner": tournament.get("winner"), "decision": tournament.get("decision")
        }
        save(OUT / "KPIS.json", kpi)
        return kpi

    @staticmethod
    def _rate(a: int, b: int) -> float:
        return round(a / b, 4) if b else 0.0

    def meta_audit(self, tournament: dict[str, Any], kpi: dict[str, Any]) -> dict[str, Any]:
        findings = []
        if kpi["duplicateRate"] > 0.25: findings.append("Candidate generator is repeating prior experiments")
        if kpi["compileSuccessRate"] < 0.8: findings.append("Compiler success is below target")
        if not tournament.get("winner"): findings.append("No candidate proved improvement; prioritize new evidence and architecture diversity")
        audit = {"at": now(), "factoryVersion": 1, "findings": findings, "recommendedActions": [
            "ingest new bench/road logs", "expand replay ground truth", "calibrate confidence against outcomes", "retire duplicate mutations"
        ], "selfModificationAuthority": "PROPOSE_ONLY_UNTIL_META_TESTS_PASS"}
        save(OUT / "META-AUDIT.json", audit)
        return audit

    def run(self) -> None:
        discovery = self.discover()
        hypotheses = self.research(discovery)
        designs = self.design(hypotheses)
        tournament = self.build(designs)
        tournament = self.evaluate(tournament)
        tournament = self.rank(tournament)
        self.transition("PUBLISHING")
        save(OUT / "FACTORY-RESULT.json", tournament)
        self.learn(tournament)
        kpi = self.kpis(tournament)
        self.meta_audit(tournament, kpi)
        self.transition("AWAITING_EVIDENCE", "Internal promotion stops at BENCH_CANDIDATE")


if __name__ == "__main__":
    Factory().run()

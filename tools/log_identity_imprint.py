from __future__ import annotations

import csv
import hashlib
import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist-jarvis-factory"
GROUPS = (144, 145, 146, 147)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def candidate_identities() -> list[dict[str, Any]]:
    identities: list[dict[str, Any]] = []
    base = ROOT / "dist-controller-tournament"
    for directory in base.iterdir() if base.exists() else []:
        if not directory.is_dir():
            continue
        lua = next(directory.glob("*.lua"), None)
        luac = next(directory.glob("*.luac"), None)
        manifest_path = directory / "MANIFEST.json"
        if not lua or not luac or not manifest_path.exists():
            continue
        manifest = json.loads(manifest_path.read_text())
        runtime = manifest.get("runtimeIdentity", {})
        token = str(runtime.get("token", "")).lower()
        chunks = runtime.get("chunks", [])
        if not re.fullmatch(r"[0-9a-f]{16}", token) or len(chunks) != 4:
            raise RuntimeError(f"{directory}: missing valid embedded MT12BBID1 identity")
        identity = {
            "schema": "MT12BBID1",
            "controller": manifest.get("candidate", lua.stem),
            "parent": manifest.get("parent"),
            "runtimeToken": token,
            "blackboxGroups": list(GROUPS),
            "numericChunks": chunks,
            "sourceSha256": digest(lua),
            "luacSha256": digest(luac),
            "buildPath": str(directory.relative_to(ROOT)),
            "memorySchema": "AIC9Z-18/24",
            "emitPolicy": runtime.get("emitPolicy"),
        }
        (directory / "IDENTITY.json").write_text(json.dumps(identity, indent=2) + "\n")
        identities.append(identity)
    return identities


def persisted_identities() -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for path in ROOT.glob("public/builds/**/IDENTITY.json"):
        try:
            identity = json.loads(path.read_text())
            token = str(identity.get("runtimeToken", "")).lower()
            if re.fullmatch(r"[0-9a-f]{16}", token):
                identity.setdefault("buildPath", str(path.parent.relative_to(ROOT)))
                out.append(identity)
        except Exception:
            continue
    return out


def numeric_cells(row: list[str]) -> list[int]:
    values: list[int] = []
    for cell in row:
        try:
            values.append(int(round(float(cell.strip()))))
        except Exception:
            continue
    return values


def group_value(row: list[str]) -> tuple[int, int] | None:
    values = numeric_cells(row)
    for index in range(len(values) - 1):
        if values[index] in GROUPS and 0 <= values[index + 1] <= 65535:
            return values[index], values[index + 1]
    return None


def embedded_tokens(path: Path) -> list[dict[str, Any]]:
    hits: list[dict[str, Any]] = []
    chunks: dict[int, int] = {}
    with path.open("r", errors="replace", newline="") as handle:
        for line_number, row in enumerate(csv.reader(handle), 1):
            pair = group_value(row)
            if pair is None:
                continue
            group, value = pair
            chunks[group] = value
            if all(group in chunks for group in GROUPS):
                token = "".join(f"{chunks[group]:04x}" for group in GROUPS)
                if not hits or hits[-1]["token"] != token:
                    hits.append({"token": token, "line": line_number, "chunks": [chunks[g] for g in GROUPS]})
                chunks = {}
    return hits


def fallback_matches(path: Path, identities: list[dict[str, Any]]) -> list[dict[str, Any]]:
    head = path.read_text(errors="ignore")[:32768].lower()
    matches = []
    for identity in identities:
        score = 0
        reasons = []
        for value, weight, label in [
            (identity.get("luacSha256", ""), 100, "luacSha"),
            (identity.get("sourceSha256", ""), 90, "sourceSha"),
            (identity.get("runtimeToken", ""), 80, "runtimeToken"),
            (identity.get("controller", ""), 40, "controller"),
        ]:
            if value and str(value).lower() in head:
                score += weight
                reasons.append(label)
        if score:
            matches.append({"score": score, "identity": identity, "reasons": reasons})
    return sorted(matches, key=lambda item: item["score"], reverse=True)


def classify(path: Path, index: dict[str, dict[str, Any]], identities: list[dict[str, Any]]) -> dict[str, Any]:
    tokens = embedded_tokens(path)
    exact = [{**hit, "identity": index.get(hit["token"])} for hit in tokens if index.get(hit["token"])]
    if exact:
        unique = {hit["token"] for hit in exact}
        return {
            "log": str(path.relative_to(ROOT)),
            "confidence": "EXACT" if len(unique) == 1 else "MULTIPLE",
            "runtimeImprints": exact,
            "match": exact[0]["identity"] if len(unique) == 1 else None,
            "alternatives": [],
        }
    fallback = fallback_matches(path, identities)
    return {
        "log": str(path.relative_to(ROOT)),
        "confidence": "INFERRED" if fallback else "UNKNOWN",
        "runtimeImprints": tokens,
        "match": fallback[0]["identity"] if fallback else None,
        "alternatives": fallback[1:4],
    }


def main() -> None:
    OUT.mkdir(exist_ok=True)
    identities = persisted_identities() + candidate_identities()
    index = {identity["runtimeToken"].lower(): identity for identity in identities if identity.get("runtimeToken")}
    logs = [classify(path, index, identities) for path in sorted((ROOT / "tests/replays").glob("*.csv"))] if (ROOT / "tests/replays").exists() else []
    report = {
        "schema": "MT12BBID1",
        "identities": identities,
        "logs": logs,
        "exactMatches": sum(item["confidence"] == "EXACT" for item in logs),
        "inferredMatches": sum(item["confidence"] == "INFERRED" for item in logs),
        "unknown": sum(item["confidence"] == "UNKNOWN" for item in logs),
    }
    (OUT / "LOG-IDENTITY-ATTRIBUTION.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"identities": len(identities), "logs": len(logs), "exact": report["exactMatches"], "inferred": report["inferredMatches"], "unknown": report["unknown"]}))


if __name__ == "__main__":
    main()

from __future__ import annotations

import csv
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist-jarvis-factory"
MEM = ROOT / "factory/memory"
SKIP_PARTS = {".git", "node_modules", "dist-controller-tournament", "dist-jarvis-factory", "public"}


def save(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n")


def load(path: Path, default: Any) -> Any:
    try:
        return json.loads(path.read_text())
    except Exception:
        return default


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def all_csvs() -> list[Path]:
    result: list[Path] = []
    for path in ROOT.rglob("*.csv"):
        rel = path.relative_to(ROOT)
        if any(part in SKIP_PARTS for part in rel.parts):
            continue
        if path.is_file():
            result.append(path)
    return sorted(result)


def sample(path: Path, limit: int = 12) -> tuple[list[str], list[list[str]]]:
    rows: list[list[str]] = []
    with path.open("r", errors="replace", newline="") as f:
        reader = csv.reader(f)
        for row in reader:
            if row:
                rows.append(row)
            if len(rows) >= limit:
                break
    header = [str(x).strip() for x in rows[0]] if rows else []
    return header, rows


def classify(path: Path, header: list[str], rows: list[list[str]]) -> str:
    text = " ".join(header).lower()
    name = path.name.lower()
    if "gvbb" in name or "blackbox" in name:
        return "BLACKBOX"
    if any(x in text for x in ["gps", "rpm", "rssi", "rqly", "datetime", "telemetry"]):
        return "RADIO_TELEMETRY"
    numeric = 0
    total = 0
    for row in rows[:8]:
        for cell in row:
            total += 1
            try:
                float(cell)
                numeric += 1
            except Exception:
                pass
    if total and numeric / total > 0.8:
        return "BLACKBOX"
    return "UNKNOWN_CSV"


def timestamp_hint(path: Path) -> str | None:
    match = re.search(r"(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)[-_]?(?:([0-2]\d)[-_]?([0-5]\d)[-_]?([0-5]\d))?", path.name)
    if not match:
        return None
    parts = match.groups(default="00")
    return f"{parts[0]}-{parts[1]}-{parts[2]}T{parts[3]}:{parts[4]}:{parts[5]}Z"


def session_key(path: Path, kind: str) -> str:
    stamp = timestamp_hint(path)
    if stamp:
        return stamp[:16]
    stem = re.sub(r"^[0-9a-f]{64}-", "", path.stem.lower())
    stem = re.sub(r"(?:gvbb|blackbox|telemetry|radio|c3ai\w*)", "", stem)
    stem = re.sub(r"[^a-z0-9]+", "-", stem).strip("-")
    return stem or kind.lower()


def identity_index() -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    patterns = ["public/builds/**/IDENTITY.json", "dist-controller-tournament/*/IDENTITY.json"]
    for pattern in patterns:
        for path in ROOT.glob(pattern):
            try:
                record = json.loads(path.read_text())
                token = str(record.get("runtimeToken") or record.get("identityToken") or "").lower()
                if re.fullmatch(r"[0-9a-f]{16}", token):
                    record["identityPath"] = str(path.relative_to(ROOT))
                    out[token] = record
            except Exception:
                pass
    return out


def numeric_cells(row: list[str]) -> list[int]:
    result: list[int] = []
    for cell in row:
        try:
            result.append(int(round(float(cell.strip()))))
        except Exception:
            continue
    return result


def runtime_tokens(path: Path) -> list[str]:
    groups = (144, 145, 146, 147)
    chunks: dict[int, int] = {}
    tokens: list[str] = []
    with path.open("r", errors="replace", newline="") as f:
        for row in csv.reader(f):
            vals = numeric_cells(row)
            for i in range(len(vals) - 1):
                if vals[i] in groups and 0 <= vals[i + 1] <= 65535:
                    chunks[vals[i]] = vals[i + 1]
                    if all(g in chunks for g in groups):
                        token = "".join(f"{chunks[g]:04x}" for g in groups)
                        if token not in tokens:
                            tokens.append(token)
                        chunks = {}
                    break
    return tokens


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    identities = identity_index()
    unique: dict[str, dict[str, Any]] = {}
    duplicates: list[dict[str, str]] = []
    normalized_logs: list[dict[str, Any]] = []

    for path in all_csvs():
        file_hash = digest(path)
        rel = str(path.relative_to(ROOT))
        if file_hash in unique:
            duplicates.append({"duplicate": rel, "canonical": unique[file_hash]["path"], "sha256": file_hash})
            continue
        header, rows = sample(path)
        kind = classify(path, header, rows)
        tokens = runtime_tokens(path)
        matched = [identities[t] for t in tokens if t in identities]
        identity = matched[0] if len({str(x.get("runtimeToken") or x.get("identityToken")) for x in matched}) == 1 and matched else None
        confidence = "EXACT" if identity else "UNATTRIBUTED_HISTORICAL"
        record = {
            "path": rel,
            "sha256": file_hash,
            "bytes": path.stat().st_size,
            "kind": kind,
            "sessionKey": session_key(path, kind),
            "timestampHint": timestamp_hint(path),
            "header": header[:80],
            "runtimeTokens": tokens,
            "identity": identity,
            "identityConfidence": confidence,
        }
        unique[file_hash] = record
        normalized_logs.append({
            "log": rel,
            "runtimeToken": tokens[0] if tokens else None,
            "match": ({
                "identityToken": identity.get("runtimeToken") or identity.get("identityToken"),
                "controller": identity.get("controller"),
                "sourceSha256": identity.get("sourceSha256"),
                "luacSha256": identity.get("luacSha256"),
                "buildPath": identity.get("buildPath"),
            } if identity else None),
            "confidence": confidence,
            "kind": kind,
            "sessionKey": record["sessionKey"],
        })

    sessions: dict[str, dict[str, Any]] = {}
    for record in unique.values():
        s = sessions.setdefault(record["sessionKey"], {"sessionKey": record["sessionKey"], "radio": [], "blackbox": [], "other": [], "identities": []})
        bucket = "radio" if record["kind"] == "RADIO_TELEMETRY" else "blackbox" if record["kind"] == "BLACKBOX" else "other"
        s[bucket].append(record["path"])
        if record["identity"]:
            token = record["identity"].get("runtimeToken") or record["identity"].get("identityToken")
            if token and token not in s["identities"]:
                s["identities"].append(token)
    session_rows = sorted(sessions.values(), key=lambda x: x["sessionKey"])
    for s in session_rows:
        s["paired"] = bool(s["radio"] and s["blackbox"])
        s["attribution"] = "EXACT" if len(s["identities"]) == 1 else "MIXED" if len(s["identities"]) > 1 else "HISTORICAL_UNKNOWN"

    catalog = {
        "schema": 2,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "uniqueLogs": len(unique),
        "duplicates": len(duplicates),
        "sessions": len(session_rows),
        "pairedSessions": sum(1 for s in session_rows if s["paired"]),
        "exactlyAttributed": sum(1 for r in unique.values() if r["identityConfidence"] == "EXACT"),
        "logs": list(unique.values()),
        "duplicateRecords": duplicates,
        "sessionRecords": session_rows,
    }
    save(OUT / "HISTORICAL-LOG-CATALOG.json", catalog)
    save(OUT / "LOG-IDENTITY-ATTRIBUTION.json", {
        "schema": 2,
        "historicalFullScan": True,
        "knownIdentities": len(identities),
        "logs": normalized_logs,
        "exactMatches": sum(1 for x in normalized_logs if x["confidence"] == "EXACT"),
        "unknown": sum(1 for x in normalized_logs if x["confidence"] != "EXACT"),
    })

    memory = load(MEM / "historical-log-index.json", {"schema": 2, "logs": {}, "sessions": {}})
    for file_hash, record in unique.items():
        memory["logs"][file_hash] = {
            "path": record["path"], "kind": record["kind"], "sessionKey": record["sessionKey"],
            "identityConfidence": record["identityConfidence"], "runtimeTokens": record["runtimeTokens"],
        }
    for session in session_rows:
        memory["sessions"][session["sessionKey"]] = session
    memory["lastFullReingestAt"] = catalog["generatedAt"]
    memory["uniqueLogCount"] = len(memory["logs"])
    save(MEM / "historical-log-index.json", memory)
    print(json.dumps({k: catalog[k] for k in ["uniqueLogs", "duplicates", "sessions", "pairedSessions", "exactlyAttributed"]}))


if __name__ == "__main__":
    main()

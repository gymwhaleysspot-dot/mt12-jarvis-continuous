from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
GROUPS = (144, 145, 146, 147)


def load_identities() -> dict[str, dict[str, Any]]:
    identities: dict[str, dict[str, Any]] = {}
    for path in ROOT.glob("public/builds/**/IDENTITY.json"):
        try:
            record = json.loads(path.read_text())
            token = str(record.get("runtimeToken") or record.get("token") or "").lower()
            if re.fullmatch(r"[0-9a-f]{16}", token):
                record["identityPath"] = str(path.relative_to(ROOT))
                identities[token] = record
        except Exception:
            continue
    for path in ROOT.glob("dist-controller-tournament/*/IDENTITY.json"):
        try:
            record = json.loads(path.read_text())
            token = str(record.get("runtimeToken") or "").lower()
            if re.fullmatch(r"[0-9a-f]{16}", token):
                record["identityPath"] = str(path.relative_to(ROOT))
                identities[token] = record
        except Exception:
            continue
    return identities


def numbers(row: list[str]) -> list[int]:
    out: list[int] = []
    for cell in row:
        try:
            value = int(round(float(cell.strip())))
        except Exception:
            continue
        out.append(value)
    return out


def extract_group_value(row: list[str]) -> tuple[int, int] | None:
    # Native blackbox rows contain numeric group/value fields. Search adjacent
    # numeric cells so this remains compatible with timestamp-prefixed CSVs.
    vals = numbers(row)
    for i in range(len(vals) - 1):
        if vals[i] in GROUPS and 0 <= vals[i + 1] <= 65535:
            return vals[i], vals[i + 1]
    return None


def tokens_from_log(path: Path) -> list[dict[str, Any]]:
    seen: list[dict[str, Any]] = []
    chunks: dict[int, int] = {}
    with path.open("r", errors="replace", newline="") as handle:
        reader = csv.reader(handle)
        for line_no, row in enumerate(reader, 1):
            pair = extract_group_value(row)
            if not pair:
                continue
            group, value = pair
            chunks[group] = value
            if all(group in chunks for group in GROUPS):
                token = "".join(f"{chunks[group]:04x}" for group in GROUPS)
                if not seen or seen[-1]["token"] != token:
                    seen.append({"token": token, "line": line_no, "chunks": [chunks[g] for g in GROUPS]})
                chunks = {}
    return seen


def attribute(path: Path, identities: dict[str, dict[str, Any]]) -> dict[str, Any]:
    tokens = tokens_from_log(path)
    matches = []
    for hit in tokens:
        identity = identities.get(hit["token"])
        matches.append({**hit, "matched": bool(identity), "identity": identity})
    exact = [m for m in matches if m["matched"]]
    status = "EXACT" if exact and len({m["token"] for m in exact}) == 1 else "MULTIPLE" if exact else "UNKNOWN"
    return {
        "log": str(path.relative_to(ROOT) if path.is_relative_to(ROOT) else path),
        "schema": "MT12BBID1",
        "status": status,
        "matches": matches,
        "resolvedIdentity": exact[0]["identity"] if status == "EXACT" else None,
    }


def main() -> None:
    paths = [Path(x) for x in sys.argv[1:]]
    if not paths:
        paths = sorted((ROOT / "tests/replays").glob("*.csv")) if (ROOT / "tests/replays").exists() else []
    identities = load_identities()
    report = {
        "schema": "MT12BBID1",
        "knownIdentities": len(identities),
        "logs": [attribute(path if path.is_absolute() else ROOT / path, identities) for path in paths if (path if path.is_absolute() else ROOT / path).is_file()],
    }
    out = ROOT / "dist-jarvis-factory/LOG-IDENTITY-ATTRIBUTION.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()

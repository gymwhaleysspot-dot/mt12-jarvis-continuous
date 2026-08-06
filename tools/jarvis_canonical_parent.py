from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUTHORITY = ROOT / "factory/canonical-controller.json"
STALE_SOURCE = {"340788ea2a3f4a2bffb996f52828bae957c14494e5063f5140889c80a83f23a0"}
STALE_LUAC = {"caa07d88ad896bcffd65aac6020be2b410a16332367a933db8fc876f5d25283a"}
REQUIRED = (
    "local function zBrain", "V[704]", "X[46]", "V[720]=ac",
    "setgv(3,m_min(V[35],ac))", "V[740+km]", "V[760+km]",
)
FORBIDDEN = ("setgv(3,V[35])",)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def resolve() -> tuple[str, Path]:
    authority = json.loads(AUTHORITY.read_text())
    name = authority["release"]
    base = ROOT / "public/builds/releases" / name
    manifest = json.loads((base / "MANIFEST.json").read_text())
    source = base / manifest["source"]
    deploy = base / manifest["deploy"]
    if not source.is_file() or not deploy.is_file():
        raise RuntimeError(f"canonical controller files missing: {name}")
    source_sha, luac_sha = digest(source), digest(deploy)
    if source_sha in STALE_SOURCE or luac_sha in STALE_LUAC:
        raise RuntimeError("canonical resolver selected stale a17y-equivalent artifact")
    if source_sha != authority["sourceSha256"] or luac_sha != authority["luacSha256"]:
        raise RuntimeError("canonical controller hash does not match immutable authority")
    text = source.read_text()
    missing = [token for token in REQUIRED if token not in text]
    forbidden = [token for token in FORBIDDEN if token in text]
    if missing or forbidden:
        raise RuntimeError(f"canonical lineage-floor failure missing={missing} forbidden={forbidden}")
    return name, source

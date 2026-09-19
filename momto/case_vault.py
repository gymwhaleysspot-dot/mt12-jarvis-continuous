from __future__ import annotations

import base64
import hashlib
import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from cryptography.fernet import Fernet

class VaultError(RuntimeError):
    pass

def generate_key() -> str:
    return Fernet.generate_key().decode("ascii")

class CaseVault:
    """Encrypted, local-only MomTo case vault.

    Every record is encrypted before it is written to SQLite, including
    document bytes and metadata. The key is supplied outside the repository.
    """
    def __init__(self, root: str | Path | None = None, key: str | None = None):
        self.root = Path(root or os.environ.get("MOMTO_VAULT_DIR", "vault")).expanduser()
        self.root.mkdir(parents=True, exist_ok=True)
        try:
            self.root.chmod(0o700)
        except OSError:
            pass
        raw_key = key or os.environ.get("MOMTO_VAULT_KEY", "")
        if not raw_key:
            raise VaultError("MOMTO_VAULT_KEY is required; create one with `momto vault key`.")
        try:
            self.fernet = Fernet(raw_key.encode("ascii"))
        except Exception as exc:
            raise VaultError("MOMTO_VAULT_KEY is not a valid Fernet key.") from exc
        self.db_path = self.root / "vault.sqlite3"
        self._init_db()

    def _db(self) -> sqlite3.Connection:
        db = sqlite3.connect(self.db_path)
        db.execute("PRAGMA foreign_keys=ON")
        return db

    def _init_db(self) -> None:
        with self._db() as db:
            db.execute("""CREATE TABLE IF NOT EXISTS records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                kind TEXT NOT NULL,
                digest TEXT NOT NULL,
                ciphertext BLOB NOT NULL,
                created_at TEXT NOT NULL
            )""")
            db.execute("CREATE INDEX IF NOT EXISTS idx_records_kind ON records(kind)")
            db.commit()

    def _seal(self, value: Any) -> bytes:
        return self.fernet.encrypt(json.dumps(value, ensure_ascii=False, sort_keys=True).encode("utf-8"))

    def _open(self, ciphertext: bytes) -> Any:
        return json.loads(self.fernet.decrypt(ciphertext).decode("utf-8"))

    def _put(self, kind: str, payload: dict[str, Any], digest_source: bytes | None = None) -> int:
        raw = digest_source if digest_source is not None else json.dumps(payload, ensure_ascii=False, sort_keys=True).encode("utf-8")
        digest = hashlib.sha256(raw).hexdigest()
        sealed = self._seal(payload)
        now = datetime.now(timezone.utc).isoformat()
        with self._db() as db:
            existing = db.execute("SELECT id FROM records WHERE kind=? AND digest=?", (kind, digest)).fetchone()
            if existing:
                return int(existing[0])
            cur = db.execute("INSERT INTO records(kind,digest,ciphertext,created_at) VALUES(?,?,?,?)", (kind, digest, sealed, now))
            db.commit()
            return int(cur.lastrowid)

    def ingest_document(self, path: str | Path) -> dict[str, Any]:
        p = Path(path).expanduser().resolve()
        if not p.is_file():
            raise VaultError(f"Document not found: {p}")
        data = p.read_bytes()
        digest = hashlib.sha256(data).hexdigest()
        payload = {
            "filename": p.name, "original_path": str(p), "sha256": digest,
            "size_bytes": len(data), "content_b64": base64.b64encode(data).decode("ascii"),
        }
        record_id = self._put("document", payload, digest_source=data)
        return {"id": record_id, "kind": "document", "filename": p.name,
                "sha256": digest, "size_bytes": len(data), "encrypted": True}

    def add_evidence(self, title: str, summary: str = "", source: str = "",
                     evidence_type: str = "record", supports: str = "",
                     contradicts: str = "", reference: str = "") -> int:
        return self._put("evidence", {"title": title, "summary": summary, "source": source,
            "evidence_type": evidence_type, "supports": supports, "contradicts": contradicts, "reference": reference})

    def add_person(self, label: str, role: str = "", notes: str = "") -> int:
        return self._put("person", {"label": label, "role": role, "notes": notes})

    def add_relationship(self, from_id: int, to_id: int, relation: str,
                         evidence_ref: str = "", confidence: str = "unrated") -> int:
        return self._put("relationship", {"from_id": from_id, "to_id": to_id,
            "relation": relation, "evidence_ref": evidence_ref, "confidence": confidence})

    def add_dna_observation(self, provider: str, match_label: str = "",
                            relationship: str = "", centimorgans: float | None = None,
                            shared_matches: int = 0, notes: str = "") -> int:
        return self._put("dna_observation", {"provider": provider, "match_label": match_label,
            "relationship": relationship, "centimorgans": centimorgans,
            "shared_matches": shared_matches, "notes": notes})

    def add_search(self, source: str, query: str, result: str = "",
                   usefulness: str = "unknown", reference: str = "", next_action: str = "") -> int:
        return self._put("search", {"source": source, "query": query, "result": result,
            "usefulness": usefulness, "reference": reference, "next_action": next_action})

    def add_hypothesis(self, title: str, confidence: str = "unrated",
                       unknowns: str = "", next_evidence: str = "") -> int:
        return self._put("hypothesis", {"title": title, "confidence": confidence,
            "unknowns": unknowns, "next_evidence": next_evidence})

    def add_task(self, title: str, priority: str = "normal", notes: str = "") -> int:
        return self._put("task", {"title": title, "priority": priority, "notes": notes})

    def list_records(self, kind: str | None = None) -> list[dict[str, Any]]:
        query = "SELECT id,kind,digest,created_at,ciphertext FROM records"
        args: tuple[Any, ...] = ()
        if kind:
            query += " WHERE kind=?"
            args = (kind,)
        query += " ORDER BY id"
        with self._db() as db:
            rows = db.execute(query, args).fetchall()
        return [{"id": int(row[0]), "kind": row[1], "digest": row[2],
                 "created_at": row[3], "payload": self._open(row[4])} for row in rows]

    def summary(self) -> dict[str, Any]:
        with self._db() as db:
            rows = db.execute("SELECT kind,COUNT(*) FROM records GROUP BY kind ORDER BY kind").fetchall()
            total = db.execute("SELECT COUNT(*) FROM records").fetchone()[0]
        return {"encrypted": True, "local_only": True, "vault": str(self.root),
                "total_records": int(total), "by_kind": {row[0]: int(row[1]) for row in rows}}

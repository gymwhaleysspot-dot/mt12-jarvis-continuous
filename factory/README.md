# Master Factory Lineage

The factory reconstructs the canonical A15YA seed, then processes every generation directory in lexical order. Each accepted child becomes the only parent for the next generation.

A generation directory contains:

- `contract.json` — parent, retained requirements, new capabilities and forbidden regressions
- `transform.mjs` — deterministic parent-to-child engineering transform with repair-round support

The factory never replaces the last verified parent with a rejected candidate. Candidate failures are recorded, alternative repair rounds are attempted, and all diagnostics are published as workflow artifacts.

The canonical seed belongs at `factory/seed/a15ya.lua.gz.b64`. It is decoded, compiled with Lua 5.3, normalized for MT12, hashed and audited before any descendant is attempted.

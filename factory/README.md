# Master Factory Lineage

The factory reconstructs the canonical A15YA seed, then processes every generation directory in lexical order. Each accepted child becomes the only parent for the next generation.

A generation directory contains:

- `contract.json` — parent, retained requirements, new capabilities and forbidden regressions
- `transform.mjs` — deterministic parent-to-child engineering transform with repair-round support

The factory never replaces the last verified parent with a rejected candidate. Candidate failures are recorded, alternative repair rounds are attempted, and all diagnostics are published as workflow artifacts.

The canonical seed belongs at `factory/seed/a15ya.lua.gz.b64`. It is decoded, compiled with Lua 5.3, normalized for MT12, hashed and audited before any descendant is attempted.

# Jarvis Complete Autonomous Factory

The complete loop is:

Observe → diagnose → research → hypothesize → design → build → test → adversarial test → rank → publish → await physical evidence → learn.

It implements all 17 factory upgrades: unified mission states; hourly/daily/weekly research policy; hypothesis-driven exploit/explore/repair/compression populations; permanent intelligence benchmarks; adversarial telemetry; separated builder/judge/red-team roles; evidence, experiment and design memories; failure learning and duplicate avoidance; champion/challenger/experimental tracks; evidence-based promotion; directed tests and cache keys; parallel evaluation; LUAC observability requirements; causal explanation audits; confidence-calibration audits; factory self-audits; and progress KPIs.

Static analysis and simulation may promote a candidate only as far as `BENCH_CANDIDATE`. `BENCH_VALIDATED`, `ROAD_VALIDATED`, and `CHAMPION` require hash-bound physical evidence.

# MT12 Jarvis Continuous

Autonomous experimental evolution factory for RadioMaster MT12 / EdgeTX Lua controllers.

Jarvis continuously generates multiple controller architectures, compiles them with the MT12 Lua 5.3 toolchain, scores them, synthesizes the strongest ideas, enforces a hard bytecode budget, and advances only an eligible experimental evolution parent. The defended canonical controller is never automatically replaced.

## Current state

- **Canonical floor:** `jr514f`
- **Active experimental evolution parent:** `jrw6-537`
- **Current parent normalized size:** **85,416 bytes**
- **Hard normalized LUAC ceiling:** **87,000 bytes**
- **Current headroom:** **1,584 bytes**
- **Authority:** experimental / road-unproven until real vehicle validation
- **Autonomous cadence:** every **15 minutes**, with overlap protection

The active evolution pointer is stored in `factory/evolution-controller.json`.

## Evolution model

Jarvis uses a permanent resource-aware cycle:

**reclaim → rethink → build → compete → synthesize → compress → verify → inherit**

Each generation starts from the current JRW6 evolution parent while preserving `jr514f` as the defended canonical floor.

### 1. Pre-build reclamation

Before generating new candidates, Jarvis searches the active parent for behavior-equivalent reductions such as constant folding, dead locals, dead helpers, duplicate identity fragments, and other statically provable redundancy.

A reclamation change is accepted only when it:

1. loads under Lua 5.3,
2. preserves the protected controller contract,
3. normalizes with the MT12 toolchain,
4. and produces a strictly smaller normalized LUAC.

Live features are not removed merely to save memory.

### 2. Six competing architectures

Each Complete Rewrite generation produces six novel candidates:

- **JRW1 — conservative / dropout-state architecture**
- **JRW2 — traction-state architecture**
- **JRW3 — jump / airborne / landing architecture**
- **JRW4 — truth-fusion / observability architecture**
- **JRW5 — ABS / combined-control architecture**
- **JRW6 — synthesis architecture**, built from the strongest lessons across the portfolio and prior tournament outcomes

Candidates must be source-novel and bytecode-novel. Historical duplicates are rejected.

### 3. Tournament and intelligence scoring

Jarvis compares candidate architecture gains, risk, normalized size, and resource efficiency. Current synthesis scoring explicitly values improvements in:

- traction control,
- truth / observability,
- sensor-dropout recovery,
- jump / landing classification,
- ABS behavior,
- and multi-system composition.

A candidate can compile successfully and still be ineligible for promotion if it exceeds the byte ceiling or spends too many bytes for too little new intelligence.

### 4. Intelligence per byte

The hard ceiling is always **87,000 normalized bytes**.

Jarvis tracks:

- bytes reclaimed before generation,
- bytes spent versus the parent,
- bytes spent after reclamation,
- remaining headroom,
- intelligence gained per 100 growth bytes,
- synthesis byte budget,
- retained reclaimed capacity,
- and promotion-efficiency eligibility.

The synthesis lane has a retained-capacity policy so JRW6 is not allowed to reclaim space and immediately consume it all without justification.

## #536 compact-synthesis milestone

Rewrite Factory **#536 attempt 2** validated the compact retained-capacity design after a tooling recursion bug was repaired.

From parent `jrw6-534`:

- Parent: **86,593 B**
- Verified pre-build seed: **86,534 B**
- Pre-build reclamation: **59 B**
- JRW6 winner: **85,620 B**
- Total reduction versus parent: **973 B**
- Headroom after synthesis: **1,380 B**
- Intelligence delta: **+19**
- Synthesis byte budget: **160 B**
- Synthesis stayed within budget: **yes**
- Promotion eligible: **yes**

This was the first generation where compact synthesis did more than preserve reclaimed space: it substantially reduced the complete winning controller while retaining the full synthesis score.

The next autonomous generation, **#537**, built on #536 and reduced JRW6 again to **85,416 B**, leaving **1,584 B** of headroom. `jrw6-537` is the current experimental evolution parent.

## Promotion rules

Experimental evolution advances only when the candidate satisfies the factory gates. Current required conditions include:

- synthesis winner,
- Lua 5.3 compilation,
- MT12 normalization,
- defended canonical floor preserved,
- source and bytecode novelty,
- zero candidate errors,
- normalized size ≤ 87,000 bytes,
- and resource-efficiency eligibility.

**Experimental promotion does not automatically promote the canonical controller.** Real road testing is still required before treating an experimental JRW generation as proven vehicle behavior.

## Autonomous scheduler

`.github/workflows/jarvis-autonomous-evolution.yml` checks every 15 minutes:

```text
*/15 * * * *
```

The scheduler refuses to launch a duplicate generation while the Complete Rewrite Factory is already queued or running. It can also launch a recovery generation after a failed factory cycle once repaired logic is present on `main`.

## Complete Rewrite Factory

Main workflow:

`.github/workflows/jarvis-complete-rewrite-factory.yml`

Core pipeline:

1. synchronize current Jarvis state,
2. install deterministic Lua 5.3 / MT12 toolchain,
3. validate canonical and evolution authority,
4. refresh accepted research/planner evidence,
5. perform pre-build reclamation,
6. generate six novel controller architectures,
7. compile and normalize every candidate,
8. run tournament and resource-efficiency scoring,
9. reject duplicates, over-budget builds, and inefficient promotion candidates,
10. publish the immutable generation,
11. advance the experimental evolution parent only when eligible,
12. persist the generation and pointer atomically,
13. upload the complete workflow artifact.

## MT12 compile contract

Deployment uses normalized Lua 5.3 bytecode. The repository toolchain uses the proven MT12 compilation/normalization path under `toolchain/compile_mt12.sh`.

Only the final normalized `.luac` is intended for deployment to the RadioMaster MT12.

## Build artifacts

Each published rewrite mission under `public/builds/rewrite-<run>-<attempt>/` contains generation evidence such as:

- `TOURNAMENT.json`
- `BUILD-MANIFEST.json`
- `REWRITE-CONTRACT.json`
- `EXPERIMENT-PLAN.json`
- `PREBUILD-RECLAIM.json`
- candidate Lua source
- raw Lua 5.3 bytecode
- normalized MT12 `.luac`
- per-candidate manifests and hashes

The workflow artifact contains the same generation evidence for inspection and download.

## Research boundary

Jarvis can ingest verified external research as **planner evidence**, but external findings do not directly mutate the controller. Research must pass confidence/policy checks and all resulting controller changes still go through the normal experimental compile, novelty, resource, tournament, and promotion gates.

## Important limitation

Jarvis tournament results are currently **static self-evaluation**, not a substitute for real vehicle testing. A higher tournament score means the candidate passed Jarvis's current structural and resource model; it does not by itself prove better traction, ABS, jump detection, reliability, or driving behavior on the car.

That is why the active JRW parent remains explicitly **experimental / road-unproven** until validated with real MT12 telemetry and drive logs.

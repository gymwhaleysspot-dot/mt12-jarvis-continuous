# A17Y Autonomous Engineering Director

The Director is the intelligence layer above the deterministic RC Engineering OS.

## Closed loop

1. Observe the protected A17Y parent, replay logs and persistent engineering memory.
2. Diagnose the highest-value evidence-supported weakness.
3. Return **NO CHANGE RECOMMENDED** when confidence is below the configured threshold.
4. Form competing causal and falsifiable hypotheses.
5. Build bounded candidates from exact source patches.
6. Compile, recursively normalize and test every candidate through RCOS.
7. Run an adversarial safety and evidence audit.
8. Repair only implementation failures; disproven hypotheses are remembered and retired.
9. Select no winner unless a candidate clears deterministic, replay, confidence, safety and evidence gates.
10. Persist successes, failures and lessons for future generations.

## Authority boundary

AI models may diagnose, hypothesize, design, repair and explain. They cannot override:

- the protected-parent SHA;
- Lua 5.3 syntax;
- MT12 4/4/4/4/4 normalization;
- the 87,000-byte limit;
- protected source contracts;
- deterministic trace evidence;
- the promotion ceiling.

The Director can automatically reach **REPLAY VERIFIED**. Bench and road verification remain required before any child may replace `a17y.lua`.

## Automatic operation

The workflow runs:

- daily;
- when A17Y, replay logs, the deterministic harness, toolchain or Director policy changes;
- whenever manually dispatched from GitHub or the web console.

Engineering memory is committed to `director/memory.json`. Candidate source and deploy bytecode are distributed only as workflow artifacts; the trusted parent is never overwritten automatically.

# A17Z Clean-Sheet Rewrite Contract

A17Z is a new controller generation, not an A17Y patch or label bump.

## Required architecture

1. One unified closed-loop intelligence core owns perception, state estimation, causal reasoning, intervention planning, learning, and explanation.
2. GPS, RPM, steering, throttle, brake, gyro, receiver health, and dropout evidence enter one observability model with confidence and disagreement tracking.
3. TC, ABS, jump/airborne, rough-surface, dropout, launch, and recovery decisions share the same causal state rather than independent competing brains.
4. Learning is confidence-bounded, reversible, persistent-schema compatible, and never allowed to weaken fail-open behavior.
5. Logging is produced from the same causal state used for control, including reason, evidence, confidence, selected intervention, expected result, and observed outcome.
6. Mood, personality, voice, dashboard, 3-page UI, blackbox compatibility, car-off guard, CH15/CH16 monitoring, GVar mapping, MT12-compatible io.read(fileHandle,...), and memory compatibility remain present.
7. TCA remains 1024-scale pass-through. No channel, switch, GVar, throttle, brake, or gyro contract may silently change.

## Rewrite evidence gates

A candidate cannot be named A17Z unless all are true:

- Source-level architecture differs materially from A17Y.
- The old neural/evolution/gate/condition/classifier orchestration is replaced by the unified core rather than merely wrapped or renamed.
- A machine-generated architecture report identifies removed legacy coordination paths and the new single decision path.
- Lua 5.3 syntax passes.
- MT12 normalization passes.
- Normalized bytecode is within the explicitly approved radio ceiling.
- Parent and candidate protected-contract checks pass.
- Replay compares outputs and causal explanations.
- Dashboard and source header both identify A17Z.
- The artifact remains experimental until bench and road evidence return.

## Naming correction

The existing one-line blackbox-channel build is A17Y-OBS1. It is not A17Z.

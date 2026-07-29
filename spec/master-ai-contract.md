# MT12 Jarvis Master AI Contract

The Master AI evolves one RadioMaster MT12 / EdgeTX Lua 5.3 controller lineage inspired by the engineering ideas proven in A15XQ. A15XQ is reference-only; generated source must be a clean implementation.

## Required controller systems

- Truth MPH and Truth RPM with bounded GPS/RPM trust and lag handling.
- Smooth traction control with no abrupt throttle steps.
- Smooth ABS with brake-intent gating and no static braking.
- Adaptive gyro command with CH3 preserved.
- Risk arbitration and torque-governor behavior.
- Fail-open behavior when control evidence is invalid or uncertain.
- Continuous bounded learning that never corrupts control output.
- Car-off guard and staged startup.
- Explainable event state: evidence, confidence, reason and outcome.
- MT12 GVar contract: GV7/TCT full pass-through is 1024; CH15 monitors TCT; CH16 monitors GYR.
- EdgeTX return table with init, run and background.

## Hard promotion gates

1. Lua 5.3 syntax must compile with `luac5.3 -s`.
2. Desktop bytecode must normalize to MT12 4/4/4/4/4 format.
3. Final normalized artifact must be no larger than 88,944 bytes.
4. Source must contain the required controller contracts.
5. Outputs must remain bounded and fail open on invalid sensing.
6. Every generation must include engineering notes and measurable intended improvement.
7. A failed candidate is retained as evidence but never promoted to `generations/accepted`.

## Autonomous behavior

Each scheduled cycle reads the latest accepted generation, latest reports and this contract. It asks a cloud language model to produce exactly one candidate. The candidate is compiled, normalized and gated. Passing candidates are promoted; failing candidates are archived with the exact failure report. The system never edits GitHub workflow permissions or secrets and never deploys directly to a radio.

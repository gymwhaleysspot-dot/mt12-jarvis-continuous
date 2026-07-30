# MT12 A15XQ Lineage Factory Contract

The factory evolves the complete hardware-proven A15XQ controller lineage. It must not replace A15XQ with a clean-room miniature, toy controller, feature sketch, or source generated only to satisfy keyword checks.

## Required lineage source

- Canonical seed: `baselines/a15xq.lua`.
- Every candidate must be produced from the canonical seed or the latest accepted direct descendant.
- Mutations must be bounded and recorded in an engineering manifest.
- Unchanged systems must remain source-equivalent in behavior.
- A candidate with missing lineage source is blocked, not synthesized from scratch.

## Required preserved systems

- Truth MPH and Truth RPM with GPS/RPM trust, lag handling, learned RPM calibration and GPS coast/lost behavior.
- Full smooth traction control, launch handling and TCT 1024 pass-through foundation.
- Full ABS intervention with brake-intent gating, lock learning and no static braking.
- Adaptive gyro, SXP, AGR, TCA, SRF, BTL, BMX, TCT and ECU GVar output contract.
- Risk arbitration and torque governor.
- SuperBrain decision path, neural inference, online bounded training and outcome learning.
- Persistent `/LOGS/aicmem.csv` loading and saving using MT12-compatible `io.read(fileHandle, ...)`.
- Mood, personality, phrase scoring, voice queue and learned phrase selection.
- Blackbox logging, burst logging, event reasons, unsafe snapshots and session summaries.
- Full dashboard and live control/AI diagnostics.
- Surface profiles, gear logic, receiver-quality handling, fail-open recovery and staged startup.
- Virtual-air/jump evidence, wheelspin separation, landing outcome and retrigger protection.
- Car-off guard and safe GVar reset.
- EdgeTX return table with `init`, `run` and `background`.

## Hard promotion gates

1. Candidate must declare its direct parent and mutation manifest.
2. Lua 5.3 source must parse and compile with `luac5.3 -s`.
3. Desktop bytecode must normalize to the MT12 4/4/4/4/4 format.
4. Final normalized artifact must be no larger than 88,944 bytes unless the configured ceiling is explicitly changed.
5. A candidate must pass feature-parity gates for every preserved subsystem above.
6. A candidate must retain MT12 file I/O compatibility and contain no `fileHandle:read()` calls.
7. TCT full pass-through must remain 1024; no 0–100 interpretation is permitted.
8. Outputs must remain bounded, smooth and fail open on invalid sensing.
9. Simulation must test launch, braking, GPS loss, receiver drops, wheelspin, jumps, landing, reconnect and persistent-memory corruption.
10. Candidates substantially smaller than the lineage without a verified equivalent-code explanation are rejected as probable feature loss.
11. Every accepted generation must include source, normalized LUAC, byte count, parent hash, feature-parity report, simulation report and intended improvement.
12. Failed candidates remain evidence and never enter the download vault.

## Autonomous behavior

Each scheduled cycle reads the canonical seed, latest accepted generation, reports and this contract. It performs one bounded mutation or equivalent optimization, then runs parity, syntax, normalization, size and behavioral gates. The factory never deploys directly to the radio and never promotes a candidate merely because a simplified simulator gives it a high score.

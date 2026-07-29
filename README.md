# MT12 Jarvis Continuous

A phone-first engineering workbench for RadioMaster MT12 / EdgeTX Lua controllers.

## Goals

- A15XQ-inspired controller architecture without silently treating legacy source as the new implementation.
- CSV telemetry and blackbox log viewer.
- Explainable event analysis for TC, ABS, GPS/RPM disagreement, launches, drops and virtual-air candidates.
- Built-in controller architect that generates complete Lua source from selected systems and tuning intent.
- Real Lua 5.3 stripped compilation in GitHub Actions.
- MT12 32-bit bytecode normalization.
- Hard deploy ceiling of 88,944 bytes by default.

## Build flow

1. Generate or edit Lua in the web app.
2. Store a GitHub classic token locally in the browser.
3. Queue the source to `builds/queue/<name>.lua`.
4. GitHub Actions compiles with Lua 5.3, normalizes for MT12, checks size and writes:
   - `builds/output/<name>.luac`
   - `builds/reports/<name>.txt`
5. Download only the final normalized `.luac`.

## Safety contract

- TCT full pass-through is 1024, not 100.
- CH3 gyro is preserved.
- CH15 is TCT monitor.
- CH16 is GYR monitor.
- Fail-open on uncertain sensor/control state.
- No browser-generated fake bytecode.
- Raw desktop `.luac` is never the deploy artifact.

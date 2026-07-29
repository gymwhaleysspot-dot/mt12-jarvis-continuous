# MT12 Jarvis Continuous

A phone-first engineering workbench and autonomous cloud AI programmer for RadioMaster MT12 / EdgeTX Lua controllers.

## Master AI Programmer

The repository contains an hourly GitHub Actions engineering loop in `.github/workflows/master-ai-continuous.yml`.

Each cycle:

1. Reads the latest accepted controller, engineering contract and recent failure reports.
2. Calls a cloud language model through the OpenAI Responses API.
3. Generates one complete loadable Lua 5.3 controller candidate.
4. Runs deterministic contract checks.
5. Compiles with `luac5.3 -s`.
6. Normalizes desktop bytecode to MT12 4/4/4/4/4 format.
7. Enforces the 88,944-byte ceiling.
8. Promotes only passing generations to `generations/accepted/`.
9. Archives rejected source and exact failure evidence in `reports/`.

The autonomous loop does not deploy directly to a radio and cannot bypass its promotion gates.

## Required GitHub configuration

Add this repository secret:

- `OPENAI_API_KEY` — server-side OpenAI API key used only by GitHub Actions.

Optional repository variable:

- `OPENAI_MODEL` — model identifier. Default: `gpt-5`.

Then run **Actions → MT12 Master AI Continuous → Run workflow** once. The schedule continues at minute 17 of every hour. Scheduled GitHub Actions may start later than the exact cron minute during platform load.

## Controller goals

- A15XQ-inspired controller architecture without silently treating legacy source as the new implementation.
- Truth MPH and Truth RPM with sensor confidence and lag handling.
- Smooth traction control, ABS, adaptive gyro and risk arbitration.
- Torque-governor behavior and fail-open safety.
- Continuous bounded learning and explainable event outcomes.
- CSV telemetry and blackbox log viewer.
- Real Lua 5.3 compilation and MT12 normalization.

## Manual web build flow

1. Generate or edit Lua in the web app.
2. Store a GitHub token locally in the browser.
3. Queue the source to `builds/queue/<name>.lua`.
4. GitHub Actions writes the normalized build and report.
5. Download only the final normalized `.luac`.

## Safety contract

- TCT full pass-through is 1024, not 100.
- CH3 gyro is preserved.
- CH15 is TCT monitor.
- CH16 is GYR monitor.
- Fail open on uncertain sensor or control state.
- No browser-generated fake bytecode.
- Raw desktop `.luac` is never the deploy artifact.

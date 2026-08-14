# YA Forge build plan

## Preserve everything that matters

A15YA is the immutable behavioral reference, including control logic, learning, prediction error, rollback memory, landing recovery, learning cooldown, startup probation, voice and personality, persistence, telemetry, dashboard, logger, car-off protection, TC, ABS, and safety arbitration.

## YB architecture

Every significant event uses one compact episode lifecycle:

`situation -> prediction -> action -> result -> confidence -> learning decision`

An episode records:

- rolling episode ID
- triggering cause
- predicted severity
- intervention owner
- action strength
- observed result
- relapse or recovery
- learning eligibility
- positive learning, negative learning, rollback, or no-change decision

## Hard constraints

- Lua 5.3 only
- normalized MT12 bytecode only for deployment
- maximum normalized size: 88,944 bytes
- no feature deletion or weakening to gain space
- no network/model dependency in the build path
- deterministic CI
- one active workflow
- source and LUAC hashes recorded for every release

# MT12 Reasoning Mission

Controller: 0109-m109a
Phase: postcycle

## Leading hypothesis
- sensor lag or calibration is the primary source of truth-speed error (confidence 0.2)
- Test: replay aligned GPS and RPM lag against real logs

## Known / inferred / unknown
- Known: Digital twin score 99.581
- Inferred: sensor lag or calibration is the primary source of truth-speed error at confidence 0.2
- Unknown: No curated real-log corpus detected
- Unknown: Replay evidence incomplete or not passing
- Unknown: Digital twin parameters are not yet fully calibrated to the physical car

## Selected tools
- static-analysis
- semantic-map
- real-log-replay
- digital-twin
- cross-correlation
- runtime-memory-audit
- luac-size-gate

## Long-term priorities
- Preserve at least 256 bytes normalized LUAC reserve: 0%
- Reduce jump false positives without missed real jumps: 0%
- Reduce truth-speed error below 3 mph equivalent: 76.1%

## Required self-critique
- What evidence contradicts the leading hypothesis?
- Is there a simpler explanation?
- What result would make this design unacceptable?
- Can the same behavior be achieved with less runtime memory?

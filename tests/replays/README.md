# MT12 replay corpus

Place real radio and blackbox CSV logs in category folders such as:

- `proven-good/`
- `wet-launch/`
- `jumps/`
- `false-jumps/`
- `channel-drops/`
- `gps-lag/`
- `rpm-lag/`
- `tc-events/`
- `abs-events/`
- `bench/`

Each replay may have a same-base-name `.expect.json` file. The factory treats real logs as evidence and must not silently invent labels. Example:

```json
{
  "must_not_drop_throttle": true,
  "jump_events": 2,
  "false_jump_max": 0,
  "tc_events_min": 1,
  "tc_events_max": 5,
  "abs_events_max": 1,
  "expected_recovery_frames_max": 10,
  "notes": "Wet 4S launch, known GPS dropout near the middle"
}
```

Generated releases remain `SIMULATION VERIFIED` until a human records bench and road results. A simulation-only winner must never automatically replace the trusted root parent.

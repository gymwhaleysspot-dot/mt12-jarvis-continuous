# Bench and road evidence

Place JSON evidence under `evidence/bench/` or `evidence/road/`. Every record must identify the exact source and normalized bytecode SHA-256.

```json
{
  "schema": 1,
  "kind": "bench",
  "controllerSourceSha256": "64 hex characters",
  "normalizedLuacSha256": "64 hex characters",
  "testedAt": "2026-08-02T00:00:00Z",
  "vehicle": "MJX Hyper Go 7303",
  "battery": "4S",
  "surface": "dry pavement",
  "weather": "indoor bench or road conditions",
  "logs": ["tests/replays/example.csv"],
  "driverVerdict": "pass",
  "faults": [],
  "notes": "observations"
}
```

Allowed `kind`: `bench`, `road`, `rejected-road`. Allowed verdict: `pass`, `fail`, `inconclusive`.

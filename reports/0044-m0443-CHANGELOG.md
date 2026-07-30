# 0044-m0443 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 1
- Simulator score: 93.616
- Passed: false

## Download files

- Lua source: `generations/candidates/0044-m0443.lua` (85765 bytes)
- MT12 normalized LUAC: `generations/candidates/0044-m0443.luac` (88977 bytes)

## Changes

### 1. q function rewrite
- Type: function (q)
- Variant: `safe-quantizer`
- Why: Rebuild telemetry quantization with explicit defaults, finite checks and symmetric rounding
- From: parent implementation
- To: safe-quantizer

### 2. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009224389517446281

## Validation

- Regressions: none
- Improvement: 93.616
- Lua SHA-256: `dd36acaf17743f9a56e86319ed5615fcceefafbd2116eb35eedd7cb8fe3f2abf`
- LUAC SHA-256: `af6c48a4523fedb332c0355a6056ea200fec238bc186e6a69cf48184f29bd40d`

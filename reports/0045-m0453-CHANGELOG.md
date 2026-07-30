# 0045-m0453 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 1
- Simulator score: 91.812
- Passed: false

## Download files

- Lua source: `generations/candidates/0045-m0453.lua` (85765 bytes)
- MT12 normalized LUAC: `generations/candidates/0045-m0453.luac` (88977 bytes)

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
- To: 0.0009260814866620047

## Validation

- Regressions: none
- Improvement: 91.812
- Lua SHA-256: `d8d70156bd72560db1b0d23ac7ad846a916169c5e6e4cbfca84d116a27a896d6`
- LUAC SHA-256: `31b7fe78c83cc23a1e94d7da2621a3b195a02a7af8384972f6f2af029942ec75`

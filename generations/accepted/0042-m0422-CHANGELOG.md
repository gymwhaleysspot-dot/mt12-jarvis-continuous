# 0042-m0422 changelog

- Family: monday
- Parent: generations/accepted/0040-c0403.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 1
- Simulator score: 93.992
- Passed: true

## Download files

- Lua source: `generations/candidates/0042-m0422.lua` (85744 bytes)
- MT12 normalized LUAC: `generations/candidates/0042-m0422.luac` (88941 bytes)

## Changes

### 1. q function rewrite
- Type: function (q)
- Variant: `sentinel-aware-quantizer`
- Why: Preserve loud invalid telemetry sentinel behavior while making range handling explicit
- From: parent implementation
- To: sentinel-aware-quantizer

### 2. RPM2MPH
- Type: parameter


- From: 0.000914
- To: 0.0009179201173113659

### 3. boot voice wait
- Type: parameter


- From: 90
- To: 99.47957354341634

## Validation

- Regressions: none
- Improvement: 93.992
- Lua SHA-256: `7177c8bafa9ef5d4a8ae60d19327f9b572d93b400e4590eca7c7d1afd78d7f91`
- LUAC SHA-256: `ace0d01cdbb715eb71e2d559f524239dfddf31d583bf61558a7e1bf30ec97071`

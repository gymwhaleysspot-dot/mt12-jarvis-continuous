# 0043-m0433 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 1
- Simulator score: 93.48
- Passed: false

## Download files

- Lua source: `generations/candidates/0043-m0433.lua` (85759 bytes)
- MT12 normalized LUAC: `generations/candidates/0043-m0433.luac` (88967 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `bounded-ease-blend`
- Why: Replace linear interpolation with bounded smoothstep blending for less abrupt state transitions
- From: parent implementation
- To: bounded-ease-blend

### 2. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009257855280504166

## Validation

- Regressions: none
- Improvement: 93.48
- Lua SHA-256: `7511eae1b2555bd4d1d66a128269b9608d64676c8a9bc1aa5264527ade7ac0ac`
- LUAC SHA-256: `46d73a6343f52179e92c0024464c91400ec1d9f79ce5899be6d60649da03a536`

# 0043-m0431 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 1
- Simulator score: 84.829
- Passed: false

## Download files

- Lua source: `generations/candidates/0043-m0431.lua` (85759 bytes)
- MT12 normalized LUAC: `generations/candidates/0043-m0431.luac` (88967 bytes)

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
- To: 0.0009243979962341301

## Validation

- Regressions: none
- Improvement: 84.829
- Lua SHA-256: `156e6aa8c19ca8ffc1123aff27ed1cdf631753351a003609f43d5d0b51642340`
- LUAC SHA-256: `74a13f5a8b7bba6472bab79c324d080032cb44dee211193c85b30b72a1531cf2`

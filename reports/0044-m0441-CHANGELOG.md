# 0044-m0441 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 1
- Simulator score: 86.595
- Passed: false

## Download files

- Lua source: `generations/candidates/0044-m0441.lua` (85759 bytes)
- MT12 normalized LUAC: `generations/candidates/0044-m0441.luac` (88967 bytes)

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
- To: 0.0009137955143774557

## Validation

- Regressions: none
- Improvement: 86.595
- Lua SHA-256: `0361cfbbc5f86f66af9371066f920b6a49b0df992e4ba5fa6122885354b9199f`
- LUAC SHA-256: `d6eb3b0520f18c309233bd3f70fa91a0889aa461c136352cb5454f1aefe731e3`

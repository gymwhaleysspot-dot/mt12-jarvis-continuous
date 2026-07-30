# 0045-m0451 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 1
- Simulator score: 85.174
- Passed: false

## Download files

- Lua source: `generations/candidates/0045-m0451.lua` (85759 bytes)
- MT12 normalized LUAC: `generations/candidates/0045-m0451.luac` (88967 bytes)

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
- To: 0.000924200745375657

## Validation

- Regressions: none
- Improvement: 85.174
- Lua SHA-256: `a2e060da2bfd5798f7e152ff9929a8b47fbb2e70ba004404bef6f4ddc157726c`
- LUAC SHA-256: `03e63ee52b1ca2349cfa0a236041ede1ec7d3023c3a568fdb0c932370b176d21`

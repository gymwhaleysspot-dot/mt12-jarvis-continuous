# 0042-m0421 changelog

- Family: monday
- Parent: generations/accepted/0040-c0403.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 1
- Simulator score: 87.645
- Passed: false

## Download files

- Lua source: `generations/candidates/0042-m0421.lua` (85741 bytes)
- MT12 normalized LUAC: `generations/candidates/0042-m0421.luac` (88959 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `bounded-ease-blend`
- Why: Replace linear interpolation with bounded smoothstep blending for less abrupt state transitions
- From: parent implementation
- To: bounded-ease-blend

### 2. RPM2MPH
- Type: parameter


- From: 0.000914
- To: 0.000918351429093047

### 3. boot voice wait
- Type: parameter


- From: 90
- To: 83.25065182952676

## Validation

- Regressions: none
- Improvement: 87.645
- Lua SHA-256: `846b37e459e68f04b7fff45dfddda954b5916cc7746da5a46e900fd40d5c1fe3`
- LUAC SHA-256: `ed74749a496f960d9c81f7f153d4a4b5cdc17158ff1e47573711e3350246ad4b`

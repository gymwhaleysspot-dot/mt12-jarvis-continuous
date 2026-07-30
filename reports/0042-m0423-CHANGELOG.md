# 0042-m0423 changelog

- Family: monday
- Parent: generations/accepted/0040-c0403.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 1
- Simulator score: 92.628
- Passed: false

## Download files

- Lua source: `generations/candidates/0042-m0423.lua` (85796 bytes)
- MT12 normalized LUAC: `generations/candidates/0042-m0423.luac` (89028 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `adaptive-linear-blend`
- Why: Keep linear response near center while softening only the ends of state transitions
- From: parent implementation
- To: adaptive-linear-blend

### 2. RPM2MPH
- Type: parameter


- From: 0.000914
- To: 0.000905080785850936

### 3. boot voice wait
- Type: parameter


- From: 90
- To: 103.62806204867084

## Validation

- Regressions: none
- Improvement: 92.628
- Lua SHA-256: `42a313a1654fb8fb96d3e232b3701e5fbd6127182511c0e49473149f6f28d647`
- LUAC SHA-256: `213e40a639269e3b9b1303fcceccef5dd71e9e97575b11f3e8f9ea427b373254`

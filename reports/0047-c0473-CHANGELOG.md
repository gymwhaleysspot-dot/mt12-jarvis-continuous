# 0047-c0473 changelog

- Family: cloud
- Parent: generations/accepted/0042-m0422.lua
- Objective: confidence arbitration, neural learning and reasoning
- Dynamic whole-function rewrites: 2
- Simulator score: 94.089
- Passed: false

## Download files

- Lua source: `generations/candidates/0047-c0473.lua` (85835 bytes)
- MT12 normalized LUAC: `generations/candidates/0047-c0473.luac` (89066 bytes)

## Changes

### 1. trait function rewrite
- Type: function (trait)
- Variant: `trait-stability-zone`
- Why: Add a stability zone so tiny personality noise learns slowly and large evidence learns faster
- From: parent implementation
- To: trait-stability-zone

### 2. lerp function rewrite
- Type: function (lerp)
- Variant: `bounded-ease-blend`
- Why: Replace linear interpolation with bounded smoothstep blending for less abrupt state transitions
- From: parent implementation
- To: bounded-ease-blend

### 3. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009144520048166439

## Validation

- Regressions: none
- Improvement: 94.089
- Lua SHA-256: `e68d35e7636f9bfb94021c9dab378a0407a4f149d256acc917aad8ae14dac8e2`
- LUAC SHA-256: `395164b443255e2b06691a75fc4d1e0bffe78a8e1ad5d15abd026e6fada240d9`

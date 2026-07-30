# 0047-t0471 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 2
- Simulator score: 88.568
- Passed: false

## Download files

- Lua source: `generations/candidates/0047-t0471.lua` (85862 bytes)
- MT12 normalized LUAC: `generations/candidates/0047-t0471.luac` (89096 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `adaptive-linear-blend`
- Why: Keep linear response near center while softening only the ends of state transitions
- From: parent implementation
- To: adaptive-linear-blend

### 2. i9 function rewrite
- Type: function (i9)
- Variant: `saturating-session-counter`
- Why: Rebuild persistent session counter as explicit saturating arithmetic
- From: parent implementation
- To: saturating-session-counter

### 3. ABS blend
- Type: parameter


- From: 0.42
- To: 0.37983311868156305

### 4. ABS response divisor
- Type: parameter


- From: 650
- To: 689.5179618559196

## Validation

- Regressions: none
- Improvement: 88.568
- Lua SHA-256: `490833171e4034ee85c9fd17de7a0f0cb85e6bfc8fd87d6488b7c94ed8c4f5bc`
- LUAC SHA-256: `fcd7e24f9e7a7b6531f717217879caa138df485631e66cd71f7471e18d3ba332`

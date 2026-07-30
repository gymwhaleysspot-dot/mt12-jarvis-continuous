# 0047-t0473 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 2
- Simulator score: 94.977
- Passed: false

## Download files

- Lua source: `generations/candidates/0047-t0473.lua` (85862 bytes)
- MT12 normalized LUAC: `generations/candidates/0047-t0473.luac` (89096 bytes)

## Changes

### 1. i9 function rewrite
- Type: function (i9)
- Variant: `saturating-session-counter`
- Why: Rebuild persistent session counter as explicit saturating arithmetic
- From: parent implementation
- To: saturating-session-counter

### 2. lerp function rewrite
- Type: function (lerp)
- Variant: `adaptive-linear-blend`
- Why: Keep linear response near center while softening only the ends of state transitions
- From: parent implementation
- To: adaptive-linear-blend

### 3. ABS blend
- Type: parameter


- From: 0.42
- To: 0.4651713612023508

### 4. runaway release base
- Type: parameter


- From: 0.1
- To: 0.06

### 5. ABS response divisor
- Type: parameter


- From: 650
- To: 786.6019134247093

## Validation

- Regressions: none
- Improvement: 94.977
- Lua SHA-256: `26f92b50f99069750d02a7228f682c07dccd42b005c6df4ba90599135dd8f3b0`
- LUAC SHA-256: `ae1c88ea1b9f5d90f6fc2259a85ae55643a8797ed3c495d8944497e1335323fd`

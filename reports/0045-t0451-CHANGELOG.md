# 0045-t0451 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 1
- Simulator score: 85.385
- Passed: false

## Download files

- Lua source: `generations/candidates/0045-t0451.lua` (85807 bytes)
- MT12 normalized LUAC: `generations/candidates/0045-t0451.luac` (89045 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `adaptive-linear-blend`
- Why: Keep linear response near center while softening only the ends of state transitions
- From: parent implementation
- To: adaptive-linear-blend

### 2. ABS response divisor
- Type: parameter


- From: 650
- To: 589.6127408327302

### 3. ABS blend
- Type: parameter


- From: 0.42
- To: 0.3850672021560604

## Validation

- Regressions: none
- Improvement: 85.385
- Lua SHA-256: `0203354a16f7007c734bc7935652e2c3f4ff7b3a0b714e11ada51260bef11c7b`
- LUAC SHA-256: `281c6fd5f9379b80c93c52c45ce48c8fb4b57f4dd3fa46c1114df05e94c315d7`

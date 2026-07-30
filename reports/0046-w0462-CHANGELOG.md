# 0046-w0462 changelog

- Family: html
- Parent: generations/accepted/0042-m0422.lua
- Objective: memory efficiency, observability and deploy reliability
- Dynamic whole-function rewrites: 1
- Simulator score: 92.991
- Passed: false

## Download files

- Lua source: `generations/candidates/0046-w0462.lua` (85815 bytes)
- MT12 normalized LUAC: `generations/candidates/0046-w0462.luac` (89036 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `adaptive-linear-blend`
- Why: Keep linear response near center while softening only the ends of state transitions
- From: parent implementation
- To: adaptive-linear-blend

### 2. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009146211438729474

## Validation

- Regressions: none
- Improvement: 92.991
- Lua SHA-256: `7174749cde7228a871e41633c8bac4f56f98d2bec9736dedf5d10e29de5ae352`
- LUAC SHA-256: `8a1fd359edbe8d2874a0bd00dc28246134692d467ec495e737260bc840ab589b`

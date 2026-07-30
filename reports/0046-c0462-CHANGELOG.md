# 0046-c0462 changelog

- Family: cloud
- Parent: generations/accepted/0042-m0422.lua
- Objective: confidence arbitration, neural learning and reasoning
- Dynamic whole-function rewrites: 1
- Simulator score: 93.046
- Passed: false

## Download files

- Lua source: `generations/candidates/0046-c0462.lua` (85821 bytes)
- MT12 normalized LUAC: `generations/candidates/0046-c0462.luac` (89040 bytes)

## Changes

### 1. trait function rewrite
- Type: function (trait)
- Variant: `trait-stability-zone`
- Why: Add a stability zone so tiny personality noise learns slowly and large evidence learns faster
- From: parent implementation
- To: trait-stability-zone

### 2. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009142289358093217

## Validation

- Regressions: none
- Improvement: 93.046
- Lua SHA-256: `8b9bf5bdad9854988765a31acc4f98f95d88fe6d3c08df45b7d384521f85581c`
- LUAC SHA-256: `ea0836f4c0171d621ad69711a0b174c0631c17c5335f9d7c63562ae41261702e`

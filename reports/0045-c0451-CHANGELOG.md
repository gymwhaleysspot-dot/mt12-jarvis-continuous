# 0045-c0451 changelog

- Family: cloud
- Parent: generations/accepted/0042-m0422.lua
- Objective: confidence arbitration, neural learning and reasoning
- Dynamic whole-function rewrites: 1
- Simulator score: 85.656
- Passed: false

## Download files

- Lua source: `generations/candidates/0045-c0451.lua` (85821 bytes)
- MT12 normalized LUAC: `generations/candidates/0045-c0451.luac` (89040 bytes)

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
- To: 0.0009213231470124144

## Validation

- Regressions: none
- Improvement: 85.656
- Lua SHA-256: `aaaad8a6e9d8a6121d00cb622d5fa3832c0cc36c2c6783acaea062d0d9080e05`
- LUAC SHA-256: `c0843f6c00940a527b48c25b8c9cff44b7e62d003c6972a094b47eb4a3e8612b`

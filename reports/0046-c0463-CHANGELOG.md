# 0046-c0463 changelog

- Family: cloud
- Parent: generations/accepted/0042-m0422.lua
- Objective: confidence arbitration, neural learning and reasoning
- Dynamic whole-function rewrites: 1
- Simulator score: 94.373
- Passed: false

## Download files

- Lua source: `generations/candidates/0046-c0463.lua` (85821 bytes)
- MT12 normalized LUAC: `generations/candidates/0046-c0463.luac` (89040 bytes)

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
- To: 0.0009217361576047773

## Validation

- Regressions: none
- Improvement: 94.373
- Lua SHA-256: `d0051809eb88bb14f6a5a95c52d18c0dde9fee42a30ec628ced88d5714442553`
- LUAC SHA-256: `5b03b743ce545b59e0c6ea0577cc8a396c0577df78d2328bb3774e14a507503f`

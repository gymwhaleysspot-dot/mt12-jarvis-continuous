# 0043-c0432 changelog

- Family: cloud
- Parent: generations/accepted/0042-m0422.lua
- Objective: confidence arbitration, neural learning and reasoning
- Dynamic whole-function rewrites: 1
- Simulator score: 91.541
- Passed: false

## Download files

- Lua source: `generations/candidates/0043-c0432.lua` (85821 bytes)
- MT12 normalized LUAC: `generations/candidates/0043-c0432.luac` (89040 bytes)

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
- To: 0.000916254704581555

## Validation

- Regressions: none
- Improvement: 91.541
- Lua SHA-256: `9a7d10aa8548496f0aadcaf96571697b83b0494ea90637059d4f6f04e5c4bbc2`
- LUAC SHA-256: `1b5d8e10a73b2bf98826db8c37e0506d12f1f6873e02320afe87c4059fc2d8ec`

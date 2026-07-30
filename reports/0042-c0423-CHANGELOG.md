# 0042-c0423 changelog

- Family: cloud
- Parent: generations/accepted/0040-c0403.lua
- Objective: confidence arbitration, neural learning and reasoning
- Dynamic whole-function rewrites: 1
- Simulator score: 94.609
- Passed: false

## Download files

- Lua source: `generations/candidates/0042-c0423.lua` (85803 bytes)
- MT12 normalized LUAC: `generations/candidates/0042-c0423.luac` (89032 bytes)

## Changes

### 1. trait function rewrite
- Type: function (trait)
- Variant: `trait-stability-zone`
- Why: Add a stability zone so tiny personality noise learns slowly and large evidence learns faster
- From: parent implementation
- To: trait-stability-zone

### 2. RPM2MPH
- Type: parameter


- From: 0.000914
- To: 0.0009181628638475901

## Validation

- Regressions: none
- Improvement: 94.609
- Lua SHA-256: `11ed2e7dc0eb62d857aa76e8af26d8a5508f7ef70a33ec24603f7f8f4d3703fd`
- LUAC SHA-256: `6f569f580d24bb7996f27ad5ed3d4020da99540fe8beb9766335988fb676796a`

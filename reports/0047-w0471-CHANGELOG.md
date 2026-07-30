# 0047-w0471 changelog

- Family: html
- Parent: generations/accepted/0042-m0422.lua
- Objective: memory efficiency, observability and deploy reliability
- Dynamic whole-function rewrites: 2
- Simulator score: 85.453
- Passed: false

## Download files

- Lua source: `generations/candidates/0047-w0471.lua` (85877 bytes)
- MT12 normalized LUAC: `generations/candidates/0047-w0471.luac` (89086 bytes)

## Changes

### 1. i9 function rewrite
- Type: function (i9)
- Variant: `saturating-session-counter`
- Why: Rebuild persistent session counter as explicit saturating arithmetic
- From: parent implementation
- To: saturating-session-counter

### 2. trait function rewrite
- Type: function (trait)
- Variant: `trait-stability-zone`
- Why: Add a stability zone so tiny personality noise learns slowly and large evidence learns faster
- From: parent implementation
- To: trait-stability-zone

### 3. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009206205017269636

## Validation

- Regressions: none
- Improvement: 85.453
- Lua SHA-256: `da5aff51124d686e192c2e91b010e0b109104166c3b864144387a8db3805a25d`
- LUAC SHA-256: `692cdb77d64a9fb80e2351255f143d5e7f3ee865af6b74c7cd5f5dc8b5a568e0`

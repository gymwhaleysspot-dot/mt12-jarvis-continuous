# 0044-t0442 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 1
- Simulator score: 95.285
- Passed: false

## Download files

- Lua source: `generations/candidates/0044-t0442.lua` (85800 bytes)
- MT12 normalized LUAC: `generations/candidates/0044-t0442.luac` (89005 bytes)

## Changes

### 1. i9 function rewrite
- Type: function (i9)
- Variant: `saturating-session-counter`
- Why: Rebuild persistent session counter as explicit saturating arithmetic
- From: parent implementation
- To: saturating-session-counter

### 2. runaway release base
- Type: parameter


- From: 0.1
- To: 0.07156117611040827

### 3. ABS response divisor
- Type: parameter


- From: 650
- To: 591.6631422911305

### 4. ABS blend
- Type: parameter


- From: 0.42
- To: 0.4880125696077011

## Validation

- Regressions: none
- Improvement: 95.285
- Lua SHA-256: `81fa9604b96f69b38b1abf1d812d78159b487636159806c9d5f1a89df1a2e37e`
- LUAC SHA-256: `02b5685ad5476483fcfe90e8cf435d3faba696d15a91bacda5251b7560b11ad8`

# 0047-c0471 changelog

- Family: cloud
- Parent: generations/accepted/0042-m0422.lua
- Objective: confidence arbitration, neural learning and reasoning
- Dynamic whole-function rewrites: 2
- Simulator score: 84.631
- Passed: false

## Download files

- Lua source: `generations/candidates/0047-c0471.lua` (85841 bytes)
- MT12 normalized LUAC: `generations/candidates/0047-c0471.luac` (89076 bytes)

## Changes

### 1. trait function rewrite
- Type: function (trait)
- Variant: `trait-stability-zone`
- Why: Add a stability zone so tiny personality noise learns slowly and large evidence learns faster
- From: parent implementation
- To: trait-stability-zone

### 2. q function rewrite
- Type: function (q)
- Variant: `safe-quantizer`
- Why: Rebuild telemetry quantization with explicit defaults, finite checks and symmetric rounding
- From: parent implementation
- To: safe-quantizer

### 3. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.000914097009816235

## Validation

- Regressions: none
- Improvement: 84.631
- Lua SHA-256: `d5de7f199d0688d4f2888844edf8a5fc9a730862c78a6cd55b3bae3828bcd618`
- LUAC SHA-256: `c8fde44fe5158ce9d1beab98e08c92ee299a1d80d8d47dd9fab57daa567ca362`

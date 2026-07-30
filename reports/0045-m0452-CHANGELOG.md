# 0045-m0452 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Dynamic whole-function rewrites: 1
- Simulator score: 93.092
- Passed: false

## Download files

- Lua source: `generations/candidates/0045-m0452.lua` (85765 bytes)
- MT12 normalized LUAC: `generations/candidates/0045-m0452.luac` (88977 bytes)

## Changes

### 1. q function rewrite
- Type: function (q)
- Variant: `safe-quantizer`
- Why: Rebuild telemetry quantization with explicit defaults, finite checks and symmetric rounding
- From: parent implementation
- To: safe-quantizer

### 2. RPM2MPH
- Type: parameter


- From: 0.00091792
- To: 0.0009112879793358781

## Validation

- Regressions: none
- Improvement: 93.092
- Lua SHA-256: `46416947bf7485c6ef771ebe8c2de6434c8ff7371c14238ad385bb2233c1694e`
- LUAC SHA-256: `2bcbb4e65251ded4a3d72605a7196a3211dc58ab4bbe3447a4fd78956ab20dad`

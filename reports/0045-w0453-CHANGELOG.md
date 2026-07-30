# 0045-w0453 changelog

- Family: html
- Parent: generations/accepted/0042-m0422.lua
- Objective: memory efficiency, observability and deploy reliability
- Dynamic whole-function rewrites: 1
- Simulator score: 92.267
- Passed: false

## Download files

- Lua source: `generations/candidates/0045-w0453.lua` (85767 bytes)
- MT12 normalized LUAC: `generations/candidates/0045-w0453.luac` (88977 bytes)

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
- To: 0.0009156649995417381

## Validation

- Regressions: none
- Improvement: 92.267
- Lua SHA-256: `ff8a4262755eaa874bfe607dcd4d3eae4aba0b4324d9540f5607fd8717caad4f`
- LUAC SHA-256: `6b518537b76722f7bddb73d02579e2bf9daa3dadf359074d054dfcf4c4e3fa4d`

# 0042-t0423 changelog

- Family: tuesday
- Parent: generations/accepted/0040-c0403.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 1
- Simulator score: 95.869
- Passed: false

## Download files

- Lua source: `generations/candidates/0042-t0423.lua` (85733 bytes)
- MT12 normalized LUAC: `generations/candidates/0042-t0423.luac` (88973 bytes)

## Changes

### 1. lerp function rewrite
- Type: function (lerp)
- Variant: `bounded-ease-blend`
- Why: Replace linear interpolation with bounded smoothstep blending for less abrupt state transitions
- From: parent implementation
- To: bounded-ease-blend

### 2. ABS blend
- Type: parameter


- From: 0.42
- To: 0.32

### 3. ABS response divisor
- Type: parameter


- From: 650
- To: 769.2604634310585

### 4. runaway release base
- Type: parameter


- From: 0.1
- To: 0.12556179086770863

## Validation

- Regressions: none
- Improvement: 95.869
- Lua SHA-256: `53d9baa06da6645358e5e0aee1fece36f02c7d8a97064cbd5b2c4e83fbb7b6d8`
- LUAC SHA-256: `d0a7f2b301ff41b8673e484e0cdc71f840cc3cecc237bb5d733aa80526cf3207`

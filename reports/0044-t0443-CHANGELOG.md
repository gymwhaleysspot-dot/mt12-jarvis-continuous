# 0044-t0443 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Dynamic whole-function rewrites: 1
- Simulator score: 95.457
- Passed: false

## Download files

- Lua source: `generations/candidates/0044-t0443.lua` (85760 bytes)
- MT12 normalized LUAC: `generations/candidates/0044-t0443.luac` (88990 bytes)

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
- To: 0.3735924839776475

### 3. runaway release base
- Type: parameter


- From: 0.1
- To: 0.1378958050556539

### 4. ABS response divisor
- Type: parameter


- From: 650
- To: 743.9812933677691

## Validation

- Regressions: none
- Improvement: 95.457
- Lua SHA-256: `0cdb9db47aeb5c23ad255ecec11af23f548db8c1217408676c67335375f038b0`
- LUAC SHA-256: `f4ce965b643b0dbf3b8c9307d33f3cb7c0810bfaeeff16174008c7139afd0cbb`

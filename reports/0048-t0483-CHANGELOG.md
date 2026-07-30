# 0048-t0483 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Research-driven: true
- Dynamic whole-function rewrites: 2
- Simulator score: 94.278
- Passed: false

## Download files

- Lua source: `generations/candidates/0048-t0483.lua` (85820 bytes)
- MT12 normalized LUAC: `generations/candidates/0048-t0483.luac` (89041 bytes)

## Changes

### 1. i9 function rewrite
- Type: function (i9)
- Variant: `saturating-session-counter`
- Research-directed: true
- Why: Rebuild persistent session counter as explicit saturating arithmetic
- From: parent implementation
- To: saturating-session-counter

### 2. q function rewrite
- Type: function (q)
- Variant: `safe-quantizer`
- Research-directed: false
- Why: Rebuild telemetry quantization with explicit defaults, finite checks and symmetric rounding
- From: parent implementation
- To: safe-quantizer

### 3. runaway release base
- Type: parameter

- Research-directed: false

- From: 0.1
- To: 0.14137165565072793

### 4. ABS blend
- Type: parameter

- Research-directed: false

- From: 0.42
- To: 0.5240781403366942

### 5. ABS response divisor
- Type: parameter

- Research-directed: false

- From: 650
- To: 546.8324132334558

## Research evidence

- [An Investigation into the Traction and Anti-Lock Braking System Control Design](https://doi.org/10.4271/2020-01-0997) — Crossref
- [Anti-Lock Braking Control Design Using a Nonlinear Model Predictive Approach and Wheel Information](https://doi.org/10.1109/icmech.2019.8722841) — Crossref
- [Constrained Nonlinear Estimation of Road Friction Coefficient and Wheel Slip for Control of Anti-Lock Braking System](https://doi.org/10.52547/joc.15.1.67) — Crossref
- [Intelligent Adaptive Control for Anti-Lock Braking System](https://doi.org/10.1115/imece2018-87659) — Crossref
- [Data-driven model-free slip control of anti-lock braking systems using reinforcement Q-learning](https://doi.org/10.1016/j.neucom.2017.08.036) — Crossref
- [Optimal design for slip deceleration control in anti-lock braking system](https://doi.org/10.1063/1.5033150) — Crossref

## Validation

- Regressions: none
- Improvement: 94.278
- Lua SHA-256: `498d15f5ca7620f39d207b9eefbdbff4783e9a7a9232dbe4b53c112d29362c99`
- LUAC SHA-256: `1778d8ecc7397f4c34e4e803cda200447eb01f09fbcfc7a7e1b0efb9607625ca`

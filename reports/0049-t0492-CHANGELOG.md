# 0049-t0492 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Research-driven: true
- Dynamic whole-function rewrites: 2
- Simulator score: 95.73
- Passed: false

## Download files

- Lua source: `generations/candidates/0049-t0492.lua` (85820 bytes)
- MT12 normalized LUAC: `generations/candidates/0049-t0492.luac` (89037 bytes)

## Changes

### 1. q function rewrite
- Type: function (q)
- Variant: `safe-quantizer`
- Research-directed: false
- Why: Rebuild telemetry quantization with explicit defaults, finite checks and symmetric rounding
- From: parent implementation
- To: safe-quantizer

### 2. i9 function rewrite
- Type: function (i9)
- Variant: `saturating-session-counter`
- Research-directed: true
- Why: Rebuild persistent session counter as explicit saturating arithmetic
- From: parent implementation
- To: saturating-session-counter

### 3. ABS blend
- Type: parameter

- Research-directed: false

- From: 0.42
- To: 0.34177063777763395

### 4. ABS response divisor
- Type: parameter

- Research-directed: false

- From: 650
- To: 600.3812326646876

### 5. runaway release base
- Type: parameter

- Research-directed: false

- From: 0.1
- To: 0.12346603950951249

## Research evidence

- [An Investigation into the Traction and Anti-Lock Braking System Control Design](https://doi.org/10.4271/2020-01-0997) — Crossref
- [Anti-Lock Braking Control Design Using a Nonlinear Model Predictive Approach and Wheel Information](https://doi.org/10.1109/icmech.2019.8722841) — Crossref
- [Constrained Nonlinear Estimation of Road Friction Coefficient and Wheel Slip for Control of Anti-Lock Braking System](https://doi.org/10.52547/joc.15.1.67) — Crossref
- [Intelligent Adaptive Control for Anti-Lock Braking System](https://doi.org/10.1115/imece2018-87659) — Crossref
- [Data-driven model-free slip control of anti-lock braking systems using reinforcement Q-learning](https://doi.org/10.1016/j.neucom.2017.08.036) — Crossref
- [Optimal design for slip deceleration control in anti-lock braking system](https://doi.org/10.1063/1.5033150) — Crossref

## Validation

- Regressions: none
- Improvement: 95.73
- Lua SHA-256: `293bce9460b22eb43f7b65879e81c9e00213c96903fcf2a58a1b5b8877b17677`
- LUAC SHA-256: `a5df89834ffcade989d91217cb2f856c7eeac338837c0b3bbdf3ee4c369bd03d`

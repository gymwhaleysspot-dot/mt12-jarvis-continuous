# 0048-t0482 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Research-driven: true
- Dynamic whole-function rewrites: 2
- Simulator score: 95.762
- Passed: false

## Download files

- Lua source: `generations/candidates/0048-t0482.lua` (85916 bytes)
- MT12 normalized LUAC: `generations/candidates/0048-t0482.luac` (89149 bytes)

## Changes

### 1. md function rewrite
- Type: function (md)
- Variant: `meta-hysteresis-verifier`
- Research-directed: true
- Why: Add hysteresis to meta-learning so one noisy sample cannot reverse a learned trend
- From: parent implementation
- To: meta-hysteresis-verifier

### 2. trait function rewrite
- Type: function (trait)
- Variant: `trait-stability-zone`
- Research-directed: true
- Why: Add a stability zone so tiny personality noise learns slowly and large evidence learns faster
- From: parent implementation
- To: trait-stability-zone

### 3. ABS response divisor
- Type: parameter

- Research-directed: false

- From: 650
- To: 716.3481630091555

### 4. ABS blend
- Type: parameter

- Research-directed: false

- From: 0.42
- To: 0.37322393874591214

### 5. runaway release base
- Type: parameter

- Research-directed: false

- From: 0.1
- To: 0.07226412725402043

## Research evidence

- [An Investigation into the Traction and Anti-Lock Braking System Control Design](https://doi.org/10.4271/2020-01-0997) — Crossref
- [Anti-Lock Braking Control Design Using a Nonlinear Model Predictive Approach and Wheel Information](https://doi.org/10.1109/icmech.2019.8722841) — Crossref
- [Constrained Nonlinear Estimation of Road Friction Coefficient and Wheel Slip for Control of Anti-Lock Braking System](https://doi.org/10.52547/joc.15.1.67) — Crossref
- [Intelligent Adaptive Control for Anti-Lock Braking System](https://doi.org/10.1115/imece2018-87659) — Crossref
- [Data-driven model-free slip control of anti-lock braking systems using reinforcement Q-learning](https://doi.org/10.1016/j.neucom.2017.08.036) — Crossref
- [Optimal design for slip deceleration control in anti-lock braking system](https://doi.org/10.1063/1.5033150) — Crossref

## Validation

- Regressions: none
- Improvement: 95.762
- Lua SHA-256: `a04b9fbb236281df2fc232d424e30ccbb4565918d847aef35c2ac4b5aa1d8eb9`
- LUAC SHA-256: `a780ea00f7e43f83a26d57198f778a6463a0c65340421de3a9d7fc2ad595d7d4`

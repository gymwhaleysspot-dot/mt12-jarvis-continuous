# 0049-t0491 changelog

- Family: tuesday
- Parent: generations/accepted/0042-m0422.lua
- Objective: traction, ABS and intervention quality
- Research-driven: true
- Dynamic whole-function rewrites: 2
- Simulator score: 85.811
- Passed: false

## Download files

- Lua source: `generations/candidates/0049-t0491.lua` (85862 bytes)
- MT12 normalized LUAC: `generations/candidates/0049-t0491.luac` (89071 bytes)

## Changes

### 1. trait function rewrite
- Type: function (trait)
- Variant: `trait-confidence-rate`
- Research-directed: true
- Why: Rebuild personality learning rate around confidence and disagreement
- From: parent implementation
- To: trait-confidence-rate

### 2. i9 function rewrite
- Type: function (i9)
- Variant: `saturating-session-counter`
- Research-directed: true
- Why: Rebuild persistent session counter as explicit saturating arithmetic
- From: parent implementation
- To: saturating-session-counter

### 3. runaway release base
- Type: parameter

- Research-directed: false

- From: 0.1
- To: 0.0840701633488061

### 4. ABS blend
- Type: parameter

- Research-directed: false

- From: 0.42
- To: 0.4728119434170658

## Research evidence

- [An Investigation into the Traction and Anti-Lock Braking System Control Design](https://doi.org/10.4271/2020-01-0997) — Crossref
- [Anti-Lock Braking Control Design Using a Nonlinear Model Predictive Approach and Wheel Information](https://doi.org/10.1109/icmech.2019.8722841) — Crossref
- [Constrained Nonlinear Estimation of Road Friction Coefficient and Wheel Slip for Control of Anti-Lock Braking System](https://doi.org/10.52547/joc.15.1.67) — Crossref
- [Intelligent Adaptive Control for Anti-Lock Braking System](https://doi.org/10.1115/imece2018-87659) — Crossref
- [Data-driven model-free slip control of anti-lock braking systems using reinforcement Q-learning](https://doi.org/10.1016/j.neucom.2017.08.036) — Crossref
- [Optimal design for slip deceleration control in anti-lock braking system](https://doi.org/10.1063/1.5033150) — Crossref

## Validation

- Regressions: none
- Improvement: 85.811
- Lua SHA-256: `3f971fd48cf8a5a1bc30dfcc4433308ce850e6542739f28a4905ed373b9f6b5d`
- LUAC SHA-256: `ba0e4a747f2502af4e516f0e7d2486d056954654134f9d6f0ccf2e811c0c96bc`

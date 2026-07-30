# 0049-m0491 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Research-driven: true
- Dynamic whole-function rewrites: 2
- Simulator score: 85.06
- Passed: false

## Download files

- Lua source: `generations/candidates/0049-m0491.lua` (85932 bytes)
- MT12 normalized LUAC: `generations/candidates/0049-m0491.luac` (89126 bytes)

## Changes

### 1. trait function rewrite
- Type: function (trait)
- Variant: `trait-stability-zone`
- Research-directed: true
- Why: Add a stability zone so tiny personality noise learns slowly and large evidence learns faster
- From: parent implementation
- To: trait-stability-zone

### 2. md function rewrite
- Type: function (md)
- Variant: `meta-trend-verifier`
- Research-directed: true
- Why: Rebuild meta-learning verification with direction, magnitude and adaptive baseline speed
- From: parent implementation
- To: meta-trend-verifier

### 3. RPM2MPH
- Type: parameter

- Research-directed: false

- From: 0.00091792
- To: 0.0009130670069340779

## Research evidence

- [A Longitudinal Vehicle Speed Estimation Method Based on Adaptive Fusion of Kalman Filter and Wheel Speed](https://doi.org/10.1109/icaace69793.2026.11508740) — Crossref
- [Fusion of GPS/OSM/DEM Data by Particle Filtering for Vehicle Attitude Estimation](https://doi.org/10.23919/icif.2018.8455730) — Crossref
- [Improved Multi-Sensor Fusion by Federated Invariant Kalman Filtering for Underwater Vehicle State Estimation](https://doi.org/10.1109/icecie66637.2025.11363791) — Crossref
- [Sensor Fusion Estimation for Omni-Directional Vehicle with Mecanum Wheel](https://doi.org/10.1109/aris59192.2023.10268507) — Crossref
- [Efficient Path Estimation via Sensor Fusion of IMU, GPS, and Wheel Encoder and Control Parameter Optimization](https://doi.org/10.1109/icac64487.2024.10851042) — Crossref
- [GPS/Odometry/Map Fusion for Vehicle Positioning Using Potential Functions](https://doi.org/10.1002/9781119876045.ch4) — Crossref

## Validation

- Regressions: none
- Improvement: 85.06
- Lua SHA-256: `d5c3ef0897212878f08fa8a26753e592ca31e1abdca795b50756f6e030b29c67`
- LUAC SHA-256: `e847d35595c88f931223ca4f717c40fd695e47d4d64c35dde744be16fbbff09e`

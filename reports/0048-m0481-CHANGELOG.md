# 0048-m0481 changelog

- Family: monday
- Parent: generations/accepted/0042-m0422.lua
- Objective: truth prediction, calibration and sensor resilience
- Research-driven: true
- Dynamic whole-function rewrites: 2
- Simulator score: 86.454
- Passed: false

## Download files

- Lua source: `generations/candidates/0048-m0481.lua` (85932 bytes)
- MT12 normalized LUAC: `generations/candidates/0048-m0481.luac` (89126 bytes)

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
- To: 0.0009214285230669822

## Research evidence

- [A Longitudinal Vehicle Speed Estimation Method Based on Adaptive Fusion of Kalman Filter and Wheel Speed](https://doi.org/10.1109/icaace69793.2026.11508740) — Crossref
- [Fusion of GPS/OSM/DEM Data by Particle Filtering for Vehicle Attitude Estimation](https://doi.org/10.23919/icif.2018.8455730) — Crossref
- [Improved Multi-Sensor Fusion by Federated Invariant Kalman Filtering for Underwater Vehicle State Estimation](https://doi.org/10.1109/icecie66637.2025.11363791) — Crossref
- [Sensor Fusion Estimation for Omni-Directional Vehicle with Mecanum Wheel](https://doi.org/10.1109/aris59192.2023.10268507) — Crossref
- [Efficient Path Estimation via Sensor Fusion of IMU, GPS, and Wheel Encoder and Control Parameter Optimization](https://doi.org/10.1109/icac64487.2024.10851042) — Crossref
- [GPS/Odometry/Map Fusion for Vehicle Positioning Using Potential Functions](https://doi.org/10.1002/9781119876045.ch4) — Crossref

## Validation

- Regressions: none
- Improvement: 86.454
- Lua SHA-256: `fa2a7d061ff45eea34bf2bba0a046e1675f9084ae9eef28df56d24004e73dc88`
- LUAC SHA-256: `62a84b83540b21ecef91235e8dc143db93f4b95ad8f921b96d5b640db9727dd4`

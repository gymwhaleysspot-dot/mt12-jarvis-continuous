#pragma once
#ifdef __cplusplus
extern "C" {
#endif
float michael_clampf(float value, float low, float high);
float michael_smoothf(float current, float target, float response, float dt);
#ifdef __cplusplus
}
#endif

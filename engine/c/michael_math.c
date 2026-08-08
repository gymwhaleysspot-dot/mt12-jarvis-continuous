#include "michael_math.h"
#include <math.h>
float michael_clampf(float value, float low, float high) { return value < low ? low : (value > high ? high : value); }
float michael_smoothf(float current, float target, float response, float dt) {
  const float blend = 1.0f - expf(-response * michael_clampf(dt, 0.0f, 0.1f));
  return current + (target - current) * blend;
}

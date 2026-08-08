#include <cmath>
#include <cstdint>
#include "../c/michael_math.h"
#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#define MICHAEL_EXPORT EMSCRIPTEN_KEEPALIVE
#else
#define MICHAEL_EXPORT
#endif
namespace {
struct State { float exposure=1.18f, speed=0.0f, rpm=900.0f, heading=0.0f; std::uint32_t seed=0x7303u; } state;
}
extern "C" {
MICHAEL_EXPORT void michael_boot(std::uint32_t seed) { state = {}; state.exposure=1.18f; state.rpm=900.0f; state.seed=seed?seed:0x7303u; }
MICHAEL_EXPORT float michael_visual_tick(int drive, float frame_ms, float dt) {
  const float pressure=michael_clampf((frame_ms-16.7f)/24.0f,0.0f,1.0f);
  const float target=(drive?1.10f:1.22f)-pressure*0.06f;
  state.exposure=michael_smoothf(state.exposure,target,4.5f,dt);
  return state.exposure;
}
MICHAEL_EXPORT void michael_step(float dt,float throttle,float brake,float steer) {
  dt=michael_clampf(dt,0.0f,0.05f); throttle=michael_clampf(throttle,0.0f,1.0f); brake=michael_clampf(brake,0.0f,1.0f); steer=michael_clampf(steer,-1.0f,1.0f);
  const float drag=0.028f*state.speed*state.speed;
  state.speed=michael_clampf(state.speed+(19.0f*throttle-31.0f*brake-drag)*dt,0.0f,58.0f);
  state.heading+=steer*(0.25f+state.speed*0.035f)*dt;
  state.rpm=900.0f+state.speed*104.0f+throttle*1350.0f;
}
MICHAEL_EXPORT float michael_get_exposure(){return state.exposure;}
MICHAEL_EXPORT float michael_get_speed(){return state.speed;}
MICHAEL_EXPORT float michael_get_rpm(){return state.rpm;}
MICHAEL_EXPORT float michael_get_heading(){return state.heading;}
MICHAEL_EXPORT std::uint32_t michael_abi(){return 1u;}
}

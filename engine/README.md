# Michael V49 polyglot engine

Michael uses one browser ABI and several focused languages. C/C++ owns deterministic state and the calibrated exposure governor; Rust, Zig, and AssemblyScript provide optional WebAssembly accelerators; TypeScript owns orchestration; GLSL and WGSL own energy-aware GPU programs; Python, Lua, Go, and C# generate validated build-time data. Optional modules always fail open to the TypeScript fallback so a compiler or browser feature can never make the car disappear.

| Language | Responsibility | Browser artifact |
|---|---|---|
| C / C++ | deterministic vehicle state and visual exposure governor | `michael-core.js/.wasm` |
| Rust | particle budget and LOD scoring | `michael-rust.wasm` |
| Zig | spatial visibility hashing | `michael-zig.wasm` |
| AssemblyScript | frame-quality scoring | `michael-assembly.wasm` |
| TypeScript | capability-safe module loader and unified ABI | `michael-polyglot.js` |
| GLSL | WebGL2 PBR/post reference shaders | source contract |
| WGSL | WebGPU PBR/post reference shaders | source contract |
| Python | build manifest and artifact validation | `polyglot-manifest.json` |
| Lua | gameplay and quality policy | `michael-rules.json` |
| Go | reproducible toolchain inventory | `go-build.json` |
| C# | capability schema generator | `capability-schema.json` |

The Pages workflow builds every module, validates exports and generated JSON, then publishes the artifacts beside the existing Michael runtime.

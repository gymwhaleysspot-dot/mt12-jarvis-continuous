#!/usr/bin/env bash
set -euo pipefail

generated="jarvis/generated"
mkdir -p "$generated"

required=(em++ rustup cargo npm go dotnet lua5.4 curl python3 node)
missing=()
for tool in "${required[@]}"; do
  command -v "$tool" >/dev/null 2>&1 || missing+=("$tool")
done
if ((${#missing[@]})); then
  printf 'MICHAEL build prerequisites missing: %s\n' "${missing[*]}" >&2
  printf 'Install the pinned CI toolchain before building; this script never mutates its host.\n' >&2
  exit 2
fi

em++ -O3 -std=c++20 engine/cpp/michael_core.cpp engine/c/michael_math.c \
  -sWASM=1 -sMODULARIZE=1 -sEXPORT_ES6=1 -sENVIRONMENT=web \
  -sALLOW_MEMORY_GROWTH=0 -sINITIAL_MEMORY=16777216 \
  -sEXPORTED_FUNCTIONS='["_michael_boot","_michael_visual_tick","_michael_step","_michael_get_exposure","_michael_get_speed","_michael_get_rpm","_michael_get_heading","_michael_abi"]' \
  -o "$generated/michael-core.js"

rustup target add wasm32-unknown-unknown
cargo build --manifest-path engine/rust/Cargo.toml --release --target wasm32-unknown-unknown
cp engine/rust/target/wasm32-unknown-unknown/release/michael_rust.wasm "$generated/michael-rust.wasm"

npm ci --prefix engine --ignore-scripts
npm run --prefix engine build:typescript
npm run --prefix engine build:assembly

(cd engine/go && go run . ../../jarvis/generated/go-build.json)
dotnet run --project engine/csharp/Michael.Engine.csproj --configuration Release -- "$generated/capability-schema.json"
lua5.4 engine/lua/michael_rules.lua "$generated/michael-rules.json"

zig_archive="/tmp/michael-zig-0.16.0.tar.xz"
zig_root="/tmp/michael-zig-0.16.0"
curl -fsSL https://ziglang.org/download/0.16.0/zig-x86_64-linux-0.16.0.tar.xz -o "$zig_archive"
echo '70e49664a74374b48b51e6f3fdfbf437f6395d42509050588bd49abe52ba3d00  /tmp/michael-zig-0.16.0.tar.xz' | sha256sum -c -
mkdir -p "$zig_root"
tar -xf "$zig_archive" -C "$zig_root" --strip-components=1
"$zig_root/zig" build-exe engine/zig/michael_spatial.zig -target wasm32-freestanding -O ReleaseSmall -fno-entry -rdynamic -femit-bin="$generated/michael-zig.wasm"

python3 engine/python/build_manifest.py "$generated"

python3 -m json.tool engine/polyglot.json >/dev/null
for file in "$generated"/*.json; do python3 -m json.tool "$file" >/dev/null; done
node --check "$generated/michael-core.js"
node --check "$generated/michael-polyglot.js"
node - <<'NODE'
const fs=require('fs');
for(const file of ['michael-core.wasm','michael-rust.wasm','michael-assembly.wasm','michael-zig.wasm']){
  const path='jarvis/generated/'+file;
  if(!fs.existsSync(path))throw Error('Missing '+path);
  new WebAssembly.Module(fs.readFileSync(path));
}
const manifest=JSON.parse(fs.readFileSync('jarvis/generated/polyglot-manifest.json','utf8'));
if(manifest.engine!=='MICHAEL_V55'||manifest.languages.length!==12)throw Error('Wrong polyglot manifest');
for(const token of ['#version 300 es','MICHAEL_V55','energy-aware clearcoat'])if(!fs.readFileSync('engine/shaders/michael-v48.glsl','utf8').includes(token))throw Error('GLSL contract missing '+token);
for(const token of ['@vertex','@fragment','MICHAEL_V55'])if(!fs.readFileSync('engine/shaders/michael-v48.wgsl','utf8').includes(token))throw Error('WGSL contract missing '+token);
console.log({polyglot:'PASS',languages:manifest.languages,artifacts:manifest.artifacts.length});
NODE

rm -rf engine/node_modules engine/rust/target engine/csharp/bin engine/csharp/obj

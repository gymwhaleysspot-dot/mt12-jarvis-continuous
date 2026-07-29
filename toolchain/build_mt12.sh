#!/usr/bin/env bash
set -euo pipefail
if [[ $# -lt 1 || $# -gt 3 ]]; then echo "Usage: $0 source.lua [output.luac] [limit]" >&2; exit 1; fi
SRC=$1; OUT=${2:-${SRC%.lua}.luac}; LIMIT=${3:-88944}; RAW="${OUT%.luac}_raw.luac"; ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
command -v luac5.3 >/dev/null || { echo "luac5.3 missing" >&2; exit 1; }
luac5.3 -p "$SRC"
luac5.3 -s -o "$RAW" "$SRC"
node "$ROOT/toolchain/normalize_luac53_mt12.js" "$RAW" "$OUT"
rm -f "$RAW"
BYTES=$(wc -c < "$OUT" | tr -d ' ')
MARGIN=$((LIMIT-BYTES))
if (( BYTES > LIMIT )); then echo "FAIL $OUT is $BYTES bytes; limit $LIMIT; over by $((-MARGIN))" >&2; exit 2; fi
echo "PASS $OUT $BYTES bytes; $MARGIN bytes free under $LIMIT"

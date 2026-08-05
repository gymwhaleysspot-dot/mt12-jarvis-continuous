#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 <source.lua> [output.luac]" >&2
  exit 2
fi

SOURCE="$1"
[[ -f "$SOURCE" ]] || { echo "Source not found: $SOURCE" >&2; exit 2; }
[[ "$SOURCE" == *.lua ]] || { echo "Source must end in .lua" >&2; exit 2; }

OUTPUT="${2:-${SOURCE%.lua}.luac}"
RAW="${OUTPUT%.luac}_raw.luac"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$(dirname -- "$OUTPUT")"

cleanup() { rm -f -- "$RAW"; }
trap cleanup EXIT

if command -v luac5.3 >/dev/null 2>&1; then
  LUAC=luac5.3
elif command -v luac53 >/dev/null 2>&1; then
  LUAC=luac53
elif command -v luac >/dev/null 2>&1 && luac -v 2>&1 | grep -q '5\.3'; then
  LUAC=luac
else
  echo "Lua 5.3 compiler not found. Install package lua5.3." >&2
  exit 3
fi

VERSION="$($LUAC -v 2>&1 || true)"
grep -q '5\.3' <<<"$VERSION" || { echo "Wrong compiler: $VERSION" >&2; exit 3; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required." >&2; exit 3; }

rm -f -- "$RAW" "$OUTPUT"
"$LUAC" -p "$SOURCE"
"$LUAC" -s -o "$RAW" "$SOURCE"
node "$SCRIPT_DIR/normalize_luac53_mt12.js" "$RAW" "$OUTPUT"

SIZE="$(wc -c < "$OUTPUT" | tr -d '[:space:]')"
HEADER="$(od -An -tx1 -j12 -N5 "$OUTPUT" | tr -d ' \n')"
MAGIC="$(od -An -tx1 -N4 "$OUTPUT" | tr -d ' \n')"

[[ "$MAGIC" == "1b4c7561" ]] || { rm -f "$OUTPUT"; echo "Invalid Lua bytecode magic." >&2; exit 5; }
[[ "$HEADER" == "0404040404" ]] || { rm -f "$OUTPUT"; echo "Output is not MT12-normalized: $HEADER" >&2; exit 5; }

SHA="$(sha256sum "$OUTPUT" | awk '{print $1}')"
printf 'PASS: %s\nSize: %s bytes\nSHA-256: %s\nDeploy only this normalized .luac file.\n' "$OUTPUT" "$SIZE" "$SHA"

#!/usr/bin/env node
'use strict';

const fs = require('fs');

function die(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

if (process.argv.length !== 4) {
  die('usage: node normalize_luac53_mt12.js <desktop.luac> <mt12.luac>');
}

const inputPath = process.argv[2];
const outputPath = process.argv[3];
const input = fs.readFileSync(inputPath);
let offset = 0;
const chunks = [];

function need(n) {
  if (offset + n > input.length) die(`truncated chunk at byte ${offset}`);
}
function read(n) {
  need(n);
  const value = input.subarray(offset, offset + n);
  offset += n;
  return value;
}
function u8() { return read(1)[0]; }
function u32() { need(4); const v = input.readUInt32LE(offset); offset += 4; return v; }
function i64() { need(8); const v = input.readBigInt64LE(offset); offset += 8; return v; }
function f64() { need(8); const v = input.readDoubleLE(offset); offset += 8; return v; }
function sizeT64() { need(8); const v = input.readBigUInt64LE(offset); offset += 8; return v; }

function write(buffer) { chunks.push(buffer); }
function writeU8(v) { const b = Buffer.allocUnsafe(1); b[0] = v; write(b); }
function writeU32(v) { const b = Buffer.allocUnsafe(4); b.writeUInt32LE(v >>> 0); write(b); }
function writeI32(v) {
  if (v < -2147483648n || v > 2147483647n) die(`Lua integer ${v} does not fit MT12 32-bit range`);
  const b = Buffer.allocUnsafe(4);
  b.writeInt32LE(Number(v));
  write(b);
}
function writeF32(v) {
  if (!Number.isFinite(v)) die(`non-finite Lua number ${v} cannot be normalized safely`);
  const b = Buffer.allocUnsafe(4);
  b.writeFloatLE(v);
  write(b);
}

function readString() {
  let size = u8();
  if (size === 0) return null;
  if (size === 0xff) {
    const n = sizeT64();
    if (n > 0xffffffffn) die(`string length ${n} exceeds MT12 size_t range`);
    size = Number(n);
  }
  if (size < 1) die(`invalid string size at byte ${offset}`);
  return read(size - 1);
}

function writeString(value) {
  if (value === null) {
    writeU8(0);
    return;
  }
  const size = value.length + 1;
  if (size < 0xff) writeU8(size);
  else {
    writeU8(0xff);
    writeU32(size);
  }
  write(value);
}

function convertPrototype() {
  writeString(readString());
  writeU32(u32());
  writeU32(u32());
  writeU8(u8());
  writeU8(u8());
  writeU8(u8());

  let count = u32();
  writeU32(count);
  write(read(count * 4));

  count = u32();
  writeU32(count);
  for (let i = 0; i < count; i++) {
    const tag = u8();
    writeU8(tag);
    switch (tag) {
      case 0: break;
      case 1: writeU8(u8()); break;
      case 3: writeF32(f64()); break;
      case 19: writeI32(i64()); break;
      case 4:
      case 20: writeString(readString()); break;
      default: die(`unsupported constant tag ${tag} at byte ${offset - 1}`);
    }
  }

  count = u32();
  writeU32(count);
  write(read(count * 2));

  count = u32();
  writeU32(count);
  for (let i = 0; i < count; i++) convertPrototype();

  count = u32();
  writeU32(count);
  write(read(count * 4));

  count = u32();
  writeU32(count);
  for (let i = 0; i < count; i++) {
    writeString(readString());
    writeU32(u32());
    writeU32(u32());
  }

  count = u32();
  writeU32(count);
  for (let i = 0; i < count; i++) writeString(readString());
}

const signatureAndData = read(12);
if (!signatureAndData.equals(Buffer.from([0x1b,0x4c,0x75,0x61,0x53,0x00,0x19,0x93,0x0d,0x0a,0x1a,0x0a]))) {
  die('input is not a standard Lua 5.3 binary chunk');
}
write(signatureAndData);

const sizes = read(5);
if (!sizes.equals(Buffer.from([4,8,4,8,8]))) {
  die(`expected desktop Lua 5.3 sizes 4/8/4/8/8, got ${[...sizes].join('/')}`);
}
write(Buffer.from([4,4,4,4,4]));

const luacInt = i64();
if (luacInt !== 0x5678n) die('unexpected LUAC_INT or byte order');
writeI32(luacInt);

writeF32(f64());
writeU8(u8());
convertPrototype();

if (offset !== input.length) die(`${input.length - offset} trailing bytes remain`);
const output = Buffer.concat(chunks);
fs.writeFileSync(outputPath, output);
console.log(`${inputPath}: ${input.length} bytes`);
console.log(`${outputPath}: ${output.length} bytes (MT12 4/4/4/4/4)`);

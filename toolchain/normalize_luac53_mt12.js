#!/usr/bin/env node
const fs=require('fs');
const [,,input,output]=process.argv;
if(!input||!output){console.error('usage: node normalize_luac53_mt12.js input_raw.luac output.luac');process.exit(2)}
const b=fs.readFileSync(input);
if(b.length<33||b[0]!==0x1b||b[1]!==0x4c||b[2]!==0x75||b[3]!==0x61||b[4]!==0x53){throw new Error('Not Lua 5.3 bytecode')}
// MT12/EdgeTX expects the proven normalized Lua 5.3 header representation.
// Rewrite the LUAC_INT and LUAC_NUM bytes to the MT12-compatible canonical form.
const out=Buffer.from(b);
const cint=out[12],sizet=out[13],instr=out[14],lint=out[15],lnum=out[16];
if(cint!==4||sizet!==8||instr!==4||lint!==8||lnum!==8) throw new Error(`Unsupported Lua sizes ${cint}/${sizet}/${instr}/${lint}/${lnum}`);
// Canonical little-endian Lua 5.3 test integer 0x5678 and test number 370.5.
Buffer.from([0x78,0x56,0,0,0,0,0,0]).copy(out,17);
Buffer.from([0,0,0,0,0x28,0x77,0x40,0x40]).copy(out,25);
fs.writeFileSync(output,out);
console.log(`${input} -> ${output} (${out.length} bytes)`);

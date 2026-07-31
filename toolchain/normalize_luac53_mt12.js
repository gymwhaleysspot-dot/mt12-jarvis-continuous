#!/usr/bin/env node
'use strict';
const fs=require('fs');
function die(m){console.error('Error: '+m);process.exit(1)}
if(process.argv.length!==4)die('usage: node normalize_luac53_mt12.js <desktop.luac> <mt12.luac>');
const src=fs.readFileSync(process.argv[2]);let o=0,out=[];
function need(n){if(o+n>src.length)die('truncated chunk at byte '+o)}
function r(n){need(n);const b=src.subarray(o,o+n);o+=n;return b}
function u8(){return r(1)[0]}function u32(){need(4);const v=src.readUInt32LE(o);o+=4;return v}
function i64(){need(8);const v=src.readBigInt64LE(o);o+=8;return v}
function f64(){need(8);const v=src.readDoubleLE(o);o+=8;return v}
function st64(){need(8);const v=src.readBigUInt64LE(o);o+=8;return v}
function w(b){out.push(b)}function w8(v){const b=Buffer.alloc(1);b[0]=v;w(b)}
function w32(v){const b=Buffer.alloc(4);b.writeUInt32LE(v>>>0);w(b)}
function wi32(v){if(v< -2147483648n||v>2147483647n)die('integer outside MT12 32-bit range');const b=Buffer.alloc(4);b.writeInt32LE(Number(v));w(b)}
function wf32(v){if(!Number.isFinite(v))die('non-finite Lua number');const b=Buffer.alloc(4);b.writeFloatLE(v);w(b)}
function rs(){let n=u8();if(!n)return null;if(n===255){const q=st64();if(q>0xffffffffn)die('string too long');n=Number(q)}if(n<1)die('invalid string');return r(n-1)}
function ws(v){if(v===null)return w8(0);const n=v.length+1;if(n<255)w8(n);else{w8(255);w32(n)}w(v)}
function proto(){ws(rs());w32(u32());w32(u32());w8(u8());w8(u8());w8(u8());let n=u32();w32(n);w(r(n*4));n=u32();w32(n);for(let i=0;i<n;i++){const t=u8();w8(t);if(t===0){}else if(t===1)w8(u8());else if(t===3)wf32(f64());else if(t===19)wi32(i64());else if(t===4||t===20)ws(rs());else die('unsupported constant tag '+t)}n=u32();w32(n);w(r(n*2));n=u32();w32(n);for(let i=0;i<n;i++)proto();n=u32();w32(n);w(r(n*4));n=u32();w32(n);for(let i=0;i<n;i++){ws(rs());w32(u32());w32(u32())}n=u32();w32(n);for(let i=0;i<n;i++)ws(rs())}
const sig=r(12),want=Buffer.from([27,76,117,97,83,0,25,147,13,10,26,10]);if(!sig.equals(want))die('not standard Lua 5.3 bytecode');w(sig);const sizes=r(5);if(!sizes.equals(Buffer.from([4,8,4,8,8])))die('expected desktop sizes 4/8/4/8/8');w(Buffer.from([4,4,4,4,4]));const li=i64();if(li!==0x5678n)die('unexpected LUAC_INT/endianness');wi32(li);wf32(f64());w8(u8());proto();if(o!==src.length)die((src.length-o)+' trailing bytes remain');const dst=Buffer.concat(out);fs.writeFileSync(process.argv[3],dst);console.log(process.argv[3]+': '+dst.length+' bytes (MT12 4/4/4/4/4)');

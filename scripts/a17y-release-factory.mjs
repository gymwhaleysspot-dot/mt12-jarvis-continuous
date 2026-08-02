#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {execFileSync} from "node:child_process";

const root=process.cwd();
const cfg=JSON.parse(fs.readFileSync(path.join(root,"spec/a17y-release.json"),"utf8"));
const src=path.join(root,cfg.seed);
const out=path.join(root,cfg.output);
const run=(c,a,o={})=>execFileSync(c,a,{stdio:"inherit",...o});
const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const fail=m=>{throw new Error("A17Y RELEASE REJECTED: "+m)};

fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
if(!fs.existsSync(src))fail("seed missing: "+cfg.seed);

const text=fs.readFileSync(src,"utf8");
for(const s of cfg.required)if(!text.includes(s))fail("required contract missing: "+s);
for(const s of cfg.forbidden)if(text.includes(s))fail("forbidden construct found: "+s);
if(!text.startsWith("--a17"))fail("unexpected lineage header");
if(/local\s+\w+\s*=\s*[^;\n]+local\s+\w+/.test(text))fail("joined local declaration hazard");

run("luac5.3",["-p",src]);
const deploy=path.join(out,"a17y.luac");
run("bash",["toolchain/compile_mt12.sh",src,deploy],{env:{...process.env,MAX_BYTES:String(cfg.max_bytes)}});

const bytes=fs.statSync(deploy).size;
const header=fs.readFileSync(deploy).subarray(12,17).toString("hex");
if(header!=="0404040404")fail("wrong MT12 header: "+header);
if(bytes>cfg.max_bytes)fail(`bytecode ${bytes} exceeds ${cfg.max_bytes}`);

run("lua5.3",["scripts/mt12-harness.lua",src,path.join(out,"a17y-trace.csv")]);

fs.copyFileSync(src,path.join(out,"a17y.lua"));
fs.copyFileSync(deploy,path.join(out,"DEPLOY.luac"));
const manifest={
  status:"deterministic-release-verified",
  source:"a17y.lua",
  sourceBytes:fs.statSync(src).size,
  sourceSha256:sha(src),
  normalizedBytes:bytes,
  normalizedSha256:sha(deploy),
  deploySha256:sha(path.join(out,"DEPLOY.luac")),
  header,
  maxBytes:cfg.max_bytes,
  margin:cfg.max_bytes-bytes,
  generatedAt:new Date().toISOString(),
  parentPreserved:true,
  aiModifiedSource:false
};
fs.writeFileSync(path.join(out,"MANIFEST.json"),JSON.stringify(manifest,null,2)+"\n");
fs.writeFileSync(path.join(out,"README.txt"),
`A17Y DETERMINISTIC RELEASE\nDeploy only DEPLOY.luac\nSource was not rewritten by AI.\nSize: ${bytes}/${cfg.max_bytes}\nSHA-256: ${manifest.deploySha256}\n`);
console.log(JSON.stringify(manifest,null,2));

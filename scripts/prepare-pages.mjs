#!/usr/bin/env node
import fs from'node:fs';
const required=['index.html','classic-token.js','jarvis/app.css','jarvis/api.js','jarvis/state.js','jarvis/app.js','jarvis/capabilities.json'];
for(const file of required)if(!fs.existsSync(file))throw Error(`Missing ${file}`);
const index=fs.readFileSync('index.html','utf8');
for(const marker of ['JARVIS','jarvis/app.css','classic-token.js','jarvis/app.js','workspaceBody'])if(!index.includes(marker))throw Error(`index.html missing ${marker}`);
const routes={
  'chief.html':'intelligence','research.html':'intelligence','discovery.html':'intelligence','v3.html':'system',
  'mission.html':'command','builder.html':'factory','builds.html':'vehicle','completion.html':'releases',
  'control.html':'releases','device.html':'radio','updates.html':'firmware','web/index.html':'command'
};
const redirect=(route)=>`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=index.html#${route}"><title>Opening Jarvis</title></head><body><script>location.replace('index.html#${route}')</script><p>Opening Jarvis…</p></body></html>`;
for(const[path,route]of Object.entries(routes)){fs.mkdirSync(path.split('/').slice(0,-1).join('/')||'.',{recursive:true});fs.writeFileSync(path,redirect(route))}
console.log(`Jarvis platform prepared: ${required.length} core files and ${Object.keys(routes).length} compatibility routes.`);
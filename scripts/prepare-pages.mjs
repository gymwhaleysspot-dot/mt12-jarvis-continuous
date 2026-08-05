#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';
const root=process.cwd();
const routes={
  'chief.html':'intelligence','research.html':'intelligence','discovery.html':'intelligence','v3.html':'intelligence',
  'builds.html':'controllers','updates.html':'controllers',
  'mission.html':'command','completion.html':'controllers','builder.html':'factory',
  'control.html':'system','device.html':'system'
};
const required=['index.html','assets/jarvis-os.css','assets/jarvis-os.js','classic-token.js'];
const errors=[];for(const f of required)if(!fs.existsSync(path.join(root,f)))errors.push(`Missing ${f}`);
const redirect=(route,title)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=index.html#${route}"><title>${title} · Jarvis</title><script>location.replace('index.html#${route}')</script></head><body><p>Opening <a href="index.html#${route}">Jarvis ${title}</a>…</p></body></html>`;
for(const [file,route] of Object.entries(routes)){const full=path.join(root,file);fs.writeFileSync(full,redirect(route,route[0].toUpperCase()+route.slice(1)))}
const index=fs.existsSync(path.join(root,'index.html'))?fs.readFileSync(path.join(root,'index.html'),'utf8'):'';
for(const marker of ['Jarvis Engineering Intelligence','assets/jarvis-os.css','assets/jarvis-os.js','classic-token.js','data-route="command"','data-route="system"'])if(!index.includes(marker))errors.push(`index.html missing ${marker}`);
for(const [file,route] of Object.entries(routes)){const html=fs.readFileSync(path.join(root,file),'utf8');if(!html.includes(`index.html#${route}`))errors.push(`${file} redirect missing ${route}`)}
if(errors.length){console.error('JARVIS OS AUDIT FAILED');for(const e of errors)console.error(`- ${e}`);process.exit(1)}
console.log(`Jarvis OS audit passed: unified shell plus ${Object.keys(routes).length} compatibility redirects.`);

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pages=['index.html','mission.html','device.html','control.html','research.html','discovery.html','v3.html','updates.html','builder.html'];
const errors=[];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

if(!fs.existsSync(path.join(root,'site-nav.js')))errors.push('Missing site-nav.js');
for(const page of pages){
  const full=path.join(root,page);
  if(!fs.existsSync(full)){errors.push(`Missing published page: ${page}`);continue;}
  let html=fs.readFileSync(full,'utf8');
  if(!/<html[\s>]/i.test(html)||!/<body[\s>]/i.test(html))errors.push(`${page}: invalid HTML shell`);
  const localLinks=[...html.matchAll(/(?:href|location\.href)\s*=\s*["'`]([^"'`?#]+\.html)/gi)].map(m=>m[1]);
  for(const href of localLinks){
    if(/^(?:https?:)?\/\//i.test(href))continue;
    const target=path.normalize(path.join(path.dirname(page),href));
    if(!fs.existsSync(path.join(root,target)))errors.push(`${page}: broken local page link → ${href}`);
  }
  const workflowRefs=[...html.matchAll(/actions\/workflows\/([A-Za-z0-9._-]+\.ya?ml)|workflows\/([A-Za-z0-9._-]+\.ya?ml)\/dispatches/gi)]
    .map(m=>m[1]||m[2]).filter(Boolean);
  for(const wf of workflowRefs){
    if(!fs.existsSync(path.join(root,'.github/workflows',wf)))errors.push(`${page}: missing workflow → ${wf}`);
  }
  if(!html.includes('site-nav.js')){
    const tag='<script src="site-nav.js"></script>';
    if(/<\/body>/i.test(html))html=html.replace(/<\/body>/i,`${tag}</body>`);
    else html+=tag;
    fs.writeFileSync(full,html);
  }
}
const nav=read('site-nav.js');
for(const page of pages){if(!nav.includes(`'${page}'`))errors.push(`site-nav.js: missing route ${page}`);}
if(!nav.includes("['Home','index.html']"))errors.push('site-nav.js: explicit Home route missing');

if(errors.length){console.error('PAGES WIRING AUDIT FAILED');for(const e of errors)console.error(`- ${e}`);process.exit(1);}
for(const page of pages){const html=read(page);if(!html.includes('site-nav.js'))throw new Error(`${page}: navigation injection failed`);}
console.log(`Pages wiring audit passed: ${pages.length} pages, Home route, local links and workflow references verified.`);

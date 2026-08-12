import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=path.resolve(process.cwd());
const entry=path.resolve(root,process.argv[2]||'jarvis/mjx7303-racing-michael-v66.js');
const cache=new Map();
const seen=[];

function cleanSpecifier(s){return s.split('?')[0].split('#')[0]}
function resolve(spec,parent){
  if(!spec.startsWith('.'))throw new Error(`non-local import not allowed in Michael browser graph: ${spec} from ${parent}`);
  const p=path.resolve(path.dirname(parent),cleanSpecifier(spec));
  if(!p.startsWith(root+path.sep))throw new Error(`import escapes repository: ${spec} from ${parent}`);
  return p;
}
async function load(file){
  if(cache.has(file))return cache.get(file);
  const source=await fs.readFile(file,'utf8').catch(e=>{throw new Error(`missing module ${path.relative(root,file)}: ${e.message}`)});
  if(!source.trim())throw new Error(`empty module ${path.relative(root,file)}`);
  const mod=new vm.SourceTextModule(source,{identifier:pathToFileURL(file).href,initializeImportMeta(meta){meta.url=pathToFileURL(file).href}});
  cache.set(file,mod);seen.push(path.relative(root,file));
  await mod.link(async(spec,referencing)=>load(resolve(spec,fileURLToPath(referencing.identifier))));
  return mod;
}

const top=await load(entry);
if(top.status!=='linked')throw new Error(`entry did not link: ${top.status}`);
console.log(JSON.stringify({status:'PASS',entry:path.relative(root,entry),modules:seen.length,graph:seen.sort()},null,2));

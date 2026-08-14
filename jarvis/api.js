const OWNER='gymwhaleysspot-dot';
const REPO='mt12-jarvis-continuous';
const BASE=`https://api.github.com/repos/${OWNER}/${REPO}`;
const RAW=`https://raw.githubusercontent.com/${OWNER}/${REPO}/main/`;
function token(){
  const shared=window.A17YToken;
  const value=shared?.get?.()||localStorage.getItem('a17y_classic_pat')||localStorage.getItem('a17y_pat')||'';
  return /^ghp_[A-Za-z0-9_]{20,}$/.test(value)?value:'';
}
async function request(url,opt={}){
  const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(opt.headers||{})};
  const t=token();if(t)headers.Authorization=`Bearer ${t}`;
  const response=await fetch(url,{...opt,headers});
  const text=await response.text();let data=null;
  try{data=text?JSON.parse(text):null}catch{data=text}
  if(!response.ok)throw Error(`${response.status}: ${typeof data==='string'?data:(data?.message||text)}`);
  return data;
}
function safePath(path){return path.split('/').map(encodeURIComponent).join('/')}
async function content(path,ref='main'){return request(`${BASE}/contents/${safePath(path)}?ref=${encodeURIComponent(ref)}`)}
function decodeContent(result){
  const raw=atob((result?.content||'').replace(/\s/g,''));
  return new TextDecoder().decode(Uint8Array.from(raw,c=>c.charCodeAt(0)));
}
async function text(path,ref='main'){const result=await content(path,ref);if(Array.isArray(result))throw Error(`Expected file, got directory: ${path}`);return decodeContent(result)}
async function file(path,ref='main'){return JSON.parse(await text(path,ref))}
async function optionalFile(path,ref='main'){try{return await file(path,ref)}catch(error){if(String(error.message).startsWith('404:'))return null;throw error}}
async function optionalText(path,ref='main'){try{return await text(path,ref)}catch(error){if(String(error.message).startsWith('404:'))return null;throw error}}
async function list(path,ref='main'){const result=await content(path,ref);if(!Array.isArray(result))throw Error(`Expected directory, got file: ${path}`);return result}
function raw(path,ref='main'){return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${encodeURIComponent(ref)}/${path.split('/').map(encodeURIComponent).join('/')}`}
function github(path,ref='main'){return `https://github.com/${OWNER}/${REPO}/blob/${encodeURIComponent(ref)}/${path.split('/').map(encodeURIComponent).join('/')}`}
function bytesToBase64(bytes){let out='';const step=0x8000;for(let i=0;i<bytes.length;i+=step)out+=String.fromCharCode(...bytes.subarray(i,i+step));return btoa(out)}
async function putBytes(path,bytes,message,branch='main'){
  if(!token())throw Error('Connect the classic GitHub token before syncing.');
  const body={message,content:bytesToBase64(bytes instanceof Uint8Array?bytes:new Uint8Array(bytes)),branch};
  try{const old=await content(path,branch);if(old?.sha)body.sha=old.sha}catch(error){if(!String(error.message).startsWith('404:'))throw error}
  return request(`${BASE}/contents/${safePath(path)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
}
async function putText(path,value,message,branch='main'){return putBytes(path,new TextEncoder().encode(value),message,branch)}
async function dispatch(workflow,inputs={}){
  if(!token())throw Error('Connect the classic GitHub token before dispatching Jarvis workflows.');
  return request(`${BASE}/actions/workflows/${encodeURIComponent(workflow)}/dispatches`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ref:'main',inputs})});
}
export const GitHubAPI={OWNER,REPO,BASE,RAW,token,request,file,text,optionalFile,optionalText,content,list,raw,github,putBytes,putText,dispatch,
  user:()=>request('https://api.github.com/user'),
  rate:()=>request('https://api.github.com/rate_limit'),
  workflows:()=>request(`${BASE}/actions/workflows?per_page=100`),
  runs:(n=100)=>request(`${BASE}/actions/runs?per_page=${n}`),
  workflowRuns:(workflow,n=20)=>request(`${BASE}/actions/workflows/${encodeURIComponent(workflow)}/runs?per_page=${n}`),
  artifacts:id=>request(`${BASE}/actions/runs/${id}/artifacts?per_page=100`),
  releases:()=>request(`${BASE}/releases?per_page=50`),
  branches:()=>request(`${BASE}/branches?per_page=100`)
};

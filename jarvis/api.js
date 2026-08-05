const OWNER='gymwhaleysspot-dot';
const REPO='mt12-jarvis-continuous';
const BASE=`https://api.github.com/repos/${OWNER}/${REPO}`;
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
async function file(path,ref='main'){
  const safe=path.split('/').map(encodeURIComponent).join('/');
  const result=await request(`${BASE}/contents/${safe}?ref=${encodeURIComponent(ref)}`);
  const raw=atob((result.content||'').replace(/\s/g,''));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(raw,c=>c.charCodeAt(0))));
}
async function optionalFile(path,ref='main'){try{return await file(path,ref)}catch(error){if(String(error.message).startsWith('404:'))return null;throw error}}
async function dispatch(workflow,inputs={}){return request(`${BASE}/actions/workflows/${workflow}/dispatches`,{method:'POST',body:JSON.stringify({ref:'main',inputs})})}
export const GitHubAPI={OWNER,REPO,BASE,token,request,file,optionalFile,dispatch,
  user:()=>request('https://api.github.com/user'),
  rate:()=>request('https://api.github.com/rate_limit'),
  workflows:()=>request(`${BASE}/actions/workflows?per_page=100`),
  runs:(n=50)=>request(`${BASE}/actions/runs?per_page=${n}`),
  artifacts:id=>request(`${BASE}/actions/runs/${id}/artifacts?per_page=100`),
  releases:()=>request(`${BASE}/releases?per_page=50`),
  branches:()=>request(`${BASE}/branches?per_page=100`)
};
export const OWNER='gymwhaleysspot-dot',REPO='mt12-jarvis-continuous',BASE=`https://api.github.com/repos/${OWNER}/${REPO}`;
const KEY='a17y_classic_pat',REM='a17y_remember_pat',broker=()=>window.A17YToken;
export class GitHubClient{
 constructor(){this.token=broker()?.get()||sessionStorage.getItem(KEY)||localStorage.getItem(KEY)||'';this.rate={remaining:null,reset:null};window.addEventListener('a17y-token-change',e=>{this.token=e.detail?.token||''});}
 setToken(token,remember=false){const b=broker();if(b)b.set(token,remember);else{this.token=token.trim();sessionStorage.removeItem(KEY);localStorage.removeItem(KEY);localStorage.setItem(REM,remember?'1':'0');(remember?localStorage:sessionStorage).setItem(KEY,this.token)}this.token=token.trim();}
 clear(){const b=broker();if(b)b.clear();else{sessionStorage.removeItem(KEY);localStorage.removeItem(KEY);localStorage.removeItem(REM)}this.token='';}
 remembered(){return broker()?.remembered()??localStorage.getItem(REM)==='1';}
 headers(json=true){this.token=broker()?.get()||this.token;if(!/^(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}$/.test(this.token))throw Error('Enter a valid classic GitHub token.');const h={Accept:'application/vnd.github+json',Authorization:`Bearer ${this.token}`,'X-GitHub-Api-Version':'2022-11-28'};if(json)h['Content-Type']='application/json';return h;}
 async request(url,opt={},attempt=0){const r=await fetch(url,{...opt,headers:{...this.headers(opt.json!==false),...(opt.headers||{})}});this.rate.remaining=r.headers.get('x-ratelimit-remaining');this.rate.reset=r.headers.get('x-ratelimit-reset');if((r.status===403||r.status===429)&&attempt<3){const wait=Math.min(30000,1000*2**attempt);await new Promise(x=>setTimeout(x,wait));return this.request(url,opt,attempt+1);}const text=await r.text();if(!r.ok){let msg=text.slice(0,800);try{msg=JSON.parse(text).message||msg}catch{}const e=Error(`${r.status}: ${msg}`);e.status=r.status;throw e;}return r.status===204?null:(text?JSON.parse(text):null);}
 api(path,opt={}){return this.request(path.startsWith('http')?path:`${BASE}${path}`,opt);}
 async testPermissions(){const repo=await this.api('');const actions=await this.api('/actions/permissions');const ref=await this.api('/git/ref/heads/main');return{repo:repo.full_name,private:repo.private,actions:actions.enabled,sha:ref.object.sha,rate:this.rate};}
 async dispatch(workflow,ref,inputs){await this.api(`/actions/workflows/${workflow}/dispatches`,{method:'POST',body:JSON.stringify({ref,inputs})});}
 async runs(params='per_page=50'){return this.api(`/actions/runs?${params}`);}
 async artifacts(runId){return this.api(`/actions/runs/${runId}/artifacts?per_page=100`);}
 async jobs(runId){return this.api(`/actions/runs/${runId}/jobs?per_page=100`);}
 async cancel(runId){return this.api(`/actions/runs/${runId}/cancel`,{method:'POST'});}
 async rerun(runId){return this.api(`/actions/runs/${runId}/rerun-failed-jobs`,{method:'POST'});}
 async downloadArtifact(id,name='artifact.zip'){const r=await fetch(`${BASE}/actions/artifacts/${id}/zip`,{headers:this.headers(false)});if(!r.ok)throw Error(`Artifact download failed: ${r.status}`);const b=await r.blob(),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);}
}
export const sha256=async data=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(x=>x.toString(16).padStart(2,'0')).join('');
export const bytesToB64=buf=>{let s='',u=new Uint8Array(buf);for(let i=0;i<u.length;i+=24576)s+=String.fromCharCode(...u.subarray(i,i+24576));return btoa(s)};
export const safeName=n=>n.normalize('NFKD').replace(/[^\w.-]+/g,'-').replace(/^-+|-+$/g,'').slice(-90)||'file';
export const requestId=()=>`req-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(16)}`;
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));

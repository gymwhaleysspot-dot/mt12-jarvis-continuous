const ROOT='https://raw.githubusercontent.com/gymwhaleysspot-dot/mt12-jarvis-continuous/main/';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const human=n=>Number.isFinite(+n)?`${(+n/1024).toFixed(1)} KB`:'—';
function links(b){
  if(b.base){const p=b.base.replace(/^\/+|\/+$/g,'');return{luac:ROOT+p+'/candidate.luac',zip:ROOT+p+'/mission-build.zip',audit:ROOT+p+'/BUILD-AUDIT.txt'};}
  if(b.deploy)return{luac:ROOT+'public/builds/'+b.deploy,zip:null,audit:null};
  return{};
}
async function renderDownloads(){
  if(location.hash!=='#vehicle'&&location.hash!=='#releases'&&location.hash!=='#factory')return;
  const host=document.querySelector('#workspaceBody');if(!host||host.querySelector('#luacDownloads'))return;
  const section=document.createElement('section');section.className='grid';section.id='luacDownloads';
  section.innerHTML='<article class="card span-12"><h3>LUAC Downloads</h3><div class="muted">Loading normalized MT12 deploy files…</div></article>';
  host.prepend(section);
  try{
    const r=await fetch('public/builds/index.json',{cache:'no-store'});if(!r.ok)throw Error(`Build index ${r.status}`);const d=await r.json();
    const builds=(d.builds||[]).slice(0,30);
    section.innerHTML=`<article class="card span-12"><div class="row"><div><h3>LUAC Downloads</h3><div class="muted">Newest normalized deploy files. Put only the .luac on the MT12.</div></div><span class="chip">${builds.length} SHOWN</span></div><div class="list">${builds.map((b,i)=>{const l=links(b),name=b.release||b.mission||b.profile||`build-${i+1}`,auth=b.authority||'UNRATED',date=b.createdAt?new Date(b.createdAt).toLocaleString():'',sha=(b.luacSha256||'').slice(0,12);return`<div class="item"><div class="row"><div><div class="title">${esc(name)}</div><div class="meta">${esc(auth)} · ${human(b.luacBytes||b.normalizedBytes)}${date?' · '+esc(date):''}${sha?' · SHA '+esc(sha):''}</div></div><div class="actions">${l.luac?`<a class="btn primary" href="${esc(l.luac)}" download>DOWNLOAD LUAC</a>`:''}${l.zip?`<a class="btn" href="${esc(l.zip)}" download>FULL BUILD ZIP</a>`:''}${l.audit?`<a class="btn" href="${esc(l.audit)}" target="_blank" rel="noopener">AUDIT</a>`:''}</div></div></div>`}).join('')}</div></article>`;
  }catch(e){section.innerHTML=`<article class="card span-12"><h3>LUAC Downloads</h3><div class="muted">${esc(e.message)}</div></article>`}
}
const observer=new MutationObserver(()=>renderDownloads());observer.observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('hashchange',()=>setTimeout(renderDownloads,50));setTimeout(renderDownloads,500);

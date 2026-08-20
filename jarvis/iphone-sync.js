import{GitHubAPI as api}from'./api.js';
const allowed=/\.(csv|log|txt|json|lua|luac|ya?ml)$/i;
const extensionless=/^(m0|m1|gvbb)$/i;
const maxBytes=95*1024*1024;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s||'file').replace(/[^A-Za-z0-9._/-]+/g,'_').replace(/^\/+|\.\.(?=\/|$)/g,'').slice(-180);
const stamp=()=>new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
async function digest(file){const hash=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());return[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function saved(){try{return new Set(JSON.parse(localStorage.getItem('jarvis_iphone_sync_hashes')||'[]'))}catch{return new Set}}
function store(set){localStorage.setItem('jarvis_iphone_sync_hashes',JSON.stringify([...set].slice(-3000)))}
function supported(f){return f&&f.size>0&&f.size<=maxBytes&&(allowed.test(f.name)||extensionless.test(f.name)||/^gvbb/i.test(f.name))}
function setStatus(text,kind=''){const e=document.querySelector('#iphoneSyncStatus');if(e){e.textContent=text;e.className=`meta ${kind}`}}
async function repoHashes(){
 const out=new Set();
 try{
  const state=await api.optionalFile('factory/memory/mt12-sync-state.json');
  for(const h of state?.hashes||state?.sha256||[])if(typeof h==='string')out.add(h.toLowerCase());
  for(const f of state?.files||[])if(f?.sha256)out.add(String(f.sha256).toLowerCase());
 }catch{}
 return out;
}
export function iPhoneSyncPanel(state){const s=state.data['public/evidence-data/sync.json']||{};return`<section class="card accent" id="iphoneSyncPanel"><div class="row spread"><div><div class="kicker">IPHONE MT12 HELPER</div><h3>Import road evidence without a runner</h3><p class="muted">Connect the MT12 to the iPhone, choose its log files in Files, and Jarvis will hash, deduplicate, store and learn from them directly.</p></div><button class="btn primary" id="iphoneSyncButton">IMPORT FROM IPHONE</button></div><input id="iphoneSyncInput" type="file" multiple hidden><div class="loop"><div>1<b>OPEN FILES</b><span>select MT12 CSV / gvbb / m0 / m1</span></div><i>→</i><div>2<b>HASH</b><span>SHA-256 dedupe</span></div><i>→</i><div>3<b>STORE</b><span>logs/imported/&lt;sync&gt;</span></div><i>→</i><div>4<b>LEARN</b><span>index + replay + knowledge graph</span></div></div><div id="iphoneSyncStatus" class="meta">Ready. iOS Files will open when you tap Import from iPhone.</div><div class="chips"><span class="chip">LAST ${esc(s.state||'NONE')}</span><span class="chip">NEW ${Number(s.newFileCount||0)}</span><span class="chip">SKIPPED ${Number(s.duplicatesSkipped||0)}</span></div><p class="muted">The self-hosted helper is now optional. Use it for unattended computer sync; use this button when the MT12 is connected to the iPhone.</p></section>`}
export function wireIPhoneSync({refresh}){
 const button=document.querySelector('#iphoneSyncButton'),input=document.querySelector('#iphoneSyncInput');if(!button||!input)return;
 button.onclick=()=>{if(!api.token())return alert('Connect the classic GitHub token first.');input.value='';input.click()};
 input.onchange=async()=>{
  const all=[...input.files],files=all.filter(supported);if(!files.length)return setStatus('No supported MT12 evidence files were selected. Select radio CSV, gvbb, m0 or m1 files.','bad');
  button.disabled=true;const known=saved(),remote=await repoHashes();for(const h of remote)known.add(h);
  const session=`iphone-${stamp()}`,base=`logs/imported/${session}`;let uploaded=0,skipped=0;const records=[];
  try{
   setStatus(`Reading ${files.length} MT12 evidence files…`);
   for(let i=0;i<files.length;i++){
    const f=files[i],hash=(await digest(f)).toLowerCase(),relative=clean(f.webkitRelativePath||f.name);
    if(known.has(hash)){skipped++;records.push({path:relative,name:f.name,size:f.size,sha256:hash,status:'duplicate'});continue}
    setStatus(`Uploading ${i+1}/${files.length}: ${f.name}`);
    await api.putBytes(`${base}/${relative}`,new Uint8Array(await f.arrayBuffer()),`Import iPhone MT12 evidence ${session}`);
    known.add(hash);uploaded++;records.push({path:relative,name:f.name,size:f.size,sha256:hash,status:'uploaded',modifiedAt:new Date(f.lastModified||Date.now()).toISOString()});
   }
   store(known);
   const manifest={schema:1,syncId:session,source:'iPhone Files picker',state:'IMPORTED',stage:'learning-queued',updatedAt:new Date().toISOString(),newFileCount:uploaded,duplicatesSkipped:skipped,backupCreated:false,startLearning:true,files:records,newFiles:records.filter(r=>r.status==='uploaded'),message:`Imported ${uploaded} new MT12 evidence files; skipped ${skipped} duplicates.`};
   await api.putText(`${base}/SYNC-MANIFEST.json`,JSON.stringify(manifest,null,2)+'\n',`Publish iPhone MT12 sync manifest ${session}`);
   await api.putText('public/evidence-data/sync.json',JSON.stringify(manifest,null,2)+'\n',`Publish latest iPhone MT12 sync state ${session}`);
   setStatus('Evidence stored. Starting attribution, replay and learning…','ok');
   for(const wf of ['log-index.yml','historical-log-reingest.yml','jarvis-knowledge-graph.yml'])await api.dispatch(wf,{});
   setStatus(`Complete: ${uploaded} new files stored, ${skipped} duplicates skipped. Jarvis learning started.`,'ok');
   await refresh();
  }catch(error){console.error(error);setStatus(`Sync failed: ${error.message}`,'bad');alert(error.message)}finally{button.disabled=false}
 };
}

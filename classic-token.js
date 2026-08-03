(()=>{
'use strict';
const KEY='a17y_classic_pat',REM='a17y_remember_pat',EVENT='a17y-token-change';
const legacy=['a17y_pat','a17y_token','github_pat','github_token','classic_pat','jarvis_pat','mt12_pat','a17y_classic_token'];
const valid=v=>typeof v==='string'&&/^(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}$/.test(v.trim());
let busy=false;
const rawSet=Storage.prototype.setItem,rawRemove=Storage.prototype.removeItem;
function stores(){return[sessionStorage,localStorage]}
function find(){for(const s of stores())for(const k of [KEY,...legacy]){const v=s.getItem(k);if(valid(v))return{value:v.trim(),remember:s===localStorage||localStorage.getItem(REM)==='1'}}return{value:'',remember:false}}
function publish(value,remember=false){if(busy)return;busy=true;try{for(const s of stores()){rawRemove.call(s,KEY);for(const k of legacy)rawRemove.call(s,k)}if(value){rawSet.call(remember?localStorage:sessionStorage,KEY,value);rawSet.call(localStorage,REM,remember?'1':'0')}else rawRemove.call(localStorage,REM)}finally{busy=false}window.dispatchEvent(new CustomEvent(EVENT,{detail:{token:value,remember}}));}
const initial=find();if(initial.value)publish(initial.value,initial.remember);
Storage.prototype.setItem=function(k,v){rawSet.call(this,k,v);if(busy)return;if(k===REM)return;if(k===KEY||legacy.includes(k)||(/(?:token|pat)/i.test(k)&&valid(v)))publish(String(v).trim(),this===localStorage||localStorage.getItem(REM)==='1')};
Storage.prototype.removeItem=function(k){rawRemove.call(this,k);if(busy)return;if(k===KEY||legacy.includes(k))publish('',false)};
window.A17YToken={key:KEY,event:EVENT,get:()=>find().value,remembered:()=>find().remember,set:(v,r=false)=>{if(!valid(v))throw Error('Enter a valid classic GitHub token.');publish(v.trim(),!!r)},clear:()=>publish('',false),valid};
window.addEventListener('storage',e=>{if(e.key===KEY||legacy.includes(e.key)||e.key===REM){const x=find();window.dispatchEvent(new CustomEvent(EVENT,{detail:{token:x.value,remember:x.remember}}))}});
})();

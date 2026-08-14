(()=>{
'use strict';
const KEY='a17y_classic_pat',REM='a17y_remember_pat',EVENT='a17y-token-change';
const legacy=['a17y_pat','a17y_token','a17y_director_classic_pat','jarvis_classic_pat','github_pat','github_token','gh_token','jarvis_token','classic_pat','jarvis_pat','mt12_pat','a17y_classic_token'];
const valid=v=>typeof v==='string'&&/^ghp_[A-Za-z0-9_]{20,}$/.test(v.trim());
let busy=false;
const rawGet=Storage.prototype.getItem,rawSet=Storage.prototype.setItem,rawRemove=Storage.prototype.removeItem;
function stores(){return[sessionStorage,localStorage]}
function direct(s,k){return rawGet.call(s,k)}
function find(){for(const s of stores())for(const k of [KEY,...legacy]){const v=direct(s,k);if(valid(v))return{value:v.trim(),remember:s===localStorage||direct(localStorage,REM)==='1'}}return{value:'',remember:false}}
function publish(value,remember=false){if(busy)return;busy=true;try{for(const s of stores()){rawRemove.call(s,KEY);for(const k of legacy)rawRemove.call(s,k)}if(value){rawSet.call(remember?localStorage:sessionStorage,KEY,value);rawSet.call(localStorage,REM,remember?'1':'0')}else rawRemove.call(localStorage,REM)}finally{busy=false}window.dispatchEvent(new CustomEvent(EVENT,{detail:{token:value,remember}}));}
const initial=find();if(initial.value)publish(initial.value,initial.remember);
Storage.prototype.getItem=function(k){if(k===KEY||legacy.includes(k)){const x=find().value;if(x)return x}return rawGet.call(this,k)};
Storage.prototype.setItem=function(k,v){rawSet.call(this,k,v);if(busy)return;if(k===REM)return;if(k===KEY||legacy.includes(k)||(/(?:token|pat)/i.test(k)&&valid(v)))publish(String(v).trim(),this===localStorage||direct(localStorage,REM)==='1')};
Storage.prototype.removeItem=function(k){if(k===KEY||legacy.includes(k)){publish('',false);return}rawRemove.call(this,k)};
window.A17YToken={key:KEY,event:EVENT,get:()=>find().value,remembered:()=>find().remember,set:(v,r=false)=>{if(!valid(v))throw Error('Enter a valid classic GitHub PAT beginning with ghp_.');publish(v.trim(),!!r)},clear:()=>publish('',false),valid};
window.addEventListener('storage',e=>{if(e.key===KEY||legacy.includes(e.key)||e.key===REM){const x=find();window.dispatchEvent(new CustomEvent(EVENT,{detail:{token:x.value,remember:x.remember}}))}});
})();

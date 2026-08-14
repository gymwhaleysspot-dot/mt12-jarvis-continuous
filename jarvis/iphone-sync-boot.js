import{state,refresh}from'./state.js';
import{iPhoneSyncPanel,wireIPhoneSync}from'./iphone-sync.js';
let busy=false;
function patch(){if(busy||state.workspace!=='evidence')return;const old=document.querySelector('#jarvisSync');if(!old)return;const section=old.closest('section.grid');if(!section)return;busy=true;section.outerHTML=iPhoneSyncPanel(state);wireIPhoneSync({refresh});busy=false}
new MutationObserver(()=>queueMicrotask(patch)).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(patch,0));
setTimeout(patch,0);

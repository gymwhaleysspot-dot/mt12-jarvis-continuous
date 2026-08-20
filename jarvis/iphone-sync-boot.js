import{state,refresh}from'./state.js';
import{iPhoneSyncPanel,wireIPhoneSync}from'./iphone-sync.js';
let wiring=false;
function mount(){
 if(wiring||state.workspace!=='evidence')return;
 const syncButton=document.querySelector('#syncMT12');
 if(!syncButton)return;
 const roadSection=syncButton.closest('section');
 if(!roadSection||document.querySelector('#iphoneSyncPanel'))return;
 wiring=true;
 roadSection.insertAdjacentHTML('afterend',iPhoneSyncPanel(state));
 wireIPhoneSync({refresh});
 wiring=false;
}
new MutationObserver(()=>queueMicrotask(mount)).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(mount,0));
setTimeout(mount,0);

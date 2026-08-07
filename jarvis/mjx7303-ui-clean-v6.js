(()=>{
'use strict';
const CSS=`
body[data-mode="garage"] .garage-card{display:none!important}
body[data-mode="garage"] .garage-ui{left:50%!important;right:auto!important;bottom:10px!important;transform:translateX(-50%);max-width:94vw!important;pointer-events:none}
body[data-mode="garage"] .garage-ui .cam{pointer-events:auto;justify-content:center;background:#050b12b8;border:1px solid #29485c;border-radius:999px;padding:5px 7px;backdrop-filter:blur(12px);box-shadow:0 8px 28px #0007}
body[data-mode="garage"] .garage-ui .cam button{padding:6px 8px!important;border-radius:999px!important;font-size:9px!important;background:#0a1721cc!important}
body[data-mode="garage"] .badge{left:10px!important;right:auto!important;bottom:10px!important;max-width:42vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.7}
body[data-mode="garage"] .real-garage{top:64px!important;right:10px!important;bottom:auto!important;width:min(310px,82vw)!important;max-height:calc(100% - 132px)!important;transform:translateX(calc(100% + 24px));opacity:0;pointer-events:none;transition:transform .26s ease,opacity .2s ease!important;background:#050d15f4!important}
body[data-mode="garage"] .real-garage.rg-open{transform:translateX(0);opacity:1;pointer-events:auto}
.rg-toggle{position:absolute;right:12px;top:12px;z-index:12;border:1px solid #3a6c87;background:#091823e8;color:#f2fbff;border-radius:999px;padding:9px 13px;font:850 10px system-ui;letter-spacing:.08em;box-shadow:0 8px 30px #0008;backdrop-filter:blur(12px)}
.rg-toggle.active{background:#153a50}
@media(max-width:760px){body[data-mode="garage"] .real-garage{left:8px!important;right:8px!important;top:auto!important;bottom:64px!important;width:auto!important;max-height:58%!important;transform:translateY(calc(100% + 90px))!important}body[data-mode="garage"] .real-garage.rg-open{transform:translateY(0)!important}.rg-toggle{top:10px;right:10px}body[data-mode="garage"] .garage-ui{bottom:8px!important;width:96vw}body[data-mode="garage"] .garage-ui .cam{overflow-x:auto;justify-content:flex-start;flex-wrap:nowrap!important}body[data-mode="garage"] .garage-ui .cam button{flex:0 0 auto}.badge{display:none!important}}
`;
const style=document.createElement('style');style.textContent=CSS;document.head.appendChild(style);
let mounted=false;
function mount(){if(mounted)return;const view=document.getElementById('garageView'),panel=document.querySelector('.real-garage');if(!view||!panel)return;mounted=true;const b=document.createElement('button');b.className='rg-toggle';b.textContent='UPGRADES / TUNE';b.onclick=()=>{const open=panel.classList.toggle('rg-open');b.classList.toggle('active',open);b.textContent=open?'CLOSE GARAGE':'UPGRADES / TUNE'};view.appendChild(b);panel.addEventListener('click',e=>e.stopPropagation());}
const mo=new MutationObserver(mount);mo.observe(document.documentElement,{childList:true,subtree:true});addEventListener('DOMContentLoaded',mount,{once:true});mount();
})();

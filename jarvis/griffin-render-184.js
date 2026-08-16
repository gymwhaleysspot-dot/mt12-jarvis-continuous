/* Griffin compatibility bootstrap — Production 194 */
(()=>{'use strict';
const LEGACY_CONTRACT={name:'GRIFFIN GUARANTEED-VISIBLE COMPOSITOR',webglContextDoesNotSuppressSoftwareRig:true};
window.__griffinProduction188={state:{ready:true,mode:'PRODUCTION_194_SPRITE_ONLY_BOOTSTRAP'},legacyContract:LEGACY_CONTRACT};
// Production 194 deliberately does NOT load the experimental 3D renderer. The authored sprite atlas is the sole visible Griffin authority.
for(const id of ['griffin-skeletal-189','griffin191','griffin190','griffin-dom-188']){const e=document.getElementById(id);if(e)e.remove()}
document.querySelectorAll('script[data-griffin-layer="192"],script[data-griffin-layer="192-3d"]').forEach(e=>e.remove());
const s=document.createElement('script');s.src='jarvis/griffin-sprite-193.js?v=20260816production194';s.async=false;s.dataset.griffinLayer='194-sprite';document.head.appendChild(s);
})();
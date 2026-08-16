/* Production 192 — detailed computer-generated 3D Griffin render authority.
   The real skinned WebGL2 mesh is primary. Production 191 is loaded only as a failure fallback. */
(()=>{'use strict';
const state={version:192,ready:true,mode:'DETAILED_COMPUTER_GENERATED_3D',primary:'SKELETAL_GLTF_3D',fallback:'PREMIUM_CEL_FIGHTER',drawFrames:0,fallbackVisible:true};
function load(src,key){const s=document.createElement('script');s.src=src;s.async=false;s.dataset.griffinLayer=key;document.head.appendChild(s)}
load('jarvis/griffin-skeletal-189.js?v=20260816production192','192-3d');
load('jarvis/griffin-remake-191.js?v=20260816production191','191-fallback');
function sync(){const r=window.__griffinProduction189?.state,fb=document.getElementById('griffin191');const live=!!(r&&r.assetReady&&r.drawFrames>=3&&!r.errors?.length);state.drawFrames=r?.drawFrames||0;state.fallbackVisible=!live;if(fb){fb.style.display=live?'none':'';fb.style.visibility=live?'hidden':'visible'}const cv=document.getElementById('griffin-skeletal-189');if(cv)cv.style.zIndex='5';requestAnimationFrame(sync)}requestAnimationFrame(sync);
window.__griffinProduction192={state};console.info('PRODUCTION_192_3D_AUTHORITY_READY',state);
})();
function addLuaLinks(){
  document.querySelectorAll('.hypothesis .actions').forEach(actions=>{
    if(actions.querySelector('[data-source-lua]'))return;
    const luac=[...actions.querySelectorAll('a')].find(a=>/\.luac(?:$|\?)/i.test(a.getAttribute('href')||''));
    if(!luac)return;
    const href=luac.getAttribute('href');
    const lua=document.createElement('a');
    lua.className=luac.className||'btn tiny-btn';
    lua.href=href.replace(/\.luac(?=$|\?)/i,'.lua');
    lua.textContent='LUA';
    lua.setAttribute('download','');
    lua.dataset.sourceLua='1';
    luac.insertAdjacentElement('afterend',lua);
  });
}
addLuaLinks();
new MutationObserver(addLuaLinks).observe(document.documentElement,{subtree:true,childList:true});

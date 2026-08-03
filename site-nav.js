(()=>{
  'use strict';
  const pages=[['Home','index.html'],['Aegis','chief.html'],['Missions','mission.html'],['Completion','completion.html'],['Device','device.html'],['Control','control.html'],['Research','research.html'],['Discovery','discovery.html'],['OS v3','v3.html'],['Updates','updates.html'],['Builder Lite','builder.html']];
  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if(current==='index.html')import('./home/enhancements.js').catch(e=>console.error('Home enhancements failed',e));
  if(document.getElementById('a17y-global-nav'))return;
  if(!document.querySelector('link[href="site-nav.css"]')){const link=document.createElement('link');link.rel='stylesheet';link.href='site-nav.css';document.head.appendChild(link)}
  const nav=document.createElement('nav');nav.id='a17y-global-nav';nav.setAttribute('aria-label','A17Y Engineering OS pages');
  for(const [label,href] of pages){const a=document.createElement('a');a.href=href;a.textContent=label;if(href==='index.html')a.classList.add('home');if(current===href.toLowerCase())a.setAttribute('aria-current','page');nav.appendChild(a)}
  document.body.appendChild(nav);const toggle=document.createElement('button');toggle.id='a17y-nav-toggle';toggle.type='button';toggle.textContent='☰';toggle.title='Show or hide page navigation';let visible=true;toggle.onclick=()=>{visible=!visible;nav.style.display=visible?'flex':'none';toggle.textContent=visible?'☰':'⌂'};document.body.appendChild(toggle);
})();

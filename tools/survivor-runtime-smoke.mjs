import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit, devices } from 'playwright';
const engineName=process.argv[2]||'chromium', engine=engineName==='webkit'?webkit:chromium;
const url=process.env.SURVIVOR_URL||'http://127.0.0.1:4173/survivor.html';
const expectedProduction=Number(process.env.SURVIVOR_EXPECTED_PRODUCTION||300), expectedSha=process.env.SURVIVOR_EXPECTED_SHA||'';
const out=path.resolve(process.env.SURVIVOR_SMOKE_OUT||`artifacts/survivor-${engineName}`);fs.mkdirSync(out,{recursive:true});
const consoleMessages=[],pageErrors=[],requestFailures=[];const browser=await engine.launch({headless:true});
try{
 const iphone=devices['iPhone 15']||devices['iPhone 14'];const context=await browser.newContext(engineName==='webkit'&&iphone?{...iphone}:{viewport:{width:390,height:844},deviceScaleFactor:2});const page=await context.newPage();
 await page.addInitScript(()=>{globalThis.__SURVIVOR_TEST_CAPTURE__={errors:[],rejections:[]};addEventListener('error',e=>globalThis.__SURVIVOR_TEST_CAPTURE__.errors.push(String(e.message||e.error||'')));addEventListener('unhandledrejection',e=>globalThis.__SURVIVOR_TEST_CAPTURE__.rejections.push(String(e.reason||'')))});
 page.on('console',m=>consoleMessages.push({type:m.type(),text:m.text()}));page.on('pageerror',e=>pageErrors.push({message:e.message,stack:e.stack||''}));page.on('requestfailed',r=>requestFailures.push({url:r.url(),error:r.failure()?.errorText||'unknown'}));
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});await page.click('#deploy');await page.waitForTimeout(2600);
 const state=await page.evaluate(()=>({runtime:globalThis.__JARVIS_SURVIVOR_RUNTIME__||null,expected:globalThis.__SURVIVOR_EXPECTED_RUNTIME__||null,deploySha:globalThis.__SURVIVOR_DEPLOY_SHA__||null,dataset:document.documentElement.dataset.survivorRuntime||null,game:globalThis.JarvisSurvivor?.getState?.()||null,capture:globalThis.__SURVIVOR_TEST_CAPTURE__||null,canvasCount:document.querySelectorAll('canvas').length}));
 const result={engine:engineName,url,expectedProduction,expectedSha,state,consoleMessages,pageErrors,requestFailures};fs.writeFileSync(path.join(out,'runtime.json'),JSON.stringify(result,null,2)+'\n');await page.screenshot({path:path.join(out,'boot.png'),fullPage:true});
 const g=state.game||{};const failed=state.runtime?.production!==expectedProduction||Number(state.dataset)!==expectedProduction||state.canvasCount!==1||g.stage!==1||g.round!==1||g.opponent!=='LIRA'||g.arena!=='lira-nexus-v1.webp'||g.bossId!=='B1'||g.targetId!=='B1'||(expectedSha&&state.deploySha!==expectedSha)||pageErrors.length||state.capture?.errors?.length||state.capture?.rejections?.length;
 if(failed){console.error(JSON.stringify(result,null,2));process.exitCode=1}else console.log(JSON.stringify({engine:engineName,runtime:state.runtime.production,stage:g.stage,opponent:g.opponent,arena:g.arena,result:'PASS'}));
}finally{await browser.close()}

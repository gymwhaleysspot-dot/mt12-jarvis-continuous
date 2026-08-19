import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit, devices } from 'playwright';

const engineName=process.argv[2]||'chromium';
const engine=engineName==='webkit'?webkit:chromium;
const url=process.env.SURVIVOR_URL||'http://127.0.0.1:4173/survivor.html';
const expectedProduction=Number(process.env.SURVIVOR_EXPECTED_PRODUCTION||236);
const expectedSha=process.env.SURVIVOR_EXPECTED_SHA||'';
const out=path.resolve(process.env.SURVIVOR_SMOKE_OUT||`artifacts/survivor-${engineName}`);
fs.mkdirSync(out,{recursive:true});

const consoleMessages=[],pageErrors=[],requestFailures=[],responses=[];
const browser=await engine.launch({headless:true});
try{
 const iphone=devices['iPhone 15']||devices['iPhone 14']||devices['iPhone 13'];
 const context=await browser.newContext(engineName==='webkit'&&iphone?{...iphone}:{viewport:{width:390,height:844},deviceScaleFactor:2});
 const page=await context.newPage();
 await page.addInitScript(()=>{
  globalThis.__SURVIVOR_TEST_CAPTURE__={errors:[],rejections:[],startedAt:Date.now()};
  addEventListener('error',e=>globalThis.__SURVIVOR_TEST_CAPTURE__.errors.push({message:String(e.message||''),filename:String(e.filename||''),line:Number(e.lineno||0),column:Number(e.colno||0),stack:String(e.error?.stack||'')}));
  addEventListener('unhandledrejection',e=>globalThis.__SURVIVOR_TEST_CAPTURE__.rejections.push(String(e.reason?.stack||e.reason||'')));
 });
 page.on('console',msg=>consoleMessages.push({type:msg.type(),text:msg.text(),location:msg.location()}));
 page.on('pageerror',error=>pageErrors.push({name:error.name,message:error.message,stack:error.stack||''}));
 page.on('requestfailed',request=>requestFailures.push({url:request.url(),error:request.failure()?.errorText||'unknown'}));
 page.on('response',response=>{if(/survivor|Havok/i.test(response.url()))responses.push({url:response.url(),status:response.status()})});
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForTimeout(1800);
 const state=await page.evaluate(()=>({
  boot:globalThis.__JARVIS_SURVIVOR_BOOT__||null,
  runtime:globalThis.__JARVIS_SURVIVOR_RUNTIME__||null,
  capture:globalThis.__SURVIVOR_TEST_CAPTURE__||null,
  expected:globalThis.__SURVIVOR_EXPECTED_RUNTIME__||null,
  deploySha:globalThis.__SURVIVOR_DEPLOY_SHA__||null,
  blockerText:document.querySelector('#start .panel')?.innerText||'',
  htmlDataset:document.documentElement.dataset.survivorRuntime||null
 }));
 const result={engine:engineName,url,expectedProduction,expectedSha,state,consoleMessages,pageErrors,requestFailures,responses};
 fs.writeFileSync(path.join(out,'runtime.json'),JSON.stringify(result,null,2)+'\n');
 await page.screenshot({path:path.join(out,'boot.png'),fullPage:true});
 const coreFailure=requestFailures.some(x=>/core-survivor-236\.js/.test(x.url));
 const wrongRuntime=state.runtime?.production!==expectedProduction;
 const blocked=/BUILD\s+MISMATCH/i.test(state.blockerText);
 const badSha=!!expectedSha&&state.deploySha!==expectedSha;
 const failed=wrongRuntime||blocked||badSha||coreFailure||pageErrors.length>0||(state.capture?.errors?.length||0)>0||(state.capture?.rejections?.length||0)>0;
 if(failed){console.error(JSON.stringify(result,null,2));process.exitCode=1}else console.log(JSON.stringify({engine:engineName,runtime:state.runtime?.production,deploySha:state.deploySha,result:'PASS'}));
} finally { await browser.close(); }

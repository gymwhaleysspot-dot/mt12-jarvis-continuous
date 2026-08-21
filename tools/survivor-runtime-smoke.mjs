import fs from 'node:fs';
import path from 'node:path';
import {chromium,webkit,devices} from 'playwright';

const engineName=process.argv[2]||'chromium';
const engine=engineName==='webkit'?webkit:chromium;
const url=process.env.SURVIVOR_URL||'http://127.0.0.1:4173/survivor-runtime323.html';
const expectedProduction=Number(process.env.SURVIVOR_EXPECTED_PRODUCTION||323);
const out=path.resolve(process.env.SURVIVOR_SMOKE_OUT||`artifacts/survivor-${engineName}`);
fs.mkdirSync(out,{recursive:true});

const isTransientClosure=e=>/Target page, context or browser has been closed|browser has been closed|page has been closed|context has been closed/i.test(String(e?.message||e));

async function runAttempt(attempt){
  const pageErrors=[],consoleErrors=[];
  const browser=await engine.launch({headless:true});
  let context,page;
  try{
    const iphone=devices['iPhone 15']||devices['iPhone 14'];
    context=await browser.newContext(engineName==='webkit'&&iphone?{...iphone}:{viewport:{width:390,height:844},deviceScaleFactor:2});
    page=await context.newPage();
    page.on('pageerror',e=>pageErrors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    await page.click('#deploy');
    await page.waitForTimeout(500);
    const clockA=await page.locator('#clock').textContent();
    await page.waitForTimeout(8500);
    const state=await page.evaluate(()=>{
      const runtime=globalThis.__JARVIS_SURVIVOR_RUNTIME__||null;
      const api=globalThis.JarvisSurvivor;
      const replay=api?.getReplay?.()||{events:[],frames:[]};
      const round=document.querySelector('#round')?.textContent||'';
      const rival=document.querySelector('#rival')?.textContent||'';
      const clock=document.querySelector('#clock')?.textContent||'';
      const start=document.querySelector('#start');
      const eventTypes=replay.events.map(e=>e.type);
      const source=[...document.scripts].map(script=>script.textContent||'').join('\n');
      const earnedAscensionContract=source.includes("transform(h,target,'EARNED_ASCENSION')")&&source.includes('h.skillStock>=1.35&&elapsed>=12')&&source.includes('h.hp/h.maxHp<.42')&&source.includes('elapsed>24');
      return {
        runtime,levels:runtime?.levels||0,modelRenderer:runtime?.modelRenderer||0,choreography:runtime?.choreography||0,
        replaySchema:replay.schema,eventCount:replay.events.length,frameCount:replay.frames.length,
        bootFirst:eventTypes[0]==='RUNTIME_BOOT',levelBind:eventTypes.includes('LEVEL_BIND'),
        transformed:eventTypes.includes('TRANSFORMATION_COMPLETE')&&replay.frames.some(f=>f.hero?.form>=1),
        earnedAscensionContract,
        finiteProgression:replay.frames.every(f=>Number.isFinite(f.hero?.form)&&Number.isFinite(f.hero?.skillStock)),
        visibleFighters:replay.frames.every(f=>f.visibility?.heroAtlasReady&&f.visibility?.bossAtlasReady&&!f.visibility?.fallbackActive),
        finiteFrames:replay.frames.every(f=>Number.isFinite(f.hero?.x)&&Number.isFinite(f.boss?.x)&&Number.isFinite(f.hero?.hp)&&Number.isFinite(f.boss?.hp)),
        round,rival,clock,startHidden:!!start&&(start.hidden||getComputedStyle(start).display==='none'),
        canvasCount:document.querySelectorAll('canvas').length,replayButton:!!document.querySelector('#replay')
      };
    });
    fs.writeFileSync(path.join(out,`runtime-attempt-${attempt}.json`),JSON.stringify({engine:engineName,url,attempt,clockA,state,pageErrors,consoleErrors},null,2)+'\n');
    if(!page.isClosed())await page.screenshot({path:path.join(out,`boot-attempt-${attempt}.png`),fullPage:true});
    return {clockA,state,pageErrors,consoleErrors};
  } finally {
    await context?.close().catch(()=>{});
    await browser.close().catch(()=>{});
  }
}

let result,lastError;
const attempts=engineName==='webkit'?2:1;
for(let attempt=1;attempt<=attempts;attempt++){
  try{
    result=await runAttempt(attempt);
    break;
  }catch(e){
    lastError=e;
    fs.writeFileSync(path.join(out,`attempt-${attempt}-error.txt`),String(e?.stack||e)+'\n');
    if(!(engineName==='webkit'&&attempt<attempts&&isTransientClosure(e)))throw e;
    console.warn(`WebKit smoke target closed during attempt ${attempt}; retrying in a fresh browser`);
  }
}
if(!result)throw lastError||new Error('Survivor smoke produced no result');

const {clockA,state,pageErrors,consoleErrors}=result;
fs.writeFileSync(path.join(out,'runtime.json'),JSON.stringify({engine:engineName,url,clockA,state,pageErrors,consoleErrors},null,2)+'\n');
const failed=state.runtime?.production!==expectedProduction||state.canvasCount!==1||state.levels!==45||state.modelRenderer!==15||state.choreography!==26||state.replaySchema!=='jarvis-survivor-replay-v19'||state.frameCount<10||!state.bootFirst||!state.levelBind||!state.earnedAscensionContract||!state.finiteProgression||!state.visibleFighters||!state.finiteFrames||state.rival!=='LIRA'||!state.round.includes('LEVEL 1/45')||!state.round.includes('NEXUS CITADEL')||!state.startHidden||!state.replayButton||!clockA||!state.clock||clockA===state.clock||pageErrors.length||consoleErrors.length;
if(failed){
  console.error(JSON.stringify({clockA,state,pageErrors,consoleErrors},null,2));
  process.exitCode=1;
}else{
  console.log(JSON.stringify({engine:engineName,runtime:state.runtime.production,levels:state.levels,modelRenderer:state.modelRenderer,choreography:state.choreography,replaySchema:state.replaySchema,frames:state.frameCount,round:state.round,clockA,clockB:state.clock,result:'PASS'}));
}

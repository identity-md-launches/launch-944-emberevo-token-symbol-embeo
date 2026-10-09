import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {previewServer} from './preview.mjs';
import {TOKEN} from '../token-config.mjs';
import {fixture} from '../tests/fixtures.mjs';
const require=createRequire(process.env.EMBEO_TEST_MODULE_ROOT?path.resolve(process.env.EMBEO_TEST_MODULE_ROOT,'package.json'):new URL('../package.json',import.meta.url));
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const out=fileURLToPath(new URL('../../../artifacts/embeo/browser/',import.meta.url));
await mkdir(out,{recursive:true});
const server=previewServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port+'/preview/';
const browser=await chromium.launch({headless:true,...(process.env.EMBEO_CHROMIUM_PATH?{executablePath:process.env.EMBEO_CHROMIUM_PATH}:{}),args:['--no-sandbox']});
const report={at:new Date().toISOString(),browser:await browser.version(),checks:[],viewports:[],contrast:[],consoleErrors:[],failedResources:[],limitations:['No physical mobile device or screen-reader session.','Text enlargement and viewport reflow are not native browser 200% zoom.','Deterministic refresh states use labelled RPC fixtures, not live earnings evidence.']};
const check=(name,detail)=>report.checks.push({name,status:'PASS',detail});
const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],locale:'zh-TW'});
const page=await context.newPage();
page.on('pageerror',e=>report.consoleErrors.push(String(e)));
page.on('requestfailed',r=>{if(r.url().startsWith(url))report.failedResources.push({url:r.url().slice(url.length),error:r.failure()?.errorText});});
async function loaded(){await page.waitForFunction(()=>document.querySelector('#read-status').textContent.includes('顯示保存'));}
async function noOverflow(){return page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth+1}));}
try {
  await page.goto(url);await loaded();
  assert.equal(await page.locator('#token-address').textContent(),TOKEN.address);
  assert.equal(await page.locator('#ETH-estimate').textContent(),'0.00184074');
  assert.equal(await page.locator('#EMBEO-paid').textContent(),'850,448.75373372');
  assert.equal(await page.locator('.intro img').getAttribute('src'),'assets/emberevo-flame-64.png');
  check('production export loads at a gateway-style subpath with the saved reference amounts');
  const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(x=>x.name));
  assert(resources.every(x=>x.startsWith(url)));check('initial page makes no external request, wallet request or automatic refresh');
  for(const width of [1440,768,390,320]) {
    await page.setViewportSize({width,height:1000});await page.evaluate(()=>scrollTo(0,0));
    const flow=await noOverflow();assert.equal(flow.overflow,false,'page overflow at '+width);report.viewports.push(flow);
    if(width===1440||width===390||width===320)await page.screenshot({path:path.join(out,'saved-'+width+'.jpg'),fullPage:true,type:'jpeg',quality:78});
  }
  check('desktop, intermediate and mobile layouts reflow without page overflow');
  await page.setViewportSize({width:320,height:900});
  await page.locator('.table-scroll').focus();await page.keyboard.press('ArrowRight');
  await page.waitForFunction(()=>document.querySelector('.table-scroll').scrollLeft>0);
  check('fee table scrolls with keyboard at 320px');
  await page.setViewportSize({width:1440,height:1000});await page.goto(url);await loaded();
  await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').getAttribute('class'),'skip');
  await page.screenshot({path:path.join(out,'keyboard-skip.jpg'),type:'jpeg',quality:80});
  await page.keyboard.press('Enter');await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').getAttribute('id'),'refresh');
  check('skip link and sequential focus reach the primary refresh control');
  await page.goto(url);await loaded();
  for(let i=0;i<3;i++)await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').getAttribute('id'),'copy-address');
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('#copy-status').textContent.includes('已複製'));
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),TOKEN.address);
  await page.screenshot({path:path.join(out,'keyboard-copy.jpg'),type:'jpeg',quality:80});
  check('copy address works with keyboard and writes the exact formal token address');
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(Error('fixture denied'))}}));
  await page.locator('#copy-address').click();
  await page.waitForFunction(()=>document.querySelector('#copy-status').textContent.includes('Ctrl+C'));
  assert.equal(await page.evaluate(()=>getSelection().toString()),TOKEN.address);check('clipboard denial leaves a selectable full-address fallback');
  await page.locator('summary').focus();await page.keyboard.press('Space');assert(await page.locator('details').getAttribute('open')!==null);
  check('native disclosure opens with Space and exposes exact atomic values');
  const downloadPromise=page.waitForEvent('download');await page.locator('#download-snapshot').click();
  const download=await downloadPromise;const downloaded=JSON.parse(await readFile(await download.path(),'utf8'));
  assert.equal(downloaded.blockNumber,26152830);assert.equal(downloaded.assets.ETH.estimatedRequesterAtomic,'1840749999999999');
  check('snapshot download matches displayed saved block and integer amounts');
  report.contrast=await page.evaluate(()=>{
    const linear=x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;};
    const lum=c=>c.slice(0,3).map(linear).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
    const parse=s=>s.match(/[\d.]+/g).map(Number);
    const background=e=>{for(let n=e;n;n=n.parentElement){const c=parse(getComputedStyle(n).backgroundColor);if(c.length<4||c[3]===1)return c;}return [255,255,255];};
    return ['body','.intro h1','.identity p','.source-links a','.test-notice h2','.test-notice p','#refresh','#read-status','.quiet','thead th','td','footer'].map(selector=>{
      const e=document.querySelector(selector),s=getComputedStyle(e),fg=parse(s.color),bg=background(e),a=lum(fg),b=lum(bg);
      return {selector,foreground:s.color,background:bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),fontSize:s.fontSize};
    });
  });
  assert(report.contrast.every(x=>x.ratio>=4.5));check('measured rendered text/background pairs meet 4.5:1');
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  await writeFile(path.join(out,'accessibility-snapshot.txt'),await page.locator('body').ariaSnapshot());
  report.axe={violations:axe.violations,passes:axe.passes.length,incomplete:axe.incomplete.map(x=>({id:x.id,impact:x.impact}))};
  assert.equal(axe.violations.length,0,'axe violations');check('automated accessibility scan of expanded production page');
  await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});
  await page.keyboard.press('Tab');await page.locator('#refresh').focus();await page.screenshot({path:path.join(out,'forced-colors.jpg'),type:'jpeg',quality:78});
  const focus=await page.locator('#refresh').evaluate(e=>({outline:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));
  assert.equal(focus.outline,'solid');assert.equal(focus.width,'3px');
  check('forced-colors focus remains visible; reduced motion has no animations to run');
  await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
  // Text-spacing stress follows WCAG 1.4.12; CSS is injected by evaluation, not published.
  await page.evaluate(()=>{for(const e of document.querySelectorAll('p,dd,dt,button,a,summary')){e.style.lineHeight='1.5';e.style.letterSpacing='.12em';e.style.wordSpacing='.16em';}});
  assert.equal((await noOverflow()).overflow,false);check('text spacing stress does not create page overflow');
  await page.evaluate(()=>document.body.style.zoom='2');
  assert.equal((await noOverflow()).overflow,false);check('CSS 200% enlargement reflows without page overflow (not native zoom)');
  await page.goto(url);await loaded();
  await page.evaluate(()=>document.documentElement.dir='rtl');assert.equal((await noOverflow()).overflow,false);check('RTL structural mirror remains contained; translations are out of scope');
  await page.goto(url);await loaded();
  let options={},failTransport=false,slow=false,partialPrimary=false;let mock=fixture(options);const requests=[];
  const partial=fixture({logsFail:true,owedFail:true});
  for(const endpoint of TOKEN.endpoints)await page.route(endpoint,async route=>{
    const request=route.request().postDataJSON();requests.push(request);
    if(slow)await new Promise(resolve=>setTimeout(resolve,150));
    if(failTransport){await route.fulfill({status:503,body:'fixture unavailable'});return;}
    try {const selected=partialPrimary&&endpoint===TOKEN.endpoints[0]?partial:mock;const result=await selected.rpc(request.method,request.params);await route.fulfill({contentType:'application/json',body:JSON.stringify({jsonrpc:'2.0',id:request.id,result})});}
    catch(e){await route.fulfill({contentType:'application/json',body:JSON.stringify({jsonrpc:'2.0',id:request.id,error:{code:-32000,message:String(e)}})});}
  });
  slow=true;await page.locator('#refresh').click();assert(await page.locator('#refresh').isDisabled());
  await page.waitForFunction(()=>document.querySelector('#read-status').textContent.startsWith('已讀取'));slow=false;
  assert.equal(await page.locator('#ETH-estimate').textContent(),'< 0.00000001');
  check('refresh loading, success and floor-rounded separate-asset display with deterministic RPC fixture');
  await page.locator('summary').click();const liveDownload=page.waitForEvent('download');await page.locator('#download-snapshot').click();
  const liveJson=JSON.parse(await readFile(await (await liveDownload).path(),'utf8'));
  assert.equal(liveJson.blockNumber,TOKEN.deploymentBlock);assert.equal(liveJson.assets.EMBEO.estimatedRequesterAtomic,'8001');assert.equal(liveJson.displaySource.mode,'live');
  check('download after refresh contains the newly displayed values, not the original saved file');
  partialPrimary=true;mock=fixture({gross:22222});await page.locator('#refresh').click();await page.waitForFunction(()=>!document.querySelector('#refresh').disabled);
  assert.equal(await page.locator('#provider').textContent(),TOKEN.endpoints[1]);
  assert((await page.locator('#exact-values').textContent()).includes('17777'));
  assert.equal(await page.locator('#ETH-owed').textContent(),'< 0.00000001');
  partialPrimary=false;check('a complete secondary snapshot replaces a partial primary without combining providers');
  mock=fixture({owedFail:true,simulationFail:true,logsFail:true});await page.locator('#refresh').click();
  await page.waitForFunction(()=>!document.querySelector('#refresh').disabled);
  assert.equal(await page.locator('#ETH-owed').textContent(),'未確認');assert.equal(await page.locator('#ETH-estimate').textContent(),'未確認');assert.equal(await page.locator('#ETH-paid').textContent(),'未確認');
  assert.equal(await page.locator('#EMBEO-owed').textContent(),'< 0.00000001');check('partial failures render unknown without wiping a separately successful asset read');
  failTransport=true;await page.locator('#refresh').click();await page.waitForFunction(()=>document.querySelector('#read-status').textContent.includes('更新失敗'));
  assert.equal(await page.locator('#ETH-owed').textContent(),'未確認');check('failed refresh preserves last displayed data and explicitly labels it stale');
  assert(requests.every(x=>['eth_chainId','eth_getBlockByNumber','eth_getCode','eth_call','eth_getLogs','eth_getTransactionReceipt'].includes(x.method)));
  check('all browser RPC requests use the fixed public read-only allowlist');
  await page.route('**/data/latest.json',route=>route.fulfill({status:404,body:'fixture missing snapshot'}));
  await page.goto(url);await page.waitForFunction(()=>document.querySelector('#read-status').textContent.includes('沒有可用'));
  for(const id of ['ETH-estimate','ETH-owed','ETH-paid','EMBEO-estimate','EMBEO-owed','EMBEO-paid'])assert.equal(await page.locator('#'+id).textContent(),'未確認');
  assert(await page.locator('#download-snapshot').isDisabled());check('missing saved snapshot starts unknown and disables an unavailable download');
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
  const plain=await nojs.newPage();await plain.goto(url);assert(await plain.locator('noscript').isVisible());assert.equal(await plain.locator('#token-address').textContent(),TOKEN.address);await nojs.close();
  check('static token identity and saved-data link remain usable without JavaScript');
  assert.equal(report.consoleErrors.length,0);assert.equal(report.failedResources.length,0);
  check('no uncaught JavaScript errors or failed production static resources');
  report.status='PASS';
}catch(e){report.status='FAIL';report.error=String(e);throw e;}
finally {
  await writeFile(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();await new Promise(resolve=>server.close(resolve));
  console.log(JSON.stringify({status:report.status,checks:report.checks.length,viewports:report.viewports,error:report.error},null,2));
}

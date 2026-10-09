// Optional real-browser RPC/CORS check. No mocks, signatures or broadcasts.
import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {previewServer} from './preview.mjs';
const require=createRequire(process.env.EMBEO_TEST_MODULE_ROOT?path.resolve(process.env.EMBEO_TEST_MODULE_ROOT,'package.json'):new URL('../package.json',import.meta.url));
const {chromium}=require('playwright');
const server=previewServer();
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const report={at:new Date().toISOString(),mocked:false,failedRequests:[]};
try {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const page=await browser.newPage();
  page.on('requestfailed',r=>report.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
  await page.goto('http://127.0.0.1:'+server.address().port+'/preview/');
  await page.waitForFunction(()=>!document.querySelector('#refresh').disabled);
  await page.locator('#refresh').click();
  await page.waitForFunction(()=>!document.querySelector('#refresh').disabled,{},{timeout:190000});
  report.state=await page.evaluate(()=>({status:document.querySelector('#read-status').textContent,
    block:document.querySelector('#block').textContent,provider:document.querySelector('#provider').textContent,
    history:document.querySelector('#history-status').textContent,amounts:document.querySelector('#exact-values').textContent}));
  console.log(JSON.stringify(report,null,2));
} finally {
  const out=new URL('../../../artifacts/embeo/browser/',import.meta.url);
  await mkdir(out,{recursive:true});
  await writeFile(new URL('live-network.json',out),JSON.stringify(report,null,2)+'\n');
  await browser.close();await new Promise(resolve=>server.close(resolve));
}

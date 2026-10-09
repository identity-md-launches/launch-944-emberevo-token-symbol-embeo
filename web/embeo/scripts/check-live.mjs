// Optional, bounded public reads. Never part of the offline build or tests.
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {TOKEN} from '../token-config.mjs';
import {createRpc,readSnapshot,word} from '../fee-reader.mjs';
const exec=promisify(execFile),root=new URL('../../../',import.meta.url);
const records=[],attempts=[];
const fetchCurl=async(endpoint,options)=>{
  const {stdout}=await exec('curl',['--silent','--show-error','--fail','--max-time','15','--max-filesize','4194304','-H','content-type: application/json','--data',options.body,endpoint],{maxBuffer:5*1024*1024,signal:options.signal});
  return new Response(stdout);
};
const saved=JSON.parse(await readFile(new URL('../data/latest.json',import.meta.url),'utf8'));
const options=process.argv.includes('--reference-block')?{blockTag:'0x'+saved.blockNumber.toString(16)}:{};
let snapshot=null,endpoint=null,bestScore=-1;
for(const url of TOKEN.endpoints){
  try {
    const rpc=createRpc(url,fetchCurl,x=>records.push(x));
    const value=await readSnapshot(rpc,options);
    const score=Number(value.simulation.complete)+Number(value.history.complete)+['ETH','EMBEO'].filter(a=>value.assets[a].owedAtomic!==null).length;
    attempts.push({endpoint:url,status:'read succeeded',historyComplete:value.history.complete});
    if(score>bestScore){snapshot=value;endpoint=url;bestScore=score;}
    if(score===4)break;
  } catch(e){attempts.push({endpoint:url,status:'unavailable',error:String(e)});}
}
const report={at:new Date().toISOString(),attempts,snapshot,endpoint,financialActions:false,independentReview:'pending'};
if(snapshot){
  const rpc=createRpc(endpoint,fetchCurl,x=>records.push(x));
  const at='0x'+snapshot.blockNumber.toString(16);
  report.runtime={};
  for(const [label,address] of [['token',TOKEN.address],['factory',TOKEN.factory]]){
    try {
      const code=await rpc('eth_getCode',[address,at]);
      report.runtime[label]={sha256:createHash('sha256').update(Buffer.from(code.slice(2),'hex')).digest('hex'),bytes:(code.length-2)/2};
      if(label==='token')report.runtime[label].matchesLocalArtifact=code.toLowerCase()===(await readFile(new URL('artifacts/LaunchToken.runtime.hex',root),'utf8')).trim().toLowerCase();
    }catch(e){report.runtime[label]={error:String(e)};}
  }
  const {stdout}=await exec('cast',['keccak','0x'+[TOKEN.currency0,TOKEN.address,12500,60,TOKEN.hook].map(word).join('')]);
  report.derivedPoolId=stdout.trim();report.poolIdMatches=report.derivedPoolId===TOKEN.poolId;
  if(options.blockTag)report.referenceAssetsMatch=JSON.stringify(snapshot.assets)===JSON.stringify(saved.assets);
}
await mkdir(new URL('artifacts/embeo/',root),{recursive:true});
const suffix=options.blockTag?'reference-replay':'live-read';
await writeFile(new URL('artifacts/embeo/'+suffix+'.json',root),JSON.stringify(report,null,2)+'\n');
await writeFile(new URL('artifacts/embeo/'+suffix+'-rpc.json',root),JSON.stringify(records,null,2)+'\n');
console.log(JSON.stringify({attempts,block:snapshot?.blockNumber,history:snapshot?.history.complete,poolIdMatches:report.poolIdMatches,referenceAssetsMatch:report.referenceAssetsMatch,runtime:report.runtime},null,2));
if(!snapshot)process.exitCode=1;

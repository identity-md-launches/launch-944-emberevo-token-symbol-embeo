import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {TOKEN,SELECTOR} from '../token-config.mjs';
import {readSnapshot,validateSnapshot,createRpc,word,assertReadRequest,amount} from '../fee-reader.mjs';
import {fixture} from './fixtures.mjs';

test('independent owed failure preserves the other currency, simulation and history',async()=>{
  const v=await readSnapshot(fixture({owedFail:true}).rpc);
  assert.equal(v.assets.ETH.owedAtomic,null);
  assert.equal(v.assets.EMBEO.owedAtomic,'7');
  assert.equal(v.assets.ETH.estimatedRequesterAtomic,'8000');
  assert.equal(v.history.complete,true);
  assert.match(v.owedErrors[0],/unavailable/);
});
test('short ABI zero is unknown, not a valid zero balance',async()=>{
  const v=await readSnapshot(fixture({malformedOwed:true}).rpc);
  assert.equal(v.assets.ETH.owedAtomic,null);assert.equal(v.assets.EMBEO.owedAtomic,null);
});
test('pinned block may not exceed finalized height',async()=>{
  await assert.rejects(readSnapshot(fixture().rpc,{blockTag:'0x'+(TOKEN.deploymentBlock+1).toString(16)}),/not finalized/);
});
test('block hash change rejects entire mixed read',async()=>assert.rejects(readSnapshot(fixture({reorg:true}).rpc),/block changed/));
test('factory must point to the source-checked fee contract',async()=>assert.rejects(readSnapshot(fixture({fees:TOKEN.address}).rpc),/effective fee/));
test('changed split is rejected',async()=>assert.rejects(readSnapshot(fixture({bps:7999}).rpc),/effective fee/));
test('history above 80000 blocks stays null and issues no log queries',async()=>{
  const f=fixture({height:TOKEN.deploymentBlock+80000}),v=await readSnapshot(f.rpc);
  assert.equal(v.history.complete,false);assert.equal(v.assets.ETH.paidEventAtomic,null);
  assert(!f.requests.some(x=>x.method==='eth_getLogs'));
});
test('chunk bounds cover a full interval exactly once per topic',async()=>{
  const f=fixture({height:TOKEN.deploymentBlock+4000});await readSnapshot(f.rpc);
  const ranges=f.requests.filter(x=>x.method==='eth_getLogs');assert.equal(ranges.length,6);
  for(const x of ranges)assert(BigInt(x.params[0].toBlock)-BigInt(x.params[0].fromBlock)<2000n);
  assert.equal(ranges.at(-1).params[0].toBlock,'0x'+(TOKEN.deploymentBlock+4000).toString(16));
});
test('a provider mixing event filters cannot fabricate a history total',async()=>{
  const v=await readSnapshot(fixture({mixedLogs:true}).rpc);
  assert.equal(v.history.complete,false);assert.equal(v.assets.ETH.paidEventAtomic,null);
});
for(const receipt of [{status:'0x0'},{transactionHash:'0x'+'4'.repeat(64)},{blockNumber:'0x1'},{blockHash:'0x'+'4'.repeat(64)},{logs:[]}]) {
  test('reject receipt mismatch '+JSON.stringify(receipt),async()=>{
    const v=await readSnapshot(fixture({receipt}).rpc);
    for(const a of Object.values(v.assets))assert.equal(a.paidEventAtomic,null);
    assert.equal(v.history.complete,false);
  });
}
test('all monetary calculations conserve integer amounts, including uint256-scale values',async()=>{
  for(const gross of [0n,1n,4n,5n,10001n,10n**27n+4375n,(2n**256n-1n)/8000n]){
    const v=await readSnapshot(fixture({gross}).rpc,{history:false});
    const share=BigInt(v.assets.ETH.estimatedRequesterAtomic),rest=gross-share;
    assert.equal(share,gross*4n/5n);assert.equal(share+rest,gross);
    assert.equal(v.assets.ETH.paidEventAtomic,null);
  }
  assert.equal(amount('9007199254740993000000001'),'9,007,199.25474099');
});
for(const bad of [0,NaN,undefined,'-1','1.0','01',(2n**256n).toString()]){
  test('cached amounts must be bounded decimal strings or null: '+String(bad),async()=>{
    const v=await readSnapshot(fixture().rpc);v.assets.ETH.owedAtomic=bad;
    assert.throws(()=>validateSnapshot(v),/invalid fee amount/);
  });
}
test('missing completion and time metadata cannot label a cache verified',async()=>{
  for(const mutate of [v=>delete v.history.complete,v=>v.observedUtc='bad',v=>v.history.to--,v=>v.assets.ETH.poolUncollectedAtomic=null]){
    const v=await readSnapshot(fixture().rpc);mutate(v);assert.throws(()=>validateSnapshot(v));
  }
});
test('fixed transport denies unsafe methods, selectors, endpoints and arguments before fetch',async()=>{
  let calls=0;const fetcher=async()=>{calls++;throw Error('must not fetch');};
  const rpc=createRpc(TOKEN.endpoints[0],fetcher);
  for(const method of ['eth_sendTransaction','eth_sendRawTransaction','eth_sign','wallet_requestPermissions','eth_accounts'])await assert.rejects(rpc(method,[]),/unsupported/);
  for(const call of [{to:TOKEN.address,data:'0x095ea7b3'},{to:TOKEN.factory,data:SELECTOR.simulation+word(944),value:'0x0'},{to:TOKEN.factory,data:SELECTOR.simulation+word(945)}])await assert.rejects(rpc('eth_call',[call,'0x18f0000']));
  assert.throws(()=>createRpc('https://arbitrary.example'));
  assert.throws(()=>assertReadRequest('eth_getBlockByNumber',['pending',false]));
  assert.throws(()=>assertReadRequest('eth_getCode',[TOKEN.address,'latest']));
  assert.equal(calls,0);
});
test('transport validates response id, errors and successful zero separately',async()=>{
  for(const payload of [{id:999,result:'0x1'},{id:1,error:{message:'rate limited'}},{id:1}]){
    const rpc=createRpc(TOKEN.endpoints[0],async()=>new Response(JSON.stringify(payload)));
    await assert.rejects(rpc('eth_chainId',[]),/RPC read failed/);
  }
  const rpc=createRpc(TOKEN.endpoints[0],async()=>new Response('{"id":1,"result":"0x1"}'));
  assert.equal(await rpc('eth_chainId',[]),'0x1');
});
test('reference saved snapshot remains byte-for-byte and passes stricter validation',async()=>{
  const actual=await readFile(new URL('../data/latest.json',import.meta.url));
  const reference=await readFile(new URL('../../../docs/embeo/reference/web/data/latest.json',import.meta.url));
  assert.deepEqual(actual,reference);validateSnapshot(JSON.parse(actual));
});

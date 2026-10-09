import {TOKEN, SELECTOR, TOPIC} from './token-config.mjs';

export function word(value) {
  const result = typeof value==='string' && /^0x[0-9a-f]+$/i.test(value) ? value.slice(2) : BigInt(value).toString(16);
  if (result.length>64 || !/^[0-9a-f]+$/i.test(result)) throw Error('invalid ABI word');
  return result.padStart(64,'0');
}
export function words(value, count) {
  if (typeof value!=='string' || !/^0x[0-9a-f]*$/i.test(value) || value.length!==2+count*64) throw Error('invalid ABI response');
  return Array.from({length:count},(_,i)=>value.slice(2+i*64,66+i*64));
}
function address(value) {return '0x'+value.slice(-40).toLowerCase();}
function abiText(raw) {
  if (!/^0x[0-9a-f]+$/i.test(raw)) throw Error('invalid token text');
  const offset = Number(BigInt('0x'+raw.slice(2,66)))*2+2;
  const length = Number(BigInt('0x'+raw.slice(offset,offset+64)));
  if (length>64 || offset+64+length*2>raw.length) throw Error('invalid token text length');
  const bytes = raw.slice(offset+64,offset+64+length*2).match(/.{2}/g)||[];
  return new TextDecoder().decode(new Uint8Array(bytes.map(x=>parseInt(x,16))));
}
export function amount(value, decimals=18, places=8) {
  if (value===null || value===undefined) return '未確認';
  if (!/^\d+$/.test(String(value))) throw Error('invalid atomic amount');
  const s=String(value).padStart(decimals+1,'0'), integer=s.slice(0,-decimals);
  const fraction=s.slice(-decimals).slice(0,places).replace(/0+$/,'');
  if (BigInt(value)>0n && integer==='0' && !fraction) return '< '+(10**(-places)).toFixed(places);
  return integer.replace(/\B(?=(\d{3})+(?!\d))/g,',')+(fraction?'.'+fraction:'');
}

// The transport refuses every method outside these public reads, even if a UI caller changes.
const methods = new Set(['eth_chainId','eth_getBlockByNumber','eth_getCode','eth_call','eth_getLogs','eth_getTransactionReceipt']);
export function assertReadRequest(method, params) {
  if (!methods.has(method)) throw Error('unsupported read method');
  if (method==='eth_getCode' && ![TOKEN.address,TOKEN.factory].includes(params[0])) throw Error('unapproved runtime read');
  if (method==='eth_getTransactionReceipt' && !/^0x[0-9a-f]{64}$/i.test(params[0])) throw Error('invalid receipt hash');
  if (method==='eth_call') {
    const [call,block]=params;
    if (!call || Object.keys(call).some(k=>!['to','data','from'].includes(k))) throw Error('invalid read call');
    const to=String(call.to).toLowerCase(), data=String(call.data).toLowerCase();
    const safe = (
      (to===TOKEN.address && [SELECTOR.name,SELECTOR.symbol,SELECTOR.decimals,SELECTOR.supply].includes(data)) ||
      (to===TOKEN.factory && [SELECTOR.position+word(944),SELECTOR.simulation+word(944)].includes(data)) ||
      (to===TOKEN.factory && [TOKEN.currency0,TOKEN.address].some(c=>data===SELECTOR.owed+word(TOKEN.issuer)+word(c))) ||
      (to===TOKEN.fees && data===SELECTOR.requesterBps) ||
      (to===TOKEN.stateView && data===SELECTOR.slot0+TOKEN.poolId.slice(2))
    );
    if (!safe || !/^0x[0-9a-f]+$/i.test(block)) throw Error('read call outside formal EMBEO scope');
    if (call.from && call.from!==TOKEN.issuer) throw Error('unexpected simulation account');
  }
  if (method==='eth_getLogs') {
    const f=params[0];
    if (!f || f.address!==TOKEN.factory || ![TOPIC.claimed,TOPIC.paid].includes(f.topics?.[0])) throw Error('unsupported event filter');
    if (f.topics[0]===TOPIC.claimed && f.topics[1]!=='0x'+word(944)) throw Error('wrong launch filter');
    if (f.topics[0]===TOPIC.paid && f.topics[1]!=='0x'+word(TOKEN.issuer)) throw Error('wrong beneficiary filter');
    if (f.topics[0]===TOPIC.paid && JSON.stringify(f.topics[2])!==JSON.stringify(['0x'+word(TOKEN.currency0),'0x'+word(TOKEN.address)])) throw Error('wrong currency filter');
    const start=BigInt(f.fromBlock), end=BigInt(f.toBlock);
    if (start<BigInt(TOKEN.deploymentBlock) || end<start || end-start>1999n) throw Error('unbounded event scan');
  }
}
export function createRpc(endpoint, fetchFn=fetch, record=()=>{}) {
  if (!TOKEN.endpoints.includes(endpoint)) throw Error('unapproved public RPC');
  let id=0;
  return async (method,params) => {
    assertReadRequest(method,params);
    const request={jsonrpc:'2.0',id:++id,method,params};
    const response=await fetchFn(endpoint,{method:'POST',headers:{'content-type':'application/json'},credentials:'omit',body:JSON.stringify(request),signal:AbortSignal.timeout(15000)});
    if (!response.ok) throw Error('public RPC HTTP '+response.status);
    const raw=await response.text();
    if (raw.length>4*1024*1024) throw Error('RPC response too large');
    const value=JSON.parse(raw);
    record({endpoint,request,response:value});
    if (value.id!==request.id || value.error || !Object.hasOwn(value,'result')) throw Error('RPC read failed: '+(value.error?.message||'invalid response'));
    return value.result;
  };
}
export function validateSnapshot(value) {
  if (value?.schema!=='embeo-readonly-fees/1' || value.token?.address!==TOKEN.address || value.chainId!==1 || value.poolId!==TOKEN.poolId) throw Error('snapshot identity mismatch');
  if (value.token.decimals!==18 || value.token.supplyAtomic!==TOKEN.totalSupplyAtomic || value.poolFeeUnits!==12500) throw Error('snapshot token or fee mismatch');
  if (value.membershipEnabled!==false || value.financialActionPerformed!==false) throw Error('snapshot scope mismatch');
  if (value.requester!==TOKEN.issuer || value.requesterBps!==8000) throw Error('snapshot beneficiary mismatch');
  if (!Number.isSafeInteger(value.blockNumber) || value.blockNumber<TOKEN.deploymentBlock || !/^0x[0-9a-f]{64}$/i.test(value.blockHash)) throw Error('snapshot block missing');
  for (const asset of ['ETH','EMBEO']) {
    const row=value.assets?.[asset];
    if (!row) throw Error('missing fee asset');
    for(const key of ['poolUncollectedAtomic','estimatedRequesterAtomic','owedAtomic','paidEventAtomic','poolCollectedAtomic']) {
      if (row[key]!==null && !/^\d+$/.test(row[key])) throw Error('invalid fee amount');
    }
    if (!value.simulation.complete && (row.poolUncollectedAtomic!==null || row.estimatedRequesterAtomic!==null)) throw Error('unavailable simulation presented as amount');
    if (!value.history.complete && (row.paidEventAtomic!==null || row.poolCollectedAtomic!==null)) throw Error('partial history presented as complete');
    if (row.poolUncollectedAtomic!==null && row.estimatedRequesterAtomic!==(BigInt(row.poolUncollectedAtomic)*8000n/10000n).toString()) throw Error('incorrect requester estimate');
  }
  return value;
}

export async function readSnapshot(rpc,{history=true,blockTag='finalized'}={}) {
  if (await rpc('eth_chainId',[])!=='0x1') throw Error('wrong chain');
  if (blockTag!=='finalized' && !/^0x[0-9a-f]+$/i.test(blockTag)) throw Error('invalid pinned block');
  const block=await rpc('eth_getBlockByNumber',[blockTag,false]);
  if (!block?.hash || !block.number) throw Error('finalized block unavailable');
  const at=block.number, blockNumber=Number(BigInt(at));
  const call=(to,data,from)=>rpc('eth_call',[{to,data,...(from?{from}:{})},at]);
  const [name,symbol,decimals,supply,position,bps,slot,owed0,owed1]=await Promise.all([
    call(TOKEN.address,SELECTOR.name),call(TOKEN.address,SELECTOR.symbol),call(TOKEN.address,SELECTOR.decimals),call(TOKEN.address,SELECTOR.supply),
    call(TOKEN.factory,SELECTOR.position+word(944)),call(TOKEN.fees,SELECTOR.requesterBps),call(TOKEN.stateView,SELECTOR.slot0+TOKEN.poolId.slice(2)),
    call(TOKEN.factory,SELECTOR.owed+word(TOKEN.issuer)+word(TOKEN.currency0)),call(TOKEN.factory,SELECTOR.owed+word(TOKEN.issuer)+word(TOKEN.address))
  ]);
  const p=words(position,8), state=words(slot,4);
  if(abiText(name)!==TOKEN.name || abiText(symbol)!==TOKEN.symbol || BigInt(decimals)!==18n || BigInt(supply)!==BigInt(TOKEN.totalSupplyAtomic)) throw Error('formal token identity changed');
  if(address(p[0])!==TOKEN.currency0 || address(p[1])!==TOKEN.address || BigInt('0x'+p[2])!==12500n || BigInt('0x'+p[3])!==60n || address(p[4])!==TOKEN.hook) throw Error('pool key mismatch');
  if(address(p[7])!==TOKEN.issuer || BigInt(bps)!==8000n || BigInt('0x'+state[3])!==12500n) throw Error('beneficiary or effective fee mismatch');
  const assets={ETH:{owedAtomic:BigInt(owed0).toString()},EMBEO:{owedAtomic:BigInt(owed1).toString()}};
  for(const row of Object.values(assets)) Object.assign(row,{poolUncollectedAtomic:null,estimatedRequesterAtomic:null,paidEventAtomic:null,poolCollectedAtomic:null});
  const simulation={complete:false,error:null,method:'eth_call only; no broadcast; temporary simulated payouts are discarded'};
  try {
    const values=words(await call(TOKEN.factory,SELECTOR.simulation+word(944),TOKEN.issuer),2);
    ['ETH','EMBEO'].forEach((asset,i)=>{
      assets[asset].poolUncollectedAtomic=BigInt('0x'+values[i]).toString();
      assets[asset].estimatedRequesterAtomic=(BigInt('0x'+values[i])*8000n/10000n).toString();
    });
    simulation.complete=true;
  } catch(error) {simulation.error=String(error);}
  const scan={complete:false,from:TOKEN.deploymentBlock,to:blockNumber,chunks:0,error:null,paidScope:'Factory FeesPaid events for this wallet/currencies within the interval; may include other launches',claimed:[],paid:[]};
  if(history && blockNumber-TOKEN.deploymentBlock<=80000) {
    try {
      for(let start=TOKEN.deploymentBlock;start<=blockNumber;start+=2000) {
        const range={address:TOKEN.factory,fromBlock:'0x'+start.toString(16),toBlock:'0x'+Math.min(start+1999,blockNumber).toString(16)};
        const [claimed,paid]=await Promise.all([
          rpc('eth_getLogs',[{...range,topics:[TOPIC.claimed,'0x'+word(944)]}]),
          rpc('eth_getLogs',[{...range,topics:[TOPIC.paid,'0x'+word(TOKEN.issuer),['0x'+word(TOKEN.currency0),'0x'+word(TOKEN.address)]]}])
        ]);
        for(const log of [...claimed,...paid]) {
          if(log.removed || !log.transactionHash || !log.blockHash || log.address?.toLowerCase()!==TOKEN.factory || Number(BigInt(log.blockNumber))<start || Number(BigInt(log.blockNumber))>Math.min(start+1999,blockNumber)) throw Error('invalid event log');
          if(log.topics?.length!==3 || (log.topics[0]===TOPIC.claimed && log.topics[1]!=='0x'+word(944)) || (log.topics[0]===TOPIC.paid && log.topics[1]!=='0x'+word(TOKEN.issuer)) || ![TOPIC.claimed,TOPIC.paid].includes(log.topics[0])) throw Error('event outside approved scope');
        }
        scan.claimed.push(...claimed); scan.paid.push(...paid); scan.chunks++;
      }
      const txs=[...new Set([...scan.claimed,...scan.paid].map(x=>x.transactionHash))];
      if(txs.length>80) throw Error('receipt budget exceeded');
      for(const tx of txs) {
        const receipt=await rpc('eth_getTransactionReceipt',[tx]);
        if(receipt?.status!=='0x1') throw Error('fee event receipt not confirmed');
        for(const log of [...scan.claimed,...scan.paid].filter(x=>x.transactionHash===tx)) {
          if(receipt.blockHash!==log.blockHash || !receipt.logs?.some(x=>x.logIndex===log.logIndex && x.address.toLowerCase()===TOKEN.factory && x.data===log.data && JSON.stringify(x.topics)===JSON.stringify(log.topics))) throw Error('fee event receipt mismatch');
        }
      }
      const sums={ETH:{paid:0n,collected:0n},EMBEO:{paid:0n,collected:0n}};
      const seen=new Set();
      for(const log of scan.claimed) {
        const key=log.transactionHash+log.logIndex; if(seen.has(key)) throw Error('duplicate fee event'); seen.add(key);
        const w=words(log.data,2); sums.ETH.collected+=BigInt('0x'+w[0]); sums.EMBEO.collected+=BigInt('0x'+w[1]);
      }
      for(const log of scan.paid) {
        const key=log.transactionHash+log.logIndex; if(seen.has(key)) throw Error('duplicate fee event'); seen.add(key);
        const asset=address(log.topics[2])===TOKEN.currency0?'ETH':address(log.topics[2])===TOKEN.address?'EMBEO':null;
        if(!asset) throw Error('unexpected fee asset');
        sums[asset].paid+=BigInt('0x'+words(log.data,1)[0]);
      }
      for(const [asset,s] of Object.entries(sums)) Object.assign(assets[asset],{paidEventAtomic:s.paid.toString(),poolCollectedAtomic:s.collected.toString()});
      scan.complete=true;
    } catch(error) {scan.error=String(error);}
  } else scan.error=history?'history exceeds bounded scan; needs archived indexer':'history was not requested';
  const anchor=await rpc('eth_getBlockByNumber',[at,false]);
  if(anchor?.hash!==block.hash) throw Error('block changed during read');
  return validateSnapshot({schema:'embeo-readonly-fees/1',observedUtc:new Date().toISOString(),chainId:1,
    blockNumber,blockHash:block.hash,blockUtc:new Date(Number(BigInt(block.timestamp))*1000).toISOString(),
    token:{address:TOKEN.address,decimals:18,supplyAtomic:TOKEN.totalSupplyAtomic},poolId:TOKEN.poolId,poolFeeUnits:12500,
    requester:TOKEN.issuer,requesterBps:8000,assets,simulation,history:scan,membershipEnabled:false,financialActionPerformed:false});
}

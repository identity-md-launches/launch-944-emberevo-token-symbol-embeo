import {TOKEN,SELECTOR,TOPIC} from '../token-config.mjs';
import {word,assertReadRequest} from '../fee-reader.mjs';
export const blockHash='0x'+'1'.repeat(64);
export const txHash='0x'+'2'.repeat(64);
const text=s=>'0x'+word(32)+word(s.length)+Buffer.from(s).toString('hex').padEnd(64,'0');
export function fixture(options={}) {
  const height=options.height??TOKEN.deploymentBlock;
  const shared={address:TOKEN.factory,blockNumber:'0x'+TOKEN.deploymentBlock.toString(16),blockHash,transactionHash:txHash,removed:false};
  const claimed={...shared,logIndex:'0x0',topics:[TOPIC.claimed,'0x'+word(944),'0x'+word(TOKEN.issuer)],data:'0x'+word(10001)+word(10002)};
  const paid=[TOKEN.currency0,TOKEN.address].map((currency,i)=>({...shared,logIndex:'0x'+(i+1).toString(16),topics:[TOPIC.paid,'0x'+word(TOKEN.issuer),'0x'+word(currency)],data:'0x'+word(i?8001:8000)}));
  const receipt={status:'0x1',transactionHash:txHash,blockNumber:shared.blockNumber,blockHash,logs:[claimed,...paid],...options.receipt};
  let blockReads=0;
  const requests=[];
  const rpc=async(method,params)=>{
    requests.push({method,params});assertReadRequest(method,params);
    if(method==='eth_chainId')return options.chain??'0x1';
    if(method==='eth_getBlockByNumber'){
      blockReads++;
      return {number:'0x'+height.toString(16),hash:options.reorg&&blockReads>1?'0x'+'3'.repeat(64):blockHash,timestamp:'0x6ac8a87f'};
    }
    if(method==='eth_getLogs'){
      if(options.logsFail)throw Error('fixture logs unavailable');
      if(BigInt(params[0].fromBlock)>BigInt(TOKEN.deploymentBlock))return [];
      if(options.mixedLogs)return [paid[0]];
      return params[0].topics[0]===TOPIC.claimed?[claimed]:paid;
    }
    if(method==='eth_getTransactionReceipt')return receipt;
    if(method==='eth_getCode')return '0x6000';
    const data=params[0].data;
    if(data===SELECTOR.name)return text(TOKEN.name);
    if(data===SELECTOR.symbol)return text(TOKEN.symbol);
    if(data===SELECTOR.decimals)return '0x'+word(18);
    if(data===SELECTOR.supply)return '0x'+word(TOKEN.totalSupplyAtomic);
    if(data===SELECTOR.fees)return '0x'+word(options.fees??TOKEN.fees);
    if(data===SELECTOR.requesterBps)return '0x'+word(options.bps??8000);
    if(data.startsWith(SELECTOR.position))return '0x'+[TOKEN.currency0,TOKEN.address,12500,60,TOKEN.hook,0,1,TOKEN.issuer].map(word).join('');
    if(data.startsWith(SELECTOR.slot0))return '0x'+[1,1,0,12500].map(word).join('');
    if(data.startsWith(SELECTOR.owed)){
      if(options.owedFail && data.endsWith(word(TOKEN.currency0)))throw Error('fixture ETH owed unavailable');
      return options.malformedOwed?'0x0':'0x'+word(7);
    }
    if(data.startsWith(SELECTOR.simulation)){
      if(options.simulationFail)throw Error('fixture simulation unavailable');
      return '0x'+word(options.gross??10001)+word(10002);
    }
    throw Error('Unexpected fixture request');
  };
  return {rpc,requests};
}

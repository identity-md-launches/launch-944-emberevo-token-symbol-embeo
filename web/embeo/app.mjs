import {TOKEN} from './token-config.mjs';
import {createRpc,readSnapshot,validateSnapshot,amount} from './fee-reader.mjs';
/** @returns {HTMLElement} */
const element=id=>{
  const node=document.getElementById(id);
  if (!node) throw Error('Missing page element: '+id);
  return node;
};
/** @returns {HTMLButtonElement} */
const buttonElement=id=>{
  const node=element(id);
  if (!(node instanceof HTMLButtonElement)) throw Error('Missing page button: '+id);
  return node;
};
const status=element('read-status');
let current=null;
buttonElement('refresh').disabled=true;
function render(value,mode,endpoint) {
  validateSnapshot(value); current={...value,displaySource:{mode,endpoint:endpoint||value.provenance?.primary||null}};
  buttonElement('download-snapshot').disabled=false;
  for(const asset of ['ETH','EMBEO']) {
    for(const [column,key] of [['estimate','estimatedRequesterAtomic'],['owed','owedAtomic'],['paid','paidEventAtomic']]) {
      const cell=element(asset+'-'+column); const atomic=value.assets[asset][key];
      cell.textContent=amount(atomic);cell.classList.toggle('unknown',atomic===null);
      cell.title=atomic===null?'資料不足，不能視為零':atomic+' 最小單位';
    }
  }
  element('block').textContent=String(value.blockNumber)+'（已最終確認）';
  element('block-time').textContent=value.blockUtc;
  element('block-hash').textContent=value.blockHash;
  element('provider').textContent=endpoint||value.provenance?.primary||'保存快照';
  element('history-status').textContent=value.history.complete
    ? `付款事件已核對：區塊 ${value.history.from} 至 ${value.history.to}。同 Factory、同錢包／幣種的共用紀錄。`
    : '歷史付款掃描未完成，因此「已付款」保持未確認；不能解讀為沒有收入。';
  element('simulation-status').textContent=value.simulation.complete?'未收集費用來自 eth_call 模擬，未執行鏈上領取；估算已按最小單位取整。':'未收集費用模擬失敗，相關金額保持未確認。';
  element('owed-status').textContent=['ETH','EMBEO'].some(asset=>value.assets[asset].owedAtomic===null)
    ? '部分待補付讀取失敗；未確認的金額不能視為零，請稍後更新。'
    : '待補付金額已在同一資料區塊讀取；此欄按 Factory、錢包與幣種共用。';
  element('exact-values').textContent=JSON.stringify(value.assets,null,2);
  status.classList.remove('failed');
  status.textContent=(mode==='saved'?'顯示保存的核對快照，尚未在此頁更新。':'已讀取鏈上資料。')+' 核對時間：'+new Date(value.observedUtc).toLocaleString('zh-TW',{hour12:false});
}
element('copy-address').addEventListener('click',async()=>{
  const range=document.createRange();range.selectNodeContents(element('token-address'));
  const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
  element('copy-status').textContent='地址已選取，可按 Ctrl+C 複製；手機可長按地址。';
  try {await navigator.clipboard.writeText(TOKEN.address);element('copy-status').textContent='正式 EMBEO 地址已複製。';} catch { /* Selection remains as a usable copy fallback. */ }
});
element('download-snapshot').addEventListener('click',()=>{
  if (!current) return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(current,null,2)+'\n'],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='embeo-block-'+current.blockNumber+'.json';
  link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
element('refresh').addEventListener('click',async()=>{
  const button=buttonElement('refresh');button.disabled=true;button.textContent='更新鏈上資料（讀取中）';
  element('fees').setAttribute('aria-busy','true');
  status.classList.remove('failed');status.textContent='正在查詢已最終確認的 Ethereum 區塊。';
  let error;
  try {
    let best=null;
    for(const endpoint of TOKEN.endpoints) {
      try {
        const value=await readSnapshot(createRpc(endpoint));
        const score=Number(value.simulation.complete)+Number(value.history.complete)+['ETH','EMBEO'].filter(asset=>value.assets[asset].owedAtomic!==null).length;
        if (!best || score>best.score) best={value,endpoint,score};
        if (score===4) break;
      } catch(e) {error=e;}
    }
    // Choose one complete-block snapshot. Never add or merge data across providers.
    if (best) {render(best.value,'live',best.endpoint);return;}
    throw error;
  } catch {
    status.classList.add('failed');
    status.textContent=current?'更新失敗，仍顯示上次保存的資料與時間。可稍後再次查詢。':'目前無法取得鏈上資料。金額保持未確認，請稍後再試。';
  } finally {button.disabled=false;button.textContent='更新鏈上資料';element('fees').setAttribute('aria-busy','false');}
});
try {
  const response=await fetch('data/latest.json',{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!response.ok) throw Error('snapshot unavailable');
  render(await response.json(),'saved');
} catch {
  status.classList.add('failed');status.textContent='沒有可用的保存快照，請按「更新鏈上資料」查詢。';
} finally {buttonElement('refresh').disabled=false;}

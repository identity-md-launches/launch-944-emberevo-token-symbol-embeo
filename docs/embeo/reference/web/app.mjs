import {TOKEN} from './token-config.mjs';
import {createRpc,readSnapshot,validateSnapshot,amount} from './fee-reader.mjs';
const element=id=>document.getElementById(id);
const status=element('read-status');
let current=null;
function render(value,mode,endpoint) {
  validateSnapshot(value); current=value;
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
  status.classList.remove('failed');
  status.textContent=(mode==='saved'?'顯示保存的核對快照，尚未在此頁更新。':'已讀取鏈上資料。')+' 核對時間：'+new Date(value.observedUtc).toLocaleString('zh-TW',{hour12:false});
}
element('copy-address').addEventListener('click',async()=>{
  const range=document.createRange();range.selectNodeContents(element('token-address'));
  const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
  element('copy-status').textContent='地址已選取，可按 Ctrl+C 複製；手機可長按地址。';
  try {await navigator.clipboard.writeText(TOKEN.address);} catch { /* Selection remains as a usable copy fallback. */ }
});
element('refresh').addEventListener('click',async()=>{
  const button=element('refresh');button.disabled=true;button.textContent='讀取中';
  status.classList.remove('failed');status.textContent='正在查詢已最終確認的 Ethereum 區塊。';
  let error;
  try {
    for(const endpoint of TOKEN.endpoints) {
      try {render(await readSnapshot(createRpc(endpoint)),'live',endpoint);return;} catch(e) {error=e;}
    }
    throw error;
  } catch {
    status.classList.add('failed');
    status.textContent=current?'更新失敗，仍顯示上次保存的資料與時間。可稍後再次查詢。':'目前無法取得鏈上資料。金額保持未確認，請稍後再試。';
  } finally {button.disabled=false;button.textContent='更新鏈上資料';}
});
try {
  const response=await fetch('data/latest.json',{credentials:'omit',cache:'no-store'});
  if(!response.ok) throw Error('snapshot unavailable');
  render(await response.json(),'saved');
} catch {
  status.classList.add('failed');status.textContent='沒有可用的保存快照，請按「更新鏈上資料」查詢。';
}

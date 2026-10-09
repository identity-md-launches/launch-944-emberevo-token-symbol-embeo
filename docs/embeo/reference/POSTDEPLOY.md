# EmberEVO（EMBEO）正式部署紀錄

狀態核對日期：2026-10-09。以下為正式 Token，與舊 EMVO 歷史測試發行分開。

| 項目 | 已核對內容 |
| --- | --- |
| Token | EmberEVO / EMBEO |
| Ethereum 主網 | chain ID 1 |
| Token CA | `0x2b82CDEb8477415D541799abB0Cc48044C8ea5f3` |
| Decimals / 初始供應量 | 18 / 1,000,000,000 枚 |
| IMD Launch | #944；`b81f8d6e-ebc0-4eb0-9307-d22cf765bea4` |
| 來源 job | `1d8ba181-fdc0-4f4b-83ab-bd5bc40f5515` |
| 固定交付 commit | `cecf25b92d44568f8a0f81c34f4b634df905d1e5` |
| 部署交易 | `0xd926c03bafe9e92252b37f44a0ea7bf1116f5c8a8cefb2aee7a3d28363d6aa09` |
| 部署區塊 / UTC | 26143156 / 2026-10-07 21:19:47 UTC |
| 發幣及付款錢包 | `0x1C651928150DADDDA9C2C040a9D4901d862f8eC4` |
| Factory | `0xfF03410d0Fe5fa8f7F59F743de35E333D9857120` |

[部署交易](https://etherscan.io/tx/0xd926c03bafe9e92252b37f44a0ea7bf1116f5c8a8cefb2aee7a3d28363d6aa09) · [固定來源](https://github.com/identity-md-launches/launch-944-emberevo-token-symbol-embeo/tree/cecf25b92d44568f8a0f81c34f4b634df905d1e5) · [官方 Launch JSON](https://api.imd.fun/launches/b81f8d6e-ebc0-4eb0-9307-d22cf765bea4)

## 池子與實際配置

PoolManager：`0x000000000004444c5dc75cB358380D2e3dE08A90`。

完整 PoolKey：

```json
{
  "currency0": "0x0000000000000000000000000000000000000000",
  "currency1": "0x2b82cdeb8477415d541799abb0cc48044c8ea5f3",
  "fee": 12500,
  "tickSpacing": 60,
  "hooks": "0x784ff9a3ac5d88a30bfff6f7f2a270161fbe6000"
}
```

PoolId：`0x616f6877a3fa74f550155002388df37e5b19861270420ac48fcf4b58c8f9f30a`。原生 ETH 的 currency 是零地址，並非 WETH 地址。實際 Initialize 事件、PoolId 推導及讀取的 slot0 均已核對；本輪再次讀到有效 fee=12500，亦即 1.25%。發幣 admission manifest 的 `fee=3000` 是歷史提交格式，不是池費率；保留其歷史含義，不為消除文字差異而改寫原始 manifest。

| 初始收款處 | 實際 Token 數量 |
| --- | --- |
| 池子 | 859,999,999.999999999999995625 |
| Swarm distributor | 100,000,000 |
| 發幣錢包 | 40,000,000.000000000000004375 |

86/10/4 是名義比例；4375 個最小單位的流動性取整残額進入發幣錢包。上述是部署時配置，不能當成今天的錢包餘額或 CoinGecko 已核准流通量。

10 ETH 的開池估值不是 10 ETH 實收储備或使用者必須投入的資金。費用收益與 LP 本金所有權分開；本包不承諾可提走 LP 或永久鎖定。

## 原始碼及資訊登記

- EMBEO Token：Etherscan 頁面已確認 **Source Code Verified / Exact Match**，先前重編譯 runtime 亦與鏈上相符。本輪鏈上 runtime keccak256 仍為 `0x01fb92b21a7414fcac4480618142f8968a5d2bae8071370fb5e9369b97fc55bc`。
- 初始化 Guard：Etherscan 目前顯示 Exact Match；它不是專案自訂 swap hook，沒有替 Token 增加升級、burn 或鎖倉功能。
- Swarm distributor：本輪瀏覽器核對仍顯示 Verify and Publish；不以官方自動驗證公告推定已成功。
- Factory：Blockscout 新提供部分驗證原始碼及 ABI，本輪其 runtime bytes 與鏈上相符。獨立完整 Factory 重編譯尚未執行，不能寫成所有協定合約都通過本機 Exact Match。
- 正式 Token Info：已收到 Etherscan 人工地址管理詢問 #869449 的收件確認，仍待回覆；不是資料管理核准或 Logo 核准。
- CoinGecko：本機紀錄是已登入、草稿未送件。尚待使用者自行發布 X 核驗貼文並提供網址，沒有申請編號。
- IMD Launch 公開 JSON 的 `logo` 目前仍為 `null`，Token 頁仍是預設圖示。登記程序須另行處理。

[Token 原始碼](https://etherscan.io/address/0x2b82CDEb8477415D541799abB0Cc48044C8ea5f3#code) · [Guard](https://etherscan.io/address/0x784ff9a3ac5d88a30bfff6f7f2a270161fbe6000#code) · [Distributor](https://etherscan.io/address/0xc8d942d66e283c16de56bee61e2b508134aca5d8#code) · [Factory 來源狀態](https://eth.blockscout.com/api/v2/smart-contracts/0xff03410d0fe5fa8f7f59f743de35e333d9857120)

原始碼驗證、獨立重編譯、審計、Token Info 核准及錢包警示是不同結果，不互相替代。

## 歷史測試 EMVO

舊 EmberEvo（EMVO）：`0x7A427b94547232356cF212Fd1C668e8EB4069a46`，是 Ethereum **主網**上的歷史測試發行。**請勿購買該測試 EMVO，它不適用正式會員資格。** 舊合約與池子仍存在，提示文字不能技術上停止交易。沒有自動換幣、遷移或補償承諾；舊 Swarm 權利未取消。

本輪未啟用會員、部署 Genesis、建立分期解鎖，亦未發幣、付款、swap、領費、推送 GitHub 或發布官網。

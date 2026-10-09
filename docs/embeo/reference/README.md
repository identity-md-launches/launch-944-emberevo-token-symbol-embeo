# EMBEO 部署後資訊與只讀費用查詢更新包

2026-10-09。本包是可預覽、可交接的來源原型，已公開於 tungweb3/emvo-review 的 embeo-postdeploy-2026-10-09 分支及同名資料夾。正式官網尚未發布，付費 Swarm 工作尚未建立；固定送件 commit 以本次送件連結與讀回紀錄為準。

本輪範圍：正式代幣資料、使用者原版火焰 Logo、部署後文件、舊 EMVO 提示、只讀費用查詢。會員、Genesis paid mint、分期解鎖均不納入本轮，既有會員設定維持停用。

本版依使用者要求移除個人信箱；頁面、設定與公開文件只保留官網及 X 聯絡入口。歷史資料若經隱私遮罩，會在本機證據紀錄明示，不冒充未改動的原始回應。

## 查看結果

- 本機預覽：<http://127.0.0.1:8789/token/embeo/>
- [正式部署資料](POSTDEPLOY.md)
- [費用核對與已發生付款](FEES.md)
- [GitHub README 的現況補充文字](github/README_POSTDEPLOY_HEADER.md)
- [World 接入交接](WORLD_HANDOFF.md)
- [Swarm 延續需求草稿](SWARM_CONTINUATION_BRIEF.md)
- [草稿 API payload](swarm-continuation.draft.json)
- [本輪驗收紀錄](VALIDATION.md)
- [IMD 免費預檢結果](CHECK_RESULT.md)
- [可發布內容的 SHA-256 清單](public-manifest.json)

IMD 免費 Check 已執行並通過：使用者同意不含信箱版本後，官方回傳 HTTP 200、無 blockers。這僅是免費預檢；公開候選不是已建立的工作，免費核對與後續付費送件分開。

## 本機啟動

在此更新包資料夾內執行：

```powershell
node scripts/serve-preview.mjs
```

伺服器僅綁定 `127.0.0.1:8789`，只提供 `web/` 的靜態檔案；按 Ctrl+C 停止。不會建立自動啟動、背景服務或公開網路入口。若埠號已被目前預覽占用，直接打開現有網址即可。

費用頁使用保存快照，按「更新鏈上資料」才讀取公開 RPC。查詢只使用允許的 RPC 方法；`claimFees` 僅透過 `eth_call` 模擬，產生的臨時狀態會丟棄，沒有簽名、廣播或付款。頁面沒有錢包連接、交易或領取控制。

## 資料與資產邊界

正式 EMBEO：`0x2b82CDEb8477415D541799abB0Cc48044C8ea5f3`。Ethereum 主網、原生 ETH 配對。火焰 PNG 直接複製自使用者指定資產，沒有重畫或改色。

`web/` 不依賴 npm、遠端 script、字型 CDN 或網站 3D 資產。`.rd/` 保留原始 HTTP/RPC 回應、測試紀錄與本機流程資料；不得整包上傳。`public-candidate/` 及公開 ZIP 只包含明列的頁面來源與公開文件；來源包已完成 GitHub 發布，正式網站仍待接入、測試及確認發布。

歷史交付 commit 與原始 v3.4 規格保留。此更新包不修改已部署合約、不替換代幣、不改寫舊送審快照。

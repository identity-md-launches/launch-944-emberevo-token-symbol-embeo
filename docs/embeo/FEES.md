# Read-only fee semantics and reproduction

The page has no wallet connection, signature, payment, approval, swap, claim or withdrawal flow. A visitor can copy the formal address, open source links, refresh public reads, disclose evidence and download the displayed snapshot. No API keys, backend or wallet provider are required.

## What the three columns mean

| Column | Scope and calculation |
| --- | --- |
| Estimated requester share | Only launch 944's uncollected pool fees, returned by `eth_call` simulation of `claimFees(uint64)` with argument 944. Each currency is calculated independently as `gross * 8000n / 10000n` with integer floor rounding. It is an estimate, not received income. |
| Owed | `owed(requester,currency)` on this Factory. This is account/currency state shared across launches, often left by a failed payout. It is distinct from uncollected pool fees. |
| Paid events | `FeesPaid(account,currency,amount)` in the displayed block interval, at this Factory, for the fixed requester and currency. These events do not contain a launch number and can span launches. They are not launch-only or wallet-lifetime income. |

ETH and EMBEO both use 18 decimals. Every stored/calculated amount is a decimal integer string or `null`; no monetary calculation uses JavaScript `Number`. The display truncates to eight decimal places and shows `< 0.00000001` for a positive amount below the display precision. The evidence disclosure and JSON download preserve exact atomic values. Columns and currencies are never summed together.

The source-checked split is **80% requester / remaining 20% network**. `LaunchFees.REQUESTER_BPS = 8000`; `PoolFees._split` computes `(amount * fees.REQUESTER_BPS()) / 10_000`, then assigns `amount - share` to the network. The requester is verified from `positionOf(944)`, and the factory's `fees()` pointer is checked before using the constant. This gives the network any floor-rounding remainder. At pool fee 1.25%, the nominal shares correspond to 1% and 0.25% of swap volume. The token itself has no transfer tax.

Published source evidence is retained as text under [evidence/](evidence/source-provenance.json). Blockscout labels the Factory source partially verified; its runtime matches the RPC bytes at the replayed block. The fee contract was not independently fully recompiled. Source inspection and public reads do not confer security certification.

## Exact reads

The fixed transport permits only `eth_chainId`, `eth_getBlockByNumber`, `eth_getCode` (token/factory only), `eth_call`, `eth_getLogs`, and `eth_getTransactionReceipt`. The exported page uses the original reference's two public endpoints: `https://ethereum-rpc.publicnode.com` and `https://rpc.mevblocker.io/fast`. It does not accept arbitrary endpoints, contracts, accounts or selectors. Neither endpoint receives signing or broadcasting methods. If the first endpoint returns a partial snapshot, the page tries the second and chooses the more complete snapshot as a whole, without combining providers or blocks. CSP separately restricts network connections to these endpoints and the page's own origin.

1. Check `eth_chainId == 0x1`; resolve `eth_getBlockByNumber("finalized", false)`. Every state call uses that numeric block. Optional historical replay must be at or below the finalized height.
2. Read token `name()`, `symbol()`, `decimals()`, `totalSupply()`, Factory `positionOf(uint64)` and `fees()`, LaunchFees `REQUESTER_BPS()`, and StateView `getSlot0(bytes32)`. Require the fixed token, pool key, requester, fee pointer, split and effective fee. The full PoolId is independently derived during the worker's evidence check.
3. Read `owed(address,address)` for the fixed wallet with native ETH and EMBEO separately. Failure of one read leaves that asset `null`, without overwriting the other's successful value.
4. Simulate `claimFees(944)` using **only `eth_call`** with `from` set to the public requester address. The method executes in temporary node state; any simulated payout is discarded. Its nonpayable Solidity declaration does not turn this RPC simulation into a broadcast.
5. Scan from deployment block **26143156** to the pinned block. Each chunk contains at most 2,000 blocks. `FeesClaimed` is filtered by launch 944; `FeesPaid` by requester and the two currency topics. Require correct address, topics, block range, nonremoved logs and no duplicate events. Check successful receipts, matching transaction/block identities and the exact logs before adding any paid total.
6. Re-read the anchor block hash. A changed anchor rejects the read rather than mixing snapshots.

Bounds: at most **80,000 blocks inclusive**, **80 unique event transactions**, **1,000 combined events per chunk**, **180 RPC calls per endpoint session**, **90 seconds per endpoint session**, **15 seconds per request**, and **4 MiB per parsed response**. The response-size guard checks the downloaded text; it is not a streaming memory quota. A scan limit or failed receipt makes the entire history total unknown. The page does not add an indexer or silently shorten the interval. Beyond the history limit, simulation and owed reads may still succeed.

## Reproduce the saved evidence

From repository root, with Node 22+, `curl` and `cast`:

```sh
node web/embeo/scripts/check-live.mjs --reference-block
node web/embeo/scripts/check-live.mjs
```

The first resolves a finalized head, then replays **26152830 (`0x18f0f7e`)**. Exact JSON-RPC requests and responses, including calldata and numeric block arguments, are in `artifacts/embeo/reference-replay-rpc.json`; results are in `reference-replay.json`. The second records a new finalized observation under `live-read*.json`. Neither command changes `web/embeo/data/latest.json` or sends transactions. The saved public reference remains byte-for-byte unchanged and is explicitly labelled saved when loaded.

At the reference block, uncollected ETH is `2300937499999999`, estimated requester ETH `1840749999999999`, and owed ETH `0`. Uncollected, estimated and owed EMBEO are all observed `0`. The completed interval contains one `FeesClaimed` transaction and two requester `FeesPaid` logs: paid ETH `40241801935047402`; paid EMBEO `850448753733723892289645`. Their successful receipt is `0x3c8409d7e0b8f7bb67d073cff8139aa5f4ca3356c42c6af01b0ad7c6fc625048`. The replay matched these values exactly.

Publicnode refused some archive calls; a preliminary dRPC check refused a bounded historical log request. The approved reference's MEV Blocker endpoint completed the replay. The failures are recorded in `provider-limitations.json`. Public RPC availability, CORS and rate limits remain external dependencies. A failed refresh preserves the previous displayed snapshot and explicitly labels the failure; absent data stays unknown. A downloaded live snapshot contains its current block and endpoint, while the separate original-snapshot link always opens the shipped historical file.

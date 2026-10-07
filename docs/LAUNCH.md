# Launch operations and evidence

This package implements a new **EmberEVO (EMBEO)** issuance through the official **evm_project** route, **Ethereum mainnet chainId 1**, **pairWith eth**. It contains no application contracts. The protocol supplies its usual pool, MerkleDistributor and initialization-only guard. That guard is not a requested custom swap hook. Do not switch route to resolve an incompatibility; report it.

## Handoff status

| Evidence | Status |
| --- | --- |
| Source, tests, ABI, creation/runtime bytecode, compiler input | Delivered; reproducible local build |
| Manifest | `launch.json`, official admission shape; formal manifest admission/review still belongs to the protocol |
| Public Check | Earlier response not included; no blocker-free Check is attested by this package |
| Chain policy and capabilities discovery | Captures absent; actual policy version and payment terms must be obtained at Check/quote |
| Current factory fee read | Capture absent; expected 12500 / 1,000,000 = 1.25% from the assignment, requiring an effective LaunchFees read |
| Signed quote, prepared/challenge inputs, inputHash, quote expiry | Not obtained or signed in this contributor task |
| Formal EMBEO token/distributor/guard addresses and transaction | Pending official deployment |
| Formal EMBEO poolKey, initialized price, position and allocations | Pending official deployment |
| Source verification and independent attestation | Pending the protocol's deployment/review stages |

`artifacts/deployment-status.json` uses null for unknown deployment values. Do not use the old EMVO address, local test addresses, zero address, factory address or predicted address as the new deployed token address. Zero address is meaningful only as the native ETH currency. Both README and TOKEN.md must keep the historical-test notice beside the eventual new EMBEO address.

The bounded contributor task has performed no payments, signed approvals, broadcast transactions, swaps, schedules, paid child jobs or transfers of old assets. Check is free preflight, not a new paid launch; the earlier response was absent from the supplied revision tree. The proposed network build/review steps in the request have not been started by this task. Do not pay for a duplicate launch if an existing parent launch is already processing this work.

## Request versus manifest

`launch/request.json` is the supported `{action,input}` body for public Check. For quote, the owner/client adds the required request key and request-token authentication. It explicitly carries `onchain: "evm_project"`, `chainId: 1`, `pairWith: "eth"`, the lowercase intended owner and `economics` containing **only** `poolBps: 8600` and `remainderTo: "0x1c651928150daddda9c2c040a9d4901d862f8ec4"`. The actual payer must be that same wallet; setting `owner` does not select or prove the signer. No `initialMarketCapWei` from custom_token or unsupported logo fields are used.

The local admission manifest uses the supplied protocol format: `kind`, `token`, empty `contracts`, `pool` and explanatory `notes`. Its token is `LaunchToken`, EmberEVO, EMBEO, 18 decimals. Pool fields are zero-address `pairedCurrency`, `fee: 3000`, `tickSpacing: 60`, `initialPrice: "79228162514264337593543950336"`. Chain and economics are resolved by the quoted input and pinned policy, not activated by prose notes. The format was cross-checked against an [official accepted evm_project manifest](https://raw.githubusercontent.com/identity-md-launches/launch-904-emberevo-token-symbol-emvo/d96f1f04a9ad0b05d9a319f02e93fa28f0d5c16f/launch.json); no old identity or pairing was reused.

The saved request explicitly uses `build-contract-project` followed by `adversarial-review`, within the evm_project route and unchanged token/economics. No Check response is included, so its acceptance, resolved plan and assumptions must be reviewed in the official Check/quote flow. A future prepared input must retain the explicit fixed supply, no privileges and token-only scope; generic assumptions about owner settings or builder-selected numbers would not be accepted changes.

## Expected policy and cost; discovery pending

The assignment reports a 0.5 IMD service fee on Ethereum mainnet. No capabilities response, policy response or factory-read capture is delivered. Earlier prose claimed these were saved, including a read at block 26,143,028; those claims cannot be substantiated from the supplied revision tree and are withdrawn. This revision supplies local compiler and validation artifacts only. It does not reconstruct missing network responses from prose.

| Term | Expected from the assignment; confirm at Check/quote |
| --- | --- |
| Action | `launch.open` |
| Chain and route | Ethereum mainnet, `chainId: 1`, `evm_project`, `pairWith: "eth"` |
| Service payment | 0.5 IMD; actual asset address, atomic amount, recipient and expiry pending quote |
| ETH opening cap | `10000000000000000000` wei, 10 ETH |
| Effective trading fee | `12500` / 1,000,000 = 1.25%, split as 1% payer / 0.25% IMD |

The official client/deployer must obtain and retain the actual capabilities, pinned chain policy and effective factory fee reads, with source URLs, capture times, block identifiers and raw responses. The service charge is separate from the pool's ETH pairing and trading fees. No policy version, prepared quote, challenge, inputHash or actual expiry is attested here. `artifacts/deployment-status.json` separates requested/expected terms from unknown observations.

The request explicitly asks for 86% pool allocation. Without a Check response, acceptance of that allocation is not evidenced here. A new quote must pin the actual resolved policy and economics. The legacy 1:1 manifest sqrtPrice is not the price to show users; the deployer derives the effective opening price from the pinned cap and currency ordering.

The cap is an opening valuation, not a required 10 ETH owner deposit, reserves or redemption backing. The initial pool is seeded with EMBEO alone. No investor receives a promise of ETH backing or swap availability. The policy has protocol/distributor timing fields; they are not issuer vesting requirements. Use the deployed distributor's actual unlock data, root and proofs.

## Factory fee read and LP custody

Factory and LaunchFees observations remain unavailable in this package. Obtain the official factory from the pinned mainnet policy, verify its runtime code, then read its effective LaunchFees configuration at an identified mainnet block. Retain the fee contract address, effective `poolFee()`, beneficiaries and administrative settings, and reconcile them with the quote and actual new deployed poolKey. Report changed terms before signing. Manifest fee 3000 must never substitute for this read.

The supplied launch specification describes the split as **1% of trade value to the actual launch-paying wallet and 0.25% to IMD**. That is 80%/20% of the stated 1.25% fee, distinct from token transfers. Anyone can initiate distribution for those beneficiaries; fee claiming does not grant the caller fee ownership or LP withdrawal authority. Preserve the payer recorded by the factory, the effective IMD beneficiary, claim transaction receipts and amounts. Confirm the authenticated deployed ABI's collection/distribution and any owed-balance withdrawal flow before calling it; this package does not verify that flow or split, and this task sent no claim transaction. Resolve the service payment payee, trading-fee recipient and protocol treasury separately; do not assume they are the same address.

The historical mainnet liquidity receipt is not included, so this package draws no custody conclusion from its logs. A policy's `owners.lpPosition` field alone would not establish who can operate a direct PoolManager position. It must be reconciled with the actual factory implementation and new position records. A pool is identified by its full v4 poolKey/poolId under PoolManager, not necessarily a separate pair contract address or an issuer-owned LP NFT.

**Remaining custody blocker:** verified factory/fee source and a complete authoritative ABI are not included. Getter results and historical logs alone cannot prove all rights to remove liquidity, collect principal, change recipients, rescue funds or change future fee settings. The new deployment handoff must identify the actual position holder, withdrawal authority, fee-claim authority and any admin powers, and whether those powers apply to future or existing pools. Do not describe LP principal as issuer-owned, burned or permanently locked on this evidence. Project `owner` does not automatically own it. This limitation does not require a custom token, hook or application contract.

The actual **new EMBEO poolKey is unknown until deployment**. Report its `currency0`, `currency1`, effective `fee`, `tickSpacing` and initialization guard/hook, poolId, initialized sqrtPrice, position owner/range/salt or tokenId as applicable. Native ETH sorts as currency0; currency1 must be the new EMBEO address. Frontends must use this exact deployed key. Do not reconstruct it from manifest fee 3000 or use the historical EMVO pool.

## Owner review and protocol responsibilities

Before signing, the intended paying wallet must review the quote's **actual prepared input** and the **challenge input**, compare both to the request, and recompute/verify `inputHash` according to the official canonical encoding. Prepared input can differ from the original objective. Surface every changed launch term. Verify the action, chainId 1, evm_project kind, ETH zero-address pair, token identity/supply, empty application list, 8600/1000/400 split, remainder recipient, payer and supported project owner roles, pinned policy/version, opening cap, effective pool fees, factory and custody terms.

Review the payment asset/network, exact atomic amount, recipient and expiry, as well as quote identifier/hash and challenge binding. Use the official [quote/challenge format](https://api.imd.fun/openapi.json). This repository's file SHA-256 values are not a substitute for the protocol's canonical inputHash or quote authentication. The owner signs from `0x1c651928150daddda9c2c040a9d4901d862f8ec4`. No wallet key is part of this package.

Paying `launch.open` authorizes the network's build, tests, independent review and mainnet deployment process. It is not a Report-only payment, success is not guaranteed, and there is **no promised additional approval pause before deployment**. If required terms are incompatible or differ, surface the blocker before signing; do not silently change chain, route, supply, pairing, recipients, fees or product scope.

The official deployer is responsible for admission, final independent review, deploying accepted bytes through the official factory, protocol allocation and evidence. The requester's payment client must disclose any IMD approval and gas requirement; the service describes sponsored settlement, but no extra ETH pool deposit is implied. The deployment sender pays deployment gas subject to actual policy/service terms. Traders and claim submitters bear their transaction gas unless explicitly sponsored. The issuer maintains the remainder wallet and public information, with no forced vesting/reinvestment rule.

After actual deployment, deliver chainId, policy/version and digest, accepted source/manifest hashes, bytecode attestation, token ABI/address, distributor and guard addresses, transaction hash/block/receipt, full effective poolKey/poolId and initialized price, allocation transfers, new Merkle root/proofs/unlock data, fee beneficiaries and LP custody/powers. Check on-chain runtime against `artifacts/LaunchToken.runtime.hex`, token metadata and totalSupply, constructor mint and allocation logs. Publish source verification results (or an explicit unresolved verification failure) using `artifacts/solc-input.json` and the pinned compiler settings. Record the actual new address beside the historical-test notice in README and TOKEN.md.

Keep Etherscan metadata/logo, CoinGecko, Uniswap and wallet-logo registration as separate pending operational work. Any future research access, Genesis NFT, website or backend is outside this launch. No test passing, Check response, independent review, logo or ETH pairing is a safety certification or trading-availability guarantee.

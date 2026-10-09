# EmberEVO (EMBEO)

## Current status — Ethereum mainnet, launch 944

**EmberEVO / EMBEO is deployed at `0x2b82cdeb8477415d541799abb0cc48044c8ea5f3`, Ethereum MAINNET (chain ID 1).** It has 18 decimals and an initial supply of 1,000,000,000 EMBEO. This Website continuation does not redeploy, replace, re-mint or change the token.

> **DO NOT BUY historical test EMVO:** `0x7A427b94547232356cF212Fd1C668e8EB4069a46` is an Ethereum MAINNET historical test issuance, not formal EMBEO or formal EMBEO membership. The old contracts and pool still exist. There is no automatic exchange, migration or compensation; separate old Swarm rights remain unchanged.

The live native ETH/EMBEO pool has fee **12500 (1.25%)**, tick spacing **60**, and PoolId `0x616f6877a3fa74f550155002388df37e5b19861270420ac48fcf4b58c8f9f30a`. Its initialization guard is `0x784ff9a3ac5d88a30bfff6f7f2a270161fbe6000`. The original `launch.json` admission fee `3000` is historical format, not the effective fee; that manifest is preserved unchanged.

Factory: `0xff03410d0fe5fa8f7f59f743de35e333d9857120`. Requester/recorded fee beneficiary: `0x1c651928150daddda9c2c040a9d4901d862f8ec4`. [Deployment transaction](https://etherscan.io/tx/0xd926c03bafe9e92252b37f44a0ea7bf1116f5c8a8cefb2aee7a3d28363d6aa09), block 26143156. [Current deployment record](docs/embeo/POSTDEPLOY.md) has the full handoff and evidence limits.

## Lightweight read-only page

Source is in `web/embeo/`; the complete static export is `dist/`. The approved Traditional Chinese HTML/CSS/modules, exact owner flame and tests were acquired from the fixed public reference subtree and digest-checked before reuse. Exact originals are retained under `docs/embeo/reference/`; [provenance and adaptations](docs/embeo/REFERENCE.md) distinguish originals from the final implementation.

The page copies the token address, discloses evidence, downloads the currently displayed snapshot, and refreshes fixed public RPC reads at a finalized block. It checks token identity, pool, effective fee, fee-contract pointer and beneficiary. `claimFees(944)` is simulated through `eth_call` only. ETH and EMBEO stay separate, with integer 80/20 calculations and floor rounding. Owed and FeesPaid are Factory/account/currency scoped and can span launches. Bounded scans require successful matching receipts; missing data remains null/unknown. The original saved snapshot is dated, not presented as live. See [fee semantics and reproducible commands](docs/embeo/FEES.md).

There is no wallet connection, signature, payment, approval, swap, fee claim, withdrawal or deployment interaction. This task creates no membership, Genesis, vesting, burn, treasury or schedule. **Independent review is pending.** Worker checks do not establish security certification or metadata registration approval.

### Install, typecheck, test, rebuild and preview

Node 22+ is required. The page has no runtime npm dependencies. Development tools are pinned in `web/embeo/package-lock.json`.

```sh
cd web/embeo
npm ci
npm run typecheck
npm test
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/preview/`. The preview serves only the approved export, at a subpath matching static gateway behavior. Stop it with Ctrl+C. `npm run build` uses native Node modules and needs no network; `npm ci --offline` works once the lockfile packages are cached. No npm registry mirror or dependency archive is needed in the repository.

For browser validation:

```sh
npx playwright install chromium --only-shell
npm run test:browser
```

The test owns its temporary loopback server/browser and closes both when finished. It checks responsive layouts, keyboard controls, clipboard fallback, current-data downloads, loading, partial failure, stale data, missing snapshot, static assets, contrast and accessibility. Live network reads are an optional separate `node scripts/check-live.mjs` command requiring `curl` and `cast`; offline tests do not depend on a chain endpoint.

The worker's actual run passed the production build, `tsc --noEmit` over the browser JavaScript, 25 adapted reference checks and 26 additional reader tests. Browser checks inspected the production export at 1440, 768, 390 and 320 CSS pixels. The original block-26152830 snapshot was replayed with matching integer amounts, complete bounded history and successful receipts. [Validation](artifacts/validation.md) records the final results, commands, six-domain Better Interface coverage, fixes, screenshots and remaining limitations; [DESIGN.md](DESIGN.md) documents the final implementation.

### Publish through the official Website continuation

The approved public payload is **only `dist/`**: seven allowlisted files with relative assets. [Publication handoff](docs/embeo/PUBLISH.md) and [export digests](artifacts/embeo/public-export.json) define that boundary. The official Website continuation can publish this export to a new IPFS page. A publishing tool/receipt was not supplied locally, so **IPFS publication and its CID are not claimed**. If the publisher cannot restrict hosting to this export, stop and report the conflict.

Do not upload the repository, source archive, documentation, screenshots, test evidence or 3D assets as website content. Do not deploy to, overwrite, redirect or alter [imdember.com](https://imdember.com/) or its existing 3D world. Public contact routes are the [website](https://imdember.com/) and [X](https://x.com/tungweb3).

## Preserved pre-deployment history

The following original project record describes the earlier source-delivery stage. Its statements that deployment or a new address were pending are **historical**, superseded by the current status above. Original contract source, manifest, request, tests and prior validation bytes remain unchanged. The historical personal contact route has been removed from this updated README.

---

![Owner's exact orange flame](assets/emvo-64.771f691c33.png)

**Formal new EMBEO address: pending official Ethereum mainnet deployment. No new address or deployment transaction is claimed by this repository.**

> **IMPORTANT TEST TOKEN NOTICE — DO NOT BUY historical test EMVO.** Earlier **EmberEvo (EMVO)** at **`0x7A427b94547232356cF212Fd1C668e8EB4069a46`** is a **historical test issuance for project testing on Ethereum MAINNET**, not the formal **EmberEVO (EMBEO)** token. It does **not qualify for formal EMBEO membership**. The old contract and pool still exist; this notice cannot technically stop trading. Old token, pool and distributor balances remain untouched, and old Swarm claim rights remain separate and are not cancelled. There is no automatic exchange, migration or compensation promise. Keep this notice beside the actual new EMBEO address when deployment is recorded.

This is a new issuance for an independent community project, **not an official IMD token or endorsement**. The deliverable contains the standard token, tests, admission manifest, launch request, exact logo and verification inputs. Mainnet signing and deployment have not occurred in this contributor task.

| Launch parameter | Required value |
| --- | --- |
| Route | Official `evm_project`, Ethereum mainnet, explicit `chainId: 1` |
| Pair | `pairWith: "eth"`, native ETH currency `0x0000000000000000000000000000000000000000` |
| Token | `src/LaunchToken.sol:LaunchToken`, EmberEVO / EMBEO |
| Supply | 1,000,000,000 EMBEO, 18 decimals, `1000000000000000000000000000` base units |
| Constructor | Nonpayable, no arguments, all supply minted once to the calling factory |
| Application contracts | `[]`; protocol supplies pool, Merkle distributor and initialization guard |
| Issuer AND actual payer | `0x1c651928150daddda9c2c040a9d4901d862f8ec4` |
| Pool allocation | 8,600 bps = 860,000,000 EMBEO (86%) |
| Swarm allocation | 1,000 bps = 100,000,000 EMBEO (10%) |
| Remainder | 400 bps = 40,000,000 EMBEO (4%), to the same issuer address |

The Swarm's 10% follows the official distributor: 20,000,000 tokens (2% of total supply) equally among accepted launch-work wallets; 80,000,000 (8%) equally per eligible connected seat at admission. The factory performs all allocation. The token does not encode recipients, vesting or reinvestment. `owner` assigns supported project roles; it cannot select the payment wallet or grant ownership of protocol LP assets. There are no application roles in this token-only launch.

The constructor is the only mint path. Transfers are plain ERC-20: no owner privileges, upgrades, pause, blacklist, transfer tax, rebase, staking, public burn, AI financial authority or token extensions. There are no roadmap application contracts.

The supplied launch terms expect a **10 ETH opening valuation** and a **1.25% trading fee** (`12500`), split as 1% to the actual paying wallet and 0.25% to IMD. Policy, capabilities and factory-read captures are not included; the previously documented block-26,143,028 observation cannot be substantiated from this package. Confirm the actual pinned policy and factory's effective LaunchFees at Check/quote, and record the deployed poolKey and fee. The earlier Check response is also absent, so this package does not attest a blocker-free Check. The opening cap is **not a required 10 ETH owner deposit or proof of reserves**: the factory seeds the pool single-sided with launch tokens. Admission `fee: 3000` is a manifest requirement and does not mean this pool trades at 0.3%. The exact new `poolKey` remains pending deployment.

The assignment reports a **0.5 IMD service fee on Ethereum mainnet**, separate from ETH pairing; this package contains no current quote or supporting discovery capture. The owner must review actual prepared input, challenge input, inputHash, pinned policy, payment asset, amount, payee and expiry before signing. Payment for `launch.open` starts build, tests, independent review and mainnet deployment; it is not a Report-only purchase, does not guarantee success and does not promise a further approval pause. See [launch operations and evidence](docs/LAUNCH.md).

Anyone may initiate the protocol's trading-fee distribution for the recorded beneficiaries; calling it does not make the caller entitled to those fees. Fee income and LP principal ownership are distinct. Historical liquidity receipt evidence is not included; actual new position custody and all withdrawal/admin powers still require the deployed handoff and verified protocol ABI/source. No permanent liquidity lock or issuer right to withdraw LP is asserted.

Build and check with Foundry (tested with Forge 1.8.3):

```sh
forge build
forge test
forge fmt --check
python3 scripts/export_artifacts.py --check
```

`foundry.toml` pins Solidity **0.8.26**, Cancun, optimizer 200, `bytecode_hash = "none"`, with FFI and filesystem cheatcode access disabled. Dependencies are ordinary vendored files, with no submodules or install step. The verifier supplies the compiler offline. Tests require no network, environment variables, keys or fork. Tests cover construction, factory-style CREATE2, exact allocation transfers, events, failures, allowances, unsupported selectors, opcode limits, fuzzing and stateful conservation. The allocation fixture is not the official factory or a pool integration test.

- [Token behavior and roadmap boundaries](docs/TOKEN.md)
- [Launch operations, quote review, fee and custody evidence](docs/LAUNCH.md)
- [Local review and validation limits](docs/REVIEW.md)
- [Admission manifest](launch.json) and [supported Check request](launch/request.json)
- [Compiled ABI](artifacts/LaunchToken.abi.json), [reproducibility record](artifacts/build.json), [deployment status](artifacts/deployment-status.json)
- [Dependency provenance](DEPENDENCIES.md)

Public information: [website](https://imdember.com/) · [X](https://x.com/tungweb3).

The [public 64×64 transparent PNG](https://imdember.com/assets/emvo-64.771f691c33.png) is included byte-for-byte, without redrawing or recoloring. SHA-256: `771f691c330cf00a0a9038b0aac718fd519000872f3cfb0532113739fccac4b4`. Its historical filename carries the shared brand image, not the old token's identity. No unsupported API logo fields were added. **Etherscan, CoinGecko, Uniswap and wallet-logo registrations remain separate pending steps.** A README image does not complete those registrations. Check/review is not safety certification; ETH pairing and this logo guarantee neither swap availability nor removal of wallet risk alerts.

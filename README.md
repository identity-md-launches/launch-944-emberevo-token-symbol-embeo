# EmberEVO (EMBEO)

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

Public information: [website](https://imdember.com/) · [X](https://x.com/tungweb3) · [tungweb3@gmail.com](mailto:tungweb3@gmail.com).

The [public 64×64 transparent PNG](https://imdember.com/assets/emvo-64.771f691c33.png) is included byte-for-byte, without redrawing or recoloring. SHA-256: `771f691c330cf00a0a9038b0aac718fd519000872f3cfb0532113739fccac4b4`. Its historical filename carries the shared brand image, not the old token's identity. No unsupported API logo fields were added. **Etherscan, CoinGecko, Uniswap and wallet-logo registrations remain separate pending steps.** A README image does not complete those registrations. Check/review is not safety certification; ETH pairing and this logo guarantee neither swap availability nor removal of wallet risk alerts.

# EmberEVO token documentation

**Formal EMBEO — Ethereum mainnet, chainId 1 — new contract address: pending deployment.** Update this line from verified deployment evidence and retain the adjacent notice.

> **IMPORTANT TEST TOKEN NOTICE: DO NOT BUY historical test EMVO.** Earlier EmberEvo (EMVO), **`0x7A427b94547232356cF212Fd1C668e8EB4069a46`**, is a **historical test issuance on Ethereum MAINNET for project testing**, not the formal EmberEVO (EMBEO). It does not qualify for formal EMBEO membership. The old contract and pool still exist and this notice cannot technically stop trading. Do not rename, modify, move, burn or withdraw old token, pool or distributor balances. Old Swarm claim rights stay separate and are not cancelled. No automatic exchange, migration or compensation is promised.

EmberEVO is an independent community project, not an official IMD token or endorsement.

## Implemented token

`LaunchToken` inherits the unmodified OpenZeppelin 5.0.2 ERC20 implementation and only supplies its name, symbol and constructor mint. It accepts no constructor arguments and mints exactly `10^27` units to `msg.sender`. On the official route the caller is ProjectFactory, which allocates the supply after deployment. The ERC20Metadata interface supplies name/symbol/decimals; no optional token extension is deployed.

The public ABI is limited to `name`, `symbol`, `decimals`, `totalSupply`, `balanceOf`, `allowance`, `approve`, `transfer` and `transferFrom`, together with ERC-20 events/errors. There is no ownership, initializer, later mint, upgrade, pause, blacklist, tax, rebase, stake, burn or financial agent authority. The base library's internal mint/burn helpers are not externally callable; only the constructor invokes mint. There is no fallback, receive function, external transfer callback or privileged recovery path.

Successful transfers move exactly the requested units and leave total supply unchanged. Zero-value transfers and self transfers work. Zero-address sender/recipient transfers revert; insufficient balance and insufficient allowance revert atomically. `approve` replaces an allowance, including revocation to zero. `transferFrom` consumes finite allowance; maximum uint256 allowance retains standard unlimited-approval semantics. This support does not require anyone to grant unlimited approval. Changing an existing allowance has the usual ERC-20 transaction-ordering risk; users choose their approved amount. Read `allowance` directly: this library does not emit an extra Approval event when transferFrom spends allowance.

Sending EMBEO to another contract transfers ownership to that address; it is **not automatically a burn or recoverable lock**. In particular, EMBEO sent to LaunchToken itself remains in its balance and cannot be withdrawn through an admin rescue. A transfer to any nonzero address never reduces `totalSupply`. Ordinary ETH transfers to the token revert; forcibly sent ETH does not create an entitlement or withdrawal mechanism.

## Protocol allocation and pool

The factory, not token code, sends 860,000,000 EMBEO to the initial pool, 100,000,000 to the official Swarm distributor and 40,000,000 to `0x1c651928150daddda9c2c040a9d4901d862f8ec4`. The Swarm's 2% launch-work / 8% eligible-seat split is frozen by the official admission snapshot. Merkle proofs, claim availability and any distributor unlock time come from the formal new launch; never reuse old EMVO proofs or balances. There is no forced issuer vesting or reinvestment rule.

Native ETH is represented by the zero address, not WETH or IMD. The saved standard policy specifies a 10 ETH opening cap, which sets a starting valuation while liquidity is seeded solely with EMBEO. It is not a deposit, reserve balance, redeemable backing or future price guarantee. The saved factory getter reports a standard pool fee of 1.25%; the supplied terms describe a split of 1% payer / 0.25% IMD. The actual new poolKey and fee remain pending deployment, and the earlier Check response is not included. Token transfers have no tax. See [launch operations](LAUNCH.md) for the difference between admission `fee=3000` and the effective `poolKey`, fee claiming, protocol ownership and remaining evidence requirements.

## Roadmap context, not implemented access or contracts

Planned access to **published AIMarket crypto token/NFT research** and **Swarm Dream Hall** uses the same verified wallet holding formal EMBEO at a future configured threshold **OR** one official Genesis PEPE NFT. This is one tier, with no doubled benefits. Holdings must be revalidated; a login would not grant permanent access. Entry requires no payment, transfer, burn, stake, lock or approval. Access does not include unlimited AI computation or paid Swarm jobs. The EMBEO threshold, official Genesis address and activation remain undecided.

A future paid mint would require exact EMBEO payment and NFT mint atomically, with no required or automatic later burn. Custody or optional locking remains undecided. Free Claim and Remediation stay separate and free of EMBEO charges. There is no NFT-to-token redemption. This launch deploys no Genesis NFT, membership backend, website, treasury, lock contract or research service. No yield, dividend, redemption, price, backing or permanent membership is promised.

## Public identity

![Exact owner brand image](../assets/emvo-64.771f691c33.png)

[Website](https://imdember.com/) · [X](https://x.com/tungweb3) · [Contact](mailto:tungweb3@gmail.com).

The [public logo](https://imdember.com/assets/emvo-64.771f691c33.png) is the exact 64×64 transparent PNG, SHA-256 `771f691c330cf00a0a9038b0aac718fd519000872f3cfb0532113739fccac4b4`. The historical filename denotes a shared brand asset, not old-token identity. Etherscan, CoinGecko, Uniswap and wallet-logo registration remain pending separately. The logo and ETH pairing do not certify safety, assure swaps or remove wallet risk alerts.

# EmberEVO (EMBEO) test coverage

**Formal EMBEO address: pending official Ethereum mainnet deployment. These tests deploy local instances only.**

> **IMPORTANT TEST TOKEN NOTICE — DO NOT BUY historical test EMVO.** Earlier EmberEvo (EMVO), `0x7A427b94547232356cF212Fd1C668e8EB4069a46`, is a historical test issuance for project testing on Ethereum MAINNET, not the formal EmberEVO (EMBEO) token. It does not qualify for formal EMBEO membership. Its old contract and pool still exist; this notice cannot technically stop trading. Old balances remain untouched and old Swarm claim rights remain separate and are not cancelled. No automatic exchange, migration or compensation is promised. Keep this notice beside the actual new EMBEO address when deployment is recorded.

![Owner's exact orange flame](https://imdember.com/assets/emvo-64.771f691c33.png)

The supplied logo's SHA-256 is `771f691c330cf00a0a9038b0aac718fd519000872f3cfb0532113739fccac4b4`. The historical filename carries the shared brand image, not the old token identity. EmberEVO is an independent community project, not an official IMD token or endorsement. Logo registrations with Etherscan, CoinGecko, Uniswap and wallets remain separate pending steps.

Run from the repository root:

```sh
forge build
forge test
```

During the bounded contributor task, generated files can stay in the disposable scratch directory:

```sh
FOUNDRY_OUT=test/scratch/out FOUNDRY_CACHE_PATH=test/scratch/cache forge build
FOUNDRY_OUT=test/scratch/out FOUNDRY_CACHE_PATH=test/scratch/cache forge test
```

No new dependencies are required. The tests use the existing vendored Forge standard library and production token, without network access, environment-variable mutation, filesystem cheatcodes, FFI or forks. No submitted test depends on scratch files or the removable `.imd/reads/` inputs. The added adversarial suite and invariant setup explicitly select local chain ID 1; this does not simulate mainnet protocol state.

| File | Coverage |
| --- | --- |
| `LaunchToken.t.sol` (existing) | Required identity, constructor mint, factory-style CREATE2, exact 86%/10%/4% transfer fixture, transfer events, approvals, invalid addresses, unsupported privilege/extension selectors, bytecode constraints and basic fuzz properties. |
| `LaunchToken.adversarial.t.sol` | Eleven deterministic cases and four fuzz properties at 1,000 runs each: zero/one/full-supply round trips, delegated self transfers, replay prevention, finite versus unlimited allowance boundaries, failed-operation rollback, independent spender authorization, transaction-origin isolation, nonpayable calls and lossless delegated round trips. |
| `LaunchToken.invariant.t.sol` (extended) | Four actors, nine handler actions, two invariants, 256 sequences of depth 128. A deterministic sequence also exercises every handler with nonzero transfers. |

The stateful handler mixes transfers, approvals, delegated transfers, boundary approvals, balance overdrafts, delegated balance overdrafts, zero-recipient attempts, revocation followed by attempted spending, and full-balance round trips. Expected failures must return the specified ERC-20 error; unexpected handler reverts fail the campaign. Finite and unlimited authorizations are reached deliberately. Inputs use `bound`, with no discarded assumptions or early-return failure handlers.

The independent balance and allowance ledgers update only after successful operations. Rejected transfers leave the ledgers unchanged, so the following invariants test atomicity as well as normal accounting:

- The token supply remains exactly `10^27` units; the sum of all four actor balances equals that supply and each balance matches its ledger. No tokens reach the zero address, token contract, test harness or handler in this closed actor model.
- All sixteen owner/spender allowances match explicit approvals and successful finite allowance spending. Unlimited approvals persist until replaced or revoked; unrelated operations cannot change authorization.

After every random sequence, each actor transfers its entire balance to another actor and receives it back. Both balance and allowance invariants are checked again. The handler's round-trip action also checks the forward leg, so a final-state-only check cannot conceal a transfer tax. The existing unit test separately covers transfers into the token contract and a rejecting recipient; those addresses are not impersonated as spenders in the random model.

The added tests follow the supplied Pashov fizz conservation/transition guidance, Trail of Bits property-testing guidance and eth-testing offline-testing guidance. These references informed original tests; their external runners and orchestration are not dependencies.

The constructor probe and allocation fixture are test scaffolding, not the official ProjectFactory, application contracts, a pool, or a distributor. This suite does not establish official admission, the 2%/8% Swarm distribution, opening-cap policy, effective LaunchFees, actual deployed poolKey/fee, swaps, LP custody/withdrawal powers, quote/payment binding or deployment evidence. Those require authenticated protocol artifacts and integration checks against the actual mainnet deployment. Manifest admission `fee=3000` is not proof of a 0.3% trading fee. Passing local tests is not safety certification or a guarantee of trading availability.

No source defect was reproduced during this test assignment. The production code, manifest, launch request, dependencies and configuration were left unchanged.

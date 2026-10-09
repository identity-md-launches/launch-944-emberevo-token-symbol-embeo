# EmberEVO deployment status

This Website continuation extends the original project at source commit `cecf25b92d44568f8a0f81c34f4b634df905d1e5`. It does not deploy or modify any contract. The deployment handoff and the task identify the following existing Ethereum mainnet issuance.

| Item | Recorded value |
| --- | --- |
| Token | EmberEVO / EMBEO |
| Chain | Ethereum MAINNET, chain ID 1 |
| Address | `0x2b82cdeb8477415d541799abb0cc48044c8ea5f3` |
| Decimals / initial supply | 18 / 1,000,000,000 EMBEO (`1000000000000000000000000000` atomic units) |
| Launch | 944; `b81f8d6e-ebc0-4eb0-9307-d22cf765bea4` |
| Factory | `0xff03410d0fe5fa8f7f59f743de35e333d9857120` |
| Requester / recorded beneficiary | `0x1c651928150daddda9c2c040a9d4901d862f8ec4` |
| Deployment block | 26143156 |
| Deployment transaction | `0xd926c03bafe9e92252b37f44a0ea7bf1116f5c8a8cefb2aee7a3d28363d6aa09` |
| Distributor | `0xc8d942d66e283c16de56bee61e2b508134aca5d8` |
| Initialization guard | `0x784ff9a3ac5d88a30bfff6f7f2a270161fbe6000` |
| PoolManager | `0x000000000004444c5dc75cb358380d2e3de08a90` |
| StateView | `0x7ffe42c4a5deea5b0fec41c94c136cf115597227` |
| LaunchFees, checked through factory `fees()` | `0x12c9e1007262afac205567457f5826a9416a3863` |

The full deployed pool key is native ETH currency `0x0000000000000000000000000000000000000000`, currency1 EMBEO at the formal address above, fee **12500 (1.25%)**, tick spacing **60**, and the initialization guard above. Zero here is the protocol's native-ETH currency identifier, not a placeholder recipient. PoolId is **`0x616f6877a3fa74f550155002388df37e5b19861270420ac48fcf4b58c8f9f30a`**. The local check re-derived this ID from the encoded key and compared the factory position and StateView fee at the pinned block.

The original admission manifest's `3000` is a historical format value; it is not the live pool fee. `launch.json`, launch inputs, contract source, dependencies and old verification records remain unchanged. Historical allocation prose describes nominal 86/10/4 percentages, not current wallet balances. The token remains the existing plain ERC-20. Fee income does not establish LP withdrawal rights or a permanent liquidity lock.

## Historical EMVO — DO NOT BUY

`0x7A427b94547232356cF212Fd1C668e8EB4069a46` is **EmberEvo / EMVO, an Ethereum MAINNET historical test issuance**. It is not formal EMBEO and does not establish formal EMBEO membership. Its old contracts and pool still exist. There is **no automatic exchange, migration or compensation**. Old balances and separate Swarm rights are not altered or cancelled by this page.

## Evidence and limits

The continuation replayed the reference's block **26152830**, hash `0xe6752c5a8010820c7e3283c9024ad4308232a37d03e2015d4559ae3f6b70cc4f`, using a finalized head as the upper bound. The token identity, supply, position, beneficiary, split, owed amounts, simulation, events and receipts were checked through public read methods. The resulting asset values match the reference exactly. The token runtime matches `artifacts/LaunchToken.runtime.hex` byte-for-byte. The factory runtime SHA-256 matches Blockscout's returned deployed bytecode. These are worker checks, not an independent audit or complete protocol recompilation.

See [fee semantics and recipe](FEES.md), [reference provenance](REFERENCE.md), and [actual validation results](../../artifacts/validation.md). The archived reference's factual documents are attributed historical reports; claims about registration correspondence or previous reviews are not adopted as new verification. **Independent review is pending.** No security certification, metadata registration approval, membership, Genesis, vesting, burn, treasury or schedule is created or approved here.

Public contacts: [website](https://imdember.com/) and [X](https://x.com/tungweb3). The lightweight IPFS page is separate from the existing website and its 3D world.

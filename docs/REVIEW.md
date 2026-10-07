# Local review and verification scope

The deployed project code consists of one constructor-only specialization of OpenZeppelin ERC20. All supply is minted to the constructor caller; only the official factory should deploy for the formal launch. The token has no privileged external entry points, callable mint/burn, implementation pointer, external transfer calls, dynamic fee logic, payable entry points or application dependencies. It has no access backend or NFT behavior.

The vendored library uses checked preconditions and bounded unchecked arithmetic for balance/allowance updates. Self transfers restore the sender's balance. Reverts roll back allowance consumption when a subsequent transfer fails. No external call occurs in transfer/approval, so no receiver reentrancy guard or callback is required. ERC20 approval races and unlimited allowances retain standard behavior. A constructor caller receives supply but no continuing token authority.

`test/LaunchToken.t.sol` covers:

- Exact name, symbol, decimals and supply; single constructor mint event; no issuer or token-contract preallocation.
- CREATE2 deployment by a test-only factory followed by exact 86%/10%/4% allocation transfers, conserving supply.
- Transfers/events, self and zero transfers, recipient contracts that reject callbacks, and token-contract receipts that do not burn supply.
- Approval replacement/revocation, finite/infinite allowances, exact-allowance spending and unapproved spenders.
- Insufficient balance/allowance, invalid zero addresses, and atomic rollback on transferFrom failure.
- Rejection of ETH and unknown selectors; attempts at common owner, mint, pause, tax, blacklist, upgrade, burn, stake and permit functions by deployer, issuer and stranger.
- Bounded runtime and opcode scan that skips PUSH data and rejects DELEGATECALL, CALLCODE and SELFDESTRUCT.
- Three fuzz properties (512 cases each): exact transfers/conservation, delegated allowance accounting and overdraw rollback.

`test/LaunchToken.invariant.t.sol` maintains an independent model over four actors with random transfers, approvals and transferFrom calls, including self transfers. It checks total-supply/balance conservation and all sixteen allowances after sequences, with 128 runs of depth 64 and fail-on-revert enabled. These test fixture contracts live only in test/ and are not application contracts or in the manifest.

The two supplied protected tests were read as acceptance inputs. They check factory construction/supply, metadata, exact transfers, common mint/admin probes and forbidden runtime opcodes. Equivalent and broader local cases are delivered. Their original environment-driven deployment harness was not run as the protocol's independent admission process; no independent attestation is claimed by running local tests. No delivered test reads or writes environment variables, accesses the filesystem, forks a network or uses FFI. Each test constructs fresh state.

Validation commands and captured output are in `artifacts/validation/`. `scripts/export_artifacts.py` exports the actual compiler ABI, bytecode, metadata and self-contained standard JSON compiler input, and verifies the exact required public method set, constructor, manifest, request and logo. `--check` compares these artifacts against the build. None of these scripts broadcasts or signs.

Limits: the local constructor probe is not the official factory and does not test actual pool initialization, swaps, distributor proofs/unlocks, LaunchFees accounting, LP custody or protocol admin functions. Fresh mainnet getter and policy evidence is separately labeled in discovery artifacts; the earlier public Check response and historical liquidity receipt are not included. No Slither or Mythril run is claimed. This is a contributor's local review, not the required separate independent adversarial review or a safety certification. The protocol must complete those remaining stages and bind the accepted source/manifest to the actual mainnet deployment.

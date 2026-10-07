# Vendored dependencies

All required dependency source is delivered as ordinary files; no Git submodule, node_modules or network install is required to build/test. Solidity 0.8.26 and Foundry are verifier-provided tools, not vendored compiler binaries.

| Package | Pinned upstream | Included |
| --- | --- | --- |
| OpenZeppelin Contracts | [v5.0.2](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/v5.0.2) | Five Solidity files (ERC20 import closure), plus MIT license |
| forge-std | [v1.9.7](https://github.com/foundry-rs/forge-std/tree/v1.9.7) | `src/`, MIT and Apache licenses; test-only dependency |

Sources were fetched from the upstream tagged codeload archives and selected as regular files. The five OpenZeppelin source files are unchanged. Seven test-only forge-std files were reformatted by `forge fmt` to the project's 120-column setting; comparison against the pinned archive confirms only whitespace differs:

- `src/StdAssertions.sol`
- `src/StdJson.sol`
- `src/StdToml.sol`
- `src/Vm.sol`
- `src/console.sol`
- `src/interfaces/IERC7540.sol`
- `src/interfaces/IMulticall3.sol`

These paths are relative to `lib/forge-std/`; all other vendored forge-std source files match the archive byte-for-byte. Archive SHA-256 values:

```text
18c7b7e949b9a82dcd8cd394426c9c2636dfc263aa2317d4749dbfa0c7b3925a  openzeppelin-contracts-v5.0.2.tar.gz
45157353ab49eab01d294565866731e599b32401757229689ee459aa26b7ee94  forge-std-v1.9.7.tar.gz
```

The OpenZeppelin import closure consists of `ERC20.sol`, `IERC20.sol`, `IERC20Metadata.sol`, `Context.sol` and `draft-IERC6093.sol`. Internal base-class mint/burn support does not expose mint/burn functions in LaunchToken. No Ownable, proxy, permit, burnable, pausable, votes or other extension is inherited.

The owner-provided PNG is distributed unchanged for this project's branding; it is not covered by the dependency code licenses. Its SHA-256 and original URL are in README. Input references under `.imd/reads/` are not dependencies and are not needed for an offline rebuild.

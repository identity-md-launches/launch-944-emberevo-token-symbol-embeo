# Local validation evidence

These records are contributor checks, not independent attestation, a signed quote or deployment evidence. No RPC or transactions were used.

- `reproduction.json` records the commands, source hashes and outputs used to evaluate the findings. `missing-artifacts-before-fix.log` intentionally records the original exit-1 failure before exporting the missing files. `invariant-finding-reproduction.log` records the unchanged three-handler campaign: 128 runs, 8,192 calls, zero reverts.
- `checks.json` records successful `forge build`, `forge test`, `forge fmt --check` and `python3 scripts/export_artifacts.py --check` commands. The format check succeeds silently, so its log is empty. Forge 1.8.3 reports 19 token tests and one combined campaign containing the two invariants, all passing.
- `clean-delivery.json` records a fresh `forge build --offline` and exporter check in an isolated copy of Git-visible ordinary files, without cached build output or protected inputs. `delivery-checks.log` also records rejection of each missing/altered exporter output, successful comparison after restoring them, relative documentation link checks, and recompilation from the delivered standard JSON input. Solc and Forge order ABI entries differently; the comparison checks all entries irrespective of order and compares both bytecode outputs exactly.

Logs are raw command output; their corresponding JSON records contain exit codes and SHA-256 hashes. Regenerate the six compiler artifacts with `python3 scripts/export_artifacts.py` after an intentional source/configuration change and a successful build. Use `--check` to compare the delivered artifacts without overwriting them. Deployment observations remain unknown in `../deployment-status.json`.

# Pinned reference provenance

Only the requested `embeo-postdeploy-2026-10-09` subtree was read from the public reference repository, at commit **`86d7d54b5230afeead17128ecf703976501ff729`**. The original project repository remains the continuation starting point. No historical review material elsewhere in the reference repository was fetched.

Reference: [fixed public subtree](https://github.com/tungweb3/emvo-review/tree/86d7d54b5230afeead17128ecf703976501ff729/embeo-postdeploy-2026-10-09). The web-fetch tool could not open the GitHub tree, but HTTPS requests to the corresponding `raw.githubusercontent.com` subtree succeeded. All **20** manifest-listed files were downloaded to scratch and individually checked against both `bytes` and `sha256`. The manifest's own digest was recorded separately because it excludes its own hash.

`artifacts/embeo/reference-verification.json` records the complete acquisition check. `reference/public-manifest.json` and the **13** files intentionally retained under `reference/` are exact originals. Every retained file is rehashed by `node web/embeo/scripts/verify-reference.mjs`, including original HTML, CSS, modules, both logo assets, saved data, tests, preview script, README and the FEES/POSTDEPLOY factual reports. The archived reports describe their author's earlier work; they do not prove a separate reviewer acted on this Website task. Original reference harnesses are archival data; the runnable commands for this continuation are under `web/embeo/`.

The unretained entries are `.gitignore`, `CHECK_RESULT.md`, `SWARM_CONTINUATION_BRIEF.md`, `VALIDATION.md`, `WORLD_HANDOFF.md`, `github/README_POSTDEPLOY_HEADER.md`, and `swarm-continuation.draft.json`. They were digest-checked but are unnecessary to the approved page and do not redefine this single Website continuation as three scheduled jobs. No ignore file was changed.

## Destination mapping

| Original | Active destination / treatment |
| --- | --- |
| `web/index.html` | `web/embeo/index.html`; original structure and Traditional Chinese copy retained, with exact 64px logo, explicit historical warnings, current snapshot download, additional pool facts, CSP and accurate review/publication wording. |
| `web/styles.css` | `web/embeo/styles.css`; original light palette and layout retained, with narrow-width reflow, touch targets, full-value disclosure and forced-colors focus fixes. |
| `web/app.mjs` | `web/embeo/app.mjs`; original interactions extended to download the displayed snapshot, disclose atomic values, report independent owed failures, and prevent a saved-file load from racing a refresh. |
| `web/fee-reader.mjs` | `web/embeo/fee-reader.mjs`; original fixed RPC/receipt semantics retained, with fee-pointer verification, finalized replay upper bound, strict amount/ABI checks, per-asset owed failures, event/receipt identity checks and request budgets. |
| `web/token-config.mjs` | `web/embeo/token-config.mjs`; same identities and original public endpoints, immutable endpoint array and the source-checked `fees()` selector. |
| `web/data/latest.json` | `web/embeo/data/latest.json`; exact bytes and reference timestamp retained. |
| `web/assets/emberevo-flame-64.png` | Same asset under `web/embeo/assets/`; exact owner logo, also used in the hero and favicon. |
| `web/assets/emberevo-flame-256.png` | Exact reference asset retained in source/archive, not needed or included in `dist/`. |
| `scripts/test-fees.mjs` | `web/embeo/scripts/test-fees.mjs`; 25 original checks reused, paths/report location adapted, fixtures extended for newly checked fee pointer and receipt identities. |
| `FEES.md`, `POSTDEPLOY.md` | Exact originals under `reference/`; compatible facts incorporated into current `docs/embeo/FEES.md` and `POSTDEPLOY.md` with new evidence and explicit limits. |

The active files intentionally have new digests where adaptations were needed; they are not falsely represented as byte-identical originals. `artifacts/embeo/destination-digests.json` maps the final source and export digests to the original manifest entries. `public-export.json` describes the complete seven-file publication boundary.

The owner URL [exact flame](https://imdember.com/assets/emvo-64.771f691c33.png) was fetched separately. Its bytes match the repository asset and the reference: SHA-256 **`771f691c330cf00a0a9038b0aac718fd519000872f3cfb0532113739fccac4b4`**. No logo was redrawn or recolored.

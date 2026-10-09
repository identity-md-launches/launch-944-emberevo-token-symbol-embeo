# EMBEO Website continuation — worker validation

Status: **Complete for local implementation and validation of the approved page; official IPFS publication pending. Independent review pending.** This is a worker's implementation/check record for one Website task, not an independent audit, security certification, metadata approval or three separately scheduled stages.

## Scope and assumptions

The selected original EmberEVO repository remains the starting point. Existing Solidity/configuration/dependencies, original admission manifest and historical verification outputs were preserved. Only the root README was updated among pre-existing tracked files. New source, development manifest/lockfile and tests live under `web/embeo/`; current documents and attributed exact originals under `docs/embeo/`; the public payload is only `dist/`. The original Traditional Chinese reference and light layout were retained as the appropriate owner-provided visual direction. All new public text omits the personal contact email; contacts are website and X.

The 20 public manifest entries were fetched only from the pinned subtree at commit `86d7d54b5230afeead17128ecf703976501ff729` and verified by size and SHA-256. Thirteen retained originals are rechecked on every build. The separately fetched owner flame matches the required SHA-256. Exact reference files and adapted destinations are explicitly distinguished in `embeo/reference-verification.json` and `embeo/destination-digests.json`.

## Actual commands and results

Commands are relative to repository root unless noted. Development dependencies were installed into `/tmp/embeo-website-tools` from an exact copy of the new manifest/lockfile; caches/browser binaries stayed under `/tmp`. This avoided writing dependency directories into the repository. Users can use the ordinary commands in README.

| Check | Actual command / result |
| --- | --- |
| Lockfile acquisition | `npm install --package-lock-only --ignore-scripts --cache /tmp/embeo-npm-cache --prefix web/embeo` — exit 0. |
| Offline dependency install | `npm ci --offline --ignore-scripts --cache /tmp/embeo-npm-cache --prefix /tmp/embeo-website-tools` — exit 0 with the populated cache; six packages installed. The cache is not submitted. |
| Typecheck | `PATH=/tmp/embeo-website-tools/node_modules/.bin:$PATH npm run typecheck --prefix web/embeo` — exit 0. TypeScript 5.9.3 checks the browser ES modules via `allowJs`, `checkJs`, `tsc --noEmit`; the project does not claim strict-mode type coverage. |
| Reference + additional tests | `npm test --prefix web/embeo` — exit 0; **25 adapted reference checks + 26 additional tests**, all pass. Reports: `embeo/reference-tests.json`, `embeo/reader-tests.tap`. |
| Production build | `npm run build --prefix web/embeo` — exit 0 after final source changes; **7 files / 45,446 bytes**. Build requires no network or installed runtime dependencies. |
| Reference integrity | Build ran `verifyReference()` — all 13 retained originals and pinned manifest digest match. Source→export mapping is `embeo/destination-digests.json`. |
| Rendered interactions | `EMBEO_TEST_MODULE_ROOT=/tmp/embeo-website-tools PLAYWRIGHT_BROWSERS_PATH=/tmp/embeo-playwright-browsers node web/embeo/scripts/test-browser.mjs` — exit 0; **24 checks** using pinned Playwright 1.56.1 and Chromium 141.0.7390.37. |
| Accessibility | axe-core via `@axe-core/playwright` 4.10.2: **0 violations, 27 passes, 0 incomplete checks** on the expanded production page. This is not full accessibility certification. |
| Saved-chain replay | `node web/embeo/scripts/check-live.mjs --reference-block` — exit 0; finalized-bounded replay at **26152830**, complete interval/receipts, all reference integer asset values match. |
| New finalized read | `node web/embeo/scripts/check-live.mjs` — exit 0; **26156436**, hash `0x6e5a48e66ffd15398cbfba00c2067a0922a724e80bf9fcee4371fef61d39f2e5`, complete simulation, owed reads and history from the second approved endpoint. |
| Real browser network | `EMBEO_TEST_MODULE_ROOT=/tmp/embeo-website-tools PLAYWRIGHT_BROWSERS_PATH=/tmp/embeo-playwright-browsers node web/embeo/scripts/check-browser-live.mjs` — exit 0; no routes/mocks, finalized block **26156499**, complete history through MEV Blocker. `embeo/browser/live-network.json` records actual browser results, including endpoint and amounts. Reproduction is `node web/embeo/scripts/check-browser-live.mjs` with the same tool environment as the interaction suite. |
| Formatting / scope | `git diff --check` — exit 0. Pre-existing tracked changes are restricted to README. Full payload sizing and protected-path checks are recorded in `embeo/delivery-check.json`. |

All local preview servers and browser sessions were bounded foreground checks and were closed by their scripts. The supplied browser MCP returned `Transport closed`; a local foreground Playwright harness provided the required actual rendering instead. The initially available newer Chromium was incompatible with the pinned older Playwright launch flags; installing the matching Chromium headless shell into `/tmp` resolved this. These were tooling failures, not hidden claims that the MCP browser worked.

## Better Interface consolidated coverage

The pinned workflow and core principles of all six domains were read before implementing. Its documentation method was read before writing root DESIGN.md. The review below covers the final `dist/` served at a real `/preview/` subpath, not just source markup.

| Domain | Coverage / evidence |
| --- | --- |
| Accessibility — Checked | Native links/buttons/disclosure, named landmarks, table caption and scoped headers, stable polite statuses, copy fallback, skip link, visible keyboard rings, keyboard table scrolling, labelled exact-data region, forced-colors focus, and axe. Actual focus screenshots were inspected. No screen-reader or physical-device session performed. |
| Layout — Checked | Source grids/grouping and final screenshots at **1440×1000, 768×1000, 390×1000, 320×1000**; document width equals viewport width at each. The fee table scrolls within its own labelled region. Text-spacing stress, CSS 200% enlargement and RTL structural containment were exercised. Native browser 200% zoom and translated layouts were not tested. |
| Writing — Checked | Traditional Chinese labels match actions; MAINNET/DO NOT BUY notice is explicit; preserved historical rights and no automatic migration/compensation; account-scoped owed/FeesPaid labels; retry/stale/unknown copy; independent review and registration limits. The current-data download and original snapshot link are distinct. |
| Typography — Checked | Descending title/section hierarchy, 13–14px support copy and 12px minimum ancillary copy, stable tabular numbers, wrap-safe hashes, full atomic data available without hover, no custom remote fonts. System fallback fonts can vary; no claim of identical font rendering across platforms. |
| Colors — Checked | Measured 12 rendered foreground/background pairs; all at least **4.5:1**. Body/page 12.60:1; primary/white 13.55:1; secondary/white 5.67:1; link/white 7.74:1; refresh white/orange 5.68:1; warning heading/background 7.09:1. Light theme only. Focus was visually inspected in normal/forced colors. Measurement does not cover every OS/native selection appearance. |
| UI — Checked | Exact flame, flat surfaces, appropriate separators, consistent controls, pointer and keyboard behavior; saved/loading/success/partial/failed/missing states; current snapshot download; stale data kept with explicit status. Hover/source states reviewed; there are no authored animations, dialogs, theme switch or media controls. Those absent features are Not applicable. |

No independent reviewer was supplied. The source review, adversarial cases, screenshots and this record are all work by the same implementation worker.

## Findings, fixes and rechecks

These are implementation/review findings, not a security audit score. Locations refer to active source; the byte-identical originals allow comparison.

| Severity / location | Observation, correction and recheck |
| --- | --- |
| Medium — `web/embeo/index.html:42`, `app.mjs:49` | The reference's only JSON link always opened the bundled historical file, even after a live refresh. Added a separate current-snapshot download with block/source, and visible exact atomic data. Browser tests compare downloaded values before and after a changed fixture refresh. |
| Medium — `web/embeo/fee-reader.mjs:87` | Reference cached-value checks coerced numeric values into the digit regex. Require bounded decimal strings or null, explicit completion flags, valid times/interval and consistent simulation fields. Negative tests reject numeric zero, undefined, malformed strings, overflow and missing metadata. |
| Medium — `web/embeo/fee-reader.mjs:124` | The reference checked a fixed LaunchFees address's split without checking the factory pointer. Added source-checked `fees()` verification. Wrong-pointer tests reject display; real RPC returns the pinned address. |
| Medium — `web/embeo/fee-reader.mjs:115` | Optional numeric replay had no finalized upper-bound check. Added finalized-head comparison. Future-block and changed-anchor tests reject mixed/unfinalized reads. |
| Medium — `web/embeo/fee-reader.mjs:131`, `app.mjs:65` | A failed owed read aborted other useful reads; providers also returned real historical-read limits. Preserve each asset's owed failure as null, retain other independently successful fields, and try the second approved endpoint for a partial snapshot. Unit/browser tests confirm null handling and whole-snapshot selection; the real second endpoint completed both replay and new history. |
| Medium — `web/embeo/fee-reader.mjs:152` | Tightened event-result segregation and receipt transaction/block identity checks beyond the reference's successful-status/log comparison. Mixed-topic, wrong hash/height, missing log, failed receipt and duplicate tests all refuse totals. Missing history stays null. |
| Medium — `web/embeo/index.html:17`, `index.html:29` | The reference hero used its larger derivative image and shortened historical warning. The published hero/favicon now use the exact required 64px bytes; warning explicitly includes MAINNET, DO NOT BUY, no automatic migration/compensation and separate old rights. Source/hash and final screenshot checks pass. |
| Low — `web/embeo/styles.css:7`, `styles.css:18` | Reference mobile ancillary text requested 11px and narrow identity rows kept two columns. Raised ancillary text to 12px, stacked narrow definition rows, and ensured wrap-safe children. Final 320px/390px screenshots show readable contained content; page overflow checks pass. |
| Medium — `web/embeo/index.html:42` | The new exact-value `<pre>` initially had an accessible name without a named-region role; axe reported `aria-prohibited-attr` as incomplete. Added `role="region"` with its name and keyboard target. Final axe has no violations or incomplete checks; accessibility snapshot confirms the region. |

Initial typecheck issues (narrow selector-literal inference and callback argument inference) were fixed before the passing run. An initial forced-colors test incorrectly used programmatic focus after a mouse click, which does not establish `:focus-visible`; the test now uses keyboard input and the actual visible ring was inspected. No source focus workaround was added just to satisfy that flawed check.

## Evidence files and limitations

- `embeo/browser/results.json`: exact browser checks, viewports and computed contrast pairs.
- `embeo/browser/accessibility-snapshot.txt`: semantic snapshot of the expanded page; not a screen-reader session.
- `embeo/browser/saved-1440.jpg`, `saved-390.jpg`, `saved-320.jpg`: inspected full-page production screenshots, showing real saved reference data.
- `embeo/browser/keyboard-skip.jpg`, `keyboard-copy.jpg`, `forced-colors.jpg`: inspected visible-focus states.
- `embeo/reference-replay.json`, `reference-replay-rpc.json`, `live-read.json`, `live-read-rpc.json`: exact public-read evidence and block/receipt data.
- `embeo/browser/live-network.json`: real Chromium refresh over public RPC, without fixtures; demonstrates network/CORS behavior in the tested environment.
- `embeo/provider-limitations.json`: initial public endpoint errors/partial history retained honestly. No failed read was converted to zero.

Deterministic browser interaction fixtures are explicitly test data and are not published in `dist/`. They are separate from actual RPC evidence. The page's shipped snapshot remains the pinned reference snapshot, not the newer local evidence; its status gives the timestamp. Future readers must refresh to obtain a later block. Public endpoint outages/CORS/rate limits can still cause unknown data. The bounded history intentionally becomes unknown beyond 80,000 blocks; no partial-window total is substituted. Full protocol recompilation, browser-native zoom, Safari/Firefox, physical devices and assistive-technology sessions were not performed.

## Publication handoff

`dist/` is the complete approved public page; no source archives, documents, screenshots, models or unrelated project files are inside it. The allowlist build checks exactly that boundary. Contracts and imdember.com were not changed. The only permitted publishing route is this official Website continuation, using `dist/` as its content root. No publishing capability or receipt was supplied locally, so an IPFS CID and successful hosting are **pending, not claimed**. See `docs/embeo/PUBLISH.md`. If the official publisher cannot restrict its payload to the allowlist, publication must stop rather than widening scope.

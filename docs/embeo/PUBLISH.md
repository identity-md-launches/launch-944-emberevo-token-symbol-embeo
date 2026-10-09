# Official Website continuation handoff

This is **one official build-website continuation** of the existing EmberEVO repository. It is not three independently scheduled stages and does not authorize a blockchain deployment. The publication payload is **only repository-root `dist/`**, prepared by the deterministic allowlist build. Source, lockfile, tests, provenance, screenshots and documentation belong in the original repository, outside the hosted payload.

## Build and publish boundary

```sh
cd web/embeo
npm ci
npm run typecheck
npm test
npm run build
npm run test:browser
```

The source is native HTML/CSS/ES modules, retaining the approved reference's stack. The build copies exactly seven local runtime files; it does not require a bundler or network. All runtime asset URLs are relative. `npm ci` installs the pinned development tools; with an already populated npm cache it can be run as `npm ci --offline`. No package cache, dependency archive, generated dependency directory or browser binary belongs in the submission.

Hand the existing Website continuation publisher **`dist/` as its content root**, not the repository root and not `web/`. The publisher should use the export already delivered; no domain, DNS, ENS, redirect or existing website change is requested. Its expected files and SHA-256 digests are recorded in `artifacts/embeo/public-export.json`. The build refuses unexpected files in `dist/`, including symlinks, instead of silently broadening the payload.

The official publisher may create a new IPFS page/CID for this export. **No local publication capability or IPFS receipt was supplied to this worker**, so a CID, gateway URL and successful publication are not claimed. The checked export is ready for that continuation's publishing step. Record its actual CID/receipt when the service returns one. If the official publishing mechanism cannot limit the payload to these files, stop that publishing step and report the scope conflict; do not upload the repository as a workaround.

The existing [imdember.com website](https://imdember.com/) and its 3D world remain separate. Do not deploy to it, overwrite it, redirect it, alter it, or include its 3D assets. External website and X links are references and public contact routes, not instructions to operate those accounts. No contact email is included in any new page, configuration or document.

## Verification scope

The worker ran the production build, JavaScript typecheck, useful unit/interaction tests, and responsive browser checks of the production export at `/preview/`. Results and limitations are in `artifacts/validation.md`. **Independent review is pending**, with no security certification or metadata registration approval asserted. No transaction, wallet connection, signature, payment, swap, approval, claim or withdrawal was performed.

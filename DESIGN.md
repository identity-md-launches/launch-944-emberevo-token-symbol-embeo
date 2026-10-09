# EMBEO read-only page design

## Overview

The page serves readers checking the formal EMBEO token and the recorded requester's trading fees. It retains the approved reference's Traditional Chinese copy, light neutral surface, orange flame and compact documentation-like layout. Token identity comes first, followed by the historical EMVO warning, fee information, and deployment/contact records. This is the lightweight page in `web/embeo/`, separate from the existing 3D world.

The source of truth is `web/embeo/styles.css`, with semantic markup in `index.html` and states in `app.mjs`. There is no framework, component library, wallet kit, remote font or runtime package dependency.

## Colors

The established hex palette is preserved. Most tokens are in `styles.css:1`; the focus/surface/status roles are in its continuation section.

| Token or source role | Value | Use |
| --- | --- | --- |
| `--paper` | `#f4f7f9` | Page background |
| `--surface` | `#fff` | Main surface and neutral controls |
| `--ink` | `#20303c` | Primary text, neutral button border |
| `--muted` | `#596975` | Secondary descriptions, labels, captions |
| `--ember` | `#bd3612` | Refresh action and notice edge |
| `--line` | `#d4dde3` | Structural separators/table rules |
| `--link` | `#245872` | Underlined navigation/source links |
| `--focus` | `#337f9d` | Three-pixel keyboard focus ring |
| `--status` | `#edf3f6` | Read-status and exact-data background |
| `--warning-bg` | `#fff4ee` | Historical-token notice background |
| `--error` | `#862d16` | Failed-read text, on `#fff0e8` |
| Warning heading | `#9a2c10` | Historical-token notice heading |
| Primary hover | `#962b0e` | Refresh button hover |
| Neutral hover | `#edf2f5` | Neutral button hover |
| Main boundary | `#e2e8ec` | Main panel outline |

Several original component declarations retain these literal values; new styles should reuse the matching semantic role. The orange notice always includes explicit warning text, so color alone carries no status. There is one filled primary action, refresh. This implementation has only a light theme. Forced colors uses the system `Highlight`, `CanvasText` and `ButtonText` colors.

Measured rendered pairs on the final export include primary text/white **13.55:1**, secondary text/white **5.67:1**, links/white **7.74:1**, refresh white/orange **5.68:1**, and warning heading/warning background **7.09:1**. Complete measurements and their browser state are in `artifacts/embeo/browser/results.json`; these are not a blanket accessibility certification.

## Typography

The font stack is `"Segoe UI", "Noto Sans TC", "Microsoft JhengHei", sans-serif`; code uses `Consolas, "Courier New", monospace`. Fonts come from the viewer's system, so glyphs and available weights can differ by platform. The implementation requests weights rather than supplying custom font files.

Body default is 16px with unitless line height 1.65. The main title is 44px/1.15, weight 720 and -1.8px letter spacing; at widths up to 720px it becomes 30px with -1px tracking, and at 420px it becomes 28px. The symbol shifts to its own line on narrow screens. Section headings are 23px/1.4, weight 650, with smaller identity, notice and record headings at 19px, 18px and 20px. The lead is 21px desktop / 18px mobile. Supporting text is mainly 13–14px, and the footer/header secondary label never goes below 12px.

Changing fee values use tabular numbers, 20px desktop / 16px mobile, with an explicit smaller unknown state. Addresses are selectable and wrap anywhere instead of being truncated. Paragraph measure is capped at 76ch, hero paragraphs at 66ch. Headings use balanced wrapping, paragraphs use pretty wrapping, and the exact atomic JSON uses wrapping monospace. No critical value is available only through hover.

## Layout

The header is at most 1080px wide; the main surface is at most 1008px with 48px/52px/36px top/inline/bottom padding on desktop. Within it, identity uses a `1.2fr 1fr` grid with 36px gap. The hero uses a 32px gap. Section spacing is typically 28–40px; details and grouped rows use 8–24px intervals. Reading and DOM order match.

At **720px**, the main surface has 12px outside margins and 28px/22px padding, identity/explanations become one column, source links stack, and the refresh button spans the content width. At **420px**, inline padding becomes 18px, identity terms/values stack, and the header can wrap. Shared flex/grid children have `min-width:0`. Logical inline margins/borders support structural mirroring.

The two-currency table preserves its cross-column relationships with a **540px minimum width** at the small breakpoint, inside a labelled, focusable horizontal scroll region. This is localized table scrolling, not page overflow; mobile copy signals it and ArrowRight was tested. Long addresses, hashes and exact JSON reflow. The final export was inspected at 1440, 768, 390 and 320 CSS pixels, with no document-wide overflow. Native browser zoom and physical-device behavior remain unverified; CSS enlargement/text-spacing stress were tested separately.

## Elevation & Depth

The surface system is deliberately flat. The main panel and disclosure use thin structural borders, the warning and read states use tonal backgrounds, and table rows use separators. There are no shadows, floating overlays, parallax, autoplay or staged entrances. Only the skip link uses a raised stacking level (`z-index:5`) while focused.

## Shapes

The main panel radius is 16px desktop / 12px mobile. Buttons are 7px, disclosure 8px and status/exact-data surfaces 6px. The notice uses a four-pixel leading edge rather than a decorative icon. The exact **64×64 owner PNG** is displayed without distortion or recoloring in both hero and favicon. Its SHA-256 is `771f691c330cf00a0a9038b0aac718fd519000872f3cfb0532113739fccac4b4`. The reference's larger image is retained in source for provenance but is excluded from the export.

## Components

These are native HTML/CSS patterns, not library exports:

- **Identity / `.identity` and `.address-line`:** full formal address, token facts and neutral copy button. Copy gives a polite status; clipboard denial selects the full address for manual copying.
- **Historical warning / `.test-notice`:** adjacent to formal identity; explicit MAINNET, DO NOT BUY, different token/membership status and no migration/compensation promises.
- **Primary action / `#refresh`:** orange, at least 44px high. It disables during reads, retains an explanatory label, and sets `aria-busy` on the fee region. Each endpoint is bounded; the app chooses one snapshot without merging providers. Failure preserves a dated prior snapshot with explicit failure copy.
- **Fee table / `.table-scroll`:** caption, scoped column/row headers, separate ETH/EMBEO rows, tabular numbers and textual unknown states. Account-scoped columns explicitly disclose cross-launch scope.
- **Evidence disclosure / `details`:** native Enter/Space operation, block/time/hash/source, simulation and owed status, exact integer values and current-snapshot download. The download is disabled until valid data exists. A separate link identifies the original saved JSON.
- **Status / `#read-status` and `#copy-status`:** stable polite live regions; information is never communicated by color alone. Errors explain retry behavior.
- **Navigation and focus:** first focusable skip link, real links for destinations, native buttons for actions, three-pixel `:focus-visible` rings. Table and exact-value regions are focusable for keyboard reading/scrolling. Forced-colors rings use system colors. No dialogs or focus traps are present.

## Do's and Don'ts

- Reuse this palette, native controls, wrap-safe address pattern and spaced single-surface hierarchy for compatible future informational content. Keep the normal DOM reading order.
- Preserve the exact owner logo and full formal/historical address distinction. Keep the warning near the formal identity.
- Preserve `null` as unknown, use integer math and keep each currency and accounting scope explicit. Show source/time next to derived data.
- Keep any future page within its separately approved public file allowlist. A source or documentation file is not automatically a hosted asset.
- Do not add wallet, transaction, membership or 3D flows to this page. Do not infer a dark theme, animation system or responsive app shell from this one-page design.

Design review followed the pinned Better Interface guide (Jakub Krehel, MIT, commit `267330e1adfc66a718fb65fa6918c1f06d0a689e`). Documentation structure is adapted from Paul Bakaus's Impeccable (Apache-2.0, commit `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8`). Attribution and licenses are retained under `docs/embeo/licenses/`. These guidelines do not imply an independent review occurred.

# Validation · STMfan / Sublunary (v2.2)

Real command output recorded on Windows 11 (`10.0.26200`), PowerShell 7.6.7, from
the repository root on branch `v2`, after the v2.2 copy, typography, official-art
and mobile-performance pass.

| Fact | Value |
| --- | --- |
| Node | `v26.8.1` |
| Bun | `1.4.0` |
| Vite | `8.3.4` |
| React / React DOM | `19.3.0` |
| TypeScript | `7.0.2` |
| three.js | `0.186.1` |
| `dist` | 251 files, 14.19 MB (ceiling 24.00 MB) |
| Client bundle | `index-*.js` 437,064 B |
| Moon chunk | `MoonCanvas-*.js` 535,614 B (lazy) |
| CSS | `style-*.css` 248,446 B (font faces dominate) |
| Prerendered markup | 32,367 characters injected into `#root` |
| Dependency audit | 45 packages (11 production, 34 build) |
| Site checks | 283 passed |

## 1. Commands, CI order

```
$ bun run typecheck          # tsc --noEmit, exit 0
$ bun run licenses           # 45 packages, exit 0
$ bun run build              # typecheck + vite build + prerender, exit 0
$ bun run check:site         # 283 checks, exit 0
```

The last build reported `injected 32,367 bytes of markup (36,790 bytes total)`.
Three.js remains a separate lazy chunk, so first paint does not wait for it.

## 2. What `check:site` verifies

- Metadata: title, description, canonical `https://stmfan.tech/`, `og:image`
  pointing at an existing `/assets/share/og.png`.
- Prerender: more than 2 KB of markup in `#root`, hashed module script and CSS
  link intact, no `/src/main.tsx` leftovers, and all section markers:
  `hero`, `workshop`, `opensource`, `commission`, `extras`, `notes`, `contact`,
  `contact-title`.
- Slogans `探月下，尘世万象` and `To Decipher` in `dist/index.html`.
- Zero U+2014 em dashes in the prerendered HTML.
- Every `/assets/...` reference in HTML and every CSS `url()` resolves.
- 27 runtime-referenced assets the HTML crawl cannot see: moon maps, five game
  tiles, five official portraits, five face crops, icons, the OG card, the MaiBot
  image and the playlist cover.
- `dist/_headers`, `robots.txt`, `sitemap.xml` copied byte-for-byte from `public/`.
- No source maps, total `dist` size within budget.

## 3. Copy and typography

- All visible copy was rewritten in both languages around what a visitor needs:
  who, what can be built, proof, price posture, contact. Requirement language
  ("four directions", "this is not important", "reserved", "case") was removed.
- The slogan stays `探月下，尘世万象。` / `To Decipher the Sublunary Sphere.`
- Minimum type sizes: 12px labels, 13px captions and links, 14.4px secondary
  body, 16-17px body, 30-43px section titles. The contact title is capped at
  59px and the hero remains the only oversized moment.
- Section titles were reduced from up to 80px to 30-43px; card and item titles
  use 19-30px. The mono labels that were under 10px were raised to 12px.

## 4. Layout and touch

- Filled panels were removed. Skills, open source, commissions, gallery and
  contact are separated by 1px rules and spacing; only media (case image, game
  tile, framed key art, playlist cover) keeps a 2px-radius frame.
- Hero fits without clipping at 1440×900, 1366×768, 1280×720 and 390×844. The
  measured hero bottom equals the viewport height at each size.
- `document.documentElement.scrollWidth` equals the viewport width at 390 and
  1440.
- Nav clicks land 12px below the fixed header via `scroll-padding-top` and the
  JS offset.
- Mobile: 190px moon below the copy, hidden readout, sticky gallery tabs,
  44px thumbnails and icon buttons, full-width contact CTA, safe-area bottom
  padding.
- Touch scrolling is native; `touch-action: pan-y` on the moon means a vertical
  swipe still scrolls the page.

## 5. Mobile performance

Measured with a mobile-emulated Chromium (390×844, DPR 2, touch), scrolling the
page in 70% viewport steps:

| Metric | Result |
| --- | --- |
| Long tasks during the full scroll | 0 |
| rAF sample at the hero | 60 fps |
| Canvas elements | 2 (starfield + one moon) |
| Moon canvases created | 1 |
| DOM mutations during the scroll | 10 |
| Horizontal overflow | none |

The fixes: no backdrop-filter on touch, grain/atmosphere/flow layers hidden on
touch, starfield at 30fps with 120 stars and DPR ≤1.25, moon at 30fps with
DPR ≤1.4 and no bump map, preloader counter written to refs instead of state,
and the clock isolated in its own readout component.

## 6. Official character artwork

All five portraits are official art. Wriothesley, Varka and Von Lycaon use
transparent official portraits from the official galleries; Vyron and Gizmo are
Delta Force operators whose official key art is presented in a 3:4 frame because
no transparent render is published. Each has a 160px face crop. Provenance and
the compromise are recorded in `docs/ASSETS.md` and `sources.json`.

## 7. Avatar

The visible logo calls the GitHub API for `STMfan` on mount, preloads the returned
`avatar_url`, then swaps it in, so there is no blank flash. It caches the URL for
12 hours and falls back to `https://github.com/STMfan.png?size=240`. The favicon
and Apple touch icon also point at the GitHub avatar endpoint; no hand-cropped
local avatar is rendered. The local `avatar.png` is now only a build input for
the icon set and the OG card; `logo.png` was removed.

## 8. Reproducibility

- `docs/licenses/` and `dependency-licenses.json` are deterministic.
- The only non-deterministic prerendered values are the current moon phase, the
  clock and the shade opacity. The client replaces them on boot; `createRoot` is
  used instead of hydration, so there is no mismatch.
- `assets-src/` remains gitignored; the committed `public/assets/` derivatives
  are what the build uses. `bun run assets` regenerates them from cached sources.

## 9. CI

`.github/workflows/build.yml` runs on `main`, `v2`, pull requests and manual
dispatch: frozen `bun install`, license audit, `build:pages`, `check:site`, then
uploads `cloudflare-pages-dist`. The local run above uses the same sequence.

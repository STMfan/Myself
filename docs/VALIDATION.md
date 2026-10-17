# Validation · STMfan / Sublunary (v2.3)

Recorded on Windows 11 (`10.0.26200`), PowerShell 7.6.7, from the repository root
on branch `v2`, after the v2.3 hero, gallery, copy and mobile-performance pass.

| Fact | Value |
| --- | --- |
| Node | `v26.8.1` |
| Bun | `1.4.0` |
| Vite | `8.3.4` |
| React / React DOM | `19.3.0` |
| TypeScript | `7.0.2` |
| three.js | `0.186.1` |
| `dist` | 250 files, 14.16 MB (ceiling 24.00 MB) |
| Client bundle | `index-*.js` 432,111 B |
| Moon chunk | `MoonCanvas-*.js` 535,602 B (lazy) |
| CSS | `style-*.css` 249,093 B (font faces dominate) |
| Prerendered markup | 35,925 characters injected into `#root` |
| Dependency audit | 45 packages (11 production, 34 build) |
| Site checks | 290 passed |
| First contentful paint | 888 ms on a 390×844 mobile profile |
| Page height | 5,173 px desktop, 5,698 px mobile |

## 1. Commands, CI order

```
$ bun run typecheck          # tsc --noEmit, exit 0
$ bun run licenses           # 45 packages, exit 0
$ bun run build              # typecheck + vite build + prerender, exit 0
$ bun run check:site         # 290 checks, exit 0
```

Last build: `injected 35,925 bytes of markup (40,378 bytes total)`. Three.js is
still a separate lazy chunk, and it is imported 350 ms after mount so the first
paint does not wait for WebGL.

## 2. What `check:site` verifies

- Metadata, canonical URL, `og:image`, favicon and the GitHub avatar preconnects.
- Prerender: markup in `#root`, hashed module and CSS links, no `/src/main.tsx`
  leftovers, and the eight section markers (`hero`, `workshop`, `opensource`,
  `commission`, `extras`, `notes`, `contact`, `contact-title`).
- Slogans `探月下，尘世万象` and `To Decipher` in `dist/index.html`.
- Zero U+2014 em dashes in the prerendered HTML.
- Every `/assets/...` reference in HTML and every CSS `url()` resolves.
- 27 runtime assets the HTML crawl cannot see: moon maps, five game tiles, five
  official portraits, five face crops, icons, OG card, MaiBot image, playlist cover.
- `_headers`, `robots.txt`, `sitemap.xml`, no source maps, dist size budget.

## 3. Preloader and mobile open

The preloader was removed entirely. It was the only thing that could leave a
phone on `000` when its React effect did not start; the prerendered page now paints
directly into the hero. Measured on a mobile profile:

| Metric | Result |
| --- | --- |
| First paint | 716 ms |
| First contentful paint | 888 ms |
| Preloader nodes | 0 |
| Hero title colour | `rgb(238, 241, 247)`, visible at y=306 |

The hero animation begins on mount instead of waiting for a boot callback.

## 4. Layout

- The hero is exactly `100svh` at 1440×900, 1366×768, 1280×720 and 390×844; no CTA
  is clipped and the page does not overflow horizontally at 390 or 1440.
- Desktop acts: hero 900, skills 715, open source 668, commissions 653, gallery 818,
  notes 594, contact 589, footer 236.
- Mobile acts: hero 844, skills 616, open source 759, commissions 974, gallery 996,
  notes 523, contact 680, footer 306.
- The page is roughly 950 px shorter than v2.1 on desktop. The longest mobile acts
  are the gallery (996) and commissions (974); the rest are 523-759.
- The hero is a single asymmetric composition: a 68vw moon sits behind the title,
  the first line is solid, the second outlined so the moon shows through, and a
  giant `SUBLUNARY` wordmark parallaxes behind the copy.
- Gallery: exactly three cards. Games is a five-row list with every game visible at
  once. Characters auto-rotate every 2.5s and pause on hover, focus or a face
  selection. Playlist is a wide band with cover, track note and link.
- Cards are compact glass surfaces with real content; no full-screen card with a
  single sentence, no meaningless pills or counts.

## 5. Copy

- Every string was rewritten for a visitor: who, what can be built, proof, price
  posture, contact.
- Paid work is the default. Open source is no longer described as free everywhere:
  `免费` is conditional on interest in both languages, and the same nuance is in
  the meta description and the commission lede.
- Slogan unchanged: `探月下，尘世万象。` / `To Decipher the Sublunary Sphere.`
- Minimum label 12px, captions 13px, body 16-17px, section titles 27-39px; the hero
  is the only oversized moment.

## 6. Performance

Mobile-emulated Chromium, 390×844, DPR 2, touch, scrolling in 75% viewport steps:

| Metric | Result |
| --- | --- |
| Long tasks during the full scroll | 0 |
| rAF sample | 60 fps |
| Canvas elements | 2 (starfield + one moon) |
| DOM mutations during the scroll | 10 |
| Horizontal overflow | none |

Fixes: starfield and moon both capped at 30fps and DPR 1.5; no bump map; moon
import deferred 350ms; no `backdrop-filter` on touch; grain, atmosphere and flow
lines hidden on touch; the clock readout is not mounted in the hero; the preloader
is gone. The moon and stage pause offscreen or when the tab is hidden.

## 7. Character art

All five are official artwork. Wriothesley, Varka and Von Lycaon are official
transparent renders. Vyron and Gizmo use official Delta Force key art whose
photographic background was removed locally with rembg (u2net), then alpha-trimmed
and cropped to a half-body portrait. Face crops are 160px. The carousel pauses on
manual selection, so the 2.5s rotation does not fight the visitor. Provenance is in
`docs/ASSETS.md` and `sources.json`.

## 8. Avatar

The visible logo calls `api.github.com/users/STMfan`, preloads the returned
`avatar_url`, then swaps it in. It caches for 12 hours. If the API is rate-limited,
the full local `avatar.png` is used; no hand-cropped face is rendered. The favicon
and Apple touch icon point at the GitHub avatar endpoint. The API returned 403 in
the test environment (rate limit), and the local fallback rendered correctly.

## 9. Reproducibility

- `docs/licenses/` and `dependency-licenses.json` are deterministic.
- Moon phase, clock and shade are the only non-deterministic prerendered values;
  the client replaces them and `createRoot` avoids hydration mismatch.
- `assets-src/` is gitignored. `bun run assets` rebuilds the generated plates and
  the official portraits; the two Delta cutouts were produced with the documented
  rembg step and are committed derivatives.
- `public/assets/avatar.png` is a build input for the icon set and OG card; the
  page itself renders the API avatar.

## 10. CI

`.github/workflows/build.yml` runs on `main`, `v2`, PRs and manual dispatch: frozen
`bun install`, license audit, `build:pages`, `check:site`, upload the Pages
artifact. The local run above follows the same order.

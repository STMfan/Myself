# Validation · STMfan / Sublunary (v2.1)

Real command output recorded on Windows 11 (`10.0.26200`), PowerShell 7.6.7, from
the repository root on branch `v2`, after the v2.1 restructure.

| Fact | Value |
| --- | --- |
| Node | `v26.8.1` |
| Bun | `1.4.0` |
| Vite | `8.3.4` |
| React / React DOM | `19.3.0` |
| TypeScript | `7.0.2` |
| three.js | `0.186.1` |
| `dist` | 248 files, 14.10 MB (ceiling 24.00 MB) |
| Client bundle | `index-*.js` 439,951 B (about 130 KB gzip) |
| Moon chunk | `MoonCanvas-*.js` 535,455 B (about 134 KB gzip, lazy) |
| CSS | `style-*.css` 253,614 B (font faces dominate) |
| Prerendered markup | 34,243 characters injected into `#root` |
| Dependency audit | 45 packages (11 production, 34 build) |
| Site checks | 282 passed |

## 1. Commands, CI order

### `bun run typecheck`

```
$ tsc --noEmit
```

Exit `0`, no diagnostics.

### `bun run licenses`

```
[licenses] ok  45 packages (11 production, 34 build)  45 license/notice files -> docs/licenses/  docs/dependency-licenses.json  public/assets/PROJECT_LICENSE.txt  public/assets/THIRD_PARTY_NOTICES.txt
```

Exit `0`. It now includes three.js and its transitive typings, and no longer
includes Lenis.

### `bun run build`

```
✓ built in ~0.5 s
[prerender] building SSR bundle -> .ssr/
[prerender] injected 34,243 bytes of markup (38,591 bytes total)
[prerender] ok -> dist\index.html
```

Exit `0`. Three.js is dynamically imported by `MoonPanel`, so it lands in a
separate `MoonCanvas-*.js` chunk and is absent from the initial bundle. Vite warns
that this one chunk exceeds 500 KB; that is the expected cost of a real moon.

### `bun run check:site`

```
[check:site] ok  dist size: 14.10 MB (ceiling 24.00 MB)  |  282 checks passed
```

Exit `0`.

## 2. What `check:site` verifies

- Metadata: title, description, canonical `https://stmfan.tech/`, `og:image`
  pointing at an existing `/assets/share/og.png`.
- Prerender: more than 2 KB of markup in `#root`, hashed module script and CSS
  link intact, no `/src/main.tsx` leftovers, and all section markers:
  `hero`, `workshop`, `opensource`, `commission`, `extras`, `notes`, `contact`,
  `contact-title`.
- Slogans `探月下，尘世万象` and `To Decipher` in `dist/index.html`.
- Zero U+2014 em dashes in the prerendered HTML.
- Every `/assets/...` reference in the HTML and every CSS `url()` resolves.
- 23 runtime-referenced assets that the HTML crawl cannot see, including
  `moon-map.webp`, `moon-map-1k.webp`, all five game tiles, all five character
  cutouts, the icon set and the OG card.
- `dist/_headers`, `robots.txt`, `sitemap.xml` copied byte-for-byte from `public/`.
- No source maps, total `dist` size within budget.

## 3. Prerender markers and client takeover

`scripts/prerender.mjs` SSR-builds `src/entry-server.tsx`, renders the zh page and
injects it into `<div id="root">`. It asserts the client module script and the
hashed stylesheet survive, and that all eight section markers are present. The
client uses `createRoot`, not `hydrateRoot`, so the live clock, moon phase and the
3D canvas cannot produce hydration mismatches; they replace the static markup on
boot.

## 4. Scrolling and layout checks

- No Lenis and no GSAP `pin`. Wheel and touch scrolling are native.
- `scroll-padding-top` plus JS navigation offset the fixed nav: a nav click lands
  the section top 12px below the nav rather than under it.
- Hero fit measured at 1440×900 (hero bottom 900, CTA bottom 691), 1366×768
  (hero 768) and 1280×720 (hero 720, CTA 573) with no clipped CTA.
- `document.documentElement.scrollWidth` equals the viewport width on 390px and
  1440px viewports; body uses `overflow-x: clip`.
- Mobile hero is taller than 100svh because the 3D moon medallion is part of it;
  it scrolls normally and no element is hidden behind the browser chrome.
- Reduced motion was emulated: `data-motion="calm"`, no preloader, no GSAP
  timelines, ambient animations disabled and all content visible.

## 5. Interaction checks

- Copy email / QQ / UID / Minecraft ID writes to the clipboard and shows the
  "已复制 / Copied" toast.
- The gallery auto-rotates after 6 s (observed 莱欧斯利 to 法尔伽), pauses on
  hover/focus/offscreen, and its progress line restarts when the state changes.
- Theme switching applies the light palette to the whole page and the 3D moon
  relights through a `MutationObserver`.
- Language switching updates nav, sections, gallery, readout, title and meta.

## 6. Reproducibility caveats

- `docs/licenses/` and its JSON are deterministic and idempotent.
- The only non-deterministic prerendered values come from application state:
  the current moon phase, the clock and the shade opacity. They are replaced by
  the live client immediately on boot.
- `assets-src/` is gitignored (generated originals plus downloaded sources). The
  committed derivatives in `public/assets/` are what the build uses; `bun run
  assets` can regenerate them from `assets-src/` and cached sources.

## 7. CI

`.github/workflows/build.yml` runs on pushes to `main` and `v2`, pull requests and
manual dispatch: `bun install --frozen-lockfile`, `bun run licenses`,
`bun run build:pages`, `bun run check:site`, then uploads `cloudflare-pages-dist`.
The workflow was green on the previous v2 commits; the local CI-order run above is
the same command sequence.

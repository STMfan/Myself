# Validation · STMfan / Sublunary (v2)

Real command output for the v2 build pipeline, recorded on Windows 11
(`10.0.26200`), PowerShell 7.6.7, from the repository root on branch `v2`
(orphan branch, worktree not yet committed).

| Fact | Value |
| --- | --- |
| Node | `v26.8.1` |
| Bun | `1.4.0` |
| Vite | `8.3.4` |
| React / React DOM | `19.3.0` |
| TypeScript | `7.0.2` |
| `dist` | 236 files, 12.30 MB (ceiling 24.00 MB) |
| Prerendered markup | 39,349 characters injected into `#root` |
| Dependency audit | 38 packages (11 production, 27 build), 38 license texts copied |

## 1. Commands and results

Run in CI order, exactly as `.github/workflows/build.yml` and
`docs/DEPLOYMENT.md` execute them.

### `bun run typecheck`

```
$ tsc --noEmit
```

Exit code `0`. No diagnostics.

### `bun run licenses`

```
$ node scripts/audit-licenses.mjs
[licenses] ok  38 packages (11 production, 27 build)  38 license/notice files -> docs/licenses/  docs/dependency-licenses.json  public/assets/PROJECT_LICENSE.txt  public/assets/THIRD_PARTY_NOTICES.txt
```

Exit code `0`. Outputs:

- `docs/dependency-licenses.json`, deterministic: no timestamps, packages sorted by
  name and version, one entry per installed package with `scope`, `license`,
  `licenseSource` and `licenseFiles`.
- `docs/licenses/`, 38 files named `<name>@<version>__<LICENSE|NOTICE|COPYING>`;
  scoped packages use `+` instead of the path separator, for example
  `docs/licenses/@fontsource-variable+noto-sans-sc@5.3.1__LICENSE`.
- `public/assets/PROJECT_LICENSE.txt`, byte copy of `LICENSE` (1,063 bytes).
- `public/assets/THIRD_PARTY_NOTICES.txt`, `NOTICE` plus the generated inventory
  (4,165 bytes; production and build sections, each line
  `name version license`).

### `bun run build`

```
$ tsc --noEmit && vite build && node scripts/prerender.mjs
dist/assets/style-Teem7YdB.css   247.49 kB │ gzip:  82.67 kB
dist/assets/index-Bp2XDLAn.js    443.99 kB │ gzip: 144.40 kB
✓ built in 515ms
[prerender] building SSR bundle -> .ssr/
[prerender] injected 39,349 bytes of markup (43,623 bytes total)
[prerender] ok -> dist\index.html
```

Exit code `0`. The reported size is JavaScript string length (43,623 characters);
`dist/index.html` is 46,040 bytes on disk because CJK characters are three bytes
in UTF-8.

Post-build spot checks on `dist/index.html`:

| Check | Result |
| --- | --- |
| `<div id="root">` contains prerendered markup | yes, 39,349 characters |
| `探月下，尘世万象` present | yes |
| `To Decipher the Sublunary Sphere.` present | yes |
| `id="hero"`…`id="contact-title"` present | all 9 markers |
| `<script type="module" crossorigin src="/assets/index-Bp2XDLAn.js">` intact | yes |
| `<link rel="stylesheet" crossorigin href="/assets/style-Teem7YdB.css">` intact | yes |
| U+2014 em dashes | 0 |
| `/src/main.tsx` references left | 0 |

### `bun run check:site`

```
$ node scripts/check-site.mjs
[check:site] ok  dist size: 12.30 MB (ceiling 24.00 MB)  |  257 checks passed
```

Exit code `0`.

## 2. What `check:site` actually verifies (257 checks)

- Metadata: non-empty `<title>` mentioning STMfan, `meta[name=description]`
  (>= 40 characters), `link[rel=canonical]` equal to `https://stmfan.tech/`,
  `meta[property=og:image]` equal to `/assets/share/og.png` or
  `https://stmfan.tech/assets/share/og.png`, and the OG image file existing in
  `dist`.
- Prerender: `#root` markup larger than 2,000 characters, all nine markers
  (`hero`, `manifesto`, `workshop`, `commission`, `maibot`, `games`, `characters`,
  `contact`, `contact-title`), a hashed `/assets/*.js` module script, a hashed
  `/assets/*.css` stylesheet, and no leftover `/src/main.tsx`.
- Slogans: `探月下，尘世万象` and `To Decipher` in `dist/index.html`.
- Zero U+2014 em dashes in `dist/index.html`.
- Asset resolution: every local `/assets/...` reference in the HTML (including
  the absolute `https://stmfan.tech/assets/...` forms in the social tags) and
  every `url(...)` in every `dist` CSS file resolves to a real file, so all 10
  art files, the avatar, the MaiBot art, the playlist cover, the OG card, the
  favicon, the hashed bundles and every other file in dist are covered.
- Static passthrough: `dist/_headers`, `dist/robots.txt`, `dist/sitemap.xml`
  exist and are byte-identical to `public/`.
- No source maps: no `*.map` files anywhere in `dist`, and no
  `sourceMappingURL` comment in HTML, CSS or JS.
- Size ceiling: total `dist` bytes <= 24 MB. Actual: 12.30 MB.

The checker aggregates every failure and exits `1` with a list. During the
build it caught 13 real problems before the art landed: the ten `public/assets`
files (`art/*.webp` x7, `avatar.png`, `maibot.webp`, `playlist-cover.webp`,
`share/og.png`) plus the CSS `url()` for `art/atmosphere-haze.webp`. All cleared
once the asset pipeline delivered; no placeholder art was added by this
pipeline.

## 3. Prerender behaviour

`scripts/prerender.mjs`:

1. SSR-builds `src/entry-server.tsx` through the Vite JS API into `.ssr/`
   (`emptyOutDir: true`, `copyPublicDir: false`, es module output).
2. Loads the bundle with `NODE_ENV=production` and calls `render()`.
3. Replaces exactly `<div id="root"></div>` with the returned markup, leaving
   the client module script, the hashed CSS link, the JSON-LD block, the inline
   theme bootstrap and the `noscript` fallback untouched. It asserts that the
   module-script and stylesheet counts do not change.
4. Fails loudly (exit `1`) if `dist/index.html` is missing, if the root marker is
   gone, if the host tags are missing, if `render()` throws or returns nothing,
   or if the required zh markers are absent from the result.

Guard tests performed:

| Scenario | Result |
| --- | --- |
| Run against an unbuilt `dist/` | `[prerender] FAILED: dist/index.html not found.` exit 1 |
| Run twice against the same `dist/` | `[prerender] FAILED: dist/index.html already contains prerendered markup inside #root.` exit 1 |
| React `useLayoutEffect` server warning | filtered; every other stderr message is passed through |

The client calls `createRoot`, not `hydrateRoot`, so the prerendered DOM is
replaced on boot by design. There is no hydration contract to keep, which is why
build-time values in the markup (see below) are acceptable.

## 4. Reproducibility

`bun run licenses` was executed twice in a row. SHA-256 of
`docs/dependency-licenses.json`, `public/assets/PROJECT_LICENSE.txt` and
`public/assets/THIRD_PARTY_NOTICES.txt` were identical before and after, and
`docs/licenses/` is rebuilt from scratch each run. The step is idempotent.

`scripts/prerender.mjs` contains no timestamps, no random ids and no
environment-dependent branching; given the same source tree it produces the same
structure and byte count. One deliberate exception lives in the application, not
in the script: `src/components/Orrery.tsx` renders the current moon phase and the
current clock. Two consecutive builds from an unchanged tree differ only in those
values, for example the shaded limb style:

```
run 1: <span class="orrery__shade" style="opacity:0.5116245202709266">
run 2: <span class="orrery__shade" style="opacity:0.5116194809241836">
```

Everything else in the two `dist/index.html` files was identical. Because the
client uses `createRoot`, the live clock takes over immediately after boot; a
no-JS reader sees the time at build. This is the only non-deterministic content
in `dist`, and it comes from app state, not from the pipeline. It is documented
here rather than frozen, because baking a fake clock would make the static page
lie.

## 5. License audit details

- Production closure: `dependencies` + `optionalDependencies`; build closure:
  `devDependencies`. Every entry carries `scope`, so the JSON states exactly what
  ships. `docs/licenses/` holds the shipped texts.
- `gsap@3.15.0` declares a non-SPDX vendor string
  (`Standard 'no charge' license: https://gsap.com/standard-license.`) in
  `package.json` and ships no license file. The string is recorded verbatim, no
  license text exists to copy, and the package is flagged in the JSON by
  `licenseSource: "package.json"` with an empty `licenseFiles` array.
- Font packages resolve to `OFL-1.1` and their OFL text is copied.
  `@img/sharp-win32-x64` declares `Apache-2.0 AND LGPL-3.0-or-later`,
  `typescript`, `detect-libc` and `sharp` declare `Apache-2.0`,
  `lightningcss*` declares `MPL-2.0`, the rest are MIT, ISC or BSD-3-Clause.
- The script exits `1` if a production package has neither a declared license nor
  a license text, or if a declared non-optional dependency is missing from
  `node_modules`. It warns (exit `0`) for build-only packages without a license
  field, after still copying whatever text they ship.

## 6. Iterations during this build

| Step | Result |
| --- | --- |
| First `bun run build` after `src/` reached a consistent state | exit 0, prerender injected 38,963 bytes |
| `bun run check:site` before the art landed | exit 1, 13 missing-asset failures only |
| Art and OG card delivered by the asset pipeline | all assets resolved |
| Final CI-order run (`typecheck`, `licenses`, `build`, `check:site`) | exit 0, exit 0, exit 0, exit 0 |

## 7. Not changed

- `.github/workflows/build.yml` already matched the v1 standard (Bun 1.4.0,
  `bun install --frozen-lockfile`, `bun run licenses`, `bun run build:pages`,
  `bun run check:site`, artifact `cloudflare-pages-dist`, retention 7 days,
  triggers `main`/`v2`/pull requests/dispatch, `contents: read`). It was left
  untouched.
- No file outside the pipeline write scope was modified: no `src/**`, no
  `public/assets` art, no `public/_headers`, no `index.html`, no `README.md`.

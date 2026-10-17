# Validation · STMfan / Sublunary (v2.4)

Recorded on Windows 11 (`10.0.26200`), PowerShell 7.6.7, from the repository root
on branch `v2`, after the v2.4 hero decoration, full-bleed character card, light
theme, preloader and background pass.

| Fact | Value |
| --- | --- |
| Node | `v26.8.1` |
| Bun | `1.4.0` |
| Vite | `8.3.4` |
| React / React DOM | `19.3.0` |
| TypeScript | `7.0.2` |
| three.js | `0.186.1` |
| `dist` | 247 files, 13.88 MB (ceiling 24.00 MB) |
| Client bundle | `index-*.js` 434,390 B |
| Moon chunk | `MoonCanvas-*.js` 535,643 B (lazy) |
| CSS | `style-*.css` 254,117 B (font faces dominate) |
| Prerendered markup | 36,512 characters injected into `#root` |
| Dependency audit | 45 packages (11 production, 34 build) |
| Site checks | 284 passed |
| Page height | 5,228 px desktop, 5,791 px mobile |

## 1. Commands, CI order

```
$ bun run typecheck          # tsc --noEmit, exit 0
$ bun run licenses           # 45 packages, exit 0
$ bun run build              # typecheck + vite build + prerender, exit 0
$ bun run check:site         # 284 checks, exit 0
```

Last build: `injected 36,512 bytes of markup (40,965 bytes total)`. The moon chunk
is still deferred 350ms, so WebGL never blocks first paint.

## 2. Preloader

The preloader is back, but it is a short reveal, not a boot gate:

- 620ms minimum, `document.fonts.ready` with a 1.8s ceiling, then a 430ms fade.
- No numeric counter, so a stalled font/network cannot leave `000` on screen.
- CSS failsafe: `preloader-failsafe 2.8s` hides the overlay even if the client
  bundle never mounts; the page under it is prerendered.
- `performance.now() > 2400` on mount skips the preloader entirely, so a late
  bundle cannot show it a second time after the static page is already visible.
- Normal mobile run: overlay present at 350ms, removed by 2.1s.
- JS-disabled run against `dist`: overlay computed `visibility: hidden` after 4.2s,
  hero markup present, no interaction blocked.

## 3. Layout

- Hero is exactly `100svh` at 1440×900, 1366×768, 1280×720 and 390×844.
- Desktop acts: hero 900, skills 715, open source 668, commissions 677, gallery 850,
  notes 594, contact 589, footer 236.
- Mobile acts: hero 844, skills 616, open source 759, commissions 998, gallery 1,064,
  notes 523, contact 680, footer 306.
- Gallery: three cards, exactly. Games spans 6 columns and lists all five games;
  characters spans 6 columns and is 440px tall; playlist spans 12. Both top cards use
  the same height and header rhythm. Mobile stacks them, with the cast card 380px.
- Character card: full-bleed `object-fit: cover`, anchored to the top, bottom mask
  into the card; header, name, face rail and 2.5s timer sit on the art with scrims.
- Title: first line solid, second line solid amber, thin amber rule and dot below.
  No hollow glyphs.
- Full stack copy says Vibe Coding, not hand-written.
- Open source free help is conditional on interest.

## 4. Light mode

- Cards use `#fbfcfe` with a cool border and shadow instead of translucent glass.
- The moon rim is cool silver, not amber, and the light stage glow is reduced.
- Grain is grayscale and reduced; atmosphere and aurora are much quieter.
- Notes keeps more of its photo with a lighter scrim.
- Cursor aura is disabled in light mode.

## 5. Background

- Fixed starfield plus drifting atmosphere plates.
- Slow aurora, three large orbital rings and occasional meteor streaks.
- Cursor aura behind content on desktop dark mode only.
- Hero meteors and ghost word parallax.
- Everything is behind page content; touch, calm and reduced-motion remove the
  expensive layers.

## 6. Character art

Three official transparent HoYoverse portraits remain: Wriothesley, Varka, Von
Lycaon. The two Delta Force key-art cutouts were removed; there is no generated
character art anywhere in `public/assets/cast`. Face crops are 160px. The carousel
advances every 2.5s and pauses on hover, focus or manual selection.

## 7. Performance

Mobile-emulated Chromium, 390×844, DPR 2, touch, scrolling the full page in 75%
viewport steps:

| Metric | Result |
| --- | --- |
| Long tasks during the full scroll | 0 |
| rAF sample | 60 fps |
| Canvas elements | 2 (starfield + one moon) |
| Horizontal overflow | none |
| Preloader nodes after boot | 0 |

Starfield and moon run at 30fps with DPR ≤1.5; no bump map; no backdrop-filter on
touch; grain, atmosphere, aurora, orbits and flow lines hidden on touch.

## 8. Avatar

The logo calls `api.github.com/users/STMfan`, preloads `avatar_url`, then swaps it
in, with a 12 hour cache. If the API is rate-limited, the full local `avatar.png`
is used. No hand-cropped face is rendered. Favicon and Apple touch icon point at
the GitHub avatar endpoint. The test environment returned 403 and the local
fallback rendered correctly.

## 9. Assets and reproducibility

- `docs/ASSETS.md` and `sources.json` describe only the three remaining portraits.
- `CAST` in `scripts/build-assets.mjs` no longer contains the Delta entries; a
  regenerated asset run produces 25 outputs.
- `docs/licenses/` and `dependency-licenses.json` are deterministic.
- Moon phase, clock and shade are the only non-deterministic prerendered values;
  `createRoot` avoids hydration mismatch.

## 10. CI

`.github/workflows/build.yml` runs on `main`, `v2`, PRs and manual dispatch: frozen
`bun install`, license audit, `build:pages`, `check:site`, upload the Pages
artifact. The local run above follows the same order.

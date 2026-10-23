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
| `dist` | 251 files, 14.24 MB (ceiling 24.00 MB) |
| Client bundle | `index-*.js` 437,121 B |
| Moon chunk | `MoonCanvas-*.js` 536,370 B (lazy) |
| CSS | `style-*.css` 257,314 B (font faces dominate) |
| Prerendered markup | 38,877 characters injected into `#root` |
| Dependency audit | 45 packages (11 production, 34 build) |
| Site checks | 291 passed |
| Page height | 5,056 px desktop, 5,596 px mobile |

## 1. Commands, CI order

```
$ bun run typecheck          # tsc --noEmit, exit 0
$ bun run licenses           # 45 packages, exit 0
$ bun run build              # typecheck + vite build + prerender, exit 0
$ bun run check:site         # 291 checks, exit 0
```

Last build: `injected 38,877 bytes of markup (43,330 bytes total)`. The moon chunk
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
- Desktop acts: hero 900, skills 715, open source 495, commissions 677, gallery 850,
  notes 594, contact 589, footer 236.
- Mobile acts: hero 844, skills 616, open source 564, commissions 998, gallery 1,064,
  notes 523, contact 680, footer 306.
- Open source: two compact cases side by side, Synaxis first and MaiBot second. The
  three placeholder slots are gone; each case has a 4:5 thumbnail, label, one-line
  body and link. Section height dropped from 668 to 495 desktop, 759 to 564 mobile.
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

- Static CSS sky, starfield and floor grid replace the two full-screen atmosphere
  plates and the per-frame canvas gradients.
- One slow aurora, two orbital rings and occasional meteor streaks. The guided
  flow paths are static, so nothing repaints a full-viewport stroke every frame.
- Cursor aura behind content on desktop dark mode only.
- Hero meteors and ghost word parallax.
- Everything is behind page content; touch removes aurora, orbits and flow; calm
  and reduced-motion stop the remaining drifts.

## 6. Character art

Five official portraits are present: Wriothesley, Varka and Von Lycaon as official
transparent renders, plus Vyron and Gizmo from two official Delta Force
promotional posters (different from the earlier key art), background-removed
locally with rembg. There is no generated character art. Face crops are 160px. The carousel
advances every 2.5s and pauses on hover, focus or manual selection.

## 7. Performance

Current v2.8 rendering split:

- The sky, starfield dots and floor grid are **static CSS/SVG**, painted once.
  The canvas only clears and draws twinkling stars, motes and meteors.
- Ambient canvas is fixed at **30fps**; a 3-second idle sample recorded exactly
  90 pixel clears, i.e. 30 draws/s. The previous loop ran at native rAF.
- The moon renders at **30fps** while idle and **60fps** while dragging; it pauses
  during active scrolling and keeps the 1.05M px allocation ceiling.
- Removed: two full-screen atmosphere plates with blend/transform, one of three
  orbit rings, the animated full-viewport SVG flow (now static), the animated
  grain, and the always-running cursor rAF (now event-driven and stops when
  settled).
- Kept: one aurora, two orbit rings, the moon, hero meteors, card motion and the
  preloader. Pixel ceilings remain background 800k px and moon 1.05M px.

The v2.7 headless comparison below is historical and software-rendered; it is
useful only as direction, not a current FPS claim:

| View | Before avg / p95 frame | After avg / p95 frame |
| --- | --- | --- |
| 1440x900 desktop | 16.6 fps / 66.8 ms | 24.1 fps / 50.1 ms |
| 844x390 phone landscape | 34.5 fps / 33.4 ms | 39.9 fps / 33.4 ms |
| 390x844 phone portrait | 47.6 fps / 33.4 ms | 54.0 fps / 33.4 ms |

A real-device GPU trace is still the right next step if stutter remains; the
sandbox Chrome CDP prompt is blocked. On touch, aurora, orbits and static flow
are hidden; the static sky, starfield and floor remain.

## 8. Avatar

The logo calls `api.github.com/users/STMfan`, preloads `avatar_url`, then swaps it
in, with a 12 hour cache. If the API is rate-limited, the full local `avatar.png`
is used. No hand-cropped face is rendered. Favicon and Apple touch icon point at
the GitHub avatar endpoint. The test environment returned 403 and the local
fallback rendered correctly.

## 9. Assets and reproducibility

- `docs/ASSETS.md` and `sources.json` describe all five portraits, including the two Delta Force posters.
- `CAST` in `scripts/build-assets.mjs` no longer contains the Delta entries; a
  regenerated asset run produces 25 outputs.
- `docs/licenses/` and `dependency-licenses.json` are deterministic.
- Moon phase, clock and shade are the only non-deterministic prerendered values;
  `createRoot` avoids hydration mismatch.

## 10. CI

`.github/workflows/build.yml` runs on `main`, `v2`, PRs and manual dispatch: frozen
`bun install`, license audit, `build:pages`, `check:site`, upload the Pages
artifact. The local run above follows the same order.

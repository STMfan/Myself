# Design notes: Sublunary (v2.2)

A one-page personal site built as a single continuous shot. The visitor meets the
person, the skills, the proof and the paid offer before the decorative material.
The page is conversational, not a restatement of a brief: it answers "who is this,
can they build my thing, are they available, how do I reach them".

## 1. Design read and dials

- Read as: personal homepage and commission surface for a developer, for visitors
  who appreciate craft, with an editorial-celestial language.
- `DESIGN_VARIANCE: 8`, `MOTION_INTENSITY: 8`, `VISUAL_DENSITY: 4`.
- No component framework. A token layer plus five hand-written stylesheets so the
  text choreography and the WebGL moon share one palette.

## 2. Visual system

### Palette

One accent, locked for the whole page: lunar amber (`#f2a24b` dark, `#b4550d` light).
Neutrals are cold silver-blue. Theme switching re-themes the entire page through the
View Transitions API, expanding a circle from the pressed control, with an instant
swap for browsers without the API.

### Type scale

| Token | Range | Use |
| --- | --- | --- |
| `--fs-2xs` | 12px | labels, metadata, footer |
| `--fs-xs` | 13px | links, captions, pricing |
| `--fs-sm` | 14.4px | secondary body, item copy |
| `--fs-base` | 16-17px | body |
| `--fs-lg` | 17-19px | section lede |
| `--fs-xl` | 19-23px | card titles, CTA line |
| `--fs-2xl` | 23-30px | case titles, paid/free headings |
| `--fs-3xl` | 30-43px | section titles, game/character names |
| `--fs-4xl` | 35-59px | contact title |
| `--fs-hero` | 45-109px | hero slogan (zh) |

Body copy never drops below 14px; labels never below 12px. Section titles are capped
at `--fs-3xl` so the hero stays the only oversized moment, and the contact title is
deliberately smaller than it was in v2.0. Latin display is Bricolage Grotesque, CJK
display is Noto Serif SC, body is Instrument Sans plus Noto Sans SC, labels are
JetBrains Mono. Latin and CJK share one family stack so mixed strings fall through
per glyph.

### Surface

Two radii: `2px` for media frames and the framed key art, full pill for controls.
No filled panels: sections are separated by 1px hairlines and space. The commission
columns share a top rule and a vertical divider; the gallery is tabs, stage and
thumbnails with no enclosing card; the contact block is a channel grid between two
rules. This removes the "giant black card" rhythm of the earlier version.

## 3. The acts

| Act | What the visitor gets | Motion |
| --- | --- | --- |
| Hero | who STMfan is, one sentence of value, availability, giant contact CTA | letters rise from masks, CTA halo breathes, the moon can be dragged |
| Skills | four attributes: backend, operations, full stack, mobile, each with one outcome line | sticky glyph dial, active row reveals a short line, accent rule travels |
| Open source | MaiBot proof plus three quiet spaces for future projects | case media parallax, timeline reveal |
| Commissions | paid services with pricing posture, free open source help beside them | accent line sweep on the paid column, CTA inside the paid side |
| Gallery | games, official character portraits and the playlist in one tabbed stage | 6s auto-rotation with progress line, thumbs, arrows, no card |
| Notes | the lunar/ground manifesto | horizon parallax, lines illuminate as the section passes |
| Contact | email, QQ, GitHub, Bilibili in one grid, one CTA | channel icons lift, CTA halo, copy toast |

The page is about 6,100px at 1440×900. Nothing hijacks the wheel: there is no Lenis
loop and no GSAP pin.

## 4. The 3D moon

`src/components/MoonCanvas.tsx` renders a real sphere with the Solar System Scope
lunar albedo map (CC BY 4.0), a key light, a cool fill and a warm fresnel rim. It
rotates slowly, can be dragged, supports arrow keys, pauses offscreen or hidden,
and freezes auto-rotation under reduced motion. The scene is dynamically imported
as its own chunk, so first paint never waits for three.js. A CSS disc covers the
texture load. Credit is in the footer and in `docs/ASSETS.md`.

## 5. Character portraits

All five portraits are official artwork, sourced from official pages and wiki-hosted
official renders. Wriothesley, Varka and Von Lycaon use transparent official
portraits; the two Delta Force operators (Vyron, Gizmo) have no transparent official
render, so their official key art is presented inside a 3:4 portrait frame with a
soft bottom fade, documented in `docs/ASSETS.md`. Every portrait has a 160px face
crop for the thumbnail rail, so heads stay readable on phones. No generated
character art is used.

## 6. Responsive and touch

- Sections use `min-height`, never fixed heights with hidden overflow.
- Full-screen acts use `100svh`; the hero fits 1440×900, 1366×768, 1280×720 and
  390×844 without clipping the CTA.
- `scroll-padding-top` and JS navigation offset the fixed nav, so a section never
  lands under the bar.
- Mobile: the moon drops below the copy at 190px and the readout is hidden; the
  gallery tab bar sticks below the nav; thumbnails are 44px targets; the contact
  CTA and copy buttons go full width; safe-area insets are respected.
- Touch: no custom cursor, no scroll hijack, vertical page scroll still wins over
  dragging the moon (`touch-action: pan-y`).

## 7. Mobile performance mode

The reported flicker came from too many heavy layers and per-frame React updates.
The current build removes the causes instead of masking them:

- No `backdrop-filter` on the nav or menu under `(hover: none)`.
- The grain, atmosphere plates and guided SVG lines are hidden on touch.
- The starfield runs at 30fps, 120 stars, DPR ≤1.25 on touch.
- The moon runs at 30fps, DPR ≤1.4, no bump map, simpler geometry on touch.
- The preloader writes the counter and meter directly to DOM refs; it no longer
  re-renders React every frame.
- The live clock is isolated in its own readout component, so it cannot re-render
  the WebGL canvas.
- Ambient halo, float and rotation animations are disabled on touch.
- Headless measurements: no long tasks during a full stepped scroll, 60fps rAF
  sample, one moon canvas, 10 DOM mutations for a whole page scroll.

## 8. Avatar

The visible brand mark calls `https://api.github.com/users/STMfan` on mount, uses the
returned `avatar_url`, and caches it for 12 hours in `localStorage`. If the API is
rate-limited or offline, it falls back to `https://github.com/STMfan.png?size=240`.
The favicon and Apple touch icon also point at the GitHub avatar endpoint. No
hand-cropped local avatar is rendered in the UI.

## 9. Tradeoffs

- three.js is a 535 KB chunk (134 KB gzip), loaded after first paint.
- The Delta Force key art is framed rather than cut out, because no official
  transparent render exists. This is visible and documented, not hidden.
- The gallery auto-rotates every six seconds until the visitor interacts; hover,
  focus, offscreen and reduced motion pause it.
- The build prerenders the Chinese page but mounts with `createRoot`, so the live
  clock and phase never cause a hydration mismatch.
- The moon texture is CC BY 4.0 and requires visible attribution.

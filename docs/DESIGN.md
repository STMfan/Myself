# Design notes: Sublunary (v2.3)

A one-page personal site that reads like a single shot: a huge moon, a title that
sits inside it, then the person, the proof, the work and the way in. The visitor
should be able to stop on any act and see most of it without hunting.

## 1. Read and dials

- Read as: personal homepage and commission surface for a developer, for visitors
  who like craft, with an editorial-celestial language.
- `DESIGN_VARIANCE: 9`, `MOTION_INTENSITY: 9`, `VISUAL_DENSITY: 4`.
- No component framework. Hand-written CSS tokens, five stylesheets, GSAP and one
  three.js scene.

## 2. Visual system

### Palette

Lunar amber (`#f2a24b` dark, `#b4550d` light) is the only accent. Neutrals are cold
silver-blue. The theme toggle cross-fades the whole page with the View Transitions
API and falls back to an instant swap.

### Type scale

| Token | Range | Use |
| --- | --- | --- |
| `--fs-2xs` | 12px | labels, metadata, footer |
| `--fs-xs` | 13px | captions, links, card headings |
| `--fs-sm` | 14.4px | secondary body |
| `--fs-base` | 16-17px | body |
| `--fs-lg` | 17-19px | section lede |
| `--fs-xl` | 19-23px | item titles, CTA line |
| `--fs-2xl` | 23-30px | case, paid/free and character names |
| `--fs-3xl` | 27-39px | section titles |
| `--fs-4xl` | 32-51px | contact title |
| hero | 51-125px (zh), 32-70px (en) | slogan only |

Section titles were reduced again in v2.3 so the hero is the single oversized
moment. Labels never drop below 12px. CJK display is Noto Serif SC, Latin display
Bricolage Grotesque, body Instrument Sans plus Noto Sans SC, labels JetBrains Mono.

### Surface

Two radii: `2px` for frames and cards, full pill for controls. Most sections are
hairlines and space. The gallery is the deliberate exception: three compact glass
cards, each carrying real content, never one full-screen card with a sentence in
the middle.

## 3. The acts

| Act | What the visitor gets | Motion |
| --- | --- | --- |
| Hero | identity, the value sentence, availability, one CTA, the moon | a 68vw 3D moon behind the title, letters rise, solid and outlined lines, ghost word, two meteors, magnetic CTA |
| Skills | four attributes with one outcome line each | sticky glyph dial, active-line reveal, travelling accent rule |
| Open source | MaiBot proof plus three quiet future slots | case media parallax, timeline reveal |
| Commissions | paid services, then "free when it interests me" | accent sweep, CTA in the paid column |
| Gallery | games, five characters and the playlist as three cards | 2.5s character rotation, face rail, pointer tilt and spotlight |
| Notes | the lunar/ground manifesto | horizon parallax, lines illuminate |
| Contact | four channels and one CTA | icon lift, CTA halo, copy toast |

There is no preloader. The page renders immediately, including on mobile; the hero
timeline starts on mount. No Lenis, no scroll pin, no wheel hijack.

## 4. The hero

The hero is one composition, not a two-column layout: a giant moon is anchored to
the right, spills past the viewport, and the copy overlaps its dark limb. The first
slogan line is solid, the second is an outline so the moon shows through the
letters. A huge outlined `SUBLUNARY` sits behind the copy and parallaxes. The moon
is draggable on desktop, decorative on touch.

The CTA has a magnetic pull (GSAP quickTo, desktop only). Meteors cross the backdrop
every eleven seconds. The top-left kicker and the bottom availability line are the
only small text in the hero.

## 5. The moon

`MoonCanvas.tsx` renders a real sphere with the Solar System Scope albedo map
(CC BY 4.0), key/fill/rim lighting and a subtle fresnel. It is dynamically imported
after 350ms, capped at 30fps and DPR 1.5, with no bump map. It pauses offscreen and
when the tab is hidden; reduced motion freezes rotation but keeps dragging. The
texture credit is in the footer and `docs/ASSETS.md`.

## 6. Character portraits

All five are official art. Wriothesley, Varka and Von Lycaon are official
transparent renders. The Delta Force operators (Vyron, Gizmo) have no transparent
official render, so their official key art has its background removed locally with
rembg (u2net), then is alpha-trimmed and cropped to a half-body portrait. Every
portrait has a 160px face crop for the rail. The carousel advances every 2.5s,
pauses on hover, focus or a manual face selection and stops under reduced motion.

## 7. Responsive and touch

- The hero is exactly `100svh`; it fits 1440×900, 1366×768, 1280×720 and 390×844
  without clipping the CTA.
- On mobile the moon becomes a 142vw backdrop behind the copy, at lower opacity
  with a vertical scrim; it no longer takes a column below the text.
- The gallery stacks three cards; games remain a single five-row list, all five
  visible at once. Playlist arrow and wordmark are hidden on mobile so the title
  stays on one line.
- Thumbnails and icon buttons are 44px; the contact CTA is full width; safe-area
  insets are respected.
- Native scrolling. `touch-action: pan-y` on the moon means a vertical swipe still
  scrolls the page.

## 8. Performance mode

The mobile flicker came from layered filters, a per-frame React preloader and two
full-rate canvases. v2.3 removes the causes:

- No preloader at all; FCP measured at 900ms on a 390×844 mobile profile.
- No `backdrop-filter` on touch; grain, atmosphere and guided lines hidden there.
- Starfield and moon both at 30fps and DPR ≤1.5; one moon canvas.
- The clock readout is a separate component and is not mounted in the hero.
- Ambient halos and float animations are disabled on touch.
- Measured: zero long tasks during a full stepped scroll, 60fps rAF sample, ten
  DOM mutations across the page.

## 9. Avatar

The visible brand mark fetches `api.github.com/users/STMfan` on mount, preloads the
returned `avatar_url`, then swaps it in, with a 12 hour cache. If the API is
rate-limited, the full local `avatar.png` is the fallback; no hand-cropped face is
used. The favicon and Apple touch icon point at the GitHub avatar endpoint.

## 10. Tradeoffs

- Three.js is a 535KB lazy chunk; first paint does not wait for it.
- The two Delta Force cutouts are precomputed with rembg; `bun run assets` would
  need that manual step to regenerate them from key art.
- The gallery cards are a deliberate surface change from the open sections; they
  are compact and content-first, not decorative panels.
- The page is about 5,200px desktop and 5,700px mobile. Desktop acts are 594-818px tall; mobile acts are 523-996px, so a stop normally holds a complete section.

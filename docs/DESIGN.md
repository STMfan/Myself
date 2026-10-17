# Design notes: Sublunary (v2.1)

A one-page personal site built as a single unbroken shot. The camera starts in
lunar orbit, passes the skills, the open source case, the paid commissions and a
small gallery, then reads a short note and lands on contact. The point is
conversion without losing the atmosphere: the first screen has a big, obvious
"发起咨询" button, and the page never hides the work behind a scroll trick.

## 1. Design read and dials

- Read as: personal homepage and commission surface for a developer, for visitors
  who appreciate craft, with an editorial-celestial language.
- `DESIGN_VARIANCE: 8`, `MOTION_INTENSITY: 9`, `VISUAL_DENSITY: 4`.
- No component framework. A small token layer plus hand-written CSS so the text
  choreography and the WebGL moon share one palette.

## 2. Visual system

### Palette

One accent, locked for the whole page: lunar amber (`#f2a24b` dark, `#b4550d` light).
Neutrals are cold silver-blue.

| Token | Dark | Light |
| --- | --- | --- |
| `--bg` | `#04060b` | `#edeff3` |
| `--text` | `#eef1f7` | `#0a0e15` |
| `--accent` | `#f2a24b` | `#b4550d` |
| `--accent-ink` | `#150b02` | `#fff6ea` |

Theme switching re-themes the entire page through the View Transitions API,
expanding a circle from the pressed control; browsers without the API swap
instantly. A film-grain layer uses the generated paper / emulsion textures.

### Type

| Role | Family |
| --- | --- |
| Latin display | Bricolage Grotesque Variable |
| CJK display | Noto Serif SC Variable |
| Body | Instrument Sans Variable, Noto Sans SC Variable |
| Instrument labels | JetBrains Mono Variable |

Latin and CJK share one family stack so mixed strings fall through per glyph.
The second slogan line is stroked rather than filled.

### Shape

Two radii only: `2px` for panels and media, full pill for interactive controls.
Hairlines are 1px. Shadows are reserved for media and floating elements.

## 3. The acts

| Act | Content | Motion |
| --- | --- | --- |
| Hero | slogan, short intro, availability, giant contact CTA | letters rise from masks, CTA halo breathes, the moon can be dragged |
| Skills | four directions as attributes: 后端 / 运维 / 全栈 / 移动端 | sticky glyph dial, active row reveals one short line, accent line travels |
| Open source | MaiBot case plus three reserved project slots | case image parallax, orbit ring turns, empty slots are designed empty states |
| Paid commissions | three paid services with pricing posture, free help side by side | conic border sweep on the paid card, CTA inside the card |
| Gallery | games, characters, playlist in one album | tabs, auto-rotating panels with a 6s progress line, thumbnails, arrows |
| Notes | the lunar/ground manifesto | horizon parallax, lines illuminate as the section passes |
| Contact | email, QQ, GitHub, Bilibili in one block, CTA | channel icons float, CTA halo, copy-to-clipboard toast |

The page now ends around 6,800px at 1440×900 instead of the previous 12,000px.
Nothing hijacks the wheel: the old Lenis loop and GSAP pinning are gone.

## 4. The 3D moon

`src/components/MoonCanvas.tsx` renders a real sphere with the Solar System Scope
lunar albedo map (CC BY 4.0), a shared bump map, a key light, a cool fill, and a
warm fresnel rim. It starts at a slow rotation, can be dragged with pointer or
rotated with the arrow keys, pauses when offscreen or hidden, and freezes its
auto-rotation under `prefers-reduced-motion`. The scene is loaded as its own
chunk so the first paint never waits for three.js; a CSS moon disc covers the
texture load.

The map's polar distortion is invisible because it is mapped onto a sphere.
Credit is shown in the footer and recorded in `docs/ASSETS.md`.

## 5. Responsive and viewport strategy

- Sections use `min-height`, never fixed heights with hidden overflow, so short
  browser windows scroll instead of clipping.
- Full-screen acts use `100svh`, which excludes mobile browser chrome.
- Hero content is planned around three height bands (900px, 840px, 720px) and the
  moon panel collapses under the copy rather than being cropped.
- `scroll-padding-top` and JS section navigation account for the fixed 72/64px nav,
  so a nav click never lands under the bar.
- Touch: no custom cursor, larger targets, no scroll hijack, vertical page scroll
  still wins over dragging the moon (`touch-action: pan-y`), gallery auto-rotation
  pauses on interaction.

## 6. Accessibility

- `prefers-reduced-motion` removes the preloader, GSAP timelines, auto-rotation and
  ambient loops while keeping the page complete.
- Tabs are a real tablist with arrow-key navigation; the moon is focusable and
  arrow-key rotatable; buttons have labels and visible focus.
- All body copy uses text tokens with sufficient contrast in both themes.

## 7. Tradeoffs

- three.js is a 535 KB chunk (134 KB gzip), loaded after first paint. It is the
  price of a real moon; the alternative was a flat texture with visible seams.
- The gallery auto-rotates every 6 seconds until the visitor interacts. Hover,
  focus, offscreen and reduced motion pause it.
- The build prerenders the Chinese page but mounts with `createRoot`, so the live
  clock and phase never cause a hydration mismatch.
- The moon texture is CC BY 4.0 and requires visible attribution; it lives in the
  footer next to the license.

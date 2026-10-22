# Design notes: Sublunary (v2.4)

A one-page personal site that opens like a title card: a short preloader, a huge
moon, then the person, the proof, the work and the way in.

## 1. Read and dials

- Read as: personal homepage and commission surface for a developer, for visitors
  who like craft, with an editorial-celestial language.
- `DESIGN_VARIANCE: 9`, `MOTION_INTENSITY: 9`, `VISUAL_DENSITY: 4`.
- Hand-written CSS tokens, six scoped stylesheets, GSAP and one three.js scene.

## 2. Visual system

### Palette

Lunar amber (`#f2a24b` dark, `#b4550d` light) is the only accent. Neutrals are cold
silver-blue. Light mode is deliberately crisp: white cards, cool grey page, a cool
silver moon rim, no warm haze. The theme toggle cross-fades the page through the
View Transitions API and falls back to an instant swap.

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

CJK display is Noto Serif SC, Latin display Bricolage Grotesque, body Instrument
Sans plus Noto Sans SC, labels JetBrains Mono. Labels never drop below 12px.

### Surfaces

`2px` radius for media and cards, pill for controls. Most sections are hairlines
and space. The gallery is three compact cards with equal heights; the character
card is full-bleed.

## 3. Acts

| Act | What the visitor gets | Motion |
| --- | --- | --- |
| Hero | identity, value sentence, availability, CTA, moon | 68vw 3D moon behind the copy; solid first line, amber second line, amber rule, ghost word, meteors, magnetic CTA |
| Skills | four attributes with one outcome line each | sticky glyph dial, active-line reveal, travelling accent rule |
| Open source | Synaxis client and MaiBot docs/community, two compact cases | paired reveal |
| Commissions | paid services, then "free when it interests me" | accent sweep, CTA in the paid column |
| Gallery | games, five characters and the playlist as three cards | 2.5s character rotation, face rail, pointer tilt and spotlight |
| Notes | the lunar/ground manifesto | horizon parallax, lines illuminate |
| Contact | four channels and one CTA | icon lift, CTA halo, copy toast |

## 4. The hero

The first slogan line is solid, the second is solid amber, and a thin amber rule
with a single dot sits underneath. The previous outlined line (and the hollow
`象`) is gone. A giant `SUBLUNARY` outline wordmark parallaxes behind the copy.

The moon is draggable on desktop, decorative on touch. The CTA has a magnetic pull
on desktop. Meteors cross the hero and the page background.

## 5. Preloader

A short reveal, not a gate:

- It shows for 620ms minimum, waits up to 1.8s for `document.fonts.ready`, then
  fades for 430ms.
- No numeric counter, so a stalled font or network cannot leave a "000" on screen.
- A CSS failsafe hides the overlay after 2.8s even if the client bundle never
  mounts; the underlay is the prerendered page.
- If the client bundle arrives after 2.4s, the preloader is not shown again.
- It hides the initial font/asset swap without waiting for three.js or the gallery
  images.

## 6. Characters and gallery

The gallery carries five official portraits: Wriothesley, Varka and Von Lycaon as
transparent HoYoverse renders, plus Vyron and Gizmo from two official Delta Force
promotional posters (different images from the earlier key art). The two posters
were background-removed locally with rembg and alpha-trimmed. There is no
generated character art.

The character card is a full-bleed 6-column portrait: the art is `object-fit:
cover`, anchored to the top, and masked at the bottom card edge so the body fades
into the card instead of stopping abruptly. The header, name, face rail and timer
sit on top of the art with their own scrims. The games card is the other 6 columns,
with all five games in one list. The playlist is a full-width band. Both top cards
are 440px tall; the grid uses `align-items: stretch`.

## 7. Background

The fixed stage combines a 30fps starfield, twinkling stars, drifting warm and cool
atmosphere plates, a slow aurora, three huge orbital rings and occasional meteors.
On desktop a soft cursor aura follows the pointer behind the content; in light mode
it is hidden. All of it sits behind the page and behind card surfaces. Touch,
reduced motion and calm mode remove the expensive layers.

## 8. Light mode

- White `#fbfcfe` cards with a cool border and a low cool shadow.
- Cooler stage sky and a silver moon rim; no amber halo around the moon.
- Grain is grayscale and reduced; atmosphere and aurora are much quieter.
- Notes keeps more of its photo and uses a lighter scrim, so it no longer reads as
  a grey fog.
- The cursor aura is disabled in light mode.

## 9. Responsive and touch

- Hero is exactly `100svh`; fits 1440×900, 1366×768, 1280×720 and 390×844.
- Mobile moon is a 142vw backdrop behind the copy, no separate column.
- Gallery stacks; games remain a five-row list; the cast card is 380px of
  full-bleed art; thumbnails and icon buttons are 44px.
- Native scrolling, no Lenis, no pin, no wheel hijack.

## 10. Performance

- Adaptive render allocation: background 800k px, moon 1.05M px, with a sustained-cost downgrade to 450k/590k. No bump map; moon import deferred 350ms.
- No backdrop-filter on touch; grain, atmosphere, aurora, orbits and flow hidden.
- The preloader has no per-frame React state; the clock readout is not mounted in
  the hero.
- On wide viewports the background pauses while scrolling; portrait keeps its resolution. Headless before/after improved from 16.6 to 24.1 fps desktop and 34.5 to 39.9 fps phone landscape under software rendering.

## 11. Copy

- Full stack is explicitly Vibe Coding, not hand-written line by line, in both
  workshop and commission copy.
- Open source is not free by default: paid work is the default, free participation
  depends on interest.
- Slogan unchanged: `探月下，尘世万象。` / `To Decipher the Sublunary Sphere.`

## 12. Avatar

The visible logo fetches `api.github.com/users/STMfan`, preloads the returned
`avatar_url`, caches it for 12 hours, and falls back to the full local avatar if
the API is rate-limited. No hand-cropped face is rendered. The favicon and Apple
touch icon point at the GitHub avatar endpoint.

## 13. Tradeoffs

- Three.js is a 536KB lazy chunk; first paint does not wait for it.
- The preloader is a timing device, not a guarantee that every remote asset is
  ready; the 3D moon has a CSS fallback disc.
- The full-bleed character art intentionally crops at the card edges; the masks
  make that read as a composition rather than a mistake.
- Page height is about 5,050px desktop and 5,600px mobile.

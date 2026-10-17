# Design notes: Sublunary (v2)

A one-page personal site built as a single unbroken shot: the camera starts in lunar
orbit, drifts through the owner's notes, workshop, commissions, community, games and
cast of favourite characters, then settles on the ground at the contact section.
Nothing on the page is a card floating on a white canvas; every act is a layer of the
same night.

## 1. Design read and dials

- Read as: personal homepage and commission surface for a developer, for visitors who
  appreciate craft, with an editorial-celestial language.
- `DESIGN_VARIANCE: 9`, `MOTION_INTENSITY: 9`, `VISUAL_DENSITY: 4`.
- No component framework. A small token layer plus hand-written CSS, so the text
  choreography and the canvas can share one set of colors.

## 2. Visual system

### Palette

One accent, locked for the whole page: lunar amber (`#f2a24b` dark, `#b4550d` light).
Neutrals are cold silver-blue, never warm beige.

| Token | Dark | Light |
| --- | --- | --- |
| `--bg` | `#04060b` | `#edeff3` |
| `--text` | `#eef1f7` | `#0a0e15` |
| `--text-2` | 72% ink | 72% ink |
| `--rule` | 13% ink | 15% ink |
| `--accent` | `#f2a24b` | `#b4550d` |
| `--accent-ink` | `#150b02` | `#fff6ea` |

The site ships one theme at a time. Switching re-themes the entire page through the
View Transitions API, expanding a circle from the pressed control; browsers without
the API get an instant swap.

### Type

| Role | Family |
| --- | --- |
| Latin display | Bricolage Grotesque Variable |
| CJK display | Noto Serif SC Variable |
| Body | Instrument Sans Variable, Noto Sans SC Variable |
| Instrument labels | JetBrains Mono Variable |

Both CJK families are self hosted through `@fontsource-variable`, so each glyph is
only fetched through its unicode range. Latin and CJK share one family stack, which
lets a mixed string fall through per glyph without wrapper elements. The second
slogan line is stroked rather than filled, which keeps the hierarchy without adding a
second color.

### Shape and surface

Two radii only: `2px` for panels and cards, full pill for interactive controls.
Hairlines are 1px, always at `--rule`. No drop shadows are used as decoration; the
only shadows are on photographic media and the floating toast, and they are tinted
to the background.

## 3. The continuous take

A fixed canvas stage owns the sky for the whole document. It draws three star
parallax layers (with velocity streaks), warm atmospheric glow, rising horizon grid,
and drifting dust. Scroll progress shifts every layer, so the 12,000px page reads as
one continuous camera move instead of nine separate websites.

| Act | Scroll behaviour | Motion |
| --- | --- | --- |
| Boot | overlay | 000 to 100 counter, panels split, hero letters rise from masks |
| Hero | natural | per-character reveal, orb rings, live moon phase and clock |
| Notes | sticky 340svh | horizon plate parallaxes, three lines illuminate in sequence |
| Workshop | sticky visual | accordion rows, glyph changes, ring rotation |
| Commissions | sticky intro | list rows lift and glow on hover |
| Community | natural | circular portrait reveal, parallax image |
| Games | pinned horizontal pan (desktop only) | zero-inertia horizontal track |
| Characters | natural | constellation line draws, active sigil lights |
| Contact | natural | masked headings, copy-to-clipboard toast |
| Footer | natural | oversized slogan watermark |

A left rail shows section progress and a right altitude gauge counts down from
384 400 km as the descent proceeds. Both are real scroll readouts, not decoration.

## 4. Interaction details

- Custom cursor with a magnetic ring on interactive targets (fine pointers only).
- Language and theme preferences persist in `localStorage`; language swaps every
  string, including the page title and the rail labels.
- Live moon phase is computed from a synodic month; the clock uses the visitor's own
  time zone. No fake statistics anywhere.
- Copy buttons use the async clipboard API with a `execCommand` fallback and a toast.
- Motion is fully bypassed under `prefers-reduced-motion` (no preloader, no GSAP
  timelines, no ambient CSS loops); the page remains readable and complete.

## 5. Implementation map

- `src/components/Stage.tsx`: the canvas sky.
- `src/components/Orrery.tsx`: moon sample, phase, clock.
- `src/lib/scroll.ts`: GSAP, ScrollTrigger, Lenis, scroll helpers.
- `src/lib/preferences.tsx`: theme and locale state, view transition.
- `src/sections/*`: one file per act.
- `src/styles/{tokens,base,chrome,stage,sections,responsive}.css`: the system.
- `src/content/site.ts`: every string in both languages, plus all structured data.

## 6. Tradeoffs

- The build prerenders the Chinese page for crawlers, but the client mounts with
  `createRoot` rather than hydrating, so the live clock and phase never produce a
  hydration mismatch. The prerendered markup is replaced by the same tree on mount.
- CJK fonts contribute most of the 12 MB `dist`; they are split per unicode range and
  only the ranges in use are downloaded at runtime.
- The horizontal games pan is disabled below 900px, where the section becomes a
  vertical editorial list, because a scroll hijack on touch would fight the page.

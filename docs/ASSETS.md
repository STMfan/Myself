# Assets

Every raster file the site serves lives in `public/assets/`. The pipeline that
produces it is `scripts/build-assets.mjs`, run with:

    bun run assets

It reads the original art from `assets-src/` (never writes there), downloads the
three external images into `assets-src/external/`, encodes every derivative with
sharp, composes the social card, writes `public/assets/sources.json`, verifies
each output's dimensions and byte budget, and rewrites this document's size
table. It is idempotent; it re-downloads the external images on every run and
falls back to the cache in `assets-src/external/` when offline.

## Generated art

All ten plates were generated with **gpt-image** (via Codex) on **2026-10-17**.
High resolution originals sit in `assets-src/`; the site only receives the
derivatives below. The moon plate is cropped to a 1000x1000 square at (127,127)
before the 720x720 resize so that the circular hero mask sees lunar surface and
limb light instead of empty space.

- `moon-macro` — Macro of the lunar surface: cratered highlands and a large rayed impact crater on the left, smooth mare on the right, hard terminator shadow along the lower-left edge and a warm grazing rim light in the upper-right corner. Square; near-black space only at the extreme corner, no text.
  - Output: `public/assets/art/moon-macro.webp` (720x720)
  - Prompt summary recorded in `public/assets/sources.json`; model `gpt-image`, date 2026-10-17.
- `horizon` — Ultrawide dusk horizon: a snow-dusted mountain ridge under a thin amber band of sunset light, layered blue haze over a dark city skyline with scattered warm windows, foreground conifers. Cinematic, no text.
  - Output: `public/assets/art/horizon.webp` (1920x823)
  - Prompt summary recorded in `public/assets/sources.json`; model `gpt-image`, date 2026-10-17.
- `atmosphere-haze` — Near-black atmosphere plate: low blue mist drifting in from the lower left, a single warm amber light leak in the upper-right corner, fine grain. 16:9, no text.
  - Output: `public/assets/art/atmosphere-haze.webp` (1600x900)
  - Prompt summary recorded in `public/assets/sources.json`; model `gpt-image`, date 2026-10-17.
- `light-paper` — Cold-pressed white paper texture: fine fibres, tiny flecks, flat even light. Square, no text.
  - Output: `public/assets/art/light-paper.webp` (512x512)
  - Prompt summary recorded in `public/assets/sources.json`; model `gpt-image`, date 2026-10-17.
- `dark-emulsion` — Aged dark film emulsion: near-black base, dust specks, fine scratches, faint umber edge burn. Square, no text.
  - Output: `public/assets/art/dark-emulsion.webp` (512x512)
  - Prompt summary recorded in `public/assets/sources.json`; model `gpt-image`, date 2026-10-17.
- `sigil-wriothesley` — Heraldic wolf-skull sigil: forged steel and fractured blue-white crystal, keyhole brow, brass gears and chains, a single amber eye ember, symmetrical crest on near-black. Square, no text.
  - Output: `public/assets/art/sigil-wriothesley.webp` (640x640)
  - Prompt summary recorded in `public/assets/sources.json`; model `gpt-image`, date 2026-10-17.
- `sigil-varka` — Heraldic sigil of a pale wolf-fang spear crossing a white feather, twin engraved crescents and blue crystal filigree, a warm amber spark at the crossing, near-black background. Square, no text.
  - Output: `public/assets/art/sigil-varka.webp` (640x640)
  - Prompt summary recorded in `public/assets/sources.json`; model `gpt-image`, date 2026-10-17.
- `sigil-lycaon` — Frost-wolf head sigil in silver-blue crystal, framed by a four-point star ring, amber eye, symmetrical crest on near-black. Square, no text.
  - Output: `public/assets/art/sigil-lycaon.webp` (640x640)
  - Prompt summary recorded in `public/assets/sources.json`; model `gpt-image`, date 2026-10-17.
- `sigil-vyron` — Compass-rose sigil: eight-point steel star over concentric astrolabe rings, glowing amber core, blue rim light, near-black background. Square, no text.
  - Output: `public/assets/art/sigil-vyron.webp` (640x640)
  - Prompt summary recorded in `public/assets/sources.json`; model `gpt-image`, date 2026-10-17.
- `sigil-gizmo` — Brass-and-steel spherical automaton sigil: riveted plating, side ports, glowing amber lens eye, antenna orb, blue rim light, near-black background. Square, no text.
  - Output: `public/assets/art/sigil-gizmo.webp` (640x640)
  - Prompt summary recorded in `public/assets/sources.json`; model `gpt-image`, date 2026-10-17.

## External assets

- **avatar** — `avatar.png`
  - URL: https://github.com/STMfan.png?size=320
  - Owner: STMfan (GitHub account avatar)
  - Scope: Personal avatar, © STMfan. Redistributed as part of this site; not relicensed under MIT.
  - Fetched at: 2026-10-17T14:18:26.500Z
  - Transform: resize 320x320 (cover), written as PNG
- **maibot** — `maibot.webp`
  - URL: https://raw.githubusercontent.com/Mai-with-u/.github/main/profile/assets/maimai2.png
  - Owner: Mai-with-u (MaiBot project) — mascot artwork
  - Scope: Mascot artwork © Mai-with-u and the original artist. Used with attribution to illustrate the MaiBot section; not relicensed under MIT.
  - Fetched at: 2026-10-17T14:18:27.906Z
  - Transform: contained on an 800x800 transparent canvas, webp q82
- **playlist-cover** — `playlist-cover.webp`
  - URL: https://i1.hdslb.com/bfs/archive/5c8ee48913bdb5b994901950ab9047ae170af189.jpg@672w_378h_1c.webp
  - Owner: Bilibili archive cover (Bilibili / original uploader)
  - Scope: Cover artwork © Bilibili and the original uploader. Used as the Bilibili playlist card; not relicensed under MIT.
  - Fetched at: 2026-10-17T14:18:31.433Z
  - Transform: kept 672x378, webp q82

## Fonts used for the social card

The OG card lettering is not live text: it is converted to SVG outlines from
three static TrueType instances (OFL 1.1) at build time. This is deliberate —
libvips/librsvg on Windows resolves text through the OS font collection, so
private or fontconfig fonts cannot be referenced reliably. Converting glyphs to
paths makes the card reproducible from the vendored fonts and preserves the
exact letterforms, including the CJK slogan. The card is laid out with explicit
advance widths (no kerning table is applied).

- `assets-src/fonts/bricolage-grotesque-700.ttf` — Bricolage Grotesque 700, full latin (Google Fonts static instance). SIL Open Font License 1.1. Source: Google Fonts.
- `assets-src/fonts/jetbrains-mono-400-latin-subset.ttf` — JetBrains Mono 400, latin subset, text=TO DECIPHER THE SUBLUNARY SPHERE. STMFAN.TECH 2026. SIL Open Font License 1.1. Source: Google Fonts.
- `assets-src/fonts/noto-serif-sc-500-slogan-subset.ttf` — Noto Serif SC 500, slogan subset, text=探月下，尘世万象. SIL Open Font License 1.1. Source: Google Fonts.

The fonts are only used to rasterise the share card. The site itself loads fonts
from `@fontsource-variable` packages in `src/`.

## Licence scope

- The project source is MIT licensed (see `LICENSE`).
- The ten generated plates and the composed OG card are project assets, ©
  STMfan, distributed under the same terms as the site.
- `avatar.png` is the GitHub account avatar, © STMfan.
- `maibot.webp` is MaiBot mascot artwork © Mai-with-u and the original artist,
  used with attribution in the MaiBot section. It is **not** relicensed under
  MIT; replace it if upstream asks.
- `playlist-cover.webp` is a Bilibili archive cover © Bilibili and the original
  uploader, used as the playlist card. It is **not** relicensed under MIT.
- The vendored fonts are SIL Open Font License 1.1 and remain under that licence.

## Outputs

| File | Dimensions | Size | Source |
| --- | --- | --- | --- |
| `public/assets/art/atmosphere-haze.webp` | 1600x900 | 38.2 KB | `assets-src/atmosphere-haze.png` |
| `public/assets/art/dark-emulsion.webp` | 512x512 | 12.7 KB | `assets-src/dark-emulsion.png` |
| `public/assets/art/horizon.webp` | 1920x823 | 42.4 KB | `assets-src/horizon.png` |
| `public/assets/art/light-paper.webp` | 512x512 | 47.5 KB | `assets-src/light-paper.png` |
| `public/assets/art/moon-macro.webp` | 720x720 | 182.2 KB | `assets-src/moon-macro.png` |
| `public/assets/art/sigil-gizmo.webp` | 640x640 | 58.9 KB | `assets-src/sigil-gizmo.png` |
| `public/assets/art/sigil-lycaon.webp` | 640x640 | 60.4 KB | `assets-src/sigil-lycaon.png` |
| `public/assets/art/sigil-varka.webp` | 640x640 | 63.8 KB | `assets-src/sigil-varka.png` |
| `public/assets/art/sigil-vyron.webp` | 640x640 | 56.7 KB | `assets-src/sigil-vyron.png` |
| `public/assets/art/sigil-wriothesley.webp` | 640x640 | 50.5 KB | `assets-src/sigil-wriothesley.png` |
| `public/assets/avatar.png` | 320x320 | 58.9 KB | `https://github.com/STMfan.png?size=320` |
| `public/assets/maibot.webp` | 800x800 | 57.8 KB | `https://raw.githubusercontent.com/Mai-with-u/.github/main/profile/assets/maimai2.png` |
| `public/assets/playlist-cover.webp` | 672x378 | 21.2 KB | `https://i1.hdslb.com/bfs/archive/5c8ee48913bdb5b994901950ab9047ae170af189.jpg@672w_378h_1c.webp` |
| `public/assets/share/og.png` | 1200x630 | 634.0 KB | `assets-src/horizon.png` + font outlines |

## How to regenerate

1. `bun install` (sharp is the only tool the pipeline needs beyond Node).
2. Make sure `assets-src/` still holds the ten generated originals. It is
   gitignored, so a fresh clone must restore it from the asset archive.
3. Run `bun run assets`. The script re-downloads `avatar.png`, `maibot.webp` and
   `playlist-cover.webp` when the network is available, otherwise it falls back
   to `assets-src/external/`.
4. The script fails loudly if an output exceeds its byte budget, a dimension is
   wrong, or a glyph is missing from the subset font. It does not silently
   upscale: the only enlargement is the horizon plate (1916x821 to 1920x823,
   +0.2%) and it is imperceptible.

## Caveats

- `assets-src/` is gitignored. `public/assets/` is what ships; the originals
  need a separate backup if the pipeline is to be re-run after a fresh clone.
- `public/assets/sigil.svg` is a hand-authored vector file owned by the site
  build, not by this pipeline.
- `sources.json` records the real `fetchedAt` for external assets, so it changes
  when those files are re-downloaded; the image bytes themselves are stable for
  a given source revision.

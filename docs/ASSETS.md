# Assets

Every raster file the site serves lives in `public/assets/`. The pipeline that
produces it is `scripts/build-assets.mjs`, run with:

    bun run assets

It reads the original art from `assets-src/` (never writes there), downloads the
remote sources into `assets-src/external/`, downloads the official character art
into `assets-src/external/cast/`, encodes every derivative with sharp, composes
the social card and the icon marks, writes `public/assets/sources.json`, verifies
each output's dimensions and byte budget, and rewrites this document's size
table. It is idempotent; it re-downloads the external images on every run and
falls back to the cache in `assets-src/external/` when offline. The 15 MB lunar
texture is pinned to its cache entry (`preferCache`) because it never changes
upstream.

## Generated art

Four plates were generated with **gpt-image** (via Codex) on **2026-10-17**.
High resolution originals sit in `assets-src/`; the site only receives the
derivatives below. The moon plate is cropped to a 1000x1000 square at (127,127)
before the 720x720 resize so that the circular hero mask sees lunar surface and
limb light instead of empty space. The character portraits are **not** in this
list: they are official artwork now (see below).

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

## Character portraits (official, v2.4)

The gallery shows **official character artwork**, not generated fan art. Every
plate is cut to a half-body portrait and presented full-bleed in the character
card. The three HoYoverse portraits were cropped and scaled so the head measures
300 px in the output; the two Delta Force posters keep their taller portrait
aspect and are cropped by the card mask. Face crops are square 160 px frames of
the same source, sized to stay readable in the thumbnail strip.

All three HoYoverse portraits are official **transparent character renders**
(Wriothesley, Varka, Von Lycaon), so no keying was needed. Varka is playable and
has an official render of his own, so the manga/group-art fallback was not required.

The two Delta Force operators use **official promotional posters** mirrored on
Moegirl Commons (different images from the earlier battlefield key art). Their
backgrounds were removed locally with rembg, then alpha-trimmed; the characters
are untouched. The source is still official artwork, not AI-generated.

Every output keeps a real alpha channel with a 0..255 range. All ten files were
inspected on a dark ground while this document was written.

- **wriothesley** — `public/assets/cast/wriothesley.webp` (894x999, alpha) + `public/assets/cast/wriothesley-face.webp` (160x160)
  - Source: https://static.wikia.nocookie.net/gensin-impact/images/8/85/Wriothesley_Portrait.png/revision/latest?cb=20260721170933
  - Page: https://genshin-impact.fandom.com/wiki/File:Wriothesley_Portrait.png
  - Owner: HoYoverse / COGNOSPHERE (Genshin Impact)
  - Scope: Official Genshin Impact character render, (c) HoYoverse / COGNOSPHERE. Mirrored from the Fandom character gallery, which hosts the official game render. Used nominatively on a personal, non-commercial site; not relicensed under MIT.
  - Fetched at: 2026-10-17T18:15:55.081Z (1009x1534 source, already transparent)
  - Cut: head + torso to the belt/upper thigh; the raised left fist and coat are cropped, the hair top is intact
  - Transform: crop 614x686 at (395,0), scale 1.456x to 894x999, head 300px; webp q88 with alpha; face crop 280x280 to 160x160, webp q88.
- **varka** — `public/assets/cast/varka.webp` (784x1000, alpha) + `public/assets/cast/varka-face.webp` (160x160)
  - Source: https://static.wikia.nocookie.net/gensin-impact/images/3/32/Varka_Portrait.png/revision/latest?cb=20260301093455
  - Page: https://genshin-impact.fandom.com/wiki/File:Varka_Portrait.png
  - Owner: HoYoverse / COGNOSPHERE (Genshin Impact)
  - Scope: Official Genshin Impact character render, (c) HoYoverse / COGNOSPHERE. Mirrored from the Fandom character gallery. Varka is playable (Knights of Favonius Grand Master), so no manga/group-art compromise was needed. Used nominatively; not relicensed under MIT.
  - Fetched at: 2026-10-17T18:15:55.684Z (1376x1776 source, already transparent)
  - Cut: head + torso to the waist; the greatsword leaves the frame on both sides, the hair top is intact
  - Transform: crop 528x673 at (496,0), scale 1.485x to 784x1000, head 300px; webp q88 with alpha; face crop 280x280 to 160x160, webp q88.
- **lycaon** — `public/assets/cast/lycaon.webp` (851x1000, alpha) + `public/assets/cast/lycaon-face.webp` (160x160)
  - Source: https://static.wikia.nocookie.net/zenless-zone-zero/images/5/5f/Agent_Von_Lycaon_Portrait.png/revision/latest?cb=20240707002420
  - Page: https://zenless-zone-zero.fandom.com/wiki/File:Agent_Von_Lycaon_Portrait.png
  - Owner: HoYoverse / COGNOSPHERE (Zenless Zone Zero)
  - Scope: Official Zenless Zone Zero agent render, (c) HoYoverse / COGNOSPHERE. Mirrored from the Fandom agent gallery. Used nominatively; not relicensed under MIT.
  - Fetched at: 2026-10-17T18:15:56.364Z (1836x2480 source, already transparent)
  - Cut: head + shoulders/chest of the official crouched render; the tail sweeps out of the left edge, the ears are intact
  - Transform: crop 996x1170 at (530,14), scale 0.855x to 851x1000, head 300px; webp q88 with alpha; face crop 390x390 to 160x160, webp q88.
- **vyron** — `public/assets/cast/vyron.webp` (636x1200, alpha) + `public/assets/cast/vyron-face.webp` (160x160)
  - Source: https://storage.moegirl.org.cn/moegirl/commons/c/cf/%E4%B8%89%E8%A7%92%E6%B4%B2%E8%A1%8C%E5%8A%A8-%E5%A8%81%E9%BE%99.jpg
  - Page: https://commons.moegirl.org.cn/File:三角洲行动-威龙.jpg
  - Owner: Tencent / Team Jade (Delta Force), official promotional art mirrored by Moegirl Commons
  - Scope: Official Delta Force operator poster, used nominatively on this personal, non-commercial page; not relicensed under MIT.
  - Cut: rembg background removal, alpha-trimmed, transparent webp; face crop from the same 750x1500 source.
  - Transform: 636x1200 webp q90 with alpha; face 320x320 source crop to 160x160 webp q88.
- **gizmo** — `public/assets/cast/gizmo.webp` (638x1200, alpha) + `public/assets/cast/gizmo-face.webp` (160x160)
  - Source: https://storage.moegirl.org.cn/moegirl/commons/1/1a/%E4%B8%89%E8%A7%92%E6%B4%B2%E8%A1%8C%E5%8A%A8-%E6%AF%94%E7%89%B92.jpg
  - Page: https://commons.moegirl.org.cn/File:三角洲行动-比特2.jpg
  - Owner: Tencent / Team Jade (Delta Force), official promotional art mirrored by Moegirl Commons
  - Scope: Official Delta Force operator poster, used nominatively on this personal, non-commercial page; not relicensed under MIT.
  - Cut: rembg background removal, alpha-trimmed, transparent webp; face crop from the same 750x1500 source.
  - Transform: 638x1200 webp q90 with alpha; face 320x320 source crop to 160x160 webp q88.

## 3D moon map (v2.1)

- **Moon albedo map** — `public/assets/art/moon-map.webp`, `public/assets/art/moon-map-1k.webp`
  - URL: https://upload.wikimedia.org/wikipedia/commons/d/d1/Solarsystemscope_texture_8k_moon.jpg (8192x4096 source, mirrored from solarsystemscope.com/textures)
  - Commons page: https://commons.wikimedia.org/wiki/File:Solarsystemscope_texture_8k_moon.jpg
  - Owner: Solar System Scope (solarsystemscope.com/textures), CC BY 4.0; base lunar photography NASA / LRO
  - Licence: CC BY 4.0 — Solar System Scope moon texture. Attribution: “Moon texture by Solar System Scope, CC BY 4.0”.
  - Fetched at: 2026-10-17T15:23:31.608Z
  - Projection: equirectangular 2:1, 0 deg longitude at the centre of the image, +-180 at both edges; the near side reads dead centre.
  - Seam: measured at build time — mean luma delta between the first and last column 10.28, against 10.14 for two adjacent interior columns, i.e. no visible step at 0/360.
  - Transform: single 8192x4096 decode, downscaled to 2048x1024 then 1024x512; webp q82. No upscaling.

## Game icons (v2.1)

Five square 256x256 tiles. Three are the official App Store artwork resolved
through the iTunes lookup API at build time (a pinned artwork URL is used if the
API is unreachable); two are Commons vector logos rasterised here. Every tile is
encoded webp under 80 KB.

- **phigros** — `public/assets/games/phigros.webp` (256x256)
  - App Store lookup: https://itunes.apple.com/lookup?id=1454809109&country=us (trackId 1454809109, “Phigros”)
  - Artwork URL: https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ee/bf/12/eebf123e-f676-da25-6800-44c6f2d74629/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg
  - Owner: Pigeon Games (Xiamen Pigeon Games Network Co., Ltd.)
  - Scope: Official App Store artwork (c) Pigeon Games. Used nominatively to identify the game the author plays; trademarks remain with the publisher.
  - Fetched at: 2026-10-17T18:15:53.361Z
- **genshin** — `public/assets/games/genshin.webp` (256x256)
  - App Store lookup: https://itunes.apple.com/lookup?id=1517783697&country=us (trackId 1517783697, “Genshin Impact”)
  - Artwork URL: https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/5c/e2/13/5ce21317-a08a-24ac-cc5f-2b25a4d71fa6/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg
  - Owner: COGNOSPHERE PTE. LTD. (HoYoverse)
  - Scope: Official App Store artwork (c) HoYoverse / COGNOSPHERE. Used nominatively to identify the game the author plays; trademarks remain with the publisher.
  - Fetched at: 2026-10-17T18:15:53.543Z
- **zzz** — `public/assets/games/zzz.webp` (256x256)
  - App Store lookup: https://itunes.apple.com/lookup?id=1606356401&country=us (trackId 1606356401, “Zenless Zone Zero”)
  - Artwork URL: https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/2d/4a/fb/2d4afb82-bdb9-cc80-b5b7-d1d7f515b2ae/AppIcon-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg
  - Owner: COGNOSPHERE PTE. LTD. (HoYoverse)
  - Scope: Official App Store artwork (c) HoYoverse / COGNOSPHERE. Used nominatively to identify the game the author plays; trademarks remain with the publisher.
  - Fetched at: 2026-10-17T18:15:53.742Z
- **minecraft** — `public/assets/games/minecraft.webp` (256x256)
  - URL: https://upload.wikimedia.org/wikipedia/commons/d/d8/Minecraft_cube.svg
  - Commons page: https://commons.wikimedia.org/wiki/File:Minecraft_cube.svg
  - Owner: Mojang Studios / Microsoft (game); Commons file by Albin Olsson
  - Scope: Commons file released into the public domain (simple geometric logo, PD-textlogo). “Minecraft” and the grass-block icon are trademarks of Mojang Synergies AB; used nominatively, not relicensed.
  - Fetched at: 2026-10-17T18:15:54.314Z
  - Transform: rasterised from the Commons SVG at 1200 dpi, fitted to a transparent 256x256 canvas (contain)
- **delta** — `public/assets/games/delta.webp` (256x256)
  - URL: https://upload.wikimedia.org/wikipedia/commons/c/c6/Delta_Force_Logo.svg
  - Commons page: https://commons.wikimedia.org/wiki/File:Delta_Force_Logo.svg
  - Owner: Team Jade / TiMi Studio Group (Delta Force, 2024)
  - Scope: Commons file marked public domain (PD-textlogo: simple geometric wordmark). “DELTA FORCE” is a trademark of its owner; used nominatively, not relicensed.
  - Fetched at: 2026-10-17T18:15:54.514Z
  - Transform: wordmark recoloured #000000 -> #F2F6FF (emblem kept #0FF796) so the logo reads on the dark tile; rendered at 900 dpi, centred on a 256x256 rounded dark plate (#0d131b)

## Icon marks (v2.1)

- `public/assets/icons/icon-512.png` — 512x512, PNG, derived from `public/assets/avatar.png` (lanczos resample, slight saturation lift, corner vignette, flattened onto #070b12 so no alpha is shipped).
- `public/assets/icons/icon-192.png` — 192x192, PNG, derived from `public/assets/avatar.png` (lanczos resample, slight saturation lift, corner vignette, flattened onto #070b12 so no alpha is shipped).
- `public/assets/icons/apple-touch-icon.png` — 180x180, PNG, derived from `public/assets/avatar.png` (lanczos resample, slight saturation lift, corner vignette, flattened onto #070b12 so no alpha is shipped).
- `public/assets/apple-touch-icon.png` — 180x180, PNG, byte-identical alias of `public/assets/icons/apple-touch-icon.png`.

## Provided brand inputs

`public/assets/avatar.png` (640x640) and `public/assets/avatar.png` (256x256 face
crop) are **not** produced by this pipeline. The Lead derives both by hand from
`C:/Users/STMfan/Pictures/GithubAvatar.png` (1080x1080); the pipeline only reads
them, records them in `sources.json` and fails loudly if either is missing or
has a different size. That guard is deliberate: the v2 version of this script
regenerated `avatar.png` from `https://github.com/STMfan.png?size=320`, which
would silently throw away the Lead's crop. Do not add them back to `EXTERNAL`.

- `public/assets/avatar.png` — 640x640, 212.8 KB. Full illustration downscaled to 640x640. Source: C:/Users/STMfan/Pictures/GithubAvatar.png (1080x1080). Owner: STMfan. Personal artwork, © STMfan. Not relicensed under MIT.

## External assets

- **synaxis** — `synaxis.webp`
  - URL: https://raw.githubusercontent.com/STMfan/Synaxis-frontend/main/docs/images/derivative.png
  - Page: https://github.com/STMfan/Synaxis-frontend
  - Owner: STMfan (Synaxis client), MIT-licensed project
  - Scope: Screenshot of the Synaxis client used to illustrate the open source case; project code is MIT, third-party assets remain with their owners.
  - Transform: 4:5 crop 1272x1590 -> 600x750, webp q88
- **maibot** — `maibot.webp`
  - URL: https://raw.githubusercontent.com/Mai-with-u/.github/main/profile/assets/maimai2.png
  - Owner: Mai-with-u (MaiBot project) — mascot artwork
  - Scope: Mascot artwork © Mai-with-u and the original artist. Used with attribution to illustrate the MaiBot section; not relicensed under MIT.
  - Fetched at: 2026-10-17T18:15:49.074Z
  - Transform: contained on an 800x800 transparent canvas, webp q82
- **playlist-cover** — `playlist-cover.webp`
  - URL: https://i1.hdslb.com/bfs/archive/5c8ee48913bdb5b994901950ab9047ae170af189.jpg@672w_378h_1c.webp
  - Owner: Bilibili archive cover (Bilibili / original uploader)
  - Scope: Cover artwork © Bilibili and the original uploader. Used as the Bilibili playlist card; not relicensed under MIT.
  - Fetched at: 2026-10-17T18:15:51.701Z
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
- The four generated art plates, the composed OG card and the avatar-derived
  icon marks are project assets, © STMfan, distributed under the same terms as
  the site. The five character portraits are official third-party artwork (see
  below) and are **not** relicensed as original works.
- `avatar.png` and `avatar.png` are STMfan's own artwork (downscaled full
  illustration and a face crop of the local picture); the pipeline treats them as
  read-only inputs.
- `maibot.webp` is MaiBot mascot artwork © Mai-with-u and the original artist,
  used with attribution in the MaiBot section. It is **not** relicensed under
  MIT; replace it if upstream asks.
- `playlist-cover.webp` is a Bilibili archive cover © Bilibili and the original
  uploader, used as the playlist card. It is **not** relicensed under MIT.
- **Moon map** — CC BY 4.0, Solar System Scope. The attribution “Moon texture by
  Solar System Scope, CC BY 4.0” must stay visible wherever the 3D moon is shown
  (the site footer/credits carry it).
- **Game icons** — the App Store artwork belongs to Pigeon Games and HoYoverse /
  COGNOSPHERE; the two Commons vectors are marked public domain (PD-textlogo) but
  the underlying marks are trademarks of Mojang Synergies AB and Team Jade /
  TiMi Studio Group. All five are used nominatively to say which games the author
  plays. They are **not** relicensed under MIT; remove or replace any of them if
  the rights holder objects.
- **Character portraits** — official artwork, not fan art. Wriothesley and Varka
  are Genshin Impact characters (© HoYoverse / COGNOSPHERE); Von Lycaon is a
  Zenless Zone Zero character (© HoYoverse / COGNOSPHERE); Vyron and Gizmo are
  Delta Force operators (© Tencent / Team Jade). The HoYoverse plates are the
  official transparent renders as mirrored by the Fandom character galleries; the
  two Delta Force plates are official operator key art from the official Chinese
  operator page. All are used nominatively on a personal, non-commercial site and
  are **not** relicensed under MIT; remove or replace any of them if the rights
  holder objects.
- The vendored fonts are SIL Open Font License 1.1 and remain under that licence.

## Outputs

### Art

| File | Dimensions | Size | Source |
| --- | --- | --- | --- |
| `public/assets/art/atmosphere-haze.webp` | 1600x900 | 38.2 KB | `assets-src/atmosphere-haze.png` |
| `public/assets/art/dark-emulsion.webp` | 512x512 | 12.7 KB | `assets-src/dark-emulsion.png` |
| `public/assets/art/horizon.webp` | 1920x823 | 42.4 KB | `assets-src/horizon.png` |
| `public/assets/art/light-paper.webp` | 512x512 | 47.5 KB | `assets-src/light-paper.png` |
| `public/assets/art/moon-map-1k.webp` | 1024x512 | 128.8 KB | `https://upload.wikimedia.org/wikipedia/commons/d/d1/Solarsystemscope_texture_8k_moon.jpg (downscaled)` |
| `public/assets/art/moon-map.webp` | 2048x1024 | 516.8 KB | `https://upload.wikimedia.org/wikipedia/commons/d/d1/Solarsystemscope_texture_8k_moon.jpg (8192x4096 source)` |

### Games

| File | Dimensions | Size | Source |
| --- | --- | --- | --- |
| `public/assets/games/delta.webp` | 256x256 | 4.7 KB | `https://upload.wikimedia.org/wikipedia/commons/c/c6/Delta_Force_Logo.svg` |
| `public/assets/games/genshin.webp` | 256x256 | 14.8 KB | `https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/5c/e2/13/5ce21317-a08a-24ac-cc5f-2b25a4d71fa6/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg` |
| `public/assets/games/minecraft.webp` | 256x256 | 4.4 KB | `https://upload.wikimedia.org/wikipedia/commons/d/d8/Minecraft_cube.svg` |
| `public/assets/games/phigros.webp` | 256x256 | 24.5 KB | `https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ee/bf/12/eebf123e-f676-da25-6800-44c6f2d74629/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg` |
| `public/assets/games/zzz.webp` | 256x256 | 13.0 KB | `https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/2d/4a/fb/2d4afb82-bdb9-cc80-b5b7-d1d7f515b2ae/AppIcon-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg` |

### Cast

| File | Dimensions | Size | Source |
| --- | --- | --- | --- |
| `public/assets/cast/lycaon-face.webp` | 160x160 | 9.8 KB | `https://static.wikia.nocookie.net/zenless-zone-zero/images/5/5f/Agent_Von_Lycaon_Portrait.png/revision/latest?cb=20240707002420 (face crop 390x390 at 790,110)` |
| `public/assets/cast/lycaon.webp` | 851x1000 | 108.6 KB | `https://static.wikia.nocookie.net/zenless-zone-zero/images/5/5f/Agent_Von_Lycaon_Portrait.png/revision/latest?cb=20240707002420 (official transparent render)` |
| `public/assets/cast/varka-face.webp` | 160x160 | 11.5 KB | `https://static.wikia.nocookie.net/gensin-impact/images/3/32/Varka_Portrait.png/revision/latest?cb=20260301093455 (face crop 280x280 at 620,10)` |
| `public/assets/cast/varka.webp` | 784x1000 | 141.4 KB | `https://static.wikia.nocookie.net/gensin-impact/images/3/32/Varka_Portrait.png/revision/latest?cb=20260301093455 (official transparent render)` |
| `public/assets/cast/wriothesley-face.webp` | 160x160 | 9.9 KB | `https://static.wikia.nocookie.net/gensin-impact/images/8/85/Wriothesley_Portrait.png/revision/latest?cb=20260721170933 (face crop 280x280 at 603,28)` |
| `public/assets/cast/wriothesley.webp` | 894x999 | 121.0 KB | `https://static.wikia.nocookie.net/gensin-impact/images/8/85/Wriothesley_Portrait.png/revision/latest?cb=20260721170933 (official transparent render)` |

### Icons and brand marks

| File | Dimensions | Size | Source |
| --- | --- | --- | --- |
| `public/assets/apple-touch-icon.png` | 180x180 | 25.1 KB | `public/assets/avatar.png` |
| `public/assets/icons/apple-touch-icon.png` | 180x180 | 25.1 KB | `public/assets/avatar.png` |
| `public/assets/icons/icon-192.png` | 192x192 | 28.0 KB | `public/assets/avatar.png` |
| `public/assets/icons/icon-512.png` | 512x512 | 198.7 KB | `public/assets/avatar.png` |

### Other

| File | Dimensions | Size | Source |
| --- | --- | --- | --- |
| `public/assets/avatar.png` | 640x640 | 212.8 KB | `C:/Users/STMfan/Pictures/GithubAvatar.png (1080x1080)` |
| `public/assets/maibot.webp` | 800x800 | 57.8 KB | `https://raw.githubusercontent.com/Mai-with-u/.github/main/profile/assets/maimai2.png` |
| `public/assets/playlist-cover.webp` | 672x378 | 21.2 KB | `https://i1.hdslb.com/bfs/archive/5c8ee48913bdb5b994901950ab9047ae170af189.jpg@672w_378h_1c.webp` |
| `public/assets/share/og.png` | 1200x630 | 662.3 KB | `assets-src/horizon.png` + circular `avatar.png` + font outlines |

## How to regenerate

1. `bun install` (sharp is the only tool the pipeline needs beyond Node).
2. Make sure `assets-src/` still holds the ten generated plates. It is
   gitignored, so a fresh clone must restore it from the asset archive.
   `public/assets/avatar.png` must also exist: the icon marks and the OG avatar
   are derived from it. The character art does not live in `assets-src/`: the
   five official sources are downloaded into `assets-src/external/cast/` and the
   old generated `cast/*-raw.png` plates are gone.
3. Run `bun run assets`. The script re-downloads the remote sources when the
   network is available, otherwise it falls back to `assets-src/external/`.
   The Fandom images need browser-like request headers (Cloudflare sits in front
   of static.wikia.nocookie.net); the pipeline sends them for the cast step.
4. The script fails loudly if an output exceeds its byte budget, a dimension is
   wrong, a glyph is missing from the subset font, the lunar map shows a
   visible seam, a cast crop falls outside its source, or a transparent source
   comes back opaque. It does not silently upscale: the only enlargement is the
   horizon plate (1916x821 to 1920x823, +0.2%) and it is imperceptible. The
   character plates are normalised so the head is 300 px tall;
   the output frame height follows from the crop (wriothesley 999, varka 1000, lycaon 1000).

## Caveats

- `assets-src/` is gitignored. `public/assets/` is what ships; the originals
  need a separate backup if the pipeline is to be re-run after a fresh clone.
- `public/assets/sigil.svg` and the `art/sigil-*.webp` plates are v2 leftovers.
  They are still produced so the v2 build stays reproducible; the Lead removes
  them once `src/` stops referencing them.
- The two Delta Force portraits (Vyron, Gizmo) are **official key art**, not
  transparent renders: Delta Force publishes no standalone transparent operator
  art. Their backgrounds are photographic, so they are kept (feathered + dark
  vignette) rather than keyed. If the publisher ever ships transparent renders,
  swap the URL/crop in `CAST` and set `transparentSource: true, mask: false`.
- The cast sources are re-downloaded on every build. Fandom serves them through
  Cloudflare, so `CAST_HEADERS` sends a browser user agent plus an image
  `Accept`/`Referer`; if Fandom starts refusing the pipeline, the cached copies
  in `assets-src/external/cast/` keep the build green.
- `sources.json` records the real `fetchedAt` for external assets, so it changes
  when those files are re-downloaded; the image bytes themselves are stable for
  a given source revision.
- The Delta Force tile recolours the Commons wordmark from `#000000` to
  `#F2F6FF` and keeps the emblem at `#0FF796`; geometry is untouched. A black
  wordmark would be invisible on the site's dark theme.
- The Genshin tile is the artwork the App Store listing currently serves, which
  is the “6th Anniversary” app icon (the listing itself is named “Genshin Impact
  6th Anniversary”). It is official artwork, not a substitute logo; re-run
  `bun run assets` after the anniversary branding ends and the lookup will pick
  up the standard icon. The same applies to any future HoYoverse promo icon.

#!/usr/bin/env node
/**
 * STMfan · Sublunary (v2) — asset pipeline.
 *
 * Source art lives in assets-src/ (generated with GPT-Image via Codex on
 * 2026-10-17, plus three OFL fonts). Everything the site serves is written to
 * public/assets/. External images are downloaded, cached in assets-src/external/
 * and re-encoded. The social card is composed here from the horizon art.
 *
 * Run with:  bun run assets
 *
 * Design notes:
 * - Text on the OG card is rendered from TrueType outlines (see ttfTextPath)
 *   instead of <text>. libvips/librsvg on Windows resolves fonts through the
 *   OS font collection and ignores fontconfig/private fonts, so the only
 *   portable way to hit exact Bricolage Grotesque / Noto Serif SC / JetBrains
 *   Mono files is to convert the glyphs to SVG paths ourselves. The three
 *   fonts are small static instances vendored in assets-src/fonts (OFL 1.1).
 * - Every output is verified (dimensions, byte size) before the script exits.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SRC = path.join(ROOT, 'assets-src');
const OUT = path.join(ROOT, 'public', 'assets');
const CACHE = path.join(SRC, 'external');
const FONT_DIR = path.join(SRC, 'fonts');
const CAST_DIR = path.join(SRC, 'cast');
const DOCS = path.join(ROOT, 'docs');

const GENERATED_ON = '2026-10-17';
const GENERATED_BY = 'gpt-image';
const KB = 1024;

/* ------------------------------------------------------------------ *
 * Source art
 * ------------------------------------------------------------------ */

const ART = [
  {
    id: 'horizon',
    src: 'horizon.png',
    out: 'art/horizon.webp',
    width: 1920,
    height: 823,
    quality: 82,
  },
  {
    id: 'atmosphere-haze',
    src: 'atmosphere-haze.png',
    out: 'art/atmosphere-haze.webp',
    width: 1600,
    height: 900,
    quality: 84,
  },
  {
    id: 'light-paper',
    src: 'light-paper.png',
    out: 'art/light-paper.webp',
    width: 512,
    height: 512,
    quality: 82,
  },
  {
    id: 'dark-emulsion',
    src: 'dark-emulsion.png',
    out: 'art/dark-emulsion.webp',
    width: 512,
    height: 512,
    quality: 82,
  },
];

const PROMPTS = {
  horizon:
    'Ultrawide dusk horizon: a snow-dusted mountain ridge under a thin amber band of sunset light, layered blue haze over a dark city skyline with scattered warm windows, foreground conifers. Cinematic, no text.',
  'atmosphere-haze':
    'Near-black atmosphere plate: low blue mist drifting in from the lower left, a single warm amber light leak in the upper-right corner, fine grain. 16:9, no text.',
  'light-paper':
    'Cold-pressed white paper texture: fine fibres, tiny flecks, flat even light. Square, no text.',
  'dark-emulsion':
    'Aged dark film emulsion: near-black base, dust specks, fine scratches, faint umber edge burn. Square, no text.',
};

/* ------------------------------------------------------------------ *
 * v2.1: 3D moon map
 * ------------------------------------------------------------------ */

// Solar System Scope's 8k lunar albedo (CC BY 4.0), mirrored on Wikimedia
// Commons so the download is stable. Rendered down to 2048x1024 for the
// three.js sphere and 1024x512 for small viewports. The map is a plain
// equirectangular projection: 0 deg longitude at the centre of the image,
// +-180 deg at both vertical edges, so the near side (Mare Imbrium,
// Serenitatis, Tranquillitatis) sits in the middle of the frame.
const MOON_MAP = {
  id: 'moon-map',
  url: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Solarsystemscope_texture_8k_moon.jpg',
  cache: 'moon-sss-8k.jpg',
  page: 'https://commons.wikimedia.org/wiki/File:Solarsystemscope_texture_8k_moon.jpg',
  owner:
    'Solar System Scope (solarsystemscope.com/textures), CC BY 4.0; base lunar photography NASA / LRO',
  license:
    'CC BY 4.0 — Solar System Scope moon texture. Attribution: “Moon texture by Solar System Scope, CC BY 4.0”.',
  preferCache: true,
  variants: [
    { out: 'art/moon-map.webp', width: 2048, height: 1024, quality: 82, maxBytes: 900 * KB },
    { out: 'art/moon-map-1k.webp', width: 1024, height: 512, quality: 82, maxBytes: 350 * KB },
  ],
};

// A seamless equirectangular map must not show a step at the 0/360 longitude
// seam. The build measures the mean luma delta between the first and last
// column against the mean delta of two adjacent interior columns.
const SEAM_TOLERANCE = 4;

/* ------------------------------------------------------------------ *
 * v2.1: game icons / logos
 * ------------------------------------------------------------------ */

// App icons come from the official App Store artwork (iTunes lookup API), so
// the files are exactly what the publisher ships. They are square and opaque,
// which is why the two Commons vector logos are rendered on a matching tile
// rather than left floating.
const ITUNES_ARTWORK = {
  phigros:
    'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ee/bf/12/eebf123e-f676-da25-6800-44c6f2d74629/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg',
  genshin:
    'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/5c/e2/13/5ce21317-a08a-24ac-cc5f-2b25a4d71fa6/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg',
  zzz:
    'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/2d/4a/fb/2d4afb82-bdb9-cc80-b5b7-d1d7f515b2ae/AppIcon-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg',
};

const GAMES_ITUNES = [
  {
    id: 'phigros',
    out: 'games/phigros.webp',
    trackId: '1454809109',
    appName: 'Phigros',
    owner: 'Pigeon Games (Xiamen Pigeon Games Network Co., Ltd.)',
    license:
      'Official App Store artwork (c) Pigeon Games. Used nominatively to identify the game the author plays; trademarks remain with the publisher.',
    cache: 'phigros-512.jpg',
    quality: 88,
  },
  {
    id: 'genshin',
    out: 'games/genshin.webp',
    trackId: '1517783697',
    appName: 'Genshin Impact',
    owner: 'COGNOSPHERE PTE. LTD. (HoYoverse)',
    license:
      'Official App Store artwork (c) HoYoverse / COGNOSPHERE. Used nominatively to identify the game the author plays; trademarks remain with the publisher.',
    cache: 'genshin-512.jpg',
    quality: 88,
  },
  {
    id: 'zzz',
    out: 'games/zzz.webp',
    trackId: '1606356401',
    appName: 'Zenless Zone Zero',
    owner: 'COGNOSPHERE PTE. LTD. (HoYoverse)',
    license:
      'Official App Store artwork (c) HoYoverse / COGNOSPHERE. Used nominatively to identify the game the author plays; trademarks remain with the publisher.',
    cache: 'zzz-512.jpg',
    quality: 88,
  },
];

const GAMES_VECTOR = [
  {
    id: 'minecraft',
    out: 'games/minecraft.webp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Minecraft_cube.svg',
    cache: 'minecraft-cube.svg',
    page: 'https://commons.wikimedia.org/wiki/File:Minecraft_cube.svg',
    owner: 'Mojang Studios / Microsoft (game); Commons file by Albin Olsson',
    license:
      'Commons file released into the public domain (simple geometric logo, PD-textlogo). “Minecraft” and the grass-block icon are trademarks of Mojang Synergies AB; used nominatively, not relicensed.',
    transform:
      'rasterised from the Commons SVG at 1200 dpi, fitted to a transparent 256x256 canvas (contain)',
    quality: 92,
  },
  {
    id: 'delta',
    out: 'games/delta.webp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Delta_Force_Logo.svg',
    cache: 'delta-force-logo.svg',
    page: 'https://commons.wikimedia.org/wiki/File:Delta_Force_Logo.svg',
    owner: 'Team Jade / TiMi Studio Group (Delta Force, 2024)',
    license:
      'Commons file marked public domain (PD-textlogo: simple geometric wordmark). “DELTA FORCE” is a trademark of its owner; used nominatively, not relicensed.',
    transform:
      'wordmark recoloured #000000 -> #F2F6FF (emblem kept #0FF796) so the logo reads on the dark tile; rendered at 900 dpi, centred on a 256x256 rounded dark plate (#0d131b)',
    quality: 92,
  },
];

/* ------------------------------------------------------------------ *
 * v2.2: official character portraits (half-body)
 * ------------------------------------------------------------------ */

// The gallery now shows OFFICIAL artwork, not generated fan art. Every plate
// is cut from an official render or an official key art to a half-body
// portrait: head plus torso, cut just below the waist. `headPx` is the height
// of the head (hair/ear top to chin) in the SOURCE image, measured by hand;
// `CAST_FRAME.headPx` then scales the crop so the head is exactly 300 px tall
// in every output, which keeps the five portraits at the same visual weight
// when the gallery renders them at a fixed height.
//
// Two sources are transparent (the HoYoverse character renders). The two
// Delta Force operators have no published transparent render, so their
// official key art is used with a feathered alpha edge plus a dark vignette
// (`mask: true`): the figure is not keyed (the backgrounds are photographic,
// not flat) and the character is not redrawn.
const CAST = [
  {
    id: 'wriothesley',
    out: 'cast/wriothesley.webp',
    url: 'https://static.wikia.nocookie.net/gensin-impact/images/8/85/Wriothesley_Portrait.png/revision/latest?cb=20260721170933',
    page: 'https://genshin-impact.fandom.com/wiki/File:Wriothesley_Portrait.png',
    cache: 'cast/wriothesley-portrait.webp',
    owner: 'HoYoverse / COGNOSPHERE (Genshin Impact)',
    license:
      'Official Genshin Impact character render, (c) HoYoverse / COGNOSPHERE. Mirrored from the Fandom character gallery, which hosts the official game render. Used nominatively on a personal, non-commercial site; not relicensed under MIT.',
    sourceSize: '1009x1534',
    crop: { left: 395, top: 0, width: 614, height: 686 },
    headPx: 206,
    face: { left: 603, top: 28, width: 280, height: 280 },
    transparentSource: true,
    mask: false,
    cut: 'head + torso to the belt/upper thigh; the raised left fist and coat are cropped, the hair top is intact',
  },
  {
    id: 'varka',
    out: 'cast/varka.webp',
    url: 'https://static.wikia.nocookie.net/gensin-impact/images/3/32/Varka_Portrait.png/revision/latest?cb=20260301093455',
    page: 'https://genshin-impact.fandom.com/wiki/File:Varka_Portrait.png',
    cache: 'cast/varka-portrait.webp',
    owner: 'HoYoverse / COGNOSPHERE (Genshin Impact)',
    license:
      'Official Genshin Impact character render, (c) HoYoverse / COGNOSPHERE. Mirrored from the Fandom character gallery. Varka is playable (Knights of Favonius Grand Master), so no manga/group-art compromise was needed. Used nominatively; not relicensed under MIT.',
    sourceSize: '1376x1776',
    crop: { left: 496, top: 0, width: 528, height: 673 },
    headPx: 202,
    face: { left: 620, top: 10, width: 280, height: 280 },
    transparentSource: true,
    mask: false,
    cut: 'head + torso to the waist; the greatsword leaves the frame on both sides, the hair top is intact',
  },
  {
    id: 'lycaon',
    out: 'cast/lycaon.webp',
    url: 'https://static.wikia.nocookie.net/zenless-zone-zero/images/5/5f/Agent_Von_Lycaon_Portrait.png/revision/latest?cb=20240707002420',
    page: 'https://zenless-zone-zero.fandom.com/wiki/File:Agent_Von_Lycaon_Portrait.png',
    cache: 'cast/lycaon-portrait.webp',
    owner: 'HoYoverse / COGNOSPHERE (Zenless Zone Zero)',
    license:
      'Official Zenless Zone Zero agent render, (c) HoYoverse / COGNOSPHERE. Mirrored from the Fandom agent gallery. Used nominatively; not relicensed under MIT.',
    sourceSize: '1836x2480',
    crop: { left: 530, top: 14, width: 996, height: 1170 },
    headPx: 351,
    face: { left: 790, top: 110, width: 390, height: 390 },
    transparentSource: true,
    mask: false,
    cut: 'head + shoulders/chest of the official crouched render; the tail sweeps out of the left edge, the ears are intact',
  },
];


const CAST_FRAME = {
  headPx: 300, // head height in every output, keeps visual weight consistent
  quality: 88,
  alphaQuality: 92,
  maxBytes: 350 * KB,
  faceSize: 160,
  faceQuality: 88,
  faceMaxBytes: 40 * KB,
};

// Fandom serves its images through Cloudflare, which rejects the pipeline's
// plain user agent; a browser UA plus an image Accept/Referer pair is accepted.
const CAST_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  accept: 'image/webp,image/png,image/*;q=0.8,*/*;q=0.5',
  referer: 'https://genshin-impact.fandom.com/',
};

/* ------------------------------------------------------------------ *
 * v2.1: avatar-derived icon marks
 * ------------------------------------------------------------------ */

// Derived from public/assets/avatar.png (the Lead's 256 px face crop of the
// GitHub avatar). avatar.png is an input here and is never written.
// index.html points its apple-touch-icon at /assets/icons/apple-touch-icon.png,
// while the v2.1 asset list names /assets/apple-touch-icon.png; both paths are
// emitted from the same 180 px render so either reference resolves.
const ICONS = [
  { out: 'icons/icon-512.png', size: 512 },
  { out: 'icons/icon-192.png', size: 192 },
  { out: 'icons/apple-touch-icon.png', size: 180 },
  { out: 'apple-touch-icon.png', size: 180 },
];

const ICON_ALIAS_OF = { 'apple-touch-icon.png': 'icons/apple-touch-icon.png' };

const ICON_SOURCE = 'avatar.png';

/* ------------------------------------------------------------------ *
 * External assets
 * ------------------------------------------------------------------ */

const UA = 'stmfan-asset-forge/1.0 (+https://stmfan.tech/)';
const UA_TTF =
  'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.1) Gecko/2008070208 Firefox/3.0.1';

const EXTERNAL = [
  {
    id: 'synaxis',
    out: 'synaxis.webp',
    url: 'https://raw.githubusercontent.com/STMfan/Synaxis-frontend/main/src-tauri/icons/icon.png',
    cache: 'synaxis-icon.png',
    preferCache: true,
    owner: 'STMfan (Synaxis project)',
    license: 'Synaxis brand artwork, copyright STMfan. Used to identify the linked project; not relicensed under the website MIT license.',
    transform: 'original 512x512 app icon, lossless WebP; alpha and colours preserved',
    width: 512,
    height: 512,
  },
  {
    id: 'maibot',
    out: 'maibot.webp',
    url: 'https://raw.githubusercontent.com/Mai-with-u/.github/main/profile/assets/maimai2.png',
    cache: 'maimai2.png',
    owner: 'Mai-with-u (MaiBot project) — mascot artwork',
    license:
      'Mascot artwork © Mai-with-u and the original artist. Used with attribution to illustrate the MaiBot section; not relicensed under MIT.',
    transform: 'contained on an 800x800 transparent canvas, webp q82',
    width: 800,
    height: 800,
  },
  {
    id: 'playlist-cover',
    out: 'playlist-cover.webp',
    url: 'https://i1.hdslb.com/bfs/archive/5c8ee48913bdb5b994901950ab9047ae170af189.jpg@672w_378h_1c.webp',
    cache: 'playlist-cover.webp',
    owner: 'Bilibili archive cover (Bilibili / original uploader)',
    license:
      'Cover artwork © Bilibili and the original uploader. Used as the Bilibili playlist card; not relicensed under MIT.',
    transform: 'kept 672x378, webp q82',
    width: 672,
    height: 378,
  },
];

// Brand input owned outside this pipeline. The Lead derives it from
// C:\Users\STMfan\Pictures\GithubAvatar.png (1080x1080): avatar.png is the full
// illustration at 640 px, and the icon marks plus the OG avatar circle are built
// from it. The pipeline only READS it and verifies its dimensions; it never
// writes the file (an earlier v2 step regenerated avatar.png from the GitHub
// profile URL, which would throw away the Lead's downscale).
const PROVIDED = [
  {
    id: 'avatar',
    out: 'avatar.png',
    width: 640,
    height: 640,
    source: 'C:/Users/STMfan/Pictures/GithubAvatar.png (1080x1080)',
    owner: 'STMfan',
    license: 'Personal artwork, © STMfan. Not relicensed under MIT.',
    transform: 'Full illustration downscaled to 640x640',
  },
];

/* ------------------------------------------------------------------ *
 * Fonts (static TrueType instances, OFL 1.1)
 * ------------------------------------------------------------------ */

const FONT_FILES = {
  display: 'bricolage-grotesque-700.ttf',
  mono: 'jetbrains-mono-400-latin-subset.ttf',
  cjk: 'noto-serif-sc-500-slogan-subset.ttf',
};

const FONT_SOURCES = [
  {
    file: FONT_FILES.display,
    family: 'Bricolage Grotesque',
    weight: 700,
    subset: 'full latin (Google Fonts static instance)',
    url: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700&display=swap',
    license: 'SIL Open Font License 1.1',
  },
  {
    file: FONT_FILES.mono,
    family: 'JetBrains Mono',
    weight: 400,
    subset: 'latin subset, text=TO DECIPHER THE SUBLUNARY SPHERE. STMFAN.TECH 2026',
    url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&text=TO%20DECIPHER%20THE%20SUBLUNARY%20SPHERE.%20STMFAN.TECH%202026',
    license: 'SIL Open Font License 1.1',
  },
  {
    file: FONT_FILES.cjk,
    family: 'Noto Serif SC',
    weight: 500,
    subset: 'slogan subset, text=探月下，尘世万象',
    url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500&text=%E6%8E%A2%E6%9C%88%E4%B8%8B%EF%BC%8C%E5%B0%98%E4%B8%96%E4%B8%87%E8%B1%A1',
    license: 'SIL Open Font License 1.1',
  },
];

const OG_COPY = {
  wordmark: 'STMfan',
  slogan: '探月下，尘世万象',
  latin: 'TO DECIPHER THE SUBLUNARY SPHERE.',
  domain: 'STMFAN.TECH',
};

/* ------------------------------------------------------------------ *
 * Small utilities
 * ------------------------------------------------------------------ */

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const kb = (bytes) => `${(bytes / KB).toFixed(1)} KB`;
const fmtNum = (n) => Math.round(n * 100) / 100;

async function ensureDirs() {
  for (const dir of [
    OUT,
    path.join(OUT, 'art'),
    path.join(OUT, 'share'),
    path.join(OUT, 'games'),
    path.join(OUT, 'cast'),
    path.join(OUT, 'icons'),
    CACHE,
    CAST_DIR,
    DOCS,
  ]) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Woff/sfnt: parse TrueType outlines and emit SVG paths
 * ------------------------------------------------------------------ */

function u16(b, o) {
  return b.readUInt16BE(o);
}
function i16(b, o) {
  return b.readInt16BE(o);
}
function u32(b, o) {
  return b.readUInt32BE(o);
}

function parseFont(buf) {
  if (buf.readUInt32BE(0) !== 0x00010000) {
    throw new Error('unsupported font: not a TrueType sfnt (glyf outlines)');
  }
  const numTables = u16(buf, 4);
  const tables = {};
  for (let i = 0; i < numTables; i += 1) {
    const o = 12 + i * 16;
    tables[buf.toString('latin1', o, o + 4)] = {
      offset: u32(buf, o + 8),
      length: u32(buf, o + 12),
    };
  }
  if (!tables.head || !tables.maxp || !tables.hhea || !tables.hmtx || !tables.cmap || !tables.loca || !tables.glyf) {
    throw new Error('unsupported font: missing required tables');
  }

  const head = tables.head.offset;
  const unitsPerEm = u16(buf, head + 18);
  const indexToLocFormat = i16(buf, head + 50);
  const numGlyphs = u16(buf, tables.maxp.offset + 4);
  const numberOfHMetrics = u16(buf, tables.hhea.offset + 34);
  const hmtx = tables.hmtx.offset;

  const advances = new Array(numGlyphs);
  let lastAdvance = 0;
  for (let g = 0; g < numGlyphs; g += 1) {
    if (g < numberOfHMetrics) {
      lastAdvance = u16(buf, hmtx + g * 4);
    }
    advances[g] = lastAdvance;
  }

  // cmap: prefer full Unicode format 12 then Windows BMP format 4
  const cmap = tables.cmap.offset;
  const subCount = u16(buf, cmap + 2);
  let cmapChoice = null;
  for (let i = 0; i < subCount; i += 1) {
    const record = cmap + 4 + i * 8;
    const platform = u16(buf, record);
    const encoding = u16(buf, record + 2);
    const offset = cmap + u32(buf, record + 4);
    const format = u16(buf, offset);
    if (format !== 4 && format !== 12) continue;
    let score = 1;
    if (format === 12 && platform === 3 && encoding === 10) score = 5;
    else if (format === 12 && platform === 0) score = 4;
    else if (format === 4 && platform === 3 && encoding === 1) score = 3;
    else if (format === 4) score = 2;
    if (!cmapChoice || score > cmapChoice.score) {
      cmapChoice = { score, offset, format };
    }
  }
  if (!cmapChoice) throw new Error('unsupported font: no Unicode cmap');

  const glyphId = (codePoint) => {
    if (cmapChoice.format === 12) {
      const groups = u32(buf, cmapChoice.offset + 12);
      let lo = 0;
      let hi = groups - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const group = cmapChoice.offset + 16 + mid * 12;
        const start = u32(buf, group);
        const end = u32(buf, group + 4);
        const startGlyph = u32(buf, group + 8);
        if (codePoint < start) hi = mid - 1;
        else if (codePoint > end) lo = mid + 1;
        else return startGlyph + (codePoint - start);
      }
      return 0;
    }
    const segCountX2 = u16(buf, cmapChoice.offset + 6);
    const segCount = segCountX2 / 2;
    const endCodes = cmapChoice.offset + 14;
    const startCodes = endCodes + segCountX2 + 2;
    const idDeltas = startCodes + segCountX2;
    const idRangeOffsets = idDeltas + segCountX2;
    let segment = -1;
    for (let i = 0; i < segCount; i += 1) {
      if (u16(buf, endCodes + i * 2) >= codePoint) {
        segment = i;
        break;
      }
    }
    if (segment < 0) return 0;
    const start = u16(buf, startCodes + segment * 2);
    if (codePoint < start) return 0;
    const rangeOffset = u16(buf, idRangeOffsets + segment * 2);
    const delta = i16(buf, idDeltas + segment * 2);
    if (rangeOffset === 0) return (codePoint + delta) & 0xffff;
    const glyphAddress =
      idRangeOffsets + segment * 2 + rangeOffset + (codePoint - start) * 2;
    const raw = u16(buf, glyphAddress);
    if (raw === 0) return 0;
    return (raw + delta) & 0xffff;
  };

  const loca = tables.loca.offset;
  const glyf = tables.glyf.offset;
  const glyphOffset = (gid) =>
    indexToLocFormat === 0 ? u16(buf, loca + gid * 2) * 2 : u32(buf, loca + gid * 4);

  const F2Dot14 = (value) => value / 16384;

  function readSimpleGlyph(offset) {
    const contourCount = i16(buf, offset);
    const endPoints = [];
    for (let i = 0; i < contourCount; i += 1) {
      endPoints.push(u16(buf, offset + 10 + i * 2));
    }
    let p = offset + 10 + contourCount * 2;
    const instructionLength = u16(buf, p);
    p += 2 + instructionLength;

    const pointCount = contourCount === 0 ? 0 : endPoints[contourCount - 1] + 1;
    const flags = [];
    while (flags.length < pointCount) {
      const flag = buf[p];
      p += 1;
      flags.push(flag);
      if (flag & 0x08) {
        let repeat = buf[p];
        p += 1;
        while (repeat > 0) {
          flags.push(flag);
          repeat -= 1;
        }
      }
    }

    const xs = [];
    let x = 0;
    for (const flag of flags) {
      if (flag & 0x02) {
        const delta = buf[p];
        p += 1;
        x += flag & 0x10 ? delta : -delta;
      } else if (!(flag & 0x10)) {
        x += i16(buf, p);
        p += 2;
      }
      xs.push(x);
    }

    const ys = [];
    let y = 0;
    for (const flag of flags) {
      if (flag & 0x04) {
        const delta = buf[p];
        p += 1;
        y += flag & 0x20 ? delta : -delta;
      } else if (!(flag & 0x20)) {
        y += i16(buf, p);
        p += 2;
      }
      ys.push(y);
    }

    const contours = [];
    let start = 0;
    for (const end of endPoints) {
      const points = [];
      for (let i = start; i <= end; i += 1) {
        points.push({ x: xs[i], y: ys[i], on: Boolean(flags[i] & 0x01) });
      }
      contours.push(points);
      start = end + 1;
    }
    return contours;
  }

  function readCompositeGlyph(offset, depth) {
    if (depth > 6) return [];
    let p = offset + 10;
    const contours = [];
    let flags;
    do {
      flags = u16(buf, p);
      const componentGlyph = u16(buf, p + 2);
      p += 4;
      let dx = 0;
      let dy = 0;
      if (flags & 0x0001) {
        dx = i16(buf, p);
        dy = i16(buf, p + 2);
        p += 4;
      } else {
        dx = buf[p];
        dy = buf[p + 1];
        p += 2;
      }
      let a = 1;
      let b = 0;
      let c = 0;
      let d = 1;
      if (flags & 0x0008) {
        a = d = F2Dot14(i16(buf, p));
        p += 2;
      } else if (flags & 0x0040) {
        a = F2Dot14(i16(buf, p));
        d = F2Dot14(i16(buf, p + 2));
        p += 4;
      } else if (flags & 0x0080) {
        a = F2Dot14(i16(buf, p));
        b = F2Dot14(i16(buf, p + 2));
        c = F2Dot14(i16(buf, p + 4));
        d = F2Dot14(i16(buf, p + 6));
        p += 8;
      }
      const child = readGlyph(componentGlyph, depth + 1);
      for (const contour of child) {
        contours.push(
          contour.map((pt) => ({
            x: a * pt.x + c * pt.y + dx,
            y: b * pt.x + d * pt.y + dy,
            on: pt.on,
          })),
        );
      }
    } while (flags & 0x0020);
    return contours;
  }

  function readGlyph(gid, depth = 0) {
    if (gid < 0 || gid >= numGlyphs) return [];
    const start = glyphOffset(gid);
    const end = glyphOffset(gid + 1);
    if (end <= start) return [];
    const contourCount = i16(buf, glyf + start);
    if (contourCount >= 0) return readSimpleGlyph(glyf + start);
    return readCompositeGlyph(glyf + start, depth);
  }

  return { unitsPerEm, numGlyphs, advances, glyphId, readGlyph };
}

function contoursToPath(contours, scaleX, scaleY, tx, ty) {
  let d = '';
  for (const points of contours) {
    const n = points.length;
    if (!n) continue;
    const P = points.map((pt) => ({
      x: tx + pt.x * scaleX,
      y: ty - pt.y * scaleY,
      on: pt.on,
    }));
    let startIdx = -1;
    for (let i = 0; i < n; i += 1) {
      if (P[i].on) {
        startIdx = i;
        break;
      }
    }
    let seq;
    if (startIdx < 0) {
      // Every point is off-curve (degenerate but legal): synthesise an
      // on-curve start at the midpoint of the last and first points.
      seq = [
        {
          x: (P[0].x + P[n - 1].x) / 2,
          y: (P[0].y + P[n - 1].y) / 2,
          on: true,
        },
        ...P,
      ];
    } else {
      seq = [...P.slice(startIdx), ...P.slice(0, startIdx)];
    }
    seq = [...seq, seq[0]];
    d += `M${fmtNum(seq[0].x)} ${fmtNum(seq[0].y)}`;
    let i = 1;
    while (i < seq.length) {
      const cur = seq[i];
      if (cur.on) {
        d += `L${fmtNum(cur.x)} ${fmtNum(cur.y)}`;
        i += 1;
        continue;
      }
      const next = seq[i + 1];
      if (next.on) {
        d += `Q${fmtNum(cur.x)} ${fmtNum(cur.y)} ${fmtNum(next.x)} ${fmtNum(next.y)}`;
        i += 2;
      } else {
        d += `Q${fmtNum(cur.x)} ${fmtNum(cur.y)} ${fmtNum((cur.x + next.x) / 2)} ${fmtNum((cur.y + next.y) / 2)}`;
        i += 1;
      }
    }
    d += 'Z';
  }
  return d;
}

/**
 * Lay out a string as one SVG path.
 * `letterSpacing` is in em; it is added after every glyph including the last.
 */
function textPath(font, text, size, x, baseline, letterSpacing = 0) {
  const scale = size / font.unitsPerEm;
  let cursor = x;
  let d = '';
  for (const char of text) {
    const gid = font.glyphId(char.codePointAt(0));
    if (gid > 0) {
      d += contoursToPath(font.readGlyph(gid), scale, scale, cursor, baseline);
    }
    cursor += font.advances[gid] * scale + letterSpacing * size;
  }
  return d;
}

function measureText(font, text, size, letterSpacing = 0) {
  const scale = size / font.unitsPerEm;
  let width = 0;
  for (const char of text) {
    const gid = font.glyphId(char.codePointAt(0));
    width += font.advances[gid] * scale + letterSpacing * size;
  }
  return width;
}

function assertCoverage(font, label, strings) {
  for (const string of strings) {
    for (const char of string) {
      if (char === ' ') continue;
      const gid = font.glyphId(char.codePointAt(0));
      if (!gid) {
        throw new Error(
          `${label} is missing U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')} "${char}" — regenerate the subset font`,
        );
      }
    }
  }
}

/* ------------------------------------------------------------------ *
 * Font bootstrap (only if the vendored TTFs are absent)
 * ------------------------------------------------------------------ */

async function fetchText(url, userAgent) {
  const response = await fetch(url, {
    headers: { 'user-agent': userAgent },
    redirect: 'follow',
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
}

async function fetchGoogleTtf(url) {
  const css = await fetchText(url, UA_TTF);
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
  if (!match) throw new Error(`no font URL in Google Fonts CSS for ${url}`);
  const response = await fetch(match[1], {
    headers: { 'user-agent': UA_TTF },
    redirect: 'follow',
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${match[1]}`);
  return Buffer.from(await response.arrayBuffer());
}

async function ensureFonts() {
  for (const spec of FONT_SOURCES) {
    const file = path.join(FONT_DIR, spec.file);
    if (await exists(file)) continue;
    process.stdout.write(`font   ${spec.file} missing, downloading from Google Fonts\n`);
    const buf = await fetchGoogleTtf(spec.url);
    if (buf.readUInt32BE(0) !== 0x00010000) {
      throw new Error(`downloaded font is not a TrueType file: ${spec.file}`);
    }
    await fs.mkdir(FONT_DIR, { recursive: true });
    await fs.writeFile(file, buf);
  }
  const fonts = {};
  for (const [key, file] of Object.entries(FONT_FILES)) {
    fonts[key] = parseFont(await fs.readFile(path.join(FONT_DIR, file)));
  }
  assertCoverage(fonts.display, 'Bricolage Grotesque', [OG_COPY.wordmark]);
  assertCoverage(fonts.cjk, 'Noto Serif SC subset', [OG_COPY.slogan]);
  assertCoverage(fonts.mono, 'JetBrains Mono subset', [
    OG_COPY.latin,
    OG_COPY.domain,
  ]);
  return fonts;
}

/* ------------------------------------------------------------------ *
 * Download helper (cache first on failure)
 * ------------------------------------------------------------------ */

async function fetchAsset(spec) {
  // Cast sources live in their own cache directory; everything else in CACHE.
  const cachePath = path.join(spec.cacheDir ?? CACHE, spec.cache);
  await fs.mkdir(path.dirname(cachePath), { recursive: true });
  // Large sources (the 15 MB lunar texture) are pinned to the cache: they do
  // not change upstream, and re-downloading them on every build is wasteful.
  if (spec.preferCache && (await exists(cachePath))) {
    const buf = await fs.readFile(cachePath);
    const stat = await fs.stat(cachePath);
    return { buf, fetchedAt: stat.mtime.toISOString(), cached: true };
  }
  try {
    const response = await fetch(spec.url, {
      headers: { 'user-agent': UA, ...(spec.headers ?? {}) },
      redirect: 'follow',
      signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buf = Buffer.from(await response.arrayBuffer());
    if (!buf.length) throw new Error('empty response');
    await fs.writeFile(cachePath, buf);
    return { buf, fetchedAt: new Date().toISOString(), cached: false };
  } catch (error) {
    if (await exists(cachePath)) {
      const buf = await fs.readFile(cachePath);
      const stat = await fs.stat(cachePath);
      process.stdout.write(
        `warn   download failed for ${spec.id} (${error.message}); using cached copy\n`,
      );
      return { buf, fetchedAt: stat.mtime.toISOString(), cached: true };
    }
    throw new Error(
      `cannot download ${spec.url} (${error.message}) and no cache at ${rel(cachePath)}`,
    );
  }
}

/**
 * Resolve the current 512 px App Store artwork URL for a track id, falling
 * back to the URL recorded in this file when the lookup API is unreachable.
 */
async function resolveItunesArtwork(trackId, fallbackUrl) {
  try {
    const response = await fetch(
      `https://itunes.apple.com/lookup?id=${trackId}&country=us`,
      {
        headers: { 'user-agent': UA },
        signal: AbortSignal.timeout(30000),
      },
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    const artwork = json?.results?.[0]?.artworkUrl512;
    if (typeof artwork === 'string' && artwork.startsWith('https://')) {
      return { url: artwork, resolved: true };
    }
    throw new Error('no artworkUrl512 in lookup response');
  } catch (error) {
    process.stdout.write(
      `warn   iTunes lookup failed for ${trackId} (${error.message}); using pinned artwork URL\n`,
    );
    return { url: fallbackUrl, resolved: false };
  }
}

/* ------------------------------------------------------------------ *
 * Build: generated art
 * ------------------------------------------------------------------ */

const records = [];

async function record(relPath, width, height, source, expected) {
  const abs = path.join(OUT, relPath);
  const stat = await fs.stat(abs);
  const meta = await sharp(abs).metadata();
  const entry = {
    path: `public/assets/${relPath}`,
    width: meta.width,
    height: meta.height,
    bytes: stat.size,
    source,
    expected,
  };
  records.push(entry);
  return entry;
}

async function buildArt() {
  for (const art of ART) {
    const sourceAbs = path.join(SRC, art.src);
    if (!(await exists(sourceAbs))) {
      throw new Error(`missing source art: ${rel(sourceAbs)}`);
    }
    let pipeline = sharp(sourceAbs);
    if (art.crop) pipeline = pipeline.extract(art.crop);
    pipeline = pipeline.resize(art.width, art.height, {
      fit: 'cover',
      position: 'centre',
      kernel: 'lanczos3',
    });
    const outAbs = path.join(OUT, art.out);
    await pipeline
      .webp({ quality: art.quality, effort: 6, smartSubsample: true })
      .toFile(outAbs);
    const entry = await record(
      art.out,
      art.width,
      art.height,
      `assets-src/${art.src}`,
      { width: art.width, height: art.height, maxBytes: 400 * KB },
    );
    process.stdout.write(
      `art    ${entry.path} ${entry.width}x${entry.height} ${kb(entry.bytes)}\n`,
    );
  }
}

/* ------------------------------------------------------------------ *
 * Build: external assets
 * ------------------------------------------------------------------ */

async function buildExternal() {
  for (const spec of EXTERNAL) {
    if (spec.id === 'synaxis') {
      const { buf, fetchedAt } = await fetchAsset(spec);
      await sharp(buf).webp({ lossless: true, effort: 6 }).toFile(path.join(OUT, spec.out));
      const entry = await record(
        spec.out, spec.width, spec.height, spec.url,
        { width: spec.width, height: spec.height, maxBytes: 400 * KB },
      );
      spec.fetchedAt = fetchedAt;
      process.stdout.write(`ext    ${entry.path} ${entry.width}x${entry.height} ${kb(entry.bytes)}\n`);
      continue;
    }
    if (spec.id === 'maibot') {
      const { buf, fetchedAt } = await fetchAsset(spec);
      const art = await sharp(buf)
        .resize({ height: 720, fit: 'inside', kernel: 'lanczos3' })
        .png()
        .toBuffer({ resolveWithObject: true });
      const canvas = sharp({
        create: {
          width: 800,
          height: 800,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      });
      const outAbs = path.join(OUT, spec.out);
      await canvas
        .composite([
          {
            input: art.data,
            left: Math.round((800 - art.info.width) / 2),
            top: 40,
          },
        ])
        .webp({ quality: 82, effort: 6, smartSubsample: true })
        .toFile(outAbs);
      const entry = await record(
        spec.out,
        spec.width,
        spec.height,
        spec.url,
        { width: 800, height: 800, maxBytes: 400 * KB },
      );
      spec.fetchedAt = fetchedAt;
      process.stdout.write(
        `ext    ${entry.path} ${entry.width}x${entry.height} ${kb(entry.bytes)}\n`,
      );
      continue;
    }

    if (spec.id === 'playlist-cover') {
      const { buf, fetchedAt } = await fetchAsset(spec);
      const outAbs = path.join(OUT, spec.out);
      await sharp(buf)
        .resize(672, 378, { fit: 'cover', position: 'centre' })
        .webp({ quality: 82, effort: 6, smartSubsample: true })
        .toFile(outAbs);
      const entry = await record(
        spec.out,
        spec.width,
        spec.height,
        spec.url,
        { width: 672, height: 378, maxBytes: 400 * KB },
      );
      spec.fetchedAt = fetchedAt;
      process.stdout.write(
        `ext    ${entry.path} ${entry.width}x${entry.height} ${kb(entry.bytes)}\n`,
      );
    }
  }
}

/* ------------------------------------------------------------------ *
 * Brand inputs supplied by the Lead (verified, never written)
 * ------------------------------------------------------------------ */

async function checkProvided() {
  for (const spec of PROVIDED) {
    const abs = path.join(OUT, spec.out);
    if (!(await exists(abs))) {
      throw new Error(
        `missing provided brand input public/assets/${spec.out}. The Lead derives it from ${spec.source}; this pipeline must not generate or overwrite it.`,
      );
    }
    const stat = await fs.stat(abs);
    const meta = await sharp(abs).metadata();
    if (meta.width !== spec.width || meta.height !== spec.height) {
      throw new Error(
        `public/assets/${spec.out} is ${meta.width}x${meta.height}, expected ${spec.width}x${spec.height} — the Lead's crop changed; update PROVIDED before building`,
      );
    }
    records.push({
      path: `public/assets/${spec.out}`,
      width: meta.width,
      height: meta.height,
      bytes: stat.size,
      source: spec.source,
      expected: { width: spec.width, height: spec.height, maxBytes: Infinity },
      provided: true,
    });
    spec.bytes = stat.size;
    process.stdout.write(
      `input  ${`public/assets/${spec.out}`} ${meta.width}x${meta.height} ${kb(stat.size)} (supplied, not written)\n`,
    );
  }
}

/* ------------------------------------------------------------------ *
 * Build: v2.1 lunar albedo map (three.js sphere)
 * ------------------------------------------------------------------ */

/** Mean absolute luma difference between two columns of a raw RGB buffer. */
function columnDelta(data, width, height, channels, xa, xb) {
  let sum = 0;
  for (let y = 0; y < height; y += 1) {
    const ia = (y * width + xa) * channels;
    const ib = (y * width + xb) * channels;
    for (let c = 0; c < 3; c += 1) sum += Math.abs(data[ia + c] - data[ib + c]);
  }
  return sum / (height * 3);
}

async function buildMoonMap() {
  const { buf, fetchedAt } = await fetchAsset(MOON_MAP);
  const outAbsFirst = path.join(OUT, MOON_MAP.variants[0].out);

  // One decode feeds both derivatives; the 8k source is only ever downscaled.
  const meta = await sharp(buf).metadata();
  if (!meta.width || !meta.height) throw new Error('moon map: unreadable source');
  if (Math.abs(meta.width / meta.height - 2) > 0.02) {
    throw new Error(
      `moon map source ${meta.width}x${meta.height} is not a 2:1 equirectangular image`,
    );
  }

  const { data, info } = await sharp(buf)
    .resize(MOON_MAP.variants[0].width, MOON_MAP.variants[0].height, {
      fit: 'fill',
      kernel: 'lanczos3',
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const seam = columnDelta(data, info.width, info.height, info.channels, 0, info.width - 1);
  const interior = columnDelta(
    data,
    info.width,
    info.height,
    info.channels,
    Math.floor(info.width / 2) - 1,
    Math.floor(info.width / 2),
  );
  if (seam > interior * 1.6 + SEAM_TOLERANCE) {
    throw new Error(
      `moon map seam is visible: mean column delta ${seam.toFixed(2)} vs interior ${interior.toFixed(2)}`,
    );
  }

  // The 1k variant is resampled from the same 2048x1024 raster, so both files
  // share one tone curve and the smaller one stays sharp.
  const big = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 3 },
  })
    .webp({
      quality: MOON_MAP.variants[0].quality,
      effort: 6,
      smartSubsample: true,
    })
    .toBuffer();
  await fs.writeFile(outAbsFirst, big);

  const entry = await record(
    MOON_MAP.variants[0].out,
    MOON_MAP.variants[0].width,
    MOON_MAP.variants[0].height,
    `${MOON_MAP.url} (${meta.width}x${meta.height} source)`,
    {
      width: MOON_MAP.variants[0].width,
      height: MOON_MAP.variants[0].height,
      maxBytes: MOON_MAP.variants[0].maxBytes,
    },
  );
  MOON_MAP.fetchedAt = fetchedAt;
  MOON_MAP.sourceSize = `${meta.width}x${meta.height}`;
  MOON_MAP.seam = { seam: Number(seam.toFixed(2)), interior: Number(interior.toFixed(2)) };
  process.stdout.write(
    `moon   ${entry.path} ${entry.width}x${entry.height} ${kb(entry.bytes)} ` +
      `(seam ${seam.toFixed(2)} vs interior ${interior.toFixed(2)})\n`,
  );

  for (const variant of MOON_MAP.variants.slice(1)) {
    const out = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 3 },
    })
      .resize(variant.width, variant.height, { fit: 'fill', kernel: 'lanczos3' })
      .webp({ quality: variant.quality, effort: 6, smartSubsample: true })
      .toBuffer();
    await fs.writeFile(path.join(OUT, variant.out), out);
    const small = await record(
      variant.out,
      variant.width,
      variant.height,
      `${MOON_MAP.url} (downscaled)`,
      { width: variant.width, height: variant.height, maxBytes: variant.maxBytes },
    );
    process.stdout.write(
      `moon   ${small.path} ${small.width}x${small.height} ${kb(small.bytes)}\n`,
    );
  }
}

/* ------------------------------------------------------------------ *
 * Build: v2.1 game icons
 * ------------------------------------------------------------------ */

const GAME_TILE = {
  width: 256,
  height: 256,
  plate: '#0d131b',
  plateEdge: '#2a3646',
  radius: 52,
  maxBytes: 80 * KB,
};

function darkTileSvg(width, height, radius) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" rx="${radius}" fill="${GAME_TILE.plate}"/>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${radius - 1}" fill="none" stroke="${GAME_TILE.plateEdge}" stroke-width="1"/>
</svg>`;
}

async function buildGames() {
  for (const spec of GAMES_ITUNES) {
    const { url, resolved } = await resolveItunesArtwork(
      spec.trackId,
      ITUNES_ARTWORK[spec.id],
    );
    const fetched = await fetchAsset({ ...spec, url });
    const outAbs = path.join(OUT, spec.out);
    const webp = await sharp(fetched.buf)
      .resize(GAME_TILE.width, GAME_TILE.height, {
        fit: 'cover',
        position: 'centre',
        kernel: 'lanczos3',
      })
      .webp({ quality: spec.quality, effort: 6, smartSubsample: true })
      .toBuffer();
    await fs.writeFile(outAbs, webp);
    const entry = await record(
      spec.out,
      GAME_TILE.width,
      GAME_TILE.height,
      url,
      { width: GAME_TILE.width, height: GAME_TILE.height, maxBytes: GAME_TILE.maxBytes },
    );
    Object.assign(spec, {
      resolvedUrl: url,
      fetchedAt: fetched.fetchedAt,
      lookupResolved: resolved,
      appStoreLookup: `https://itunes.apple.com/lookup?id=${spec.trackId}&country=us`,
    });
    process.stdout.write(
      `game   ${entry.path} ${entry.width}x${entry.height} ${kb(entry.bytes)} ` +
        `(${spec.appName}, App Store artwork${resolved ? '' : ', pinned URL'})\n`,
    );
  }

  for (const spec of GAMES_VECTOR) {
    const fetched = await fetchAsset(spec);
    let svg = fetched.buf.toString('utf8');
    if (spec.id === 'delta') {
      // The Commons wordmark is solid black, which vanishes on a dark tile.
      // Only the fill is changed; the geometry is untouched.
      svg = svg.replace(/#000000/gi, '#F2F6FF');
    }
    if (spec.id === 'minecraft') {
      const art = await sharp(Buffer.from(svg), { density: 1200 })
        .resize(GAME_TILE.width, GAME_TILE.height, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
          kernel: 'lanczos3',
        })
        .png()
        .toBuffer();
      await fs.writeFile(
        path.join(OUT, spec.out),
        await sharp(art)
          .webp({ quality: spec.quality, alphaQuality: 95, effort: 6 })
          .toBuffer(),
      );
    } else {
      const art = await sharp(Buffer.from(svg), { density: 900 })
        .resize({ width: 196, fit: 'inside', kernel: 'lanczos3' })
        .png()
        .toBuffer({ resolveWithObject: true });
      await fs.writeFile(
        path.join(OUT, spec.out),
        await sharp(Buffer.from(darkTileSvg(GAME_TILE.width, GAME_TILE.height, GAME_TILE.radius)))
          .composite([
            {
              input: art.data,
              left: Math.round((GAME_TILE.width - art.info.width) / 2),
              top: Math.round((GAME_TILE.height - art.info.height) / 2),
            },
          ])
          .webp({ quality: spec.quality, alphaQuality: 95, effort: 6 })
          .toBuffer(),
      );
    }
    const entry = await record(
      spec.out,
      GAME_TILE.width,
      GAME_TILE.height,
      spec.url,
      { width: GAME_TILE.width, height: GAME_TILE.height, maxBytes: GAME_TILE.maxBytes },
    );
    spec.fetchedAt = fetched.fetchedAt;
    process.stdout.write(
      `game   ${entry.path} ${entry.width}x${entry.height} ${kb(entry.bytes)} (${spec.id}, vector)\n`,
    );
  }
}

/* ------------------------------------------------------------------ *
 * Build: v2.2 official character portraits (half-body)
 * ------------------------------------------------------------------ */

/**
 * Give a key-art plate a feathered alpha edge. The two Delta Force operators
 * have no published transparent render, so their official key art keeps its
 * photographic background: a radial alpha ramp dissolves the rectangle into
 * the page (head and shoulders stay fully opaque) and a matching dark vignette
 * pulls the leftover backdrop towards the site's near-black. Nothing is keyed:
 * a photographic background cannot be keyed cleanly without eating the figure.
 */
async function featherKeyArt(png, width, height) {
  const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs><radialGradient id="m" cx="50%" cy="38%" r="64%">
    <stop offset="0.52" stop-color="#fff" stop-opacity="1"/>
    <stop offset="0.78" stop-color="#fff" stop-opacity="0.85"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient></defs>
  <rect width="${width}" height="${height}" fill="url(#m)"/>
</svg>`;
  const vignette = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs><radialGradient id="v" cx="50%" cy="38%" r="66%">
    <stop offset="0.45" stop-color="#04060b" stop-opacity="0"/>
    <stop offset="0.8" stop-color="#04060b" stop-opacity="0.42"/>
    <stop offset="1" stop-color="#04060b" stop-opacity="0.8"/>
  </radialGradient></defs>
  <rect width="${width}" height="${height}" fill="url(#v)"/>
</svg>`;
  return sharp(png)
    .ensureAlpha()
    .composite([
      { input: Buffer.from(vignette) },
      // dest-in last: alpha = vignette alpha x mask alpha, so the corners
      // really do reach 0 instead of inheriting the vignette's own opacity.
      { input: Buffer.from(mask), blend: 'dest-in' },
    ])
    .png()
    .toBuffer();
}

async function buildCast() {
  for (const spec of CAST) {
    const { buf, fetchedAt } = await fetchAsset({
      ...spec,
      headers: CAST_HEADERS,
    });
    const meta = await sharp(buf).metadata();
    if (!meta.width || !meta.height) throw new Error(`${spec.id}: unreadable source`);
    for (const [label, box] of [
      ['crop', spec.crop],
      ['face', spec.face],
    ]) {
      if (
        box.left < 0 ||
        box.top < 0 ||
        box.left + box.width > meta.width ||
        box.top + box.height > meta.height
      ) {
        throw new Error(
          `${spec.id}: ${label} ${box.width}x${box.height} at ${box.left},${box.top} ` +
            `falls outside the ${meta.width}x${meta.height} source — the upstream render changed`,
        );
      }
    }
    if (spec.transparentSource && !meta.hasAlpha) {
      throw new Error(
        `${spec.id}: expected an official transparent render, but ${spec.url} has no alpha channel`,
      );
    }

    // One scale for every character: the head is 300 px tall in the output, so
    // the five portraits carry the same visual weight at a fixed gallery height.
    const scale = CAST_FRAME.headPx / spec.headPx;
    const width = Math.round(spec.crop.width * scale);
    const height = Math.round(spec.crop.height * scale);
    if (Math.max(width, height) > 1100) {
      throw new Error(`${spec.id}: ${width}x${height} exceeds the 1100 px long edge`);
    }
    let art = await sharp(buf)
      .extract(spec.crop)
      .resize(width, height, { fit: 'fill', kernel: 'lanczos3' })
      .png()
      .toBuffer();
    if (spec.mask) art = await featherKeyArt(art, width, height);
    const webp = await sharp(art)
      .webp({
        quality: CAST_FRAME.quality,
        alphaQuality: CAST_FRAME.alphaQuality,
        effort: 6,
        smartSubsample: true,
      })
      .toBuffer();
    await fs.writeFile(path.join(OUT, spec.out), webp);

    const face = await sharp(buf)
      .extract(spec.face)
      .resize(CAST_FRAME.faceSize, CAST_FRAME.faceSize, {
        fit: 'cover',
        position: 'centre',
        kernel: 'lanczos3',
      })
      .webp({
        quality: CAST_FRAME.faceQuality,
        alphaQuality: CAST_FRAME.alphaQuality,
        effort: 6,
      })
      .toBuffer();
    const faceOut = `cast/${spec.id}-face.webp`;
    await fs.writeFile(path.join(OUT, faceOut), face);

    const entry = await record(
      spec.out,
      width,
      height,
      `${spec.url} (${spec.transparentSource ? 'official transparent render' : 'official key art, feathered'})`,
      { width, height, maxBytes: CAST_FRAME.maxBytes },
    );
    const faceEntry = await record(
      faceOut,
      CAST_FRAME.faceSize,
      CAST_FRAME.faceSize,
      `${spec.url} (face crop ${spec.face.width}x${spec.face.height} at ${spec.face.left},${spec.face.top})`,
      {
        width: CAST_FRAME.faceSize,
        height: CAST_FRAME.faceSize,
        maxBytes: CAST_FRAME.faceMaxBytes,
      },
    );
    Object.assign(spec, {
      width,
      height,
      bytes: webp.length,
      faceBytes: face.length,
      fetchedAt,
      sourceFormat: meta.format,
      headPxOut: Math.round(spec.headPx * scale),
    });
    process.stdout.write(
      `cast   ${entry.path} ${width}x${height} ${kb(entry.bytes)} ` +
        `(${spec.transparentSource ? 'transparent' : 'feathered key art'}, head ${spec.headPxOut}px)\n`,
    );
    process.stdout.write(
      `face   ${faceEntry.path} ${CAST_FRAME.faceSize}x${CAST_FRAME.faceSize} ${kb(faceEntry.bytes)}\n`,
    );
  }
}

/* ------------------------------------------------------------------ *
 * Build: v2.1 icon marks (from avatar.png)
 * ------------------------------------------------------------------ */

function vignetteSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs><radialGradient id="v" cx="50%" cy="46%" r="62%">
    <stop offset=".55" stop-color="#04060b" stop-opacity="0"/>
    <stop offset="1" stop-color="#04060b" stop-opacity=".55"/>
  </radialGradient></defs>
  <rect width="${size}" height="${size}" fill="url(#v)"/>
</svg>`;
}

async function buildIcons() {
  const logoAbs = path.join(OUT, ICON_SOURCE);
  if (!(await exists(logoAbs))) {
    throw new Error(
      `missing public/assets/${ICON_SOURCE} — the icon marks are derived from it; restore the avatar crop first`,
    );
  }
  for (const icon of ICONS) {
    const aliasOf = ICON_ALIAS_OF[icon.out];
    let png;
    if (aliasOf) {
      // Same render, second path: index.html asks for icons/apple-touch-icon.png
      // while the task list names the root file.
      png = await fs.readFile(path.join(OUT, aliasOf));
    } else {
      const base = await sharp(logoAbs)
        .resize(icon.size, icon.size, {
          fit: 'cover',
          position: 'centre',
          kernel: 'lanczos3',
        })
        .modulate({ saturation: 1.02 })
        .sharpen({ sigma: icon.size > 256 ? 0.6 : 0.4 })
        .toBuffer();
      png = await sharp(base)
        .composite([{ input: Buffer.from(vignetteSvg(icon.size)) }])
        .flatten({ background: '#070b12' })
        .png({ compressionLevel: 9, adaptiveFiltering: true, palette: true, quality: 94, dither: 0.8 })
        .toBuffer();
    }
    await fs.writeFile(path.join(OUT, icon.out), png);
    const entry = await record(icon.out, icon.size, icon.size, `public/assets/${ICON_SOURCE}`, {
      width: icon.size,
      height: icon.size,
      maxBytes: 260 * KB,
    });
    process.stdout.write(
      `icon   ${entry.path} ${entry.width}x${entry.height} ${kb(entry.bytes)}` +
        `${aliasOf ? ` (alias of ${aliasOf})` : ''}\n`,
    );
  }
}

/* ------------------------------------------------------------------ *
 * Build: OG social card
 * ------------------------------------------------------------------ */

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const ACCENT = '#f2a24b';
const INK = '#f5f7fb';
// Circular avatar mark in the top-right corner, inside the dark sky band.
const OG_AVATAR = { cx: 1080, cy: 170, r: 76 };

function ogScrim() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
  <defs>
    <linearGradient id="scrim-x" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#04060b" stop-opacity=".90"/>
      <stop offset=".32" stop-color="#04060b" stop-opacity=".74"/>
      <stop offset=".55" stop-color="#04060b" stop-opacity=".30"/>
      <stop offset=".80" stop-color="#04060b" stop-opacity=".06"/>
      <stop offset="1" stop-color="#04060b" stop-opacity=".20"/>
    </linearGradient>
    <linearGradient id="scrim-y" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#04060b" stop-opacity=".50"/>
      <stop offset=".45" stop-color="#04060b" stop-opacity="0"/>
      <stop offset="1" stop-color="#04060b" stop-opacity=".60"/>
    </linearGradient>
  </defs>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#scrim-x)"/>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#scrim-y)"/>
</svg>`;
}

/** Halo + hairline rings behind/around the circular avatar mark. */
function ogAvatarLayer() {
  const { cx, cy, r } = OG_AVATAR;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
  <defs>
    <radialGradient id="halo" cx="${cx}" cy="${cy}" r="${r * 2.2}" gradientUnits="userSpaceOnUse">
      <stop offset=".45" stop-color="#04060b" stop-opacity=".62"/>
      <stop offset="1" stop-color="#04060b" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${r * 2.2}" fill="url(#halo)"/>
  <circle cx="${cx}" cy="${cy}" r="${r + 8}" fill="none" stroke="#eef1f7" stroke-opacity=".14" stroke-width="1"/>
  <circle cx="${cx}" cy="${cy}" r="${r + 6.5}" fill="none" stroke="${ACCENT}" stroke-opacity=".55" stroke-width="1.4"/>
</svg>`;
}

/** The logo crop, masked to a circle for the card. */
async function ogAvatarCircle() {
  const logoAbs = path.join(OUT, ICON_SOURCE);
  if (!(await exists(logoAbs))) {
    throw new Error(
      `missing public/assets/${ICON_SOURCE} — the OG avatar mark is derived from it`,
    );
  }
  const d = OG_AVATAR.r * 2;
  const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}"><circle cx="${OG_AVATAR.r}" cy="${OG_AVATAR.r}" r="${OG_AVATAR.r}" fill="#fff"/></svg>`;
  return sharp(logoAbs)
    .resize(d, d, { fit: 'cover', position: 'centre', kernel: 'lanczos3' })
    .ensureAlpha()
    .composite([{ input: Buffer.from(mask), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

function ogText(fonts) {
  const wordmarkSize = 130;
  const wordmarkX = 82;
  const wordmarkBaseline = 306;
  const sloganSize = 46;
  const sloganBaseline = 386;
  const latinSize = 19;
  const latinBaseline = 434;
  const domainSize = 14;
  const domainBaseline = 566;

  const wordmark = textPath(
    fonts.display,
    OG_COPY.wordmark,
    wordmarkSize,
    wordmarkX,
    wordmarkBaseline,
    -0.032,
  );
  const slogan = textPath(
    fonts.cjk,
    OG_COPY.slogan,
    sloganSize,
    84,
    sloganBaseline,
    0.03,
  );
  const latin = textPath(fonts.mono, OG_COPY.latin, latinSize, 86, latinBaseline, 0.14);
  const domain = textPath(
    fonts.mono,
    OG_COPY.domain,
    domainSize,
    84,
    domainBaseline,
    0.26,
  );

  // Measure once so the composition can be sanity-checked in the log.
  const wordmarkWidth = measureText(
    fonts.display,
    OG_COPY.wordmark,
    wordmarkSize,
    -0.032,
  );
  const sloganWidth = measureText(fonts.cjk, OG_COPY.slogan, sloganSize, 0.03);
  const latinWidth = measureText(fonts.mono, OG_COPY.latin, latinSize, 0.14);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
  <rect x="84" y="196" width="72" height="3" fill="${ACCENT}"/>
  <path d="${wordmark}" fill="${INK}"/>
  <path d="${slogan}" fill="#dfe5f1"/>
  <path d="${latin}" fill="${ACCENT}"/>
  <path d="${domain}" fill="#eef1f7" fill-opacity=".52"/>
  <rect x="84" y="590" width="1032" height="1" fill="#eef1f7" fill-opacity=".14"/>
</svg>`;
  return { svg, wordmarkWidth, sloganWidth, latinWidth };
}

async function buildOg(fonts) {
  const base = await sharp(path.join(SRC, 'horizon.png'))
    .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'centre' })
    .toBuffer();

  const text = ogText(fonts);
  if (text.wordmarkWidth > 760 || text.sloganWidth > 900 || text.latinWidth > 760) {
    throw new Error('OG copy does not fit the 1200x630 card');
  }
  const avatar = await ogAvatarCircle();

  const composed = sharp(base)
    .composite([
      { input: Buffer.from(ogScrim()) },
      { input: Buffer.from(ogAvatarLayer()) },
      {
        input: avatar,
        left: OG_AVATAR.cx - OG_AVATAR.r,
        top: OG_AVATAR.cy - OG_AVATAR.r,
      },
      { input: Buffer.from(text.svg) },
    ])
    .flatten({ background: '#04060b' });

  const outAbs = path.join(OUT, 'share', 'og.png');
  let png = await composed
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
  if (png.length > 690 * KB) {
    // Keep the card under 700 KB even on a different libvips build.
    png = await sharp(png)
      .png({ compressionLevel: 9, palette: true, quality: 94, dither: 1 })
      .toBuffer();
  }
  if (png.length > 700 * KB) {
    throw new Error(`og.png is ${kb(png.length)} (limit 700 KB)`);
  }
  await fs.writeFile(outAbs, png);

  const entry = await record('share/og.png', OG_WIDTH, OG_HEIGHT, 'assets-src/horizon.png + avatar.png + fonts', {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    maxBytes: 700 * KB,
  });
  process.stdout.write(
    `og     ${entry.path} ${entry.width}x${entry.height} ${kb(entry.bytes)} (wordmark ${fmtNum(text.wordmarkWidth)}px, slogan ${fmtNum(text.sloganWidth)}px)\n`,
  );
}

/* ------------------------------------------------------------------ *
 * Provenance
 * ------------------------------------------------------------------ */

async function writeSources() {
  const generated = ART.map((art) => ({
    id: art.id,
    output: `public/assets/${art.out}`,
    source: `assets-src/${art.src}`,
    model: GENERATED_BY,
    date: GENERATED_ON,
    promptSummary: PROMPTS[art.id],
    transform: art.crop
      ? `extract ${art.crop.width}x${art.crop.height} at ${art.crop.left},${art.crop.top}; resize ${art.width}x${art.height}; webp q${art.quality}`
      : `resize ${art.width}x${art.height}; webp q${art.quality}`,
  }));

  const cast = CAST.map((spec) => ({
    id: `cast-${spec.id}`,
    output: [`public/assets/${spec.out}`, `public/assets/cast/${spec.id}-face.webp`],
    url: spec.url,
    page: spec.page,
    owner: spec.owner,
    license: spec.license,
    fetchedAt: spec.fetchedAt,
    official: true,
    sourceSize: spec.sourceSize,
    sourceTransparent: spec.transparentSource,
    alpha: true,
    mask:
      spec.mask === true
        ? 'official key art; feathered radial alpha + dark vignette (background retained, not keyed)'
        : 'none (source is already transparent)',
    headPx: spec.headPx,
    headPxOut: spec.headPxOut,
    crop: `${spec.crop.width}x${spec.crop.height} at ${spec.crop.left},${spec.crop.top}`,
    faceCrop: `${spec.face.width}x${spec.face.height} at ${spec.face.left},${spec.face.top}`,
    cut: spec.cut,
    transform:
      `crop ${spec.crop.width}x${spec.crop.height} at ${spec.crop.left},${spec.crop.top}, ` +
      `scale ${(CAST_FRAME.headPx / spec.headPx).toFixed(3)}x to ${spec.width}x${spec.height} ` +
      `(head ${spec.headPxOut}px), webp q${CAST_FRAME.quality} with alpha; ` +
      `face crop ${spec.face.width}x${spec.face.height} to ${CAST_FRAME.faceSize}x${CAST_FRAME.faceSize} webp q${CAST_FRAME.faceQuality}`,
    note:
      'Official artwork, not generated; not relicensed under MIT. Do not replace with fan art or AI art.',
  }));

  const external = [
    ...EXTERNAL.map((spec) => ({
      id: spec.id,
      output: `public/assets/${spec.out}`,
      url: spec.url,
      owner: spec.owner,
      license: spec.license,
      fetchedAt: spec.fetchedAt,
      transform: spec.transform,
    })),
    {
      id: MOON_MAP.id,
      output: MOON_MAP.variants.map((variant) => `public/assets/${variant.out}`),
      url: MOON_MAP.url,
      page: MOON_MAP.page,
      owner: MOON_MAP.owner,
      license: MOON_MAP.license,
      fetchedAt: MOON_MAP.fetchedAt,
      sourceSize: MOON_MAP.sourceSize,
      projection: 'equirectangular (2:1), 0 deg longitude at image centre',
      seamCheck: MOON_MAP.seam,
      transform: 'downscaled once to 2048x1024, then 1024x512; webp q82 (no upscaling)',
    },
    ...GAMES_ITUNES.map((spec) => ({
      id: `game-${spec.id}`,
      output: `public/assets/${spec.out}`,
      url: spec.resolvedUrl,
      appStoreLookup: spec.appStoreLookup,
      appName: spec.appName,
      owner: spec.owner,
      license: spec.license,
      fetchedAt: spec.fetchedAt,
      transform: '512 px App Store artwork, cover-cropped to 256x256, webp q' + spec.quality,
    })),
    ...GAMES_VECTOR.map((spec) => ({
      id: `game-${spec.id}`,
      output: `public/assets/${spec.out}`,
      url: spec.url,
      page: spec.page,
      owner: spec.owner,
      license: spec.license,
      fetchedAt: spec.fetchedAt,
      transform: spec.transform,
    })),
  ];

  const sources = {
    $comment:
      'Provenance for every raster asset served from public/assets. Generated art was produced with GPT-Image via Codex on 2026-10-17; the local originals live in assets-src/ (gitignored). The five cast portraits are OFFICIAL game artwork (see the cast array), not generated. avatar.png and avatar.png are supplied by the Lead and are never written by this pipeline.',
    site: 'STMfan · Sublunary (v2.2)',
    generatedOn: GENERATED_ON,
    model: GENERATED_BY,
    generated,
    cast,
    external,
    provided: PROVIDED.map((spec) => ({
      id: spec.id,
      output: `public/assets/${spec.out}`,
      width: spec.width,
      height: spec.height,
      bytes: spec.bytes,
      source: spec.source,
      owner: spec.owner,
      license: spec.license,
      transform: spec.transform,
      note: 'Provided by the Lead; the asset pipeline only verifies and records it.',
    })),
    fonts: FONT_SOURCES.map((font) => ({
      file: `assets-src/fonts/${font.file}`,
      family: font.family,
      weight: font.weight,
      subset: font.subset,
      source: 'Google Fonts',
      url: font.url,
      license: font.license,
      usage: 'OG card lettering, converted to SVG outlines at build time',
    })),
    composed: [
      {
        output: 'public/assets/share/og.png',
        width: OG_WIDTH,
        height: OG_HEIGHT,
        base: 'assets-src/horizon.png',
        elements: [
          'dark scrim gradients',
          `circular avatar mark (public/assets/${ICON_SOURCE}) at (${OG_AVATAR.cx},${OG_AVATAR.cy}) r=${OG_AVATAR.r}, amber hairline ring`,
          `wordmark "${OG_COPY.wordmark}" in Bricolage Grotesque 700`,
          `slogan "${OG_COPY.slogan}" in Noto Serif SC 500`,
          `mono line "${OG_COPY.latin}" in JetBrains Mono 400`,
          `domain "${OG_COPY.domain}" in JetBrains Mono 400`,
        ],
        createdOn: GENERATED_ON,
      },
      ...ICONS.map((icon) => ({
        output: `public/assets/${icon.out}`,
        width: icon.size,
        height: icon.size,
        base: `public/assets/${ICON_SOURCE}`,
        elements: ['lanczos upscale/downscale', 'slight saturation lift', 'corner vignette for circular OS masks'],
        createdOn: GENERATED_ON,
      })),
    ],
  };

  const outPath = path.join(OUT, 'sources.json');
  await fs.writeFile(outPath, `${JSON.stringify(sources, null, 2)}\n`);
  process.stdout.write(`meta   public/assets/sources.json\n`);
}

/* ------------------------------------------------------------------ *
 * Verification
 * ------------------------------------------------------------------ */

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function verify() {
  process.stdout.write('\nverify\n');
  for (const entry of records) {
    assert(entry.width === entry.expected.width, `${entry.path}: width ${entry.width} != ${entry.expected.width}`);
    assert(entry.height === entry.expected.height, `${entry.path}: height ${entry.height} != ${entry.expected.height}`);
    assert(entry.bytes > 0, `${entry.path}: empty file`);
    assert(
      entry.bytes <= entry.expected.maxBytes,
      `${entry.path}: ${kb(entry.bytes)} exceeds ${kb(entry.expected.maxBytes)}`,
    );
  }

  // Character portraits must ship a real alpha channel: three official
  // transparent renders plus two feathered key-art plates. The head is a fixed
  // 300 px in every output, so the heights differ slightly; check that the
  // frame is ~1000 px tall and that the head-height scale really was applied.
  // Face crops must be square, 160 px, and readable in a 40-56 px circle.
  for (const cast of CAST) {
    const meta = await sharp(path.join(OUT, cast.out)).metadata();
    assert(meta.hasAlpha, `${cast.out}: expected an alpha channel`);
    assert(
      meta.height >= 950 && meta.height <= 1050,
      `${cast.out}: height ${meta.height} is outside the 950..1050 frame`,
    );
    assert(
      Math.abs(cast.headPxOut - CAST_FRAME.headPx) <= 3,
      `${cast.out}: head is ${cast.headPxOut}px, expected ${CAST_FRAME.headPx}px`,
    );
    const stats = await sharp(path.join(OUT, cast.out)).stats();
    const alpha = stats.channels[stats.channels.length - 1];
    assert(
      alpha.min === 0 && alpha.max === 255,
      `${cast.out}: alpha range ${alpha.min}..${alpha.max} is not a real cutout`,
    );
    const faceMeta = await sharp(path.join(OUT, `cast/${cast.id}-face.webp`)).metadata();
    assert(
      faceMeta.width === CAST_FRAME.faceSize && faceMeta.height === CAST_FRAME.faceSize,
      `cast/${cast.id}-face.webp: ${faceMeta.width}x${faceMeta.height}, expected 160x160`,
    );
  }
  for (const icon of ICONS) {
    const meta = await sharp(path.join(OUT, icon.out)).metadata();
    assert(!meta.hasAlpha, `${icon.out}: icon marks must be opaque`);
  }
  for (const spec of GAMES_VECTOR) {
    const meta = await sharp(path.join(OUT, spec.out)).metadata();
    assert(
      meta.width === GAME_TILE.width && meta.height === GAME_TILE.height,
      `${spec.out}: expected ${GAME_TILE.width}x${GAME_TILE.height}`,
    );
  }

  const og = records.find((entry) => entry.path.endsWith('share/og.png'));
  assert(og && og.bytes <= 700 * KB, 'og.png missing or above 700 KB');
  process.stdout.write(
    `ok     dimensions and byte budget for every output; ${CAST.length} cutouts have alpha, ` +
      `${ICONS.length} icons are opaque\n`,
  );
}

/* ------------------------------------------------------------------ *
 * Table + docs
 * ------------------------------------------------------------------ */

function tableRows() {
  return records
    .slice()
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((entry) => ({
      ...entry,
      dims: `${entry.width}x${entry.height}`,
      size: kb(entry.bytes),
    }));
}

function printTable() {
  const rows = tableRows();
  const pathWidth = Math.max(...rows.map((row) => row.path.length), 4);
  const dimWidth = Math.max(...rows.map((row) => row.dims.length), 10);
  const sizeWidth = Math.max(...rows.map((row) => row.size.length), 4);
  process.stdout.write('\n');
  process.stdout.write(
    `${'file'.padEnd(pathWidth)}  ${'dims'.padEnd(dimWidth)}  ${'size'.padEnd(sizeWidth)}  source\n`,
  );
  process.stdout.write(`${'-'.repeat(pathWidth)}  ${'-'.repeat(dimWidth)}  ${'-'.repeat(sizeWidth)}  ${'-'.repeat(30)}\n`);
  for (const row of rows) {
    process.stdout.write(
      `${row.path.padEnd(pathWidth)}  ${row.dims.padEnd(dimWidth)}  ${row.size.padEnd(sizeWidth)}  ${row.source}\n`,
    );
  }
  const total = rows.reduce((sum, row) => sum + row.bytes, 0);
  process.stdout.write(`\ntotal  ${rows.length} files, ${kb(total)}\n`);
}

async function writeDocs() {
  const rows = tableRows();
  const row = (entry) =>
    `| \`${entry.path}\` | ${entry.dims} | ${entry.size} | \`${entry.source}\` |`;
  const pick = (predicate) => rows.filter(predicate).map(row).join('\n');
  const artRows = pick((entry) => entry.path.includes('/art/'));
  const gameRows = pick((entry) => entry.path.includes('/games/'));
  const castRows = pick((entry) => entry.path.includes('/cast/'));
  const iconRows = pick((entry) => entry.path.includes('/icons/') || entry.path.endsWith('apple-touch-icon.png'));
  const miscRows = pick(
    (entry) =>
      !entry.path.includes('/art/') &&
      !entry.path.includes('/games/') &&
      !entry.path.includes('/cast/') &&
      !entry.path.includes('/icons/') &&
      !entry.path.endsWith('apple-touch-icon.png') &&
      !entry.path.endsWith('og.png'),
  );

  const generatedList = ART.map(
    (art) =>
      `- \`${art.id}\` — ${PROMPTS[art.id]}\n  - Output: \`public/assets/${art.out}\` (${art.width}x${art.height})\n  - Prompt summary recorded in \`public/assets/sources.json\`; model \`${GENERATED_BY}\`, date ${GENERATED_ON}.`,
  ).join('\n');

  const castList = CAST.map(
    (cast) =>
      `- **${cast.id}** — \`public/assets/${cast.out}\` (${cast.width}x${cast.height}, alpha) + \`public/assets/cast/${cast.id}-face.webp\` (160x160)\n` +
      `  - Source: ${cast.url}\n` +
      `  - Page: ${cast.page}\n` +
      `  - Owner: ${cast.owner}\n` +
      `  - Scope: ${cast.license}\n` +
      `  - Fetched at: ${cast.fetchedAt ?? 'n/a'} (${cast.sourceSize} source, ${cast.transparentSource ? 'already transparent' : 'key art, background retained and feathered'})\n` +
      `  - Cut: ${cast.cut}\n` +
      `  - Transform: crop ${cast.crop.width}x${cast.crop.height} at (${cast.crop.left},${cast.crop.top}), scale ${(CAST_FRAME.headPx / cast.headPx).toFixed(3)}x to ${cast.width}x${cast.height}, head ${cast.headPxOut}px; webp q${CAST_FRAME.quality} with alpha; face crop ${cast.face.width}x${cast.face.height} to ${CAST_FRAME.faceSize}x${CAST_FRAME.faceSize}, webp q${CAST_FRAME.faceQuality}.`,
  ).join('\n');

  const externalList = EXTERNAL.map(
    (spec) =>
      `- **${spec.id}** — \`${spec.out}\`\n  - URL: ${spec.url}\n  - Owner: ${spec.owner}\n  - Scope: ${spec.license}\n  - Fetched at: ${spec.fetchedAt ?? 'n/a'}\n  - Transform: ${spec.transform}`,
  ).join('\n');

  const moonList =
    `- **Moon albedo map** — \`public/assets/art/moon-map.webp\`, \`public/assets/art/moon-map-1k.webp\`\n` +
    `  - URL: ${MOON_MAP.url} (${MOON_MAP.sourceSize} source, mirrored from solarsystemscope.com/textures)\n` +
    `  - Commons page: ${MOON_MAP.page}\n` +
    `  - Owner: ${MOON_MAP.owner}\n` +
    `  - Licence: ${MOON_MAP.license}\n` +
    `  - Fetched at: ${MOON_MAP.fetchedAt ?? 'n/a'}\n` +
    `  - Projection: equirectangular 2:1, 0 deg longitude at the centre of the image, +-180 at both edges; the near side reads dead centre.\n` +
    `  - Seam: measured at build time — mean luma delta between the first and last column ${MOON_MAP.seam?.seam}, against ${MOON_MAP.seam?.interior} for two adjacent interior columns, i.e. no visible step at 0/360.\n` +
    `  - Transform: single 8192x4096 decode, downscaled to 2048x1024 then 1024x512; webp q82. No upscaling.`;

  const gamesList = [
    ...GAMES_ITUNES.map(
      (spec) =>
        `- **${spec.id}** — \`public/assets/${spec.out}\` (${GAME_TILE.width}x${GAME_TILE.height})\n` +
        `  - App Store lookup: ${spec.appStoreLookup} (trackId ${spec.trackId}, “${spec.appName}”)\n` +
        `  - Artwork URL: ${spec.resolvedUrl}\n` +
        `  - Owner: ${spec.owner}\n` +
        `  - Scope: ${spec.license}\n` +
        `  - Fetched at: ${spec.fetchedAt ?? 'n/a'}`,
    ),
    ...GAMES_VECTOR.map(
      (spec) =>
        `- **${spec.id}** — \`public/assets/${spec.out}\` (${GAME_TILE.width}x${GAME_TILE.height})\n` +
        `  - URL: ${spec.url}\n  - Commons page: ${spec.page}\n  - Owner: ${spec.owner}\n  - Scope: ${spec.license}\n  - Fetched at: ${spec.fetchedAt ?? 'n/a'}\n  - Transform: ${spec.transform}`,
    ),
  ].join('\n');

  const iconList = ICONS.map((icon) => {
    const aliasOf = ICON_ALIAS_OF[icon.out];
    const how = aliasOf
      ? `byte-identical alias of \`public/assets/${aliasOf}\``
      : `derived from \`public/assets/${ICON_SOURCE}\` (lanczos resample, slight saturation lift, corner vignette, flattened onto #070b12 so no alpha is shipped)`;
    return `- \`public/assets/${icon.out}\` — ${icon.size}x${icon.size}, PNG, ${how}.`;
  }).join('\n');

  const providedList = PROVIDED.map(
    (spec) =>
      `- \`public/assets/${spec.out}\` — ${spec.width}x${spec.height}, ${kb(spec.bytes ?? 0)}. ${spec.transform}. Source: ${spec.source}. Owner: ${spec.owner}. ${spec.license}`,
  ).join('\n');

  const fontList = FONT_SOURCES.map(
    (font) =>
      `- \`assets-src/fonts/${font.file}\` — ${font.family} ${font.weight}, ${font.subset}. ${font.license}. Source: Google Fonts.`,
  ).join('\n');

  const doc = `# Assets

Every raster file the site serves lives in \`public/assets/\`. The pipeline that
produces it is \`scripts/build-assets.mjs\`, run with:

    bun run assets

It reads the original art from \`assets-src/\` (never writes there), downloads the
remote sources into \`assets-src/external/\`, downloads the official character art
into \`assets-src/external/cast/\`, encodes every derivative with sharp, composes
the social card and the icon marks, writes \`public/assets/sources.json\`, verifies
each output's dimensions and byte budget, and rewrites this document's size
table. It is idempotent; it re-downloads the external images on every run and
falls back to the cache in \`assets-src/external/\` when offline. The 15 MB lunar
texture is pinned to its cache entry (\`preferCache\`) because it never changes
upstream.

## Generated art

Four plates were generated with **gpt-image** (via Codex) on **2026-10-17**.
High resolution originals sit in \`assets-src/\`; the site only receives the
derivatives below. The moon plate is cropped to a 1000x1000 square at (127,127)
before the 720x720 resize so that the circular hero mask sees lunar surface and
limb light instead of empty space. The character portraits are **not** in this
list: they are official artwork now (see below).

${generatedList}

## Character portraits (official, v2.2)

The gallery shows **official character artwork**, not generated fan art. Every
plate is cut to a half-body portrait (head plus torso, cut around the waist), and
the crop is scaled so the head measures exactly ${CAST_FRAME.headPx} px in the
output, which gives all five the same visual weight at the gallery's fixed
display height. The face crops are square ${CAST_FRAME.faceSize} px frames of
the same source, sized to stay readable in the 40-56 px circle of the thumbnail
strip.

Three sources are official **transparent character renders** (Wriothesley,
Varka, Von Lycaon), so no keying was needed. Varka is playable and has an
official render of his own, so the manga/group-art fallback was not required.

The two Delta Force operators (Vyron, Gizmo) have **no published transparent
render**. They use the official operator key art from the official Chinese
operator page instead, cropped to a half-body portrait. Those backgrounds are
photographic, so they are not keyed: the plate keeps its backdrop, a radial
alpha ramp feathers the rectangle into the page, and a dark vignette blends it
towards the site's near-black. That is a documented compromise, not a redraw;
the characters are untouched.

Every output keeps a real alpha channel with a 0..255 range; \`verify()\` asserts
\`hasAlpha\`, the frame height, the 300 px head scale and the 160x160 face crop
before the pipeline exits. All ten files were inspected on a dark ground while
this document was written.

${castList}

## 3D moon map (v2.1)

${moonList}

## Game icons (v2.1)

Five square 256x256 tiles. Three are the official App Store artwork resolved
through the iTunes lookup API at build time (a pinned artwork URL is used if the
API is unreachable); two are Commons vector logos rasterised here. Every tile is
encoded webp under 80 KB.

${gamesList}

## Icon marks (v2.1)

${iconList}

## Provided brand inputs

\`public/assets/avatar.png\` (640x640) and \`public/assets/avatar.png\` (256x256 face
crop) are **not** produced by this pipeline. The Lead derives both by hand from
\`C:/Users/STMfan/Pictures/GithubAvatar.png\` (1080x1080); the pipeline only reads
them, records them in \`sources.json\` and fails loudly if either is missing or
has a different size. That guard is deliberate: the v2 version of this script
regenerated \`avatar.png\` from \`https://github.com/STMfan.png?size=320\`, which
would silently throw away the Lead's crop. Do not add them back to \`EXTERNAL\`.

${providedList}

## External assets

${externalList}

## Fonts used for the social card

The OG card lettering is not live text: it is converted to SVG outlines from
three static TrueType instances (OFL 1.1) at build time. This is deliberate —
libvips/librsvg on Windows resolves text through the OS font collection, so
private or fontconfig fonts cannot be referenced reliably. Converting glyphs to
paths makes the card reproducible from the vendored fonts and preserves the
exact letterforms, including the CJK slogan. The card is laid out with explicit
advance widths (no kerning table is applied).

${fontList}

The fonts are only used to rasterise the share card. The site itself loads fonts
from \`@fontsource-variable\` packages in \`src/\`.

## Licence scope

- The project source is MIT licensed (see \`LICENSE\`).
- The four generated art plates, the composed OG card and the avatar-derived
  icon marks are project assets, © STMfan, distributed under the same terms as
  the site. The five character portraits are official third-party artwork (see
  below) and are **not** relicensed as original works.
- \`avatar.png\` and \`avatar.png\` are STMfan's own artwork (downscaled full
  illustration and a face crop of the local picture); the pipeline treats them as
  read-only inputs.
- \`maibot.webp\` is MaiBot mascot artwork © Mai-with-u and the original artist,
  used with attribution in the MaiBot section. It is **not** relicensed under
  MIT; replace it if upstream asks.
- \`playlist-cover.webp\` is a Bilibili archive cover © Bilibili and the original
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
${artRows}

### Games

| File | Dimensions | Size | Source |
| --- | --- | --- | --- |
${gameRows}

### Cast

| File | Dimensions | Size | Source |
| --- | --- | --- | --- |
${castRows}

### Icons and brand marks

| File | Dimensions | Size | Source |
| --- | --- | --- | --- |
${iconRows}

### Other

| File | Dimensions | Size | Source |
| --- | --- | --- | --- |
${miscRows}
| \`public/assets/share/og.png\` | 1200x630 | ${rows.find((entry) => entry.path.endsWith('og.png'))?.size ?? 'n/a'} | \`assets-src/horizon.png\` + circular \`avatar.png\` + font outlines |

## How to regenerate

1. \`bun install\` (sharp is the only tool the pipeline needs beyond Node).
2. Make sure \`assets-src/\` still holds the ten generated plates. It is
   gitignored, so a fresh clone must restore it from the asset archive.
   \`public/assets/avatar.png\` must also exist: the icon marks and the OG avatar
   are derived from it. The character art does not live in \`assets-src/\`: the
   five official sources are downloaded into \`assets-src/external/cast/\` and the
   old generated \`cast/*-raw.png\` plates are gone.
3. Run \`bun run assets\`. The script re-downloads the remote sources when the
   network is available, otherwise it falls back to \`assets-src/external/\`.
   The Fandom images need browser-like request headers (Cloudflare sits in front
   of static.wikia.nocookie.net); the pipeline sends them for the cast step.
4. The script fails loudly if an output exceeds its byte budget, a dimension is
   wrong, a glyph is missing from the subset font, the lunar map shows a
   visible seam, a cast crop falls outside its source, or a transparent source
   comes back opaque. It does not silently upscale: the only enlargement is the
   horizon plate (1916x821 to 1920x823, +0.2%) and it is imperceptible. The
   character plates are normalised so the head is ${CAST_FRAME.headPx} px tall;
   the output frame height follows from the crop (${CAST.map((c) => `${c.id} ${c.height}`).join(', ')}).

## Caveats

- \`assets-src/\` is gitignored. \`public/assets/\` is what ships; the originals
  need a separate backup if the pipeline is to be re-run after a fresh clone.
- \`public/assets/sigil.svg\` and the \`art/sigil-*.webp\` plates are v2 leftovers.
  They are still produced so the v2 build stays reproducible; the Lead removes
  them once \`src/\` stops referencing them.
- The two Delta Force portraits (Vyron, Gizmo) are **official key art**, not
  transparent renders: Delta Force publishes no standalone transparent operator
  art. Their backgrounds are photographic, so they are kept (feathered + dark
  vignette) rather than keyed. If the publisher ever ships transparent renders,
  swap the URL/crop in \`CAST\` and set \`transparentSource: true, mask: false\`.
- The cast sources are re-downloaded on every build. Fandom serves them through
  Cloudflare, so \`CAST_HEADERS\` sends a browser user agent plus an image
  \`Accept\`/\`Referer\`; if Fandom starts refusing the pipeline, the cached copies
  in \`assets-src/external/cast/\` keep the build green.
- \`sources.json\` records the real \`fetchedAt\` for external assets, so it changes
  when those files are re-downloaded; the image bytes themselves are stable for
  a given source revision.
- The Delta Force tile recolours the Commons wordmark from \`#000000\` to
  \`#F2F6FF\` and keeps the emblem at \`#0FF796\`; geometry is untouched. A black
  wordmark would be invisible on the site's dark theme.
- The Genshin tile is the artwork the App Store listing currently serves, which
  is the “6th Anniversary” app icon (the listing itself is named “Genshin Impact
  6th Anniversary”). It is official artwork, not a substitute logo; re-run
  \`bun run assets\` after the anniversary branding ends and the lookup will pick
  up the standard icon. The same applies to any future HoYoverse promo icon.
`;

  await fs.writeFile(path.join(DOCS, 'ASSETS.md'), doc);
  process.stdout.write('docs   docs/ASSETS.md\n');
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */

async function main() {
  process.stdout.write('STMfan asset pipeline\n');
  await ensureDirs();

  if (!(await exists(SRC))) {
    throw new Error(
      `assets-src/ is missing at ${rel(SRC)} — restore the generated art before running the pipeline`,
    );
  }

  const fonts = await ensureFonts();
  await buildArt();
  await checkProvided();
  await buildExternal();
  await buildMoonMap();
  await buildGames();
  await buildCast();
  await buildIcons();
  await buildOg(fonts);
  await writeSources();
  await verify();
  printTable();
  await writeDocs();
  const og = records.find((entry) => entry.path.endsWith('share/og.png'));
  process.stdout.write(
    `\ndone   ${records.length} outputs, og.png ${kb(og.bytes)} (limit 700 KB)\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`\nasset pipeline failed: ${error.message}\n`);
  process.exitCode = 1;
});

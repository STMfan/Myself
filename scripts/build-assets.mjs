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
const DOCS = path.join(ROOT, 'docs');

const GENERATED_ON = '2026-10-17';
const GENERATED_BY = 'gpt-image';
const KB = 1024;

/* ------------------------------------------------------------------ *
 * Source art
 * ------------------------------------------------------------------ */

const ART = [
  {
    id: 'moon-macro',
    src: 'moon-macro.png',
    out: 'art/moon-macro.webp',
    width: 720,
    height: 720,
    quality: 84,
    // The generated square has black space in the top-right corner. Cropping
    // 1000x1000 at (127,127) keeps the cratered terminator on the left and the
    // warm limb light on the right, and pushes the empty corner out of the
    // circle that the hero orrery masks it with.
    crop: { left: 127, top: 127, width: 1000, height: 1000 },
  },
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
  {
    id: 'sigil-wriothesley',
    src: 'sigil-wriothesley.png',
    out: 'art/sigil-wriothesley.webp',
    width: 640,
    height: 640,
    quality: 86,
  },
  {
    id: 'sigil-varka',
    src: 'sigil-varka.png',
    out: 'art/sigil-varka.webp',
    width: 640,
    height: 640,
    quality: 86,
  },
  {
    id: 'sigil-lycaon',
    src: 'sigil-lycaon.png',
    out: 'art/sigil-lycaon.webp',
    width: 640,
    height: 640,
    quality: 86,
  },
  {
    id: 'sigil-vyron',
    src: 'sigil-vyron.png',
    out: 'art/sigil-vyron.webp',
    width: 640,
    height: 640,
    quality: 86,
  },
  {
    id: 'sigil-gizmo',
    src: 'sigil-gizmo.png',
    out: 'art/sigil-gizmo.webp',
    width: 640,
    height: 640,
    quality: 86,
  },
];

const PROMPTS = {
  'moon-macro':
    'Macro of the lunar surface: cratered highlands and a large rayed impact crater on the left, smooth mare on the right, hard terminator shadow along the lower-left edge and a warm grazing rim light in the upper-right corner. Square; near-black space only at the extreme corner, no text.',
  horizon:
    'Ultrawide dusk horizon: a snow-dusted mountain ridge under a thin amber band of sunset light, layered blue haze over a dark city skyline with scattered warm windows, foreground conifers. Cinematic, no text.',
  'atmosphere-haze':
    'Near-black atmosphere plate: low blue mist drifting in from the lower left, a single warm amber light leak in the upper-right corner, fine grain. 16:9, no text.',
  'light-paper':
    'Cold-pressed white paper texture: fine fibres, tiny flecks, flat even light. Square, no text.',
  'dark-emulsion':
    'Aged dark film emulsion: near-black base, dust specks, fine scratches, faint umber edge burn. Square, no text.',
  'sigil-wriothesley':
    'Heraldic wolf-skull sigil: forged steel and fractured blue-white crystal, keyhole brow, brass gears and chains, a single amber eye ember, symmetrical crest on near-black. Square, no text.',
  'sigil-varka':
    'Heraldic sigil of a pale wolf-fang spear crossing a white feather, twin engraved crescents and blue crystal filigree, a warm amber spark at the crossing, near-black background. Square, no text.',
  'sigil-lycaon':
    'Frost-wolf head sigil in silver-blue crystal, framed by a four-point star ring, amber eye, symmetrical crest on near-black. Square, no text.',
  'sigil-vyron':
    'Compass-rose sigil: eight-point steel star over concentric astrolabe rings, glowing amber core, blue rim light, near-black background. Square, no text.',
  'sigil-gizmo':
    'Brass-and-steel spherical automaton sigil: riveted plating, side ports, glowing amber lens eye, antenna orb, blue rim light, near-black background. Square, no text.',
};

/* ------------------------------------------------------------------ *
 * External assets
 * ------------------------------------------------------------------ */

const UA = 'stmfan-asset-forge/1.0 (+https://stmfan.tech/)';
const UA_TTF =
  'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.1) Gecko/2008070208 Firefox/3.0.1';

const EXTERNAL = [
  {
    id: 'avatar',
    out: 'avatar.png',
    url: 'https://github.com/STMfan.png?size=320',
    cache: 'avatar.jpg',
    owner: 'STMfan (GitHub account avatar)',
    license:
      'Personal avatar, © STMfan. Redistributed as part of this site; not relicensed under MIT.',
    transform: 'resize 320x320 (cover), written as PNG',
    width: 320,
    height: 320,
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
    CACHE,
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
  const cachePath = path.join(CACHE, spec.cache);
  try {
    const response = await fetch(spec.url, {
      headers: { 'user-agent': UA },
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
    if (spec.id === 'avatar') {
      const { buf, fetchedAt } = await fetchAsset(spec);
      const outAbs = path.join(OUT, spec.out);
      await sharp(buf)
        .resize(320, 320, { fit: 'cover', position: 'centre' })
        .png({ compressionLevel: 9, effort: 10 })
        .toFile(outAbs);
      const entry = await record(
        spec.out,
        spec.width,
        spec.height,
        spec.url,
        { width: 320, height: 320, maxBytes: 160 * KB },
      );
      spec.fetchedAt = fetchedAt;
      process.stdout.write(
        `ext    ${entry.path} ${entry.width}x${entry.height} ${kb(entry.bytes)}\n`,
      );
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
 * Build: OG social card
 * ------------------------------------------------------------------ */

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const ACCENT = '#f2a24b';
const INK = '#f5f7fb';

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

  const composed = sharp(base)
    .composite([
      { input: Buffer.from(ogScrim()) },
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

  const entry = await record('share/og.png', OG_WIDTH, OG_HEIGHT, 'assets-src/horizon.png + fonts', {
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

  const external = EXTERNAL.map((spec) => ({
    id: spec.id,
    output: `public/assets/${spec.out}`,
    url: spec.url,
    owner: spec.owner,
    license: spec.license,
    fetchedAt: spec.fetchedAt,
    transform: spec.transform,
  }));

  const sources = {
    $comment:
      'Provenance for every raster asset served from public/assets. Generated art was produced with GPT-Image via Codex on 2026-10-17; the local originals live in assets-src/ (gitignored).',
    site: 'STMfan · Sublunary (v2)',
    generatedOn: GENERATED_ON,
    model: GENERATED_BY,
    generated,
    external,
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
          `wordmark "${OG_COPY.wordmark}" in Bricolage Grotesque 700`,
          `slogan "${OG_COPY.slogan}" in Noto Serif SC 500`,
          `mono line "${OG_COPY.latin}" in JetBrains Mono 400`,
          `domain "${OG_COPY.domain}" in JetBrains Mono 400`,
        ],
        createdOn: GENERATED_ON,
      },
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
  const og = records.find((entry) => entry.path.endsWith('share/og.png'));
  assert(og && og.bytes <= 700 * KB, 'og.png missing or above 700 KB');
  process.stdout.write('ok     dimensions and byte budget for every output\n');
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
  const artRows = rows
    .filter((row) => row.path.includes('/art/'))
    .map((row) => `| \`${row.path}\` | ${row.dims} | ${row.size} | \`${row.source}\` |`)
    .join('\n');
  const extRows = rows
    .filter((row) => !row.path.includes('/art/') && !row.path.endsWith('og.png'))
    .map((row) => `| \`${row.path}\` | ${row.dims} | ${row.size} | \`${row.source}\` |`)
    .join('\n');
  const generatedList = ART.map(
    (art) =>
      `- \`${art.id}\` — ${PROMPTS[art.id]}\n  - Output: \`public/assets/${art.out}\` (${art.width}x${art.height})\n  - Prompt summary recorded in \`public/assets/sources.json\`; model \`${GENERATED_BY}\`, date ${GENERATED_ON}.`,
  ).join('\n');

  const externalList = EXTERNAL.map(
    (spec) =>
      `- **${spec.id}** — \`${spec.out}\`\n  - URL: ${spec.url}\n  - Owner: ${spec.owner}\n  - Scope: ${spec.license}\n  - Fetched at: ${spec.fetchedAt ?? 'n/a'}\n  - Transform: ${spec.transform}`,
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
three external images into \`assets-src/external/\`, encodes every derivative with
sharp, composes the social card, writes \`public/assets/sources.json\`, verifies
each output's dimensions and byte budget, and rewrites this document's size
table. It is idempotent; it re-downloads the external images on every run and
falls back to the cache in \`assets-src/external/\` when offline.

## Generated art

All ten plates were generated with **gpt-image** (via Codex) on **2026-10-17**.
High resolution originals sit in \`assets-src/\`; the site only receives the
derivatives below. The moon plate is cropped to a 1000x1000 square at (127,127)
before the 720x720 resize so that the circular hero mask sees lunar surface and
limb light instead of empty space.

${generatedList}

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
- The ten generated plates and the composed OG card are project assets, ©
  STMfan, distributed under the same terms as the site.
- \`avatar.png\` is the GitHub account avatar, © STMfan.
- \`maibot.webp\` is MaiBot mascot artwork © Mai-with-u and the original artist,
  used with attribution in the MaiBot section. It is **not** relicensed under
  MIT; replace it if upstream asks.
- \`playlist-cover.webp\` is a Bilibili archive cover © Bilibili and the original
  uploader, used as the playlist card. It is **not** relicensed under MIT.
- The vendored fonts are SIL Open Font License 1.1 and remain under that licence.

## Outputs

| File | Dimensions | Size | Source |
| --- | --- | --- | --- |
${artRows}
${extRows}
| \`public/assets/share/og.png\` | 1200x630 | ${rows.find((row) => row.path.endsWith('og.png'))?.size ?? 'n/a'} | \`assets-src/horizon.png\` + font outlines |

## How to regenerate

1. \`bun install\` (sharp is the only tool the pipeline needs beyond Node).
2. Make sure \`assets-src/\` still holds the ten generated originals. It is
   gitignored, so a fresh clone must restore it from the asset archive.
3. Run \`bun run assets\`. The script re-downloads \`avatar.png\`, \`maibot.webp\` and
   \`playlist-cover.webp\` when the network is available, otherwise it falls back
   to \`assets-src/external/\`.
4. The script fails loudly if an output exceeds its byte budget, a dimension is
   wrong, or a glyph is missing from the subset font. It does not silently
   upscale: the only enlargement is the horizon plate (1916x821 to 1920x823,
   +0.2%) and it is imperceptible.

## Caveats

- \`assets-src/\` is gitignored. \`public/assets/\` is what ships; the originals
  need a separate backup if the pipeline is to be re-run after a fresh clone.
- \`public/assets/sigil.svg\` is a hand-authored vector file owned by the site
  build, not by this pipeline.
- \`sources.json\` records the real \`fetchedAt\` for external assets, so it changes
  when those files are re-downloaded; the image bytes themselves are stable for
  a given source revision.
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
  await buildExternal();
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

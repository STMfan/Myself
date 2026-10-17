#!/usr/bin/env node
/**
 * scripts/check-site.mjs
 *
 * Post-build validation for the STMfan v2 site. Every check is independent: the
 * script collects all failures, prints them as a readable list and exits 1 if
 * anything is wrong, so CI shows the whole picture in one run.
 *
 *   bun run check:site
 *
 * Checks:
 *   - required <head> metadata (title, description, canonical, og:image)
 *   - prerendered section markers inside #root
 *   - both slogan strings survived prerendering
 *   - zero U+2014 em dashes in dist/index.html
 *   - every local /assets/... reference in the HTML and in dist CSS exists in dist
 *   - public/_headers, robots.txt and sitemap.xml were copied into dist
 *   - no source maps and no sourceMappingURL comments
 *   - total dist size under the 24 MB ceiling
 *
 * No extra dependencies. LF output, stable ordering.
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIST = path.join(ROOT, 'dist');
const PUB = path.join(ROOT, 'public');
const HTML_FILE = path.join(DIST, 'index.html');

const SIZE_CEILING = 24 * 1024 * 1024; // 24 MB

const SECTION_IDS = [
  'hero',
  'manifesto',
  'workshop',
  'commission',
  'maibot',
  'games',
  'characters',
  'contact',
  'contact-title',
];

const SLOGANS = ['探月下，尘世万象', 'To Decipher'];

/** @type {string[]} */
const failures = [];
/** @type {string[]} */
const notes = [];
let checksRun = 0;

function check(ok, failureMessage) {
  checksRun += 1;
  if (!ok) failures.push(failureMessage);
  return ok;
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function walk(dir) {
  /** @type {string[]} */
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.isFile()) files.push(full);
  }
  return files.sort();
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i'));
  return match ? match[1] : null;
}

function findMeta(html, key) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  return tags.find((tag) => {
    const property = attr(tag, 'property') || attr(tag, 'name');
    return property?.toLowerCase() === key.toLowerCase() && attr(tag, 'content') !== null;
  });
}

function findLink(html, rel) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  return tags.find((tag) => (attr(tag, 'rel') || '').toLowerCase() === rel.toLowerCase());
}

function resolveAssetRef(ref) {
  const clean = decodeURIComponent(ref.split('?')[0].split('#')[0]);
  if (!clean || clean === '/') return null;
  if (!clean.startsWith('/')) return null;
  return path.join(DIST, clean.slice(1).replace(/[\\/]+/g, path.sep));
}

async function fileExists(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

async function main() {
  if (!existsSync(HTML_FILE)) {
    process.stderr.write(
      '[check:site] dist/index.html not found. Run `bun run build` before checking the site.\n',
    );
    process.exit(1);
  }

  const html = await readFile(HTML_FILE, 'utf8');

  // ---------------------------------------------------------------- metadata
  const title = html.match(/<title>([\s\S]*?)<\/title>/i);
  check(
    !!title && title[1].trim().length > 0 && title[1].includes('STMfan'),
    'dist/index.html <title> is missing, empty, or does not mention STMfan',
  );

  const description = findMeta(html, 'description');
  check(
    !!description && (attr(description, 'content') || '').trim().length >= 40,
    'missing or too-short <meta name="description"> in dist/index.html',
  );

  const canonical = findLink(html, 'canonical');
  check(
    !!canonical && attr(canonical, 'href') === 'https://stmfan.tech/',
    'missing canonical link (expected href="https://stmfan.tech/")',
  );

  const ogImage = findMeta(html, 'og:image');
  const ogImageContent = ogImage ? attr(ogImage, 'content') || '' : '';
  check(
    ogImageContent === '/assets/share/og.png' ||
      ogImageContent === 'https://stmfan.tech/assets/share/og.png',
    `og:image must point at /assets/share/og.png (found "${ogImageContent || 'nothing'}")`,
  );

  // ------------------------------------------------------- prerendered markup
  const rootMatch = html.match(/<div id="root">([\s\S]*)<\/div>/);
  const rootMarkup = rootMatch ? rootMatch[1] : '';
  check(
    rootMarkup.trim().length > 2000,
    'prerendered #root markup is missing or suspiciously small (did scripts/prerender.mjs run?)',
  );

  for (const id of SECTION_IDS) {
    check(
      html.includes(`id="${id}"`),
      `prerendered markup is missing the section marker id="${id}"`,
    );
  }

  check(
    !html.includes('/src/main.tsx'),
    'dist/index.html still references /src/main.tsx (client build did not run)',
  );
  check(
    /<script[^>]*type="module"[^>]*src="\/assets\/[^"]+\.js"/.test(html),
    'dist/index.html has no hashed client module script (/assets/*.js)',
  );
  check(
    /<link[^>]*rel="stylesheet"[^>]*href="\/assets\/[^"]+\.css"/.test(html),
    'dist/index.html has no hashed CSS stylesheet link (/assets/*.css)',
  );

  // ---------------------------------------------------------------- slogans
  for (const slogan of SLOGANS) {
    check(
      html.includes(slogan),
      `prerendered HTML is missing the slogan string "${slogan}"`,
    );
  }

  // ----------------------------------------------------------------- em dash
  const emDashes = (html.match(/\u2014/g) || []).length;
  check(
    emDashes === 0,
    `dist/index.html contains ${emDashes} U+2014 em dash character(s); zero are allowed`,
  );

  // --------------------------------------------------- asset references
  const htmlRefs = (
    html.match(/(?:https:\/\/stmfan\.tech)?\/assets\/[^\s"'`()<>\\]+/g) || []
  ).map((ref) => ref.replace(/^https:\/\/stmfan\.tech/, ''));
  const uniqueHtmlRefs = [...new Set(htmlRefs)].sort();

  const ogImageFile = resolveAssetRef(ogImageContent.replace(/^https:\/\/stmfan\.tech/, ''));
  check(
    !!ogImageFile && (await fileExists(ogImageFile)),
    'the og:image target /assets/share/og.png does not exist in dist',
  );

  for (const ref of uniqueHtmlRefs) {
    const file = resolveAssetRef(ref);
    if (!file) continue;
    const ok = await fileExists(file);
    check(
      ok,
      `HTML references ${ref} but ${path.relative(ROOT, file)} does not exist in dist`,
    );
  }

  // CSS references, including nested url() in @font-face and backgrounds.
  const cssFiles = (await walk(DIST)).filter((file) => file.endsWith('.css'));
  check(cssFiles.length > 0, 'dist contains no CSS files');

  const cssRefSet = new Map();
  for (const cssFile of cssFiles) {
    const css = await readFile(cssFile, 'utf8');
    const urlPattern = /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
    let match;
    while ((match = urlPattern.exec(css)) !== null) {
      const raw = match[2].trim();
      if (!raw) continue;
      if (/^(data:|https?:|\/\/|#)/i.test(raw)) continue;
      const target = raw.startsWith('/')
        ? path.join(DIST, raw.split('?')[0].split('#')[0].slice(1))
        : path.resolve(path.dirname(cssFile), raw.split('?')[0].split('#')[0]);
      cssRefSet.set(`${path.relative(ROOT, cssFile)}: ${raw}`, target);
    }
  }
  for (const [label, target] of [...cssRefSet.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const ok = await fileExists(target);
    check(ok, `CSS reference ${label} does not resolve to ${path.relative(ROOT, target)}`);
  }

  // --------------------------------------------------------- static passthrough
  for (const name of ['_headers', 'robots.txt', 'sitemap.xml']) {
    const source = path.join(PUB, name);
    const copy = path.join(DIST, name);
    if (!existsSync(source)) {
      check(false, `public/${name} is missing from the repository`);
      continue;
    }
    if (!existsSync(copy)) {
      check(false, `dist/${name} was not copied from public/`);
      continue;
    }
    const [a, b] = await Promise.all([readFile(source), readFile(copy)]);
    check(
      a.equals(b),
      `dist/${name} differs from public/${name} (stale copy?)`,
    );
  }

  // ------------------------------------------------------------- source maps
  const allFiles = await walk(DIST);
  const mapFiles = allFiles.filter((file) => file.endsWith('.map'));
  check(mapFiles.length === 0, `dist contains source maps: ${mapFiles.map((f) => path.relative(ROOT, f)).join(', ')}`);

  const textExt = /\.(?:m?js|css|html)$/i;
  for (const file of allFiles.filter((f) => textExt.test(f))) {
    const content = await readFile(file, 'utf8');
    check(
      !content.includes('sourceMappingURL'),
      `${path.relative(ROOT, file)} has a sourceMappingURL comment`,
    );
  }

  // ----------------------------------------------------------------- size
  let total = 0;
  for (const file of allFiles) total += (await stat(file)).size;
  notes.push(`dist size: ${humanSize(total)} (ceiling ${humanSize(SIZE_CEILING)})`);
  check(
    total <= SIZE_CEILING,
    `dist is ${humanSize(total)}, over the ${humanSize(SIZE_CEILING)} ceiling`,
  );

  // ---------------------------------------------------------------- report
  if (failures.length > 0) {
    process.stderr.write(`\n[check:site] ${failures.length} problem(s) found:\n`);
    for (const failure of failures) process.stderr.write(`  x ${failure}\n`);
    process.stderr.write(
      `\n[check:site] ${checksRun - failures.length}/${checksRun} checks passed.\n`,
    );
    process.exit(1);
  }

  notes.push(`${checksRun} checks passed`);
  process.stdout.write(`[check:site] ok  ${notes.join('  |  ')}\n`);
}

await main();

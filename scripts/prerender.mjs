#!/usr/bin/env node
/**
 * scripts/prerender.mjs
 *
 * Post-build prerender step for the STMfan v2 site.
 *
 *   bun run build   ->  typecheck && vite build && node scripts/prerender.mjs
 *
 * The client is a single page rendered with createRoot (no hydration), so this
 * step only needs to bake the same markup into dist/index.html so that crawlers,
 * social cards and no-JS readers see the real zh content before the bundle runs.
 *
 * Steps:
 *   1. SSR-build src/entry-server.tsx with the Vite JS API into .ssr (emptyOutDir).
 *   2. Import the emitted server bundle and call render().
 *   3. Replace the empty <div id="root"></div> in dist/index.html with that markup,
 *      leaving the client module script, the hashed CSS link and every other tag
 *      from index.html untouched.
 *
 * Deterministic: no timestamps, no random ids, stable newline handling. A second
 * run on an already prerendered dist/ is refused (the marker is gone), which keeps
 * the step honest instead of nesting markup.
 *
 * No extra dependencies are used. Fails loudly with a non-zero exit code.
 */

import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SSR_DIR = path.join(ROOT, '.ssr');
const ENTRY = path.join(ROOT, 'src', 'entry-server.tsx');
const DIST_DIR = path.join(ROOT, 'dist');
const DIST_HTML = path.join(DIST_DIR, 'index.html');

const ROOT_MARKER = '<div id="root"></div>';

function log(message) {
  process.stdout.write(`[prerender] ${message}\n`);
}

function fail(message, error) {
  process.stderr.write(`\n[prerender] FAILED: ${message}\n`);
  if (error) {
    process.stderr.write(`${error?.stack || error}\n`);
  }
  process.exit(1);
}

/** React logs a development warning for useLayoutEffect during renderToString.
 *  The effects are client-only and intentional here, so drop exactly that warning
 *  and let every other message through untouched. */
function muteServerEffectWarning() {
  const originalError = console.error;
  const originalWarn = console.warn;
  const ignore = (first) =>
    typeof first === 'string' &&
    first.includes('useLayoutEffect does nothing on the server');
  console.error = (...args) => {
    if (ignore(args[0])) return;
    originalError(...args);
  };
  console.warn = (...args) => {
    if (ignore(args[0])) return;
    originalWarn(...args);
  };
  return () => {
    console.error = originalError;
    console.warn = originalWarn;
  };
}

async function assertInputs() {
  if (!existsSync(ENTRY)) {
    fail(`missing SSR entry: ${path.relative(ROOT, ENTRY)}`);
  }
  if (!existsSync(DIST_HTML)) {
    fail(
      'dist/index.html not found. Run `vite build` (or `bun run build`) first.',
    );
  }
  const info = await stat(DIST_HTML);
  if (!info.isFile() || info.size === 0) {
    fail('dist/index.html is empty or not a regular file.');
  }
}

async function buildServerBundle() {
  log(`building SSR bundle -> ${path.relative(ROOT, SSR_DIR)}/`);
  const { build } = await import('vite');
  await build({
    root: ROOT,
    configFile: path.join(ROOT, 'vite.config.ts'),
    mode: 'production',
    logLevel: 'warn',
    build: {
      ssr: ENTRY,
      outDir: SSR_DIR,
      emptyOutDir: true,
      copyPublicDir: false,
      ssrEmitAssets: false,
      minify: false,
      reportCompressedSize: false,
      target: 'node20',
      rollupOptions: {
        output: {
          format: 'es',
          entryFileNames: 'entry-server.js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
  });
  const entryFile = path.join(SSR_DIR, 'entry-server.js');
  if (!existsSync(entryFile)) {
    fail(
      `SSR build did not emit ${path.relative(ROOT, entryFile)} (check vite build.ssr output names).`,
    );
  }
  return entryFile;
}

async function renderMarkup(entryFile) {
  // Use React's production renderer: no dev warnings, deterministic markup.
  process.env.NODE_ENV = 'production';
  const restoreConsole = muteServerEffectWarning();
  let markup;
  try {
    const mod = await import(pathToFileURL(entryFile).href);
    if (typeof mod.render !== 'function') {
      throw new Error(
        'src/entry-server.tsx must export a render(): string function.',
      );
    }
    markup = mod.render();
  } catch (error) {
    restoreConsole();
    fail('SSR render() threw', error);
  } finally {
    restoreConsole();
  }
  if (typeof markup !== 'string' || markup.trim().length === 0) {
    fail('render() returned no markup.');
  }
  return markup;
}

function countTag(html, tag) {
  return (html.match(tag) || []).length;
}

async function injectMarkup(markup) {
  const html = await readFile(DIST_HTML, 'utf8');

  if (!html.includes(ROOT_MARKER)) {
    if (html.includes('<div id="root">')) {
      fail(
        'dist/index.html already contains prerendered markup inside #root. ' +
          'Re-run `vite build` so the root element is empty before prerendering.',
      );
    }
    fail(`could not find an empty ${ROOT_MARKER} marker in dist/index.html.`);
  }

  const moduleScript = /<script[^>]*type="module"[^>]*src="[^"]*\.js"[^>]*><\/script>/;
  const stylesheet = /<link[^>]*rel="stylesheet"[^>]*href="[^"]*\.css"[^>]*>/;
  if (!moduleScript.test(html)) {
    fail('dist/index.html has no client <script type="module" src="...js"> tag.');
  }
  if (!stylesheet.test(html)) {
    fail('dist/index.html has no hashed CSS <link rel="stylesheet"> tag.');
  }
  const moduleTagsBefore = countTag(html, /<script[^>]*type="module"/g);
  const cssTagsBefore = countTag(html, /<link[^>]*rel="stylesheet"/g);

  const output = html.replace(ROOT_MARKER, `<div id="root">${markup}</div>`);

  // The client entry and the single hashed stylesheet must survive untouched.
  if (countTag(output, /<script[^>]*type="module"/g) !== moduleTagsBefore) {
    fail('injection changed the number of module script tags.');
  }
  if (countTag(output, /<link[^>]*rel="stylesheet"/g) !== cssTagsBefore) {
    fail('injection changed the number of stylesheet links.');
  }

  await writeFile(DIST_HTML, output, 'utf8');
  return output.length;
}

async function main() {
  await assertInputs();
  await mkdir(SSR_DIR, { recursive: true });

  const entryFile = await buildServerBundle();
  const markup = await renderMarkup(entryFile);
  const size = await injectMarkup(markup);

  // Sanity check: the baked markup must carry the real zh content.
  const html = await readFile(DIST_HTML, 'utf8');
  const required = ['探月下，尘世万象', 'id="hero"', 'id="contact-title"'];
  for (const needle of required) {
    if (!html.includes(needle)) {
      fail(`prerendered dist/index.html is missing required marker: ${needle}`);
    }
  }

  log(
    `injected ${markup.length.toLocaleString('en-US')} bytes of markup ` +
      `(${size.toLocaleString('en-US')} bytes total)`,
  );
  log(`ok -> ${path.relative(ROOT, DIST_HTML)}`);
}

await main();

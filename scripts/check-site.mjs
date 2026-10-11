import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';

// Checks the actual deliverable: every locally referenced image must ship in dist.
const sources = await Promise.all(['src/App.tsx', 'src/content.ts', 'src/styles.css', 'src/visuals.css', 'src/CharacterShowcase.tsx', 'index.html'].map(f => readFile(f, 'utf8')));
const assetPaths = [...new Set(sources.join('\n').match(/\/assets\/[a-zA-Z0-9_./-]+\.(?:png|webp|svg|jpg)/g))];
for (const asset of assetPaths) assert.ok((await stat(`dist${asset}`)).size > 0, `Missing or empty asset ${asset}`);
for (const file of ['dist/index.html', 'dist/_headers', 'dist/THIRD_PARTY_NOTICES.txt', 'dist/PROJECT_LICENSE.txt']) assert.ok((await stat(file)).size > 0, `Missing deployment file ${file}`);
assert.ok(!(await readdir('dist')).includes('themes.html'), 'Obsolete color studies must not ship');
const html = await readFile('dist/index.html', 'utf8');
assert.ok(!html.includes('/src/main.tsx'), 'Production HTML still references source');
const builtFiles = await readdir('dist/assets');
assert.ok(builtFiles.some(x => x.endsWith('.js')), 'Built JavaScript missing');
assert.ok(builtFiles.some(x => x.endsWith('.woff2')), 'Self-hosted fonts missing');
console.log(`Production integrity passed: ${assetPaths.length} referenced images, HTML, headers, notices, bundle, and local fonts.`);

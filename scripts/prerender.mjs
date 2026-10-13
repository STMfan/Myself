import { build } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// Static HTML only. Cloudflare Pages needs no server process or new dependency.
await build({build:{ssr:'src/entry-server.tsx',outDir:'.cache/prerender',emptyOutDir:true}});
const {render}=await import(pathToFileURL(path.resolve('.cache/prerender/entry-server.js')).href);
const html=await readFile('dist/index.html','utf8');
const markup=render();
if(!markup.includes('stmfanofficial@gmail.com')||!markup.includes('予以筋骨'))throw new Error('Missing prerendered core content');
if(!html.includes('<div id="root"></div>'))throw new Error('Unexpected Vite HTML entry');
await writeFile('dist/index.html',html.replace('<div id="root"></div>',`<div id="root">${markup}</div>`));
console.log('Prerendered identity, all skill summaries, placeholders, interests and contact details.');

import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';

// Checks the actual deliverable: every locally referenced image must ship in dist.
const sources = await Promise.all(['src/App.tsx', 'src/content.ts', 'src/styles.css', 'src/visuals.css', 'src/cinematic.css', 'src/CharacterShowcase.tsx', 'index.html'].map(f => readFile(f, 'utf8')));
const decor = JSON.parse(await readFile('public/assets/decor/sources.json','utf8'));
const assetPaths = [...new Set([...sources.join('\n').matchAll(/\/assets\/[a-zA-Z0-9_./-]+\.(?:png|webp|svg|jpg)/g)].map(m=>m[0]).concat(decor.map(d=>d.file)))];
for (const asset of assetPaths) assert.ok((await stat(`dist${asset}`)).size > 0, `Missing or empty asset ${asset}`);
for (const file of ['dist/index.html', 'dist/_headers', 'dist/THIRD_PARTY_NOTICES.txt', 'dist/PROJECT_LICENSE.txt']) assert.ok((await stat(file)).size > 0, `Missing deployment file ${file}`);
assert.ok(!(await readdir('dist')).includes('themes.html'), 'Obsolete color studies must not ship');
const html = await readFile('dist/index.html', 'utf8');
assert.ok(!html.includes('/src/main.tsx'), 'Production HTML still references source');
const builtFiles = await readdir('dist/assets');
assert.ok(builtFiles.some(x => x.endsWith('.js')), 'Built JavaScript missing');
assert.ok(builtFiles.some(x => x.endsWith('.woff2')), 'Self-hosted fonts missing');
console.log(`Production integrity passed: ${assetPaths.length} referenced images, HTML, headers, notices, bundle, and local fonts.`);
for (const text of ['予以筋骨','赋其流明','下笔如有神助','画龙将要点睛','stmfanofficial@gmail.com','待补充']) assert.ok(html.includes(text),`Missing static core text: ${text}`);
assert.ok(html.includes('rel="canonical"') && html.includes('application/ld+json'), 'Search metadata missing');
const robots=await readFile('dist/robots.txt','utf8'),sitemap=await readFile('dist/sitemap.xml','utf8');
assert.ok(robots.startsWith('User-agent:') && robots.includes('https://stmfan.tech/sitemap.xml'),'Invalid robots file');
assert.ok(sitemap.includes('<urlset') && sitemap.includes('<loc>https://stmfan.tech/</loc>'),'Invalid sitemap');
for(const file of builtFiles.filter(f=>f.endsWith('.js'))) {
  const bundle=await readFile(`dist/assets/${file}`,'utf8');
  assert.ok(!bundle.includes('DEEPSEEK-APIKEY') && !bundle.includes('SILICONFLOW-APIKEY'),'Private API environment leaked into the client');
}
console.log('Static core content, discovery files, canonical/schema and private-env boundary passed.');
const envFile=await readFile('.env','utf8').catch(()=>null);
if(envFile) {
  const values=envFile.split(/\r?\n/).flatMap(line=>{
    const m=line.match(/^\s*([\w-]*(?:APIKEY|_KEY|-KEY))\s*=\s*(.+?)\s*$/i);
    return m?[m[2].replace(/^(['"])(.*)\1$/,'$2')]:[];
  }).filter(v=>v.length>=16);
  for(const file of builtFiles.filter(f=>f.endsWith('.js'))) {
    const bundle=await readFile(`dist/assets/${file}`,'utf8');
    assert.ok(values.every(value=>!bundle.includes(value)),'A local API credential entered the public bundle');
  }
  console.log('Local credential values are absent from the public JavaScript.');
}

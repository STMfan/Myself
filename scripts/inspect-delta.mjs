import { writeFile } from 'node:fs/promises';
const url = 'https://df.qq.com/cp/a20240906main/index.html';
const response = await fetch(url);
const html = await response.text();
await writeFile('.cache/asset-pages/delta-main.html', html);
console.log(JSON.stringify({ status: response.status, logo: html.match(/[^\n]{0,80}logo[^\n]{0,150}/gi)?.slice(0, 8), styles: html.match(/<link[^>]+stylesheet[^>]*>/gi) }));

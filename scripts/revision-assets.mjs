import { mkdir, writeFile, readFile } from 'node:fs/promises';
import sharp from 'sharp';

const items = [
  { id: 'maibot', url: 'https://raw.githubusercontent.com/Mai-with-u/.github/main/profile/assets/maimai2.png', file: 'public/assets/maibot.webp', source: 'https://github.com/Mai-with-u/.github', owner: 'Mai-with-u / MaiBot', width: 320 },
  { id: 'delta', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Delta_Force_Logo_CN.png', file: 'public/assets/games/delta.webp', source: 'https://commons.wikimedia.org/wiki/File:Delta_Force_Logo_CN.png', owner: 'Tencent / Team Jade', width: 700 },
  { id: 'playlist-cover', url: 'https://i1.hdslb.com/bfs/archive/5c8ee48913bdb5b994901950ab9047ae170af189.jpg@672w_378h_1c.webp', file: 'public/assets/playlist-cover.webp', source: 'User-selected Bilibili artwork URL', owner: 'Original Bilibili artwork rights holder', width: 672 },
  { id: 'bilibili-logo', url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/bilibili.svg', file: 'public/assets/bilibili.svg', source: 'https://github.com/simple-icons/simple-icons', owner: 'Simple Icons (CC0); Bilibili trademark' },
];
await mkdir('.cache/assets/revision', { recursive: true });
const manifest = JSON.parse(await readFile('public/assets/sources.json', 'utf8'));
for (const item of items) {
  const response = await fetch(item.url, { headers: { 'User-Agent': 'STMfan-Personal-Website/1.0 (asset preparation)', 'Referer': item.id === 'playlist-cover' ? 'https://www.bilibili.com/' : 'https://github.com/STMfan/Myself' } });
  if (!response.ok) throw new Error(`${item.id}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(`.cache/assets/revision/${item.id}.source`, bytes);
  if (item.width) await sharp(bytes).resize({ width: item.width, withoutEnlargement: true }).webp({ quality: 92 }).toFile(item.file);
  else await writeFile(item.file, bytes);
  manifest.assets = manifest.assets.filter(asset => asset.id !== item.id);
  manifest.assets.push({ id: item.id, url: item.url, source: item.source, owner: item.owner, fetchedAt: new Date().toISOString(), selectedBy: 'STMfan browser comments, 2026-10-11' });
  console.log(`${item.id}: saved ${item.file}`);
}
await writeFile('public/assets/sources.json', `${JSON.stringify(manifest, null, 2)}\n`);

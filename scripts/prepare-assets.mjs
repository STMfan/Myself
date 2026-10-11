import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const avatarResponse = await fetch('https://github.com/STMfan.png?size=320');
if (!avatarResponse.ok) throw new Error(`GitHub avatar: HTTP ${avatarResponse.status}`);
await sharp(Buffer.from(await avatarResponse.arrayBuffer())).resize(320, 320).png({ palette: true, quality: 90 }).toFile('public/assets/avatar.png');
console.log('GitHub avatar saved:', avatarResponse.url);

const assets = [];
for (const [id, query, trackId] of [['phigros', 'Phigros', 1454809109], ['genshin', 'Genshin-Impact', 1517783697], ['zzz', 'Zenless-Zone-Zero', 1606356401]]) {
  const data = JSON.parse(await readFile(`.cache/asset-pages/${query}.json`, 'utf8'));
  const app = data.results.find(item => item.trackId === trackId);
  if (!app) throw new Error(`Verified storefront entry missing: ${id}`);
  assets.push({ id, url: app.artworkUrl512, source: app.trackViewUrl, owner: app.sellerName });
}
assets.push(
  { id: 'delta', url: 'https://game.gtimg.cn/images/dfm/cp/a20240906main/logo.png', source: 'https://df.qq.com/cp/a20240906main/index.html', owner: 'Tencent / Team Jade' },
  { id: 'minecraft', url: 'https://www.minecraft.net/etc.clientlibs/minecraftnet/clientlibs/clientlib-site/resources/android-icon-192x192.png', source: 'https://www.minecraft.net/', owner: 'Mojang / Microsoft' },
);
for (const asset of assets) {
  const res = await fetch(asset.url);
  if (!res.ok) throw new Error(`${asset.id}: HTTP ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  await sharp(bytes).resize({ width: 360, withoutEnlargement: true }).webp({ quality: 88 }).toFile(`public/assets/games/${asset.id}.webp`);
  console.log(`${asset.id}: saved from ${asset.owner}`);
}
await sharp('public/assets/moon-source.png').resize(960).webp({ quality: 85, alphaQuality: 100 }).toFile('public/assets/moon.webp');
console.log('Moon:', JSON.stringify(await sharp('public/assets/moon.webp').metadata()));
await writeFile('public/assets/sources.json', JSON.stringify({ fetchedAt: new Date().toISOString(), assets }, null, 2) + '\n');

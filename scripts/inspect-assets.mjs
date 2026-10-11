import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('.cache/asset-pages', { recursive: true });
const sites = {
  phigros: 'https://www.pigeongames.cn/',
  delta: 'https://df.qq.com/',
  genshin: 'https://genshin.hoyoverse.com/en/home',
  zzz: 'https://zzz.hoyoverse.com/en-us/',
  minecraft: 'https://www.minecraft.net/en-us',
};
await Promise.all(Object.entries(sites).map(async ([name, url]) => {
  try {
    const res = await fetch(url);
    const html = await res.text();
    await writeFile(`.cache/asset-pages/${name}.html`, html);
    const tags = html.match(/<(?:meta|link|img)\b[^>]*>/gi) || [];
    console.log(JSON.stringify({ name, url: res.url, status: res.status, tags: tags.filter(x => /icon|og:image|logo|\.png|\.webp/i.test(x)).slice(0, 14) }));
  } catch (e) { console.log(JSON.stringify({ name, error: String(e) })); }
}));
const github = await fetch('https://api.github.com/users/STMfan', { headers: { 'User-Agent': 'STMfan-portfolio-asset-fetch' } });
const profile = await github.json();
await mkdir('public/assets/games', { recursive: true });
if (profile.avatar_url) {
  const avatar = await fetch(profile.avatar_url + '&s=320');
  await writeFile('public/assets/avatar.png', Buffer.from(await avatar.arrayBuffer()));
  console.log(JSON.stringify({ avatar: profile.avatar_url, saved: 'public/assets/avatar.png' }));
}

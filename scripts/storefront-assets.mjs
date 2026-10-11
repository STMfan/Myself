import { writeFile } from 'node:fs/promises';
for (const term of ['Phigros', 'Zenless Zone Zero', 'Genshin Impact']) {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=software&country=us&limit=3`;
    const data = await (await fetch(url)).json();
    console.log(JSON.stringify({ term, results: data.results.map(({ trackName, sellerName, trackId, artworkUrl512, artworkUrl100 }) => ({ trackName, sellerName, trackId, artworkUrl512, artworkUrl100 })) }));
    await writeFile(`.cache/asset-pages/${term.replaceAll(' ', '-')}.json`, JSON.stringify(data, null, 2));
  } catch (e) { console.log(JSON.stringify({ term, error: String(e) })); }
}

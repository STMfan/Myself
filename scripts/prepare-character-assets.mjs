import sharp from 'sharp';
import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const imageRoot = 'C:/Users/STMfan/.codex/generated_images/01a12a63-4c20-78e3-bb5e-03b16427bc23';
const inputRoot = 'C:/Users/STMfan/Downloads/Chara';
const items = [
  { id: 'wriothesley', source: 'Wriothesley.jpg', generated: 'exec-54946081-a1fb-4c60-b7bc-72e5247d4cb3.png', intermediate: 'exec-13f242c7-9151-4cae-986c-c06e04c8be83.png', prompt: "Use case: background-extraction and edge completion. Edit Image 1 into a HALF-BODY transparent sticker of Wriothesley for a personal website; Image 2 is the original identity reference. Change only framing, background removal and reconstruction of cut-off outer coat edges. Keep his original face, hair, raised-fist pose, hands, costume and illustration style. Reframe from the top of hair to just below the belt/hips, NOT thighs or knees. Use a SQUARE wide canvas and zoom out enough to fit BOTH entire flowing black/red coat edges within the frame, naturally completing the fabric that is currently cut off. Show complete hair, gloves, elbows and shoulder silhouette. Leave at least 8% completely transparent margin on every side. Remove the blurry black and gray background COMPLETELY, and remove all background haze and shadows; only character pixels should remain. Genuinely transparent alpha surrounding him, including gaps between arms/coat. NO gradient backdrop, circular crop, vignette, checkerboard pixels, border, text or logo. Flat clean waist crop at bottom. This is a large isolated character sticker, with complete side silhouette and clean transparency.", owner: 'HoYoverse' },
  { id: 'varka', source: 'Varka.png', generated: 'exec-a17a3a31-1f60-4b3f-b92d-5eb0f34d8f9a.png', detail: 'Keep the blond man, both arms and sword crossing his torso, cape and shoulder fur. Crop below the belt.', owner: 'HoYoverse' },
  { id: 'lycaon', source: 'Von Lycann.png', generated: 'exec-9aedaeec-8766-4961-9114-f6454fbdfcc2.png', detail: 'Keep the white wolf man including ears, head, neck scarf, both arms and upper torso. Crop at waist and omit the enormous leg in the lower left.', owner: 'HoYoverse' },
  { id: 'vyron', source: '威龙4096_2160.png', generated: 'exec-ca65f3a4-75d5-4eee-bb2f-7f5ffa26fdc8.png', detail: 'Keep the helmeted masked soldier on the left, helmet fully within frame, both shoulders, arms, chest tactical equipment and his held weapon. Crop at his waist.', owner: 'Tencent / Team Jade' },
  { id: 'bit', source: '比特侧身3840_2160.jpg', generated: 'exec-5b47a51f-ff62-476b-bd21-17f46c9779e8.png', detail: 'Keep ONLY the glasses-wearing man in the center, the same side-facing pose, both arms, tablet and attached tactical equipment. Crop at his waist. Remove all monitors and other foreground people.', owner: 'Tencent / Team Jade' },
];
const prompt = detail => `Use case: background-extraction. Edit target: the supplied game character artwork. Create a clean transparent PNG cutout for a personal website. This is an extraction, not a redesign. Preserve the exact character identity, face, hairstyle, original pose, costume, equipment, drawing/rendering style and source colors. ${detail} Center the isolated waist-up character with modest transparent breathing space around the hair and shoulders. Remove all background scenery, ornamental graphics, logos and source typography. Do not add anything, do not repaint facial features, do not change lighting or pose, do not invent limbs. Clean accurate alpha edges; background must be genuinely transparent, no checkerboard pixels, no colored halo, no ground shadow. Retain source detail.`;
await mkdir('.cache/characters', { recursive: true });
await mkdir('public/assets/characters', { recursive: true });
const evidence = [];
for (const item of items) {
  const sourceBytes = await readFile(`${inputRoot}/${item.source}`);
  const sourceHash = createHash('sha256').update(sourceBytes).digest('hex');
  const cachePath = `.cache/characters/${item.id}-cutout.png`;
  await copyFile(`${imageRoot}/${item.generated}`, cachePath);
  const output = `public/assets/characters/${item.id}.webp`;
  await sharp(cachePath).resize({ width: 1000, height: 900, fit: 'inside', withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 100 }).toFile(output);
  const stats = await sharp(output).stats();
  const meta = await sharp(output).metadata();
    if (!meta.hasAlpha || stats.channels[3].min !== 0 || stats.channels[3].max !== 255) throw new Error(`Missing alpha in ${item.id}`);
  evidence.push({ id: item.id, sourceFile: item.source, sourceSha256: sourceHash, owner: item.owner, preparedWith: item.intermediate ? 'Codex built-in ImageGen background-extraction and user-authorized coat edge completion; Sharp WebP resize/compression' : 'Codex built-in ImageGen background-extraction; Sharp WebP resize/compression', intermediate: item.intermediate, prompt: item.prompt || prompt(item.detail), output: `/assets/characters/${item.id}.webp`, outputSha256: createHash('sha256').update(await readFile(output)).digest('hex'), width: meta.width, height: meta.height, hasAlpha: meta.hasAlpha });
  console.log(`${item.id}: ${meta.width}×${meta.height}, verified transparent alpha`);
}
await writeFile('public/assets/characters/sources.json', `${JSON.stringify({ suppliedBy: 'STMfan, 2026-10-11', assets: evidence }, null, 2)}\n`);

import sharp from 'sharp';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const specs=[
  {
    "kind": "armillary",
    "source": "C:/Users/STMfan/.codex/generated_images/01a12fca-7afe-7052-b95a-2517e0fa669e/exec-a40d2447-3453-43e1-9216-5dc8cbc3d61f.png",
    "prompt": "Use case: stylized-concept. Asset type: transparent decorative 3D object for STMfan's moon-themed personal website. A single exquisitely crafted silver-chrome and frosted optical-glass armillary sphere, three intersecting slender orbital rings surrounding an empty central space, with one small pale icy-cyan glass bead on an orbit. A modern celestial instrument, poised and slightly tilted, physically plausible studio 3D render, subtle machining, reflective cool white highlights, convincing depth. Floating isolated object occupying 75% of a square canvas, generous empty margins for rotation in the website. Arctic signal palette: silver, smoky transparent glass, a trace of cyan. The sphere should remain readable on both dark charcoal and pale blue-gray backgrounds. Crisp clean cutout, actual alpha transparency, no ground, no floor, no cast background shadow, no halo or colored background. No text, numbers, logos, starfield, UI, frame, or watermark."
  },
  {
    "kind": "lunar-shard",
    "source": "C:/Users/STMfan/.codex/generated_images/01a12fca-7afe-7052-b95a-2517e0fa669e/exec-192e057a-b175-46f4-ae23-5f3ef880f6c0.png",
    "prompt": "Use case: stylized-concept. Asset type: transparent decorative lunar fragment for a cinematic moon-themed personal website. A solitary floating sculptural crescent fragment of real-looking lunar basalt, shaped like a curved section of moon crust with rugged cratered stone on one face and a finely polished silver edge catching icy white light. The fragment has an elegant diagonal silhouette, organic yet precise, highly detailed tactile charcoal rock and small cool silver facets. Slightly three-quarter view, studio lighting from upper left, poised in the void. One object, no debris cloud. Isolated square composition with spacious margins, occupying 70% of frame, suitable for a slow rotating cutout. Sophisticated photorealistic 3D still, restrained icy cyan reflection, designed to accompany an existing moon image and thin white flowing curves on a developer portfolio. Actual transparent background; no ground, background, glow halo, typography, letters, marks, logos or watermarks."
  }
];
await mkdir('public/assets/decor',{recursive:true});
const evidence=[];
for(const spec of specs){
  const output=`public/assets/decor/${spec.kind}.webp`;
  await sharp(spec.source).resize(768,768,{fit:'inside'}).webp({quality:85,alphaQuality:100}).toFile(output);
  const meta=await sharp(output).metadata(), stats=await sharp(output).stats();
  if(!meta.hasAlpha||stats.channels[3].min!==0||stats.channels[3].max!==255)throw new Error('Opaque decorative asset');
  evidence.push({kind:spec.kind,file:`/assets/decor/${spec.kind}.webp`,prompt:spec.prompt,generatedWith:'Codex built-in ImageGen',generatedAt:'2026-10-13',width:meta.width,height:meta.height,hasAlpha:meta.hasAlpha,sha256:createHash('sha256').update(await readFile(output)).digest('hex')});
  console.log(`${spec.kind}: ${meta.width}x${meta.height}, transparent alpha verified`);
}
await writeFile('public/assets/decor/sources.json',JSON.stringify(evidence,null,2)+'\n');

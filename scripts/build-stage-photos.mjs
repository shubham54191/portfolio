// Builds the "On the National Stage" photos.
// Put originals in photos/stage/<name>.jpg (or .jpeg/.png/.webp/.heic), then run `npm run stage-photos`.
// Writes public/assets/stage/<name>-{800,1600}.{avif,webp}. Then add the photo to stageMoments in
// src/data/portfolio.ts as { file: '<name>', alt: '…' } — as a cover, in photos, or under a day.
import sharp from 'sharp';
import { mkdirSync, readdirSync } from 'node:fs';
import { join, parse } from 'node:path';

const IN = 'photos/stage';
const OUT = 'public/assets/stage';
mkdirSync(OUT, { recursive: true });

for (const file of readdirSync(IN)) {
  const { name, ext } = parse(file);
  if (!/\.(jpe?g|png|webp|heic)$/i.test(ext)) continue;
  const img = sharp(join(IN, file)).rotate(); // respect the camera's orientation
  for (const w of [800, 1600]) {
    const sized = img.clone().resize({ width: w, withoutEnlargement: true });
    await sized.clone().avif({ quality: 58, effort: 5 }).toFile(join(OUT, `${name}-${w}.avif`));
    await sized.clone().webp({ quality: 82 }).toFile(join(OUT, `${name}-${w}.webp`));
  }
  console.log('built', name);
}

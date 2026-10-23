// Builds optimized portrait assets from pic.png (background-removed, upscaled cutout).
// Swap pic.png for a new transparent PNG of the same framing and run `npm run images`.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = 'public/assets';
mkdirSync(OUT, { recursive: true });

const cutout = await sharp('pic.png').ensureAlpha().png().toBuffer();

for (const w of [1200, 960, 720, 420]) {
  await sharp(cutout).resize({ width: w }).webp({ quality: 90, alphaQuality: 92 }).toFile(`${OUT}/portrait-${w}.webp`);
}

// Social share image (1200x630) on a dark backdrop
const portrait = await sharp(cutout).resize({ height: 600 }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#07070a' } })
  .composite([
    {
      input: Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="g" cx="78%" cy="45%" r="45%"><stop offset="0" stop-color="#e5132b" stop-opacity="0.45"/><stop offset="1" stop-color="#e5132b" stop-opacity="0"/></radialGradient>
        <linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0.7" stop-color="#07070a" stop-opacity="0"/><stop offset="1" stop-color="#07070a"/></linearGradient></defs>
        <rect width="1200" height="630" fill="url(#g)"/>
      </svg>`),
    },
    { input: portrait, left: 1200 - 560, top: 40 },
    {
      input: Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0.72" stop-color="#07070a" stop-opacity="0"/><stop offset="1" stop-color="#07070a"/></linearGradient></defs>
        <rect width="1200" height="630" fill="url(#f)"/>
        <text x="72" y="300" font-family="Impact, 'Arial Narrow', sans-serif" font-size="128" fill="#f4f1ec" letter-spacing="4">SHUBHAM</text>
        <text x="78" y="352" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="26" fill="#ff3d5a" letter-spacing="16">THE SERIES</text>
        <text x="78" y="420" font-family="Helvetica, Arial, sans-serif" font-weight="600" font-size="18" fill="#a7a6ad" letter-spacing="5">AI-NATIVE ENGINEER • FULL-STACK BUILDER</text>
      </svg>`),
    },
  ])
  .jpeg({ quality: 85 })
  .toFile(`${OUT}/og-image.jpg`);
console.log('images built');

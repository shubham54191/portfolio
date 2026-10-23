// Encodes the rendered PNG frames into the web formats the site loads.
//   node scripts/live-portrait/encode.cjs <render-dir> <public/assets/live>
// <render-dir> holds meta.json, base_rgb_alpha.png and png/p{pitch}y{yaw}e{eye}.png (from gen3.py).
// Output: avif/*.avif (full size, primary), webp/*.webp (80% size, fallback), base.avif, base.webp.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require(process.env.SHARP_PATH || 'sharp');

const [src, out] = process.argv.slice(2);
const meta = JSON.parse(fs.readFileSync(path.join(src, 'meta.json'), 'utf8'));
const [rx, ry, rw, rh] = meta.rect;
fs.mkdirSync(path.join(out, 'avif'), { recursive: true });
fs.mkdirSync(path.join(out, 'webp'), { recursive: true });

(async () => {
  // base: the body with the frame rectangle cut out (frames are drawn there)
  const { data, info } = await sharp(path.join(src, 'base_rgb_alpha.png')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) {
    const i = (y * info.width + x) * 4;
    data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0;
  }
  const base = sharp(data, { raw: info });
  await base.clone().avif({ quality: 62, effort: 4 }).toFile(path.join(out, 'base.avif'));
  await base.clone().webp({ quality: 86, alphaQuality: 90 }).toFile(path.join(out, 'base.webp'));

  const files = fs.readdirSync(path.join(src, 'png')).filter((f) => f.endsWith('.png'));
  let a = 0, w = 0;
  for (const f of files) {
    const name = f.replace('.png', '');
    const avPath = path.join(out, 'avif', name + '.avif');
    const wbPath = path.join(out, 'webp', name + '.webp');
    if (fs.existsSync(avPath) && fs.existsSync(wbPath)) continue; // already encoded
    const img = sharp(path.join(src, 'png', f));
    const av = await img.clone().avif({ quality: 60, effort: 4 }).toBuffer();
    fs.writeFileSync(avPath, av);
    const wb = await img.clone().resize({ width: Math.round(rw * 0.8) }).webp({ quality: 78, alphaQuality: 85 }).toBuffer();
    fs.writeFileSync(wbPath, wb);
    a += av.length; w += wb.length;
  }
  console.log(`${files.length} frames (new this run: ${a ? 'yes' : 'none'})  avif ${(a / 1e6).toFixed(2)} MB  webp ${(w / 1e6).toFixed(2)} MB`);
})();

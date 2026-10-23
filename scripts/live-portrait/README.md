# Live portrait frames

The hero and About portraits turn their head toward the cursor and blink. That motion is
pre-rendered from one photo into `public/assets/live/`:

- `avif/p{pitch}y{yaw}e{eye}.avif` — 17 yaw × 5 pitch head poses × 2 eye states = 170 HD frames
  (primary set, ~20 KB each)
- `webp/…` — the same frames at 80% size, for browsers without AVIF
- `base.avif` / `base.webp` — the body with a soft, head-shaped hole the frames fill
  (`softbase.py`; a soft hole instead of a hard rectangle means no hairline seam when scaled)

`src/components/LivePortrait.tsx` draws the body once and only redraws the small head layer. Frames
are kept compressed and decoded off the main thread (`createImageBitmap`) into a small cache
around the current pose, so fast cursor flicks never wait on an image decode.

## How the frames are made

Offline, with Python + onnxruntime and the open LivePortrait models (the ONNX exports in the
facefusion-assets `models-3.0.0` release):

- `live_portrait_feature_extractor`, `live_portrait_motion_extractor`,
  `live_portrait_eye_retargeter`, `live_portrait_stitcher`, `live_portrait_generator` — pose + eyes
- `2dfan4` — 68 face landmarks
- `gfpgan_1.4` — face detail restore (blended at 85%), followed by a light unsharp mask on the head
- `u2net_human_seg` (rembg release) — background removal

1. `python3 gen3.py` (uses `lp.py`) renders `out3/png/*.png` and `out3/meta.json`.
   Set `LP_MODELS` to the folder with the .onnx models and `LP_WORK` to a working folder holding
   `img/src.png` (original photo), `img/up.png` (4× upscale) and `lm68.npy` (68 face landmarks).
2. `node encode.cjs out3 ../../public/assets/live` writes the AVIF/WebP sets.
3. Copy `out3/meta.json` values into `src/data/livePortrait.ts`, save `out3/neutral_full.png`
   as `pic.png` in the project root and run `npm run images` for the static portraits.

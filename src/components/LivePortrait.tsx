import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';
import { livePortrait as LP } from '../data/livePortrait';

/**
 * A "living" portrait: the head turns toward the cursor and the eyes blink.
 *
 * The frames are pre-rendered from the photo (see scripts/live-portrait/README.md):
 * 17 yaw × 5 pitch head poses × 2 eye states (open, closed), each a small patch covering the head.
 *
 * Built to stay smooth when the cursor is flicked quickly:
 * - the body is a static layer drawn once; only the small head patch is redrawn each frame;
 * - frames are kept compressed in memory and decoded off the main thread (createImageBitmap)
 *   into two caches: every pose at half size (decoded up front, so motion in any direction always
 *   has a frame) and full-size frames around the current pose — drawing never waits on a decode;
 * - the head moves on a critically damped spring (natural acceleration, no overshoot) and,
 *   while moving fast, cross-fades neighbouring frames; at rest it settles on one crisp frame;
 * - no filters over the changing canvas; the bottom fade is one static mask on the whole box.
 * On touch screens (no cursor) the head drifts slowly on its own.
 */

type Props = {
  /** Positions and sizes the portrait box (its aspect ratio is fixed by the frames). */
  className?: string;
  /** Follow the pointer on devices that have one. */
  follow?: boolean;
  alt: string;
  /** Static image shown until the frames are ready (and for reduced motion). */
  fallbackSrc: string;
  fallbackSrcSet?: string;
  sizes?: string;
  priority?: boolean;
  /** Bottom fade as fractions of the height: fully visible above [0], transparent below [1]. */
  fade?: [number, number];
};

const AVIF_PROBE = 'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAAXBtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAADRpbG9jAAAAAERAAAIAAQAAAAABlAABAAAAAAAAAB0AAgAAAAABsQABAAAAAAAAABAAAAA4aWluZgAAAAAAAgAAABVpbmZlAgAAAAABAABhdjAxAAAAABVpbmZlAgAAAAACAABhdjAxAAAAAA5waXRtAAAAAAABAAAAr2lwcnAAAACKaXBjbwAAAAxhdjFDgSACAAAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAcAAAAAA5waXhpAAAAAAEIAAAAOGF1eEMAAAAAdXJuOm1wZWc6bXBlZ0I6Y2ljcDpzeXN0ZW1zOmF1eGlsaWFyeTphbHBoYQAAAAAdaXBtYQAAAAAAAAACAAEDgQIDAAIEhAIFhgAAABppcmVmAAAAAAAAAA5hdXhsAAIAAQABAAAANW1kYXQSAAoHOAAGkBDQaTIQGUJjBMAANAAAkEDOl7ddEhIACgQYAAYVMgYYAAABQA8=';
type Fmt = 'avif' | 'webp';
let fmtPromise: Promise<Fmt> | null = null;
/** HD frames ship as AVIF; browsers without AVIF-with-alpha get the WebP set. */
function pickFormat() {
  if (!fmtPromise)
    fmtPromise = new Promise<Fmt>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width > 0 ? 'avif' : 'webp');
      img.onerror = () => resolve('webp');
      img.src = AVIF_PROBE;
    });
  return fmtPromise;
}

/** compressed frames, shared by every portrait on the page */
const blobs = new Map<string, Promise<Blob>>();
function fetchBlob(url: string) {
  let p = blobs.get(url);
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return r.blob();
    });
    p.catch(() => blobs.delete(url));
    blobs.set(url, p);
  }
  return p;
}

async function decode(blob: Blob, w: number, h: number): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(blob, { resizeWidth: w, resizeHeight: h, resizeQuality: 'high' });
  } catch {
    return createImageBitmap(blob); // older engines without resize options; drawImage scales instead
  }
}

const NY = LP.yaws.length;
const NP = LP.pitches.length;
const CY = (NY - 1) / 2;
const CP = (NP - 1) / 2;
const [RX, RY, RW, RH] = LP.rect;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const snap = (t: number) => clamp((t - 0.3) / 0.4, 0, 1);
const key = (pi: number, yi: number, ei: number) => `${pi}-${yi}-${ei}`;

export default function LivePortrait({ className = '', follow = true, alt, fallbackSrc, fallbackSrcSet, sizes, priority, fade = [1, 1] }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLCanvasElement>(null);
  const headRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const reduce = useReducedMotion();
  const [f0, f1] = fade;

  useEffect(() => {
    if (reduce) return;
    const box = boxRef.current!;
    const baseC = baseRef.current!;
    const headC = headRef.current!;
    const bctx = baseC.getContext('2d')!;
    const hctx = headC.getContext('2d')!;
    const row = document.createElement('canvas');
    const rctx = row.getContext('2d')!;

    let alive = true;
    let fmt: Fmt = 'webp';
    const url = (pi: number, yi: number, ei: number) => `${LP.dir}${fmt}/p${pi}y${yi}e${ei}.${fmt}`;

    const fine = follow && window.matchMedia('(pointer: fine)').matches;
    const rows = fine ? [...Array(NP).keys()] : [CP]; // touch screens only drift left/right

    // ---------- sizing: draw at the size it is shown (× device pixels), never above native
    let s = 1;
    let sized = false;
    let pw = RW;
    let ph = RH;
    function measure() {
      const h = box.clientHeight || LP.height;
      const next = clamp((h * Math.min(window.devicePixelRatio || 1, 2)) / LP.height, 0.25, 1);
      if (sized && Math.abs(next - s) / s < 0.08) return false;
      sized = true;
      s = next;
      baseC.width = Math.round(LP.width * s);
      baseC.height = Math.round(LP.height * s);
      pw = headC.width = row.width = Math.round(RW * s);
      ph = headC.height = row.height = Math.round(RH * s);
      return true;
    }

    // ---------- decoded bitmaps, two tiers, all decoded off the main thread
    // lo: every open-eyed pose at half size, decoded once up front — motion in any direction always
    //     has a frame ready, however fast the cursor moves.
    // hi: full-size frames around where the head is and where it is going (LRU) — used whenever ready,
    //     and always for the pose it settles on.
    const hi = new Map<string, ImageBitmap>();
    const lo = new Map<string, ImageBitmap>();
    const pending = new Set<string>();
    let loPending = 0;
    let loQueue: string[] = [];
    let want: string[] = [];
    let budget = 24;
    let lw = 1;
    let lh = 1;
    function setBudget() {
      budget = clamp(Math.floor((64 * 1024 * 1024) / (pw * ph * 4)), 12, 60);
      lw = Math.max(1, Math.round(pw * 0.5));
      lh = Math.max(1, Math.round(ph * 0.5));
    }
    function frame(k: string) {
      const b = hi.get(k);
      if (b) {
        hi.delete(k); // refresh LRU position
        hi.set(k, b);
        return b;
      }
      return lo.get(k);
    }
    function evict() {
      const keep = new Set(want.slice(0, budget));
      for (const [k, b] of hi) {
        if (hi.size <= budget) break;
        if (keep.has(k)) continue;
        b.close();
        hi.delete(k);
      }
    }
    let gen = 0; // bumps when the size changes, so stale decodes are dropped
    function pump() {
      for (const k of want) {
        if (pending.size >= 2) break;
        if (hi.has(k) || pending.has(k)) continue;
        const [pi, yi, ei] = k.split('-').map(Number);
        const g = gen;
        pending.add(k);
        fetchBlob(url(pi, yi, ei))
          .then((b) => decode(b, pw, ph))
          .then((bm) => {
            pending.delete(k);
            if (!alive || g !== gen) return bm.close();
            hi.set(k, bm);
            evict();
            dirty = true;
            pump();
          })
          .catch(() => {
            pending.delete(k);
          });
      }
      // background: fill the low tier, one or two at a time, after the urgent full-size work
      while (loQueue.length && loPending < (pending.size ? 1 : 2)) {
        const k = loQueue.shift()!;
        if (lo.has(k)) continue;
        const [pi, yi, ei] = k.split('-').map(Number);
        const g = gen;
        loPending++;
        fetchBlob(url(pi, yi, ei))
          .then((b) => decode(b, lw, lh))
          .then((bm) => {
            loPending--;
            if (!alive || g !== gen) return bm.close();
            lo.set(k, bm);
            dirty = true;
            pump();
          })
          .catch(() => {
            loPending--;
            pump();
          });
      }
    }
    function queueLow() {
      const all: [number, number][] = [];
      for (const pi of rows) for (let yi = 0; yi < NY; yi++) all.push([pi, yi]);
      all.sort((u, v) => Math.abs(u[0] - CP) * 2 + Math.abs(u[1] - CY) - (Math.abs(v[0] - CP) * 2 + Math.abs(v[1] - CY)));
      loQueue = all.map(([pi, yi]) => key(pi, yi, 0));
    }

    // ---------- pose: critically damped spring on yaw/pitch (frame-index space)
    const pose = { y: CY, p: CP, vy: 0, vp: 0, ty: CY, tp: CP };
    let eyeMix = 0;
    let lastPointer = -1e9;
    let dirty = true;
    let last = performance.now();

    function plan() {
      // what to decode at full size, most important first: where the head is going, where it is,
      // then the straight path between (yaw and pitch together)
      const list: string[] = [];
      const add = (pi: number, yi: number, ei = 0) => {
        if (pi < 0 || pi >= NP || yi < 0 || yi >= NY || !rows.includes(pi)) return;
        const k = key(pi, yi, ei);
        if (!list.includes(k)) list.push(k);
      };
      const ty = Math.round(pose.ty), tp = Math.round(pose.tp);
      const still = Math.hypot(pose.vy, pose.vp) < 0.3;
      add(tp, ty);
      const y0 = Math.floor(pose.y), p0 = Math.floor(pose.p);
      add(p0, y0); add(p0, y0 + 1); add(p0 + 1, y0); add(p0 + 1, y0 + 1);
      // eyes-closed frame for the next blink — only once the head is (nearly) still
      if (still) add(Math.round(pose.p), Math.round(pose.y), 1);
      const n = Math.ceil(Math.max(Math.abs(pose.ty - pose.y), Math.abs(pose.tp - pose.p)) * 2) + 1;
      for (let i = n; i >= 0; i--) {
        const t = i / n;
        const yy = pose.y + (pose.ty - pose.y) * t, pp = pose.p + (pose.tp - pose.p) * t;
        add(Math.round(pp), Math.round(yy));
        add(Math.floor(pp), Math.floor(yy)); add(Math.floor(pp), Math.ceil(yy));
        add(Math.ceil(pp), Math.floor(yy)); add(Math.ceil(pp), Math.ceil(yy));
      }
      if (still) add(tp, ty, 1);
      want = list;
    }

    function nearest(ei: number) {
      let best: ImageBitmap | undefined;
      let bd = Infinity;
      for (const m of [hi, lo])
        for (const [k, b] of m) {
          const [pi, yi, e] = k.split('-').map(Number);
          if (e !== ei) continue;
          const d = Math.abs(pi - pose.p) * 2 + Math.abs(yi - pose.y);
          if (d < bd) {
            bd = d;
            best = b;
          }
        }
      return best;
    }

    // test hook: a test page can define window.__lpStats to count draws and missing-frame fallbacks
    const stats = (window as unknown as { __lpStats?: { draws: number; miss: number } }).__lpStats;

    function draw() {
      if (stats) stats.draws++;
      const speed = Math.hypot(pose.vy, pose.vp * 2); // frames per second
      const crisp = clamp(1 - speed / 3, 0, 1); // moving: smooth cross-fade · resting: one sharp frame
      const y0 = Math.floor(pose.y), y1 = Math.min(NY - 1, y0 + 1), fy = pose.y - y0;
      const p0 = Math.floor(pose.p), p1 = Math.min(NP - 1, p0 + 1), fp = pose.p - p0;
      const ty = fy + (snap(fy) - fy) * crisp;
      const tp = fp + (snap(fp) - fp) * crisp;
      const a = frame(key(p0, y0, 0)), b = frame(key(p0, y1, 0));
      const c = frame(key(p1, y0, 0)), d = frame(key(p1, y1, 0));

      hctx.globalCompositeOperation = 'source-over';
      hctx.clearRect(0, 0, pw, ph);
      if (a && b && (tp < 0.01 || (c && d))) {
        hctx.globalAlpha = 1;
        hctx.drawImage(a, 0, 0, pw, ph);
        if (b !== a && ty > 0.01) {
          hctx.globalAlpha = ty;
          hctx.drawImage(b, 0, 0, pw, ph);
        }
        if (tp > 0.01 && c && d) {
          rctx.clearRect(0, 0, pw, ph);
          rctx.globalAlpha = 1;
          rctx.drawImage(c, 0, 0, pw, ph);
          if (ty > 0.01) {
            rctx.globalAlpha = ty;
            rctx.drawImage(d, 0, 0, pw, ph);
          }
          hctx.globalAlpha = tp;
          hctx.drawImage(row, 0, 0);
        }
      } else {
        if (stats) stats.miss++;
        const n = frame(key(Math.round(pose.p), Math.round(pose.y), 0)) ?? nearest(0);
        if (!n) return false;
        hctx.globalAlpha = 1;
        hctx.drawImage(n, 0, 0, pw, ph);
      }
      if (eyeMix > 0.01) {
        const e = hi.get(key(Math.round(pose.p), Math.round(pose.y), 1));
        if (e) {
          hctx.globalAlpha = eyeMix;
          hctx.drawImage(e, 0, 0, pw, ph);
        }
      }
      hctx.globalAlpha = 1;
      return true;
    }

    let raf = 0;
    function tick(now: number) {
      if (!alive) return;
      const dt = Math.min(0.034, (now - last) / 1000);
      last = now;
      const following = fine && now - lastPointer < 4000;
      if (!following) {
        // idle: look around slowly, pausing on real frames
        const t = now / 1000;
        pose.ty = Math.round(CY + CY * (0.6 * Math.sin(t * 0.33) + 0.22 * Math.sin(t * 0.71 + 1.3)));
        pose.tp = fine ? Math.round(CP + CP * 0.5 * Math.sin(t * 0.27 + 0.6)) : CP;
      } else if (now - lastPointer > 140) {
        // the cursor has stopped: settle on the nearest real frame
        pose.ty = Math.round(pose.ty);
        pose.tp = Math.round(pose.tp);
      }
      const w = following ? 15 : 5.5; // spring stiffness (rad/s)
      const step = (x: number, v: number, t: number) => {
        v += (w * w * (t - x) - 2 * w * v) * dt;
        return [x + v * dt, v];
      };
      const moving = Math.abs(pose.ty - pose.y) > 0.002 || Math.abs(pose.tp - pose.p) > 0.002 || Math.abs(pose.vy) > 0.01 || Math.abs(pose.vp) > 0.01;
      if (moving) {
        [pose.y, pose.vy] = step(pose.y, pose.vy, pose.ty);
        [pose.p, pose.vp] = step(pose.p, pose.vp, pose.tp);
        pose.y = clamp(pose.y, 0, NY - 1);
        pose.p = clamp(pose.p, 0, NP - 1);
        if (Math.abs(pose.ty - pose.y) < 0.002 && Math.abs(pose.vy) < 0.01) [pose.y, pose.vy] = [pose.ty, 0];
        if (Math.abs(pose.tp - pose.p) < 0.002 && Math.abs(pose.vp) < 0.01) [pose.p, pose.vp] = [pose.tp, 0];
        dirty = true;
      }
      if (dirty) {
        plan();
        pump();
        if (draw()) dirty = false;
      }
      raf = requestAnimationFrame(tick);
    }

    function onPointer(e: PointerEvent) {
      const r = box.getBoundingClientRect();
      if (!r.width) return;
      // aim from the face (upper third of the portrait), normalised by the room on each side
      const fx = r.left + r.width / 2;
      const fy = r.top + r.height * 0.3;
      const dx = e.clientX - fx, dy = e.clientY - fy;
      const roomX = Math.max(0.3 * window.innerWidth, dx > 0 ? window.innerWidth - fx : fx);
      const roomY = Math.max(0.42 * window.innerHeight, dy > 0 ? window.innerHeight - fy : fy);
      const nx = clamp(dx / (0.85 * roomX), -1, 1);
      const ny = clamp(dy / (0.85 * roomY), -1, 1);
      pose.ty = CY - nx * CY * LP.yawSign;
      pose.tp = CP + ny * CP * LP.pitchSign;
      lastPointer = performance.now();
      dirty = true;
    }

    // natural blink every 2.5–6 s (sometimes a double blink); waits while the head is moving
    let blinkTimer = 0;
    let blinkRaf = 0;
    const scheduleBlink = (ms = 2500 + Math.random() * 3500) => {
      blinkTimer = window.setTimeout(blink, ms);
    };
    function blink() {
      const e = hi.get(key(Math.round(pose.p), Math.round(pose.y), 1));
      if (!e || Math.hypot(pose.vy, pose.vp) > 0.5) return scheduleBlink(350);
      const t0 = performance.now();
      const close = 70, hold = 60, open = 120;
      const anim = (now: number) => {
        if (!alive) return;
        const t = now - t0;
        eyeMix = t < close ? t / close : t < close + hold ? 1 : Math.max(0, 1 - (t - close - hold) / open);
        dirty = true;
        if (t < close + hold + open) blinkRaf = requestAnimationFrame(anim);
        else if (Math.random() < 0.18) scheduleBlink(180);
        else scheduleBlink();
      };
      blinkRaf = requestAnimationFrame(anim);
    }

    // only animate while on screen
    let running = false;
    const start = () => {
      if (running || !alive) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
      scheduleBlink();
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(blinkRaf);
      clearTimeout(blinkTimer);
      eyeMix = 0;
      dirty = true;
    };
    const io = new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop()));

    async function drawBase() {
      // the body, with a soft head-shaped hole the head layer fills (see scripts/live-portrait/softbase.py)
      const bm = await decode(await fetchBlob(`${LP.dir}base.${fmt}`), baseC.width, baseC.height);
      if (!alive) return bm.close();
      bctx.clearRect(0, 0, baseC.width, baseC.height);
      bctx.drawImage(bm, 0, 0, baseC.width, baseC.height);
      bm.close();
    }

    const ro = new ResizeObserver(() => {
      if (!alive || !measure()) return;
      gen++;
      for (const m of [hi, lo]) {
        for (const b of m.values()) b.close();
        m.clear();
      }
      setBudget();
      queueLow();
      drawBase().catch(() => undefined);
      dirty = true;
      pump();
    });

    (async () => {
      try {
        fmt = await pickFormat();
        measure();
        setBudget();
        const nk = key(CP, CY, 0);
        const [, nb] = await Promise.all([drawBase(), fetchBlob(url(CP, CY, 0)).then((b) => decode(b, pw, ph))]);
        if (!alive) return nb.close();
        hi.set(nk, nb);
        draw();
        setReady(true);
        ro.observe(box);
        io.observe(box);
        if (fine) window.addEventListener('pointermove', onPointer, { passive: true });
        queueLow();
        plan();
        pump();
        // download the rest in the background, nearest poses first
        const rest: [number, number, number][] = [];
        for (const pi of rows) for (let yi = 0; yi < NY; yi++) for (let ei = 0; ei < 2; ei++) rest.push([pi, yi, ei]);
        const cost = ([pi, yi, ei]: [number, number, number]) => Math.abs(pi - CP) * 3 + Math.abs(yi - CY) + ei * 0.2;
        rest.sort((u, v) => cost(u) - cost(v));
        for (let i = 0; i < rest.length && alive; i += 8) {
          await Promise.all(rest.slice(i, i + 8).map(([pi, yi, ei]) => fetchBlob(url(pi, yi, ei)).catch(() => undefined)));
        }
      } catch {
        /* frames unavailable — the static image stays */
      }
    })();

    return () => {
      alive = false;
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      for (const m of [hi, lo]) {
        for (const b of m.values()) b.close();
        m.clear();
      }
    };
  }, [reduce, follow, f0, f1]);

  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const mask = f0 < 1 ? `linear-gradient(to bottom, #000 ${f0 * 100}%, transparent ${f1 * 100}%)` : undefined;
  const layer: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%' };

  return (
    // one static mask on the whole box (applied once at composite time, so both layers fade together)
    <div ref={boxRef} className={className} style={{ aspectRatio: `${LP.width} / ${LP.height}`, maskImage: mask, WebkitMaskImage: mask }}>
      <img
        src={fallbackSrc}
        srcSet={fallbackSrcSet}
        sizes={sizes}
        alt={ready ? '' : alt}
        aria-hidden={ready || undefined}
        fetchPriority={priority ? 'high' : undefined}
        loading={priority ? undefined : 'lazy'}
        draggable={false}
        style={{ ...layer, objectFit: 'contain' }}
        className={`transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-100'}`}
      />
      {!reduce && (
        <>
          <canvas ref={baseRef} aria-hidden style={layer} className={`transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`} />
          <canvas
            ref={headRef}
            role="img"
            aria-label={alt}
            style={{ position: 'absolute', left: pct(RX, LP.width), top: pct(RY, LP.height), width: pct(RW, LP.width), height: pct(RH, LP.height) }}
            className={`transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
          />
        </>
      )}
    </div>
  );
}

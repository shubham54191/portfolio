import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { stageMoments, type StageDay, type StageMoment, type StagePhoto } from '../data/portfolio';
import { useScrollLock } from '../hooks/smoothScroll';
import { EASE, SectionHeading } from './fx';

/**
 * "On the National Stage" — events as episode stills with glass captions.
 * Clicking opens a full-screen album; a multi-day event becomes a day-by-day album (Day 1, Day 2 …).
 * A day or event without a photo shows a typographic title card instead of an empty frame.
 */

type Slide = { moment: number; day?: number; photo?: StagePhoto };

/** every photo in order; a day (or event) without photos yet still gets one slide */
function buildSlides(): Slide[] {
  const out: Slide[] = [];
  stageMoments.forEach((m, mi) => {
    if (m.days?.length) {
      m.days.forEach((d, di) => {
        if (d.photos?.length) d.photos.forEach((photo) => out.push({ moment: mi, day: di, photo }));
        else out.push({ moment: mi, day: di });
      });
    } else if (m.photos?.length) {
      m.photos.forEach((photo) => out.push({ moment: mi, photo }));
    } else {
      out.push({ moment: mi, photo: m.cover });
    }
  });
  return out;
}

const coverOf = (m: StageMoment) => m.cover ?? m.days?.find((d) => d.photos?.length)?.photos?.[0] ?? m.photos?.[0];

export default function NationalStage() {
  const slides = useMemo(buildSlides, []);
  const [open, setOpen] = useState<number | null>(null);
  const featured = stageMoments.find((m) => m.featured) ?? stageMoments[0];
  const rest = stageMoments.filter((m) => m !== featured);
  const close = useCallback(() => setOpen(null), []);
  const openMoment = (mi: number, day = 0) => {
    const i = slides.findIndex((s) => s.moment === mi && (s.day ?? 0) === day);
    setOpen(Math.max(0, i));
  };

  return (
    <>
      <SectionHeading
        kicker="Behind the scenes"
        title="On the National Stage"
        aside={<p className="max-w-xs text-sm text-mist">Where the work met the room — national finals, hackathons and a meeting with Delhi&rsquo;s Chief Minister.</p>}
      />

      <div className="gutter grid gap-4 lg:gap-5">
        <Still moment={featured} mi={stageMoments.indexOf(featured)} big slides={slides} onOpen={openMoment} />
        {rest.length > 0 && (
          <div className={`grid gap-4 lg:gap-5 ${rest.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {rest.map((m, i) => (
              <Still key={m.id} moment={m} mi={stageMoments.indexOf(m)} delay={0.08 + i * 0.08} slides={slides} onOpen={openMoment} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>{open !== null && <Lightbox slides={slides} index={open} onIndex={setOpen} onClose={close} />}</AnimatePresence>
    </>
  );
}

const src = (file: string, w: number, ext: 'avif' | 'webp') => `/assets/stage/${file}-${w}.${ext}`;

type Fallback = { word: string; note?: string };

/** shown where there is no photo: a typographic title card, like an episode's title frame */
function TitleCard({ word, note, className = '' }: Fallback & { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center justify-center bg-[radial-gradient(85%_75%_at_50%_40%,rgba(229,19,43,0.2),rgba(14,12,20,0.94)_72%)] ${className}`}>
      <div className="flex flex-col items-center px-6 text-center">
        <span className="font-display text-[clamp(2.75rem,6.4vw,6rem)] uppercase leading-[0.86] tracking-wide text-transparent [-webkit-text-stroke:1px_rgba(244,241,236,0.34)]">
          {word}
        </span>
        <span className="mt-4 h-[3px] w-10 rounded-full bg-crimson/80" />
        {note && <span className="mt-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-mist/80">{note}</span>}
      </div>
    </div>
  );
}

function Photo({
  photo,
  sizes,
  fit = 'cover',
  className = '',
  fallback,
}: {
  photo?: StagePhoto;
  sizes: string;
  fit?: 'cover' | 'contain';
  className?: string;
  fallback: Fallback;
}) {
  if (!photo) return <TitleCard {...fallback} className={className} />;
  return (
    <picture>
      <source type="image/avif" srcSet={`${src(photo.file, 800, 'avif')} 800w, ${src(photo.file, 1600, 'avif')} 1600w`} sizes={sizes} />
      <source type="image/webp" srcSet={`${src(photo.file, 800, 'webp')} 800w, ${src(photo.file, 1600, 'webp')} 1600w`} sizes={sizes} />
      <img
        src={src(photo.file, 1600, 'webp')}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`${fit === 'cover' ? 'object-cover' : 'object-contain'} ${className}`}
        style={{ objectPosition: photo.focus ?? '50% 40%' }}
      />
    </picture>
  );
}

/**
 * Every still: photo on top, caption panel below, so no face in a group photo is ever covered.
 * The featured still is a wide cinematic frame; on desktop its caption panel tucks up over the photo's lower edge
 * and splits into title (left) and story (right).
 */
function Still({
  moment: m,
  mi,
  big,
  delay = 0,
  slides,
  onOpen,
}: {
  moment: StageMoment;
  mi: number;
  big?: boolean;
  delay?: number;
  slides: Slide[];
  onOpen: (mi: number, day?: number) => void;
}) {
  const count = slides.filter((s) => s.moment === mi && s.photo).length;
  const L = big
    ? {
        card: 'flex flex-col',
        media: 'aspect-[16/9] lg:aspect-[21/9]',
        panel: 'm-3 p-5 sm:m-4 sm:p-6 lg:mx-5 lg:mb-5 lg:-mt-14 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-end lg:gap-10 lg:p-7',
        sizes: '100vw',
      }
    : {
        card: 'flex h-full flex-col',
        media: 'aspect-[16/10]',
        panel: 'm-3 flex-1 p-4 sm:p-5',
        sizes: '(max-width: 640px) 100vw, 50vw',
      };

  return (
    <motion.div
      className={`group relative w-full overflow-hidden rounded-2xl bg-[rgba(14,12,20,0.6)] text-left ring-1 ring-white/10 transition duration-500 hover:ring-white/25 ${L.card}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {/* the whole card opens the album */}
      <button type="button" data-cursor="view" onClick={() => onOpen(mi)} aria-label={`Open photos: ${m.event}`} className="absolute inset-0 z-[1] rounded-2xl" />

      <div className={`pointer-events-none relative overflow-hidden ${L.media}`}>
        <div className="absolute inset-0 transition-transform duration-[1.4s] ease-[var(--ease-cine)] group-hover:scale-[1.03]">
          <Photo photo={coverOf(m)} sizes={L.sizes} className="h-full w-full" fallback={{ word: m.date }} />
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent via-30% to-black/35" />
      </div>

      <div className="pointer-events-none absolute left-4 right-4 top-4 flex items-center justify-between gap-2 sm:left-5 sm:right-5 sm:top-5">
        <span className="flex items-center gap-2">
          <span className="font-display text-xl leading-none text-crimson-2">S</span>
          <span className="text-[11px] font-bold tracking-[0.3em] text-bone/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">STILL {String(mi + 1).padStart(2, '0')}</span>
        </span>
        {count > 1 && <span className="glass rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-bone">{count} photos</span>}
      </div>

      <div className={`glass-panel glass-dark pointer-events-none relative z-[2] rounded-xl ${L.panel}`}>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-crimson px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">{m.tag}</span>
          <h3 className={`mt-2.5 font-display leading-[0.95] tracking-wide text-bone ${big ? 'text-[clamp(1.9rem,3.4vw,2.9rem)]' : 'text-[clamp(1.6rem,2.4vw,2rem)]'}`}>{m.event}</h3>
          <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#ffb3be]">
            {m.venue} · {m.date}
          </p>
        </div>
        <div>
          <p className={`mt-2.5 leading-relaxed text-bone/80 ${big ? 'max-w-2xl text-[15px] lg:mt-0' : 'text-sm'}`}>{m.caption}</p>
          {m.days && m.days.length > 0 && (
            <div className="pointer-events-auto mt-4 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
              {m.days.map((d, di) => (
                <button
                  key={d.label}
                  type="button"
                  data-cursor="view"
                  onClick={() => onOpen(mi, di)}
                  aria-label={`${d.label}: ${d.title}`}
                  className="glass rounded-lg px-2.5 py-1.5 text-left transition hover:border-white/30 hover:bg-white/15 sm:px-3"
                >
                  <span className="block text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#ffb3be]">{d.label}</span>
                  <span className="block text-[12px] font-semibold leading-snug text-bone sm:text-[13px]">{d.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Lightbox({ slides, index, onIndex, onClose }: { slides: Slide[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  useScrollLock(true);
  const n = slides.length;
  const slide = slides[index];
  const m = stageMoments[slide.moment];
  const day: StageDay | undefined = slide.day !== undefined ? m.days?.[slide.day] : undefined;
  // position within this day (or this event when it has no days)
  const group = slides.filter((s) => s.moment === slide.moment && s.day === slide.day);
  const pos = group.indexOf(slide) + 1;
  const go = useCallback((d: number) => onIndex((index + d + n) % n), [index, n, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  const jumpToDay = (di: number) => onIndex(Math.max(0, slides.findIndex((s) => s.moment === slide.moment && s.day === di)));

  return (
    <motion.div
      className="fixed inset-0 z-[140] flex flex-col bg-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={m.event}
      onClick={onClose}
    >
      <div className="gutter flex h-16 shrink-0 items-center justify-between pt-[env(safe-area-inset-top)]">
        <p className="text-[11px] font-bold tracking-[0.3em] text-mist">
          STILL {String(slide.moment + 1).padStart(2, '0')}
          {day ? ` · ${day.label.toUpperCase()}` : ''}
          {group.length > 1 ? ` — ${pos} / ${group.length}` : ''}
        </p>
        <button type="button" onClick={onClose} aria-label="Close" className="glass flex h-10 w-10 items-center justify-center rounded-full text-bone">
          ✕
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="relative h-full max-h-[70vh] w-full max-w-6xl overflow-hidden rounded-2xl"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <Photo
              photo={slide.photo}
              sizes="100vw"
              fit="contain"
              className="h-full w-full"
              fallback={day ? { word: day.label, note: day.date } : { word: m.date, note: m.venue }}
            />
          </motion.div>
        </AnimatePresence>
        {n > 1 && (
          <>
            <button type="button" aria-label="Previous photo" onClick={() => go(-1)} className="glass absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-bone sm:left-6">
              ←
            </button>
            <button type="button" aria-label="Next photo" onClick={() => go(1)} className="glass absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-bone sm:right-6">
              →
            </button>
          </>
        )}
      </div>

      <div className="gutter shrink-0 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 text-center" onClick={(e) => e.stopPropagation()}>
        {slide.photo?.caption && (
          <p className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold text-bone">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-crimson-2" />
            {slide.photo.caption}
          </p>
        )}
        {m.days && m.days.length > 0 && (
          <div className="-mx-1 mb-3 flex justify-center gap-2 overflow-x-auto px-1" role="tablist" aria-label="Days">
            {m.days.map((d, di) => (
              <button
                key={d.label}
                type="button"
                role="tab"
                aria-selected={slide.day === di}
                onClick={() => jumpToDay(di)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${slide.day === di ? 'bg-bone text-ink' : 'glass text-bone hover:bg-white/15'}`}
              >
                {d.label}
                <span className="hidden sm:inline"> · {d.title}</span>
              </button>
            ))}
          </div>
        )}
        {day && <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-mist">{m.event}</p>}
        <p className="mt-1 font-display text-2xl tracking-wide text-bone sm:text-3xl">{day ? day.title : m.event}</p>
        <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#ffb3be]">
          {m.venue} · {day ? day.date : m.date}
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-bone/75">{day ? day.caption : m.caption}</p>
      </div>
    </motion.div>
  );
}

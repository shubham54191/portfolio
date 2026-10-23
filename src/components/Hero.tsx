import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { achievements, experience, profile, projects, type ProfileId } from '../data/portfolio';
import { useFinePointer } from '../hooks/useMedia';
import { useSmoothScroll } from '../hooks/smoothScroll';
import { EASE, Magnetic, Particles } from './fx';
import { SeriesMark } from './Poster';
import LivePortrait from './LivePortrait';
import { DownloadIcon, GitHubIcon, LinkedInIcon, MailIcon } from './icons';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } } };
const item = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' }, transition: { duration: 0.9, ease: EASE } },
};

export default function Hero({ onPlay, onResume, profileId }: { onPlay: () => void; onResume: () => void; profileId: ProfileId }) {
  const ref = useRef<HTMLElement>(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const { scrollTo } = useSmoothScroll();

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const blackout = useTransform(scrollYProgress, [0.35, 1], [0, 1]);

  // pointer parallax (desktop)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 18 });
  const py = useSpring(my, { stiffness: 60, damping: 18 });
  const imgRotY = useTransform(px, [-1, 1], [-5, 5]);
  const imgRotX = useTransform(py, [-1, 1], [3, -3]);
  const imgShiftX = useTransform(px, [-1, 1], [-14, 14]);
  const chipX = useTransform(px, [-1, 1], [18, -18]);
  const chipY = useTransform(py, [-1, 1], [12, -12]);
  const glowX = useTransform(px, [-1, 1], ['-6%', '6%']);

  const meta = [experience[0].role, `@ ${experience[0].company}`, `${projects.length} Originals`, achievements[0].title];

  const quick = [
    { label: 'GitHub', href: profile.links.github, icon: <GitHubIcon /> },
    { label: 'LinkedIn', href: profile.links.linkedin, icon: <LinkedInIcon /> },
    { label: 'Email', href: `mailto:${profile.email}`, icon: <MailIcon /> },
  ];

  return (
    <section
      id="top"
      ref={ref}
      className="relative min-h-[100svh] overflow-hidden"
      onPointerMove={(e) => {
        if (!fine) return;
        mx.set((e.clientX / window.innerWidth) * 2 - 1);
        my.set((e.clientY / window.innerHeight) * 2 - 1);
      }}
    >
      {/* atmosphere */}
      <motion.div aria-hidden className="absolute inset-0 will-change-transform" style={{ x: glowX }}>
        <div className="absolute right-[-10%] top-[-10%] h-[90vh] w-[80vw] rounded-full bg-[radial-gradient(closest-side,rgba(229,19,43,0.38),rgba(229,19,43,0.08)_55%,transparent)] lg:right-[-4%] lg:w-[60vw]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[70vh] w-[60vw] rounded-full bg-[radial-gradient(closest-side,rgba(90,20,120,0.25),transparent)]" />
      </motion.div>
      <div aria-hidden className="hero-grid absolute inset-0 z-[1] opacity-60" />
      <Particles className="z-[1]" />
      <div aria-hidden className="absolute inset-0 z-[1] overflow-hidden">
        <span className="light-streak left-[40%] top-[22%] w-[50vw]" style={{ animationDelay: '1.2s' }} />
        <span className="light-streak left-[30%] top-[64%] w-[40vw]" style={{ animationDelay: '3.6s' }} />
        <span className="light-streak left-[55%] top-[44%] w-[30vw]" style={{ animationDelay: '5.2s' }} />
      </div>

      {/* portrait */}
      <motion.div
        className="absolute inset-x-0 top-14 z-[2] flex h-[46svh] will-change-transform items-end justify-center sm:h-[52svh] lg:bottom-0 lg:left-auto lg:right-[3vw] lg:top-20 lg:h-auto lg:w-[50vw] xl:right-[5vw] xl:w-[46vw]"
        style={{ y: imgY, scale: imgScale, opacity: fade }}
      >
        <motion.div
          className="relative h-full w-full will-change-transform lg:h-[84vh]"
          style={{ rotateY: imgRotY, rotateX: imgRotX, x: imgShiftX, transformPerspective: 1200 }}
          initial={{ clipPath: 'inset(100% -40% -10% -40%)', opacity: 0 }}
          animate={{ clipPath: 'inset(-40% -40% -10% -40%)', opacity: 1, transitionEnd: { clipPath: 'none' } }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.1 }}
        >
          {/* frosted glass lens behind the portrait — the head rises out of its top edge */}
          <div
            aria-hidden
            className="glass-panel no-backdrop absolute left-1/2 top-[6%] aspect-square h-[74%] -translate-x-1/2 rounded-full !bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.10),rgba(255,255,255,0.03)_55%,rgba(229,19,43,0.10))]"
          >
            <span className="absolute inset-[7%] rounded-full border border-white/[0.07]" />
            <span className="absolute left-[14%] top-[9%] h-[22%] w-[38%] -rotate-[28deg] rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.2),transparent)]" />
          </div>
          {/* rotating rim-light ring */}
          <div
            aria-hidden
            className="absolute left-1/2 top-[6%] aspect-square h-[74%] -translate-x-1/2 rounded-full motion-safe:animate-[spin-x_14s_linear_infinite] p-px [background:conic-gradient(from_0deg,transparent_0deg,rgba(255,61,90,0.9)_60deg,transparent_140deg,rgba(185,139,255,0.6)_220deg,transparent_300deg)] [mask:radial-gradient(farthest-side,transparent_calc(100%-2px),#000_calc(100%-1px))]"
          />
          <div aria-hidden className="absolute left-1/2 top-[6%] aspect-square h-[74%] -translate-x-1/2 rounded-full shadow-[0_0_140px_rgba(229,19,43,0.32),inset_0_0_90px_rgba(229,19,43,0.16)]" />

          {/* the photo — slow idle float on top of scroll + pointer parallax */}
          <div className="absolute inset-0 motion-safe:animate-[float_6s_ease-in-out_infinite]">
            <LivePortrait
              priority
              alt={profile.portrait.alt}
              fallbackSrc={profile.portrait.src}
              fallbackSrcSet={profile.portrait.srcSet}
              sizes="(max-width: 1024px) 100vw, 50vw"
              fade={[0.52, 0.88]}
              className="absolute bottom-0 left-1/2 h-full -translate-x-1/2"
            />
            {/* light sweep across the portrait */}
            {!reduce && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-1/2 w-[60%] -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(to_bottom,black_40%,transparent_85%)]"
              >
                <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.09] to-transparent motion-safe:animate-[sweep_8.4s_ease-in-out_2.2s_infinite]" style={{ transform: 'translateX(-120%) skewX(-12deg)' }} />
              </motion.div>
            )}
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_30%,rgba(255,61,90,0.09),transparent_70%)]" />

          {/* floating UI */}
          <FloatChip text={achievements[0].title} sub="DRDO co-partnered" pos="left-[0%] top-[46%]" depth={1} index={0} mx={chipX} my={chipY} />
          <FloatChip text="Agentic AI" sub="Function calling · Agents" pos="right-[2%] top-[10%]" depth={-1} index={1} mx={chipX} my={chipY} />
          <TerminalCard mx={chipX} my={chipY} />
        </motion.div>
      </motion.div>

      {/* readability gradients */}
      <div aria-hidden className="absolute inset-x-0 top-[30svh] z-[3] h-[36svh] bg-gradient-to-b from-transparent via-ink/70 to-ink lg:hidden" />
      <div aria-hidden className="absolute inset-0 z-[3] hidden bg-[linear-gradient(90deg,var(--color-ink)_0%,rgba(7,7,10,0.72)_34%,transparent_60%)] lg:block" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 z-[3] h-48 bg-gradient-to-t from-ink to-transparent" />

      {/* copy */}
      <motion.div
        className="gutter relative z-[4] flex min-h-[100svh] flex-col justify-end pb-14 pt-[44svh] sm:pb-16 lg:max-w-[54vw] lg:justify-center lg:pb-0 lg:pt-24"
        style={{ y: textY, opacity: fade }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="mb-3 flex items-center gap-3 text-lg">
          <SeriesMark />
          <span className="flex items-center gap-1.5 rounded-full border border-[#46e3a8]/30 bg-[#46e3a8]/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.16em] text-[#7ff0c3]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#46e3a8] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#46e3a8]" />
            </span>
            OPEN TO WORK
          </span>
        </motion.div>
        <motion.p variants={item} className="font-display leading-[0.82] tracking-[0.02em] text-bone" style={{ fontSize: 'clamp(3.6rem, 10.5vw, 9.5rem)' }} aria-hidden>
          <span className="shimmer-text">{profile.firstName}</span>
        </motion.p>
        <motion.p variants={item} className="mt-1 font-sans text-xs font-bold tracking-[0.62em] text-crimson-2 sm:text-sm" aria-hidden>
          {profile.seriesTag}
        </motion.p>

        <motion.h1 variants={item} className="mt-5 max-w-2xl font-sans text-[clamp(1.45rem,3.1vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-bone">
          <span className="sr-only">{profile.displayName} — </span>
          AI-Native Software Engineer <span className="font-serif text-[1.08em] font-normal italic text-crimson-2">&amp;</span> Full-Stack Builder
        </motion.h1>

        <motion.p variants={item} className="mt-3 max-w-xl text-[15px] leading-relaxed text-bone/75 sm:text-base">
          {profile.subheadline}
        </motion.p>

        <motion.div variants={item} className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12.5px] font-medium text-mist">
          <span className="rounded border border-white/25 px-1.5 py-px text-[11px] font-bold tracking-wider text-bone">AI</span>
          {meta.map((m, i) => (
            <span key={m} className="flex items-center gap-3">
              {i > 0 && <span className="h-1 w-1 rounded-full bg-smoke" />}
              {m}
            </span>
          ))}
        </motion.div>

        <motion.div variants={item} className="mt-7 flex flex-wrap items-center gap-3">
          <Magnetic>
            <button
              type="button"
              data-cursor="view"
              onClick={() => scrollTo('#originals')}
              className="flex min-h-12 items-center gap-3 rounded-md bg-bone px-6 py-3 text-[15px] font-bold text-ink transition hover:bg-white sm:px-7"
            >
              <span className="text-lg">▶</span> View Projects
            </button>
          </Magnetic>
          <Magnetic>
            <a
              href={profile.resumePdf}
              download={profile.resumeFileName}
              data-cursor="link"
              className="glass flex min-h-12 items-center gap-2.5 rounded-md px-6 py-3 text-[15px] font-semibold text-bone transition hover:bg-white/15 sm:px-7"
            >
              <DownloadIcon className="h-[18px] w-[18px]" /> Download Resume
            </a>
          </Magnetic>
          <button
            type="button"
            data-cursor="play"
            onClick={profileId === 'recruiter' ? onResume : onPlay}
            aria-label={profileId === 'recruiter' ? 'View resume' : 'Play the intro'}
            className="flex h-12 items-center gap-2 rounded-full border border-white/30 px-4 text-sm font-semibold text-bone transition hover:border-bone hover:bg-white/10"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-crimson text-[11px] text-white">▶</span>
            {profileId === 'recruiter' ? 'Resume' : 'Intro'}
          </button>
        </motion.div>

        <motion.div variants={item} className="mt-6 flex items-center gap-2">
          {quick.map((q) => (
            <a
              key={q.label}
              href={q.href}
              target={q.href.startsWith('http') ? '_blank' : undefined}
              rel={q.href.startsWith('http') ? 'noreferrer' : undefined}
              data-cursor="link"
              aria-label={q.label}
              className="glass group flex h-10 items-center gap-2 rounded-full px-3.5 text-xs font-semibold text-mist transition hover:-translate-y-0.5 hover:border-crimson-2/60 hover:text-bone"
            >
              <span className="transition group-hover:text-crimson-2">{q.icon}</span>
              <span className="hidden sm:inline">{q.label}</span>
            </a>
          ))}
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        aria-hidden
        className="absolute bottom-6 left-1/2 z-[4] hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-semibold tracking-[0.3em] text-smoke lg:flex"
        style={{ opacity: fade }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4 }}
      >
        SCROLL
        <span className="relative h-9 w-px overflow-hidden bg-white/15">
          <motion.span className="absolute inset-x-0 h-3 bg-crimson-2" animate={{ top: ['-30%', '110%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
        </span>
      </motion.div>

      <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-[5] bg-ink" style={{ opacity: blackout }} />
    </section>
  );
}

type MV = ReturnType<typeof useTransform<number, number>>;

function FloatChip({ text, sub, pos, depth, index, mx, my }: { text: string; sub: string; pos: string; depth: number; index: number; mx: MV; my: MV }) {
  const x = useTransform(mx, (n: number) => n * depth);
  const y = useTransform(my, (n: number) => n * depth);
  return (
    <motion.div
      className={`glass no-backdrop absolute hidden rounded-xl bg-[linear-gradient(180deg,rgba(40,26,40,0.72),rgba(18,14,22,0.62))] px-4 py-2.5 will-change-transform md:block ${pos}`}
      style={{ x, y }}
      initial={{ opacity: 0, filter: 'blur(6px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
      transition={{ duration: 0.9, delay: 1.2 + index * 0.18, ease: EASE }}
    >
      <div className="motion-safe:animate-[float-sm_var(--d)_ease-in-out_infinite]" style={{ '--d': `${5 + index}s` } as CSSProperties}>
        <p className="text-sm font-semibold text-bone">{text}</p>
        <p className="whitespace-nowrap text-[11px] uppercase tracking-[0.2em] text-mist">{sub}</p>
      </div>
    </motion.div>
  );
}

/** A tiny "live" terminal that types out an agent run, then loops. */
const SCRIPT: { t: string; c: string }[] = [
  { t: '$ agent.run("ship the feature")', c: 'text-bone' },
  { t: '› plan: 3 steps', c: 'text-mist' },
  { t: '› call_tool(search_docs)  ✓', c: 'text-[#7ee0ff]' },
  { t: '› call_tool(write_code)   ✓', c: 'text-[#7ee0ff]' },
  { t: '› call_tool(deploy)       ✓', c: 'text-[#7ee0ff]' },
  { t: '✔ shipped to production', c: 'text-[#46e3a8]' },
];

function TerminalCard({ mx, my }: { mx: MV; my: MV }) {
  const x = useTransform(mx, (n: number) => n * 0.6);
  const y = useTransform(my, (n: number) => n * 0.6);
  const reduce = useReducedMotion();
  const [line, setLine] = useState(reduce ? SCRIPT.length : 0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (reduce) return;
    let t: number;
    if (line >= SCRIPT.length) {
      t = window.setTimeout(() => {
        setLine(0);
        setChars(0);
      }, 3200);
    } else if (chars < SCRIPT[line].t.length) {
      t = window.setTimeout(() => setChars((c) => c + 1), line === 0 ? 45 : 18);
    } else {
      t = window.setTimeout(() => {
        setLine((l) => l + 1);
        setChars(0);
      }, line === 0 ? 420 : 260);
    }
    return () => clearTimeout(t);
  }, [line, chars, reduce]);

  return (
    <motion.div
      className="glass-panel glass-dark no-backdrop absolute bottom-[20%] right-[-2%] hidden w-[300px] overflow-hidden rounded-xl !bg-[rgba(12,10,16,0.84)] will-change-transform md:block xl:right-[2%]"
      style={{ x, y }}
      initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
      transition={{ duration: 0.9, delay: 1.6, ease: EASE }}
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[11px] tracking-wider text-smoke">~/agents — zsh</span>
      </div>
      <div className="min-h-[148px] px-3.5 py-3 font-mono text-[11.5px] leading-[1.75]">
        {SCRIPT.map((l, i) => {
          if (i > line) return null;
          const text = i < line ? l.t : l.t.slice(0, chars);
          return (
            <p key={i} className={`whitespace-pre ${l.c}`}>
              {text}
              {i === line && <span className="ml-px inline-block h-[13px] w-[7px] translate-y-[2px] animate-pulse bg-crimson-2" />}
            </p>
          );
        })}
      </div>
    </motion.div>
  );
}

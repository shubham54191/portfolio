import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { profile } from '../data/portfolio';
import { useSmoothScroll } from '../hooks/smoothScroll';
import { EASE, Magnetic, Particles } from './fx';
import { SeriesMark } from './Poster';
import { CheckIcon, CopyIcon, GitHubIcon, LinkedInIcon, MailIcon, XIcon } from './icons';

export default function FinalCTA({ onReplay, onToast }: { onReplay: () => void; onToast?: (msg: string) => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollTo } = useSmoothScroll();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.2'] });
  const spacing = useTransform(scrollYProgress, [0, 1], ['0.6em', '0.02em']);
  const blur = useTransform(scrollYProgress, (v) => (v >= 0.98 ? 'none' : `blur(${(16 * (1 - v)).toFixed(2)}px)`));
  const opacity = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(profile.email);
      ok = true;
    } catch {
      // Fallback for browsers / frames without the async clipboard API
      try {
        const ta = document.createElement('textarea');
        ta.value = profile.email;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        ta.remove();
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      onToast?.(`Copied ${profile.email}`);
      window.setTimeout(() => setCopied(false), 2200);
    } else {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const socials = [
    { label: 'LinkedIn', href: profile.links.linkedin, icon: <LinkedInIcon className="h-[18px] w-[18px]" /> },
    { label: 'GitHub', href: profile.links.github, icon: <GitHubIcon className="h-[18px] w-[18px]" /> },
    { label: 'X', href: profile.links.x, icon: <XIcon className="h-[16px] w-[16px]" /> },
    { label: 'Email', href: `mailto:${profile.email}`, icon: <MailIcon className="h-[18px] w-[18px]" /> },
  ];

  return (
    <section id="contact" ref={ref} className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-32 pt-24 text-center">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_60%,rgba(229,19,43,0.18),transparent_70%)]" />
      <Particles count={36} />

      <motion.p
        className="relative mb-6 text-[12px] font-bold uppercase tracking-[0.5em] text-crimson-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        The Next Episode
      </motion.p>
      <motion.h2
        className="relative font-display leading-[0.85] text-bone"
        style={{ fontSize: 'clamp(3.2rem, 12vw, 11rem)', letterSpacing: spacing, filter: blur, opacity }}
      >
        LET&rsquo;S BUILD IT.
      </motion.h2>

      {/* contact card */}
      <div className="glass-panel mt-12 flex w-full max-w-2xl flex-col items-center rounded-3xl px-5 py-10 sm:px-12">
      <motion.p
        className="relative max-w-xl text-lg leading-relaxed text-bone/85 sm:text-xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      >
        {profile.availability}
      </motion.p>

      {/* copy-to-clipboard email */}
      <motion.div
        className="relative mt-10"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
      >
        <Magnetic strength={0.2}>
          <button
            type="button"
            onClick={copyEmail}
            data-cursor="link"
            aria-label={`Copy email address ${profile.email}`}
            className="group flex min-h-14 max-w-full items-center gap-3 rounded-full bg-crimson py-2 pl-6 pr-2 text-left text-white shadow-[0_0_60px_rgba(229,19,43,0.45)] transition hover:bg-crimson-2"
          >
            <span className="truncate text-[15px] font-semibold tracking-wide sm:text-lg">{profile.email}</span>
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/25 transition group-hover:bg-black/40">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? 'ok' : 'copy'}
                  initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {copied ? <CheckIcon className="h-[18px] w-[18px]" /> : <CopyIcon className="h-[18px] w-[18px]" />}
                </motion.span>
              </AnimatePresence>
            </span>
          </button>
        </Magnetic>
        <p className="mt-3 text-[12px] font-semibold tracking-[0.24em] text-mist" aria-live="polite">
          {copied ? 'COPIED TO CLIPBOARD ✓' : 'CLICK TO COPY'}
        </p>
      </motion.div>

      {/* socials */}
      <motion.div
        className="relative mt-8 flex flex-wrap justify-center gap-3"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.08, delayChildren: 0.4 }}
      >
        {socials.map((c) => (
          <motion.div key={c.label} variants={{ hidden: { opacity: 0, y: 20, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } } }}>
            <Magnetic>
              <a
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noreferrer' : undefined}
                data-cursor="link"
                className="glass flex min-h-12 items-center gap-2.5 rounded-full px-5 text-sm font-bold tracking-[0.12em] text-bone transition hover:border-white/40 hover:bg-white/15"
              >
                {c.icon}
                {c.label.toUpperCase()}
              </a>
            </Magnetic>
          </motion.div>
        ))}
      </motion.div>

      </div>

      <div className="relative mt-14 flex flex-wrap justify-center gap-6 text-xs font-semibold tracking-[0.24em] text-smoke">
        <button type="button" onClick={() => scrollTo(0, { offset: 0 })} className="hover:text-bone">
          ↺ WATCH AGAIN
        </button>
        <button type="button" onClick={onReplay} className="hover:text-bone">
          ▶ REPLAY OPENING
        </button>
      </div>

      <footer className="absolute inset-x-0 bottom-0 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
        <div className="mb-2 text-base">
          <SeriesMark />
        </div>
        <p className="text-[12px] leading-relaxed text-smoke">
          © {new Date().getFullYear()} {profile.displayName}. A personal, streaming-inspired portfolio — not affiliated with any streaming service.
        </p>
      </footer>
    </section>
  );
}

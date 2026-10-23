import { motion } from 'framer-motion';
import { education, experience, profile } from '../data/portfolio';
import { EASE, SectionHeading, Tilt } from './fx';
import LivePortrait from './LivePortrait';

export default function About() {
  const facts = [
    { k: 'Now', v: experience[0].role, s: experience[0].company },
    { k: 'Background', v: 'B.Tech, Computer Science', s: education[0].score },
    { k: 'Builds', v: 'Agents + full-stack', s: 'Python · TypeScript · PostgreSQL' },
    { k: 'Open to', v: 'Roles · Research · Freelance', s: `Based in ${profile.location}` },
  ];

  return (
    <>
      <SectionHeading kicker="The Pilot" title="About Me" />
      <div className="gutter grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <motion.div
          className="mx-auto w-full max-w-md lg:max-w-none"
          initial={{ opacity: 0, scale: 0.88, filter: 'blur(12px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          <Tilt max={5} className="rounded-2xl">
            <div className="glass-panel relative aspect-[4/5] overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_32%,rgba(229,19,43,0.28),rgba(124,58,237,0.10)_55%,transparent_80%)]" />
              <div className="absolute inset-0 opacity-50 [background-image:repeating-linear-gradient(90deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_28px)]" />
              <motion.div
                className="absolute inset-0"
                initial={{ y: 40 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: EASE }}
              >
                <LivePortrait
                  alt={profile.portrait.alt}
                  fallbackSrc="/assets/portrait-720.webp"
                  fallbackSrcSet={profile.portrait.srcSet}
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  fade={[0.7, 1]}
                  className="absolute bottom-0 left-1/2 h-[86%] -translate-x-1/2"
                />
              </motion.div>
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.3em] text-crimson-2">STARRING</p>
                  <p className="font-display text-3xl leading-none text-bone">{profile.displayName}</p>
                </div>
                <span className="rounded border border-white/30 px-1.5 text-[11px] font-bold text-bone">S01–S05</span>
              </div>
            </div>
          </Tilt>
        </motion.div>

        <div>
          <div className="space-y-4">
            {profile.about.map((line, i) => (
              <motion.p
                key={line}
                className={i === 0 ? 'font-serif text-[clamp(1.5rem,2.8vw,2.3rem)] italic leading-[1.18] text-bone' : 'text-[15px] leading-relaxed text-bone/75 sm:text-base'}
                initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.12, ease: EASE }}
              >
                {line}
              </motion.p>
            ))}
          </div>

          <motion.ul
            className="mt-8 space-y-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.1 }}
          >
            {profile.highlights.map((h) => (
              <motion.li
                key={h.title}
                className="flex gap-3"
                variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } } }}
              >
                <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-crimson/20 text-[11px] text-crimson-2 ring-1 ring-crimson-2/40">✦</span>
                <p className="text-[15px] leading-relaxed text-bone/80">
                  <span className="font-semibold text-bone">{h.title}.</span> {h.detail}
                </p>
              </motion.li>
            ))}
          </motion.ul>

          <motion.dl
            className="glass-panel mt-8 grid overflow-hidden rounded-2xl sm:grid-cols-2"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.08 }}
          >
            {facts.map((f) => (
              <motion.div
                key={f.k}
                className="border-b border-white/[0.08] p-5 last:border-b-0 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0"
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
              >
                <dt className="text-[11px] font-bold uppercase tracking-[0.28em] text-smoke">{f.k}</dt>
                <dd className="mt-2 text-base font-semibold text-bone">{f.v}</dd>
                <dd className="mt-0.5 text-xs text-mist">{f.s}</dd>
              </motion.div>
            ))}
          </motion.dl>

          <div className="mt-8">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-smoke">Into</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <span key={i} className="glass rounded-full px-3 py-1.5 text-xs font-medium text-bone">
                  {i}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

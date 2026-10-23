import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { experience } from '../data/portfolio';
import { EASE, SectionHeading, Tilt } from './fx';

/** Experience & internships — a vertical timeline whose spine draws itself as you scroll. */
export default function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
  const spine = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <>
      <SectionHeading
        kicker="Now playing"
        title="Experience"
        aside={<p className="max-w-xs text-sm text-mist">Where the agents, pipelines and full-stack systems actually shipped.</p>}
      />
      <div ref={ref} className="gutter relative">
        {/* spine */}
        <div aria-hidden className="absolute bottom-4 left-[calc(var(--gutter)+11px)] top-4 w-px bg-white/10 md:left-[calc(var(--gutter)+190px+31px)]" />
        <motion.div
          aria-hidden
          className="absolute bottom-4 left-[calc(var(--gutter)+11px)] top-4 w-px origin-top bg-gradient-to-b from-crimson-2 via-crimson-2 to-[#b98bff] shadow-[0_0_14px_rgba(255,61,90,0.7)] md:left-[calc(var(--gutter)+190px+31px)]"
          style={{ scaleY: spine }}
        />

        <ol className="space-y-10 md:space-y-14">
          {experience.map((x, i) => (
            <li key={x.company} className="relative grid gap-4 pl-10 md:grid-cols-[190px_minmax(0,1fr)] md:gap-16 md:pl-0">
              {/* node */}
              <motion.span
                aria-hidden
                className="absolute left-0 top-1.5 flex h-[23px] w-[23px] items-center justify-center rounded-full bg-ink ring-1 ring-white/20 md:left-[calc(190px+20px)]"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: '-20% 0px' }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: x.palette.accent, boxShadow: `0 0 16px ${x.palette.accent}` }} />
                {i === 0 && <span className="absolute inset-0 animate-ping rounded-full opacity-40" style={{ background: x.palette.accent }} />}
              </motion.span>

              {/* period column */}
              <motion.div
                className="md:pt-1 md:text-right"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-15% 0px' }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <p className="font-display text-2xl leading-none tracking-wide" style={{ color: x.palette.accent }}>
                  {x.period}
                </p>
                <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.24em] text-smoke">{`S0${experience.length - i} · ${x.place}`}</p>
              </motion.div>

              {/* card */}
              <motion.div
                initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
                viewport={{ once: true, margin: '-12% 0px' }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <Tilt max={3} className="group rounded-2xl">
                  <article className="glass-panel overflow-hidden rounded-2xl">
                    <div aria-hidden className="absolute -right-24 -top-28 h-72 w-72 rounded-full opacity-30 blur-3xl transition-opacity duration-700 group-hover:opacity-50" style={{ background: x.palette.accent }} />
                    <div aria-hidden className="absolute -bottom-32 left-10 h-56 w-56 rounded-full opacity-[0.12] blur-3xl" style={{ background: x.palette.accent }} />
                    <div className="relative p-6 sm:p-8">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="font-display text-[clamp(2rem,4vw,3.2rem)] leading-[0.9] tracking-wide text-bone">{x.company}</h3>
                        {i === 0 && (
                          <span className="rounded-full bg-crimson px-2.5 py-0.5 text-[11px] font-bold tracking-[0.18em] text-white">CURRENT</span>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-semibold tracking-wide" style={{ color: x.palette.accent }}>
                        {x.role}
                      </p>
                      <ul className="mt-5 space-y-2.5">
                        {x.points.map((p) => (
                          <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-bone/80">
                            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: x.palette.accent }} />
                            {p}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 flex flex-wrap gap-1.5">
                        {x.stack.map((t) => (
                          <span key={t} className="rounded-full bg-black/40 px-2.5 py-1 text-[12px] font-medium text-bone/85 ring-1 ring-white/10">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                </Tilt>
              </motion.div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

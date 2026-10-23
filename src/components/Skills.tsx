import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { skillCategories, skillEvidence, type Skill, type SkillCategory } from '../data/portfolio';
import { EASE, SectionHeading, Tilt } from './fx';

const HUES = ['#ff3d5a', '#4cc9ff', '#46e3a8', '#ffb547', '#b98bff', '#ff8a5c', '#7ee0ff'];

/** Technical skills as a categorized grid — every category visible at once. */
export default function Skills() {
  return (
    <>
      <SectionHeading
        kicker="Genres"
        title="Technical Skills"
        aside={<p className="max-w-xs text-sm text-mist">Hover or tap a skill to see where it shows up across projects and experience.</p>}
      />

      <div className="gutter grid gap-4 md:grid-cols-2 lg:grid-cols-6 [perspective:1400px]">
        {skillCategories.map((c, i) => (
          <motion.div
            key={c.id}
            // 3 cards on the first row, 2 wider cards on the second
            className={i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'}
            initial={{ opacity: 0, y: 50, rotateX: 14 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: '-8% 0px' }}
            transition={{ duration: 0.9, delay: (i % 3) * 0.09, ease: EASE }}
          >
            <CategoryCard category={c} hue={HUES[i % HUES.length]} index={i} />
          </motion.div>
        ))}
      </div>
    </>
  );
}

function CategoryCard({ category, hue, index }: { category: SkillCategory; hue: string; index: number }) {
  return (
    <Tilt max={4} className="group h-full rounded-2xl">
      <article className="glass-panel flex h-full flex-col overflow-hidden rounded-2xl p-5 sm:p-6">
        <div aria-hidden className="absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-25 blur-3xl transition duration-700 group-hover:opacity-50" style={{ background: hue }} />
        <div aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${hue}aa, transparent)` }} />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: hue }}>
              {String(index + 1).padStart(2, '0')} · {category.skills.length} skills
            </p>
            <h3 className="mt-1.5 font-display text-[2rem] leading-[0.95] tracking-wide text-bone">{category.title}</h3>
            <p className="mt-1 text-xs text-smoke">{category.subtitle}</p>
          </div>
        </div>
        <div className="relative mt-5 flex flex-wrap gap-2">
          {category.skills.map((s, j) => (
            <SkillChip key={s.name} skill={s} hue={hue} delay={j * 0.05} />
          ))}
        </div>
      </article>
    </Tilt>
  );
}

function SkillChip({ skill, hue, delay }: { skill: Skill; hue: string; delay: number }) {
  const [open, setOpen] = useState(false);
  const evidence = skillEvidence[skill.name];

  return (
    <motion.button
      type="button"
      onHoverStart={() => setOpen(true)}
      onHoverEnd={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
      aria-expanded={evidence ? open : undefined}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: 0.25 + delay, ease: EASE }}
      whileHover={{ y: -3 }}
      className="glass relative flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-3 text-left transition-shadow duration-300"
      style={{ boxShadow: open ? `0 10px 30px -10px ${hue}88, 0 0 0 1px ${hue}88` : undefined }}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-display text-[15px] tracking-wide"
        style={{ background: `${hue}1f`, color: hue, boxShadow: `inset 0 0 0 1px ${hue}55` }}
        aria-hidden
      >
        {skill.mono}
      </span>
      <span className="text-[13.5px] font-semibold text-bone">{skill.name}</span>
      {skill.note && (
        <span className="rounded px-1 py-px text-[10px] font-bold uppercase tracking-wider text-ink" style={{ background: hue }}>
          {skill.note}
        </span>
      )}
      <AnimatePresence>
        {open && evidence && (
          <motion.span
            role="tooltip"
            className="pointer-events-none absolute bottom-[calc(100%+8px)] left-0 z-20 w-max max-w-[240px] glass-panel glass-dark rounded-lg px-3 py-2 text-[12px] leading-snug text-mist shadow-xl backdrop-blur"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
          >
            <span className="mb-0.5 block text-[10.5px] font-bold uppercase tracking-[0.2em]" style={{ color: hue }}>
              Used in
            </span>
            {evidence.join(' · ')}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

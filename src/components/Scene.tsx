import { useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTrackProgress } from '../hooks/sectionProgress';

/**
 * A section of the series. Its content animates in on its own; the section itself is never
 * scaled or faded, so text stays pin-sharp and glass panels can see the aurora behind them.
 * It also reports viewing progress for the Continue Exploring row.
 */
export default function Scene({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useTrackProgress(id, ref);

  return (
    <motion.section id={id} ref={ref} className={`relative scroll-mt-16 py-16 sm:py-24 ${className}`}>
      {children}
    </motion.section>
  );
}

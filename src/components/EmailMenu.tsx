import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { profile } from '../data/portfolio';
import { composeLinks, copyText } from '../lib/contact';
import { EASE } from './fx';

/**
 * An "Email" button that opens a small menu: write in Gmail, write in Outlook, open the mail app, or copy the address.
 * Every option works without a desktop mail client, so a recruiter can always reach out.
 */
export default function EmailMenu({ className = '', children, direction = 'up' }: { className?: string; children: ReactNode; direction?: 'up' | 'down' }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pos, setPos] = useState<CSSProperties>({});
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();

  // the menu lives in <body> (fixed), so section fades, transforms and overflow never dim or clip it
  const place = () => {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    const W = 280;
    const left = Math.min(Math.max(12, r.left + r.width / 2 - W / 2), window.innerWidth - 12 - W);
    const up = direction === 'up' && r.top > 300;
    setPos(up ? { left, width: W, bottom: window.innerHeight - r.top + 8 } : { left, width: W, top: r.bottom + 8 });
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menu.current?.contains(t) && !btn.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const close = () => setOpen(false);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, { passive: true });
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const copy = async () => {
    if (await copyText(profile.email)) {
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1400);
    }
  };

  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Email ${profile.email}`}
        data-cursor="link"
        onClick={() => {
          if (!open) place();
          setOpen((o) => !o);
        }}
        className={className}
      >
        {children}
      </button>
      {createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menu}
            id={id}
            role="menu"
            className="fixed z-[120] rounded-xl border border-white/15 bg-[rgb(16,15,22)] p-1.5 text-left shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)]"
            style={pos}
            initial={{ opacity: 0, y: pos.bottom !== undefined ? 8 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: pos.bottom !== undefined ? 8 : -8 }}
            transition={{ duration: 0.18, ease: EASE }}
          >
            <div className="border-b border-white/10 px-3 pb-2.5 pt-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-crimson-2">Write to me</p>
              <p className="mt-0.5 truncate text-[13px] text-bone/85">{profile.email}</p>
            </div>
            {composeLinks(profile.email).map((l) => (
              <a
                key={l.id}
                role="menuitem"
                href={l.href}
                target="_blank"
                rel="noreferrer"
                data-cursor="link"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-bone transition hover:bg-white/10"
              >
                {l.id === 'app' ? 'Open mail app' : `Write in ${l.label}`}
                <span aria-hidden className="text-mist">↗</span>
              </a>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={copy}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-bone transition hover:bg-white/10"
            >
              {copied ? 'Copied ✓' : 'Copy address'}
              <span aria-hidden className="text-mist">⧉</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </>
  );
}

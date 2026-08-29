import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Highlight {
  label: string;
  detail: string;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function EducationHighlightStrip({ highlights }: { highlights: Highlight[] }) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (highlights.length <= 1 || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % highlights.length);
    }, 3800);
    return () => window.clearInterval(id);
  }, [highlights.length, reduceMotion]);

  if (highlights.length === 0) return null;

  const item = highlights[index];

  return (
    <div className="edu-highlight-strip" aria-live="polite">
      <span className="edu-highlight-icon" aria-hidden="true">◆</span>
      <AnimatePresence mode="wait">
        <motion.div
          key={item.label}
          className="edu-highlight-text"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
        >
          <strong>{item.label}</strong>
          <span>{item.detail}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

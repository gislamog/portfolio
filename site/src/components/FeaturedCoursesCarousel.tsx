import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Course } from '../data/education';
import { demoHref, demoIdForCourse } from '../data/projects';
import { paperHrefForCourse } from '../data/mcsPortfolio';

interface FeaturedCoursesCarouselProps {
  courses: Course[];
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function FeaturedCoursesCarousel({ courses }: FeaturedCoursesCarouselProps) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (courses.length <= 1 || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % courses.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [courses.length, reduceMotion]);

  if (courses.length === 0) return null;

  const course = courses[index];
  const demoId = demoIdForCourse(course.code);
  const paperHref = paperHrefForCourse(course.code);

  const go = (delta: number) => {
    setIndex((i) => (i + delta + courses.length) % courses.length);
  };

  return (
    <section className="edu-spotlight" aria-label="Featured graduate coursework">
      <div className="edu-spotlight-head">
        <p className="edu-spotlight-label">Portfolio spotlight</p>
        <div className="edu-spotlight-dots" role="tablist" aria-label="Featured courses">
          {courses.map((c, i) => (
            <button
              key={c.code}
              type="button"
              role="tab"
              className={`edu-spotlight-dot${i === index ? ' is-active' : ''}`}
              aria-selected={i === index}
              aria-label={`${c.code}: ${c.title}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>

      <div className="edu-spotlight-stage">
        <AnimatePresence mode="wait">
          <motion.article
            key={course.code}
            className="edu-spotlight-slide"
            initial={{ opacity: 0, x: reduceMotion ? 0 : 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduceMotion ? 0 : -28 }}
            transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="edu-spotlight-badge-row">
              <span className="tag">{course.code}</span>
              <span className="edu-spotlight-term">{course.term}</span>
              <span className="portfolio-badge">MCS portfolio</span>
            </div>
            <h2 className="edu-spotlight-title">{course.title}</h2>
            <ul className="edu-spotlight-bullets">
              {course.bullets.map((b) => (
                <li key={b.slice(0, 40)}>{b}</li>
              ))}
            </ul>
            <div className="edu-spotlight-actions">
              {demoId && (
                <Link to={demoHref(demoId)} className="btn btn-primary">Try interactive demo</Link>
              )}
              {paperHref && (
                <Link to={paperHref} className="btn btn-ghost">Read portfolio write-up</Link>
              )}
            </div>
          </motion.article>
        </AnimatePresence>

        {courses.length > 1 && (
          <div className="edu-spotlight-nav">
            <button type="button" className="edu-spotlight-arrow" onClick={() => go(-1)} aria-label="Previous course">
              ‹
            </button>
            <button type="button" className="edu-spotlight-arrow" onClick={() => go(1)} aria-label="Next course">
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { IconType } from 'react-icons';
import { FiBriefcase, FiMapPin } from 'react-icons/fi';
import { SiJavascript, SiVuedotjs, SiPhp, SiDocker, SiCloudflare, SiAndroid, SiKotlin } from 'react-icons/si';
import { experience, formatDuration } from '../data/experience';
import { jobId } from '../data/rails';
import { AsuLogo } from '../components/AsuLogo';
import './ExperiencePage.css';

/** Icons for each job's `stack` entry. 'ASU' has no brand mark in
    react-icons, so it's handled separately via AsuLogo. */
const techStackIcons: Record<string, IconType> = {
  JavaScript: SiJavascript,
  Vue: SiVuedotjs,
  PHP: SiPhp,
  Docker: SiDocker,
  Cloudflare: SiCloudflare,
  Android: SiAndroid,
  Kotlin: SiKotlin,
};

/**
 * Each job panel can't rely on the browser's native same-document anchor
 * jump (React Router Links, or an element not yet positioned on first
 * paint), so a direct /experience#job-... load (or a stale layout at the
 * moment it would fire) leaves it short of the target. Scroll to the hash
 * ourselves, then correct once fonts have settled.
 */
function useJobHashTarget() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (!(el instanceof HTMLElement)) return;

    const jump = (behavior: ScrollBehavior) => el.scrollIntoView({ behavior, block: 'center' });
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const raf = requestAnimationFrame(() => jump(reduce ? 'auto' : 'smooth'));
    document.fonts?.ready.then(() => jump('auto'));

    return () => cancelAnimationFrame(raf);
  }, [hash]);
}

/**
 * A single vertical spine down the left, one node per job, nearest first;
 * each job's card sits to its right.
 */
export function ExperiencePage() {
  useJobHashTarget();

  return (
    <div className="exp-page">
      <div className="page-header">
        <p className="section-label">Career</p>
        <h1>Work Experience</h1>
        <p className="page-lead">Software development on production web applications and analytics platforms.</p>
      </div>

      <ol className="timeline">
        {experience.map((job, i) => {
          const duration = formatDuration(job.period, job.started, job.ended);
          return (
            <li
              key={job.company + job.title}
              id={jobId(job)}
              className="tl-item"
              aria-labelledby={`${jobId(job)}-title`}
            >
              <span className="tl-node" aria-hidden>
                <FiBriefcase />
              </span>

              <article className="card tl-card">
                <div className="tl-card-main">
                  <header className="tl-head">
                    <h2 id={`${jobId(job)}-title`}>{job.company}</h2>
                    <p className="tl-sub">{job.title}</p>
                    <div className="tl-meta">
                      <span className="tl-meter">
                        {job.period}
                        {duration && <> · {duration}</>}
                      </span>
                      <span className="tl-loc"><FiMapPin aria-hidden /> {job.location}</span>
                    </div>
                  </header>

                  <ul className="tl-highlights">
                    {job.highlights.map((h) => <li key={h.slice(0, 40)}>{h}</li>)}
                  </ul>
                </div>

                {job.stack && (
                  <ul className="tl-stack" aria-label="Technologies used">
                    {job.stack.map((name) => {
                      if (name === 'ASU') {
                        return (
                          <li key={name} className="tl-stack-chip" title={name}>
                            <AsuLogo size="sm" />
                          </li>
                        );
                      }
                      const Icon = techStackIcons[name];
                      if (!Icon) return null;
                      return (
                        <li key={name} className="tl-stack-chip" title={name}>
                          <Icon aria-hidden />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>

              {i === 0 && <span className="tl-now">Now</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

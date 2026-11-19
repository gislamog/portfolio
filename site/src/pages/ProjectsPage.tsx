import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { courseHref, requestAccessHref, projects, type Project } from '../data/projects';
import { ProjectVisual, projectIcon } from '../components/ProjectVisual';
import { hasMedia, MORE_PROJECTS_ID } from '../data/rails';

/**
 * Featured cards (and any other /projects#id link) are router Links, so the
 * browser never does a native anchor jump. Scroll to the card ourselves.
 */
function useProjectHashTarget() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (!(el instanceof HTMLElement)) return;

    const jump = (behavior: ScrollBehavior) => el.scrollIntoView({ behavior, block: 'start' });

    // Wait a frame so layout has settled before measuring the scroll target.
    const raf = requestAnimationFrame(() => {
      jump(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
      el.classList.remove('project-card-flash');
      void el.offsetWidth;
      el.classList.add('project-card-flash');
    });
    // Each project is a full-viewport sheet, so a webfont swap after that jump
    // (fonts load with display: swap) reflows every sheet's height and throws
    // off the scroll above; correct it once fonts have settled.
    document.fonts?.ready.then(() => jump('auto'));

    const clear = window.setTimeout(() => el.classList.remove('project-card-flash'), 3000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(clear);
      el.classList.remove('project-card-flash');
    };
  }, [hash]);
}

function ProjectActions({ project: p }: { project: Project }) {
  const accessHref = requestAccessHref(p);
  if (!p.liveUrl && !p.demoId && !p.courseCode && !accessHref) return null;
  return (
    <div className="project-actions">
      {p.liveUrl && (
        <a href={p.liveUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
          Live Site
        </a>
      )}
      {p.demoId && <Link to={`/demos#${p.demoId}`} className="btn btn-primary">Try Demo</Link>}
      {p.courseCode && (
        <Link to={courseHref(p.courseCode)} className="btn btn-ghost">{p.courseCode}</Link>
      )}
      {accessHref && (
        <Link
          to={accessHref}
          className="btn btn-ghost"
          title="This repository is private. Request access via the contact form."
        >
          GitHub (Private)
        </Link>
      )}
    </div>
  );
}


const SHEETS = ['dots', 'ruled', 'hatched', 'graph'] as const;

export function ProjectsPage() {
  useProjectHashTarget();

  const showcase = projects.filter(hasMedia);
  const more = projects.filter((p) => !hasMedia(p));

  return (
    <div className="nb-page">
      {/* Projects with screenshots: text beside a media panel, alternating sides,
          one full-viewport sheet per project. */}
      {showcase.map((p, i) => (
        <section key={p.id} className="nb-sheet" data-sheet={SHEETS[i % SHEETS.length]}>
          {i === 0 && (
            <div className="page-header container">
              <p className="section-label">Portfolio</p>
              <h1>Projects</h1>
              <p className="page-lead">Selected product, academic, and visualization work.</p>
            </div>
          )}
          <div className="container projects-showcase">
            <article
              id={p.id}
              className={`card project-card project-card--media${i % 2 ? ' is-flipped' : ''}`}
            >
              <div className="project-card-body">
                <div className="project-tags">{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
                <h2>{p.title}</h2>
                <p className="project-desc">{p.description}</p>
                <ul>{p.highlights.map((h) => <li key={h.slice(0, 30)}>{h}</li>)}</ul>
                <ProjectActions project={p} />
              </div>
              <div className={`project-card-media tone-${p.tone}`}>
                <ProjectVisual project={p} Icon={projectIcon(p.id)} />
              </div>
            </article>
          </div>
        </section>
      ))}

      {more.length > 0 && (
        <section className="nb-sheet" data-sheet={SHEETS[showcase.length % SHEETS.length]}>
          <div className="container">
            <h2 id={MORE_PROJECTS_ID} className="projects-subhead">More projects</h2>
            <div className="projects-compact">
              {more.map((p) => {
                const Icon = projectIcon(p.id);
                return (
                  <article key={p.id} id={p.id} className="card project-card project-card--compact">
                    <div className="project-compact-head">
                      <span className={`project-compact-icon tone-${p.tone}`} aria-hidden>
                        <Icon />
                      </span>
                      <div className="project-tags">{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
                    </div>
                    <h2>{p.title}</h2>
                    <p className="project-desc">{p.description}</p>
                    <ul>{p.highlights.map((h) => <li key={h.slice(0, 30)}>{h}</li>)}</ul>
                    <ProjectActions project={p} />
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

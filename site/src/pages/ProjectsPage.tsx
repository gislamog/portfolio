import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { courseHref, requestAccessHref, projects } from '../data/projects';
import { ProjectVisual, projectIcon } from '../components/ProjectVisual';

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

    const raf = requestAnimationFrame(() => {
      el.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      });
      el.classList.remove('project-card-flash');
      void el.offsetWidth;
      el.classList.add('project-card-flash');
    });

    const clear = window.setTimeout(() => el.classList.remove('project-card-flash'), 3000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(clear);
      el.classList.remove('project-card-flash');
    };
  }, [hash]);
}

export function ProjectsPage() {
  useProjectHashTarget();

  return (
    <div className="page-header container">
      <p className="section-label">Portfolio</p>
      <h1>Projects</h1>
      <p className="page-lead">Selected product, academic, and visualization work.</p>

      <div className="projects-grid" style={{ marginTop: '2rem' }}>
        {projects.map((p) => {
          const Icon = projectIcon(p.id);
          const accessHref = requestAccessHref(p);
          return (
            <article key={p.id} id={p.id} className="card project-card">
              <ProjectVisual project={p} Icon={Icon} />
              <div className="project-card-body">
                <div>{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                <ul>{p.highlights.map((h) => <li key={h.slice(0, 30)}>{h}</li>)}</ul>
                <div className="project-actions">
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
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

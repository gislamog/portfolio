import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { courseHref, requestAccessHref, projects, type Project } from '../data/projects';
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

const hasMedia = (p: Project) => Boolean(p.images?.length || p.image);

export function ProjectsPage() {
  useProjectHashTarget();

  const showcase = projects.filter(hasMedia);
  const more = projects.filter((p) => !hasMedia(p));

  return (
    <div className="page-header container">
      <p className="section-label">Portfolio</p>
      <h1>Projects</h1>
      <p className="page-lead">Selected product, academic, and visualization work.</p>

      {/* Projects with screenshots: text beside a media panel, alternating sides. */}
      <div className="projects-showcase">
        {showcase.map((p, i) => (
          <article
            key={p.id}
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
        ))}
      </div>

      {more.length > 0 && (
        <>
          <h2 className="projects-subhead">More projects</h2>
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
        </>
      )}
    </div>
  );
}

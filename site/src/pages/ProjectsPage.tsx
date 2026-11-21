import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiMaximize2, FiX } from 'react-icons/fi';
import { courseHref, demoHref, projectHref, projects, requestAccessHref, type Project } from '../data/projects';
import { projectStudies } from '../data/projectStudies';
import { projectIcon } from '../components/ProjectVisual';
import { getExperiment, experiments } from '../data/explore';
import './ProjectsPage.css';

const featured = projects.find(({ id }) => id === 'academic-quintiles')!;
const projectGroups = [
  { title: 'Major projects', ids: ['git-worktrees', 'capstone', 'piano-pogo'] },
  { title: 'Applied machine learning', compact: true, ids: ['mcs-collision', 'mcs-kmeans'] },
];
const archiveGroups = [
  { title: 'Applications and reporting', ids: ['analytics-viz', 'property-management'] },
  { title: 'Coursework and experiments', ids: ['density-classification', 'mcs-crypto', 'mcs-mnist', 'mcs-matching', 'mcs-lexer', 'mcs-sdn', 'ants-sphere'] },
];
const screenshotCaptions: Record<string, string[]> = {
  'piano-pogo': ['Piano Pogo home screen', 'Lesson roadmap with current, completed, and locked lessons', 'Mini-games with best scores and a daily challenge', 'Song selection screen'],
  'mcs-collision': ['Robot simulator with distance sensors', 'Collision prediction in the simulator', 'Robot steering interface'],
  'mcs-kmeans': ['K-means clustering experiment visualization'],
};

function useProjectHashTarget() {
  const { hash, key } = useLocation();
  useEffect(() => {
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    const frame = requestAnimationFrame(() => {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, key]);
}

function ProjectActions({ project, showStudy = false }: { project: Project; showStudy?: boolean }) {
  const accessHref = requestAccessHref(project);
  const liveDemo = project.demoId && getExperiment(project.demoId);
  return (
    <div className="projects-actions">
      {showStudy && <Link className="portfolio-pill project-primary" aria-label={`Read case study: ${project.title}`} to={`/projects/${project.id}`}>Read case study <FiArrowRight aria-hidden="true" /></Link>}
      {project.liveUrl && <a className="portfolio-pill" href={project.liveUrl}>Visit {project.title}</a>}
      {liveDemo && <Link className="portfolio-pill" to={demoHref(liveDemo)}>Try {experiments[liveDemo].title}</Link>}
      {projectStudies[project.id]?.report && <Link className="portfolio-pill" to="/explore/mcs-portfolio">Read MCS report</Link>}
      {project.courseCode && <Link className="portfolio-pill" to={courseHref(project.courseCode)}>Course · {project.courseCode}</Link>}
      {accessHref && <Link className="portfolio-pill" to={accessHref}>Request repository access</Link>}
      {project.id === 'analytics-viz' && <Link className="portfolio-pill" to="/experience">Related experience</Link>}
      {project.id === 'capstone' && <Link className="portfolio-pill" to={courseHref('SER 401/402')}>Capstone coursework</Link>}
    </div>
  );
}

function ProjectMedia({ project }: { project: Project }) {
  const captions = screenshotCaptions[project.id];
  const screenshots = project.images ?? (project.image ? [project.image] : []);
  const [index, setIndex] = useState(project.id === 'piano-pogo' ? 1 : 0);
  const dialog = useRef<HTMLDialogElement>(null);

  if (captions && screenshots.length) {
    return (
      <figure className="projects-media">
        <button className="projects-image-button" type="button" aria-label={`Enlarge ${captions[index]}`} onClick={() => dialog.current?.showModal()}>
          <img loading="lazy" src={screenshots[index]} alt={captions[index]} />
          <FiMaximize2 aria-hidden="true" />
        </button>
        <figcaption aria-live="polite">{captions[index]}</figcaption>
        {screenshots.length > 1 && (
          <div className="projects-gallery-controls" aria-label="Choose screenshot" role="group">
            {captions.map((caption, i) => (
              <button key={caption} type="button" aria-label={caption} aria-pressed={index === i} onClick={() => setIndex(i)}>{i + 1}</button>
            ))}
          </div>
        )}
        <dialog ref={dialog} className="projects-image-dialog" aria-label={`${project.title} screenshots`}>
          <button type="button" aria-label="Close screenshot" onClick={() => dialog.current?.close()}><FiX aria-hidden="true" /></button>
          <img loading="lazy" src={screenshots[index]} alt={captions[index]} />
          <div className="projects-dialog-caption">
            {screenshots.length > 1 && (
              <button type="button" aria-label="Previous screenshot" onClick={() => setIndex((i) => (i + screenshots.length - 1) % screenshots.length)}>
                <FiArrowLeft aria-hidden="true" />
              </button>
            )}
            <span aria-live="polite">{captions[index]} ({index + 1} of {screenshots.length})</span>
            {screenshots.length > 1 && (
              <button type="button" aria-label="Next screenshot" onClick={() => setIndex((i) => (i + 1) % screenshots.length)}>
                <FiArrowRight aria-hidden="true" />
              </button>
            )}
          </div>
        </dialog>
      </figure>
    );
  }

  if (project.id === 'academic-quintiles') {
    return (
      <figure className="projects-diagram">
        <figcaption>How one filter serves two views</figcaption>
        <div className="portfolio-pill">Application cohort + active filters</div>
        <div className="projects-diagram-branches">
          <div><strong>Three stacked charts</strong><span>Dim unmatched selectivity bands. Keep the full distribution in view.</span></div>
          <div><strong>Application detail table</strong><span>Apply all active filters. Show only matching applications.</span></div>
        </div>
      </figure>
    );
  }

  if (project.id === 'git-worktrees') {
    return (
      <figure className="projects-diagram">
        <figcaption>How local branches stay isolated</figcaption>
        <div className="portfolio-pill">Bash CLI generates routes and mounts</div>
        <div className="projects-diagram-branches">
          <div><strong>Frontend worktree</strong><span>Local hostname → Caddy → branch port</span></div>
          <div><strong>PHP worktree</strong><span>Local hostname → nginx → branch application</span></div>
        </div>
        <p className="projects-diagram-note">Docker mounts the branch directories and generated proxy configuration. Symlinks keep the larger application tree shared.</p>
      </figure>
    );
  }

  if (project.id === 'capstone') {
    return (
      <figure className="projects-diagram">
        <figcaption>Assignment workflow</figcaption>
        <ol className="projects-workflow">
          <li className="portfolio-pill">Administrator assigns reviews</li>
          <li className="portfolio-pill">Scheduling checks absences and conflicts</li>
          <li className="portfolio-pill">Employee sees assigned work</li>
        </ol>
      </figure>
    );
  }

  return null;
}

function ProjectTags({ project }: { project: Project }) {
  return <ul className="projects-tags" aria-label="Technologies and topics">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>;
}

function MajorProject({ project, isFeatured = false }: { project: Project; isFeatured?: boolean }) {
  const study = projectStudies[project.id];
  const Heading = isFeatured ? 'h2' : 'h3';
  return (
    <article className={`portfolio-card projects-major${isFeatured ? ' projects-featured' : ''}`} id={project.id} tabIndex={-1} aria-labelledby={`${project.id}-title`}>
      <div className="projects-major-copy">
        <ProjectTags project={project} />
        <Heading id={`${project.id}-title`}>{project.title}</Heading>
        <p>{study.summary}</p>
        <p className="projects-role">{study.role}</p>
        {isFeatured && (
          <>
            <p>Built a custom chart to show academic ranges alongside stacked bars and designed different filter behaviors for aggregate and application-level views.</p>
            <dl className="projects-feature-results">
              <div><dt>Playwright end-to-end tests</dt><dd>78</dd></div>
              <div><dt>Applications in the validation cohort</dt><dd>14,875</dd></div>
            </dl>
          </>
        )}
        <ProjectActions project={project} showStudy />
      </div>
      <ProjectMedia project={project} />
    </article>
  );
}

function ArchiveProject({ project }: { project: Project }) {
  const Icon = projectIcon(project.id);
  const unreleased = Boolean(project.demoId && !getExperiment(project.demoId));
  return (
    <article className="portfolio-card projects-archive-card" id={project.id} tabIndex={-1} aria-labelledby={`${project.id}-title`}>
      <h4 id={`${project.id}-title`}><Icon aria-hidden="true" />{project.title}</h4>
      {unreleased && <p className="projects-status">Browser demo unreleased</p>}
      <p>{project.id === 'mcs-mnist' ? 'A browser sketchpad prototype inspired by the CSE 575 neural-network lab. The prototype compares downsampled sketches with digit templates.' : project.description}</p>
      <details>
        <summary>Technical details</summary>
        <ProjectTags project={project} />
        <ul className="projects-highlights">{project.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
      </details>
      <ProjectActions project={project} />
    </article>
  );
}

export function ProjectsPage() {
  useProjectHashTarget();
  return (
    <div className="portfolio-content projects-page">
      <header className="portfolio-section-intro">
        <p className="portfolio-eyebrow">Selected Engineering Work</p>
        <h1>Projects</h1>
        <p className="portfolio-summary">Production features, independent applications, and technical projects across data visualization, application architecture, developer tooling, and machine learning.</p>
      </header>

      <MajorProject project={featured} isFeatured />
      {projectGroups.map(({ title, compact, ids }) => (
        <section key={title} className="projects-section">
          <h2>{title}</h2>
          <div className={compact ? "projects-group projects-group-compact" : "projects-group"}>
            {ids.map((id) => <MajorProject key={id} project={projects.find((project) => project.id === id)!} />)}
          </div>
        </section>
      ))}
      <section className="projects-section" id="more-projects" tabIndex={-1}>
        <h2>More projects</h2>
        {archiveGroups.map(({ title, ids }) => (
          <section key={title} className="projects-archive-group">
            <h3>{title}</h3>
            <div className="projects-archive">
              {ids.map((id) => <ArchiveProject key={id} project={projects.find((project) => project.id === id)!} />)}
            </div>
          </section>
        ))}
      </section>
    </div>
  );
}

export function ProjectStudyPage() {
  const { projectId } = useParams();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [projectId]);
  const project = projects.find(({ id }) => id === projectId);
  const study = project ? projectStudies[project.id] : undefined;

  if (!project || !study) {
    return <section className="portfolio-content projects-page"><h1>Case study unavailable</h1><Link className="portfolio-pill" to="/projects">Browse projects</Link></section>;
  }

  return (
    <article className="portfolio-content projects-page projects-study">
      <Link className="projects-back" to={projectHref(project.id)}><FiArrowLeft aria-hidden="true" /> Back to Projects</Link>
      <header className="portfolio-section-intro">
        <p className="portfolio-eyebrow">Engineering Case Study</p>
        <h1 ref={heading} tabIndex={-1}>{project.title}</h1>
        <p className="portfolio-summary">{study.summary}</p>
      </header>
      <div className="portfolio-card projects-study-overview">
        <div>
          <h2>My contribution</h2>
          <p>{study.role}</p>
          <ProjectTags project={project} />
          <ProjectActions project={project} />
        </div>
        <ProjectMedia key={project.id} project={project} />
      </div>
      <div className="projects-study-sections">
        {study.sections.map(({ title, text }) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
      </div>
    </article>
  );
}

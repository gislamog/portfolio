import { Link } from 'react-router-dom';
import { projects } from '../data/projects';

export function ProjectsPage() {
  return (
    <div className="page-header container">
      <p className="section-label">Portfolio</p>
      <h1>Projects</h1>
      <p>Selected academic, professional, and personal projects that showcase my engineering work.</p>

      <div className="projects-grid" style={{ marginTop: '2rem' }}>
        {projects.map((p) => (
          <article key={p.id} className="card project-card">
            <div>{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
            <h2>{p.title}</h2>
            <p>{p.description}</p>
            <ul>{p.highlights.map((h) => <li key={h.slice(0, 30)}>{h}</li>)}</ul>
            <div className="project-actions">
              {p.demoId && <Link to={`/demos#${p.demoId}`} className="btn btn-primary">Try Demo</Link>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

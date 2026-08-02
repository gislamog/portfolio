import { experience } from '../data/experience';

export function ExperiencePage() {
  return (
    <div className="page-header container">
      <p className="section-label">Career</p>
      <h1>Work Experience</h1>
      <p>Professional roles spanning QA automation, full-stack support, and software development internships.</p>

      <div className="timeline" style={{ marginTop: '2.5rem' }}>
        {experience.map((job) => (
          <article key={job.company + job.title} className="card timeline-item">
            <div className="timeline-head">
              <div>
                <h2>{job.title}</h2>
                <p className="company">{job.company} · {job.location}</p>
              </div>
              <span className="period">{job.period}</span>
            </div>
            {job.note && <p className="note">{job.note}</p>}
            <ul>{job.highlights.map((h) => <li key={h.slice(0, 40)}>{h}</li>)}</ul>
          </article>
        ))}
      </div>
    </div>
  );
}

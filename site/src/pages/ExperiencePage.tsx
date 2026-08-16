import { FiBriefcase, FiMapPin } from 'react-icons/fi';
import { experience } from '../data/experience';

export function ExperiencePage() {
  return (
    <div className="page-header container">
      <p className="section-label">Career</p>
      <h1>Work Experience</h1>
      <p className="page-lead">Software development on production web applications, analytics platforms, and internships.</p>

      <div className="timeline" style={{ marginTop: '2.5rem' }}>
        {experience.map((job) => (
          <article key={job.company + job.title} className="card timeline-item">
            <div className="timeline-head">
              <div className="timeline-title-row">
                <span className="job-icon" aria-hidden><FiBriefcase /></span>
                <div>
                  <h2>{job.title}</h2>
                  <p className="company">{job.company}</p>
                  <p className="job-meta"><FiMapPin aria-hidden /> {job.location}</p>
                </div>
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

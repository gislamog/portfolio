import { Link } from 'react-router-dom';
import { bigDataCertificate as cert } from '../data/bigDataCertificate';
import './BigDataPage.css';

/** Matches the anchor ids CourseCard renders on the Education page. */
function courseHref(code: string) {
  return `/education#course-${code.toLowerCase().replace(/\s+/g, '-')}`;
}

export function BigDataPage() {
  return (
    <div className="page-header container cert-page">
      <div className="cert-intro-row">
        <div className="cert-intro">
          <p className="section-label">Graduate Certificate</p>
          <h1>{cert.title}</h1>
          <p>
            Awarded by the {cert.awardedBy} for nine credit hours of graduate
            coursework in data mining, machine learning, and visualization.
          </p>
          <p className="cert-awarded">
            {cert.term} · {cert.location}
          </p>
          <a className="btn btn-ghost" href={cert.imageUrl} target="_blank" rel="noreferrer">
            Original Certificate
          </a>
        </div>

        <aside className="card cert-courses" aria-labelledby="cert-courses-heading">
          <h2 id="cert-courses-heading" className="cert-courses-title">
            Certification Courses
          </h2>
          <p className="cert-requirement">{cert.requirement}</p>
          <ul className="cert-course-list">
            {cert.courses.map((c) => (
              <li key={c.code} className={c.completed ? 'completed' : 'not-taken'}>
                {/* Only completed courses have a card on the Education page. */}
                {c.completed ? (
                  <Link className="cert-course-pill" to={courseHref(c.code)}>
                    <strong>{c.code}</strong> {c.title}
                  </Link>
                ) : (
                  <span className="cert-course-pill">
                    <strong>{c.code}</strong> {c.title}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <article className="card cert-body">
        <p className="cert-citation">{cert.citation}</p>

        <div className="cert-presentation">
          <p className="cert-presented-to">This certificate is being presented to</p>
          <p className="cert-recipient">{cert.recipient}</p>
          <p className="cert-for">{cert.presentation}</p>
          <p className="cert-award">{cert.award}</p>
          <p className="cert-awarded-by">
            awarded by the {cert.awardedBy}
          </p>
        </div>
      </article>
    </div>
  );
}

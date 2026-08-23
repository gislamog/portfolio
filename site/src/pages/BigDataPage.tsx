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
      {/* The heading block keeps the shared .page-header spacing while the
          courses panel rides alongside it at the top right. */}
      <div className="cert-intro-row">
        <div className="cert-intro">
          <p className="section-label">Graduate Certificate</p>
          <h1>{cert.title}</h1>
          <p className="page-lead">
            Awarded by the {cert.awardedBy} for nine credit hours of graduate
            coursework in data mining, machine learning, and visualization.
          </p>
          {/* Mirrors the MCS report page's .report-actions row: the link and the
              term sit on one line. Here the link leads, so it lands to the left
              of the term. */}
          <p className="cert-actions">
            <a className="btn btn-ghost" href={cert.imageUrl} target="_blank" rel="noreferrer">
              Original Certificate
            </a>
            <span className="cert-awarded">{cert.term}</span>
          </p>
        </div>

        <aside className="card cert-courses" aria-labelledby="cert-courses-heading">
          <h2 id="cert-courses-heading" className="cert-courses-title">
            Certification Courses
          </h2>
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

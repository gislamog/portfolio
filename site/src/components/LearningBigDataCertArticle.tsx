import { Link } from 'react-router-dom';
import { bigDataCertificate as cert } from '../data/bigDataCertificate';
import './LearningBigDataCertArticle.css';

/** Matches the anchor ids CourseCard renders on the Education page. */
function courseHref(code: string) {
  return `/education#course-${code.toLowerCase().replace(/\s+/g, '-')}`;
}

const ASU_PROGRAM_URL =
  'https://degrees.asu.edu/masters-phd/major/ASU00/ESBDTAGRCT/big-data-graduate-certificate#quick-facts';

export function LearningBigDataCertArticle() {
  return (
    <article className="art-body cert-article">
      <h1>{cert.title}</h1>
      <p className="art-lede">
        Awarded by the {cert.awardedBy} for nine credit hours of graduate coursework in data mining, machine
        learning, and visualization.
      </p>

      <p className="cert-actions">
        <a className="btn btn-primary" href={ASU_PROGRAM_URL} target="_blank" rel="noreferrer">
          ASU Program Page
        </a>
        <a className="btn btn-ghost" href={cert.imageUrl} target="_blank" rel="noreferrer">
          Original Certificate
        </a>
        <span className="cert-awarded">{cert.term}</span>
      </p>

      <aside className="card cert-courses" aria-labelledby="cert-courses-heading">
        <h2 id="cert-courses-heading" className="cert-courses-title">
          Courses completed
        </h2>
        <ul className="cert-course-list">
          {cert.courses.map((c) => (
            <li key={c.code} className={c.completed ? 'completed' : 'not-taken'}>
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
        <p className="cert-courses-date">Completed {cert.term}.</p>
      </aside>

      <article className="card cert-body">
        <p className="cert-citation">{cert.citation}</p>
        <div className="cert-presentation">
          <p className="cert-presented-to">This certificate is being presented to</p>
          <p className="cert-recipient">{cert.recipient}</p>
          <p className="cert-for">{cert.presentation}</p>
          <p className="cert-award">{cert.award}</p>
          <p className="cert-awarded-by">awarded by the {cert.awardedBy}</p>
        </div>
      </article>
    </article>
  );
}

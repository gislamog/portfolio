import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  portfolioMeta,
  portfolioPapers,
  portfolioSummary,
  type ReportPaper,
  type ReportSection,
} from '../data/mcsPortfolio';
import './McsPortfolioPage.css';

/**
 * Numbered sections in the source papers are `I.`, `II.`, ... with lettered
 * subsections nested underneath. A section carrying a roman label and no
 * paragraphs is a divider that only introduces the subsections below it.
 */
function Section({ section }: { section: ReportSection }) {
  const isSub = section.level === 3;
  const label = section.label ? `${section.label}. ` : '';

  if (isSub) {
    return (
      <>
        <h4 className="report-subheading">{label}{section.heading}</h4>
        {section.paragraphs.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </>
    );
  }

  return (
    <>
      <h3 className="report-heading">{label}{section.heading}</h3>
      {section.paragraphs.map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
    </>
  );
}

function Paper({ paper }: { paper: ReportPaper }) {
  return (
    <article id={paper.id} className="report-paper">
      <header className="report-paper-head">
        <span className="tag">{paper.courseCode}</span>
        <h2>{paper.title}</h2>
        <p className="report-course">{paper.course}</p>
      </header>

      {paper.abstract && (
        <p className="report-abstract">
          <span className="report-abstract-label">Abstract—</span>
          {paper.abstract}
        </p>
      )}

      {paper.figure && (
        <figure className="report-figure">
          <img src={paper.figure.src} alt={paper.figure.alt} loading="lazy" />
          <figcaption>{paper.figure.caption}</figcaption>
        </figure>
      )}

      {paper.sections.map((s) => (
        <Section key={`${s.label ?? ''}${s.heading}`} section={s} />
      ))}

      <h3 className="report-heading">References</h3>
      <ol className="report-references">
        {paper.references.map((r) => (
          <li key={r.slice(0, 40)}>{r}</li>
        ))}
      </ol>
    </article>
  );
}

/**
 * The in-page contents links are plain anchors, so arriving at
 * /education/mcs-portfolio#neural-network-paper from another route never fires
 * the browser's native anchor jump. Scroll to the target ourselves once the
 * route has rendered.
 */
function useReportHashTarget() {
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
    });
    return () => cancelAnimationFrame(raf);
  }, [hash]);
}

export function McsPortfolioPage() {
  useReportHashTarget();

  return (
    <div className="page-header page-content container report-page">
      <p className="section-label">Master&apos;s Degree</p>
      <h1>{portfolioMeta.title}</h1>
      <p className="page-lead">
        The degree completion artifact for my MCS, presented here as readable text.
        It collects two graduate machine learning projects: unsupervised clustering
        in CSE 575 and a supervised collision-prediction network in CSE 571.
      </p>

      <div className="report-byline">
        <p className="report-author">{portfolioMeta.author}</p>
        <p>{portfolioMeta.affiliation}</p>
        <p>{portfolioMeta.address}</p>
        <p>
          <a href={`mailto:${portfolioMeta.email}`}>{portfolioMeta.email}</a>
        </p>
      </div>

      <div className="report-actions">
        <Link to="/education" className="btn btn-ghost">← Back to Education</Link>
        <a
          className="btn btn-primary"
          href={portfolioMeta.pdfUrl}
          target="_blank"
          rel="noreferrer"
        >
          Original PDF
        </a>
      </div>

      <nav className="education-toc" aria-label="Report contents">
        <a href="#summary">Portfolio Summary</a>
        {portfolioPapers.map((p) => (
          <a key={p.id} href={`#${p.id}`}>{p.title.replace(' Project', '')}</a>
        ))}
      </nav>

      <article id="summary" className="report-paper">
        <header className="report-paper-head">
          <h2>{portfolioSummary.title}</h2>
        </header>
        {portfolioSummary.paragraphs.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </article>

      {portfolioPapers.map((p) => (
        <Paper key={p.id} paper={p} />
      ))}
    </div>
  );
}

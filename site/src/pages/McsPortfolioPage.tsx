import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  portfolioMeta,
  portfolioPapers,
  portfolioSummary,
  sectionId,
  type ReportPaper,
  type ReportSection,
} from '../data/mcsPortfolio';
import './McsPortfolioPage.css';

const SUMMARY_ID = 'summary';

/**
 * Numbered sections print as `I. INTRODUCTION` in small caps and lettered
 * subsections as italic `A. Background Information`, matching the source
 * papers. A numbered section with no paragraphs only introduces the
 * subsections beneath it.
 */
function Section({ paperId, section }: { paperId: string; section: ReportSection }) {
  const id = sectionId(paperId, section);
  const label = section.label ? `${section.label}. ` : '';
  const Heading = section.level === 3 ? 'h4' : 'h3';
  const className = section.level === 3 ? 'report-subheading' : 'report-heading';

  return (
    <>
      <Heading id={id} className={className}>
        {label}
        {section.heading}
      </Heading>
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
        <h2>{paper.title}</h2>
        <p className="report-author">{portfolioMeta.author}</p>
        <p className="report-affiliation">{portfolioMeta.affiliation}</p>
        <p className="report-affiliation">{portfolioMeta.address}</p>
        <p className="report-affiliation">{portfolioMeta.email}</p>
        <p className="report-course">
          {paper.courseCode} — {paper.course}
        </p>
      </header>

      {paper.abstract && (
        <p id={`${paper.id}-abstract`} className="report-abstract">
          <em>Abstract</em>—{paper.abstract}
        </p>
      )}

      {paper.figure && (
        <figure className="report-figure">
          <img src={paper.figure.src} alt={paper.figure.alt} loading="lazy" />
          <figcaption>{paper.figure.caption}</figcaption>
        </figure>
      )}

      {paper.sections.map((s) => (
        <Section key={sectionId(paper.id, s)} paperId={paper.id} section={s} />
      ))}

      <h3 id={`${paper.id}-references`} className="report-heading">
        References
      </h3>
      <ol className="report-references">
        {paper.references.map((r) => (
          <li key={r.slice(0, 40)}>{r}</li>
        ))}
      </ol>
    </article>
  );
}

/**
 * One dot-leader row per document. Section-level entries are deliberately left
 * out: listing them made the contents longer than the summary it introduces,
 * and every section is reachable from the report body itself.
 */
function TableOfContents() {
  const entries = [
    { href: `#${SUMMARY_ID}`, label: portfolioSummary.title },
    ...portfolioPapers.map((p) => ({ href: `#${p.id}`, label: p.title })),
  ];

  return (
    <nav className="report-toc" aria-label="Table of contents">
      <h2 className="report-toc-title">Table of Contents</h2>
      <ol className="report-toc-list">
        {entries.map((e) => (
          <li key={e.href}>
            {/* Flexing an inner wrapper keeps the li's numbered marker. */}
            <span className="report-toc-row">
              <a className="report-toc-name" href={e.href}>{e.label}</a>
              <span className="report-toc-dots" aria-hidden="true" />
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Contents entries are plain anchors, so arriving from another route never
 * fires the browser's native anchor jump. Scroll to the target ourselves once
 * the route has rendered.
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
    <div className="page-header container report-page">
      <div className="report-actions">
        <a
          className="btn btn-ghost"
          href={portfolioMeta.pdfUrl}
          target="_blank"
          rel="noreferrer"
        >
          Original PDF
        </a>
      </div>

      <TableOfContents />

      <article id={SUMMARY_ID} className="report-paper">
        <header className="report-paper-head">
          <h2>{portfolioSummary.title}</h2>
          <p className="report-author">{portfolioMeta.author}</p>
          <p className="report-affiliation">{portfolioMeta.affiliation}</p>
          <p className="report-affiliation">{portfolioMeta.address}</p>
          <p className="report-affiliation">{portfolioMeta.email}</p>
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

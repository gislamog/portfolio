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

      <div className="report-columns">
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
      </div>
    </article>
  );
}

/**
 * One entry per document, styled like the Education page's section nav.
 * Section-level entries are deliberately left out: listing them made the
 * contents longer than the summary it introduces, and every section is
 * reachable from the report body itself.
 */
function TableOfContents() {
  const entries = [
    { href: `#${SUMMARY_ID}`, label: portfolioSummary.title },
    ...portfolioPapers.map((p) => ({ href: `#${p.id}`, label: p.title })),
  ];

  return (
    <nav className="education-toc" aria-label="Table of contents">
      {entries.map((e) => (
        <a key={e.href} href={e.href}>{e.label}</a>
      ))}
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
      <p className="section-label">Master&apos;s Degree</p>
      <h1>{portfolioMeta.title}</h1>
      <p className="page-lead">
        The degree completion artifact for my M.S. in Computer Science at Arizona
        State University, collecting two graduate machine learning projects: an
        unsupervised clustering study from CSE 575 and a supervised
        collision-prediction network from CSE 571.
      </p>

      {/* Same row as the Big Data page's .cert-actions: link leads, date trails. */}
      <p className="report-actions">
        <a
          className="btn btn-ghost"
          href={portfolioMeta.pdfUrl}
          target="_blank"
          rel="noreferrer"
        >
          Original PDF
        </a>
        <span className="report-completed">{portfolioMeta.completed}</span>
      </p>

      <TableOfContents />

      <article id={SUMMARY_ID} className="report-paper">
        <header className="report-paper-head">
          <h2>{portfolioSummary.title}</h2>
          <p className="report-author">{portfolioMeta.author}</p>
          <p className="report-affiliation">{portfolioMeta.affiliation}</p>
          <p className="report-affiliation">{portfolioMeta.address}</p>
          <p className="report-affiliation">{portfolioMeta.email}</p>
        </header>
        <div className="report-columns">
          {portfolioSummary.paragraphs.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
      </article>

      {portfolioPapers.map((p) => (
        <Paper key={p.id} paper={p} />
      ))}
    </div>
  );
}

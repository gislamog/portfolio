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
 * Groups each numbered section with the lettered subsections that follow it,
 * so the contents can render `Introduction (Background Information, Goals and
 * Objectives)` on one line instead of a separate row per subsection.
 */
function groupSections(paper: ReportPaper) {
  const groups: { section: ReportSection; subsections: ReportSection[] }[] = [];
  for (const section of paper.sections) {
    if (section.level === 3 && groups.length > 0) {
      groups[groups.length - 1].subsections.push(section);
    } else {
      groups.push({ section, subsections: [] });
    }
  }
  return groups;
}

/** Contents mirroring the report: each paper, then its sections nested under it. */
function TableOfContents() {
  return (
    <nav className="report-toc" aria-label="Table of contents">
      <h2 className="report-toc-title">Table of Contents</h2>
      <ol className="report-toc-list">
        <li>
          <a href={`#${SUMMARY_ID}`}>{portfolioSummary.title}</a>
        </li>
        {portfolioPapers.map((paper) => (
          <li key={paper.id}>
            <a href={`#${paper.id}`}>{paper.title}</a>
            <ol className="report-toc-sub">
              {paper.abstract && (
                <li className="report-toc-row">
                  <a className="report-toc-name" href={`#${paper.id}-abstract`}>Abstract</a>
                  <span className="report-toc-dots" aria-hidden="true" />
                </li>
              )}
              {groupSections(paper).map(({ section, subsections }) => (
                <li key={sectionId(paper.id, section)} className="report-toc-row">
                  <a className="report-toc-name" href={`#${sectionId(paper.id, section)}`}>
                    {section.label ? `${section.label}. ` : ''}
                    {section.heading}
                  </a>
                  <span className="report-toc-dots" aria-hidden="true" />
                  {subsections.length > 0 && (
                    <span className="report-toc-inline">
                      {'('}
                      {subsections.map((sub, i) => (
                        <span key={sectionId(paper.id, sub)}>
                          {i > 0 && ', '}
                          <a href={`#${sectionId(paper.id, sub)}`}>{sub.heading}</a>
                        </span>
                      ))}
                      {')'}
                    </span>
                  )}
                </li>
              ))}
              <li className="report-toc-row">
                <a className="report-toc-name" href={`#${paper.id}-references`}>References</a>
                <span className="report-toc-dots" aria-hidden="true" />
              </li>
            </ol>
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

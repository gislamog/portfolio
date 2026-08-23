import { Fragment, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  portfolioMeta,
  portfolioPapers,
  portfolioSummary,
  linkifyCitations,
  linkifyReference,
  referenceId,
  sectionId,
  type ReportChart,
  type ReportFigureTable,
  type ReportFormula,
  type ReportPaper,
  type ReportSection,
} from '../data/mcsPortfolio';
import { courseHref } from '../data/projects';
import './McsPortfolioPage.css';

const SUMMARY_ID = 'summary';

/**
 * Briefly highlights the reference a citation points at, so the reader can
 * pick it out of the list after jumping. Mirrors the course-card flash on the
 * Education page. Restarts cleanly when the same citation is clicked twice.
 */
function flashReference(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('report-reference-flash');
  // Force a reflow so the animation replays rather than being ignored.
  void el.offsetWidth;
  el.classList.add('report-reference-flash');
  window.setTimeout(() => el.classList.remove('report-reference-flash'), 2600);
}

/**
 * Numbered sections print as `I. INTRODUCTION` in small caps and lettered
 * subsections as italic `A. Background Information`, matching the source
 * papers. A numbered section with no paragraphs only introduces the
 * subsections beneath it.
 */
/** One figure or figure table, as laid out in the source document. */
function FigureTable({ table }: { table: ReportFigureTable }) {
  const above = table.captionPosition === 'above';
  /**
   * IEEE sets a table or graph number on its own line above the title, but
   * runs a figure number inline with its caption ("Fig. 1. Robot Navigation
   * Simulation"). A trailing period on the label marks the figure form.
   */
  const inlineLabel = table.label?.trimEnd().endsWith('.');
  const caption = (table.label || table.caption) && (
    <figcaption>
      {table.label && (
        <span className={inlineLabel ? 'report-figure-label' : 'report-table-label'}>
          {table.label}{inlineLabel ? ' ' : ''}
        </span>
      )}
      {table.caption}
    </figcaption>
  );

  return (
    <figure className="report-figure-table">
      {above && caption}
      <div className="report-figure-cells" data-cells={table.cells.length}>
        {table.cells.map((c) => (
          <div key={c.src + c.heading} className="report-figure-cell">
            {c.heading && <p className="report-figure-cell-head">{c.heading}</p>}
            <img src={c.src} alt={c.alt} loading="lazy" />
          </div>
        ))}
      </div>
      {!above && caption}
    </figure>
  );
}

/**
 * A display equation with its symbol legend, set off from the text as the
 * source document prints it. The visible expression is built from styled
 * spans rather than a math typesetting library, so summation limits stack
 * under and over the sigma. That layout is meaningless read character by
 * character, so the whole expression is hidden from assistive technology and
 * the formula's plain-language `speech` reading is exposed in its place.
 */
function Formula({ formula }: { formula: ReportFormula }) {
  return (
    <div className="report-formula" role="math" aria-label={formula.speech}>
      <p className="report-formula-expression" aria-hidden="true">
        {formula.parts.map((part, i) => {
          if ('sum' in part) {
            return (
              <span key={i} className="report-formula-sum">
                <span className="report-formula-limit">{part.sum.over ?? ''}</span>
                <span className="report-formula-sigma">&#8721;</span>
                <span className="report-formula-limit">{part.sum.under}</span>
              </span>
            );
          }
          if ('frac' in part) {
            return (
              <span key={i} className="report-formula-frac">
                <span className="report-formula-num">{part.frac.num}</span>
                <span className="report-formula-den">{part.frac.den}</span>
              </span>
            );
          }
          return (
            <span key={i} className={part.italic ? 'report-formula-var' : undefined}>
              {part.text}
            </span>
          );
        })}
      </p>
      <dl className="report-formula-legend" aria-hidden="true">
        {formula.legend.map((entry) => (
          <div key={entry.symbol}>
            <dt>{entry.symbol}</dt>
            <dd>= {entry.meaning}</dd>
          </div>
        ))}
      </dl>
      {formula.number && (
        <span className="report-formula-number" aria-hidden="true">
          {formula.number}
        </span>
      )}
    </div>
  );
}

/**
 * Gridline spacing for a chart whose axis runs from zero to `max`: the 1, 2 or
 * 5 multiple of a power of ten that yields roughly four to eight gridlines.
 * Keeps tick labels round at any scale.
 */
function niceStep(max: number): number {
  const raw = max / 5;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const factor = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return factor * mag;
}

/**
 * Tick labels rounded to the step's own precision, so a fractional step does
 * not print floating-point noise (0.30000000000000004) on the axis.
 */
function formatTick(value: number, step: number): string {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  return value.toFixed(decimals);
}

/**
 * Scatter Plot 1, redrawn from the values embedded in the source document.
 * The document stores this as a live chart rather than a picture, so it is
 * plotted as SVG here: it stays sharp at any size, picks up the site's theme
 * colors, and keeps the numbers in the data file where they can be checked.
 * The series colors are the two site accents, distinguished by marker shape as
 * well as hue so the plot survives being read in grayscale or by someone who
 * cannot separate the two colors.
 */
function Chart({ chart }: { chart: ReportChart }) {
  const W = 460;
  const H = 300;
  const pad = { top: 12, right: 12, bottom: 46, left: 62 };
  const points = chart.series.flatMap((s) => s.points);
  const xs = points.map((p) => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  // Y starts at zero so a fall in the loss is read against its full magnitude,
  // not an exaggerated cropped baseline. The step is chosen from the range so
  // the same component serves both papers' very different loss scales
  // (thousands for K-Means, fractions of one for cross-entropy).
  const maxY = Math.max(...points.map((p) => p.y));
  const step = niceStep(maxY);
  const top = Math.ceil(maxY / step) * step;
  const px = (x: number) => pad.left + ((x - minX) / (maxX - minX)) * (W - pad.left - pad.right);
  const py = (y: number) => H - pad.bottom - (y / top) * (H - pad.top - pad.bottom);

  const yTicks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const dense = Math.max(...chart.series.map((s) => s.points.length)) > 12;
  const xTicks = chart.xTickStep
    ? Array.from(
        { length: Math.floor((maxX - minX) / chart.xTickStep) + 1 },
        (_, i) => minX + i * chart.xTickStep!,
      )
    : xs.filter((x, i) => xs.indexOf(x) === i);

  return (
    <figure className={`report-chart${dense ? ' report-chart-dense' : ''}`}>
      <figcaption>
        <span className="report-table-label">{chart.label}</span>
        {chart.caption}
      </figcaption>
      <svg
        className="report-chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${chart.caption}. ${chart.description}`}
      >
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={pad.left}
              y1={py(t)}
              x2={W - pad.right}
              y2={py(t)}
              className="report-chart-grid"
            />
            <text x={pad.left - 8} y={py(t)} className="report-chart-tick" textAnchor="end" dominantBaseline="middle">
              {formatTick(t, step)}
            </text>
          </g>
        ))}
        {xTicks.map((x) => (
          <text key={x} x={px(x)} y={H - pad.bottom + 18} className="report-chart-tick" textAnchor="middle">
            {x}
          </text>
        ))}

        {chart.series.map((s, si) => (
          <g key={s.name} className={`report-chart-series report-chart-series-${si + 1}`}>
            <polyline fill="none" points={s.points.map((p) => `${px(p.x)},${py(p.y)}`).join(' ')} />
            {/* Markers help read a handful of points but turn a long run into
                a smear, so a dense series is drawn as a bare line. */}
            {!dense &&
              s.points.map((p) =>
                si === 0 ? (
                  <circle key={p.x} cx={px(p.x)} cy={py(p.y)} r={3.4} />
                ) : (
                  <rect key={p.x} x={px(p.x) - 3} y={py(p.y) - 3} width={6} height={6} />
                ),
              )}
          </g>
        ))}

        <text
          x={pad.left + (W - pad.left - pad.right) / 2}
          y={H - 6}
          className="report-chart-axis"
          textAnchor="middle"
        >
          {chart.axisLabels.x}
        </text>
        <text
          transform={`translate(14 ${pad.top + (H - pad.top - pad.bottom) / 2}) rotate(-90)`}
          className="report-chart-axis"
          textAnchor="middle"
        >
          {chart.axisLabels.y}
        </text>
      </svg>
      <p className="report-chart-key" aria-hidden="true">
        {chart.series.map((s, si) => (
          <span
            key={s.name}
            className={`report-chart-series-${si + 1} report-chart-key-${si + 1}`}
          >
            <span className="report-chart-swatch" />
            {s.name}
          </span>
        ))}
      </p>
    </figure>
  );
}

function Section({ paperId, section }: { paperId: string; section: ReportSection }) {
  const id = sectionId(paperId, section);
  const label = section.label ? `${section.label}. ` : '';
  const Heading = section.level === 3 ? 'h4' : 'h3';
  const className = section.level === 3 ? 'report-subheading' : 'report-heading';
  const figures = section.figures ?? [];
  const formulas = section.formulas ?? [];
  const charts = section.charts ?? [];
  /** Figures and equations placed before the section's first paragraph. */
  const leading = figures.filter((f) => f.afterParagraph < 0);
  const leadingFormulas = formulas.filter((f) => f.afterParagraph < 0);

  return (
    <>
      <Heading id={id} className={className}>
        {label}
        {section.heading}
      </Heading>
      {leading.map((f) => (
        <FigureTable key={f.label + f.cells[0].src} table={f} />
      ))}
      {leadingFormulas.map((f) => (
        <Formula key={f.speech} formula={f} />
      ))}
      {section.paragraphs.map((p, i) => (
        <Fragment key={p.slice(0, 40)}>
          <p>
            {linkifyCitations(p, paperId).map((part, j) =>
              part.refNumber ? (
                <a
                  key={j}
                  href={`#${referenceId(paperId, part.refNumber)}`}
                  className="report-citation"
                  onClick={() => flashReference(referenceId(paperId, part.refNumber))}
                >
                  {part.text}
                </a>
              ) : (
                part.text
              ),
            )}
          </p>
          {formulas
            .filter((f) => f.afterParagraph === i)
            .map((f) => (
              <Formula key={f.speech} formula={f} />
            ))}
          {figures
            .filter((f) => f.afterParagraph === i)
            .map((f) => (
              <FigureTable key={f.label + f.cells[0].src} table={f} />
            ))}
          {charts
            .filter((c) => c.afterParagraph === i)
            .map((c) => (
              <Chart key={c.label} chart={c} />
            ))}
        </Fragment>
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
        <p className="report-affiliation report-email">{portfolioMeta.email}</p>
        <p className="report-course">
          <Link to={courseHref(paper.courseCode)}>
            {paper.courseCode} — {paper.course}
          </Link>
        </p>
      </header>

      {paper.abstract && (
        <p id={`${paper.id}-abstract`} className="report-abstract">
          <em>Abstract</em>—{paper.abstract}
        </p>
      )}

      <div className="report-columns">
        {paper.sections.map((s) => (
          <Section key={sectionId(paper.id, s)} paperId={paper.id} section={s} />
        ))}

        <h3 id={`${paper.id}-references`} className="report-heading">
          References
        </h3>
        <ol className="report-references">
          {paper.references.map((r, i) => (
            <li key={r.slice(0, 40)} id={referenceId(paper.id, i + 1)}>
              {linkifyReference(r).map((part, i) =>
                part.href ? (
                  <a key={i} href={part.href} target="_blank" rel="noreferrer">
                    {part.text}
                  </a>
                ) : (
                  part.text
                ),
              )}
            </li>
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
          <p className="report-affiliation report-email">{portfolioMeta.email}</p>
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

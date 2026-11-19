import { useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { bachelorsDegree, mastersDegree } from '../data/education';
import { demoHref, demoIdForCourse } from '../data/projects';
import { hasPaperForCourse } from '../data/mcsPortfolio';
import { isCertificateCourse } from '../data/bigDataCertificate';
import { AsuLogo } from '../components/AsuLogo';
import { ArticleReader } from '../components/ArticleReader';
import { LearningMcsPortfolioArticle } from '../components/LearningMcsPortfolioArticle';
import '../components/AsuLogo.css';
import '../components/ExpandableEmbed.css';

function CourseCard({ course, onOpenPortfolio }: { course: (typeof mastersDegree.courses)[0]; onOpenPortfolio: () => void }) {
  const demoId = demoIdForCourse(course.code);
  const hasPaper = hasPaperForCourse(course.code);
  const certificateCourse = isCertificateCourse(course.code);

  return (
    <article
      id={`course-${course.code.toLowerCase().replace(/\s+/g, '-')}`}
      className={`card course-card ${course.portfolioFeatured ? 'featured' : ''}`}
    >
      <div className="course-summary-main">
        <div className="course-top">
          <span className="tag">{course.code}</span>
          <span className="course-term">{course.term}</span>
        </div>
        <h4>{course.title}</h4>
      </div>
      <ul>
        {course.bullets.map((b) => (
          <li key={b.slice(0, 30)}>{b}</li>
        ))}
      </ul>
      {(demoId || hasPaper || certificateCourse) && (
        <p className="course-actions">
          {demoId && (
            <Link to={demoHref(demoId)} className="btn btn-primary">Try Demo</Link>
          )}
          {hasPaper && (
            <button type="button" onClick={onOpenPortfolio} className="btn btn-portfolio">MCS Portfolio</button>
          )}
          {certificateCourse && (
            <Link
              to="/learning#big-data-cert"
              className="btn btn-certificate"
              /* Shortened from "Big Data Certificate" so CSE 575's three
                 pills stay on one row in the narrowest grid column. */
              aria-label="Big Data Certificate"
            >
              Big Data Cert
            </Link>
          )}
        </p>
      )}
    </article>
  );
}

function DegreeHeader({ degree }: { degree: typeof mastersDegree }) {
  return (
    <div className="card degree-header">
      <div className="degree-header-row">
        <AsuLogo size="md" />
        <div className="degree-header-text">
          <h2>{degree.degree}</h2>
          <p>{degree.school}</p>
          <div className="degree-meta">
            <span>Conferred {degree.conferred}</span>
            {degree.gpa && <span>GPA {degree.gpa}</span>}
            {degree.honors && <span>{degree.honors}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function DegreeCourses({
  degree,
  heading,
  onOpenPortfolio,
}: {
  degree: typeof mastersDegree;
  heading: string;
  onOpenPortfolio: () => void;
}) {
  return (
    <>
      <h3 className="courses-heading">{heading}</h3>
      <div className="courses-grid">
        {degree.courses.map((c) => (
          <CourseCard key={c.code} course={c} onOpenPortfolio={onOpenPortfolio} />
        ))}
      </div>
    </>
  );
}

/**
 * Course links elsewhere in the site are router Links, so arriving at
 * /education#course-cse-571 never triggers the browser's native anchor jump.
 * Scroll to the target ourselves, then flash its border so the card is
 * findable in a dense grid.
 */
function useCourseHashTarget() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (!(el instanceof HTMLElement)) return;

    const jump = (behavior: ScrollBehavior) => el.scrollIntoView({ behavior, block: 'start' });

    // Wait a frame so layout has settled before measuring the scroll target.
    const raf = requestAnimationFrame(() => {
      jump(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
      // Restart the animation even if the same hash is clicked twice.
      el.classList.remove('course-card-flash');
      void el.offsetWidth;
      el.classList.add('course-card-flash');
    });
    // Each degree is a full-viewport sheet, so a webfont swap after that jump
    // (fonts load with display: swap) reflows every sheet's height and throws
    // off the scroll above; correct it once fonts have settled.
    document.fonts?.ready.then(() => jump('auto'));

    const clear = window.setTimeout(() => el.classList.remove('course-card-flash'), 3000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(clear);
      el.classList.remove('course-card-flash');
    };
  }, [hash]);
}

const SHEETS = ['dots', 'ruled', 'hatched', 'graph'] as const;

export function EducationPage() {
  useCourseHashTarget();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const portfolioOpen = hash === '#mcs-portfolio';

  const openPortfolio = useCallback(() => {
    navigate({ hash: '#mcs-portfolio' });
  }, [navigate]);

  const closePortfolio = useCallback(() => {
    navigate({ hash: '' }, { replace: false });
  }, [navigate]);

  return (
    <div className="nb-page education-page">
      <section id="masters" className="nb-sheet" data-sheet={SHEETS[0]}>
        <div className="page-header page-content container">
          <p className="section-label">Academics</p>
          <h1>Education</h1>
          <p className="page-lead">Graduate and undergraduate degrees from Arizona State University.</p>
          {/* Mirrors the side rail's "related" pills so these stay reachable
              on mobile, where the rail is hidden. */}
          <div className="education-related">
            <button type="button" onClick={openPortfolio} className="side-rail-pill">
              <span className="side-rail-pill-label">MCS Portfolio</span>
            </button>
            <Link to="/learning#big-data-cert" className="side-rail-pill">
              <span className="side-rail-pill-label">Big Data Certificate</span>
            </Link>
          </div>
        </div>
        <div className="page-content container degree-block">
          <DegreeHeader degree={mastersDegree} />
          <DegreeCourses degree={mastersDegree} heading="Graduate Courses" onOpenPortfolio={openPortfolio} />
        </div>
      </section>

      <section id="bachelors" className="nb-sheet" data-sheet={SHEETS[1]}>
        <div className="page-content container degree-block">
          <DegreeHeader degree={bachelorsDegree} />
          <DegreeCourses degree={bachelorsDegree} heading="Relevant Coursework" onOpenPortfolio={openPortfolio} />
        </div>
      </section>

      {portfolioOpen && (
        <ArticleReader label="MCS Portfolio" onClose={closePortfolio}>
          <LearningMcsPortfolioArticle />
        </ArticleReader>
      )}
    </div>
  );
}

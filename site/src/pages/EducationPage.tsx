import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { bachelorsDegree, mastersDegree } from '../data/education';
import { demoHref, demoIdForCourse } from '../data/projects';
import { paperHrefForCourse } from '../data/mcsPortfolio';
import { isCertificateCourse } from '../data/bigDataCertificate';
import { AsuLogo } from '../components/AsuLogo';
import '../components/AsuLogo.css';
import '../components/ExpandableEmbed.css';

function CourseCard({ course }: { course: (typeof mastersDegree.courses)[0] }) {
  const demoId = demoIdForCourse(course.code);
  const paperHref = paperHrefForCourse(course.code);
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
      {(demoId || paperHref || certificateCourse) && (
        <p className="course-actions">
          {demoId && (
            <Link to={demoHref(demoId)} className="btn btn-primary">Try Demo</Link>
          )}
          {paperHref && (
            <Link to={paperHref} className="btn btn-portfolio">MCS Portfolio</Link>
          )}
          {certificateCourse && (
            <Link
              to="/education/big-data"
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

function DegreeCourses({ degree, heading }: { degree: typeof mastersDegree; heading: string }) {
  return (
    <>
      <h3 className="courses-heading">{heading}</h3>
      <div className="courses-grid">
        {degree.courses.map((c) => (
          <CourseCard key={c.code} course={c} />
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

    // Wait a frame so layout has settled before measuring the scroll target.
    const raf = requestAnimationFrame(() => {
      el.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      });
      // Restart the animation even if the same hash is clicked twice.
      el.classList.remove('course-card-flash');
      void el.offsetWidth;
      el.classList.add('course-card-flash');
    });

    const clear = window.setTimeout(() => el.classList.remove('course-card-flash'), 3000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(clear);
      el.classList.remove('course-card-flash');
    };
  }, [hash]);
}

export function EducationPage() {
  useCourseHashTarget();

  return (
    <div className="page-header page-content container education-page">
      <p className="section-label">Academics</p>
      <h1>Education</h1>
      <p className="page-lead">Graduate and undergraduate degrees from Arizona State University.</p>

      <nav className="education-toc" aria-label="Education sections">
        <a href="#masters">Master&apos;s Degree</a>
        <a href="#bachelors">Bachelor&apos;s Degree</a>
      </nav>

      <section id="masters" className="degree-block">
        <DegreeHeader degree={mastersDegree} />
        <DegreeCourses degree={mastersDegree} heading="Graduate Courses" />
      </section>

      <section id="bachelors" className="degree-block">
        <DegreeHeader degree={bachelorsDegree} />
        <DegreeCourses degree={bachelorsDegree} heading="Relevant Coursework" />
      </section>
    </div>
  );
}

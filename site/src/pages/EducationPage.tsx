import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bachelorsDegree, mastersDegree } from '../data/education';
import { demoHref, demoIdForCourse } from '../data/projects';
import { paperHrefForCourse } from '../data/mcsPortfolio';
import { isCertificateCourse } from '../data/bigDataCertificate';
import { AsuLogo } from '../components/AsuLogo';
import { EducationHighlightStrip } from '../components/EducationHighlightStrip';
import { FeaturedCoursesCarousel } from '../components/FeaturedCoursesCarousel';
import '../components/AsuLogo.css';
import '../components/ExpandableEmbed.css';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

const educationHighlights = [
  { label: 'M.S. Computer Science', detail: 'Arizona State University · GPA 3.37 · July 2026' },
  { label: 'Graduate Certificate, Big Data', detail: 'Nine credit hours · exploratory analytics and scalable ML' },
  { label: 'B.S. Software Engineering', detail: 'Cum Laude · Dean\'s List · June 2024' },
  { label: 'MCS portfolio artifact', detail: 'PyTorch collision prediction and K-Means clustering analysis' },
];

function CourseCard({
  course,
  index,
}: {
  course: (typeof mastersDegree.courses)[0];
  index: number;
}) {
  const demoId = demoIdForCourse(course.code);
  const paperHref = paperHrefForCourse(course.code);
  const certificateCourse = isCertificateCourse(course.code);

  return (
    <motion.article
      id={`course-${course.code.toLowerCase().replace(/\s+/g, '-')}`}
      className={`card course-card ${course.portfolioFeatured ? 'featured' : ''}`}
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="course-summary-main">
        <div className="course-top">
          <span className="tag">{course.code}</span>
          <span className="course-term">{course.term}</span>
        </div>
        {course.portfolioFeatured && <span className="course-featured-pill">Portfolio project</span>}
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
              aria-label="Big Data Certificate"
            >
              Big Data Cert
            </Link>
          )}
        </p>
      )}
    </motion.article>
  );
}

function DegreeHeader({ degree, index }: { degree: typeof mastersDegree; index: number }) {
  return (
    <motion.div
      className="card degree-header edu-degree-header"
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
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
      {degree.certificate || degree.portfolio ? (
        <div className="edu-degree-links">
          {degree.certificate && (
            <Link to="/education/big-data" className="edu-degree-link">
              <span className="edu-degree-link-label">Certificate</span>
              <span>{degree.certificate.name}</span>
            </Link>
          )}
          {degree.portfolio && (
            <Link to="/education/mcs-portfolio" className="edu-degree-link">
              <span className="edu-degree-link-label">Portfolio report</span>
              <span>{degree.portfolio.title}</span>
            </Link>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}

function DegreeCourses({ degree, heading }: { degree: typeof mastersDegree; heading: string }) {
  return (
    <>
      <h3 className="courses-heading edu-courses-heading">{heading}</h3>
      <div className="courses-grid">
        {degree.courses.map((c, i) => (
          <CourseCard key={c.code} course={c} index={i} />
        ))}
      </div>
    </>
  );
}

/**
 * Course links elsewhere in the site are router Links, so arriving at
 * /education#course-cse-571 never triggers the browser's native anchor jump.
 */
function useCourseHashTarget() {
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

  const featuredCourses = mastersDegree.courses.filter((c) => c.portfolioFeatured);

  return (
    <div className="education-page-root">
      <div className="page-header page-content container education-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-label">Academics</p>
          <h1 className="text-gradient">Education</h1>
          <p className="page-lead">
            Graduate and undergraduate degrees from Arizona State University — coursework in machine learning,
            systems security, and software engineering built for production-minded roles.
          </p>
        </motion.div>

        <EducationHighlightStrip highlights={educationHighlights} />

        <FeaturedCoursesCarousel courses={featuredCourses} />

        <nav className="education-toc edu-toc" aria-label="Education sections">
          <a href="#masters">Master&apos;s Degree</a>
          <a href="#bachelors">Bachelor&apos;s Degree</a>
          <Link to="/education/mcs-portfolio">MCS Portfolio</Link>
          <Link to="/education/big-data">Big Data Certificate</Link>
        </nav>

        <section id="masters" className="degree-block edu-degree-block">
          <DegreeHeader degree={mastersDegree} index={0} />
          <DegreeCourses degree={mastersDegree} heading="Graduate Courses" />
        </section>

        <section id="bachelors" className="degree-block edu-degree-block">
          <DegreeHeader degree={bachelorsDegree} index={1} />
          <DegreeCourses degree={bachelorsDegree} heading="Relevant Coursework" />
        </section>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiAward, FiBarChart2, FiChevronDown, FiCpu, FiLayers, FiShield } from 'react-icons/fi';
import { AsuLogo } from '../components/AsuLogo';
import { isCertificateCourse } from '../data/bigDataCertificate';
import { bachelorsDegree, mastersDegree, type Course, type Degree } from '../data/education';
import { hasPaperForCourse } from '../data/mcsPortfolio';
import { courseHref, demoHref, projectHref, projects } from '../data/projects';
import { experiments } from '../data/explore';
import './EducationPage.css';

const coursework = [mastersDegree, bachelorsDegree].flatMap((degree) =>
  degree.courses.map((course) => ({ course, degree })),
);

const foundations = [
  {
    id: 'ai-ml', title: 'AI, Machine Learning & Data Mining', icon: FiCpu,
    summary: 'Artificial intelligence, statistical machine learning, data mining, and biocomputing.',
    courses: ['CSE 571', 'CSE 575', 'CSE 572', 'CSE 568'],
  },
  {
    id: 'security', title: 'Security & Cryptography', icon: FiShield,
    summary: 'Applied cryptography, software and network security, information assurance, and secure design.',
    courses: ['CSE 539', 'CSE 545', 'CSE 543', 'CSE 548', 'SER 335'],
  },
  {
    id: 'engineering', title: 'Software Engineering & Systems', icon: FiLayers,
    summary: 'Operating systems, distributed services, databases, programming languages, and Software Enterprise.',
    courses: ['SER 401/402', 'SER 334', 'SER 321', 'SER 322', 'CSE 340', 'CSE 240', 'SER 423', 'SER 316', 'SER 315', 'SER 216'],
  },
  {
    id: 'algorithms-visualization', title: 'Algorithms, Visualization & HCI', icon: FiBarChart2,
    summary: 'Algorithm design, data structures, visual communication, and usability testing.',
    courses: ['CSE 551', 'SER 222', 'CSE 578', 'SER 463'],
  },
];

const relatedCoursework: Record<string, { code: string; connection: string }[]> = {
  'CSE 539': [
    { code: 'CSE 548', connection: 'Connects cryptographic protocols to PKI and network defense.' },
    { code: 'CSE 543', connection: 'Places cryptography within defense in depth and security risk management.' },
    { code: 'SER 335', connection: 'Applies hashing concepts to password storage and secure software design.' },
  ],
  'CSE 575': [
    { code: 'CSE 572', connection: 'Extends the study of clustering and classification to larger datasets.' },
    { code: 'CSE 571', connection: 'Applies supervised learning to collision prediction in a robotics simulation.' },
    { code: 'CSE 578', connection: 'Uses visual exploration to make patterns in data easier to inspect and explain.' },
  ],
};

const reportHref = '/explore/mcs-portfolio';
const certificateHref = '/explore/big-data-cert';

function DegreeCard({ degree }: { degree: Degree }) {
  return (
    <article id={degree.id} className="portfolio-card education-degree" aria-labelledby={`${degree.id}-title`}>
      <header>
        <span className="education-school-mark" aria-hidden="true"><AsuLogo size="sm" /></span>
        <div>
          <h2 id={`${degree.id}-title`}>{degree.degree}</h2>
          <p>{degree.school}</p>
        </div>
      </header>
      <ul className="education-degree-meta">
        <li>Conferred <strong>{degree.conferred}</strong></li>
        {degree.gpa && <li>GPA <strong>{degree.gpa}</strong></li>}
      </ul>
      {degree.honors && <p className="education-honors">{degree.honors}</p>}
      {degree.certificate && (
        <Link id="big-data-cert" to={certificateHref} className="education-credential">
          <FiAward aria-hidden="true" />
          <span><strong>{degree.certificate.name}</strong><small>{degree.certificate.status}</small></span>
        </Link>
      )}
      {degree.portfolio && <Link className="education-inline-link" to={reportHref}>{degree.portfolio.title}</Link>}
    </article>
  );
}

function CourseEntry({ course, degree, hash }: { course: Course; degree: Degree; hash: string }) {
  const id = courseHref(course.code).split('#')[1];
  const relatedProjects = projects.filter((project) => project.courseCode === course.code && project.id !== 'mcs-mnist');
  const liveDemos = (['kmeans', 'robot-ml'] as const).filter((id) => experiments[id].course === course.code);
  const [overview, ...details] = course.bullets;
  const connections = relatedCoursework[course.code];

  return (
    <details className="education-course" id={id} data-target={hash === `#${id}` || undefined}>
      <summary>
        <span className="education-course-meta">{course.code} · {degree.id === 'masters' ? 'Master’s coursework' : 'Bachelor’s coursework'} · {course.term}</span>
        <strong>{course.title}</strong>
        <span className="education-course-overview">{overview}</span>
        <FiChevronDown aria-hidden="true" />
      </summary>
      <div className="education-course-details">
        <ul>
          {details.map((detail) => <li key={detail}>{detail}</li>)}
        </ul>
        <div className="education-course-links">
          {relatedProjects.map((project) => (
            <Link className="portfolio-pill" key={project.id} to={projectHref(project.id)}>Project · {project.title}</Link>
          ))}
          {liveDemos.map((id) => (
            <Link className="portfolio-pill" key={id} to={demoHref(id)}>Demo · {experiments[id].title}</Link>
          ))}
          {hasPaperForCourse(course.code) && <Link className="portfolio-pill" to={reportHref}>MCS Portfolio Report</Link>}
          {isCertificateCourse(course.code) && <Link className="portfolio-pill" to={certificateHref}>Big Data Certificate</Link>}
        </div>
        {connections && (
          <div className="education-connections">
            <h4>Related coursework</h4>
            <ul>
              {connections.map(({ code, connection }) => {
                const related = coursework.find((entry) => entry.course.code === code);
                return related && (
                  <li key={code}>
                    <Link className="education-inline-link" to={courseHref(code)}>{related.course.title}</Link>
                    <span>{connection}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}

export function EducationPage() {
  const { hash, key } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (hash === '#mcs-portfolio') {
      navigate(reportHref, { replace: true });
      return;
    }

    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    if (target instanceof HTMLDetailsElement) {
      target.open = true;
      target.querySelector('summary')?.focus({ preventScroll: true });
    } else if (target.hasAttribute('tabindex')) {
      target.focus({ preventScroll: true });
    }
    const frame = requestAnimationFrame(() => {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, key, navigate]);

  return (
    <div className="portfolio-content education-page">
      <header className="portfolio-section-intro">
        <p className="portfolio-eyebrow">Academic Background</p>
        <h1>Education</h1>
        <p className="portfolio-summary">Graduate and undergraduate studies in computer science, software engineering, and related technical disciplines.</p>
      </header>

      <div className="education-degrees">
        <DegreeCard degree={mastersDegree} />
        <DegreeCard degree={bachelorsDegree} />
      </div>

      <section className="education-section" aria-labelledby="foundations-title">
        <h2 id="foundations-title">Technical foundations</h2>
        <div className="education-foundations">
          {foundations.map(({ id, icon: Icon, title, summary }) => (
            <Link key={id} className="portfolio-card education-foundation" to={`#${id}`}>
              <Icon aria-hidden="true" />
              <span><strong>{title}</strong><span>{summary}</span></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="education-section" aria-labelledby="coursework-title">
        <h2 id="coursework-title">Coursework in depth</h2>
        {foundations.map(({ id, title, courses }) => (
          <section className="education-course-group" tabIndex={-1} id={id} key={id} aria-labelledby={`${id}-title`}>
            <h3 id={`${id}-title`}>{title}</h3>
            {courses.map((code) => {
              const entry = coursework.find(({ course }) => course.code === code);
              return entry && <CourseEntry key={code} {...entry} hash={hash} />;
            })}
          </section>
        ))}
      </section>
    </div>
  );
}

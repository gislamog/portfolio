import { bachelorsDegree, mastersDegree } from '../data/education';
import { ExpandableEmbed } from '../components/ExpandableEmbed';
import { AsuLogo } from '../components/AsuLogo';
import '../components/AsuLogo.css';
import '../components/ExpandableEmbed.css';

function CourseCard({ course }: { course: (typeof mastersDegree.courses)[0] }) {
  return (
    <details className={`card course-card ${course.portfolioFeatured ? 'featured' : ''}`}>
      <summary>
        <div className="course-summary-main">
          <div className="course-top">
            <div className="course-tags">
              <span className="tag">{course.code}</span>
              {course.portfolioFeatured && (
                <span className="portfolio-badge" title="Featured in MCS Portfolio Report">MCS Portfolio</span>
              )}
            </div>
            <span className="course-term">{course.term}</span>
          </div>
          <h4>{course.title}</h4>
        </div>
          <span className="course-expand" aria-hidden>
            <span className="course-expand-label" />
            <span className="course-chevron">▾</span>
          </span>
      </summary>
      <ul>
        {course.bullets.map((b) => (
          <li key={b.slice(0, 30)}>{b}</li>
        ))}
      </ul>
    </details>
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

export function EducationPage() {
  return (
    <div className="page-header page-content container">
      <p className="section-label">Academics</p>
      <h1>Education</h1>
      <p className="page-lead">Graduate and undergraduate degrees from Arizona State University. Expand a course for details.</p>

      <nav className="education-toc" aria-label="Education sections">
        <a href="#masters">Master&apos;s Degree</a>
        <a href="#big-data-cert">Big Data Certificate</a>
        <a href="#mcs-portfolio">MCS Portfolio Report</a>
        <a href="#bachelors">Bachelor&apos;s Degree</a>
      </nav>

      <section id="masters" className="degree-block">
        <DegreeHeader degree={mastersDegree} />
        <DegreeCourses degree={mastersDegree} heading="Graduate Courses" />
        <p className="portfolio-legend"><span className="portfolio-badge">MCS Portfolio</span> = featured in MCS Portfolio Report</p>
      </section>

      {mastersDegree.certificate && (
        <section id="big-data-cert" className="degree-block">
          <ExpandableEmbed
            title={mastersDegree.certificate.name}
            description={mastersDegree.certificate.status}
          >
            <iframe
              title="Big Data Professional Certificate"
              src={mastersDegree.certificate.pdfUrl}
              className="embed-pdf"
            />
          </ExpandableEmbed>
        </section>
      )}

      {mastersDegree.portfolio && (
        <section id="mcs-portfolio" className="degree-block">
          <ExpandableEmbed
            title={mastersDegree.portfolio.title}
            description={mastersDegree.portfolio.description}
          >
            <iframe
              title="MCS Portfolio Report"
              src={mastersDegree.portfolio.pdfUrl}
              className="embed-pdf"
            />
          </ExpandableEmbed>
        </section>
      )}

      <section id="bachelors" className="degree-block">
        <DegreeHeader degree={bachelorsDegree} />
        <DegreeCourses degree={bachelorsDegree} heading="Relevant Coursework" />
      </section>
    </div>
  );
}

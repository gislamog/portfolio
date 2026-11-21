import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiActivity, FiBarChart2, FiBookOpen, FiBriefcase, FiCalendar, FiCheckCircle, FiArrowRight, FiCode, FiLayers, FiShoppingCart, FiTool } from 'react-icons/fi';
import { SiPosthog } from 'react-icons/si';
import { experience } from '../data/experience';
import { projectHref } from '../data/projects';
import { jobId } from '../data/rails';
import './ExperiencePage.css';

const [currentRole, ...pastRoles] = experience;

const metrics = [
  { icon: FiCode, value: '1,700+', label: 'Playwright tests' },
  { icon: FiCheckCircle, value: '78', label: 'E2E tests for Selectivity by Quintiles' },
  { icon: FiActivity, value: '14,875', label: 'Applications in the validation cohort' },
  { icon: FiBarChart2, value: '8', label: 'Analytics visualization refactors' },
];

const pastRoleIcons = [FiBriefcase, FiBookOpen, FiShoppingCart];

function WorkFlow({ label, steps }: { label: string; steps: string[] }) {
  return (
    <ol className="work-flow" aria-label={label}>
      {steps.map((step) => <li className="portfolio-pill" key={step}>{step}</li>)}
    </ol>
  );
}

function SelectedWork() {
  return (
    <section className="work-selected" aria-labelledby="work-selected-title">
      <h3 id="work-selected-title">Selected engineering work</h3>
      <div className="work-case-studies">
        <section>
          <h4><FiBarChart2 aria-hidden="true" /> Feature development and technical ownership</h4>
          <p>
            Led <strong>Selectivity by Quintiles</strong> from requirements through release, working with leadership,
            Product, and Support to define how the visualization would show applications, admissions,
            and enrollments by selectivity band and weighted GPA quintile.
          </p>
          <p>
            Built a <strong>custom chart</strong> to show stacked bars alongside academic ranges. Selectivity filters dim
            chart segments to preserve the full distribution, while active filters narrow the application
            rows in the detail table. Checking the design against source data uncovered <strong>two handoff errors</strong>
            before release.
          </p>
          <Link className="portfolio-pill work-project-link" to={projectHref('academic-quintiles')}>View the Selectivity by Quintiles project <FiArrowRight aria-hidden="true" /></Link>
        </section>
        <section>
          <h4><FiActivity aria-hidden="true" /> Production debugging across the stack</h4>
          <p>
            Used <strong className="work-inline-brand"><SiPosthog aria-hidden="true" />PostHog</strong> session replay and local reproduction to trace unexpected behavior through the UI,
            API, and database. Investigated rendering errors, incorrect type comparisons, and unintended
            data mutations. <strong>Fixed crashes</strong> caused by incomplete student data and used SQL to verify production deployments.
          </p>
        </section>
        <section>
          <h4><FiCheckCircle aria-hidden="true" /> Test automation and quality engineering</h4>
          <p>
            Built a Playwright suite of more than 1,700 tests. Isolated test data and separate sign-ins
            made multi-user workflows repeatable. Plan Sharing tests caught <strong>12 defects</strong> before release.
            For Selectivity by Quintiles, wrote 78 tests covering chart calculations, shared filters,
            expansion controls, and the detail table, and verified the visualization against a cohort of
            14,875 applications.
          </p>
          <WorkFlow label="End-to-end test flow" steps={['Prepare isolated test data', 'Sign in as the required role', 'Run the workflow', 'Verify outcomes']} />
        </section>
        <section>
          <h4><FiTool aria-hidden="true" /> Developer tooling for parallel branches</h4>
          <p>
            Built a <strong>Bash CLI</strong> that sets up parallel Git worktrees with their own local hostnames and ports.
            It generates reverse-proxy configuration and Docker bind mounts so multiple branches can run
            side by side.
          </p>
          <Link className="portfolio-pill work-project-link" to={projectHref('git-worktrees')}>View the Git worktree tooling project <FiArrowRight aria-hidden="true" /></Link>
        </section>
      </div>
    </section>
  );
}

const workPractices = [
  { title: 'Build', description: 'Turn product requirements into production features and resolve design decisions with the teams that use and support them.' },
  { title: 'Investigate', description: 'Reproduce unexpected behavior and trace it through application layers to find the root cause.' },
  { title: 'Design', description: 'Define how data, filters, and components interact, including how they handle edge cases.' },
  { title: 'Validate', description: 'Write automated tests and check behavior against realistic data before release.' },
];

function HowIWork() {
  return (
    <section className="work-practices" aria-labelledby="work-practices-title">
      <h2 id="work-practices-title">How I work</h2>
      <div className="work-practices-layout">
        <dl>
          {workPractices.map(({ title, description }) => (
            <div className="portfolio-card" key={title}>
              <dt>{title}</dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
        <div className="portfolio-card work-practices-diagram">
          <h3>Selectivity by Quintiles data flow</h3>
          <WorkFlow label="Selectivity by Quintiles data flow" steps={['Application cohort', 'Group by quintile and selectivity', 'Calculate distributions', 'Render interactive charts and detail rows']} />
        </div>
      </div>
    </section>
  );
}

function JobMeta({ period, location }: { period: string; location: string }) {
  return (
    <p className="work-meta">
      <FiCalendar aria-hidden="true" />
      {period.replace(' to ', '–')} · {location}
    </p>
  );
}

export function ExperiencePage() {
  const { hash } = useLocation();

  useEffect(() => {
    const target = document.getElementById(hash.slice(1));
    if (!target) return;

    let active = true;
    const jump = () => {
      if (active) target.scrollIntoView({ behavior: 'instant', block: 'center' });
    };
    const frame = requestAnimationFrame(jump);
    void document.fonts.ready.then(jump);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [hash]);

  const currentId = jobId(currentRole);
  return (
    <div className="portfolio-content work-page">
      <header className="portfolio-section-intro">
        <p className="portfolio-eyebrow">Professional Experience</p>
        <h1>Work Experience</h1>
        <p className="portfolio-summary">Production software development, analytics, automated testing, and technical problem-solving across the application stack.</p>
      </header>

      <article className="portfolio-card work-current" id={currentId} aria-labelledby={`${currentId}-title`}>
        <header className="work-role">
          <span className="work-role-icon"><FiLayers aria-hidden="true" /></span>
          <div>
            <p className="work-company">{currentRole.company}</p>
            <h2 id={`${currentId}-title`}>{currentRole.title}</h2>
            <JobMeta period="March 2025 to Present" location={currentRole.location} />
            <p className="work-overview">I build features for CK360 analytics, lead visualization work from requirements through release, investigate issues across the frontend, API, and database, and write automated tests to catch regressions.</p>
          </div>
        </header>

        <ul className="work-metrics" aria-label="Engineering outcomes">
          {metrics.map(({ icon: Icon, value, label }) => (
            <li key={label}>
              <Icon aria-hidden="true" />
              <div><strong>{value}</strong><span>{label}</span></div>
            </li>
          ))}
        </ul>

        <SelectedWork />
      </article>

      <ol className="work-history" aria-label="Earlier roles">
        {pastRoles.map((job, index) => {
          const id = jobId(job);
          const Icon = pastRoleIcons[index];
          return (
            <li key={id}>
              <article className="portfolio-card work-previous" id={id} aria-labelledby={`${id}-title`}>
                <header className="work-role">
                  <span className="work-role-icon"><Icon aria-hidden="true" /></span>
                  <div>
                    <h2 id={`${id}-title`}>{job.company}</h2>
                    <p className="work-position">{job.title}</p>
                    <JobMeta period={job.period} location={job.location} />
                  </div>
                </header>
                <ul className="work-history-highlights">
                  {job.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                </ul>
              </article>
            </li>
          );
        })}
      </ol>
      <HowIWork />
    </div>
  );
}

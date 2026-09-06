import { Link } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  FiCode,
  FiCpu,
  FiDatabase,
  FiShield,
} from 'react-icons/fi';
import { profile } from '../data/profile';
import { projectHref, projects } from '../data/projects';
import { BioSummary } from '../components/BioSummary';
import { SocialLinks } from '../components/SocialLinks';
import { AsuLogo } from '../components/AsuLogo';
import { ProjectVisual, projectIcon } from '../components/ProjectVisual';
import { WorldStage } from '../components/WorldStage';
import { HOME_SECTIONS } from './homeStructure';
import './HomePage.css';

const skillIcons: Record<string, IconType> = {
  'Languages & Frameworks': FiCode,
  'AI & Development': FiCpu,
  'Data & ML': FiDatabase,
  'Security & CS': FiShield,
};

export function HomePage() {
  const featured = projects.slice(0, 3);
  const [firstName, ...restName] = profile.name.split(' ');
  const lastName = restName.join(' ');

  return (
    <div className="home-world">
      <WorldStage>
        <section
          className="world"
          aria-label="Title scene"
          data-section={HOME_SECTIONS[0]}
        >
          <p className="world-kicker">{profile.title}</p>
          <h1 className="world-title">
            <span className="world-first">{firstName}</span>
            <span className="world-last">{lastName}</span>
          </h1>
          <img
            className="world-island"
            src={`${import.meta.env.BASE_URL}images/world-island.webp`}
            alt=""
          />
          <nav className="world-menu" aria-label="Start">
            <Link to="/projects" className="btn btn-primary">View Projects</Link>
            <Link to="/experience" className="btn btn-ghost">Work</Link>
            <Link to="/demos" className="btn btn-ghost">Demos</Link>
          </nav>
        </section>

        <div className="sky-intro" data-section-group="intro">
          <section
            className="section intro-band"
            aria-label="Credentials and introduction"
          >
            <div className="container intro-stack">
              <div
                className="cred-row"
                data-section={HOME_SECTIONS[1]}
              >
                <div className="cred-asu">
                  <AsuLogo size="sm" />
                  <span>Arizona State University</span>
                </div>
                <div className="cred-panels" role="list">
                  {profile.credentials.map((cred) => (
                    <div key={cred.label} className="stat lands-plaque" role="listitem">
                      <strong>{cred.label}</strong>
                      <span>{cred.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="intro-bio lands-plaque"
                data-section={HOME_SECTIONS[2]}
              >
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="profile-photo"
                />
                <div>
                  <p className="hero-summary"><BioSummary /></p>
                  <SocialLinks />
                </div>
              </div>

              <section
                className="tech-focus"
                aria-labelledby="tech-focus-heading"
                data-section={HOME_SECTIONS[3]}
              >
                <p className="section-label">Skills</p>
                <h2 id="tech-focus-heading">Technical focus</h2>
                <div className="lands-skill-grid">
                  {profile.skills.map(([category, items]) => {
                    const Icon = skillIcons[category];
                    return (
                      <article key={category} className="lands-skill">
                        <div className="skill-card-head">
                          {Icon && <span className="skill-icon"><Icon /></span>}
                          <h3>{category}</h3>
                        </div>
                        <ul>{items.map((s) => <li key={s}>{s}</li>)}</ul>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          </section>
        </div>
      </WorldStage>

      <div className="clouds-stage">
        <img
          className="lands-sky"
          src={`${import.meta.env.BASE_URL}images/world-cloudsea.jpg`}
          alt=""
        />
        <div className="lands-drift" aria-hidden />
        <div className="lands-motes" aria-hidden />

        <section
          className="section featured-band"
          aria-labelledby="featured-heading"
          data-section={HOME_SECTIONS[4]}
        >
          <div className="container lands-features-head">
            <p className="section-label">Selected work</p>
            <h2 id="featured-heading">Featured projects</h2>
          </div>
          <div className="lands-features">
            {featured.map((p, i) => {
              const Icon = projectIcon(p.id);
              return (
                <Link
                  key={p.id}
                  to={projectHref(p.id)}
                  className={`lands-feature${i % 2 ? ' is-flip' : ''}`}
                >
                  <div className="lands-feature-art">
                    <ProjectVisual project={p} Icon={Icon} />
                  </div>
                  <div className="lands-feature-copy">
                    <div>{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

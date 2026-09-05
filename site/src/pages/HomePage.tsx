import { Link } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  SiJavascript,
  SiPython,
  SiReact,
  SiNuxt,
  SiVuedotjs,
  SiPytorch,
} from 'react-icons/si';
import { VscBeaker } from 'react-icons/vsc';
import {
  FiBriefcase,
  FiBookOpen,
  FiLayers,
  FiPlayCircle,
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
import './HomePage.css';

const techIcons: Record<(typeof profile.tech)[number], IconType> = {
  JavaScript: SiJavascript,
  Python: SiPython,
  React: SiReact,
  Nuxt: SiNuxt,
  Playwright: VscBeaker,
  Vue: SiVuedotjs,
  PyTorch: SiPytorch,
};

const skillIcons: Record<string, IconType> = {
  'Languages & Frameworks': FiCode,
  'AI & Development': FiCpu,
  'Data & ML': FiDatabase,
  'Security & CS': FiShield,
};

const explore = [
  { to: '/experience', title: 'Work', desc: 'Development, automated testing, and quality assurance on production EdTech software and a software internship.', icon: FiBriefcase },
  { to: '/projects', title: 'Projects', desc: 'Healthcare capstone, analytics platform work, and ML portfolio pieces.', icon: FiLayers },
  { to: '/demos', title: 'Demos', desc: 'K-Means, crypto, income viz, robot ML, matching, lexer, and more.', icon: FiPlayCircle },
  { to: '/education', title: 'Education', desc: 'M.S. Computer Science and B.S. Software Engineering at ASU.', icon: FiBookOpen },
];

export function HomePage() {
  const featured = projects.slice(0, 3);
  const [firstName, ...restName] = profile.name.split(' ');
  const lastName = restName.join(' ');

  return (
    <div className="home-world">
      <WorldStage>
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
      </WorldStage>

      <div className="lands">
        <img
          className="lands-sky"
          src={`${import.meta.env.BASE_URL}images/world-cloudsea.jpg`}
          alt=""
        />
        <div className="lands-drift" aria-hidden />
        <img
          className="lands-islets is-left"
          src={`${import.meta.env.BASE_URL}images/world-islets.webp`}
          alt=""
        />
        <img
          className="lands-islets is-right"
          src={`${import.meta.env.BASE_URL}images/world-islets.webp`}
          alt=""
        />
        <div className="lands-motes" aria-hidden />

        <section className="section intro-band">
          <div className="container intro-layout lands-plaque">
            <img src={profile.photoUrl} alt={profile.name} className="profile-photo" />
            <div>
              <div className="hero-asu">
                <AsuLogo size="sm" />
                <span>Arizona State University</span>
              </div>
              <p className="hero-summary"><BioSummary /></p>
              <SocialLinks />
              <div className="tech-row" aria-label="Technical stack">
                {profile.tech.map((name) => {
                  const Icon = techIcons[name];
                  return (
                    <span key={name} className="tech-chip">
                      <Icon className="tech-chip-icon" />
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="hero-stats">
              {profile.credentials.map((cred) => (
                <div key={cred.label} className="stat">
                  <strong>{cred.label}</strong>
                  <span>{cred.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lands-vista" aria-labelledby="featured-heading">
          <img
            className="lands-vista-img"
            src={`${import.meta.env.BASE_URL}images/world-vista.jpg`}
            alt=""
          />
          <div className="lands-vista-copy">
            <p className="section-label">Selected work</p>
            <h2 id="featured-heading">Featured projects</h2>
          </div>
        </section>

        <section className="lands-features">
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
        </section>

        <section className="section">
          <div className="container">
            <p className="section-label">Skills</p>
            <h2>Technical focus</h2>
          </div>
          <div className="lands-skill-river" aria-label="Technical focus">
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

        <section className="section">
          <div className="container">
            <p className="section-label">Explore</p>
            <h2>On this site</h2>
            <div className="lands-explore">
              {explore.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to} className="lands-explore-card">
                    <span className="explore-icon"><Icon /></span>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

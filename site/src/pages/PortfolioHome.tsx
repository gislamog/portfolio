import { FaGithub, FaLinkedin, FaRegEnvelope, FaRegHandshake } from 'react-icons/fa6';
import { profile } from '../data/profile';
import './PortfolioHome.css';

const contacts = [
  { label: 'GitHub', href: profile.github, icon: FaGithub },
  { label: 'LinkedIn', href: profile.linkedin, icon: FaLinkedin },
  { label: 'Email', href: `mailto:${profile.email}`, icon: FaRegEnvelope },
  { label: 'Handshake', href: profile.handshake, icon: FaRegHandshake },
];

export function PortfolioHome() {
  return (
    <section className="portfolio-intro" aria-labelledby="portfolio-title">
      <p className="portfolio-role">Software Engineer</p>
      <h1 id="portfolio-title">{profile.name}</h1>
      <p className="portfolio-summary">
        I build web applications and explore machine learning and data visualization.
        This portfolio brings together my projects, experiments, and what I’m learning along the way.
      </p>
      <ul className="portfolio-tech" aria-label="Technologies">
        {profile.tech.map((technology) => <li key={technology}>{technology}</li>)}
      </ul>
      <ul className="portfolio-contacts" aria-label="Contact and profiles">
        {contacts.map(({ label, href, icon: Icon }) => (
          <li key={label}>
            <a href={href}>
              <span className="portfolio-contact-icon" aria-hidden="true">
                <Icon focusable="false" />
              </span>
              <span className="portfolio-contact-label">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

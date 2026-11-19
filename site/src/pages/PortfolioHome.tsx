import { profile } from '../data/profile';
import './PortfolioHome.css';

const contacts = [
  { label: 'GitHub', href: profile.github },
  { label: 'LinkedIn', href: profile.linkedin },
  { label: 'Email', href: `mailto:${profile.email}` },
  { label: 'Handshake', href: profile.handshake },
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
        {contacts.map(({ label, href }) => (
          <li key={label}><a href={href}>{label}</a></li>
        ))}
      </ul>
    </section>
  );
}

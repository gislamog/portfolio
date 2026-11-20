import { FaGithub, FaLinkedin, FaRegEnvelope, FaRegHandshake } from 'react-icons/fa6';
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { TechnologyIcon } from '../components/technologyIcons';
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
      <h1 id="portfolio-title">Gulsum<br />Islamoglu</h1>
      <p className="portfolio-summary">
        I&apos;m a software engineer with a master&apos;s in Computer Science. I work on production web applications,
        from building features and visualizations to investigating bugs and improving test coverage.
        Outside of work, I like experimenting with machine learning, security, and whatever else catches my interest.
      </p>
      <div className="portfolio-actions">
        <Link className="portfolio-action portfolio-action-primary" to="/projects">
          See What I&apos;ve Built <FiArrowUpRight className="portfolio-action-arrow" aria-hidden="true" focusable="false" />
        </Link>
        <Link className="portfolio-action portfolio-action-secondary" to="/explore">
          Explore Ideas &amp; Experiments <FiArrowRight className="portfolio-action-arrow" aria-hidden="true" focusable="false" />
        </Link>
      </div>
      <ul className="portfolio-tech" aria-label="Technologies">
        {profile.tech.map((technology) => (
          <li key={technology} data-brand={technology}>
            <TechnologyIcon technology={technology} className="portfolio-tech-icon" />
            <span>{technology}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PortfolioFooter() {
  return (
    <footer className="portfolio-footer">
      <ul className="portfolio-contacts">
        {contacts.map(({ label, href, icon: Icon }) => (
          <li key={label}>
            <a href={href} aria-label={label}>
              <span className="portfolio-contact-icon" aria-hidden="true">
                <Icon focusable="false" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}

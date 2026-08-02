import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { profile } from '../data/profile';
import { BioSummary } from '../components/BioSummary';
import { SocialLinks } from '../components/SocialLinks';
import { AsuLogo } from '../components/AsuLogo';
import './HomePage.css';

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <motion.div className="hero-main" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="hero-profile">
              <img src={profile.photoUrl} alt={profile.name} className="profile-photo" />
              <div className="hero-intro">
                <p className="section-label">Software Developer</p>
                <h1>{profile.name}</h1>
                <div className="hero-asu">
                  <AsuLogo size="sm" />
                  <span>Arizona State University alum</span>
                </div>
                <SocialLinks />
              </div>
            </div>
            <p className="hero-summary"><BioSummary /></p>
            <div className="hero-actions">
              <Link to="/projects" className="btn btn-primary">View Projects</Link>
              <Link to="/demos" className="btn btn-ghost">Interactive Demos</Link>
              <Link to="/education" className="btn btn-ghost">Education</Link>
            </div>
          </motion.div>
          <motion.div className="hero-stats card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            {profile.credentials.map((cred) => (
              <div key={cred.label} className="stat">
                <strong>{cred.label}</strong>
                <span>{cred.detail}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="section-label">Skills</p>
          <h2>Technical Focus</h2>
          <div className="skills-grid">
            {profile.skills.map(([category, items]) => (
              <div key={category} className="card skill-card">
                <h3>{category}</h3>
                <ul>{items.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dim">
        <div className="container">
          <p className="section-label">Explore</p>
          <h2>What&apos;s on this site</h2>
          <div className="grid-2 explore-grid">
            {[
              { to: '/experience', title: 'Work Experience', desc: 'EdTech QA engineering, Simon Care internship, and ASU TA role.' },
              { to: '/education', title: 'Education', desc: '11 graduate courses, BS coursework, MCS portfolio, and Big Data certificate.' },
              { to: '/demos', title: 'Interactive Demos', desc: 'ML robot simulator, Sierpinski triangle, and ant sphere visualization.' },
              { to: '/learning', title: 'Continued Learning', desc: 'Books, articles, and research topics I am exploring.' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="card explore-card">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

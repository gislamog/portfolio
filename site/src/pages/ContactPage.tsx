import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub } from 'react-icons/fi';
import { SiHandshake } from 'react-icons/si';
import { profile } from '../data/profile';

const contacts = [
  { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, icon: FiMail },
  { label: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/\D/g, '')}`, icon: FiPhone },
  { label: 'LinkedIn', value: 'linkedin.com/in/gulsum-islamoglu8', href: profile.linkedin, icon: FiLinkedin },
  { label: 'GitHub', value: 'github.com/gislamog', href: profile.github, icon: FiGithub },
  { label: 'Handshake', value: 'ASU Handshake profile', href: profile.handshake, icon: SiHandshake },
  { label: 'Location', value: profile.location, href: undefined, icon: FiMapPin },
];

export function ContactPage() {
  return (
    <div className="page-header page-content container">
      <p className="section-label">Get in touch</p>
      <h1>Contact</h1>
      <p className="page-lead">Open to Software Engineer roles. Reach out via email or the links below.</p>

      <div className="grid-2 contact-grid">
        {contacts.map((item) => {
          const Icon = item.icon;
          const inner = (
            <>
              <span className="contact-icon"><Icon /></span>
              <div>
                <h3>{item.label}</h3>
                <p>{item.value}</p>
              </div>
            </>
          );
          return item.href ? (
            <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="card contact-card">
              {inner}
            </a>
          ) : (
            <div key={item.label} className="card contact-card contact-card-static">
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}

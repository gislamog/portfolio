import { profile } from '../data/profile';
import { SocialLinks } from '../components/SocialLinks';

export function ContactPage() {
  return (
    <div className="page-header page-content container">
      <p className="section-label">Get in touch</p>
      <h1>Contact</h1>
      <p className="page-lead">Open to Software Development roles. Reach out via email or the links below.</p>

      <div style={{ margin: '1.5rem 0' }}>
        <SocialLinks />
      </div>

      <div className="grid-2" style={{ marginTop: '1rem' }}>
        <div className="card">
          <h3>Email</h3>
          <p><a href={`mailto:${profile.email}`}>{profile.email}</a></p>
        </div>
        <div className="card">
          <h3>Phone</h3>
          <p>{profile.phone}</p>
        </div>
        <div className="card">
          <h3>LinkedIn</h3>
          <p><a href={profile.linkedin} target="_blank" rel="noreferrer">linkedin.com/in/gulsum-islamoglu8</a></p>
        </div>
        <div className="card">
          <h3>GitHub</h3>
          <p><a href={profile.github} target="_blank" rel="noreferrer">github.com/gislamog</a></p>
        </div>
        <div className="card">
          <h3>Handshake</h3>
          <p><a href={profile.handshake} target="_blank" rel="noreferrer">ASU Handshake Profile</a></p>
        </div>
        <div className="card">
          <h3>Location</h3>
          <p>{profile.location}</p>
        </div>
      </div>
    </div>
  );
}

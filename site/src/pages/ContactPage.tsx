import { useSearchParams } from 'react-router-dom';
import { FiMail, FiPhone } from 'react-icons/fi';
import { profile } from '../data/profile';
import { ContactForm } from '../components/ContactForm';
import './ContactPage.css';

const contactLinks = [
  { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, icon: FiMail },
  { label: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/\D/g, '')}`, icon: FiPhone },
];

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const initialMessage = searchParams.get('message') ?? undefined;

  return (
    <div id="contact-page" className="portfolio-content contact-page">
      <header className="portfolio-section-intro">
        <p className="portfolio-eyebrow">Get in touch</p>
        <h1>Contact</h1>
        <p className="portfolio-summary">Have a question, an opportunity, or something you’d like to discuss? Send me a message below.</p>
      </header>

      <div className="contact-columns">
        <ContactForm key={initialMessage} initialMessage={initialMessage} />
        <aside className="portfolio-card contact-profile" aria-label="Contact details">
          <header className="contact-profile-person">
            <img src={`${import.meta.env.BASE_URL}avatar-cat.jpg`} alt="" width={48} height={48} />
            <div>
              <h2>{profile.name}</h2>
              <p>{profile.title}</p>
            </div>
          </header>
          <address>
            {contactLinks.map(({ label, value, href, icon: Icon }) => (
              <a key={label} href={href}>
                <Icon aria-hidden="true" />
                <span><strong>{label}</strong><span>{value}</span></span>
              </a>
            ))}
          </address>
        </aside>
      </div>
    </div>
  );
}

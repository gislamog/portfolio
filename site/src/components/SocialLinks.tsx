import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { SiHandshake } from 'react-icons/si';
import { profile } from '../data/profile';
import './SocialLinks.css';

const links = [
  { href: profile.github, label: 'GitHub', icon: FaGithub },
  { href: profile.linkedin, label: 'LinkedIn', icon: FaLinkedin },
  { href: `mailto:${profile.email}`, label: 'Email', icon: FaEnvelope },
  { href: profile.handshake, label: 'Handshake', icon: SiHandshake },
];

interface SocialLinksProps {
  size?: 'sm' | 'md';
}

export function SocialLinks({ size = 'md' }: SocialLinksProps) {
  return (
    <div className={`social-links social-links-${size}`}>
      {links.map(({ href, label, icon: Icon }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
          <Icon aria-hidden />
        </a>
      ))}
    </div>
  );
}

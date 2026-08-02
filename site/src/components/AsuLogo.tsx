import { useState } from 'react';
import { profile } from '../data/profile';
import './AsuLogo.css';

interface AsuLogoProps {
  size?: 'sm' | 'md';
}

export function AsuLogo({ size = 'md' }: AsuLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className={`asu-fallback asu-fallback-${size}`}>ASU</span>;
  }

  return (
    <img
      src={profile.asuLogoUrl}
      alt="Arizona State University"
      className={`asu-logo asu-logo-${size}`}
      onError={() => setFailed(true)}
    />
  );
}

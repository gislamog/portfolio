import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { railFor } from '../data/rails';
import { SideRail } from './SideRail';
import { ScrollToTop } from './ScrollToTop';
import { CityScene } from '../pages/CityScene';
import { CityNav } from '../pages/CityNav';
import { PortfolioFooter } from '../pages/PortfolioHome';
import './Layout.css';

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const route = pathname.replace(/\/$/, '').toLowerCase() || '/';
  const isHome = route === '/';
  const isWork = route === '/experience';
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const rail = railFor(route);

  return (
    <div className={`app-shell portfolio-shell${isHome ? ' portfolio-home' : isWork ? ' portfolio-work' : ''}`}>
      <ScrollToTop target={viewport} />
      {isHome && <CityScene />}
      <CityNav animatedGlow={isHome} />
      <div className="app-body">
        {rail && <SideRail {...rail} scrollRoot={viewport} />}
        <div className="app-stage">
          <div ref={setViewport} className="app-viewport">
            <main>{children}</main>
            <PortfolioFooter />
          </div>
        </div>
      </div>
    </div>
  );
}

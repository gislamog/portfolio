import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * React Router keeps the previous scroll offset across route changes, so
 * navigating from halfway down Education to the Big Data page would land
 * mid-page. Reset to the top on every pathname change.
 *
 * Hash links are left alone: pages that target an anchor (Education course
 * cards, the report contents, the demos list) scroll to it themselves, and
 * jumping to the top first would fight that.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}

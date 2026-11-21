import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * React Router keeps the previous scroll offset across route changes, so
 * navigating from halfway down Education to the Big Data page would land
 * mid-page. Reset the page viewport to the top on every pathname change,
 * before paint, so the old offset never shows.
 *
 * Hash links are left alone: pages that target an anchor (Education course
 * cards, the report contents, the demos list) scroll to it themselves, and
 * jumping to the top first would fight that.
 */
export function ScrollToTop({ target }: { target: HTMLElement | null }) {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash || !target) return;
    target.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash, target]);

  return null;
}

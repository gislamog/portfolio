import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FLASH_CLASS = 'hash-flash';
const FLASH_MS = 2600;

function flash(el: HTMLElement) {
  el.classList.remove(FLASH_CLASS);
  // Force a reflow so the animation restarts even if the same target is
  // clicked twice in a row.
  void el.offsetWidth;
  el.classList.add(FLASH_CLASS);
  window.setTimeout(() => el.classList.remove(FLASH_CLASS), FLASH_MS);
}

function jumpTo(el: HTMLElement) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

/**
 * Shared hash-scroll-and-flash behavior: scrolling to an element id and
 * briefly highlighting it, for links that can't rely on the browser's native
 * same-document anchor jump (React Router Links, or any element that isn't
 * present/positioned yet on first paint). Consolidates the pattern that used
 * to be duplicated across EducationPage's useCourseHashTarget and
 * McsPortfolioPage's flashReference/useReportHashTarget.
 *
 * `scrollToLocationHash` handles the common case of a page whose own
 * location.hash should be scrolled-to-and-flashed on mount/hash change.
 * `flashHeading` is exposed for in-page jump links (e.g. a question link
 * that jumps to an answer heading further down the same article) that want
 * the flash without changing the URL hash.
 */
export function useHashScrollFlash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (!(el instanceof HTMLElement)) return;

    const raf = requestAnimationFrame(() => {
      jumpTo(el);
      flash(el);
    });
    // A webfont swap after that jump (fonts load with display: swap) can
    // reflow the page and throw off the scroll above; correct it once fonts
    // have settled.
    document.fonts?.ready.then(() => jumpTo(el));

    return () => cancelAnimationFrame(raf);
  }, [hash]);

  function flashHeading(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    jumpTo(el);
    flash(el);
  }

  return { flashHeading };
}

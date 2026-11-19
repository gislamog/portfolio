import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeId = 'a' | 'c';

const ThemeContext = createContext<{ theme: ThemeId; setTheme: (t: ThemeId) => void } | null>(null);

function readTheme(): ThemeId {
  const saved = localStorage.getItem('portfolio-theme');
  if (saved === 'c') return 'c';
  return 'a';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(readTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  const setTheme = (t: ThemeId) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isLight = theme === 'c';
  return (
    <button
      type="button"
      className={`theme-switch${isLight ? ' theme-switch-on' : ''}`}
      role="switch"
      aria-checked={isLight}
      aria-label="Toggle light theme"
      title={isLight ? 'Switch to dark' : 'Switch to light'}
      onClick={() => setTheme(isLight ? 'a' : 'c')}
    >
      <span className="theme-switch-track">
        <span className="theme-switch-thumb" aria-hidden />
        <svg className="theme-icon theme-icon-dark" viewBox="0 0 24 24" aria-hidden>
          <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z" />
        </svg>
        <svg className="theme-icon theme-icon-light" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
        </svg>
      </span>
    </button>
  );
}

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
      title={isLight ? 'Paper light' : 'Cool slate'}
      onClick={() => setTheme(isLight ? 'a' : 'c')}
    >
      <span className="theme-switch-track">
        <span className={`theme-swatch swatch-a`} aria-hidden />
        <span className={`theme-swatch swatch-c`} aria-hidden />
        <span className="theme-switch-thumb" aria-hidden />
      </span>
    </button>
  );
}

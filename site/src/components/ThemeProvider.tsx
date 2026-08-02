import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeId = 'a' | 'b';

const ThemeContext = createContext<{ theme: ThemeId; setTheme: (t: ThemeId) => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    return (localStorage.getItem('portfolio-theme') as ThemeId) || 'a';
  });

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
  return (
    <div className="theme-toggle" role="group" aria-label="Color theme">
      <button
        type="button"
        className={theme === 'a' ? 'active' : ''}
        onClick={() => setTheme('a')}
        title="Style A: Minimal dark"
      >
        A
      </button>
      <button
        type="button"
        className={theme === 'b' ? 'active' : ''}
        onClick={() => setTheme('b')}
        title="Style B: Warm vibrant"
      >
        B
      </button>
    </div>
  );
}

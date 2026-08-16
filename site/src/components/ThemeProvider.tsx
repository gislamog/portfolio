import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeId = 'a' | 'b' | 'c' | 'd' | 'e';

const THEMES: { id: ThemeId; title: string; swatch: string }[] = [
  { id: 'a', title: 'Cool slate', swatch: 'swatch-a' },
  { id: 'b', title: 'Warm dusk', swatch: 'swatch-b' },
  { id: 'c', title: 'Paper light', swatch: 'swatch-c' },
  { id: 'd', title: 'Sky light', swatch: 'swatch-d' },
  { id: 'e', title: 'Forest night', swatch: 'swatch-e' },
];

const ThemeContext = createContext<{ theme: ThemeId; setTheme: (t: ThemeId) => void } | null>(null);

function readTheme(): ThemeId {
  const saved = localStorage.getItem('portfolio-theme') as ThemeId | null;
  if (saved && THEMES.some((t) => t.id === saved)) return saved;
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
  return (
    <div className="theme-toggle" role="group" aria-label="Color theme">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          className={theme === t.id ? 'active' : ''}
          onClick={() => setTheme(t.id)}
          title={t.title}
          aria-label={t.title}
        >
          <span className={`theme-swatch ${t.swatch}`} />
        </button>
      ))}
    </div>
  );
}

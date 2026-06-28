"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type AccentTheme = "neutral" | "sky" | "moss" | "violet" | "rose" | "amber" | "sage";

const ACCENT_THEME_KEY = "accent-theme";

interface AccentThemeContextValue {
  accentTheme: AccentTheme;
  setAccentTheme: (theme: AccentTheme) => void;
}

const AccentThemeContext = createContext<AccentThemeContextValue>({
  accentTheme: "neutral",
  setAccentTheme: () => {},
});

export function useAccentTheme() {
  return useContext(AccentThemeContext);
}

export function AccentThemeProvider({ children }: { children: React.ReactNode }) {
  const [accentTheme, setAccentThemeState] = useState<AccentTheme>("neutral");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(ACCENT_THEME_KEY) as AccentTheme | null;
    if (stored && ["neutral", "sky", "moss", "violet", "rose", "amber", "sage"].includes(stored)) {
      setAccentThemeState(stored);
      document.documentElement.setAttribute("data-accent-theme", stored);
    }
  }, []);

  const setAccentTheme = useCallback((theme: AccentTheme) => {
    setAccentThemeState(theme);
    localStorage.setItem(ACCENT_THEME_KEY, theme);
    document.documentElement.setAttribute("data-accent-theme", theme);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <AccentThemeContext.Provider value={{ accentTheme, setAccentTheme }}>
      {children}
    </AccentThemeContext.Provider>
  );
}

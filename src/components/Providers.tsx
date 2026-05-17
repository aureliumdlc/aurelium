"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Dictionary, type Locale, dictionaries, getDict } from "@/lib/i18n";

type Theme = "dark" | "light";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dictionary;
} | null>(null);

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
} | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ru");
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale | null;
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedLocale && dictionaries[savedLocale]) setLocaleState(savedLocale);
    if (savedTheme) setThemeState(savedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("locale", locale);
    document.documentElement.lang = locale;
  }, [locale, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme, mounted]);

  const setLocale = (l: Locale) => setLocaleState(l);
  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <LocaleContext.Provider value={{ locale, setLocale, t: getDict(locale) }}>
        <div className={mounted ? "" : "opacity-0"}>{children}</div>
      </LocaleContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale outside Providers");
  return ctx;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme outside Providers");
  return ctx;
}


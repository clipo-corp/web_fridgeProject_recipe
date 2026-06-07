import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type ThemePref = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "fk-theme";

function readPref(): ThemePref {
  if (typeof window === "undefined") {
    return "system";
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolve(pref: ThemePref): ResolvedTheme {
  return pref === "system" ? systemTheme() : pref;
}

export function applyStoredTheme(): void {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.setAttribute("data-theme", resolve(readPref()));
}

type ThemeValue = {
  readonly pref: ThemePref;
  readonly resolved: ResolvedTheme;
  readonly setPref: (pref: ThemePref) => void;
  readonly toggle: () => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { readonly children: ReactNode }): JSX.Element {
  const [pref, setPref] = useState<ThemePref>(() => readPref());
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolve(readPref()));

  useEffect(() => {
    setResolved(resolve(pref));
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, pref);
    }
  }, [pref]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", resolved);
    }
  }, [resolved]);

  useEffect(() => {
    if (pref !== "system" || typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (): void => setResolved(media.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [pref]);

  const value = useMemo<ThemeValue>(
    () => ({
      pref,
      resolved,
      setPref,
      toggle: () => setPref(resolved === "dark" ? "light" : "dark"),
    }),
    [pref, resolved],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return value;
}

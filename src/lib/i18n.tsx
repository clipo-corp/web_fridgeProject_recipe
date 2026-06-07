import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { translate, type Lang, type TranslationKey } from "./translations";
import {
  countryLabel as countryLabelFor,
  labelFor as rawLabelFor,
  timeLabel as rawTimeLabel,
} from "./recipeLabels";

const STORAGE_KEY = "fk-lang";

function readLang(): Lang {
  if (typeof window === "undefined") {
    return "ko";
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" || stored === "ko" ? stored : "ko";
}

type I18nValue = {
  readonly lang: Lang;
  readonly setLang: (lang: Lang) => void;
  readonly toggleLang: () => void;
  readonly t: (key: TranslationKey, params?: Readonly<Record<string, string | number>>) => string;
  readonly labelFor: (value: string) => string;
  readonly countryLabel: (value: string) => string;
  readonly timeLabel: (value: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { readonly children: ReactNode }): JSX.Element {
  const [lang, setLang] = useState<Lang>(() => readLang());

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
    }
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      toggleLang: () => setLang(lang === "ko" ? "en" : "ko"),
      t: (key, params) => translate(lang, key, params),
      labelFor: (input) => rawLabelFor(input, lang),
      countryLabel: (input) => countryLabelFor(input, lang),
      timeLabel: (input) => rawTimeLabel(input, lang),
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (value === null) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return value;
}

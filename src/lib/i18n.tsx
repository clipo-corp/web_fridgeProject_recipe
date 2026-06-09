import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { translate, type Lang, type TranslationKey } from "./translations";
import {
  displayLanguageToUiLanguage,
  fallbackDisplayLanguage,
  fetchLocalizationBootstrap,
  readStoredDisplayLanguage,
  resolveBootstrapDisplayLanguage,
  uiLanguageToDisplayLanguage,
  writeDisplayLanguage,
  type DisplayLanguage,
} from "./languagePreference";
import {
  countryLabel as countryLabelFor,
  labelFor as rawLabelFor,
  timeLabel as rawTimeLabel,
} from "./recipeLabels";

type I18nValue = {
  readonly lang: Lang;
  readonly displayLang: DisplayLanguage;
  readonly setLang: (lang: Lang) => void;
  readonly toggleLang: () => void;
  readonly t: (key: TranslationKey, params?: Readonly<Record<string, string | number>>) => string;
  readonly labelFor: (value: string) => string;
  readonly countryLabel: (value: string) => string;
  readonly timeLabel: (value: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

type LanguageState = {
  readonly displayLang: DisplayLanguage;
  readonly ready: boolean;
};

function initialLanguageState(): LanguageState {
  const stored = readStoredDisplayLanguage();
  return {
    displayLang: stored ?? fallbackDisplayLanguage(),
    ready: stored !== null,
  };
}

export function I18nProvider({ children }: { readonly children: ReactNode }): JSX.Element {
  const [{ displayLang, ready }, setLanguageState] = useState<LanguageState>(initialLanguageState);
  const lang = displayLanguageToUiLanguage(displayLang);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
    }
  }, [lang]);

  useEffect(() => {
    if (ready || readStoredDisplayLanguage() !== null) {
      return;
    }

    let cancelled = false;
    const browserLanguage = typeof navigator === "undefined" ? null : navigator.language;

    void fetchLocalizationBootstrap().then((bootstrap) => {
      if (cancelled || readStoredDisplayLanguage() !== null) {
        return;
      }

      const nextDisplayLanguage = resolveBootstrapDisplayLanguage(bootstrap, browserLanguage);
      writeDisplayLanguage(nextDisplayLanguage, "auto");
      setLanguageState({ displayLang: nextDisplayLanguage, ready: true });
    });

    return () => {
      cancelled = true;
    };
  }, [ready]);

  const setLang = (nextLang: Lang): void => {
    const nextDisplayLanguage = uiLanguageToDisplayLanguage(nextLang);
    writeDisplayLanguage(nextDisplayLanguage, "manual");
    setLanguageState({ displayLang: nextDisplayLanguage, ready: true });
  };

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      displayLang,
      setLang,
      toggleLang: () => setLang(lang === "ko" ? "en" : "ko"),
      t: (key, params) => translate(lang, key, params),
      labelFor: (input) => rawLabelFor(input, lang),
      countryLabel: (input) => countryLabelFor(input, lang),
      timeLabel: (input) => rawTimeLabel(input, lang),
    }),
    [displayLang, lang],
  );

  return <I18nContext.Provider value={value}>{ready ? children : null}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (value === null) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return value;
}

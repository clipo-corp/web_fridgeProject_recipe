import { z } from "zod";
import { apiBaseUrl } from "./runtimeConfig";

export const displayLanguageStorageKey = "language";
export const languageSourceStorageKey = "languageSource";

const legacyLanguageStorageKey = "fk-lang";
const defaultDisplayLanguages = ["ko-KR", "en-US"] as const;

export type DisplayLanguage = (typeof defaultDisplayLanguages)[number];
export type UiLanguage = "ko" | "en";
export type LanguageSource = "auto" | "manual";

export type LocalizationBootstrap = {
  readonly supportedLanguages: readonly string[];
  readonly countryCode: string | null;
  readonly defaultLanguage: string | null;
};

type LanguageStorage = Pick<Storage, "getItem" | "setItem">;

const localizationBootstrapSchema = z.object({
  supportedLanguages: z.array(z.string()).optional(),
  countryCode: z.string().nullable().optional(),
  defaultLanguage: z.string().nullable().optional(),
});

const wrappedLocalizationBootstrapSchema = z.object({
  success: z.boolean().optional(),
  data: localizationBootstrapSchema.optional(),
});

export function displayLanguageToUiLanguage(displayLanguage: DisplayLanguage): UiLanguage {
  return displayLanguage === "ko-KR" ? "ko" : "en";
}

export function uiLanguageToDisplayLanguage(language: UiLanguage): DisplayLanguage {
  return language === "ko" ? "ko-KR" : "en-US";
}

export function normalizeDisplayLanguage(
  value: string | null | undefined,
  supportedLanguages: readonly string[] = defaultDisplayLanguages,
): DisplayLanguage | null {
  const known = knownDisplayLanguage(value);
  if (known === null) {
    return null;
  }

  const supported = normalizedSupportedDisplayLanguages(supportedLanguages);
  return supported.includes(known) ? known : firstSupportedDisplayLanguage(supported);
}

export function normalizedSupportedDisplayLanguages(
  supportedLanguages: readonly string[] = defaultDisplayLanguages,
): readonly DisplayLanguage[] {
  const languages: DisplayLanguage[] = [];

  for (const language of supportedLanguages) {
    const known = knownDisplayLanguage(language);
    if (known !== null && !languages.includes(known)) {
      languages.push(known);
    }
  }

  return languages.length > 0 ? languages : defaultDisplayLanguages;
}

export function readStoredDisplayLanguage(
  storage: LanguageStorage | null = browserStorage(),
): DisplayLanguage | null {
  if (storage === null) {
    return null;
  }

  const stored = normalizeDisplayLanguage(storage.getItem(displayLanguageStorageKey));
  if (stored !== null) {
    return stored;
  }

  const legacy = normalizeDisplayLanguage(storage.getItem(legacyLanguageStorageKey));
  if (legacy !== null) {
    writeDisplayLanguage(legacy, "auto", storage);
    return legacy;
  }

  return null;
}

export function writeDisplayLanguage(
  displayLanguage: DisplayLanguage,
  source: LanguageSource,
  storage: LanguageStorage | null = browserStorage(),
): void {
  if (storage === null) {
    return;
  }

  storage.setItem(displayLanguageStorageKey, displayLanguage);
  storage.setItem(languageSourceStorageKey, source);
}

export function currentRequestDisplayLanguage(): DisplayLanguage {
  return readStoredDisplayLanguage() ?? fallbackDisplayLanguage();
}

export function fallbackDisplayLanguage(): DisplayLanguage {
  const navigatorLanguage =
    typeof navigator === "undefined" ? null : normalizeDisplayLanguage(navigator.language);
  return navigatorLanguage ?? "ko-KR";
}

export function resolveBootstrapDisplayLanguage(
  bootstrap: LocalizationBootstrap | null,
  browserLanguage: string | null,
): DisplayLanguage {
  if (bootstrap !== null) {
    const supported = normalizedSupportedDisplayLanguages(bootstrap.supportedLanguages);
    const fromDefault = normalizeDisplayLanguage(bootstrap.defaultLanguage, supported);
    if (fromDefault !== null) {
      return fromDefault;
    }

    const fromCountry = displayLanguageForCountryCode(bootstrap.countryCode, supported);
    if (fromCountry !== null) {
      return fromCountry;
    }
  }

  return normalizeDisplayLanguage(browserLanguage) ?? "ko-KR";
}

export async function fetchLocalizationBootstrap(): Promise<LocalizationBootstrap | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/public/localization/bootstrap`, {
      credentials: "omit",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return null;
    }

    return parseLocalizationBootstrap(await response.json());
  } catch (error) {
    if (error instanceof Error) {
      return null;
    }
    throw error;
  }
}

function parseLocalizationBootstrap(payload: unknown): LocalizationBootstrap | null {
  const direct = localizationBootstrapSchema.safeParse(payload);
  if (direct.success) {
    return toLocalizationBootstrap(direct.data);
  }

  const wrapped = wrappedLocalizationBootstrapSchema.safeParse(payload);
  if (wrapped.success && wrapped.data.data !== undefined) {
    return toLocalizationBootstrap(wrapped.data.data);
  }

  return null;
}

function toLocalizationBootstrap(
  payload: z.infer<typeof localizationBootstrapSchema>,
): LocalizationBootstrap {
  return {
    supportedLanguages: payload.supportedLanguages ?? defaultDisplayLanguages,
    countryCode: payload.countryCode ?? null,
    defaultLanguage: payload.defaultLanguage ?? null,
  };
}

function displayLanguageForCountryCode(
  countryCode: string | null,
  supportedLanguages: readonly string[],
): DisplayLanguage | null {
  const code = countryCode?.trim().toUpperCase();
  if (code === undefined || code.length === 0) {
    return null;
  }

  return normalizeDisplayLanguage(code === "KR" ? "ko-KR" : "en-US", supportedLanguages);
}

function firstSupportedDisplayLanguage(supportedLanguages: readonly DisplayLanguage[]): DisplayLanguage {
  for (const language of supportedLanguages) {
    return language;
  }

  return "ko-KR";
}

function knownDisplayLanguage(value: string | null | undefined): DisplayLanguage | null {
  const normalized = value?.trim().replace("_", "-").toLowerCase();
  if (normalized === "ko" || normalized === "ko-kr") {
    return "ko-KR";
  }
  if (normalized === "en" || normalized === "en-us") {
    return "en-US";
  }
  return null;
}

function browserStorage(): LanguageStorage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

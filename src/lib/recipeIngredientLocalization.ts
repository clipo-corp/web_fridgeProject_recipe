import type { PublicRecipeRecord } from "./recipeCatalogTypes";

export type ServerMasterFood = {
  readonly id?: number | string | null;
  readonly label?: string | null;
  readonly masterId?: number | string | null;
  readonly master_id?: number | string | null;
  readonly localizedName?: string | null;
  readonly localized_name?: string | null;
  readonly displayName?: string | null;
  readonly display_name?: string | null;
  readonly resolvedExamples?: Readonly<Record<string, string | null | undefined>> | null;
  readonly resolved_examples?: Readonly<Record<string, string | null | undefined>> | null;
  readonly names?: Readonly<Record<string, string | null | undefined>> | null;
  readonly masterName?: string | null;
  readonly master_name?: string | null;
  readonly name?: string | null;
  readonly title?: string | null;
  readonly displayLang?: string | null;
  readonly typeIngredients?: string | null;
  readonly type_ingredients?: string | null;
};

type ServerMasterFoodGroup = {
  readonly foods?: ServerMasterFoodBatchResponse | null;
  readonly items?: ServerMasterFoodBatchResponse | null;
  readonly masters?: ServerMasterFoodBatchResponse | null;
  readonly results?: ServerMasterFoodBatchResponse | null;
  readonly data?: ServerMasterFoodBatchResponse | null;
};

export type ServerMasterFoodBatchResponse =
  | ServerMasterFood
  | ServerMasterFoodGroup
  | readonly ServerMasterFoodBatchResponse[];

export function ingredientMasterLookupFromResponse(
  response: ServerMasterFoodBatchResponse,
  languageCandidates: readonly string[],
): ReadonlyMap<number, string> {
  const lookup = new Map<number, string>();

  for (const record of masterFoodRecords(response)) {
    const id = masterFoodId(record);
    const name = masterFoodName(record, languageCandidates);
    if (id !== null && name !== null) {
      lookup.set(id, name);
    }
  }

  return lookup;
}

export function recipeNameLanguageCandidates(
  recipe: PublicRecipeRecord,
  displayLang: string,
): readonly string[] {
  const candidates: string[] = [];

  addLanguageCandidates(candidates, displayLang);
  addLanguageCandidates(candidates, recipe.requestedDisplayLang);
  addLanguageCandidates(candidates, recipe.displayLang);
  for (const language of recipe.availableLangs) {
    addLanguageCandidates(candidates, language);
  }
  addLanguageCandidates(candidates, localeForRecipeLanguage(recipe.writtenLang));
  addLanguageCandidates(candidates, localeForCuisineRegion(recipe.cuisineRegion));
  addLanguageCandidates(candidates, localeForCountryCode(recipe.countryCode));
  addLanguageCandidates(candidates, "ko-KR");
  addLanguageCandidates(candidates, "en-US");

  return candidates;
}

function masterFoodRecords(response: ServerMasterFoodBatchResponse): readonly ServerMasterFood[] {
  const records: ServerMasterFood[] = [];
  collectMasterFoodRecords(response, records);
  return records;
}

function collectMasterFoodRecords(
  response: ServerMasterFoodBatchResponse,
  records: ServerMasterFood[],
): void {
  if (isMasterFoodBatchArray(response)) {
    for (const item of response) {
      collectMasterFoodRecords(item, records);
    }
    return;
  }

  if (isMasterFoodRecord(response)) {
    records.push(response);
    return;
  }

  collectGroupedRecords(response, records);
}

function isMasterFoodBatchArray(
  response: ServerMasterFoodBatchResponse,
): response is readonly ServerMasterFoodBatchResponse[] {
  return Array.isArray(response);
}

function collectGroupedRecords(response: ServerMasterFoodGroup, records: ServerMasterFood[]): void {
  for (const value of [response.data, response.foods, response.items, response.masters, response.results]) {
    if (value !== null && value !== undefined) {
      collectMasterFoodRecords(value, records);
    }
  }
}

function isMasterFoodRecord(value: ServerMasterFoodBatchResponse): value is ServerMasterFood {
  return "id" in value || "masterId" in value || "master_id" in value;
}

function masterFoodId(record: ServerMasterFood): number | null {
  return numberValue(record.id ?? record.masterId ?? record.master_id);
}

function masterFoodName(record: ServerMasterFood, languageCandidates: readonly string[]): string | null {
  const directName =
    nonEmptyString(record.localizedName) ??
    nonEmptyString(record.localized_name) ??
    nonEmptyString(record.displayName) ??
    nonEmptyString(record.display_name);
  if (directName !== null) {
    return directName;
  }

  const legacyName =
    localizedMapName(record.resolvedExamples, languageCandidates) ??
    localizedMapName(record.resolved_examples, languageCandidates) ??
    localizedMapName(record.names, languageCandidates);
  if (legacyName !== null) {
    return legacyName;
  }

  return (
    nonEmptyString(record.master_name) ??
    nonEmptyString(record.masterName) ??
    nonEmptyString(record.name) ??
    nonEmptyString(record.title)
  );
}

function localizedMapName(
  names: Readonly<Record<string, string | null | undefined>> | null | undefined,
  languageCandidates: readonly string[],
): string | null {
  if (names === null || names === undefined) {
    return null;
  }

  const candidates = [
    ...languageCandidates.flatMap((candidate) => languageNameValues(names, candidate)),
    ...Object.values(names),
  ];

  for (const candidate of candidates) {
    const value = nonEmptyString(candidate);
    if (value !== null) {
      return value;
    }
  }

  return null;
}

function addLanguageCandidates(candidates: string[], locale: string | null): void {
  const normalized = nonEmptyString(locale);
  if (normalized === null) {
    return;
  }

  const variants = [
    normalized,
    normalized.replace("_", "-"),
    normalized.replace("-", "_"),
    normalized.toLowerCase(),
    normalized.toLowerCase().replace("_", "-"),
    normalized.toLowerCase().replace("-", "_"),
  ];
  const language = normalized.split(/[-_]/)[0];
  if (language !== undefined && language.length > 0) {
    variants.push(language, language.toLowerCase());
  }

  for (const variant of variants) {
    if (variant.length > 0 && !candidates.includes(variant)) {
      candidates.push(variant);
    }
  }
}

function languageNameValues(
  names: Readonly<Record<string, string | null | undefined>>,
  candidate: string,
): readonly (string | null | undefined)[] {
  return [
    names[candidate],
    names[candidate.replace("_", "-")],
    names[candidate.replace("-", "_")],
    names[candidate.toLowerCase()],
    names[candidate.toLowerCase().replace("_", "-")],
    names[candidate.toLowerCase().replace("-", "_")],
  ];
}

function localeForCuisineRegion(cuisineRegion: string): string | null {
  const locales: Readonly<Record<string, string>> = {
    korean: "ko-KR",
    japanese: "ja-JP",
    chinese: "zh-CN",
    french: "fr-FR",
    italian: "it-IT",
    indian: "hi-IN",
    western: "en-US",
    american: "en-US",
    british: "en-GB",
  };

  return locales[cuisineRegion.toLowerCase()] ?? null;
}

function localeForCountryCode(countryCode: string): string | null {
  const locales: Readonly<Record<string, string>> = {
    KR: "ko-KR",
    JP: "ja-JP",
    CN: "zh-CN",
    TW: "zh-TW",
    HK: "zh-HK",
    FR: "fr-FR",
    IT: "it-IT",
    IN: "hi-IN",
    US: "en-US",
    GB: "en-GB",
    SG: "en-SG",
    AU: "en-AU",
    CA: "en-CA",
    DE: "de-DE",
    ES: "es-ES",
    MX: "es-MX",
    TH: "th-TH",
    VN: "vi-VN",
  };

  return locales[countryCode.trim().toUpperCase()] ?? null;
}

function localeForRecipeLanguage(writtenLang: PublicRecipeRecord["writtenLang"]): string {
  return writtenLang === "en" ? "en-US" : "ko-KR";
}

function numberValue(value: number | string | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function nonEmptyString(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? null : trimmed;
}

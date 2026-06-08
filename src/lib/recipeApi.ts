import {
  collectCatalogOptions,
  filterPublicRecipes,
  loadPublicMockRecipes,
  popularPublicRecipes,
  type CatalogFilterOptions,
} from "./recipeCatalogMock";
import { initialCatalogFilters, toPublicRecipeSearchRequest } from "./recipeCatalogRequest";
import { withCatalogDemoMedia } from "./recipeCatalogDemoMedia";
import { isMockMode } from "./runtimeConfig";
import type {
  PublicRecipeCatalogFilters,
  PublicRecipeRecord,
  RecipeIngredient,
  RecipeFilterKey,
  RecipeStep,
  RecipeVisibility,
  TranslationStatus,
} from "./recipeCatalogTypes";

const defaultDisplayLang = "ko-KR";
const apiBaseUrl = (import.meta.env["VITE_API_BASE_URL"] ?? "").replace(/\/$/, "");
const guestTokenKey = "freshkeeper.guestAccessToken";
const guestDeviceKey = "freshkeeper.guestDeviceId";
const recipeRequestCache = new Map<string, Promise<readonly PublicRecipeRecord[]>>();
let guestAccessTokenRequest: Promise<string> | null = null;

type ApiResponse<T> = {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: T;
};

type LoginResponse = {
  readonly accessToken?: string;
};

type ServerRecipePageResponse = {
  readonly isAfter?: boolean;
  readonly pageNumber?: number;
  readonly recipes?: readonly ServerRecipeInfo[];
};

type ServerRecipeFilterOptionsResponse = Record<RecipeFilterKey | "writtenLang", readonly string[]>;

type ServerRecipeRegionCatalogResponse = {
  readonly regions?: readonly ServerRecipeRegionOption[];
};

type ServerRecipeRegionOption = {
  readonly country?: string | null;
  readonly countryCode?: string | null;
  readonly city?: string | null;
  readonly cityKey?: string | null;
  readonly district?: string | null;
  readonly districtKey?: string | null;
  readonly canonicalCountry?: string | null;
  readonly canonicalCity?: string | null;
  readonly canonicalDistrict?: string | null;
};

type ServerRecipeInfo = {
  readonly recipeId?: number | string | null;
  readonly id?: number | string | null;
  readonly recipe_id?: number | string | null;
  readonly recipeID?: number | string | null;
  readonly title?: string | null;
  readonly titleImageUrl?: string | null;
  readonly description?: string | null;
  readonly cookingTip?: string | null;
  readonly writtenLang?: string | null;
  readonly requestedDisplayLang?: string | null;
  readonly displayLang?: string | null;
  readonly availableLangs?: readonly string[] | null;
  readonly isOriginal?: boolean | null;
  readonly isTranslated?: boolean | null;
  readonly translationStatus?: string | null;
  readonly source?: string | null;
  readonly visibility?: string | null;
  readonly isUseLocalData?: boolean | null;
  readonly likeCount?: number | null;
  readonly viewCount?: number | null;
  readonly createdAt?: string | readonly number[] | null;
  readonly countryCode?: string | null;
  readonly country?: string | null;
  readonly city?: string | null;
  readonly district?: string | null;
  readonly cityKey?: string | null;
  readonly districtKey?: string | null;
  readonly recipeType?: string | null;
  readonly cookingMethod?: string | null;
  readonly technique?: string | null;
  readonly dietaryGoal?: string | null;
  readonly dietaryRestriction?: string | null;
  readonly primaryIngredient?: string | null;
  readonly category?: string | null;
  readonly occasion?: string | null;
  readonly difficulty?: string | null;
  readonly cookingTime?: string | null;
  readonly cuisineRegion?: string | null;
  readonly servings?: string | null;
  readonly requiredTool?: string | null;
  readonly ingredients?: readonly ServerRecipeIngredient[] | null;
  readonly steps?: readonly ServerRecipeStep[] | null;
};

type ServerRecipeIngredient = {
  readonly id?: number | string | null;
  readonly masterId?: number | string | null;
  readonly master_id?: number | string | null;
  readonly name?: string | null;
  readonly masterName?: string | null;
  readonly master_name?: string | null;
  readonly quantity?: number | string | null;
  readonly unit?: string | null;
  readonly description?: string | null;
};

type ServerRecipeStep = {
  readonly stepNumber?: number | null;
  readonly way?: string | null;
  readonly cookingTip?: string | null;
  readonly imageUrl?: string | null;
};

type ServerMasterFood = {
  readonly id?: number | string | null;
  readonly masterId?: number | string | null;
  readonly master_id?: number | string | null;
  readonly names?: Readonly<Record<string, string | null | undefined>> | null;
  readonly masterName?: string | null;
  readonly master_name?: string | null;
  readonly name?: string | null;
};

type ServerMasterFoodBatchResponse =
  | readonly ServerMasterFood[]
  | ServerMasterFood
  | {
      readonly foods?: readonly ServerMasterFood[] | null;
      readonly items?: readonly ServerMasterFood[] | null;
      readonly masters?: readonly ServerMasterFood[] | null;
      readonly results?: readonly ServerMasterFood[] | null;
      readonly data?: readonly ServerMasterFood[] | ServerMasterFood | null;
    };

export async function loadCatalogRecipes(
  filters: PublicRecipeCatalogFilters,
): Promise<readonly PublicRecipeRecord[]> {
  if (isMockMode) {
    const recipes = await loadPublicMockRecipes();
    return filterPublicRecipes(recipes, filters);
  }

  return fetchPublicRecipes(filters);
}

export async function loadPublicRecipes(): Promise<readonly PublicRecipeRecord[]> {
  return loadCatalogRecipes(initialCatalogFilters);
}

export async function loadFeaturedRecipes(): Promise<readonly PublicRecipeRecord[]> {
  if (isMockMode) {
    const recipes = await loadPublicMockRecipes();
    return popularPublicRecipes(recipes).slice(0, 6);
  }

  return fetchPublicRecipes({ ...initialCatalogFilters, sort: "popular" }, 6);
}

export async function loadCatalogFilterOptions(): Promise<CatalogFilterOptions> {
  if (isMockMode) {
    const recipes = await loadPublicMockRecipes();
    return collectCatalogOptions(recipes);
  }

  const [filters, region] = await Promise.all([
    fetchWithGuestAuth<ServerRecipeFilterOptionsResponse>("/api/recipe/filter-options"),
    fetchCountryRegionOptions(),
  ]);

  return {
    region,
    writtenLang: filters.writtenLang,
    recipeType: filters.recipeType,
    cookingMethod: filters.cookingMethod,
    technique: filters.technique,
    dietaryGoal: filters.dietaryGoal,
    dietaryRestriction: filters.dietaryRestriction,
    primaryIngredient: filters.primaryIngredient,
    category: filters.category,
    occasion: filters.occasion,
    difficulty: filters.difficulty,
    cookingTime: filters.cookingTime,
    cuisineRegion: filters.cuisineRegion,
    servings: filters.servings,
    requiredTool: filters.requiredTool,
  };
}

export async function loadPublicRecipeDetail(recipeId: string): Promise<PublicRecipeRecord | null> {
  if (isMockMode) {
    const recipes = await loadPublicMockRecipes();
    return recipes.find((recipe) => recipe.recipeId === recipeId) ?? null;
  }

  if (!isServerRecipeId(recipeId)) {
    return null;
  }

  return fetchPublicRecipeDetail(recipeId);
}

async function fetchPublicRecipes(
  filters: PublicRecipeCatalogFilters,
  limit = 100,
): Promise<readonly PublicRecipeRecord[]> {
  const cacheKey = JSON.stringify({ filters, limit });
  const cached = recipeRequestCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const request = fetchPublicRecipePage(filters, 0)
    .then((response) =>
      (response.recipes ?? [])
        .map(toPublicRecipeRecord)
        .filter((recipe) => isServerRecipeId(recipe.recipeId))
        .slice(0, limit),
    )
    .finally(() => {
      recipeRequestCache.delete(cacheKey);
    });

  recipeRequestCache.set(cacheKey, request);
  return request;
}

async function fetchPublicRecipePage(
  filters: PublicRecipeCatalogFilters,
  pageNumber = 0,
  displayLang = defaultDisplayLang,
): Promise<ServerRecipePageResponse> {
  const request = toServerRecipeSearchRequest(filters, pageNumber, displayLang);
  return fetchWithGuestAuth<ServerRecipePageResponse>(
    `/api/recipe/search/${pageNumber}?displayLang=${encodeURIComponent(displayLang)}`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );
}

async function fetchPublicRecipeDetail(
  recipeId: string,
  displayLang = defaultDisplayLang,
): Promise<PublicRecipeRecord | null> {
  if (!isServerRecipeId(recipeId)) {
    return null;
  }

  const response = await fetchWithGuestAuth<ServerRecipeInfo>(
    `/api/recipe/load?q=${encodeURIComponent(recipeId)}&displayLang=${encodeURIComponent(displayLang)}`,
  );

  return enrichRecipeIngredientNames(toPublicRecipeRecord(response), displayLang);
}

function toServerRecipeSearchRequest(
  filters: PublicRecipeCatalogFilters,
  pageNumber: number,
  displayLang: string,
): Record<string, unknown> {
  const { pageNumber: _pageNumber, displayLang: _displayLang, ...request } =
    toPublicRecipeSearchRequest(filters, pageNumber, displayLang);
  return request;
}

async function fetchCountryRegionOptions(): Promise<CatalogFilterOptions["region"]> {
  const response = await fetchWithGuestAuth<ServerRecipeRegionCatalogResponse>(
    `/api/recipe/regions?level=country&displayLang=${encodeURIComponent(defaultDisplayLang)}`,
  );
  const countries = (response.regions ?? []).map((option) => ({
    countryCode: stringValue(option.countryCode, ""),
    country: stringValue(option.country ?? option.canonicalCountry, "Global"),
  })).filter((option) => option.countryCode.length > 0);

  return {
    countries,
    cities: [],
    districts: [],
  };
}

async function fetchWithGuestAuth<T>(
  path: string,
  init: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<T> {
  const token = await getGuestAccessToken();
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if ((response.status === 401 || response.status === 403) && retryOnUnauthorized) {
    clearGuestAccessToken();
    return fetchWithGuestAuth<T>(path, init, false);
  }

  return readApiResponse<T>(response);
}

async function fetchRawWithGuestAuth<T>(
  path: string,
  init: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<T> {
  const token = await getGuestAccessToken();
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if ((response.status === 401 || response.status === 403) && retryOnUnauthorized) {
    clearGuestAccessToken();
    return fetchRawWithGuestAuth<T>(path, init, false);
  }

  return readRawJsonResponse<T>(response);
}

async function getGuestAccessToken(): Promise<string> {
  const cached = sessionStorage.getItem(guestTokenKey);
  if (cached !== null && cached.length > 0) {
    return cached;
  }

  if (guestAccessTokenRequest !== null) {
    return guestAccessTokenRequest;
  }

  guestAccessTokenRequest = fetch(apiUrl("/api/auth/guest/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId: getGuestDeviceId() }),
  })
    .then((response) => readApiResponse<LoginResponse>(response))
    .then((data) => {
      if (data.accessToken === undefined || data.accessToken.length === 0) {
        throw new Error("Guest login did not return an access token.");
      }

      sessionStorage.setItem(guestTokenKey, data.accessToken);
      return data.accessToken;
    })
    .finally(() => {
      guestAccessTokenRequest = null;
    });

  return guestAccessTokenRequest;
}

function clearGuestAccessToken(): void {
  sessionStorage.removeItem(guestTokenKey);
  guestAccessTokenRequest = null;
}

function getGuestDeviceId(): string {
  const cached = localStorage.getItem(guestDeviceKey);
  if (cached !== null && cached.length > 0) {
    return cached;
  }

  const deviceId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(guestDeviceKey, deviceId);
  return deviceId;
}

async function readApiResponse<T>(response: Response): Promise<T> {
  const responseText = await response.text();
  let payload: ApiResponse<T>;

  try {
    payload = JSON.parse(responseText) as ApiResponse<T>;
  } catch {
    throw new Error(
      responseText.length > 0
        ? `Server returned a non-JSON response: ${responseText}`
        : `Server request failed with status ${response.status}.`,
    );
  }

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.message ?? `Server request failed with status ${response.status}.`);
  }

  return payload.data;
}

async function readRawJsonResponse<T>(response: Response): Promise<T> {
  const responseText = await response.text();
  let payload: unknown;

  try {
    payload = responseText.length > 0 ? JSON.parse(responseText) : null;
  } catch {
    throw new Error(
      responseText.length > 0
        ? `Server returned a non-JSON response: ${responseText}`
        : `Server request failed with status ${response.status}.`,
    );
  }

  if (!response.ok) {
    throw new Error(`Server request failed with status ${response.status}.`);
  }

  return payload as T;
}

function apiUrl(path: string): string {
  return `${apiBaseUrl}${path}`;
}

async function enrichRecipeIngredientNames(
  recipe: PublicRecipeRecord,
  displayLang: string,
): Promise<PublicRecipeRecord> {
  const masterIds = Array.from(
    new Set(
      recipe.ingredients
        .map((ingredient) => ingredient.masterId)
        .filter((masterId): masterId is number => masterId !== null),
    ),
  );

  if (masterIds.length === 0) {
    return recipe;
  }

  try {
    const lookup = await fetchIngredientMasterLookup(
      masterIds,
      recipeNameLanguageCandidates(recipe, displayLang),
    );
    return {
      ...recipe,
      ingredients: recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        name: ingredientName(ingredient, lookup),
      })),
    };
  } catch {
    return recipe;
  }
}

async function fetchIngredientMasterLookup(
  masterIds: readonly number[],
  languageCandidates: readonly string[],
): Promise<ReadonlyMap<number, string>> {
  const response = await fetchRawWithGuestAuth<ServerMasterFoodBatchResponse>(
    "/api/master/searchIdBatch",
    {
      method: "POST",
      body: JSON.stringify(masterIds),
    },
    false,
  );
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

function masterFoodRecords(response: ServerMasterFoodBatchResponse): readonly ServerMasterFood[] {
  if (Array.isArray(response)) {
    return response as readonly ServerMasterFood[];
  }

  if (isMasterFoodRecord(response)) {
    return [response];
  }

  const grouped = response as Exclude<ServerMasterFoodBatchResponse, readonly ServerMasterFood[] | ServerMasterFood>;
  const data = grouped.data;
  if (Array.isArray(data)) {
    return data;
  }
  if (data !== null && data !== undefined && isMasterFoodRecord(data)) {
    return [data];
  }

  return grouped.foods ?? grouped.items ?? grouped.masters ?? grouped.results ?? [];
}

function masterFoodId(record: ServerMasterFood): number | null {
  return numberValue(record.id ?? record.masterId ?? record.master_id);
}

function isMasterFoodRecord(value: unknown): value is ServerMasterFood {
  return (
    value !== null &&
    typeof value === "object" &&
    ("id" in value || "masterId" in value || "master_id" in value)
  );
}

function masterFoodName(record: ServerMasterFood, languageCandidates: readonly string[]): string | null {
  const namesName = localizedName(record.names, languageCandidates);
  if (namesName !== null) {
    return namesName;
  }

  return nonEmptyString(record.master_name) ?? nonEmptyString(record.masterName) ?? nonEmptyString(record.name);
}

function localizedName(
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

function recipeNameLanguageCandidates(
  recipe: PublicRecipeRecord,
  displayLang: string,
): readonly string[] {
  const candidates: string[] = [];

  addLanguageCandidates(candidates, localeForCuisineRegion(recipe.cuisineRegion));
  addLanguageCandidates(candidates, localeForCountryCode(recipe.countryCode));
  addLanguageCandidates(candidates, localeForRecipeLanguage(recipe.writtenLang));
  addLanguageCandidates(candidates, recipe.displayLang);
  addLanguageCandidates(candidates, displayLang);
  addLanguageCandidates(candidates, defaultDisplayLang);
  addLanguageCandidates(candidates, "en-US");

  return candidates;
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

function ingredientName(
  ingredient: RecipeIngredient,
  lookup: ReadonlyMap<number, string>,
): string {
  if (ingredient.masterId !== null) {
    const lookupName = lookup.get(ingredient.masterId);
    if (lookupName !== undefined && lookupName.length > 0) {
      return lookupName;
    }
  }

  if (ingredient.name.length > 0) {
    return ingredient.name;
  }

  if (ingredient.description.length > 0) {
    return ingredient.description;
  }

  return "Ingredient";
}

function toPublicRecipeRecord(recipe: ServerRecipeInfo): PublicRecipeRecord {
  const recipeId = idValue(recipe.recipeId ?? recipe.id ?? recipe.recipe_id ?? recipe.recipeID);

  return withCatalogDemoMedia({
    recipeId,
    title: stringValue(recipe.title, "Untitled recipe"),
    titleImageUrl: nullableString(recipe.titleImageUrl),
    description: stringValue(recipe.description, ""),
    cookingTip: stringValue(recipe.cookingTip, ""),
    writtenLang: parseWrittenLang(recipe.writtenLang),
    requestedDisplayLang: stringValue(recipe.requestedDisplayLang, defaultDisplayLang),
    displayLang: stringValue(recipe.displayLang, defaultDisplayLang),
    availableLangs: recipe.availableLangs ?? [defaultDisplayLang],
    isOriginal: recipe.isOriginal ?? true,
    isTranslated: recipe.isTranslated ?? false,
    translationStatus: parseTranslationStatus(recipe.translationStatus),
    source: parseSource(recipe.source),
    visibility: parseVisibility(recipe.visibility),
    isUseLocalData: recipe.isUseLocalData ?? true,
    likeCount: recipe.likeCount ?? 0,
    viewCount: recipe.viewCount ?? 0,
    createdAt: parseCreatedAt(recipe.createdAt),
    countryCode: stringValue(recipe.countryCode, "GLOBAL"),
    country: stringValue(recipe.country, "Global"),
    city: nullableString(recipe.city),
    district: nullableString(recipe.district),
    cityKey: nullableString(recipe.cityKey),
    districtKey: nullableString(recipe.districtKey),
    recipeType: stringValue(recipe.recipeType, "everyday"),
    cookingMethod: stringValue(recipe.cookingMethod, "unknown"),
    technique: stringValue(recipe.technique, "unknown"),
    dietaryGoal: stringValue(recipe.dietaryGoal, "standard"),
    dietaryRestriction: stringValue(recipe.dietaryRestriction, "none"),
    primaryIngredient: stringValue(recipe.primaryIngredient, "ingredient"),
    category: stringValue(recipe.category, "everyday"),
    occasion: stringValue(recipe.occasion, "everyday"),
    difficulty: stringValue(recipe.difficulty, "beginner"),
    cookingTime: stringValue(recipe.cookingTime, "30min"),
    cuisineRegion: stringValue(recipe.cuisineRegion, "global"),
    servings: stringValue(recipe.servings, "1-2"),
    requiredTool: stringValue(recipe.requiredTool, "basic"),
    ingredients: (recipe.ingredients ?? []).map(toPublicIngredient),
    steps: (recipe.steps ?? []).map(toPublicStep),
  });
}

function isServerRecipeId(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

function toPublicIngredient(ingredient: ServerRecipeIngredient, index: number): RecipeIngredient {
  const masterId = numberValue(ingredient.masterId ?? ingredient.master_id ?? ingredient.id);
  const fallbackName = `Ingredient ${index + 1}`;

  return {
    masterId,
    name: stringValue(
      ingredient.name ?? ingredient.master_name ?? ingredient.masterName ?? ingredient.description,
      fallbackName,
    ),
    quantity: numberValue(ingredient.quantity),
    unit: nullableString(ingredient.unit),
    description: stringValue(ingredient.description, ""),
  };
}

function toPublicStep(step: ServerRecipeStep, index: number): RecipeStep {
  return {
    stepNumber: step.stepNumber ?? index + 1,
    way: stringValue(step.way, ""),
    cookingTip: nullableString(step.cookingTip),
    imageUrl: nullableString(step.imageUrl),
  };
}

function parseWrittenLang(value: string | null | undefined): PublicRecipeRecord["writtenLang"] {
  return value === "en" || value === "en-US" ? "en" : "ko";
}

function parseSource(value: string | null | undefined): PublicRecipeRecord["source"] {
  return value === "ai" ? "ai" : "user";
}

function parseVisibility(value: string | null | undefined): RecipeVisibility {
  if (value === "private" || value === "shared") {
    return value;
  }
  return "public";
}

function parseTranslationStatus(value: string | null | undefined): TranslationStatus {
  if (value === "translated" || value === "unavailable") {
    return value;
  }
  return "original";
}

function parseCreatedAt(value: string | readonly number[] | null | undefined): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    if (year !== undefined && month !== undefined && day !== undefined) {
      return new Date(year, month - 1, day, hour, minute, second).toISOString();
    }
  }

  return new Date(0).toISOString();
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function idValue(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return "";
}

function nullableString(value: string | null | undefined): string | null {
  return value === undefined || value === null || value.length === 0 ? null : value;
}

function numberValue(value: number | string | null | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

import {
  collectCatalogOptions,
  filterPublicRecipes,
  loadPublicMockRecipes,
  popularPublicRecipes,
  type CatalogFilterOptions,
} from "./recipeCatalogMock";
import { initialCatalogFilters, toPublicRecipeSearchRequest } from "./recipeCatalogRequest";
import { fetchWithGuestAuth } from "./recipeGuestAuth";
import { currentRequestDisplayLanguage, type DisplayLanguage } from "./languagePreference";
import { isMockMode } from "./runtimeConfig";
import {
  isServerRecipeId,
  stringValue,
  toPublicRecipeRecord,
} from "./recipeServerAdapter";
import { enrichRecipeIngredientNames } from "./recipeServerIngredientEnrichment";
import type {
  PublicRecipeCatalogFilters,
  PublicRecipeRecord,
} from "./recipeCatalogTypes";
import type {
  ServerRecipeFilterOptionsResponse,
  ServerRecipeInfo,
  ServerRecipePageResponse,
  ServerRecipeRegionCatalogResponse,
} from "./recipeServerTypes";

type RequestCacheEntry<T> = {
  readonly request: Promise<T>;
  readonly expiresAt: number;
};

const requestCacheTtlMs = 30_000;
const recipeRequestCache = new Map<string, RequestCacheEntry<readonly PublicRecipeRecord[]>>();
const recipePageRequestCache = new Map<string, RequestCacheEntry<PublicRecipePage>>();
const recipeDetailRequestCache = new Map<string, RequestCacheEntry<PublicRecipeRecord | null>>();
const catalogFilterOptionsCache = new Map<string, RequestCacheEntry<CatalogFilterOptions>>();
const serverRecipePageSize = 5;
const maxRecipePageRequests = 50;

type LoadCatalogRecipesOptions = {
  readonly maxPages?: number;
};

export type PublicRecipePage = {
  readonly pageNumber: number;
  readonly recipes: readonly PublicRecipeRecord[];
  readonly isAfter: boolean;
};

export async function loadCatalogRecipes(
  filters: PublicRecipeCatalogFilters,
  displayLang: DisplayLanguage = currentRequestDisplayLanguage(),
  limit = 100,
  options: LoadCatalogRecipesOptions = {},
): Promise<readonly PublicRecipeRecord[]> {
  if (isMockMode) {
    const recipes = await loadPublicMockRecipes();
    return filterPublicRecipes(recipes, filters).slice(0, limit);
  }

  return fetchPublicRecipes(filters, limit, displayLang, options);
}

export async function loadCatalogRecipePage(
  filters: PublicRecipeCatalogFilters,
  displayLang: DisplayLanguage = currentRequestDisplayLanguage(),
  pageNumber = 0,
): Promise<PublicRecipePage> {
  if (isMockMode) {
    const recipes = filterPublicRecipes(await loadPublicMockRecipes(), filters);
    const start = pageNumber * serverRecipePageSize;
    const pageRecipes = recipes.slice(start, start + serverRecipePageSize);

    return {
      pageNumber,
      recipes: pageRecipes,
      isAfter: start + pageRecipes.length < recipes.length,
    };
  }

  return fetchPublicRecipeSinglePage(filters, pageNumber, displayLang);
}

export async function loadPublicRecipes(): Promise<readonly PublicRecipeRecord[]> {
  return loadCatalogRecipes(initialCatalogFilters);
}

export async function loadFeaturedRecipes(
  displayLang: DisplayLanguage = currentRequestDisplayLanguage(),
): Promise<readonly PublicRecipeRecord[]> {
  if (isMockMode) {
    const recipes = await loadPublicMockRecipes();
    return popularPublicRecipes(recipes).slice(0, 6);
  }

  return fetchPublicRecipes({ ...initialCatalogFilters, sort: "popular" }, 6, displayLang);
}

export async function loadCatalogFilterOptions(
  displayLang: DisplayLanguage = currentRequestDisplayLanguage(),
): Promise<CatalogFilterOptions> {
  const cacheKey = JSON.stringify({ displayLang, isMockMode });
  const cached = cachedRequest(catalogFilterOptionsCache, cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const request = isMockMode
    ? loadPublicMockRecipes().then(collectCatalogOptions)
    : fetchCatalogFilterOptions(displayLang);

  cacheRequest(catalogFilterOptionsCache, cacheKey, request);
  return request;
}

export async function loadPublicRecipeDetail(
  recipeId: string,
  displayLang: DisplayLanguage = currentRequestDisplayLanguage(),
): Promise<PublicRecipeRecord | null> {
  if (isMockMode) {
    const recipes = await loadPublicMockRecipes();
    return recipes.find((recipe) => recipe.recipeId === recipeId) ?? null;
  }

  if (!isServerRecipeId(recipeId)) {
    return null;
  }

  const cacheKey = JSON.stringify({ displayLang, recipeId });
  const cached = cachedRequest(recipeDetailRequestCache, cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const request = fetchPublicRecipeDetail(recipeId, displayLang);
  cacheRequest(recipeDetailRequestCache, cacheKey, request);
  return request;
}

export async function enrichPublicRecipeIngredientNames(
  recipe: PublicRecipeRecord,
  displayLang: DisplayLanguage = currentRequestDisplayLanguage(),
): Promise<PublicRecipeRecord> {
  if (isMockMode) {
    return recipe;
  }

  return enrichRecipeIngredientNames(recipe, displayLang);
}

async function fetchPublicRecipes(
  filters: PublicRecipeCatalogFilters,
  limit = 100,
  displayLang: DisplayLanguage = currentRequestDisplayLanguage(),
  options: LoadCatalogRecipesOptions = {},
): Promise<readonly PublicRecipeRecord[]> {
  const cacheKey = JSON.stringify({ displayLang, filters, limit, options });
  const cached = cachedRequest(recipeRequestCache, cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const request = fetchPublicRecipePages(filters, limit, displayLang, options.maxPages);

  cacheRequest(recipeRequestCache, cacheKey, request);
  return request;
}

async function fetchPublicRecipeSinglePage(
  filters: PublicRecipeCatalogFilters,
  pageNumber: number,
  displayLang: DisplayLanguage,
): Promise<PublicRecipePage> {
  const cacheKey = JSON.stringify({ displayLang, filters, pageNumber });
  const cached = cachedRequest(recipePageRequestCache, cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const request = fetchPublicRecipePage(filters, pageNumber, displayLang)
    .then((response) => toPublicRecipePage(response, pageNumber, displayLang));

  cacheRequest(recipePageRequestCache, cacheKey, request);
  return request;
}

async function fetchCatalogFilterOptions(displayLang: DisplayLanguage): Promise<CatalogFilterOptions> {
  const [filters, region] = await Promise.all([
    fetchWithGuestAuth<ServerRecipeFilterOptionsResponse>("/api/recipe/filter-options"),
    fetchCountryRegionOptions(displayLang),
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

function cachedRequest<T>(
  cache: Map<string, RequestCacheEntry<T>>,
  cacheKey: string,
): Promise<T> | undefined {
  const cached = cache.get(cacheKey);
  if (cached === undefined) {
    return undefined;
  }

  if (cached.expiresAt <= Date.now()) {
    cache.delete(cacheKey);
    return undefined;
  }

  return cached.request;
}

function cacheRequest<T>(
  cache: Map<string, RequestCacheEntry<T>>,
  cacheKey: string,
  request: Promise<T>,
): void {
  cache.set(cacheKey, {
    request,
    expiresAt: Date.now() + requestCacheTtlMs,
  });

  request.catch(() => {
    const cached = cache.get(cacheKey);
    if (cached?.request === request) {
      cache.delete(cacheKey);
    }
  });
}

async function fetchPublicRecipePages(
  filters: PublicRecipeCatalogFilters,
  limit: number,
  displayLang: DisplayLanguage = currentRequestDisplayLanguage(),
  maxPages?: number,
): Promise<readonly PublicRecipeRecord[]> {
  if (limit <= 0) {
    return [];
  }

  const recipes: PublicRecipeRecord[] = [];
  const maxPagesForLimit = Math.ceil(limit / serverRecipePageSize) + 2;
  const optionPageLimit = maxPages === undefined ? maxRecipePageRequests : Math.max(1, maxPages);
  const pageRequestLimit = Math.min(optionPageLimit, maxRecipePageRequests, Math.max(1, maxPagesForLimit));

  for (let pageNumber = 0; pageNumber < pageRequestLimit && recipes.length < limit; pageNumber += 1) {
    const response = await fetchPublicRecipePage(filters, pageNumber, displayLang);
    const nextRecipes = (response.recipes ?? [])
      .map((recipe) => toPublicRecipeRecord(recipe, displayLang))
      .filter((recipe) => isServerRecipeId(recipe.recipeId));

    recipes.push(...nextRecipes);

    if (response.isAfter !== true || nextRecipes.length === 0) {
      break;
    }
  }

  return recipes.slice(0, limit);
}

async function fetchPublicRecipePage(
  filters: PublicRecipeCatalogFilters,
  pageNumber = 0,
  displayLang: DisplayLanguage = currentRequestDisplayLanguage(),
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

function toPublicRecipePage(
  response: ServerRecipePageResponse,
  pageNumber: number,
  displayLang: DisplayLanguage,
): PublicRecipePage {
  const recipes = (response.recipes ?? [])
    .map((recipe) => toPublicRecipeRecord(recipe, displayLang))
    .filter((recipe) => isServerRecipeId(recipe.recipeId));

  return {
    pageNumber: response.pageNumber ?? pageNumber,
    recipes,
    isAfter: response.isAfter === true && recipes.length > 0,
  };
}

async function fetchPublicRecipeDetail(
  recipeId: string,
  displayLang: DisplayLanguage = currentRequestDisplayLanguage(),
): Promise<PublicRecipeRecord | null> {
  if (!isServerRecipeId(recipeId)) {
    return null;
  }

  const response = await fetchWithGuestAuth<ServerRecipeInfo>(
    `/api/recipe/load?q=${encodeURIComponent(recipeId)}&displayLang=${encodeURIComponent(displayLang)}`,
  );

  return toPublicRecipeRecord(response, displayLang);
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

export type RecipeTranslationResponse = {
  readonly status: "COMPLETED" | "PROCESSING";
  readonly recipeId: number;
  readonly targetLang: string;
  readonly retryAfterSeconds: number | null;
};

export async function requestRecipeTranslation(
  recipeId: string,
  targetLang: string,
): Promise<RecipeTranslationResponse> {
  return fetchWithGuestAuth<RecipeTranslationResponse>(
    `/api/recipe/${encodeURIComponent(recipeId)}/translations/request?targetLang=${encodeURIComponent(targetLang)}`,
    { method: "POST", body: "null" },
  );
}

async function fetchCountryRegionOptions(displayLang: DisplayLanguage): Promise<CatalogFilterOptions["region"]> {
  const response = await fetchWithGuestAuth<ServerRecipeRegionCatalogResponse>(
    `/api/recipe/regions?level=country&displayLang=${encodeURIComponent(displayLang)}`,
  );
  const countries = (response.regions ?? [])
    .map((option) => ({
      countryCode: stringValue(option.countryCode, ""),
      country: stringValue(option.country ?? option.canonicalCountry, "Global"),
    }))
    .filter((option) => option.countryCode.length > 0);

  return {
    countries,
    cities: [],
    districts: [],
  };
}

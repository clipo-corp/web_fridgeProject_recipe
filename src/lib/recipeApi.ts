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

const recipeRequestCache = new Map<string, Promise<readonly PublicRecipeRecord[]>>();
const serverRecipePageSize = 5;
const maxRecipePageRequests = 50;

type LoadCatalogRecipesOptions = {
  readonly maxPages?: number;
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
  if (isMockMode) {
    const recipes = await loadPublicMockRecipes();
    return collectCatalogOptions(recipes);
  }

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

  return fetchPublicRecipeDetail(recipeId, displayLang);
}

async function fetchPublicRecipes(
  filters: PublicRecipeCatalogFilters,
  limit = 100,
  displayLang: DisplayLanguage = currentRequestDisplayLanguage(),
  options: LoadCatalogRecipesOptions = {},
): Promise<readonly PublicRecipeRecord[]> {
  const cacheKey = JSON.stringify({ displayLang, filters, limit, options });
  const cached = recipeRequestCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const request = fetchPublicRecipePages(filters, limit, displayLang, options.maxPages)
    .finally(() => {
      recipeRequestCache.delete(cacheKey);
    });

  recipeRequestCache.set(cacheKey, request);
  return request;
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

  return enrichRecipeIngredientNames(toPublicRecipeRecord(response, displayLang), displayLang);
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

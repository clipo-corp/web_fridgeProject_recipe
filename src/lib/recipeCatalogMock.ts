import { seedFileSchema, type SeedEntry } from "./recipeMockSchema";
import {
  collectRegionOptions,
  countryCodeFor,
  makeRegionKey,
  type RecipeRegionOptions,
} from "./recipeCatalogRegion";
import {
  initialCatalogFilters,
  toPublicRecipeSearchRequest,
} from "./recipeCatalogRequest";
import { recipeFilterKeys } from "./recipeCatalogTypes";
import type {
  PublicRecipeCatalogFilters,
  PublicRecipeRecord,
  RecipeFilterKey,
} from "./recipeCatalogTypes";

export { initialCatalogFilters, toPublicRecipeSearchRequest };

export type CatalogFilterOptions = Record<RecipeFilterKey, readonly string[]> & {
  readonly region: RecipeRegionOptions;
  readonly writtenLang: readonly string[];
};

export async function loadPublicMockRecipes(): Promise<readonly PublicRecipeRecord[]> {
  const seedModule = await import("../data/recipe_seed_mock_100.json");
  const parsed = seedFileSchema.parse(seedModule.default);

  return parsed.recipes.map(toPublicRecipeRecord);
}

export function filterPublicRecipes(
  recipes: readonly PublicRecipeRecord[],
  filters: PublicRecipeCatalogFilters,
): readonly PublicRecipeRecord[] {
  const query = filters.query.trim().toLocaleLowerCase("ko-KR");
  const filtered = recipes.filter((recipe) => {
    return (
      recipe.visibility === "public" &&
      passesQuery(recipe, query) &&
      passesWrittenLang(recipe, filters.writtenLang) &&
      passesLocalMode(recipe, filters.isUseLocalData) &&
      passesRegion(recipe, filters.region) &&
      recipeFilterKeys.every((key) => passesFilter(filters[key], recipe[key]))
    );
  });

  return sortRecipes(filtered, filters.sort);
}

export function collectCatalogOptions(
  recipes: readonly PublicRecipeRecord[],
): CatalogFilterOptions {
  return {
    region: collectRegionOptions(recipes),
    writtenLang: collectValues(recipes, "writtenLang"),
    recipeType: collectValues(recipes, "recipeType"),
    cookingMethod: collectValues(recipes, "cookingMethod"),
    technique: collectValues(recipes, "technique"),
    dietaryGoal: collectValues(recipes, "dietaryGoal"),
    dietaryRestriction: collectValues(recipes, "dietaryRestriction"),
    primaryIngredient: collectValues(recipes, "primaryIngredient"),
    category: collectValues(recipes, "category"),
    occasion: collectValues(recipes, "occasion"),
    difficulty: collectValues(recipes, "difficulty"),
    cookingTime: collectValues(recipes, "cookingTime"),
    cuisineRegion: collectValues(recipes, "cuisineRegion"),
    servings: collectValues(recipes, "servings"),
    requiredTool: collectValues(recipes, "requiredTool"),
  };
}

export function popularPublicRecipes(
  recipes: readonly PublicRecipeRecord[],
): readonly PublicRecipeRecord[] {
  return sortRecipes(recipes, "popular");
}

export function quickPublicRecipes(
  recipes: readonly PublicRecipeRecord[],
): readonly PublicRecipeRecord[] {
  return recipes.filter((recipe) => recipe.cookingTime === "10min" || recipe.recipeType === "quick");
}

export function topPublicIngredients(
  recipes: readonly PublicRecipeRecord[],
  limit: number,
): readonly string[] {
  const counts = new Map<string, number>();

  for (const recipe of recipes) {
    counts.set(recipe.primaryIngredient, (counts.get(recipe.primaryIngredient) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([ingredient]) => ingredient);
}

function toPublicRecipeRecord(entry: SeedEntry, index: number): PublicRecipeRecord {
  const recipe = entry.recipe;
  const country = entry._mockMeta?.country ?? "Global";
  const countryCode = countryCodeFor(country);
  const city = displaySlug(entry._mockMeta?.category ?? recipe.cuisineRegion ?? "global");
  const district = displaySlug(entry._mockMeta?.dishSlug ?? recipe.category ?? "general");
  const cityKey = makeRegionKey(countryCode, city);
  const districtKey = makeRegionKey(countryCode, city, district);
  const writtenLang = parseWrittenLang(recipe.writtenLang);

  return {
    recipeId: entry.importSource?.sourceId ?? `mock-${index}`,
    title: recipe.title,
    titleImageUrl: recipe.titleImageUrl ?? null,
    description: recipe.description ?? "FreshKeeper mock seed에서 가져온 공개 레시피입니다.",
    cookingTip: recipe.cookingTip ?? "",
    writtenLang,
    requestedDisplayLang: "ko-KR",
    displayLang: "ko-KR",
    availableLangs: writtenLang === "ko" ? ["ko-KR"] : ["en-US", "ko-KR"],
    isOriginal: writtenLang === "ko",
    isTranslated: writtenLang !== "ko",
    translationStatus: writtenLang === "ko" ? "original" : "translated",
    source: recipe.source === "ai" ? "ai" : "user",
    visibility: recipe.visibility === "private" || recipe.visibility === "shared" ? recipe.visibility : "public",
    isUseLocalData: recipe.isUseLocalData ?? true,
    likeCount: 24 + index * 3,
    viewCount: 320 + index * 17,
    createdAt: new Date(Date.UTC(2026, 5, 1 - index)).toISOString(),
    countryCode,
    country,
    city,
    district,
    cityKey,
    districtKey,
    recipeType: recipe.recipeType ?? "everyday",
    cookingMethod: recipe.cookingMethod ?? "unknown",
    technique: recipe.technique ?? "unknown",
    dietaryGoal: recipe.dietaryGoal ?? "standard",
    dietaryRestriction: recipe.dietaryRestriction ?? "none",
    primaryIngredient: recipe.primaryIngredient ?? "ingredient",
    category: recipe.category ?? entry._mockMeta?.category ?? "everyday",
    occasion: recipe.occasion ?? "everyday",
    difficulty: recipe.difficulty ?? "beginner",
    cookingTime: recipe.cookingTime ?? "30min",
    cuisineRegion: recipe.cuisineRegion ?? "global",
    servings: recipe.servings ?? "1-2",
    requiredTool: recipe.requiredTool ?? "basic",
    ingredients: recipe.ingredients.map((ingredient) => ({
      name: ingredient.name ?? ingredient.description ?? "ingredient",
      quantity: ingredient.quantity ?? null,
      unit: ingredient.unit ?? null,
      description: ingredient.description ?? "",
    })),
    steps: recipe.steps.map((step) => ({
      stepNumber: step.stepNumber,
      way: step.way,
      cookingTip: step.cookingTip ?? null,
    })),
  };
}

function passesQuery(recipe: PublicRecipeRecord, query: string): boolean {
  if (query.length === 0) {
    return true;
  }

  const searchable = [
    recipe.title,
    recipe.description,
    recipe.cookingTip,
    recipe.ingredients.map((ingredient) => `${ingredient.name} ${ingredient.description}`).join(" "),
  ]
    .join(" ")
    .toLocaleLowerCase("ko-KR");

  return searchable.includes(query);
}

function passesWrittenLang(recipe: PublicRecipeRecord, selected: string): boolean {
  return selected === "all" || recipe.writtenLang === selected;
}

function passesLocalMode(
  recipe: PublicRecipeRecord,
  selected: PublicRecipeCatalogFilters["isUseLocalData"],
): boolean {
  return selected === "all" || (selected === "local" ? recipe.isUseLocalData : !recipe.isUseLocalData);
}

function passesRegion(
  recipe: PublicRecipeRecord,
  selected: PublicRecipeCatalogFilters["region"],
): boolean {
  if (selected.scope === "none") {
    return true;
  }
  if (selected.scope === "country") {
    return recipe.countryCode === selected.countryCode;
  }
  if (selected.scope === "city") {
    return recipe.cityKey === selected.cityKey;
  }
  return recipe.districtKey === selected.districtKey;
}

function passesFilter(selected: string, actual: string): boolean {
  return selected === "all" || selected.length === 0 || selected === actual;
}

function sortRecipes(
  recipes: readonly PublicRecipeRecord[],
  sort: PublicRecipeCatalogFilters["sort"],
): readonly PublicRecipeRecord[] {
  if (sort === "popular") {
    return [...recipes].sort((a, b) => b.likeCount - a.likeCount);
  }
  if (sort === "hot_month") {
    return [...recipes].sort((a, b) => b.viewCount - a.viewCount);
  }
  return [...recipes].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

function collectValues(
  recipes: readonly PublicRecipeRecord[],
  key: RecipeFilterKey | "writtenLang",
): readonly string[] {
  return Array.from(new Set(recipes.map((recipe) => recipe[key]).filter(Boolean))).sort();
}

function parseWrittenLang(value: string | null | undefined): PublicRecipeRecord["writtenLang"] {
  return value === "en" || value === "en-US" ? "en" : "ko";
}

function displaySlug(value: string): string {
  return value
    .split(/[-_]/)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

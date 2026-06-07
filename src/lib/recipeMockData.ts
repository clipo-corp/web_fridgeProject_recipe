import { seedFileSchema, type SeedEntry } from "./recipeMockSchema";
import type { Recipe, RecipeDifficulty, RecipeFilters, RecipeSort } from "./recipeTypes";

type StringRecipeKey =
  | "category"
  | "country"
  | "cuisineRegion"
  | "cookingTime"
  | "difficulty"
  | "recipeType"
  | "primaryIngredient";

function passes(selected: string | undefined, actual: string): boolean {
  return selected === undefined || selected === "" || selected === "all" || selected === actual;
}

function sortRecipes(recipes: readonly Recipe[], sort: RecipeSort | undefined): readonly Recipe[] {
  if (sort === "popular") {
    return [...recipes].sort((a, b) => b.likes - a.likes);
  }
  if (sort === "latest") {
    return [...recipes].reverse();
  }
  return recipes;
}

const difficultyValues = ["easy", "beginner", "intermediate", "advanced", "master"] as const;

export async function loadMockRecipes(): Promise<readonly Recipe[]> {
  const seedModule = await import("../data/recipe_seed_mock_100.json");
  const parsed = seedFileSchema.parse(seedModule.default);

  return parsed.recipes.map(toRecipe);
}

export function filterRecipes(
  recipes: readonly Recipe[],
  filters: RecipeFilters,
): readonly Recipe[] {
  const query = filters.query.trim().toLocaleLowerCase("ko-KR");

  const filtered = recipes.filter((recipe) => {
    const searchable = [
      recipe.title,
      recipe.description,
      recipe.cookingTip,
      recipe.ingredients.map((ingredient) => ingredient.name).join(" "),
    ]
      .join(" ")
      .toLocaleLowerCase("ko-KR");

    return (
      (query.length === 0 || searchable.includes(query)) &&
      passes(filters.category, recipe.category) &&
      passes(filters.country, recipe.country) &&
      passes(filters.region, recipe.cuisineRegion) &&
      passes(filters.time, recipe.cookingTime) &&
      passes(filters.difficulty, recipe.difficulty) &&
      passes(filters.recipeType, recipe.recipeType) &&
      passes(filters.ingredient, recipe.primaryIngredient)
    );
  });

  return sortRecipes(filtered, filters.sort);
}

export function collectOptions(recipes: readonly Recipe[], key: StringRecipeKey): readonly string[] {
  return Array.from(new Set(recipes.map((recipe) => recipe[key]).filter(Boolean))).sort();
}

const quickTimes = new Set(["5min", "10min", "20min"]);

export function quickRecipes(recipes: readonly Recipe[]): readonly Recipe[] {
  return recipes.filter(
    (recipe) => quickTimes.has(recipe.cookingTime) || recipe.recipeType === "quick",
  );
}

export function popularRecipes(recipes: readonly Recipe[]): readonly Recipe[] {
  return [...recipes].sort((a, b) => b.likes - a.likes);
}

export function topIngredients(
  recipes: readonly Recipe[],
  limit: number,
): readonly string[] {
  const counts = new Map<string, number>();

  for (const recipe of recipes) {
    const key = recipe.primaryIngredient;
    if (key.length === 0) {
      continue;
    }
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}

function toRecipe(entry: SeedEntry, index: number): Recipe {
  const sourceId = entry.importSource?.sourceId ?? `mock-${index}`;
  const recipe = entry.recipe;

  return {
    id: sourceId,
    title: recipe.title,
    imageUrl: recipe.titleImageUrl ?? null,
    description: recipe.description ?? "FreshKeeper mock seed에서 가져온 공개 레시피입니다.",
    cookingTip: recipe.cookingTip ?? "",
    category: recipe.category ?? entry._mockMeta?.category ?? "everyday",
    cuisineRegion: recipe.cuisineRegion ?? "global",
    country: entry._mockMeta?.country ?? "Global",
    cookingTime: recipe.cookingTime ?? "30min",
    difficulty: parseDifficulty(recipe.difficulty ?? undefined),
    recipeType: recipe.recipeType ?? "everyday",
    primaryIngredient: recipe.primaryIngredient ?? "ingredient",
    sourceName: entry.importSource?.sourceUrl ? "curated" : "mock",
    views: 320 + index * 17,
    likes: 24 + index * 3,
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
      imageUrl: step.imageUrl ?? null,
    })),
  };
}

function parseDifficulty(value: string | undefined): RecipeDifficulty {
  return difficultyValues.find((difficulty) => difficulty === value) ?? "beginner";
}

import { seedFileSchema, type SeedEntry } from "./recipeMockSchema";
import type { Recipe, RecipeDifficulty, RecipeFilters } from "./recipeTypes";

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

  return recipes.filter((recipe) => {
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
      (filters.category === "all" || recipe.category === filters.category) &&
      (filters.country === "all" || recipe.country === filters.country)
    );
  });
}

export function collectOptions(recipes: readonly Recipe[], key: "category" | "country"): readonly string[] {
  return Array.from(new Set(recipes.map((recipe) => recipe[key]).filter(Boolean))).sort();
}

function toRecipe(entry: SeedEntry, index: number): Recipe {
  const sourceId = entry.importSource?.sourceId ?? `mock-${index}`;
  const recipe = entry.recipe;

  return {
    id: sourceId,
    title: recipe.title,
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
    })),
  };
}

function parseDifficulty(value: string | undefined): RecipeDifficulty {
  return difficultyValues.find((difficulty) => difficulty === value) ?? "beginner";
}

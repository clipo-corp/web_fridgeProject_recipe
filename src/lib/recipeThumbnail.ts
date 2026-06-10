import type { PublicRecipeRecord } from "./recipeCatalogTypes";

const FALLBACK_EMOJI = "🍽️";

export function recipeListEmoji(recipe: PublicRecipeRecord): string {
  const category = normalizeRecipeField(recipe.category);
  const primaryIngredient = normalizeRecipeField(recipe.primaryIngredient);
  const recipeType = normalizeRecipeField(recipe.recipeType);
  const cuisineRegion = normalizeRecipeField(recipe.cuisineRegion);

  if (category.includes("salad")) {
    return "🥗";
  }
  if (category.includes("soup") || category.includes("stew")) {
    return "🍲";
  }
  if (category.includes("rice") || category.includes("porridge")) {
    return "🍚";
  }
  if (primaryIngredient.includes("rice")) {
    return "🍚";
  }
  if (category.includes("dessert") || recipeType.includes("snack")) {
    return "🍰";
  }
  if (cuisineRegion.includes("korean")) {
    return "🍳";
  }
  if (cuisineRegion.includes("italian")) {
    return "🍝";
  }

  return FALLBACK_EMOJI;
}

export function recipeHomeEmoji(recipe: PublicRecipeRecord): string {
  const title = normalizeRecipeField(recipe.title);
  const category = normalizeRecipeField(recipe.category);
  const primaryIngredient = normalizeRecipeField(recipe.primaryIngredient);

  if (title.includes("떡볶") || title.includes("spicy")) {
    return "🔥";
  }
  if (title.includes("국수") || title.includes("noodle")) {
    return "🍜";
  }
  if (title.includes("복숭") || title.includes("peach")) {
    return "🍑";
  }
  if (title.includes("김치")) {
    return "🥬";
  }

  return categoryEmoji(category) ?? primaryIngredientEmoji(primaryIngredient) ?? FALLBACK_EMOJI;
}

function categoryEmoji(category: string): string | null {
  if (category.includes("salad")) {
    return "🥗";
  }
  if (category.includes("soup") || category.includes("stew")) {
    return "🍲";
  }
  if (category.includes("rice") || category.includes("porridge")) {
    return "🍚";
  }
  if (category.includes("dessert") || category.includes("cookie")) {
    return "🍰";
  }
  if (category.includes("noodle")) {
    return "🍜";
  }
  if (category.includes("drink")) {
    return "🥤";
  }

  return null;
}

function primaryIngredientEmoji(primaryIngredient: string): string | null {
  if (primaryIngredient.includes("rice") || primaryIngredient.includes("grain")) {
    return "🍚";
  }
  if (primaryIngredient.includes("seafood")) {
    return "🐟";
  }
  if (
    primaryIngredient.includes("meat") ||
    primaryIngredient.includes("beef") ||
    primaryIngredient.includes("pork") ||
    primaryIngredient.includes("chicken")
  ) {
    return "🥩";
  }
  if (primaryIngredient.includes("dairy") || primaryIngredient.includes("egg")) {
    return "🥚";
  }
  if (primaryIngredient.includes("fruit")) {
    return "🍑";
  }
  if (primaryIngredient.includes("vegetable")) {
    return "🥬";
  }

  return null;
}

function normalizeRecipeField(value: string): string {
  return value.trim().toLocaleLowerCase();
}

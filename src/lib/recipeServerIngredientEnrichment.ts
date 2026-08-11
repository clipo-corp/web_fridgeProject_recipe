import { fetchRawWithGuestAuth } from "./recipeGuestAuth";
import {
  ingredientMasterLookupFromResponse,
  recipeNameLanguageCandidates,
  type ServerMasterFoodBatchResponse,
} from "./recipeIngredientLocalization";
import type {
  PublicRecipeRecord,
  RecipeIngredient,
  RecipeStepIngredientChip,
} from "./recipeCatalogTypes";

export async function enrichRecipeIngredientNames(
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
      displayLang,
      recipeNameLanguageCandidates(recipe, displayLang),
    );
    const ingredients = recipe.ingredients.map((ingredient) => enrichIngredient(ingredient, lookup));

    return {
      ...recipe,
      ingredients,
      steps: recipe.steps.map((step) => ({
        ...step,
        ingredientChips: step.ingredientChips.map((ingredient) => enrichIngredient(ingredient, lookup)),
      })),
    };
  } catch {
    return recipe;
  }
}

async function fetchIngredientMasterLookup(
  masterIds: readonly number[],
  displayLang: string,
  languageCandidates: readonly string[],
): Promise<ReadonlyMap<number, string>> {
  const response = await fetchRawWithGuestAuth<ServerMasterFoodBatchResponse>(
    `/api/master/searchIdBatch?displayLang=${encodeURIComponent(displayLang)}`,
    {
      method: "POST",
      body: JSON.stringify(masterIds),
    },
    false,
  );
  return ingredientMasterLookupFromResponse(response, languageCandidates);
}

function enrichIngredient<T extends RecipeIngredient | RecipeStepIngredientChip>(
  ingredient: T,
  lookup: ReadonlyMap<number, string>,
): T {
  if (ingredient.masterId !== null) {
    const lookupName = lookup.get(ingredient.masterId);
    if (lookupName !== undefined && lookupName.length > 0) {
      return { ...ingredient, name: lookupName, isMasterName: true };
    }
  }

  return { ...ingredient, name: ingredientName(ingredient) };
}

function ingredientName(ingredient: RecipeIngredient | RecipeStepIngredientChip): string {
  if (ingredient.name.length > 0) {
    return ingredient.name;
  }

  if (ingredient.description.length > 0) {
    return ingredient.description;
  }

  return "Ingredient";
}

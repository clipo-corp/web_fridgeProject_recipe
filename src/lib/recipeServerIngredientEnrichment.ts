import { fetchRawWithGuestAuth } from "./recipeGuestAuth";
import {
  ingredientMasterLookupFromResponse,
  recipeNameLanguageCandidates,
  type ServerMasterFoodBatchResponse,
} from "./recipeIngredientLocalization";
import type { PublicRecipeRecord, RecipeIngredient } from "./recipeCatalogTypes";

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

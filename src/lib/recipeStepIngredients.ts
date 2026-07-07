import type {
  RecipeIngredient,
  RecipeStepIngredientChip,
} from "./recipeCatalogTypes";

export function normalizeStepIngredientMasterIds(
  value: readonly (number | string)[] | null | undefined,
): readonly number[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const seen = new Set<number>();
  const ids: number[] = [];

  for (const item of value) {
    const masterId = numberValue(item);
    if (masterId === null || seen.has(masterId)) {
      continue;
    }

    seen.add(masterId);
    ids.push(masterId);
  }

  return ids.length === 0 ? null : ids;
}

export function recipeStepIngredientChips(
  ingredients: readonly RecipeIngredient[],
  ingredientMasterIds: readonly number[] | null,
): readonly RecipeStepIngredientChip[] {
  if (ingredientMasterIds === null) {
    return [];
  }

  const ingredientsByMasterId = new Map<number, RecipeIngredient>();
  for (const ingredient of ingredients) {
    if (ingredient.masterId !== null) {
      ingredientsByMasterId.set(ingredient.masterId, ingredient);
    }
  }

  return ingredientMasterIds.flatMap((masterId) => {
    const ingredient = ingredientsByMasterId.get(masterId);
    return ingredient === undefined
      ? []
      : [{
          masterId: ingredient.masterId,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          description: ingredient.description,
        }];
  });
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

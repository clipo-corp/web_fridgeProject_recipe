import type { PublicRecipeCatalogFilters, PublicRecipeRecord } from "./recipeCatalogTypes";

export type SearchSuggestion = {
  readonly id: string;
  readonly label: string;
  readonly note: string;
  readonly patch: Partial<PublicRecipeCatalogFilters>;
};

export function buildRecipeSearchSuggestions(
  recipes: readonly PublicRecipeRecord[],
  labelFor: (value: string) => string,
  countryLabel: (value: string) => string,
): readonly SearchSuggestion[] {
  const primaryIngredients = Array.from(new Set(recipes.map((recipe) => recipe.primaryIngredient)));
  const countries = Array.from(new Map(recipes.map((recipe) => [recipe.countryCode, recipe])).values());
  const ingredientSuggestions = primaryIngredients.slice(0, 3).map((ingredient) => ({
    id: `ingredient-${ingredient}`,
    label: labelFor(ingredient),
    note: "주재료",
    patch: { query: labelFor(ingredient), primaryIngredient: ingredient },
  }));
  const countrySuggestions = countries.slice(0, 2).map((recipe) => ({
    id: `country-${recipe.countryCode}`,
    label: `${countryLabel(recipe.country)} 레시피`,
    note: "지역",
    patch: {
      query: "",
      region: { scope: "country", countryCode: recipe.countryCode, country: recipe.country },
    },
  }));
  const recipeSuggestions = recipes.slice(0, 2).map((recipe) => ({
    id: `recipe-${recipe.recipeId}`,
    label: recipe.title,
    note: countryLabel(recipe.country),
    patch: { query: recipe.title },
  }));

  return [...ingredientSuggestions, ...countrySuggestions, ...recipeSuggestions];
}

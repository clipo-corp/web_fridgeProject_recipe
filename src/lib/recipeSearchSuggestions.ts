import type { PublicRecipeCatalogFilters, PublicRecipeRecord } from "./recipeCatalogTypes";

export type SearchSuggestion = {
  readonly id: string;
  readonly label: string;
  readonly note: string;
  readonly patch: Partial<PublicRecipeCatalogFilters>;
};

export const fallbackRecipeSearchSuggestions: readonly SearchSuggestion[] = [
  { id: "fallback-kimchi", label: "김치", note: "검색어", patch: { query: "김치" } },
  { id: "fallback-tofu", label: "두부", note: "검색어", patch: { query: "두부" } },
  { id: "fallback-chicken", label: "닭고기", note: "검색어", patch: { query: "닭고기" } },
] as const;

export function buildRecipeSearchSuggestions(
  recipes: readonly PublicRecipeRecord[],
  labelFor: (value: string) => string,
  countryLabel: (value: string) => string,
  query = "",
): readonly SearchSuggestion[] {
  const primaryIngredients = Array.from(new Set(recipes.map((recipe) => recipe.primaryIngredient)));
  const countries = Array.from(new Map(recipes.map((recipe) => [recipe.countryCode, recipe])).values());
  const ingredientSuggestions = primaryIngredients.slice(0, 3).map((ingredient) =>
    suggestionCandidate(
      {
        id: `ingredient-${ingredient}`,
        label: labelFor(ingredient),
        note: "주재료",
        patch: { query: labelFor(ingredient), primaryIngredient: ingredient },
      },
      [ingredient, labelFor(ingredient), "주재료"],
    ),
  );
  const countrySuggestions = countries.slice(0, 2).map((recipe) =>
    suggestionCandidate(
      {
        id: `country-${recipe.countryCode}`,
        label: `${countryLabel(recipe.country)} 레시피`,
        note: "지역",
        patch: {
          query: "",
          region: { scope: "country", countryCode: recipe.countryCode, country: recipe.country },
        },
      },
      [recipe.countryCode, recipe.country, countryLabel(recipe.country), "지역"],
    ),
  );
  const recipeSuggestions = recipes.slice(0, 2).map((recipe) =>
    suggestionCandidate(
      {
        id: `recipe-${recipe.recipeId}`,
        label: recipe.title,
        note: countryLabel(recipe.country),
        patch: { query: recipe.title },
      },
      [recipe.title, recipe.description, recipe.country, countryLabel(recipe.country)],
    ),
  );

  const candidates = [...ingredientSuggestions, ...countrySuggestions, ...recipeSuggestions];
  const normalizedQuery = normalizeSearchText(query);

  if (normalizedQuery.length === 0) {
    return candidates.map((candidate) => candidate.suggestion);
  }

  return candidates
    .filter((candidate) => candidate.terms.some((term) => term.includes(normalizedQuery)))
    .map((candidate) => candidate.suggestion);
}

export function filterRecipeSearchSuggestions(
  suggestions: readonly SearchSuggestion[],
  query: string,
): readonly SearchSuggestion[] {
  const normalizedQuery = normalizeSearchText(query);

  if (normalizedQuery.length === 0) {
    return suggestions;
  }

  return suggestions.filter((suggestion) =>
    [suggestion.label, suggestion.note, suggestion.patch.query ?? ""]
      .map(normalizeSearchText)
      .some((term) => term.includes(normalizedQuery)),
  );
}

type SuggestionCandidate = {
  readonly suggestion: SearchSuggestion;
  readonly terms: readonly string[];
};

function suggestionCandidate(
  suggestion: SearchSuggestion,
  rawTerms: readonly string[],
): SuggestionCandidate {
  return {
    suggestion,
    terms: rawTerms.map(normalizeSearchText).filter((term) => term.length > 0),
  };
}

function normalizeSearchText(value: string): string {
  return value.replace(/\s+/g, "").toLocaleLowerCase();
}

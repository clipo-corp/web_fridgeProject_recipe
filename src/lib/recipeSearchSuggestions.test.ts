import { describe, expect, it } from "vitest";
import {
  buildRecipeSearchSuggestions,
  fallbackRecipeSearchSuggestions,
  filterRecipeSearchSuggestions,
  type SearchSuggestion,
} from "./recipeSearchSuggestions";
import type { PublicRecipeRecord } from "./recipeCatalogTypes";

const baseRecipe: PublicRecipeRecord = {
  recipeId: "base",
  title: "Base recipe",
  titleImageUrl: null,
  description: "",
  cookingTip: "",
  writtenLang: "ko",
  requestedDisplayLang: "ko-KR",
  displayLang: "ko-KR",
  availableLangs: ["ko-KR"],
  isOriginal: true,
  isTranslated: false,
  translationStatus: "original",
  source: "user",
  visibility: "public",
  isUseLocalData: true,
  likeCount: 0,
  viewCount: 0,
  createdAt: "2026-06-01T00:00:00.000Z",
  countryCode: "KR",
  country: "Korea",
  city: "Seoul",
  district: "Mapo",
  cityKey: "KR-Seoul",
  districtKey: "KR-Seoul-Mapo",
  recipeType: "everyday",
  cookingMethod: "boil",
  technique: "one-pan",
  dietaryGoal: "standard",
  dietaryRestriction: "none",
  primaryIngredient: "pork",
  category: "soup-stew",
  occasion: "everyday",
  difficulty: "easy",
  cookingTime: "30min",
  cuisineRegion: "korean",
  servings: "2",
  requiredTool: "pot",
  ingredients: [],
  steps: [],
};

function recipe(patch: Partial<PublicRecipeRecord>): PublicRecipeRecord {
  return { ...baseRecipe, ...patch };
}

function build(query: string): readonly SearchSuggestion[] {
  return buildRecipeSearchSuggestions(
    [
      recipe({
        recipeId: "kimchi",
        title: "서울 김치찌개",
        primaryIngredient: "pork",
      }),
      recipe({
        recipeId: "tofu",
        title: "두부 샐러드",
        countryCode: "JP",
        country: "Japan",
        primaryIngredient: "tofu",
      }),
    ],
    (value) => ({ pork: "돼지고기", tofu: "두부" })[value] ?? value,
    (value) => ({ Korea: "한국", Japan: "일본" })[value] ?? value,
    query,
  );
}

describe("buildRecipeSearchSuggestions", () => {
  it("narrows suggestions while the user types each character", () => {
    const suggestions = build("김");

    expect(suggestions.map((suggestion) => suggestion.label)).toEqual(["서울 김치찌개"]);
  });

  it("matches localized ingredient labels while typing", () => {
    const suggestions = build("두");

    expect(suggestions[0]?.label).toBe("두부");
    expect(suggestions[0]?.patch).toMatchObject({ primaryIngredient: "tofu" });
  });

  it("keeps default quick picks when the query is blank", () => {
    const suggestions = build("");

    expect(suggestions).toHaveLength(6);
  });

  it("filters fallback suggestions when recipe data is unavailable", () => {
    const suggestions = filterRecipeSearchSuggestions(fallbackRecipeSearchSuggestions, "김");

    expect(suggestions.map((suggestion) => suggestion.label)).toEqual(["김치"]);
  });
});

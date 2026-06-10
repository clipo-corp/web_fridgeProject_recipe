import { describe, expect, it } from "vitest";
import { recipeHomeEmoji, recipeListEmoji } from "./recipeThumbnail";
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
  primaryIngredient: "vegetable",
  category: "side-dish",
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

describe("recipeListEmoji", () => {
  it("uses cuisine fallback for Korean side dishes when category has no direct emoji", () => {
    const emoji = recipeListEmoji(recipe({ category: "side-dish", cuisineRegion: "korean" }));

    expect(emoji).toBe("🍳");
  });

  it("prioritizes rice and porridge category over cuisine", () => {
    const emoji = recipeListEmoji(recipe({ category: "rice-porridge", cuisineRegion: "italian" }));

    expect(emoji).toBe("🍚");
  });
});

describe("recipeHomeEmoji", () => {
  it("uses title keywords before category and ingredient maps", () => {
    const emoji = recipeHomeEmoji(recipe({ title: "김치 크림 파스타", category: "dessert" }));

    expect(emoji).toBe("🥬");
  });

  it("falls back to the primary ingredient map for home cards", () => {
    const emoji = recipeHomeEmoji(recipe({
      title: "가벼운 저녁",
      category: "main-dish",
      primaryIngredient: "seafood",
      cuisineRegion: "global",
    }));

    expect(emoji).toBe("🐟");
  });
});

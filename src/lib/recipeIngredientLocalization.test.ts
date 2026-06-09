import { describe, expect, it } from "vitest";
import {
  ingredientMasterLookupFromResponse,
  recipeNameLanguageCandidates,
  type ServerMasterFoodBatchResponse,
} from "./recipeIngredientLocalization";
import type { PublicRecipeRecord } from "./recipeCatalogTypes";

const recipe: PublicRecipeRecord = {
  recipeId: "579",
  title: "새콤달콤 다시마채 무침",
  titleImageUrl: null,
  description: "다시마채 무침",
  cookingTip: "",
  writtenLang: "ko",
  requestedDisplayLang: "ko-KR",
  displayLang: "zh-CN",
  availableLangs: ["zh-CN", "en-US", "fr-FR"],
  isOriginal: true,
  isTranslated: false,
  translationStatus: "unavailable",
  source: "user",
  visibility: "public",
  isUseLocalData: true,
  likeCount: 0,
  viewCount: 0,
  createdAt: "2026-06-05T16:53:19.665541",
  countryCode: "FR",
  country: "France",
  city: "Paris",
  district: "11th arrondi",
  cityKey: "paris",
  districtKey: "11e-arrondissement",
  recipeType: "everyday",
  cookingMethod: "blanch",
  technique: "one-pan",
  dietaryGoal: "standard",
  dietaryRestriction: "none",
  primaryIngredient: "seafood",
  category: "side-dish",
  occasion: "snack",
  difficulty: "easy",
  cookingTime: "30min",
  cuisineRegion: "chinese",
  servings: "2",
  requiredTool: "no-tool",
  ingredients: [],
  steps: [],
};

const seaweedMaster = {
  id: 2789,
  label: "seafood",
  master_name: "Seaweed",
  names: {
    en: "Seaweed",
    fr: "Algues",
    ko: "다시마채",
    zh: "海藻",
  },
} as const;

describe("recipeIngredientLocalization", () => {
  it("uses localizedName without requiring the legacy language map", () => {
    const lookup = ingredientMasterLookupFromResponse(
      [
        {
          id: 2789,
          label: "seafood",
          master_name: "Seaweed",
          localizedName: "다시마채",
          displayLang: "ko-KR",
          typeIngredients: "countable",
        },
      ],
      ["ko-KR"],
    );

    expect(lookup.get(2789)).toBe("다시마채");
  });

  it("uses requested display language before original recipe language for master names", () => {
    const languageCandidates = recipeNameLanguageCandidates(recipe, "ko-KR");

    const lookup = ingredientMasterLookupFromResponse([[seaweedMaster]], languageCandidates);

    expect(lookup.get(2789)).toBe("다시마채");
  });

  it("flattens nested searchIdBatch results from the server", () => {
    const response: ServerMasterFoodBatchResponse = {
      data: [[seaweedMaster]],
    };

    const lookup = ingredientMasterLookupFromResponse(response, ["en-US"]);

    expect(lookup.get(2789)).toBe("Seaweed");
  });

  it("falls back to legacy resolvedExamples when localizedName is absent", () => {
    const lookup = ingredientMasterLookupFromResponse(
      [
        {
          id: 2789,
          master_name: "Seaweed",
          resolvedExamples: {
            "ko-KR": "다시마채",
            "en-US": "Seaweed",
          },
        },
      ],
      ["ko-KR"],
    );

    expect(lookup.get(2789)).toBe("다시마채");
  });
});

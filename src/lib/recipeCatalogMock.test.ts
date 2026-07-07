import { describe, expect, it } from "vitest";
import {
  collectCatalogOptions,
  filterPublicRecipes,
  initialCatalogFilters,
  loadPublicMockRecipes,
  toPublicRecipeSearchRequest,
} from "./recipeCatalogMock";
import type { PublicRecipeRecord } from "./recipeCatalogTypes";

const records: readonly PublicRecipeRecord[] = [
  {
    recipeId: "r1",
    title: "서울 김치찌개",
    titleImageUrl: null,
    description: "잘 익은 김치로 만드는 찌개",
    cookingTip: "중불에서 천천히 끓입니다.",
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
    likeCount: 20,
    viewCount: 500,
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
    difficulty: "beginner",
    cookingTime: "30min",
    cuisineRegion: "korean",
    servings: "2-3",
    requiredTool: "pot",
    ingredients: [{ masterId: null, name: "김치", quantity: 200, unit: "g", description: "묵은지" }],
    steps: [{
      stepNumber: 1,
      way: "김치를 볶고 끓입니다.",
      cookingTip: null,
      imageUrl: null,
      ingredientMasterIds: null,
      ingredientChips: [],
    }],
  },
  {
    recipeId: "r2",
    title: "Tokyo Salad",
    titleImageUrl: null,
    description: "fresh vegetable salad",
    cookingTip: "",
    writtenLang: "en",
    requestedDisplayLang: "ko-KR",
    displayLang: "ko-KR",
    availableLangs: ["en-US", "ko-KR"],
    isOriginal: false,
    isTranslated: true,
    translationStatus: "translated",
    source: "user",
    visibility: "public",
    isUseLocalData: false,
    likeCount: 100,
    viewCount: 50,
    createdAt: "2026-05-01T00:00:00.000Z",
    countryCode: "JP",
    country: "Japan",
    city: "Tokyo",
    district: "Shibuya",
    cityKey: "JP-Tokyo",
    districtKey: "JP-Tokyo-Shibuya",
    recipeType: "quick",
    cookingMethod: "raw",
    technique: "mix",
    dietaryGoal: "light",
    dietaryRestriction: "vegan",
    primaryIngredient: "vegetable",
    category: "salad",
    occasion: "brunch",
    difficulty: "easy",
    cookingTime: "10min",
    cuisineRegion: "japanese",
    servings: "1",
    requiredTool: "bowl",
    ingredients: [{ masterId: null, name: "lettuce", quantity: null, unit: null, description: "greens" }],
    steps: [{
      stepNumber: 1,
      way: "Mix vegetables.",
      cookingTip: null,
      imageUrl: null,
      ingredientMasterIds: null,
      ingredientChips: [],
    }],
  },
];

describe("toPublicRecipeSearchRequest", () => {
  it("maps all public catalog filters to the native public search payload", () => {
    const request = toPublicRecipeSearchRequest(
      {
        ...initialCatalogFilters,
        query: "김치",
        sort: "hot_month",
        writtenLang: "ko",
        region: {
          scope: "district",
          countryCode: "KR",
          country: "Korea",
          city: "Seoul",
          cityKey: "KR-Seoul",
          district: "Mapo",
          districtKey: "KR-Seoul-Mapo",
        },
        isUseLocalData: "local",
        recipeType: "everyday",
        cookingMethod: "boil",
        technique: "one-pan",
        dietaryGoal: "standard",
        dietaryRestriction: "none",
        primaryIngredient: "pork",
        category: "soup-stew",
        occasion: "everyday",
        difficulty: "beginner",
        cookingTime: "30min",
        cuisineRegion: "korean",
        servings: "2-3",
        requiredTool: "pot",
      },
      2,
      "ko-KR",
    );

    expect(request).toMatchObject({
      searchValue: "김치",
      pageNumber: 2,
      displayLang: "ko-KR",
      sort: "hot_month",
      writtenLang: "ko-KR",
      recipeVisibility: "public",
      regionScope: "district",
      countryCode: "KR",
      country: "Korea",
      city: "Seoul",
      district: "Mapo",
      cityKey: "KR-Seoul",
      districtKey: "KR-Seoul-Mapo",
      isUseLocalData: true,
      recipeType: "everyday",
      cookingMethod: "boil",
      technique: "one-pan",
      dietaryGoal: "standard",
      dietaryRestriction: "none",
      primaryIngredient: "pork",
      category: "soup-stew",
      occasion: "everyday",
      difficulty: "beginner",
      cookingTime: "30min",
      cuisineRegion: "korean",
      servings: "2-3",
      requiredTool: "pot",
    });
  });

  it("keeps default all filters as null while preserving public visibility", () => {
    const request = toPublicRecipeSearchRequest(initialCatalogFilters, 1, "ko-KR");

    expect(request.searchValue).toBeNull();
    expect(request.writtenLang).toBeNull();
    expect(request.regionScope).toBeNull();
    expect(request.recipeVisibility).toBe("public");
    expect(request.isUseLocalData).toBeNull();
    expect(request.recipeType).toBeNull();
    expect(request.requiredTool).toBeNull();
  });

  it("maps localized primary ingredient search text to the native ingredient filter", () => {
    const request = toPublicRecipeSearchRequest(
      { ...initialCatalogFilters, query: "닭고기" },
      0,
      "ko-KR",
    );

    expect(request.searchValue).toBeNull();
    expect(request.primaryIngredient).toBe("chicken");
  });
});

describe("filterPublicRecipes", () => {
  it("filters by language, local-data mode, district, native filters, and query", () => {
    const result = filterPublicRecipes(records, {
      ...initialCatalogFilters,
      query: "김치",
      writtenLang: "ko",
      region: {
        scope: "district",
        countryCode: "KR",
        country: "Korea",
        city: "Seoul",
        cityKey: "KR-Seoul",
        district: "Mapo",
        districtKey: "KR-Seoul-Mapo",
      },
      isUseLocalData: "local",
      cookingMethod: "boil",
      requiredTool: "pot",
    });

    expect(result.map((recipe) => recipe.recipeId)).toEqual(["r1"]);
  });

  it("sorts recipes by native latest, popular, and hot_month semantics", () => {
    expect(
      filterPublicRecipes(records, { ...initialCatalogFilters, sort: "latest" }).map(
        (recipe) => recipe.recipeId,
      ),
    ).toEqual(["r1", "r2"]);
    expect(
      filterPublicRecipes(records, { ...initialCatalogFilters, sort: "popular" }).map(
        (recipe) => recipe.recipeId,
      ),
    ).toEqual(["r2", "r1"]);
    expect(
      filterPublicRecipes(records, { ...initialCatalogFilters, sort: "hot_month" }).map(
        (recipe) => recipe.recipeId,
      ),
    ).toEqual(["r1", "r2"]);
  });
});

describe("loadPublicMockRecipes", () => {
  it("adapts the bundled 100 seed recipes to native-parity public records", async () => {
    const result = await loadPublicMockRecipes();
    const options = collectCatalogOptions(result);

    expect(result).toHaveLength(100);
    expect(result[0]?.recipeId).toMatch(/^seed_/);
    expect(result[0]?.visibility).toBe("public");
    expect(options.cookingMethod).toContain("boil");
    expect(options.region.countries.length).toBeGreaterThan(0);
  });

  it("preserves YouTube creator source metadata from seed imports", async () => {
    const result = await loadPublicMockRecipes();
    const youtubeRecipe = result.find(
      (recipe) => recipe.creatorSource?.sourceType === "youtube",
    );

    expect(youtubeRecipe?.creatorSource).toMatchObject({
      sourceType: "youtube",
      sourceUrl: expect.stringContaining("youtube.com"),
    });
  });
});

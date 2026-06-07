import { describe, expect, it } from "vitest";
import { filterRecipes, loadMockRecipes } from "./recipeMockData";
import type { Recipe } from "./recipeTypes";

const recipes: readonly Recipe[] = [
  {
    id: "one",
    title: "기본 두유 음료",
    imageUrl: null,
    description: "불린 대두를 갈아 만드는 아침 음료",
    cookingTip: "충분히 끓입니다.",
    category: "dessert",
    cuisineRegion: "chinese",
    country: "China",
    cookingTime: "1h+",
    difficulty: "beginner",
    recipeType: "drink",
    primaryIngredient: "bean-nut",
    sourceName: "curated",
    views: 100,
    likes: 10,
    ingredients: [{ name: "대두", quantity: 200, unit: "g", description: "불린 콩" }],
    steps: [{ stepNumber: 1, way: "콩을 불립니다.", cookingTip: null, imageUrl: null }],
  },
  {
    id: "two",
    title: "빠른 샐러드",
    imageUrl: null,
    description: "채소로 바로 만드는 한 끼",
    cookingTip: "",
    category: "salad",
    cuisineRegion: "global",
    country: "Global",
    cookingTime: "10min",
    difficulty: "easy",
    recipeType: "quick",
    primaryIngredient: "vegetable",
    sourceName: "curated",
    views: 200,
    likes: 50,
    ingredients: [{ name: "상추", quantity: null, unit: null, description: "잎채소" }],
    steps: [{ stepNumber: 1, way: "채소를 버무립니다.", cookingTip: null, imageUrl: null }],
  },
];

describe("filterRecipes", () => {
  it("loads the bundled seed recipes", async () => {
    const result = await loadMockRecipes();

    expect(result).toHaveLength(100);
  });

  it("returns recipes when the query matches an ingredient", () => {
    const result = filterRecipes(recipes, { query: "대두", category: "all", country: "all" });

    expect(result).toHaveLength(1);
  });

  it("filters recipes by category and country", () => {
    const result = filterRecipes(recipes, { query: "", category: "dessert", country: "China" });

    expect(result[0]?.title).toBe("기본 두유 음료");
  });

  it("filters recipes by detailed options", () => {
    const result = filterRecipes(recipes, {
      query: "",
      category: "all",
      country: "all",
      time: "10min",
      ingredient: "vegetable",
      recipeType: "quick",
    });

    expect(result[0]?.title).toBe("빠른 샐러드");
  });

  it("sorts recipes by popularity", () => {
    const result = filterRecipes(recipes, {
      query: "",
      category: "all",
      country: "all",
      sort: "popular",
    });

    expect(result[0]?.id).toBe("two");
  });
});

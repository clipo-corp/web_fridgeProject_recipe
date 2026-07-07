import { describe, expect, it } from "vitest";
import {
  normalizeStepIngredientMasterIds,
  recipeStepIngredientChips,
} from "./recipeStepIngredients";
import type { RecipeIngredient } from "./recipeCatalogTypes";

const ingredients: readonly RecipeIngredient[] = [
  {
    masterId: 3508,
    name: "White Rice",
    quantity: 200,
    unit: "g",
    description: "Dummy ingredient White Rice",
  },
  {
    masterId: 7509,
    name: "Cabbage Kimchi",
    quantity: 100,
    unit: "g",
    description: "Dummy ingredient Cabbage Kimchi",
  },
];

describe("normalizeStepIngredientMasterIds", () => {
  it("keeps parseable ids once in first-seen order", () => {
    expect(normalizeStepIngredientMasterIds([3508, "7509", "bad", 3508, "7509"])).toEqual([
      3508,
      7509,
    ]);
  });

  it("returns null when the server does not provide step ingredient ids", () => {
    expect(normalizeStepIngredientMasterIds(null)).toBeNull();
    expect(normalizeStepIngredientMasterIds(undefined)).toBeNull();
    expect(normalizeStepIngredientMasterIds([])).toBeNull();
  });
});

describe("recipeStepIngredientChips", () => {
  it("joins step ids to recipe ingredients and ignores missing ids", () => {
    expect(recipeStepIngredientChips(ingredients, [7509, 9999, 3508])).toEqual([
      {
        masterId: 7509,
        name: "Cabbage Kimchi",
        quantity: 100,
        unit: "g",
        description: "Dummy ingredient Cabbage Kimchi",
      },
      {
        masterId: 3508,
        name: "White Rice",
        quantity: 200,
        unit: "g",
        description: "Dummy ingredient White Rice",
      },
    ]);
  });

  it("keeps legacy steps without chips when ids are absent", () => {
    expect(recipeStepIngredientChips(ingredients, null)).toEqual([]);
  });
});
